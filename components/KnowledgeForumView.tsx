
import React, { useState, useEffect } from 'react';
import { 
    MessageCircleIcon, PlusIcon, ThumbsUpIcon, TagIcon, 
    UserIcon, SearchIcon, ChevronRightIcon, BrainIcon,
    CodeIcon, ShieldIcon, ActivityIcon, ZapIcon, GavelIcon
} from './icons';
import { v4 as uuidv4 } from 'uuid';
import { safeStorage } from '../services/safeStorage';
import { extractJSON } from '../utils';

interface Answer {
    id: string;
    author: string;
    content: string;
    timestamp: number;
    upvotes: number;
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
}

const CATEGORIES = [
    { id: 'typescript', label: 'TypeScript', icon: CodeIcon, color: 'text-blue-400' },
    { id: 'react', label: 'React', icon: ActivityIcon, color: 'text-cyan-400' },
    { id: 'rust', label: 'Rust', icon: ShieldIcon, color: 'text-orange-400' },
    { id: 'python', label: 'Python', icon: CodeIcon, color: 'text-yellow-400' },
    { id: 'security', label: 'Security', icon: ShieldIcon, color: 'text-red-400' },
    { id: 'logic', label: 'Logic', icon: ZapIcon, color: 'text-purple-400' },
    { id: 'ai', label: 'AI & Gemini', icon: BrainIcon, color: 'text-emerald-400' },
    { id: 'governance', label: 'Governance', icon: GavelIcon, color: 'text-amber-400' },
];

