import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Milestone } from '../types';
import { milestoneService } from '../services/milestoneService';
import { doctrineService } from '../services/doctrineService';
import { HexMetric } from './HexMetric';
import { ShieldIcon, ActivityIcon, TerminalIcon, CheckIcon, WarningIcon, SearchIcon } from './icons';

export const SystemIntegrityView: React.FC = () => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [driveStatus, setDriveStatus] = useState(doctrineService.getDriveStatus());

    useEffect(() => {
        setMilestones(milestoneService.getMilestones());
        const interval = setInterval(() => {
            setMilestones(milestoneService.getMilestones());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-1 flex flex-col bg-[#050505] p-6 overflow-hidden">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <ActivityIcon className="w-8 h-8 text-amber-500" />
                        System Integrity
                    </h1>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1 pl-1">
                        Audit Ledger // Concrete Proof of Labor
                    </p>
                </div>
                <div className="flex gap-4">
                    <HexMetric size="sm" value="82" label="LYNIS" colorClass="border-emerald-600 text-emerald-500" />
                    <HexMetric size="sm" value="CDA" label="VERIFY" colorClass="border-blue-600 text-blue-500" />
                    <HexMetric size="sm" value="EX" label="BACKUP_D" colorClass="border-fuchsia-600 text-fuchsia-500" />
                    <HexMetric size="sm" value="0.91" label="INDEX" colorClass="border-amber-600 text-amber-500" />
                </div>
            </header>

            <div className="flex-1 overflow-auto custom-scrollbar space-y-4 pr-2">
                {milestones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <TerminalIcon className="w-16 h-16 text-zinc-800 mb-4 animate-pulse" />
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-600">Awaiting Log Conjunction...</p>
                    </div>
                ) : milestones.map(milestone => (
                    <motion.div 
                        key={milestone.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-5 bg-zinc-900/20 border border-zinc-800 rounded relative overflow-hidden group hover:border-zinc-700 transition-all"
                    >
                        <div className={`absolute right-0 top-0 h-full w-1 ${
                            milestone.category === 'INFRA' ? 'bg-blue-500' : 'bg-amber-500'
                        } group-hover:w-2 transition-all`} />
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                    milestone.category === 'INFRA' ? 'bg-blue-600 text-white' :
                                    milestone.category === 'WISDOM' ? 'bg-amber-600 text-black' : 'bg-zinc-800 text-zinc-400'
                                }`}>
                                    {milestone.category}
                                </div>
                                <span className="text-[9px] font-mono text-zinc-600 uppercase">{milestone.id}</span>
                            </div>
                            <span className="text-[9px] font-black text-zinc-500 uppercase">{new Date(milestone.date).toLocaleString()}</span>
                        </div>
                        
                        <p className="text-sm font-black text-white uppercase tracking-tight mb-4">{milestone.title}: {milestone.description.split(' | POW:')[0]}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-900">
                            <div className="flex items-center gap-2">
                                <TerminalIcon className="w-3 h-3 text-zinc-500" />
                                <span className="text-[9px] font-mono text-zinc-400">POW: {milestone.description.split('POW: ')[1]?.split(' | ')[0] || 'LATTICE_VALIDATED'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldIcon className="w-3 h-3 text-emerald-900" />
                                <span className="text-[9px] font-mono text-emerald-700">LCG: {milestone.description.split('LCG: ')[1] || '0 gil'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950/20 border border-emerald-900/50 rounded ml-auto">
                                <CheckIcon className="w-2.5 h-2.5 text-emerald-500" />
                                <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">RESIMBLER_VERIFIED</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldIcon className="w-4 h-4 text-amber-500" />
                        Sovereign Doctrine Drive Matrix
                    </h3>
                    <div className="space-y-3">
                        {driveStatus.map(drive => (
                            <div key={drive.id} className="flex justify-between items-center bg-black/40 p-3 rounded border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center font-black text-blue-500 border border-blue-900/30">
                                        {drive.id}:
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-white uppercase">{drive.label}</p>
                                        <p className="text-[7px] text-zinc-600 font-mono">INTEGRITY: {(drive.integrity * 100).toFixed(0)}%</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase ${
                                    drive.status === 'ACTIVE' ? 'text-emerald-500' : 
                                    drive.status === 'SYNCED' ? 'text-blue-500' : 'text-amber-500'
                                } animate-pulse`}>
                                    {drive.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-amber-950/10 border border-amber-900/30 rounded flex flex-col justify-center items-center text-center">
                    <WarningIcon className="w-12 h-12 text-amber-600 mb-4 animate-pulse" />
                    <h4 className="text-lg font-black text-amber-500 uppercase tracking-tighter mb-2">Resimbler Diagnostics</h4>
                    <p className="text-[10px] text-amber-800 font-bold uppercase max-w-xs leading-relaxed">
                        Always audit for system integrity and make checks to be resimbler. Never delete, always append. Node Gold reached.
                    </p>
                    <div className="mt-4 flex gap-2">
                        <span className="px-2 py-1 bg-black text-[8px] font-black text-emerald-500 border border-emerald-900 rounded">POWERSHELL: ACTIVE</span>
                        <span className="px-2 py-1 bg-black text-[8px] font-black text-blue-500 border border-blue-900 rounded">KALI_ALIAS: LOADED</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
