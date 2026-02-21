
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { ChatHeader } from './components/ChatHeader';
import { InputBar } from './components/InputBar';
import { AbsoluteReliabilityNetwork } from './components/AbsoluteReliabilityNetwork';
import { CodingNetworkView } from './components/CodingNetworkView';
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
import { PaleontologyLabView } from './components/PaleontologyLabView';
import { RawMineralLabView } from './components/RawMineralLabView';
import { ClothingLabView } from './components/ClothingLabView';
import { ConceptsLabView } from './components/ConceptsLabView';
import { SanitizationLabView } from './components/SanitizationLabView';
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
import { AmbientSoundPlayer } from './components/AmbientSoundPlayer';
import { EmergencyHaltButton } from './components/EmergencyHaltButton';
import { KillSwitchOverlay } from './components/KillSwitchOverlay';
import { StealthWatcher } from './components/StealthWatcher';
import { PredictiveBanner } from './components/PredictiveBanner';
import { ShieldIcon } from './components/icons';
import { SystemExhaustionView } from './components/SystemExhaustionView';
import { TailscaleVaultView } from './components/TailscaleVaultView';
import { SonicMetric } from './components/SonicMetric';
import { WaveVisualizer } from './components/WaveVisualizer';
import { CellularGrid } from './components/CellularGrid';
import { LedgerAuditView } from './components/LedgerAuditView';
import { VoiceAuthorityView } from './components/VoiceAuthorityView';
import { ConstraintsAuditView } from './components/ConstraintsAuditView';
import { sonicLedger } from './services/sonicLedger';
import { cellularEngine } from './services/cellularEngine';

import { startChatSession, sendMessageSovereign, generateSoftwareModule } from './services/geminiService';
import { EmergencyKillSwitch } from './services/emergencyKillSwitch';
import { safeStorage } from './services/safeStorage';
import { PredictionEngine } from './services/predictionEngine';

import type { 
  MainView, SystemStatus, ChatMessage, ProjectBlueprint, 
  NetworkProject, ArchiveEntry, SavedModule, 
  PinnedItem, EvoLibrary, AttachedFile, SystemGovernance,
  SoundscapeType, LibraryItem, ConjunctionProgress, SistersState,
  DominanceStats, DeviceLinkStatus, LinkedDevice, BroadcastMessage,
  PinType, ProjectTask, PredictiveAlert
} from './types';

