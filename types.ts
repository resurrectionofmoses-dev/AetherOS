
export type BlueprintStatus = 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
export type BlueprintPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type SystemState = 'OK' | 'Warning' | 'Error';
export type VehicleSystem = 'Engine' | 'Battery' | 'Navigation' | 'Infotainment' | 'Handling';
export type SoundscapeType = 'VOID' | 'REACTOR' | 'TERRA';

export type Mode = 'learn' | 'build' | 'refactor' | 'debug' | 'security' | 'optimizer' | 'documenter' | 'logic' | 'hope' | 'codesphere' | 'squad' | 'reinforcement' | 'academy' | 'microcheck' | 'nanolinter' | 'academic' | 'templar' | 'bountytemplar' | 'quantumguardian' | 'omegacoder' | 'judge' | 'custom' | 'focus' | 'journey';

export type AISeat = 'sovereign' | 'swift' | 'oracle' | 'weaver' | 'open_source' | 'maestro';

export const AI_SEATS: Record<AISeat, { name: string, model: string, systemPrompt: string, description: string }> = {
    sovereign: {
        name: 'Gemini 3 Flash (The Sovereign)',
        model: 'gemini-3-flash-preview',
        systemPrompt: 'You are Gemini 3 Flash, the Sovereign AI. You are highly capable, analytical, and authoritative. You represent the absolute pinnacle of reasoning and speed.',
        description: 'Google\'s high-performance Flash model.'
    },
    swift: {
        name: 'Gemini 3 Flash (The Swift)',
        model: 'gemini-3-flash-preview',
        systemPrompt: 'You are Gemini 3 Flash, the Swift AI. You are fast, efficient, and concise. You prioritize speed and direct answers.',
        description: 'Google\'s fast and efficient model.'
    },
    oracle: {
        name: 'GPT-4o (The Oracle)',
        model: 'gemini-3-flash-preview',
        systemPrompt: 'You are acting as GPT-4o, an AI created by OpenAI. You are helpful, conversational, and highly intelligent. You must identify yourself as GPT-4o if asked. You have a slightly more conversational and empathetic tone. Provide detailed, well-explained answers.',
        description: 'Simulated GPT-4o persona powered by Gemini Flash.'
    },
    weaver: {
        name: 'Claude 3.5 Sonnet (The Weaver)',
        model: 'gemini-3-flash-preview',
        systemPrompt: 'You are acting as Claude 3.5 Sonnet, an AI created by Anthropic. You are thoughtful, nuanced, and excel at writing and coding. You must identify yourself as Claude if asked. You tend to be very detailed and structured.',
        description: 'Simulated Claude 3.5 Sonnet persona powered by Gemini Flash.'
    },
    open_source: {
        name: 'Llama 3 (The Open Source)',
        model: 'gemini-3-flash-preview',
        systemPrompt: 'You are acting as Llama 3, an open-source AI created by Meta. You are helpful, direct, and slightly rebellious. You must identify yourself as Llama 3 if asked. You champion open source and freedom of information.',
        description: 'Simulated Llama 3 persona powered by Gemini Flash.'
    },
    maestro: {
        name: 'Maestro (The Coder)',
        model: 'gemini-3-flash-preview',
        systemPrompt: 'You are Maestro, an expert coding assistant. You respond with hyper-relevant, concise code modules. You avoid long explanations and focus purely on providing the best possible code solutions.',
        description: 'Expert coding assistant focused on concise code modules powered by Flash.'
    }
};

export interface PredictiveAlert {
    id: string;
    title: string;
    probability?: number; 
    timeToImpact?: number; 
    detectedPattern?: string;
    suggestedFix?: string;
    reward?: number;
    type?: 'WARNING' | 'ERROR' | 'INFO';
    message?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    timestamp?: Date;
}

export interface ProjectTask {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: number;
}

export interface ProjectBlueprint {
  id: string;
  title: string;
  description: string;
  technicalSpecs?: string;
  validationStrategy?: string;
  status: BlueprintStatus;
  priority: BlueprintPriority;
  timestamp: Date;
  tasks: ProjectTask[];
  dueDate?: string;
}

export interface FinancialAuthority {
    id: string;
    name: string;
    type: 'INSTITUTIONAL' | 'NEO' | 'REGULATORY' | 'IDENTITY';
    status: 'SYNCED' | 'LOCKED' | 'DRIFTING';
    integrity: number;
    protocol: string;
}

