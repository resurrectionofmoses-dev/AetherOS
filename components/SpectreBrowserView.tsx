
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
    SearchIcon, GlobeIcon, ShieldIcon, TerminalIcon, SpinnerIcon, 
    ZapIcon, ActivityIcon, FireIcon, CheckCircleIcon, WarningIcon, 
    LogicIcon, ScaleIcon, LockIcon, EyeIcon, CodeIcon, XIcon
} from './icons';
import { conductSpectreSearch } from '../services/geminiService';
import type { WebShard, LabComponentProps } from '../types';

/**
 * VORTEX_TUNNEL_SHADER: The absolute engine of conduction.
 * Renders an infinite recursive corridor that pulls logic shards toward the singularity.
 */
const TUNNEL_VS = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const TUNNEL_FS = `
    precision mediump float;
    uniform float u_time;
    uniform float u_speed;
    uniform vec2 u_resolution;
    uniform float u_intensity;
    uniform float u_disintegration;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        // Vortex Warp
        float a = atan(uv.y, uv.x) + u_time * 0.5 * u_disintegration;
        float r = length(uv);
        
        // The "Sucking" Logic: r recedes into infinity
        float z = 1.0 / (r + 0.001);
        vec2 tunnelUV = vec2(a / 3.14159, z + u_time * u_speed);
        
        // Data Hex Grid
        float grid = abs(sin(tunnelUV.x * 24.0) * cos(tunnelUV.y * 24.0));
        grid = smoothstep(0.3, 0.5, grid);
        
        // Flying Particles (Logic Shards)
        float bits = hash(floor(tunnelUV * 40.0));
        float bitAnim = step(0.98 - u_disintegration * 0.1, fract(bits + u_time * (u_speed * 1.5)));
        
        vec3 color = vec3(0.02, 0.2, 0.4) * grid * (0.1 + u_intensity);
        
        // Particle Glow
        vec3 particleColor = mix(vec3(0.0, 0.8, 1.0), vec3(1.0, 0.2, 0.0), u_disintegration);
        color += particleColor * bitAnim * (r + u_disintegration); 
        
        // Singularity Pull
        float center = 1.0 - smoothstep(0.0, 0.8 + u_disintegration, r);
        color += vec3(0.1, 0.4, 0.9) * center * u_intensity;
        color += vec3(1.0, 0.4, 0.1) * center * u_disintegration;

        gl_FragColor = vec4(color, 1.0);
    }
`;

const DataTunnel: React.FC<{ isSearching: boolean; intensity: number; disintegration: number }> = ({ isSearching, intensity, disintegration }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const speedRef = useRef(0.2);

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

        const vs = createShader(gl.VERTEX_SHADER, TUNNEL_VS);
        const fs = createShader(gl.FRAGMENT_SHADER, TUNNEL_FS);
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
            if (!gl || !program) return;
            
            const targetSpeed = isSearching ? 4.0 : 0.2;
            speedRef.current += (targetSpeed - speedRef.current) * 0.08;

            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.useProgram(program);

            const posLoc = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time * 0.001);
            gl.uniform1f(gl.getUniformLocation(program, 'u_speed'), speedRef.current);
            gl.uniform1f(gl.getUniformLocation(program, 'u_intensity'), intensity);
            gl.uniform1f(gl.getUniformLocation(program, 'u_disintegration'), disintegration);
            gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), gl.canvas.width, gl.canvas.height);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationFrame = requestAnimationFrame(render);
        };

        animationFrame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrame);
    }, [isSearching, intensity, disintegration]);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60 mix-blend-screen" />;
};