export const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<MainView | 'cellular_grid' | 'quantum_ledger' | 'voice_authority' | 'constraints_audit'>('chat');
    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        Engine: 'OK', Battery: 'OK', Navigation: 'OK', Infotainment: 'OK', Handling: 'OK'
    });
    
    // Sonic/Quantum State
    const [acousticPressure, setAcousticPressure] = useState(0);
    const [harmonicStride, setHarmonicStride] = useState(1.2);
    const [quantumTick, setQuantumTick] = useState(0);

    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([{
        sender: 'model', content: "Quantized Conductor active. State machine established.", timestamp: new Date()
    }]);
    const [isLoading, setIsLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const [chatSearchQuery, setChatSearchQuery] = useState('');
    const [chatStartDate, setChatStartDate] = useState('');
    const [chatEndDate, setChatEndDate] = useState('');
    const [isTtsEnabled, setIsTtsEnabled] = useState(false);

    // Other Global State
    const [blueprints, setBlueprints] = useState<ProjectBlueprint[]>([]);
    const [projects, setProjects] = useState<NetworkProject[]>([]);
    const [agents, setAgents] = useState<any[]>([]); 
    const [archives, setArchives] = useState<ArchiveEntry[]>([]);
    const [savedModules, setSavedModules] = useState<SavedModule[]>([]);
    const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
    const [evoLibrary, setEvoLibrary] = useState<EvoLibrary | null>(null);
    const [soundscape, setSoundscape] = useState<SoundscapeType>('VOID');
    const [governance, setGovernance] = useState<SystemGovernance>({ lawLevel: 0.42, symphonicFreedom: true, activeAccord: 'MAESTRO_SOLO_v5' });
    const [unlockedViews, setUnlockedViews] = useState<MainView[]>(['chat', 'coding_network', 'projects', 'forge', 'system_exhaustion', 'recon_vault', 'quantum_ledger', 'constraints_audit']);
    const [conjunctionProgress, setConjunctionProgress] = useState<ConjunctionProgress>({ level: 1, shards: 5000, unlockedViews: ['chat', 'quantum_ledger', 'constraints_audit'], globalAdrenaline: 42 });
    const [sisters, setSisters] = useState<SistersState>({ aethera: { active: false }, logica: { active: false }, sophia: { active: false } });
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [dominance, setDominance] = useState<DominanceStats>({ score: 42, hasWonWinter: false });
    const [lastBroadcast, setLastBroadcast] = useState<BroadcastMessage | null>(null);
    
    // Hardware/Peripheral State
    const [isHalted, setIsHalted] = useState(false);
    const [timeFormat, setTimeFormat] = useState<'12hr'|'24hr'>('24hr');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isTerminal, setIsTerminal] = useState(false);
    const [deviceLinkStatus, setDeviceLinkStatus] = useState<DeviceLinkStatus>('disconnected');
    const [linkedDevice, setLinkedDevice] = useState<LinkedDevice | null>(null);

    // Predictive Engine State
    const [currentAlert, setCurrentAlert] = useState<PredictiveAlert | null>(null);

    // Initial Chat Setup
    const chatRef = useRef<any>(null);

    useEffect(() => {
        chatRef.current = startChatSession("Quantized Conductor Protocol 0x03E2. Snap all output to discrete logic shards.");
        
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        
        // HEARTBEAT: Local data updates only, do not force root remount
        const qInterval = setInterval(() => setQuantumTick(t => t + 1), 500);

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const p = sonicLedger.record('KEY', `NOTE_0x${e.keyCode.toString(16)}`, 1);
            setAcousticPressure(parseFloat(sonicLedger.getTotalPressure()));
            setHarmonicStride(sonicLedger.getSpectralStride() / 432);
        };
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            sonicLedger.record('CLICK', target.tagName || 'SONIC_VOID', 8);
            setAcousticPressure(parseFloat(sonicLedger.getTotalPressure()));
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        window.addEventListener('mousedown', handleGlobalClick);

        return () => {
            clearInterval(timeInterval);
            clearInterval(qInterval);
            window.removeEventListener('keydown', handleGlobalKeyDown);
            window.removeEventListener('mousedown', handleGlobalClick);
        };
    }, []);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() && attachedFiles.length === 0) return;
        sonicLedger.record('COMMAND', `QUANTIZED_INTENT_${text.length}`, text.length);
        const newMessage: ChatMessage = { sender: 'user', content: text, timestamp: new Date(), attachedFiles: attachedFiles.map(f => f.name) };
        setMessages(prev => [...prev, newMessage, { sender: 'model', content: '', timestamp: new Date() }]);
        setIsLoading(true);
        setChatInput('');
        try {
            if (chatRef.current) {
                const result = await sendMessageSovereign(chatRef.current, text, attachedFiles);
                 setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = result.text;
                    newMsgs[newMsgs.length - 1].groundingSources = result.sources;
                    return newMsgs;
                });
            }
        } catch (error) {
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = "Quantization fail. Re-snapping grid...";
                return newMsgs;
            });
        } finally {
            setIsLoading(false);
            setAttachedFiles([]);
        }
    };

    const renderContent = () => {
        if (isHalted) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center bg-red-950 text-red-500 font-mono gap-6 animate-pulse">
                     <ShieldIcon className="w-48 h-48" />
                     <h1 className="text-6xl font-black uppercase tracking-[0.5em]">SYSTEM STASIS</h1>
                     <p className="text-xl">KINETIC INTERLOCK QUANTIZED. MOTION TERMINATED.</p>
                </div>
            );
        }

        if (currentView === 'cellular_grid') return <CellularGrid />;
        if (currentView === 'quantum_ledger') return <LedgerAuditView />;
        if (currentView === 'voice_authority') return <VoiceAuthorityView />;
        if (currentView === 'constraints_audit') return <ConstraintsAuditView />;

        switch (currentView) {
            case 'chat': return (
                <div className="flex flex-col h-full bg-[#020205] relative flex-hinge">
                    <WaveVisualizer pressure={acousticPressure / 10} stride={harmonicStride} />
                    <ChatHeader 
                        isTtsEnabled={isTtsEnabled} 
                        onToggleTts={() => setIsTtsEnabled(!isTtsEnabled)}
                        searchQuery={chatSearchQuery}
                        onSearchChange={setChatSearchQuery}
                        startDate={chatStartDate}
                        endDate={chatEndDate}
                        onDateChange={(s, e) => { setChatStartDate(s); setChatEndDate(e); }}
                    />
                    <ChatView messages={messages} isLoading={isLoading} searchQuery={chatSearchQuery} startDate={chatStartDate} endDate={chatEndDate} />
                    <InputBar inputText={chatInput} setInputText={setChatInput} isLoading={isLoading} onSendMessage={handleSendMessage} isRecording={isRecording} onToggleRecording={() => setIsRecording(!isRecording)} attachedFiles={attachedFiles} onFilesChange={() => {}} onRemoveFile={() => {}} onScanFile={() => {}} />
                </div>
            );
            case 'recon_vault': return <TailscaleVaultView />;
            case 'absolute_reliability_network': return <AbsoluteReliabilityNetwork onActionReward={(a) => {}} />;
            case 'coding_network': return (
                <div className="flex-1 flex flex-col flex-hinge overflow-hidden">
                  <CodingNetworkView 
                      projects={projects} 
                      setProjects={setProjects} 
                      agents={agents}
                      setAgents={setAgents}
                      onNavigateToAgent={() => setCurrentView('chat')} 
                      onSetDirective={() => {}} 
                  />
                </div>
            );
            case 'universal_search': return <UniversalSearchBridge />;
            case 'gold_conjunction': return <GoldConjunction />;
            case 'shard_store': return <ShardStoreView shards={conjunctionProgress.shards} onPurchase={(c) => true} onIgniteSister={() => {}} sisters={sisters} />;
            case 'conjunction_gates': return <ConjunctionGatesView progress={conjunctionProgress} onUnlock={(v, c) => true} onSetView={setCurrentView} />;
            case 'projects': return <div className="flex-1 flex flex-col flex-hinge overflow-hidden"><ProjectNetwork projects={projects} onDeleteProject={(id) => setProjects(p => p.filter(proj => proj.id !== id))} onToggleTask={(projectId, taskId) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) } : p))} onAddTask={(projectId, text) => setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: [...(p.tasks || []), { id: uuidv4(), text, completed: false }] } : p))} /></div>;
            case 'forge': return <div className="flex-1 flex flex-col flex-hinge overflow-hidden"><ForgeView blueprints={blueprints} onAddBlueprint={(t, d, s, v, p, dt) => setBlueprints(prev => [...prev, { id: uuidv4(), title: t, description: d, technicalSpecs: s, validationStrategy: v, status: 'Pending', priority: p, timestamp: new Date(), tasks: [], dueDate: dt }])} onUpdateBlueprintStatus={(id, s) => setBlueprints(prev => prev.map(b => b.id === id ? { ...b, status: s } : b))} onDeleteBlueprint={(id) => setBlueprints(prev => prev.filter(b => b.id !== id))} onAddTaskToBlueprint={(bpId, task) => setBlueprints(prev => prev.map(b => b.id === bpId ? { ...b, tasks: [...b.tasks, task] } : b))} onToggleTask={(bpId, taskId) => setBlueprints(prev => prev.map(b => b.id === bpId ? { ...b, tasks: b.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) } : b))} onDeleteTask={(bpId, taskId) => setBlueprints(prev => prev.map(b => b.id === bpId ? { ...b, tasks: b.tasks.filter(t => t.id !== taskId) } : b))} /></div>;
            case 'covenant': return <NetworkCovenant />;
            case 'verification_gates': return <VerificationGatesView />;
            case 'project_chronos': return <ChronosDashboard />;
            case 'build_logs': return <BuildLogsView />;
            case 'rt_ipc_lab': return <RTIPCLabView />;
            case 'sovereign_shield': return <SovereignShieldView />;
            case 'spectre_browser': return <SpectreBrowserView onActionReward={() => {}} />;
            case 'unified_chain': return <UnifiedChainView />;
            case 'fuel_optimizer': return <FuelEfficiencyOptimizer systemStatus={systemStatus} />;
            case 'vault': return <OperationsVault onSetView={setCurrentView} systemStatus={systemStatus} evoLibrary={evoLibrary} lastBroadcast={lastBroadcast} lastMessage={messages[messages.length-1]} savedModulesCount={savedModules.length} savedCommandsCount={0} pinnedItems={pinnedItems} onTogglePin={(item) => {}} onExecuteCommand={() => {}} dominance={dominance} />;
            case 'healing_matrix': return <HealingMatrix governance={governance} />;
            case 'laws_justice_lab': return <LawsJusticeLabView governance={governance} onSetGovernance={setGovernance} />;
            case 'requindor_scroll': return <FineRScroll />;
            case 'omni_builder': return <OmniBuilderUI shards={conjunctionProgress.shards} />;
            case 'singularity_engine': return <SingularityEngineView knowledgeBaseSize={1000000} onConsumeKnowledge={() => {}} onProjectize={() => {}} onGoToNetwork={() => setCurrentView('coding_network')} />;
            case 'diagnostics': return <DiagnosticsCenter onSetView={setCurrentView} systemStatus={systemStatus} onUpdateSystemStatus={() => {}} />;
            case 'communications': return <CommunicationsView injectedCommand={null} onCommandInjected={() => {}} onNewBroadcast={setLastBroadcast} />;
            case 'up_north': return <UpNorthProtocol onSetView={setCurrentView} />;
            case 'device_link': return <DeviceLinkView status={deviceLinkStatus} device={linkedDevice} onConnect={() => setDeviceLinkStatus('connected')} onDisconnect={() => setDeviceLinkStatus('disconnected')} lastModule={savedModules[0]} />;
            case 'bluetooth_bridge': return <BluetoothSpecBridge />;
            case 'launch_center': return <LaunchCenterView />;
            case 'eliza_terminal': return <ElizaTerminal />;
            case 'code_fall_lab': return <CodeFallLabView onGenerate={async (logic) => null} />;
            case 'alphabet_hexagon': return <AlphabetHexagonScroll />;
            case 'powertrain_conjunction': return <PowertrainConjunctionView systemStatus={systemStatus} />;
            case 'hyper_spatial_lab': return <HyperSpatialLab onActionReward={() => {}} />;
            case 'engineering_lab': return <EngineeringLabView onGenerate={async (logic) => null} />;
            case 'hard_code_lab': return <HardCodeLabView />;
            case 'truth_lab': return <TruthLabView />;
            case 'testing_lab': return <TestingLabView />;
            case 'kinetics_lab': return <KineticsLabView />;
            case 'quantum_theory_lab': return <QuantumTheoryLabView />;
            case 'chemistry_lab': return <ChemistryLabView onActionReward={() => {}} />;
            case 'race_lab': return <RaceLabView />;
            case 'paleontology_lab': return <PaleontologyLabView />;
            case 'raw_mineral_lab': return <RawMineralLabView onActionReward={() => {}} />;
            case 'clothing_lab': return <ClothingLabView />;
            case 'concepts_lab': return <ConceptsLabView />;
            case 'sanitization_lab': return <SanitizationLabView />;
            case 'windows_lab': return <WindowsLabView />;
            case 'linux_lab': return <LinuxLabView />;
            case 'mac_os_lab': return <MacOSLabView />;
            case 'apple_lab': return <AppleLabView />;
            case 'mission_lab': return <MissionLabView />;
            case 'cell_phone_lab': return <CellphoneLabView />;
            case 'sampling_lab': return <SamplingLabView />;
            case 'pornography_studio': return <PornographyStudioView />;
            case 'vehicle_telemetry_lab': return <VehicleTelemetryLabView />;
            case 'coding_network_teachers': return <CodingNetworkTeachersView onNavigateToLab={setCurrentView} />;
            case 'enlightenment_pool': return <EnlightenmentPoolView />;
            case 'library_view': return <LibraryView libraryItems={libraryItems} onAddLibraryItem={() => {}} onActionReward={() => {}} />;
            case 'timeline': return <TimelineView />;
            case 'amoeba_heritage': return <AmoebaHeritageView />;
            case 'system_exhaustion': return <SystemExhaustionView />;
            default: return <ChatView messages={messages} isLoading={isLoading} searchQuery={''} startDate={''} endDate={''} />;
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-black text-gray-200">
            <Sidebar 
                systemStatus={systemStatus} systemDetails={{}} currentView={currentView as MainView} onSetView={(v) => setCurrentView(v as any)} 
                currentDateTime={currentTime} timeFormat={timeFormat} onToggleTimeFormat={() => setTimeFormat(prev => prev === '12hr' ? '24hr' : '12hr')} 
                unlockedViews={[...unlockedViews, 'cellular_grid' as any, 'quantum_ledger' as any, 'voice_authority' as any, 'constraints_audit' as any]} onToggleTerminal={() => setIsTerminal(!isTerminal)} isTerminal={isTerminal}
            />
            
            <main className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-75 flex-hinge ${isTerminal ? 'font-mono bg-black text-green-500 border-l-2 border-green-900/40' : ''}`}>
                <div className="absolute top-4 right-20 z-[60] flex items-center gap-6 pointer-events-none">
                    <div className="pointer-events-auto">
                        <SonicMetric size="sm" value={acousticPressure} label="DB_SPL" unit="dB" colorClass="border-blue-600 text-blue-500" />
                    </div>
                    <div className="pointer-events-auto">
                        <SonicMetric size="sm" value={conjunctionProgress.shards} label="CELL_CPH" unit="CPH" colorClass="border-amber-600 text-amber-500" />
                    </div>
                </div>
                {renderContent()}
                <PredictiveBanner alert={currentAlert} onFix={() => setCurrentAlert(null)} onDismiss={() => setCurrentAlert(null)} />
                <AmbientSoundPlayer enabled={true} status={systemStatus} isHalted={isHalted} soundscape={soundscape} />
                <EmergencyHaltButton onTrigger={() => setIsHalted(true)} isHalted={isHalted} onReset={() => setIsHalted(false)} />
                <KillSwitchOverlay isHalted={isHalted} onTrigger={() => setIsHalted(true)} onReset={() => setIsHalted(false)} />
            </main>
        </div>
    );
};
