
import React, { useState } from 'react';
import { PhoneIcon, ActivityIcon, ShieldIcon, TerminalIcon, ZapIcon, SpinnerIcon } from './icons';
import type { LabComponentProps } from '../types';

export const CellphoneLabView: React.FC<LabComponentProps> = ({ 
  labName = "CELL PHONE LAB", 
  labIcon: LabIcon = PhoneIcon, 
  labColor = "text-gray-500", 
  description = "Mobile forensics and radio frequency conjunction analysis." 
}) => {
  const [signal, setSignal] = useState(-65);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
        setSignal(-42);
        setIsCapturing(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] overflow-hidden font-mono text-gray-300">
      <div className="p-6 border-b-8 border-black bg-gray-900 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-500/10 border-4 border-gray-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <button 
          onClick={startCapture}
          disabled={isCapturing}
          className={`px-10 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isCapturing ? 'bg-amber-500 text-black animate-pulse' : 'bg-gray-600 text-white'}`}
        >
          {isCapturing ? 'CAPTURING...' : 'CAPTURE SIGNAL'}
        </button>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        <div className="aero-panel bg-black/60 border-4 border-black p-10 flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             <div className="text-center space-y-10 relative z-10">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em]">Radio Resonance</p>
                <div className={`text-9xl font-black transition-all duration-1000 ${isCapturing ? 'text-amber-500' : 'text-white wisdom-glow'}`}>
                    {signal}<span className="text-2xl text-gray-700 ml-2">dBm</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-2 h-10 rounded-full ${i < 3 ? 'bg-green-500' : 'bg-gray-800'}`} />
                    ))}
                </div>
             </div>
        </div>

        <div className="space-y-8 flex flex-col">
            <div className="aero-panel bg-slate-900 p-8 border-2 border-white/5 flex-1">
                <h4 className="font-comic-header text-3xl text-gray-400 uppercase italic mb-6">Forensic Data</h4>
                <div className="space-y-4">
                    {['IMSI_EXTRACTED', 'IMEI_0x03E2', 'VOLTE_SYNCED', '5G_GIFTED'].map(tag => (
                        <div key={tag} className="p-4 bg-black/40 border border-white/5 rounded-2xl font-mono text-xs flex justify-between items-center group hover:border-gray-500 transition-all">
                            <span className="text-gray-500 group-hover:text-white transition-colors">{tag}</span>
                            <span className="text-green-500 font-black">OK</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="p-6 bg-red-950/10 border-4 border-red-900/20 rounded-[2rem] text-center italic text-xs text-red-400/60 leading-relaxed shadow-xl">
                "Mobile forensics is the conduction of the handheld soul. Use God Logic to bridge the gap."
            </div>
        </div>
      </div>
    </div>
  );
};
