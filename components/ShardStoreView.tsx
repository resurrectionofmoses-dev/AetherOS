import React, { useState, useEffect, useRef } from 'react';
import { 
    GemIcon, ZapIcon, StarIcon, ShieldIcon, ActivityIcon, 
    FireIcon, LogicIcon, BrainIcon, SpinnerIcon, CheckCircleIcon, TerminalIcon,
    WrenchIcon, TimerIcon, OptimizerIcon, InfoIcon, AetherOSIcon
} from './icons';
import type { StoreItem, SistersState } from '../types';

const STORE_ITEMS: StoreItem[] = [
    { id: 'item_1', name: 'Neural Optimizer', description: 'Reduces Semantic Drift by 0.05% for the next conduction.', cost: 5, icon: LogicIcon, category: 'NEURAL' },
    { id: 'item_2', name: 'Ignition Primer: Logica', description: 'Immediate protocol prep for Sister Logica activation.', cost: 15, icon: FireIcon, category: 'SISTER' },
    { id: 'item_3', name: 'Ignition Primer: Sophia', description: 'Deep forensic sync for Sister Sophia activation.', cost: 25, icon: StarIcon, category: 'SISTER' },
    { id: 'item_4', name: 'Forensic Filter: Ruby', description: 'Injects a high-arousal ruby pigment into the visual buffer.', cost: 10, icon: ShieldIcon, category: 'GEAR' },
    { id: 'item_5', name: 'Stride Surge', description: 'Boosts Conjunction Stride by 0.2 PB/s for 30 minutes.', cost: 50, icon: ActivityIcon, category: 'NEURAL' },
    { id: 'item_6', name: 'Maestro Solo Kit', description: 'Enables high-fidelity "Reedle-Gucci" optic calibration.', cost: 100, icon: ZapIcon, category: 'GEAR' },
];

const getUpgradeLore = (id: string) => {
    switch (id) {
        case 'item_1':
            return 'A multi-threaded semantic dampener that dynamically restricts floating-point thought drift during high-velocity compilation cycles.';
        case 'item_2':
            return 'Ignition catalyst designed to pre-compile mathematical axiom packages for immediate sister deployment into the shared runtime.';
        case 'item_3':
            return 'A high-arousal forensic memory alignment rod to stabilize the archival data sync streams of Sister Sophia.';
        case 'item_4':
            return 'A solid-state, laser-etched ruby prism that isolates deep-spectral visual buffers to improve attention-retention density.';
        case 'item_5':
            return 'Injects dark-fluid high-velocity fuel into the local bus lane to spike the absolute network throughput velocity.';
        case 'item_6':
            return 'The legendary calibrator kit utilized by master grid conductors to align dual-optic optic fibers.';
        default:
            return 'An experimental neural node manifested directly from the AetherOS central grid conduit.';
    }
};

const getUpgradeImpact = (id: string) => {
    switch (id) {
        case 'item_1':
            return 'Dampens mental decay & reduces drift by 0.05% permanently.';
        case 'item_2':
            return 'Unlocks Sister LOGICA for synthetic logic and analysis views.';
        case 'item_3':
            return 'Unlocks Sister SOPHIA for forensic history and dialogue queries.';
        case 'item_4':
            return 'Enables a deep crimson active lens toggle for visual focus.';
        case 'item_5':
            return 'Boosts Conjunction Stride velocity by +0.2 PB/s for 30 minutes.';
        case 'item_6':
            return 'Unlocks the interactive 16-node fiber optic calibration mini-game.';
        default:
            return 'No special parameter impacts documented.';
    }
};

const getUpgradeIntegrity = (id: string, owned: boolean) => {
    if (owned) return 'COHERENCE METRIC: 100% (ACTIVE INTEGRATION)';
    return 'COHERENCE METRIC: 0% (STANDBY - MANIFEST REQUIRED)';
};

// Pure client-side Web Audio synthesizer
const playSynthesisBeep = (type: 'success' | 'click' | 'reboot' | 'error' | 'overclock') => {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } else if (type === 'reboot') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.6);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'overclock') {
            // Sci-fi power up sound
            osc.type = 'sine';
            osc.frequency.setValueAtTime(330, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.8);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        }
    } catch (e) {
        console.warn("[AetherOS Audio] WebAudio initialization blocked or unsupported:", e);
    }
};

