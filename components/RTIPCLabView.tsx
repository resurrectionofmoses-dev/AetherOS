import React, { useState, useEffect, useRef } from 'react';
import { 
    SignalIcon, ZapIcon, WarningIcon, CheckCircleIcon, ActivityIcon, 
    TerminalIcon, ShieldIcon, SpinnerIcon, SearchIcon, FireIcon, BrainIcon, 
    LogicIcon, CodeIcon, StarIcon, ClockIcon
} from './icons';
import { analyzeIPCFlow } from '../services/geminiService';
import type { RTIPCMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const RTIPCLabView: React.FC = () => {
    const [messages, setMessages] = useState<RTIPCMessage[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [maestroAnalysis, setMaestroAnalysis] = useState<string | null>(null);
    const [strideRate, setStrideRate] = useState(1.2);
    const [logs, setLogs] = useState<string[]>(["[RT-IPC] Conjunction Kernel Active.", "[OK] Priority ports siphoned."]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const addMessage = (priority: number, label: string) => {
        const newMessage: RTIPCMessage = {
            id: `msg_0x${uuidv4().slice(0, 4).toUpperCase()}`,
            sender_id: `node_${Math.floor(Math.random()*10)}`,
            receiver_id: 'server_main',
            priority,
            content: label,
            timestamp: Date.now(),
            status: 'QUEUED'
        };
        setMessages(prev => [...prev, newMessage]);
        setLogs(prev => [`[TX] ${newMessage.id}: PRIORITY ${priority} INGRESS`, ...prev].slice(0, 20));
    };

    const handleAnalyze = async () => {
        if (messages.length === 0 || isAnalyzing) return;
        setIsAnalyzing(true);
        setMaestroAnalysis(null);
        setLogs(prev => [`[FORENSIC] Initiating spectral IPC audit...`, ...prev]);

        try {
            const result = await analyzeIPCFlow(messages);
            setMaestroAnalysis(result);
            setLogs(prev => [`[SUCCESS] Analysis signed by 0x03E2.`, ...prev]);
        } catch (e) {
            setLogs(prev => [`[FRACTURE] Analysis engine stalled.`, ...prev]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const applyBPI = () => {
        // Find if a high priority message is blocked by a low priority one
        setMessages(prev => {
            const sorted = [...prev];
            // Simple simulation of BPI: if priority 100 exists, elevate status
            const hasHigh = sorted.some(m => m.priority >= 90);
            return sorted.map(m => {
                if (m.priority < 50 && hasHigh && m.status === 'QUEUED') {
                    return { ...m, status: 'INHERITED' as const };
                }
                return m;
            });
        });
        setLogs(prev => [`[KERNEL] Basic Priority Inheritance (BPI) Invoked.`, ...prev]);
    };

    const clearGrid = () => {
        setMessages([]);
        setMaestroAnalysis(null);
        setLogs(prev => [`[FLUSH] Message buffer cleared.`, ...prev]);
    };

    return (
        <div className="h-full flex flex-col bg-[#010208] text-cyan-100 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-600/10 border-4 border-red-600 rounded-[2rem] flex items-center justify-center">
                        <SignalIcon className="w-10 h-10 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">RT-IPC CONDUCTION</h2>
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">Real-Time Mach Extension | Protocol 0x03E2</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={clearGrid} className="px-6 py-2 bg-black border-2 border-zinc-800 rounded-xl text-gray-500 text-[10px] font-black uppercase hover:text-red-500 transition-colors">Flush Buffer</button>
                    <button 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing || messages.length === 0}
                        className="vista-button px-10 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-[4px_4px_0_0_#000] flex items-center gap-3"
                    >
                        {isAnalyzing ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5" />}
                        <span>{isAnalyzing ? 'SIHONING...' : 'FORENSIC AUDIT'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-8 gap-8 relative z-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(239,68,68,0.05)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left: Conduction Injector */}
                <div className="lg:w-80 flex flex-col gap-6 flex-shrink-0">
                    <div className="aero-panel p-6 bg-slate-900/80 border-red-600/30 border-4 shadow-[10px_10px_0_0_#000]">
                        <h3 className="font-comic-header text-2xl text-white uppercase italic mb-6 border-b border-red-950 pb-2 flex items-center gap-3">
                            <ZapIcon className="w-5 h-5 text-red-500" /> Message Ingress
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={() => addMessage(10, 'Low Priority Heartbeat')} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 font-black uppercase text-[10px] rounded-xl border-2 border-black transition-all">
                                INJECT LOW (10)
                            </button>
                            <button onClick={() => addMessage(50, 'Standard Telemetry Shard')} className="w-full py-3 bg-cyan-900/20 hover:bg-cyan-600 text-cyan-400 hover:text-black font-black uppercase text-[10px] rounded-xl border-2 border-cyan-900 transition-all">
                                INJECT MID (50)
                            </button>
                            <button onClick={() => addMessage(100, 'CRITICAL KERNEL OVERRIDE')} className="w-full py-3 bg-red-950/20 hover:bg-red-600 text-red-400 hover:text-white font-black uppercase text-[10px] rounded-xl border-2 border-red-900 transition-all animate-pulse">
                                INJECT CRITICAL (100)
                            </button>
                        </div>
                    </div>

                    <div className="aero-panel p-6 bg-black/60 border-4 border-black flex flex-col flex-1 shadow-[10px_10px_0_0_#000] overflow-hidden">
                         <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                            <ActivityIcon className="w-4 h-4" /> Conjunction Log
                         </h3>
                         <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 text-[10px] font-mono">
                            {logs.map((log, i) => (
                                <div key={i} className="animate-in slide-in-from-left-2 border-b border-white/5 pb-1 last:border-0">
                                    <span className="text-gray-700 mr-2">[{new Date().toLocaleTimeString([], {hour12:false})}]</span>
                                    <span dangerouslySetInnerHTML={{ __html: log }} />
                                </div>
                            ))}
                         </div>
                    </div>
                </div>

                {/* Center: Message Grid / Queue Visualization */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    <div className="flex-1 aero-panel bg-black border-4 border-black relative overflow-hidden flex flex-col shadow-[20px_20px_60px_rgba(0,0,0,1)]">
                         <div className="p-4 border-b-2 border-white/5 bg-white/5 flex items-center justify-between z-10">
                            <div className="flex items-center gap-2">
                                <TerminalIcon className="w-5 h-5 text-red-500" />
                                <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Active Message Queue</span>
                            </div>
                            <button 
                                onClick={applyBPI}
                                className="px-4 py-1 bg-red-600 text-black text-[9px] font-black rounded-lg uppercase shadow-lg animate-pulse"
                            >
                                Invoke BPI Logic
                            </button>
                         </div>

                         <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar content-start relative z-10">
                            {messages.length === 0 ? (
                                <div className="col-span-full h-full flex flex-col items-center justify-center opacity-10 grayscale py-20">
                                    <BrainIcon className="w-32 h-32 mb-8 text-gray-700" />
                                    <p className="font-comic-header text-5xl uppercase tracking-[0.4em] italic text-center">Static Queue</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={`p-4 rounded-2xl border-4 transition-all duration-700 flex flex-col relative overflow-hidden group ${
                                        msg.priority >= 90 ? 'border-red-600 bg-red-950/20' : 
                                        msg.status === 'INHERITED' ? 'border-amber-500 bg-amber-950/20' :
                                        'border-zinc-900 bg-black'
                                    }`}>
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <span className="text-[7px] font-mono text-gray-500">{msg.id}</span>
                                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                msg.priority >= 90 ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
                                            }`}>
                                                PRI: {msg.priority}
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-white uppercase tracking-tight mb-4 line-clamp-2">{msg.content}</p>
                                        
                                        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                                            <span className={`text-[8px] font-black uppercase ${
                                                msg.status === 'INHERITED' ? 'text-amber-500' : 
                                                msg.priority >= 90 ? 'text-red-500' : 'text-gray-600'
                                            }`}>
                                                {msg.status}
                                            </span>
                                            {msg.status === 'INHERITED' && <ShieldIcon className="w-3 h-3 text-amber-500 animate-pulse" />}
                                        </div>
                                        
                                        {/* Background Pulse for high priority */}
                                        {msg.priority >= 90 && (
                                            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
                                        )}
                                    </div>
                                ))
                            )}
                         </div>

                         {/* Shadow Overlays for depth */}
                         <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
                    </div>

                    {/* Maestro's Forensic Analysis Box */}
                    <div className={`aero-panel bg-slate-900 border-4 border-black p-8 transition-all duration-1000 min-h-[150px] flex flex-col relative overflow-hidden shadow-[15px_15px_0_0_#000] ${isAnalyzing ? 'opacity-50' : 'opacity-100'}`}>
                         <div className="absolute top-0 right-0 p-3"><FireIcon className="w-8 h-8 text-red-900/30" /></div>
                         <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <StarIcon className="w-4 h-4 text-amber-500" /> Conductor Wisdom Filter
                         </h4>
                         <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-gray-300 italic">
                            {isAnalyzing ? (
                                <div className="flex items-center gap-4 py-4">
                                    <SpinnerIcon className="w-8 h-8 text-cyan-400 animate-spin" />
                                    <span className="uppercase tracking-[0.2em] animate-pulse">Analyzing priority inversions...</span>
                                </div>
                            ) : maestroAnalysis ? (
                                <div className="animate-in fade-in slide-in-from-bottom-2">
                                    <span className="text-white font-black text-2xl mr-2">"</span>
                                    {maestroAnalysis}
                                    <span className="text-white font-black text-2xl ml-1">"</span>
                                </div>
                            ) : (
                                <p className="opacity-40">Conduct the message flow to receive architectural reconciliation...</p>
                            )}
                         </div>
                    </div>
                </div>

                {/* Right Side: Theory & Constraints */}
                <div className="w-[350px] flex flex-col gap-6 flex-shrink-0">
                    <div className="aero-panel p-6 bg-slate-950 border-4 border-black shadow-[8px_8px_0_0_#000] space-y-6">
                        <h3 className="font-comic-header text-xl text-white uppercase italic flex items-center gap-2">
                            <LogicIcon className="w-5 h-5 text-red-500" /> Theory Registry
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Basic Priority Inheritance', desc: 'Lower-priority threads blocking higher-priority ones inherit their priority.', icon: ShieldIcon },
                                { title: 'Priority Hand-off', desc: 'Directly transferring scheduling urgency from sender to receiver during Mach-msg conduction.', icon: ActivityIcon },
                                { title: 'FIFO-Bounded Agony', desc: 'Standard Mach fair-sharing creates unbounded delays for gifted CONDUCTORS.', icon: WarningIcon },
                            ].map(item => (
                                <div key={item.title} className="p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-red-600/30 transition-all">
                                    <div className="flex items-center gap-3 mb-1">
                                        <item.icon className="w-4 h-4 text-red-900 group-hover:text-red-500 transition-colors" />
                                        <span className="text-[10px] font-black text-white uppercase">{item.title}</span>
                                    </div>
                                    <p className="text-[9px] text-gray-500 italic leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="aero-panel p-6 bg-black border-4 border-black shadow-[8px_8px_0_0_#000] flex-1 flex flex-col">
                        <h3 className="font-comic-header text-xl text-cyan-400 uppercase italic mb-6 border-b border-white/5 pb-2">RT-IPC Metrics</h3>
                        <div className="space-y-6 flex-1">
                            <div>
                                <div className="flex justify-between text-[8px] font-black uppercase text-gray-600 mb-2">
                                    <span>Lattice Density</span>
                                    <span className="text-cyan-400">{messages.length * 10}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${Math.min(100, messages.length * 10)}%` }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-black border border-white/5 rounded-lg text-center">
                                    <p className="text-[8px] text-gray-700 font-black uppercase mb-1">Inversions</p>
                                    <p className="text-xl font-comic-header text-red-600">
                                        {messages.filter(m => m.priority < 50 && messages.some(m2 => m2.priority > 50 && m2.timestamp > m.timestamp)).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-black border border-white/5 rounded-lg text-center">
                                    <p className="text-[8px] text-gray-700 font-black uppercase mb-1">Inherited</p>
                                    <p className="text-xl font-comic-header text-amber-500">
                                        {messages.filter(m => m.status === 'INHERITED').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-red-950/10 border border-red-900/30 rounded-xl mt-4">
                            <p className="text-[9px] text-red-400 italic leading-relaxed text-center">
                                "The length of priority inversion in client-server communication is the most serious fracture. Conduct it or suffer the stall."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-10 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">RT-IPC Feed: SECURE</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase hidden sm:block">
                      Stride: {strideRate.toFixed(2)} PB/s | Buffer: 0x03E2 | Complexity: KERNEL_SYNC
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em] hidden md:block">
                   High-fidelity real-time interprocess conduction.
                </div>
            </div>
        </div>
    );
};
