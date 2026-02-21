import React, { useState, useEffect, useRef } from 'react';
import { 
    ClockIcon, ActivityIcon, ZapIcon, ShieldIcon, TerminalIcon, 
    GaugeIcon, FireIcon, BrainIcon, StarIcon,
    CodeIcon, LockIcon, CheckCircleIcon
} from './icons';
import type { ChronosTelemetry, LabComponentProps } from '../types';

export const ChronosDashboard: React.FC<LabComponentProps> = ({ onActionReward }) => {
    const [telemetry, setTelemetry] = useState<ChronosTelemetry>({
        iops: 11240000,
        latency: 0.02,
        shardsActive: 10000,
        pzisSignature: '0x3E2_CHRONOS_INIT',
        noHurpStability: 99.1
    });
    
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [activeNodes, setActiveNodes] = useState<Set<number>>(new Set());
    const [witnessedNodes, setWitnessedNodes] = useState<Set<number>>(new Set());

    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry(prev => ({
                ...prev,
                iops: Math.max(11200000, prev.iops + (Math.random() - 0.5) * 50000),
                latency: Math.max(0.015, Math.min(0.025, prev.latency + (Math.random() - 0.5) * 0.002)),
                pzisSignature: `PZIS_${Math.random().toString(36).substring(7).toUpperCase()}`
            }));

            // Random grid activity
            const newActive = new Set<number>();
            const newWitnessed = new Set<number>();
            for(let i=0; i<400; i++) {
                if(Math.random() > 0.95) newActive.add(i);
                if(Math.random() > 0.98) newWitnessed.add(i);
            }
            setActiveNodes(newActive);
            setWitnessedNodes(newWitnessed);

            // Log activity
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            const log = `[${time}] PZIS_AUTH >> LATTICE_LOCKED [ADDR: 0x7FFF0${Math.floor(Math.random()*999)}]`;
            setTerminalLogs(prev => [log, ...prev].slice(0, 30));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shard Grid Visualizer */}
                <div className="lg:col-span-2 glass-card p-8 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black tracking-tighter uppercase italic">K10 Hyper-Shard Mesh</h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                            ACTIVE LATTICE
                        </div>
                    </div>
                    
                    <div className="shard-grid">
                        {Array.from({ length: 400 }).map((_, i) => (
                            <div 
                                key={i} 
                                className={`shard-node ${activeNodes.has(i) ? 'active' : ''} ${witnessedNodes.has(i) ? 'witnessed' : ''}`}
                            />
                        ))}
                    </div>

                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-stone-50 rounded-xl">
                            <div className="text-xs text-stone-400 font-bold uppercase mb-1">Total Shards</div>
                            <div className="text-lg font-black font-mono">10,000</div>
                        </div>
                        <div className="p-4 bg-stone-50 rounded-xl">
                            <div className="text-xs text-stone-400 font-bold uppercase mb-1">Finality</div>
                            <div className="text-lg font-black font-mono text-sky-600">T0</div>
                        </div>
                        <div className="p-4 bg-stone-50 rounded-xl">
                            <div className="text-xs text-stone-400 font-bold uppercase mb-1">Stability</div>
                            <div className="text-lg font-black font-mono text-emerald-600">{telemetry.noHurpStability}%</div>
                        </div>
                        <div className="p-4 bg-stone-50 rounded-xl">
                            <div className="text-xs text-stone-400 font-bold uppercase mb-1">PZIS Rot.</div>
                            <div className="text-lg font-black font-mono">0.011ms</div>
                        </div>
                    </div>
                </div>

                {/* Security Terminal */}
                <div className="lg:col-span-1 glass-card p-6 rounded-2xl bg-stone-950 text-stone-100 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-800">
                        <h3 className="text-xs font-black uppercase tracking-widest text-stone-400">PZIS_IDENTITY_LOG</h3>
                        <TerminalIcon className="text-sky-500 w-3 h-3" />
                    </div>
                    <div className="flex-grow font-mono text-[10px] space-y-1 overflow-y-auto custom-scrollbar text-sky-400/80">
                        {terminalLogs.map((log, i) => (
                            <div key={i} className="animate-in slide-in-from-left-1">
                                <span className="text-stone-600 mr-2">&gt;&gt;</span>
                                {log}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-2 border-t border-stone-800 flex justify-between items-center text-[10px] font-mono text-stone-500">
                        <span>LATTICE_LOCK: ARMED</span>
                        <span className="text-emerald-500 font-bold">SECURE</span>
                    </div>
                </div>
            </div>

            {/* Performance Analysis Card */}
            <div className="glass-card p-8 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Throughput Sensation Analysis</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase">IOPS Realtime</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase">Stability</span>
                        </div>
                    </div>
                </div>
                
                <div className="h-48 w-full bg-stone-50 rounded-xl border border-stone-200 flex items-end p-4 gap-1">
                    {Array.from({ length: 60 }).map((_, i) => {
                        const h = 40 + Math.random() * 60;
                        return (
                            <div 
                                key={i} 
                                className="flex-1 bg-sky-100 border-t-2 border-sky-400 transition-all duration-1000"
                                style={{ height: `${h}%` }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};