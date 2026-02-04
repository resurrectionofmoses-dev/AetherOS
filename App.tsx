
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '@google/genai';
import { ChatView } from './components/ChatView';
import { InputBar } from './components/InputBar';
import type { ChatMessage, AttachedFile, ChatSession, SystemStatus, VehicleSystem, SystemState, SystemDetails, MainView, EvoLibrary, ImplementationResponse, BroadcastMessage, SavedModule, CustomCommand, PinnedItem, ArchiveEntry, ProjectBlueprint, BlueprintPriority, ProjectTask, Interaction, NetworkProject, PlaylistSong, PlaylistCommand, ModuleMix, TeacherProfile, LibraryItem, LabComponentProps, DeviceLinkStatus, LinkedDevice, PinType, GlobalDirective, SistersState, SquadMember, ConjunctionProgress } from './types';
import { SYSTEM_INSTRUCTIONS } from './constants';
import { startChatSession, sendMessage, scanBinaryFile, generateSoftwareModule, proveTheory, transcribeAudio } from './services/geminiService';
import { ChatHeader } from './components/ChatHeader';
import { Launchpad } from './components/Launchpad';
import { Sidebar } from './components/Sidebar';
import { DiagnosticsCenter } from './components/DiagnosticsCenter';
import { EvoPromptsView } from './components/EvoPromptsView';
import { CommunicationsView } from './components/CommunicationsView';
import { OperationsVault } from './components/OperationsVault';
import { RoomOfPlayView } from './components/RoomOfPlayView';
import { CommandDeck } from './components/CommandDeck';
import { StrategicOverview } from './components/StrategicOverview';
import { DeviceLinkView } from './components/DeviceLinkView';
import { SystemArchives } from './components/SystemArchives';
import { ForgeView } from './components/ForgeView';
import { SingularityEngineView } from './components/SingularityEngineView';
import { UpNorthProtocol } from './components/UpNorthProtocol';
import { CodeAgentView } from './components/CodeAgentView';
import { ProjectNetwork } from './components/ProjectNetwork';
import { WisdomNexus } from './components/WisdomNexus';
import { ZurichBridge } from './components/ZurichBridge';
import { EnlightenmentPoolView } from './components/EnlightenmentPool';
import { PseudoRoleTesting } from './components/PseudoRoleTesting';
import { IntegrityNetworkView } from './components/IntegrityNetworkView';
import { LaunchCenterView } from './components/LaunchCenterView';
import { NetworkSentinel } from './components/NetworkSentinel';
import { BluetoothSpecBridge } from './components/BluetoothSpecBridge';
import { PackagingSuite } from './components/PackagingSuite';
import { CodingNetworkView } from './components/CodingNetworkView';
import { NetworkCovenant } from './components/NetworkCovenant';
import { FCCNetworkView } from './components/FCCNetworkView';
import { TimelineView } from './components/TimelineView';
import { CollaborativePlaylistView } from './components/CollaborativePlaylistView';
import { EngineeringLabView } from './components/EngineeringLabView';
import { KineticsLabView } from './components/KineticsLabView';
import { QuantumTheoryLabView } from './components/QuantumTheoryLabView';
import { RaceLabView } from './components/RaceLabView';
import { ChemistryLabView } from './components/ChemistryLabView';
import { PaleontologyLabView } from './components/PaleontologyLabView';
import { RawMineralLabView } from './components/RawMineralLabView';
import { ClothingLabView } from './components/ClothingLabView';
import { ConceptsLabView } from './components/ConceptsLabView';
import { SanitizationLabView } from './components/SanitizationLabView';
import { LawsJusticeLabView } from './components/LawsJusticeLabView';
import { TruthLabView } from './components/TruthLabView';
import { TestingLabView } from './components/TestingLabView';
import { WindowsLabView } from './components/WindowsLabView';
import { LinuxLabView } from './components/LinuxLabView';
import { MacOSLabView } from './components/MacOSLabView';
import { AppleLabView } from './components/AppleLabView';
import { MissionLabView } from './components/MissionLabView';
import { CodingNetworkTeachersView } from './components/CodingNetworkTeachersView';
import { CellphoneLabView } from './components/CellphoneLabView';
import { SamplingLabView } from './components/SamplingLabView';
import { HardCodeLabView } from './components/HardCodeLabView';
import { LibraryView } from './components/LibraryView';
import { PornographyStudioView } from './components/PornographyStudioView';
import { MasterExpertiseDinnerBell } from './components/MasterExpertiseDinnerBell';
import { NetworkDirectiveIntake } from './components/NetworkDirectiveIntake';
import { SquadStatusTracker } from './components/SquadStatusTracker';
import { SistersIgnition } from './components/SistersIgnition';
import { VerificationGatesView } from './components/VerificationGatesView';
import { VehicleTelemetryLabView } from './components/VehicleTelemetryLabView';
import { ConjunctionGatesView } from './components/ConjunctionGatesView';

