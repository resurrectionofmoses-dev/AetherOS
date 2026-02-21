
import React from 'react';

interface HexMetricProps {
    value: string | number;
    label?: string;
    subLabel?: string;
    colorClass?: string;
    size?: 'nano' | 'sm' | 'md' | 'lg';
    glow?: boolean;
}

export const HexMetric: React.FC<HexMetricProps> = ({ 
    value, 
    label, 
    subLabel, 
    colorClass = "border-cyan-500 text-cyan-400", 
    size = 'md',
    glow = true
}) => {
    const sizeClasses = {
        nano: 'w-8 h-9 text-[10px]',
        sm: 'w-12 h-14 text-xs',
        md: 'w-16 h-20 text-lg',
        lg: 'w-24 h-28 text-3xl'
    };

    const labelSizes = {
        nano: 'text-[4px]',
        sm: 'text-[5px]',
        md: 'text-[7px]',
        lg: 'text-[9px]'
    };

    const hexPoints = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

    return (
        <div className={`flex flex-col items-center group transition-all duration-500 flex-shrink-0`}>
            <div 
                className={`${sizeClasses[size]} relative flex items-center justify-center transition-transform hover:scale-110`}
            >
                {/* Outer Glow/Border */}
                <div 
                    className={`absolute inset-0 bg-black border-[1px] ${colorClass.split(' ')[0]} opacity-20 group-hover:opacity-40 transition-opacity`}
                    style={{ clipPath: hexPoints }}
                />
                <div 
                    className={`absolute inset-[1px] border-[1px] ${colorClass.split(' ')[0]} ${glow ? 'shadow-[0_0_10px_rgba(0,0,0,0.5)]' : ''}`}
                    style={{ clipPath: hexPoints }}
                />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                    <span className={`font-comic-header ${colorClass.split(' ')[1]} leading-none tracking-tighter text-center`}>
                        {value}
                    </span>
                    {subLabel && size !== 'nano' && (
                        <span className="text-[5px] font-black text-gray-600 uppercase mt-0.5 tracking-tighter truncate w-full px-1 text-center">{subLabel}</span>
                    )}
                </div>

                {/* Animated Inner Pulse */}
                <div 
                    className={`absolute inset-0 ${colorClass.split(' ')[0]} opacity-5 group-hover:animate-ping pointer-events-none`}
                    style={{ clipPath: hexPoints }}
                />
            </div>
            {label && (
                <span className={`${labelSizes[size]} font-black text-gray-500 uppercase mt-0.5 tracking-widest group-hover:text-white transition-colors`}>
                    {label}
                </span>
            )}
        </div>
    );
};
