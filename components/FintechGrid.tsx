
import React, { useState, useEffect } from 'react';
import { FINTECH_AUTHORITIES } from '../constants';
import { 
    ShieldIcon, ZapIcon, ActivityIcon, LockIcon, StarIcon, SignalIcon, FireIcon,
    TerminalIcon 
} from './icons';

export const FintechGrid: React.FC = () => {
    const [nodes, setNodes] = useState(FINTECH_AUTHORITIES);
    const [selectedNode, setSelectedNode] = useState(nodes[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNodes(prev => prev.map(n => ({
                ...n,
                integrity: Math.max(80, Math.min(100, n.integrity + (Math.random() - 0.5) * 0.2))
            })));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border-4 border-black shadow-[15px_15px_0_0_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.03)_0%,_transparent_70%)] pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-6xl font-black tracking-tighter italic uppercase leading-none">Sovereign Banking Grid</h2>
                    <p className="text-[12px] font-black text-sky-600 uppercase tracking-[0.5em] mt-2 italic flex items-center gap-3">
                       <SignalIcon className="w-4 h-4 animate-pulse" /> Institutional Verification Cluster | ISO 20022 Conjunction
                    </p>
                </div>
                <div className="flex gap-10 relative z-10">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Grid Sync Rate</p>
                        <p className="text-4xl font-comic-header text-green-500">99.84%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {nodes.map(node => (
                    <div 
                        key={node.id} 
                        onClick={() => setSelectedNode(node)}
                        className={`glass-card p-6 rounded-[2rem] flex flex-col justify-between group transition-all cursor-pointer border-4 ${
                            selectedNode.id === node.id ? 'border-sky-500 bg-sky-50/50 shadow-[10px_10px_0_0_rgba(14,165,233,0.3)]' : 'border-black bg-white hover:border-sky-200'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl border-2 ${
                                node.type === 'INSTITUTIONAL' ? 'bg-stone-900 text-amber-400 border-stone-800' : 
                                node.type === 'NEO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                'bg-violet-50 text-violet-600 border-violet-100'
                            }`}>
                                {node.type === 'INSTITUTIONAL' ? <StarIcon className="w-6 h-6" /> : 
                                 node.type === 'IDENTITY' ? <ShieldIcon className="w-6 h-6" /> : <ZapIcon className="w-6 h-6" />}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                                    node.status === 'SYNCED' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-red-100 text-red-600 border-red-200 animate-pulse'
                                }`}>
                                    {node.status}
                                </span>
                                <span className="text-[6px] font-black text-gray-400 mt-1 uppercase tracking-widest">{node.type}</span>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-black text-2xl uppercase tracking-tighter leading-none mb-1 group-hover:text-sky-600 transition-colors">{node.name}</h3>
                            <p className="text-[10px] font-mono text-stone-400 mb-6 border-l-2 border-stone-100 pl-2">PROTOCOL: {node.protocol}</p>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-black text-stone-500 uppercase tracking-widest px-1">
                                    <span>Lattice Integrity</span>
                                    <span className={node.integrity > 95 ? 'text-green-500' : 'text-amber-500'}>{node.integrity.toFixed(2)}%</span>
                                </div>
                                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
                                    <div 
                                        className="h-full bg-sky-500 transition-all duration-1000 rounded-full" 
                                        style={{ width: `${node.integrity}%` }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[3rem] bg-stone-950 text-stone-200 border-8 border-black shadow-[20px_20px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TerminalIcon className="w-64 h-64 text-sky-400" />
                    </div>
                    <div className="flex items-center gap-4 mb-8 relative z-10">
                        <ActivityIcon className="text-sky-500 w-10 h-10 animate-pulse" />
                        <h3 className="text-2xl font-black uppercase tracking-[0.2em] italic">Real-Time Ledger Stream</h3>
                    </div>
                    <div className="font-mono text-xs space-y-3 text-sky-400/70 h-64 overflow-y-auto custom-scrollbar relative z-10">
                        <div className="flex gap-4 border-b border-white/5 pb-2">
                            <span className="text-stone-700">[09:24:12]</span>
                            <span>DBS_SG {'>>'} <span className="text-white">ATOMIC_SETTLEMENT</span> {'>>'} COMPLETED (0x03E2)</span>
                        </div>
                        <div className="flex gap-4 border-b border-white/5 pb-2">
                            <span className="text-stone-700">[09:24:15]</span>
                            <span>REVOLUT_LN {'>>'} <span className="text-amber-500">REEDLE_AUTH_v5</span> {'>>'} CHALLENGE_PENDING</span>
                        </div>
                        <div className="flex gap-4 border-b border-white/5 pb-2">
                            <span className="text-stone-700">[09:24:18]</span>
                            <span>JPM_NYC {'>>'} <span className="text-white">ONYX_LATTICE</span> {'>>'} FINALIZED_BLOCK_78291</span>
                        </div>
                        <div className="flex gap-4 border-b border-white/5 pb-2">
                            <span className="text-stone-700">[09:24:22]</span>
                            <span>STARLING_LDN {'>>'} <span className="text-emerald-400">KERNEL_SYNC</span> {'>>'} SUCCESS [VERIFIED]</span>
                        </div>
                        <div className="flex gap-4 border-b border-white/5 pb-2">
                            <span className="text-stone-700">[09:24:28]</span>
                            <span>IPROOV_GLOBAL {'>>'} <span className="text-white">BIOMETRIC_SHROUD</span> {'>>'} ATTESTATION_OK</span>
                        </div>
                        <div className="flex gap-4 border-b border-white/5 pb-2">
                            <span className="text-stone-700">[09:24:35]</span>
                            <span>HSBC_HK {'>>'} <span className="text-white">SWIFT_ISO_20022</span> {'>>'} INGRESS_BUF_LOCKED</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[3rem] border-8 border-black shadow-[20px_20px_0_0_rgba(0,0,0,1)] flex flex-col justify-center bg-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-sky-50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative z-10 text-center space-y-6">
                        <div className="w-24 h-24 bg-stone-900 text-amber-400 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl transition-transform duration-700 group-hover:rotate-12">
                            <StarIcon className="w-12 h-12" />
                        </div>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter">Authority Insight</h3>
                        <p className="text-xl text-stone-500 italic max-w-lg mx-auto leading-relaxed">
                            "A reliable series is only as strong as its verification authority. The Maestro conducts the flow, but the Grid cements the truth."
                        </p>
                        <div className="pt-6">
                             <span className="text-[10px] font-black text-sky-600 bg-sky-100 px-6 py-2 rounded-full uppercase tracking-[0.4em]">0x03E2_GOVERNANCE_ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};