
import React, { useState, useEffect, useRef } from 'react';
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
    const [archives, setArchives] = useState<ArchiveEntry[]>([]);
    const [savedModules, setSavedModules] = useState<SavedModule[]>([]);
    const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
    const [evoLibrary, setEvoLibrary] = useState<EvoLibrary | null>(null);
    const [soundscape, setSoundscape] = useState<SoundscapeType>('VOID');
    const [governance, setGovernance] = useState<SystemGovernance>({ lawLevel: 0.42, symphonicFreedom: true, activeAccord: 'MAESTRO_SOLO_v5' });
    const [unlockedViews, setUnlockedViews] = useState<MainView[]>(['chat', 'coding_network', 'projects', 'forge', 'system_exhaustion', 'recon_vault', 'constraints_audit', 'vehicle_management', 'library_view', 'unknown_physics_lab', 'logic_pattern_lab', 'blockchain_history', 'main_net', 'ecosystem', 'blacklist', 'accounts_registry', 'vault_manager', 'system_integrity']);
    const [conjunctionProgress, setConjunctionProgress] = useState<ConjunctionProgress>({ level: 1, shards: 5000, unlockedViews: ['chat', 'constraints_audit'], globalAdrenaline: 42 });
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
    const [userProfile, setUserProfile] = useState<UserProfile>({
        id: 'OP-7734-X',
        username: 'Aetheros_Prime',
        bio: 'Lead architect of the Sovereign Shield. Specializing in recursive self-improvement and high-frequency cognitive pipelines.',
        skills: ['TypeScript', 'React', 'Node.js', 'Quantum Logic', 'System Architecture'],
        role: 'operator',
        sovereignty: 'SOVEREIGN_SYSTEM'
    });

    useEffect(() => {
        if (user) {
            setUserProfile(prev => ({
                ...prev,
                username: user.displayName || prev.username,
                role: user.role || 'operator'
            }));
        }
    }, [user]);
    
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
            clearInterval(connInterval);
            window.removeEventListener('keydown', handleGlobalKeyDown);
            window.removeEventListener('mousedown', handleGlobalClick);
        };
    }, []);

    const [isSystemFractured, setIsSystemFractured] = useState(false);

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
                unlockedViews={[...unlockedViews, 'cellular_grid' as any, 'voice_authority' as any, 'constraints_audit' as any, 'remix_scope_lab' as any, 'medical_synthesis_lab' as any, 'sovereign_standard' as any, 'blockchain_history' as any]} onToggleTerminal={() => setIsTerminal(!isTerminal)} isTerminal={isTerminal}
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
                    <div className="absolute top-4 right-20 z-[60] flex items-center gap-6 pointer-events-none">
                        <div className="pointer-events-auto">
                            <SonicMetric size="sm" value={acousticPressure} label="DB_SPL" unit="dB" colorClass="border-blue-600 text-blue-500" />
                        </div>
                        <div className="pointer-events-auto">
                            <SonicMetric size="sm" value={conjunctionProgress.shards} label="CELL_CPH" unit="CPH" colorClass="border-amber-600 text-amber-500" />
                        </div>
                    </div>
                    {renderContent()}
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
                <StealthWatcher 
                    isLocked={isGhostMode} 
                    dissonanceLevel={acousticPressure} 
                    stride={harmonicStride} 
                />
            </main>
        </div>
      </ErrorBoundary>
    );
};
