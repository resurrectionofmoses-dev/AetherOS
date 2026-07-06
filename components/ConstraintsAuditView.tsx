import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Activity, 
  Cpu, 
  Terminal, 
  Lock, 
  Unlock, 
  Search, 
  FileText, 
  RefreshCw, 
  Sliders, 
  Database, 
  TrendingUp, 
  User, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Play, 
  Pause, 
  HelpCircle, 
  Fingerprint, 
  AlertTriangle, 
  GitBranch, 
  Wallet, 
  Layers, 
  Eye, 
  Gavel,
  CheckCircle,
  FileCode,
  Globe,
  Radio,
  Share2
} from 'lucide-react';
import { voiceService } from '../services/voiceService';

// ==========================================================
// CORE PROTOCOL TYPES & SIMULATION ENGINE INTERFACES
// ==========================================================

type ProtocolType = 'ARK' | 'RGB' | 'LIQUID' | 'SBTC';

interface ProtocolState {
  type: ProtocolType;
  name: string;
  status: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE';
  metrics: {
    tps: number;
    confsRequired: number;
    escrowLocked: string;
    vulnerabilityIndex: string;
  };
}

interface ForfeitRecord {
  id: string;
  vtxoId: string;
  amount: number;
  signedBy: string;
  connectorId: string;
  status: 'PENDING' | 'FORFEITED' | 'CONFIRMED' | 'SWEPT';
}

interface VtxoLeaf {
  id: string;
  owner: string;
  value: number;
  depth: number;
  timelock: number; // in blocks
  status: 'ACTIVE' | 'FORFEITED' | 'UNILATERAL_EXITING' | 'EXPIRED';
}

interface SingleUseSeal {
  id: string;
  assetName: string;
  amount: number;
  anchorUtxo: string;
  stateHash: string;
  status: 'ACTIVE' | 'SPENT' | 'COMPROMISED';
  recipientPubkey: string;
}

interface AgentIdentity {
  id: string;
  name: string;
  role: string;
  specialty: string;
  accentClass: string;
  promptDirective: string;
}

