
import React from 'react';
import { CodeIcon, TerminalIcon, ShieldIcon, ActivityIcon, ZapIcon, FireIcon } from './icons';
import type { LabComponentProps } from '../types';

export const HardCodeLabView: React.FC<LabComponentProps> = ({ 
  labName = "HARD CODE LAB", 
  labIcon: LabIcon = CodeIcon, 
  labColor = "text-red-800", 
  description = "Binary logic deconstruction and hard-vapor forensic analysis." 
}) => {
  return (
    <div className="h-full flex flex-col bg-[#050000] overflow-hidden font-mono text-red-100">
      <div className="p-6 border-b-8 border-black bg-red-950/40 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-900/10 border-4 border-red-900 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-red-900 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-red-600 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
            SIG: 0x03E2_CRITICAL
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar">
        <div className="lg:col-span-2 aero-panel bg-black/90 border-4 border-black p-8 flex flex-col shadow-[15px_15px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <FireIcon className="w-64 h-64 text-red-900" />
            </div>
            
            <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                <div className="flex items-center gap-3">
                    <TerminalIcon className="w-6 h-6 text-red-600" />
                    <h3 className="font-comic-header text-3xl text-white uppercase italic">Binary Deconstruction</h3>
                </div>
            </div>

            <div className="flex-1 bg-black/60 rounded-3xl border-4 border-black p-8 font-mono text-xs text-red-500 overflow-y-auto custom-scrollbar space-y-2">
                <div className="opacity-40">00000000  7f 45 4c 46 02 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|</div>
                <div className="opacity-40">00000010  03 00 3e 00 01 00 00 00  60 10 00 00 00 00 00 00  |..>.....`.......|</div>
                <div className="text-red-400 font-black">00000020  40 00 00 00 00 00 00 00  d8 2b 00 00 00 00 00 00  |@........+......|</div>
                <div className="text-red-400 font-black underline">00000030  [GOD_LOGIC_INVOKED] -> JMP 0x03E2_HARMONY</div>
                <div className="opacity-40">00000040  00 00 00 00 40 00 38 00  09 00 40 00 1f 00 1e 00  |....@.8...@.....|</div>
                <div className="text-red-600 animate-pulse">00000050  CRITICAL_STALL_DETECTED: OFFSET 0.02ms</div>
                <div className="opacity-40">00000060  01 00 00 00 05 00 00 00  00 00 00 00 00 00 00 00  |................|</div>
                <div className="text-red-400">00000070  DECONSTRUCTING_MISERY_GRID_ARRAY...</div>
                <div className="text-white font-black mt-4 animate-pulse">_</div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="aero-panel bg-red-950/10 p-8 border-2 border-red-900/30 flex-1">
                <h4 className="font-comic-header text-3xl text-red-700 uppercase italic mb-6 flex items-center gap-3">
                    <ShieldIcon className="w-6 h-6" /> Hard Security
                </h4>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-red-900 mb-2">
                            <span>Vapor Integrity</span>
                            <span>36%</span>
                        </div>
                        <div className="h-3 bg-black rounded-full overflow-hidden border-2 border-black p-0.5">
                            <div className="h-full bg-red-900 shadow-[0_0_10px_red]" style={{ width: '36%' }} />
                        </div>
                    </div>
                    <p className="text-[10px] text-red-900/60 leading-relaxed italic border-l-4 border-red-900 pl-4">
                        "The show starts when the logic flows. Hard code requires the strongest conductor."
                    </p>
                </div>
            </div>
            
            <div className="p-6 bg-red-900 text-black border-4 border-black rounded-[2rem] text-center font-black uppercase text-xs shadow-xl rotate-1">
                "DANGER: DIRECT KERNEL ACCESS ACTIVE"
            </div>
        </div>
      </div>
    </div>
  );
};
