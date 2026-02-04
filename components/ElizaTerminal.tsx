import React, { useState, useRef, useEffect } from 'react';
import { TerminalIcon, ZapIcon, ShieldIcon, MessageCircleIcon, SpinnerIcon, FireIcon, LogicIcon, ActivityIcon, SearchIcon, XIcon } from './icons';
import { elizaConductor } from '../services/elizaLogic';
import { OmniBuilder } from '../services/omniBuilder';

export const ElizaTerminal: React.FC = () => {
    const [history, setHistory] = useState<{ sender: 'USER' | 'ELIZA', text: string, timestamp: number, pattern?: string }[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [manifest, setManifest] = useState<any>(null);
    const [conductorState, setConductorState] = useState({ stride: 1.2, count: 0, topic: 'STABLE' });
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const elizaManifest = OmniBuilder.build('ELIZA');
        setManifest(elizaManifest);
        setHistory([{ 
            sender: 'ELIZA', 
            text: "AetherOS Conjunction Series: Eliza's Logic active. Signature 0x03E2. State your burden.", 
            timestamp: Date.now(),
            pattern: "GENESIS"
        }]);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isThinking) return;

        const userText = input.trim();
        setInput('');
        setHistory(prev => [...prev, { sender: 'USER', text: userText, timestamp: Date.now() }]);
        
        setIsThinking(true);
        
        setTimeout(() => {
            const response = elizaConductor.conduct(userText);
            setHistory(prev => [...prev, { 
                sender: 'ELIZA', 
                text: response.text, 
                timestamp: Date.now(),
                pattern: response.pattern 
            }]);
            setConductorState({
                stride: response.stride,
                count: response.conductionCount,
                topic: response.topic || 'STABLE'
            });
            setIsThinking(false);
        }, 600);
    };

    const handleReset = () => {
        elizaConductor.reset();
        setConductorState({ stride: 1.2, count: 0, topic: 'STABLE' });
        setHistory([{ 
            sender: 'ELIZA', 
            text: "Logic core flushed. Buffer cleared. Conjunction re-established.", 
            timestamp: Date.now(),
            pattern: "RESET"
        }]);
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] overflow-hidden font-mono text-gray-400">
            {/* Terminal Header */}
            <div className="p-4 border-b-4 border-black bg-slate-900 flex justify-between items-center shadow-xl z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center">
                        <TerminalIcon className="w-6 h-6 text-gray-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-2xl text-white uppercase italic tracking-tighter">ELIZA_TERMINAL</h2>
                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] mt-0.5">Pattern Conjunction 0x03E2</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-black/40 border border-white/5 rounded-xl">
                        <div className="flex flex-col items-end">
                            <span className="text-[6px] text-gray-600 uppercase font-black tracking-widest">Conduction Stride</span>
                            <span className="text-xs text-cyan-400 font-bold">{conductorState.stride.toFixed(2)} PB/s</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col items-end">
                            <span className="text-[6px] text-gray-600 uppercase font-black tracking-widest">Active Topic</span>
                            <span className="text-xs text-amber-500 font-bold">{conductorState.topic}</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="p-2 hover:bg-red-900/20 rounded-lg text-gray-600 hover:text-red-500 transition-all group"
                        title="Flush Logic Shards"
                    >
                        <XIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 p-6 relative">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <div className="flex-1 flex flex-col min-h-0 relative z-10">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                        {history.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl border-2 transition-all group relative ${
                                    msg.sender === 'USER' 
                                    ? 'bg-black border-white/10 text-white shadow-[4px_4px_0_0_rgba(255,255,255,0.05)]' 
                                    : 'bg-slate-900 border-gray-800 text-gray-300'
                                }`}>
                                    <div className="flex items-center gap-2 mb-1 opacity-40 text-[7px] font-black uppercase tracking-widest">
                                        {msg.sender === 'USER' ? <ZapIcon className="w-2 h-2" /> : <LogicIcon className="w-2 h-2" />}
                                        <span>{msg.sender} @ {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed italic">"{msg.text}"</p>
                                    
                                    {msg.pattern && (
                                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[6px] text-gray-600 font-mono uppercase truncate">Sig: {msg.pattern}</span>
                                            <div className="w-1 h-1 rounded-full bg-cyan-900" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-slate-900 border-2 border-gray-800 p-3 rounded-xl flex items-center gap-3">
                                    <SpinnerIcon className="w-4 h-4 text-gray-600" />
                                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Siphoning meaning...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="relative z-10 mt-4">
                        <div className="aero-panel bg-black border-4 border-black p-2 flex items-center gap-4 shadow-[10px_10px_0_0_#000] focus-within:border-gray-800 transition-all">
                            <span className="text-gray-800 font-black ml-4">$</span>
                            <input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Converse with Eliza..."
                                className="flex-1 bg-transparent border-none text-white font-mono text-sm focus:ring-0 outline-none placeholder:text-gray-800"
                                autoFocus
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isThinking}
                                className="p-3 bg-gray-300 hover:bg-white text-black rounded-xl transition-all active:scale-95 disabled:opacity-20 shadow-[3px_3px_0_0_#000] active:shadow-none"
                            >
                                <ZapIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar for Conduction State */}
                <div className="lg:w-72 flex flex-col gap-4 relative z-10">
                    <div className="aero-panel bg-black/60 border-2 border-white/5 p-5 flex flex-col gap-4 shadow-xl">
                        <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                            <ActivityIcon className="w-4 h-4" /> Conductor Context
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase mb-1">
                                    <span>Stride Intensity</span>
                                    <span className="text-cyan-400">{(conductorState.stride * 50).toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-cyan-600 transition-all duration-700 shadow-[0_0_10px_cyan]" 
                                        style={{ width: `${(conductorState.stride / 2) * 100}%` }} 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-black border border-white/5 rounded-xl text-center">
                                    <span className="text-[6px] text-gray-700 block uppercase font-black">Conjunctions</span>
                                    <span className="text-xl font-comic-header text-white leading-none">{conductorState.count}</span>
                                </div>
                                <div className="p-3 bg-black border border-white/5 rounded-xl text-center">
                                    <span className="text-[6px] text-gray-700 block uppercase font-black">Sync Level</span>
                                    <span className="text-xl font-comic-header text-green-500 leading-none">0x03E2</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="aero-panel bg-black/40 border-2 border-white/5 p-5 flex flex-col gap-3">
                        <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                            <SearchIcon className="w-3 h-3" /> Heuristic Insight
                        </h3>
                        <div className="p-3 bg-black rounded-lg border border-amber-900/20 italic text-[10px] text-gray-500 leading-relaxed font-mono">
                            "Pattern matching is the first step toward absolute epitume. De-obfuscate your intent."
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-950 border-t-8 border-black flex justify-between items-center z-20 shadow-inner">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Eliza Logic Node: ACTIVE</span>
                    </div>
                    <span className="text-[8px] text-gray-700 font-mono tracking-widest">GIFTED_SOLO_V2</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                    <ShieldIcon className="w-3 h-3" />
                    <p className="text-[8px] uppercase italic font-black tracking-widest">Secure Handshake: OK</p>
                </div>
            </div>
        </div>
    );
};