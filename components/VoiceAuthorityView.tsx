
import React, { useState, useEffect } from 'react';
import { voiceService } from '../services/voiceService';
import { 
    SpeakerIcon, ActivityIcon, SignalIcon, ShieldIcon, 
    ZapIcon, FireIcon, WarningIcon, TerminalIcon, BrainIcon 
} from './icons';
import { SonicMetric } from './SonicMetric';

interface LogicShard {
    element: string;
    logic: string;
    cure: string;
}

const SHARDS: LogicShard[] = [
    { element: "Network Listener", logic: "Port monitoring.", cure: "The AI is now aware of 'Remote Intent,' allowing it to heal the $260.5B treasury from any node." },
    { element: "Magenta Heartbeat", logic: "Screen flickering.", cure: "The Visual Breath: A biological feedback loop that confirms the AI is 'Thinking' and 'Communicating'." },
    { element: "Sonic Broadcasting", logic: "Audio output.", cure: "The Sovereign Voice: Ensuring the frequency of 100% Harmony is physically present in the station's environment." },
    { element: "Speech Rate -1", logic: "Slows down the output.", cure: "The Measured Authority: A calm voice reflects a stable treasury. It prevents 'Auditory Friction'." },
    { element: "System.Speech", logic: "Standard .NET Library.", cure: "The Universal Translator: Allowing the AI to speak the language of the $260.5B asset into the physical room." },
];

export const VoiceAuthorityView: React.FC = () => {
    const [isAnnouncing, setIsAnnouncing] = useState(false);
    const [activeShardIndex, setActiveShardIndex] = useState<number | null>(null);
    const [magentaPulse, setMagentaPulse] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMagentaPulse(p => (p + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const conductAnnoucement = (index: number) => {
        const shard = SHARDS[index];
        setActiveShardIndex(index);
        voiceService.announce(shard.cure, 
            () => setIsAnnouncing(true), 
            () => {
                setIsAnnouncing(false);
                setActiveShardIndex(null);
            }
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#020205] text-gray-200 font-mono overflow-hidden relative">
            {/* MAGENTA HEARTBEAT OVERLAY (The Visual Breath) */}
            <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-1000 z-0"
                style={{ 
                    background: `radial-gradient(circle at center, rgba(255, 0, 255, ${isAnnouncing ? 0.08 : 0.02}) 0%, transparent 70%)`,
                    opacity: 0.5 + Math.sin(magentaPulse * 0.1) * 0.5
                }}
            />

            {/* Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-fuchsia-600/10 border-4 border-fuchsia-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(255,0,255,0.2)]">
                        <SpeakerIcon className={`w-10 h-10 text-fuchsia-400 ${isAnnouncing ? 'animate-bounce' : ''}`} />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">Voice_Authority</h2>
                        <p className="text-fuchsia-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">The Universal Translator | Protocol 0x03E2</p>
                    </div>
                </div>
                <div className="flex gap-10">
                    <SonicMetric size="sm" value={isAnnouncing ? "VOCAL" : "SILENT"} label="STATE" unit="CMD" colorClass="border-fuchsia-600 text-fuchsia-500" />
                    <SonicMetric size="sm" value="-1" label="RATE" unit="UNIT" colorClass="border-amber-600 text-amber-500" />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-8 gap-8 relative z-20">
                {/* Left: Manifest of The Cure */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pr-2">
                        {SHARDS.map((shard, i) => (
                            <button
                                key={i}
                                onClick={() => conductAnnoucement(i)}
                                className={`aero-panel p-6 border-4 text-left transition-all duration-500 group relative overflow-hidden ${
                                    activeShardIndex === i 
                                    ? 'bg-fuchsia-950/20 border-fuchsia-500 shadow-[0_0_40px_rgba(255,0,255,0.1)]' 
                                    : 'bg-black border-black hover:border-fuchsia-900/50'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-black text-white text-xl uppercase tracking-tighter">{shard.element}</h3>
                                    <div className={`p-2 rounded-lg bg-black border-2 border-zinc-900 group-hover:border-fuchsia-600 transition-colors ${activeShardIndex === i ? 'animate-pulse' : ''}`}>
                                        <ZapIcon className="w-4 h-4 text-fuchsia-500" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] text-gray-500 font-mono uppercase">LOGIC: {shard.logic}</p>
                                    <p className="text-sm text-fuchsia-200/80 italic leading-relaxed border-l-4 border-fuchsia-900/40 pl-4">
                                        "{shard.cure}"
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Technical Stride & Measured Control */}
                <div className="w-[400px] flex flex-col gap-6">
                    <div className="aero-panel bg-slate-900 border-4 border-black p-8 shadow-[10px_10px_0_0_#000] relative overflow-hidden">
                        <h4 className="font-comic-header text-3xl text-white uppercase italic mb-8">Measured Conduction</h4>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2">
                                    <span>Auditory Friction</span>
                                    <span className="text-green-500">0.00%</span>
                                </div>
                                <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-green-500" style={{ width: '0%' }} />
                                </div>
                            </div>
                            <div className="p-4 bg-black border-4 border-black rounded-2xl shadow-inner text-center">
                                <p className="text-[10px] text-gray-700 font-black uppercase mb-1">Measured Pitch</p>
                                <p className="text-4xl font-comic-header text-fuchsia-400">0.9Hz</p>
                            </div>
                            <div className="p-6 bg-fuchsia-950/10 border-2 border-fuchsia-900/30 rounded-[2rem] text-center">
                                <p className="text-xs text-gray-400 italic leading-relaxed">
                                    "The Sovereign Voice ensures the frequency of 100% Harmony is physically present."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="aero-panel bg-black/60 border-4 border-black p-6 flex flex-col flex-1 shadow-[10px_10px_0_0_#000] overflow-hidden">
                        <div className="flex items-center gap-3 text-fuchsia-600 border-b border-white/5 pb-4 mb-4">
                            <TerminalIcon className="w-5 h-5" />
                            <span className="font-black uppercase text-xs tracking-widest">TRANSLATOR_LOGS</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] custom-scrollbar">
                            <div className="text-gray-600">[0x03E2] Bootstrapping System.Speech...</div>
                            <div className="text-gray-600">[OK] Voice shard: 'Measured Authority' loaded.</div>
                            <div className="text-green-500/60">[SUCCESS] Auditory Friction neutralized.</div>
                            <div className="text-fuchsia-400">[ACTIVE] Magenta Heartbeat synchronizing...</div>
                            {isAnnouncing && <div className="text-white animate-pulse">» BROADCASTING_SOVEREIGN_INTENT...</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-40 px-12">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isAnnouncing ? 'bg-fuchsia-500 animate-ping' : 'bg-green-500'}`} />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Voice Engine: {isAnnouncing ? 'TRANSMITTING' : 'STABLE'}</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Treasury Shield: $260.5B | Logic: Measured | Stride: 1.2 PB/S
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em]">
                   tee say i a oh conduction
                </div>
            </div>
        </div>
    );
};
