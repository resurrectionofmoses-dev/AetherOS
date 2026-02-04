
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SignalIcon, ZapIcon, ShieldIcon, TerminalIcon, SpinnerIcon, SearchIcon, CodeIcon, ActivityIcon, FireIcon, BrainIcon, BookOpenIcon, LogicIcon, WarningIcon, CheckCircleIcon, ChevronDownIcon, PackageIcon, StarIcon, XIcon, ClockIcon } from './icons';
import { generateBluetoothBlueprint, adaptBluetoothProtocol } from '../services/geminiService';
import type { BluetoothProtocol, BluetoothBlueprint, ProtocolAdaptation } from '../types';

const PROTOCOLS: BluetoothProtocol[] = [
    { 
        id: 'p1', 
        name: 'Core Spec 5.4', 
        category: 'Core', 
        status: 'Stable',
        lifecycle: 'Full-Scale',
        description: 'The foundation of modern IoT. Introduces Periodic Advertising with Responses (PAwR) and Encrypted Advertising Data (EAD) for high-integrity bidirectional broadcast.', 
        commonUUIDDetails: [
            { uuid: '0x1800', meaning: 'Generic Access Profile (GAP) - Manages device discovery and link maintenance.' },
            { uuid: '0x1801', meaning: 'Generic Attribute Profile (GATT) - Orchestrates the hierarchical data structure.' },
            { uuid: '0x2A00', meaning: 'Device Name - UTF-8 identity string signature.' },
            { uuid: '0x2A01', meaning: 'Appearance - 16-bit mapping of physical node type.' },
            { uuid: '0x1857', meaning: 'ESL Service - Heartbeat of PAwR synchronization logic.' },
            { uuid: '0x2B84', meaning: 'ESL Address Characteristic - Unique logical index for the shard within the array.' },
            { uuid: '0x2B86', meaning: 'ESL Response Characteristic - Real-time response packet for confirming updates.' },
        ],
        designConstraints: ['Encryption Mandatory', 'Latency < 10ms', 'PAwR Sub-event Compliance', 'LE Security Mode 1 Level 4'] 
    },
    { 
        id: 'p2', 
        name: 'LE Audio / Auracast', 
        category: 'Auracast', 
        status: 'Beta',
        lifecycle: 'MVP',
        description: 'Next-gen audio sharing. LC3 Codec, Broadcast Audio, and Multi-stream support.', 
        commonUUIDDetails: [
            { uuid: '0x184B', meaning: 'Basic Audio Profile Service - Root audio conduction pipe.' },
            { uuid: '0x184E', meaning: 'Published Audio Capabilities Service - Node intake profile.' },
            { uuid: '0x2BDE', meaning: 'Audio Stream Control - Real-time conduction management.' },
            { uuid: '0x2BDF', meaning: 'Broadcast Audio Scan - Spectrum crawler for Auracast nodes.' },
        ],
        designConstraints: ['Encryption Mandatory', 'LC3 Compliance', 'QoS Synchronization', 'Multi-stream Support'] 
    },
    { 
        id: 'p3', 
        name: 'GATT Battery Service', 
        category: 'GATT', 
        status: 'Stable',
        lifecycle: 'Full-Scale',
        description: 'Universal status reporting for node longevity and fuel management.', 
        commonUUIDDetails: [
            { uuid: '0x180F', meaning: 'Battery Service - Node energy status monitor.' },
            { uuid: '0x2A19', meaning: 'Battery Level Characteristic - 0-100% fuel readout.' },
        ],
        designConstraints: ['Encryption Mandatory', 'Read-only', 'Low frequency updates', 'Minimal Power Drain'] 
    },
    { 
        id: 'p4', 
        name: 'Bluetooth Mesh 1.1', 
        category: 'Mesh', 
        status: 'Stable',
        lifecycle: 'Full-Scale',
        description: 'Massive scale node orchestration. Directed Forwarding and Remote Provisioning.', 
        commonUUIDDetails: [
            { uuid: '0x1827', meaning: 'Mesh Provisioning Service - Gateway to the secure mesh grid.' },
            { uuid: '0x1828', meaning: 'Mesh Proxy Service - Bridge for GATT-only shards.' },
        ],
        designConstraints: ['Encryption Mandatory', 'Relay support', 'Sequence numbering', 'Scalability Factor: MAX'] 
    },
    { 
        id: 'p5', 
        name: 'HID over GATT (HoG)', 
        category: 'GATT', 
        status: 'Experimental',
        lifecycle: 'PoC',
        description: 'Low-latency human interface conduit for peripherals and conductor tools.', 
        commonUUIDDetails: [
            { uuid: '0x1812', meaning: 'Human Interface Device Service - Standard Maestro tool interface.' },
            { uuid: '0x2A4A', meaning: 'HID Information - Hardware metadata and capability map.' },
            { uuid: '0x2A4B', meaning: 'Report Map - Blueprint for input stream interpretation.' },
        ],
        designConstraints: ['Encryption Mandatory', 'Critical timing', 'High throughput', 'Input Latency: RIGID'] 
    },
    { 
        id: 'p6', 
        name: 'Classic BR/EDR Audio', 
        category: 'Traditional', 
        status: 'Stable',
        lifecycle: 'Hypercare',
        description: 'Legacy high-throughput audio for legacy conductors and standard headset profiles (HFP/A2DP).', 
        commonUUIDDetails: [
            { uuid: '0x110B', meaning: 'Audio Source - Outbound sonic conduction.' },
            { uuid: '0x110C', meaning: 'A/V Remote Control - Legacy command set.' },
        ],
        designConstraints: ['Encryption Mandatory', 'SBC Codec Standard', 'High Power Consumption', 'Point-to-Point Only'] 
    },
];

