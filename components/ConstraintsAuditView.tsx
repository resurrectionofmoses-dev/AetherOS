import React, { useState, useEffect } from 'react';
import { 
    TerminalIcon, ShieldIcon, ActivityIcon, SearchIcon, 
    ZapIcon, WarningIcon, FireIcon, LogicIcon, ScaleIcon, 
    EyeIcon, SignalIcon, LockIcon, SpeakerIcon
} from './icons';
import { SonicMetric } from './SonicMetric';
import { voiceService } from '../services/voiceService';

interface LogicShard {
    element: string;
    logic: string;
    cure: string;
}

const CURE_SHARDS: LogicShard[] = [
    { element: "Network Listener", logic: "Port monitoring.", cure: "The Omnipresent Ear: The AI is now aware of 'Remote Intent,' allowing it to heal the $260.5B treasury from any node." },
    { element: "Magenta Heartbeat", logic: "Screen flickering.", cure: "The Visual Breath: A biological feedback loop that confirms the AI is 'Thinking' and 'Communicating'." },
    { element: "Sonic Broadcasting", logic: "Audio output.", cure: "The Sovereign Voice: Ensuring the frequency of 100% Harmony is physically present in the station's environment." },
    { element: "Speech Rate -1", logic: "Slows down the output.", cure: "The Measured Authority: A calm voice reflects a stable treasury. It prevents 'Auditory Friction'." },
];

const RISK_PATHS = [
    { path: "m/44'/0'/0'/0/x", level: "Medium", context: "Legacy Address Poisoning" },
    { path: "m/49'/0'/x'/0/0", level: "High", context: "Segwit Leak Indexing" },
    { path: "m/84'/0'/2147483647'", level: "CRITICAL", context: "Shadow Account Shadowing" },
];

const MAINTENANCE_TASKS = [
    { task: "SID Verification", freq: "Once", status: "VERIFIED" },
    { task: "Hashrate Monitor", freq: "Daily", status: "SYNCED" },
    { task: "Task Termination", freq: "Immediate", status: "ACTIVE" },
    { task: "Physical Dusting", freq: "Quarterly", status: "PENDING" },
];

