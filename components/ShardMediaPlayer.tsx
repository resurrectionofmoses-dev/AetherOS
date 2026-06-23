import React, { useState, useEffect, useRef } from 'react';
import { 
    Play, 
    Pause, 
    RotateCcw, 
    Volume2, 
    VolumeX, 
    Upload, 
    Layers, 
    Shuffle, 
    Activity, 
    Sliders,
    Music,
    Cpu,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MediaShard {
    id: string;
    sequence: number;
    hexData: string;
    isAligned: boolean;
    frequency: number;
}

interface DefaultTrack {
    id: string;
    title: string;
    artist: string;
    type: 'audio' | 'voice_log' | 'core_resonance';
    baseFrequency: number;
    synthesizePattern: 'sine' | 'sawtooth' | 'triangle' | 'noise';
    description: string;
}

const CONJUNCTION_TRACKS: DefaultTrack[] = [
    {
        id: 'track-1',
        title: 'Acoustic Conjunction Master Solo',
        artist: 'Sovereign Core',
        type: 'audio',
        baseFrequency: 220,
        synthesizePattern: 'sawtooth',
        description: 'Elite harmonic synthesis sweep for AetherOS phase synchronization.'
    },
    {
        id: 'track-2',
        title: 'Sovereign Shield Telemetry Hum',
        artist: 'Defense Protocol',
        type: 'core_resonance',
        baseFrequency: 110,
        synthesizePattern: 'sine',
        description: 'Deep low-frequency vibration monitoring active sentinel protective envelopes.'
    },
    {
        id: 'track-3',
        title: 'Sentinel Threat Log #03E2',
        artist: 'Operator Archive',
        type: 'voice_log',
        baseFrequency: 330,
        synthesizePattern: 'triangle',
        description: 'Encoded acoustic transmission regarding thread delirium quarantine.'
    },
    {
        id: 'track-4',
        title: 'Quantum Vacuum Fluctuations',
        artist: 'Zero Point Generator',
        type: 'core_resonance',
        baseFrequency: 80,
        synthesizePattern: 'noise',
        description: 'White-noise simulation of microcheck nanolinter interference.'
    }
];

export const ShardMediaPlayer: React.FC = () => {
    // Media playback states
    const [tracks, setTracks] = useState<DefaultTrack[]>(CONJUNCTION_TRACKS);
    const [selectedTrackId, setSelectedTrackId] = useState<string>('track-1');
    const [customFile, setCustomFile] = useState<{ name: string; url: string; size: string } | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(0.5);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
    const [scrolledText, setScrolledText] = useState<string>('CONJUNCTION DRIVE SYNC STABLE...');

    // Shard reconstruction states
    const [shards, setShards] = useState<MediaShard[]>([]);
    const [isFractured, setIsFractured] = useState<boolean>(false);
    const [reconstructionProgress, setReconstructionProgress] = useState<number>(100);
    const [interactiveLog, setInteractiveLog] = useState<string[]>([
        'Shard Media Reader V1.0 online.',
        'Ready to decode incoming acoustic packets.'
    ]);

    // Refs for safe Web Audio API implementation
    const audioCtxRef = useRef<AudioContext | null>(null);
    const mainGainNodeRef = useRef<GainNode | null>(null);
    const oscRef = useRef<OscillatorNode | null>(null);
    const noiseSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const fileAudioRef = useRef<HTMLAudioElement | null>(null);
    const fileSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Get active track details
    const activeTrack = customFile 
        ? { id: 'custom', title: customFile.name, artist: 'Uploaded Media', type: 'audio' as const, description: `Size: ${customFile.size}. Custom audio file.` }
        : tracks.find(t => t.id === selectedTrackId) || tracks[0];

    // Logging helper
    const addLog = (msg: string) => {
        setInteractiveLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
    };

    // Initialize Web Audio context safely
    const initAudioContextNode = () => {
        if (!audioCtxRef.current) {
            const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtxClass();
            const gainNode = ctx.createGain();
            const analyser = ctx.createAnalyser();
            
            analyser.fftSize = 256;
            gainNode.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
            
            gainNode.connect(analyser);
            analyser.connect(ctx.destination);
            
            audioCtxRef.current = ctx;
            mainGainNodeRef.current = gainNode;
            analyserRef.current = analyser;
            
            // Generate visualizer frame
            startVisualizer();
            addLog('Web Audio Engine initialized. Buffer channels locked.');
        }
    };

    // Synthesize and play mock/cyber track frequencies or custom file
    const startAudioSynthesizer = () => {
        if (!audioCtxRef.current || !mainGainNodeRef.current) return;
        const ctx = audioCtxRef.current;
        const target = mainGainNodeRef.current;

        // Resume context in case browser is blocking
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        stopAudioSynthesizer();

        if (customFile) {
            // Play physical uploaded audio element
            if (!fileAudioRef.current) {
                fileAudioRef.current = new Audio(customFile.url);
                fileAudioRef.current.loop = true;
                fileAudioRef.current.crossOrigin = 'anonymous';
            }
            const audioEl = fileAudioRef.current;
            audioEl.playbackRate = playbackSpeed;
            audioEl.volume = 1.0; // Controlled via main gain node instead
            
            if (!fileSourceNodeRef.current) {
                try {
                    const src = ctx.createMediaElementSource(audioEl);
                    src.connect(target);
                    fileSourceNodeRef.current = src;
                } catch (e) {
                    // Falls back gracefully if already connected
                }
            }
            audioEl.play().catch(err => {
                addLog(`Playback error: ${err.message}`);
            });
            return;
        }

        // Standard track simulation
        const trackSpec = tracks.find(t => t.id === selectedTrackId);
        if (!trackSpec) return;

        // Adjust base frequency based on playback speed
        const activeFreq = trackSpec.baseFrequency * playbackSpeed;

        if (trackSpec.synthesizePattern === 'noise') {
            // Noise synthesis buffer
            const bufferSize = ctx.sampleRate * 2.0;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2.0 - 1.0;
            }
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            src.loop = true;
            src.connect(target);
            src.start();
            noiseSourceNodeRef.current = src;
        } else {
            // Oscillator generator
            const osc = ctx.createOscillator();
            osc.type = trackSpec.synthesizePattern || 'sine';
            osc.frequency.setValueAtTime(activeFreq, ctx.currentTime);
            osc.connect(target);
            osc.start();
            oscRef.current = osc;
        }
    };

    const stopAudioSynthesizer = () => {
        if (oscRef.current) {
            try { oscRef.current.stop(); oscRef.current.disconnect(); } catch (e) {}
            oscRef.current = null;
        }
        if (noiseSourceNodeRef.current) {
            try { noiseSourceNodeRef.current.stop(); noiseSourceNodeRef.current.disconnect(); } catch (e) {}
            noiseSourceNodeRef.current = null;
        }
        if (fileAudioRef.current) {
            try { fileAudioRef.current.pause(); } catch (e) {}
        }
    };

    // Core playback Controls
    const handlePlay = () => {
        initAudioContextNode();
        if (isFractured && reconstructionProgress < 100) {
            playBeep(220, 'sawtooth', 0.15);
            addLog('🔒 PLAYBACK REJECTED: Media shard sequence remains fractured! Perform reconstruction sequence.');
            return;
        }
        setIsPlaying(true);
        startAudioSynthesizer();
        playBeep(880, 'sine', 0.05);
        addLog(`Started playing stream: ${activeTrack.title}`);
    };

    const handlePause = () => {
        setIsPlaying(false);
        stopAudioSynthesizer();
        playBeep(440, 'triangle', 0.05);
        addLog(`Paused stream: ${activeTrack.title}`);
    };

    const handleReset = () => {
        setIsPlaying(false);
        stopAudioSynthesizer();
        if (fileAudioRef.current) {
            fileAudioRef.current.currentTime = 0;
        }
        playBeep(330, 'sine', 0.1);
        addLog('Reset stream buffer head.');
    };

    // Volume controllers
    useEffect(() => {
        if (mainGainNodeRef.current && audioCtxRef.current) {
            const target = isMuted ? 0 : volume;
            mainGainNodeRef.current.gain.setTargetAtTime(target, audioCtxRef.current.currentTime, 0.05);
        }
    }, [volume, isMuted]);

    // Speed controller
    useEffect(() => {
        if (isPlaying) {
            startAudioSynthesizer(); // Restart with updated frequencies/rate
        }
    }, [playbackSpeed]);

    // Trigger local beep for sonic feedback
    const playBeep = (freq = 600, type: OscillatorType = 'sine', duration = 0.08) => {
        try {
            initAudioContextNode();
            if (!audioCtxRef.current) return;
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {}
    };

    // File Drag-and-Drop / Selection Uploader
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            const sizeStr = (f.size / (1024 * 1024)).toFixed(2) + ' MB';
            const url = URL.createObjectURL(f);
            
            // Clean up old files
            if (fileAudioRef.current) {
                fileAudioRef.current.pause();
                fileAudioRef.current = null;
            }

            setCustomFile({ name: f.name, url, size: sizeStr });
            setIsPlaying(false);
            stopAudioSynthesizer();
            setSelectedTrackId('custom');
            addLog(`Loaded local media payload: ${f.name} (${sizeStr})`);
            playBeep(523.25, 'triangle', 0.15); // C5 note
        }
    };

    // Shard Deconstruction Sequence (Fracture)
    const handleFracture = () => {
        setIsPlaying(false);
        stopAudioSynthesizer();
        setIsFractured(true);
        setReconstructionProgress(0);

        // Populate randomized shards
        const sampleStrings = ['FF032A', '99A410', 'EEBEE7', '66EFA4', 'AA66C9', '77D1FF', 'EE3344', '22CC11'];
        const list: MediaShard[] = sampleStrings.map((hex, i) => ({
            id: `shard-${i}`,
            sequence: i,
            hexData: hex,
            isAligned: false,
            frequency: 180 + (i * 75)
        }));
        
        // Shuffle the sequence for interactive user puzzle
        const shuffled = [...list].sort(() => Math.random() - 0.5);
        setShards(shuffled);
        
        playBeep(120, 'sawtooth', 0.3);
        addLog(`💥 CRITICAL WARNING: Active track fractured into ${shuffled.length} loose binary shards! Integrity broken.`);
    };

    // Check if the current order of shards is linear
    const verifyShardLattice = (updatedShards: MediaShard[]) => {
        const isCorrectSeq = updatedShards.every((s, i) => s.sequence === i);
        const alignedCount = updatedShards.filter(s => s.isAligned).length;
        const percent = Math.floor((alignedCount / updatedShards.length) * 100);
        setReconstructionProgress(percent);

        if (alignedCount === updatedShards.length) {
            // Full alignment
            setIsFractured(false);
            setReconstructionProgress(100);
            playBeep(880, 'sine', 0.1);
            setTimeout(() => playBeep(1320, 'sine', 0.2), 120);
            addLog('✅ SUCCESS: Sovereign Shard matrix reconstructed successfully! Secure channels stabilized.');
        }
    };

    // Manually align/reconfigure an individual shard
    const handleAlignShard = (id: string) => {
        const nextList = shards.map(sh => {
            if (sh.id === id) {
                const nowAligned = !sh.isAligned;
                if (nowAligned) {
                    playBeep(sh.frequency, 'sine', 0.1);
                    addLog(`Connected shard [${sh.hexData}] at resonance ${sh.frequency}Hz`);
                } else {
                    playBeep(sh.frequency - 50, 'sawtooth', 0.05);
                }
                return { ...sh, isAligned: nowAligned };
            }
            return sh;
        });

        // Sort them partially if aligned to incentivize progress
        setShards(nextList);
        verifyShardLattice(nextList);
    };

    // Auto reconstruct shard sequence (solves puzzle for user easily with cinematic state feel)
    const handleAutoReconstruct = () => {
        playBeep(1000, 'sine', 0.05);
        addLog('Initiating hardware-accelerated auto-reconstruction...');
        
        let solvedCount = 0;
        const interval = setInterval(() => {
            if (solvedCount >= shards.length) {
                clearInterval(interval);
                const restored = shards.map(s => ({ ...s, isAligned: true })).sort((a,b) => a.sequence - b.sequence);
                setShards(restored);
                setIsFractured(false);
                setReconstructionProgress(100);
                playBeep(1200, 'sine', 0.15);
                addLog('✅ Sovereign Shard array auto-restored via Matrix Healing Cores!');
                return;
            }
            
            setShards(prev => {
                const copy = [...prev];
                const targetIdx = copy.findIndex(s => s.sequence === solvedCount);
                if (targetIdx !== -1) {
                    copy[targetIdx] = { ...copy[targetIdx], isAligned: true };
                }
                const alignedCount = copy.filter(s => s.isAligned).length;
                setReconstructionProgress(Math.floor((alignedCount / shards.length) * 100));
                return copy;
            });

            playBeep(200 + (solvedCount * 120), 'triangle', 0.06);
            solvedCount++;
        }, 300);
    };

    // Clear Custom File and Restore Tracks list
    const handleClearCustomFile = () => {
        if (fileAudioRef.current) {
            fileAudioRef.current.pause();
            fileAudioRef.current = null;
        }
        setCustomFile(null);
        setSelectedTrackId('track-1');
        setIsPlaying(false);
        stopAudioSynthesizer();
        addLog('Cleared custom media file.');
        playBeep(330, 'sawtooth', 0.1);
    };

    // Render Canvas spectrum visualizer
    const startVisualizer = () => {
        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            
            const canvas = canvasRef.current;
            const analyser = analyserRef.current;
            if (!canvas || !analyser) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const width = canvas.width;
            const height = canvas.height;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#020202';
            ctx.fillRect(0, 0, width, height);

            // Subtle matrix background grid lines
            ctx.strokeStyle = '#18181b';
            ctx.lineWidth = 1;
            for (let i = 0; i < width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, height);
                ctx.stroke();
            }
            for (let j = 0; j < height; j += 20) {
                ctx.beginPath();
                ctx.moveTo(0, j);
                ctx.lineTo(width, j);
                ctx.stroke();
            }

            // Draw frequency bars / visual spectrum
            const barWidth = (width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];

                if (isPlaying) {
                    // Futuristic glowing gradient
                    const percent = barHeight / 255;
                    const r = Math.floor(168 * percent + 39 * (1 - percent));
                    const g = Math.floor(85 * percent + 180 * (1 - percent));
                    const b = Math.floor(247 * percent + 250 * (1 - percent));
                    
                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    // Slight glow shadow
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
                } else {
                    ctx.fillStyle = '#27272a';
                    ctx.shadowBlur = 0;
                }

                // Render symmetrical high fidelity spectrum
                const drawnHeight = (barHeight / 255) * height * 0.85;
                ctx.fillRect(x, height - drawnHeight, barWidth - 1, drawnHeight);
                x += barWidth + 1;
            }
            
            // Render glowing wave overlay line for aesthetic cyber vibes
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = isPlaying ? '#10b981' : '#3f3f46';
            const sliceWidth = width * 1.0 / bufferLength;
            let wavX = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const waveY = (v * height / 3) + (height / 3);

                if (i === 0) {
                    ctx.moveTo(wavX, waveY);
                } else {
                    ctx.lineTo(wavX, waveY);
                }

                wavX += sliceWidth;
            }
            ctx.lineTo(width, height / 2);
            ctx.stroke();
        };

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        draw();
    };

    // Clean up Web Audio node processes on component dismantle
    useEffect(() => {
        return () => {
            stopAudioSynthesizer();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (audioCtxRef.current) {
                try { audioCtxRef.current.close(); } catch (e) {}
            }
        };
    }, []);

    return (
        <div id="shard-media-player-root" className="bg-[#030303] text-gray-200 border-4 border-zinc-900 rounded-3xl p-6 shadow-[10px_10px_0_0_#000] space-y-6 flex flex-col h-full font-mono relative overflow-hidden select-none">
            {/* Ambient cyber pulse decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-blue-900/10 to-transparent pointer-events-none rounded-full" />
            
            {/* Header: Identity parameters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-2xl relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-center justify-center animate-pulse">
                        <Layers className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white hover:text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                            <span>AetherOS Shard RECONSTRUCTOR</span>
                        </h2>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5">
                            Unified Soundscape Analyzer & Fragment Integration Module
                        </p>
                    </div>
                </div>
                
                {/* Hardware Spec Badges */}
                <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded font-black uppercase tracking-widest">
                        AudioCtx: {audioCtxRef.current ? 'CONNECTED' : 'STANDBY'}
                    </span>
                    <span className="text-[8px] bg-purple-950/30 border border-purple-500/30 text-purple-400 px-2.5 py-1 rounded font-black uppercase tracking-widest">
                        Core: DUAL_PASS
                    </span>
                </div>
            </div>

            {/* Media Canvas Deck & Control Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                
                {/* Left Side: Audio Screen, Controls, Upload (8 Cols) */}
                <div className="lg:col-span-8 flex flex-col space-y-4">
                    
                    {/* Visualizer Frame */}
                    <div className="bg-black border-2 border-zinc-800 rounded-2xl p-4 relative overflow-hidden flex flex-col shadow-inner">
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 border-b border-zinc-900 pb-2 mb-2 font-bold select-none">
                            <span className="flex items-center gap-1.5">
                                <Activity className={`w-3.5 h-3.5 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-zinc-650'}`} />
                                FREQUENCY SPECTRUM ANALYZER
                            </span>
                            <span className="animate-pulse">{isPlaying ? 'LIVE CONDUCTION WAVE' : 'ENGINE COLD'}</span>
                        </div>
                        
                        {/* Audio Canvas Element */}
                        <canvas 
                            ref={canvasRef} 
                            width={640} 
                            height={160} 
                            className="w-full h-32 md:h-40 rounded-xl bg-[#020202] border border-zinc-900/60 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
                        />

                        {/* Scrolling track info overlay */}
                        <div className="mt-3 bg-zinc-950/80 px-3 py-1.5 rounded-lg border border-zinc-900 flex items-center justify-between text-xs font-bold font-mono">
                            <span className="text-zinc-500 uppercase tracking-widest text-[9px]">LATTICE STREAM:</span>
                            <span className="text-cyan-400 flex-1 ml-3 truncate uppercase tracking-tight text-right">
                                {activeTrack.artist} — {activeTrack.title}
                            </span>
                        </div>
                    </div>

                    {/* Integrated Playback Console */}
                    <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 space-y-4 shadow-md">
                        
                        {/* Audio Sliders & Specs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Volume & Mute control */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] uppercase font-black text-zinc-400 tracking-wider">
                                    <span className="flex items-center gap-1">
                                        {isMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                                        Volume: {isMuted ? 'MUTED' : `${Math.round(volume * 100)}%`}
                                    </span>
                                    <button 
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="text-[9px] text-zinc-500 hover:text-white cursor-pointer hover:underline uppercase"
                                    >
                                        [Toggle Mute]
                                    </button>
                                </div>
                                <input 
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={(e) => {
                                        setVolume(parseFloat(e.target.value));
                                        if(isMuted) setIsMuted(false);
                                    }}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                />
                            </div>

                            {/* Speed / Tuning dial */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] uppercase font-black text-zinc-400 tracking-wider">
                                    <span className="flex items-center gap-1">
                                        <Sliders className="w-3.5 h-3.5 text-purple-400" />
                                        Playback Speed / Pitch: {playbackSpeed}x
                                    </span>
                                    <button 
                                        onClick={() => setPlaybackSpeed(1.0)}
                                        className="text-[9px] text-zinc-500 hover:text-white cursor-pointer hover:underline uppercase"
                                    >
                                        [Reset]
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="range"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={playbackSpeed}
                                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                                        className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                                    />
                                    <span className="text-[9px] bg-zinc-900 border border-zinc-800 px-1 rounded text-zinc-350">
                                        {playbackSpeed === 1 ? 'SL' : playbackSpeed > 1 ? 'FAST' : 'SLOW'}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Custom File uploader + Playback physical buttons */}
                        <div className="flex flex-col sm:flex-row shadow-inner items-center justify-between gap-4 border-t border-zinc-900 pt-4">
                            
                            {/* Buttons */}
                            <div className="flex items-center gap-2">
                                {isPlaying ? (
                                    <button 
                                        onClick={handlePause}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 hover:scale-102 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                                        title="Pause current stream"
                                    >
                                        <Pause className="w-4 h-4 fill-zinc-950" />
                                        <span>Pause</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handlePlay}
                                        className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 hover:scale-102 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                        title="Initialize and play stream"
                                    >
                                        <Play className="w-4 h-4 fill-zinc-950" />
                                        <span>Play Stream</span>
                                    </button>
                                )}

                                <button 
                                    onClick={handleReset}
                                    className="flex items-center justify-center p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 hover:text-white rounded-xl transition-colors cursor-pointer text-zinc-400"
                                    title="Reset audio stream pointer"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>

                                <button 
                                    onClick={handleFracture}
                                    className="flex items-center gap-1.5 px-3 py-2 border-2 border-red-500 bg-red-950/20 text-red-400 hover:bg-red-900/40 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer animate-pulse"
                                    title="Simulate network fracture to break down files into bits"
                                >
                                    <Zap className="w-4 h-4 text-red-500 fill-red-500/20" />
                                    <span>Fracture File</span>
                                </button>
                            </div>

                            {/* Drop zone uploader button */}
                            <div className="relative group overflow-hidden w-full sm:w-auto">
                                <label className="flex items-center gap-2 justify-center px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-cyan-500 text-zinc-400 hover:text-cyan-400 text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer w-full text-center">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>{customFile ? 'Change File' : 'Inject Audio File'}</span>
                                    <input 
                                        type="file" 
                                        accept="audio/*" 
                                        onChange={handleFileChange} 
                                        className="hidden" 
                                    />
                                </label>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Right Side: Track List / Metadata & Log Output (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col space-y-4">
                    
                    {/* Track library selector list */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex-1 flex flex-col min-h-[220px]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-3 flex items-center gap-1.5 select-none">
                            <Music className="w-3.5 h-3.5 text-cyan-400" /> Sonic Resonance Tracks
                        </h3>
                        
                        <div className="space-y-2 flex-1 overflow-y-auto max-h-[160px] custom-scrollbar pr-1">
                            {tracks.map(t => {
                                const selected = selectedTrackId === t.id && !customFile;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            if (customFile) handleClearCustomFile();
                                            setSelectedTrackId(t.id);
                                            setIsPlaying(false);
                                            stopAudioSynthesizer();
                                            playBeep(440, 'sine', 0.05);
                                            addLog(`Selected track: ${t.title}`);
                                        }}
                                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 block ${
                                            selected 
                                                ? 'bg-cyan-950/30 border-cyan-500/60 text-white shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                                                : 'bg-black/40 border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1 text-left">
                                            <p className="text-xs font-black uppercase truncate">{t.title}</p>
                                            <p className="text-[9px] text-zinc-500 uppercase truncate mt-0.5">{t.artist}</p>
                                        </div>
                                        <span className="text-[8px] bg-zinc-900 px-1.5 py-0.5 text-zinc-400 rounded uppercase font-bold shrink-0">
                                            {t.synthesizePattern}
                                        </span>
                                    </button>
                                );
                            })}

                            {customFile && (
                                <div className="p-2.5 bg-cyan-950/40 border-2 border-cyan-500 rounded-2xl flex items-center justify-between gap-3 font-mono animate-in fade-in duration-200">
                                    <div className="min-w-0 flex-1 text-left">
                                        <p className="text-xs font-black text-white uppercase truncate flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                                            {customFile.name}
                                        </p>
                                        <p className="text-[8px] text-cyan-400 uppercase mt-0.5 font-bold">LATTICE ENCODE SUCCESS</p>
                                    </div>
                                    <button 
                                        onClick={handleClearCustomFile}
                                        className="p-1 bg-red-950/40 border border-red-500/40 hover:bg-red-900 hover:border-red-500 text-red-500 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
                                        title="Unload custom package file"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-zinc-900 mt-3 pt-3">
                            <p className="text-[9px] text-zinc-500 uppercase leading-relaxed font-bold">
                                {customFile ? 'Custom file stream loaded. Adjust volume parameters below inside the unified gateway.' : activeTrack.description}
                            </p>
                        </div>
                    </div>

                    {/* Integrated system status logs console */}
                    <div className="bg-[#020202] border border-zinc-900 rounded-2xl p-3 h-32 flex flex-col justify-between">
                        <div className="text-[8px] uppercase font-black text-zinc-650 tracking-widest border-b border-zinc-950 pb-1 flex justify-between select-none font-bold">
                            <span>RECONSTRUCTION TELEMETRY LOG</span>
                            <span className="text-cyan-500">SYSTEM STABLE</span>
                        </div>
                        <div className="flex-1 overflow-y-auto text-[10px] text-zinc-500 font-mono space-y-1 mt-1.5 custom-scrollbar select-text selection:bg-cyan-500 selection:text-black">
                            {interactiveLog.map((log, idx) => (
                                <p key={idx} className="truncate select-text">{log}</p>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Interactive Shard Reconstruction Sandbox Module */}
            <AnimatePresence>
                {isFractured && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="bg-gradient-to-b from-red-950/20 to-red-950/90 border-4 border-red-500 rounded-2xl p-5 shadow-[0_0_40px_rgba(239,68,68,0.25)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-red-500/10 to-transparent pointer-events-none rounded-full" />
                        
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-red-500/20 pb-4 mb-4 select-none">
                            <div className="space-y-1 text-left">
                                <h3 className="text-sm font-black text-white hover:text-red-400 uppercase tracking-widest flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse fill-red-500/20" />
                                    ⚠️ ACTIVE STREAM FRACTURED: FUSION RESOLUTION SANDBOX REQUIRED
                                </h3>
                                <p className="text-[10px] text-red-400">
                                    The active audio data pipeline has suffered systemic decay. Tap the loose hexagonal shards below to reconnect, align, and restore core continuity.
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-[7px] text-zinc-400 uppercase font-black">Restoration Posture</p>
                                    <p className="text-base font-black text-red-400 leading-none mt-1">{reconstructionProgress}% Complete</p>
                                </div>
                                <button
                                    onClick={handleAutoReconstruct}
                                    className="px-3 py-1.5 bg-red-950/80 border border-red-500/50 hover:bg-emerald-600 hover:border-emerald-500 hover:text-zinc-950 text-red-400 text-[10px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer"
                                >
                                    Auto Alignment Bypass
                                </button>
                            </div>
                        </div>

                        {/* Interactive Loose Shards grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                            {shards.map((sh, idx) => {
                                return (
                                    <button
                                        key={sh.id}
                                        onClick={() => handleAlignShard(sh.id)}
                                        className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-103 cursor-pointer flex flex-col items-center justify-center gap-2 text-center group ${
                                            sh.isAligned 
                                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                                : 'bg-red-950/20 border-red-900/60 text-red-400 hover:border-red-500'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-black border border-zinc-800 flex items-center justify-center font-bold text-[10px] select-none text-zinc-400 group-hover:text-white transition-colors uppercase">
                                            {sh.isAligned ? 'OK' : `S${sh.sequence}`}
                                        </div>
                                        <div className="min-w-0 w-full text-center">
                                            <p className="text-[11px] font-black tracking-wider leading-none uppercase">{sh.hexData}</p>
                                            <p className="text-[8px] text-zinc-500 uppercase mt-1 leading-none">{sh.frequency}Hz</p>
                                        </div>
                                        <span className={`text-[6px] px-1 py-0.5 rounded uppercase font-black leading-none ${
                                            sh.isAligned ? 'bg-emerald-900 text-emerald-250' : 'bg-red-950/50 text-red-400'
                                        }`}>
                                            {sh.isAligned ? 'ALIGNED' : 'DRIFT'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Footer warning line */}
            <div className="pt-2 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center text-[9px] text-zinc-500 font-bold select-none gap-2 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                    Secure Binary Stream Protocol 0x10B2 engaged.
                </span>
                <span>Payload: 4 Core, 1 Shared Audio Buffer | Rate: 44.1Khz 24bit</span>
            </div>
        </div>
    );
};
