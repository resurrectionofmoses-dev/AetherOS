import React, { useState } from 'react';
import { motion } from 'motion/react';
import { VaultEntry } from '../types';
import { HexMetric } from './HexMetric';
import { DatabaseIcon, GlobeIcon, DownloadIcon, ShieldIcon, LockIcon, TerminalIcon, FileIcon, SearchIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

export const VaultManagerView: React.FC = () => {
    const { verifyBiometricSignature } = useAuth();
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [systemLog, setSystemLog] = useState<string | null>(null);

    const [entries, setEntries] = useState<VaultEntry[]>([
        {
            id: 'BK-001',
            path: 'D:\\Gemini\\Backups\\types_BACKUP.ts',
            originalPath: 'C:\\App\\types.ts',
            timestamp: Date.now() - 3600000,
            size: 21543,
            encrypted: true,
            compressed: true
        }
    ]);

    const handleRestoreBackup = async (entry: VaultEntry) => {
        setSystemLog(null);
        const isVerified = await verifyBiometricSignature(`RESTORE ARCHIVE NODE ${entry.id}`);
        if (!isVerified) {
            setSystemLog(`VAULT_SEC: Signature verification ceremony cancelled or rejected.`);
            return;
        }

        setRestoringId(entry.id);
        setSystemLog(`RESTORE_SERVICE: Re-aligning logic boundaries from ${entry.id}...`);

        setTimeout(() => {
            setRestoringId(null);
            setSystemLog(`SUCCESS: Logic shard parsed and rewritten perfectly to ${entry.originalPath}. Active operating environment recalibrated.`);
        }, 3000);
    };

    const [searchQuery, setSearchQuery] = useState('');

    const drives = [
        { label: 'C:\\ SOURCE', usage: '42%', color: 'border-emerald-500 text-emerald-500', desc: 'Active development intake' },
        { label: 'D:\\ VAULT', usage: '12%', color: 'border-blue-500 text-blue-500', desc: 'Encrypted long-term storage' },
        { label: 'E:\\ NODE', usage: '88%', color: 'border-amber-500 text-amber-500', desc: 'Runtime environment & packages' }
    ];

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="flex-1 flex flex-col bg-[#050505] p-6 overflow-hidden">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <DatabaseIcon className="w-8 h-8 text-emerald-500" />
                        Vault Management
                    </h1>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1 pl-1">
                        D:\ DRIVE_ARCHIVE // Encrypted Redundancy
                    </p>
                </div>
                <div className="flex gap-4">
                    <HexMetric size="sm" value={entries.length} label="BKUPS" colorClass="border-emerald-600 text-emerald-500" />
                    <HexMetric size="sm" value="99.9" label="SAFE" colorClass="border-blue-600 text-blue-500" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {drives.map(drive => (
                    <div key={drive.label} className={`p-4 bg-zinc-900/40 border ${drive.color.split(' ')[0]} rounded flex flex-col`}>
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-white">{drive.label}</span>
                             <span className={`text-[10px] font-black uppercase ${drive.color.split(' ')[1]}`}>{drive.usage}</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded overflow-hidden mb-3">
                            <div className={`h-full bg-current ${drive.color.split(' ')[1]}`} style={{ width: drive.usage }} />
                        </div>
                        <p className="text-[8px] text-zinc-500 font-mono uppercase italic">{drive.desc}</p>
                    </div>
                ))}
            </div>

            {systemLog && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 mb-4 text-[10px] font-black uppercase rounded-xl border ${
                        systemLog.includes('SUCCESS') 
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' 
                            : systemLog.includes('RESTORE_SERVICE') 
                            ? 'bg-blue-950/30 border-blue-500/30 text-blue-400'
                            : 'bg-red-950/30 border-red-500/30 text-red-400'
                    }`}
                >
                    <span className="animate-pulse mr-1.5">•</span> {systemLog}
                </motion.div>
            )}

            <div className="flex-1 flex flex-col bg-zinc-900/20 border border-zinc-800 rounded overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <GlobeIcon className="w-4 h-4 text-zinc-500" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Archive Registry (D:\Backups\Gemini)</span>
                    </div>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="FIND_BACKUP..."
                            className="bg-black border border-zinc-900 rounded pl-9 pr-4 py-1.5 text-[10px] font-black uppercase text-emerald-500 focus:outline-none focus:border-emerald-700 w-48"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[9px] font-black uppercase tracking-widest text-zinc-600 border-b border-zinc-800">
                                <th className="p-4">Resource Node</th>
                                <th className="p-4">Vault Destination</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Data Size</th>
                                <th className="p-4 text-right">Last Sync</th>
                                <th className="p-4 text-right">Security Clearance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/50">
                            {entries.map(entry => (
                                <tr key={entry.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <FileIcon className="w-4 h-4 text-zinc-500" />
                                            <div className="text-[10px] font-black text-white uppercase truncate max-w-[200px]">{entry.originalPath}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 font-mono text-[9px] text-emerald-600">
                                            <TerminalIcon className="w-3 h-3" />
                                            {entry.path}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {entry.encrypted && <LockIcon className="w-3 h-3 text-blue-500" />}
                                            {entry.compressed && <DownloadIcon className="w-3 h-3 text-emerald-500" />}
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="text-[10px] font-mono text-zinc-400">{formatSize(entry.size)}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="text-[10px] font-black text-zinc-600 uppercase">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleRestoreBackup(entry)}
                                            disabled={restoringId !== null}
                                            className={`text-[8px] font-black uppercase border-2 px-3 py-1.5 rounded-lg transition-all ${
                                                restoringId === entry.id
                                                    ? 'border-amber-500/35 text-amber-500 bg-amber-500/10 animate-pulse cursor-not-allowed'
                                                    : restoringId !== null
                                                    ? 'border-zinc-800 text-zinc-700 cursor-not-allowed'
                                                    : 'border-emerald-500/35 text-emerald-500 hover:text-white hover:bg-emerald-600 hover:border-emerald-500'
                                            }`}
                                        >
                                            {restoringId === entry.id ? 'RESTORING_SHARD...' : 'RESTORE_NODE'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded flex items-center gap-4">
                    <div className="w-10 h-10 rounded border border-emerald-500 flex items-center justify-center bg-emerald-950/20">
                        <ShieldIcon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-white uppercase tracking-widest">Auto-Backup Engine</div>
                        <p className="text-[8px] text-zinc-500 font-mono italic uppercase mt-1">Status: LISTENING_FOR_FILE_SYMBOLS // MODE: APPEND_ONLY</p>
                    </div>
                </div>
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1 bg-black border border-blue-900/30 rounded text-[9px] font-black text-blue-500 animate-pulse">
                        <TerminalIcon className="w-4 h-4" />
                        D:\ ENCRYPTION_ACTIVE
                    </div>
                    <div className="text-[8px] font-mono text-zinc-700">
                        Audit_v5.2 // NODE_GOLD_PROTOCOL
                    </div>
                </div>
            </footer>
        </div>
    );
};
