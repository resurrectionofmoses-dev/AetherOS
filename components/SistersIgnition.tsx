
import React, { useState } from 'react';
import { FireIcon, BrainIcon, LogicIcon, StarIcon, SpinnerIcon, ZapIcon } from './icons';
import type { SistersState } from '../types';

interface SistersIgnitionProps {
  sisters: SistersState;
  onIgnite: (name: keyof SistersState) => void;
}

export const SistersIgnition: React.FC<SistersIgnitionProps> = ({ sisters, onIgnite }) => {
  const [igniting, setIgniting] = useState<string | null>(null);

  const handleIgnite = (name: keyof SistersState) => {
    setIgniting(name);
    setTimeout(() => {
      onIgnite(name);
      setIgniting(null);
    }, 1500);
  };

  const sisterProfiles = [
    { id: 'aethera', label: 'AETHERA', sub: 'Knowledge', icon: BrainIcon, color: 'text-cyan-400', glow: 'shadow-[0_0_15px_cyan]' },
    { id: 'logica', label: 'LOGICA', sub: 'Logic', icon: LogicIcon, color: 'text-amber-500', glow: 'shadow-[0_0_15px_orange]' },
    { id: 'sophia', label: 'SOPHIA', sub: 'Wisdom', icon: StarIcon, color: 'text-violet-500', glow: 'shadow-[0_0_15px_purple]' },
  ];

  return (
    <div className="w-full flex flex-col p-3 gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
            <FireIcon className="w-4 h-4 text-red-600 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">IGNITE_SISTERS</span>
        </div>
        <span className="text-[6px] text-gray-600 font-mono">Series_0x03E2</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {sisterProfiles.map(sister => {
          const state = sisters[sister.id as keyof SistersState];
          const isProcessing = igniting === sister.id;
          
          return (
            <button
              key={sister.id}
              onClick={() => !state.active && handleIgnite(sister.id as keyof SistersState)}
              disabled={isProcessing || state.active}
              className={`p-3 rounded-2xl border-4 transition-all duration-500 flex items-center justify-between relative overflow-hidden group ${
                state.active ? 'bg-black border-white/20' : 'bg-slate-900 border-black hover:border-red-600/40 shadow-inner'
              }`}
            >
              {state.active && (
                <div className={`absolute inset-0 bg-gradient-to-r ${sister.color.replace('text', 'from')}/10 to-transparent animate-pulse`} />
              )}
              
              <div className="flex items-center gap-3 relative z-10">
                <div className={`p-2 rounded-xl border-2 border-black ${state.active ? sister.color : 'text-gray-800'} ${state.active ? sister.glow : ''}`}>
                   <sister.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className={`font-comic-header text-xl uppercase italic leading-none ${state.active ? 'text-white' : 'text-gray-700'}`}>{sister.label}</p>
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{sister.sub}</p>
                </div>
              </div>

              <div className="relative z-10">
                {isProcessing ? (
                  <SpinnerIcon className={`w-5 h-5 ${sister.color} animate-spin`} />
                ) : state.active ? (
                   <ZapIcon className={`w-5 h-5 ${sister.color} animate-bounce`} />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center text-[7px] font-black text-gray-800 hover:text-red-500 transition-colors">
                    OFF
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="p-3 bg-black/40 border border-white/5 rounded-2xl italic text-[9px] text-gray-500 leading-relaxed text-center">
         "Igniting the Sisters provides the gifted know-how required for absolute conduction."
      </div>
    </div>
  );
};
