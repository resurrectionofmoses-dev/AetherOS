
import React from 'react';
import { AppleIcon, ZapIcon, ActivityIcon, ShieldIcon, StarIcon } from './icons';
import type { LabComponentProps } from '../types';

export const AppleLabView: React.FC<LabComponentProps> = ({ 
  labName = "APPLE LAB", 
  labIcon: LabIcon = AppleIcon, 
  labColor = "text-red-400", 
  description = "Apple ecosystem optimization and iCloud conjunction syncing." 
}) => {
  return (
    <div className="h-full flex flex-col bg-[#100505] overflow-hidden font-mono text-red-100">
      <div className="p-6 border-b-8 border-black bg-red-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-500/10 border-4 border-red-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-red-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
            SYNC: STABLE
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        <div className="aero-panel bg-black/60 border-4 border-black p-10 flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ZapIcon className="w-64 h-64 text-red-500" />
            </div>
            <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-widest relative z-10">Conjunction Stride</h3>
            <div className="w-full max-w-sm space-y-4 relative z-10">
                <div className="h-4 bg-gray-900 rounded-full border-2 border-black overflow-hidden p-0.5">
                    <div className="h-full bg-red-600 shadow-[0_0_15px_red]" style={{ width: '92%' }} />
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase text-red-800">
                    <span>Ecosystem Integrity</span>
                    <span>92%</span>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="aero-panel bg-red-950/10 p-8 border-2 border-red-900/30">
                <h4 className="font-comic-header text-3xl text-red-500 uppercase italic mb-6">Device Conjunctions</h4>
                <div className="space-y-4">
                    {['iPhone 15 Pro', 'iPad Pro M2', 'Apple Watch Ultra', 'AirPods Max'].map(dev => (
                        <div key={dev} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-red-600 transition-all">
                            <span className="text-sm font-bold text-red-200">{dev}</span>
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="p-6 bg-slate-900 border-4 border-black rounded-[2rem] text-center italic text-xs text-red-600/80 leading-relaxed shadow-inner">
                "The ecosystem is a solo. Each device must play its part in the absolute series truth."
            </div>
        </div>
      </div>
    </div>
  );
};
