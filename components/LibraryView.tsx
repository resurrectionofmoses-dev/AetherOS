
import React, { useState } from 'react';
import type { LibraryItem } from '../types';
import { BookOpenIcon, SearchIcon, GlobeIcon, ArchiveIcon, PlusIcon, ClockIcon, StarIcon, TerminalIcon, ZapIcon } from './icons';
import { v4 as uuidv4 } from 'uuid';

interface LibraryViewProps {
  libraryItems: LibraryItem[];
  onAddLibraryItem: (item: LibraryItem) => void;
  onActionReward?: (shards: number) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ libraryItems, onAddLibraryItem, onActionReward }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<'All' | LibraryItem['source']>('All');

  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = filterSource === 'All' || item.source === filterSource;
    return matchesSearch && matchesSource;
  });

  const handleOpenLetter = (url: string) => {
      onActionReward?.(2); // Ingesting a letter grants shards
      window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="h-full flex flex-col bg-[#02050f] text-gray-200 font-mono overflow-hidden">
      <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600/10 border-4 border-blue-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <BookOpenIcon className="w-10 h-10 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h2 className="font-comic-header text-5xl text-blue-400 wisdom-glow italic tracking-tighter uppercase">Archive Library</h2>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mt-1 italic">The Maestro's Collected Letters</p>
          </div>
        </div>
        <div className="flex gap-6">
            <div className="text-right">
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Knowledge Depth</p>
                <p className="text-xl font-comic-header text-white">{libraryItems.length} SOURCES</p>
            </div>
            <ArchiveIcon className="w-10 h-10 text-blue-900 opacity-30" />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.02)_0%,_transparent_70%)] pointer-events-none" />

        <div className="lg:w-80 flex flex-col gap-6 flex-shrink-0 relative z-10">
            <div className="aero-panel p-6 bg-slate-900/80 border-blue-600/30 shadow-[8px_8px_0_0_#000]">
                <h3 className="font-comic-header text-2xl text-white uppercase italic mb-4 flex items-center gap-2">
                    <SearchIcon className="w-5 h-5 text-blue-500" /> Filter Ingress
                </h3>
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search Title/Summary..."
                    className="w-full bg-black/60 border-2 border-black rounded-xl p-3 text-white text-xs placeholder:text-gray-800 focus:ring-0 outline-none focus:border-blue-600 transition-all mb-4"
                />
                <select 
                    value={filterSource}
                    onChange={e => setFilterSource(e.target.value as any)}
                    className="w-full bg-black/60 border-2 border-black rounded-xl p-3 text-white text-xs focus:ring-0 outline-none focus:border-blue-600 transition-all cursor-pointer font-black uppercase tracking-widest"
                >
                    <option value="All">All Sources</option>
                    <option value="google_books">Google Books</option>
                    <option value="wayback_machine">Wayback Machine</option>
                    <option value="aetheros_archive">AetherOS Archive</option>
                </select>
            </div>

            <div className="aero-panel p-6 bg-black/40 border-white/5 flex-1 flex flex-col overflow-hidden">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Latest Ingestions</h3>
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                    {libraryItems.slice(-5).reverse().map(item => (
                        <div key={item.id} className="p-3 bg-black/60 border border-white/5 rounded-lg">
                            <p className="text-[10px] font-black text-blue-400 uppercase truncate">{item.title}</p>
                            <p className="text-[8px] text-gray-600 italic mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map(item => (
                    <div key={item.id} className="aero-panel bg-black/60 p-6 border-4 border-black group hover:border-blue-600/50 transition-all duration-500 shadow-[10px_10px_0_0_#000]">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-white/5 ${item.source === 'wayback_machine' ? 'text-amber-500' : 'text-blue-500'}`}>
                                {item.source === 'wayback_machine' ? <ClockIcon className="w-6 h-6" /> : <GlobeIcon className="w-6 h-6" />}
                            </div>
                            <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest bg-black px-2 py-1 rounded border border-white/5">0x{item.id.slice(0, 4).toUpperCase()}</span>
                        </div>
                        <h4 className="font-comic-header text-2xl text-white uppercase italic tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                        <p className="text-[10px] font-black text-gray-600 uppercase mb-4 tracking-widest">{item.author || 'MAESTRO_SOLO'}</p>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-6 text-xs text-gray-400 italic leading-relaxed h-20 overflow-y-auto custom-scrollbar">
                            "{item.summary || 'Structural meaning awaiting synthesis...'}"
                        </div>
                        <button 
                            onClick={() => handleOpenLetter(item.url)} 
                            className="vista-button w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-xl text-center block shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <ZapIcon className="w-4 h-4" /> Open Ancient Letter (+2 Shards)
                            </span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="p-4 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Library Feed: OPTIMAL</span>
          </div>
          <span className="text-[10px] text-gray-700 font-mono">Total letters conducted: {libraryItems.length}</span>
        </div>
        <div className="flex items-center gap-4">
             <TerminalIcon className="w-4 h-4 text-gray-800" />
             <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.2em]">Absolute know-how is the ultimate gift.</p>
        </div>
      </div>
    </div>
  );
};
