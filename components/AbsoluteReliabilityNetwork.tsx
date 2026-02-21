
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    CodeIcon, TerminalIcon, ZapIcon, FireIcon, ShieldIcon, 
    ActivityIcon, SpinnerIcon, SearchIcon, GaugeIcon, StarIcon,
    PlusIcon, CheckCircleIcon, LogicIcon, BrainIcon
} from './icons';
import { GoogleGenAI, Type } from "@google/genai";
import { callWithRetry, extractJSON } from '../utils';
import { MAESTRO_SYSTEM_PROMPT, generateSoftwareModule } from '../services/geminiService';
import { ImplementationResult } from './ImplementationResult';
import type { ImplementationResponse } from '../types';

interface ProjectShard {
    id: string;
    title: string;
    description: string;
    status: 'IDEATING' | 'FORGING' | 'STABLE';
    fightIndex: number; // Replaced miseryIndex
    knowHow?: string;
    manifest?: ImplementationResponse;
}

export const AbsoluteReliabilityNetwork: React.FC<{ onActionReward?: (shards: number) => void }> = ({ onActionReward }) => {
    const [intent, setIntent] = useState('');
    const [isConducting, setIsConducting] = useState(false);
    const [strideRate, setStrideRate] = useState(1.22);
    const [activeProjects, setActiveProjects] = useState<ProjectShard[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>(["[NET] Conjunction 0x03E2 initialized.", "[OK] Reliable stride established at 1.2 PB/s."]);
    
    const logEndRef = useRef<HTMLDivElement>(null);

    const addLog = (msg: string, color: string = 'text-cyan-500') => {
        setLogs(prev => [`[${new Date().toLocaleTimeString([], {hour12:false})}] <span class="${color}">${msg}</span>`, ...prev].slice(0, 30));
    };

    const handleConductIntent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!intent.trim() || isConducting) return;

        setIsConducting(true);
        addLog(`Ingesting Intent: "${intent}"`, "text-amber-400 font-bold");
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        try {
            // STEP 1: Conceptualize Project
            const conceptualResponse = await callWithRetry(async () => {
                return await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `ACT AS THE MAESTRO. PROJECT INTENT: "${intent}". 
                    1. Assign a name.
                    2. Determine Fight Index (0-100) - how hard it fights to survive.
                    3. Provide a brief architectural description.
                    Return JSON.`,
                    config: {
                        systemInstruction: MAESTRO_SYSTEM_PROMPT,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                fightIndex: { type: Type.NUMBER },
                                description: { type: Type.STRING }
                            },
                            required: ["name", "fightIndex", "description"]
                        }
                    }
                });
            });

            const concept = extractJSON<{name: string, fightIndex: number, description: string}>(conceptualResponse.text || '', {
                name: "Logic Fragment", fightIndex: 42, description: "Unknown Conjunction"
            });

            const newId = `shard_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            const newProject: ProjectShard = {
                id: newId,
                title: concept.name,
                description: concept.description,
                status: 'FORGING',
                fightIndex: concept.fightIndex
            };

            setActiveProjects(prev => [newProject, ...prev]);
            setSelectedProjectId(newId);
            setIntent('');
            addLog(`Shard Manifested: ${concept.name}. Fight Index: ${concept.fightIndex}%`, "text-green-400");

            // STEP 2: Synthesize Core Module
            addLog(`Synthesizing God-Logic for ${concept.name}...`, "text-violet-400");
            const module = await generateSoftwareModule(`Build the absolute reliable version of: ${concept.name}. Description: ${concept.description}`);
            
            if (module) {
                setActiveProjects(prev => prev.map(p => p.id === newId ? { ...p, status: 'STABLE', manifest: module } : p));
                addLog(`Conjunction Stable. 0x03E2_HARMONY attained.`, "text-green-500 font-black");
                onActionReward?.(10);
            }

        } catch (err) {
            addLog("FRACTURE DETECTED: Conjunction bridge collapsed.", "text-red-500");
        } finally {
            setIsConducting(false);
        }
    };

    const selectedProject = useMemo(() => activeProjects.find(p => p.id === selectedProjectId), [activeProjects, selectedProjectId]);

    return (
        <div className="h-full flex flex-col bg-[#020408] text-gray-200 font-mono overflow-hidden selection:bg-amber-500/30">
            {/* Network Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-amber-500/10 border-4 border-amber-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <CodeIcon className="w-10 h-10 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white tracking-tighter italic uppercase leading-none">RELIABILITY_NET</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] bg-red-950/40 text-red-500 px-2 py-0.5 border border-red-900/30 rounded font-black">PROTOCOL: 0x03E2_CONDUCT</span>
                            <span className="text-[10px] text-gray-500">STRIDE: {strideRate.toFixed(2)} PB/S</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Active Conjunctions</p>
                        <p className="text-3xl font-comic-header text-cyan-400">{activeProjects.length}</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] text-gray-500 font-black uppercase mb-1">SYSTEM_HARMONY</span>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-2 h-4 rounded-sm border border-black ${i < 4 ? 'bg-green-500 shadow-[0_0_5px_green]' : 'bg-gray-800'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-6 gap-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(59,130,246,0.03)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left: Project Shard Lattice */}
                <div className="lg:w-80 flex flex-col gap-6 flex-shrink-0 z-20">
                    <div className="aero-panel p-6 bg-slate-900/80 border-amber-600/20 border-4 shadow-[8px_8px_0_0_#000] flex-1 flex flex-col overflow-hidden">
                        <h3 className="font-comic-header text-2xl text-white uppercase italic mb-6 border-b border-white/5 pb-2 flex items-center gap-2">
                            <ActivityIcon className="w-5 h-5 text-amber-500" /> Shard Lattice
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {activeProjects.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center p-4">
                                    <BrainIcon className="w-16 h-16 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting First Conductance</p>
                                </div>
                            ) : (
                                activeProjects.map(project => (
                                    <button
                                        key={project.id}
                                        onClick={() => setSelectedProjectId(project.id)}
                                        className={`w-full p-4 rounded-2xl border-4 transition-all duration-300 text-left relative overflow-hidden group ${
                                            selectedProjectId === project.id 
                                            ? 'bg-black border-cyan-500 shadow-[8px_8px_0_0_#000]' 
                                            : 'bg-black/40 border-black opacity-60 hover:opacity-100 hover:border-zinc-800'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border border-black ${
                                                project.status === 'STABLE' ? 'bg-green-600 text-black' : 'bg-amber-600 text-black animate-pulse'
                                            }`}>
                                                {project.status}
                                            </span>
                                            <span className="text-[7px] font-mono text-gray-700">0x{project.id.split('_')[1]}</span>
                                        </div>
                                        <p className="font-black text-white text-sm uppercase tracking-tight truncate">{project.title}</p>
                                        <div className="mt-3 flex justify-between items-center text-[6px] font-black uppercase text-gray-600">
                                            <span>Fight Index</span>
                                            <span className={project.fightIndex > 70 ? 'text-red-500' : 'text-cyan-400'}>{project.fightIndex}%</span>
                                        </div>
                                        <div className="h-1 bg-gray-950 rounded-full mt-1 overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${project.fightIndex > 70 ? 'bg-red-600' : 'bg-cyan-600'}`} style={{ width: `${project.fightIndex}%` }} />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="aero-panel bg-black/40 border-4 border-black p-5 flex flex-col shadow-[8px_8px_0_0_#000]">
                         <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                            <TerminalIcon className="w-4 h-4" /> Conductor Log
                         </h4>
                         <div className="h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-2 font-mono text-[9px]">
                            {logs.map((log, i) => (
                                <div key={i} className="animate-in slide-in-from-left-2 transition-all">
                                    <span className="text-gray-700 mr-2">[{i}]</span>
                                    <span dangerouslySetInnerHTML={{ __html: log }} />
                                </div>
                            ))}
                            <div ref={logEndRef} />
                         </div>
                    </div>
                </div>

                {/* Center: Command Terminal & Resulting Logic */}
                <div className="flex-1 flex flex-col gap-6 min-w-0 z-20">
                    {/* The Baton (Input) */}
                    <form onSubmit={handleConductIntent} className="aero-panel bg-slate-900 border-8 border-black p-2 flex items-center gap-4 shadow-[15px_15px_60px_rgba(0,0,0,0.8)] focus-within:border-amber-600 transition-all rounded-[3rem] group">
                        <div className="pl-8 text-amber-900 group-focus-within:text-amber-500 transition-colors">
                            <ZapIcon className="w-8 h-8" />
                        </div>
                        <input 
                            value={intent}
                            onChange={e => setIntent(e.target.value)}
                            placeholder="Conduct the next crazy project... (Input Intent)"
                            className="flex-1 bg-transparent border-none text-white font-black text-3xl uppercase focus:ring-0 outline-none placeholder:text-gray-900 py-6"
                            autoFocus
                            disabled={isConducting}
                        />
                        <button 
                            type="submit"
                            disabled={isConducting || !intent.trim()}
                            className="w-20 h-20 bg-amber-600 hover:bg-amber-500 text-black rounded-[2.5rem] transition-all active:scale-95 disabled:opacity-20 shadow-[8px_8px_0_0_#000] active:shadow-none flex items-center justify-center mr-2"
                        >
                            {isConducting ? <SpinnerIcon className="w-10 h-10 animate-spin" /> : <FireIcon className="w-10 h-10" />}
                        </button>
                    </form>

                    <div className="flex-1 aero-panel bg-black border-4 border-black overflow-hidden flex flex-col shadow-[20px_20px_100px_rgba(0,0,0,1)] relative">
                         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                         
                         {selectedProject ? (
                             <div className="flex-1 flex flex-col overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-700">
                                 <div className="p-8 border-b-4 border-black bg-white/5 flex justify-between items-center backdrop-blur-md">
                                     <div>
                                         <h3 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{selectedProject.title}</h3>
                                         <p className="text-xs text-gray-500 mt-2 uppercase font-black tracking-[0.3em]">{selectedProject.description}</p>
                                     </div>
                                     <div className="text-right">
                                         <span className="text-[10px] text-gray-600 font-black uppercase">Shard Integrity</span>
                                         <div className="flex items-center gap-2">
                                            <p className="text-3xl font-comic-header text-green-500">99.8%</p>
                                            <div className="w-3 h-3 rounded-full bg-green-500 animate-ping" />
                                         </div>
                                     </div>
                                 </div>
                                 
                                 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                    {selectedProject.status === 'FORGING' ? (
                                        <div className="h-full flex flex-col items-center justify-center gap-8 py-20">
                                            <div className="relative">
                                                <SpinnerIcon className="w-32 h-32 text-amber-500 animate-spin" />
                                                <ZapIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white animate-pulse" />
                                            </div>
                                            <p className="text-2xl font-comic-header text-white uppercase animate-pulse tracking-widest">Siphoning Architecture...</p>
                                        </div>
                                    ) : selectedProject.manifest ? (
                                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                            <ImplementationResult response={selectedProject.manifest} />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 grayscale text-center">
                                            <ActivityIcon className="w-48 h-48 mb-8" />
                                            <p className="font-comic-header text-7xl uppercase italic tracking-tighter">Empty Buffer</p>
                                        </div>
                                    )}
                                 </div>
                             </div>
                         ) : (
                             <div className="flex-1 flex flex-col items-center justify-center opacity-10 grayscale text-center p-20">
                                <LogicIcon className="w-64 h-64 mb-10" />
                                <p className="font-comic-header text-7xl uppercase italic tracking-widest">The Podium is Open</p>
                                <p className="text-xl font-black uppercase tracking-[0.5em] mt-4">Conduct your intent to manifest reliable series logic.</p>
                             </div>
                         )}
                    </div>
                </div>

                {/* Right: Technical Expertise & Stride Status */}
                <div className="lg:w-96 flex flex-col gap-6 flex-shrink-0 z-20">
                    <div className="aero-panel bg-slate-900 border-4 border-black p-8 shadow-[10px_10px_0_0_#000] relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><FireIcon className="w-24 h-24" /></div>
                         <h3 className="font-comic-header text-3xl text-red-500 uppercase italic mb-6 flex items-center gap-3">
                            <StarIcon className="w-6 h-6 text-red-600 animate-spin-slow" /> Gifted Expertise
                         </h3>
                         <div className="space-y-6">
                            <div className="p-4 bg-black/60 rounded-[2rem] border-2 border-red-600/30">
                                <h4 className="text-[10px] font-black text-red-500 uppercase mb-2">Conductor's Loadout</h4>
                                <div className="space-y-2">
                                    {[
                                        { l: 'Optics', v: 'Reedle-Gucci' },
                                        { l: 'Baton', v: '0x03E2 Harmonic' },
                                        { l: 'Stride', v: 'Air-Max 1.2' }
                                    ].map(item => (
                                        <div key={item.l} className="flex justify-between items-center text-[9px] border-b border-white/5 pb-1">
                                            <span className="text-gray-600 uppercase font-black">{item.l}</span>
                                            <span className="text-white font-bold">{item.v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="p-6 bg-red-950/20 border-2 border-red-600/20 rounded-[2rem] italic text-[11px] text-red-400/60 leading-relaxed font-mono">
                                "The show starts when the logic flows. A reliable coding network doesn't suggest; it conducts absolute truth into the grid."
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest text-center px-4">Thermal Integrity</p>
                                <div className="h-6 bg-black border-4 border-black rounded-2xl overflow-hidden p-1 shadow-inner relative group cursor-pointer">
                                     <div className="h-full bg-gradient-to-r from-red-900 via-red-500 to-amber-500 rounded-lg shadow-[0_0_15px_red] transition-all duration-[3000ms]" style={{ width: '88.4%' }} />
                                     <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">88.4°C [NOMINAL]</span>
                                     </div>
                                </div>
                            </div>
                         </div>
                    </div>

                    <div className="flex-1 aero-panel bg-black/60 border-4 border-black p-6 flex flex-col shadow-[10px_10px_0_0_#000] overflow-hidden">
                        <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-3">
                            Spectral Audit Feed
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                             {[
                                 "» Re-indexing combustion pointers for P0301...",
                                 "» Purging carbon cache from valve registry...",
                                 "» Normalizing spark timing delta...",
                                 "» Syncing via BPI channel 4...",
                                 "» 0x03E2: Handshake established.",
                                 "» Bridging Fall Off Requindor gap...",
                                 "» Eliminating ghost signals on CAN bus...",
                                 "» Kernel IRQ 12 synchronized."
                             ].map((log, i) => (
                                 <div key={i} className="flex gap-3 animate-in slide-in-from-right-2" style={{ animationDelay: `${i*100}ms` }}>
                                     <span className="text-cyan-900 font-bold">0x{i.toString(16).toUpperCase()}</span>
                                     <p className="text-[10px] text-cyan-500/80 italic leading-relaxed">{log}</p>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Stride Bar */}
            <div className="p-3 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Reliability Grid: OPTIMAL</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase hidden sm:block">
                      Stride: 1.22 PB/s | Conductor: Maestro Solo | Mode: Absolute_Authority
                   </div>
                </div>
                <div className="flex items-center gap-4">
                    <ActivityIcon className="w-4 h-4 text-cyan-900" />
                    <span className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.5em] hidden md:block">
                        gifted know-how reliable coding series.
                    </span>
                </div>
            </div>

            <style>{`
                .animate-spin-slow {
                    animation: spin 15s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .wisdom-glow {
                    text-shadow: 0 0 15px currentColor, 0 0 30px rgba(0,0,0,0.5);
                }
            `}</style>
        </div>
    );
};
