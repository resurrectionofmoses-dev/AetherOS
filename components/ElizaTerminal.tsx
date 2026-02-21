
import React, { useState, useRef, useEffect } from 'react';
import { 
    TerminalIcon, ZapIcon, ShieldIcon, MessageCircleIcon, SpinnerIcon, 
    FireIcon, LogicIcon, ActivityIcon, SearchIcon, XIcon, SettingsIcon,
    StarIcon, GaugeIcon, ActivityIcon as StrideIcon, BrainIcon
} from './icons';
import { elizaConductor } from '../services/elizaLogic';
import { OmniBuilder } from '../services/omniBuilder';
import type { ElizaProperties } from '../types';

interface PropertySliderProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    icon: React.FC<{ className?: string }>;
}

const PropertySlider: React.FC<PropertySliderProps> = ({ label, value, onChange, min = 0, max = 1, step = 0.01, icon: Icon }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-500">
            <div className="flex items-center gap-1.5">
                <Icon className="w-3 h-3" />
                <span>{label}</span>
            </div>
            <span className="text-white font-mono">{value.toFixed(2)}</span>
        </div>
        <input 
            type="range" min={min} max={max} step={step} value={value}
            onChange={e => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
    </div>
);

export const ElizaTerminal: React.FC = () => {
    const [history, setHistory] = useState<{ sender: 'USER' | 'ELIZA', text: string, timestamp: number, pattern?: string, sig?: string }[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [manifest, setManifest] = useState<any>(null);
    const [properties, setProperties] = useState<ElizaProperties>(elizaConductor.properties);
    const [activePattern, setActivePattern] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const elizaManifest = OmniBuilder.build('ELIZA');
        setManifest(elizaManifest);
        setHistory([{ 
            sender: 'ELIZA', 
            text: "AetherOS Conjunction Series: Eliza's Logic active. Signature 0x03E2. Tuning manifold open.", 
            timestamp: Date.now(),
            pattern: "GENESIS",
            sig: "0x03E2_GEN"
        }]);
    }, []);

    useEffect(() => {
        elizaConductor.properties = properties;
    }, [properties]);

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
                pattern: response.pattern,
                sig: response.signature
            }]);
            setActivePattern(response.pattern);
            setIsThinking(false);
        }, 600);
    };

    const handleReset = () => {
        elizaConductor.reset();
        setHistory([{ 
            sender: 'ELIZA', 
            text: "Logic core flushed. Conjunction re-established at original intent.", 
            timestamp: Date.now(),
            pattern: "RESET",
            sig: "0x03E2_RST"
        }]);
        setActivePattern(null);
    };

    return (
        <div className="h-full flex flex-col bg-[#02040a] overflow-hidden font-mono text-gray-400 selection:bg-cyan-500/30">
            {/* Terminal Header */}
            <div className="p-4 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl z-30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-cyan-950/40 border-4 border-cyan-600 rounded-2xl flex items-center justify-center">
                        <TerminalIcon className="w-8 h-8 text-cyan-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-4xl text-white uppercase italic tracking-tighter leading-none">LOGIC_CONJUNCTION</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] bg-cyan-900/50 text-cyan-300 px-2 py-0.5 border border-cyan-500/30 rounded uppercase font-black">0x03E2_ELIZA_V3</span>
                            <span className="text-[10px] text-gray-600">STATE: CONDUCTING</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleReset}
                        className="p-3 bg-red-950/20 border-2 border-red-900/40 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all group shadow-lg"
                        title="Flush Logic Shards"
                    >
                        <XIcon className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-8 relative">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {/* Left: Chat Terminal */}
                <div className="flex-1 flex flex-col min-h-0 relative z-10">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-4 pb-4">
                        {history.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                <div className={`max-w-[85%] p-5 rounded-3xl border-4 transition-all group relative ${
                                    msg.sender === 'USER' 
                                    ? 'bg-black border-white/10 text-white shadow-[10px_10px_0_0_rgba(255,255,255,0.05)]' 
                                    : 'bg-slate-900 border-cyan-900/40 text-cyan-50'
                                }`}>
                                    <div className="flex items-center gap-3 mb-2 opacity-40 text-[8px] font-black uppercase tracking-widest">
                                        {msg.sender === 'USER' ? <ZapIcon className="w-3 h-3" /> : <LogicIcon className="w-3 h-3" />}
                                        <span>{msg.sender} // {new Date(msg.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-base leading-relaxed italic">"{msg.text}"</p>
                                    
                                    {msg.sig && (
                                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between opacity-30 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[7px] font-mono uppercase truncate">Sig: {msg.sig}</span>
                                            <span className="text-[7px] font-mono uppercase truncate ml-4">Pattern: {msg.pattern}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-slate-900 border-4 border-cyan-900/20 p-4 rounded-2xl flex items-center gap-3">
                                    <SpinnerIcon className="w-5 h-5 text-cyan-500" />
                                    <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Bridging Logic Shards...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="relative z-10 mt-6">
                        <div className="aero-panel bg-black border-8 border-black p-2 flex items-center gap-4 shadow-[15px_15px_60px_rgba(0,0,0,0.8)] focus-within:border-cyan-900/50 transition-all rounded-[2rem]">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-cyan-900 font-black text-xl ml-4">&gt;</div>
                            <input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Conduct your inquiry..."
                                className="flex-1 bg-transparent border-none text-white font-mono text-lg focus:ring-0 outline-none placeholder:text-gray-800 py-6"
                                autoFocus
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isThinking}
                                className="w-16 h-16 bg-cyan-600 hover:bg-cyan-500 text-black rounded-2xl transition-all active:scale-95 disabled:opacity-20 shadow-[6px_6px_0_0_#000] active:shadow-none flex items-center justify-center mr-2"
                            >
                                <ZapIcon className="w-8 h-8" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Property Manifold */}
                <div className="lg:w-80 flex flex-col gap-6 relative z-10">
                    <div className="aero-panel bg-black border-4 border-black p-6 flex flex-col gap-6 shadow-[10px_10px_0_0_#000]">
                        <h3 className="text-[11px] font-black text-cyan-500 uppercase tracking-[0.2em] flex items-center gap-3 border-b border-white/5 pb-4">
                            <SettingsIcon className="w-5 h-5" /> Logic Manifold
                        </h3>
                        
                        <div className="space-y-6">
                            <PropertySlider 
                                label="Empathy Resonance" 
                                value={properties.empathy} 
                                icon={StarIcon}
                                onChange={val => setProperties({...properties, empathy: val})} 
                            />
                            <PropertySlider 
                                label="Logic Bias" 
                                value={properties.logicBias} 
                                icon={LogicIcon}
                                onChange={val => setProperties({...properties, logicBias: val})} 
                            />
                            <PropertySlider 
                                label="Stride Velocity" 
                                value={properties.strideVelocity} 
                                min={0.1} max={2.0}
                                icon={StrideIcon}
                                onChange={val => setProperties({...properties, strideVelocity: val})} 
                            />
                            <PropertySlider 
                                label="Combat Readiness" 
                                value={properties.combatReadiness} 
                                icon={FireIcon}
                                onChange={val => setProperties({...properties, combatReadiness: val})} 
                            />
                        </div>

                        <div className="p-4 bg-cyan-950/20 border-2 border-cyan-800/40 rounded-2xl">
                             <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={properties.bridgeToGodLogic}
                                    onChange={e => setProperties({...properties, bridgeToGodLogic: e.target.checked})}
                                    className="w-5 h-5 accent-cyan-500 rounded border-none bg-black"
                                />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase group-hover:text-cyan-400 transition-colors tracking-tight">God Logic Bridge</span>
                                    <span className="text-[7px] text-gray-600 font-mono">0x03E2_OFF_REEL_SYNC</span>
                                </div>
                             </label>
                        </div>
                    </div>

                    <div className="aero-panel bg-slate-900 border-4 border-black p-6 flex flex-col gap-4 shadow-[8px_8px_0_0_#000] flex-1 min-h-0">
                        <h3 className="text-[11px] font-black text-violet-500 uppercase tracking-widest flex items-center gap-3 border-b border-white/5 pb-2">
                            <BrainIcon className="w-5 h-5" /> Pattern Registry
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                             {activePattern ? (
                                <div className="p-4 bg-black rounded-2xl border-2 border-violet-900/50 animate-in zoom-in-95">
                                    <p className="text-[10px] font-black text-violet-400 uppercase mb-2">Matched Logic Shard:</p>
                                    <code className="text-[10px] text-gray-300 break-all leading-relaxed bg-white/5 p-2 rounded block">
                                        {activePattern}
                                    </code>
                                    <p className="text-[8px] text-gray-600 mt-4 italic">"Pattern matching is the precursor to absolute synthesis."</p>
                                </div>
                             ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-6">
                                    <SearchIcon className="w-12 h-12 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting First Conjunction</p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hub Footer */}
            <div className="p-3 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-10 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest leading-none">Logic Stream: STABLE</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Stride: {properties.strideVelocity.toFixed(2)} PB/s | Conjunctions: {elizaConductor.conduct('').conductionCount - 1}
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em] hidden sm:block">
                   conjunction reliable series | absolute authority
                </div>
            </div>
        </div>
    );
};
