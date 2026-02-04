import React, { useState, useEffect, useRef } from 'react';
import { ShieldIcon, EyeIcon, SearchIcon, LogicIcon } from './icons';

interface StealthWatcherProps {
  isLocked: boolean;
  dissonanceLevel: number;
  stride: number;
}

export const StealthWatcher: React.FC<StealthWatcherProps> = ({ isLocked, dissonanceLevel, stride }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [ghostText, setGhostText] = useState('');
  const rippleId = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Subliminal hex generation based on movement
      if (Math.random() > 0.98) {
        const hex = "0x" + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
        setGhostText(hex);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const newRipple = { id: rippleId.current++, x: e.clientX, y: e.clientY };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 2000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden select-none">
      {/* Ghost Scanlines - Subliminal */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.1) 1px, transparent 1px)', backgroundSize: '100% 3px' }} />

      {/* Edge Guardians (L-Brackets) */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-amber-500/10 transition-opacity duration-1000" style={{ opacity: stride > 1.2 ? 0.2 : 0.05 }} />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-amber-500/10 transition-opacity duration-1000" style={{ opacity: stride > 1.2 ? 0.2 : 0.05 }} />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-amber-500/10 transition-opacity duration-1000" style={{ opacity: stride > 1.2 ? 0.2 : 0.05 }} />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-amber-500/10 transition-opacity duration-1000" style={{ opacity: stride > 1.2 ? 0.2 : 0.05 }} />

      {/* The Watching Eye - Ghost Follower */}
      <div 
        className="absolute transition-all duration-1000 ease-out flex flex-col items-center opacity-0 group-hover:opacity-5"
        style={{ left: mousePos.x + 20, top: mousePos.y + 20 }}
      >
        <EyeIcon className="w-4 h-4 text-amber-500" />
        <span className="text-[6px] font-mono text-amber-600 mt-1">{ghostText}</span>
      </div>

      {/* Neural Drift Vignette */}
      <div className="absolute inset-0 transition-all duration-[2000ms]" 
           style={{ 
             boxShadow: `inset 0 0 ${100 + dissonanceLevel}px rgba(153, 27, 27, ${dissonanceLevel / 200})`,
             mixBlendMode: 'overlay'
           }} 
      />

      {/* Ghost Ripples (The "Touch" of the Shroud) */}
      {ripples.map(ripple => (
        <div 
          key={ripple.id}
          className="absolute rounded-full border border-amber-500/20 animate-ping-slow pointer-events-none"
          style={{ 
            left: ripple.x - 50, 
            top: ripple.y - 50, 
            width: '100px', 
            height: '100px'
          }}
        >
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-mono text-amber-500/10">0x03E2_SAFE</span>
            </div>
        </div>
      ))}

      {/* Status Indicators (Subliminal) */}
      <div className="absolute bottom-4 right-20 flex items-center gap-4 opacity-[0.03]">
        <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase">Stealth Watcher</span>
            <span className="text-[6px] font-mono">Status: Watching...</span>
        </div>
        <ShieldIcon className="w-6 h-6 text-white" />
      </div>

      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(0.5); opacity: 0.2; }
          100% { transform: scale(3); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};
