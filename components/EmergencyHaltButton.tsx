
import React, { useState } from 'react';
import { FireIcon, ZapIcon, ShieldIcon, SpinnerIcon, WarningIcon } from './icons';

interface EmergencyHaltButtonProps {
  onTrigger: () => void;
  isHalted: boolean;
  onReset: () => void;
  hasAlarm: boolean;
}

export const EmergencyHaltButton: React.FC<EmergencyHaltButtonProps> = ({ onTrigger, isHalted, onReset, hasAlarm }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!hasAlarm && !isHalted) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-[101] flex items-center justify-center ${hasAlarm && !isHalted ? 'animate-shake' : ''}`}>
      {/* Adrenaline Screen Flash */}
      {hasAlarm && !isHalted && (
        <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none shadow-[inset_0_0_200px_rgba(255,0,0,0.5)]" />
      )}

      <div className="relative pointer-events-auto">
        {/* Warning Aura */}
        {!isHalted && (
          <div className="absolute inset-0 bg-red-600/60 blur-[100px] rounded-full animate-ping pointer-events-none scale-150" />
        )}

        <button 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={isHalted ? onReset : onTrigger}
          className={`relative group w-48 h-48 rounded-full border-[12px] transition-all duration-300 flex flex-col items-center justify-center shadow-[0_0_150px_rgba(255,0,0,0.8)] active:scale-90 ${
            isHalted 
            ? 'bg-amber-500 text-black border-white animate-pulse' 
            : 'bg-red-600 text-white border-black hover:bg-red-700 animate-bounce-fast'
          }`}
          title={isHalted ? "Reset Kinetic Interlock" : "ACTIVATE KINETIC HALT"}
        >
          {isHalted ? (
            <>
              <ShieldIcon className="w-16 h-16" />
              <span className="text-[12px] font-black uppercase mt-2">RE-ARM_SYSTEM</span>
            </>
          ) : (
            <>
              <WarningIcon className="w-24 h-24 group-hover:scale-125 transition-transform" />
              <span className="text-[16px] font-black uppercase mt-1 tracking-tighter">EMERGENCY STOP</span>
            </>
          )}

          {/* Adrenaline Label */}
          {!isHalted && (
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-black text-red-500 px-6 py-2 border-4 border-red-600 text-[14px] font-black uppercase tracking-[0.4em] animate-pulse whitespace-nowrap shadow-[0_0_30px_rgba(255,0,0,0.5)]">
               CRITICAL_FRACTURE_DETECTED
            </div>
          )}
        </button>
        
        {/* Status Line */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className={`px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-[0.3em] border-4 shadow-2xl transition-all ${
            isHalted ? 'bg-red-600 text-white border-white animate-bounce' : 'bg-black text-red-600 border-red-600 animate-pulse'
          }`}>
            KINETIC_{isHalted ? 'STASIS' : 'ALARM_ACTIVE'}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake {
          animation: shake 0.5s;
          animation-iteration-count: infinite;
        }
        .animate-bounce-fast {
          animation: bounce 0.5s infinite;
        }
      `}</style>
    </div>
  );
};
