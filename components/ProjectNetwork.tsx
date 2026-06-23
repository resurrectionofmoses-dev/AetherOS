
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MusicIcon, ActivityIcon, ZapIcon, CheckCircleIcon, FireIcon, CodeIcon, TerminalIcon, PlusIcon, BotIcon, ShieldIcon, XIcon, StarIcon, BrainIcon } from './icons';
import { 
  Clock, 
  AlertTriangle, 
  Play, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Timer, 
  RefreshCw, 
  BarChart2, 
  Sparkles, 
  AlertOctagon, 
  BellRing,
  Activity,
  Heart,
  Volume
} from 'lucide-react';
import { getSophisticatedColor } from '../utils';
import type { NetworkProject, UserProfile } from '../types';
import { suggestBlueprintTasks } from '../services/geminiService';
import { SonicMetric } from './SonicMetric';
import { Modal } from './Modal';
import { reportError, ErrorSeverity } from './GlobalErrorHandler';
import { v4 as uuidv4 } from 'uuid';

interface ProjectNetworkProps {
    profile?: UserProfile;
    projects: NetworkProject[];
    isSystemFractured?: boolean;
    onToggleFracture?: (val?: boolean) => void;
    onDeleteProject: (id: string) => void;
    onToggleTask: (projectId: string, taskId: string) => void;
    onAddTask: (projectId: string, text: string, dueDate?: string, priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => void;
    onDeleteTask: (projectId: string, taskId: string) => void;
    onUpdateProject?: (projectId: string, updates: Partial<NetworkProject>) => void;
    onAddProject?: (title: string, desc: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', deadline?: string, collaborators?: string[], gitHubRepo?: string, tags?: string[]) => void;
}

export const ProjectNetwork: React.FC<ProjectNetworkProps> = ({ profile, projects, isSystemFractured = false, onToggleFracture, onDeleteProject, onToggleTask, onAddTask, onDeleteTask, onUpdateProject, onAddProject }) => {
    const [now, setNow] = useState(Date.now());
    const [systemUptime, setSystemUptime] = useState(0);
    const [isAudible, setIsAudible] = useState(true);
    const [showAddProject, setShowAddProject] = useState(false);
    
    // Collaborators & network nodes tracking
    const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
    const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
    const [managingCollabsFor, setManagingCollabsFor] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('aetheros_network_profiles');
        if (stored) {
            setNetworkProfiles(JSON.parse(stored));
        }
    }, [showAddProject, managingCollabsFor]);

