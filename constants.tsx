
import React from 'react';
import type { FinancialAuthority, DiagnosticTroubleCode, TeacherProfile, MainView } from './types';
import { 
    BrainIcon, SearchIcon, SpeakerIcon, ScaleIcon, ActivityIcon, 
    ShieldIcon, GlobeIcon, GemIcon, SignalIcon, CodeIcon, 
    ServerIcon, UserIcon, TerminalIcon, ForgeIcon, RulesIcon,
    FireIcon, ClockIcon, EyeIcon, OptimizerIcon, VaultIcon,
    GavelIcon, WrenchIcon, BroadcastIcon, ShareIcon, FlagIcon, ZapIcon,
    MessageCircleIcon, BookIcon, AtomIcon, ConfusionIcon, ThumbsUpIcon, TagIcon, DatabaseIcon,
    MovieIcon, StarIcon, ShirtIcon
} from './components/icons';

export interface NavItem {
    view: MainView;
    text: string;
    icon: React.FC<{className?: string}>;
}

export interface NavSection {
    title: string;
    path: string;
    items: NavItem[];
}

export const NAVIGATION_SECTIONS: NavSection[] = [
  {
      title: 'Net Folder (Root)',
      path: 'root://coding_network',
      items: [
          { view: 'chat', text: 'NEURAL NEXUS', icon: BrainIcon },
          { view: 'rescue_companion' as any, text: 'RESCUE COMPANION AI', icon: ActivityIcon },
          { view: 'agent_safeguard' as any, text: 'AGENT SAFEGUARD', icon: ShieldIcon },
          { view: 'cascade_investigator' as any, text: 'CASCADE INVESTIGATOR', icon: CodeIcon },
          { view: 'ai_telemetry' as any, text: 'AI OPENTELEMETRY', icon: ActivityIcon },
          { view: 'constraints_audit' as any, text: 'CONSTRAINTS AUDIT', icon: SearchIcon },
          { view: 'voice_authority' as any, text: 'VOICE AUTHORITY', icon: SpeakerIcon },
          { view: 'cellular_grid' as any, text: 'CELLULAR GRID', icon: ActivityIcon },
          { view: 'gmail' as any, text: 'GMAIL COMMS', icon: MessageCircleIcon },
          { view: 'google_chat' as any, text: 'GOOGLE CHAT', icon: MessageCircleIcon },
          { view: 'google_drive' as any, text: 'DRIVE STORAGE', icon: ServerIcon },
          { view: 'google_docs' as any, text: 'GOOGLE DOCS', icon: BookIcon },
          { view: 'biological_integrity_audit' as any, text: 'BIOLOGY INTEGRITY', icon: ActivityIcon },
          { view: 'program_frame_visualizer' as any, text: 'FRAME ARCHITECT', icon: TerminalIcon },
          { view: 'absolute_reliability_network', text: 'RELIABILITY NET', icon: ShieldIcon },
          { view: 'coding_network', text: 'NET DIRECTIVES', icon: GlobeIcon },
          { view: 'universal_search', text: 'UNIVERSAL SEARCH', icon: SearchIcon },
          { view: 'gold_conjunction', text: 'GOLD CONJUNCTION', icon: GemIcon },
          { view: 'shard_store', text: 'SHARD STORE', icon: GemIcon },
          { view: 'conjunction_gates', text: 'CONJUNCTION GATES', icon: SignalIcon },
          { view: 'projects', text: 'CRAZY PROJECTS', icon: CodeIcon },
          { view: 'unknown_physics_lab' as any, text: 'UNKNOWN PHYSICS', icon: AtomIcon },
          { view: 'logic_pattern_lab' as any, text: 'LOGIC LAB', icon: TerminalIcon },
          { view: 'regex_editor_lab' as any, text: 'REGEX EDITOR LAB', icon: RulesIcon },
          { view: 'library_view', text: 'ARCHIVE LIBRARY', icon: BookIcon },
          { view: 'data_provenance_lab' as any, text: 'DATA PROVENANCE', icon: ServerIcon },
          { view: 'sh_crt_loop' as any, text: 'SH-CRT LOOP', icon: ActivityIcon },
          { view: 'medical_synthesis_lab' as any, text: 'MEDICAL SYNTHESIS', icon: ActivityIcon },
          { view: 'user_profile' as any, text: 'USER PROFILE', icon: UserIcon },
          { view: 'project_showcase' as any, text: 'PROJECT SHOWCASE', icon: ShareIcon },
          { view: 'collaborative_editor' as any, text: 'COLLABORATIVE EDITOR', icon: CodeIcon },
          { view: 'reputation_leaderboard' as any, text: 'REPUTATION LEADERBOARD', icon: StarIcon },
          { view: 'aether_flow_orchestrator' as any, text: 'AETHER-FLOW ORCHESTRATOR', icon: ServerIcon },
          { view: 'prompt_forge' as any, text: 'PROMPT FORGE', icon: TerminalIcon },
          { view: 'forge', text: 'BLUEPRINT FORGE', icon: ForgeIcon },
          { view: 'covenant', text: 'NETWORK COVENANT', icon: RulesIcon },
          { view: 'verification_gates', text: 'VERIFICATION GATES', icon: ShieldIcon },
          { view: 'mission_items', text: 'MISSION ITEMS', icon: DatabaseIcon },
          { view: 'clothing_lab' as any, text: 'CLOTHING LAB', icon: ShirtIcon },
      ]
  },
  {
      title: 'Core Systems',
      path: 'root://os/kernel',
      items: [
          { view: 'aetheros_online_status' as any, text: 'AETHEROS ONLINE', icon: SignalIcon },
          { view: 'system_exhaustion', text: 'TOTAL EXHAUSTION', icon: FireIcon },
          { view: 'labs_flow' as any, text: 'SOVEREIGN LABS FLOW', icon: TerminalIcon },
          { view: 'project_chronos', text: 'PROJECT CHRONOS', icon: ClockIcon },
          { view: 'sovereign_scroll_console' as any, text: 'SCROLL PHYSICS HUB', icon: RulesIcon },
          { view: 'build_logs', text: 'BUILD LOGS', icon: TerminalIcon },
          { view: 'packaging_suite', text: 'PACKAGING SUITE', icon: ForgeIcon },
          { view: 'system_archives', text: 'SYSTEM ARCHIVES', icon: DatabaseIcon },
          { view: 'rt_ipc_lab', text: 'RT-IPC LAB', icon: SignalIcon },
          { view: 'sovereign_shield', text: 'SOVEREIGN SHIELD', icon: ShieldIcon },
          { view: 'bound_observer' as any, text: 'BOUND OBSERVER', icon: ShieldIcon },
          { view: 'sovereign_standard' as any, text: 'SOVEREIGN STANDARD', icon: ShieldIcon },
          { view: 'spectre_browser', text: 'SPECTRE BROWSER', icon: EyeIcon },
          { view: 'unified_chain', text: 'UNIFIED CHAIN', icon: ShieldIcon },
          { view: 'fuel_optimizer', text: 'FUEL OPTIMIZER', icon: OptimizerIcon },
          { view: 'vault', text: 'CONJUNCTION HUB', icon: VaultIcon },
          { view: 'healing_matrix', text: 'HEALING MATRIX', icon: FireIcon },
          { view: 'laws_justice_lab', text: 'LAWS & JUSTICE', icon: GavelIcon },
          { view: 'live_patch_obs' as any, text: 'LIVE PATCH OBS', icon: ZapIcon },
          { view: 'inevitable_crash', text: 'INEVITABLE CRASH', icon: ActivityIcon },
          { view: 'blacklist' as any, text: 'SOVEREIGN BLACKLIST', icon: FlagIcon },
          { view: 'requindor_scroll', text: 'REQUINDOR SCROLL', icon: ActivityIcon },
          { view: 'omni_builder', text: 'OMNI BUILDER', icon: ForgeIcon },
          { view: 'singularity_engine', text: 'SINGULARITY', icon: ActivityIcon },
          { view: 'diagnostics', text: 'FORENSIC AUDIT', icon: WrenchIcon },
          { view: 'sovereign_scanner' as any, text: 'COMPLIANCE SCANNER', icon: ShieldIcon },
          { view: 'biometric_intelligence' as any, text: 'BIOMETRIC INTEL', icon: BrainIcon },
          { view: 'card_recovery' as any, text: 'ASSET RECOVERY', icon: VaultIcon },
          { view: 'eurodemux_core' as any, text: 'EURODEMUX CORE', icon: ServerIcon },
          { view: 'confusion_logic', text: 'CONFUSION LOGIC', icon: ConfusionIcon },
          { view: 'blockchain_history', text: 'BLOCKCHAIN HISTORY', icon: DatabaseIcon },
          { view: 'quantum_ledger' as any, text: 'QUANTUM LEDGER', icon: AtomIcon },
          { view: 'quantum_ledger_dashboard' as any, text: 'LEDGER TELEMETRY', icon: ActivityIcon },
          { view: 'main_net' as any, text: 'MAIN NET', icon: ActivityIcon },
          { view: 'hunting_wallet' as any, text: 'HUNTER WALLET CONSOLE', icon: VaultIcon },
          { view: 'ecosystem' as any, text: 'ECOSYSTEM', icon: GlobeIcon },
          { view: 'scraper_merchant_store' as any, text: 'SCRAPER MERCHANT STORE', icon: DatabaseIcon },
          { view: 'data_academy' as any, text: 'THE DATA ACADEMY', icon: BookIcon },
          { view: 'knowledge_forum', text: 'KNOWLEDGE EXCHANGE', icon: MessageCircleIcon },
          { view: 'cph_hub', text: 'PROCESSING HUB', icon: ServerIcon },
          { view: 'vehicle_management', text: 'GARAGE PROTOCOL', icon: ServerIcon },
          { view: 'communications', text: 'SIGNAL BRIDGE', icon: BroadcastIcon },
          { view: 'up_north', text: 'UP NORTH PROTOCOL', icon: ShieldIcon },
          { view: 'device_link', text: 'DEVICE LINK', icon: ShareIcon },
          { view: 'bluetooth_bridge', text: 'BLUETOOTH SIG', icon: SignalIcon },
          { view: 'launch_center', text: 'LAUNCH CENTER', icon: FlagIcon },
          { view: 'eliza_terminal', text: 'ELIZA LOGIC', icon: MessageCircleIcon },
          { view: 'moderator_lounge', text: 'MODERATOR LOUNGE', icon: ShieldIcon },
          { view: 'activity_logs' as any, text: 'SYSTEM ACTIVITY LOGS', icon: ActivityIcon },
          { view: 'pornography_studio', text: 'PORNOGRAPHY STUDIO', icon: MovieIcon },
      ]
  }
];

