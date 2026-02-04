
import { Chat } from '@google/genai';

export type Mode = 'aetheros';
export type AccessTier = 'USER' | 'ROOT';

export type MainView = 'chat' | 'diagnostics' | 'prompts' | 'workshop' | 'communications' | 'vault' | 'room_of_play' | 'command_deck' | 'strategic_overview' | 'device_link' | 'system_archives' | 'forge' | 'singularity_engine' | 'up_north' | 'code_agent' | 'projects' | 'nexus' | 'zurich' | 'enlightenment_pool' | 'pseudorole_testing' | 'integrity_network' | 'launch_center' | 'network_sentinel' | 'bluetooth_bridge' | 'packaging_suite' | 'coding_network' | 'covenant' | 'fcc_network' | 'timeline' | 'collaborative_playlist' | 'engineering_lab' | 'kinetics_lab' | 'quantum_theory_lab' | 'race_lab' | 'chemistry_lab' | 'paleontology_lab' | 'raw_mineral_lab' | 'clothing_lab' | 'concepts_lab' | 'sanitization_lab' | 'laws_justice_lab' | 'truth_lab' | 'testing_lab' | 'windows_lab' | 'linux_lab' | 'mac_os_lab' | 'apple_lab' | 'mission_lab' | 'coding_network_teachers' | 'cell_phone_lab' | 'sampling_lab' | 'hard_code_lab' | 'library_view' | 'pornography_studio' | 'verification_gates' | 'vehicle_telemetry_lab' | 'conjunction_gates';

export interface ConjunctionProgress {
  shards: number;
  globalMisery: number;
  unlockedViews: MainView[];
  level: number;
}

export type VehicleSystem = 'Engine' | 'Battery' | 'Navigation' | 'Infotainment' | 'Handling';
export type SystemState = 'OK' | 'Warning' | 'Error';
export type SystemStatus = Record<VehicleSystem, SystemState>;

export interface AlchemyVirtues {
  knowledge: number;
  logic: number;
  wisdom: number;
  integrity: number;
  intellect: number;
}

export interface VerificationGate {
  id: string;
  label: string;
  category: 'REGULATORY' | 'NEURAL' | 'IDENTITY';
  status: 'PENDING' | 'VALIDATING' | 'PASSED' | 'FAILED';
  lastAuditReport?: string;
  signature?: string;
}

export interface SistersState {
  aethera: { active: boolean; load: number }; // Knowledge
  logica: { active: boolean; load: number }; // Logic
  sophia: { active: boolean; load: number }; // Wisdom
}

export interface SquadMember {
  id: string;
  name: string;
  type: 'EPYC' | 'XEON' | 'FPGA';
  status: 'STABLE' | 'BUSY' | 'GHOST';
  load: number;
  temp: number;
}

export interface GhostHardwareNode {
    id: string;
    type: 'EPYC' | 'XEON' | 'FPGA';
    load: number;
    temp: number;
    memory: string; 
    status: 'ACTIVE' | 'THROTTLED' | 'OFFLINE';
}

export interface AlchemyRecipe {
  id: string;
  name: string;
  virtueType: keyof AlchemyVirtues;
  amount: number;
  temperature: number;
  purity: number;
  timestamp: Date;
  fpgaSignature?: string;
}

export type SystemDetails = Record<VehicleSystem, any>;

export interface Interaction {
  id: string;
  type: 'navigation' | 'creation' | 'simulation' | 'archival';
  view: MainView;
  label: string;
  timestamp: Date;
  narrativeInsight?: string;
}

export interface ResilienceReport {
  biologicalStress: number;
  spiritualResilience: number;
  digitalIntegrity: number;
  summary: string;
  verdict: 'STABLE' | 'VULNERABLE' | 'CRITICAL';
}

export interface ProjectTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface ProjectAsset {
  id: string;
  name: string;
  type: string;
  data: string;
  timestamp: Date;
}

export interface GlobalDirective {
  projectId: string;
  title: string;
  activeTask?: string;
  integritySignature: string;
}

export interface ProjectBlueprint {
  id: string;
  title: string;
  description: string;
  status: BlueprintStatus;
  priority: BlueprintPriority; 
  timestamp: Date;
  tasks: ProjectTask[]; 
  simulationReport?: ResilienceReport;
}

export type BlueprintStatus = 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
export type BlueprintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface BluetoothProtocol {
  id: string;
  name: string;
  category: 'Core' | 'GATT' | 'Mesh' | 'Auracast' | 'Traditional';
  status: 'Stable' | 'Beta' | 'Experimental';
  lifecycle: 'Discovery' | 'PoC' | 'MVP' | 'Full-Scale' | 'Hypercare';
  description: string;
  commonUUIDDetails: { uuid: string; meaning: string; }[];
  designConstraints: string[];
}

export interface NetworkProject {
  id: string;
  title: string;
  description: string;
  miseryScore: number;
  crazyLevel: number;
  status: 'IDEATING' | 'BUILDING' | 'DONE';
  isWisdomHarmonized: boolean;
  timestamp: Date;
  tasks: ProjectTask[];
  assets?: ProjectAsset[];
  knowHow?: string;
  assetType?: 'BLUETOOTH' | 'RTLS' | 'KERNEL' | 'INTERFACE';
}

