import React, { useEffect, useRef, useState } from 'react';
import { scaleLinear, line, curveBasis, interpolateNumber } from 'd3';
import { ActivityIcon, GaugeIcon } from './icons';
import { conjunctionThroughputMeter, RuntimeSecurityGuard } from '../services/runtimeSecurityGuard';

interface ConjunctionThroughputMeterProps {
    shards: number;
    activityDensity: number;
    isSystemFractured?: boolean;
    isSyncing?: boolean;
}

export const ConjunctionThroughputMeter: React.FC<ConjunctionThroughputMeterProps> = ({
    shards,
    activityDensity,
    isSystemFractured = false,
    isSyncing = false,
}) => {
    // Current target and smoothed state references
    const [displayThroughput, setDisplayThroughput] = useState(250.0);
    const [isHalted, setIsHalted] = useState(false);
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Keep track of raw readings in a history queue
    const historyRef = useRef<number[]>(Array(40).fill(250));
    const targetRef = useRef<number>(250);
    const smoothedValRef = useRef<number>(250);

    // Subscribe to Runtime Security Guard integrity halt status
    useEffect(() => {
        const unsubscribe = RuntimeSecurityGuard.subscribe(status => {
            setIsHalted(status.isHalted);
        });
        return () => unsubscribe();
    }, []);

    // Calculate baseline flow via proxy-guarded conjunctionThroughputMeter
    useEffect(() => {
        const baseCalculated = conjunctionThroughputMeter.calculateThroughput(shards, activityDensity);
        const jitter = Math.sin(Date.now() * 0.001) * 15;
        targetRef.current = Math.max(80, baseCalculated + jitter);
    }, [shards, activityDensity]);

    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();

        const tick = (time: number) => {
            const dt = time - lastTime;
            lastTime = time;

            // Use a D3 number interpolator context to compute the next step
            // Smoothly move towards the target using an exponential decay filter
            const alpha = 1 - Math.exp(-0.006 * dt); // frame-rate independent easing multiplier
            const interpolator = interpolateNumber(smoothedValRef.current, targetRef.current);
            smoothedValRef.current = interpolator(alpha);

            // Periodically shift the historical buffer to draw the sparkline
            // Add a small randomized micro-pulse for high fidelity
            const reading = smoothedValRef.current + (Math.sin(time * 0.01) * 3);
            setDisplayThroughput(reading);

            // Update history queue for the sparkline path
            const history = historyRef.current;
            history.push(reading);
            if (history.length > 40) {
                history.shift();
            }

            // Draw sparkline via D3 attributes
            if (svgRef.current) {
                const width = 110;
                const height = 34;

                const minVal = Math.min(...history) - 10;
                const maxVal = Math.max(...history) + 10;

                const xScale = scaleLinear()
                    .domain([0, history.length - 1])
                    .range([0, width]);

                const yScale = scaleLinear()
                    .domain([minVal, maxVal])
                    .range([height - 2, 2]);

                const pathGenerator = line<number>()
                    .x((_, idx) => xScale(idx))
                    .y(d => yScale(d))
                    .curve(curveBasis); // CurveBasis uses D3 B-splines for maximum smoothing

                const pathEl = svgRef.current.querySelector('.throughput-path');
                if (pathEl) {
                    pathEl.setAttribute('d', pathGenerator(history) || '');
                }

                // Update gradient element color or pulse depending on system fracturing
                const glowEl = svgRef.current.querySelector('.throughput-glow');
                if (glowEl) {
                    glowEl.setAttribute('d', pathGenerator(history) || '');
                }
            }

            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const isFault = isSystemFractured || isHalted;

    return (
        <div 
            id="aetheros-throughput-header-widget"
            className={`flex items-center gap-3.5 bg-black/90 p-2.5 px-3.5 rounded-xl border ${isHalted ? 'border-red-600/80 bg-red-950/20 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'border-zinc-900 shadow-[inset_0_0_12px_rgba(0,0,0,1)]'} select-none`}
        >
            <div className="flex flex-col items-start font-mono text-left">
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                    <ActivityIcon className={`w-2.5 h-2.5 inline-block ${isFault ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
                    {isHalted ? 'INTEGRITY HALT ACTIVE' : 'Conjunction Throughput'}
                </span>
                
                <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-base font-black tracking-normal tabular-nums leading-none ${isFault ? 'text-rose-400' : 'text-white'}`}>
                        {isHalted ? '0.0' : displayThroughput.toFixed(1)}
                    </span>
                    <span className="text-[8px] font-black opacity-40 uppercase">Tps</span>
                </div>
            </div>

            {/* Live smoothed sparkline using D3 */}
            <div className="w-[110px] h-[34px] relative shrink-0">
                <svg ref={svgRef} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isFault ? "#f43f5e" : "#fbbf24"} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={isFault ? "#f43f5e" : "#fbbf24"} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    {/* Shadow / Glow path */}
                    <path 
                        className="throughput-glow stroke-none fill-none transition-colors duration-200" 
                        stroke={isFault ? "rgba(244,63,94,0.35)" : "rgba(251,191,36,0.25)"}
                        strokeWidth="3.5"
                    />

                    {/* Highly smoothed central sparkline line */}
                    <path 
                        className="throughput-path stroke-none fill-none transition-colors duration-200" 
                        stroke={isFault ? "#f43f5e" : "#22c55e"}
                        strokeWidth="1.75"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* Static Conjunction State indicator */}
            <div className="flex flex-col items-end text-right font-mono border-l-2 border-zinc-900 pl-3 shrink-0 min-w-[64px]">
                {isHalted ? (
                    <>
                        <span className="text-[7px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                            HALTED
                        </span>
                        <span className="text-[9px] font-bold text-red-400 tracking-wide mt-0.5">
                            BREACH
                        </span>
                    </>
                ) : isSyncing ? (
                    <>
                        <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                            SYNCING
                        </span>
                        <span className="text-[9px] font-bold text-amber-400/90 tracking-wide mt-0.5 animate-pulse">
                            SAVING...
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Bus Stride</span>
                        <span className={`text-[10px] font-bold ${isFault ? 'text-rose-400/90' : 'text-emerald-400/90'} tracking-wide mt-0.5`}>
                            {conjunctionThroughputMeter.getBusStride()}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};
