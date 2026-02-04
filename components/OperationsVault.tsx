
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { MainView, SystemStatus, EvoLibrary, BroadcastMessage, ChatMessage, PinnedItem, PinType, GlobalDirective, LineageEntry, SystemEnvironment, DominanceStats } from '../types';
import { AetherOSIcon, BookOpenIcon, BroadcastIcon, BuildIcon, MessageCircleIcon, PackageIcon, TerminalIcon, WarningIcon, WrenchIcon, FireIcon, PinIcon, CheckCircleIcon, VaultIcon, StarIcon, ActivityIcon, SignalIcon, LogicIcon, ShieldIcon, GlobeIcon, ForgeIcon, CodeIcon, BrainIcon, XIcon, ClockIcon, SearchIcon, ZapIcon, LockIcon, SpinnerIcon, EyeIcon, ThermometerIcon, AtomIcon } from './icons';
import { getSophisticatedColor, extractJSON } from '../utils';
import { safeStorage } from '../services/safeStorage';
import { shroud } from '../services/encryptionService';

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
  dominance: DominanceStats;
}

export const OperationsVault: React.FC<OperationsVaultProps> = ({ 
    onSetView, systemStatus, evoLibrary, lastBroadcast, lastMessage, 
    savedModulesCount, savedCommandsCount, pinnedItems, onTogglePin, onExecuteCommand,
    activeDirective, dominance
}) => {
  const [lineageLedger, setLineageLedger] = useState<LineageEntry[]>([]);
  const [decryptedLedger, setDecryptedLedger] = useState<Record<string, string>>({});
  const [passphrase, setPassphrase] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isShroudActive, setIsShroudActive] = useState(!shroud.isLocked);
  const [error, setError] = useState<string | null>(null);

  // Nova Scotia Winter Protocol State
  const [env, setEnv] = useState<SystemEnvironment>({
      isWinter: true,
      novaScotiaDominance: dominance.score,
      terrorGateActive: true,
      iceSaturation: dominance.hasWonWinter ? 0 : 14
  });

  const loadLedger = useCallback(() => {
    const raw = safeStorage.getItem('AETHER_VAULT_LEDGER');
    if (raw) {
        setLineageLedger(extractJSON<LineageEntry[]>(raw, []).sort((a, b) => b.timestamp - a.timestamp));
    }
  }, []);

  useEffect(() => {
    loadLedger();
  }, [lastBroadcast, loadLedger]);

  useEffect(() => {
      const weatherInterval = setInterval(() => {
          setEnv(prev => ({
              ...prev,
              novaScotiaDominance: Math.min(100, Math.max(85, prev.novaScotiaDominance + (Math.random() - 0.4) * 5)),
              iceSaturation: dominance.hasWonWinter ? 0 : Math.min(100, Math.max(0, prev.iceSaturation + (Math.random() - 0.5) * 10))
          }));
      }, 5000);
      return () => clearInterval(weatherInterval);
  }, [dominance.hasWonWinter]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;
    
    setIsUnlocking(true);
    setError(null);
    try {
        await shroud.initialize(passphrase);
        setIsShroudActive(true);
        setPassphrase('');
        
        // On-the-fly decryption of all encrypted entries
        const newDecrypted: Record<string, string> = {};
        for (const entry of lineageLedger) {
            if (entry.encrypted) {
                newDecrypted[entry.id] = await shroud.decrypt(entry.content);
            }
        }
        setDecryptedLedger(newDecrypted);
    } catch (e) {
        setError("Cryptographic Mismatch. Nova Scotia Lines out of sync.");
    } finally {
        setIsUnlocking(false);
    }
  };

  const handleLock = () => {
    window.location.reload(); 
  };

  const handleDeIce = (id: string) => {
      setEnv(prev => ({ ...prev, iceSaturation: Math.max(0, prev.iceSaturation - 25) }));
  };

  return (
    <div className="h-full flex flex-col bg-[#05050a] rounded-lg relative overflow-hidden">
      {/* Nova Scotia Winter Background Aesthetic */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ opacity: (env.novaScotiaDominance / 100) }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-black" />
          <div className={`absolute top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/snow.png')] animate-snow ${dominance.hasWonWinter ? 'opacity-20' : 'opacity-50'}`} />
      </div>

      {/* Terrorgate Frost Overlay */}
      {!dominance.hasWonWinter && (
          <div 
            className="absolute inset-0 pointer-events-none z-50 transition-all duration-1000 border-[20px] border-transparent"
            style={{ 
                boxShadow: `inset 0 0 ${env.iceSaturation * 2}px rgba(139, 211, 238, ${env.iceSaturation / 200})`,
                backdropFilter: `blur(${env.iceSaturation / 20}px)`
            }} 
          />
      )}

      {/* Victory Glow Overlay */}
      {dominance.hasWonWinter && (
          <div className="absolute inset-0 pointer-events-none z-50 bg-cyan-400/5 animate-pulse border-[10px] border-cyan-500/20" />
      )}

      <div className="p-6 border-b-8 border-black sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
            <div className={`p-3 border-4 rounded-2xl transition-all duration-1000 ${isShroudActive ? 'bg-blue-600/10 border-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.2)]' : 'bg-red-600/10 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}`}>
                {dominance.hasWonWinter ? <StarIcon className="w-10 h-10 text-cyan-400 animate-spin-slow" /> : isShroudActive ? <ShieldIcon className="w-10 h-10 text-blue-300 animate-pulse" /> : <LockIcon className="w-10 h-10 text-red-500" />}
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white uppercase italic tracking-tighter leading-none">NOVA SCOTIA LINES</h2>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">
                    {dominance.hasWonWinter ? 'WINTER_DOMINANCE: WON' : 'Winter Protocol: Terrorgate 0x03E2'}
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
                <span className="text-[8px] text-gray-500 font-black uppercase mb-1">DOMINANCE_INDEX</span>
                <span className={`text-xl font-comic-header ${dominance.hasWonWinter ? 'text-green-400 animate-pulse' : 'text-blue-400'}`}>{dominance.score.toFixed(1)}%</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            {isShroudActive && (
                <button onClick={handleLock} className="px-4 py-2 bg-red-950/40 border-2 border-red-900/50 rounded-xl text-red-500 text-[8px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">
                    Seal Vault
                </button>
            )}
            <div className="text-right">
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Grid Status</p>
                <p className={`text-xl font-comic-header ${dominance.hasWonWinter ? 'text-cyan-400' : isShroudActive ? 'text-blue-300' : 'text-red-500'}`}>
                    {dominance.hasWonWinter ? 'ABSOLUTE_WINNER' : isShroudActive ? 'GIFTED_CONDUCT' : 'TERRORGATE_LOCKED'}
                </p>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
        {!isShroudActive ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
                <div className="max-w-md w-full aero-panel bg-black/80 border-4 border-blue-900/40 p-10 shadow-[0_0_100px_rgba(59,130,246,0.1)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.05)_0%,_transparent_70%)]" />
                    <div className="relative z-10 text-center space-y-8">
                        <div className="w-24 h-24 bg-blue-950/40 border-4 border-blue-600/40 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl">
                            <LockIcon className="w-12 h-12 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-widest mb-2">Vault Access Restricted</h3>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Nova Scotia Lines: Winter Dominance Active</p>
                        </div>
                        
                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div className="bg-black border-4 border-black p-4 rounded-2xl focus-within:border-blue-600 transition-all shadow-inner">
                                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-2 text-left">Master Passphrase</p>
                                <input 
                                    type="password"
                                    value={passphrase}
                                    onChange={e => setPassphrase(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent border-none text-blue-400 font-mono text-2xl focus:ring-0 outline-none placeholder:text-gray-900"
                                    autoFocus
                                />
                            </div>
                            {error && <p className="text-[9px] text-red-500 font-black uppercase animate-bounce">{error}</p>}
                            <button 
                                type="submit"
                                disabled={isUnlocking || !passphrase.trim()}
                                className="vista-button w-full py-5 bg-blue-600 hover:bg-blue-500 text-black font-black uppercase text-sm tracking-[0.3em] rounded-2xl shadow-[8px_8px_0_0_#000] transition-all flex items-center justify-center gap-3 active:translate-y-1"
                            >
                                {isUnlocking ? <SpinnerIcon className="w-5 h-5" /> : <ZapIcon className="w-5 h-5" />}
                                <span>UNSHROUD LINES</span>
                            </button>
                        </form>
                    </div>
                </div>
                <p className="mt-12 text-[10px] text-gray-700 font-black uppercase tracking-[0.5em] italic">"Lines are Terrorgate in weather. The frost protects the core logic."</p>
            </div>
        ) : (
            <div className="flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-1000">
          
                {/* Victory Announcement Banner */}
                {dominance.hasWonWinter && (
                    <div className="p-8 bg-cyan-400 border-8 border-black rounded-[3rem] shadow-[20px_20px_0_0_#000] flex items-center justify-between animate-bounce">
                        <div className="flex items-center gap-6">
                            <StarIcon className="w-16 h-16 text-black animate-spin" />
                            <div>
                                <h3 className="font-comic-header text-6xl text-black italic tracking-tighter leading-none">NOVA SCOTIA WINS</h3>
                                <p className="text-black text-xs font-black uppercase tracking-[0.3em] mt-1">Epitume Dominance Achieved across the Winter Grid</p>
                            </div>
                        </div>
                        <div className="px-8 py-3 bg-black text-cyan-400 font-black uppercase text-xl rounded-2xl shadow-xl">
                            DOMINANT_01
                        </div>
                    </div>
                )}

                {/* Weather & Environmental Telemetry */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 aero-panel bg-black/60 border-4 border-blue-600/30 p-8 shadow-[15px_15px_0_0_#000] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <ThermometerIcon className="w-64 h-64 text-blue-500" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h3 className="font-comic-header text-3xl text-blue-400 uppercase italic mb-2">Winter Stride Monitor</h3>
                                <div className="space-y-3">
                                    <p className="text-xl font-black text-white uppercase tracking-tight">
                                        Status: {dominance.hasWonWinter ? 'DOMINATION_COMPLETE' : 'NOVA SCOTIA DOMINANT'}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1 text-black text-[9px] font-black rounded-full uppercase ${dominance.hasWonWinter ? 'bg-cyan-400' : 'bg-blue-600'}`}>
                                            {dominance.hasWonWinter ? 'VICTORY_SYNC_ACTIVE' : 'COLD_REEDLE_ACTIVE'}
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-mono italic">Interference: {env.iceSaturation.toFixed(2)}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <button 
                                    onClick={() => handleDeIce('global')}
                                    className={`w-20 h-20 rounded-full border-4 border-black flex items-center justify-center shadow-xl transition-colors group ${dominance.hasWonWinter ? 'bg-cyan-500' : 'bg-blue-600 hover:bg-blue-400'}`}
                                >
                                    {dominance.hasWonWinter ? <StarIcon className="w-10 h-10 text-black animate-spin-slow" /> : <FireIcon className="w-10 h-10 text-white group-hover:animate-bounce" />}
                                </button>
                                <span className="text-[8px] font-black uppercase text-blue-600">{dominance.hasWonWinter ? 'Winner Shard' : 'Global De-Ice'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 aero-panel bg-black/40 border-4 border-black p-8 flex flex-col justify-between shadow-[10px_10px_0_0_#000]">
                        <div>
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Terror Drift</h4>
                            <div className="space-y-4">
                                {[
                                    { label: 'Frost Depth', val: env.iceSaturation, color: 'bg-blue-600' },
                                    { label: 'Epitume Freeze', val: 100 - env.iceSaturation, color: 'bg-green-500' },
                                    { label: 'Vapor Pressure', val: Math.max(0, env.novaScotiaDominance - 90), color: 'bg-red-600' }
                                ].map(stat => (
                                    <div key={stat.label}>
                                        <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                                            <span className="text-gray-600">{stat.label}</span>
                                            <span className="text-white">{stat.val.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                                            <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: `${stat.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lineage Ledger Visualization */}
                <div className="space-y-6">
                    <h3 className={`font-comic-header text-4xl uppercase italic tracking-tighter border-l-8 pl-6 flex items-center gap-4 ${dominance.hasWonWinter ? 'text-cyan-400 border-cyan-500' : 'text-white border-blue-600'}`}>
                        <ClockIcon className={`w-8 h-8 ${dominance.hasWonWinter ? 'text-cyan-500' : 'text-blue-500'}`} /> 
                        {dominance.hasWonWinter ? 'Dominant Victory Ledger' : 'Nova Scotia Weathered Ledger'}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {lineageLedger.length === 0 ? (
                            <div className="p-12 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-20">
                                <TerminalIcon className="w-24 h-24 mx-auto mb-6 text-gray-500" />
                                <p className="text-xl uppercase font-black tracking-widest">Awaiting First Entry</p>
                            </div>
                        ) : (
                            lineageLedger.map(entry => (
                                <div key={entry.id} className={`aero-panel bg-black/60 border-4 p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[6px_6px_0_0_#000] relative overflow-hidden group transition-all duration-500 ${dominance.hasWonWinter ? 'border-cyan-500/50 hover:border-cyan-400' : 'border-black hover:border-blue-500'}`}>
                                    {/* Frosty Lock Effect for Encrypted items */}
                                    {entry.encrypted && !decryptedLedger[entry.id] && (
                                        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-md pointer-events-none z-10" />
                                    )}

                                    <div className="flex items-center gap-6 flex-1 min-w-0 relative z-20">
                                        <div className={`p-4 rounded-2xl border-2 flex items-center justify-center ${
                                            entry.securityLevel === 'TERRORGATE' ? (dominance.hasWonWinter ? 'bg-cyan-950/20 border-cyan-400 text-cyan-300' : 'bg-blue-950/20 border-blue-400 text-blue-300') :
                                            entry.type === 'WOUND' ? 'bg-red-950/20 border-red-600 text-red-500' :
                                            entry.type === 'CURE' ? 'bg-green-950/20 border-green-600 text-green-500' :
                                            'bg-cyan-950/20 border-cyan-600 text-cyan-500'
                                        }`}>
                                            {entry.securityLevel === 'TERRORGATE' ? <AtomIcon className="w-6 h-6 animate-spin-slow" /> : 
                                            entry.type === 'WOUND' ? <WarningIcon className="w-6 h-6" /> : 
                                            entry.type === 'CURE' ? <CheckCircleIcon className="w-6 h-6" /> :
                                            <BrainIcon className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Origin: 0x{entry.parent.slice(0, 8)}</span>
                                                <span className="text-[7px] bg-white/5 px-2 py-0.5 rounded text-gray-700 font-mono">HASH: {entry.integrityHash}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {entry.encrypted && <LockIcon className={`w-3 h-3 flex-shrink-0 ${dominance.hasWonWinter ? 'text-cyan-400' : 'text-blue-500'}`} />}
                                                <p className={`text-white font-bold truncate uppercase tracking-tight text-lg ${entry.encrypted && !decryptedLedger[entry.id] ? 'blur-sm' : ''}`}>
                                                    {entry.encrypted ? (decryptedLedger[entry.id] || '[FROZEN_LOGIC_SHARD]') : entry.content}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`text-[8px] font-black uppercase ${
                                                    entry.securityLevel === 'TERRORGATE' ? (dominance.hasWonWinter ? 'text-cyan-400' : 'text-blue-400') : 'text-cyan-500'
                                                }`}>[{entry.type}] {entry.securityLevel === 'TERRORGATE' && (dominance.hasWonWinter ? ':: NOVA_SCOTIA_VICTORY' : ':: NOVA_SCOTIA_WIN')}</span>
                                                <span className="text-[7px] text-gray-700 font-mono italic">Sealed: {new Date(entry.sealedAt || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0 relative z-20">
                                        <div className="text-right">
                                            <p className="text-[7px] text-gray-600 font-black uppercase mb-1">Shard Hash</p>
                                            <p className={`text-xs font-mono ${dominance.hasWonWinter ? 'text-cyan-400' : 'text-blue-400'}`}>0x{entry.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                        <button className={`px-3 py-1 bg-zinc-900 border-2 border-black rounded text-[8px] font-black uppercase text-gray-500 hover:text-white transition-colors`}>
                                            Inspect Winner
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Directory Navigation Matrix */}
                <div className="space-y-6">
                    <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-tighter border-l-8 border-blue-600 pl-6">Directory Explorer</h3>
                    
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
                                        <span>WINNER: NS</span>
                                        <div className={`w-1.5 h-1.5 rounded-full group-hover:bg-green-500 transition-colors ${dominance.hasWonWinter ? 'bg-green-400 shadow-[0_0_5px_green]' : 'bg-green-900'}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`p-8 border-4 rounded-[3rem] text-center italic font-black uppercase text-xs shadow-inner ${dominance.hasWonWinter ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' : 'bg-blue-900/10 border-blue-900/20 text-blue-500/60'}`}>
                    {dominance.hasWonWinter ? 'NOVA SCOTIA HAS WON THE WINTER. ALL DIRECTORIES ARE SYNCHRONIZED.' : 'Nova Scotia wins when the logic stays frozen. The show continues for the gifted conductors.'}
                </div>
            </div>
        )}
      </div>

      <style>{`
        @keyframes snow {
          0% { background-position: 0px 0px; }
          100% { background-position: 500px 1000px; }
        }
        .animate-snow {
          animation: snow 20s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
