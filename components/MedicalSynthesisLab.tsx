
import React, { useState, useEffect, useRef } from 'react';
import { 
    ActivityIcon, BrainIcon, AnalyzeIcon, TerminalIcon, ShieldIcon, 
    ZapIcon, SpinnerIcon, CheckCircleIcon, WarningIcon, FileIcon,
    SearchIcon, VaultIcon, FlaskIcon, TestTubeIcon, ChevronRightIcon,
    ChevronDownIcon, XIcon, PlusIcon, DownloadIcon, UploadIcon
} from './icons';
import { motion, AnimatePresence } from 'motion/react';

// Mock Dataset Shard
interface DataShard {
    id: string;
    className: string;
    attributes: string[];
    resolution: string;
    status: 'VERIFIED' | 'UNCERTAIN' | 'CORRUPT';
    careScore: number;
}

const MOCK_SHARDS: DataShard[] = [
    { id: "SH-0x1A2B", className: "Axial Slice", attributes: ["Neural Density", "Vascular Flow", "Cortical Depth"], resolution: "720x720", status: "VERIFIED", careScore: 98 },
    { id: "SH-0x3C4D", className: "Focal Focus", attributes: ["Lattice Integrity", "Signal Resonance"], resolution: "720x720", status: "VERIFIED", careScore: 94 },
    { id: "SH-0x5E6F", className: "Sagittal Plane", attributes: ["Spinal Alignment", "Fluid Dynamics"], resolution: "720x720", status: "UNCERTAIN", careScore: 72 },
    { id: "SH-0x7G8H", className: "Coronal Section", attributes: ["Symmetry Matrix", "Tissue Contrast"], resolution: "720x720", status: "VERIFIED", careScore: 91 },
    { id: "SH-0x9I0J", className: "Neural Conjunction", attributes: ["Synaptic Bridge", "Axon Pathing"], resolution: "720x720", status: "CORRUPT", careScore: 12 },
];