export const KnowledgeForumView: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState(CATEGORIES[0].id);
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
    const [answerInput, setAnswerInput] = useState('');

    const [isForumLoading, setIsForumLoading] = useState(true);

    // Persistence
    useEffect(() => {
        const loadForum = async () => {
            setIsForumLoading(true);
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
                        acceptedAnswerId: undefined
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
                        ]
                    }
                ];
                setQuestions(seed);
            }
            setIsForumLoading(false);
        };
        loadForum();
    }, []);



    useEffect(() => {
        const saveData = async () => {
            if (questions.length > 0 && !isForumLoading) {
                await safeStorage.setItem('AETHER_FORUM_DATA', JSON.stringify(questions));
            }
        };
        saveData();
    }, [questions, isForumLoading]);


    const handlePostQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        const newQuestion: Question = {
            id: uuidv4(),
            author: 'Anonymous_User',
            title: newTitle,
            content: newContent,
            category: newCategory,
            timestamp: Date.now(),
            upvotes: 0,
            answers: []
        };

        setQuestions([newQuestion, ...questions]);
        setNewTitle('');
        setNewContent('');
        setIsPosting(false);
    };

    const handlePostAnswer = (questionId: string) => {
        if (!answerInput.trim()) return;

        const newAnswer: Answer = {
            id: uuidv4(),
            author: 'Anonymous_User',
            content: answerInput,
            timestamp: Date.now(),
            upvotes: 0
        };

        setQuestions(prev => prev.map(q => 
            q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q
        ));
        setAnswerInput('');
    };

    const upvoteQuestion = (id: string) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q));
    };

    const upvoteAnswer = (qId: string, aId: string) => {
        setQuestions(prev => prev.map(q => 
            q.id === qId ? { 
                ...q, 
                answers: q.answers.map(a => a.id === aId ? { ...a, upvotes: a.upvotes + 1 } : a) 
            } : q
        ));
    };

    const acceptAnswer = (qId: string, aId: string) => {
        setQuestions(prev => prev.map(q => 
            q.id === qId ? { ...q, acceptedAnswerId: aId } : q
        ));
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             q.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || q.category === selectedCategory;
        return matchesSearch && matchesCategory;
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

                <div className="flex gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search wisdom..."
                            className="bg-black border-2 border-zinc-800 rounded-xl pl-12 pr-4 py-2 text-xs focus:border-emerald-500 outline-none transition-all w-64 uppercase font-black"
                        />
                    </div>
                    <button 
                        onClick={() => setIsPosting(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        New Question
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Categories */}
                <div className="w-64 border-r-4 border-black bg-zinc-900/20 p-6 overflow-y-auto custom-scrollbar">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Categories</h3>
                    <div className="space-y-2">
                        <button 
                            onClick={() => setSelectedCategory(null)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-between group ${!selectedCategory ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-zinc-800 text-zinc-400'}`}
                        >
                            <span>All Topics</span>
                            <ChevronRightIcon className={`w-4 h-4 transition-transform ${!selectedCategory ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                        </button>
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-between group ${selectedCategory === cat.id ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-zinc-800 text-zinc-400'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <cat.icon className={`w-4 h-4 ${selectedCategory === cat.id ? 'text-white' : cat.color}`} />
                                    <span>{cat.label}</span>
                                </div>
                                <ChevronRightIcon className={`w-4 h-4 transition-transform ${selectedCategory === cat.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                            </button>
                        ))}
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
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.label.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
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
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest text-sm active:scale-95"
                                    >
                                        Publish Question
                                    </button>
                                </div>
                            </form>
                        )}

                        {filteredQuestions.length === 0 ? (
                            <div className="py-20 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] opacity-40">
                                <SearchIcon className="w-20 h-20 mx-auto mb-6 text-zinc-800" />
                                <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-600">No wisdom found matching your query.</p>
                            </div>
                        ) : filteredQuestions.map(question => (
                            <div key={question.id} className="bg-zinc-900/80 border-4 border-black p-8 rounded-3xl shadow-[10px_10px_0_0_#000] hover:border-emerald-600/30 transition-all group">
                                <div className="flex gap-6">
                                    {/* Vote Column */}
                                    <div className="flex flex-col items-center gap-2">
                                        <button 
                                            onClick={() => upvoteQuestion(question.id)}
                                            className="p-3 bg-zinc-800 hover:bg-emerald-600/20 text-zinc-500 hover:text-emerald-500 rounded-xl border-2 border-transparent hover:border-emerald-600/50 transition-all"
                                        >
                                            <ThumbsUpIcon className="w-5 h-5" />
                                        </button>
                                        <span className="text-xl font-black text-white">{question.upvotes}</span>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[8px] font-black bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 uppercase tracking-widest">
                                                {question.category}
                                            </span>
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                                                Posted by {question.author} • {new Date(question.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <h4 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                                            {question.title}
                                        </h4>
                                        
                                        <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                                            {question.content}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => setExpandedQuestionId(expandedQuestionId === question.id ? null : question.id)}
                                                    className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                                                >
                                                    <MessageCircleIcon className="w-4 h-4" />
                                                    {question.answers.length} Answers
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => setExpandedQuestionId(expandedQuestionId === question.id ? null : question.id)}
                                                className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                                            >
                                                {expandedQuestionId === question.id ? 'Hide Discussion' : 'View Discussion'}
                                            </button>
                                        </div>

                                        {/* Answers Section */}
                                        {expandedQuestionId === question.id && (
                                            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                                <div className="space-y-4">
                                                    {question.answers.map(answer => (
                                                        <div key={answer.id} className={`bg-black/40 border-2 p-6 rounded-2xl flex gap-4 transition-all ${question.acceptedAnswerId === answer.id ? 'border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-zinc-800'}`}>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <button 
                                                                    onClick={() => upvoteAnswer(question.id, answer.id)}
                                                                    className="p-2 hover:text-emerald-500 transition-colors"
                                                                >
                                                                    <ThumbsUpIcon className="w-4 h-4" />
                                                                </button>
                                                                <span className="text-xs font-black text-zinc-500">{answer.upvotes}</span>
                                                                
                                                                {question.acceptedAnswerId === answer.id && (
                                                                    <div className="mt-2 text-emerald-500" title="Accepted Answer">
                                                                        <ShieldIcon className="w-4 h-4" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2 text-[8px] font-black text-zinc-600 uppercase">
                                                                        <UserIcon className="w-3 h-3" />
                                                                        {answer.author} • {new Date(answer.timestamp).toLocaleTimeString()}
                                                                    </div>
                                                                    {!question.acceptedAnswerId && (
                                                                        <button 
                                                                            onClick={() => acceptAnswer(question.id, answer.id)}
                                                                            className="text-[8px] font-black text-zinc-500 hover:text-emerald-500 uppercase tracking-widest transition-colors"
                                                                        >
                                                                            Mark as Accepted
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                                                                    {answer.content}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="pt-6 border-t-2 border-zinc-800">
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

            {/* Status Bar */}
            <div className="px-8 py-3 bg-black border-t-4 border-zinc-900 flex items-center justify-between text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em]">
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
        </div>
    );
};
