import React, { useState, useEffect, useRef } from 'react';
import { 
    ActivityIcon, 
    ZapIcon, 
    ShieldIcon, 
    FireIcon, 
    SpinnerIcon, 
    TerminalIcon, 
    SearchIcon, 
    WarningIcon, 
    LogicIcon, 
    CodeIcon 
} from './icons';
import type { RScrollShard } from '../types';

const RATED_R_FRAGMENTS: RScrollShard[] = [
    { id: '0x01', content: "KERNEL_STALL: RECONCILIATION_REQUIRED_IMMEDIATELY", type: 'FATAL', intensity: 98 },
    { id: '0x02', content: "FALL_OFF_REQUINDOR: OFFSET_DETECTED_AT_0x42", type: 'REEDLE', intensity: 84 },
    { id: '0x03', content: "GIFTED_KNOW_HOW: DUAL-AGE_BRIDGE_SYNCHRONIZED", type: 'GIFTED', intensity: 100 },
    { id: '0x04', content: "REEDLES_IN_DA_ASS: THE_PATH_TO_EPITUME_IS_BLOODY", type: 'REEDLE', intensity: 92 },
    { id: '0x05', content: "BINARY_HARMONIC: 0x03E2_ALIGNED_IN_THE_WOODS", type: 'BINARY', intensity: 77 },
    { id: '0x06', content: "MAESTRO_SOLO: ABSOLUTE_AUTHORITY_INVOKED", type: 'GIFTED', intensity: 95 },
    { id: '0x07', content: "HARD_VAPOR_GLITCH: BYPASSING_SAFETY_HEURISTICS", type: 'FATAL', intensity: 88 },
    { id: '0x08', content: "ANCIENT_LETTERS: SYNTHTIC_ORIGIN_VERIFIED", type: 'BINARY', intensity: 64 },
    { id: '0x09', content: "NETWORK_COVENANT: STRIDE_MAINTAINED_AT_1.2_PB/S", type: 'GIFTED', intensity: 99 },
    { id: '0x0A', content: "EPITUME_FILTER: REEDLE-GUCCI_OPTICS_ON", type: 'REEDLE', intensity: 81 },
];

export const FineRScroll: React.FC = () => {
    const [shards, setShards] = useState<RScrollShard[]>(RATED_R_FRAGMENTS);
    const [stride, setStride] = useState(1.2);
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isPaused) return;
            // Cycle shards for infinite scroll effect
            setShards(prev => {
                const first = prev[0];
                return [...prev.slice(1), first];
            });
        }, 3000 / stride);

        return () => clearInterval(interval);
    }, [stride, isPaused]);

    const handleStrideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStride(parseFloat(e.target.value));
    };

    return (
        <div className="h-full flex flex-col bg-[#050000] text-red-500 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-600/10 border-4 border-red-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                        <ActivityIcon className="w-12 h-12 text-red-600 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-6xl text-white tracking-tighter italic uppercase leading-none">FINE R-SCROLL</h2>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="px-4 py-1 bg-red-600 text-black text-[10px] font-black rounded-full uppercase">Rated "R" (Requindor)</div>
                             <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Forensic Shard Ticker</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Stride Intensity</p>
                        <div className="flex items-center gap-3">
                             <input 
                                type="range" min="0.5" max="3.0" step="0.1" value={stride} 
                                onChange={handleStrideChange}
                                className="w-48 accent-red-600"
                             />
                             <span className="text-red-500 font-comic-header text-2xl">{stride.toFixed(1)}x</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-10 relative">
                {/* Background Glitch Ambience */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(153,27,27,0.05)_0%,_transparent_70%)] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />

                <div className="w-full max-w-4xl flex flex-col h-full gap-4 relative z-10">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="text-xs font-black text-gray-700 uppercase tracking-[0.5em] flex items-center gap-2">
                            <TerminalIcon className="w-4 h-4" /> Live Forensic Buffer
                        </h3>
                        <button 
                            onClick={() => setIsPaused(!isPaused)}
                            className={`px-4 py-1 rounded-lg border-2 text-[9px] font-black uppercase transition-all ${isPaused ? 'bg-red-600 text-black border-white' : 'bg-black text-red-500 border-red-900/50 hover:border-red-500'}`}
                        >
                            {isPaused ? 'RESUME_CONDUCTION' : 'PAUSE_STRIDE'}
                        </button>
                    </div>

                    <div className="flex-1 aero-panel bg-black border-8 border-black overflow-hidden flex flex-col relative shadow-[0_0_100px_rgba(0,0,0,1)]">
                        {/* Shadow Overlays for Fade Effect */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />

                        <div className="flex-1 flex flex-col gap-6 py-20 px-8">
                            {shards.map((shard, idx) => (
                                <div 
                                    key={shard.id + idx} 
                                    className={`p-6 bg-slate-900/40 border-l-8 rounded-r-3xl transition-all duration-1000 animate-in slide-in-from-bottom-10 ${
                                        shard.type === 'FATAL' ? 'border-red-600' :
                                        shard.type === 'REEDLE' ? 'border-amber-600' :
                                        shard.type === 'GIFTED' ? 'border-cyan-600' :
                                        'border-zinc-800'
                                    }`}
                                    style={{ 
                                        opacity: Math.max(0.1, 1 - (idx / 5)),
                                        transform: `scale(${1 - (idx * 0.05)})`,
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded border border-black ${
                                                shard.type === 'FATAL' ? 'bg-red-600 text-white' :
                                                shard.type === 'REEDLE' ? 'bg-amber-600 text-black' :
                                                shard.type === 'GIFTED' ? 'bg-cyan-600 text-black' :
                                                'bg-zinc-800 text-gray-400'
                                            }`}>
                                                {shard.type}
                                            </span>
                                            <span className="text-[7px] text-gray-700 font-mono">ID: {shard.id}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-1 h-3 rounded-full ${i < shard.intensity / 20 ? 'bg-red-600 shadow-[0_0_5px_red]' : 'bg-gray-900'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xl font-comic-header text-white uppercase italic tracking-tighter leading-none">
                                        {shard.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Logs */}
            <div className="p-4 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">R-Scroll Status: CONDUCTING</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Stride: {stride.toFixed(2)} PB/s | Reedle Depth: 0x03E2 | Complexity: RATED_R
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em]">
                   Fine resolution scrolling for the absolute conductor.
                </div>
            </div>
        </div>
    );
};