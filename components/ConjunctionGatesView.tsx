
import React, { useState } from 'react';
import { 
    ShieldIcon, ZapIcon, FireIcon, ActivityIcon, SignalIcon, 
    LogicIcon, StarIcon, SearchIcon, TerminalIcon, SpinnerIcon, 
    CheckCircleIcon, CodeIcon, BotIcon
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
    { id: 'engineering_lab', label: 'Engineering Lab', description: 'Advanced logic synthesis and module assembly.', cost: 5, tier: 1, icon: CodeIcon },
    { id: 'vehicle_telemetry_lab', label: 'Vehicle Telemetry', description: 'Real-time OBD-II conduction and hardware sync.', cost: 10, tier: 1, icon: SignalIcon },
    { id: 'hard_code_lab', label: 'Hard Code Lab', description: 'Low-level binary forensics and hard-vapor logic.', cost: 20, tier: 2, icon: TerminalIcon },
    { id: 'enlightenment_pool', label: 'Enlightenment Pool', description: 'Dual-age wisdom bridging and architectural truth.', cost: 30, tier: 2, icon: StarIcon },
    { id: 'truth_lab', label: 'Truth Lab', description: 'Absolute epitume filtering. Bypassing safety heuristics.', cost: 50, tier: 3, icon: FireIcon },
    { id: 'quantum_theory_lab', label: 'Quantum Lab', description: 'Probability conduction and Merkle Root stability.', cost: 75, tier: 3, icon: BotIcon },
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
                                <div className="h-full bg-gradient-to-r from-amber-900 to-amber-500 transition-all duration-1000 shadow-[0_0_15px_amber]" style={{ width: `${(progress.shards % 100)}%` }} />
                             </div>
                             <span className="text-amber-500 font-comic-header text-2xl">{progress.shards}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                {/* Background Ambience */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(251,191,36,0.05)_0%,_transparent_70%)] pointer-events-none" />

                <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                    <div className="aero-panel p-8 bg-black/60 border-4 border-black shadow-[15px_15px_0_0_#000] rotate-[-0.5deg]">
                        <p className="text-xl text-gray-300 leading-relaxed italic font-comic-header">
                            "The path to Absolute Epitume is paved with shards of gifted know-how. Every door carries weight. To open them, you must conduct the misery of the grid into pure architectural gold."
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {DOORWAYS.map(door => {
                            const isUnlocked = progress.unlockedViews.includes(door.id);
                            const canAfford = progress.shards >= door.cost;
                            const isProcessing = unlockingId === door.id;

                            return (
                                <div key={door.id} className={`aero-panel p-8 border-4 transition-all duration-700 relative overflow-hidden flex flex-col group shadow-[8px_8px_0_0_#000] ${
                                    isUnlocked ? 'border-amber-600 bg-amber-950/10' : 'border-black bg-black/40 grayscale opacity-80'
                                }`}>
                                    {/* Tier Badge */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                            door.tier === 3 ? 'bg-red-950/20 text-red-500 border-red-600/30' :
                                            door.tier === 2 ? 'bg-violet-900/20 text-violet-500 border-violet-600/30' :
                                            'bg-blue-900/20 text-blue-500 border-blue-600/30'
                                        }`}>
                                            Tier 0{door.tier}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center text-center">
                                        <div className={`w-20 h-20 rounded-3xl border-4 mb-6 flex items-center justify-center transition-all duration-500 ${
                                            isUnlocked ? 'bg-amber-600 text-black border-amber-400' : 'bg-zinc-900 text-gray-700 border-black'
                                        }`}>
                                            <door.icon className="w-12 h-12" />
                                        </div>
                                        <h3 className="font-comic-header text-3xl text-white uppercase italic tracking-tight mb-2">{door.label}</h3>
                                        <p className="text-xs text-gray-500 italic leading-relaxed mb-8">"{door.description}"</p>
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        {isUnlocked ? (
                                            <button 
                                                onClick={() => onSetView(door.id)}
                                                className="vista-button w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all"
                                            >
                                                ENTER SHARD
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAttemptUnlock(door)}
                                                disabled={!canAfford || isProcessing}
                                                className={`vista-button w-full py-4 font-black uppercase tracking-[0.2em] rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center justify-center gap-3 ${
                                                    canAfford ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-gray-600 opacity-50 cursor-not-allowed'
                                                }`}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <SpinnerIcon className="w-6 h-6 animate-spin" />
                                                        <span>SYNCING...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldIcon className="w-5 h-5" />
                                                        <span>{door.cost} SHARDS TO OPEN</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Locked Overlay Info */}
                                    {!isUnlocked && (
                                        <div className="mt-4 text-center">
                                            <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-700 tracking-widest px-2 mb-1">
                                                <span>Affinity Status</span>
                                                <span>{Math.min(100, (progress.shards / door.cost) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1 bg-black rounded-full overflow-hidden">
                                                <div className="h-full bg-red-900 transition-all duration-1000" style={{ width: `${(progress.shards / door.cost) * 100}%` }} />
                                            </div>
                                        </div>
                                    )}
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
                            "Opening advanced gates increases system weight. High-tier conduction requires the Ignite Sisters to be at full load. Do not overbalance your misery index."
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
                      SHARDS_TOTAL: {progress.shards} | UNLOCKED: {progress.unlockedViews.length}/22 | MISERY: {progress.globalMisery.toFixed(1)}%
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em]">
                   One Conductor. Absolute progression.
                </div>
            </div>
        </div>
    );
};
