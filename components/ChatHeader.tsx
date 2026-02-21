
import React, { useState } from 'react';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { SpeakerOffIcon } from './icons/SpeakerOffIcon';
import { AetherOSIcon } from './icons/AetherOSIcon';
import { SearchIcon } from './icons/SearchIcon';
import { XIcon } from './icons/XIcon';
import { ActivityIcon as DateIcon, FireIcon, ZapIcon, ShieldIcon, ChevronDownIcon } from './icons';
import { HexMetric } from './HexMetric';

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

  return (
    <div className="p-1 border-b-2 border-black sticky top-0 z-30 bg-gray-800 shadow-xl overflow-visible">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 min-w-0">
             <HexMetric size="nano" value="NX" colorClass="border-amber-600 text-white" />
             <div className="min-w-0">
                <h2 className="font-comic-header text-sm text-white leading-none truncate uppercase">Nexus</h2>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center px-1">
              <div className="relative w-full max-w-sm group">
                  <div className={`absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-colors ${searchQuery ? 'text-amber-500' : 'text-gray-500'}`}>
                    <SearchIcon className="w-2.5 h-2.5" />
                  </div>
                  <input 
                      type="search"
                      placeholder="Scour History..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full bg-gray-900/80 border border-black rounded py-0.5 pl-5 pr-16 text-[9px] focus:outline-none focus:border-amber-500 text-white font-mono"
                  />
                  
                  <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                      <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-0.5 rounded transition-all border flex items-center gap-0.5 ${showFilters ? 'bg-amber-500 text-black' : isDateActive ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/50' : 'bg-gray-800 text-gray-500 border-black'}`}
                      >
                        <DateIcon className="w-2 h-2" />
                      </button>
                      {isFilterActive && (
                          <button 
                            onClick={() => { onSearchChange(''); onDateChange('', ''); }} 
                            className="p-0.5 text-red-500 bg-gray-800 border border-black rounded"
                          >
                              <XIcon className="w-2 h-2" />
                          </button>
                      )}
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-2">
              <button 
                  onClick={onToggleTts}
                  className={`p-0.5 rounded-full border border-black ${
                      isTtsEnabled ? 'text-cyan-900 bg-cyan-400' : 'text-gray-800 bg-gray-300'
                  }`}
              >
                  {isTtsEnabled ? <SpeakerIcon className="w-2.5 h-2.5" /> : <SpeakerOffIcon className="w-2.5 h-2.5" />}
              </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-1 p-2 bg-black/95 rounded border animate-in slide-in-from-top-1">
             <div className="flex items-center justify-between gap-2 mb-2 border-b border-white/5 pb-1">
                <span className="text-[7px] font-black text-gray-500 uppercase">Temporal Shards</span>
                <div className="flex gap-1">
                    {[{ label: "24h", days: 1 }, { label: '7d', days: 7 }, { label: 'Reset', days: null }].map((btn) => (
                        <button 
                            key={btn.label}
                            onClick={() => setPreset(btn.days)}
                            className="px-1.5 py-0.5 bg-gray-950 border rounded text-[6px] font-black uppercase text-cyan-400 hover:bg-cyan-600 hover:text-black transition-all"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => onDateChange(e.target.value, endDate)}
                    className="w-full bg-gray-950 border rounded p-1 text-[8px] text-red-400 font-mono"
                />
                <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => onDateChange(startDate, e.target.value)}
                    className="w-full bg-gray-950 border rounded p-1 text-[8px] text-green-400 font-mono"
                />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
