
import React, { useState } from 'react';
import { FireIcon, ZapIcon, ShieldIcon, SpinnerIcon, WarningIcon } from './icons';

interface EmergencyHaltButtonProps {
  onTrigger: () => void;
  isHalted: boolean;
  onReset: () => void;
}

export const EmergencyHaltButton: React.FC<EmergencyHaltButtonProps> = ({ onTrigger, isHalted, onReset }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-[101]">
      <div className="relative">
        {/* Warning Aura */}
        {!isHalted && isHovered && (
          <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full animate-pulse pointer-events-none scale-150" />
        )}

        <button 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={isHalted ? onReset : onTrigger}
          className={`relative group w-20 h-20 rounded-full border-4 transition-all duration-500 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8)] active:scale-95 ${
            isHalted 
            ? 'bg-amber-500 text-black border-white animate-pulse' 
            : 'bg-black border-red-600 text-red-600 hover:bg-red-950/40 hover:scale-110'
          }`}
          title={isHalted ? "Reset Kinetic Interlock" : "ACTIVATE KINETIC HALT"}
        >
          {isHalted ? (
            <>
              <ShieldIcon className="w-8 h-8" />
              <span className="text-[6px] font-black uppercase mt-1">RE-ARM</span>
            </>
          ) : (
            <>
              <WarningIcon className="w-10 h-10 group-hover:scale-110 transition-transform" />
              <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">HALT</span>
            </>
          )}

          {/* Flip-Cover Simulation (Tooltip) */}
          {!isHalted && (
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-red-600 border-2 border-black text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl translate-x-[-10px] group-hover:translate-x-0">
               ⚠ EMERGENCY STOP
            </div>
          )}
        </button>
        
        {/* Status Line */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border-2 shadow-lg transition-all ${
            isHalted ? 'bg-red-600 text-white border-white animate-bounce' : 'bg-black text-gray-600 border-zinc-900'
          }`}>
            KINETIC_{isHalted ? 'STASIS' : 'FLOW'}
          </div>
        </div>
      </div>
    </div>
  );
};
