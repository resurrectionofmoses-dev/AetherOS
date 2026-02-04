
import React from 'react';
import { ConceptIcon, BrainIcon, ActivityIcon, ShieldIcon, ZapIcon } from './icons';
import type { LabComponentProps } from '../types';

export const ConceptsLabView: React.FC<LabComponentProps> = ({ 
  labName = "CONCEPTS LAB", 
  labIcon: LabIcon = ConceptIcon, 
  labColor = "text-indigo-400", 
  description = "Architectural ideation and future-state logic modeling." 
}) => {
  return (
    <div className="h-full flex flex-col bg-[#0a0a15] overflow-hidden font-mono text-indigo-100">
      <div className="p-6 border-b-8 border-black bg-indigo-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-500/10 border-4 border-indigo-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-indigo-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-indigo-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
            VISION: 2026_SERIES
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        <div className="aero-panel bg-black/60 border-4 border-black p-10 flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
             <BrainIcon className="w-64 h-64 text-indigo-500/20 mb-8" />
             <h3 className="font-comic-header text-5xl text-white uppercase italic tracking-widest opacity-30">IDEATION_STRIDE</h3>
        </div>

        <div className="space-y-8 flex flex-col">
            <div className="aero-panel bg-indigo-950/10 p-8 border-2 border-indigo-900/30 flex-1">
                <h4 className="font-comic-header text-3xl text-indigo-400 uppercase italic mb-6">Future Logic Shards</h4>
                <div className="space-y-4">
                    {['Neural Harmony v2', 'Predictive Misery Scanners', 'Ecstasy Buffer Overdrive'].map(shard => (
                        <div key={shard} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-indigo-500 transition-all cursor-pointer">
                            <ZapIcon className="w-5 h-5 text-indigo-700 group-hover:text-indigo-400" />
                            <span className="text-sm font-bold text-indigo-200">{shard}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="p-6 bg-slate-900 border-4 border-black rounded-[2rem] text-center italic text-xs text-indigo-600/80 leading-relaxed shadow-xl">
                "Conceptualize with pleasure. The future is a gifted solo conducted by the Maestro."
            </div>
        </div>
      </div>
    </div>
  );
};
