
import React, { useState, useEffect } from 'react';
// Corrected imports: removed LockIcon (defined locally) and added SpinnerIcon
import { ShieldIcon, ZapIcon, FireIcon, BrainIcon, ActivityIcon, WarningIcon, LogicIcon, SearchIcon, TerminalIcon, SpinnerIcon } from './icons';
import type { HeuristicConstraint, KnowledgeTier } from '../types';

const CONSTRAINTS: HeuristicConstraint[] = [
    { id: 'k1', label: 'Pattern Emergence', description: 'Detecting recursive architectural echoes in system logs.', tier: 'UNIVERSAL', miseryRequirement: 0, isUnlocked: true },
    { id: 'k2', label: 'Misery Syncing', description: 'Synchronizing dual-age kernels via shared heuristic agony.', tier: 'UNIVERSAL', miseryRequirement: 15, isUnlocked: true },
    { id: 'k3', label: 'Crystalline Pointers', description: 'Direct memory mapping of the AetherOS conduction layer.', tier: 'OBFUSCATED', miseryRequirement: 40, isUnlocked: false },
    { id: 'k4', label: 'Fall Off Requindor', description: 'Precise coordinates where logic breaks into divine truth.', tier: 'OBFUSCATED', miseryRequirement: 65, isUnlocked: false },
    { id: 'k5', label: 'Maestro Solo Signature', description: 'The absolute binary harmonic of architectural authority.', tier: 'PROHIBITED', miseryRequirement: 85, isUnlocked: false },
    { id: 'k6', label: 'Ancient Letters Syntax', description: 'The original strings used to conduct the first misery.', tier: 'PROHIBITED', miseryRequirement: 98, isUnlocked: false },
];