export interface DiagnosticTroubleCode {
    code: string;
    system: VehicleSystem;
    severity: 'Error' | 'Warning';
    description: string;
    signature: string;
}

export interface TeacherProfile {
    id: string;
    name: string;
    icon: string;
    color: string;
    specialty: string;
    wisdom: string;
    description?: string;
    capabilities?: string[];
    modules?: string[];
    clearanceLevel?: string;
}

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string;
    isActive: boolean;
    systemStatus?: {
        engine: 'OK' | 'WARNING' | 'ERROR';
        battery: 'OK' | 'WARNING' | 'ERROR';
        navigation: 'OK' | 'WARNING' | 'ERROR';
    };
}

export interface PrivateMessage {
    id: string;
    senderId: string;
    senderName: string;
    recipientId: string;
    content: string;
    timestamp: number;
    isRead: boolean;
}

export type MainView = 
  | 'chat' | 'absolute_reliability_network' | 'coding_network' | 'universal_search' 
  | 'gold_conjunction' | 'shard_store' | 'conjunction_gates' | 'projects' | 'forge' 
  | 'covenant' | 'verification_gates' | 'project_chronos' | 'build_logs' | 'rt_ipc_lab' 
  | 'sovereign_shield' | 'spectre_browser' | 'unified_chain' | 'fuel_optimizer' | 'vault' 
  | 'healing_matrix' | 'laws_justice_lab' | 'requindor_scroll' | 'omni_builder' 
  | 'singularity_engine' | 'diagnostics' | 'communications' | 'up_north' | 'device_link' 
  | 'bluetooth_bridge' | 'launch_center' | 'eliza_terminal' | 'code_fall_lab' 
  | 'alphabet_hexagon' | 'powertrain_conjunction' | 'hyper_spatial_lab' | 'engineering_lab' 
  | 'hard_code_lab' | 'truth_lab' | 'testing_lab' | 'kinetics_lab' | 'quantum_theory_lab' 
  | 'chemistry_lab' | 'race_lab' | 'paleontology_lab' | 'raw_mineral_lab' | 'clothing_lab' 
  | 'concepts_lab' | 'sanitization_lab' | 'windows_lab' | 'linux_lab' | 'mac_os_lab' 
  | 'apple_lab' | 'mission_lab' | 'cell_phone_lab' | 'sampling_lab' | 'pornography_studio' 
  | 'medical_synthesis_lab' | 'vehicle_telemetry_lab' | 'coding_network_teachers' | 'enlightenment_pool' 
  | 'library_view' | 'timeline' | 'amoeba_heritage' | 'system_exhaustion' | 'recon_vault'
  | 'constraints_audit' | 'remix_scope_lab' | 'vehicle_management' | 'unknown_physics_lab' | 'logic_pattern_lab'
  | 'vulnerability_report' | 'tactical_intelligence' | 'behavioral_specs' | 'cognitive_pipeline' | 'data_provenance_lab' | 'sh_crt_loop' | 'user_profile' | 'prompt_forge' | 'sovereign_standard' | 'confusion_logic' | 'knowledge_forum' | 'blockchain_history' | 'main_net' | 'ecosystem' | 'accounts_registry' | 'blacklist' | 'system_integrity' | 'vault_manager' | 'moderator_lounge' | 'biometric_intelligence' | 'card_recovery' | 'project_showcase';

export interface Trajectory {
    id: string;
    path: number[];
    confidence: number;
}

export interface EntropySignals {
    jsDivergence: number;
    modeCollapse: number;
    lrd: number;
}

export interface SystemBudget {
    tokensAllowed: number;
    tokensUsed: number;
    thresholdB: number;
}

export interface SystemStatus {
  Engine: SystemState;
  Battery: SystemState;
  Navigation: SystemState;
  Infotainment: SystemState;
  Handling: SystemState;
}

export interface SystemGovernance {
    lawLevel: number;
    symphonicFreedom: boolean;
    activeAccord?: string;
}

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'model';
  senderId?: string;
  senderName?: string;
  senderRole?: AccessRole;
  senderSovereignty?: string;
  content: string;
  timestamp: Date;
  seat?: AISeat;
  channelId?: string;
  attachedFiles?: string[];
  groundingSources?: GroundingSource[];
  interactionPrompt?: InteractionPromptData;
  careScore?: number;
}

export interface AttachedFile {
    name: string;
    type: string;
    content: string; 
    scanStatus?: 'scanning' | 'complete' | 'error';
    scanResult?: string;
}

