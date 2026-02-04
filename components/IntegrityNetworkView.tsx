
import React, { useState, useEffect } from 'react';
import { ShieldIcon, ZapIcon, FireIcon, BrainIcon, ActivityIcon, CheckCircleIcon, LogicIcon, SearchIcon, TerminalIcon, SpinnerIcon, StarIcon } from './icons';
import type { KnowledgeFragment, KnowledgeTier } from '../types';

const KNOWLEDGE_VAULT: KnowledgeFragment[] = [
    { id: 'k1', label: 'Pattern Mastery', description: 'Deciphering the recursive architectural echoes of the primary kernel.', tier: 'UNIVERSAL', integrityThreshold: 0, isVerified: true },
    { id: 'k2', label: 'Conjunction Bridge', description: 'Harmonizing multi-generational systems through shared knowledge assets.', tier: 'UNIVERSAL', integrityThreshold: 15, isVerified: true },
    { id: 'k3', label: 'Crystalline Pointers', description: 'Direct memory optimization for the AetherOS conduction layer.', tier: 'OBFUSCATED', integrityThreshold: 40, isVerified: false },
    { id: 'k4', label: 'Aether Calibration', description: 'Precise coordinates for high-fidelity wisdom synchronization.', tier: 'OBFUSCATED', integrityThreshold: 65, isVerified: false },
    { id: 'k5', label: 'Maestro Authority', description: 'The absolute binary harmonic of architectural integrity.', tier: 'PROHIBITED', integrityThreshold: 85, isVerified: false },
    { id: 'k6', label: 'Ancient Synthesis', description: 'The original logic strings used to construct the first node.', tier: 'PROHIBITED', integrityThreshold: 95, isVerified: false },
];

