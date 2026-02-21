
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    ShieldIcon, ZapIcon, FireIcon, ActivityIcon, SpinnerIcon, 
    TerminalIcon, LogicIcon, StarIcon, WarningIcon, LockIcon,
    SearchIcon, CheckCircleIcon, CodeIcon
} from './icons';
import type { ShieldTelemetry, ThreatShard } from '../types';

/**
 * SHIELD_MESH_SHADER: Renders a pulsing hexagonal grid representing the Sovereign Shield.
 */
const SHIELD_VS = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const SHIELD_FS = `
    precision mediump float;
    uniform float u_time;
    uniform float u_integrity;
    uniform vec2 u_resolution;

    float hex(vec2 p) {
        p.x *= 1.1547;
        float y = p.y + (floor(p.x) * 0.5);
        vec2 f = fract(vec2(p.x, y));
        if (f.x > 0.5) f.x = 1.0 - f.x;
        if (f.y > 0.5) f.y = 1.0 - f.y;
        return min(f.x, f.y);
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        uv *= 5.0; // Grid scale
        
        float h = hex(uv + u_time * 0.1);
        float pulse = sin(u_time * 2.0) * 0.1 + 0.9;
        
        // Shield ripple effect based on integrity
        float ripple = sin(length(uv) * 2.0 - u_time * 5.0) * 0.5 + 0.5;
        float mask = smoothstep(0.0, 0.05, h);
        
        vec3 color = mix(vec3(0.0, 0.3, 0.7), vec3(0.0, 0.8, 1.0), ripple);
        if (u_integrity < 50.0) {
            color = mix(color, vec3(0.9, 0.1, 0.0), (50.0 - u_integrity) / 50.0);
        }
        
        gl_FragColor = vec4(color * mask * pulse, mask * 0.6);
    }
`;

const ShieldVisualization: React.FC<{ integrity: number }> = ({ integrity }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) return;
        glRef.current = gl;

        const createShader = (type: number, source: string) => {
            const shader = gl.createShader(type)!;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const vs = createShader(gl.VERTEX_SHADER, SHIELD_VS);
        const fs = createShader(gl.FRAGMENT_SHADER, SHIELD_FS);
        const program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        programRef.current = program;

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

        let animationFrame: number;
        const render = (time: number) => {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.useProgram(program);

            const posLoc = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time * 0.001);
            gl.uniform1f(gl.getUniformLocation(program, 'u_integrity'), integrity);
            gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), gl.canvas.width, gl.canvas.height);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationFrame = requestAnimationFrame(render);
        };

        animationFrame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrame);
    }, [integrity]);

    return <canvas ref={canvasRef} className="w-full h-full rounded-3xl" width={600} height={400} />;
};

