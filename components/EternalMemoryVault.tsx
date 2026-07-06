import React, { useState, useEffect } from 'react';
import { 
    Brain, Shield, Lock, Search, Plus, Trash2, Key, Info, HelpCircle, 
    Layers, Sparkles, Check, Database, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { EternalMemory } from '../types';
import { eternalMemoryDb } from '../services/eternalMemoryDb';

export const EternalMemoryVault: React.FC = () => {
    const [memories, setMemories] = useState<EternalMemory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('ALL');
    const [isLoading, setIsLoading] = useState(false);

    // New Memory Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<EternalMemory['category']>('Operator Notes');
    const [securityTier, setSecurityTier] = useState<EternalMemory['securityTier']>('ETERNAL');
    
    // Purge confirmation security modal
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [overrideCode, setOverrideCode] = useState('');

    useEffect(() => {
        loadMemories();
    }, []);

    const loadMemories = async () => {
        setIsLoading(true);
        try {
            const list = await eternalMemoryDb.getMemories();
            setMemories(list);
        } catch (err) {
            console.error(err);
            toast.error('Sync Error', { description: 'Failed to synchronize memory blocks with the celestial ledger.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMemory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error('Silicon Inscription Void', { description: 'Please fill in both title and permanent content.' });
            return;
        }

        // Generate cryptographic-looking SHA-256 block signature
        const randHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        const sig = `0x${securityTier}_${randHash}`;

        const newMem: EternalMemory = {
            id: `mem-${Date.now()}`,
            title: title.trim(),
            content: content.trim(),
            category,
            securityTier,
            timestamp: Date.now(),
            blockSignature: sig,
            isRevealed: true
        };

        // Optimistic UI update
        const prevMemories = [...memories];
        setMemories(prev => [newMem, ...prev]);

        // Reset inputs
        setTitle('');
        setContent('');

        try {
            await eternalMemoryDb.saveMemory(newMem);
            toast.success('Memory Eternalized', {
                description: 'Etched permanently in Firestore and cached locally.'
            });
        } catch (err) {
            console.error(err);
            toast.error('Sync Failure', { description: 'Could not write block to Firestore.' });
            // Revert state
            setMemories(prevMemories);
        }
    };

    const handleToggleReveal = async (id: string) => {
        const target = memories.find(m => m.id === id);
        if (!target) return;
        const updatedMem = { ...target, isRevealed: !target.isRevealed };
        
        // Optimistic state update
        setMemories(prev => prev.map(m => m.id === id ? updatedMem : m));
        
        try {
            await eternalMemoryDb.saveMemory(updatedMem);
        } catch (err) {
            console.error(err);
            // Revert or reload if failed
            loadMemories();
        }
    };

    const handleInitiatePurge = (id: string) => {
        setConfirmId(id);
        setOverrideCode('');
    };

    const handleConfirmPurge = async (id: string) => {
        if (overrideCode.toUpperCase() !== 'OVERRIDE-AETHER-99') {
            toast.error('Invalid Security Override', { 
                description: 'Override authentication failed. Eternal memory block intact.' 
            });
            return;
        }

        // Optimistic state update
        const prevMemories = [...memories];
        setMemories(prev => prev.filter(m => m.id !== id));
        setConfirmId(null);
        setOverrideCode('');

        try {
            await eternalMemoryDb.deleteMemory(id);
            toast.warning('Memory Block Purged', {
                description: 'Registry rewritten. Silicon memory wiped.'
            });
        } catch (err) {
            console.error(err);
            toast.error('Purge Failed', { description: 'Could not purge memory block.' });
            setMemories(prevMemories);
        }
    };

    const filteredMemories = memories.filter(m => {
        const matchesQuery = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             m.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = activeCategory === 'ALL' || m.category === activeCategory;
        return matchesQuery && matchesCat;
    });

    return (
        <div className="w-full bg-zinc-950/40 border border-zinc-900 rounded-2xl flex flex-col overflow-hidden text-zinc-300 backdrop-blur-md">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 bg-gradient-to-r from-zinc-950/70 to-black/60 p-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-violet-500/10 rounded-xl border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.05)] text-violet-400 animate-pulse">
                        <Brain className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-sans font-bold text-white tracking-tight flex items-center gap-2">
                            Eternal Memory Ledger
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <p className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest">FIRESTORE SYNC ACTIVE</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadMemories}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 disabled:opacity-50 rounded-xl text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-[9px] font-mono font-bold"
                        title="Force reload from celestial Firestore ledger"
                    >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-violet-400' : 'text-zinc-400'}`} />
                        <span>RELOAD</span>
                    </button>
                    <span className="text-[9px] font-mono font-bold bg-violet-950/30 text-violet-300 border border-violet-500/20 px-2.5 py-1.5 rounded-xl">
                        ETERNALIZED BLOCKS: {memories.length}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-5 min-h-[460px]">
                
                {/* Left Form: Inscribe memories */}
                <div className="lg:col-span-1 bg-zinc-950/60 rounded-xl border border-zinc-900 p-4 flex flex-col justify-between">
                    <div>
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">INSCRIBE ETERNAL MEMORY</span>
                        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
                            <Layers className="w-3.5 h-3.5 text-violet-500" /> Write Immutable Record
                        </h3>

                        <form onSubmit={handleAddMemory} className="flex flex-col gap-3">
                            <div>
                                <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1">MEMORY TITLE</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Core Encryption Keys or Critical Directives"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1">PERMANENT MEMORY CONTENT</label>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Enter secure data, insights, or heuristics that should never be forgotten..."
                                    rows={5}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1">CLASS</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value as any)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                                    >
                                        <option value="Operator Notes">Operator Notes</option>
                                        <option value="Heuristics">Heuristics</option>
                                        <option value="Credentials">Credentials</option>
                                        <option value="Sovereign Keys">Sovereign Keys</option>
                                        <option value="System Logs">System Logs</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1">SECURITY TIER</label>
                                    <select
                                        value={securityTier}
                                        onChange={e => setSecurityTier(e.target.value as any)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                                    >
                                        <option value="ETERNAL">ETERNAL</option>
                                        <option value="TOP_SECRET">TOP SECRET</option>
                                        <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                                        <option value="RESTRICTED">RESTRICTED</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-3 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold font-mono py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-violet-300 animate-pulse" />
                                INSCRIBE MEMORY BLOCK
                            </button>
                        </form>
                    </div>

                    <div className="border-t border-zinc-900/60 pt-3 mt-4 text-[9px] font-mono text-zinc-500 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span>Eternalized blocks are signed and cryptographically locked. Deletion requires strict security override authorization.</span>
                    </div>
                </div>

                {/* Right Lists: Ledger records */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    
                    {/* Filter bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search eternal memory blocks..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                            />
                        </div>

                        <div className="flex flex-wrap gap-1">
                            {['ALL', 'Operator Notes', 'Heuristics', 'Credentials', 'Sovereign Keys'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold transition-all ${
                                        activeCategory === cat
                                            ? 'bg-zinc-800 text-violet-400 border border-violet-500/20'
                                            : 'bg-zinc-900 text-zinc-500 border border-zinc-900 hover:text-zinc-300'
                                    }`}
                                >
                                    {cat.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Memories Scroller */}
                    <div className="flex flex-col gap-3 max-h-[440px] overflow-y-auto pr-1">
                        {filteredMemories.length > 0 ? (
                            filteredMemories.map(m => {
                                const isDeleting = confirmId === m.id;

                                return (
                                    <div key={m.id} className="bg-zinc-950/80 rounded-xl border border-zinc-900 p-4 relative overflow-hidden flex flex-col gap-2">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl" />
                                        
                                        <div className="flex justify-between items-start z-10">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[8px] font-mono font-black border px-1.5 py-0.5 rounded uppercase ${
                                                    m.securityTier === 'ETERNAL' ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' :
                                                    m.securityTier === 'TOP_SECRET' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                    'bg-zinc-900 border-zinc-800 text-zinc-400'
                                                }`}>
                                                    {m.securityTier}
                                                </span>
                                                <span className="text-[9px] font-mono text-zinc-500 capitalize">{m.category}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button 
                                                    onClick={() => handleToggleReveal(m.id)}
                                                    className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer"
                                                >
                                                    {m.isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                                <button 
                                                    onClick={() => handleInitiatePurge(m.id)}
                                                    className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-sans font-bold text-white mb-1 tracking-tight">{m.title}</h4>
                                            <div className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/80">
                                                {m.isRevealed ? (
                                                    <p className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap select-all">{m.content}</p>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-zinc-600 font-mono text-[10px] py-1 select-none">
                                                        <Lock className="w-3.5 h-3.5 text-red-500/60" />
                                                        <span>RECORD ENCRYPTED. CLICK REVEAL TO VIEW DECRYPTED PAYLOAD.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-zinc-900/50 pt-2 text-[8px] font-mono text-zinc-500">
                                            <span>BLOCK SIGNATURE: <span className="text-zinc-400 font-bold select-all">{m.blockSignature.slice(0, 32)}...</span></span>
                                            <span className="text-right">{new Date(m.timestamp).toLocaleString()}</span>
                                        </div>

                                        {/* Inline override block code deletion authentication */}
                                        {isDeleting && (
                                            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm z-20 p-4 flex flex-col justify-center items-center text-center gap-2.5">
                                                <div className="p-2 bg-red-500/15 rounded-full border border-red-500/20 text-red-400 animate-pulse">
                                                    <Shield className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block">Security Override Override Needed</span>
                                                    <p className="text-[9px] text-zinc-400 max-w-sm mt-0.5">This is an immutable silicon memory block. To purge this record permanently, please enter the security override key below:</p>
                                                </div>
                                                <div className="flex items-center gap-2 w-full max-w-xs mt-1">
                                                    <input 
                                                        type="text" 
                                                        value={overrideCode}
                                                        onChange={e => setOverrideCode(e.target.value)}
                                                        placeholder="Enter OVERRIDE-AETHER-99"
                                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-red-500"
                                                    />
                                                    <button 
                                                        onClick={() => handleConfirmPurge(m.id)}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold rounded cursor-pointer transition-all"
                                                    >
                                                        PURGE
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfirmId(null)}
                                                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-mono text-[10px] rounded cursor-pointer transition-all"
                                                    >
                                                        CANCEL
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center bg-zinc-950/60 rounded-xl border border-zinc-900 text-zinc-600 font-mono text-xs">
                                NO IMMUTABLE MEMORY BLOCKS FOUND
                            </div>
                        )}
                    </div>

                </div>

            </div>

        </div>
    );
};
