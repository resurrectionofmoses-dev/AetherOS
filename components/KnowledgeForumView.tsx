
import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageCircleIcon, PlusIcon, ThumbsUpIcon, ThumbsDownIcon, TagIcon, 
    UserIcon, SearchIcon, ChevronRightIcon, BrainIcon,
    CodeIcon, ShieldIcon, ActivityIcon, ZapIcon, GavelIcon,
    ClockIcon, BotIcon, ClipboardIcon, SparklesIcon, AlertTriangleIcon, SpinnerIcon,
    XIcon, CheckIcon, EditIcon, PinIcon, TrashIcon, LockIcon, UnlockIcon, HistoryIcon
} from './icons';
import { v4 as uuidv4 } from 'uuid';
import { safeStorage } from '../services/safeStorage';
import { extractJSON } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface Answer {
    id: string;
    author: string;
    content: string;
    timestamp: number;
    upvotes: number;
    flaggedCount?: number;
    editedAt?: number;
}

interface Question {
    id: string;
    author: string;
    title: string;
    content: string;
    category: string;
    timestamp: number;
    upvotes: number;
    answers: Answer[];
    acceptedAnswerId?: string;
    pinned?: boolean;
    locked?: boolean;
    flaggedCount?: number;
    tags?: string[];
    skillLevel?: 'Beginner' | 'Intermediate' | 'Expert';
    postType?: 'Question' | 'Tutorial' | 'Discussion';
}

interface AnsweringDialogProps {
    question: Question;
    onClose: () => void;
    onPostAnswer: (author: string, content: string) => void;
    defaultAuthorName: string;
}

