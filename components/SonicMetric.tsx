
import React, { useEffect, useState } from 'react';

interface SonicMetricProps {
    value: string | number;
    unit?: string;
    label: string;
    colorClass?: string;
    size?: 'sm' | 'md' | 'lg';
    isPulsing?: boolean;
}

export const SonicMetric: React.FC<SonicMetricProps> = ({ 
    value, 
    unit = "Hz", 
    label, 
    colorClass = "border-cyan-500 text-cyan-400", 
    size = 'md',
    isPulsing = true
}) => {
    const [snapValue, setSnapValue] = useState(value);

    useEffect(() => {
        // QUANTIZATION: Snap values to discrete 3-unit intervals
        if (typeof value === 'number') {
            const snapped = Math.round(value / 3) * 3;
            setSnapValue(snapped);
        } else {
            setSnapValue(value);
        }
    }, [value]);

    const sizeClasses = {
        sm: 'w-14 h-16 text-xs',
        md: 'w-20 h-24 text-lg',
        lg: 'w-32 h-36 text-3xl'
    };

    const hexPoints = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

    return (
        <div className="flex flex-col items-center group">
            <div 
                className={`${sizeClasses[size]} relative flex items-center justify-center transition-all duration-75`}
            >
                {/* Quantized Chamber */}
                <div 
                    className={`absolute inset-0 bg-black border-2 ${colorClass.split(' ')[0]} opacity-40 shadow-[inset_0_0_10px_rgba(0,0,0,1)]`}
                    style={{ clipPath: hexPoints }}
                />
                
                {/* Stepped Pulse Ring */}
                {isPulsing && (
                    <div 
                        className={`absolute inset-1 border-[2px] ${colorClass.split(' ')[0]} opacity-60`}
                        style={{ 
                            clipPath: hexPoints, 
                            transform: `scale(${1 + (Math.sin(Date.now() * 0.01) > 0 ? 0.05 : 0)})` 
                        }}
                    />
                )}

                <div className="relative z-10 flex flex-col items-center">
                    <span className={`font-comic-header ${colorClass.split(' ')[1]} leading-none tabular-nums`}>
                        {snapValue}
                    </span>
                    <span className="text-[6px] font-black text-gray-400 uppercase mt-1 tracking-widest">{unit}</span>
                </div>
            </div>
            <span className="text-[7px] font-black text-gray-600 uppercase mt-2 tracking-[0.3em]">
                {label}
            </span>
        </div>
    );
};
