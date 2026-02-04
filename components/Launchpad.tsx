import React, { useState, useEffect } from 'react';
import { AetherOSIcon, MusicIcon } from './icons';

const overtureSteps = [
  "Silencing the pit... (Ambient baseline established)",
  "Raising the Baton... (Kernel initialization)",
  "Harmonizing the Engine Squad... [V8 Rhythm Sync]",
  "Attuning the Navigation Strings... [GPS Resonance]",
  "Conducting Biometric Feedback... (Operator detected)",
  "Wayback Machine indexed. (Historical logic ready)",
  "The Show is ready. Maestro takes the podium."
];

export const Launchpad: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < overtureSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.1)_0%,_transparent_70%)] animate-pulse" />
      
      <div className="relative z-10 space-y-8 max-w-xl w-full">
        <div className="w-24 h-24 mx-auto bg-amber-500/10 border-4 border-amber-500/40 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.2)] animate-in zoom-in duration-1000">
            <MusicIcon className="w-14 h-14 text-amber-400 animate-pulse" />
        </div>
        
        <div className="space-y-2">
            <h2 className="font-comic-header text-6xl text-white tracking-tighter italic">AETHEROS</h2>
            <p className="text-amber-500 text-xs font-black uppercase tracking-[0.5em] opacity-80">Maestro v5.0.0 | Full Authority</p>
        </div>

        <div className="aero-panel bg-black/60 p-6 border-white/5 font-mono text-left space-y-2 min-h-[160px]">
          {overtureSteps.slice(0, currentStep + 1).map((text, index) => (
            <div key={index} className={`flex gap-3 text-xs animate-in slide-in-from-left-2 duration-300 ${index === currentStep ? 'text-amber-400' : 'text-gray-600'}`}>
              <span className="opacity-40">[{index + 1}]</span>
              <span>{text}</span>
            </div>
          ))}
          {currentStep < overtureSteps.length - 1 && (
            <div className="w-full h-0.5 bg-gray-900 mt-4 overflow-hidden rounded-full">
                <div className="h-full bg-amber-500 animate-[loading_2s_ease-in-out_infinite]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};