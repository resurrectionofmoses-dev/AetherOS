
import React from 'react';
import { MainView } from './types';
import { ProjectShowcaseView } from './components/ProjectShowcaseView';
import { ChatView } from './components/ChatView';
import { ChatHeader } from './components/ChatHeader';
import { InputBar } from './components/InputBar';
import { WaveVisualizer } from './components/WaveVisualizer';
import { AbsoluteReliabilityNetwork } from './components/AbsoluteReliabilityNetwork';
import { UniversalSearchBridge } from './components/UniversalSearchBridge';
import { GoldConjunction } from './components/GoldConjunction';
import { ShardStoreView } from './components/ShardStoreView';
import { ConjunctionGatesView } from './components/ConjunctionGatesView';
import { ProjectNetwork } from './components/ProjectNetwork';
import { ForgeView } from './components/ForgeView';
import { NetworkCovenant } from './components/NetworkCovenant';
import { VerificationGatesView } from './components/VerificationGatesView';
import { ChronosDashboard } from './components/ChronosDashboard';
import { BuildLogsView } from './components/BuildLogsView';
import { RTIPCLabView } from './components/RTIPCLabView';
import { SovereignShieldView } from './components/SovereignShieldView';
import { SpectreBrowserView } from './components/SpectreBrowserView';
import { UnifiedChainView } from './components/UnifiedChainView';
import { FuelEfficiencyOptimizer } from './components/FuelEfficiencyOptimizer';
import { OperationsVault } from './components/OperationsVault';
import { HealingMatrix } from './components/HealingMatrix';
import { LawsJusticeLabView } from './components/LawsJusticeLabView';
import { FineRScroll } from './components/FineRScroll';
import { OmniBuilderUI } from './components/OmniBuilderUI';
import { SingularityEngineView } from './components/SingularityEngineView';
import { DiagnosticsCenter } from './components/DiagnosticsCenter';
import { CommunicationsView } from './components/CommunicationsView';
import { UpNorthProtocol } from './components/UpNorthProtocol';
import { DeviceLinkView } from './components/DeviceLinkView';
import { BluetoothSpecBridge } from './components/BluetoothSpecBridge';
import { LaunchCenterView } from './components/LaunchCenterView';
import { ElizaTerminal } from './components/ElizaTerminal';
import { CodeFallLabView } from './components/CodeFallLabView';
import { AlphabetHexagonScroll } from './components/AlphabetHexagonScroll';
import { PowertrainConjunctionView } from './components/PowertrainConjunctionView';
import { HyperSpatialLab } from './components/HyperSpatialLab';
import { EngineeringLabView } from './components/EngineeringLabView';
import { HardCodeLabView } from './components/HardCodeLabView';
import { TruthLabView } from './components/TruthLabView';
import { TestingLabView } from './components/TestingLabView';
import { KineticsLabView } from './components/KineticsLabView';
import { QuantumTheoryLabView } from './components/QuantumTheoryLabView';
import { ChemistryLabView } from './components/ChemistryLabView';
import { RaceLabView } from './components/RaceLabView';
import { MedicalSynthesisLab } from './components/MedicalSynthesisLab';
import { PaleontologyLabView } from './components/PaleontologyLabView';
import { RawMineralLabView } from './components/RawMineralLabView';
import { ClothingLabView } from './components/ClothingLabView';
import { ConceptsLabView } from './components/ConceptsLabView';
import { SanitizationLabView } from './components/SanitizationLabView';
import { RemixScopeLabView } from './components/RemixScopeLabView';
import { WindowsLabView } from './components/WindowsLabView';
import { LinuxLabView } from './components/LinuxLabView';
import { MacOSLabView } from './components/MacOSLabView';
import { AppleLabView } from './components/AppleLabView';
import { MissionLabView } from './components/MissionLabView';
import { CellphoneLabView } from './components/CellphoneLabView';
import { SamplingLabView } from './components/SamplingLabView';
import { PornographyStudioView } from './components/PornographyStudioView';
import { VehicleTelemetryLabView } from './components/VehicleTelemetryLabView';
import { CodingNetworkTeachersView } from './components/CodingNetworkTeachersView';
import { EnlightenmentPoolView } from './components/EnlightenmentPoolView';
import { LibraryView } from './components/LibraryView';
import { TimelineView } from './components/TimelineView';
import { AmoebaHeritageView } from './components/AmoebaHeritageView';
import { SystemExhaustionView } from './components/SystemExhaustionView';
import { TailscaleVaultView } from './components/TailscaleVaultView';
import { ConstraintsAuditView } from './components/ConstraintsAuditView';
import { VehicleManagementView } from './components/VehicleManagementView';
import { VulnerabilityReportView } from './components/VulnerabilityReportView';
import { TacticalIntelligenceView } from './components/TacticalIntelligenceView';
import { BehavioralSpecsView } from './components/BehavioralSpecsView';
import { CognitivePipelineView } from './components/CognitivePipelineView';
import { DataProvenanceLab } from './components/DataProvenanceLab';
import { SelfHealingCRTView } from './components/SelfHealingCRTView';
import { UserProfileView } from './components/UserProfileView';
import { PromptForge } from './components/PromptForge';
import { VoiceAuthorityView } from './components/VoiceAuthorityView';
import { CellularGrid } from './components/CellularGrid';
import { SovereignStandardView } from './components/SovereignStandardView';
import { CodingNetworkView } from './components/CodingNetworkView';
import { UnknownPhysicsLabView } from './components/UnknownPhysicsLabView';
import { LogicPatternLabView } from './components/LogicPatternLabView';
import { ConfusionLogicView } from './components/ConfusionLogicView';
import { KnowledgeForumView } from './components/KnowledgeForumView';
import { MainNetView } from './components/MainNetView';
import { EcosystemView } from './components/EcosystemView';
import { BlacklistView } from './components/BlacklistView';
import { AccountManagerView } from './components/AccountManagerView';
import { VaultManagerView } from './components/VaultManagerView';
import { SystemIntegrityView } from './components/SystemIntegrityView';
import { LivePatchObservationView } from './components/LivePatchObservationView';
import { ModeratorLoungeView } from './components/ModeratorLoungeView';
import { EurodemuxView } from './eurodemux';
import { BiometricIntelligenceView } from './components/BiometricIntelligenceView';
import { CardRecoveryView } from './components/CardRecoveryView';
import { v4 as uuidv4 } from 'uuid';

