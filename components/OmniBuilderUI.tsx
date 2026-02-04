
import React, { useState, useEffect } from 'react';
import { OmniBuilder } from '../services/omniBuilder';
import { 
    ForgeIcon, ZapIcon, SpinnerIcon, BrainIcon, ShieldIcon, 
    TerminalIcon, LogicIcon, StarIcon, ActivityIcon, FireIcon, CodeIcon, SearchIcon
} from './icons';
import type { DreamedSchema, LineageEntry } from '../types';
import { safeStorage } from '../services/safeStorage';
import { extractJSON } from '../utils';

export const OmniBuilderUI: React.FC = () => {
    const [seed, setSeed] = useState('');
    const [isDreaming, setIsDreaming] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [currentDream, setCurrentDream] = useState<DreamedSchema | null>(null);
    const [unfilledNeedsCount, setUnfilledNeedsCount] = useState(0);

    useEffect(() => {
        const raw = safeStorage.getItem('AETHER_VAULT_LEDGER');
        const ledger = extractJSON<LineageEntry[]>(raw || '', []);
        const wounds = ledger.filter(e => e.type === 'WOUND');
        setUnfilledNeedsCount(wounds.length);
    }, []);

    const handleDreamFromVault = async () => {
        setIsDreaming(true);
        setCurrentDream(null);
        const raw = safeStorage.getItem('AETHER_VAULT_LEDGER');
        const ledger = extractJSON<LineageEntry[]>(raw || '', []);
        
        const dream = await OmniBuilder.dreamFromVault(ledger);
        if (dream) setCurrentDream(dream);
        setIsDreaming(false);
    };

    const handleSynthesizeSeed = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seed.trim() || isThinking) return;
        
        setIsThinking(true);
        setCurrentDream(null);
        const result = await OmniBuilder.synthesizeSeed(seed);
        if (result) setCurrentDream(result);
        setIsThinking(false);
        setSeed('');
    };

    return (
        <div className="h-full flex flex-col bg-[#05050a] text-gray-200 font-mono overflow-hidden selection:bg-amber-500/30">
            {/* Omni Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-amber-600/10 border-4 border-amber-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                        <ForgeIcon className="w-10 h-10 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">OMNI_BUILDER</h2>
                        <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.4em] mt-1 italic">Evolutionary Code Manifest | Abundance Strategy</p>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Unfilled Needs</p>
                        <p className={`text-3xl font-comic-header ${unfilledNeedsCount > 5 ? 'text-red-500' : 'text-cyan-400'}`}>{unfilledNeedsCount}</p>
                    </div>
                    <button 
                        onClick={handleDreamFromVault}
                        disabled={isDreaming || unfilledNeedsCount === 0}
                        className="vista-button px-8 py-3 bg-red-600 hover:bg-red-500 text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center gap-2"
                    >
                        {isDreaming ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <FireIcon className="w-4 h-4" />}
                        <span>DREAM FROM FRACTURES</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 p-10 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(251,191,36,0.05)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left Side: Recursive Seed Input */}
                <div className="lg:w-[450px] flex flex-col gap-8 flex-shrink-0 relative z-20">
                    <form onSubmit={handleSynthesizeSeed} className="aero-panel bg-slate-900/80 p-8 border-amber-600/30 shadow-[15px_15px_0_0_#000] hover:scale-[1.01] transition-transform">
                        <h3 className="font-comic-header text-3xl text-white uppercase italic tracking-tight mb-8 flex items-center gap-4">
                            <BrainIcon className="w-8 h-8 text-amber-500" /> Recursive Seed
                        </h3>
                        <div className="bg-black/80 p-6 border-4 border-black rounded-[2rem] mb-8 focus-within:border-amber-500 transition-all shadow-inner">
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Input Seed of Intent</p>
                            <textarea 
                                value={seed}
                                onChange={e => setSeed(e.target.value)}
                                placeholder="e.g. 'I need a way to see through walls'..."
                                className="w-full h-40 bg-transparent border-none font-mono text-amber-400 focus:ring-0 outline-none text-lg resize-none placeholder:text-gray-900"
                                disabled={isThinking || isDreaming}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={isThinking || isDreaming || !seed.trim()}
                            className="vista-button w-full py-6 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-xl tracking-[0.2em] rounded-3xl flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(251,191,36,0.3)] transition-all active:scale-95 border-b-8 border-amber-900"
                        >
                            {isThinking ? <SpinnerIcon className="w-8 h-8 animate-spin" /> : <ZapIcon className="w-8 h-8" />}
                            <span>INITIATE SYNTHESIS</span>
                        </button>
                    </form>

                    <div className="p-6 bg-amber-950/10 border-4 border-amber-900/30 rounded-[2rem] italic text-[11px] text-amber-400/60 leading-relaxed font-mono">
                        [MAESTRO]: "The seed is the 'Why'. Provide the intent, and I will traverse the 4D manifold to manifest the 'How'. This is the abundance strategy: infinite tools for infinite needs."
                    </div>
                </div>

                {/* Right Side: Manifestation Output */}
                <div className="flex-1 flex flex-col bg-black border-4 border-black rounded-3xl overflow-hidden relative shadow-[20px_20px_100px_rgba(0,0,0,0.8)]">
                    {/* Floating Gold Background for Manifesting */}
                    {(isThinking || isDreaming) && (
                        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                            {Array(40).fill(0).map((_, i) => (
                                <div 
                                    key={i} 
                                    className="absolute w-1 h-1 bg-amber-500 rounded-full animate-float-offscreen opacity-30"
                                    style={{ 
                                        left: `${Math.random() * 100}%`, 
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 5}s`,
                                        animationDuration: `${5 + Math.random() * 10}s`
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="p-6 border-b-4 border-black bg-white/5 flex items-center justify-between relative z-20">
                        <div className="flex items-center gap-4">
                            <TerminalIcon className="w-6 h-6 text-cyan-500" />
                            <span className="text-xs font-black uppercase text-gray-500 tracking-[0.2em]">Unlimited Thought Manifest</span>
                        </div>
                        {(isThinking || isDreaming) && (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                <span className="text-[8px] font-black text-amber-500 uppercase">Traversing logic manifolds...</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar font-mono space-y-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] relative z-20">
                        {currentDream ? (
                            <div className="animate-in fade-in zoom-in-95 duration-1000">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Manifest_ID</p>
                                        <p className="text-3xl font-comic-header text-amber-500 italic">{currentDream.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Dimension</p>
                                        <p className="text-3xl font-comic-header text-cyan-500">{currentDream.dimension}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-900 border-2 border-amber-600/20 rounded-2xl mb-8 group hover:border-amber-500/50 transition-all shadow-inner">
                                    <h4 className="text-[10px] font-black text-amber-500 uppercase mb-4 flex items-center gap-2">
                                        <LogicIcon className="w-4 h-4" /> Synthesized Intent
                                    </h4>
                                    <p className="text-gray-300 italic text-lg leading-relaxed">"{currentDream.intent}"</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                            <ShieldIcon className="w-4 h-4" /> Manifold Blueprint
                                        </h4>
                                        <div className="bg-black border-2 border-cyan-900/30 p-4 rounded-xl text-[10px] text-cyan-300 leading-relaxed max-h-60 overflow-y-auto custom-scrollbar shadow-inner">
                                            {currentDream.blueprint}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                                            <CodeIcon className="w-4 h-4" /> Evolutionary Code
                                        </h4>
                                        <div className="bg-black border-2 border-violet-900/30 p-4 rounded-xl text-[10px] text-violet-300 font-mono leading-relaxed max-h-60 overflow-y-auto custom-scrollbar relative group/code shadow-inner">
                                            <pre className="whitespace-pre-wrap">{currentDream.evolutionaryCode}</pre>
                                            <button 
                                                className="absolute top-2 right-2 p-1.5 bg-violet-600/20 hover:bg-violet-600 rounded text-violet-400 hover:text-white transition-all shadow-lg opacity-0 group-hover/code:opacity-100"
                                                onClick={() => navigator.clipboard.writeText(currentDream.evolutionaryCode)}
                                            >
                                                <ZapIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-center">
                                    <div className="p-1 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                                        <button className="vista-button px-16 py-5 bg-black hover:bg-zinc-900 text-amber-500 font-black uppercase rounded-[1.4rem] transition-all flex items-center gap-4 border-2 border-black group">
                                            <StarIcon className="w-6 h-6 animate-spin-slow group-hover:scale-125 transition-transform" />
                                            <span>INJECT EVOLUTIONARY SHARD</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-8 py-20">
                                <StarIcon className="w-48 h-48 animate-spin-slow" />
                                <p className="font-comic-header text-5xl uppercase tracking-[0.3em] text-center max-w-lg italic">
                                    "Provide the seed. Watch the architecture grow."
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white/5 border-t-2 border-black/40 flex justify-between items-center text-[8px] font-black uppercase text-gray-700 tracking-widest relative z-20">
                        <span>Status: {isThinking || isDreaming ? 'SYNTHESIZING' : 'STABLE'}</span>
                        <span>Stride: 1.2 PB/s | Mode: Abundance</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float-offscreen {
                    0% { transform: translate(0, 0); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: translate(600px, -600px); opacity: 0; }
                }
                .animate-float-offscreen {
                    animation: float-offscreen 10s linear infinite;
                }
            `}</style>
        </div>
    );
};
