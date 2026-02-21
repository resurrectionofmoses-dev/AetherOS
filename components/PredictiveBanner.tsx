
import React, { useState, useEffect } from 'react';
import { WarningIcon, ZapIcon, ShieldIcon, CheckCircleIcon, EyeIcon } from './icons';
import type { PredictiveAlert } from '../types';

interface PredictiveBannerProps {
    alert: PredictiveAlert | null;
    onFix: (alert: PredictiveAlert) => void;
    onDismiss: () => void;
}

export const PredictiveBanner: React.FC<PredictiveBannerProps> = ({ alert, onFix, onDismiss }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (alert) {
            setIsVisible(true);
            setTimeLeft(alert.timeToImpact);
            const interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setIsVisible(false);
        }
    }, [alert]);

    if (!alert || !isVisible) return null;

    const isCritical = timeLeft <= 5;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-lg animate-in slide-in-from-top-4 duration-500">
            <div className={`relative overflow-hidden rounded-xl border-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-colors duration-500 ${isCritical ? 'bg-red-950/95 border-red-500' : 'bg-amber-950/95 border-amber-500'}`}>
                
                {/* Background Scanline */}
                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(255,255,255,0.1) 50%)', backgroundSize: '100% 4px' }} />
                
                {/* Progress Bar Loader (Time Left) */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-black w-full">
                    <div 
                        className={`h-full transition-all duration-1000 ease-linear ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} 
                        style={{ width: `${(timeLeft / alert.timeToImpact) * 100}%` }} 
                    />
                </div>

                <div className="p-3 sm:p-4 flex flex-row items-center justify-between gap-4 relative z-10">
                    
                    {/* Icon & Data */}
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center shrink-0 ${isCritical ? 'border-red-500 bg-red-900/40 animate-ping-slow' : 'border-amber-500 bg-amber-900/40'}`}>
                            <EyeIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${isCritical ? 'text-white' : 'text-amber-400'}`} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-px rounded border ${isCritical ? 'bg-red-600 text-black border-black' : 'bg-amber-600 text-black border-black'}`}>
                                    PRE-COG
                                </span>
                                <span className="text-[8px] font-mono text-white/80 whitespace-nowrap">PROB: {alert.probability}%</span>
                            </div>
                            <h3 className="text-sm sm:text-base font-comic-header text-white uppercase italic tracking-tighter leading-none mb-0.5 truncate">
                                {alert.title}
                            </h3>
                            <p className="text-[8px] text-gray-300 font-mono truncate">
                                PATTERN: <span className={isCritical ? 'text-red-300' : 'text-amber-300'}>{alert.detectedPattern}</span>
                            </p>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="text-right leading-none">
                            <span className="text-[6px] font-black text-gray-500 uppercase tracking-widest block">IMPACT IN</span>
                            <span className={`text-xl font-black font-mono ${isCritical ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                00:{timeLeft.toString().padStart(2, '0')}
                            </span>
                        </div>
                        <button 
                            onClick={() => onFix(alert)}
                            className={`vista-button px-4 py-1.5 font-black uppercase text-[9px] tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0_0_#000] active:translate-y-0.5 ${isCritical ? 'bg-white text-red-600 hover:bg-gray-200' : 'bg-amber-500 text-black hover:bg-amber-400'}`}
                        >
                            <ZapIcon className="w-3 h-3" />
                            FIX (+{alert.reward})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
