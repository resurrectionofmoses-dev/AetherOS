import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ProjectBlueprint, BlueprintStatus, BlueprintPriority, ProjectTask } from '../types';
import { 
    BookOpenIcon, ForgeIcon, HammerIcon, SpinnerIcon, XIcon, PlusIcon, 
    CheckCircleIcon, ActivityIcon, ZapIcon, TerminalIcon, LogicIcon, 
    ShieldIcon, BrainIcon, FireIcon, WarningIcon, SearchIcon, SignalIcon, CodeIcon 
} from './icons';
import { queryKnowledgeCore, suggestBlueprintTasks } from '../services/geminiService';

interface ForgeViewProps {
  blueprints: ProjectBlueprint[];
  onAddBlueprint: (title: string, description: string, priority: BlueprintPriority, initialTasks?: string[]) => void;
  onUpdateBlueprintStatus: (id: string, status: BlueprintStatus) => void;
  onDeleteBlueprint: (id: string) => void;
  onAddTask: (blueprintId: string, text: string) => void;
  onAddTasks: (blueprintId: string, texts: string[]) => void;
  onToggleTask: (blueprintId: string, taskId: string) => void;
  onDeleteTask: (blueprintId: string, taskId: string) => void;
}

const priorityMap: Record<BlueprintPriority, { color: string, label: string }> = {
    'Low': { color: 'bg-gray-500', label: 'Low' },
    'Medium': { color: 'bg-sky-500', label: 'Medium' },
    'High': { color: 'bg-yellow-500', label: 'High' },
    'Critical': { color: 'bg-red-500', label: 'Critical' },
};

const priorityOrder: Record<BlueprintPriority, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1,
};

const statusOptions: BlueprintStatus[] = ['Pending', 'In Progress', 'Completed', 'On Hold'];

const formatKnowledgeText = (text: string): string => {
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const escapedCode = code.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<pre class="bg-black/50 p-1 my-0.5 rounded-md border border-black font-mono text-[8px] overflow-x-auto"><code>${escapedCode}</code></pre>`;
    })
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gim, '<h3 class="font-comic-header text-sm text-violet-300 mt-2 mb-0.5">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="font-comic-header text-base text-violet-300 mt-2 mb-0.5 border-b border-black pb-0.5">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="font-comic-header text-lg text-white mt-2 mb-0.5">$1</h1>')
    .replace(/\n/g, '<br />');
};

const QuicTaskToggle: React.FC<{ completed: boolean; onToggle: () => void }> = ({ completed, onToggle }) => {
    const [verifying, setVerifying] = useState(false);

    const handleToggle = () => {
        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            onToggle();
        }, 600);
    };

    return (
        <div className="flex items-center gap-1">
            <button 
                onClick={handleToggle}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 relative group overflow-hidden ${
                    completed ? 'bg-cyan-600 border-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.4)]' : 'bg-black border-gray-800 hover:border-violet-600'
                }`}
            >
                {verifying ? (
                    <SpinnerIcon className="w-3 h-3 text-white" />
                ) : completed ? (
                    <ZapIcon className="w-3 h-3 text-black" />
                ) : (
                    <div className="w-0.5 h-0.5 rounded-full bg-gray-800 group-hover:bg-violet-600 transition-colors" />
                )}
            </button>
        </div>
    );
};