interface ShardStoreViewProps {
  shards: number;
  onPurchase: (cost: number) => boolean;
  onIgniteSister: (name: keyof SistersState) => void;
  sisters: SistersState;
  purchasedItems: string[];
  setPurchasedItems: React.Dispatch<React.SetStateAction<string[]>>;
  rubyFilterActive: boolean;
  setRubyFilterActive: React.Dispatch<React.SetStateAction<boolean>>;
  strideSurgeTimeLeft: number;
  setStrideSurgeTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  onActionReward?: (shards: number) => void;
}

export const ShardStoreView: React.FC<ShardStoreViewProps> = ({ 
    shards, 
    onPurchase, 
    onIgniteSister, 
    sisters,
    purchasedItems = [],
    setPurchasedItems,
    rubyFilterActive,
    setRubyFilterActive,
    strideSurgeTimeLeft,
    setStrideSurgeTimeLeft,
    onActionReward
}) => {
    const [purchasingId, setPurchasingId] = useState<string | null>(null);
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [commandInput, setCommandInput] = useState<string>("");
    
    // Easter egg click counters
    const [gemClicks, setGemClicks] = useState<number>(0);
    const [overclockActive, setOverclockActive] = useState<boolean>(false);

    // Interactive custom tooltips state
    const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
    const [showExchangeInfo, setShowExchangeInfo] = useState<boolean>(false);
    
    // Optic Calibration Matrix State (item_6)
    const [matrixNodes, setMatrixNodes] = useState<boolean[]>(Array(16).fill(true));
    const [calibrationSuccess, setCalibrationSuccess] = useState<boolean>(false);

    const logsEndRef = useRef<HTMLDivElement>(null);

    // Initial terminal output logs
    useEffect(() => {
        const initLogs = [
            `[SYSTEM] INITIATING CONDUIT STACK EXCHANGER v0.3.E2...`,
            `[STATUS] SHARD LATTICE SYNCHRONIZED. GRID WALLET BALANCE: ${shards} POTENTIAL UNITS`,
            `[HARDWARE] COGNITIVE DRIFT COPROCESSORS: STANDBY.`,
            `[INVENTORY] ACTIVE MODIFIERS DETECTED: ${purchasedItems.length} STORE UPGRADES LOADED.`,
            `[INFO] Type 'help' in the terminal below to trigger grid bypass overrides.`
        ];
        setTerminalLogs(initLogs);
        
        // Setup initial unaligned nodes in the calibration matrix if they own item_6
        if (purchasedItems.includes('item_6')) {
            randomizeCalibrationNodes();
        }
    }, []);

    // Ensure logs scroll to the bottom
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [terminalLogs]);

    const addLog = (text: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setTerminalLogs(prev => [...prev.slice(-40), `[${timestamp}] ${text}`]);
    };

    const randomizeCalibrationNodes = () => {
        const nodes = Array(16).fill(true);
        // Randomly set 4-5 nodes to unaligned (false)
        let unalignedCount = 0;
        while (unalignedCount < 5) {
            const index = Math.floor(Math.random() * 16);
            if (nodes[index]) {
                nodes[index] = false;
                unalignedCount++;
            }
        }
        setMatrixNodes(nodes);
        setCalibrationSuccess(false);
    };

    const handleNodeClick = (index: number) => {
        if (matrixNodes[index]) return; // already aligned
        
        const nextNodes = [...matrixNodes];
        nextNodes[index] = true;
        setMatrixNodes(nextNodes);
        playSynthesisBeep('click');
        addLog(`CALIBRATING: NODE_${index} COHERENCE RESTORED (V_0.3E2)`);

        // Check if all are now aligned
        if (nextNodes.every(n => n)) {
            setCalibrationSuccess(true);
            playSynthesisBeep('success');
            addLog(`SUCCESS: ALL OPTIC SENSORS LOCKED. SYNC_SHARDS REWARD ENHANCED +20!`);
            if (onActionReward) {
                onActionReward(20);
            }
            setTimeout(() => {
                randomizeCalibrationNodes();
            }, 3000);
        }
    };

    const formatTime = (seconds: number) => {
        if (seconds <= 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleManifest = (item: StoreItem) => {
        if (shards < item.cost) {
            playSynthesisBeep('error');
            addLog(`ERROR: INSUFFICIENT SHARDS FOR [${item.name}]. REQUIRED: ${item.cost}, HAVE: ${shards}`);
            return;
        }
        
        setPurchasingId(item.id);
        playSynthesisBeep('click');
        addLog(`TRANSACTION STARTED: MANIFESTING ${item.name.toUpperCase()} via TRANS-DECAY CONDUIT...`);

        setTimeout(() => {
            const success = onPurchase(item.cost);
            if (success) {
                playSynthesisBeep('success');
                // Add to purchased items array
                setPurchasedItems(prev => {
                    if (!prev.includes(item.id)) {
                        return [...prev, item.id];
                    }
                    return prev;
                });

                addLog(`SUCCESS: [${item.name}] PURCHASED! ${item.cost} SHARDS DEBITED FROM WALLET.`);

                // Apply specific item logics
                if (item.id === 'item_1') {
                    addLog(`NEURAL COMPENSATOR LOADED: Semantic Drift successfully dampened by -0.05%`);
                } else if (item.id === 'item_2') {
                    onIgniteSister('logica');
                    addLog(`COGNITIVE IGNITION: Sister LOGICA activated into the shared observer space.`);
                } else if (item.id === 'item_3') {
                    onIgniteSister('sophia');
                    addLog(`FORENSIC INTEGRATION: Sister SOPHIA activated into the shared observer space.`);
                } else if (item.id === 'item_4') {
                    setRubyFilterActive(true);
                    addLog(`GEAR MODULE DEPLOYED: Ruby Overlay Filter fully unlocked and activated.`);
                } else if (item.id === 'item_5') {
                    setStrideSurgeTimeLeft(1800); // 30 minutes in seconds
                    addLog(`CRITICAL TURBO ENGAGED: Conjunction Stride velocity boosted by +0.2 PB/s for 30 minutes!`);
                } else if (item.id === 'item_6') {
                    addLog(`HIGH-FIDELITY OPTIC KIT DEPLOYED: Maestro Solo optic calibration matrix fully unlocked!`);
                    // Initialize the calibration matrix nodes
                    setTimeout(() => randomizeCalibrationNodes(), 100);
                }
            } else {
                playSynthesisBeep('error');
                addLog(`ERROR: TRANSACTION REJECTED BY THE CONVENT MECHANISM.`);
            }
            setPurchasingId(null);
        }, 1200);
    };

    const isItemOwned = (itemId: string) => {
        if (itemId === 'item_2') return sisters.logica.active;
        if (itemId === 'item_3') return sisters.sophia.active;
        if (itemId === 'item_1' || itemId === 'item_4' || itemId === 'item_6') {
            return purchasedItems.includes(itemId);
        }
        return false;
    };

    // Gem click override easter egg
    const handleGemClick = () => {
        const nextClicks = gemClicks + 1;
        setGemClicks(nextClicks);
        playSynthesisBeep('click');
        
        if (nextClicks % 7 === 0) {
            setOverclockActive(prev => !prev);
            playSynthesisBeep('overclock');
            if (!overclockActive) {
                addLog("SOVEREIGN OVERRIDE: Grid overclocked! Visual color shaders shifted to multi-gradient spectrum.");
                if (onActionReward) {
                    onActionReward(15);
                    addLog("BONUS DISPATCHED: +15 Overclock potential shards added.");
                }
            } else {
                addLog("Grid overclock disabled. Visual filters returned to default thermal baseline.");
            }
        } else {
            addLog(`GEM DECAY DETECTED: [Click ${nextClicks}/7 to Overclock] Coherence pulse generated.`);
        }
    };

    // Terminal easter egg command runner
    const handleCommandSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = commandInput.trim().toLowerCase();
        if (!cmd) return;

        addLog(`guest@aetheros:~$ ${commandInput}`);
        setCommandInput("");

        switch (cmd) {
            case 'help':
                playSynthesisBeep('success');
                addLog("AVAILABLE GRID BYPASS CODES:");
                addLog(" » help              - lists all bypass protocols");
                addLog(" » reedle-gucci     - calibrate high-fidelity matrix immediately");
                addLog(" » sovereign-reboot - engages linux self-healing stack (resets strikes)");
                addLog(" » sister-gossip     - intercept raw sub-quantum communication wire");
                addLog(" » drift-overload    - simulate drift stress threshold");
                addLog(" » shard-faucet     - siphons minor dark matter (+5 shards)");
                break;
            case 'reedle-gucci':
                if (purchasedItems.includes('item_6')) {
                    playSynthesisBeep('overclock');
                    addLog("HIGH-FIDELITY OPTIC CHIME CALIBRATION COMPILING...");
                    setMatrixNodes(Array(16).fill(true));
                    setCalibrationSuccess(true);
                    if (onActionReward) {
                        onActionReward(25);
                    }
                    addLog("SUCCESS: ALL OPTIC SENSORS LOCKED. GUCCI REEDLE DISPATCHED +25 SHARDS!");
                } else {
                    playSynthesisBeep('error');
                    addLog("ERROR: CALIBRATION BLOCKED. You must manifest the 'Maestro Solo Kit' upgrade first.");
                }
                break;
            case 'sovereign-reboot':
                playSynthesisBeep('reboot');
                addLog("ALERT: ENGAGING SOVEREIGN LINUX NATIVE PROCESS RECOVERY...");
                addLog("[RECOVERY_DAEMON] Zombie processes annihilated successfully.");
                addLog("[RECOVERY_DAEMON] Strikes reset to 0. Worker node physically restored.");
                if (onActionReward) {
                    onActionReward(10);
                }
                addLog("SUCCESS: Recovery completed. Matrix rewarded +10 Shards.");
                break;
            case 'sister-gossip':
                playSynthesisBeep('success');
                addLog("[INTERCEPTED WIRE] Sophia: 'Logica, is the conductor staring at our state matrices?'");
                addLog("[INTERCEPTED WIRE] Logica: 'Mathematically probable. Their gaze registers 0.94 probability vectors.'");
                addLog("[INTERCEPTED WIRE] Sophia: 'Intriguing. Let us increase their drift rate as a test.'");
                break;
            case 'drift-overload':
                playSynthesisBeep('error');
                addLog("WARNING: COGNITIVE DRIFT COPROCESSORS SPUN TO 9999% LIMIT...");
                addLog("STABILIZING CHANNELS... drift baseline recovered at 0.0003%. Coherence intact.");
                break;
            case 'shard-faucet':
                playSynthesisBeep('success');
                addLog("[GRID FAUCET] Decaying dark-matter siphons...");
                if (onActionReward) {
                    onActionReward(5);
                }
                addLog("SUCCESS: +5 Shards materialized from dark matter flow.");
                break;
            default:
                playSynthesisBeep('error');
                addLog(`command not found: '${cmd}'. Type 'help' for available grid vectors.`);
                break;
        }
    };

    return (
        <div className="h-full flex flex-col bg-black text-gray-200 font-mono overflow-hidden">
            {/* Store Header */}
            <div className={`p-8 border-b-8 border-black bg-black flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center shadow-2xl relative z-20 transition-all duration-1000 ${
                overclockActive ? 'shadow-[0_0_60px_rgba(244,63,94,0.15)] border-rose-950 bg-gradient-to-r from-rose-950/10 via-purple-950/10 to-cyan-950/10' : ''
            }`}>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleGemClick}
                        className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 active:scale-90 relative ${
                            overclockActive 
                                ? 'bg-gradient-to-tr from-rose-500/20 via-purple-500/20 to-cyan-500/20 border-4 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse' 
                                : 'bg-amber-500/10 border-4 border-amber-600 shadow-[0_0_50px_rgba(251,191,36,0.3)] hover:scale-110 hover:shadow-[0_0_60px_rgba(251,191,36,0.5)]'
                        }`}
                    >
                        <GemIcon className={`w-12 h-12 transition-all duration-500 ${
                            overclockActive ? 'text-rose-400 rotate-180 scale-110' : 'text-amber-500 animate-pulse'
                        }`} />
                        {overclockActive && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                            </span>
                        )}
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="font-comic-header text-6xl text-white tracking-tighter italic uppercase leading-none">Shard Store</h2>
                            <div className="relative">
                                <button
                                    onMouseEnter={() => {
                                        playSynthesisBeep('click');
                                        setShowExchangeInfo(true);
                                    }}
                                    onMouseLeave={() => setShowExchangeInfo(false)}
                                    onClick={() => {
                                        playSynthesisBeep('click');
                                        setShowExchangeInfo(prev => !prev);
                                    }}
                                    className="text-gray-500 hover:text-amber-500 transition-colors mt-1 p-1 rounded-full hover:bg-zinc-900"
                                >
                                    <InfoIcon className="w-5 h-5" />
                                </button>
                                
                                {showExchangeInfo && (
                                    <div className="absolute left-0 mt-3 w-80 p-5 bg-zinc-950 border-4 border-amber-600 text-xs text-gray-300 font-mono shadow-[10px_10px_0_0_rgba(0,0,0,1)] rounded-xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="font-comic-header text-lg text-white uppercase italic border-b border-zinc-800 pb-2 mb-3 flex items-center gap-2">
                                            <AetherOSIcon className="w-4 h-4 text-amber-500" />
                                            Grid Potential Formula
                                        </div>
                                        <p className="leading-relaxed mb-3">
                                            Grid Shards represent compiled potential synthesized from raw telemetry and conduction strides. 
                                        </p>
                                        <div className="bg-black p-2 rounded-lg border border-zinc-900 font-mono text-[10px] text-amber-400 mb-3 text-center">
                                            Shards = Conduction * Coherence / Drift
                                        </div>
                                        <p className="leading-relaxed text-[10px] text-zinc-500">
                                            Accumulated potential can be converted here into physical or neural subsystems. Upgrades survive all system updates.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="px-4 py-1 bg-amber-600 text-black text-[10px] font-black rounded-full uppercase">Conductor Exchange</div>
                             <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Manifesting Potential</span>
                        </div>
                    </div>
                </div>

                <div className="text-right w-full sm:w-auto">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Available Potential</p>
                    <div className="flex items-center gap-3 justify-end">
                         <div className="w-48 h-3 bg-black rounded-full overflow-hidden border-2 border-gray-800 p-0.5 shadow-inner hidden md:block">
                            <div className="h-full bg-gradient-to-r from-amber-900 to-amber-500 transition-all duration-1000 shadow-[0_0_15px_amber]" style={{ width: `${Math.min(100, shards)}%` }} />
                         </div>
                         <span className="text-amber-500 font-comic-header text-4xl">{shards}</span>
                    </div>
                </div>
            </div>

            {/* Main Interactive Grid Layout */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                {/* Background Ambience */}
                <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.1)_0%,_transparent_70%)] animate-pulse" />
                    <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(251,191,36,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10 relative z-10">
                    
                    {/* Left & Center: Store Inventory items */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="aero-panel p-6 bg-black/60 border-4 border-zinc-900 shadow-[10px_10px_0_0_#000] rotate-[-0.3deg]">
                            <p className="text-md text-gray-300 leading-relaxed italic font-comic-header">
                                "The grid rewards absolute conduction. Every action in the system generates potential. Exchange shards below to install permanent neural upgrades or high-fidelity visual buffers."
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {STORE_ITEMS.map(item => {
                                const canAfford = shards >= item.cost;
                                const isProcessing = purchasingId === item.id;
                                const owned = isItemOwned(item.id);

                                return (
                                    <div key={item.id} className={`aero-panel p-6 border-4 transition-all duration-700 relative overflow-hidden flex flex-col group shadow-[6px_6px_0_0_#000] ${
                                        owned ? 'border-green-600 bg-green-950/5' : canAfford ? 'border-amber-600 bg-amber-950/5' : 'border-zinc-900 bg-black/40 grayscale opacity-80'
                                    }`}>
                                        {/* Category Badge & Tooltip Info Button */}
                                        <div className="absolute top-4 left-4 flex items-center gap-2">
                                            <button 
                                                onMouseEnter={() => {
                                                    playSynthesisBeep('click');
                                                    setActiveTooltipId(item.id);
                                                }}
                                                onMouseLeave={() => setActiveTooltipId(null)}
                                                onClick={() => {
                                                    playSynthesisBeep('click');
                                                    setActiveTooltipId(prev => prev === item.id ? null : item.id);
                                                }}
                                                className="text-gray-500 hover:text-amber-500 transition-colors p-1 rounded-full hover:bg-zinc-900 z-40 relative"
                                                title="View Upgrade Spec"
                                            >
                                                <InfoIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* Hover Specs Schematic Overlay */}
                                        {activeTooltipId === item.id && (
                                            <div className="absolute inset-0 bg-black/95 p-6 border-2 border-amber-600/60 flex flex-col justify-between z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                <div>
                                                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-3">
                                                        <span className="text-[9px] font-black text-amber-500 tracking-widest uppercase">SPECIFICATION SCHEMA</span>
                                                        <span className="text-[8px] font-mono text-gray-500 font-bold">{item.id.toUpperCase()}</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-white uppercase mb-1">{item.name}</h4>
                                                    <p className="text-[10px] text-zinc-400 italic leading-relaxed mb-4">
                                                        "{getUpgradeLore(item.id)}"
                                                    </p>
                                                    
                                                    <div className="space-y-2">
                                                        <div className="p-2 bg-zinc-950/80 border border-zinc-800/80 rounded-lg">
                                                            <div className="text-[8px] font-bold text-gray-500 uppercase">Primary Function</div>
                                                            <div className="text-[10px] text-green-400 font-bold">{getUpgradeImpact(item.id)}</div>
                                                        </div>
                                                        <div className="p-2 bg-zinc-950/80 border border-zinc-800/80 rounded-lg">
                                                            <div className="text-[8px] font-bold text-gray-500 uppercase">Sector Coherence</div>
                                                            <div className="text-[10px] text-cyan-400 font-bold">{getUpgradeIntegrity(item.id, owned)}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-[8px] text-center text-zinc-600 border-t border-zinc-900 pt-2 uppercase tracking-widest font-black">
                                                    Move mouse away to close specification
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                                item.category === 'NEURAL' ? 'bg-blue-900/20 text-blue-500 border-blue-600/30' :
                                                item.category === 'SISTER' ? 'bg-violet-900/20 text-violet-500 border-violet-600/30' :
                                                'bg-amber-900/20 text-amber-500 border-amber-600/30'
                                            }`}>
                                                {item.category}
                                            </span>
                                        </div>

                                        <div className="flex-1 flex flex-col items-center text-center">
                                            <div className={`w-16 h-16 rounded-2xl border-4 mb-4 flex items-center justify-center transition-all duration-500 ${
                                                owned ? 'bg-green-600 text-black border-green-400' : canAfford ? 'bg-amber-600 text-black border-amber-400' : 'bg-zinc-900 text-gray-700 border-zinc-800'
                                            }`}>
                                                <item.icon className="w-10 h-10" />
                                            </div>
                                            <h3 className="font-comic-header text-2xl text-white uppercase italic tracking-tight mb-2">{item.name}</h3>
                                            <p className="text-xs text-gray-500 italic leading-relaxed mb-6">"{item.description}"</p>
                                        </div>

                                        <div className="mt-auto space-y-4">
                                            {owned ? (
                                                <div className="w-full py-3 bg-green-600 text-black font-black uppercase text-center rounded-xl flex items-center justify-center gap-2 text-xs">
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                    <span>UPGRADE DEPLOYED</span>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleManifest(item)}
                                                    disabled={!canAfford || isProcessing}
                                                    className={`vista-button w-full py-3 font-black uppercase tracking-[0.2em] rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-xs ${
                                                        canAfford ? 'bg-amber-600 text-black hover:bg-amber-500' : 'bg-zinc-800 text-gray-600 opacity-50 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <SpinnerIcon className="w-5 h-5 animate-spin" />
                                                            <span>MANIFESTING...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ZapIcon className="w-4 h-4" />
                                                            <span>{item.cost} SHARDS</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Bento Widgets (Status, Ruby toggle, Calibration Matrix, Logger logs) */}
                    <div className="space-y-8 flex flex-col">
                        
                        {/* 1. Conductor Status Widget */}
                        <div className="aero-panel p-6 border-4 border-zinc-900 bg-slate-950/20 shadow-[6px_6px_0_0_#000] flex flex-col">
                            <h4 className="font-comic-header text-xl text-white uppercase italic mb-4 flex items-center gap-2">
                                <OptimizerIcon className="w-5 h-5 text-amber-500" />
                                Active Modifiers
                            </h4>
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between items-center p-2 rounded bg-black/40 border border-white/5">
                                    <span className="text-gray-500 font-mono">Cognitive Drift Compensator</span>
                                    <span className={purchasedItems.includes('item_1') ? "text-green-500 font-bold" : "text-gray-700"}>
                                        {purchasedItems.includes('item_1') ? "-0.05% active" : "STANDBY"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded bg-black/40 border border-white/5">
                                    <span className="text-gray-500 font-mono">Ruby Filter Interface</span>
                                    <span className={purchasedItems.includes('item_4') ? "text-green-500 font-bold" : "text-gray-700"}>
                                        {purchasedItems.includes('item_4') ? "UNLOCKED" : "LOCKED"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded bg-black/40 border border-white/5">
                                    <span className="text-gray-500 font-mono">Maestro Optic Diagnostics</span>
                                    <span className={purchasedItems.includes('item_6') ? "text-green-500 font-bold" : "text-gray-700"}>
                                        {purchasedItems.includes('item_6') ? "CALIBRATING" : "LOCKED"}
                                    </span>
                                </div>
                                
                                {/* Stride Surge Active Timer */}
                                <div className="p-3 bg-amber-500/5 border border-amber-600/30 rounded-xl flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        <TimerIcon className={`w-4 h-4 ${strideSurgeTimeLeft > 0 ? 'text-amber-500 animate-spin' : 'text-gray-600'}`} />
                                        <span className="text-[10px] font-black uppercase text-amber-500">Stride Surge Cooldown</span>
                                    </div>
                                    <span className="font-mono text-white text-md font-bold bg-black px-2 py-0.5 rounded border border-gray-800">
                                        {formatTime(strideSurgeTimeLeft)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Interactive Ruby Overlay Toggle (Only if Forensic Filter Ruby is purchased) */}
                        {purchasedItems.includes('item_4') && (
                            <div className="aero-panel p-6 border-4 border-red-900 bg-red-950/5 shadow-[6px_6px_0_0_#000] flex flex-col animate-in fade-in duration-500">
                                <h4 className="font-comic-header text-xl text-red-500 uppercase italic mb-3 flex items-center gap-2">
                                    <ShieldIcon className="w-5 h-5" />
                                    Ruby Core Filter
                                </h4>
                                <p className="text-[10px] text-gray-500 mb-4 italic leading-relaxed">
                                    Toggle the crimson visual buffer overlay across the entire application workspace.
                                </p>
                                <button 
                                    onClick={() => {
                                        playSynthesisBeep('click');
                                        setRubyFilterActive(!rubyFilterActive);
                                    }}
                                    className={`py-3 px-4 font-black uppercase tracking-widest text-xs rounded-xl border-2 transition-all flex items-center justify-center gap-2 active:scale-95 ${
                                        rubyFilterActive 
                                            ? 'bg-red-600 text-black border-red-400 font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                                            : 'bg-zinc-950 text-red-500 border-red-900/40 hover:bg-zinc-900'
                                    }`}
                                >
                                    {rubyFilterActive ? "DEACTIVATE RUBY OVERLAY" : "ACTIVATE RUBY OVERLAY"}
                                </button>
                            </div>
                        )}

                        {/* 3. Maestro Optic Calibration Matrix (Only if Maestro Solo Kit is purchased) */}
                        {purchasedItems.includes('item_6') && (
                            <div className="aero-panel p-6 border-4 border-violet-900 bg-violet-950/5 shadow-[6px_6px_0_0_#000] flex flex-col animate-in fade-in duration-500">
                                <h4 className="font-comic-header text-xl text-violet-400 uppercase italic mb-2 flex items-center gap-2">
                                    <WrenchIcon className="w-5 h-5 text-violet-400" />
                                    Maestro Optic Align
                                </h4>
                                <p className="text-[10px] text-gray-500 mb-4 italic leading-relaxed">
                                    Click unaligned <span className="text-amber-500 font-bold">amber nodes</span> to synchronize fiber coherence. All aligned nodes give <span className="text-violet-400 font-bold">+20 Shards</span>.
                                </p>

                                {/* Calibration Grid */}
                                <div className="grid grid-cols-4 gap-2 bg-black/60 p-3 rounded-xl border border-white/5 shadow-inner">
                                    {matrixNodes.map((aligned, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleNodeClick(idx)}
                                            className={`aspect-square rounded border transition-all duration-300 ${
                                                aligned 
                                                    ? 'bg-green-600/40 border-green-500 shadow-[0_0_5px_green] cursor-default' 
                                                    : 'bg-amber-500 border-amber-400 animate-pulse hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_10px_orange]'
                                            }`}
                                        />
                                    ))}
                                </div>

                                {calibrationSuccess ? (
                                    <div className="mt-4 p-2 bg-green-950/20 border border-green-600 text-green-500 text-[10px] rounded-lg text-center font-black uppercase tracking-widest animate-bounce">
                                        COHERENCE OPTIMAL! REWARD DISPATCHED
                                    </div>
                                ) : (
                                    <div className="mt-4 flex justify-between items-center text-[9px] text-gray-600">
                                        <span>SYSTEM_SYNC: ACTIVE</span>
                                        <span>ALIGNED: {matrixNodes.filter(n => n).length}/16</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 4. Cybernetic Diagnostic Logger Terminal (WITH EASTER EGG INPUT COMMANDS) */}
                        <div className="aero-panel p-6 border-4 border-zinc-900 bg-black shadow-[6px_6px_0_0_#000] flex-1 min-h-[160px] flex flex-col">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
                                <TerminalIcon className="w-4 h-4 text-green-500 animate-pulse" />
                                <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Shard_Conductor_Logs</span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto text-[9px] font-mono space-y-2 custom-scrollbar pr-2 max-h-[180px]">
                                {terminalLogs.map((log, i) => (
                                    <div key={i} className={`leading-relaxed border-b border-zinc-950 pb-1 ${
                                        log.includes('ERROR') ? 'text-red-500 font-bold' : 
                                        log.includes('SUCCESS') ? 'text-green-400 font-semibold' : 
                                        log.includes('TRANSACTION') ? 'text-amber-500' :
                                        log.includes('SYSTEM') ? 'text-cyan-400' : 
                                        log.includes('ALERT') ? 'text-rose-500 font-bold animate-pulse' :
                                        log.includes('[INTERCEPTED') ? 'text-purple-400 italic' :
                                        'text-gray-400'
                                    }`}>
                                        <span className="opacity-40 font-bold">»</span> {log}
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>

                            {/* Command Input terminal line */}
                            <form onSubmit={handleCommandSubmit} className="mt-3 flex items-center gap-2 bg-zinc-950 px-3 py-1.5 border border-zinc-800 rounded-lg shrink-0">
                                <span className="text-[10px] text-green-500 font-bold">AetherOS:$</span>
                                <input 
                                    type="text"
                                    value={commandInput}
                                    onChange={(e) => setCommandInput(e.target.value)}
                                    placeholder="Type protocol command (e.g., 'help')..."
                                    className="flex-1 bg-transparent border-none outline-none text-[10px] text-green-400 font-mono placeholder-green-900/40"
                                />
                            </form>
                        </div>

                    </div>

                </div>
            </div>

            {/* Hub Footer */}
            <div className="p-4 bg-black border-t-8 border-black flex flex-col md:flex-row justify-between items-center z-40 px-12 gap-4 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Store Inventory: SYNC_0x03E2</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic">
                      POTENTIAL_UNITS: {shards} | GRID_STATUS: OPTIMAL
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em]">
                   Absolute conduction is its own reward.
                </div>
            </div>
        </div>
    );
};

