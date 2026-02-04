
import React, { useState, useEffect } from 'react';
import { BuildIcon, ActivityIcon, ZapIcon, CheckCircleIcon, FireIcon, CodeIcon, TerminalIcon, PlusIcon, BotIcon, ShieldIcon, BookOpenIcon, XIcon, MusicIcon, StarIcon } from './icons';
import { getSophisticatedColor } from '../utils';
import type { NetworkProject } from '../types';

interface ProjectNetworkProps {
    projects: NetworkProject[];
    onDeleteProject: (id: string) => void;
}

export const ProjectNetwork: React.FC<ProjectNetworkProps> = ({ projects, onDeleteProject }) => {
    const [pulse, setPulse] = useState(0);

    useEffect(() => {
        const int = setInterval(() => setPulse(p => (p + 1) % 100), 1000);
        return () => clearInterval(int);
    }, []);

    const stats = {
        totalProjects: projects.length,
        avgMisery: projects.length ? Math.round(projects.reduce((a, b) => a + b.miseryScore, 0) / projects.length) : 0,
        crazyIndex: projects.length ? Math.round(projects.reduce((a, b) => a + b.crazyLevel, 0) / projects.length) : 0,
    };

    return (
        <div className="h-full flex flex-col bg-transparent text-gray-200 font-mono p-4 sm:p-8 space-y-8 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(251,191,36,0.03)_0%,_transparent_70%)] pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-center bg-black/80 p-6 rounded-3xl border-4 border-black aero-panel shadow-[12px_12px_0_0_#000] relative z-10 gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-amber-600/20 border-4 border-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <CodeIcon className="w-10 h-10 text-amber-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-amber-500 wisdom-glow uppercase tracking-tighter italic leading-none">CODING NETWORK</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] bg-red-950/60 text-red-400 px-3 py-1 border-2 border-black rounded-full uppercase font-black tracking-widest italic flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                                The Weight of Misery: ACTIVE
                            </span>
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Conjunction Stride 1.2 PB/s</span>
                        </div>
                    </div>
                </div>
                <button className="vista-button bg-amber-600 text-black px-10 py-5 rounded-2xl flex items-center gap-4 font-black uppercase text-sm tracking-[0.2em] shadow-[8px_8px_0_0_#000] active:translate-y-2 transition-all group">
                    <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform" /> 
                    <span>INITIATE GIFTED PROJECT</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-10 custom-scrollbar pr-2 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="aero-panel p-8 bg-black/60 border-4 border-black shadow-[8px_8px_0_0_#000] group hover:border-red-900/50 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-[11px] text-red-500 uppercase font-black tracking-[0.3em]">Neural Agony</h3>
                            <FireIcon className="w-6 h-6 text-red-900/40" />
                        </div>
                        <div className="text-6xl font-comic-header text-white group-hover:scale-110 transition-transform origin-left">{stats.avgMisery}%</div>
                        <div className="w-full bg-black/80 h-3 mt-6 rounded-full overflow-hidden border-2 border-black p-0.5">
                            <div className="h-full bg-gradient-to-r from-red-800 to-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] rounded-full" style={{ width: `${stats.avgMisery}%` }} />
                        </div>
                    </div>
                    <div className="aero-panel p-8 bg-black/60 border-4 border-black shadow-[8px_8px_0_0_#000] group hover:border-cyan-900/50 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-[11px] text-cyan-500 uppercase font-black tracking-[0.3em]">Complexity Index</h3>
                            <MusicIcon className="w-6 h-6 text-cyan-900/40" />
                        </div>
                        <div className="text-6xl font-comic-header text-white group-hover:scale-110 transition-transform origin-left">{stats.crazyIndex}/10</div>
                        <div className="flex gap-2 mt-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className={`flex-1 h-4 rounded-sm border-2 border-black transition-all duration-500 ${i < stats.crazyIndex ? 'bg-cyan-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-950'}`} />
                            ))}
                        </div>
                    </div>
                    <div className="aero-panel p-8 bg-black/60 border-4 border-black shadow-[8px_8px_0_0_#000] group hover:border-violet-900/50 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-[11px] text-violet-500 uppercase font-black tracking-[0.3em]">Harmonized Nodes</h3>
                            <StarIcon className="w-6 h-6 text-violet-900/40" />
                        </div>
                        <div className="text-6xl font-comic-header text-white group-hover:scale-110 transition-transform origin-left">{projects.filter(p => p.isWisdomHarmonized).length}</div>
                        <p className="text-[10px] text-gray-500 mt-6 uppercase font-black tracking-widest italic border-l-2 border-violet-900/50 pl-4">Unified by absolute reliable series.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-10">
                    {projects.map(p => {
                        const theme = getSophisticatedColor(p.id + p.title);
                        return (
                            <div key={p.id} className={`aero-panel p-8 group transition-all duration-700 flex flex-col relative overflow-hidden border-8 border-black shadow-[15px_15px_0_0_#000] hover:shadow-[20px_20px_40px_rgba(0,0,0,0.6)] ${theme.bg} ${theme.glow}`}>
                                {p.isWisdomHarmonized && (
                                    <div className={`absolute -right-16 -top-16 w-36 h-36 ${theme.bg.replace('bg-', 'bg-').replace('/20', '/60')} rotate-45 flex items-end justify-center pb-4 border-4 border-black shadow-xl`}>
                                        {/* Removed non-existent 'title' prop */}
                                        <CheckCircleIcon className={`w-10 h-10 ${theme.text} -rotate-45 mb-2`} />
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className={`px-5 py-2 text-[10px] font-black rounded-full border-4 border-black shadow-lg ${
                                        p.status === 'DONE' ? 'bg-green-600 text-black' : p.status === 'BUILDING' ? 'bg-cyan-600 text-white animate-pulse' : 'bg-gray-800 text-gray-400'
                                    }`}>
                                        {p.status}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <ActivityIcon className={`w-6 h-6 ${theme.text} opacity-20 group-hover:opacity-100 transition-opacity duration-700`} />
                                        <button onClick={() => onDeleteProject(p.id)} className="text-gray-900 hover:text-red-700 transition-colors p-1 flex-shrink-0">
                                            <XIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                <h4 className={`font-comic-header text-4xl text-white group-hover:${theme.text} transition-all duration-700 tracking-tighter italic uppercase leading-tight mb-4`}>{p.title}</h4>
                                <p className="text-sm text-gray-400/90 leading-relaxed italic font-mono bg-black/40 p-4 rounded-2xl border-2 border-black mb-8 line-clamp-3">"{p.description}"</p>
                                
                                <div className="mt-auto space-y-8">
                                    <div>
                                        <div className="flex justify-between text-[11px] text-gray-600 mb-2 uppercase font-black tracking-[0.2em]">
                                            <span>System Misery</span>
                                            <span className={theme.text}>{p.miseryScore}%</span>
                                        </div>
                                        <div className="h-4 bg-black rounded-full overflow-hidden border-4 border-black p-0.5 shadow-inner">
                                            <div 
                                                className={`h-full transition-all duration-[2000ms] ${theme.text.replace('text', 'bg')} shadow-[0_0_20px_${theme.shadow}] rounded-full`} 
                                                style={{ width: `${p.miseryScore}%` }} 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between gap-6">
                                        <button className="vista-button bg-black text-gray-500 flex-1 py-4 text-[11px] font-black uppercase rounded-2xl tracking-[0.2em] border-4 border-black hover:text-white transition-all shadow-[4px_4px_0_0_#000] active:translate-y-1">Conduct Shard</button>
                                        <button className={`vista-button flex-1 py-4 text-[11px] font-black uppercase rounded-2xl tracking-[0.2em] border-4 border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${p.isWisdomHarmonized ? `bg-white text-black` : 'bg-gray-800 text-gray-600'}`}>
                                            Sync Wisdom
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Stride */}
            <div className="p-4 bg-slate-900 border-t-8 border-black flex items-center justify-between z-10 mx-[-32px] mb-[-32px] px-12">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Coding Grid: Synchronized</span>
                   </div>
                   <div className="text-[11px] text-gray-600 font-mono italic">
                      PROJECTS_ACTIVE: {projects.length} | NETWORK_STABILITY: 99.4%
                   </div>
                </div>
                <div className="text-[11px] text-gray-700 uppercase font-black italic tracking-[0.5em]">
                   conduct with pleasure and absolute authority.
                </div>
            </div>
        </div>
    );
};