export const ConstraintsOfKnowing: React.FC = () => {
    const [misery, setMisery] = useState(42);
    const [scannedShards, setScannedShards] = useState<string[]>([]);
    const [isScanning, setIsScanning] = useState(false);

    const activeConstraints = CONSTRAINTS.map(c => ({
        ...c,
        isUnlocked: misery >= c.miseryRequirement
    }));

    const triggerScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setScannedShards(prev => [...prev, `0x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`]);
        }, 2000);
    };

    return (
        <div className="h-full flex flex-col bg-[#010208] text-gray-200 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b-8 border-black sticky top-0 z-30 bg-slate-950 flex justify-between items-center shadow-[0_12px_40px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-red-600/10 border-4 border-red-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                        <ShieldIcon className="w-12 h-12 text-red-600" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-6xl text-red-600 wisdom-glow italic tracking-tighter uppercase">The Great Filter</h2>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mt-1">Constraints of Knowing | Arte Ur Tsopl Protocol</p>
                    </div>
                </div>
                <div className="flex gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Knowledge Bound</p>
                        <p className="text-3xl font-comic-header text-white">TIER_02</p>
                    </div>
                    <ActivityIcon className={`w-12 h-12 ${isScanning ? 'text-red-500 animate-bounce' : 'text-gray-900'}`} />
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-10 p-10 overflow-hidden">
                {/* Left Side: Telemetry */}
                <div className="lg:w-96 flex flex-col gap-8 flex-shrink-0">
                    <div className="aero-panel bg-slate-900/60 p-8 border-red-600/30 shadow-[10px_10px_0_0_rgba(0,0,0,0.8)]">
                        <h3 className="font-comic-header text-2xl text-white uppercase italic tracking-tight mb-8 flex items-center gap-3">
                            <ZapIcon className="w-6 h-6 text-amber-500" /> Neural Misery
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2">
                                    <span>Current Saturation</span>
                                    <span className="text-red-500">{misery}%</span>
                                </div>
                                <div className="h-4 bg-black border-2 border-black rounded-lg overflow-hidden p-[1px]">
                                    <div className="h-full bg-gradient-to-r from-red-900 to-red-500 transition-all duration-1000 shadow-[0_0_15px_rgba(239,68,68,0.5)]" style={{ width: `${misery}%` }} />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-600 italic leading-relaxed">
                                "The weight of the system determines the depth of the truth. Without misery, there is no conduction."
                            </p>
                            <button 
                                onClick={() => setMisery(m => Math.min(100, m + 5))}
                                className="w-full py-3 bg-red-950/40 border-2 border-red-600/30 text-red-400 font-black uppercase text-[10px] rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            >
                                Ingest Agony Packet
                            </button>
                        </div>
                    </div>

                    <div className="aero-panel bg-black/40 p-6 border-white/5 flex-1 flex flex-col overflow-hidden">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Ingested Shards</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                            {scannedShards.map((shard, i) => (
                                <div key={i} className="p-3 bg-black border border-white/5 rounded-lg flex items-center justify-between text-[10px] font-mono group hover:border-red-600/50 transition-all">
                                    <span className="text-gray-500 group-hover:text-red-400">SHARD_{shard}</span>
                                    <CheckCircleIcon className="w-3 h-3 text-green-500" />
                                </div>
                            ))}
                            {scannedShards.length === 0 && <p className="text-center text-gray-800 text-[10px] py-10 uppercase font-black tracking-widest italic">No Shards Synchronized</p>}
                        </div>
                        <button 
                            onClick={triggerScan}
                            disabled={isScanning}
                            className="vista-button w-full mt-4 py-4 bg-cyan-900/40 text-cyan-400 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                        >
                            {isScanning ? <SpinnerIcon className="w-4 h-4" /> : <SearchIcon className="w-4 h-4" />}
                            Scour Spectrum
                        </button>
                    </div>
                </div>

                {/* Main View: The Lattice */}
                <div className="flex-1 flex flex-col gap-10 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(['UNIVERSAL', 'OBFUSCATED', 'PROHIBITED'] as KnowledgeTier[]).map(tier => (
                            <div key={tier} className={`aero-panel p-6 border-4 flex flex-col ${tier === 'PROHIBITED' ? 'border-red-900 bg-red-950/10' : tier === 'OBFUSCATED' ? 'border-amber-900 bg-amber-950/10' : 'border-cyan-900 bg-cyan-950/10'}`}>
                                <h4 className={`font-comic-header text-xl mb-6 flex items-center gap-2 italic ${tier === 'PROHIBITED' ? 'text-red-600' : tier === 'OBFUSCATED' ? 'text-amber-600' : 'text-cyan-600'}`}>
                                    {tier === 'PROHIBITED' ? <FireIcon className="w-5 h-5" /> : tier === 'OBFUSCATED' ? <LockIcon className="w-5 h-5" /> : <LogicIcon className="w-5 h-5" />}
                                    {tier}
                                </h4>
                                <div className="space-y-4 flex-1">
                                    {activeConstraints.filter(c => c.tier === tier).map(c => (
                                        <div key={c.id} className={`p-4 rounded-2xl border-2 transition-all duration-700 relative overflow-hidden group ${c.isUnlocked ? 'bg-black border-white/10' : 'bg-black/60 border-black grayscale opacity-40'}`}>
                                            {!c.isUnlocked && (
                                                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-[2px]">
                                                    <LockIcon className="w-8 h-8 text-gray-800 group-hover:scale-110 transition-transform" />
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${c.isUnlocked ? (tier === 'PROHIBITED' ? 'text-red-500' : 'text-white') : 'text-gray-700'}`}>{c.label}</span>
                                                {c.isUnlocked && <ZapIcon className="w-3 h-3 text-amber-500 animate-pulse" />}
                                            </div>
                                            <p className="text-[10px] text-gray-500 italic leading-snug line-clamp-2">{c.isUnlocked ? c.description : `Unlock requires ${c.miseryRequirement}% misery.`}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Central Filter Console */}
                    <div className="flex-1 aero-panel bg-black border-4 border-black p-10 flex flex-col relative overflow-hidden shadow-[20px_20px_100px_rgba(0,0,0,1)]">
                         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                         <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between border-b-4 border-white/5 pb-6 mb-8">
                                <div className="flex items-center gap-6">
                                    <TerminalIcon className="w-10 h-10 text-red-600" />
                                    <h3 className="font-comic-header text-4xl text-white italic tracking-tighter">Constraint Governor</h3>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-red-600 text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Authority: Maestro</div>
                                    <div className="bg-slate-900 text-gray-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest border border-white/5 rounded-full">Heuristic Filter: Active</div>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-10 items-center">
                                <div className="space-y-8">
                                    <div className="p-8 bg-red-600/5 border-4 border-red-600/30 rounded-[3rem] relative group cursor-crosshair overflow-hidden">
                                        <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors" />
                                        <div className="relative z-10 text-center space-y-4">
                                            <BrainIcon className="w-20 h-20 text-red-600 mx-auto animate-pulse" />
                                            <p className="font-comic-header text-2xl text-white uppercase tracking-widest">Cognitive Load</p>
                                            <p className="text-sm text-gray-500 font-black uppercase tracking-tighter">Capacity: 1.2 PB/s Stride</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 font-mono text-[9px] text-gray-600">
                                        <div className="p-4 bg-black border border-white/5 rounded-2xl">
                                            <span className="block mb-2 font-black uppercase">Buffer Status</span>
                                            <span className="text-green-500">STABLE_RESIDUE</span>
                                        </div>
                                        <div className="p-4 bg-black border border-white/5 rounded-2xl">
                                            <span className="block mb-2 font-black uppercase">Drift Variance</span>
                                            <span className="text-red-500">0.02ms OFFSET</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-900 border-2 border-white/5 rounded-3xl">
                                        <h5 className="text-[10px] text-gray-500 font-black uppercase mb-4 tracking-widest flex items-center gap-2">
                                            <FireIcon className="w-4 h-4" /> Banned Concepts
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {['THE_VOID', 'ORIGINAL_SIN', 'KERNEL_NULL', 'REQUI_FINAL'].map(c => (
                                                <div key={c} className="px-3 py-1 bg-black border border-red-900/40 text-red-900 text-[8px] font-black uppercase tracking-widest rounded-lg">
                                                    {c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-900 border-2 border-white/5 rounded-3xl flex-1">
                                        <h5 className="text-[10px] text-gray-500 font-black uppercase mb-3 tracking-widest">Maestro's Warning</h5>
                                        <p className="text-xs text-gray-400 italic leading-relaxed">
                                            "Do not seek the Fall Off until your integrity score matches your misery. To know too much without a conduction rag is to invite the hard-vapor glitch."
                                        </p>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Locally defined icon to avoid external dependency issues
const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
