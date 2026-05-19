
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SpinnerIcon, TerminalIcon, ActivityIcon, ZapIcon, ShieldIcon, LogicIcon, BroadcastIcon, ClockIcon, XIcon } from './icons';
import type { BroadcastMessage } from '../types';

interface ProjectNode {
    id: string;
    label: string;
    fightVector: number; // REPLACED misery
    status: 'STABLE' | 'DRIFTING' | 'LOCKED';
    type: 'Kernel' | 'Interface' | 'Neural';
}

const HEX_CHARS = "0123456789ABCDEF";

const SIGNAL_LOGS = [
    "[INFO] Establishing secure link 0x03E2...",
    "[OK] Protocol V22.11.02 handshaking...",
    "[HEURISTIC] Ingesting logic from Node_Alpha...",
    "[SUCCESS] Adrenaline saturation reaching 94%.",
    "[WARN] Semantic drift detected in Fleet-Comms.",
    "[MAESTRO] Conductors synchronized. Fight code engaged."
];

export const CommunicationsView: React.FC<{ 
    injectedCommand: string | null; 
    onCommandInjected: () => void; 
    onNewBroadcast: (message: BroadcastMessage) => void;
    broadcasts: BroadcastMessage[];
    onCancelBroadcast?: (id: string) => void;
}> = ({ injectedCommand, onCommandInjected, onNewBroadcast, broadcasts, onCancelBroadcast }) => {
    const [status, setStatus] = useState<'IDLE' | 'ANALYZING' | 'CONNECTED'>('CONNECTED');
    const [packetStream, setPacketStream] = useState<string[]>([]);
    const [activeNodes, setActiveNodes] = useState<ProjectNode[]>([
        { id: '1', label: 'AetherOS-Core', fightVector: 98, status: 'STABLE', type: 'Kernel' },
        { id: '2', label: 'Synapse-UX', fightVector: 74, status: 'DRIFTING', type: 'Interface' },
        { id: '3', label: 'Heuristic-Link', fightVector: 42, status: 'DRIFTING', type: 'Neural' }
    ]);
    const [drift, setDrift] = useState(0.02);
    const [adrenalinePeak, setAdrenalinePeak] = useState(88); // REPLACED miseryPeak
    const [fleetInput, setFleetInput] = useState('');
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [scheduledTime, setScheduledTime] = useState<string>('');
    const [showScheduler, setShowScheduler] = useState(false);

    const logEndRef = useRef<HTMLDivElement>(null);

    // Filter broadcasts to only show active ones (no scheduledFor or scheduledFor <= now)
    const activeBroadcasts = useMemo(() => {
        const now = new Date();
        return broadcasts.filter(b => !b.scheduledFor || new Date(b.scheduledFor) <= now);
    }, [broadcasts]);

    const scheduledBroadcasts = useMemo(() => {
        const now = new Date();
        return broadcasts.filter(b => b.scheduledFor && new Date(b.scheduledFor) > now);
    }, [broadcasts]);

    // Generate pseudo-hex stream for aesthetics
    useEffect(() => {
        const interval = setInterval(() => {
            setPacketStream(prev => {
                const hex = Array.from({length: 8}, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join('');
                const addr = "0x" + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
                return [...prev.slice(-25), `${addr}: ${hex} [${(Math.random() * 100).toFixed(0)}%]`];
            });
            setDrift(prev => +(prev + (Math.random() - 0.5) * 0.005).toFixed(3));
            setAdrenalinePeak(prev => Math.min(100, Math.max(70, prev + (Math.random() - 0.5) * 2)));
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const handleTransmission = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fleetInput.trim() || isTransmitting) return;

        setIsTransmitting(true);
        // Simulate packet encoding
        setTimeout(() => {
            const isScheduled = showScheduler && scheduledTime;
            const newBroadcast: BroadcastMessage = {
                id: uuidv4(),
                source: 'MAESTRO-CMD',
                text: fleetInput,
                timestamp: new Date(),
                color: 'text-cyan-400',
                scheduledFor: isScheduled ? new Date(scheduledTime) : undefined
            };
            
            onNewBroadcast(newBroadcast);
            setFleetInput('');
            setIsTransmitting(false);
            setScheduledTime('');
            setShowScheduler(false);
            setPacketStream(prev => [...prev, `[TX] PAYLOAD_${isScheduled ? 'QUEUED' : 'DELIVERED'}: 0x03E2_FIGHT_SYNC`]);
        }, 1200);
    };

    return (
        <div className="h-full flex flex-col bg-[#02050f] text-gray-200 font-mono overflow-hidden">
            {/* Header: Link Signature */}
            <div className="p-4 border-b-4 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-20">
                <div>
                    <h2 className="font-comic-header text-4xl text-cyan-400 uppercase italic tracking-tighter">Neural Comm-Link</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] bg-cyan-900/50 text-cyan-300 px-2 py-0.5 border border-cyan-500/30 rounded uppercase font-black tracking-[0.2em]">0x03E2 SECURE</span>
                        <span className="text-[10px] text-gray-500">PROTOCOL: V22.11.02</span>
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase">Logic Flux</p>
                        <p className="text-xl font-comic-header text-violet-400">{drift} ms</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase">Network Fury</p>
                        <p className="text-xl font-comic-header text-red-400">{adrenalinePeak.toFixed(0)}%</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-6 gap-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.03)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left: Signal Analyzer & Node Map */}
                <div className="w-80 flex flex-col gap-6">
                    <div className="aero-panel p-5 border-cyan-500/20 bg-black/40">
                        <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ActivityIcon className="w-4 h-4" /> Logic Spectrum
                        </h3>
                        <div className="flex items-end gap-1 h-20 px-2 border-b border-white/5">
                            {[...Array(12)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="flex-1 bg-red-500/40 rounded-t-sm transition-all duration-300"
                                    style={{ height: `${Math.random() * 100}%`, opacity: 0.3 + (Math.random() * 0.7) }}
                                />
                            ))}
                        </div>
                        <p className="text-[9px] text-gray-600 mt-2 text-center uppercase font-black">2.4GHz Heuristic Band</p>
                    </div>

                    <div className="flex-1 aero-panel p-5 border-violet-500/20 bg-black/40 overflow-hidden flex flex-col">
                        <h3 className="text-xs font-black text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldIcon className="w-4 h-4" /> Neural Project Nodes
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {activeNodes.map(node => (
                                <div key={node.id} className="p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-violet-500/40 transition-all">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">{node.type}</span>
                                        <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'STABLE' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
                                    </div>
                                    <p className="font-bold text-white text-sm mb-2">{node.label}</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[8px] uppercase font-black text-gray-600">
                                            <span>Fight Vector</span>
                                            <span>{node.fightVector}%</span>
                                        </div>
                                        <div className="h-1 bg-black rounded-full overflow-hidden">
                                            <div className="h-full bg-red-600" style={{ width: `${node.fightVector}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Packet Debugger & Comms */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex-1 aero-panel p-6 border-cyan-500/10 bg-black/60 flex flex-col overflow-hidden relative">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                             <div className="flex items-center gap-3">
                                <TerminalIcon className="w-5 h-5 text-cyan-500" />
                                <h3 className="font-comic-header text-2xl text-white uppercase italic">Heuristic Packet Inspector</h3>
                             </div>
                             <span className="text-[9px] text-green-500 font-black animate-pulse uppercase">LIVE_DECODE: ON</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1 custom-scrollbar">
                            {packetStream.map((packet, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <span className="text-gray-700 opacity-50">[{i.toString().padStart(3, '0')}]</span>
                                    <span className={`${packet.includes('[TX]') ? 'text-cyan-400 font-bold' : 'text-gray-400'} group-hover:text-white transition-colors`}>{packet}</span>
                                </div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {showScheduler && (
                            <div className="p-4 bg-black/80 border-2 border-cyan-900 rounded-xl flex items-center gap-6 animate-in slide-in-from-bottom-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ClockIcon className="w-3 h-3 text-cyan-500" />
                                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Chronos Target Coordinate</span>
                                    </div>
                                    <input 
                                        type="datetime-local" 
                                        value={scheduledTime}
                                        onChange={e => setScheduledTime(e.target.value)}
                                        className="bg-black border border-cyan-900/50 rounded-lg p-3 text-[11px] text-cyan-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all font-mono"
                                    />
                                </div>
                                <div className="text-[10px] text-gray-500 max-w-[200px]">
                                    Packet will remain in stasis until target temporal coordinate is reached.
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleTransmission} className="p-4 aero-panel border-cyan-500/20 bg-slate-900 flex items-center gap-4">
                            <button 
                                type="button"
                                onClick={() => setShowScheduler(!showScheduler)}
                                className={`p-3 rounded-xl border-2 transition-all ${showScheduler ? 'bg-cyan-600 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-black text-cyan-600 border-black hover:border-cyan-900'}`}
                                title="Set Temporal Target"
                            >
                                <ClockIcon className="w-5 h-5" />
                            </button>
                            <div className="flex-1 bg-black/40 rounded-xl border-2 border-black flex items-center px-4 py-3 group focus-within:border-cyan-500/50 transition-all">
                                <span className="text-cyan-600 font-black mr-3">»</span>
                                <input 
                                    type="text"
                                    value={fleetInput}
                                    onChange={e => setFleetInput(e.target.value)}
                                    placeholder={showScheduler ? "Conduct a scheduled neural command..." : "Conduct a neural command..."}
                                    className="bg-transparent border-none focus:ring-0 w-full text-cyan-400 placeholder:text-gray-800 text-sm font-bold"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isTransmitting || !fleetInput.trim() || (showScheduler && !scheduledTime)}
                                className="vista-button px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-xl flex items-center gap-3"
                            >
                                {isTransmitting ? <SpinnerIcon className="w-5 h-5" /> : (showScheduler ? <TerminalIcon className="w-5 h-5 animate-pulse" /> : <ZapIcon className="w-5 h-5" />)}
                                <span>{showScheduler ? 'SCHEDULE' : 'BROADCAST'}</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Global Broadcast Feed */}
                <div className="w-80 aero-panel border-amber-500/20 bg-black/40 p-5 flex flex-col overflow-hidden">
                    <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BroadcastIcon className="w-4 h-4" /> Global Broadcast Feed
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                        {scheduledBroadcasts.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <h4 className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.2em]">In Stasis ({scheduledBroadcasts.length})</h4>
                                    <button 
                                        onClick={() => {
                                            if (window.confirm("Purge all stasis signals?")) {
                                                scheduledBroadcasts.forEach(b => onCancelBroadcast?.(b.id));
                                            }
                                        }}
                                        className="text-[8px] font-black text-red-900 hover:text-red-500 uppercase transition-colors"
                                    >
                                        Purge All
                                    </button>
                                </div>
                                {scheduledBroadcasts.map(msg => (
                                    <div key={msg.id} className="p-4 bg-cyan-950/20 border border-cyan-500/10 rounded-2xl group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-1.5">
                                                <ClockIcon className="w-2 h-2 text-cyan-500" />
                                                <span className="text-[8px] font-black text-cyan-500 uppercase">T-MINUS: {Math.max(0, Math.floor((new Date(msg.scheduledFor!).getTime() - Date.now()) / 1000))}s</span>
                                            </div>
                                            <button 
                                                onClick={() => onCancelBroadcast?.(msg.id)}
                                                className="p-1 hover:bg-red-500/20 rounded-full text-zinc-700 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                title="Cancel Signal"
                                            >
                                                <XIcon className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 italic leading-relaxed">
                                            "{msg.text}"
                                        </p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[7px] text-zinc-600 font-mono italic">{new Date(msg.scheduledFor!).toLocaleString()}</span>
                                            <div className="flex gap-0.5">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className="w-1 h-1 bg-cyan-500/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="h-px bg-white/5 my-4" />
                            </div>
                        )}

                        <div className="space-y-4">
                            {activeBroadcasts.length === 0 ? (
                                <div className="py-20 text-center opacity-20">
                                    <p className="text-[10px] font-black uppercase">No Active Signals</p>
                                </div>
                            ) : activeBroadcasts.map(msg => (
                                <div key={msg.id} className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl animate-in slide-in-from-right-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[8px] font-black text-amber-500 uppercase">{msg.source}</span>
                                        <span className="text-[8px] font-mono text-zinc-600">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className={`text-xs font-bold leading-relaxed ${msg.color || 'text-white'}`}>
                                        {msg.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                            <span className="text-[9px] text-green-400 font-black uppercase tracking-widest">Network Synchronized</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
