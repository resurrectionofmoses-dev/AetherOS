import React, { useState, useMemo } from 'react';
import { DIAGNOSTIC_TROUBLE_CODES } from '../constants';
import type { VehicleSystem, MainView, SystemStatus, SystemState } from '../types';
import { WarningIcon, ZapIcon, SignalIcon, FireIcon, ActivityIcon, CheckCircleIcon } from './icons';

const systemFilters: (VehicleSystem | 'All')[] = ['All', 'Engine', 'Battery', 'Navigation', 'Infotainment', 'Handling'];
const vehicleSystems: VehicleSystem[] = ['Engine', 'Battery', 'Navigation', 'Infotainment', 'Handling'];

interface DiagnosticsCenterProps {
  onSetView: (view: MainView) => void;
  systemStatus?: SystemStatus;
  onUpdateSystemStatus?: (system: VehicleSystem, state: SystemState) => void;
}

export const DiagnosticsCenter: React.FC<DiagnosticsCenterProps> = ({ onSetView, systemStatus, onUpdateSystemStatus }) => {
  const [activeFilter, setActiveFilter] = useState<VehicleSystem | 'All'>('All');

  const filteredCodes = useMemo(() => {
    if (activeFilter === 'All') {
      return DIAGNOSTIC_TROUBLE_CODES;
    }
    return DIAGNOSTIC_TROUBLE_CODES.filter(code => code.system === activeFilter);
  }, [activeFilter]);

  const cycleStatus = (system: VehicleSystem) => {
    if (!systemStatus || !onUpdateSystemStatus) return;
    const currentState = systemStatus[system];
    const states: SystemState[] = ['OK', 'Warning', 'Error'];
    const nextIdx = (states.indexOf(currentState) + 1) % states.length;
    onUpdateSystemStatus(system, states[nextIdx]);
  };

  const getStatusColorClass = (state: SystemState) => {
    switch (state) {
      case 'Error': return 'bg-red-600 text-white border-red-400';
      case 'Warning': return 'bg-amber-500 text-black border-amber-300';
      default: return 'bg-green-600 text-black border-green-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg">
      <div className="p-4 border-b-4 border-black sticky top-0 z-10 bg-gray-800 rounded-t-lg flex justify-between items-center">
        <div>
            <h2 className="font-comic-header text-3xl text-white">Diagnostics Center</h2>
            <p className="text-gray-400 -mt-1 uppercase text-[10px] font-black tracking-widest">Forensic Hub 0x03E2</p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => onSetView('healing_matrix')}
                className="vista-button px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] rounded-xl flex items-center gap-2 shadow-[4px_4px_0_0_#000]"
            >
                <FireIcon className="w-4 h-4" />
                <span>SYSTEM HEAL</span>
            </button>
            <button 
                onClick={() => onSetView('powertrain_conjunction')}
                className="vista-button px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-black uppercase text-[10px] rounded-xl flex items-center gap-2"
            >
                <SignalIcon className="w-4 h-4" />
                <span>Open Conjunction Sync</span>
            </button>
        </div>
      </div>

      <div className="p-4 border-b-4 border-black space-y-4">
        {/* System Override Panel */}
        <div className="aero-panel p-4 bg-black/40 border-2 border-white/5">
            <div className="flex items-center gap-2 mb-3">
                <ActivityIcon className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Manual System Override</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {vehicleSystems.map(sys => {
                    const state = systemStatus?.[sys] || 'OK';
                    return (
                        <button
                            key={sys}
                            onClick={() => cycleStatus(sys)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all active:scale-95 ${getStatusColorClass(state)}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-tighter mb-1">{sys}</span>
                            <span className="text-[8px] font-bold">{state}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mr-2">Filter Shards:</span>
          {systemFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 text-sm rounded-full border-2 border-black font-bold transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-violet-500 text-white comic-button shadow-[0_0_10px_rgba(139,92,246,0.3)]'
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
                        <p className={`text-[8px] font-black px-2 py-0.5 rounded-full border border-black uppercase tracking-widest ${
                          code.system === 'Handling' ? 'bg-blue-900 text-blue-300' : 'bg-gray-900 text-gray-500'
                        }`}>{code.system}</p>
                    </div>
                    <p className="text-gray-300 leading-tight mt-1 text-sm italic">"{code.description}"</p>
                    <p className="text-[7px] text-gray-700 font-mono mt-2 uppercase">Signature: {code.signature}</p>
                  </div>
               </div>
               <button 
                onClick={() => onSetView('healing_matrix')}
                className="opacity-0 group-hover:opacity-100 transition-opacity vista-button px-3 py-1 bg-violet-600 text-white font-black uppercase text-[8px] rounded-lg flex items-center gap-2 whitespace-nowrap"
               >
                 <ZapIcon className="w-3 h-3" />
                 Heal Shard
               </button>
            </div>
          ))}
          {filteredCodes.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-20">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                  <p className="font-comic-header text-2xl uppercase tracking-widest">All Shards Harmonized</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
