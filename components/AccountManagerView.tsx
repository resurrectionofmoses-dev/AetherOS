import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldIcon, SearchIcon, UserIcon, GlobeIcon, LockIcon, WarningIcon, TerminalIcon } from './icons';
import { HexMetric } from './HexMetric';

export const AccountManagerView: React.FC = () => {
    const { user, userRegistry } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    
    const isAuthorized = ['moderator', 'operator', 'admin'].includes(user?.role || '');

    const filteredAccounts = useMemo(() => {
        return userRegistry.filter(u => 
            u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.sovereignty && u.sovereignty.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [userRegistry, searchQuery]);

    if (!isAuthorized) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-black p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-red-900/20 border-2 border-red-500/50 flex items-center justify-center mb-6 animate-pulse">
                    <LockIcon className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Access Denied: The Sovereign Shield active</h1>
                <p className="text-red-500 font-mono text-sm max-w-md">
                    Agents will only hear the commands of sovereignty. Your current identity signature lacks the necessary clearance level to access the Lattice Account Registry.
                </p>
                <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    Security_Protocol: AGENT_SILENCE_v4.2 // ERR_CLEARENCE_LOW
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#050505] p-6 overflow-hidden">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <UserIcon className="w-8 h-8 text-blue-500" />
                        Account Registry
                    </h1>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1 pl-1">
                        Sovereign Network Observer // Total Identities: {userRegistry.length}
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="FILTER IDENTITY..."
                            className="bg-black border border-zinc-800 rounded px-10 py-2 text-xs font-black uppercase text-blue-500 focus:outline-none focus:border-blue-500 w-64 transition-all"
                        />
                    </div>
                    <HexMetric size="sm" value={userRegistry.length} label="ID_COUNT" colorClass="border-blue-600 text-blue-500" />
                </div>
            </header>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            <th className="pb-4 px-4 text-center">Identity Profile</th>
                            <th className="pb-4 px-4 text-center">Access Role</th>
                            <th className="pb-4 px-4 text-center">Sovereignty</th>
                            <th className="pb-4 px-4 text-center">Machine Node</th>
                            <th className="pb-4 px-4 text-center">Network (IP)</th>
                            <th className="pb-4 px-4 text-center">Geo-Hint</th>
                            <th className="pb-4 px-4 text-center">Client Fingerprint</th>
                            <th className="pb-4 px-4 text-right">Last Sync</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                        {filteredAccounts.map((account) => (
                            <motion.tr 
                                key={account.uid}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group hover:bg-zinc-900/30 transition-colors"
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded border-2 border-zinc-800 flex items-center justify-center font-black text-xs ${account.uid === user?.uid ? 'border-amber-500 bg-amber-950/20 text-amber-500' : 'bg-black text-zinc-600'}`}>
                                            {account.displayName[0]}
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-white uppercase tracking-tight">{account.displayName}</div>
                                            <div className="text-[8px] font-mono text-zinc-600 uppercase mt-0.5 tracking-tighter">UID: {account.uid}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                        account.role === 'admin' ? 'bg-red-600 text-white' : 
                                        account.role === 'operator' ? 'bg-amber-600 text-black' : 
                                        account.role === 'moderator' ? 'bg-blue-600 text-white' : 
                                        'bg-zinc-800 text-zinc-400'
                                    }`}>
                                        {account.role}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <GlobeIcon className="w-3 h-3 text-amber-600" />
                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{account.sovereignty || 'NONE'}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-2">
                                            <LockIcon className={`w-3 h-3 ${account.seclusionActive ? 'text-blue-500' : 'text-zinc-700'}`} />
                                            <span className={`text-[10px] font-mono uppercase tracking-tighter ${account.seclusionActive ? 'text-blue-400' : 'text-zinc-600'}`}>
                                                {account.machineId}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-blue-400 group-hover:text-blue-300">
                                        <TerminalIcon className="w-3 h-3 text-blue-600" />
                                        {account.ip}
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.1em]">{account.locationHint || 'UNKNOWN'}</span>
                                </td>
                                <td className="py-4 px-4 text-center max-w-[150px] overflow-hidden whitespace-nowrap">
                                    <span className="text-[8px] font-mono text-zinc-600 truncate block opacity-50 hover:opacity-100 transition-opacity">
                                        {account.userAgent || 'UNKNOWN_CLI'}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className="text-[10px] text-zinc-500 uppercase font-black">
                                        {new Date(account.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="text-[7px] text-zinc-700 uppercase font-bold mt-0.5">
                                        {new Date(account.lastSeen).toLocaleDateString()}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {filteredAccounts.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center opacity-30 italic text-zinc-500 font-mono text-sm">
                        <WarningIcon className="w-12 h-12 mb-4" />
                        NO_RESONANCE_DETECTED_IN_REGISTRY
                    </div>
                )}
            </div>

            <footer className="mt-8 p-4 bg-zinc-900/50 border border-white/5 rounded flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <ShieldIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Agent Security Protocol: v5.28_ALPHA</span>
                    </div>
                    <div className="w-px h-4 bg-zinc-800" />
                    <div className="text-[8px] font-mono text-zinc-600 italic">
                        "The Lattice secures identities through sovereign consensus. IP logging persistent."
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-black border border-emerald-900/30 rounded text-[9px] font-black text-emerald-500 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    SOVEREIGN_AGENTS_ACTIVE
                </div>
            </footer>
        </div>
    );
};
