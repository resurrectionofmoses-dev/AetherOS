import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    gmailService, 
    DecodedEmail 
} from '../services/gmailService';
import { 
    googleSignIn, 
    googleSignOut, 
    getAccessToken 
} from '../services/firebaseAuthService';
import { callAIProxy } from '../services/geminiService';
import { 
    Mail, Send, Search, ShieldAlert, Sparkles, RefreshCw, 
    Trash2, Layers, CheckCircle, BrainCircuit, Info, AlertCircle,
    UserCheck, Terminal, Star, FileText, ArrowRight, Check
} from 'lucide-react';
import { toast } from 'sonner';

// Interactive archetypes for Companion AI Drafts
interface Archetype {
    id: string;
    name: string;
    icon: string;
    desc: string;
    systemInstruction: string;
}

const ARCHETYPES: Archetype[] = [
    {
        id: 'sovereign',
        name: 'The Sovereign Companion',
        icon: '👑',
        desc: 'Writes in a highly formal, authoritative, and strategic tone. Perfect for executive, protocol-strict communications.',
        systemInstruction: 'You are "The Sovereign Companion", a high-level cybernetic AI advisor in AetherOS. Compose a draft response that is extremely polished, professional, authoritative, formal, and clear. Avoid casual speech or emojis. Maintain strategic posture.'
    },
    {
        id: 'jester',
        name: 'The Jester Companion',
        icon: '🃏',
        desc: 'A witty, sarcastic, and playful archetype that uses humor and code jargon to diffuse tension.',
        systemInstruction: 'You are "The Jester Companion", a lighthearted, witty, slightly sarcastic cybernetic helper. Use funny security terminology, friendly teasing, and colorful metaphors. Keep it engaging but helpful.'
    },
    {
        id: 'oracle',
        name: 'The Cosmic Oracle',
        icon: '🔮',
        desc: 'Uses mystical, deep, and poetic metaphors blending cellular biology and quantum physics.',
        systemInstruction: 'You are "The Cosmic Oracle", an AI companion that sees email communication as a flow of cellular ATP energy and quantum coherence. Write in an elevated, slightly mysterious, deeply thoughtful, poetic tone.'
    },
    {
        id: 'weaver',
        name: 'The Logic Weaver',
        icon: '🕸️',
        desc: 'Extremely analytical, bullet-point oriented, and technical. Focuses on data parity and diagnostic metrics.',
        systemInstruction: 'You are "The Logic Weaver", an analytical data engine. Draft a reply structured with strict bullet points, logical progressions, and diagnostic metric summaries. Focus purely on technical feasibility and actions.'
    }
];

// Mock Threat Database for cellular bio-scans
interface ThreatFactor {
    id: string;
    name: string;
    index: string;
    description: string;
}

const THREAT_FACTORS: ThreatFactor[] = [
    { id: 'drift', name: 'CONJUNCTION_DRIFT Vector', index: 'LATENCY_DRIFT > 500ms', description: 'Packet alignment desynchronization due to gateway temporal anomalies.' },
    { id: 'fracture', name: 'DATA_FRACTURE Payload', index: 'PACKET_LOSS > 5%', description: 'Structural corruption detected inside the message body stream.' },
    { id: 'sig_mismatch', name: 'SIGNATURE_MISMATCH Hack', index: 'CRYPTOGRAPHIC_DESYNC', description: 'Sender address fails to match decentralized quantum key register signatures.' },
    { id: 'insub', name: 'INSUBORDINATION Meme', index: 'MORALE_FALL < 20', description: 'Linguistic patterns suggest subliminal agent fatigue or rejection vectors.' }
];

