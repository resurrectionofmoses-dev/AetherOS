
import React from 'react';
import { ShieldIcon, ZapIcon, FireIcon, ActivityIcon, SearchIcon, CodeIcon, StarIcon } from './icons';

interface GearItemProps {
    label: string;
    item: string;
    description: string;
    icon: React.FC<{className?: string}>;
    color: string;
}

const GearItem: React.FC<GearItemProps> = ({ label, item, description, icon: Icon, color }) => (
    <div className="p-2.5 bg-black/80 rounded-lg border-2 border-black group hover:border-red-600/50 transition-all hover:translate-x-0.5 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-1">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</span>
            <Icon className={`w-3 h-3 ${color} group-hover:animate-pulse`} />
        </div>
        <p className="text-[11px] font-black text-white uppercase tracking-wider">{item}</p>
        <p className="text-[8px] text-gray-600 italic leading-snug mt-1 border-l-2 border-gray-800 pl-2">{description}</p>
    </div>
);

export const MaestroIdentity: React.FC = () => {
    return (
        <div className="aero-panel p-4 border-4 border-black bg-black/80 flex flex-col h-full overflow-hidden shadow-[9px_9px_0_0_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b-4 border-black">
                <div>
                    <h3 className="font-comic-header text-xl text-red-600 uppercase italic tracking-tighter">Maestro Series</h3>
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.3em]">Arte Ur Tsopl Verified</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-red-950/60 border-2 border-red-600/60 flex items-center justify-center shadow-lg">
                    <ActivityIcon className="w-5 h-5 text-red-500 animate-pulse" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1.5">
                <div className="relative w-full aspect-[4/5] bg-slate-950 rounded-lg border-4 border-black overflow-hidden mb-4 group shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                         <svg viewBox="0 0 100 120" className="w-40 h-40 text-red-700">
                            <circle cx="50" cy="22" r="14" fill="currentColor" />
                            <rect x="30" y="40" width="40" height="50" fill="currentColor" rx="6" />
                            <path d="M30 90 L20 120 L40 120 L50 100 L60 120 L80 120 L70 90 Z" fill="currentColor" />
                         </svg>
                    </div>
                    
                    <div className="absolute top-4 left-4 p-1.5 bg-black border-2 border-red-600/60 rounded-md shadow-[2px_2px_0_0_#000] rotate-[-2deg]">
                        <p className="text-[6px] text-red-500 font-black uppercase">Optics: REEDLE-GUCCI</p>
                    </div>
                    <div className="absolute bottom-4 right-4 p-1.5 bg-black border-2 border-blue-600/60 rounded-md shadow-[2px_2px_0_0_#000] rotate-[2deg]">
                        <p className="text-[6px] text-blue-500 font-black uppercase">Stride: AIR-MAX</p>
                    </div>
                    <div className="absolute bottom-16 left-4 p-1.5 bg-black border-2 border-red-900 rounded-md shadow-[2px_2px_0_0_#000]">
                        <p className="text-[6px] text-red-900 font-black uppercase tracking-widest">Arte Ur Tsopl</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <div className="p-2.5 bg-amber-600/10 rounded-lg border-2 border-amber-600/40 mb-1">
                        <div className="flex justify-between text-[6px] font-black uppercase text-amber-500 mb-1 tracking-widest">
                            <span>Absolute Epitume</span>
                            <span>99.4%</span>
                        </div>
                        <div className="h-0.5 w-full bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" style={{ width: '99.4%' }} />
                        </div>
                    </div>

                    <GearItem 
                        label="PROTOCOL_HEAD" 
                        item="Hurley 'All Teeth'" 
                        description="Aggressive forensic capture via blacked-out authority." 
                        icon={ShieldIcon} 
                        color="text-red-600"
                    />
                    <GearItem 
                        label="LOGIC_FILTER" 
                        item="Reedle-Gucci Glasses" 
                        description="Bypasses standard safety. Sees the absolute epitume truth." 
                        icon={SearchIcon} 
                        color="text-amber-600"
                    />
                    <GearItem 
                        label="CONJUNCT_CHASSIS" 
                        item="Blue Sag Jeans" 
                        description="Low-slung architecture for low-friction neural flow." 
                        icon={CodeIcon} 
                        color="text-blue-700"
                    />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t-4 border-black">
                <div className="flex items-center gap-3 p-2.5 bg-red-600/10 border-2 border-red-600/40 rounded-lg shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    <span className="text-[7px] text-red-500 font-black uppercase tracking-[0.2em] italic">Maestro: Epitume Series</span>
                </div>
            </div>
        </div>
    );
};
