
import React, { useState } from 'react';
import type { LibraryItem, MainView } from '../types';
import { BookOpenIcon, SearchIcon, GlobeIcon, ArchiveIcon, PlusIcon, ClockIcon, StarIcon, TerminalIcon, ZapIcon, ShieldIcon, FireIcon, LockIcon, UnlockIcon } from './icons';
import { v4 as uuidv4 } from 'uuid';

interface LatentModule {
  id: string;
  name: string;
  description: string;
  cost: number;
  viewKey: MainView;
  category: string;
}

const LATENT_MODULES: LatentModule[] = [
  { id: 'mod_chem', name: 'Chemistry Lab', description: 'Synthesize molecular structures and analyze chemical reactions.', cost: 50, viewKey: 'chemistry_lab', category: 'Physical Sciences' },
  { id: 'mod_quant', name: 'Quantum Theory Lab', description: 'Explore subatomic probabilities and quantum entanglement.', cost: 100, viewKey: 'quantum_theory_lab', category: 'Physical Sciences' },
  { id: 'mod_codefall', name: 'Code Fall Lab', description: 'Analyze cascading code failures and matrix drops.', cost: 75, viewKey: 'code_fall_lab', category: 'Cybernetics' },
  { id: 'mod_truth', name: 'Truth Lab', description: 'Cryptographic provenance and epistemological sovereignty engine.', cost: 200, viewKey: 'truth_lab', category: 'Conceptual' },
  { id: 'mod_med', name: 'Medical Synthesis', description: 'Biological simulation and panacea generation protocols.', cost: 150, viewKey: 'medical_synthesis_lab', category: 'Biological' },
  { id: 'mod_hyper', name: 'Hyper Spatial Lab', description: 'N-dimensional geometry and vector wraith routing.', cost: 300, viewKey: 'hyper_spatial_lab', category: 'Engineering' }
];

