import type { MainView, SystemStatus, UserProfile } from '../types';

export interface RegexRule {
  id: string;
  pattern: string;
  response: string;
  intent: string;
  isActive: boolean;
  matchCount: number;
}

export interface AetherOSComponent {
  id: string;
  name: string;
  description: string;
  filePath: string;
  keywords: string[];
  category: string;
}

export interface JesterPersonaState {
  level: number;
  title: string;
  intensity: 'Soft' | 'Playful' | 'Theatrical' | 'Spectacular';
  description: string;
  uniquenessScore: number;
}

export interface JesterCompanionProps {
  currentView: MainView;
  systemStatus: SystemStatus;
  bootLogs: string[];
  profile?: UserProfile;
  onUpdateProfile?: (updates: any) => void;
  onUpdateSystemStatus?: (system: keyof SystemStatus, state: 'OK' | 'Warning' | 'Error') => void;
  acousticPressure?: number;
  isAcousticWarningOpen?: boolean;
}

export const aetherOSComponents: AetherOSComponent[] = [
  {
    id: 'absolute_reliability_network',
    name: 'Absolute Reliability Network',
    description: 'Tracks redundant database states, cluster heartbeats, active node uptime, and automatic failovers in the AetherOS cloud infrastructure.',
    filePath: '/components/AbsoluteReliabilityNetwork.tsx',
    keywords: ['reliability', 'redundancy', 'uptime', 'failover', 'integrity', 'network', 'heartbeat'],
    category: 'Network & Infrastructure'
  },
  {
    id: 'ai_telemetry',
    name: 'AI Telemetry Hub',
    description: 'Tracks prompt latency, input-output token quotas, model temperature drift, and active neural feedback weights.',
    filePath: '/components/AITelemetryView.tsx',
    keywords: ['telemetry', 'token', 'model', 'weights', 'latency', 'quota', 'inference'],
    category: 'Intelligence & Core'
  },
  {
    id: 'coding_network',
    name: 'Coding Network Engine',
    description: 'Synthesizes file structures, delegates architectural workflows to specialized sub-agents, and designs automated tasks.',
    filePath: '/components/CodingNetworkView.tsx',
    keywords: ['agent', 'delegate', 'synthesize', 'workflow', 'task', 'scaffold', 'code'],
    category: 'Developer Tools'
  },
  {
    id: 'universal_search',
    name: 'Universal Search Bridge',
    description: 'A lightning-fast file crawler, indexing repository metadata, schema declarations, and binary assets on standard descriptors.',
    filePath: '/components/UniversalSearchBridge.tsx',
    keywords: ['search', 'find', 'crawl', 'metadata', 'index', 'query', 'locate'],
    category: 'Developer Tools'
  },
  {
    id: 'gold_conjunction',
    name: 'Gold Conjunction Conduits',
    description: 'Monitors the rhythmic flow of conjunction points and gold dust accumulations across cosmic state pipelines.',
    filePath: '/components/GoldConjunction.tsx',
    keywords: ['gold', 'dust', 'conjunction', 'conduit', 'flow', 'rhythm', 'pipeline'],
    category: 'Cosmic & Rhythms'
  },
  {
    id: 'shard_store',
    name: 'Shard Store',
    description: 'Allows upgrading companion traits, purchasing interactive booster packs, and igniting sister nodes under stride surges.',
    filePath: '/components/ShardStoreView.tsx',
    keywords: ['store', 'shard', 'purchase', 'ignite', 'sister', 'surge', 'upgrade'],
    category: 'Cosmic & Rhythms'
  },
  {
    id: 'conjunction_gates',
    name: 'Conjunction Gates',
    description: 'Visualizes low-level Boolean logical gate pipelines processing raw data into highly-filtered system logs.',
    filePath: '/components/ConjunctionGatesView.tsx',
    keywords: ['gate', 'boolean', 'and', 'or', 'xor', 'not', 'logical', 'pipeline'],
    category: 'Developer Tools'
  },
  {
    id: 'projects',
    name: 'Projects Dashboard',
    description: 'Manages user-authored project blueprints, tracks daily active tasks, and lists milestones.',
    filePath: '/components/ProjectsView.tsx',
    keywords: ['project', 'blueprint', 'todo', 'task', 'milestone', 'board', 'kanban'],
    category: 'Management'
  },
  {
    id: 'forge',
    name: 'Evo Forge',
    description: 'A playground for crafting and evolving high-dimensional prompts used in Gemini and Claude context templates.',
    filePath: '/components/ForgeView.tsx',
    keywords: ['forge', 'prompt', 'evolve', 'template', 'craft', 'evolution', 'evo'],
    category: 'Intelligence & Core'
  },
  {
    id: 'covenant',
    name: 'Network Covenant Standards',
    description: 'Defines the behavioral rules of conduct, security parameters, and communication guidelines.',
    filePath: '/components/NetworkCovenant.tsx',
    keywords: ['covenant', 'rule', 'conduct', 'standard', 'contract', 'agreement', 'protocol'],
    category: 'Network & Infrastructure'
  },
  {
    id: 'verification_gates',
    name: 'Verification Gates',
    description: 'Validates code commits, measures test coverage percentage, and enforces compliance checks before system builds.',
    filePath: '/components/VerificationGatesView.tsx',
    keywords: ['verification', 'test', 'coverage', 'validate', 'commit', 'compliance', 'gate'],
    category: 'Developer Tools'
  },
  {
    id: 'project_chronos',
    name: 'Chronos Dashboard',
    description: 'Provides advanced temporal alignment, listing daily work cycles and time metrics.',
    filePath: '/components/ChronosDashboard.tsx',
    keywords: ['chronos', 'time', 'temporal', 'cycle', 'clock', 'duration', 'timeline'],
    category: 'Management'
  },
  {
    id: 'build_logs',
    name: 'Build Logs Inspector',
    description: 'Renders build events, hot module replacement warnings, and live compiler compilation results.',
    filePath: '/components/BuildLogsView.tsx',
    keywords: ['build', 'compile', 'log', 'warning', 'compiler', 'npm', 'vite'],
    category: 'Developer Tools'
  },
  {
    id: 'rt_ipc_lab',
    name: 'RT IPC Pipe Lab',
    description: 'Real-time Inter-Process Communication simulator, visualizing secure socket endpoints and raw packet transfers.',
    filePath: '/components/RTIPCLabView.tsx',
    keywords: ['ipc', 'pipe', 'socket', 'packet', 'transfer', 'stream', 'endpoint'],
    category: 'Network & Infrastructure'
  },
  {
    id: 'sovereign_shield',
    name: 'Sovereign Core Shield',
    description: 'The premier defensive firewall, routing potential security threats, auditing system vulnerabilities, and deploying live patches.',
    filePath: '/components/SovereignShieldView.tsx',
    keywords: ['shield', 'defense', 'firewall', 'threat', 'vulnerability', 'patch', 'security'],
    category: 'Security'
  },
  {
    id: 'spectre_browser',
    name: 'Spectre Hidden Portal',
    description: 'A sandboxed proxy explorer used to scan hidden repositories and fetch external codebases safely.',
    filePath: '/components/SpectreBrowserView.tsx',
    keywords: ['spectre', 'portal', 'proxy', 'browser', 'sandbox', 'external', 'fetch'],
    category: 'Security'
  },
  {
    id: 'unified_chain',
    name: 'Unified Chain Visualizer',
    description: 'Visualizes decentralized block creations, computing ledger state validations, and transaction integrity checks.',
    filePath: '/components/UnifiedChainView.tsx',
    keywords: ['chain', 'block', 'blockchain', 'ledger', 'transaction', 'hash', 'validate'],
    category: 'Fintech & Ledgers'
  },
  {
    id: 'fuel_optimizer',
    name: 'Fuel Efficiency Optimizer',
    description: 'Maintains system CPU usage levels, schedules garbage collections, and optimizes memory allocation trees.',
    filePath: '/components/FuelEfficiencyOptimizer.tsx',
    keywords: ['fuel', 'optimizer', 'cpu', 'memory', 'garbage', 'efficiency', 'allocation'],
    category: 'Network & Infrastructure'
  },
  {
    id: 'vault',
    name: 'Operations Vault',
    description: 'Stores private credentials, manages tailscale VPN networks, and locks down sensitive file archives.',
    filePath: '/components/OperationsVault.tsx',
    keywords: ['vault', 'credential', 'vpn', 'tailscale', 'archive', 'encrypt', 'private'],
    category: 'Security'
  },
  {
    id: 'healing_matrix',
    name: 'Self-Healing Matrix',
    description: 'A revolutionary CRT monitor that scans the codebase for logic anomalies, compiles repairs, and deploys patches in real-time.',
    filePath: '/components/HealingMatrix.tsx',
    keywords: ['heal', 'matrix', 'anomaly', 'repair', 'patch', 'logic', 'crt'],
    category: 'Security'
  },
  {
    id: 'laws_justice_lab',
    name: 'Laws & Justice Compliance Lab',
    description: 'Tracks international data regulations, checks license permissions, and audits policy agreements.',
    filePath: '/components/LawsJusticeLabView.tsx',
    keywords: ['law', 'justice', 'regulatory', 'policy', 'agreement', 'license', 'compliance'],
    category: 'Management'
  },
  {
    id: 'omni_builder',
    name: 'Omni Workspace Builder',
    description: 'Drag-and-drop structural design center, configuring screen hierarchies and layout definitions dynamically.',
    filePath: '/components/OmniBuilderUI.tsx',
    keywords: ['builder', 'omni', 'drag', 'layout', 'design', 'hierarchy', 'screen'],
    category: 'Developer Tools'
  },
  {
    id: 'singularity_engine',
    name: 'Singularity AI Engine',
    description: 'Fine-tunes vector embeddings, renders multidimensional clusters, and tracks neural pattern formations.',
    filePath: '/components/SingularityEngineView.tsx',
    keywords: ['singularity', 'embedding', 'vector', 'cluster', 'neural', 'dimension', 'model'],
    category: 'Intelligence & Core'
  },
  {
    id: 'diagnostics',
    name: 'Diagnostics Control Center',
    description: 'A dashboard checking hardware simulation limits, reporting cooling unit levels and sub-component stress levels.',
    filePath: '/components/DiagnosticsCenter.tsx',
    keywords: ['diagnostics', 'hardware', 'stress', 'cooling', 'fan', 'temperature', 'stress'],
    category: 'Network & Infrastructure'
  },
  {
    id: 'communications',
    name: 'Communications Hub',
    description: 'Simulates secure system channels, managing user messages, team routing protocols, and alerts.',
    filePath: '/components/CommunicationsView.tsx',
    keywords: ['communication', 'chat', 'channel', 'routing', 'alert', 'message', 'team'],
    category: 'Management'
  },
  {
    id: 'eliza_terminal',
    name: 'Retro Eliza Therapist',
    description: 'An natural language script parsing user questions into conversational therapeutic statements.',
    filePath: '/components/ElizaTerminal.tsx',
    keywords: ['eliza', 'retro', 'therapist', 'empathy', 'conversational', 'terminal', 'chat'],
    category: 'Intelligence & Core'
  },
  {
    id: 'code_fall_lab',
    name: 'Matrix Code Fall Lab',
    description: 'Visualizes character rain cascades, measuring canvas rendering speeds and visual sync rates.',
    filePath: '/components/CodeFallLabView.tsx',
    keywords: ['matrix', 'rain', 'cascade', 'character', 'render', 'canvas', 'sync'],
    category: 'Cosmic & Rhythms'
  },
  {
    id: 'amoeba_heritage',
    name: 'Amoeba Heritage Lab',
    description: 'A virtual biotope calculating genetic evolutions, cell division states, and life-cycle curves in cellular models.',
    filePath: '/components/AmoebaHeritageView.tsx',
    keywords: ['amoeba', 'cell', 'genetic', 'division', 'biotope', 'heritage', 'biology'],
    category: 'Cosmic & Rhythms'
  },
  {
    id: 'inevitable_crash',
    name: 'Simulated Panic Handler',
    description: 'Simulates system dump diagnostics, capturing kernel panics and examining registers.',
    filePath: '/components/InevitableCrashView.tsx',
    keywords: ['crash', 'panic', 'kernel', 'dump', 'register', 'examine', 'simulate'],
    category: 'Developer Tools'
  },
  {
    id: 'aetheros_online_status',
    name: 'AetherOS Status Monitor',
    description: 'Tracks external server ingress routing, DNS responses, and network latency.',
    filePath: '/components/AetherosOnlineStatusView.tsx',
    keywords: ['online', 'status', 'dns', 'ingress', 'latency', 'routing', 'server'],
    category: 'Network & Infrastructure'
  }
];
