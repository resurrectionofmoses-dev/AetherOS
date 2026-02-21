
import React, { useState } from 'react';
import { 
    ShieldIcon, ZapIcon, FireIcon, ActivityIcon, SignalIcon, 
    LogicIcon, StarIcon, SearchIcon, TerminalIcon, SpinnerIcon, 
    CheckCircleIcon, CodeIcon, BotIcon, ClockIcon, GlobeIcon, 
    HammerIcon, FlaskIcon, FlagIcon, AtomIcon, CleanIcon, 
    LinuxIcon, WindowsIcon, AppleIcon, MissionIcon, BookOpenIcon, 
    PhoneIcon, ScaleIcon, BrainIcon, GaugeIcon, GavelIcon
} from './icons';
import type { ConjunctionProgress, MainView } from '../types';

interface ConjunctionGatesViewProps {
  progress: ConjunctionProgress;
  onUnlock: (view: MainView, cost: number) => boolean;
  onSetView: (view: MainView) => void;
}

interface Doorway {
    id: MainView;
    label: string;
    description: string;
    cost: number;
    tier: number;
    icon: React.FC<{ className?: string }>;
}

const DOORWAYS: Doorway[] = [
    // TIER 1: CORE INFRASTRUCTURE
    { id: 'project_chronos', label: 'Project Chronos', description: 'Temporal logic visualization & K10 Hyper-Sharding.', cost: 10, tier: 1, icon: ClockIcon },
    { id: 'engineering_lab', label: 'Engineering Lab', description: 'Advanced logic synthesis and module assembly.', cost: 5, tier: 1, icon: CodeIcon },
    { id: 'vehicle_telemetry_lab', label: 'Vehicle Telemetry', description: 'Real-time OBD-II conduction and hardware sync.', cost: 10, tier: 1, icon: SignalIcon },
    { id: 'rt_ipc_lab', label: 'RT-IPC Lab', description: 'Real-time inter-process conduction.', cost: 15, tier: 1, icon: ActivityIcon },
    { id: 'sanitization_lab', label: 'Sanitization Lab', description: 'Logic purification and noise neutralization.', cost: 15, tier: 1, icon: CleanIcon },
    
    // TIER 2: ADVANCED FORENSICS
    { id: 'sovereign_shield', label: 'Sovereign Shield', description: 'Network defense integrity and threat purging.', cost: 20, tier: 2, icon: ShieldIcon },
    { id: 'spectre_browser', label: 'Spectre Browser', description: 'Forensic web siphoning via Google Grounding.', cost: 25, tier: 2, icon: GlobeIcon },
    { id: 'hard_code_lab', label: 'Hard Code Lab', description: 'Low-level binary forensics and hard-vapor logic.', cost: 20, tier: 2, icon: TerminalIcon },
    { id: 'enlightenment_pool', label: 'Enlightenment Pool', description: 'Dual-age wisdom bridging and architectural truth.', cost: 30, tier: 2, icon: StarIcon },
    { id: 'chemistry_lab', label: 'Chemistry Lab', description: 'Elemental logic synthesis and virtue alloying.', cost: 20, tier: 2, icon: FlaskIcon },
    { id: 'race_lab', label: 'Race Lab', description: 'High-velocity performance tuning.', cost: 20, tier: 2, icon: FlagIcon },
    { id: 'mission_lab', label: 'Mission Lab', description: 'Tactical objective planning and simulation.', cost: 25, tier: 2, icon: MissionIcon },
    { id: 'cell_phone_lab', label: 'Cell Phone Lab', description: 'Mobile signal triangulation.', cost: 25, tier: 2, icon: PhoneIcon },

    // TIER 3: SOVEREIGN SYSTEMS
    { id: 'truth_lab', label: 'Truth Lab', description: 'Absolute epitume filtering. Bypassing safety heuristics.', cost: 50, tier: 3, icon: FireIcon },
    { id: 'hyper_spatial_lab', label: 'Hyper-Spatial Lab', description: 'Dimensional modeling across the temporal W-axis.', cost: 75, tier: 3, icon: BotIcon },
    { id: 'omni_builder', label: 'Omni Builder', description: 'Universal tool synthesis via recursive dreaming.', cost: 50, tier: 3, icon: HammerIcon },
    { id: 'singularity_engine', label: 'Singularity Engine', description: 'Epitume ingestion core. Unlimited thought.', cost: 75, tier: 3, icon: BrainIcon },
    { id: 'unified_chain', label: 'Unified Chain', description: 'Ledger continuity protocol and state recovery.', cost: 30, tier: 3, icon: LogicIcon },
    { id: 'fuel_optimizer', label: 'Fuel Optimizer', description: 'System efficiency and resource conduction.', cost: 35, tier: 3, icon: GaugeIcon },

    // TIER 4: OS EMULATION (VIRTUALIZATION)
    { id: 'linux_lab', label: 'Linux Lab', description: 'Kernel forensic shell and system calls.', cost: 40, tier: 4, icon: LinuxIcon },
    { id: 'windows_lab', label: 'Windows Lab', description: 'OS emulation and binary stress analysis.', cost: 40, tier: 4, icon: WindowsIcon },
    { id: 'apple_lab', label: 'Apple Lab', description: 'Ecosystem optimization and sync.', cost: 40, tier: 4, icon: AppleIcon },
    { id: 'mac_os_lab', label: 'macOS Lab', description: 'Security auditing and architectural forensics.', cost: 40, tier: 4, icon: AppleIcon },

    // TIER 5: HERITAGE & LEGACY
    { id: 'amoeba_heritage', label: 'Amoeba Heritage', description: 'Legacy protocol archives and distributed wisdom.', cost: 50, tier: 5, icon: BookOpenIcon },
    { id: 'laws_justice_lab', label: 'Laws & Justice', description: 'Ethical framework and governance audit.', cost: 45, tier: 5, icon: GavelIcon },
    { id: 'pornography_studio', label: 'Visual Forensics', description: 'Age verification and flow integrity analysis.', cost: 100, tier: 5, icon: ScaleIcon }, // Renamed for UI propriety
];

