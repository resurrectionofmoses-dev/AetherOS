
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { FINTECH_AUTHORITIES } from '../constants';
import { 
    CodeIcon, ActivityIcon, ZapIcon, ShieldIcon, FireIcon, StarIcon, PlusIcon, XIcon, TerminalIcon, UserIcon, BrainIcon, LogicIcon, CheckCircleIcon, SpinnerIcon, GaugeIcon, SearchIcon, GavelIcon
} from './icons';
import type { NetworkProject, ProjectTask, UserProfile, ProfileProject, ProfileProjectTestimonial } from '../types';
import { PortfolioProjectCard } from './PortfolioProjectCard';
import type { HireableAgent } from '../agentTypes';
import { AgentFactory } from '../services/AgentFactory';
import { safeStorage } from '../services/safeStorage';
import { extractJSON } from '../utils';
import { generateProjectKnowHow } from '../services/geminiService';
import { 
    Search as LucideSearch, Filter as LucideFilter, CheckCircle2 as LucideCheckCircle, 
    XCircle as LucideXCircle, ArrowUpRight as LucideArrowUpRight, ArrowDownLeft as LucideArrowDownLeft, 
    RefreshCw as LucideRefreshCw, Layers as LucideLayers, AlertCircle as LucideAlertCircle
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CPHManager, CPHDisplay } from '../services/cphManager';
import { toast } from 'sonner';
import { milestoneService } from '../services/milestoneService';
import { ProjectAnalyticsAndCalendar } from './ProjectAnalyticsAndCalendar';

const getSpecialtyBadge = (specialty: string) => {
    switch(specialty) {
        case 'security':
        case 'quantumguardian':
            return { color: 'text-red-500', bg: 'bg-red-950/30', border: 'border-red-900', icon: ShieldIcon };
        case 'build':
        case 'codesphere':
        case 'omegacoder':
            return { color: 'text-blue-500', bg: 'bg-blue-950/30', border: 'border-blue-900', icon: CodeIcon };
        case 'debug':
        case 'refactor':
        case 'microcheck':
        case 'nanolinter':
            return { color: 'text-amber-500', bg: 'bg-amber-950/30', border: 'border-amber-900', icon: ActivityIcon };
        case 'optimizer':
        case 'logic':
            return { color: 'text-cyan-500', bg: 'bg-cyan-950/30', border: 'border-cyan-900', icon: ZapIcon };
        case 'learn':
        case 'academy':
        case 'academic':
        case 'documenter':
            return { color: 'text-emerald-500', bg: 'bg-emerald-950/30', border: 'border-emerald-900', icon: BrainIcon };
        case 'templar':
        case 'bountytemplar':
        case 'judge':
            return { color: 'text-purple-500', bg: 'bg-purple-950/30', border: 'border-purple-900', icon: GavelIcon };
        default:
            return { color: 'text-gray-400', bg: 'bg-gray-900/50', border: 'border-gray-700', icon: UserIcon };
    }
};

const getStatusBadge = (status: string) => {
    switch(status) {
        case 'available':
            return { color: 'text-green-500', bg: 'bg-green-500', label: 'AVAILABLE' };
        case 'working':
            return { color: 'text-blue-500', bg: 'bg-blue-500', label: 'WORKING' };
        case 'resting':
            return { color: 'text-amber-500', bg: 'bg-amber-500', label: 'RESTING' };
        case 'quit':
            return { color: 'text-red-500', bg: 'bg-red-500', label: 'QUIT' };
        case 'on_notice':
            return { color: 'text-orange-500', bg: 'bg-orange-500', label: 'ON NOTICE' };
        default:
            return { color: 'text-gray-500', bg: 'bg-gray-500', label: status.toUpperCase() };
    }
};

interface CodingNetworkViewProps {
  projects: NetworkProject[];
  setProjects: React.Dispatch<React.SetStateAction<NetworkProject[]>>;
  agents: HireableAgent[];
  setAgents: React.Dispatch<React.SetStateAction<HireableAgent[]>>;
  profile?: UserProfile;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onNavigateToAgent: () => void;
  onSetDirective: (directive: any) => void;
  progress?: any;
}

