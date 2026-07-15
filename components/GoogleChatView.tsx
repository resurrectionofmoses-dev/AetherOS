import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { googleChatService, GoogleChatSpace, GoogleChatMessage, GoogleChatMember } from '../services/googleChatService';
import { googleSignIn, googleSignOut, getAccessToken } from '../services/firebaseAuthService';
import { callAIProxy } from '../services/geminiService';
import { 
    MessageSquare, Send, Users, Shield, PlusCircle, RefreshCw, 
    Sparkles, Trash2, X, AlertCircle, CheckCircle2, Lock, BookOpen, 
    LockKeyhole, Key, HeartPulse, UserCheck, Flame
} from 'lucide-react';
import { toast } from 'sonner';

interface GoogleChatViewProps {
    onAddLog?: (log: string) => void;
}

export const GoogleChatView: React.FC<GoogleChatViewProps> = ({ onAddLog }) => {
    // Connection & Auth
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
    const [userProfile, setUserProfile] = useState<{ email?: string; name?: string; photoURL?: string } | null>(null);

    // Chat States
    const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
    const [selectedSpace, setSelectedSpace] = useState<GoogleChatSpace | null>(null);
    const [messages, setMessages] = useState<GoogleChatMessage[]>([]);
    const [members, setMembers] = useState<GoogleChatMember[]>([]);
    
    // UI Loading / Refresh
    const [isRefreshingSpaces, setIsRefreshingSpaces] = useState<boolean>(false);
    const [isRefreshingMessages, setIsRefreshingMessages] = useState<boolean>(false);
    const [isCreatingSpace, setIsCreatingSpace] = useState<boolean>(false);
    const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

    // Form inputs
    const [newMessageText, setNewMessageText] = useState<string>('');
    const [newSpaceName, setNewSpaceName] = useState<string>('');
    const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState<boolean>(false);

    // Cryptographic Seal / Passphrase
    const [useCovenantSeal, setUseCovenantSeal] = useState<boolean>(false);
    const [covenantPasskey, setCovenantPasskey] = useState<string>('');
    const [isSealing, setIsSealing] = useState<boolean>(false);

    // Deletion Gates (Harden Deletion!)
    const [messageToDelete, setMessageToDelete] = useState<GoogleChatMessage | null>(null);
    const [deletionPasskey, setDeletionPasskey] = useState<string>('');
    const [deletionPhrase, setDeletionPhrase] = useState<string>('');
    const [selectedScriptureReconciliation, setSelectedScriptureReconciliation] = useState<string>('');
    const [isExecutingDelete, setIsExecutingDelete] = useState<boolean>(false);

    const scripturePassages = [
        { id: 'isaiah_43_25', reference: 'Isaiah 43:25', text: 'I, even I, am he who blots out your transgressions for my own sake...' },
        { id: 'micah_7_19', reference: 'Micah 7:19', text: 'He will again have compassion on us; he will tread our iniquities underfoot...' },
        { id: 'colossians_2_14', reference: 'Colossians 2:14', text: 'Having canceled the charge of our legal indebtedness, which stood against us...' },
        { id: 'psalm_103_12', reference: 'Psalm 103:12', text: 'As far as the east is from the west, so far has he removed our transgressions...' }
    ];

    // Verify OAuth Connection
    const checkConnection = useCallback(async () => {
        setIsLoadingAuth(true);
        try {
            const token = await getAccessToken();
            const connected = !!token;
            setIsConnected(connected);
            if (connected) {
                fetchSpaces();
            }
        } catch (err) {
            console.error('[GoogleChatView] Auth connection validation error:', err);
        } finally {
            setIsLoadingAuth(false);
        }
    }, []);

    useEffect(() => {
        checkConnection();
    }, [checkConnection]);

    // Handle OAuth Connection Handshake
    const handleConnectNode = async () => {
        setIsLoadingAuth(true);
        try {
            const result = await googleSignIn();
            if (result && result.accessToken) {
                setIsConnected(true);
                setUserProfile({
                    email: result.user.email || undefined,
                    name: result.user.displayName || undefined,
                    photoURL: result.user.photoURL || undefined
                });
                toast.success('Communion Sanctuary Active', {
                    description: 'Secure Google Chat workspace conduit established.'
                });
                if (onAddLog) onAddLog('System connected Google Chat workspace API interface with success.');
                fetchSpaces();
            } else {
                toast.error('Connection incomplete. Verify scope consent.');
            }
        } catch (err: any) {
            toast.error('Sanctuary handshake failed', {
                description: err.message || 'Error conducting Google Chat Auth protocol.'
            });
        } finally {
            setIsLoadingAuth(false);
        }
    };

    // Disconnect OAuth
    const handleDisconnectNode = async () => {
        try {
            await googleSignOut();
            setIsConnected(false);
            setSpaces([]);
            setSelectedSpace(null);
            setMessages([]);
            setMembers([]);
            toast.success('Communion Node Offline', {
                description: 'Communion keys cleared from active session storage.'
            });
            if (onAddLog) onAddLog('Terminated Google Chat connection and purged transient security keys.');
        } catch (err) {
            toast.error('Termination fault', {
                description: 'Failed to safely disconnect current Google Chat gateway.'
            });
        }
    };

    // Query Spaces
    const fetchSpaces = async () => {
        setIsRefreshingSpaces(true);
        try {
            const list = await googleChatService.listSpaces();
            setSpaces(list);
            if (list.length > 0 && !selectedSpace) {
                handleSelectSpace(list[0]);
            }
        } catch (err: any) {
            console.error('[GoogleChatView] Error fetching chat spaces:', err);
            toast.error('Failed to query spaces', {
                description: err.message || 'Check your workspace permissions.'
            });
        } finally {
            setIsRefreshingSpaces(false);
        }
    };

    // Select Active Room Space
    const handleSelectSpace = async (space: GoogleChatSpace) => {
        setSelectedSpace(space);
        setMessages([]);
        setMembers([]);
        setIsRefreshingMessages(true);
        try {
            const msgList = await googleChatService.listMessages(space.name);
            setMessages(msgList);
            
            const memberList = await googleChatService.listMembers(space.name);
            setMembers(memberList);
        } catch (err: any) {
            console.error('[GoogleChatView] Error resolving space details:', err);
            toast.error(`Could not resolve space: ${space.displayName}`, {
                description: err.message
            });
        } finally {
            setIsRefreshingMessages(false);
        }
    };

    // Create New Chat Space Room
    const handleCreateSpace = async () => {
        if (!newSpaceName.trim()) {
            toast.error('Room title cannot be empty.');
            return;
        }

        setIsCreatingSpace(true);
        try {
            const newSpace = await googleChatService.createSpace(newSpaceName.trim());
            toast.success(`Space '${newSpace.displayName}' provisioned successfully.`);
            if (onAddLog) onAddLog(`Created secure fellowship space room: ${newSpace.displayName}`);
            setNewSpaceName('');
            setIsNewSpaceModalOpen(false);
            fetchSpaces();
            handleSelectSpace(newSpace);
        } catch (err: any) {
            toast.error('Space creation rejected', {
                description: err.message
            });
        } finally {
            setIsCreatingSpace(false);
        }
    };

    // Broadcast Chat Message
    const handleSendMessage = async () => {
        if (!selectedSpace) {
            toast.error('No active sanctuary space selected.');
            return;
        }
        if (!newMessageText.trim()) {
            return;
        }

        setIsSendingMessage(true);
        let finalMessageText = newMessageText.trim();

        // If Covenant Seal is requested, encapsulate text with integrity seal
        if (useCovenantSeal && covenantPasskey) {
            setIsSealing(true);
            try {
                const sealStamp = `[🔐 INTEGRITY-COVENANT SEALED BY ${userProfile?.name || 'SACRED_OPERATOR'} at UTC ${new Date().toUTCString()}]\n📜 Colossians 4:6 Signature: "Let your speech always be with grace, seasoned with salt..."\n\n${finalMessageText}`;
                finalMessageText = sealStamp;
            } catch (err) {
                console.error('Failed to seal message', err);
            } finally {
                setIsSealing(false);
            }
        }

        try {
            await googleChatService.createMessage(selectedSpace.name, finalMessageText);
            setNewMessageText('');
            // Refresh messages
            const msgList = await googleChatService.listMessages(selectedSpace.name);
            setMessages(msgList);
            toast.success('Communion Broadcast Emitted');
        } catch (err: any) {
            toast.error('Broadcasting failed', {
                description: err.message
            });
        } finally {
            setIsSendingMessage(false);
        }
    };

    // Hardened Deletion Protocol ("They say so" scriptural validation flow)
    const handleExecuteHardenDelete = async () => {
        if (!messageToDelete) return;

        // Validation Checks
        if (deletionPhrase !== 'I authorize the deletion of this record') {
            toast.error('Gate Interruption: Incorrect authorization phrase', {
                description: 'You must type the phrase exactly: "I authorize the deletion of this record"'
            });
            return;
        }

        if (!selectedScriptureReconciliation) {
            toast.error('Gate Interruption: Missing scripture passage', {
                description: 'You must select a scripture reconciliation passage to forgive and release the record.'
            });
            return;
        }

        setIsExecutingDelete(true);
        try {
            await googleChatService.deleteMessage(messageToDelete.name);
            toast.success('Record Erased Under Divine Pardon', {
                description: 'The message node has been safely blotted out from Google Chat logs.'
            });
            if (onAddLog) onAddLog(`Harden deleted Google Chat message node (${messageToDelete.name}) under scripture pardon.`);
            
            // Cleanup and Refresh
            setMessageToDelete(null);
            setDeletionPhrase('');
            setDeletionPasskey('');
            setSelectedScriptureReconciliation('');
            
            if (selectedSpace) {
                const msgList = await googleChatService.listMessages(selectedSpace.name);
                setMessages(msgList);
            }
        } catch (err: any) {
            toast.error('Erasure Rejected by Gateway Server', {
                description: err.message || 'Verify credentials clearance.'
            });
        } finally {
            setIsExecutingDelete(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#020205] text-gray-200 overflow-hidden font-sans border-t border-slate-900">
            {/* GRID CONDUIT HEADER */}
            <div className="bg-black/90 p-4 border-b-2 border-slate-900 flex flex-wrap justify-between items-center gap-4 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-emerald-500/30 flex items-center justify-center bg-emerald-950/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                        <MessageSquare className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-black text-white tracking-widest uppercase">Google Chat Communion</h1>
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${
                                isConnected 
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/20 shadow-[0_0_6px_rgba(16,185,129,0.2)]' 
                                : 'bg-amber-950/80 text-amber-400 border-amber-500/20'
                            }`}>
                                {isConnected ? 'ACTIVE COMMUNION SANCTUARY' : 'SANCTUARY IN GUEST WALK'}
                            </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono tracking-tight uppercase">
                            Hebrews 10:24 // "Let us consider how we may spur one another on toward love and good deeds"
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isConnected ? (
                        <>
                            {userProfile && (
                                <div className="hidden md:flex items-center gap-2 bg-black/40 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                                    {userProfile.photoURL ? (
                                        <img src={userProfile.photoURL} alt={userProfile.name} className="w-4 h-4 rounded-full border border-zinc-700" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full bg-emerald-900 flex items-center justify-center text-[8px] text-white">C</div>
                                    )}
                                    <span className="text-zinc-400">{userProfile.email}</span>
                                </div>
                            )}
                            <button
                                onClick={handleDisconnectNode}
                                className="bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/60 text-amber-200 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded transition-all cursor-pointer"
                            >
                                CLOSE COMMUNION SANCTUARY
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleConnectNode}
                            className="bg-emerald-950 hover:bg-emerald-900 border-2 border-emerald-500 text-emerald-200 text-xs font-black tracking-widest uppercase px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4 text-emerald-400" /> OPEN CHAT NODE CONDUIT
                        </button>
                    )}
                </div>
            </div>

            {/* SPLASH WHEN UNCONNECTED */}
            {!isConnected ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-950 via-black to-[#020205]">
                    <div className="max-w-md p-8 bg-slate-900/40 border-2 border-slate-800 rounded-2xl relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                        <MessageSquare className="w-16 h-16 text-emerald-500 mx-auto mb-6 animate-pulse" />
                        <h2 className="text-lg font-black text-white tracking-widest uppercase mb-2">Communion Gates Closed</h2>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                            Enter the secure fellowship network. Coordinate directly with your workspace team, list secure message threads, broadcast directives, and preserve files with scriptural seal safeguards.
                        </p>

                        <button 
                            onClick={handleConnectNode}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-950 to-slate-950 hover:from-emerald-900 hover:to-slate-900 border-2 border-emerald-500/60 rounded-xl py-3 text-emerald-300 hover:text-white font-black text-xs tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] cursor-pointer"
                        >
                            Authorize Google Chat Communion
                        </button>

                        <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-zinc-500 font-mono flex items-center justify-center gap-1.5 uppercase">
                            <Shield className="w-3.5 h-3.5 text-zinc-600" /> SECURE CONDUIT HANDSHAKE PROTOCOL
                        </div>
                    </div>
                </div>
            ) : (
                /* CHAT SANCTUARY LAYOUT */
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                    
                    {/* LEFT PANEL: CHAT SPACES & GENERAL SETTINGS */}
                    <div className="w-full lg:w-72 bg-black/50 border-r border-slate-900 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-4 space-y-6">
                        
                        {/* SPACE NAVIGATION HEADER */}
                        <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                            <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Sanctuary Rooms</span>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={fetchSpaces}
                                    disabled={isRefreshingSpaces}
                                    title="Reload Rooms"
                                    className="p-1 bg-slate-950 hover:bg-zinc-900 border border-slate-800 rounded text-zinc-400 hover:text-emerald-400 transition-all cursor-pointer"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSpaces ? 'animate-spin text-emerald-400' : ''}`} />
                                </button>
                                <button
                                    onClick={() => setIsNewSpaceModalOpen(true)}
                                    title="Create Sanctuary Space"
                                    className="p-1 bg-slate-950 hover:bg-zinc-900 border border-slate-800 rounded text-zinc-400 hover:text-emerald-400 transition-all cursor-pointer"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* SPACES LIST */}
                        <div className="space-y-1">
                            {spaces.length === 0 ? (
                                <div className="text-center p-4 bg-slate-950/40 border border-slate-900 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-zinc-600 mx-auto mb-1.5" />
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase">No active rooms found</span>
                                </div>
                            ) : (
                                spaces.map(space => (
                                    <button
                                        key={space.name}
                                        onClick={() => handleSelectSpace(space)}
                                        className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-xs transition-all font-mono uppercase text-left border ${
                                            selectedSpace?.name === space.name 
                                            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30 font-black shadow-[0_0_8px_rgba(16,185,129,0.05)]' 
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedSpace?.name === space.name ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                                            <span className="truncate">{space.displayName || 'Unnamed Room'}</span>
                                        </div>
                                        <span className="text-[8px] bg-black/60 border border-slate-850 px-1 py-0.5 rounded text-zinc-500 font-mono">
                                            {space.spaceType}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* SECURITY HARDENING PANEL */}
                        <div className="p-3 bg-emerald-950/10 border border-emerald-900/40 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-emerald-400 border-b border-emerald-950 pb-2">
                                <Shield className="w-4 h-4 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Covenant Safeguard Seal</span>
                            </div>
                            <p className="text-[9px] text-zinc-400 leading-tight italic">
                                Toggle to cryptographically sign your Google Chat broadcasts under scripture covenant.
                            </p>
                            
                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={useCovenantSeal}
                                    onChange={(e) => setUseCovenantSeal(e.target.checked)}
                                    className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950 w-4 h-4"
                                />
                                <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-wide">Engage Covenant Seal</span>
                            </label>

                            {useCovenantSeal && (
                                <div className="space-y-1.5 animate-fadeIn">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block">Sovereign Signature Key:</span>
                                    <div className="relative">
                                        <Key className="w-3 h-3 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            placeholder="Enter Security Seal..."
                                            value={covenantPasskey}
                                            onChange={(e) => setCovenantPasskey(e.target.value)}
                                            className="w-full bg-black/80 border border-slate-800 rounded pl-7 pr-2 py-1 text-[10px] text-zinc-300 font-mono focus:outline-none focus:border-emerald-500/60"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SCRIPTURAL GUIDANCE */}
                        <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl space-y-2 text-[10px] text-zinc-500">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="font-bold uppercase tracking-wider">Patience & Grace</span>
                            </div>
                            <p className="leading-relaxed italic">
                                "Do not let any unwholesome talk come out of your mouths, but only what is helpful for building others up according to their needs..."
                            </p>
                            <span className="block text-[8px] text-right font-bold text-emerald-600 font-mono">— Ephesians 4:29</span>
                        </div>
                    </div>

                    {/* NEW ROOM MODAL DIALOGUE */}
                    <AnimatePresence>
                        {isNewSpaceModalOpen && (
                            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="bg-[#050508] border-2 border-emerald-500/55 max-w-sm w-full rounded-2xl p-5 shadow-[0_0_25px_rgba(16,185,129,0.15)] space-y-4"
                                >
                                    <div className="flex justify-between items-center text-xs font-black text-emerald-400 font-mono uppercase tracking-widest border-b border-slate-900 pb-2.5">
                                        <span className="flex items-center gap-2">
                                            <Flame className="w-4 h-4 text-emerald-400" /> Provision Fellowship Room
                                        </span>
                                        <button onClick={() => setIsNewSpaceModalOpen(false)} className="text-zinc-500 hover:text-white">×</button>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">Display Room Title</label>
                                        <input
                                            type="text"
                                            placeholder="Fellowship Sanctuary, Warnings-Gate, etc."
                                            value={newSpaceName}
                                            onChange={(e) => setNewSpaceName(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-zinc-700 font-mono rounded-lg focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateSpace}
                                        disabled={isCreatingSpace}
                                        className="w-full py-2.5 bg-emerald-950/50 border border-emerald-500/55 hover:bg-emerald-900/60 hover:border-emerald-400 text-emerald-200 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                                    >
                                        {isCreatingSpace ? 'PROVISIONING...' : 'INITIATE FELLOWSHIP ROOM'}
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* MIDDLE PANEL: CHAT SCREEN */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#04040a] relative overflow-hidden">
                        
                        {/* CURRENT ROOM SUMMARY HEADER */}
                        <div className="flex items-center justify-between border-b border-slate-900 p-4 shrink-0 bg-black/40">
                            <span className="text-[10px] font-mono font-black text-emerald-400 flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" />
                                ROOM_CONDUIT: {selectedSpace ? selectedSpace.displayName.toUpperCase() : 'NO ACTIVE SELECTION'}
                            </span>
                            
                            {selectedSpace && (
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] text-zinc-500 font-mono uppercase flex items-center gap-1">
                                        <Users className="w-3 h-3 text-zinc-500" /> Member Pool: {members.length}
                                    </span>
                                    <button
                                        onClick={() => handleSelectSpace(selectedSpace)}
                                        disabled={isRefreshingMessages}
                                        title="Sync Messages"
                                        className="p-1 bg-slate-950 hover:bg-zinc-900 border border-slate-850 rounded text-zinc-500 hover:text-white transition-all cursor-pointer"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${isRefreshingMessages ? 'animate-spin text-emerald-400' : ''}`} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* MESSAGE BOARD */}
                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                            {!selectedSpace ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <MessageSquare className="w-12 h-12 text-zinc-700 mb-3 animate-bounce" />
                                    <p className="text-sm font-black text-zinc-400 uppercase tracking-wider">Gathering fellowship rooms</p>
                                    <p className="text-[10px] text-zinc-500 mt-1 max-w-xs leading-normal">
                                        Select an active workspace sanctuary room from the sidebar to establish message pipes.
                                    </p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-950 bg-black/25 rounded-xl">
                                    <Users className="w-10 h-10 text-zinc-700 mb-3" />
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">The Sanctified Room is Peaceful</p>
                                    <p className="text-[10px] text-zinc-500 mt-1 max-w-xs leading-normal italic">
                                        No messages are currently stored on the Google Chat server for this space. Type a graceful word below to begin.
                                    </p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isSigned = msg.text.includes('INTEGRITY-COVENANT SEALED');
                                    const senderName = msg.sender?.displayName || 'Fellow Servant';

                                    return (
                                        <div 
                                            key={msg.name}
                                            className={`p-3 rounded-xl border flex flex-col justify-between transition-all hover:bg-black/40 ${
                                                isSigned 
                                                ? 'bg-emerald-950/5 border-emerald-500/10 hover:border-emerald-500/20' 
                                                : 'bg-slate-900/15 border-slate-850 hover:border-slate-800'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2.5">
                                                    {msg.sender?.avatarUrl ? (
                                                        <img src={msg.sender.avatarUrl} alt={senderName} className="w-5 h-5 rounded-full border border-slate-800" referrerPolicy="no-referrer" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-zinc-900 border border-slate-800 flex items-center justify-center text-[8px] font-bold text-zinc-500 uppercase">
                                                            {senderName.substring(0, 1)}
                                                        </div>
                                                    )}
                                                    <span className="text-xs font-bold text-white tracking-wide">
                                                        {senderName}
                                                    </span>
                                                    {isSigned && (
                                                        <span className="text-[7px] font-black font-mono bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                            <LockKeyhole className="w-2 h-2 text-emerald-400" /> Signed Code
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => setMessageToDelete(msg)}
                                                    title="Pardon (Harden Delete)"
                                                    className="opacity-20 hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-red-950/30 transition-all cursor-pointer"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="mt-2 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap pl-1 border-l border-slate-900">
                                                {msg.text}
                                            </div>

                                            <div className="mt-2 pt-2 border-t border-slate-950 flex justify-between items-center text-[8px] text-zinc-600 font-mono uppercase">
                                                <span>REF: {msg.name.substring(msg.name.lastIndexOf('/') + 1)}</span>
                                                <span>{new Date(msg.createTime).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* BOTTOM INPUT AND BROADCAST SHELF */}
                        {selectedSpace && (
                            <div className="p-4 bg-black/60 border-t border-slate-900 space-y-3 shrink-0">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Speak, Lord, for your servant is listening... (Enter message)"
                                        value={newMessageText}
                                        onChange={(e) => setNewMessageText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-emerald-500/50"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isSendingMessage || !newMessageText.trim()}
                                        className="px-4 py-3 bg-emerald-950 hover:bg-emerald-900 disabled:opacity-50 border border-emerald-500 text-emerald-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap justify-between items-center gap-2 text-[9px] text-zinc-500 font-mono">
                                    <span className="flex items-center gap-1.5 uppercase">
                                        <Lock className="w-3.5 h-3.5 text-zinc-600" /> 
                                        {useCovenantSeal ? 'Covenant Seal Active' : 'Unsealed Transmission'}
                                    </span>
                                    <span className="uppercase italic">
                                        Press ENTER or click Send to emit to Google Chat
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL: SPACE MEMBERS BOARD */}
                    <div className="w-full lg:w-64 bg-black/70 border-l border-slate-900 flex flex-col shrink-0 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                        <div className="border-b border-slate-900 pb-3">
                            <span className="text-[9px] bg-slate-900 px-2 py-0.5 border border-slate-850 rounded text-zinc-400 font-bold font-mono">
                                FELLOWSHIP MEMBERS
                            </span>
                            <h3 className="text-xs font-black text-white mt-2 uppercase tracking-wider flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Active Communion Pool
                            </h3>
                        </div>

                        {selectedSpace ? (
                            <div className="space-y-2">
                                {members.length === 0 ? (
                                    <span className="text-[10px] text-zinc-500 block font-mono uppercase">Syncing member pool...</span>
                                ) : (
                                    members.map(member => (
                                        <div 
                                            key={member.name}
                                            className="p-2.5 bg-slate-950/50 border border-slate-900 hover:border-slate-800 rounded-lg flex items-center justify-between gap-2.5 text-xs font-mono"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                                <span className="text-zinc-200 font-bold truncate max-w-[140px]" title={member.member.displayName}>
                                                    {member.member.displayName}
                                                </span>
                                            </div>
                                            <span className="text-[7px] border border-zinc-800 bg-black text-zinc-500 px-1 py-0.5 rounded font-bold">
                                                {member.member.type}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-slate-950/20 border border-dashed border-slate-900 rounded-xl">
                                <UserCheck className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                                <span className="text-[9px] font-mono text-zinc-500 uppercase block">No Members Loaded</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* HARDENED COVENANT DELETION PROTECTION MODAL */}
            <AnimatePresence>
                {messageToDelete && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#050508] border-2 border-red-500 max-w-md w-full rounded-2xl p-6 shadow-[0_0_35px_rgba(239,68,68,0.25)] space-y-4"
                        >
                            <div className="flex items-center gap-3 text-red-500 border-b border-red-500/25 pb-3">
                                <AlertCircle className="w-7 h-7" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">COVENANT SHIELD: ERASURE BLOCKED</h3>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                Under security policies, file nodes and message records are protected and cannot be deleted **unless you explicitly say so** and perform scriptural covenant reconciliation.
                            </p>

                            <div className="bg-black border border-red-500/20 p-3 rounded-lg space-y-1.5">
                                <span className="text-[8px] font-mono text-zinc-500 uppercase block">RECORD TARGETED FOR DELETION</span>
                                <div className="text-xs font-mono text-zinc-300 line-clamp-2 italic">
                                    "{messageToDelete.text}"
                                </div>
                            </div>

                            {/* DELETION STEPS REQUIRED */}
                            <div className="space-y-3 pt-2 border-t border-slate-900">
                                
                                {/* Step 1: Explicit Declaration Phrase */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-red-400 uppercase tracking-wide font-black">
                                        STEP 1: Verbal Authorization Statement
                                    </label>
                                    <p className="text-[9px] text-zinc-500 italic leading-tight mb-1">
                                        Verify authorization by typing exactly: "I authorize the deletion of this record"
                                    </p>
                                    <input
                                        type="text"
                                        placeholder="Type verification phrase..."
                                        value={deletionPhrase}
                                        onChange={(e) => setDeletionPhrase(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-850 px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono rounded-lg focus:outline-none focus:border-red-500"
                                    />
                                </div>

                                {/* Step 2: Choose Scripture Reconciliation */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-red-400 uppercase tracking-wide font-black">
                                        STEP 2: Scripture Reconciliation Seal
                                    </label>
                                    <p className="text-[9px] text-zinc-500 italic leading-tight mb-1">
                                        Select the scripture passage that grants pardon to erase this historic record:
                                    </p>
                                    <select
                                        value={selectedScriptureReconciliation}
                                        onChange={(e) => setSelectedScriptureReconciliation(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-850 px-3 py-1.5 text-xs text-zinc-300 font-mono rounded-lg focus:outline-none focus:border-red-500"
                                    >
                                        <option value="">-- Choose Scripture Reconciliation Passage --</option>
                                        {scripturePassages.map(sc => (
                                            <option key={sc.id} value={sc.id}>
                                                {sc.reference} — {sc.text.substring(0, 45)}...
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <p className="text-[10px] text-zinc-500 leading-normal italic pt-1">
                                "He remembers our sins no more." Your file is secure until absolute clearance matches our gates.
                            </p>

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                                <button
                                    onClick={() => {
                                        setMessageToDelete(null);
                                        setDeletionPhrase('');
                                        setDeletionPasskey('');
                                        setSelectedScriptureReconciliation('');
                                    }}
                                    className="py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-zinc-300 text-xs font-black tracking-widest uppercase rounded-lg transition-all cursor-pointer"
                                >
                                    ABORT ERASURE
                                </button>
                                <button
                                    onClick={handleExecuteHardenDelete}
                                    disabled={isExecutingDelete || deletionPhrase !== 'I authorize the deletion of this record' || !selectedScriptureReconciliation}
                                    className="py-2.5 bg-red-950/80 hover:bg-red-900 disabled:opacity-40 disabled:cursor-not-allowed border border-red-500 text-red-200 text-xs font-black tracking-widest uppercase rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                                >
                                    {isExecutingDelete ? 'BLOTTING OUT...' : 'CONFIRM ERASURE'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
