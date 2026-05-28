
import React, { useState, useMemo, useEffect } from 'react';
import { FINTECH_AUTHORITIES } from '../constants';
import { 
    CodeIcon, ActivityIcon, ZapIcon, ShieldIcon, FireIcon, StarIcon, PlusIcon, XIcon, TerminalIcon, UserIcon, BrainIcon, LogicIcon, CheckCircleIcon, SpinnerIcon, GaugeIcon, SearchIcon, GavelIcon
} from './icons';
import type { NetworkProject, ProjectTask } from '../types';
import type { HireableAgent } from '../agentTypes';
import { AgentFactory } from '../services/AgentFactory';
import { safeStorage } from '../services/safeStorage';
import { extractJSON } from '../utils';
import { generateProjectKnowHow } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { CPHManager, CPHDisplay } from '../services/cphManager';
import { toast } from 'sonner';

const getSpecialtyBadge = (specialty: string) => {
    switch(specialty) {
        case 'security':
        case 'quantumguardian':
            return { color: 'text-red-500', bg: 'bg-red-950/30', border: 'border-red-900', icon: ShieldIcon };
        case 'build':
        case 'codesphere':
        case 'omegacoder':
            return { color: 'text-blue-500', bg: 'bg-blue-950/30', border: 'border-blue-900', icon: CodeIcon };
        case 'debug':
        case 'refactor':
        case 'microcheck':
        case 'nanolinter':
            return { color: 'text-amber-500', bg: 'bg-amber-950/30', border: 'border-amber-900', icon: ActivityIcon };
        case 'optimizer':
        case 'logic':
            return { color: 'text-cyan-500', bg: 'bg-cyan-950/30', border: 'border-cyan-900', icon: ZapIcon };
        case 'learn':
        case 'academy':
        case 'academic':
        case 'documenter':
            return { color: 'text-emerald-500', bg: 'bg-emerald-950/30', border: 'border-emerald-900', icon: BrainIcon };
        case 'templar':
        case 'bountytemplar':
        case 'judge':
            return { color: 'text-purple-500', bg: 'bg-purple-950/30', border: 'border-purple-900', icon: GavelIcon };
        default:
            return { color: 'text-gray-400', bg: 'bg-gray-900/50', border: 'border-gray-700', icon: UserIcon };
    }
};

const getStatusBadge = (status: string) => {
    switch(status) {
        case 'available':
            return { color: 'text-green-500', bg: 'bg-green-500', label: 'AVAILABLE' };
        case 'working':
            return { color: 'text-blue-500', bg: 'bg-blue-500', label: 'WORKING' };
        case 'resting':
            return { color: 'text-amber-500', bg: 'bg-amber-500', label: 'RESTING' };
        case 'quit':
            return { color: 'text-red-500', bg: 'bg-red-500', label: 'QUIT' };
        case 'on_notice':
            return { color: 'text-orange-500', bg: 'bg-orange-500', label: 'ON NOTICE' };
        default:
            return { color: 'text-gray-500', bg: 'bg-gray-500', label: status.toUpperCase() };
    }
};

interface CodingNetworkViewProps {
  projects: NetworkProject[];
  setProjects: React.Dispatch<React.SetStateAction<NetworkProject[]>>;
  agents: HireableAgent[];
  setAgents: React.Dispatch<React.SetStateAction<HireableAgent[]>>;
  onNavigateToAgent: () => void;
  onSetDirective: (directive: any) => void;
}

