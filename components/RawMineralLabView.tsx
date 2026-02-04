
import React, { useState } from 'react';
import { GemIcon, ActivityIcon, ShieldIcon, SpinnerIcon, ZapIcon } from './icons';
import type { LabComponentProps } from '../types';

export const RawMineralLabView: React.FC<LabComponentProps> = ({ 
  labName = "RAW MINERAL LAB", 
  labIcon: LabIcon = GemIcon, 
  labColor = "text-stone-400", 
  description = "Elemental composition analysis and structural stress testing." 
}) => {
  const [purity, setPurity] = useState(94.2);
  const [isScanning, setIsScanning] = useState(false);

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setPurity(prev => +(prev + (Math.random() - 0.5)).toFixed(1));
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] overflow-hidden font-mono text-stone-300">
      <div className="p-6 border-b-8 border-black bg-stone-900 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-stone-500/10 border-4 border-stone-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-stone-500 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <button 
          onClick={runScan}
          disabled={isScanning}
          className="px-10 py-3 bg-stone-600 hover:bg-stone-500 text-black rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all disabled:opacity-50"
        >
          {isScanning ? 'ANALYZING...' : 'SCROLL SPECTRUM'}
        </button>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(120,113,108,0.05)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-xl w-full aero-panel bg-black/60 border-4 border-stone-800 p-10 text-center space-y-10 shadow-[20px_20px_0_0_rgba(0,0,0,1)]">
            <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-widest">Shard Purity</h3>
            
            <div className="relative">
                {isScanning && <div className="absolute inset-0 border-t-4 border-stone-400 animate-scan pointer-events-none z-20" />}
                <div className={`text-9xl font-black transition-all duration-700 ${isScanning ? 'opacity-20 blur-md' : 'text-stone-300 wisdom-glow'}`}>
                    {purity}%
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl">
                    <p className="text-[8px] text-stone-600 uppercase font-black mb-1">Density</p>
                    <p className="text-white font-bold">12.4 g/cm³</p>
                </div>
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl">
                    <p className="text-[8px] text-stone-600 uppercase font-black mb-1">Hardness</p>
                    <p className="text-white font-bold">9.5 MOHS</p>
                </div>
            </div>
            
            <p className="text-xs italic text-stone-500">"The integrity of the network is mirrored in the raw code mineral."</p>
        </div>
      </div>
    </div>
  );
};