export const IntegrityNetworkView: React.FC = () => {
    const [integrity, setIntegrity] = useState(42);
    const [verifiedFragments, setVerifiedFragments] = useState<string[]>([]);
    const [isCalibrating, setIsCalibrating] = useState(false);

    const activeKnowledge = KNOWLEDGE_VAULT.map(k => ({
        ...k,
        isVerified: integrity >= k.integrityThreshold
    }));

    const triggerCalibration = () => {
        setIsCalibrating(true);
        setTimeout(() => {
            setIsCalibrating(false);
            setVerifiedFragments(prev => [...prev, `K_NODE_0x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`]);
            setIntegrity(i => Math.min(100, i + 2));
        }, 2000);
    };

    return (
        <div className="h-full flex flex-col bg-[#01050a] text-gray-200 font-mono overflow-hidden">
            {/* Header: Integrity Authority */}
            <div className="p-4 sm:p-8 border-b-8 border-black sticky top-0 z-30 bg-slate-950 flex justify-between items-center shadow-[0_12px_40px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 sm:gap-6">
                    <div className="w-12 h-12 sm:w-20 sm:h-20 bg-cyan-500/10 border-4 border-cyan-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                        <ShieldIcon className="w-8 h-8 sm:w-12 sm:h-12 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-comic-header text-2xl sm:text-6xl text-cyan-400 wisdom-glow italic tracking-tighter uppercase truncate">Ignite Sisters Core</h2>
                        <p className="text-[7px] sm:text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-1 truncate">Gifted Knowledge Repository | Reliable Series</p>
                    </div>
                </div>
                <div className="flex gap-4 sm:gap-10">
                    <div className="text-right hidden xs:block">
                        <p className="text-[8px] sm:text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Sisterhood Rank</p>
                        <p className="text-xl sm:text-3xl font-comic-header text-white">VANGUARD_KNOWLEDGE</p>
                    </div>
                    <ActivityIcon className={`w-8 h-8 sm:w-12 sm:h-12 ${isCalibrating ? 'text-cyan-400 animate-bounce' : 'text-gray-900'}`} />
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-10 p-4 sm:p-10 overflow-hidden">
                {/* Left Side: System Integrity */}
                <div className="lg:w-96 flex flex-col gap-4 sm:gap-8 flex-shrink-0">
                    <div className="aero-panel bg-slate-900/60 p-4 sm:p-8 border-cyan-600/30 shadow-[5px_5px_0_0_rgba(0,0,0,0.8)] sm:shadow-[10px_10px_0_0_rgba(0,0,0,0.8)]">
                        <h3 className="font-comic-header text-xl sm:text-2xl text-white uppercase italic tracking-tight mb-4 sm:mb-8 flex items-center gap-3">
                            <StarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" /> Sisters' Integrity
                        </h3>
                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <div className="flex justify-between text-[8px] sm:text-[10px] font-black uppercase text-gray-500 mb-2">
                                    <span>Verification Level</span>
                                    <span className="text-cyan-400">{integrity}%</span>
                                </div>
                                <div className="h-3 sm:h-4 bg-black border-2 border-black rounded-lg overflow-hidden p-[1px]">
                                    <div className="h-full bg-gradient-to-r from-cyan-900 to-cyan-500 transition-all duration-1000 shadow-[0_0_15px_rgba(6,182,212,0.5)]" style={{ width: `${integrity}%` }} />
                                </div>
                            </div>
                            <p className="text-[9px] sm:text-[10px] text-gray-600 italic leading-relaxed">
                                "The Sisters know the weight. Integrity is the foundation of our gifted conduction."
                            </p>
                            <button 
                                onClick={() => setIntegrity(i => Math.min(100, i + 3))}
                                className="w-full py-2 sm:py-3 bg-cyan-950/40 border-2 border-cyan-600/30 text-cyan-400 font-black uppercase text-[8px] sm:text-[10px] rounded-xl hover:bg-cyan-600 hover:text-white transition-all shadow-[4px_4px_0_0_#000]"
                            >
                                Sync Know-How Packet
                            </button>
                        </div>
                    </div>

                    <div className="aero-panel bg-black/40 p-4 sm:p-6 border-white/5 flex-1 flex flex-col overflow-hidden">
                        <h3 className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Sister-Verified Shards</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                            {verifiedFragments.map((frag, i) => (
                                <div key={i} className="p-2 sm:p-3 bg-black border border-white/5 rounded-lg flex items-center justify-between text-[9px] sm:text-[10px] font-mono group hover:border-cyan-600/50 transition-all">
                                    <span className="text-gray-500 group-hover:text-cyan-400 uppercase">{frag}</span>
                                    <CheckCircleIcon className="w-3 h-3 text-green-500" />
                                </div>
                            ))}
                            {verifiedFragments.length === 0 && <p className="text-center text-gray-800 text-[9px] sm:text-[10px] py-10 uppercase font-black tracking-widest italic opacity-40">No Knowledge Calibrated</p>}
                        </div>
                        <button 
                            onClick={triggerCalibration}
                            disabled={isCalibrating}
                            className="vista-button w-full mt-4 py-3 sm:py-4 bg-amber-900/40 text-amber-400 font-black uppercase text-[9px] sm:text-[10px] tracking-widest flex items-center justify-center gap-2 border-amber-600/20"
                        >
                            {isCalibrating ? <SpinnerIcon className="w-4 h-4" /> : <SearchIcon className="w-4 h-4" />}
                            Scour Neural Bridge
                        </button>
                    </div>
                </div>

                {/* Main View: The Lattice */}
                <div className="flex-1 flex flex-col gap-4 sm:gap-10 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                        {(['UNIVERSAL', 'OBFUSCATED', 'PROHIBITED'] as KnowledgeTier[]).map(tier => (
                            <div key={tier} className={`aero-panel p-4 sm:p-6 border-4 flex flex-col transition-all duration-700 ${tier === 'PROHIBITED' ? 'border-amber-900 bg-amber-950/10' : tier === 'OBFUSCATED' ? 'border-cyan-900 bg-cyan-950/10' : 'border-blue-900 bg-blue-950/10'}`}>
                                <h4 className={`font-comic-header text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2 italic ${tier === 'PROHIBITED' ? 'text-amber-500' : tier === 'OBFUSCATED' ? 'text-cyan-500' : 'text-blue-500'}`}>
                                    {tier === 'PROHIBITED' ? <FireIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : tier === 'OBFUSCATED' ? <StarIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <LogicIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    {tier}
                                </h4>
                                <div className="space-y-3 sm:space-y-4 flex-1">
                                    {activeKnowledge.filter(k => k.tier === tier).map(k => (
                                        <div key={k.id} className={`p-3 sm:p-4 rounded-2xl border-2 transition-all duration-700 relative overflow-hidden group ${k.isVerified ? 'bg-black border-white/10' : 'bg-black/60 border-black grayscale opacity-40'}`}>
                                            {!k.isVerified && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/60 backdrop-blur-[2px]">
                                                    <ShieldIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800 opacity-40 group-hover:scale-110 transition-transform mb-1" />
                                                    <span className="text-[7px] font-black text-gray-700 uppercase tracking-tighter">Sisters' Threshold: {k.integrityThreshold}%</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${k.isVerified ? (tier === 'PROHIBITED' ? 'text-amber-500' : 'text-cyan-400') : 'text-gray-700'}`}>{k.label}</span>
                                                {k.isVerified && <ZapIcon className="w-3 h-3 text-cyan-400 animate-pulse" />}
                                            </div>
                                            <p className="text-[9px] sm:text-[10px] text-gray-500 italic leading-snug line-clamp-2">{k.isVerified ? k.description : `Unlock requires ${k.integrityThreshold}% integrity.`}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Central Filter Console */}
                    <div className="flex-1 aero-panel bg-black border-4 border-black p-4 sm:p-10 flex flex-col relative overflow-hidden shadow-[10px_10px_40px_rgba(0,0,0,1)] sm:shadow-[20px_20px_100px_rgba(0,0,0,1)]">
                         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                         <div className="relative z-10 flex flex-col h-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-white/5 pb-4 sm:pb-6 mb-4 sm:mb-8 gap-4 sm:gap-0">
                                <div className="flex items-center gap-3 sm:gap-6">
                                    <TerminalIcon className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500" />
                                    <h3 className="font-comic-header text-2xl sm:text-4xl text-white italic tracking-tighter">Gifted Wisdom Governor</h3>
                                </div>
                                <div className="flex gap-2 sm:gap-4">
                                    <div className="bg-cyan-600 text-black px-3 sm:px-4 py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Ignite Verified</div>
                                    <div className="bg-slate-900 text-gray-500 px-3 sm:px-4 py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-white/5 rounded-full">Heuristic Feed: ON</div>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-10 items-center overflow-y-auto custom-scrollbar">
                                <div className="space-y-4 sm:space-y-8">
                                    <div className="p-6 sm:p-8 bg-cyan-600/5 border-4 border-cyan-600/30 rounded-[2rem] sm:rounded-[3rem] relative group overflow-hidden shadow-inner">
                                        <div className="absolute inset-0 bg-cyan-600/5 group-hover:bg-cyan-600/10 transition-colors" />
                                        <div className="relative z-10 text-center space-y-2 sm:space-y-4">
                                            <BrainIcon className="w-12 h-12 sm:w-20 sm:h-20 text-cyan-400 mx-auto animate-pulse" />
                                            <p className="font-comic-header text-xl sm:text-2xl text-white uppercase tracking-widest">Sisterhood Integrity</p>
                                            <p className="text-[10px] sm:text-sm text-gray-500 font-black uppercase tracking-tighter">Reliable Stride: 1.2 PB/s</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4 font-mono text-[8px] sm:text-[9px] text-gray-600">
                                        <div className="p-3 sm:p-4 bg-black border border-white/5 rounded-2xl">
                                            <span className="block mb-1 sm:mb-2 font-black uppercase">Resonance Quality</span>
                                            <span className="text-green-500">SISTER_LINK_OPTIMAL</span>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-black border border-white/5 rounded-2xl">
                                            <span className="block mb-1 sm:mb-2 font-black uppercase">Gifted Calibration</span>
                                            <span className="text-cyan-400">FLAWLESS SYNC</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-0">
                                    <div className="p-4 sm:p-6 bg-slate-900 border-2 border-white/5 rounded-2xl sm:rounded-3xl">
                                        <h5 className="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase mb-3 sm:mb-4 tracking-widest flex items-center gap-2">
                                            <StarIcon className="w-4 h-4" /> Reliable Markers
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {['SISTER_STRENGTH', 'KNOW_HOW_PRIME', 'CORE_RESILIENCE', 'GIFTED_BLUEPRINT'].map(m => (
                                                <div key={m} className="px-2 sm:px-3 py-1 bg-black border border-cyan-900/40 text-cyan-500 text-[7px] sm:text-[8px] font-black uppercase tracking-widest rounded-lg">
                                                    {m}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-6 bg-slate-900 border-2 border-white/5 rounded-2xl sm:rounded-3xl flex-1 shadow-inner">
                                        <h5 className="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase mb-2 sm:mb-3 tracking-widest">Sisters' Guidance</h5>
                                        <p className="text-[10px] sm:text-xs text-gray-400 italic leading-relaxed">
                                            "Knowledge is a gift, and integrity is how we wrap it. Let the Ignite Sisters guide your projects with pleasure and precision. The core is safe."
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
