
import React, { useState, useEffect } from 'react';
import { ShieldIcon, ZapIcon, LockIcon } from './icons';

interface TheShroudProps {
  children: React.ReactNode;
  isSensitive?: boolean;
}

export const TheShroud: React.FC<TheShroudProps> = ({ children, isSensitive = true }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [glitchText, setGlitchText] = useState('');

  // Randomized Glitch Effect
  useEffect(() => {
    if (!isSensitive || isRevealed) return;
    const chars = "0123456789ABCDEF!@#$%^&*()_X";
    const interval = setInterval(() => {
      setGlitchText(Array(20).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join(''));
    }, 100);
    return () => clearInterval(interval);
  }, [isRevealed, isSensitive]);

  if (!isSensitive) return <>{children}</>;

  return (
    <div 
      className="relative group cursor-help"
      onMouseEnter={() => setIsRevealed(true)}
      onMouseLeave={() => setIsRevealed(false)}
    >
      <div className={`transition-all duration-500 ${isRevealed ? 'opacity-100 blur-0 scale-100' : 'opacity-20 blur-xl scale-95 grayscale'}`}>
        {children}
      </div>
      
      {!isRevealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-black/80 border border-red-600/50 px-3 py-1 rounded text-[8px] font-mono text-red-500 animate-pulse mb-2">
            SHROUD_ACTIVE: {glitchText}
          </div>
          <ShieldIcon className="w-8 h-8 text-gray-800 opacity-20" />
        </div>
      )}

      {/* Forensic Border */}
      <div className={`absolute inset-0 border-2 pointer-events-none transition-colors duration-700 ${isRevealed ? 'border-cyan-500/20' : 'border-red-900/10'}`} />
    </div>
  );
};