export const MedicalSynthesisLab: React.FC = () => {
    const [isTraining, setIsTraining] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentShard, setCurrentShard] = useState<DataShard | null>(null);
    const [logs, setLogs] = useState<string[]>(["[SYSTEM] Medical Synthesis Lab initialized.", "[SYSTEM] Waiting for AIVision360-8k.jso ingress..."]);
    const [activeTab, setActiveTab] = useState<'SHARDS' | 'NEURAL_FORGE' | 'DIAGNOSTICS'>('SHARDS');

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const startTraining = () => {
        if (isTraining) return;
        setIsTraining(true);
        setProgress(0);
        addLog("Initializing Neural Forge for AIVision360-8k dataset...");
        addLog("Correcting semantic drift: MNIST/CIFAR protocols bypassed for high-res medical synthesis.");
    };

    useEffect(() => {
        if (isTraining && progress < 100) {
            const timer = setTimeout(() => {
                const inc = Math.random() * 5;
                const next = Math.min(100, progress + inc);
                setProgress(next);
                
                if (Math.random() > 0.7) {
                    const randomShard = MOCK_SHARDS[Math.floor(Math.random() * MOCK_SHARDS.length)];
                    addLog(`Synthesizing Shard ${randomShard.id}: ${randomShard.className}...`);
                }

                if (next === 100) {
                    setIsTraining(false);
                    addLog("Neural Synthesis Complete. Model weights quantized to 0x03E2 standard.");
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isTraining, progress]);

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white font-sans overflow-hidden">
            {/* Header */}
            <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/40 backdrop-blur-md">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.4)]">
                            <ActivityIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Medical Synthesis Lab</h1>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]">Authority: AIVision360-8k Conjunction Protocol</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase">Lattice Integrity</div>
                        <div className="text-xl font-black text-rose-500">98.4%</div>
                    </div>
                    <div className="text-right border-l border-zinc-800 pl-4">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase">Care Score Avg</div>
                        <div className="text-xl font-black text-cyan-400">92.1</div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: Navigation & Stats */}
                <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-900/20">
                    <nav className="p-4 space-y-2">
                        <button 
                            onClick={() => setActiveTab('SHARDS')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'SHARDS' ? 'bg-rose-600 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-800'}`}
                        >
                            <VaultIcon className="w-5 h-5" />
                            <span className="font-black uppercase text-xs tracking-widest">Dataset Shards</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('NEURAL_FORGE')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'NEURAL_FORGE' ? 'bg-rose-600 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-800'}`}
                        >
                            <BrainIcon className="w-5 h-5" />
                            <span className="font-black uppercase text-xs tracking-widest">Neural Forge</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('DIAGNOSTICS')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'DIAGNOSTICS' ? 'bg-rose-600 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-800'}`}
                        >
                            <AnalyzeIcon className="w-5 h-5" />
                            <span className="font-black uppercase text-xs tracking-widest">Diagnostics</span>
                        </button>
                    </nav>

                    <div className="mt-auto p-6 border-t border-zinc-800">
                        <div className="text-[10px] text-zinc-600 font-mono uppercase mb-4">Ingress Status</div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-zinc-400 font-mono">AIVision360-8k.jso</span>
                                <span className="text-[10px] text-green-500 font-black">LOADED</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-zinc-400 font-mono">Image Buffer</span>
                                <span className="text-[10px] text-zinc-500 font-black">104K / 104K</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-zinc-400 font-mono">Attribute Matrix</span>
                                <span className="text-[10px] text-zinc-500 font-black">256,496</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Center Panel: Active View */}
                <section className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_50%,_rgba(225,29,72,0.05)_0%,_transparent_70%)]">
                    <div className="flex-1 p-8 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            {activeTab === 'SHARDS' && (
                                <motion.div 
                                    key="shards"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-end">
                                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Dataset Shards</h2>
                                        <div className="flex gap-2">
                                            <button className="px-4 py-2 bg-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors">Filter Shards</button>
                                            <button className="px-4 py-2 bg-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-colors">Export Matrix</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {MOCK_SHARDS.map(shard => (
                                            <div 
                                                key={shard.id}
                                                onClick={() => setCurrentShard(shard)}
                                                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer group ${currentShard?.id === shard.id ? 'border-rose-500 bg-rose-500/10' : 'border-zinc-800 bg-black/40 hover:border-zinc-600'}`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`text-[8px] font-black px-2 py-0.5 rounded border ${shard.status === 'VERIFIED' ? 'border-green-500 text-green-500 bg-green-500/10' : shard.status === 'UNCERTAIN' ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
                                                        {shard.status}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">{shard.id}</div>
                                                </div>
                                                <h3 className="text-xl font-black uppercase mb-2 group-hover:text-rose-400 transition-colors">{shard.className}</h3>
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {shard.attributes.map(attr => (
                                                        <span key={attr} className="text-[8px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded uppercase">{attr}</span>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                                                    <span className="text-[10px] text-zinc-500 font-mono uppercase">{shard.resolution}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-zinc-600 font-mono uppercase">Care</span>
                                                        <span className={`text-sm font-black ${shard.careScore > 90 ? 'text-cyan-400' : 'text-amber-500'}`}>{shard.careScore}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'NEURAL_FORGE' && (
                                <motion.div 
                                    key="forge"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="h-full flex flex-col space-y-8"
                                >
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Neural Forge</h2>
                                            <p className="text-zinc-500 text-sm mt-2 max-w-xl">
                                                Quantizing AIVision360-8k dataset into high-fidelity medical synthesis weights. 
                                                Bypassing legacy MNIST/CIFAR protocols for sub-millimeter precision.
                                            </p>
                                        </div>
                                        <button 
                                            onClick={startTraining}
                                            disabled={isTraining}
                                            className={`px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${isTraining ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.3)]'}`}
                                        >
                                            {isTraining ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <ZapIcon className="w-5 h-5" />}
                                            {isTraining ? 'Synthesis in Progress' : 'Ignite Neural Forge'}
                                        </button>
                                    </div>

                                    {/* Training Visualization */}
                                    <div className="flex-1 bg-black/60 border-2 border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                                            <div className="w-full h-full bg-[linear-gradient(rgba(225,29,72,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(225,29,72,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
                                        </div>

                                        <div className="relative z-10 h-full flex flex-col justify-center items-center">
                                            {isTraining || progress > 0 ? (
                                                <div className="w-full max-w-2xl space-y-12">
                                                    <div className="text-center space-y-4">
                                                        <div className="text-8xl font-black text-rose-500 italic tracking-tighter tabular-nums">
                                                            {Math.floor(progress)}%
                                                        </div>
                                                        <div className="text-xs font-mono text-zinc-500 uppercase tracking-[0.5em]">Synthesis Conjunction Active</div>
                                                    </div>

                                                    <div className="relative h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                                        <motion.div 
                                                            className="absolute inset-y-0 left-0 bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.8)]"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-8">
                                                        <div className="text-center">
                                                            <div className="text-[10px] text-zinc-600 font-mono uppercase mb-1">Loss Gradient</div>
                                                            <div className="text-xl font-black text-cyan-400">0.00{Math.max(1, 100 - Math.floor(progress))}</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-[10px] text-zinc-600 font-mono uppercase mb-1">Care Resonance</div>
                                                            <div className="text-xl font-black text-rose-500">{90 + (progress / 10)}</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-[10px] text-zinc-600 font-mono uppercase mb-1">Quantized Shards</div>
                                                            <div className="text-xl font-black text-white">{Math.floor(progress * 1040)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center space-y-6">
                                                    <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border-2 border-zinc-800">
                                                        <BrainIcon className="w-12 h-12 text-zinc-700" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-2xl font-black uppercase italic">Neural Forge Idle</h3>
                                                        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Awaiting dataset ignition command</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Panel: Terminal Logs */}
                    <div className="h-48 border-t border-zinc-800 bg-black/80 flex flex-col font-mono">
                        <div className="px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <TerminalIcon className="w-3 h-3 text-rose-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Synthesis Terminal</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-[8px] text-zinc-600 uppercase">Buffer: 1024KB</span>
                                <span className="text-[8px] text-zinc-600 uppercase">Latency: 12ms</span>
                            </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className={`text-[10px] ${log.includes('[SYSTEM]') ? 'text-rose-500 font-black' : 'text-zinc-500'}`}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Right Panel: Shard Details */}
                <aside className="w-80 border-l border-zinc-800 bg-zinc-900/20 p-6 overflow-y-auto">
                    {currentShard ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-tight">Shard Details</h2>
                                <button onClick={() => setCurrentShard(null)} className="text-zinc-600 hover:text-white transition-colors">
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-black rounded-2xl border border-zinc-800">
                                    <div className="text-[10px] text-zinc-600 font-mono uppercase mb-2">Signature</div>
                                    <div className="text-lg font-black text-rose-500 font-mono">{currentShard.id}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-[10px] text-zinc-600 font-mono uppercase">Classification</div>
                                    <div className="text-xl font-black uppercase">{currentShard.className}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-[10px] text-zinc-600 font-mono uppercase">Attributes</div>
                                    <div className="flex flex-wrap gap-2">
                                        {currentShard.attributes.map(attr => (
                                            <span key={attr} className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-black uppercase text-zinc-300 border border-zinc-700">{attr}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                                    <div>
                                        <div className="text-[10px] text-zinc-600 font-mono uppercase mb-1">Resolution</div>
                                        <div className="text-sm font-black">{currentShard.resolution}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-600 font-mono uppercase mb-1">Care Score</div>
                                        <div className="text-sm font-black text-cyan-400">{currentShard.careScore}</div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button className="w-full py-4 bg-zinc-800 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-700 transition-all border border-zinc-700">
                                        Re-Quantize Shard
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                                <SearchIcon className="w-8 h-8 text-zinc-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest">No Shard Selected</p>
                                <p className="text-[10px] font-mono uppercase text-zinc-600">Select a shard to view matrix</p>
                            </div>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
};
