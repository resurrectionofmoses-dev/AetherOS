
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MusicIcon, ActivityIcon, ZapIcon, CheckCircleIcon, FireIcon, CodeIcon, TerminalIcon, PlusIcon, BotIcon, ShieldIcon, XIcon, StarIcon, BrainIcon } from './icons';
import { getSophisticatedColor } from '../utils';
import type { NetworkProject } from '../types';
import { suggestBlueprintTasks } from '../services/geminiService';
import { SonicMetric } from './SonicMetric';
import { Modal } from './Modal';
import { reportError, ErrorSeverity } from './GlobalErrorHandler';

interface ProjectNetworkProps {
    projects: NetworkProject[];
    onDeleteProject: (id: string) => void;
    onToggleTask: (projectId: string, taskId: string) => void;
    onAddTask: (projectId: string, text: string, dueDate?: string, priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => void;
    onDeleteTask: (projectId: string, taskId: string) => void;
    onUpdateProject?: (projectId: string, updates: Partial<NetworkProject>) => void;
}

export const ProjectNetwork: React.FC<ProjectNetworkProps> = ({ projects, onDeleteProject, onToggleTask, onAddTask, onDeleteTask, onUpdateProject }) => {
    const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
    const [dateInputs, setDateInputs] = useState<Record<string, string>>({});
    const [priorityInputs, setPriorityInputs] = useState<Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>>({});
    const [taskFilters, setTaskFilters] = useState<Record<string, 'all' | 'active' | 'completed'>>({});
    const [taskSorts, setTaskSorts] = useState<Record<string, 'default' | 'dueDate' | 'alphabetical' | 'priority' | 'creationDate'>>({});
    const [suggestingFor, setSuggestingFor] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [projectStatusFilter, setProjectStatusFilter] = useState<string>('ALL');
    const [projectCompletionFilter, setProjectCompletionFilter] = useState<string>('ALL');
    const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('ALL');
    const [projectPriorityFilter, setProjectPriorityFilter] = useState<string>('ALL');

    const handleAddTask = (projectId: string) => {
        const text = taskInputs[projectId];
        const dueDate = dateInputs[projectId];
        const priority = priorityInputs[projectId] || 'MEDIUM';
        if (!text?.trim()) return;
        onAddTask(projectId, text, dueDate, priority);
        setTaskInputs(prev => ({...prev, [projectId]: ''}));
        setDateInputs(prev => ({...prev, [projectId]: ''}));
        setPriorityInputs(prev => ({...prev, [projectId]: 'MEDIUM'}));
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            onDeleteProject(projectToDelete);
            setProjectToDelete(null);
        }
    };

    const handleSuggestTasks = async (p: NetworkProject) => {
        setSuggestingFor(p.id);
        try {
            const suggestions = await suggestBlueprintTasks(p.title, p.description || '');
            suggestions.forEach(suggestion => {
                onAddTask(p.id, suggestion);
            });
        } catch (error: any) {
            console.error("Failed to call the Gemini API:", error);
            reportError({
                title: 'SUGGESTION_FAILURE',
                message: `Failed to generate blueprint tasks: ${error?.message || 'Unknown neural fracture'}`,
                severity: ErrorSeverity.MEDIUM,
                error: error
            });
        } finally {
            setSuggestingFor(null);
        }
    };

    const stats = {
        totalResonators: projects.length,
        avgGain: projects.length ? Math.round(projects.reduce((a, b) => a + b.fightVector, 0) / projects.length) : 0,
        spectralNoise: projects.length ? Math.round(projects.reduce((a, b) => a + b.crazyLevel, 0) / projects.length) : 0,
    };

