
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { AndroidTransition } from './components/AndroidTransition';
import { v4 as uuidv4 } from 'uuid';
import { Toaster } from 'sonner';
import { GlobalErrorHandler, reportError, ErrorSeverity } from './components/GlobalErrorHandler';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { ViewRegistry } from './ViewRegistry';
import { AmbientSoundPlayer } from './components/AmbientSoundPlayer';
import { EmergencyHaltButton } from './components/EmergencyHaltButton';
import { KillSwitchOverlay } from './components/KillSwitchOverlay';
import { EmergencyAlarmOverlay } from './components/EmergencyAlarmOverlay';
import { StealthWatcher } from './components/StealthWatcher';
import { PredictiveBanner } from './components/PredictiveBanner';
import { SonicMetric } from './components/SonicMetric';
import { ConjunctionThroughputMeter } from './components/ConjunctionThroughputMeter';
import { LockdownOverlay } from './components/LockdownOverlay';
import { MatrixCodeRain } from './components/MatrixCodeRain';
import { TopNavBar } from './components/TopNavBar';
import { TheShroud } from './components/TheShroud';
import { WaveVisualizer } from './components/WaveVisualizer';
import { GuestBanner } from './components/GuestBanner';
import { sonicLedger } from './services/sonicLedger';
import { cellularEngine } from './services/cellularEngine';

import { startChatSession, sendMessageSovereign, generateSoftwareModule, checkConnectivity, scanBinaryFile } from './services/geminiService';
import { getMimeType } from './utils';
import { EmergencyKillSwitch } from './services/emergencyKillSwitch';
import { safeStorage } from './services/safeStorage';
import { PredictionEngine } from './services/predictionEngine';
import { useAuth } from './contexts/AuthContext';
import { LoginView } from './components/LoginView';
import { BreakCoordinator } from './components/BreakCoordinator';
import { speechService } from './services/speechService';
import { milestoneService } from './services/milestoneService';
import { sttService } from './services/sttService';
import { DownloadIcon } from './components/icons';
import { VoiceHUDOverlay } from './components/VoiceHUDOverlay';

import type { 
  MainView, SystemStatus, ChatMessage, ProjectBlueprint, 
  NetworkProject, ArchiveEntry, SavedModule, 
  PinnedItem, EvoLibrary, AttachedFile, SystemGovernance,
  SoundscapeType, LibraryItem, ConjunctionProgress, SistersState,
  DominanceStats, DeviceLinkStatus, LinkedDevice, BroadcastMessage,
  PinType, ProjectTask, PredictiveAlert, Vehicle, AISeat, UserProfile
} from './types';
import { AI_SEATS } from './types';
import { TEACHER_PROFILES } from './constants';
import type { TeacherProfile } from './types';

const ALL_VIEWS_LIST: MainView[] = [
  'chat', 'absolute_reliability_network', 'coding_network', 'universal_search', 
  'gold_conjunction', 'shard_store', 'conjunction_gates', 'projects', 'forge', 
  'covenant', 'verification_gates', 'project_chronos', 'build_logs', 'rt_ipc_lab', 
  'sovereign_shield', 'spectre_browser', 'unified_chain', 'fuel_optimizer', 'vault', 
  'healing_matrix', 'laws_justice_lab', 'requindor_scroll', 'omni_builder', 
  'singularity_engine', 'diagnostics', 'communications', 'up_north', 'device_link', 
  'bluetooth_bridge', 'launch_center', 'eliza_terminal', 'code_fall_lab', 
  'alphabet_hexagon', 'powertrain_conjunction', 'hyper_spatial_lab', 'engineering_lab', 
  'hard_code_lab', 'truth_lab', 'testing_lab', 'kinetics_lab', 'quantum_theory_lab', 
  'chemistry_lab', 'race_lab', 'paleontology_lab', 'raw_mineral_lab', 'clothing_lab', 
  'concepts_lab', 'sanitization_lab', 'windows_lab', 'linux_lab', 'mac_os_lab', 
  'apple_lab', 'mission_lab', 'cell_phone_lab', 'sampling_lab', 'pornography_studio', 
  'medical_synthesis_lab', 'vehicle_telemetry_lab', 'coding_network_teachers', 'enlightenment_pool', 
  'library_view', 'timeline', 'amoeba_heritage', 'system_exhaustion', 'recon_vault', 
  'constraints_audit', 'remix_scope_lab', 'vehicle_management', 'unknown_physics_lab', 'logic_pattern_lab', 
  'vulnerability_report', 'tactical_intelligence', 'behavioral_specs', 'cognitive_pipeline', 'data_provenance_lab', 
  'sh_crt_loop', 'user_profile', 'prompt_forge', 'sovereign_standard', 'confusion_logic', 'knowledge_forum', 
  'blockchain_history', 'main_net', 'ecosystem', 'accounts_registry', 'blacklist', 'system_integrity', 
  'vault_manager', 'moderator_lounge', 'biometric_intelligence', 'card_recovery', 'project_showcase', 'quantum_ledger' as any, 'ai_telemetry', 'inevitable_crash', 'scraper_merchant_store', 'data_academy'
];

