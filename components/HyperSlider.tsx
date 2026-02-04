
import React from 'react';
import { ActivityIcon, ClockIcon } from './icons';

interface HyperSliderProps {
  value: number;
  onChange: (val: number) => void;
}

export const HyperSlider: React.FC<HyperSliderProps> = ({ value, onChange }) => {
  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-40 bg-black/40 p-4 rounded-3xl border-2 border-white/5 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col items-center gap-1 mb-4">
        <ClockIcon className="w-5 h-5 text-amber-500 animate-pulse" />
        <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Temporal</span>
      </div>
      
      <div className="h-64 flex flex-col items-center relative">
        <input 
          type="range"
          min="0"
          max={Math.PI * 2}
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-full w-1 accent-amber-600 cursor-pointer appearance-none bg-gray-900 rounded-full vertical-range"
          style={{ appearance: 'none', writingMode: 'bt-lr' as any }}
        />
      </div>

      <div className="mt-4 flex flex-col items-center">
        <span className="text-[10px] font-mono text-amber-400 font-bold">{(value / Math.PI).toFixed(2)}π</span>
        <span className="text-[6px] font-black text-gray-700 uppercase tracking-[0.3em] mt-1">W-Axis</span>
      </div>

      <style>{`
        .vertical-range {
          transform: rotate(-180deg);
          -webkit-appearance: slider-vertical;
        }
      `}</style>
    </div>
  );
};
