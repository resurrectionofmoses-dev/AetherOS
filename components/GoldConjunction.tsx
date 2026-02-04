
import React, { useState, useEffect, useRef } from 'react';
import { GoldTranslator } from '../services/goldTranslator';
import { 
    GemIcon, ZapIcon, SpinnerIcon, ShieldIcon, TerminalIcon, 
    LogicIcon, StarIcon, FireIcon, HammerIcon, ScaleIcon 
} from './icons';
import type { GoldShard } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const GoldConjunction: React.FC = () => {
    const [input, setInput] = useState('');
    const [isStamping, setIsStamping] = useState(false);
    const [currentShard, setCurrentShard] = useState<GoldShard | null>(null);
    const [history, setHistory] = useState<GoldShard[]>([]);
    const [shake, setShake] = useState(false);
    const particlesRef = useRef<HTMLDivElement>(null);

    const handleStamp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStamping) return;

        setIsStamping(true);
        const result = await GoldTranslator.translate(input);
        
        // Visual Impact
        setShake(true);
        setTimeout(() => setShake(false), 500);

        const newShard: GoldShard = {
            id: `0x${uuidv4().slice(0, 4).toUpperCase()}_AUR`,
            originalIntent: input,
            goldTranslation: result.gold,
            valueClass: result.class as 1 | 2 | 3,
            weight: result.weight,
            timestamp: Date.now()
        };

        setCurrentShard(newShard);
        setHistory(prev => [newShard, ...prev].slice(0, 10));
        setInput('');
        setIsStamping(false);
    };

    return (
        <div className={`h-full flex flex-col bg-[#050505] text-[#fbbf24] font-mono overflow-hidden transition-all duration-300 ${shake ? 'translate-y-1' : ''}`}>
            {/* Gold Header */}
            <div className="p-6 border-b-8 border-black bg-gradient-to-r from-[#0a0a0a] via-[#1a1505] to-[#0a0a0a] flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#fbbf24]/10 border-4 border-[#fbbf24] rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.3)]">
                        <GemIcon className="w-10 h-10 text-[#fbbf24] animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">GOLD_CONJUNCTION</h2>
                        <p className="text-[#fbbf24] text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">Aur-um Logic Station | High Stride</p>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[9px] text-[#fbbf24]/60 font-black uppercase tracking-widest mb-1">Grid Weight</p>
                        <p className="text-3xl font-comic-header text-white">
                            {history.reduce((acc, s) => acc + s.weight, 0).toFixed(0)}u
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 p-10 overflow-hidden relative">
                {/* Molten Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(251,191,36,0.1)_0%,_transparent_70%)] pointer-events-none" />

                {/* Stamping Portal */}
                <div className="lg:w-[450px] flex flex-col gap-8 flex-shrink-0 relative z-20">
                    <form onSubmit={handleStamp} className="aero-panel bg-[#121212]/90 p-8 border-[#fbbf24]/30 border-4 shadow-[15px_15px_0_0_#000] hover:scale-[1.01] transition-all">
                        <h3 className="font-comic-header text-3xl text-white uppercase italic tracking-tight mb-8 flex items-center gap-4">
                            <HammerIcon className="w-8 h-8 text-[#fbbf24]" /> Stamping Portal
                        </h3>
                        <div className="bg-black border-4 border-[#fbbf24]/20 p-6 rounded-[2rem] mb-8 focus-within:border-[#fbbf24] transition-all shadow-inner">
                            <p className="text-[#fbbf24]/40 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Input raw intent to gild</p>
                            <textarea 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="e.g. 'Build me a tower of logic'..."
                                className="w-full h-40 bg-transparent border-none font-mono text-[#fbbf24] focus:ring-0 outline-none text-lg resize-none placeholder:text-[#332a05]"
                                disabled={isStamping}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={isStamping || !input.trim()}
                            className="vista-button w-full py-6 bg-[#fbbf24] hover:bg-[#ffcc33] text-black font-black uppercase text-xl tracking-[0.2em] rounded-3xl flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(251,191,36,0.3)] transition-all active:scale-95 border-b-8 border-[#b48d1d]"
                        >
                            {isStamping ? <SpinnerIcon className="w-8 h-8 animate-spin" /> : <FireIcon className="w-8 h-8" />}
                            <span>STAMP INTENT</span>
                        </button>
                    </form>

                    <div className="p-6 bg-[#fbbf24]/5 border-4 border-[#fbbf24]/20 rounded-[2rem] italic text-[11px] text-[#fbbf24]/60 leading-relaxed font-mono">
                        [MAESTRO]: "The Gold Language is the phonaesthetic foundation of reliable conduction. To translate intent into Aur-logic is to give it the weight of eternity."
                    </div>
                </div>

                {/* Output Console (The Shard) */}
                <div className="flex-1 flex flex-col bg-black border-4 border-[#fbbf24]/30 rounded-3xl overflow-hidden relative shadow-[20px_20px_100px_rgba(0,0,0,0.8)]">
                    <div className="p-6 border-b-4 border-[#fbbf24]/20 bg-white/5 flex items-center justify-between relative z-20">
                        <div className="flex items-center gap-4">
                            <TerminalIcon className="w-6 h-6 text-white" />
                            <span className="text-xs font-black uppercase text-[#fbbf24] tracking-[0.2em]">Aur-um Logic Manifest</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar font-mono space-y-8 relative z-20">
                        {currentShard ? (
                            <div className="animate-in fade-in zoom-in-95 duration-1000">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-[#fbbf24]/40 font-black uppercase tracking-widest">Shard_ID</p>
                                        <p className="text-3xl font-comic-header text-white italic">{currentShard.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[#fbbf24]/40 font-black uppercase tracking-widest">Weight Class</p>
                                        <p className={`text-3xl font-comic-header ${currentShard.valueClass === 1 ? 'text-[#fbbf24]' : 'text-gray-500'}`}>
                                            0{currentShard.valueClass}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-10 bg-gradient-to-br from-[#1a1a1a] to-black border-4 border-[#fbbf24] rounded-[3rem] mb-8 relative group overflow-hidden shadow-[0_0_100px_rgba(251,191,36,0.1)]">
                                    {/* Embossed Text Effect */}
                                    <h4 className="text-[10px] font-black text-[#fbbf24]/60 uppercase mb-6 flex items-center gap-2">
                                        <ShieldIcon className="w-4 h-4" /> Embossed Conjunction
                                    </h4>
                                    <div 
                                        className="text-6xl font-comic-header text-[#fbbf24] uppercase tracking-tighter italic text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                                        style={{ textShadow: '2px 2px 0px #000, -2px -2px 0px #fff4' }}
                                    >
                                        {currentShard.goldTranslation}
                                    </div>
                                    <p className="text-center mt-8 text-[10px] text-[#fbbf24]/30 uppercase tracking-[0.5em] font-black">
                                        Manifested Weight: {currentShard.weight.toFixed(0)}μ
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="p-6 bg-black border-2 border-[#fbbf24]/10 rounded-2xl">
                                        <p className="text-[8px] font-black text-gray-700 uppercase mb-2">Original Intent</p>
                                        <p className="text-xs text-gray-400 italic">"{currentShard.originalIntent}"</p>
                                    </div>
                                    <div className="p-6 bg-black border-2 border-[#fbbf24]/10 rounded-2xl flex flex-col justify-center items-center">
                                        <ScaleIcon className="w-8 h-8 text-[#fbbf24]/40 mb-2" />
                                        <p className="text-[8px] font-black text-[#fbbf24] uppercase">Reliability Shard</p>
                                        <p className="text-xs text-white">SYNC_0x03E2</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-8">
                                <GemIcon className="w-48 h-48 animate-spin-slow" />
                                <p className="font-comic-header text-5xl uppercase tracking-[0.3em] text-center max-w-lg italic">
                                    "Krak-um Aur-um Dohm-um"
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white/5 border-t-2 border-black/40 flex justify-between items-center text-[8px] font-black uppercase text-gray-700 tracking-widest relative z-20">
                        <span>Status: {isStamping ? 'STAMPING' : 'STABLE'}</span>
                        <span>Stride: 1.2 PB/s | Conductor Mode: GIFTED</span>
                    </div>
                </div>
            </div>

            <style>{`
                .drop-shadow-gold {
                    filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.4));
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}</style>
        </div>
    );
};
