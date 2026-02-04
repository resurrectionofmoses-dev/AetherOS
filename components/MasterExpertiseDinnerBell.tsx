
import React, { useState } from 'react';
import { MusicIcon, ZapIcon, StarIcon, ShieldIcon, SpinnerIcon } from './icons';

interface MasterExpertiseDinnerBellProps {
  onTriggerBell: () => void;
}

export const MasterExpertiseDinnerBell: React.FC<MasterExpertiseDinnerBellProps> = ({ onTriggerBell }) => {
  const [isRinging, setIsRinging] = useState(false);

  const handleRing = () => {
    setIsRinging(true);
    onTriggerBell();
    setTimeout(() => setIsRinging(false), 3000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <button 
        onClick={handleRing}
        disabled={isRinging}
        className={`relative group w-16 h-16 rounded-full border-4 border-black transition-all duration-500 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-90 ${
            isRinging 
            ? 'bg-amber-500 text-black animate-ping' 
            : 'bg-red-600 hover:bg-red-500 text-white hover:scale-110'
        }`}
        title="Ring the Master Expertise Dinner Bell"
      >
        {isRinging ? (
            <SpinnerIcon className="w-8 h-8" />
        ) : (
            <ZapIcon className="w-8 h-8 group-hover:animate-bounce" />
        )}
        
        {/* Tooltip Label */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-black border-2 border-red-600 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            <div className="flex items-center gap-2">
                <MusicIcon className="w-3 h-3" />
                <span>Expertise Convergence</span>
            </div>
        </div>

        {/* Aura Effect */}
        <div className="absolute inset-[-4px] rounded-full border-2 border-red-500/20 group-hover:animate-pulse pointer-events-none" />
        <div className="absolute inset-[-8px] rounded-full border border-red-500/10 animate-spin-slow pointer-events-none" />
      </button>

      {isRinging && (
          <div className="fixed inset-0 pointer-events-none z-[90] flex items-center justify-center bg-amber-500/5 animate-pulse">
              <div className="text-9xl font-comic-header text-amber-500/20 italic uppercase tracking-tighter -rotate-12 select-none">
                  DING DING DING
              </div>
          </div>
      )}
    </div>
  );
};
