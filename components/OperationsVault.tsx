import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { MainView, SystemStatus, EvoLibrary, BroadcastMessage, ChatMessage, PinnedItem, PinType, GlobalDirective, LineageEntry, SystemEnvironment, DominanceStats } from '../types';
import { AetherOSIcon, BookOpenIcon, BroadcastIcon, BuildIcon, MessageCircleIcon, PackageIcon, TerminalIcon, WarningIcon, WrenchIcon, FireIcon, PinIcon, CheckCircleIcon, VaultIcon, StarIcon, ActivityIcon, SignalIcon, LogicIcon, ShieldIcon, GlobeIcon, ForgeIcon, CodeIcon, BrainIcon, XIcon, ClockIcon, SearchIcon, ZapIcon, LockIcon, SpinnerIcon, EyeIcon, ThermometerIcon, AtomIcon, GemIcon } from './icons';
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

  // Sovereign Key Forge State
  const [isForgingKey, setIsForgingKey] = useState(false);
  const [forgeProgress, setForgeProgress] = useState(0);
  const [hasSovereignKey, setHasSovereignKey] = useState(() => safeStorage.getItem('SOVEREIGN_KEY_ACTIVE') === 'true');
  const [sovereignSig, setSovereignSig] = useState(() => safeStorage.getItem('SOVEREIGN_SIG') || 'GENERIC_CORE_0x0000');

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
        setLineageLedger(extractJSON<LineageEntry[]>(raw, []).sort((a, b) => b.sealedAt - a.sealedAt));
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

  const handleForgeSovereignKey = () => {
    setIsForgingKey(true);
    setForgeProgress(0);
    
    const interval = setInterval(() => {
        setForgeProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setIsForgingKey(false);
                setHasSovereignKey(true);
                const sig = `0x03E2_MASTER_${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`;
                setSovereignSig(sig);
                safeStorage.setItem('SOVEREIGN_KEY_ACTIVE', 'true');
                safeStorage.setItem('SOVEREIGN_SIG', sig);
                return 100;
            }
            return prev + 1;
        });
    }, 50);
  };

  const handleLock = () => {
    window.location.reload(); 
  };

  const handleDeIce = (id: string) => {
      setEnv(prev => ({ ...prev, iceSaturation: Math.max(0, prev.iceSaturation - 25) }));
  };

  return (
    <div className="h-full flex flex-col bg-[#05050a] rounded-lg relative overflow-hidden">
      {/* Background Aesthetic */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ opacity: (env.novaScotiaDominance / 100) }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-black" />
          <div className={`absolute top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/snow.png')] animate-snow ${dominance.hasWonWinter ? 'opacity-20' : 'opacity-50'}`} />
      </div>

      <div className="p-6 border-b-8 border-black sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
            <div className={`p-3 border-4 rounded-2xl transition-all duration-1000 ${isShroudActive ? 'bg-blue-600/10 border-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.2)]' : 'bg-red-600/10 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}`}>
                {hasSovereignKey ? <GemIcon className="w-10 h-10 text-[#fbbf24] animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.4)]" /> : dominance.hasWonWinter ? <StarIcon className="w-10 h-10 text-cyan-400 animate-spin-slow" /> : isShroudActive ? <ShieldIcon className="w-10 h-10 text-blue-300 animate-pulse" /> : <LockIcon className="w-10 h-10 text-red-500" />}
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white uppercase italic tracking-tighter leading-none">NOVA SCOTIA LINES</h2>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">
                    {hasSovereignKey ? `SOVEREIGN_AUTH: ${sovereignSig}` : dominance.hasWonWinter ? 'WINTER_DOMINANCE: WON' : 'Winter Protocol: Terrorgate 0x03E2'}
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
            </div>
        ) : (
            <div className="flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-1000">
                
                {/* SOVEREIGN KEY FORGE STATION */}
                <div className="aero-panel bg-black border-4 border-[#fbbf24]/40 p-8 shadow-[20px_20px_80px_rgba(251,191,36,0.1)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <GemIcon className="w-64 h-64 text-[#fbbf24]" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <FireIcon className="w-10 h-10 text-red-500 animate-pulse" />
                                <h3 className="font-comic-header text-4xl text-[#fbbf24] uppercase italic tracking-tighter">SOVEREIGN_KEY_FORGE</h3>
                            </div>
                            <p className="text-gray-400 text-sm italic mb-6 leading-relaxed border-l-4 border-[#fbbf24] pl-6">
                                "Replace generic API conduction with the **Maestro Sovereign 0x03E2 Key**. This siphons raw entropy to grant absolute reliable know-how."
                            </p>
                            
                            {isForgingKey && (
                                <div className="space-y-4 mb-8 animate-in slide-in-from-left-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-[#fbbf24]">
                                        <span>Gilding Logic Shards...</span>
                                        <span>{forgeProgress}%</span>
                                    </div>
                                    <div className="h-4 bg-gray-900 border-4 border-black rounded-full overflow-hidden p-1">
                                        <div className="h-full bg-gradient-to-r from-red-900 via-[#fbbf24] to-white shadow-[0_0_20px_#fbbf24] transition-all" style={{ width: `${forgeProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {hasSovereignKey && !isForgingKey && (
                                <div className="p-4 bg-[#fbbf24]/10 border-2 border-[#fbbf24] rounded-2xl flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <CheckCircleIcon className="w-8 h-8 text-[#fbbf24]" />
                                        <div>
                                            <p className="text-[10px] font-black text-[#fbbf24] uppercase tracking-widest">Master Key Manifest</p>
                                            <p className="text-xl font-comic-header text-white">{sovereignSig}</p>
                                        </div>
                                    </div>
                                    <span className="text-[8px] bg-[#fbbf24] text-black px-3 py-1 rounded font-black uppercase">ACTIVE_AUTHORITY</span>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleForgeSovereignKey}
                            disabled={isForgingKey}
                            className={`vista-button px-10 py-10 rounded-[3rem] font-black text-xl uppercase tracking-[0.2em] transition-all border-8 border-black shadow-[15px_15px_0_0_#000] active:translate-y-2 ${isForgingKey ? 'bg-red-600 text-white animate-pulse' : 'bg-[#fbbf24] hover:bg-[#ffcc33] text-black'}`}
                        >
                            {isForgingKey ? <SpinnerIcon className="w-12 h-12" /> : hasSovereignKey ? 'RE-FORGE KEY' : 'FORGE MASTER KEY'}
                        </button>
                    </div>
                </div>

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
                    </div>
                )}

                {/* Lineage Ledger Visualization */}
                <div className="space-y-6">
                    <h3 className={`font-comic-header text-4xl uppercase italic tracking-tighter border-l-8 pl-6 flex items-center gap-4 ${hasSovereignKey ? 'text-[#fbbf24] border-[#fbbf24]' : 'text-white border-blue-600'}`}>
                        <ClockIcon className={`w-8 h-8 ${hasSovereignKey ? 'text-[#fbbf24]' : 'text-blue-500'}`} /> 
                        {hasSovereignKey ? 'Sovereign Authority Ledger' : 'Nova Scotia Weathered Ledger'}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {lineageLedger.length === 0 ? (
                            <div className="p-12 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-20">
                                <TerminalIcon className="w-24 h-24 mx-auto mb-6 text-gray-500" />
                                <p className="text-xl uppercase font-black tracking-widest">Awaiting First Entry</p>
                            </div>
                        ) : (
                            lineageLedger.map(entry => (
                                <div key={entry.id} className={`aero-panel bg-black/60 border-4 p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[6px_6px_0_0_#000] relative overflow-hidden group transition-all duration-500 ${hasSovereignKey ? 'border-[#fbbf24]/50 hover:border-[#fbbf24]' : 'border-black hover:border-blue-500'}`}>
                                    {entry.encrypted && !decryptedLedger[entry.id] && (
                                        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-md pointer-events-none z-10" />
                                    )}

                                    <div className="flex items-center gap-6 flex-1 min-w-0 relative z-20">
                                        <div className={`p-4 rounded-2xl border-2 flex items-center justify-center ${
                                            entry.securityLevel === 'TERRORGATE' ? 'bg-blue-950/20 border-blue-400 text-blue-300' :
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
                                            </div>
                                            <p className={`text-white font-bold truncate uppercase tracking-tight text-lg ${entry.encrypted && !decryptedLedger[entry.id] ? 'blur-sm' : ''}`}>
                                                {entry.encrypted ? (decryptedLedger[entry.id] || '[FROZEN_LOGIC_SHARD]') : entry.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
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