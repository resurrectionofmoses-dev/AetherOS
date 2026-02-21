
export type BlueprintStatus = 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
export type BlueprintPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type SystemState = 'OK' | 'Warning' | 'Error';
export type VehicleSystem = 'Engine' | 'Battery' | 'Navigation' | 'Infotainment' | 'Handling';
export type SoundscapeType = 'VOID' | 'REACTOR' | 'TERRA';

export type Mode = 'learn' | 'build' | 'refactor' | 'debug' | 'security' | 'optimizer' | 'documenter' | 'logic' | 'hope' | 'codesphere' | 'squad' | 'reinforcement' | 'academy' | 'microcheck' | 'nanolinter' | 'academic' | 'templar' | 'bountytemplar' | 'quantumguardian' | 'omegacoder' | 'judge' | 'custom' | 'focus' | 'journey';

export interface QuantumMove {
    id: string;
    index: number;
    type: 'KEY' | 'CLICK' | 'COMMAND' | 'SYSTEM';
    label: string;
    timestamp: number;
    weight: number;
}

export interface PredictiveAlert {
    id: string;
    title: string;
    probability: number; 
    timeToImpact: number; 
    detectedPattern: string;
    suggestedFix: string;
    reward: number;
}

export interface ProjectTask {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
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
  | 'vehicle_telemetry_lab' | 'coding_network_teachers' | 'enlightenment_pool' 
  | 'library_view' | 'timeline' | 'amoeba_heritage' | 'system_exhaustion' | 'recon_vault'
  | 'quantum_ledger' | 'constraints_audit';

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
  sender: 'user' | 'model';
  content: string;
  timestamp: Date;
  attachedFiles?: string[];
  groundingSources?: GroundingSource[];
  interactionPrompt?: InteractionPromptData;
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

export interface NetworkProject {
    id: string;
    title: string;
    description: string;
    fightVector: number; 
    crazyLevel: number;
    status: 'IDEATING' | 'BUILDING' | 'DONE' | 'FORGING' | 'STABLE';
    isWisdomHarmonized: boolean;
    timestamp: Date;
    tasks: ProjectTask[];
    authorityId?: string;
    knowHow?: string;
    assetType?: string;
    manifest?: ImplementationResponse;
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
