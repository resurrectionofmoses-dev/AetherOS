
import React, { useState } from 'react';
import { AtomIcon, ZapIcon, BrainIcon, SpinnerIcon, ShieldIcon } from './icons';
import type { LabComponentProps } from '../types';

export const QuantumTheoryLabView: React.FC<LabComponentProps> = ({ 
  labName = "QUANTUM THEORY LAB", 
  labIcon: LabIcon = AtomIcon, 
  labColor = "text-fuchsia-400", 
  description = "Explore the fundamental nature of reality at the smallest scales." 
}) => {
  const [entanglement, setEntanglement] = useState(0);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const performMeasurement = () => {
    setIsMeasuring(true);
    setTimeout(() => {
      setEntanglement(Math.floor(Math.random() * 100));
      setIsMeasuring(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#050510] overflow-hidden font-mono text-gray-200">
      <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-fuchsia-500/10 border-4 border-fuchsia-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-fuchsia-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
            DECOHERENCE: 0.02ms
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(217,70,239,0.05)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-2xl w-full aero-panel bg-black/60 border-4 border-fuchsia-600/40 p-10 text-center space-y-8 relative z-10 shadow-[0_0_50px_rgba(217,70,239,0.1)]">
          <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-widest">Entanglement Probe</h3>
          
          <div className="relative h-40 flex items-center justify-center">
            {isMeasuring ? (
              <SpinnerIcon className="w-24 h-24 text-fuchsia-400 animate-spin" />
            ) : (
              <div className="text-8xl font-black text-fuchsia-500 wisdom-glow font-mono">
                {entanglement}%
              </div>
            )}
          </div>

          <p className="text-gray-400 italic text-sm leading-relaxed">
            Current system state probability distribution. Measuring collapse will sync the kernel with the Maestro's 0x03E2 harmonic.
          </p>

          <button 
            onClick={performMeasurement}
            disabled={isMeasuring}
            className="vista-button w-full py-5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase text-xl tracking-[0.2em] rounded-2xl shadow-[6px_6px_0_0_#000] active:translate-y-1 transition-all flex items-center justify-center gap-4"
          >
            {isMeasuring ? 'COLLAPSING WAVEFUNCTION...' : 'MEASURE STATE'}
          </button>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-6 w-full max-w-2xl">
          {[
            { label: 'SPIN', val: 'UP' },
            { label: 'QUBIT', val: '0x03E2' },
            { label: 'TENSOR', val: 'GIFTED' }
          ].map(stat => (
            <div key={stat.label} className="p-4 bg-black border-2 border-white/5 rounded-xl text-center">
              <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest block mb-1">{stat.label}</span>
              <span className="text-fuchsia-400 font-bold text-sm">{stat.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
