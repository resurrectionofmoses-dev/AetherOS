import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import type { 
    ChatMessage, AttachedFile, ChatSession, SystemStatus, MainView, EvoLibrary, 
    BroadcastMessage, SavedModule, CustomCommand, PinnedItem, ArchiveEntry, 
    ProjectBlueprint, BlueprintStatus, GlobalDirective, SquadMember, 
    ConjunctionProgress, Checkpoint, ScoredItem, LineageEntry, DominanceStats,
    NetworkProject, LibraryItem, SistersState, BlueprintPriority
} from './types';
import { SYSTEM_INSTRUCTIONS, CONTINUITY_CONFIG } from './constants';
import { startChatSession, generateSoftwareModule, sendMessageSovereign, scanBinaryFile } from './services/geminiService';
import { safeStorage } from './services/safeStorage';
import { extractJSON, estimateTokens } from './utils';
import { sessionLedger } from './services/tokenLedger';
import { provenanceVault } from './services/checkpointStore';
import { candidateStore } from './services/candidateStore';
import { contextAssembler, AssemblyResult } from './services/contextAssembler';
import { Summarizer } from './services/summarizer';
import { ResonanceFrequencyMeter } from './components/ResonanceFrequencyMeter';
import { EmergencyKillSwitch } from './services/emergencyKillSwitch';
import { KillSwitchOverlay } from './components/KillSwitchOverlay';
import { shroud } from './services/encryptionService';
import { TheShroud } from './components/TheShroud';
import { Launchpad } from './components/Launchpad';
import { Sidebar } from './components/Sidebar';
import { DiagnosticsCenter } from './components/DiagnosticsCenter';
import { OperationsVault } from './components/OperationsVault';
import { ForgeView } from './components/ForgeView';
import { CodeAgentView } from './components/CodeAgentView';
import { ProjectNetwork } from './components/ProjectNetwork';
import { IntegrityNetworkView } from './components/IntegrityNetworkView';
import { LaunchCenterView } from './components/LaunchCenterView';
import { CodingNetworkView } from './components/CodingNetworkView';
import { NetworkCovenant } from './components/NetworkCovenant';
import { TimelineView } from './components/TimelineView';
import { CollaborativePlaylistView } from './components/CollaborativePlaylistView';
import { EngineeringLabView } from './components/EngineeringLabView';
import { HardCodeLabView } from './components/HardCodeLabView';
import { TruthLabView } from './components/TruthLabView';
import { CodingNetworkTeachersView } from './components/CodingNetworkTeachersView';
import { CellphoneLabView } from './components/CellphoneLabView';
import { SamplingLabView } from './components/SamplingLabView';
import { LibraryView } from './components/LibraryView';
import { PornographyStudioView } from './components/PornographyStudioView';
import { MasterExpertiseDinnerBell } from './components/MasterExpertiseDinnerBell';
import { NetworkDirectiveIntake } from './components/NetworkDirectiveIntake';
import { SquadStatusTracker } from './components/SquadStatusTracker';
import { SistersIgnition } from './components/SistersIgnition';
import { VehicleTelemetryLabView } from './components/VehicleTelemetryLabView';
import { ConjunctionGatesView } from './components/ConjunctionGatesView';
import { HyperSpatialLab } from './components/HyperSpatialLab';
import { ElizaTerminal } from './components/ElizaTerminal';
import { ShardStoreView } from './components/ShardStoreView';
import { StealthWatcher } from './components/StealthWatcher';
import { OmniBuilderUI } from './components/OmniBuilderUI';
import { GoldConjunction } from './components/GoldConjunction';
import { HealingMatrix } from './components/HealingMatrix';
import { UnifiedChainView } from './components/UnifiedChainView';
import { InputBar } from './components/InputBar';
import { ChatView } from './components/ChatView';
import { ChatHeader } from './components/ChatHeader';
import { FuelEfficiencyOptimizer } from './components/FuelEfficiencyOptimizer';

import { 
    CodeIcon, SignalIcon, ZapIcon, FireIcon, BuildIcon, VaultIcon, UserIcon, GlobeIcon, 
    SteeringWheelIcon, ForgeIcon, ShieldIcon, GaugeIcon
} from './components/icons';

