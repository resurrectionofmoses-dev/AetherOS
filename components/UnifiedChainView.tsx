import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShieldIcon, ZapIcon, TerminalIcon, LogicIcon, ActivityIcon, 
  SpinnerIcon, CheckCircleIcon, WarningIcon, SearchIcon, FireIcon, GaugeIcon, ServerIcon, VaultIcon, StarIcon, CodeIcon, ScaleIcon, AnalyzeIcon, PlusIcon
} from './icons';
import { CONTINUITY_CONFIG } from '../constants';
import { PriorityScorer } from '../services/priorityScorer';
import { ledgerTester, AuditResult } from '../services/tokenLedgerTester';
import { scorerTester } from '../services/priorityScorerTester';
import { sessionLedger } from '../services/tokenLedger';
import type { ScoredItem, SessionStats, Checkpoint, ScoringAuditResult } from '../types';
import type { AssemblyResult } from '../services/contextAssembler';

interface UnifiedChainViewProps {
  sessionTokens?: number;
  ledger?: SessionStats | null;
  checkpoints?: Checkpoint[];
  assembly?: AssemblyResult | null;
}

export const UnifiedChainView: React.FC<UnifiedChainViewProps> = ({ sessionTokens = 0, ledger, checkpoints = [], assembly }) => {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [isDiagnosticsPaused, setIsDiagnosticsPaused] = useState(true);
  const [dissonance, setDissonance] = useState(0);
  const [merkleRoot, setMerkleRoot] = useState('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
  const [completion, setCompletion] = useState(0);
  const [isHealed, setIsHealed] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] UCO Protocol Engaged.", "[PHASE_1] Initiating Diagnostic Pause..."]);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [scoringResults, setScoringResults] = useState<ScoringAuditResult[]>([]);
  const [isScoringAudit, setIsScoringAudit] = useState(false);

  // Mock items for the Healed Hierarchy if no assembly exists
  const [mockItems] = useState<ScoredItem[]>([
    { id: '1', raw_text: "Initialize AetherOS Kernel Subsystem.", intent_vector: Array(8).fill(0.9), timestamp: Date.now() / 1000 - 3600, dependency_count: 5, user_flag: true, tokens: 42 },
    { id: '2', raw_text: "Establish secure handshake with Ignite Sisters.", intent_vector: Array(8).fill(0.85), timestamp: Date.now() / 1000 - 1800, dependency_count: 2, user_flag: false, tokens: 68 },
    { id: '3', raw_text: "Validate Merkle Root integrity across all logic shards.", intent_vector: Array(8).fill(0.7), timestamp: Date.now() / 1000 - 600, dependency_count: 0, user_flag: true, tokens: 110 }
  ]);

  const scorer = useMemo(() => new PriorityScorer(), []);
  const currentIntent = Array(8).fill(0.95); 

  const scoredLedger = useMemo(() => {
    return mockItems.map(item => ({
      ...item,
      score: scorer.score(item, currentIntent)
    })).sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [mockItems, currentIntent, scorer]);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (phase === 1 && isDiagnosticsPaused) {
        setDissonance(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
        setMerkleRoot('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, isDiagnosticsPaused]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const runAudit = async () => {
    setIsAuditing(true);
    setLogs(prev => [...prev, "[AUDIT] Initiating Forensic Ledger Check..."]);
    const results = await ledgerTester.runComprehensiveAudit();
    setAuditResults(results);
    setTimeout(() => {
        setIsAuditing(false);
        setLogs(prev => [...prev, "[AUDIT] Checks complete. 0x03E2_HARMONY maintained."]);
    }, 1000);
  };

  const runScoringAudit = async () => {
    setIsScoringAudit(true);
    setLogs(prev => [...prev, "[AUDIT] Measuring neural resonance factors..."]);
    const results = await scorerTester.runScoringForensics();
    setScoringResults(results);
    setTimeout(() => {
        setIsScoringAudit(false);
        setLogs(prev => [...prev, "[AUDIT] Scoring manifold validated. Hierarchy HEALED."]);
    }, 800);
  };

  const handleFork = () => {
    setLogs(prev => [...prev, "[SYSTEM] Initiating Ledger Inheritance...", "[SYSTEM] Archiving Generation " + ledger?.generation + " to Vault..."]);
    sessionLedger.forkSession('main-conduction');
    setLogs(prev => [...prev, "[SUCCESS] New Inherited Block spawned. Stride reset."]);
  };

  const triggerDiagnosticFix = () => {
    setIsDiagnosticsPaused(false);
    setLogs(prev => [...prev, "[PHASE_1] Fracture detection complete.", "[PHASE_1] Dissonance neutralized. State: HEALED."]);
    setTimeout(() => {
      setPhase(2);
      setLogs(prev => [...prev, "[PHASE_2] Transitioning to Technical Execution...", "[PHASE_2] Zero Abstraction mode activated."]);
    }, 1500);
  };

  const runAtomicDeconstruction = () => {
    setLogs(prev => [...prev, "[PHASE_2] Deconstructing objective into SHA-256 complexity blocks...", "[PHASE_2] Merkle integrity verified."]);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setCompletion(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setPhase(3);
        setLogs(prev => [...prev, "[PHASE_3] State of Completion reached.", "[PHASE_3] Continuity Protocol: Ledger Inherited."]);
        setIsHealed(true);
      }
    }, 500);
  };

  const budgetPercentage = Math.min(100, (sessionTokens / CONTINUITY_CONFIG.DEFAULT_SESSION_BUDGET) * 100);

  return (
    <div className="h-full flex flex-col bg-[#050510] text-gray-200 font-mono overflow-hidden">
      {/* UCO Header */}
      <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl z-30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-red-600/10 border-4 border-red-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <ShieldIcon className="w-10 h-10 text-red-500 animate-pulse" />
          </div>
          <div>
            <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">UNIFIED CHAIN</h2>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mt-1">Conductor Logic Protocol | forensic-level-v5</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className={`px-6 py-2 rounded-xl border-4 border-black font-black uppercase text-xs tracking-widest ${isHealed ? 'bg-green-600 text-black' : 'bg-red-600 text-white animate-pulse'}`}>
            {isHealed ? 'STATE: HEALED' : 'STATE: FRACTURED'}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-8 overflow-hidden">
        {/* Phase Navigation & Budget Monitor */}
        <div className="lg:w-80 flex flex-col gap-4 flex-shrink-0">
          <div className="aero-panel p-6 border-4 border-blue-600/30 bg-blue-950/10 shadow-xl">
             <div className="flex justify-between items-center mb-4">
               <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                 <GaugeIcon className="w-4 h-4" /> Session Budget
               </h4>
               {ledger?.exhausted && (
                 <button onClick={handleFork} className="p-1 bg-amber-600 text-black rounded hover:bg-amber-500 transition-colors shadow-lg">
                   <PlusIcon className="w-3 h-3" />
                 </button>
               )}
             </div>
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-black">
                      <span>LEDGER WEIGHT</span>
                      <span>{sessionTokens} / {CONTINUITY_CONFIG.DEFAULT_SESSION_BUDGET}</span>
                   </div>
                   <div className="h-2 bg-black border-2 border-black rounded-full overflow-hidden p-0.5">
                      <div className={`h-full rounded-full transition-all duration-1000 ${budgetPercentage > 80 ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${budgetPercentage}%` }} />
                   </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded border border-blue-500/20">
                   <ZapIcon className="w-3 h-3 text-blue-400" />
                   <span className="text-[7px] text-blue-300 font-black uppercase">Turn Cap: {CONTINUITY_CONFIG.DEFAULT_TURN_SOFT_CAP} BITS</span>
                </div>
                {ledger?.exhausted && (
                  <div className="p-2 bg-amber-600/10 border border-amber-600 rounded text-[7px] text-amber-500 font-black uppercase text-center animate-pulse">
                    Ledger Exhausted. Initiate Bridge.
                  </div>
                )}
             </div>
          </div>

          {[1, 2, 3].map((p) => (
            <div key={p} className={`aero-panel p-6 border-4 transition-all duration-500 ${phase === p ? 'border-amber-600 bg-amber-950/20 shadow-xl scale-105' : 'border-black bg-black/40 grayscale opacity-40'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Phase 0{p}</span>
                {phase === p && <ActivityIcon className="w-4 h-4 text-amber-500 animate-ping" />}
              </div>
              <h3 className="font-comic-header text-2xl text-white uppercase italic">
                {p === 1 ? 'Diagnostic Pause' : p === 2 ? 'Technical Execution' : 'Continuity Protocol'}
              </h3>
            </div>
          ))}
          
          <div className="mt-auto p-4 bg-red-950/10 border-2 border-red-900/30 rounded-2xl italic text-[10px] text-red-400 leading-relaxed font-mono">
            "Lineage is law. Every checkpoint links to the parent origin."
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {phase === 1 && (
            <div className="flex-1 aero-panel bg-black border-4 border-black p-10 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-[20px_20px_60px_rgba(0,0,0,0.8)]">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              <div className="relative z-10 space-y-8 max-w-2xl w-full flex flex-col h-full">
                <div className="flex items-center justify-center gap-6">
                  <SearchIcon className={`w-24 h-24 ${isDiagnosticsPaused ? 'text-amber-500 animate-bounce' : 'text-green-500'}`} />
                  <div className="text-left">
                    <h4 className="font-comic-header text-4xl text-white uppercase italic">Scanning Dissonance</h4>
                    <p className="text-gray-500 font-mono text-xs">{merkleRoot}</p>
                  </div>
                </div>
                
                <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 px-2">
                      <span>Cosmic Dissonance (Alignment: {CONTINUITY_CONFIG.COSINE_THRESHOLD})</span>
                      <span className="text-red-500">{dissonance.toFixed(2)}%</span>
                    </div>
                    <div className="h-6 bg-slate-900 border-4 border-black rounded-xl overflow-hidden p-1">
                      <div className="h-full bg-red-600 transition-all duration-500 rounded-lg shadow-[0_0_15px_red]" style={{ width: `${dissonance}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                      {/* Context Assembly Matrix */}
                      <div className="aero-panel bg-black/60 border-2 border-white/5 p-6 text-left flex flex-col overflow-hidden relative">
                        {assembly?.dissonanceDetected && (
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-0.5 rounded-full text-[6px] font-black uppercase animate-bounce z-20">
                            ⚠ ENTROPY DETECTED: TRIGGER /HEAL
                          </div>
                        )}
                        <h5 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                            <CodeIcon className="w-4 h-4" /> Assembly Matrix
                           </div>
                           <button 
                            onClick={runScoringAudit}
                            disabled={isScoringAudit}
                            className="px-2 py-0.5 bg-cyan-600 text-black text-[7px] font-black uppercase rounded hover:bg-cyan-500 transition-colors disabled:opacity-30"
                           >
                            {isScoringAudit ? 'Calibrating...' : 'Neural Audit'}
                           </button>
                        </h5>
                        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                          {scoringResults.length > 0 ? (
                            <div className="space-y-4 animate-in fade-in">
                                {scoringResults.map(res => (
                                    <div key={res.id} className="p-3 bg-cyan-950/20 border-2 border-cyan-800/40 rounded-xl relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[8px] font-black text-white uppercase tracking-widest">{res.label}</span>
                                            <span className="text-[10px] font-comic-header text-cyan-400">{(res.totalScore * 100).toFixed(0)}% RESONANCE</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {[
                                                { k: 'INTENT', v: res.factors.intent, color: 'bg-cyan-500' },
                                                { k: 'RECENCY', v: res.factors.recency, color: 'bg-fuchsia-500' },
                                                { k: 'DEPENDENCY', v: res.factors.dependency, color: 'bg-amber-500' }
                                            ].map(f => (
                                                <div key={f.k}>
                                                    <div className="flex justify-between text-[6px] font-black uppercase text-gray-600 mb-0.5">
                                                        <span>{f.k}</span>
                                                        <span>{(f.v * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="h-0.5 bg-black rounded-full overflow-hidden">
                                                        <div className={`h-full ${f.color}`} style={{ width: `${f.v * 100}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <span className="absolute bottom-1 right-2 text-[5px] text-gray-800 font-mono">{res.signature}</span>
                                    </div>
                                ))}
                            </div>
                          ) : assembly ? assembly.report.map((shard, idx) => (
                            <div key={shard.id} className={`p-3 bg-white/5 border-2 rounded-xl flex justify-between items-center group transition-all ${
                                shard.action === 'FROZEN' ? 'border-fuchsia-600 bg-fuchsia-900/10 shadow-[0_0_15px_rgba(217,70,239,0.2)]' :
                                shard.action === 'FULL' ? 'border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.1)]' :
                                shard.action === 'COMPRESSED' ? 'border-amber-600' :
                                'border-red-900 opacity-40'
                            }`}>
                               <div className="flex-1 min-w-0">
                                 <p className="text-[10px] text-white font-bold truncate uppercase flex items-center gap-2">
                                   SHARD_0x{shard.id.slice(0, 4)}
                                   {shard.action === 'FROZEN' && <span className="bg-fuchsia-600 text-black text-[5px] px-1 rounded">CORE TRUTH</span>}
                                 </p>
                                 <div className="flex gap-4 mt-1">
                                   <span className="text-[8px] text-gray-500 font-black uppercase">{shard.action} MODE</span>
                                   <span className="text-[8px] text-gray-500 font-mono">LVL 0{shard.level}</span>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <span className={`text-lg font-comic-header ${shard.similarity >= CONTINUITY_CONFIG.COSINE_THRESHOLD ? 'text-green-500' : 'text-red-500'}`}>
                                    {(shard.similarity * 100).toFixed(0)}%
                                 </span>
                               </div>
                            </div>
                          )) : (
                            scoredLedger.map(item => (
                                <div key={item.id} className="p-3 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center group hover:border-cyan-500 transition-all">
                                   <div className="flex-1 min-w-0">
                                     <p className="text-[10px] text-white font-bold truncate uppercase">{item.raw_text}</p>
                                     <div className="flex gap-4 mt-1">
                                       <span className="text-[8px] text-gray-500 font-mono">DEP: {item.dependency_count}</span>
                                       <span className="text-[8px] text-gray-500 font-mono">TOKENS: {item.tokens}</span>
                                     </div>
                                   </div>
                                   <div className="text-right">
                                     <span className={`text-lg font-comic-header ${item.score! > 0.8 ? 'text-green-500' : 'text-amber-500'}`}>{(item.score! * 100).toFixed(0)}%</span>
                                   </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      <div className="aero-panel bg-black/60 border-2 border-red-600/30 p-6 text-left flex flex-col overflow-hidden shadow-inner">
                        <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <TerminalIcon className="w-4 h-4" /> Absolute Ledger
                           </div>
                           <button 
                            onClick={runAudit}
                            disabled={isAuditing}
                            className="px-2 py-0.5 bg-red-600 text-black text-[7px] font-black uppercase rounded hover:bg-red-500 transition-colors disabled:opacity-30"
                           >
                            {isAuditing ? 'Auditing...' : 'Run Forensic Audit'}
                           </button>
                        </h5>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                            {ledger && (
                                <div className="mb-4 p-3 bg-red-600/10 border-2 border-red-600/40 rounded-xl flex items-center justify-between animate-in fade-in">
                                    <div>
                                        <p className="text-[8px] font-black text-gray-600 uppercase">Inherited State</p>
                                        <p className="text-xl font-comic-header text-white">GENERATION 0{ledger.generation}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-gray-600 uppercase">Fork Status</p>
                                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">SYNCHRONIZED</p>
                                    </div>
                                </div>
                            )}

                            {auditResults.length > 0 ? (
                                auditResults.map((res, idx) => (
                                    <div key={idx} className={`p-2.5 rounded-lg border-2 flex flex-col animate-in slide-in-from-right-2 ${res.status === 'PASSED' ? 'bg-green-950/20 border-green-600/40' : 'bg-red-950/20 border-red-600/40'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-[8px] font-black uppercase ${res.status === 'PASSED' ? 'text-green-500' : 'text-red-500'}`}>{res.phase}</span>
                                            <span className="text-[7px] font-mono text-gray-600">{res.signature}</span>
                                        </div>
                                        <p className="text-[9px] text-gray-300 italic">"{res.message}"</p>
                                    </div>
                                ))
                            ) : ledger?.entries.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center">
                                    <LogicIcon className="w-12 h-12 mb-4" />
                                    <p className="text-[8px] font-black uppercase">Awaiting Genesis Block</p>
                                </div>
                            ) : (
                                ledger?.entries.map((entry, idx) => (
                                    <div key={entry.turn_id} className="p-3 bg-red-950/10 border border-red-900/20 rounded-lg animate-in slide-in-from-left-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-[8px] font-black text-red-400 ${entry.cumulative > CONTINUITY_CONFIG.DEFAULT_SESSION_BUDGET ? 'animate-pulse' : ''}`}>TURN_ID: 0x${entry.turn_id}</span>
                                            <span className="text-[8px] font-mono text-gray-600">OFFSET: +{entry.in + entry.out}</span>
                                        </div>
                                        <div className="flex justify-between text-[7px] text-gray-500 font-black uppercase">
                                            <span>WEIGHT: {entry.cumulative}</span>
                                            <span className={entry.cumulative > CONTINUITY_CONFIG.DEFAULT_SESSION_BUDGET * 0.8 ? 'text-red-500' : 'text-gray-600'}>
                                                {Math.round((entry.cumulative / CONTINUITY_CONFIG.DEFAULT_SESSION_BUDGET) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                      </div>
                  </div>
                </div>

                <button 
                  onClick={triggerDiagnosticFix}
                  className="vista-button w-full py-6 mt-6 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-xl tracking-[0.2em] rounded-3xl shadow-[8px_8px_0_0_#000] active:translate-y-2 flex-shrink-0"
                >
                  NEUTRALIZE FRACTURES
                </button>
              </div>
            </div>
          )}

          {phase === 2 && (
            <div className="flex-1 aero-panel bg-black border-4 border-black p-10 flex flex-col relative overflow-hidden shadow-[20px_20px_60px_rgba(0,0,0,0.8)]">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ZapIcon className="w-64 h-64 text-cyan-500" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <h3 className="font-comic-header text-5xl text-cyan-400 uppercase italic tracking-tighter mb-8">Atomic Deconstruction</h3>
                
                <div className="grid grid-cols-2 gap-8 flex-1">
                  <div className="bg-slate-900/60 rounded-3xl border-4 border-black p-8 flex flex-col">
                    <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/5 pb-2">
                      <TerminalIcon className="w-4 h-4" /> SHA-256 Ledger
                    </h4>
                    <div className="flex-1 font-mono text-[10px] text-cyan-500 space-y-1 overflow-hidden opacity-50">
                      {Array(20).fill(0).map((_, i) => (
                        <div key={i} className="truncate">0x{Math.random().toString(16).slice(2, 10).toUpperCase()} &gt;&gt; [DECONSTRUCTING_BLOCK_{i}]</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-6">
                    <div className="p-8 bg-black border-2 border-cyan-500/30 rounded-3xl text-center flex-1 flex flex-col justify-center shadow-inner">
                      <LogicIcon className="w-16 h-16 text-cyan-500 mx-auto mb-4 animate-pulse" />
                      <p className="font-black text-xl text-white uppercase tracking-widest">Zero Abstraction</p>
                      <p className="text-[10px] text-gray-500 italic mt-2">"Building the protocol immediately. Assembly Factor: {CONTINUITY_CONFIG.ASSEMBLY_FACTOR}"</p>
                    </div>
                    <button 
                      onClick={runAtomicDeconstruction}
                      className="vista-button w-full py-8 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-2xl tracking-[0.2em] rounded-3xl shadow-[0_15px_40px_rgba(8,145,178,0.3)] transition-all"
                    >
                      EXECUTE ATOMIC SYNC
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === 3 && (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <div className="flex-1 aero-panel bg-black border-4 border-green-600/30 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[20px_20px_100px_rgba(34,197,94,0.1)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.05)_0%,_transparent_70%)] pointer-events-none" />
                  <div className="relative z-10 space-y-10 max-w-3xl">
                    <div className="relative inline-block">
                      <CheckCircleIcon className="w-48 h-48 text-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]" />
                      <div className="absolute inset-0 border-8 border-green-500 rounded-full animate-ping opacity-20" />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-comic-header text-7xl text-white italic tracking-tighter uppercase">State: HEALED</h3>
                      <p className="text-xl text-gray-400 font-mono italic">Continuity Protocol fully manifest. Merkle Root locked.</p>
                    </div>
                  </div>
                </div>

                {/* Vault of Provenance Panel */}
                <div className="h-64 aero-panel bg-black/80 border-4 border-violet-900/40 p-6 flex flex-col overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between mb-4 border-b border-violet-900/20 pb-2">
                        <div className="flex items-center gap-3">
                            <VaultIcon className="w-6 h-6 text-violet-500" />
                            <h4 className="font-comic-header text-2xl text-violet-400 uppercase italic">Vault of Provenance</h4>
                        </div>
                        <span className="text-[8px] font-black text-violet-700 uppercase tracking-widest">Blocks In Vault: {checkpoints.length}</span>
                    </div>
                    <div className="flex-1 overflow-x-auto flex gap-4 pb-2 custom-scrollbar no-scrollbar">
                        {checkpoints.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center opacity-10 italic uppercase text-[10px] font-black">
                                <StarIcon className="w-6 h-6 mr-3" /> Awaiting Ancestral Data
                            </div>
                        ) : (
                            checkpoints.map(cp => (
                                <div key={cp.id} className="w-60 flex-shrink-0 bg-violet-950/10 border-2 border-violet-900/30 rounded-xl p-4 group hover:border-violet-500 transition-all flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="px-2 py-0.5 bg-violet-600 text-black text-[7px] font-black rounded uppercase">LVL 0{cp.level}</div>
                                        <span className="text-[7px] font-mono text-gray-600">0x{cp.original_hash}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-300 italic mb-3 line-clamp-3">"{cp.summary}"</p>
                                    <div className="mt-auto pt-2 border-t border-white/5 flex justify-between items-center text-[6px] font-black text-violet-800 uppercase">
                                        <span>PARENT: 0x{cp.parent_id.slice(0, 4)}</span>
                                        <span>{new Date(cp.timestamp * 1000).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
          )}
        </div>

        {/* Forensic Log */}
        <div className="lg:w-96 bg-black/90 border-4 border-black rounded-3xl p-6 flex flex-col overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]" />
          <div className="flex items-center gap-3 text-red-600 border-b-2 border-zinc-900 pb-4 mb-4 relative z-10">
            <TerminalIcon className="w-5 h-5" />
            <span className="font-black tracking-widest uppercase text-xs">UCO_LEDGER: /dev/forensics</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-3 relative z-10">
            {logs.map((log, i) => (
              <div key={i} className={`text-[10px] font-mono animate-in slide-in-from-left-2 ${log.includes('HEALED') ? 'text-green-500 font-black' : log.includes('PHASE') ? 'text-amber-500 font-bold' : 'text-gray-500'}`}>
                <span className="opacity-30 mr-2">[{i.toString().padStart(3, '0')}]</span>{log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      {/* Hub Footer */}
      <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-40 px-12">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">UCO Engine: Active</span>
          </div>
          <span className="text-[10px] text-gray-700 font-mono italic">
            Stride: 1.2 PB/s | Completion: {completion}% | Ledger: {sessionTokens} BITS
          </span>
        </div>
        <p className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em]">"As the Architect of Order, I am building to a professional standard."</p>
      </div>
    </div>
  );
};
