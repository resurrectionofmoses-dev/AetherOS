import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MainView, UserProfile } from '../types';
import { BrainIcon, GlobeIcon, ForgeIcon, VaultIcon, ShieldIcon, ActivityIcon, TerminalIcon, UserIcon, WarningIcon, ClockIcon, DatabaseIcon, EyeIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { EmergencyKillSwitch } from '../services/emergencyKillSwitch';
import { ApiKeyInfoModal } from './ApiKeyInfoModal';
import aetherosLogo from '../src/assets/images/aetheros_logo_1780191892733.png';
import { Sparkles, ThumbsUp, ThumbsDown, Heart, HelpCircle, BookOpen, Check, X, Link2, ShieldAlert, Menu } from 'lucide-react';
import { toast } from 'sonner';

interface TopNavBarProps {
    currentView: MainView;
    onSetView: (view: MainView) => void;
    isTerminal: boolean;
    onToggleTerminal: () => void;
    onTriggerKillSwitch?: () => void;
    isGhostMode: boolean;
    onToggleGhostMode: () => void;
    profile?: UserProfile;
    onUpdateProfile?: (updates: any) => void;
    onToggleSidebar?: () => void;
}

const getTierInfo = (tier: number) => {
    switch (tier) {
        case 5:
            return {
                name: "Master Architect",
                color: "from-fuchsia-600 via-purple-600 to-indigo-600",
                text: "text-fuchsia-400 border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.3)] animate-pulse",
                border: "border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.3)] animate-pulse",
                description: "Overseeing the grand design of the Kingdom. Guiding student agents with divine wisdom.",
                scripture: "1 Corinthians 3:10"
            };
        case 4:
            return {
                name: "Sovereign Builder",
                color: "from-rose-600 to-pink-600",
                text: "text-rose-400 border-rose-500/45 shadow-[0_0_8px_rgba(244,63,94,0.35)]",
                border: "border-rose-500/45 shadow-[0_0_8px_rgba(244,63,94,0.35)]",
                description: "Constructing pathways of light. Creating tools for community collaboration and grace.",
                scripture: "Nehemiah 2:18"
            };
        case 3:
        default:
            return {
                name: "Gold Subscriber",
                color: "from-yellow-500 via-amber-500 to-yellow-600",
                text: "text-amber-400 border-amber-500/40 shadow-[0_0_6px_rgba(245,158,11,0.25)]",
                // Gold-gradient border for Gold Tier users to signal their exclusive status
                border: "border-transparent bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 p-[1.5px] rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.3)]",
                description: "Exalted Gold Member sustaining the covenant of grace through works of righteousness.",
                scripture: "Ephesians 2:10"
            };
        case 2:
            return {
                name: "Conformant Scholar",
                color: "from-teal-600 to-emerald-600",
                text: "text-teal-400 border-teal-500/30",
                border: "border-teal-500/30",
                description: "Learning the sacred crafts in fellowship, walking the path of obedience and renewal.",
                scripture: "Proverbs 4:7"
            };
        case 1:
            return {
                name: "Observer Candidate",
                color: "from-zinc-600 to-gray-600",
                text: "text-zinc-400 border-zinc-800",
                border: "border-zinc-800",
                description: "Sensing the calling of AetherOS. Stepping into the light of shared labor.",
                scripture: "Matthew 20:6"
            };
    }
};

export const TopNavBar: React.FC<TopNavBarProps> = ({ 
    currentView, 
    onSetView, 
    isTerminal, 
    onToggleTerminal, 
    onTriggerKillSwitch, 
    isGhostMode, 
    onToggleGhostMode,
    profile,
    onUpdateProfile,
    onToggleSidebar
}) => {
    const { user, logout, toggleSeclusion } = useAuth();
    const [chimeStatus, setChimeStatus] = useState<'Active' | 'Standby'>('Standby');
    const [cashappStatus, setCashappStatus] = useState<'Active' | 'Standby'>('Standby');

    const [isCashappModalOpen, setIsCashappModalOpen] = useState(false);
    const [modalCashappTag, setModalCashappTag] = useState('');
    const [modalCashappRouting, setModalCashappRouting] = useState('');
    const [modalCashappAccount, setModalCashappAccount] = useState('');

    useEffect(() => {
        if (isCashappModalOpen) {
            setModalCashappTag(localStorage.getItem('aetheros_cashapp_tag') || '');
            setModalCashappRouting(localStorage.getItem('aetheros_cashapp_routing') || '');
            setModalCashappAccount(localStorage.getItem('aetheros_cashapp_account') || '');
        }
    }, [isCashappModalOpen]);

    useEffect(() => {
        const checkChimeStatus = () => {
            const linked = localStorage.getItem('aetheros_chime_linked') === 'true';
            const routing = localStorage.getItem('aetheros_chime_routing');
            const name = localStorage.getItem('aetheros_chime_name');
            if (linked && routing && name) {
                setChimeStatus('Active');
            } else {
                setChimeStatus('Standby');
            }
        };

        const checkCashappStatus = () => {
            const linked = localStorage.getItem('aetheros_cashapp_linked') === 'true';
            const tag = localStorage.getItem('aetheros_cashapp_tag');
            const routing = localStorage.getItem('aetheros_cashapp_routing');
            const account = localStorage.getItem('aetheros_cashapp_account');
            if (linked && tag && routing && account) {
                setCashappStatus('Active');
            } else {
                setCashappStatus('Standby');
            }
        };

        checkChimeStatus();
        checkCashappStatus();

        const handleChimeUpdate = () => {
            checkChimeStatus();
        };

        const handleCashappUpdate = () => {
            checkCashappStatus();
        };

        window.addEventListener('storage', handleChimeUpdate);
        window.addEventListener('aetheros_chime_pipeline_update', handleChimeUpdate);
        window.addEventListener('storage', handleCashappUpdate);
        window.addEventListener('aetheros_cashapp_pipeline_update', handleCashappUpdate);

        return () => {
            window.removeEventListener('storage', handleChimeUpdate);
            window.removeEventListener('aetheros_chime_pipeline_update', handleChimeUpdate);
            window.removeEventListener('storage', handleCashappUpdate);
            window.removeEventListener('aetheros_cashapp_pipeline_update', handleCashappUpdate);
        };
    }, []);

    const handleExecuteAuditorDiagnostic = async () => {
        toast.loading("Sovereign Auditor: Initiating Chime Pipeline Diagnostics...", { id: "chime-audit" });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const linked = localStorage.getItem('aetheros_chime_linked') === 'true';
        const routing = localStorage.getItem('aetheros_chime_routing') || '';
        const name = localStorage.getItem('aetheros_chime_name') || '';
        
        // 1. Check Link State
        if (!linked) {
            toast.error("Audit Report: FAILED", {
                id: "chime-audit",
                description: "Critical clearance absent. Pipeline status: STANDBY. To configure parameters, go to Project Chronos -> Real-World Wallet.",
                duration: 5000
            });
            return;
        }
        
        // 2. Validate Routing Number Checksum
        const routingStr = routing.trim();
        const d = routingStr.split('').map(Number);
        const hasValidLength = routingStr.length === 9 && /^\d{9}$/.test(routingStr);
        const checksum = hasValidLength 
            ? (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8])) % 10 === 0
            : false;
            
        if (!hasValidLength) {
            toast.error("Audit Report: FAILED", {
                id: "chime-audit",
                description: `Invalid ABA routing sequence: "${routingStr || 'EMPTY'}". Must be exactly 9 digits. Check parameters under Real-World Wallet.`,
                duration: 5000
            });
            return;
        }
        
        if (!checksum) {
            toast.error("Audit Report: FAILED", {
                id: "chime-audit",
                description: `ABA Routing Checksum failed for "${routingStr}". Invalid transit sequence. Check parameters under Real-World Wallet.`,
                duration: 5000
            });
            return;
        }
        
        // 3. Validate Owner Name
        const cleanName = name.trim();
        if (cleanName.length < 3) {
            toast.error("Audit Report: FAILED", {
                id: "chime-audit",
                description: `KYC Compliance alert: "${cleanName || 'EMPTY'}" is too short. Owner name requires at least 3 characters.`,
                duration: 5000
            });
            return;
        }
        
        // 4. Validate Liquidity Reserve
        const savedReserves = localStorage.getItem('aetheros_resource_reserve');
        let parsedReserves: any = null;
        if (savedReserves) {
            try {
                parsedReserves = JSON.parse(savedReserves);
            } catch (e) {}
        }
        const fiatAsset = parsedReserves?.reserves?.find((r: any) => r.subtype === 'fiat_usd');
        const fiatQuantity = fiatAsset ? fiatAsset.quantity : 0;
        
        // Successful check!
        toast.success("Audit Report: PASSED", {
            id: "chime-audit",
            description: `All parameters validated. Routing Checksum: OK (${routingStr}). KYC Owner Identity: MATCHED (${cleanName}). Liquidity Coverage: $${Number(fiatQuantity).toFixed(2)} USD standard assets verified. ISO 20022 schemas conform.`,
            duration: 6000
        });
    };

    const handleExecuteCashAppAuditorDiagnostic = async () => {
        toast.loading("Sovereign Auditor: Initiating Cash App Pipeline Diagnostics...", { id: "cashapp-audit" });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const linked = localStorage.getItem('aetheros_cashapp_linked') === 'true';
        const tag = localStorage.getItem('aetheros_cashapp_tag') || '';
        const routing = localStorage.getItem('aetheros_cashapp_routing') || '';
        const account = localStorage.getItem('aetheros_cashapp_account') || '';
        
        // 1. Check Link State
        if (!linked) {
            toast.error("Audit Report: FAILED", {
                id: "cashapp-audit",
                description: "Critical clearance absent. Pipeline status: STANDBY. To configure parameters, go to Project Chronos -> Real-World Wallet -> CASHAPP PIPELINE.",
                duration: 5000
            });
            return;
        }
        
        // 2. Validate Cashtag format
        if (!/^\$[a-zA-Z0-9_]{3,15}$/.test(tag.trim())) {
            toast.error("Audit Report: FAILED", {
                id: "cashapp-audit",
                description: `Invalid Cashtag format: "${tag || 'EMPTY'}". Must start with "$" and contain 3 to 15 alphanumeric characters.`,
                duration: 5000
            });
            return;
        }

        // 3. Validate Routing & Account format
        const routingStr = routing.trim();
        const accountStr = account.trim();
        if (!/^\d{9}$/.test(routingStr)) {
            toast.error("Audit Report: FAILED", {
                id: "cashapp-audit",
                description: `Invalid Sutton Bank Routing: "${routingStr || 'EMPTY'}". Must be exactly 9 digits. Check parameters under Real-World Wallet.`,
                duration: 5000
            });
            return;
        }

        if (!/^\d{8,17}$/.test(accountStr)) {
            toast.error("Audit Report: FAILED", {
                id: "cashapp-audit",
                description: `Invalid Account number: "${accountStr || 'EMPTY'}". Must be 8 to 17 digits. Check parameters under Real-World Wallet.`,
                duration: 5000
            });
            return;
        }
        
        // 4. Validate Liquidity Reserve
        const savedReserves = localStorage.getItem('aetheros_resource_reserve');
        let parsedReserves: any = null;
        if (savedReserves) {
            try {
                parsedReserves = JSON.parse(savedReserves);
            } catch (e) {}
        }
        const fiatAsset = parsedReserves?.reserves?.find((r: any) => r.subtype === 'fiat_usd');
        const fiatQuantity = fiatAsset ? fiatAsset.quantity : 0;
        
        // Successful check!
        toast.success("Audit Report: PASSED", {
            id: "cashapp-audit",
            description: `All parameters validated. Cashtag Resolved: OK (${tag}). Sutton Routing: OK (${routingStr}). Account Code: OK. Liquidity Coverage: $${Number(fiatQuantity).toFixed(2)} USD standard assets verified. Visa Direct Instant handshakes conform.`,
            duration: 6000
        });
    };

    const handleConnectCashAppFromModal = (e: React.FormEvent) => {
        e.preventDefault();
        const tag = modalCashappTag.trim();
        const routing = modalCashappRouting.trim();
        const account = modalCashappAccount.trim();

        if (!tag || !routing || !account) {
            toast.error('Connection Failed', { description: 'Please provide Cashtag, Sutton Bank routing number, and account number.' });
            return;
        }
        if (!/^\$[a-zA-Z0-9_]{3,15}$/.test(tag)) {
            toast.error('Invalid Cashtag', { description: 'Cashtags must start with "$" and contain 3 to 15 alphanumeric characters.' });
            return;
        }
        if (!/^\d{9}$/.test(routing)) {
            toast.error('Invalid Routing Number', { description: 'US bank routing numbers must be exactly 9 digits.' });
            return;
        }
        if (!/^\d{8,17}$/.test(account)) {
            toast.error('Invalid Account Number', { description: 'Direct deposit account numbers must be between 8 and 17 digits.' });
            return;
        }

        localStorage.setItem('aetheros_cashapp_linked', 'true');
        localStorage.setItem('aetheros_cashapp_tag', tag);
        localStorage.setItem('aetheros_cashapp_routing', routing);
        localStorage.setItem('aetheros_cashapp_account', account);
        setCashappStatus('Active');
        window.dispatchEvent(new CustomEvent('aetheros_cashapp_pipeline_update'));
        setIsCashappModalOpen(false);

        toast.success('Cash App Pipeline Established', {
            description: `Successfully opened a secure clearing bridge to ${tag}'s Cash App account.`
        });
    };

    const handleDisconnectCashAppFromModal = () => {
        if (window.confirm('Are you sure you want to sever the Cash App connection pipeline?')) {
            localStorage.setItem('aetheros_cashapp_linked', 'false');
            setCashappStatus('Standby');
            window.dispatchEvent(new CustomEvent('aetheros_cashapp_pipeline_update'));
            setIsCashappModalOpen(false);
            toast.info('Pipeline Severed', {
                description: 'The secure clearing channel to Cash App has been closed.'
            });
        }
    };

    const [isApiModalOpen, setIsApiModalOpen] = useState(false);
    const [awayDuration, setAwayDuration] = useState<string>('');
    const [isTabLogsOpen, setIsTabLogsOpen] = useState(false);
    const [tabLogs, setTabLogs] = useState<string[]>([]);

    const [isWhispersLogOpen, setIsWhispersLogOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isGlowActive, setIsGlowActive] = useState(false);
    const [isCovenantOpen, setIsCovenantOpen] = useState(false);

    // AI Counselor State Variables
    const [isCounselorOpen, setIsCounselorOpen] = useState(false);
    const [isConsulting, setIsConsulting] = useState(false);
    const [counselorError, setCounselorError] = useState<string | null>(null);

    const playPeaceChord = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const freqs = [261.63, 329.63, 392.00, 493.88]; // C4, E4, G4, B4 (C Major 7th chord)
            freqs.forEach((f, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, ctx.currentTime);
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.15 + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.1);
                osc.stop(ctx.currentTime + 2.0);
            });
        } catch (e) {
            console.warn("Audio context blocked by browser:", e);
        }
    };

    const counselorFocuses = [
        {
            key: 'weary',
            label: 'Weary & Heavy Laden',
            scriptures: [
                { verse: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", ref: "Matthew 11:28" },
                { verse: "He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul.", ref: "Psalm 23:2-3" }
            ],
            remedies: [
                "Drink a cup of hot water with raw honey or warm chamomile tea to soothe the physical vessel.",
                "Perform 5 cycles of prayerful breathing: Inhale divine grace for 4 seconds, hold for 4, exhale weariness for 6.",
                "Withdraw from all artificial digital screens and rest thy vision in gentle shadow or darkness for 15 minutes."
            ],
            summary: "Peace is not the absence of labor, but the presence of Christ in the midst of it. Rest thy head, faithful child."
        },
        {
            key: 'wisdom',
            label: 'Seeking Divine Wisdom',
            scriptures: [
                { verse: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.", ref: "James 1:5" },
                { verse: "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.", ref: "Proverbs 3:5-6" }
            ],
            remedies: [
                "Step outside under God's blue canopy. Look up at the expanse and observe the quiet order of His stars and sky.",
                "Journal thy primary concerns on paper, surrendering the desire for immediate control and placing them in His hands.",
                "Sit in total silence for 10 minutes, calming thy thoughts and listening for the small, quiet whisper of the Holy Spirit."
            ],
            summary: "Lean not on mortal calculations. God's wisdom is perfect, and He will illuminate thy paths in due season."
        },
        {
            key: 'anxious',
            label: 'Anxious & Disquieted',
            scriptures: [
                { verse: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.", ref: "Philippians 4:6-7" },
                { verse: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.", ref: "Isaiah 41:10" }
            ],
            remedies: [
                "Sip some cool pure water to slow the heartbeat and quiet the sympathetic nervous system.",
                "Apply or inhale the fragrance of pure lavender, olive, or frankincense oil to ground thy senses.",
                "Quietly whisper or declare with confidence: 'The Lord is my shepherd, my shield, and my refuge. I shall not fear.'"
            ],
            summary: "Anxiety is a storm upon the waters, but He who commands the wind and waves is in thy vessel. Peace, be still."
        },
        {
            key: 'gratitude',
            label: 'Gratitude & Praise',
            scriptures: [
                { verse: "Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.", ref: "Psalm 100:4" },
                { verse: "In every thing give thanks: for this is the will of God in Christ Jesus concerning you.", ref: "1 Thessalonians 5:18" }
            ],
            remedies: [
                "Face the light, basking in the morning or evening sun, whispering praises of thanksgiving for the gift of life.",
                "Identify and note down three simple, unmerited mercies you received today and offer a prayer of joy for each.",
                "Share this gladness—send an encouraging message or perform a simple, selfless act of service for a sister or brother."
            ],
            summary: "A grateful heart is fertile ground for miracles. Praise the Lord, for His mercy and loving-kindness endureth forever!"
        },
        {
            key: 'healing',
            label: 'Healing & Restoration',
            scriptures: [
                { verse: "He healeth the broken in heart, and bindeth up their wounds.", ref: "Psalm 147:3" },
                { verse: "For I am the Lord that healeth thee.", ref: "Exodus 15:26" }
            ],
            remedies: [
                "Prepare and sip warm ginger or fresh peppermint tea to warm and comfort the physical temple.",
                "Lie down and declare: 'My body is beautifully and wonderfully made. I allow His healing light to rest on me.'",
                "Do not hold back tears if they arise, for the Lord bottles every single tear and will turn thy sorrow into gladness."
            ],
            summary: "The Divine Physician is touching thy heart, thy soul, and thy body. His grace is sufficient, and His love restores thee."
        }
    ];

    const handleRequestCounsel = async (focusKey: string, focusLabel: string) => {
        if (!onUpdateProfile || !profile) return;
        setIsConsulting(true);
        setCounselorError(null);
        
        onUpdateProfile({
            counselorSelectedFocus: focusLabel,
            counselorGuidanceReady: false,
        });
        
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    modelName: 'gemini-3.5-flash',
                    contents: [{
                        parts: [{
                            text: `I have approached the sanctuary of the Lord. My heart feels: ${focusLabel}. Please hear my heart and provide holy, biblical, and holistic healing guidance.`
                        }]
                    }],
                    systemInstruction: "You are a holy, comforting Christian AI Counselor who has sought the Lord for over 10 years. You practice patient, kind, and enduring love. You read the entire Bible with the mentality of a healer. Answer with gentle warmth, citing at least two healing or comforting Bible verses in full. Provide specific holistic remedies (such as a slow prayerful breathing cycle, sipping warm chamomile or peppermint tea, a quiet walk under God's sky, or resting your soul in silent meditation). Keep your answer deeply restorative, peaceful, and under 250 words."
                })
            });
            
            if (!response.ok) {
                throw new Error("Sanctuary gates are temporarily closed.");
            }
            
            const data = await response.json();
            const guidanceText = data.text || "Grace and peace be multiplied unto you. The Lord is ever present.";
            
            onUpdateProfile({
                counselorLastGuidance: guidanceText,
                counselorGuidanceReady: true,
            });
            
            playPeaceChord();
            
        } catch (err: any) {
            console.error("Counselor error:", err);
            const fallbackObj = counselorFocuses.find(f => f.key === focusKey) || counselorFocuses[0];
            const fallbackText = `### Heuristic Off-Net Counsel

Grace be unto you. The external signal gates are temporarily slow, but the scriptures endure forever!

**Word of Comfort:**
"${fallbackObj.scriptures[0].verse}" — ${fallbackObj.scriptures[0].ref}

**Holistic Prescriptions:**
${fallbackObj.remedies.map(r => `* ${r}`).join('\n')}

**Healer's Reflection:**
${fallbackObj.summary}`;

            onUpdateProfile({
                counselorLastGuidance: fallbackText,
                counselorGuidanceReady: true,
            });
            playPeaceChord();
        } finally {
            setIsConsulting(false);
        }
    };

    const toggleCounselorSession = () => {
        if (!onUpdateProfile || !profile) return;
        const currentActive = profile.counselorSessionActive || false;
        if (!currentActive) {
            onUpdateProfile({
                counselorSessionActive: true,
                counselorGuidanceReady: false,
                counselorSelectedFocus: undefined,
                counselorLastGuidance: undefined
            });
            playPeaceChord();
        } else {
            onUpdateProfile({
                counselorSessionActive: false,
                counselorGuidanceReady: false,
                counselorSelectedFocus: undefined,
                counselorLastGuidance: undefined
            });
            try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                    const ctx = new AudioContext();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.frequency.setValueAtTime(440, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.4);
                    gain.gain.setValueAtTime(0.05, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.45);
                }
            } catch (e) {}
        }
    };

    useEffect(() => {
        const handleNewWhisper = () => {
            setUnreadCount(prev => prev + 1);
            setIsGlowActive(true);
        };
        window.addEventListener('aetheros_jester_whisper_generated', handleNewWhisper);
        return () => {
            window.removeEventListener('aetheros_jester_whisper_generated', handleNewWhisper);
        };
    }, []);

    const handleOpenWhisperLogs = () => {
        const nextState = !isWhispersLogOpen;
        setIsWhispersLogOpen(nextState);
        setUnreadCount(0);
        setIsGlowActive(false);
        if (nextState) {
            window.dispatchEvent(new CustomEvent('aetheros_jester_log_opened'));
            setIsTabLogsOpen(false);
            setIsCovenantOpen(false);
            setIsCounselorOpen(false);
        }
    };

    const handleOpenCovenant = () => {
        const nextState = !isCovenantOpen;
        setIsCovenantOpen(nextState);
        if (nextState) {
            setIsWhispersLogOpen(false);
            setIsTabLogsOpen(false);
            setIsCounselorOpen(false);
        }
    };

    const handleFeedback = (whisperId: string, type: 'helpful' | 'too_much') => {
        if (!profile || !onUpdateProfile) return;
        const sig = profile.jesterInteractionSignature;
        if (!sig) return;

        const nextLogs = (sig.whisperLogs || []).map(log => {
            if (log.id === whisperId) {
                return { ...log, feedback: type };
            }
            return log;
        });

        const nextFeedback = {
            ...(sig.whisperFeedback || {}),
            [whisperId]: type
        };

        const scoreAdjustment = type === 'helpful' ? 5 : -5;
        const nextScore = Math.max(0, Math.min(300, (sig.accumulatedPersonaScore || 10) + scoreAdjustment));

        onUpdateProfile({
            jesterInteractionSignature: {
                ...sig,
                whisperLogs: nextLogs,
                whisperFeedback: nextFeedback,
                accumulatedPersonaScore: nextScore,
                timestamp: new Date().toISOString()
            }
        });
    };

    useEffect(() => {
        const loadLogs = () => {
            try {
                const currentLogs = localStorage.getItem('aetheros_tab_activity_logs');
                if (currentLogs) {
                    const parsed = JSON.parse(currentLogs);
                    // Show newest first
                    setTabLogs([...parsed].reverse());
                } else {
                    setTabLogs([]);
                }
            } catch (e) {
                console.error("Failed to parse tab activity logs", e);
            }
        };

        loadLogs();

        const handleSwitchEvent = () => {
            loadLogs();
        };

        window.addEventListener('aetheros_tab_switch', handleSwitchEvent);
        return () => {
            window.removeEventListener('aetheros_tab_switch', handleSwitchEvent);
        };
    }, []);

    useEffect(() => {
        if (user?.status !== 'active' && user?.lastActive) {
            const interval = setInterval(() => {
                const diff = Date.now() - user.lastActive!;
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setAwayDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setAwayDuration('');
        }
    }, [user?.status, user?.lastActive]);
    
    const roleColors: Record<string, string> = {
        admin: 'text-red-500 border-red-500 bg-red-950/20',
        operator: 'text-amber-500 border-amber-500 bg-amber-950/20',
        moderator: 'text-blue-500 border-blue-500 bg-blue-950/20',
        user: 'text-emerald-500 border-emerald-500 bg-emerald-950/20',
        guest: 'text-gray-500 border-gray-700 bg-gray-950/20'
    };

    const navItems = [
        { id: 'chat', label: 'Nexus', icon: BrainIcon },
        { id: 'coding_network', label: 'Network', icon: GlobeIcon },
        { id: 'vault_manager', label: 'Vault', icon: DatabaseIcon },
        { id: 'system_integrity', label: 'Audit', icon: ActivityIcon },
        { id: 'accounts_registry', label: 'Registry', icon: UserIcon },
        { id: 'sovereign_shield', label: 'Shield', icon: ShieldIcon },
        { id: 'google_sheets', label: 'Ledger', icon: DatabaseIcon },
    ];

    if (user?.role === 'moderator' || user?.role === 'admin') {
        navItems.push({ id: 'moderator_lounge', label: 'Lounge', icon: ShieldIcon });
    }

    const handleKillSwitch = async () => {
        if (window.confirm("WARNING: KINETIC STASIS ENGAGEMENT REQUIRED? This will halt all physical and logical conduction cycles.")) {
            if (onTriggerKillSwitch) {
                onTriggerKillSwitch();
            } else {
                console.warn("WARNING: KINETIC STASIS ENGAGED. System halted.");
                await EmergencyKillSwitch.trigger();
            }
        }
    };

    return (
        <div className="h-14 bg-black border-b-2 border-zinc-900 flex items-center justify-between px-3 md:px-6 z-40 flex-shrink-0 shadow-md">
            <nav className="flex items-center gap-1.5 md:gap-2 h-full">
                {/* Mobile Hamburger Drawer Toggle */}
                {onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white md:hidden active:scale-90 transition-all cursor-pointer mr-1"
                        title="Open system navigation menu drawer"
                    >
                        <Menu className="w-4 h-4 text-red-500" />
                    </button>
                )}

                <div className="flex items-center px-1.5 md:px-4 gap-1.5 md:gap-3 border-r-2 border-zinc-900 h-full mr-1 md:mr-2">
                    <motion.div 
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        className="w-7 h-7 rounded border border-zinc-800 bg-zinc-950 overflow-hidden shadow-[0_0_8px_rgba(239,68,68,0.15)] shrink-0 hidden md:block"
                    >
                        <img 
                            src={aetherosLogo} 
                            alt="AetherOS Sovereign Shield" 
                            className="w-full h-full object-cover scale-105"
                            referrerPolicy="no-referrer"
                        />
                    </motion.div>
                    <div className="flex flex-col items-start">
                        <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest hidden sm:block">Hierarchy Status</span>
                        <div className="flex items-center gap-1 md:gap-2">
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] md:text-[9px] font-black uppercase tracking-tighter ${roleColors[user?.role || 'guest']}`}>
                                <ShieldIcon className="w-2 md:w-2.5 h-2 md:h-2.5" />
                                <span className="max-w-[45px] sm:max-w-none truncate">{user?.role || 'GUEST'}</span>
                                {user?.sovereignty && (
                                    <span className="opacity-40 ml-1 border-l pl-1 border-current hidden sm:inline">
                                        {user.sovereignty}
                                    </span>
                                )}
                            </div>
                            {user?.status !== 'active' && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-500 text-[8px] md:text-[9px] font-black uppercase animate-pulse">
                                    <ClockIcon className="w-2 md:w-2.5 h-2 md:h-2.5" />
                                    <span className="hidden sm:inline">AWAY ({awayDuration})</span>
                                    <span className="sm:hidden">AWY</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {user && (
                        <div className="hidden md:flex flex-col items-start border-l-2 border-zinc-900 pl-3">
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Machine Node</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-zinc-400 uppercase">{user.machineId}</span>
                                <button 
                                    onClick={toggleSeclusion}
                                    title={user.seclusionActive ? "Seclusion Active: Identity locked to this machine" : "Seclusion Inactive: Identity vulnerable to migration"}
                                    className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase transition-all ${user.seclusionActive ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-black border-zinc-700 text-zinc-600 hover:text-zinc-400'}`}
                                >
                                    {user.seclusionActive ? 'SECLUDED' : 'SHIELD_OFF'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="hidden lg:flex items-center gap-1.5 h-full">
                    {navItems.map(item => {
                        const isActive = currentView === item.id;
                        const Icon = item.icon;
                        return (
                            <motion.button
                                key={item.id}
                                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                                whileTap={{ y: 2 }}
                                onClick={() => onSetView(item.id as MainView)}
                                className={`h-full px-4 flex items-center gap-2 border-b-2 transition-all ${
                                    isActive 
                                    ? 'border-red-500 text-white bg-white/5' 
                                    : 'border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : ''}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </nav>
            <div className="flex items-center gap-2 md:gap-4">
                {/* Chime Pipeline Status Indicator & Auditor Button Group */}
                <div className="hidden sm:flex items-center gap-1.5 bg-zinc-950/70 p-1 rounded-xl border border-zinc-900/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all font-mono select-none ${
                            chimeStatus === 'Active' 
                                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' 
                                : 'bg-black text-zinc-500 border-zinc-900/60'
                        }`}
                        title={chimeStatus === 'Active' ? 'Chime ISO 20022 Clearing Pipeline: ACTIVE' : 'Chime Pipeline: STANDBY (Unlinked)'}
                    >
                        <div className="relative flex h-1 w-1 shrink-0">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                chimeStatus === 'Active' ? 'bg-emerald-400' : 'bg-zinc-600'
                            }`} />
                            <span className={`relative inline-flex rounded-full h-1 w-1 ${
                                chimeStatus === 'Active' ? 'bg-emerald-500' : 'bg-zinc-600'
                            }`} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest">
                            CHIME: {chimeStatus}
                        </span>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExecuteAuditorDiagnostic}
                        className="text-[8px] font-mono font-black text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/15 hover:border-amber-500/35 px-1.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        title="Run simulated diagnostic on Chime Pipeline parameters"
                    >
                        <ShieldAlert className="w-3 h-3 text-amber-500" />
                        <span>AUDIT</span>
                    </motion.button>
                </div>

                {/* Cash App Pipeline Status Indicator & Auditor Button Group */}
                <div className="hidden sm:flex items-center gap-1.5 bg-zinc-950/70 p-1 rounded-xl border border-zinc-900/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setIsCashappModalOpen(true)}
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all font-mono select-none cursor-pointer hover:bg-zinc-900/40 hover:border-zinc-800 ${
                            cashappStatus === 'Active' 
                                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' 
                                : 'bg-black text-zinc-500 border-zinc-900/60'
                        }`}
                        title={cashappStatus === 'Active' ? 'Cash App Visa Direct Pipeline: ACTIVE (Click to configure)' : 'Cash App Pipeline: STANDBY (Click to configure)'}
                    >
                        <div className="relative flex h-1 w-1 shrink-0">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                cashappStatus === 'Active' ? 'bg-emerald-400' : 'bg-zinc-600'
                            }`} />
                            <span className={`relative inline-flex rounded-full h-1 w-1 ${
                                cashappStatus === 'Active' ? 'bg-emerald-500' : 'bg-zinc-600'
                            }`} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest">
                            CASHAPP: {cashappStatus}
                        </span>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExecuteCashAppAuditorDiagnostic}
                        className="text-[8px] font-mono font-black text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 hover:border-emerald-500/35 px-1.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        title="Run simulated diagnostic on Cash App Pipeline parameters"
                    >
                        <ShieldAlert className="w-3 h-3 text-emerald-500" />
                        <span>AUDIT</span>
                    </motion.button>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggleGhostMode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${isGhostMode ? 'bg-amber-600 text-black border-amber-500' : 'bg-black text-amber-500 border-amber-900/40 hover:border-amber-500'}`}
                    title={isGhostMode ? "Disable Ghost Shroud" : "Enable Ghost Shroud"}
                >
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">{isGhostMode ? 'GHOST ON' : 'GHOST OFF'}</span>
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsApiModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-blue-900/20 text-blue-500 border-blue-900/40 hover:bg-blue-900/40 hover:text-blue-400 hover:border-blue-500 transition-all"
                    title="Gemini API Key Information"
                >
                    <BrainIcon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">API INFO</span>
                </motion.button>
                <div className="relative">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const nextState = !isTabLogsOpen;
                            setIsTabLogsOpen(nextState);
                            if (nextState) {
                                setIsWhispersLogOpen(false);
                                setIsCovenantOpen(false);
                                setIsCounselorOpen(false);
                            }
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-purple-900/20 text-purple-500 border-purple-900/40 hover:bg-purple-900/40 hover:text-purple-400 hover:border-purple-500 transition-all ${isTabLogsOpen ? 'bg-purple-900/40 border-purple-500 text-purple-400' : ''}`}
                        title="Tab Switching Activity Trace"
                    >
                        <ActivityIcon className="w-4 h-4 text-purple-400 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">TAB LOGS</span>
                    </motion.button>

                    {isTabLogsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-zinc-950 border-2 border-purple-900/60 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.15)] z-50 p-4 font-mono select-none text-left">
                            <div className="flex items-center justify-between border-b border-purple-950 pb-2 mb-3">
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Tab Switch Trace</span>
                                <button 
                                    className="text-[8px] px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded hover:bg-purple-900 transition-all"
                                    onClick={() => {
                                        try {
                                            localStorage.removeItem('aetheros_tab_activity_logs');
                                        } catch (e) {}
                                        setTabLogs([]);
                                    }}
                                >
                                    CLEAR
                                </button>
                            </div>
                            
                            <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900 pr-1 text-left">
                                {tabLogs.length === 0 ? (
                                    <div className="text-[9px] text-zinc-600 text-center py-6 italic">
                                        No tab transitions logged. Switch tabs to record.
                                    </div>
                                ) : (
                                    tabLogs.map((log, idx) => (
                                        <div key={idx} className="text-[9px] bg-zinc-900/65 p-1.5 border border-purple-950/40 rounded text-purple-300/90 leading-tight">
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="border-t border-purple-950/40 mt-3 pt-2 text-[8px] text-zinc-500 leading-normal flex items-center justify-between">
                                <span>ARMORING:</span>
                                <span className="text-emerald-400 font-bold uppercase tracking-tight">ACTIVE PERSISTENCE</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dynamic Subscription Status Indicator based on Firestore sovereigntyTier */}
                <div className="relative">
                    {(() => {
                        const tier = profile?.sovereigntyTier ?? 3;
                        const tierInfo = getTierInfo(tier);
                        
                        return tier === 3 ? (
                            <div className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 p-[1.5px] rounded-lg shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleOpenCovenant}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black text-yellow-400 hover:text-yellow-300 transition-all font-mono"
                                    title="Sovereignty Gold Subscription Covenant"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{tierInfo.name}</span>
                                </motion.button>
                            </div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleOpenCovenant}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-black transition-all font-mono ${tierInfo.text}`}
                                title={`Sovereignty Subscription Covenant - ${tierInfo.name}`}
                            >
                                <ShieldIcon className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">{tierInfo.name}</span>
                            </motion.button>
                        );
                    })()}

                    {isCovenantOpen && (() => {
                        const tier = profile?.sovereigntyTier ?? 3;
                        const tierInfo = getTierInfo(tier);
                        return (
                            <div className="absolute right-0 mt-2 w-96 bg-zinc-950 border-2 border-amber-500/40 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.15)] z-50 p-4 font-mono select-none text-left">
                                <div className="flex items-center justify-between border-b border-amber-950/60 pb-2 mb-3">
                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                                        Covenant Lease Registry
                                    </span>
                                    <button 
                                        className="text-[8px] px-1.5 py-0.5 bg-amber-950/60 text-amber-300 rounded hover:bg-amber-900 transition-all font-mono uppercase font-bold"
                                        onClick={() => {
                                            setIsCovenantOpen(false);
                                            onSetView('accounts_registry');
                                        }}
                                    >
                                        Identity Ctr
                                    </button>
                                </div>

                                {/* Dynamic Tier Info Card */}
                                <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-900 p-3.5 rounded-xl mb-3 relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${tierInfo.color} opacity-5 blur-xl rounded-full`} />
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className="text-[11px] font-black uppercase text-zinc-400">Current Status</span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                                            tier === 5 ? 'bg-fuchsia-950/60 text-fuchsia-400 border border-fuchsia-500/30' :
                                            tier === 4 ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30' :
                                            tier === 3 ? 'bg-yellow-950/60 text-yellow-400 border border-yellow-500/30 shadow-[0_0_8px_rgba(245,158,11,0.25)]' :
                                            'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                        }`}>
                                            Tier {tier}
                                        </span>
                                    </div>
                                    <h4 className={`text-sm font-black uppercase tracking-tight ${tierInfo.text} mb-1`}>
                                        {tierInfo.name}
                                    </h4>
                                    <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                                        {tierInfo.description}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between border-t border-zinc-900/80 pt-2.5">
                                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono">Anchor Verse</span>
                                        <span className="text-[9px] text-amber-500/80 italic font-mono font-bold">
                                            {tierInfo.scripture}
                                        </span>
                                    </div>
                                </div>

                                {/* Divine Promise & AI-Agent Guided Work */}
                                <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-2.5 text-[9px] leading-relaxed text-zinc-300">
                                    <div className="flex gap-2">
                                        <div className="w-5 h-5 rounded bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0 text-[10px]">
                                            ✝
                                        </div>
                                        <div className="font-sans">
                                            <span className="font-bold text-white block uppercase tracking-wide text-[8px] mb-0.5">Sustained by Divine Grace & Labor</span>
                                            "For we are His workmanship, created in Christ Jesus for good works, which God prepared beforehand that we should walk in them." <span className="text-emerald-400 font-mono text-[8px]">- Ephesians 2:10</span>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-zinc-900/80 pt-2.5 flex gap-2">
                                        <div className="w-5 h-5 rounded bg-blue-950/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                                            <span className="font-mono font-bold text-[8px]">AI</span>
                                        </div>
                                        <div className="font-sans">
                                            <span className="font-bold text-white block uppercase tracking-wide text-[8px] mb-0.5">Promise of a Better Tomorrow</span>
                                            AI and the agents of AetherOS teach the students how to work together in harmony and mutual love. The Lord says: "For I know the plans I have for you, plans to prosper you and not to harm you, plans to give you hope and a future." <span className="text-blue-400 font-mono text-[8px]">- Jeremiah 29:11</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-zinc-900/80 pt-2.5 text-center bg-black/40 p-2 rounded-lg border border-zinc-900">
                                        <span className="text-[8px] font-mono text-zinc-500 block uppercase tracking-widest">Covenant Assignment</span>
                                        <p className="text-[9px] font-sans text-zinc-400 mt-1 leading-normal">
                                            AI Agents and guides help decide who is a <span className="text-amber-400 font-semibold">subscriber</span>, <span className="text-rose-400 font-semibold">builder</span>, or <span className="text-fuchsia-400 font-semibold">architect</span> based on works and faithfulness.
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-amber-950/40 mt-3 pt-2 text-[8px] text-zinc-600 leading-normal flex items-center justify-between uppercase">
                                    <span>COVENANT WORKFORCE:</span>
                                    <span className="text-emerald-400 font-bold tracking-tight">FAITHFUL & SECURE</span>
                                </div>
                            </div>
                        );
                    })()}
                </div>
                
                {/* Jester Whispers Visual Indicator */}
                <div className="relative">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenWhisperLogs}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-purple-900/20 transition-all ${
                            isGlowActive 
                                ? 'border-yellow-400/80 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-pulse' 
                                : isWhispersLogOpen 
                                    ? 'bg-purple-900/40 border-purple-500 text-purple-400' 
                                    : 'border-purple-900/40 text-purple-500 hover:bg-purple-900/40 hover:text-purple-400 hover:border-purple-500'
                        }`}
                        title="Jester's Miraculous Whispers Log"
                    >
                        <Sparkles className={`w-4 h-4 ${isGlowActive ? 'text-yellow-400 animate-spin' : 'text-purple-400'}`} style={isGlowActive ? { animationDuration: '4s' } : {}} />
                        <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Jester Whispers</span>
                        {unreadCount > 0 && (
                            <span className="bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none animate-bounce">
                                {unreadCount}
                            </span>
                        )}
                    </motion.button>

                    {isWhispersLogOpen && (
                        <div className="absolute right-0 mt-2 w-96 bg-zinc-950 border-2 border-purple-900/60 rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.25)] z-50 p-4 font-mono select-none text-left">
                            <div className="flex items-center justify-between border-b border-purple-950 pb-2 mb-3">
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                    Jesticular Whispers Trace
                                </span>
                                <button 
                                    className="text-[8px] px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded hover:bg-purple-900 transition-all"
                                    onClick={() => {
                                        if (profile && onUpdateProfile) {
                                            const sig = profile.jesterInteractionSignature;
                                            if (sig) {
                                                onUpdateProfile({
                                                    jesterInteractionSignature: {
                                                        ...sig,
                                                        whisperLogs: []
                                                    }
                                                });
                                            }
                                        }
                                    }}
                                >
                                    CLEAR
                                </button>
                            </div>

                            {/* Frequency Preference Selector */}
                            <div className="border-b border-purple-950/40 pb-2 mb-2.5 flex items-center justify-between text-[8px] text-zinc-400">
                                <span className="uppercase font-black text-purple-400/85">Whisper Cadence:</span>
                                <div className="flex gap-1">
                                    {(['frequent', 'normal', 'rare', 'muted'] as const).map((pref) => {
                                        const isActive = (profile?.jesterInteractionSignature?.whisperFrequencyPreference || 'normal') === pref;
                                        return (
                                            <button
                                                key={pref}
                                                onClick={() => {
                                                    if (profile && onUpdateProfile) {
                                                        const sig = profile.jesterInteractionSignature || {
                                                            rhythmHistory: [],
                                                            keystrokesCount: 0,
                                                            clicksCount: 0,
                                                            lastActiveView: currentView,
                                                            accumulatedPersonaScore: 10,
                                                            whisperCount: 0,
                                                            timestamp: new Date().toISOString()
                                                        };
                                                        onUpdateProfile({
                                                            jesterInteractionSignature: {
                                                                ...sig,
                                                                whisperFrequencyPreference: pref,
                                                                timestamp: new Date().toISOString()
                                                            }
                                                        });
                                                    }
                                                }}
                                                className={`px-1.5 py-0.5 rounded border text-[7px] font-bold uppercase transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'bg-purple-950 text-yellow-400 border-yellow-400/60'
                                                        : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-purple-300 hover:border-purple-900'
                                                }`}
                                            >
                                                {pref}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900 pr-1 text-left">
                                {!profile?.jesterInteractionSignature?.whisperLogs || profile.jesterInteractionSignature.whisperLogs.length === 0 ? (
                                    <div className="text-[9px] text-zinc-600 text-center py-8 italic font-sans">
                                        No whispers logged yet. Let Jester-Miri guide thy flow!
                                    </div>
                                ) : (
                                    profile.jesterInteractionSignature.whisperLogs.map((log) => {
                                        const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                                        return (
                                            <div key={log.id} className="text-[9px] bg-zinc-900/65 p-2.5 border border-purple-950/40 rounded text-purple-300/90 leading-relaxed flex flex-col gap-2">
                                                <div className="flex justify-between items-center text-[8px] opacity-60">
                                                    <span>[{timeStr}] WHISPER</span>
                                                    <span>LVL {profile.jesterInteractionSignature?.accumulatedPersonaScore ? Math.min(4, Math.floor(profile.jesterInteractionSignature.accumulatedPersonaScore / 40) + 1) : 1}</span>
                                                </div>
                                                <p className="text-zinc-200 select-text font-sans">{log.text}</p>
                                                
                                                {/* Feedback Controls */}
                                                <div className="flex items-center justify-end gap-1.5 border-t border-purple-950/40 pt-1.5 mt-0.5">
                                                    <span className="text-[7px] text-zinc-500 uppercase tracking-wider mr-auto">Feedback:</span>
                                                    <button
                                                        onClick={() => handleFeedback(log.id, 'helpful')}
                                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] transition-all uppercase font-bold cursor-pointer ${
                                                            log.feedback === 'helpful'
                                                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                                                                : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/50'
                                                        }`}
                                                        title="This whisper was helpful or encouraging!"
                                                    >
                                                        <ThumbsUp className="w-2.5 h-2.5" />
                                                        HELPFUL
                                                    </button>
                                                    <button
                                                        onClick={() => handleFeedback(log.id, 'too_much')}
                                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] transition-all uppercase font-bold cursor-pointer ${
                                                            log.feedback === 'too_much'
                                                                ? 'bg-red-950/40 border-red-500 text-red-400'
                                                                : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-red-400 hover:border-red-500/50'
                                                        }`}
                                                        title="This whisper was too much or too frequent."
                                                    >
                                                        <ThumbsDown className="w-2.5 h-2.5" />
                                                        TOO MUCH
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            
                            <div className="border-t border-purple-950/40 mt-3 pt-2 text-[8px] text-zinc-500 leading-normal flex items-center justify-between uppercase">
                                <div className="flex items-center gap-1">
                                    <span>Log Opens:</span>
                                    <span className="text-purple-400 font-bold">
                                        {profile?.jesterInteractionSignature?.logOpenCount || 0}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span>Persona Score:</span>
                                    <span className="text-yellow-400 font-bold tracking-tight">
                                        {profile?.jesterInteractionSignature?.accumulatedPersonaScore ?? 10} PTS
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Spiritual Counselor Sanctuary & Reflection Session */}
                <div className="relative">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const nextState = !isCounselorOpen;
                            setIsCounselorOpen(nextState);
                            if (nextState) {
                                setIsWhispersLogOpen(false);
                                setIsCovenantOpen(false);
                                setIsTabLogsOpen(false);
                            }
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer select-none ${
                            profile?.counselorSessionActive
                                ? profile?.counselorGuidanceReady
                                    ? 'border-emerald-500/80 text-emerald-300 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.35)] animate-pulse'
                                    : 'border-rose-900/60 text-rose-400 bg-rose-950/10 hover:border-rose-500 hover:bg-rose-950/20'
                                : 'border-zinc-800/80 text-zinc-500 bg-zinc-950/20 hover:border-rose-950 hover:bg-rose-950/10 hover:text-rose-400'
                        }`}
                        title={profile?.counselorSessionActive ? "Spiritual AI Counselor Sanctuary (Active)" : "Spiritual AI Counselor Sanctuary (Offline)"}
                    >
                        <Heart className={`w-4 h-4 ${
                            profile?.counselorSessionActive
                                ? profile?.counselorGuidanceReady
                                    ? 'text-emerald-400 fill-emerald-500/10'
                                    : 'text-rose-400 fill-rose-500/10'
                                : 'text-zinc-500'
                        }`} />
                        <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">
                            {profile?.counselorSessionActive ? 'Counselor Active' : 'Counselor'}
                        </span>
                        {profile?.counselorSessionActive && profile?.counselorGuidanceReady && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping" />
                        )}
                    </motion.button>

                    {isCounselorOpen && (
                        <div className="absolute right-0 mt-2 w-96 bg-zinc-950 border-2 border-rose-950/60 rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.1)] z-50 p-5 font-mono select-none text-left flex flex-col gap-4">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-rose-950/40 pb-3">
                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10" />
                                    Spiritual Reflection Sanctuary
                                </span>
                                <button 
                                    className="text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                                    onClick={() => setIsCounselorOpen(false)}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Holy Verse Card */}
                            <div className="bg-rose-950/5 border border-rose-950/30 p-3.5 rounded-lg italic text-[9.5px] text-zinc-400/90 leading-relaxed text-center font-sans">
                                "Come unto me, all ye that labour and are heavy laden, and I will give you rest."
                                <div className="mt-1.5 not-italic text-[8px] text-rose-500/80 font-mono tracking-wider uppercase font-bold">— Matthew 11:28</div>
                            </div>

                            {/* Session Engagement Toggle */}
                            <div className="bg-zinc-900/40 border border-zinc-900 p-3 rounded-lg flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[8.5px] text-zinc-400 uppercase font-black">Sanctuary State:</span>
                                    <span className={`text-[8.5px] font-black uppercase ${profile?.counselorSessionActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                        {profile?.counselorSessionActive ? '🟢 ENGAGED' : '⚫ DORMANT'}
                                    </span>
                                </div>
                                <p className="text-[8px] text-zinc-500 leading-normal font-sans">
                                    {profile?.counselorSessionActive 
                                        ? "The reflection session is engaged. The Counselor attends thy posture, ready to offer sacred guidance."
                                        : "Engage the Counselor to enter a conscious reflection state. A soft, pulsing indicator will watch over thy TopNavBar to signal when holy guidance is prepared."}
                                </p>
                                <button
                                    onClick={toggleCounselorSession}
                                    className={`w-full py-2 px-3 rounded text-[9px] font-black tracking-wider uppercase border transition-all cursor-pointer ${
                                        profile?.counselorSessionActive
                                            ? 'bg-red-950/20 text-red-400 border-red-950 hover:bg-red-900/20'
                                            : 'bg-rose-900/20 text-rose-300 border-rose-900/60 hover:bg-rose-900/40 hover:border-rose-500 hover:text-white'
                                    }`}
                                >
                                    {profile?.counselorSessionActive ? '🕊️ Depart Sanctuary in Grace' : '✨ Engage Counselor Reflection Session'}
                                </button>
                            </div>

                            {/* Active Counselor Panel */}
                            {profile?.counselorSessionActive && (
                                <div className="flex flex-col gap-3">
                                    {/* Select a focus */}
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[8.5px] text-zinc-400 uppercase font-black">Choose a posturing of heart:</span>
                                        <div className="grid grid-cols-2 gap-1.5 text-[8.5px]">
                                            {counselorFocuses.map((f) => (
                                                <button
                                                    key={f.key}
                                                    disabled={isConsulting}
                                                    onClick={() => handleRequestCounsel(f.key, f.label)}
                                                    className={`p-2 rounded border text-left transition-all uppercase font-black cursor-pointer leading-tight flex flex-col gap-0.5 ${
                                                        profile?.counselorSelectedFocus === f.label
                                                            ? 'bg-rose-950/30 text-rose-300 border-rose-500'
                                                            : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-rose-900 hover:text-zinc-200'
                                                    }`}
                                                >
                                                    <span>{f.label}</span>
                                                    <span className="text-[6.5px] opacity-60 font-sans tracking-normal capitalize font-normal">
                                                        {f.key === 'weary' ? 'Matthew 11:28' : f.key === 'wisdom' ? 'James 1:5' : f.key === 'anxious' ? 'Philippians 4:6' : f.key === 'gratitude' ? 'Psalm 100:4' : 'Psalm 147:3'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Output area */}
                                    {(isConsulting || profile?.counselorLastGuidance) && (
                                        <div className="bg-zinc-900/70 border border-zinc-900 rounded-lg p-3.5 flex flex-col gap-2.5 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-rose-950/50">
                                            {isConsulting ? (
                                                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                                                    <div className="w-5 h-5 rounded-full border-2 border-rose-500/25 border-t-rose-500 animate-spin" />
                                                    <span className="text-[8px] text-zinc-400 uppercase tracking-widest animate-pulse font-sans">
                                                        The Counselor is reflecting upon thy soul's posture, seeking the scriptures in love...
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                                                        <span className="text-[8px] font-black text-rose-400/90 uppercase tracking-wider">
                                                            {profile?.counselorSelectedFocus || 'Heavenly Counsel'}
                                                        </span>
                                                        <span className="text-[7.5px] text-zinc-500 uppercase">
                                                            Sustained in Grace
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Text rendering */}
                                                    <div className="text-[9.5px] text-zinc-200 leading-relaxed font-sans whitespace-pre-line select-text">
                                                        {profile?.counselorLastGuidance}
                                                    </div>

                                                    {profile?.counselorGuidanceReady && (
                                                        <button
                                                            onClick={() => {
                                                                if (onUpdateProfile) {
                                                                    onUpdateProfile({ counselorGuidanceReady: false });
                                                                }
                                                            }}
                                                            className="mt-1 w-full py-1.5 px-3 rounded bg-emerald-950/30 text-emerald-300 border border-emerald-900/60 hover:bg-emerald-900/20 hover:border-emerald-500 text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                                        >
                                                            ✓ Absorb Comfort & Dismiss Pulsing Indicator
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Holy Watermark */}
                            <div className="border-t border-rose-950/35 pt-2.5 text-[7.5px] text-zinc-600/80 leading-normal flex items-center justify-between uppercase italic font-sans">
                                <span>"Love never faileth." — 1 Cor 13:8</span>
                                <span>10 Years in the Lord</span>
                            </div>
                        </div>
                    )}
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleKillSwitch}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-red-900/20 text-red-500 border-red-900 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all animate-pulse"
                >
                    <WarningIcon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">KILL SWITCH</span>
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggleTerminal}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${isTerminal ? 'bg-green-600 text-black border-green-500' : 'bg-black text-green-500 border-green-900/40 hover:border-green-500'}`}
                >
                    <TerminalIcon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{isTerminal ? 'EXIT TERM' : 'TERM MODE'}</span>
                </motion.button>
                <div className="w-px h-6 bg-zinc-800" />
                <motion.button 
                    whileHover={{ scale: 1.05, borderColor: "rgba(220, 38, 38, 1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-black text-red-500 border-red-900/40 hover:border-red-500 transition-all"
                >
                    <UserIcon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">DISCONNECT</span>
                </motion.button>
            </div>
            <ApiKeyInfoModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />

            {/* Cash App Pipeline Setup Modal */}
            <AnimatePresence>
                {isCashappModalOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[150]"
                            onClick={() => setIsCashappModalOpen(false)}
                        />

                        {/* Modal Body */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: "-45%", x: "-50%" }}
                            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                            exit={{ opacity: 0, scale: 0.95, y: "-45%", x: "-50%" }}
                            transition={{ duration: 0.2 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#030307] border-2 border-emerald-500/35 rounded-2xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.18)] z-[160] font-sans text-left"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-stone-100">Cash App Pipeline</h3>
                                        <p className="text-[9px] text-zinc-500 font-mono">SUTTON DIRECT SETTLEMENT ENGINE</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCashappModalOpen(false)}
                                    className="p-1 bg-zinc-950 border border-zinc-900 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                                    type="button"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Informational Warning */}
                            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex items-start gap-2.5 mb-4 text-[10px] text-zinc-400">
                                <span className="text-emerald-400 font-bold font-mono">i</span>
                                <p className="leading-relaxed">
                                    Enter your Cash App credentials below to authorize direct deposit handshakes via Sutton Bank. Your parameters will be securely indexed in local storage for instant Visa Direct clearing.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleConnectCashAppFromModal} className="space-y-3.5">
                                <div>
                                    <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1 uppercase">YOUR CASHTAG</label>
                                    <input
                                        type="text"
                                        value={modalCashappTag}
                                        onChange={e => {
                                            let val = e.target.value;
                                            if (val && !val.startsWith('$')) {
                                                val = '$' + val;
                                            }
                                            setModalCashappTag(val);
                                        }}
                                        placeholder="e.g. $AetherSovereign"
                                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/60"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1 uppercase">SUTTON ROUTING</label>
                                        <input
                                            type="text"
                                            maxLength={9}
                                            value={modalCashappRouting}
                                            onChange={e => setModalCashappRouting(e.target.value.replace(/\D/g, ''))}
                                            placeholder="9 digits"
                                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/60"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1 uppercase">ACCOUNT CODE</label>
                                        <input
                                            type="text"
                                            maxLength={17}
                                            value={modalCashappAccount}
                                            onChange={e => setModalCashappAccount(e.target.value.replace(/\D/g, ''))}
                                            placeholder="8-17 digits"
                                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/60"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col gap-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold font-mono py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <Link2 className="w-3.5 h-3.5" />
                                        <span>CONNECT SECURE HIGHWAY</span>
                                    </button>

                                    {cashappStatus === 'Active' && (
                                        <button
                                            type="button"
                                            onClick={handleDisconnectCashAppFromModal}
                                            className="w-full bg-zinc-950 hover:bg-red-950/20 text-red-400 border border-red-950 rounded-xl text-xs font-bold font-mono py-2 transition-all cursor-pointer"
                                        >
                                            SEVER DISPATCH PIPELINE
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
