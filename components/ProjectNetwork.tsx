
import React, { useState, useEffect } from 'react';
import { MusicIcon, ActivityIcon, ZapIcon, CheckCircleIcon, FireIcon, CodeIcon, TerminalIcon, PlusIcon, BotIcon, ShieldIcon, XIcon, StarIcon, BrainIcon } from './icons';
import { getSophisticatedColor } from '../utils';
import type { NetworkProject } from '../types';
import { suggestBlueprintTasks } from '../services/geminiService';
import { SonicMetric } from './SonicMetric';

interface ProjectNetworkProps {
    projects: NetworkProject[];
    onDeleteProject: (id: string) => void;
    onToggleTask: (projectId: string, taskId: string) => void;
    onAddTask: (projectId: string, text: string) => void;
}

export const ProjectNetwork: React.FC<ProjectNetworkProps> = ({ projects, onDeleteProject, onToggleTask, onAddTask }) => {
    const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
    const [suggestingFor, setSuggestingFor] = useState<string | null>(null);

    const handleAddTask = (projectId: string) => {
        const text = taskInputs[projectId];
        if (!text?.trim()) return;
        onAddTask(projectId, text);
        setTaskInputs(prev => ({...prev, [projectId]: ''}));
    };

    const stats = {
        totalResonators: projects.length,
        avgGain: projects.length ? Math.round(projects.reduce((a, b) => a + b.fightVector, 0) / projects.length) : 0,
        spectralNoise: projects.length ? Math.round(projects.reduce((a, b) => a + b.crazyLevel, 0) / projects.length) : 0,
    };

    return (
        <div className="h-full flex flex-col bg-transparent text-gray-200 font-mono p-4 space-y-4 overflow-hidden relative">
            {/* Header: Acoustic Command */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-black/90 p-4 rounded-3xl border-4 border-black aero-panel shadow-[8px_8px_0_0_#000] relative z-10 gap-6">
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

            <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pr-2 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                    {projects.map(p => {
                        const theme = getSophisticatedColor(p.id + p.title);
                        const resonanceLevel = p.fightVector;
                        
                        return (
                            <div key={p.id} className={`aero-panel p-8 group transition-all duration-700 flex flex-col relative overflow-hidden border-4 border-black shadow-[12px_12px_0_0_#000] hover:shadow-[20px_20px_40px_rgba(0,0,0,0.8)] ${theme.bg} ${theme.glow}`}>
                                <div className="flex justify-between items-start mb-6 z-10 relative">
                                    <div className="flex flex-col gap-2">
                                        <div className={`px-4 py-1 text-[8px] font-black rounded-full border-2 border-black w-fit ${
                                            p.status === 'DONE' ? 'bg-green-600 text-black' : 'bg-blue-600 text-white animate-pulse'
                                        }`}>
                                            STATUS: {p.status}
                                        </div>
                                        <h4 className="font-comic-header text-3xl text-white italic uppercase tracking-tighter leading-none">{p.title}</h4>
                                    </div>
                                    <button onClick={() => onDeleteProject(p.id)} className="text-black/40 hover:text-red-500 transition-colors">
                                        <XIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="bg-black/60 rounded-2xl p-4 mb-6 border-2 border-white/5 relative group/viz">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Spectral Density</span>
                                        <span className="text-xs font-mono text-white">{resonanceLevel} dB</span>
                                    </div>
                                    <div className="h-12 flex items-end gap-1 overflow-hidden">
                                        {[...Array(30)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`flex-1 transition-all duration-500 ${theme.text.replace('text', 'bg')}`}
                                                style={{ 
                                                    height: `${Math.random() * resonanceLevel}%`,
                                                    opacity: 0.3 + (Math.random() * 0.7)
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    <div className="flex justify-between border-b border-black/20 pb-1">
                                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Sonic Objectives</span>
                                        <span className="text-[9px] font-mono text-gray-600">[{p.tasks?.filter(t => t.completed).length || 0} / {p.tasks?.length || 0} TUNED]</span>
                                    </div>
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                        {p.tasks?.map(task => (
                                            <div 
                                                key={task.id}
                                                onClick={() => onToggleTask(p.id, task.id)}
                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                                                    task.completed 
                                                    ? 'bg-emerald-900/30 border-emerald-600/40' 
                                                    : 'bg-black/20 border-transparent hover:bg-black/40 text-gray-400'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-600 border-emerald-500' : 'bg-black border-zinc-800'}`}>
                                                    {task.completed && <CheckCircleIcon className="w-3.5 h-3.5 text-black" />}
                                                </div>
                                                <span className={`text-xs font-bold uppercase transition-all duration-300 ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                                    {task.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <input 
                                            value={taskInputs[p.id] || ''}
                                            onChange={e => setTaskInputs(prev => ({...prev, [p.id]: e.target.value}))}
                                            onKeyDown={e => e.key === 'Enter' && handleAddTask(p.id)}
                                            placeholder="Inject frequency objective..."
                                            className="flex-1 bg-black/40 border-2 border-black rounded-xl px-4 py-2 text-[10px] text-white focus:outline-none focus:border-blue-600 transition-all placeholder:text-gray-800 font-bold uppercase"
                                        />
                                        <button onClick={() => handleAddTask(p.id)} className="p-2 bg-blue-600 text-black rounded-xl shadow-lg active:translate-y-1">
                                            <PlusIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-auto flex gap-4">
                                    <button className="flex-1 py-4 bg-black border-4 border-black text-gray-500 font-black uppercase text-[10px] rounded-2xl hover:text-white transition-all shadow-[4px_4px_0_0_#000]">Analyze THD</button>
                                    <button className="flex-1 py-4 bg-white text-black border-4 border-black font-black uppercase text-[10px] rounded-2xl shadow-[4px_4px_0_0_#000] active:translate-y-1">Sync Amplitude</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Stride */}
            <div className="p-3 bg-slate-900 border-t-8 border-black flex items-center justify-between z-10 mx-[-16px] mb-[-16px] px-10">
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
        </div>
    );
};