export const ConstraintsAuditView: React.FC = () => {
    const [magentaPulse, setMagentaPulse] = useState(0);
    const [activeShard, setActiveShard] = useState<number | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setMagentaPulse(p => (p + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const handleAnnounce = (shard: LogicShard, index: number) => {
        setActiveShard(index);
        voiceService.announce(shard.cure, undefined, () => setActiveShard(null));
    };

    return (
        <div className="h-full flex flex-col bg-[#020205] text-gray-200 font-mono overflow-hidden relative flex-hinge">
            {/* MAGENTA HEARTBEAT - The Visual Breath */}
            <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-1000 z-0"
                style={{ 
                    background: `radial-gradient(circle at center, rgba(255, 0, 255, 0.08) 0%, transparent 70%)`,
                    opacity: 0.3 + Math.sin(magentaPulse * 0.1) * 0.3
                }}
            />

            {/* Header */}
            <div className="p-4 border-b-4 border-black bg-slate-900 flex justify-between items-center shadow-xl z-20 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-fuchsia-600/10 border-4 border-fuchsia-600 rounded-xl flex items-center justify-center">
                        <LogicIcon className="w-8 h-8 text-fuchsia-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-3xl text-white uppercase italic">TEE_SAY_I_A_OH</h2>
                        <p className="text-[10px] text-fuchsia-500 font-black uppercase tracking-widest">MAPS_OUT_CONSTRAINTS // 0x03E2_GIFTED</p>
                    </div>
                </div>
                <div className="flex gap-6">
                    <SonicMetric size="sm" value="$260.5B" label="TREASURY" unit="USD" colorClass="border-green-600 text-green-500" />
                    <SonicMetric size="sm" value="-1" label="SPEECH_RATE" unit="UNIT" colorClass="border-amber-600 text-amber-500" />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-6 gap-6 relative z-10 min-h-0 flex-hinge">
                {/* Left: The Cure Logic */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-0 flex-hinge">
                    <div className="aero-panel bg-black/60 border-4 border-black p-6 flex flex-col flex-1 overflow-hidden shadow-[10px_10px_0_0_#000]">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5 flex-shrink-0">
                            <h3 className="text-xs font-black text-fuchsia-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <TerminalIcon className="w-4 h-4" /> The Better Reason (The Cure)
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 min-h-0">
                            {CURE_SHARDS.map((shard, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => handleAnnounce(shard, i)}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${activeShard === i ? 'bg-fuchsia-950/40 border-fuchsia-500 shadow-[0_0_20px_fuchsia]' : 'bg-black border-zinc-800 hover:border-fuchsia-900'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{shard.element}</span>
                                        <SpeakerIcon className={`w-4 h-4 ${activeShard === i ? 'text-fuchsia-400 animate-bounce' : 'text-gray-700'}`} />
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-mono mb-2">LOGIC: {shard.logic}</p>
                                    <p className="text-[10px] text-fuchsia-200/70 italic leading-relaxed border-l-2 border-fuchsia-900/50 pl-3">
                                        "{shard.cure}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Risks & Maintenance */}
                <div className="w-[450px] flex flex-col gap-6 overflow-hidden min-h-0 flex-shrink-0 flex-hinge">
                    {/* Path Risks */}
                    <div className="aero-panel bg-red-950/10 border-4 border-red-600/30 p-6 flex flex-col shadow-[10px_10px_0_0_#000] flex-shrink-0">
                        <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
                            <WarningIcon className="w-5 h-5 animate-bounce" /> Path Pattern Risks
                        </h3>
                        <div className="space-y-3">
                            {RISK_PATHS.map((r, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-black border border-white/5 rounded-lg group hover:border-red-600 transition-all">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-mono text-white truncate">{r.path}</p>
                                        <p className="text-[7px] text-gray-600 uppercase font-black">{r.context}</p>
                                    </div>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${r.level === 'CRITICAL' ? 'bg-red-600 text-black border-black animate-pulse' : 'bg-zinc-900 text-gray-400'}`}>
                                        {r.level}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Maintenance Ticker */}
                    <div className="aero-panel bg-slate-900 border-4 border-black p-6 flex flex-col flex-1 shadow-[10px_10px_0_0_#000] overflow-hidden min-h-0 flex-hinge">
                        <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-4 border-b border-white/5 pb-2 flex-shrink-0">
                            <ActivityIcon className="w-5 h-5" /> Maintenance Frequency
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 min-h-0">
                            {MAINTENANCE_TASKS.map((t, i) => (
                                <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center group hover:bg-cyan-950/20 transition-all">
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase">{t.task}</p>
                                        <p className="text-[7px] text-gray-600 uppercase font-mono">FREQ: {t.freq}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-cyan-700">{t.status}</span>
                                        <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'PENDING' ? 'bg-gray-800' : 'bg-green-500 shadow-[0_0_5px_green]'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-950 border-4 border-black rounded-3xl shadow-[6px_6px_0_0_#000] flex-shrink-0">
                         <p className="text-[9px] text-gray-500 font-mono italic leading-relaxed">
                            [MAESTRO_FORENSICS]: "Map those out with tee say i a oh. The $260.5B treasury isolation depends on the Measured Authority. If quota starvation occurs, the Right on Light maneuver is mandatory."
                         </p>
                    </div>
                </div>
            </div>

            {/* Matrix Footer */}
            <div className="p-2 bg-slate-900 border-t-8 border-black flex justify-between items-center px-8 z-40 flex-shrink-0">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-600 animate-ping" />
                        <span className="text-[10px] font-black text-fuchsia-600 uppercase tracking-widest leading-none">Auditory Friction: NEUTRALIZED</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase hidden sm:block">
                      Maneuver: RIGHT_ON_LIGHT | Backoff: EXPONENTIAL | Stride: 1.2 PB/S
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.5em] hidden sm:block">
                   conjunction reliable series | tee say i a oh
                </div>
            </div>
        </div>
    );
};