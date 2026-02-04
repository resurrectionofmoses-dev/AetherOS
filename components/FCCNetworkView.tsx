


import React, { useState, useMemo, useEffect } from 'react';
import { 
    StarIcon, 
    ActivityIcon, 
    CheckCircleIcon, 
    PlusSquareIcon, 
    XIcon, 
    ShieldIcon, 
    TerminalIcon, 
    LogicIcon, 
    ZapIcon, 
    SpinnerIcon, 
    BookOpenIcon,
    CodeIcon,
    FireIcon
} from './icons';
import type { NetworkProject, ProjectTask } from '../types';
import { generateProjectKnowHow } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface FCCNetworkViewProps {
    projects: NetworkProject[];
    setProjects: React.Dispatch<React.SetStateAction<NetworkProject[]>>;
}

export const FCCNetworkView: React.FC<FCCNetworkViewProps> = ({ projects, setProjects }) => {
    const [selectedId, setSelectedId] = useState<string | null>(projects[0]?.id || null);
    const [isAdding, setIsAdding] = useState(false); // Corrected from isAddingProject
    const [newTitle, setNewTitle] = useState(''); // Corrected from newProjectTitle
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [newTaskText, setNewTaskText] = useState('');

    const activeProject = useMemo(() => 
        projects.find(p => p.id === selectedId) || null
    , [projects, selectedId]);

    const globalStats = useMemo(() => ({
        total: projects.length,
        harmonized: projects.filter(p => p.isWisdomHarmonized).length,
        avgMisery: projects.length ? Math.round(projects.reduce((acc, p) => acc + p.miseryScore, 0) / projects.length) : 0,
        stride: 1.2
    }), [projects]);

    const addTask = () => {
        if (!newTaskText.trim() || !selectedId) return;
        const newTask: ProjectTask = { id: uuidv4(), text: newTaskText, completed: false };
        setProjects(prev => prev.map(p => 
            p.id === selectedId ? { ...p, tasks: [...p.tasks, newTask] } : p
        ));
        setNewTaskText('');
    };

    const toggleTask = (taskId: string) => {
        setProjects(prev => prev.map(p => 
            p.id === selectedId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) } : p
        ));
    };

    const deleteTask = (taskId: string) => {
        setProjects(prev => prev.map(p => 
            p.id === selectedId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p
        ));
    };

    const createProject = () => { // Corrected from addProject
        if (!newTitle.trim()) return;
        const newProj: NetworkProject = {
            id: uuidv4(),
            title: newTitle,
            description: 'A newly manifested logic shard in the FCC command grid.',
            miseryScore: 65,
            crazyLevel: 8,
            status: 'IDEATING',
            isWisdomHarmonized: false,
            timestamp: new Date(),
            tasks: [],
            assetType: 'KERNEL'
        };
        setProjects(prev => [newProj, ...prev]);
        setNewTitle('');
        setIsAdding(false);
        setSelectedId(newProj.id);
    };

    const handleGenerateWisdom = async () => {
        if (!activeProject || isGenerating) return;
        setIsGenerating(activeProject.id);
        const wisdom = await generateProjectKnowHow(activeProject.title, activeProject.description, activeProject.assetType || 'KERNEL');
        setProjects(prev => prev.map(p => 
            p.id === activeProject.id ? { ...p, knowHow: wisdom, isWisdomHarmonized: true } : p
        ));
        setIsGenerating(null);
    };

    return (
        <div className="h-full flex flex-col bg-[#01050a] text-gray-200 font-mono overflow-hidden">
            {/* FCC Command Header */}
            <div className="p-3 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-amber-500/10 border-2 border-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <StarIcon className="w-7 h-7 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-2xl text-white tracking-tighter italic uppercase leading-none">FCC COMMAND</h2>
                        <p className="text-[7px] text-amber-500/60 font-black uppercase tracking-[0.2em] mt-0.5">Federal Conjunction Control | Reliable Grid</p>
                    </div>
                </div>

                <div className="flex gap-3.5 items-center">
                    <div className="text-right">
                        <p className="text-[6px] text-gray-600 font-black uppercase mb-0.5">Global Misery Index</p>
                        <div className="flex items-center gap-1">
                             <div className="w-20 h-0.5 bg-gray-800 rounded-full overflow-hidden border border-black">
                                <div className="h-full bg-red-600 shadow-[0_0_4px_red]" style={{ width: `${globalStats.avgMisery}%` }} />
                             </div>
                             <span className="text-red-500 font-black text-[10px]">{globalStats.avgMisery}%</span>
                        </div>
                    </div>
                    <button onClick={() => setIsAdding(true)} className="vista-button px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-black rounded-md font-black uppercase text-xs tracking-widest flex items-center gap-1 shadow-[2px_2px_0_0_#000] transition-all active:translate-y-0.5">
                        <PlusSquareIcon className="w-3 h-3" />
                        <span>MANIFEST SHARD</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-2.5 gap-2.5 relative min-h-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,158,11,0.03)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left: Shard Index */}
                <div className="w-60 flex flex-col gap-2.5 flex-shrink-0 min-h-0 relative z-10">
                    <div className="aero-panel bg-black/40 border-amber-500/20 p-2.5 flex flex-col min-h-0 flex-1">
                         <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-0.5">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Logic Shards</h3>
                            <span className="text-[7px] font-mono text-amber-700">[{projects.length}]</span>
                         </div>
                         <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                            {projects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedId(p.id)}
                                    className={`w-full text-left p-2.5 rounded-md border-3 transition-all duration-300 group relative overflow-hidden ${
                                        selectedId === p.id 
                                        ? 'bg-amber-900/20 border-amber-600 shadow-[4px_4px_0_0_#000]' 
                                        : 'bg-black/40 border-black hover:border-amber-900/50 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-0.5">
                                        <span className={`text-[6px] font-black uppercase ${p.status === 'DONE' ? 'text-green-500' : 'text-cyan-400'}`}>{p.status}</span>
                                        {p.isWisdomHarmonized && <CheckCircleIcon className="w-1.5 h-1.5 text-amber-500" />}
                                    </div>
                                    <p className="font-bold text-white text-[11px] truncate uppercase tracking-tight">{p.title}</p>
                                    <div className="mt-2 flex justify-between items-center text-[5px] font-black uppercase text-gray-600">
                                        <span>Reliability</span>
                                        <span>{p.miseryScore}%</span>
                                    </div>
                                    <div className="h-0.5 bg-gray-950 rounded-full mt-0.5 overflow-hidden">
                                        <div className="h-full bg-amber-600 transition-all duration-500" style={{ width: `${p.miseryScore}%` }} />
                                    </div>
                                </button>
                            ))}
                         </div>
                    </div>

                    <div className="aero-panel bg-slate-900/60 border-white/5 p-2.5 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[7px] font-black uppercase text-gray-500">
                            <ActivityIcon className="w-2.5 h-2.5" />
                            <span>Conjunction Stride</span>
                        </div>
                        <p className="text-base font-comic-header text-white">1.2 PB/s</p>
                    </div>
                </div>

                {/* Main Control Console */}
                <div className="flex-1 flex flex-col gap-2.5 relative z-10">
                    {activeProject ? (
                        <div className="flex-1 aero-panel bg-black/60 border-amber-500/10 flex flex-col overflow-hidden relative shadow-[9px_9px_20px_rgba(0,0,0,0.5)]">
                             {/* Project Background Aura */}
                             <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                                <ShieldIcon className="w-56 h-56 text-amber-500" />
                             </div>

                             <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-start">
                                <div>
                                    <h3 className="font-comic-header text-3xl text-white italic tracking-tighter uppercase mb-0.5 leading-none">{activeProject.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[7px] bg-amber-600/30 text-amber-400 px-1.5 py-0.5 border border-amber-500/30 rounded-full font-black uppercase tracking-widest">Shard_Signature: 0x{activeProject.id.slice(0, 4)}</span>
                                        <span className="text-[7px] text-gray-500 font-mono italic">Created: {activeProject.timestamp.toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setProjects(prev => prev.filter(p => p.id !== activeProject.id))} className="text-red-900 hover:text-red-500 p-0.5 transition-colors">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                             </div>

                             <div className="flex-1 flex overflow-hidden p-4 gap-4 min-h-0">
                                {/* Reliability Manifest (Todo) */}
                                <div className="flex-1 flex flex-col gap-2.5 min-h-0">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-0.5">
                                        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <TerminalIcon className="w-3.5 h-3.5" /> Reliability Manifest
                                        </h4>
                                        <span className="text-[7px] font-black text-gray-600 uppercase">
                                            {activeProject.tasks.filter(t => t.completed).length}/{activeProject.tasks.length} SYNCED
                                        </span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                                        {activeProject.tasks.map(task => (
                                            <div key={task.id} className="p-2.5 bg-white/5 rounded-lg border-2 border-black hover:border-amber-500/30 transition-all flex items-center justify-between group">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => toggleTask(task.id)}
                                                        className={`w-3.5 h-3.5 rounded-md border-2 flex items-center justify-center transition-all ${
                                                            task.completed ? 'bg-green-600 border-green-600' : 'bg-black border-gray-800'
                                                        }`}
                                                    >
                                                        {task.completed && <CheckCircleIcon className="w-2.5 h-2.5 text-black" />}
                                                    </button>
                                                    <span className={`text-xs font-bold uppercase transition-all ${task.completed ? 'text-gray-600 line-through italic' : 'text-gray-200'}`}>
                                                        {task.text}
                                                    </span>
                                                </div>
                                                <button onClick={() => deleteTask(task.id)} className="text-gray-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <XIcon className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        ))}

                                        <div className="flex gap-1.5 pt-0.5">
                                            <input 
                                                value={newTaskText}
                                                onChange={e => setNewTaskText(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addTask()}
                                                placeholder="Inject new reliable objective..."
                                                className="flex-1 bg-black border-2 border-black rounded-lg p-1.5 text-[8px] font-black uppercase text-amber-500 focus:ring-0 focus:border-amber-600 transition-all placeholder:text-gray-900"
                                            />
                                            <button onClick={addTask} className="p-1.5 bg-amber-600 text-black rounded-md hover:bg-amber-500 transition-all active:scale-95 shadow-[1.5px_1.5px_0_0_#000]">
                                                <ZapIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Gifted Know-How Section */}
                                <div className="w-60 flex flex-col gap-2.5 min-h-0">
                                    <div className="flex items-center gap-1.5 border-b border-white/5 pb-0.5">
                                        <BookOpenIcon className="w-3.5 h-3.5" />
                                        <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Gifted Know-How Synthesis</h4>
                                    </div>
                                    
                                    <div className="flex-1 aero-panel bg-cyan-950/20 border-cyan-600/20 p-3.5 overflow-y-auto custom-scrollbar relative flex flex-col">
                                        {isGenerating === activeProject.id ? (
                                            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-cyan-400">
                                                <SpinnerIcon className="w-7 h-7 animate-spin-fast" />
                                                <p className="text-[7px] font-black uppercase tracking-[0.2em] animate-pulse">Siphoning Intelligence...</p>
                                            </div>
                                        ) : activeProject.knowHow ? (
                                            <div className="prose prose-invert prose-sm text-gray-300 font-mono italic leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                                                {activeProject.knowHow.split('\n').map((line, i) => (
                                                    <p key={i} className="mb-2.5">{line}</p>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                                                <LogicIcon className="w-10 h-10 mb-2.5 text-gray-600" />
                                                <p className="text-[7px] font-black uppercase tracking-[0.2em] mb-3.5">"Conduct the wisdom of the Sisters."</p>
                                                <button 
                                                    onClick={handleGenerateWisdom}
                                                    className="vista-button px-5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[7px] font-black uppercase tracking-[0.2em] shadow-[1.5px_1.5px_0_0_#000] transition-all active:translate-y-0.5"
                                                >
                                                    Invoke Wisdom Sync
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3.5 bg-red-950/20 border-2 border-red-600/30 rounded-lg relative overflow-hidden flex flex-col items-center">
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-red-600/40 animate-pulse" />
                                        <h5 className="text-[6px] font-black text-red-500 uppercase tracking-widest mb-2">Shard Risk Assessment</h5>
                                        <div className="text-center">
                                            <p className="text-xl font-comic-header text-white leading-none">HIGH</p>
                                            <p className="text-[5px] text-gray-500 font-black uppercase mt-0.5">Stability Threshold: 12%</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="flex-1 aero-panel bg-black/40 border-white/5 flex flex-col items-center justify-center opacity-20">
                            <LogicIcon className="w-20 h-20 mb-3.5" />
                            <p className="text-base font-black uppercase tracking-[0.3em]">Select a logic shard.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Creation Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="aero-panel bg-slate-900 border-4 border-black p-4 max-w-md w-full shadow-[10px_10px_40px_rgba(0,0,0,0.8)]">
                        <h3 className="font-comic-header text-2xl text-amber-500 mb-4 uppercase italic tracking-tighter">Initiate Shard</h3>
                        <div className="space-y-3.5 relative z-10">
                            <div className="bg-black border-3 border-black p-2.5 rounded-lg focus-within:border-amber-600 transition-all">
                                <p className="text-[6px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Shard Identity (Title)</p>
                                <input 
                                    autoFocus
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="e.g. Neural Link..."
                                    className="w-full bg-transparent border-none text-white font-black text-base uppercase focus:ring-0 outline-none placeholder:text-gray-900"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setIsAdding(false)} className="vista-button flex-1 py-2.5 bg-gray-800 text-gray-400 font-black uppercase text-xs rounded-lg border-3 border-black">ABORT SYNC</button>
                                <button 
                                    onClick={createProject} 
                                    disabled={!newTitle.trim()}
                                    className="vista-button flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-xs rounded-lg border-3 border-black shadow-[2px_2px_0_0_#000] active:translate-y-0.5 transition-all"
                                >
                                    COMMIT SHARD
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Command Line Stride */}
            <div className="p-1.5 bg-slate-900 border-t-8 border-black flex items-center justify-between z-40 px-5">
                <div className="flex items-center gap-5">
                   <div className="flex items-center gap-1.5">
                        <div className="w-0.5 h-0.5 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">FCC GRID: ONLINE</span>
                   </div>
                   <div className="text-[7px] text-gray-600 font-mono italic">
                      PROJECTS: {globalStats.total} | SYNC_RATE: {globalStats.harmonized}/{globalStats.total} | VELOCITY: 1.2 PB/s
                   </div>
                </div>
                <div className="text-[7px] text-gray-700 uppercase font-black italic tracking-[0.2em] hidden sm:block">
                   conjunction reliable series | maestro authority
                </div>
            </div>
        </div>
    );
};