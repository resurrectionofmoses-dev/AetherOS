
import React, { useState, useEffect } from 'react';
import { ledgerAuditEngine, Transaction, FraudChain } from '../services/ledgerAuditEngine';
// Added missing CheckCircleIcon import
import { 
    TerminalIcon, ShieldIcon, ActivityIcon, SearchIcon, 
    ZapIcon, WarningIcon, FireIcon, LogicIcon, ScaleIcon, CheckCircleIcon
} from './icons';
import { SonicMetric } from './SonicMetric';

export const LedgerAuditView: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [fraudChains, setFraudChains] = useState<FraudChain[]>([]);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        ledgerAuditEngine.generateMockFraudData();
        refresh();
    }, []);

    const refresh = () => {
        setTransactions(ledgerAuditEngine.getRecentTransactions());
        setFraudChains(ledgerAuditEngine.detectCircularFraud());
    };

    const runQuery8 = () => {
        setIsScanning(true);
        setTimeout(() => {
            refresh();
            setIsScanning(false);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col bg-[#020205] text-gray-200 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b-4 border-black bg-slate-900 flex justify-between items-center shadow-xl">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-red-600/10 border-4 border-red-600 rounded-xl flex items-center justify-center">
                        <ScaleIcon className="w-8 h-8 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-3xl text-white uppercase italic">LEDGER_FORENSICS</h2>
                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Recursive Chain Analysis // Protocol 0x03E2</p>
                    </div>
                </div>
                <div className="flex gap-6">
                    <SonicMetric size="sm" value={transactions.length} label="TX_POOL" unit="SHARDS" colorClass="border-cyan-600 text-cyan-500" />
                    <SonicMetric size="sm" value={fraudChains.length} label="VIOLATIONS" unit="LOOPS" colorClass="border-red-600 text-red-500" />
                    <button 
                        onClick={runQuery8}
                        disabled={isScanning}
                        className="vista-button px-8 py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center gap-2"
                    >
                        {isScanning ? <ActivityIcon className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
                        <span>RUN QUERY 8</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-6 gap-6 relative">
                {/* Left: Chain Stream */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="aero-panel bg-black/60 border-4 border-black p-6 flex flex-col flex-1 overflow-hidden shadow-[10px_10px_0_0_#000]">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                            <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <TerminalIcon className="w-4 h-4" /> Sequential Write Buffer
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 text-[10px]">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex gap-4 p-1 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
                                    <span className="text-gray-700">[{new Date(tx.timestamp).toLocaleTimeString()}]</span>
                                    <span className="text-cyan-600 font-bold w-32 truncate">{tx.from}</span>
                                    <span className="text-gray-500">→</span>
                                    <span className="text-cyan-400 font-bold w-32 truncate">{tx.to}</span>
                                    <span className="ml-auto font-mono font-black text-white">{tx.amount.toLocaleString()} CPH</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Fraud Detection Panel */}
                <div className="w-[450px] flex flex-col gap-6 overflow-hidden">
                    <div className="aero-panel bg-red-950/10 border-4 border-red-600/30 p-6 flex flex-col flex-1 shadow-[10px_10px_0_0_#000] overflow-hidden">
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-red-900/30">
                            <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <WarningIcon className="w-5 h-5 animate-bounce" /> Fraud Lattice [Query 8]
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                            {fraudChains.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-10">
                                    <CheckCircleIcon className="w-16 h-16 mb-4 text-green-500" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Circular Leakage Detected</p>
                                </div>
                            ) : (
                                fraudChains.map((chain, i) => (
                                    <div key={i} className="p-4 bg-black/80 border-2 border-red-600 rounded-2xl animate-in slide-in-from-right-4 duration-500 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-red-600 text-black text-[8px] font-black px-2 py-0.5 uppercase">Leak Detected</div>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">ROUNDTRIP_FRAUD</span>
                                        </div>
                                        <p className="text-[11px] font-mono text-white leading-relaxed mb-4 bg-red-900/10 p-2 rounded-lg border border-red-900/20">
                                            {chain.path}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-2 bg-black border border-white/5 rounded-xl">
                                                <p className="text-[7px] text-gray-600 uppercase font-black">Starting Shard</p>
                                                <p className="text-sm font-bold text-gray-300">{chain.startAmount} CPH</p>
                                            </div>
                                            <div className="p-2 bg-black border border-white/5 rounded-xl">
                                                <p className="text-[7px] text-gray-600 uppercase font-black">Ending Shard</p>
                                                <p className="text-sm font-bold text-white">{chain.endAmount} CPH</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-red-900/30 flex justify-between items-center">
                                            <span className="text-[8px] font-black text-red-600 uppercase animate-pulse">Created Value:</span>
                                            <span className="text-xl font-comic-header text-red-500">+{chain.leakage} CPH</span>
                                        </div>
                                    </div>
                                )).reverse()
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-900 border-4 border-black rounded-3xl shadow-[6px_6px_0_0_#000]">
                         <p className="text-[9px] text-gray-500 font-mono italic leading-relaxed">
                            [MAESTRO_FORENSICS]: "Query 8 follows the recursive chain of intent. When the end exceeds the origin in a closed loop, the system is witnessing voodoo value creation. Neutralize immediately."
                         </p>
                    </div>
                </div>
            </div>

            {/* Matrix Footer */}
            <div className="p-2 bg-slate-900 border-t-8 border-black flex justify-between items-center px-8 z-40">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">Detection Engine: ACTIVE</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase hidden sm:block">
                      Recursive Depth: UNLIMITED | Merkle Proof: 0x03E2_VAL | Stride: 1.2 PB/S
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.5em] hidden sm:block">
                   conjunction reliable series | absolute authority
                </div>
            </div>
        </div>
    );
};