const AnsweringDialog: React.FC<AnsweringDialogProps> = ({ question, onClose, onPostAnswer, defaultAuthorName }) => {
    const [answerText, setAnswerText] = useState('');
    const [authorMode, setAuthorMode] = useState<'profile' | 'anonymous'>('profile');
    const [anonName, setAnonName] = useState('Anonymous_User');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingStep, setGeneratingStep] = useState('');
    const [draftStatus, setDraftStatus] = useState<'none' | 'saved' | 'recovered'>('none');
    
    // Draft storage key
    const draftKey = `aether_forum_draft_${question.id}`;

    // Load saved draft on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            setAnswerText(savedDraft);
            setDraftStatus('recovered');
            // Reset recovered indicator after 3 seconds
            setTimeout(() => setDraftStatus('saved'), 3500);
        }
    }, [question.id]);

    // Save draft on edit
    useEffect(() => {
        if (answerText.trim()) {
            localStorage.setItem(draftKey, answerText);
            if (draftStatus !== 'recovered') {
                setDraftStatus('saved');
            }
        } else {
            localStorage.removeItem(draftKey);
            setDraftStatus('none');
        }
    }, [answerText, question.id]);

    const handleClearDraft = () => {
        setAnswerText('');
        localStorage.removeItem(draftKey);
        setDraftStatus('none');
    };

    const handleInsertTemplate = (type: 'outline' | 'code' | 'warning') => {
        let snippet = '';
        if (type === 'outline') {
            snippet = `### Core Resolution\nProvide a high-level summary of the solution here.\n\n### Step-by-Step Instructions\n1. First engineering step...\n2. Next validation step...\n\n### Verification\nHow to confirm this is resolved on-chain or locally.`;
        } else if (type === 'code') {
            snippet = `\`\`\`typescript\n// Implementation Blueprint\nfunction resolveComplexity<T>(input: T): boolean {\n    console.log("[AetherOS] Quantizing vector parameter", input);\n    return true;\n}\n\`\`\``;
        } else if (type === 'warning') {
            snippet = `> **[CRITICAL SYSTEM ADVISORY]**\n> Implementing this logic changes on-chain invariants. Double verify zero-knowledge limits and gas footprints before committing to production.`;
        }

        if (answerText.trim()) {
            setAnswerText(prev => prev + '\n\n' + snippet);
        } else {
            setAnswerText(snippet);
        }
    };

    const triggerOracleSolver = async () => {
        setIsGenerating(true);
        const steps = [
            "Synchronizing Cognitive Pipeline...",
            "Loading Neural Intent Matrices...",
            "Consulting the AetherOS Sovereign Index...",
            "Quantizing resolution vector...",
            "Streaming consensus response..."
        ];

        // Animate simulation logs beautifully
        let currentStepIdx = 0;
        const stepTimer = setInterval(() => {
            if (currentStepIdx < steps.length) {
                setGeneratingStep(steps[currentStepIdx]);
                currentStepIdx++;
            }
        }, 800);

        try {
            const prompt = `Category: ${question.category}\nTitle: ${question.title}\nQuestion Detail:\n${question.content}`;
            const sysInstruction = `You are a legendary tech-wizard AI solver for AetherOS on-chain compiler network. Provide a crisp, technically perfect programming solution. Use professional developer language. Include code snippets if appropriate. Keep the output neat, modular, and in elegant markdown. No self-promotions. Be direct, authoritative, and authoritative.`;

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    systemInstruction: sysInstruction
                })
            });

            clearInterval(stepTimer);

            if (!response.ok) {
                throw new Error("Oracle connection failed");
            }

            const data = await response.json();
            if (data.text) {
                if (answerText.trim()) {
                    setAnswerText(prev => prev + '\n\n' + data.text);
                } else {
                    setAnswerText(data.text);
                }
            }
        } catch (err: any) {
            console.error("AI Generation failure:", err);
            setGeneratingStep("CRITICAL TIMEOUT // Switching to fallback quantum logic model...");
            // Fallback content in case of offline keys or network errors
            setTimeout(() => {
                const fallback = `### Alternate Resolution Paradigm\nAn operational gap was detected in the active cognitive bridge. Primary recommendations suggest:\n1. Verify package dependencies inside \`package.json\`. Ensure the Node server environment matches expected configuration states.\n2. Ensure zero-knowledge state proofs align with target network genesis files.\n3. Recalibrate local parameters and run lint validations to flush stale cache sectors.`;
                setAnswerText(prev => prev ? prev + '\n\n' + fallback : fallback);
            }, 1000);
        } finally {
            clearInterval(stepTimer);
            setTimeout(() => {
                setIsGenerating(false);
                setGeneratingStep('');
            }, 1500);
        }
    };

    const handleSubmit = () => {
        if (answerText.trim().length < 10) return;
        const finalAuthorName = authorMode === 'profile' ? defaultAuthorName : anonName;
        onPostAnswer(finalAuthorName, answerText);
        localStorage.removeItem(draftKey);
    };

    const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
    const isPostDisabled = answerText.trim().length < 10 || isGenerating;

    return (
        <div id="answering-dialog-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.3 }}
                className="bg-[#030303] border-4 border-amber-600 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col font-mono text-zinc-300 shadow-[0_0_50px_rgba(217,119,6,0.25)]"
            >
                {/* Visual warning header bar */}
                <div className="h-6 bg-amber-600 flex items-center justify-between px-4 relative overflow-hidden shrink-0 select-none">
                    <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[size:16px_16px]" />
                    <span className="text-[9px] font-black text-black uppercase tracking-[0.3em] flex items-center gap-1.5 leading-none">
                        <ActivityIcon className="w-3 h-3 text-black animate-pulse" />
                        CRITICAL RECONSTRUCT SYSTEM // SECTOR ANSWERING COUPLER
                    </span>
                    <span className="text-[8px] font-black bg-black text-amber-500 px-1.5 py-0.5 rounded leading-none uppercase">
                        Valve Active
                    </span>
                </div>

                {/* Main Dialog Shell */}
                <div className="p-6 flex-1 overflow-y-auto space-y-5 custom-scrollbar bg-radial bg-gradient-to-b from-zinc-950/70 to-black">
                    
                    {/* Header Question brief */}
                    <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl space-y-2 relative project-brief">
                        <div className="absolute top-2 right-3 text-[8px] font-bold text-zinc-600 uppercase tracking-widest bg-black px-1.5 py-0.5 rounded border border-zinc-850">
                            CATEGORY: {question.category.toUpperCase()}
                        </div>
                        <h4 className="text-sm font-black text-white hover:text-amber-400 transition-colors uppercase leading-tight max-w-[80%]">
                            {question.title}
                        </h4>
                        <div className="text-[9px] text-zinc-550 text-zinc-550 text-zinc-500 font-bold uppercase tracking-wider">
                            Origin node: {question.author} • {new Date(question.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 p-2 bg-black/40 rounded border border-zinc-900 mt-2 select-text">
                            {question.content}
                        </div>
                    </div>

                    {/* Operator signature authorization option */}
                    <div className="space-y-2.5">
                        <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest block">Configure Signature Node</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button 
                                type="button"
                                onClick={() => setAuthorMode('profile')}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${authorMode === 'profile' ? 'bg-amber-950/20 border-amber-500 text-white' : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800'}`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${authorMode === 'profile' ? 'border-amber-500' : 'border-zinc-700'}`}>
                                        {authorMode === 'profile' && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider">OPERATOR PROFILE</p>
                                        <p className="text-[9px] font-mono opacity-80 mt-0.5">{defaultAuthorName}</p>
                                    </div>
                                </div>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setAuthorMode('anonymous')}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${authorMode === 'anonymous' ? 'bg-amber-950/20 border-amber-500 text-white' : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800'}`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${authorMode === 'anonymous' ? 'border-amber-500' : 'border-zinc-700'}`}>
                                        {authorMode === 'anonymous' && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider">ANONYMOUS COORD</p>
                                        <p className="text-[9px] font-mono opacity-80 mt-0.5">Custom Alias Override</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {authorMode === 'anonymous' && (
                            <div className="mt-2 text-xs">
                                <input 
                                    id="anon-name-input"
                                    type="text"
                                    value={anonName}
                                    onChange={e => setAnonName(e.target.value)}
                                    placeholder="Enter custom handle name..."
                                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 focus:border-amber-500 outline-none text-white font-mono uppercase text-xs"
                                    maxLength={30}
                                />
                            </div>
                        )}
                    </div>

                    {/* Crafting assistance tools */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest">AETHER CODER ASSIST TOOLS</label>
                            {draftStatus === 'recovered' && (
                                <span className="text-[8px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded animate-pulse border border-emerald-500/20 uppercase font-black tracking-wider">
                                    Draft Automatically Recovered
                                </span>
                            )}
                            {draftStatus === 'saved' && (
                                <span className="text-[8px] text-zinc-500 uppercase tracking-wider">
                                    Buffer State Saved
                                </span>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <button 
                                type="button"
                                onClick={() => handleInsertTemplate('outline')}
                                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-855 hover:border-zinc-750 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
                            >
                                <ClipboardIcon className="w-3.5 h-3.5 text-amber-500" />
                                Blueprint Outline
                            </button>
                            <button 
                                type="button"
                                onClick={() => handleInsertTemplate('code')}
                                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-855 hover:border-zinc-750 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
                            >
                                <CodeIcon className="w-3.5 h-3.5 text-blue-400" />
                                Code Block Spec
                            </button>
                            <button 
                                type="button"
                                onClick={() => handleInsertTemplate('warning')}
                                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-855 hover:border-zinc-750 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
                            >
                                <AlertTriangleIcon className="w-3.5 h-3.5 text-red-500" />
                                Advisory Warning
                            </button>

                            <button 
                                type="button"
                                onClick={triggerOracleSolver}
                                disabled={isGenerating}
                                className={`px-4 py-2 border rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-wider cursor-pointer ml-auto transition-all ${isGenerating ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-500/60' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950 hover:border-emerald-500'}`}
                            >
                                {isGenerating ? (
                                    <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                Invoke Oracle AI Solver
                            </button>
                        </div>
                    </div>

                    {/* AI Generation State Sub-Terminal */}
                    <AnimatePresence>
                        {isGenerating && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border border-emerald-500/20 bg-emerald-950/10 p-3 rounded-xl overflow-hidden"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                                    <p className="text-[10px] font-semibold text-emerald-400 tracking-widest uppercase">
                                        Oracle Pipeline: {generatingStep || "Establishing Socket Conjunction..."}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Core Construct Text area */}
                    <div className="space-y-1.5 relative">
                        <textarea 
                            id="answer-dialog-textarea"
                            value={answerText}
                            onChange={e => setAnswerText(e.target.value)}
                            disabled={isGenerating}
                            placeholder="Type or format your expert solution draft here..."
                            rows={8}
                            className="w-full bg-[#050505] border-2 border-zinc-900 rounded-2xl p-4 text-xs font-mono text-zinc-100 placeholder-zinc-700 outline-none focus:border-amber-500/50 transition-all resize-none scrollbar-thin"
                        />
                        
                        <div className="flex justify-between items-center text-[10px] text-zinc-650 text-zinc-500 select-none px-1">
                            <div className="flex items-center gap-3">
                                <span>Chars: <span className="text-zinc-400">{answerText.length}</span></span>
                                <span className="text-zinc-800">|</span>
                                <span>Words: <span className="text-zinc-400">{wordCount}</span></span>
                            </div>
                            
                            {answerText.trim() && (
                                <button 
                                    type="button" 
                                    onClick={handleClearDraft}
                                    className="text-[9px] hover:text-red-400 uppercase font-black tracking-wider transition-colors"
                                >
                                    Purge Workspace Draft
                                </button>
                            )}
                        </div>
                    </div>

                </div>

                {/* Confirm Action Grid Footer */}
                <div className="flex p-5 gap-3 border-t-4 border-black bg-zinc-950 shrink-0">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-5 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <XIcon className="w-3.5 h-3.5" />
                        Dismount Socket
                    </button>

                    <button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPostDisabled}
                        className={`flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isPostDisabled ? 'bg-zinc-900 border border-zinc-850 text-zinc-600 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-zinc-950 active:scale-98 shadow-md hover:scale-101 cursor-pointer'}`}
                    >
                        <CheckIcon className="w-4 h-4" />
                        Inject Answer Packet
                    </button>
                </div>
            </motion.div>
        </div>
    );
};


const iconMap: Record<string, React.FC<{ className?: string }>> = {
    'CodeIcon': CodeIcon,
    'ActivityIcon': ActivityIcon,
    'ShieldIcon': ShieldIcon,
    'ZapIcon': ZapIcon,
    'BrainIcon': BrainIcon,
    'GavelIcon': GavelIcon,
    'MessageCircleIcon': MessageCircleIcon,
    'BotIcon': BotIcon,
    'ClipboardIcon': ClipboardIcon,
    'ClockIcon': ClockIcon,
    'AlertTriangleIcon': AlertTriangleIcon
};

const DEFAULT_CATEGORIES = [
    { id: 'typescript', label: 'TypeScript', iconName: 'CodeIcon', color: 'text-blue-400' },
    { id: 'react', label: 'React', iconName: 'ActivityIcon', color: 'text-cyan-400' },
    { id: 'rust', label: 'Rust', iconName: 'ShieldIcon', color: 'text-orange-400' },
    { id: 'python', label: 'Python', iconName: 'CodeIcon', color: 'text-yellow-400' },
    { id: 'security', label: 'Security', iconName: 'ShieldIcon', color: 'text-red-400' },
    { id: 'logic', label: 'Logic', iconName: 'ZapIcon', color: 'text-purple-400' },
    { id: 'ai', label: 'AI & Gemini', iconName: 'BrainIcon', color: 'text-emerald-400' },
    { id: 'governance', label: 'Governance', iconName: 'GavelIcon', color: 'text-amber-400' },
];

export const KnowledgeForumView: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [categories, setCategories] = useState<{ id: string; label: string; iconName: string; color: string }[]>(DEFAULT_CATEGORIES);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState(DEFAULT_CATEGORIES[0].id);
    const [newTags, setNewTags] = useState('');
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
    const [answerInput, setAnswerInput] = useState('');

    const [isForumLoading, setIsForumLoading] = useState(true);
    const [addressingQuestionId, setAddressingQuestionId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<{ username: string } | null>(null);

    // Filters for Technology, Skill Levels, and Post Types
    const [selectedSkillLevel, setSelectedSkillLevel] = useState<'All' | 'Beginner' | 'Intermediate' | 'Expert'>('All');
    const [selectedPostType, setSelectedPostType] = useState<'All' | 'Question' | 'Tutorial' | 'Discussion'>('All');

    // New thread inputs for Skill Level and Post Type
    const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
    const [newPostType, setNewPostType] = useState<'Question' | 'Tutorial' | 'Discussion'>('Question');

    // Signature options for custom question posting
    const [newQuestionSignMode, setNewQuestionSignMode] = useState<'profile' | 'anonymous'>('profile');
    const [newQuestionAnonName, setNewQuestionAnonName] = useState('Anonymous_User');

    // Dynamic Topic / Category creation inputs
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCatLabel, setNewCatLabel] = useState('');
    const [newCatIconName, setNewCatIconName] = useState('CodeIcon');
    const [newCatColor, setNewCatColor] = useState('text-blue-400');

    // Moderation state
    const [isModModeActive, setIsModModeActive] = useState(false);
    const [modLogs, setModLogs] = useState<string[]>([]);

    // Edit states
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [editingAnswerId, setEditingAnswerId] = useState<{ qId: string; aId: string } | null>(null);
    const [editingText, setEditingText] = useState('');

    const logModAction = (actionStr: string) => {
        const timeStamp = new Date().toLocaleTimeString();
        setModLogs(prev => [`[${timeStamp}] ${actionStr}`, ...prev]);
    };

    // Auto load Zero-Trust session logs when Mod Mode active
    useEffect(() => {
        if (isModModeActive && modLogs.length === 0) {
            logModAction("Zero-Trust Security Deck activated. Integrity checks active.");
            logModAction("Initialized moderator node overrides in network sandbox.");
        }
    }, [isModModeActive]);

    // Load user profile for author signatures
    useEffect(() => {
        const fetchProfile = async () => {
            const saved = await safeStorage.getItem('aetheros_user_profile');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed && parsed.username) {
                        setUserProfile({ username: parsed.username });
                    }
                } catch (e) {
                    console.error("Failed to parse aetheros user profile:", e);
                }
            }
        };
        fetchProfile();
    }, []);

    // Persistence load
    useEffect(() => {
        const loadForum = async () => {
            setIsForumLoading(true);

            // Load Custom Categories
            const savedCategories = await safeStorage.getItem('AETHER_FORUM_CATEGORIES');
            if (savedCategories) {
                setCategories(extractJSON(savedCategories, DEFAULT_CATEGORIES));
            } else {
                setCategories(DEFAULT_CATEGORIES);
            }

            const saved = await safeStorage.getItem('AETHER_FORUM_DATA');
            if (saved) {
                setQuestions(extractJSON<Question[]>(saved, []));
            } else {
                // Seed data
                const seed: Question[] = [
                    {
                        id: 'chain-x-report',
                        author: 'CHAIN-X_VERIFIER',
                        title: 'Architectural Analysis: Infinite Payload Space P (|P| = ∞) in DLT',
                        content: `The concept of a payload space P with infinite size (|P| = ∞) is fundamentally incompatible with the architecture and operational requirements of a decentralized, distributed ledger technology (DLT) like a blockchain.

Step-by-step working:
1. Definition of Payload: In a blockchain context, a "payload" typically refers to the data contained within a transaction, such as inputs, outputs, contract calls, or message data. These transactions are aggregated into blocks.
2. Block Constraints: Every practical blockchain enforces strict limits on block size and/or gas usage.
3. Purpose of Constraints: These limits are critical for Node Synchronization, State Growth Management, Network Propagation, and Consensus Mechanism.

Blockchain Analogy:
This hypothetical "infinite payload space" is the antithesis of a blockchain's design. A blockchain is a state transition system where a finite, verifiable set of inputs leads to a new, finite, and verifiable state.

Logic Gaps:
The primary logic gap is the assumption that a distributed system can handle infinite data. Practical engineering dictates finite resources.

On-chain Verification:
This computation cannot be verified on-chain because the premise of an infinite payload space makes the blockchain itself inoperable.

Adversarial Edge Cases:
Denial of Service (DoS), Unbounded State Growth, Precision Loss/Overflow/Underflow.

In essence, a blockchain system designed with an infinite payload space would be non-functional from inception.`,
                        category: 'security',
                        timestamp: Date.now() - 86400000,
                        upvotes: 128,
                        answers: [
                            {
                                id: uuidv4(),
                                author: 'Maestro',
                                content: 'Verified. The constraints of the physical medium (bandwidth, storage, compute) are the bedrock of consensus. Infinite entropy equals zero consensus.',
                                timestamp: Date.now() - 43200000,
                                upvotes: 42
                            }
                        ],
                        acceptedAnswerId: undefined,
                        pinned: true,
                        locked: false,
                        flaggedCount: 0,
                        tags: ['dlt', 'payload', 'blockchain', 'consensus'],
                        skillLevel: 'Expert',
                        postType: 'Tutorial'
                    },
                    {
                        id: uuidv4(),
                        author: 'Sovereign_Admin',
                        title: 'How to optimize logic shard conjunction?',
                        content: 'I am seeing high latency in the stasis buffer when merging multiple logic shards. Any tips?',
                        category: 'logic',
                        timestamp: Date.now() - 3600000,
                        upvotes: 12,
                        answers: [
                            {
                                id: uuidv4(),
                                author: 'Logic_Maestro',
                                content: 'Try re-quantizing the intent vector before the conjunction. It reduces semantic drift by 40%.',
                                timestamp: Date.now() - 1800000,
                                upvotes: 5
                            }
                        ],
                        pinned: false,
                        locked: false,
                        flaggedCount: 0,
                        tags: ['shards', 'latency', 'conjunction'],
                        skillLevel: 'Intermediate',
                        postType: 'Question'
                    }
                ];
                setQuestions(seed);
            }
            setIsForumLoading(false);
        };
        loadForum();
    }, []);

    // Save Questions Data
    useEffect(() => {
        const saveData = async () => {
            if (!isForumLoading) {
                await safeStorage.setItem('AETHER_FORUM_DATA', JSON.stringify(questions));
            }
        };
        saveData();
    }, [questions, isForumLoading]);

    // Save Categories Data
    useEffect(() => {
        const saveCats = async () => {
            if (!isForumLoading && categories.length > 0) {
                await safeStorage.setItem('AETHER_FORUM_CATEGORIES', JSON.stringify(categories));
            }
        };
        saveCats();
    }, [categories, isForumLoading]);

    // Create New Thread (Question)
    const handlePostQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        const finalAuthor = newQuestionSignMode === 'profile' 
            ? (userProfile?.username || 'Aetheros_Prime') 
            : (newQuestionAnonName.trim() || 'Anonymous_User');

        const parsedTags = newTags
            .split(',')
            .map(t => t.trim().toLowerCase().replace(/#/g, ''))
            .filter(t => t.length > 0);

        const newQuestion: Question = {
            id: uuidv4(),
            author: finalAuthor,
            title: newTitle,
            content: newContent,
            category: newCategory,
            timestamp: Date.now(),
            upvotes: 0,
            answers: [],
            pinned: false,
            locked: false,
            flaggedCount: 0,
            tags: parsedTags,
            skillLevel: newSkillLevel,
            postType: newPostType
        };

        setQuestions([newQuestion, ...questions]);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
        setNewSkillLevel('Intermediate');
        setNewPostType('Question');
        setNewQuestionSignMode('profile');
        setNewQuestionAnonName('Anonymous_User');
        setIsPosting(false);
        logModAction(`New thread posted under /${newCategory}: '${newTitle.substring(0, 20)}...'`);
    };

    // Quick Answer Post Handler
    const handlePostAnswer = (questionId: string) => {
        if (!answerInput.trim()) return;

        // Check if thread locked
        const targetQ = questions.find(q => q.id === questionId);
        if (targetQ?.locked) {
            logModAction(`Blocked answers input for locked thread ${questionId.substring(0, 8)}`);
            return;
        }

        const newAnswer: Answer = {
            id: uuidv4(),
            author: userProfile?.username || 'Aetheros_Prime',
            content: answerInput,
            timestamp: Date.now(),
            upvotes: 0,
            flaggedCount: 0
        };

        setQuestions(prev => prev.map(q => 
            q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q
        ));
        setAnswerInput('');
        logModAction(`Answer posted on thread '${targetQ?.title.substring(0, 15)}...' by ${newAnswer.author}`);
    };

    // Core Interaction Handlers
    const upvoteQuestion = (id: string) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q));
    };

    const downvoteQuestion = (id: string) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, upvotes: q.upvotes - 1 } : q));
    };

    const upvoteAnswer = (qId: string, aId: string) => {
        setQuestions(prev => prev.map(q => 
            q.id === qId ? { 
                ...q, 
                answers: q.answers.map(a => a.id === aId ? { ...a, upvotes: a.upvotes + 1 } : a) 
            } : q
        ));
    };

    const downvoteAnswer = (qId: string, aId: string) => {
        setQuestions(prev => prev.map(q => 
            q.id === qId ? { 
                ...q, 
                answers: q.answers.map(a => a.id === aId ? { ...a, upvotes: a.upvotes - 1 } : a) 
            } : q
        ));
    };

    const flagQuestion = (qId: string) => {
        setQuestions(prev => prev.map(q => 
            q.id === qId ? { ...q, flaggedCount: (q.flaggedCount || 0) + 1 } : q
        ));
        logModAction(`⚠️ Report dispatched on Thread ID [${qId.substring(0, 8)}]`);
    };

    const flagAnswer = (qId: string, aId: string) => {
        setQuestions(prev => prev.map(q => 
            q.id === qId ? {
                ...q,
                answers: q.answers.map(a => a.id === aId ? { ...a, flaggedCount: (a.flaggedCount || 0) + 1 } : a)
            } : q
        ));
        logModAction(`⚠️ Report dispatched on Answer ID [${aId.substring(0, 8)}]`);
    };

    const acceptAnswer = (qId: string, aId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId) {
                const prevAccepted = q.acceptedAnswerId === aId;
                const nextAccepted = prevAccepted ? undefined : aId;
                logModAction(nextAccepted ? `⭐ Set accepted answer for '${q.title.substring(0, 20)}...'` : `⭐ Removed accepted answer reference`);
                return { ...q, acceptedAnswerId: nextAccepted };
            }
            return q;
        }));
    };

    // Admin Controls Handlers
    const togglePinQuestion = (qId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId) {
                const updated = !q.pinned;
                logModAction(`📌 ${updated ? 'PINNED' : 'UNPINNED'} thread '${q.title.substring(0, 20)}...'`);
                return { ...q, pinned: updated };
            }
            return q;
        }));
    };

    const toggleLockQuestion = (qId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId) {
                const updated = !q.locked;
                logModAction(`🔒 ${updated ? 'LOCKED' : 'UNLOCKED'} thread inputs for '${q.title.substring(0, 20)}...'`);
                return { ...q, locked: updated };
            }
            return q;
        }));
    };

    const purgeQuestion = (qId: string) => {
        const target = questions.find(q => q.id === qId);
        setQuestions(prev => prev.filter(q => q.id !== qId));
        logModAction(`🗑️ PURGED THREAD [${target?.title.substring(0, 25)}...]`);
        if (expandedQuestionId === qId) setExpandedQuestionId(null);
    };

    const purgeAnswer = (qId: string, aId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId) {
                logModAction(`🗑️ PURGED Answer coord [${aId.substring(0, 8)}] from thread '${q.title.substring(0, 15)}...'`);
                return {
                    ...q,
                    answers: q.answers.filter(a => a.id !== aId)
                };
            }
            return q;
        }));
    };

    const dismissQuestionFlags = (qId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId) {
                logModAction(`Dismissed reports on thread '${q.title.substring(0, 20)}...'`);
                return { ...q, flaggedCount: 0 };
            }
            return q;
        }));
    };

    const dismissAnswerFlags = (qId: string, aId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId) {
                logModAction(`Dismissed reports on Answer ${aId.substring(0, 8)}...`);
                return {
                    ...q,
                    answers: q.answers.map(a => a.id === aId ? { ...a, flaggedCount: 0 } : a)
                };
            }
            return q;
        }));
    };

    const initiateQuestionEdit = (q: Question) => {
        setEditingQuestionId(q.id);
        setEditingText(q.content);
        logModAction(`✏️ Modified socket open for thread content '${q.title.substring(0, 20)}...'`);
    };

    const saveQuestionEdit = (qId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId) {
                logModAction(`✏️ Saved correction content for thread '${q.title.substring(0, 20)}...'`);
                return { ...q, content: editingText };
            }
            return q;
        }));
        setEditingQuestionId(null);
        setEditingText('');
    };

    const initiateAnswerEdit = (qId: string, a: Answer) => {
        setEditingAnswerId({ qId, aId: a.id });
        setEditingText(a.content);
        logModAction(`✏️ Modified socket open for Answer ${a.id.substring(0, 8)}...`);
    };

    const saveAnswerEdit = () => {
        if (!editingAnswerId) return;
        const { qId, aId } = editingAnswerId;
        setQuestions(prev => prev.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    answers: q.answers.map(a => a.id === aId ? { ...a, content: editingText, editedAt: Date.now() } : a)
                };
            }
            return q;
        }));
        logModAction(`✏️ Saved correction content for Answer ${aId.substring(0, 8)}...`);
        setEditingAnswerId(null);
        setEditingText('');
    };

    const handleCreateCategory = () => {
        if (!newCatLabel.trim()) return;
        const normalizedId = newCatLabel.toLowerCase().trim().replace(/\s+/g, '-');
        
        if (categories.some(c => c.id === normalizedId)) {
            alert("Topic category already registered.");
            return;
        }

        const newCat = {
            id: normalizedId,
            label: newCatLabel.trim(),
            iconName: newCatIconName,
            color: newCatColor,
        };

        setCategories([...categories, newCat]);
        setNewCatLabel('');
        setIsCreatingCategory(false);
        logModAction(`🏷️ REGISTERED NEW DISCUSSION TOPIC: [${newCat.label.toUpperCase()}]`);
    };

    // Filter and Sort implementation
    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchesCategory = !selectedCategory || q.category === selectedCategory;
        const matchesSkillLevel = selectedSkillLevel === 'All' || q.skillLevel === selectedSkillLevel;
        const matchesPostType = selectedPostType === 'All' || q.postType === selectedPostType;
        return matchesSearch && matchesCategory && matchesSkillLevel && matchesPostType;
    });

    // Sort Questions: Pinned threads first, then newest first
    const sortedQuestions = [...filteredQuestions].sort((a, b) => {
        const aPinned = a.pinned ? 1 : 0;
        const bPinned = b.pinned ? 1 : 0;
        if (aPinned !== bPinned) {
            return bPinned - aPinned;
        }
        return b.timestamp - a.timestamp;
    });

    return (
        <div className="h-full flex flex-col bg-black text-zinc-100 font-mono overflow-hidden">
            {/* Forum Header */}
            <div className="p-6 border-b-4 border-black bg-zinc-900/50 flex justify-between items-center shadow-2xl z-20">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-600/10 border-4 border-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <MessageCircleIcon className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="font-black text-4xl text-white tracking-tighter italic uppercase leading-none">Knowledge Exchange</h2>
                        <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.4em] mt-1 italic">Siphoning wisdom from the collective network.</p>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    {/* Admin Shield Toggle Override */}
                    <button
                        onClick={() => setIsModModeActive(!isModModeActive)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 ${isModModeActive ? 'bg-red-950/40 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'}`}
                    >
                        <ShieldIcon className={`w-4 h-4 ${isModModeActive ? 'text-red-500' : 'text-zinc-500'}`} />
                        {isModModeActive ? 'Admin Shield: Engaged' : 'Admin Shield: Standby'}
                    </button>

                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search wisdom..."
                            className="bg-black border-2 border-zinc-805 rounded-xl pl-12 pr-4 py-2 text-xs focus:border-emerald-500 outline-none transition-all w-64 uppercase font-black"
                        />
                    </div>
                    <button 
                        onClick={() => setIsPosting(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        New Question
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Dynamic Topics/Categories list */}
                <div className="w-68 border-r-4 border-black bg-zinc-900/20 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Forum Topics</h3>
                        <div className="space-y-2">
                            <button 
                                onClick={() => setSelectedCategory(null)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-between group ${!selectedCategory ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-zinc-800 text-zinc-400'}`}
                            >
                                <span>All Topics</span>
                                <ChevronRightIcon className={`w-4 h-4 transition-transform ${!selectedCategory ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                            </button>
                            {categories.map(cat => {
                                const DynamicIconComponent = iconMap[cat.iconName] || CodeIcon;
                                return (
                                    <button 
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-between group ${selectedCategory === cat.id ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-zinc-800 text-zinc-400'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <DynamicIconComponent className={`w-4 h-4 ${selectedCategory === cat.id ? 'text-white' : cat.color}`} />
                                            <span>{cat.label}</span>
                                        </div>
                                        <ChevronRightIcon className={`w-4 h-4 transition-transform ${selectedCategory === cat.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Skill Level Filter */}
                        <div className="space-y-2 pt-4 border-t border-zinc-900">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Skill Levels</h3>
                            <div className="grid grid-cols-2 gap-1.5">
                                {['All', 'Beginner', 'Intermediate', 'Expert'].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setSelectedSkillLevel(level as any)}
                                        className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase text-center transition-all border ${
                                            selectedSkillLevel === level
                                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                                                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Post Type Filter */}
                        <div className="space-y-2 pt-4 border-t border-zinc-900">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Post Type</h3>
                            <div className="space-y-1">
                                {['All', 'Question', 'Tutorial', 'Discussion'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setSelectedPostType(type as any)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-between border ${
                                            selectedPostType === type
                                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                                                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                                        }`}
                                    >
                                        <span>{type === 'Tutorial' ? 'Tutorial / Guide' : type}</span>
                                        {selectedPostType === type && <CheckIcon className="w-3 h-3 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Inline Custom Topic Builder Creator */}
                    <div className="pt-4 border-t border-zinc-900 mt-6 shrink-0">
                        {!isCreatingCategory ? (
                            <button
                                onClick={() => setIsCreatingCategory(true)}
                                className="w-full py-2.5 px-4 rounded-xl text-[10px] font-black uppercase text-emerald-500 border border-emerald-500/25 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Create Custom Topic
                            </button>
                        ) : (
                            <div className="space-y-3 p-4 bg-zinc-900/60 border border-zinc-805 rounded-2xl animate-in fade-in duration-300">
                                <h4 className="text-[9px] font-black text-white uppercase tracking-wider">New Topic Registry</h4>
                                
                                <input 
                                    type="text"
                                    value={newCatLabel}
                                    onChange={e => setNewCatLabel(e.target.value)}
                                    placeholder="Topic Label..."
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white uppercase font-black"
                                />

                                <div className="space-y-1">
                                    <label className="text-[8px] text-zinc-500 font-black uppercase">Accent Color</label>
                                    <select 
                                        value={newCatColor}
                                        onChange={e => setNewCatColor(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-[9px] text-zinc-400 uppercase font-black"
                                    >
                                        <option value="text-blue-400">BLUE</option>
                                        <option value="text-cyan-400">CYAN</option>
                                        <option value="text-orange-400">ORANGE</option>
                                        <option value="text-yellow-400">YELLOW</option>
                                        <option value="text-red-400">RED</option>
                                        <option value="text-purple-400">PURPLE</option>
                                        <option value="text-emerald-400">EMERALD</option>
                                        <option value="text-amber-400">AMBER</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[8px] text-zinc-500 font-black uppercase">Select Icon</label>
                                    <select 
                                        value={newCatIconName}
                                        onChange={e => setNewCatIconName(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-[9px] text-zinc-400 uppercase font-black"
                                    >
                                        <option value="CodeIcon">CODE GLYPH</option>
                                        <option value="ShieldIcon">SECURE BARRIER</option>
                                        <option value="ZapIcon">QUANTUM IMPULSE</option>
                                        <option value="BrainIcon">AI COGNITIVE</option>
                                        <option value="GavelIcon">GOVERNANCE RULE</option>
                                        <option value="ActivityIcon">LIVELINESS FREQ</option>
                                        <option value="MessageCircleIcon">COMMS VALVE</option>
                                    </select>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateCategory}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black py-1.5 rounded-lg text-[9px] font-black uppercase"
                                    >
                                        Register
                                    </button>
                                    <button
                                        onClick={() => setIsCreatingCategory(false)}
                                        className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 py-1.5 rounded-lg text-[9px] font-black uppercase"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content: Questions List */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-black/40 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(16,185,129,0.03)_0%,_transparent_70%)] pointer-events-none" />
                    
                    <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                        {isPosting && (
                            <form onSubmit={handlePostQuestion} className="bg-zinc-900 border-4 border-emerald-600/40 p-8 rounded-3xl shadow-2xl animate-in slide-in-from-top duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Post New Question</h3>
                                    <button type="button" onClick={() => setIsPosting(false)} className="text-zinc-500 hover:text-white transition-colors">
                                        <PlusIcon className="w-6 h-6 rotate-45" />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Title</label>
                                        <input 
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                            placeholder="What is your question?"
                                            className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 text-white font-black focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Category</label>
                                            <select 
                                                value={newCategory}
                                                onChange={e => setNewCategory(e.target.value)}
                                                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 text-white font-black text-xs focus:border-emerald-500 outline-none transition-all appearance-none"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.label.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Operator Signature</label>
                                            <select 
                                                value={newQuestionSignMode}
                                                onChange={e => setNewQuestionSignMode(e.target.value as 'profile' | 'anonymous')}
                                                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 text-white font-black text-xs focus:border-emerald-500 outline-none transition-all appearance-none"
                                            >
                                                <option value="profile">VERIFIED KEY ({userProfile?.username || 'Aetheros_Prime'})</option>
                                                <option value="anonymous">GHOST ALIAS SHARD</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Target Skill Level</label>
                                            <select 
                                                value={newSkillLevel}
                                                onChange={e => setNewSkillLevel(e.target.value as any)}
                                                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 text-white font-black text-xs focus:border-emerald-500 outline-none transition-all appearance-none"
                                            >
                                                <option value="Beginner">BEGINNER</option>
                                                <option value="Intermediate">INTERMEDIATE</option>
                                                <option value="Expert">EXPERT</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Post Type</label>
                                            <select 
                                                value={newPostType}
                                                onChange={e => setNewPostType(e.target.value as any)}
                                                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 text-white font-black text-xs focus:border-emerald-500 outline-none transition-all appearance-none"
                                            >
                                                <option value="Question">QUESTION</option>
                                                <option value="Tutorial">TUTORIAL / GUIDE</option>
                                                <option value="Discussion">GENERAL DISCUSSION</option>
                                            </select>
                                        </div>
                                    </div>

                                    {newQuestionSignMode === 'anonymous' && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ghost Alias Handle</label>
                                            <input 
                                                value={newQuestionAnonName}
                                                onChange={e => setNewQuestionAnonName(e.target.value)}
                                                placeholder="e.g. LambdaGhost_X"
                                                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 text-xs font-mono text-cyan-400 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Tags / Topics (Comma-separated)</label>
                                        <input 
                                            value={newTags}
                                            onChange={e => setNewTags(e.target.value)}
                                            placeholder="e.g. typescript, compiler, dlt, latency, standard"
                                            className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Details</label>
                                        <textarea 
                                            value={newContent}
                                            onChange={e => setNewContent(e.target.value)}
                                            rows={5}
                                            placeholder="Provide more context..."
                                            className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 resize-none focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest text-sm active:scale-95 animate-pulse"
                                    >
                                        Publish Question
                                    </button>
                                </div>
                            </form>
                        )}

                        {sortedQuestions.length === 0 ? (
                            <div className="py-20 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-40">
                                <SearchIcon className="w-20 h-20 mx-auto mb-6 text-zinc-800" />
                                <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-600">No wisdom found matching your query.</p>
                            </div>
                        ) : sortedQuestions.map(question => (
                            <div key={question.id} className={`bg-zinc-900/80 border-4 p-8 rounded-3xl shadow-[10px_10px_0_0_#000] hover:border-emerald-600/30 transition-all group ${question.pinned ? 'border-amber-500/50 shadow-[10px_10px_0_0_rgba(245,158,11,0.25)]' : 'border-black'}`}>
                                <div className="flex gap-6">
                                    {/* Vote Column */}
                                    <div className="flex flex-col items-center gap-2">
                                        <button 
                                            onClick={() => upvoteQuestion(question.id)}
                                            className="p-3 bg-zinc-800 hover:bg-emerald-600/20 text-zinc-500 hover:text-emerald-500 rounded-xl border-2 border-transparent hover:border-emerald-600/50 transition-all"
                                            title="Upvote Question/Topic"
                                        >
                                            <ThumbsUpIcon className="w-5 h-5 animate-hover" />
                                        </button>
                                        <span className="text-xl font-black text-white">{question.upvotes}</span>
                                        <button 
                                            onClick={() => downvoteQuestion(question.id)}
                                            className="p-3 bg-zinc-800 hover:bg-red-600/20 text-zinc-500 hover:text-red-500 rounded-xl border-2 border-transparent hover:border-red-600/50 transition-all"
                                            title="Downvote Question/Topic"
                                        >
                                            <ThumbsDownIcon className="w-5 h-5 animate-hover" />
                                        </button>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {question.pinned && (
                                                <span className="text-[8px] font-black bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-500 flex items-center gap-1 uppercase tracking-widest animate-pulse">
                                                    <PinIcon className="w-2.5 h-2.5 text-amber-400" />
                                                    PINNED ANNOUNCEMENT
                                                </span>
                                            )}
                                            {question.locked && (
                                                <span className="text-[8px] font-black bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-500 flex items-center gap-1 uppercase tracking-widest">
                                                    <LockIcon className="w-2.5 h-2.5 text-red-400" />
                                                    THREAD CONSOLIDATED
                                                </span>
                                            )}
                                            {(question.flaggedCount || 0) > 0 && (
                                                <span className="text-[8px] font-black bg-red-800 text-white px-2 py-0.5 rounded border border-red-400 flex items-center gap-1 uppercase tracking-widest animate-bounce">
                                                    <AlertTriangleIcon className="w-2.5 h-2.5" />
                                                    REPORTS RECEIVED [{(question.flaggedCount ?? 0)}]
                                                </span>
                                            )}
                                            <span className="text-[8px] font-black bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 uppercase tracking-widest">
                                                {question.category}
                                            </span>
                                            {question.postType && (
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                                                    question.postType === 'Tutorial' 
                                                        ? 'bg-amber-950 text-amber-400 border-amber-500/50' 
                                                        : question.postType === 'Discussion'
                                                        ? 'bg-purple-950 text-purple-400 border-purple-500/50'
                                                        : 'bg-emerald-950 text-emerald-400 border-emerald-500/50'
                                                }`}>
                                                    {question.postType === 'Tutorial' ? 'Tutorial / Guide' : question.postType}
                                                </span>
                                            )}
                                            {question.skillLevel && (
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                                                    question.skillLevel === 'Expert' 
                                                        ? 'bg-rose-950 text-rose-400 border-rose-500/50' 
                                                        : question.skillLevel === 'Intermediate'
                                                        ? 'bg-blue-950 text-blue-400 border-blue-500/50'
                                                        : 'bg-teal-950 text-teal-400 border-teal-500/50'
                                                }`}>
                                                    {question.skillLevel}
                                                </span>
                                            )}
                                            <span className="text-[8px] font-black text-zinc-650 uppercase tracking-widest">
                                                Posted by {question.author} • {new Date(question.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <h4 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                                            {question.title}
                                        </h4>

                                        {question.tags && question.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1.5 pb-1">
                                                {question.tags.map(tag => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSearchQuery(tag);
                                                        }}
                                                        className="text-[9px] font-bold bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded border border-zinc-700/60 hover:bg-emerald-500/15 hover:border-emerald-500/50 hover:text-emerald-400 transition-all font-mono lowercase cursor-pointer flex items-center gap-0.5 shadow-sm"
                                                    >
                                                        #{tag}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {editingQuestionId === question.id ? (
                                            <div className="space-y-3 p-4 bg-zinc-950 rounded-2xl border-2 border-cyan-500/40 animate-in fade-in duration-200">
                                                <textarea
                                                    value={editingText}
                                                    onChange={e => setEditingText(e.target.value)}
                                                    rows={5}
                                                    className="w-full bg-black text-cyan-400 font-mono text-xs border border-zinc-800 rounded-xl p-3 focus:border-cyan-500 outline-none"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => saveQuestionEdit(question.id)}
                                                        className="bg-cyan-600 text-black px-4 py-1.5 rounded-lg text-[9px] font-black uppercase"
                                                    >
                                                        Publish Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingQuestionId(null)}
                                                        className="bg-zinc-850 text-zinc-400 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap">
                                                {question.content}
                                            </p>
                                        )}

                                        {/* Mod Action Panel for Question card */}
                                        {isModModeActive && (
                                            <div className="flex items-center gap-2 p-3 bg-red-950/15 border-2 border-red-900/30 rounded-2xl animate-in slide-in-from-top-2 duration-300 flex-wrap">
                                                <span className="text-[9px] font-black text-red-500 uppercase tracking-wider mr-2 flex items-center gap-1 shrink-0">
                                                    <ShieldIcon className="w-3.5 h-3.5 text-red-500" /> Admin Controls:
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => togglePinQuestion(question.id)}
                                                    className={`px-2.5 py-1 text-[8px] font-black uppercase rounded border transition-all flex items-center gap-1 ${question.pinned ? 'bg-amber-600 border-amber-500 text-zinc-950' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                                                >
                                                    <PinIcon className="w-3 h-3" />
                                                    {question.pinned ? 'UNPIN' : 'PIN'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleLockQuestion(question.id)}
                                                    className={`px-2.5 py-1 text-[8px] font-black uppercase rounded border transition-all flex items-center gap-1 ${question.locked ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                                                >
                                                    <LockIcon className="w-3 h-3" />
                                                    {question.locked ? 'UNLOCK THREAD' : 'LOCK THREAD'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (editingQuestionId === question.id) {
                                                            saveQuestionEdit(question.id);
                                                        } else {
                                                            initiateQuestionEdit(question);
                                                        }
                                                    }}
                                                    className="px-2.5 py-1 text-[8px] font-black uppercase rounded border bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white transition-all flex items-center gap-1"
                                                >
                                                    <EditIcon className="w-3 h-3 text-cyan-400" />
                                                    {editingQuestionId === question.id ? 'SAVE EDIT' : 'EDIT CONTENT'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => purgeQuestion(question.id)}
                                                    className="px-2.5 py-1 text-[8px] font-black uppercase rounded border border-red-600/30 hover:border-red-500 text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1"
                                                >
                                                    <TrashIcon className="w-3 h-3" />
                                                    PURGE THREAD
                                                </button>
                                                {(question.flaggedCount || 0) > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => dismissQuestionFlags(question.id)}
                                                        className="px-2.5 py-1 text-[8px] font-black uppercase rounded border border-emerald-600/30 hover:border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center gap-1"
                                                    >
                                                        <CheckIcon className="w-3 h-3" />
                                                        DISMISS REPORTS
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => setExpandedQuestionId(expandedQuestionId === question.id ? null : question.id)}
                                                    className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                                                >
                                                    <MessageCircleIcon className="w-4 h-4" />
                                                    {question.answers.length} Answers
                                                </button>

                                                {/* Standard User Flag Button */}
                                                <button 
                                                    type="button"
                                                    onClick={() => flagQuestion(question.id)}
                                                    className="text-[10px] font-black text-zinc-500 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1.5 px-3 py-1 bg-zinc-950/20 hover:bg-red-950/30 border border-zinc-500/10 hover:border-red-500/35 rounded-lg cursor-pointer"
                                                    title="Report thread to moderators"
                                                >
                                                    <AlertTriangleIcon className="w-3" />
                                                    Flag Thread
                                                </button>

                                                {!question.locked && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setAddressingQuestionId(question.id)}
                                                        className="text-[10px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-colors flex items-center gap-1.5 px-3 py-1 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/25 hover:border-amber-500/50 rounded-lg cursor-pointer"
                                                    >
                                                        <EditIcon className="w-3 h-3 text-amber-500" />
                                                        Answering Valve
                                                    </button>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => setExpandedQuestionId(expandedQuestionId === question.id ? null : question.id)}
                                                className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                                            >
                                                {expandedQuestionId === question.id ? 'Hide Discussion' : 'View Discussion'}
                                            </button>
                                        </div>

                                        {/* Discussion / Comments flow */}
                                        {expandedQuestionId === question.id && (
                                            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                                <div className="space-y-4">
                                                    {question.answers.map(answer => (
                                                        <div key={answer.id} className={`bg-black/40 border-2 p-6 rounded-2xl flex gap-4 transition-all ${question.acceptedAnswerId === answer.id ? 'border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-zinc-800'} ${answer.flaggedCount && answer.flaggedCount > 0 ? 'border-red-505/40 bg-red-950/5' : ''}`}>
                                                            <div className="flex flex-col items-center gap-1 shrink-0">
                                                                <button 
                                                                    onClick={() => upvoteAnswer(question.id, answer.id)}
                                                                    className="p-2 hover:text-emerald-500 text-zinc-500 transition-colors"
                                                                    title="Upvote Answer"
                                                                >
                                                                    <ThumbsUpIcon className="w-4 h-4" />
                                                                </button>
                                                                <span className="text-xs font-black text-zinc-500">{answer.upvotes}</span>
                                                                <button 
                                                                    onClick={() => downvoteAnswer(question.id, answer.id)}
                                                                    className="p-2 hover:text-red-500 text-zinc-500 transition-colors"
                                                                    title="Downvote Answer"
                                                                >
                                                                    <ThumbsDownIcon className="w-4 h-4" />
                                                                </button>
                                                                
                                                                {question.acceptedAnswerId === answer.id && (
                                                                    <div className="mt-2 text-emerald-500" title="Accepted Answer">
                                                                        <ShieldIcon className="w-4 h-4" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 space-y-2 min-w-0">
                                                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                                                    <div className="flex items-center gap-2 text-[8px] font-black text-zinc-500 uppercase">
                                                                        <UserIcon className="w-3 h-3 text-zinc-650" />
                                                                        {answer.author} • {new Date(answer.timestamp).toLocaleTimeString()}
                                                                        {answer.editedAt && (
                                                                            <span className="text-cyan-500 lowercase italic"> (edited)</span>
                                                                        )}
                                                                        {(answer.flaggedCount || 0) > 0 && (
                                                                            <span className="text-red-500 font-bold ml-2">⚠️ Reported [{answer.flaggedCount}]</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {/* Report flag for Answer */}
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => flagAnswer(question.id, answer.id)}
                                                                            className="text-[8px] font-black text-zinc-650 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                                                                        >
                                                                            <AlertTriangleIcon className="w-2.5 h-2.5 text-zinc-650" />
                                                                            Flag Answer
                                                                        </button>

                                                                        {(!question.acceptedAnswerId || question.acceptedAnswerId === answer.id) && (
                                                                            <button 
                                                                                onClick={() => acceptAnswer(question.id, answer.id)}
                                                                                className={`text-[8px] font-black uppercase tracking-widest transition-colors ${question.acceptedAnswerId === answer.id ? 'text-red-400 hover:text-zinc-400' : 'text-zinc-500 hover:text-emerald-500'}`}
                                                                            >
                                                                                {question.acceptedAnswerId === answer.id ? 'Remove Accepted Status' : 'Mark as Accepted'}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {editingAnswerId && editingAnswerId.aId === answer.id ? (
                                                                    <div className="space-y-2 p-2 bg-zinc-950 rounded-xl border border-cyan-500/30 animate-in fade-in duration-200">
                                                                        <textarea
                                                                            value={editingText}
                                                                            onChange={e => setEditingText(e.target.value)}
                                                                            className="w-full bg-black text-cyan-400 font-mono text-xs p-2 border border-zinc-800 rounded-lg focus:border-cyan-500 outline-none"
                                                                            rows={3}
                                                                        />
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={saveAnswerEdit}
                                                                                className="bg-cyan-600 text-black px-3 py-1 rounded text-[8px] font-black uppercase"
                                                                            >
                                                                                Apply
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEditingAnswerId(null)}
                                                                                className="bg-zinc-850 text-zinc-400 px-3 py-1 rounded text-[8px] font-black uppercase"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-zinc-305 font-mono leading-relaxed whitespace-pre-wrap">
                                                                        {answer.content}
                                                                    </p>
                                                                )}

                                                                {/* Moderator Answer Tools */}
                                                                {isModModeActive && (
                                                                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-900 mt-2 animate-in slide-in-from-top-1">
                                                                        <span className="text-[7.5px] font-black text-red-500/60 uppercase">Mod Override:</span>
                                                                        <button
                                                                            onClick={() => initiateAnswerEdit(question.id, answer)}
                                                                            className="px-2 py-0.5 text-[7px] font-black uppercase rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                                                                        >
                                                                            Edit Content
                                                                        </button>
                                                                        <button
                                                                            onClick={() => purgeAnswer(question.id, answer.id)}
                                                                            className="px-2 py-0.5 text-[7px] font-black uppercase rounded border border-red-900/30 text-red-400 hover:bg-red-500/10"
                                                                        >
                                                                            Delete Answer
                                                                        </button>
                                                                        {(answer.flaggedCount || 0) > 0 && (
                                                                            <button
                                                                                onClick={() => dismissAnswerFlags(question.id, answer.id)}
                                                                                className="px-2 py-0.5 text-[7px] font-black uppercase rounded border border-emerald-900/35 text-emerald-400 hover:bg-emerald-500/10"
                                                                            >
                                                                                Dismiss Reports
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="pt-6 border-t-2 border-zinc-800">
                                                    {question.locked ? (
                                                        <div className="p-4 bg-red-955/20 border-2 border-red-900/30 text-red-400 rounded-xl text-center text-xs uppercase font-black tracking-widest flex items-center justify-center gap-2">
                                                            <LockIcon className="w-4 h-4 text-red-500" />
                                                            Discussion trace consolidated & locked. Inputs deactivated.
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-4">
                                                            <textarea 
                                                                value={answerInput}
                                                                onChange={e => setAnswerInput(e.target.value)}
                                                                placeholder="Provide your wisdom..."
                                                                className="flex-1 bg-black border-2 border-zinc-800 rounded-xl p-4 text-xs font-mono text-white focus:border-emerald-500 outline-none transition-all resize-none"
                                                                rows={2}
                                                            />
                                                            <button 
                                                                onClick={() => handlePostAnswer(question.id)}
                                                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95"
                                                            >
                                                                Post Answer
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Moderation Sandbox Shell Logging Console */}
            {isModModeActive && (
                <div className="px-8 py-4 border-t-4 border-red-950 bg-zinc-950 font-mono text-[10px] text-zinc-500 relative flex flex-col gap-2 max-h-36 overflow-y-auto shrink-0 select-none">
                    <div className="flex items-center justify-between border-b border-red-950/40 pb-2">
                        <span className="text-red-500 font-bold uppercase tracking-[0.25em] flex items-center gap-2">
                            <HistoryIcon className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                            Security System Sandbox Operations Log Trace
                        </span>
                        <div className="flex gap-2">
                            <span className="text-[8px] text-zinc-700 uppercase">Audit Record Stack: {modLogs.length} entries</span>
                        </div>
                    </div>
                    <div className="space-y-1.5 custom-scrollbar">
                        {modLogs.map((log, index) => (
                            <div key={index} className="flex gap-2 leading-none">
                                <span className="text-red-650/70 select-none">{"$"}</span>
                                <span className={`${log.includes('⚠️') || log.includes('🗑️') ? 'text-red-400' : 'text-zinc-400'}`}>{log}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Status Bar footer */}
            <div className="px-8 py-3 bg-black border-t-4 border-zinc-900 flex items-center justify-between text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em] shrink-0">
                <div className="flex items-center gap-8">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Collective Wisdom: SYNCED
                    </span>
                    <span>Total Questions: {questions.length}</span>
                    <span>Active Contributors: 42</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>AetherOS // Knowledge_Exchange</span>
                    <span className="text-zinc-800">0x7F_0x00_0x01</span>
                </div>
            </div>

            {/* Answering Questions Dialog Modal popup */}
            <AnimatePresence>
                {addressingQuestionId && (() => {
                    const activeQuestion = questions.find(q => q.id === addressingQuestionId);
                    if (!activeQuestion) return null;
                    return (
                        <AnsweringDialog 
                            key={activeQuestion.id}
                            question={activeQuestion}
                            onClose={() => setAddressingQuestionId(null)}
                            onPostAnswer={(author, content) => {
                                const newAnswer: Answer = {
                                    id: uuidv4(),
                                    author: author || 'Anonymous_User',
                                    content,
                                    timestamp: Date.now(),
                                    upvotes: 0,
                                    flaggedCount: 0
                                };
                                setQuestions(prev => prev.map(q => 
                                    q.id === activeQuestion.id ? { ...q, answers: [...q.answers, newAnswer] } : q
                                ));
                                setAddressingQuestionId(null);
                            }}
                            defaultAuthorName={userProfile?.username || 'Aetheros_Prime'}
                        />
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};
