
import React, { useState, useEffect } from 'react';
import { cellularEngine, QuantumCycleState } from '../services/cellularEngine';
import { HexMetric } from './HexMetric';
import { ShieldIcon, FireIcon, ActivityIcon, ZapIcon } from './icons';

interface CellNode {
    id: string;
    cph: number;
    atp: number;
    generation: number;
}

export const CellularGrid: React.FC = () => {
    const [cycle, setCycle] = useState<QuantumCycleState>(cellularEngine.getState());
    const [cells, setCells] = useState<CellNode[]>([{ id: 'genesis', cph: 100, atp: 1000, generation: 0 }]);

    useEffect(() => {
        const unsubscribe = cellularEngine.subscribe(state => {
            setCycle(state);
            
            // Mitosis Trigger: Phase M completes (progress > 95)
            if (state.phase === 'M' && state.progress > 90) {
                setCells(prev => {
                    if (prev.length > 20) return prev; // Capacity cap
                    const next: CellNode[] = [];
                    prev.forEach(cell => {
                        const halfCph = Math.floor(cell.cph / 2);
                        if (halfCph < 1) {
                            next.push(cell); // Cannot divide further
                        } else {
                            next.push(
                                { id: cell.id + '_A', cph: halfCph, atp: halfCph * 10, generation: cell.generation + 1 },
                                { id: cell.id + '_B', cph: halfCph, atp: halfCph * 10, generation: cell.generation + 1 }
                            );
                        }
                    });
                    return next;
                });
            }
        });
        return unsubscribe;
    }, []);

    return (
        <div className="h-full flex flex-col bg-[#05050a] text-gray-200 font-mono overflow-hidden">
            {/* Cycle Header */}
            <div className="p-4 border-b-4 border-black bg-slate-900 flex justify-between items-center shadow-xl">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-red-600/10 border-4 border-red-600 rounded-xl flex items-center justify-center">
                        <FireIcon className="w-8 h-8 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-3xl text-white uppercase italic">PHASE_{cycle.phase}</h2>
                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{cycle.explanation}</p>
                    </div>
                </div>
                <div className="flex gap-10">
                    <div className="text-right">
                        <p className="text-[8px] text-gray-600 font-black uppercase">Phase Logic</p>
                        <p className="text-xl font-comic-header text-cyan-500">{cycle.conductance > 0 ? '+' : ''}{cycle.conductance} Hz</p>
                    </div>
                    <div className="w-48 h-3 bg-black border-2 border-zinc-800 rounded-full overflow-hidden p-0.5">
                        <div 
                            className="h-full bg-red-600 transition-all duration-100" 
                            style={{ width: `${cycle.progress}%` }} 
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 content-start">
                    {cells.map(cell => (
                        <div key={cell.id} className="aero-panel bg-black/40 border-2 border-zinc-800 p-4 rounded-3xl flex flex-col items-center group hover:border-cyan-600 transition-all shadow-[6px_6px_0_0_#000]">
                            <div className="relative mb-3">
                                <HexMetric size="sm" value={cell.cph} colorClass="border-amber-600 text-amber-500" glow={cycle.phase === 'M'} />
                                <div className="absolute -top-1 -right-1">
                                    <div className="px-1.5 py-0.5 bg-black border border-white/10 rounded text-[6px] font-black text-gray-500">G{cell.generation}</div>
                                </div>
                            </div>
                            <div className="w-full space-y-1">
                                <div className="flex justify-between text-[6px] font-black text-gray-600 uppercase">
                                    <span>ATP Energy</span>
                                    <span>{cell.atp}</span>
                                </div>
                                <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-600" style={{ width: `${Math.min(100, cell.atp/10)}%` }} />
                                </div>
                            </div>
                            <div className="mt-3 flex justify-center gap-1">
                                {['DNA', 'MEM', 'MIT'].map(org => (
                                    <div key={org} className="w-1.5 h-1.5 rounded-sm bg-zinc-800 group-hover:bg-cyan-900 transition-colors" />
                                ))}
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={() => setCells([{ id: 'genesis_' + Date.now(), cph: 100, atp: 1000, generation: 0 }])}
                        className="p-4 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                    >
                        <ZapIcon className="w-6 h-6 mb-2" />
                        <span className="text-[8px] font-black uppercase">Reset Genesis</span>
                    </button>
                </div>
            </div>

            {/* Matrix Footer */}
            <div className="p-2 bg-slate-900 border-t-4 border-black flex justify-between items-center px-8">
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black text-gray-600 uppercase">Conservation: 100 = {cells.reduce((a,b) => a+b.cph, 0)} ✓</span>
                    <div className="h-4 w-px bg-white/5" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">7 - 7 + 7 = 8 Manifold</span>
                </div>
                <div className="text-[10px] text-gray-700 font-black italic">Fight to come out alive.</div>
            </div>
        </div>
    );
};
