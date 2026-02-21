
import React, { useState } from 'react';
import { 
    ForgeIcon, HammerIcon, TerminalIcon, ShieldIcon, BrainIcon, CodeIcon, ZapIcon, ActivityIcon, SignalIcon, StarIcon,
    XIcon, ClockIcon, CalendarIcon, PlusIcon, CheckCircleIcon, ScaleIcon, FireIcon, SpinnerIcon
} from './icons';
import { FINTECH_AUTHORITIES } from '../constants';
import type { ProjectBlueprint, BlueprintPriority, BlueprintStatus, ProjectTask } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateBlueprintDetails } from '../services/geminiService';

interface ForgeViewProps {
  blueprints: ProjectBlueprint[];
  onAddBlueprint: (title: string, description: string, specs: string, validation: string, priority: BlueprintPriority, dueDate: string) => void;
  onUpdateBlueprintStatus: (id: string, status: BlueprintStatus) => void;
  onDeleteBlueprint: (id: string) => void;
  onAddTaskToBlueprint?: (blueprintId: string, task: ProjectTask) => void;
  onToggleTask?: (blueprintId: string, taskId: string) => void;
  onDeleteTask?: (blueprintId: string, taskId: string) => void;
}

export const ForgeView: React.FC<ForgeViewProps> = ({ 
    blueprints, onAddBlueprint, onUpdateBlueprintStatus, onDeleteBlueprint, onAddTaskToBlueprint, onToggleTask, onDeleteTask
}) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [specs, setSpecs] = useState('');
    const [validation, setValidation] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<BlueprintPriority>('Medium');
    const [selectedAuth, setSelectedAuth] = useState(FINTECH_AUTHORITIES[0].id);
    const [isSynthesizing, setIsSynthesizing] = useState(false);

    // Task local state
    const [taskInputs, setTaskInputs] = useState<Record<string, { text: string, date: string }>>({});

    const validateBlueprintId = (id: string, action: string): boolean => {
        const exists = blueprints.some(b => b.id === id);
        if (!exists) {
            console.error(`[ForgeView] Failed to ${action}: Invalid or non-existent Blueprint ID '${id}'`);
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(title.length >= 3 && desc.length >= 10) {
            onAddBlueprint(title, desc, specs, validation, priority, dueDate);
            setTitle('');
            setDesc('');
            setSpecs('');
            setValidation('');
            setDueDate('');
            setPriority('Medium');
        }
    };
    
    const handleAutoSynthesize = async () => {
        if (!title.trim() || !desc.trim() || isSynthesizing) return;
        setIsSynthesizing(true);
        try {
            const result = await generateBlueprintDetails(title, desc);
            if (result) {
                setSpecs(result.technicalSpecs);
                setValidation(result.validationStrategy);
            }
        } catch (e) {
            console.error("Auto-synthesis stalled", e);
        } finally {
            setIsSynthesizing(false);
        }
    };

    const handleUpdateStatus = (id: string, status: BlueprintStatus) => {
        if (validateBlueprintId(id, 'update status')) {
            onUpdateBlueprintStatus(id, status);
        }
    };

    const handleDeleteBlueprint = (id: string) => {
        if (validateBlueprintId(id, 'delete blueprint')) {
            onDeleteBlueprint(id);
        }
    };

    const handleAddTask = (bpId: string) => {
        if (!validateBlueprintId(bpId, 'add task')) return;

        const input = taskInputs[bpId];
        if (!input?.text.trim() || !onAddTaskToBlueprint) return;
        
        onAddTaskToBlueprint(bpId, {
            id: uuidv4(),
            text: input.text,
            completed: false,
            dueDate: input.date
        });

        setTaskInputs(prev => ({
            ...prev,
            [bpId]: { text: '', date: '' }
        }));
    };

    const handleToggleTask = (bpId: string, taskId: string) => {
        if (validateBlueprintId(bpId, 'toggle task') && onToggleTask) {
            onToggleTask(bpId, taskId);
        }
    };

    const handleDeleteTask = (bpId: string, taskId: string) => {
        if (validateBlueprintId(bpId, 'delete task') && onDeleteTask) {
            onDeleteTask(bpId, taskId);
        }
    };

    const getPriorityColor = (p: BlueprintPriority) => {
        switch (p) {
            case 'Critical': return 'bg-red-600 text-white animate-pulse shadow-[0_0_10px_red] border-red-500';
            case 'High': return 'bg-orange-500 text-black border-orange-400';
            case 'Medium': return 'bg-amber-500 text-black border-amber-400';
            default: return 'bg-slate-700 text-white border-slate-600';
        }
    };

    const calculateReliability = (tasks: ProjectTask[]) => {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.completed).length;
        return Math.round((completed / tasks.length) * 100);
    };

    return (
        <div className="h-full flex flex-col bg-[#050508] text-gray-200 font-mono overflow-hidden">
             <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-xl z-20">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-amber-500/10 border-4 border-amber-600 rounded-3xl flex items-center justify-center">
                        <HammerIcon className="w-10 h-10 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">The Forge</h2>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1 italic">Manifesting the Reliable Series | 0x03E2</p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Storage Mode</p>
                        <p className="text-xl font-comic-header text-red-500 animate-pulse">VOLATILE_RAM</p>
                    </div>
                    <ForgeIcon className="w-12 h-12 text-gray-800" />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-8 gap-8 relative z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(245,158,11,0.02)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left Column: Input Form */}
                <div className="lg:w-[450px] flex flex-col gap-6 flex-shrink-0">
                    <div className="aero-panel bg-slate-900/80 border-4 border-amber-600/30 p-6 shadow-[10px_10px_0_0_#000] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-2">
                            <ZapIcon className="w-6 h-6 text-amber-500" />
                            <h3 className="font-comic-header text-2xl text-white uppercase italic leading-none">Manifest Blueprint</h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Shard Identity</label>
                                <input 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Project Name..."
                                    className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Auth Node</label>
                                    <select 
                                        value={selectedAuth}
                                        onChange={e => setSelectedAuth(e.target.value)}
                                        className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3 text-[10px] font-bold uppercase text-gray-300 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                                    >
                                        {FINTECH_AUTHORITIES.map(auth => (
                                            <option key={auth.id} value={auth.id}>{auth.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Priority</label>
                                    <select 
                                        value={priority}
                                        onChange={e => setPriority(e.target.value as BlueprintPriority)}
                                        className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3 text-[10px] font-bold uppercase text-gray-300 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Deadline</label>
                                <input 
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3 text-[10px] font-mono text-white focus:outline-none focus:border-amber-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Deep Intent</label>
                                <textarea 
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                    rows={2}
                                    placeholder="Describe the logic shard..."
                                    className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3 text-xs font-medium text-gray-300 resize-none focus:outline-none focus:border-amber-500 transition-all"
                                />
                            </div>

                            {/* Auto-Synthesize Button */}
                            <button 
                                type="button" 
                                onClick={handleAutoSynthesize}
                                disabled={isSynthesizing || !title || !desc}
                                className="w-full py-2 bg-amber-900/30 text-amber-500 border border-amber-600/30 hover:bg-amber-600 hover:text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {isSynthesizing ? <SpinnerIcon className="w-3 h-3 animate-spin" /> : <BrainIcon className="w-3 h-3" />}
                                {isSynthesizing ? "Synthesizing..." : "Auto-Synthesize Specs"}
                            </button>

                            <div>
                                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Gifted Know-How / Specs</label>
                                <textarea 
                                    value={specs}
                                    onChange={e => setSpecs(e.target.value)}
                                    rows={3}
                                    placeholder="Enter technical constraints & wisdom..."
                                    className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Reliability Proof</label>
                                <textarea 
                                    value={validation}
                                    onChange={e => setValidation(e.target.value)}
                                    rows={2}
                                    placeholder="Success criteria..."
                                    className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3 text-xs font-mono text-amber-500 focus:outline-none focus:border-amber-500 transition-all resize-none"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={title.length < 3 || desc.length < 10}
                                className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:bg-zinc-800 text-black font-black py-4 rounded-xl transition-all shadow-[6px_6px_0_0_#000] uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:translate-y-1 active:shadow-none"
                            >
                                <HammerIcon className="w-4 h-4" />
                                COMMIT TO LATTICE
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Project Cards */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-3">
                           <ActivityIcon className="w-5 h-5 text-amber-500" /> Active Lattice Shards
                        </h4>
                        <div className="text-[10px] font-mono text-gray-600">COUNT: {blueprints.length}</div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 xl:grid-cols-2 gap-6 content-start">
                        {blueprints.length === 0 ? (
                            <div className="col-span-full text-center py-32 border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-40">
                                <CodeIcon className="w-20 h-20 mx-auto mb-6 text-gray-700" />
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-600">No Manifests Found</p>
                            </div>
                        ) : blueprints.map(bp => (
                            <div key={bp.id} className="aero-panel bg-black/60 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col gap-4 group hover:border-amber-600/30 transition-all">
                                
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border-2 ${getPriorityColor(bp.priority)}`}>
                                                {bp.priority}
                                            </span>
                                            <span className="text-[8px] font-mono text-gray-500 uppercase border border-zinc-800 px-2 py-0.5 rounded bg-black">{bp.status}</span>
                                        </div>
                                        <h5 className="font-black text-white uppercase text-xl leading-tight mt-1">{bp.title}</h5>
                                        <p className="text-[8px] text-gray-600 font-mono italic uppercase tracking-tighter">SIG: 0x{bp.id.substring(0,6).toUpperCase()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <select 
                                            value={bp.status} 
                                            onChange={(e) => handleUpdateStatus(bp.id, e.target.value as any)}
                                            className="w-6 h-6 opacity-0 absolute cursor-pointer"
                                        />
                                        <button className="text-zinc-600 hover:text-amber-500 transition-colors p-1" title="Update Status">
                                            <ActivityIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteBlueprint(bp.id)} className="text-zinc-600 hover:text-red-500 transition-colors p-1" title="Purge Shard">
                                            <XIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-gray-300 font-medium italic leading-relaxed">
                                        "{bp.description}"
                                    </p>
                                </div>

                                {/* Reliability Index */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[8px] font-black uppercase text-gray-500 tracking-widest">
                                        <span>Reliability Index</span>
                                        <span className={calculateReliability(bp.tasks) === 100 ? 'text-green-500' : 'text-amber-500'}>{calculateReliability(bp.tasks)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-zinc-800">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${calculateReliability(bp.tasks) === 100 ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-amber-600'}`} 
                                            style={{ width: `${calculateReliability(bp.tasks)}%` }} 
                                        />
                                    </div>
                                </div>

                                {(bp.technicalSpecs || bp.validationStrategy) && (
                                    <div className="flex flex-col gap-2">
                                        {bp.technicalSpecs && (
                                            <div className="bg-black p-3 rounded-xl border border-zinc-800 relative overflow-hidden group/code">
                                                <div className="flex items-center gap-2 mb-1 text-[8px] font-black text-cyan-600 uppercase tracking-widest">
                                                    <BrainIcon className="w-3 h-3" /> Gifted Know-How
                                                </div>
                                                <pre className="text-[9px] font-mono text-cyan-500/80 whitespace-pre-wrap leading-relaxed max-h-20 overflow-y-auto custom-scrollbar">
                                                    {bp.technicalSpecs}
                                                </pre>
                                            </div>
                                        )}
                                        {bp.validationStrategy && (
                                            <div className="bg-amber-950/10 p-3 rounded-xl border border-amber-900/30">
                                                 <div className="flex items-center gap-2 mb-1 text-[8px] font-black text-amber-600 uppercase tracking-widest">
                                                    <ScaleIcon className="w-3 h-3" /> Reliability Proof
                                                </div>
                                                <p className="text-[9px] text-amber-500/80 italic leading-snug">{bp.validationStrategy}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tasks / Objectives */}
                                <div className="border-t border-white/5 pt-4 mt-2">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <CheckCircleIcon className="w-3 h-3" /> Reliable Objectives
                                    </p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                        {bp.tasks.map(task => (
                                            <div key={task.id} className="flex items-center justify-between group/task p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => handleToggleTask(bp.id, task.id)}
                                                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-600 border-green-600' : 'bg-black border-zinc-700'}`}
                                                    >
                                                        {task.completed && <CheckCircleIcon className="w-3 h-3 text-black" />}
                                                    </button>
                                                    <span className={`text-[10px] font-bold uppercase tracking-tight ${task.completed ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                                                        {task.text}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {task.dueDate && (
                                                        <span className="text-[8px] font-mono text-amber-600 bg-black border border-amber-900/30 px-1.5 rounded">{task.dueDate}</span>
                                                    )}
                                                    {onDeleteTask && (
                                                        <button 
                                                            onClick={() => handleDeleteTask(bp.id, task.id)}
                                                            className="opacity-0 group-hover/task:opacity-100 text-zinc-600 hover:text-red-500 transition-opacity p-0.5"
                                                        >
                                                            <XIcon className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Task Add Input */}
                                    <div className="flex gap-2 mt-3">
                                        <input 
                                            value={taskInputs[bp.id]?.text || ''}
                                            onChange={e => setTaskInputs(prev => ({ ...prev, [bp.id]: { ...prev[bp.id], text: e.target.value } }))}
                                            placeholder="Add reliability objective..."
                                            className="flex-1 bg-black border-2 border-zinc-800 rounded-lg p-2 text-[10px] font-bold text-white focus:border-amber-600 outline-none transition-all placeholder:text-gray-700"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask(bp.id)}
                                        />
                                        <input 
                                            type="date"
                                            value={taskInputs[bp.id]?.date || ''}
                                            onChange={e => setTaskInputs(prev => ({ ...prev, [bp.id]: { ...prev[bp.id], date: e.target.value } }))}
                                            className="w-20 bg-black border-2 border-zinc-800 rounded-lg p-1 text-[8px] font-mono outline-none text-gray-400"
                                        />
                                        <button 
                                            onClick={() => handleAddTask(bp.id)}
                                            className="p-2 bg-amber-600 text-black rounded-lg hover:bg-amber-500 transition-colors shadow-lg active:scale-95"
                                        >
                                            <PlusIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