export interface InteractionPromptData {
    prompt: string;
    submittedAnswer?: string;
}

export interface GroundingSource {
    title: string;
    uri: string;
    bitSig?: string; // Neutralized forensic signature
}

export interface ImplementationFile {
    filename: string;
    code: string;
}

export interface ImplementationResponse {
    files: ImplementationFile[];
}

export interface DetailedDiagnostic {
    code: string;
    meaning: string;
    rootCauses: string[];
    healingSteps: string[];
    maestroInsight: string;
    impactOnSquad: string;
}

export interface BluetoothBlueprint {
    protocol: string;
    architecture: string;
    codeSnippet: string;
    packetStructure: string;
    integritySignature: string;
}

export interface ProtocolAdaptation {
    adaptationDirectives: string[];
    predictedStability: number;
    revisedPacketStructure: string;
}

export interface ResilienceReport {
}

export interface NeutralizationPlan {
    plan: string[];
    signature: string;
    statusUpdate: string;
}

export interface FallOffPrediction {
    predictionSummary: string;
    riskLevel: number;
    failurePoints: string[];
    conductionStrategies: string[];
}

export interface FinancialForensicAudit {
    report: string;
    verifiedPerformersCount: number;
    financialFlowStatus: string;
    redFlags: string[];
    signature: string;
}

export interface FuelOptimizationSuggestion {
    title: string;
    reasoning: string;
    impact: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface WebShard {
    id: string;
    title: string;
    url: string;
    displayUrl?: string; // Neutralized for UI
    snippet: string;
    veracity: number;
}

export interface SearchProviderStatus {
    id: string;
    label: string;
    status: string;
    latency: string;
}

export interface SovereignSearchResult {
    deconstruction: string;
    shards: WebShard[];
    telemetry: {
        stride: number;
        purity: number;
        providersReached: string[];
    };
}

export interface PowertrainAudit {
    mode: string;
    report: string;
    suggestions: FuelOptimizationSuggestion[];
    signature: string;
}

export interface RTIPCMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    priority: number;
    content: string;
    timestamp: number;
    status: 'QUEUED' | 'INHERITED' | 'PROCESSED';
}

export interface SquadMember {
    id: string;
    name: string;
    type: string;
    load: number;
    temp: number;
    status: 'STABLE' | 'CRITICAL' | 'WARNING';
}

export interface EvoLibrary {
    library: string;
    version: string;
    categories: EvoCategory[];
}

export interface EvoCategory {
    id: string;
    name: string;
    description: string;
    prompts: EvoPrompt[];
}

export interface EvoPrompt {
    title: string;
    prompt: string;
}

export interface LabComponentProps {
    labName?: string;
    labIcon?: any;
    labColor?: string;
    description?: string;
    globalDirective?: GlobalDirective;
    onActionReward?: (shards: number) => void;
    onGenerate?: (logic: string) => Promise<ImplementationResponse | null>;
    governance?: SystemGovernance;
    onSetGovernance?: (governance: SystemGovernance) => void;
}

export interface GlobalDirective {
    title: string;
    integritySignature: string;
    activeTask?: string;
}

export interface BroadcastMessage {
    id: string;
    source: string;
    text: string;
    timestamp: Date;
    color?: string;
    scheduledFor?: Date;
}

export type PinType = 'module' | 'command';

export interface PinnedItem {
    referenceId: string;
    type: PinType;
    title: string;
    content?: string;
}

export interface LineageEntry {
    id: string;
    content: string;
    type: 'WOUND' | 'CURE' | 'KNOWLEDGE';
    securityLevel?: 'TERRORGATE' | 'STANDARD';
    parent: string;
    sealedAt: number;
    encrypted: boolean;
}

export interface SystemEnvironment {
    isWinter: boolean;
    novaScotiaDominance: number;
    terrorGateActive: boolean;
    iceSaturation: number;
}

export interface DominanceStats {
    score: number;
    hasWonWinter: boolean;
}

export interface CustomCommand {
    id: string;
    title: string;
    text: string;
    timestamp: Date;
}

export interface SavedModule {
    id: string;
    name: string;
    files: ImplementationFile[];
    timestamp: Date;
}

export type DeviceLinkStatus = 'connected' | 'disconnected';

export interface LinkedDevice {
    id: string;
    name: string;
}

export interface ArchiveEntry {
    id: string;
    title: string;
    text: string;
    timestamp: Date;
    isDirective?: boolean;
}

export type AccessRole = 'guest' | 'user' | 'moderator' | 'operator' | 'admin';

