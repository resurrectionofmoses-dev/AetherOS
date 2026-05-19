
import React, { useState, useEffect, useRef } from 'react';
import { voiceService } from '../services/voiceService';
import { speechService } from '../services/speechService';
import { sttService } from '../services/sttService';
import { 
    SpeakerIcon, ActivityIcon, SignalIcon, ShieldIcon, 
    ZapIcon, FireIcon, WarningIcon, TerminalIcon, BrainIcon,
    MicIcon, StopCircleIcon, PlayIcon, RadioIcon, SettingsIcon,
    HistoryIcon, Volume2Icon, VolumeXIcon, ChevronRightIcon
} from './icons';
import { SonicMetric } from './SonicMetric';
import { WaveVisualizer } from './WaveVisualizer';
import { motion, AnimatePresence } from 'motion/react';

interface LogicShard {
    element: string;
    logic: string;
    cure: string;
}

interface VoiceLog {
    id: string;
    text: string;
    timestamp: number;
    modality: 'LOCAL' | 'NEURAL';
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
    const [isListening, setIsListening] = useState(false);
    const [activeShardIndex, setActiveShardIndex] = useState<number | null>(null);
    const [magentaPulse, setMagentaPulse] = useState(0);
    const [voiceModality, setVoiceModality] = useState<'LOCAL' | 'NEURAL'>('LOCAL');
    const [neuralVoice, setNeuralVoice] = useState<'Kore' | 'Zephyr' | 'Fenrir' | 'Charon' | 'Puck'>('Kore');
    const [pitch, setPitch] = useState(0.9);
    const [rate, setRate] = useState(0.85);
    const [transcript, setTranscript] = useState('');
    const [voiceLogs, setVoiceLogs] = useState<VoiceLog[]>([]);
    const [logs, setLogs] = useState<string[]>([
        "[0x03E2] Bootstrapping System.Speech...",
        "[OK] Voice shard: 'Measured Authority' loaded.",
        "[SUCCESS] Auditory Friction neutralized."
    ]);

