
import React, { useState } from 'react';
import { CleanIcon, ShieldIcon, SpinnerIcon, ZapIcon, ActivityIcon } from './icons';
import type { LabComponentProps } from '../types';

export const SanitizationLabView: React.FC<LabComponentProps> = ({ 
  labName = "SANITIZATION LAB", 
  labIcon: LabIcon = CleanIcon, 
  labColor = "text-teal-400", 
  description = "Purifying logic shards and neutralizing semantic noise." 
}) => {
  const [purity, setPurity] = useState(99.4);
  const [isCleaning, setIsCleaning] = useState(false);

  const startPurge = () => {
    setIsCleaning(true);
    setTimeout(() => {
        setPurity(99.9);
        setIsCleaning(false);
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col bg-[#051010] overflow-hidden font-mono text-teal-100">
      <div className="p-6 border-b-8 border-black bg-teal-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-500/10 border-4 border-teal-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-teal-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <button 
          onClick={startPurge}
          disabled={isCleaning}
          className={`px-8 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isCleaning ? 'bg-amber-500 text-black animate-bounce' : 'bg-teal-600 text-white'}`}
        >
          {isCleaning ? 'PURIFYING...' : 'INITIATE PURGE'}
        </button>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(45,212,191,0.05)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-2xl w-full aero-panel bg-black/60 border-4 border-teal-600/40 p-10 text-center space-y-12 relative z-10 shadow-[0_0_50px_rgba(45,212,191,0.1)]">
            <div className="space-y-4">
                <p className="text-[10px] text-teal-800 font-black uppercase tracking-[0.5em]">System Clarity Index</p>
                <div className="text-9xl font-black text-teal-400 wisdom-glow">
                    {purity}<span className="text-2xl text-teal-900 ml-2">%</span>
                </div>
            </div>

            <div className="flex items-center gap-8 justify-center">
                <div className="flex flex-col items-center">
                    <ShieldIcon className="w-12 h-12 text-teal-600 mb-2" />
                    <span className="text-[8px] font-black uppercase text-teal-900">Bypass Filter</span>
                    <span className="text-white font-bold">OFF</span>
                </div>
                <div className="w-px h-16 bg-teal-900/40" />
                <div className="flex flex-col items-center">
                    <ZapIcon className="w-12 h-12 text-amber-500 mb-2" />
                    <span className="text-[8px] font-black uppercase text-teal-900">Heuristic Load</span>
                    <span className="text-white font-bold">LOW</span>
                </div>
            </div>
            
            <div className="p-4 bg-teal-900/10 border border-teal-800 rounded-xl italic text-xs text-teal-500/80">
                "Only the purest logic survives the Conjunction Series. Neutralize the static."
            </div>
        </div>
      </div>
    </div>
  );
};