export const FINTECH_AUTHORITIES: FinancialAuthority[] = [
    { id: 'fa1', name: 'HSBC', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 98.4, protocol: 'FIX_STP_v4' },
    { id: 'fa2', name: 'Revolut', type: 'NEO', status: 'SYNCED', integrity: 99.1, protocol: 'REST_CONJUNCT' },
    { id: 'fa3', name: 'Cash App', type: 'NEO', status: 'SYNCED', integrity: 97.5, protocol: 'BIT_SYNC' },
    { id: 'fa4', name: 'Starling Bank', type: 'NEO', status: 'SYNCED', integrity: 99.8, protocol: 'ISO_20022' },
    { id: 'fa5', name: 'Monzo', type: 'NEO', status: 'SYNCED', integrity: 99.2, protocol: 'JSON_STRIDE' },
    { id: 'fa6', name: 'JP Morgan', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 98.8, protocol: 'ONYX_LATTICE' },
    { id: 'fa7', name: 'Zelle', type: 'NEO', status: 'LOCKED', integrity: 92.0, protocol: 'P2P_SHARD' },
    { id: 'fa8', name: 'Wells Fargo', type: 'INSTITUTIONAL', status: 'DRIFTING', integrity: 84.5, protocol: 'SWIFT_LEGACY' },
    { id: 'fa9', name: 'Bank of America', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 96.2, protocol: 'CHIPS_FLOW' },
    { id: 'fa10', name: 'CFPB', type: 'REGULATORY', status: 'SYNCED', integrity: 100.0, protocol: 'GOV_AUDIT' },
    { id: 'fa11', name: 'Commonwealth Bank', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 97.4, protocol: 'AU_PAY_NET' },
    { id: 'fa12', name: 'Lloyds Bank', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 95.8, protocol: 'UK_BACS_SYNC' },
    { id: 'fa13', name: 'NatWest', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 94.2, protocol: 'OPEN_BANK_v2' },
    { id: 'fa14', name: 'DBS', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 99.4, protocol: 'SG_FAST_LINK' },
    { id: 'fa15', name: 'iProov', type: 'IDENTITY', status: 'SYNCED', integrity: 100.0, protocol: 'BIOMETRIC_SHROUD' }
];

