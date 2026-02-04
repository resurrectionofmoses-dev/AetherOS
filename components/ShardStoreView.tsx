
import React, { useState } from 'react';
import { 
    GemIcon, ZapIcon, StarIcon, ShieldIcon, ActivityIcon, 
    FireIcon, LogicIcon, BrainIcon, SpinnerIcon, CheckCircleIcon, TerminalIcon
} from './icons';
import type { StoreItem, SistersState } from '../types';

interface ShardStoreViewProps {
  shards: number;
  onPurchase: (cost: number) => boolean;
  onIgniteSister: (name: keyof SistersState) => void;
  sisters: SistersState;
}

const STORE_ITEMS: StoreItem[] = [
    { id: 'item_1', name: 'Neural Optimizer', description: 'Reduces Semantic Drift by 0.05% for the next conduction.', cost: 5, icon: LogicIcon, category: 'NEURAL' },
    { id: 'item_2', name: 'Ignition Primer: Logica', description: 'Immediate protocol prep for Sister Logica activation.', cost: 15, icon: FireIcon, category: 'SISTER' },
    { id: 'item_3', name: 'Ignition Primer: Sophia', description: 'Deep forensic sync for Sister Sophia activation.', cost: 25, icon: StarIcon, category: 'SISTER' },
    { id: 'item_4', name: 'Forensic Filter: Ruby', description: 'Injects a high-arousal ruby pigment into the visual buffer.', cost: 10, icon: ShieldIcon, category: 'GEAR' },
    { id: 'item_5', name: 'Stride Surge', description: 'Boosts Conjunction Stride by 0.2 PB/s for 30 minutes.', cost: 50, icon: ActivityIcon, category: 'NEURAL' },
    { id: 'item_6', name: 'Maestro Solo Kit', description: 'Enables high-fidelity "Reedle-Gucci" optic calibration.', cost: 100, icon: ZapIcon, category: 'GEAR' },
];

export const ShardStoreView: React.FC<ShardStoreViewProps> = ({ shards, onPurchase, onIgniteSister, sisters }) => {
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    const handleManifest = (item: StoreItem) => {
        if (shards < item.cost) return;
        
        setPurchasingId(item.id);
        setTimeout(() => {
            const success = onPurchase(item.cost);
            if (success) {
                // Apply specific item logic
                if (item.id === 'item_2') onIgniteSister('logica');
                if (item.id === 'item_3') onIgniteSister('sophia');
            }
            setPurchasingId(null);
        }, 1200);
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] text-gray-200 font-mono overflow-hidden">
            {/* Store Header */}
            <div className="p-8 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-20">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-amber-500/10 border-4 border-amber-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.3)] transition-transform hover:scale-110">
                        <GemIcon className="w-12 h-12 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-6xl text-white tracking-tighter italic uppercase leading-none">Shard Store</h2>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="px-4 py-1 bg-amber-600 text-black text-[10px] font-black rounded-full uppercase">Conductor Exchange</div>
                             <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Manifesting Potential</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Available Potential</p>
                        <div className="flex items-center gap-3">
                             <div className="w-48 h-3 bg-black rounded-full overflow-hidden border-2 border-gray-800 p-0.5 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-amber-900 to-amber-500 transition-all duration-1000 shadow-[0_0_15px_amber]" style={{ width: `${Math.min(100, shards)}%` }} />
                             </div>
                             <span className="text-amber-500 font-comic-header text-4xl">{shards}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                {/* Background Ambience */}
                <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.1)_0%,_transparent_70%)] animate-pulse" />
                    <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(251,191,36,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                    <div className="aero-panel p-8 bg-black/60 border-4 border-black shadow-[15px_15px_0_0_#000] rotate-[-0.5deg]">
                        <p className="text-xl text-gray-300 leading-relaxed italic font-comic-header">
                            "The grid rewards conduction. Every action in the lab earns shards. Exchange them here to augment your authority and survive the next Fall Off Requindor."
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                        {STORE_ITEMS.map(item => {
                            const canAfford = shards >= item.cost;
                            const isProcessing = purchasingId === item.id;
                            const isAlreadyActive = (item.id === 'item_2' && sisters.logica.active) || (item.id === 'item_3' && sisters.sophia.active);

                            return (
                                <div key={item.id} className={`aero-panel p-8 border-4 transition-all duration-700 relative overflow-hidden flex flex-col group shadow-[8px_8px_0_0_#000] ${
                                    isAlreadyActive ? 'border-green-600 bg-green-950/10' : canAfford ? 'border-amber-600 bg-amber-950/10' : 'border-black bg-black/40 grayscale opacity-80'
                                }`}>
                                    {/* Category Badge */}
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
                                        <div className={`w-20 h-20 rounded-3xl border-4 mb-6 flex items-center justify-center transition-all duration-500 ${
                                            isAlreadyActive ? 'bg-green-600 text-black border-green-400' : canAfford ? 'bg-amber-600 text-black border-amber-400' : 'bg-zinc-900 text-gray-700 border-black'
                                        }`}>
                                            <item.icon className="w-12 h-12" />
                                        </div>
                                        <h3 className="font-comic-header text-3xl text-white uppercase italic tracking-tight mb-2">{item.name}</h3>
                                        <p className="text-xs text-gray-500 italic leading-relaxed mb-8">"{item.description}"</p>
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        {isAlreadyActive ? (
                                            <div className="w-full py-4 bg-green-600 text-black font-black uppercase text-center rounded-2xl flex items-center justify-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5" />
                                                <span>PROTOCOL ACTIVE</span>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleManifest(item)}
                                                disabled={!canAfford || isProcessing}
                                                className={`vista-button w-full py-4 font-black uppercase tracking-[0.2em] rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center justify-center gap-3 ${
                                                    canAfford ? 'bg-amber-600 text-black hover:bg-amber-500' : 'bg-zinc-800 text-gray-600 opacity-50 cursor-not-allowed'
                                                }`}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <SpinnerIcon className="w-6 h-6 animate-spin" />
                                                        <span>MANIFESTING...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ZapIcon className="w-5 h-5" />
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
            </div>

            {/* Hub Footer */}
            <div className="p-4 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
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
