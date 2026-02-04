

import React, { useState } from 'react';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { SpeakerOffIcon } from './icons/SpeakerOffIcon';
import { AetherOSIcon } from './icons/AetherOSIcon';
import { SearchIcon } from './icons/SearchIcon';
import { XIcon } from './icons/XIcon';
import { ActivityIcon as DateIcon, FireIcon, ZapIcon, ShieldIcon, ChevronDownIcon } from './icons';

interface ChatHeaderProps {
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  isTtsEnabled, onToggleTts, searchQuery, onSearchChange, 
  startDate, endDate, onDateChange 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const isFilterActive = searchQuery || startDate || endDate;
  const isDateActive = !!(startDate || endDate);

  const setPreset = (days: number | null) => {
    if (days === null) {
        onDateChange('', '');
        return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    onDateChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  const getTemporalSummary = () => {
    if (!startDate && !endDate) return null;
    if (startDate && endDate) return `${startDate} → ${endDate}`;
    if (startDate) return `Since ${startDate}`;
    return `Until ${endDate}`;
  };

  return (
    <div className="p-1.5 border-b-4 border-black sticky top-0 z-30 bg-gray-800 rounded-t-lg shadow-xl overflow-visible">
      <div className="max-w-4xl mx-auto space-y-1.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 min-w-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-300 border-2 border-black flex-shrink-0 rasta-vibe" data-theme="aetheros">
               <AetherOSIcon className="w-5 h-5 text-black" />
            </div>
            <div className="min-w-0 hidden sm:block">
                <h2 className="font-comic-header text-lg text-white leading-tight truncate">Conscious Nexus</h2>
                <p className="text-gray-300 text-[6px] leading-tight truncate -mt-0.5 uppercase tracking-widest font-black opacity-50">Temporal Logic Interface</p>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center px-1">
              <div className="relative w-full max-w-md group">
                  <div className={`absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-colors ${searchQuery ? 'text-amber-500' : 'text-gray-500'}`}>
                    <SearchIcon className="w-2.5 h-2.5" />
                    {isDateActive && (
                        <div className="relative">
                            <div className="w-0.5 h-0.5 rounded-full bg-cyan-500 animate-ping absolute -inset-0.5" />
                            <div className="w-0.5 h-0.5 rounded-full bg-cyan-500 relative z-10" title="Chronos Active" />
                        </div>
                    )}
                  </div>
                  <input 
                      type="search"
                      placeholder="Scour Neural History..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full bg-gray-900/80 border-2 border-black rounded-md py-0.5 pl-7 pr-20 text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500 text-white transition-all placeholder:text-gray-700 font-mono shadow-inner"
                  />
                  
                  {/* Persistent Mini Summary in Input */}
                  {!showFilters && isDateActive && (
                      <div className="absolute left-6 bottom-0 transform translate-y-1/2 pointer-events-none">
                          <span className="bg-cyan-950 text-cyan-400 text-[4px] font-black uppercase px-0.5 py-0.5 border border-cyan-800 rounded-sm animate-in fade-in slide-in-from-top-1">
                              {getTemporalSummary()}
                          </span>
                      </div>
                  )}

                  <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                      <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-0.5 rounded-sm transition-all border-2 flex items-center gap-0.5 ${showFilters ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]' : isDateActive ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/50' : 'bg-gray-800 text-gray-500 hover:text-white border-black'}`}
                        title="Chronos Engine"
                      >
                        <DateIcon className="w-2 h-2" />
                        <ChevronDownIcon className={`w-1.5 h-1.5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                      </button>
                      {isFilterActive && (
                          <button 
                            onClick={() => { onSearchChange(''); onDateChange('', ''); }} 
                            className="p-0.5 text-red-500 hover:text-red-400 bg-gray-800 border-2 border-black rounded-sm transition-colors"
                            title="Purge Shards"
                          >
                              <XIcon className="w-2.5 h-2.5" />
                          </button>
                      )}
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-0.5">
              <button 
                  onClick={onToggleTts}
                  className={`p-0.5 rounded-full transition-colors duration-200 flex-shrink-0 comic-button border-2 border-black ${
                      isTtsEnabled 
                      ? 'text-cyan-900 bg-cyan-400' 
                      : 'text-gray-800 bg-gray-300 hover:bg-gray-100'
                  }`}
                  aria-label={isTtsEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
              >
                  {isTtsEnabled ? <SpeakerIcon className="w-3 h-3" /> : <SpeakerOffIcon className="w-3 h-3" />}
              </button>
          </div>
        </div>

        {/* Chronos Pointer Panel - Redesigned for Hereditary Intuition */}
        {showFilters && (
          <div className="p-3 bg-black/95 rounded-[0.8rem] border-2 animate-in slide-in-from-top-2 duration-300 backdrop-blur-md relative overflow-hidden shadow-[10px_10px_30px_rgba(0,0,0,0.9)]" style={{ borderImage: 'linear-gradient(to right, #ef4444, #fbbf24, #22c55e) 1' }}>
             <div className="absolute top-0 right-0 p-1.5 opacity-5 group-hover:scale-110 transition-transform">
                  <ShieldIcon className="w-28 h-28 text-white" />
             </div>
             
             <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-lg bg-cyan-600/10 border-2 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                        <ZapIcon className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-comic-header text-base text-white uppercase italic tracking-tighter">Tempo Shards</h4>
                      <p className="text-[5px] text-gray-500 font-black uppercase tracking-[0.3em] -mt-0.5">Hereditary Range Selection</p>
                    </div>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                    {[
                        { label: "Deep Roots (24h)", days: 1, color: 'border-red-600/40 text-red-400 hover:bg-red-600' },
                        { label: 'Network Stride (7d)', days: 7, color: 'border-amber-600/40 text-amber-400 hover:bg-amber-500' },
                        { label: 'Reset Origin', days: null, color: 'border-green-600/40 text-green-400 hover:bg-green-600' }
                    ].map((btn) => (
                        <button 
                            key={btn.label}
                            onClick={() => setPreset(btn.days)}
                            className={`px-2.5 py-0.5 bg-gray-950 border-2 rounded-md text-[7px] font-black uppercase tracking-widest transition-all duration-300 hover:text-black hover:scale-105 active:scale-95 shadow-[1.5px_1.5px_0_0_#000] ${btn.color}`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                <div className="relative group">
                    <div className={`absolute -top-1.5 left-3 bg-black px-1.5 text-[6px] font-black uppercase z-20 group-focus-within:text-red-400 transition-colors flex items-center gap-0.5 border rounded-full ${startDate ? 'text-red-400 border-red-900/50' : 'text-gray-600 border-gray-900'}`}>
                      <FireIcon className="w-1.5 h-1.5" /> Genesis Ingress
                    </div>
                    <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => onDateChange(e.target.value, endDate)}
                        className={`w-full bg-gray-950 border-2 rounded-[0.8rem] px-3 py-2.5 text-[10px] focus:ring-0 outline-none transition-all font-mono shadow-inner cursor-pointer ${startDate ? 'border-red-600/60 text-red-400' : 'border-gray-900 text-gray-700 hover:border-gray-700'}`}
                    />
                </div>
                <div className="relative group">
                    <div className={`absolute -top-1.5 left-3 bg-black px-1.5 text-[6px] font-black uppercase z-20 group-focus-within:text-green-400 transition-colors flex items-center gap-0.5 border rounded-full ${endDate ? 'text-green-400 border-green-900/50' : 'text-gray-600 border-gray-900'}`}>
                      <ShieldIcon className="w-1.5 h-1.5" /> Terminal Egress
                    </div>
                    <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => onDateChange(startDate, e.target.value)}
                        className={`w-full bg-gray-950 border-2 rounded-[0.8rem] px-3 py-2.5 text-[10px] focus:ring-0 outline-none transition-all font-mono shadow-inner cursor-pointer ${endDate ? 'border-green-600/60 text-green-400' : 'border-gray-900 text-gray-700 hover:border-gray-700'}`}
                    />
                </div>
             </div>

             <div className="mt-5 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-1.5">
                   <div className={`px-2 py-0.5 rounded-lg border-2 flex items-center gap-1 transition-all duration-500 ${isDateActive ? 'bg-cyan-900/20 border-cyan-500/30' : 'bg-gray-900 border-black'}`}>
                      <div className="relative">
                          {isDateActive && <div className="absolute -inset-0.5 rounded-full bg-cyan-500 animate-ping opacity-30" />}
                          <div className={`w-0.5 h-0.5 rounded-full ${isDateActive ? 'bg-cyan-500 shadow-[0_0_4px_cyan]' : 'bg-gray-800'}`} />
                      </div>
                      <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${isDateActive ? 'text-cyan-400' : 'text-gray-600'}`}>
                        Hereditary Mode: {isDateActive ? 'CONJUNCT' : 'STABLE'}
                      </span>
                   </div>
                   {isDateActive && (
                     <div className="animate-in fade-in slide-in-from-left-1">
                        <p className="text-[5px] text-gray-500 font-mono italic leading-none">
                            Logic siphoned from:
                        </p>
                        <p className="text-[7px] text-cyan-300 font-black uppercase tracking-widest mt-0.5">
                            {startDate || 'The Beginning'} → {endDate || 'Now'}
                        </p>
                     </div>
                   )}
                </div>
                <button 
                    onClick={() => onDateChange('', '')}
                    className="p-1.5 text-gray-500 hover:text-red-500 text-[8px] font-black uppercase tracking-[0.3em] transition-all hover:translate-x-0.5 flex items-center gap-1.5 bg-black/60 rounded-md border-2 border-black group shadow-[1.5px_1.5px_0_0_#000] active:shadow-none active:translate-y-0.5"
                >
                    <XIcon className="w-2.5 h-2.5 group-hover:rotate-90 transition-transform" /> 
                    <span>Flush Chronos Engine</span>
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
