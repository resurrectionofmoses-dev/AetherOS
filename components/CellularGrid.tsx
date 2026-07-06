import React, { useState, useEffect } from 'react';
import { cellularEngine, QuantumCycleState } from '../services/cellularEngine';
import { HexMetric } from './HexMetric';
import { 
  Database, Save, Trash2, Shield, Search, Flame, Coins, Info, 
  RefreshCw, Cpu, Layers, Sparkles, AlertCircle, FileText, 
  CheckCircle, Zap, Star, Compass, Download, Radio, HelpCircle
} from 'lucide-react';
import { cellularDb } from '../services/cellularDb';
import { CellNode, CellularState } from '../types';
import { toast } from 'sonner';

// Random prefix and suffix generators for Bio-NFT names
const NFT_PREFIXES = ['Mito', 'Ribo', 'Helix', 'Gen', 'Cerebro', 'Cyto', 'Nano', 'Quantum', 'Aura', 'Proton', 'Aether', 'Sovereign'];
const NFT_SUFFIXES = ['Prime', 'Weaver', 'Core', 'Forge', 'Catalyst', 'Synthesis', 'Lattice', 'Spectra', 'Matrix', 'Engine', 'Vault', 'Bridge'];

export const CellularGrid: React.FC = () => {
    // Core states
    const [cycle, setCycle] = useState<QuantumCycleState>(cellularEngine.getState());
    const [cells, setCells] = useState<CellNode[]>([{ id: 'genesis', cph: 100, atp: 1000, generation: 0 }]);
    
    // Firestore Snapshots state
    const [snapshots, setSnapshots] = useState<CellularState[]>([]);
    const [isLoadingSnapshots, setIsLoadingSnapshots] = useState<boolean>(false);
    const [newSnapshotName, setNewSnapshotName] = useState<string>('');
    const [isSavingSnapshot, setIsSavingSnapshot] = useState<boolean>(false);

    // Bio-NFT state
    const [mintedNfts, setMintedNfts] = useState<CellNode[]>([]);

    // Deep Scanning states
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanProgress, setScanProgress] = useState<number>(0);
    const [scanLogs, setScanLogs] = useState<string[]>([]);
    const [scanRewards, setScanRewards] = useState<{
        hasLegendarySeed: boolean;
        hasBoostAvailable: boolean;
        unlockedCredentials: string[];
    }>({
        hasLegendarySeed: false,
        hasBoostAvailable: false,
        unlockedCredentials: []
    });

    // Load snapshots and Bio-NFTs on mount
    useEffect(() => {
        loadSnapshots();
        loadSavedNfts();
        
        const unsubscribe = cellularEngine.subscribe(state => {
            setCycle(state);
            
            // Mitosis Trigger: Phase M completes (progress > 90)
            if (state.phase === 'M' && state.progress > 90) {
                setCells(prev => {
                    if (prev.length > 20) return prev; // Capacity cap
                    const next: CellNode[] = [];
                    prev.forEach(cell => {
                        const halfCph = Math.floor(cell.cph / 2);
                        if (halfCph < 1) {
                            next.push(cell); // Cannot divide further
                        } else {
                            // Preserve NFT tags on daughter cells if the parent was an NFT
                            next.push(
                                { 
                                    id: cell.id + '_A', 
                                    cph: halfCph, 
                                    atp: halfCph * 10, 
                                    generation: cell.generation + 1,
                                    isNft: cell.isNft,
                                    nftId: cell.isNft ? cell.nftId + '-α' : undefined,
                                    nftUri: cell.nftUri,
                                    rarity: cell.rarity
                                },
                                { 
                                    id: cell.id + '_B', 
                                    cph: halfCph, 
                                    atp: halfCph * 10, 
                                    generation: cell.generation + 1,
                                    isNft: cell.isNft,
                                    nftId: cell.isNft ? cell.nftId + '-β' : undefined,
                                    nftUri: cell.nftUri,
                                    rarity: cell.rarity
                                }
                            );
                        }
                    });
                    return next;
                });
            }
        });
        return unsubscribe;
    }, []);

    // Load snapshots from Firestore Db with local storage fallback
    const loadSnapshots = async () => {
        setIsLoadingSnapshots(true);
        try {
            const list = await cellularDb.getCellularStates();
            setSnapshots(list);
        } catch (e) {
            console.error('Failed to load snapshots:', e);
        } finally {
            setIsLoadingSnapshots(false);
        }
    };

    // Load NFTs from SafeStorage / localStorage
    const loadSavedNfts = () => {
        try {
            const stored = localStorage.getItem('bio_nfts_registry');
            if (stored) {
                setMintedNfts(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load local Bio-NFTs:', e);
        }
    };

    // Save current state as snapshot in Firestore Db
    const handleSaveSnapshot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSnapshotName.trim()) {
            toast.error('Please enter a valid snapshot name.');
            return;
        }

        setIsSavingSnapshot(true);
        try {
            const saved = await cellularDb.saveCellularState(
                newSnapshotName.trim(),
                cells,
                cycle.phase
            );
            toast.success(`Snapshot "${saved.name}" successfully written to Firestore Eternal Memory!`);
            setNewSnapshotName('');
            loadSnapshots();
        } catch (err) {
            toast.error('Failed to save snapshot to Firestore.');
        } finally {
            setIsSavingSnapshot(false);
        }
    };

    // Load snapshot cells into current active view
    const handleLoadSnapshotCells = (snap: CellularState) => {
        try {
            const parsedCells = JSON.parse(snap.cellsJson) as CellNode[];
            if (parsedCells && parsedCells.length > 0) {
                setCells(parsedCells);
                toast.success(`Successfully loaded snapshot: "${snap.name}" with ${parsedCells.length} active cells!`);
            } else {
                toast.error('Snapshot has an empty or corrupt cell register.');
            }
        } catch (e) {
            toast.error('Failed to parse snapshot cell configuration.');
        }
    };

    // Delete snapshot
    const handleDeleteSnapshot = async (id: string, name: string) => {
        try {
            await cellularDb.deleteCellularState(id);
            toast.success(`Snapshot "${name}" permanently purged from Firestore.`);
            loadSnapshots();
        } catch (e) {
            toast.error('Failed to purge snapshot.');
        }
    };

    // Mint an active cell as a Bio-NFT
    const handleMintCellNft = (cellId: string) => {
        let alreadyMinted = false;
        
        setCells(prev => prev.map(c => {
            if (c.id === cellId) {
                if (c.isNft) {
                    alreadyMinted = true;
                    return c;
                }
                const nftId = `BIO-NFT-${Math.floor(100000 + Math.random() * 900000)}`;
                const prefix = NFT_PREFIXES[Math.floor(Math.random() * NFT_PREFIXES.length)];
                const suffix = NFT_SUFFIXES[Math.floor(Math.random() * NFT_SUFFIXES.length)];
                const name = `${prefix} ${suffix} #${Math.floor(10 + Math.random() * 89)}`;
                
                // Set rarity based on cell generation
                let rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY' | 'ETERNAL' = 'COMMON';
                if (c.generation === 1) rarity = 'UNCOMMON';
                else if (c.generation === 2) rarity = 'RARE';
                else if (c.generation === 3) rarity = 'LEGENDARY';
                else if (c.generation >= 4) rarity = 'ETERNAL';

                const minted: CellNode = {
                    ...c,
                    isNft: true,
                    nftId,
                    nftUri: name,
                    rarity,
                    mintTimestamp: Date.now()
                };

                // Add to persistent registry
                setMintedNfts(currentNfts => {
                    const exists = currentNfts.some(n => n.id === cellId);
                    if (exists) return currentNfts;
                    const nextNfts = [minted, ...currentNfts];
                    localStorage.setItem('bio_nfts_registry', JSON.stringify(nextNfts));
                    return nextNfts;
                });

                toast.success(`Successfully Minted Bio-NFT: "${name}" (${rarity})!`);
                return minted;
            }
            return c;
        }));

        if (alreadyMinted) {
            toast.info('This cell is already a registered Bio-NFT on the ledger!');
        }
    };

    // Deep scanning algorithm simulation
    const handleStartDeepScan = () => {
        if (isScanning) return;
        setIsScanning(true);
        setScanProgress(0);
        setScanLogs([]);
        
        const logs = [
            'Initializing quantum scanner interface on local port: 3000...',
            'Targeting cell structural lattice layers...',
            'Evaluating metabolic conductance rates against core thresholds...',
            'Diverging search vector into background secure storage buffers...',
            'Scanning security audits for cached key files...',
            'De-obfuscating localized state signature directories...',
            'Audit result: found active vulnerability details!',
            'Uncovering unminted high-frequency cell structures...',
            'Deep scan finished. Syncing security payloads.'
        ];

        let logIdx = 0;
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsScanning(false);
                    
                    // Unlocked scanning rewards
                    setScanRewards({
                        hasLegendarySeed: true,
                        hasBoostAvailable: true,
                        unlockedCredentials: ['AUTH-9226 Root Token', 'FILE-6310 Storage Swap Key', 'NETW-2704 Port Auth']
                    });
                    
                    toast.success('Deep Asset Scan Completed! 3 High-value parameters discovered.');
                    return 100;
                }
                
                // Add status logs based on progress threshold
                const nextProgress = prev + 5;
                if (nextProgress % 15 === 0 && logIdx < logs.length) {
                    setScanLogs(l => [...l, `[${nextProgress}%] ${logs[logIdx++]}`]);
                }
                
                return nextProgress;
            });
        }, 150);
    };

    // Inject the Legendary Seed cell uncovered by scanner
    const handleInjectLegendarySeed = () => {
        if (!scanRewards.hasLegendarySeed) return;
        
        const legendaryCell: CellNode = {
            id: `seed_legendary_${Date.now()}`,
            cph: 350,
            atp: 3000,
            generation: 3,
            isNft: true,
            nftId: `BIO-NFT-LEGEN-${Math.floor(1000 + Math.random() * 8999)}`,
            nftUri: 'Superposition Synthesis Prime',
            rarity: 'LEGENDARY',
            mintTimestamp: Date.now()
        };

        setCells(prev => [...prev, legendaryCell]);
        setScanRewards(prev => ({ ...prev, hasLegendarySeed: false }));
        toast.success('Superposition Synthesis Prime injected successfully!');
    };

    // Trigger ATP boost perk
    const handleTriggerAtpBoost = () => {
        if (!scanRewards.hasBoostAvailable) return;
        
        setCells(prev => prev.map(c => ({
            ...c,
            atp: c.atp + 500
        })));
        
        setScanRewards(prev => ({ ...prev, hasBoostAvailable: false }));
        toast.success('Metabolic booster active! +500 ATP Energy injected into all cells.');
    };

    // Phase configurations for biological explanations (Cycle tooltips)
    const phaseDescriptions = {
        G1: 'Gap 1: Active cellular growth & protein synthesis. Energy conductance increases.',
        S: 'Synthesis: DNA replication occurs. Generates exact nucleotide copy blocks.',
        G2: 'Gap 2: Double-checking of synthesized structures. Preparing for mitotic division.',
        M: 'Mitosis: Active division cycle. Parent cells split. Conductance is conserved.'
    };

    return (
        <div 
            className="h-full flex flex-col bg-[#05050a] text-gray-200 font-mono overflow-y-auto custom-scrollbar"
            style={{
                marginLeft: '2px',
                marginRight: '2px',
                paddingRight: '2px',
                paddingLeft: '2px',
                paddingTop: '-2px',
                paddingBottom: '2px',
            }}
        >
            {/* Custom Interactive Tooltip Bar at top */}
            <div className="bg-[#090914] px-4 py-2 border-b border-zinc-800 text-[10px] text-cyan-400 flex items-center gap-2 select-none">
                <Info className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 animate-pulse" />
                <span>
                    <strong className="text-white">AetherOS Diagnostic System Dashboard:</strong> Hover over any metric, cycle badge, card element, or utility button to retrieve explicit biological explanation tooltips.
                </span>
            </div>

            {/* Cycle Header */}
            <div className="p-4 border-b border-zinc-800 bg-[#070711] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 relative group">
                    {/* Hover Tooltip for Phase Header */}
                    <div className="absolute left-0 top-14 hidden group-hover:block z-50 w-72 p-3 bg-[#0d0d1e] border-2 border-red-500 text-xs text-red-200 rounded-xl shadow-2xl space-y-1.5 font-sans">
                        <div className="font-bold flex items-center gap-1.5 text-red-400">
                            <Flame className="w-4 h-4 text-red-500" />
                            <span>Quantum Biological Cycle Indicator</span>
                        </div>
                        <p>{phaseDescriptions[cycle.phase as keyof typeof phaseDescriptions] || 'Active phase of cellular state.'}</p>
                        <p className="text-[10px] text-zinc-500">Conductance frequency governs metabolic rotation speeds.</p>
                    </div>

                    <div className="w-12 h-12 bg-red-600/10 border border-red-600/40 rounded-xl flex items-center justify-center cursor-help">
                        <Flame className="w-7 h-7 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h2 className="font-sans text-2xl font-bold tracking-tight text-white uppercase italic">PHASE_{cycle.phase}</h2>
                            <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400" />
                        </div>
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{cycle.explanation}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 items-center w-full sm:w-auto">
                    <div className="relative group cursor-help text-right">
                        {/* Hover Tooltip for Conductance */}
                        <div className="absolute right-0 top-10 hidden group-hover:block z-50 w-64 p-3 bg-[#0d0d1e] border border-cyan-500 text-xs text-cyan-200 rounded-xl shadow-2xl space-y-1 font-sans">
                            <div className="font-bold text-cyan-400 flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5" />
                                <span>Phase Resonance Conductance</span>
                            </div>
                            <p>Resonating frequency calculated in Hertz. A positive frequency stimulates faster ATP synthesization across daughter cells.</p>
                        </div>
                        <p className="text-[8px] text-zinc-500 font-bold uppercase flex items-center justify-end gap-1">
                            Phase Logic <HelpCircle className="w-3 h-3 text-zinc-600" />
                        </p>
                        <p className="text-lg font-bold text-cyan-400">{cycle.conductance > 0 ? '+' : ''}{cycle.conductance} Hz</p>
                    </div>

                    <div className="flex-1 sm:flex-initial relative group">
                        {/* Hover Tooltip for ATP cycle timer progress */}
                        <div className="absolute right-0 top-10 hidden group-hover:block z-50 w-60 p-3 bg-[#0d0d1e] border border-amber-500 text-xs text-amber-200 rounded-xl shadow-2xl space-y-1 font-sans">
                            <div className="font-bold text-amber-400 flex items-center gap-1">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Mitotic Progress Meter</span>
                            </div>
                            <p>Tracks timing within the current phase. At 100% of Phase M, Mitosis takes place, splitting cells and advancing generation tiers.</p>
                        </div>
                        <div className="w-44 h-3 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden p-0.5 cursor-help">
                            <div 
                                className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-100" 
                                style={{ width: `${cycle.progress}%` }} 
                            />
                        </div>
                        <div className="text-[8px] text-zinc-500 text-right mt-1 font-bold">CYCLE_RES: {Math.floor(cycle.progress)}%</div>
                    </div>
                </div>
            </div>

            {/* Core Workspace Area: Two-Column layout for Cell Matrix + Persistent Snaps / scan panels */}
            <div className="flex-1 p-4 grid grid-cols-1 xl:grid-cols-12 gap-4 items-start content-start">
                
                {/* Left Side: Active Cellular Grid Matrix (9 cols on wide) */}
                <div className="xl:col-span-8 space-y-4">
                    <div className="bg-[#070712] border border-zinc-800 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-cyan-400" />
                                <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Active Cellular Matrix</h3>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold bg-[#0d0d22] border border-zinc-800 px-2 py-0.5 rounded-md">
                                POPULATION: {cells.length} / 20
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {cells.map(cell => {
                                // Determine NFT styling attributes
                                const isNft = cell.isNft;
                                let borderClass = 'border-zinc-800 hover:border-cyan-600';
                                let cardBg = 'bg-black/30';
                                let nameColor = 'text-zinc-400';
                                let shadowStyle = '6px 6px 0px 0px rgba(9, 9, 20, 0.5)';
                                
                                if (isNft) {
                                    cardBg = 'bg-gradient-to-br from-[#0c0d24] to-[#04050d]';
                                    if (cell.rarity === 'COMMON') {
                                        borderClass = 'border-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.25)]';
                                        nameColor = 'text-slate-300';
                                    } else if (cell.rarity === 'UNCOMMON') {
                                        borderClass = 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
                                        nameColor = 'text-emerald-400';
                                    } else if (cell.rarity === 'RARE') {
                                        borderClass = 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.35)]';
                                        nameColor = 'text-blue-400';
                                    } else if (cell.rarity === 'LEGENDARY') {
                                        borderClass = 'border-purple-500 animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.45)]';
                                        nameColor = 'text-purple-400 font-bold';
                                    } else if (cell.rarity === 'ETERNAL') {
                                        borderClass = 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse';
                                        nameColor = 'text-amber-400 font-black';
                                    }
                                }

                                return (
                                    <div 
                                        key={cell.id} 
                                        className={`relative border-2 ${borderClass} ${cardBg} p-4 rounded-2xl flex flex-col justify-between group transition-all duration-300 hover:-translate-y-0.5`}
                                        style={{ boxShadow: shadowStyle }}
                                    >
                                        {/* Hover Tooltip for Cell */}
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:block z-50 w-64 p-3 bg-[#0c0c1b] border border-cyan-500 text-xs text-zinc-300 rounded-xl shadow-2xl space-y-1 font-sans">
                                            <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                                                <Layers className="w-3.5 h-3.5" />
                                                <span>Active Cell Unit Details</span>
                                            </div>
                                            <p className="text-[11px] leading-relaxed">
                                                ID: <span className="text-white font-mono break-all">{cell.id}</span>
                                            </p>
                                            <p className="text-[11px] leading-relaxed">
                                                Generation <strong className="text-white">G{cell.generation}</strong> cellular unit. Mitosis occurs on completing cycle M stage.
                                            </p>
                                            {isNft && (
                                                <div className="pt-1.5 mt-1 border-t border-zinc-800 text-[10px] text-amber-300 flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-amber-500" />
                                                    <span>Premium Bio-NFT: {cell.nftUri}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Top card row: Name and Rarity */}
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-1 text-[8px] text-zinc-500 uppercase font-black tracking-widest">
                                                    <span>GEN {cell.generation} CELL</span>
                                                </div>
                                                <h4 className={`text-xs uppercase tracking-tight break-words truncate max-w-[120px] ${nameColor}`}>
                                                    {isNft ? cell.nftUri : cell.id}
                                                </h4>
                                            </div>
                                            
                                            <div className="px-1.5 py-0.5 bg-black/60 border border-zinc-800 rounded text-[7px] font-black text-zinc-400 uppercase">
                                                G{cell.generation}
                                            </div>
                                        </div>

                                        {/* Center Metrics Visual */}
                                        <div className="py-2 flex items-center gap-3">
                                            <div className="relative cursor-help">
                                                <HexMetric size="sm" value={cell.cph} colorClass={isNft ? "border-purple-600 text-purple-400" : "border-amber-600 text-amber-500"} glow={cycle.phase === 'M'} />
                                            </div>
                                            
                                            <div className="flex-1 space-y-1 text-left">
                                                <div className="flex justify-between text-[7px] font-bold text-zinc-500 uppercase tracking-tighter">
                                                    <span>ATP Reserve</span>
                                                    <span>{cell.atp}</span>
                                                </div>
                                                <div className="h-1.5 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full bg-gradient-to-r ${isNft ? 'from-purple-600 to-cyan-400' : 'from-green-600 to-emerald-400'}`} 
                                                        style={{ width: `${Math.min(100, cell.atp / 25)}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Holographic glowing lines for high rarity NFTs */}
                                        {isNft && (
                                            <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,transparent_50%,rgba(255,255,255,0.04)_100%)]" />
                                        )}

                                        {/* Action: Mint NFT Button */}
                                        <div className="mt-3 pt-2.5 border-t border-zinc-900 flex justify-between items-center gap-2">
                                            {isNft ? (
                                                <span className="text-[7px] font-black text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-0.5 uppercase tracking-wider animate-pulse">
                                                    <Star className="w-2 h-2 text-amber-400" /> Minted {cell.rarity}
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleMintCellNft(cell.id)}
                                                    className="w-full text-[8px] font-bold py-1 bg-gradient-to-r from-zinc-900 to-zinc-950 hover:from-cyan-950 hover:to-[#0a0f26] border border-zinc-800 hover:border-cyan-500/50 text-zinc-400 hover:text-cyan-400 rounded-lg flex items-center justify-center gap-1 uppercase transition-all duration-150 cursor-pointer"
                                                    title="Tokenize this biological cell configuration as a unique holographic Bio-NFT ledger block"
                                                >
                                                    <Sparkles className="w-2.5 h-2.5 text-cyan-500" />
                                                    <span>Mint Bio-NFT</span>
                                                </button>
                                            )}

                                            {/* DNA indicator markers */}
                                            <div className="flex gap-1">
                                                {['DNA', 'MEM', 'MIT'].map(org => (
                                                    <span 
                                                        key={org} 
                                                        className={`w-1.5 h-1.5 rounded-sm transition-colors duration-200 ${isNft ? 'bg-purple-900/50 group-hover:bg-cyan-500' : 'bg-zinc-800 group-hover:bg-amber-600'}`} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Reset Genesis Block card */}
                            <button 
                                onClick={() => {
                                    setCells([{ id: 'genesis_' + Date.now(), cph: 100, atp: 1000, generation: 0 }]);
                                    toast.info('Grid reset to standard Genesis Prime cell.');
                                }}
                                className="border border-dashed border-zinc-800 hover:border-red-600 hover:bg-red-950/10 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px] text-zinc-600 hover:text-red-500 transition-all duration-200 group relative cursor-pointer"
                            >
                                {/* Tooltip for Reset */}
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:block z-50 w-52 p-3 bg-[#0d0d1e] border border-red-500 text-xs text-red-200 rounded-xl shadow-2xl space-y-1 font-sans">
                                    <div className="font-bold text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>Reset Genesis Engine</span>
                                    </div>
                                    <p>Clears active cellular structures and spawns a single high-integrity seed on generation tier 0.</p>
                                </div>

                                <Zap className="w-8 h-8 mb-2 text-zinc-700 group-hover:text-red-500 group-hover:scale-110 transition-all animate-bounce" />
                                <span className="text-[9px] font-black uppercase tracking-wider">Reset Genesis</span>
                            </button>
                        </div>
                    </div>

                    {/* Quantum Asset Deep Scanner Panel */}
                    <div className="bg-[#070712] border border-zinc-800 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-3 border-b border-zinc-900 pb-2">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">AetherOS Deep Asset Scanner</h3>
                            </div>
                            <span className="text-[8px] text-emerald-400 uppercase font-bold px-1.5 py-0.5 bg-emerald-950/20 border border-emerald-900 rounded">
                                Bio-Scanner Active
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                            {/* Controller side */}
                            <div className="md:col-span-4 flex flex-col justify-between p-3 bg-black/40 border border-zinc-800 rounded-xl space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-[10px] text-zinc-400 uppercase font-black">Scanning Matrix Node</h4>
                                    <p className="text-[9px] text-zinc-500 leading-relaxed">
                                        Deep scan analyzes memory registers, storage buffers, and cell structures to uncover dormant assets and security credentials.
                                    </p>
                                </div>

                                <button
                                    onClick={handleStartDeepScan}
                                    disabled={isScanning}
                                    className={`w-full py-2.5 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                        isScanning 
                                            ? 'bg-zinc-900 border-zinc-800 text-zinc-600' 
                                            : 'bg-emerald-950/30 hover:bg-emerald-950/60 border-emerald-500/40 hover:border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                    }`}
                                >
                                    {isScanning ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Scanning Manifold...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                                            <span>Perform Deep Scan</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Logs Display / Progress */}
                            <div className="md:col-span-8 flex flex-col justify-between p-3 bg-black/60 border border-zinc-900 rounded-xl font-mono text-[9px] min-h-[140px]">
                                {isScanning || scanLogs.length > 0 ? (
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="space-y-1 max-h-[100px] overflow-y-auto custom-scrollbar text-emerald-500">
                                            {scanLogs.map((log, i) => (
                                                <div key={i} className="flex gap-1">
                                                    <span className="text-zinc-600">[{i+1}]</span>
                                                    <span>{log}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Progress bar overlay */}
                                        <div className="pt-2 border-t border-zinc-900 mt-2">
                                            <div className="flex justify-between text-[8px] text-zinc-500 font-bold mb-1">
                                                <span>SCAN_PROGRESS</span>
                                                <span>{scanProgress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 transition-all duration-150" style={{ width: `${scanProgress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-600 py-4">
                                        <Search className="w-8 h-8 text-zinc-800 mb-2" />
                                        <p className="uppercase font-black tracking-widest text-[8px]">Scan registers empty</p>
                                        <p className="text-[8px] text-zinc-600 max-w-xs mt-1">
                                            Initiate Deep Scan of localized system resources above to identify unlocked credentials and high-value cell seeds.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scan Rewards Portal (Unlocked after Scan) */}
                        {(scanRewards.hasLegendarySeed || scanRewards.hasBoostAvailable || scanRewards.unlockedCredentials.length > 0) && (
                            <div className="mt-4 p-3 bg-[#0a0a19] border border-emerald-500/20 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                    <h4 className="text-[10px] text-white font-bold uppercase tracking-wider">Discovered Scan Payloads</h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Reward 1: Seed cell */}
                                    <div className="bg-black/40 border border-zinc-800 p-2 rounded-lg flex flex-col justify-between gap-2">
                                        <div>
                                            <div className="text-[7px] text-purple-400 font-bold uppercase">Lattice Asset</div>
                                            <p className="text-[10px] text-zinc-300 font-bold mt-0.5">Synthesis Prime Seed</p>
                                            <p className="text-[8px] text-zinc-500">Unminted legendary cell core discovered.</p>
                                        </div>
                                        <button
                                            disabled={!scanRewards.hasLegendarySeed}
                                            onClick={handleInjectLegendarySeed}
                                            className={`text-[8px] font-black uppercase py-1 px-2 border rounded-md text-center transition-all ${
                                                scanRewards.hasLegendarySeed 
                                                    ? 'bg-purple-950/40 border-purple-500 text-purple-300 hover:bg-purple-900/30' 
                                                    : 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed'
                                            }`}
                                        >
                                            {scanRewards.hasLegendarySeed ? 'Inject Seed' : 'Injected ✓'}
                                        </button>
                                    </div>

                                    {/* Reward 2: ATP Booster */}
                                    <div className="bg-black/40 border border-zinc-800 p-2 rounded-lg flex flex-col justify-between gap-2">
                                        <div>
                                            <div className="text-[7px] text-amber-400 font-bold uppercase">Energy Booster</div>
                                            <p className="text-[10px] text-zinc-300 font-bold mt-0.5">+500 ATP Injection</p>
                                            <p className="text-[8px] text-zinc-500">Stimulate cellular growth loops immediately.</p>
                                        </div>
                                        <button
                                            disabled={!scanRewards.hasBoostAvailable}
                                            onClick={handleTriggerAtpBoost}
                                            className={`text-[8px] font-black uppercase py-1 px-2 border rounded-md text-center transition-all ${
                                                scanRewards.hasBoostAvailable 
                                                    ? 'bg-amber-950/40 border-amber-500 text-amber-300 hover:bg-amber-900/30' 
                                                    : 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed'
                                            }`}
                                        >
                                            {scanRewards.hasBoostAvailable ? 'Trigger Boost' : 'Triggered ✓'}
                                        </button>
                                    </div>

                                    {/* Reward 3: Recovered Credentials */}
                                    <div className="bg-black/40 border border-zinc-800 p-2 rounded-lg flex flex-col justify-between">
                                        <div>
                                            <div className="text-[7px] text-cyan-400 font-bold uppercase">Mesh Credentials</div>
                                            <p className="text-[10px] text-zinc-300 font-bold mt-0.5">Audit Tokens</p>
                                        </div>
                                        <div className="space-y-0.5 text-[7px] text-zinc-500 font-mono mt-1">
                                            <div>✓ AUTH-9226 (DECRYPTED)</div>
                                            <div>✓ FILE-6310 (DECRYPTED)</div>
                                            <div>✓ NETW-2704 (DECRYPTED)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Persistent Snapshots + Bio-NFT ledger (4 cols on wide) */}
                <div className="xl:col-span-4 space-y-4">
                    
                    {/* Persistent Snapshot Save/Load Module */}
                    <div className="bg-[#070712] border border-zinc-800 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3 border-b border-zinc-900 pb-2">
                            <Database className="w-4 h-4 text-purple-400" />
                            <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Firestore Memory Vault</h3>
                        </div>

                        {/* Save state Form */}
                        <form onSubmit={handleSaveSnapshot} className="space-y-2 mb-4 bg-black/40 border border-zinc-900 p-3 rounded-xl">
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] text-zinc-400 uppercase font-black flex items-center justify-between">
                                    <span>Record Current Snapshot</span>
                                    <span title="Input a memorable snapshot label to persist these cell models into Firestore.">
                                        <HelpCircle className="w-3 h-3 text-zinc-600 cursor-help" />
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={newSnapshotName}
                                    onChange={(e) => setNewSnapshotName(e.target.value)}
                                    placeholder="Enter snapshot name..."
                                    maxLength={40}
                                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg px-2 py-1.5 text-[10px] text-white placeholder-zinc-600 transition-all font-mono outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSavingSnapshot}
                                className="w-full py-1.5 bg-gradient-to-r from-purple-950 to-purple-900 hover:from-purple-900 hover:to-purple-800 text-white font-bold text-[9px] uppercase border border-purple-500/30 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                            >
                                <Save className="w-3 h-3" />
                                <span>{isSavingSnapshot ? 'Writing to Db...' : 'Commit to Firestore'}</span>
                            </button>
                        </form>

                        {/* Saved Snapshots register */}
                        <div className="space-y-2">
                            <h4 className="text-[9px] text-zinc-500 uppercase font-bold flex items-center justify-between">
                                <span>Saved Snapshot Ledger</span>
                                <button 
                                    type="button"
                                    onClick={loadSnapshots}
                                    className="hover:text-cyan-400 transition-colors cursor-pointer p-0.5"
                                    title="Reload snapshot records from Cloud Firestore Database"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                </button>
                            </h4>

                            {isLoadingSnapshots ? (
                                <div className="text-center py-4 text-zinc-600 text-[10px] uppercase font-bold animate-pulse">
                                    <span>Syncing with Cloud Firestore...</span>
                                </div>
                            ) : snapshots.length === 0 ? (
                                <div className="text-center py-4 text-zinc-600 text-[9px] bg-black/20 border border-dashed border-zinc-900 rounded-xl uppercase">
                                    <span>No saved states found</span>
                                </div>
                            ) : (
                                <div className="space-y-1.5 max-h-[170px] overflow-y-auto custom-scrollbar pr-1">
                                    {snapshots.map((snap) => (
                                        <div 
                                            key={snap.id} 
                                            className="p-2 bg-black/40 border border-zinc-900 rounded-xl flex items-center justify-between gap-2 hover:border-zinc-700 transition-all"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[9px] text-zinc-300 font-bold truncate block">{snap.name}</span>
                                                    <span className="text-[7px] text-red-500 font-black uppercase tracking-tighter bg-red-950/30 border border-red-900/40 px-1 py-[1px] rounded flex-shrink-0">
                                                        Phase_{snap.phase}
                                                    </span>
                                                </div>
                                                <span className="text-[7px] text-zinc-600 block mt-0.5 font-sans">
                                                    {new Date(snap.timestamp).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => handleLoadSnapshotCells(snap)}
                                                    className="p-1 hover:bg-zinc-800 border border-zinc-800 text-cyan-400 hover:text-cyan-300 rounded transition-all cursor-pointer"
                                                    title="Restore this cell state configuration immediately to the active matrix viewer"
                                                >
                                                    <Download className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSnapshot(snap.id, snap.name)}
                                                    className="p-1 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-900 text-rose-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                                                    title="Delete this snapshot state record from Cloud Firestore permanently"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio-NFT Ledger Block */}
                    <div className="bg-[#070712] border border-zinc-800 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3 border-b border-zinc-900 pb-2">
                            <Star className="w-4 h-4 text-amber-400" />
                            <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Bio-NFT Ledger Portfolio</h3>
                        </div>

                        {mintedNfts.length === 0 ? (
                            <div className="text-center py-6 text-zinc-600 text-[9px] bg-black/20 border border-dashed border-zinc-900 rounded-xl uppercase">
                                <span>No minted NFTs on ledger</span>
                            </div>
                        ) : (
                            <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                                {mintedNfts.map((nft, i) => {
                                    let badgeColor = 'text-slate-400 border-slate-800';
                                    if (nft.rarity === 'UNCOMMON') badgeColor = 'text-emerald-400 border-emerald-900/50';
                                    if (nft.rarity === 'RARE') badgeColor = 'text-blue-400 border-blue-900/50';
                                    if (nft.rarity === 'LEGENDARY') badgeColor = 'text-purple-400 border-purple-900/50';
                                    if (nft.rarity === 'ETERNAL') badgeColor = 'text-amber-400 border-amber-900/50 animate-pulse';

                                    return (
                                        <div 
                                            key={nft.id + '_' + i} 
                                            className="p-2 bg-gradient-to-r from-zinc-950 to-[#060614] border border-zinc-900 rounded-xl flex items-center justify-between gap-2"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] text-white font-bold truncate block">{nft.nftUri}</span>
                                                    <span className={`text-[6px] font-bold uppercase tracking-widest border px-1 py-[1px] rounded ${badgeColor}`}>
                                                        {nft.rarity}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[7px] text-zinc-500 mt-0.5">
                                                    <span>TOKEN_ID: {nft.nftId}</span>
                                                    <span>•</span>
                                                    <span>{nft.cph} CPH</span>
                                                </div>
                                                {nft.companionSynergyName && (
                                                    <div className="mt-1.5 pt-1.5 border-t border-zinc-900 flex flex-col gap-1 text-[8px]">
                                                        <div className="text-purple-400 font-bold">🛡️ Companion: <span className="text-zinc-300 font-sans">{nft.companionSynergyName}</span></div>
                                                        <div className="text-zinc-500 italic leading-snug">{nft.companionSynergyEffect}</div>
                                                        <div className="text-cyan-400 font-bold mt-1">⚡ User Synergy: <span className="text-zinc-300 font-sans">{nft.userSynergyName}</span></div>
                                                        <div className="text-zinc-500 italic leading-snug">{nft.userSynergyEffect}</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-[8px] text-zinc-500 text-right flex-shrink-0">
                                                G{nft.generation} Node
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* Matrix Footer */}
            <div className="p-3 bg-[#030309] border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center px-4 gap-2">
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase">
                    <span className="relative group cursor-help">
                        {/* Hover Tooltip for Conservation */}
                        <div className="absolute left-0 bottom-6 hidden group-hover:block z-50 w-56 p-2 bg-[#0d0d1e] border border-cyan-500 text-[10px] text-cyan-200 rounded-lg shadow-xl font-sans normal-case">
                            Biological conservation index validates that total cellular metrics split cleanly and stay balanced.
                        </div>
                        Conservation: <strong className="text-zinc-400">100 = {cells.reduce((a, b) => a + b.cph, 0)} ✓</strong>
                    </span>
                    <div className="h-3 w-px bg-zinc-800" />
                    <span className="text-red-500 tracking-tighter">7 - 7 + 7 = 8 Manifold Loop</span>
                </div>
                <div className="text-[9px] text-zinc-600 font-bold italic uppercase tracking-wider flex items-center gap-1">
                    <span>AetherOS Biosecurity Module V4.2</span>
                </div>
            </div>
        </div>
    );
};
