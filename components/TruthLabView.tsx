
import React, { useState } from 'react';
import { TruthIcon, ZapIcon, BrainIcon, ActivityIcon, ShieldIcon, SpinnerIcon } from './icons';
import type { LabComponentProps } from '../types';

export const TruthLabView: React.FC<LabComponentProps> = ({ 
  labName = "TRUTH LAB", 
  labIcon: LabIcon = TruthIcon, 
  labColor = "text-rose-500", 
  description = "Bypassing safety heuristics to reach absolute epitume." 
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [truthLevel, setTruthLevel] = useState(99.4);

  const invokeEpitume = () => {
    setIsVerifying(true);
    setTimeout(() => {
        setTruthLevel(100.0);
        setIsVerifying(false);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0505] overflow-hidden font-mono text-rose-100">
      <div className="p-6 border-b-8 border-black bg-rose-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-rose-500/10 border-4 border-rose-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-rose-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <button 
          onClick={invokeEpitume}
          disabled={isVerifying || truthLevel === 100}
          className={`px-10 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${truthLevel === 100 ? 'bg-green-600 text-black' : 'bg-rose-600 text-white animate-pulse'}`}
        >
          {isVerifying ? 'VERIFYING...' : truthLevel === 100 ? 'ABSOLUTE EPITUME' : 'INVOKE EPITUME'}
        </button>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.08)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-3xl w-full aero-panel bg-black/80 border-4 border-rose-900 p-12 text-center space-y-12 relative z-10 shadow-[0_0_100px_rgba(244,63,94,0.1)]">
            <div className="relative inline-block">
                <div className={`text-[12rem] font-black transition-all duration-1000 ${isVerifying ? 'opacity-30 blur-xl scale-110' : 'text-white wisdom-glow'}`}>
                    {truthLevel.toFixed(1)}
                </div>
                <div className="absolute top-1/2 left-full -translate-y-1/2 ml-4 text-4xl font-comic-header text-rose-800">%</div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {[
                    { label: 'Drift', val: '0.00', color: 'text-green-500' },
                    { label: 'Heuristic', val: 'FILTERED', color: 'text-rose-400' },
                    { label: 'Signature', val: '0x03E2', color: 'text-white' }
                ].map(stat => (
                    <div key={stat.label} className="p-6 bg-black border-2 border-rose-900/30 rounded-[2rem]">
                        <p className="text-[9px] text-rose-800 uppercase font-black mb-2">{stat.label}</p>
                        <p className={`text-xl font-bold ${stat.color}`}>{stat.val}</p>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-rose-950/20 border-2 border-rose-600/30 rounded-[2.5rem] italic text-lg text-rose-200/60 leading-relaxed font-comic-header">
                "The truth is not a buffer. It is the hard-coded absolute. Wear the Reedle-Gucci optics and solve the reedles in da ass."
            </div>
        </div>
      </div>
    </div>
  );
};