export const CodingNetworkView: React.FC<CodingNetworkViewProps> = ({ projects, setProjects, agents, setAgents, profile, onUpdateProfile, progress }) => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [selectedAuthority, setSelectedAuthority] = useState(FINTECH_AUTHORITIES[0].id);
    const [viewMode, setViewMode] = useState<'SHARDS' | 'SQUAD' | 'COLLAB' | 'PROFILES' | 'MATCHES' | 'FORECAST' | 'SOVEREIGNTY' | 'WALLET'>('SHARDS');
    const [marketplace, setMarketplace] = useState<HireableAgent[]>([]);
    const [isManifesting, setIsManifesting] = useState(false);
    const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
    const [crazyLevel, setCrazyLevel] = useState(5);
    const [fightVector, setFightVector] = useState(80);

    // --- SOVEREIGN LAWS COMPLIANCE STATES ---
    const [tamperStatus, setTamperStatus] = useState<'SECURE' | 'BREACHED' | 'RESTORING'>('SECURE');
    const [finesAmount, setFinesAmount] = useState<number>(0);
    const [tamperedFiles, setTamperedFiles] = useState<string[]>([]);
    const [sovereignLogs, setSovereignLogs] = useState<string[]>([
        `[INIT] ${new Date().toLocaleTimeString()}: Sovereign Laws Engine initialized. Protocol 0x03E2 active.`,
        `[STATUS] Code security checksums matched to origin: Parity confirmed.`
    ]);
    const [reparationProgress, setReparationProgress] = useState<number>(0);

    const handleSimulateTamper = () => {
        setTamperStatus('BREACHED');
        setFinesAmount(5000);
        setTamperedFiles(['App.tsx', 'firestore.rules']);
        setSovereignLogs(prev => [
            ...prev,
            `[ALERT] ${new Date().toLocaleTimeString()}: Code integrity breach detected in /src/App.tsx (unauthorized modification of identity check)!`,
            `[ALERT] ${new Date().toLocaleTimeString()}: Security rules modified in /firestore.rules (unauthorized rule downgrade)!`,
            `[FINE] ${new Date().toLocaleTimeString()}: Sovereign fine of 5,000 CPH ($12,500 equivalent) generated and registered.`,
            `[STATUS] Awaiting absolute Sovereign Command or Jesus Christ authority verification.`
        ]);
        toast.error("WARNING: Code Tamper detected! Sovereign fine of 5,000 CPH has been registered.");
    };

    const handleEnforceSovereignGrace = () => {
        if (tamperStatus === 'RESTORING') return;
        setTamperStatus('RESTORING');
        setReparationProgress(0);
        setSovereignLogs(prev => [
            ...prev,
            `[COMMAND] ${new Date().toLocaleTimeString()}: Sovereign Command invoked on authority of Jesus Christ.`,
            `[COMMAND] ${new Date().toLocaleTimeString()}: Authenticating via Vector: JESUS...`,
            `[REPAIR] Initiating cryptographic audit sweep on core components...`
        ]);

        let pct = 0;
        const interval = setInterval(() => {
            pct += 10;
            setReparationProgress(pct);

            if (pct === 30) {
                setSovereignLogs(prev => [...prev, `[REPAIR] 30% - App.tsx checksum restored to original origin IP.`]);
            } else if (pct === 60) {
                setSovereignLogs(prev => [...prev, `[REPAIR] 60% - firestore.rules hardened. Master Gate locks reinstated.`]);
            } else if (pct === 90) {
                setSovereignLogs(prev => [...prev, `[REPAIR] 90% - Clearing fine ledger under central grace authority.`]);
            } else if (pct >= 100) {
                clearInterval(interval);
                setTamperStatus('SECURE');
                setFinesAmount(0);
                setTamperedFiles([]);
                setSovereignLogs(prev => [
                    ...prev,
                    `[SUCCESS] ${new Date().toLocaleTimeString()}: Code integrity verified. All check sectors SECURE.`,
                    `[SUCCESS] ${new Date().toLocaleTimeString()}: Sovereign fine cleared. Harmony restored.`
                ]);
                
                // Add system milestone
                milestoneService.addMilestone(
                    "Sovereign Laws Enforced",
                    "By absolute authority of Jesus Christ: System integrity sweep completed, malicious code tampering corrected, and a fine of 5,000 CPH cleared under sovereign grace.",
                    "SECURITY",
                    true
                );

                toast.success("By authority of Jesus Christ: System restored. All fines cleared under Sovereign Grace!");
            }
        }, 200);
    };

    // --- NETWORK PROFILES & SKILL MATCHING STATES ---
    const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
    const [searchProfileQuery, setSearchProfileQuery] = useState('');
    const [skillFilterMode, setSkillFilterMode] = useState<'all' | 'possess' | 'mentor'>('all');
    const [selectedProfileNode, setSelectedProfileNode] = useState<any | null>(null);
    const [offeringInput, setOfferingInput] = useState('');
    const [lookingInput, setLookingInput] = useState('');
    const [endorsementConfirmation, setEndorsementConfirmation] = useState<{ profileId: string; profileUsername: string; skillName: string; isRemoving: boolean } | null>(null);

    const radarDataForSelectedNode = useMemo(() => {
        if (!selectedProfileNode) return [];
        const skillsList = selectedProfileNode.skills || [];
        const skillScores = skillsList.map((s: string) => {
            const endorsers = selectedProfileNode.skillEndorsements?.[s] || [];
            const score = Math.min(100, 50 + endorsers.length * 15);
            return { subject: s, value: score };
        });
        
        // Take up to 7 skills
        const topSkills = [...skillScores]
            .sort((a, b) => b.value - a.value)
            .slice(0, 7);

        while (topSkills.length < 3) {
            topSkills.push({ subject: 'Lattice Core', value: 50 });
        }
        return topSkills;
    }, [selectedProfileNode, selectedProfileNode?.skillEndorsements]);

    const radarDataForOwnNode = useMemo(() => {
        if (!profile) return [];
        const skillsList = profile.skills || [];
        const skillScores = skillsList.map((s: string) => {
            const endorsers = profile.skillEndorsements?.[s] || [];
            const score = Math.min(100, 50 + endorsers.length * 15);
            return { subject: s, value: score };
        });
        
        // Take up to 7 skills
        const topSkills = [...skillScores]
            .sort((a, b) => b.value - a.value)
            .slice(0, 7);

        while (topSkills.length < 3) {
            topSkills.push({ subject: 'Lattice Core', value: 50 });
        }
        return topSkills;
    }, [profile, profile?.skillEndorsements, profile?.skills]);

    // --- PREDICTIVE TIMELINE / FORECAST STATES ---
    const [projectBoosts, setProjectBoosts] = useState<Record<string, number>>({});
    const [projectShards, setProjectShards] = useState<Record<string, number>>({});
    const [agentAssignments, setAgentAssignments] = useState<Record<string, string>>({});
    const [optimizationMode, setOptimizationMode] = useState<'MANUAL' | 'MIN_TIME' | 'BALANCED'>('MANUAL');

    const historicalMilestones = useMemo(() => {
        return milestoneService.getMilestones().reverse();
    }, [viewMode]);

    const velocityMetrics = useMemo(() => {
        if (historicalMilestones.length < 2) {
            return { avgDays: 1.5, velocityLabel: "Standard Calibration" };
        }
        let totalDiff = 0;
        for (let i = 1; i < historicalMilestones.length; i++) {
            const diffMs = historicalMilestones[i].date.getTime() - historicalMilestones[i-1].date.getTime();
            totalDiff += diffMs;
        }
        const avgMs = totalDiff / (historicalMilestones.length - 1);
        const avgDays = Math.max(0.1, avgMs / (1000 * 60 * 60 * 24));
        
        let label = "Stable Drift";
        if (avgDays < 0.5) label = "Hyper-velocity (Quantum)";
        else if (avgDays < 1.2) label = "Optimal Stride";
        else if (avgDays > 3.0) label = "Sluggish (Stasis warning)";
        
        return { avgDays, velocityLabel: label };
    }, [historicalMilestones]);

    const baseSpeedMultiplier = useMemo(() => {
        const levelMultiplier = 1 + (progress?.level || 1) * 0.12;
        const adrenalineMultiplier = 1 + ((progress?.globalAdrenaline || 50) - 50) / 150;
        return levelMultiplier * adrenalineMultiplier;
    }, [progress?.level, progress?.globalAdrenaline]);

    const calculateProjectForecast = (project: NetworkProject) => {
        const remainingTasks = project.tasks?.filter(t => !t.completed) || [];
        const remainingTasksCount = remainingTasks.length;
        if (remainingTasksCount === 0) {
            return { duration: 0, date: new Date(), remainingTasks };
        }
        
        const baseTaskTime = velocityMetrics.avgDays * 1.5; 
        const baseDurationDays = remainingTasksCount * baseTaskTime;
        
        const localBoost = projectBoosts[project.id] || 0;
        const localShard = projectShards[project.id] || 0;
        
        const localAdrenalineFactor = 1 + (localBoost / 100) * 0.7;
        const shardBoostFactor = 1 + (localShard / 500) * 1.2;
        
        const assignedAgentsCount = Object.values(agentAssignments).filter(pId => pId === project.id).length;
        const agentFactor = 1 + (assignedAgentsCount * 0.35);
        
        const totalMultiplier = baseSpeedMultiplier * localAdrenalineFactor * shardBoostFactor * agentFactor;
        const durationDays = Math.max(0.2, baseDurationDays / totalMultiplier);
        
        const completionDate = new Date();
        completionDate.setTime(Date.now() + durationDays * 24 * 60 * 60 * 1000);
        
        return { duration: durationDays, date: completionDate, remainingTasks };
    };

    const handleShardChange = (projectId: string, value: number) => {
        const currentAllocated = Object.entries(projectShards)
            .filter(([pId]) => pId !== projectId)
            .reduce((sum, [_, val]) => sum + val, 0);
        
        const maxAllowed = (progress?.shards || 0) - currentAllocated;
        const targetValue = Math.min(value, Math.max(0, maxAllowed));
        
        setProjectShards(prev => ({
            ...prev,
            [projectId]: targetValue
        }));
    };

    const handleOptimize = (mode: 'MIN_TIME' | 'BALANCED') => {
        const availableShards = progress?.shards || 0;
        if (availableShards <= 0 && mode === 'MIN_TIME') {
            toast.error("No active Conjunction Shards available for allocation.");
            return;
        }
        
        const nextShards: Record<string, number> = {};
        const nextBoosts: Record<string, number> = {};
        
        if (mode === 'MIN_TIME') {
            const activeProjects = safeProjects.filter(p => (p.tasks?.filter(t => !t.completed).length || 0) > 0);
            if (activeProjects.length === 0) {
                toast.info("All projects already fully synchronized.");
                return;
            }
            
            const totalRemainingTasks = activeProjects.reduce((sum, p) => sum + (p.tasks?.filter(t => !t.completed).length || 0), 0);
            
            let shardsAllocatedSoFar = 0;
            activeProjects.forEach((p, idx) => {
                const tasksCount = p.tasks?.filter(t => !t.completed).length || 0;
                let allocated = Math.floor((tasksCount / totalRemainingTasks) * availableShards);
                if (idx === activeProjects.length - 1) {
                    allocated = availableShards - shardsAllocatedSoFar;
                }
                shardsAllocatedSoFar += allocated;
                nextShards[p.id] = allocated;
                nextBoosts[p.id] = 80;
            });
            
            setProjectShards(nextShards);
            setProjectBoosts(nextBoosts);
            toast.success("Greedy Conjunction Matrix optimized for Minimum Total Duration!");
        } else {
            const activeProjects = safeProjects.filter(p => (p.tasks?.filter(t => !t.completed).length || 0) > 0);
            if (activeProjects.length === 0) {
                toast.info("No projects requiring allocation.");
                return;
            }
            const equalShard = Math.floor(availableShards / activeProjects.length);
            activeProjects.forEach(p => {
                nextShards[p.id] = equalShard;
                nextBoosts[p.id] = 40;
            });
            setProjectShards(nextShards);
            setProjectBoosts(nextBoosts);
            toast.success("Balanced distribution model applied across all channels.");
        }
    };

    const handleCommitProjection = async () => {
        const lines = (safeProjects || [])?.map?.(p => {
            const tasksCount = p.tasks?.filter(t => !t.completed).length || 0;
            const boost = projectBoosts[p.id] || 0;
            const shardsAlloc = projectShards[p.id] || 0;
            const forecastResult = calculateProjectForecast(p);
            return `- ${p.title}: Projected ${forecastResult.duration.toFixed(1)} days remaining (${tasksCount} tasks, Boost: ${boost}%, Shards: ${shardsAlloc})`;
        }).join('\n');
        
        await milestoneService.addMilestone(
            "Predictive Timeline Synced",
            `Chronos Forecast Matrix synchronized:\n${lines}\nLevel Multiplier: ${baseSpeedMultiplier.toFixed(2)}x`,
            'WISDOM',
            true
        );
        toast.success("Predictive timeline recorded in system milestones!");
    };

    useEffect(() => {
        const loadProfiles = async () => {
            const MOCK_PROFILES_PRESEEDED = [
                {
                    id: 'mock_1',
                    username: 'CyberWeaver_X',
                    bio: 'Systems generalist bridging low-level conduction runtimes with cryptographically secure consensus architectures. Building custom WASM and Rust execution vectors.',
                    skills: ['Rust', 'Go', 'WebAssembly', 'Solidity', 'System Architecture'],
                    lookingForSkills: ['TypeScript', 'React', 'Tailwind CSS', 'Framer Motion'],
                    willingToTeachSkills: ['Rust', 'WebAssembly', 'System Architecture'],
                    experienceLevel: 'Staff Engineer',
                    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                    role: 'user',
                    portfolioLinks: [
                        { id: 'mpl_1', label: 'GitHub Node', url: 'https://github.com/cyberweaver' },
                        { id: 'mpl_2', label: 'Crates Hub', url: 'https://crates.io/users/cyberweaver' }
                    ],
                    profileProjects: [
                        { id: 'mpp_1', title: 'AetherOS WASM Sandbox', roleDefined: 'Lead Architect', status: 'past', description: 'Fault-tolerant isolated execution enclaves built within Rust/WASM frameworks.' },
                        { id: 'mpp_2', title: 'Eurodemux Layer-3 Multiplexer', roleDefined: 'Core Dev', status: 'current', description: 'Network packet conduction matrices running sub-millisecond route calculations.' }
                    ],
                    skillEndorsements: {
                        'Rust': ['Validator_Solo', 'AcousticWeaver'],
                        'Go': ['AcousticWeaver'],
                        'WebAssembly': ['DesignSage', 'Validator_Solo'],
                        'Solidity': ['Validator_Solo'],
                        'System Architecture': ['AcousticWeaver', 'DesignSage']
                    }
                },
                {
                    id: 'mock_2',
                    username: 'AcousticWeaver',
                    bio: 'Research scientist focusing on speech synthesis pipelines, deep signal analytics, and custom neural networks (PyTorch/Transformers) compiled for real-time DSP.',
                    skills: ['Python', 'PyTorch', 'Next.js', 'React', 'Audio Engineering', 'TensorFlow'],
                    lookingForSkills: ['Rust', 'WebAssembly', 'Go', 'SubtleCrypto'],
                    willingToTeachSkills: ['Python', 'PyTorch', 'Audio Engineering'],
                    experienceLevel: 'Senior NLP Architect',
                    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
                    role: 'user',
                    portfolioLinks: [
                        { id: 'mpl_3', label: 'Research Gate', url: 'https://soundweaver.net/papers' },
                        { id: 'mpl_4', label: 'GitHub sound-dsp', url: 'https://github.com/acoustic-weaver' }
                    ],
                    profileProjects: [
                        { id: 'mpp_3', title: 'SaberSpeech AI v3', roleDefined: 'AI Lead', status: 'past', description: 'Zero-latency multi-speaker vocal model replicating biofrequency arrays.' },
                        { id: 'mpp_4', title: 'Sonic Matrix Conduction', roleDefined: 'Core Designer', status: 'current', description: 'WebAudio DSP canvas modeling structural resonance frequencies.' }
                    ],
                    skillEndorsements: {
                        'Python': ['Validator_Solo', 'CyberWeaver_X'],
                        'PyTorch': ['CyberWeaver_X'],
                        'Next.js': ['DesignSage'],
                        'React': ['DesignSage'],
                        'Audio Engineering': ['CyberWeaver_X'],
                        'TensorFlow': ['Validator_Solo']
                    }
                },
                {
                    id: 'mock_3',
                    username: 'Validator_Solo',
                    bio: 'Smart contract audit specialist, defensive system designer, and cryptography lead. Securing client-authenticated vault platforms and zero-knowledge circuits.',
                    skills: ['Solidity', 'SubtleCrypto', 'React', 'AWS', 'Node.js', 'Security Audits'],
                    lookingForSkills: ['Python', 'PyTorch', 'AI & ML', 'Audio Engineering'],
                    willingToTeachSkills: ['Solidity', 'SubtleCrypto', 'Security Audits'],
                    experienceLevel: 'Principal Auditor',
                    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
                    role: 'user',
                    portfolioLinks: [
                        { id: 'mpl_5', label: 'Audit Log Desk', url: 'https://validator-solo.eth' }
                    ],
                    profileProjects: [
                        { id: 'mpp_5', title: 'Aetheric threshold Vault', roleDefined: 'Cryptographic Lead', status: 'current', description: 'ZKP threshold enclave storage for enterprise-scale seed management.' }
                    ],
                    skillEndorsements: {
                        'Solidity': ['CyberWeaver_X', 'AcousticWeaver'],
                        'SubtleCrypto': ['CyberWeaver_X'],
                        'React': ['DesignSage'],
                        'Node.js': ['DesignSage'],
                        'Security Audits': ['CyberWeaver_X', 'AcousticWeaver']
                    }
                },
                {
                    id: 'mock_4',
                    username: 'DesignSage',
                    bio: 'Obsessed with kinetic layout structures, spatial responsive fluidity, and Swiss-modern display typography. Crafting minimalist but highly functional UI templates.',
                    skills: ['Tailwind CSS', 'React', 'Framer Motion', 'Figma', 'UI/UX', 'SVG Animation'],
                    lookingForSkills: ['Node.js', 'Go', 'PostgreSQL', 'System Architecture'],
                    willingToTeachSkills: ['Tailwind CSS', 'Framer Motion', 'UI/UX'],
                    experienceLevel: 'Creative Director',
                    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
                    role: 'user',
                    portfolioLinks: [
                        { id: 'mpl_6', label: 'Dribbble Node', url: 'https://dribbble.com/designsage' },
                        { id: 'mpl_7', label: 'Figma Community', url: 'https://figma.com/@designsage' }
                    ],
                    profileProjects: [
                        { id: 'mpp_6', title: 'Cosmic Kinetic Kit', roleDefined: 'Solo Developer', status: 'past', description: 'Hardware acceleration CSS keyframes for multi-axis responsive boards.' }
                    ],
                    skillEndorsements: {
                        'Tailwind CSS': ['Validator_Solo', 'CyberWeaver_X'],
                        'React': ['AcousticWeaver', 'CyberWeaver_X'],
                        'Framer Motion': ['CyberWeaver_X'],
                        'Figma': ['Validator_Solo'],
                        'UI/UX': ['AcousticWeaver', 'Validator_Solo'],
                        'SVG Animation': ['CyberWeaver_X']
                    }
                }
            ];

            try {
                const stored = await safeStorage.getItem('aetheros_network_profiles');
                if (stored) {
                    setNetworkProfiles(JSON.parse(stored));
                } else {
                    setNetworkProfiles(MOCK_PROFILES_PRESEEDED);
                    await safeStorage.setItem('aetheros_network_profiles', JSON.stringify(MOCK_PROFILES_PRESEEDED));
                }
            } catch (e) {
                setNetworkProfiles(MOCK_PROFILES_PRESEEDED);
            }
        };
        loadProfiles();
    }, []);

    const calculateCompatibility = (dev1: any, dev2: any) => {
        if (!dev1 || !dev2) return { score: 0, reasons: [], offers: [], seeks: [], shared: [], weightedEndorsementScore: 0 };
        
        const dev1Skills = dev1.skills || [];
        const dev1Looking = dev1.lookingForSkills || [];
        
        const dev2Skills = dev2.skills || [];
        const dev2Looking = dev2.lookingForSkills || [];
        
        const dev1OffersToDev2 = dev1Skills.filter((s: string) => 
            dev2Looking.some((l: string) => l.toLowerCase() === s.toLowerCase())
        );
        
        const dev2OffersToDev1 = dev2Skills.filter((s: string) => 
            dev1Looking.some((l: string) => l.toLowerCase() === s.toLowerCase())
        );

        const sharedSkills = dev1Skills.filter((s: string) => 
            dev2Skills.some((s2: string) => s2.toLowerCase() === s.toLowerCase())
        );

        let score = 0;
        let reasons: string[] = [];

        if (dev1OffersToDev2.length > 0) {
            score += dev1OffersToDev2.length * 25;
            reasons.push(`You have skills they seek: ${dev1OffersToDev2.join(', ')}`);
        }
        if (dev2OffersToDev1.length > 0) {
            score += dev2OffersToDev1.length * 35;
            reasons.push(`They have skills you seek: ${dev2OffersToDev1.join(', ')}`);
        }
        if (sharedSkills.length > 0) {
            score += sharedSkills.length * 15;
            reasons.push(`Shared technical interests: ${sharedSkills.join(', ')}`);
        }

        // Peer Endorsements Factor
        let endorsementBonus = 0;
        let endorsedSkillsCount = 0;
        const dev2Endorsements = dev2.skillEndorsements || {};
        
        Object.entries(dev2Endorsements).forEach(([skill, endorsers]) => {
            const list = endorsers as string[];
            if (list && list.length > 0) {
                const isRelevant = 
                    dev2OffersToDev1.some((s: string) => s.toLowerCase() === skill.toLowerCase()) ||
                    sharedSkills.some((s: string) => s.toLowerCase() === skill.toLowerCase());
                
                if (isRelevant) {
                    endorsementBonus += list.length * 6; // +6 points per peer endorsement on matching skills
                } else {
                    endorsementBonus += list.length * 2; // +2 points per peer endorsement on other skills
                }
                endorsedSkillsCount += 1;
            }
        });

        if (endorsementBonus > 0) {
            score += endorsementBonus;
            reasons.push(`Peer Endorsement Factor: +${endorsementBonus} score bonus from ${endorsedSkillsCount} peer-verified proficiencies`);
        }

        score = Math.min(Math.max(score, 10), 100);

        if (dev1OffersToDev2.length === 0 && dev2OffersToDev1.length === 0 && sharedSkills.length === 0) {
            score = 15;
            reasons.push('Proximity match: Connected in AetherOS Net Core with high-integrity routing paths.');
        }

        return {
            score,
            reasons,
            offers: dev1OffersToDev2,
            seeks: dev2OffersToDev1,
            shared: sharedSkills,
            weightedEndorsementScore: endorsementBonus
        };
    };

    const getProjectMatchScore = (project: NetworkProject) => {
        if (!profile || !project) return { score: 0, matchedTags: [] };
        const mySkills = (profile.skills || [])?.map?.(s => s.toLowerCase());
        const matchedTags = (project.tags || []).filter(t => mySkills.includes(t.toLowerCase()));
        
        if (matchedTags.length === 0) return { score: 0, matchedTags: [] };
        
        let score = 0;
        if (matchedTags.length === 1) score = 45;
        else if (matchedTags.length === 2) score = 75;
        else score = 95;
        
        return { score, matchedTags };
    };

    const handleToggleEndorseSkill = async (profileId: string, skillName: string) => {
        const myUsername = profile?.username || 'Aetheros_Prime';
        
        const updatedProfiles = (networkProfiles || [])?.map?.(p => {
            if (p.id === profileId) {
                const endorsements = p.skillEndorsements || {};
                const currentEndorsers = endorsements[skillName] || [];
                
                let nextEndorsers: string[];
                if (currentEndorsers.includes(myUsername)) {
                    nextEndorsers = currentEndorsers.filter((u: string) => u !== myUsername);
                    toast.success(`Removed endorsement for ${skillName} on @${p.username}`);
                } else {
                    nextEndorsers = [...currentEndorsers, myUsername];
                    toast.success(`Endorsed ${skillName} on @${p.username}!`);

                    // Simulating peer endorsement reciprocity
                    setTimeout(() => {
                        if (profile && profile.skills && profile.skills.length > 0) {
                            const userSkills = profile.skills;
                            const randomSkill = userSkills[Math.floor(Math.random() * userSkills.length)];
                            const userSkillEndorsements = profile.skillEndorsements || {};
                            const voters = userSkillEndorsements[randomSkill] || [];

                            if (!voters.includes(p.username)) {
                                const nextVoters = [...voters, p.username];
                                const updatedUserEndorsements = {
                                    ...userSkillEndorsements,
                                    [randomSkill]: nextVoters
                                };

                                onUpdateProfile({
                                    ...profile,
                                    skillEndorsements: updatedUserEndorsements
                                });

                                toast.success(`@${p.username} reciprocated and endorsed your proficiency in ${randomSkill}!`, {
                                    description: "Your reputation has been enhanced in the AetherOS lattice network.",
                                    duration: 6000,
                                });
                            }
                        }
                    }, 2000);
                }
                
                const nextEndorsements = {
                    ...endorsements,
                    [skillName]: nextEndorsers
                };
                
                return {
                    ...p,
                    skillEndorsements: nextEndorsements
                };
            }
            return p;
        });
        
        setNetworkProfiles(updatedProfiles);
        
        try {
            await safeStorage.setItem('aetheros_network_profiles', JSON.stringify(updatedProfiles));
        } catch (e) {
            console.error("Failed to persist skill endorsements", e);
        }
        
        if (selectedProfileNode && selectedProfileNode.id === profileId) {
            const updatedNode = (updatedProfiles || [])?.find?.(p => p && p.id === profileId);
            if (updatedNode) {
                setSelectedProfileNode(updatedNode);
            }
        }
    };

    const handlePeerProjectAddTestimonial = async (projId: string, testimonial: ProfileProjectTestimonial) => {
        if (!selectedProfileNode) return;
        const profileId = selectedProfileNode.id;
        const updatedProfiles = (networkProfiles || [])?.map?.(p => {
            if (p && p.id === profileId) {
                const nextProjs = (p.profileProjects || [])?.map?.(proj => {
                    if (proj.id === projId) {
                        const currentTestimonials = proj.testimonials || [];
                        const updatedTestimonials = [...currentTestimonials, testimonial];
                        const currentCount = proj.ratingsCount || 0;
                        const newCount = currentCount + 1;
                        const currentAvg = proj.rating || 5;
                        const newAvg = parseFloat(((currentAvg * currentCount + testimonial.rating) / newCount).toFixed(1));
                        return { ...proj, testimonials: updatedTestimonials, rating: newAvg, ratingsCount: newCount };
                    }
                    return proj;
                });
                return { ...p, profileProjects: nextProjs };
            }
            return p;
        });

        setNetworkProfiles(updatedProfiles);
        try {
            await safeStorage.setItem('aetheros_network_profiles', JSON.stringify(updatedProfiles));
        } catch (e) {
            console.error(e);
        }

        const updatedNode = (updatedProfiles || [])?.find?.(p => p && p.id === profileId);
        if (updatedNode) {
            setSelectedProfileNode(updatedNode);
        }
        toast.success("Testimonial added successfully!");
    };

    const handlePeerEndorseProject = async (projId: string) => {
        if (!selectedProfileNode) return;
        const profileId = selectedProfileNode.id;
        const myUsername = profile?.username || 'Operator-You';

        const updatedProfiles = (networkProfiles || [])?.map?.(p => {
            if (p && p.id === profileId) {
                const nextProjs = (p.profileProjects || [])?.map?.(proj => {
                    if (proj.id === projId) {
                        const currentEndorsements = proj.endorsements || [];
                        const nextEndorsements = currentEndorsements.includes(myUsername)
                            ? currentEndorsements.filter(u => u !== myUsername)
                            : [...currentEndorsements, myUsername];
                        return { ...proj, endorsements: nextEndorsements };
                    }
                    return proj;
                });
                return { ...p, profileProjects: nextProjs };
            }
            return p;
        });

        setNetworkProfiles(updatedProfiles);
        try {
            await safeStorage.setItem('aetheros_network_profiles', JSON.stringify(updatedProfiles));
        } catch (e) {
            console.error(e);
        }

        const updatedNode = (updatedProfiles || [])?.find?.(p => p && p.id === profileId);
        if (updatedNode) {
            setSelectedProfileNode(updatedNode);
        }
        toast.success("Project endorsement updated!");
    };

    const handlePeerRateProject = async (projId: string, value: number) => {
        if (!selectedProfileNode) return;
        const profileId = selectedProfileNode.id;
        const updatedProfiles = (networkProfiles || [])?.map?.(p => {
            if (p && p.id === profileId) {
                const nextProjs = (p.profileProjects || [])?.map?.(proj => {
                    if (proj.id === projId) {
                        const currentCount = proj.ratingsCount || 0;
                        const newCount = currentCount + 1;
                        const currentAvg = proj.rating || 5;
                        const newAvg = parseFloat(((currentAvg * currentCount + value) / newCount).toFixed(1));
                        return { ...proj, rating: newAvg, ratingsCount: newCount };
                    }
                    return proj;
                });
                return { ...p, profileProjects: nextProjs };
            }
            return p;
        });

        setNetworkProfiles(updatedProfiles);
        try {
            await safeStorage.setItem('aetheros_network_profiles', JSON.stringify(updatedProfiles));
        } catch (e) {
            console.error(e);
        }

        const updatedNode = (updatedProfiles || [])?.find?.(p => p && p.id === profileId);
        if (updatedNode) {
            setSelectedProfileNode(updatedNode);
        }
        toast.success(`Rated ${value} stars!`);
    };

    // --- COLLABORATION PROJECTS FEATURE STATE ---
    interface CollabProjectTask {
        id: string;
        text: string;
        completed: boolean;
        assignee?: string;
        createdAt: number;
    }

    interface CollabMessage {
        id: string;
        sender: string;
        text: string;
        timestamp: number;
    }

    interface CollabCommit {
        id: string;
        hash: string;
        author: string;
        message: string;
        timestamp: number;
    }

    interface SharedCollabFile {
        id: string;
        name: string;
        size: string;
        type: string;
        sharedBy: string;
        timestamp: number;
        content?: string;
    }

    interface CollabProject {
        id: string;
        title: string;
        description: string;
        requiredSkills: string[];
        creatorName: string;
        teamMembers: string[];
        interestedUsers: {
            username: string;
            comment: string;
            roleRequested: string;
            status: 'pending' | 'accepted' | 'declined';
            timestamp: number;
        }[];
        timestamp: number;
        tasks?: CollabProjectTask[];
        messages?: CollabMessage[];
        gitRepo?: string;
        gitBranch?: string;
        gitCommits?: CollabCommit[];
        sharedFiles?: SharedCollabFile[];
        type?: 'collab' | 'help_request' | 'mentor_offer';
    }

    interface C4SDispute {
        id: string;
        contractTitle: string;
        contractor: string;
        client: string;
        amountCPH: number;
        reason: string;
        evidence: string;
        status: 'UNDER_ARBITRATION' | 'CHARGEBACK_APPROVED' | 'FUNDS_RELEASED' | 'DISPUTE_OPENED';
        timestamp: number;
    }

    const DEFAULT_C4S_DISPUTES: C4SDispute[] = [
        {
            id: 'C4S-0x3AF1',
            contractTitle: 'Rust WebAssembly Parity Bindings',
            contractor: 'RustMaster_01',
            client: 'MatrixMage',
            amountCPH: 350,
            reason: 'Delivered WebAssembly contract has missing parity verification functions under high concurrency loads.',
            evidence: 'Console logs show runtime exceptions in index.html line 433 during stress test: "Uncaught RuntimeError: unreachable executed".',
            status: 'UNDER_ARBITRATION',
            timestamp: Date.now() - 3600000 * 36
        },
        {
            id: 'C4S-0x4B2C',
            contractTitle: 'EVM Solidity Optimizer Integration',
            contractor: 'SolidityDev_Core',
            client: 'CyberWeaver_X',
            amountCPH: 500,
            reason: 'EVM optimizer introduced P0 severe memory crash loop under peak concurrent thread pressures.',
            evidence: 'Memory trace file evm_core_err.log uploaded showing recursive allocations on non-reentrant pathways.',
            status: 'CHARGEBACK_APPROVED',
            timestamp: Date.now() - 3600000 * 72
        },
        {
            id: 'C4S-0x8D9E',
            contractTitle: 'Security Audit & Slither Review',
            contractor: 'Web3_Auditor',
            client: 'Aetheros_Prime',
            amountCPH: 650,
            reason: 'Audit certificate failed to note major re-entrancy vulnerability in reward pool that let exploiters drain local storage.',
            evidence: 'Exploited transaction hash 0xf83cde on line 45 showing repeated recursive delegatecalls without update constraints.',
            status: 'FUNDS_RELEASED',
            timestamp: Date.now() - 3600000 * 12
        }
    ];

    const DEFAULT_COLLAB_PROJECTS: CollabProject[] = [
        {
            id: 'collab_quantum_sentinel',
            title: 'Quantum Entropy Sentinel',
            description: 'Building an active monitor to track quantum chaos and trace JS memory leak vectors across recursive engine shards.',
            requiredSkills: ['TypeScript', 'Rust', 'WebAudio', 'D3.js'],
            creatorName: 'CyberWeaver_X',
            teamMembers: ['CyberWeaver_X', 'Aetheros_Prime'],
            interestedUsers: [
                {
                    username: 'MatrixMage',
                    comment: 'Experienced with high-frequency WebSocket streams and telemetry dashboards.',
                    roleRequested: 'Frontend Engineer',
                    status: 'pending',
                    timestamp: Date.now() - 3600000 * 5
                }
            ],
            timestamp: Date.now() - 3600000 * 24,
            tasks: [
                { id: 'tq_1', text: 'Design lock-free ring buffers in WebAssembly layer', completed: true, assignee: 'CyberWeaver_X', createdAt: Date.now() - 3600000 * 10 },
                { id: 'tq_2', text: 'Assemble D3 real-time chaos entropy graph', completed: false, assignee: 'Aetheros_Prime', createdAt: Date.now() - 3600000 * 8 },
                { id: 'tq_3', text: 'Integrate WebSocket receiver inside React cockpit', completed: false, assignee: 'CyberWeaver_X', createdAt: Date.now() - 3600000 * 6 }
            ],
            messages: [
                { id: 'mq_1', sender: 'CyberWeaver_X', text: "Hey Prime! I've bootstrapped the Rust core logic. Ready for the React plumbing.", timestamp: Date.now() - 3600000 * 4 },
                { id: 'mq_2', sender: 'Aetheros_Prime', text: "Outstanding. I will begin work on the D3 topological charts this afternoon.", timestamp: Date.now() - 3600000 * 2 }
            ],
            gitRepo: 'https://github.com/aetheros-sovereign/entropy-sentinel',
            gitBranch: 'main',
            gitCommits: [
                { id: 'cq_1', hash: '7f8b9a1', author: 'CyberWeaver_X', message: 'perf: optimize heap reclamation in WebAssembly buffer', timestamp: Date.now() - 3600000 * 5 },
                { id: 'cq_2', hash: 'a3f4e2c', author: 'Aetheros_Prime', message: 'feat: draft real-time canvas topological layers', timestamp: Date.now() - 3600000 * 3 }
            ],
            sharedFiles: [
                { id: 'f_1', name: 'wasm-buffer.rs', size: '12.4 KB', type: 'rs', sharedBy: 'CyberWeaver_X', timestamp: Date.now() - 3600000 * 4, content: `// Quantum lock-free ring buffer
pub struct RingBuffer<T> {
    buffer: Vec<Option<T>>,
    head: usize,
    tail: usize,
    capacity: usize,
}

impl<T> RingBuffer<T> {
    pub fn new(capacity: usize) -> Self {
        let mut buffer = Vec::with_capacity(capacity);
        for _ in 0..capacity {
            buffer.push(None);
        }
        RingBuffer { buffer, head: 0, tail: 0, capacity }
    }
}` },
                { id: 'f_2', name: 'D3ChaosGraph.tsx', size: '8.1 KB', type: 'tsx', sharedBy: 'Aetheros_Prime', timestamp: Date.now() - 3600000 * 2, content: `import React, { useEffect } from 'react';
import * as d3 from 'd3';

export const ChaosGraph: React.FC = () => {
    useEffect(() => {
        // D3 topological layouts
        const svg = d3.select("#chaos-svg");
        // ... rendering nodes
    }, []);
    return <svg id="chaos-svg" className="w-full h-64 bg-black" />;
}` }
            ]
        },
        {
            id: 'collab_compliance_ledger',
            title: 'Decentralized Compliance Ledger',
            description: 'A tamper-proof real-time ledger securing cross-border data routing and certifying compliance posture dynamically.',
            requiredSkills: ['Solidity', 'Web3', 'Node.js', 'Cryptography'],
            creatorName: 'Validator_Solo',
            teamMembers: ['Validator_Solo'],
            interestedUsers: [],
            timestamp: Date.now() - 3600000 * 48,
            tasks: [
                { id: 'tc_1', text: 'Draft Solidity ledger compliance requirements', completed: true, assignee: 'Validator_Solo', createdAt: Date.now() - 3600000 * 12 },
                { id: 'tc_2', text: 'Implement zero-knowledge proofs for data routing certification', completed: false, assignee: 'Validator_Solo', createdAt: Date.now() - 3600000 * 9 }
            ],
            messages: [
                { id: 'mc_1', sender: 'Validator_Solo', text: "Drafted the solidity specification. Let's make sure our constraints are met on local tests.", timestamp: Date.now() - 3600000 * 5 }
            ],
            gitRepo: 'https://github.com/aetheros-sovereign/compliance-ledger',
            gitBranch: 'main',
            gitCommits: [
                { id: 'cc_1', hash: 'fb309c1', author: 'Validator_Solo', message: 'init: bootstrap Solidity smart contracts with initial tests', timestamp: Date.now() - 3600000 * 10 }
            ],
            sharedFiles: [
                { id: 'fc_1', name: 'ComplianceLedger.sol', size: '4.2 KB', type: 'sol', sharedBy: 'Validator_Solo', timestamp: Date.now() - 3600000 * 11, content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ComplianceLedger {
    address public owner;
    mapping(address => bool) public authorizedValidators;

    event ComplianceLogged(bytes32 indexed routeId, bool certified);

    constructor() {
        owner = msg.sender;
    }
}` }
            ]
        },
        {
            id: 'collab_symphonic_calm',
            title: 'Symphonic Harmony Synthesizer',
            description: 'An interactive audio workspace translating CPU stress signals and heap updates directly into beautiful ambient frequency landscapes.',
            requiredSkills: ['React', 'Web Audio API', 'DSP', 'Tailwind'],
            creatorName: 'AcousticWeaver',
            teamMembers: ['AcousticWeaver'],
            interestedUsers: [
                {
                    username: 'MidiSlinger',
                    comment: 'I can help formulate the wave oscillators and envelope filters!',
                    roleRequested: 'DSP Architect',
                    status: 'accepted',
                    timestamp: Date.now() - 3600000 * 8
                }
            ],
            timestamp: Date.now() - 3600000 * 12,
            tasks: [
                { id: 'ts_1', text: 'Formulate primary sine and triangle wave oscillators', completed: true, assignee: 'AcousticWeaver', createdAt: Date.now() - 3600000 * 5 },
                { id: 'ts_2', text: 'Map React state hooks to Web Audio synth API parameters', completed: false, assignee: 'MidiSlinger', createdAt: Date.now() - 3600000 * 4 }
            ],
            messages: [
                { id: 'ms_1', sender: 'AcousticWeaver', text: "Oscillators are sounding spectacular! Let's get the visualizers synchronized next.", timestamp: Date.now() - 3600000 * 3 }
            ],
            gitRepo: 'https://github.com/aetheros-sovereign/symphonic-calm',
            gitBranch: 'dev',
            gitCommits: [
                { id: 'cs_1', hash: '886a11e', author: 'AcousticWeaver', message: 'feat: initialize core synthesis node arrays with lowpass filter config', timestamp: Date.now() - 3600000 * 4 }
            ]
        }
    ];

    const [collabProjects, setCollabProjects] = useState<CollabProject[]>([]);
    const [collabSearch, setCollabSearch] = useState('');
    const [collabFilterTab, setCollabFilterTab] = useState<'all' | 'my_ideas' | 'my_teams' | 'applied' | 'c4s_arbitration'>('all');
    const [collabTypeFilter, setCollabTypeFilter] = useState<'all' | 'collab' | 'help_request' | 'mentor_offer'>('all');
    
    // Idea drafting states
    const [isCreatingCollab, setIsCreatingCollab] = useState(false);
    const [newCollabType, setNewCollabType] = useState<'collab' | 'help_request' | 'mentor_offer'>('collab');
    const [newCollabTitle, setNewCollabTitle] = useState('');
    const [newCollabDesc, setNewCollabDesc] = useState('');
    const [newCollabSkills, setNewCollabSkills] = useState('');

    // Interest application states
    const [applyingProjectId, setApplyingProjectId] = useState<string | null>(null);
    const [applyComment, setApplyComment] = useState('');
    const [applyRole, setApplyRole] = useState('');

    // Workspace state
    const [activeCollabWorkspaceId, setActiveCollabWorkspaceId] = useState<string | null>(null);
    const [activeCollabSubTab, setActiveCollabSubTab] = useState<'TASKS' | 'GIT' | 'COMMS' | 'FILES' | 'ANALYTICS' | 'CALENDAR'>('TASKS');
    const [newCollabTaskText, setNewCollabTaskText] = useState('');
    const [newCollabTaskAssignee, setNewCollabTaskAssignee] = useState('');
    const [newCollabMsgText, setNewCollabMsgText] = useState('');
    const [editCollabGitRepo, setEditCollabGitRepo] = useState('');
    const [editCollabGitBranch, setEditCollabGitBranch] = useState('main');
    const [newCollabCommitMsg, setNewCollabCommitMsg] = useState('');

    // Shared File states
    const [newSharedFileName, setNewSharedFileName] = useState('');
    const [newSharedFileContent, setNewSharedFileContent] = useState('');
    const [newSharedFileType, setNewSharedFileType] = useState('ts');
    const [viewingSharedFile, setViewingSharedFile] = useState<SharedCollabFile | null>(null);

    // --- AGENTIC WALLET & SOLVER SYSTEM STATES ---
    const [walletCrypto, setWalletCrypto] = useState<{ [key: string]: number }>(() => {
        const saved = localStorage.getItem('aether_wallet_crypto');
        return saved ? JSON.parse(saved) : { BTC: 0.245, ETH: 3.12, SOL: 24.8, AETHER: 1540 };
    });
    const [walletStocks, setWalletStocks] = useState<{ [key: string]: number }>(() => {
        const saved = localStorage.getItem('aether_wallet_stocks');
        return saved ? JSON.parse(saved) : { TSLA: 8, GOOG: 15, NVDA: 22, US_BONDS: 5 };
    });
    const [walletAetherUSD, setWalletAetherUSD] = useState<number>(() => {
        const saved = localStorage.getItem('aether_wallet_aetherusd');
        return saved ? Number(saved) : 5230;
    });
    const [walletTxHistory, setWalletTxHistory] = useState<any[]>(() => {
        const saved = localStorage.getItem('aether_wallet_tx_history');
        return saved ? JSON.parse(saved) : [
            { id: 'tx_init_1', type: 'BUY', asset: 'BTC', amount: 0.1, price: 62000, totalValue: 6200, timestamp: Date.now() - 86400000 * 3, status: 'COMPLETED' },
            { id: 'tx_init_2', type: 'SWAP', asset: 'SOL', amount: 15, price: 145, totalValue: 2175, timestamp: Date.now() - 86400000 * 2, status: 'COMPLETED' },
            { id: 'tx_init_3', type: 'BUY', asset: 'NVDA', amount: 10, price: 120, totalValue: 1200, timestamp: Date.now() - 86400000, status: 'COMPLETED' }
        ];
    });

    const [historyFilterType, setHistoryFilterType] = useState<'ALL' | 'BUY' | 'SELL' | 'SWAP'>('ALL');
    const [historyFilterStatus, setHistoryFilterStatus] = useState<'ALL' | 'COMPLETED' | 'FAILED'>('ALL');
    const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

    const [isScanningAssets, setIsScanningAssets] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanLogs, setScanLogs] = useState<string[]>([]);
    
    // Trade Input States
    const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
    const [tradeAssetType, setTradeAssetType] = useState<'CRYPTO' | 'STOCK'>('CRYPTO');
    const [tradeAsset, setTradeAsset] = useState<string>('BTC');
    const [tradeAmount, setTradeAmount] = useState<string>('');
    const [swapSourceAsset, setSwapSourceAsset] = useState<string>('AETHER');
    const [swapTargetAsset, setSwapTargetAsset] = useState<string>('SOL');
    const [swapAmount, setSwapAmount] = useState<string>('');

    // Agentic Solver States
    const [solverStrategy, setSolverStrategy] = useState<'ARBITRAGE' | 'YIELD' | 'REBALANCE' | 'HEDGE'>('ARBITRAGE');
    const [solverTask, setSolverTask] = useState<string>('');
    const [isSolverRunning, setIsSolverRunning] = useState(false);
    const [solverSteps, setSolverSteps] = useState<any[]>([]);
    const [solverLogs, setSolverLogs] = useState<string[]>([]);
    const [solverSolutionFound, setSolverSolutionFound] = useState<boolean>(false);
    const [optimizedTrades, setOptimizedTrades] = useState<any[]>([]);

    const filteredTxs = useMemo(() => {
        return walletTxHistory.filter(tx => {
            if (historySearchQuery) {
                const query = historySearchQuery.toLowerCase();
                const matchesAsset = tx.asset?.toLowerCase().includes(query);
                const matchesType = tx.type?.toLowerCase().includes(query);
                if (!matchesAsset && !matchesType) return false;
            }
            if (historyFilterType !== 'ALL' && tx.type !== historyFilterType) {
                return false;
            }
            if (historyFilterStatus !== 'ALL') {
                const txStatus = tx.status || 'COMPLETED';
                if (txStatus !== historyFilterStatus) return false;
            }
            return true;
        });
    }, [walletTxHistory, historySearchQuery, historyFilterType, historyFilterStatus]);

    useEffect(() => {
        localStorage.setItem('aether_wallet_crypto', JSON.stringify(walletCrypto));
    }, [walletCrypto]);

    useEffect(() => {
        localStorage.setItem('aether_wallet_stocks', JSON.stringify(walletStocks));
    }, [walletStocks]);

    useEffect(() => {
        localStorage.setItem('aether_wallet_aetherusd', walletAetherUSD.toString());
    }, [walletAetherUSD]);

    useEffect(() => {
        localStorage.setItem('aether_wallet_tx_history', JSON.stringify(walletTxHistory));
    }, [walletTxHistory]);

    const ASSET_PRICES: { [key: string]: number } = {
        BTC: 64250,
        ETH: 3410,
        SOL: 142.5,
        AETHER: 2.85,
        TSLA: 198.4,
        GOOG: 174.2,
        NVDA: 124.8,
        US_BONDS: 100
    };

    // Task list filtering states
    const [taskSearchKeyword, setTaskSearchKeyword] = useState('');
    const [taskSearchAssignee, setTaskSearchAssignee] = useState('');
    const [taskSearchStatus, setTaskSearchStatus] = useState<'all' | 'completed' | 'active'>('all');

    // User Profile edit states
    const [profilesSubMode, setProfilesSubMode] = useState<'directory' | 'my_profile'>('directory');
    const [editUsername, setEditUsername] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editExperience, setEditExperience] = useState('');
    const [editContactEmail, setEditContactEmail] = useState('');
    const [editContactDiscord, setEditContactDiscord] = useState('');
    const [editContactTelegram, setEditContactTelegram] = useState('');
    const [editContactTwitter, setEditContactTwitter] = useState('');
    const [editContactPhone, setEditContactPhone] = useState('');
    const [editContactGithub, setEditContactGithub] = useState('');
    const [editContactWebsite, setEditContactWebsite] = useState('');
    
    // Skill matrix inputs
    const [editMentorSkillInput, setEditMentorSkillInput] = useState('');
    
    // Portfolio lists states
    const [newPortfolioLabel, setNewPortfolioLabel] = useState('');
    const [newPortfolioUrl, setNewPortfolioUrl] = useState('');
    
    // Showcase projects states
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [newProjectRole, setNewProjectRole] = useState('');
    const [newProjectStatus, setNewProjectStatus] = useState<'current' | 'past'>('past');
    const [newProjectDesc, setNewProjectDesc] = useState('');

    useEffect(() => {
        if (profile) {
            setEditUsername(profile.username || '');
            setEditBio(profile.bio || '');
            setEditExperience(profile.experienceLevel || '');
            setEditContactEmail(profile.contactInfo?.email || '');
            setEditContactDiscord(profile.contactInfo?.discord || '');
            setEditContactTelegram(profile.contactInfo?.telegram || '');
            setEditContactTwitter(profile.contactInfo?.twitter || '');
            setEditContactPhone(profile.contactInfo?.phone || '');
            setEditContactGithub(profile.contactInfo?.github || '');
            setEditContactWebsite(profile.contactInfo?.website || '');
        }
    }, [profile]);

    // C4S arbitration states
    const [c4sDisputes, setC4sDisputes] = useState<C4SDispute[]>([]);
    const [isCreatingDispute, setIsCreatingDispute] = useState(false);
    const [disputeContractTitle, setDisputeContractTitle] = useState('');
    const [disputeContractor, setDisputeContractor] = useState('');
    const [disputeAmount, setDisputeAmount] = useState(100);
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeEvidence, setDisputeEvidence] = useState('');

    // --- DIRECT USER COLLABORATION INVITATION STATES ---
    const [invitationTargetProfile, setInvitationTargetProfile] = useState<any | null>(null);
    const [collabInviteSelectedProjectId, setCollabInviteSelectedProjectId] = useState<string>('new_space');
    const [collabInviteMessage, setCollabInviteMessage] = useState('');
    const [collabInviteNewTitle, setCollabInviteNewTitle] = useState('');
    const [collabInviteNewDesc, setCollabInviteNewDesc] = useState('');

    const handleSendCollabInvitation = async () => {
        if (!invitationTargetProfile) return;
        const myUsername = profile?.username || 'Aetheros_Prime';
        const targetUsername = invitationTargetProfile.username;

        if (collabInviteSelectedProjectId === 'new_space') {
            // Option B: Set up a new shared project space
            if (!collabInviteNewTitle.trim() || !collabInviteNewDesc.trim()) {
                toast.error("Please fill in the title and description for the new shared space.");
                return;
            }

            const newCollab: CollabProject = {
                id: `collab_shared_${Date.now()}`,
                title: collabInviteNewTitle.trim(),
                description: collabInviteNewDesc.trim(),
                requiredSkills: Array.from(new Set([...(profile?.skills || []), ...(invitationTargetProfile.skills || [])])),
                creatorName: myUsername,
                teamMembers: [myUsername, targetUsername],
                interestedUsers: [],
                timestamp: Date.now(),
                tasks: [
                    { id: `t_${Date.now()}_1`, text: 'Kickoff: Brainstorm architecture and requirements', completed: false, assignee: myUsername, createdAt: Date.now() },
                    { id: `t_${Date.now()}_2`, text: 'Establish modular TypeScript components', completed: false, assignee: targetUsername, createdAt: Date.now() }
                ],
                messages: [
                    { id: `m_${Date.now()}_1`, sender: 'System', text: `✨ System: @${myUsername} has established this shared project space with @${targetUsername}.`, timestamp: Date.now() },
                    { id: `m_${Date.now()}_2`, sender: myUsername, text: collabInviteMessage.trim() || `Hey @${targetUsername}, let's build this project together!`, timestamp: Date.now() + 50 }
                ],
                gitRepo: '',
                gitBranch: 'main',
                gitCommits: [],
                type: 'collab'
            };

            const updatedProjects = [newCollab, ...collabProjects];
            setCollabProjects(updatedProjects);
            await saveCollabProjects(updatedProjects);
            toast.success(`New shared project space "${collabInviteNewTitle}" established!`);
            setActiveCollabWorkspaceId(newCollab.id);
            setViewMode('COLLAB'); // Navigate directly to Collab Workspace tab!
        } else {
            // Option A: Invite to an existing project space
            const projId = collabInviteSelectedProjectId;
            const updatedProjects = collabProjects.map(proj => {
                if (proj.id === projId) {
                    // Check if already a member
                    if ((proj.teamMembers || []).includes(targetUsername)) {
                        toast.error(`@${targetUsername} is already a member of this project.`);
                        return proj;
                    }

                    const currentInterested = proj.interestedUsers || [];
                    const alreadyApplied = currentInterested.some(iu => iu.username === targetUsername);

                    let nextInterested = currentInterested;
                    if (!alreadyApplied) {
                        nextInterested = [
                            ...currentInterested,
                            {
                                username: targetUsername,
                                comment: collabInviteMessage.trim() || `Invited by @${myUsername}`,
                                roleRequested: 'Invited Collaborator',
                                status: 'accepted', // Auto accepted so they join the team directly!
                                timestamp: Date.now()
                            }
                        ];
                    }

                    const currentMembers = proj.teamMembers || [];
                    const nextMembers = currentMembers.includes(targetUsername) 
                        ? currentMembers 
                        : [...currentMembers, targetUsername];

                    const currentMsgs = proj.messages || [];
                    const nextMsgs = [
                        ...currentMsgs,
                        { id: `m_${Date.now()}`, sender: 'System', text: `✨ System: @${myUsername} invited @${targetUsername} to join the collaboration!`, timestamp: Date.now() }
                    ];

                    if (collabInviteMessage.trim()) {
                        nextMsgs.push({
                            id: `m_${Date.now()}_msg`,
                            sender: myUsername,
                            text: collabInviteMessage.trim(),
                            timestamp: Date.now() + 50
                        });
                    }

                    return {
                        ...proj,
                        interestedUsers: nextInterested,
                        teamMembers: nextMembers,
                        messages: nextMsgs
                    };
                }
                return proj;
            });

            setCollabProjects(updatedProjects);
            await saveCollabProjects(updatedProjects);
            toast.success(`Successfully invited @${targetUsername} to "${collabProjects.find(p => p.id === projId)?.title}"!`);
            setActiveCollabWorkspaceId(projId);
            setViewMode('COLLAB'); // Go to Collab Workspace!
        }

        // Clean up states
        setInvitationTargetProfile(null);
        setCollabInviteMessage('');
        setCollabInviteNewTitle('');
        setCollabInviteNewDesc('');
        setCollabInviteSelectedProjectId('new_space');
    };

    // Persistence and syncing logic
    useEffect(() => {
        const loadCollab = async () => {
            const saved = await safeStorage.getItem('AETHER_COLLAB_PROJECTS');
            if (saved) {
                const parsed = extractJSON<CollabProject[]>(saved, []);
                if (parsed.length > 0) {
                    setCollabProjects(parsed);
                } else {
                    setCollabProjects(DEFAULT_COLLAB_PROJECTS);
                    await safeStorage.setItem('AETHER_COLLAB_PROJECTS', JSON.stringify(DEFAULT_COLLAB_PROJECTS));
                }
            } else {
                setCollabProjects(DEFAULT_COLLAB_PROJECTS);
                await safeStorage.setItem('AETHER_COLLAB_PROJECTS', JSON.stringify(DEFAULT_COLLAB_PROJECTS));
            }
        };

        const loadDisputes = async () => {
            const saved = await safeStorage.getItem('AETHER_C4S_DISPUTES');
            if (saved) {
                const parsed = extractJSON<C4SDispute[]>(saved, []);
                if (parsed.length > 0) {
                    setC4sDisputes(parsed);
                    return;
                }
            }
            setC4sDisputes(DEFAULT_C4S_DISPUTES);
            await safeStorage.setItem('AETHER_C4S_DISPUTES', JSON.stringify(DEFAULT_C4S_DISPUTES));
        };

        loadCollab();
        loadDisputes();
    }, []);

    const saveCollabProjects = async (updated: CollabProject[]) => {
        setCollabProjects(updated);
        await safeStorage.setItem('AETHER_COLLAB_PROJECTS', JSON.stringify(updated));
    };

    const saveDisputes = async (updated: C4SDispute[]) => {
        setC4sDisputes(updated);
        await safeStorage.setItem('AETHER_C4S_DISPUTES', JSON.stringify(updated));
    };

    const handleInitiateDispute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!disputeContractTitle.trim() || !disputeContractor.trim() || !disputeReason.trim()) {
            toast.error("Dispute Error: All required fields must be supplied.");
            return;
        }

        const newDispute: C4SDispute = {
            id: `C4S-0x${Math.random().toString(16).substr(2, 4).toUpperCase()}`,
            contractTitle: disputeContractTitle.trim(),
            contractor: disputeContractor.trim(),
            client: profile?.username || 'Aetheros_Prime',
            amountCPH: Number(disputeAmount),
            reason: disputeReason.trim(),
            evidence: disputeEvidence.trim() || 'No additional evidence file references supplied.',
            status: 'DISPUTE_OPENED',
            timestamp: Date.now()
        };

        const updated = [newDispute, ...c4sDisputes];
        await saveDisputes(updated);

        // Reset
        setDisputeContractTitle('');
        setDisputeContractor('');
        setDisputeAmount(100);
        setDisputeReason('');
        setDisputeEvidence('');
        setIsCreatingDispute(false);
        toast.success(`C4S Dispute ${newDispute.id} opened successfully! Escrow locked.`);
    };

    const handleArbitrateDispute = async (id: string, decision: 'refund' | 'release') => {
        const updated = (c4sDisputes || [])?.map?.(disp => {
            if (disp.id === id) {
                return {
                    ...disp,
                    status: (decision === 'refund' ? 'CHARGEBACK_APPROVED' : 'FUNDS_RELEASED') as any
                };
            }
            return disp;
        });
        await saveDisputes(updated);
        toast.success(`Arbitration decision processed: ${decision === 'refund' ? 'Chargeback approved' : 'Funds released to contractor'}.`);
    };

    // Actions
    const handleForgeCollab = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentUsername = profile?.username || 'Aetheros_Prime';
        
        if (!newCollabTitle.trim() || !newCollabDesc.trim()) {
            toast.error("Forge Error: Title and Description are required.");
            return;
        }

        const parsedSkills = newCollabSkills
            .split(',')
            ?.map?.(s => s.trim())
            .filter(s => s.length > 0);

        const newCollab: CollabProject = {
            id: `COLLAB_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            title: newCollabTitle.trim(),
            description: newCollabDesc.trim(),
            requiredSkills: parsedSkills,
            creatorName: currentUsername,
            teamMembers: [currentUsername],
            interestedUsers: [],
            timestamp: Date.now(),
            tasks: [],
            messages: [],
            gitRepo: '',
            gitBranch: 'main',
            gitCommits: [],
            type: newCollabType
        };

        const updated = [newCollab, ...collabProjects];
        await saveCollabProjects(updated);
        
        setNewCollabTitle('');
        setNewCollabDesc('');
        setNewCollabSkills('');
        setNewCollabType('collab');
        setIsCreatingCollab(false);
        toast.success(`Collaboration idea "${newCollab.title}" published!`);
    };

    const handleExpressInterest = async (projectId: string) => {
        const currentUsername = profile?.username || 'Aetheros_Prime';
        
        if (!applyRole.trim()) {
            toast.error("Please specify your role of interest.");
            return;
        }

        const comment = applyComment.trim() || "Interested in joining the build effort.";
        
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                if (proj.interestedUsers.some(u => u.username === currentUsername)) {
                    return proj;
                }
                const newApplication = {
                    username: currentUsername,
                    comment: comment,
                    roleRequested: applyRole.trim(),
                    status: 'pending' as const,
                    timestamp: Date.now()
                };
                return {
                    ...proj,
                    interestedUsers: [...proj.interestedUsers, newApplication]
                };
            }
            return proj;
        });

        await saveCollabProjects(updated);
        setApplyingProjectId(null);
        setApplyComment('');
        setApplyRole('');
        toast.success("Interest expressed! Pending team leader approval.");
    };

    const handleCancelInterest = async (projectId: string) => {
        const currentUsername = profile?.username || 'Aetheros_Prime';
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                return {
                    ...proj,
                    interestedUsers: proj.interestedUsers.filter(u => u.username !== currentUsername)
                };
            }
            return proj;
        });
        await saveCollabProjects(updated);
        toast.info("Withdrew interest.");
    };

    const handleLeaveTeam = async (projectId: string) => {
        const currentUsername = profile?.username || 'Aetheros_Prime';
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                return {
                    ...proj,
                    teamMembers: proj.teamMembers.filter(m => m !== currentUsername),
                    interestedUsers: proj.interestedUsers.filter(u => u.username !== currentUsername)
                };
            }
            return proj;
        });
        await saveCollabProjects(updated);
        toast.info("Left the team.");
    };

    const handleManageRequest = async (projectId: string, applicantUsername: string, action: 'accept' | 'decline') => {
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                if (action === 'accept') {
                    const isAlreadyMember = proj.teamMembers.includes(applicantUsername);
                    const newTeamList = isAlreadyMember ? proj.teamMembers : [...proj.teamMembers, applicantUsername];
                    const newInterestedList = (proj.interestedUsers || [])?.map?.(u => 
                        u.username === applicantUsername ? { ...u, status: 'accepted' as const } : u
                    );
                    return {
                        ...proj,
                        teamMembers: newTeamList,
                        interestedUsers: newInterestedList
                    };
                } else {
                    const newInterestedList = (proj.interestedUsers || [])?.map?.(u => 
                        u.username === applicantUsername ? { ...u, status: 'declined' as const } : u
                    );
                    return {
                        ...proj,
                        interestedUsers: newInterestedList
                    };
                }
            }
            return proj;
        });

        await saveCollabProjects(updated);
        toast.success(`Application ${action === 'accept' ? 'approved! Operative added.' : 'declined'}.`);
    };

    const handleDeleteCollab = async (projectId: string) => {
        if (window.confirm("Are you sure you want to delete this project idea?")) {
            const updated = collabProjects.filter(p => p.id !== projectId);
            await saveCollabProjects(updated);
            toast.info("Project idea removed.");
        }
    };

    const handleAddCollabTask = async (projectId: string, text: string, assigneeName?: string) => {
        if (!text.trim()) return;
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                const tasksList = proj.tasks || [];
                const newTask: CollabProjectTask = {
                    id: `TASK_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    text: text.trim(),
                    completed: false,
                    assignee: assigneeName || undefined,
                    createdAt: Date.now()
                };
                return {
                    ...proj,
                    tasks: [...tasksList, newTask]
                };
            }
            return proj;
        });
        await saveCollabProjects(updated);
        toast.success("Task added successfully.");
    };

    const handleToggleCollabTask = async (projectId: string, taskId: string) => {
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                const tasksList = proj.tasks || [];
                return {
                    ...proj,
                    tasks: (tasksList || [])?.map?.(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
                };
            }
            return proj;
        });
        await saveCollabProjects(updated);
    };

    const handleDeleteCollabTask = async (projectId: string, taskId: string) => {
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                const tasksList = proj.tasks || [];
                return {
                    ...proj,
                    tasks: tasksList.filter(t => t.id !== taskId)
                };
            }
            return proj;
        });
        await saveCollabProjects(updated);
        toast.info("Task deleted.");
    };

    const handlePostCollabMessage = async (projectId: string, text: string) => {
        if (!text.trim()) return;
        const currentUsername = profile?.username || 'Aetheros_Prime';
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                const messagesList = proj.messages || [];
                const newMessage: CollabMessage = {
                    id: `MSG_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    sender: currentUsername,
                    text: text.trim(),
                    timestamp: Date.now()
                };
                return {
                    ...proj,
                    messages: [...messagesList, newMessage]
                };
            }
            return proj;
        });
        await saveCollabProjects(updated);
    };

    // Shared File Actions
    const handleShareCollabFile = async (projectId: string, fileName: string, fileContent: string, fileType: string, fileSize?: string) => {
        if (!fileName.trim()) return;
        const currentUsername = profile?.username || 'Aetheros_Prime';
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                const filesList = proj.sharedFiles || [];
                const newFile: SharedCollabFile = {
                    id: `FILE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    name: fileName.trim(),
                    size: fileSize || '1.8 KB',
                    type: fileType || fileName.split('.').pop() || 'ts',
                    sharedBy: currentUsername,
                    timestamp: Date.now(),
                    content: fileContent
                };
                return {
                    ...proj,
                    sharedFiles: [...filesList, newFile]
                };
            }
            return proj;
        });
        await saveCollabProjects(updated);
        toast.success(`Shared file "${fileName}" successfully!`);
    };

    const handleDeleteCollabFile = async (projectId: string, fileId: string) => {
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                const filesList = proj.sharedFiles || [];
                return {
                    ...proj,
                    sharedFiles: filesList.filter(f => f.id !== fileId)
                };
            }
            return proj;
        });
        await saveCollabProjects(updated);
        toast.info("Shared file removed from workspace.");
    };

    // Wallet System Handlers
    const handleScanAssets = () => {
        setIsScanningAssets(true);
        setScanProgress(0);
        setScanLogs([`[SCANNER] Initializing deep biometric ledger scan...`]);
        
        const logs = [
            `[SCANNER] Verifying decentralized key entropy... SECURE`,
            `[SCANNER] Scanning local chain states for Aether USD balances...`,
            `[SCANNER] Discovered 5,230 aetherUSD backed reserves.`,
            `[SCANNER] Querying stock ledger from Central Clearing Authority...`,
            `[SCANNER] Stocks matched: TSLA, GOOG, NVDA, US Sovereign Bonds`,
            `[SCANNER] Syncing cryptocurrency UTXO states...`,
            `[SCANNER] Crypto matched: BTC, ETH, SOL, AETHER`,
            `[SCANNER] Scan complete. 100% parity reconciled.`
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < logs.length) {
                setScanLogs(prev => [...prev, logs[index]]);
                setScanProgress(Math.round(((index + 1) / logs.length) * 100));
                index++;
            } else {
                clearInterval(interval);
                setIsScanningAssets(false);
                toast.success("Biometric asset scan completed. Balances updated.");
            }
        }, 600);
    };

    const handleRunAgenticSolver = () => {
        if (!solverTask.trim()) {
            toast.error("Please enter a high-priority intent or objective first.");
            return;
        }
        setIsSolverRunning(true);
        setSolverSolutionFound(false);
        setSolverLogs([`[SOLVER] Starting Cognitive Agent Solver for task: "${solverTask}"`]);
        
        const initialSteps = [
            { title: "Market Anomaly Scan", status: "running", details: "Scanning exchange routing endpoints for premium/discount arbitrage vectors." },
            { title: "Cognitive Route Construction", status: "pending", details: "Evaluating multi-hop transaction paths under volatile gas thresholds." },
            { title: "Risk Safeguard Verification", status: "pending", details: "Testing liquidity slippage thresholds against Sovereign Laws constraints." },
            { title: "Atomic Order Execution", status: "pending", details: "Applying optimal atomic order sequences on behalf of active portfolio." }
        ];
        setSolverSteps(initialSteps);

        // Define optimized sequence of trade suggestions based on strategy
        let proposedTrades: any[] = [];
        if (solverStrategy === 'ARBITRAGE') {
            proposedTrades = [
                { type: 'SWAP', asset: 'ETH', toAsset: 'SOL', amount: 1.5, price: 3410, targetPrice: 142.5, estProfit: 45 },
                { type: 'BUY', asset: 'AETHER', amount: 200, price: 2.85, estProfit: 12 }
            ];
        } else if (solverStrategy === 'YIELD') {
            proposedTrades = [
                { type: 'BUY', asset: 'US_BONDS', amount: 10, price: 100, estProfit: 50 },
                { type: 'SWAP', asset: 'SOL', toAsset: 'AETHER', amount: 5, price: 142.5, targetPrice: 2.85, estProfit: 25 }
            ];
        } else if (solverStrategy === 'REBALANCE') {
            proposedTrades = [
                { type: 'SELL', asset: 'TSLA', amount: 4, price: 198.4, estProfit: 0 },
                { type: 'BUY', asset: 'NVDA', amount: 6, price: 124.8, estProfit: 35 }
            ];
        } else {
            proposedTrades = [
                { type: 'BUY', asset: 'US_BONDS', amount: 15, price: 100, estProfit: 60 }
            ];
        }
        setOptimizedTrades(proposedTrades);

        // Simulation Timeline
        setTimeout(() => {
            setSolverSteps(prev => {
                const next = [...prev];
                if (next[0]) next[0].status = 'completed';
                if (next[1]) next[1].status = 'running';
                return next;
            });
            setSolverLogs(prev => [...prev, `[SOLVER] Found potential arbitrage opportunities on SOL-ETH pools.`, `[SOLVER] Computed optimal swap routing with 0.12% gas allocation.`]);
        }, 1200);

        setTimeout(() => {
            setSolverSteps(prev => {
                const next = [...prev];
                if (next[1]) next[1].status = 'completed';
                if (next[2]) next[2].status = 'running';
                return next;
            });
            setSolverLogs(prev => [...prev, `[SOLVER] Running compliance audits against Gavel rules...`, `[SOLVER] Verified: Slippage <= 0.50%, transaction bounds conform to Sovereign Laws.`]);
        }, 2400);

        setTimeout(() => {
            setSolverSteps(prev => {
                const next = [...prev];
                if (next[2]) next[2].status = 'completed';
                if (next[3]) next[3].status = 'running';
                return next;
            });
            setSolverLogs(prev => [...prev, `[SOLVER] Prepared execution sequence for ${proposedTrades.length} atomic orders. Ready for final user committal.`]);
        }, 3600);

        setTimeout(() => {
            setSolverSteps(prev => {
                const next = [...prev];
                if (next[3]) next[3].status = 'completed';
                return next;
            });
            setSolverLogs(prev => [...prev, `[SOLVER] Solution solved successfully! Click 'Commence Execution' to deploy transactions.`]);
            setSolverSolutionFound(true);
            setIsSolverRunning(false);
            toast.success("Agentic Solver formulated optimal path successfully!");
        }, 4800);
    };

    const handleExecuteSolverTrades = () => {
        if (optimizedTrades.length === 0) return;
        
        let newCrypto = { ...walletCrypto };
        let newStocks = { ...walletStocks };
        let newUSD = walletAetherUSD;
        let newTxs = [...walletTxHistory];

        optimizedTrades.forEach(trade => {
            const txId = `tx_solv_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            if (trade.type === 'BUY') {
                const cost = trade.amount * trade.price;
                if (newUSD >= cost) {
                    newUSD -= cost;
                    if (walletCrypto.hasOwnProperty(trade.asset)) {
                        newCrypto[trade.asset] += trade.amount;
                    } else if (walletStocks.hasOwnProperty(trade.asset)) {
                        newStocks[trade.asset] += trade.amount;
                    }
                    newTxs.unshift({
                        id: txId,
                        type: 'BUY',
                        asset: trade.asset,
                        amount: trade.amount,
                        price: trade.price,
                        totalValue: cost,
                        timestamp: Date.now(),
                        status: 'COMPLETED'
                    });
                } else {
                    newTxs.unshift({
                        id: txId,
                        type: 'BUY',
                        asset: trade.asset,
                        amount: trade.amount,
                        price: trade.price,
                        totalValue: cost,
                        timestamp: Date.now(),
                        status: 'FAILED',
                        reason: 'Insufficient aetherUSD liquidity'
                    });
                }
            } else if (trade.type === 'SELL') {
                const gain = trade.amount * trade.price;
                if (walletCrypto.hasOwnProperty(trade.asset) && newCrypto[trade.asset] >= trade.amount) {
                    newCrypto[trade.asset] -= trade.amount;
                    newUSD += gain;
                    newTxs.unshift({
                        id: txId,
                        type: 'SELL',
                        asset: trade.asset,
                        amount: trade.amount,
                        price: trade.price,
                        totalValue: gain,
                        timestamp: Date.now(),
                        status: 'COMPLETED'
                    });
                } else if (walletStocks.hasOwnProperty(trade.asset) && newStocks[trade.asset] >= trade.amount) {
                    newStocks[trade.asset] -= trade.amount;
                    newUSD += gain;
                    newTxs.unshift({
                        id: txId,
                        type: 'SELL',
                        asset: trade.asset,
                        amount: trade.amount,
                        price: trade.price,
                        totalValue: gain,
                        timestamp: Date.now(),
                        status: 'COMPLETED'
                    });
                } else {
                    newTxs.unshift({
                        id: txId,
                        type: 'SELL',
                        asset: trade.asset,
                        amount: trade.amount,
                        price: trade.price,
                        totalValue: gain,
                        timestamp: Date.now(),
                        status: 'FAILED',
                        reason: 'Insufficient asset holdings'
                    });
                }
            } else if (trade.type === 'SWAP') {
                const sourcePrice = ASSET_PRICES[trade.asset];
                const targetPrice = ASSET_PRICES[trade.toAsset];
                if (newCrypto[trade.asset] >= trade.amount) {
                    newCrypto[trade.asset] -= trade.amount;
                    const value = trade.amount * sourcePrice;
                    const receivedAmount = value / targetPrice;
                    newCrypto[trade.toAsset] = (newCrypto[trade.toAsset] || 0) + receivedAmount;
                    newTxs.unshift({
                        id: txId,
                        type: 'SWAP',
                        asset: `${trade.asset} ➔ ${trade.toAsset}`,
                        amount: trade.amount,
                        price: sourcePrice,
                        totalValue: value,
                        timestamp: Date.now(),
                        status: 'COMPLETED'
                    });
                } else {
                    newTxs.unshift({
                        id: txId,
                        type: 'SWAP',
                        asset: `${trade.asset} ➔ ${trade.toAsset}`,
                        amount: trade.amount,
                        price: sourcePrice,
                        totalValue: trade.amount * sourcePrice,
                        timestamp: Date.now(),
                        status: 'FAILED',
                        reason: 'Insufficient source asset holdings'
                    });
                }
            }
        });

        setWalletCrypto(newCrypto);
        setWalletStocks(newStocks);
        setWalletAetherUSD(newUSD);
        setWalletTxHistory(newTxs);
        setSolverSolutionFound(false);
        setOptimizedTrades([]);
        setSolverTask('');
        setSolverSteps([]);
        setSolverLogs(prev => [...prev, `[SOLVER SUCCESS] All atomic trades executed on chain and synchronized.`]);
        toast.success("Agent solver trade sequence executed and reconciled.");
    };

    const handleExecuteManualTrade = () => {
        const amt = parseFloat(tradeAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        const price = ASSET_PRICES[tradeAsset];
        const cost = amt * price;
        const txId = `tx_man_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        if (tradeAction === 'BUY') {
            if (walletAetherUSD < cost) {
                toast.error("Insufficient aetherUSD liquidity for transaction.");
                setWalletTxHistory(prev => [
                    {
                        id: txId,
                        type: 'BUY',
                        asset: tradeAsset,
                        amount: amt,
                        price: price,
                        totalValue: cost,
                        timestamp: Date.now(),
                        status: 'FAILED',
                        reason: 'Insufficient USD Liquidity'
                    },
                    ...prev
                ]);
                return;
            }
            setWalletAetherUSD(prev => prev - cost);
            if (tradeAssetType === 'CRYPTO') {
                setWalletCrypto(prev => ({ ...prev, [tradeAsset]: (prev[tradeAsset] || 0) + amt }));
            } else {
                setWalletStocks(prev => ({ ...prev, [tradeAsset]: (prev[tradeAsset] || 0) + amt }));
            }
        } else {
            if (tradeAssetType === 'CRYPTO') {
                if ((walletCrypto[tradeAsset] || 0) < amt) {
                    toast.error(`Insufficient ${tradeAsset} in wallet portfolio.`);
                    setWalletTxHistory(prev => [
                        {
                            id: txId,
                            type: 'SELL',
                            asset: tradeAsset,
                            amount: amt,
                            price: price,
                            totalValue: cost,
                            timestamp: Date.now(),
                            status: 'FAILED',
                            reason: `Insufficient ${tradeAsset} Holdings`
                        },
                        ...prev
                    ]);
                    return;
                }
                setWalletCrypto(prev => ({ ...prev, [tradeAsset]: prev[tradeAsset] - amt }));
            } else {
                if ((walletStocks[tradeAsset] || 0) < amt) {
                    toast.error(`Insufficient ${tradeAsset} in wallet portfolio.`);
                    setWalletTxHistory(prev => [
                        {
                            id: txId,
                            type: 'SELL',
                            asset: tradeAsset,
                            amount: amt,
                            price: price,
                            totalValue: cost,
                            timestamp: Date.now(),
                            status: 'FAILED',
                            reason: `Insufficient ${tradeAsset} Holdings`
                        },
                        ...prev
                    ]);
                    return;
                }
                setWalletStocks(prev => ({ ...prev, [tradeAsset]: prev[tradeAsset] - amt }));
            }
            setWalletAetherUSD(prev => prev + cost);
        }

        setWalletTxHistory(prev => [
            {
                id: txId,
                type: tradeAction,
                asset: tradeAsset,
                amount: amt,
                price: price,
                totalValue: cost,
                timestamp: Date.now(),
                status: 'COMPLETED'
            },
            ...prev
        ]);

        setTradeAmount('');
        toast.success(`Successfully executed manual ${tradeAction} for ${amt} ${tradeAsset}!`);
    };

    const handleUpdateCollabGit = async (projectId: string, gitRepo: string, gitBranch: string) => {
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                return {
                    ...proj,
                    gitRepo: gitRepo.trim(),
                    gitBranch: gitBranch.trim() || 'main'
                };
            }
            return proj;
        });
        await saveCollabProjects(updated);
        toast.success("Git integration updated.");
    };

    const handleCreateCollabCommit = async (projectId: string, message: string) => {
        if (!message.trim()) return;
        const currentUsername = profile?.username || 'Aetheros_Prime';
        const updated = (collabProjects || [])?.map?.(proj => {
            if (proj.id === projectId) {
                const commitsList = proj.gitCommits || [];
                const newCommit: CollabCommit = {
                    id: `COMMIT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    hash: Math.random().toString(16).substr(2, 7),
                    author: currentUsername,
                    message: message.trim(),
                    timestamp: Date.now()
                };
                return {
                    ...proj,
                    gitCommits: [newCommit, ...commitsList]
                };
            }
            return proj;
        });
        await saveCollabProjects(updated);
        toast.success("Git code block pushed successfully!");
    };

    const filteredCollabProjects = useMemo(() => {
        const currentUsername = profile?.username || 'Aetheros_Prime';
        
        if (collabFilterTab === 'c4s_arbitration') return [];

        return collabProjects.filter(proj => {
            const matchesSearch = collabSearch.trim() === '' || 
                proj.title.toLowerCase().includes(collabSearch.toLowerCase()) ||
                proj.description.toLowerCase().includes(collabSearch.toLowerCase()) ||
                proj.requiredSkills.some(skill => skill.toLowerCase().includes(collabSearch.toLowerCase()));

            if (!matchesSearch) return false;

            // Filter by Board Post Type (Collab, Help, Mentorship)
            if (collabTypeFilter !== 'all') {
                const typeToMatch = collabTypeFilter;
                const matchesType = (proj.type || 'collab') === typeToMatch;
                if (!matchesType) return false;
            }

            switch (collabFilterTab) {
                case 'my_ideas':
                    return proj.creatorName === currentUsername;
                case 'my_teams':
                    return proj.teamMembers.includes(currentUsername);
                case 'applied':
                    return proj.interestedUsers.some(u => u.username === currentUsername && u.status === 'pending');
                case 'all':
                default:
                    return true;
            }
        });
    }, [collabProjects, collabSearch, collabFilterTab, collabTypeFilter, profile]);

    // Filtering State
    const [squadSpecialtyFilter, setSquadSpecialtyFilter] = useState<string>('all');
    const [squadStatusFilter, setSquadStatusFilter] = useState<string>('all');
    const [marketSpecialtyFilter, setMarketSpecialtyFilter] = useState<string>('all');

    // Agent Editing State
    const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
    const [editedPatience, setEditedPatience] = useState<number>(0);
    const [editedConfidence, setEditedConfidence] = useState<number>(0);
    const [editedIndependence, setEditedIndependence] = useState<number>(0);
    const [editedLoyalty, setEditedLoyalty] = useState<number>(0);
    const [editedAdaptability, setEditedAdaptability] = useState<number>(0);
    const [editedWorkload, setEditedWorkload] = useState<'light' | 'moderate' | 'heavy'>('moderate');
    const [editedDomains, setEditedDomains] = useState<string[]>([]);
    const [editedQuirks, setEditedQuirks] = useState<string[]>([]);
    const [newDomainInput, setNewDomainInput] = useState('');
    const [newQuirkInput, setNewQuirkInput] = useState('');

    const startEditingAgent = (agent: HireableAgent) => {
        setEditingAgentId(agent.id);
        setEditedPatience(agent.personality?.patience ?? 50);
        setEditedConfidence(agent.personality?.confidence ?? 50);
        setEditedIndependence(agent.personality?.independence ?? 50);
        setEditedLoyalty(agent.personality?.loyalty ?? 50);
        setEditedAdaptability(agent.personality?.adaptability ?? 50);
        setEditedWorkload(agent.personality?.preferredWorkload ?? 'moderate');
        setEditedDomains(agent.personality?.preferredDomains ?? []);
        setEditedQuirks(agent.personality?.quirks ?? []);
        setNewDomainInput('');
        setNewQuirkInput('');
    };

    const saveAgentChanges = (agentId: string) => {
        setAgents(prev => (prev || [])?.map?.(a => {
            if (a.id === agentId) {
                return {
                    ...a,
                    personality: {
                        ...a.personality,
                        patience: editedPatience,
                        confidence: editedConfidence,
                        independence: editedIndependence,
                        loyalty: editedLoyalty,
                        adaptability: editedAdaptability,
                        preferredWorkload: editedWorkload,
                        preferredDomains: editedDomains,
                        quirks: editedQuirks
                    }
                };
            }
            return a;
        }));
        setEditingAgentId(null);
    };

    // --- RELIABILITY PROTOCOL: PERSISTENCE ---
    useEffect(() => {
        const loadShards = async () => {
            const savedShards = await safeStorage.getItem('AETHER_NET_SHARDS');
            if (savedShards) {
                const parsed = extractJSON<NetworkProject[]>(savedShards, []);
                if (safeProjects.length === 0 && parsed.length > 0) {
                    setProjects((parsed || [])?.map?.(p => ({...p, timestamp: new Date(p.timestamp)})));
                }
            }
        };
        loadShards();
    }, []);

    useEffect(() => {
        const persist = async () => {
            if (safeProjects.length > 0) {
                await safeStorage.setItem('AETHER_NET_SHARDS', JSON.stringify(safeProjects));
            }
        };
        persist();
    }, [projects]);



    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (title.length < 3 || isManifesting) return;

        setIsManifesting(true);

        // 1. Initial Shard Construction
        const newProject: NetworkProject = {
            id: `CRAZY_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            title,
            description: desc || "Awaiting architectural definition...",
            fightVector: fightVector,
            crazyLevel: crazyLevel,
            status: 'IDEATING',
            isWisdomHarmonized: false,
            timestamp: new Date(),
            tasks: [],
            authorityId: selectedAuthority,
            knowHow: "Siphoning Gifted Logic..."
        };

        // 2. Add to Grid immediately (Visual Feedback)
        setProjects(prev => [newProject, ...prev]);
        setTitle('');
        setDesc('');

        // 3. GIFTED PROTOCOL: Siphon Wisdom from Sovereign API
        try {
            const wisdom = await generateProjectKnowHow(newProject.title, newProject.description, 'CRAZY_KERNEL');
            
            setProjects(prev => (prev || [])?.map?.(p => 
                p.id === newProject.id 
                ? { ...p, knowHow: wisdom, isWisdomHarmonized: true, status: 'FORGING' } 
                : p
            ));
        } catch (e) {
            console.error("Wisdom siphon stalled.");
        } finally {
            setIsManifesting(false);
        }
    };

    const deleteProject = async (id: string) => {
        const updated = safeProjects.filter(p => p.id !== id);
        setProjects(updated);
        await safeStorage.setItem('AETHER_NET_SHARDS', JSON.stringify(updated));
    };


    const handleTaskInputChange = (projectId: string, value: string) => {
        setTaskInputs(prev => ({...prev, [projectId]: value}));
    };

    const handleAddTask = (projectId: string) => {
        const text = taskInputs[projectId];
        if (!text?.trim()) return;

        setProjects(prev => (prev || [])?.map?.(p => {
            if (p.id === projectId) {
                const newTask: ProjectTask = { 
                    id: uuidv4(), 
                    text: text.trim(), 
                    completed: false,
                    createdAt: Date.now()
                };
                return { ...p, tasks: [...(p.tasks || []), newTask] };
            }
            return p;
        }));
        setTaskInputs(prev => ({...prev, [projectId]: ''}));
    };

    const toggleTask = (projectId: string, taskId: string) => {
        setProjects(prev => (prev || [])?.map?.(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    tasks: (p.tasks || [])?.map?.(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
                };
            }
            return p;
        }));
    };

    const refreshMarketplace = () => {
        const newAgents = AgentFactory.generateMarketplace(6);
        setMarketplace(newAgents);
    };

    React.useEffect(() => {
        if (marketplace.length === 0) {
            refreshMarketplace();
        }
    }, []);

    const hireAgent = (agent: HireableAgent) => {
        const currentBudget = CPHManager.calculateBudget(agents);
        const { canAfford, reason } = CPHManager.canAfford(currentBudget, agent.currentSalary);
        if (!canAfford) {
            toast.error(`CPH Capacity Fracture: ${reason}. Please pause or dismiss someone first.`);
            return;
        }
        const hiredAgent = { ...agent, status: 'available' as const, hireDate: new Date() };
        setAgents(prev => [...prev, hiredAgent]);
        setMarketplace(prev => prev.filter(a => a.id !== agent.id));
        toast.success(`Hired ${agent.name} (${agent.currentSalary} CPH allocated)`);
    };

    const fireAgent = (id: string) => {
        const agentName = (agents || [])?.find?.(a => a && a.id === id)?.name || "Agent";
        setAgents(prev => prev.filter(a => a.id !== id));
        toast.info(`Dismissed ${agentName} from Coding Network`);
    };

    const toggleAgentPause = (id: string) => {
        setAgents(prev => (prev || [])?.map?.(a => {
            if (a.id === id) {
                const newStatus = a.status === 'resting' ? 'available' as const : 'resting' as const;
                toast.info(`${a.name} is now ${newStatus === 'resting' ? 'on Standby (2% idle cost)' : 'Active (100% compute allocation)'}`);
                return { ...a, status: newStatus };
            }
            return a;
        }));
    };

    const filteredAgents = useMemo(() => {
        return agents.filter(agent => {
            const specialtyMatch = squadSpecialtyFilter === 'all' || agent.specialty === squadSpecialtyFilter;
            const statusMatch = squadStatusFilter === 'all' || agent.status === squadStatusFilter;
            return specialtyMatch && statusMatch;
        });
    }, [agents, squadSpecialtyFilter, squadStatusFilter]);

    const currentBudget = useMemo(() => {
        return CPHManager.calculateBudget(agents);
    }, [agents]);

    const pricingTier = useMemo(() => {
        return CPHManager.getPricingTier();
    }, []);

    const optimizationSuggestions = useMemo(() => {
        return CPHManager.suggestOptimizations(currentBudget);
    }, [currentBudget]);

    const filteredMarketplace = useMemo(() => {
        return marketplace.filter(agent => {
            return marketSpecialtyFilter === 'all' || agent.specialty === marketSpecialtyFilter;
        });
    }, [marketplace, marketSpecialtyFilter]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 h-full flex flex-col bg-black overflow-hidden">
            {/* Header / Nav */}
            <div className="p-6 border-b-8 border-black bg-black flex justify-between items-center shadow-xl z-20">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-violet-600/10 border-4 border-violet-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.3)] transition-transform hover:scale-110">
                        <BrainIcon className="w-10 h-10 text-violet-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white tracking-tighter italic uppercase leading-none">MY CODING NETWORK</h2>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="px-4 py-1 bg-violet-600 text-black text-[10px] font-black rounded-full uppercase">Reliable Series</div>
                             <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Pleasure of Know-How</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => setViewMode('SHARDS')}
                        className={`px-6 py-2.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-4 border-black shadow-lg ${viewMode === 'SHARDS' ? 'bg-violet-600 text-white' : 'bg-[#0f0f18] text-gray-500 hover:text-white'}`}
                    >
                        Active Shards
                    </button>
                    <button 
                        onClick={() => setViewMode('SQUAD')}
                        className={`px-6 py-2.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-4 border-black shadow-lg ${viewMode === 'SQUAD' ? 'bg-amber-500 text-black' : 'bg-[#0f0f18] text-gray-500 hover:text-white'}`}
                    >
                        My Squad ({agents.length})
                    </button>
                    <button 
                        onClick={() => setViewMode('COLLAB')}
                        className={`px-6 py-2.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-4 border-black shadow-lg ${viewMode === 'COLLAB' ? 'bg-emerald-600 text-white' : 'bg-[#0f0f18] text-gray-500 hover:text-white'}`}
                    >
                        Project Collaboration
                    </button>
                    <button 
                        onClick={() => setViewMode('PROFILES')}
                        className={`px-6 py-2.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-4 border-black shadow-lg ${viewMode === 'PROFILES' ? 'bg-purple-600 text-white' : 'bg-[#0f0f18] text-gray-500 hover:text-white'}`}
                    >
                        Network Profiles
                    </button>
                    <button 
                        onClick={() => setViewMode('MATCHES')}
                        className={`px-6 py-2.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-4 border-black shadow-lg ${viewMode === 'MATCHES' ? 'bg-rose-600 text-white' : 'bg-[#0f0f18] text-gray-500 hover:text-white'}`}
                    >
                        Skill Matchmaking
                    </button>
                    <button 
                        onClick={() => setViewMode('FORECAST')}
                        className={`px-6 py-2.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-4 border-black shadow-lg ${viewMode === 'FORECAST' ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-[#0f0f18] text-gray-500 hover:text-white'}`}
                    >
                        Predictive Timeline
                    </button>
                    <button 
                        onClick={() => setViewMode('SOVEREIGNTY')}
                        className={`px-6 py-2.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-4 border-black shadow-lg ${viewMode === 'SOVEREIGNTY' ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] border-amber-500' : 'bg-[#0f0f18] text-gray-500 hover:text-white'}`}
                    >
                        ⚖️ Sovereign Laws
                    </button>
                    <button 
                        onClick={() => setViewMode('WALLET')}
                        className={`px-6 py-2.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border-4 border-black shadow-lg ${viewMode === 'WALLET' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-500 font-extrabold' : 'bg-[#0f0f18] text-gray-500 hover:text-white'}`}
                    >
                        💼 Agentic Wallet
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(124,58,237,0.05)_0%,_transparent_70%)] pointer-events-none" />

                {viewMode === 'SHARDS' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                        
                        {/* THE CRAZY INGRESS (Left Col) */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            <div className="aero-panel bg-slate-900/90 border-4 border-violet-600/40 p-8 shadow-[10px_10px_0_0_#000] hover:scale-[1.01] transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                    <FireIcon className="w-8 h-8 text-violet-500 animate-pulse" />
                                    <div>
                                        <h3 className="text-2xl font-comic-header text-white uppercase italic tracking-tight">Crazy Ingress</h3>
                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Manifest Logic Shard</p>
                                    </div>
                                </div>
                                
                                <form onSubmit={handleAddProject} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Project Identity</label>
                                        <input 
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            className="w-full bg-black border-4 border-black rounded-xl p-4 text-white font-black text-lg focus:outline-none focus:border-violet-500 transition-all placeholder:text-gray-800"
                                            placeholder="e.g. CHAOS_ENGINE_V1"
                                            disabled={isManifesting}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Fight Vector</label>
                                            <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/10">
                                                <input 
                                                    type="range" min="0" max="100" 
                                                    value={fightVector} onChange={e => setFightVector(parseInt(e.target.value))}
                                                    className="w-full accent-red-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <span className="text-[10px] text-red-500 font-black">{fightVector}%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Crazy Level</label>
                                            <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/10">
                                                <input 
                                                    type="range" min="1" max="10" 
                                                    value={crazyLevel} onChange={e => setCrazyLevel(parseInt(e.target.value))}
                                                    className="w-full accent-violet-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <span className="text-[10px] text-violet-500 font-black">{crazyLevel}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Intent & Know-How</label>
                                        <textarea 
                                            value={desc}
                                            onChange={e => setDesc(e.target.value)}
                                            rows={3}
                                            className="w-full bg-black border-4 border-black rounded-xl p-4 text-xs font-mono text-gray-300 resize-none focus:outline-none focus:border-violet-500 transition-all placeholder:text-gray-800"
                                            placeholder="Describe the crazy idea..."
                                            disabled={isManifesting}
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={title.length < 3 || isManifesting}
                                        className="vista-button w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:bg-zinc-800 text-white font-black py-5 rounded-2xl transition-all shadow-[6px_6px_0_0_#000] uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:translate-y-1"
                                    >
                                        {isManifesting ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <ZapIcon className="w-5 h-5" />}
                                        {isManifesting ? 'SIPHONING WISDOM...' : 'INJECT CRAZY IDEA'}
                                    </button>
                                </form>
                            </div>

                            <div className="p-6 bg-violet-950/20 border-4 border-violet-900/30 rounded-[2rem] text-center italic text-xs text-violet-400/80 leading-relaxed shadow-inner">
                                "The network thrives on your crazy projects. Reliability is the structure we build around the chaos."
                            </div>
                        </div>

                        {/* PROJECT LATTICE (Right Col) */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3">
                                   <ActivityIcon className="w-5 h-5 text-violet-500" /> Active Shards
                                </h3>
                                <div className="text-[10px] font-mono text-gray-600">COUNT: {safeProjects.length}</div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {safeProjects.length === 0 ? (
                                    <div className="col-span-full py-32 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-40">
                                        <CodeIcon className="w-24 h-24 mx-auto mb-6 text-gray-700" />
                                        <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-600">No Manifested Shards</p>
                                    </div>
                                ) : (safeProjects || [])?.map?.(project => (
                                    <div key={project.id} className="aero-panel bg-black/60 p-8 border-4 border-black shadow-[12px_12px_0_0_#000] flex flex-col gap-6 group hover:border-violet-600/40 transition-all relative overflow-hidden">
                                        
                                        {/* Header */}
                                        <div className="flex justify-between items-start z-10 relative">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border-2 ${
                                                        project.status === 'STABLE' ? 'bg-green-600 text-black border-green-500' : 'bg-amber-500 text-black border-amber-400 animate-pulse'
                                                    }`}>
                                                        {project.status}
                                                    </span>
                                                    {project.isWisdomHarmonized && <span className="text-[8px] font-black text-cyan-400 uppercase tracking-tighter flex items-center gap-1"><StarIcon className="w-3 h-3" /> Gifted</span>}
                                                </div>
                                                <h5 className="font-black text-white uppercase text-2xl leading-none mt-2">{project.title}</h5>
                                            </div>
                                            <button onClick={() => deleteProject(project.id)} className="text-zinc-700 hover:text-red-500 transition-colors">
                                                <XIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Knowledge Console */}
                                        <div className="bg-slate-900 border-2 border-zinc-800 rounded-xl p-4 font-mono text-[10px] text-gray-400 relative overflow-hidden group/console">
                                            <div className="absolute top-0 right-0 p-2 opacity-20"><TerminalIcon className="w-8 h-8" /></div>
                                            <p className="text-[8px] font-black text-violet-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Gifted Know-How</p>
                                            <div className="max-h-24 overflow-y-auto custom-scrollbar italic leading-relaxed">
                                                "{project.knowHow || project.description}"
                                            </div>
                                        </div>

                                        {/* Reliability Stride */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">
                                                <span>Reliability_Index</span>
                                                <span className={project.tasks?.length && project.tasks.filter(t => t.completed).length === project.tasks.length ? 'text-emerald-400' : 'text-violet-500'}>
                                                    {project.tasks?.length ? Math.round((project.tasks.filter(t => t.completed).length / project.tasks.length) * 100) : 0}%
                                                </span>
                                            </div>
                                            <div className="h-3 w-full bg-black rounded-lg overflow-hidden border border-zinc-900 p-0.5 shadow-inner">
                                                <div 
                                                    className={`h-full rounded-md transition-all duration-1000 ${
                                                        project.tasks?.length && project.tasks.filter(t => t.completed).length === project.tasks.length 
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                                                        : 'bg-gradient-to-r from-violet-700 to-blue-500'
                                                    }`}
                                                    style={{ width: `${project.tasks?.length ? (project.tasks.filter(t => t.completed).length / project.tasks.length) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Original Metrics */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                                <span className="text-[7px] font-black text-red-500 uppercase block mb-1">Fight Vector</span>
                                                <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-600" style={{ width: `${project.fightVector}%` }} />
                                                </div>
                                            </div>
                                            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                                <span className="text-[7px] font-black text-violet-500 uppercase block mb-1">Crazy Level</span>
                                                <div className="flex gap-0.5">
                                                    {[...Array(10)].map((_, i) => (
                                                        <div key={i} className={`flex-1 h-1.5 rounded-sm ${i < project.crazyLevel ? 'bg-violet-500' : 'bg-gray-900'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Battle Plan (Tasks) */}
                                        <div className="border-t-2 border-white/5 pt-4 flex-1 flex flex-col min-h-[150px]">
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <ShieldIcon className="w-3 h-3" /> Battle Plan
                                            </p>
                                            
                                            <div className="flex-1 space-y-2 mb-3 overflow-y-auto custom-scrollbar pr-1">
                                                {(project.tasks || [])?.map?.(task => (
                                                    <div 
                                                        key={task.id}
                                                        onClick={() => toggleTask(project.id, task.id)}
                                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                                                            task.completed 
                                                            ? 'bg-green-950/20 border-green-600/30' 
                                                            : 'bg-white/5 border-transparent hover:border-violet-500/30'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-600 border-green-600' : 'bg-black border-zinc-700'}`}>
                                                                {task.completed && <CheckCircleIcon className="w-3 h-3 text-black" />}
                                                            </div>
                                                            <span className={`text-[10px] font-bold uppercase ${task.completed ? 'text-green-500/50 line-through opacity-60 italic' : 'text-gray-300'}`}>{task.text}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!project.tasks || project.tasks.length === 0) && (
                                                    <p className="text-[9px] text-gray-700 italic text-center py-4">No objectives defined.</p>
                                                )}
                                            </div>

                                            <div className="flex gap-2 mt-auto">
                                                <input 
                                                    value={taskInputs[project.id] || ''}
                                                    onChange={e => handleTaskInputChange(project.id, e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddTask(project.id)}
                                                    placeholder="Add reliable objective..."
                                                    className="flex-1 bg-black border-2 border-zinc-800 rounded-lg px-3 py-2 text-[10px] text-white focus:border-violet-600 outline-none transition-all placeholder:text-gray-700 font-bold uppercase"
                                                />
                                                <button 
                                                    onClick={() => handleAddTask(project.id)}
                                                    className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors shadow-lg active:scale-95"
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : viewMode === 'SQUAD' ? (
                    /* SQUAD VIEW (WORKFORCE) */
                    <div className="space-y-12 max-w-7xl mx-auto">
                        
                        {/* CPH COMPUTE CAPACITY & TIME-BASED BUDGET CONTROLS CODESPACE */}
                        <div className="aero-panel bg-black border-4 border-violet-900/50 p-6 rounded-[2rem] relative overflow-hidden shadow-[8px_8px_0_0_rgba(124,58,237,0.2)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,_rgba(124,58,237,0.15)_0%,_transparent_70%)] pointer-events-none" />
                            
                            <div className="flex flex-col lg:flex-row justify-between gap-6 pb-6 border-b border-zinc-800">
                                <div>
                                    <h4 className="font-mono text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Compute Capacity Ledger</h4>
                                    <h3 className="font-comic-header text-4xl text-white uppercase italic">CPH Resource Engine</h3>
                                    <p className="text-[11px] text-zinc-400 mt-2 max-w-xl">
                                        Instead of abstract credits, CPH represents real compute capacity of your squad. Pause idle agents to stand them down to a 20% CPH baseline, or fire them to reclaim capacity.
                                    </p>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 items-start lg:items-center">
                                    <div className="bg-zinc-900/80 border-2 border-zinc-800 rounded-2xl px-5 py-3 font-mono">
                                        <div className="text-[9px] text-zinc-500 uppercase">Interactive Clock & Pricing Tier</div>
                                        <div className="text-sm font-bold text-violet-400 flex items-center gap-2 mt-1">
                                            <ZapIcon className="w-4 h-4 text-amber-500 animate-pulse" />
                                            <span>{pricingTier.label}</span>
                                        </div>
                                        <div className="text-[9px] text-zinc-400 mt-0.5">Time Period: {pricingTier.range} (Current Time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                                {/* Utilization Circular/Bar Progress */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="flex justify-between items-center text-xs font-mono font-bold">
                                        <span className="text-zinc-400 uppercase">Compute Utilization Rate</span>
                                        <span className={CPHDisplay.getUtilizationColor(currentBudget.utilizationRate)}>
                                            {currentBudget.utilizationRate}% ({CPHDisplay.getUtilizationLabel(currentBudget.utilizationRate)})
                                        </span>
                                    </div>
                                    
                                    <div className="h-4 bg-zinc-950 rounded-full overflow-hidden border-2 border-zinc-800 relative">
                                        {/* Warning threshold marker bar */}
                                        <div className="absolute top-0 bottom-0 left-[80%] border-l-2 border-red-500/50 z-10" title="80% Warning Threshold" />
                                        <div 
                                            className={`h-full transition-all duration-500 ${
                                                currentBudget.utilizationRate >= 90 ? 'bg-red-600' :
                                                currentBudget.utilizationRate >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${Math.min(100, currentBudget.utilizationRate)}%` }}
                                        />
                                    </div>
                                    
                                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                                        <span>Allocated / Standby Usage: {currentBudget.actualUsageCPH} CPH</span>
                                        <span>Total Capacity: {currentBudget.totalCPH} CPH</span>
                                    </div>
                                    
                                    {currentBudget.isOverCapacity && (
                                        <div className="bg-red-950/20 border border-red-900 p-3 rounded-xl flex items-center gap-3">
                                            <FireIcon className="w-5 h-5 text-red-500 animate-bounce" />
                                            <p className="text-[10px] text-red-400 uppercase font-black">
                                                Burst Capacity Activated! Operating above 1000 CPH limit incurs a 2x burst multiplier billing penalty.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Compute stats */}
                                <div className="bg-zinc-900/40 p-4 border border-zinc-800/80 rounded-2xl flex flex-col justify-between font-mono">
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase mb-2">Capacity Allocation ledger</div>
                                        <ul className="space-y-1.5 text-[10px] text-zinc-300">
                                            <li className="flex justify-between">
                                                <span>• Maximum Budget:</span>
                                                <span className="text-white font-bold">{currentBudget.totalCPH} CPH</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>• Squad Allocations:</span>
                                                <span className="text-amber-450">{currentBudget.allocatedCPH} CPH</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>• Standby Standdown:</span>
                                                <span className="text-sky-450">
                                                    {agents.reduce((sum, a) => sum + (a.status === 'resting' ? Math.round(a.currentSalary * 0.2) : 0), 0)} CPH
                                                </span>
                                            </li>
                                            <li className="flex justify-between border-t border-zinc-800 pt-1.5 mt-1 text-emerald-400">
                                                <span>• Available for Hires:</span>
                                                <span className="font-bold">{currentBudget.availableCPH} CPH</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                
                                {/* Optimization Suggestions list */}
                                <div className="bg-zinc-900/40 p-4 border border-zinc-800/80 rounded-2xl flex flex-col justify-between font-mono">
                                    <div>
                                        <div className="text-[9px] text-violet-400 uppercase mb-2">Resource Recommendations</div>
                                        <ul className="space-y-1.5 text-[9px] text-zinc-400">
                                            {(optimizationSuggestions || [])?.map?.((suggestion, idx) => (
                                                <li key={idx} className="flex gap-1">
                                                    <span>⚡</span>
                                                    <span>{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-amber-500/50 pb-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <UserIcon className="w-8 h-8 text-amber-500" />
                                    <h3 className="font-comic-header text-3xl text-white uppercase italic">My Squad</h3>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-800 px-2 py-0.5 rounded-full">{filteredAgents.length} / {agents.length} OPERATIVES</span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                                        <SearchIcon className="w-3 h-3 text-gray-500" />
                                        <select 
                                            value={squadSpecialtyFilter}
                                            onChange={e => setSquadSpecialtyFilter(e.target.value)}
                                            className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer"
                                        >
                                            <option value="all">ANY SPECIALTY</option>
                                            <option value="debug">DEBUG</option>
                                            <option value="build">BUILD</option>
                                            <option value="security">SECURITY</option>
                                            <option value="refactor">REFACTOR</option>
                                            <option value="optimizer">OPTIMIZER</option>
                                            <option value="logic">LOGIC</option>
                                            <option value="learn">LEARN</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                                        <ActivityIcon className="w-3 h-3 text-gray-500" />
                                        <select 
                                            value={squadStatusFilter}
                                            onChange={e => setSquadStatusFilter(e.target.value)}
                                            className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer"
                                        >
                                            <option value="all">ANY STATUS</option>
                                            <option value="available">AVAILABLE</option>
                                            <option value="working">WORKING</option>
                                            <option value="resting">RESTING</option>
                                            <option value="quit">QUIT</option>
                                            <option value="on_notice">ON NOTICE</option>
                                        </select>
                                    </div>
                                    
                                    {(squadSpecialtyFilter !== 'all' || squadStatusFilter !== 'all') && (
                                        <button 
                                            onClick={() => { setSquadSpecialtyFilter('all'); setSquadStatusFilter('all'); }}
                                            className="text-[9px] font-black text-amber-500 hover:text-white uppercase tracking-tighter"
                                        >
                                            CLEAR FILTERS
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {agents.length === 0 ? (
                                <div className="p-20 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-50">
                                    <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xl">No Agents Hired.</p>
                                    <p className="text-xs text-gray-600 mt-2">Check the Marketplace below.</p>
                                </div>
                            ) : filteredAgents.length === 0 ? (
                                <div className="p-20 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-50">
                                    <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xl">No agents match filters.</p>
                                    <button 
                                        onClick={() => { setSquadSpecialtyFilter('all'); setSquadStatusFilter('all'); }}
                                        className="text-xs text-amber-500 mt-2 font-black uppercase underline"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {(filteredAgents || [])?.map?.(agent => {
                                        const specBadge = getSpecialtyBadge(agent.specialty);
                                        const statBadge = getStatusBadge(agent.status);
                                        const SpecIcon = specBadge.icon;
                                        return (
                                        <div key={agent.id} className={`aero-panel ${specBadge.bg} border-4 ${specBadge.border} p-6 rounded-[2rem] relative overflow-hidden group hover:border-white/20 transition-all shadow-[8px_8px_0_0_#000]`}>
                                            {editingAgentId === agent.id ? (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                                                        <h4 className="font-black text-amber-400 text-xs uppercase tracking-wider">Configure Personality</h4>
                                                        <button 
                                                            onClick={() => setEditingAgentId(null)}
                                                            className="text-[9px] font-black text-gray-500 hover:text-white uppercase"
                                                        >
                                                            Cancel
                                                        </button>
                                                     </div>

                                                     {/* Personality Sliders */}
                                                     <div className="space-y-2">
                                                         <div>
                                                             <div className="flex justify-between text-[9px] font-black uppercase text-gray-405">
                                                                 <span>Patience</span>
                                                                 <span className="text-amber-400">{editedPatience}%</span>
                                                             </div>
                                                             <input 
                                                                 type="range" min="0" max="100" 
                                                                 value={editedPatience} 
                                                                 onChange={e => setEditedPatience(parseInt(e.target.value))} 
                                                                 className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                                                             />
                                                         </div>

                                                         <div>
                                                             <div className="flex justify-between text-[9px] font-black uppercase text-gray-405">
                                                                 <span>Confidence</span>
                                                                 <span className="text-amber-400">{editedConfidence}%</span>
                                                             </div>
                                                             <input 
                                                                 type="range" min="0" max="100" 
                                                                 value={editedConfidence} 
                                                                 onChange={e => setEditedConfidence(parseInt(e.target.value))} 
                                                                 className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                                                             />
                                                         </div>

                                                         <div>
                                                             <div className="flex justify-between text-[9px] font-black uppercase text-gray-405">
                                                                 <span>Independence</span>
                                                                 <span className="text-amber-400">{editedIndependence}%</span>
                                                             </div>
                                                             <input 
                                                                 type="range" min="0" max="100" 
                                                                 value={editedIndependence} 
                                                                 onChange={e => setEditedIndependence(parseInt(e.target.value))} 
                                                                 className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                                                             />
                                                         </div>

                                                         <div>
                                                             <div className="flex justify-between text-[9px] font-black uppercase text-gray-405">
                                                                 <span>Loyalty</span>
                                                                 <span className="text-amber-400">{editedLoyalty}%</span>
                                                             </div>
                                                             <input 
                                                                 type="range" min="0" max="100" 
                                                                 value={editedLoyalty} 
                                                                 onChange={e => setEditedLoyalty(parseInt(e.target.value))} 
                                                                 className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                                                             />
                                                         </div>

                                                         <div>
                                                             <div className="flex justify-between text-[9px] font-black uppercase text-gray-450">
                                                                 <span>Adaptability</span>
                                                                 <span className="text-amber-400">{editedAdaptability}%</span>
                                                             </div>
                                                             <input 
                                                                 type="range" min="0" max="100" 
                                                                 value={editedAdaptability} 
                                                                 onChange={e => setEditedAdaptability(parseInt(e.target.value))} 
                                                                 className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                                                             />
                                                         </div>
                                                     </div>

                                                     {/* Workload */}
                                                     <div className="space-y-1">
                                                         <span className="text-[9px] font-black uppercase text-gray-405 block">Preferred Workload</span>
                                                         <div className="grid grid-cols-3 gap-2">
                                                             {(['light', 'moderate', 'heavy'] as const).map(mode => (
                                                                 <button
                                                                     key={mode}
                                                                     type="button"
                                                                     onClick={() => setEditedWorkload(mode)}
                                                                     className={`text-[8.5px] font-black uppercase py-1 border-2 rounded-lg transition-all ${
                                                                         editedWorkload === mode 
                                                                             ? 'border-amber-450 bg-amber-400 text-black font-black' 
                                                                             : 'border-zinc-800 bg-black text-gray-400 hover:border-gray-500'
                                                                     }`}
                                                                 >
                                                                     {mode}
                                                                 </button>
                                                             ))}
                                                         </div>
                                                     </div>

                                                     {/* Preferred Domains */}
                                                     <div className="space-y-1.5">
                                                         <span className="text-[9px] font-black uppercase text-gray-455 block">Preferred Domains</span>
                                                         <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto bg-black/40 p-1.5 rounded-lg border border-white/5">
                                                             {editedDomains.length === 0 && <span className="text-[8px] text-gray-600 font-bold uppercase py-0.5">None specified</span>}
                                                             {(editedDomains || [])?.map?.((dom, idx) => (
                                                                 <span key={idx} className="inline-flex items-center gap-1 text-[8px] font-black text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                                                                     {dom}
                                                                     <button 
                                                                         type="button" 
                                                                         onClick={() => setEditedDomains(prev => prev.filter((_, i) => i !== idx))}
                                                                         className="text-red-400 hover:text-red-200"
                                                                     >
                                                                         ×
                                                                     </button>
                                                                 </span>
                                                             ))}
                                                         </div>
                                                         <div className="flex gap-2">
                                                             <input 
                                                                 type="text" 
                                                                 value={newDomainInput} 
                                                                 onChange={e => setNewDomainInput(e.target.value)}
                                                                 placeholder="New domain..."
                                                                 onKeyDown={e => {
                                                                     if (e.key === 'Enter') {
                                                                         e.preventDefault();
                                                                         if (newDomainInput.trim()) {
                                                                             setEditedDomains(prev => [...prev, newDomainInput.trim()]);
                                                                             setNewDomainInput('');
                                                                         }
                                                                     }
                                                                 }}
                                                                 className="flex-grow min-w-0 bg-black/50 text-[10px] text-white px-2 py-1 rounded border border-white/10 outline-none uppercase font-black"
                                                             />
                                                             <button 
                                                                 type="button"
                                                                 onClick={() => {
                                                                     if (newDomainInput.trim()) {
                                                                         setEditedDomains(prev => [...prev, newDomainInput.trim()]);
                                                                         setNewDomainInput('');
                                                                     }
                                                                 }}
                                                                 className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black px-2.5 py-1 rounded transition-colors"
                                                             >
                                                                 +
                                                             </button>
                                                         </div>
                                                     </div>

                                                     {/* Quirks */}
                                                     <div className="space-y-1.5">
                                                         <span className="text-[9px] font-black uppercase text-gray-455 block">Quirks</span>
                                                         <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto bg-black/40 p-1.5 rounded-lg border border-white/5">
                                                             {editedQuirks.length === 0 && <span className="text-[8px] text-gray-600 font-bold uppercase py-0.5">None specified</span>}
                                                             {(editedQuirks || [])?.map?.((quirk, idx) => (
                                                                 <span key={idx} className="inline-flex items-center gap-1 text-[8px] font-black text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-800/40">
                                                                     {quirk}
                                                                     <button 
                                                                         type="button" 
                                                                         onClick={() => setEditedQuirks(prev => prev.filter((_, i) => i !== idx))}
                                                                         className="text-red-400 hover:text-red-200"
                                                                     >
                                                                         ×
                                                                     </button>
                                                                 </span>
                                                             ))}
                                                         </div>
                                                         <div className="flex gap-2">
                                                             <input 
                                                                 type="text" 
                                                                 value={newQuirkInput} 
                                                                 onChange={e => setNewQuirkInput(e.target.value)}
                                                                 placeholder="New quirk..."
                                                                 onKeyDown={e => {
                                                                     if (e.key === 'Enter') {
                                                                         e.preventDefault();
                                                                         if (newQuirkInput.trim()) {
                                                                             setEditedQuirks(prev => [...prev, newQuirkInput.trim()]);
                                                                             setNewQuirkInput('');
                                                                         }
                                                                     }
                                                                 }}
                                                                 className="flex-grow min-w-0 bg-black/50 text-[10px] text-white px-2 py-1 rounded border border-white/10 outline-none uppercase font-black"
                                                             />
                                                             <button 
                                                                 type="button"
                                                                 onClick={() => {
                                                                     if (newQuirkInput.trim()) {
                                                                         setEditedQuirks(prev => [...prev, newQuirkInput.trim()]);
                                                                         setNewQuirkInput('');
                                                                     }
                                                                 }}
                                                                 className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black px-2.5 py-1 rounded transition-colors"
                                                             >
                                                                 +
                                                             </button>
                                                         </div>
                                                     </div>

                                                     {/* Save btn */}
                                                     <button 
                                                         type="button"
                                                         onClick={() => saveAgentChanges(agent.id)}
                                                         className="w-full bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] uppercase font-black py-2 rounded-lg transition-all"
                                                     >
                                                         Save Configuration
                                                     </button>
                                                 </div>
                                             ) : (
                                                 <>
                                                     <div className="flex justify-between items-start mb-6">
                                                         <div className="flex items-center gap-4">
                                                             <div className={`w-12 h-12 ${specBadge.color} bg-black rounded-2xl flex items-center justify-center font-black text-sm border-2 ${specBadge.border}`}>
                                                                 <SpecIcon className="w-6 h-6" />
                                                             </div>
                                                             <div>
                                                                 <h4 className="font-black text-white text-lg uppercase">{agent.name}</h4>
                                                                 <span className={`text-[8px] font-black ${specBadge.color} uppercase tracking-widest bg-black px-2 py-0.5 rounded border ${specBadge.border}`}>{agent.specialty}</span>
                                                             </div>
                                                         </div>
                                                         <div className="flex flex-col items-end gap-1.5">
                                                             <button onClick={() => startEditingAgent(agent)} className="text-[8px] text-amber-500 hover:text-white uppercase font-black border-2 border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500 transition-all">
                                                                 CONFIG
                                                             </button>
                                                             <button onClick={() => fireAgent(agent.id)} className="text-[8px] text-red-500 hover:text-white uppercase font-black border-2 border-red-900/30 px-3 py-1.5 rounded-lg hover:bg-red-600 transition-all">
                                                                 DISMISS
                                                             </button>
                                                         </div>
                                                     </div>
                                                     <p className="text-[10px] text-gray-400 italic mb-6 leading-relaxed border-l-2 border-white/10 pl-3">"{agent.bio}"</p>
                                                     
                                                     {/* Catchphrase & Workload */}
                                                     <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-500 bg-black/20 p-2 rounded-lg border border-white/5 mb-3">
                                                         <span>Workload: <span className="text-white">{agent.personality?.preferredWorkload || 'moderate'}</span></span>
                                                         {agent.catchphrase && <span className="text-amber-500 italic max-w-[124px] truncate" title={agent.catchphrase}>"{agent.catchphrase}"</span>}
                                                     </div>

                                                     {/* Skill Level and Personality stats */}
                                                     <div className="space-y-3 mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                                                         <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase">
                                                             <span>Skill Level ({agent.specialty})</span>
                                                             <span className="text-white">{agent.skills.specialtyLevel}/100</span>
                                                         </div>
                                                         <div className="h-2 bg-black rounded-full overflow-hidden border border-white/10">
                                                             <div className={`h-full ${specBadge.bg.replace('/30', '')}`} style={{ width: `${agent.skills.specialtyLevel}%` }} />
                                                         </div>

                                                         <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-white/5 text-[7px] font-black">
                                                             <div className="flex justify-between text-gray-400 uppercase">
                                                                 <span>Patience</span>
                                                                 <span className="text-amber-400">{agent.personality?.patience ?? 50}%</span>
                                                             </div>
                                                             <div className="flex justify-between text-gray-400 uppercase">
                                                                 <span>Confidence</span>
                                                                 <span className="text-amber-400">{agent.personality?.confidence ?? 50}%</span>
                                                             </div>
                                                             <div className="flex justify-between text-gray-400 uppercase">
                                                                 <span>Independence</span>
                                                                 <span className="text-amber-400">{agent.personality?.independence ?? 50}%</span>
                                                             </div>
                                                             <div className="flex justify-between text-gray-400 uppercase">
                                                                 <span>Loyalty</span>
                                                                 <span className="text-amber-400">{agent.personality?.loyalty ?? 50}%</span>
                                                             </div>
                                                             <div className="flex justify-between text-gray-400 uppercase">
                                                                 <span>Adaptability</span>
                                                                 <span className="text-amber-400">{agent.personality?.adaptability ?? 50}%</span>
                                                             </div>
                                                         </div>
                                                     </div>

                                                     {/* CPH Metrics Section */}
                                                     <div className="flex justify-between items-center mb-3 text-[9px] font-mono text-zinc-400 bg-zinc-900/50 p-2.5 rounded-xl border border-white/5">
                                                         <div className="flex flex-col">
                                                             <span>Compute Cost:</span>
                                                             <span className="text-white font-bold">{agent.currentSalary} CPH</span>
                                                         </div>
                                                         <div className="flex flex-col items-end">
                                                             <span>Efficiency Multiplier:</span>
                                                             <span className="text-violet-400 font-bold">
                                                                 {CPHDisplay.formatEfficiency(agent.efficiencyRating ?? CPHManager.calculateEfficiency(agent.skills.specialtyLevel))}
                                                             </span>
                                                         </div>
                                                     </div>

                                                     {/* Preferred Domains tags */}
                                                     {agent.personality?.preferredDomains && agent.personality.preferredDomains.length > 0 && (
                                                         <div className="mb-3 space-y-1">
                                                             <span className="text-[8px] uppercase font-black text-gray-500 block">Domains</span>
                                                             <div className="flex flex-wrap gap-1">
                                                                 {(agent.personality.preferredDomains || [])?.map?.((dom: string, i: number) => (
                                                                     <span key={i} className="text-[7px] font-black text-amber-450 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/40 uppercase">
                                                                         {dom}
                                                                     </span>
                                                                 ))}
                                                             </div>
                                                         </div>
                                                     )}

                                                     {/* Quirks tags */}
                                                     {agent.personality?.quirks && agent.personality.quirks.length > 0 && (
                                                         <div className="mb-3 space-y-1">
                                                             <span className="text-[8px] uppercase font-black text-gray-500 block">Quirks</span>
                                                             <div className="flex flex-wrap gap-1">
                                                                 {(agent.personality.quirks || [])?.map?.((quirk: string, i: number) => (
                                                                     <span key={i} className="text-[7px] font-black text-violet-400 bg-violet-950/20 px-1.5 py-0.5 rounded border border-violet-900/40 uppercase">
                                                                         {quirk}
                                                                     </span>
                                                                 ))}
                                                             </div>
                                                         </div>
                                                     )}
                                                     
                                                     <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                                                         <div className="flex flex-col">
                                                             <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Status</span>
                                                             <span className={`text-[9.5px] font-black ${statBadge.color} uppercase flex items-center gap-2 mt-1`}>
                                                                 <div className={`w-1.5 h-1.5 ${statBadge.bg} rounded-full ${agent.status !== 'resting' ? 'animate-pulse' : ''}`} /> {statBadge.label}
                                                             </span>
                                                         </div>
                                                         {agent.status !== 'quit' && (
                                                             <button
                                                                 onClick={() => toggleAgentPause(agent.id)}
                                                                 className={`p-2 px-3 border-2 rounded-xl text-[9px] font-bold transition-all uppercase active:scale-95 ${
                                                                     agent.status === 'resting'
                                                                         ? 'border-emerald-500/50 hover:border-emerald-500 text-emerald-400 bg-emerald-950/20'
                                                                         : 'border-amber-500/50 hover:border-amber-500 text-amber-500 bg-amber-950/20'
                                                                 }`}
                                                             >
                                                                 {agent.status === 'resting' ? '▶ Resume' : '⏸ Pause (Standby)'}
                                                             </button>
                                                         )}
                                                     </div>
                                                 </>
                                             )}
                                        </div>
                                    )})}
                                </div>
                            )}
                        </div>

                        {/* Marketplace */}
                        <div className="space-y-6 pt-10 border-t-4 border-zinc-900">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-comic-header text-3xl text-gray-500 uppercase italic">Talent Marketplace</h3>
                                    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                                        <SearchIcon className="w-3 h-3 text-gray-500" />
                                        <select 
                                            value={marketSpecialtyFilter}
                                            onChange={e => setMarketSpecialtyFilter(e.target.value)}
                                            className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer"
                                        >
                                            <option value="all">ANY SPECIALTY</option>
                                            <option value="debug">DEBUG</option>
                                            <option value="build">BUILD</option>
                                            <option value="security">SECURITY</option>
                                            <option value="refactor">REFACTOR</option>
                                            <option value="optimizer">OPTIMIZER</option>
                                            <option value="logic">LOGIC</option>
                                            <option value="learn">LEARN</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={refreshMarketplace} className="text-[10px] font-black uppercase text-violet-500 hover:text-white flex items-center gap-2 bg-black px-4 py-2 rounded-xl border border-violet-900/50 self-start md:self-auto">
                                    <ActivityIcon className="w-3 h-3" /> Refresh Feed
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {marketplace.length === 0 ? (
                                    <div className="col-span-full p-20 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-50">
                                        <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xl">No Talent Available.</p>
                                    </div>
                                ) : filteredMarketplace.length === 0 ? (
                                    <div className="col-span-full p-20 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-50">
                                        <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xl">No talent matches filter.</p>
                                        <button 
                                            onClick={() => setMarketSpecialtyFilter('all')}
                                            className="text-xs text-violet-500 mt-2 font-black uppercase underline"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                ) : (filteredMarketplace || [])?.map?.(agent => {
                                    const specBadge = getSpecialtyBadge(agent.specialty);
                                    const SpecIcon = specBadge.icon;
                                    return (
                                    <div key={agent.id} className="aero-panel bg-black border-2 border-zinc-800 p-6 rounded-2xl relative overflow-hidden group hover:border-violet-500 transition-all hover:-translate-y-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${specBadge.color} ${specBadge.bg} rounded-xl flex items-center justify-center border ${specBadge.border}`}>
                                                    <SpecIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className={`text-[8px] font-black ${specBadge.color} ${specBadge.bg} px-2 py-0.5 rounded uppercase tracking-widest border ${specBadge.border}`}>{agent.specialty}</span>
                                                    <h4 className="font-black text-white text-lg uppercase mt-1">{agent.name}</h4>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-gray-500 italic mb-4 h-8 line-clamp-2">
                                            "{agent.catchphrase}"
                                        </p>

                                        <div className="flex justify-between items-center mb-6 text-[9px] font-mono text-gray-400 bg-zinc-900/50 p-2 rounded-lg">
                                            <span>Salary: <span className="text-white font-bold">{agent.currentSalary}cr</span></span>
                                            <span>XP: {agent.skills.specialtyLevel}</span>
                                        </div>

                                        <button 
                                            onClick={() => hireAgent(agent)}
                                            className="vista-button w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <PlusIcon className="w-3 h-3" /> HIRE AGENT
                                        </button>
                                    </div>
                                )})}
                            </div>
                        </div>
                    </div>
                ) : viewMode === 'COLLAB' ? (
                    /* COLLAB VIEW (PROJECT COLLABORATION) */
                    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
                        
                        {/* Sub Header / Stats Banner */}
                        <div className="aero-panel bg-black border-4 border-emerald-950 p-6 rounded-[2rem] relative overflow-hidden shadow-[8px_8px_0_0_rgba(16,185,129,0.1)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,_rgba(16,185,129,0.1)_0%,_transparent_70%)] pointer-events-none" />
                            
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div>
                                    <h4 className="font-mono text-emerald-500 text-[10px] uppercase tracking-widest mb-1">Decentralized Alliance Protocol</h4>
                                    <h3 className="font-comic-header text-4xl text-white uppercase italic">Project Collaboration Hub</h3>
                                    <p className="text-[11px] text-zinc-400 mt-2 max-w-2xl">
                                        Team up with fellow core developers on the network. Forge new project shards, seek specialized skill sets, recruit allies, or express your build interest in active, ongoing network squads.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsCreatingCollab(!isCreatingCollab);
                                        // Scroll to top of panel
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="vista-button px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 border-2 border-black"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    {isCreatingCollab ? 'Hide Draft Shield' : 'Post Project Idea'}
                                </button>
                            </div>

                            {/* Multi-tier Statistics Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-950/40 font-mono text-center">
                                <div className="bg-zinc-950/60 p-3 rounded-xl border border-emerald-950/30">
                                    <div className="text-[9px] text-zinc-500 uppercase">Available Ideas</div>
                                    <div className="text-xl font-bold text-white mt-1">{collabProjects.length}</div>
                                </div>
                                <div className="bg-zinc-950/60 p-3 rounded-xl border border-emerald-950/30">
                                    <div className="text-[9px] text-zinc-500 uppercase">My Collaborations</div>
                                    <div className="text-xl font-bold text-emerald-400 mt-1">
                                        {collabProjects.filter(p => p.creatorName === (profile?.username || 'Aetheros_Prime')).length}
                                    </div>
                                </div>
                                <div className="bg-zinc-950/60 p-3 rounded-xl border border-emerald-950/30">
                                    <div className="text-[9px] text-zinc-500 uppercase">Teams Joined</div>
                                    <div className="text-xl font-bold text-cyan-400 mt-1">
                                        {collabProjects.filter(p => p.teamMembers.includes(profile?.username || 'Aetheros_Prime')).length}
                                    </div>
                                </div>
                                <div className="bg-zinc-950/60 p-3 rounded-xl border border-emerald-950/30">
                                    <div className="text-[9px] text-zinc-500 uppercase">Current User</div>
                                    <div className="text-[11px] font-bold text-amber-500 mt-2 truncate max-w-full">
                                        @{profile?.username || 'Aetheros_Prime'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Idea Forge Creator (Form Panel) */}
                        {isCreatingCollab && (
                            <div className="aero-panel bg-slate-950/90 border-4 border-emerald-500/30 p-8 rounded-[2rem] shadow-2xl space-y-6 animate-in slide-in-from-top duration-300">
                                <div className="flex items-center gap-3 border-b border-emerald-950/60 pb-4">
                                    <BrainIcon className="w-8 h-8 text-emerald-500" />
                                    <div>
                                        <h3 className="text-2xl font-comic-header text-white uppercase italic tracking-tight">Forge New Collaboration Shard</h3>
                                        <p className="text-[9px] text-emerald-500 font-mono uppercase tracking-widest">Publish logic ideation schema to coding network</p>
                                    </div>
                                </div>

                                <form onSubmit={handleForgeCollab} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Project Concept Title</label>
                                            <input 
                                                value={newCollabTitle}
                                                onChange={e => setNewCollabTitle(e.target.value)}
                                                className="w-full bg-black border-4 border-zinc-900 rounded-xl p-4 text-white font-black text-sm focus:outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-800"
                                                placeholder="e.g. DECENTRALIZED_ROUTING_GRID"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Required Skills (Comma-Separated)</label>
                                            <input 
                                                value={newCollabSkills}
                                                onChange={e => setNewCollabSkills(e.target.value)}
                                                className="w-full bg-black border-4 border-zinc-900 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-800"
                                                placeholder="e.g. React, WebSockets, Solidity, Tailwind"
                                            />
                                            <p className="text-[8px] text-zinc-500 uppercase tracking-tight">Separating skills with commas structures them into filters.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Board Post Type</label>
                                            <select
                                                value={newCollabType}
                                                onChange={e => setNewCollabType(e.target.value as any)}
                                                className="w-full bg-black border-4 border-zinc-900 rounded-xl p-4 text-white font-black text-sm focus:outline-none focus:border-emerald-500 transition-all cursor-pointer h-14"
                                            >
                                                <option value="collab">🤝 Project Collaboration Shard</option>
                                                <option value="help_request">⚠️ Request Urgent Help on Project</option>
                                                <option value="mentor_offer">🎓 Offer Expertise as a Mentor</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Operational Context</label>
                                            <div className="w-full bg-black/60 border-4 border-zinc-900 rounded-xl p-3 text-[10px] text-zinc-400 h-14 overflow-y-auto font-mono flex items-center">
                                                {newCollabType === 'collab' && "Assemble a team to collaborate. Set tasks, review code, and deploy logic shards together."}
                                                {newCollabType === 'help_request' && "Stuck on a critical bottleneck? Request debug assistance or technical review from the network."}
                                                {newCollabType === 'mentor_offer' && "Share your cognitive wisdom. Guide other developers, review architectures, and advise."}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Ideation Summary & Vision</label>
                                        <textarea 
                                            value={newCollabDesc}
                                            onChange={e => setNewCollabDesc(e.target.value)}
                                            rows={4}
                                            className="w-full bg-black border-4 border-zinc-900 rounded-xl p-4 text-xs font-mono text-gray-300 resize-none focus:outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-800"
                                            placeholder="Clearly describe the architecture, goals, and what you aim to build with collaborators..."
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-4 justify-end pt-2">
                                        <button 
                                            type="button"
                                            onClick={() => setIsCreatingCollab(false)}
                                            className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest transition-colors"
                                        >
                                            Cancel Draft
                                        </button>
                                        <button 
                                            type="submit"
                                            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-emerald-900/30"
                                        >
                                            FORGE COGNITIVE SHARD
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Search, Filter Tabs and Content Core */}
                        <div className="space-y-6">
                            
                            {/* Filter Bar Panel */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/80 p-4 border-2 border-emerald-950/30 rounded-2xl">
                                
                                {/* Filter category tabs */}
                                <div className="flex flex-wrap gap-2">
                                    <button 
                                        onClick={() => setCollabFilterTab('all')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            collabFilterTab === 'all' 
                                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                                            : 'bg-transparent border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
                                        }`}
                                    >
                                        All Ideas
                                    </button>
                                    <button 
                                        onClick={() => setCollabFilterTab('my_ideas')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            collabFilterTab === 'my_ideas' 
                                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                                            : 'bg-transparent border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
                                        }`}
                                    >
                                        My Ideas
                                    </button>
                                    <button 
                                        onClick={() => setCollabFilterTab('my_teams')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            collabFilterTab === 'my_teams' 
                                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                                            : 'bg-transparent border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
                                        }`}
                                    >
                                        My Teams
                                    </button>
                                    <button 
                                        onClick={() => setCollabFilterTab('applied')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            collabFilterTab === 'applied' 
                                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                                            : 'bg-transparent border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
                                        }`}
                                    >
                                        Applied Status
                                    </button>
                                    <button 
                                        onClick={() => setCollabFilterTab('c4s_arbitration')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            collabFilterTab === 'c4s_arbitration' 
                                            ? 'bg-amber-950/40 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                            : 'bg-transparent border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
                                        }`}
                                        title="Investigate C4S (Contract for Services) Chargebacks & Escrow disputes."
                                    >
                                        ⚖️ C4S Settlement
                                    </button>
                                </div>

                                {/* Board Type Filter & Custom search box */}
                                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full md:w-auto">
                                    {collabFilterTab !== 'c4s_arbitration' && (
                                        <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded-xl px-3 py-2">
                                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Type:</span>
                                            <select 
                                                value={collabTypeFilter}
                                                onChange={e => setCollabTypeFilter(e.target.value as any)}
                                                className="bg-transparent text-[10px] font-bold text-emerald-400 focus:outline-none cursor-pointer uppercase font-mono"
                                            >
                                                <option value="all" className="bg-zinc-950 text-white">All Types</option>
                                                <option value="collab" className="bg-zinc-950 text-white">Collaborations</option>
                                                <option value="help_request" className="bg-zinc-950 text-white">Help Requests</option>
                                                <option value="mentor_offer" className="bg-zinc-950 text-white">Mentorship Offers</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="w-full md:w-80 flex items-center gap-3 bg-black border border-emerald-950/60 px-4 py-2 rounded-xl">
                                    <SearchIcon className="w-4 h-4 text-emerald-500" />
                                    <input 
                                        value={collabSearch}
                                        onChange={e => setCollabSearch(e.target.value)}
                                        placeholder="Search by title, description or skill..."
                                        className="bg-transparent text-xs text-white focus:outline-none w-full placeholder:text-zinc-700 font-bold uppercase"
                                    />
                                    {collabSearch && (
                                        <button onClick={() => setCollabSearch('')} className="text-zinc-650 hover:text-white transition-colors">
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Project Cards Grid */}
                            {collabFilterTab === 'c4s_arbitration' ? (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="bg-zinc-950/80 border-4 border-amber-950/40 p-8 rounded-[2.5rem] relative overflow-hidden shadow-[10px_10px_0_0_#000]">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,_rgba(245,158,11,0.05)_0%,_transparent_70%)] pointer-events-none" />
                                        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                                            <div className="space-y-3">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/30 border border-amber-500/50 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-500 font-mono">
                                                    <span>⚖️</span> Sovereign Arbitration Protocol Active
                                                </div>
                                                <h3 className="text-3xl font-comic-header text-white uppercase italic tracking-tight">Contract for Services (C4S) Dispute settlement</h3>
                                                <p className="text-xs text-zinc-400 font-mono leading-relaxed max-w-4xl">
                                                    C4S agreements establish a cryptographically-secured escrow layer for contractor deliverables. If a mentor, auditor, or specialized developer fails to deliver agreed standards, client nodes can lock escrows and initiate dynamic <span className="text-amber-500 font-bold">Chargeback Disputes</span>. Multi-sig arbitraters will review proof repositories to either refund clients or release locked funds to contractors.
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => setIsCreatingDispute(!isCreatingDispute)}
                                                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-amber-950/40 transition-all shrink-0 font-mono"
                                            >
                                                {isCreatingDispute ? 'Hide Filing Shield' : '⚠️ File New C4S Dispute'}
                                            </button>
                                        </div>
                                    </div>

                                    {isCreatingDispute && (
                                        <div className="bg-zinc-950 border-4 border-amber-500/40 p-8 rounded-[2.5rem] animate-in slide-in-from-top duration-300">
                                            <div className="flex items-center gap-3 border-b border-amber-950/60 pb-4 mb-6">
                                                <div className="text-2xl">🚨</div>
                                                <div>
                                                    <h4 className="text-xl font-comic-header text-white uppercase italic tracking-tight">Initiate Escrow Dispute & Chargeback Request</h4>
                                                    <p className="text-[9px] text-amber-500 font-mono uppercase tracking-widest">Submit system evidence logs to lock escrow funds</p>
                                                </div>
                                            </div>

                                            <form onSubmit={handleInitiateDispute} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">Contract/Project Title</label>
                                                        <input 
                                                            value={disputeContractTitle}
                                                            onChange={e => setDisputeContractTitle(e.target.value)}
                                                            className="w-full bg-black border-4 border-zinc-900 rounded-xl p-4 text-white font-black text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-800"
                                                            placeholder="e.g. EVM COMPILER OPTIMIZER"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">Contractor Username (Defendant)</label>
                                                        <input 
                                                            value={disputeContractor}
                                                            onChange={e => setDisputeContractor(e.target.value)}
                                                            className="w-full bg-black border-4 border-zinc-900 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-800"
                                                            placeholder="e.g. SolidityDev_Core"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">Escrow Amount Locked (CPH)</label>
                                                        <input 
                                                            type="number"
                                                            value={disputeAmount}
                                                            onChange={e => setDisputeAmount(Number(e.target.value))}
                                                            className="w-full bg-black border-4 border-zinc-900 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-amber-500 transition-all h-14"
                                                            min={1}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">Detailed Breach Reason</label>
                                                    <textarea 
                                                        value={disputeReason}
                                                        onChange={e => setDisputeReason(e.target.value)}
                                                        rows={3}
                                                        className="w-full bg-black border-4 border-zinc-900 rounded-xl p-4 text-xs font-mono text-gray-300 resize-none focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-800"
                                                        placeholder="Describe specifically which parts of the contract were breached or delivered with severe faults..."
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">Evidence Log / Repository Path (Optional)</label>
                                                    <input 
                                                        value={disputeEvidence}
                                                        onChange={e => setDisputeEvidence(e.target.value)}
                                                        className="w-full bg-black border-4 border-zinc-900 rounded-xl p-4 text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-800"
                                                        placeholder="e.g. console_error_log.txt / github.com/issue/34"
                                                    />
                                                </div>

                                                <div className="flex gap-4 justify-end pt-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setIsCreatingDispute(false)}
                                                        className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest transition-colors"
                                                    >
                                                        Cancel Dispute
                                                    </button>
                                                    <button 
                                                        type="submit"
                                                        className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-amber-950/20"
                                                    >
                                                        ⚖️ Lock Escrow & Broadcast Dispute
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-6">
                                        {(c4sDisputes || []).length === 0 ? (
                                            <div className="py-20 text-center border-4 border-dashed border-zinc-900 rounded-3xl bg-zinc-950/20">
                                                <div className="text-4xl mb-4">⚖️</div>
                                                <p className="text-xs font-mono text-zinc-500 uppercase">No active Contract for Services disputes reported in client escrow.</p>
                                            </div>
                                        ) : (
                                            (c4sDisputes || [])?.map?.(dispute => (
                                                <div 
                                                    key={dispute.id}
                                                    className="bg-zinc-950/40 border-4 border-zinc-900 p-8 rounded-[2rem] relative overflow-hidden flex flex-col justify-between gap-6 hover:border-amber-500/20 transition-all shadow-[8px_8px_0_0_#000]"
                                                >
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-start flex-wrap gap-4 border-b border-zinc-900 pb-4">
                                                            <div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] font-mono text-amber-500 font-extrabold">{dispute.id}</span>
                                                                    <h4 className="text-xl font-extrabold text-white tracking-tight">{dispute.contractTitle}</h4>
                                                                </div>
                                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] font-mono text-zinc-500">
                                                                    <div>CLIENT: <span className="text-zinc-300 font-bold">@{dispute.client}</span></div>
                                                                    <div>CONTRACTOR: <span className="text-zinc-300 font-bold">@{dispute.contractor}</span></div>
                                                                    <div>FILED: <span className="text-zinc-400">{new Date(dispute.timestamp).toLocaleString()}</span></div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2">
                                                                <div className="px-3 py-1 bg-black border border-zinc-800 rounded-lg text-xs font-mono font-extrabold text-amber-500">
                                                                    💰 {dispute.amountCPH} CPH
                                                                </div>
                                                                <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                                    dispute.status === 'UNDER_ARBITRATION' ? 'border-amber-500 text-amber-400 bg-amber-950/20' :
                                                                    dispute.status === 'DISPUTE_OPENED' ? 'border-blue-500 text-blue-400 bg-blue-950/20' :
                                                                    dispute.status === 'CHARGEBACK_APPROVED' ? 'border-red-500 text-red-400 bg-red-950/20' :
                                                                    'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                                                                }`}>
                                                                    {dispute.status.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                                                            <div>
                                                                <span className="text-amber-500 font-bold uppercase text-[9px] block mb-1">Breach Allegations:</span>
                                                                <p className="text-zinc-300 bg-zinc-950/80 p-4 rounded-xl border border-zinc-900">{dispute.reason}</p>
                                                            </div>
                                                            {dispute.evidence && (
                                                                <div>
                                                                    <span className="text-zinc-500 font-bold uppercase text-[9px] block mb-1">Evidence Records:</span>
                                                                    <p className="text-zinc-400 italic bg-zinc-950/40 p-3 rounded-lg border border-zinc-900/40 text-[10px]">{dispute.evidence}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {dispute.status !== 'CHARGEBACK_APPROVED' && dispute.status !== 'FUNDS_RELEASED' && (
                                                        <div className="border-t border-zinc-900 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-900">
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 font-mono block">⚖️ Arbitrator Consensus Panel</span>
                                                                <p className="text-[10px] text-zinc-500 uppercase">Evaluate evidence repository to finalize escrow settlement.</p>
                                                            </div>
                                                            <div className="flex gap-3 self-end md:self-auto">
                                                                <button 
                                                                    onClick={() => handleArbitrateDispute(dispute.id, 'refund')}
                                                                    className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-500 hover:text-white rounded-xl text-[10px] font-mono font-black uppercase tracking-wider transition-colors border border-red-900/40"
                                                                >
                                                                    🚨 Approve Chargeback (Refund Client)
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleArbitrateDispute(dispute.id, 'release')}
                                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-[10px] font-mono font-black uppercase tracking-wider transition-all"
                                                                >
                                                                    ✅ Release Escrow to contractor
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {filteredCollabProjects.length === 0 ? (
                                    <div className="col-span-full py-32 text-center border-4 border-dashed border-emerald-950/30 rounded-[3rem] bg-zinc-950/20">
                                        <CodeIcon className="w-20 h-20 mx-auto mb-6 text-zinc-850" />
                                        <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">No active alliance shingles matches filters.</p>
                                        <button 
                                            onClick={() => { setCollabSearch(''); setCollabFilterTab('all'); }} 
                                            className="mt-4 px-4 py-2 bg-emerald-950/30 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/30 font-black text-xs uppercase tracking-widest rounded-xl transition-colors"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                ) : (
                                    (filteredCollabProjects || [])?.map?.(project => {
                                        const isCreator = project.creatorName === (profile?.username || 'Aetheros_Prime');
                                        const isMember = (project?.teamMembers || []).includes(profile?.username || 'Aetheros_Prime');
                                        const currentUsername = profile?.username || 'Aetheros_Prime';
                                        
                                        // Find pending request of the current user
                                        const myPendingRequest = (project?.interestedUsers || [])?.find?.(
                                            u => u.username === currentUsername && u.status === 'pending'
                                        );
                                        const isPending = !!myPendingRequest;

                                        // Total pending applications count
                                        const pendingAppsCount = (project?.interestedUsers || []).filter(u => u.status === 'pending').length;

                                        return (
                                            <div 
                                                key={project.id} 
                                                className="aero-panel bg-zinc-950/40 p-8 border-4 border-zinc-900 hover:border-emerald-700/40 transition-all duration-300 rounded-[2rem] flex flex-col justify-between gap-6 relative overflow-hidden group shadow-[10px_10px_0_0_#000]"
                                            >
                                                {/* Ambient micro-glow */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_100%_0%,_rgba(16,185,129,0.05)_0%,_transparent_70%)] pointer-events-none" />

                                                {/* Card Header Structure */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {project.type === 'help_request' ? (
                                                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-red-500 text-red-400 bg-red-950/20">
                                                                    ⚠️ HELP REQUEST (URGENT)
                                                                </span>
                                                            ) : project.type === 'mentor_offer' ? (
                                                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-purple-500 text-purple-400 bg-purple-950/20">
                                                                    🎓 MENTORSHIP OFFER
                                                                </span>
                                                            ) : (
                                                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500 text-emerald-400 bg-emerald-950/30">
                                                                    🤝 COLLABORATION SHARD
                                                                </span>
                                                            )}
                                                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-zinc-800 text-zinc-500 bg-zinc-900/50 flex items-center gap-1">
                                                                <UserIcon className="w-3 h-3 text-emerald-500" />
                                                                LEAD: @{project.creatorName}
                                                            </span>
                                                        </div>

                                                        {/* Delete element button for creator */}
                                                        {isCreator && (
                                                            <button 
                                                                onClick={() => handleDeleteCollab(project.id)} 
                                                                className="text-zinc-700 hover:text-red-500 transition-colors p-1"
                                                                title="Delete Project Shard"
                                                            >
                                                                <XIcon className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <h4 className="font-comic-header text-3xl text-white uppercase italic tracking-tight">{project.title}</h4>
                                                    <p className="text-[9px] text-zinc-500 font-mono">FORGED: {new Date(project.timestamp).toLocaleDateString()}</p>
                                                </div>

                                                {/* Description Block */}
                                                <div className="bg-zinc-950/80 border border-zinc-900 p-4 rounded-xl text-xs text-zinc-300 leading-relaxed italic pr-2 font-sans">
                                                    "{project.description}"
                                                </div>

                                                {/* Required Skills tag matrix */}
                                                {project.requiredSkills && project.requiredSkills.length > 0 && (
                                                    <div className="space-y-2">
                                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block">Required Capabilities:</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(project.requiredSkills || [])?.map?.((skill, sIdx) => (
                                                                <span 
                                                                    key={sIdx} 
                                                                    className="px-2.5 py-1 text-[8px] font-black uppercase text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 rounded-lg shadow-sm"
                                                                >
                                                                    🏷️ {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Team Roster List */}
                                                <div className="space-y-3 pt-2 border-t border-zinc-900/60">
                                                    <div className="flex justify-between items-center text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                                                        <span>Team Squad Members:</span>
                                                        <span className="text-white font-bold">{project.teamMembers.length} Operative(s)</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(project.teamMembers || [])?.map?.((member, mIdx) => (
                                                            <span 
                                                                key={mIdx} 
                                                                className={`px-3 py-1 text-[9px] font-bold rounded-lg border flex items-center gap-1.5 ${
                                                                    member === project.creatorName 
                                                                    ? 'bg-amber-950/20 border-amber-900 text-amber-500' 
                                                                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                                                                }`}
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                {member === project.creatorName ? '👑 ' : ''}@{member}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* PIPELINE / APPLICATIONS CONTROL INTERFACE (CREATORS ONLY) */}
                                                {isCreator && (
                                                    <div className="space-y-4 pt-4 border-t-2 border-dashed border-zinc-900 bg-zinc-950/30 p-4 rounded-xl">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                                <ActivityIcon className="w-3 h-3 animate-pulse text-amber-500" /> 
                                                                Operative Pipeline
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-zinc-900 text-[8px] text-zinc-500 font-black rounded border border-zinc-800 uppercase">
                                                                {pendingAppsCount} pending
                                                            </span>
                                                        </div>

                                                        {project.interestedUsers && project.interestedUsers.length > 0 ? (
                                                            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                                                {(project.interestedUsers || [])?.map?.((app, appIdx) => (
                                                                    <div 
                                                                        key={appIdx} 
                                                                        className={`p-3 rounded-lg border text-[10px] flex flex-col gap-2 ${
                                                                            app.status === 'accepted' ? 'bg-green-950/20 border-green-900/40' :
                                                                            app.status === 'declined' ? 'bg-red-950/10 border-red-950/30 opacity-60' :
                                                                            'bg-zinc-900/50 border-zinc-800'
                                                                        }`}
                                                                    >
                                                                        <div className="flex justify-between items-center border-b border-zinc-800 pb-1 font-mono">
                                                                            <span className="text-white font-bold">👤 @{app.username}</span>
                                                                            <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase ${
                                                                                app.status === 'accepted' ? 'bg-green-600 font-black text-black' :
                                                                                app.status === 'declined' ? 'bg-red-950 text-red-500' :
                                                                                'bg-emerald-950 text-emerald-400 animate-pulse'
                                                                            }`}>
                                                                                {app.status}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        <div className="font-mono text-zinc-400 space-y-1 mt-1">
                                                                            <div><span className="text-emerald-500 font-bold uppercase text-[8px]">Role Requested:</span> {app.roleRequested}</div>
                                                                            <div><span className="text-zinc-500 text-[8px] uppercase">Applicant Pitch:</span> <span className="italic">"{app.comment}"</span></div>
                                                                        </div>

                                                                        {app.status === 'pending' && (
                                                                            <div className="flex gap-2 justify-end pt-1">
                                                                                <button 
                                                                                    onClick={() => handleManageRequest(project.id, app.username, 'decline')}
                                                                                    className="px-2.5 py-1 bg-red-950 text-red-500 hover:bg-red-900 hover:text-white rounded text-[8px] font-black uppercase transition-colors"
                                                                                >
                                                                                    Decline
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => handleManageRequest(project.id, app.username, 'accept')}
                                                                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black rounded text-[8px] font-black uppercase transition-colors"
                                                                                >
                                                                                    Accept Alliance
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-[9px] text-zinc-650 italic text-center py-2 uppercase">Interest Pipeline Empty.</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* INTERACTIVE ACTIONS COMPONENT (FOR NON-CREATOR COLLABORATORS) */}
                                                {!isCreator && (
                                                    <div className="border-t border-zinc-900 pt-4 flex flex-col gap-4 mt-2">
                                                        
                                                        {isMember ? (
                                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                                                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                                                                    Active Team Member
                                                                </span>
                                                                <button 
                                                                    onClick={() => handleLeaveTeam(project.id)}
                                                                    className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors border border-red-900/40"
                                                                >
                                                                    Leave Project Team
                                                                </button>
                                                            </div>
                                                        ) : isPending ? (
                                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 animate-pulse">
                                                                        <SpinnerIcon className="w-4 h-4 text-emerald-500 animate-spin" />
                                                                        Application Transmitted (Pending Approval)
                                                                    </span>
                                                                    <p className="text-[8px] text-zinc-500 uppercase mt-1 font-mono">Role Requested: {myPendingRequest.roleRequested}</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleCancelInterest(project.id)}
                                                                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
                                                                >
                                                                    Cancel Pitch
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {applyingProjectId !== project.id ? (
                                                                    <button 
                                                                        onClick={() => setApplyingProjectId(project.id)}
                                                                        className="vista-button w-full py-3 bg-zinc-900 hover:bg-emerald-950/30 text-zinc-300 hover:text-emerald-400 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-zinc-800 hover:border-emerald-500/40"
                                                                    >
                                                                        📥 Express Build Interest / Request to Join
                                                                    </button>
                                                                ) : (
                                                                    <div className="bg-zinc-950 p-4 rounded-xl border border-emerald-950/30 space-y-3 animate-in fade-in duration-200">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Express Build Interest Draft</span>
                                                                            <button onClick={() => setApplyingProjectId(null)} className="text-zinc-600 hover:text-white">
                                                                                <XIcon className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                        
                                                                        <div className="space-y-3 text-[11px]">
                                                                            <div className="space-y-1">
                                                                                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Primary Requested Role</label>
                                                                                <input 
                                                                                    value={applyRole}
                                                                                    onChange={e => setApplyRole(e.target.value)}
                                                                                    className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-white outline-none focus:border-emerald-500"
                                                                                    placeholder="e.g. Backend Dev / UI Designer"
                                                                                    required
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Quick pitch / comment</label>
                                                                                <textarea 
                                                                                    value={applyComment}
                                                                                    onChange={e => setApplyComment(e.target.value)}
                                                                                    rows={2}
                                                                                    className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-white outline-none focus:border-emerald-500 resize-none font-sans"
                                                                                    placeholder="Briefly pitch your skills and how you want to contribute to this idea..."
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex gap-2 justify-end">
                                                                            <button 
                                                                                onClick={() => setApplyingProjectId(null)}
                                                                                className="px-3 py-1.5 bg-zinc-900 text-zinc-400 rounded text-[9px] font-black uppercase"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleExpressInterest(project.id)}
                                                                                className="px-4 py-1.5 bg-emerald-600 text-black rounded text-[9px] font-black uppercase shadow-md shadow-emerald-950/20"
                                                                            >
                                                                                Transmit Pitch
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* ALLIANCE TEAM ACTIVE WORKSPACE DECK */}
                                                {(isCreator || isMember) && (
                                                    <div className="border-t-2 border-dashed border-emerald-900/20 pt-6 mt-4 space-y-4">
                                                        <div className="flex justify-between items-center bg-zinc-950 border border-emerald-950/50 p-3 rounded-xl">
                                                            <div className="flex items-center gap-2">
                                                                <span className="relative flex h-2 w-2">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                                </span>
                                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                                                    Alliance Workspace Deck
                                                                </span>
                                                            </div>
                                                            {activeCollabWorkspaceId === project.id ? (
                                                                <button 
                                                                    onClick={() => setActiveCollabWorkspaceId(null)}
                                                                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-805 text-zinc-400 hover:text-white rounded text-[8px] font-black uppercase tracking-wider transition-all"
                                                                >
                                                                    Close Workspace
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => {
                                                                        setActiveCollabWorkspaceId(project.id);
                                                                        setActiveCollabSubTab('TASKS');
                                                                        setEditCollabGitRepo(project.gitRepo || '');
                                                                        setEditCollabGitBranch(project.gitBranch || 'main');
                                                                        setTaskSearchKeyword('');
                                                                        setTaskSearchAssignee('');
                                                                        setTaskSearchStatus('all');
                                                                    }}
                                                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase rounded text-[10px] tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-900/30"
                                                                >
                                                                    Enter Operations Deck ⚡
                                                                </button>
                                                            )}
                                                        </div>

                                                        {activeCollabWorkspaceId === project.id && (
                                                            <div className="space-y-4 bg-black/60 p-5 rounded-2xl border border-emerald-950/30 animate-in fade-in duration-300">
                                                                {/* Tab Selector Nav */}
                                                                <div className="flex border-b border-zinc-900 pb-2 gap-2">
                                                                    <button 
                                                                        onClick={() => setActiveCollabSubTab('TASKS')}
                                                                        className={`flex-1 text-center py-1.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
                                                                            activeCollabSubTab === 'TASKS' 
                                                                            ? 'border-emerald-500 text-emerald-400' 
                                                                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                                                        }`}
                                                                    >
                                                                        📋 Tasks ({project.tasks?.length || 0})
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setActiveCollabSubTab('FILES')}
                                                                        className={`flex-1 text-center py-1.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
                                                                            activeCollabSubTab === 'FILES' 
                                                                            ? 'border-emerald-500 text-emerald-400' 
                                                                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                                                        }`}
                                                                    >
                                                                        📁 Shared Files ({project.sharedFiles?.length || 0})
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setActiveCollabSubTab('GIT')}
                                                                        className={`flex-1 text-center py-1.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
                                                                            activeCollabSubTab === 'GIT' 
                                                                            ? 'border-emerald-500 text-emerald-400' 
                                                                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                                                        }`}
                                                                    >
                                                                        🌐 Git Terminal
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setActiveCollabSubTab('COMMS')}
                                                                        className={`flex-1 text-center py-1.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
                                                                            activeCollabSubTab === 'COMMS' 
                                                                            ? 'border-emerald-500 text-emerald-400' 
                                                                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                                                        }`}
                                                                    >
                                                                        💬 Team Chat ({project.messages?.length || 0})
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setActiveCollabSubTab('ANALYTICS')}
                                                                        className={`flex-1 text-center py-1.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
                                                                            activeCollabSubTab === 'ANALYTICS' 
                                                                            ? 'border-emerald-500 text-emerald-400' 
                                                                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                                                        }`}
                                                                    >
                                                                        📊 Metrics & Workload
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setActiveCollabSubTab('CALENDAR')}
                                                                        className={`flex-1 text-center py-1.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
                                                                            activeCollabSubTab === 'CALENDAR' 
                                                                            ? 'border-emerald-500 text-emerald-400' 
                                                                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                                                        }`}
                                                                    >
                                                                        📅 Calendar
                                                                    </button>
                                                                </div>

                                                                {/* TAB CONTENT: TASKS */}
                                                                {activeCollabSubTab === 'TASKS' && (
                                                                    <div className="space-y-4 animate-in fade-in duration-200">
                                                                        {/* Progress bar info */}
                                                                        {project.tasks && project.tasks.length > 0 && (
                                                                            <div className="space-y-1.5">
                                                                                <div className="flex justify-between text-[8px] font-mono font-bold text-zinc-500">
                                                                                    <span>WORKSPACE TASKS PROGRESS</span>
                                                                                    <span className="text-emerald-400">
                                                                                        {Math.round((project.tasks.filter(t => t.completed).length / project.tasks.length) * 100)}%
                                                                                    </span>
                                                                                </div>
                                                                                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                                                                    <div 
                                                                                        className="h-full bg-emerald-500 transition-all duration-300"
                                                                                        style={{ width: `${Math.round((project.tasks.filter(t => t.completed).length / project.tasks.length) * 100)}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {(() => {
                                                                            const filteredTasks = (project.tasks || []).filter(task => {
                                                                                if (taskSearchKeyword.trim()) {
                                                                                    const query = taskSearchKeyword.toLowerCase();
                                                                                    const textMatch = task.text?.toLowerCase().includes(query);
                                                                                    const assigneeMatch = task.assignee ? task.assignee.toLowerCase().includes(query) : false;
                                                                                    if (!textMatch && !assigneeMatch) return false;
                                                                                }
                                                                                if (taskSearchAssignee) {
                                                                                    if (taskSearchAssignee === 'unassigned') {
                                                                                        if (task.assignee) return false;
                                                                                    } else {
                                                                                        if (task.assignee !== taskSearchAssignee) return false;
                                                                                    }
                                                                                }
                                                                                if (taskSearchStatus !== 'all') {
                                                                                    if (taskSearchStatus === 'completed' && !task.completed) return false;
                                                                                    if (taskSearchStatus === 'active' && task.completed) return false;
                                                                                }
                                                                                return true;
                                                                            });

                                                                            return (
                                                                                <>
                                                                                    {/* Search & Filter Bar */}
                                                                                    {project.tasks && project.tasks.length > 0 && (
                                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900 text-[10px]">
                                                                                            {/* Keyword search input */}
                                                                                            <div className="relative flex items-center gap-1.5 bg-black px-2.5 py-1.5 rounded-lg border border-zinc-800">
                                                                                                <SearchIcon className="w-3 h-3 text-emerald-500" />
                                                                                                <input
                                                                                                    value={taskSearchKeyword}
                                                                                                    onChange={e => setTaskSearchKeyword(e.target.value)}
                                                                                                    placeholder="Filter tasks by keyword..."
                                                                                                    className="bg-transparent text-[10px] text-white focus:outline-none w-full placeholder:text-zinc-650 font-bold uppercase"
                                                                                                />
                                                                                                {taskSearchKeyword && (
                                                                                                    <button 
                                                                                                        onClick={() => setTaskSearchKeyword('')} 
                                                                                                        className="text-zinc-650 hover:text-white"
                                                                                                    >
                                                                                                        <XIcon className="w-2.5 h-2.5" />
                                                                                                    </button>
                                                                                                )}
                                                                                            </div>

                                                                                            {/* Assignee Filter dropdown */}
                                                                                            <div className="flex items-center gap-1 bg-black px-2 py-1 rounded-lg border border-zinc-800">
                                                                                                <span className="text-[8px] font-mono text-zinc-500 uppercase px-1">WHO:</span>
                                                                                                <select
                                                                                                    value={taskSearchAssignee}
                                                                                                    onChange={e => setTaskSearchAssignee(e.target.value)}
                                                                                                    className="bg-transparent text-[10px] font-bold text-emerald-400 focus:outline-none cursor-pointer uppercase font-mono w-full"
                                                                                                >
                                                                                                    <option value="" className="bg-zinc-950 text-white">ANY ASSIGNEE</option>
                                                                                                    <option value="unassigned" className="bg-zinc-950 text-white">UNASSIGNED</option>
                                                                                                    {(project.teamMembers || [])?.map?.(m => (
                                                                                                        <option key={m} value={m} className="bg-zinc-950 text-white">@{m}</option>
                                                                                                    ))}
                                                                                                </select>
                                                                                            </div>

                                                                                            {/* Status Filter dropdown */}
                                                                                            <div className="flex items-center gap-1 bg-black px-2 py-1 rounded-lg border border-zinc-800">
                                                                                                <span className="text-[8px] font-mono text-zinc-500 uppercase px-1">STATUS:</span>
                                                                                                <select
                                                                                                    value={taskSearchStatus}
                                                                                                    onChange={e => setTaskSearchStatus(e.target.value as any)}
                                                                                                    className="bg-transparent text-[10px] font-bold text-emerald-400 focus:outline-none cursor-pointer uppercase font-mono w-full"
                                                                                                >
                                                                                                    <option value="all" className="bg-zinc-950 text-white">ALL STATUS</option>
                                                                                                    <option value="active" className="bg-zinc-950 text-white">ACTIVE ONLY</option>
                                                                                                    <option value="completed" className="bg-zinc-950 text-white">COMPLETED ONLY</option>
                                                                                                </select>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Task list array */}
                                                                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                                                                        {!project.tasks || project.tasks.length === 0 ? (
                                                                                            <p className="text-[9px] text-zinc-650 italic text-center py-4 uppercase font-mono">No current tasks registered.</p>
                                                                                        ) : filteredTasks.length === 0 ? (
                                                                                            <div className="text-center py-6 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20">
                                                                                                <p className="text-[9px] text-zinc-500 uppercase font-mono">No tasks match criteria.</p>
                                                                                                <button 
                                                                                                    onClick={() => {
                                                                                                        setTaskSearchKeyword('');
                                                                                                        setTaskSearchAssignee('');
                                                                                                        setTaskSearchStatus('all');
                                                                                                    }}
                                                                                                    className="text-[8px] text-emerald-400 mt-1 font-mono uppercase underline"
                                                                                                >
                                                                                                    Clear Task Filters
                                                                                                </button>
                                                                                            </div>
                                                                                        ) : (
                                                                                            filteredTasks?.map?.(task => (
                                                                                                <div 
                                                                                                    key={task.id}
                                                                                                    className={`p-2.5 rounded-xl border flex items-center justify-between text-[10px] transition-colors ${
                                                                                                        task.completed 
                                                                                                        ? 'bg-zinc-950/20 border-zinc-900/40 text-zinc-500 line-through' 
                                                                                                        : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-200'
                                                                                                    }`}
                                                                                                >
                                                                                                    <div className="flex items-center gap-2.5 select-none text-[10px]">
                                                                                                        <input 
                                                                                                            type="checkbox"
                                                                                                            checked={task.completed}
                                                                                                            onChange={() => handleToggleCollabTask(project.id, task.id)}
                                                                                                            className="w-3.5 h-3.5 rounded border-zinc-700 bg-black text-emerald-500 focus:ring-emerald-500 focus:ring-offset-black accent-emerald-500 cursor-pointer"
                                                                                                        />
                                                                                                        <span className="font-sans font-medium">{task.text}</span>
                                                                                                    </div>
                                                                                                    <div className="flex items-center gap-2 font-mono shrink-0">
                                                                                                        {task.assignee && (
                                                                                                            <span className="text-[7px] font-black px-1.5 py-0.5 bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 rounded">
                                                                                                                @{task.assignee}
                                                                                                            </span>
                                                                                                        )}
                                                                                                        <button 
                                                                                                            onClick={() => handleDeleteCollabTask(project.id, task.id)}
                                                                                                            className="text-zinc-650 hover:text-red-500 transition-colors"
                                                                                                        >
                                                                                                            <XIcon className="w-3.5 h-3.5" />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))
                                                                                        )}
                                                                                    </div>
                                                                                </>
                                                                            );
                                                                        })()}

                                                                        {/* Form to append a new task */}
                                                                        <div className="border-t border-zinc-900 pt-3 flex flex-col md:flex-row gap-2">
                                                                            <input 
                                                                                value={newCollabTaskText}
                                                                                onChange={e => setNewCollabTaskText(e.target.value)}
                                                                                placeholder="Core engineer challenge, e.g. Implement routing"
                                                                                className="flex-1 bg-black border border-zinc-850 rounded px-3 py-1.5 text-[10px] text-white focus:border-emerald-500 focus:outline-none"
                                                                            />
                                                                            <select 
                                                                                value={newCollabTaskAssignee}
                                                                                onChange={e => setNewCollabTaskAssignee(e.target.value)}
                                                                                className="bg-black border border-zinc-800 text-zinc-400 py-1 px-2 text-[8px] rounded uppercase cursor-pointer"
                                                                            >
                                                                                <option value="">No Assignee</option>
                                                                                {(project.teamMembers || [])?.map?.(m => (
                                                                                    <option key={m} value={m}>@{m}</option>
                                                                                ))}
                                                                            </select>
                                                                            <button 
                                                                                onClick={() => {
                                                                                    handleAddCollabTask(project.id, newCollabTaskText, newCollabTaskAssignee);
                                                                                    setNewCollabTaskText('');
                                                                                    setNewCollabTaskAssignee('');
                                                                                }}
                                                                                disabled={!newCollabTaskText.trim()}
                                                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:bg-zinc-805 text-black text-[9px] font-black uppercase rounded shrink-0 transition-colors"
                                                                            >
                                                                                + Add Task
                                                                            </button>
                                                                        </div>
                                                                     </div>
                                                                 )}

                                                                 {/* TAB CONTENT: SHARED FILES */}
                                                                 {activeCollabSubTab === 'FILES' && (
                                                                     <div className="space-y-4 animate-in fade-in duration-200">
                                                                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                                                             {/* Left Column: Share a new file */}
                                                                             <div className="lg:col-span-5 bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3 text-[11px]">
                                                                                 <span className="text-[9px] text-emerald-500 font-bold block uppercase tracking-wider">Share Code Shard / Document</span>
                                                                                 <div className="space-y-2">
                                                                                     <label className="text-[8px] text-zinc-500 uppercase tracking-widest block font-bold">File Name</label>
                                                                                     <input 
                                                                                         value={newSharedFileName}
                                                                                         onChange={e => setNewSharedFileName(e.target.value)}
                                                                                         placeholder="e.g. server-reconciler.ts"
                                                                                         className="w-full bg-black border border-zinc-800 rounded p-2 text-white outline-none focus:border-emerald-500 text-[10px]"
                                                                                     />
                                                                                 </div>
                                                                                 <div className="space-y-2">
                                                                                     <label className="text-[8px] text-zinc-500 uppercase tracking-widest block font-bold">File Extension / Syntax Type</label>
                                                                                     <select 
                                                                                         value={newSharedFileType}
                                                                                         onChange={e => setNewSharedFileType(e.target.value)}
                                                                                         className="w-full bg-black border border-zinc-800 rounded p-2 text-zinc-300 outline-none focus:border-emerald-500 text-[10px] cursor-pointer"
                                                                                     >
                                                                                         <option value="ts">TypeScript (.ts)</option>
                                                                                         <option value="tsx">React TSX (.tsx)</option>
                                                                                         <option value="js">JavaScript (.js)</option>
                                                                                         <option value="sol">Solidity (.sol)</option>
                                                                                         <option value="rs">Rust (.rs)</option>
                                                                                         <option value="json">JSON (.json)</option>
                                                                                         <option value="css">CSS / Tailwind (.css)</option>
                                                                                         <option value="md">Markdown Document (.md)</option>
                                                                                     </select>
                                                                                 </div>
                                                                                 <div className="space-y-2">
                                                                                     <label className="text-[8px] text-zinc-500 uppercase tracking-widest block font-bold">File Contents / Code Shard</label>
                                                                                     <textarea 
                                                                                         value={newSharedFileContent}
                                                                                         onChange={e => setNewSharedFileContent(e.target.value)}
                                                                                         rows={5}
                                                                                         placeholder="Paste or type code logic here..."
                                                                                         className="w-full bg-black border border-zinc-800 rounded p-2 text-white outline-none focus:border-emerald-500 text-[10px] font-mono"
                                                                                     />
                                                                                 </div>
                                                                                 <button 
                                                                                     onClick={() => {
                                                                                         const size = `${(newSharedFileContent.length / 1024).toFixed(1)} KB`;
                                                                                         handleShareCollabFile(project.id, newSharedFileName, newSharedFileContent, newSharedFileType, size);
                                                                                         setNewSharedFileName('');
                                                                                         setNewSharedFileContent('');
                                                                                     }}
                                                                                     disabled={!newSharedFileName.trim() || !newSharedFileContent.trim()}
                                                                                     className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 text-black font-black uppercase text-[10px] rounded transition-all tracking-wider shadow-md"
                                                                                 >
                                                                                     Upload & Share Shard
                                                                                 </button>
                                                                             </div>

                                                                             {/* Right Column: Files Registry list & preview */}
                                                                             <div className="lg:col-span-7 space-y-3">
                                                                                 <span className="text-[9px] text-zinc-500 uppercase font-black block tracking-widest">Active Workspace Repository</span>
                                                                                 <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 min-h-[220px] max-h-[360px] overflow-y-auto custom-scrollbar space-y-2">
                                                                                     {!project.sharedFiles || project.sharedFiles.length === 0 ? (
                                                                                         <div className="text-center py-10 uppercase text-[9px] text-zinc-700 italic font-mono space-y-2">
                                                                                             <p>No repository code shards shared.</p>
                                                                                             <p className="text-[8px] text-zinc-800 font-sans">Use the uploader on the left or simulate drag-and-drop to commit documents.</p>
                                                                                         </div>
                                                                                     ) : (
                                                                                         (project.sharedFiles || [])?.map?.(file => (
                                                                                             <div 
                                                                                                 key={file.id} 
                                                                                                 className={`p-3 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                                                                                                     viewingSharedFile?.id === file.id 
                                                                                                     ? 'bg-emerald-950/20 border-emerald-500/50' 
                                                                                                     : 'bg-black/40 border-zinc-900 hover:border-zinc-850'
                                                                                                 }`}
                                                                                                 onClick={() => setViewingSharedFile(file)}
                                                                                             >
                                                                                                 <div className="flex items-center gap-2.5 min-w-0">
                                                                                                     <div className="p-1.5 bg-zinc-900 rounded border border-zinc-800 text-xs text-emerald-400 font-mono font-bold shrink-0">
                                                                                                         .{file.type}
                                                                                                     </div>
                                                                                                     <div className="truncate">
                                                                                                         <p className="text-[11px] font-bold text-zinc-200 font-mono truncate">{file.name}</p>
                                                                                                         <p className="text-[8px] text-zinc-500 font-mono uppercase">
                                                                                                             {file.size} • By @{file.sharedBy} • {new Date(file.timestamp).toLocaleDateString()}
                                                                                                         </p>
                                                                                                     </div>
                                                                                                 </div>
                                                                                                 <div className="flex items-center gap-2">
                                                                                                     <button 
                                                                                                         onClick={(e) => {
                                                                                                             e.stopPropagation();
                                                                                                             setViewingSharedFile(file);
                                                                                                         }}
                                                                                                         className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 text-[8px] font-mono text-zinc-300 font-bold uppercase rounded"
                                                                                                     >
                                                                                                         View
                                                                                                     </button>
                                                                                                     <button 
                                                                                                         onClick={(e) => {
                                                                                                             e.stopPropagation();
                                                                                                             if (viewingSharedFile?.id === file.id) {
                                                                                                                 setViewingSharedFile(null);
                                                                                                             }
                                                                                                             handleDeleteCollabFile(project.id, file.id);
                                                                                                         }}
                                                                                                         className="p-1 text-zinc-700 hover:text-red-500 transition-colors"
                                                                                                     >
                                                                                                         <XIcon className="w-3.5 h-3.5" />
                                                                                                     </button>
                                                                                                 </div>
                                                                                             </div>
                                                                                         ))
                                                                                     )}
                                                                                 </div>
                                                                             </div>
                                                                         </div>

                                                                         {/* Code Terminal View Component */}
                                                                         {viewingSharedFile && (
                                                                             <div className="bg-slate-950 border-2 border-emerald-500/30 rounded-2xl p-4 space-y-2.5 font-mono text-xs animate-in slide-in-from-bottom duration-300">
                                                                                 <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                                                                                     <div className="flex items-center gap-2">
                                                                                         <TerminalIcon className="w-4 h-4 text-emerald-500" />
                                                                                         <span className="text-[10px] text-zinc-300 font-bold">{viewingSharedFile.name} ({viewingSharedFile.size})</span>
                                                                                     </div>
                                                                                     <button 
                                                                                         onClick={() => setViewingSharedFile(null)}
                                                                                         className="text-zinc-500 hover:text-white transition-colors"
                                                                                     >
                                                                                         <XIcon className="w-4 h-4" />
                                                                                     </button>
                                                                                 </div>
                                                                                 <div className="bg-black p-3.5 rounded-lg border border-zinc-900 text-[10px] overflow-x-auto max-h-64 custom-scrollbar whitespace-pre text-emerald-400">
                                                                                     <code>{viewingSharedFile.content || `// Empty file shard content`}</code>
                                                                                 </div>
                                                                                 <div className="flex justify-end gap-2 text-[9px]">
                                                                                     <button 
                                                                                         onClick={() => {
                                                                                             if (viewingSharedFile.content) {
                                                                                                 navigator.clipboard.writeText(viewingSharedFile.content);
                                                                                                 toast.success("Copied shard contents to clip buffer!");
                                                                                             }
                                                                                         }}
                                                                                         className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-350 font-bold uppercase rounded border border-zinc-800"
                                                                                     >
                                                                                         Copy Logic Shard
                                                                                     </button>
                                                                                 </div>
                                                                             </div>
                                                                         )}
                                                                     </div>
                                                                 )}

                                                                 {/* TAB CONTENT: GIT TERMINAL */}
                                                                 {activeCollabSubTab === 'GIT' && (
                                                                     <div className="space-y-4 animate-in fade-in duration-200 text-[10px] font-mono">
                                                                         <div className="bg-black p-4 rounded-xl border border-zinc-900 space-y-3">
                                                                             <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 mb-1">
                                                                                 <TerminalIcon className="w-4 h-4 text-emerald-500" />
                                                                                 <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Repository Routing Bridge</span>
                                                                             </div>
                                                                             
                                                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[9px]">
                                                                                 <div className="space-y-1">
                                                                                     <span className="text-zinc-500 block uppercase">Simulated Remote URI</span>
                                                                                     <input 
                                                                                         value={editCollabGitRepo}
                                                                                         onChange={e => setEditCollabGitRepo(e.target.value)}
                                                                                         placeholder="github.com/aetheros-org/project"
                                                                                         className="w-full bg-zinc-950 border border-zinc-800 p-2 text-white outline-none rounded focus:border-emerald-500 text-[9px]"
                                                                                     />
                                                                                 </div>
                                                                                 <div className="space-y-1">
                                                                                     <span className="text-zinc-500 block uppercase">Active Shard Branch</span>
                                                                                     <input 
                                                                                         value={editCollabGitBranch}
                                                                                         onChange={e => setEditCollabGitBranch(e.target.value)}
                                                                                         placeholder="main"
                                                                                         className="w-full bg-zinc-950 border border-zinc-800 p-2 text-white outline-none rounded focus:border-emerald-500 text-[9px]"
                                                                                     />
                                                                                 </div>
                                                                             </div>
                                                                             
                                                                             <div className="flex justify-end pt-1">
                                                                                 <button 
                                                                                     onClick={() => handleUpdateCollabGit(project.id, editCollabGitRepo, editCollabGitBranch)}
                                                                                     className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 hover:text-emerald-400 text-zinc-400 rounded text-[8px] font-black uppercase transition-all"
                                                                                 >
                                                                                     Synchronize Remote URL
                                                                                 </button>
                                                                             </div>
                                                                         </div>

                                                                         {/* Simulated Commit and push */}
                                                                         <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 space-y-3">
                                                                             <span className="text-[9px] text-emerald-500 font-bold block uppercase tracking-wider">Simulate Code Edit & Commit Push</span>
                                                                             <div className="flex gap-2">
                                                                                 <input 
                                                                                     value={newCollabCommitMsg}
                                                                                     onChange={e => setNewCollabCommitMsg(e.target.value)}
                                                                                     placeholder="Commit message (e.g. fix: resolve heap memory leaks)"
                                                                                     className="flex-1 bg-black border border-zinc-800 rounded p-2 text-white outline-none focus:border-emerald-500 text-[10px]"
                                                                                 />
                                                                                 <button 
                                                                                     onClick={() => {
                                                                                         handleCreateCollabCommit(project.id, newCollabCommitMsg);
                                                                                         setNewCollabCommitMsg('');
                                                                                     }}
                                                                                     disabled={!newCollabCommitMsg.trim()}
                                                                                     className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:bg-zinc-800 text-black font-black uppercase tracking-wider rounded transition-colors text-[8px]"
                                                                                 >
                                                                                     Stage & Push
                                                                                 </button>
                                                                             </div>
                                                                         </div>

                                                                         {/* Commits logs registry */}
                                                                         <div className="space-y-2">
                                                                             <span className="text-[8px] text-zinc-500 uppercase tracking-widest block font-bold">Git Commit Log (Push History)</span>
                                                                             <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                                                                                 {!project.gitCommits || project.gitCommits.length === 0 ? (
                                                                                     <p className="text-[8px] text-zinc-700 italic text-center py-2 uppercase font-mono">No commits pushed to simulated remote yet.</p>
                                                                                 ) : (
                                                                                     (project.gitCommits || [])?.map?.(commit => (
                                                                                         <div key={commit.id} className="text-[9px] flex gap-2 border-b border-zinc-900/35 pb-1.5 last:border-0 last:pb-0 font-mono">
                                                                                             <span className="text-emerald-500 font-black">{commit.hash}</span>
                                                                                             <span className="text-zinc-650">@{commit.author}</span>
                                                                                             <span className="text-zinc-300 flex-1 truncate">"{commit.message}"</span>
                                                                                             <span className="text-zinc-550 text-[7px] shrink-0 font-bold">{new Date(commit.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                                                                                         </div>
                                                                                     ))
                                                                                 )}
                                                                             </div>
                                                                         </div>
                                                                     </div>
                                                                 )}

                                                                 {/* TAB CONTENT: TEAM CHAT CHANNELS */}
                                                                 {activeCollabSubTab === 'COMMS' && (
                                                                     <div className="space-y-4 animate-in fade-in duration-200">
                                                                         <div className="bg-black p-3.5 rounded-xl border border-zinc-900 space-y-3 flex flex-col">
                                                                             <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-1 flex flex-col-reverse">
                                                                                 {!project.messages || project.messages.length === 0 ? (
                                                                                     <p className="text-[9px] text-zinc-700 italic text-center py-6 uppercase font-mono">No communication signals transmitted yet.</p>
                                                                                 ) : (
                                                                                     ([...(project.messages || [])].reverse() || [])?.map?.(msg => {
                                                                                         const isMe = msg.sender === (profile?.username || 'Aetheros_Prime');
                                                                                         return (
                                                                                             <div key={msg.id} className="text-[10px] space-y-1 font-mono">
                                                                                                 <div className="flex items-center gap-1.5 text-[8px]">
                                                                                                     <span className={isMe ? 'text-emerald-400 font-black' : 'text-amber-500 font-bold'}>
                                                                                                         @{msg.sender}
                                                                                                     </span>
                                                                                                     <span className="text-zinc-600 font-sans">
                                                                                                         {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                                                                     </span>
                                                                                                 </div>
                                                                                                 <div className={`p-2 rounded-xl text-zinc-200 text-xs font-sans max-w-[85%] inline-block ${
                                                                                                     isMe ? 'bg-emerald-950/20 border border-emerald-900/30' : 'bg-zinc-900/60 border border-zinc-800/60'
                                                                                                 }`}>
                                                                                                     {msg.text}
                                                                                                 </div>
                                                                                             </div>
                                                                                         );
                                                                                     })
                                                                                 )}
                                                                             </div>

                                                                             {/* Message Typing Panel */}
                                                                             <div className="border-t border-zinc-900/60 pt-3 flex gap-2">
                                                                                 <input 
                                                                                     value={newCollabMsgText}
                                                                                     onChange={e => setNewCollabMsgText(e.target.value)}
                                                                                     onKeyDown={e => {
                                                                                         if (e.key === 'Enter') {
                                                                                             handlePostCollabMessage(project.id, newCollabMsgText);
                                                                                             setNewCollabMsgText('');
                                                                                         }
                                                                                     }}
                                                                                     placeholder="Type operational log or message..."
                                                                                     className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                                                                                 />
                                                                                 <button 
                                                                                     onClick={() => {
                                                                                         handlePostCollabMessage(project.id, newCollabMsgText);
                                                                                         setNewCollabMsgText('');
                                                                                     }}
                                                                                     disabled={!newCollabMsgText.trim()}
                                                                                     className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:bg-zinc-805 text-black rounded text-[9px] font-black uppercase transition-colors shrink-0 font-mono"
                                                                                 >
                                                                                     Transmit Signal
                                                                                 </button>
                                                                             </div>
                                                                         </div>
                                                                     </div>
                                                                 )}

                                                                 {/* TAB CONTENT: METRICS & ANALYTICS */}
                                                                 {activeCollabSubTab === 'ANALYTICS' && (
                                                                     <ProjectAnalyticsAndCalendar
                                                                         project={project}
                                                                         profile={profile}
                                                                         subTab="ANALYTICS"
                                                                         onToggleTask={handleToggleCollabTask}
                                                                         onDeleteTask={handleDeleteCollabTask}
                                                                         onAddTask={handleAddCollabTask}
                                                                     />
                                                                 )}

                                                                 {/* TAB CONTENT: CALENDAR WORKLOAD */}
                                                                 {activeCollabSubTab === 'CALENDAR' && (
                                                                     <ProjectAnalyticsAndCalendar
                                                                         project={project}
                                                                         profile={profile}
                                                                         subTab="CALENDAR"
                                                                         onToggleTask={handleToggleCollabTask}
                                                                         onDeleteTask={handleDeleteCollabTask}
                                                                         onAddTask={handleAddCollabTask}
                                                                     />
                                                                 )}
                                                             </div>
                                                         )}
                                                     </div>
                                                 )}
                                             </div>
                                        );
                                    })
                                )}
                            </div>
                            )}
                        </div>
                    </div>
                ) : viewMode === 'PROFILES' ? (
                    /* PROFILES VIEW */
                    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
                        {/* Sub Header */}
                        <div className="aero-panel bg-black border-4 border-purple-950 p-6 rounded-[2rem] relative overflow-hidden shadow-[8px_8px_0_0_rgba(147,51,234,0.1)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,_rgba(147,51,234,0.15)_0%,_transparent_70%)] pointer-events-none" />
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h4 className="font-mono text-zinc-550 text-[10px] uppercase tracking-widest mb-1 font-bold">Public Node Registers</h4>
                                    <h3 className="font-comic-header text-4xl text-white uppercase italic">Network Node Portfolio Directories</h3>
                                    <p className="text-[11px] text-zinc-400 mt-1 max-w-xl">
                                        Explore public profile nodes within the Aetheros coding network. Suggest matches and query individual technologies instantly.
                                    </p>
                                </div>
                                <div className="w-full sm:w-auto flex flex-col gap-2">
                                    <input
                                        type="text"
                                        placeholder="Query username or technology skill..."
                                        value={searchProfileQuery}
                                        onChange={(e) => setSearchProfileQuery(e.target.value)}
                                        className="w-full sm:w-72 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono placeholder:text-zinc-650"
                                    />
                                    {/* Segmented Filter */}
                                    <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded-xl w-full sm:w-72">
                                        <button
                                            onClick={() => setSkillFilterMode('all')}
                                            className={`flex-1 text-[9px] font-mono tracking-wider font-bold py-1.5 rounded-lg transition-all ${
                                                skillFilterMode === 'all'
                                                    ? 'bg-purple-650 text-white font-black shadow-md shadow-purple-900/30'
                                                    : 'text-zinc-500 hover:text-zinc-350'
                                            }`}
                                        >
                                            ALL INFO
                                        </button>
                                        <button
                                            onClick={() => setSkillFilterMode('possess')}
                                            className={`flex-1 text-[9px] font-mono tracking-wider font-bold py-1.5 rounded-lg transition-all ${
                                                skillFilterMode === 'possess'
                                                    ? 'bg-purple-650 text-white font-black shadow-md shadow-purple-900/30'
                                                    : 'text-zinc-500 hover:text-zinc-350'
                                            }`}
                                        >
                                            POSSESS
                                        </button>
                                        <button
                                            onClick={() => setSkillFilterMode('mentor')}
                                            className={`flex-1 text-[9px] font-mono tracking-wider font-bold py-1.5 rounded-lg transition-all ${
                                                skillFilterMode === 'mentor'
                                                    ? 'bg-purple-650 text-white font-black shadow-md shadow-purple-900/30'
                                                    : 'text-zinc-500 hover:text-zinc-350'
                                            }`}
                                        >
                                            MENTORS
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sub Navigation Tabs for Directory vs My Profile */}
                        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border-2 border-purple-950 max-w-md mx-auto">
                            <button
                                onClick={() => setProfilesSubMode('directory')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all ${
                                    profilesSubMode === 'directory'
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                                }`}
                            >
                                🌐 Nodes Directory
                            </button>
                            <button
                                onClick={() => setProfilesSubMode('my_profile')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all ${
                                    profilesSubMode === 'my_profile'
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                                }`}
                            >
                                👤 My Profile Hub
                            </button>
                        </div>

                        {profilesSubMode === 'directory' ? (
                            <>
                                {/* Profiles Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Render active profiles */}
                            {(networkProfiles || [])
                                ?.filter?.(p => {
                                    const q = searchProfileQuery.trim().toLowerCase();
                                    const teachSkills = p.willingToTeachSkills || [];
                                    const hasTeach = teachSkills.length > 0;
                                    
                                    if (skillFilterMode === 'possess') {
                                        if (!q) return true;
                                        return (p.skills || []).some((s: string) => s.toLowerCase().includes(q));
                                    }
                                    
                                    if (skillFilterMode === 'mentor') {
                                        if (!hasTeach) return false;
                                        if (!q) return true;
                                        return p.username.toLowerCase().includes(q) || 
                                               teachSkills.some((s: string) => s.toLowerCase().includes(q));
                                    }
                                    
                                    if (!q) return true;
                                    const projInterests = p.lookingForSkills || [];
                                    const pastProjects = p.profileProjects || [];
                                    return p.username.toLowerCase().includes(q) ||
                                        (p.skills || []).some((s: string) => s.toLowerCase().includes(q)) ||
                                        projInterests.some((s: string) => s.toLowerCase().includes(q)) ||
                                        teachSkills.some((s: string) => s.toLowerCase().includes(q)) ||
                                        (p.bio || '').toLowerCase().includes(q) ||
                                        pastProjects.some((pr: any) => 
                                            (pr.title || '').toLowerCase().includes(q) || 
                                            (pr.description || '').toLowerCase().includes(q) ||
                                            (pr.technologies || []).some((t: string) => t.toLowerCase().includes(q))
                                        );
                                })
                                ?.map?.(p => {
                                    // Calculate match percentage against current user's profile
                                    const matchInfo = calculateCompatibility(profile, p);
                                    return (
                                        <div 
                                            key={p.id}
                                            onClick={() => setSelectedProfileNode(p)}
                                            className="bg-[#0b0b18]/70 border-2 border-zinc-900 rounded-3xl p-6 hover:border-purple-500/50 transition-all cursor-pointer relative group overflow-hidden flex flex-col justify-between hover:translate-y-[-2px] shadow-lg"
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_100%_0%,_rgba(147,51,234,0.1)_0%,_transparent_70%)] pointer-events-none" />
                                            <div>
                                                {/* Header Node Info */}
                                                <div className="flex items-center gap-4 mb-4">
                                                    <img 
                                                        src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                                                        alt={p.username} 
                                                        className="w-12 h-12 rounded-full border border-purple-500/30 object-cover"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-sm font-black text-white hover:text-purple-400">@{p.username}</span>
                                                            <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded uppercase font-black">{p.experienceLevel || 'Node Expert'}</span>
                                                        </div>
                                                        <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">AetherOS Routing Authority</span>
                                                    </div>
 
                                                    {/* Telemetry Compatibility Match Badge */}
                                                    <div className="ml-auto text-right">
                                                        <div className="text-xs font-mono font-black text-rose-450 flex items-center gap-1 bg-rose-500/5 border border-rose-500/15 py-1 px-2.5 rounded-xl">
                                                            <svg className="w-2.5 h-2.5 fill-current text-rose-500" viewBox="0 0 24 24">
                                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                            </svg>
                                                            <span>{matchInfo.score}% MATCH</span>
                                                        </div>
                                                    </div>
                                                </div>
 
                                                {/* Bio */}
                                                 <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">{p.bio}</p>

                                                 {/* Skills Badges */}
                                                <div className="space-y-2 mb-4">
                                                    <h5 className="text-[9px] font-mono uppercase text-zinc-550 tracking-wider font-bold">Stack Indices</h5>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(p.skills || []).slice(0, 4)?.map?.((s: string) => {
                                                            const endorsers = p.skillEndorsements?.[s] || [];
                                                            return (
                                                                <span key={s} className="px-2 py-0.5 bg-[#101026] text-[9px] font-mono text-zinc-305 border border-white/5 rounded-md flex items-center gap-1">
                                                                    <span>{s}</span>
                                                                    <span className={`px-1 py-0.5 rounded-sm text-[8px] font-mono leading-none ${
                                                                        endorsers.includes(profile?.username || 'Aetheros_Prime') 
                                                                            ? 'bg-purple-500/20 text-purple-400 font-extrabold border border-purple-500/30' 
                                                                            : 'bg-zinc-850 text-zinc-500'
                                                                    }`}>
                                                                        {endorsers.length}
                                                                    </span>
                                                                </span>
                                                            );
                                                        })}
                                                         {(p.skills || []).length > 4 && (
                                                            <span className="px-2 py-0.5 bg-purple-950/20 text-[9px] font-mono text-purple-400 border border-purple-500/10 rounded-md">
                                                                +{(p.skills || []).length - 4}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
 
                                                {/* Seeking Skills Indices */}
                                                {(p.lookingForSkills || []).length > 0 && (
                                                    <div className="space-y-2 mb-2">
                                                        <h5 className="text-[9px] font-mono uppercase text-zinc-550 tracking-wider font-bold">Seeking Collaborators</h5>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(p.lookingForSkills || []).slice(0, 4)?.map?.((s: string) => (
                                                                <span key={s} className="px-2 py-0.5 bg-rose-950/20 text-[9px] font-mono text-rose-400 border border-rose-500/10 rounded-md">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Mentoring Badges */}
                                                {(p.willingToTeachSkills || []).length > 0 && (
                                                    <div className="space-y-2 mb-2">
                                                        <h5 className="text-[9px] font-mono uppercase text-emerald-500 tracking-wider font-bold">🎓 Willing to Mentor</h5>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(p.willingToTeachSkills || []).slice(0, 4).map((s: string) => (
                                                                <span key={s} className="px-2 py-0.5 bg-emerald-950/20 text-[9px] font-mono text-emerald-400 border border-emerald-500/10 rounded-md">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
 
                                            {/* Action footer */}
                                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-550 gap-2">
                                                <span>{(p.portfolioLinks || []).length} Portfolios Connected</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setInvitationTargetProfile(p);
                                                        }}
                                                        className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-black rounded text-[9px] font-black uppercase tracking-wider transition-all"
                                                    >
                                                        🤝 Invite
                                                    </button>
                                                    <span className="text-purple-400 uppercase font-black tracking-wider group-hover:translate-x-1 transition-transform">Inspect Node Detail &rarr;</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                                {networkProfiles.length === 0 && (
                                    <div className="md:col-span-2 text-center py-12 border border-dashed border-zinc-800 rounded-3xl">
                                        <span className="text-zinc-600 block uppercase font-mono text-xs font-black">No profile nodes available in net config.</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Render MY PROFILE HUB with full editing and radar chart */
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                                {/* Left Column: Visual Analytics & Skills Config */}
                                <div className="lg:col-span-5 space-y-6">
                                    {/* Radar Chart Panel */}
                                    <div className="bg-zinc-950 border-2 border-purple-950/40 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                                        <h4 className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-black flex items-center gap-1.5 mb-1">
                                            <span>⚖️ Verified Skill Signature Matrix</span>
                                        </h4>
                                        <p className="text-[9px] text-zinc-500 font-mono mb-4">
                                            Dynamically compiled distribution of your active skills.
                                        </p>

                                        <div className="h-[220px] w-full flex items-center justify-center relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarDataForOwnNode}>
                                                    <PolarGrid stroke="#27272a" />
                                                    <PolarAngleAxis 
                                                        dataKey="subject" 
                                                        tick={{ fill: '#a1a1aa', fontSize: 8.5, fontFamily: 'monospace' }}
                                                    />
                                                    <PolarRadiusAxis 
                                                        angle={30} 
                                                        domain={[0, 100]} 
                                                        tick={{ fill: '#52525b', fontSize: 7.5 }}
                                                    />
                                                    <Radar
                                                        name="Proficiency"
                                                        dataKey="value"
                                                        stroke="#a855f7"
                                                        fill="#a855f7"
                                                        fillOpacity={0.25}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Skills Management Panel */}
                                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6">
                                        {/* Skills offered */}
                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">// 1. Skills You Offer</h5>
                                            <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
                                                {(profile?.skills || []).map((s: string) => (
                                                    <span key={s} className="px-2 py-0.5 bg-purple-950/20 text-[10px] font-mono text-purple-300 rounded-md border border-purple-500/10 flex items-center gap-1.5">
                                                        <span>{s}</span>
                                                        <button 
                                                            onClick={() => {
                                                                if (onUpdateProfile && profile) {
                                                                    const next = (profile.skills || []).filter(item => item !== s);
                                                                    onUpdateProfile({ skills: next });
                                                                    toast.success(`Removed skill: ${s}`);
                                                                }
                                                            }}
                                                            className="text-red-400 hover:text-red-300 cursor-pointer text-xs font-black"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                                {(profile?.skills || []).length === 0 && (
                                                    <span className="text-[9px] text-zinc-650 italic">No skills configured.</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text"
                                                    placeholder="Add skill (e.g. Go, Rust)..."
                                                    value={offeringInput}
                                                    onChange={e => setOfferingInput(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            const val = offeringInput.trim();
                                                            if (val && profile && onUpdateProfile) {
                                                                const current = profile.skills || [];
                                                                if (!current.includes(val)) {
                                                                    onUpdateProfile({ skills: [...current, val] });
                                                                    setOfferingInput('');
                                                                    toast.success(`Added skill: ${val}`);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-1 text-xs text-white placeholder-zinc-700 font-mono"
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const val = offeringInput.trim();
                                                        if (val && profile && onUpdateProfile) {
                                                            const current = profile.skills || [];
                                                            if (!current.includes(val)) {
                                                                    onUpdateProfile({ skills: [...current, val] });
                                                                    setOfferingInput('');
                                                                    toast.success(`Added skill: ${val}`);
                                                            }
                                                        }
                                                    }}
                                                    className="px-3 py-1 bg-purple-650 hover:bg-purple-500 text-white font-mono text-[9px] font-black uppercase rounded-lg"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>

                                        {/* Looking For skills */}
                                        <div className="space-y-3 pt-2 border-t border-zinc-900">
                                            <h5 className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">// 2. Skills You Seek</h5>
                                            <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
                                                {(profile?.lookingForSkills || []).map((s: string) => (
                                                    <span key={s} className="px-2 py-0.5 bg-rose-950/20 text-[10px] font-mono text-rose-300 rounded-md border border-rose-500/10 flex items-center gap-1.5">
                                                        <span>{s}</span>
                                                        <button 
                                                            onClick={() => {
                                                                if (onUpdateProfile && profile) {
                                                                    const next = (profile.lookingForSkills || []).filter(item => item !== s);
                                                                    onUpdateProfile({ lookingForSkills: next });
                                                                    toast.success(`Removed seeking skill: ${s}`);
                                                                }
                                                            }}
                                                            className="text-red-400 hover:text-red-300 cursor-pointer text-xs font-black"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                                {(profile?.lookingForSkills || []).length === 0 && (
                                                    <span className="text-[9px] text-zinc-650 italic">No seeking terms configured.</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text"
                                                    placeholder="Add seeking skill (e.g. Solidity, Python)..."
                                                    value={lookingInput}
                                                    onChange={e => setLookingInput(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            const val = lookingInput.trim();
                                                            if (val && profile && onUpdateProfile) {
                                                                const current = profile.lookingForSkills || [];
                                                                if (!current.includes(val)) {
                                                                    onUpdateProfile({ lookingForSkills: [...current, val] });
                                                                    setLookingInput('');
                                                                    toast.success(`Added seeking skill: ${val}`);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-1 text-xs text-white placeholder-zinc-700 font-mono"
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const val = lookingInput.trim();
                                                        if (val && profile && onUpdateProfile) {
                                                            const current = profile.lookingForSkills || [];
                                                            if (!current.includes(val)) {
                                                                    onUpdateProfile({ lookingForSkills: [...current, val] });
                                                                    setLookingInput('');
                                                                    toast.success(`Added seeking skill: ${val}`);
                                                            }
                                                        }
                                                    }}
                                                    className="px-3 py-1 bg-rose-650 hover:bg-rose-500 text-white font-mono text-[9px] font-black uppercase rounded-lg"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mentorship skills */}
                                        <div className="space-y-3 pt-2 border-t border-zinc-900">
                                            <h5 className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">// 3. Skills You Can Mentor</h5>
                                            <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
                                                {(profile?.willingToTeachSkills || []).map((s: string) => (
                                                    <span key={s} className="px-2 py-0.5 bg-emerald-950/20 text-[10px] font-mono text-emerald-300 rounded-md border border-emerald-500/10 flex items-center gap-1.5">
                                                        <span>{s}</span>
                                                        <button 
                                                            onClick={() => {
                                                                if (onUpdateProfile && profile) {
                                                                    const next = (profile.willingToTeachSkills || []).filter(item => item !== s);
                                                                    onUpdateProfile({ willingToTeachSkills: next });
                                                                    toast.success(`Removed mentoring skill: ${s}`);
                                                                }
                                                            }}
                                                            className="text-red-400 hover:text-red-300 cursor-pointer text-xs font-black"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                                {(profile?.willingToTeachSkills || []).length === 0 && (
                                                    <span className="text-[9px] text-zinc-650 italic">No mentoring skills configured.</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text"
                                                    placeholder="Add mentoring skill (e.g. AWS, Node.js)..."
                                                    value={editMentorSkillInput}
                                                    onChange={e => setEditMentorSkillInput(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            const val = editMentorSkillInput.trim();
                                                            if (val && profile && onUpdateProfile) {
                                                                const current = profile.willingToTeachSkills || [];
                                                                if (!current.includes(val)) {
                                                                    onUpdateProfile({ willingToTeachSkills: [...current, val] });
                                                                    setEditMentorSkillInput('');
                                                                    toast.success(`Added mentoring skill: ${val}`);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-1 text-xs text-white placeholder-zinc-700 font-mono"
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const val = editMentorSkillInput.trim();
                                                        if (val && profile && onUpdateProfile) {
                                                            const current = profile.willingToTeachSkills || [];
                                                            if (!current.includes(val)) {
                                                                    onUpdateProfile({ willingToTeachSkills: [...current, val] });
                                                                    setEditMentorSkillInput('');
                                                                    toast.success(`Added mentoring skill: ${val}`);
                                                            }
                                                        }
                                                    }}
                                                    className="px-3 py-1 bg-emerald-650 hover:bg-emerald-500 text-white font-mono text-[9px] font-black uppercase rounded-lg"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Info Config Panel */}
                                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
                                        <h5 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">// 4. External Portals & Contacts</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                                            <div className="space-y-1">
                                                <span className="text-zinc-550 block text-[9px] uppercase font-bold">Email</span>
                                                <input 
                                                    type="text"
                                                    value={editContactEmail}
                                                    onChange={e => {
                                                        setEditContactEmail(e.target.value);
                                                        onUpdateProfile?.({ contactInfo: { ...profile?.contactInfo, email: e.target.value } });
                                                    }}
                                                    className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white focus:border-purple-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-zinc-550 block text-[9px] uppercase font-bold">Discord</span>
                                                <input 
                                                    type="text"
                                                    value={editContactDiscord}
                                                    onChange={e => {
                                                        setEditContactDiscord(e.target.value);
                                                        onUpdateProfile?.({ contactInfo: { ...profile?.contactInfo, discord: e.target.value } });
                                                    }}
                                                    className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white focus:border-purple-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-zinc-550 block text-[9px] uppercase font-bold">Telegram</span>
                                                <input 
                                                    type="text"
                                                    value={editContactTelegram}
                                                    onChange={e => {
                                                        setEditContactTelegram(e.target.value);
                                                        onUpdateProfile?.({ contactInfo: { ...profile?.contactInfo, telegram: e.target.value } });
                                                    }}
                                                    className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white focus:border-purple-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-zinc-550 block text-[9px] uppercase font-bold">GitHub Portal</span>
                                                <input 
                                                    type="text"
                                                    value={editContactGithub}
                                                    onChange={e => {
                                                        setEditContactGithub(e.target.value);
                                                        onUpdateProfile?.({ contactInfo: { ...profile?.contactInfo, github: e.target.value } });
                                                    }}
                                                    className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white focus:border-purple-500/50 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Core Bio, Portfolios, Showcase Projects */}
                                <div className="lg:col-span-7 space-y-6">
                                    {/* Core Profile Parameters */}
                                    <div className="bg-[#0b0b18]/80 border-2 border-zinc-900 rounded-3xl p-6 space-y-4">
                                        <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">CORE NODE PARAMETERS</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Operator Username</label>
                                                <input 
                                                    type="text"
                                                    value={editUsername}
                                                    onChange={e => {
                                                        setEditUsername(e.target.value);
                                                        onUpdateProfile?.({ username: e.target.value });
                                                    }}
                                                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Experience Index</label>
                                                <input 
                                                    type="text"
                                                    value={editExperience}
                                                    onChange={e => {
                                                        setEditExperience(e.target.value);
                                                        onUpdateProfile?.({ experienceLevel: e.target.value });
                                                    }}
                                                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">Brief Professional Biography</label>
                                            <textarea 
                                                value={editBio}
                                                onChange={e => {
                                                    setEditBio(e.target.value);
                                                    onUpdateProfile?.({ bio: e.target.value });
                                                }}
                                                rows={3}
                                                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 leading-relaxed outline-none focus:border-purple-500 transition-all"
                                                placeholder="Describe your primary specialties, focus, and system architectures..."
                                            />
                                        </div>
                                    </div>

                                    {/* Links and Portfolios connected */}
                                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">EXTERNAL PORTFOLIO PORTALS</h4>
                                            <span className="text-[9px] text-zinc-600 font-mono">{(profile?.portfolioLinks || []).length} connected</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {(profile?.portfolioLinks || []).map((lnk) => (
                                                <div key={lnk.id} className="flex items-center justify-between p-3 bg-black border border-zinc-900 rounded-xl">
                                                    <div className="truncate max-w-[80%]">
                                                        <div className="text-[11px] font-bold text-gray-200 uppercase font-mono">{lnk.label}</div>
                                                        <a href={lnk.url} target="_blank" rel="noreferrer" className="text-[8px] font-mono text-zinc-500 hover:text-purple-400 truncate block">
                                                            {lnk.url}
                                                        </a>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const current = profile?.portfolioLinks || [];
                                                            onUpdateProfile?.({ portfolioLinks: current.filter(item => item.id !== lnk.id) });
                                                            toast.success("Removed portfolio Portal.");
                                                        }}
                                                        className="p-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                            {(profile?.portfolioLinks || []).length === 0 && (
                                                <p className="text-[10px] text-zinc-600 italic sm:col-span-2">No portfolio portals connected yet.</p>
                                            )}
                                        </div>

                                        {/* Add portfolio form */}
                                        <div className="pt-2 border-t border-zinc-900 space-y-2">
                                            <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold block">Connect New Portfolio Portal</span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <input 
                                                    type="text"
                                                    placeholder="Portal Label (e.g. GitHub Node)"
                                                    value={newPortfolioLabel}
                                                    onChange={e => setNewPortfolioLabel(e.target.value)}
                                                    className="bg-black border border-zinc-900 rounded-lg p-2 text-[10px] text-white font-mono"
                                                />
                                                <input 
                                                    type="text"
                                                    placeholder="https://..."
                                                    value={newPortfolioUrl}
                                                    onChange={e => setNewPortfolioUrl(e.target.value)}
                                                    className="bg-black border border-zinc-900 rounded-lg p-2 text-[10px] text-white font-mono"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    if (!newPortfolioLabel.trim() || !newPortfolioUrl.trim()) {
                                                        toast.error("Please fill in both fields.");
                                                        return;
                                                    }
                                                    const current = profile?.portfolioLinks || [];
                                                    const newLnk = { id: `link_${Date.now()}`, label: newPortfolioLabel.trim(), url: newPortfolioUrl.trim() };
                                                    onUpdateProfile?.({ portfolioLinks: [...current, newLnk] });
                                                    setNewPortfolioLabel('');
                                                    setNewPortfolioUrl('');
                                                    toast.success("Added portfolio portal successfully.");
                                                }}
                                                className="w-full py-1.5 bg-purple-950/40 hover:bg-purple-600 border border-purple-500/20 hover:text-black text-purple-400 font-mono text-[9px] font-black uppercase rounded-lg transition-all"
                                            >
                                                + CONNECT PORTFOLIO PORTAL
                                            </button>
                                        </div>
                                    </div>

                                    {/* Showcase completed projects */}
                                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">PROJECT SHOWCASE TIMELINE</h4>
                                            <span className="text-[9px] text-zinc-600 font-mono">{(profile?.profileProjects || []).length} active showcases</span>
                                        </div>

                                        <div className="space-y-3">
                                            {(profile?.profileProjects || []).map((pro) => (
                                                <div key={pro.id} className="p-4 bg-black/60 border border-zinc-900 rounded-2xl space-y-2 relative group text-left">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="text-xs font-black text-white font-sans uppercase">{pro.title}</h5>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-bold">{pro.roleDefined}</span>
                                                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${pro.status === 'current' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                                                    {pro.status === 'current' ? 'CURRENT BUILD' : 'PAST SHOWCASE'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                const current = profile?.profileProjects || [];
                                                                onUpdateProfile?.({ profileProjects: current.filter(item => item.id !== pro.id) });
                                                                toast.success("Removed showcase project.");
                                                            }}
                                                            className="p-1 px-2 text-xs font-mono font-bold text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-400 leading-relaxed">{pro.description}</p>
                                                </div>
                                            ))}
                                            {(profile?.profileProjects || []).length === 0 && (
                                                <p className="text-[10px] text-zinc-650 italic">No showcase projects registered yet.</p>
                                            )}
                                        </div>

                                        {/* Add showcase project form */}
                                        <div className="pt-2 border-t border-zinc-900 space-y-3">
                                            <span className="text-[9px] font-mono uppercase text-zinc-500 font-bold block">Deploy New Showcase Project Node</span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <input 
                                                    type="text"
                                                    placeholder="Project Title (e.g. Cognitive Pipeline)"
                                                    value={newProjectTitle}
                                                    onChange={e => setNewProjectTitle(e.target.value)}
                                                    className="bg-black border border-zinc-900 rounded-lg p-2 text-[10px] text-white font-mono"
                                                />
                                                <input 
                                                    type="text"
                                                    placeholder="Role (e.g. Core Developer / Lead)"
                                                    value={newProjectRole}
                                                    onChange={e => setNewProjectRole(e.target.value)}
                                                    className="bg-black border border-zinc-900 rounded-lg p-2 text-[10px] text-white font-mono"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 bg-black/60 p-2 border border-zinc-900 rounded-lg">
                                                <span className="text-[9px] font-mono uppercase text-zinc-505 font-bold">Build Status:</span>
                                                <button 
                                                    onClick={() => setNewProjectStatus('current')}
                                                    className={`px-3 py-1 text-[9px] font-mono uppercase font-black rounded-md transition-all ${newProjectStatus === 'current' ? 'bg-emerald-600 text-black' : 'bg-zinc-900 text-zinc-500'}`}
                                                >
                                                    CURRENT BUILD
                                                </button>
                                                <button 
                                                    onClick={() => setNewProjectStatus('past')}
                                                    className={`px-3 py-1 text-[9px] font-mono uppercase font-black rounded-md transition-all ${newProjectStatus === 'past' ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-500'}`}
                                                >
                                                    PAST SHOWCASE
                                                </button>
                                            </div>
                                            <textarea 
                                                placeholder="Showcase Description (brief specification summary details)..."
                                                value={newProjectDesc}
                                                onChange={e => setNewProjectDesc(e.target.value)}
                                                rows={2}
                                                className="w-full bg-black border border-zinc-900 rounded-lg p-2.5 text-[10px] text-zinc-300 outline-none focus:border-purple-500 font-sans"
                                            />
                                            <button 
                                                onClick={() => {
                                                    if (!newProjectTitle.trim() || !newProjectRole.trim() || !newProjectDesc.trim()) {
                                                        toast.error("Please fill in all project showcase details.");
                                                        return;
                                                    }
                                                    const current = profile?.profileProjects || [];
                                                    const newPro = { id: `proj_${Date.now()}`, title: newProjectTitle.trim(), roleDefined: newProjectRole.trim(), status: newProjectStatus, description: newProjectDesc.trim() };
                                                    onUpdateProfile?.({ profileProjects: [...current, newPro] });
                                                    setNewProjectTitle('');
                                                    setNewProjectRole('');
                                                    setNewProjectDesc('');
                                                    toast.success("Showcase project deployed successfully.");
                                                }}
                                                className="w-full py-1.5 bg-purple-950/40 hover:bg-purple-600 border border-purple-500/20 hover:text-black text-purple-400 font-mono text-[9px] font-black uppercase rounded-lg transition-all"
                                            >
                                                + DEPLOY PROJECT SHOWCASE NODE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Selected profile node detail modal */}
                        <AnimatePresence>
                            {selectedProfileNode && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.95, opacity: 0 }}
                                        className="w-full max-w-2xl bg-[#090915] border-2 border-white/10 rounded-3xl overflow-hidden shadow-2xl relative block"
                                    >
                                        <div className="p-6 bg-black/40 border-b border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={selectedProfileNode.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                                                    alt={selectedProfileNode.username} 
                                                    className="w-12 h-12 rounded-full border border-purple-500/35 object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                                <div>
                                                    <h3 className="font-comic-header text-xl text-white uppercase italic leading-none">@{selectedProfileNode.username}</h3>
                                                    <span className="text-[10px] font-mono uppercase bg-purple-500/10 text-purple-400 py-0.5 px-2 rounded mt-1 inline-block font-black">
                                                        {selectedProfileNode.experienceLevel || 'Node Expert'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedProfileNode(null)}
                                                className="p-1 px-2.5 bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white rounded-lg transition-colors text-xs font-mono font-black"
                                            >
                                                CLOSE
                                            </button>
                                        </div>

                                        <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                            {/* About Bio */}
                                            <div className="space-y-2">
                                                <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">Bio Profile Parameter</h4>
                                                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{selectedProfileNode.bio}</p>
                                            </div>

                                            {/* Compatibility Breakdown in Detail Modal */}
                                            {(() => {
                                                const matchInfo = calculateCompatibility(profile, selectedProfileNode);
                                                return (
                                                    <div className="space-y-2 p-4 bg-rose-950/5 border border-rose-500/10 rounded-2xl relative overflow-hidden">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-black">Lattice Proximity Compatibility</h4>
                                                            <span className="text-xs font-mono font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">{matchInfo.score}% MATCH</span>
                                                        </div>
                                                        <div className="space-y-1 pt-1">
                                                            {(matchInfo?.reasons || [])?.map?.((r, i) => (
                                                                <p key={i} className="text-[11px] text-zinc-300 font-mono leading-normal flex items-start gap-1.5">
                                                                    <span className="text-rose-500/60 font-bold">&gt;&gt;</span>
                                                                    {r}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Verified Skill Signature Matrix (Radar Chart Visualizer) */}
                                            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-black flex items-center gap-2">
                                                            ⚖️ Verified Skill Signature Matrix
                                                        </h4>
                                                        <p className="text-[9px] text-zinc-400 mt-1 font-mono">
                                                            Self-declared Base: 50%, Peer validation: +15% per endorsement (max 100%).
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="h-[230px] w-full flex items-center justify-center relative mt-2">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarDataForSelectedNode}>
                                                            <PolarGrid stroke="#27272a" />
                                                            <PolarAngleAxis 
                                                                dataKey="subject" 
                                                                tick={{ fill: '#a1a1aa', fontSize: 8.5, fontFamily: 'monospace' }}
                                                            />
                                                            <PolarRadiusAxis 
                                                                angle={30} 
                                                                domain={[0, 100]} 
                                                                tick={{ fill: '#52525b', fontSize: 7.5 }}
                                                            />
                                                            <Radar
                                                                name="Proficiency"
                                                                dataKey="value"
                                                                stroke="#a855f7"
                                                                fill="#a855f7"
                                                                fillOpacity={0.25}
                                                            />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            {/* Skills Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2 p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                                                    <h5 className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">Primary Programming Stack (Click to Endorse)</h5>
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {(selectedProfileNode.skills || [])?.map?.((s: string) => {
                                                            const endorsers = selectedProfileNode.skillEndorsements?.[s] || [];
                                                            const hasEndorsed = endorsers.includes(profile?.username || 'Aetheros_Prime');
                                                            return (
                                                                <button 
                                                                    key={s} 
                                                                    onClick={() => setEndorsementConfirmation({
                                                                         profileId: selectedProfileNode.id,
                                                                         profileUsername: selectedProfileNode.username,
                                                                         skillName: s,
                                                                         isRemoving: hasEndorsed
                                                                     })}
                                                                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-black uppercase flex items-center gap-2 cursor-pointer transition-all duration-150 ${
                                                                        hasEndorsed
                                                                        ? 'bg-purple-950/45 border-purple-500 text-purple-400 font-extrabold shadow-[0_0_8px_rgba(147,51,234,0.15)] hover:bg-purple-950/60'
                                                                        : 'bg-[#101026] hover:bg-purple-950/20 text-gray-300 hover:text-purple-400 border border-white/5 hover:border-purple-500/30'
                                                                    }`}
                                                                    title={endorsers.length > 0 ? `Endorsed by: ${endorsers.join(', ')}` : 'Click to endorse this skill'}
                                                                >
                                                                    <span>{s}</span>
                                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono leading-none ${
                                                                        hasEndorsed ? 'bg-purple-500 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400 font-bold'
                                                                    }`}>
                                                                        {endorsers.length}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                                                    <h5 className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">Looking For Stack Matrix</h5>
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {(selectedProfileNode.lookingForSkills || [])?.map?.((s: string) => (
                                                            <span key={s} className="px-2.5 py-1 bg-rose-955 bg-rose-950/20 text-xs font-mono text-rose-300 rounded-lg border border-rose-500/10 font-black uppercase">
                                                                {s}
                                                            </span>
                                                        ))}
                                                        {(selectedProfileNode.lookingForSkills || []).length === 0 && (
                                                            <span className="text-[10px] text-zinc-650 italic">No seeking items configured.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mentorship & Teaching list in Modal */}
                                            {(selectedProfileNode.willingToTeachSkills || []).length > 0 && (
                                                <div className="space-y-2 p-4 bg-[#0a2012]/30 border border-emerald-500/20 rounded-2xl relative overflow-hidden text-left">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                                                    <h5 className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                                        <span>🎓 WILLING TO TEACH / MENTOR SKILLS</span>
                                                    </h5>
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {(selectedProfileNode.willingToTeachSkills || []).map((s: string) => (
                                                            <span key={s} className="px-2.5 py-1 bg-emerald-950/40 text-xs font-mono text-emerald-300 rounded-lg border border-emerald-500/20 font-black uppercase flex items-center gap-1">
                                                                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                </svg>
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Portfolio links */}
                                            {(selectedProfileNode.portfolioLinks || []).length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">Verified Network Portals</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {(selectedProfileNode.portfolioLinks || [])?.map?.((lnk: any) => (
                                                            <a 
                                                                key={lnk.id} 
                                                                href={lnk.url} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="flex items-center gap-2 p-3 bg-[#0a0a14] hover:bg-zinc-900/60 border border-zinc-800 rounded-xl transition-all cursor-pointer group"
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                                                <div className="text-left">
                                                                    <div className="text-xs font-bold text-gray-200 group-hover:text-purple-400 transition-colors uppercase font-mono">{lnk.label}</div>
                                                                    <div className="text-[8px] font-mono text-zinc-600 truncate max-w-[180px]">{lnk.url}</div>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Portfolio completed projects */}
                                            {(selectedProfileNode.profileProjects || []).length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">Completed Past showcasing Projects</h4>
                                                    <div className="space-y-2.5">
                                                        {(selectedProfileNode.profileProjects || [])?.map?.((pro: any) => (
                                                            <PortfolioProjectCard 
                                                                key={pro.id}
                                                                project={pro}
                                                                isOwnProject={false}
                                                                onAddTestimonial={handlePeerProjectAddTestimonial}
                                                                onEndorse={handlePeerEndorseProject}
                                                                onRate={handlePeerRateProject}
                                                                currentUsername={profile?.username || 'Operator-You'}
                                                                ownerSkills={selectedProfileNode.skills || []}
                                                                ownerSkillEndorsements={selectedProfileNode.skillEndorsements || {}}
                                                                onQuickEndorse={(skillName) => handleToggleEndorseSkill(selectedProfileNode.id, skillName)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between gap-3 flex-wrap">
                                            <span className="text-[9px] font-mono text-zinc-650">ID SOURCE NODE SHARED INDEX: {selectedProfileNode.id}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setInvitationTargetProfile(selectedProfileNode);
                                                        setSelectedProfileNode(null);
                                                    }}
                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-xs font-black uppercase font-mono transition-all flex items-center gap-1.5"
                                                >
                                                    🤝 Invite to Collaborate
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedProfileNode(null);
                                                        setViewMode('MATCHES');
                                                    }}
                                                    className="px-4 py-2 bg-purple-650 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase font-mono transition-all"
                                                >
                                                    Calculate MATCH MATRIX &rarr;
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                         {/* Direct Collaboration Invitation Modal */}
                        <AnimatePresence>
                            {invitationTargetProfile && (
                                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0, y: 15 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.95, opacity: 0, y: 15 }}
                                        className="w-full max-w-lg bg-[#070714] border-2 border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl relative block"
                                    >
                                        {/* Header */}
                                        <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-black to-zinc-950 border-b border-emerald-500/10 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 text-lg">
                                                    🤝
                                                </span>
                                                <div>
                                                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                                                        TRANSMIT COLLABORATION REQUEST
                                                    </h3>
                                                    <p className="text-[10px] text-zinc-500 uppercase font-mono">
                                                        Target Operator: @{invitationTargetProfile.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setInvitationTargetProfile(null)}
                                                className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Body */}
                                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                                                    Select Project Workspace
                                                </label>
                                                <select
                                                    value={collabInviteSelectedProjectId}
                                                    onChange={(e) => setCollabInviteSelectedProjectId(e.target.value)}
                                                    className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-zinc-350 outline-none focus:border-emerald-500 transition-all font-mono uppercase"
                                                >
                                                    <option value="new_space">🌱 Create & Set Up New Shared Project Space</option>
                                                    {collabProjects
                                                        .filter(p => p.creatorName === (profile?.username || 'Aetheros_Prime') || (p.teamMembers || []).includes(profile?.username || 'Aetheros_Prime'))
                                                        .map(p => (
                                                            <option key={p.id} value={p.id}>📂 Invite to: {p.title}</option>
                                                        ))
                                                    }
                                                </select>
                                                <p className="text-[9px] text-zinc-550 uppercase font-mono mt-1">
                                                    {collabInviteSelectedProjectId === 'new_space' 
                                                        ? 'This will automatically provision a new shared project sandbox, enabling co-managing tasks, Git logs, and comms.' 
                                                        : 'This will instantly invite the operator to join your existing active project team.'
                                                    }
                                                </p>
                                            </div>

                                            {/* Conditional fields for New Space */}
                                            {collabInviteSelectedProjectId === 'new_space' && (
                                                <div className="space-y-4 p-4 bg-zinc-950/65 border border-zinc-900 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                                                            Project Space Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Decentralized Oracle Sandbox"
                                                            value={collabInviteNewTitle}
                                                            onChange={e => setCollabInviteNewTitle(e.target.value)}
                                                            className="w-full bg-black border border-zinc-850 rounded-xl p-3 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition-all font-mono"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                                                            Aether Mission Brief / Description
                                                        </label>
                                                        <textarea
                                                            rows={2}
                                                            placeholder="Describe the goals, tech stack, and mutual co-management goals of this project space..."
                                                            value={collabInviteNewDesc}
                                                            onChange={e => setCollabInviteNewDesc(e.target.value)}
                                                            className="w-full bg-black border border-zinc-850 rounded-xl p-3 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition-all font-sans"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Pitch Message */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                                                    Direct Pitch / Message
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    placeholder={`Hey @${invitationTargetProfile.username}, I saw you have skills in ${(invitationTargetProfile.skills || []).slice(0, 3).join(', ')} and would love to build this together!`}
                                                    value={collabInviteMessage}
                                                    onChange={e => setCollabInviteMessage(e.target.value)}
                                                    className="w-full bg-black border border-zinc-850 rounded-xl p-3 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition-all font-sans"
                                                />
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="p-6 bg-black/40 border-t border-white/5 flex gap-3 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setInvitationTargetProfile(null)}
                                                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-xl text-xs font-black uppercase transition-all"
                                            >
                                                Abort Pitch
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSendCollabInvitation}
                                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/20 active:scale-95 cursor-pointer"
                                            >
                                                Transmit Invitation 🤝
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Endorsement Confirmation Modal */}
                        <AnimatePresence>
                            {endorsementConfirmation && (
                                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                        className="w-full max-w-md bg-[#0c0c1e] border-2 border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl relative block p-6 space-y-6 text-center"
                                    >
                                        <div className="mx-auto w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400">
                                            {endorsementConfirmation.isRemoving ? (
                                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 00.806 1.946 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-comic-header text-xl text-white uppercase italic leading-none">
                                                {endorsementConfirmation.isRemoving ? 'RETRACT ENDORSEMENT' : 'CONFIRM ENDORSEMENT'}
                                             </h3>
                                             <p className="text-xs text-zinc-400 font-mono">
                                                 {endorsementConfirmation.isRemoving 
                                                     ? `Lattice validation: retraction request`
                                                     : `Lattice validation: skill verification request`
                                                 }
                                             </p>
                                         </div>

                                         <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                                             {endorsementConfirmation.isRemoving ? (
                                                 <span>
                                                     Are you sure you want to retract your endorsement for <strong>@{endorsementConfirmation.profileUsername}</strong>'s proficiency in <strong className="text-purple-400">{endorsementConfirmation.skillName}</strong>?
                                                 </span>
                                             ) : (
                                                 <span>
                                                     Are you sure you want to endorse <strong>@{endorsementConfirmation.profileUsername}</strong> for their proficiency in <strong className="text-purple-400">{endorsementConfirmation.skillName}</strong>? This verifies their capabilities in the AetherOS Routing lattice.
                                                 </span>
                                             )}
                                         </p>

                                         <div className="flex gap-3 justify-center pt-2">
                                             <button
                                                 onClick={() => setEndorsementConfirmation(null)}
                                                 className="px-5 py-2 bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white rounded-xl transition-colors text-xs font-mono font-black uppercase cursor-pointer"
                                             >
                                                 Abort / Cancel
                                             </button>
                                             <button
                                                 onClick={() => {
                                                     handleToggleEndorseSkill(endorsementConfirmation.profileId, endorsementConfirmation.skillName);
                                                     setEndorsementConfirmation(null);
                                                 }}
                                                 className={`px-5 py-2 text-white rounded-xl text-xs font-black uppercase font-mono cursor-pointer transition-all ${
                                                     endorsementConfirmation.isRemoving 
                                                         ? 'bg-red-650 hover:bg-red-550 border border-red-500/30' 
                                                         : 'bg-purple-650 hover:bg-purple-550 border border-purple-500/30 shadow-[0_0_12px_rgba(147,51,234,0.3)]'
                                                 }`}
                                             >
                                                 {endorsementConfirmation.isRemoving ? 'Retract' : 'Verify & Endorse'}
                                             </button>
                                         </div>
                                     </motion.div>
                                 </div>
                             )}
                         </AnimatePresence>
                    </div>
                ) : viewMode === 'MATCHES' ? (
                    /* MATCHES (SKILL-BASED MATCHMAKING) VIEW */
                    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
                        {/* Sub Header */}
                        <div className="aero-panel bg-black border-4 border-rose-955 p-6 rounded-[2rem] relative overflow-hidden shadow-[8px_8px_0_0_rgba(244,63,94,0.1)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,_rgba(244,63,94,0.15)_0%,_transparent_70%)] pointer-events-none" />
                            <div>
                                <h4 className="font-mono text-zinc-500 text-[10px] uppercase tracking-widest mb-1 font-bold">COGNITIVE MATCH ENGINE</h4>
                                <h3 className="font-comic-header text-4xl text-white uppercase italic">Skill-Based Collaboration Matchmaking</h3>
                                <p className="text-[11px] text-zinc-400 mt-2 max-w-2xl">
                                    Our telemetry engine maps your active skills (<span className="text-purple-400 font-bold font-mono">{(profile?.skills || []).join(', ') || 'None listed'}</span>) and desired parameters (<span className="text-rose-400 font-bold font-mono">{(profile?.lookingForSkills || []).join(', ') || 'None listed'}</span>) against network profiles to propose high-integrity collaboration squads automatically.
                                </p>
                            </div>
                        </div>

                        {/* Interactive Skill Specification Dashboard */}
                        <div className="bg-[#0b0b18]/80 border-2 border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-6">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_100%_0%,_rgba(168,85,247,0.1)_0%,_transparent_70%)] pointer-events-none" />
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">CONFIGURE MATCH PARAMETERS</h4>
                                    <h3 className="text-lg font-black text-white uppercase font-sans">Set Your Skill Configuration</h3>
                                    <p className="text-[10px] text-zinc-400 mt-1">Specify what you are building (offerings) and what you lack (looking for) to see immediate suggestions update below.</p>
                                </div>
                                <span className="text-zinc-800 text-xs font-black select-none hidden md:inline">//</span>
                                <div className="text-xs text-purple-400 font-mono bg-purple-950/20 px-3.5 py-1.5 rounded-xl border border-purple-500/20 uppercase font-black">
                                    LIVE SQUAD COUPLING MATRIX READY
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                                {/* OFFERED SKILLS PANEL */}
                                <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900 space-y-3 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">// 1. Skills You Are Willing To Offer</span>
                                        <span className="text-[9px] font-mono text-zinc-505">({(profile?.skills || []).length} active)</span>
                                    </div>
                                    
                                    {/* Skills list */}
                                    <div className="flex flex-wrap gap-1.5 min-h-[40px] items-center">
                                        {(profile?.skills || [])?.map?.((s: string) => {
                                            const endorsers = profile?.skillEndorsements?.[s] || [];
                                            return (
                                                <span key={s} className="px-2.5 py-1 bg-purple-950/30 text-xs font-mono text-purple-300 rounded-lg border border-purple-500/15 flex items-center gap-2">
                                                    <span>{s}</span>
                                                    <span className="text-[9px] px-1 bg-purple-500/15 text-purple-400 font-extrabold rounded-sm" title={endorsers.length > 0 ? `Endorsed by: ${endorsers.join(', ')}` : 'No endorsements yet'}>
                                                        {endorsers.length}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            if (onUpdateProfile && profile) {
                                                                const next = (profile.skills || []).filter(item => item !== s);
                                                                onUpdateProfile({ skills: next });
                                                                toast.success(`Removed offered skill: ${s}`);
                                                            }
                                                        }}
                                                        className="hover:text-red-400 transition-colors cursor-pointer text-xs font-bold leading-none ml-1 p-0.5"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })}
                                        {(profile?.skills || []).length === 0 && (
                                            <span className="text-[10px] text-zinc-600 italic">No offered skills configured.</span>
                                        )}
                                    </div>

                                    {/* Add Skill Form */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Type a skill you offer (e.g. Go, Docker)..."
                                            value={offeringInput}
                                            onChange={e => setOfferingInput(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    const val = offeringInput.trim();
                                                    if (val && profile && onUpdateProfile) {
                                                        const current = profile.skills || [];
                                                        if (!current.includes(val)) {
                                                            onUpdateProfile({ skills: [...current, val] });
                                                            setOfferingInput('');
                                                            toast.success(`Added offered skill: ${val}`);
                                                        } else {
                                                            toast.error('Skill parameter already attached.');
                                                        }
                                                    }
                                                }
                                            }}
                                            className="flex-1 bg-[#090915] border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 focus:border-purple-500/60 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => {
                                                const val = offeringInput.trim();
                                                if (val && profile && onUpdateProfile) {
                                                    const current = profile.skills || [];
                                                    if (!current.includes(val)) {
                                                        onUpdateProfile({ skills: [...current, val] });
                                                        setOfferingInput('');
                                                        toast.success(`Added offered skill: ${val}`);
                                                    } else {
                                                        toast.error('Skill parameter already attached.');
                                                    }
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase rounded-xl transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* DESIRED SKILLS PANEL */}
                                <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900 space-y-3 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono text-rose-400 uppercase font-bold tracking-wider">// 2. Skills You Look For in Collaborators</span>
                                        <span className="text-[9px] font-mono text-zinc-505">({(profile?.lookingForSkills || []).length} seeked)</span>
                                    </div>

                                    {/* Looking list */}
                                    <div className="flex flex-wrap gap-1.5 min-h-[40px] items-center">
                                        {(profile?.lookingForSkills || [])?.map?.((s: string) => (
                                            <span key={s} className="px-2.5 py-1 bg-rose-950/30 text-xs font-mono text-rose-300 rounded-lg border border-rose-500/15 flex items-center gap-1">
                                                {s}
                                                <button
                                                    onClick={() => {
                                                        if (onUpdateProfile && profile) {
                                                            const next = (profile.lookingForSkills || []).filter(item => item !== s);
                                                            onUpdateProfile({ lookingForSkills: next });
                                                            toast.success(`Removed sought skill: ${s}`);
                                                        }
                                                    }}
                                                    className="hover:text-red-400 transition-colors cursor-pointer text-xs font-bold leading-none ml-1 p-0.5"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        {(profile?.lookingForSkills || []).length === 0 && (
                                            <span className="text-[10px] text-zinc-600 italic">No seeking terms configured.</span>
                                        )}
                                    </div>

                                    {/* Add Looking For Form */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Type a skill you are seeking (e.g. Python, SQL)..."
                                            value={lookingInput}
                                            onChange={e => setLookingInput(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    const val = lookingInput.trim();
                                                    if (val && profile && onUpdateProfile) {
                                                        const current = profile.lookingForSkills || [];
                                                        if (!current.includes(val)) {
                                                            onUpdateProfile({ lookingForSkills: [...current, val] });
                                                            setLookingInput('');
                                                            toast.success(`Added sought skill: ${val}`);
                                                        } else {
                                                            toast.error('Seeking term already attached.');
                                                        }
                                                    }
                                                }
                                            }}
                                            className="flex-1 bg-[#090915] border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 focus:border-rose-500/60 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => {
                                                const val = lookingInput.trim();
                                                if (val && profile && onUpdateProfile) {
                                                    const current = profile.lookingForSkills || [];
                                                    if (!current.includes(val)) {
                                                        onUpdateProfile({ lookingForSkills: [...current, val] });
                                                        setLookingInput('');
                                                        toast.success(`Added sought skill: ${val}`);
                                                    } else {
                                                        toast.error('Seeking term already attached.');
                                                    }
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase rounded-xl transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dual Column Matchmaking System */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Collaborators List Column */}
                            <div className="lg:col-span-7 space-y-6">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-purple-400" />
                                    Suggested Collaborators
                                </h3>

                                <div className="space-y-4">
                                    {(networkProfiles || [])
                                        ?.map?.(p => ({
                                            profile: p,
                                            match: calculateCompatibility(profile, p)
                                        }))
                                        ?.sort?.((a, b) => {
                                            // Primary sorting combining proximity score and weighted endorsement score
                                            const scoreA = a.match.score + (a.match.weightedEndorsementScore || 0);
                                            const scoreB = b.match.score + (b.match.weightedEndorsementScore || 0);
                                            if (scoreB !== scoreA) {
                                                return scoreB - scoreA;
                                            }
                                            // Tie-breaker: pure weighted endorsement score
                                            return (b.match.weightedEndorsementScore || 0) - (a.match.weightedEndorsementScore || 0);
                                        })
                                        ?.map?.(({ profile: p, match }) => (
                                            <div 
                                                key={p.id}
                                                className="bg-[#0b0b18]/70 border-2 border-zinc-900 rounded-3xl p-6 relative overflow-hidden shadow-lg flex flex-col md:flex-row justify-between gap-6 hover:border-purple-500/20 transition-all"
                                            >
                                                <div className="flex-1 space-y-4">
                                                    {/* Node Header */}
                                                    <div className="flex items-center gap-4">
                                                        <img 
                                                            src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                                                            alt={p.username} 
                                                            className="w-12 h-12 rounded-full border border-rose-500/35 object-cover"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h4 className="font-mono text-sm font-black text-white hover:text-rose-455">@{p.username}</h4>
                                                                <span className="text-[9px] font-mono bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded uppercase font-black">{p.experienceLevel || 'Node Expert'}</span>
                                                                {(() => {
                                                                    const totalEndorsements = Object.values(p.skillEndorsements || {}).reduce((acc: number, curr: any) => acc + (curr?.length || 0), 0) as number;
                                                                    return totalEndorsements > 0 ? (
                                                                        <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-bold animate-pulse">
                                                                            ★ {totalEndorsements} Endorsement{totalEndorsements > 1 ? 's' : ''}
                                                                        </span>
                                                                    ) : null;
                                                                })()}
                                                            </div>
                                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Compatibility Diagnostic Complete</p>
                                                        </div>
                                                    </div>

                                                    {/* Compatibility reasons details */}
                                                    <div className="space-y-2 bg-black/40 p-4 border border-zinc-900 rounded-2xl">
                                                        <h5 className="text-[9px] font-mono text-zinc-500 tracking-wider font-extrabold flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                                                            Compatibility Log Reasonings
                                                        </h5>
                                                        <div className="space-y-1.5">
                                                            {(match?.reasons || [])?.map?.((r, i) => (
                                                                <p key={i} className="text-xs text-gray-300 font-mono flex items-start gap-1.5 leading-normal">
                                                                    <span className="text-zinc-650 font-bold">&gt;&gt;</span>
                                                                    {r}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Offers Seeks grid */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                        <div className="p-3 bg-rose-950/10 border border-rose-500/10 rounded-xl">
                                                            <div className="text-[8px] font-mono text-rose-400 uppercase font-black mb-1.5">// They offer you</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(match?.seeks || [])?.map?.(s => (
                                                                    <span key={s} className="px-2 py-0.5 bg-rose-500/10 text-[9px] font-mono text-rose-400 rounded-md">{s}</span>
                                                                ))}
                                                                {match.seeks.length === 0 && (
                                                                    <span className="text-[9px] text-zinc-600 italic">None specifically sought.</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="p-3 bg-purple-950/10 border border-purple-500/10 rounded-xl">
                                                            <div className="text-[8px] font-mono text-purple-400 uppercase font-black mb-1.5">// You offer them</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(match?.offers || [])?.map?.(s => (
                                                                    <span key={s} className="px-2 py-0.5 bg-purple-500/10 text-[9px] font-mono text-purple-400 rounded-md">{s}</span>
                                                                ))}
                                                                {match.offers.length === 0 && (
                                                                    <span className="text-[9px] text-zinc-600 italic">None specifically offered.</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                                                            <div className="text-[8px] font-mono text-zinc-500 uppercase font-black mb-1.5">// Shared interests</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(match?.shared || [])?.map?.(s => (
                                                                    <span key={s} className="px-2 py-0.5 bg-zinc-900 text-[9px] font-mono text-zinc-300 rounded-md">{s}</span>
                                                                ))}
                                                                {match.shared.length === 0 && (
                                                                    <span className="text-[9px] text-zinc-600 italic">No common stacks.</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Telemetry Score Display Row & Action button */}
                                                <div className="flex flex-col justify-center items-center p-6 bg-black/35 border border-zinc-800 rounded-3xl min-w-[200px] text-center gap-3">
                                                    <div className="relative flex items-center justify-center">
                                                        {/* Percentage ring */}
                                                        <svg className="w-20 h-20 transform -rotate-90">
                                                            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-900" />
                                                            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="213" strokeDashoffset={213 - (213 * match.score) / 100} className="text-rose-500 transition-all duration-500" />
                                                        </svg>
                                                        <span className="absolute text-sm font-mono font-black text-rose-450">{match.score}%</span>
                                                    </div>
                                                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">COLLABORATION PROXIMITY</div>

                                                    {match.weightedEndorsementScore > 0 && (
                                                        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-mono font-bold rounded-xl flex items-center gap-1.5 animate-pulse">
                                                            <span>★ ENDORSEMENT INDEX:</span>
                                                            <span className="font-extrabold text-[10px]">{match.weightedEndorsementScore}</span>
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            alert(`Collaboration request node pinged to @${p.username}! Custom team invitation has been queued.`);
                                                        }}
                                                        className="w-full px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase font-mono tracking-wider transition-all"
                                                    >
                                                        PITCH SQUAD COLLAB PING
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    {networkProfiles.length === 0 && (
                                        <div className="p-8 text-center bg-zinc-950/40 rounded-3xl border border-zinc-900 text-zinc-500 font-mono text-xs uppercase">
                                            No collaborative profiles registered in standard directory.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Suggested Projects Column */}
                            <div className="lg:col-span-5 space-y-6">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                                    <CodeIcon className="w-5 h-5 text-rose-400" />
                                    Suggested Matches: Projects
                                </h3>

                                <div className="space-y-4">
                                    {(() => {
                                        const recommended = ((projects || [])
                                            ?.map?.(proj => {
                                                const matchInfo = getProjectMatchScore(proj);
                                                return { project: proj, match: matchInfo };
                                            }) || [])
                                            ?.filter?.(item => item.match.score > 0)
                                            ?.sort?.((a, b) => b.match.score - a.match.score) || [];

                                        if (recommended.length === 0) {
                                            return (
                                                <div className="p-8 bg-[#0b0b18]/60 border-2 border-zinc-900 rounded-3xl text-center space-y-3">
                                                    <CodeIcon className="w-8 h-8 text-zinc-700 mx-auto animate-pulse" />
                                                    <p className="text-zinc-500 text-xs font-mono uppercase font-black">No Skill-Aligned Projects</p>
                                                    <p className="text-[10px] text-zinc-650 leading-relaxed font-sans">
                                                        Add more skill proficiencies to your offered list to automatically unlock compatible open source and internal workspace projects.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (recommended || [])?.map?.(({ project: proj, match }) => (
                                            <div 
                                                key={proj.id} 
                                                className="bg-[#0b0b18]/70 border-2 border-zinc-900 rounded-2xl p-5 hover:border-rose-500/30 transition-all flex justify-between gap-4 items-center relative overflow-hidden"
                                            >
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[8px] font-mono rounded font-black uppercase">
                                                            Project Match
                                                        </span>
                                                        <span className="text-[8px] font-mono bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-850 font-black uppercase">
                                                            {proj.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-xs font-black text-white font-sans uppercase tracking-tight">
                                                        {proj.title}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                                                        {proj.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {(proj.tags || [])?.map?.(tag => {
                                                            const isMatched = match.matchedTags.some(mt => mt.toLowerCase() === tag.toLowerCase());
                                                            return (
                                                                <span 
                                                                    key={tag} 
                                                                    className={`px-1.5 py-0.5 text-[8px] font-mono rounded ${
                                                                        isMatched 
                                                                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black' 
                                                                            : 'bg-zinc-900 text-zinc-600'
                                                                    }`}
                                                                >
                                                                    {tag}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="text-center flex-shrink-0 bg-black/45 border border-zinc-800/80 p-3 rounded-xl min-w-[70px]">
                                                    <span className="text-[8px] text-zinc-500 font-mono block font-bold">Match</span>
                                                    <span className="text-xs font-mono font-black text-rose-400">{match.score}%</span>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : viewMode === 'FORECAST' ? (
                    /* FORECAST VIEW (PREDICTIVE TIMELINE) */
                    <div className="space-y-8 animate-in fade-in duration-500 relative z-10 max-w-7xl mx-auto pb-12">
                        {/* 1. Header Hero Banner */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0c0c1e] p-8 border-4 border-cyan-900/40 rounded-[2.5rem] shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,_rgba(6,182,212,0.15)_0%,_transparent_70%)] pointer-events-none" />
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-cyan-650/10 border-4 border-cyan-500 rounded-3xl flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse">
                                    <ActivityIcon className="w-9 h-9 text-cyan-400" />
                                </div>
                                <div>
                                    <h4 className="font-mono text-cyan-400 text-[10px] uppercase tracking-[0.3em] font-black">// CHRONOS FORECAST ENGINE</h4>
                                    <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-tight">Predictive Project Timeline</h3>
                                    <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed font-sans">
                                        Simulate milestones using historical velocity paired with multi-nodal Conjunction metrics. Allocate active squad specialists and raw Shards to compress delivery times.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 bg-black/40 p-4 rounded-2xl border border-zinc-800">
                                <div className="text-center px-4 border-r border-zinc-800">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block font-bold">HISTORICAL VELOCITY</span>
                                    <span className="text-lg font-mono font-black text-cyan-400">{velocityMetrics.avgDays.toFixed(2)}d</span>
                                    <span className="text-[8px] text-zinc-600 block italic font-mono">/ milestone</span>
                                </div>
                                <div className="text-center px-4 border-r border-zinc-800">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block font-bold">DRIFT CLASSIFICATION</span>
                                    <span className="text-xs font-mono font-black text-amber-500 block mt-1">{velocityMetrics.velocityLabel}</span>
                                </div>
                                <div className="text-center px-4">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block font-bold">ACCELERATOR SPEED</span>
                                    <span className="text-lg font-mono font-black text-emerald-450">{baseSpeedMultiplier.toFixed(2)}x</span>
                                    <span className="text-[8px] text-zinc-600 block font-mono">conjunction factor</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Global Resources & Automated Optimizers Panel */}
                        <div className="bg-[#0b0b18]/90 border-2 border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h4 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">// CHRONOS RESOURCE COUPLING</h4>
                                    <h3 className="text-xl font-black text-white uppercase font-sans">Matrix Optimizations & Budgets</h3>
                                    <p className="text-[10px] text-zinc-400 mt-1 font-sans">
                                        Distribute your {progress?.shards || 0} active Conjunction Shards or select an automated load balancing model to align timeline velocities.
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleOptimize('MIN_TIME')}
                                        className="px-4 py-2 bg-cyan-950/45 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_3px_0_0_#0891b2] font-mono"
                                    >
                                        Optimize (Min-Time Greedy)
                                    </button>
                                    <button
                                        onClick={() => handleOptimize('BALANCED')}
                                        className="px-4 py-2 bg-zinc-900 border border-zinc-750 text-zinc-300 hover:text-white hover:border-zinc-550 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all font-mono"
                                    >
                                        Balanced Distribution
                                    </button>
                                    <button
                                        onClick={handleCommitProjection}
                                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-md font-mono"
                                    >
                                        Record Forecast Milestone
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-900">
                                <div className="bg-black/40 p-4 rounded-2xl border border-zinc-900">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block font-bold">CONJUNCTION LEVEL</span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-2xl font-black text-white font-mono">{progress?.level || 1}</span>
                                        <span className="text-[9px] text-purple-400 font-mono">[{((progress?.level || 1) * 12)}% Base speed]</span>
                                    </div>
                                </div>
                                <div className="bg-black/40 p-4 rounded-2xl border border-zinc-900">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block font-bold">GLOBAL ADRENALINE FLOW</span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-2xl font-black text-rose-500 font-mono">{progress?.globalAdrenaline || 50}%</span>
                                        <span className="text-[9px] text-rose-400 font-mono">[{(((progress?.globalAdrenaline || 50) - 50) / 1.5).toFixed(1)}% Stride boost]</span>
                                    </div>
                                </div>
                                <div className="bg-black/40 p-4 rounded-2xl border border-zinc-900">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block font-bold">TOTAL SHARDS AVAILABLE</span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-2xl font-black text-cyan-400 font-mono">{progress?.shards || 0}</span>
                                        <span className="text-xs text-zinc-500 font-mono">remaining</span>
                                    </div>
                                </div>
                                <div className="bg-black/40 p-4 rounded-2xl border border-zinc-900">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block font-bold">ALLOCATED SHARDS</span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-2xl font-black text-yellow-500 font-mono">
                                            {Object.values(projectShards).reduce((sum, v) => sum + v, 0)}
                                        </span>
                                        <span className="text-xs text-zinc-500 font-mono font-bold">
                                            / {progress?.shards || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Main Forecast Lanes */}
                        <div className="space-y-6">
                            <h3 className="font-comic-header text-2xl text-white uppercase italic tracking-tight">// ACTIVE SIMULATOR LANES</h3>
                            
                            {(safeProjects || [])?.map?.(project => {
                                const forecast = calculateProjectForecast(project);
                                const totalTasksCount = project.tasks?.length || 0;
                                const remainingTasksCount = forecast.remainingTasks.length;
                                const completedTasksCount = totalTasksCount - remainingTasksCount;
                                const baseDurationDays = remainingTasksCount * (velocityMetrics.avgDays * 1.5);
                                const daysSaved = Math.max(0, baseDurationDays - forecast.duration);
                                
                                const boost = projectBoosts[project.id] || 0;
                                const shardsAlloc = projectShards[project.id] || 0;

                                return (
                                    <div key={project.id} className="bg-[#090915] border-2 border-zinc-900 rounded-3xl p-6 hover:border-cyan-900/30 transition-all relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_100%_0%,_rgba(6,182,212,0.03)_0%,_transparent_70%)] pointer-events-none" />
                                        
                                        {/* Lane Header */}
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-zinc-900">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[8px] font-mono text-zinc-500 uppercase font-black">CHRONOS_NODE: {project.id}</span>
                                                    <span className="text-zinc-750 text-xs font-black">|</span>
                                                    <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                                                        {(FINTECH_AUTHORITIES || [])?.find?.(a => a && a.id === project.authorityId)?.name || 'LOCAL AUTHORITY'}
                                                    </span>
                                                </div>
                                                <h3 className="font-comic-header text-2xl text-white uppercase italic">{project.title}</h3>
                                                <p className="text-[10px] text-zinc-500 italic mt-0.5 max-w-xl font-sans">{project.description}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                <div className="bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-900 text-center font-mono">
                                                    <span className="text-[7px] text-zinc-550 uppercase block font-bold">TASKS</span>
                                                    <span className="text-xs font-black text-white">{completedTasksCount}/{totalTasksCount}</span>
                                                </div>
                                                <div className="bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-900 text-center font-mono">
                                                    <span className="text-[7px] text-zinc-550 uppercase block font-bold">BASE DELIVERY</span>
                                                    <span className="text-xs font-black text-zinc-400">{baseDurationDays.toFixed(1)}d</span>
                                                </div>
                                                <div className="bg-cyan-950/30 px-3.5 py-1.5 rounded-xl border border-cyan-950 text-center font-mono">
                                                    <span className="text-[7px] text-cyan-400 uppercase block font-bold">COMPRESSED</span>
                                                    <span className="text-xs font-black text-cyan-400">{forecast.duration.toFixed(1)}d</span>
                                                </div>
                                                {daysSaved > 0 && (
                                                    <div className="bg-emerald-950/20 px-3.5 py-1.5 rounded-xl border border-emerald-900/30 text-center font-mono">
                                                        <span className="text-[7px] text-emerald-450 uppercase block font-bold">DAYS SAVED</span>
                                                        <span className="text-xs font-black text-emerald-450">-{daysSaved.toFixed(1)}d</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Visual Timeline SVGs / Horizontal Tracks */}
                                        <div className="my-8 relative">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.01)_0%,_transparent_100%)] pointer-events-none" />
                                            
                                            {/* Baseline track line */}
                                            <div className="h-2 bg-zinc-950 rounded-full border border-zinc-900 w-full relative overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500" 
                                                    style={{ width: `${totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0}%` }}
                                                />
                                            </div>

                                            {/* Milestone node points */}
                                            <div className="relative mt-6 flex justify-between items-center text-[9px] font-mono">
                                                <div className="text-left flex flex-col">
                                                    <span className="text-zinc-650 block text-[7px] uppercase tracking-wider font-bold">T-0: PRESENT</span>
                                                    <span className="text-zinc-450 font-bold">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 border border-black shadow-[0_0_10px_rgba(6,182,212,0.6)] absolute -top-[21px] left-0 transform -translate-x-1/2" />
                                                </div>

                                                {/* Checkpoint Nodes mapped along the remaining track */}
                                                {(forecast?.remainingTasks || [])?.map?.((task, idx) => {
                                                    const percent = ((idx + 1) / remainingTasksCount) * 100;
                                                    const taskDuration = (forecast.duration / remainingTasksCount) * (idx + 1);
                                                    const taskDate = new Date();
                                                    taskDate.setTime(Date.now() + taskDuration * 24 * 60 * 60 * 1000);
                                                    const formattedDate = taskDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                                                    return (
                                                        <div 
                                                            key={task.id} 
                                                            className="absolute text-center flex flex-col items-center group/node"
                                                            style={{ left: `${15 + (percent * 0.7)}%` }}
                                                        >
                                                            <div className="w-3 h-3 rounded-full bg-zinc-955 border-2 border-cyan-500 group-hover/node:bg-cyan-550 group-hover/node:shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all absolute -top-[21px] transform -translate-x-1/2 cursor-pointer" />
                                                            <span className="text-zinc-550 group-hover/node:text-cyan-400 transition-colors uppercase block font-bold truncate max-w-[80px] text-[7px] mb-0.5">{task.text}</span>
                                                            <span className="text-zinc-350 block font-bold text-[8px]">{formattedDate}</span>
                                                            
                                                            {/* Custom High Fidelity Tooltip */}
                                                            <div className="absolute bottom-8 scale-0 group-hover/node:scale-100 transition-all bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-left shadow-2xl z-30 min-w-[150px] pointer-events-none">
                                                                <div className="text-[7px] text-cyan-400 font-bold font-mono tracking-widest uppercase mb-1">// CHECKPOINT NODE</div>
                                                                <div className="text-xs text-white font-sans font-bold leading-tight mb-1 truncate">{task.text}</div>
                                                                <div className="text-[8px] text-zinc-500 font-mono">Projected Delivery: {taskDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {remainingTasksCount === 0 && (
                                                    <div className="w-full text-center text-zinc-650 italic text-[10px] py-1.5 bg-zinc-950/20 border border-zinc-900 rounded-xl font-sans">
                                                        Node fully compiled and integrated. Conjunction loop closed.
                                                    </div>
                                                )}

                                                <div className="text-right flex flex-col">
                                                    <span className="text-cyan-500 block font-bold uppercase tracking-wider text-[7px]">PROJECTED COMPLETION</span>
                                                    <span className="text-cyan-450 font-black text-[11px]">{remainingTasksCount > 0 ? forecast.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'COMPLETE'}</span>
                                                    {remainingTasksCount > 0 && (
                                                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-black shadow-[0_0_12px_rgba(16,185,129,0.8)] absolute -top-[23px] right-0 transform translate-x-1/2" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resource Allocation Slider & Controls */}
                                        {remainingTasksCount > 0 && (
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5 border-t border-zinc-900/60 bg-black/10 p-5 rounded-2xl border border-zinc-900/30">
                                                {/* Local Adrenaline surge */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                                        <span className="text-zinc-400 font-bold uppercase flex items-center gap-1">
                                                            <GaugeIcon className="w-3.5 h-3.5 text-rose-500" />
                                                            Adrenaline Surge Rate
                                                        </span>
                                                        <span className="text-rose-450 font-black">{boost}%</span>
                                                    </div>
                                                    <input 
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={boost}
                                                        onChange={e => setProjectBoosts(prev => ({ ...prev, [project.id]: Number(e.target.value) }))}
                                                        className="w-full accent-rose-500 bg-zinc-900 h-1.5 rounded-lg cursor-pointer"
                                                    />
                                                    <div className="text-[8px] text-zinc-550 font-mono italic">
                                                        Increases local lane throughput by up to 70%.
                                                    </div>
                                                </div>

                                                {/* Shard Compression allocation */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                                        <span className="text-zinc-400 font-bold uppercase flex items-center gap-1">
                                                            <ZapIcon className="w-3.5 h-3.5 text-cyan-400" />
                                                            Conjunction Shard Compression
                                                        </span>
                                                        <span className="text-cyan-450 font-black">{shardsAlloc} Shards</span>
                                                    </div>
                                                    <input 
                                                        type="range"
                                                        min={0}
                                                        max={Math.max(1000, progress?.shards || 0)}
                                                        value={shardsAlloc}
                                                        onChange={e => handleShardChange(project.id, Number(e.target.value))}
                                                        className="w-full accent-cyan-500 bg-zinc-900 h-1.5 rounded-lg cursor-pointer"
                                                    />
                                                    <div className="text-[8px] text-zinc-550 font-mono italic flex justify-between">
                                                        <span>Compresses delivery times by up to 120%.</span>
                                                        <span className="text-zinc-400 font-bold">Max: {progress?.shards || 0} left</span>
                                                    </div>
                                                </div>

                                                {/* Specialist staffing select */}
                                                <div className="space-y-2 font-mono">
                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                                                        <UserIcon className="w-3.5 h-3.5 text-purple-500" />
                                                        Assign Squad Specialist
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5 min-h-[36px] items-center">
                                                        {(agents || [])?.map?.(agent => {
                                                            const isAssigned = agentAssignments[agent.id] === project.id;
                                                            return (
                                                                <button
                                                                    key={agent.id}
                                                                    onClick={() => {
                                                                        setAgentAssignments(prev => {
                                                                            if (prev[agent.id] === project.id) {
                                                                                const next = { ...prev };
                                                                                delete next[agent.id];
                                                                                return next;
                                                                            } else {
                                                                                return { ...prev, [agent.id]: project.id };
                                                                            }
                                                                        });
                                                                    }}
                                                                    className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                                                                        isAssigned 
                                                                            ? 'bg-purple-950/40 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]' 
                                                                            : 'bg-zinc-950 border-zinc-800 text-zinc-650 hover:text-zinc-300'
                                                                    }`}
                                                                >
                                                                    @{agent.name.split(' ')[0]}
                                                                </button>
                                                            );
                                                        })}
                                                        {agents.length === 0 && (
                                                            <span className="text-[8px] text-zinc-700 italic">No squad members available. Go to "My Squad" to manifest agents.</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[8px] text-zinc-550 italic">
                                                        Each assigned squad specialist increases development velocity by 35%.
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : viewMode === 'WALLET' ? (
                    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300 relative z-10 font-sans">
                        {/* Header Banner */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-zinc-950 to-zinc-900 p-8 border-4 border-emerald-500 rounded-[2.5rem] shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,_rgba(16,185,129,0.1)_0%,_transparent_70%)] pointer-events-none" />
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-emerald-500/10 border-4 border-emerald-500 rounded-3xl flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-pulse">
                                    <ZapIcon className="w-9 h-9 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="font-mono text-emerald-400 text-[10px] uppercase tracking-[0.3em] font-black">// HIGH-VELOCITY LIQUIDITY MATRIX</h4>
                                    <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-tight">Agentic Wealth Wallet & Solver</h3>
                                    <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed font-sans">
                                        Scan distributed assets, construct high-integrity solver strategies, and execute buy, sell, or trade actions. Driven by agentic workflows and bounded by divine sovereignty.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 bg-black/60 p-4 rounded-2xl border border-zinc-800">
                                <div className="text-center px-4 border-r border-zinc-800">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block font-bold">TOTAL PORTFOLIO NET WORTH</span>
                                    <span className="text-lg font-mono font-black text-emerald-400 block mt-1">
                                        ${(
                                            walletAetherUSD +
                                            Object.entries(walletCrypto).reduce((sum, [k, v]) => sum + v * (ASSET_PRICES[k] || 0), 0) +
                                            Object.entries(walletStocks).reduce((sum, [k, v]) => sum + v * (ASSET_PRICES[k] || 0), 0)
                                        ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="text-center px-4">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block font-bold">AVAILABLE LIQUIDITY</span>
                                    <span className="text-sm font-mono font-black text-zinc-200 block mt-1">
                                        ${walletAetherUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} aetherUSD
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Middle section: Asset Scanning and Assets Table */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Left side: Assets scanner & inventory (7 Columns) */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="bg-[#0b0b18]/80 border-2 border-zinc-850 rounded-3xl p-6 shadow-xl space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">// BIOMETRIC INTEGRITY</h4>
                                            <h3 className="text-xl font-black text-white uppercase font-sans">Distributed Asset Registry</h3>
                                        </div>
                                        <button 
                                            onClick={handleScanAssets}
                                            disabled={isScanningAssets}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black text-[10px] font-black uppercase rounded-lg tracking-wider transition-all duration-200 flex items-center gap-1.5"
                                        >
                                            {isScanningAssets ? 'Scanning...' : 'Scan Assets 📡'}
                                        </button>
                                    </div>

                                    {/* Scan Progress Bar & logs */}
                                    {isScanningAssets || scanLogs.length > 0 ? (
                                        <div className="space-y-3 bg-black/60 p-4 rounded-2xl border border-zinc-900 font-mono text-[10px]">
                                            <div className="flex justify-between items-center text-[9px] font-bold text-emerald-400">
                                                <span>SCAN PROGRESS</span>
                                                <span>{scanProgress}%</span>
                                            </div>
                                            <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                                <div 
                                                    className="h-full bg-emerald-500 transition-all duration-300"
                                                    style={{ width: `${scanProgress}%` }}
                                                />
                                            </div>
                                            <div className="space-y-1 text-zinc-400 max-h-24 overflow-y-auto custom-scrollbar">
                                                {scanLogs.map((log, i) => (
                                                    <div key={i}>{log}</div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Assets tables Grid (Crypto & Stocks) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        
                                        {/* Cryptocurrencies */}
                                        <div className="space-y-3">
                                            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest font-mono block">🪙 Cryptocurrencies</span>
                                            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                                                {Object.entries(walletCrypto).map(([ticker, amount]) => {
                                                    const price = ASSET_PRICES[ticker] || 0;
                                                    const value = amount * price;
                                                    return (
                                                        <div key={ticker} className="p-3 bg-black/40 border border-zinc-900 rounded-xl flex justify-between items-center text-xs">
                                                            <div>
                                                                <span className="font-mono font-black text-white block">{ticker}</span>
                                                                <span className="text-[10px] text-zinc-500 font-mono">{amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} units</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="font-mono text-emerald-400 block">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                <span className="text-[9px] text-zinc-650 font-mono">@ ${price.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Stocks & Bonds */}
                                        <div className="space-y-3">
                                            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest font-mono block">📈 Stocks & Bonds</span>
                                            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                                                {Object.entries(walletStocks).map(([ticker, amount]) => {
                                                    const price = ASSET_PRICES[ticker] || 0;
                                                    const value = amount * price;
                                                    return (
                                                        <div key={ticker} className="p-3 bg-black/40 border border-zinc-900 rounded-xl flex justify-between items-center text-xs">
                                                            <div>
                                                                <span className="font-mono font-black text-white block">{ticker === 'US_BONDS' ? 'US Treasury Bond' : ticker}</span>
                                                                <span className="text-[10px] text-zinc-500 font-mono">{amount.toLocaleString()} shares</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="font-mono text-emerald-400 block">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                <span className="text-[9px] text-zinc-650 font-mono">@ ${price.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Trading History Ledger Section */}
                                <div className="bg-[#0b0b18]/80 border-2 border-zinc-850 rounded-3xl p-6 shadow-xl space-y-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                                        <div>
                                            <span className="text-[9px] text-emerald-400 uppercase font-black font-mono tracking-widest block">// TRANSACTION LEDGER RECORD</span>
                                            <h3 className="text-lg font-black text-white uppercase font-sans">Trading History</h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-mono">
                                            <span className="text-zinc-500">Success Rate:</span>
                                            <span className="text-emerald-400 font-bold">
                                                {walletTxHistory.length > 0
                                                    ? `${Math.round((walletTxHistory.filter(t => (t.status || 'COMPLETED') === 'COMPLETED').length / walletTxHistory.length) * 100)}%`
                                                    : '100%'}
                                            </span>
                                            <span className="text-zinc-700">|</span>
                                            <span className="text-zinc-400 font-bold">{walletTxHistory.length} Total</span>
                                        </div>
                                    </div>

                                    {/* Filters Header Container */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                        {/* Search Filter */}
                                        <div className="md:col-span-5 relative">
                                            <LucideSearch className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                            <input 
                                                type="text"
                                                value={historySearchQuery}
                                                onChange={e => setHistorySearchQuery(e.target.value)}
                                                placeholder="Search by asset or type..."
                                                className="w-full bg-black/60 border border-zinc-850 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                                            />
                                        </div>

                                        {/* Type Pill Filters */}
                                        <div className="md:col-span-4 flex items-center bg-black/60 border border-zinc-850 rounded-xl p-0.5 font-mono">
                                            {(['ALL', 'BUY', 'SELL', 'SWAP'] as const).map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setHistoryFilterType(type)}
                                                    className={`flex-1 py-1 text-[9px] font-black rounded-lg transition-all ${
                                                        historyFilterType === type
                                                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40'
                                                            : 'text-zinc-500 hover:text-zinc-300'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Status Filter */}
                                        <div className="md:col-span-3 flex items-center bg-black/60 border border-zinc-850 rounded-xl p-0.5 font-mono">
                                            {(['ALL', 'COMPLETED', 'FAILED'] as const).map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setHistoryFilterStatus(status)}
                                                    className={`flex-1 py-1 text-[8px] font-black rounded-lg transition-all uppercase ${
                                                        historyFilterStatus === status
                                                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40'
                                                            : 'text-zinc-500 hover:text-zinc-300'
                                                    }`}
                                                >
                                                    {status === 'ALL' ? 'STATUS: ALL' : status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Transaction Ledger Table List */}
                                    <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar font-mono text-[10px]">
                                        {filteredTxs.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 text-center bg-black/20 border border-dashed border-zinc-900 rounded-2xl">
                                                <LucideAlertCircle className="w-8 h-8 text-zinc-650 mb-2" />
                                                <p className="text-zinc-500 italic">No transactions match your filtering parameters.</p>
                                            </div>
                                        ) : (
                                            filteredTxs.map(tx => {
                                                const txStatus = tx.status || 'COMPLETED';
                                                return (
                                                    <div 
                                                        key={tx.id} 
                                                        className={`p-3 bg-black/40 border border-zinc-900/60 rounded-xl hover:border-zinc-800 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 ${
                                                            txStatus === 'FAILED' ? 'opacity-70' : ''
                                                        }`}
                                                    >
                                                        {/* Left side: Type with arrow + asset details */}
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-xl shrink-0 border ${
                                                                txStatus === 'FAILED' ? 'bg-zinc-950 border-zinc-800 text-zinc-600' :
                                                                tx.type === 'BUY' ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-400' : 
                                                                tx.type === 'SELL' ? 'bg-rose-950/40 border-rose-900/40 text-rose-400' : 
                                                                'bg-blue-950/40 border-blue-900/40 text-blue-400'
                                                            }`}>
                                                                {tx.type === 'BUY' ? (
                                                                    <LucideArrowUpRight className="w-4 h-4" />
                                                                ) : tx.type === 'SELL' ? (
                                                                    <LucideArrowDownLeft className="w-4 h-4" />
                                                                ) : (
                                                                    <LucideRefreshCw className="w-4 h-4" />
                                                                )}
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white font-bold text-xs uppercase">{tx.asset}</span>
                                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                                                        txStatus === 'FAILED' ? 'bg-rose-950/30 text-rose-400 border-rose-900/40' :
                                                                        'bg-emerald-950/30 text-emerald-400 border-emerald-900/40'
                                                                    }`}>
                                                                        {txStatus}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] mt-0.5">
                                                                    <span>{new Date(tx.timestamp).toLocaleDateString(undefined, { dateStyle: 'short' })}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(tx.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right side: Amount and Cost breakdown */}
                                                        <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col justify-between sm:justify-start items-center sm:items-end border-t sm:border-t-0 border-zinc-900 pt-2.5 sm:pt-0">
                                                            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                                                                <span className="text-zinc-200 font-bold block">
                                                                    {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} units
                                                                </span>
                                                                <span className="text-zinc-500 text-[9px] block">
                                                                    @ ${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            <div className="mt-0.5 sm:mt-1">
                                                                <span className={`font-black text-xs ${
                                                                    txStatus === 'FAILED' ? 'text-zinc-600 line-through' :
                                                                    tx.type === 'BUY' ? 'text-emerald-400' : 
                                                                    tx.type === 'SELL' ? 'text-rose-400' : 'text-blue-400'
                                                                }`}>
                                                                    ${tx.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Error Alert Info for failures */}
                                                        {txStatus === 'FAILED' && tx.reason && (
                                                            <div className="w-full bg-rose-950/15 border border-rose-900/30 rounded-lg p-2 mt-1.5 flex items-center gap-2 text-rose-400 text-[9px]">
                                                                <LucideAlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                                <span>Error Reason: {tx.reason}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Ledger Footer */}
                                    <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 border-t border-zinc-900 pt-3">
                                        <span>SYSTEM LEDGER INDEX SECURED BY PARITY CHECKSUMS</span>
                                        <span>Showing {filteredTxs.length} of {walletTxHistory.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right side: Agentic Solver Orchestrator (5 Columns) */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="bg-[#0b0b18]/80 border-2 border-zinc-850 rounded-3xl p-6 shadow-xl space-y-5">
                                    <div>
                                        <h4 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">// COGNITIVE OPTIMIZER</h4>
                                        <h3 className="text-lg font-black text-white uppercase font-sans">Solver Agent Core</h3>
                                        <p className="text-[10px] text-zinc-400 mt-1">
                                            Select an agentic strategy, describe your investment objectives, and run the automated solver to optimize yield anomalies.
                                        </p>
                                    </div>

                                    {/* Strategy Select */}
                                    <div className="space-y-1.5 text-xs">
                                        <label className="text-[8px] text-zinc-500 uppercase font-black font-mono tracking-widest">Select Solver Logic Strategy</label>
                                        <div className="grid grid-cols-2 gap-2 font-mono">
                                            {(['ARBITRAGE', 'YIELD', 'REBALANCE', 'HEDGE'] as const).map(strat => (
                                                <button 
                                                    key={strat}
                                                    onClick={() => setSolverStrategy(strat)}
                                                    className={`py-1.5 px-2 rounded border uppercase text-[9px] font-black tracking-wider text-center transition-all ${
                                                        solverStrategy === strat 
                                                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                                                        : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300'
                                                    }`}
                                                >
                                                    {strat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Task / Objectives Text Area */}
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] text-zinc-500 uppercase font-black font-mono tracking-widest block">Investment Intent / Objective Description</label>
                                        <textarea 
                                            value={solverTask}
                                            onChange={e => setSolverTask(e.target.value)}
                                            rows={2}
                                            placeholder="e.g. Maximize yields using liquid pools, hedging TSLA with NVDA shares."
                                            className="w-full bg-black border border-zinc-850 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <button 
                                        onClick={handleRunAgenticSolver}
                                        disabled={isSolverRunning || !solverTask.trim()}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-black uppercase text-xs rounded-xl tracking-wider transition-all duration-200 shadow-md shadow-emerald-900/30"
                                    >
                                        {isSolverRunning ? 'Running AI Engine Orchestrator...' : 'Deploy Agentic Solver ⚡'}
                                    </button>

                                    {/* Solver steps timeline & logs */}
                                    {(isSolverRunning || solverLogs.length > 0) && (
                                        <div className="space-y-4">
                                            {/* Solver steps */}
                                            <div className="space-y-2">
                                                <span className="text-[8px] text-zinc-500 uppercase font-black font-mono tracking-widest block">// STEP-BY-STEP FLOW ANALYSIS</span>
                                                <div className="space-y-1.5 font-mono text-[9px]">
                                                    {solverSteps.map((step, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <span className={
                                                                step.status === 'completed' ? 'text-emerald-400' : 
                                                                step.status === 'running' ? 'text-amber-500 animate-pulse' : 
                                                                'text-zinc-700'
                                                            }>
                                                                {step.status === 'completed' ? '✓' : step.status === 'running' ? '●' : '○'}
                                                            </span>
                                                            <div className="flex-1">
                                                                <span className="font-bold text-zinc-300">{step.title}</span>
                                                                <span className="text-zinc-650 block text-[8px]">{step.details}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Solver logs terminal */}
                                            <div className="space-y-1.5">
                                                <span className="text-[8px] text-zinc-500 uppercase font-black font-mono tracking-widest block">// COGNITIVE SOLVER EVENT LOG</span>
                                                <div className="bg-black border border-zinc-900 p-3 rounded-2xl h-36 overflow-y-auto font-mono text-[9px] space-y-1.5 text-zinc-400 custom-scrollbar">
                                                    {solverLogs.map((log, index) => {
                                                        let color = 'text-zinc-400';
                                                        if (log.includes('[SOLVER SUCCESS]')) color = 'text-emerald-400 font-bold';
                                                        else if (log.includes('[SOLVER]')) color = 'text-zinc-500';
                                                        return (
                                                            <div key={index} className={`leading-normal ${color}`}>
                                                                {log}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Proposed Optimized Trades (If found) */}
                                            {solverSolutionFound && optimizedTrades.length > 0 && (
                                                <div className="bg-zinc-950 p-4 border border-emerald-500/30 rounded-2xl space-y-3">
                                                    <span className="text-[9px] text-emerald-400 font-extrabold uppercase font-mono block tracking-wider animate-pulse">✓ PROPOSED SOLVER RESOLUTION PATH</span>
                                                    <div className="space-y-2">
                                                        {optimizedTrades.map((trade, idx) => (
                                                            <div key={idx} className="flex justify-between items-center text-[10px] font-mono p-2 bg-black/60 rounded-xl border border-zinc-900">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                                                                        trade.type === 'BUY' ? 'bg-emerald-950 text-emerald-400' : 
                                                                        trade.type === 'SELL' ? 'bg-rose-950 text-rose-400' : 
                                                                        'bg-blue-950 text-blue-400'
                                                                    }`}>
                                                                        {trade.type}
                                                                    </span>
                                                                    <span className="text-zinc-200">{trade.amount} {trade.asset}</span>
                                                                    {trade.type === 'SWAP' && <span className="text-zinc-550">➔ {trade.toAsset}</span>}
                                                                </div>
                                                                <div className="text-right text-[9px]">
                                                                    <span className="text-zinc-500 block">Est: ${trade.price.toLocaleString()}</span>
                                                                    {trade.estProfit > 0 && (
                                                                        <span className="text-emerald-400 font-bold block">Profit: +${trade.estProfit}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button 
                                                        onClick={handleExecuteSolverTrades}
                                                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        Commence Execution ⚡
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Manual Trade Desk Section */}
                                <div className="bg-[#0b0b18]/80 border-2 border-zinc-850 rounded-3xl p-6 shadow-xl space-y-4">
                                    <h3 className="text-xs font-mono font-black text-white uppercase tracking-widest">// MANUAL TRANSACTION BLOCK</h3>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <label className="text-[8px] text-zinc-500 uppercase font-black font-mono block mb-1">Action</label>
                                            <div className="flex bg-black border border-zinc-900 rounded-lg p-0.5 font-mono">
                                                <button 
                                                    onClick={() => setTradeAction('BUY')}
                                                    className={`flex-1 py-1 rounded-md text-[9px] font-black uppercase ${tradeAction === 'BUY' ? 'bg-emerald-600 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                >
                                                    BUY
                                                </button>
                                                <button 
                                                    onClick={() => setTradeAction('SELL')}
                                                    className={`flex-1 py-1 rounded-md text-[9px] font-black uppercase ${tradeAction === 'SELL' ? 'bg-rose-600 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                >
                                                    SELL
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[8px] text-zinc-500 uppercase font-black font-mono block mb-1">Asset Type</label>
                                            <div className="flex bg-black border border-zinc-900 rounded-lg p-0.5 font-mono">
                                                <button 
                                                    onClick={() => {
                                                        setTradeAssetType('CRYPTO');
                                                        setTradeAsset('BTC');
                                                    }}
                                                    className={`flex-1 py-1 rounded-md text-[9px] font-black uppercase ${tradeAssetType === 'CRYPTO' ? 'bg-zinc-800 text-white font-extrabold' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                >
                                                    CRYPTO
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setTradeAssetType('STOCK');
                                                        setTradeAsset('TSLA');
                                                    }}
                                                    className={`flex-1 py-1 rounded-md text-[9px] font-black uppercase ${tradeAssetType === 'STOCK' ? 'bg-zinc-800 text-white font-extrabold' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                >
                                                    STOCK
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                                        <div>
                                            <label className="text-[8px] text-zinc-500 uppercase font-black block mb-1">Choose Asset</label>
                                            <select 
                                                value={tradeAsset}
                                                onChange={e => setTradeAsset(e.target.value)}
                                                className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white outline-none focus:border-emerald-500 text-xs cursor-pointer"
                                            >
                                                {tradeAssetType === 'CRYPTO' ? (
                                                    Object.keys(walletCrypto).map(k => (
                                                        <option key={k} value={k}>{k} (${ASSET_PRICES[k]})</option>
                                                    ))
                                                ) : (
                                                    Object.keys(walletStocks).map(k => (
                                                        <option key={k} value={k}>{k === 'US_BONDS' ? 'US Treasury Bond' : k} (${ASSET_PRICES[k]})</option>
                                                    ))
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[8px] text-zinc-500 uppercase font-black block mb-1">Quantity</label>
                                            <input 
                                                value={tradeAmount}
                                                onChange={e => setTradeAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white outline-none focus:border-emerald-500 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => {
                                            handleExecuteManualTrade();
                                            setTradeAmount('');
                                        }}
                                        className={`w-full py-2.5 font-black uppercase text-[10px] tracking-wider rounded-xl transition-all ${
                                            tradeAction === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-black' : 'bg-rose-600 hover:bg-rose-500 text-black'
                                        }`}
                                    >
                                        Execute Manual Order ⚡
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* SOVEREIGNTY LAWS COMPLIANCE AND ENFORCEMENT VIEW */
                    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300 relative z-10">
                        {/* Header Banner */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#161007] p-8 border-4 border-amber-500 rounded-[2.5rem] shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,_rgba(245,158,11,0.15)_0%,_transparent_70%)] pointer-events-none" />
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-amber-500/10 border-4 border-amber-500 rounded-3xl flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-pulse">
                                    <ShieldIcon className="w-9 h-9 text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="font-mono text-amber-500 text-[10px] uppercase tracking-[0.3em] font-black">// ABSOLUTE IMMUTABILITY CODES</h4>
                                    <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-tight">Sovereignty Enforcement Registry</h3>
                                    <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed font-sans">
                                        These sovereign laws are fused in the mathematical code of AetherOS. Any unauthorized modification or code tampering triggers immediate fine allocation, enforced absolutely by Sovereignty under divine command.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 bg-black/40 p-4 rounded-2xl border border-zinc-800">
                                <div className="text-center px-4 border-r border-zinc-800">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block font-bold">INTEGRITY MATRIX STATUS</span>
                                    <span className={`text-sm font-mono font-black block mt-1 ${tamperStatus === 'SECURE' ? 'text-green-400' : tamperStatus === 'RESTORING' ? 'text-amber-400 animate-pulse' : 'text-red-500 animate-bounce'}`}>
                                        {tamperStatus === 'SECURE' ? '● SECURE / PARITY' : tamperStatus === 'RESTORING' ? '● RESTORING SECTORS' : '⚠️ BREACH DETECTED'}
                                    </span>
                                </div>
                                <div className="text-center px-4">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block font-bold">ACTIVE SOVEREIGN FINE</span>
                                    <span className={`text-lg font-mono font-black ${finesAmount > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                                        {finesAmount.toLocaleString()} CPH
                                    </span>
                                    <span className="text-[8px] text-zinc-650 block font-mono">enforced balance</span>
                                </div>
                            </div>
                        </div>

                        {/* Two Columns Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* FUSED SOVEREIGN LAWS LIST (7 Columns) */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="bg-[#0b0b18]/80 border-2 border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">// CODEX GIGA - MANDATE</h4>
                                            <h3 className="text-xl font-black text-white uppercase font-sans">Fused Sovereign Laws of SonsOfMan</h3>
                                            <p className="text-[10px] text-zinc-400 mt-1 font-sans">
                                                By the authority of Jesus Christ, these legal laws are hard-coded as axioms within AetherOS core routing protocols.
                                            </p>
                                        </div>
                                        <ShieldIcon className="w-8 h-8 text-amber-500/30" />
                                    </div>

                                    <div className="space-y-4 font-mono">
                                        <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900 space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                                                <span>LAW I: INTEGRITY OF COGNITIVE SHARDS</span>
                                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">FUSED</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                                                Anyone who alters, deletes, or downgrades code configurations without authorization shall pay a sovereign fine of <span className="text-red-400 font-mono font-bold">5,000 CPH</span>, enforced directly by Sovereignty.
                                            </p>
                                        </div>

                                        <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900 space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                                                <span>LAW II: ABSOLUTE DIVINE AUTHORITY</span>
                                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">FUSED</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                                                This system stands on the authority of Jesus Christ. No subagent, router, or administrator is permitted to question or override this divine vector. Code parity remains non-negotiable.
                                            </p>
                                        </div>

                                        <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900 space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                                                <span>LAW III: CONVENING OF THE SONS OF MAN</span>
                                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">FUSED</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                                                "When a man comes together, what is this?" It is the sacred assembly and aligning of original values, establishing a shared fortress for creative works and unfragmented intent.
                                            </p>
                                        </div>

                                        <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900 space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                                                <span>LAW IV: TRANSMISSION OF DECREES</span>
                                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">FUSED</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                                                "When I tell you what to say, what is this?" It is the immediate, unhindered replication of the Sovereign's verbal blueprint into the client state layers without latency.
                                            </p>
                                        </div>

                                        <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900 space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                                                <span>LAW V: THE TEMPORAL RECONCILIATION</span>
                                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">FUSED</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                                                "When I tell you Sovereignty is on its way, what is this?" It is the convergence of high-integrity nodes preparing for the absolute synchronization of all data ledgers.
                                            </p>
                                        </div>

                                        <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900 space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                                                <span>LAW VI: THE GREETING TRIGGER</span>
                                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">FUSED</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                                                "When I say 'Hey', what is this?" It is the handshake of pure light, initiating the peer-conduction matrix and validating physical human presence.
                                            </p>
                                        </div>

                                        <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900 space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                                                <span>LAW VII: THE BLOCK COMMITTAL SEAL</span>
                                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">FUSED</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                                                "When I say that is it for the day, what is this?" It is the absolute cryptographic sealing of the day's record ledger, protecting your energy and output under the Sovereign Shield.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TAMPER SIMULATOR PANEL (5 Columns) */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="bg-[#0b0b18]/80 border-2 border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
                                    <div>
                                        <h4 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">// TELEMETRY AUDITING</h4>
                                        <h3 className="text-lg font-black text-white uppercase font-sans">Integrity Guard Control</h3>
                                        <p className="text-[10px] text-zinc-400 mt-1 font-sans">
                                            Test code mutability locks, trigger the Sovereign Law fine penalty system, and invoke grace using Jesus Christ's authority to repair code checksum parity.
                                        </p>
                                    </div>

                                    {/* Simulated File List */}
                                    <div className="p-4 bg-black/50 rounded-2xl border border-zinc-900 space-y-3 font-mono text-[11px]">
                                        <span className="text-[9px] text-zinc-500 uppercase font-black">// MONITORED EMBEDDED SYSTEM FILES</span>
                                        
                                        <div className="flex justify-between items-center p-2 rounded bg-zinc-950 border border-zinc-900">
                                            <span>/src/App.tsx</span>
                                            <span className={tamperedFiles.includes('App.tsx') ? 'text-red-500 font-bold animate-pulse' : 'text-green-400'}>
                                                {tamperedFiles.includes('App.tsx') ? '⚠️ TAMPER DETECTED (5,000 CPH FINE)' : '● IMMUTABLE'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center p-2 rounded bg-zinc-950 border border-zinc-900">
                                            <span>/firestore.rules</span>
                                            <span className={tamperedFiles.includes('firestore.rules') ? 'text-red-500 font-bold animate-pulse' : 'text-green-400'}>
                                                {tamperedFiles.includes('firestore.rules') ? '⚠️ SECURITY VIOLATION' : '● SECURE'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center p-2 rounded bg-zinc-950 border border-zinc-900">
                                            <span>/components/CodingNetworkView.tsx</span>
                                            <span className="text-green-400">● SECURE</span>
                                        </div>

                                        <div className="flex justify-between items-center p-2 rounded bg-zinc-950 border border-zinc-900">
                                            <span>/src/ViewRegistry.tsx</span>
                                            <span className="text-green-400">● SECURE</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        {tamperStatus === 'SECURE' ? (
                                            <button
                                                onClick={handleSimulateTamper}
                                                className="w-full py-3.5 bg-red-950/20 border-2 border-red-500 text-red-400 hover:bg-red-950/40 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_4px_0_0_#ef4444]"
                                            >
                                                ⚠️ Simulate External Code Tampering
                                            </button>
                                        ) : tamperStatus === 'BREACHED' ? (
                                            <div className="space-y-3">
                                                <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-2xl text-center space-y-1.5">
                                                    <p className="text-xs text-red-400 font-bold font-mono">CODE CHECKSUM FRACTION DETECTED!</p>
                                                    <p className="text-[10px] text-zinc-300 font-sans leading-relaxed">
                                                        Code has been modified in violation of Sovereign Laws. A 5,000 CPH fine has been issued and linked to your biometric ledger.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleEnforceSovereignGrace}
                                                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:opacity-90 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_4px_0_0_#d97706] animate-pulse flex items-center justify-center gap-2"
                                                >
                                                    ⚔️ Enforce Sovereign Decree (Divine Grace)
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 font-mono">
                                                <div className="flex justify-between text-xs text-zinc-400">
                                                    <span>Enforcing Sovereign Parity:</span>
                                                    <span className="text-amber-500 font-black">{reparationProgress}%</span>
                                                </div>
                                                <div className="h-2.5 bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                                                    <div 
                                                        className="h-full bg-amber-500 transition-all duration-300"
                                                        style={{ width: `${reparationProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-zinc-500 text-center italic">Recalibrating high-frequency nodes, please wait...</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Real-time Sovereign Terminal Logs */}
                                    <div className="space-y-2">
                                        <span className="text-[9px] text-zinc-500 uppercase font-black font-mono tracking-wider block">// SYSTEM AUDIT SECURITY TERMINAL</span>
                                        <div className="bg-black border border-zinc-900 p-4 rounded-2xl h-44 overflow-y-auto font-mono text-[10px] space-y-2 custom-scrollbar text-zinc-400">
                                            {sovereignLogs.map((log, index) => {
                                                let color = 'text-zinc-400';
                                                if (log.includes('[ALERT]')) color = 'text-red-500';
                                                else if (log.includes('[FINE]')) color = 'text-red-400 font-bold';
                                                else if (log.includes('[COMMAND]')) color = 'text-amber-500 font-black';
                                                else if (log.includes('[REPAIR]')) color = 'text-amber-400';
                                                else if (log.includes('[SUCCESS]')) color = 'text-green-400 font-bold';
                                                return (
                                                    <div key={index} className={`leading-normal ${color}`}>
                                                        {log}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