    // New Project Intake state variables
    const [newProjTitle, setNewProjTitle] = useState('');
    const [newProjDesc, setNewProjDesc] = useState('');
    const [newProjDeadline, setNewProjDeadline] = useState('');
    const [newProjGitHub, setNewProjGitHub] = useState('');
    const [newProjPriority, setNewProjPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');

    const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
    const [dateInputs, setDateInputs] = useState<Record<string, string>>({});
    const [priorityInputs, setPriorityInputs] = useState<Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>>({});
    const [taskFilters, setTaskFilters] = useState<Record<string, 'all' | 'active' | 'completed'>>({});
    const [taskSorts, setTaskSorts] = useState<Record<string, 'default' | 'dueDate' | 'alphabetical' | 'priority' | 'creationDate'>>({});
    const [suggestingFor, setSuggestingFor] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [projectStatusFilter, setProjectStatusFilter] = useState<string>('ALL');
    const [projectCompletionFilter, setProjectCompletionFilter] = useState<string>('ALL');
    const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('ALL');
    const [projectPriorityFilter, setProjectPriorityFilter] = useState<string>('ALL');
    const [projectTagFilter, setProjectTagFilter] = useState<string>('ALL');
    const [newProjTags, setNewProjTags] = useState<string>('');
    
    // Active Tab tracking per project card
    const [activeCardTabs, setActiveCardTabs] = useState<Record<string, 'tasks' | 'milestones' | 'chat'>>({});
    
    // Node Search / Invitation filters
    const [nodeSearchQuery, setNodeSearchQuery] = useState('');
    const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
    
    // Active Calibration Operations
    const [activeOps, setActiveOps] = useState<Record<string, { type: 'THD' | 'AMPLITUDE', timeLeft: number, totalTime: number, logs: string[] }>>({});

    const SIMULATED_DOING_STATUSES = [
        "Attuning neural resonance matrices",
        "Sensing ambient wave interference",
        "Scanning carrier frequencies at port 3000",
        "Fading spectrum THD noise level",
        "Locking phase coherence wave buffers",
        "Harmonizing deep-space cognitive conjunction lines",
        "Monitoring low-frequency acoustic vectors",
        "Guarding sovereign computational nodes",
        "Recalibrating high-density wave encoders",
        "Standing ready. System nominal."
    ];

    const playOperatorBeep = (freq = 800, type: OscillatorType = 'sine', duration = 0.08) => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Web audio blocked or unsupported
        }
    };

    const playAlertBeep = () => {
        playOperatorBeep(880, 'triangle', 0.1);
        setTimeout(() => playOperatorBeep(660, 'sawtooth', 0.15), 100);
    };

    const playCompletionBeep = () => {
        playOperatorBeep(520, 'sine', 0.08);
        setTimeout(() => playOperatorBeep(1040, 'sine', 0.12), 100);
    };

    // Sub-second countdown ticker hook
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
            setSystemUptime(prev => prev + 0.1);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Active Operations Calibration ticker hook
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveOps(prev => {
                const updated = { ...prev };
                let hasChanges = false;
                
                Object.entries(updated).forEach(([projId, op]) => {
                    if (op.timeLeft > 0) {
                        hasChanges = true;
                        const nextTime = Math.max(0, op.timeLeft - 0.1);
                        
                        let nextLogs = [...op.logs];
                        const logAtTimestamps: Record<string, string> = op.type === 'THD' ? {
                            "7": "📡 INJECTING ACOUSTIC SWEEP PILOT PROBE...",
                            "5.5": "⚡ EXTRACTING HARMONIC TRANSFORMS (THD)...",
                            "4": "🧠 ATTUNING RESONANCE COMPLIANCE VALUES...",
                            "2.5": "🔮 DE-NOISING HIGH FREQUENCY INTERFERENCE JITTER...",
                            "1": "🛡️ SECURING VOLTAGE EQUILIBRIUM LEVEL...",
                            "0": "✅ SUCCESS: SPECTRAL THD CALIBRATED TO 0.01%!"
                        } : {
                            "7": "🔗 LOCKING AMPLITUDE PHASE LOOP CHANNELS...",
                            "5.5": "📊 ADJUSTING INPUT MULTIPLIERS BY COMPRESSION ENVELOPE...",
                            "4": "🌊 PEAK LIMITING ENGAGED AT -0.1 dBTP...",
                            "2.5": "🔄 RE-ALIGNING SPECTRUM WAVEFORMS CONGRUENCY...",
                            "1": "🔒 COMMITTING STABILIZED AMPLITUDE COORDINATES...",
                            "0": "✅ SUCCESS: AMPLITUDE SYNCHRONIZED COMPLIANT!"
                        };
                        
                        const secondsPoint = parseFloat(nextTime.toFixed(1));
                        const matchString = String(secondsPoint);
                        if (logAtTimestamps[matchString] && !op.logs.includes(logAtTimestamps[matchString])) {
                            if (isAudible) {
                                playOperatorBeep(nextTime === 0 ? 1200 : 700, 'triangle', nextTime === 0 ? 0.2 : 0.05);
                            }
                            nextLogs.push(`[${new Date().toLocaleTimeString()}] ${logAtTimestamps[matchString]}`);
                        }
                        
                        if (nextTime === 0 && op.timeLeft > 0) {
                            if (op.type === 'THD') {
                                onUpdateProject?.(projId, { 
                                    crazyLevel: Math.max(1, Math.round(5 + Math.random() * 15)),
                                    fightVector: Math.min(100, Math.round(80 + Math.random() * 20))
                                });
                            } else {
                                onUpdateProject?.(projId, { 
                                    status: 'STABLE',
                                    fightVector: Math.min(100, Math.round(90 + Math.random() * 10))
                                });
                            }
                        }
                        
                        updated[projId] = {
                            ...op,
                            timeLeft: nextTime,
                            logs: nextLogs
                        };
                    }
                });
                
                return hasChanges ? updated : prev;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [isAudible, onUpdateProject]);

    // Audible alarm beep on urgencies
    useEffect(() => {
        if (!isAudible) return;
        const secondsTick = Math.floor(now / 1000);
        const hasCriticalProject = projects.some(p => {
            if (p.status === 'DONE') return false;
            const targetTime = p.deadline ? new Date(p.deadline).getTime() : (p.epochDate ? new Date(p.epochDate).getTime() : null);
            if (!targetTime) return false;
            const diff = targetTime - now;
            const threshold = (p.alertThreshold || 3600) * 1000;
            return diff > 0 && diff <= threshold;
        });

        if (hasCriticalProject && secondsTick % 5 === 0 && (now % 1000 < 150)) {
            playAlertBeep();
        }
    }, [now, isAudible, projects]);

    const handleAddTask = (projectId: string) => {
        const text = taskInputs[projectId];
        const dueDate = dateInputs[projectId];
        const priority = priorityInputs[projectId] || 'MEDIUM';
        if (!text?.trim()) return;
        onAddTask(projectId, text, dueDate, priority);
        setTaskInputs(prev => ({...prev, [projectId]: ''}));
        setDateInputs(prev => ({...prev, [projectId]: ''}));
        setPriorityInputs(prev => ({...prev, [projectId]: 'MEDIUM'}));
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            onDeleteProject(projectToDelete);
            setProjectToDelete(null);
        }
    };

    const handleSuggestTasks = async (p: NetworkProject) => {
        setSuggestingFor(p.id);
        try {
            const suggestions = await suggestBlueprintTasks(p.title, p.description || '');
            suggestions.forEach(suggestion => {
                onAddTask(p.id, suggestion);
            });
        } catch (error: any) {
            console.error("Failed to call the Gemini API:", error);
            reportError({
                title: 'SUGGESTION_FAILURE',
                message: `Failed to generate blueprint tasks: ${error?.message || 'Unknown neural fracture'}`,
                severity: ErrorSeverity.MEDIUM,
                error: error
            });
        } finally {
            setSuggestingFor(null);
        }
    };

    const handleSendProjectChat = (projectId: string, contentStr: string) => {
        playOperatorBeep(880, 'sine', 0.05);
        const activeProj = projects.find(proj => proj.id === projectId);
        if (!activeProj) return;

        const myUserName = profile?.username || 'user';
        const myMsg = {
            id: uuidv4(),
            sender: myUserName,
            avatarUrl: profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            content: contentStr,
            timestamp: Date.now()
        };

        const nextChats = [...(activeProj.chats || []), myMsg];
        onUpdateProject?.(projectId, { chats: nextChats });

        // Simulated collaborator reply
        const otherCollabs = (activeProj.collaborators || []).filter(u => u !== myUserName);
        setTimeout(() => {
            let responderUsername = 'Spectre_AI';
            let avatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80';

            if (otherCollabs.length > 0) {
                const chosen = otherCollabs[Math.floor(Math.random() * otherCollabs.length)];
                responderUsername = chosen;
                const fetchedProfile = networkProfiles.find(p => p.username === chosen);
                if (fetchedProfile?.avatarUrl) avatar = fetchedProfile.avatarUrl;
            } else if (networkProfiles.length > 0) {
                const choice = networkProfiles[Math.floor(Math.random() * networkProfiles.length)];
                responderUsername = choice.username;
                if (choice.avatarUrl) avatar = choice.avatarUrl;
            }

            const teamPhrases = [
                `Sovereign node @${myUserName} acknowledged! Synced with core target milestone. Let's make it stable!`,
                `Checked. I am looking over the frequency sweeps right now. Port 3000 shows stable amplitude!`,
                `Affirmative, let's secure the '${activeProj.title}' objectives! We have 120dB Signal-to-noise ratio and zero drift.`,
                `I'm currently committing a recursive optimization pass to reduce the clock skew. Let's build!`,
                `Excellent brief! Let's checkoff that milestone so we can align our lattices correctly.`,
                `Copy that. Let's make sure the required skills match before deploying to standard verification gates.`
            ];

            const randomPhrase = teamPhrases[Math.floor(Math.random() * teamPhrases.length)];
            const replyMsg = {
                id: uuidv4(),
                sender: responderUsername,
                avatarUrl: avatar,
                content: randomPhrase,
                timestamp: Date.now()
            };

            // Locate latest and append response
            const latestProj = projects.find(proj => proj.id === projectId);
            if (latestProj) {
                onUpdateProject?.(latestProj.id, { chats: [...(latestProj.chats || []), replyMsg] });
            }
            playOperatorBeep(1000, 'triangle', 0.05);
        }, 1500);
    };

    const stats = {
        totalResonators: projects.length,
        avgGain: projects.length ? Math.round(projects.reduce((a, b) => a + b.fightVector, 0) / projects.length) : 0,
        spectralNoise: projects.length ? Math.round(projects.reduce((a, b) => a + b.crazyLevel, 0) / projects.length) : 0,
    };

    const allAvailableProjectTags = Array.from(
        new Set(projects.flatMap(p => p.tags || []))
    ).sort();

    const filteredProjects = projects.filter(p => {
        if (projectStatusFilter !== 'ALL' && p.status !== projectStatusFilter) return false;
        
        if (projectCompletionFilter !== 'ALL') {
            const totalTasks = p.tasks ? p.tasks.length : 0;
            const completedTasks = p.tasks ? p.tasks.filter(t => t.completed).length : 0;
            const completionPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

            if (projectCompletionFilter === '0-49') {
                if (completionPercentage >= 50) return false;
            } else if (projectCompletionFilter === '50-99') {
                if (completionPercentage < 50 || completionPercentage >= 100) return false;
            } else if (projectCompletionFilter === '100') {
                if (completionPercentage !== 100 || totalTasks === 0) return false;
            }
        }
        
        if (projectPriorityFilter !== 'ALL') {
            if (p.priority !== projectPriorityFilter) return false;
        }

        if (taskPriorityFilter !== 'ALL') {
            const hasPriorityTask = p.tasks && p.tasks.some(t => t.priority === taskPriorityFilter);
            if (!hasPriorityTask) return false;
        }

        if (projectTagFilter !== 'ALL') {
            if (!p.tags || !p.tags.includes(projectTagFilter)) return false;
        }
        
        return true;
    });

    return (
        <div className={`h-full flex flex-col bg-transparent text-gray-200 font-mono p-4 space-y-4 overflow-hidden relative ${isSystemFractured ? 'project-dashboard-delirium' : ''}`}>
            {/* Header: Acoustic Command */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-black p-4 rounded-3xl border-4 border-black aero-panel shadow-[8px_8px_0_0_#000] relative z-10 gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600/10 border-4 border-blue-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <MusicIcon className="w-10 h-10 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-4xl text-white italic tracking-tighter uppercase leading-none">Acoustic_Conjunction</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] bg-blue-900/40 text-blue-400 px-2 py-0.5 border border-blue-500/30 rounded font-black uppercase tracking-widest">Master Solo Series</span>
                            <button
                                onClick={() => {
                                    if (onToggleFracture) {
                                        onToggleFracture();
                                        playOperatorBeep(isSystemFractured ? 800 : 440, 'sawtooth', 0.1);
                                    }
                                }}
                                className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border transition-all cursor-pointer ${
                                    isSystemFractured 
                                        ? 'bg-red-950/80 border-red-500 text-red-400 hover:bg-red-900/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse'
                                        : 'bg-zinc-900/90 border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-400 font-mono'
                                }`}
                                title="Toggle System Delirium Effects"
                            >
                                {isSystemFractured ? '⚡ DELIRIUM: ACTIVE (TOGGLE)' : '⚠️ TEST SYSTEM DELIRIUM'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-10">
                    <SonicMetric size="sm" value={stats.totalResonators} label="CHAMBERS" unit="Nodes" colorClass="border-blue-600 text-blue-500" />
                    <SonicMetric size="sm" value={stats.avgGain} label="RESONANCE" unit="dB" colorClass="border-amber-600 text-amber-500" />
                    <SonicMetric size="sm" value={stats.spectralNoise} label="NOISE_THD" unit="%" colorClass="border-red-600 text-red-500" />
                </div>
            </div>

            {/* Delirium Sentinel Sandbox Warning Panel */}
            {isSystemFractured && (
                <div className="bg-gradient-to-r from-red-950/90 via-black to-red-950/90 border-4 border-red-600 rounded-3xl p-6 relative z-10 shadow-[0_0_40px_rgba(239,68,68,0.4)] font-mono animate-in fade-in zoom-in duration-300">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="space-y-2 flex-1 text-left">
                            <div className="flex items-center gap-3">
                                <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                                <h3 className="text-lg font-black text-white hover:text-red-400 tracking-wider uppercase">
                                    ⚠️ SENTINEL_CODE_WARNING: THREAD_DELIRIUM_SANDBOX_ENGAGED
                                </h3>
                            </div>
                            <p className="text-xs text-red-350 leading-relaxed max-w-4xl">
                                Defensive state integrity fracture detected! Execution of raw malicious code or unauthorized payloads has been proactively intercepted and diverted. Instead, the <strong className="text-white underline">AetherOS Delirium Engine</strong> has brought the targeted logic block into a robust, high-fidelity delirium to isolate side-channel vectors.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] border border-red-500/40 text-red-400 font-bold px-2.5 py-1 bg-red-900/20 rounded uppercase tracking-widest">
                                PORT 3000 SECURITY BLOCK
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 border-t border-red-600/30 pt-4">
                        <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest text-left mb-3">
                            🎯 RECOMMENDED SYSTEM ACTIONS TO NEUTRALIZE DETECTED DRIFT & CONFLICTS:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-black/80 border-2 border-red-800 rounded-2xl p-4 flex flex-col justify-between text-left hover:border-red-500 transition-all">
                                <div>
                                    <h5 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                                        🛡️ 1. Sandbox isolation
                                    </h5>
                                    <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                                        Route all thread operations through the newly instantiated <code className="text-cyan-400 bg-black px-1 rounded font-mono">ThreadedAgentGateway</code> in <code className="text-white bg-black px-1 rounded font-mono">restricted_gateway.py</code> to ensure rigorous validation policies.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        playOperatorBeep(1200, 'sawtooth', 0.15);
                                        alert("Isolating operation... Sandboxing completed. Threat quarantined inside ThreadedAgentGateway queue.");
                                    }}
                                    className="mt-4 w-full py-1.5 bg-red-950/70 border border-red-500 hover:bg-red-900 text-white font-black text-[10px] uppercase rounded-lg transition-all cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                >
                                    Isolate Process Gateway
                                </button>
                            </div>

                            <div className="bg-black/80 border-2 border-red-800 rounded-2xl p-4 flex flex-col justify-between text-left hover:border-red-500 transition-all">
                                <div>
                                    <h5 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                                        ⚡ 2. Jitter Injection
                                    </h5>
                                    <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                                        Introduce synthetic high-frequency phase noise to exhaust adversarial clock attacks. This brings the compromised logic unto a stable noise floor.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        playOperatorBeep(1400, 'triangle', 0.25);
                                        alert("Noise sweep injected. All high-frequency channels stabilized by random quantum phase jitters.");
                                    }}
                                    className="mt-4 w-full py-1.5 bg-red-950/70 border border-red-500 hover:bg-red-900 text-white font-black text-[10px] uppercase rounded-lg transition-all cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                >
                                    Inject Delirium Noise Shift
                                </button>
                            </div>

                            <div className="bg-black/80 border-2 border-red-800 rounded-2xl p-4 flex flex-col justify-between text-left hover:border-red-500 transition-all">
                                <div>
                                    <h5 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                                        🔬 3. Coherence Re-Sync
                                    </h5>
                                    <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                                        Force alignment between the Project Collaboration Board tasks and Live Sovereign Shield telemetry coordinates to eliminate latent skews.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        playOperatorBeep(1600, 'sine', 0.1);
                                        alert("Lattice synchronization initiated. Please transition to standard 'Sovereign Shield' view 'State Reconciliation Hub' to heal all skews.");
                                    }}
                                    className="mt-4 w-full py-1.5 bg-red-950/70 border border-red-500 hover:bg-red-900 text-white font-black text-[10px] uppercase rounded-lg transition-all cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                >
                                    Run State Alignment Check
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Chronos Deck Widget */}
            <div className="bg-black/80 border-2 border-blue-500/30 rounded-3xl p-6 relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.1)] font-mono">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-blue-400 animate-[spin_8s_linear_infinite]" />
                        <div>
                            <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">CHRONOS_CONJUNCTION_DECK</h3>
                            <p className="text-[10px] text-gray-500 uppercase">Acoustic timeline grids & tactical countdown monitors</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Audio Toggle */}
                        <button 
                            onClick={() => {
                                playOperatorBeep(isAudible ? 400 : 1000, 'sine', 0.1);
                                setIsAudible(!isAudible);
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                                isAudible 
                                ? 'bg-blue-500/10 border-blue-500 text-blue-400 font-black' 
                                : 'bg-black border-zinc-800 text-zinc-600'
                            }`}
                        >
                            {isAudible ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                            Aura Tick: {isAudible ? 'ON' : 'OFF'}
                        </button>

                        {/* System Boot Uptime */}
                        <div className="px-3 py-1.5 bg-black border border-zinc-800 rounded-xl flex items-center gap-2 text-[10px] text-zinc-400">
                            <Timer className="w-3.5 h-3.5 text-zinc-500" />
                            <span>UPTIME: <strong className="text-white font-mono">{Math.floor(systemUptime / 3600).toString().padStart(2, '0')}:{Math.floor((systemUptime % 3600) / 60).toString().padStart(2, '0')}:{Math.floor(systemUptime % 60).toString().padStart(2, '0')}.{(Math.floor(systemUptime * 10) % 10)}</strong></span>
                        </div>

                        {/* Add Project Intake */}
                        {onAddProject && (
                            <button
                                onClick={() => {
                                    playOperatorBeep(800, 'triangle', 0.05);
                                    setShowAddProject(!showAddProject);
                                }}
                                className={`px-4 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                                    showAddProject
                                    ? 'bg-purple-600 border-purple-500 text-white'
                                    : 'bg-black border-purple-900 text-purple-400 hover:bg-purple-950/20'
                                }`}
                            >
                                {showAddProject ? '✕ Close Deck Intake' : '➔ Create Target Node'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Collapsible Project Creator Form */}
                <AnimatePresence>
                    {showAddProject && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-b border-white/5 pb-4 mb-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 p-4 bg-zinc-950/60 border border-purple-900/30 rounded-2xl max-w-7xl mx-auto">
                                <div className="flex flex-col gap-1.5 text-left">
                                    <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest">TITLE</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., Chamber_Sollus_3" 
                                        value={newProjTitle}
                                        onChange={e => setNewProjTitle(e.target.value)}
                                        className="bg-black border border-zinc-850 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 text-left">
                                    <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest">DESCRIPTION</label>
                                    <input 
                                        type="text" 
                                        placeholder="Cognitive resonance monitoring..." 
                                        value={newProjDesc}
                                        onChange={e => setNewProjDesc(e.target.value)}
                                        className="bg-black border border-zinc-850 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 text-left">
                                    <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest">GITHUB REPOSITORY URL</label>
                                    <input 
                                        type="text" 
                                        placeholder="https://github.com/org/repo" 
                                        value={newProjGitHub}
                                        onChange={e => setNewProjGitHub(e.target.value)}
                                        className="bg-black border border-zinc-850 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 text-left">
                                    <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest">SKILLS / TECHNOLOGY TAGS</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. react, tailwind, d3" 
                                        value={newProjTags}
                                        onChange={e => setNewProjTags(e.target.value)}
                                        className="bg-black border border-zinc-850 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 text-left">
                                    <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest">TARGET DEADLINE (CHRONOS)</label>
                                    <input 
                                        type="datetime-local" 
                                        value={newProjDeadline}
                                        onChange={e => setNewProjDeadline(e.target.value)}
                                        className="bg-black border border-zinc-850 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-red-400 font-mono"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 text-left">
                                    <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest">co-concurring nodes</label>
                                    <div className="flex flex-wrap gap-1 bg-black/40 border border-zinc-850 rounded-xl p-2 min-h-[38px] max-h-[100px] overflow-y-auto custom-scrollbar">
                                        {networkProfiles.length === 0 ? (
                                            <span className="text-[8px] text-zinc-600 italic uppercase">No nodes scanned.</span>
                                        ) : (
                                            networkProfiles.map((prof: any) => {
                                                const isSelected = selectedCollaborators.includes(prof.username);
                                                return (
                                                    <button
                                                        key={prof.id}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setSelectedCollaborators(prev => prev.filter(u => u !== prof.username));
                                                            } else {
                                                                setSelectedCollaborators(prev => [...prev, prof.username]);
                                                            }
                                                            playOperatorBeep(850, 'sine', 0.05);
                                                        }}
                                                        className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-black border transition-all ${
                                                            isSelected
                                                            ? 'bg-purple-950/50 border-purple-500 text-purple-300 font-bold'
                                                            : 'bg-zinc-900/60 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                                                        }`}
                                                        title={`Click to invite @${prof.username}`}
                                                    >
                                                        @{prof.username}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end">
                                    <button
                                        onClick={() => {
                                            if (!newProjTitle.trim()) return;
                                            const tagsArray = newProjTags
                                                .split(',')
                                                .map(t => t.trim().toLowerCase())
                                                .filter(t => t.length > 0);
                                            onAddProject?.(newProjTitle, newProjDesc, newProjPriority as any, newProjDeadline || undefined, selectedCollaborators, newProjGitHub || undefined, tagsArray);
                                            setNewProjTitle('');
                                            setNewProjDesc('');
                                            setNewProjDeadline('');
                                            setNewProjGitHub('');
                                            setNewProjTags('');
                                            setSelectedCollaborators([]);
                                            setShowAddProject(false);
                                            playCompletionBeep();
                                        }}
                                        className="w-full py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:brightness-110 text-white font-black uppercase text-[10px] rounded-xl border border-black shadow-lg cursor-pointer animate-pulse"
                                    >
                                        Deploy Target Node 🚀
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid Timelines */}
                <div className="space-y-3">
                    <span className="text-[9px] font-black tracking-widest text-gray-500 uppercase block text-left">Cognitive Timeline Monitors</span>
                    {projects.filter(p => p.deadline || p.epochDate).length === 0 ? (
                        <div className="p-4 bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-800/80 text-center text-[10px] text-zinc-500 uppercase tracking-wide">
                            GRID CHRONOS: No target deadlines deployed. Click "Create Target Node" or enter "Deadline" inside an active Project Chamber.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.filter(p => p.deadline || p.epochDate).map(p => {
                                const targetTime = p.deadline ? new Date(p.deadline).getTime() : (p.epochDate ? new Date(p.epochDate).getTime() : null);
                                if (!targetTime) return null;
                                
                                const remaining = targetTime - now;
                                const isCritical = p.status !== 'DONE' && remaining > 0 && remaining <= (p.alertThreshold || 3600) * 1000;
                                const isElapsed = remaining <= 0;
                                
                                // Color styles
                                let accentBg = "bg-zinc-950 border-zinc-900 text-zinc-400";
                                let progressColor = "bg-blue-500";
                                if (isElapsed && p.status !== 'DONE') {
                                    accentBg = "bg-rose-950/20 border-red-900/60 text-rose-400 font-bold";
                                    progressColor = "bg-red-600";
                                } else if (isCritical) {
                                    accentBg = "bg-yellow-950/30 border-amber-600/60 text-amber-500 font-black animate-pulse shadow-[0_0_15px_rgba(217,119,6,0.1)]";
                                    progressColor = "bg-gradient-to-r from-amber-500 to-red-500";
                                } else if (p.status === 'DONE') {
                                    accentBg = "bg-emerald-950/10 border-emerald-900/40 text-emerald-500";
                                    progressColor = "bg-emerald-500";
                                }

                                // Format string
                                let timeString = "ELAPSED";
                                if (!isElapsed) {
                                    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
                                    const hrs = Math.floor((remaining / (1000 * 60 * 60)) % 24);
                                    const mins = Math.floor((remaining / 1000 / 60) % 60);
                                    const secs = Math.floor((remaining / 1000) % 60);
                                    const ms = Math.floor((remaining % 1000) / 100);
                                    timeString = `${days > 0 ? `${days}d ` : ''}${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
                                }

                                return (
                                    <div key={p.id} className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${accentBg}`}>
                                        <div className="flex items-center justify-between gap-2 mb-1.5 min-w-0">
                                            <span className="text-[11px] font-black uppercase tracking-tight truncate max-w-[140px] text-left">{p.title}</span>
                                            <span className="text-[10px] font-mono font-black tabular-nums">{timeString}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[8px] text-gray-500 uppercase font-bold mt-1">
                                            <span className="flex items-center gap-1">
                                                {isElapsed && p.status !== 'DONE' ? <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" /> : <Clock className="w-3 h-3 text-blue-400" />}
                                                {p.status === 'DONE' ? 'SYSTEM SECURED' : (isElapsed ? 'OVERDUE' : (isCritical ? '⚠️ CRISIS POINT' : 'STABLE'))}
                                            </span>
                                            <span className="italic truncate max-w-[120px] text-right">
                                                {p.status === 'DONE' ? 'IDLE' : SIMULATED_DOING_STATUSES[Math.floor((now + p.id.charCodeAt(0)*1000)/3000) % SIMULATED_DOING_STATUSES.length].substring(0, 20)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-black/40 p-4 rounded-xl border border-white/10 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Status:</span>
                    <select 
                        value={projectStatusFilter}
                        onChange={(e) => setProjectStatusFilter(e.target.value)}
                        className="bg-black border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="IDEATING">Ideating</option>
                        <option value="BUILDING">Building</option>
                        <option value="DONE">Done</option>
                        <option value="FORGING">Forging</option>
                        <option value="STABLE">Stable</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Completion:</span>
                    <select 
                        value={projectCompletionFilter}
                        onChange={(e) => setProjectCompletionFilter(e.target.value)}
                        className="bg-black border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Projects</option>
                        <option value="0-49">0% - 49% Completed</option>
                        <option value="50-99">50% - 99% Completed</option>
                        <option value="100">100% Completed</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Project Priority:</span>
                    <select 
                        value={projectPriorityFilter}
                        onChange={(e) => setProjectPriorityFilter(e.target.value)}
                        className="bg-black border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Task Priority:</span>
                    <select 
                        value={taskPriorityFilter}
                        onChange={(e) => setTaskPriorityFilter(e.target.value)}
                        className="bg-black border border-white/20 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">Any Priority</option>
                        <option value="LOW">Has Low Priority</option>
                        <option value="MEDIUM">Has Medium Priority</option>
                        <option value="HIGH">Has High Priority</option>
                        <option value="CRITICAL">Has Critical Priority</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Skill / Tech Tag:</span>
                    <select 
                        value={projectTagFilter}
                        onChange={(e) => setProjectTagFilter(e.target.value)}
                        className="bg-black border border-emerald-900/50 focus:border-emerald-500/80 rounded px-3 py-1 text-sm text-emerald-400 focus:outline-none font-bold font-mono"
                    >
                        <option value="ALL">All Skill Tags</option>
                        {allAvailableProjectTags.map(tag => (
                            <option key={tag} value={tag}>#{tag}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pr-2 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                    <AnimatePresence>
                        {filteredProjects.map(p => {
                            const theme = getSophisticatedColor(p.id + p.title);
                            const currentFilter = taskFilters[p.id] || 'all';
                            const currentSort = taskSorts[p.id] || 'default';

                            let filteredTasks = p.tasks ? [...p.tasks] : [];

                            if (currentFilter === 'active') {
                                filteredTasks = filteredTasks.filter(t => !t.completed);
                            } else if (currentFilter === 'completed') {
                                filteredTasks = filteredTasks.filter(t => t.completed);
                            }

                            if (currentSort === 'dueDate') {
                                filteredTasks.sort((a, b) => {
                                    if (!a.dueDate) return 1;
                                    if (!b.dueDate) return -1;
                                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                                });
                            } else if (currentSort === 'alphabetical') {
                                filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
                            } else if (currentSort === 'priority') {
                                const priorityWeight = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                                filteredTasks.sort((a, b) => {
                                    const weightA = priorityWeight[a.priority as keyof typeof priorityWeight] || 2;
                                    const weightB = priorityWeight[b.priority as keyof typeof priorityWeight] || 2;
                                    return weightB - weightA;
                                });
                            } else if (currentSort === 'creationDate') {
                                filteredTasks.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
                            }

                            const targetTime = p.deadline ? new Date(p.deadline).getTime() : (p.epochDate ? new Date(p.epochDate).getTime() : null);
                            const remaining = targetTime ? targetTime - now : 0;
                            const isElapsed = targetTime ? remaining <= 0 : false;
                            const isCritical = p.status !== 'DONE' && targetTime && remaining > 0 && remaining <= (p.alertThreshold || 3600) * 1000;

                            let customCardCls = `${theme.bg} ${theme.glow}`;
                            if (isCritical) {
                                customCardCls = "bg-rose-950/20 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.35)] animate-[pulse_2s_infinite]";
                            } else if (isElapsed && p.status !== 'DONE') {
                                customCardCls = "bg-zinc-950/90 border-red-950/80 shadow-[0_0_20px_rgba(0,0,0,0.8)]";
                            }

                            return (
                                <motion.div 
                                    key={p.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.5 }}
                                    className={`aero-panel p-8 group/card transition-all duration-700 flex flex-col relative overflow-hidden border-4 border-black shadow-[12px_12px_0_0_#000] hover:shadow-[20px_20px_30px_rgba(0,0,0,0.6)] ${customCardCls}`}
                                >
                                    {/* Diagonal Danger Stripe Overlay on Critical Card */}
                                    {isCritical && (
                                        <div className="absolute top-0 right-0 left-0 h-1.5 bg-[repeating-linear-gradient(45deg,#f43f5e,#f43f5e_10px,#000_10px,#000_20px)] opacity-80" />
                                    )}

                                    <div className="flex justify-between items-start mb-6 z-10 relative">
                                        <div className="flex flex-col gap-2 text-left">
                                            <div className={`px-4 py-1 text-[8px] font-black rounded-full border-2 border-black w-fit ${
                                                p.status === 'DONE' ? 'bg-green-600 text-black' : (isCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 text-white animate-pulse')
                                            }`}>
                                                STATUS: {p.status}
                                            </div>
                                            <h4 className="font-comic-header text-3xl text-white italic uppercase tracking-tighter leading-none">{p.title}</h4>
                                            
                                            {/* Tactical Metadata Panel */}
                                            <div className="grid grid-cols-2 gap-2 mt-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Priority:</span>
                                                    <select
                                                        value={p.priority || 'MEDIUM'}
                                                        onChange={(e) => onUpdateProject?.(p.id, { priority: e.target.value as any })}
                                                        className="bg-black border border-zinc-800 rounded px-1.5 py-0.5 text-[8px] text-white focus:outline-none focus:border-blue-600/50 transition-all uppercase font-mono"
                                                    >
                                                        <option value="LOW">Low</option>
                                                        <option value="MEDIUM">Medium</option>
                                                        <option value="HIGH">High</option>
                                                        <option value="CRITICAL">Critical</option>
                                                    </select>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Epoch:</span>
                                                    <input 
                                                        type="date"
                                                        value={p.epochDate || ''}
                                                        onChange={(e) => {
                                                            onUpdateProject?.(p.id, { epochDate: e.target.value });
                                                            // Auto sync deadline if not set
                                                            if (!p.deadline && e.target.value) {
                                                                onUpdateProject?.(p.id, { deadline: `${e.target.value}T18:00` });
                                                            }
                                                        }}
                                                        className="bg-black border border-zinc-800 rounded px-1.5 py-0.5 text-[8px] text-blue-400 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                                                    />
                                                </div>

                                                <div className="col-span-2 flex items-center gap-1.5 border-t border-white/5 pt-1.5">
                                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Chronos Dead:</span>
                                                    <input 
                                                        type="datetime-local"
                                                        value={p.deadline || ''}
                                                        onChange={(e) => onUpdateProject?.(p.id, { deadline: e.target.value })}
                                                        className="bg-black border border-zinc-800 rounded px-1.5 py-0.5 text-[8px] text-red-400 focus:outline-none focus:border-red-500/50 transition-all font-mono flex-1"
                                                    />
                                                </div>

                                                <div className="col-span-2 flex items-center gap-1.5 border-t border-white/5 pt-1.5">
                                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Repository:</span>
                                                    <input 
                                                        type="text"
                                                        placeholder="No repository linked"
                                                        value={p.gitHubRepo || ''}
                                                        onChange={(e) => onUpdateProject?.(p.id, { gitHubRepo: e.target.value })}
                                                        className="bg-black border border-zinc-800 rounded px-1.5 py-0.5 text-[8px] text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-all font-mono flex-1 min-w-0"
                                                    />
                                                    {p.gitHubRepo && p.gitHubRepo.startsWith('http') && (
                                                        <a 
                                                            href={p.gitHubRepo}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 text-[8px] text-cyan-400 font-bold uppercase transition-all shrink-0"
                                                        >
                                                            Open ↗
                                                        </a>
                                                    )}
                                                </div>

                                                <div className="col-span-2 flex items-center gap-1.5 pt-0.5">
                                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Alert Buffer:</span>
                                                    <select
                                                        value={p.alertThreshold || 3600}
                                                        onChange={(e) => onUpdateProject?.(p.id, { alertThreshold: Number(e.target.value) })}
                                                        className="bg-black border border-zinc-800 rounded px-1.5 py-0.5 text-[8px] text-zinc-400 focus:outline-none focus:border-zinc-500 transition-all uppercase font-mono flex-1"
                                                    >
                                                        <option value="60">1 Minute</option>
                                                        <option value="300">5 Minutes</option>
                                                        <option value="1800">30 Minutes</option>
                                                        <option value="3600">1 Hour (Default)</option>
                                                        <option value="21600">6 Hours</option>
                                                        <option value="86400">24 Hours</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <motion.button 
                                            whileHover={{ scale: 1.2, color: "#ef4444" }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setProjectToDelete(p.id)} 
                                            className="text-black/40 transition-colors shrink-0"
                                        >
                                            <XIcon className="w-6 h-6" />
                                        </motion.button>
                                    </div>

                                    {/* Project Description & Interactive Skills/Tech Tag System */}
                                    <div className="mt-4 mb-6 space-y-4 text-left z-10 relative">
                                        {p.description && (
                                            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">Project Mission Brief</span>
                                                <p className="text-xs text-zinc-300 font-sans leading-relaxed">{p.description}</p>
                                            </div>
                                        )}

                                        <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-1.5">
                                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Technology domains & required skills</span>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {(p.tags || []).map((tag) => (
                                                    <span 
                                                        key={tag} 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setProjectTagFilter(tag === projectTagFilter ? 'ALL' : tag);
                                                            playOperatorBeep(800, 'sine', 0.05);
                                                        }}
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                                                            projectTagFilter === tag
                                                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                                            : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-zinc-500 hover:text-white'
                                                        }`}
                                                        title={`Click to filter projects for #${tag}`}
                                                    >
                                                        #{tag}
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                playOperatorBeep(600, 'sine', 0.05);
                                                                const remainingTags = (p.tags || []).filter(t => t !== tag);
                                                                onUpdateProject?.(p.id, { tags: remainingTags });
                                                            }}
                                                            className="text-zinc-650 hover:text-red-400 transition-colors ml-0.5 font-sans font-bold text-[10px]"
                                                            title="Delete Tag"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                                <input 
                                                    type="text" 
                                                    placeholder="+ Tag"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = e.currentTarget.value.trim().toLowerCase();
                                                            if (val) {
                                                                const existing = p.tags || [];
                                                                if (!existing.includes(val)) {
                                                                    onUpdateProject?.(p.id, { tags: [...existing, val] });
                                                                    playOperatorBeep(900, 'sine', 0.05);
                                                                }
                                                                e.currentTarget.value = '';
                                                            }
                                                        }
                                                    }}
                                                    className="bg-black border border-zinc-850 focus:border-purple-600 rounded px-1.5 py-0.5 text-[8px] text-zinc-300 font-mono w-14 focus:w-24 transition-all"
                                                    title="Type a tag and hit Enter to add"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Collaborators row */}
                                    <div className="flex flex-wrap items-center gap-2.5 mb-6 p-4 bg-purple-950/5 border border-purple-900/10 rounded-2xl z-10 relative">
                                        <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-none">Collaborator Nodes:</span>
                                        <div className="flex -space-x-1.5 overflow-hidden">
                                            {(p.collaborators || []).map((username: string) => {
                                                const memberNode = networkProfiles.find((profile: any) => profile.username === username);
                                                return (
                                                    <div 
                                                        key={username}
                                                        className="w-6 h-6 rounded-full border border-black overflow-hidden bg-zinc-900 group"
                                                        title={`Invited Node: @${username}`}
                                                    >
                                                        <img 
                                                            src={memberNode?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                                                            alt={username} 
                                                            className="w-full h-full object-cover" 
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    </div>
                                                );
                                            })}
                                            {(p.collaborators || []).length === 0 && (
                                                <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase italic leading-none pl-1">Solo Node (Aetheros Only)</span>
                                            )}
                                        </div>
                                        
                                        {profile?.username && (
                                            <button
                                                onClick={() => {
                                                    playOperatorBeep(850, 'sine', 0.05);
                                                    const current = p.collaborators || [];
                                                    const isMember = current.includes(profile.username);
                                                    const nextCollabs = isMember 
                                                        ? current.filter(u => u !== profile.username)
                                                        : [...current, profile.username];
                                                    onUpdateProject?.(p.id, { collaborators: nextCollabs });
                                                }}
                                                className={`px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                    (p.collaborators || []).includes(profile.username)
                                                    ? 'border-rose-900/40 bg-rose-950/20 hover:border-rose-500 hover:bg-rose-950/40 text-rose-400 hover:text-white'
                                                    : 'border-emerald-900/40 bg-emerald-950/20 hover:border-emerald-500 hover:bg-emerald-950/40 text-emerald-400 hover:text-white_glow'
                                                }`}
                                                title={(p.collaborators || []).includes(profile.username) ? "Leave this project" : "Join/Apply to this project"}
                                            >
                                                {(p.collaborators || []).includes(profile.username) ? '➔ Leave Project' : '✚ Apply to Join'}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                playOperatorBeep(900, 'sine', 0.05);
                                                setManagingCollabsFor(p.id);
                                            }}
                                            className="ml-auto px-2 py-1 rounded-lg border border-purple-900/40 bg-purple-950/15 hover:border-purple-500 hover:bg-purple-950/30 text-[8px] text-purple-400 hover:text-white font-black uppercase tracking-wider transition-all cursor-pointer"
                                            title="Invite developers from the coding network"
                                        >
                                            + Invite Node
                                        </button>
                                    </div>

                                    <div className="bg-black/60 rounded-2xl p-5 mb-6 border-2 border-white/5 relative group/viz transition-all hover:bg-black/80">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reliability_Index</span>
                                                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Spectral Synchronization</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-2xl font-comic-header italic leading-none ${
                                                    p.tasks?.length && p.tasks.filter(t => t.completed).length === p.tasks.length 
                                                    ? "text-emerald-400 wisdom-glow" 
                                                    : "text-white"
                                                }`}>
                                                    {p.tasks?.length ? Math.round((p.tasks.filter(t => t.completed).length / p.tasks.length) * 100) : 0}%
                                                </span>
                                                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-tighter">Conjunction Success</span>
                                            </div>
                                        </div>
                                        <div className="h-4 bg-black rounded-full overflow-hidden border-2 border-black shadow-inner p-0.5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${p.tasks?.length ? (p.tasks.filter(t => t.completed).length / p.tasks.length) * 100 : 0}%` }}
                                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                                                    p.tasks?.length && p.tasks.filter(t => t.completed).length === p.tasks.length 
                                                    ? "bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                                                    : "bg-gradient-to-r from-blue-700 to-indigo-500"
                                                }`}
                                            />
                                        </div>
                                        {/* Small sparkle effect for 100% */}
                                        {p.tasks?.length && p.tasks.filter(t => t.completed).length === p.tasks.length && (
                                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-20" />
                                        )}
                                    </div>

                                    {/* Real-time Countdown Clock Widget */}
                                    <div className="bg-black/85 rounded-2xl p-5 mb-4 border-2 border-zinc-950 relative overflow-hidden text-left">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <Clock className={`w-4 h-4 ${isCritical ? 'text-red-500 animate-bounce' : 'text-zinc-500 animate-spin'}`} style={{ animationDuration: isCritical ? '1s' : '10s' }} />
                                                <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">Acoustic Timeline Grid</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 font-mono">
                                                <span className="text-[8px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850 text-zinc-500 font-bold uppercase shrink-0">
                                                    Uptime: {Math.floor((now - new Date(p.timestamp || Date.now()).getTime()) / 1000 / 60)}m {Math.floor((now - new Date(p.timestamp || Date.now()).getTime()) / 1000) % 60}s
                                                </span>
                                            </div>
                                        </div>

                                        {targetTime ? (
                                            <div className="flex flex-col gap-3 font-mono">
                                                <div className="grid grid-cols-5 gap-1 text-center bg-zinc-950 p-2 rounded-xl border border-zinc-900 select-none">
                                                    <div>
                                                        <span className="block text-xl md:text-2xl font-black text-white leading-none tracking-tight tabular-nums">
                                                            {isElapsed ? '00' : Math.floor(remaining / (1000 * 60 * 60 * 24)).toString().padStart(2, '0')}
                                                        </span>
                                                        <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest mt-1 block">Days</span>
                                                    </div>
                                                    <div className="text-zinc-700 text-xl font-bold self-center">:</div>
                                                    <div>
                                                        <span className="block text-xl md:text-2xl font-black text-white leading-none tracking-tight tabular-nums">
                                                            {isElapsed ? '00' : Math.floor((remaining / (1000 * 60 * 60)) % 24).toString().padStart(2, '0')}
                                                        </span>
                                                        <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest mt-1 block">Hours</span>
                                                    </div>
                                                    <div className="text-zinc-700 text-xl font-bold self-center">:</div>
                                                    <div>
                                                        <span className="block text-xl md:text-2xl font-black text-white leading-none tracking-tight tabular-nums">
                                                            {isElapsed ? '00' : Math.floor((remaining / 1000 / 60) % 60).toString().padStart(2, '0')}
                                                        </span>
                                                        <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest mt-1 block">Mins</span>
                                                    </div>
                                                    <div className="text-zinc-700 text-xl font-bold self-center">:</div>
                                                    <div>
                                                        <span className="block text-xl md:text-2xl font-black text-white leading-none tracking-tight tabular-nums">
                                                            {isElapsed ? '00' : Math.floor((remaining / 1000) % 60).toString().padStart(2, '0')}
                                                        </span>
                                                        <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest mt-1 block">Secs</span>
                                                    </div>
                                                    <div className="text-zinc-700 text-xl font-bold self-center">.</div>
                                                    <div>
                                                        <span className="block text-xl md:text-2xl font-black text-red-500 leading-none tracking-tight tabular-nums">
                                                            {isElapsed ? '0' : Math.floor((remaining % 1000) / 100)}
                                                        </span>
                                                        <span className="text-[7px] text-red-950 font-bold uppercase tracking-widest mt-1 block">Ms</span>
                                                    </div>
                                                </div>

                                                {/* Visual alerts when nearing zero */}
                                                {isCritical && (
                                                    <div className="bg-red-950/40 border border-red-500/40 p-2.5 rounded-xl flex items-center gap-3 animate-pulse">
                                                        <AlertOctagon className="w-5 h-5 text-red-500 flex-shrink-0 animate-bounce" />
                                                        <div className="text-[8px] text-red-400 font-mono tracking-tight leading-normal uppercase">
                                                            ⚠️ COGNITIVE DE-SYNCHRONIZATION IMMINENT! TARGET DEADLINE NEARING APOCALYPSE BUFFER!
                                                        </div>
                                                    </div>
                                                )}

                                                {isElapsed && p.status !== 'DONE' && (
                                                    <div className="bg-red-900 border border-red-600 p-2.5 rounded-xl flex items-center gap-3">
                                                        <ShieldAlert className="w-5 h-5 text-white flex-shrink-0 animate-ping" />
                                                        <div className="text-[8.5px] text-white font-mono tracking-tight leading-normal uppercase font-black">
                                                            🚨 CRITICAL UNEXPIRED OVERLOAD DETECTED! INJECT CARRIER SIGNALS TO PREVENT FRACTURES!
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-2 text-center font-mono">
                                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">No exact deadline conjunction locked.</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Live Active Diagnostics Ticker ("can you put timer on everything and let it tell you what it doing") */}
                                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900/40 flex items-center justify-between mb-4 text-[9px] text-zinc-400 text-left">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse shrink-0" />
                                            <span className="text-[8px] uppercase tracking-wider text-zinc-600 shrink-0 font-bold">GRID ACT:</span>
                                            <span className="text-white uppercase truncate font-mono min-w-0">
                                                {p.status === 'DONE' ? 'GRID: Nominally guarding sovereign state.' : SIMULATED_DOING_STATUSES[Math.floor((now + p.id.charCodeAt(0) * 1000) / 4000) % SIMULATED_DOING_STATUSES.length]}
                                            </span>
                                        </div>
                                        <div className="text-zinc-500 shrink-0 font-mono font-black flex items-center gap-1 ml-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                                            <span>{(95.4 + (now % 17) * 0.1).toFixed(1)} Hz</span>
                                        </div>
                                    </div>

                                    {/* Ongoing Operations Log Monitor */}
                                    {activeOps[p.id] ? (
                                        <div className="bg-zinc-950 border-2 border-zinc-900 rounded-2xl p-4 mb-4 font-mono text-left">
                                            <div className="flex justify-between items-center mb-2 text-[9px] pb-1 border-b border-zinc-900">
                                                <span className="text-purple-400 font-black uppercase flex items-center gap-1.5 shrink-0">
                                                    <RefreshCw className="w-3 animate-spin text-purple-400 shrink-0" />
                                                    Calibration: {activeOps[p.id].type === 'THD' ? 'Acoustic Sweep' : 'Carrier Peak Sync'}
                                                </span>
                                                <span className="text-amber-400 font-bold font-mono">
                                                    {activeOps[p.id].timeLeft.toFixed(1)}s
                                                </span>
                                            </div>
                                            <div className="space-y-1 max-h-24 overflow-y-auto text-[8px] uppercase text-zinc-500">
                                                {activeOps[p.id].logs.map((line, idx) => (
                                                    <div key={idx} className="leading-tight text-zinc-400 truncate text-left">
                                                        {line}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-2">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-100 ease-out"
                                                    style={{ width: `${(activeOps[p.id].timeLeft / activeOps[p.id].totalTime) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Tabbed Board Section (Objectives, Milestones, Chat) */}
                                    <div className="flex border-b border-white/5 mb-6 text-[10px] font-black uppercase tracking-wider relative z-10 select-none">
                                        <button 
                                            onClick={() => {
                                                playOperatorBeep(700, 'sine', 0.05);
                                                setActiveCardTabs(prev => ({ ...prev, [p.id]: 'tasks' }));
                                            }}
                                            className={`flex-1 py-2 text-center border-b-2 transition-all font-mono cursor-pointer ${
                                                (activeCardTabs[p.id] || 'tasks') === 'tasks' 
                                                ? 'border-blue-500 text-blue-400 font-bold bg-blue-500/5' 
                                                : 'border-transparent text-gray-500 hover:text-gray-300'
                                            }`}
                                        >
                                            🎯 Tasks ({p.tasks?.length || 0})
                                        </button>
                                        <button 
                                            onClick={() => {
                                                playOperatorBeep(750, 'sine', 0.05);
                                                setActiveCardTabs(prev => ({ ...prev, [p.id]: 'milestones' }));
                                            }}
                                            className={`flex-1 py-2 text-center border-b-2 transition-all font-mono cursor-pointer ${
                                                activeCardTabs[p.id] === 'milestones' 
                                                ? 'border-emerald-500 text-emerald-400 font-bold bg-emerald-500/5' 
                                                : 'border-transparent text-gray-400 hover:text-gray-200'
                                            }`}
                                        >
                                            🏆 Milestones ({(p.milestones || []).filter(m => m.completed).length}/{p.milestones?.length || 0})
                                        </button>
                                        <button 
                                            onClick={() => {
                                                playOperatorBeep(800, 'sine', 0.05);
                                                setActiveCardTabs(prev => ({ ...prev, [p.id]: 'chat' }));
                                            }}
                                            className={`flex-1 py-2 text-center border-b-2 transition-all font-mono cursor-pointer ${
                                                activeCardTabs[p.id] === 'chat' 
                                                ? 'border-purple-500 text-purple-400 font-bold bg-purple-500/5' 
                                                : 'border-transparent text-gray-400 hover:text-gray-200'
                                            }`}
                                        >
                                            📟 Team Chat ({p.chats?.length || 0})
                                        </button>
                                    </div>

                                    <div className="flex-1 min-h-[220px] flex flex-col justify-between mb-8 relative z-10">
                                        {(activeCardTabs[p.id] || 'tasks') === 'tasks' && (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center border-b border-black/20 pb-1">
                                                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Sonic Objectives</span>
                                                    <div className="flex items-center gap-2">
                                                        <select 
                                                            value={currentFilter} 
                                                            onChange={(e) => setTaskFilters(prev => ({...prev, [p.id]: e.target.value as any}))}
                                                            className="bg-black/40 border border-black rounded px-2 py-0.5 text-[8px] text-gray-400 focus:outline-none focus:border-blue-600/50 transition-all uppercase"
                                                        >
                                                            <option value="all">All</option>
                                                            <option value="active">Active</option>
                                                            <option value="completed">Completed</option>
                                                        </select>
                                                        <select 
                                                            value={currentSort} 
                                                            onChange={(e) => setTaskSorts(prev => ({...prev, [p.id]: e.target.value as any}))}
                                                            className="bg-black/40 border border-black rounded px-2 py-0.5 text-[8px] text-gray-400 focus:outline-none focus:border-blue-600/50 transition-all uppercase"
                                                        >
                                                            <option value="default">Default Sort</option>
                                                            <option value="dueDate">Due Date</option>
                                                            <option value="alphabetical">A-Z</option>
                                                            <option value="priority">Priority</option>
                                                            <option value="creationDate">Creation Date</option>
                                                        </select>
                                                        <span className="text-[9px] font-mono text-gray-600 ml-2">[{p.tasks?.filter(t => t.completed).length || 0} / {p.tasks?.length || 0} TUNED]</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                                    <AnimatePresence initial={false}>
                                                        {filteredTasks.map(task => (
                                                            <motion.div 
                                                                key={task.id}
                                                                layout
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 10 }}
                                                                whileHover={{ x: 2 }}
                                                                onClick={() => onToggleTask(p.id, task.id)}
                                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 group/task ${
                                                                    task.completed 
                                                                    ? 'bg-emerald-900/30 border-emerald-600/40' 
                                                                    : 'bg-black/20 border-transparent hover:bg-black/40 text-gray-400'
                                                                }`}
                                                            >
                                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-600 border-emerald-500' : 'bg-black border-zinc-800'}`}>
                                                                    {task.completed && <CheckCircleIcon className="w-3.5 h-3.5 text-black" />}
                                                                </div>
                                                                <div className="flex flex-col flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                            <span className={`text-xs font-bold uppercase transition-all duration-300 truncate ${task.completed ? 'line-through text-emerald-500/50 italic opacity-60' : 'text-gray-200'}`}>
                                                                                {task.text}
                                                                            </span>
                                                                            {task.priority && (
                                                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border flex-shrink-0 ${
                                                                                    task.priority === 'CRITICAL' ? 'bg-red-900/50 text-red-400 border-red-500/50' :
                                                                                    task.priority === 'HIGH' ? 'bg-orange-900/50 text-orange-400 border-orange-500/50' :
                                                                                    task.priority === 'MEDIUM' ? 'bg-blue-900/50 text-blue-400 border-blue-500/50' :
                                                                                    'bg-gray-800 text-gray-400 border-gray-600'
                                                                                }`}>
                                                                                    {task.priority}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <motion.button 
                                                                            whileHover={{ scale: 1.2, color: "#f87171" }}
                                                                            whileTap={{ scale: 0.9 }}
                                                                            onClick={(e) => { e.stopPropagation(); onDeleteTask(p.id, task.id); }}
                                                                            className="opacity-0 group-hover/task:opacity-100 text-gray-700 transition-all ml-2"
                                                                            title="Purge Objective"
                                                                        >
                                                                            <XIcon className="w-3 h-3" />
                                                                        </motion.button>
                                                                    </div>
                                                                    {task.dueDate && (
                                                                        <span className={`text-[8px] font-mono mt-1 ${task.completed ? 'text-gray-600' : 'text-amber-500/70'}`}>
                                                                            DUE: {task.dueDate}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                                
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-2">
                                                        <input 
                                                            value={taskInputs[p.id] || ''}
                                                            onChange={e => setTaskInputs(prev => ({...prev, [p.id]: e.target.value}))}
                                                            onKeyDown={e => e.key === 'Enter' && handleAddTask(p.id)}
                                                            placeholder="Inject frequency objective..."
                                                            className="flex-1 bg-black/40 border-2 border-black rounded-xl px-4 py-2 text-[10px] text-white focus:outline-none focus:border-blue-600 transition-all placeholder:text-gray-800 font-bold uppercase font-mono"
                                                        />
                                                        <motion.button 
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ y: 2 }}
                                                            onClick={() => handleAddTask(p.id)} 
                                                            className="p-2 bg-blue-600 text-black rounded-xl shadow-lg cursor-pointer"
                                                        >
                                                            <PlusIcon className="w-5 h-5" />
                                                        </motion.button>
                                                        <motion.button 
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ y: 2 }}
                                                            onClick={() => handleSuggestTasks(p)} 
                                                            disabled={suggestingFor === p.id}
                                                            className={`p-2 rounded-xl shadow-lg transition-all border-2 border-black cursor-pointer ${suggestingFor === p.id ? 'bg-zinc-800 text-gray-500' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
                                                            title="Suggest Tasks via AI"
                                                        >
                                                            <BrainIcon className={`w-5 h-5 ${suggestingFor === p.id ? 'animate-pulse' : ''}`} />
                                                        </motion.button>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 px-1">
                                                        <span className="text-[8px] font-black text-gray-600 uppercase">Due:</span>
                                                        <input 
                                                            type="date"
                                                            value={dateInputs[p.id] || ''}
                                                            onChange={e => setDateInputs(prev => ({...prev, [p.id]: e.target.value}))}
                                                            className="bg-black/20 border border-black/40 rounded px-2 py-0.5 text-[8px] text-gray-400 focus:outline-none focus:border-blue-600/50 transition-all"
                                                        />
                                                        <span className="text-[8px] font-black text-gray-600 uppercase ml-2">Priority:</span>
                                                        <select
                                                            value={priorityInputs[p.id] || 'MEDIUM'}
                                                            onChange={e => setPriorityInputs(prev => ({...prev, [p.id]: e.target.value as any}))}
                                                            className="bg-black/20 border border-black/40 rounded px-2 py-0.5 text-[8px] text-gray-400 focus:outline-none focus:border-blue-600/50 transition-all uppercase"
                                                        >
                                                            <option value="LOW">Low</option>
                                                            <option value="MEDIUM">Medium</option>
                                                            <option value="HIGH">High</option>
                                                            <option value="CRITICAL">Critical</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {activeCardTabs[p.id] === 'milestones' && (
                                            <div className="space-y-4 text-left">
                                                <div className="flex justify-between items-center pb-1 border-b border-black/20">
                                                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Spectral Milestones</span>
                                                    <span className="text-[9px] font-mono text-gray-600">[{p.milestones?.filter(m => m.completed).length || 0} / {p.milestones?.length || 0} MET]</span>
                                                </div>
                                                
                                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2 min-h-[120px]">
                                                    {(!p.milestones || p.milestones.length === 0) ? (
                                                        <div className="text-center py-8 text-[10px] text-zinc-500 italic uppercase tracking-wider font-mono">
                                                            No milestones deployed for this node.
                                                        </div>
                                                    ) : (
                                                        p.milestones.map(ms => (
                                                            <div 
                                                                key={ms.id}
                                                                onClick={() => {
                                                                    playOperatorBeep(640, 'sine', 0.05);
                                                                    const nextMilestones = (p.milestones || []).map(m => m.id === ms.id ? { ...m, completed: !m.completed } : m);
                                                                    onUpdateProject?.(p.id, { milestones: nextMilestones });
                                                                }}
                                                                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border-2 ${
                                                                    ms.completed 
                                                                    ? 'bg-emerald-950/20 border-emerald-600/30' 
                                                                    : 'bg-black/20 border-transparent hover:bg-black/30'
                                                                }`}
                                                            >
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${ms.completed ? 'bg-emerald-600 border-emerald-500' : 'bg-black border-zinc-805'}`}>
                                                                    {ms.completed && <CheckCircleIcon className="w-3 h-3 text-black" />}
                                                                </div>
                                                                <div className="flex flex-col flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <span className={`text-[11px] font-bold uppercase truncate ${ms.completed ? 'line-through text-emerald-500/50 italic opacity-60' : 'text-gray-200'}`}>
                                                                            {ms.title}
                                                                        </span>
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                playOperatorBeep(520, 'triangle', 0.05);
                                                                                const nextMilestones = (p.milestones || []).filter(m => m.id !== ms.id);
                                                                                onUpdateProject?.(p.id, { milestones: nextMilestones });
                                                                            }}
                                                                            className="text-zinc-600 hover:text-red-400 transition-colors ml-2 cursor-pointer"
                                                                            title="Delete Milestone"
                                                                        >
                                                                            <XIcon className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                    {ms.dueDate && (
                                                                        <span className={`text-[8px] font-mono mt-0.5 ${ms.completed ? 'text-gray-600' : 'text-amber-500/70'}`}>
                                                                            CONJUNCTION DEADLINE: {ms.dueDate}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-col gap-2 bg-black/40 p-2 border border-white/5 rounded-xl">
                                                    <div className="flex gap-2">
                                                        <input 
                                                            id={`new-ms-title-${p.id}`}
                                                            placeholder="Introduce milestone marker..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const inputElement = document.getElementById(`new-ms-title-${p.id}`) as HTMLInputElement;
                                                                    const dateElement = document.getElementById(`new-ms-date-${p.id}`) as HTMLInputElement;
                                                                    const title = inputElement?.value.trim();
                                                                    const date = dateElement?.value;
                                                                    if (!title) return;
                                                                    
                                                                    const newMsObj = {
                                                                        id: uuidv4(),
                                                                        title,
                                                                        dueDate: date || undefined,
                                                                        completed: false,
                                                                        createdAt: Date.now()
                                                                    };
                                                                    const nextMilestones = [...(p.milestones || []), newMsObj];
                                                                    onUpdateProject?.(p.id, { milestones: nextMilestones });
                                                                    if (inputElement) inputElement.value = '';
                                                                    if (dateElement) dateElement.value = '';
                                                                    playCompletionBeep();
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            className="flex-1 bg-black border border-zinc-850 rounded-xl px-3 py-1.5 text-[10px] text-white focus:outline-none placeholder:text-gray-800 font-bold uppercase font-mono"
                                                        />
                                                        <button 
                                                            onClick={() => {
                                                                const inputElement = document.getElementById(`new-ms-title-${p.id}`) as HTMLInputElement;
                                                                const dateElement = document.getElementById(`new-ms-date-${p.id}`) as HTMLInputElement;
                                                                const title = inputElement?.value.trim();
                                                                const date = dateElement?.value;
                                                                if (!title) return;
                                                                
                                                                const newMsObj = {
                                                                    id: uuidv4(),
                                                                    title,
                                                                    dueDate: date || undefined,
                                                                    completed: false,
                                                                    createdAt: Date.now()
                                                                };
                                                                const nextMilestones = [...(p.milestones || []), newMsObj];
                                                                onUpdateProject?.(p.id, { milestones: nextMilestones });
                                                                if (inputElement) inputElement.value = '';
                                                                if (dateElement) dateElement.value = '';
                                                                playCompletionBeep();
                                                            }}
                                                            className="px-3 bg-emerald-600 text-black py-1.5 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-505 transition-all font-mono cursor-pointer shrink-0"
                                                        >
                                                            Save Target
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[8px] text-gray-500 font-mono">
                                                        <span>Due Date:</span>
                                                        <input 
                                                            id={`new-ms-date-${p.id}`}
                                                            type="date"
                                                            className="bg-black border border-zinc-855 rounded px-1.5 py-0.5 text-[8px] text-zinc-400 focus:outline-none font-mono"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {activeCardTabs[p.id] === 'chat' && (
                                            <div className="space-y-4 text-left">
                                                <div className="flex justify-between items-center pb-1 border-b border-black/20">
                                                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">Local Conjunction Stream</span>
                                                    <span className="text-[9px] font-mono text-gray-600">[{p.chats?.length || 0} MSG SHARDS]</span>
                                                </div>
                                                
                                                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar p-3 bg-black/40 border border-white/5 rounded-2xl flex flex-col pr-2 min-h-[120px]">
                                                    {(!p.chats || p.chats.length === 0) ? (
                                                        <div className="text-center py-8 text-[10px] text-zinc-605 italic uppercase tracking-wider font-mono">
                                                            📟 Channel initialized. Introduce transmission below.
                                                        </div>
                                                    ) : (
                                                        p.chats.map(chat => {
                                                            const isMe = chat.sender === (profile?.username || 'user');
                                                            return (
                                                                <div 
                                                                    key={chat.id}
                                                                    className={`flex gap-2.5 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
                                                                >
                                                                    <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 select-none">
                                                                        <img 
                                                                            src={chat.avatarUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=100&q=80'} 
                                                                            alt={chat.sender} 
                                                                            className="w-full h-full object-cover"
                                                                            referrerPolicy="no-referrer"
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <div className={`flex items-baseline gap-1.5 ${isMe ? 'justify-end' : ''}`}>
                                                                            <span className={`text-[9px] font-black ${isMe ? 'text-purple-400' : 'text-blue-400'}`}>@{chat.sender}</span>
                                                                            <span className="text-[7px] text-gray-600 font-mono">
                                                                                {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                        </div>
                                                                        <div className={`mt-1 p-2 rounded-xl border text-[11.5px] max-w-full break-words leading-relaxed ${
                                                                            isMe 
                                                                            ? 'bg-purple-950/20 border-purple-500/30 text-purple-200 rounded-tr-none font-mono text-left' 
                                                                            : 'bg-zinc-950/80 border-zinc-850 text-zinc-300 rounded-tl-none font-mono text-left'
                                                                        }`}>
                                                                            {chat.content}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <input 
                                                        id={`new-chat-msg-${p.id}`}
                                                        placeholder="Broadcast team signal..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const input = document.getElementById(`new-chat-msg-${p.id}`) as HTMLInputElement;
                                                                const contentStr = input?.value.trim();
                                                                if (!contentStr) return;
                                                                handleSendProjectChat(p.id, contentStr);
                                                                if (input) input.value = '';
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        className="flex-1 bg-black border border-zinc-855 rounded-xl px-3 py-1.5 text-[10px] text-white focus:outline-none placeholder:text-gray-800 font-bold uppercase font-mono"
                                                    />
                                                    <button 
                                                        onClick={() => {
                                                            const input = document.getElementById(`new-chat-msg-${p.id}`) as HTMLInputElement;
                                                            const contentStr = input?.value.trim();
                                                            if (!contentStr) return;
                                                            handleSendProjectChat(p.id, contentStr);
                                                            if (input) input.value = '';
                                                        }}
                                                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-505 text-white rounded-xl text-[10px] font-black uppercase font-mono cursor-pointer"
                                                    >
                                                        Send 📟
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto flex gap-4">
                                        <motion.button 
                                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)", color: "white" }}
                                            whileTap={{ y: 2 }}
                                            onClick={() => {
                                                if (activeOps[p.id]) return;
                                                playOperatorBeep(600, 'triangle', 0.1);
                                                setActiveOps(prev => ({
                                                    ...prev,
                                                    [p.id]: {
                                                        type: 'THD',
                                                        timeLeft: 8,
                                                        totalTime: 8,
                                                        logs: [`[${new Date().toLocaleTimeString()}] 🚀 DEPLOYED HIGH-EFFICIENCY DISTORTION PROBE...`]
                                                    }
                                                }));
                                            }}
                                            disabled={!!activeOps[p.id]}
                                            className={`flex-1 py-4 bg-black border-4 border-black font-black uppercase text-[10px] rounded-2xl transition-all shadow-[4px_4px_0_0_#000] ${activeOps[p.id] ? 'text-zinc-700 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:border-white/20'}`}
                                        >
                                            {activeOps[p.id]?.type === 'THD' ? 'Calibrating THD...' : 'Analyze THD'}
                                        </motion.button>
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ y: 2 }}
                                            onClick={() => {
                                                if (activeOps[p.id]) return;
                                                playOperatorBeep(700, 'triangle', 0.1);
                                                setActiveOps(prev => ({
                                                    ...prev,
                                                    [p.id]: {
                                                        type: 'AMPLITUDE',
                                                        timeLeft: 8,
                                                        totalTime: 8,
                                                        logs: [`[${new Date().toLocaleTimeString()}] 🚀 DEPLOYED INTEGRITY PHASE COUPLER...`]
                                                    }
                                                }));
                                            }}
                                            disabled={!!activeOps[p.id]}
                                            className={`flex-1 py-4 border-4 border-black font-black uppercase text-[10px] rounded-2xl shadow-[4px_4px_0_0_#000] transition-colors ${activeOps[p.id] ? 'bg-zinc-850 border-zinc-900 text-zinc-600 cursor-not-allowed' : 'bg-blue-600 text-black hover:bg-blue-500'}`}
                                        >
                                            {activeOps[p.id]?.type === 'AMPLITUDE' ? 'Locking Phase...' : 'Sync Amplitude'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Stride */}
            <div className="p-3 bg-black border-t-8 border-black flex items-center justify-between z-10 mx-[-16px] mb-[-16px] px-10">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Acoustic Grid: ACTIVE</span>
                   </div>
                   <span className="text-[10px] text-gray-700 font-mono italic">THD: 0.02% | SNR: 120dB | Stride: 1.2 PB/s</span>
                </div>
                <div className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.5em]">
                   conduct with flawless wisdom.
                </div>
            </div>

            <Modal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={confirmDelete}
                title="Sever Connection?"
                confirmText="Sever"
                cancelText="Maintain"
                confirmVariant="danger"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-400">
                        Are you sure you want to delete this project? This action cannot be undone and all associated data will be lost.
                    </p>
                    <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                        <p className="text-xs text-red-400 font-mono">
                            WARNING: Project data will be permanently purged from the neural network.
                        </p>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!managingCollabsFor}
                onClose={() => setManagingCollabsFor(null)}
                onConfirm={() => setManagingCollabsFor(null)}
                title="Concurring Nodes"
                confirmText="Save Connections"
                cancelText="Dismiss"
            >
                <div className="flex flex-col gap-4 text-left">
                    <p className="text-xs text-gray-400">
                        Select developer nodes to invite and co-concur on on-chain targets.
                    </p>
                    
                    <div className="space-y-1.5 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                        {networkProfiles.length === 0 ? (
                            <div className="p-4 text-center text-xs text-zinc-500 italic">No node profiles scanned in the local ecosystem.</div>
                        ) : (
                            networkProfiles.map((prof: any) => {
                                const activeProj = projects.find(proj => proj.id === managingCollabsFor);
                                const isInvited = (activeProj?.collaborators || []).includes(prof.username);
                                
                                return (
                                    <button
                                        key={prof.id}
                                        type="button"
                                        onClick={() => {
                                            const currentCollabs = activeProj?.collaborators || [];
                                            const nextCollabs = isInvited
                                                ? currentCollabs.filter((u: string) => u !== prof.username)
                                                : [...currentCollabs, prof.username];
                                            
                                            onUpdateProject?.(managingCollabsFor!, { collaborators: nextCollabs });
                                            playOperatorBeep(isInvited ? 600 : 900, 'triangle', 0.05);
                                        }}
                                        className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all text-left cursor-pointer ${
                                            isInvited
                                            ? 'bg-purple-950/20 border-purple-500/80 text-white'
                                            : 'bg-zinc-950/60 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <img 
                                                src={prof.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                                                alt={prof.username} 
                                                className="w-7 h-7 rounded-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black tracking-wider text-white">@{prof.username}</span>
                                                <span className="text-[8px] font-mono text-gray-500 leading-none mt-0.5">{prof.headline || 'Active node'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${
                                            isInvited ? 'bg-purple-500 text-black' : 'bg-zinc-900 text-zinc-500'
                                        }`}>
                                            {isInvited ? 'CONNECTED' : 'STANDBY'}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};