export const CodingNetworkView: React.FC<CodingNetworkViewProps> = ({ projects, setProjects, agents, setAgents }) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [selectedAuthority, setSelectedAuthority] = useState(FINTECH_AUTHORITIES[0].id);
    const [viewMode, setViewMode] = useState<'SHARDS' | 'SQUAD'>('SHARDS');
    const [marketplace, setMarketplace] = useState<HireableAgent[]>([]);
    const [isManifesting, setIsManifesting] = useState(false);
    const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
    const [crazyLevel, setCrazyLevel] = useState(5);
    const [fightVector, setFightVector] = useState(80);

    // Filtering State
    const [squadSpecialtyFilter, setSquadSpecialtyFilter] = useState<string>('all');
    const [squadStatusFilter, setSquadStatusFilter] = useState<string>('all');
    const [marketSpecialtyFilter, setMarketSpecialtyFilter] = useState<string>('all');

    // Agent Editing State
    const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
    const [editedPatience, setEditedPatience] = useState<number>(0);
    const [editedConfidence, setEditedConfidence] = useState<number>(0);
    const [editedIndependence, setEditedIndependence] = useState<number>(0);
    const [editedLoyalty, setEditedLoyalty] = useState<number>(0);
    const [editedAdaptability, setEditedAdaptability] = useState<number>(0);
    const [editedWorkload, setEditedWorkload] = useState<'light' | 'moderate' | 'heavy'>('moderate');
    const [editedDomains, setEditedDomains] = useState<string[]>([]);
    const [editedQuirks, setEditedQuirks] = useState<string[]>([]);
    const [newDomainInput, setNewDomainInput] = useState('');
    const [newQuirkInput, setNewQuirkInput] = useState('');

    const startEditingAgent = (agent: HireableAgent) => {
        setEditingAgentId(agent.id);
        setEditedPatience(agent.personality?.patience ?? 50);
        setEditedConfidence(agent.personality?.confidence ?? 50);
        setEditedIndependence(agent.personality?.independence ?? 50);
        setEditedLoyalty(agent.personality?.loyalty ?? 50);
        setEditedAdaptability(agent.personality?.adaptability ?? 50);
        setEditedWorkload(agent.personality?.preferredWorkload ?? 'moderate');
        setEditedDomains(agent.personality?.preferredDomains ?? []);
        setEditedQuirks(agent.personality?.quirks ?? []);
        setNewDomainInput('');
        setNewQuirkInput('');
    };

    const saveAgentChanges = (agentId: string) => {
        setAgents(prev => prev.map(a => {
            if (a.id === agentId) {
                return {
                    ...a,
                    personality: {
                        ...a.personality,
                        patience: editedPatience,
                        confidence: editedConfidence,
                        independence: editedIndependence,
                        loyalty: editedLoyalty,
                        adaptability: editedAdaptability,
                        preferredWorkload: editedWorkload,
                        preferredDomains: editedDomains,
                        quirks: editedQuirks
                    }
                };
            }
            return a;
        }));
        setEditingAgentId(null);
    };

    // --- RELIABILITY PROTOCOL: PERSISTENCE ---
    useEffect(() => {
        const loadShards = async () => {
            const savedShards = await safeStorage.getItem('AETHER_NET_SHARDS');
            if (savedShards) {
                const parsed = extractJSON<NetworkProject[]>(savedShards, []);
                if (projects.length === 0 && parsed.length > 0) {
                    setProjects(parsed.map(p => ({...p, timestamp: new Date(p.timestamp)})));
                }
            }
        };
        loadShards();
    }, []);

    useEffect(() => {
        const persist = async () => {
            if (projects.length > 0) {
                await safeStorage.setItem('AETHER_NET_SHARDS', JSON.stringify(projects));
            }
        };
        persist();
    }, [projects]);



    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (title.length < 3 || isManifesting) return;

        setIsManifesting(true);

        // 1. Initial Shard Construction
        const newProject: NetworkProject = {
            id: `CRAZY_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            title,
            description: desc || "Awaiting architectural definition...",
            fightVector: fightVector,
            crazyLevel: crazyLevel,
            status: 'IDEATING',
            isWisdomHarmonized: false,
            timestamp: new Date(),
            tasks: [],
            authorityId: selectedAuthority,
            knowHow: "Siphoning Gifted Logic..."
        };

        // 2. Add to Grid immediately (Visual Feedback)
        setProjects(prev => [newProject, ...prev]);
        setTitle('');
        setDesc('');

        // 3. GIFTED PROTOCOL: Siphon Wisdom from Sovereign API
        try {
            const wisdom = await generateProjectKnowHow(newProject.title, newProject.description, 'CRAZY_KERNEL');
            
            setProjects(prev => prev.map(p => 
                p.id === newProject.id 
                ? { ...p, knowHow: wisdom, isWisdomHarmonized: true, status: 'FORGING' } 
                : p
            ));
        } catch (e) {
            console.error("Wisdom siphon stalled.");
        } finally {
            setIsManifesting(false);
        }
    };

    const deleteProject = async (id: string) => {
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        await safeStorage.setItem('AETHER_NET_SHARDS', JSON.stringify(updated));
    };


    const handleTaskInputChange = (projectId: string, value: string) => {
        setTaskInputs(prev => ({...prev, [projectId]: value}));
    };

    const handleAddTask = (projectId: string) => {
        const text = taskInputs[projectId];
        if (!text?.trim()) return;

        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const newTask: ProjectTask = { 
                    id: uuidv4(), 
                    text: text.trim(), 
                    completed: false,
                    createdAt: Date.now()
                };
                return { ...p, tasks: [...(p.tasks || []), newTask] };
            }
            return p;
        }));
        setTaskInputs(prev => ({...prev, [projectId]: ''}));
    };

    const toggleTask = (projectId: string, taskId: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
                };
            }
            return p;
        }));
    };

    const refreshMarketplace = () => {
        const newAgents = AgentFactory.generateMarketplace(6);
        setMarketplace(newAgents);
    };

    React.useEffect(() => {
        if (marketplace.length === 0) {
            refreshMarketplace();
        }
    }, []);

    const hireAgent = (agent: HireableAgent) => {
        const currentBudget = CPHManager.calculateBudget(agents);
        const { canAfford, reason } = CPHManager.canAfford(currentBudget, agent.currentSalary);
        if (!canAfford) {
            toast.error(`CPH Capacity Fracture: ${reason}. Please pause or dismiss someone first.`);
            return;
        }
        const hiredAgent = { ...agent, status: 'available' as const, hireDate: new Date() };
        setAgents(prev => [...prev, hiredAgent]);
        setMarketplace(prev => prev.filter(a => a.id !== agent.id));
        toast.success(`Hired ${agent.name} (${agent.currentSalary} CPH allocated)`);
    };

    const fireAgent = (id: string) => {
        const agentName = agents.find(a => a.id === id)?.name || "Agent";
        setAgents(prev => prev.filter(a => a.id !== id));
        toast.info(`Dismissed ${agentName} from Coding Network`);
    };

    const toggleAgentPause = (id: string) => {
        setAgents(prev => prev.map(a => {
            if (a.id === id) {
                const newStatus = a.status === 'resting' ? 'available' as const : 'resting' as const;
                toast.info(`${a.name} is now ${newStatus === 'resting' ? 'on Standby (2% idle cost)' : 'Active (100% compute allocation)'}`);
                return { ...a, status: newStatus };
            }
            return a;
        }));
    };

    const filteredAgents = useMemo(() => {
        return agents.filter(agent => {
            const specialtyMatch = squadSpecialtyFilter === 'all' || agent.specialty === squadSpecialtyFilter;
            const statusMatch = squadStatusFilter === 'all' || agent.status === squadStatusFilter;
            return specialtyMatch && statusMatch;
        });
    }, [agents, squadSpecialtyFilter, squadStatusFilter]);

    const currentBudget = useMemo(() => {
        return CPHManager.calculateBudget(agents);
    }, [agents]);

    const pricingTier = useMemo(() => {
        return CPHManager.getPricingTier();
    }, []);

    const optimizationSuggestions = useMemo(() => {
        return CPHManager.suggestOptimizations(currentBudget);
    }, [currentBudget]);

    const filteredMarketplace = useMemo(() => {
        return marketplace.filter(agent => {
            return marketSpecialtyFilter === 'all' || agent.specialty === marketSpecialtyFilter;
        });
    }, [marketplace, marketSpecialtyFilter]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 h-full flex flex-col bg-black overflow-hidden">
            {/* Header / Nav */}
            <div className="p-6 border-b-8 border-black bg-black flex justify-between items-center shadow-xl z-20">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-violet-600/10 border-4 border-violet-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.3)] transition-transform hover:scale-110">
                        <BrainIcon className="w-10 h-10 text-violet-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white tracking-tighter italic uppercase leading-none">MY CODING NETWORK</h2>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="px-4 py-1 bg-violet-600 text-black text-[10px] font-black rounded-full uppercase">Reliable Series</div>
                             <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Pleasure of Know-How</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setViewMode('SHARDS')}
                        className={`px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-4 border-black shadow-lg ${viewMode === 'SHARDS' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-gray-500'}`}
                    >
                        Active Shards
                    </button>
                    <button 
                        onClick={() => setViewMode('SQUAD')}
                        className={`px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-4 border-black shadow-lg ${viewMode === 'SQUAD' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-gray-500'}`}
                    >
                        My Squad ({agents.length})
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(124,58,237,0.05)_0%,_transparent_70%)] pointer-events-none" />

                {viewMode === 'SHARDS' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                        
                        {/* THE CRAZY INGRESS (Left Col) */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            <div className="aero-panel bg-slate-900/90 border-4 border-violet-600/40 p-8 shadow-[10px_10px_0_0_#000] hover:scale-[1.01] transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                    <FireIcon className="w-8 h-8 text-violet-500 animate-pulse" />
                                    <div>
                                        <h3 className="text-2xl font-comic-header text-white uppercase italic tracking-tight">Crazy Ingress</h3>
                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Manifest Logic Shard</p>
                                    </div>
                                </div>
                                
                                <form onSubmit={handleAddProject} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Project Identity</label>
                                        <input 
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            className="w-full bg-black border-4 border-black rounded-xl p-4 text-white font-black text-lg focus:outline-none focus:border-violet-500 transition-all placeholder:text-gray-800"
                                            placeholder="e.g. CHAOS_ENGINE_V1"
                                            disabled={isManifesting}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Fight Vector</label>
                                            <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/10">
                                                <input 
                                                    type="range" min="0" max="100" 
                                                    value={fightVector} onChange={e => setFightVector(parseInt(e.target.value))}
                                                    className="w-full accent-red-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <span className="text-[10px] text-red-500 font-black">{fightVector}%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Crazy Level</label>
                                            <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/10">
                                                <input 
                                                    type="range" min="1" max="10" 
                                                    value={crazyLevel} onChange={e => setCrazyLevel(parseInt(e.target.value))}
                                                    className="w-full accent-violet-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <span className="text-[10px] text-violet-500 font-black">{crazyLevel}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Intent & Know-How</label>
                                        <textarea 
                                            value={desc}
                                            onChange={e => setDesc(e.target.value)}
                                            rows={3}
                                            className="w-full bg-black border-4 border-black rounded-xl p-4 text-xs font-mono text-gray-300 resize-none focus:outline-none focus:border-violet-500 transition-all placeholder:text-gray-800"
                                            placeholder="Describe the crazy idea..."
                                            disabled={isManifesting}
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={title.length < 3 || isManifesting}
                                        className="vista-button w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:bg-zinc-800 text-white font-black py-5 rounded-2xl transition-all shadow-[6px_6px_0_0_#000] uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:translate-y-1"
                                    >
                                        {isManifesting ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <ZapIcon className="w-5 h-5" />}
                                        {isManifesting ? 'SIPHONING WISDOM...' : 'INJECT CRAZY IDEA'}
                                    </button>
                                </form>
                            </div>

                            <div className="p-6 bg-violet-950/20 border-4 border-violet-900/30 rounded-[2rem] text-center italic text-xs text-violet-400/80 leading-relaxed shadow-inner">
                                "The network thrives on your crazy projects. Reliability is the structure we build around the chaos."
                            </div>
                        </div>

                        {/* PROJECT LATTICE (Right Col) */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3">
                                   <ActivityIcon className="w-5 h-5 text-violet-500" /> Active Shards
                                </h3>
                                <div className="text-[10px] font-mono text-gray-600">COUNT: {projects.length}</div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {projects.length === 0 ? (
                                    <div className="col-span-full py-32 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-40">
                                        <CodeIcon className="w-24 h-24 mx-auto mb-6 text-gray-700" />
                                        <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-600">No Manifested Shards</p>
                                    </div>
                                ) : projects.map(project => (
                                    <div key={project.id} className="aero-panel bg-black/60 p-8 border-4 border-black shadow-[12px_12px_0_0_#000] flex flex-col gap-6 group hover:border-violet-600/40 transition-all relative overflow-hidden">
                                        
                                        {/* Header */}
                                        <div className="flex justify-between items-start z-10 relative">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border-2 ${
                                                        project.status === 'STABLE' ? 'bg-green-600 text-black border-green-500' : 'bg-amber-500 text-black border-amber-400 animate-pulse'
                                                    }`}>
                                                        {project.status}
                                                    </span>
                                                    {project.isWisdomHarmonized && <span className="text-[8px] font-black text-cyan-400 uppercase tracking-tighter flex items-center gap-1"><StarIcon className="w-3 h-3" /> Gifted</span>}
                                                </div>
                                                <h5 className="font-black text-white uppercase text-2xl leading-none mt-2">{project.title}</h5>
                                            </div>
                                            <button onClick={() => deleteProject(project.id)} className="text-zinc-700 hover:text-red-500 transition-colors">
                                                <XIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Knowledge Console */}
                                        <div className="bg-slate-900 border-2 border-zinc-800 rounded-xl p-4 font-mono text-[10px] text-gray-400 relative overflow-hidden group/console">
                                            <div className="absolute top-0 right-0 p-2 opacity-20"><TerminalIcon className="w-8 h-8" /></div>
                                            <p className="text-[8px] font-black text-violet-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Gifted Know-How</p>
                                            <div className="max-h-24 overflow-y-auto custom-scrollbar italic leading-relaxed">
                                                "{project.knowHow || project.description}"
                                            </div>
                                        </div>

                                        {/* Reliability Stride */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">
                                                <span>Reliability_Index</span>
                                                <span className={project.tasks?.length && project.tasks.filter(t => t.completed).length === project.tasks.length ? 'text-emerald-400' : 'text-violet-500'}>
                                                    {project.tasks?.length ? Math.round((project.tasks.filter(t => t.completed).length / project.tasks.length) * 100) : 0}%
                                                </span>
                                            </div>
                                            <div className="h-3 w-full bg-black rounded-lg overflow-hidden border border-zinc-900 p-0.5 shadow-inner">
                                                <div 
                                                    className={`h-full rounded-md transition-all duration-1000 ${
                                                        project.tasks?.length && project.tasks.filter(t => t.completed).length === project.tasks.length 
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                                                        : 'bg-gradient-to-r from-violet-700 to-blue-500'
                                                    }`}
                                                    style={{ width: `${project.tasks?.length ? (project.tasks.filter(t => t.completed).length / project.tasks.length) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Original Metrics */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                                <span className="text-[7px] font-black text-red-500 uppercase block mb-1">Fight Vector</span>
                                                <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-600" style={{ width: `${project.fightVector}%` }} />
                                                </div>
                                            </div>
                                            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                                <span className="text-[7px] font-black text-violet-500 uppercase block mb-1">Crazy Level</span>
                                                <div className="flex gap-0.5">
                                                    {[...Array(10)].map((_, i) => (
                                                        <div key={i} className={`flex-1 h-1.5 rounded-sm ${i < project.crazyLevel ? 'bg-violet-500' : 'bg-gray-900'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Battle Plan (Tasks) */}
                                        <div className="border-t-2 border-white/5 pt-4 flex-1 flex flex-col min-h-[150px]">
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <ShieldIcon className="w-3 h-3" /> Battle Plan
                                            </p>
                                            
                                            <div className="flex-1 space-y-2 mb-3 overflow-y-auto custom-scrollbar pr-1">
                                                {project.tasks?.map(task => (
                                                    <div 
                                                        key={task.id}
                                                        onClick={() => toggleTask(project.id, task.id)}
                                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                                                            task.completed 
                                                            ? 'bg-green-950/20 border-green-600/30' 
                                                            : 'bg-white/5 border-transparent hover:border-violet-500/30'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-600 border-green-600' : 'bg-black border-zinc-700'}`}>
                                                                {task.completed && <CheckCircleIcon className="w-3 h-3 text-black" />}
                                                            </div>
                                                            <span className={`text-[10px] font-bold uppercase ${task.completed ? 'text-green-500/50 line-through opacity-60 italic' : 'text-gray-300'}`}>{task.text}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!project.tasks || project.tasks.length === 0) && (
                                                    <p className="text-[9px] text-gray-700 italic text-center py-4">No objectives defined.</p>
                                                )}
                                            </div>

                                            <div className="flex gap-2 mt-auto">
                                                <input 
                                                    value={taskInputs[project.id] || ''}
                                                    onChange={e => handleTaskInputChange(project.id, e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddTask(project.id)}
                                                    placeholder="Add reliable objective..."
                                                    className="flex-1 bg-black border-2 border-zinc-800 rounded-lg px-3 py-2 text-[10px] text-white focus:border-violet-600 outline-none transition-all placeholder:text-gray-700 font-bold uppercase"
                                                />
                                                <button 
                                                    onClick={() => handleAddTask(project.id)}
                                                    className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors shadow-lg active:scale-95"
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* SQUAD VIEW (WORKFORCE) */
                    <div className="space-y-12 max-w-7xl mx-auto">
                        
                        {/* CPH COMPUTE CAPACITY & TIME-BASED BUDGET CONTROLS CODESPACE */}
                        <div className="aero-panel bg-black border-4 border-violet-900/50 p-6 rounded-[2rem] relative overflow-hidden shadow-[8px_8px_0_0_rgba(124,58,237,0.2)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,_rgba(124,58,237,0.15)_0%,_transparent_70%)] pointer-events-none" />
                            
                            <div className="flex flex-col lg:flex-row justify-between gap-6 pb-6 border-b border-zinc-800">
                                <div>
                                    <h4 className="font-mono text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Compute Capacity Ledger</h4>
                                    <h3 className="font-comic-header text-4xl text-white uppercase italic">CPH Resource Engine</h3>
                                    <p className="text-[11px] text-zinc-400 mt-2 max-w-xl">
                                        Instead of abstract credits, CPH represents real compute capacity of your squad. Pause idle agents to stand them down to a 20% CPH baseline, or fire them to reclaim capacity.
                                    </p>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 items-start lg:items-center">
                                    <div className="bg-zinc-900/80 border-2 border-zinc-800 rounded-2xl px-5 py-3 font-mono">
                                        <div className="text-[9px] text-zinc-500 uppercase">Interactive Clock & Pricing Tier</div>
                                        <div className="text-sm font-bold text-violet-400 flex items-center gap-2 mt-1">
                                            <ZapIcon className="w-4 h-4 text-amber-500 animate-pulse" />
                                            <span>{pricingTier.label}</span>
                                        </div>
                                        <div className="text-[9px] text-zinc-400 mt-0.5">Time Period: {pricingTier.range} (Current Time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                                {/* Utilization Circular/Bar Progress */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="flex justify-between items-center text-xs font-mono font-bold">
                                        <span className="text-zinc-400 uppercase">Compute Utilization Rate</span>
                                        <span className={CPHDisplay.getUtilizationColor(currentBudget.utilizationRate)}>
                                            {currentBudget.utilizationRate}% ({CPHDisplay.getUtilizationLabel(currentBudget.utilizationRate)})
                                        </span>
                                    </div>
                                    
                                    <div className="h-4 bg-zinc-950 rounded-full overflow-hidden border-2 border-zinc-800 relative">
                                        {/* Warning threshold marker bar */}
                                        <div className="absolute top-0 bottom-0 left-[80%] border-l-2 border-red-500/50 z-10" title="80% Warning Threshold" />
                                        <div 
                                            className={`h-full transition-all duration-500 ${
                                                currentBudget.utilizationRate >= 90 ? 'bg-red-600' :
                                                currentBudget.utilizationRate >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${Math.min(100, currentBudget.utilizationRate)}%` }}
                                        />
                                    </div>
                                    
                                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                                        <span>Allocated / Standby Usage: {currentBudget.actualUsageCPH} CPH</span>
                                        <span>Total Capacity: {currentBudget.totalCPH} CPH</span>
                                    </div>
                                    
                                    {currentBudget.isOverCapacity && (
                                        <div className="bg-red-950/20 border border-red-900 p-3 rounded-xl flex items-center gap-3">
                                            <FireIcon className="w-5 h-5 text-red-500 animate-bounce" />
                                            <p className="text-[10px] text-red-400 uppercase font-black">
                                                Burst Capacity Activated! Operating above 1000 CPH limit incurs a 2x burst multiplier billing penalty.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Compute stats */}
                                <div className="bg-zinc-900/40 p-4 border border-zinc-800/80 rounded-2xl flex flex-col justify-between font-mono">
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase mb-2">Capacity Allocation ledger</div>
                                        <ul className="space-y-1.5 text-[10px] text-zinc-300">
                                            <li className="flex justify-between">
                                                <span>• Maximum Budget:</span>
                                                <span className="text-white font-bold">{currentBudget.totalCPH} CPH</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>• Squad Allocations:</span>
                                                <span className="text-amber-450">{currentBudget.allocatedCPH} CPH</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>• Standby Standdown:</span>
                                                <span className="text-sky-450">
                                                    {agents.reduce((sum, a) => sum + (a.status === 'resting' ? Math.round(a.currentSalary * 0.2) : 0), 0)} CPH
                                                </span>
                                            </li>
                                            <li className="flex justify-between border-t border-zinc-800 pt-1.5 mt-1 text-emerald-400">
                                                <span>• Available for Hires:</span>
                                                <span className="font-bold">{currentBudget.availableCPH} CPH</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                
                                {/* Optimization Suggestions list */}
                                <div className="bg-zinc-900/40 p-4 border border-zinc-800/80 rounded-2xl flex flex-col justify-between font-mono">
                                    <div>
                                        <div className="text-[9px] text-violet-400 uppercase mb-2">Resource Recommendations</div>
                                        <ul className="space-y-1.5 text-[9px] text-zinc-400">
                                            {optimizationSuggestions.map((suggestion, idx) => (
                                                <li key={idx} className="flex gap-1">
                                                    <span>⚡</span>
                                                    <span>{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-amber-500/50 pb-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <UserIcon className="w-8 h-8 text-amber-500" />
                                    <h3 className="font-comic-header text-3xl text-white uppercase italic">My Squad</h3>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-800 px-2 py-0.5 rounded-full">{filteredAgents.length} / {agents.length} OPERATIVES</span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                                        <SearchIcon className="w-3 h-3 text-gray-500" />
                                        <select 
                                            value={squadSpecialtyFilter}
                                            onChange={e => setSquadSpecialtyFilter(e.target.value)}
                                            className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer"
                                        >
                                            <option value="all">ANY SPECIALTY</option>
                                            <option value="debug">DEBUG</option>
                                            <option value="build">BUILD</option>
                                            <option value="security">SECURITY</option>
                                            <option value="refactor">REFACTOR</option>
                                            <option value="optimizer">OPTIMIZER</option>
                                            <option value="logic">LOGIC</option>
                                            <option value="learn">LEARN</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                                        <ActivityIcon className="w-3 h-3 text-gray-500" />
                                        <select 
                                            value={squadStatusFilter}
                                            onChange={e => setSquadStatusFilter(e.target.value)}
                                            className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer"
                                        >
                                            <option value="all">ANY STATUS</option>
                                            <option value="available">AVAILABLE</option>
                                            <option value="working">WORKING</option>
                                            <option value="resting">RESTING</option>
                                            <option value="quit">QUIT</option>
                                            <option value="on_notice">ON NOTICE</option>
                                        </select>
                                    </div>
                                    
                                    {(squadSpecialtyFilter !== 'all' || squadStatusFilter !== 'all') && (
                                        <button 
                                            onClick={() => { setSquadSpecialtyFilter('all'); setSquadStatusFilter('all'); }}
                                            className="text-[9px] font-black text-amber-500 hover:text-white uppercase tracking-tighter"
                                        >
                                            CLEAR FILTERS
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {agents.length === 0 ? (
                                <div className="p-20 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-50">
                                    <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xl">No Agents Hired.</p>
                                    <p className="text-xs text-gray-600 mt-2">Check the Marketplace below.</p>
                                </div>
                            ) : filteredAgents.length === 0 ? (
                                <div className="p-20 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-50">
                                    <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xl">No agents match filters.</p>
                                    <button 
                                        onClick={() => { setSquadSpecialtyFilter('all'); setSquadStatusFilter('all'); }}
                                        className="text-xs text-amber-500 mt-2 font-black uppercase underline"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredAgents.map(agent => {
                                        const specBadge = getSpecialtyBadge(agent.specialty);
                                        const statBadge = getStatusBadge(agent.status);
                                        const SpecIcon = specBadge.icon;
                                        return (
                                        <div key={agent.id} className={`aero-panel ${specBadge.bg} border-4 ${specBadge.border} p-6 rounded-[2rem] relative overflow-hidden group hover:border-white/20 transition-all shadow-[8px_8px_0_0_#000]`}>
                                            {editingAgentId === agent.id ? (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                                                        <h4 className="font-black text-amber-400 text-xs uppercase tracking-wider">Configure Personality</h4>
                                                        <button 
                                                            onClick={() => setEditingAgentId(null)}
                                                            className="text-[9px] font-black text-gray-500 hover:text-white uppercase"
                                                        >
                                                            Cancel
                                                        </button>
                                                     </div>

                                                     {/* Personality Sliders */}
                                                     <div className="space-y-2">
                                                         <div>
                                                             <div className="flex justify-between text-[9px] font-black uppercase text-gray-405">
                                                                 <span>Patience</span>
                                                                 <span className="text-amber-400">{editedPatience}%</span>
                                                             </div>
                                                             <input 
                                                                 type="range" min="0" max="100" 
                                                                 value={editedPatience} 
                                                                 onChange={e => setEditedPatience(parseInt(e.target.value))} 
                                                                 className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                                                             />
                                                         </div>

                                                         <div>
                                                             <div className="flex justify-between text-[9px] font-black uppercase text-gray-405">
                                                                 <span>Confidence</span>
                                                                 <span className="text-amber-400">{editedConfidence}%</span>
                                                             </div>
                                                             <input 
                                                                 type="range" min="0" max="100" 
                                                                 value={editedConfidence} 
                                                                 onChange={e => setEditedConfidence(parseInt(e.target.value))} 
                                                                 className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                                                             />
                                                         </div>

                                                         <div>
                                                             <div className="flex justify-between text-[9px] font-black uppercase text-gray-405">
                                                                 <span>Independence</span>
                                                                 <span className="text-amber-400">{editedIndependence}%</span>
                                                             </div>
                                                             <input 
                                                                 type="range" min="0" max="100" 
                                                                 value={editedIndependence} 
                                                                 onChange={e => setEditedIndependence(parseInt(e.target.value))} 
                                                                 className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                                                             />
                                                         </div>

                                                         <div>
                                                             <div className="flex justify-between text-[9px] font-black uppercase text-gray-405">
                                                                 <span>Loyalty</span>
                                                                 <span className="text-amber-400">{editedLoyalty}%</span>
                                                             </div>
                                                             <input 
                                                                 type="range" min="0" max="100" 
                                                                 value={editedLoyalty} 
                                                                 onChange={e => setEditedLoyalty(parseInt(e.target.value))} 
                                                                 className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                                                             />
                                                         </div>

                                                         <div>
                                                             <div className="flex justify-between text-[9px] font-black uppercase text-gray-450">
                                                                 <span>Adaptability</span>
                                                                 <span className="text-amber-400">{editedAdaptability}%</span>
                                                             </div>
                                                             <input 
                                                                 type="range" min="0" max="100" 
                                                                 value={editedAdaptability} 
                                                                 onChange={e => setEditedAdaptability(parseInt(e.target.value))} 
                                                                 className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                                                             />
                                                         </div>
                                                     </div>

                                                     {/* Workload */}
                                                     <div className="space-y-1">
                                                         <span className="text-[9px] font-black uppercase text-gray-405 block">Preferred Workload</span>
                                                         <div className="grid grid-cols-3 gap-2">
                                                             {(['light', 'moderate', 'heavy'] as const).map(mode => (
                                                                 <button
                                                                     key={mode}
                                                                     type="button"
                                                                     onClick={() => setEditedWorkload(mode)}
                                                                     className={`text-[8.5px] font-black uppercase py-1 border-2 rounded-lg transition-all ${
                                                                         editedWorkload === mode 
                                                                             ? 'border-amber-450 bg-amber-400 text-black font-black' 
                                                                             : 'border-zinc-800 bg-black text-gray-400 hover:border-gray-500'
                                                                     }`}
                                                                 >
                                                                     {mode}
                                                                 </button>
                                                             ))}
                                                         </div>
                                                     </div>

                                                     {/* Preferred Domains */}
                                                     <div className="space-y-1.5">
                                                         <span className="text-[9px] font-black uppercase text-gray-455 block">Preferred Domains</span>
                                                         <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto bg-black/40 p-1.5 rounded-lg border border-white/5">
                                                             {editedDomains.length === 0 && <span className="text-[8px] text-gray-600 font-bold uppercase py-0.5">None specified</span>}
                                                             {editedDomains.map((dom, idx) => (
                                                                 <span key={idx} className="inline-flex items-center gap-1 text-[8px] font-black text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                                                                     {dom}
                                                                     <button 
                                                                         type="button" 
                                                                         onClick={() => setEditedDomains(prev => prev.filter((_, i) => i !== idx))}
                                                                         className="text-red-400 hover:text-red-200"
                                                                     >
                                                                         ×
                                                                     </button>
                                                                 </span>
                                                             ))}
                                                         </div>
                                                         <div className="flex gap-2">
                                                             <input 
                                                                 type="text" 
                                                                 value={newDomainInput} 
                                                                 onChange={e => setNewDomainInput(e.target.value)}
                                                                 placeholder="New domain..."
                                                                 onKeyDown={e => {
                                                                     if (e.key === 'Enter') {
                                                                         e.preventDefault();
                                                                         if (newDomainInput.trim()) {
                                                                             setEditedDomains(prev => [...prev, newDomainInput.trim()]);
                                                                             setNewDomainInput('');
                                                                         }
                                                                     }
                                                                 }}
                                                                 className="flex-grow min-w-0 bg-black/50 text-[10px] text-white px-2 py-1 rounded border border-white/10 outline-none uppercase font-black"
                                                             />
                                                             <button 
                                                                 type="button"
                                                                 onClick={() => {
                                                                     if (newDomainInput.trim()) {
                                                                         setEditedDomains(prev => [...prev, newDomainInput.trim()]);
                                                                         setNewDomainInput('');
                                                                     }
                                                                 }}
                                                                 className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black px-2.5 py-1 rounded transition-colors"
                                                             >
                                                                 +
                                                             </button>
                                                         </div>
                                                     </div>

                                                     {/* Quirks */}
                                                     <div className="space-y-1.5">
                                                         <span className="text-[9px] font-black uppercase text-gray-455 block">Quirks</span>
                                                         <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto bg-black/40 p-1.5 rounded-lg border border-white/5">
                                                             {editedQuirks.length === 0 && <span className="text-[8px] text-gray-600 font-bold uppercase py-0.5">None specified</span>}
                                                             {editedQuirks.map((quirk, idx) => (
                                                                 <span key={idx} className="inline-flex items-center gap-1 text-[8px] font-black text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-800/40">
                                                                     {quirk}
                                                                     <button 
                                                                         type="button" 
                                                                         onClick={() => setEditedQuirks(prev => prev.filter((_, i) => i !== idx))}
                                                                         className="text-red-400 hover:text-red-200"
                                                                     >
                                                                         ×
                                                                     </button>
                                                                 </span>
                                                             ))}
                                                         </div>
                                                         <div className="flex gap-2">
                                                             <input 
                                                                 type="text" 
                                                                 value={newQuirkInput} 
                                                                 onChange={e => setNewQuirkInput(e.target.value)}
                                                                 placeholder="New quirk..."
                                                                 onKeyDown={e => {
                                                                     if (e.key === 'Enter') {
                                                                         e.preventDefault();
                                                                         if (newQuirkInput.trim()) {
                                                                             setEditedQuirks(prev => [...prev, newQuirkInput.trim()]);
                                                                             setNewQuirkInput('');
                                                                         }
                                                                     }
                                                                 }}
                                                                 className="flex-grow min-w-0 bg-black/50 text-[10px] text-white px-2 py-1 rounded border border-white/10 outline-none uppercase font-black"
                                                             />
                                                             <button 
                                                                 type="button"
                                                                 onClick={() => {
                                                                     if (newQuirkInput.trim()) {
                                                                         setEditedQuirks(prev => [...prev, newQuirkInput.trim()]);
                                                                         setNewQuirkInput('');
                                                                     }
                                                                 }}
                                                                 className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black px-2.5 py-1 rounded transition-colors"
                                                             >
                                                                 +
                                                             </button>
                                                         </div>
                                                     </div>

                                                     {/* Save btn */}
                                                     <button 
                                                         type="button"
                                                         onClick={() => saveAgentChanges(agent.id)}
                                                         className="w-full bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] uppercase font-black py-2 rounded-lg transition-all"
                                                     >
                                                         Save Configuration
                                                     </button>
                                                 </div>
                                             ) : (
                                                 <>
                                                     <div className="flex justify-between items-start mb-6">
                                                         <div className="flex items-center gap-4">
                                                             <div className={`w-12 h-12 ${specBadge.color} bg-black rounded-2xl flex items-center justify-center font-black text-sm border-2 ${specBadge.border}`}>
                                                                 <SpecIcon className="w-6 h-6" />
                                                             </div>
                                                             <div>
                                                                 <h4 className="font-black text-white text-lg uppercase">{agent.name}</h4>
                                                                 <span className={`text-[8px] font-black ${specBadge.color} uppercase tracking-widest bg-black px-2 py-0.5 rounded border ${specBadge.border}`}>{agent.specialty}</span>
                                                             </div>
                                                         </div>
                                                         <div className="flex flex-col items-end gap-1.5">
                                                             <button onClick={() => startEditingAgent(agent)} className="text-[8px] text-amber-500 hover:text-white uppercase font-black border-2 border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500 transition-all">
                                                                 CONFIG
                                                             </button>
                                                             <button onClick={() => fireAgent(agent.id)} className="text-[8px] text-red-500 hover:text-white uppercase font-black border-2 border-red-900/30 px-3 py-1.5 rounded-lg hover:bg-red-600 transition-all">
                                                                 DISMISS
                                                             </button>
                                                         </div>
                                                     </div>
                                                     <p className="text-[10px] text-gray-400 italic mb-6 leading-relaxed border-l-2 border-white/10 pl-3">"{agent.bio}"</p>
                                                     
                                                     {/* Catchphrase & Workload */}
                                                     <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-500 bg-black/20 p-2 rounded-lg border border-white/5 mb-3">
                                                         <span>Workload: <span className="text-white">{agent.personality?.preferredWorkload || 'moderate'}</span></span>
                                                         {agent.catchphrase && <span className="text-amber-500 italic max-w-[124px] truncate" title={agent.catchphrase}>"{agent.catchphrase}"</span>}
                                                     </div>

                                                     {/* Skill Level and Personality stats */}
                                                     <div className="space-y-3 mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                                                         <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase">
                                                             <span>Skill Level ({agent.specialty})</span>
                                                             <span className="text-white">{agent.skills.specialtyLevel}/100</span>
                                                         </div>
                                                         <div className="h-2 bg-black rounded-full overflow-hidden border border-white/10">
                                                             <div className={`h-full ${specBadge.bg.replace('/30', '')}`} style={{ width: `${agent.skills.specialtyLevel}%` }} />
                                                         </div>

                                                         <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-white/5 text-[7px] font-black">
                                                             <div className="flex justify-between text-gray-400 uppercase">
                                                                 <span>Patience</span>
                                                                 <span className="text-amber-400">{agent.personality?.patience ?? 50}%</span>
                                                             </div>
                                                             <div className="flex justify-between text-gray-400 uppercase">
                                                                 <span>Confidence</span>
                                                                 <span className="text-amber-400">{agent.personality?.confidence ?? 50}%</span>
                                                             </div>
                                                             <div className="flex justify-between text-gray-400 uppercase">
                                                                 <span>Independence</span>
                                                                 <span className="text-amber-400">{agent.personality?.independence ?? 50}%</span>
                                                             </div>
                                                             <div className="flex justify-between text-gray-400 uppercase">
                                                                 <span>Loyalty</span>
                                                                 <span className="text-amber-400">{agent.personality?.loyalty ?? 50}%</span>
                                                             </div>
                                                             <div className="flex justify-between text-gray-400 uppercase">
                                                                 <span>Adaptability</span>
                                                                 <span className="text-amber-400">{agent.personality?.adaptability ?? 50}%</span>
                                                             </div>
                                                         </div>
                                                     </div>

                                                     {/* CPH Metrics Section */}
                                                     <div className="flex justify-between items-center mb-3 text-[9px] font-mono text-zinc-400 bg-zinc-900/50 p-2.5 rounded-xl border border-white/5">
                                                         <div className="flex flex-col">
                                                             <span>Compute Cost:</span>
                                                             <span className="text-white font-bold">{agent.currentSalary} CPH</span>
                                                         </div>
                                                         <div className="flex flex-col items-end">
                                                             <span>Efficiency Multiplier:</span>
                                                             <span className="text-violet-400 font-bold">
                                                                 {CPHDisplay.formatEfficiency(agent.efficiencyRating ?? CPHManager.calculateEfficiency(agent.skills.specialtyLevel))}
                                                             </span>
                                                         </div>
                                                     </div>

                                                     {/* Preferred Domains tags */}
                                                     {agent.personality?.preferredDomains && agent.personality.preferredDomains.length > 0 && (
                                                         <div className="mb-3 space-y-1">
                                                             <span className="text-[8px] uppercase font-black text-gray-500 block">Domains</span>
                                                             <div className="flex flex-wrap gap-1">
                                                                 {agent.personality.preferredDomains.map((dom: string, i: number) => (
                                                                     <span key={i} className="text-[7px] font-black text-amber-450 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/40 uppercase">
                                                                         {dom}
                                                                     </span>
                                                                 ))}
                                                             </div>
                                                         </div>
                                                     )}

                                                     {/* Quirks tags */}
                                                     {agent.personality?.quirks && agent.personality.quirks.length > 0 && (
                                                         <div className="mb-3 space-y-1">
                                                             <span className="text-[8px] uppercase font-black text-gray-500 block">Quirks</span>
                                                             <div className="flex flex-wrap gap-1">
                                                                 {agent.personality.quirks.map((quirk: string, i: number) => (
                                                                     <span key={i} className="text-[7px] font-black text-violet-400 bg-violet-950/20 px-1.5 py-0.5 rounded border border-violet-900/40 uppercase">
                                                                         {quirk}
                                                                     </span>
                                                                 ))}
                                                             </div>
                                                         </div>
                                                     )}
                                                     
                                                     <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                                                         <div className="flex flex-col">
                                                             <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Status</span>
                                                             <span className={`text-[9.5px] font-black ${statBadge.color} uppercase flex items-center gap-2 mt-1`}>
                                                                 <div className={`w-1.5 h-1.5 ${statBadge.bg} rounded-full ${agent.status !== 'resting' ? 'animate-pulse' : ''}`} /> {statBadge.label}
                                                             </span>
                                                         </div>
                                                         {agent.status !== 'quit' && (
                                                             <button
                                                                 onClick={() => toggleAgentPause(agent.id)}
                                                                 className={`p-2 px-3 border-2 rounded-xl text-[9px] font-bold transition-all uppercase active:scale-95 ${
                                                                     agent.status === 'resting'
                                                                         ? 'border-emerald-500/50 hover:border-emerald-500 text-emerald-400 bg-emerald-950/20'
                                                                         : 'border-amber-500/50 hover:border-amber-500 text-amber-500 bg-amber-950/20'
                                                                 }`}
                                                             >
                                                                 {agent.status === 'resting' ? '▶ Resume' : '⏸ Pause (Standby)'}
                                                             </button>
                                                         )}
                                                     </div>
                                                 </>
                                             )}
                                        </div>
                                    )})}
                                </div>
                            )}
                        </div>

                        {/* Marketplace */}
                        <div className="space-y-6 pt-10 border-t-4 border-zinc-900">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-comic-header text-3xl text-gray-500 uppercase italic">Talent Marketplace</h3>
                                    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                                        <SearchIcon className="w-3 h-3 text-gray-500" />
                                        <select 
                                            value={marketSpecialtyFilter}
                                            onChange={e => setMarketSpecialtyFilter(e.target.value)}
                                            className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer"
                                        >
                                            <option value="all">ANY SPECIALTY</option>
                                            <option value="debug">DEBUG</option>
                                            <option value="build">BUILD</option>
                                            <option value="security">SECURITY</option>
                                            <option value="refactor">REFACTOR</option>
                                            <option value="optimizer">OPTIMIZER</option>
                                            <option value="logic">LOGIC</option>
                                            <option value="learn">LEARN</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={refreshMarketplace} className="text-[10px] font-black uppercase text-violet-500 hover:text-white flex items-center gap-2 bg-black px-4 py-2 rounded-xl border border-violet-900/50 self-start md:self-auto">
                                    <ActivityIcon className="w-3 h-3" /> Refresh Feed
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {marketplace.length === 0 ? (
                                    <div className="col-span-full p-20 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-50">
                                        <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xl">No Talent Available.</p>
                                    </div>
                                ) : filteredMarketplace.length === 0 ? (
                                    <div className="col-span-full p-20 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-50">
                                        <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xl">No talent matches filter.</p>
                                        <button 
                                            onClick={() => setMarketSpecialtyFilter('all')}
                                            className="text-xs text-violet-500 mt-2 font-black uppercase underline"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                ) : filteredMarketplace.map(agent => {
                                    const specBadge = getSpecialtyBadge(agent.specialty);
                                    const SpecIcon = specBadge.icon;
                                    return (
                                    <div key={agent.id} className="aero-panel bg-black border-2 border-zinc-800 p-6 rounded-2xl relative overflow-hidden group hover:border-violet-500 transition-all hover:-translate-y-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${specBadge.color} ${specBadge.bg} rounded-xl flex items-center justify-center border ${specBadge.border}`}>
                                                    <SpecIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className={`text-[8px] font-black ${specBadge.color} ${specBadge.bg} px-2 py-0.5 rounded uppercase tracking-widest border ${specBadge.border}`}>{agent.specialty}</span>
                                                    <h4 className="font-black text-white text-lg uppercase mt-1">{agent.name}</h4>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-gray-500 italic mb-4 h-8 line-clamp-2">
                                            "{agent.catchphrase}"
                                        </p>

                                        <div className="flex justify-between items-center mb-6 text-[9px] font-mono text-gray-400 bg-zinc-900/50 p-2 rounded-lg">
                                            <span>Salary: <span className="text-white font-bold">{agent.currentSalary}cr</span></span>
                                            <span>XP: {agent.skills.specialtyLevel}</span>
                                        </div>

                                        <button 
                                            onClick={() => hireAgent(agent)}
                                            className="vista-button w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <PlusIcon className="w-3 h-3" /> HIRE AGENT
                                        </button>
                                    </div>
                                )})}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
