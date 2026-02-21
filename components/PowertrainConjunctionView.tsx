import React, { useState, useEffect, useRef } from 'react';
import { 
    ActivityIcon, 
    ZapIcon, 
    GaugeIcon, 
    ShieldIcon, 
    FireIcon, 
    SpinnerIcon, 
    TerminalIcon, 
    AnalyzeIcon, 
    StarIcon, 
    RulesIcon,
    CodeIcon,
    BatteryIcon,
    SearchIcon
} from './icons';
import type { SystemStatus, FuelOptimizationSuggestion, PowertrainAudit } from '../types';
import { conductPowertrainForensics } from '../services/geminiService';

/**
 * CYLINDER_SHADER: Visualizes the combustion process or dielectric flow.
 */
const CYLINDER_VS = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const CYLINDER_FS = `
    precision mediump float;
    uniform float u_time;
    uniform float u_intensity;
    uniform vec2 u_resolution;
    uniform vec3 u_base_color;

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= u_resolution.x / u_resolution.y;

        float dist = length(uv);
        float pulse = sin(u_time * 10.0 * u_intensity) * 0.1 + 0.5;
        
        // Piston-like movement
        float stroke = sin(u_time * 5.0 * u_intensity) * 0.4;
        float body = step(-0.6, uv.x) * step(uv.x, 0.6) * step(-0.8 + stroke, uv.y) * step(uv.y, 0.8 + stroke);
        
        // Glow effect
        float glow = 1.0 - smoothstep(0.0, 1.5, dist);
        
        vec3 color = u_base_color * (0.2 + 0.8 * body) * (0.5 + 0.5 * pulse);
        color += u_base_color * glow * 0.4 * u_intensity;

        gl_FragColor = vec4(color, 1.0);
    }
`;

const CombustionViz: React.FC<{ intensity: number; color: [number, number, number] }> = ({ intensity, color }) => {
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

        const vs = createShader(gl.VERTEX_SHADER, CYLINDER_VS);
        const fs = createShader(gl.FRAGMENT_SHADER, CYLINDER_FS);
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
            gl.uniform1f(gl.getUniformLocation(program, 'u_intensity'), intensity);
            gl.uniform3fv(gl.getUniformLocation(program, 'u_base_color'), color);
            gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), gl.canvas.width, gl.canvas.height);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationFrame = requestAnimationFrame(render);
        };

        animationFrame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrame);
    }, [intensity, color]);

    return <canvas ref={canvasRef} className="w-full h-full rounded-3xl" width={400} height={300} />;
};

