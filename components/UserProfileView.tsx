import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, NetworkProject, PortfolioLink, ProfileProject, WorkExperience, Education, ProfileProjectTestimonial, GlitchTelemetry, ChatMessage } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { PortfolioProjectCard } from './PortfolioProjectCard';
import { AIDossierPanel } from './AIDossierPanel';
import { compileAIProfile } from '../services/aiProfileService';
import { recordTrustAction } from '../services/aiTrustService';
import { getHighestConferredRankNumber, getRankSpec } from '../services/aiTrustCharter';
import { UserIcon, CodeIcon, XIcon, ShieldIcon } from './icons';
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
    ThumbsUp,
    Send,
    RefreshCw,
    Bot,
    Search,
    AlertTriangle,
    GitBranch,
    Mail,
    Cpu
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { safeStorage } from '../services/safeStorage';
import { reputationService } from '../services/reputationService';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ApiKey {
    id: string;
    key: string;
    expirationDate: string;
    createdAt: number;
}

interface UserProfileViewProps {
    profile: UserProfile;
    projects: NetworkProject[];
    glitchHistory?: GlitchTelemetry[];
    messages?: ChatMessage[];
    onUpdateProfile: (updates: Partial<UserProfile>) => void;
    onSetView?: (view: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
    profile,
    projects,
    glitchHistory = [],
    messages = [],
    onUpdateProfile,
    onSetView
}) => {
    const [editForm, setEditForm] = useState<UserProfile>(profile);

    // Discovery identifiers ONLY — AI authors all profile content, strengths, and flaws
    const [lookupIdentifier, setLookupIdentifier] = useState(profile.username || '');
    const [lookupGithubUrl, setLookupGithubUrl] = useState(profile.githubUrl || profile.contactInfo?.github || '');
    const [lookupPortfolioUrl, setLookupPortfolioUrl] = useState(profile.portfolioUrl || profile.contactInfo?.website || '');
    const [lookupEmail, setLookupEmail] = useState(profile.contactInfo?.email || 'resurrectionofmoses@gmail.com');
    const [includeWorkspaceContext, setIncludeWorkspaceContext] = useState(true);
    const [isCompilingAI, setIsCompilingAI] = useState(false);
    const [aiCompileError, setAiCompileError] = useState<string | null>(null);
    
    // Manage state lists with fallbacks
    const [portfolioLinks, setPortfolioLinks] = useState<PortfolioLink[]>([]);
    const [profileProjects, setProfileProjects] = useState<ProfileProject[]>([]);
    const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [skillEndorsements, setSkillEndorsements] = useState<Record<string, string[]>>({});
    const [radarViewMode, setRadarViewMode] = useState<'CATEGORY' | 'INDIVIDUAL'>('CATEGORY');
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    
    // Request Endorsements peer flow states
    const [requestingSkill, setRequestingSkill] = useState<string | null>(null);
    const [selectedPeerForRequest, setSelectedPeerForRequest] = useState<string>('CyberWeaver_X');
    const [isBroadcastingRequest, setIsBroadcastingRequest] = useState(false);
    const [broadcastStep, setBroadcastStep] = useState(0);
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
        
        const asset = (currentReserve?.reserves || [])?.find?.((r: any) => r && r.subtype === subtype);
        if (asset) {
            asset.quantity = newQty;
            asset.totalValue = asset.quantity * asset.cphPerUnit;
        }
        
        const totalValue = (currentReserve?.reserves || []).reduce((acc: number, curr: any) => acc + (curr?.totalValue || 0), 0);
        if (currentReserve) {
            currentReserve.totalBackedCPH = totalValue;
            currentReserve.netResourceBalance = totalValue;
            currentReserve.cphInStorage = totalValue - (currentReserve.cphInCirculation || 0);
            if (currentReserve.cphInStorage < 0) currentReserve.cphInStorage = 0;
        }

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

        (currentReserve?.reserves || []).forEach((asset: any) => {
            if (asset) {
                if (asset.subtype === 'solar_power') asset.quantity = (asset.quantity || 0) + 500;
                if (asset.subtype === 'grain') asset.quantity = (asset.quantity || 0) + 100;
                if (asset.subtype === 'iron_ore') asset.quantity = (asset.quantity || 0) + 250;
                asset.totalValue = asset.quantity * (asset.cphPerUnit || 0);
            }
        });

        const totalValue = (currentReserve?.reserves || []).reduce((acc: number, curr: any) => acc + (curr?.totalValue || 0), 0);
        if (currentReserve) {
            currentReserve.totalBackedCPH = totalValue;
            currentReserve.netResourceBalance = totalValue;
            currentReserve.cphInStorage = totalValue - (currentReserve.cphInCirculation || 0);
            if (currentReserve.cphInStorage < 0) currentReserve.cphInStorage = 0;
        }

        localStorage.setItem('aetheros_resource_reserve', JSON.stringify(currentReserve));
        setReserveState(currentReserve);
    };

    // Bind state values when user profile is updated or loaded
    useEffect(() => {
        setLookupIdentifier(profile.username || '');
        setLookupGithubUrl(profile.githubUrl || profile.contactInfo?.github || '');
        setLookupPortfolioUrl(profile.portfolioUrl || profile.contactInfo?.website || '');
        setLookupEmail(profile.contactInfo?.email || 'resurrectionofmoses@gmail.com');

        const isAIAuthored = Boolean(profile.aiAuthored || profile.aiDossier);

        const enrichedProfile: UserProfile = {
            ...profile,
            tagline: profile.tagline || (isAIAuthored ? 'AI-audited developer profile' : 'Awaiting AI Profile Audit — run AI Audit below'),
            avatarUrl: profile.avatarUrl || '',
            sovereigntyTier: profile.sovereigntyTier || 3,
            areasOfInterest: profile.areasOfInterest || [],
            lookingFor: profile.lookingFor || [],
            lookingForSkills: profile.lookingForSkills || [],
            willingToTeachSkills: profile.willingToTeachSkills || [],
            contactInfo: profile.contactInfo || {
                email: 'resurrectionofmoses@gmail.com',
                github: profile.githubUrl || '',
                website: profile.portfolioUrl || ''
            },
            categorizedSkills: profile.categorizedSkills || (
                isAIAuthored
                    ? []
                    : [
                        { category: 'Frontend', skills: ['React', 'TypeScript', 'Tailwind CSS'] },
                        { category: 'Backend', skills: ['Node.js', 'Express'] }
                    ]
            )
        };
        setEditForm(enrichedProfile);

        setPortfolioLinks(profile.portfolioLinks || []);
        setProfileProjects(profile.profileProjects || []);
        setWorkExperience(profile.workExperience || []);
        setEducation(profile.education || []);
        setSkillEndorsements(profile.skillEndorsements || {});
    }, [profile]);

    const handleRunAIAudit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const identifier = lookupIdentifier.trim() || profile.username || 'Operator';
        setIsCompilingAI(true);
        setAiCompileError(null);
        try {
            const result = await compileAIProfile({
                identifier,
                githubUrl: lookupGithubUrl.trim() || undefined,
                portfolioUrl: lookupPortfolioUrl.trim() || undefined,
                email: lookupEmail.trim() || undefined,
                includeWorkspaceContext,
                existingProfile: profile,
                projects,
                glitchHistory,
                messages
            });
            onUpdateProfile(result.profileUpdates);
            await recordTrustAction({
                category: 'AI_ASSIST',
                actionType: 'AI_PROFILE_AUDIT',
                summary: `Completed AI unfiltered dossier audit for @${result.profileUpdates.username || identifier}`,
                target: 'UserProfileView',
                trustPointsAwarded: 12
            });
            toast.success(`AI audit completed for ${result.profileUpdates.username || identifier}`, {
                description: 'Unfiltered strengths, flaws, projects, and evidence compiled by Gemini.'
            });
        } catch (err: any) {
            const msg = err?.message || 'AI profile audit failed.';
            setAiCompileError(msg);
            toast.error('AI Profile Audit Failed', { description: msg });
        } finally {
            setIsCompilingAI(false);
        }
    };

    const radarData = useMemo(() => {
        const categories = editForm?.categorizedSkills || [
            { category: 'Frontend', skills: ['React', 'TypeScript', 'Tailwind CSS'] },
            { category: 'Backend', skills: ['Node.js', 'Express'] },
            { category: 'Data & AI', skills: ['Gemini SDK'] }
        ];

        if (radarViewMode === 'CATEGORY') {
            return categories.map(cat => {
                let totalScore = 0;
                const skillList = cat.skills || [];
                skillList.forEach(s => {
                    const endorsementsCount = (skillEndorsements[s] || []).length;
                    const score = Math.min(100, 50 + endorsementsCount * 15);
                    totalScore += score;
                });
                const averageScore = skillList.length > 0 ? Math.round(totalScore / skillList.length) : 0;
                return {
                    subject: cat.category,
                    value: averageScore === 0 && skillList.length === 0 ? 0 : Math.max(15, averageScore)
                };
            });
        } else {
            const flatSkills = categories.flatMap(cat => cat.skills || []);
            const allSkills = flatSkills.length > 0 ? flatSkills : (editForm?.skills || []);
            
            const skillScores = allSkills.map(s => {
                const endorsementsCount = (skillEndorsements[s] || []).length;
                const score = Math.min(100, 50 + endorsementsCount * 15);
                return { subject: s, value: score };
            });

            const topSkills = [...skillScores]
                .sort((a, b) => b.value - a.value)
                .slice(0, 7);

            while (topSkills.length < 3) {
                topSkills.push({ subject: 'Lattice Core', value: 50 });
            }
            return topSkills;
        }
    }, [editForm?.categorizedSkills, editForm?.skills, skillEndorsements, radarViewMode]);

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
    const [reputationInfo, setReputationInfo] = useState<any>(null);

    const loadAndUpdateReputation = async () => {
        try {
            const username = profile.username || 'Aetheros_Prime';
            const repInfo = await reputationService.calculateReputation(username);
            setReputationScore(repInfo.reputationScore);
            setReputationInfo(repInfo);
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
        // Automatic background simulation of incoming peer endorsements while browsing
        const interval = setInterval(() => {
            if (isCompilingAI) return;
            // 20% chance every 45 seconds to receive a random peer endorsement
            if (Math.random() < 0.20) {
                handleReceivePeerEndorsement();
            }
        }, 45000);
        return () => clearInterval(interval);
    }, [editForm.skills, skillEndorsements, isCompilingAI]);

    useEffect(() => {
        const persistKeys = async () => {
            if (!isKeysLoading) {
                await safeStorage.setItem('aetheros_api_keys', JSON.stringify(apiKeys));
            }
        };
        persistKeys();
    }, [apiKeys, isKeysLoading]);

    // Note: Profile metadata (bio, skills, projects, experience, education) is AI-authored only.

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

    // Function to simulate receiving a peer endorsement
    const handleReceivePeerEndorsement = (forcedSkillName?: string, forcedPeerName?: string) => {
        const availablePeers = ['CyberWeaver_X', 'Validator_Solo', 'AcousticWeaver', 'Operator-Beta', 'Operator-Alpha', 'Operator-Gamma'];
        const currentSkills = editForm.skills || [];
        
        if (currentSkills.length === 0) {
            toast.error("No core skills listed on your profile to endorse. Please add a skill first!", {
                description: "The AetherOS node requires at least one active parameter.",
            });
            return;
        }

        const peerName = forcedPeerName || availablePeers[Math.floor(Math.random() * availablePeers.length)];
        const skillName = forcedSkillName || currentSkills[Math.floor(Math.random() * currentSkills.length)];

        const voters = skillEndorsements[skillName] || [];
        
        if (voters.includes(peerName)) {
            // Already endorsed by this peer, so let's find one that hasn't
            const nonVotedSkills = currentSkills.filter(s => !(skillEndorsements[s] || []).includes(peerName));
            if (nonVotedSkills.length > 0) {
                const newSkill = nonVotedSkills[Math.floor(Math.random() * nonVotedSkills.length)];
                const nextVoters = [...(skillEndorsements[newSkill] || []), peerName];
                const nextEndorsements = {
                    ...skillEndorsements,
                    [newSkill]: nextVoters
                };
                setSkillEndorsements(nextEndorsements);
                onUpdateProfile({
                    ...editForm,
                    skillEndorsements: nextEndorsements
                });
                toast.success(`@${peerName} endorsed your proficiency in ${newSkill}!`, {
                    description: "Your reputation has been enhanced in the AetherOS lattice network.",
                    duration: 6000,
                });
                setTimeout(() => {
                    loadAndUpdateReputation();
                }, 500);
            } else {
                toast.info(`@${peerName} has already fully endorsed all of your listed proficiencies!`, {
                    description: "High density of peer validation attained.",
                });
            }
            return;
        }

        const nextVoters = [...voters, peerName];
        const nextEndorsements = {
            ...skillEndorsements,
            [skillName]: nextVoters
        };

        setSkillEndorsements(nextEndorsements);
        
        // Propagate changes to parent and save
        onUpdateProfile({
            ...editForm,
            skillEndorsements: nextEndorsements
        });

        // Trigger the Toaster notification with a clean, high-contrast, professional design
        toast.success(`@${peerName} endorsed your proficiency in ${skillName}!`, {
            description: "Your reputation has been enhanced in the AetherOS lattice network.",
            duration: 6000,
        });

        // Refresh reputation score
        setTimeout(() => {
            loadAndUpdateReputation();
        }, 500);
    };

    const handleOpenRequestEndorsement = (skill: string) => {
        setRequestingSkill(skill);
        setSelectedPeerForRequest('CyberWeaver_X');
        setIsBroadcastingRequest(false);
        setBroadcastStep(0);
    };

    const handleSubmitEndorsementRequest = () => {
        if (!requestingSkill) return;
        setIsBroadcastingRequest(true);
        setBroadcastStep(1);

        // Step 1: Generating signature
        setTimeout(() => {
            setBroadcastStep(2);
            // Step 2: Routing through AetherOS lattice
            setTimeout(() => {
                setBroadcastStep(3);
                // Step 3: Broadcasting packet
                setTimeout(() => {
                    const currentSkill = requestingSkill;
                    const peer = selectedPeerForRequest;
                    
                    setIsBroadcastingRequest(false);
                    setRequestingSkill(null);
                    
                    toast.success(`Endorsement request transmitted for ${currentSkill}!`, {
                        description: `Your cryptographic request packet was successfully routed to @${peer}.`,
                        duration: 5000
                    });

                    // Peer reviews and endorses after 5 seconds!
                    setTimeout(() => {
                        handleReceivePeerEndorsement(currentSkill, peer);
                    }, 5000);

                }, 1000);
            }, 1000);
        }, 1000);
    };

    // Endorse and rate portfolio projects
    const handleEndorseProject = (projId: string) => {
        const currentUser = 'Operator-You';
        const nextProjs = (profileProjects || [])?.map?.(p => {
            if (p && p.id === projId) {
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
        const nextProjs = (profileProjects || [])?.map?.(p => {
            if (p && p.id === projId) {
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

    const handleProjectAddTestimonial = (projId: string, testimonial: ProfileProjectTestimonial) => {
        const nextProjs = (profileProjects || [])?.map?.(p => {
            if (p && p.id === projId) {
                const currentTestimonials = p.testimonials || [];
                const updatedTestimonials = [...currentTestimonials, testimonial];
                const currentCount = p.ratingsCount || 0;
                const newCount = currentCount + 1;
                const currentAvg = p.rating || 5;
                const newAvg = parseFloat(((currentAvg * currentCount + testimonial.rating) / newCount).toFixed(1));
                return { ...p, testimonials: updatedTestimonials, rating: newAvg, ratingsCount: newCount };
            }
            return p;
        });
        setProfileProjects(nextProjs);
        onUpdateProfile({ ...editForm, profileProjects: nextProjs });
    };

    // Manual experience, education, and mentorship editors intentionally removed — AI compiles the record.

    const handleGenerateKey = async () => {
        const newKey: ApiKey = {
            id: uuidv4(),
            key: `sk_live_v1_${Math.random().toString(36).substring(2, 12)}...`,
            expirationDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // 1 year
            createdAt: Date.now()
        };
        setApiKeys([...(apiKeys || []), newKey]);
    };

    const handleRevokeKey = async (id: string) => {
        setApiKeys((apiKeys || []).filter(k => k && k.id !== id));
    };

    // Manual link and project editors intentionally removed — AI compiles the record.

    const currentProjects = (profileProjects || []).filter(p => p && p.status === 'current');
    const pastProjects = (profileProjects || []).filter(p => p && p.status === 'past');

    const activeBadgeName = reputationInfo?.badgeName || (
        reputationScore >= 100 ? 'AetherOS Legendary Legend' :
        reputationScore >= 60 ? 'Elite Conduit' :
        reputationScore >= 30 ? 'Sovereign Architect' :
        reputationScore >= 10 ? 'Qualified Verifier' :
        'Initiative Node'
    );

    const activeBadgeClass = reputationInfo?.badgeClass || (
        reputationScore >= 100 ? 'bg-fuchsia-950/80 text-fuchsia-400 border-fuchsia-500/50 shadow-[0_0_12px_rgba(217,70,239,0.3)]' :
        reputationScore >= 60 ? 'bg-rose-950/80 text-rose-400 border-rose-500/45 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse' :
        reputationScore >= 30 ? 'bg-amber-950/80 text-amber-400 border-amber-500/40 shadow-[0_0_6px_rgba(245,158,11,0.2)]' :
        reputationScore >= 10 ? 'bg-teal-950/80 text-teal-400 border-teal-500/30' :
        'bg-zinc-900 text-zinc-400 border-zinc-800'
    );

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
                                    <span className="text-2xl font-black text-blue-300 tracking-tight select-none">
                                        {(profile.username || 'AI').slice(0, 2).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-zinc-950 rounded-full" title="Grid connection: Engaged" />
                        </div>

                        <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 id="view-username" className="text-3xl font-extrabold text-white tracking-tight">{profile.username}</h1>
                                <button 
                                    id="prominent-reputation-badge"
                                    onClick={() => onSetView && onSetView('reputation_leaderboard')}
                                    className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-[0_0_12px_rgba(0,0,0,0.6)] transition-all cursor-pointer hover:scale-105 active:scale-95 ${activeBadgeClass}`}
                                    title={`Holistic Reputation Badge: ${activeBadgeName}. Click to view Leaderboard.`}
                                >
                                    <Award className="w-4 h-4 text-current" />
                                    <span>{activeBadgeName}</span>
                                </button>
                                <span className="px-2.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <Bot className="w-3 h-3" /> AI-Compiled Dossier (Read-Only)
                                </span>
                                {(() => {
                                    const rankNum = Math.max(
                                        profile.aiTrustRankNumber || 0,
                                        getHighestConferredRankNumber(profile.grantedRanks)
                                    );
                                    const spec = rankNum > 0 ? getRankSpec(rankNum) : null;
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => onSetView && onSetView('ai_trust_covenant')}
                                            className="px-2.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer hover:bg-cyan-900/40 transition-colors"
                                            title="Open AI Trust & Permanent Rank Covenant"
                                        >
                                            <ShieldIcon className="w-3 h-3 text-cyan-400" />
                                            <span>
                                                {spec
                                                    ? `Rank ${spec.romanNumeral} · ${spec.title} (Set in Stone)`
                                                    : 'AI Rank: Unconferred'}
                                            </span>
                                        </button>
                                    );
                                })()}
                            </div>

                            {profile.realName && (
                                <p className="text-xs font-mono text-amber-300 mt-1">
                                    Real Name Attested: <span className="text-white font-bold">{profile.realName}</span> · Portable Credential Active
                                </p>
                            )}

                            {profile.tagline && (
                                <p id="view-tagline" className="text-sm font-semibold text-zinc-300 tracking-wide flex items-center gap-2 my-1">
                                    <span className="text-blue-400 font-mono text-xs">⚡</span>
                                    <span>{profile.tagline}</span>
                                </p>
                            )}
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
                                    (profile.sovereigntyTier || 3) === 5 ? 'bg-fuchsia-950/80 text-fuchsia-400 border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.3)]' :
                                    (profile.sovereigntyTier || 3) === 4 ? 'bg-rose-950/80 text-rose-400 border-rose-500/45' :
                                    (profile.sovereigntyTier || 3) === 3 ? 'bg-amber-950/80 text-amber-400 border-amber-500/40' :
                                    (profile.sovereigntyTier || 3) === 2 ? 'bg-teal-950/80 text-teal-400 border-teal-500/30' :
                                    'bg-zinc-900 text-zinc-400 border-zinc-800'
                                }`} title={`Sovereignty Tier: ${profile.sovereigntyTier || 3}`}>
                                    <ShieldIcon className="w-3.5 h-3.5 text-current/85" />
                                    Sovereign Tier {profile.sovereigntyTier || 3}
                                </span>

                                <span className="text-zinc-800 text-xs font-black">//</span>

                                <button 
                                    id="reputation-badge" 
                                    onClick={() => onSetView && onSetView('reputation_leaderboard')}
                                    className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                                        reputationScore >= 100 ? 'bg-fuchsia-950/80 text-fuchsia-400 border-fuchsia-500/50 hover:scale-105' :
                                        reputationScore >= 60 ? 'bg-rose-950/80 text-rose-400 border-rose-500/45 hover:scale-105' :
                                        reputationScore >= 30 ? 'bg-amber-950/80 text-amber-400 border-amber-500/40 hover:scale-105' :
                                        reputationScore >= 10 ? 'bg-teal-950/80 text-teal-400 border-teal-500/30 hover:scale-105' :
                                        'bg-zinc-900 text-zinc-400 border-zinc-800 hover:scale-105'
                                    } cursor-pointer`} 
                                    title={`Click to view Leaderboard. Reputation points: ${reputationScore}`}
                                >
                                    <Award className="w-3.5 h-3.5 text-current" />
                                    <span>REP: {reputationScore}</span>
                                </button>

                                <span className="text-zinc-800 text-xs font-black">//</span>
                                <div className="flex items-center gap-1.5">
                                    <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider leading-none">{profile.sovereignty || 'SOVEREIGN_SYSTEM'}</span>
                                </div>
                                <span className="text-zinc-800 text-xs font-black">//</span>
                                <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900 uppercase font-bold">Hash: {profile.id.substring(0, 8)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="shrink-0 flex flex-wrap gap-2 w-full md:w-auto justify-end border-t border-zinc-900 md:border-t-0 pt-4 md:pt-0">
                        {onSetView && (
                            <button 
                                id="btn-open-trust-covenant"
                                onClick={() => onSetView('ai_trust_covenant')} 
                                className="px-4 py-2.5 bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 rounded-xl hover:bg-cyan-900/40 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer"
                            >
                                <ShieldIcon className="w-3.5 h-3.5" /> AI Rank &amp; Seals
                            </button>
                        )}
                        {onSetView && (
                            <button 
                                id="btn-view-leaderboard"
                                onClick={() => onSetView('reputation_leaderboard')} 
                                className="px-4 py-2.5 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-xl hover:bg-rose-900/20 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer"
                            >
                                <Star className="w-3.5 h-3.5" /> View Leaderboard
                            </button>
                        )}
                        <button 
                            id="btn-ai-audit-profile"
                            onClick={() => handleRunAIAudit()}
                            disabled={isCompilingAI}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-zinc-950 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer"
                        >
                            {isCompilingAI ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Bot className="w-3.5 h-3.5" />
                            )}
                            {isCompilingAI ? 'Auditing...' : profile.aiDossier ? 'Re-Audit via AI' : 'Fill Profile via AI'}
                        </button>
                    </div>
                </motion.div>

                {/* AI-Granted Trust Rank & Permanent Set-in-Stone Covenant Summary */}
                <div className="bg-[#0b0f17] border border-cyan-500/25 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            <span className="text-amber-300 font-bold">IRREVOCABLE AI RANK CLEARANCE</span>
                            <span className="text-zinc-600">·</span>
                            <span className="text-zinc-300">
                                {profile.realName
                                    ? `Bound to ${profile.realName} (@${profile.username})`
                                    : `Bind your real name in AI Rank & Seals to lock credentials outside AetherOS`}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
                            <span className="text-white font-bold">
                                Current Rank:{' '}
                                {profile.aiTrustRankNumber
                                    ? `Rank ${getRankSpec(profile.aiTrustRankNumber).romanNumeral} — ${profile.aiTrustTitle || getRankSpec(profile.aiTrustRankNumber).title}`
                                    : 'Unranked (Request AI Trust Evaluation)'}
                            </span>
                            <span className="text-cyan-300">Trust Score: {profile.trustScore || 0} pts</span>
                            <span className="text-emerald-300">
                                {(profile.unlockedPermissions || []).length} AetherOS permissions ·{' '}
                                {(profile.grantedRanks || []).length} set-in-stone seal
                                {(profile.grantedRanks || []).length === 1 ? '' : 's'}
                            </span>
                        </div>
                        {profile.aiTrustVerdict && (
                            <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                                {profile.aiTrustVerdict}
                            </p>
                        )}
                    </div>
                    {onSetView && (
                        <button
                            type="button"
                            onClick={() => onSetView('ai_trust_covenant')}
                            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-bold shrink-0 cursor-pointer transition-colors"
                        >
                            Evaluate Trust &amp; Export Certificate
                        </button>
                    )}
                </div>

                {/* AI Discovery & Audit Control Strip (Identifiers Only — No Manual Spin Editing) */}
                <form
                    onSubmit={handleRunAIAudit}
                    className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                <Search className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                                    AI-Authored Profile Investigation
                                </h2>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                    Only supply identifiers below so Gemini knows who to inspect. Manual bio, skill, and project spin-editing is disabled — AI puts verified wins and flaws on display.
                                </p>
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer shrink-0 select-none">
                            <input
                                type="checkbox"
                                checked={includeWorkspaceContext}
                                onChange={(e) => setIncludeWorkspaceContext(e.target.checked)}
                                className="rounded border-zinc-700 bg-black accent-emerald-500"
                            />
                            Inspect live workspace, projects &amp; glitch telemetry
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <label className="block space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Target Name or Handle</span>
                            <input
                                value={lookupIdentifier}
                                onChange={(e) => setLookupIdentifier(e.target.value)}
                                placeholder="e.g. moses or GitHub handle"
                                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                        </label>
                        <label className="block space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                                <GitBranch className="w-3 h-3 text-zinc-500" /> GitHub URL
                            </span>
                            <input
                                value={lookupGithubUrl}
                                onChange={(e) => setLookupGithubUrl(e.target.value)}
                                placeholder="https://github.com/username"
                                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                        </label>
                        <label className="block space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                                <GlobeIcon className="w-3 h-3 text-zinc-500" /> Website / Portfolio URL
                            </span>
                            <input
                                value={lookupPortfolioUrl}
                                onChange={(e) => setLookupPortfolioUrl(e.target.value)}
                                placeholder="https://yoursite.dev"
                                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                        </label>
                        <label className="block space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-zinc-500" /> Associated Email
                            </span>
                            <input
                                value={lookupEmail}
                                onChange={(e) => setLookupEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                        </label>
                    </div>

                    {aiCompileError && (
                        <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-2 text-xs text-red-200">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <span>{aiCompileError}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRunAIAudit()}
                                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer shrink-0"
                            >
                                Retry Audit
                            </button>
                        </div>
                    )}

                    {isCompilingAI && (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 flex items-center gap-3 text-xs text-emerald-200">
                            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                            <span>Gemini is auditing repository structure, session telemetry, glitch logs, and public search findings — compiling strengths and flaws...</span>
                        </div>
                    )}
                </form>

                {/* Unfiltered AI Dossier Panel: The Good & The Bad */}
                <AIDossierPanel dossier={profile.aiDossier} username={profile.username} />

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
                                <InfoIcon className="w-3.5 h-3.5 text-blue-400" strokeWidth={3} /> AI-Compiled Biography
                            </h3>
                            <p id="view-bio" className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono">
                                {profile.bio || <span className="text-zinc-600 italic text-xs">Run an AI Audit above to generate a candid biography from real evidence.</span>}
                            </p>
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
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 bg-emerald-950/20 border border-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                                    <BriefcaseIcon className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-zinc-200 tracking-wider">AI-Assessed Tier</p>
                                    <p id="view-experience-level" className="text-xs text-emerald-400 font-mono mt-0.5">{profile.experienceLevel || 'Unverified — run AI audit'}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Programming Languages + AI Evidence */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.18 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-3 flex items-center gap-2">
                                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> AI-Audited Languages
                            </h3>
                            {(profile.programmingLanguages || []).length > 0 ? (
                                <div className="space-y-2.5">
                                    {(profile.programmingLanguages || []).map((lang) => (
                                        <div key={lang.name} className="rounded-xl border border-zinc-900 bg-black/40 p-2.5 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-bold text-white">{lang.name}</span>
                                                <span className="text-[10px] font-mono text-cyan-400 uppercase">{lang.proficiency} · {lang.years}y</span>
                                            </div>
                                            {lang.aiEvidence && (
                                                <p className="text-[10px] text-zinc-400 leading-relaxed">{lang.aiEvidence}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] text-zinc-600 italic">No verified language footprint yet. Trigger an AI audit above.</p>
                            )}
                        </motion.div>

                        {/* Categorized Technical Skills with Endorsement Ratings */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
                                    <CodeIcon className="w-3.5 h-3.5 text-purple-400" /> Categorized Skills & Endorsements
                                </h3>
                                <button
                                    onClick={() => handleReceivePeerEndorsement()}
                                    className="text-[8px] font-mono tracking-wider text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/25 hover:border-purple-500/50 px-2 py-1 rounded cursor-pointer transition-all flex items-center gap-1 uppercase"
                                    title="Simulate receiving an endorsement from a network peer"
                                >
                                    <SparklesIcon className="w-2.5 h-2.5 text-purple-400" /> Sim Recv Endorsement
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {(editForm?.categorizedSkills || []).map(cat => (
                                    <div key={cat.category} className="space-y-1.5 text-left">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">{cat.category}</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <AnimatePresence>
                                                {cat.skills.map(skill => {
                                                    const endorseCount = (skillEndorsements?.[skill] || []).length;
                                                    const alreadyEndorsed = (skillEndorsements?.[skill] || []).includes('Operator-You');
                                                    const viewProficiency = profile.skillProficiencies?.[skill] || 'Intermediate';

                                                    const getProficiencyStyle = (p: string) => {
                                                        switch(p) {
                                                            case 'Beginner': return 'bg-zinc-900 border-zinc-800 text-zinc-400';
                                                            case 'Intermediate': return 'bg-blue-950/10 border-blue-500/25 text-blue-400';
                                                            case 'Advanced': return 'bg-purple-950/10 border-purple-500/25 text-purple-400';
                                                            case 'Expert': return 'bg-amber-950/10 border-amber-500/25 text-amber-500';
                                                            case 'Master': return 'bg-emerald-950/10 border-emerald-500/25 text-emerald-400';
                                                            default: return 'bg-zinc-900 border-zinc-800 text-zinc-400';
                                                        }
                                                    };

                                                    return (
                                                        <motion.div 
                                                            key={skill} 
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="bg-purple-950/10 border border-purple-900/40 rounded-lg p-2 flex items-center justify-between gap-3 text-[10px] uppercase font-black"
                                                        >
                                                            <div className="flex flex-col gap-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-purple-300 truncate tracking-wider font-mono text-[9.5px]">{skill}</span>
                                                                    <button 
                                                                        onClick={() => handleEndorseSkill(skill)}
                                                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${alreadyEndorsed ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 hover:text-amber-300'}`}
                                                                    >
                                                                        <ThumbsUp className="w-3 h-3" />
                                                                        <span className="font-mono text-[10px]">{endorseCount}</span>
                                                                    </button>
                                                                </div>
                                                                <span className={`text-[7.5px] px-1 py-0.5 rounded border max-w-max uppercase tracking-wider font-mono font-bold leading-none ${getProficiencyStyle(viewProficiency)}`}>
                                                                    {viewProficiency}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <button 
                                                                    onClick={() => handleEndorseSkill(skill)}
                                                                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono tracking-widest cursor-pointer transition-all uppercase flex items-center gap-1 ${
                                                                        alreadyEndorsed 
                                                                            ? 'bg-purple-600 text-black font-black' 
                                                                            : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500 text-purple-400'
                                                                    }`}
                                                                    title="Endorse this tech parameter"
                                                                >
                                                                    <ThumbsUp className="w-2.5 h-2.5" />
                                                                    {alreadyEndorsed ? 'ENDORSED' : 'ENDORSE'}
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleOpenRequestEndorsement(skill)}
                                                                    className="px-1.5 py-0.5 rounded text-[8px] font-mono tracking-widest cursor-pointer transition-all uppercase flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/20 hover:border-purple-500 text-purple-400 hover:text-white"
                                                                    title="Request peer validation"
                                                                >
                                                                    <Send className="w-2.5 h-2.5" />
                                                                    Request
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                                {cat.skills.length === 0 && (
                                                    <span className="text-[8px] text-zinc-600 italic pl-1 font-mono">No skills listed in this category.</span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))}
                                {(editForm?.categorizedSkills || []).length === 0 && (
                                    <span className="text-[9px] text-zinc-600 italic font-mono block">No categorized skills audited yet.</span>
                                )}
                            </div>
                        </motion.div>

                        {/* Verified Skill Signature Matrix (Radar Chart Visualizer) */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.22 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
                                        <Award className="w-3.5 h-3.5 text-purple-400" /> Verified Skill Signature Matrix
                                    </h3>
                                    <p className="text-[9px] text-zinc-400 mt-1 font-mono">
                                        Base: 50% for declared skills, Peer validation: +15% per endorsement (max 100%).
                                    </p>
                                </div>
                            </div>

                            {/* View toggle */}
                            <div className="flex bg-black/40 p-1 rounded-xl border border-zinc-900 mb-4 self-start">
                                <button
                                    onClick={() => setRadarViewMode('CATEGORY')}
                                    className={`px-3 py-1 text-[9px] font-mono font-black rounded-lg transition-all ${radarViewMode === 'CATEGORY' ? 'bg-purple-600 text-black' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    CATEGORY VIEW
                                </button>
                                <button
                                    onClick={() => setRadarViewMode('INDIVIDUAL')}
                                    className={`px-3 py-1 text-[9px] font-mono font-black rounded-lg transition-all ${radarViewMode === 'INDIVIDUAL' ? 'bg-purple-600 text-black' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    TOP TECH STACK
                                </button>
                            </div>

                            {/* Radar Chart rendering */}
                            <div className="h-[250px] w-full flex items-center justify-center relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
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
                        </motion.div>

                        {/* Mentoring & Teaching Expertise Block */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.25 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg relative overflow-hidden text-left"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                            <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
                                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> Mentorship & Teaching
                                </h3>
                            </div>
                            
                            <p className="text-[9px] text-zinc-500 uppercase tracking-wide font-mono mb-4">
                                Skills this member is willing to teach or mentor others on:
                            </p>

                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {(editForm?.willingToTeachSkills || []).map(skill => (
                                        <div 
                                            key={skill}
                                            className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                                        >
                                            <BookOpenIcon className="w-3 h-3 text-emerald-500" />
                                            <span>{skill}</span>
                                        </div>
                                    ))}
                                    {(editForm?.willingToTeachSkills || []).length === 0 && (
                                        <div className="text-zinc-600 text-[9px] italic font-mono py-1">
                                            No mentoring areas inferred yet.
                                        </div>
                                    )}
                                </div>
                            </div>
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
                            </div>

                            <div className="space-y-2">
                                {(portfolioLinks || []).map(link => (
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
                                        <p className="text-[9px] text-zinc-600 uppercase font-bold">No verified portfolio links discovered.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Contact Coordinates Block */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.38 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
                                    <UserIcon className="w-3.5 h-3.5 text-blue-500" /> Contact Coordinates
                                </h3>
                            </div>

                            <div className="space-y-2">
                                <div className="p-2 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-center justify-between text-left">
                                    <div className="min-w-0">
                                        <p className="text-[8px] uppercase font-black text-zinc-500">Associated Email</p>
                                        <p className="text-[10px] text-zinc-200 font-mono truncate mt-0.5">{profile.contactInfo?.email || lookupEmail || 'Not set'}</p>
                                    </div>
                                </div>
                                {profile.contactInfo?.github && (
                                    <div className="p-2 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-center justify-between text-left">
                                        <div className="min-w-0">
                                            <p className="text-[8px] uppercase font-black text-zinc-500">GitHub</p>
                                            <p className="text-[10px] text-zinc-200 font-mono truncate mt-0.5">{profile.contactInfo.github}</p>
                                        </div>
                                    </div>
                                )}
                                {profile.contactInfo?.website && (
                                    <div className="p-2 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-center justify-between text-left">
                                        <div className="min-w-0">
                                            <p className="text-[8px] uppercase font-black text-zinc-500">Website</p>
                                            <p className="text-[10px] text-zinc-200 font-mono truncate mt-0.5">{profile.contactInfo.website}</p>
                                        </div>
                                    </div>
                                )}
                                {profile.contactInfo?.discord && (
                                    <div className="p-2 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-center justify-between text-left">
                                        <div className="min-w-0">
                                            <p className="text-[8px] uppercase font-black text-zinc-500">Discord Handle</p>
                                            <p className="text-[10px] text-zinc-200 font-mono truncate mt-0.5">{profile.contactInfo.discord}</p>
                                        </div>
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
                                {(reserveState?.reserves || [])?.map?.((asset: any) => {
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
                                        <p className="text-[8px] text-zinc-500 uppercase font-black mt-0.5">AI-verified employment or contributor engagements</p>
                                    </div>
                                </div>
                            </div>

                            {/* Experience Timeline */}
                            <div className="space-y-4">
                                <div className="relative border-l border-zinc-900 ml-4 pl-6 space-y-6">
                                    {(workExperience || [])?.map?.((exp) => (
                                        <div key={exp.id} className="relative select-text">
                                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-zinc-950 border-2 border-orange-500 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
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
                                        <p className="text-zinc-600 italic text-xs pl-2 select-none">No verified work history discovered.</p>
                                    )}
                                </div>
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
                                        <p className="text-[8px] text-zinc-500 uppercase font-black mt-0.5">AI-verified degrees &amp; credentials (empty if unverified)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative border-l border-zinc-900 ml-4 pl-6 space-y-6">
                                    {(education || [])?.map?.((edu) => (
                                        <div key={edu.id} className="relative select-text">
                                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-zinc-950 border-2 border-violet-500 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                                    <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">{edu.degree}</h4>
                                                    <span className="text-[8.5px] font-black tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded uppercase">
                                                        {edu.startDate} — {edu.endDate}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-black text-violet-400 uppercase tracking-wider">{edu.institution} // {edu.fieldOfStudy}</p>
                                                <p className="text-xs text-zinc-400 font-mono leading-relaxed mt-1">{edu.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {education.length === 0 && (
                                        <p className="text-zinc-600 italic text-xs pl-2 select-none">No verified academic credentials discovered.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* SECTION 3: AI-Audited Projects Portfolio + Critiques */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl relative overflow-hidden"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-center">
                                        <FolderIcon className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-extrabold text-white uppercase tracking-widest">AI-Audited Project Portfolio</h2>
                                        <p className="text-[8px] text-zinc-500 uppercase font-black mt-0.5">Shipped builds, incomplete efforts, and candid AI project critiques</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 select-none">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> {currentProjects.length} Active
                                    </span>
                                    <span className="px-2.5 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 select-none">
                                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full" /> {pastProjects.length} Completed
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-8 select-text">
                                {/* Active operations list */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] select-none">
                                        <ClockIcon className="w-3.5 h-3.5 text-emerald-400" /> Active operations ({currentProjects.length})
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(currentProjects || [])?.map?.(p => (
                                            <PortfolioProjectCard 
                                                key={p.id}
                                                project={p}
                                                isOwnProject={true}
                                                onAddTestimonial={handleProjectAddTestimonial}
                                                onEndorse={handleEndorseProject}
                                                onRate={handleRateProject}
                                                currentUsername={profile?.username || 'Operator-You'}
                                            />
                                        ))}
                                        {currentProjects.length === 0 && (
                                            <div className="col-span-2 text-center py-6 border border-zinc-900 border-dashed rounded-xl">
                                                <p className="text-[10px] italic text-zinc-500">No active projects audited yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Past completed operations list */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] select-none">
                                        <CheckCircle2Icon className="w-3.5 h-3.5 text-zinc-500" /> Completed milestones ({pastProjects.length})
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(pastProjects || [])?.map?.(p => (
                                            <PortfolioProjectCard 
                                                key={p.id}
                                                project={p}
                                                isOwnProject={true}
                                                onAddTestimonial={handleProjectAddTestimonial}
                                                onEndorse={handleEndorseProject}
                                                onRate={handleRateProject}
                                                currentUsername={profile?.username || 'Operator-You'}
                                            />
                                        ))}
                                        {pastProjects.length === 0 && (
                                            <div className="col-span-2 text-center py-6 border border-zinc-900 border-dashed rounded-xl">
                                                <p className="text-[10px] italic text-zinc-500">No completed projects audited yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                        {(apiKeys || [])?.map?.(key => (
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

            {/* Cryptographic Request Endorsement Modal */}
            <AnimatePresence>
                {requestingSkill && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
                        >
                            {/* Purple glow element */}
                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600" />
                            
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-[8px] font-black tracking-[0.2em] text-purple-400 uppercase font-mono block mb-1">Cryptographic validation</span>
                                    <h2 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                                        <Send className="w-4 h-4 text-purple-400" /> Request Skill Endorsement
                                    </h2>
                                </div>
                                <button 
                                    onClick={() => { if (!isBroadcastingRequest) setRequestingSkill(null); }}
                                    disabled={isBroadcastingRequest}
                                    className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg bg-zinc-900 border border-zinc-850 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs text-zinc-400 mb-4 font-mono leading-relaxed">
                                Transmit a signed network request packet requesting validation for your proficiency in <span className="text-purple-400 font-bold">"{requestingSkill}"</span> to an active peer node.
                            </p>

                            {!isBroadcastingRequest ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block mb-2">Select Network Connection</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['CyberWeaver_X', 'Validator_Solo', 'AcousticWeaver', 'Operator-Beta', 'Operator-Alpha', 'Operator-Gamma'].map(peer => (
                                                <button
                                                    key={peer}
                                                    type="button"
                                                    onClick={() => setSelectedPeerForRequest(peer)}
                                                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                                        selectedPeerForRequest === peer
                                                            ? 'bg-purple-950/20 border-purple-500 text-purple-300'
                                                            : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                                                    }`}
                                                >
                                                    <p className="text-[10px] font-black tracking-wider">@{peer}</p>
                                                    <p className="text-[8px] text-zinc-500 font-mono mt-0.5">Lattice Peer</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-900 flex justify-end gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setRequestingSkill(null)}
                                            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-850 hover:border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmitEndorsementRequest}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-black font-black rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/15"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            Transmit Request
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-950/20 border border-purple-500/20 flex items-center justify-center relative">
                                        <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black uppercase text-white tracking-widest font-mono">Broadcasting Request Packet</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">Target Node: @{selectedPeerForRequest}</p>
                                    </div>
                                    
                                    <div className="w-full max-w-xs bg-zinc-900/60 rounded-xl p-3 border border-zinc-900 text-left space-y-2">
                                        <div className="flex items-center gap-2 text-[9px] font-mono">
                                            <span className={`w-1.5 h-1.5 rounded-full ${broadcastStep >= 1 ? 'bg-purple-500 animate-pulse' : 'bg-zinc-800'}`} />
                                            <span className={broadcastStep >= 1 ? 'text-purple-300' : 'text-zinc-600'}>Generating packet signature...</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-mono">
                                            <span className={`w-1.5 h-1.5 rounded-full ${broadcastStep >= 2 ? 'bg-purple-500 animate-pulse' : 'bg-zinc-800'}`} />
                                            <span className={broadcastStep >= 2 ? 'text-purple-300' : 'text-zinc-600'}>Routing validation vectors...</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-mono">
                                            <span className={`w-1.5 h-1.5 rounded-full ${broadcastStep >= 3 ? 'bg-purple-500 animate-pulse' : 'bg-zinc-800'}`} />
                                            <span className={broadcastStep >= 3 ? 'text-purple-300' : 'text-zinc-600'}>Broadcasting package to peer...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
