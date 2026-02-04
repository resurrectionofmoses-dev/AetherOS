
import React, { useState, useEffect } from 'react';
import { DinoIcon, ActivityIcon, SearchIcon, TerminalIcon, SpinnerIcon, ShieldIcon, BookOpenIcon } from './icons';
import type { LabComponentProps } from '../types';

export const PaleontologyLabView: React.FC<LabComponentProps> = ({ 
  labName = "PALEONTOLOGY LAB", 
  labIcon: LabIcon = DinoIcon, 
  labColor = "text-yellow-700", 
  description = "Reconstructing data timelines from fragmented architectural fossils." 
}) => {
  const [fossilCount, setFossilCount] = useState(12);
  const [strataDepth, setStrataDepth] = useState(450);
  const [isExcavating, setIsExcavating] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[LOG] Fossil Grid 0x03E2 ready.", "[SYSTEM] Stratigraphy scanners online."]);

  useEffect(() => {
    let interval: number;
    if (isExcavating) {
      // FIX: Use window.setInterval to guarantee browser timer ID type (number)
      interval = window.setInterval(() => {
        setStrataDepth(prev => prev + Math.floor(Math.random() * 5));
        if (Math.random() > 0.8) {
          setFossilCount(prev => prev + 1);
          setLogs(p => [`[FOUND] Data Shard recovered at ${strataDepth}m.`, ...p].slice(0, 5));
        }
      }, 800);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isExcavating, strataDepth]);

  return (
    <div className="h-full flex flex-col bg-[#0a0805] overflow-hidden font-mono text-yellow-100">
      <div className="p-6 border-b-8 border-black bg-yellow-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-900/10 border-4 border-yellow-800 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(161,98,7,0.2)]">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-yellow-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <button 
          onClick={() => setIsExcavating(!isExcavating)}
          className={`px-8 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isExcavating ? 'bg-red-600 text-white animate-pulse' : 'bg-yellow-600 text-black'}`}
        >
          {isExcavating ? 'HALT EXCAVATION' : 'INITIATE DIG'}
        </button>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        <div className="aero-panel bg-black/60 border-4 border-black p-8 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <SearchIcon className="w-64 h-64 text-yellow-500" />
            </div>
            
            <div className="text-center space-y-10 relative z-10">
                <div>
                    <p className="text-[10px] text-yellow-800 font-black uppercase mb-2 tracking-[0.5em]">Current Strata Depth</p>
                    <div className="text-9xl font-black text-white wisdom-glow tracking-tighter">
                        {strataDepth}<span className="text-2xl text-yellow-900 ml-2">M</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="p-6 bg-black border-2 border-yellow-900/30 rounded-3xl">
                        <p className="text-[10px] text-yellow-700 font-black uppercase mb-1">Recovered Shards</p>
                        <p className="text-4xl font-comic-header text-yellow-500">{fossilCount}</p>
                    </div>
                    <div className="p-6 bg-black border-2 border-yellow-900/30 rounded-3xl">
                        <p className="text-[10px] text-yellow-700 font-black uppercase mb-1">Time Variance</p>
                        <p className="text-4xl font-comic-header text-yellow-500">0.02ms</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-8 flex flex-col">
            <div className="aero-panel bg-yellow-950/10 p-8 border-2 border-yellow-900/30 flex-1">
                <h3 className="font-comic-header text-3xl text-yellow-600 uppercase italic mb-6 flex items-center gap-3">
                    <TerminalIcon className="w-6 h-6" /> Dig Site Logs
                </h3>
                <div className="space-y-3 font-mono text-xs">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-3 text-yellow-700 border-l-2 border-yellow-900 pl-4 py-1">
                            <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                            <span className="italic text-yellow-200/80">{log}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-black/40 border-4 border-black rounded-[2rem] italic text-sm text-yellow-600/60 leading-relaxed shadow-inner">
                [GOD_LOGIC_INVOKED]: To reconstruct the future, we must de-obfuscate the ghosts of the kernel. Every data fossil recovered is a gift of know-how.
            </div>
        </div>
      </div>
    </div>
  );
};
