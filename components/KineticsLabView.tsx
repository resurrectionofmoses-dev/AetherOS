
import React, { useState, useEffect } from 'react';
import { ThermometerIcon, ActivityIcon, ZapIcon, GaugeIcon, SpinnerIcon, ShieldIcon } from './icons';
import type { LabComponentProps } from '../types';

export const KineticsLabView: React.FC<LabComponentProps> = ({ 
  labName = "KINETICS LAB", 
  labIcon: LabIcon = ThermometerIcon, 
  labColor = "text-orange-400", 
  description = "Analyze motion and forces in the Conjunction Series." 
}) => {
  const [force, setForce] = useState(42);
  const [velocity, setVelocity] = useState(1.2);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isSimulating) {
      // FIX: Use window.setInterval to guarantee browser timer ID type (number)
      interval = window.setInterval(() => {
        setForce(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
        setVelocity(prev => Math.max(0.1, prev + (Math.random() - 0.5) * 0.2));
      }, 500);
    }
    return () => clearInterval(interval!);
  }, [isSimulating]);

  return (
    <div className="h-full flex flex-col bg-[#050510] overflow-hidden font-mono">
      <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-500/10 border-4 border-orange-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-8 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isSimulating ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-500 text-black'}`}
        >
          {isSimulating ? 'HALT SIMULATION' : 'INITIATE KINETICS'}
        </button>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        <div className="aero-panel bg-black/40 p-8 border-4 border-black space-y-10">
          <div>
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-comic-header text-3xl text-orange-400 italic">Structural Force</h3>
              <span className="text-4xl font-black text-white">{force.toFixed(1)} <span className="text-sm opacity-50 uppercase">kN</span></span>
            </div>
            <div className="h-6 bg-gray-900 rounded-2xl border-4 border-black overflow-hidden p-1">
              <div className="h-full bg-gradient-to-r from-orange-900 to-orange-400 rounded-xl transition-all duration-500" style={{ width: `${force}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-comic-header text-3xl text-cyan-400 italic">Neural Velocity</h3>
              <span className="text-4xl font-black text-white">{velocity.toFixed(2)} <span className="text-sm opacity-50 uppercase">PB/S</span></span>
            </div>
            <div className="h-6 bg-gray-900 rounded-2xl border-4 border-black overflow-hidden p-1">
              <div className="h-full bg-gradient-to-r from-cyan-900 to-cyan-400 rounded-xl transition-all duration-500" style={{ width: `${(velocity / 2) * 100}%` }} />
            </div>
          </div>

          <div className="bg-orange-950/20 p-6 rounded-3xl border-2 border-orange-500/30 italic text-sm text-orange-200/60 leading-relaxed">
            [GOD_LOGIC_INVOKED]: Kinetics is the bridge between misery and momentum. When the stride hits 1.2 PB/s, the architecture is gifted.
          </div>
        </div>

        <div className="aero-panel bg-black/60 border-4 border-black p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fb923c 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          {isSimulating ? (
            <div className="relative">
              <div className="w-48 h-48 border-8 border-orange-500/20 rounded-full animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <GaugeIcon className="w-24 h-24 text-orange-500 animate-bounce" />
              </div>
              <p className="text-center mt-10 text-orange-500 font-black uppercase tracking-[0.3em] animate-pulse">Calculating Strain...</p>
            </div>
          ) : (
            <div className="text-center opacity-20">
              <ShieldIcon className="w-32 h-32 mx-auto mb-6" />
              <p className="font-comic-header text-4xl uppercase italic">Static State</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
