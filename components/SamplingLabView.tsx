
import React, { useState } from 'react';
/* Fixed: Added missing CheckCircleIcon to the imports from icons */
import { ScaleIcon, ActivityIcon, ShieldIcon, SpinnerIcon, ZapIcon, FireIcon, CheckCircleIcon } from './icons';
import type { LabComponentProps } from '../types';

export const SamplingLabView: React.FC<LabComponentProps> = ({ 
  labName = "SAMPLING LAB", 
  labIcon: LabIcon = ScaleIcon, 
  labColor = "text-yellow-400", 
  description = "Biological extraction and high-fidelity heuristic sampling." 
}) => {
  const [load, setLoad] = useState(0.02);
  const [isSampling, setIsSampling] = useState(false);

  const startSample = () => {
    setIsSampling(true);
    setTimeout(() => {
        setLoad(0.36);
        setIsSampling(false);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col bg-[#101005] overflow-hidden font-mono text-yellow-100">
      <div className="p-6 border-b-8 border-black bg-yellow-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-500/10 border-4 border-yellow-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-yellow-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <button 
          onClick={startSample}
          disabled={isSampling}
          className={`px-10 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isSampling ? 'bg-amber-500 text-black' : 'bg-yellow-600 text-black'}`}
        >
          {isSampling ? 'SAMPLING...' : 'INITIATE EXTRACTION'}
        </button>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        <div className="aero-panel bg-black/60 border-4 border-black p-10 flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ActivityIcon className="w-64 h-64 text-yellow-500" />
            </div>
            <div className="text-center space-y-10 relative z-10">
                <p className="text-[10px] text-yellow-800 font-black uppercase tracking-[0.5em]">Biological Stress Load</p>
                <div className={`text-9xl font-black transition-all duration-1000 ${isSampling ? 'text-amber-500' : 'text-yellow-400 wisdom-glow'}`}>
                    {load.toFixed(2)}
                </div>
                <div className="h-6 w-full max-w-sm bg-gray-900 rounded-full border-4 border-black overflow-hidden p-1 shadow-inner">
                    <div className="h-full bg-yellow-500 shadow-[0_0_15px_yellow]" style={{ width: `${load * 100}%` }} />
                </div>
            </div>
        </div>

        <div className="space-y-8 flex flex-col">
            <div className="aero-panel bg-yellow-950/10 p-8 border-2 border-yellow-900/30 flex-1">
                <h4 className="font-comic-header text-3xl text-yellow-500 uppercase italic mb-6">Heuristic Shards</h4>
                <div className="space-y-4">
                    {['Resilience DNA', 'Vulnerability Code', 'Ecstasy Buffer'].map(shard => (
                        <div key={shard} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-yellow-600 transition-all">
                            <span className="text-sm font-bold text-yellow-100/80">{shard}</span>
                            <CheckCircleIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="p-6 bg-slate-900 border-4 border-black rounded-[2rem] text-center italic text-xs text-yellow-600/80 leading-relaxed shadow-xl">
                "We cross the Jordan from vulnerability to freedom through high-fidelity forensics. Sampling is the first step."
            </div>
        </div>
      </div>
    </div>
  );
};