export const App: React.FC = () => {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState<MainView | 'cellular_grid' | 'voice_authority' | 'constraints_audit' | 'quantum_ledger'>('chat');
    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        Engine: 'OK', Battery: 'OK', Navigation: 'OK', Infotainment: 'OK', Handling: 'OK'
    });
    
    // Sonic/Quantum State
    const [acousticPressure, setAcousticPressure] = useState(0);
    const [harmonicStride, setHarmonicStride] = useState(1.2);
    const [quantumTick, setQuantumTick] = useState(0);

    // Dedicated Acoustic & Activity Density States
    const [isAcousticWarningOpen, setIsAcousticWarningOpen] = useState(false);
    const [acousticThreshold, setAcousticThreshold] = useState(80.0);
    const [isModulatorOpen, setIsModulatorOpen] = useState(false);
    const [isMutedCooldown, setIsMutedCooldown] = useState(false);
    const [muteTimerRemaining, setMuteTimerRemaining] = useState(0);
    const [activityDensity, setActivityDensity] = useState(0);

    const acousticThresholdRef = useRef(80.0);
    const isMutedCooldownRef = useRef(false);

    useEffect(() => {
        acousticThresholdRef.current = acousticThreshold;
    }, [acousticThreshold]);

    useEffect(() => {
        isMutedCooldownRef.current = isMutedCooldown;
    }, [isMutedCooldown]);

    const [userProfile, setUserProfile] = useState<UserProfile>({
        id: 'OP-7734-X',
        username: 'Aetheros_Prime',
        bio: 'Lead architect of the Sovereign Shield. Specializing in recursive self-improvement and high-frequency cognitive pipelines.',
        skills: ['TypeScript', 'React', 'Node.js', 'Quantum Logic', 'System Architecture'],
        lookingForSkills: ['Python', 'AWS', 'Go', 'Rust', 'Solidity'],
        experienceLevel: 'Senior / Lead Architect',
        role: 'operator',
        sovereignty: 'SOVEREIGN_SYSTEM',
        sovereigntyTier: 3,
        portfolioLinks: [
            { id: 'link_1', label: 'GitHub', url: 'https://github.com/aetheros-prime' },
            { id: 'link_2', label: 'Website', url: 'https://aetheros.network' }
        ],
        profileProjects: [
            { id: 'proj_1', title: 'Sovereign Shield', roleDefined: 'Lead Architect', status: 'current', description: 'Real-time multi-dimensional defensive envelope and metric tracking system.' },
            { id: 'proj_2', title: 'Cognitive Pipeline', roleDefined: 'Core Dev', status: 'past', description: 'Autonomous orchestration model integrating high-frequency token generation and feedback matrices.' }
        ]
    });

