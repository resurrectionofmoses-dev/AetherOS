import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Atom, Zap, Shield, Search, Database, RefreshCw, Layers, Cpu, Play, Pause, Trash2, Maximize2, Activity, TrendingUp, AlertTriangle, ArrowRight, CornerDownRight, CheckCircle2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuantumLedgerDashboard } from './QuantumLedgerDashboard';

// D3 simulation type structures
interface LedgerNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'genesis' | 'block' | 'validator' | 'wallet' | 'transaction';
  val: number; // visual weight/size
  color: string;
  status?: string;
  details: {
    hash?: string;
    height?: number;
    amount?: string;
    gas?: string;
    timestamp?: string;
    sender?: string;
    recipient?: string;
    signature?: string;
    load?: string;
    resonance?: string;
    desc?: string;
  };
}

interface LedgerLink extends d3.SimulationLinkDatum<LedgerNode> {
  id: string;
  source: string | LedgerNode;
  target: string | LedgerNode;
  type: 'chain' | 'transfer' | 'validation' | 'resonance';
  value: number; // visual strength
}

// Initial validator list
const INITIAL_VALIDATORS = [
  { id: 'v_sovereign', label: 'Sovereign Node', color: '#EF4444', desc: 'Sovereign AI Conductor Seat' },
  { id: 'v_swift', label: 'Swift Node', color: '#3B82F6', desc: 'High-speed validation sub-module' },
  { id: 'v_oracle', label: 'Oracle Node', color: '#818CF8', desc: 'Predictive handshakes & intelligence' },
  { id: 'v_weaver', label: 'Weaver Node', color: '#A78BFA', desc: 'Context weaver and synthesizer' },
  { id: 'v_opensource', label: 'Open Llama Node', color: '#10B981', desc: 'Open-source state model validation' },
  { id: 'v_maestro', label: 'Maestro Coder', color: '#F59E0B', desc: 'Active execution builder seat' },
];

export interface QuantumTick {
  blockHeight: number;
  timestamp: string;
  gasPrice: number;
  consensusRate: number;
  volumeDelta: number;
  totalVolume: number;
}

const generateInitialTicks = (endBlock: number): QuantumTick[] => {
  const result: QuantumTick[] = [];
  let currentVolume = 142980.5 - (100 * 65);
  let currentGas = 15;
  let currentConsensus = 99.85;
  for (let i = 100; i >= 0; i--) {
    const blockNum = endBlock - i;
    const volumeDelta = Math.floor(Math.random() * 120) + 10;
    currentVolume += volumeDelta;
    currentConsensus = Math.min(100, Math.max(98, currentConsensus + (Math.random() - 0.5) * 0.1));
    currentGas = Math.max(10, Math.min(60, currentGas + (Math.random() - 0.5 > 0 ? 1 : -1)));
    result.push({
      blockHeight: blockNum,
      timestamp: new Date(Date.now() - i * 3000).toISOString(),
      gasPrice: currentGas,
      consensusRate: currentConsensus,
      volumeDelta,
      totalVolume: currentVolume,
    });
  }
  return result;
};

interface QuantumLedgerStateCache {
  chargeStrength: number;
  linkDistance: number;
  gravityStrength: number;
  autoEmit: boolean;
  particleFlow: boolean;
  simulationSpeed: number;
  selectedNode: LedgerNode | null;
  blockHeight: number;
  totalVolume: number;
  gasPrice: number;
  consensusRate: number;
  collapseCount: number;
  logs: { id: string; text: string; time: string; type: 'info' | 'success' | 'warn' | 'quantum' }[];
  nodes: LedgerNode[];
  links: LedgerLink[];
  ticks: QuantumTick[];
}

export let cachedLedgerState: QuantumLedgerStateCache = {
  chargeStrength: -140,
  linkDistance: 80,
  gravityStrength: 0.2,
  autoEmit: true,
  particleFlow: true,
  simulationSpeed: 1.5,
  selectedNode: null,
  blockHeight: 40291,
  totalVolume: 142980.5,
  gasPrice: 15,
  consensusRate: 99.85,
  collapseCount: 0,
  logs: [
    { id: '1', text: 'Quantum Ledger manifold successfully engaged.', time: '08:26:02', type: 'info' },
    { id: '2', text: 'Genesis validation verified by Maestro. Root initialized.', time: '08:26:10', type: 'success' },
    { id: '3', text: 'Resonance factor locked at 0.957 SHARDS.', time: '08:26:15', type: 'quantum' }
  ],
  nodes: [
    {
      id: 'genesis_block',
      label: 'Genesis Block #0',
      type: 'genesis',
      val: 24,
      color: '#6366F1',
      details: {
        hash: '0x0000000003E2_GENESIS_8b1f9c8d19a273ff3a970eabc871f30129bcfe3a69a8e',
        height: 0,
        timestamp: '2026-05-28T08:00:00Z',
        desc: 'The original root of ordering of AetherOS. Immutable seed state.',
      }
    },
    ...INITIAL_VALIDATORS.map(val => ({
      id: val.id,
      label: val.label,
      type: 'validator' as const,
      val: 18,
      color: val.color,
      details: {
        desc: val.desc,
        load: '2.4%',
        resonance: '99.9%'
      }
    })),
    {
      id: 'block_40289',
      label: 'Block #40289',
      type: 'block',
      val: 15,
      color: '#A5B4FC',
      details: {
        hash: '0x84f93a92ee0bc8c9735d10a62c64e81ef23c501f6874ba9a79fa4362145b20',
        height: 40289,
        gas: '12 Gwei',
        timestamp: '2026-05-28T08:15:20Z',
        desc: 'Block finalized with zero consensus friction.'
      }
    },
    {
      id: 'block_40290',
      label: 'Block #40290',
      type: 'block',
      val: 15,
      color: '#818CF8',
      details: {
        hash: '0xbc8481ff23bca398321098eac871fa01ebd23cde7bc4f78310ba2dcfef8324',
        height: 40290,
        gas: '15 Gwei',
        timestamp: '2026-05-28T08:24:55Z',
        desc: 'Unified chain block inheriting previous state dependencies.'
      }
    },
    { id: 'addr_central', label: 'Aether Central Vault', type: 'wallet', val: 12, color: '#EC4899', details: { desc: 'Platform liquidity & system gas reserves vault' } },
    { id: 'addr_user', label: 'User Wallet', type: 'wallet', val: 12, color: '#10B981', details: { desc: 'Active developer/administrator terminal address' } },
    {
      id: 'tx_genesis_mint',
      label: 'Mint Token #1518',
      type: 'transaction',
      val: 8,
      color: '#EC4899',
      details: {
        hash: '0xbd29abce271e8432a9e871eab0cda39ff9139a03e1e23f6e1f0e1fcfec81a0b',
        amount: '5,000 AETH',
        sender: 'genesis_block',
        recipient: 'addr_central',
        signature: 'ConductionAuthority://Maestrov5'
      }
    }
  ],
  links: [
    { id: 'seq_1', source: 'genesis_block', target: 'block_40289', type: 'chain', value: 1.5 },
    { id: 'seq_2', source: 'block_40289', target: 'block_40290', type: 'chain', value: 1.5 },
    { id: 'cr_1', source: 'v_sovereign', target: 'genesis_block', type: 'resonance', value: 1.0 },
    { id: 'cr_2', source: 'v_maestro', target: 'genesis_block', type: 'resonance', value: 1.0 },
    { id: 'val_1', source: 'v_sovereign', target: 'block_40290', type: 'validation', value: 1.0 },
    { id: 'val_2', source: 'v_swift', target: 'block_40290', type: 'validation', value: 1.0 },
    { id: 'val_3', source: 'v_oracle', target: 'block_40290', type: 'validation', value: 1.0 },
    { id: 'val_4', source: 'v_weaver', target: 'block_40290', type: 'validation', value: 1.0 },
    { id: 'val_5', source: 'v_opensource', target: 'block_40290', type: 'validation', value: 1.0 },
    { id: 'val_6', source: 'v_maestro', target: 'block_40290', type: 'validation', value: 1.0 },
    { id: 'vault_bind', source: 'addr_central', target: 'genesis_block', type: 'resonance', value: 0.8 },
    { id: 'user_bind', source: 'addr_user', target: 'block_40290', type: 'resonance', value: 0.8 },
    { id: 'tx_link_s', source: 'genesis_block', target: 'tx_genesis_mint', type: 'transfer', value: 0.8 },
    { id: 'tx_link_t', source: 'tx_genesis_mint', target: 'addr_central', type: 'transfer', value: 0.8 }
  ],
  ticks: generateInitialTicks(40291)
};

