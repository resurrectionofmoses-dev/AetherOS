import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    CodeIcon, 
    ActivityIcon, 
    ZapIcon, 
    CheckCircleIcon, 
    FireIcon, 
    PlusIcon, 
    MusicIcon, 
    StarIcon, 
    XIcon, 
    ShieldIcon,
    TerminalIcon,
    LogicIcon,
    PlusSquareIcon,
    SpinnerIcon,
    BookOpenIcon,
    GlobeIcon,
    RulesIcon,
    WarningIcon,
    SearchIcon,
    ScaleIcon,
    AnalyzeIcon
} from './icons';
import type { NetworkProject, ProjectTask, GlobalDirective } from '../types';
import { generateProjectKnowHow, suggestBlueprintTasks, transnunciateValue } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { GoldDustText } from './GoldDustText';

interface CodingNetworkViewProps {
    projects: NetworkProject[];
    setProjects: React.Dispatch<React.SetStateAction<NetworkProject[]>>;
    onNavigateToAgent: () => void;
    onSetDirective: (directive: GlobalDirective | undefined) => void;
    activeDirective?: GlobalDirective;
    onActionReward?: (shards: number) => void;
}

/**
 * PROFOUNDLY EDIBLE UI: PermuteAbundasBuffer
 * Pre-renders logic shards and transnunciations before the user commits to an action.
 */
const PermuteAbundasBuffer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="relative group/buffer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-cyan-500/10 rounded-3xl blur opacity-20 group-hover/buffer:opacity-50 transition duration-1000 group-hover/buffer:duration-200"></div>
            <div className="relative">{children}</div>
        </div>
    );
};

