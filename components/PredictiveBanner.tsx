
import React, { useState, useEffect } from 'react';
import { WarningIcon, ZapIcon, ShieldIcon, CheckCircleIcon, EyeIcon, XIcon } from './icons';
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
            setTimeLeft(alert.timeToImpact || 0);
            if (alert.timeToImpact) {
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
            }
        } else {
            setIsVisible(false);
        }
    }, [alert]);

    if (!alert || !isVisible) return null;

    const isCritical = alert.severity === 'HIGH' || (timeLeft > 0 && timeLeft <= 5);
    const isError = alert.type === 'ERROR';

    return (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-in slide-in-from-top-2 duration-500">
            <div className={`relative overflow-hidden rounded-lg border shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-lg transition-colors duration-500 ${isError ? 'bg-red-950/90 border-red-600' : isCritical ? 'bg-orange-950/90 border-orange-500' : 'bg-amber-950/90 border-amber-500'}`}>
                
                {/* Background Scanline */}
                <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(255,255,255,0.05) 50%)', backgroundSize: '100% 2px' }} />
                
                {/* Progress Bar Loader (Time Left) */}
                {alert.timeToImpact && alert.timeToImpact > 0 && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-black w-full">
                        <div 
                            className={`h-full transition-all duration-1000 ease-linear ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} 
                            style={{ width: `${(timeLeft / alert.timeToImpact) * 100}%` }} 
                        />
                    </div>
                )}

                <div className="p-2 sm:p-3 flex flex-row items-center justify-between gap-3 relative z-10">
                    
                    {/* Icon & Data */}
                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${isCritical ? 'border-red-500 bg-red-900/40 animate-ping-slow' : 'border-amber-500 bg-amber-900/40'}`}>
                            <EyeIcon className={`w-4 h-4 ${isCritical ? 'text-white' : 'text-amber-400'}`} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`text-[6px] font-black uppercase tracking-wider px-1 py-px rounded border ${isError ? 'bg-red-600 text-black border-black' : isCritical ? 'bg-orange-600 text-black border-black' : 'bg-amber-600 text-black border-black'}`}>
                                    {alert.type || 'PRE-COG'}
                                </span>
                                {alert.probability !== undefined && (
                                    <span className="text-[7px] font-mono text-white/60 whitespace-nowrap">P: {alert.probability}%</span>
                                )}
                            </div>
                            <h3 className="text-xs font-comic-header text-white uppercase italic tracking-tighter leading-none mb-0.5 truncate">
                                {alert.title}
                            </h3>
                            {alert.message ? (
                                <p className="text-[9px] text-gray-300 font-mono leading-tight truncate">
                                    {alert.message}
                                </p>
                            ) : (
                                <p className="text-[7px] text-gray-400 font-mono truncate">
                                    P: <span className={isCritical ? 'text-red-300' : 'text-amber-300'}>{alert.detectedPattern}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        {alert.timeToImpact && alert.timeToImpact > 0 ? (
                            <div className="text-right leading-none">
                                <span className="text-[5px] font-black text-gray-500 uppercase tracking-widest block">ETA</span>
                                <span className={`text-sm font-black font-mono ${isCritical ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                    00:{(timeLeft || 0).toString().padStart(2, '0')}
                                </span>
                            </div>
                        ) : (
                            <button 
                                onClick={onDismiss}
                                className="text-gray-500 hover:text-white transition-colors p-1"
                            >
                                <XIcon className="w-3 h-3" />
                            </button>
                        )}
                        {alert.suggestedFix && (
                            <button 
                                onClick={() => onFix(alert)}
                                className={`vista-button px-2 py-1 font-black uppercase text-[8px] tracking-widest rounded flex items-center justify-center gap-1 transition-all shadow-[1px_1px_0_0_#000] active:translate-y-0.5 ${isCritical ? 'bg-white text-red-600 hover:bg-gray-200' : 'bg-amber-500 text-black hover:bg-amber-400'}`}
                            >
                                <ZapIcon className="w-2.5 h-2.5" />
                                FIX
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