// --- LocalStorage Keys ---
const MODULES_KEY = 'aetherosModules';
const VIEW_KEY = 'aetherosCurrentView';
const DIRECTIVE_KEY = 'aetherosGlobalDirective';
const PROJECTS_KEY = 'aetherosProjects';
const BLUEPRINTS_KEY = 'aetherosBlueprints';
const PROGRESS_KEY = 'aetherosProgress';
const TERMINAL_MODE_KEY = 'aetherosTerminalMode';
const VAULT_LEDGER_KEY = 'AETHER_VAULT_LEDGER';
const DOMINANCE_KEY = 'aetherosDominance';

const App: React.FC = () => {
  // --- 1. SYSTEM PERSISTENCE & SOVEREIGNTY ---
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTerminalMode, setIsTerminalMode] = useState(() => {
    return safeStorage.getItem(TERMINAL_MODE_KEY) === 'true';
  });
  
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [lastAssembly, setLastAssembly] = useState<AssemblyResult | null>(null);
  const [isBypassing, setIsBypassing] = useState(false);
  const [retryLevel, setRetryLevel] = useState(0);
  const [isKineticHalted, setIsKineticHalted] = useState(EmergencyKillSwitch.isActive);
  
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);

  // Stealth Watcher States
  const shroudLocked = true; 
  const [dissonanceLevel, setDissonanceLevel] = useState(0);
  const [strideRate, setStrideRate] = useState(1.2);

  // --- 2. THE SQUAD: AUTONOMOUS NODES ---
  const [squad, setSquad] = useState<SquadMember[]>([
    { id: 'node-01', name: 'Alpha-EPYC', type: 'EPYC', status: 'STABLE', load: 14, temp: 32, autonomy: 0.8 },
    { id: 'node-02', name: 'Beta-XEON', type: 'XEON', status: 'STABLE', load: 8, temp: 28, autonomy: 0.5 },
    { id: 'node-03', name: 'Gamma-FPGA', type: 'FPGA', status: 'STABLE', load: 45, temp: 42, autonomy: 0.9 },
  ]);

  // --- 3. THE SISTERS: PERSONA IGNITION ---
  const [sisters, setSisters] = useState({
    aethera: { active: true, load: 42 },
    logica: { active: false, load: 0 },
    sophia: { active: false, load: 0 }
  });

  // --- Progression Engine State ---
  const [progress, setProgress] = useState<ConjunctionProgress>(() => {
    const saved = safeStorage.getItem(PROGRESS_KEY);
    return extractJSON<ConjunctionProgress>(saved || '', {
        shards: 0,
        globalMisery: 12,
        unlockedViews: ['vault', 'diagnostics', 'communications', 'library_view', 'coding_network', 'conjunction_gates', 'unified_chain', 'hyper_spatial_lab', 'forge', 'eliza_terminal', 'shard_store', 'omni_builder', 'gold_conjunction', 'healing_matrix', 'chat', 'fuel_optimizer'],
        level: 1
    });
  });

  // --- Dominance Tracking ---
  const [dominance, setDominance] = useState<DominanceStats>(() => {
      const saved = safeStorage.getItem(DOMINANCE_KEY);
      return extractJSON<DominanceStats>(saved || '', {
          level: 1,
          score: 0,
          hasWonWinter: false,
          terrorStreak: 0
      });
  });

  // Global Conduction State
  const [globalDirective, setGlobalDirective] = useState<GlobalDirective | undefined>(() => {
    const saved = safeStorage.getItem(DIRECTIVE_KEY);
    return extractJSON<GlobalDirective | undefined>(saved || '', undefined);
  });

  const [currentView, setCurrentView] = useState<MainView>(() => {
    const saved = safeStorage.getItem(VIEW_KEY);
    return (saved as MainView) || 'unified_chain';
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
  const [networkProjects, setNetworkProjects] = useState<NetworkProject[]>(() => {
    const saved = safeStorage.getItem(PROJECTS_KEY);
    const parsed = extractJSON<any[]>(saved || '', []);
    if (parsed.length > 0) return parsed;
    return [
      {
        id: uuidv4(),
        title: 'Cognitive Loop Bridge',
        description: 'Implementing a self-documenting lore injector to bridge AI drift and sovereign intent.',
        miseryScore: 92,
        crazyLevel: 10,
        status: 'BUILDING',
        isWisdomHarmonized: true,
        timestamp: new Date(),
        tasks: [
            { id: uuidv4(), text: 'Synthesize LoreInjector.ts', completed: true },
            { id: uuidv4(), text: 'Ground Maestro in Manifest', completed: false }
        ],
        assetType: 'KERNEL'
      },
      {
        id: uuidv4(),
        title: 'Hyper-Spatial Mesh Protocol',
        description: 'A 4D mesh network for data conduction across high-latency temporal sectors.',
        miseryScore: 78,
        crazyLevel: 9,
        status: 'IDEATING',
        isWisdomHarmonized: false,
        timestamp: new Date(),
        tasks: [
            { id: uuidv4(), text: 'Define W-Axis boundaries', completed: false },
            { id: uuidv4(), text: 'Initialize quantum entropy seed', completed: false }
        ],
        assetType: 'RTLS'
      }
    ];
  });

  const [blueprints, setBlueprints] = useState<ProjectBlueprint[]>(() => {
    const saved = safeStorage.getItem(BLUEPRINTS_KEY);
    const parsed = extractJSON<any[]>(saved || '', []);
    if (parsed.length > 0) {
        return parsed.map((bp: any) => ({ ...bp, timestamp: new Date(bp.timestamp), tasks: bp.tasks || [] }));
    }
    return [
        {
            id: uuidv4(),
            title: "Real-Time Telemetry Module",
            description: "Sovereign data acquisition shard for absolute vehicle diagnostics.",
            status: "In Progress",
            priority: "High",
            timestamp: new Date(),
            tasks: [
                { id: uuidv4(), text: "Define forensic data schema (VDM-01)", completed: true },
                { id: uuidv4(), text: "Implement OBD-II communication interface", completed: false },
                { id: uuidv4(), text: "Develop data buffering/transmission logic", completed: false },
                { id: uuidv4(), text: "Validate 0x03E2 transmission integrity", completed: false }
            ]
        }
    ];
  });

  const [libraryItems] = useState<LibraryItem[]>([]);
  const [customCommands] = useState<CustomCommand[]>([]);

  // --- 6. THE LINEAGE TRACKER: ENFORCING THE LAW ---
  const traceParentage = useCallback((content: string, parentId: string, type: LineageEntry['type'] = 'THOUGHT'): LineageEntry => {
    const lineageId = uuidv4();
    return { 
      id: lineageId, 
      parent: parentId, 
      content, 
      type, 
      timestamp: Date.now(), 
      integrityHash: btoa(lineageId + parentId) 
    };
  }, []);

  const saveToOperationsVault = useCallback(async (entry: LineageEntry) => {
    try {
      const isTerrorLevel = entry.type === 'WOUND';
      const processedContent = shroud.isLocked 
        ? entry.content 
        : await shroud.encrypt(entry.content);

      const securedEntry: LineageEntry = { 
        ...entry, 
        content: processedContent, 
        encrypted: !shroud.isLocked,
        securityLevel: isTerrorLevel ? 'TERRORGATE' : 'RESTRICTED',
        sealedAt: Date.now() 
      };

      const rawVault = safeStorage.getItem(VAULT_LEDGER_KEY);
      const vaultChain = extractJSON<any[]>(rawVault || '', []);
      const updatedVault = [...vaultChain, securedEntry];
      safeStorage.setItem(VAULT_LEDGER_KEY, JSON.stringify(updatedVault));
      
      setLastBroadcast({
        id: uuidv4(),
        source: 'VAULT_GOVERNOR',
        type: 'SHARD_SECURED',
        text: `Logic shard ${securedEntry.id.slice(0, 8)} anchored.`,
        timestamp: new Date(),
        color: securedEntry.securityLevel === 'TERRORGATE' ? 'text-red-500 font-bold' : 'text-cyan-400'
      });

      setDominance(prev => {
          const newScore = Math.min(100, prev.score + (isTerrorLevel ? 5 : 2));
          const hasWonValue = newScore >= 100;
          return { ...prev, score: newScore, hasWonWinter: hasWonValue || prev.hasWonWinter };
      });
    } catch (e) {
      console.error("[VAULT_SEC_FAILURE]", e);
    }
  }, []);

  const handleSystemFracture = useCallback((error: any) => {
    const originId = session?.id || 'ROOT_ORIGIN';
    const entry = traceParentage(`FRACTURE: ${error.message || 'Semantic stall'}`, originId, 'WOUND');
    saveToOperationsVault(entry);
    setSystemStatus(prev => ({ ...prev, 'Engine': 'Error' }));
    setCurrentView('diagnostics');
  }, [session, traceParentage, saveToOperationsVault]);

  useEffect(() => {
    fetch('./evo.json')
      .then(r => r.ok ? r.json() : null)
      .then(setEvoLibrary)
      .catch(e => console.error(e));
      
    const savedMod = safeStorage.getItem(MODULES_KEY);
    if (savedMod) setSavedModules(extractJSON(savedMod, []));
  }, []);

  // --- 29. NEURAL NEXUS INITIALIZATION ---
  useEffect(() => {
    const initChat = async () => {
        try {
            // Establish Blockchain of Conversation turn tracking
            sessionLedger.startSession('main-conduction');
            
            // Initialize the high-integrity multi-turn chat session with the Maestro's Rules
            const chat = startChatSession(SYSTEM_INSTRUCTIONS.aetheros, []);
            
            // Anchor the session with the requested Genesis message and timestamp
            setSession({
                id: uuidv4(),
                mode: 'aetheros',
                messages: [{ 
                    sender: 'model', 
                    content: "Maestro is at the podium. Absolute conduction initialized.", 
                    timestamp: new Date() 
                }],
                chat,
                name: 'The Original Intent',
                totalTokens: 0
            });
        } catch (error) {
            console.error("Failed to initialize Maestro Nexus:", error);
            handleSystemFracture(error);
        }
    };
    initChat();
  }, []);

  useEffect(() => {
    const conductorInterval = setInterval(() => {
        setCurrentDateTime(new Date());
        const newStride = Math.max(1.0, Math.min(1.5, strideRate + (Math.random() - 0.5) * 0.1));
        setStrideRate(newStride);
        setDissonanceLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.45) * 5)));
        setSquad(prev => prev.map(node => ({
            ...node, 
            status: isKineticHalted ? 'GHOST' : (node.load > 80 ? 'BUSY' : 'STABLE'),
            load: isKineticHalted ? 0 : Math.max(5, Math.min(100, node.load + (Math.random() - 0.5) * 8)),
            temp: isKineticHalted ? 20 : Math.max(20, Math.min(85, node.temp + (Math.random() - 0.5) * 2))
        })));
    }, 2000);
    return () => clearInterval(conductorInterval);
  }, [isKineticHalted, strideRate]);

  useEffect(() => {
    return EmergencyKillSwitch.monitorHeartbeat((msg) => {
      setLastBroadcast({ id: uuidv4(), source: 'WATCHDOG', text: msg, timestamp: new Date(), color: 'text-amber-500' });
      setDissonanceLevel(prev => prev + 15);
    });
  }, []);

  useEffect(() => { safeStorage.setItem(MODULES_KEY, JSON.stringify(savedModules)); }, [savedModules]);
  useEffect(() => { safeStorage.setItem(VIEW_KEY, currentView); }, [currentView]);
  useEffect(() => { safeStorage.setItem(DIRECTIVE_KEY, JSON.stringify(globalDirective)); }, [globalDirective]);
  useEffect(() => { safeStorage.setItem(PROJECTS_KEY, JSON.stringify(networkProjects)); }, [networkProjects]);
  useEffect(() => { safeStorage.setItem(BLUEPRINTS_KEY, JSON.stringify(blueprints)); }, [blueprints]);
  useEffect(() => { safeStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); }, [progress]);
  useEffect(() => { safeStorage.setItem(TERMINAL_MODE_KEY, isTerminalMode.toString()); }, [isTerminalMode]);
  useEffect(() => { safeStorage.setItem(DOMINANCE_KEY, JSON.stringify(dominance)); }, [dominance]);

  const handleIgniteSister = useCallback((name: keyof SistersState) => {
    setSisters(prev => ({
      ...prev,
      [name]: { ...prev[name as keyof typeof prev], active: true }
    }));
  }, []);

  const handleSendMessage = useCallback(async (text: string, retryCount = 0) => {
    if (!session || retryCount > 3) return;
    
    // Command Intercept: /heal
    if (text.trim().toLowerCase() === '/heal') {
        setCurrentView('healing_matrix');
        return;
    }

    setIsLoading(true);
    setIsBypassing(retryCount > 0);
    setRetryLevel(retryCount);
    
    try {
        const userTokens = estimateTokens(text);
        const summarizer = new Summarizer();
        const processedText = await shroud.encrypt(text);

        const assembly = await contextAssembler.assemblePrompt('main-conduction', processedText, userTokens, sessionLedger, provenanceVault);
        setLastAssembly(assembly);
        
        const response = await sendMessageSovereign(session.chat, assembly.prompt, attachedFiles);
        const modelTokens = estimateTokens(response);
        const finalResponse = await shroud.decrypt(response);

        sessionLedger.recordTurn('main-conduction', uuidv4().slice(0, 8), userTokens, modelTokens);

        const userVector = await summarizer.embed(text);
        const modelVector = await summarizer.embed(finalResponse);

        candidateStore.addShard('main-conduction', { id: uuidv4(), raw_text: text, intent_vector: userVector, tokens: userTokens, timestamp: Date.now() / 1000, dependency_count: 0, user_flag: true });
        candidateStore.addShard('main-conduction', { id: uuidv4(), raw_text: finalResponse, intent_vector: modelVector, tokens: modelTokens, timestamp: Date.now() / 1000, dependency_count: 1, user_flag: false });

        setSession(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                messages: [...prev.messages, { sender: 'user', content: text, timestamp: new Date(), tokens: userTokens }, { sender: 'model', content: finalResponse, timestamp: new Date(), tokens: modelTokens }],
                totalTokens: (prev.totalTokens || 0) + userTokens + modelTokens
            };
        });
        setProgress(p => ({ ...p, shards: p.shards + 2 }));
        setInputText('');
    } catch (e) {
        handleSystemFracture(e);
    } finally {
        setIsLoading(false);
        setIsBypassing(false);
        setAttachedFiles([]);
    }
  }, [session, attachedFiles, handleSystemFracture]);

  const handleFilesChange = async (files: FileList | null) => {
    if (!files) return;
    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
            reader.onload = (e) => {
                const result = e.target?.result as string;
                resolve(result.split(',')[1]);
            };
            reader.readAsDataURL(file);
        });
        newFiles.push({
            name: file.name,
            type: file.type,
            content: base64,
            scanStatus: 'unscanned'
        });
    }
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileName: string) => {
    setAttachedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const handleScanFile = async (fileName: string) => {
    const file = attachedFiles.find(f => f.name === fileName);
    if (!file) return;
    
    setAttachedFiles(prev => prev.map(f => f.name === fileName ? { ...f, scanStatus: 'scanning' } : f));
    try {
        const result = await scanBinaryFile(file.name, file.content);
        setAttachedFiles(prev => prev.map(f => f.name === fileName ? { ...f, scanStatus: 'complete', scanResult: result } : f));
    } catch (e) {
        console.error("Scan failed", e);
        setAttachedFiles(prev => prev.map(f => f.name === fileName ? { ...f, scanStatus: 'unscanned' } : f));
    }
  };

  const handleRewardPurchase = (cost: number) => {
    if (progress.shards >= cost) {
      setProgress(p => ({ ...p, shards: p.shards - cost }));
      return true;
    }
    return false;
  };

  const renderMainView = () => {
    const labProps = { globalDirective, onActionReward: (s: number) => setProgress(p => ({ ...p, shards: p.shards + s })) };

    if (!progress.unlockedViews.includes(currentView)) {
        return <ConjunctionGatesView progress={progress} onUnlock={(v, c) => {
            if (progress.shards >= c) {
                setProgress(p => ({ ...p, shards: p.shards - c, unlockedViews: [...p.unlockedViews, v] }));
                return true;
            }
            return false;
        }} onSetView={setCurrentView} />;
    }

    switch (currentView) {
        case 'chat': return (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/40">
            <ChatHeader 
              isTtsEnabled={isTtsEnabled} 
              onToggleTts={() => setIsTtsEnabled(!isTtsEnabled)} 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              startDate={startDate}
              endDate={endDate}
              onDateChange={(s, e) => { setStartDate(s); setEndDate(e); }}
            />
            <ChatView 
              messages={session?.messages || []} 
              isLoading={isLoading} 
              searchQuery={searchQuery}
              startDate={startDate}
              endDate={endDate}
            />
            <InputBar 
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              inputText={inputText}
              setInputText={setInputText}
              isRecording={isRecording}
              onToggleRecording={() => setIsRecording(!isRecording)}
              attachedFiles={attachedFiles}
              onFilesChange={handleFilesChange}
              onRemoveFile={handleRemoveFile}
              onScanFile={handleScanFile}
            />
          </div>
        );
        case 'unified_chain': return <TheShroud><UnifiedChainView sessionTokens={session?.totalTokens || 0} ledger={sessionLedger.getSessionStats('main-conduction')} checkpoints={checkpoints} assembly={lastAssembly} /></TheShroud>;
        case 'shard_store': return <ShardStoreView shards={progress.shards} onPurchase={handleRewardPurchase} onIgniteSister={handleIgniteSister} sisters={sisters as any} />;
        case 'coding_network': return <CodingNetworkView projects={networkProjects} setProjects={setNetworkProjects} onNavigateToAgent={() => setCurrentView('coding_network_teachers')} onSetDirective={setGlobalDirective} activeDirective={globalDirective} onActionReward={labProps.onActionReward} />;
        case 'forge': return <ForgeView blueprints={blueprints} onAddBlueprint={(t, d, p, tasks = []) => setBlueprints(prev => [...prev, { id: uuidv4(), title: t, description: d, status: 'Pending', priority: p, timestamp: new Date(), tasks: tasks.map(text => ({ id: uuidv4(), text, completed: false })) }])} onUpdateBlueprintStatus={(id, s) => setBlueprints(p => p.map(bp => bp.id === id ? { ...bp, status: s } : bp))} onDeleteBlueprint={id => setBlueprints(p => p.filter(bp => bp.id !== id))} onAddTask={(id, t) => setBlueprints(p => p.map(bp => bp.id === id ? { ...bp, tasks: [...bp.tasks, { id: uuidv4(), text: t, completed: false }] } : bp))} onAddTasks={(id, ts) => setBlueprints(p => p.map(bp => bp.id === id ? { ...bp, tasks: [...bp.tasks, ...ts.map(text => ({ id: uuidv4(), text, completed: false }))] } : bp))} onToggleTask={(id, tid) => setBlueprints(p => p.map(bp => bp.id === id ? { ...bp, tasks: bp.tasks.map(t => t.id === tid ? { ...t, completed: !t.completed } : t) } : bp))} onDeleteTask={(id, tid) => setBlueprints(p => p.map(bp => bp.id === id ? { ...bp, tasks: bp.tasks.filter(t => t.id !== tid) } : bp))} />;
        case 'eliza_terminal': return <ElizaTerminal />;
        case 'omni_builder': return <OmniBuilderUI shards={progress.shards} />;
        case 'gold_conjunction': return <GoldConjunction />;
        case 'healing_matrix': return <HealingMatrix />;
        case 'fuel_optimizer': return <FuelEfficiencyOptimizer systemStatus={systemStatus} />;
        case 'vault': return <OperationsVault onSetView={setCurrentView} systemStatus={systemStatus} evoLibrary={evoLibrary} lastBroadcast={lastBroadcast} lastMessage={session?.messages[session.messages.length - 1] || { sender: 'model', content: 'Awaiting signal.', timestamp: new Date() }} savedModulesCount={savedModules.length} savedCommandsCount={customCommands.length} pinnedItems={pinnedItems} onTogglePin={() => {}} onExecuteCommand={handleSendMessage} activeDirective={globalDirective} dominance={dominance} />;
        case 'engineering_lab': return <EngineeringLabView {...labProps} onGenerate={generateSoftwareModule} labName="ENGINEERING LAB" labIcon={BuildIcon} labColor="text-amber-400" />;
        case 'hard_code_lab': return <HardCodeLabView {...labProps} labName="HARD CODE LAB" labIcon={CodeIcon} labColor="text-red-800" />;
        case 'vehicle_telemetry_lab': return <VehicleTelemetryLabView {...labProps} labName="VEHICLE TELEMETRY" labIcon={SteeringWheelIcon} labColor="text-cyan-400" />;
        case 'hyper_spatial_lab': return <HyperSpatialLab {...labProps} labName="HYPER-SPATIAL LAB" labIcon={SignalIcon} labColor="text-amber-500" />;
        case 'diagnostics': return <DiagnosticsCenter onSetView={setCurrentView} />;
        default: return <Launchpad />;
    }
  };

  return (
    <div className={`h-screen w-screen flex bg-black text-white overflow-hidden transition-all duration-1000 ${isTerminalMode ? 'terminal-mode' : ''}`}>
      <Sidebar systemStatus={systemStatus} systemDetails={{}} currentView={currentView} onSetView={setCurrentView} currentDateTime={currentDateTime} timeFormat={timeFormat} onToggleTimeFormat={() => setTimeFormat(prev => prev === '12hr' ? '24hr' : '12hr')} unlockedViews={progress.unlockedViews} onToggleTerminal={() => setIsTerminalMode(p => !p)} isTerminal={isTerminalMode} />
      <StealthWatcher isLocked={shroudLocked} dissonanceLevel={dissonanceLevel} stride={strideRate} />
      <ResonanceFrequencyMeter isActive={isBypassing} level={retryLevel} />
      <KillSwitchOverlay isHalted={isKineticHalted} onTrigger={() => setIsKineticHalted(true)} onReset={() => setIsKineticHalted(false)} />

      <aside className="w-48 h-full bg-[#050505] border-l-4 border-black flex flex-col z-40 order-last hidden lg:flex">
         <div className="flex-1 overflow-hidden flex flex-col">
            <div className="h-1/2 border-b-2 border-white/5 overflow-hidden"><SquadStatusTracker squad={squad} /></div>
            <div className="h-1/2 overflow-hidden flex flex-col"><SistersIgnition sisters={sisters as any} onIgnite={handleIgniteSister} /></div>
         </div>
      </aside>

      <main className={`flex-1 flex flex-col min-w-0 bg-[#0a0a0a] relative overflow-visible transition-all duration-1000 ${isKineticHalted ? 'opacity-30 pointer-events-none blur-sm' : 'opacity-100'}`}>
        <NetworkDirectiveIntake directive={globalDirective} />
        <div className="flex-1 overflow-visible relative">{renderMainView()}</div>
        <div className="absolute bottom-20 right-6 flex flex-col items-end gap-3 pointer-events-none">
            <div className="bg-black/80 border-2 border-amber-600/50 p-2 rounded-lg flex items-center gap-3 backdrop-blur-md shadow-2xl">
                <ZapIcon className="w-4 h-4 text-amber-500 animate-pulse" />
                <div className="flex flex-col">
                    <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Shards</span>
                    <span className="text-sm font-black text-amber-500">{progress.shards}</span>
                </div>
            </div>
        </div>
        <MasterExpertiseDinnerBell onTriggerBell={() => setProgress(p => ({ ...p, shards: p.shards + 1 }))} />
      </main>
    </div>
  );
};

export default App;