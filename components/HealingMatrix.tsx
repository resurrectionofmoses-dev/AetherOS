
import React, { useState, useEffect, useRef } from 'react';
import { 
    ZapIcon, SpinnerIcon, ShieldIcon, TerminalIcon, 
    LogicIcon, StarIcon, FireIcon, HammerIcon, ScaleIcon, CheckCircleIcon 
} from './icons';
import { SystemHealer, HealingManifest } from '../services/systemHealer';
import { DIAGNOSTIC_TROUBLE_CODES } from '../constants';

export const HealingMatrix: React.FC = () => {
    const [isHealing, setIsHealing] = useState(false);
    const [manifest, setManifest] = useState<HealingManifest | null>(null);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startHealing = async () => {
        setIsHealing(true);
        setManifest(null);
        setProgress(0);
        
        const steps = [
            "Scanning for fractures...",
            "Detecting logic bleed...",
            "Aligning Conjunction Bridge...",
            "Invoking God Logic...",
            "Finalizing Merkle Proof..."
        ];

        let stepIdx = 0;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const inc = 2;
                if (prev % 20 === 0) setCurrentStep(steps[stepIdx++]);
                return prev + inc;
            });
        }, 50);

        const result = await SystemHealer.heal(DIAGNOSTIC_TROUBLE_CODES.slice(0, 2));
        setManifest(result);
        setIsHealing(false);
        setProgress(100);
        setCurrentStep("SYSTEM HEALED");
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frame: number;
        const particles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (isHealing) {
                if (Math.random() > 0.5) {
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: canvas.height,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -Math.random() * 5 - 2,
                        life: 1.0
                    });
                }
            }

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.01;
                if (p.life <= 0) particles.splice(i, 1);
                
                ctx.fillStyle = `rgba(239, 68, 68, ${p.life})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw grid lines
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.05)';
            ctx.lineWidth = 1;
            for(let x=0; x<canvas.width; x+=40) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for(let y=0; y<canvas.height; y+=40) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

            frame = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(frame);
    }, [isHealing]);

    return (
        <div className="h-full flex flex-col bg-[#050000] text-red-500 font-mono overflow-hidden relative">
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" width={1200} height={800} />

            <div className="p-8 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-20">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-red-600/10 border-4 border-red-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                        <FireIcon className="w-12 h-12 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-6xl text-white italic tracking-tighter uppercase leading-none">HEALING_MATRIX</h2>
                        <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">Protocol: 0x03E2_RECOVERY | Absolute Authority</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Dissonance Neutralizer</p>
                    <p className="text-3xl font-comic-header text-white">{isHealing ? 'IN_PROGRESS' : 'STABLE'}</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 p-10 overflow-hidden relative z-10">
                <div className="lg:w-[400px] flex flex-col gap-6">
                    <div className="aero-panel bg-black/80 border-4 border-red-900/40 p-8 shadow-[15px_15px_0_0_#000]">
                        <h3 className="font-comic-header text-3xl text-white uppercase italic mb-8 flex items-center gap-4">
                            <ShieldIcon className="w-8 h-8 text-red-600" /> Restoration Hub
                        </h3>
                        
                        {!manifest && (
                            <button 
                                onClick={startHealing}
                                disabled={isHealing}
                                className="vista-button w-full py-8 bg-red-600 hover:bg-red-500 text-black font-black uppercase text-2xl tracking-[0.2em] rounded-3xl shadow-[0_20px_50px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-4 border-b-8 border-red-900 active:translate-y-1"
                            >
                                {isHealing ? <SpinnerIcon className="w-10 h-10 animate-spin" /> : <ZapIcon className="w-10 h-10" />}
                                <span>{isHealing ? 'HEALING...' : 'INITIATE /HEAL'}</span>
                            </button>
                        )}

                        {manifest && (
                            <div className="space-y-6 animate-in zoom-in-95 duration-700">
                                <div className="p-4 bg-green-950/20 border-2 border-green-600/40 rounded-2xl flex items-center gap-4">
                                    <CheckCircleIcon className="w-8 h-8 text-green-500" />
                                    <div>
                                        <p className="text-[10px] font-black text-green-500 uppercase">Status</p>
                                        <p className="text-lg font-comic-header text-white">HIERARCHY HEALED</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setManifest(null)}
                                    className="w-full py-3 bg-zinc-900 text-gray-500 font-black uppercase text-[10px] rounded-xl border-2 border-black hover:text-white transition-all"
                                >
                                    Reset Matrix
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-black border-4 border-black rounded-[2rem] italic text-[11px] text-red-900/60 leading-relaxed font-mono shadow-inner">
                        [MAESTRO]: "The /heal protocol is the absolute expression of order. We do not patch symptoms; we reconstruct the Merkle Root."
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-black border-4 border-black rounded-3xl overflow-hidden relative shadow-[20px_20px_100px_rgba(0,0,0,1)]">
                    <div className="p-6 border-b-4 border-black bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-red-500">
                            <TerminalIcon className="w-6 h-6" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Restoration Manifest Output</span>
                        </div>
                        {isHealing && <span className="text-[10px] font-black animate-pulse">{currentStep}</span>}
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar font-mono space-y-10">
                        {isHealing ? (
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-red-900">
                                        <span>Restoration Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-4 bg-gray-950 border-2 border-black rounded-lg overflow-hidden">
                                        <div className="h-full bg-red-600 transition-all duration-300 shadow-[0_0_20px_red]" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {Array(10).fill(0).map((_, i) => (
                                        <div key={i} className={`text-[8px] transition-opacity duration-500 ${i * 10 < progress ? 'opacity-100' : 'opacity-10'}`}>
                                            0x{Math.random().toString(16).slice(2, 10).toUpperCase()} >> SYNTHESIZING_HEALED_SHARD_{i} >> [OK]
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : manifest ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-10">
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Healed Shards Manifest</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {manifest.healedShards.map((shard, i) => (
                                            <div key={i} className="p-4 bg-white/5 border-2 border-green-600/30 rounded-2xl flex items-center gap-4">
                                                <LogicIcon className="w-6 h-6 text-green-500" />
                                                <p className="text-xs font-bold text-gray-300 uppercase tracking-tight">{shard}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8 bg-red-950/20 border-2 border-red-600/30 rounded-[3rem] relative overflow-hidden">
                                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ScaleIcon className="w-4 h-4" /> Maintenance Schedule
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-gray-700 uppercase">Daily Task</span>
                                            <p className="text-sm italic text-gray-300">"{manifest.maintenanceSchedule.daily}"</p>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-gray-700 uppercase">Monthly Task</span>
                                            <p className="text-sm italic text-gray-300">"{manifest.maintenanceSchedule.monthly}"</p>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-red-900/30 flex justify-between items-center">
                                        <span className="text-[8px] font-black text-gray-600 uppercase">Merkle Proof Locked</span>
                                        <span className="text-xs font-mono text-white">{manifest.merkleProof}</span>
                                    </div>
                                </div>

                                <div className="flex justify-center pt-6">
                                    <div className="p-4 bg-black border-2 border-zinc-800 rounded-2xl flex flex-col items-center">
                                        <span className="text-[7px] text-gray-700 font-black uppercase mb-2">Maestro Authority Signature</span>
                                        <span className="text-xl font-comic-header text-red-500">{manifest.signature}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-10">
                                <FireIcon className="w-48 h-48 animate-spin-slow" />
                                <p className="font-comic-header text-5xl uppercase tracking-[0.3em] italic text-center">Awaiting Restoration Trigger</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white/5 border-t-2 border-black/40 flex justify-between items-center text-[8px] font-black uppercase text-gray-700 tracking-widest">
                        <span>Status: {isHealing ? 'RESTORING' : 'STABLE'}</span>
                        <span>Stride: 1.2 PB/s | Conductor: GIFTED</span>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-spin-slow {
                    animation: spin 15s linear infinite;
                }
            `}</style>
        </div>
    );
};
