import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter } from 'recharts';
import { ZapIcon, ActivityIcon, WarningIcon, ShieldIcon, CpuIcon, TerminalIcon, GemIcon } from './icons';
import { v4 as uuidv4 } from 'uuid';

interface DataPoint {
    time: number;
    vitality: number;
    id?: string;
}

interface SyncNode {
    time: number;
    vitality: number;
}

export const LivePatchObservationView: React.FC = () => {
    const [boardSpaceAvailable, setBoardSpaceAvailable] = useState(true);
    const [isSimulating, setIsSimulating] = useState(false);
    const [logs, setLogs] = useState<{id: string, text: string, type: 'info' | 'warn'}[]>([]);
    
    const coreCount = 6;
    const coherence = boardSpaceAvailable ? 0.99 : 0.0;
    const downtime = boardSpaceAvailable ? 0.0001 : 60000.0;

    const simulationData = useMemo(() => {
        const points: DataPoint[] = [];
        for (let t = 0; t <= 100; t += 1) {
            let vitality = 1.0;
            if (!boardSpaceAvailable && t >= 50) {
                vitality = 0;
            }
            points.push({ time: t, vitality: vitality + (Math.random() * 0.04 - 0.02) });
        }
        return points;
    }, [boardSpaceAvailable, isSimulating]);

    const syncNodes = useMemo(() => {
        const nodes: SyncNode[] = [];
        const step = 80 / (coreCount - 1);
        for (let i = 0; i < coreCount; i++) {
            const t = 10 + (i * step);
            nodes.push({ time: t, vitality: 1.0 });
        }
        return nodes;
    }, [coreCount]);

    const handleRunObservation = () => {
        setIsSimulating(true);
        const newLog = boardSpaceAvailable 
            ? { id: uuidv4(), text: `INFO: Utilizing available board space for ${coreCount}-core live injection. Coherence: ${coherence}. Downtime: ${downtime}ms.`, type: 'info' as const }
            : { id: uuidv4(), text: `WARNING: No board space. Global system collapse (Reboot) required. Coherence: ${coherence}. Downtime: ${downtime}ms.`, type: 'warn' as const };
        
        setLogs(prev => [newLog, ...prev].slice(0, 10));
        setTimeout(() => setIsSimulating(false), 500);
    };

    return (
        <div className="h-full flex flex-col bg-[#020205] text-gray-300 font-mono p-8 overflow-y-auto custom-scrollbar">
            <header className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-cyan-950/30 border border-cyan-500/50 rounded-xl">
                        <ZapIcon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Live Patch Observation</h1>
                        <p className="text-[10px] text-cyan-700 font-black tracking-widest uppercase">System Vitality // {coreCount}-Core Manifold</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CpuIcon className="w-12 h-12" />
                        </div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <TerminalIcon className="w-4 h-4 text-cyan-500" /> Config_Params
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-black/40 border border-gray-800 rounded-xl">
                                <span className="text-[10px] uppercase font-black text-gray-500">Board Space</span>
                                <button 
                                    onClick={() => setBoardSpaceAvailable(!boardSpaceAvailable)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${boardSpaceAvailable ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-400/50' : 'bg-red-900/20 text-red-500 border border-red-500/30'}`}
                                >
                                    {boardSpaceAvailable ? 'Available' : 'Restricted'}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-black/40 border border-gray-800 rounded-xl">
                                    <span className="block text-[8px] uppercase font-black text-gray-600 mb-1">Coherence</span>
                                    <span className={`text-sm font-black ${coherence > 0.5 ? 'text-emerald-500' : 'text-red-500'}`}>{coherence.toFixed(2)}</span>
                                </div>
                                <div className="p-3 bg-black/40 border border-gray-800 rounded-xl">
                                    <span className="block text-[8px] uppercase font-black text-gray-600 mb-1">Downtime</span>
                                    <span className={`text-sm font-black ${downtime < 1 ? 'text-cyan-500' : 'text-amber-500'}`}>{downtime < 1 ? '<1ms' : '60s'}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleRunObservation}
                                disabled={isSimulating}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 text-black font-black uppercase text-[10px] tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-cyan-900/20 active:translate-y-0.5"
                            >
                                {isSimulating ? 'SIMULATING...' : 'Trigger Injection'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-900/10 border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ActivityIcon className="w-4 h-4 text-blue-500" /> Observation Logs
                        </h3>
                        <div className="space-y-2 h-40 overflow-y-auto custom-scrollbar pr-2">
                            <AnimatePresence initial={false}>
                                {logs.map(log => (
                                    <motion.div 
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`text-[9px] p-2 rounded bg-black/40 border-l-2 ${log.type === 'info' ? 'border-cyan-500 text-cyan-200/70' : 'border-red-500 text-red-400'}`}
                                    >
                                        {log.text}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {logs.length === 0 && <p className="text-[9px] text-gray-700 italic">Awaiting kernel trigger...</p>}
                        </div>
                    </div>
                </div>

                {/* Main Render Area */}
                <div className="lg:col-span-2 bg-gray-900/20 border border-gray-800 rounded-3xl p-8 relative min-h-[400px]">
                    <div className="absolute top-6 right-8 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Sovereign Flow</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <GemIcon className="w-2 h-2 text-amber-500" />
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Core Sync Nodes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-0.5 bg-red-500" />
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Injection Point</span>
                        </div>
                    </div>

                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8">Sovereign Architecture: {coreCount}-Core Live Metric Injection</h2>

                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={simulationData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="#333" 
                                    fontSize={8} 
                                    tickFormatter={(v) => `${v}ms`}
                                    label={{ value: 'Internal Manifold Time (ms)', position: 'insideBottom', offset: -10, fill: '#666', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <YAxis 
                                    stroke="#333" 
                                    fontSize={8} 
                                    domain={[0, 1.2]}
                                    label={{ value: 'Execution Vitality', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px', color: '#fff' }}
                                    itemStyle={{ color: '#06b6d4' }}
                                />
                                <ReferenceLine x={50} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'INJECTION', position: 'top', fill: '#ef4444', fontSize: 9, fontWeight: 'black' }} />
                                
                                <Area 
                                    type="monotone" 
                                    dataKey="vitality" 
                                    fill="url(#colorVitality)" 
                                    stroke="none" 
                                    isAnimationActive={false}
                                />
                                <defs>
                                    <linearGradient id="colorVitality" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>

                                <Line 
                                    type="monotone" 
                                    dataKey="vitality" 
                                    stroke="#06b6d4" 
                                    strokeWidth={3} 
                                    dot={false}
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                />

                                <Scatter 
                                    data={syncNodes} 
                                    fill="#f59e0b" 
                                    shape={(props: any) => (
                                        <path 
                                            d="M0 -4 L4 0 L0 4 L-4 0 Z" 
                                            transform={`translate(${props.cx},${props.cy})`}
                                            fill="#f59e0b"
                                        />
                                    )}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 p-4 bg-cyan-950/10 border border-cyan-900/30 rounded-2xl flex items-start gap-4">
                        <ShieldIcon className="w-5 h-5 text-cyan-600 mt-1" />
                        <div>
                            <p className="text-[10px] text-cyan-200/60 uppercase font-black tracking-widest">Coherence Analysis</p>
                            <p className="text-[9px] text-gray-500 mt-1 leading-relaxed">
                                {boardSpaceAvailable 
                                    ? `High fidelity transition across ${coreCount} core sync nodes. Coherence score maintained at ${coherence}. System downtime restricted to ${downtime}ms.`
                                    : `Infrastructure resource constraints detected. Global system collapse (Reboot) required. Coherence score dropped to ${coherence}.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer className="mt-auto pt-8 border-t border-gray-900 text-[8px] text-gray-700 flex justify-between items-center">
                <span className="uppercase tracking-widest">Ref: KERNEL_LIVE_PATCH_V2 // 6-CORE_MANIFOLD</span>
                <span className="italic">Sovereign Architecture Observational Render // [X: 50.0ms, Y: {boardSpaceAvailable ? '1.0' : '0.0'}]</span>
            </footer>
        </div>
    );
};

