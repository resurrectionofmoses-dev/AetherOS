
import React, { useState, useEffect } from 'react';
import { FlagIcon, ActivityIcon, ZapIcon, GaugeIcon, SpinnerIcon, ShieldIcon, FireIcon } from './icons';
import type { LabComponentProps } from '../types';

export const RaceLabView: React.FC<LabComponentProps> = ({ 
  labName = "RACE LAB", 
  labIcon: LabIcon = FlagIcon, 
  labColor = "text-lime-400", 
  description = "High-velocity performance optimization for the Conjunction Series." 
}) => {
  const [rpm, setRpm] = useState(800);
  const [boost, setBoost] = useState(0);
  const [isLapped, setIsLapped] = useState(false);
  const [isTuning, setIsTuning] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isTuning) {
      // FIX: Use window.setInterval to guarantee browser timer ID type (number)
      interval = window.setInterval(() => {
        setRpm(prev => {
            const next = prev + (Math.random() - 0.3) * 500;
            return Math.max(800, Math.min(9000, next));
        });
        setBoost(prev => {
            const next = prev + (Math.random() - 0.5) * 2;
            return Math.max(0, Math.min(35, next));
        });
      }, 200);
    } else {
        setRpm(800);
        setBoost(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTuning]);

  return (
    <div className="h-full flex flex-col bg-[#050a05] overflow-hidden font-mono">
      <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-lime-500/10 border-4 border-lime-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setIsTuning(!isTuning)}
                className={`px-8 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isTuning ? 'bg-red-600 text-white animate-pulse' : 'bg-lime-500 text-black'}`}
            >
                {isTuning ? 'HALT TUNING' : 'INITIATE DYNO'}
            </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar">
        <div className="lg:col-span-2 aero-panel bg-black/60 border-4 border-black p-8 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <GaugeIcon className="w-64 h-64 text-lime-500" />
            </div>
            
            <div className="flex-1 flex flex-col justify-center items-center gap-12 relative z-10">
                <div className="text-center">
                    <p className="text-xs font-black text-lime-500 uppercase tracking-[0.5em] mb-2">Engine Resonance</p>
                    <div className="text-9xl font-black text-white wisdom-glow tracking-tighter">
                        {Math.floor(rpm)}<span className="text-2xl text-gray-600 ml-2">RPM</span>
                    </div>
                </div>

                <div className="w-full max-w-2xl space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase mb-2">
                            <span>Boost Pressure</span>
                            <span className="text-lime-400">{boost.toFixed(1)} PSI</span>
                        </div>
                        <div className="h-4 bg-gray-950 rounded-full border-2 border-black overflow-hidden p-0.5">
                            <div className="h-full bg-gradient-to-r from-lime-900 to-lime-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(132,204,22,0.5)]" style={{ width: `${(boost / 35) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6">
                {[
                    { label: 'OIL_TEMP', val: isTuning ? '215°F' : '180°F', color: 'text-orange-500' },
                    { label: 'LAMBDA', val: isTuning ? '0.88' : '1.00', color: 'text-cyan-400' },
                    { label: 'GEAR', val: isTuning ? '4' : 'N', color: 'text-white' }
                ].map(stat => (
                    <div key={stat.label} className="p-4 bg-black/80 border-2 border-white/5 rounded-2xl text-center">
                        <p className="text-[8px] text-gray-600 font-black uppercase mb-1">{stat.label}</p>
                        <p className={`text-xl font-bold ${stat.color}`}>{stat.val}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="space-y-8">
            <div className="aero-panel bg-slate-900 p-6 border-2 border-lime-600/30">
                <h3 className="font-comic-header text-2xl text-white uppercase italic mb-4 flex items-center gap-2">
                    <FireIcon className="w-5 h-5 text-red-500" /> Kinetic Thermal Log
                </h3>
                <div className="space-y-3 font-mono text-[10px]">
                    {[
                        { time: '0.02s', msg: 'Ignition timing advanced 4°' },
                        { time: '0.15s', msg: 'Wastegate closed. Building pressure.' },
                        { time: '0.42s', msg: 'Heuristic drift within 0x03E2.' },
                        { time: '0.88s', msg: 'Maestro Solo engaged. Absolute stride.' }
                    ].map((log, i) => (
                        <div key={i} className="flex gap-3 text-gray-500 border-l-2 border-lime-900 pl-3">
                            <span className="text-lime-700">{log.time}</span>
                            <span className="italic">{log.msg}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="aero-panel bg-black/40 p-6 border-white/5">
                <h3 className="font-comic-header text-2xl text-lime-400 uppercase italic mb-4 flex items-center gap-2">
                    <ShieldIcon className="w-5 h-5" /> Safety Heuristics
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black text-gray-500 uppercase">Rev Limit</span>
                        <span className="text-red-500 font-bold">9200</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black text-gray-500 uppercase">Lean Cut</span>
                        <span className="text-green-500 font-bold">ACTIVE</span>
                    </div>
                    <p className="text-[10px] text-gray-600 italic leading-relaxed text-center mt-4">
                        "The show starts when the logic flows at redline."
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