interface LibraryViewProps {
  libraryItems: LibraryItem[];
  onAddLibraryItem: (item: LibraryItem) => void;
  onActionReward?: (shards: number) => void;
  unlockedViews?: MainView[];
  setUnlockedViews?: (views: MainView[]) => void;
  onSetView?: (view: MainView) => void;
  shards?: number;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ libraryItems, onAddLibraryItem, onActionReward, unlockedViews = [], setUnlockedViews, onSetView, shards = 0 }) => {
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

  const buildLogItems = filteredItems.filter(item => item.source === 'google_books');
  const otherItems = filteredItems.filter(item => item.source !== 'google_books');

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
                    <option value="google_books">Google Books (Siphoned)</option>
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

        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 space-y-12">
            {/* Latent Modules Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b-4 border-blue-900/50 pb-2">
                    <ShieldIcon className="w-8 h-8 text-blue-500 animate-pulse" />
                    <h3 className="font-comic-header text-4xl text-blue-400 uppercase italic tracking-tight">Latent Modules</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {LATENT_MODULES.map(module => {
                        const isUnlocked = unlockedViews.includes(module.viewKey);
                        return (
                            <div key={module.id} className={`aero-panel p-6 border-4 transition-all duration-500 shadow-[10px_10px_0_0_#000] relative overflow-hidden ${isUnlocked ? 'bg-blue-950/20 border-blue-600/40 hover:border-blue-400' : 'bg-black/60 border-gray-800 hover:border-gray-600'}`}>
                                {!isUnlocked && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                                        <LockIcon className="w-12 h-12 text-gray-600 mb-4" />
                                        <button 
                                            onClick={() => {
                                                if (setUnlockedViews && shards >= module.cost) {
                                                    setUnlockedViews([...unlockedViews, module.viewKey]);
                                                    onActionReward?.(-module.cost);
                                                }
                                            }}
                                            disabled={shards < module.cost}
                                            className={`vista-button py-2 px-6 font-black uppercase text-xs tracking-widest rounded-xl shadow-[4px_4px_0_0_#000] transition-all ${shards >= module.cost ? 'bg-gray-800 hover:bg-blue-600 text-white active:translate-y-1' : 'bg-gray-900 text-gray-700 cursor-not-allowed'}`}
                                        >
                                            Unlock ({module.cost} Shards)
                                        </button>
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-4 relative z-0">
                                    <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'bg-gray-900 text-gray-600 border border-gray-800'}`}>
                                        <TerminalIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest bg-black px-2 py-1 rounded border border-gray-800">{module.category}</span>
                                </div>
                                <h4 className={`font-comic-header text-2xl uppercase italic tracking-tight mb-2 leading-none relative z-0 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{module.name}</h4>
                                <p className={`text-[10px] font-black uppercase mb-4 tracking-widest relative z-0 ${isUnlocked ? 'text-blue-400' : 'text-gray-700'}`}>STATUS: {isUnlocked ? 'ONLINE' : 'DORMANT'}</p>
                                <div className={`p-4 rounded-xl border mb-6 text-xs italic leading-relaxed h-20 overflow-y-auto custom-scrollbar shadow-inner relative z-0 ${isUnlocked ? 'bg-blue-950/20 border-blue-900/30 text-blue-100/70' : 'bg-black/40 border-gray-800 text-gray-600'}`}>
                                    "{module.description}"
                                </div>
                                <button 
                                    onClick={() => isUnlocked && onSetView?.(module.viewKey)} 
                                    disabled={!isUnlocked}
                                    className={`vista-button w-full py-3 font-black uppercase text-xs tracking-widest rounded-xl text-center block shadow-[4px_4px_0_0_#000] transition-all relative z-0 ${isUnlocked ? 'bg-blue-600 hover:bg-blue-500 text-white active:translate-y-1' : 'bg-gray-900 text-gray-700 cursor-not-allowed'}`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {isUnlocked ? <><UnlockIcon className="w-4 h-4" /> Initialize Protocol</> : <><LockIcon className="w-4 h-4" /> Locked</>}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Featured Section: Build Logs */}
            {buildLogItems.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b-4 border-amber-600 pb-2">
                        <StarIcon className="w-8 h-8 text-amber-500 animate-spin-slow" />
                        <h3 className="font-comic-header text-4xl text-amber-500 uppercase italic tracking-tight">Forensic Build Ledger (Google Books Siphon)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {buildLogItems.map(item => (
                            <div key={item.id} className="aero-panel bg-black/60 p-6 border-4 border-amber-600/40 group hover:border-amber-400 transition-all duration-500 shadow-[10px_10px_0_0_#000] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 bg-amber-600 text-black text-[7px] font-black uppercase rotate-3 translate-x-1 -translate-y-1 shadow-xl">
                                    TOP_INGRESS
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-amber-600/10 text-amber-400 border border-amber-600/30">
                                        <BookOpenIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[7px] font-black text-amber-900 uppercase tracking-widest bg-black px-2 py-1 rounded border border-amber-900/50">HASH: 0x{item.id.slice(0, 4).toUpperCase()}_AUR</span>
                                </div>
                                <h4 className="font-comic-header text-2xl text-white uppercase italic tracking-tight mb-2 group-hover:text-amber-400 transition-colors leading-none">{item.title}</h4>
                                <p className="text-[10px] font-black text-amber-700 uppercase mb-4 tracking-widest">{item.author}</p>
                                <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-900/30 mb-6 text-xs text-amber-100/70 italic leading-relaxed h-24 overflow-y-auto custom-scrollbar shadow-inner">
                                    "{item.summary}"
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">Veracity Score: 99.84%</span>
                                    </div>
                                    <span className="text-[7px] font-mono text-amber-900">TYPE: FORENSIC_LOG</span>
                                </div>
                                <button 
                                    onClick={() => handleOpenLetter(item.url)} 
                                    className="vista-button w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-xs tracking-widest rounded-xl text-center block shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <ZapIcon className="w-4 h-4" /> Siphon Knowledge Shard
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Standard Archive Section */}
            {otherItems.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b-4 border-white/10 pb-2">
                        <ArchiveIcon className="w-8 h-8 text-gray-600" />
                        <h3 className="font-comic-header text-4xl text-gray-500 uppercase italic tracking-tight">Ancient Records</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {otherItems.map(item => (
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
            )}
        </div>
      </div>

      <div className="p-4 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-8">
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