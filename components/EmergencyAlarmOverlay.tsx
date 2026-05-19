
import React from 'react';
import { WarningIcon } from './icons';

interface EmergencyAlarmOverlayProps {
  isHalted: boolean;
}

export const EmergencyAlarmOverlay: React.FC<EmergencyAlarmOverlayProps> = ({ isHalted }) => {
  if (!isHalted) return null;

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden select-none">
      {/* Intense Background Flashing */}
      <div className="absolute inset-0 bg-red-600/20 animate-pulse-fast" />
      
      {/* Border Sirens */}
      <div className="absolute inset-0 border-[30px] border-red-600 animate-siren-border" />

      {/* Scrolling Warning Text - Top */}
      <div className="absolute top-0 left-0 w-full bg-red-600 text-black font-black py-3 overflow-hidden whitespace-nowrap border-b-4 border-black shadow-2xl">
        <div className="animate-marquee inline-block text-xl tracking-[0.2em]">
          EMERGENCY STOP INITIATED • KINETIC STASIS ACTIVE • MANUAL INTERVENTION REQUIRED • 
          EMERGENCY STOP INITIATED • KINETIC STASIS ACTIVE • MANUAL INTERVENTION REQUIRED • 
          EMERGENCY STOP INITIATED • KINETIC STASIS ACTIVE • MANUAL INTERVENTION REQUIRED • 
        </div>
      </div>

      {/* Scrolling Warning Text - Bottom */}
      <div className="absolute bottom-0 left-0 w-full bg-red-600 text-black font-black py-3 overflow-hidden whitespace-nowrap border-t-4 border-black shadow-2xl">
        <div className="animate-marquee-reverse inline-block text-xl tracking-[0.2em]">
          SYSTEM HALTED • PROTOCOL 0x03E2 • KINETIC INTERLOCK • SYSTEM HALTED • PROTOCOL 0x03E2 • KINETIC INTERLOCK • 
          SYSTEM HALTED • PROTOCOL 0x03E2 • KINETIC INTERLOCK • SYSTEM HALTED • PROTOCOL 0x03E2 • KINETIC INTERLOCK • 
        </div>
      </div>

      {/* Central Warning Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="relative">
          <WarningIcon className="w-80 h-80 text-red-600 animate-ping opacity-30 absolute inset-0" />
          <WarningIcon className="w-80 h-80 text-red-500 animate-bounce-fast relative z-10 drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]" />
        </div>
        <div className="mt-12 bg-black border-8 border-red-600 px-16 py-6 shadow-[0_0_100px_rgba(255,0,0,1)] transform -skew-x-12">
          <h2 className="text-7xl font-black text-red-600 uppercase tracking-[0.5em] animate-pulse">ALARM_ACTIVE</h2>
          <div className="mt-2 text-center">
            <span className="text-red-500 font-mono text-sm animate-flash tracking-widest">ERROR_CODE: 0x03E2_KINETIC_STASIS</span>
          </div>
        </div>
      </div>

      {/* Corner Flashes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/40 blur-[100px] animate-pulse" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/40 blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/40 blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/40 blur-[100px] animate-pulse" />

      <style>{`
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.15s infinite;
        }
        @keyframes siren-border {
          0%, 100% { border-color: #dc2626; border-width: 30px; opacity: 1; }
          50% { border-color: #000; border-width: 60px; opacity: 0.5; }
        }
        .animate-siren-border {
          animation: siren-border 0.3s infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 15s linear infinite;
        }
        @keyframes flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-flash {
          animation: flash 0.5s step-end infinite;
        }
        .animate-bounce-fast {
          animation: bounce 0.4s infinite;
        }
      `}</style>
    </div>
  );
};