export interface ArchiveEntry {
  id: string;
  title: string;
  text: string;
  timestamp: Date;
  isDirective?: boolean;
}

export interface BluetoothBlueprint {
  protocol: string;
  architecture: string;
  codeSnippet: string;
  packetStructure: string;
  integritySignature: string;
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

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface InteractionPrompt {
  prompt: string;
  submittedAnswer?: string;
}

export interface ChatMessage {
  sender: 'user' | 'model';
  content: string;
  timestamp: Date;
  parentTimestamp?: Date;
  attachedFiles?: string[];
  groundingSources?: GroundingSource[];
  interactionPrompt?: InteractionPrompt;
}

export interface AttachedFile {
  name: string;
  type: string;
  content: string; 
  scanStatus?: 'unscanned' | 'scanning' | 'complete';
  scanResult?: string;
}

export interface ShadowInfoCard {
  signature: string;
  flowRole: string;
  dependency: string;
  boundaries: { havLimit: number; noiseLimit: number; };
  logicBlueprint: string;
}

export interface ImplementationFile {
  filename: string;
  code: string;
}

export interface ImplementationResponse {
  files: ImplementationFile[];
}

export interface SavedModule extends ImplementationResponse {
  id: string;
  name: string;
  timestamp: Date;
}

export interface CustomCommand {
  id: string;
  title: string;
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  mode: Mode;
  messages: ChatMessage[];
  chat: Chat;
  name: string;
}

export interface EvoLibrary {
  library: string;
  version: string;
  categories: EvoCategory[];
}

export interface EvoPrompt {
  title: string;
  text: string;
}

export interface EvoCategory {
  id: string;
  name: string;
  description?: string;
  prompts: EvoPrompt[];
}

export interface BroadcastMessage {
  source: string;
  text: string;
  timestamp: Date;
  color: string;
}

export type PinType = 'module' | 'command';

export interface PinnedItem {
  id: string;
  referenceId: string;
  type: PinType;
  title: string;
  content?: string;
}

export type DeviceLinkStatus = 'disconnected' | 'connecting' | 'connected';
export interface LinkedDevice {
  name: string;
  type: string;
}

export interface AuditReport {
  fuelBurned: { electricity: number; gas: number };
  treasuryCost: number;
  integrityScore: number;
  nonce: number;
  semanticDrift: number;
  effectivenessScore: number;
}

export interface TelemetryState {
  velocity: 'Liquid' | 'Rigid';
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

export type KnowledgeTier = 'UNIVERSAL' | 'OBFUSCATED' | 'PROHIBITED';

export interface KnowledgeFragment {
  id: string;
  label: string;
  description: string;
  isVerified: boolean;
  integrityThreshold: number;
  tier: KnowledgeTier;
}

export interface HeuristicConstraint {
  id: string;
  label: string;
  description: string;
  tier: KnowledgeTier;
  miseryRequirement: number;
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
  ageVerificationStatus: 'READY' | 'PENDING' | 'REQUIRED';
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

export interface ProtocolAdaptation {
  adaptationDirectives: string[];
  predictedStability: number;
  revisedPacketStructure?: string;
}

export interface NetworkNode {
    id: string;
    ip: string;
    status: 'ACTIVE' | 'VULNERABLE' | 'SHADOW' | 'NEUTRALIZING' | 'SECURED' | 'FAILED';
    label: string;
    threatLevel: number;
    neutralizationPlan?: NeutralizationPlan;
}

export interface DetailedDiagnostic {
  code: string;
  meaning: string;
  rootCauses: string[];
  healingSteps: string[];
  maestroInsight: string;
  impactOnSquad: string;
}

export interface DiagnosticTroubleCode {
  code: string;
  description: string;
  system: VehicleSystem;
  severity: SystemState;
  signature?: string;
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

export interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  addedBy: string;
}

export type PlaylistCommandType = 'add' | 'reorder' | 'remove';

export interface PlaylistCommand {
  type: PlaylistCommandType;
  payload: any;
  senderId: string;
  timestamp: number;
}

export interface CollaborativePlaylistState {
  songs: PlaylistSong[];
}

export interface ModuleMix {
  id: string;
  modules: SavedModule[];
  mixResult?: string;
  timestamp: Date;
}

export interface TeacherProfile {
  id: string;
  name: string;
  specialty: string;
  wisdom: string;
  icon: string;
  color: string;
}

export interface LabComponentProps {
  labName: string;
  labIcon: React.FC<{ className?: string }>;
  labColor: string;
  description?: string;
  globalDirective?: GlobalDirective; // Ingesting the Net Folder's output
  onActionReward?: (shards: number) => void;
}

export interface LibraryItem {
  id: string;
  title: string;
  author?: string;
  source: 'google_books' | 'wayback_machine' | 'aetheros_archive';
  url: string;
  summary?: string;
  timestamp: Date;
}

export interface FinancialForensicAudit {
  report: string;
  verifiedPerformersCount: number;
  financialFlowStatus: 'SECURE' | 'AUDIT_REQUIRED' | 'FLAGGED';
  redFlags: string[];
  signature: string;
}