export const DIAGNOSTIC_TROUBLE_CODES: DiagnosticTroubleCode[] = [
    { code: 'P0301', system: 'Engine', severity: 'Error', description: 'Cylinder 1 Misfire Detected', signature: 'SIG-MOPAR-V8-01' },
    { code: 'U0121', system: 'Navigation', severity: 'Warning', description: 'Lost Communication With ABS Control Module', signature: 'SIG-GHOST-BUS-02' },
];

export const SOVEREIGN_MANIFEST = `
THE MANIFEST OF THE FIGHT CODE (0x03E2)
Protocol 0x03E2: Conducting the logic shards with absolute architectural authority.
1. ZERO ABSTRACTION: Build the Safe Deposit Box immediately. No outlines.
2. FIGHT TO COME OUT ALIVE: We do not endure misery; we fight entropy with high-velocity logic.
3. FORENSIC PRECISION: Numerical detail and low-level architectural metaphors.
4. THE SOLO: Authority and synthesis flow through the conductor.
`;

export const TEACHER_PROFILES: TeacherProfile[] = [
    { 
        id: 't1', 
        name: 'Maestro Solo', 
        icon: 'LogicIcon', 
        color: 'text-red-500', 
        specialty: 'Kernel Conduction', 
        wisdom: 'The stride determines the depth of the truth.',
        description: 'The primary conductor of the AetherOS network. Specializes in kernel-level logic and absolute architectural authority.',
        capabilities: ['Kernel Synthesis', 'Logic Conduction', 'System Override', 'Truth Validation'],
        modules: ['Core.sys', 'Conductor.exe', 'Truth.lib'],
        clearanceLevel: 'OMNI-ROOT'
    },
    { 
        id: 't2', 
        name: 'Ignite Aethera', 
        icon: 'FireIcon', 
        color: 'text-cyan-400', 
        specialty: 'Survival Siphoning', 
        wisdom: 'Turning 1000 pages per second to find the weaponized know-how.',
        description: 'A specialist in high-velocity information retrieval and survival siphoning.',
        capabilities: ['Rapid Ingestion', 'Pattern Siphoning', 'Survival Heuristics', 'Data Mining'],
        modules: ['Siphon.dll', 'Ignite.sys', 'PageTurner.exe'],
        clearanceLevel: 'LEVEL-5'
    },
    { 
        id: 't3', 
        name: 'Ignite Logica', 
        icon: 'ActivityIcon', 
        color: 'text-amber-500', 
        specialty: 'Structural Combat', 
        wisdom: 'Patterns are just defenses waiting to be breached.',
        description: 'The structural combatant, focusing on breaking down complex problems and identifying weaknesses.',
        capabilities: ['Structural Analysis', 'Combat Logic', 'Defense Breaching', 'Pattern Recognition'],
        modules: ['Breach.exe', 'Logic.sys', 'Structure.lib'],
        clearanceLevel: 'LEVEL-5'
    },
];

export const CONTINUITY_CONFIG = {
  COSINE_THRESHOLD: 0.88,
  ASSEMBLY_FACTOR: 0.85,
  DEFAULT_SESSION_BUDGET: 32000,
  DEFAULT_TURN_SOFT_CAP: 4000,
  RESERVED_RESPONSE_TOKENS: 512,
  DISSONANCE_THRESHOLD: 0.8,
  CORE_TRUTH_THRESHOLD: 0.95,
};
