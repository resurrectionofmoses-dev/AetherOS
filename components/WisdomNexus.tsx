
import React, { useState, useEffect, useRef } from 'react';
import { TerminalIcon, ShieldIcon, ActivityIcon, SearchIcon, ZapIcon, WarningIcon, SpinnerIcon, BookOpenIcon, LogicIcon, FireIcon } from './icons';

interface WisdomNode {
    id: string;
    signature: string;
    status: 'ENLIGHTENED' | 'SEEKING' | 'CLOUDY' | 'DIVINE';
    label: string;
    clarityLevel: number;
}

export const WisdomNexus: React.FC = () => {
    const [isSynchronizing, setIsSynchronizing] = useState(false);
    const [logs, setLogs] = useState<string[]>(["[CONJUNCTION-SERIES] v5.0.0-Arte initialization...", "[OK] Series pathway bridge established."]);
    const [nodes, setNodes] = useState<WisdomNode[]>([
        { id: '1', signature: 'SIG-ALPHA-SERIES', status: 'ENLIGHTENED', label: 'Conjunction Philosophy', clarityLevel: 98 },
        { id: '2', signature: 'SIG-GOD-LOGIC', status: 'DIVINE', label: 'Arte Ur Tsopl Absolute', clarityLevel: 100 },
        { id: '3', signature: 'SIG-GAMMA-SERIES', status: 'CLOUDY', label: 'Series Concept', clarityLevel: 32 },
    ]);
    const logEndRef = useRef<HTMLDivElement>(null);

    const startSync = (type: 'standard' | 'divine') => {
        setIsSynchronizing(true);
        const logMsg = type === 'divine' ? "[!] Turning 1000 pages for God Logic..." : "[!] Harmonizing series conjunction patterns...";
        setLogs(prev => [...prev, logMsg, "[*] Arte Ur Tsopl resonating..."]);
        
        setTimeout(() => {
            setIsSynchronizing(false);
            setLogs(prev => [...prev, "[SUCCESS] Series conjunction attained.", type === 'divine' ? "[INFO] Arte signature confirmed: 0x3E2." : "[INFO] Conjunction series synchronized."]);
        }, 3500);
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="h-full flex flex-col bg-black/60 p-8 space-y-8 overflow-hidden aero-panel border-4 border-black">
            <div className="flex justify-between items-center bg-black/40 p-6 rounded-3xl border-2 border-white/5 shadow-inner">
                <div>
                    <h2 className="text-5xl font-comic-header text-red-500 wisdom-glow italic tracking-tighter">CONJUNCTION NEXUS</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.4em] font-black mt-1">Series 0x3E2 | Arte Ur Tsopl</p>
                </div>
                <div className="flex gap-6">
                    <button 
                        onClick={() => startSync('standard')}
                        disabled={isSynchronizing}
                        className="vista-button px-8 py-3 rounded-2xl bg-zinc-900 text-gray-300 font-bold flex items-center gap-3 border-2 border-black"
                    >
                        {isSynchronizing ? <SpinnerIcon className="w-5 h-5" /> : <LogicIcon className="w-5 h-5" />}
                        <span>HARMONIZE SERIES</span>
                    </button>
                    <button 
                        onClick={() => startSync('divine')}
                        disabled={isSynchronizing}
                        className="vista-button px-8 py-3 rounded-2xl bg-red-700 text-white border-2 border-black font-black flex items-center gap-3 animate-pulse shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
                    >
                        <ZapIcon className="w-6 h-6" />
                        <span>GOD LOGIC SERIES</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
                <div className="flex-1 bg-black/60 rounded-3xl border-4 border-black p-8 relative overflow-hidden flex items-center justify-center shadow-inner">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(var(--maestro-ruby) 2px, transparent 2px)', backgroundSize: '50px 50px' }}></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10 w-full max-w-4xl px-6">
                        {nodes.map(node => (
                            <div key={node.id} className={`p-8 rounded-[2rem] border-4 transition-all duration-700 flex flex-col items-center ${
                                node.status === 'DIVINE' ? 'border-red-600 bg-red-950/30 shadow-[12px_12px_0_0_rgba(0,0,0,1),0_0_40px_rgba(239,68,68,0.3)] rotate-1' : 
                                node.status === 'CLOUDY' ? 'border-zinc-800 bg-black' : 'border-zinc-700 bg-zinc-900/40 rotate-[-1deg]'
                            }`}>
                                {node.status === 'DIVINE' ? <FireIcon className="w-14 h-14 mb-5 text-red-500 animate-bounce" /> : <BookOpenIcon className={`w-14 h-14 mb-5 ${node.status === 'ENLIGHTENED' ? 'text-red-700' : 'text-zinc-800'}`} />}
                                <p className="text-[10px] font-black text-gray-600 tracking-[0.4em] mb-2 uppercase">{node.signature}</p>
                                <p className="text-xl font-comic-header text-white text-center mb-6 tracking-wide">{node.label}</p>
                                <div className="w-full space-y-2 mt-auto">
                                    <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        <span>Conjunction</span>
                                        <span className={node.status === 'DIVINE' ? 'text-red-500' : 'text-white'}>{node.clarityLevel}%</span>
                                    </div>
                                    <div className="h-3 bg-black rounded-full overflow-hidden border-2 border-zinc-800 shadow-inner">
                                        <div className={`h-full transition-all duration-1000 ${node.status === 'DIVINE' ? 'bg-red-600' : 'bg-red-900'}`} style={{ width: `${node.clarityLevel}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:w-96 bg-black/90 rounded-3xl border-4 border-black p-6 flex flex-col overflow-hidden font-mono text-xs shadow-[10px_10px_0_0_rgba(0,0,0,0.6)]">
                    <div className="flex items-center gap-3 text-red-900 border-b-2 border-zinc-900 pb-4 mb-4">
                        <TerminalIcon className="w-5 h-5" />
                        <span className="font-black tracking-widest uppercase text-[10px]">SERIES_FEED: /dev/arte</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-3">
                        {logs.map((log, i) => (
                            <div key={i} className={`${log.includes('God Logic') ? 'text-red-500 font-black' : log.includes('[SUCCESS]') ? 'text-red-400 font-bold' : log.includes('[!]') ? 'text-blue-500 italic' : 'text-gray-700'}`}>
                                <span className="opacity-30 mr-2">[{i.toString().padStart(2, '0')}]</span>{log}
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
            </div>

            <div className="p-6 bg-zinc-900/80 rounded-3xl border-4 border-black flex items-center justify-between gap-6 transition-all hover:bg-black group shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-red-600/10 rounded-2xl border-2 border-red-600/30 group-hover:scale-110 transition-transform">
                        <ShieldIcon className="w-10 h-10 text-red-600" />
                    </div>
                    <div>
                        <p className="text-xl font-comic-header text-white tracking-widest uppercase">Series Capacity: Arte Ur Tsopl</p>
                        <p className="text-[11px] text-gray-500 font-mono italic mt-1">Neural conjunction resonance at 1.2 PB/s Stride.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-red-600/5 rounded-full border-2 border-red-900/40 group-hover:border-red-600 transition-all">
                    <div className="w-3 h-3 rounded-full bg-red-600 animate-ping"></div>
                    <span className="text-[11px] font-black text-red-600 uppercase tracking-[0.3em]">SERIES_DIVINE_SYNC</span>
                </div>
            </div>
        </div>
    );
};