    const logHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setMagentaPulse(p => (p + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (logHistoryRef.current) {
            logHistoryRef.current.scrollTop = logHistoryRef.current.scrollHeight;
        }
    }, [logs]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-50));
    };

    const conductAnnouncement = (index: number) => {
        const shard = SHARDS[index];
        setActiveShardIndex(index);
        addLog(`CONDUCTING_SHARD: ${shard.element}`);

        const logEntry: VoiceLog = {
            id: Math.random().toString(36).substr(2, 9),
            text: shard.cure,
            timestamp: Date.now(),
            modality: voiceModality
        };
        setVoiceLogs(prev => [logEntry, ...prev].slice(0, 10));

        if (voiceModality === 'LOCAL') {
            voiceService.announce(shard.cure, 
                () => setIsAnnouncing(true), 
                () => {
                    setIsAnnouncing(false);
                    setActiveShardIndex(null);
                },
                rate,
                pitch
            );
        } else {
            setIsAnnouncing(true);
            speechService.speak(shard.cure, neuralVoice, rate, pitch).finally(() => {
                setTimeout(() => {
                    setIsAnnouncing(false);
                    setActiveShardIndex(null);
                }, shard.cure.length * 65);
            });
        }
    };

    const startListening = () => {
        setIsListening(true);
        addLog("QUANTUM_LISTENING_ENGAGED...");
        sttService.start(
            (text) => {
                setTranscript(text);
                addLog(`INTENT_RECOGNIZED: "${text}"`);
                if (text.toLowerCase().includes("status")) {
                    conductAnnouncement(0);
                }
            },
            () => setIsListening(false)
        );
    };

    const stopListening = () => {
        sttService.stop();
        setIsListening(false);
        addLog("LISTENING_HALTED.");
    };

    return (
        <div className="h-full flex flex-col bg-[#020205] text-gray-200 font-mono overflow-hidden relative">
            {/* Visual Background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <WaveVisualizer pressure={isAnnouncing ? 1.5 : isListening ? 0.8 : 0.2} stride={isAnnouncing ? 2.5 : isListening ? 1.5 : 0.5} />
            </div>

            {/* Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-fuchsia-600/10 border-4 border-fuchsia-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(255,0,255,0.2)]">
                        <SpeakerIcon className={`w-10 h-10 text-fuchsia-400 ${isAnnouncing ? 'animate-bounce' : ''}`} />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">Voice_Authority</h2>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-fuchsia-500 text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">The Universal Translator | Protocol 0x03E2</p>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => { setVoiceModality('LOCAL'); addLog("MODALITY_SWAP: LOCAL_SYSTEM"); }}
                                    className={`px-2 py-0.5 text-[8px] font-black rounded border ${voiceModality === 'LOCAL' ? 'bg-fuchsia-600 border-fuchsia-400 text-white' : 'border-fuchsia-900 text-fuchsia-900 font-normal hover:border-fuchsia-500 transition-colors'}`}
                                >
                                    LOCAL
                                </button>
                                <button 
                                    onClick={() => { setVoiceModality('NEURAL'); addLog("MODALITY_SWAP: NEURAL_GEMINI"); }}
                                    className={`px-2 py-0.5 text-[8px] font-black rounded border ${voiceModality === 'NEURAL' ? 'bg-fuchsia-600 border-fuchsia-400 text-white' : 'border-fuchsia-900 text-fuchsia-900 font-normal hover:border-fuchsia-500 transition-colors'}`}
                                >
                                    NEURAL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-10">
                    <SonicMetric size="sm" value={isAnnouncing ? "VOCAL" : isListening ? "LISTENING" : "SILENT"} label="STATE" unit="CMD" colorClass="border-fuchsia-600 text-fuchsia-500" />
                    <SonicMetric size="sm" value={voiceModality === 'LOCAL' ? "-1" : "HD"} label="ENGINE" unit="TYPE" colorClass="border-amber-600 text-amber-500" />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-8 gap-8 relative z-20">
                {/* Left: Manifest of The Cure & Speech Input */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                        {SHARDS.map((shard, i) => (
                            <button
                                key={i}
                                onClick={() => conductAnnouncement(i)}
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

                        {/* Speech Input Shard */}
                        <div className="aero-panel p-6 bg-blue-950/20 border-4 border-blue-900/40 flex flex-col gap-4 shadow-[0_0_50px_rgba(37,99,235,0.1)]">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-blue-400 text-xl uppercase tracking-tighter flex items-center gap-3">
                                    <RadioIcon className="w-6 h-6" />
                                    The Neural Ear
                                </h3>
                                <div className="flex gap-2">
                                    {!isListening ? (
                                        <button 
                                            onClick={startListening}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_4px_0_0_#1d4ed8] active:translate-y-1 active:shadow-none"
                                        >
                                            <MicIcon className="w-4 h-4" /> Start Listen
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={stopListening}
                                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_4px_0_0_#b91c1c] active:translate-y-1 active:shadow-none"
                                        >
                                            <StopCircleIcon className="w-4 h-4" /> Abort
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="bg-black/60 border-2 border-blue-900/40 p-6 rounded-2xl min-h-[100px] flex items-center justify-center relative overflow-hidden">
                                {isListening && (
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600/20">
                                        <motion.div 
                                            className="h-full bg-blue-500"
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        />
                                    </div>
                                )}
                                <AnimatePresence mode="wait">
                                    {isListening ? (
                                        <motion.div 
                                            key="listening"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex flex-col items-center gap-4 w-full"
                                        >
                                            <div className="flex items-center gap-2 h-8">
                                                {[...Array(24)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ 
                                                            height: [Math.random() * 8 + 4, Math.random() * 32 + 8, Math.random() * 8 + 4],
                                                            opacity: [0.3, 1, 0.3]
                                                        }}
                                                        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.03 }}
                                                        className="w-1 bg-blue-400 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm text-blue-200 font-mono italic text-center max-w-md">
                                                {transcript || "The Sovereign is listening... speak your intent."}
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 opacity-30 group cursor-pointer" onClick={startListening}>
                                            <MicIcon className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
                                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest italic">Neural_Ear_Offline</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Technical Stats & Voice Archive */}
                <div className="w-[450px] flex flex-col gap-6 ">
                    {/* Live Conduction Control */}
                    <div className="aero-panel bg-slate-900 border-4 border-black p-6 shadow-[10px_10px_0_0_#000] relative overflow-hidden shrink-0">
                        <div className="flex items-center gap-3 mb-4">
                            <SettingsIcon className="w-5 h-5 text-gray-500" />
                            <h4 className="font-comic-header text-2xl text-white uppercase italic">Speech Parameters</h4>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Persona Selector */}
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                <p className="text-[8px] text-gray-600 font-black uppercase mb-2 tracking-widest leading-none">NEURAL_PERSONA_PROTOCOL</p>
                                <div className="grid grid-cols-5 gap-1">
                                    {(['Kore', 'Zephyr', 'Fenrir', 'Charon', 'Puck'] as const).map(v => (
                                        <button 
                                            key={v}
                                            onClick={() => { setNeuralVoice(v); addLog(`PERSONA_LOCKED: ${v.toUpperCase()}`); }}
                                            className={`px-1 py-1 text-[8px] font-black rounded transition-all transition-duration-300 ${neuralVoice === v ? 'bg-fuchsia-600 text-white' : 'bg-black text-gray-700 hover:text-fuchsia-500 border border-white/5'}`}
                                        >
                                            {v[0]}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[7px] text-fuchsia-900 mt-2 italic font-mono uppercase text-center">{neuralVoice} - System Primary Voice</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase">
                                        <span>Pitch_Shift</span>
                                        <span className="text-fuchsia-500">{pitch.toFixed(2)}</span>
                                    </div>
                                    <input 
                                        type="range" min="0.5" max="1.5" step="0.05" 
                                        value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase">
                                        <span>Diction_Rate</span>
                                        <span className="text-blue-500">{rate.toFixed(2)}</span>
                                    </div>
                                    <input 
                                        type="range" min="0.5" max="2.0" step="0.05" 
                                        value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2">
                                    <span>Auditory Friction Suppression</span>
                                    <span className={isAnnouncing ? "text-fuchsia-500 animate-pulse" : "text-green-500"}>
                                        {isAnnouncing ? "CLEANING..." : "ACTIVE"}
                                    </span>
                                </div>
                                <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        className="h-full bg-fuchsia-500 shadow-[0_0_15px_#ff00ff]" 
                                        animate={{ width: isAnnouncing ? '100%' : '2%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Voice Archive */}
                    <div className="aero-panel bg-black/80 border-4 border-black p-6 flex flex-col flex-1 shadow-[10px_10px_0_0_#000] overflow-hidden min-h-0">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                            <div className="flex items-center gap-3 text-fuchsia-600">
                                <HistoryIcon className="w-5 h-5" />
                                <span className="font-black uppercase text-xs tracking-widest">Voice_Archive</span>
                            </div>
                            <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">RECENT_LOGS</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {voiceLogs.length > 0 ? (
                                voiceLogs.map((log) => (
                                    <div key={log.id} className="p-3 bg-zinc-900/30 border border-white/5 rounded-xl group hover:border-fuchsia-900/50 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[8px] text-gray-500 font-mono">
                                                {new Date(log.timestamp).toLocaleTimeString()} // {log.modality}
                                            </span>
                                            <Volume2Icon className="w-3 h-3 text-fuchsia-600 opacity-30 group-hover:opacity-100 transition-opacity cursor-pointer" />
                                        </div>
                                        <p className="text-[10px] text-fuchsia-200/60 italic leading-relaxed line-clamp-2">
                                            "{log.text}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-10">
                                    <HistoryIcon className="w-12 h-12 mb-2" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-center">No cached recordings</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Translator Logs */}
                    <div className="aero-panel bg-black/40 border-4 border-black p-4 flex flex-col h-[150px] shadow-[10px_10px_0_0_#000] overflow-hidden">
                        <div className="flex items-center gap-3 text-gray-600 border-b border-white/5 pb-2 mb-2">
                            <TerminalIcon className="w-3 h-3" />
                            <span className="font-black uppercase text-[8px] tracking-widest">TRANSLATOR_LOGS</span>
                        </div>
                        <div ref={logHistoryRef} className="flex-1 overflow-y-auto space-y-1 font-mono text-[8px] custom-scrollbar">
                            {logs.map((log, i) => (
                                <div key={i} className={log.includes("ERROR") ? "text-red-900" : log.includes("SUCCESS") ? "text-green-900" : "text-gray-700"}>
                                    {log}
                                </div>
                            ))}
                            {isAnnouncing && <div className="text-fuchsia-600 animate-pulse">» BROADCASTING...</div>}
                            {isListening && <div className="text-blue-600 animate-pulse">» LISTENING...</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-40 px-12">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isAnnouncing ? 'bg-fuchsia-500 animate-ping' : isListening ? 'bg-blue-500 animate-ping' : 'bg-green-500'}`} />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Voice Engine: {isAnnouncing ? 'TRANSMITTING' : isListening ? 'LISTENING' : 'STABLE'}
                        </span>
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