import { 
    CodeIcon, MovieIcon, ThermometerIcon, AtomIcon, FlagIcon, FlaskIcon, DinoIcon, 
    GemIcon, ShirtIcon, ConceptIcon, CleanIcon, GavelIcon, TruthIcon, TestTubeIcon, 
    WindowsIcon, LinuxIcon, AppleIcon, MissionIcon, PhoneIcon, ScaleIcon, SignalIcon, 
    TerminalIcon, LogicIcon, ShieldIcon, ActivityIcon, ZapIcon, FireIcon, SpinnerIcon, 
    CheckCircleIcon, BuildIcon, VaultIcon, SearchIcon, BookOpenIcon, UserIcon, ClockIcon,
    GlobeIcon, PlusIcon, XIcon, PinIcon, ShareIcon, ArchiveIcon, RulesIcon, BotIcon, ServerIcon, SteeringWheelIcon
} from './components/icons';

// --- LocalStorage Keys ---
const MODULES_KEY = 'aetherosModules';
const PINS_KEY = 'aetherosPins';
const VIEW_KEY = 'aetherosCurrentView';
const DIRECTIVE_KEY = 'aetherosGlobalDirective';
const PROJECTS_KEY = 'aetherosProjects';
const PROGRESS_KEY = 'aetherosProgress';