    const filteredProjects = projects.filter(p => {
        if (projectStatusFilter !== 'ALL' && p.status !== projectStatusFilter) return false;
        
        if (projectCompletionFilter !== 'ALL') {
            const totalTasks = p.tasks ? p.tasks.length : 0;
            const completedTasks = p.tasks ? p.tasks.filter(t => t.completed).length : 0;
            const completionPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

            if (projectCompletionFilter === '0-49') {
                if (completionPercentage >= 50) return false;
            } else if (projectCompletionFilter === '50-99') {
                if (completionPercentage < 50 || completionPercentage >= 100) return false;
            } else if (projectCompletionFilter === '100') {
                if (completionPercentage !== 100 || totalTasks === 0) return false;
            }
        }
        
        if (projectPriorityFilter !== 'ALL') {
            if (p.priority !== projectPriorityFilter) return false;
        }

        if (taskPriorityFilter !== 'ALL') {
            const hasPriorityTask = p.tasks && p.tasks.some(t => t.priority === taskPriorityFilter);
            if (!hasPriorityTask) return false;
        }
        
        return true;
    });

    return (
        <div className="h-full flex flex-col bg-transparent text-gray-200 font-mono p-4 space-y-4 overflow-hidden relative">
            {/* Header: Acoustic Command */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-black p-4 rounded-3xl border-4 border-black aero-panel shadow-[8px_8px_0_0_#000] relative z-10 gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600/10 border-4 border-blue-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <MusicIcon className="w-10 h-10 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-4xl text-white italic tracking-tighter uppercase leading-none">Acoustic_Conjunction</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] bg-blue-900/40 text-blue-400 px-2 py-0.5 border border-blue-500/30 rounded font-black uppercase tracking-widest">Master Solo Series</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-10">
                    <SonicMetric size="sm" value={stats.totalResonators} label="CHAMBERS" unit="Nodes" colorClass="border-blue-600 text-blue-500" />
                    <SonicMetric size="sm" value={stats.avgGain} label="RESONANCE" unit="dB" colorClass="border-amber-600 text-amber-500" />
                    <SonicMetric size="sm" value={stats.spectralNoise} label="NOISE_THD" unit="%" colorClass="border-red-600 text-red-500" />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-black/40 p-4 rounded-xl border border-white/10 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Status:</span>
                    <select 
                        value={projectStatusFilter}
                        onChange={(e) => setProjectStatusFilter(e.target.value)}
                        className="bg-black border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="IDEATING">Ideating</option>
                        <option value="BUILDING">Building</option>
                        <option value="DONE">Done</option>
                        <option value="FORGING">Forging</option>
                        <option value="STABLE">Stable</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Completion:</span>
                    <select 
                        value={projectCompletionFilter}
                        onChange={(e) => setProjectCompletionFilter(e.target.value)}
                        className="bg-black border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Projects</option>
                        <option value="0-49">0% - 49% Completed</option>
                        <option value="50-99">50% - 99% Completed</option>
                        <option value="100">100% Completed</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Project Priority:</span>
                    <select 
                        value={projectPriorityFilter}
                        onChange={(e) => setProjectPriorityFilter(e.target.value)}
                        className="bg-black border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Task Priority:</span>
                    <select 
                        value={taskPriorityFilter}
                        onChange={(e) => setTaskPriorityFilter(e.target.value)}
                        className="bg-black border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">Any Priority</option>
                        <option value="LOW">Has Low Priority</option>
                        <option value="MEDIUM">Has Medium Priority</option>
                        <option value="HIGH">Has High Priority</option>
                        <option value="CRITICAL">Has Critical Priority</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pr-2 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                    <AnimatePresence>
                        {filteredProjects.map(p => {
                            const theme = getSophisticatedColor(p.id + p.title);
                            const currentFilter = taskFilters[p.id] || 'all';
                            const currentSort = taskSorts[p.id] || 'default';

                            let filteredTasks = p.tasks ? [...p.tasks] : [];

                            if (currentFilter === 'active') {
                                filteredTasks = filteredTasks.filter(t => !t.completed);
                            } else if (currentFilter === 'completed') {
                                filteredTasks = filteredTasks.filter(t => t.completed);
                            }

                            if (currentSort === 'dueDate') {
                                filteredTasks.sort((a, b) => {
                                    if (!a.dueDate) return 1;
                                    if (!b.dueDate) return -1;
                                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                                });
                            } else if (currentSort === 'alphabetical') {
                                filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
                            } else if (currentSort === 'priority') {
                                const priorityWeight = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                                filteredTasks.sort((a, b) => {
                                    const weightA = priorityWeight[a.priority as keyof typeof priorityWeight] || 2;
                                    const weightB = priorityWeight[b.priority as keyof typeof priorityWeight] || 2;
                                    return weightB - weightA;
                                });
                            } else if (currentSort === 'creationDate') {
                                filteredTasks.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
                            }

                            return (
                                <motion.div 
                                    key={p.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.5 }}
                                    className={`aero-panel p-8 group/card transition-all duration-700 flex flex-col relative overflow-hidden border-4 border-black shadow-[12px_12px_0_0_#000] hover:shadow-[20px_20px_30px_rgba(0,0,0,0.6)] ${theme.bg} ${theme.glow}`}
                                >
                                    <div className="flex justify-between items-start mb-6 z-10 relative">
                                        <div className="flex flex-col gap-2">
                                            <div className={`px-4 py-1 text-[8px] font-black rounded-full border-2 border-black w-fit ${
                                                p.status === 'DONE' ? 'bg-green-600 text-black' : 'bg-blue-600 text-white animate-pulse'
                                            }`}>
                                                STATUS: {p.status}
                                            </div>
                                            <h4 className="font-comic-header text-3xl text-white italic uppercase tracking-tighter leading-none">{p.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Priority:</span>
                                                <select
                                                    value={p.priority || 'MEDIUM'}
                                                    onChange={(e) => onUpdateProject?.(p.id, { priority: e.target.value as any })}
                                                    className="bg-black/40 border border-black rounded px-2 py-0.5 text-[10px] text-white focus:outline-none focus:border-blue-600/50 transition-all uppercase font-mono"
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="CRITICAL">Critical</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Epoch:</span>
                                                <input 
                                                    type="date"
                                                    value={p.epochDate || ''}
                                                    onChange={(e) => onUpdateProject?.(p.id, { epochDate: e.target.value })}
                                                    className="bg-black/40 border border-black rounded px-2 py-0.5 text-[10px] text-blue-400 focus:outline-none focus:border-blue-600/50 transition-all font-mono"
                                                />
                                            </div>
                                        </div>
                                        <motion.button 
                                            whileHover={{ scale: 1.2, color: "#ef4444" }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setProjectToDelete(p.id)} 
                                            className="text-black/40 transition-colors"
                                        >
                                            <XIcon className="w-6 h-6" />
                                        </motion.button>
                                    </div>

                                    <div className="bg-black/60 rounded-2xl p-5 mb-6 border-2 border-white/5 relative group/viz transition-all hover:bg-black/80">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reliability_Index</span>
                                                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Spectral Synchronization</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-2xl font-comic-header italic leading-none ${
                                                    p.tasks?.length && p.tasks.filter(t => t.completed).length === p.tasks.length 
                                                    ? "text-emerald-400 wisdom-glow" 
                                                    : "text-white"
                                                }`}>
                                                    {p.tasks?.length ? Math.round((p.tasks.filter(t => t.completed).length / p.tasks.length) * 100) : 0}%
                                                </span>
                                                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-tighter">Conjunction Success</span>
                                            </div>
                                        </div>
                                        <div className="h-4 bg-black rounded-full overflow-hidden border-2 border-black shadow-inner p-0.5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${p.tasks?.length ? (p.tasks.filter(t => t.completed).length / p.tasks.length) * 100 : 0}%` }}
                                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                                                    p.tasks?.length && p.tasks.filter(t => t.completed).length === p.tasks.length 
                                                    ? "bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                                                    : "bg-gradient-to-r from-blue-700 to-indigo-500"
                                                }`}
                                            />
                                        </div>
                                        {/* Small sparkle effect for 100% */}
                                        {p.tasks?.length && p.tasks.filter(t => t.completed).length === p.tasks.length && (
                                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-20" />
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-4 mb-8">
                                        <div className="flex justify-between items-center border-b border-black/20 pb-1">
                                            <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Sonic Objectives</span>
                                            <div className="flex items-center gap-2">
                                                <select 
                                                    value={currentFilter} 
                                                    onChange={(e) => setTaskFilters(prev => ({...prev, [p.id]: e.target.value as any}))}
                                                    className="bg-black/40 border border-black rounded px-2 py-0.5 text-[8px] text-gray-400 focus:outline-none focus:border-blue-600/50 transition-all uppercase"
                                                >
                                                    <option value="all">All</option>
                                                    <option value="active">Active</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                                <select 
                                                    value={currentSort} 
                                                    onChange={(e) => setTaskSorts(prev => ({...prev, [p.id]: e.target.value as any}))}
                                                    className="bg-black/40 border border-black rounded px-2 py-0.5 text-[8px] text-gray-400 focus:outline-none focus:border-blue-600/50 transition-all uppercase"
                                                >
                                                    <option value="default">Default Sort</option>
                                                    <option value="dueDate">Due Date</option>
                                                    <option value="alphabetical">A-Z</option>
                                                    <option value="priority">Priority</option>
                                                    <option value="creationDate">Creation Date</option>
                                                </select>
                                                <span className="text-[9px] font-mono text-gray-600 ml-2">[{p.tasks?.filter(t => t.completed).length || 0} / {p.tasks?.length || 0} TUNED]</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                            <AnimatePresence initial={false}>
                                                {filteredTasks.map(task => (
                                                    <motion.div 
                                                        key={task.id}
                                                        layout
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        whileHover={{ x: 2 }}
                                                        onClick={() => onToggleTask(p.id, task.id)}
                                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 group/task ${
                                                            task.completed 
                                                            ? 'bg-emerald-900/30 border-emerald-600/40' 
                                                            : 'bg-black/20 border-transparent hover:bg-black/40 text-gray-400'
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-600 border-emerald-500' : 'bg-black border-zinc-800'}`}>
                                                            {task.completed && <CheckCircleIcon className="w-3.5 h-3.5 text-black" />}
                                                        </div>
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <div className="flex items-center justify-between w-full">
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    <span className={`text-xs font-bold uppercase transition-all duration-300 truncate ${task.completed ? 'line-through text-emerald-500/50 italic opacity-60' : 'text-gray-200'}`}>
                                                                        {task.text}
                                                                    </span>
                                                                    {task.priority && (
                                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border flex-shrink-0 ${
                                                                            task.priority === 'CRITICAL' ? 'bg-red-900/50 text-red-400 border-red-500/50' :
                                                                            task.priority === 'HIGH' ? 'bg-orange-900/50 text-orange-400 border-orange-500/50' :
                                                                            task.priority === 'MEDIUM' ? 'bg-blue-900/50 text-blue-400 border-blue-500/50' :
                                                                            'bg-gray-800 text-gray-400 border-gray-600'
                                                                        }`}>
                                                                            {task.priority}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <motion.button 
                                                                    whileHover={{ scale: 1.2, color: "#f87171" }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={(e) => { e.stopPropagation(); onDeleteTask(p.id, task.id); }}
                                                                    className="opacity-0 group-hover/task:opacity-100 text-gray-700 transition-all ml-2"
                                                                    title="Purge Objective"
                                                                >
                                                                    <XIcon className="w-3 h-3" />
                                                                </motion.button>
                                                            </div>
                                                            {task.dueDate && (
                                                                <span className={`text-[8px] font-mono mt-1 ${task.completed ? 'text-gray-600' : 'text-amber-500/70'}`}>
                                                                    DUE: {task.dueDate}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <input 
                                                    value={taskInputs[p.id] || ''}
                                                    onChange={e => setTaskInputs(prev => ({...prev, [p.id]: e.target.value}))}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddTask(p.id)}
                                                    placeholder="Inject frequency objective..."
                                                    className="flex-1 bg-black/40 border-2 border-black rounded-xl px-4 py-2 text-[10px] text-white focus:outline-none focus:border-blue-600 transition-all placeholder:text-gray-800 font-bold uppercase"
                                                />
                                                <motion.button 
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ y: 2 }}
                                                    onClick={() => handleAddTask(p.id)} 
                                                    className="p-2 bg-blue-600 text-black rounded-xl shadow-lg"
                                                >
                                                    <PlusIcon className="w-5 h-5" />
                                                </motion.button>
                                                <motion.button 
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ y: 2 }}
                                                    onClick={() => handleSuggestTasks(p)} 
                                                    disabled={suggestingFor === p.id}
                                                    className={`p-2 rounded-xl shadow-lg transition-all border-2 border-black ${suggestingFor === p.id ? 'bg-zinc-800 text-gray-500' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
                                                    title="Suggest Tasks via AI"
                                                >
                                                    <BrainIcon className={`w-5 h-5 ${suggestingFor === p.id ? 'animate-pulse' : ''}`} />
                                                </motion.button>
                                            </div>
                                            <div className="flex items-center gap-2 px-1">
                                                <span className="text-[8px] font-black text-gray-600 uppercase">Due:</span>
                                                <input 
                                                    type="date"
                                                    value={dateInputs[p.id] || ''}
                                                    onChange={e => setDateInputs(prev => ({...prev, [p.id]: e.target.value}))}
                                                    className="bg-black/20 border border-black/40 rounded px-2 py-0.5 text-[8px] text-gray-400 focus:outline-none focus:border-blue-600/50 transition-all"
                                                />
                                                <span className="text-[8px] font-black text-gray-600 uppercase ml-2">Priority:</span>
                                                <select
                                                    value={priorityInputs[p.id] || 'MEDIUM'}
                                                    onChange={e => setPriorityInputs(prev => ({...prev, [p.id]: e.target.value as any}))}
                                                    className="bg-black/20 border border-black/40 rounded px-2 py-0.5 text-[8px] text-gray-400 focus:outline-none focus:border-blue-600/50 transition-all uppercase"
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="CRITICAL">Critical</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex gap-4">
                                        <motion.button 
                                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)", color: "white" }}
                                            whileTap={{ y: 2 }}
                                            className="flex-1 py-4 bg-black border-4 border-black text-gray-500 font-black uppercase text-[10px] rounded-2xl transition-all shadow-[4px_4px_0_0_#000]"
                                        >
                                            Analyze THD
                                        </motion.button>
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ y: 2 }}
                                            className="flex-1 py-4 bg-blue-600 text-black border-4 border-black font-black uppercase text-[10px] rounded-2xl shadow-[4px_4px_0_0_#000]"
                                        >
                                            Sync Amplitude
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Stride */}
            <div className="p-3 bg-black border-t-8 border-black flex items-center justify-between z-10 mx-[-16px] mb-[-16px] px-10">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Acoustic Grid: ACTIVE</span>
                   </div>
                   <span className="text-[10px] text-gray-700 font-mono italic">THD: 0.02% | SNR: 120dB | Stride: 1.2 PB/s</span>
                </div>
                <div className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.5em]">
                   conduct with flawless wisdom.
                </div>
            </div>

            <Modal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={confirmDelete}
                title="Sever Connection?"
                confirmText="Sever"
                cancelText="Maintain"
                confirmVariant="danger"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-400">
                        Are you sure you want to delete this project? This action cannot be undone and all associated data will be lost.
                    </p>
                    <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                        <p className="text-xs text-red-400 font-mono">
                            WARNING: Project data will be permanently purged from the neural network.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