let isComponentMounted = false;

// Continuous background block production for Quantum Ledger View
setInterval(() => {
  if (isComponentMounted) return;
  if (!cachedLedgerState.autoEmit) return;

  const eventChance = Math.random();
  if (eventChance > 0.7) {
    const newBlockNum = cachedLedgerState.blockHeight + 1;
    cachedLedgerState.blockHeight = newBlockNum;

    const timestamp = new Date().toISOString();
    const blockId = `block_${newBlockNum}`;
    const newBlockLabel = `Block #${newBlockNum}`;

    const blockNode: LedgerNode = {
      id: blockId,
      label: newBlockLabel,
      type: 'block',
      val: 15,
      color: '#818CF8',
      details: {
        hash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        height: newBlockNum,
        gas: `${Math.floor(Math.random() * 8) + 12} Gwei`,
        timestamp,
        desc: `Dynamic block produced via background fast-conduction consensus.`
      }
    };

    const randomValidator = INITIAL_VALIDATORS[Math.floor(Math.random() * INITIAL_VALIDATORS.length)];

    const updatedNodes = [...cachedLedgerState.nodes];
    const activeBlocks = updatedNodes.filter(n => n.type === 'block').length;
    if (activeBlocks > 6) {
      const oldestIndex = updatedNodes.findIndex(n => n.type === 'block' && n.id !== 'block_40289' && n.id !== 'block_40290');
      if (oldestIndex !== -1) {
        const prunedId = updatedNodes[oldestIndex].id;
        updatedNodes.splice(oldestIndex, 1);
        cachedLedgerState.links = cachedLedgerState.links.filter(l => l.source !== prunedId && l.target !== prunedId);
      }
    }
    updatedNodes.push(blockNode);
    cachedLedgerState.nodes = updatedNodes;

    const blockKeys = updatedNodes.filter(n => n.type === 'block').map(n => n.id);
    const lastIndexId = blockKeys[blockKeys.length - 2] || 'block_40290';

    cachedLedgerState.links.push({
      id: `seq_${newBlockNum}`,
      source: lastIndexId,
      target: blockId,
      type: 'chain',
      value: 1.5
    });

    cachedLedgerState.links.push({
      id: `val_${randomValidator.id}_${newBlockNum}`,
      source: randomValidator.id,
      target: blockId,
      type: 'validation',
      value: 1.0
    });

    const fineHash = blockNode.details.hash?.slice(0, 8);
    const logId = String(Date.now());
    const timeStr = new Date().toLocaleTimeString();

    cachedLedgerState.logs = [
      { id: logId, text: `Block #${newBlockNum} produced in background. Hash: 0x${fineHash}... Validator: ${randomValidator.label}`, time: timeStr, type: 'success' },
      ...cachedLedgerState.logs.slice(0, 15)
    ];

    const volumeDelta = Math.floor(Math.random() * 120) + 10;
    cachedLedgerState.totalVolume += volumeDelta;
    cachedLedgerState.consensusRate = Math.min(100, Math.max(98, cachedLedgerState.consensusRate + (Math.random() - 0.5) * 0.1));
    cachedLedgerState.gasPrice = Math.max(10, Math.min(60, cachedLedgerState.gasPrice + (Math.random() - 0.5 > 0 ? 1 : -1)));

    if (!cachedLedgerState.ticks) {
      cachedLedgerState.ticks = [];
    }
    cachedLedgerState.ticks.push({
      blockHeight: newBlockNum,
      timestamp,
      gasPrice: cachedLedgerState.gasPrice,
      consensusRate: cachedLedgerState.consensusRate,
      volumeDelta,
      totalVolume: cachedLedgerState.totalVolume
    });
    if (cachedLedgerState.ticks.length > 100) {
      cachedLedgerState.ticks.shift();
    }
  }
}, 3000);

