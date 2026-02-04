
import React from 'react';
import { FireIcon, ShieldIcon, WarningIcon } from './icons';

interface KillSwitchOverlayProps {
  isHalted: boolean;
  onTrigger: () => void;
  onReset: () => void;
}

export const KillSwitchOverlay: React.FC<KillSwitchOverlayProps> = ({ isHalted, onTrigger, onReset }) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] pointer-events-none">
      <div className="flex flex-col items-end gap-4">
        {/* The Master Command Seal */}
        <button 
          onClick={isHalted ? onReset : onTrigger}
          className={`pointer-events-auto group relative px-8 py-4 rounded-2xl border-4 transition-all duration-700 flex items-center gap-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] active:scale-95 ${
            isHalted 
            ? 'bg-[#1a0505] border-red-600 text-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
            : 'bg-red-600 border-white text-white hover:bg-red-700 hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
          }`}
        >
          {isHalted ? (
            <>
              <ShieldIcon className="w-6 h-6" />
              <div className="flex flex-col items-start">
                <span className="font-black uppercase tracking-[0.2em] text-sm leading-none">SYSTEM_HALTED</span>
                <span className="text-[7px] font-bold opacity-60 mt-1 uppercase">0x03E2_KINETIC_LOCK_ACTIVE</span>
              </div>
            </>
          ) : (
            <>
              <WarningIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <div className="flex flex-col items-start">
                <span className="font-black uppercase tracking-[0.2em] text-sm leading-none">EMERGENCY_ESTOP</span>
                <span className="text-[7px] font-bold opacity-60 mt-1 uppercase">IMMEDIATE_PHYSICAL_INTERRUPT</span>
              </div>
            </>
          )}
          
          {/* Forensic Heartbeat Indicator */}
          <div className={`absolute -left-1.5 -top-1.5 w-4 h-4 rounded-full border-4 border-black transition-colors duration-500 ${
            isHalted ? 'bg-red-600 animate-ping' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'
          }`} />
        </button>

        {/* Stasis Data Card */}
        {isHalted && (
          <div className="pointer-events-auto bg-black/90 border-4 border-red-900/60 p-6 rounded-3xl backdrop-blur-xl animate-in slide-in-from-right-10 duration-500 shadow-[20px_20px_60px_rgba(0,0,0,1)] max-w-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <FireIcon className="w-24 h-24 text-red-500" />
            </div>
            <div className="flex items-center gap-3 text-red-500 mb-4 border-b border-red-950 pb-2">
                <FireIcon className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">AETHER_KINETIC_STASIS</span>
            </div>
            <div className="space-y-3 font-mono text-[10px] leading-relaxed">
              <p className="text-red-200 italic">
                "All mechanical apertures (robotic_arm_01, printer_01) have been forcibly severed. Logic conduction is isolated to the virtual buffer."
              </p>
              <div className="p-2 bg-red-950/30 rounded-lg border border-red-900/40 text-[9px] text-red-400">
                <span className="font-black">WARNING:</span> Manual physical inspection required before re-arm.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
