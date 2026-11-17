import React, { useState, useEffect } from 'react';
import aetherosShield from '../src/assets/images/aetheros_shield_512.png';
import aetherosBanner from '../src/assets/images/aetheros_logo_1780191892733.png';

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
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black relative overflow-hidden">
      <img
        src={aetherosBanner}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none select-none blur-[1px]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.14)_0%,_rgba(0,0,0,0.92)_70%)] pointer-events-none" />
      
      <div className="relative z-10 space-y-8 max-w-xl w-full">
        <div className="w-28 h-28 mx-auto bg-cyan-500/10 border-2 border-cyan-400/50 rounded-3xl overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-in zoom-in duration-1000">
            <img
              src={aetherosShield}
              alt="AetherOS Sovereign Shield"
              className="w-full h-full object-cover"
            />
        </div>
        
        <div className="space-y-2">
            <h2 className="font-comic-header text-6xl text-white tracking-tighter italic">AETHEROS</h2>
            <p className="text-cyan-400 text-xs font-black uppercase tracking-[0.5em] opacity-85">Maestro v5.0.0 | Sovereign Authority</p>
        </div>

        <div className="aero-panel bg-black/75 p-6 border-cyan-500/20 font-mono text-left space-y-2 min-h-[160px]">
          {overtureSteps.slice(0, currentStep + 1).map((text, index) => (
            <div key={index} className={`flex gap-3 text-xs animate-in slide-in-from-left-2 duration-300 ${index === currentStep ? 'text-cyan-300' : 'text-gray-600'}`}>
              <span className="opacity-40">[{index + 1}]</span>
              <span>{text}</span>
            </div>
          ))}
          {currentStep < overtureSteps.length - 1 && (
            <div className="w-full h-0.5 bg-gray-900 mt-4 overflow-hidden rounded-full">
                <div className="h-full bg-cyan-400 animate-[loading_2s_ease-in-out_infinite]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};