export const QuantumLedgerView: React.FC = () => {
  useEffect(() => {
    isComponentMounted = true;
    return () => {
      isComponentMounted = false;
    };
  }, []);
  // Container & SVG References
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Simulation controls & configurations
  const [chargeStrength, setChargeStrength] = useState<number>(() => cachedLedgerState?.chargeStrength ?? -140);
  const [linkDistance, setLinkDistance] = useState<number>(() => cachedLedgerState?.linkDistance ?? 80);
  const [gravityStrength, setGravityStrength] = useState<number>(() => cachedLedgerState?.gravityStrength ?? 0.2);
  const [autoEmit, setAutoEmit] = useState<boolean>(() => cachedLedgerState?.autoEmit ?? true);
  const [particleFlow, setParticleFlow] = useState<boolean>(() => cachedLedgerState?.particleFlow ?? true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(() => cachedLedgerState?.simulationSpeed ?? 1.5); // Seconds per real-time event

  // Selections and details
  const [selectedNode, setSelectedNode] = useState<LedgerNode | null>(() => cachedLedgerState?.selectedNode ?? null);
  const [hoveredNode, setHoveredNode] = useState<LedgerNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'DASHBOARD'>('GRAPH');
  const [ticks, setTicks] = useState<QuantumTick[]>(() => cachedLedgerState?.ticks ?? []);

  useEffect(() => {
    if (cachedLedgerState?.ticks) {
      setTicks([...cachedLedgerState.ticks]);
    }
  }, []);
  
  // Real-time telemetry states
  const [blockHeight, setBlockHeight] = useState<number>(() => cachedLedgerState?.blockHeight ?? 40291);
  const [totalVolume, setTotalVolume] = useState<number>(() => cachedLedgerState?.totalVolume ?? 142980.5);
  const [gasPrice, setGasPrice] = useState<number>(() => cachedLedgerState?.gasPrice ?? 15);
  const [consensusRate, setConsensusRate] = useState<number>(() => cachedLedgerState?.consensusRate ?? 99.85);
  const [collapseCount, setCollapseCount] = useState<number>(() => cachedLedgerState?.collapseCount ?? 0);
  
  // Dynamic logs feed
  const [logs, setLogs] = useState<{ id: string; text: string; time: string; type: 'info' | 'success' | 'warn' | 'quantum' }[]>(() => {
    return cachedLedgerState?.logs ?? [
      { id: '1', text: 'Quantum Ledger manifold successfully engaged.', time: '08:26:02', type: 'info' },
      { id: '2', text: 'Genesis validation verified by Maestro. Root initialized.', time: '08:26:10', type: 'success' },
      { id: '3', text: 'Resonance factor locked at 0.957 SHARDS.', time: '08:26:15', type: 'quantum' }
    ];
  });

  // Blockchain Data State
  const [nodes, setNodes] = useState<LedgerNode[]>(() => {
    if (cachedLedgerState?.nodes) return cachedLedgerState.nodes;
    // Scaffold initial dataset
    const nList: LedgerNode[] = [];
    
    // 1. Root Genesis Node
    nList.push({
      id: 'genesis_block',
      label: 'Genesis Block #0',
      type: 'genesis',
      val: 24,
      color: '#6366F1',
      details: {
        hash: '0x0000000003E2_GENESIS_8b1f9c8d19a273ff3a970eabc871f30129bcfe3a69a8e',
        height: 0,
        timestamp: '2026-05-28T08:00:00Z',
        desc: 'The original root of ordering of AetherOS. Immutable seed state.',
      }
    });

    // 2. Initialize Validators
    INITIAL_VALIDATORS.forEach(val => {
      nList.push({
        id: val.id,
        label: val.label,
        type: 'validator',
        val: 18,
        color: val.color,
        details: {
          desc: val.desc,
          load: '2.4%',
          resonance: '99.9%'
        }
      });
    });

    // 3. Chain block #1 and #2
    nList.push({
      id: 'block_40289',
      label: 'Block #40289',
      type: 'block',
      val: 15,
      color: '#A5B4FC',
      details: {
        hash: '0x84f93a92ee0bc8c9735d10a62c64e81ef23c501f6874ba9a79fa4362145b20',
        height: 40289,
        gas: '12 Gwei',
        timestamp: '2026-05-28T08:15:20Z',
        desc: 'Block finalized with zero consensus friction.'
      }
    });

    nList.push({
      id: 'block_40290',
      label: 'Block #40290',
      type: 'block',
      val: 15,
      color: '#818CF8',
      details: {
        hash: '0xbc8481ff23bca398321098eac871fa01ebd23cde7bc4f78310ba2dcfef8324',
        height: 40290,
        gas: '15 Gwei',
        timestamp: '2026-05-28T08:24:55Z',
        desc: 'Unified chain block inheriting previous state dependencies.'
      }
    });

    // 4. Sandbox Wallets
    nList.push({ id: 'addr_central', label: 'Aether Central Vault', type: 'wallet', val: 12, color: '#EC4899', details: { desc: 'Platform liquidity & system gas reserves vault' } });
    nList.push({ id: 'addr_user', label: 'User Wallet', type: 'wallet', val: 12, color: '#10B981', details: { desc: 'Active developer/administrator terminal address' } });

    // 5. Sample transactions
    nList.push({
      id: 'tx_genesis_mint',
      label: 'Mint Token #1518',
      type: 'transaction',
      val: 8,
      color: '#EC4899',
      details: {
        hash: '0xbd29abce271e8432a9e871eab0cda39ff9139a03e1e23f6e1f0e1fcfec81a0b',
        amount: '5,000 AETH',
        sender: 'genesis_block',
        recipient: 'addr_central',
        signature: 'ConductionAuthority://Maestrov5'
      }
    });

    return nList;
  });

  const [links, setLinks] = useState<LedgerLink[]>(() => {
    if (cachedLedgerState?.links) return cachedLedgerState.links;
    return [
      // Chain sequencer links
      { id: 'seq_1', source: 'genesis_block', target: 'block_40289', type: 'chain', value: 1.5 },
      { id: 'seq_2', source: 'block_40289', target: 'block_40290', type: 'chain', value: 1.5 },

      // Genesis -> Validator validations
      { id: 'cr_1', source: 'v_sovereign', target: 'genesis_block', type: 'resonance', value: 1.0 },
      { id: 'cr_2', source: 'v_maestro', target: 'genesis_block', type: 'resonance', value: 1.0 },

      // Latest validator consensus bindings to current height
      { id: 'val_1', source: 'v_sovereign', target: 'block_40290', type: 'validation', value: 1.0 },
      { id: 'val_2', source: 'v_swift', target: 'block_40290', type: 'validation', value: 1.0 },
      { id: 'val_3', source: 'v_oracle', target: 'block_40290', type: 'validation', value: 1.0 },
      { id: 'val_4', source: 'v_weaver', target: 'block_40290', type: 'validation', value: 1.0 },
      { id: 'val_5', source: 'v_opensource', target: 'block_40290', type: 'validation', value: 1.0 },
      { id: 'val_6', source: 'v_maestro', target: 'block_40290', type: 'validation', value: 1.0 },

      // Accounts associations
      { id: 'vault_bind', source: 'addr_central', target: 'genesis_block', type: 'resonance', value: 0.8 },
      { id: 'user_bind', source: 'addr_user', target: 'block_40290', type: 'resonance', value: 0.8 },

      // Mint transfer
      { id: 'tx_link_s', source: 'genesis_block', target: 'tx_genesis_mint', type: 'transfer', value: 0.8 },
      { id: 'tx_link_t', source: 'tx_genesis_mint', target: 'addr_central', type: 'transfer', value: 0.8 },
    ];
  });

  // Keep state caches armored against unmounting
  useEffect(() => {
    cachedLedgerState = {
      chargeStrength,
      linkDistance,
      gravityStrength,
      autoEmit,
      particleFlow,
      simulationSpeed,
      selectedNode,
      blockHeight,
      totalVolume,
      gasPrice,
      consensusRate,
      collapseCount,
      logs,
      nodes,
      links: links.map(l => {
        const getID = (obj: any) => typeof obj === 'object' ? obj.id : obj;
        return {
          ...l,
          source: getID(l.source),
          target: getID(l.target)
        };
      }),
      ticks
    };
  }, [chargeStrength, linkDistance, gravityStrength, autoEmit, particleFlow, simulationSpeed, selectedNode, blockHeight, totalVolume, gasPrice, consensusRate, collapseCount, logs, nodes, links, ticks]);

  // Keep elements mapped as filters
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const lower = searchQuery.toLowerCase();
    return nodes.filter(n => 
      n.label.toLowerCase().includes(lower) || 
      n.type.toLowerCase().includes(lower) ||
      (n.details.hash && n.details.hash.toLowerCase().includes(lower))
    );
  }, [nodes, searchQuery]);

  // Keep references updated for D3 event handlers to avoid closure locks
  const forceRef = useRef({ chargeStrength, linkDistance, gravityStrength });
  useEffect(() => {
    forceRef.current = { chargeStrength, linkDistance, gravityStrength };
  }, [chargeStrength, linkDistance, gravityStrength]);

  // Handle D3 Force-Directed Sim Loop
  useEffect(() => {
    if (!svgRef.current || filteredNodes.length === 0) return;

    // Reset svg dimensions gracefully via ResizeObserver
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Clean previous render artifacts completely
    svg.selectAll('*').remove();

    // Define defs with markers and glow gradients
    const defs = svg.append('defs');
    
    // Dynamic arrowhead marker for links
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30) // Positioned nicely outside standard node circle radius
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#4B5563');

    // FeDropShadow for neon glowing nodes
    const filter = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');

    filter.append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', d => d);

    // Deep clones nodes and links for safety inside the D3 simulation
    // D3 mutates objects. We preserve raw state in state, and feed cloned ones to the simulation.
    const simNodes: LedgerNode[] = filteredNodes.map(n => ({ ...n }));
    
    // Relink references inside cloned links
    const simLinks: LedgerLink[] = links
      .filter(l => {
        // filter out links where source/target does not exist in active filtered nodes list
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        return simNodes.some(n => n.id === sId) && simNodes.some(n => n.id === tId);
      })
      .map(l => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        return {
          ...l,
          source: sId,
          target: tId
        };
      });

    // Zoom setup
    const g = svg.append('g').attr('class', 'main-scene');
    
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);

    // Initialize layout at center initially
    simNodes.forEach(node => {
      if (node.x === undefined) node.x = width / 2 + (Math.random() - 0.5) * 80;
      if (node.y === undefined) node.y = height / 2 + (Math.random() - 0.5) * 80;
    });

    // Create custom force layout forces
    const simulation = d3.forceSimulation<LedgerNode>(simNodes)
      .force('link', d3.forceLink<LedgerNode, LedgerLink>(simLinks)
        .id(d => d.id)
        .distance(forceRef.current.linkDistance)
      )
      .force('charge', d3.forceManyBody().strength(forceRef.current.chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(forceRef.current.gravityStrength))
      .force('y', d3.forceY(height / 2).strength(forceRef.current.gravityStrength));

    // Render linkage lines (Links)
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', d => {
        if (d.type === 'chain') return '#6366F1';
        if (d.type === 'validation') return '#3B82F6';
        if (d.type === 'resonance') return '#8B5CF6';
        return '#3F3F46'; // dark wireframe for transactions
      })
      .attr('stroke-opacity', d => d.type === 'chain' ? 0.8 : 0.4)
      .attr('stroke-width', d => {
        if (d.type === 'chain') return 3.5;
        if (d.type === 'transfer') return 1.5;
        return 2;
      })
      .attr('stroke-dasharray', d => {
        if (d.type === 'resonance') return '4,4';
        if (d.type === 'validation') return '2,3';
        return 'none';
      })
      .attr('marker-end', d => d.type === 'transfer' ? 'url(#arrow)' : 'none')
      .attr('class', d => `link-${d.id}`);

    // Create nice running particle flow flow along lines using standard dynamic attributes
    if (particleFlow) {
      const flowingLinks = simLinks.filter(l => l.type === 'transfer' || l.type === 'chain');
      g.append('g')
        .attr('class', 'particles')
        .selectAll('circle')
        .data(flowingLinks)
        .enter()
        .append('circle')
        .attr('r', 3)
        .attr('fill', d => d.type === 'chain' ? '#818CF8' : '#F43F5E')
        .attr('class', d => `flow-particle-${d.id}`)
        .append('animateMotion')
        .attr('dur', d => d.type === 'chain' ? '2.5s' : '1.8s')
        .attr('repeatCount', 'indefinite')
        .attr('rotate', 'auto');
    }

    // Render node representations (Nodes)
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, LedgerNode>('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'grab')
      .on('click', (event, d) => {
        // Feed selection back to React
        setSelectedNode(d);
        // Highlight active clicked element locally in SVG via scale or stroke width
        d3.selectAll('.node-circle').attr('stroke-width', 2);
        d3.select(event.currentTarget).select('.node-circle')
          .attr('stroke-width', 4)
          .attr('stroke', '#FFFFFF');
      })
      .on('mouseover', (event, d) => {
        setHoveredNode(d);
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      })
      .call(d3.drag<SVGGElement, LedgerNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Inner node visual body
    node.append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => d.val)
      .attr('fill', d => d.color)
      .attr('stroke', d => {
        if (d.type === 'genesis') return '#818CF8';
        if (d.type === 'validator') return '#000000';
        return '#1F2937';
      })
      .attr('stroke-width', d => d.type === 'genesis' ? 3 : 2)
      .style('filter', d => d.type === 'genesis' || d.type === 'validator' ? 'url(#node-glow)' : 'none');

    // Add unique symbolic indicators inside major node core circles
    node.filter(d => d.type === 'genesis' || d.type === 'validator')
      .append('circle')
      .attr('r', d => d.val * 0.4)
      .attr('fill', 'rgba(0,0,0,0.4)');

    // Text Label layout (Nodes)
    node.append('text')
      .attr('dy', d => d.val + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.type === 'validator' ? '#F3F4F6' : '#9CA3AF')
      .attr('font-size', d => d.type === 'genesis' || d.type === 'validator' ? '9px' : '8px')
      .attr('font-weight', d => d.type === 'validator' || d.type === 'genesis' ? 'bold' : 'normal')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace')
      .text(d => d.type === 'validator' ? d.label.toUpperCase() : d.label);

    // D3 physics simulator ticker
    simulation.on('tick', () => {
      // Pin sequence constraints
      link
        .attr('x1', d => (d.source as LedgerNode).x!)
        .attr('y1', d => (d.source as LedgerNode).y!)
        .attr('x2', d => (d.target as LedgerNode).x!)
        .attr('y2', d => (d.target as LedgerNode).y!);

      // Relocate dynamic animation paths/motions if particle flows exist
      if (particleFlow) {
        simLinks.forEach(l => {
          const s = l.source as LedgerNode;
          const t = l.target as LedgerNode;
          svg.selectAll(`.flow-particle-${l.id}`)
            .attr('cx', s.x!)
            .attr('cy', s.y!)
            .selectAll('animateMotion')
            .attr('path', `M${s.x},${s.y} L${t.x},${t.y}`);
        });
      }

      node.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    // Resize container bindings
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      svg.attr('viewBox', `0 0 ${w} ${h}`);
      simulation.force('center', d3.forceCenter(w / 2, h / 2));
      simulation.alpha(0.1).restart();
    };

    let rAFId: number;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      if (rAFId) {
        window.cancelAnimationFrame(rAFId);
      }
      rAFId = window.requestAnimationFrame(() => {
        handleResize();
      });
    });
    resizeObserver.observe(container);

    // Node Drag physics functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, LedgerNode, LedgerNode>, d: LedgerNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(event.sourceEvent.currentTarget).style('cursor', 'grabbing');
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, LedgerNode, LedgerNode>, d: LedgerNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, LedgerNode, LedgerNode>, d: LedgerNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      d3.select(event.sourceEvent.currentTarget).style('cursor', 'grab');
    }

    return () => {
      simulation.stop();
      resizeObserver.disconnect();
    };
  }, [filteredNodes, links, collapseCount, particleFlow]);

  // Handle Dynamic Real-Time Blockchain Simulation Feed
  useEffect(() => {
    if (!autoEmit) return;

    const interval = setInterval(() => {
      // Generate randomized transaction/block conduction events
      const eventChance = Math.random();

      if (eventChance > 0.7) {
        // 1. Spawning a new transaction block!
        const newBlockNum = blockHeight + 1;
        setBlockHeight(newBlockNum);
        
        const timestamp = new Date().toISOString();
        const blockId = `block_${newBlockNum}`;
        const prevBlockId = `block_${newBlockNum - 1}`;
        const newBlockLabel = `Block #${newBlockNum}`;

        const blockNode: LedgerNode = {
          id: blockId,
          label: newBlockLabel,
          type: 'block',
          val: 15,
          color: '#818CF8',
          details: {
            hash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
            height: newBlockNum,
            gas: `${Math.floor(Math.random() * 8) + 12} Gwei`,
            timestamp,
            desc: `Dynamic block produced via fast-conduction consensus.`
          }
        };

        const randomValidator = INITIAL_VALIDATORS[Math.floor(Math.random() * INITIAL_VALIDATORS.length)];

        setNodes(prev => {
          // Verify and link chain sequence
          const updated = [...prev];
          // Delete very old transaction / wallet nodes to keep graph uncluttered & efficient
          const activeBlocks = updated.filter(n => n.type === 'block').length;
          
          if (activeBlocks > 6) {
            // Prune oldest block node
            const oldestIndex = updated.findIndex(n => n.type === 'block' && n.id !== 'block_40289' && n.id !== 'block_40290');
            if (oldestIndex !== -1) {
              const prunedId = updated[oldestIndex].id;
              updated.splice(oldestIndex, 1);
              // Clean linking lines connected to pruned node
              setLinks(lnk => lnk.filter(l => l.source !== prunedId && l.target !== prunedId));
            }
          }
          
          updated.push(blockNode);
          return updated;
        });

        setLinks(prev => {
          const updated = [...prev];
          
          // Connect new Block node sequentially to previous block node height (look inside components)
          const blockKeys = nodes.filter(n => n.type === 'block').map(n => n.id);
          const lastIndexId = blockKeys[blockKeys.length - 1] || 'block_40290';
          
          updated.push({
            id: `seq_${newBlockNum}`,
            source: lastIndexId,
            target: blockId,
            type: 'chain',
            value: 1.5
          });

          // Connect validator who forged/validated this block
          updated.push({
            id: `val_${randomValidator.id}_${newBlockNum}`,
            source: randomValidator.id,
            target: blockId,
            type: 'validation',
            value: 1.0
          });

          return updated;
        });

        // Add to telemetry log
        const fineHash = blockNode.details.hash?.slice(0, 8);
        const logId = String(Date.now());
        const timeStr = new Date().toLocaleTimeString();

        setLogs(prev => [
          { id: logId, text: `Block #${newBlockNum} produced. Hash: 0x${fineHash}... Validator: ${randomValidator.label}`, time: timeStr, type: 'success' },
          ...prev.slice(0, 15)
        ]);

        // Dynamically vary telemetry metrics slightly
        const volumeDelta = Math.floor(Math.random() * 120) + 10;
        setTotalVolume(prev => {
          const nextVal = prev + volumeDelta;
          setConsensusRate(pCons => {
            const nextCons = Math.min(100, Math.max(98, pCons + (Math.random() - 0.5) * 0.1));
            setGasPrice(pGas => {
              const nextGas = Math.max(10, Math.min(60, pGas + (Math.random() - 0.5) > 0 ? 1 : -1));
              
              setTicks(pTicks => {
                const nextTicks = [...pTicks, {
                  blockHeight: newBlockNum,
                  timestamp,
                  gasPrice: nextGas,
                  consensusRate: nextCons,
                  volumeDelta,
                  totalVolume: nextVal
                }].slice(-100);
                return nextTicks;
              });

              return nextGas;
            });
            return nextCons;
          });
          return nextVal;
        });

      } else {
        // 2. Spawn a transaction flow node connected from/to temporary wallet addresses!
        const txNum = Math.floor(Math.random() * 100000);
        const randVal = (Math.random() * 450 + 1).toFixed(2);
        const walletId = `addr_rnd_${Math.floor(Math.random()*20)}`;
        const txId = `tx_${txNum}`;

        setNodes(prev => {
          const updated = [...prev];
          // Check if dynamic wallet exists
          const walletExists = updated.some(n => n.id === walletId);
          if (!walletExists) {
            updated.push({
              id: walletId,
              label: `Account 0x${txNum.toString(16)}`,
              type: 'wallet',
              val: 10,
              color: '#38BDF8',
              details: { desc: 'AetherOS network active external account' }
            });
          }

          // Add transaction payload node
          updated.push({
            id: txId,
            label: `Tx ${randVal} AETH`,
            type: 'transaction',
            val: 8,
            color: '#EC4899',
            details: {
              hash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
              amount: `${randVal} AETH`,
              sender: walletId,
              recipient: 'addr_central',
              timestamp: new Date().toISOString()
            }
          });

          return updated;
        });

        setLinks(prev => {
          const updated = [...prev];
          // Connect wallet with tx, and tx with core central liquidity vaults/blocks
          updated.push(
            { id: `tx_flow_1_${txId}`, source: walletId, target: txId, type: 'transfer', value: 0.8 },
            { id: `tx_flow_2_${txId}`, source: txId, target: 'addr_central', type: 'transfer', value: 0.8 }
          );
          return updated;
        });

        const timeStr = new Date().toLocaleTimeString();
        setLogs(prev => [
          { id: String(Date.now()), text: `Conducted Transfer of ${randVal} AETH from 0x${txNum.toString(16)}`, time: timeStr, type: 'info' },
          ...prev.slice(0, 15)
        ]);
        
        setTotalVolume(prev => prev + parseFloat(randVal));
      }

    }, simulationSpeed * 1000);

    return () => clearInterval(interval);
  }, [autoEmit, blockHeight, simulationSpeed, nodes]);

  // Clean graph simulation & data
  const handleClearGraph = () => {
    setSelectedNode(null);
    setNodes(prev => {
      // Keep only genesis, validators, and central reserves
      return prev.filter(n => n.type === 'genesis' || n.type === 'validator' || n.id === 'addr_central');
    });
    setLinks(prev => {
      // Keeps only sequential core links & resonance links mapping to validators
      return prev.filter(l => 
        (l.type === 'resonance' || l.type === 'validation') && 
        (l.source === 'v_sovereign' || l.target === 'genesis_block')
      );
    });
    setLogs(prev => [
      { id: String(Date.now()), text: 'Manifold pruned. Transient transaction history cleared.', time: new Date().toLocaleTimeString(), type: 'warn' },
      ...prev
    ]);
  };

  // Re-emit high energy force layout
  const handleQuantumCollapse = () => {
    setCollapseCount(prev => prev + 1);
    setLogs(prev => [
      { id: String(Date.now()), text: 'Quantum Collapse triggered. Recalibrating topological manifold forces.', time: new Date().toLocaleTimeString(), type: 'quantum' },
      ...prev
    ]);
  };

  // Manual transaction emitter
  const handleSimulateManualTx = () => {
    const customTxNum = Math.floor(Math.random() * 9999 + 1000);
    const customVal = (Math.random() * 1500 + 50).toFixed(2);
    const txId = `tx_manual_${customTxNum}`;

    setNodes(prev => [
      ...prev,
      {
        id: txId,
        label: `Manual Tx: ${customVal}`,
        type: 'transaction',
        val: 9,
        color: '#F43F5E',
        details: {
          hash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
          amount: `${customVal} AETH`,
          sender: 'addr_user',
          recipient: 'addr_central',
          timestamp: new Date().toISOString(),
          desc: 'Manual priority block conduction injection.'
        }
      }
    ]);

    setLinks(prev => [
      ...prev,
      { id: `tx_man_1_${txId}`, source: 'addr_user', target: txId, type: 'transfer', value: 1.0 },
      { id: `tx_man_2_${txId}`, source: txId, target: 'addr_central', type: 'transfer', value: 1.0 }
    ]);

    setLogs(prev => [
      { id: String(Date.now()), text: `⚡ Injecting MANUAL Transaction: ${customVal} AETH (High Priority)`, time: new Date().toLocaleTimeString(), type: 'quantum' },
      ...prev
    ]);
  };

  return (
    <div className="h-full flex flex-col bg-[#050508] text-gray-200 font-mono overflow-hidden">
      {/* Visual Header Grid Panel */}
      <div className="p-4 border-b-2 border-zinc-900 bg-[#020205] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 border-2 border-indigo-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Atom className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              QUANTUM LEDGER <span className="text-[9px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">REAL-TIME</span>
            </h2>
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">AetherOS Blockchain State transitions & resonance graph</p>
          </div>
        </div>

        {/* Live Ledger Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left py-1 px-4 bg-black/40 rounded-xl border border-zinc-900 w-full md:w-auto">
          <div>
            <span className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider block">HEIGHT</span>
            <span className="text-sm font-semibold text-indigo-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> #{blockHeight}
            </span>
          </div>
          <div>
            <span className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider block">VOLUME TRANSACTED</span>
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {totalVolume.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          </div>
          <div>
            <span className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider block">GAS COST</span>
            <span className="text-sm font-semibold text-amber-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> {gasPrice} Gwei
            </span>
          </div>
          <div>
            <span className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider block">CONSENSUS</span>
            <span className="text-sm font-semibold text-white flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> {consensusRate.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        {/* Left Sidebar Control Panel */}
        <div className="w-full xl:w-72 bg-[#020204] border-b xl:border-b-0 xl:border-r border-zinc-900 flex flex-col overflow-y-auto custom-scrollbar flex-shrink-0 p-5 space-y-6">
          
          {/* Node Search Bar */}
          <div className="space-y-2">
            <label className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">Search Ledger Nodes</label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="0x9a27f... or Block #"
                className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-xl text-xs font-medium placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                id="ledger_node_search"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[9px] text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-[8px] text-indigo-400">Filtering: Showing {filteredNodes.length} of {nodes.length} nodes</p>
            )}
          </div>

          <hr className="border-t border-zinc-900" />

          {/* Flow simulation rules */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Topology Physics
            </h3>

            {/* Slider 1: Charge Strength */}
            <div className="space-y-2">
              <div className="flex justify-between text-[9px]">
                <span className="text-zinc-500 uppercase tracking-widest">Node Repulsion</span>
                <span className="text-zinc-300 font-semibold">{Math.abs(chargeStrength)}</span>
              </div>
              <input 
                type="range"
                min="50"
                max="400"
                value={Math.abs(chargeStrength)}
                onChange={(e) => setChargeStrength(-Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                id="physics_repulsion_slider"
              />
            </div>

            {/* Slider 2: Link Distance */}
            <div className="space-y-2">
              <div className="flex justify-between text-[9px]">
                <span className="text-zinc-500 uppercase tracking-widest">Bridge Distance</span>
                <span className="text-zinc-300 font-semibold">{linkDistance}px</span>
              </div>
              <input 
                type="range"
                min="40"
                max="200"
                value={linkDistance}
                onChange={(e) => setLinkDistance(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                id="physics_distance_slider"
              />
            </div>

            {/* Slider 3: Center Gravity */}
            <div className="space-y-2">
              <div className="flex justify-between text-[9px]">
                <span className="text-zinc-500 uppercase tracking-widest">Center Gravity</span>
                <span className="text-zinc-300 font-semibold">{(gravityStrength * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range"
                min="1"
                max="80"
                value={gravityStrength * 100}
                onChange={(e) => setGravityStrength(Number(e.target.value) / 100)}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                id="physics_gravity_slider"
              />
            </div>
          </div>

          <hr className="border-t border-zinc-900" />

          {/* Real-time State Conduction Controllers */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-400" /> Flow Control
            </h3>

            {/* Dynamic Event generation speed */}
            <div className="space-y-2">
              <div className="flex justify-between text-[9px]">
                <span className="text-zinc-500 uppercase tracking-widest">Emmit Speed</span>
                <span className="text-zinc-300 font-semibold">{simulationSpeed.toFixed(1)}s</span>
              </div>
              <input 
                type="range"
                min="5"
                max="40"
                step="5"
                value={simulationSpeed * 10}
                onChange={(e) => setSimulationSpeed(Number(e.target.value) / 10)}
                disabled={!autoEmit}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-30"
                id="simulation_speed_slider"
              />
            </div>

            {/* Sim Speed Toggle states */}
            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={() => setAutoEmit(!autoEmit)}
                className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                  autoEmit 
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 hover:bg-indigo-600/25' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
                id="toggle_auto_simulation_btn"
              >
                {autoEmit ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Auto Sim: Active
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Auto Sim: Suspended
                  </>
                )}
              </button>

              <button 
                onClick={() => setParticleFlow(!particleFlow)}
                className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                  particleFlow 
                    ? 'bg-purple-600/10 border-purple-500/40 text-purple-400 hover:bg-purple-600/25' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
                id="toggle_flows_rendering_btn"
              >
                <Activity className="w-3.5 h-3.5" />
                {particleFlow ? 'Particles Flow: ON' : 'Particles Flow: OFF'}
              </button>
            </div>
          </div>

          <hr className="border-t border-zinc-900" />

          {/* Action Deck buttons */}
          <div className="space-y-2 pt-1">
            <button 
              onClick={handleSimulateManualTx}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase tracking-widest text-[9.5px] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              id="inject_manual_tx_btn"
            >
              <Zap className="w-3.5 h-3.5 fill-current" /> Conduct Tx
            </button>

            <button 
              onClick={handleQuantumCollapse}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[9.5px] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              id="quantum_collapse_layout_btn"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Collapse Manifold
            </button>

            <button 
              onClick={handleClearGraph}
              className="w-full py-2 px-4 bg-zinc-900 border border-zinc-800 hover:bg-red-950 hover:border-red-900/40 text-rose-400 font-bold uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-2 transition-all"
              id="purge_transient_nodes_btn"
            >
              <Trash2 className="w-3.5 h-3.5" /> Prune Graph
            </button>
          </div>

          {/* Dynamic Instructions */}
          <div className="mt-auto p-4 bg-indigo-950/10 border border-indigo-900/20 rounded-xl space-y-1.5 text-[8.5px] text-indigo-300 leading-relaxed">
            <div className="flex gap-1.5 items-start">
              <Info className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400 mt-0.5" />
              <div>
                <span className="font-bold block">INTERACTIVE MANIFOLD GUIDES:</span>
                • Drag nodes to fix and reform topological spaces.<br />
                • Pan with click & drag; zoom with scroll-wheel.<br />
                • Click any node to open advanced forensics.
              </div>
            </div>
          </div>

        </div>

        {/* Central Force Graph Canvas Workspace */}
        <div className="flex-1 bg-[#020204] relative flex flex-col min-w-0" ref={containerRef}>
          {/* Legend indicator badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-auto">
            {/* Tab switchers */}
            <div className="flex bg-black/80 border border-zinc-800 rounded-lg p-0.5 mr-2 backdrop-blur-sm pointer-events-auto">
              <button
                onClick={() => setActiveTab('GRAPH')}
                className={`px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded ${
                  activeTab === 'GRAPH'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                id="active_tab_graph_btn"
              >
                Interactive Manifold
              </button>
              <button
                onClick={() => setActiveTab('DASHBOARD')}
                className={`px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded ${
                  activeTab === 'DASHBOARD'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                id="active_tab_dashboard_btn"
              >
                Telemetry Dashboard
              </button>
            </div>

            {activeTab === 'GRAPH' && [
              { label: 'Genesis Block', color: 'bg-indigo-500' },
              { label: 'Validator Seat', color: 'bg-red-500' },
              { label: 'Chain Block', color: 'bg-blue-400' },
              { label: 'Account Address', color: 'bg-sky-400' },
              { label: 'Cash Transfer', color: 'bg-pink-500' },
            ].map(l => (
              <div key={l.label} className="px-2.5 py-1 bg-black/80 border border-zinc-900 rounded-full flex items-center gap-1.5 text-[8px] font-bold text-zinc-400 uppercase tracking-wider backdrop-blur-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>

          <div className="absolute top-4 right-4 z-10">
            <div className="px-3 py-1 bg-black/80 border border-zinc-900 rounded-lg text-[8.5px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              {activeTab === 'GRAPH' ? 'TOPOLOGY SPACE STABLE' : 'TELEMETRY PULSE STABLE'}
            </div>
          </div>

          {/* D3 canvas SVG / Dashboard */}
          {activeTab === 'GRAPH' ? (
            <svg 
              ref={svgRef} 
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            />
          ) : (
            <div className="flex-1 min-h-[400px] w-full pt-16">
              <QuantumLedgerDashboard />
            </div>
          )}

          {/* Overlay state indicator for hovered nodes */}
          <AnimatePresence>
            {hoveredNode && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-6 left-6 z-20 p-4 bg-zinc-950/90 border-2 border-indigo-500/30 rounded-2xl w-72 backdrop-blur-md shadow-2xl pointer-events-none"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[7.5px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{hoveredNode.type}</span>
                  <span className="text-[7.5px] font-semibold text-zinc-500">{hoveredNode.id}</span>
                </div>
                <h4 className="font-semibold text-white text-xs">{hoveredNode.label}</h4>
                <p className="text-[9px] text-zinc-400 italic mt-1 font-mono line-clamp-2">
                  {hoveredNode.details.desc || 'No static summary info available for this conduction address.'}
                </p>
                {hoveredNode.details.hash && (
                  <div className="mt-2 pt-2 border-t border-zinc-900 text-[8px] text-zinc-500 font-mono truncate">
                    HASH: {hoveredNode.details.hash}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar Inspection & Audits Deck */}
        <div className="w-full xl:w-96 bg-[#020204] border-t xl:border-t-0 xl:border-l border-zinc-900 flex flex-col overflow-hidden flex-shrink-0">
          
          {/* Inspection Panel Header */}
          <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-black/40">
            <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" /> Active Inspector
            </h3>
            {selectedNode && (
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-[9px] font-bold text-zinc-500 hover:text-white uppercase transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div 
                  key={selectedNode.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[8px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full font-black tracking-widest uppercase mb-1.5 inline-block">
                        {selectedNode.type}
                      </span>
                      <h4 className="text-lg font-bold text-white tracking-tight">{selectedNode.label}</h4>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full shadow-[0_0_8px_currentColor] animate-pulse" 
                      style={{ color: selectedNode.color }}
                    />
                  </div>

                  {/* Core detail indices key-values */}
                  <div className="space-y-2.5">
                    {/* Hash Index */}
                    {selectedNode.details.hash && (
                      <div className="p-3 bg-black border border-zinc-900 rounded-xl space-y-1">
                        <span className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-widest">Manifold Hash Key</span>
                        <div className="text-[9.5px] text-indigo-400 break-all font-mono font-medium leading-relaxed">
                          {selectedNode.details.hash}
                        </div>
                      </div>
                    )}

                    {/* Description or details */}
                    <div className="p-3 bg-black border border-zinc-900 rounded-xl space-y-1">
                      <span className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-widest">Metadata summary</span>
                      <p className="text-[10px] text-zinc-300 leading-normal italic">
                        "{selectedNode.details.desc || 'Active volatile connection on AetherOS blockchain.'}"
                      </p>
                    </div>

                    {/* Custom properties grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {selectedNode.details.height !== undefined && (
                        <div className="p-3 bg-black border border-zinc-900 rounded-xl">
                          <span className="text-[7px] text-zinc-500 font-bold block mb-0.5 uppercase tracking-widest">Block Height</span>
                          <span className="text-xs font-semibold text-white">#{selectedNode.details.height}</span>
                        </div>
                      )}
                      
                      {selectedNode.details.amount && (
                        <div className="p-3 bg-black border border-zinc-900 rounded-xl">
                          <span className="text-[7px] text-zinc-500 font-bold block mb-0.5 uppercase tracking-widest">Flow Value</span>
                          <span className="text-xs font-semibold text-emerald-400">{selectedNode.details.amount}</span>
                        </div>
                      )}

                      {selectedNode.details.gas && (
                        <div className="p-3 bg-black border border-zinc-900 rounded-xl">
                          <span className="text-[7px] text-zinc-500 font-bold block mb-0.5 uppercase tracking-widest">Gas Limit</span>
                          <span className="text-xs font-semibold text-amber-500">{selectedNode.details.gas}</span>
                        </div>
                      )}

                      {selectedNode.details.timestamp && (
                        <div className="p-3 bg-black border border-zinc-900 rounded-xl">
                          <span className="text-[7px] text-zinc-500 font-bold block mb-0.5 uppercase tracking-widest">Timestamp</span>
                          <span className="text-[9px] font-semibold text-zinc-300 truncate block">
                            {new Date(selectedNode.details.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      )}

                      {selectedNode.details.sender && (
                        <div className="p-3 bg-black border border-zinc-900 rounded-xl overflow-hidden">
                          <span className="text-[7px] text-zinc-500 font-bold block mb-0.5 uppercase tracking-widest">Sender Address</span>
                          <span className="text-[9.5px] text-zinc-400 font-mono font-medium truncate block">
                            {selectedNode.details.sender}
                          </span>
                        </div>
                      )}

                      {selectedNode.details.recipient && (
                        <div className="p-3 bg-black border border-zinc-900 rounded-xl overflow-hidden">
                          <span className="text-[7px] text-zinc-500 font-bold block mb-0.5 uppercase tracking-widest">Recipient</span>
                          <span className="text-[9.5px] text-zinc-400 font-mono font-medium truncate block">
                            {selectedNode.details.recipient}
                          </span>
                        </div>
                      )}

                      {selectedNode.details.load && (
                        <div className="p-3 bg-black border border-zinc-900 rounded-xl">
                          <span className="text-[7px] text-zinc-500 font-bold block mb-0.5 uppercase tracking-widest">Validator Load</span>
                          <span className="text-xs font-semibold text-indigo-400">{selectedNode.details.load}</span>
                        </div>
                      )}

                      {selectedNode.details.resonance && (
                        <div className="p-3 bg-black border border-zinc-900 rounded-xl">
                          <span className="text-[7px] text-zinc-500 font-bold block mb-0.5 uppercase tracking-widest">Resonance Coefficient</span>
                          <span className="text-xs font-semibold text-purple-400">{selectedNode.details.resonance}</span>
                        </div>
                      )}
                    </div>
                    
                    {selectedNode.type === 'validator' && (
                      <div className="p-4 bg-indigo-950/10 border border-indigo-900/30 rounded-2xl flex items-center gap-3">
                        <Shield className="w-5 h-5 text-indigo-400" />
                        <div>
                          <p className="text-[9px] text-zinc-300 font-bold uppercase">Consensus Verification Authorized</p>
                          <p className="text-[8px] text-zinc-500 italic mt-0.5">Participating extensively in real-time block validation processes.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty-inspector"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center opacity-40 text-center py-12"
                >
                  <Info className="w-10 h-10 mb-3 text-zinc-600" />
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Inspect Ledger Nodes</p>
                  <p className="text-[8.5px] text-zinc-600 italic mt-1 max-w-[200px]">
                    Click any node inside the force-directed graph to inspect transaction parameters.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <hr className="border-t border-zinc-900" />

            {/* Dynamic Real-Time transaction feed log */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black tracking-widest text-zinc-400 uppercase flex items-center justify-between">
                <span>Forensic Conduction Stream</span>
                <span className="text-[7.5px] bg-black text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded uppercase tracking-normal">Listening</span>
              </h4>

              <div className="bg-black/50 border border-zinc-900 rounded-2xl p-4 h-64 overflow-y-auto custom-scrollbar space-y-3 font-mono">
                {logs.map((log) => (
                  <div key={log.id} className="text-[9.5px] leading-relaxed border-b border-zinc-950 pb-2 flex items-start gap-1.5">
                    <span className="text-zinc-600 text-[8px] mt-0.5 select-none">{log.time}</span>
                    <div className="flex-1">
                      {log.type === 'success' && <span className="text-emerald-500 font-bold block uppercase text-[7.5px] tracking-wider mb-0.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> BLOCK CONFIRMED</span>}
                      {log.type === 'warn' && <span className="text-amber-500 font-bold block uppercase text-[7.5px] tracking-wider mb-0.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> STATE PRUNED</span>}
                      {log.type === 'quantum' && <span className="text-indigo-400 font-bold block uppercase text-[7.5px] tracking-wider mb-0.5 flex items-center gap-1"><Atom className="w-3 h-3" /> QUANTUM INJECTION</span>}
                      <p className={
                        log.type === 'success' ? 'text-zinc-200' :
                        log.type === 'warn' ? 'text-zinc-400' :
                        log.type === 'quantum' ? 'text-indigo-200' : 'text-zinc-400'
                      }>
                        {log.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar Footer Status */}
          <div className="p-4 border-t border-zinc-900 bg-black text-center text-[7.5px] text-zinc-500 uppercase tracking-widest">
            Audit protocol 0x03E2-Active | Stride Parity 100%
          </div>

        </div>
      </div>
    </div>
  );
};