export const ForgeView: React.FC<ForgeViewProps> = ({ 
    blueprints, 
    onAddBlueprint, 
    onUpdateBlueprintStatus, 
    onDeleteBlueprint,
    onAddTask,
    onAddTasks,
    onToggleTask,
    onDeleteTask
}) => {
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPriority, setNewPriority] = useState<BlueprintPriority>('Medium');
    const [newTaskTextMap, setNewTaskTextMap] = useState<{ [key: string]: string }>({}); 
    const [isSuggesting, setIsSuggesting] = useState<{ [key: string]: boolean }>({});
    const [suggestionsMap, setSuggestionsMap] = useState<Record<string, string[]>>({});

    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [knowledgeResult, setKnowledgeResult] = useState('');
    const [error, setError] = useState('');

    const [sortFilter, setSortFilter] = useState<'All' | BlueprintPriority>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | BlueprintStatus>('All');

    const handleAddBlueprint = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newDescription.trim()) return;
        onAddBlueprint(newTitle, newDescription, newPriority);
        setNewTitle('');
        setNewDescription('');
        setNewPriority('Medium');
    };

    const handleAddTaskLocal = (blueprintId: string) => {
        const text = newTaskTextMap[blueprintId]?.trim();
        if (text) {
            onAddTask(blueprintId, text);
            setNewTaskTextMap(prev => ({ ...prev, [blueprintId]: '' }));
        }
    };

    const handleSuggestTasks = async (bpId: string, title: string, desc: string) => {
        setIsSuggesting(prev => ({ ...prev, [bpId]: true }));
        try {
            const suggestions = await suggestBlueprintTasks(title, desc);
            setSuggestionsMap(prev => ({ ...prev, [bpId]: suggestions }));
        } catch (e) {
            console.error(`[FORGE_ERROR] Failed to fetch task suggestions:`, e);
        } finally {
            setIsSuggesting(prev => ({ ...prev, [bpId]: false }));
        }
    };

    const handleCommitSuggestion = (bpId: string, suggestion: string) => {
        onAddTask(bpId, suggestion);
        setSuggestionsMap(prev => ({
            ...prev,
            [bpId]: prev[bpId].filter(s => s !== suggestion)
        }));
    };

    const handleSearch = async (query?: string) => {
        const finalQuery = query || searchQuery;
        if (!finalQuery.trim()) return;
        
        setIsLoading(true);
        setKnowledgeResult('');
        setError('');
        try {
            let fullResponse = '';
            for await (const chunk of queryKnowledgeCore(finalQuery)) {
                fullResponse += chunk;
                setKnowledgeResult(fullResponse);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to query the knowledge core. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const sortedAndFilteredBlueprints = useMemo(() => {
        let tempBlueprints = [...blueprints];
        if (sortFilter !== 'All') tempBlueprints = tempBlueprints.filter(bp => bp.priority === sortFilter);
        if (statusFilter !== 'All') tempBlueprints = tempBlueprints.filter(bp => bp.status === statusFilter);

        tempBlueprints.sort((a, b) => {
            const priorityA = priorityOrder[a.priority];
            const priorityB = priorityOrder[b.priority];
            if (priorityB !== priorityA) return priorityB - priorityA; 
            return b.timestamp.getTime() - a.timestamp.getTime();
        });
        return tempBlueprints;
    }, [blueprints, sortFilter, statusFilter]);

    return (
        <div className="h-full flex flex-col bg-[#0a0a15] rounded-lg">
            {/* Header */}
            <div className="p-3 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-violet-600/10 border-4 border-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                        <ForgeIcon className="w-8 h-8 text-violet-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-3xl text-white italic tracking-tighter uppercase leading-none">BLUEPRINT FORGE</h2>
                        <p className="text-violet-500 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">Reliable Sub-Task Architecture | 0x03E2</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Core Density</p>
                        <p className="text-xl font-comic-header text-amber-500">{blueprints.length} SHARDS</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.02)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left: Manifest & Grid */}
                <div className="lg:w-1/2 flex flex-col gap-4 min-h-0 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
                        <form onSubmit={handleAddBlueprint} className="aero-panel bg-slate-900/60 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] group h-full">
                            <h3 className="font-comic-header text-2xl text-violet-400 mb-4 flex items-center gap-3 uppercase italic">
                                <HammerIcon className="w-6 h-6 text-violet-500" /> Manifest Blueprint
                            </h3>
                            <div className="space-y-3">
                                <input 
                                    type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} 
                                    placeholder="Identity Signature..." 
                                    className="w-full bg-black border-2 border-black rounded-xl p-2 text-white font-black uppercase text-xs placeholder:text-gray-900 focus:border-violet-600 transition-all outline-none" 
                                    required 
                                />
                                <textarea 
                                    value={newDescription} onChange={e => setNewDescription(e.target.value)} 
                                    placeholder="Core Intent..." 
                                    className="w-full h-16 bg-black border-2 border-black rounded-xl p-2 text-gray-300 font-mono text-[10px] resize-none placeholder:text-gray-900 focus:border-violet-600 transition-all outline-none" 
                                    required 
                                />
                                <div className="flex gap-2">
                                    <select 
                                        value={newPriority} onChange={e => setNewPriority(e.target.value as BlueprintPriority)} 
                                        className="flex-1 bg-black border-2 border-black rounded-xl p-1.5 text-[9px] font-black uppercase text-gray-400 focus:border-violet-600 outline-none transition-all"
                                    >
                                        {Object.keys(priorityMap).map(p => <option key={p} value={p}>{p} Priority</option>)}
                                    </select>
                                    <button type="submit" className="vista-button px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-[3px_3px_0_0_#000] transition-all active:translate-y-1">
                                        COMMIT
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Preset Shards Section */}
                        <div className="aero-panel bg-black/40 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col">
                            <h3 className="font-comic-header text-xl text-cyan-400 mb-4 flex items-center gap-2 uppercase italic">
                                <ZapIcon className="w-5 h-5 text-amber-500" /> Preset Shards
                            </h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                                <button 
                                    onClick={() => onAddBlueprint(
                                        "Real-Time Telemetry Module", 
                                        "Sovereign data acquisition shard for absolute vehicle diagnostics.", 
                                        "High",
                                        ["Define data schema", "Implement OBD-II communication", "Develop data buffering/transmission logic"]
                                    )}
                                    className="w-full p-2.5 bg-cyan-900/10 border-2 border-cyan-800/40 rounded-xl text-left group hover:border-cyan-400 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <SignalIcon className="w-4 h-4 text-cyan-500" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-tight">Telemetry Module</span>
                                    </div>
                                    <p className="text-[8px] text-gray-600 italic leading-tight">Define schema, OBD-II comms, & buffering.</p>
                                </button>
                                <button 
                                    onClick={() => onAddBlueprint(
                                        "Kernel Security Layer", 
                                        "Hard-coded binary firewall for forensic system protection.", 
                                        "Critical",
                                        ["Initialize root hooks", "Implement SHA-256 signature verification", "Establish sanitization filters"]
                                    )}
                                    className="w-full p-2.5 bg-red-900/10 border-2 border-red-800/40 rounded-xl text-left group hover:border-red-400 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <ShieldIcon className="w-4 h-4 text-red-500" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-tight">Security Shard</span>
                                    </div>
                                    <p className="text-[8px] text-gray-600 italic leading-tight">Root hooks, signature check, & sanitization.</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 aero-panel bg-black/40 border-4 border-black flex flex-col min-h-0 overflow-hidden shadow-[12px_12px_20px_rgba(0,0,0,0.5)]">
                         <div className="p-3 border-b-2 border-white/5 flex items-center justify-between bg-white/5">
                            <h3 className="font-comic-header text-xl text-white italic tracking-widest uppercase">Active Blueprints</h3>
                            <div className="flex gap-2">
                                <select value={sortFilter} onChange={e => setSortFilter(e.target.value as any)} className="bg-black border-2 border-zinc-800 rounded px-2 py-0.5 text-[8px] font-black uppercase text-gray-500">
                                    <option value="All">All Tiers</option>
                                    {Object.keys(priorityMap).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                         </div>
                         <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {sortedAndFilteredBlueprints.map(bp => {
                                const completed = bp.tasks.filter(t => t.completed).length;
                                const total = bp.tasks.length;
                                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                                const hasSuggestions = suggestionsMap[bp.id] && suggestionsMap[bp.id].length > 0;
                                
                                return (
                                    <div key={bp.id} className="bg-slate-900/60 rounded-3xl border-4 border-black p-5 transition-all duration-500 hover:border-violet-600/40 relative group overflow-hidden shadow-[6px_6px_0_0_#000]">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white border-2 border-black ${priorityMap[bp.priority].color} shadow-lg`}>{bp.priority}</span>
                                                <h4 className="font-black text-lg text-white mt-2 uppercase tracking-tight">{bp.title}</h4>
                                            </div>
                                            <button onClick={() => onDeleteBlueprint(bp.id)} className="text-red-900 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><XIcon className="w-5 h-5" /></button>
                                        </div>
                                        
                                        <div className="mb-6 space-y-1.5">
                                            <div className="flex justify-between text-[8px] font-black uppercase text-gray-500 tracking-widest">
                                                <span>Task Conjunction</span>
                                                <span className={progress === 100 ? 'text-green-500' : 'text-cyan-400'}>{completed}/{total} ({progress}%)</span>
                                            </div>
                                            <div className="h-2 bg-black border-2 border-black rounded-full overflow-hidden p-0.5 shadow-inner">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-cyan-600 shadow-[0_0_8px_cyan]'}`} style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>

                                        {/* Suggestions Section */}
                                        {hasSuggestions && (
                                            <div className="mb-6 p-4 bg-violet-950/20 border-2 border-violet-800/40 rounded-2xl animate-in zoom-in-95 duration-500">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-[8px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                                                        <BrainIcon className="w-3 h-3" /> Objective Suggestions
                                                    </p>
                                                    <button onClick={() => setSuggestionsMap(p => ({ ...p, [bp.id]: [] }))} className="text-gray-600 hover:text-white transition-colors"><XIcon className="w-3 h-3" /></button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {suggestionsMap[bp.id].map((s, idx) => (
                                                        <button 
                                                            key={idx} 
                                                            onClick={() => handleCommitSuggestion(bp.id, s)}
                                                            className="px-2.5 py-1 bg-black/40 border border-violet-700/50 rounded-lg text-[8px] font-bold text-violet-200 hover:bg-violet-600 hover:text-white transition-all uppercase tracking-tight text-left max-w-full"
                                                        >
                                                            + {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2 border-t border-white/5 pt-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <p className="text-[9px] font-black text-violet-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <TerminalIcon className="w-3.5 h-3.5" /> Sub-Task Registry
                                                </p>
                                                <button 
                                                    onClick={() => handleSuggestTasks(bp.id, bp.title, bp.description)} 
                                                    disabled={isSuggesting[bp.id]}
                                                    className="text-[7px] bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-500 hover:text-white transition-all uppercase font-black flex items-center gap-1.5"
                                                >
                                                    {isSuggesting[bp.id] ? <SpinnerIcon className="w-2.5 h-2.5 animate-spin" /> : <BrainIcon className="w-2.5 h-2.5" />}
                                                    {isSuggesting[bp.id] ? 'Gazing...' : 'Suggest Shards'}
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                                {bp.tasks.map(task => (
                                                    <div key={task.id} className={`p-2.5 rounded-xl border-4 transition-all duration-500 flex items-center justify-between group/task ${task.completed ? 'bg-cyan-950/20 border-cyan-800/40' : 'bg-black border-black'}`}>
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <QuicTaskToggle completed={task.completed} onToggle={() => onToggleTask(bp.id, task.id)} />
                                                            <span className={`text-[10px] font-bold uppercase truncate transition-all ${task.completed ? 'text-cyan-500 line-through italic opacity-40' : 'text-gray-300'}`}>{task.text}</span>
                                                        </div>
                                                        <button onClick={() => onDeleteTask(bp.id, task.id)} className="text-gray-800 hover:text-red-500 opacity-0 group-hover/task:opacity-100"><XIcon className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-2 mt-4 pt-4 border-t border-black">
                                                <input 
                                                    type="text" 
                                                    value={newTaskTextMap[bp.id] || ''} 
                                                    onChange={e => setNewTaskTextMap(prev => ({ ...prev, [bp.id]: e.target.value }))}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddTaskLocal(bp.id)}
                                                    placeholder="Inject reliable objective..." 
                                                    className="flex-1 bg-black border-4 border-black rounded-xl px-3 py-2 text-[10px] text-amber-500 font-black uppercase focus:border-amber-600 transition-all outline-none placeholder:text-gray-900" 
                                                />
                                                <button onClick={() => handleAddTaskLocal(bp.id)} className="p-2.5 bg-violet-600 text-black rounded-xl hover:bg-violet-500 transition-all shadow-[2px_2px_0_0_#000] active:translate-y-0.5">
                                                    <PlusIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                         </div>
                    </div>
                </div>

                {/* Right: Knowledge Core */}
                <div className="lg:w-1/2 flex flex-col aero-panel bg-black/60 border-4 border-black overflow-hidden shadow-[20px_20px_100px_rgba(0,0,0,0.8)] relative">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    
                    <div className="p-4 border-b-4 border-black flex items-center justify-between bg-white/5 relative z-10">
                        <div className="flex items-center gap-3">
                            <BookOpenIcon className="w-6 h-6 text-cyan-400" />
                            <h3 className="font-comic-header text-2xl text-white uppercase italic tracking-tighter">Knowledge Retrieval</h3>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-900/30 border-2 border-cyan-800/40 rounded-full animate-pulse">
                            <div className="w-1 h-1 rounded-full bg-cyan-400" />
                            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">LIVE_CORE</span>
                        </div>
                    </div>

                    <div className="p-6 border-b-4 border-black bg-slate-900/40 relative z-10">
                         <div className="flex gap-3 mb-4">
                            <div className="flex-1 bg-black border-4 border-black rounded-2xl overflow-hidden focus-within:border-cyan-600 transition-all">
                                <input 
                                    type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()} 
                                    placeholder="Scour AetherOS archives..." 
                                    className="w-full bg-transparent p-4 text-cyan-400 font-mono text-sm placeholder:text-gray-900 focus:ring-0 outline-none" 
                                />
                            </div>
                            <button onClick={() => handleSearch()} className="vista-button px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase text-sm tracking-widest rounded-2xl shadow-[4px_4px_0_0_#000] active:translate-y-1">SEARCH</button>
                         </div>
                         <div className="flex gap-2 flex-wrap">
                            {['Kernel Hooks', 'OBD-II Probes', 'Neural Shards', 'Epitume'].map(tag => (
                                <button key={tag} onClick={() => { setSearchQuery(tag); handleSearch(tag); }} className="text-[8px] font-black uppercase bg-black hover:bg-white hover:text-black text-gray-600 px-3 py-1 rounded-full border-2 border-black transition-all"># {tag}</button>
                            ))}
                         </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
                        {isLoading && (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <div className="relative">
                                    <SpinnerIcon className="w-16 h-16 text-cyan-500 animate-spin-slow" />
                                    <BrainIcon className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.4em] animate-pulse">Siphoning Wisdom...</p>
                            </div>
                        )}
                        
                        {error && (
                            <div className="p-8 bg-red-950/20 border-4 border-red-600 rounded-[2.5rem] text-center animate-bounce">
                                <WarningIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                                <p className="text-red-500 font-black uppercase tracking-widest italic leading-relaxed">{error}</p>
                            </div>
                        )}

                        {!isLoading && !error && !knowledgeResult && (
                             <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-8">
                                <LogicIcon className="w-32 h-32" />
                                <p className="font-comic-header text-4xl uppercase tracking-[0.3em] text-center max-w-sm italic">
                                    "The show starts when the logic flows."
                                </p>
                            </div>
                        )}

                        {knowledgeResult && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                <div className="prose prose-invert prose-sm text-gray-300 max-w-none font-mono text-[10px] leading-relaxed italic" dangerouslySetInnerHTML={{ __html: formatKnowledgeText(knowledgeResult) }} />
                                <div className="mt-10 pt-6 border-t border-white/5 flex justify-center">
                                    <div className="flex items-center gap-3 p-3 bg-cyan-600/10 border-2 border-cyan-500/20 rounded-xl">
                                        <CheckCircleIcon className="w-5 h-5 text-cyan-400" />
                                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">End of Logic Transmission</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="p-2 bg-slate-900 border-t-8 border-black flex justify-between items-center z-30 px-8 shadow-inner">
                <div className="flex items-center gap-8">
                   <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Forge Status: CONDUCTING</span>
                   </div>
                   <span className="text-[9px] text-gray-600 font-mono italic">Stride: 1.2 PB/s | Buffer: 0x03E2 | Heat: OPTIMAL</span>
                </div>
                <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.5em] hidden sm:block">Absolute reliable series authority.</p>
            </div>
        </div>
    );
};