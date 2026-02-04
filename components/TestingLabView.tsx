
import React, { useState } from 'react';
import { TestTubeIcon, ActivityIcon, ShieldIcon, SpinnerIcon, ZapIcon, WarningIcon } from './icons';
import type { LabComponentProps } from '../types';

export const TestingLabView: React.FC<LabComponentProps> = ({ 
  labName = "TESTING LAB", 
  labIcon: LabIcon = TestTubeIcon, 
  labColor = "text-gray-400", 
  description = "Stress test execution and reliability verification." 
}) => {
  const [load, setLoad] = useState(14);
  const [isTesting, setIsTesting] = useState(false);

  const runTest = () => {
    setIsTesting(true);
    let l = 14;
    const interval = setInterval(() => {
        l += 5;
        setLoad(l);
        if (l >= 95) {
            clearInterval(interval);
            setIsTesting(false);
            setTimeout(() => setLoad(14), 2000);
        }
    }, 100);
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
          onClick={runTest}
          disabled={isTesting}
          className={`px-10 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isTesting ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-500 text-black'}`}
        >
          {isTesting ? 'TESTING...' : 'INITIATE STRESS'}
        </button>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        <div className="aero-panel bg-black/60 border-4 border-black p-10 flex flex-col justify-center items-center relative overflow-hidden">
            <h3 className="text-[10px] text-gray-600 font-black uppercase mb-10 tracking-[0.5em]">Neural Pressure Load</h3>
            
            <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="absolute inset-0 border-8 border-gray-900 rounded-full" />
                <div 
                    className="absolute inset-0 border-8 border-red-600 rounded-full transition-all duration-300"
                    style={{ clipPath: `inset(${100 - load}% 0 0 0)` }}
                />
                <div className={`text-6xl font-black ${load > 80 ? 'text-red-500 animate-bounce' : 'text-white'}`}>
                    {load}%
                </div>
            </div>

            {load > 80 && (
                <div className="mt-8 flex items-center gap-3 text-red-500 font-black uppercase text-xs animate-pulse">
                    <WarningIcon className="w-6 h-6" /> CRITICAL SATURATION
                </div>
            )}
        </div>

        <div className="space-y-8">
            <div className="aero-panel bg-gray-900/40 p-8 border-2 border-white/5">
                <h4 className="font-comic-header text-3xl text-white uppercase italic mb-6">Reliability Metrics</h4>
                <div className="space-y-6">
                    {[
                        { label: 'Uptime', val: '482,991s', ok: true },
                        { label: 'Latency', val: '0.02ms', ok: true },
                        { label: 'Drift', val: 'STABLE', ok: true },
                        { label: 'Thermal', val: 'OPTIMAL', ok: true }
                    ].map(m => (
                        <div key={m.label} className="flex justify-between items-center p-4 bg-black border border-white/5 rounded-2xl">
                            <span className="text-[10px] font-black uppercase text-gray-600">{m.label}</span>
                            <span className="text-white font-bold">{m.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-red-950/10 border-4 border-red-900/20 rounded-[2rem] text-center italic text-xs text-red-400/60 font-black uppercase">
                "Warning: High load can result in hard-vapor logic shards. Conduct with caution."
            </div>
        </div>
      </div>
    </div>
  );
};
