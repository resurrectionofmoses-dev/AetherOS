
import React, { useState } from 'react';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { SpeakerOffIcon } from './icons/SpeakerOffIcon';
import { AetherOSIcon } from './icons/AetherOSIcon';
import { SearchIcon } from './icons/SearchIcon';
import { XIcon } from './icons/XIcon';
import { ActivityIcon as DateIcon, FireIcon, ZapIcon, ShieldIcon, ChevronDownIcon, TrashIcon, UserIcon, BotIcon } from './icons';
import { HexMetric } from './HexMetric';
import { AI_SEATS } from '../types';

interface ChatHeaderProps {
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  startDate: string;
  endDate: string;
  senderFilter: string;
  onSenderFilterChange: (sender: string) => void;
  onDateChange: (start: string, end: string) => void;
  onClearChat: () => void;
  currentChannel: 'global' | 'moderator';
  onSetChannel: (channel: 'global' | 'moderator') => void;
  userRole?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  isTtsEnabled, onToggleTts, searchQuery, onSearchChange, 
  startDate, endDate, senderFilter = 'all', onSenderFilterChange, 
  onDateChange, onClearChat, currentChannel, onSetChannel, userRole
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const isModerator = ['moderator', 'operator', 'admin'].includes(userRole || '');

  const isFilterActive = searchQuery || startDate || endDate || senderFilter !== 'all';
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

  const senderOptions = [
    { id: 'all', label: 'All Origins', icon: ShieldIcon },
    { id: 'user', label: 'User', icon: UserIcon },
    { id: 'model', label: 'AI Council', icon: BotIcon },
    ...Object.entries(AI_SEATS).map(([key, value]) => ({
        id: key,
        label: value.name.split(' (')[1]?.replace(')', '') || value.name,
        icon: BotIcon
    }))
  ];

  return (
    <div className="p-1 border-b-2 border-black sticky top-0 z-30 bg-black shadow-xl overflow-visible">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 min-w-0">
             <HexMetric size="nano" value="NX" colorClass="border-amber-600 text-white" />
             <div className="flex bg-black/40 border border-white/5 rounded p-0.5">
                <button 
                    onClick={() => onSetChannel('global')}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${currentChannel === 'global' ? 'bg-amber-500 text-black' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Global
                </button>
                {isModerator && (
                    <button 
                        onClick={() => onSetChannel('moderator')}
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${currentChannel === 'moderator' ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-red-400'}`}
                    >
                        Private
                    </button>
                )}
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
                      className="w-full bg-[#0a0a0a] border border-black rounded py-0.5 pl-5 pr-16 text-[9px] focus:outline-none focus:border-amber-500 text-white font-mono"
                  />
                  
                  <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                      <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-0.5 rounded transition-all border flex items-center gap-0.5 ${showFilters ? 'bg-amber-500 text-black border-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : (isDateActive || senderFilter !== 'all') ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/50' : 'bg-black text-gray-500 border-black hover:border-zinc-700'}`}
                        title="Neural Filters"
                      >
                        <DateIcon className="w-2.5 h-2.5" />
                        {(isDateActive || senderFilter !== 'all') && <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse border border-black" />}
                      </button>
                      {isFilterActive && (
                          <button 
                            onClick={() => { onSearchChange(''); onDateChange('', ''); onSenderFilterChange('all'); }} 
                            className="p-0.5 text-red-500 bg-black border border-black rounded hover:bg-red-950/20"
                            title="Reset Protocols"
                          >
                              <XIcon className="w-2.5 h-2.5" />
                          </button>
                      )}
                  </div>
              </div>
          </div>
 
          <div className="flex items-center gap-2">
              <button 
                  onClick={onClearChat}
                  className="p-0.5 rounded-full border border-black transition-all text-gray-500 bg-slate-900 hover:bg-red-900/40 hover:text-red-500 hover:border-red-900"
                  title="Purge Memory"
              >
                  <TrashIcon className="w-2.5 h-2.5" />
              </button>
              <button 
                  onClick={onToggleTts}
                  className={`p-0.5 rounded-full border border-black transition-all ${
                      isTtsEnabled ? 'text-cyan-900 bg-cyan-400' : 'text-gray-500 bg-slate-900 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                  {isTtsEnabled ? <SpeakerIcon className="w-2.5 h-2.5" /> : <SpeakerOffIcon className="w-2.5 h-2.5" />}
              </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-1 p-3 bg-[#080808] rounded border border-white/5 shadow-2xl animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date Range Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1 relative">
                        <div className="flex items-center gap-1.5">
                            <DateIcon className="w-2 h-2 text-amber-500" />
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Temporal Window</span>
                        </div>
                        <div className="flex gap-1">
                            {[{ label: "24h", days: 1 }, { label: '7d', days: 7 }, { label: 'Cleanse', days: null }].map((btn) => (
                                <button 
                                    key={btn.label}
                                    onClick={() => setPreset(btn.days)}
                                    className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-[2px] text-[6px] font-black uppercase text-cyan-500 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all active:scale-95"
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <span className="text-[6px] font-mono text-zinc-600 block pl-1">0xD_START</span>
                            <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => onDateChange(e.target.value, endDate)}
                                className="w-full bg-black border border-zinc-800 rounded p-1.5 text-[8px] text-zinc-300 font-mono focus:border-cyan-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                           <span className="text-[6px] font-mono text-zinc-600 block pl-1">0xD_END</span>
                            <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => onDateChange(startDate, e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded p-1.5 text-[8px] text-zinc-300 font-mono focus:border-green-500 outline-none"
                            />
                        </div>
                    </div>
                  </div>

                  {/* Sender Logic Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 border-b border-white/5 pb-1">
                        <ShieldIcon className="w-2 h-2 text-amber-500" />
                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Logic Origin (Sender)</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {senderOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isActive = senderFilter === opt.id;
                            return (
                                <button 
                                    key={opt.id}
                                    onClick={() => onSenderFilterChange(opt.id)}
                                    className={`px-2 py-1 border rounded-[2px] text-[6px] font-black uppercase transition-all flex items-center gap-1.5 ${
                                        isActive 
                                            ? 'bg-amber-500 text-black border-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                            : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border-zinc-800'
                                    }`}
                                >
                                    <Icon className={`w-2 h-2 ${isActive ? 'text-black' : 'text-zinc-600'}`} />
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                  </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};
