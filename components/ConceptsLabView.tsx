import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  Play, 
  RotateCcw, 
  Shield, 
  Table, 
  FileText, 
  Layers, 
  Settings, 
  AlertCircle, 
  Database, 
  Network, 
  ArrowRight, 
  ChevronRight, 
  Info, 
  List, 
  Terminal, 
  CheckCircle, 
  Server, 
  RefreshCw, 
  XCircle, 
  HelpCircle, 
  Send 
} from 'lucide-react';
import type { LabComponentProps } from '../types';

interface LogEntry {
  index: number;
  term: number;
  command: string;
  committed: boolean;
}

interface NodeState {
  id: number;
  status: 'active' | 'crashed';
  role: 'leader' | 'candidate' | 'follower' | 'primary' | 'backup' | 'proposer' | 'acceptor' | 'learner';
  term: number;
  log: LogEntry[];
  commitIndex: number;
  snapshotIndex: number;
}

interface InFlightMessage {
  id: string;
  from: number;
  to: number;
  type: 'AppendEntries' | 'RequestVote' | 'Heartbeat' | 'Prepare' | 'Accept' | 'InstallSnapshot' | 'Broadcast' | 'Sync';
  index?: number;
  progress: number; // 0 to 100
}

export const ConceptsLabView: React.FC<LabComponentProps> = ({ 
  labName = "DISTRIBUTED CONSENSUS LAB", 
  labColor = "text-cyan-400", 
  description = "Interactive exploration of Raft, Zab, and Paxos consensus models, log compaction, and pipeline replication." 
}) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'matrix' | 'proofs' | 'compaction'>('simulation');
  const [protocol, setProtocol] = useState<'raft' | 'zab' | 'paxos'>('raft');
  const [isPipelined, setIsPipelined] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.5); // 1 = normal, 2 = fast, 0.5 = slow
  const [autoHeartbeat, setAutoHeartbeat] = useState<boolean>(true);
  
  // Simulation Core State
  const [nodes, setNodes] = useState<NodeState[]>([]);
  const [inFlightMsgs, setInFlightMsgs] = useState<InFlightMessage[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(1);
  const [clientCommand, setClientCommand] = useState<string>("SET data_shard_val = 144");

  // Compaction Demo States
  const [compactionLogs, setCompactionLogs] = useState<LogEntry[]>([
    { index: 1, term: 1, command: "INIT_GENESIS", committed: true },
    { index: 2, term: 1, command: "SET threshold = 50", committed: true },
    { index: 3, term: 1, command: "SET interval = 1200", committed: true },
    { index: 4, term: 2, command: "UPDATE keyspace_1", committed: true },
    { index: 5, term: 2, command: "DELETE temp_node", committed: true },
    { index: 6, term: 2, command: "SET status = ACTIVE", committed: true },
    { index: 7, term: 3, command: "WRITE payload_chunk", committed: true },
    { index: 8, term: 3, command: "UPDATE keyspace_2", committed: true },
    { index: 9, term: 3, command: "DELETE old_indices", committed: true },
    { index: 10, term: 3, command: "SET mass_value = 88", committed: false },
  ]);
  const [snapshotState, setSnapshotState] = useState<{ lastIncludedIndex: number; lastIncludedTerm: number; stateDump: string } | null>(null);
  const [follower5Log, setFollower5Log] = useState<LogEntry[]>([
    { index: 1, term: 1, command: "INIT_GENESIS", committed: true },
    { index: 2, term: 1, command: "SET threshold = 50", committed: true },
    { index: 3, term: 1, command: "SET interval = 1200", committed: true },
  ]);

  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Play satisfying UI audio notes
  const playBeep = (freq: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignored if audio blocked
    }
  };

  const writeLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [`[${timeStr}] ${msg}`, ...prev.slice(0, 99)]);
  };

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Initial Cluster Setup based on protocol selection
  const initializeCluster = (selectedProtocol = protocol) => {
    let initialNodes: NodeState[] = [];
    if (selectedProtocol === 'raft') {
      initialNodes = [
        { id: 1, status: 'active', role: 'leader', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 2, status: 'active', role: 'follower', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 3, status: 'active', role: 'follower', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 4, status: 'active', role: 'follower', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 5, status: 'active', role: 'follower', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
      ];
      writeLog("INITIALIZATION: Formed 5-Node RAFT Consensus Cluster. Node 1 has acquired stable leader authority.");
    } else if (selectedProtocol === 'zab') {
      initialNodes = [
        { id: 1, status: 'active', role: 'primary', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 2, status: 'active', role: 'backup', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 3, status: 'active', role: 'backup', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 4, status: 'active', role: 'backup', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 5, status: 'active', role: 'backup', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
      ];
      writeLog("INITIALIZATION: Synchronized 5-Node ZAB Atomic Broadcast Cluster. Node 1 is the primary epoch master.");
    } else {
      initialNodes = [
        { id: 1, status: 'active', role: 'proposer', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 2, status: 'active', role: 'acceptor', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 3, status: 'active', role: 'acceptor', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 4, status: 'active', role: 'acceptor', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
        { id: 5, status: 'active', role: 'learner', term: 1, log: [{ index: 1, term: 1, command: "INIT_GENESIS", committed: true }], commitIndex: 1, snapshotIndex: 0 },
      ];
      writeLog("INITIALIZATION: Formed 5-Node Multi-Paxos Cluster. Roles assigned: Proposer (Node 1), Acceptors (Nodes 2-4), Learner (Node 5).");
    }
    setNodes(initialNodes);
    setInFlightMsgs([]);
  };

  useEffect(() => {
    initializeCluster();
  }, [protocol]);

  // Main Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Automatic periodic heartbeats
      if (autoHeartbeat) {
        const leader = nodes.find(n => (n.role === 'leader' || n.role === 'primary') && n.status === 'active');
        if (leader) {
          const type = protocol === 'raft' ? 'Heartbeat' : 'Broadcast';
          // Dispatch small pulse signals
          nodes.forEach(f => {
            if (f.id !== leader.id && f.status === 'active') {
              sendNetworkMessage(leader.id, f.id, type);
            }
          });
        }
      }

      // 2. Advance all network messages in flight
      setInFlightMsgs(prev => {
        const nextMsgs: InFlightMessage[] = [];
        prev.forEach(msg => {
          const nextProgress = msg.progress + (12 * simulationSpeed);
          if (nextProgress >= 100) {
            // Deliver message trigger
            deliverMessage(msg);
          } else {
            nextMsgs.push({ ...msg, progress: nextProgress });
          }
        });
        return nextMsgs;
      });

    }, 180);

    return () => clearInterval(interval);
  }, [nodes, autoHeartbeat, simulationSpeed, protocol]);

  // Network helpers
  const sendNetworkMessage = (from: number, to: number, type: InFlightMessage['type'], index?: number) => {
    const id = `${Date.now()}-${from}-${to}-${Math.random().toString(36).substr(2, 4)}`;
    setInFlightMsgs(prev => [...prev, { id, from, to, type, index, progress: 0 }]);
  };

  const deliverMessage = (msg: InFlightMessage) => {
    setNodes(prevNodes => {
      const updated = prevNodes.map(node => {
        if (node.id === msg.to) {
          if (node.status === 'crashed') return node;

          // Message type handlings
          if (msg.type === 'Heartbeat' || msg.type === 'Broadcast') {
            // Heartbeat updates follower's baseline term if leader has higher term
            return { ...node, term: Math.max(node.term, prevNodes.find(n => n.id === msg.from)?.term || 0) };
          }

          if (msg.type === 'RequestVote') {
            // Simple validation vote
            const voterTerm = node.term;
            const candidateTerm = prevNodes.find(n => n.id === msg.from)?.term || 0;
            if (candidateTerm > voterTerm) {
              sendNetworkMessage(node.id, msg.from, 'AppendEntries'); // positive acknowledgment payload
              return { ...node, term: candidateTerm };
            }
          }

          if (msg.type === 'AppendEntries' && msg.index !== undefined) {
            // Followers accept AppendEntries and replicate log
            const leaderNode = prevNodes.find(n => n.id === msg.from);
            if (leaderNode) {
              const commandEntry = leaderNode.log.find(e => e.index === msg.index);
              if (commandEntry) {
                const alreadyExists = node.log.some(e => e.index === msg.index);
                const updatedLog = alreadyExists 
                  ? node.log.map(e => e.index === msg.index ? { ...e, committed: true } : e)
                  : [...node.log, { ...commandEntry }];
                
                // Instantly notify leader of replication success (sending positive ack message back)
                sendNetworkMessage(node.id, msg.from, 'Accept', msg.index);

                return { 
                  ...node, 
                  log: updatedLog,
                  term: Math.max(node.term, leaderNode.term)
                };
              }
            }
          }

          if (msg.type === 'Accept' && msg.index !== undefined) {
            // Leader processes replication acknowledgment
            if (node.role === 'leader' || node.role === 'primary' || node.role === 'proposer') {
              // Count acknowledgements across current alive cluster
              const index = msg.index;
              const matchingNodesCount = prevNodes.filter(n => n.status === 'active' && (n.id === node.id || n.log.some(e => e.index === index))).length;
              
              // Majority Check (3 out of 5)
              if (matchingNodesCount >= 3) {
                // Mark entry as committed on leader
                const updatedLog = node.log.map(e => e.index === index ? { ...e, committed: true } : e);
                const isAlreadyCommitted = node.log.find(e => e.index === index)?.committed;
                
                if (!isAlreadyCommitted) {
                  playBeep(1400, 'sine', 0.15);
                  writeLog(`✅ CONSENSUS MET: Log entry #${index} is committed by quorum majority (${matchingNodesCount}/5).`);
                }

                return {
                  ...node,
                  log: updatedLog,
                  commitIndex: Math.max(node.commitIndex, index)
                };
              }
            }
          }

          if (msg.type === 'Prepare') {
            // Paxos Phase 1: Acceptors respond with promise
            sendNetworkMessage(node.id, msg.from, 'Accept', msg.index);
          }
        }
        return node;
      });

      // Synchronize commit indices from Leader to Followers
      const leader = updated.find(n => (n.role === 'leader' || n.role === 'primary') && n.status === 'active');
      if (leader) {
        return updated.map(node => {
          if (node.id !== leader.id && node.status === 'active') {
            const hasLeaderCommittedIndex = node.log.some(e => e.index === leader.commitIndex);
            if (hasLeaderCommittedIndex) {
              return {
                ...node,
                commitIndex: leader.commitIndex,
                log: node.log.map(e => e.index <= leader.commitIndex ? { ...e, committed: true } : e)
              };
            }
          }
          return node;
        });
      }

      return updated;
    });
  };

  // Actions
  const triggerElection = () => {
    playBeep(880, 'sine', 0.08);
    // Crash node 1 if it's currently active to watch a secondary node win
    const activeLeader = nodes.find(n => (n.role === 'leader' || n.role === 'primary') && n.status === 'active');
    
    setNodes(prev => {
      let leaderId = activeLeader?.id;
      // Elect a new one amongst survivors
      const survivors = prev.filter(n => n.status === 'active');
      if (survivors.length === 0) {
        writeLog("FAILURE: All nodes are crashed. Cannot establish consensus.");
        return prev;
      }
      
      const candidate = survivors[Math.floor(Math.random() * survivors.length)];
      writeLog(`ELECTION START: Node ${candidate.id} noticed leader absence. Incrementing logical clock Term/Epoch to ${candidate.term + 1}.`);
      
      // Dispatch vote requests
      survivors.forEach(s => {
        if (s.id !== candidate.id) {
          sendNetworkMessage(candidate.id, s.id, 'RequestVote');
        }
      });

      return prev.map(n => {
        if (n.id === candidate.id) {
          return { ...n, role: protocol === 'raft' ? 'leader' : protocol === 'zab' ? 'primary' : 'proposer', term: n.term + 1 };
        }
        if (activeLeader && n.id === activeLeader.id) {
          return { ...n, role: protocol === 'raft' ? 'follower' : protocol === 'zab' ? 'backup' : 'acceptor' };
        }
        return n;
      });
    });
  };

  const submitCommand = () => {
    if (!clientCommand.trim()) return;
    playBeep(1100, 'sine', 0.05);

    setNodes(prev => {
      const leader = prev.find(n => (n.role === 'leader' || n.role === 'primary' || n.role === 'proposer') && n.status === 'active');
      if (!leader) {
        writeLog("ERROR: Client request dropped. No active consensus leader available.");
        return prev;
      }

      const nextIndex = leader.log.length + 1;
      const newEntry: LogEntry = {
        index: nextIndex,
        term: leader.term,
        command: clientCommand,
        committed: false
      };

      writeLog(`CLIENT REQUEST: Appending entry #${nextIndex} [${clientCommand}] to Leader Node ${leader.id}.`);

      // Dispatch replication RPCs
      prev.forEach(f => {
        if (f.id !== leader.id && f.status === 'active') {
          sendNetworkMessage(leader.id, f.id, protocol === 'paxos' ? 'Prepare' : 'AppendEntries', nextIndex);
        }
      });

      return prev.map(n => {
        if (n.id === leader.id) {
          return { ...n, log: [...n.log, newEntry] };
        }
        return n;
      });
    });

    if (!isPipelined) {
      setClientCommand("");
    }
  };

  const toggleNodeStatus = (id: number) => {
    playBeep(600, 'sawtooth', 0.05);
    setNodes(prev => {
      return prev.map(n => {
        if (n.id === id) {
          const nextStatus = n.status === 'active' ? 'crashed' : 'active';
          writeLog(`STATE UPDATE: Node ${id} state vector set to [${nextStatus.toUpperCase()}].`);
          return { ...n, status: nextStatus };
        }
        return n;
      });
    });
  };

  const getNodeCoords = (index: number) => {
    // 5 points on a circle inside a 360x360 arena
    const angles = [-90, -18, 54, 126, 198];
    const angleRad = (angles[index - 1] * Math.PI) / 180;
    const radius = 120;
    const x = 180 + Math.cos(angleRad) * radius;
    const y = 180 + Math.sin(angleRad) * radius;
    return { x, y };
  };

  // Compaction Demo triggers
  const executeCompaction = () => {
    playBeep(1300, 'triangle', 0.15);
    const uncommittedIndex = compactionLogs.findIndex(e => !e.committed);
    const lastCommit = uncommittedIndex === -1 ? compactionLogs.length : uncommittedIndex;

    if (lastCommit < 3) {
      writeLog("COMPACTION WARNING: Not enough committed indices to snapshot safely.");
      return;
    }

    const snapshotIdx = lastCommit - 2; // leave 2 safety logs
    const lastTerm = compactionLogs[snapshotIdx - 1]?.term || 1;
    const snapshotContent = `[Genesis • threshold=50 • interval=1200 • keyspace_1 • deleted_temp • status=ACTIVE]`;

    setSnapshotState({
      lastIncludedIndex: snapshotIdx,
      lastIncludedTerm: lastTerm,
      stateDump: snapshotContent
    });

    setCompactionLogs(prev => prev.filter(e => e.index > snapshotIdx));
    writeLog(`💾 SNAPSHOT: Created state file at index #${snapshotIdx} (Term ${lastTerm}). Discarded index logs 1 to ${snapshotIdx}.`);
  };

  const executeInstallSnapshot = () => {
    if (!snapshotState) {
      writeLog("INSTALL_SNAPSHOT ERROR: No active snapshot state found. Run snapshot/compaction first.");
      return;
    }
    playBeep(1500, 'sine', 0.25);
    setFollower5Log(prev => {
      const parentRemainingLogs = compactionLogs.filter(e => e.index > snapshotState.lastIncludedIndex);
      writeLog(`🛰️ INSTALL_SNAPSHOT RPC: Leader transmitted physical snapshot payload to Node 5. Node 5 state synchronized to index #${snapshotState.lastIncludedIndex}.`);
      return parentRemainingLogs;
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#050508] text-zinc-100 overflow-hidden font-mono select-none relative">
      
      {/* HEADER BAR */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/40 flex justify-between items-center shadow-md relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-950/50 border border-cyan-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Network className={`w-5 h-5 ${labColor} animate-pulse`} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
              {labName} <span className="text-[9px] font-mono text-zinc-500 font-normal">v4.1</span>
            </h2>
            <p className="text-[8.5px] text-zinc-500 leading-none mt-1 uppercase font-bold tracking-wider">{description}</p>
          </div>
        </div>

        {/* Dynamic tabs navigation */}
        <div className="flex bg-black border border-zinc-900 rounded-xl p-0.5 text-[9px] font-bold">
          <button 
            type="button"
            onClick={() => { playBeep(900, 'sine', 0.05); setActiveTab('simulation'); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'simulation' ? 'bg-zinc-900 border border-zinc-800 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Cpu className="w-3 h-3" />
            CLUSTER SANDBOX
          </button>
          <button 
            type="button"
            onClick={() => { playBeep(900, 'sine', 0.05); setActiveTab('compaction'); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'compaction' ? 'bg-zinc-900 border border-zinc-800 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Database className="w-3 h-3" />
            COMPACTION LOGS
          </button>
          <button 
            type="button"
            onClick={() => { playBeep(900, 'sine', 0.05); setActiveTab('matrix'); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'matrix' ? 'bg-zinc-900 border border-zinc-800 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Table className="w-3 h-3" />
            CONFORMANCE MATRIX
          </button>
          <button 
            type="button"
            onClick={() => { playBeep(900, 'sine', 0.05); setActiveTab('proofs'); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'proofs' ? 'bg-zinc-900 border border-zinc-800 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Shield className="w-3 h-3" />
            SAFETY PROOFS
          </button>
        </div>
      </div>

      {/* CONTENT DECKS */}
      <div className="flex-1 overflow-hidden relative flex flex-col z-10">

        {activeTab === 'simulation' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Left Column: Visual Cluster Field & Logs */}
            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-900 bg-zinc-950/20 relative overflow-hidden">
              
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#08080a_1px,transparent_1px),linear-gradient(to_bottom,#08080a_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

              {/* Cluster Ring Platform */}
              <div className="flex-1 flex items-center justify-center relative min-h-[360px]">
                
                <div className="absolute w-[240px] h-[240px] rounded-full border border-zinc-900/40 pointer-events-none" />
                <div className="absolute w-[240px] h-[240px] rounded-full border border-dashed border-cyan-500/5 animate-[spin_60s_linear_infinite] pointer-events-none" />

                {/* Draw SVG Network Links */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {nodes.map((n1, idx1) => {
                    const c1 = getNodeCoords(n1.id);
                    return nodes.map((n2, idx2) => {
                      if (n1.id >= n2.id) return null;
                      const c2 = getNodeCoords(n2.id);
                      return (
                        <line
                          key={`link-${n1.id}-${n2.id}`}
                          x1={c1.x}
                          y1={c1.y}
                          x2={c2.x}
                          y2={c2.y}
                          stroke={n1.status === 'crashed' || n2.status === 'crashed' ? '#18181b' : 'rgba(6, 182, 212, 0.05)'}
                          strokeWidth="1.5"
                        />
                      );
                    });
                  })}
                </svg>

                {/* In flight messages */}
                <AnimatePresence>
                  {inFlightMsgs.map((msg) => {
                    const fromCoords = getNodeCoords(msg.from);
                    const toCoords = getNodeCoords(msg.to);
                    const x = fromCoords.x + (toCoords.x - fromCoords.x) * (msg.progress / 100);
                    const y = fromCoords.y + (toCoords.y - fromCoords.y) * (msg.progress / 100);

                    const color = msg.type === 'Heartbeat' || msg.type === 'Broadcast'
                      ? 'bg-zinc-500 shadow-[0_0_8px_#71717a]'
                      : msg.type === 'RequestVote' || msg.type === 'Prepare'
                      ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                      : 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]';

                    return (
                      <motion.div
                        key={msg.id}
                        className={`absolute w-2 h-2 rounded-full ${color} z-10 pointer-events-none`}
                        style={{ left: x - 4, top: y - 4 }}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1.1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                      />
                    );
                  })}
                </AnimatePresence>

                {/* Nodes Array */}
                {nodes.map((node, i) => {
                  const coords = getNodeCoords(node.id);
                  const isSelected = selectedNodeId === node.id;
                  const isLeader = node.role === 'leader' || node.role === 'primary' || node.role === 'proposer';

                  let statusBorder = 'border-zinc-800 bg-zinc-950/90 text-zinc-500';
                  if (node.status === 'active') {
                    if (isLeader) statusBorder = 'border-cyan-400 bg-cyan-950/25 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)]';
                    else if (node.role === 'candidate') statusBorder = 'border-amber-400 bg-amber-950/20 text-amber-300';
                    else statusBorder = 'border-zinc-700 bg-black text-zinc-300 hover:border-zinc-500';
                  } else {
                    statusBorder = 'border-red-950 bg-red-950/10 text-red-500 opacity-60';
                  }

                  return (
                    <div
                      key={node.id}
                      className="absolute z-10"
                      style={{ left: coords.x - 42, top: coords.y - 42 }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          playBeep(800 + (node.id * 50), 'sine', 0.05);
                          setSelectedNodeId(node.id);
                        }}
                        className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-between p-2 select-none transition-all duration-300 relative ${statusBorder} ${isSelected ? 'scale-110 ring-2 ring-cyan-400/30' : ''}`}
                      >
                        {/* Offline slash indicator */}
                        {node.status === 'crashed' && (
                          <div className="absolute inset-0 bg-red-950/10 backdrop-blur-[0.5px] flex items-center justify-center rounded-2xl">
                            <span className="text-[7.5px] bg-red-950/80 border border-red-500/30 text-red-400 px-1 py-0.5 rounded uppercase font-black tracking-widest font-mono">OFFLINE</span>
                          </div>
                        )}

                        <div className="w-full flex justify-between items-center">
                          <span className="text-[10px] font-black tracking-wider uppercase">Node 0{node.id}</span>
                          <span className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono ${isLeader ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-900 text-zinc-500'}`}>
                            {node.role.slice(0, 4)}
                          </span>
                        </div>

                        <div className="my-1.5 flex flex-col items-center">
                          <Server className={`w-6 h-6 ${node.status === 'crashed' ? 'text-zinc-800' : isLeader ? 'text-cyan-400 animate-pulse' : 'text-zinc-500'}`} />
                        </div>

                        <div className="w-full flex justify-between items-center text-[7.5px] font-mono border-t border-zinc-900/50 pt-1 text-zinc-500">
                          <span>T:{node.term}</span>
                          <span className="text-zinc-400">Log:{node.log.length}</span>
                        </div>
                      </button>
                    </div>
                  );
                })}

                {/* Mini Legend overlay */}
                <div className="absolute bottom-3 left-4 flex flex-col gap-1 text-[8px] font-bold text-zinc-500 uppercase tracking-widest bg-black/60 border border-zinc-900 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    <span>AppendEntries / Data Sync</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                    <span>Candidate Vote RPC</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-500 shadow-[0_0_6px_#71717a]" />
                    <span>Baseline Heartbeat</span>
                  </div>
                </div>

              </div>

              {/* Pure Bash Terminal Panel */}
              <div className="h-[140px] border-t border-zinc-900 bg-black/80 flex flex-col relative">
                <div className="flex justify-between items-center px-4 py-2 border-b border-zinc-950 bg-zinc-950/60 text-[8.5px] font-black tracking-widest uppercase text-zinc-500">
                  <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-cyan-500" /> Consensus Tracing Logs</span>
                  <button 
                    type="button"
                    onClick={() => { playBeep(500, 'sine', 0.05); setTerminalLogs([]); }}
                    className="hover:text-cyan-400 transition-colors uppercase font-mono"
                  >
                    Clear Stream
                  </button>
                </div>
                <div className="flex-1 p-3 overflow-y-auto text-[10px] text-zinc-400 space-y-1.5 font-mono select-text selection:bg-cyan-500/10 selection:text-cyan-400 custom-scrollbar">
                  {terminalLogs.length === 0 ? (
                    <span className="text-zinc-600 block italic py-2">Stream active. Trigger commands on right deck to print log diagnostics...</span>
                  ) : (
                    terminalLogs.map((log, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-cyan-500 font-bold shrink-0">➜</span>
                        <span className={log.includes('CONSENSUS MET') ? 'text-emerald-400 font-bold' : log.includes('CLIENT') ? 'text-white font-bold' : ''}>{log}</span>
                      </div>
                    ))
                  )}
                  <div ref={terminalBottomRef} />
                </div>
              </div>

            </div>

            {/* Right Column: Interaction Setup Details */}
            <div className="w-full lg:w-[350px] flex flex-col bg-zinc-950/60 overflow-y-auto custom-scrollbar border-t lg:border-t-0 border-zinc-900">
              
              {/* Interaction Panel */}
              <div className="p-4 space-y-5 border-b border-zinc-900">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
                  <Settings className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <h3 className="text-[10px] uppercase font-black text-white tracking-widest">
                    Simulation Vector Parameters
                  </h3>
                </div>

                {/* Protocol Selector */}
                <div className="space-y-2">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Active Consensus Schema</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['raft', 'zab', 'paxos'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          playBeep(950, 'sine', 0.05);
                          setProtocol(p);
                        }}
                        className={`py-2 px-1 rounded-xl border font-bold text-[9px] text-center uppercase transition-all ${protocol === p ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-350'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control switches */}
                <div className="space-y-3 bg-black/40 border border-zinc-900 p-3 rounded-2xl text-[9px]">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider">Pipeline Replication</span>
                    <button
                      type="button"
                      onClick={() => {
                        playBeep(1000, 'sine', 0.04);
                        setIsPipelined(!isPipelined);
                        writeLog(`PIPELINE OPTIMIZATION: Set pipeline replication to [${(!isPipelined).toString().toUpperCase()}].`);
                      }}
                      className={`w-10 py-1.5 rounded-lg border font-black uppercase text-center transition-all ${isPipelined ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}
                    >
                      {isPipelined ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider">Heartbeat Broadcasts</span>
                    <button
                      type="button"
                      onClick={() => {
                        playBeep(1000, 'sine', 0.04);
                        setAutoHeartbeat(!autoHeartbeat);
                      }}
                      className={`w-10 py-1.5 rounded-lg border font-black uppercase text-center transition-all ${autoHeartbeat ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}
                    >
                      {autoHeartbeat ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-zinc-900">
                    <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase">
                      <span>Network Simulation Speed</span>
                      <span className="text-cyan-400 font-mono">{simulationSpeed}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="3.0" 
                      step="0.5"
                      value={simulationSpeed}
                      onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Main operational actions */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={triggerElection}
                    className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black tracking-widest text-[9.5px] uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    TRIGGER LEADER ELECTION
                  </button>

                  <div className="space-y-1.5">
                    <div className="flex items-center bg-black border border-zinc-900 rounded-xl p-1.5">
                      <input
                        type="text"
                        value={clientCommand}
                        onChange={(e) => setClientCommand(e.target.value)}
                        placeholder="Enter command key-value..."
                        className="flex-1 bg-transparent border-none text-[10px] px-1 focus:ring-0 text-white placeholder-zinc-700 font-mono"
                      />
                      <button
                        type="button"
                        onClick={submitCommand}
                        className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                        title="Submit Command"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[7.5px] text-zinc-600 leading-none block px-1">
                      {isPipelined 
                        ? 'Pipelined writes enabled: Replicates and returns immediately.' 
                        : 'Standard write waits for majority ACK before next execution.'
                      }
                    </span>
                  </div>
                </div>

              </div>

              {/* Selected Node Inspector Section */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5 mb-3">
                  <Database className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-[10px] uppercase font-black text-white tracking-widest">
                    Node State Inspector
                  </h3>
                </div>

                {selectedNodeId ? (() => {
                  const sNode = nodes.find(n => n.id === selectedNodeId);
                  if (!sNode) return null;
                  const isLeader = sNode.role === 'leader' || sNode.role === 'primary' || sNode.role === 'proposer';
                  return (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        
                        {/* Status detail panel */}
                        <div className="flex items-center justify-between bg-black/40 border border-zinc-900 p-3 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <Server className={`w-8 h-8 ${sNode.status === 'crashed' ? 'text-zinc-800' : 'text-cyan-400'}`} />
                            <div>
                              <h4 className="text-[10px] font-black text-white leading-tight">Node 0{sNode.id}</h4>
                              <span className="text-[8px] text-zinc-500 font-bold uppercase">{sNode.role} authority</span>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => toggleNodeStatus(sNode.id)}
                            className={`py-1 px-2.5 rounded border text-[8px] font-black uppercase transition-all ${
                              sNode.status === 'active' 
                                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/40' 
                                : 'bg-red-950/30 border-red-500/50 text-red-400 hover:bg-red-900/40'
                            }`}
                          >
                            {sNode.status === 'active' ? 'KILL NODE' : 'BOOT NODE'}
                          </button>
                        </div>

                        {/* Node indices table */}
                        <div className="grid grid-cols-2 gap-2 text-[8px] uppercase tracking-widest font-black text-zinc-500">
                          <div className="bg-black/25 border border-zinc-900 p-2 rounded-xl flex flex-col gap-0.5">
                            <span>Logical Term</span>
                            <span className="text-white text-xs mt-1">{sNode.term}</span>
                          </div>
                          <div className="bg-black/25 border border-zinc-900 p-2 rounded-xl flex flex-col gap-0.5">
                            <span>Commit Index</span>
                            <span className="text-cyan-400 text-xs mt-1">#{sNode.commitIndex}</span>
                          </div>
                        </div>

                        {/* Local replicated logs list */}
                        <div className="space-y-1.5 flex-1 flex flex-col">
                          <div className="flex justify-between items-center text-[8.5px] font-black text-zinc-500 uppercase">
                            <span>Local Replicated Logs</span>
                            <span>{sNode.log.length} Entries</span>
                          </div>
                          
                          <div className="bg-black/60 border border-zinc-900 rounded-2xl p-2.5 h-[140px] overflow-y-auto custom-scrollbar space-y-1.5">
                            {sNode.log.length === 0 ? (
                              <span className="text-zinc-700 block text-[9px] italic text-center py-6">Logs empty. Submit write vectors.</span>
                            ) : (
                              sNode.log.map((entry, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[8.5px] border-b border-zinc-900 pb-1.5 last:border-0 last:pb-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 px-1 py-0.5 rounded font-mono font-bold text-[7.5px]">#{entry.index}</span>
                                    <span className="text-white truncate max-w-[130px]" title={entry.command}>{entry.command}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[7px] text-zinc-600 font-bold">T:{entry.term}</span>
                                    {entry.committed ? (
                                      <span className="text-emerald-400 font-bold uppercase text-[7.5px]">Committed</span>
                                    ) : (
                                      <span className="text-amber-500 font-bold uppercase text-[7.5px] animate-pulse">Uncommitted</span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                      <div className="text-[8px] text-zinc-600 leading-normal font-bold uppercase tracking-wider bg-black/20 p-2.5 border border-zinc-950 rounded-xl">
                        Click directly on any of the 5 nodes in the central ring to switch inspection targets.
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-10 text-zinc-600 italic text-[10px]">
                    Select a node inside the circular field to inspect metrics and replicated logs.
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {activeTab === 'compaction' && (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
            
            {/* Compaction Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual logs compaction sandbox */}
                <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <h3 className="text-xs uppercase font-black text-white tracking-widest">
                        Snapshot & Log Compaction Sandbox
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={executeCompaction}
                        className="py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-widest text-[8.5px] uppercase cursor-pointer transition-all"
                      >
                        CREATE SNAPSHOT & COMPACT LOGS
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playBeep(500, 'sine', 0.1);
                          setCompactionLogs([
                            { index: 1, term: 1, command: "INIT_GENESIS", committed: true },
                            { index: 2, term: 1, command: "SET threshold = 50", committed: true },
                            { index: 3, term: 1, command: "SET interval = 1200", committed: true },
                            { index: 4, term: 2, command: "UPDATE keyspace_1", committed: true },
                            { index: 5, term: 2, command: "DELETE temp_node", committed: true },
                            { index: 6, term: 2, command: "SET status = ACTIVE", committed: true },
                            { index: 7, term: 3, command: "WRITE payload_chunk", committed: true },
                            { index: 8, term: 3, command: "UPDATE keyspace_2", committed: true },
                            { index: 9, term: 3, command: "DELETE old_indices", committed: true },
                            { index: 10, term: 3, command: "SET mass_value = 88", committed: false },
                          ]);
                          setSnapshotState(null);
                          setFollower5Log([
                            { index: 1, term: 1, command: "INIT_GENESIS", committed: true },
                            { index: 2, term: 1, command: "SET threshold = 50", committed: true },
                            { index: 3, term: 1, command: "SET interval = 1200", committed: true },
                          ]);
                          writeLog("COMPACTION RESET: Restored log history back to uncompacted Genesis parameters.");
                        }}
                        className="py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 font-bold text-[8.5px] uppercase cursor-pointer"
                      >
                        RESET SANDBOX
                      </button>
                    </div>
                  </div>

                  {/* Log visualization track */}
                  <div className="space-y-3">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Leader Log Segment Array</span>
                    
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2 text-[9px]">
                      {snapshotState && (
                        <div className="col-span-3 flex flex-col justify-between p-2 bg-gradient-to-br from-cyan-950/50 to-zinc-950 border border-cyan-500/30 rounded-xl relative shadow-md">
                          <span className="text-[7.5px] font-black text-cyan-400 tracking-wider">SNAPSHOT FILE</span>
                          <span className="text-[7.5px] text-zinc-500 font-bold mt-1.5">Includes Logs #1-#{snapshotState.lastIncludedIndex}</span>
                          <span className="text-[7px] text-zinc-600 block pt-1 leading-tight border-t border-zinc-900/50 mt-1 truncate">
                            {snapshotState.stateDump}
                          </span>
                        </div>
                      )}

                      {compactionLogs.map((entry) => {
                        const isCommitted = entry.committed;
                        return (
                          <div 
                            key={entry.index} 
                            className={`p-2 rounded-xl border flex flex-col justify-between ${
                              isCommitted 
                                ? 'bg-zinc-950 border-zinc-800 text-zinc-300' 
                                : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                            }`}
                          >
                            <span className="font-black text-[7.5px] text-zinc-500">#{entry.index}</span>
                            <span className="font-bold text-[8.5px] truncate my-1">{entry.command.split(" ")[0]}</span>
                            <span className={`text-[7px] uppercase font-black ${isCommitted ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {isCommitted ? 'C' : 'U'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description of logic */}
                  <div className="p-4 bg-black/40 border border-zinc-900 rounded-2xl space-y-2 text-[10.5px] text-zinc-400 leading-relaxed font-sans">
                    <p>
                      <strong>Why compaction matters:</strong> Raft logs record every state transition. Over time, millions of records would consume all disk memory. Compaction converts old committed logs into a state snapshot, permitting the system to safely discard preceding log lists.
                    </p>
                    <p>
                      In the interactive visualization above, clicking <strong>Snapshot & Compact</strong> takes committed indices #1-#8, compiles them into a compact <strong>State File</strong>, and purges the redundant sequence files.
                    </p>
                  </div>

                </div>

                {/* Lagging node sync demonstration */}
                <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs uppercase font-black text-white tracking-widest">
                        InstallSnapshot RPC Flow Simulator
                      </h3>
                    </div>
                    <button
                      type="button"
                      disabled={!snapshotState}
                      onClick={executeInstallSnapshot}
                      className={`py-1.5 px-3 rounded-lg font-black tracking-widest text-[8.5px] uppercase transition-all flex items-center gap-1.5 ${
                        snapshotState 
                          ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                          : 'bg-zinc-900 text-zinc-600 border border-zinc-950 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      DISPATCH INSTALLSNAPSHOT TO NODE 5
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Parent state */}
                    <div className="bg-black/40 border border-zinc-900 p-3.5 rounded-2xl space-y-2 text-[9.5px]">
                      <span className="text-[8.5px] text-zinc-500 font-black uppercase block tracking-wider">Active Consensus Quorum State</span>
                      <div className="space-y-1 text-zinc-400">
                        <div className="flex justify-between">
                          <span>Latest Log Index:</span>
                          <span className="text-white font-mono">#10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discarded compacted range:</span>
                          <span className="text-cyan-400 font-mono">#1 to #{snapshotState?.lastIncludedIndex || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active memory indices:</span>
                          <span className="text-zinc-500 font-mono">{compactionLogs.map(e => `#${e.index}`).join(", ")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Follower 5 state */}
                    <div className="bg-black/40 border border-zinc-900 p-3.5 rounded-2xl space-y-2 text-[9.5px]">
                      <div className="flex justify-between items-center">
                        <span className="text-[8.5px] text-zinc-500 font-black uppercase tracking-wider">Node 5 (Follower recovering from crash)</span>
                        <span className="text-[7.5px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded uppercase font-black font-mono">LAGGING</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-zinc-400">
                          <span>Local indices remaining:</span>
                          <span className="text-white font-mono">
                            {follower5Log.map(e => `#${e.index}`).join(", ")}
                          </span>
                        </div>
                        <div className="text-[8.5px] bg-amber-950/10 border border-amber-900/30 p-2 text-amber-300 rounded-xl leading-relaxed">
                          {!snapshotState 
                            ? "Node 5 has been offline. It is missing indices #4-#10. Trigger a snapshot on the leader to activate the snapshot payload stream."
                            : "Node 5 cannot sync via normal AppendEntries because missing indices #4-#8 were compacted away! Dispatched InstallSnapshot RPC will directly copy the state dump file."
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Sidebar Guide */}
              <div className="lg:col-span-4 space-y-5">
                
                <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-3xl space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2.5">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-[10px] uppercase font-black text-white tracking-widest">
                      Compaction Invariants
                    </h3>
                  </div>

                  <div className="space-y-4 text-[9.5px] leading-relaxed">
                    <div className="space-y-1.5">
                      <span className="text-cyan-400 font-black uppercase block tracking-wider">The Compaction Dilemma</span>
                      <p className="text-zinc-500 font-sans">
                        Followers recovering from long crashes lack indices that have already been compacted on the leader. The leader cannot replay these entries from its logs because they no longer exist.
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                      <span className="text-amber-400 font-black uppercase block tracking-wider">InstallSnapshot RPC Solution</span>
                      <p className="text-zinc-500 font-sans">
                        To resolve this, the leader streams the snapshot file directly (InstallSnapshot). The follower accepts the file, overrides its entire local database, and directly advances its state machine to the snapshot index.
                      </p>
                    </div>

                    <div className="p-3 bg-black border border-zinc-900 rounded-xl font-mono text-zinc-500 flex gap-2">
                      <span className="text-amber-500 font-black">!</span>
                      <span>
                        Verify this flow by resetting the logs, creating a snapshot, and watching Node 5 catch up instantly.
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {activeTab === 'matrix' && (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            
            {/* Table wrapper */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl overflow-hidden shadow-xl max-w-5xl mx-auto">
              
              <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-950/40">
                <h3 className="text-xs uppercase font-black text-white tracking-widest flex items-center gap-2">
                  <Table className="w-4 h-4 text-cyan-400" /> Raft vs Zab vs Paxos Conformance Matrix
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] border-collapse font-mono">
                  <thead>
                    <tr className="bg-black/60 border-b border-zinc-900 text-zinc-500 font-black uppercase tracking-wider">
                      <th className="p-4 border-r border-zinc-900">Aspect Matrix</th>
                      <th className="p-4 border-r border-zinc-900 text-cyan-400">Raft Consensus</th>
                      <th className="p-4 border-r border-zinc-900 text-amber-400">Zab Atomic Broadcast</th>
                      <th className="p-4">Paxos / Multi-Paxos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-400">
                    <tr>
                      <td className="p-4 font-black text-white bg-black/20 border-r border-zinc-900">Primary Goal</td>
                      <td className="p-4 border-r border-zinc-900">Understandability and simple implementation bounds.</td>
                      <td className="p-4 border-r border-zinc-900">High-throughput atomic broadcast + primary ordering.</td>
                      <td className="p-4">Mathematical minimality & theoretical soundness.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-black text-white bg-black/20 border-r border-zinc-900">Leader Model</td>
                      <td className="p-4 border-r border-zinc-900">Strong, single explicit leader (Append-Only log).</td>
                      <td className="p-4 border-r border-zinc-900">Strong primary with discovery + explicit sync phases.</td>
                      <td className="p-4">Implicit leaders (based on highest proposal numbers).</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-black text-white bg-black/20 border-r border-zinc-900">Ordering Invariant</td>
                      <td className="p-4 border-r border-zinc-900">Total order via continuous log index tracking.</td>
                      <td className="p-4 border-r border-zinc-900">Primary order (Epoch ID) + absolute causal order.</td>
                      <td className="p-4">Total order enforced globally.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-black text-white bg-black/20 border-r border-zinc-900">Replication Vector</td>
                      <td className="p-4 border-r border-zinc-900">Leader pushes entries via AppendEntries RPC.</td>
                      <td className="p-4 border-r border-zinc-900">Primary broadcasts proposals, receives majority ACKs.</td>
                      <td className="p-4">Proposers coordinate accepted values over quorums.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-black text-white bg-black/20 border-r border-zinc-900">Election Mechanics</td>
                      <td className="p-4 border-r border-zinc-900">Randomized election timeouts + majority votes.</td>
                      <td className="p-4 border-r border-zinc-900">Fast Leader Election (FLE) discovery + epoch increment.</td>
                      <td className="p-4">Prepare / Promise proposal cycles on Acceptor quorums.</td>
                    </tr>
                    <tr className="bg-cyan-950/5">
                      <td className="p-4 font-black text-white bg-cyan-950/20 border-r border-zinc-900 text-cyan-400">Latency Metrics</td>
                      <td className="p-4 border-r border-zinc-900 text-cyan-300 font-bold">Generally lower/predictable (~1–2 RTT in steady state).</td>
                      <td className="p-4 border-r border-zinc-900">Moderate (~2–3 RTT due to strict multi-phase sync).</td>
                      <td className="p-4 font-bold">Higher/Variable due to potential proposal contention.</td>
                    </tr>
                    <tr className="bg-amber-950/5">
                      <td className="p-4 font-black text-white bg-amber-950/20 border-r border-zinc-900 text-amber-400">Throughput Metrics</td>
                      <td className="p-4 border-r border-zinc-900 text-zinc-300">Excellent throughput with pipelines / batch optimization.</td>
                      <td className="p-4 border-r border-zinc-900 text-amber-300 font-bold">Supreme for read-heavy coordination workloads.</td>
                      <td className="p-4">Variable; highly performant only on complex variations.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-black text-white bg-black/20 border-r border-zinc-900">Recovery Time</td>
                      <td className="p-4 border-r border-zinc-900">Fast: Leader elected immediately (~150-300ms typical).</td>
                      <td className="p-4 border-r border-zinc-900">Slower: Requires full state synchronization steps.</td>
                      <td className="p-4">Variable based on proposal convergence speed.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-black text-white bg-black/20 border-r border-zinc-900">Failure Handling</td>
                      <td className="p-4 border-r border-zinc-900">Simple: Retries same chunk with matching terms.</td>
                      <td className="p-4 border-r border-zinc-900">Complex: Tracks in-flight queues, rolls back epochs.</td>
                      <td className="p-4">Highly complex proposal reconciliation loops.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'proofs' && (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
            
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="text-center py-4">
                <Shield className="w-12 h-12 text-cyan-400 mx-auto animate-bounce mb-3" />
                <h3 className="text-sm font-black text-white tracking-widest uppercase">Mathematical Consensus Safety Proofs</h3>
                <p className="text-[10px] text-zinc-500 max-w-lg mx-auto leading-relaxed mt-1 font-sans">
                  The mathematical invariants verified in formal proofs of the Raft distributed systems protocol. These ensure safety in physical partitions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Proof 1 */}
                <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl space-y-2 relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[8px] bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold rounded px-1.5 py-0.5">
                    INVARIANT 1
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Election Safety</h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                    <strong>Property:</strong> At most one leader can be elected in a given term.
                  </p>
                  <p className="text-[9.5px] text-zinc-500 leading-relaxed font-sans border-t border-zinc-900/50 pt-2">
                    <strong>Proof Sketch:</strong> A candidate must obtain votes from a quorum majority of nodes to take power. Since two majorities always overlap (pigeonhole principle), it is impossible for two candidates to secure majorities in the same term.
                  </p>
                </div>

                {/* Proof 2 */}
                <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl space-y-2 relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[8px] bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold rounded px-1.5 py-0.5">
                    INVARIANT 2
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Leader Append-Only</h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                    <strong>Property:</strong> A leader never overwrites or deletes entries in its log; it only appends new entries.
                  </p>
                  <p className="text-[9.5px] text-zinc-500 leading-relaxed font-sans border-t border-zinc-900/50 pt-2">
                    <strong>Proof Sketch:</strong> Leader logs are absolute sources of truth. When conflict arises at followers, followers truncate logs to match. The leader itself never edits committed logs, ensuring monotonic indices.
                  </p>
                </div>

                {/* Proof 3 */}
                <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl space-y-2 relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[8px] bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold rounded px-1.5 py-0.5">
                    INVARIANT 3
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Log Matching Invariant</h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                    <strong>Property:</strong> If two logs contain an entry with the same index and term, then they are identical in all preceding entries.
                  </p>
                  <p className="text-[9.5px] text-zinc-500 leading-relaxed font-sans border-t border-zinc-900/50 pt-2">
                    <strong>Proof Sketch:</strong> Inductive validation. Before accepting AppendEntries, followers verify preceding logs match the leader. If valid, the match propagates backwards down to genesis index #1.
                  </p>
                </div>

                {/* Proof 4 */}
                <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl space-y-2 relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[8px] bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold rounded px-1.5 py-0.5">
                    INVARIANT 4
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Leader Completeness</h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                    <strong>Property:</strong> If a log entry is committed in a given term, that entry will be present in the logs of all future leaders.
                  </p>
                  <p className="text-[9.5px] text-zinc-500 leading-relaxed font-sans border-t border-zinc-900/50 pt-2">
                    <strong>Proof Sketch:</strong> Committed entry exists on a majority. Future leaders need a majority to win election. Because of majority overlap, the future leader must receive a vote from at least one node holding the committed entry, passing log-comparison criteria.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
      
      {/* TRADING STATUS BOTTOM MARGIN */}
      <div className="p-3 border-t border-zinc-900/60 bg-black text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] flex justify-between items-center relative z-20">
        <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> CLUSTER INTEGRITY AUDIT COMPLETE: SECURE CONSENSUS BOUNDS ACTIVE</span>
        <span>LATENCY: ZERO CONTENTION • FLOCK LOCK ACQUIRED</span>
      </div>

    </div>
  );
};
