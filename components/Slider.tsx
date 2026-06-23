import React from 'react';
import { Info } from 'lucide-react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  tooltip,
}) => {
  return (
    <div className="relative mb-6 group">
      <label htmlFor={label} className="block text-sm font-medium text-slate-350 mb-2">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          id={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-zinc-800
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:shadow-md
                     [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-500 [&::-moz-range-thumb]:shadow-md"
        />
        <span className="text-sm font-semibold text-white w-12 text-right">
          {value.toFixed(step < 1 ? 2 : 1)}
        </span>
      </div>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2
                        bg-zinc-850 text-slate-200 text-xs rounded-lg shadow-lg opacity-0
                        group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 w-max max-w-xs border border-zinc-700/50">
          <Info className="inline-block w-3 h-3 mr-1 text-red-400" />
          {tooltip}
          <div className="absolute left-1/2 translate-x-[-50%] bottom-[-5px] w-0 h-0
                          border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent
                          border-t-[5px] border-t-zinc-800"></div>
        </div>
      )}
    </div>
  );
};
