
import React, { useState, useEffect } from 'react';
import { ActivityIcon, ZapIcon, SignalIcon } from './icons';

interface ResonanceFrequencyMeterProps {
  level: number;
  isActive: boolean;
}

export const ResonanceFrequencyMeter: React.FC<ResonanceFrequencyMeterProps> = ({ level, isActive }) => {
  const [freq, setFreq] = useState(432); // Hz - The "Healing" frequency

  useEffect(() => {
    let interval: number;
    if (isActive) {
      interval = window.setInterval(() => {
        setFreq(f => 432 + (Math.random() - 0.5) * 20);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs animate-in zoom-in duration-500">
      <div className="bg-black/90 border-2 border-amber-500/50 rounded-2xl p-4 backdrop-blur-xl shadow-[0_0_40px_rgba(251,191,36,0.2)]">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
                <SignalIcon className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Resonance Seek: Level {level}</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400">{freq.toFixed(1)} Hz</span>
        </div>
        
        <div className="h-8 flex items-center justify-center gap-1 overflow-hidden px-2 bg-black/40 rounded-lg border border-white/5">
            {[...Array(15)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-1 bg-amber-500/60 rounded-full transition-all duration-150"
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                />
            ))}
        </div>
        <p className="text-[7px] text-gray-500 uppercase font-black text-center mt-2 tracking-[0.3em]">
          Aligning Conduction Frequency 0x03E2
        </p>
      </div>
    </div>
  );
};
