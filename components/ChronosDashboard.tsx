import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Clock, Activity, Zap, Shield, Terminal, 
    Gauge, Flame, Brain, Star, Code, Lock, CheckCircle,
    Mic, MicOff, Trash2, Copy, Rocket, Lightbulb, Play, Square, Sparkles, FolderPlus, ArrowUpRight, Check,
    Wallet, Coins
} from 'lucide-react';
import type { ChronosTelemetry, LabComponentProps, NetworkProject } from '../types';
import { sttService } from '../services/sttService';
import { safeStorage } from '../services/safeStorage';
import { toast } from 'sonner';
import { RealWorldSpendingWallet } from './RealWorldSpendingWallet';
import { EternalMemoryVault } from './EternalMemoryVault';
import { TreasuryLedger } from './TreasuryLedger';

interface InspirationShard {
    id: string;
    text: string;
    timestamp: number;
    category: string;
    complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    resonance: number;
}

export const ChronosDashboard: React.FC<LabComponentProps> = ({ onActionReward }) => {
    // ----------------------------------------------------
    // Existing Chronos States & Telemetry Logic
    // ----------------------------------------------------
    const [telemetry, setTelemetry] = useState<ChronosTelemetry>({
        iops: 11240000,
        latency: 0.02,
        shardsActive: 10000,
        pzisSignature: '0x3E2_CHRONOS_INIT',
        noHurpStability: 99.1
    });
    
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [activeNodes, setActiveNodes] = useState<Set<number>>(new Set());
    const [witnessedNodes, setWitnessedNodes] = useState<Set<number>>(new Set());
    const [selectedTab, setSelectedTab] = useState<'ALL' | 'SECURITY' | 'LATTICE' | 'STT'>('ALL');
    const [currentSection, setCurrentSection] = useState<'MESH' | 'INSPIRATION' | 'WALLET' | 'MEMORY' | 'TREASURY'>('MESH');

    // ----------------------------------------------------
    // New Inspiration & STT States
    // ----------------------------------------------------
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [manualInput, setManualInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('#idea');
    const [selectedComplexity, setSelectedComplexity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
    const [shards, setShards] = useState<InspirationShard[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Filter and search state for Shards
    const [shardSearch, setShardSearch] = useState('');
    const [activeShardFilter, setActiveShardFilter] = useState('ALL');

    // ----------------------------------------------------
    // Telemetry & Simulated Node Activity Loop
    // ----------------------------------------------------
    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry(prev => ({
                ...prev,
                iops: Math.max(11200000, prev.iops + (Math.random() - 0.5) * 50000),
                latency: Math.max(0.015, Math.min(0.025, prev.latency + (Math.random() - 0.5) * 0.002)),
                pzisSignature: `PZIS_${Math.random().toString(36).substring(7).toUpperCase()}`
            }));

            // Random grid activity
            const newActive = new Set<number>();
            const newWitnessed = new Set<number>();
            for(let i=0; i<400; i++) {
                if(Math.random() > 0.95) newActive.add(i);
                if(Math.random() > 0.98) newWitnessed.add(i);
            }
            setActiveNodes(newActive);
            setWitnessedNodes(newWitnessed);

            // Log activity
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            const logCategory = Math.random() > 0.5 ? 'LATTICE' : 'SECURITY';
            const log = `[${time}] ${logCategory} >> ${logCategory === 'SECURITY' ? 'IDENTITY_CHECK' : 'LATTICE_LOCK'} [ADDR: 0x7FFF0${Math.floor(Math.random()*999)}]`;
            setTerminalLogs(prev => [log, ...prev].slice(0, 30));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // ----------------------------------------------------
    // Inspiration Shards Storage & Subscription Loop
    // ----------------------------------------------------
    useEffect(() => {
        const loadShards = async () => {
            const saved = await safeStorage.getItem('aetheros_inspiration_shards');
            if (saved) {
                try {
                    setShards(JSON.parse(saved));
                } catch (e) {
                    console.error("Error parsing inspiration shards", e);
                }
            } else {
                const initial: InspirationShard[] = [
                    {
                        id: 'sh-1',
                        text: 'Integrate a multi-threaded quantum solver into the cellular grid logic pattern compiler.',
                        timestamp: Date.now() - 3600000 * 2,
                        category: '#kernel',
                        complexity: 'HIGH',
                        resonance: 94
                    },
                    {
                        id: 'sh-2',
                        text: 'Implement visual cascade failure logs using WebGL shaders for immediate system warning analytics.',
                        timestamp: Date.now() - 3600000 * 5,
                        category: '#feature',
                        complexity: 'MEDIUM',
                        resonance: 88
                    }
                ];
                setShards(initial);
                await safeStorage.setItem('aetheros_inspiration_shards', JSON.stringify(initial));
            }
        };
        loadShards();
    }, []);

    // Speech recognition subscription
    useEffect(() => {
        const unsubscribe = sttService.subscribe((listening, text, isInterim) => {
            setIsListening(listening);
            if (listening && text) {
                if (!isInterim) {
                    setManualInput(prev => {
                        const base = prev.trim();
                        return base ? `${base} ${text.trim()}` : text.trim();
                    });
                    setInterimTranscript('');
                    
                    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
                    setTerminalLogs(prev => [`[${time}] STT >> COMMITTED CHUNK: "${text.trim()}"`, ...prev]);
                } else {
                    setInterimTranscript(text);
                }
            }
        });

        return () => {
            unsubscribe();
            sttService.stop();
        };
    }, []);

    // Helper to persist shards
    const updateAndPersistShards = async (updated: InspirationShard[]) => {
        setShards(updated);
        await safeStorage.setItem('aetheros_inspiration_shards', JSON.stringify(updated));
    };

    // Trigger STT voice recognition
    const handleToggleRecording = () => {
        if (isListening) {
            sttService.stop();
            setIsListening(false);
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            setTerminalLogs(prev => [`[${time}] STT >> NEURAL EAR DISENGAGED`, ...prev]);
            toast.info('Voice Capture Stopped', {
                description: 'Speech recognition engine returned to passive standby.',
            });
        } else {
            setInterimTranscript('');
            sttService.start(
                (finalText) => {
                    if (finalText?.trim()) {
                        setManualInput(prev => {
                            const base = prev.trim();
                            return base ? `${base} ${finalText.trim()}` : finalText.trim();
                        });
                    }
                },
                () => {
                    setIsListening(false);
                }
            );
            setIsListening(true);
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            setTerminalLogs(prev => [`[${time}] STT >> NEURAL EAR ENGAGED & LISTENING`, ...prev]);
            toast.success('Voice Capture Active', {
                description: 'AetherOS is listening to your rapid-fire inspirations.',
            });
        }
    };

    // Save a new shard
    const handleCommitShard = async () => {
        if (!manualInput.trim()) {
            toast.error('Inspiration Empty', {
                description: 'Please dictate or type your idea before committing.',
            });
            return;
        }

        const newShard: InspirationShard = {
            id: `shard-${Date.now()}`,
            text: manualInput.trim(),
            timestamp: Date.now(),
            category: selectedCategory,
            complexity: selectedComplexity,
            resonance: Math.floor(Math.random() * 20) + 81 // 81 to 100%
        };

        const updated = [newShard, ...shards];
        await updateAndPersistShards(updated);
        setManualInput('');
        setInterimTranscript('');
        
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        setTerminalLogs(prev => [`[${time}] STT >> NEW SHARD SECURED [ID: ${newShard.id}]`, ...prev]);

        if (onActionReward) {
            onActionReward(10); // Reward operator with CPH or reputation
        }

        toast.success('Inspiration Shard Secured', {
            description: 'Your idea has been committed to the neural storage vault.',
        });
    };

    // Delete a shard
    const handleDeleteShard = async (id: string) => {
        const updated = shards.filter(s => s.id !== id);
        await updateAndPersistShards(updated);
        toast.info('Shard Purged', {
            description: 'The inspiration shard has been deleted from persistent vault.',
        });
    };

    // Copy Shard text to clipboard
    const handleCopyShard = (shard: InspirationShard) => {
        navigator.clipboard.writeText(shard.text);
        setCopiedId(shard.id);
        toast.success('Copied to Clipboard', {
            description: 'Shard text is loaded into your terminal session.',
        });
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Promote Shard to a real Project Campaign!
    const handlePromoteToProject = async (shard: InspirationShard) => {
        try {
            const rawProjects = await safeStorage.getItem('aetheros_projects');
            let projectList: NetworkProject[] = [];
            if (rawProjects) {
                try {
                    projectList = JSON.parse(rawProjects);
                } catch (e) {
                    projectList = [];
                }
            }

            // Create a clean, futuristic project structure
            const titleWordCount = shard.text.split(' ');
            const suggestedTitle = titleWordCount.slice(0, 4).join(' ') + (titleWordCount.length > 4 ? '...' : '');

            const newProject: NetworkProject = {
                id: `proj-${Date.now()}`,
                title: `Campaign: ${suggestedTitle.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")}`,
                description: shard.text,
                fightVector: shard.complexity === 'CRITICAL' ? 10 : shard.complexity === 'HIGH' ? 8 : shard.complexity === 'MEDIUM' ? 6 : 4,
                crazyLevel: Math.floor(Math.random() * 5) + 5, // 5 to 10
                status: 'IDEATING',
                isWisdomHarmonized: false,
                timestamp: new Date(),
                tasks: [
                    {
                        id: `task-${Date.now()}-1`,
                        text: 'Conduct initial quantum-resonance logic audit',
                        description: 'Audit requirements and core math foundations for the system.',
                        completed: false,
                        priority: 'MEDIUM',
                        createdAt: Date.now(),
                        status: 'TODO'
                    },
                    {
                        id: `task-${Date.now()}-2`,
                        text: 'Compile blueprint interface and mock sandbox environment',
                        completed: false,
                        priority: 'HIGH',
                        createdAt: Date.now(),
                        status: 'TODO'
                    }
                ],
                tags: [shard.category.replace('#', ''), shard.complexity.toLowerCase()],
                collaborators: ['Maestro Solo']
            };

            const updatedProjects = [newProject, ...projectList];
            await safeStorage.setItem('aetheros_projects', JSON.stringify(updatedProjects));

            // Remove shard now that it is successfully promoted to projects list!
            const remainingShards = shards.filter(s => s.id !== shard.id);
            await updateAndPersistShards(remainingShards);

            // Also send custom event to trigger projects list reload if App.tsx is listening
            window.dispatchEvent(new CustomEvent('aetheros_projects_updated'));

            toast.success('Shard Promoted to Campaign', {
                description: `Transferred idea to Sovereign Projects Hub as "${newProject.title}".`,
                duration: 4000
            });
        } catch (error) {
            console.error("Failed to promote shard to project", error);
            toast.error('Promotion Failed', {
                description: 'An error occurred during state transfer.',
            });
        }
    };

    // Filtered logs
    const filteredLogs = terminalLogs.filter(log => {
        if (selectedTab === 'ALL') return true;
        if (selectedTab === 'SECURITY') return log.includes('SECURITY >>');
        if (selectedTab === 'LATTICE') return log.includes('LATTICE >>');
        if (selectedTab === 'STT') return log.includes('STT >>');
        return true;
    });

    // Filtered shards
    const filteredShards = shards.filter(shard => {
        const matchesSearch = shard.text.toLowerCase().includes(shardSearch.toLowerCase()) || 
                              shard.category.toLowerCase().includes(shardSearch.toLowerCase());
        const matchesCategory = activeShardFilter === 'ALL' || shard.category === activeShardFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 pb-16 w-full">
            
            {/* Header Telemetry Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card bg-[#030307]/90 p-4 rounded-xl border border-sky-500/10 flex items-center gap-4 hover:border-sky-500/20 transition-all">
                    <div className="p-3 bg-sky-500/10 rounded-lg border border-sky-500/20 text-sky-400">
                        <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Mesh IOPS Realtime</div>
                        <div className="text-lg font-black font-mono text-sky-400">{(telemetry.iops / 1000000).toFixed(2)}M</div>
                    </div>
                </div>
                
                <div className="glass-card bg-[#030307]/90 p-4 rounded-xl border border-purple-500/10 flex items-center gap-4 hover:border-purple-500/20 transition-all">
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Sync Latency</div>
                        <div className="text-lg font-black font-mono text-purple-400">{telemetry.latency.toFixed(3)} ms</div>
                    </div>
                </div>

                <div className="glass-card bg-[#030307]/90 p-4 rounded-xl border border-emerald-500/10 flex items-center gap-4 hover:border-emerald-500/20 transition-all">
                    <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Lattice Finality</div>
                        <div className="text-lg font-black font-mono text-emerald-400">T0 / {(telemetry.noHurpStability).toFixed(1)}%</div>
                    </div>
                </div>

                <div className="glass-card bg-[#030307]/90 p-4 rounded-xl border border-amber-500/10 flex items-center gap-4 hover:border-amber-500/20 transition-all">
                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
                        <Brain className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Active Inspiration</div>
                        <div className="text-lg font-black font-mono text-amber-400">{shards.length} Shards</div>
                    </div>
                </div>
            </div>

            {/* Custom Section Selector Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/70 p-2.5 rounded-2xl border border-stone-800/80 backdrop-blur-md">
                <div className="flex items-center gap-3 pl-3 py-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-stone-300 uppercase tracking-widest">Chronos Control Platform</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#010103] border border-stone-900 rounded-xl">
                    <button
                        onClick={() => setCurrentSection('MESH')}
                        className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            currentSection === 'MESH'
                                ? 'bg-amber-500 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-black'
                                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                        }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        K10 LATTICE MESH
                    </button>
                    <button
                        onClick={() => setCurrentSection('INSPIRATION')}
                        className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            currentSection === 'INSPIRATION'
                                ? 'bg-amber-500 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-black'
                                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                        }`}
                    >
                        <Lightbulb className="w-3.5 h-3.5" />
                        NEURAL INSPIRATION
                    </button>
                    <button
                        onClick={() => setCurrentSection('WALLET')}
                        className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            currentSection === 'WALLET'
                                ? 'bg-amber-500 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-black'
                                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                        }`}
                    >
                        <Wallet className="w-3.5 h-3.5" />
                        REAL-WORLD WALLET
                    </button>
                    <button
                        onClick={() => setCurrentSection('TREASURY')}
                        className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            currentSection === 'TREASURY'
                                ? 'bg-amber-500 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-black'
                                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                        }`}
                    >
                        <Coins className="w-3.5 h-3.5" />
                        TREASURY LEDGER
                    </button>
                    <button
                        onClick={() => setCurrentSection('MEMORY')}
                        className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            currentSection === 'MEMORY'
                                ? 'bg-amber-500 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-black'
                                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                        }`}
                    >
                        <Brain className="w-3.5 h-3.5" />
                        ETERNAL MEMORY
                    </button>
                </div>
            </div>

            {/* Section 1: K10 Lattice Mesh & Logs */}
            {currentSection === 'MESH' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                    
                    {/* Shard Grid Visualizer (Left - 2 Columns) */}
                    <div className="lg:col-span-2 glass-card bg-[#020205]/95 p-6 rounded-2xl border border-stone-800 shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-black tracking-tighter uppercase italic text-stone-100 flex items-center gap-2">
                                        <Code className="w-5 h-5 text-sky-400" />
                                        K10 Hyper-Shard Mesh
                                    </h2>
                                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">MATRIX_SIGNATURE: {telemetry.pzisSignature}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-sky-400/90 bg-sky-950/20 px-3 py-1.5 rounded-full border border-sky-900/30">
                                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                                    ACTIVE LATTICE MESH
                                </div>
                            </div>
                            
                            <div className="shard-grid bg-[#030307] p-4 rounded-xl border border-stone-900/80 min-h-[220px]">
                                {Array.from({ length: 400 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`shard-node transition-all duration-700 ${activeNodes.has(i) ? 'active bg-sky-500 shadow-[0_0_8px_#0ea5e9]' : witnessedNodes.has(i) ? 'witnessed bg-purple-600 shadow-[0_0_8px_#a855f7]' : 'bg-stone-900/40'}`}
                                        style={{
                                            width: '100%',
                                            paddingBottom: '100%',
                                            borderRadius: '2px',
                                            opacity: activeNodes.has(i) || witnessedNodes.has(i) ? 1 : 0.25
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                            <div className="p-3 bg-zinc-950/80 border border-stone-900 rounded-xl">
                                <div className="text-[10px] text-stone-500 font-bold uppercase mb-0.5">Total Shards</div>
                                <div className="text-base font-black font-mono text-stone-100">10,000</div>
                            </div>
                            <div className="p-3 bg-zinc-950/80 border border-stone-900 rounded-xl">
                                <div className="text-[10px] text-stone-500 font-bold uppercase mb-0.5">Mesh Finality</div>
                                <div className="text-base font-black font-mono text-sky-400">T0</div>
                            </div>
                            <div className="p-3 bg-zinc-950/80 border border-stone-900 rounded-xl">
                                <div className="text-[10px] text-stone-500 font-bold uppercase mb-0.5">Mesh Health</div>
                                <div className="text-base font-black font-mono text-emerald-400">{telemetry.noHurpStability}%</div>
                            </div>
                            <div className="p-3 bg-zinc-950/80 border border-stone-900 rounded-xl">
                                <div className="text-[10px] text-stone-500 font-bold uppercase mb-0.5">PZIS Rotation</div>
                                <div className="text-base font-black font-mono text-stone-300">0.011ms</div>
                            </div>
                        </div>
                    </div>

                    {/* Security Terminal Log (Right - 1 Column) */}
                    <div className="lg:col-span-1 glass-card bg-[#020205]/95 p-6 rounded-2xl border border-stone-800 shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex flex-col h-[480px]">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-900">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                                    <Terminal className="w-3.5 h-3.5 text-stone-500" />
                                    PZIS SYSTEM LOGS
                                </h3>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/40">ARMED</span>
                        </div>

                        {/* Filter tabs for logs */}
                        <div className="flex gap-1 mb-3 text-[9px] font-bold font-mono">
                            {(['ALL', 'SECURITY', 'LATTICE', 'STT'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`flex-1 py-1 rounded transition-colors ${selectedTab === tab ? 'bg-stone-800 text-stone-100 border border-stone-700' : 'text-stone-500 hover:text-stone-300'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex-grow font-mono text-[10px] space-y-1.5 overflow-y-auto custom-scrollbar text-stone-400/90 bg-[#010103] p-3 rounded-lg border border-stone-950">
                            {filteredLogs.length === 0 ? (
                                <div className="text-stone-600 italic text-center py-8">No matching records available.</div>
                            ) : (
                                filteredLogs.map((log, i) => {
                                    let color = 'text-sky-400/80';
                                    if (log.includes('SECURITY >>')) color = 'text-amber-500/80';
                                    if (log.includes('STT >>')) color = 'text-purple-400/90';
                                    if (log.includes('LATTICE >>')) color = 'text-sky-400/80';
                                    return (
                                        <div key={i} className="animate-in slide-in-from-left-1 border-b border-stone-950 pb-1">
                                            <span className="text-stone-600 mr-1.5">&gt;&gt;</span>
                                            <span className={color}>{log}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        
                        <div className="mt-3 pt-2 border-t border-stone-900 flex justify-between items-center text-[10px] font-mono text-stone-500">
                            <span>LATTICE_LOCK_AGENT</span>
                            <button 
                                onClick={() => setTerminalLogs([])}
                                className="text-stone-500 hover:text-amber-400 transition-colors uppercase font-bold"
                            >
                                [Clear Session]
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 2: Neural Inspiration STT & Notes */}
            {currentSection === 'INSPIRATION' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="glass-card bg-[#020205]/95 p-8 rounded-2xl border border-stone-800 shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-stone-900 pb-4">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter italic text-stone-100 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-amber-500" />
                                    Neural Inspiration & Ideas Vault
                                </h3>
                                <p className="text-xs text-stone-500 font-mono mt-0.5">Siphon rapid-fire technical ideas into active development campaigns using the neural STT ear.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-stone-500 font-mono">Ear Status:</span>
                                <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border ${isListening ? 'text-red-400 bg-red-950/20 border-red-900/30' : 'text-stone-500 bg-stone-950/20 border-stone-900/30'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-stone-700'}`}></span>
                                    {isListening ? 'NEURAL EAR ACTIVE' : 'PASSIVE STANDBY'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Left Column: Input and Capture controls (5 cols) */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="bg-[#030307] p-5 rounded-xl border border-stone-900 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs text-stone-400 font-bold uppercase tracking-wider">Neural Input Terminal</label>
                                        <span className="text-[9px] font-mono text-stone-600">Voice-ready via sttService</span>
                                    </div>

                                    {/* Voice-to-Text Live Transcript Panel */}
                                    <div className="relative">
                                        <textarea
                                            value={manualInput}
                                            onChange={(e) => setManualInput(e.target.value)}
                                            placeholder={isListening ? "Listening... Speak naturally to record your idea directly into this terminal..." : "Engage the neural ear below to record your voice, or start typing your inspiration here..."}
                                            className="w-full h-32 bg-[#010103] text-stone-200 placeholder-stone-600 text-xs font-mono p-4 rounded-lg border border-stone-800 outline-none focus:border-amber-500/40 transition-colors custom-scrollbar resize-none"
                                        />

                                        {/* Live Interim floating box */}
                                        <AnimatePresence>
                                            {isListening && interimTranscript && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 5 }}
                                                    className="absolute bottom-2 left-2 right-2 bg-amber-950/90 border border-amber-900/50 rounded p-2 text-[10px] font-mono text-amber-300 italic flex items-center gap-2 shadow-lg"
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                                                    <span>Streaming: "{interimTranscript}"</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Capture Controls */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {/* Microphone Toggle Button */}
                                        <button
                                            onClick={handleToggleRecording}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border ${isListening ? 'bg-red-500 text-stone-100 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)] hover:bg-red-600' : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800 hover:border-stone-700'}`}
                                        >
                                            {isListening ? (
                                                <>
                                                    <MicOff className="w-4 h-4 animate-bounce" />
                                                    Disengage Ear
                                                </>
                                            ) : (
                                                <>
                                                    <Mic className="w-4 h-4 text-amber-500" />
                                                    Engage Ear
                                                </>
                                            )}
                                        </button>

                                        {/* Commit Note Button */}
                                        <button
                                            onClick={handleCommitShard}
                                            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-stone-950 hover:bg-amber-400 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Secure Shard
                                        </button>
                                    </div>
                                </div>

                                {/* Tagging and Settings Panel */}
                                <div className="bg-[#030307] p-5 rounded-xl border border-stone-900 space-y-4">
                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Classification Tags</h4>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-stone-500 font-bold uppercase mb-1.5">Category</label>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full bg-[#010103] text-stone-300 font-mono text-xs p-2 rounded border border-stone-850 outline-none focus:border-amber-500/40"
                                            >
                                                <option value="#idea">#idea (General concept)</option>
                                                <option value="#kernel">#kernel (Low level spec)</option>
                                                <option value="#system">#system (Arch & Flow)</option>
                                                <option value="#feature">#feature (Enhancement)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] text-stone-500 font-bold uppercase mb-1.5">Complexity</label>
                                            <select
                                                value={selectedComplexity}
                                                onChange={(e) => setSelectedComplexity(e.target.value as any)}
                                                className="w-full bg-[#010103] text-stone-300 font-mono text-xs p-2 rounded border border-stone-850 outline-none focus:border-amber-500/40"
                                            >
                                                <option value="LOW">LOW Complexity</option>
                                                <option value="MEDIUM">MEDIUM Severity</option>
                                                <option value="HIGH">HIGH Stride</option>
                                                <option value="CRITICAL">CRITICAL Core</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: List of saved notes/shards (7 cols) */}
                            <div className="lg:col-span-7 flex flex-col justify-between space-y-4 min-h-[360px]">
                                
                                {/* Search and Filters */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex-grow relative">
                                        <input
                                            type="text"
                                            value={shardSearch}
                                            onChange={(e) => setShardSearch(e.target.value)}
                                            placeholder="Search secured inspiration shards..."
                                            className="w-full bg-[#030307] text-stone-300 font-mono text-xs pl-8 pr-4 py-2 rounded-lg border border-stone-900 outline-none focus:border-amber-500/40"
                                        />
                                        <span className="absolute left-2.5 top-2.5 text-stone-500 text-xs">🔍</span>
                                    </div>

                                    <div className="flex gap-1 text-[9px] font-bold font-mono">
                                        {['ALL', '#idea', '#kernel', '#system', '#feature'].map(filter => (
                                            <button
                                                key={filter}
                                                onClick={() => setActiveShardFilter(filter)}
                                                className={`px-2.5 py-1.5 rounded transition-colors ${activeShardFilter === filter ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-400 hover:text-stone-200'}`}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Shards Vault List */}
                                <div className="flex-grow overflow-y-auto max-h-[300px] custom-scrollbar space-y-3 bg-[#010103] p-3 rounded-xl border border-stone-950">
                                    {filteredShards.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                                            <p className="text-xs font-mono text-stone-600">No inspiration shards found matching filter criteria.</p>
                                            <p className="text-[10px] text-stone-700 font-mono mt-1">Record or write your first idea to populate the neural vault.</p>
                                        </div>
                                    ) : (
                                        <AnimatePresence initial={false}>
                                            {filteredShards.map((shard) => {
                                                let complexityColor = 'text-green-500 border-green-950 bg-green-950/20';
                                                if (shard.complexity === 'MEDIUM') complexityColor = 'text-amber-500 border-amber-950 bg-amber-950/20';
                                                if (shard.complexity === 'HIGH') complexityColor = 'text-orange-500 border-orange-950 bg-orange-950/20';
                                                if (shard.complexity === 'CRITICAL') complexityColor = 'text-red-500 border-red-950 bg-red-950/20';

                                                return (
                                                    <motion.div
                                                        key={shard.id}
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="bg-[#030307] p-4 rounded-xl border border-stone-900 hover:border-stone-800 transition-all flex flex-col justify-between gap-3 group relative overflow-hidden"
                                                    >
                                                        {/* Left border highlight based on category */}
                                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${shard.category === '#kernel' ? 'bg-sky-500' : shard.category === '#system' ? 'bg-purple-500' : shard.category === '#feature' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                                                        <div className="flex justify-between items-start pl-2 gap-4">
                                                            <p className="text-xs text-stone-200 font-medium leading-relaxed">{shard.text}</p>
                                                            <div className="flex gap-1 shrink-0">
                                                                {/* Copy Button */}
                                                                <button 
                                                                    onClick={() => handleCopyShard(shard)}
                                                                    className="p-1.5 bg-stone-950 hover:bg-stone-900 border border-stone-850 rounded text-stone-500 hover:text-stone-300 transition-colors"
                                                                    title="Copy Shard Text"
                                                                >
                                                                    {copiedId === shard.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                                </button>
                                                                {/* Delete Button */}
                                                                <button 
                                                                    onClick={() => handleDeleteShard(shard.id)}
                                                                    className="p-1.5 bg-stone-950 hover:bg-stone-900 border border-stone-850 rounded text-stone-500 hover:text-red-400 transition-colors"
                                                                    title="Purge Shard"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center justify-between pl-2 pt-2 border-t border-stone-900/50 text-[10px] font-mono text-stone-500">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-stone-400 font-bold">{shard.category}</span>
                                                                <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${complexityColor}`}>{shard.complexity}</span>
                                                                <span className="text-stone-600">|</span>
                                                                <span className="text-stone-500 font-bold text-[9px]">Resonance: <span className="text-amber-400">{shard.resonance}%</span></span>
                                                            </div>

                                                            <div className="flex items-center gap-3 mt-1.5 sm:mt-0">
                                                                <span className="text-stone-600">{new Date(shard.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                {/* Promote to Project Button */}
                                                                <button
                                                                    onClick={() => handlePromoteToProject(shard)}
                                                                    className="flex items-center gap-1 text-[9px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 px-2 py-0.5 rounded transition-all"
                                                                    title="Convert this Shard to a project campaign"
                                                                >
                                                                    <Rocket className="w-2.5 h-2.5" />
                                                                    Promote Campaign
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Performance Analysis Card (Equalizer Visualizer Style) */}
                    <div className="glass-card bg-[#020205]/95 p-8 rounded-2xl border border-stone-800 shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tighter italic text-stone-100 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-sky-400" />
                                    Throughput Sensation Analysis
                                </h3>
                                <p className="text-[10px] text-stone-500 font-mono mt-0.5">FORENSIC TELEMETRY STREAM // QUANTUM WAVE OSCILLATION</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
                                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">IOPS Realtime</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Witness Level</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-32 w-full bg-[#030307] rounded-xl border border-stone-900 flex items-end p-4 gap-1.5 overflow-hidden">
                            {Array.from({ length: 64 }).map((_, i) => {
                                const h = 20 + Math.random() * 75;
                                const isEven = i % 2 === 0;
                                return (
                                    <div 
                                        key={i} 
                                        className={`flex-1 transition-all duration-700 hover:opacity-80 rounded-t-sm cursor-crosshair ${isEven ? 'bg-sky-500/80 hover:bg-sky-400' : 'bg-purple-600/80 hover:bg-purple-500'}`}
                                        style={{ height: `${h}%` }}
                                        title={`Node ${i} Output: ${Math.floor(h * 150000)} IOPS`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Section 3: Real World Spending Wallet */}
            {currentSection === 'WALLET' && (
                <div className="animate-in fade-in duration-300">
                    <RealWorldSpendingWallet />
                </div>
            )}

            {/* Section 4: Treasury Ledger */}
            {currentSection === 'TREASURY' && (
                <div className="animate-in fade-in duration-300">
                    <TreasuryLedger />
                </div>
            )}

            {/* Section 5: Eternal Memory Vault */}
            {currentSection === 'MEMORY' && (
                <div className="animate-in fade-in duration-300">
                    <EternalMemoryVault />
                </div>
            )}

        </div>
    );
};
