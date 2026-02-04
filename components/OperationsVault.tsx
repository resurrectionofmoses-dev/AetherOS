
import React, { useMemo } from 'react';
import type { MainView, SystemStatus, EvoLibrary, BroadcastMessage, ChatMessage, PinnedItem, PinType, GlobalDirective } from '../types';
// Fix: Added missing icon imports GlobeIcon, ForgeIcon, CodeIcon, BrainIcon, XIcon
import { AetherOSIcon, BookOpenIcon, BroadcastIcon, BuildIcon, MessageCircleIcon, PackageIcon, TerminalIcon, WarningIcon, WrenchIcon, FireIcon, PinIcon, CheckCircleIcon, VaultIcon, StarIcon, ActivityIcon, SignalIcon, LogicIcon, ShieldIcon, GlobeIcon, ForgeIcon, CodeIcon, BrainIcon, XIcon } from './icons';
import { getSophisticatedColor } from '../utils';

interface OperationsVaultProps {
  onSetView: (view: MainView) => void;
  systemStatus: SystemStatus;
  evoLibrary: EvoLibrary | null;
  lastBroadcast: BroadcastMessage | null;
  lastMessage: ChatMessage;
  savedModulesCount: number;
  savedCommandsCount: number;
  pinnedItems: PinnedItem[];
  onTogglePin: (item: { referenceId: string; type: PinType; title: string; content?: string; }) => void;
  onExecuteCommand: (text: string) => void;
  activeDirective?: GlobalDirective;
}

