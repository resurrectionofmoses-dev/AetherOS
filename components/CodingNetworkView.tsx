
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FINTECH_AUTHORITIES } from '../constants';
import { 
    CodeIcon, ActivityIcon, ZapIcon, ShieldIcon, FireIcon, StarIcon, PlusIcon, XIcon, TerminalIcon, UserIcon, BrainIcon, LogicIcon, CheckCircleIcon, SpinnerIcon, GaugeIcon, SearchIcon, GavelIcon
} from './icons';
import type { NetworkProject, ProjectTask, UserProfile } from '../types';
import type { HireableAgent } from '../agentTypes';
import { AgentFactory } from '../services/AgentFactory';
import { safeStorage } from '../services/safeStorage';
import { extractJSON } from '../utils';
import { generateProjectKnowHow } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { CPHManager, CPHDisplay } from '../services/cphManager';
import { toast } from 'sonner';

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
}

export const CodingNetworkView: React.FC<CodingNetworkViewProps> = ({ projects, setProjects, agents, setAgents, profile, onUpdateProfile }) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [selectedAuthority, setSelectedAuthority] = useState(FINTECH_AUTHORITIES[0].id);
    const [viewMode, setViewMode] = useState<'SHARDS' | 'SQUAD' | 'COLLAB' | 'PROFILES' | 'MATCHES'>('SHARDS');
    const [marketplace, setMarketplace] = useState<HireableAgent[]>([]);
    const [isManifesting, setIsManifesting] = useState(false);
    const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
    const [crazyLevel, setCrazyLevel] = useState(5);
    const [fightVector, setFightVector] = useState(80);

    // --- NETWORK PROFILES & SKILL MATCHING STATES ---
    const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
    const [searchProfileQuery, setSearchProfileQuery] = useState('');
    const [selectedProfileNode, setSelectedProfileNode] = useState<any | null>(null);
    const [offeringInput, setOfferingInput] = useState('');
    const [lookingInput, setLookingInput] = useState('');

    useEffect(() => {
        const loadProfiles = async () => {
            const MOCK_PROFILES_PRESEEDED = [
                {
                    id: 'mock_1',
                    username: 'CyberWeaver_X',
                    bio: 'Systems generalist bridging low-level conduction runtimes with cryptographically secure consensus architectures. Building custom WASM and Rust execution vectors.',
                    skills: ['Rust', 'Go', 'WebAssembly', 'Solidity', 'System Architecture'],
                    lookingForSkills: ['TypeScript', 'React', 'Tailwind CSS', 'Framer Motion'],
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
                const stored = await localStorage.getItem('aetheros_network_profiles');
                if (stored) {
                    setNetworkProfiles(JSON.parse(stored));
                } else {
                    setNetworkProfiles(MOCK_PROFILES_PRESEEDED);
                    await localStorage.setItem('aetheros_network_profiles', JSON.stringify(MOCK_PROFILES_PRESEEDED));
                }
            } catch (e) {
                setNetworkProfiles(MOCK_PROFILES_PRESEEDED);
            }
        };
        loadProfiles();
    }, []);

    const calculateCompatibility = (dev1: any, dev2: any) => {
        if (!dev1 || !dev2) return { score: 0, reasons: [], offers: [], seeks: [], shared: [] };
        
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

        score = Math.min(Math.max(score, 10), 98);

        if (dev1OffersToDev2.length === 0 && dev2OffersToDev1.length === 0 && sharedSkills.length === 0) {
            score = 15;
            reasons.push('Proximity match: Connected in AetherOS Net Core with high-integrity routing paths.');
        }

        return {
            score,
            reasons,
            offers: dev1OffersToDev2,
            seeks: dev2OffersToDev1,
            shared: sharedSkills
        };
    };

    const handleToggleEndorseSkill = async (profileId: string, skillName: string) => {
        const myUsername = profile?.username || 'Aetheros_Prime';
        
        const updatedProfiles = networkProfiles.map(p => {
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
            await localStorage.setItem('aetheros_network_profiles', JSON.stringify(updatedProfiles));
        } catch (e) {
            console.error("Failed to persist skill endorsements", e);
        }
        
        if (selectedProfileNode && selectedProfileNode.id === profileId) {
            const updatedNode = updatedProfiles.find(p => p.id === profileId);
            if (updatedNode) {
                setSelectedProfileNode(updatedNode);
            }
        }
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
    }

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
    const [collabFilterTab, setCollabFilterTab] = useState<'all' | 'my_ideas' | 'my_teams' | 'applied'>('all');
    
    // Idea drafting states
    const [isCreatingCollab, setIsCreatingCollab] = useState(false);
    const [newCollabTitle, setNewCollabTitle] = useState('');
    const [newCollabDesc, setNewCollabDesc] = useState('');
    const [newCollabSkills, setNewCollabSkills] = useState('');

    // Interest application states
    const [applyingProjectId, setApplyingProjectId] = useState<string | null>(null);
    const [applyComment, setApplyComment] = useState('');
    const [applyRole, setApplyRole] = useState('');

    // Workspace state
    const [activeCollabWorkspaceId, setActiveCollabWorkspaceId] = useState<string | null>(null);
    const [activeCollabSubTab, setActiveCollabSubTab] = useState<'TASKS' | 'GIT' | 'COMMS'>('TASKS');
    const [newCollabTaskText, setNewCollabTaskText] = useState('');
    const [newCollabTaskAssignee, setNewCollabTaskAssignee] = useState('');
    const [newCollabMsgText, setNewCollabMsgText] = useState('');
    const [editCollabGitRepo, setEditCollabGitRepo] = useState('');
    const [editCollabGitBranch, setEditCollabGitBranch] = useState('main');
    const [newCollabCommitMsg, setNewCollabCommitMsg] = useState('');

    // Persistence and syncing logic
    useEffect(() => {
        const loadCollab = async () => {
            const saved = await safeStorage.getItem('AETHER_COLLAB_PROJECTS');
            if (saved) {
                const parsed = extractJSON<CollabProject[]>(saved, []);
                if (parsed.length > 0) {
                    setCollabProjects(parsed);
                    return;
                }
            }
            setCollabProjects(DEFAULT_COLLAB_PROJECTS);
            await safeStorage.setItem('AETHER_COLLAB_PROJECTS', JSON.stringify(DEFAULT_COLLAB_PROJECTS));
        };
        loadCollab();
    }, []);

    const saveCollabProjects = async (updated: CollabProject[]) => {
        setCollabProjects(updated);
        await safeStorage.setItem('AETHER_COLLAB_PROJECTS', JSON.stringify(updated));
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
            .map(s => s.trim())
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
            gitCommits: []
        };

        const updated = [newCollab, ...collabProjects];
        await saveCollabProjects(updated);
        
        setNewCollabTitle('');
        setNewCollabDesc('');
        setNewCollabSkills('');
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
        
        const updated = collabProjects.map(proj => {
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
        const updated = collabProjects.map(proj => {
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
        const updated = collabProjects.map(proj => {
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
        const updated = collabProjects.map(proj => {
            if (proj.id === projectId) {
                if (action === 'accept') {
                    const isAlreadyMember = proj.teamMembers.includes(applicantUsername);
                    const newTeamList = isAlreadyMember ? proj.teamMembers : [...proj.teamMembers, applicantUsername];
                    const newInterestedList = proj.interestedUsers.map(u => 
                        u.username === applicantUsername ? { ...u, status: 'accepted' as const } : u
                    );
                    return {
                        ...proj,
                        teamMembers: newTeamList,
                        interestedUsers: newInterestedList
                    };
                } else {
                    const newInterestedList = proj.interestedUsers.map(u => 
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
        const updated = collabProjects.map(proj => {
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
        const updated = collabProjects.map(proj => {
            if (proj.id === projectId) {
                const tasksList = proj.tasks || [];
                return {
                    ...proj,
                    tasks: tasksList.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
                };
            }
            return proj;
        });
        await saveCollabProjects(updated);
    };

    const handleDeleteCollabTask = async (projectId: string, taskId: string) => {
        const updated = collabProjects.map(proj => {
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
        const updated = collabProjects.map(proj => {
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

    const handleUpdateCollabGit = async (projectId: string, gitRepo: string, gitBranch: string) => {
        const updated = collabProjects.map(proj => {
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
        const updated = collabProjects.map(proj => {
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
        
        return collabProjects.filter(proj => {
            const matchesSearch = collabSearch.trim() === '' || 
                proj.title.toLowerCase().includes(collabSearch.toLowerCase()) ||
                proj.description.toLowerCase().includes(collabSearch.toLowerCase()) ||
                proj.requiredSkills.some(skill => skill.toLowerCase().includes(collabSearch.toLowerCase()));

            if (!matchesSearch) return false;

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
    }, [collabProjects, collabSearch, collabFilterTab, profile]);

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
        setAgents(prev => prev.map(a => {
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
                if (projects.length === 0 && parsed.length > 0) {
                    setProjects(parsed.map(p => ({...p, timestamp: new Date(p.timestamp)})));
                }
            }
        };
        loadShards();
    }, []);

    useEffect(() => {
        const persist = async () => {
            if (projects.length > 0) {
                await safeStorage.setItem('AETHER_NET_SHARDS', JSON.stringify(projects));
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
            
            setProjects(prev => prev.map(p => 
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
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        await safeStorage.setItem('AETHER_NET_SHARDS', JSON.stringify(updated));
    };


    const handleTaskInputChange = (projectId: string, value: string) => {
        setTaskInputs(prev => ({...prev, [projectId]: value}));
    };

    const handleAddTask = (projectId: string) => {
        const text = taskInputs[projectId];
        if (!text?.trim()) return;

        setProjects(prev => prev.map(p => {
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
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
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
        const agentName = agents.find(a => a.id === id)?.name || "Agent";
        setAgents(prev => prev.filter(a => a.id !== id));
        toast.info(`Dismissed ${agentName} from Coding Network`);
    };

    const toggleAgentPause = (id: string) => {
        setAgents(prev => prev.map(a => {
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
                                <div className="text-[10px] font-mono text-gray-600">COUNT: {projects.length}</div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {projects.length === 0 ? (
                                    <div className="col-span-full py-32 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-40">
                                        <CodeIcon className="w-24 h-24 mx-auto mb-6 text-gray-700" />
                                        <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-600">No Manifested Shards</p>
                                    </div>
                                ) : projects.map(project => (
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
                                                {project.tasks?.map(task => (
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
                                            {optimizationSuggestions.map((suggestion, idx) => (
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
                                    {filteredAgents.map(agent => {
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
                                                             {editedDomains.map((dom, idx) => (
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
                                                             {editedQuirks.map((quirk, idx) => (
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
                                                                 {agent.personality.preferredDomains.map((dom: string, i: number) => (
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
                                                                 {agent.personality.quirks.map((quirk: string, i: number) => (
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
                                ) : filteredMarketplace.map(agent => {
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
                                </div>

                                {/* Custom search box */}
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

                            {/* Project Cards Grid */}
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
                                    filteredCollabProjects.map(project => {
                                        const isCreator = project.creatorName === (profile?.username || 'Aetheros_Prime');
                                        const isMember = project.teamMembers.includes(profile?.username || 'Aetheros_Prime');
                                        const currentUsername = profile?.username || 'Aetheros_Prime';
                                        
                                        // Find pending request of the current user
                                        const myPendingRequest = project.interestedUsers.find(
                                            u => u.username === currentUsername && u.status === 'pending'
                                        );
                                        const isPending = !!myPendingRequest;

                                        // Total pending applications count
                                        const pendingAppsCount = project.interestedUsers.filter(u => u.status === 'pending').length;

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
                                                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500 text-emerald-400 bg-emerald-950/30">
                                                                COLLABORATION IDEATION
                                                            </span>
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
                                                            {project.requiredSkills.map((skill, sIdx) => (
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
                                                        {project.teamMembers.map((member, mIdx) => (
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
                                                                {project.interestedUsers.map((app, appIdx) => (
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

                                                                        {/* Task list array */}
                                                                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                                                            {!project.tasks || project.tasks.length === 0 ? (
                                                                                <p className="text-[9px] text-zinc-650 italic text-center py-4 uppercase font-mono">No current tasks registered.</p>
                                                                            ) : (
                                                                                project.tasks.map(task => (
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
                                                                                {project.teamMembers.map(m => (
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
                                                                                     project.gitCommits.map(commit => (
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
                                                                                     [...project.messages].reverse().map(msg => {
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
                                                             </div>
                                                         )}
                                                     </div>
                                                 )}
                                             </div>
                                        );
                                    })
                                )}
                            </div>
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
                                <div className="w-full sm:w-auto">
                                    <input
                                        type="text"
                                        placeholder="Query username or technology skill..."
                                        value={searchProfileQuery}
                                        onChange={(e) => setSearchProfileQuery(e.target.value)}
                                        className="w-full sm:w-72 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono placeholder:text-zinc-650"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Profiles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Render active profiles */}
                            {networkProfiles
                                .filter(p => !searchProfileQuery.trim() || 
                                    p.username.toLowerCase().includes(searchProfileQuery.toLowerCase()) ||
                                    (p.skills || []).some((s: string) => s.toLowerCase().includes(searchProfileQuery.toLowerCase())) ||
                                    (p.bio || '').toLowerCase().includes(searchProfileQuery.toLowerCase())
                                )
                                .map(p => {
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
                                                        {(p.skills || []).slice(0, 4).map((s: string) => (
                                                            <span key={s} className="px-2 py-0.5 bg-[#101026] text-[9px] font-mono text-zinc-305 border border-white/5 rounded-md">
                                                                {s}
                                                            </span>
                                                        ))}
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
                                                            {(p.lookingForSkills || []).slice(0, 4).map((s: string) => (
                                                                <span key={s} className="px-2 py-0.5 bg-rose-950/20 text-[9px] font-mono text-rose-400 border border-rose-500/10 rounded-md">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action footer */}
                                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-550">
                                                <span>{(p.portfolioLinks || []).length} Portfolios Connected</span>
                                                <span className="text-purple-400 uppercase font-black tracking-wider group-hover:translate-x-1 transition-transform">Inspect Node Detail &rarr;</span>
                                            </div>
                                        </div>
                                    );
                                })}

                            {networkProfiles.length === 0 && (
                                <div className="md:col-span-2 text-center py-12 border border-dashed border-zinc-800 rounded-3xl">
                                    <span className="text-zinc-600 block uppercase font-mono text-xs font-black">No profile nodes available in net config.</span>
                                </div>
                            )}
                        </div>

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

                                            {/* Skills Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2 p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                                                    <h5 className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">Primary Programming Stack (Click to Endorse)</h5>
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {(selectedProfileNode.skills || []).map((s: string) => {
                                                            const endorsers = selectedProfileNode.skillEndorsements?.[s] || [];
                                                            const hasEndorsed = endorsers.includes(profile?.username || 'Aetheros_Prime');
                                                            return (
                                                                <button 
                                                                    key={s} 
                                                                    onClick={() => handleToggleEndorseSkill(selectedProfileNode.id, s)}
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
                                                        {(selectedProfileNode.lookingForSkills || []).map((s: string) => (
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

                                            {/* Portfolio links */}
                                            {(selectedProfileNode.portfolioLinks || []).length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">Verified Network Portals</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {(selectedProfileNode.portfolioLinks || []).map((lnk: any) => (
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
                                                        {(selectedProfileNode.profileProjects || []).map((pro: any) => (
                                                            <div key={pro.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl">
                                                                <div className="flex items-center justify-between mb-1.5 font-mono">
                                                                    <h5 className="text-xs font-black text-white uppercase">{pro.title}</h5>
                                                                    <span className="text-[9px] bg-zinc-900 text-zinc-505 border border-white/5 py-0.5 px-2 rounded tracking-widest uppercase">
                                                                        // {pro.status}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[10px] text-purple-400 font-mono font-bold uppercase mb-1">
                                                                    Assigned Role: {pro.roleDefined || 'Solo Creator'}
                                                                </div>
                                                                <p className="text-xs text-zinc-400 leading-normal">{pro.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[9px] font-mono text-zinc-650">ID SOURCE NODE SHARED INDEX: {selectedProfileNode.id}</span>
                                            <button
                                                onClick={() => {
                                                    setSelectedProfileNode(null);
                                                    setViewMode('MATCHES');
                                                }}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase font-mono"
                                            >
                                                Calculate MATCH MATRIX &rarr;
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
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
                                        {(profile?.skills || []).map((s: string) => (
                                            <span key={s} className="px-2.5 py-1 bg-purple-950/30 text-xs font-mono text-purple-300 rounded-lg border border-purple-500/15 flex items-center gap-1">
                                                {s}
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
                                        ))}
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
                                        {(profile?.lookingForSkills || []).map((s: string) => (
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

                        {/* Matches Grid List */}
                        <div className="space-y-4">
                            {networkProfiles
                                .map(p => ({
                                    profile: p,
                                    match: calculateCompatibility(profile, p)
                                }))
                                .sort((a, b) => b.match.score - a.match.score)
                                .map(({ profile: p, match }) => (
                                    <div 
                                        key={p.id}
                                        className="bg-[#0b0b18]/70 border-2 border-zinc-900 rounded-3xl p-6 relative overflow-hidden shadow-lg flex flex-col md:flex-row justify-between gap-6"
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
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-mono text-sm font-black text-white hover:text-rose-450">@{p.username}</h4>
                                                        <span className="text-[9px] font-mono bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded uppercase font-black">{p.experienceLevel || 'Node Expert'}</span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Compatibility Diagnostic Complete</p>
                                                </div>
                                            </div>

                                            {/* Compatibility reasons details */}
                                            <div className="space-y-2 bg-black/40 p-4 border border-zinc-900 rounded-2xl">
                                                <h5 className="text-[9px] font-mono text-zinc-505 tracking-wider font-extrabold flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                                                    Compatibility Log Reasonings
                                                </h5>
                                                <div className="space-y-1.5">
                                                    {match.reasons.map((r, i) => (
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
                                                        {match.seeks.map(s => (
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
                                                        {match.offers.map(s => (
                                                            <span key={s} className="px-2 py-0.5 bg-purple-500/10 text-[9px] font-mono text-purple-400 rounded-md">{s}</span>
                                                        ))}
                                                        {match.offers.length === 0 && (
                                                            <span className="text-[9px] text-zinc-600 italic">None specifically offered.</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-zinc-955 border border-zinc-900 rounded-xl">
                                                    <div className="text-[8px] font-mono text-zinc-500 uppercase font-black mb-1.5">// Shared interests</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {match.shared.map(s => (
                                                            <span key={s} className="px-2 py-0.5 bg-zinc-900 text-[9px] font-mono text-zinc-300 rounded-md">{s}</span>
                                                        ))}
                                                        {match.shared.length === 0 && (
                                                            <span className="text-[9px] text-zinc-650 italic">No common stacks.</span>
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

                                            <button
                                                onClick={() => {
                                                    alert(`Collaboration request request node pinged to @${p.username}! Custom team invitation has been queued.`);
                                                }}
                                                className="w-full px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase font-mono tracking-wider transition-all"
                                            >
                                                PITCH SQUAD COLLAB PING
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