export const ViewRegistry: Record<string, (props: any) => React.ReactNode> = {
    'eurodemux_core': () => <EurodemuxView />,
    'moderator_lounge': () => <ModeratorLoungeView />,
    'live_patch_obs': () => <LivePatchObservationView />,
    'accounts_registry': () => <AccountManagerView />,
    'vault_manager': () => <VaultManagerView />,
    'system_integrity': () => <SystemIntegrityView />,
    'blacklist': (props) => <BlacklistView profile={props.profile} />,
    'chat': (props) => (
        <div className="flex flex-col h-full bg-[#020205] relative flex-hinge">
            <WaveVisualizer pressure={props.acousticPressure / 10} stride={props.harmonicStride} />
            <ChatHeader 
                isTtsEnabled={props.isTtsEnabled} 
                onToggleTts={props.onToggleTts}
                searchQuery={props.chatSearchQuery}
                onSearchChange={props.setChatSearchQuery}
                startDate={props.chatStartDate}
                endDate={props.chatEndDate}
                senderFilter={props.chatSenderFilter}
                onSenderFilterChange={props.setChatSenderFilter}
                onDateChange={props.onDateChange}
                onClearChat={props.onClearChat}
                currentChannel={props.currentChannel}
                onSetChannel={props.onSetChannel}
                userRole={props.profile.role}
            />
            <ChatView 
                messages={props.messages.filter((m: any) => m.channelId === props.currentChannel || (!m.channelId && props.currentChannel === 'global'))} 
                isLoading={props.isLoading} 
                searchQuery={props.chatSearchQuery} 
                startDate={props.chatStartDate} 
                endDate={props.chatEndDate} 
                senderFilter={props.chatSenderFilter}
                activeSeat={props.activeSeat} 
                onSeatChange={props.onSetSeat} 
                currentChannel={props.currentChannel}
                userRole={props.profile.role}
                isRecordingVoice={props.isRecording}
            />
            <InputBar 
                inputText={props.chatInput} 
                setInputText={props.setChatInput} 
                isLoading={props.isLoading} 
                onSendMessage={props.onSendMessage} 
                isRecording={props.isRecording} 
                onToggleRecording={props.onToggleRecording} 
                attachedFiles={props.attachedFiles} 
                onFilesChange={props.onFilesChange} 
                onRemoveFile={props.onRemoveFile} 
                onScanFile={props.onScanFile} 
                activeSeat={props.activeSeat}
                currentChannel={props.currentChannel}
            />
        </div>
    ),
    'recon_vault': () => <TailscaleVaultView />,
    'absolute_reliability_network': () => <AbsoluteReliabilityNetwork onActionReward={() => {}} />,
    'coding_network': (props) => (
        <div className="flex-1 flex flex-col flex-hinge overflow-hidden">
          <CodingNetworkView 
              projects={props.projects} 
              setProjects={props.setProjects} 
              agents={props.agents}
              setAgents={props.setAgents}
              onNavigateToAgent={() => props.onSetView('chat')} 
              onSetDirective={() => {}} 
          />
        </div>
    ),
    'universal_search': () => <UniversalSearchBridge />,
    'gold_conjunction': () => <GoldConjunction />,
    'shard_store': (props) => <ShardStoreView shards={props.shards} onPurchase={() => true} onIgniteSister={() => {}} sisters={props.sisters} />,
    'conjunction_gates': (props) => <ConjunctionGatesView progress={props.progress} onUnlock={() => true} onSetView={props.onSetView} />,
    'projects': (props) => (
        <div className="flex-1 flex flex-col flex-hinge overflow-hidden">
            <ProjectNetwork 
                projects={props.projects} 
                onDeleteProject={(id) => props.setProjects((p: any[]) => p.filter(proj => proj.id !== id))} 
                onToggleTask={(projectId, taskId) => props.setProjects((prev: any[]) => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map((t: any) => t.id === taskId ? { ...t, completed: !t.completed } : t) } : p))} 
                onDeleteTask={(projectId, taskId) => props.setProjects((prev: any[]) => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.filter((t: any) => t.id !== taskId) } : p))}
                onAddTask={(projectId, text, dueDate, priority) => props.setProjects((prev: any[]) => prev.map(p => p.id === projectId ? { ...p, tasks: [...(p.tasks || []), { id: uuidv4(), text, completed: false, dueDate, priority, createdAt: Date.now() }] } : p))} 
                onUpdateProject={(id, updates) => props.setProjects((prev: any[]) => prev.map(p => p.id === id ? { ...p, ...updates } : p))} 
            />
        </div>
    ),
    'forge': (props) => (
        <div className="flex-1 flex flex-col flex-hinge overflow-hidden">
            <ForgeView 
                blueprints={props.blueprints} 
                onAddBlueprint={(t, d, s, v, p, dt) => props.setBlueprints((prev: any[]) => [...prev, { id: uuidv4(), title: t, description: d, technicalSpecs: s, validationStrategy: v, status: 'Pending', priority: p, timestamp: new Date(), tasks: [], dueDate: dt }])} 
                onUpdateBlueprintStatus={(id, s) => props.setBlueprints((prev: any[]) => prev.map(b => b.id === id ? { ...b, status: s } : b))} 
                onDeleteBlueprint={(id) => props.setBlueprints((prev: any[]) => prev.filter(b => b.id !== id))} 
                onAddTaskToBlueprint={(bpId, task) => props.setBlueprints((prev: any[]) => prev.map(b => b.id === bpId ? { ...b, tasks: [...b.tasks, task] } : b))} 
                onToggleTask={(bpId, taskId) => props.setBlueprints((prev: any[]) => prev.map(b => b.id === bpId ? { ...b, tasks: b.tasks.map((t: any) => t.id === taskId ? { ...t, completed: !t.completed } : t) } : b))} 
                onDeleteTask={(bpId, taskId) => props.setBlueprints((prev: any[]) => prev.map(b => b.id === bpId ? { ...b, tasks: b.tasks.filter((t: any) => t.id !== taskId) } : b))} 
            />
        </div>
    ),
    'covenant': () => <NetworkCovenant />,
    'verification_gates': () => <VerificationGatesView />,
    'project_chronos': () => <ChronosDashboard />,
    'build_logs': () => <BuildLogsView />,
    'rt_ipc_lab': () => <RTIPCLabView />,
    'sovereign_shield': (props) => <SovereignShieldView onNavigateToReport={props.onSetView} />,
    'spectre_browser': (props) => <SpectreBrowserView onActionReward={() => {}} />,
    'unified_chain': () => <UnifiedChainView />,
    'fuel_optimizer': (props) => <FuelEfficiencyOptimizer systemStatus={props.systemStatus} />,
    'vault': (props) => (
        <OperationsVault 
            onSetView={props.onSetView} 
            systemStatus={props.systemStatus} 
            evoLibrary={props.evoLibrary} 
            lastBroadcast={props.lastBroadcast} 
            lastMessage={props.lastMessage} 
            savedModulesCount={props.savedModulesCount} 
            savedCommandsCount={0} 
            pinnedItems={props.pinnedItems} 
            onTogglePin={() => {}} 
            onExecuteCommand={() => {}} 
            dominance={props.dominance} 
        />
    ),
    'healing_matrix': (props) => <HealingMatrix governance={props.governance} />,
    'laws_justice_lab': (props) => <LawsJusticeLabView governance={props.governance} onSetGovernance={props.onSetGovernance} />,
    'requindor_scroll': () => <FineRScroll />,
    'omni_builder': (props) => <OmniBuilderUI shards={props.shards} />,
    'singularity_engine': (props) => <SingularityEngineView knowledgeBaseSize={1000000} onConsumeKnowledge={() => {}} onProjectize={() => {}} onGoToNetwork={() => props.onSetView('coding_network')} />,
    'diagnostics': (props) => <DiagnosticsCenter onSetView={props.onSetView} systemStatus={props.systemStatus} onUpdateSystemStatus={() => {}} />,
    'communications': (props) => <CommunicationsView injectedCommand={null} onCommandInjected={() => {}} onNewBroadcast={props.onNewBroadcast} broadcasts={props.broadcasts} onCancelBroadcast={props.onCancelBroadcast} />,
    'up_north': (props) => <UpNorthProtocol onSetView={props.onSetView} />,
    'device_link': (props) => <DeviceLinkView status={props.status} device={props.device} onConnect={props.onConnect} onDisconnect={props.onDisconnect} lastModule={props.lastModule} />,
    'bluetooth_bridge': () => <BluetoothSpecBridge />,
    'launch_center': () => <LaunchCenterView />,
    'eliza_terminal': () => <ElizaTerminal />,
    'code_fall_lab': (props) => <CodeFallLabView onGenerate={props.onGenerate} />,
    'alphabet_hexagon': () => <AlphabetHexagonScroll />,
    'powertrain_conjunction': (props) => <PowertrainConjunctionView systemStatus={props.systemStatus} />,
    'hyper_spatial_lab': (props) => <HyperSpatialLab onActionReward={() => {}} />,
    'engineering_lab': (props) => <EngineeringLabView onGenerate={props.onGenerate} />,
    'hard_code_lab': () => <HardCodeLabView />,
    'truth_lab': () => <TruthLabView />,
    'testing_lab': () => <TestingLabView />,
    'kinetics_lab': () => <KineticsLabView />,
    'quantum_theory_lab': () => <QuantumTheoryLabView />,
    'chemistry_lab': (props) => <ChemistryLabView onActionReward={() => {}} />,
    'race_lab': () => <RaceLabView />,
    'medical_synthesis_lab': () => <MedicalSynthesisLab />,
    'paleontology_lab': () => <PaleontologyLabView />,
    'raw_mineral_lab': (props) => <RawMineralLabView onActionReward={() => {}} />,
    'clothing_lab': () => <ClothingLabView />,
    'concepts_lab': () => <ConceptsLabView />,
    'sanitization_lab': () => <SanitizationLabView />,
    'remix_scope_lab': () => <RemixScopeLabView />,
    'windows_lab': () => <WindowsLabView />,
    'linux_lab': () => <LinuxLabView />,
    'mac_os_lab': () => <MacOSLabView />,
    'apple_lab': () => <AppleLabView />,
    'mission_lab': () => <MissionLabView />,
    'cell_phone_lab': () => <CellphoneLabView />,
    'sampling_lab': () => <SamplingLabView />,
    'pornography_studio': () => <PornographyStudioView />,
    'vehicle_telemetry_lab': () => <VehicleTelemetryLabView />,
    'coding_network_teachers': (props) => <CodingNetworkTeachersView onNavigateToLab={props.onSetView} teachers={props.teachers} onDeleteTeacher={(id) => props.setTeachers((prev: any[]) => prev.filter(t => t.id !== id))} />,
    'enlightenment_pool': () => <EnlightenmentPoolView />,
    'library_view': (props) => <LibraryView libraryItems={props.libraryItems} onAddLibraryItem={() => {}} onActionReward={props.onActionReward} unlockedViews={props.unlockedViews} setUnlockedViews={props.setUnlockedViews} onSetView={props.onSetView} shards={props.shards} />,
    'timeline': () => <TimelineView />,
    'amoeba_heritage': () => <AmoebaHeritageView />,
    'system_exhaustion': () => <SystemExhaustionView />,
    'constraints_audit': () => <ConstraintsAuditView />,
    'vehicle_management': (props) => (
        <VehicleManagementView 
            vehicles={props.vehicles} 
            onAddVehicle={(v) => props.setVehicles([...props.vehicles, v])} 
            onUpdateVehicle={(v) => props.setVehicles(props.vehicles.map((veh: any) => veh.id === v.id ? v : veh))} 
            onDeleteVehicle={(id) => {
                const newVehicles = props.vehicles.filter((v: any) => v.id !== id);
                if (newVehicles.length > 0 && !newVehicles.some((v: any) => v.isActive)) {
                    newVehicles[0].isActive = true;
                }
                props.setVehicles(newVehicles);
            }} 
            onSetActiveVehicle={(id) => props.setVehicles(props.vehicles.map((v: any) => ({ ...v, isActive: v.id === id })))}
        />
    ),
    'unknown_physics_lab': () => <UnknownPhysicsLabView />,
    'logic_pattern_lab': () => <LogicPatternLabView />,
    'confusion_logic': () => <ConfusionLogicView />,
    'knowledge_forum': () => <KnowledgeForumView />,
    'main_net': () => <MainNetView />,
    'ecosystem': () => <EcosystemView />,
    'vulnerability_report': (props) => (
        <VulnerabilityReportView 
            onClose={() => props.onSetView('sovereign_shield')} 
            autoFracture={props.isSystemFractured} 
            onResetFracture={() => props.onResetFracture()} 
        />
    ),
    'tactical_intelligence': (props) => <TacticalIntelligenceView onClose={() => props.onSetView('sovereign_shield')} />,
    'behavioral_specs': (props) => <BehavioralSpecsView onClose={() => props.onSetView('sovereign_shield')} />,
    'cognitive_pipeline': (props) => <CognitivePipelineView onClose={() => props.onSetView('sovereign_shield')} />,
    'data_provenance_lab': () => <DataProvenanceLab />,
    'sh_crt_loop': () => <SelfHealingCRTView />,
    'user_profile': (props) => <UserProfileView profile={props.profile} projects={props.projects} onUpdateProfile={(updates) => props.onUpdateProfile(updates)} />,
    'prompt_forge': () => <PromptForge />,
    'voice_authority': () => <VoiceAuthorityView />,
    'cellular_grid': () => <CellularGrid />,
    'sovereign_standard': () => <SovereignStandardView />,
    'blockchain_history': () => <UnifiedChainView />,
    'quantum_ledger': () => <UnifiedChainView />,
    'biometric_intelligence': () => <BiometricIntelligenceView />,
    'card_recovery': () => <CardRecoveryView />,
    'project_showcase': () => <ProjectShowcaseView />,
};
