
import React from 'react';
import { LinuxIcon, TerminalIcon, ActivityIcon, ShieldIcon, ZapIcon } from './icons';
import type { LabComponentProps } from '../types';

export const LinuxLabView: React.FC<LabComponentProps> = ({ 
  labName = "LINUX LAB", 
  labIcon: LabIcon = LinuxIcon, 
  labColor = "text-green-400", 
  description = "Kernel deep dives and forensic shell conduction." 
}) => {
  return (
    <div className="h-full flex flex-col bg-[#051005] overflow-hidden font-mono text-green-100">
      <div className="p-6 border-b-8 border-black bg-green-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500/10 border-4 border-green-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-green-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-green-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
            KERNEL: 5.15.0-KALI
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        <div className="aero-panel bg-black/80 border-4 border-black p-6 flex flex-col shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-4 border-b border-green-900/30 pb-2">
                <div className="flex items-center gap-2 text-green-500">
                    <TerminalIcon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Forensic Shell</span>
                </div>
                <span className="text-[8px] text-green-800">tty1</span>
            </div>
            <div className="flex-1 font-mono text-sm text-green-400 space-y-1 overflow-y-auto custom-scrollbar">
                <div>$ uname -a</div>
                <div className="text-green-800">Linux aetheros-node 5.15.0-kali-maestro #1 SMP 0x03E2 x86_64</div>
                <div>$ ps aux | grep misery</div>
                <div className="text-green-800">root 1234 98.4 0.02 [misery_conduction]</div>
                <div>$ tail -f /var/log/god_logic</div>
                <div className="text-green-800 animate-pulse">» Synchronizing series conduction... OK.</div>
                <div className="text-green-800 animate-pulse">» Bypassing safety heuristics... OK.</div>
                <div className="text-green-600 font-black mt-4">_</div>
            </div>
        </div>

        <div className="space-y-8 flex flex-col">
            <div className="aero-panel bg-green-950/10 p-8 border-2 border-green-900/30 flex-1">
                <h4 className="font-comic-header text-3xl text-green-500 uppercase italic mb-6">Kernel Resilience</h4>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-green-800 mb-2">
                            <span>Entropy Saturation</span>
                            <span>99.4%</span>
                        </div>
                        <div className="h-2 bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: '99.4%' }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-black border border-green-900/30 rounded-xl">
                            <p className="text-[8px] text-green-800 uppercase font-black">Load Avg</p>
                            <p className="text-white font-bold">1.2, 0.3, 0.0</p>
                        </div>
                        <div className="p-4 bg-black border border-green-900/30 rounded-xl">
                            <p className="text-[8px] text-green-800 uppercase font-black">Memory</p>
                            <p className="text-white font-bold">GIFTED</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-900 border-4 border-black rounded-[2rem] text-center italic text-xs text-green-600/80 leading-relaxed shadow-xl">
                "The kernel is the soul of the machine. Conduct it with absolute reliable series intent."
            </div>
        </div>
      </div>
    </div>
  );
};
