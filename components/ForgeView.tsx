

import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ProjectBlueprint, BlueprintStatus, BlueprintPriority, ProjectTask } from '../types';
// Added WarningIcon to imports
import { BookOpenIcon, ForgeIcon, HammerIcon, SpinnerIcon, XIcon, PlusIcon, CheckCircleIcon, ActivityIcon, ZapIcon, TerminalIcon, LogicIcon, ShieldIcon, BrainIcon, FireIcon, WarningIcon } from './icons';
import { queryKnowledgeCore, suggestBlueprintTasks } from '../services/geminiService';

interface ForgeViewProps {
  blueprints: ProjectBlueprint[];
  onAddBlueprint: (title: string, description: string, priority: BlueprintPriority) => void;
  onUpdateBlueprintStatus: (id: string, status: BlueprintStatus) => void;
  onDeleteBlueprint: (id: string) => void;
  onAddTask: (blueprintId: string, text: string) => void;
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
        return `<pre class="bg-black/50 p-1 my-0.5 rounded-md border border-black font-mono text-[8px] overflow-x-auto"><code>${escapedCode}</code></pre>`; // Smaller code blocks
    })
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gim, '<h3 class="font-comic-header text-sm text-violet-300 mt-2 mb-0.5">$1</h3>') // Smaller heading
    .replace(/^## (.*$)/gim, '<h2 class="font-comic-header text-base text-violet-300 mt-2 mb-0.5 border-b border-black pb-0.5">$1</h2>') // Smaller heading
    .replace(/^# (.*$)/gim, '<h1 class="font-comic-header text-lg text-white mt-2 mb-0.5">$1</h1>') // Smaller heading
    .replace(/\n/g, '<br />');
};

const QuicTaskToggle: React.FC<{ completed: boolean; onToggle: () => void }> = ({ completed, onToggle }) => {
    const [verifying, setVerifying] = useState(false);
    const [pktNum, setPktNum] = useState(Math.floor(Math.random() * 1000));

    const handleToggle = () => {
        setVerifying(true);
        setPktNum(prev => prev + 1);
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
                
                <div className="absolute -top-0.5 px-0.5 bg-black text-[3px] font-black text-gray-500 rounded border border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                    {completed ? '0x40_SHORT' : '0x00_INIT'}
                </div>
            </button>
            {verifying && (
                <div className="text-[5px] font-mono text-cyan-400 animate-in slide-in-from-left-1">
                    [PKT_{pktNum}] WRITING_FLAGS...
                </div>
            )}
        </div>
    );
};

export const ForgeView: React.FC<ForgeViewProps> = ({ 
    blueprints, 
    onAddBlueprint, 
    onUpdateBlueprintStatus, 
    onDeleteBlueprint,
    onAddTask,
    onToggleTask,
    onDeleteTask
}) => {
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPriority, setNewPriority] = useState<BlueprintPriority>('Medium');
    const [newTaskTextMap, setNewTaskTextMap] = useState<{ [key: string]: string }>({}); 
    const [isSuggesting, setIsSuggesting] = useState<{ [key: string]: boolean }>({});

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

    const handleAddTask = (blueprintId: string) => {
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
            suggestions.forEach(taskText => {
                onAddTask(bpId, taskText);
            });
        } catch (e) {
            console.error(`[FORGE_ERROR] Failed to fetch task suggestions:`, e);
            // Optionally, set a local error state for the specific blueprint to display a message
        } finally {
            setIsSuggesting(prev => ({ ...prev, [bpId]: false }));
        }
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
        
        if (sortFilter !== 'All') {
            tempBlueprints = tempBlueprints.filter(bp => bp.priority === sortFilter);
        }
        
        if (statusFilter !== 'All') {
            tempBlueprints = tempBlueprints.filter(bp => bp.status === statusFilter);
        }

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
            <div className="p-2 border-b-4 border-black sticky top-0 z-10 bg-slate-900 rounded-t-lg flex justify-between items-center shadow-xl">
                <div>
                    <h2 className="font-comic-header text-xl text-white italic tracking-tighter uppercase">BLUEPRINTS FORGE</h2>
                    <p className="text-violet-500 -mt-0.5 uppercase text-[7px] font-black tracking-[0.2em]">Protocol 0x03E2 | Conjunction Forge</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="text-right">
                        <p className="text-[5px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Grid Saturation</p>
                        <p className="text-base font-comic-header text-amber-500">99.4%</p>
                    </div>
                    <div className="px-2 py-0.5 bg-black rounded-md border-2 border-black text-[7px] font-black text-gray-400 shadow-[1.5px_1.5px_0_0_#000]">
                        STRIDE: 1.2 PB/s
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-2.5 p-2.5 overflow-hidden">
                <div className="lg:w-1/2 flex flex-col gap-2.5 overflow-hidden">
                    <form onSubmit={handleAddBlueprint} className="aero-panel bg-slate-900/40 p-3.5 border-2 border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-110 transition-transform">
                             <ForgeIcon className="w-20 h-20 text-white" />
                        </div>
                        <h3 className="font-comic-header text-base text-violet-400 mb-3.5 flex items-center gap-1 uppercase italic">
                            <HammerIcon className="w-4 h-4 text-violet-500" /> Manifest New Logic
                        </h3>
                        <div className="space-y-2 relative z-10">
                            <input 
                                type="text" 
                                value={newTitle} 
                                onChange={e => setNewTitle(e.target.value)} 
                                placeholder="Blueprint Identity..." 
                                className="w-full bg-black/60 border-2 border-black rounded-lg p-2 focus:outline-none focus:border-violet-600 text-white font-bold placeholder:text-gray-800 transition-all shadow-inner" 
                                required 
                            />
                            <textarea 
                                value={newDescription} 
                                onChange={e => setNewDescription(e.target.value)} 
                                placeholder="Operational intent..." 
                                className="w-full h-14 bg-black/60 border-2 border-black rounded-lg p-2 resize-none focus:outline-none focus:border-violet-600 text-gray-300 font-mono text-xs placeholder:text-gray-800 transition-all shadow-inner" 
                                required 
                            />
                            <div className="flex items-center gap-2">
                                <select 
                                    value={newPriority} 
                                    onChange={e => setNewPriority(e.target.value as BlueprintPriority)} 
                                    className="flex-1 bg-black border-2 border-black rounded-lg p-1.5 focus:outline-none focus:border-violet-600 text-[7px] font-black uppercase text-gray-400 transition-all shadow-inner"
                                >
                                    {Object.keys(priorityMap).map(p => <option key={p} value={p}>{priorityMap[p as BlueprintPriority].label} Priority</option>)}
                                </select>
                                <button type="submit" className="vista-button bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 font-black uppercase text-xs tracking-widest rounded-lg shadow-[2px_2px_0_0_#000] active:translate-y-0.5 transition-all">
                                    Commit Shard
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="flex-1 aero-panel bg-black/40 border-white/5 overflow-hidden flex flex-col shadow-[9px_9px_20px_rgba(0,0,0,0.4)]">
                         <div className="p-2 border-b-2 border-black flex items-center justify-between bg-white/5 gap-2">
                            <h3 className="font-comic-header text-lg text-white uppercase italic tracking-tighter shrink-0">Active Blueprints</h3>
                            <div className="flex items-center gap-0.5 overflow-x-auto custom-scrollbar no-scrollbar">
                                <select 
                                    value={sortFilter}
                                    onChange={e => setSortFilter(e.target.value as 'All' | BlueprintPriority)}
                                    className="bg-black border-2 border-black rounded-sm p-0.5 text-[5px] font-black uppercase text-gray-500 focus:outline-none transition-all min-w-[60px]"
                                >
                                    <option value="All">All Tiers</option>
                                    {Object.keys(priorityMap).map(p => <option key={p} value={p}>{priorityMap[p as BlueprintPriority].label}</option>)}
                                </select>
                                <select 
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value as 'All' | BlueprintStatus)}
                                    className="bg-black border-2 border-black rounded-sm p-0.5 text-[5px] font-black uppercase text-gray-500 focus:outline-none transition-all min-w-[60px]"
                                >
                                    <option value="All">All States</option>
                                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto p-2 space-y-2.5 custom-scrollbar pr-1">
                            {sortedAndFilteredBlueprints.length > 0 ? sortedAndFilteredBlueprints.map(bp => {
                                const completedTasks = bp.tasks.filter(t => t.completed).length;
                                const progress = bp.tasks.length > 0 ? Math.round((completedTasks / bp.tasks.length) * 100) : 0;
                                const isSugLoading = isSuggesting[bp.id];
                                
                                return (
                                    <div key={bp.id} className="bg-slate-900/40 rounded-[1rem] border-4 border-black p-3.5 transition-all duration-700 hover:border-violet-900/40 relative group/card shadow-[4px_4px_0_0_#000]">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-[6px] font-black text-white px-1.5 py-0.5 rounded-full border-2 border-black inline-block uppercase tracking-widest ${priorityMap[bp.priority].color} shadow-lg`}>{bp.priority}</div>
                                                <h4 className="font-black text-sm text-white mt-1.5 uppercase tracking-tight truncate">{bp.title}</h4>
                                            </div>
                                            <button onClick={() => onDeleteBlueprint(bp.id)} className="text-gray-800 hover:text-red-500 p-0.5 transition-colors opacity-0 group-hover/card:opacity-100"><XIcon className="w-3 h-3" /></button>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3.5 font-mono italic leading-relaxed line-clamp-2">"{bp.description}"</p>
                                        
                                        <div className="mb-3.5 space-y-1">
                                            <div className="flex justify-between items-center text-[6px] font-black uppercase text-gray-500 tracking-[0.2em]">
                                                <span>Conjunction Sync</span>
                                                <span className={progress === 100 ? 'text-green-500' : 'text-cyan-400'}>{progress}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-black rounded-full overflow-hidden border-2 border-black p-0.5">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-green-500 shadow-[0_0_6px_green]' : 'bg-cyan-500 shadow-[0_0_4px_cyan]'}`} style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>

                                        <select value={bp.status} onChange={e => onUpdateBlueprintStatus(bp.id, e.target.value as BlueprintStatus)} className="w-full bg-black border-4 border-black rounded-lg p-1 text-[7px] font-black uppercase text-white focus:outline-none transition-all mb-3.5">
                                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>

                                        <div className="pt-3 border-t-2 border-black">
                                            <div className="flex items-center justify-between mb-2.5">
                                                <h5 className="font-black text-[7px] text-violet-400 uppercase tracking-[0.3em] flex items-center gap-0.5">
                                                    <ActivityIcon className="w-2.5 h-2.5" /> Logic Shards ({completedTasks}/{bp.tasks.length})
                                                </h5>
                                                <button 
                                                    onClick={() => handleSuggestTasks(bp.id, bp.title, bp.description)}
                                                    disabled={isSugLoading}
                                                    className="text-[5px] font-black uppercase text-amber-500 hover:text-amber-400 flex items-center gap-0.5 bg-amber-950/20 px-0.5 py-0.5 rounded border border-amber-900/30 transition-all disabled:opacity-20"
                                                >
                                                    {isSugLoading ? <SpinnerIcon className="w-1.5 h-1.5" /> : <BrainIcon className="w-1.5 h-1.5" />}
                                                    Inject Objectives
                                                </button>
                                            </div>
                                            
                                            {bp.tasks.length === 0 ? (
                                                <div className="py-3 text-center border-2 border-dashed border-black rounded-lg opacity-20">
                                                    <p className="text-[7px] font-black uppercase tracking-widest italic">Awaiting Logic Ingress.</p>
                                                </div>
                                            ) : (
                                                <ul className="space-y-1.5 mb-3.5">
                                                    {bp.tasks.map(task => (
                                                        <li key={task.id} className={`flex items-center justify-between p-1.5 rounded-lg border-4 transition-all duration-500 group/task ${
                                                            task.completed 
                                                            ? 'bg-cyan-950/20 border-cyan-800/40' 
                                                            : 'bg-black border-black'
                                                        }`}>
                                                            <div className="flex items-center gap-2">
                                                                <QuicTaskToggle 
                                                                    completed={task.completed} 
                                                                    onToggle={() => onToggleTask(bp.id, task.id)} 
                                                                />
                                                                <span className={`text-[10px] font-bold uppercase tracking-tighter transition-all ${
                                                                    task.completed ? 'text-cyan-400 italic line-through opacity-50' : 'text-gray-300'
                                                                }`}>
                                                                    {task.text}
                                                                </span>
                                                            </div>
                                                            <button onClick={() => onDeleteTask(bp.id, task.id)} className="text-gray-800 hover:text-red-500 p-0.5 opacity-0 group-hover/task:opacity-100 transition-opacity">
                                                                <XIcon className="w-2.5 h-2.5" />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            
                                            <div className="flex gap-1.5">
                                                <input 
                                                    type="text" 
                                                    value={newTaskTextMap[bp.id] || ''}
                                                    onChange={e => setNewTaskTextMap(prev => ({ ...prev, [bp.id]: e.target.value }))}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddTask(bp.id)}
                                                    placeholder="Inject directive..."
                                                    className="flex-1 bg-black border-4 border-black rounded-lg p-1.5 text-[7px] font-black uppercase text-amber-500 focus:outline-none focus:border-amber-600 placeholder:text-gray-900 transition-all"
                                                />
                                                <button onClick={() => handleAddTask(bp.id)} className="p-2 bg-violet-600 text-black rounded-md hover:bg-violet-500 transition-all shadow-[1.5px_1.5px_0_0_#000] active:translate-y-0.5">
                                                    <PlusIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : <div className="text-center text-gray-600 italic p-6">No active blueprints staged.</div>}
                         </div>
                    </div>
                </div>

                <div className="lg:w-1/2 flex flex-col aero-panel bg-black/50 border-white/5 overflow-hidden">
                    <div className="p-3.5 border-b-2 border-black flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2">
                            <BookOpenIcon className="w-5 h-5 text-violet-500" />
                            <h3 className="font-comic-header text-lg text-white uppercase italic tracking-tighter">Knowledge Core</h3>
                        </div>
                        <div className="flex items-center gap-1 text-[7px] font-black text-gray-500 uppercase tracking-widest">
                            <div className="w-0.5 h-0.5 rounded-full bg-cyan-500 animate-ping" />
                            Live Feed
                        </div>
                    </div>
                    
                    <div className="p-3.5 border-b-4 border-black space-y-2">
                        <div className="flex gap-1.5">
                            <div className="flex-1 bg-black border-4 border-black rounded-lg overflow-hidden focus-within:border-cyan-600 transition-all">
                                <input 
                                    type="search" 
                                    value={searchQuery} 
                                    onChange={e => setSearchQuery(e.target.value)} 
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()} 
                                    placeholder="Scour AetherOS archives..." 
                                    className="w-full bg-transparent p-2 text-cyan-400 font-mono text-xs placeholder:text-gray-900 focus:ring-0 outline-none" 
                                />
                            </div>
                            <button onClick={() => handleSearch()} className="vista-button bg-cyan-600 hover:bg-cyan-500 text-black px-4 py-2.5 font-black uppercase text-xs rounded-lg shadow-[2px_2px_0_0_#000] active:translate-y-0.5">Search</button>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            {['Kernel Sync', 'Protocol Drift', 'Forensic Audit', 'God Logic'].map(topic => (
                                <button key={topic} onClick={() => { setSearchQuery(topic); handleSearch(topic); }} className="text-[6px] font-black uppercase bg-black hover:bg-white hover:text-black text-gray-500 px-2.5 py-1 rounded-full border-2 border-black transition-all">{topic}</button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {isLoading && (
                            <div className="flex flex-col justify-center items-center h-full gap-2.5">
                                <div className="relative">
                                    <SpinnerIcon className="w-12 h-12 text-violet-500 animate-spin-slow" />
                                    <BrainIcon className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <p className="text-[7px] font-black uppercase text-violet-500 animate-pulse tracking-[0.3em]">Siphoning Ancient Letters...</p>
                            </div>
                        )}
                        
                        {error && (
                            <div className="text-center p-6 bg-red-950/20 border-4 border-red-600 rounded-[1.5rem] animate-in zoom-in-95">
                                {/* Fix: Added missing WarningIcon import above */}
                                <WarningIcon className="w-10 h-10 text-red-600 mx-auto mb-2.5 animate-bounce" />
                                <p className="text-red-500 font-black uppercase tracking-widest leading-relaxed italic">"{error}"</p>
                            </div>
                        )}
                        
                        {!isLoading && !error && !knowledgeResult && (
                            <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                                <LogicIcon className="w-24 h-24 text-gray-500" />
                                <p className="font-comic-header text-xl uppercase tracking-[0.2em] text-center max-w-sm italic leading-relaxed">
                                    "The show starts when the logic flows."
                                </p>
                            </div>
                        )}
                        
                        {knowledgeResult && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                                <div className="prose prose-invert prose-sm text-gray-300 max-w-none font-mono text-[8px] leading-relaxed italic" dangerouslySetInnerHTML={{ __html: formatKnowledgeText(knowledgeResult) }} />
                                <div className="mt-5 pt-3 border-t border-white/5 flex justify-center">
                                    <div className="flex items-center gap-2 p-1.5 bg-violet-600/10 border-2 border-violet-500/20 rounded-lg">
                                        <CheckCircleIcon className="w-2.5 h-2.5 text-violet-400" />
                                        <span className="text-[6px] font-black text-violet-400 uppercase tracking-widest">End of Logic Transmission</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="p-2 bg-slate-900 border-t-8 border-black flex justify-between items-center z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.5)]">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-cyan-500 animate-ping" />
                        <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest">Maestro's Forge: ACTIVE</span>
                    </div>
                    <span className="text-[7px] text-gray-600 font-mono tracking-widest uppercase">Grid_Load: 14% | Stability: 99.4%</span>
                 </div>
                 <div className="text-[7px] text-gray-700 font-black uppercase italic tracking-[0.2em] hidden sm:block">
                    Conjunction Reliable Series
                 </div>
            </div>
        </div>
    );
};
