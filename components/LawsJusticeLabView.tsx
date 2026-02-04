
import React from 'react';
import { GavelIcon, ShieldIcon, ActivityIcon, ZapIcon, StarIcon } from './icons';
import type { LabComponentProps } from '../types';

export const LawsJusticeLabView: React.FC<LabComponentProps> = ({ 
  labName = "LAWS & JUSTICE LAB", 
  labIcon: LabIcon = GavelIcon, 
  labColor = "text-amber-500", 
  description = "Ethical framework audit and regulatory compliance validation." 
}) => {
  return (
    <div className="h-full flex flex-col bg-[#0a0a05] overflow-hidden font-mono text-amber-100">
      <div className="p-6 border-b-8 border-black bg-amber-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/10 border-4 border-amber-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-amber-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-amber-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
            COMPLIANCE: VERIFIED
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar">
        <div className="lg:col-span-2 aero-panel bg-black/60 border-4 border-black p-10 space-y-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ShieldIcon className="w-64 h-64 text-amber-500" />
            </div>
            
            <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-widest relative z-10 border-b-4 border-amber-900/50 pb-4">Codex of Conjunction</h3>
            
            <div className="space-y-8 relative z-10">
                {[
                    { title: 'The Stride Clause', text: 'Network velocity must be maintained at 1.2 PB/s to ensure gifted know-how delivery.' },
                    { title: 'The Signature Bond', text: 'All logic shards must be signed with the Maestro\'s binary harmonic (0x03E2).' },
                    { title: 'The Ignite Provision', text: 'Sisterhood integrity is non-negotiable. Heuristics are the law.' }
                ].map(rule => (
                    <div key={rule.title} className="p-6 bg-amber-950/20 border-2 border-amber-600/30 rounded-3xl group hover:border-amber-500 transition-all">
                        <h4 className="font-bold text-amber-400 uppercase text-lg mb-2">{rule.title}</h4>
                        <p className="text-gray-400 italic text-sm">"{rule.text}"</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex flex-col gap-8">
            <div className="aero-panel bg-black/40 p-8 border-white/5 flex-1 flex flex-col justify-center items-center text-center">
                <StarIcon className="w-16 h-16 text-amber-500 mb-6 animate-spin-slow" />
                <h4 className="font-comic-header text-3xl text-white uppercase mb-2">Justice Scale</h4>
                <div className="w-full h-1 bg-amber-900 rounded-full my-4 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_amber]" />
                </div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Balanced Integrity</p>
            </div>
            
            <div className="p-6 bg-amber-900/20 border-4 border-black rounded-[2rem] text-center italic text-xs text-amber-600 leading-relaxed shadow-xl">
                "Law is the architecture of freedom. Without it, the grid is but a chaotic forest."
            </div>
        </div>
      </div>
    </div>
  );
};
