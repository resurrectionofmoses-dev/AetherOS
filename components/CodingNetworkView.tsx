
import React, { useState, useMemo, useEffect } from 'react';
import { FINTECH_AUTHORITIES } from '../constants';
import { 
    CodeIcon, ActivityIcon, ZapIcon, ShieldIcon, FireIcon, StarIcon, PlusIcon, XIcon, TerminalIcon, UserIcon, BrainIcon, LogicIcon, CheckCircleIcon, SpinnerIcon, GaugeIcon, SearchIcon
} from './icons';
import type { NetworkProject, ProjectTask } from '../types';
import type { HireableAgent } from '../agentTypes';
import { AgentFactory } from '../services/AgentFactory';
import { safeStorage } from '../services/safeStorage';
import { extractJSON } from '../utils';
import { generateProjectKnowHow } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

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

    // --- RELIABILITY PROTOCOL: PERSISTENCE ---
    useEffect(() => {
        const savedShards = safeStorage.getItem('AETHER_NET_SHARDS');
        if (savedShards) {
            const parsed = extractJSON<NetworkProject[]>(savedShards, []);
            if (projects.length === 0 && parsed.length > 0) {
                setProjects(parsed.map(p => ({...p, timestamp: new Date(p.timestamp)})));
            }
        }
    }, []);

    useEffect(() => {
        if (projects.length > 0) {
            safeStorage.setItem('AETHER_NET_SHARDS', JSON.stringify(projects));
        }
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

    const deleteProject = (id: string) => {
        setProjects(prev => {
            const updated = prev.filter(p => p.id !== id);
            safeStorage.setItem('AETHER_NET_SHARDS', JSON.stringify(updated));
            return updated;
        });
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
                    completed: false 
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
        const hiredAgent = { ...agent, status: 'available' as const, hireDate: new Date() };
        setAgents(prev => [...prev, hiredAgent]);
        setMarketplace(prev => prev.filter(a => a.id !== agent.id));
    };

    const fireAgent = (id: string) => {
        setAgents(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 h-full flex flex-col bg-[#030005] overflow-hidden">
            {/* Header / Nav */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-xl z-20">
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

                                        {/* Metrics */}
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
                                                            <span className={`text-[10px] font-bold uppercase ${task.completed ? 'text-green-500 line-through' : 'text-gray-300'}`}>{task.text}</span>
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
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 border-b-4 border-amber-500/50 pb-2 mb-8">
                                <UserIcon className="w-8 h-8 text-amber-500" />
                                <h3 className="font-comic-header text-3xl text-white uppercase italic">My Squad</h3>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-800 px-2 py-0.5 rounded-full">{agents.length} OPERATIVES</span>
                            </div>
                            
                            {agents.length === 0 ? (
                                <div className="p-20 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-50">
                                    <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xl">No Agents Hired.</p>
                                    <p className="text-xs text-gray-600 mt-2">Check the Marketplace below.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {agents.map(agent => (
                                        <div key={agent.id} className="aero-panel bg-amber-950/10 border-4 border-amber-600/30 p-6 rounded-[2rem] relative overflow-hidden group hover:border-amber-500 transition-all shadow-[8px_8px_0_0_#000]">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-amber-600 text-black rounded-2xl flex items-center justify-center font-black text-sm border-2 border-white">
                                                        {agent.specialty.substring(0,2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-white text-lg uppercase">{agent.name}</h4>
                                                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-black px-2 py-0.5 rounded border border-amber-900">{agent.specialty}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => fireAgent(agent.id)} className="text-[8px] text-red-500 hover:text-white uppercase font-black border-2 border-red-900/30 px-3 py-1.5 rounded-lg hover:bg-red-600 transition-all">
                                                    DISMISS
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-gray-400 italic mb-6 leading-relaxed border-l-2 border-amber-600/50 pl-3">"{agent.bio}"</p>
                                            
                                            <div className="space-y-3 mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                                                <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase">
                                                    <span>Skill Level</span>
                                                    <span className="text-white">{agent.skills.specialtyLevel}/100</span>
                                                </div>
                                                <div className="h-2 bg-black rounded-full overflow-hidden border border-white/10">
                                                    <div className="h-full bg-amber-500" style={{ width: `${agent.skills.specialtyLevel}%` }} />
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                                                <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Status</span>
                                                <span className="text-[9px] font-black text-green-500 uppercase flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> READY
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Marketplace */}
                        <div className="space-y-6 pt-10 border-t-4 border-zinc-900">
                            <div className="flex items-center justify-between">
                                <h3 className="font-comic-header text-3xl text-gray-500 uppercase italic">Talent Marketplace</h3>
                                <button onClick={refreshMarketplace} className="text-[10px] font-black uppercase text-violet-500 hover:text-white flex items-center gap-2 bg-black px-4 py-2 rounded-xl border border-violet-900/50">
                                    <ActivityIcon className="w-3 h-3" /> Refresh Feed
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {marketplace.map(agent => (
                                    <div key={agent.id} className="aero-panel bg-black border-2 border-zinc-800 p-6 rounded-2xl relative overflow-hidden group hover:border-violet-500 transition-all hover:-translate-y-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-[8px] font-black bg-zinc-900 text-gray-400 px-2 py-0.5 rounded uppercase tracking-widest">{agent.specialty}</span>
                                                <h4 className="font-black text-white text-lg uppercase mt-2">{agent.name}</h4>
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
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