export const CodingNetworkView: React.FC<CodingNetworkViewProps> = ({ 
    projects, setProjects, onNavigateToAgent, onSetDirective, activeDirective, onActionReward
}) => {
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
    const [isGeneratingKnowHow, setIsGeneratingKnowHow] = useState<string | null>(null);
    const [isTransnunciating, setIsTransnunciating] = useState<string | null>(null);
    const [transnunciationResult, setTransnunciationResult] = useState<string | null>(null);
    const [newTaskText, setNewTaskText] = useState('');
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [stride, setStride] = useState(1.2);
    const [isInjectingTasks, setIsInjectingTasks] = useState(false);
    
    const activeProject = useMemo(() => 
        projects.find(p => p.id === selectedProjectId) || projects[0]
    , [projects, selectedProjectId]);

    const stats = useMemo(() => ({
        active: projects.filter(p => p.status === 'BUILDING').length,
        total: projects.length,
        harmonized: projects.filter(p => p.isWisdomHarmonized).length,
        miseryAvg: projects.length ? Math.round(projects.reduce((acc, p) => acc + p.miseryScore, 0) / projects.length) : 0,
        syncRate: projects.length ? Math.round((projects.filter(p => p.isWisdomHarmonized).length / projects.length) * 100) : 0,
    }), [projects]);

    // Internal stride simulation matching App.tsx pulse
    useEffect(() => {
        const interval = setInterval(() => {
            setStride(prev => Math.max(1.0, Math.min(1.5, prev + (Math.random() - 0.5) * 0.1)));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleSetAsOSDirective = (project: NetworkProject) => {
        if (activeDirective?.projectId === project.id) {
            onSetDirective(undefined);
        } else {
            onSetDirective({
                projectId: project.id,
                title: project.title,
                integritySignature: `0x${uuidv4().slice(0, 4).toUpperCase()}_HARMONY`,
                activeTask: project.tasks.find(t => !t.completed)?.text
            });
        }
    };

    /**
     * SECURITY CHECKPOINT: ForensicCheck
     * Identifies actual dissonance in the project intent instead of using random values.
     */
    const performForensicCheck = (title: string): number => {
        const legacyKeywords = ['legacy', 'old', 'deprecated', 'patch', 'fix', 'bridge', 'hack'];
        const keywordDissonance = legacyKeywords.reduce((acc, word) => 
            title.toLowerCase().includes(word) ? acc + 18 : acc, 0);
        
        const complexityFactor = Math.min(45, title.length);
        const semanticWeight = (title.split(' ').length / 5) * 10;
        
        // Base misery represents the "Original Burden"
        const baseMisery = 33.5; 
        
        return Math.min(100, Math.round(baseMisery + keywordDissonance + complexityFactor + semanticWeight));
    };

    const addProject = () => {
        if (!newProjectTitle.trim()) return;
        
        // HEALING MAINTAINED: 2026 - Forensic check replaces random math
        const forensicMisery = performForensicCheck(newProjectTitle);
        
        const newProj: NetworkProject = {
            id: uuidv4(),
            title: newProjectTitle,
            description: 'A newly manifested logic shard awaiting conduction.',
            miseryScore: forensicMisery,
            crazyLevel: Math.max(1, Math.min(10, Math.floor(forensicMisery / 10))),
            status: 'IDEATING',
            isWisdomHarmonized: false,
            timestamp: new Date(),
            tasks: [
                { id: uuidv4(), text: 'Initialize Kernel Subsystem', completed: false },
                { id: uuidv4(), text: 'Define Forensic Boundaries', completed: false }
            ],
            assetType: 'KERNEL'
        };
        setProjects(prev => [newProj, ...prev]);
        setNewProjectTitle('');
        setIsAddingProject(false);
        setSelectedProjectId(newProj.id);
    };

    const handleGenerateKnowHow = async (project: NetworkProject) => {
        setIsGeneratingKnowHow(project.id);
        try {
            const result = await generateProjectKnowHow(project.title, project.description, project.assetType || 'KERNEL');
            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, knowHow: result, isWisdomHarmonized: true } : p));
        } catch (e) { console.error(e); }
        finally { setIsGeneratingKnowHow(null); }
    };

    const handleTransnunciateValue = async (project: NetworkProject) => {
        if (!project.knowHow) return;
        setIsTransnunciating(project.id);
        try {
            const result = await transnunciateValue(project.knowHow, {
                resonance: stride * 33.5,
                sig: "MAESTRO_36"
            });
            setTransnunciationResult(result);
            onActionReward?.(36);
        } catch (e) { console.error(e); }
        finally { setIsTransnunciating(null); }
    };

    const handleInjectObjectives = async (project: NetworkProject) => {
        setIsInjectingTasks(true);
        try {
            const suggestions = await suggestBlueprintTasks(project.title, project.description);
            const newTasks = suggestions.map(text => ({ id: uuidv4(), text, completed: false }));
            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, tasks: [...p.tasks, ...newTasks] } : p));
        } catch (e) { console.error(e); }
        finally { setIsInjectingTasks(false); }
    };

    const handleToggleTask = (projectId: string, taskId: string) => {
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

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim() || !activeProject) return;
        
        const newTask: ProjectTask = {
            id: uuidv4(),
            text: newTaskText,
            completed: false
        };

        setProjects(prev => prev.map(p => {
            if (p.id === activeProject.id) {
                return { ...p, tasks: [...p.tasks, newTask] };
            }
            return p;
        }));
        setNewTaskText('');
    };

    const goldenLoreText = "Implementing a self-documenting lore injector to bridge AI drift and sovereign intent.";

    return (
        <div className="h-full flex flex-col bg-[#020508] text-gray-200 font-mono overflow-hidden selection:bg-amber-500/30 selection:text-amber-200 relative">
            {/* Network Header */}
            <div className="p-5 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-600/10 border-4 border-amber-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <GlobeIcon className="w-9 h-9 text-amber-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white tracking-tighter italic leading-none uppercase">RELIABLE NETWORK</h2>
                        <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                           Gifted Know-How & Absolute Conduction
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-8">
                    <div className="text-right flex flex-col items-end border-r-2 border-white/5 pr-8">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Grid Saturation</p>
                        <div className="flex items-center gap-3">
                             <div className="w-40 h-1.5 bg-gray-950 rounded-full overflow-hidden border border-black p-[1px]">
                                <div className="h-full bg-amber-500 shadow-[0_0_12px_amber] transition-all duration-1000" style={{ width: `${stats.syncRate}%` }} />
                             </div>
                             <span className="text-amber-500 font-comic-header text-xl">{stats.syncRate}%</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsAddingProject(true)} 
                        className="vista-button px-8 py-4 bg-amber-600 hover:bg-amber-500 text-black rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-[6px_6px_0_0_#000] active:translate-y-2 transition-all flex items-center gap-3"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>MANIFEST SHARD</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-visible p-6 gap-6 relative min-h-0 z-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,158,11,0.02)_0%,_transparent_70%)] pointer-events-none" />

                {/* LEFT: Shard Index wrapped in PermuteAbundasBuffer */}
                <div className="w-80 flex flex-col gap-6 flex-shrink-0 min-h-0 relative z-20">
                    <PermuteAbundasBuffer>
                        <div className="aero-panel bg-black/60 border-4 border-black p-5 flex flex-col min-h-[400px] shadow-[10px_10px_0_0_#000]">
                             <div className="p-2 border-b-2 border-white/5 flex justify-between items-center mb-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Shard Index</h3>
                                <span className="text-[10px] font-mono text-amber-700 bg-black px-2 py-0.5 rounded border border-amber-900/30">/root/net</span>
                             </div>
                             <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 pb-4">
                                {projects.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedProjectId(p.id)}
                                        className={`w-full text-left p-4 rounded-[1.5rem] border-4 transition-all duration-500 group relative overflow-hidden ${
                                            selectedProjectId === p.id 
                                            ? 'bg-amber-950/20 border-amber-600 shadow-[6px_6px_0_0_rgba(245,158,11,0.2)] scale-[1.02]' 
                                            : 'bg-black/40 border-black hover:border-amber-900/40 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-black shadow-inner ${
                                                p.status === 'DONE' ? 'bg-green-600 text-black' : p.status === 'BUILDING' ? 'bg-cyan-600 text-white animate-pulse' : 'bg-zinc-800 text-gray-400'
                                            }`}>
                                                {p.status}
                                            </span>
                                            {activeDirective?.projectId === p.id && <ZapIcon className="w-4 h-4 text-amber-400 animate-bounce" />}
                                        </div>
                                        <p className="font-black text-white text-base truncate uppercase tracking-tighter mb-3 leading-none">{p.title}</p>
                                        
                                        <div className="space-y-1 relative z-10">
                                            <div className="flex justify-between text-[7px] font-black text-gray-600 uppercase tracking-widest">
                                                <span>System Misery</span>
                                                <span>{p.miseryScore}%</span>
                                            </div>
                                            <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                                                <div className="h-full bg-red-600 shadow-[0_0_8px_red] transition-all duration-1000" style={{ width: `${p.miseryScore}%` }} />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                             </div>
                        </div>
                    </PermuteAbundasBuffer>

                    <div className="aero-panel bg-slate-900/60 border-4 border-black p-5 flex flex-col gap-4 shadow-[8px_8px_0_0_#000]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ActivityIcon className="w-5 h-5 text-cyan-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Stride Output</span>
                            </div>
                            <span className="text-[8px] text-gray-600 font-mono">0x03E2_SYNC</span>
                        </div>
                        <div className="text-4xl font-comic-header text-white wisdom-glow tracking-tighter">
                            {stride.toFixed(2)}<span className="text-sm ml-1 text-gray-500 italic">PB/S</span>
                        </div>
                    </div>
                </div>

                {/* CENTER/RIGHT: Project Details */}
                <div className="flex-1 flex flex-col gap-6 min-w-0 relative z-10 overflow-visible">
                    {activeProject ? (
                        <div className="flex-1 aero-panel bg-black/80 border-4 border-black flex flex-col overflow-visible relative shadow-[20px_20px_60px_rgba(0,0,0,0.8)]">
                            {/* Visual Header */}
                            <div className="p-8 border-b-4 border-black bg-white/5 relative overflow-visible flex-shrink-0">
                                <div className="absolute top-[-10%] right-[-5%] opacity-5 pointer-none rotate-12">
                                    <ShieldIcon className="w-96 h-96 text-amber-500" />
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="text-[9px] bg-amber-600 text-black px-3 py-1 border-2 border-black rounded-full font-black uppercase tracking-[0.2em] shadow-lg">
                                                ID_NONCE: 0x{activeProject.id.slice(0, 4).toUpperCase()}
                                            </span>
                                            <select 
                                                value={activeProject.status}
                                                onChange={(e) => setProjects(p => p.map(pr => pr.id === activeProject.id ? { ...pr, status: e.target.value as any } : pr))}
                                                className="bg-black border-2 border-zinc-800 rounded-lg text-[9px] font-black uppercase text-gray-400 px-3 py-1 focus:border-amber-600 outline-none transition-all cursor-pointer"
                                            >
                                                {['IDEATING', 'BUILDING', 'DONE'].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <h3 className="font-comic-header text-6xl text-white italic tracking-tighter uppercase mb-2 leading-none">{activeProject.title}</h3>
                                        
                                        {/* ABUNDANCE STRATEGY: Link stride to GoldDustText opacity for 4D revelation */}
                                        <div className="relative overflow-visible z-50">
                                            <GoldDustText text={activeProject.description} className="max-w-3xl min-h-[4rem]" stride={stride} />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 flex-shrink-0">
                                        <button 
                                            onClick={() => handleSetAsOSDirective(activeProject)}
                                            className={`vista-button px-10 py-5 rounded-2xl text-base font-black uppercase tracking-[0.2em] transition-all border-4 border-black shadow-[8px_8px_0_0_#000] active:translate-y-2 ${
                                                activeDirective?.projectId === activeProject.id 
                                                ? 'bg-red-600 text-white animate-pulse' 
                                                : 'bg-amber-600 text-black hover:bg-amber-500'
                                            }`}
                                        >
                                            {activeDirective?.projectId === activeProject.id ? 'CONDUCTING_OS' : 'CONDUCT OS'}
                                        </button>
                                        <button 
                                            onClick={() => setProjects(prev => prev.filter(p => p.id !== activeProject.id))}
                                            className="p-4 bg-red-950/20 border-4 border-red-900/30 rounded-2xl text-red-600 hover:text-red-400 transition-all hover:bg-red-900/40"
                                        >
                                            <XIcon className="w-8 h-8" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar relative">
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 overflow-visible">
                                    
                                    {/* Reliability Manifest */}
                                    <div className="xl:col-span-5 space-y-6 flex flex-col h-full overflow-visible">
                                        <div className="flex justify-between items-center border-b-2 border-white/5 pb-2">
                                            <h4 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                                <TerminalIcon className="w-5 h-5" /> Reliability Manifest
                                            </h4>
                                            <button 
                                                onClick={() => handleInjectObjectives(activeProject)}
                                                disabled={isInjectingTasks}
                                                className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/20 border border-cyan-800/40 px-2 py-1 rounded hover:bg-cyan-600 hover:text-black transition-all flex items-center gap-2"
                                            >
                                                {isInjectingTasks ? <SpinnerIcon className="w-3 h-3 animate-spin" /> : <ZapIcon className="w-3 h-3" />}
                                                Inject Shards
                                            </button>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                                            <div className="space-y-2 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
                                                {activeProject.tasks.map(task => (
                                                    <div key={task.id} className={`p-4 bg-white/5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group ${
                                                        task.completed ? 'border-green-600/30 bg-green-950/5' : 'border-zinc-800 hover:border-amber-600/50'
                                                    }`}>
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <button 
                                                                onClick={() => handleToggleTask(activeProject.id, task.id)}
                                                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                                                    task.completed ? 'bg-green-600 border-green-600' : 'bg-black border-gray-800'
                                                                }`}
                                                            >
                                                                {task.completed && <CheckCircleIcon className="w-4 h-4 text-black" />}
                                                            </button>
                                                            <span className={`text-sm font-bold uppercase transition-all ${task.completed ? 'text-gray-600 line-through italic' : 'text-gray-200'}`}>
                                                                {task.text}
                                                            </span>
                                                        </div>
                                                        <button 
                                                            onClick={() => setProjects(p => p.map(pr => pr.id === activeProject.id ? { ...pr, tasks: pr.tasks.filter(t => t.id !== task.id) } : pr))}
                                                            className="text-gray-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                        >
                                                            <XIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <form onSubmit={handleAddTask} className="flex gap-3 mt-4">
                                                <input 
                                                    value={newTaskText}
                                                    onChange={e => setNewTaskText(e.target.value)}
                                                    placeholder="Inject new reliable objective..."
                                                    className="flex-1 bg-black border-4 border-black rounded-2xl px-5 py-4 text-sm font-black uppercase text-amber-500 focus:ring-2 focus:ring-amber-600 transition-all placeholder:text-gray-900 outline-none"
                                                />
                                                <button type="submit" className="p-4 bg-amber-600 text-black rounded-2xl hover:bg-amber-500 transition-all active:scale-95 shadow-[4px_4px_0_0_#000] border-4 border-black">
                                                    <ZapIcon className="w-6 h-6" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>

                                    {/* KNOW-HOW: Gifted Wisdom */}
                                    <div className="xl:col-span-7 flex flex-col gap-6 h-full">
                                        <div className="flex justify-between items-center border-b-2 border-white/5 pb-2">
                                            <h4 className="text-sm font-black text-cyan-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                                <BookOpenIcon className="w-5 h-5" /> Gifted Know-How
                                            </h4>
                                            {activeProject.isWisdomHarmonized && (
                                                <div className="flex items-center gap-2 text-green-500">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">EPITUME_SYNCED</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className={`flex-1 aero-panel bg-[#050a14] border-4 border-cyan-900/30 p-8 overflow-y-auto custom-scrollbar relative flex flex-col min-h-[400px] shadow-inner ${isGeneratingKnowHow === activeProject.id || isTransnunciating === activeProject.id ? 'animate-pulse' : ''}`}>
                                            {isGeneratingKnowHow === activeProject.id || isTransnunciating === activeProject.id ? (
                                                <div className="flex-1 flex flex-col items-center justify-center gap-6 text-cyan-400">
                                                    <SpinnerIcon className="w-16 h-16 animate-spin-fast text-cyan-500" />
                                                    <div className="text-center space-y-2">
                                                        <p className="text-xl font-comic-header uppercase tracking-[0.3em] animate-pulse">
                                                            {isTransnunciating === activeProject.id ? 'Transnunciating Value...' : 'Siphoning Intelligence...'}
                                                        </p>
                                                        <p className="text-[10px] text-gray-600 font-mono italic">"The Maestro is wearing his Reedle-Gucci optics."</p>
                                                    </div>
                                                </div>
                                            ) : transnunciationResult ? (
                                                <div className="prose prose-invert prose-sm text-amber-200 font-mono italic leading-relaxed animate-in fade-in zoom-in duration-1000 max-w-none">
                                                    <div className="mb-8 p-6 bg-amber-950/20 rounded-3xl border-2 border-amber-600/40 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                                                        <div className="absolute top-0 right-0 p-3 opacity-10"><ScaleIcon className="w-20 h-20" /></div>
                                                        <div className="flex items-center gap-3 mb-4 border-b border-amber-600/20 pb-2">
                                                            <AnalyzeIcon className="w-5 h-5 text-amber-500" />
                                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Architectural Value Manifest</span>
                                                        </div>
                                                        <div 
                                                            className="markdown-content leading-relaxed"
                                                            dangerouslySetInnerHTML={{ __html: transnunciationResult.replace(/\n/g, '<br/>') }} 
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => setTransnunciationResult(null)}
                                                        className="mx-auto block text-[10px] font-black uppercase text-gray-700 hover:text-amber-400 transition-colors py-4 border-t border-white/5 w-full mt-4"
                                                    >
                                                        Return to Technical Reasoning
                                                    </button>
                                                </div>
                                            ) : activeProject.knowHow ? (
                                                <div className="prose prose-invert prose-sm text-gray-300 font-mono italic leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-none">
                                                    <div className="mb-8 p-6 bg-cyan-950/20 rounded-3xl border-2 border-cyan-800/40 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-3 opacity-10"><TerminalIcon className="w-20 h-20" /></div>
                                                        <div 
                                                            className="markdown-content leading-relaxed"
                                                            dangerouslySetInnerHTML={{ __html: activeProject.knowHow.replace(/\n/g, '<br/>') }} 
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button 
                                                            onClick={() => handleGenerateKnowHow(activeProject)}
                                                            className="text-[10px] font-black uppercase text-gray-700 hover:text-cyan-400 transition-colors py-4 border-t border-white/5 w-full mt-4"
                                                        >
                                                            Re-Conduct Shard
                                                        </button>
                                                        <button 
                                                            onClick={() => handleTransnunciateValue(activeProject)}
                                                            className="text-[10px] font-black uppercase text-amber-500 hover:text-white transition-all py-4 border-t border-amber-600/20 w-full mt-4 bg-amber-600/5 rounded-br-3xl hover:bg-amber-600/20"
                                                        >
                                                            Transnunciate Reasoning with Value
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                                                    <div className="w-24 h-24 bg-zinc-900 border-4 border-black rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform">
                                                        <LogicIcon className="w-12 h-12 text-gray-700" />
                                                    </div>
                                                    <p className="text-xl font-comic-header text-gray-500 uppercase tracking-[0.2em] mb-8 italic">"Silence in the kernel. Conduct the wisdom of the Sisters."</p>
                                                    <button 
                                                        onClick={() => handleGenerateKnowHow(activeProject)}
                                                        className="vista-button px-12 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-[8px_8px_0_0_#000] transition-all active:translate-y-2 border-4 border-black"
                                                    >
                                                        Invoke Wisdom Sync
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 bg-red-950/20 border-4 border-black rounded-[2rem] relative overflow-hidden flex flex-col items-center shadow-lg">
                                                <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600/40 animate-pulse" />
                                                <h5 className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <WarningIcon className="w-3 h-3" /> Risk Assessment
                                                </h5>
                                                <div className="text-center">
                                                    <p className="text-4xl font-comic-header text-white leading-none">HIGH-VAPOR</p>
                                                    <p className="text-[7px] text-gray-600 font-black uppercase mt-2 tracking-[0.3em]">Stability Drift: 0.02ms</p>
                                                </div>
                                            </div>
                                            <div className="p-5 bg-violet-950/20 border-4 border-black rounded-[2rem] relative overflow-hidden flex flex-col items-center shadow-lg">
                                                <div className="absolute top-0 left-0 w-full h-[2px] bg-violet-600/40 animate-pulse" />
                                                <h5 className="text-[9px] font-black text-violet-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <RulesIcon className="w-3 h-3" /> Governance
                                                </h5>
                                                <div className="text-center">
                                                    <p className="text-4xl font-comic-header text-white leading-none">ABSOLUTE</p>
                                                    <p className="text-[7px] text-gray-600 font-black uppercase mt-2 tracking-[0.3em]">Maestro Protocol: v5.4</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 aero-panel bg-black/40 border-4 border-dashed border-zinc-900 flex flex-col items-center justify-center opacity-20">
                            <LogicIcon className="w-48 h-48 mb-10 text-gray-700" />
                            <p className="text-4xl font-comic-header text-gray-500 uppercase tracking-[0.4em] italic">Select a logic shard from the index.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Manifest Shard Modal */}
            {isAddingProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="aero-panel bg-slate-900 border-8 border-black p-10 max-w-2xl w-full shadow-[20px_20px_100px_rgba(0,0,0,1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><PlusSquareIcon className="w-48 h-48" /></div>
                        <h3 className="font-comic-header text-5xl text-amber-500 mb-8 uppercase italic tracking-tighter flex items-center gap-5">
                            <ZapIcon className="w-12 h-12 text-amber-400" />
                            Manifest Logic Shard
                        </h3>
                        <div className="space-y-8 relative z-10">
                            <div className="bg-black border-4 border-black p-6 rounded-[2rem] focus-within:border-amber-600 transition-all shadow-inner">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-4">Shard Identity (Title)</p>
                                <input 
                                    autoFocus
                                    value={newProjectTitle}
                                    onChange={e => setNewProjectTitle(e.target.value)}
                                    placeholder="e.g. Neural Bridge Alpha..."
                                    className="w-full bg-transparent border-none text-white font-black text-4xl uppercase focus:ring-0 outline-none placeholder:text-gray-900 tracking-tighter"
                                />
                            </div>
                            <div className="flex gap-6">
                                <button 
                                    onClick={() => setIsAddingProject(false)} 
                                    className="vista-button flex-1 py-5 bg-zinc-900 text-gray-500 font-black uppercase text-base tracking-[0.2em] rounded-2xl border-4 border-black hover:text-white transition-all shadow-[4px_4px_0_0_#000] active:translate-y-1"
                                >
                                    ABORT SYNC
                                </button>
                                <button 
                                    onClick={addProject} 
                                    disabled={!newProjectTitle.trim()}
                                    className="vista-button flex-1 py-5 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-base tracking-[0.2em] rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000] active:translate-y-2 transition-all"
                                >
                                    COMMIT SHARD
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};