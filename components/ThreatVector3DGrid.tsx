import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { ThreatShard } from '../types';
import { Shield, AlertOctagon, RefreshCw, Layers, Compass, Volume2, VolumeX, Activity, Lock, Unlock, RotateCcw, Zap } from 'lucide-react';

interface AnimatedThreatVector {
    id: string;
    origin: string;
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    payloadSize: string;
    radius: number;      // Distance from center (0 to 120, where 0 is hitting core)
    angle: number;       // Angle in degrees (0 to 360)
    z: number;           // Elevated altitude in 3D (offset from flat floor, e.g. -50 to 50)
    speed: number;       // Inward drift speed per tick
    status: 'ISOLATED' | 'PURGED' | 'INCOMING';
    history: { x: number; y: number; z: number }[];
    label: string;
}

interface InfoCardProps {
    threat: AnimatedThreatVector;
    position: { x: number; y: number };
    isPinned?: boolean;
    onClose?: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({ threat, position, isPinned, onClose }) => {
    const dangerBorderColor = (() => {
        switch (threat.threatLevel) {
            case 'CRITICAL': return 'border-red-500 shadow-red-500/10 text-red-400';
            case 'HIGH': return 'border-violet-600/80 shadow-violet-600/10 text-violet-400';
            case 'MEDIUM': return 'border-indigo-500/80 shadow-indigo-500/10 text-indigo-400';
            default: return 'border-blue-500/80 shadow-blue-500/10 text-blue-400';
        }
    })();

    const levelBadgeColor = (() => {
        switch (threat.threatLevel) {
            case 'CRITICAL': return 'bg-red-500/10 text-red-400 border border-red-500/20';
            case 'HIGH': return 'bg-purple-900/10 text-purple-400 border border-purple-500/20';
            case 'MEDIUM': return 'bg-indigo-900/10 text-indigo-405 border border-indigo-500/20';
            default: return 'bg-blue-900/10 text-blue-400 border border-blue-500/20';
        }
    })();

    return (
        <div 
            id={`infocard-${threat.id}`}
            className={`absolute z-50 p-2.5 rounded-lg border bg-zinc-950/95 shadow-xl flex flex-col gap-1 transition-all duration-75 ease-out backdrop-blur-md w-52 ${isPinned ? 'pointer-events-auto' : 'pointer-events-none'} ${dangerBorderColor}`}
            style={{
                left: `${position.x + 12}px`,
                top: `${position.y + 12}px`,
            }}
        >
            <div className="flex justify-between items-center gap-1.5 border-b border-zinc-900 pb-1 flex-shrink-0">
                <span className="text-[8px] font-black font-mono text-white tracking-widest truncate">
                    VECT_{threat.id}
                </span>
                <div className="flex items-center gap-1">
                    <span className={`text-[6px] font-black uppercase px-1 py-0.5 rounded tracking-widest text-[5.5px] ${levelBadgeColor}`}>
                        {threat.threatLevel}
                    </span>
                    {isPinned && onClose && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded p-0.5 cursor-pointer ml-1 transition-colors flex items-center justify-center h-4 w-4"
                            title="Close / Unpin"
                        >
                            <svg className="w-2 h-2" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="space-y-0.5 text-[7px] font-mono leading-tight flex-1">
                <div>
                    <span className="text-zinc-500 text-[6px] block uppercase tracking-wider">Origin Node</span>
                    <span className="text-zinc-200 block truncate font-bold text-[7px]">{threat.origin}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 mt-1 border-t border-zinc-900 pt-1">
                    <div>
                        <span className="text-zinc-500 text-[6.5px] block uppercase">Proximity</span>
                        <span className="text-zinc-300 block">{Math.round(threat.radius)}% Radial</span>
                    </div>
                    <div>
                        <span className="text-zinc-500 text-[6.5px] block uppercase">Weight</span>
                        <span className="text-zinc-300 block truncate">{threat.payloadSize}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                    <div>
                        <span className="text-zinc-500 text-[6.5px] block uppercase">Altitude</span>
                        <span className="text-zinc-300 block">Z_{Math.round(threat.z)}u</span>
                    </div>
                    <div>
                        <span className="text-zinc-500 text-[6.5px] block uppercase">Status</span>
                        <span className={`block uppercase font-bold text-[6.5px] ${threat.status === 'PURGED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {threat.status}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="text-[5.5px] text-zinc-600 text-right uppercase border-t border-zinc-900/60 pt-0.5">
                Sys trace tracking
            </div>
        </div>
    );
};

interface ThreatVector3DGridProps {
    shards: ThreatShard[];
    intensity: number; // Linked with system integrity
    onNeutralize?: (id: string, details?: any) => void;
}

interface ThreatRadarStateCache {
    pitch: number;
    yaw: number;
    autoRotate: boolean;
    selectedThreatId: string | null;
    pinnedThreatId: string | null;
    activeVectors: AnimatedThreatVector[];
    frequencyMode: 'HUNTING' | 'LOCKED';
    freqValue: number;
    oscAmplitude: number;
    variance: number;
}

let cachedRadarState: ThreatRadarStateCache | null = null;

export const ThreatVector3DGrid: React.FC<ThreatVector3DGridProps> = ({ shards, intensity, onNeutralize }) => {
    // Interactive 3D Camera Controls
    const [pitch, setPitch] = useState<number>(() => {
        if (cachedRadarState) return cachedRadarState.pitch;
        const saved = localStorage.getItem('aetheros_radar_pitch');
        return saved ? Number(saved) : 30;
    });
    const [yaw, setYaw] = useState<number>(() => {
        if (cachedRadarState) return cachedRadarState.yaw;
        const saved = localStorage.getItem('aetheros_radar_yaw');
        return saved ? Number(saved) : 45;
    });
    const [autoRotate, setAutoRotate] = useState<boolean>(() => {
        if (cachedRadarState) return cachedRadarState.autoRotate;
        const saved = localStorage.getItem('aetheros_radar_autorotate');
        return saved === null ? true : saved === 'true';
    });
    const [selectedThreatId, setSelectedThreatId] = useState<string | null>(() => {
        if (cachedRadarState) return cachedRadarState.selectedThreatId;
        return localStorage.getItem('aetheros_radar_selected_threat_id') || null;
    });
    const [hoveredThreatId, setHoveredThreatId] = useState<string | null>(null);
    const [pinnedThreatId, setPinnedThreatId] = useState<string | null>(() => {
        if (cachedRadarState) return cachedRadarState.pinnedThreatId;
        return localStorage.getItem('aetheros_radar_pinned_threat_id') || null;
    });
    const [activeVectors, setActiveVectors] = useState<AnimatedThreatVector[]>(() => {
        if (cachedRadarState) return cachedRadarState.activeVectors;
        const saved = localStorage.getItem('aetheros_radar_active_vectors');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [];
            }
        }
        return [];
    });
    const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({ width: 500, height: 360 });

    useEffect(() => {
        if (!viewportRef.current) return;
        const updateSize = () => {
            if (viewportRef.current) {
                const rect = viewportRef.current.getBoundingClientRect();
                setViewportSize({ width: rect.width, height: rect.height });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const getPixelCoords = (svgX: number, svgY: number) => {
        const w = viewportSize.width;
        const h = viewportSize.height;
        
        const svgAspect = 500 / 360;
        const containerAspect = w / h;
        
        let scale = 1;
        let offsetX = 0;
        let offsetY = 0;
        
        if (containerAspect > svgAspect) {
            scale = h / 360;
            offsetX = (w - 500 * scale) / 2;
        } else {
            scale = w / 500;
            offsetY = (h - 360 * scale) / 2;
        }
        
        return {
            x: svgX * scale + offsetX,
            y: svgY * scale + offsetY
        };
    };
    
    // Cognitive Frequency Auto-Tuner & Stabilizer states
    const [frequencyMode, setFrequencyMode] = useState<'HUNTING' | 'LOCKED'>(() => {
        if (cachedRadarState) return cachedRadarState.frequencyMode;
        const saved = localStorage.getItem('aetheros_radar_frequency_mode');
        return (saved as any) || 'HUNTING';
    });
    const [freqValue, setFreqValue] = useState<number>(() => {
        if (cachedRadarState) return cachedRadarState.freqValue;
        const saved = localStorage.getItem('aetheros_radar_freq_value');
        return saved ? Number(saved) : 432.84;
    });
    const [oscAmplitude, setOscAmplitude] = useState<number>(() => {
        if (cachedRadarState) return cachedRadarState.oscAmplitude;
        const saved = localStorage.getItem('aetheros_radar_osc_amplitude');
        return saved ? Number(saved) : 0.318;
    });
    const [variance, setVariance] = useState<number>(() => {
        if (cachedRadarState) return cachedRadarState.variance;
        const saved = localStorage.getItem('aetheros_radar_variance');
        return saved ? Number(saved) : 0.114;
    });
    const [isResetting, setIsResetting] = useState<boolean>(false);
    const [resetProgress, setResetProgress] = useState<number>(0);

    // Live state persistence cache sync effect
    useEffect(() => {
        cachedRadarState = {
            pitch,
            yaw,
            autoRotate,
            selectedThreatId,
            pinnedThreatId,
            activeVectors,
            frequencyMode,
            freqValue,
            oscAmplitude,
            variance
        };
        try {
            localStorage.setItem('aetheros_radar_pitch', String(pitch));
            localStorage.setItem('aetheros_radar_yaw', String(yaw));
            localStorage.setItem('aetheros_radar_autorotate', String(autoRotate));
            
            if (selectedThreatId) {
                localStorage.setItem('aetheros_radar_selected_threat_id', selectedThreatId);
            } else {
                localStorage.removeItem('aetheros_radar_selected_threat_id');
            }
            
            if (pinnedThreatId) {
                localStorage.setItem('aetheros_radar_pinned_threat_id', pinnedThreatId);
            } else {
                localStorage.removeItem('aetheros_radar_pinned_threat_id');
            }
            
            localStorage.setItem('aetheros_radar_active_vectors', JSON.stringify(activeVectors));
            localStorage.setItem('aetheros_radar_frequency_mode', frequencyMode);
            localStorage.setItem('aetheros_radar_freq_value', String(freqValue));
            localStorage.setItem('aetheros_radar_osc_amplitude', String(oscAmplitude));
            localStorage.setItem('aetheros_radar_variance', String(variance));
        } catch (e) {
            console.error("Local storage sync error inside ThreatVector3DGrid", e);
        }
    }, [pitch, yaw, autoRotate, selectedThreatId, pinnedThreatId, activeVectors, frequencyMode, freqValue, oscAmplitude, variance]);

    // Live Auto-Tuner Frequency Modulation Effect Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (isResetting) return;

            if (frequencyMode === 'HUNTING') {
                // Wide frequency hunting range (e.g. 420.00 to 450.00 Hz)
                setFreqValue(432.0 + (Math.random() - 0.5) * 24.0);
                setOscAmplitude(prev => {
                    const target = 0.28 + Math.random() * 0.12;
                    return prev * 0.7 + target * 0.3; // smoothing
                });
                setVariance(prev => {
                    const target = 0.095 + Math.random() * 0.065;
                    return prev * 0.7 + target * 0.3; // smoothing
                });
            } else {
                // Locked to exactly integer 432 Hz
                setFreqValue(432.0);
                setOscAmplitude(prev => {
                    const target = 0.02 + Math.random() * 0.012; // drops far below 0.05%
                    return prev * 0.82 + target * 0.18; // smooth decay
                });
                setVariance(prev => {
                    const target = 0.012 + Math.random() * 0.008; // drops far below 0.05%
                    return prev * 0.82 + target * 0.18; // smooth decay
                });
            }
        }, 120);

        return () => clearInterval(interval);
    }, [frequencyMode, isResetting]);

    const handleLockFrequency = () => {
        setFrequencyMode('LOCKED');
        playSystemWarningSynth(523.25, 'sine', 0.15);
        setTimeout(() => {
            playSystemWarningSynth(659.25, 'sine', 0.12);
        }, 80);
    };

    const handleSystemHardReset = () => {
        setIsResetting(true);
        setResetProgress(0);
        setFrequencyMode('HUNTING');
        playSystemWarningSynth(110, 'sawtooth', 0.6);
        
        let progress = 0;
        const timer = setInterval(() => {
            progress += 4;
            if (progress >= 100) {
                setResetProgress(100);
                clearInterval(timer);
                setIsResetting(false);
                resetRadarVectors();
                playSystemWarningSynth(880, 'sine', 0.3);
            } else {
                setResetProgress(progress);
                if (progress % 12 === 0) {
                    playSystemWarningSynth(220 + progress * 4, 'sine', 0.05);
                }
            }
        }, 80);
    };
    
    // Viewport mouse coordinate tracking
    const viewportRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (viewportRef.current) {
            const rect = viewportRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };
    
    // Scan line animation angle
    const [scanAngle, setScanAngle] = useState<number>(0);

    // Audio Alert System State
    const [soundMuted, setSoundMuted] = useState<boolean>(false);
    const lastAlertTimeRef = useRef<number>(0);

    const playSystemWarningSynth = (frequency: number, type: OscillatorType, duration: number) => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);
            
            if (type === 'sawtooth') {
                osc.frequency.exponentialRampToValueAtTime(frequency * 0.7, ctx.currentTime + duration);
            }

            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (err) {
            console.warn("AudioContext blocked or failed:", err);
        }
    };

    // Trigger audible alarm if any active incoming threat vector breaches the core perimeter (radius <= 35)
    useEffect(() => {
        const timer = setInterval(() => {
            if (soundMuted) return;

            const breachingVectors = activeVectors.filter(
                v => v.status === 'INCOMING' && v.radius <= 35
            );

            if (breachingVectors.length === 0) return;

            const now = Date.now();
            const hasCriticalHigh = breachingVectors.some(
                v => v.threatLevel === 'CRITICAL' || v.threatLevel === 'HIGH'
            );
            
            // Adjust beep rate: faster repeat for CRITICAL/HIGH (600ms), slower for MEDIUM/LOW (1400ms)
            const alertInterval = hasCriticalHigh ? 600 : 1400;

            if (now - lastAlertTimeRef.current >= alertInterval) {
                lastAlertTimeRef.current = now;
                
                if (hasCriticalHigh) {
                    playSystemWarningSynth(880, 'sawtooth', 0.22);
                    setTimeout(() => {
                        playSystemWarningSynth(660, 'sawtooth', 0.18);
                    }, 140);
                } else {
                    playSystemWarningSynth(523.25, 'sine', 0.12);
                    setTimeout(() => {
                        playSystemWarningSynth(587.33, 'sine', 0.1);
                    }, 80);
                }
            }
        }, 100);

        return () => clearInterval(timer);
    }, [activeVectors, soundMuted]);

    // Filter states
    const [showLevels, setShowLevels] = useState<Record<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', boolean>>({
        LOW: true,
        MEDIUM: true,
        HIGH: true,
        CRITICAL: true
    });
    const [showStatuses, setShowStatuses] = useState<Record<'INCOMING' | 'PURGED' | 'ISOLATED', boolean>>({
        INCOMING: true,
        PURGED: true,
        ISOLATED: true
    });
    const [showRadarOverlay, setShowRadarOverlay] = useState<boolean>(true);
    const [criticalPulseActive, setCriticalPulseActive] = useState<boolean>(false);
    const breachedThreatIdsRef = useRef<Set<string>>(new Set());

    // Proximity state & entrance notifications for critical threat vectors inside radius 50
    useEffect(() => {
        const innerCriticals = activeVectors.filter(
            v => v.status === 'INCOMING' && 
                 (v.threatLevel === 'CRITICAL' || v.threatLevel === 'HIGH') && 
                 v.radius <= 50
        );

        if (innerCriticals.length > 0) {
            setCriticalPulseActive(true);
            
            let playedAlert = false;
            innerCriticals.forEach(v => {
                if (!breachedThreatIdsRef.current.has(v.id)) {
                    breachedThreatIdsRef.current.add(v.id);
                    playedAlert = true;
                }
            });

            if (playedAlert && !soundMuted) {
                // Play a distinctive urgent descending alert sound for inner breaching
                playSystemWarningSynth(440, 'triangle', 0.25);
                setTimeout(() => {
                    playSystemWarningSynth(330, 'triangle', 0.20);
                }, 120);
            }
        } else {
            setCriticalPulseActive(false);
        }

        // Clean up from the tracker if threat is purged or moves back out
        const activeIds = new Set(activeVectors.map(v => v.id));
        Array.from(breachedThreatIdsRef.current).forEach(id => {
            const v = activeVectors.find(item => item.id === id);
            if (!v || v.status === 'PURGED' || v.radius > 55) {
                breachedThreatIdsRef.current.delete(id);
            }
        });
    }, [activeVectors, soundMuted]);

    // Initial load and mapping of existing system shards to our interactive vectors
    useEffect(() => {
        // Map shards and populate dynamic properties if not already tracking
        setActiveVectors(prev => {
            const updated = [...prev];
            
            shards.forEach((shard, idx) => {
                const exists = updated.some(v => v.id === shard.id);
                if (!exists) {
                    const angle = 45 + idx * 135 + (Math.random() * 30);
                    const radius = 80 + idx * 25;
                    const z = shard.threatLevel === 'CRITICAL' ? 35 : shard.threatLevel === 'HIGH' ? 20 : -15;
                    
                    updated.push({
                        id: shard.id,
                        origin: shard.origin,
                        threatLevel: shard.threatLevel,
                        payloadSize: shard.payloadSize,
                        radius: radius,
                        angle: angle,
                        z: z,
                        speed: shard.threatLevel === 'CRITICAL' ? 0.6 : 0.3,
                        status: shard.status,
                        history: [],
                        label: shard.id
                    });
                } else {
                    // Update status if it changed in parent state
                    const target = updated.find(v => v.id === shard.id);
                    if (target) {
                        target.status = shard.status;
                    }
                }
            });
            
            return updated;
        });
    }, [shards]);

    // Live Frame Update Loop (inward drift of vectors & camera auto-rotation)
    useEffect(() => {
        const timer = setInterval(() => {
            // Auto Rotate
            if (autoRotate) {
                setYaw(prev => (prev + 0.4) % 360);
            }

            // Sweeper
            setScanAngle(prev => (prev + 2.5) % 360);

            // Shift incoming threats inward
            setActiveVectors(prev => {
                return prev.map(v => {
                    if (v.status === 'PURGED') {
                        // Drift away or stay static
                        return v;
                    }

                    // Dynamic math for coordinates
                    let newRadius = v.radius - v.speed;
                    
                    // If it hits the center core, reflect/bounce or wrap around
                    if (newRadius <= 12) {
                        newRadius = 110; // Respawn outside
                    }

                    // Accumulate 3D history coordinate before moving
                    const rad = (v.angle * Math.PI) / 180;
                    const x3d = v.radius * Math.cos(rad);
                    const y3d = v.radius * Math.sin(rad);
                    const z3d = v.z;

                    const nextHistory = [{ x: x3d, y: y3d, z: z3d }, ...v.history].slice(0, 10);

                    return {
                        ...v,
                        radius: newRadius,
                        history: nextHistory,
                        // Add some slight random altitude oscillation for 3D physics vibe
                        z: v.z + (Math.sin(Date.now() / 1000 + v.radius) * 0.15)
                    };
                });
            });

        }, 40);

        return () => clearInterval(timer);
    }, [autoRotate]);

    // Spawning a random threat to keep the visualization highly energetic
    const spawnThreat = () => {
        const ids = ['T-09', 'T-45', 'T-51', 'T-99', 'S-07', 'S-12'];
        const randomId = ids[Math.floor(Math.random() * ids.length)] + '_' + Math.floor(Math.random() * 1000);
        const randomOrigins = ['Anomaly_Carrier', 'Exotic_Decoupler', 'Dark_Aero_Relay', 'Bypass_Buffer', 'Synaptic_Infiltration'];
        const randomOrigin = randomOrigins[Math.floor(Math.random() * randomOrigins.length)];
        const levels: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        
        const newVector: AnimatedThreatVector = {
            id: randomId,
            origin: randomOrigin,
            threatLevel: randomLevel,
            payloadSize: `${Math.floor(Math.random() * 250) + 1}KB`,
            radius: 110,
            angle: Math.random() * 360,
            z: (Math.random() * 60) - 30, // Random height from floor
            speed: randomLevel === 'CRITICAL' ? 0.8 : randomLevel === 'HIGH' ? 0.5 : 0.3,
            status: 'INCOMING',
            history: [],
            label: randomId
        };
        
        setActiveVectors(prev => [...prev, newVector]);
    };

    // Purge specific interactive threat
    const triggerLocalPurge = (id: string) => {
        if (onNeutralize) {
            const targetVec = activeVectors.find(v => v.id === id);
            onNeutralize(id, targetVec);
        }
        
        setActiveVectors(prev => prev.map(v => {
            if (v.id === id) {
                return { ...v, status: 'PURGED' };
            }
            return v;
        }));
    };

    // Resetting threat grid vectors
    const resetRadarVectors = () => {
        setActiveVectors(shards.map((shard, idx) => ({
            id: shard.id,
            origin: shard.origin,
            threatLevel: shard.threatLevel,
            payloadSize: shard.payloadSize,
            radius: 75 + idx * 25,
            angle: 30 + idx * 120,
            z: shard.threatLevel === 'CRITICAL' ? 30 : shard.threatLevel === 'HIGH' ? 15 : -10,
            speed: shard.threatLevel === 'CRITICAL' ? 0.6 : 0.3,
            status: shard.status,
            history: [],
            label: shard.id
        })));
    };

    // D3 Scale Mapping settings representing ranges
    const radiusScale = d3.scaleLinear()
        .domain([0, 120])
        .range([0, 180]); // SVG physical boundaries

    const threatColorScale = (level: string) => {
        switch(level) {
            case 'CRITICAL': return '#ef4444'; // Pulsing Red-500
            case 'HIGH': return '#6d28d9';     // Deep Violet
            case 'MEDIUM': return '#8b5cf6';   // Purple-Violet Transition
            default: return '#3b82f6';         // Cool Blue
        }
    };

    const threatGlowScale = (level: string) => {
        switch(level) {
            case 'CRITICAL': return 'shadow-[0_0_20px_#ef4444]';
            case 'HIGH': return 'shadow-[0_0_15px_#6d28d9]';
            case 'MEDIUM': return 'shadow-[0_0_10px_#8b5cf6]';
            default: return 'shadow-[0_0_8px_#3b82f6]';
        }
    };

    // Helper for dynamic emission filter mapping
    const getEmissionFilter = (level: string) => {
        switch(level) {
            case 'CRITICAL': return 'url(#glow-critical)';
            case 'HIGH': return 'url(#glow-high)';
            case 'MEDIUM': return 'url(#glow-medium)';
            default: return 'url(#glow-low)';
        }
    };

    // 3D Isometric / Orthogonal Perspective Mapping Function
    // Maps (X_3d, Y_3d, Z_3d) floor values into the tilted/rotated camera viewport (center: cx, cy)
    const project3D = useMemo(() => {
        const pitchRad = (pitch * Math.PI) / 180;
        const yawRad = (yaw * Math.PI) / 180;
        
        const cx = 250;
        const cy = 180;

        return (x: number, y: number, z: number) => {
            // Apply rotational Yaw around Z-axis
            const xRot = x * Math.cos(yawRad) - y * Math.sin(yawRad);
            const yRot = x * Math.sin(yawRad) + y * Math.cos(yawRad);
            
            // Apply tilted Pitch around rotated horizontal Axis
            // We scale/shorten vertical dimension based on perspective depth helper
            const xProj = xRot;
            const yProj = yRot * Math.sin(pitchRad) - z * Math.cos(pitchRad);
            const depth = yRot * Math.cos(pitchRad) + z * Math.sin(pitchRad);

            // Apply standard orthogonal scale multiplier + subtle perspective squeeze
            const perspectiveFactor = 350 / (350 + depth * 0.4);
            const scale = 1.35 * perspectiveFactor;

            return {
                x: cx + xProj * scale,
                y: cy - yProj * scale,
                depth: depth
            };
        };
    }, [pitch, yaw]);

    // Build Rings grid points to path
    const buildRingPath = (rValue: number) => {
        const physicalR = radiusScale(rValue);
        const steps = 60;
        const points = [];
        
        for (let i = 0; i <= steps; i++) {
            const angleRad = (i * 2 * Math.PI) / steps;
            const x = physicalR * Math.cos(angleRad);
            const y = physicalR * Math.sin(angleRad);
            points.push(project3D(x, y, 0));
        }
        
        return d3.line<{ x: number, y: number }>()
            .x(d => d.x)
            .y(d => d.y)(points) || '';
    };

    // Radial grids line endpoints (extending from origin outward to edge)
    const radialLines = useMemo(() => {
        const lines = [];
        const divisions = 12; // every 30 degrees
        const edgeR = radiusScale(120);

        for (let i = 0; i < divisions; i++) {
            const angleRad = (i * 2 * Math.PI) / divisions;
            const xEdge = edgeR * Math.cos(angleRad);
            const yEdge = edgeR * Math.sin(angleRad);
            
            const start = project3D(0, 0, 0);
            const end = project3D(xEdge, yEdge, 0);
            
            lines.push({ start, end, angleDeg: i * 30 });
        }
        return lines;
    }, [project3D]);

    // Rendered list of projected threat points
    const threatDisplayNodes = useMemo(() => {
        return activeVectors
            .filter(v => showLevels[v.threatLevel] && showStatuses[v.status])
            .map(v => {
            const angleRad = (v.angle * Math.PI) / 180;
            const physicalR = radiusScale(v.radius);
            
            const x3d = physicalR * Math.cos(angleRad);
            const y3d = physicalR * Math.sin(angleRad);
            
            // Anchor point on the grid floor (Z=0)
            const floorProj = project3D(x3d, y3d, 0);
            
            // Actual offset projection in 3D (altitude Z)
            const hoverProj = project3D(x3d, y3d, v.z);
            
            // Past history trails
            const projectedHistory = v.history.map(point => {
                const physicalRHistory = radiusScale(Math.sqrt(point.x * point.x + point.y * point.y));
                const hAngle = Math.atan2(point.y, point.x);
                const hX = physicalRHistory * Math.cos(hAngle);
                const hY = physicalRHistory * Math.sin(hAngle);
                return project3D(hX, hY, point.z);
            });

            return {
                ...v,
                floorProj,
                hoverProj,
                projectedHistory
            };
        });
    }, [activeVectors, project3D]);

    // Build scanning sweep SVG slice
    const scanLineSweep = useMemo(() => {
        const sweepAngleRad = (scanAngle * Math.PI) / 180;
        const length = radiusScale(120);
        const start = project3D(0, 0, 0);
        const end = project3D(length * Math.cos(sweepAngleRad), length * Math.sin(sweepAngleRad), 0);
        return { start, end };
    }, [scanAngle, project3D]);

    // Build trailing scan sector wedge path
    const buildScanSectorPath = (startAngle: number, endAngle: number) => {
        const physicalR = radiusScale(120);
        const steps = 15;
        const points = [];
        
        points.push(project3D(0, 0, 0));
        
        for (let i = 0; i <= steps; i++) {
            const angleDeg = startAngle + (i * (endAngle - startAngle)) / steps;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = physicalR * Math.cos(angleRad);
            const y = physicalR * Math.sin(angleRad);
            points.push(project3D(x, y, 0));
        }
        
        points.push(project3D(0, 0, 0));
        
        return d3.line<{ x: number, y: number }>()
            .x(d => d.x)
            .y(d => d.y)(points) || '';
    };

    // Sovereign core glowing center coordinates
    const coreCoord = useMemo(() => project3D(0, 0, 0), [project3D]);

    // Count of breaching vectors approaching below 35% proximity threshold
    const breachingVectorsCount = useMemo(() => {
        return activeVectors.filter(v => v.status === 'INCOMING' && v.radius <= 35).length;
    }, [activeVectors]);

    // Currently selected threat info summary
    const selectedThreatData = activeVectors.find(v => v.id === selectedThreatId);

    // Currently hovered threat info summary
    const hoveredThreatData = useMemo(() => {
        if (!hoveredThreatId) return null;
        return threatDisplayNodes.find(v => v.id === hoveredThreatId);
    }, [hoveredThreatId, threatDisplayNodes]);

    const pinnedThreatNode = useMemo(() => {
        if (!pinnedThreatId) return null;
        return threatDisplayNodes.find(n => n.id === pinnedThreatId);
    }, [pinnedThreatId, threatDisplayNodes]);

    return (
        <div id="sovereign-3d-threat-radar" className={`flex-1 flex flex-col min-h-0 bg-zinc-950 border rounded-2xl p-4 overflow-hidden select-none relative transition-all duration-300 ${
            criticalPulseActive 
                ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                : 'border-blue-900/30'
        }`} style={{ height: '380px' }}>
            
            {/* HUD Status Header */}
            <div className="flex justify-between items-center mb-2 z-10 border-b border-zinc-900 pb-2">
                <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <div>
                        <span className="text-[10px] font-black uppercase text-emerald-400 block tracking-widest">3D INTEGRATED COVARIANT SYSTEM</span>
                        <p className="text-[8px] text-zinc-600 uppercase">Interactive D3 polar space tracking ({activeVectors.filter(v => v.status !== 'PURGED').length} Active Traces)</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={spawnThreat}
                        className="py-1 px-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 hover:border-rose-400 text-rose-300 text-[8px] font-black uppercase rounded transition-all cursor-pointer"
                    >
                        ⚡ Simulate Breach
                    </button>
                    <button
                        onClick={resetRadarVectors}
                        className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                        title="Reset grid coordinates"
                    >
                        <RefreshCw className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 relative">
                
                {/* 3D SVB Grid Viewport */}
                <div 
                    ref={viewportRef}
                    onMouseMove={handleMouseMove}
                    className="flex-1 bg-black/40 rounded-xl relative border border-zinc-900/40 flex items-center justify-center p-2"
                >
                    {isResetting && (
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center animate-in fade-in duration-300">
                            <RotateCcw className="w-10 h-10 text-red-500 animate-spin mb-4" />
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse">HARD SYSTEM RESET IN PROGRESS</h3>
                            <p className="text-[9px] text-zinc-500 uppercase mt-1 tracking-wider">Purging all unaligned threat vectors & reconditioning grid</p>
                            <div className="w-48 bg-zinc-900 border border-zinc-800 h-1.5 rounded-full overflow-hidden mt-4 mx-auto">
                                <div className="h-full bg-red-500 transition-all duration-75" style={{ width: `${resetProgress}%` }} />
                            </div>
                            <span className="text-[8px] font-mono mt-2 text-red-400 block">{resetProgress}% SUCCESS</span>
                        </div>
                    )}
                    
                    {/* Perspective Guide Lines & Labels Overlay */}
                    <div className="absolute top-2 left-2 flex flex-col gap-0.5 pointer-events-none text-[8px] font-mono text-zinc-500 bg-black/80 px-2 py-1.5 rounded border border-zinc-900/30 z-10">
                        <span className="text-zinc-400 font-bold font-sans">CAMERA ROTATION</span>
                        <span>PITCH (θ): {pitch}°</span>
                        <span>YAW (φ): {yaw}°</span>
                    </div>

                    {/* Core Breach Proximity Alert Banner overlay */}
                    {breachingVectorsCount > 0 && (
                        <div className={`absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-red-950/95 border px-2.5 py-1 rounded shadow-lg pointer-events-none transition-all duration-300 ${criticalPulseActive ? 'border-red-500 shadow-red-500/30 animate-[pulse_1.2s_infinite]' : 'border-red-500/50 shadow-red-500/15'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                            <span className="text-[7.5px] font-black text-red-200 uppercase tracking-widest font-mono">
                                {criticalPulseActive ? '⚠️ CRITICAL INNER BREACH' : `CORE BREACH: ${breachingVectorsCount} APPROACHING`}
                            </span>
                        </div>
                    )}

                    <svg className="w-full h-full min-h-[260px] max-h-[290px]" viewBox="0 0 500 360">
                        <defs>
                            {/* Dynamic Emission Glow Filters representing severity level intensity */}
                            <filter id="glow-low" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="2.5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="glow-medium" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="glow-high" x="-60%" y="-60%" width="220%" height="220%">
                                <feGaussianBlur stdDeviation="7.5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="glow-critical" x="-75%" y="-75%" width="250%" height="250%">
                                <feGaussianBlur stdDeviation="11" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>

                            {/* Glow Filters */}
                            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
                                <stop offset="80%" stopColor="#000000" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* Radial Shadow Background Glow */}
                        {coreCoord && (
                            <ellipse 
                                cx={coreCoord.x} 
                                cy={coreCoord.y} 
                                rx={radiusScale(120) * 1.3} 
                                ry={radiusScale(120) * 1.3 * Math.sin((pitch * Math.PI) / 180)} 
                                fill="url(#radar-glow)" 
                                className="pointer-events-none"
                            />
                        )}

                        {/* Concentric Circle Orbits */}
                        <g stroke="#1e293b" strokeWidth="1" fill="none" opacity="0.4">
                            <path 
                                d={buildRingPath(25)} 
                                strokeDasharray="2,3" 
                                stroke={criticalPulseActive ? "#f43f5e" : "#0ea5e9"} 
                                opacity={criticalPulseActive ? "0.8" : "0.2"} 
                                className={criticalPulseActive ? "animate-[pulse_1s_infinite] stroke-2" : ""}
                            />
                            <path 
                                d={buildRingPath(50)} 
                                stroke={criticalPulseActive ? "#ef4444" : "#1e293b"} 
                                strokeWidth={criticalPulseActive ? "2.2" : "1"}
                                opacity={criticalPulseActive ? "0.8" : "0.4"}
                                className={criticalPulseActive ? "animate-[pulse_1s_infinite]" : ""}
                            />
                            <path d={buildRingPath(75)} />
                            <path d={buildRingPath(100)} strokeWidth="1.5" stroke="#ef4444" opacity="0.3"/>
                            <path d={buildRingPath(120)} strokeWidth="2" stroke="#3b82f6" opacity="0.5" />
                        </g>

                        {/* Radial Axis Bearing lines */}
                        <g stroke="#1e293b" strokeWidth="0.8" opacity="0.3">
                            {radialLines.map((line, idx) => (
                                <line 
                                    key={idx} 
                                    x1={line.start.x} 
                                    y1={line.start.y} 
                                    x2={line.end.x} 
                                    y2={line.end.y} 
                                    stroke={line.angleDeg % 90 === 0 ? '#475569' : '#1e293b'}
                                />
                            ))}
                        </g>

                        {/* Grid Outer Labels (Degrees) */}
                        <g fill="#475569" fontSize="6px" textAnchor="middle" opacity="0.6">
                            {radialLines.map((line, idx) => {
                                if (idx % 2 !== 0) return null; // Only labels at 0, 60, 120, etc
                                return (
                                    <text 
                                        key={idx} 
                                        x={line.end.x + (line.end.x - line.start.x) * 0.08} 
                                        y={line.end.y + (line.end.y - line.start.y) * 0.08 + 2}
                                    >
                                        {line.angleDeg}°
                                    </text>
                                );
                            })}
                        </g>

                        {/* Sweeping Radar Scan Sector Overlays */}
                        {showRadarOverlay && (
                            <g style={{ mixBlendMode: 'screen' }}>
                                {/* Bright immediate wedge */}
                                <path 
                                    d={buildScanSectorPath(scanAngle - 15, scanAngle)} 
                                    fill="#10b981" 
                                    opacity="0.14"
                                    className="pointer-events-none"
                                />
                                {/* Medium faded trail */}
                                <path 
                                    d={buildScanSectorPath(scanAngle - 35, scanAngle - 15)} 
                                    fill="#10b981" 
                                    opacity="0.08"
                                    className="pointer-events-none"
                                />
                                {/* Broad distant faint trail */}
                                <path 
                                    d={buildScanSectorPath(scanAngle - 55, scanAngle - 35)} 
                                    fill="#10b981" 
                                    opacity="0.04"
                                    className="pointer-events-none"
                                />
                            </g>
                        )}

                        {/* Sweeping Radar Scan */}
                        {scanLineSweep && (
                            <line 
                                x1={scanLineSweep.start.x} 
                                y1={scanLineSweep.start.y} 
                                x2={scanLineSweep.end.x} 
                                y2={scanLineSweep.end.y} 
                                stroke="#10b981" 
                                strokeWidth="1.5" 
                                opacity="0.55" 
                                filter="url(#glow-cyan)"
                            />
                        )}

                        {/* Sovereign Core Target Center */}
                        {coreCoord && (
                            <g>
                                <circle 
                                    cx={coreCoord.x} 
                                    cy={coreCoord.y} 
                                    r="15" 
                                    fill="#090d16" 
                                    stroke="#10b981" 
                                    strokeWidth="1" 
                                    opacity="0.3"
                                />
                                <circle 
                                    cx={coreCoord.x} 
                                    cy={coreCoord.y} 
                                    r="6" 
                                    fill="#10b981" 
                                    className="animate-pulse"
                                    opacity="0.8"
                                    filter="url(#glow-cyan)"
                                />
                                <text 
                                    x={coreCoord.x} 
                                    y={coreCoord.y + 16} 
                                    textAnchor="middle" 
                                    fill="#10b981" 
                                    fontSize="6px" 
                                    fontWeight="bold"
                                >
                                    CORE_GATE
                                </text>
                            </g>
                        )}

                        {/* Render Threat Vectors representation */}
                        {threatDisplayNodes.map((n) => {
                            const isSelected = selectedThreatId === n.id;
                            const isPurged = n.status === 'PURGED';
                            const activeColor = threatColorScale(n.threatLevel);
                            
                            // Real-time radar sweep illumination check
                            const normScan = scanAngle;
                            const normThreat = (n.angle + 360) % 360;
                            const wedgeSize = 55;
                            const startAngle = (normScan - wedgeSize + 360) % 360;
                            const endAngle = normScan;
                            
                            const isSwept = showRadarOverlay && !isPurged && (
                                startAngle < endAngle 
                                    ? (normThreat >= startAngle && normThreat <= endAngle)
                                    : (normThreat >= startAngle || normThreat <= endAngle)
                            );
                            
                            return (
                                <g 
                                    key={n.id} 
                                    className="cursor-pointer" 
                                    onClick={() => {
                                        setSelectedThreatId(n.id);
                                        setPinnedThreatId(n.id);
                                    }}
                                    onMouseEnter={() => setHoveredThreatId(n.id)}
                                    onMouseLeave={() => setHoveredThreatId(null)}
                                >
                                    
                                    {/* Trail Dots in 3D Space */}
                                    {!isPurged && n.projectedHistory.map((dot, did) => (
                                        <circle 
                                            key={did}
                                            cx={dot.x}
                                            cy={dot.y}
                                            r={Math.max(1, 3.5 - did)}
                                            fill={activeColor}
                                            opacity={0.4 / (did + 1)}
                                        />
                                    ))}

                                    {/* Vertical projection drop-line from elevated Z altitude to Flat floor plane */}
                                    {!isPurged && (
                                        <line 
                                            x1={n.floorProj.x}
                                            y1={n.floorProj.y}
                                            x2={n.hoverProj.x}
                                            y2={n.hoverProj.y}
                                            stroke={activeColor}
                                            strokeWidth="1"
                                            strokeDasharray="1,2"
                                            opacity="0.5"
                                        />
                                    )}

                                    {/* Grid Base floor footprint target marker */}
                                    {!isPurged && (
                                        <ellipse 
                                            cx={n.floorProj.x} 
                                            cy={n.floorProj.y} 
                                            rx="4" 
                                            ry={4 * Math.sin((pitch * Math.PI) / 180)} 
                                            fill="none" 
                                            stroke={activeColor} 
                                            strokeWidth="0.8" 
                                            opacity="0.6"
                                        />
                                    )}

                                    {/* 3D Elevated Threat Node Sphere */}
                                    <g transform={`translate(${n.hoverProj.x}, ${n.hoverProj.y})`}>
                                        
                                        {/* Invisible wide hover target */}
                                        <circle 
                                            r="18" 
                                            fill="transparent" 
                                            className="cursor-pointer"
                                        />

                                        {/* Pulse Halo for Critical Threats */}
                                        {!isPurged && n.threatLevel === 'CRITICAL' && (
                                            <circle 
                                                r="14" 
                                                fill="none" 
                                                stroke={activeColor} 
                                                strokeWidth="1" 
                                                className="animate-ping" 
                                                style={{ animationDuration: '1.2s' }}
                                                opacity="0.4"
                                            />
                                        )}

                                        {/* Swept Radar Ping Aura */}
                                        {isSwept && (
                                            <circle 
                                                r="16" 
                                                fill="transparent"
                                                stroke="#10b981" 
                                                strokeWidth="1.5" 
                                                className="animate-ping" 
                                                style={{ animationDuration: '0.8s' }}
                                                opacity="0.8"
                                            />
                                        )}

                                        {/* Swept radar blip flare */}
                                        {isSwept && (
                                            <circle 
                                                r="10" 
                                                fill="#10b981" 
                                                opacity="0.25"
                                                filter="url(#glow-cyan)"
                                            />
                                        )}

                                        {/* Outer Circle Ring */}
                                        <circle 
                                            r={isSelected ? "8" : isSwept ? "7" : "5.5"} 
                                            fill={isPurged ? "#1e293b" : "#090d16"} 
                                            stroke={isPurged ? "#10b981" : isSwept ? "#10b981" : activeColor} 
                                            strokeWidth={isSelected ? "2" : isSwept ? "1.6" : "1.2"}
                                            filter={!isPurged ? getEmissionFilter(isSwept ? 'CRITICAL' : n.threatLevel) : undefined}
                                        />

                                        {/* Internal Core Dot */}
                                        <circle 
                                            r="2.5" 
                                            fill={isPurged ? "#10b981" : isSwept ? "#ffffff" : activeColor} 
                                        />

                                        {/* Brief textual floating label tag */}
                                        {!isPurged && (
                                            <text 
                                                y="-10" 
                                                textAnchor="middle" 
                                                fill={isSelected ? "#ffffff" : activeColor} 
                                                fontSize={isSelected ? "7px" : "5.5px"} 
                                                fontWeight={isSelected ? "bold" : "normal"}
                                                className="font-mono bg-black"
                                            >
                                                {n.id} ({Math.round(n.radius)}%)
                                            </text>
                                        )}
                                    </g>
                                </g>
                            );
                        })}

                    </svg>
                    
                    {/* Render Pinned InfoCard */}
                    {pinnedThreatNode && (() => {
                        const pixelPos = getPixelCoords(pinnedThreatNode.hoverProj.x, pinnedThreatNode.hoverProj.y);
                        return (
                            <InfoCard 
                                threat={pinnedThreatNode} 
                                position={pixelPos} 
                                isPinned={true}
                                onClose={() => setPinnedThreatId(null)}
                            />
                        );
                    })()}

                    {/* Render Floating InfoCard overlay positioned relative to mouse cursor */}
                    {hoveredThreatData && hoveredThreatId !== pinnedThreatId && (
                        <InfoCard threat={hoveredThreatData} position={mousePos} />
                    )}
                </div>

                {/* Vertical HUD Adjusters Panel & Active Selected Details */}
                <div className="w-full md:w-44 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-900 pt-2 md:pt-0 md:pl-3 min-h-0">
                    
                    {/* sliders container */}
                    <div className="space-y-3">
                        <span className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5 text-blue-500" />
                            3D CAMERA ANGLE
                        </span>
                        
                        <div>
                            <div className="flex justify-between text-[8px] text-zinc-500 mb-1">
                                <span>PITCH (TILT)</span>
                                <span>{pitch}°</span>
                            </div>
                            <input 
                                type="range" 
                                min="15" 
                                max="85" 
                                value={pitch} 
                                onChange={(e) => setPitch(Number(e.target.value))}
                                className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded outline-none" 
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-[8px] text-zinc-500 mb-1">
                                <span>YAW (ROTATE)</span>
                                <span>{yaw}°</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="360" 
                                value={yaw} 
                                onChange={(e) => {
                                    setYaw(Number(e.target.value));
                                    setAutoRotate(false); // turn off when manually drag
                                }}
                                className="w-full accent-blue-500 h-1 bg-zinc-800 rounded outline-none" 
                            />
                        </div>

                        <div className="flex items-center gap-1.5 pt-1 pb-2 border-b border-zinc-900/60 justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <button 
                                    onClick={() => setSoundMuted(!soundMuted)}
                                    type="button"
                                    className={`p-1 rounded border transition-colors cursor-pointer shrink-0 ${soundMuted ? 'bg-red-950/25 border-red-950 text-red-400' : 'bg-emerald-950/20 border-emerald-800 text-emerald-400'}`}
                                    title={soundMuted ? 'Unmute Alerts' : 'Mute Alerts'}
                                    id="audio-mute-toggle"
                                >
                                    {soundMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                </button>
                                <span className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                                    {soundMuted ? 'SND: MUTED' : 'SND: ARMED'}
                                </span>
                            </div>
                            <button
                                onClick={() => playSystemWarningSynth(523.25, 'sine', 0.15)}
                                className="px-1 py-0.5 rounded border border-zinc-800 bg-zinc-950 text-[5.5px] font-black text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer uppercase shrink-0"
                                id="test-audio-trigger"
                            >
                                Test
                            </button>
                        </div>

                        <div className="flex items-center gap-2 pt-1 pb-2 border-b border-zinc-900/60">
                            <input 
                                id="autorotate-check" 
                                type="checkbox"
                                checked={autoRotate}
                                onChange={(e) => setAutoRotate(e.target.checked)}
                                className="w-3 h-3 text-emerald-500 border-zinc-800 bg-zinc-900 rounded focus:ring-emerald-500 accent-emerald-500"
                            />
                            <label htmlFor="autorotate-check" className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider cursor-pointer select-none">
                                Orbit sweep scan
                            </label>
                        </div>

                        <div className="flex items-center gap-2 pt-1 pb-2 border-b border-zinc-900/60">
                            <input 
                                id="radar-overlay-check" 
                                type="checkbox"
                                checked={showRadarOverlay}
                                onChange={(e) => setShowRadarOverlay(e.target.checked)}
                                className="w-3 h-3 text-emerald-500 border-zinc-800 bg-zinc-900 rounded focus:ring-emerald-500 accent-emerald-500"
                            />
                            <label htmlFor="radar-overlay-check" className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider cursor-pointer select-none">
                                Visual Radar Overlay
                            </label>
                        </div>

                        {/* Cognitive Frequency Auto-Tuner & Stabilizer Panel */}
                        <div className="pt-2 border-b border-zinc-900/60 pb-2 space-y-2">
                            <span className="text-[8px] font-black text-zinc-500 uppercase flex items-center gap-1 tracking-wider">
                                <Activity className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                                FREQUENCY AUTO-TUNER
                            </span>
                            
                            <div className="bg-black/60 border border-zinc-900 rounded-lg p-2 space-y-1.5 font-mono">
                                <div className="flex justify-between items-center text-[7.5px]">
                                    <span className="text-zinc-500 uppercase">State:</span>
                                    <span className={`font-bold px-1 rounded ${frequencyMode === 'HUNTING' ? 'text-amber-400 bg-amber-950/20 animate-pulse' : 'text-emerald-400 bg-emerald-950/25'}`}>
                                        {frequencyMode}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[7.5px]">
                                    <span className="text-zinc-500 uppercase">Modulation:</span>
                                    <span className="text-white font-bold">{freqValue.toFixed(2)} Hz</span>
                                </div>
                                <div className="flex justify-between items-center text-[7.5px]">
                                    <span className="text-zinc-500 uppercase">Osc Amplitude:</span>
                                    <span className={`font-bold ${oscAmplitude > 0.05 ? 'text-amber-400' : 'text-emerald-400'}`}>{oscAmplitude.toFixed(4)}%</span>
                                </div>
                                <div className="flex justify-between items-center text-[7.5px] border-t border-zinc-900/50 pt-1">
                                    <span className="text-zinc-500 uppercase">Variance:</span>
                                    <span className={`font-bold ${variance > 0.05 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>{variance.toFixed(4)}%</span>
                                </div>
                            </div>

                            {frequencyMode === 'HUNTING' ? (
                                <button
                                    onClick={handleLockFrequency}
                                    className="w-full py-1 bg-amber-600 hover:bg-amber-500 text-black border border-amber-400 font-black text-[7.5px] uppercase rounded-md tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    id="lock-frequency-modulation"
                                >
                                    <Lock className="w-2.5 h-2.5" />
                                    Lock Modulation (432 Hz)
                                </button>
                            ) : (
                                <button
                                    onClick={() => setFrequencyMode('HUNTING')}
                                    className="w-full py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-bold text-[7.5px] uppercase rounded-md tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    id="unlock-frequency-modulation"
                                >
                                    <Unlock className="w-2.5 h-2.5" />
                                    Release Auto-Tuner
                                </button>
                            )}

                            {variance > 0.05 ? (
                                <button
                                    onClick={handleSystemHardReset}
                                    className="w-full py-1 bg-rose-950/40 hover:bg-red-600 hover:text-white border border-red-500/30 text-rose-400 font-bold text-[7.5px] uppercase rounded-md tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer animate-pulse"
                                    id="system-hard-reset"
                                >
                                    <Zap className="w-2.5 h-2.5" />
                                    Authorize Hard-Reset
                                </button>
                            ) : (
                                <div className="py-1 text-center bg-emerald-950/20 text-emerald-500 text-[6.5px] border border-emerald-500/10 font-bold rounded uppercase tracking-widest leading-none">
                                    ✅ Variance &lt; 0.05% Safe
                                </div>
                            )}
                        </div>

                        {/* Filter Sections */}
                        <div className="pt-2 border-b border-zinc-900/60 pb-2">
                            <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1.5 tracking-wider">FILTER VECTOR BY LEVEL</span>
                            <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded-md border border-zinc-900">
                                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(lvl => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setShowLevels(prev => ({ ...prev, [lvl]: !prev[lvl] }))}
                                        className={`py-1 px-1 rounded text-[6px] font-black uppercase text-left transition-all border flex items-center gap-1 cursor-pointer select-none ${
                                            showLevels[lvl]
                                                ? 'bg-zinc-800 border-zinc-700 text-white shadow-sm'
                                                : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-500'
                                        }`}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: threatColorScale(lvl) }} />
                                        <span className="truncate">{lvl}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2 border-b border-zinc-900/50 pb-2">
                            <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1.5 tracking-wider">FILTER BY VECTOR STATUS</span>
                            <div className="flex flex-col gap-1 bg-black/40 p-1 rounded-md border border-zinc-900">
                                {(['INCOMING', 'PURGED', 'ISOLATED'] as const).map(st => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => setShowStatuses(prev => ({ ...prev, [st]: !prev[st] }))}
                                        className={`w-full py-1 px-1.5 rounded text-[6.5px] font-black uppercase tracking-wider text-left transition-all border flex items-center justify-between cursor-pointer select-none ${
                                            showStatuses[st]
                                                ? 'bg-zinc-900 border-zinc-700 text-white'
                                                : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-500'
                                        }`}
                                    >
                                        <span className="truncate">{st === 'PURGED' ? 'SECURED / PURGED' : st}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${st === 'PURGED' ? 'bg-emerald-500' : st === 'ISOLATED' ? 'bg-blue-500' : 'bg-red-500 animate-pulse'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Threat detailed inspector */}
                    <div className="flex-1 flex flex-col justify-end pt-3">
                        {selectedThreatData ? (
                            <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800 space-y-2 animate-in slide-in-from-right duration-200">
                                <div className="flex justify-between items-start">
                                    <span className="text-[9px] font-black text-white">{selectedThreatData.id}</span>
                                    <span 
                                        className="text-[6px] font-bold px-1.5 py-0.5 rounded border uppercase"
                                        style={{ 
                                            borderColor: threatColorScale(selectedThreatData.threatLevel), 
                                            color: threatColorScale(selectedThreatData.threatLevel),
                                            backgroundColor: `${threatColorScale(selectedThreatData.threatLevel)}10`
                                        }}
                                    >
                                        {selectedThreatData.threatLevel}
                                    </span>
                                </div>
                                <div className="space-y-1 text-[7px] text-zinc-400 font-mono">
                                    <p className="truncate"><span className="text-zinc-500 text-[6px]">ORIG:</span> {selectedThreatData.origin}</p>
                                    <p><span className="text-zinc-500 text-[6px]">DIST:</span> {Math.round(selectedThreatData.radius)}% Radial</p>
                                    <p><span className="text-zinc-500 text-[6px]">SIZE:</span> {selectedThreatData.payloadSize}</p>
                                    <p><span className="text-zinc-500 text-[6px]">STATUS:</span> {selectedThreatData.status}</p>
                                </div>
                                {selectedThreatData.status !== 'PURGED' ? (
                                    <button
                                        onClick={() => triggerLocalPurge(selectedThreatData.id)}
                                        className={`w-full py-1.5 text-[8px] font-black uppercase rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                            (selectedThreatData.threatLevel === 'CRITICAL' || selectedThreatData.threatLevel === 'HIGH')
                                                ? 'bg-red-600 hover:bg-red-500 text-white border-2 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)] hover:shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse'
                                                : 'bg-red-950/40 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-400 text-[7px]'
                                        }`}
                                        id="neutralize-vector-button"
                                    >
                                        <Shield className="w-2.5 h-2.5" />
                                        Neutralize Vector
                                    </button>
                                ) : (
                                    <div className="py-1 text-center bg-emerald-950/20 text-emerald-400 text-[7px] font-black uppercase rounded border border-emerald-500/10">
                                        SECURED
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-2.5 text-center border-2 border-dashed border-zinc-900 rounded-lg text-zinc-600 text-[8px] uppercase">
                                <AlertOctagon className="w-4 h-4 mx-auto mb-1 opacity-20" />
                                Select Node to Investigate
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
