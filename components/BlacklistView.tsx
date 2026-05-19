
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GavelIcon, ShieldIcon, XIcon, PlusIcon, UserIcon, SearchIcon, WarningIcon, ZapIcon, FlagIcon, TrashIcon } from './icons';
import { v4 as uuidv4 } from 'uuid';
import { safeStorage } from '../services/safeStorage';
import { UserProfile } from '../types';

interface BlacklistEntry {
    id: string;
    identity: string;
    violation: string;
    timestamp: number;
    isPardoned: boolean; // Cheating Death
}

interface BlacklistViewProps {
    profile: UserProfile;
}

export const BlacklistView: React.FC<BlacklistViewProps> = ({ profile }) => {
    const [entries, setEntries] = useState<BlacklistEntry[]>([]);
    const [isInitializing, setIsInitializing] = useState(true);
    const [newIdentity, setNewIdentity] = useState('');
    const [newViolation, setNewViolation] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadBlacklist = async () => {
            const saved = await safeStorage.getItem('AETHER_BLACKLIST');
            if (saved) {
                try {
                    setEntries(JSON.parse(saved));
                } catch (e) {
                    console.error("[AetherOS] Blacklist parse error", e);
                }
            } else {
                // Initial entries
                setEntries([
                    { id: uuidv4(), identity: 'ARCHON_01', violation: 'Lattice logic manipulation', timestamp: Date.now() - 10000000, isPardoned: false },
                    { id: uuidv4(), identity: 'VOID_WALKER', violation: 'Cheating death', timestamp: Date.now() - 5000000, isPardoned: true },
                    { id: uuidv4(), identity: 'GHOST_IN_SHELL', violation: 'Unauthorized kernel access', timestamp: Date.now() - 2000000, isPardoned: false },
                ]);
            }
            setIsInitializing(false);
        };
        loadBlacklist();
    }, []);

    useEffect(() => {
        const persist = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('AETHER_BLACKLIST', JSON.stringify(entries));
            }
        };
        persist();
    }, [entries, isInitializing]);

    const handleAdd = () => {
        if (!newIdentity.trim()) return;
        
        // Check for "cheating death" in violation string
        const isCheatingDeath = newViolation.toLowerCase().includes('cheating death') || newViolation.toLowerCase().includes('cheat death');
        
        const newEntry: BlacklistEntry = {
            id: uuidv4(),
            identity: newIdentity,
            violation: newViolation || 'Unspecified breach',
            timestamp: Date.now(),
            isPardoned: isCheatingDeath
        };

        setEntries(prev => [newEntry, ...prev]);
        setNewIdentity('');
        setNewViolation('');
    };

    const handleDelete = (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    };

    const togglePardon = (id: string) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, isPardoned: !e.isPardoned } : e));
    };

    const filteredEntries = entries.filter(e => 
        e.identity.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.violation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-black text-gray-300 font-mono p-8 overflow-y-auto custom-scrollbar">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <FlagIcon className="w-8 h-8 text-red-500 animate-pulse" />
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Sovereign Blacklist</h1>
                </div>
                <p className="text-xs text-red-900 font-black tracking-widest uppercase mb-4">
                    Protocol 0x03E2: Identity Nullification Gate
                </p>
                <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-lg">
                    <p className="text-[10px] text-red-400 italic leading-relaxed">
                        Notice: Cheating the system results in immediate blacklist status. 
                        Exception: Cheating Death is a recognized sovereign right and will be marked as PARDONED.
                    </p>
                </div>
            </header>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Entry Form */}
                <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <PlusIcon className="w-4 h-4 text-emerald-500" /> New Nullification
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] text-gray-600 uppercase font-black mb-1">Identity Signature</label>
                            <input 
                                value={newIdentity}
                                onChange={e => setNewIdentity(e.target.value)}
                                disabled={['guest', 'user'].includes(profile.role)}
                                placeholder="e.g. ENTITY_0x..."
                                className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors disabled:opacity-30"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-600 uppercase font-black mb-1">Violation Detail</label>
                            <input 
                                value={newViolation}
                                onChange={e => setNewViolation(e.target.value)}
                                disabled={['guest', 'user'].includes(profile.role)}
                                placeholder="e.g. System manipulation..."
                                className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-30"
                            />
                        </div>
                        <button 
                            onClick={handleAdd}
                            disabled={['guest', 'user'].includes(profile.role)}
                            className="w-full bg-red-600 hover:bg-red-500 text-black font-black uppercase text-[10px] tracking-widest py-3 rounded transition-all mt-4 disabled:bg-gray-800 disabled:text-gray-600"
                        >
                            {['moderator', 'operator', 'admin'].includes(profile.role) ? 'Commit to Blacklist' : 'Lattice Write Locked'}
                        </button>
                        {['guest', 'user'].includes(profile.role) && (
                            <p className="text-[8px] text-red-900 font-black uppercase text-center mt-2 animate-pulse">
                                Access Level: {profile.role.toUpperCase()} // WRITE_OPS_FORBIDDEN
                            </p>
                        )}
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/20 border border-gray-800 p-6 rounded-xl flex flex-col justify-center items-center">
                        <span className="text-4xl font-black text-red-500">{entries.filter(e => !e.isPardoned).length}</span>
                        <span className="text-[10px] text-gray-600 uppercase font-black mt-2">Active Bans</span>
                    </div>
                    <div className="bg-gray-900/20 border border-gray-800 p-6 rounded-xl flex flex-col justify-center items-center">
                        <span className="text-4xl font-black text-emerald-500">{entries.filter(e => e.isPardoned).length}</span>
                        <span className="text-[10px] text-gray-600 uppercase font-black mt-2">Death Cheaters</span>
                    </div>
                </div>
            </section>

            <section className="flex-1 min-h-0 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <ShieldIcon className="w-4 h-4 text-blue-500" /> Identity Record
                    </h3>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                        <input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="SEARCH IDENTITIES..."
                            className="bg-black border border-gray-800 rounded-full pl-8 pr-4 py-1.5 text-[10px] focus:outline-none focus:border-blue-500 w-64"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filteredEntries.map(entry => (
                            <motion.div 
                                key={entry.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`p-4 border rounded-xl relative group transition-all ${entry.isPardoned ? 'bg-emerald-950/10 border-emerald-900/30' : 'bg-red-950/10 border-red-900/30'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${entry.isPardoned ? 'bg-emerald-900' : 'bg-red-900'}`}>
                                            <UserIcon className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-xs font-black uppercase text-white truncate max-w-[120px]">{entry.identity}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {['moderator', 'operator', 'admin'].includes(profile.role) && (
                                            <>
                                                <button 
                                                    onClick={() => togglePardon(entry.id)}
                                                    title={entry.isPardoned ? "Revoke Pardon" : "Grant Death Pardon"}
                                                    className={`p-1.5 rounded bg-black/40 border transition-all ${entry.isPardoned ? 'border-red-900 text-red-500 hover:bg-red-900/40' : 'border-emerald-900 text-emerald-500 hover:bg-emerald-900/40'}`}
                                                >
                                                    <ZapIcon className="w-3 h-3" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="p-1.5 rounded bg-black/40 border border-gray-800 text-gray-500 hover:border-red-500 hover:text-red-500 transition-all"
                                                >
                                                    <TrashIcon className="w-3 h-3" />
                                                </button>
                                            </>
                                        )}
                                        {['guest', 'user'].includes(profile.role) && (
                                            <div className="px-2 py-1 bg-black/40 border border-gray-800 rounded text-[8px] text-gray-600 uppercase font-black">
                                                LOCKED
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Violation</p>
                                        <p className="text-[11px] text-gray-400 italic line-clamp-2">{entry.violation}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] text-gray-700">{new Date(entry.timestamp).toLocaleDateString()}</span>
                                        {entry.isPardoned && (
                                            <span className="text-[8px] flex items-center gap-1 font-black text-emerald-500 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded uppercase tracking-tighter">
                                                <ZapIcon className="w-2 h-2 fill-current" /> Death Pardon
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                
                {filteredEntries.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-900 rounded-3xl">
                        <WarningIcon className="w-12 h-12 text-gray-800 mb-4" />
                        <p className="text-xs font-black text-gray-700 uppercase tracking-[0.3em]">No Nullified Records Found</p>
                    </div>
                )}
            </section>
        </div>
    );
};
