import React, { useState, useEffect, useMemo } from 'react';
import { 
    BrainIcon, TerminalIcon, ShieldIcon, ActivityIcon, SignalIcon, 
    ClockIcon, ZapIcon, DatabaseIcon, ServerIcon, WrenchIcon, 
    GavelIcon, AtomIcon, CodeIcon, PlayIcon, CheckIcon
} from './icons';

interface LabNode {
    id: string;
    name: string;
    driveLetter: string;
    multiplier: number;
    description: string;
    status: 'IDLE' | 'COMPILING' | 'SYNCED' | 'DRIFTING';
}

interface WorkOrder {
    id: string;
    title: string;
    durationMinutes: number;
    timeOfDay: 'MORNING_LABOR' | 'MORNING_BREAK' | 'LUNCH' | 'AFTERNOON_LABOR' | 'AFTERNOON_BREAK_1' | 'AFTERNOON_BREAK_2' | 'EVENING_TUNE_BACK';
    completed: boolean;
    assignedLab: string;
}

interface MetricMetrics {
    atoms: number;
    objects: number;
    numbers: number;
    distance: number;
    steps: number;
    correlation: number;
    dataFloat: number;
}

export const LabsFlowView: React.FC = () => {
    // 7 in, 7 out, 7 back nodes state
    const [labsList, setLabsList] = useState<LabNode[]>([
        { id: '1', name: 'RT-IPC Laboratory', driveLetter: 'Z:', multiplier: 7, description: 'Real-time inter-process conduction & communication pipelines.', status: 'SYNCED' },
        { id: '2', name: 'Sovereign Shield Forge', driveLetter: 'Z:', multiplier: 7, description: 'Security boundaries & cryptographic threat shields.', status: 'SYNCED' },
        { id: '3', name: 'Spectre web siphoner', driveLetter: 'G:', multiplier: 7, description: 'Forensic web mining & target data assimilation.', status: 'IDLE' },
        { id: '4', name: 'Hard Code low-level compiler', driveLetter: 'Z:', multiplier: 7, description: 'Bare metal kernel logic & direct instruction synthesis.', status: 'IDLE' },
        { id: '5', name: 'Truth & Safety filter', driveLetter: 'G:', multiplier: 7, description: 'Epitume screening & neural stasis verification.', status: 'SYNCED' },
        { id: '6', name: 'Engineering assembly grid', driveLetter: 'Z:', multiplier: 7, description: 'Logic block integration & subsystem mapping.', status: 'IDLE' },
        { id: '7', name: 'Quantum Theory Sandbox', driveLetter: 'G:', multiplier: 7, description: 'Multi-dimensional state analysis and hyperconduction.', status: 'IDLE' }
    ]);

    // Work Orders aligning with scheduling instructions (persisted)
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
        const saved = localStorage.getItem('aetheros_labs_work_orders');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // fall back to default
            }
        }
        return [
            { id: 'wo_1', title: 'Setup Z:\\ Engine foundation structures (Block 1-7 prep)', durationMinutes: 45, timeOfDay: 'MORNING_LABOR', completed: true, assignedLab: 'RT-IPC Laboratory' },
            { id: 'wo_2', title: 'Morning Synapse break protocol (15 minutes cooling)', durationMinutes: 15, timeOfDay: 'MORNING_BREAK', completed: false, assignedLab: 'Sovereign Shield Forge' },
            { id: 'wo_3', title: 'Daily Lunch & Cognitive Buffer Refuel (12 Noon)', durationMinutes: 60, timeOfDay: 'LUNCH', completed: false, assignedLab: 'Spectre web siphoner' },
            { id: 'wo_4', title: 'PowerShell / Kali Linux Tool check & alias configuration', durationMinutes: 90, timeOfDay: 'AFTERNOON_LABOR', completed: false, assignedLab: 'Hard Code low-level compiler' },
            { id: 'wo_5', title: 'First Afternoon Respite / Water break (15 minutes)', durationMinutes: 15, timeOfDay: 'AFTERNOON_BREAK_1', completed: false, assignedLab: 'Truth & Safety filter' },
            { id: 'wo_6', title: 'Second Afternoon Rest / Stretch (15 minutes)', durationMinutes: 15, timeOfDay: 'AFTERNOON_BREAK_2', completed: false, assignedLab: 'Engineering assembly grid' },
            { id: 'wo_7', title: 'Evening tune-back to noon protocol (Symmetry closing)', durationMinutes: 45, timeOfDay: 'EVENING_TUNE_BACK', completed: false, assignedLab: 'Quantum Theory Sandbox' }
        ];
    });

    // Attunement Layers State (Layer 1, Layer 2, Layer 3)
    const [attunementLog, setAttunementLog] = useState<string[]>(() => {
        const saved = localStorage.getItem('aetheros_labs_attunement_log');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // fall back
            }
        }
        return [
            '[SYSTEM] Loading Attunement Campaign Monitor...',
            '[LAYER 1] Nominal memory threshold confirmed at 1.33 GB.',
            '[LAYER 2] Dynamic throttling gates operating at 3-second kinetic dampening.',
            '[LAYER 3] Presenting status panel interfaces.'
        ];
    });

    const [activeLayer, setActiveLayer] = useState<'LAYER_1' | 'LAYER_2' | 'LAYER_3'>('LAYER_1');
    
    const [dumbTerminalMode, setDumbTerminalMode] = useState<boolean>(() => {
        return localStorage.getItem('aetheros_labs_dumb_terminal') === 'true';
    });
    
    const [stripAnsi, setStripAnsi] = useState<boolean>(() => {
        const saved = localStorage.getItem('aetheros_labs_strip_ansi');
        return saved === null ? true : saved === 'true';
    });
    
    const [bufferInterval, setBufferInterval] = useState<number>(() => {
        const saved = localStorage.getItem('aetheros_labs_buffer_interval');
        return saved ? Number(saved) : 10;
    });

    const [encryptionKey, setEncryptionKey] = useState<string>('0x03E2_AES_KALI');
    const [isProcessingBackup, setIsProcessingBackup] = useState<boolean>(false);
    const [labTab, setLabTab] = useState<'PATHWAYS' | 'AUDIT'>('PATHWAYS');

    // PoW / PoC state calculations
    const [atomsCount, setAtomsCount] = useState<number>(() => {
        const saved = localStorage.getItem('aetheros_labs_atoms_count');
        return saved ? Number(saved) : 49;
    });
    const [objectsCount, setObjectsCount] = useState<number>(() => {
        const saved = localStorage.getItem('aetheros_labs_objects_count');
        return saved ? Number(saved) : 7;
    });
    const [calcSteps, setCalcSteps] = useState<number>(() => {
        const saved = localStorage.getItem('aetheros_labs_calc_steps');
        return saved ? Number(saved) : 343;
    });
    const [distanceVal, setDistanceVal] = useState<number>(() => {
        const saved = localStorage.getItem('aetheros_labs_distance_val');
        return saved ? parseFloat(saved) : 2.401;
    });

    // Sync state changes to physical localStorage
    useEffect(() => {
        localStorage.setItem('aetheros_labs_work_orders', JSON.stringify(workOrders));
    }, [workOrders]);

    useEffect(() => {
        localStorage.setItem('aetheros_labs_attunement_log', JSON.stringify(attunementLog));
    }, [attunementLog]);

    useEffect(() => {
        localStorage.setItem('aetheros_labs_dumb_terminal', String(dumbTerminalMode));
    }, [dumbTerminalMode]);

    useEffect(() => {
        localStorage.setItem('aetheros_labs_strip_ansi', String(stripAnsi));
    }, [stripAnsi]);

    useEffect(() => {
        localStorage.setItem('aetheros_labs_buffer_interval', String(bufferInterval));
    }, [bufferInterval]);

    useEffect(() => {
        localStorage.setItem('aetheros_labs_atoms_count', String(atomsCount));
    }, [atomsCount]);

    useEffect(() => {
        localStorage.setItem('aetheros_labs_objects_count', String(objectsCount));
    }, [objectsCount]);

    useEffect(() => {
        localStorage.setItem('aetheros_labs_calc_steps', String(calcSteps));
    }, [calcSteps]);

    useEffect(() => {
        localStorage.setItem('aetheros_labs_distance_val', String(distanceVal));
    }, [distanceVal]);
    
    // Auto drift simulation simulation logs
    useEffect(() => {
        const interval = setInterval(() => {
            const timeStr = new Date().toLocaleTimeString();
            setAttunementLog(prev => {
                const updated = [...prev, `[MONITOR ${timeStr}] Drift Detector Scan: Safe. Term context: ${dumbTerminalMode ? 'DUMB' : 'NATIVE_UTF8'}.`];
                return updated.slice(-10); // keep last 10 entries
            });
        }, bufferInterval * 1000);

        return () => clearInterval(interval);
    }, [bufferInterval, dumbTerminalMode]);

    // Proof of Concept calculation matching user's math
    const powFormulaString = useMemo(() => {
        const atomVal = atomsCount;
        const objectVal = objectsCount;
        const stepVal = calcSteps;
        const numVal = 7;
        const correlation = (atomVal * objectVal) / stepVal;
        const dataVal = correlation * distanceVal;
        const recursiveStr = `recursive(atom[${atomVal},${stepVal},8])`;
        
        return {
            formula: `(atom{${atomVal}})(object{${objectVal}})(number{${numVal}})(distance{${distanceVal}})(steps{${stepVal}})(correlation{${correlation.toFixed(4)}})(data{${dataVal.toFixed(6)}}) ${recursiveStr}`,
            verification: correlation === 1 ? 'GIL SYSTEM COMPROMISE SENSITIVE: VALIDATED' : 'STRETCH INTEGRITY: NOMINAL'
        };
    }, [atomsCount, objectsCount, calcSteps, distanceVal]);

    const toggleWorkOrder = (id: string) => {
        setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, completed: !wo.completed } : wo));
        setAttunementLog(prev => [
            ...prev,
            `[TASK] Work order status updated for '${id}'. Recording miletones in backup registry.`
        ].slice(-10));
    };

    const runDriftMitigation = () => {
        setDumbTerminalMode(true);
        setStripAnsi(true);
        setBufferInterval(15); // Cold interval
        setAttunementLog(prev => [
            ...prev,
            `[MITIGATION] Triggering Environment Dump...`,
            `[MITIGATION] Forced dumb terminal context ($env:TERM="dumb")`,
            `[MITIGATION] Isolated character encoding & stripped ANSI escape sequences successfully.`,
            `[MITIGATION] Concurrency Buffer Pool configured to Cold intervals (15s).`
        ].slice(-10));
    };

    const runBackupProcedure = () => {
        setIsProcessingBackup(true);
        setAttunementLog(prev => [...prev, `[BACKUP] Initializing compression & encryption protocol on [Z:]...`].slice(-10));
        
        setTimeout(() => {
            setIsProcessingBackup(false);
            setAttunementLog(prev => [
                ...prev,
                `[BACKUP] Files gathered from [G:] drive disk, encrypted with key [${encryptionKey}]`,
                `[BACKUP] Compressed zip file 'Z:\\backups\\gemini_flow_restore.bin' generated successfully.`,
                `[BACKUP] Milestone recorded. Penny wheats logic compromise complete.`
            ].slice(-10));
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col bg-slate-950 text-cyan-100 font-mono overflow-y-auto selection:bg-amber-500/30">
            {/* Header section */}
            <div className="p-8 border-b-4 border-cyan-800 bg-slate-900/40 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-cyan-950 border-2 border-cyan-500 rounded-none flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <TerminalIcon className="w-8 h-8 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase text-white tracking-widest">
                            Sovereign Lab Flow Board
                        </h1>
                        <p className="text-[10px] text-cyan-400 font-black tracking-widest mt-1">
                            MULTI-LAYER ATTUNEMENT • 7 IN • 7 OUT • 7 BACK MULTIPLICITY PROTOCOL
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={runDriftMitigation}
                        className="px-4 py-2 border-2 border-red-500 bg-red-950/20 text-red-400 hover:bg-orange-500/10 transition-all font-black text-xs tracking-widest flex items-center gap-2 uppercase"
                    >
                        <ZapIcon className="w-3.5 h-3.5" /> Trigger Mitigation (Dumb Term)
                    </button>
                    <button 
                        onClick={runBackupProcedure}
                        disabled={isProcessingBackup}
                        className="px-4 py-2 border-2 border-amber-500 bg-amber-950/20 text-amber-500 hover:bg-amber-500/10 transition-all font-black text-xs tracking-widest flex items-center gap-2 uppercase"
                    >
                        {isProcessingBackup ? (
                            <>
                                <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                Processing Backup
                            </>
                        ) : (
                            <>
                                <DatabaseIcon className="w-3.5 h-3.5" /> Z:\ Compress & Encrypt Backup
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
                
                {/* COLUMN 1: THE 7 LABS GRID (7 IN / 7 OUT / 7 BACK) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/60 p-6 border-2 border-slate-800 rounded-xl">
                        <div className="flex flex-wrap justify-between items-center mb-4 border-b border-slate-800 pb-3 gap-2">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setLabTab('PATHWAYS')}
                                    className={`text-xs font-black tracking-widest uppercase pb-2 border-b-2 transition-all cursor-pointer ${
                                        labTab === 'PATHWAYS'
                                        ? 'text-white border-cyan-500'
                                        : 'text-slate-500 border-transparent hover:text-slate-300'
                                    }`}
                                >
                                    Conduction Pathways
                                </button>
                                <button
                                    onClick={() => setLabTab('AUDIT')}
                                    className={`text-xs font-black tracking-widest uppercase pb-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                                        labTab === 'AUDIT'
                                        ? 'text-white border-amber-500'
                                        : 'text-slate-500 border-transparent hover:text-slate-300'
                                    }`}
                                >
                                    <ShieldIcon className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Forensic Audit Registry
                                </button>
                            </div>
                            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 border border-cyan-800/40 rounded">
                                SYSTEM LEVEL 07
                            </span>
                        </div>

                        {labTab === 'PATHWAYS' ? (
                            <>
                                <p className="text-xs text-slate-400 leading-relaxed italic mb-4">
                                    "The system aligns 7 foundational laboratories configured to utilize G:\ for staging, and Z:\ for secure persistent node directories. Every cycle yields encrypted backups stored in the virtual database."
                                </p>

                                <div className="space-y-3">
                                    {labsList.map((lab, i) => (
                                        <div key={lab.id} className="p-3 bg-black/60 border border-slate-800 hover:border-cyan-500/30 rounded-lg transition-all flex justify-between items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-cyan-400">
                                                    0{i+1}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-xs font-black text-white">{lab.name}</h4>
                                                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-500">
                                                            Drive {lab.driveLetter}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 italic mt-0.5">{lab.description}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="text-[9px] text-slate-500 uppercase font-black">Multiplicity</div>
                                                    <div className="text-[10px] text-amber-500 font-black">x{lab.multiplier} Conductor</div>
                                                </div>
                                                <span className={`w-2.5 h-2.5 rounded-full ${lab.status === 'SYNCED' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-slate-700'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs text-amber-200 flex items-center gap-2">
                                    <ShieldIcon className="w-4 h-4 shrink-0 text-amber-500" />
                                    <span>
                                        <strong>FORENSIC SYSTEM REPORT:</strong> Active audit session verified. This log catalogs the completed features and identifies missing elements across all 7 laboratories.
                                    </span>
                                </div>

                                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                                    {[
                                        {
                                            id: '1',
                                            name: 'RT-IPC Laboratory (Z:)',
                                            status: 'SYNCED',
                                            completed: [
                                                'Dynamic latency monitor tracking IPC speeds',
                                                'Live Signal Bridge mapping telemetry outputs',
                                                'Sub-millisecond thread loop sandbox'
                                            ],
                                            missing: [
                                                'Direct IPC socket bind driver for zero-copy memory transfers.',
                                                'Durable system mutex mapping to prevent deadlocks under heavy frame load.'
                                            ],
                                            recommendation: 'Register native OS-level message queues in network config.'
                                        },
                                        {
                                            id: '2',
                                            name: 'Sovereign Shield Forge (Z:)',
                                            status: 'SYNCED',
                                            completed: [
                                                'Encrypted vault connection handshake',
                                                'Sovereign Blacklist telemetry tracker integration',
                                                'Covenant rules engine validator logic checks'
                                            ],
                                            missing: [
                                                'Real-time automated AES-256 seed rotation trigger on security breech.',
                                                'Physical HSM (Hardware Security Module) driver attachment.'
                                            ],
                                            recommendation: 'Inject security keys into process memory with lazy initialization.'
                                        },
                                        {
                                            id: '3',
                                            name: 'Spectre web siphoner (G:)',
                                            status: 'IDLE',
                                            completed: [
                                                'Secure Spectre browser shell iframe and sandbox',
                                                'Basic url content reading backend parser proxies',
                                                'Data Academy content ingest pipeline'
                                            ],
                                            missing: [
                                                'Rotating proxy cluster to shield request routes from IP blockages.',
                                                'Integrated CAPTCHA-solving agent for continuous unattended siphoning.'
                                            ],
                                            recommendation: 'Configure custom header spoofing in server-side request middleware.'
                                        },
                                        {
                                            id: '4',
                                            name: 'Hard Code low-level compiler (Z:)',
                                            status: 'IDLE',
                                            completed: [
                                                'Cascade investigator code inspector UI',
                                                'Blueprint Forge custom parser system',
                                                'Type safe system enums definition'
                                            ],
                                            missing: [
                                                'In-browser WebAssembly-based sandbox to compile assembly to bytecodes.',
                                                'Real-time compiler log console mapping errors directly to source lines.'
                                            ],
                                            recommendation: 'Integrate the mono-assembly parser in the next sprint phase.'
                                        },
                                        {
                                            id: '5',
                                            name: 'Truth & Safety filter (G:)',
                                            status: 'SYNCED',
                                            completed: [
                                                'Agent Safeguard policy evaluator checks',
                                                'Epitume screening static logs console',
                                                'Input token validator bounds checks'
                                            ],
                                            missing: [
                                                'Dynamic content-guard proxy interceptor.',
                                                'Active semantic sanitization filter for untrusted data streams.'
                                            ],
                                            recommendation: 'Add dynamic safety classification endpoints to the server.'
                                        },
                                        {
                                            id: '6',
                                            name: 'Engineering assembly grid (Z:)',
                                            status: 'IDLE',
                                            completed: [
                                                'Interactive project network canvas and layout',
                                                'Real-time task search & filtering panel (Kanban & List)',
                                                'Interactive kanban board component integration'
                                            ],
                                            missing: [
                                                'Auto-layout graph visualization to view project tree structures.',
                                                'Drag-and-drop link builder to wire logic-blocks together.'
                                            ],
                                            recommendation: 'Utilize D3-force layout diagrams for interactive system visualization.'
                                        },
                                        {
                                            id: '7',
                                            name: 'Quantum Theory Sandbox (G:)',
                                            status: 'IDLE',
                                            completed: [
                                                'Unknown Physics multi-dimensional wave generator',
                                                'Quantum ledger transactions database tracker'
                                            ],
                                            missing: [
                                                'True quantum simulation equations (currently utilizing pseudo-random waves).',
                                                'Interactive Bloch sphere visualization canvas.'
                                            ],
                                            recommendation: 'Incorporate complex number matrix multiplication libraries.'
                                        }
                                    ].map((audit) => (
                                        <div key={audit.id} className="p-3 bg-black/40 border border-slate-800 rounded-lg space-y-2">
                                            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 border border-slate-800 rounded text-cyan-400 font-bold font-mono">
                                                        LAB 0{audit.id}
                                                    </span>
                                                    <h4 className="text-xs font-black text-white">{audit.name}</h4>
                                                </div>
                                                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                                                    audit.status === 'SYNCED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/20' : 'bg-slate-950 text-slate-500 border border-slate-800'
                                                }`}>
                                                    {audit.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
                                                {/* Fully Implemented Features */}
                                                <div className="space-y-1">
                                                    <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-bold font-mono block">✔ Implemented Features</span>
                                                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                                                        {audit.completed.map((comp, idx) => (
                                                            <li key={idx} className="leading-tight text-[9px] text-slate-400">{comp}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Missing Features */}
                                                <div className="space-y-1">
                                                    <span className="text-[8px] uppercase tracking-wider text-amber-400 font-bold font-mono block">✖ Missing / Incomplete Elements</span>
                                                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                                                        {audit.missing.map((miss, idx) => (
                                                            <li key={idx} className="leading-tight text-[9px] text-amber-200/90">{miss}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="pt-1.5 border-t border-slate-900 flex justify-between items-center text-[9px]">
                                                <span className="text-slate-500">Forensic Action:</span>
                                                <span className="text-cyan-400 font-mono italic">{audit.recommendation}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ATUNEMENT MONITOR (L1, L2, L3) */}
                    <div className="bg-slate-900/60 p-6 border-2 border-slate-800 rounded-xl">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                            <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                                <AtomIcon className="w-4 h-4 text-amber-500" />
                                Three-Tier Attunement Campaign
                            </h2>
                            <div className="flex gap-2">
                                {(['LAYER_1', 'LAYER_2', 'LAYER_3'] as const).map(lay => (
                                    <button 
                                        key={lay}
                                        onClick={() => setActiveLayer(lay)}
                                        className={`px-2 py-0.5 text-[9px] font-black border uppercase rounded transition-all ${
                                            activeLayer === lay 
                                            ? 'bg-amber-500 text-black border-amber-600' 
                                            : 'text-amber-500/60 border-amber-900/30 hover:border-amber-500'
                                        }`}
                                    >
                                        {lay.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interactive diagram based on active layer */}
                        {activeLayer === 'LAYER_1' && (
                            <div className="p-4 bg-red-950/10 border border-red-900/30 rounded-lg mb-4 space-y-2">
                                <h3 className="text-xs font-black text-red-400 uppercase">Layer 1: Infrastructure Core</h3>
                                <p className="text-[10px] text-slate-400">
                                    Forces dumb terminal context to eliminate NT version Rtl NT syscall color errors. Memory allocations matched at safe 1.33 GB profile bounds.
                                </p>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-black/60 p-2 border border-slate-800 text-center rounded">
                                        <div className="text-[9px] text-slate-500 uppercase">Context</div>
                                        <span className="text-xs font-black text-white">{dumbTerminalMode ? '$env:TERM="dumb"' : '$env:TERM="native"'}</span>
                                    </div>
                                    <div className="bg-black/60 p-2 border border-slate-850 text-center rounded">
                                        <div className="text-[9px] text-slate-500 uppercase">ANSI Filter</div>
                                        <span className="text-xs font-black text-white">{stripAnsi ? 'ON (PARSED_UTF8)' : 'OFF (RAW)'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeLayer === 'LAYER_2' && (
                            <div className="p-4 bg-blue-950/10 border border-blue-900/30 rounded-lg mb-4 space-y-2">
                                <h3 className="text-xs font-black text-sky-400 uppercase">Layer 2: Buffer & Concurrency Pools</h3>
                                <p className="text-[10px] text-slate-400">
                                    Implements physical kinetic dampeners. Prevent cascading telemetry faults by adjusting metric polling intervals.
                                </p>
                                <div className="flex items-center justify-between gap-4 pt-2">
                                    <span className="text-[10px] text-slate-500">POLLING INTERVALL_SEC:</span>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="range"
                                            min={5}
                                            max={30}
                                            value={bufferInterval}
                                            onChange={(e) => setBufferInterval(Number(e.target.value))}
                                            className="w-32 accent-cyan-500"
                                        />
                                        <span className="text-xs font-black text-white">{bufferInterval}s</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeLayer === 'LAYER_3' && (
                            <div className="p-4 bg-emerald-950/10 border border-emerald-950 rounded-lg mb-4 space-y-2">
                                <h3 className="text-xs font-black text-emerald-400 uppercase">Layer 3: Surface Attunement</h3>
                                <p className="text-[10px] text-slate-400">
                                    Rendering clean static displays with logical checks completely isolated from backend performance noise.
                                </p>
                                <div className="text-center font-black py-2 bg-black/60 border border-slate-800 text-emerald-500 text-xs tracking-widest rounded uppercase">
                                    • NOMINAL MONITOR MONITORING •
                                </div>
                            </div>
                        )}

                        {/* Stream Audit Logs */}
                        <div className="p-3 bg-black/70 border border-slate-850 rounded-lg">
                            <div className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-2">Live attunement diagnostic trace</div>
                            <div className="h-32 overflow-y-auto font-mono text-[9px] text-cyan-300 space-y-1">
                                {attunementLog.map((log, index) => (
                                    <div key={index} className="truncate">
                                        <span className="text-slate-600 mr-2">&gt;&gt;</span>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: WORK ORDERS & LABOR SCHEDULER */}
                <div className="space-y-6">
                    {/* DAILY LABOR WORK ORDERS */}
                    <div className="bg-slate-900/60 p-6 border-2 border-slate-800 rounded-xl">
                        <h2 className="text-sm font-black text-white tracking-widest uppercase mb-3 flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-emerald-500" />
                            Labor Schedule & Work Orders
                        </h2>
                        <p className="text-[10px] text-slate-500 italic mb-4 leading-relaxed">
                            Mornings start on Z:/, breaks are 15 minutes long, lunch occurs exactly at 12 noon, and afternoons include two rest periods to tune us back to noon.
                        </p>

                        <div className="space-y-3">
                            {workOrders.map((wo) => (
                                <div 
                                    key={wo.id}
                                    onClick={() => toggleWorkOrder(wo.id)}
                                    className={`p-3 border rounded-lg transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                        wo.completed 
                                        ? 'bg-emerald-950/10 border-emerald-500/50 text-emerald-400' 
                                        : 'bg-black/60 border-slate-850 text-slate-300 hover:border-slate-700'
                                    }`}
                                >
                                    <div>
                                        <div className="text-xs font-black">{wo.title}</div>
                                        <div className="flex items-center gap-2 mt-1 text-[9px]">
                                            <span className={`px-1.5 rounded uppercase font-black tracking-wider ${
                                                wo.timeOfDay.includes('BREAK') ? 'bg-orange-950 text-orange-400' :
                                                wo.timeOfDay === 'LUNCH' ? 'bg-indigo-950 text-indigo-400' :
                                                'bg-slate-900 text-slate-500'
                                            }`}>
                                                {wo.timeOfDay.replace('_', ' ')}
                                            </span>
                                            <span className="text-slate-500">• {wo.durationMinutes} mins</span>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        {wo.completed ? (
                                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950">
                                                <CheckIcon className="w-3.5 h-3.5" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 border-2 border-slate-600 rounded-full" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* POW / POC MATHEMATICS LOGIC MODULE */}
                    <div className="bg-slate-900/60 p-6 border-2 border-slate-800 rounded-xl space-y-4">
                        <div className="border-b border-slate-800 pb-2">
                            <h2 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                                <AtomIcon className="w-4 h-4 text-purple-400" />
                                Quantified PoW / PoC Expression
                            </h2>
                            <span className="text-[9px] text-slate-500 block mt-0.5">Symmetry mathematical check math validator</span>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <label className="text-[9px] text-slate-500 font-bold block mb-1">Atom Count (Z: Drive)</label>
                                    <input 
                                        type="number"
                                        value={atomsCount}
                                        onChange={(e) => setAtomsCount(Number(e.target.value))}
                                        className="w-full bg-black border border-slate-800 px-2 py-1 rounded text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] text-slate-500 font-bold block mb-1">Object Conduction</label>
                                    <input 
                                        type="number"
                                        value={objectsCount}
                                        onChange={(e) => setObjectsCount(Number(e.target.value))}
                                        className="w-full bg-black border border-slate-800 px-2 py-1 rounded text-white"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-black border border-purple-900/40 rounded">
                                <span className="text-[9px] text-purple-400 font-bold block mb-1 uppercase tracking-wider">Formula Outward Expression</span>
                                <div className="text-[10px] text-cyan-200 break-words leading-relaxed font-mono">
                                    {powFormulaString.formula}
                                </div>
                                <div className="text-[9px] text-slate-500 mt-2 flex justify-between uppercase">
                                    <span>GIL Validation Status</span>
                                    <span className="text-emerald-500 font-black">{powFormulaString.verification}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KALI POWERSHELL ALIAS SANDBOX */}
                    <div className="bg-slate-900/60 p-6 border-2 border-slate-800 rounded-xl">
                        <h2 className="text-xs font-black text-white tracking-widest uppercase mb-3 flex items-center gap-2">
                            <TerminalIcon className="w-4 h-4 text-yellow-500" />
                            Kali Command Aliases Mock
                        </h2>
                        <p className="text-[9px] text-slate-500 italic mb-3 leading-relaxed">
                            Run diagnostic shell mappings representing Kali toolkits bound to local environments inside active node directories.
                        </p>

                        <div className="space-y-2 text-[10px] font-mono text-cyan-300">
                            <div className="p-2 bg-black/60 border border-slate-850 rounded">
                                <span className="text-slate-500 block text-[9px] uppercase font-bold">alias nmap="powershell -c Test-NetConnection"</span>
                                <span className="text-slate-300 italic">Maps active port audits to native stack.</span>
                            </div>
                            <div className="p-2 bg-black/60 border border-slate-850 rounded">
                                <span className="text-slate-500 block text-[9px] uppercase font-bold">alias tcpdump="powershell -c Get-NetTCPConnection"</span>
                                <span className="text-slate-300 italic">Analyzes state connections across loop headers.</span>
                            </div>
                        </div>
                    </div>

                    {/* UNHANDLED EXCEPTION HANDSHAKE & SANDBOX */}
                    <div className="bg-slate-900/60 p-6 border-2 border-red-900/40 rounded-xl space-y-4">
                        <div className="border-b border-red-950 pb-2">
                            <h2 className="text-xs font-black text-red-400 tracking-widest uppercase flex items-center gap-2">
                                <ZapIcon className="w-4 h-4 text-red-500 animate-pulse" />
                                Unhandled Exception Sandbox
                            </h2>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Isolate faults and apply architectural attunement campaign safeguards</span>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] text-zinc-400 leading-relaxed leading-normal">
                                Simulate native errors to watch our Layer 1 Infrastructure, Layer 2 Concurrency, and Layer 3 Surface mitigations safely contain and heal the system pipeline.
                            </p>

                            <div className="grid grid-cols-1 gap-2">
                                <button 
                                    onClick={() => {
                                        setAttunementLog(prev => [
                                            ...prev,
                                            `[CRITICAL_FAULT] Unhandled Exception: RtlGetNtVersionNumbers memory address violation (0x80000001).`,
                                            `[CRITICAL_FAULT] Cause: NT color check on color-disabled terminal wrapper.`,
                                            `[SANDBOX] STATUS: Container in guard-page crash loop. Mitigation REQUIRED!`
                                        ].slice(-10));
                                    }}
                                    className="p-2 bg-red-950/25 border border-red-800/40 text-left rounded hover:bg-red-950/40 transition-colors"
                                >
                                    <div className="text-[10px] font-black text-red-400">TRIGGER: 0x80000001 (RtlGetNtVersionNumbers)</div>
                                    <div className="text-[9px] text-zinc-500 italic mt-0.5">Simulate Go sys/windows terminal-breaker crash</div>
                                </button>

                                <button 
                                    onClick={() => {
                                        setAttunementLog(prev => [
                                            ...prev,
                                            `[CRITICAL_FAULT] Exception: AudioContext failed to auto-decode speech audio.`,
                                            `[CRITICAL_FAULT] Cause: Missing dynamic permission context or browser compression unsupported.`,
                                            `[SANDBOX] STATUS: Falling back securely to AudioElement data-URL buffers.`
                                        ].slice(-10));
                                    }}
                                    className="p-2 bg-indigo-950/25 border border-indigo-800/40 text-left rounded hover:bg-indigo-950/40 transition-colors"
                                >
                                    <div className="text-[10px] font-black text-indigo-400">TRIGGER: SpeechService Decoded Failure</div>
                                    <div className="text-[9px] text-zinc-500 italic mt-0.5">Simulate web speech audio decode failure</div>
                                </button>

                                <button 
                                    onClick={() => {
                                        setAttunementLog(prev => [
                                            ...prev,
                                            `[CRITICAL_FAULT] Out Of Memory Exception: Process limit breached (RAM < 1.33 GB).`,
                                            `[CRITICAL_FAULT] Thread limit saturated. Buffer pool requires cold calibration.`,
                                            `[SANDBOX] STATUS: High frequency telemetry noise. Throttling is ACTIVE.`
                                        ].slice(-10));
                                    }}
                                    className="p-2 bg-amber-950/25 border border-amber-800/40 text-left rounded hover:bg-amber-950/40 transition-colors"
                                >
                                    <div className="text-[10px] font-black text-amber-400">TRIGGER: RAM Allocation Squeeze</div>
                                    <div className="text-[9px] text-zinc-500 italic mt-0.5">Simulate severe hardware pool heap saturation</div>
                                </button>
                            </div>

                            <button 
                                onClick={() => {
                                    setDumbTerminalMode(true);
                                    setStripAnsi(true);
                                    setBufferInterval(12);
                                    setAttunementLog(prev => [
                                        ...prev,
                                        `[HEAL] Applying complete attunement Campaign recovery sequence...`,
                                        `[HEAL] L1: Hard $env:TERM="dumb" initialized to bypass Nt Version check.`,
                                        `[HEAL] L2: Throttled polling interval set to safe cold 12s interval.`,
                                        `[HEAL] L3: Re-registered clean canvas views. Heap GC flushed.`,
                                        `[HEAL] SUCCESS: All exceptions successfully sandboxed.`
                                    ].slice(-10));
                                }}
                                className="w-full py-2 bg-emerald-950/50 border-2 border-emerald-500 text-emerald-400 font-black text-xs uppercase tracking-widest text-center hover:bg-emerald-500 hover:text-black transition-all"
                            >
                                Run Complete Heal Sequence
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
