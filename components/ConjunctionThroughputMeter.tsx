import React, { useEffect, useRef, useState } from 'react';
import { scaleLinear, line, curveBasis, interpolateNumber } from 'd3';
import { ActivityIcon, GaugeIcon } from './icons';

interface ConjunctionThroughputMeterProps {
    shards: number;
    activityDensity: number;
    isSystemFractured?: boolean;
}

export const ConjunctionThroughputMeter: React.FC<ConjunctionThroughputMeterProps> = ({
    shards,
    activityDensity,
    isSystemFractured = false,
}) => {
    // Current target and smoothed state references
    const [displayThroughput, setDisplayThroughput] = useState(250.0);
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Keep track of raw readings in a history queue
    const historyRef = useRef<number[]>(Array(40).fill(250));
    const targetRef = useRef<number>(250);
    const smoothedValRef = useRef<number>(250);

    // Calculate baseline flow from system parameters
    useEffect(() => {
        // Base rate ranges from 180 to 320, influenced by the current shard capacity
        const baseRate = 220 + (shards % 150);
        // Activity density represents high frequency operator conduction impulses
        const boost = activityDensity * 12.5;
        // Jitter introduces small natural system cycles
        const jitter = Math.sin(Date.now() * 0.001) * 15;
        
        targetRef.current = Math.max(80, baseRate + boost + jitter);
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

    const stateColorClass = isSystemFractured 
        ? "text-rose-500 border-rose-950/60 shadow-rose-950/50" 
        : "text-amber-400 border-zinc-900 shadow-amber-950/20";

    return (
        <div 
            id="aetheros-throughput-header-widget"
            className={`flex items-center gap-3.5 bg-black/90 p-2.5 px-3.5 rounded-xl border border-zinc-900 shadow-[inset_0_0_12px_rgba(0,0,0,1)] select-none`}
        >
            <div className="flex flex-col items-start font-mono text-left">
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                    <ActivityIcon className={`w-2.5 h-2.5 inline-block ${isSystemFractured ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
                    Conjunction Throughput
                </span>
                
                <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-base font-black tracking-normal tabular-nums leading-none ${isSystemFractured ? 'text-rose-400' : 'text-white'}`}>
                        {displayThroughput.toFixed(1)}
                    </span>
                    <span className="text-[8px] font-black opacity-40 uppercase">Tps</span>
                </div>
            </div>

            {/* Live smoothed sparkline using D3 */}
            <div className="w-[110px] h-[34px] relative shrink-0">
                <svg ref={svgRef} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isSystemFractured ? "#f43f5e" : "#fbbf24"} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={isSystemFractured ? "#f43f5e" : "#fbbf24"} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    {/* Shadow / Glow path */}
                    <path 
                        className="throughput-glow stroke-none fill-none transition-colors duration-200" 
                        stroke={isSystemFractured ? "rgba(244,63,94,0.35)" : "rgba(251,191,36,0.25)"}
                        strokeWidth="3.5"
                    />

                    {/* Highly smoothed central sparkline line */}
                    <path 
                        className="throughput-path stroke-none fill-none transition-colors duration-200" 
                        stroke={isSystemFractured ? "#f43f5e" : "#22c55e"}
                        strokeWidth="1.75"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* Static Conjunction State indicator */}
            <div className="flex flex-col items-end text-right font-mono border-l-2 border-zinc-900 pl-3 shrink-0">
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Bus Stride</span>
                <span className={`text-[10px] font-bold ${isSystemFractured ? 'text-rose-400/90' : 'text-emerald-400/90'} tracking-wide mt-0.5`}>
                    1.2 PB/s
                </span>
            </div>
        </div>
    );
};
