import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { googleDocsService, GoogleDocument } from '../services/googleDocsService';
import { googleSignIn, googleSignOut } from '../services/firebaseAuthService';
import { 
    FileText, Search, RefreshCw, PlusCircle, ExternalLink, 
    Trash2, Save, Send, Shield, Activity, Info, X, Check, Loader2, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface GoogleDocsViewProps {
    onAddLog?: (log: string) => void;
}

export const GoogleDocsView: React.FC<GoogleDocsViewProps> = ({ onAddLog }) => {
    // Auth & Connection
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
    const [userProfile, setUserProfile] = useState<{ email?: string; name?: string; photoURL?: string } | null>(null);

    // Document Explorer State
    const [documents, setDocuments] = useState<any[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<GoogleDocument | null>(null);
    const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
    const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // Creation & Editing State
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
    const [newDocTitle, setNewDocTitle] = useState<string>('');
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [editingContent, setEditingContent] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [appendText, setAppendText] = useState<string>('');
    const [isAppending, setIsAppending] = useState<boolean>(false);

    // Check existing Connection on Load
    const checkConnection = useCallback(async () => {
        setIsLoadingAuth(true);
        try {
            const token = await googleDocsService.fetchDocs('documents/invalid-id-just-to-check').catch((err) => {
                // If it's a 401/expired, it throws connection expired, otherwise if it's 404/invalid, it means we are authenticated but document id was wrong
                if (err.message && err.message.includes('No active Google Docs connection')) {
                    return null;
                }
                return 'connected';
            });
            const connected = !!token;
            setIsConnected(connected);
            if (connected) {
                fetchDocuments();
            }
        } catch (err) {
            console.error('Connection check failed:', err);
        } finally {
            setIsLoadingAuth(false);
        }
    }, []);

    useEffect(() => {
        checkConnection();
    }, [checkConnection]);

    // Handle Authentication Connect
    const handleConnect = async () => {
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
                toast.success('Google Workspace Gateway Connected', {
                    description: 'AetherOS secure Google Docs interface synced successfully.'
                });
                if (onAddLog) onAddLog('System established Google Docs gateway connection with appropriate user permissions.');
                fetchDocuments();
            } else {
                toast.error('Handshake failed. Verify permission scopes.');
            }
        } catch (err: any) {
            toast.error('Authorization Handshake Failed', {
                description: err.message || 'Error authenticating with Google.'
            });
        } finally {
            setIsLoadingAuth(false);
        }
    };

    // Disconnect Node
    const handleDisconnect = async () => {
        try {
            await googleSignOut();
            setIsConnected(false);
            setDocuments([]);
            setSelectedDoc(null);
            setEditingContent('');
            toast.success('Workspace Gateway Disconnected');
            if (onAddLog) onAddLog('Google Docs terminal connection terminated.');
        } catch (err) {
            toast.error('Failed to log out.');
        }
    };

    // Query Document Registry List
    const fetchDocuments = async () => {
        setIsLoadingList(true);
        setIsRefreshing(true);
        try {
            const docs = await googleDocsService.listDocuments(30, searchQuery);
            setDocuments(docs);
        } catch (err: any) {
            console.error('Error fetching documents:', err);
            toast.error('Registry query failed', {
                description: err.message || 'Could not list Google Docs.'
            });
        } finally {
            setIsLoadingList(false);
            setIsRefreshing(false);
        }
    };

    // Trigger search when query state updates
    useEffect(() => {
        if (isConnected) {
            const delayDebounce = setTimeout(() => {
                fetchDocuments();
            }, 400);
            return () => clearTimeout(delayDebounce);
        }
    }, [searchQuery, isConnected]);

    // Load Specific Document Text & Body Content
    const handleSelectDocument = async (docId: string) => {
        setIsLoadingDoc(true);
        setEditingContent('');
        setAppendText('');
        try {
            const doc = await googleDocsService.getDocument(docId);
            setSelectedDoc(doc);
            setEditingContent(doc.bodyContent || '');
            if (onAddLog) onAddLog(`Loaded Google Document: "${doc.title}" (${docId})`);
        } catch (err: any) {
            toast.error('Document analysis failed', {
                description: err.message
            });
        } finally {
            setIsLoadingDoc(false);
        }
    };

    // Create New Document Node
    const handleCreateDocument = async () => {
        if (!newDocTitle.trim()) {
            toast.error('Title required for document node.');
            return;
        }

        setIsCreating(true);
        try {
            const newDoc = await googleDocsService.createDocument(newDocTitle.trim());
            toast.success(`Google Doc '${newDoc.title}' established successfully.`);
            setNewDocTitle('');
            setIsCreateOpen(false);
            fetchDocuments();
            handleSelectDocument(newDoc.documentId);
            if (onAddLog) onAddLog(`Created empty Google Doc: "${newDoc.title}"`);
        } catch (err: any) {
            toast.error('Creation failed', {
                description: err.message
            });
        } finally {
            setIsCreating(false);
        }
    };

    // Mutate: Save/Replace Document Content (MANDATORY Confirmation)
    const handleSaveContent = async () => {
        if (!selectedDoc) return;

        const confirmed = window.confirm(
            `CONFIRM DESTRUCTIVE REWRITE:\nAre you sure you want to completely overwrite "${selectedDoc.title}" content with your new edits? This cannot be undone.`
        );
        if (!confirmed) return;

        setIsSaving(true);
        try {
            await googleDocsService.replaceContent(selectedDoc.documentId, editingContent);
            toast.success('Document updated successfully.');
            // Reload
            await handleSelectDocument(selectedDoc.documentId);
            if (onAddLog) onAddLog(`Rewrote content of Google Document: "${selectedDoc.title}"`);
        } catch (err: any) {
            toast.error('Modification failed', {
                description: err.message
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Mutate: Append text to Document End
    const handleAppendText = async () => {
        if (!selectedDoc || !appendText.trim()) return;

        setIsAppending(true);
        try {
            await googleDocsService.appendText(selectedDoc.documentId, appendText);
            toast.success('Text appended safely.');
            setAppendText('');
            await handleSelectDocument(selectedDoc.documentId);
            if (onAddLog) onAddLog(`Appended text to Google Document "${selectedDoc.title}"`);
        } catch (err: any) {
            toast.error('Append operation failed', {
                description: err.message
            });
        } finally {
            setIsAppending(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#030307] text-zinc-100 font-mono text-xs overflow-hidden">
            {/* Header / Connection Status Row */}
            <div className="border-b border-rose-950 p-4 bg-zinc-950/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-rose-500 animate-pulse" />
                    <div>
                        <h1 className="text-sm font-black tracking-wider text-rose-400 uppercase">
                            AetherOS // Google Docs Gateway
                        </h1>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                            Realtime Sovereign Document Registry & Compilation Matrix
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    {isConnected ? (
                        <div className="flex items-center gap-3 bg-rose-950/25 border border-rose-900/40 px-3 py-1.5 rounded-xl self-stretch sm:self-auto">
                            {userProfile?.photoURL ? (
                                <img src={userProfile.photoURL} alt="Avatar" className="w-5 h-5 rounded-full border border-rose-500/50" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-rose-900/50 flex items-center justify-center font-bold text-[10px]">U</div>
                            )}
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] text-rose-400 font-bold">{userProfile?.name || 'Authorized user'}</span>
                                <span className="text-[8px] text-zinc-500 font-mono lowercase">{userProfile?.email || 'authenticated'}</span>
                            </div>
                            <button 
                                onClick={handleDisconnect}
                                className="ml-2 bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 border border-rose-800/50 hover:border-rose-500 px-2 py-1 rounded text-[10px] transition-all cursor-pointer"
                            >
                                DISCONNECT
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={isLoadingAuth}
                            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-black font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50 cursor-pointer"
                        >
                            {isLoadingAuth ? (
                                <Loader2 className="w-4 h-4 animate-spin text-black" />
                            ) : (
                                <Sparkles className="w-4 h-4 text-black" />
                            )}
                            <span className="text-xs uppercase font-black">Authorize Google Docs Gateway</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Gateway Not Connected view */}
            {!isConnected ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
                    <div className="bg-rose-950/20 border border-rose-900/30 p-6 rounded-2xl mb-4 relative overflow-hidden shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]">
                        <FileText className="w-12 h-12 text-rose-500/70 mx-auto mb-4" />
                        <h2 className="text-xs font-black tracking-widest text-rose-400 uppercase mb-2">Google Docs Conduit Offline</h2>
                        <p className="text-[10px] text-zinc-400 leading-relaxed uppercase">
                            This node lets you interact securely with your Google Documents. Access files, analyze structural strings, compile text indices, and construct revisions with granular mainnet-inspired safety checks.
                        </p>
                    </div>
                    <button
                        onClick={handleConnect}
                        className="bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-500/60 px-6 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                        <span>Establish Handshake Connection</span>
                    </button>
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                    {/* Left Panel: List & Search */}
                    <div className="lg:col-span-4 border-r border-rose-950/40 flex flex-col overflow-hidden bg-zinc-950/25">
                        <div className="p-3 border-b border-rose-950/30 flex flex-col gap-2">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-rose-500/60 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH DOCUMENT PATHWAYS..."
                                    className="w-full bg-black border border-rose-950 rounded-lg py-2 pl-9 pr-4 text-[10px] font-bold text-rose-400 placeholder:text-rose-950 focus:outline-none focus:border-rose-500/60 transition-all uppercase"
                                />
                            </div>

                            <div className="flex justify-between items-center gap-2">
                                <button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="flex-1 bg-rose-950/20 hover:bg-rose-950/50 text-rose-400 border border-rose-900/50 px-2.5 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 hover:border-rose-500/40 transition-all cursor-pointer"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>NEW DOCUMENT</span>
                                </button>
                                <button
                                    onClick={fetchDocuments}
                                    disabled={isRefreshing}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
                                    title="Reload Document Registry"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                            {isLoadingList ? (
                                <div className="text-center py-12 flex flex-col items-center justify-center gap-2 text-zinc-500">
                                    <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                                    <span className="uppercase text-[9px] font-bold tracking-widest">Querying Docs Index...</span>
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="text-center py-12 text-zinc-600 uppercase text-[9px] font-bold">
                                    No document pathways matched.
                                </div>
                            ) : (
                                documents.map((doc) => {
                                    const isSelected = selectedDoc?.documentId === doc.id;
                                    return (
                                        <button
                                            key={doc.id}
                                            onClick={() => handleSelectDocument(doc.id)}
                                            className={`w-full text-left p-3 rounded-xl border flex flex-col gap-1 transition-all group relative overflow-hidden ${
                                                isSelected 
                                                    ? 'bg-rose-950/25 border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.08)]' 
                                                    : 'bg-zinc-950/40 border-rose-950/30 hover:bg-rose-950/10 hover:border-rose-900/40'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex items-center gap-2">
                                                    <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400' : 'text-zinc-500 group-hover:text-rose-400'}`} />
                                                    <span className={`font-bold truncate max-w-[150px] sm:max-w-[180px] ${isSelected ? 'text-rose-300' : 'text-zinc-300'}`}>
                                                        {doc.name || 'Untitled document'}
                                                    </span>
                                                </div>
                                                <a 
                                                    href={doc.webViewLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-0.5 transition-opacity"
                                                    title="Open in Google Docs"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                            <div className="flex justify-between items-center text-[8px] text-zinc-500 font-mono mt-1">
                                                <span>MOD: {new Date(doc.modifiedTime).toLocaleDateString()}</span>
                                                <span className="text-[7px] text-zinc-600 font-bold tracking-widest uppercase">ID: {doc.id.substring(0, 6)}...</span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Content viewer & Mutation Console */}
                    <div className="lg:col-span-8 flex flex-col overflow-hidden bg-black/40">
                        {isLoadingDoc ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8">
                                <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-2" />
                                <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest animate-pulse">Decrypting Document Body Matrices...</span>
                            </div>
                        ) : selectedDoc ? (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Doc Action Header */}
                                <div className="border-b border-rose-950/40 p-3 bg-zinc-950/30 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded bg-rose-950/40 border border-rose-900/30">
                                            <FileText className="w-4 h-4 text-rose-400" />
                                        </div>
                                        <div>
                                            <h2 className="font-black text-rose-400 uppercase tracking-wider">{selectedDoc.title}</h2>
                                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Doc ID: {selectedDoc.documentId}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={handleSaveContent}
                                            disabled={isSaving}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                            title="Overwrite entire Google Doc content with current editor content"
                                        >
                                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin text-black" /> : <Save className="w-3.5 h-3.5 text-black" />}
                                            <span>DEPLOY OVERWRITE</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                                    {/* Edit/Source Column */}
                                    <div className="md:col-span-7 flex flex-col border-r border-rose-950/30 overflow-hidden">
                                        <div className="p-2 border-b border-rose-950/30 bg-zinc-950/15 flex justify-between items-center">
                                            <span className="text-[9px] text-rose-500/70 font-black uppercase tracking-widest">Document Editor</span>
                                            <span className="text-[8px] text-zinc-500 font-bold font-mono uppercase">{editingContent.length} bytes</span>
                                        </div>
                                        <textarea
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            placeholder="AWAITING DOCUMENT STREAM OR INPUT..."
                                            className="flex-1 bg-black text-rose-400/90 font-mono p-4 text-xs focus:outline-none resize-none leading-relaxed overflow-y-auto placeholder:text-rose-950/40"
                                        />
                                    </div>

                                    {/* Action/Append Column */}
                                    <div className="md:col-span-5 flex flex-col overflow-y-auto bg-zinc-950/10 p-4 gap-4">
                                        {/* Overview card */}
                                        <div className="bg-zinc-950 border border-rose-950/60 p-3.5 rounded-xl flex flex-col gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                                            <div className="flex items-center gap-1.5 border-b border-rose-950/40 pb-1.5 mb-1">
                                                <Activity className="w-3.5 h-3.5 text-rose-500" />
                                                <span className="text-[9px] font-black tracking-widest uppercase text-rose-400">Node Compliance Details</span>
                                            </div>
                                            <div className="space-y-1.5 text-[9px] text-zinc-400 font-mono">
                                                <div className="flex justify-between">
                                                    <span>MimeType:</span>
                                                    <span className="text-zinc-500">Google Doc</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Decrypted Length:</span>
                                                    <span className="text-rose-500 font-bold">{selectedDoc.bodyContent?.length || 0} chars</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Active Integrity:</span>
                                                    <span className="text-emerald-500 font-bold">MUTABILITY ENABLED</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Append Text Card */}
                                        <div className="bg-zinc-950 border border-rose-950/40 p-4 rounded-xl flex flex-col gap-3">
                                            <div className="flex items-center gap-1.5 border-b border-rose-950/30 pb-2">
                                                <Send className="w-3.5 h-3.5 text-rose-400" />
                                                <span className="text-[9px] font-black tracking-widest uppercase text-rose-400">Append Node String</span>
                                            </div>
                                            <p className="text-[8px] text-zinc-500 leading-normal uppercase">
                                                Appends text safely to the exact end of the Google Doc without affecting previous character index states.
                                            </p>
                                            <textarea
                                                value={appendText}
                                                onChange={(e) => setAppendText(e.target.value)}
                                                placeholder="ENTER STRING LOGIC TO APPEND..."
                                                className="w-full bg-black border border-rose-950 rounded-lg p-2.5 text-[10px] font-bold text-rose-400 placeholder:text-rose-950 focus:outline-none focus:border-rose-500/60 min-h-[70px] resize-none"
                                            />
                                            <button
                                                onClick={handleAppendText}
                                                disabled={isAppending || !appendText.trim()}
                                                className="bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-500/50 px-3 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {isAppending ? (
                                                    <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                                                ) : (
                                                    <Check className="w-3.5 h-3.5" />
                                                )}
                                                <span>APPEND TO DOCUMENT</span>
                                            </button>
                                        </div>

                                        {/* Safety guidelines info */}
                                        <div className="p-3 bg-rose-950/5 border border-rose-950/40 rounded-xl flex gap-2.5">
                                            <Info className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                                            <div className="flex flex-col gap-1 text-[8px] text-zinc-500 uppercase leading-normal">
                                                <span className="font-bold text-rose-400/80">Compliance Protocol Warning:</span>
                                                <span>Writing/editing external documents executes a Google Workspace API call on behalf of your active session. Confirm compliance indices manually.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 uppercase">
                                <FileText className="w-10 h-10 text-rose-950/40 mb-3" />
                                <span className="text-[9px] font-bold tracking-widest text-zinc-600">Select a document pathway from registry list</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Creation Dialog Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-zinc-950 border-2 border-rose-500/80 w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.15)]"
                        >
                            <div className="border-b border-rose-950 p-4 flex justify-between items-center bg-rose-950/10">
                                <span className="text-xs font-black text-rose-400 tracking-wider uppercase">COMPILE NEW DOCUMENT</span>
                                <button onClick={() => setIsCreateOpen(false)} className="text-zinc-500 hover:text-rose-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4 flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">Document Name / Identifier</label>
                                    <input
                                        type="text"
                                        value={newDocTitle}
                                        onChange={(e) => setNewDocTitle(e.target.value)}
                                        placeholder="E.G. STRATEGY_DECREE_ALPHA"
                                        className="w-full bg-black border border-rose-950 rounded-xl p-3 text-xs font-bold text-rose-400 placeholder:text-rose-950 uppercase tracking-wide focus:outline-none focus:border-rose-500/60"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateDocument}
                                        disabled={isCreating || !newDocTitle.trim()}
                                        className="flex-1 bg-rose-600 hover:bg-rose-500 text-black py-2.5 rounded-xl font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.35)] disabled:opacity-50 cursor-pointer"
                                    >
                                        {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <PlusCircle className="w-3.5 h-3.5 text-black" />}
                                        <span>ESTABLISH DOC</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
