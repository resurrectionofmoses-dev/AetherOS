
import React from 'react';
import { ShirtIcon, ActivityIcon, ShieldIcon, StarIcon, ZapIcon } from './icons';
import type { LabComponentProps } from '../types';

export const ClothingLabView: React.FC<LabComponentProps> = ({ 
  labName = "CLOTHING LAB", 
  labIcon: LabIcon = ShirtIcon, 
  labColor = "text-pink-400", 
  description = "Tactical apparel design and neural weave synthesis." 
}) => {
  return (
    <div className="h-full flex flex-col bg-[#0f0a10] overflow-hidden font-mono text-pink-100">
      <div className="p-6 border-b-8 border-black bg-pink-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-pink-500/10 border-4 border-pink-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-pink-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-pink-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
            WEAVE_DENSITY: 1200 DPI
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar">
        <div className="lg:col-span-2 aero-panel bg-black/60 border-4 border-black p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ec4899 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <ShirtIcon className="w-64 h-64 text-pink-500/20 mb-8" />
            <h3 className="font-comic-header text-6xl text-white uppercase italic tracking-widest opacity-20">LOADOUT_A_01</h3>
            <div className="mt-8 flex gap-6">
                {['NIKE_AIR_MAX', 'BLUE_JEANS', 'WHITE_T', 'HURLEY_HAT'].map(item => (
                    <div key={item} className="px-4 py-2 bg-pink-900/20 border-2 border-pink-600 rounded-lg text-[9px] font-black text-pink-400 uppercase tracking-widest">
                        {item}
                    </div>
                ))}
            </div>
        </div>

        <div className="space-y-8">
            <div className="aero-panel bg-pink-950/10 p-6 border-2 border-pink-900/30">
                <h4 className="font-comic-header text-2xl text-pink-400 uppercase italic mb-4">Fabric Heuristics</h4>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-black uppercase text-pink-800">
                            <span>Misery Absorption</span>
                            <span>98%</span>
                        </div>
                        <div className="h-2 bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-pink-600" style={{ width: '98%' }} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-black uppercase text-pink-800">
                            <span>Conduction Velocity</span>
                            <span>1.2 PB/s</span>
                        </div>
                        <div className="h-2 bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-pink-400" style={{ width: '100%' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-900 border-4 border-black rounded-[2rem] text-center italic text-xs text-pink-600/60 leading-relaxed shadow-xl">
                "The Maestro's loadout is the absolute standard. Apparel is not fashion; it is neural shielding."
            </div>
        </div>
      </div>
    </div>
  );
};