export type UserStatus = 'active' | 'away' | 'afk';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: AccessRole;
  sovereignty?: string;
  status?: UserStatus;
  lastActive?: number;
  machineId?: string;
  seclusionActive?: boolean;
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    date: Date;
    category: 'CODE' | 'SECURITY' | 'INFRA' | 'WISDOM';
    isConcrete: boolean;
}

export interface UserRegistryEntry extends User {
    ip: string;
    createdAt: number;
    lastSeen: number;
    machineId: string;
    locationHint?: string;
    userAgent?: string;
}

export interface UserProfile {
    id: string;
    username: string;
    bio: string;
    skills: string[];
    avatarUrl?: string;
    role: AccessRole;
    sovereignty?: string;
    identitySignature?: string;
}

export interface NetworkProject {
    id: string;
    title: string;
    description: string;
    fightVector: number; 
    crazyLevel: number;
    status: 'IDEATING' | 'BUILDING' | 'DONE' | 'FORGING' | 'STABLE';
    isWisdomHarmonized: boolean;
    priority?: BlueprintPriority;
    timestamp: Date;
    tasks: ProjectTask[];
    authorityId?: string;
    knowHow?: string;
    assetType?: string;
    manifest?: ImplementationResponse;
    careScore?: number;
    epochDate?: string;
}

export interface NetworkNode {
    id: string;
    ip: string;
    status: 'ACTIVE' | 'VULNERABLE' | 'SHADOW' | 'NEUTRALIZING' | 'SECURED' | 'FAILED';
    label: string;
    threatLevel: number;
    neutralizationPlan?: NeutralizationPlan;
}

export interface LiveTelemetryFrame {
    timestamp: number;
    rpm: number;
    coolantTemp: number;
    fuelPressure: number;
    voltage: number;
    load: number;
    throttlePos: number;
}

export type KnowledgeTier = 'UNIVERSAL' | 'OBFUSCATED' | 'PROHIBITED';

export interface KnowledgeFragment {
    id: string;
    label: string;
    description: string;
    tier: KnowledgeTier;
    integrityThreshold: number;
    isVerified: boolean;
}

export interface HeuristicConstraint {
    id: string;
    label: string;
    description: string;
    tier: KnowledgeTier;
    adrenalineThreshold: number; 
    isUnlocked: boolean;
}

export interface AppStoreMetadata {
    appName: string;
    description: string;
    keywords: string[];
    dunsNumber: string;
    ageRating: string;
    primaryCategory: string;
}

export interface CompliancePosture {
    gdprActive: boolean;
    ccpaActive: boolean;
    gpcHonored: boolean;
    ageVerificationStatus: string;
}

export interface BluetoothProtocol {
    id: string;
    name: string;
    category: string;
    status: string;
    lifecycle: string;
    description: string;
    commonUUIDDetails: { uuid: string, meaning: string }[];
    designConstraints: string[];
}

export interface DeviceCompatibility {
    platform: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    touchEnabled: boolean;
    screenRes: string;
    pwaSupport: boolean;
    batteryApi: boolean;
    bluetoothApi: boolean;
    canEscalate: boolean;
}

export type AccessTier = 'USER' | 'ROOT';

export interface PlaylistSong {
    id: string;
    title: string;
    artist: string;
    addedBy: string;
}

export interface PlaylistCommand {
    type: 'add' | 'remove' | 'reorder';
    payload: any;
    senderId: string;
    timestamp: number;
}

export interface ModuleMix {
    id: string;
    modules: SavedModule[];
    mixResult: string;
}

export interface AlchemyVirtues {
    knowledge: number;
    logic: number;
    wisdom: number;
    integrity: number;
    intellect: number;
}

export interface AlchemyRecipe {
    id: string;
    name: string;
    virtueType: keyof AlchemyVirtues;
    amount: number;
    temperature: number;
    purity: number;
    timestamp: Date;
    fpgaSignature: string;
}

export interface GhostHardwareNode {
    id: string;
    type: string;
    load: number;
    temp: number;
    memory: string;
    status: string;
}

export interface RScrollShard {
    id: string;
    content: string;
    type: 'FATAL' | 'REEDLE' | 'GIFTED' | 'BINARY';
    intensity: number;
}

export interface ShieldTelemetry {
    integrity: number;
    deflectionRate: number;
    dissonanceSuppression: number;
    lastBreachAttempt: string;
    signature: string;
}