export const OperationsVault: React.FC<OperationsVaultProps> = ({ 
    onSetView, systemStatus, evoLibrary, lastBroadcast, lastMessage, 
    savedModulesCount, savedCommandsCount, pinnedItems, onTogglePin, onExecuteCommand,
    activeDirective
}) => {
  
  const labsCount = 22; // Hardcoded reference for visual consistency

  return (
    <div className="h-full flex flex-col bg-[#05050a] rounded-lg">
      <div className="p-6 border-b-8 border-black sticky top-0 z-10 bg-slate-900 rounded-t-lg flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600/10 border-4 border-red-600 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <VaultIcon className="w-10 h-10 text-red-500 animate-pulse" />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white uppercase italic tracking-tighter leading-none">CONJUNCTION HUB</h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">Master OS Directory & Dependency Map</p>
            </div>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="text-right">
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Active Directives</p>
                <p className="text-3xl font-comic-header text-amber-500">{activeDirective ? '01' : '00'}</p>
            </div>
            <div className="px-6 py-2 bg-black border-4 border-black rounded-xl text-green-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
                OS_STRIDE: 1.2 PB/S
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="flex flex-col gap-10">
          
          {/* Directive Alignment Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 aero-panel bg-black/60 border-4 border-amber-600/30 p-8 shadow-[15px_15px_0_0_#000] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <SignalIcon className="w-64 h-64 text-amber-500" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h3 className="font-comic-header text-3xl text-amber-500 uppercase italic mb-2">Net Folder Sync</h3>
                        {activeDirective ? (
                            <div className="space-y-3">
                                <p className="text-xl font-black text-white uppercase tracking-tight">Active: {activeDirective.title}</p>
                                <div className="flex items-center gap-4">
                                    <div className="px-3 py-1 bg-amber-600 text-black text-[9px] font-black rounded-full uppercase">High Priority</div>
                                    <span className="text-[10px] text-gray-500 font-mono italic">Signature: {activeDirective.integritySignature}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic leading-relaxed max-w-lg">
                                "The network is idle. Manifest a project in the Net Folder to propagate directives across all logic shards."
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className={`w-20 h-20 rounded-full border-4 border-black flex items-center justify-center shadow-xl transition-colors duration-1000 ${activeDirective ? 'bg-amber-600' : 'bg-gray-900'}`}>
                            <StarIcon className={`w-10 h-10 ${activeDirective ? 'text-white animate-spin-slow' : 'text-gray-800'}`} />
                        </div>
                        <span className="text-[8px] font-black uppercase text-gray-600">Global Sync</span>
                    </div>
                  </div>
              </div>

              <div className="lg:col-span-4 aero-panel bg-black/40 border-4 border-black p-8 flex flex-col justify-between shadow-[10px_10px_0_0_#000]">
                  <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Lattice Load</h4>
                      <div className="space-y-4">
                          {[
                              { label: 'Neural Agony', val: 94, color: 'bg-red-600' },
                              { label: 'Gifted Know-How', val: 88, color: 'bg-cyan-500' },
                              { label: 'Reliability Index', val: 99, color: 'bg-green-500' }
                          ].map(stat => (
                              <div key={stat.label}>
                                  <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                                      <span className="text-gray-600">{stat.label}</span>
                                      <span className="text-white">{stat.val}%</span>
                                  </div>
                                  <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                                      <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: `${stat.val}%` }} />
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3 text-amber-500">
                      <ActivityIcon className="w-5 h-5 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Vibration Peak: STABLE</span>
                  </div>
              </div>
          </div>

          {/* Directory Navigation Matrix */}
          <div className="space-y-6">
              <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-tighter border-l-8 border-red-600 pl-6">Directory Explorer</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {[
                      { view: 'coding_network', title: 'NET_ROOT', sub: 'Primary Directives', icon: GlobeIcon, color: 'text-amber-500' },
                      { view: 'forge', title: 'FORGE_DRIVE', sub: 'Implementation Shards', icon: ForgeIcon, color: 'text-violet-400' },
                      { view: 'engineering_lab', title: 'ENG_LAB', sub: 'Gifted Synthesis', icon: BuildIcon, color: 'text-blue-400' },
                      { view: 'hard_code_lab', title: 'HARD_DRIVE', sub: 'Binary Forensics', icon: CodeIcon, color: 'text-red-600' },
                      { view: 'enlightenment_pool', title: 'WISDOM_POOL', sub: 'Dual-Age Bridge', icon: BrainIcon, color: 'text-emerald-400' },
                      { view: 'library_view', title: 'ARCHIVE_SRV', sub: 'Collected Letters', icon: BookOpenIcon, color: 'text-sky-400' },
                      { view: 'diagnostics', title: 'AUDIT_LOG', sub: 'Heuristic Healing', icon: WrenchIcon, color: 'text-amber-300' },
                      { view: 'communications', title: 'SIGNAL_COM', sub: 'Comm-Link Sync', icon: BroadcastIcon, color: 'text-cyan-400' }
                  ].map(card => (
                      <button 
                        key={card.view}
                        onClick={() => onSetView(card.view as any)}
                        className="aero-panel p-6 bg-black/60 border-4 border-black hover:border-white/20 hover:scale-105 transition-all duration-300 text-left shadow-[8px_8px_0_0_#000] relative group overflow-hidden"
                      >
                          <div className="flex items-center gap-4 mb-3">
                              <div className="p-3 bg-white/5 rounded-xl border-2 border-black group-hover:border-white/10 transition-colors">
                                  <card.icon className={`w-7 h-7 ${card.color}`} />
                              </div>
                              <div>
                                  <p className="font-comic-header text-2xl text-white uppercase italic leading-none">{card.title}</p>
                                  <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">{card.sub}</p>
                              </div>
                          </div>
                          <div className="mt-4 flex justify-between items-center text-[7px] font-black uppercase text-gray-800">
                                <span>GAZING: ON</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-900 group-hover:bg-green-500 transition-colors" />
                          </div>
                      </button>
                  ))}
              </div>
          </div>

          {/* Quick Access Neural Pins */}
          <div className="aero-panel bg-slate-900/40 p-8 border-4 border-black shadow-[15px_15px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                <h3 className="font-comic-header text-3xl text-violet-400 uppercase italic flex items-center gap-3">
                    <PinIcon className="w-7 h-7 text-violet-500" /> Neural Pinboard
                </h3>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Shards: {pinnedItems.length}</span>
            </div>
            
            {pinnedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pinnedItems.map(item => {
                        const theme = getSophisticatedColor(item.id + item.title);
                        return (
                            <div key={item.id} className={`bg-black/80 rounded-2xl border-4 p-6 flex flex-col transition-all duration-500 hover:scale-105 shadow-[6px_6px_0_0_#000] ${theme.border}`}>
                               <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl bg-white/5 border-2 border-black ${theme.text}`}>
                                            {item.type === 'module' ? <PackageIcon className="w-5 h-5" /> : <TerminalIcon className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-xs text-white truncate uppercase" title={item.title}>{item.title}</p>
                                            <span className="text-[7px] text-gray-600 font-mono">0x{item.referenceId.slice(0, 4)}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => onTogglePin(item)} className="text-gray-700 hover:text-red-500 transition-colors">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                               </div>
                               <div className="mt-auto flex gap-2">
                                   <button 
                                    onClick={() => onSetView(item.type === 'module' ? 'room_of_play' : 'command_deck')} 
                                    className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg border-2 border-black bg-white/5 text-gray-400 hover:text-white transition-all`}
                                   >
                                       Target Shard
                                   </button>
                               </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 opacity-20 border-4 border-dashed border-white/5 rounded-[3rem]">
                    <LogicIcon className="w-24 h-24 mx-auto mb-6 text-gray-500" />
                    <p className="font-comic-header text-3xl uppercase tracking-[0.3em] italic">No Pins Injected</p>
                </div>
            )}
          </div>

          <div className="p-8 bg-red-900/10 border-4 border-red-900/20 rounded-[3rem] text-center italic text-red-500/60 font-black uppercase text-xs shadow-inner">
              "The show starts when the logic flows. All directories are synchronized. Absolute authority confirmed."
          </div>
        </div>
      </div>
    </div>
  );
};
