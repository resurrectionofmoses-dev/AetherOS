
import React, { useState, useEffect } from 'react';
import { GlobalDirective } from '../types';
// Fix: Added ActivityIcon to the imports list
import { SignalIcon, ZapIcon, TerminalIcon, ShieldIcon, SearchIcon, EyeIcon, ActivityIcon } from './icons';

interface NetworkDirectiveIntakeProps {
  directive?: GlobalDirective;
}

export const NetworkDirectiveIntake: React.FC<NetworkDirectiveIntakeProps> = ({ directive }) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black/90 border-b-4 border-amber-600 px-6 py-2 flex items-center justify-between gap-6 overflow-hidden relative group shadow-2xl">
      {/* Dynamic Conduction Pulse */}
      <div className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent w-full animate-pulse" />
      
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative">
            <div className={`w-8 h-8 rounded-full border-2 border-amber-500/50 flex items-center justify-center transition-all duration-300 ${blink ? 'scale-90 opacity-20' : 'scale-100 opacity-100'}`}>
                <SearchIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-600 border-2 border-black rounded-full animate-ping" />
        </div>
        <div className="flex flex-col">
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] whitespace-nowrap">
              LOGIC_GAZE_ACTIVE
            </span>
            <span className="text-[6px] text-gray-500 font-mono uppercase tracking-widest">Target: root://net_folder</span>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-4 justify-center">
        {directive ? (
            <div className="flex items-center gap-3 px-5 py-1.5 bg-amber-600/10 border-2 border-amber-600/40 rounded-2xl animate-in slide-in-from-top-2 duration-700 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <TerminalIcon className="w-4 h-4 text-amber-400" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase truncate tracking-tight">
                      DIRECTIVE: {directive.title}
                    </span>
                    <span className="text-[7px] text-amber-500 font-bold uppercase tracking-widest opacity-80">
                      TASK: {directive.activeTask || 'STANDBY FOR INGRESS'}
                    </span>
                </div>
                <div className="h-6 w-px bg-white/10 mx-2" />
                <div className="flex flex-col items-end">
                    <span className="text-[7px] font-mono text-amber-600">
                        HASH: {directive.integritySignature}
                    </span>
                    <span className="text-[6px] text-green-500 font-black uppercase">SYNCED</span>
                </div>
            </div>
        ) : (
            <div className="flex items-center gap-3">
                <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-gray-800 rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                    ))}
                </div>
                <span className="text-[9px] text-gray-600 italic uppercase font-black tracking-[0.4em] animate-pulse">
                    GAZING INTO THE DIGITAL ABYSS...
                </span>
            </div>
        )}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
                <ShieldIcon className="w-3 h-3 text-gray-700 group-hover:text-green-500 transition-colors" />
                <span className="text-[8px] font-black text-gray-600 group-hover:text-gray-400 uppercase tracking-tighter">SECURE_LATTICE</span>
            </div>
            <div className="text-[7px] font-mono text-gray-800 tracking-tighter">
                LATENCY: 0.02ms
            </div>
        </div>
        <div className="w-10 h-10 border-4 border-black bg-slate-900 rounded-xl flex items-center justify-center shadow-[4px_4px_0_0_#000]">
            <ActivityIcon className="w-6 h-6 text-amber-900" />
        </div>
      </div>
    </div>
  );
};