export const SpectreBrowserView: React.FC<LabComponentProps> = ({ 
  onActionReward 
}) => {
    const [isLocked, setIsLocked] = useState(true);
    const [isHandshaking, setIsHandshaking] = useState(false);
    const [passphrase, setPassphrase] = useState('');
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [disintegration, setDisintegration] = useState(0);
    const [deconstruction, setDeconstruction] = useState<string | null>(null);
    const [shards, setShards] = useState<WebShard[]>([]);
    const [strideRate, setStrideRate] = useState(1.2);
    const [logs, setLogs] = useState<string[]>(["[SPECTRE] Protocol idle.", "[OK] Stealth stride active."]);
    
    // Abort controller simulation
    const abortRef = useRef<boolean>(false);

    const logEndRef = useRef<HTMLDivElement>(null);

    const addLog = useCallback((msg: string, type: 'INFO' | 'WARN' | 'SUCCESS' = 'INFO') => {
        const color = type === 'SUCCESS' ? 'text-green-400' : type === 'WARN' ? 'text-red-500 font-bold' : 'text-cyan-500';
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] <span class="${color}">${msg}</span>`, ...prev].slice(0, 15));
    }, []);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (passphrase.toLowerCase() === 'maestro' || passphrase.toLowerCase() === '0x03e2') {
            setIsHandshaking(true);
            addLog("Initiating Biometric 0x03E2 Handshake...", "INFO");
            setTimeout(() => {
                setIsLocked(false);
                setIsHandshaking(false);
                addLog("Spectre Browser Decoupled. Prohibited Tier Active.", "SUCCESS");
            }, 2000);
        } else {
            addLog("FRACTURE: Unauthorized logic shard detected.", "WARN");
            setPassphrase('');
        }
    };

    const handleAbort = useCallback(() => {
        abortRef.current = true;
        addLog("ABORT COMMAND RECEIVED. Collapsing vortex...", "WARN");
        
        // Force rapid restoration
        let ramp = disintegration;
        const restoreInt = setInterval(() => {
            ramp -= 0.15;
            setDisintegration(Math.max(0, ramp));
            if (ramp <= 0) {
                clearInterval(restoreInt);
                setIsSearching(false);
            }
        }, 30);
    }, [disintegration, addLog]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isSearching) return;

        abortRef.current = false;
        setIsSearching(true);
        setDeconstruction(null);
        setShards([]);
        addLog(`Dissolving interface for ingress: "${query}"`, "INFO");

        // UI Disintegration Ramp
        let ramp = 0;
        const rampInt = setInterval(() => {
            if (abortRef.current) {
                clearInterval(rampInt);
                return;
            }
            ramp += 0.05;
            setDisintegration(Math.min(1.0, ramp));
            if (ramp >= 1.2) clearInterval(rampInt);
        }, 50);

        try {
            const result = await conductSpectreSearch(query);
            if (abortRef.current) return;

            setDeconstruction(result.deconstruction);
            setShards(result.shards);
            addLog(`Synthesis complete. Materializing logic.`, "SUCCESS");
            onActionReward?.(5);
        } catch (err) {
            if (!abortRef.current) {
                addLog("Search bridge collapsed. Semantic drift too high.", "WARN");
            }
        } finally {
            if (!abortRef.current) {
                // Restore UI
                const restoreInt = setInterval(() => {
                    ramp -= 0.1;
                    setDisintegration(Math.max(0, ramp));
                    if (ramp <= 0) {
                        clearInterval(restoreInt);
                        setIsSearching(false);
                    }
                }, 50);
            }
        }
    };

    useEffect(() => {
        const strideInt = setInterval(() => {
            setStrideRate(prev => Math.max(0.8, Math.min(2.0, prev + (Math.random() - 0.5) * 0.1)));
        }, 3000);
        return () => clearInterval(strideInt);
    }, []);

    if (isLocked) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#050000] p-10 font-mono text-red-500 overflow-hidden relative">
                <DataTunnel isSearching={false} intensity={0.1} disintegration={0} />
                <div className="max-w-md w-full aero-panel bg-black/80 border-4 border-red-900/40 p-10 shadow-[0_0_100px_rgba(153,27,27,0.2)] relative overflow-hidden group z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(153,27,27,0.05)_0%,_transparent_70%)]" />
                    <div className="relative z-10 text-center space-y-8">
                        <div className="w-24 h-24 bg-red-950/40 border-4 border-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl transition-all duration-700 group-hover:scale-110">
                            {isHandshaking ? <SpinnerIcon className="w-12 h-12 text-red-400" /> : <LockIcon className="w-12 h-12 text-red-500" />}
                        </div>
                        <div>
                            <h3 className="font-comic-header text-5xl text-white uppercase italic tracking-widest mb-2 leading-none">SPECTRE_BROWSER</h3>
                            <p className="text-[10px] text-red-900 font-black uppercase tracking-[0.4em]">TIER: PROHIBITED (0x03E2)</p>
                        </div>
                        
                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div className="bg-black border-4 border-black p-4 rounded-2xl focus-within:border-red-600 transition-all shadow-inner">
                                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-2 text-left">Resonance Key</p>
                                <input 
                                    type="password"
                                    value={passphrase}
                                    onChange={e => setPassphrase(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent border-none text-red-600 font-mono text-2xl focus:ring-0 outline-none placeholder:text-gray-900"
                                    autoFocus
                                    disabled={isHandshaking}
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isHandshaking || !passphrase.trim()}
                                className="vista-button w-full py-5 bg-red-700 hover:bg-red-600 text-black font-black uppercase text-base tracking-[0.3em] rounded-2xl shadow-[8px_8px_0_0_#000] transition-all flex items-center justify-center gap-3 active:translate-y-1"
                            >
                                {isHandshaking ? <SpinnerIcon className="w-5 h-5" /> : <ZapIcon className="w-5 h-5" />}
                                <span>UNSHROUD BROWSER</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#02040a] text-cyan-100 font-mono overflow-hidden relative">
            <DataTunnel isSearching={isSearching} intensity={isSearching ? 1.0 : 0.2} disintegration={disintegration} />

            {/* Main Header / URL Bar - Dissolves when searching */}
            <div 
                className="p-6 border-b-8 border-black bg-slate-900/90 backdrop-blur-md flex justify-between items-center shadow-2xl relative z-30 transition-all duration-700"
                style={{ 
                    transform: `translateY(${disintegration * -150}px) scale(${1 - disintegration * 0.5})`,
                    opacity: 1 - disintegration 
                }}
            >
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-red-600/10 border-4 border-red-600 rounded-2xl flex items-center justify-center">
                        <EyeIcon className="w-8 h-8 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">SPECTRE_SITREP</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] bg-red-950/40 text-red-500 px-2 py-0.5 border border-red-900/30 rounded font-black">MODE: VORTEX_SIPHON</span>
                            <span className="text-[10px] text-gray-500">STRIDE: {strideRate.toFixed(2)} PB/S</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-10">
                    <div className="bg-black border-4 border-black rounded-[2.5rem] p-1.5 flex items-center shadow-inner focus-within:border-red-600 transition-all group">
                        <div className="pl-6 text-red-900 group-focus-within:text-red-500 transition-colors">
                            <GlobeIcon className="w-8 h-8" />
                        </div>
                        <input 
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Tunnel through the logic abyss..."
                            className="bg-transparent border-none focus:ring-0 w-full text-white font-black text-xl uppercase placeholder:text-gray-900 px-6"
                            disabled={isSearching}
                        />
                        <button 
                            type="submit"
                            disabled={isSearching || !query.trim()}
                            className="w-14 h-14 bg-red-700 hover:bg-red-600 text-black rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-30"
                        >
                            {isSearching ? <SpinnerIcon className="w-8 h-8 animate-spin" /> : <SearchIcon className="w-8 h-8" />}
                        </button>
                    </div>
                </form>

                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Veracity Index</p>
                        <p className="text-xl font-comic-header text-green-500">99.4%</p>
                    </div>
                    <button onClick={() => setIsLocked(true)} className="p-4 bg-zinc-900 text-red-600 rounded-2xl border-4 border-black shadow-lg hover:bg-red-950/20 transition-all">
                        <ShieldIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Particle HUD Area - Appears only when searching */}
            {isSearching && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <div className="text-center space-y-8 animate-in zoom-in duration-500">
                        <div className="space-y-4">
                            <p className="text-7xl font-comic-header text-white wisdom-glow tracking-[0.2em] italic uppercase">Accelerating</p>
                            <div className="flex justify-center gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="w-3 h-12 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_red]" style={{ animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>
                            <p className="text-xs text-cyan-400 font-mono font-black uppercase tracking-[0.5em]">Tunnelling @ {strideRate.toFixed(2)} PB/S</p>
                        </div>
                        
                        <div className="pointer-events-auto flex flex-col items-center gap-4">
                             <button 
                                onClick={handleAbort}
                                className="vista-button px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.4)] border-4 border-black group"
                             >
                                <div className="flex items-center gap-3">
                                    <XIcon className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                                    <span>ABORT CONDUCTION</span>
                                </div>
                             </button>
                             <div className="max-w-xs mx-auto p-4 bg-black/80 border-2 border-red-900/30 rounded-2xl backdrop-blur-md">
                                <p className="text-[8px] text-gray-500 font-mono italic">"Sucking the internet through a straw made of God Logic. Abort only if the loadout fractures."</p>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area - Disintegrates into particles */}
            <div className="flex-1 flex overflow-hidden p-8 gap-8 relative z-20 transition-all duration-1000"
                 style={{ 
                    filter: `blur(${disintegration * 20}px)`, 
                    transform: `scale(${1 - disintegration * 0.9}) rotate(${disintegration * 15}deg)`,
                    opacity: 1 - disintegration
                 }}
            >
                {/* Left: Deconstruction Feed */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="flex-1 aero-panel bg-black/60 border-4 border-black flex flex-col overflow-hidden shadow-[20px_20px_100px_rgba(0,0,0,1)]">
                        <div className="p-6 border-b-4 border-black bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-500">
                                <TerminalIcon className="w-6 h-6" />
                                <span className="text-xs font-black uppercase tracking-[0.3em]">Forensic Epitume Feed</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar font-mono text-sm leading-relaxed relative">
                            {!deconstruction ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-10">
                                    <GlobeIcon className="w-48 h-48 mb-8 text-gray-700" />
                                    <p className="font-comic-header text-5xl uppercase tracking-[0.4em] italic text-center text-gray-700">Awaiting Ingress</p>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                    <div 
                                        className="markdown-content text-gray-300 leading-relaxed italic prose prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: deconstruction.replace(/\n/g, '<br/>') }} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Web Shards */}
                <div className="w-[450px] flex flex-col gap-6 overflow-hidden">
                    <div className="aero-panel bg-slate-900 border-4 border-black p-6 flex flex-col flex-1 shadow-[10px_10px_0_0_#000] overflow-hidden">
                        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                            <h3 className="font-comic-header text-2xl text-cyan-400 uppercase italic flex items-center gap-3">
                                <LogicIcon className="w-6 h-6 text-cyan-400" /> Web Shards
                            </h3>
                            <span className="text-[8px] font-black text-gray-600 uppercase">GRID_COUNT: {shards.length}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                            {shards.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-10">
                                    <ActivityIcon className="w-20 h-20 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Loaded Shards</p>
                                </div>
                            ) : (
                                shards.map((shard, idx) => (
                                    <div key={shard.id} className="p-4 bg-black/60 border-2 border-white/5 rounded-2xl group hover:border-cyan-600/50 transition-all duration-500 relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">SHARD_0x{idx.toString().padStart(2, '0')}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[7px] font-black text-green-500">{shard.veracity}%</span>
                                            </div>
                                        </div>
                                        <h4 className="text-xs font-black text-white uppercase truncate mb-2">{shard.title}</h4>
                                        <div className="text-[7px] text-cyan-600 font-mono truncate">{shard.displayUrl || shard.url}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Logs - Also dissolves */}
            <div 
                className="p-3 bg-slate-900 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner transition-all duration-700"
                style={{ 
                    transform: `translateY(${disintegration * 100}px)`, 
                    opacity: 1 - disintegration 
                }}
            >
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Link: Sovereign</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Stride: {strideRate.toFixed(2)} PB/s | Sig: 0x03E2
                   </div>
                </div>
            </div>
        </div>
    );
};