export const SovereignShieldView: React.FC = () => {
    const [shieldStrength, setShieldStrength] = useState(100);
    const [telemetry, setTelemetry] = useState<ShieldTelemetry>({
        integrity: 98.4,
        deflectionRate: 1240,
        dissonanceSuppression: 99.1,
        lastBreachAttempt: '192.168.1.15',
        signature: '0x03E2_ALPHA'
    });

    const [shards, setShards] = useState<ThreatShard[]>([
        { id: 'S-01', origin: 'External_Node_77', payloadSize: '42KB', threatLevel: 'HIGH', binaryPreview: 'PK...v1Czçg...Ýg...F...2b7fc9eda065', status: 'ISOLATED' },
        { id: 'S-02', origin: 'Semantic_Drift_Buffer', payloadSize: '2KB', threatLevel: 'LOW', binaryPreview: '0x00A1...FF32...0001', status: 'ISOLATED' }
    ]);

    const [isNeutralizing, setIsNeutralizing] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>(["[SHIELD] Sovereign Link Established.", "[OK] Entropy filters at 100%."]);

    const addLog = useCallback((msg: string, type: 'INFO' | 'WARN' | 'SUCCESS' = 'INFO') => {
        const color = type === 'SUCCESS' ? 'text-green-400' : type === 'WARN' ? 'text-red-500 font-bold' : 'text-cyan-500';
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] <span class="${color}">${msg}</span>`, ...prev].slice(0, 20));
    }, []);

    const handleNeutralize = (id: string) => {
        setIsNeutralizing(id);
        addLog(`Initiating forensic purge of shard ${id}...`, 'WARN');
        
        setTimeout(() => {
            setShards(prev => prev.map(s => s.id === id ? { ...s, status: 'PURGED', threatLevel: 'LOW' } : s));
            setIsNeutralizing(null);
            setTelemetry(prev => ({ ...prev, integrity: Math.min(100, prev.integrity + 0.5) }));
            setShieldStrength(prev => Math.min(100, prev + 5)); // Boost strength on success
            addLog(`Shard ${id} neutralized. Logic reconciled.`, 'SUCCESS');
        }, 2000);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry(prev => ({
                ...prev,
                deflectionRate: Math.max(1000, prev.deflectionRate + (Math.random() - 0.5) * 50)
            }));
            // Fluctuate shield strength slightly to show activity
            setShieldStrength(prev => Math.min(100, Math.max(85, prev + (Math.random() - 0.5) * 2)));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col bg-[#02040a] text-cyan-100 font-mono overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 opacity-5 pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="p-6 border-b-8 border-black bg-slate-900/90 backdrop-blur-md flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600/10 border-4 border-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                        <ShieldIcon className="w-10 h-10 text-blue-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">SOVEREIGN_SHIELD</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] bg-blue-950/40 text-blue-500 px-2 py-0.5 border border-blue-900/30 rounded font-black">PROTOCOL: 0x03E2_DEFENSE</span>
                            <span className="text-[10px] text-gray-500">SIGNATURE: {telemetry.signature}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Grid Integrity</p>
                        <p className={`text-xl font-comic-header ${telemetry.integrity > 90 ? 'text-green-500' : 'text-amber-500'}`}>{telemetry.integrity.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Deflection/sec</p>
                        <p className="text-xl font-comic-header text-cyan-400">{telemetry.deflectionRate.toFixed(0)}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-8 gap-8 relative z-20">
                
                {/* Left: Shield Visualization & Telemetry */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    <div className="flex-1 aero-panel bg-black/60 border-4 border-black relative overflow-hidden flex flex-col shadow-[20px_20px_100px_rgba(0,0,0,1)]">
                        <div className="absolute top-4 left-4 z-10 flex gap-4">
                            <div className="px-3 py-1 bg-black/80 border border-blue-500/30 rounded-full text-[8px] font-black text-blue-400 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                SCANNING_D4D_SPECTRUM
                            </div>
                        </div>

                        {/* Shield Strength HUD Overlay */}
                        <div className="absolute bottom-6 left-6 z-10 w-64">
                            <div className="bg-black/90 border-2 border-blue-500/50 p-4 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Shield Strength</p>
                                    <ActivityIcon className="w-3 h-3 text-blue-400 animate-pulse" />
                                </div>
                                <div className="flex items-end gap-3">
                                    <span className="text-5xl font-comic-header text-white leading-none wisdom-glow">{shieldStrength.toFixed(0)}%</span>
                                </div>
                                <div className="mt-3 h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-blue-900/30">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 shadow-[0_0_15px_cyan]" 
                                        style={{ width: `${shieldStrength}%` }} 
                                    />
                                </div>
                            </div>
                        </div>

                        <ShieldVisualization integrity={telemetry.integrity} />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: 'Dissonance Suppression', val: telemetry.dissonanceSuppression + '%', icon: StarIcon, color: 'text-violet-400' },
                            { label: 'Aetheric Pressure', val: '1.22 PB/S', icon: ActivityIcon, color: 'text-cyan-400' },
                            { label: 'Sentinel Status', val: 'ABSOLUTE', icon: LockIcon, color: 'text-amber-500' }
                        ].map(item => (
                            <div key={item.label} className="aero-panel bg-black/40 border-2 border-white/5 p-4 text-center group hover:border-blue-500/30 transition-all">
                                <item.icon className={`w-6 h-6 mx-auto mb-2 opacity-40 group-hover:opacity-100 transition-opacity ${item.color}`} />
                                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{item.label}</p>
                                <p className="text-sm font-bold text-white mt-1">{item.val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Threat Ledger & Terminal */}
                <div className="w-96 flex flex-col gap-6 flex-shrink-0 min-h-0 overflow-hidden">
                    <div className="flex-1 aero-panel bg-black border-4 border-black flex flex-col overflow-hidden shadow-[10px_10px_0_0_#000]">
                        <div className="p-4 border-b-2 border-white/5 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <WarningIcon className="w-5 h-5 text-red-500" />
                                <span className="text-[10px] font-black uppercase text-red-500">Threat Isolated Buffer</span>
                            </div>
                            <span className="text-[8px] font-mono text-gray-700">0x03E2_DECODER</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {shards.map(shard => (
                                <div key={shard.id} className={`p-4 bg-slate-900/60 rounded-2xl border-2 transition-all duration-500 ${shard.status === 'PURGED' ? 'border-green-600/30 opacity-50' : 'border-red-600/30 hover:border-red-500'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-[9px] font-black text-white uppercase tracking-tighter">{shard.id} // {shard.origin}</p>
                                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border border-black ${shard.threatLevel === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                                LEVEL: {shard.threatLevel}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-mono text-gray-700">{shard.payloadSize}</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/60 p-2 rounded-lg border border-white/5 mb-4 overflow-hidden">
                                        <p className="text-[10px] font-mono text-red-400/60 whitespace-nowrap overflow-hidden">
                                            {shard.binaryPreview}
                                        </p>
                                    </div>
                                    {shard.status === 'ISOLATED' ? (
                                        <button 
                                            onClick={() => handleNeutralize(shard.id)}
                                            disabled={isNeutralizing !== null}
                                            className="w-full py-2 bg-red-950/40 hover:bg-red-600 border border-red-600/30 text-red-500 hover:text-white transition-all text-[8px] font-black uppercase rounded-lg flex items-center justify-center gap-2"
                                        >
                                            {isNeutralizing === shard.id ? <SpinnerIcon className="w-3 h-3 animate-spin" /> : <FireIcon className="w-3 h-3" />}
                                            {isNeutralizing === shard.id ? 'NEUTRALIZING...' : 'EXECUTE PURGE'}
                                        </button>
                                    ) : (
                                        <div className="w-full py-2 bg-green-950/20 text-green-500 text-[8px] font-black uppercase rounded-lg flex items-center justify-center gap-2">
                                            <CheckCircleIcon className="w-3 h-3" /> SHARD PURGED
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-64 aero-panel bg-black border-4 border-black p-4 flex flex-col overflow-hidden shadow-inner">
                        <div className="flex items-center gap-2 mb-3 text-cyan-900 border-b border-white/5 pb-2">
                            <TerminalIcon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Defense Log</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                            {logs.map((log, i) => (
                                <div key={i} className="text-[10px] font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: log }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-3 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Defense Grid: CONDUCTING</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Stride: 1.22 PB/s | Last Attempt: {telemetry.lastBreachAttempt}
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.5em] hidden sm:block">
                   conjunction reliable series | absolute authority
                </div>
            </div>
        </div>
    );
};
