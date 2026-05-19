
import React, { useState, useEffect } from 'react';
import { 
    GlobeIcon, ZapIcon, ShieldIcon, DatabaseIcon, 
    Share2Icon, CpuIcon, LayersIcon, ActivityIcon,
    ArrowRightIcon, BoxIcon, TerminalIcon, ServerIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EcosystemNode {
    id: string;
    name: string;
    type: 'CORE' | 'EDGE' | 'BRIDGE' | 'STORAGE';
    status: 'OPTIMAL' | 'DEGRADED' | 'HALTED';
    load: number;
    connections: string[];
}

const NODES: EcosystemNode[] = [
    { id: 'c-01', name: 'SOVEREIGN_GATEWAY', type: 'CORE', status: 'OPTIMAL', load: 42, connections: ['e-01', 'e-02', 's-01', 'e-03'] },
    { id: 'e-01', name: 'LONDON_EDGE_01', type: 'EDGE', status: 'OPTIMAL', load: 15, connections: ['c-01', 'b-01'] },
    { id: 'e-02', name: 'TOKYO_EDGE_01', type: 'EDGE', status: 'OPTIMAL', load: 28, connections: ['c-01', 'b-02'] },
    { id: 'e-03', name: 'OSLO_EDGE_09', type: 'EDGE', status: 'DEGRADED', load: 89, connections: ['c-01', 's-02'] },
    { id: 'b-01', name: 'BTC_MAIN_BRIDGE', type: 'BRIDGE', status: 'OPTIMAL', load: 60, connections: ['e-01', 's-01'] },
    { id: 'b-02', name: 'XMR_SHROUD_LINK', type: 'BRIDGE', status: 'OPTIMAL', load: 85, connections: ['e-02'] },
    { id: 's-01', name: 'GLOBAL_VAULT_S1', type: 'STORAGE', status: 'OPTIMAL', load: 92, connections: ['c-01', 'b-01'] },
    { id: 's-02', name: 'ARCTIC_COLD_S2', type: 'STORAGE', status: 'HALTED', load: 0, connections: ['e-03'] },
];

export const EcosystemView: React.FC = () => {
    const [selectedNode, setSelectedNode] = useState<EcosystemNode | null>(NODES[0]);
    const [pulse, setPulse] = useState(0);
    const [viewScale, setViewScale] = useState<'LOCAL' | 'GLOBAL' | 'QUANTUM'>('GLOBAL');

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(p => (p + 1) % 100);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col bg-[#020204] text-zinc-300 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b-4 border-black bg-zinc-900/40 flex justify-between items-end relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(56,189,248,0.1)_0%,_transparent_50%)]" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-cyan-600/10 border-2 border-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                            <GlobeIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Global_Ecosystem</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] italic leading-none">Topographical Mapping of Distributed Sovereign Infrastructure.</p>
                        <div className="h-px w-24 bg-zinc-800" />
                        <div className="flex gap-2">
                            {['LOCAL', 'GLOBAL', 'QUANTUM'].map(s => (
                                <button 
                                    key={s}
                                    onClick={() => setViewScale(s as any)}
                                    className={`text-[8px] font-black px-2 py-0.5 rounded border ${viewScale === s ? 'bg-cyan-500 text-black border-cyan-500' : 'text-zinc-600 border-zinc-800 hover:border-zinc-500 transition-colors'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 relative z-10 pb-2">
                    <div className="text-right">
                        <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Active Nodes</p>
                        <p className="text-2xl font-black text-white">{NODES.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Total Throughput</p>
                        <p className="text-2xl font-black text-cyan-500 italic">8.74 TB/s</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
                {/* Left: Map Visualization */}
                <div className="lg:col-span-8 relative border-r-4 border-black overflow-hidden bg-black/40">
                    {/* Lattice Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                        <div className="absolute inset-0" style={{ 
                            backgroundImage: `radial-gradient(circle at 1px 1px, #0891b2 1px, transparent 0)`,
                            backgroundSize: '20px 20px' 
                        }} />
                        {/* Moving light streaks */}
                        <motion.div 
                            animate={{ y: [0, 1000] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-30"
                        />
                    </div>
                    
                    {/* SVG Connections Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                        <defs>
                            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0891b2" stopOpacity="0" />
                                <stop offset="50%" stopColor="#0891b2" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Mock connection paths - improved lattice connections */}
                        <motion.g animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }}>
                            <path d="M 400 300 L 200 150" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                            <path d="M 400 300 L 600 150" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                            <path d="M 400 300 L 400 550" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                            <path d="M 200 150 L 100 400" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                            <path d="M 600 150 L 700 400" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                            <path d="M 400 550 L 700 400" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                            <path d="M 400 550 L 100 400" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                        </motion.g>
                    </svg>

                    {/* Nodes - Dense Visualization */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {NODES.map((node, idx) => {
                            // Circle layout
                            const angles = [0, 45, 90, 135, 180, 225, 270, 315];
                            const angle = (angles[idx] || 0) * (Math.PI / 180);
                            const baseRadius = viewScale === 'LOCAL' ? 400 : viewScale === 'QUANTUM' ? 150 : 280;
                            const radius = idx === 0 ? 0 : baseRadius;
                            
                            const x = radius * Math.cos(angle);
                            const y = radius * Math.sin(angle);

                            return (
                                <motion.button
                                    key={node.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ 
                                        scale: 1, 
                                        opacity: 1,
                                        x, y
                                    }}
                                    transition={{ type: 'spring', damping: 12, stiffness: 100, delay: idx * 0.05 }}
                                    onClick={() => setSelectedNode(node)}
                                    className={`absolute group p-1 z-20 outline-none`}
                                >
                                    <div className={`relative transition-all duration-700 ${selectedNode?.id === node.id ? 'scale-125' : 'hover:scale-110 active:scale-95'}`}>
                                        <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center bg-zinc-950/80 backdrop-blur-3xl transition-all duration-500 overflow-hidden ${
                                            selectedNode?.id === node.id 
                                            ? 'border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.4)]' 
                                            : 'border-white/5 group-hover:border-white/20'
                                        }`}>
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {node.type === 'CORE' && <CpuIcon className={`w-7 h-7 text-cyan-400 ${selectedNode?.id === node.id ? 'animate-pulse' : ''}`} />}
                                            {node.type === 'EDGE' && <ActivityIcon className="w-7 h-7 text-zinc-400 group-hover:text-white transition-colors" />}
                                            {node.type === 'BRIDGE' && <Share2Icon className="w-7 h-7 text-amber-500" />}
                                            {node.type === 'STORAGE' && <DatabaseIcon className="w-7 h-7 text-purple-500" />}
                                        </div>
                                        
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap">
                                            <p className={`text-[7px] font-black uppercase tracking-[0.2em] transition-colors ${selectedNode?.id === node.id ? 'text-cyan-400' : 'text-zinc-600'}`}>
                                                {node.name}
                                            </p>
                                        </div>

                                        {node.status === 'OPTIMAL' && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                        )}
                                        {node.status === 'DEGRADED' && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse" />
                                        )}
                                        {node.status === 'HALTED' && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-zinc-950 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* HUD Overlays - Improved Density */}
                    <div className="absolute top-8 left-8 space-y-4">
                        <div className="p-6 bg-zinc-950/80 border-2 border-black rounded-2xl backdrop-blur-xl shadow-2xl">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,1)]" />
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Active Lattice: STABLE</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,1)]" />
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Bridge Latency: 12ms</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,1)]" />
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Storage Redundancy: 4x</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-950/40 border-2 border-black rounded-xl backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <ActivityIcon className="w-4 h-4 text-zinc-700" />
                                <div>
                                    <p className="text-[8px] text-zinc-500 font-bold uppercase">Grid Resonance</p>
                                    <div className="w-32 h-1 bg-zinc-900 rounded-full mt-1 overflow-hidden">
                                        <motion.div 
                                            animate={{ width: ['20%', '80%', '40%'] }} 
                                            transition={{ duration: 10, repeat: Infinity }}
                                            className="h-full bg-cyan-700" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Node Details & Ecosystem Directory */}
                <div className="lg:col-span-4 flex flex-col bg-zinc-950 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                    
                    <AnimatePresence mode="wait">
                        {selectedNode ? (
                            <motion.div 
                                key={selectedNode.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar"
                            >
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.3em]">Node Inspector</h4>
                                    <h3 className="text-5xl font-black text-white italic tracking-tighter leading-tight break-words uppercase">{selectedNode.name}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-zinc-900/60 border-2 border-black rounded-2xl">
                                        <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Protocol Version</p>
                                        <p className="text-xl font-black text-white">0x03E2</p>
                                    </div>
                                    <div className="p-4 bg-zinc-900/60 border-2 border-black rounded-2xl">
                                        <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Operational Load</p>
                                        <p className={`text-xl font-black ${selectedNode.load > 80 ? 'text-red-500' : 'text-emerald-500'}`}>{selectedNode.load}%</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Downstream Connections</p>
                                    <div className="space-y-2">
                                        {selectedNode.connections.map(connId => {
                                            const target = NODES.find(n => n.id === connId);
                                            return (
                                                <div key={connId} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group" onClick={() => setSelectedNode(target || null)}>
                                                    <div className="flex items-center gap-3">
                                                        <Share2Icon className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400" />
                                                        <span className="text-xs font-black uppercase text-zinc-400 group-hover:text-white transition-colors">{target?.name || connId}</span>
                                                    </div>
                                                    <ArrowRightIcon className="w-4 h-4 text-zinc-800 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Operational Manifest</p>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                                                <TerminalIcon className="w-5 h-5 text-zinc-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white uppercase mb-0.5">Sub-Process: QUANTUM_FILTER</p>
                                                <p className="text-[9px] text-zinc-600 font-mono">Cleaning noise from semantic intent strings.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                                                <LayersIcon className="w-5 h-5 text-zinc-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white uppercase mb-0.5">Persistence: SHARD_MIRROR</p>
                                                <p className="text-[9px] text-zinc-600 font-mono">Redundant backup to GLOBAL_VAULT_S1.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-12 text-center">
                                <div>
                                    <GlobeIcon className="w-16 h-16 text-zinc-800 mx-auto mb-6 animate-pulse" />
                                    <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em]">Select a node to inspect the infrastructure topography.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Bottom Action Bar */}
                    <div className="p-8 bg-black border-t-4 border-black shrink-0">
                        <button className="w-full py-4 bg-zinc-100 hover:bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[6px_6px_0_0_#333] active:translate-y-1 transition-all flex items-center justify-center gap-3">
                            <ZapIcon className="w-4 h-4 fill-black" />
                            Recalibrate Ecosystem
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-3 bg-black border-t-2 border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                        <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Ecosystem Status: NOMINAL</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-zinc-700 font-mono italic">
                        <ActivityIcon className="w-3 h-3" /> System Entropy: 0.002
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-zinc-700 font-mono italic">
                        <ServerIcon className="w-3 h-3" /> Total Uptime: 99.9997%
                    </div>
                </div>
                <div className="text-[10px] text-zinc-800 font-black uppercase italic tracking-[0.4em]">
                    Sovereign v0.4.1 // Topological_Map
                </div>
            </div>
        </div>
    );
};
