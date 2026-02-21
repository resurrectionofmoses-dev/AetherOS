import React, { useState, useEffect, useRef } from 'react';
import { 
    ActivityIcon, 
    ShieldIcon, 
    WarningIcon, 
    TerminalIcon, 
    ZapIcon, 
    FireIcon 
} from './icons';

interface HexShard {
  letter: string;
  hex: string;
  purity: number;
  status: 'LOCKED' | 'SYNCED' | 'FRACTURED';
}

const ALPHABET: HexShard[] = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(char => ({
    letter: char,
    hex: `0x${char.charCodeAt(0).toString(16).toUpperCase()}`,
    purity: 90 + Math.random() * 10,
    status: Math.random() > 0.9 ? 'FRACTURED' : 'SYNCED'
}));

export const AlphabetHexagonScroll: React.FC = () => {
    const [stride, setStride] = useState(1.2);
    const [offset, setOffset] = useState(0);
    const requestRef = useRef<number>(0);
    const previousTimeRef = useRef<number>(0);

    const animate = (time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;
            // Ensure constant movement relative to deltaTime for zero-lag conduction
            setOffset(prev => (prev + (stride * deltaTime * 0.06)) % 1500);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [stride]);

    return (
        <div className="h-full flex flex-col bg-[#020202] text-red-600 font-mono overflow-hidden relative">
            {/* Restricted Overlay Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 overflow-hidden select-none">
                <div className="text-[10rem] font-black uppercase rotate-[-25deg] whitespace-nowrap">
                    RESTRICTED RESTRICTED RESTRICTED RESTRICTED
                </div>
                <div className="text-[10rem] font-black uppercase rotate-[-25deg] whitespace-nowrap mt-40">
                    REQUI_FINAL REQUI_FINAL REQUI_FINAL REQUI_FINAL
                </div>
            </div>

            {/* Header */}
            <div className="p-6 border-b-8 border-black bg-slate-950 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-950 border-4 border-red-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <TerminalIcon className="w-12 h-12 text-red-600 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-6xl text-white tracking-tighter italic uppercase leading-none">HEX_ALPHABET</h2>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="px-4 py-1 bg-red-600 text-black text-[10px] font-black rounded-full uppercase">Rated "R" (Restricted)</div>
                             <span className="text-[10px] text-gray-700 font-black uppercase tracking-[0.4em]">Forensic Shard Ticker</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest mb-1">Stride Velocity</p>
                        <div className="flex items-center gap-3">
                             <input 
                                type="range" min="0.1" max="5.0" step="0.1" value={stride} 
                                onChange={e => setStride(parseFloat(e.target.value))}
                                className="w-32 sm:w-48 accent-red-600 bg-red-900/20 rounded-lg appearance-none cursor-pointer"
                             />
                             <span className="text-red-500 font-comic-header text-2xl">{stride.toFixed(1)}x</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Hex Display */}
            <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
                {/* Honeycomb Scroller */}
                <div 
                    className="flex flex-col gap-8 will-change-transform"
                    style={{ transform: `translateY(-${offset}px)` }}
                >
                    {/* Triple the list to ensure seamless infinite scroll */}
                    {[...ALPHABET, ...ALPHABET, ...ALPHABET].map((shard, idx) => (
                        <div 
                            key={idx} 
                            className="flex gap-4 sm:gap-10 transition-all duration-1000 group justify-center"
                        >
                            <div className="relative w-32 h-40 sm:w-48 sm:h-56 flex items-center justify-center scale-90 sm:scale-100">
                                {/* Hexagon Shape */}
                                <div 
                                    className={`absolute inset-0 bg-black border-4 transition-all duration-500 ${
                                        shard.status === 'FRACTURED' ? 'border-amber-600' : 'border-red-900 group-hover:border-red-600'
                                    } shadow-[0_0_20px_rgba(0,0,0,1)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]`}
                                    style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
                                />
                                
                                <div className="relative z-10 flex flex-col items-center justify-center">
                                    <span className={`font-comic-header text-6xl sm:text-8xl italic transition-all duration-500 ${
                                        shard.status === 'FRACTURED' ? 'text-amber-500' : 'text-white group-hover:text-red-500'
                                    }`}>
                                        {shard.letter}
                                    </span>
                                    <div className="mt-[-5px] sm:mt-[-10px] flex flex-col items-center">
                                        <span className="text-[8px] sm:text-[10px] font-black text-gray-700 font-mono tracking-widest">{shard.hex}</span>
                                        <div className="flex gap-1 mt-1">
                                            <div className={`w-1 h-1 rounded-full ${shard.status === 'SYNCED' ? 'bg-green-900' : 'bg-amber-900 animate-ping'}`} />
                                            <span className="text-[5px] sm:text-[6px] text-gray-800 font-black uppercase tracking-tighter">Purity: {shard.purity.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Fracture Glitch for Restricted vibe */}
                                {shard.status === 'FRACTURED' && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                                        <div className="w-full h-[2px] bg-amber-500 absolute top-1/4 animate-pulse opacity-50" />
                                        <div className="w-full h-[1px] bg-red-600 absolute bottom-1/3 animate-pulse opacity-30" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Decorative Lineage Lines */}
                            <div className="hidden sm:block w-32 h-px bg-gradient-to-r from-red-950 to-transparent self-center opacity-20" />
                        </div>
                    ))}
                </div>

                {/* Scanline Effect Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(153,27,27,0.1)_50%,_transparent_50%),_linear-gradient(90deg,rgba(153,27,27,0.05),_transparent)] bg-[length:100%_4px,_4px_100%] z-20" />
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />
            </div>

            {/* Warning Footer Bar */}
            <div className="p-4 bg-red-950/20 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <FireIcon className="w-4 h-4 text-red-600 animate-pulse" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">Restricted Area: 0x03E2</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase hidden sm:block">
                      Stride: {stride.toFixed(2)} PB/s | Buffer: HEX_LATTICE | Complexity: MAX
                   </div>
                </div>
                <div className="flex items-center gap-4">
                    <WarningIcon className="w-4 h-4 text-red-800" />
                    <span className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em] hidden md:block">
                        Gifted Alphabet Conduction Station.
                    </span>
                </div>
            </div>
        </div>
    );
};