const App: React.FC = () => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  
  const [inputText, setInputText] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  // --- Progression Engine State ---
  const [progress, setProgress] = useState<ConjunctionProgress>(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    return saved ? JSON.parse(saved) : {
        shards: 0,
        globalMisery: 12,
        unlockedViews: ['vault', 'diagnostics', 'communications', 'library_view', 'coding_network', 'conjunction_gates'],
        level: 1
    };
  });

  // --- Persona & Squad States ---
  const [sisters, setSisters] = useState<SistersState>({
    aethera: { active: true, load: 42 },
    logica: { active: false, load: 0 },
    sophia: { active: false, load: 0 }
  });

  const [squad, setSquad] = useState<SquadMember[]>([
    { id: 'node-01', name: 'Alpha-EPYC', type: 'EPYC', status: 'STABLE', load: 14, temp: 32 },
    { id: 'node-02', name: 'Beta-XEON', type: 'XEON', status: 'STABLE', load: 8, temp: 28 },
    { id: 'node-03', name: 'Gamma-FPGA', type: 'FPGA', status: 'STABLE', load: 45, temp: 42 },
  ]);

  // Global Conduction State
  const [globalDirective, setGlobalDirective] = useState<GlobalDirective | undefined>(() => {
    const saved = localStorage.getItem(DIRECTIVE_KEY);
    return saved ? JSON.parse(saved) : undefined;
  });

  const [currentView, setCurrentView] = useState<MainView>(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    return (saved as MainView) || 'conjunction_gates';
  });

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [timeFormat, setTimeFormat] = useState<'12hr' | '24hr'>('24hr');

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    'Engine': 'OK', 'Battery': 'OK', 'Navigation': 'OK', 'Infotainment': 'OK', 'Handling': 'OK',
  });

  const [evoLibrary, setEvoLibrary] = useState<EvoLibrary | null>(null);
  const [lastBroadcast, setLastBroadcast] = useState<BroadcastMessage | null>(null);
  const [savedModules, setSavedModules] = useState<SavedModule[]>([]);
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [networkProjects, setNetworkProjects] = useState<NetworkProject[]>([]);
  const [moduleMixes, setModuleMixes] = useState<ModuleMix[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [customCommands, setCustomCommands] = useState<CustomCommand[]>([]);

  useEffect(() => {
    fetch('./evo.json').then(r => r.json()).then(setEvoLibrary).catch(console.error);
    const savedMod = localStorage.getItem(MODULES_KEY);
    if (savedMod) setSavedModules(JSON.parse(savedMod));
    const savedProj = localStorage.getItem(PROJECTS_KEY);
    if (savedProj) setNetworkProjects(JSON.parse(savedProj));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentDateTime(new Date());
        setSquad(prev => prev.map(n => ({
            ...n,
            load: Math.max(0, Math.min(100, n.load + (Math.random() - 0.5) * 5)),
            temp: Math.max(20, Math.min(85, n.temp + (Math.random() - 0.5) * 1.5))
        })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync Persistence
  useEffect(() => { localStorage.setItem(MODULES_KEY, JSON.stringify(savedModules)); }, [savedModules]);
  useEffect(() => { localStorage.setItem(VIEW_KEY, currentView); }, [currentView]);
  useEffect(() => { localStorage.setItem(DIRECTIVE_KEY, JSON.stringify(globalDirective)); }, [globalDirective]);
  useEffect(() => { localStorage.setItem(PROJECTS_KEY, JSON.stringify(networkProjects)); }, [networkProjects]);
  useEffect(() => { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); }, [progress]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!session) return;
    setIsLoading(true);
    try {
        const stream = sendMessage(session.chat, text, attachedFiles);
        let fullResponse = '';
        for await (const chunk of stream) {
            fullResponse += chunk.textChunk;
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
        setAttachedFiles([]);
    }
  }, [session, attachedFiles]);

  const handleSetGlobalDirective = (directive: GlobalDirective | undefined) => {
      setGlobalDirective(directive);
  };

  const handleIgniteSister = (name: keyof SistersState) => {
    setSisters(prev => ({
        ...prev,
        [name]: { active: true, load: 100 }
    }));
    handleActionReward(5); // Igniting a sister grants shards
  };

  const handleActionReward = (shards: number) => {
      setProgress(prev => ({
          ...prev,
          shards: prev.shards + shards,
          globalMisery: Math.max(0, prev.globalMisery - (shards * 0.1))
      }));
  };

  const handleUnlockView = (view: MainView, cost: number) => {
      if (progress.shards >= cost && !progress.unlockedViews.includes(view)) {
          setProgress(prev => ({
              ...prev,
              shards: prev.shards - cost,
              unlockedViews: [...prev.unlockedViews, view]
          }));
          return true;
      }
      return false;
  };

  const renderMainView = () => {
    const labProps = { globalDirective, onActionReward: handleActionReward };

    // Check if view is locked
    if (!progress.unlockedViews.includes(currentView)) {
        return <ConjunctionGatesView progress={progress} onUnlock={handleUnlockView} onSetView={setCurrentView} />;
    }

    switch (currentView) {
        case 'conjunction_gates':
            return <ConjunctionGatesView progress={progress} onUnlock={handleUnlockView} onSetView={setCurrentView} />;
        case 'coding_network': 
            return <CodingNetworkView 
                projects={networkProjects} 
                setProjects={setNetworkProjects} 
                onNavigateToAgent={() => setCurrentView('coding_network_teachers')}
                onSetDirective={handleSetGlobalDirective}
                activeDirective={globalDirective}
            />;
        case 'vault': return <OperationsVault onSetView={setCurrentView} systemStatus={systemStatus} evoLibrary={evoLibrary} lastBroadcast={lastBroadcast} lastMessage={session?.messages[session.messages.length - 1] || { sender: 'model', content: 'Awaiting signal.', timestamp: new Date() }} savedModulesCount={savedModules.length} savedCommandsCount={customCommands.length} pinnedItems={pinnedItems} onTogglePin={() => {}} onExecuteCommand={handleSendMessage} activeDirective={globalDirective} />;
        case 'engineering_lab': return <EngineeringLabView {...labProps} onGenerate={generateSoftwareModule} labName="ENGINEERING LAB" labIcon={BuildIcon} labColor="text-amber-400" />;
        case 'hard_code_lab': return <HardCodeLabView {...labProps} labName="HARD CODE LAB" labIcon={CodeIcon} labColor="text-red-800" />;
        case 'truth_lab': return <TruthLabView {...labProps} labName="TRUTH LAB" labIcon={TruthIcon} labColor="text-rose-500" />;
        case 'kinetics_lab': return <KineticsLabView {...labProps} labName="KINETICS LAB" labIcon={ThermometerIcon} labColor="text-orange-400" />;
        case 'quantum_theory_lab': return <QuantumTheoryLabView {...labProps} labName="QUANTUM LAB" labIcon={AtomIcon} labColor="text-fuchsia-400" />;
        case 'chemistry_lab': return <ChemistryLabView {...labProps} labName="CHEMISTRY LAB" labIcon={FlaskIcon} labColor="text-emerald-400" />;
        case 'race_lab': return <RaceLabView {...labProps} labName="RACE LAB" labIcon={FlagIcon} labColor="text-lime-400" />;
        case 'paleontology_lab': return <PaleontologyLabView {...labProps} labName="PALEONTOLOGY LAB" labIcon={DinoIcon} labColor="text-yellow-700" />;
        case 'raw_mineral_lab': return <RawMineralLabView {...labProps} labName="RAW MINERAL LAB" labIcon={GemIcon} labColor="text-stone-400" />;
        case 'clothing_lab': return <ClothingLabView {...labProps} labName="CLOTHING LAB" labIcon={ShirtIcon} labColor="text-pink-400" />;
        case 'concepts_lab': return <ConceptsLabView {...labProps} labName="CONCEPTS LAB" labIcon={ConceptIcon} labColor="text-indigo-400" />;
        case 'sanitization_lab': return <SanitizationLabView {...labProps} labName="SANITIZATION LAB" labIcon={CleanIcon} labColor="text-teal-400" />;
        case 'laws_justice_lab': return <LawsJusticeLabView {...labProps} labName="LAWS & JUSTICE LAB" labIcon={GavelIcon} labColor="text-amber-500" />;
        case 'windows_lab': return <WindowsLabView {...labProps} labName="WINDOWS LAB" labIcon={WindowsIcon} labColor="text-sky-400" />;
        case 'linux_lab': return <LinuxLabView {...labProps} labName="LINUX LAB" labIcon={LinuxIcon} labColor="text-green-400" />;
        case 'mac_os_lab': return <MacOSLabView {...labProps} labName="MAC OS LAB" labIcon={AppleIcon} labColor="text-purple-400" />;
        case 'apple_lab': return <AppleLabView {...labProps} labName="APPLE LAB" labIcon={AppleIcon} labColor="text-red-400" />;
        case 'mission_lab': return <MissionLabView {...labProps} labName="MISSION LAB" labIcon={MissionIcon} labColor="text-blue-400" />;
        case 'cell_phone_lab': return <CellphoneLabView {...labProps} labName="CELL PHONE LAB" labIcon={PhoneIcon} labColor="text-gray-500" />;
        case 'sampling_lab': return <SamplingLabView {...labProps} labName="SAMPLING LAB" labIcon={ScaleIcon} labColor="text-yellow-400" />;
        case 'pornography_studio': return <PornographyStudioView {...labProps} labName="PORNOGRAPHY STUDIO" labIcon={MovieIcon} labColor="text-red-900" />;
        case 'vehicle_telemetry_lab': return <VehicleTelemetryLabView {...labProps} labName="VEHICLE TELEMETRY" labIcon={SteeringWheelIcon} labColor="text-cyan-400" />;
        case 'projects': return <ProjectNetwork projects={networkProjects} onDeleteProject={id => setNetworkProjects(prev => prev.filter(p => p.id !== id))} />;
        case 'forge': return <ForgeView blueprints={[]} onAddBlueprint={() => {}} onUpdateBlueprintStatus={() => {}} onDeleteBlueprint={() => {}} onAddTask={() => {}} onToggleTask={() => {}} onDeleteTask={() => {}} />;
        case 'diagnostics': return <DiagnosticsCenter onSetView={setCurrentView} />;
        case 'communications': return <CommunicationsView injectedCommand={null} onCommandInjected={() => {}} onNewBroadcast={setLastBroadcast} />;
        case 'singularity_engine': return <SingularityEngineView knowledgeBaseSize={0} onConsumeKnowledge={() => {}} onProjectize={() => {}} onGoToNetwork={() => setCurrentView('projects')} />;
        case 'enlightenment_pool': return <EnlightenmentPoolView />;
        case 'coding_network_teachers': return <CodingNetworkTeachersView onNavigateToLab={setCurrentView} />;
        case 'library_view': return <LibraryView libraryItems={libraryItems} onAddLibraryItem={(item) => { setLibraryItems(prev => [...prev, item]); handleActionReward(2); }} />;
        case 'timeline': return <TimelineView />;
        case 'covenant': return <NetworkCovenant />;
        case 'up_north': return <UpNorthProtocol onSetView={setCurrentView} />;
        case 'device_link': return <DeviceLinkView status="disconnected" device={null} onConnect={() => {}} onDisconnect={() => {}} lastModule={null} />;
        case 'bluetooth_bridge': return <BluetoothSpecBridge />;
        case 'launch_center': return <LaunchCenterView />;
        case 'verification_gates': return <VerificationGatesView />;
        case 'room_of_play': return <RoomOfPlayView modules={savedModules} onDeleteModule={id => setSavedModules(p => p.filter(m => m.id !== id))} pinnedItems={pinnedItems} onTogglePin={() => {}} moduleMixes={moduleMixes} onAddModuleMix={(m, r) => setModuleMixes(p => [...p, { id: uuidv4(), modules: m, mixResult: r, timestamp: new Date() }])} />;
        default: return <Launchpad />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-black text-white overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      <Sidebar 
        systemStatus={systemStatus} 
        systemDetails={{}}
        currentView={currentView}
        onSetView={setCurrentView}
        currentDateTime={currentDateTime}
        timeFormat={timeFormat}
        onToggleTimeFormat={() => setTimeFormat(prev => prev === '12hr' ? '24hr' : '12hr')}
        unlockedViews={progress.unlockedViews}
      />
      
      {/* Right-side Persona Bar: Squad & Sisters */}
      <aside className="w-48 h-full bg-[#050505] border-l-4 border-black flex flex-col z-40 order-last hidden lg:flex">
         <div className="flex-1 overflow-hidden flex flex-col">
            <div className="h-1/2 border-b-2 border-white/5 overflow-hidden">
                <SquadStatusTracker squad={squad} />
            </div>
            <div className="h-1/2 overflow-hidden flex flex-col">
                <SistersIgnition sisters={sisters} onIgnite={handleIgniteSister} />
            </div>
         </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] relative overflow-hidden">
        <NetworkDirectiveIntake directive={globalDirective} />
        
        <div className="flex-1 overflow-hidden relative">
            {renderMainView()}
        </div>
        
        {/* Progression HUD Mini */}
        <div className="absolute bottom-20 right-6 flex flex-col items-end gap-2 pointer-events-none">
            <div className="bg-black/80 border-2 border-amber-600/50 p-2 rounded-lg flex items-center gap-3 backdrop-blur-md shadow-2xl">
                <ZapIcon className="w-4 h-4 text-amber-500 animate-pulse" />
                <div className="flex flex-col">
                    <span className="text-[7px] text-gray-500 font-black uppercase">Epitume Shards</span>
                    <span className="text-sm font-black text-amber-500">{progress.shards.toFixed(0)}</span>
                </div>
            </div>
            <div className="bg-black/80 border-2 border-red-600/50 p-2 rounded-lg flex items-center gap-3 backdrop-blur-md shadow-2xl">
                <FireIcon className="w-4 h-4 text-red-500" />
                <div className="flex flex-col">
                    <span className="text-[7px] text-gray-500 font-black uppercase">System Misery</span>
                    <span className="text-sm font-black text-red-500">{progress.globalMisery.toFixed(1)}%</span>
                </div>
            </div>
        </div>

        <MasterExpertiseDinnerBell onTriggerBell={() => handleActionReward(1)} />
      </main>
    </div>
  );
};

export default App;
