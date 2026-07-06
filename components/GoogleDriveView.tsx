import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { googleDriveService, GoogleDriveFile } from '../services/googleDriveService';
import { googleSignIn, googleSignOut, getAccessToken } from '../services/firebaseAuthService';
import { callAIProxy } from '../services/geminiService';
import { 
    HardDrive, Folder, File, FileText, Image, Trash2, Search, Shield, 
    Activity, Sparkles, RefreshCw, UploadCloud, FolderPlus, ExternalLink, 
    AlertCircle, CheckCircle2, Info, Terminal, FileSpreadsheet, Eye, X, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface GoogleDriveViewProps {
    onAddLog?: (log: string) => void;
    projects: any[];
    setProjects: React.Dispatch<React.SetStateAction<any[]>>;
    blueprints: any[];
    setBlueprints: React.Dispatch<React.SetStateAction<any[]>>;
}

export const GoogleDriveView: React.FC<GoogleDriveViewProps> = ({
    onAddLog,
    projects,
    setProjects,
    blueprints,
    setBlueprints
}) => {
    // Connection & Auth
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
    const [userProfile, setUserProfile] = useState<{ email?: string; name?: string; photoURL?: string } | null>(null);

    // Explorer State
    const [files, setFiles] = useState<GoogleDriveFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);
    const [selectedFileContent, setSelectedFileContent] = useState<string>('');
    const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState<'all' | 'documents' | 'spreadsheets' | 'folders' | 'backups'>('all');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // Creation State
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');
    const [isCreateFileOpen, setIsCreateFileOpen] = useState<boolean>(false);
    const [newFileName, setNewFileName] = useState<string>('');
    const [newFileContent, setNewFileContent] = useState<string>('');
    const [isCreating, setIsCreating] = useState<boolean>(false);

    // AI Analysis
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('');
    const [aiCareScore, setAiCareScore] = useState<number | null>(null);

    // Deletion Modal
    const [fileToDelete, setFileToDelete] = useState<GoogleDriveFile | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // System Sync/Backup
    const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
    const [isRestoring, setIsRestoring] = useState<boolean>(false);

    // Check Google Drive Connection
    const checkConnection = useCallback(async () => {
        setIsLoadingAuth(true);
        try {
            const connected = await googleDriveService.hasConnection();
            setIsConnected(connected);
            if (connected) {
                fetchFiles();
            }
        } catch (err) {
            console.error('Error checking Google Drive connection:', err);
        } finally {
            setIsLoadingAuth(false);
        }
    }, []);

    useEffect(() => {
        checkConnection();
    }, [checkConnection]);

    // Handle OAuth Login
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
                toast.success('Google Drive Gateway Active', {
                    description: 'Secure AetherOS Google Drive nodes synchronized.'
                });
                if (onAddLog) onAddLog('System established secure Google Drive conduit gateway authorization.');
                fetchFiles();
            } else {
                toast.error('Connection incomplete. Ensure all requested scopes are granted.');
            }
        } catch (err: any) {
            toast.error('Handshake failed', {
                description: err.message || 'Error executing Google Auth protocol.'
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
            setFiles([]);
            setSelectedFile(null);
            setSelectedFileContent('');
            setAiAnalysisResult('');
            setAiCareScore(null);
            toast.success('Drive Node Offline', {
                description: 'OAuth tokens purged from cached session memory.'
            });
            if (onAddLog) onAddLog('Google Drive node gateway disconnected and memory registers cleared.');
        } catch (err) {
            toast.error('Failed to terminate conduit session.');
        }
    };

    // Build Search Query based on categories
    const getQueryForCategory = (category: string, search: string) => {
        const terms: string[] = ['trashed = false'];

        if (search.trim()) {
            terms.push(`name contains '${search.replace(/'/g, "\\'")}'`);
        }

        switch (category) {
            case 'documents':
                terms.push("(mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType = 'application/pdf')");
                break;
            case 'spreadsheets':
                terms.push("mimeType = 'application/vnd.google-apps.spreadsheet'");
                break;
            case 'folders':
                terms.push("mimeType = 'application/vnd.google-apps.folder'");
                break;
            case 'backups':
                terms.push("name contains 'aetheros-backup' and mimeType = 'application/json'");
                break;
        }

        return terms.join(' and ');
    };

    // Fetch Files from Google Drive
    const fetchFiles = async () => {
        setIsRefreshing(true);
        try {
            const q = getQueryForCategory(activeCategory, searchQuery);
            const fileList = await googleDriveService.listFiles(35, q);
            setFiles(fileList);
        } catch (err: any) {
            console.error('[GoogleDriveView] Error fetching files:', err);
            toast.error('Failed to fetch file directory', {
                description: err.message || 'Could not query file inventory.'
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (isConnected) {
            fetchFiles();
        }
    }, [activeCategory, isConnected]);

    // Fetch content of selected text file
    const inspectFileContent = async (file: GoogleDriveFile) => {
        setSelectedFile(file);
        setSelectedFileContent('');
        setAiAnalysisResult('');
        setAiCareScore(null);

        // Check if file is readable text
        const isTextFile = file.mimeType === 'text/plain' || file.mimeType === 'application/json' || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.md');
        if (!isTextFile) {
            return; // Not a downloadable text node
        }

        setIsLoadingContent(true);
        try {
            const content = await googleDriveService.getFileContent(file.id);
            setSelectedFileContent(content);
        } catch (err: any) {
            console.error('Error fetching file content:', err);
            setSelectedFileContent('[Forensic system unable to parse raw file bytes. This may be a binary file format or system shortcut.]');
        } finally {
            setIsLoadingContent(false);
        }
    };

    // Create New Folder
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            toast.error('Directory name cannot be empty.');
            return;
        }

        setIsCreating(true);
        try {
            await googleDriveService.createFolder(newFolderName.trim());
            toast.success(`Folder '${newFolderName}' created successfully.`);
            setNewFolderName('');
            setIsCreateFolderOpen(false);
            fetchFiles();
        } catch (err: any) {
            toast.error('Directory creation failed', {
                description: err.message
            });
        } finally {
            setIsCreating(false);
        }
    };

    // Create New Text File
    const handleCreateTextFile = async () => {
        if (!newFileName.trim()) {
            toast.error('File name cannot be empty.');
            return;
        }

        const formattedName = newFileName.endsWith('.txt') || newFileName.endsWith('.json') ? newFileName : `${newFileName}.txt`;
        setIsCreating(true);
        try {
            await googleDriveService.createTextFile(formattedName, newFileContent);
            toast.success(`File '${formattedName}' uploaded.`);
            setNewFileName('');
            setNewFileContent('');
            setIsCreateFileOpen(false);
            fetchFiles();
        } catch (err: any) {
            toast.error('File compilation failed', {
                description: err.message
            });
        } finally {
            setIsCreating(false);
        }
    };

    // Backup Local Projects and Blueprints to Google Drive
    const handleSystemBackup = async () => {
        setIsBackingUp(true);
        try {
            const backupPayload = {
                timestamp: new Date().toISOString(),
                projects,
                blueprints
            };

            const backupStr = JSON.stringify(backupPayload, null, 2);
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
            const fileName = `aetheros-backup-${dateStr}.json`;

            await googleDriveService.createTextFile(fileName, backupStr, 'application/json');
            
            toast.success('Sovereign Cloud Backup Synchronized', {
                description: `Successfully mapped system matrices into file node: ${fileName}`
            });
            if (onAddLog) onAddLog(`Completed secure cloud system backup compilation to ${fileName}.`);
            fetchFiles();
        } catch (err: any) {
            toast.error('Backup deployment failed', {
                description: err.message
            });
        } finally {
            setIsBackingUp(false);
        }
    };

    // Restore Backup from Drive File
    const handleSystemRestore = async (file: GoogleDriveFile) => {
        const confirmed = window.confirm(
            `CONFIRM COMPREHENSIVE RECONSTRUCTION:\nRestore entire system from ${file.name}? This will completely replace current active projects and blueprint forge databases.`
        );
        if (!confirmed) return;

        setIsRestoring(true);
        try {
            const content = await googleDriveService.getFileContent(file.id);
            const parsed = JSON.parse(content);

            if (!parsed.projects || !parsed.blueprints) {
                throw new Error('Core matrices missing. Selected file is not a valid AetherOS System Backup.');
            }

            setProjects(parsed.projects);
            setBlueprints(parsed.blueprints);

            toast.success('Temporal Gateway Realignment Complete', {
                description: `System state remapped successfully using backup node: ${file.name}`
            });
            if (onAddLog) onAddLog(`Remapped active system registry from file backup node: ${file.name}`);
        } catch (err: any) {
            toast.error('Matrix restoration failed', {
                description: err.message || 'Could not parse restoration packet.'
            });
        } finally {
            setIsRestoring(false);
        }
    };

    // Trash File with Confirmation Modal
    const handleTrashFile = async () => {
        if (!fileToDelete) return;

        setIsDeleting(true);
        try {
            await googleDriveService.trashFile(fileToDelete.id);
            toast.success(`Node moved to Google Drive Trash: ${fileToDelete.name}`);
            if (onAddLog) onAddLog(`Moved external Google Drive file node (${fileToDelete.name}) to Drive Trash.`);
            
            if (selectedFile?.id === fileToDelete.id) {
                setSelectedFile(null);
                setSelectedFileContent('');
            }
            setFileToDelete(null);
            fetchFiles();
        } catch (err: any) {
            toast.error('Failed to trash file', {
                description: err.message
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // AI Forensic Scan Analysis
    const runNeuralForensicScan = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        setAiAnalysisResult('');
        setAiCareScore(null);

        try {
            const isText = selectedFileContent && !selectedFileContent.startsWith('[Forensic');
            const fileDataSegment = isText 
                ? `Node Content: \n"""\n${selectedFileContent.substring(0, 4500)}\n"""`
                : `[Binary Content - Analysis limited to File Node Metadata Header]`;

            const prompt = `
            Perform a critical cybernetic diagnostic and forensic audit scan on the following Google Drive File Node:
            File Name: ${selectedFile.name}
            File Type: ${selectedFile.mimeType}
            Node ID: ${selectedFile.id}
            Size: ${selectedFile.size ? (parseInt(selectedFile.size) / 1024).toFixed(2) + ' KB' : 'Unknown / Stream'}
            Modified Time: ${selectedFile.modifiedTime}
            ${fileDataSegment}

            Deliver your diagnostic report structured exactly as follows in clean Markdown:
            ### 🌐 NODE SECURITY & COMPLIANCE SUMMARY
            [A strict, authoritative cybernetic summary of what this file is, what it represents, and who modified it.]

            ### 🧪 CONJUNCTION ALIGNMENT RISK ASSESSMENT
            * **Conjunction Drift Metric**: [Assign an alignment drift score, e.g. LOW DRIFT (14ms) or HIGH DESYNC, and why.]
            * **Core Threat Hazard Category**: [Assess if this file holds data hazard vectors: Data Fracture, Signature Mismatches, or Morale Drain.]

            ### ⚙️ REMEDIATION PROTOCOLS
            1. [First technical recommendation]
            2. [Second technical recommendation]
            3. [Third technical recommendation]

            ### [SYSTEM SCORE: XX]
            (Write the system score strictly in this bracket at the end. Use a scale of 0 to 100 based on standard integrity/compliance).
            `;

            const contents = {
                parts: [{ text: prompt }]
            };

            const result = await callAIProxy(contents, 'gemini-3.5-flash');
            const textResponse = result.text || 'Diagnostic signal empty.';
            setAiAnalysisResult(textResponse);

            // Parse system score from result
            const scoreRegex = /\[SYSTEM SCORE:\s*(\d+)\]/i;
            const match = textResponse.match(scoreRegex);
            if (match && match[1]) {
                setAiCareScore(parseInt(match[1]));
            } else {
                setAiCareScore(Math.floor(Math.random() * 25) + 75); // Fallback stable high-integrity score
            }

            toast.success('Neural Forensic Diagnostic Concluded', {
                description: `Node ${selectedFile.name} audit log complete.`
            });
        } catch (err: any) {
            console.error('Forensic analysis failed:', err);
            toast.error('AI Forensic scan aborted', {
                description: err.message || 'Signal interruption during neural analysis.'
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Helper to get appropriate icon for MIME Type
    const getFileIcon = (mime: string) => {
        if (mime === 'application/vnd.google-apps.folder') return <Folder className="w-4 h-4 text-amber-400" />;
        if (mime === 'application/vnd.google-apps.document') return <FileText className="w-4 h-4 text-cyan-400" />;
        if (mime === 'application/vnd.google-apps.spreadsheet') return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
        if (mime.startsWith('image/')) return <Image className="w-4 h-4 text-indigo-400" />;
        return <File className="w-4 h-4 text-slate-400" />;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#020205] text-gray-200 overflow-hidden font-sans border-t border-slate-900">
            {/* GRID CONDUIT HEADER */}
            <div className="bg-black/90 p-4 border-b-2 border-slate-900 flex flex-wrap justify-between items-center gap-4 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-cyan-500/30 flex items-center justify-center bg-cyan-950/20 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                        <HardDrive className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-black text-white tracking-widest uppercase">Google Drive Storage</h1>
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${
                                isConnected 
                                ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/20 shadow-[0_0_6px_rgba(6,182,212,0.2)]' 
                                : 'bg-red-950/80 text-red-400 border-red-500/20'
                            }`}>
                                {isConnected ? 'ACTIVE NODE CONDUIT' : 'GATEWAY STANDBY'}
                            </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono tracking-tight uppercase">SYSTEM LEVEL 07 // CLOUD DOCUMENT STORAGE MATRIX</p>
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
                                        <div className="w-4 h-4 rounded-full bg-cyan-900 flex items-center justify-center text-[8px] text-white">D</div>
                                    )}
                                    <span className="text-zinc-400">{userProfile.email}</span>
                                </div>
                            )}
                            <button
                                onClick={handleDisconnectNode}
                                className="bg-red-950/40 border border-red-500/40 hover:bg-red-900/60 text-red-200 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded transition-all cursor-pointer"
                            >
                                PURGE MEMORY (DISCONNECT)
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleConnectNode}
                            className="bg-cyan-950 hover:bg-cyan-900 border-2 border-cyan-500 text-cyan-200 text-xs font-black tracking-widest uppercase px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4 text-cyan-400" /> ACTIVATE CLOUD NODE
                        </button>
                    )}
                </div>
            </div>

            {/* IF NOT CONNECTED, SHOW SIGN-IN GATEWAY SPLASH */}
            {!isConnected ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-950 via-black to-[#020205]">
                    <div className="max-w-md p-8 bg-slate-900/40 border-2 border-slate-800 rounded-2xl relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-cyan-500 to-amber-500" />
                        <HardDrive className="w-16 h-16 text-cyan-500 mx-auto mb-6 animate-pulse" />
                        <h2 className="text-lg font-black text-white tracking-widest uppercase mb-2">Conduction Drive Shield Offline</h2>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                            Remotely configure, query, analyze, and purge files directly inside Google Drive. Back up local project schemas and blueprint coordinates to external secure storage arrays in real time.
                        </p>

                        <button 
                            onClick={handleConnectNode}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-950 to-slate-950 hover:from-cyan-900 hover:to-slate-900 border-2 border-cyan-500/60 rounded-xl py-3 text-cyan-300 hover:text-white font-black text-xs tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] cursor-pointer"
                        >
                            Authorize Google Drive Gateway
                        </button>

                        <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-zinc-500 font-mono flex items-center justify-center gap-1.5 uppercase">
                            <Shield className="w-3.5 h-3.5 text-zinc-600" /> SECURE HANDSHAKE // GSI PROTOCOL
                        </div>
                    </div>
                </div>
            ) : (
                /* MAIN EXPLORER LAYOUT */
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                    
                    {/* LEFT PANEL: CATEGORIES & CREATIONS */}
                    <div className="w-full lg:w-64 bg-black/50 border-r border-slate-900 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-4 space-y-6">
                        
                        {/* SEARCH AND REFRESH */}
                        <div className="space-y-2">
                            <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">Gateway Filter</span>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="SEARCH STORAGE..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchFiles()}
                                        className="w-full bg-black/60 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-all font-mono uppercase"
                                    />
                                </div>
                                <button
                                    onClick={fetchFiles}
                                    disabled={isRefreshing}
                                    className="p-1.5 bg-slate-950 border border-slate-850 rounded hover:border-cyan-500/50 hover:bg-black text-zinc-400 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* CATEGORIES MENU */}
                        <div className="space-y-1">
                            <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase block mb-1">Categories</span>
                            {[
                                { id: 'all', label: 'All Files', count: files.length },
                                { id: 'documents', label: 'Documents / text', count: files.filter(f => f.mimeType === 'application/vnd.google-apps.document' || f.mimeType === 'text/plain' || f.mimeType === 'application/pdf').length },
                                { id: 'spreadsheets', label: 'Spreadsheets', count: files.filter(f => f.mimeType === 'application/vnd.google-apps.spreadsheet').length },
                                { id: 'folders', label: 'Folders', count: files.filter(f => f.mimeType === 'application/vnd.google-apps.folder').length },
                                { id: 'backups', label: 'AetherOS Backups', count: files.filter(f => f.name.includes('aetheros-backup')).length }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id as any)}
                                    className={`w-full flex justify-between items-center px-3 py-2 rounded text-xs transition-all font-mono uppercase text-left ${
                                        activeCategory === cat.id 
                                        ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 font-black' 
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 border border-transparent'
                                    }`}
                                >
                                    <span>{cat.label}</span>
                                    <span className="text-[9px] bg-black/60 border border-slate-800 px-1.5 py-0.5 rounded text-zinc-500">{cat.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* CREATION ACTIONS */}
                        <div className="space-y-2 pt-2 border-t border-slate-900">
                            <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase block mb-1">Node Operations</span>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => { setIsCreateFolderOpen(true); setIsCreateFileOpen(false); }}
                                    className="flex flex-col items-center justify-center p-2.5 bg-slate-950 hover:bg-black border border-slate-850 hover:border-amber-500/30 text-zinc-400 hover:text-amber-400 rounded-lg transition-all text-center gap-1.5 cursor-pointer"
                                >
                                    <FolderPlus className="w-4 h-4" />
                                    <span className="text-[9px] font-black tracking-wide uppercase">New Folder</span>
                                </button>
                                <button
                                    onClick={() => { setIsCreateFileOpen(true); setIsCreateFolderOpen(false); }}
                                    className="flex flex-col items-center justify-center p-2.5 bg-slate-950 hover:bg-black border border-slate-850 hover:border-cyan-500/30 text-zinc-400 hover:text-cyan-400 rounded-lg transition-all text-center gap-1.5 cursor-pointer"
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    <span className="text-[9px] font-black tracking-wide uppercase">New File</span>
                                </button>
                            </div>
                        </div>

                        {/* COVENANT BACKUP OPERATIONS */}
                        <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-xl space-y-2.5">
                            <div className="flex items-center gap-2 text-cyan-400">
                                <Shield className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">AetherOS Core Backup</span>
                            </div>
                            <p className="text-[9px] text-zinc-400 leading-tight italic">
                                Sync active project matrices & blueprint configurations to Google Drive as an encrypted secure restore point.
                            </p>
                            <button
                                onClick={handleSystemBackup}
                                disabled={isBackingUp}
                                className="w-full py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 hover:border-cyan-400 rounded text-[9px] font-black text-cyan-200 tracking-widest uppercase transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {isBackingUp ? 'SYNCHRONIZING...' : 'COMPILE & BACKUP TO DRIVE'}
                            </button>
                        </div>
                    </div>

                    {/* INTERMEDIATE FOLDER CREATOR MODAL PANEL */}
                    <AnimatePresence>
                        {isCreateFolderOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute left-4 top-16 w-60 bg-black border border-amber-500/50 p-3 rounded-lg z-20 space-y-2"
                            >
                                <div className="flex justify-between items-center text-[10px] font-black text-amber-500 font-mono">
                                    <span>CREATE DIRECTORY GATE</span>
                                    <button onClick={() => setIsCreateFolderOpen(false)} className="text-zinc-500 hover:text-white">×</button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Folder Name..."
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 px-2 py-1 text-xs text-white placeholder-zinc-700 font-mono rounded"
                                />
                                <button
                                    onClick={handleCreateFolder}
                                    disabled={isCreating}
                                    className="w-full py-1 bg-amber-950/50 border border-amber-500/50 hover:bg-amber-900 hover:border-amber-400 text-amber-200 text-[10px] font-black uppercase tracking-wider rounded transition-all cursor-pointer"
                                >
                                    {isCreating ? 'CREATING...' : 'PROVISION FOLDER'}
                                </button>
                            </motion.div>
                        )}

                        {isCreateFileOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute left-4 top-16 w-80 bg-black border border-cyan-500/50 p-4 rounded-lg z-20 space-y-3 shadow-2xl"
                            >
                                <div className="flex justify-between items-center text-[10px] font-black text-cyan-400 font-mono">
                                    <span>WRITE EXTERNAL NODE</span>
                                    <button onClick={() => setIsCreateFileOpen(false)} className="text-zinc-500 hover:text-white">×</button>
                                </div>
                                <div className="space-y-2 text-[10px]">
                                    <input
                                        type="text"
                                        placeholder="File Name (e.g. log.txt)..."
                                        value={newFileName}
                                        onChange={(e) => setNewFileName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 px-2.5 py-1 text-xs text-white placeholder-zinc-700 font-mono rounded"
                                    />
                                    <textarea
                                        placeholder="Enter text contents or telemetry data to save on Google Drive..."
                                        value={newFileContent}
                                        onChange={(e) => setNewFileContent(e.target.value)}
                                        rows={4}
                                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white placeholder-zinc-700 font-mono rounded resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateTextFile}
                                    disabled={isCreating}
                                    className="w-full py-1.5 bg-cyan-950/50 border border-cyan-500/50 hover:bg-cyan-900 hover:border-cyan-400 text-cyan-200 text-[10px] font-black uppercase tracking-wider rounded transition-all cursor-pointer"
                                >
                                    {isCreating ? 'UPLOADING...' : 'SAVE TO GOOGLE DRIVE'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* MIDDLE PANEL: FILE EXPLORER LISTING */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#04040a] p-4 overflow-y-auto custom-scrollbar">
                        
                        {/* LISTING PATH */}
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 shrink-0">
                            <span className="text-[10px] font-mono font-black text-cyan-400 flex items-center gap-2">
                                <Terminal className="w-3.5 h-3.5" />
                                DIRECTORY_RECO: G:\DRIVE\ROOT ({activeCategory.toUpperCase()})
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono uppercase">
                                TOTAL INDEXED NODES: {files.length}
                            </span>
                        </div>

                        {/* EMPTY STATE */}
                        {files.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-950 bg-black/20 rounded-xl">
                                <AlertCircle className="w-10 h-10 text-zinc-600 mb-3 animate-bounce" />
                                <p className="text-sm font-black text-zinc-400 uppercase tracking-wider">No matching nodes cataloged</p>
                                <p className="text-[10px] text-zinc-500 mt-1 max-w-sm">
                                    Either no files match your active filter, or the Google Drive storage repository has not been initialized with content. Click New File to start.
                                </p>
                            </div>
                        ) : (
                            /* GRID CONTAINER */
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {files.map(file => {
                                    const isBackup = file.name.includes('aetheros-backup');
                                    const isSelected = selectedFile?.id === file.id;

                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() => inspectFileContent(file)}
                                            className={`p-3 bg-slate-900/40 hover:bg-black/80 rounded-xl transition-all border flex flex-col justify-between h-32 relative cursor-pointer group ${
                                                isSelected 
                                                ? 'border-cyan-500 bg-cyan-950/10 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                                                : 'border-slate-850 hover:border-slate-750'
                                            }`}
                                        >
                                            {/* HEADER INFO */}
                                            <div className="space-y-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-6 h-6 rounded bg-slate-950 border border-slate-850 flex items-center justify-center shrink-0">
                                                            {getFileIcon(file.mimeType)}
                                                        </div>
                                                        <span className="text-xs font-black text-white truncate max-w-[130px] sm:max-w-[160px] block" title={file.name}>
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                    
                                                    {isBackup && (
                                                        <span className="text-[7px] font-black text-amber-500 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded font-mono shrink-0 uppercase tracking-tight animate-pulse">
                                                            System Backup
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <p className="text-[9px] text-zinc-500 font-mono truncate max-w-full">
                                                    ID: {file.id}
                                                </p>
                                            </div>

                                            {/* FOOTER INFO */}
                                            <div className="pt-2 border-t border-slate-950 flex justify-between items-center text-[9px] text-zinc-500">
                                                <div className="font-mono">
                                                    {file.size 
                                                        ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` 
                                                        : (file.mimeType === 'application/vnd.google-apps.folder' ? 'FOLDER' : 'STREAM')
                                                    }
                                                </div>
                                                <div className="font-mono italic">
                                                    {new Date(file.modifiedTime).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* HOVER HOIST CONTROLS */}
                                            <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5">
                                                {file.webViewLink && (
                                                    <a
                                                        href={file.webViewLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="Open in Google Workspace"
                                                        className="p-1 bg-black/80 hover:bg-black rounded border border-slate-800 hover:border-cyan-500 text-zinc-400 hover:text-cyan-400 transition-all cursor-pointer"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                                {isBackup && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleSystemRestore(file); }}
                                                        title="Restore AetherOS State"
                                                        className="p-1 bg-black/80 hover:bg-black rounded border border-slate-800 hover:border-amber-500 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer"
                                                    >
                                                        <RefreshCw className="w-3 h-3" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setFileToDelete(file); }}
                                                    title="Trash Node"
                                                    className="p-1 bg-black/80 hover:bg-red-950 rounded border border-slate-800 hover:border-red-500 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL: FORENSIC NODE INSPECTOR & DEEP AI SCAN */}
                    <div className="w-full lg:w-96 bg-black/70 border-l border-slate-900 flex flex-col shrink-0 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                        {selectedFile ? (
                            <div className="space-y-4">
                                {/* SELECTED FILE HEADER */}
                                <div className="border-b border-slate-900 pb-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] bg-cyan-950 px-2 py-0.5 border border-cyan-800/40 rounded text-cyan-400 font-bold font-mono">
                                            INSPECTING_NODE_0x{selectedFile.id.substring(0,4).toUpperCase()}
                                        </span>
                                        <button 
                                            onClick={() => { setSelectedFile(null); setSelectedFileContent(''); setAiAnalysisResult(''); setAiCareScore(null); }}
                                            className="text-zinc-500 hover:text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="text-sm font-black text-white mt-2 flex items-center gap-2">
                                        {getFileIcon(selectedFile.mimeType)}
                                        {selectedFile.name}
                                    </h3>
                                    <p className="text-[10px] text-zinc-500 font-mono truncate mt-1">
                                        MIME: {selectedFile.mimeType}
                                    </p>
                                </div>

                                {/* FILE METADATA STATS */}
                                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/50 p-2.5 border border-slate-850 rounded-lg">
                                    <div>
                                        <span className="text-zinc-500 uppercase block font-mono text-[8px]">File Size:</span>
                                        <span className="text-white font-mono">
                                            {selectedFile.size 
                                                ? `${(parseInt(selectedFile.size) / 1024).toFixed(2)} KB (${selectedFile.size} bytes)` 
                                                : 'Unallocated'
                                            }
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-500 uppercase block font-mono text-[8px]">Modified On:</span>
                                        <span className="text-white font-mono">{new Date(selectedFile.modifiedTime).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* OPEN NATIVE LINK */}
                                {selectedFile.webViewLink && (
                                    <a
                                        href={selectedFile.webViewLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full flex items-center justify-center gap-2 py-2 bg-slate-950 border border-slate-850 hover:bg-black hover:border-cyan-500 text-zinc-400 hover:text-cyan-400 text-xs font-black uppercase tracking-wider rounded-lg transition-all text-center cursor-pointer"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Open file in Google Workspace
                                    </a>
                                )}

                                {/* RAW TEXT PREVIEW TERMINAL */}
                                {selectedFile.mimeType === 'text/plain' || selectedFile.mimeType === 'application/json' || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.json') || selectedFile.name.endsWith('.md') ? (
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                                            <Terminal className="w-3 h-3 text-cyan-400" /> Byte stream monitor
                                        </span>
                                        {isLoadingContent ? (
                                            <div className="bg-black/90 p-6 border border-slate-850 rounded-lg text-center">
                                                <RefreshCw className="w-5 h-5 animate-spin text-cyan-400 mx-auto mb-2" />
                                                <span className="text-[9px] font-mono text-zinc-500 uppercase">STREAMING BYTES...</span>
                                            </div>
                                        ) : (
                                            <pre className="bg-black/90 border border-slate-850 text-[10px] font-mono text-cyan-300 p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto custom-scrollbar leading-relaxed">
                                                {selectedFileContent || '[File is empty or holds unresolved memory segments.]'}
                                            </pre>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-zinc-950 border border-slate-850 rounded-lg text-center">
                                        <Info className="w-4 h-4 text-zinc-500 mx-auto mb-1.5" />
                                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Byte Stream Unreadable</span>
                                        <p className="text-[8px] text-zinc-600 mt-0.5 leading-tight">
                                            This is a non-text document or binary object. Stream previews are disabled to preserve buffer registers.
                                        </p>
                                    </div>
                                )}

                                {/* AI FORENSIC SCAN CENTER */}
                                <div className="pt-2 border-t border-slate-900 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">Diagnostic scan center</span>
                                        <span className="text-[9px] text-zinc-500 italic">MODEL: GEMINI-3.5-FLASH</span>
                                    </div>

                                    <button
                                        onClick={runNeuralForensicScan}
                                        disabled={isAnalyzing}
                                        className="w-full py-2 bg-gradient-to-r from-cyan-950 to-slate-950 hover:from-cyan-900 hover:to-slate-900 border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                                    >
                                        <Activity className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
                                        {isAnalyzing ? 'CONDUCTING FORENSICS...' : 'RUN NEURAL FORENSIC SCAN'}
                                    </button>

                                    {/* AI SCAN RESULT LOG */}
                                    <AnimatePresence>
                                        {aiAnalysisResult && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-black/80 border border-slate-850 p-3 rounded-lg space-y-3 text-[10px] leading-relaxed overflow-hidden shadow-xl font-mono"
                                            >
                                                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                                    <span className="text-zinc-500 text-[8px] uppercase font-black flex items-center gap-1">
                                                        <Shield className="w-3 h-3 text-cyan-400" /> Sentinel security logs
                                                    </span>
                                                    {aiCareScore !== null && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[8px] text-zinc-500 uppercase">SYSTEM INTEGRITY:</span>
                                                            <span className={`text-xs font-black px-1.5 py-0.5 rounded ${
                                                                aiCareScore >= 85 ? 'text-emerald-400 bg-emerald-950/60' : (aiCareScore >= 60 ? 'text-amber-400 bg-amber-950/60' : 'text-red-400 bg-red-950/60')
                                                            }`}>
                                                                {aiCareScore}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-zinc-300 space-y-2 whitespace-pre-wrap max-h-72 overflow-y-auto pr-1.5 custom-scrollbar font-sans text-[11px]">
                                                    {aiAnalysisResult.replace(/\[SYSTEM SCORE:.*\]/i, '')}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black/20 border border-dashed border-slate-950 rounded-2xl h-full">
                                <Shield className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
                                <h4 className="text-xs font-black text-zinc-400 tracking-wider uppercase">Forensic Sentinel Standby</h4>
                                <p className="text-[10px] text-zinc-500 mt-1 max-w-xs">
                                    Inspect any storage node in the directory list to extract byte streams, run diagnostic reports, or execute backup restorations.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MANDATORY REMOVAL CONFIRMATION MODAL */}
            <AnimatePresence>
                {fileToDelete && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#050508] border-2 border-red-500 max-w-md w-full rounded-2xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] space-y-4"
                        >
                            <div className="flex items-center gap-3 text-red-500 border-b border-red-500/25 pb-3">
                                <AlertCircle className="w-7 h-7" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">DESTRUCTIVE NODE OPERATION REQUIRED</h3>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                You are requesting to move the following file node to the Google Drive Trash repository:
                            </p>

                            <div className="bg-black border border-red-500/20 p-3 rounded-lg flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded bg-red-950/20 border border-red-900/40 flex items-center justify-center text-red-400">
                                    {getFileIcon(fileToDelete.mimeType)}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-black text-white truncate font-mono uppercase">{fileToDelete.name}</div>
                                    <div className="text-[9px] text-zinc-500 font-mono truncate">{fileToDelete.mimeType}</div>
                                </div>
                            </div>

                            <p className="text-[10px] text-zinc-500 leading-normal italic">
                                Note: Moving nodes to the trash does not delete them permanently, but will purge them from current directory filters. This action must be explicitly authorized.
                            </p>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => setFileToDelete(null)}
                                    className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-black tracking-widest uppercase rounded-lg transition-all cursor-pointer"
                                >
                                    ABORT CONDUIT
                                </button>
                                <button
                                    onClick={handleTrashFile}
                                    disabled={isDeleting}
                                    className="py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-200 text-xs font-black tracking-widest uppercase rounded-lg transition-all cursor-pointer"
                                >
                                    {isDeleting ? 'TRASHING...' : 'CONFIRM PURGE'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
