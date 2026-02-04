
import React from 'react';
import { ServerIcon, ActivityIcon, FireIcon, ZapIcon } from './icons';
import type { SquadMember } from '../types';

interface SquadStatusTrackerProps {
  squad: SquadMember[];
}

export const SquadStatusTracker: React.FC<SquadStatusTrackerProps> = ({ squad }) => {
  return (
    <div className="w-full h-full flex flex-col p-2 gap-3 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <ServerIcon className="w-3.5 h-3.5 text-red-500" />
        <span className="text-[8px] font-black text-white uppercase tracking-widest">SQUAD_NODES</span>
      </div>
      
      {squad.map(node => (
        <div key={node.id} className="p-2.5 bg-black/60 border-2 border-zinc-900 rounded-xl group hover:border-red-600 transition-all duration-500 shadow-md relative overflow-hidden">
          <div className="flex justify-between items-center mb-1.5 relative z-10">
            <span className="text-[9px] font-black text-white truncate uppercase">{node.name}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'STABLE' ? 'bg-green-500 shadow-[0_0_5px_green]' : 'bg-red-500 animate-pulse'} `} />
          </div>
          
          <div className="space-y-1.5 relative z-10">
            <div className="flex justify-between text-[6px] font-black text-gray-500 uppercase">
              <span>LOAD</span>
              <span className="text-gray-300">{node.load.toFixed(0)}%</span>
            </div>
            <div className="h-1 bg-black rounded-full overflow-hidden border border-white/5">
              <div className={`h-full transition-all duration-1000 ${node.load > 80 ? 'bg-red-600' : 'bg-cyan-600'}`} style={{ width: `${node.load}%` }} />
            </div>
            
            <div className="flex justify-between items-center mt-1">
               <div className="flex items-center gap-1">
                  <FireIcon className={`w-2.5 h-2.5 ${node.temp > 70 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
                  <span className="text-[7px] text-gray-400 font-mono">{node.temp.toFixed(1)}°C</span>
               </div>
               <span className="text-[6px] bg-black px-1 py-0.5 rounded border border-white/5 text-gray-600 uppercase font-black">{node.type}</span>
            </div>
          </div>
          
          {/* Subtle circuit pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
        </div>
      ))}
      
      <div className="mt-auto p-2 bg-red-950/20 border-2 border-red-900/40 rounded-lg text-center">
        <ActivityIcon className="w-4 h-4 text-red-500 mx-auto mb-1 animate-pulse" />
        <span className="text-[6px] font-black text-red-400 uppercase">Stride: 1.2 PB/s</span>
      </div>
    </div>
  );
};