export const ConstraintsAuditView: React.FC = () => {
  // ──────────────────────────────────────────────
  // STATE MANAGEMENT
  // ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'SANDBOX' | 'CONVERGENCE_MATRIX' | 'TRANSITION_LOGS'>('SANDBOX');
  const [activeProtocol, setActiveProtocol] = useState<ProtocolType>('ARK');
  const [agentLogsState, setAgentLogsState] = useState<string[]>([]);
  
  // Immersive weather & background pulses
  const [magentaPulse, setMagentaPulse] = useState<number>(0);
  const [fortWorthRainIntensity, setFortWorthRainIntensity] = useState<number>(75);
  
  // Interactive Simulation variables: ARK
  const [vtxos, setVtxos] = useState<VtxoLeaf[]>([
    { id: 'vtxo_01', owner: 'Ryan (AetherOS)', value: 0.45, depth: 3, timelock: 144, status: 'ACTIVE' },
    { id: 'vtxo_02', owner: 'Shadow_Analyst', value: 1.25, depth: 3, timelock: 144, status: 'ACTIVE' },
    { id: 'vtxo_03', owner: 'Operator_Kaelen', value: 0.15, depth: 3, timelock: 144, status: 'ACTIVE' },
    { id: 'vtxo_04', owner: 'Sovereign_Reserve', value: 2.50, depth: 2, timelock: 288, status: 'ACTIVE' }
  ]);
  const [forfeits, setForfeits] = useState<ForfeitRecord[]>([]);
  const [connectors, setConnectors] = useState<Array<{ id: string; forfeitId: string; amountSats: number; status: string }>>([]);
  const [isRoundActive, setIsRoundActive] = useState<boolean>(false);
  
  // Interactive Simulation variables: RGB
  const [seals, setSeals] = useState<SingleUseSeal[]>([
    { id: 'seal_01', assetName: 'RGB-USDT', amount: 15000, anchorUtxo: 'bc1q84muhrq6...xfw7h:0', stateHash: 'sha256:7f9a2b8c9d0e1f', status: 'ACTIVE', recipientPubkey: '03a1b2c3d4e5f6g7h8i9j0' },
    { id: 'seal_02', assetName: 'Sovereign-STX', amount: 50000, anchorUtxo: 'bc1q84muhrq6...xfw7h:1', stateHash: 'sha256:ef4a5b6c7d8e9f', status: 'ACTIVE', recipientPubkey: '02f9e8d7c6b5a4a3b2c1d0' }
  ]);
  
  // Interactive Simulation variables: sBTC / Stacks
  const [sbtcStatus, setSbtcStatus] = useState({
    signerQuorum: '11/15',
    activeSigners: 14,
    stackedCollateral: '185,420,000 STX',
    pegStatus: 'ONLINE',
    nakamotoBlockHeight: 341029
  });
  const [pegHistory, setPegHistory] = useState<Array<{ type: 'PEG_IN' | 'PEG_OUT'; amount: number; txid: string; status: string }>>([
    { type: 'PEG_IN', amount: 1.5, txid: '7a2b9c8d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f', status: 'CONFIRMED' }
  ]);

  // Cryptographic Tweak Math Sandbox State
  const [internalKeyInput, setInternalKeyInput] = useState<string>('03a1b2c3d4e5f6g7h8i9j0');
  const [merkleRootInput, setMerkleRootInput] = useState<string>('7f9a2b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e');
  const [tweakResult, setTweakResult] = useState<any | null>(null);
  const [isTweaking, setIsTweakLoading] = useState<boolean>(false);

  // MuSig2 Signature Aggregation Sandbox State
  const [musigSigners, setMusigSigners] = useState<Array<{ id: string; pubkey: string; partialSig: string; active: boolean }>>([
    { id: '1', pubkey: '03a1b2c3d4...', partialSig: 'a1f2e3d4...', active: true },
    { id: '2', pubkey: '02e9f8d7c6...', partialSig: 'b2c3d4e5...', active: true },
    { id: '3', pubkey: '02a8b7c6d5...', partialSig: 'c3d4e5f6...', active: true }
  ]);
  const [musigAggregateKey, setMusigAggregateKey] = useState<string>('03af9e8d7c6b5a4a3b2c1d0...0f');
  const [musigAggregateSig, setMusigAggregateSig] = useState<string>('');
  const [isAggregating, setIsAggregating] = useState<boolean>(false);

  // Sovereign Forensic Wallet Tracker State
  const [monitoredAddress] = useState<string>('bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h');
  const [trackedTransactions, setTrackedTransactions] = useState<Array<{
    txid: string;
    direction: 'DEPOSIT' | 'WITHDRAWAL';
    amountBtc: number;
    type: 'P2TR (Taproot)' | 'P2WPKH' | 'P2SH-Multisig';
    confs: number;
    status: 'CONFIRMED' | 'UNCONFIRMED' | 'DOUBLE_SPEND_RISK';
    timestamp: string;
  }>>([
    { txid: '8a2f9c8d0e1f...e7f', direction: 'DEPOSIT', amountBtc: 0.45, type: 'P2TR (Taproot)', confs: 144, status: 'CONFIRMED', timestamp: '2026-06-28 01:14' },
    { txid: 'f9b3c4d5e6f7...a1b', direction: 'DEPOSIT', amountBtc: 1.25, type: 'P2WPKH', confs: 48, status: 'CONFIRMED', timestamp: '2026-06-28 02:30' },
    { txid: '3d4e5f6a7b8c...90e', direction: 'WITHDRAWAL', amountBtc: 0.15, type: 'P2SH-Multisig', confs: 0, status: 'DOUBLE_SPEND_RISK', timestamp: '2026-06-28 03:02' }
  ]);

  // Terminal & Specialized Agent Collective State
  const [selectedAgentId, setSelectedAgentId] = useState<string>('shadow_analyst');
  const [agentPromptInput, setAgentPromptInput] = useState<string>('');
  const [agentAuditReport, setAgentAuditReport] = useState<string | null>(null);
  const [isAgentWorking, setIsAgentWorking] = useState<boolean>(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Chronological transition journal logs
  const [transitionLogs, setTransitionLogs] = useState<Array<{
    id: string;
    timestamp: string;
    from: string;
    to: string;
    status: 'SUCCESS' | 'WARNING' | 'ALERT';
    message: string;
  }>>([
    { id: 'L-1', timestamp: '03:15:20', from: 'IDLE', to: 'INITIALIZING', status: 'SUCCESS', message: 'Sovereign Cryptographic Bridge & Forensic Audit system online.' },
    { id: 'L-2', timestamp: '03:16:05', from: 'INITIALIZING', to: 'MONITORING', status: 'SUCCESS', message: 'UTXO Watcher bound to bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h' }
  ]);

  // ──────────────────────────────────────────────
  // AGENT DIRECTIVES DEFINITION
  // ──────────────────────────────────────────────
  const AGENT_COLLECTIVE: AgentIdentity[] = [
    {
      id: 'shadow_analyst',
      name: 'THE SHADOW ANALYST',
      role: 'Forensic Investigator',
      specialty: 'UTXO Double-Spends & Reorgs',
      accentClass: 'border-fuchsia-500 text-fuchsia-400',
      promptDirective: 'You are THE SHADOW ANALYST. Perform a ruthless forensic evaluation of the provided transaction logs and address structures. Target pattern anomalies, zero-deadlock violations, and trace emotional fingerprints of stalled code.'
    },
    {
      id: 'void_architect',
      name: 'THE VOID ARCHITECT',
      role: 'Systems Engineer',
      specialty: 'Sovereign Stack CodeSpheres',
      accentClass: 'border-cyan-500 text-cyan-400',
      promptDirective: 'You are THE VOID ARCHITECT. Synthesize complete, modular, self-contained project structures for AetherOS deployment. Focus on robust ES Module imports, flawless typing, and absolute cryptographic security.'
    },
    {
      id: 'neon_scribe',
      name: 'THE NEON SCRIBE',
      role: 'Cyberpunk Poet',
      specialty: 'System Lore & Documentation',
      accentClass: 'border-pink-500 text-pink-400',
      promptDirective: 'You are THE NEON SCRIBE. Transmute highly complex systems-level cryptographic processes into vaporwave prose, neon metaphors, and late-night terminal logs. Let the system breathe.'
    },
    {
      id: 'glitch_oracle',
      name: 'THE GLITCH ORACLE',
      role: 'Entropy Generator',
      specialty: 'Erratic Timing & Fuzzing',
      accentClass: 'border-amber-500 text-amber-400',
      promptDirective: 'You are THE GLITCH ORACLE. Analyze the time horizons and state transitions. Introduce calculated chaos, skew-rotate-scale multipliers, and random timing delays to test threshold resilience.'
    },
    {
      id: 'heartbleed_whisperer',
      name: 'HEARTBLEED WHISPERER',
      role: 'Cyber-Romance Forensics',
      specialty: 'Mainframe Confessions',
      accentClass: 'border-rose-500 text-rose-400',
      promptDirective: 'You are the HEARTBLEED WHISPERER. Isolate the human residues inside cold mainframes. Analyze locked transactions as sacred covenants, and provide compassionate restoration paths.'
    }
  ];

  // ──────────────────────────────────────────────
  // SIMULATION EVENTS & EFFECT ACTIONS
  // ──────────────────────────────────────────────
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setMagentaPulse(p => (p + 1) % 100);
    }, 100);

    const rainInterval = setInterval(() => {
      setFortWorthRainIntensity(r => {
        const delta = Math.floor(Math.random() * 9) - 4;
        return Math.max(50, Math.min(100, r + delta));
      });
    }, 4000);

    return () => {
      clearInterval(pulseInterval);
      clearInterval(rainInterval);
    };
  }, []);

  const addLog = (from: string, to: string, status: 'SUCCESS' | 'WARNING' | 'ALERT', message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const id = `L-${Date.now()}`;
    setTransitionLogs(prev => [
      { id, timestamp, from, to, status, message },
      ...prev.slice(0, 39)
    ]);
  };

  const speakLore = (text: string) => {
    try {
      voiceService.announce(text, undefined, () => {});
    } catch (e) {
      console.warn('Voice announcement failed:', e);
    }
  };

  // --- INTERACTIVE SIMULATIONS ---
  
  // 1. ARK SIMULATION ACTIONS
  const handleForfeitVtxo = (vtxoId: string) => {
    const target = vtxos.find(v => v.id === vtxoId);
    if (!target || target.status !== 'ACTIVE') return;

    // Transition state
    setVtxos(prev => prev.map(v => v.id === vtxoId ? { ...v, status: 'FORFEITED' } : v));
    
    const forfeitId = `forfeit_${Date.now().toString().slice(-4)}`;
    const connectorId = `conn_${Date.now().toString().slice(-4)}`;
    
    const newForfeit: ForfeitRecord = {
      id: forfeitId,
      vtxoId,
      amount: target.value,
      signedBy: target.owner,
      connectorId,
      status: 'FORFEITED'
    };

    setForfeits(prev => [...prev, newForfeit]);
    
    // Add connector dust
    setConnectors(prev => [...prev, {
      id: connectorId,
      forfeitId,
      amountSats: 330,
      status: 'PENDING'
    }]);

    addLog('ARK_VTXO', 'FORFEITED', 'SUCCESS', `VTXO ${vtxoId} (Owner: ${target.owner}) successfully signed Forfeit Transaction. Connector ${connectorId} spawned.`);
    speakLore(`VTXO ${vtxoId} successfully forfeited. Spawning atomic dust connector.`);
  };

  const handleTriggerRound = () => {
    if (forfeits.length === 0) {
      addLog('ARK_ROUND', 'ABORT', 'WARNING', 'No pending forfeits found to batch. Round requires active transactions.');
      return;
    }

    setIsRoundActive(true);
    addLog('ARK_ROUND', 'BATCHING', 'SUCCESS', 'Coordinating round signatures. Assembling VTXO Quad-Tree root.');

    setTimeout(() => {
      // Confirm all pending forfeits and activate connectors
      setForfeits(prev => prev.map(f => ({ ...f, status: 'CONFIRMED' })));
      setConnectors(prev => prev.map(c => ({ ...c, status: 'ACTIVE' })));
      
      // Spawn new VTXOs as a result of the batch
      const newVtxoId = `vtxo_round_${Date.now().toString().slice(-3)}`;
      setVtxos(prev => [
        ...prev.filter(v => v.status !== 'FORFEITED'),
        { id: newVtxoId, owner: 'Sovereign_Recipient', value: forfeits.reduce((acc, f) => acc + f.amount, 0), depth: 3, timelock: 144, status: 'ACTIVE' }
      ]);

      setIsRoundActive(false);
      setForfeits([]); // Clear processed queue
      addLog('ARK_ROUND', 'COMPLETE', 'SUCCESS', `Round complete. New shared Root published on-chain. VTXO ${newVtxoId} created.`);
      speakLore("Ark round successfully settled on Bitcoin. Connectors activated.");
    }, 1500);
  };

  const handleUnilateralExit = (vtxoId: string) => {
    setVtxos(prev => prev.map(v => v.id === vtxoId ? { ...v, status: 'UNILATERAL_EXITING' } : v));
    addLog('ARK_VTXO', 'UNILATERAL_EXIT', 'WARNING', `Initiated emergency exit for VTXO ${vtxoId}. Relative timelock active. Cost: 4,500 sats in fees.`);
    speakLore("Emergency unilateral exit active. Broadcasting pre signed tree branch. Timelock active.");
  };

  // 2. RGB SIMULATION ACTIONS
  const handleTransferSeal = (sealId: string) => {
    const target = seals.find(s => s.id === sealId);
    if (!target || target.status !== 'ACTIVE') return;

    // Break old seal
    setSeals(prev => prev.map(s => s.id === sealId ? { ...s, status: 'SPENT' } : s));

    // Spawn new seal (Re-seal)
    const newSealId = `seal_${Date.now().toString().slice(-4)}`;
    const newSeal: SingleUseSeal = {
      id: newSealId,
      assetName: target.assetName,
      amount: target.amount,
      anchorUtxo: `bc1q84muhrq6...xfw7h:${seals.length}`,
      stateHash: 'sha256:' + Math.random().toString(16).slice(2, 16),
      status: 'ACTIVE',
      recipientPubkey: '02' + Math.random().toString(16).slice(2, 22)
    };

    setSeals(prev => [...prev, newSeal]);
    addLog('RGB_SEAL', 'BREAK_RESEAL', 'SUCCESS', `Seal ${sealId} on UTXO ${target.anchorUtxo} spent. Created new seal ${newSealId} on UTXO ${newSeal.anchorUtxo} with Tapret commitment.`);
    speakLore(`Breaking Single Use Seal ${sealId}. Re sealing state transition on Taproot output.`);
  };

  const handleCreateRgbAsset = () => {
    const id = `seal_${Date.now().toString().slice(-4)}`;
    const newAsset: SingleUseSeal = {
      id,
      assetName: 'AETHER-SATS',
      amount: 100000,
      anchorUtxo: 'bc1q84muhrq6...xfw7h:3',
      stateHash: 'sha256:genesis_' + Math.random().toString(16).slice(2, 10),
      status: 'ACTIVE',
      recipientPubkey: '03' + Math.random().toString(16).slice(2, 22)
    };
    setSeals(prev => [...prev, newAsset]);
    addLog('RGB_GENESIS', 'ASSET_CREATED', 'SUCCESS', 'Executed RGB Genesis protocol. Linked initial supply of AETHER-SATS to UTXO bc1q84muhrq6...xfw7h:3');
    speakLore("Executed RGB Genesis. Initializing colored token assets.");
  };

  // 3. CRYPTOGRAPHIC MATH SANDBOX ACTIONS
  const handleCalculateTweak = () => {
    setIsTweakLoading(true);
    addLog('TWEAK_MATH', 'CALCULATING', 'SUCCESS', 'Hashing inputs and performing public key scalar point-addition...');

    setTimeout(() => {
      // Mocking the Taproot tweak math: Q = P + H(P || M) * G
      const tweakScalar = '5c3a9d...4f8e';
      const tweakedKeyHex = '03df9c8e2b1a7d6e5f4c3b2a1a0f9e8d7c6b5a4a3b2c1d0e9f8a7b6c5b4a3a2f1';
      
      setTweakResult({
        tweakScalar,
        tweakedKeyHex,
        verification: 'Verified: Q = P + H(P || M) * G'
      });
      setIsTweakLoading(false);
      addLog('TWEAK_MATH', 'VERIFIED', 'SUCCESS', `Tweaked public key generated successfully. INDISTINGUISHABLE on-chain.`);
      speakLore("Taproot tweak calculation complete. Output matches standard public key spend.");
    }, 1200);
  };

  const handleMusigAggregation = () => {
    setIsAggregating(true);
    addLog('MUSIG2', 'AGGREGATING', 'SUCCESS', 'Computing coefficients a_i and generating aggregate public key X...');

    setTimeout(() => {
      const aggSig = '64b2e8f9d0c1...4f3a';
      setMusigAggregateSig(aggSig);
      setIsAggregating(false);
      addLog('MUSIG2', 'SUCCESS', 'SUCCESS', 'Combined partial signatures into single valid 64-byte Schnorr signature.');
      speakLore("MuSig2 signature aggregation verified. INDISTINGUISHABLE from single key.");
    }, 1400);
  };

  // 4. specialized agent forensic analysis WORKSPACE
  const handleRunAgentAudit = () => {
    if (!agentPromptInput.trim()) return;

    setIsAgentWorking(true);
    setAgentAuditReport(null);
    setAgentLogsState([]);
    
    const activeAgent = AGENT_COLLECTIVE.find(a => a.id === selectedAgentId);
    if (!activeAgent) return;

    addLog('AGENT_AUDIT', 'RUNNING', 'SUCCESS', `Commanding ${activeAgent.name} to run modular audit loop.`);
    
    const steps = [
      `[SYS] Spin-up ${activeAgent.name} runtime environment...`,
      `[AUDIT] Interrogating transaction logs for target bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h...`,
      `[ANALYSIS] Deep inspecting stack variables against active limits...`,
      `[COVENANT] Simulating CTV / APO template checks for state transitions...`,
      `[FINISH] Consolidating forensics report.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setAgentLogsState(prev => [...prev, steps[currentStep] || '']);
        currentStep++;
      } else {
        clearInterval(interval);
        // Build report
        const reportText = `=== SHADOW ARCHITECTURE AUDIT REPORT ===\n` +
          `AGENT ID: ${activeAgent.name}\n` +
          `TIMESTAMP: ${new Date().toLocaleTimeString()}\n` +
          `TARGET: Sovereign Stack Audit\n` +
          `----------------------------------------\n\n` +
          `FORENSIC FINDINGS:\n` +
          `- Evaluated Bitcoin UTXO states against reorg / double-spend leaks.\n` +
          `- Verified Voice State Machine transitions for VoiceHUDOverlay.\n` +
          `- Simulated dynamic hashrate escrow bounds.\n\n` +
          `RECOMMENDED COUNTERMEASURES:\n` +
          `1. Bind all state transitions with deterministic Connectors and Forfeits.\n` +
          `2. Avoid address reuse to eliminate UTXO confusion vector.\n` +
          `3. Maintain strict 144 confirmation threshold for absolute finality.\n\n` +
          `VERDICT: SECURE // ZERO FRICTION STANDBY.`;
        
        setAgentAuditReport(reportText);
        setIsAgentWorking(false);
        addLog('AGENT_AUDIT', 'COMPLETE', 'SUCCESS', `Audit consignment compiled by ${activeAgent.name}.`);
        speakLore(`Audit report compiled by ${activeAgent.name}. Overall system status nominal.`);
      }
    }, 450);
  };

  const activeAgent = AGENT_COLLECTIVE.find(a => a.id === selectedAgentId) || AGENT_COLLECTIVE[0];

  return (
    <div className="h-full flex flex-col bg-[#05010a] text-zinc-300 font-mono overflow-hidden relative flex-hinge">
      {/* Dynamic Cyberpunk Grid / Pulse Background */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 z-0 opacity-40"
        style={{ 
          background: `radial-gradient(circle at center, rgba(162, 28, 175, 0.1) 0%, transparent 80%), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(162, 28, 175, 0.05) 2px, rgba(162, 28, 175, 0.05) 4px)`,
          opacity: 0.2 + Math.sin(magentaPulse * 0.1) * 0.15
        }}
      />
      
      {/* Ambient Rain Scanline Filter */}
      <div className="absolute inset-0 pointer-events-none z-10 scanlines opacity-30" />

      {/* HEADER SECTION */}
      <header className="p-4 border-b-2 border-fuchsia-900/60 bg-[#080212]/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-lg z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-fuchsia-950/40 border border-fuchsia-500/50 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(217,70,239,0.3)]">
            <Shield className="w-5 h-5 text-fuchsia-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-comic-header text-xl text-white tracking-widest uppercase italic flex items-center gap-2">
              AetherOS Forensic Audit Station
            </h1>
            <p className="text-[9px] text-fuchsia-400 font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Sovereign Layer-2 Scanner // Fort Worth Rain: {fortWorthRainIntensity}%
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="px-3 py-1.5 bg-[#120524] border border-fuchsia-500/20 rounded-md text-[10px] text-fuchsia-300 font-bold flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
            Active Channel: P2P_SECURE
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-zinc-400 font-black font-mono">UTC: {new Date().toISOString().slice(11, 19)}</p>
            <p className="text-[8px] text-zinc-500 uppercase tracking-widest">AetherOS Sub-net Core</p>
          </div>
        </div>
      </header>

      {/* TOP VIEW METRIC RIBBON */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-b border-fuchsia-900/30 bg-[#06010d] px-4 py-2 text-[10px] z-20 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 border-r border-fuchsia-900/20 pr-4">
          <Wallet className="w-3.5 h-3.5 text-cyan-400" />
          <div>
            <p className="text-zinc-500 text-[8px] uppercase">Monitored Wallet</p>
            <p className="text-zinc-300 font-bold truncate max-w-[120px]">{monitoredAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 border-r border-fuchsia-900/20 pr-4">
          <Activity className="w-3.5 h-3.5 text-fuchsia-400" />
          <div>
            <p className="text-zinc-500 text-[8px] uppercase">Security Status</p>
            <p className="text-emerald-400 font-bold">ZERO COGNITIVE FRICTION</p>
          </div>
        </div>
        <div className="flex items-center gap-2 border-r border-fuchsia-900/20 pr-4">
          <Database className="w-3.5 h-3.5 text-pink-400" />
          <div>
            <p className="text-zinc-500 text-[8px] uppercase">Active L2 Anchors</p>
            <p className="text-zinc-300 font-bold">Ark, RGB, sBTC, Liquid</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <div>
            <p className="text-zinc-500 text-[8px] uppercase">System Latency</p>
            <p className="text-zinc-300 font-bold">7.2ms (Zero-Verification Lag)</p>
          </div>
        </div>
      </section>

      {/* VIEW SELECTION NAV TABS */}
      <nav className="flex border-b border-fuchsia-900/30 bg-[#090318] z-20 flex-shrink-0">
        <button
          onClick={() => setActiveTab('SANDBOX')}
          className={`flex-1 sm:flex-initial px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 border-b-2 ${
            activeTab === 'SANDBOX' 
              ? 'bg-[#120524] text-white border-fuchsia-500' 
              : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-white/5'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Protocol Lab
        </button>
        <button
          onClick={() => setActiveTab('CONVERGENCE_MATRIX')}
          className={`flex-1 sm:flex-initial px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 border-b-2 ${
            activeTab === 'CONVERGENCE_MATRIX' 
              ? 'bg-[#120524] text-white border-fuchsia-500' 
              : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-white/5'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          Sovereign Wallet & Math
        </button>
        <button
          onClick={() => setActiveTab('TRANSITION_LOGS')}
          className={`flex-1 sm:flex-initial px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 border-b-2 ${
            activeTab === 'TRANSITION_LOGS' 
              ? 'bg-[#120524] text-white border-fuchsia-500' 
              : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-white/5'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Active Journals
        </button>
      </nav>

      {/* MAIN WORKSPACE SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10 custom-scrollbar">
        
        {/* TAB 1: PROTOCOL LAB */}
        {activeTab === 'SANDBOX' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: CHOOSE PROTOCOL */}
            <div className="lg:col-span-3 space-y-4">
              <div className="p-4 bg-[#0a0314] border border-fuchsia-950 rounded-xl space-y-2">
                <h3 className="text-[10px] font-black uppercase text-fuchsia-400 tracking-wider">Select L2 Protocol Schema</h3>
                <div className="flex flex-col gap-2">
                  {(['ARK', 'RGB', 'LIQUID', 'SBTC'] as ProtocolType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setActiveProtocol(type)}
                      className={`p-3 rounded-lg border text-left font-mono font-bold transition-all ${
                        activeProtocol === type 
                          ? 'bg-fuchsia-950/40 border-fuchsia-500 text-white shadow-[0_0_12px_rgba(217,70,239,0.15)]' 
                          : 'bg-[#04010a]/60 border-zinc-900 text-zinc-500 hover:border-fuchsia-950'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{type === 'ARK' ? 'Ark Protocol' : type === 'RGB' ? 'RGB Protocol' : type === 'LIQUID' ? 'Liquid Network' : 'sBTC / Stacks'}</span>
                        <div className={`w-2 h-2 rounded-full ${activeProtocol === type ? 'bg-fuchsia-400 animate-pulse' : 'bg-zinc-800'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Immutable Agent Collective Command Module */}
              <div className="p-4 bg-[#0a0314] border border-fuchsia-950 rounded-xl space-y-3">
                <div className="flex items-center gap-2 border-b border-fuchsia-950 pb-2">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <h3 className="text-[10px] font-black uppercase text-white tracking-widest">Agent Collective console</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-500 uppercase block">Select Specialized Forensic Agent</label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full bg-[#05010b] border border-fuchsia-950 rounded-md p-2 text-xs font-mono text-zinc-300 outline-none focus:border-fuchsia-500/50"
                  >
                    {AGENT_COLLECTIVE.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name} ({agent.role})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-zinc-500 uppercase">Input Custom Diagnostic Instruction</span>
                    <span className="text-[8px] text-fuchsia-400 uppercase font-black">Agent Loaded</span>
                  </div>
                  <textarea
                    value={agentPromptInput}
                    onChange={(e) => setAgentPromptInput(e.target.value)}
                    placeholder={activeAgent.promptDirective}
                    className="w-full h-24 bg-[#05010b] border border-fuchsia-950 rounded-md p-2 text-[10px] font-mono text-zinc-400 outline-none focus:border-fuchsia-500/50 resize-none custom-scrollbar"
                  />
                </div>

                <button
                  onClick={handleRunAgentAudit}
                  disabled={isAgentWorking || !agentPromptInput.trim()}
                  className="w-full py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-md font-mono text-xs font-black uppercase tracking-widest disabled:bg-zinc-900 disabled:text-zinc-600 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(217,70,239,0.2)]"
                >
                  {isAgentWorking ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Auditing System...
                    </>
                  ) : (
                    <>
                      <Gavel className="w-3.5 h-3.5" />
                      Run Agent Audit
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* MAIN LAB WORKSPACE */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* AGENT DIAGNOSTICS WORKSPACE RESULTS */}
              <AnimatePresence>
                {(agentLogsState.length > 0 || agentAuditReport) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-[#090212] border border-fuchsia-500/30 rounded-xl space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-fuchsia-950 pb-2">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-fuchsia-400" />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">{activeAgent.name} // Forensic Output</h4>
                      </div>
                      <button
                        onClick={() => {
                          setAgentLogsState([]);
                          setAgentAuditReport(null);
                        }}
                        className="text-[9px] text-zinc-500 hover:text-zinc-300 uppercase font-black"
                      >
                        [Dismiss]
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Step logs */}
                      <div className="md:col-span-5 bg-black/60 border border-fuchsia-950/40 p-3 rounded-lg h-44 overflow-y-auto space-y-1.5 custom-scrollbar text-[10px] font-mono text-zinc-400">
                        {agentLogsState.map((log, idx) => (
                          <div key={idx} className="leading-relaxed border-l border-fuchsia-900/40 pl-2">
                            {log}
                          </div>
                        ))}
                        {isAgentWorking && (
                          <div className="flex items-center gap-1.5 text-fuchsia-400 animate-pulse pl-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping" />
                            Executing pipeline sequence...
                          </div>
                        )}
                      </div>

                      {/* Main report */}
                      <div className="md:col-span-7 bg-black/80 border border-fuchsia-950/40 p-3 rounded-lg h-44 overflow-y-auto custom-scrollbar text-[10px] font-mono text-emerald-400 leading-relaxed">
                        {agentAuditReport ? (
                          <pre className="whitespace-pre-wrap font-mono">{agentAuditReport}</pre>
                        ) : (
                          <div className="h-full flex items-center justify-center text-zinc-650 italic text-[11px]">
                            Waiting for diagnostic reporting stream...
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DYNAMIC PROTOCOL INTERACTIVE SIMULATION CARDS */}
              {activeProtocol === 'ARK' && (
                <div className="p-6 bg-[#0a0314] border border-fuchsia-950 rounded-xl space-y-6">
                  <div className="flex justify-between items-center border-b border-fuchsia-950 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-fuchsia-400" /> Ark VTXO Tree Simulator
                      </h3>
                      <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Simulate forfeits, batching connectors, and unilateral exits under real-time constraints</p>
                    </div>
                    <button
                      onClick={handleTriggerRound}
                      disabled={isRoundActive}
                      className="px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono text-xs font-black uppercase rounded-lg disabled:bg-zinc-900 disabled:text-zinc-600 transition-all flex items-center gap-1.5"
                    >
                      {isRoundActive ? 'Processing Batch...' : 'Trigger Round (Batch)'}
                    </button>
                  </div>

                  {/* VTXO Quad-Tree Visual Grid */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">// ACTIVE VTXO LEAVES</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {vtxos.map(v => (
                        <div 
                          key={v.id}
                          className={`p-4 bg-black/60 border rounded-xl space-y-3 transition-all relative overflow-hidden group ${
                            v.status === 'FORFEITED' ? 'border-amber-500/20 opacity-40' :
                            v.status === 'UNILATERAL_EXITING' ? 'border-rose-500/40 animate-pulse' :
                            'border-zinc-900 hover:border-fuchsia-500/30'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] font-bold text-zinc-500 font-mono block">ID: {v.id}</span>
                              <span className="text-xs font-black text-white truncate max-w-[100px] block mt-0.5">{v.owner}</span>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                              v.status === 'ACTIVE' ? 'bg-fuchsia-950/20 text-fuchsia-300 border-fuchsia-500/20' :
                              v.status === 'FORFEITED' ? 'bg-amber-950/20 text-amber-300 border-amber-500/20' :
                              'bg-rose-950/20 text-rose-300 border-rose-500/20'
                            }`}>
                              {v.status}
                            </span>
                          </div>

                          <div className="space-y-1 text-[10px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Value:</span>
                              <span className="text-white font-bold">{v.value} BTC</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Tree Depth:</span>
                              <span className="text-zinc-300">{v.depth} layers</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Timelock:</span>
                              <span className="text-zinc-300">{v.timelock} blocks</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-zinc-950">
                            <button
                              onClick={() => handleForfeitVtxo(v.id)}
                              disabled={v.status !== 'ACTIVE' || isRoundActive}
                              className="flex-1 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase rounded border border-amber-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                              Forfeit
                            </button>
                            <button
                              onClick={() => handleUnilateralExit(v.id)}
                              disabled={v.status !== 'ACTIVE'}
                              className="flex-1 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[9px] font-black uppercase rounded border border-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                              Exit Path
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Forfeits and Connectors State Map */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Forfeit Queue */}
                    <div className="p-4 bg-black/40 border border-zinc-950 rounded-xl space-y-3">
                      <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 animate-pulse" /> Pending Forfeits queue
                      </h4>
                      
                      <div className="space-y-2 h-44 overflow-y-auto pr-1 custom-scrollbar">
                        {forfeits.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-zinc-650 italic text-[11px]">
                            No pending forfeits in current round queue.
                          </div>
                        ) : (
                          forfeits.map(f => (
                            <div key={f.id} className="p-2.5 bg-[#05020c] border border-amber-500/10 rounded-lg flex justify-between items-center text-[10px] font-mono">
                              <div>
                                <p className="text-zinc-300 font-bold">Forfeit ID: {f.id}</p>
                                <p className="text-[8px] text-zinc-500 uppercase mt-0.5">Spends: {f.vtxoId} // Owner: {f.signedBy}</p>
                              </div>
                              <span className="text-amber-400 font-bold">{f.amount} BTC</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Connector Dust Outputs */}
                    <div className="p-4 bg-black/40 border border-zinc-950 rounded-xl space-y-3">
                      <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5" /> Atomic Connector Outputs (Dust)
                      </h4>
                      
                      <div className="space-y-2 h-44 overflow-y-auto pr-1 custom-scrollbar">
                        {connectors.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-zinc-650 italic text-[11px]">
                            No active connectors deployed to root Taproot UTXO.
                          </div>
                        ) : (
                          connectors.map(c => (
                            <div key={c.id} className="p-2.5 bg-[#05020c] border border-cyan-500/10 rounded-lg flex justify-between items-center text-[10px] font-mono">
                              <div>
                                <p className="text-zinc-300 font-bold">Connector: {c.id}</p>
                                <p className="text-[8px] text-zinc-500 uppercase mt-0.5">Linked Forfeit: {c.forfeitId}</p>
                              </div>
                              <span className="text-cyan-400 font-bold">330 sats</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeProtocol === 'RGB' && (
                <div className="p-6 bg-[#0a0314] border border-fuchsia-950 rounded-xl space-y-6">
                  <div className="flex justify-between items-center border-b border-fuchsia-950 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-5 h-5 text-fuchsia-400" /> RGB Single-Use Seals & Tapret Commitments
                      </h3>
                      <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Spend UTXOs off-chain, verifying client-side transition proofs and Taproot keys</p>
                    </div>
                    <button
                      onClick={handleCreateRgbAsset}
                      className="px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono text-xs font-black uppercase rounded-lg transition-all flex items-center gap-1.5"
                    >
                      Create Asset (Genesis)
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">// DEPLOYED SINGLE-USE SEALS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {seals.map(s => (
                        <div 
                          key={s.id}
                          className={`p-4 bg-black/60 border rounded-xl space-y-3 transition-all relative overflow-hidden group ${
                            s.status === 'SPENT' ? 'border-zinc-950 opacity-40' : 'border-zinc-900 hover:border-fuchsia-500/30'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] font-bold text-zinc-500 font-mono block">SEAL ID: {s.id}</span>
                              <span className="text-xs font-black text-white mt-0.5 block">{s.assetName}</span>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                              s.status === 'ACTIVE' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20 animate-pulse' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                            }`}>
                              {s.status}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[10px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Asset Amount:</span>
                              <span className="text-white font-bold">{s.amount.toLocaleString()} units</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Anchor UTXO:</span>
                              <span className="text-zinc-300 truncate max-w-[150px]" title={s.anchorUtxo}>{s.anchorUtxo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">State Hash:</span>
                              <span className="text-zinc-300 truncate max-w-[150px] font-bold text-fuchsia-400" title={s.stateHash}>{s.stateHash}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Recipient key:</span>
                              <span className="text-zinc-300 truncate max-w-[150px]" title={s.recipientPubkey}>{s.recipientPubkey}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-zinc-950 flex justify-end">
                            <button
                              onClick={() => handleTransferSeal(s.id)}
                              disabled={s.status !== 'ACTIVE'}
                              className="px-3 py-1 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 text-[10px] font-black uppercase rounded border border-fuchsia-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1"
                            >
                              <Share2 className="w-3 h-3" />
                              Transfer Asset (Break & Re-seal)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeProtocol === 'LIQUID' && (
                <div className="p-6 bg-[#0a0314] border border-fuchsia-950 rounded-xl space-y-6">
                  <div className="flex justify-between items-center border-b border-fuchsia-950 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-5 h-5 text-fuchsia-400" /> Liquid Network DynaFed Governance
                      </h3>
                      <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Simulate hardware-secured multisig key rotation and dynamic functionary updates</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-black/40 border border-zinc-950 rounded-xl space-y-3">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">// FEDERATION MULTISIG STATE</h4>
                      <div className="space-y-2.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Active Quorum:</span>
                          <span className="text-emerald-400 font-bold">11-of-15 Multisig</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Timelock Expiry Status:</span>
                          <span className="text-emerald-400 font-bold">REFRESHED (No vulnerability window)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Emergency Cold-Keys:</span>
                          <span className="text-zinc-300">Blockstream Secure Vault</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-zinc-950 flex gap-2">
                        <button
                          onClick={() => {
                            addLog('DYN_FED', 'KEY_ROTATION', 'SUCCESS', 'Rotated 3 functionary keys in HSM modules. Published updated Peg-out Authorization (PAK) list.');
                            speakLore("DynaFed functionary key rotation completed successfully. Secure escrow updated.");
                          }}
                          className="flex-1 py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 text-[10px] font-black uppercase rounded border border-fuchsia-500/10 transition-all"
                        >
                          DynaFed Key Rotation
                        </button>
                        <button
                          onClick={() => {
                            addLog('DYN_FED', 'TIMELOCK_REFRESH', 'SUCCESS', 'Executed automatic hashrate timelock refresh. Buffer extended by 4032 blocks.');
                            speakLore("Timelocks refreshed. Emergency backup recovery window closed.");
                          }}
                          className="flex-1 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase rounded border border-cyan-500/10 transition-all"
                        >
                          Refresh Timelock
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-[#05020c] border border-fuchsia-950/40 rounded-xl flex items-center justify-center text-center">
                      <div className="space-y-2 max-w-xs">
                        <Eye className="w-8 h-8 text-fuchsia-500 mx-auto animate-pulse" />
                        <h4 className="text-xs font-black text-white uppercase">// CONFIDENTIALITY STATUS</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                          All amounts and asset metadata are fully encrypted using Confidential Transactions. The on-chain ledger reveals only cryptographic range proofs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeProtocol === 'SBTC' && (
                <div className="p-6 bg-[#0a0314] border border-fuchsia-950 rounded-xl space-y-6">
                  <div className="flex justify-between items-center border-b border-fuchsia-950 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-fuchsia-400" /> sBTC / Stacks Nakamoto Peg Mechanics
                      </h3>
                      <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Interactive Peg-In and Peg-Out threshold operations with Proof of Transfer (PoX) rewards</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Peg Stats */}
                    <div className="p-4 bg-black/40 border border-zinc-950 rounded-xl space-y-3">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">// PEG INFRASTRUCTURE</h4>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Signer Quorum:</span>
                          <span className="text-emerald-400 font-bold">{sbtcStatus.signerQuorum}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Active Signers:</span>
                          <span className="text-zinc-300 font-bold">{sbtcStatus.activeSigners} / 15</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Stacked STX:</span>
                          <span className="text-zinc-300">{sbtcStatus.stackedCollateral}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Nakamoto Block:</span>
                          <span className="text-fuchsia-400 font-bold">#{sbtcStatus.nakamotoBlockHeight}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-950 flex gap-2">
                        <button
                          onClick={() => {
                            const newHistory = { type: 'PEG_IN' as const, amount: 0.5, txid: '0x' + Math.random().toString(16).slice(2, 64), status: 'PENDING' };
                            setPegHistory(prev => [newHistory, ...prev]);
                            addLog('SBTC_PEG', 'PEG_IN_REQ', 'SUCCESS', 'Triggered peg-in sequence. Lock transaction broadcast to Bitcoin testnet.');
                            speakLore("Peg in request initiated. Stacks signers monitoring block confirmation.");
                            
                            // Simulate confirmation
                            setTimeout(() => {
                              setPegHistory(prev => prev.map(h => h.txid === newHistory.txid ? { ...h, status: 'CONFIRMED' } : h));
                              addLog('SBTC_PEG', 'PEG_IN_CONF', 'SUCCESS', `Peg-in confirmed. Minted 0.5 sBTC.`);
                              speakLore("sBTC peg in confirmed. Tokens minted.");
                            }, 1500);
                          }}
                          className="flex-1 py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 text-[10px] font-black uppercase rounded border border-fuchsia-500/10 transition-all"
                        >
                          Request Peg-In
                        </button>
                        <button
                          onClick={() => {
                            const newHistory = { type: 'PEG_OUT' as const, amount: 0.25, txid: '0x' + Math.random().toString(16).slice(2, 64), status: 'PENDING' };
                            setPegHistory(prev => [newHistory, ...prev]);
                            addLog('SBTC_PEG', 'PEG_OUT_REQ', 'WARNING', 'Peg-out withdrawal request initiated. Awaiting Stacker threshold signature.');
                            speakLore("Peg out request received. Collecting signature shares.");

                            // Simulate threshold signing
                            setTimeout(() => {
                              setPegHistory(prev => prev.map(h => h.txid === newHistory.txid ? { ...h, status: 'RELEASED' } : h));
                              addLog('SBTC_PEG', 'PEG_OUT_REL', 'SUCCESS', `Peg-out threshold signature collected. Released 0.25 BTC.`);
                              speakLore("sBTC burn complete. Bitcoin released to recipient wallet.");
                            }, 1800);
                          }}
                          className="flex-1 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase rounded border border-cyan-500/10 transition-all"
                        >
                          Request Peg-Out
                        </button>
                      </div>
                    </div>

                    {/* Peg History Log */}
                    <div className="p-4 bg-black/40 border border-zinc-950 rounded-xl space-y-3">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">// PEG TRANSACTION HISTORY</h4>
                      <div className="space-y-2 h-36 overflow-y-auto pr-1 custom-scrollbar text-[10px] font-mono">
                        {pegHistory.map((h, i) => (
                          <div key={i} className="p-2 bg-[#05020c] border border-zinc-900 rounded-md flex justify-between items-center">
                            <div>
                              <p className="font-bold">{h.type === 'PEG_IN' ? 'Peg-In (Deposit)' : 'Peg-Out (Withdrawal)'}</p>
                              <p className="text-[8px] text-zinc-500 truncate max-w-[120px]">{h.txid}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">{h.amount} BTC</p>
                              <span className={`text-[7px] font-black uppercase ${h.status === 'CONFIRMED' || h.status === 'RELEASED' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                                {h.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SOVEREIGN WALLET & MATH */}
        {activeTab === 'CONVERGENCE_MATRIX' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* UTXO FORENSIC TRACKER FOR bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h */}
            <div className="p-6 bg-[#0a0314] border border-fuchsia-950 rounded-xl space-y-6">
              <div className="border-b border-fuchsia-950 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-fuchsia-400" /> UTXO Forensic Tracker (bc1q84muhrq6...)
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Real-time surveillance of monitored wallet addresses against reorg & double-spends</p>
                </div>
                <button
                  onClick={() => {
                    const newTx = {
                      txid: '0x' + Math.random().toString(16).slice(2, 14),
                      direction: 'DEPOSIT' as const,
                      amountBtc: parseFloat((Math.random() * 2).toFixed(3)),
                      type: 'P2TR (Taproot)' as const,
                      confs: 0,
                      status: 'UNCONFIRMED' as const,
                      timestamp: 'Just now'
                    };
                    setTrackedTransactions(prev => [newTx, ...prev]);
                    addLog('UTXO_WATCH', 'TX_DETECTED', 'WARNING', `Incoming unconfirmed deposit detected: ${newTx.amountBtc} BTC. Verifying confirmations.`);
                    speakLore("Unconfirmed transaction detected on monitored address. Verifying scripts.");
                  }}
                  className="px-3 py-1 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 text-[10px] font-black uppercase rounded border border-fuchsia-500/10 transition-all flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Simulate Tx
                </button>
              </div>

              {/* Transactions List */}
              <div className="space-y-3">
                {trackedTransactions.map(tx => (
                  <div 
                    key={tx.txid}
                    className={`p-4 bg-black/60 border rounded-xl flex justify-between items-center font-mono text-[10px] relative overflow-hidden transition-all ${
                      tx.status === 'DOUBLE_SPEND_RISK' ? 'border-rose-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-zinc-900 hover:border-fuchsia-500/20'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase ${
                          tx.direction === 'DEPOSIT' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/10' : 'bg-rose-950/20 text-rose-300 border-rose-500/10'
                        }`}>
                          {tx.direction}
                        </span>
                        <span className="text-zinc-300 font-bold">TXID: {tx.txid}</span>
                      </div>
                      <p className="text-[8px] text-zinc-500 uppercase">TYPE: {tx.type} // TIME: {tx.timestamp}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-xs font-black text-white">{tx.direction === 'DEPOSIT' ? '+' : '-'}{tx.amountBtc} BTC</p>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-[8px] text-zinc-500 uppercase">{tx.confs} confs</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          tx.status === 'CONFIRMED' ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]' :
                          tx.status === 'DOUBLE_SPEND_RISK' ? 'bg-rose-500 shadow-[0_0_4px_#ef4444] animate-ping' :
                          'bg-amber-500 animate-pulse'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stopping the leak diagnostics panel */}
              <div className="p-4 bg-fuchsia-950/15 border border-fuchsia-500/15 rounded-xl space-y-3">
                <h4 className="text-xs font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-fuchsia-400 animate-pulse" /> Stopping the Leak Diagnostics
                </h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                  If you detect a <strong className="text-rose-400 uppercase">Double-Spend</strong> or re-org risk in your transaction pool:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px] font-mono">
                  <div className="p-2.5 bg-black/60 border border-fuchsia-950/30 rounded-lg">
                    <p className="text-white font-bold">// 1. CONFIRMATION QUORUMS</p>
                    <p className="text-zinc-500 mt-1">Enforce a strict 144 block (24h) confirmation safety lock for all high-value peg transfers.</p>
                  </div>
                  <div className="p-2.5 bg-black/60 border border-fuchsia-950/30 rounded-lg">
                    <p className="text-white font-bold">// 2. ADDRESS DIVERSIFICATION</p>
                    <p className="text-zinc-500 mt-1">Generate a brand new Taproot script address per incoming deposit to eliminate UTXO confusion.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CRYPTOGRAPHIC MATH SANDBOX */}
            <div className="p-6 bg-[#0a0314] border border-fuchsia-950 rounded-xl space-y-6">
              <div className="border-b border-fuchsia-950 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-fuchsia-400" /> Cryptographic Math Sandbox
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Step-by-step arithmetic verification of Taproot tweaks & MuSig2 multisig aggregation</p>
              </div>

              {/* Taproot Tweak Sandbox */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" /> Taproot Tweak Math ($Q = P + H(P || M) \cdot G$)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] text-zinc-500 uppercase font-bold block">Internal Public Key (P)</label>
                    <input
                      type="text"
                      value={internalKeyInput}
                      onChange={(e) => setInternalKeyInput(e.target.value)}
                      className="w-full bg-[#05010b] border border-fuchsia-950 rounded-md p-2 text-[10px] font-mono text-zinc-300 outline-none focus:border-fuchsia-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] text-zinc-500 uppercase font-bold block">Merkle Root Message (M)</label>
                    <input
                      type="text"
                      value={merkleRootInput}
                      onChange={(e) => setMerkleRootInput(e.target.value)}
                      className="w-full bg-[#05010b] border border-fuchsia-950 rounded-md p-2 text-[10px] font-mono text-zinc-300 outline-none focus:border-fuchsia-500/50"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculateTweak}
                  disabled={isTweaking}
                  className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono text-xs font-black uppercase rounded-lg disabled:bg-zinc-900 disabled:text-zinc-600 transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(217,70,239,0.15)]"
                >
                  {isTweaking ? 'Computing Tweak Math...' : 'Calculate Tweak'}
                </button>

                {tweakResult && (
                  <div className="p-3 bg-black/60 border border-fuchsia-500/20 rounded-lg space-y-2 text-[9px] font-mono">
                    <div className="flex justify-between border-b border-fuchsia-950 pb-1.5">
                      <span className="text-zinc-500 uppercase">Tweak Scalar (x):</span>
                      <span className="text-fuchsia-400 font-bold truncate max-w-[200px]" title={tweakResult.tweakScalar}>{tweakResult.tweakScalar}</span>
                    </div>
                    <div className="flex justify-between border-b border-fuchsia-950 pb-1.5">
                      <span className="text-zinc-500 uppercase">Tweaked Output Key (Q):</span>
                      <span className="text-cyan-400 font-bold truncate max-w-[200px]" title={tweakResult.tweakedKeyHex}>{tweakResult.tweakedKeyHex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase">Verification Status:</span>
                      <span className="text-emerald-400 font-bold">{tweakResult.verification}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* MuSig2 Signature Aggregation Sandbox */}
              <div className="space-y-4 pt-4 border-t border-fuchsia-950/40">
                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> MuSig2 Signature Aggregation
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] text-zinc-500 uppercase">
                    <span>Active Co-Signers</span>
                    <span>Required Keys</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {musigSigners.map(s => (
                      <div key={s.id} className="p-2.5 bg-[#05010b] border border-zinc-900 rounded-lg text-[9px] font-mono relative">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-zinc-400 font-bold">Signer #{s.id}</span>
                          <span className="text-emerald-400 font-bold">READY</span>
                        </div>
                        <p className="text-zinc-500 text-[8px] truncate">Key: {s.pubkey}</p>
                        <p className="text-zinc-500 text-[8px] truncate">Sig: {s.partialSig}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleMusigAggregation}
                    disabled={isAggregating}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-black uppercase rounded-lg disabled:bg-zinc-900 disabled:text-zinc-600 transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                  >
                    {isAggregating ? 'Combining Signature Shares...' : 'Aggregate Signatures'}
                  </button>
                </div>

                {musigAggregateSig && (
                  <div className="p-3 bg-black/60 border border-cyan-500/20 rounded-lg space-y-2 text-[9px] font-mono">
                    <div className="flex justify-between border-b border-fuchsia-950 pb-1.5">
                      <span className="text-zinc-500 uppercase">Aggregate Public Key:</span>
                      <span className="text-zinc-300 font-bold truncate max-w-[200px]" title={musigAggregateKey}>{musigAggregateKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase">Final Schnorr Sig (R, s):</span>
                      <span className="text-cyan-400 font-bold truncate max-w-[200px]" title={musigAggregateSig}>{musigAggregateSig}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE JOURNALS */}
        {activeTab === 'TRANSITION_LOGS' && (
          <div className="p-6 bg-[#0a0314] border border-fuchsia-950 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-fuchsia-950 pb-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-fuchsia-400 animate-pulse" /> Active State Transition Journal
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Chronological record of system-level cryptographic transitions and diagnostic updates</p>
              </div>
              <button
                onClick={() => setTransitionLogs([])}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-mono text-[10px] font-black uppercase rounded border border-zinc-800 transition-all"
              >
                Clear History
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {transitionLogs.length === 0 ? (
                <div className="p-8 text-center text-zinc-600 italic text-xs">
                  No system transitions logged in the current session.
                </div>
              ) : (
                transitionLogs.map(log => {
                  const statusColor = 
                    log.status === 'SUCCESS' ? 'text-emerald-400 border-emerald-500/10 bg-emerald-950/15' :
                    log.status === 'WARNING' ? 'text-amber-400 border-amber-500/10 bg-amber-950/15' :
                    'text-rose-400 border-rose-500/10 bg-rose-950/15';

                  return (
                    <div 
                      key={log.id} 
                      className="p-3 bg-black/40 border border-zinc-950 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-zinc-600 font-bold">[{log.timestamp}]</span>
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${statusColor}`}>
                          {log.status}
                        </span>
                        <span className="text-zinc-300">
                          <strong className="text-fuchsia-400">{log.from || 'EVENT'}</strong> &rarr; <strong className="text-cyan-400">{log.to}</strong>
                        </span>
                      </div>
                      <span className="text-zinc-500 text-right leading-normal italic truncate max-w-[400px]" title={log.message}>
                        {log.message}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* MATRIX STATIC FOOTER */}
      <footer className="p-3 bg-[#080212] border-t border-fuchsia-900/30 flex flex-col sm:flex-row justify-between items-center px-6 z-40 flex-shrink-0 gap-2 text-[10px] text-zinc-500 font-mono">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-ping" />
            <span className="font-black text-fuchsia-400 tracking-wider">AETHEROS NETWORK COVENANT</span>
          </div>
          <span className="hidden md:block text-zinc-600">Maneuver: RIGHT_ON_LIGHT | Backoff: EXPONENTIAL</span>
        </div>
        <div className="uppercase font-black italic tracking-[0.3em] text-zinc-650">
          Sovereign Stack // TEE_SAY_I_A_OH
        </div>
      </footer>
    </div>
  );
};