export const GmailView: React.FC = () => {
    // Auth & Connection States
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
    const [userEmailAddress, setUserEmailAddress] = useState<string>('');

    // Mail State
    const [emails, setEmails] = useState<DecodedEmail[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<DecodedEmail | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentFolder, setCurrentFolder] = useState<'inbox' | 'sent' | 'unread' | 'threats'>('inbox');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // Compose State
    const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
    const [composeTo, setComposeTo] = useState<string>('');
    const [composeSubject, setComposeSubject] = useState<string>('');
    const [composeBody, setComposeBody] = useState<string>('');
    const [isSending, setIsSending] = useState<boolean>(false);

    // AI Assistant States
    const [selectedArchetype, setSelectedArchetype] = useState<string>('sovereign');
    const [isGeneratingDraft, setIsGeneratingDraft] = useState<boolean>(false);
    const [aiDraftPrompt, setAiDraftPrompt] = useState<string>('');
    const [generatedReplyDraft, setGeneratedReplyDraft] = useState<string>('');
    
    // Scan & Reward States
    const [isScanningEmail, setIsScanningEmail] = useState<boolean>(false);
    const [scanLogs, setScanLogs] = useState<string[]>([]);
    const [detectedThreat, setDetectedThreat] = useState<ThreatFactor | null>(null);
    const [isPurgingThreat, setIsPurgingThreat] = useState<boolean>(false);
    const [scanProgress, setScanProgress] = useState<number>(0);
    const [rewardMinted, setRewardMinted] = useState<boolean>(false);

    // Check Gmail auth state
    const checkConnection = useCallback(async () => {
        setIsLoadingAuth(true);
        try {
            const hasToken = await gmailService.hasConnection();
            setIsConnected(hasToken);
            if (hasToken) {
                // Fetch recent emails automatically
                fetchEmails();
            }
        } catch (err) {
            console.error('Error checking Gmail connection:', err);
        } finally {
            setIsLoadingAuth(false);
        }
    }, []);

    useEffect(() => {
        checkConnection();
    }, [checkConnection]);

    // Google Login for Gmail Node
    const handleConnectNode = async () => {
        setIsLoadingAuth(true);
        try {
            const result = await googleSignIn();
            if (result && result.accessToken) {
                setIsConnected(true);
                toast.success('Gmail Neural Node Activated', {
                    description: 'Secure OAuth connection successfully registered.'
                });
                fetchEmails();
            } else {
                toast.error('Authentication incomplete. Ensure all requested scopes are accepted.');
            }
        } catch (err: any) {
            toast.error('Connection failed', {
                description: err.message || 'Error executing Google OAuth handshake.'
            });
        } finally {
            setIsLoadingAuth(false);
        }
    };

    // Disconnect Node
    const handleDisconnectNode = async () => {
        try {
            await googleSignOut();
            setIsConnected(false);
            setEmails([]);
            setSelectedEmail(null);
            toast.success('Gmail Node Offline', {
                description: 'OAuth tokens purged from cached memory.'
            });
        } catch (err) {
            toast.error('Disconnection failed');
        }
    };

    // Fetch Emails with queries based on active folder
    const fetchEmails = async (queryOverhead = '') => {
        setIsRefreshing(true);
        try {
            let finalQuery = searchQuery;
            if (currentFolder === 'unread') {
                finalQuery = finalQuery ? `${finalQuery} label:UNREAD` : 'label:UNREAD';
            } else if (currentFolder === 'sent') {
                finalQuery = finalQuery ? `${finalQuery} label:SENT` : 'label:SENT';
            } else if (currentFolder === 'threats') {
                // Fun category filters
                finalQuery = finalQuery ? `${finalQuery} (warning OR security OR danger OR password)` : 'warning OR security OR danger OR password';
            }

            if (queryOverhead) {
                finalQuery = finalQuery ? `${finalQuery} ${queryOverhead}` : queryOverhead;
            }

            const list = await gmailService.listMessages(12, finalQuery);
            setEmails(list);
            
            // Try to extract user email address from list if available
            if (list.length > 0 && !userEmailAddress) {
                const toHeader = list[0].to;
                setUserEmailAddress(toHeader.replace(/[<>]/g, ''));
            }

            toast.success('Mail Sync Complete', {
                description: `Retrieved ${list.length} recent communications securely.`
            });
        } catch (err: any) {
            console.error('Failed syncing emails:', err);
            if (err.message?.includes('expired') || err.message?.includes('401')) {
                setIsConnected(false);
            }
            toast.error('Sync failed', {
                description: err.message || 'Error contacting Google API servers.'
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    // Trigger fetch on folder or search changes
    useEffect(() => {
        if (isConnected) {
            fetchEmails();
        }
    }, [currentFolder, isConnected]);

    // Send Comms
    const handleSendComms = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!composeTo || !composeSubject || !composeBody) {
            toast.error('Missing fields', { description: 'Please define recipient, subject, and text payload.' });
            return;
        }

        setIsSending(true);
        try {
            await gmailService.sendMessage(composeTo, composeSubject, composeBody);
            toast.success('Transmission Dispatched', {
                description: `Email safely routed to ${composeTo}.`
            });
            setIsComposeOpen(false);
            setComposeTo('');
            setComposeSubject('');
            setComposeBody('');
            // Refresh mail
            fetchEmails();
        } catch (err: any) {
            toast.error('Dispatch failed', {
                description: err.message || 'Secure transmission error.'
            });
        } finally {
            setIsSending(false);
        }
    };

    // AI companion reply generator
    const handleGenerateCompanionReply = async () => {
        if (!selectedEmail) return;
        setIsGeneratingDraft(true);
        setGeneratedReplyDraft('');

        try {
            const archetypeObj = ARCHETYPES.find(a => a.id === selectedArchetype);
            const prompt = `Selected Archetype: ${archetypeObj?.name}
User Custom Instruction: ${aiDraftPrompt || 'Draft a generic professional reply.'}

Original Email Received:
- From: ${selectedEmail.from}
- Subject: ${selectedEmail.subject}
- Body Snippet: ${selectedEmail.body.slice(0, 1000)}

Compose an elegant, full, ready-to-send response. Match the archetype's persona instructions exactly: ${archetypeObj?.systemInstruction}`;

            const res = await callAIProxy({
                parts: [{ text: prompt }]
            }, 'gemini-2.5-flash', archetypeObj?.systemInstruction);

            if (res && res.text) {
                setGeneratedReplyDraft(res.text);
                toast.success('AI Draft Engineered', {
                    description: `Generated reply matching ${archetypeObj?.name}.`
                });
            } else {
                throw new Error('Empty draft returned from neural model.');
            }
        } catch (err: any) {
            toast.error('AI Drafting failed', {
                description: err.message || 'Check your Gemini API server logs.'
            });
        } finally {
            setIsGeneratingDraft(false);
        }
    };

    // Deep scanning emails for cyber-biological threats
    const handleThreatScan = async () => {
        if (!selectedEmail) return;
        setIsScanningEmail(true);
        setScanLogs([]);
        setDetectedThreat(null);
        setRewardMinted(false);
        setScanProgress(0);

        const logs = [
            'Initializing Bio-Security Node...',
            'Injecting molecular probes into text payloads...',
            'Decrypting headers and tracing IP metadata...',
            'Cross-referencing AetherOS Threat Signature database...',
            'Running semantic entropy analyzer on grammar vectors...'
        ];

        // Animated log sequence
        for (let i = 0; i < logs.length; i++) {
            await new Promise(r => setTimeout(r, 400));
            setScanLogs(prev => [...prev, `[INIT] ${logs[i]}`]);
            setScanProgress(Math.floor(((i + 1) / logs.length) * 60));
        }

        // Randomly assign a biological threat
        const threatFactor = THREAT_FACTORS[Math.floor(Math.random() * THREAT_FACTORS.length)];
        
        await new Promise(r => setTimeout(r, 600));
        setScanLogs(prev => [
            ...prev,
            `[ALERT] Threat found: ${threatFactor.name}`,
            `[ALERT] Vector metric: ${threatFactor.index}`,
            `[STATUS] System state unstable. Sandbox containment recommended!`
        ]);
        setScanProgress(100);
        setDetectedThreat(threatFactor);
        setIsScanningEmail(false);
    };

    // Purge Threat and mint high-fidelity dual-benefit Bio-NFT
    const handlePurgeThreatAndMint = async () => {
        if (!selectedEmail || !detectedThreat) return;
        setIsPurgingThreat(true);

        const purgeSteps = [
            'Containment field active...',
            'Conducting high-frequency laser purge on data vectors...',
            'Restoring cryptographic parity on email signature...',
            'Synthesizing companion biological defense block...',
            'Assembling dual-benefit Bio-NFT in local registry...'
        ];

        for (let i = 0; i < purgeSteps.length; i++) {
            await new Promise(r => setTimeout(r, 500));
            setScanLogs(prev => [...prev, `[PURGE] ${purgeSteps[i]}`]);
        }

        // Mint NFT
        try {
            const nftId = `CELL-${Math.floor(100000 + Math.random() * 900000)}`;
            const archetypeName = ARCHETYPES.find(a => a.id === selectedArchetype)?.name || 'Cosmic Oracle';
            
            const newNft = {
                id: nftId,
                cph: 240,
                atp: 1800,
                generation: 5,
                isNft: true,
                nftId: nftId,
                nftUri: `Aether_Sec_Shield_${nftId.slice(5)}`,
                rarity: 'LEGENDARY' as const,
                mintTimestamp: Date.now(),
                companionArchetype: selectedArchetype,
                companionSynergyName: `${archetypeName} Armor`,
                companionSynergyEffect: `Neutralizes all ${detectedThreat.name} vectors. Morale remains > 80.`,
                userSynergyName: 'Aether Cryptography Lock',
                userSynergyEffect: '+250 ATP reserve capacity. Increases mining efficiency by 24%.'
            };

            // Read existing NFTs from local storage
            let nftsList = [];
            const stored = localStorage.getItem('bio_nfts_registry');
            if (stored) {
                nftsList = JSON.parse(stored);
            }
            nftsList.unshift(newNft);
            localStorage.setItem('bio_nfts_registry', JSON.stringify(nftsList));

            setScanLogs(prev => [
                ...prev,
                `[SUCCESS] Purge complete! Threat neutralized.`,
                `[MINT] LEGENDARY Bio-NFT Minted: ${newNft.nftUri}`,
                `[MINT] Syncing dual benefits with Active Cellular Matrix!`
            ]);

            setRewardMinted(true);
            toast.success('Bio-NFT Successfully Minted!', {
                description: 'Legendary security companion NFT stored in persistent Cellular Grid.'
            });
        } catch (err) {
            console.error('Error minting scanning rewards:', err);
            toast.error('Minting failed');
        } finally {
            setIsPurgingThreat(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full bg-[#030308] text-zinc-300 font-mono text-xs overflow-hidden">
            {/* Left Nav Pane - Mailbox Folders & Node status */}
            <div className="w-full lg:w-64 border-r border-zinc-900 bg-[#060611] flex flex-col p-4 space-y-4">
                <div className="border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-red-500 animate-pulse" />
                        <h2 className="text-sm font-black text-white tracking-widest uppercase">Gmail Neural Node</h2>
                    </div>
                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                        SECURE ROUTING INTERFACE
                    </div>
                </div>

                {/* Connection Widget */}
                <div className="bg-[#09091b] border border-zinc-800 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Node Status</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${isConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'}`}>
                            {isConnected ? '● ONLINE' : '○ OFFLINE'}
                        </span>
                    </div>

                    {isLoadingAuth ? (
                        <div className="flex items-center justify-center py-2 text-zinc-500">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        </div>
                    ) : isConnected ? (
                        <div className="space-y-2">
                            <div className="text-[9px] text-zinc-400 truncate max-w-full block bg-black/40 border border-zinc-900 p-1.5 rounded font-mono select-all">
                                {userEmailAddress || 'Active Session Connected'}
                            </div>
                            <button
                                onClick={handleDisconnectNode}
                                className="w-full py-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/40 hover:border-red-500/50 text-red-400 hover:text-red-200 rounded-lg text-[9px] font-bold transition-all duration-150 cursor-pointer"
                                title="Safely remove Google credentials from session cookies."
                            >
                                Deactivate Node
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-[10px] text-zinc-500 leading-normal">
                                Grant secure read/write permissions to Gmail API. Access tokens remain in local state.
                            </p>
                            <button
                                onClick={handleConnectNode}
                                className="w-full py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black rounded-lg uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                title="Authenticate securely using Google login popup."
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Connect Gmail Node</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Folder Selectors */}
                <div className="flex-1 space-y-1">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider block px-2 mb-1">Folders</span>
                    {[
                        { id: 'inbox', label: 'INBOX FEEDS', count: emails.length },
                        { id: 'sent', label: 'SENT PARITY', count: null },
                        { id: 'unread', label: 'UNREAD VECTORS', count: null },
                        { id: 'threats', label: 'SUSPICIOUS THREATS', count: 4 }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => isConnected && setCurrentFolder(f.id as any)}
                            disabled={!isConnected}
                            className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center transition-all ${!isConnected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${currentFolder === f.id ? 'bg-red-950/20 border border-red-500/30 text-white font-bold' : 'hover:bg-zinc-900/40 text-zinc-400'}`}
                        >
                            <span>{f.label}</span>
                            {f.count !== null && isConnected && (
                                <span className="text-[8px] bg-zinc-950 px-1.5 py-0.5 border border-zinc-800 rounded text-zinc-500">
                                    {f.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="pt-3 border-t border-zinc-900 text-center">
                    <button
                        onClick={() => isConnected && setIsComposeOpen(true)}
                        disabled={!isConnected}
                        className={`w-full py-2.5 bg-gradient-to-r from-zinc-900 to-zinc-950 hover:from-zinc-800 hover:to-zinc-900 border border-zinc-800 hover:border-zinc-500 text-zinc-300 font-bold uppercase rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 ${!isConnected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <Send className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Compose Secure</span>
                    </button>
                </div>
            </div>

            {/* Middle Pane - Email Feed List */}
            <div className="flex-1 min-w-0 flex flex-col border-r border-zinc-900">
                {/* Search Bar */}
                <div className="p-3 border-b border-zinc-900 bg-[#04040a] flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder={isConnected ? "Search secure nodes (e.g. is:unread, is:important)..." : "Connect Neural Node to activate search query..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={!isConnected}
                            onKeyDown={(e) => e.key === 'Enter' && fetchEmails()}
                            className="w-full pl-9 pr-4 py-2 bg-[#080814] border border-zinc-800 focus:border-red-500/50 rounded-lg text-white font-mono text-xs focus:outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => fetchEmails()}
                        disabled={!isConnected || isRefreshing}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all duration-150 cursor-pointer disabled:opacity-30"
                        title="Query Google servers for latest inbox update"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Email Cards Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#020206]">
                    {!isConnected ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-full text-zinc-600">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-zinc-400 font-bold mb-1">NODE OFFLINE</h3>
                                <p className="text-zinc-600 max-w-xs leading-normal">
                                    Activate your Gmail node in the left console bar to sync, search, and audit secure email feeds.
                                </p>
                            </div>
                        </div>
                    ) : isRefreshing && emails.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-2 text-zinc-500">
                            <RefreshCw className="w-6 h-6 animate-spin text-red-500" />
                            <span>Synchronizing feeds with Google servers...</span>
                        </div>
                    ) : emails.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                            <CheckCircle className="w-8 h-8 text-zinc-800 mb-2" />
                            <span>No emails match the active filter. Pure parity.</span>
                        </div>
                    ) : (
                        emails.map(email => (
                            <div
                                key={email.id}
                                onClick={() => {
                                    setSelectedEmail(email);
                                    setGeneratedReplyDraft('');
                                    setDetectedThreat(null);
                                    setScanLogs([]);
                                }}
                                className={`p-3 border rounded-xl flex flex-col justify-between transition-all duration-150 cursor-pointer group ${selectedEmail?.id === email.id ? 'bg-[#0f0a1b] border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]' : 'bg-[#050510] border-zinc-900 hover:border-zinc-800'}`}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-black text-zinc-400 truncate max-w-[180px] group-hover:text-red-400 transition-colors">
                                            {email.from.replace(/<.*>/, '').trim()}
                                        </div>
                                        <h4 className="text-xs font-black text-zinc-200 mt-0.5 truncate max-w-[280px]">
                                            {email.subject}
                                        </h4>
                                    </div>
                                    <div className="text-[9px] text-zinc-600 text-right whitespace-nowrap ml-2 font-mono">
                                        {email.date.split(',').pop()?.trim().slice(0, 11) || 'Recent'}
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed break-all">
                                    {email.snippet}
                                </p>
                                <div className="flex gap-1 mt-2 flex-wrap">
                                    {email.labels.filter(l => !l.startsWith('CATEGORY_')).map(l => (
                                        <span key={l} className="text-[7px] px-1 bg-black/60 border border-zinc-800 rounded font-black text-zinc-500 uppercase tracking-tighter">
                                            {l}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Pane - Detail View & Companion Assistants */}
            <div className="flex-[1.5] flex flex-col bg-[#030309] overflow-y-auto">
                {selectedEmail ? (
                    <div className="flex flex-col h-full">
                        {/* Email Header */}
                        <div className="p-4 border-b border-zinc-900 bg-[#060613] space-y-2">
                            <div className="flex justify-between items-start gap-4">
                                <h1 className="text-sm font-black text-white tracking-tight break-words">
                                    {selectedEmail.subject}
                                </h1>
                                <button
                                    onClick={() => setSelectedEmail(null)}
                                    className="px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded border border-zinc-800 text-[9px] cursor-pointer"
                                >
                                    Close view
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between text-[10px] text-zinc-500 font-mono gap-1">
                                <div>
                                    From: <span className="text-zinc-300 font-bold select-all">{selectedEmail.from}</span>
                                </div>
                                <div className="text-right">
                                    Date: <span className="text-zinc-400 select-all">{selectedEmail.date}</span>
                                </div>
                            </div>
                        </div>

                        {/* Email Body Pane */}
                        <div className="p-4 bg-black/20 border-b border-zinc-900 max-h-72 overflow-y-auto">
                            <div className="text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap select-text break-words font-sans bg-[#030308]/60 p-4 border border-zinc-900/60 rounded-xl shadow-inner">
                                {selectedEmail.body}
                            </div>
                        </div>

                        {/* COMPANION OPERATIONS DRAWER - Dynamic scanned metrics and GPT answers */}
                        <div className="p-4 space-y-4">
                            {/* Aigent Scan Section */}
                            <div className="bg-[#070715] border border-zinc-800 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <BrainCircuit className="w-4 h-4 text-purple-400" />
                                        <h3 className="text-xs font-black uppercase text-zinc-300 tracking-wider">Aigent Bio-Security Audit</h3>
                                    </div>
                                    <span className="text-[8px] text-zinc-500 font-black tracking-tight bg-black/60 px-1.5 py-0.5 border border-zinc-800 rounded">
                                        THREAT_PROTECT
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleThreatScan}
                                        disabled={isScanningEmail}
                                        className="py-1.5 px-3 bg-purple-950/20 hover:bg-purple-950/60 border border-purple-800/40 hover:border-purple-500 text-purple-400 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                                        title="Audit active email message body looking for organic malware structures."
                                    >
                                        <Terminal className="w-3.5 h-3.5" />
                                        <span>Scan for Threat Vectors</span>
                                    </button>
                                </div>

                                {/* Scan Logs Output */}
                                {scanLogs.length > 0 && (
                                    <div className="bg-black border border-zinc-900 rounded-lg p-3 font-mono text-[9px] text-zinc-400 max-h-36 overflow-y-auto space-y-1 relative">
                                        <div className="absolute right-2 top-2 text-[7px] text-zinc-600 font-bold uppercase animate-pulse">
                                            Probing Node...
                                        </div>
                                        {scanLogs.map((log, idx) => (
                                            <div key={idx} className={`${log.includes('ALERT') ? 'text-red-400 font-bold animate-pulse' : log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('MINT') ? 'text-amber-300 font-black' : 'text-zinc-500'}`}>
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Found Threat Panel */}
                                {detectedThreat && (
                                    <div className="bg-red-950/10 border border-red-500/30 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-red-400 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                                                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                                                <span>{detectedThreat.name} found!</span>
                                            </div>
                                            <p className="text-[9px] text-zinc-400 leading-normal">
                                                {detectedThreat.description} Index: <strong className="text-red-300">{detectedThreat.index}</strong>
                                            </p>
                                        </div>

                                        {!rewardMinted ? (
                                            <button
                                                onClick={handlePurgeThreatAndMint}
                                                disabled={isPurgingThreat}
                                                className="w-full sm:w-auto py-1.5 px-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black rounded-lg text-[9px] uppercase transition-all duration-150 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                                title="Execute molecular laser clean-up to recover and tokenize premium companion benefits."
                                            >
                                                {isPurgingThreat ? (
                                                    <span className="flex items-center gap-1">
                                                        <RefreshCw className="w-3 h-3 animate-spin" /> Purging...
                                                    </span>
                                                ) : (
                                                    <span>Purge & Mint Bio-NFT</span>
                                                )}
                                            </button>
                                        ) : (
                                            <span className="text-[8px] font-black text-amber-400 bg-amber-950/40 px-2 py-1 rounded border border-amber-500/30 uppercase tracking-widest animate-pulse flex items-center gap-1">
                                                <Star className="w-3 h-3 text-amber-400" /> RECOVERED MINTED
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Companion Draft Reply Engine */}
                            <div className="bg-[#050512] border border-zinc-800 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-cyan-400" />
                                        <h3 className="text-xs font-black uppercase text-zinc-300 tracking-wider">Companion Response Drafting</h3>
                                    </div>
                                    <span className="text-[8px] text-zinc-500 font-black bg-[#0c0c22] border border-zinc-800 px-1.5 py-0.5 rounded uppercase">
                                        GEMINI SECURE CO-PILOT
                                    </span>
                                </div>

                                {/* Archetype Selector */}
                                <div className="space-y-1">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black">Choose Companion Archetype</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ARCHETYPES.map(arch => (
                                            <button
                                                key={arch.id}
                                                onClick={() => setSelectedArchetype(arch.id)}
                                                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${selectedArchetype === arch.id ? 'bg-[#0f112e] border-cyan-500 text-white font-bold' : 'bg-[#030308]/60 border-zinc-900 hover:border-zinc-800 text-zinc-400'}`}
                                            >
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-xs font-bold">{arch.name}</span>
                                                    <span className="text-sm">{arch.icon}</span>
                                                </div>
                                                <p className="text-[8px] text-zinc-500 mt-1 leading-normal">
                                                    {arch.desc}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black">Custom Instructions for Draft</label>
                                    <textarea
                                        placeholder="Add custom facts, context, or instructions for the companion AI..."
                                        value={aiDraftPrompt}
                                        onChange={(e) => setAiDraftPrompt(e.target.value)}
                                        className="w-full h-16 bg-black border border-zinc-800 focus:border-cyan-500/50 rounded-lg p-2 font-mono text-xs focus:outline-none focus:ring-0 text-white"
                                    />
                                </div>

                                <button
                                    onClick={handleGenerateCompanionReply}
                                    disabled={isGeneratingDraft}
                                    className="w-full py-2 bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 text-white font-black rounded-lg uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                                    title="Instruct the selected Aigent Companion to read the context and draft a responsive transmission."
                                >
                                    {isGeneratingDraft ? (
                                        <span className="flex items-center gap-1.5">
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Companion Engineering Draft...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5">
                                            <BrainCircuit className="w-3.5 h-3.5" />
                                            <span>Instruct Companion to Draft</span>
                                        </span>
                                    )}
                                </button>

                                {/* Generated Draft Container */}
                                {generatedReplyDraft && (
                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[9px] text-cyan-400 uppercase font-black">Generated Companion Answer</label>
                                            <span className="text-[8px] text-zinc-500 italic">Review before dispatch</span>
                                        </div>
                                        <textarea
                                            value={generatedReplyDraft}
                                            onChange={(e) => setGeneratedReplyDraft(e.target.value)}
                                            className="w-full h-40 bg-[#020206] border border-zinc-800 rounded-lg p-3 font-sans text-xs focus:outline-none focus:border-zinc-700 text-zinc-300"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setComposeTo(selectedEmail.from);
                                                    setComposeSubject(`Re: ${selectedEmail.subject}`);
                                                    setComposeBody(generatedReplyDraft);
                                                    setIsComposeOpen(true);
                                                }}
                                                className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-500 text-zinc-300 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                                                title="Load this draft directly into the secure outgoing composer modal."
                                            >
                                                <span>Apply to Composer</span>
                                                <ArrowRight className="w-3 h-3 text-cyan-400" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                        <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-full text-zinc-700">
                            <BrainCircuit className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-zinc-400 font-bold mb-1">CO-PILOT CONSOLE EMPTY</h3>
                            <p className="text-zinc-600 max-w-xs leading-normal">
                                Select an active secure email node on the left list feed to run bio-scans, threat containment and draft replies with your Aigent Companions.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Compose Modal */}
            <AnimatePresence>
                {isComposeOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-[#060613] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                        >
                            <div className="p-4 border-b border-zinc-900 bg-[#08081a] flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Send className="w-4 h-4 text-cyan-400" />
                                    <h3 className="text-xs font-black uppercase text-white tracking-widest">Compose Secure Outgoing Payload</h3>
                                </div>
                                <button
                                    onClick={() => setIsComposeOpen(false)}
                                    className="p-1 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white border border-zinc-800 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>

                            <form onSubmit={handleSendComms} className="p-4 space-y-4 flex-1 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-zinc-500 uppercase font-black">Recipient Email (To)</label>
                                        <input
                                            type="email"
                                            placeholder="recipient@domain.com"
                                            required
                                            value={composeTo}
                                            onChange={(e) => setComposeTo(e.target.value)}
                                            className="w-full bg-black border border-zinc-800 focus:border-cyan-500/50 rounded-lg p-2 font-mono text-xs focus:outline-none focus:ring-0 text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-zinc-500 uppercase font-black">Subject Block</label>
                                        <input
                                            type="text"
                                            placeholder="Security / Core Parity Sync"
                                            required
                                            value={composeSubject}
                                            onChange={(e) => setComposeSubject(e.target.value)}
                                            className="w-full bg-black border border-zinc-800 focus:border-cyan-500/50 rounded-lg p-2 font-mono text-xs focus:outline-none focus:ring-0 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] text-zinc-500 uppercase font-black">Communication Payload Content</label>
                                    <textarea
                                        placeholder="Write secure content here or ask companion to draft..."
                                        required
                                        value={composeBody}
                                        onChange={(e) => setComposeBody(e.target.value)}
                                        className="w-full h-64 bg-black border border-zinc-800 focus:border-cyan-500/50 rounded-lg p-3 font-mono text-xs focus:outline-none focus:ring-0 text-white"
                                    />
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                                    <div className="text-[9px] text-zinc-500 flex items-center gap-1">
                                        <Info className="w-3.5 h-3.5" />
                                        <span>Routed securely via authenticated Gmail client node.</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSending}
                                        className="py-2 px-6 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black rounded-lg uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-40"
                                    >
                                        {isSending ? (
                                            <span className="flex items-center gap-1">
                                                <RefreshCw className="w-3 animate-spin" /> Dispatching...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Send className="w-3 h-3" /> Transmit Payload
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
