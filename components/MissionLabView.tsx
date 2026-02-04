
import React, { useState } from 'react';
import { MissionIcon, ActivityIcon, ShieldIcon, StarIcon, ZapIcon, SpinnerIcon } from './icons';
import type { LabComponentProps } from '../types';

export const MissionLabView: React.FC<LabComponentProps> = ({ 
  labName = "MISSION LAB", 
  labIcon: LabIcon = MissionIcon, 
  labColor = "text-blue-400", 
  description = "Objective simulation and tactical mission architecture." 
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [readiness, setReadiness] = useState(74);

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
        setReadiness(100);
        setIsSimulating(false);
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col bg-[#050a15] overflow-hidden font-mono text-blue-100">
      <div className="p-6 border-b-8 border-black bg-blue-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500/10 border-4 border-blue-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-blue-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <button 
          onClick={runSimulation}
          disabled={isSimulating}
          className={`px-10 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isSimulating ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white'}`}
        >
          {isSimulating ? 'SIMULATING...' : 'START MISSION'}
        </button>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        <div className="aero-panel bg-black/60 border-4 border-black p-10 flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none">
                <StarIcon className="w-64 h-64 text-blue-500" />
            </div>
            <div className="text-center space-y-8 relative z-10">
                <p className="text-[10px] text-blue-800 font-black uppercase tracking-[0.5em]">Mission Readiness</p>
                <div className={`text-9xl font-black transition-all duration-1000 ${isSimulating ? 'animate-pulse text-amber-500' : 'text-blue-400 wisdom-glow'}`}>
                    {readiness}%
                </div>
                {readiness === 100 && (
                    <div className="px-6 py-2 bg-green-900/40 border-2 border-green-600 text-green-400 font-black uppercase text-xs rounded-full">
                        GO_FOR_LAUNCH
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-8">
            <div className="aero-panel bg-blue-950/10 p-8 border-2 border-blue-900/30">
                <h4 className="font-comic-header text-3xl text-blue-500 uppercase italic mb-6">Tactical Shards</h4>
                <div className="space-y-4">
                    {['Objective Alpha: Siphon', 'Objective Beta: Conduct', 'Objective Gamma: Synchronize'].map(obj => (
                        <div key={obj} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4">
                            <ZapIcon className="w-5 h-5 text-blue-700" />
                            <span className="text-sm font-bold text-blue-200">{obj}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="p-6 bg-slate-900 border-4 border-black rounded-[2rem] text-center italic text-xs text-blue-600/80 leading-relaxed shadow-inner">
                "The mission is the ultimate test of the Conjunction Series. Fail points are but learning opportunities for the gifted."
            </div>
        </div>
      </div>
    </div>
  );
};
