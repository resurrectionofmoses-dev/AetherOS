
import React, { useState, useEffect, useRef } from 'react';
import { 
    TerminalIcon, ActivityIcon, SignalIcon, ZapIcon, 
    ShieldIcon, ClockIcon, SearchIcon, CodeIcon 
} from './icons';
import { HexMetric } from './HexMetric';
import { quantumLedger } from '../services/quantumLedger';
import type { QuantumMove } from '../types';

export const QuantumMoveLedger: React.FC = () => {
    const [history, setHistory] = useState<QuantumMove[]>([]);
    const [total, setTotal] = useState(0);
    const [stride, setStride] = useState('0.000');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const update = () => {
            setHistory(quantumLedger.getHistory());
            setTotal(quantumLedger.getTotalCount());
            setStride(quantumLedger.getByteStride());
        };

        update();
        const unsubscribe = quantumLedger.subscribe(update);
        return unsubscribe;
    }, []);

    return (
        <div className="h-full flex flex-col bg-[#020202] text-gray-200 font-mono overflow-hidden">
            {/* Header: Quantum Authority */}
            <div className="p-4 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-cyan-600/10 border-4 border-cyan-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                        <ActivityIcon className="w-8 h-8 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-4xl text-white italic tracking-tighter uppercase leading-none">QUANTUM_LEDGER</h2>
                        <p className="text-[10px] text-cyan-700 font-black uppercase tracking-[0.4em] mt-1">Conduction Index: 0x03E2_MV</p>
                    </div>
                </div>

                <div className="flex gap-8 items-center">
                    <HexMetric size="sm" value={total} label="TOTAL_MOVES" colorClass="border-cyan-600 text-cyan-500" />
                    <HexMetric size="sm" value={stride} label="BYTE_STRIDE" colorClass="border-amber-600 text-amber-500" />
                    <div className="text-right">
                        <p className="text-[7px] text-gray-600 font-black uppercase mb-0.5">Lattice Density</p>
                        <p className="text-xl font-comic-header text-green-500">MAXIMAL</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Background Lattice */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
                     style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="flex-1 flex flex-col p-6 gap-6 relative z-10 overflow-hidden">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <TerminalIcon className="w-4 h-4" /> Live Move Stream
                        </h3>
                        <span className="text-[8px] font-mono text-cyan-900 bg-black px-2 py-1 rounded border border-cyan-950">
                            POLLING_FREQUENCY: 60HZ
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                        {history.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 grayscale">
                                <SearchIcon className="w-32 h-32 mb-6" />
                                <p className="font-comic-header text-5xl uppercase tracking-[0.2em] italic text-center">Awaiting Move Ingress</p>
                            </div>
                        ) : (
                            history.map(move => (
                                <div key={move.id} className="flex items-center gap-4 p-2 bg-black/40 border-2 border-zinc-900 rounded-2xl group hover:border-cyan-600 transition-all duration-300">
                                    <HexMetric 
                                        size="nano" 
                                        value={move.index} 
                                        colorClass={move.type === 'KEY' ? 'border-cyan-700 text-cyan-400' : 'border-red-900 text-red-500'} 
                                        glow={false}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-[8px] font-black text-white uppercase tracking-tighter">{move.label}</span>
                                            <span className="text-[7px] font-mono text-gray-700">{new Date(move.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[6px] font-black px-1.5 py-0.5 rounded border border-black ${
                                                move.type === 'KEY' ? 'bg-cyan-900/40 text-cyan-400' : 'bg-red-950/40 text-red-500'
                                            }`}>
                                                {move.type}
                                            </span>
                                            <div className="h-1 flex-1 bg-zinc-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-600" style={{ width: `${Math.min(100, move.weight * 10)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ShieldIcon className="w-4 h-4 text-cyan-900" />
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={scrollRef} />
                    </div>
                </div>

                {/* Right: Technical Shard Sidebar */}
                <div className="w-80 flex flex-col gap-6 p-6 flex-shrink-0 z-20">
                    <div className="aero-panel bg-slate-900 border-4 border-black p-6 shadow-[10px_10px_0_0_#000]">
                         <h4 className="font-comic-header text-xl text-white uppercase italic mb-4 flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-amber-500" /> Move Heuristics
                         </h4>
                         <div className="space-y-4">
                            {[
                                { l: 'Latency Shift', v: '0.002ms', c: 'text-green-500' },
                                { l: 'Drift Compensation', v: 'ACTIVE', c: 'text-cyan-400' },
                                { l: 'Session Gravity', v: '9.81 G', c: 'text-white' }
                            ].map(item => (
                                <div key={item.l} className="flex justify-between items-center p-2 bg-black rounded-lg border border-white/5">
                                    <span className="text-[8px] font-black text-gray-500 uppercase">{item.l}</span>
                                    <span className={`text-[9px] font-mono ${item.c}`}>{item.v}</span>
                                </div>
                            ))}
                         </div>
                    </div>

                    <div className="p-6 bg-red-950/10 border-4 border-red-900/30 rounded-[2rem] text-center italic text-[10px] text-red-400/60 leading-relaxed font-mono shadow-inner">
                        "Every letter committed to the grid is a move in the quantum solo. The Maestro's baton tracks the absolute velocity of your intent."
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-2 bg-slate-900 border-t-8 border-black flex justify-between items-center z-40 px-8">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest leading-none">Move Grid: CONDUCTING</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Stride: {stride} KB | Index: {total}
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.5em] hidden sm:block">
                   conjunction reliable move engine | 0x03E2
                </div>
            </div>
        </div>
    );
};