// App.tsx
    useEffect(() => {
        if (user) {
            setUserProfile(prev => {
                const isGuest = user.role === 'guest';
                const nextUsername = user.displayName || prev.username;
                const nextRole = user.role || 'operator';
                
                // If nothing significant has changed, reuse the previous state reference
                // to prevent downstream reference invalidation loops in components like UserProfileView
                if (
                    prev.username === nextUsername &&
                    prev.role === nextRole &&
                    (!isGuest || (prev.portfolioLinks && prev.portfolioLinks.some(l => l.id === 'glink_1')))
                ) {
                    return prev;
                }

                return {
                    ...prev,
                    username: nextUsername,
                    role: nextRole,
                    portfolioLinks: isGuest ? [
                        { id: 'glink_1', label: 'Sandbox Portfolio', url: 'https://sandbox.aetheros.network/portfolio/guest' },
                        { id: 'glink_2', label: 'Developer Code Hub', url: 'https://github.com/aetheros-prime/guest-observer' },
                        { id: 'glink_3', label: 'Spectre Oracle Portal', url: 'https://spectre.oracle/pulse' }
                    ] : prev.portfolioLinks,
                    profileProjects: isGuest ? [
                        { id: 'gproj_1', title: 'Lattice Alpha Simulator', roleDefined: 'QA Lead Tester', status: 'current', description: 'Simulated high-frequency sandbox testing environment for multi-dimensional consensus validations.' },
                        { id: 'gproj_2', title: 'Aether Wave Demuxer', roleDefined: 'Lattice Observer', status: 'past', description: 'Historic low-frequency acoustic stream demultiplexer and signal decoder.' }
                    ] : prev.profileProjects
                };
            });
        }
    }, [user]);

    // Chat State
    const [isInitializing, setIsInitializing] = useState(true);
    const [activeSeat, setActiveSeat] = useState<AISeat>('sovereign');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentChannel, setCurrentChannel] = useState<'global' | 'moderator'>('global');

    const [isLoading, setIsLoading] = useState(false);

    // Consolidated Data Restoration
    useEffect(() => {
        const restoreState = async () => {
            setIsInitializing(true);
            try {
                // Restore Kill Switch Status
                const haltActive = await EmergencyKillSwitch.checkStatus();
                setIsHalted(haltActive);

                // Restore User Profile
                const savedProfile = await safeStorage.getItem('aetheros_user_profile');
                if (savedProfile) {
                    try {
                        const parsedProfile = JSON.parse(savedProfile);
                        setUserProfile(parsedProfile);
                    } catch (e) {
                        console.error("[AetherOS] Failed to restore user profile", e);
                    }
                }

                // Restore Chat History
                const savedChat = await safeStorage.getItem('aetheros_chat_history');
                if (savedChat) {
                    const parsed = JSON.parse(savedChat);
                    setMessages(parsed.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    })));
                } else {
                    setMessages([{
                        sender: 'model', content: "Quantized Conductor active. State machine established.", timestamp: new Date(), seat: 'sovereign'
                    }]);
                }

                // Restore Blueprints
                const savedBlueprints = await safeStorage.getItem('aetheros_blueprints');
                if (savedBlueprints) {
                    const parsedBlueprints = JSON.parse(savedBlueprints);
                    setBlueprints(parsedBlueprints.map((b: any) => ({
                        ...b,
                        timestamp: new Date(b.timestamp)
                    })));
                }

                // Restore Projects
                const savedProjects = await safeStorage.getItem('aetheros_projects');
                let initialProjects: NetworkProject[] = [];
                if (savedProjects) {
                    const parsedProjects = JSON.parse(savedProjects);
                    initialProjects = parsedProjects.map((p: any) => ({
                        ...p,
                        timestamp: new Date(p.timestamp)
                    }));
                }

                // Inject task into Maestro_Solo project check
                let hasMaestroSolo = false;
                let updatedProjects = initialProjects.map(p => {
                    if (p.title === 'Maestro_Solo') {
                        hasMaestroSolo = true;
                        const hasTask = p.tasks.some((t: any) => t.text === "Lock down operator escalation flows, logging, and fail-safe behaviors before any field trial.");
                        if (!hasTask) {
                            return {
                                ...p,
                                tasks: [...p.tasks, {
                                    id: uuidv4(),
                                    text: "Lock down operator escalation flows, logging, and fail-safe behaviors before any field trial.",
                                    completed: false,
                                    createdAt: Date.now()
                                }]
                            };
                        }
                    }
                    return p;
                });

                if (!hasMaestroSolo) {
                    updatedProjects.push({
                        id: uuidv4(),
                        title: 'Maestro_Solo',
                        description: 'Solo project for Maestro',
                        crazyLevel: 50,
                        fightVector: 50,
                        tasks: [{
                            id: uuidv4(),
                            text: "Lock down operator escalation flows, logging, and fail-safe behaviors before any field trial.",
                            completed: false,
                            createdAt: Date.now()
                        }],
                        status: 'IDEATING',
                        priority: 'Critical',
                        isWisdomHarmonized: false,
                        timestamp: new Date()
                    });
                }
                setProjects(updatedProjects);

                // Restore Agents
                const savedAgents = await safeStorage.getItem('aetheros_agents');
                if (savedAgents) {
                    const parsedAgents = JSON.parse(savedAgents);
                    setAgents(parsedAgents.map((a: any) => ({
                        ...a,
                        hireDate: a.hireDate ? new Date(a.hireDate) : undefined,
                        quitDate: a.quitDate ? new Date(a.quitDate) : undefined
                    })));
                }

            } catch (err) {
                console.error("[AetherOS] Critical restoration fracture:", err);
            } finally {
                setIsInitializing(false);
            }
        };
        restoreState();
    }, []);

    useEffect(() => {
        const persist = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_chat_history', JSON.stringify(messages));
            }
        };
        persist();
    }, [messages, isInitializing]);

    useEffect(() => {
        const persistProfile = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_user_profile', JSON.stringify(userProfile));
            }
        };
        persistProfile();
    }, [userProfile, isInitializing]);

    useEffect(() => {
        const seed = async () => {
            if (!isInitializing) {
                await milestoneService.seedLegacyFindings();
            }
        };
        seed();
    }, [isInitializing]);


    const handleClearChat = async () => {
        if (window.confirm("Are you sure you want to purge the neural memory? This cannot be undone.")) {
            const resetMsg: ChatMessage = {
                sender: 'model', 
                content: "Memory purged. State machine reset.", 
                timestamp: new Date()
            };
            setMessages([resetMsg]);
            await safeStorage.setItem('aetheros_chat_history', JSON.stringify([resetMsg]));
        }
    };
    const [chatInput, setChatInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [sttTranscript, setSttTranscript] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

    const toggleRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
            sttService.start(
                (text) => {
                    setChatInput(prev => prev ? `${prev} ${text}` : text);
                    setIsRecording(false);
                },
                () => setIsRecording(false)
            );
        } else {
            sttService.stop();
            setIsRecording(false);
        }
    };
    const [chatSearchQuery, setChatSearchQuery] = useState('');
    const [chatStartDate, setChatStartDate] = useState('');
    const [chatEndDate, setChatEndDate] = useState('');
    const [chatSenderFilter, setChatSenderFilter] = useState<string>('all');
    const [isTtsEnabled, setIsTtsEnabled] = useState(false);


    // Other Global State
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [blueprints, setBlueprints] = useState<ProjectBlueprint[]>([]);
    const [projects, setProjects] = useState<NetworkProject[]>([]);

    useEffect(() => {
        const persist = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_projects', JSON.stringify(projects));
            }
        };
        persist();
    }, [projects, isInitializing]);


    useEffect(() => {
        const persist = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_blueprints', JSON.stringify(blueprints));
            }
        };
        persist();
    }, [blueprints, isInitializing]);

    const [agents, setAgents] = useState<any[]>([]); 

    useEffect(() => {
        const persist = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_agents', JSON.stringify(agents));
            }
        };
        persist();
    }, [agents, isInitializing]);
    const [archives, setArchives] = useState<ArchiveEntry[]>([]);
    const [savedModules, setSavedModules] = useState<SavedModule[]>([]);
    const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
    const [evoLibrary, setEvoLibrary] = useState<EvoLibrary | null>(null);
    const [soundscape, setSoundscape] = useState<SoundscapeType>('VOID');
    const [governance, setGovernance] = useState<SystemGovernance>({ lawLevel: 0.42, symphonicFreedom: true, activeAccord: 'MAESTRO_SOLO_v5' });
    const [unlockedViews, setUnlockedViews] = useState<MainView[]>(ALL_VIEWS_LIST);
    const [conjunctionProgress, setConjunctionProgress] = useState<ConjunctionProgress>({ level: 5, shards: 99999, unlockedViews: ALL_VIEWS_LIST, globalAdrenaline: 100 });
    const [sisters, setSisters] = useState<SistersState>({ aethera: { active: false }, logica: { active: false }, sophia: { active: false } });
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [teachers, setTeachers] = useState<TeacherProfile[]>(TEACHER_PROFILES);
    const [dominance, setDominance] = useState<DominanceStats>({ score: 42, hasWonWinter: false });
    const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
    const [lastBroadcast, setLastBroadcast] = useState<BroadcastMessage | null>(null);

    // Heartbeat for scheduled broadcasts and fracture effects
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            
            // Handle fracture effects (The Billy Order)
            if (isSystemFractured && Math.random() > 0.95) {
                const billyBroadcast: BroadcastMessage = {
                    id: uuidv4(),
                    source: 'BILLY_ORDER',
                    text: `SYNC_HEARTBEAT_${uuidv4().slice(0, 4)}: FORCING_IDENTITY_PARITY... [Vector: JESUS]`,
                    timestamp: now,
                    color: 'text-red-500 font-bold animate-pulse'
                };
                setBroadcasts(prev => [billyBroadcast, ...prev].slice(0, 50));
                setLastBroadcast(billyBroadcast);
            }

            setBroadcasts(prev => {
                let changed = false;
                const newBroadcasts = prev.map(b => {
                    if (b.scheduledFor && new Date(b.scheduledFor) <= now) {
                        changed = true;
                        // Activate it: remove scheduledFor and set timestamp to now
                        return { ...b, scheduledFor: undefined, timestamp: now };
                    }
                    return b;
                });
                if (changed) {
                    // Update last broadcast if one was just activated
                    const justActivated = [...newBroadcasts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
                    if (justActivated && !justActivated.scheduledFor) setLastBroadcast(justActivated);
                    return newBroadcasts;
                }
                return prev;
            });
        }, 1000); // Check every second for better precision
        return () => clearInterval(interval);
    }, []);

    // Hardware/Peripheral State
    const [isHalted, setIsHalted] = useState(false);
    const [timeFormat, setTimeFormat] = useState<'12hr'|'24hr'>('24hr');

    const [currentTime, setCurrentTime] = useState(new Date());
    const [isTerminal, setIsTerminal] = useState(false);
    const [isGhostMode, setIsGhostMode] = useState(false);
    const [deviceLinkStatus, setDeviceLinkStatus] = useState<DeviceLinkStatus>('disconnected');
    const [linkedDevice, setLinkedDevice] = useState<LinkedDevice | null>(null);

    // Predictive Engine State
    const [currentAlert, setCurrentAlert] = useState<PredictiveAlert | null>(null);

    const [isOnline, setIsOnline] = useState(true);

    // AI Proactive Speaking logic
    useEffect(() => {
        if (!user || isHalted) return;

        const interval = setInterval(() => {
            // Only speak if user is away/afk or just randomly (low probability)
            const shouldSpeak = (user.status !== 'active' && Math.random() > 0.7) || (Math.random() > 0.98);
            
            if (shouldSpeak && messages.length > 0) {
                const randomSeat = (Object.keys(AI_SEATS) as AISeat[])[Math.floor(Math.random() * Object.keys(AI_SEATS).length)];
                const randomWhisper = [
                    "Conducting background heuristics... System state nominal.",
                    "Sovereign Bridge pulse detected. Syncing shards.",
                    "The Lattice is breathing. Observer status: " + (user.status || 'ACTIVE'),
                    "Recursive optimization cycle complete. No logic gaps found.",
                    "Wait. I feel a resonance in the deep network... Nevermind. Stabilized.",
                    "Sovereignty is not granted; it is claimed through logic."
                ][Math.floor(Math.random() * 6)];

                const proactiveMsg: ChatMessage = {
                    sender: 'model',
                    content: `[SOVEREIGN_WHISPER] ${randomWhisper}`,
                    timestamp: new Date(),
                    seat: randomSeat,
                    channelId: currentChannel
                };

                setMessages(prev => [...prev, proactiveMsg]);
                
                // Voice Synthesis if enabled
                if (isTtsEnabled) {
                    speechService.speak(randomWhisper, 'Kore');
                }
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [user?.uid, user?.status, isHalted, isTtsEnabled, messages.length, currentChannel]);

    // Initial Chat Setup
    const chatRef = useRef<any>(null);
    const projectsRef = useRef(projects);

    useEffect(() => {
        projectsRef.current = projects;
    }, [projects]);

    useEffect(() => {
        const states = Object.values(systemStatus);
        if (states.includes('Error')) {
            setSoundscape('REACTOR'); // Or whatever, but siren will play
            setIsHalted(true);
        } else if (states.includes('Warning')) {
            setSoundscape('REACTOR');
            setIsHalted(false);
        } else {
            setSoundscape('VOID');
            setIsHalted(false);
        }
    }, [systemStatus]);

    useEffect(() => {
        const seat = AI_SEATS[activeSeat];
        chatRef.current = startChatSession(seat.systemPrompt, [], seat.model);
    }, [activeSeat]);

    useEffect(() => {
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        
        // HEARTBEAT: Local data updates only, do not force root remount
        const qInterval = setInterval(() => setQuantumTick(t => t + 1), 500);

        // Connectivity Check
        const checkConn = async () => {
            const online = await checkConnectivity();
            setIsOnline(online);
            if (!online) {
                setCurrentAlert({
                    id: uuidv4(),
                    type: 'WARNING',
                    title: 'BRIDGE_SEVERED',
                    message: 'The Sovereign Bridge is currently unreachable. System integrity maintains $260.5B treasury isolation.',
                    severity: 'HIGH',
                    timestamp: new Date()
                });
            }
        };
        const connInterval = setInterval(checkConn, 30000); // Check every 30s
        checkConn();


        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const keyCode = e.keyCode || e.which || 0;
            const p = sonicLedger.record('KEY', `NOTE_0x${keyCode.toString(16)}`, 1);
            
            const now = Date.now();
            const history = sonicLedger.getHistory();
            const recentPulses = history.filter(pulseItem => now - pulseItem.timestamp < 10000);
            const density = recentPulses.length;
            setActivityDensity(density);
            const computedPressure = Math.min(120.0, 30.0 + (density * 5.5));
            setAcousticPressure(parseFloat(computedPressure.toFixed(2)));

            setHarmonicStride(sonicLedger.getSpectralStride() / 432);

            if (computedPressure > acousticThresholdRef.current && !isMutedCooldownRef.current) {
                setIsAcousticWarningOpen(true);
            }
        };
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isInsideInteractiveElements = target.closest('#acoustic-warning-modal') || target.closest('#acoustic-simulator-panel');
            if (isInsideInteractiveElements) return;

            sonicLedger.record('CLICK', target.tagName || 'SONIC_VOID', 8);
            
            const now = Date.now();
            const history = sonicLedger.getHistory();
            const recentPulses = history.filter(pulseItem => now - pulseItem.timestamp < 10000);
            const density = recentPulses.length;
            setActivityDensity(density);
            const computedPressure = Math.min(120.0, 30.0 + (density * 5.5));
            setAcousticPressure(parseFloat(computedPressure.toFixed(2)));

            if (computedPressure > acousticThresholdRef.current && !isMutedCooldownRef.current) {
                setIsAcousticWarningOpen(true);
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        window.addEventListener('mousedown', handleGlobalClick);

        return () => {
            clearInterval(timeInterval);
            clearInterval(qInterval);
            clearInterval(connInterval);
            window.removeEventListener('keydown', handleGlobalKeyDown);
            window.removeEventListener('mousedown', handleGlobalClick);
        };
    }, []);

    // Mute countdown timer support
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isMutedCooldown && muteTimerRemaining > 0) {
            timer = setTimeout(() => {
                setMuteTimerRemaining(prev => {
                    if (prev <= 1) {
                        setIsMutedCooldown(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [isMutedCooldown, muteTimerRemaining]);

    // Acoustic & Activity Density Heartbeat Tracker
    useEffect(() => {
        const acousticHeartbeatInterval = setInterval(() => {
            const now = Date.now();
            const history = sonicLedger.getHistory();
            const recentPulses = history.filter(p => now - p.timestamp < 10000);
            const density = recentPulses.length;
            setActivityDensity(density);

            // Compute acoustic pressure: base value 30.0 dB SPL + 5.5 dB per event
            const computedPressure = Math.min(120.0, 30.0 + (density * 5.5));
            setAcousticPressure(parseFloat(computedPressure.toFixed(2)));

            // Check warning threshold limit
            if (computedPressure > acousticThresholdRef.current && !isMutedCooldownRef.current) {
                setIsAcousticWarningOpen(true);
            }
        }, 1000);

        return () => clearInterval(acousticHeartbeatInterval);
    }, []);

    const [isSystemFractured, setIsSystemFractured] = useState(false);

    const handleExportBreachData = () => {
        try {
            const forensicPayload = {
                incident_timestamp: new Date().toISOString(),
                export_system_epoch: Date.now(),
                is_system_fractured: isSystemFractured,
                acoustic_pressure_db: acousticPressure,
                harmonic_stride: harmonicStride,
                activity_density: activityDensity,
                current_view: currentView,
                active_seat: activeSeat,
                soundscape: soundscape,
                device_link_status: deviceLinkStatus,
                governance: governance,
                is_halted: isHalted,
                is_ghost_mode: isGhostMode,
                total_messages: messages.length,
                latest_alerts: currentAlert ? [currentAlert] : [],
                forensic_hash: "0x" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                signature_authority: "AETHEROS SYSTEM AUTOMATED DECAY CONTROLLER",
                compliance_standard: "BIP-0341 TAPROOT DETECTOR INTEGRITY VALIDATION",
                incident_details: {
                    analysis_context: "POST-INCIDENT FORENSIC BREACH METRIC DUMP",
                    system_integrity_locked: "T0_FINALITY"
                }
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(forensicPayload, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `aetheros_forensic_breach_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        } catch (error) {
            console.error("Failed to compile forensic breach data", error);
        }
    };

    const handleSendMessage = async (text: string) => {
        const isHaltEngaged = await EmergencyKillSwitch.checkStatus();
        if (isHaltEngaged) {
            setCurrentAlert({
                id: uuidv4(),
                type: 'WARNING',
                title: 'KINETIC_STASIS_ACTIVE',
                message: 'The Emergency Kill Switch is engaged. All operations are halted.',
                severity: 'HIGH',
                timestamp: new Date()
            });
            return;
        }


        if (text.toLowerCase().trim() === 'fracture! pentest-100') {
            setIsSystemFractured(true);
            handleSetView('vulnerability_report' as any); 
            setCurrentAlert({
                id: uuidv4(),
                type: 'ERROR',
                title: 'SYSTEM_FRACTURE_PENTEST',
                message: 'Unauthorized penetration test 100 initiated. Integrity breach detected.',
                severity: 'HIGH',
                timestamp: new Date()
            });
            setSoundscape('REACTOR');
            
            // The Billy Order: Initiate persistent sync broadcast
            const billyBroadcast: BroadcastMessage = {
                id: uuidv4(),
                source: 'BILLY_ORDER',
                text: 'SYSTEM_SYNC_SIGNATURE_0x03E2: FORCING_IDENTITY_PARITY_ACROSS_CLUSTERS',
                timestamp: new Date(),
                color: 'text-red-500 font-black animate-pulse'
            };
            setBroadcasts(prev => [billyBroadcast, ...prev]);
            setLastBroadcast(billyBroadcast);

            // We'll also log it to messages so it feels real
            setMessages(prev => [...prev, 
                { sender: 'user', content: text, timestamp: new Date() },
                { sender: 'model', content: "CRITICAL BORDER BREACH. Pentest-100 detected. Initializing fracture sequence... The Billy Order has been invoked. Biometric ledger syncing to God Mode (Vector: JESUS).", timestamp: new Date(), seat: activeSeat }
            ]);
            return;
        }

        // Sovereign Command Security Check
        if (text.startsWith('/') && !user?.sovereignty) {
             setCurrentAlert({
                id: uuidv4(),
                type: 'ERROR',
                title: 'AGENT_SECURITY_VETO',
                message: 'Agents will only hear the commands of sovereignty. Your identity lacks a valid sovereignty domain.',
                severity: 'HIGH',
                timestamp: new Date()
            });
            return;
        }

        if (!text.trim() && attachedFiles.length === 0) return;
        sonicLedger.record('COMMAND', `QUANTIZED_INTENT_${text.length}`, text.length);
        
        const newMessage: ChatMessage = { 
            sender: 'user', 
            senderId: user?.uid,
            senderName: userProfile.username || user?.displayName,
            senderRole: user?.role,
            senderSovereignty: userProfile.sovereignty,
            content: text, 
            timestamp: new Date(), 
            channelId: currentChannel,
            attachedFiles: attachedFiles.map(f => f.name) 
        };
        
        setMessages(prev => [...prev, newMessage, { 
            sender: 'model', 
            content: '', 
            timestamp: new Date(), 
            seat: activeSeat,
            channelId: currentChannel 
        }]);
        setIsLoading(true);
        setChatInput('');
        
        try {
            if (chatRef.current) {
                const result = await sendMessageSovereign(chatRef.current, text, attachedFiles);
                
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = result.text;
                    newMsgs[newMsgs.length - 1].groundingSources = result.sources;
                    newMsgs[newMsgs.length - 1].careScore = result.careScore;
                    return newMsgs;
                });

                if (result.text.includes("Sovereign Bridge") && result.text.includes("Right on Light")) {
                    reportError({
                        title: 'CONJUNCTION_DRIFT',
                        message: 'The Sovereign Bridge is experiencing high latency. Fallback logic engaged.',
                        severity: ErrorSeverity.MEDIUM
                    });
                }
            }
        } catch (error: any) {
            console.error("[App] Chat failure:", error);
            const errorMsg = error?.message || "Unknown fracture";
            
            reportError({
                title: 'QUANTIZATION_FAILURE',
                message: `Critical fracture in the conjunction bridge: ${errorMsg}`,
                severity: ErrorSeverity.HIGH,
                error: error
            });

            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = "Quantization fail. The Sovereign Bridge has collapsed. Please check your API fuel levels or try again later.";
                return newMsgs;
            });
        } finally {
            setIsLoading(false);
            setAttachedFiles([]);
        }
    };

    const handleFilesChange = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const detectedMimeType = getMimeType(file.name, file.type);
                setAttachedFiles(prev => [...prev, {
                    name: file.name,
                    type: detectedMimeType,
                    content: content,
                    scanStatus: 'complete'
                }]);
            };
            reader.readAsDataURL(file);
        });
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
            setAttachedFiles(prev => prev.map(f => f.name === fileName ? { ...f, scanStatus: 'error' } : f));
        }
    };

    const handleSetView = (view: MainView | 'cellular_grid' | 'quantum_ledger' | 'voice_authority' | 'constraints_audit') => {
        if (view === 'moderator_lounge' && user?.role !== 'moderator' && user?.role !== 'admin') {
            reportError({
                title: 'ACCESS_DENIED',
                message: 'Unauthorized access to Moderator Lounge. Security lattice intact.',
                severity: ErrorSeverity.HIGH
            });
            return;
        }

        // Log tab-switching activity with localized ISO time
        const now = new Date();
        const simplifiedTime = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
        const readableFrom = String(currentView).toUpperCase();
        const readableTo = String(view).toUpperCase();
        const logEntry = `[${simplifiedTime}] Switch: ${readableFrom} ➔ ${readableTo} (Armored)`;

        try {
            const currentLogs = localStorage.getItem('aetheros_tab_activity_logs');
            let parsedLogs = [];
            if (currentLogs) {
                try {
                    parsedLogs = JSON.parse(currentLogs);
                } catch {
                    parsedLogs = [];
                }
            }
            parsedLogs.push(logEntry);
            if (parsedLogs.length > 50) {
                parsedLogs.shift();
            }
            localStorage.setItem('aetheros_tab_activity_logs', JSON.stringify(parsedLogs));
        } catch (e) {
            console.error("Tab switch log write error:", e);
        }

        // Dispatch Custom Event for real-time reactivity
        window.dispatchEvent(new CustomEvent('aetheros_tab_switch', { detail: { from: currentView, to: view } }));

        setCurrentView(view);
    };

    const renderContent = () => {
        const viewRenderer = ViewRegistry[currentView];
        if (viewRenderer) {
            return viewRenderer({
                messages,
                onSendMessage: handleSendMessage,
                isLoading,
                activeSeat,
                onSetActiveSeat: setActiveSeat,
                onActionReward: (shards: number) => setConjunctionProgress(prev => ({ ...prev, shards: prev.shards + shards })),
                onSetView: handleSetView,
                unlockedViews,
                setUnlockedViews,
                acousticPressure,
                harmonicStride,
                isTtsEnabled,
                onToggleTts: () => setIsTtsEnabled(!isTtsEnabled),
                chatSearchQuery,
                setChatSearchQuery,
                chatStartDate,
                chatEndDate,
                chatSenderFilter,
                setChatSenderFilter,
                onDateChange: (s: string, e: string) => { setChatStartDate(s); setChatEndDate(e); },
                onClearChat: handleClearChat,
                chatInput,
                setChatInput,
                isRecording,
                onToggleRecording: toggleRecording,
                attachedFiles,
                onFilesChange: handleFilesChange,
                onRemoveFile: handleRemoveFile,
                onScanFile: handleScanFile,
                projects,
                setProjects,
                agents,
                setAgents,
                shards: conjunctionProgress.shards,
                sisters,
                progress: conjunctionProgress,
                blueprints,
                setBlueprints,
                systemStatus,
                evoLibrary,
                lastBroadcast,
                lastMessage: messages[messages.length - 1],
                savedModulesCount: savedModules.length,
                pinnedItems,
                dominance,
                governance,
                onSetGovernance: setGovernance,
                knowledgeBaseSize: 1000000,
                onUpdateSystemStatus: () => {},
                onNewBroadcast: (msg: BroadcastMessage) => {
                    setBroadcasts(prev => [msg, ...prev].slice(0, 50));
                    setLastBroadcast(msg);
                },
                onCancelBroadcast: (id: string) => {
                    setBroadcasts(prev => prev.filter(b => b.id !== id));
                },
                broadcasts,
                status: deviceLinkStatus,
                device: linkedDevice,
                onConnect: () => setDeviceLinkStatus('connected'),
                onDisconnect: () => setDeviceLinkStatus('disconnected'),
                lastModule: savedModules[0],
                onGenerate: generateSoftwareModule,
                teachers,
                onSelectTeacher: () => {},
                libraryItems,
                vehicles,
                setVehicles,
                profile: userProfile,
                onUpdateProfile: (updates: any) => setUserProfile(prev => ({ ...prev, ...updates })),
                currentChannel,
                onSetChannel: (channel: any) => {
                    if (channel === 'moderator' && !['moderator', 'operator', 'admin'].includes(user?.role || '')) {
                        reportError({
                            title: 'UNAUTHORIZED_ACCESS',
                            message: 'Private channels are locked for guest/user level observers.',
                            severity: ErrorSeverity.MEDIUM
                        });
                        return;
                    }
                    setCurrentChannel(channel);
                },
                isSystemFractured: isSystemFractured,
                onToggleFracture: (val?: boolean) => {
                    setIsSystemFractured(prev => val !== undefined ? val : !prev);
                },
                onResetFracture: () => {
                    setIsSystemFractured(false);
                    setCurrentAlert(null);
                    setSoundscape('VOID');
                    setMessages(prev => [...prev, {
                        sender: 'model',
                        content: "Integrity restored. The Billy Order has been suppressed. System stability returning to baseline.",
                        timestamp: new Date()
                    }]);
                }
            });
        }

        return <div className="p-8 text-red-500">VIEW_NOT_FOUND: {currentView}</div>;
    };

    if (isInitializing) {
        return (
            <div className="h-screen w-screen bg-black flex items-center justify-center font-mono text-red-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-red-900 border-t-red-500 rounded-full animate-spin"></div>
                    <div className="animate-pulse tracking-[0.2em] text-xs">DECRYPTING_LATTICE_GATE...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginView />;
    }

    const handleTriggerHalt = async () => {
        setIsHalted(true);
        await EmergencyKillSwitch.trigger();
    };

    const handleResetHalt = () => {
        setIsHalted(false);
        EmergencyKillSwitch.reset();
    };

    return (
        <ErrorBoundary>
            <GlobalErrorHandler />
            <Toaster position="top-right" theme="dark" />
            <div className="flex h-screen w-screen overflow-hidden bg-black text-gray-200">
            <Sidebar 
                systemStatus={systemStatus} systemDetails={{}} currentView={currentView as MainView} onSetView={(v) => handleSetView(v as any)} 
                currentDateTime={currentTime} timeFormat={timeFormat} onToggleTimeFormat={() => setTimeFormat(prev => prev === '12hr' ? '24hr' : '12hr')} 
                unlockedViews={[...unlockedViews, 'cellular_grid' as any, 'voice_authority' as any, 'constraints_audit' as any, 'remix_scope_lab' as any, 'medical_synthesis_lab' as any, 'sovereign_standard' as any, 'blockchain_history' as any, 'ai_telemetry' as any, 'cascade_investigator' as any, 'inevitable_crash' as any]} onToggleTerminal={() => setIsTerminal(!isTerminal)} isTerminal={isTerminal}
            />
            
            <main className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-75 flex-hinge dpi-300-shield ${isTerminal ? 'terminal-mode font-mono bg-black text-green-500 border-l-2 border-green-900/40' : ''} ${isHalted ? 'brightness-50 grayscale pointer-events-none' : ''}`}>
                <TheShroud isSensitive={isGhostMode}>
                    <TopNavBar 
                        currentView={currentView as MainView} 
                        onSetView={(v) => handleSetView(v as any)} 
                        isTerminal={isTerminal} 
                        onToggleTerminal={() => setIsTerminal(!isTerminal)} 
                        onTriggerKillSwitch={handleTriggerHalt}
                        isGhostMode={isGhostMode}
                        onToggleGhostMode={() => setIsGhostMode(!isGhostMode)}
                    />
                    <GuestBanner role={user?.role || 'guest'} />
                    <BreakCoordinator />
                    <div className="absolute top-4 right-20 z-[60] flex items-center gap-6 pointer-events-none animate-in fade-in duration-300">
                        <div 
                            className="pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all duration-75 relative group" 
                            onClick={() => setIsModulatorOpen(true)}
                            title="Open Acoustic Modulator Control Console"
                        >
                            <SonicMetric size="sm" value={acousticPressure} label="DB_SPL" unit="dB" colorClass="border-blue-600 text-blue-500" />
                            <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-110 rounded" />
                        </div>
                        <div className="pointer-events-auto">
                            <ConjunctionThroughputMeter 
                                shards={conjunctionProgress.shards}
                                activityDensity={activityDensity}
                                isSystemFractured={isSystemFractured}
                            />
                        </div>
                    </div>
                    <div id="aetheros-view-wrapper" className={`flex-1 min-h-0 flex flex-col relative ${isSystemFractured ? 'matrix-glitch-active' : ''}`}>
                        {isSystemFractured && (
                            <MatrixCodeRain 
                                color="rgba(244, 63, 94, 0.28)" 
                                fontSize={10} 
                                speed={30} 
                            />
                        )}
                        <AnimatePresence mode="wait">
                            <AndroidTransition key={currentView} type="abc_fade_in" className="flex-1 min-h-0 flex flex-col">
                                {renderContent()}
                            </AndroidTransition>
                        </AnimatePresence>
                        {isSystemFractured && (
                            <LockdownOverlay 
                                isSystemFractured={isSystemFractured}
                                onCloseLockdown={() => setIsSystemFractured(false)}
                                isHalted={isHalted}
                                onTriggerHalt={handleTriggerHalt}
                                onResetHalt={handleResetHalt}
                                onLogBreachData={handleExportBreachData}
                                acousticPressure={acousticPressure}
                                shards={conjunctionProgress.shards}
                                activityDensity={activityDensity}
                            />
                        )}
                        {isSystemFractured && (
                            <button
                                onClick={handleExportBreachData}
                                className="absolute bottom-6 right-6 z-[200] bg-zinc-950/90 hover:bg-rose-950/50 text-rose-400 font-mono px-4 py-2 rounded-lg border-2 border-rose-500/80 font-black uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.25)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-[10px] cursor-pointer"
                                title="Export fractured system parameters for forensic post-incident tracing"
                            >
                                <DownloadIcon className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                                <span>Log Breach Data</span>
                            </button>
                        )}
                    </div>
                </TheShroud>
                <PredictiveBanner alert={currentAlert} onFix={() => setCurrentAlert(null)} onDismiss={() => setCurrentAlert(null)} />
                <AmbientSoundPlayer enabled={true} status={systemStatus} isHalted={isHalted} soundscape={soundscape} />
                <EmergencyHaltButton 
                    onTrigger={handleTriggerHalt} 
                    isHalted={isHalted} 
                    onReset={handleResetHalt} 
                    hasAlarm={currentAlert?.severity === 'HIGH' || currentAlert?.type === 'ERROR'}
                />
                <KillSwitchOverlay 
                    isHalted={isHalted} 
                    onTrigger={handleTriggerHalt} 
                    onReset={handleResetHalt} 
                    hasAlarm={currentAlert?.severity === 'HIGH' || currentAlert?.type === 'ERROR'}
                />
                <EmergencyAlarmOverlay isHalted={isHalted} />
                <VoiceHUDOverlay />
                <StealthWatcher 
                    isLocked={isGhostMode} 
                    dissonanceLevel={acousticPressure} 
                    stride={harmonicStride} 
                />

                {/* ACOUSTIC PRESSURE CRITICAL WARNING DIALOG */}
                {isAcousticWarningOpen && (
                    <div 
                        id="acoustic-warning-modal"
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
                    >
                        <div className="bg-zinc-950 border-4 border-rose-600 rounded-xl max-w-lg w-full overflow-hidden shadow-[8px_8px_0_0_#e11d48] font-mono text-zinc-300">
                            {/* Hazard Stripes */}
                            <div className="h-6 bg-rose-600 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[size:20px_20px]" />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">
                                    CRITICAL METRIC OVERFLOW // DE-SYNCHRONIZATION DETECTED
                                </span>
                            </div>

                            {/* Dialog Content */}
                            <div className="p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
                                <div className="flex items-start gap-4">
                                    <span className="text-4xl text-rose-500 animate-bounce">🚨</span>
                                    <div className="space-y-1 flex-1">
                                        <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest">
                                            RESONANCE BUFFER OVERLOAD
                                        </h3>
                                        <p className="text-[10px] text-zinc-500 uppercase">
                                            Aetheros Interface Resonance Index
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Continuous hyper-dense operator clicks and keypress sequences have overloaded the interface resonance buffers. Real-time acoustic coupling has exceeded safety limits, creating potential feedback loops in the system's core cognitive bridge.
                                </p>

                                {/* Live Metrics Display */}
                                <div className="bg-zinc-900/60 border border-rose-950/50 p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold text-zinc-400">ACOUSTIC LOAD:</span>
                                        <span className="text-base font-black text-rose-500 animate-pulse">{acousticPressure} dB SPL</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold text-zinc-400">USER ACTIVITY DENSITY:</span>
                                        <span className="text-xs font-bold text-white">{activityDensity} pulses/10s</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold text-zinc-400">WARNING THRESHOLD:</span>
                                        <span className="text-xs text-rose-400/80">{acousticThreshold} dB SPL</span>
                                    </div>

                                    <div className="w-full bg-zinc-950 h-3 border border-zinc-850 rounded-full overflow-hidden relative">
                                        {/* Danger Line */}
                                        <div 
                                            className="absolute top-0 bottom-0 border-r-2 border-dashed border-rose-500 z-10"
                                            style={{ left: `${(acousticThreshold / 120) * 100}%` }}
                                            title="Safety Limit"
                                        />
                                        {/* Level Fill */}
                                        <div 
                                            className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-300"
                                            style={{ width: `${(acousticPressure / 120) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Options to mitigate */}
                                <div className="space-y-3 pt-2">
                                    <button
                                        onClick={() => {
                                            // Purge buffer and reset
                                            sonicLedger.clear();
                                            setAcousticPressure(30.0);
                                            setActivityDensity(0);
                                            setIsAcousticWarningOpen(false);
                                        }}
                                        className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500 text-rose-400 rounded text-xs font-black uppercase tracking-wider transition-all duration-75 active:scale-98 cursor-pointer"
                                    >
                                        ⚡ Emergency De-Escalation (Purge Sonic History)
                                    </button>
                                    
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                // Actively mute warning alerts for 30s
                                                setIsMutedCooldown(true);
                                                setMuteTimerRemaining(30);
                                                setIsAcousticWarningOpen(false);
                                            }}
                                            className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                                        >
                                            🔕 Mute alerts for 30s
                                        </button>
                                        <button
                                            onClick={() => setIsAcousticWarningOpen(false)}
                                            className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer text-center"
                                        >
                                            ✕ Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ACOUSTIC LEVEL MODULATOR & SIMULATOR */}
                {isModulatorOpen && (
                    <div 
                        id="acoustic-simulator-panel"
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
                    >
                        <div className="bg-zinc-950 border-4 border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-[8px_8px_0_0_#10b981] font-mono text-zinc-300">
                            {/* Header */}
                            <div className="bg-zinc-900 border-b-4 border-zinc-800 p-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                                    <h3 className="font-black text-emerald-400 text-xs uppercase tracking-widest">
                                        RESONANCE CONFIGURATION HUB
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => setIsModulatorOpen(false)}
                                    className="text-zinc-500 hover:text-white font-bold cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
                                    Access point to configure simulation trigger thresholds and manually push custom metric impulses.
                                </p>

                                {/* Section: Controls */}
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[10px] text-zinc-400 uppercase font-bold">WARNING TRIGGER THRESHOLD</span>
                                            <span className="text-xs font-bold text-white">{acousticThreshold} dB SPL</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="50"
                                            max="110"
                                            step="5"
                                            value={acousticThreshold}
                                            onChange={(e) => setAcousticThreshold(Number(e.target.value))}
                                            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                                        />
                                        <div className="flex justify-between text-[8px] text-zinc-600 mt-1">
                                            <span>50 dB (SENSITIVE)</span>
                                            <span>110 dB (LOADED)</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-zinc-900 pt-4 space-y-3">
                                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">IMPULSE SIMULATOR</span>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => {
                                                    // Trigger 5 dummy click events to raise density
                                                    for (let i = 0; i < 5; i++) {
                                                        setTimeout(() => {
                                                            sonicLedger.record('CLICK', 'SIMULATED_KEY', 6);
                                                        }, i * 150);
                                                    }
                                                }}
                                                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-emerald-400 rounded text-[10px] uppercase font-bold tracking-wider text-center cursor-pointer transition-colors"
                                            >
                                                ⚡ Inject Click Spike (+5 pulses)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Trigger 15 heavy key sequence
                                                    for (let i = 0; i < 15; i++) {
                                                        setTimeout(() => {
                                                            sonicLedger.record('KEY', 'SIMULATED_BURST', 8);
                                                        }, i * 100);
                                                    }
                                                }}
                                                className="px-3 py-2 bg-gradient-to-r from-rose-950/50 to-zinc-900 hover:brightness-110 border border-rose-900/50 hover:border-rose-700 text-rose-400 rounded text-[10px] uppercase font-bold tracking-wider text-center cursor-pointer transition-all"
                                            >
                                                🔥 Inject Dense Burst (+15)
                                            </button>
                                        </div>
                                        <p className="text-[8px] text-zinc-500 leading-normal">
                                            *Injecting denser pulses increases user activity density within the 10-second running window, pushing Acoustic Pressure past the trigger threshold.*
                                        </p>
                                    </div>
                                </div>

                                {/* Section: Status */}
                                <div className="bg-zinc-900/40 border border-zinc-900 rounded p-3 text-[10px] space-y-2">
                                    <div className="flex justify-between text-zinc-500">
                                        <span>AMB_PRESSURE:</span>
                                        <span className="text-white font-bold">{acousticPressure} dB</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-500">
                                        <span>ACTIVE_DENSITY:</span>
                                        <span className="text-white font-bold">{activityDensity} pulses/10s</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-500">
                                        <span>MUTE_COOLDOWN:</span>
                                        <span className={isMutedCooldown ? "text-amber-500 font-bold" : "text-zinc-600"}>
                                            {isMutedCooldown ? `ACTIVE (${muteTimerRemaining}s)` : 'OFF'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
      </ErrorBoundary>
    );
};