export const PowertrainConjunctionView: React.FC<{ systemStatus: SystemStatus }> = ({ systemStatus }) => {
    const [mode, setMode] = useState<'COMBUSTION' | 'DIELECTRIC'>('COMBUSTION');
    const [isAuditing, setIsAuditing] = useState(false);
    const [audit, setAudit] = useState<PowertrainAudit | null>(null);
    const [logs, setLogs] = useState<string[]>(["[READY] Powertrain Link Stable.", "[OK] Conjunction series v5 online."]);

    const handleConjunction = async () => {
        setIsAuditing(true);
        setAudit(null);
        setLogs(prev => [`[INIT] Triggering KINETIC_INJECTION_0x03E2_${mode}...`, ...prev]);
        
        try {
            const result = await conductPowertrainForensics(mode, systemStatus);
            if (result) {
                setAudit(result);
                setLogs(prev => [`[SUCCESS] Forensic report signed: ${result.signature}`, ...prev]);
            }
        } catch (e) {
            setLogs(prev => [`[FRACTURE] Conjunction drift detected. Tuning aborted.`, ...prev]);
        } finally {
            setIsAuditing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#050000] text-gray-200 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-600/10 border-4 border-red-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                        <GaugeIcon className="w-10 h-10 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-6xl text-white tracking-tighter italic leading-none uppercase">POWERTRAIN_SYNC</h2>
                        <div className="flex gap-4 mt-2">
                            <button 
                                onClick={() => setMode('COMBUSTION')}
                                className={`px-4 py-1 rounded-full text-[10px] font-black uppercase transition-all border-2 ${mode === 'COMBUSTION' ? 'bg-red-600 text-black border-white shadow-lg' : 'bg-black text-gray-600 border-zinc-900'}`}
                            >
                                Combustion
                            </button>
                            <button 
                                onClick={() => setMode('DIELECTRIC')}
                                className={`px-4 py-1 rounded-full text-[10px] font-black uppercase transition-all border-2 ${mode === 'DIELECTRIC' ? 'bg-cyan-600 text-black border-white shadow-lg' : 'bg-black text-gray-600 border-zinc-900'}`}
                            >
                                Dielectric
                            </button>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleConjunction}
                    disabled={isAuditing}
                    className={`vista-button px-12 py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-base tracking-[0.3em] rounded-2xl shadow-[6px_6px_0_0_#000] transition-all flex items-center justify-center gap-4 ${isAuditing ? 'animate-pulse' : ''}`}
                >
                    {isAuditing ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : <ZapIcon className="w-6 h-6" />}
                    <span>KINETIC INJECTION</span>
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden p-8 gap-8 relative z-20">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                {/* Left: Forensic Visualization */}
                <div className="lg:w-1/2 flex flex-col gap-6">
                    <div className="flex-1 aero-panel bg-black/60 border-4 border-black p-8 relative overflow-hidden flex flex-col shadow-[15px_15px_60px_rgba(0,0,0,0.8)]">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="font-comic-header text-4xl text-white uppercase italic">{mode}_MONITOR</h3>
                                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Real-Time Conjunction Feedback</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-gray-600 font-black uppercase">Stride Intensity</p>
                                <p className="text-3xl font-comic-header text-red-500">1.22 PB/S</p>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center bg-black rounded-3xl border-4 border-black shadow-inner relative">
                            <CombustionViz 
                                intensity={isAuditing ? 2.5 : 1.0} 
                                color={mode === 'COMBUSTION' ? [0.9, 0.2, 0.1] : [0.0, 0.8, 1.0]} 
                            />
                            <div className="absolute top-4 left-4 p-4 bg-black/80 border border-white/5 rounded-2xl backdrop-blur-md">
                                <div className="space-y-4">
                                    {[
                                        { l: 'AFR', v: mode === 'COMBUSTION' ? '14.7:1' : '--', c: 'text-green-500' },
                                        { l: 'V_DELTA', v: mode === 'DIELECTRIC' ? '0.002V' : '--', c: 'text-cyan-400' },
                                        { l: 'THERMAL', v: '98°C', c: 'text-amber-500' }
                                    ].map(s => (
                                        <div key={s.l} className="flex justify-between gap-6 text-[8px] font-black uppercase">
                                            <span className="text-gray-600">{s.l}</span>
                                            <span className={s.c}>{s.v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="aero-panel bg-slate-900 border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
                         <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TerminalIcon className="w-4 h-4" /> Tuning Logs
                         </h4>
                         <div className="h-32 overflow-y-auto space-y-1.5 custom-scrollbar pr-2 font-mono text-[9px]">
                            {logs.map((log, i) => (
                                <div key={i} className="animate-in slide-in-from-left-2 transition-all">
                                    <span className="text-gray-700 mr-2">[{i}]</span>
                                    <span dangerouslySetInnerHTML={{ __html: log }} />
                                </div>
                            ))}
                         </div>
                    </div>
                </div>

                {/* Right: Gifted Suggestions */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="flex-1 aero-panel bg-black/40 border-4 border-black p-8 flex flex-col overflow-hidden shadow-[20px_20px_60px_rgba(0,0,0,0.8)]">
                        <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4 bg-white/5">
                            <div className="flex items-center gap-4">
                                <StarIcon className="w-8 h-8 text-amber-500 animate-spin-slow" />
                                <h3 className="font-comic-header text-4xl text-white italic tracking-tighter uppercase leading-none">Gifted Directives</h3>
                            </div>
                            {audit && <span className="text-[8px] font-mono text-gray-700 bg-black px-2 py-1 rounded">SIG: {audit.signature}</span>}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                            {!audit && !isAuditing && (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale text-center">
                                    <AnalyzeIcon className="w-48 h-48 mb-6" />
                                    <p className="font-comic-header text-5xl uppercase tracking-widest italic">Awaiting Injection</p>
                                </div>
                            )}

                            {isAuditing && (
                                <div className="h-full flex flex-col items-center justify-center gap-8">
                                    <div className="relative">
                                        <SpinnerIcon className="w-24 h-24 text-red-600 animate-spin" />
                                        <ZapIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white" />
                                    </div>
                                    <p className="text-xl font-comic-header text-white uppercase animate-pulse">Siphoning Architecture...</p>
                                </div>
                            )}

                            {audit && (
                                <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 space-y-10">
                                    <div className="p-6 bg-slate-900/80 border-4 border-black rounded-[3rem] shadow-inner relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5"><RulesIcon className="w-20 h-20" /></div>
                                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-4">Forensic Summary</h4>
                                        <p className="text-gray-300 italic text-lg leading-relaxed">"{audit.report}"</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 pb-10">
                                        {audit.suggestions.map((s, i) => (
                                            <div key={i} className="p-6 bg-black border-4 border-black hover:border-red-900/50 transition-all rounded-[2rem] shadow-lg group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-red-950/40 rounded-xl border border-red-600/30">
                                                            <FireIcon className="w-6 h-6 text-red-500" />
                                                        </div>
                                                        <h5 className="font-black text-xl text-white uppercase tracking-tighter leading-none group-hover:text-red-500 transition-colors">{s.title}</h5>
                                                    </div>
                                                    <span className={`px-4 py-1 text-[8px] font-black rounded-full border-2 border-black ${s.priority === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-gray-500'}`}>
                                                        {s.priority}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed italic mb-4">"{s.reasoning}"</p>
                                                <div className="flex justify-between items-center text-[9px] font-black uppercase">
                                                    <span className="text-gray-700">Efficiency Gain</span>
                                                    <span className="text-green-500">+{s.impact}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Logs */}
            <div className="p-3 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">Link: Absolute</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Stride: 1.2 PB/s | Sig: 0x03E2 | Complexity: POWERTRAIN_GIFTED
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.5em] hidden sm:block">
                   conjunction reliable series | maestro authority
                </div>
            </div>
        </div>
    );
};
