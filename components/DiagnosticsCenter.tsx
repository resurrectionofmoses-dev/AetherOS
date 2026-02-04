
import React, { useState, useMemo } from 'react';
import { DIAGNOSTIC_TROUBLE_CODES } from '../constants';
import type { VehicleSystem, MainView } from '../types';
import { WarningIcon, ZapIcon, SignalIcon } from './icons';

const systemFilters: (VehicleSystem | 'All')[] = ['All', 'Engine', 'Battery', 'Navigation', 'Infotainment'];

interface DiagnosticsCenterProps {
  onSetView: (view: MainView) => void;
}

export const DiagnosticsCenter: React.FC<DiagnosticsCenterProps> = ({ onSetView }) => {
  const [activeFilter, setActiveFilter] = useState<VehicleSystem | 'All'>('All');

  const filteredCodes = useMemo(() => {
    if (activeFilter === 'All') {
      return DIAGNOSTIC_TROUBLE_CODES;
    }
    return DIAGNOSTIC_TROUBLE_CODES.filter(code => code.system === activeFilter);
  }, [activeFilter]);

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg">
      <div className="p-4 border-b-4 border-black sticky top-0 z-10 bg-gray-800 rounded-t-lg flex justify-between items-center">
        <div>
            <h2 className="font-comic-header text-3xl text-white">Diagnostics Center</h2>
            <p className="text-gray-400 -mt-1">Vehicle Diagnostic Trouble Codes (DTC)</p>
        </div>
        <button 
            onClick={() => onSetView('zurich')}
            className="vista-button px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-black uppercase text-[10px] rounded-xl flex items-center gap-2"
        >
            <SignalIcon className="w-4 h-4" />
            <span>Open Healing Bridge</span>
        </button>
      </div>

      <div className="p-4 border-b-4 border-black">
        <div className="flex items-center gap-2 flex-wrap">
          {systemFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 text-sm rounded-full border-2 border-black font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-violet-500 text-white comic-button'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-3">
          {filteredCodes.map(code => (
            <div key={code.code} className="p-4 bg-gray-800/50 rounded-xl border-2 border-black flex items-start justify-between gap-4 group hover:border-violet-500/50 transition-all">
               <div className="flex items-start gap-4">
                  <WarningIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${code.severity === 'Error' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3">
                        <p className="font-mono text-lg font-bold text-white tracking-widest">{code.code}</p>
                        <p className="text-[8px] font-black text-gray-500 bg-gray-900 px-2 py-0.5 rounded-full border border-black uppercase tracking-widest">{code.system}</p>
                    </div>
                    <p className="text-gray-300 leading-tight mt-1 text-sm italic">"{code.description}"</p>
                  </div>
               </div>
               <button 
                onClick={() => onSetView('zurich')}
                className="opacity-0 group-hover:opacity-100 transition-opacity vista-button px-3 py-1 bg-violet-600 text-white font-black uppercase text-[8px] rounded-lg flex items-center gap-2"
               >
                 <ZapIcon className="w-3 h-3" />
                 Heal
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