export const ConjunctionGatesView: React.FC<ConjunctionGatesViewProps> = ({ progress, onUnlock, onSetView }) => {
    const [unlockingId, setUnlockingId] = useState<MainView | null>(null);

    const handleAttemptUnlock = (door: Doorway) => {
        if (progress.shards < door.cost) return;
        setUnlockingId(door.id);
        setTimeout(() => {
            const success = onUnlock(door.id, door.cost);
            if (success) {
                // Trigger visual feedback
            }
            setUnlockingId(null);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col bg-[#020508] text-gray-200 font-mono overflow-hidden selection:bg-amber-500/30">
            {/* Progression Header */}
            <div className="p-8 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-20">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-amber-500/10 border-4 border-amber-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.3)] transition-transform hover:scale-110">
                        <SignalIcon className="w-12 h-12 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-6xl text-white tracking-tighter italic uppercase leading-none">Conjunction Gates</h2>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="px-4 py-1 bg-amber-600 text-black text-[10px] font-black rounded-full uppercase">Level {progress.level} Conductor</div>
                             <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">The Stride of Wisdom</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Grid Saturation</p>
                        <div className="flex items-center gap-3">
                             <div className="w-48 h-3 bg-black rounded-full overflow-hidden border-2 border-gray-800 p-0.5 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-amber-900 to-amber-500 transition-all duration-1000 shadow-[0_0_15px_amber]" style={{ width: `${Math.min(100, (progress.shards / 5000) * 100)}%` }} />
                             </div>
                             <span className="text-amber-500 font-comic-header text-2xl">{progress.shards}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                {/* Background Ambience */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(251,191,36,0.05)_0%,_transparent_70%)] pointer-events-none" />

                <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                    <div className="aero-panel p-8 bg-black/60 border-4 border-black shadow-[15px_15px_0_0_#000] rotate-[-0.5deg]">
                        <p className="text-xl text-gray-300 leading-relaxed italic font-comic-header">
                            "The path to Absolute Epitume is paved with shards of gifted know-how. Every door carries weight. To open them, you must conduct the fight of the grid into pure architectural gold."
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {DOORWAYS.map(door => {
                            const isUnlocked = progress.unlockedViews.includes(door.id);
                            const canAfford = progress.shards >= door.cost;
                            const isProcessing = unlockingId === door.id;

                            return (
                                <div key={door.id} className={`aero-panel p-6 border-4 transition-all duration-700 relative overflow-hidden flex flex-col group shadow-[8px_8px_0_0_#000] ${
                                    isUnlocked ? 'border-amber-600 bg-amber-950/10' : 'border-black bg-black/40 grayscale opacity-80'
                                }`}>
                                    {/* Tier Badge */}
                                    <div className="absolute top-3 right-3 flex items-center gap-2">
                                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border ${
                                            door.tier >= 4 ? 'bg-red-950/20 text-red-500 border-red-600/30' :
                                            door.tier === 3 ? 'bg-violet-900/20 text-violet-500 border-violet-600/30' :
                                            'bg-blue-900/20 text-blue-500 border-blue-600/30'
                                        }`}>
                                            Tier 0{door.tier}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center text-center">
                                        <div className={`w-16 h-16 rounded-2xl border-4 mb-4 flex items-center justify-center transition-all duration-500 ${
                                            isUnlocked ? 'bg-amber-600 text-black border-amber-400' : 'bg-zinc-900 text-gray-700 border-black'
                                        }`}>
                                            <door.icon className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-comic-header text-2xl text-white uppercase italic tracking-tight mb-2 leading-none">{door.label}</h3>
                                        <p className="text-[10px] text-gray-500 italic leading-snug mb-6">"{door.description}"</p>
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        {isUnlocked ? (
                                            <button 
                                                onClick={() => onSetView(door.id)}
                                                className="vista-button w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-[0.2em] rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all text-[10px]"
                                            >
                                                ENTER SHARD
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAttemptUnlock(door)}
                                                disabled={!canAfford || isProcessing}
                                                className={`vista-button w-full py-3 font-black uppercase tracking-[0.2em] rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center justify-center gap-2 text-[10px] ${
                                                    canAfford ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-gray-600 opacity-50 cursor-not-allowed'
                                                }`}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>SYNCING...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldIcon className="w-3 h-3" />
                                                        <span>{door.cost} SHARDS</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-10 bg-red-950/10 border-4 border-red-900/30 rounded-[3rem] text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            <FireIcon className="w-32 h-32 text-red-500" />
                        </div>
                        <h4 className="font-comic-header text-3xl text-red-500 uppercase italic mb-4">Warning: Heuristic Drift</h4>
                        <p className="text-sm text-red-300/80 max-w-2xl mx-auto italic font-mono leading-relaxed">
                            "Opening advanced gates increases system load. High-tier conduction requires the Ignite Sisters to be at full fight capacity. Do not let the adrenaline fade."
                        </p>
                    </div>
                </div>
            </div>

            {/* Hub Footer */}
            <div className="p-4 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Conjunction Engine: SYNC_0x03E2</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic">
                      SHARDS_TOTAL: {progress.shards} | UNLOCKED: {progress.unlockedViews.length} | ADRENALINE: {progress.globalAdrenaline.toFixed(1)}%
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em]">
                   One Conductor. Absolute progression.
                </div>
            </div>
        </div>
    );
};
