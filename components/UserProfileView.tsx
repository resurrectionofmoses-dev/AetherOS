import React, { useState, useEffect } from 'react';
import { UserProfile, NetworkProject, PortfolioLink, ProfileProject, WorkExperience, Education } from '../types';
import { UserIcon, EditIcon, CheckIcon, CodeIcon, XIcon, PlusIcon, ShieldIcon } from './icons';
import { 
    KeyIcon, 
    CalendarIcon, 
    Trash2Icon, 
    PlusSquareIcon, 
    GlobeIcon, 
    ExternalLinkIcon, 
    BriefcaseIcon, 
    FolderIcon, 
    CheckCircle2Icon, 
    ClockIcon, 
    SparklesIcon, 
    Link2Icon, 
    AlertCircleIcon, 
    InfoIcon, 
    Coins, 
    Zap as ZapIcon, 
    Database as DatabaseIcon, 
    BookOpen as BookOpenIcon,
    Star,
    Award,
    GraduationCap,
    Plus,
    ThumbsUp
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { safeStorage } from '../services/safeStorage';
import { reputationService } from '../services/reputationService';
import { motion, AnimatePresence } from 'motion/react';

interface ApiKey {
    id: string;
    key: string;
    expirationDate: string;
    createdAt: number;
}

interface UserProfileViewProps {
    profile: UserProfile;
    projects: NetworkProject[];
    onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ profile, projects, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<UserProfile>(profile);
    
    // Manage state lists with fallbacks
    const [portfolioLinks, setPortfolioLinks] = useState<PortfolioLink[]>([]);
    const [profileProjects, setProfileProjects] = useState<ProfileProject[]>([]);
    const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [skillEndorsements, setSkillEndorsements] = useState<Record<string, string[]>>({});
    
    const [newSkill, setNewSkill] = useState('');
    const [newLookingForSkill, setNewLookingForSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [newLookingFor, setNewLookingFor] = useState('');
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isKeysLoading, setIsKeysLoading] = useState(true);
    const [passphrase, setPassphrase] = useState('');
    const [isPassphraseSet, setIsPassphraseSet] = useState(false);

    // Resource Reserves asset simulator state
    const [reserveState, setReserveState] = useState<any>(() => {
        const saved = localStorage.getItem('aetheros_resource_reserve');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {}
        }
        return {
            reserves: [
                { type: 'energy', subtype: 'solar_power', quantity: 200, unit: 'kWh', cphPerUnit: 1, totalValue: 200, depreciationRate: 50, remainingLifeWeeks: 4 },
                { type: 'food', subtype: 'grain', quantity: 100, unit: 'kg', cphPerUnit: 5, totalValue: 500, depreciationRate: 100, remainingLifeWeeks: 2 },
                { type: 'materials', subtype: 'iron_ore', quantity: 300, unit: 'kg', cphPerUnit: 2, totalValue: 600, depreciationRate: 5, remainingLifeWeeks: 200 }
            ],
            totalBackedCPH: 1300,
            cphInCirculation: 800,
            cphInStorage: 500,
            resourcesExtractedCPH: 1300,
            resourcesConsumedCPH: 0,
            valueAddedCPH: 0,
            depreciationCPH: 0,
            netResourceBalance: 1300
        };
    });

    const handleUpdateAssetQuantity = (subtype: string, newQty: number) => {
        if (newQty < 0) return;
        const saved = localStorage.getItem('aetheros_resource_reserve');
        let currentReserve: any = null;
        if (saved) {
            try {
                currentReserve = JSON.parse(saved);
            } catch (e) {}
        }
        if (!currentReserve) {
            currentReserve = { ...reserveState };
        }
        
        const asset = currentReserve.reserves.find((r: any) => r.subtype === subtype);
        if (asset) {
            asset.quantity = newQty;
            asset.totalValue = asset.quantity * asset.cphPerUnit;
        }
        
        const totalValue = currentReserve.reserves.reduce((acc: number, curr: any) => acc + curr.totalValue, 0);
        currentReserve.totalBackedCPH = totalValue;
        currentReserve.netResourceBalance = totalValue;
        currentReserve.cphInStorage = totalValue - currentReserve.cphInCirculation;
        if (currentReserve.cphInStorage < 0) currentReserve.cphInStorage = 0;

        localStorage.setItem('aetheros_resource_reserve', JSON.stringify(currentReserve));
        setReserveState(currentReserve);
    };

    const handleMintMockAssets = () => {
        const saved = localStorage.getItem('aetheros_resource_reserve');
        let currentReserve: any = null;
        if (saved) {
            try {
                currentReserve = JSON.parse(saved);
            } catch (e) {}
        }
        if (!currentReserve) {
            currentReserve = { ...reserveState };
        }

        currentReserve.reserves.forEach((asset: any) => {
            if (asset.subtype === 'solar_power') asset.quantity += 500;
            if (asset.subtype === 'grain') asset.quantity += 100;
            if (asset.subtype === 'iron_ore') asset.quantity += 250;
            asset.totalValue = asset.quantity * asset.cphPerUnit;
        });

        const totalValue = currentReserve.reserves.reduce((acc: number, curr: any) => acc + curr.totalValue, 0);
        currentReserve.totalBackedCPH = totalValue;
        currentReserve.netResourceBalance = totalValue;
        currentReserve.cphInStorage = totalValue - currentReserve.cphInCirculation;
        if (currentReserve.cphInStorage < 0) currentReserve.cphInStorage = 0;

        localStorage.setItem('aetheros_resource_reserve', JSON.stringify(currentReserve));
        setReserveState(currentReserve);
    };

// components/UserProfileView.tsx
    // Bind state values when user profile is updated or loaded
    useEffect(() => {
        // If the user is actively editing their profile, we MUST NOT overwrite their local
        // edit form state with background updates or we would lose their unsaved keystrokes.
        if (isEditing) return;

        const enrichedProfile = {
            ...profile,
            sovereigntyTier: profile.sovereigntyTier || 3,
            areasOfInterest: profile.areasOfInterest || ['Compiler Engineering', 'DeFi Protocols', 'AI Alignment'],
            lookingFor: profile.lookingFor || ['Collaborators', 'Mentorship', 'Open Source Projects'],
            lookingForSkills: profile.lookingForSkills || ['React', 'TypeScript', 'Rust']
        };
        setEditForm(enrichedProfile);
        
        setPortfolioLinks(profile.portfolioLinks || [
            { id: 'link_1', label: 'GitHub', url: 'https://github.com/aetheros-prime' },
            { id: 'link_2', label: 'Website', url: 'https://aetheros.network' }
        ]);

        setProfileProjects(profile.profileProjects || [
            { 
                id: 'proj_1', 
                title: 'Sovereign Shield', 
                roleDefined: 'Lead Architect', 
                status: 'current', 
                description: 'Real-time multi-dimensional defensive envelope and metric tracking system.',
                link: 'https://github.com/aetheros/sovereign-shield',
                rating: 5,
                ratingsCount: 4,
                endorsements: ['Operator-Beta', 'Operator-Gamma']
            },
            { 
                id: 'proj_2', 
                title: 'Cognitive Pipeline', 
                roleDefined: 'Core Dev', 
                status: 'past', 
                description: 'Autonomous orchestration model integrating high-frequency token generation and feedback matrices.',
                link: 'https://github.com/aetheros/cognitive-pipeline',
                rating: 4,
                ratingsCount: 2,
                endorsements: ['Operator-Alpha']
            }
        ]);

        setWorkExperience(profile.workExperience || [
            { id: 'exp_1', company: 'DeepMind Labs', position: 'Lead Paradigm Architect', startDate: '2024-01-01', endDate: '', description: 'Iteratively scaled agentic reasoning models and distributed context vectors.', isCurrent: true },
            { id: 'exp_2', company: 'Google Cloud Platform', position: 'Senior Infrastructure Engineer', startDate: '2021-06-01', endDate: '2023-12-31', description: 'Architected millisecond-grain serverless ingress and network mesh structures.', isCurrent: false }
        ]);

        setEducation(profile.education || [
            { id: 'edu_1', institution: 'MIT Engineering', degree: 'Ph.D. in Computer Science', fieldOfStudy: 'Distributed Autonomous Systems', startDate: '2016-09-01', endDate: '2021-05-31', description: 'Thesis: Real-time Multi-agent Network Orchestration Loops.' }
        ]);

        setSkillEndorsements(profile.skillEndorsements || {
            'Compiler Engineering': ['Operator-Alpha', 'Operator-Beta'],
            'DeFi Protocols': ['Operator-Gamma']
        });
    }, [profile, isEditing]);

    const handleSetPassphrase = () => {
        if (!passphrase.trim()) return;
        safeStorage.setPassphrase(passphrase);
        setIsPassphraseSet(true);
        loadKeys();
    };

    const loadKeys = async () => {
        setIsKeysLoading(true);
        const saved = await safeStorage.getItem('aetheros_api_keys');
        if (saved) {
            try { 
                setApiKeys(JSON.parse(saved)); 
            } catch (e) { 
                console.error("Failed to load API keys", e); 
                setApiKeys([]);
            }
        }
        setIsKeysLoading(false);
    };

    useEffect(() => {
        loadKeys();
    }, []);

    // Active Reputation Calculation (Dynamic tracking based on safeStorage data)
    const [reputationScore, setReputationScore] = useState<number>(0);

    const loadAndUpdateReputation = async () => {
        try {
            const username = profile.username || 'Aetheros_Prime';
            const repInfo = await reputationService.calculateReputation(username);
            setReputationScore(repInfo.reputationScore);
        } catch (e) {
            console.error("Failed to calculate real-time Reputation metrics:", e);
        }
    };

    useEffect(() => {
        loadAndUpdateReputation();
        
        // Listen for storage events or continuous sync
        const handleFocus = () => loadAndUpdateReputation();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [profile.username]);

    useEffect(() => {
        const persistKeys = async () => {
            if (!isKeysLoading) {
                await safeStorage.setItem('aetheros_api_keys', JSON.stringify(apiKeys));
            }
        };
        persistKeys();
    }, [apiKeys, isKeysLoading]);

    const handleSave = () => {
        onUpdateProfile({
            ...editForm,
            portfolioLinks,
            profileProjects,
            workExperience,
            education,
            skillEndorsements
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditForm(profile);
        setPortfolioLinks(profile.portfolioLinks || []);
        setProfileProjects(profile.profileProjects || []);
        setWorkExperience(profile.workExperience || []);
        setEducation(profile.education || []);
        setSkillEndorsements(profile.skillEndorsements || {});
        setIsEditing(false);
    };

    // Skill controller
    const handleAddSkill = () => {
        if (newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
            setEditForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setEditForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
        // Clean from endorsements too
        const nextEndorsements = { ...skillEndorsements };
        delete nextEndorsements[skillToRemove];
        setSkillEndorsements(nextEndorsements);
    };

    // Endorse Skill logic
    const handleEndorseSkill = (skillName: string) => {
        const voters = skillEndorsements[skillName] || [];
        const currentUser = 'Operator-You'; // Simulated current user in preview
        let nextVoters: string[];
        
        if (voters.includes(currentUser)) {
            nextVoters = voters.filter(v => v !== currentUser);
        } else {
            nextVoters = [...voters, currentUser];
        }

        const nextEndorsements = {
            ...skillEndorsements,
            [skillName]: nextVoters
        };
        setSkillEndorsements(nextEndorsements);
        
        // Propagate changes
        onUpdateProfile({
            ...editForm,
            skillEndorsements: nextEndorsements
        });
    };

    // Endorse and rate portfolio projects
    const handleEndorseProject = (projId: string) => {
        const currentUser = 'Operator-You';
        const nextProjs = profileProjects.map(p => {
            if (p.id === projId) {
                const voters = p.endorsements || [];
                const nextVoters = voters.includes(currentUser)
                    ? voters.filter(v => v !== currentUser)
                    : [...voters, currentUser];
                return { ...p, endorsements: nextVoters };
            }
            return p;
        });
        setProfileProjects(nextProjs);
        onUpdateProfile({ ...editForm, profileProjects: nextProjs });
    };

    const handleRateProject = (projId: string, value: number) => {
        const nextProjs = profileProjects.map(p => {
            if (p.id === projId) {
                const currentCount = p.ratingsCount || 0;
                const newCount = currentCount + 1;
                // Simple average formula
                const currentAvg = p.rating || 5;
                const newAvg = parseFloat(((currentAvg * currentCount + value) / newCount).toFixed(1));
                return { ...p, rating: newAvg, ratingsCount: newCount };
            }
            return p;
        });
        setProfileProjects(nextProjs);
        onUpdateProfile({ ...editForm, profileProjects: nextProjs });
    };

    // Experience state handlers
    const handleAddExperience = () => {
        const newExp: WorkExperience = {
            id: uuidv4(),
            company: 'New Nexus Tech',
            position: 'Core Systems Developer',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            description: 'Maintained and deployed highly secure full-stack gateways.',
            isCurrent: true
        };
        setWorkExperience([...workExperience, newExp]);
    };

    const handleRemoveExperience = (id: string) => {
        setWorkExperience(workExperience.filter(e => e.id !== id));
    };

    const handleUpdateExperience = (id: string, field: keyof WorkExperience, value: any) => {
        setWorkExperience(workExperience.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    // Education state handlers
    const handleAddEducation = () => {
        const newEdu: Education = {
            id: uuidv4(),
            institution: 'Polytechnic Academy',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Software Engineering',
            startDate: '2020-09-01',
            endDate: '2024-06-01',
            description: 'Focused on type-safe compilation targets.'
        };
        setEducation([...education, newEdu]);
    };

    const handleRemoveEducation = (id: string) => {
        setEducation(education.filter(e => e.id !== id));
    };

    const handleUpdateEducation = (id: string, field: keyof Education, value: any) => {
        setEducation(education.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const handleAddLookingForSkill = () => {
        const currentLooking = editForm.lookingForSkills || [];
        if (newLookingForSkill.trim() && !currentLooking.includes(newLookingForSkill.trim())) {
            setEditForm(prev => ({ ...prev, lookingForSkills: [...(prev.lookingForSkills || []), newLookingForSkill.trim()] }));
            setNewLookingForSkill('');
        }
    };

    const handleRemoveLookingForSkill = (skillToRemove: string) => {
        const currentLooking = editForm.lookingForSkills || [];
        setEditForm(prev => ({ ...prev, lookingForSkills: currentLooking.filter(s => s !== skillToRemove) }));
    };

    const handleAddInterest = () => {
        const currentInterests = editForm.areasOfInterest || [];
        if (newInterest.trim() && !currentInterests.includes(newInterest.trim())) {
            setEditForm(prev => ({ ...prev, areasOfInterest: [...(prev.areasOfInterest || []), newInterest.trim()] }));
            setNewInterest('');
        }
    };

    const handleRemoveInterest = (interestToRemove: string) => {
        const currentInterests = editForm.areasOfInterest || [];
        setEditForm(prev => ({ ...prev, areasOfInterest: currentInterests.filter(i => i !== interestToRemove) }));
    };

    const handleAddLookingFor = () => {
        const currentLooking = editForm.lookingFor || [];
        if (newLookingFor.trim() && !currentLooking.includes(newLookingFor.trim())) {
            setEditForm(prev => ({ ...prev, lookingFor: [...(prev.lookingFor || []), newLookingFor.trim()] }));
            setNewLookingFor('');
        }
    };

    const handleRemoveLookingFor = (lookingForToRemove: string) => {
        const currentLooking = editForm.lookingFor || [];
        setEditForm(prev => ({ ...prev, lookingFor: currentLooking.filter(l => l !== lookingForToRemove) }));
    };

    const handleGenerateKey = async () => {
        const newKey: ApiKey = {
            id: uuidv4(),
            key: `sk_live_v1_${Math.random().toString(36).substring(2, 12)}...`,
            expirationDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // 1 year
            createdAt: Date.now()
        };
        setApiKeys([...apiKeys, newKey]);
    };

    const handleRevokeKey = async (id: string) => {
        setApiKeys(apiKeys.filter(k => k.id !== id));
    };

    const handleAddLink = () => {
        const newLink: PortfolioLink = {
            id: uuidv4(),
            label: 'GitHub Repository',
            url: 'https://'
        };
        setPortfolioLinks([...portfolioLinks, newLink]);
    };

    const handleRemoveLink = (id: string) => {
        setPortfolioLinks(portfolioLinks.filter(l => l.id !== id));
    };

    const handleUpdateLink = (id: string, field: keyof PortfolioLink, value: string) => {
        setPortfolioLinks(portfolioLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const handleAddProject = () => {
        const newProj: ProfileProject = {
            id: uuidv4(),
            title: 'New Integration Project',
            description: 'Core details of the repository development.',
            roleDefined: 'Full-Stack Developer',
            status: 'current',
            link: '',
            rating: 5,
            ratingsCount: 1,
            endorsements: []
        };
        setProfileProjects([...profileProjects, newProj]);
    };

    const handleRemoveProject = (id: string) => {
        setProfileProjects(profileProjects.filter(p => p.id !== id));
    };

    const handleUpdateProject = (id: string, field: keyof ProfileProject, value: any) => {
        setProfileProjects(profileProjects.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const currentProjects = profileProjects.filter(p => p.status === 'current');
    const pastProjects = profileProjects.filter(p => p.status === 'past');

    return (
        <div id="user-profile-view-root" className="h-full flex flex-col bg-[#020202] text-zinc-100 font-mono p-6 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto w-full space-y-8 pb-12">
                
                {/* Header Profile Identity Block */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden bg-zinc-950 border-4 border-zinc-900 rounded-3xl p-6 shadow-[12px_12px_0_0_#101012] flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="relative group shrink-0">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-900/40 via-purple-950/30 to-zinc-950 border-2 border-blue-500/30 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-12 h-12 text-blue-400" />
                                )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-zinc-950 rounded-full animate-pulse" title="Grid connection: Engaged" />
                        </div>

                        <div className="space-y-2 flex-1">
                            {isEditing ? (
                                <div className="space-y-3 max-w-md">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Lattice Username</label>
                                        <input 
                                            id="input-username"
                                            value={editForm.username}
                                            onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                            className="bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xl font-bold text-white focus:outline-none focus:border-blue-500 w-full"
                                            placeholder="Sovereign Name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Authority Level</label>
                                            <select 
                                                id="select-role"
                                                value={editForm.role}
                                                onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value as any }))}
                                                className="bg-black/60 border border-zinc-800 rounded px-2 py-1 text-xs uppercase font-extrabold text-blue-400 focus:outline-none focus:border-blue-500 cursor-pointer h-9"
                                            >
                                                <option value="guest">Guest</option>
                                                <option value="user">User</option>
                                                <option value="moderator">Moderator</option>
                                                <option value="operator">Operator</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Sovereignty Stack</label>
                                            <input 
                                                id="input-sovereignty"
                                                value={editForm.sovereignty || ''}
                                                onChange={e => setEditForm(prev => ({ ...prev, sovereignty: e.target.value }))}
                                                className="bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs font-black uppercase text-amber-500 focus:outline-none focus:border-amber-500 h-9"
                                                placeholder="Sovereignty"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Sovereign Tier</label>
                                            <select 
                                                id="select-sovereignty-tier"
                                                value={editForm.sovereigntyTier || 3}
                                                onChange={e => setEditForm(prev => ({ ...prev, sovereigntyTier: parseInt(e.target.value) }))}
                                                className="bg-black/60 border border-zinc-800 rounded px-2 py-1 text-xs uppercase font-extrabold text-teal-400 focus:outline-none focus:border-teal-500 cursor-pointer h-9"
                                            >
                                                <option value={1}>Tier 1</option>
                                                <option value={2}>Tier 2</option>
                                                <option value={3}>Tier 3</option>
                                                <option value={4}>Tier 4</option>
                                                <option value={5}>Tier 5</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <h1 id="view-username" className="text-3xl font-extrabold text-white tracking-tight">{profile.username}</h1>
                                        <span className="text-zinc-700 text-xs font-black select-none">//</span>
                                        <span className="text-xs text-zinc-500 uppercase font-black tracking-widest">Active Node</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                            profile.role === 'admin' ? 'bg-red-950/80 text-red-400 border border-red-500/30' : 
                                            profile.role === 'operator' ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30' : 
                                            profile.role === 'moderator' ? 'bg-blue-950/80 text-blue-400 border border-blue-500/30' : 
                                            'bg-zinc-900 text-zinc-400 border border-zinc-800'
                                        }`}>
                                            {profile.role} authority
                                        </span>
                                        <span className="text-zinc-800 text-xs font-black">//</span>
                                        
                                        {/* Sovereign Status Badge */}
                                        <span id="sovereign-status-badge" className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all ${
                                            (profile.sovereigntyTier || 3) === 5 ? 'bg-fuchsia-950/80 text-fuchsia-400 border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.3)] animate-pulse' :
                                            (profile.sovereigntyTier || 3) === 4 ? 'bg-rose-950/80 text-rose-400 border-rose-500/45 shadow-[0_0_8px_rgba(244,63,94,0.35)]' :
                                            (profile.sovereigntyTier || 3) === 3 ? 'bg-amber-950/80 text-amber-400 border-amber-500/40 shadow-[0_0_6px_rgba(245,158,11,0.25)]' :
                                            (profile.sovereigntyTier || 3) === 2 ? 'bg-teal-950/80 text-teal-400 border-teal-500/30' :
                                            'bg-zinc-900 text-zinc-400 border-zinc-800'
                                        }`} title={`Sovereignty Tier: ${profile.sovereigntyTier || 3}`}>
                                            <ShieldIcon className="w-3.5 h-3.5 text-current/85" />
                                            Sovereign Tier {profile.sovereigntyTier || 3}
                                        </span>

                                        <span className="text-zinc-800 text-xs font-black">//</span>

                                        {/* Real-time Reputation Badge System */}
                                        <span id="reputation-badge" className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                                            reputationScore >= 100 ? 'bg-fuchsia-950/80 text-fuchsia-400 border-fuchsia-500/50 shadow-[0_0_12px_rgba(217,70,239,0.3)]' :
                                            reputationScore >= 60 ? 'bg-rose-950/80 text-rose-400 border-rose-500/45 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse' :
                                            reputationScore >= 30 ? 'bg-amber-955/80 text-amber-400 border-amber-500/40 shadow-[0_0_6px_rgba(245,158,11,0.2)]' :
                                            reputationScore >= 10 ? 'bg-teal-950/80 text-teal-400 border-teal-500/30' :
                                            'bg-zinc-900 text-zinc-400 border-zinc-800'
                                        }`} title={`Reputation points computed from forum answers and project showcase: ${reputationScore}`}>
                                            <Award className="w-3.5 h-3.5 text-current" />
                                            <span>REP: {reputationScore}</span>
                                            <span className="text-current/30 font-mono text-[9px]">|</span>
                                            <span className="text-[8px] font-bold text-zinc-350">
                                                {reputationScore >= 100 ? 'AetherOS Legendary Legend' :
                                                 reputationScore >= 60 ? 'Elite Conduit' :
                                                 reputationScore >= 30 ? 'Sovereign Architect' :
                                                 reputationScore >= 10 ? 'Qualified Verifier' :
                                                 'Initiative Node'}
                                            </span>
                                        </span>

                                        <span className="text-zinc-800 text-xs font-black">//</span>
                                        <div className="flex items-center gap-1.5">
                                            <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider leading-none">{profile.sovereignty || 'SOVEREIGN_SYSTEM'}</span>
                                        </div>
                                        <span className="text-zinc-800 text-xs font-black">//</span>
                                        <span className="text-[9px] font-mono text-zinc-650 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900 uppercase font-bold">Hash: {profile.id.substring(0, 8)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="shrink-0 flex gap-2 w-full md:w-auto justify-end border-t border-zinc-900 md:border-t-0 pt-4 md:pt-0">
                        {isEditing ? (
                            <div className="flex gap-2 w-full md:w-auto">
                                <button 
                                    id="btn-profile-cancel"
                                    onClick={handleCancel} 
                                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer flex-1 md:flex-initial justify-center"
                                >
                                    <XIcon className="w-3.5 h-3.5" /> Cancel
                                </button>
                                <button 
                                    id="btn-profile-save"
                                    onClick={handleSave} 
                                    className="px-4 py-2 bg-emerald-600 text-zinc-950 rounded-xl hover:bg-emerald-500 hover:scale-102 active:scale-98 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer flex-1 md:flex-initial justify-center"
                                >
                                    <CheckIcon className="w-3.5 h-3.5" /> Save Node
                                </button>
                            </div>
                        ) : (
                            <button 
                                id="btn-profile-edit"
                                onClick={() => setIsEditing(true)} 
                                className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer hover:border-zinc-700"
                            >
                                <EditIcon className="w-3.5 h-3.5 text-blue-400" /> Edit Metadata
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Dashboard layout structure */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Details & Network Connections */}
                    <div id="left-column" className="lg:col-span-1 space-y-8 flex flex-col justify-between">
                        
                        {/* Biography block */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg relative group overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-3 flex items-center gap-2">
                                <InfoIcon className="w-3.5 h-3.5 text-blue-400" strokeWidth={3} /> Node Description
                            </h3>
                            {isEditing ? (
                                <textarea 
                                    id="textarea-bio"
                                    value={editForm.bio}
                                    onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                    className="w-full bg-black/60 border border-zinc-800 rounded p-3 text-xs text-zinc-350 text-zinc-300 focus:outline-none focus:border-blue-500 min-h-[140px] resize-none font-mono"
                                    placeholder="Enter your system objective biography description..."
                                />
                            ) : (
                                <p id="view-bio" className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono">
                                    {profile.bio || <span className="text-zinc-600 italic text-xs">No biography description set.</span>}
                                </p>
                            )}
                        </motion.div>

                        {/* Experience Level Block */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.15 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg relative group overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-3 flex items-center gap-2">
                                <BriefcaseIcon className="w-3.5 h-3.5 text-emerald-400" /> Experience Coordinates
                            </h3>
                            {isEditing ? (
                                <select 
                                    id="select-experience-level"
                                    value={editForm.experienceLevel || ''}
                                    onChange={e => setEditForm(prev => ({ ...prev, experienceLevel: e.target.value }))}
                                    className="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono h-9 cursor-pointer"
                                >
                                    <option value="Junior Specialist">Junior Specialist (0-2 years)</option>
                                    <option value="Associate Developer">Associate Developer (2-4 years)</option>
                                    <option value="Senior Architect / Engineer">Senior Architect / Engineer (4-8 years)</option>
                                    <option value="Principal Paradigm / Tech Lead">Principal Paradigm / Tech Lead (8+ years)</option>
                                    <option value="God-Mode Kernel Developer">God-Mode Kernel Developer (Elite)</option>
                                </select>
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-emerald-950/20 border border-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                                        <BriefcaseIcon className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-zinc-200 tracking-wider">Experience Level</p>
                                        <p id="view-experience-level" className="text-xs text-emerald-400 font-mono mt-0.5">{profile.experienceLevel || 'Senior Architect / Engineer'}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Technical Skills Stack with Endorsement Ratings */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-4 flex items-center gap-2">
                                <CodeIcon className="w-3.5 h-3.5 text-purple-400" /> Core Skills & Endorsements
                            </h3>
                            
                            <div className="flex flex-col gap-2 mb-4">
                                <AnimatePresence>
                                    {(isEditing ? editForm.skills : editForm.skills || []).map(skill => {
                                        const endorseCount = (skillEndorsements[skill] || []).length;
                                        const alreadyEndorsed = (skillEndorsements[skill] || []).includes('Operator-You');
                                        return (
                                            <motion.div 
                                                key={skill} 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-2.5 flex items-center justify-between gap-3 text-[10px] uppercase font-black"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-purple-400 truncate tracking-wider">{skill}</span>
                                                    {endorseCount > 0 && (
                                                        <span className="bg-purple-500 text-zinc-950 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                                                            <Award className="w-3 h-3" /> {endorseCount} ENDORSED
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {!isEditing && (
                                                        <button 
                                                            onClick={() => handleEndorseSkill(skill)}
                                                            className={`px-2 py-1 rounded text-[8px] font-mono tracking-widest cursor-pointer transition-all uppercase flex items-center gap-1 ${
                                                                alreadyEndorsed 
                                                                    ? 'bg-purple-600 text-black font-black font-extrabold' 
                                                                    : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500 text-purple-400'
                                                            }`}
                                                            title="Endorse this tech parameter"
                                                        >
                                                            <ThumbsUp className="w-2.5 h-2.5" />
                                                            {alreadyEndorsed ? 'ENDORSED' : 'ENDORSE'}
                                                        </button>
                                                    )}

                                                    {isEditing && (
                                                        <button 
                                                            id={`btn-remove-skill-${skill}`}
                                                            onClick={() => handleRemoveSkill(skill)} 
                                                            className="text-zinc-550 hover:text-red-400 transition-colors cursor-pointer p-1 rounded bg-zinc-900 border border-zinc-800"
                                                            title="Detach Skill"
                                                        >
                                                            <XIcon className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                {((isEditing ? editForm.skills : editForm.skills || []).length === 0) && (
                                    <span className="text-zinc-650 text-zinc-600 italic text-xs">No core skills listed on profile node.</span>
                                )}
                            </div>

                            {isEditing && (
                                <div className="flex gap-2 border-t border-zinc-900 pt-3">
                                    <input 
                                        id="input-new-skill"
                                        value={newSkill}
                                        onChange={e => setNewSkill(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                                        placeholder="Add technology (e.g. React, D3)..."
                                        className="flex-1 bg-black/60 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                                    />
                                    <button 
                                        id="btn-add-skill"
                                        onClick={handleAddSkill} 
                                        className="bg-zinc-900 hover:bg-purple-600 text-white hover:text-white px-2 rounded border border-zinc-800 hover:border-purple-500 transition-all cursor-pointer flex items-center justify-center"
                                        title="Attach Skill Parameter"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </motion.div>

                        {/* Portfolio Links Block */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.35 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                            <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
                                    <Link2Icon className="w-3.5 h-3.5 text-amber-500" /> Portfolio Coordinates
                                </h3>
                                {isEditing && (
                                    <button 
                                        id="btn-add-link"
                                        onClick={handleAddLink}
                                        className="p-1 px-2.5 bg-zinc-900 border border-zinc-800 text-amber-400 rounded-lg hover:bg-amber-950/40 hover:border-amber-500/30 transition-all flex items-center gap-1.5 text-[9px] font-black uppercase cursor-pointer"
                                    >
                                        <Plus className="w-3 h-3" /> Add Link
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        {portfolioLinks.map((link, idx) => (
                                            <div key={link.id} className="p-3 bg-black/40 border border-zinc-905 border-zinc-900 rounded-xl space-y-2 relative group hover:border-zinc-800 transition-colors">
                                                <button 
                                                    id={`btn-remove-link-${link.id}`}
                                                    onClick={() => handleRemoveLink(link.id)}
                                                    className="absolute top-2 right-2 p-1 text-zinc-550 hover:text-red-500 cursor-pointer transition-colors"
                                                    title="Delete Link"
                                                >
                                                    <Trash2Icon className="w-3.5 h-3.5" />
                                                </button>
                                                <div className="space-y-1.5 text-left">
                                                    <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Link Title</label>
                                                    <input 
                                                        id={`input-link-label-${link.id}`}
                                                        value={link.label}
                                                        onChange={e => handleUpdateLink(link.id, 'label', e.target.value)}
                                                        className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                                                        placeholder="e.g. Website Catalog"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Address URL</label>
                                                    <input 
                                                        id={`input-link-url-${link.id}`}
                                                        value={link.url}
                                                        onChange={e => handleUpdateLink(link.id, 'url', e.target.value)}
                                                        className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                                                        placeholder="e.g. https://github.com..."
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {portfolioLinks.length === 0 && (
                                            <p className="text-[10px] text-zinc-650 italic text-center py-2 uppercase font-mono">No links generated.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {portfolioLinks.map(link => (
                                            <a 
                                                id={`link-node-${link.id}`}
                                                key={link.id}
                                                href={link.url} 
                                                target="_blank" 
                                                referrerPolicy="no-referrer"
                                                className="flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl hover:border-amber-500/20 hover:bg-zinc-900/90 transition-all duration-150 group"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-7 h-7 bg-amber-950/20 border border-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                                                        <GlobeIcon className="w-3.5 h-3.5 text-amber-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase text-zinc-200 tracking-wider group-hover:text-amber-400 transition-colors truncate">{link.label}</p>
                                                        <p className="text-[8px] text-zinc-500 truncate max-w-[210px] font-mono leading-none mt-1">{link.url.replace(/^https?:\/\//i, '')}</p>
                                                    </div>
                                                </div>
                                                <ExternalLinkIcon className="w-3.5 h-3.5 text-zinc-650 group-hover:text-amber-500 transition-colors shrink-0" />
                                            </a>
                                        ))}
                                        {portfolioLinks.length === 0 && (
                                            <div className="text-center py-4 border border-zinc-900 border-dashed rounded-xl">
                                                <p className="text-[9px] text-zinc-605 text-zinc-600 uppercase font-bold">No active portfolio coordinates set.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Active Reserves testing Widget */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
                                        <Coins className="w-3.5 h-3.5 text-emerald-500" /> Active Testing Assets
                                    </h3>
                                    <p className="text-[8px] text-zinc-650 text-zinc-650 uppercase font-bold mt-1">Local sandbox storage simulation</p>
                                </div>
                                <button
                                    onClick={handleMintMockAssets}
                                    className="p-1 px-2.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-900/40 transition-all text-[8px] font-black uppercase cursor-pointer flex items-center gap-1"
                                >
                                    + Seed Assets
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(reserveState?.reserves || []).map((asset: any) => {
                                    let IconComponent = GlobeIcon;
                                    let iconColor = "text-amber-500 bg-amber-950/20 border-amber-500/10";
                                    if (asset.subtype === 'solar_power') {
                                        IconComponent = ZapIcon;
                                        iconColor = "text-yellow-500 bg-yellow-950/20 border-yellow-500/10";
                                    } else if (asset.subtype === 'grain') {
                                        IconComponent = BookOpenIcon;
                                        iconColor = "text-orange-400 bg-orange-950/20 border-orange-500/10";
                                    } else if (asset.subtype === 'iron_ore') {
                                        IconComponent = DatabaseIcon;
                                        iconColor = "text-sky-400 bg-sky-950/20 border-sky-500/10";
                                    }

                                    return (
                                        <div key={asset.subtype} className="p-3 bg-black/40 border border-zinc-900 rounded-xl relative group hover:border-zinc-800 transition-all">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${iconColor}`}>
                                                        <IconComponent className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-[9.5px] font-black text-zinc-200 uppercase tracking-wider block truncate">{asset.subtype.replace('_', ' ')}</span>
                                                        <span className="text-[8px] text-zinc-500 uppercase font-black tracking-wide font-mono leading-none mt-1 block">
                                                            Value: {asset.cphPerUnit} CPH / {asset.unit}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="flex items-center bg-zinc-950 border border-zinc-850 rounded-lg p-1 h-7">
                                                        <button 
                                                            onClick={() => handleUpdateAssetQuantity(asset.subtype, Math.max(0, asset.quantity - 10))}
                                                            className="px-1.5 text-[10px] hover:text-red-400 font-bold cursor-pointer"
                                                        >
                                                            -
                                                        </button>
                                                        <input 
                                                            type="text"
                                                            value={asset.quantity}
                                                            onChange={(e) => handleUpdateAssetQuantity(asset.subtype, parseInt(e.target.value) || 0)}
                                                            className="w-10 bg-transparent text-center text-[10px] font-bold font-mono text-white focus:outline-none"
                                                        />
                                                        <button 
                                                            onClick={() => handleUpdateAssetQuantity(asset.subtype, asset.quantity + 10)}
                                                            className="px-1.5 text-[10px] hover:text-emerald-400 font-bold cursor-pointer"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-zinc-550 lowercase select-none shrink-0">{asset.unit}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                    </div>

                    {/* Middle & Right Columns Combined (2 Cols Grid in Layout): Projects, Experiences & Education */}
                    <div id="middle-right-panels" className="lg:col-span-2 space-y-8">
                        
                        {/* SECTION 1: Work Experience & Professional History */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl relative overflow-hidden"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-orange-950/20 border border-orange-500/30 flex items-center justify-center">
                                        <BriefcaseIcon className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-extrabold text-white uppercase tracking-widest">Work History Logistics</h2>
                                        <p className="text-[8px] text-zinc-500 uppercase font-black mt-0.5">Chronicle of previous system engineering engagements</p>
                                    </div>
                                </div>
                                {isEditing && (
                                    <button 
                                        onClick={handleAddExperience}
                                        className="px-3 py-1.5 bg-orange-950/30 border border-orange-500/30 text-orange-400 rounded-xl hover:bg-orange-900/40 transition-all flex items-center gap-1.5 text-xs font-black uppercase cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Experience
                                    </button>
                                )}
                            </div>

                            {/* Experience Timeline */}
                            <div className="space-y-4">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        {workExperience.map((exp) => (
                                            <div key={exp.id} className="p-4 bg-black/40 border border-zinc-900 rounded-2xl relative space-y-3 hover:border-zinc-800 transition-colors">
                                                <button 
                                                    onClick={() => handleRemoveExperience(exp.id)}
                                                    className="absolute top-2 right-2 p-1 bg-red-950/20 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                                                    title="Remove Experience Log"
                                                >
                                                    <Trash2Icon className="w-3.5 h-3.5" />
                                                </button>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Company / Node</label>
                                                        <input 
                                                            value={exp.company}
                                                            onChange={e => handleUpdateExperience(exp.id, 'company', e.target.value)}
                                                            className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Coordinates / Position</label>
                                                        <input 
                                                            value={exp.position}
                                                            onChange={e => handleUpdateExperience(exp.id, 'position', e.target.value)}
                                                            className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Start Date</label>
                                                        <input 
                                                            type="date"
                                                            value={exp.startDate}
                                                            onChange={e => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                                                            className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-orange-500 h-8 cursor-pointer"
                                                        />
                                                    </div>
                                                    {!exp.isCurrent && (
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">End Date</label>
                                                            <input 
                                                                type="date"
                                                                value={exp.endDate}
                                                                onChange={e => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                                                                className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-orange-500 h-8 cursor-pointer"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-left pt-1">
                                                    <input 
                                                        id={`current-exp-toggle-${exp.id}`}
                                                        type="checkbox"
                                                        checked={exp.isCurrent}
                                                        onChange={e => handleUpdateExperience(exp.id, 'isCurrent', e.target.checked)}
                                                        className="w-3.5 h-3.5 bg-zinc-950 border border-zinc-800 rounded accent-orange-500"
                                                    />
                                                    <label htmlFor={`current-exp-toggle-${exp.id}`} className="text-[9px] uppercase font-bold text-zinc-400 select-none cursor-pointer">Currently active parameters at this node</label>
                                                </div>

                                                <div className="space-y-1 text-left">
                                                    <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Role Directives / Description</label>
                                                    <textarea 
                                                        value={exp.description}
                                                        onChange={e => handleUpdateExperience(exp.id, 'description', e.target.value)}
                                                        className="w-full bg-zinc-950 border border-zinc-850 rounded p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-orange-500 min-h-[60px] resize-none"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {workExperience.length === 0 && (
                                            <p className="text-[10px] text-zinc-650 italic text-center py-4 uppercase font-bold text-zinc-600">No active work chronicles logged.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative border-l border-zinc-900 ml-4 pl-6 space-y-6">
                                        {workExperience.map((exp) => (
                                            <div key={exp.id} className="relative select-text">
                                                {/* Timeline Node Ring */}
                                                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-zinc-950 border-2 border-orange-500 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                                        <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">{exp.position}</h4>
                                                        <span className="text-[8.5px] font-black tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded uppercase">
                                                            {exp.startDate} — {exp.isCurrent ? 'ACTIVE NOW' : exp.endDate}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-wider">{exp.company}</p>
                                                    <p className="text-xs text-zinc-400 font-mono leading-relaxed mt-1">{exp.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {workExperience.length === 0 && (
                                            <p className="text-zinc-600 italic text-xs pl-2 select-none">No professional coordinates logged.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* SECTION 2: Education History */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.25 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl relative overflow-hidden"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-violet-950/20 border border-violet-500/30 flex items-center justify-center">
                                        <GraduationCap className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-extrabold text-white uppercase tracking-widest">Education History Parameters</h2>
                                        <p className="text-[8px] text-zinc-500 uppercase font-black mt-0.5">Certifications & Academic Training metrics</p>
                                    </div>
                                </div>
                                {isEditing && (
                                    <button 
                                        onClick={handleAddEducation}
                                        className="px-3 py-1.5 bg-violet-950/30 border border-violet-500/30 text-violet-400 rounded-xl hover:bg-violet-900/40 transition-all flex items-center gap-1.5 text-xs font-black uppercase cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Academy
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        {education.map((edu) => (
                                            <div key={edu.id} className="p-4 bg-black/40 border border-zinc-900 rounded-2xl relative space-y-3 hover:border-zinc-800 transition-colors">
                                                <button 
                                                    onClick={() => handleRemoveEducation(edu.id)}
                                                    className="absolute top-2 right-2 p-1 bg-red-950/20 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                                                    title="Remove Academic Record"
                                                >
                                                    <Trash2Icon className="w-3.5 h-3.5" />
                                                </button>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Institution Academy</label>
                                                        <input 
                                                            value={edu.institution}
                                                            onChange={e => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                                                            className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-violet-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Degree Coordinate</label>
                                                        <input 
                                                            value={edu.degree}
                                                            onChange={e => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                                                            className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-violet-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Field Of Study</label>
                                                        <input 
                                                            value={edu.fieldOfStudy}
                                                            onChange={e => handleUpdateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                                                            className="w-full bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-violet-500"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Start Date</label>
                                                            <input 
                                                                type="date"
                                                                value={edu.startDate}
                                                                onChange={e => handleUpdateEducation(edu.id, 'startDate', e.target.value)}
                                                                className="w-full bg-zinc-950 border border-zinc-850 rounded px-2 py-0.5 text-[10px] text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer h-8"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">End Date</label>
                                                            <input 
                                                                type="date"
                                                                value={edu.endDate}
                                                                onChange={e => handleUpdateEducation(edu.id, 'endDate', e.target.value)}
                                                                className="w-full bg-zinc-950 border border-zinc-850 rounded px-2 py-0.5 text-[10px] text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer h-8"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 text-left">
                                                    <label className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Focus Details</label>
                                                    <textarea 
                                                        value={edu.description}
                                                        onChange={e => handleUpdateEducation(edu.id, 'description', e.target.value)}
                                                        className="w-full bg-zinc-950 border border-zinc-850 rounded p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 min-h-[60px] resize-none"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {education.length === 0 && (
                                            <p className="text-[10px] text-zinc-650 italic text-center py-4 uppercase font-bold text-zinc-600">No active academic coordinates logged.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative border-l border-zinc-900 ml-4 pl-6 space-y-6">
                                        {education.map((edu) => (
                                            <div key={edu.id} className="relative select-text">
                                                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-zinc-950 border-2 border-violet-500 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                                        <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">{edu.degree}</h4>
                                                        <span className="text-[8.5px] font-black tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded uppercase">
                                                            {edu.startDate} — {edu.endDate}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-violet-450 text-violet-400 uppercase tracking-wider">{edu.institution} // {edu.fieldOfStudy}</p>
                                                    <p className="text-xs text-zinc-400 font-mono leading-relaxed mt-1">{edu.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {education.length === 0 && (
                                            <p className="text-zinc-600 italic text-xs pl-2 select-none">No academy coordinates logged.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* SECTION 3: Custom Projects Portfolio + Star Ratings & Endorsements */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/2 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-center">
                                        <FolderIcon className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-extrabold text-white uppercase tracking-widest">Operator Project Portfolio Showcase</h2>
                                        <p className="text-[8px] text-zinc-500 uppercase font-black mt-0.5">Showcase of finished development and rated deployments</p>
                                    </div>
                                </div>
                                {isEditing ? (
                                    <button 
                                        onClick={handleAddProject}
                                        className="px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-900/40 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase cursor-pointer"
                                    >
                                        <PlusSquareIcon className="w-4 h-4" /> Add Project
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <span className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 select-none text-zinc-300">
                                            <span className="w-1.5 h-1.5 bg-emerald-405 bg-emerald-400 rounded-full" /> {currentProjects.length} Active
                                        </span>
                                        <span className="px-2.5 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 select-none">
                                            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full" /> {pastProjects.length} Completed
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {isEditing ? (
                                    <div className="space-y-6">
                                        {profileProjects.map((p, idx) => (
                                            <div key={p.id} className="bg-black/40 border border-zinc-900 p-4 rounded-2xl space-y-4 group relative hover:border-zinc-800 transition-colors">
                                                <div className="flex justify-between items-center bg-zinc-950/60 p-2 px-3 rounded-lg border border-zinc-900">
                                                    <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wider flex items-center gap-1.5 select-none">
                                                        <span className="bg-zinc-800 text-zinc-400 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold">{idx + 1}</span>
                                                        Project Configuration
                                                    </span>
                                                    <button 
                                                        onClick={() => handleRemoveProject(p.id)}
                                                        className="text-xs text-zinc-650 hover:text-red-500 flex items-center gap-1 cursor-pointer font-black uppercase tracking-wider transition-colors bg-zinc-950 px-2 py-1 rounded"
                                                    >
                                                        <Trash2Icon className="w-3.5 h-3.5 text-red-500" /> Delete
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Project Title</label>
                                                        <input 
                                                            value={p.title}
                                                            onChange={e => handleUpdateProject(p.id, 'title', e.target.value)}
                                                            className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Defined Role</label>
                                                        <input 
                                                            value={p.roleDefined || ''}
                                                            onChange={e => handleUpdateProject(p.id, 'roleDefined', e.target.value)}
                                                            className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                                            placeholder="e.g. Lead Dev"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Project URL / Link</label>
                                                        <input 
                                                            value={p.link || ''}
                                                            onChange={e => handleUpdateProject(p.id, 'link', e.target.value)}
                                                            className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                                                            placeholder="https://github.com..."
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Status</label>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleUpdateProject(p.id, 'status', 'current')}
                                                                className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all ${p.status === 'current' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:border-zinc-800'}`}
                                                            >
                                                                Active (Current)
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleUpdateProject(p.id, 'status', 'past')}
                                                                className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all ${p.status === 'past' ? 'bg-zinc-900 text-zinc-300 border-zinc-700' : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:border-zinc-800'}`}
                                                            >
                                                                Completed (Past)
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5 text-left">
                                                    <label className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Detailed Description</label>
                                                    <textarea 
                                                        value={p.description}
                                                        onChange={e => handleUpdateProject(p.id, 'description', e.target.value)}
                                                        className="w-full bg-zinc-950 border border-zinc-850 rounded p-3 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 min-h-[90px] resize-none"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {profileProjects.length === 0 && (
                                            <div className="text-center py-10 border border-dashed border-zinc-800 rounded-2xl">
                                                <FolderIcon className="w-10 h-10 text-zinc-800 mx-auto mb-2" />
                                                <p className="text-xs text-zinc-500 uppercase font-black">Lattice coordinates empty. Select Add Project above.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-8 select-text">
                                        
                                        {/* Active operations list */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] select-none">
                                                <ClockIcon className="w-3.5 h-3.5 text-emerald-400" /> Active operations ({currentProjects.length})
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentProjects.map(p => {
                                                    const averageRating = p.rating || 5;
                                                    const endorseCount = (p.endorsements || []).length;
                                                    const alreadyEndorsed = (p.endorsements || []).includes('Operator-You');

                                                    return (
                                                        <div id={`view-project-card-${p.id}`} key={p.id} className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl hover:border-emerald-500/20 transition-all group flex flex-col justify-between space-y-4">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <span className="text-sm font-extrabold text-emerald-450 text-emerald-400 group-hover:text-emerald-300 transition-colors tracking-tight line-clamp-1">{p.title}</span>
                                                                    {p.link && (
                                                                        <a 
                                                                            href={p.link} 
                                                                            target="_blank" 
                                                                            referrerPolicy="no-referrer"
                                                                            className="text-zinc-600 hover:text-emerald-400 p-0.5 shrink-0"
                                                                            title="Visit deployment link"
                                                                        >
                                                                            <ExternalLinkIcon className="w-4 h-4" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-zinc-400 leading-relaxed font-mono line-clamp-3">{p.description}</p>
                                                            </div>

                                                            {/* Rating & Endorsement Interactivity */}
                                                            <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-900 space-y-2 select-none">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-[9px] uppercase font-bold text-zinc-500">Rating:</span>
                                                                        <div className="flex items-center gap-0.5">
                                                                            {[1, 2, 3, 4, 5].map(starValue => (
                                                                                <button 
                                                                                    key={starValue}
                                                                                    onClick={() => handleRateProject(p.id, starValue)}
                                                                                    className="text-zinc-600 hover:text-yellow-400 transition-colors cursor-pointer"
                                                                                    title={`Rate ${starValue} Stars`}
                                                                                >
                                                                                    <Star className={`w-3 h-3 ${starValue <= Math.round(averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-700'}`} />
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                        <span className="text-[9px] font-mono font-bold text-zinc-400 ml-1">({averageRating})</span>
                                                                    </div>
                                                                    
                                                                    {/* Thumbs up endorse button */}
                                                                    <button 
                                                                        onClick={() => handleEndorseProject(p.id)}
                                                                        className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-widest cursor-pointer transition-all uppercase flex items-center gap-1 shrink-0 ${
                                                                            alreadyEndorsed 
                                                                                ? 'bg-emerald-600 text-black font-extrabold' 
                                                                                : 'bg-zinc-900 border border-zinc-800 text-emerald-400 hover:bg-zinc-800'
                                                                        }`}
                                                                        title="Endorse this code architecture"
                                                                    >
                                                                        <ThumbsUp className="w-2.5 h-2.5" />
                                                                        <span>{alreadyEndorsed ? 'ENDORSED' : 'ENDORSE'}</span>
                                                                    </button>
                                                                </div>

                                                                {/* Endorsements details line */}
                                                                {p.endorsements && p.endorsements.length > 0 && (
                                                                    <div className="text-[8px] text-zinc-500 uppercase font-black tracking-wider pt-1 border-t border-zinc-900 flex justify-between">
                                                                        <span>Endorsed by:</span>
                                                                        <span className="text-emerald-400 truncate max-w-[140px]">{p.endorsements.join(', ')}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-between border-t border-zinc-850/40 pt-3 text-[9px] text-zinc-500 uppercase font-black select-none">
                                                                <span className="flex items-center gap-1.5">
                                                                    <BriefcaseIcon className="w-3 h-3 text-emerald-600" />
                                                                    Role: {p.roleDefined || 'Developer'}
                                                                </span>
                                                                <span className="text-[8px] bg-emerald-950/30 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10 shrink-0">ACTIVE_FLOW</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {currentProjects.length === 0 && (
                                                    <div className="col-span-2 text-center py-6 border border-zinc-905 border-dashed rounded-xl">
                                                        <p className="text-[10px] text-zinc-650 italic text-zinc-500">No operational conjunctions currently running.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* past Completed operations list */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] select-none">
                                                <CheckCircle2Icon className="w-3.5 h-3.5 text-zinc-500" /> Completed milestones ({pastProjects.length})
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {pastProjects.map(p => {
                                                    const averageRating = p.rating || 5;
                                                    const alreadyEndorsed = (p.endorsements || []).includes('Operator-You');
                                                    return (
                                                        <div id={`view-project-card-${p.id}`} key={p.id} className="bg-zinc-900/20 border border-zinc-900/60 p-4 rounded-xl hover:border-zinc-800 transition-all group flex flex-col justify-between space-y-4">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <span className="text-sm font-extrabold text-zinc-450 text-zinc-400 tracking-tight line-clamp-1">{p.title}</span>
                                                                    {p.link && (
                                                                        <a 
                                                                            href={p.link} 
                                                                            target="_blank" 
                                                                            referrerPolicy="no-referrer"
                                                                            className="text-zinc-650 hover:text-zinc-400 p-0.5 shrink-0"
                                                                            title="View deploy archive"
                                                                        >
                                                                            <ExternalLinkIcon className="w-4 h-4" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-zinc-500 leading-relaxed font-mono line-clamp-3">{p.description}</p>
                                                            </div>

                                                            {/* Rating & Endorsement Interactivity */}
                                                            <div className="bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900/60 gap-3 space-y-1.5 select-none">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-[8px] uppercase font-bold text-zinc-500">Rating:</span>
                                                                        <div className="flex items-center gap-0.5">
                                                                            {[1, 2, 3, 4, 5].map(starValue => (
                                                                                <button 
                                                                                    key={starValue}
                                                                                    onClick={() => handleRateProject(p.id, starValue)}
                                                                                    className="text-zinc-750 hover:text-yellow-400 transition-colors cursor-pointer"
                                                                                >
                                                                                    <Star className={`w-2.5 h-2.5 ${starValue <= Math.round(averageRating) ? 'text-yellow-600 fill-yellow-600' : 'text-zinc-800'}`} />
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <button 
                                                                        onClick={() => handleEndorseProject(p.id)}
                                                                        className={`px-1.5 py-0.5 rounded text-[7px] font-mono tracking-wider cursor-pointer transition-all uppercase flex items-center gap-1 shrink-0 ${
                                                                            alreadyEndorsed 
                                                                                ? 'bg-zinc-700 text-white font-extrabold' 
                                                                                : 'bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-emerald-400'
                                                                        }`}
                                                                    >
                                                                        <ThumbsUp className="w-2 h-2" />
                                                                        <span>{alreadyEndorsed ? 'ENDORSED' : 'ENDORSE'}</span>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between border-t border-zinc-900/40 pt-3 text-[9px] text-zinc-550 text-zinc-500 uppercase font-black select-none">
                                                                <span className="flex items-center gap-1.5">
                                                                    <BriefcaseIcon className="w-3 h-3 text-zinc-700" />
                                                                    Role: {p.roleDefined || 'Developer'}
                                                                </span>
                                                                <span className="text-[8px] bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-850 select-none shrink-0 font-bold">ARCHIVED</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {pastProjects.length === 0 && (
                                                    <div className="col-span-2 text-center py-6 border border-zinc-905 border-dashed rounded-xl">
                                                        <p className="text-[10px] text-zinc-650 italic text-zinc-500">No past milestones registered.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Cryptographic Encryption Keys Vault */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4">
                                <div>
                                    <h3 id="vault-section-title" className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <KeyIcon className="w-4 h-4 text-amber-500" /> Crypto Access Keys
                                    </h3>
                                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold mt-1">Local cryptographically encrypted operator key registry</p>
                                </div>
                                {profile.role === 'operator' && (
                                    <button 
                                        id="btn-generate-api-key"
                                        onClick={handleGenerateKey}
                                        className="p-1 px-3 bg-amber-950/20 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-900/40 transition-all active:scale-95 text-[9px] font-black uppercase flex items-center gap-1.5 cursor-pointer"
                                        title="Generate Cryptographic Key"
                                    >
                                        <PlusSquareIcon className="w-3.5 h-3.5" /> Initialize G-Key
                                    </button>
                                )}
                            </div>

                            {/* Derivation Signature container */}
                            <div className="mb-6 p-4 bg-red-950/10 border border-red-900/30 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldIcon className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase text-red-500 tracking-[0.15em] leading-none">Security Protocol: AES-GCM-256 (v3)</span>
                                </div>
                                <p className="text-[9px] text-zinc-500 mb-4 leading-relaxed font-mono">
                                    {profile.role === 'operator' 
                                        ? "Configure your private local passphrase to derived cryptography signatures. Missing passphrases fall back to DEFAULT_VAULT_2026."
                                        : "Observer mode constraints prevent signature derivation. Cryptography parameters are locked."}
                                </p>
                                {profile.role === 'operator' && (
                                    <div className="flex gap-2 max-w-md text-left">
                                        <input 
                                            id="input-vault-passphrase"
                                            type="password"
                                            value={passphrase}
                                            onChange={e => setPassphrase(e.target.value)}
                                            placeholder="Enter derivation signature..."
                                            className="flex-1 bg-black/60 border border-red-900/30 rounded px-2.5 py-2 text-[10px] text-red-400 focus:outline-none focus:border-red-500 font-mono tracking-widest h-9"
                                        />
                                        <button 
                                            id="btn-vault-engage"
                                            onClick={handleSetPassphrase}
                                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer h-9 ${isPassphraseSet ? 'bg-emerald-600 text-zinc-950 font-extrabold' : 'bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-zinc-950 hover:border-red-500'}`}
                                        >
                                            {isPassphraseSet ? 'Engaged' : 'Engage'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {isKeysLoading ? (
                                    <div className="text-center py-6">
                                        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        <p className="text-[8px] text-amber-500/50 uppercase font-black">Decrypting_Vault_Lattice...</p>
                                    </div>
                                ) : apiKeys.length === 0 ? (
                                    <div className="text-center py-6 border border-dashed border-zinc-905 border-zinc-900 rounded-xl">
                                        <AlertCircleIcon className="w-5 h-5 text-zinc-700 mx-auto mb-1.5" />
                                        <p className="text-[10px] text-zinc-650 font-black uppercase">No active cryptographic access keys</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-text">
                                        {apiKeys.map(key => (
                                            <div key={key.id} className="bg-black/40 border border-zinc-900 rounded-xl p-4 group hover:border-amber-500/20 transition-all flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-4 mb-2 select-none">
                                                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-wider leading-none">Authentication Key</span>
                                                        <button 
                                                            onClick={() => handleRevokeKey(key.id)}
                                                            className="p-1 text-zinc-550 hover:text-red-500 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer rounded hover:bg-zinc-950"
                                                            title="Revoke Key"
                                                        >
                                                            <Trash2Icon className="w-3.5 h-3.5 animate-pulse" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs font-mono font-bold text-zinc-350 break-all select-all pr-2 tracking-tight">{key.key}</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-900 text-[8px] text-zinc-500 uppercase font-black select-none">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        Expires: {key.expirationDate}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-emerald-500">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                                        Active
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                    </div>
                </div>

            </div>
        </div>
    );
};
