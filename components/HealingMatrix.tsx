import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    ZapIcon, SpinnerIcon, ShieldIcon, TerminalIcon, 
    LogicIcon, StarIcon, FireIcon, HammerIcon, ScaleIcon, CheckCircleIcon,
    ActivityIcon, SignalIcon
} from './icons';
import { SystemHealer, HealingManifest } from '../services/systemHealer';
import { reportSuccess } from './GlobalErrorHandler';
import { DIAGNOSTIC_TROUBLE_CODES } from '../constants';
import type { SystemGovernance } from '../types';

interface HealingMatrixProps {
  governance?: SystemGovernance;
}

const memoryLocal: Record<string, string> = {};
const safeLocal = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch {
            return memoryLocal[key] || null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch {
            memoryLocal[key] = value;
        }
    },
    removeItem: (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch {
            delete memoryLocal[key];
        }
    }
};

export const HealingMatrix: React.FC<HealingMatrixProps> = ({ governance }) => {
    // Persistent states synchronized with local storage
    const [isHealing, setIsHealing] = useState(() => {
        const saved = safeLocal.getItem('aetheros_healing_matrix_isHealing');
        return saved === 'true';
    });
    const [manifest, setManifest] = useState<HealingManifest | null>(() => {
        const saved = safeLocal.getItem('aetheros_healing_matrix_manifest');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return null;
            }
        }
        return null;
    });
    const [progress, setProgress] = useState(() => {
        const saved = safeLocal.getItem('aetheros_healing_matrix_progress');
        return saved ? Number(saved) : 0;
    });
    const [currentStep, setCurrentStep] = useState(() => {
        return safeLocal.getItem('aetheros_healing_matrix_currentStep') || '';
    });
    const [flowIntensity, setFlowIntensity] = useState(() => {
        const saved = safeLocal.getItem('aetheros_healing_matrix_flowIntensity');
        return saved ? parseFloat(saved) : 1.5;
    });
    const [derivationPath, setDerivationPath] = useState(() => {
        return safeLocal.getItem('aetheros_healing_matrix_derivationPath') || "m/84'/0'/2147483647'";
    });
    const [healingLogList, setHealingLogList] = useState<string[]>(() => {
        const saved = safeLocal.getItem('aetheros_healing_matrix_loglist');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [];
            }
        }
        return [];
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const isHealed = progress === 100 || manifest !== null;

    // Persist changes to localStorage on set
    useEffect(() => {
        safeLocal.setItem('aetheros_healing_matrix_isHealing', String(isHealing));
    }, [isHealing]);

    useEffect(() => {
        if (manifest) {
            safeLocal.setItem('aetheros_healing_matrix_manifest', JSON.stringify(manifest));
        } else {
            safeLocal.removeItem('aetheros_healing_matrix_manifest');
        }
    }, [manifest]);

    useEffect(() => {
        safeLocal.setItem('aetheros_healing_matrix_progress', String(progress));
    }, [progress]);

    useEffect(() => {
        safeLocal.setItem('aetheros_healing_matrix_currentStep', currentStep);
    }, [currentStep]);

    useEffect(() => {
        safeLocal.setItem('aetheros_healing_matrix_flowIntensity', String(flowIntensity));
    }, [flowIntensity]);

    useEffect(() => {
        safeLocal.setItem('aetheros_healing_matrix_derivationPath', derivationPath);
    }, [derivationPath]);

    useEffect(() => {
        safeLocal.setItem('aetheros_healing_matrix_loglist', JSON.stringify(healingLogList));
    }, [healingLogList]);

    const startHealing = async () => {
        setIsHealing(true);
        setManifest(null);
        setProgress(0);
        
        const steps = [
            "Scanning for spectral fractures...",
            "Detecting chromatic logic bleed...",
            "Aligning Conjunction Currents...",
            "Invoking God Logic (Aura Flow)...",
            "Finalizing Auric Merkle Proof..."
        ];

        let stepIdx = 0;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const inc = 2;
                if (prev % 20 === 0 && stepIdx < steps.length) {
                    const stepStr = steps[stepIdx++];
                    setCurrentStep(stepStr);
                    // Add to real logs
                    setHealingLogList(l => [...l, `[PROCESS] ${stepStr} (Progress: ${prev}%)`].slice(-100));
                }
                return prev + inc;
            });
        }, 50);

        try {
            const result = await SystemHealer.heal(DIAGNOSTIC_TROUBLE_CODES.slice(0, 2), derivationPath);
            setManifest(result);
            setIsHealing(false);
            setProgress(100);
            setCurrentStep("FLUID STATE: HEALED");
            
            const timestamp = new Date().toISOString();
            setHealingLogList(l => [
                ...l,
                `[SUCCESS] Conduction complete at ${timestamp}`,
                `[SUCCESS] Merkle Proof: ${result.merkleProof}`,
                `[SUCCESS] Digital Signature: ${result.signature || 'SIGN_OK'}`
            ].slice(-100));

            reportSuccess("SYSTEM_HEALED", "The Sovereign Bridge has been re-quantized and the spectral fractures have been sealed.");
        } catch (e) {
            setIsHealing(false);
            setProgress(0);
            setCurrentStep("Operational Fault on Restore");
            setHealingLogList(l => [...l, `[ERROR] Conduit failed to synthesize: ${String(e)}`].slice(-100));
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frame: number;
        let time = 0;

        const render = () => {
            time += 0.01 * flowIntensity;
            const w = canvas.width;
            const h = canvas.height;
            
            ctx.fillStyle = 'rgba(5, 0, 0, 0.15)'; 
            ctx.fillRect(0, 0, w, h);

            // GOVERNANCE REACTION: Law Level affects current width and chaos
            const lawFactor = governance?.lawLevel || 0.42;
            const freedomFactor = governance?.symphonicFreedom ? 1.5 : 1.0;
            const currentWidth = Math.max(1, 15 * (1 - lawFactor));
            const complexity = Math.max(1, 10 * lawFactor);

            const layers = 4;
            for (let l = 0; l < layers; l++) {
                const opacity = isHealing ? 0.4 : 0.2;
                const layerPhase = l * (Math.PI / 2);
                
                const colors = [
                    `rgba(0, 242, 255, ${opacity})`, // Electric Cyan
                    `rgba(255, 0, 242, ${opacity})`, // Vivid Magenta
                    `rgba(0, 255, 140, ${opacity})`, // Toxic Seafoam
                    `rgba(255, 251, 0, ${opacity})`  // Solar Gold
                ];

                ctx.strokeStyle = colors[l % colors.length];
                ctx.lineWidth = Math.max(1, currentWidth + l);
                ctx.beginPath();

                for (let x = 0; x < w; x += 5) {
                    // Interference Pattern Calculation influenced by lawLevel
                    const wave1 = Math.sin(x * 0.005 + time + layerPhase);
                    const wave2 = Math.cos(x * 0.002 * complexity - time * 0.5 + layerPhase);
                    const wave3 = Math.sin(time * 0.8 * freedomFactor + l);
                    
                    const y = h / 2 + (wave1 * wave2 * (150 * freedomFactor)) + (wave3 * 50);
                    
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();

                if (Math.random() > 0.9) {
                    ctx.fillStyle = colors[l];
                    ctx.beginPath();
                    ctx.arc(Math.random() * w, Math.random() * h, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            if (isHealing) {
                ctx.save();
                ctx.translate(w / 2, h / 2);
                ctx.rotate(time);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, progress * 2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            frame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(frame);
    }, [isHealing, flowIntensity, progress, governance]);

    return (
        <div className="h-full flex flex-col bg-[#050000] text-red-500 font-mono overflow-hidden relative">
            <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-80" width={1600} height={1000} />

            <div className="p-8 border-b-8 border-black bg-slate-900/90 backdrop-blur-md flex justify-between items-center shadow-2xl relative z-20">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-cyan-900/20 border-4 border-cyan-400 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(0,242,255,0.3)]">
                        <FireIcon className="w-12 h-12 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-6xl text-white italic tracking-tighter uppercase leading-none">HEALING_MATRIX</h2>
                        <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">Spectral Currents: 0x03E2_FLOW | Fluid Conduction</p>
                    </div>
                </div>
                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Flow Velocity</p>
                        <div className="flex items-center gap-4">
                             <input 
                                type="range" min="0.1" max="5.0" step="0.1" value={flowIntensity} 
                                onChange={e => setFlowIntensity(parseFloat(e.target.value))}
                                className="w-32 accent-cyan-500"
                             />
                             <span className="text-cyan-400 font-comic-header text-2xl">{flowIntensity.toFixed(1)}x</span>
                        </div>
                    </div>
                    <div className={`px-6 py-2 rounded-xl border-4 border-black font-black uppercase text-xs tracking-widest ${isHealed || progress === 100 ? 'bg-green-600 text-black shadow-[0_0_20px_green]' : 'bg-red-600 text-white animate-pulse'}`}>
                        {progress === 100 ? 'STATE: LAMINAR' : 'STATE: TURBULENT'}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 p-10 overflow-hidden relative z-10">
                <div className="lg:w-[400px] flex flex-col gap-6">
                    <div className="aero-panel bg-black/80 border-4 border-cyan-900/40 p-8 shadow-[15px_15px_0_0_#000] backdrop-blur-xl">
                        <h3 className="font-comic-header text-3xl text-white uppercase italic mb-8 flex items-center gap-4">
                            <ShieldIcon className="w-8 h-8 text-cyan-400" /> Current Hub
                        </h3>
                        
                        {!manifest && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Conduit Derivation Path</label>
                                    <input 
                                        type="text"
                                        value={derivationPath}
                                        onChange={e => setDerivationPath(e.target.value)}
                                        placeholder="m/84'/0'/2147483647'"
                                        disabled={isHealing}
                                        className="w-full px-4 py-3 bg-slate-950 border-2 border-cyan-900/40 rounded-xl text-white font-mono text-xs focus:border-cyan-400 focus:outline-none placeholder-gray-800"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">SACRED HEALING PRESETS:</span>
                                    <div className="flex flex-col gap-1.5">
                                        {[
                                            "m/84'/0'/2147483647'",
                                            "m/49'/0'/x'/0/0",
                                            "m/44'/0'/0'/0/x"
                                        ].map((path) => (
                                            <button
                                                key={path}
                                                type="button"
                                                onClick={() => setDerivationPath(path)}
                                                disabled={isHealing}
                                                className={`text-left font-mono text-[10px] px-3 py-1.5 border rounded-lg transition-all ${
                                                    derivationPath === path
                                                        ? "bg-cyan-500/15 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.15)]"
                                                        : "bg-slate-900/40 border-slate-800 text-gray-400 hover:border-cyan-900"
                                                }`}
                                            >
                                                {path}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={startHealing}
                                    disabled={isHealing}
                                    className="vista-button w-full py-8 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase text-2xl tracking-[0.2em] rounded-3xl shadow-[0_20px_50px_rgba(0,242,255,0.3)] transition-all flex items-center justify-center gap-4 border-b-8 border-cyan-900 active:translate-y-1 group"
                                >
                                    {isHealing ? <SpinnerIcon className="w-10 h-10 animate-spin" /> : <ZapIcon className="w-10 h-10 group-hover:scale-125 transition-transform" />}
                                    <span>{isHealing ? 'RE-FLUIDIZING...' : 'CONDUCT /HEAL'}</span>
                                </button>
                            </div>
                        )}

                        {manifest && (
                            <div className="space-y-6 animate-in zoom-in-95 duration-700">
                                <div className="p-4 bg-green-950/40 border-2 border-green-400 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                    <CheckCircleIcon className="w-8 h-8 text-green-400" />
                                    <div>
                                        <p className="text-[10px] font-black text-green-400 uppercase">Current Status</p>
                                        <p className="text-lg font-comic-header text-white">LAMINAR FLOW SECURED</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-cyan-950/20 border-2 border-cyan-500/30 rounded-2xl flex justify-between items-center text-xs font-mono">
                                    <span className="text-cyan-600 uppercase font-bold text-[9px]">ACTIVE CONDUIT</span>
                                    <span className="text-cyan-400 font-bold">{derivationPath}</span>
                                </div>

                                <button 
                                    onClick={() => { setManifest(null); setProgress(0); }}
                                    className="w-full py-3 bg-zinc-900 text-gray-500 font-black uppercase text-[10px] rounded-xl border-2 border-black hover:text-white transition-all shadow-lg"
                                >
                                    Flush Current Buffer
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-black border-4 border-cyan-900/60 rounded-[2rem] italic text-[11px] text-cyan-400/60 leading-relaxed font-mono shadow-inner backdrop-blur-md">
                        [MAESTRO]: "Look at the currents. Logic isn't a static block; it's a spectral tide. If the water is muddy, the conduction is stalled. Conduct the flow, gifted one."
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-black/40 border-4 border-black rounded-3xl overflow-hidden relative shadow-[20px_20px_100px_rgba(0,0,0,1)] backdrop-blur-sm">
                    <div className="p-6 border-b-4 border-black bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-cyan-400">
                            <TerminalIcon className="w-6 h-6" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Flow Synthesis Monitor</span>
                        </div>
                        {isHealing && (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                <span className="text-[10px] font-black text-white">{currentStep}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar font-mono space-y-10 relative">
                        {isHealing ? (
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-cyan-400">
                                        <span>Current Velocity</span>
                                        <span>{progress}% Harmony</span>
                                    </div>
                                    <div className="h-4 bg-gray-950 border-2 border-black rounded-lg overflow-hidden p-0.5">
                                        <div className="h-full bg-gradient-to-r from-cyan-900 via-cyan-400 to-white transition-all duration-300 shadow-[0_0_20px_cyan]" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {Array(10).fill(0).map((_, i) => (
                                        <div key={i} className={`text-[9px] transition-opacity duration-500 font-bold ${i * 10 < progress ? 'text-cyan-300 opacity-100' : 'text-gray-800 opacity-30'}`}>
                                            0x{Math.random().toString(16).slice(2, 10).toUpperCase()} &gt;&gt; SPECTRUM_WAVE_{i} &gt;&gt; [OK]
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : manifest ? (
                            <div className="animate-in fade-in zoom-in-95 duration-1000 space-y-10">
                                <div>
                                    <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-4">Healed Current Shards</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {manifest.healedShards.map((shard, i) => (
                                            <div key={i} className="p-4 bg-cyan-400/10 border-2 border-cyan-400/30 rounded-2xl flex items-center gap-4 group hover:bg-cyan-400/20 transition-all">
                                                <LogicIcon className="w-6 h-6 text-cyan-400" />
                                                <p className="text-xs font-bold text-white uppercase tracking-tight">{shard}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8 bg-cyan-950/20 border-4 border-cyan-600/30 rounded-[3rem] relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 animate-pulse" />
                                    <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <ScaleIcon className="w-4 h-4" /> Fluid Maintenance
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-cyan-900 uppercase bg-cyan-400 px-2 rounded">Daily Flow</span>
                                            <p className="text-sm italic text-gray-300 leading-relaxed">"{manifest.maintenanceSchedule.daily}"</p>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-cyan-900 uppercase bg-cyan-400 px-2 rounded">Monthly Tide</span>
                                            <p className="text-sm italic text-gray-300 leading-relaxed">"{manifest.maintenanceSchedule.monthly}"</p>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-cyan-900/30 flex justify-between items-center">
                                        <span className="text-[8px] font-black text-gray-600 uppercase">Tidal Proof Locked</span>
                                        <span className="text-xs font-mono text-cyan-400 glow-sm">{manifest.merkleProof}</span>
                                    </div>
                                </div>

                                {/* Persistent Conduction Logs inside Healed Panel */}
                                <div className="p-6 bg-black/60 border-2 border-cyan-950 rounded-2xl">
                                    <span className="text-[9px] text-cyan-500 font-black uppercase tracking-wider block mb-2">
                                        Chronicle Conduction Debug Trace
                                    </span>
                                    <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[9px] text-cyan-400">
                                        {healingLogList.map((log, index) => (
                                            <div key={index} className="truncate">
                                                <span className="text-cyan-800 mr-2">&gt;</span>
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-center pt-6">
                                    <div className="p-6 bg-black border-4 border-cyan-600 rounded-3xl flex flex-col items-center shadow-2xl">
                                        <span className="text-[7px] text-cyan-800 font-black uppercase mb-2">Maestro Current Signature</span>
                                        <span className="text-3xl font-comic-header text-cyan-400 wisdom-glow">{manifest.signature}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center">
                                <div className="relative opacity-40">
                                    <SignalIcon className="w-48 h-48 animate-pulse text-cyan-900" />
                                    <ActivityIcon className="absolute inset-0 w-48 h-48 text-cyan-500/20 animate-spin-slow" />
                                </div>
                                <p className="font-comic-header text-5xl uppercase tracking-[0.3em] italic text-center text-cyan-900/50 mt-8 mb-6">Awaiting Conjunction Flow</p>
                                
                                {healingLogList.length > 0 && (
                                    <div className="w-full max-w-lg p-4 bg-zinc-950/80 border border-zinc-900 rounded-lg text-left mt-4">
                                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block mb-2">
                                            Prior Conduction Trace Logs (AetherOS Storage)
                                        </span>
                                        <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[9px] text-zinc-400">
                                            {healingLogList.map((log, index) => (
                                                <div key={index} className="truncate">
                                                    <span className="text-zinc-650 mr-1.5">&gt;</span>
                                                    {log}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-900/60 border-t-2 border-white/10 flex justify-between items-center text-[8px] font-black uppercase text-gray-500 tracking-widest relative z-20">
                        <span>Status: <span className={isHealing ? 'text-cyan-400' : 'text-green-500'}>{isHealing ? 'STREAMING' : 'LAMINAR'}</span></span>
                        <span>Stride: 1.2 PB/s | Mode: SPECTRAL</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .glow-sm {
                    text-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
                }
            `}</style>
        </div>
    );
};