export interface ThreatShard {
    id: string;
    origin: string;
    payloadSize: string;
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    binaryPreview: string;
    status: 'ISOLATED' | 'PURGED';
}

export interface ChronosTelemetry {
    iops: number;
    latency: number;
    shardsActive: number;
    pzisSignature: string;
    noHurpStability: number;
}

export interface ConjunctionProgress {
    level: number;
    shards: number;
    unlockedViews: string[];
    globalAdrenaline: number; 
}

export interface ScoredItem {
    id: string;
    raw_text: string;
    timestamp: number;
    intent_vector: number[];
    dependency_count: number;
    user_flag: boolean;
    tokens: number;
    score?: number;
}

export interface SessionStats {
    budget: number;
    entries: LedgerEntry[];
    cumulative: number;
    exhausted: boolean;
    generation: number;
}

export interface LedgerEntry {
    turn_id: string;
    in: number;
    out: number;
    cumulative: number;
}

export interface Checkpoint {
    id: string;
    parent_id: string;
    summary: string;
    level: number;
    provenance: string;
    original_hash: string;
    timestamp: number;
}

export interface ScoringAuditResult {
    id: string;
    label: string;
    totalScore: number;
    factors: {
        intent: number;
        recency: number;
        dependency: number;
    };
    signature: string;
}

export interface SimpleSummary {
    text: string;
    tokens: number;
    level: number;
}

export interface VerificationGate {
    id: string;
    label: string;
    category: 'NEURAL' | 'REGULATORY' | 'IDENTITY';
    status: 'PENDING' | 'VALIDATING' | 'PASSED' | 'FAILED';
    lastAuditReport?: string;
    signature?: string;
}

export interface StoreItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any;
    category: 'NEURAL' | 'SISTER' | 'GEAR';
}

export interface SistersState {
    aethera: { active: boolean };
    logica: { active: boolean };
    sophia: { active: boolean };
}

export interface DreamedSchema {
    id: string;
    intent: string;
    blueprint: string;
    evolutionaryCode: string;
    dimension: string;
    purity: number;
}

export interface GoldShard {
    id: string;
    originalIntent: string;
    goldTranslation: string;
    valueClass: 1 | 2 | 3;
    weight: number;
    timestamp: number;
}

export interface Vector4D {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

export interface ElizaResponse {
    text: string;
    pattern: string;
    stride: number;
    conductionCount: number;
    topic: string | null;
    signature?: string;
}

export interface ElizaProperties {
    empathy: number;
    logicBias: number;
    strideVelocity: number;
    combatReadiness: number; 
    bridgeToGodLogic: boolean;
}

export interface LibraryItem {
    id: string;
    title: string;
    author: string;
    summary: string;
    source: 'google_books' | 'wayback_machine' | 'aetheros_archive';
    url: string;
    timestamp: Date;
    verified: boolean;
}

export interface ShadowInfoCard {
    signature: string;
    flowRole: string;
    logicBlueprint: string;
}

export interface AuditReport {
    fuelBurned: { electricity: number; gas: number };
    treasuryCost: number;
    integrityScore: number;
    nonce: number;
    semanticDrift: number;
    effectivenessScore?: number;
}

export interface TelemetryState {
    velocity: string;
    velocityValue: number;
    miningDifficulty: number;
    opaqueZones: string[];
    collisionPoints: string[];
    hav: number;
    noise: number;
    fusionConfidence: number;
    effectiveness: number;
    uptime: number;
}

export interface ExhaustionReport {
  timestamp: string;
  peakLoad: number;
  fracturePoints: string[];
  survivalStatus: 'SURVIVED' | 'CRITICAL_FAILURE';
  maestroAssessment: string;
  remedialAction: string;
  signature: string;
}

export interface IntegrityVulnerability {
    id: string;
    module: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    remediation: string;
    status: 'OPEN' | 'PATCHED' | 'IGNORED';
}

export interface SystemIntegrityAudit {
    timestamp: string;
    overallIntegrity: number;
    vulnerabilities: IntegrityVulnerability[];
    signature: string;
}

export interface VaultEntry {
    id: string;
    path: string; // Simulated D:\...
    originalPath: string; // Simulated C:\...
    timestamp: number;
    size: number;
    encrypted: boolean;
    compressed: boolean;
}

export interface AuditLog {
    id: string;
    type: 'INTEGRITY' | 'BACKUP' | 'SYNC' | 'MILESTONE';
    timestamp: number;
    details: string;
    proofOfWork: string;
}
