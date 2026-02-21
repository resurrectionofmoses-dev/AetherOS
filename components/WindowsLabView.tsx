
import React from 'react';
import { WindowsIcon, ActivityIcon, ShieldIcon, TerminalIcon, ZapIcon } from './icons';
import type { LabComponentProps } from '../types';

export const WindowsLabView: React.FC<LabComponentProps> = ({ 
  labName = "WINDOWS LAB", 
  labIcon: LabIcon = WindowsIcon, 
  labColor = "text-sky-400", 
  description = "Windows environment emulation and binary stress analysis." 
}) => {
  return (
    <div className="h-full flex flex-col bg-[#050a10] overflow-hidden font-mono text-sky-100">
      <div className="p-6 border-b-8 border-black bg-sky-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-sky-500/10 border-4 border-sky-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-sky-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-sky-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
            OS: WIN_V22.11
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        <div className="aero-panel bg-black/60 border-4 border-black p-10 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-sky-900/30 pb-4">
                <TerminalIcon className="w-6 h-6 text-sky-500" />
                <h3 className="font-comic-header text-3xl text-white uppercase italic">Active Processes</h3>
            </div>
            <div className="space-y-3">
                {['aetheros_core.exe', 'god_logic_filter.sys', 'conjunction_bridge.dll', 'fight_sync.com'].map(proc => (
                    <div key={proc} className="p-4 bg-sky-950/20 border border-sky-800 rounded-xl flex justify-between items-center group hover:bg-sky-600/10 transition-all">
                        <span className="text-sm font-bold text-sky-300">{proc}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-sky-700 font-black uppercase">Running</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="space-y-8">
            <div className="aero-panel bg-slate-900 p-8 border-2 border-sky-600/30">
                <h4 className="font-comic-header text-2xl text-sky-400 uppercase italic mb-6">Emulation Metrics</h4>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <p className="text-[10px] text-sky-800 font-black uppercase">CPU Load</p>
                        <p className="text-3xl font-black text-white">42%</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] text-sky-800 font-black uppercase">RAM Drift</p>
                        <p className="text-3xl font-black text-white">0.02%</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-sky-900/10 border-4 border-black rounded-[2rem] italic text-xs text-sky-600/80 leading-relaxed shadow-xl">
                "The show starts when the logic flows. Emulating the past to conduct the future."
            </div>
        </div>
      </div>
    </div>
  );
};