const CATEGORIES = ['All', 'Core', 'GATT', 'Mesh', 'Auracast', 'Traditional'] as const;
const STATUSES = ['All', 'Stable', 'Beta', 'Experimental'] as const;

export const BluetoothSpecBridge: React.FC = () => {
    const [selectedProtocol, setSelectedProtocol] = useState<BluetoothProtocol>(PROTOCOLS[0]);
    const [designRequirements, setDesignRequirements] = useState('');
    const [blueprint, setBlueprint] = useState<BluetoothBlueprint | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [logs, setLogs] = useState<string[]>(["[SIG_BRIDGE] Initialized via epitume.", "[READY] Spectrum scanners calibrated."]);
    const [spectrumPulse, setSpectrumPulse] = useState(0);
    const [isSimulatingDrift, setIsSimulatingDrift] = useState(false);
    const [currentDrift, setCurrentDrift] = useState(0); 
    const [interference, setInterference] = useState(0); 
    const [isAdapting, setIsAdapting] = useState(false);
    const [adaptationResult, setAdaptationResult] = useState<ProtocolAdaptation | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterStatus, setFilterStatus] = useState<string>('All');

    // UI state for collapsing sections
    const [showUuidDetails, setShowUuidDetails] = useState(false);
    const [showConductionLayers, setShowConductionLayers] = useState(false);

    const logEndRef = useRef<HTMLDivElement>(null);

    const filteredProtocols = useMemo(() => {
        return PROTOCOLS.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
            const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [searchTerm, filterCategory, filterStatus]);

    useEffect(() => {
        if (!selectedProtocol || !filteredProtocols.find(p => p.id === selectedProtocol.id)) {
            if (filteredProtocols.length > 0) {
                setSelectedProtocol(filteredProtocols[0]);
            }
        }
    }, [filteredProtocols, selectedProtocol]);

    const stabilityRating = useMemo(() => {
        if (selectedProtocol.status === 'Stable') return 100;
        if (selectedProtocol.status === 'Beta') return 65;
        return 35;
    }, [selectedProtocol]);

    const readinessIndex = useMemo(() => {
        const levels: Record<string, number> = { 'Discovery': 20, 'PoC': 40, 'MVP': 60, 'Full-Scale': 90, 'Hypercare': 100 };
        return (levels[selectedProtocol.lifecycle]) || 0;
    }, [selectedProtocol]);

    const addLog = useCallback((msg: string, color: string = 'text-gray-400') => {
        setLogs(prev => [...prev, `<span class="${color}">${msg}</span>`].slice(-100));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setSpectrumPulse(p => (p + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const handleGenerateBlueprint = async () => {
        if (!designRequirements.trim()) return;
        setIsGenerating(true);
        addLog(`[EPITUME_REQ] Generating blueprint for ${selectedProtocol.name}...`, 'text-cyan-400');
        
        try {
            const result = await generateBluetoothBlueprint(selectedProtocol.name, designRequirements);
            if (result) {
                setBlueprint(result);
                addLog(`[SUCCESS] Blueprint generated. Epitume signature: ${result.integritySignature}`, 'text-green-400');
            }
        } catch (e) {
            addLog(`[CRITICAL] Architectural reedle interrupted.`, 'text-red-600');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAdaptProtocol = async () => {
        if (!blueprint) return;
        setIsAdapting(true);
        addLog(`[EPITUME_REQ] Adapting protocol via reedles in da ass...`, 'text-amber-400');
        
        try {
            const result = await adaptBluetoothProtocol(blueprint, { simulatedDrift: currentDrift, interferenceLevel: interference });
            if (result) {
                setAdaptationResult(result);
                addLog(`[SUCCESS] Adaptive directives received. Epitume stability: ${result.predictedStability}%`, 'text-green-400');
            }
        } catch (e) {
            addLog(`[CRITICAL] Epitume adaptation engine stalled.`, 'text-red-600');
        } finally {
            setIsAdapting(false);
        }
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="h-full flex flex-col bg-[#050810] text-gray-200 font-mono overflow-hidden">
            <div className="p-4 border-b-8 border-black sticky top-0 z-30 bg-slate-900 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-500/10 border-4 border-blue-600 rounded-3xl flex items-center justify-center">
                        <SignalIcon className="w-10 h-10 text-blue-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-blue-500 wisdom-glow italic tracking-tighter uppercase">Bluetooth SIG Bridge</h2>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mt-1 italic">Epitume Protocol | v5.4.1</p>
                    </div>
                </div>
                <div className="flex gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Spectrum Pulse</p>
                        <div className="w-32 h-2 bg-gray-950 rounded-full border-2 border-black overflow-hidden p-0.5">
                            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${spectrumPulse}%` }} />
                        </div>
                    </div>
                    <ActivityIcon className="w-12 h-12 text-blue-900 opacity-30" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-8">
                        {/* Filters & Protocols */}
                        <div className="aero-panel p-6 bg-slate-900/80 border-blue-600/30 shadow-2xl space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-comic-header text-2xl text-white uppercase italic tracking-tight flex items-center gap-2">
                                    <SearchIcon className="w-5 h-5 text-blue-500" /> Filter Array
                                </h3>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Search protocols..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-black border-2 border-black rounded-lg py-2 pl-8 pr-4 text-xs text-blue-400 font-mono focus:border-blue-600 transition-all"
                                    />
                                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-700" />
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilterCategory(cat)}
                                            className={`px-3 py-1 rounded-md text-[8px] font-black uppercase border-2 transition-all ${filterCategory === cat ? 'bg-blue-600 border-blue-500 text-black shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-black border-zinc-800 text-gray-600 hover:text-white'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                                {filteredProtocols.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedProtocol(p)}
                                        className={`w-full p-4 text-left rounded-xl border-4 transition-all duration-300 group ${
                                            selectedProtocol?.id === p.id 
                                            ? 'bg-black border-blue-600 scale-[1.02] shadow-[10px_10px_0_0_#000]' 
                                            : 'bg-black/40 border-black hover:border-blue-900/50 opacity-60'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className={`font-comic-header text-lg uppercase tracking-widest leading-none ${selectedProtocol?.id === p.id ? 'text-blue-500' : 'text-gray-500'}`}>{p.name}</p>
                                            <span className="text-[6px] font-black uppercase px-1.5 py-0.5 rounded-full border border-gray-800 bg-black text-gray-600">{p.category}</span>
                                        </div>
                                        <p className="text-[9px] text-gray-600 italic mt-1 line-clamp-1">{p.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status Gauges */}
                        <div className="space-y-4">
                            <div className="aero-panel p-6 bg-black/60 border-white/5 shadow-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <ActivityIcon className="w-3.5 h-3.5" /> Stability
                                    </h4>
                                    <span className={`text-[10px] font-black ${selectedProtocol.status === 'Stable' ? 'text-green-500' : 'text-amber-500'}`}>{stabilityRating}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-950 rounded-full border-2 border-black overflow-hidden p-0.5">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${selectedProtocol.status === 'Stable' ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${stabilityRating}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                        {/* Protocol Detail View */}
                        <div className="aero-panel p-8 bg-slate-900 border-white/5 shadow-2xl">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-600/10 border-4 border-blue-600 rounded-2xl flex items-center justify-center">
                                        <PackageIcon className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-comic-header text-4xl text-white italic tracking-tighter uppercase leading-none">{selectedProtocol.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 font-black">CAT: {selectedProtocol.category}</span>
                                            <span className="text-[10px] text-gray-500 font-mono italic">Lifecycle: {selectedProtocol.lifecycle}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black border-4 border-black shadow-lg ${selectedProtocol.status === 'Stable' ? 'bg-green-600 text-black' : 'bg-amber-600 text-black'}`}>{selectedProtocol.status}</span>
                                </div>
                            </div>

                            <div className="bg-black/80 p-6 border-4 border-black rounded-[2rem] mb-8">
                                <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Epitume Synthesis Requirements</h4>
                                <textarea 
                                    value={designRequirements}
                                    onChange={e => setDesignRequirements(e.target.value)}
                                    placeholder="Input your design reedles for synthesis..."
                                    className="w-full h-32 bg-transparent border-none font-mono text-blue-400 focus:ring-0 outline-none text-lg resize-none"
                                />
                                <button 
                                    onClick={handleGenerateBlueprint}
                                    disabled={isGenerating || !designRequirements.trim()}
                                    className="vista-button w-full mt-6 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-base tracking-[0.2em] rounded-2xl flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                                >
                                    {isGenerating ? <SpinnerIcon className="w-6 h-6" /> : <ZapIcon className="w-6 h-6" />}
                                    <span>INITIATE BLUEPRINT FORGE</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                        <LogicIcon className="w-4 h-4" /> Common Signatures
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedProtocol.commonUUIDDetails.map((uuid, i) => (
                                            <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-xl group hover:border-cyan-500/30 transition-all">
                                                <p className="text-[10px] font-black text-cyan-500 mb-0.5">{uuid.uuid}</p>
                                                <p className="text-[9px] text-gray-400 italic line-clamp-2">{uuid.meaning}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldIcon className="w-4 h-4" /> Design Constraints
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedProtocol.designConstraints.map((constraint, i) => (
                                            <div key={i} className={`p-3 bg-black/40 border-2 rounded-xl flex items-center gap-3 ${constraint === 'Encryption Mandatory' ? 'border-red-600 bg-red-950/10' : 'border-white/5'}`}>
                                                {constraint === 'Encryption Mandatory' ? <ZapIcon className="w-4 h-4 text-red-500" /> : <CheckCircleIcon className="w-4 h-4 text-amber-600" />}
                                                <span className={`text-[10px] font-black uppercase ${constraint === 'Encryption Mandatory' ? 'text-red-500' : 'text-gray-300'}`}>{constraint}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Synthesis Result */}
                        {blueprint && (
                            <div className="aero-panel p-8 bg-black border-4 border-blue-600 rounded-[2.5rem] animate-in zoom-in-95 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-comic-header text-3xl text-blue-400 uppercase italic">Implementation Shard</h4>
                                    <span className="text-[9px] text-gray-600 font-mono">SIG: {blueprint.integritySignature}</span>
                                </div>
                                <div className="bg-slate-900/80 p-6 rounded-2xl border-2 border-black font-mono text-[11px] text-cyan-400 overflow-x-auto whitespace-pre h-64 custom-scrollbar shadow-inner">
                                    <code>{blueprint.codeSnippet}</code>
                                </div>
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-slate-900 border-2 border-white/5 rounded-2xl">
                                        <h5 className="text-[10px] font-black text-amber-500 uppercase mb-4 flex items-center gap-2">
                                            <ActivityIcon className="w-4 h-4" /> Reedle Adaptation
                                        </h5>
                                        <button 
                                            onClick={handleAdaptProtocol}
                                            disabled={isAdapting}
                                            className="w-full py-3 bg-zinc-800 hover:bg-cyan-600 text-white font-black uppercase text-[10px] rounded-xl flex items-center justify-center gap-3 transition-all"
                                        >
                                            {isAdapting ? <SpinnerIcon className="w-4 h-4" /> : <FireIcon className="w-4 h-4" />}
                                            <span>SOLVE REEDLES IN DA ASS</span>
                                        </button>
                                    </div>
                                    {adaptationResult && (
                                        <div className="p-6 bg-green-950/20 border-2 border-green-600/30 rounded-2xl animate-in slide-in-from-right-4">
                                            <div className="flex items-center gap-2 text-green-500 mb-2">
                                                <CheckCircleIcon className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase">Adaptive Logic Stable</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 italic">"Conjunction Stride maintained at 99.8% purity."</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Logs */}
            <div className="lg:h-48 h-40 bg-black/95 border-t-8 border-black p-4 flex flex-col overflow-hidden relative shadow-2xl">
                <div className="flex items-center justify-between text-blue-900 border-b border-zinc-900 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                        <TerminalIcon className="w-4 h-4" />
                        <span className="font-black tracking-widest uppercase text-[9px]">EPITUME_STREAM: /dev/bt0</span>
                    </div>
                    <span className="text-[8px] font-mono text-gray-700">0x03E2_REEDLE_ENABLED</span>
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1 custom-scrollbar">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-4 group" dangerouslySetInnerHTML={{ __html: `<span class="opacity-30">[${i.toString().padStart(3, '0')}]</span> ${log}` }} />
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
    );
};
