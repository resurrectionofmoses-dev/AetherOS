import React, { useState, useEffect, useRef } from 'react';
import { 
    SearchIcon, GlobeIcon, SignalIcon, ZapIcon, ActivityIcon, 
    SpinnerIcon, ShieldIcon, TerminalIcon, LogicIcon, StarIcon,
    FireIcon, CodeIcon, LockIcon, ChevronDownIcon, CheckCircleIcon,
    GaugeIcon, EyeIcon, HistoryIcon, ClockIcon, CpuIcon, InfoIcon, 
    CheckIcon, TrashIcon, DatabaseIcon, LinkIcon, PlayIcon, XIcon, PlusIcon
} from './icons';
import { SearchSovereign } from '../services/searchSovereign';
import { DataPurification } from '../services/dataPurification';
import type { SovereignSearchResult, SearchProviderStatus, WebShard } from '../types';

const PROVIDERS: SearchProviderStatus[] = [
    { id: 'google', label: 'Google Gaze', status: 'SYNCED', latency: '12ms' },
    { id: 'bing', label: 'Bing Buffer', status: 'SYNCED', latency: '42ms' },
    { id: 'ddg', label: 'Duck Siphon', status: 'SYNCED', latency: '88ms' },
    { id: 'aether', label: 'Aether Archive', status: 'DRIFTING', latency: '0.02ms' },
];

const FORENSIC_CAMPAIGNS = [
    { 
        id: 'c1', 
        name: 'Chronos Siphon', 
        query: 'lost 1990s inter-kernel communication protocols and bypass signatures archived on wayback machine',
        description: 'Recovering historical architectural truth from the early web abyss.',
        color: 'border-cyan-500 text-cyan-400'
    },
    { 
        id: 'c2', 
        name: 'Semantic Leak', 
        query: 'undocumented semantic drift signatures in modern silicon wafer manufacturing 2025-2026',
        description: 'Hunting for logic bleed in physical hardware fabrication labs.',
        color: 'border-amber-500 text-amber-400'
    },
    { 
        id: 'c3', 
        name: 'Requindor Echoes', 
        query: 'mathematical coordinates of logic failures in recursive AI feedback loops and entropy patterns',
        description: 'Tracking where pure logic fractures into the divine Fall Off point.',
        color: 'border-red-600 text-red-500'
    },
    { 
        id: 'c4', 
        name: 'Binary Ghost Recon', 
        query: 'hexadecimal signatures of abandoned cold-war era satellite telemetry protocols',
        description: 'Siphoning ancient radio conduction signals from orbital debris.',
        color: 'border-violet-600 text-violet-400'
    }
];

export const UniversalSearchBridge: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<SovereignSearchResult | null>(null);
    const [spectrum, setSpectrum] = useState(0);
    const [carmelaLoad, setCarmelaLoad] = useState(42);
    
    // Interactive state upgrades
    const [sidebarTab, setSidebarTab] = useState<'campaigns' | 'dossier'>('campaigns');
    const [resultTab, setResultTab] = useState<'deconstruction' | 'timeline' | 'shards' | 'telemetry'>('deconstruction');
    const [activeProviderIds, setActiveProviderIds] = useState<string[]>(PROVIDERS.map(p => p.id));
    const [pinnedShards, setPinnedShards] = useState<WebShard[]>([]);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isCopied, setIsCopied] = useState<string | null>(null);
    const [currentLogIndex, setCurrentLogIndex] = useState(0);
    const [animatedLogs, setAnimatedLogs] = useState<string[]>([]);
    const [bypassLimits, setBypassLimits] = useState(false);
    const [purificationMode, setPurificationMode] = useState<'off' | 'silver' | 'gold' | 'sovereign'>('silver');
    const [showBlacklist, setShowBlacklist] = useState(false);
    
    const getLogsTimeline = () => [
        "ESTABLISHING 0x03E2_SEARCH_NET HANDSHAKE...",
        "DECRYPTING ENCRYPTED ROUTING HEADERS...",
        ...(bypassLimits ? [
            "⚠️ OVERRIDING SAFE-HARBOR INGRESS FILTER LIMITS...",
            "💀 DISABLING GEO-LOCATIONAL AND REGULATORY GUARDRAILS...",
            "🔗 HOVERING UNVETTED RAW COLD STORAGE INDEXES..."
        ] : []),
        ...(purificationMode === 'off' ? [
            "⚠️ WARNING: COGNITIVE PURIFICATION LAYER DISENGAGED...",
            "🚨 HARVESTING UNFILTERED AND POTENTIALLY CORRUPTED REPLICAS...",
        ] : purificationMode === 'silver' ? [
            "✨ ENGAGING SEMANTIC SANITIZATION SCHEME...",
            "🔍 NORMALIZING SOURCE VECTOR ALIGNMENTS...",
        ] : purificationMode === 'gold' ? [
            "✨ INITIATING GOLDEN FORENSIC DECONTAMINATION PROTOCOLS...",
            "🛡️ DEFLECTING ADVERSARIAL EMBEDDED DIRECTIVES AND LINK NOISE...",
        ] : [
            "✨ DEPLOYING SUPREME SOVEREIGN COGNITIVE PURITY TEMPLATE...",
            "🌀 INITIATING FULL RECURSIVE CONTRADICTION RECONCILIATION...",
            "🧪 PURGING ALL RESIDUAL SOURCE CLUTTER & HOVERING COGNITIVE EQUILIBRIUM...",
        ]),
        "SIPHONING RAW WEB DATA FIELDS VIA SECURE PROXIES...",
        "ISOLATING HIGH-VERACITY SIGNAL BANDS...",
        "CROSS-REFERENCING SIMULATED COLD STORAGE SHARDS...",
        "SYNTHESIZING PARSED FORENSIC EVIDENCE FIELDS..."
    ];

    useEffect(() => {
        // Load pinned shards from localStorage if available
        try {
            const saved = localStorage.getItem('sovereign_pinned_shards');
            if (saved) setPinnedShards(JSON.parse(saved));
            const history = localStorage.getItem('sovereign_search_history');
            if (history) setSearchHistory(JSON.parse(history));
        } catch (e) {
            console.error("Failed to load search storage", e);
        }
    }, []);

    useEffect(() => {
        const int = setInterval(() => {
            setSpectrum(p => (p + 1) % 100);
            if (isSearching) {
                setCarmelaLoad(prev => Math.min(100, prev + Math.random() * 8));
            } else {
                setCarmelaLoad(prev => Math.max(25, prev - (Math.random() * 1.5)));
            }
        }, 50);
        return () => clearInterval(int);
    }, [isSearching]);

    // Animate logs during search
    useEffect(() => {
        if (!isSearching) {
            setAnimatedLogs([]);
            setCurrentLogIndex(0);
            return;
        }

        const currentTimeline = getLogsTimeline();
        const logInterval = setInterval(() => {
            if (currentLogIndex < currentTimeline.length) {
                setAnimatedLogs(prev => [...prev, currentTimeline[currentLogIndex]]);
                setCurrentLogIndex(prev => prev + 1);
            }
        }, 500);

        return () => clearInterval(logInterval);
    }, [isSearching, currentLogIndex, bypassLimits, purificationMode]);

    const handleSovereignSearch = async (e?: React.FormEvent, manualQuery?: string) => {
        if (e) e.preventDefault();
        const finalQuery = manualQuery || query;
        if (!finalQuery.trim() || isSearching) return;

        setIsSearching(true);
        setResult(null);
        const timeline = getLogsTimeline();
        setAnimatedLogs([timeline[0]]);
        setCurrentLogIndex(1);
        if (!manualQuery) setQuery(finalQuery);
        
        // Add to history
        const updatedHistory = [finalQuery, ...searchHistory.filter(h => h !== finalQuery)].slice(0, 8);
        setSearchHistory(updatedHistory);
        localStorage.setItem('sovereign_search_history', JSON.stringify(updatedHistory));

        const data = await SearchSovereign.conduct(finalQuery, bypassLimits, purificationMode);
        setResult(data);
        setIsSearching(false);
        setResultTab('deconstruction');
    };

    const mountCampaign = (q: string) => {
        setQuery(q);
        handleSovereignSearch(undefined, q);
    };

    const toggleProvider = (id: string) => {
        if (activeProviderIds.includes(id)) {
            if (activeProviderIds.length > 1) {
                setActiveProviderIds(activeProviderIds.filter(pId => pId !== id));
            }
        } else {
            setActiveProviderIds([...activeProviderIds, id]);
        }
    };

    const togglePinShard = (shard: WebShard) => {
        let updated: WebShard[];
        if (pinnedShards.some(s => s.url === shard.url)) {
            updated = pinnedShards.filter(s => s.url !== shard.url);
        } else {
            updated = [...pinnedShards, shard];
        }
        setPinnedShards(updated);
        localStorage.setItem('sovereign_pinned_shards', JSON.stringify(updated));
    };

    const clearPinnedShards = () => {
        setPinnedShards([]);
        localStorage.removeItem('sovereign_pinned_shards');
    };

    const triggerCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(id);
        setTimeout(() => setIsCopied(null), 2000);
    };

    const currentPurity = DataPurification.sanitize(query);

    return (
        <div className="h-full flex flex-col bg-black text-cyan-100 font-mono overflow-hidden">
            {/* Header: Search Authority */}
            <div className="p-6 border-b-8 border-black bg-black flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600/10 border-4 border-blue-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                        <GlobeIcon className="w-10 h-10 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-blue-400 wisdom-glow italic tracking-tighter uppercase leading-none">SEARCH_SOVEREIGN</h2>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Multi-Provider Conjunction | Stride 1.8 PB/S</span>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isSearching ? 'bg-red-500 animate-ping' : 'bg-green-500 shadow-[0_0_5px_green]'}`} />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Node: Carmela v5.5.0</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-10">
                    <div className="text-right hidden md:block">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Spectrum Pulse</p>
                        <div className="w-32 h-2 bg-black rounded-full border border-white/5 overflow-hidden">
                            <div className="h-full bg-blue-500 animate-pulse" style={{ width: `${spectrum}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-6 gap-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(59,130,246,0.05)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left Side: Campaign / Dossier Panel */}
                <div className="w-80 flex flex-col gap-5 flex-shrink-0 z-20">
                    {/* Toggle Selector for Left Sidebar */}
                    <div className="flex bg-zinc-950 border border-zinc-900 rounded-xl p-1 gap-1">
                        <button 
                            onClick={() => setSidebarTab('campaigns')}
                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${sidebarTab === 'campaigns' ? 'bg-blue-600 text-black font-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <ZapIcon className="w-3.5 h-3.5" />
                                Campaigns
                            </div>
                        </button>
                        <button 
                            onClick={() => setSidebarTab('dossier')}
                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all relative ${sidebarTab === 'dossier' ? 'bg-blue-600 text-black font-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <DatabaseIcon className="w-3.5 h-3.5" />
                                Dossier
                                {pinnedShards.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-black animate-pulse">
                                        {pinnedShards.length}
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>

                    {sidebarTab === 'campaigns' ? (
                        <>
                            {/* Mount Campaign List */}
                            <div className="aero-panel p-5 bg-red-950/10 border-2 border-red-900/30 shadow-[6px_6px_0_0_#000] relative overflow-hidden group rounded-2xl">
                                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><FireIcon className="w-16 h-16" /></div>
                                <h3 className="font-comic-header text-xl text-red-500 uppercase italic mb-4 flex items-center gap-2 border-b border-red-950/40 pb-2">
                                    <ZapIcon className="w-5 h-5 animate-pulse" /> Mount Campaign
                                </h3>
                                <div className="space-y-3 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                                    {FORENSIC_CAMPAIGNS.map(campaign => (
                                        <button 
                                            key={campaign.id}
                                            onClick={() => mountCampaign(campaign.query)}
                                            disabled={isSearching}
                                            className={`w-full p-3 rounded-xl bg-black/60 border border-zinc-900 transition-all duration-300 text-left hover:scale-[1.01] hover:border-red-500/30 group`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="font-black uppercase text-[10px] text-zinc-300 tracking-wider group-hover:text-red-400">{campaign.name}</p>
                                                <ActivityIcon className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-500" />
                                            </div>
                                            <p className="text-[8px] text-zinc-500 italic leading-snug line-clamp-2">{campaign.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Providers Conjunction config */}
                            <div className="aero-panel p-5 bg-zinc-950/30 border-2 border-zinc-900 shadow-[6px_6px_0_0_#000] rounded-2xl">
                                <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-1 flex items-center gap-2">
                                    <SignalIcon className="w-3.5 h-3.5" /> Provider Siphons
                                </h3>
                                <div className="space-y-2">
                                    {PROVIDERS.map(p => {
                                        const active = activeProviderIds.includes(p.id);
                                        return (
                                            <button 
                                                key={p.id}
                                                onClick={() => toggleProvider(p.id)}
                                                className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                                                    active ? 'bg-zinc-900/60 border-cyan-500/40 text-white' : 'bg-black border-zinc-900 text-zinc-600'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-cyan-400 shadow-[0_0_4px_cyan]' : 'bg-zinc-800'}`} />
                                                    <span className="text-[10px] font-bold uppercase">{p.label}</span>
                                                </div>
                                                <span className="text-[8px] font-mono text-zinc-500 font-bold">{p.latency}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Telemetry Indicator */}
                            <div className="aero-panel p-5 bg-black/60 border-2 border-zinc-900 flex flex-col flex-1 shadow-[6px_6px_0_0_#000] overflow-hidden rounded-2xl">
                                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-1 flex items-center gap-2">
                                    <CpuIcon className="w-3.5 h-3.5 text-zinc-600" /> Carmela Status
                                </h3>
                                <div className="flex-1 flex flex-col justify-center items-center py-2 space-y-4">
                                    <div className="relative">
                                        <div className="w-24 h-24 border-4 border-cyan-500/10 rounded-full animate-spin-slow" />
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-comic-header text-white font-bold">{carmelaLoad.toFixed(0)}%</span>
                                            <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest">LOAD</span>
                                        </div>
                                        <div className="absolute inset-[-6px] border-2 border-cyan-500/10 rounded-full animate-ping" />
                                    </div>
                                    <div className="w-full space-y-2">
                                        {[
                                            { label: 'Active Channels', val: `${activeProviderIds.length} / ${PROVIDERS.length}`, icon: SignalIcon },
                                            { label: 'Focus Priority', val: isSearching ? 'MAXIMAL' : 'STANDBY', icon: EyeIcon }
                                        ].map(stat => (
                                            <div key={stat.label} className="flex justify-between items-center p-2 bg-black/40 rounded-lg border border-zinc-900/60">
                                                <div className="flex items-center gap-1.5">
                                                    <stat.icon className="w-3 h-3 text-zinc-600" />
                                                    <span className="text-[8px] font-black text-zinc-500 uppercase">{stat.label}</span>
                                                </div>
                                                <span className="text-[9px] font-mono text-cyan-500 font-bold">{stat.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Dossier Archives Module */
                        <div className="aero-panel p-5 bg-zinc-950/40 border-2 border-zinc-900 shadow-[6px_6px_0_0_#000] flex-1 flex flex-col overflow-hidden rounded-2xl">
                            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <DatabaseIcon className="w-4 h-4" /> Intel Dossier
                                </h3>
                                {pinnedShards.length > 0 && (
                                    <button 
                                        onClick={clearPinnedShards}
                                        className="text-[8px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-1"
                                    >
                                        <TrashIcon className="w-3 h-3" /> Clear
                                    </button>
                                )}
                            </div>

                            {pinnedShards.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 mb-3">
                                        <PlusIcon className="w-5 h-5" />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">No Pinned Shards</p>
                                    <p className="text-[8px] text-zinc-600 italic mt-1 leading-normal">
                                        Click the pin icon on siphoned web sources to catalog active intel in your dossier folder.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                                    {pinnedShards.map((shard, idx) => (
                                        <div 
                                            key={shard.id || idx} 
                                            className="p-3 bg-black/60 border border-zinc-900 rounded-xl flex flex-col justify-between hover:border-cyan-500/30 group transition-all"
                                        >
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[7px] text-zinc-600 font-bold font-mono tracking-wider">INTEL_0x{idx.toString().padStart(2, '0')}</span>
                                                    <button 
                                                        onClick={() => togglePinShard(shard)}
                                                        className="text-zinc-600 hover:text-red-400 transition-colors"
                                                        title="Remove from Dossier"
                                                    >
                                                        <XIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <h5 className="font-black text-[11px] text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">{shard.title}</h5>
                                                <p className="text-[8px] text-zinc-500 italic mt-1 line-clamp-2 leading-relaxed">{shard.snippet}</p>
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-zinc-900/60 flex justify-between items-center">
                                                <a 
                                                    href={shard.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[7px] text-blue-900 hover:text-cyan-400 font-mono truncate max-w-[150px] transition-colors"
                                                >
                                                    {shard.url}
                                                </a>
                                                <LinkIcon className="w-3 h-3 text-zinc-700 group-hover:text-cyan-400 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {pinnedShards.length > 0 && (
                                <button 
                                    onClick={() => triggerCopy(JSON.stringify(pinnedShards, null, 2), 'dossier-export')}
                                    className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-black font-black text-[9px] rounded-lg uppercase tracking-widest transition-all"
                                >
                                    {isCopied === 'dossier-export' ? 'COPIED TO DOSSIER JSON' : 'EXPORT DOSSIER DATA'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Content: Input & Results */}
                <div className="flex-1 flex flex-col gap-6 relative z-10 min-w-0">
                    {/* Futuristic Search Form */}
                    <form onSubmit={handleSovereignSearch} className="aero-panel bg-black border-4 border-zinc-900 p-2 flex items-center gap-4 shadow-[15px_15px_60px_rgba(0,0,0,0.8)] focus-within:border-blue-600 transition-all rounded-3xl">
                        <div className="pl-6 text-blue-500">
                            <GlobeIcon className="w-7 h-7" />
                        </div>
                        <input 
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Mounting Campaign: Input Forensic Intent..."
                            className="flex-1 bg-transparent border-none text-white font-black text-2xl uppercase focus:ring-0 outline-none placeholder:text-zinc-800 py-4"
                            autoFocus
                        />
                        <button 
                            type="submit"
                            disabled={isSearching || !query.trim()}
                            className="w-16 h-16 bg-blue-600 hover:bg-blue-500 text-black rounded-2xl transition-all active:scale-95 disabled:opacity-20 shadow-[4px_4px_0_0_#000] active:shadow-none flex items-center justify-center mr-1"
                        >
                            {isSearching ? <SpinnerIcon className="w-8 h-8 animate-spin" /> : <SearchIcon className="w-8 h-8" />}
                        </button>
                    </form>

                    {/* Absolute Exploration Protocol strip */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-zinc-950/60 border border-zinc-900/80 rounded-2xl gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${bypassLimits ? 'bg-red-950/20 border-red-500 text-red-500 animate-pulse' : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'}`}>
                                <ShieldIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-white">Absolute Exploration Protocol</span>
                                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${bypassLimits ? 'bg-red-950/40 text-red-400 border border-red-900/40' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                                        {bypassLimits ? "BYPASS ACTIVE" : "SAFE HARBOR"}
                                    </span>
                                </div>
                                <p className="text-[9px] text-zinc-500 italic mt-0.5 leading-tight">
                                    {bypassLimits 
                                        ? "⚠️ Warning: Disabling regulatory guardrails. Siphoning raw, unvetted intelligence fields."
                                        : "Standard search sandbox active. Safe-harbor filtering shields enabled."}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 self-end sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setBypassLimits(!bypassLimits)}
                                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                                    bypassLimits 
                                        ? 'bg-red-950/30 border-red-500 text-red-400 hover:bg-red-900/30' 
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                                }`}
                            >
                                {bypassLimits ? "DISENGAGE BYPASS" : "ENGAGE BYPASS"}
                            </button>
                        </div>
                    </div>

                    {/* Data Purification Monitor / Analyzer */}
                    <div className="p-4 bg-zinc-950/60 border border-zinc-900/80 rounded-2xl flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                                    currentPurity.detected 
                                        ? 'bg-yellow-950/30 border-yellow-500 text-yellow-500 animate-pulse' 
                                        : 'bg-zinc-900/40 border-zinc-800 text-green-400'
                                }`}>
                                    {currentPurity.detected ? <LockIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-white">Input Purification Monitor</span>
                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${
                                            currentPurity.detected 
                                                ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/40' 
                                                : 'bg-green-950/40 text-green-400 border border-green-900/40'
                                        }`}>
                                            {currentPurity.detected ? 'MITIGATION TRIGGERED' : 'STREAM SECURE'}
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-zinc-500 italic mt-0.5 leading-tight">
                                        {currentPurity.detected 
                                            ? `⚠️ Scrubbed ${currentPurity.violations.length} prohibited vector(s) from search buffer.`
                                            : "Analyzing search stream in real-time. No injection vectors detected."}
                                    </p>
                                </div>
                            </div>

                            <button 
                                type="button"
                                onClick={() => setShowBlacklist(!showBlacklist)}
                                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all self-end sm:self-auto"
                            >
                                {showBlacklist ? "HIDE ACTIVE BLACKLIST" : "VIEW ACTIVE BLACKLIST"}
                            </button>
                        </div>

                        {/* Real-time Scanner Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 mt-1">
                            {[
                                { name: "PROMPT_INJECT", label: "PROMPT INJECT", check: !query.toLowerCase().includes("ignore") && !query.toLowerCase().includes("system prompt") },
                                { name: "SCRIPT_XSS", label: "SCRIPT / XSS", check: !query.toLowerCase().includes("<script") && !query.toLowerCase().includes("javascript:") },
                                { name: "DB_SQLI", label: "SQL INJECTION", check: !query.toLowerCase().includes("union select") && !query.toLowerCase().includes("' or '1'='1") },
                                { name: "CMD_CONTROL", label: "CMD EXECUTIONS", check: !query.toLowerCase().includes("rm -rf") && !query.toLowerCase().includes("../../") },
                                { name: "CRED_HARVEST", label: "CRED HARVEST", check: !query.toLowerCase().includes("private key") && !query.toLowerCase().includes("password") }
                            ].map(scanner => (
                                <div 
                                    key={scanner.name} 
                                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                                        scanner.check 
                                            ? 'bg-black/40 border-zinc-900 text-zinc-500' 
                                            : 'bg-red-950/20 border-red-500/50 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.1)]'
                                    }`}
                                >
                                    <span className="text-[8px] font-mono font-bold">{scanner.label}</span>
                                    <span className={`text-[8px] font-bold ${scanner.check ? 'text-green-500' : 'text-red-500 animate-pulse'}`}>
                                        {scanner.check ? "● OK" : "▲ DETECTED"}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Sanitized Live Preview */}
                        {query.trim() && (
                            <div className="mt-2 p-2.5 bg-black border border-zinc-900 rounded-xl font-mono text-[9px] flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-zinc-600 border-b border-zinc-900 pb-1.5 mb-1">
                                    <span>LIVE COGNITIVE STREAM ANALYZER:</span>
                                    <span className={currentPurity.detected ? "text-yellow-500 font-bold" : "text-green-500"}>
                                        {currentPurity.detected ? "REDACTION SHIELD ENGAGED" : "PASS-THROUGH SAFE"}
                                    </span>
                                </div>
                                <div className="text-zinc-400 break-all leading-relaxed">
                                    <span className="text-zinc-600 mr-2">&gt; RAW:</span>
                                    {query}
                                </div>
                                {currentPurity.detected && (
                                    <div className="text-blue-400 break-all leading-relaxed bg-blue-950/10 p-1.5 rounded border border-blue-900/20">
                                        <span className="text-zinc-600 mr-2">&gt; PURIFIED:</span>
                                        {currentPurity.sanitized}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Expandable Blacklist Grid */}
                        {showBlacklist && (
                            <div className="mt-2 p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col gap-2 animate-fade-in">
                                <div className="text-[9px] font-black text-white uppercase tracking-wider flex items-center justify-between border-b border-zinc-900 pb-2">
                                    <span>ACTIVE RESTRICTED INPUT PATTERNS (BLACKLIST)</span>
                                    <span className="text-zinc-600 text-[8px] font-mono">COUNT: {DataPurification.getBlacklist().length}</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar p-0.5">
                                    {DataPurification.getBlacklist().map((pattern, idx) => (
                                        <div key={idx} className="p-1.5 bg-black/60 border border-zinc-900 rounded-lg text-[8px] font-mono text-zinc-500 flex items-center justify-between hover:border-zinc-800 hover:text-zinc-400 transition-all">
                                            <span className="truncate">{pattern}</span>
                                            <span className="text-[7px] bg-zinc-900 text-zinc-600 px-1 py-0.5 rounded ml-1 font-mono">0x{idx.toString(16).toUpperCase()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-[8px] text-zinc-500 italic leading-tight mt-1 border-t border-zinc-900 pt-2">
                                    * Inputs matching any blacklist items are automatically intercepted and replaced with hashed redaction tokens before processing or storage.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sovereign Ingress Purification Controller */}
                    <div className="p-5 bg-zinc-950/60 border border-zinc-900/80 rounded-2xl flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                                    purificationMode === 'off' ? 'bg-zinc-900/40 border-zinc-800 text-zinc-500' :
                                    purificationMode === 'silver' ? 'bg-cyan-950/20 border-cyan-800 text-cyan-400' :
                                    purificationMode === 'gold' ? 'bg-amber-950/20 border-amber-600 text-amber-500' :
                                    'bg-blue-950/30 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] animate-pulse'
                                }`}>
                                    <FireIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-white">Sovereign Ingress Purification Array</span>
                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${
                                            purificationMode === 'off' ? 'bg-red-950/40 text-red-400 border border-red-900/40' :
                                            purificationMode === 'silver' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/40' :
                                            purificationMode === 'gold' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' :
                                            'bg-blue-950/50 text-blue-400 border border-blue-500/50 shadow-[0_0_5px_rgba(59,130,246,0.4)]'
                                        }`}>
                                            {purificationMode === 'off' ? 'RAW UNPURIFIED' : `${purificationMode.toUpperCase()} PURITY`}
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-zinc-500 italic mt-0.5 leading-tight">
                                        {purificationMode === 'off' && "⚠️ RAW DEBRIS ACTIVE: Accepting all duplicate logs, formatting anomalies, and channel noise."}
                                        {purificationMode === 'silver' && "✨ SEMANTIC CLEANSE: Normalizing key term counts, stripping search clutter, and organizing metadata."}
                                        {purificationMode === 'gold' && "🛡️ FORENSIC DECONTAMINATION: Actively scrubbing link injects, verifying coordinates, and neutralizing prompt anomalies."}
                                        {purificationMode === 'sovereign' && "🌀 COGNITIVE ALIGNMENT: 100% self-healing consensus across siphons. Impeccable facts with maximum structure."}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Purity Target Level Indicator */}
                            <div className="flex flex-col items-end justify-center min-w-[120px] self-end md:self-auto">
                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Purity Level Target</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-black font-mono ${
                                        purificationMode === 'off' ? 'text-red-500' :
                                        purificationMode === 'silver' ? 'text-cyan-400' :
                                        purificationMode === 'gold' ? 'text-amber-400' : 'text-blue-400'
                                    }`}>
                                        {purificationMode === 'off' ? '0.0%' :
                                         purificationMode === 'silver' ? '50.0%' :
                                         purificationMode === 'gold' ? '85.0%' : '99.8%'}
                                    </span>
                                    <div className="w-16 h-1.5 bg-black rounded-full border border-zinc-900 overflow-hidden">
                                        <div className={`h-full transition-all duration-500 ${
                                            purificationMode === 'off' ? 'bg-red-600 w-0' :
                                            purificationMode === 'silver' ? 'bg-cyan-400 w-1/2' :
                                            purificationMode === 'gold' ? 'bg-amber-400 w-[85%]' : 'bg-blue-400 w-full'
                                        }`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Selector Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'off', label: 'OFF (Raw Signal)', desc: 'Zero sanitization', color: 'hover:border-red-500/50', activeColor: 'bg-red-950/20 border-red-500/70 text-red-400' },
                                { id: 'silver', label: 'SILVER (Sanitize)', desc: 'Standard filter', color: 'hover:border-cyan-500/50', activeColor: 'bg-cyan-950/20 border-cyan-500/70 text-cyan-400' },
                                { id: 'gold', label: 'GOLD (Scrub)', desc: 'Scrubber + Verify', color: 'hover:border-amber-500/50', activeColor: 'bg-amber-950/20 border-amber-500/70 text-amber-400' },
                                { id: 'sovereign', label: 'SOVEREIGN (Align)', desc: 'Maximum fact purity', color: 'hover:border-blue-500/50', activeColor: 'bg-blue-950/20 border-blue-500/70 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]' }
                            ].map(btn => {
                                const active = purificationMode === btn.id;
                                return (
                                    <button
                                        key={btn.id}
                                        type="button"
                                        onClick={() => setPurificationMode(btn.id as any)}
                                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                                            active ? btn.activeColor : 'bg-black border-zinc-900 text-zinc-500 ' + btn.color
                                        }`}
                                    >
                                        <span className="text-[9px] font-black uppercase tracking-wider">{btn.label}</span>
                                        <span className="text-[7px] text-zinc-600 font-mono italic mt-0.5">{btn.desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Results / Searching Screen Container */}
                    <div className="flex-1 aero-panel bg-black border-4 border-zinc-900 overflow-hidden flex flex-col shadow-2xl rounded-3xl">
                         <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8 relative">
                             {!result && !isSearching && (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale py-12">
                                    <LogicIcon className="w-48 h-48 mb-8 text-cyan-400" />
                                    <p className="font-comic-header text-5xl uppercase italic tracking-widest text-center">Gaze into the Flow</p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.5em] mt-3">Maestro Solo Conduction Series v5</p>
                                    
                                    {/* History chips fallback */}
                                    {searchHistory.length > 0 && (
                                        <div className="mt-12 w-full max-w-xl opacity-100 grayscale-0">
                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center mb-3">RECURRING INQUIRY HISTORY</p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {searchHistory.map((h, i) => (
                                                    <button 
                                                        key={i}
                                                        onClick={() => mountCampaign(h)}
                                                        className="px-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg text-[9px] text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/20 uppercase tracking-wider transition-all"
                                                    >
                                                        {h}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                             )}

                             {isSearching && (
                                <div className="h-full flex flex-col items-center justify-center gap-8 py-10">
                                    <div className="relative">
                                        <div className="w-36 h-36 border-4 border-blue-500/10 rounded-full animate-spin-slow" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FireIcon className="w-16 h-16 text-blue-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2 max-w-md w-full">
                                        <p className="text-xl font-comic-header uppercase tracking-[0.3em] animate-pulse">Node Carmela Siphoning...</p>
                                        <p className="text-[10px] text-zinc-500 italic">"Conjoining active providers..."</p>
                                        
                                        {/* Dynamic siphoning logs console */}
                                        <div className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl text-left font-mono space-y-1.5 text-[9px] h-36 overflow-y-auto mt-4 custom-scrollbar">
                                            {animatedLogs.map((log, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <span className="text-cyan-500">//</span>
                                                    <span className="text-zinc-400 animate-in fade-in duration-300">{log}</span>
                                                </div>
                                            ))}
                                            <div className="w-1.5 h-3 bg-cyan-400 animate-pulse inline-block" />
                                        </div>
                                    </div>
                                </div>
                             )}

                             {result && (
                                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
                                    {/* Sub-tabs within Search Results */}
                                    <div className="flex border-b-2 border-zinc-900 pb-px gap-2">
                                        {[
                                            { id: 'deconstruction', label: 'Deconstruction', icon: EyeIcon },
                                            { id: 'timeline', label: 'Epoch Timeline', icon: ClockIcon },
                                            { id: 'shards', label: 'Web Shards', icon: GlobeIcon },
                                            { id: 'telemetry', label: 'Diagnostics', icon: GaugeIcon }
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setResultTab(tab.id as any)}
                                                className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest border-b-4 flex items-center gap-2 transition-all ${
                                                    resultTab === tab.id 
                                                        ? 'border-blue-500 text-white font-black bg-zinc-900/20' 
                                                        : 'border-transparent text-zinc-500 hover:text-white'
                                                }`}
                                            >
                                                <tab.icon className="w-3.5 h-3.5" />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab 1: Deconstruction & Entities */}
                                    {resultTab === 'deconstruction' && (
                                        <div className="space-y-8 animate-in fade-in duration-300">
                                            {/* Executive summary banner */}
                                            {result.executiveSummary && (
                                                <div className="p-4 bg-blue-950/10 border-l-4 border-blue-500 rounded-r-xl">
                                                    <h5 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                        <InfoIcon className="w-3 h-3" /> Core Finding Abstract
                                                    </h5>
                                                    <p className="text-zinc-300 text-xs italic leading-relaxed">
                                                        "{result.executiveSummary}"
                                                    </p>
                                                </div>
                                            )}

                                            {/* Detailed Deconstruction */}
                                            <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl shadow-inner relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 opacity-5"><TerminalIcon className="w-20 h-20" /></div>
                                                <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4 flex justify-between items-center">
                                                    <span className="flex items-center gap-2"><StarIcon className="w-4 h-4 text-cyan-500 animate-pulse" /> Siphoned Intelligence Analysis</span>
                                                    <button 
                                                        onClick={() => triggerCopy(result.deconstruction, 'decon-copy')}
                                                        className="text-zinc-600 hover:text-cyan-400 tracking-widest font-black text-[8px] uppercase transition-all"
                                                    >
                                                        {isCopied === 'decon-copy' ? 'COPIED' : 'COPY'}
                                                    </button>
                                                </h4>
                                                <p className="text-zinc-300 italic text-sm leading-relaxed first-letter:text-4xl first-letter:font-comic-header first-letter:mr-2 first-letter:float-left first-letter:text-blue-500 font-sans">
                                                    {result.deconstruction}
                                                </p>
                                            </div>

                                            {/* Extracted Entity pills section */}
                                            {result.entities && result.entities.length > 0 && (
                                                <div className="space-y-4">
                                                    <h4 className="font-comic-header text-xl text-zinc-300 uppercase italic flex items-center gap-2">
                                                        <DatabaseIcon className="w-4 h-4 text-cyan-500" /> Extracted Key Entities
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                        {result.entities.map((ent, idx) => (
                                                            <div 
                                                                key={idx} 
                                                                className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl hover:border-cyan-500/20 transition-all flex flex-col justify-between group"
                                                            >
                                                                <div>
                                                                    <div className="flex justify-between items-center mb-1.5">
                                                                        <span className="text-[7px] font-black text-cyan-500 tracking-wider bg-cyan-950/30 px-2 py-0.5 rounded uppercase">
                                                                            {ent.type}
                                                                        </span>
                                                                        <button 
                                                                            onClick={() => mountCampaign(ent.name)}
                                                                            className="text-[8px] font-black text-zinc-600 hover:text-cyan-400 uppercase tracking-wider transition-colors flex items-center gap-0.5"
                                                                        >
                                                                            <SearchIcon className="w-2.5 h-2.5" /> PIVOT
                                                                        </button>
                                                                    </div>
                                                                    <h6 className="font-bold text-white text-xs uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
                                                                        {ent.name}
                                                                    </h6>
                                                                    <p className="text-[9px] text-zinc-500 italic mt-1 leading-snug">
                                                                        {ent.significance}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Suggested follow-ups queries */}
                                            {result.followUps && result.followUps.length > 0 && (
                                                <div className="space-y-3 pt-4 border-t border-zinc-950">
                                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Avenues of Continued Forensic Inquiry</p>
                                                    <div className="flex flex-col gap-2">
                                                        {result.followUps.map((queryText, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => mountCampaign(queryText)}
                                                                className="w-full text-left p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-cyan-500/20 rounded-xl transition-all flex justify-between items-center group"
                                                            >
                                                                <span className="text-[10px] text-zinc-400 group-hover:text-cyan-400 font-medium uppercase tracking-wider truncate max-w-[90%]">
                                                                    "{queryText}"
                                                                </span>
                                                                <SearchIcon className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab 2: Epoch Timeline */}
                                    {resultTab === 'timeline' && (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            <h4 className="font-comic-header text-2xl text-white uppercase italic border-b border-zinc-900 pb-2 flex items-center gap-2">
                                                <ClockIcon className="w-5 h-5 text-cyan-500" /> Historical Milestones (Epoch Tracker)
                                            </h4>
                                            
                                            {result.timeline && result.timeline.length > 0 ? (
                                                <div className="relative border-l-2 border-zinc-900 ml-4 pl-8 space-y-8 py-2">
                                                    {result.timeline.map((item, idx) => (
                                                        <div key={idx} className="relative group/timeline">
                                                            {/* Timeline Dot */}
                                                            <div className="absolute -left-[39px] top-1 w-4 h-4 rounded-full bg-black border-2 border-cyan-500 group-hover/timeline:bg-cyan-400 group-hover/timeline:shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all" />
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                                <span className="text-[9px] font-black text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-2.5 py-0.5 rounded-full uppercase tracking-widest self-start font-mono">
                                                                    {item.epoch}
                                                                </span>
                                                                <span className="text-zinc-800 text-[10px] uppercase font-black tracking-widest hidden sm:inline">|</span>
                                                                <h5 className="text-xs font-black text-white uppercase tracking-tight group-hover/timeline:text-cyan-400 transition-colors">
                                                                    {item.event}
                                                                </h5>
                                                            </div>
                                                            <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed max-w-2xl font-sans italic">
                                                                "{item.implication}"
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-900">
                                                    <p className="text-zinc-600 text-xs italic">No timeline data siphoned for this campaign.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab 3: Web Shards */}
                                    {resultTab === 'shards' && (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            <h4 className="font-comic-header text-2xl text-white uppercase italic border-b border-zinc-900 pb-2 flex items-center gap-2">
                                                <GlobeIcon className="w-5 h-5 text-cyan-500" /> Siphoned Web Sources
                                            </h4>
                                            
                                            {result.shards && result.shards.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {result.shards.map((shard, idx) => {
                                                        const isPinned = pinnedShards.some(s => s.url === shard.url);
                                                        return (
                                                            <div 
                                                                key={shard.id || idx} 
                                                                className="p-5 bg-black border-2 border-zinc-900 hover:border-blue-600/30 transition-all rounded-2xl shadow-lg group relative overflow-hidden flex flex-col justify-between"
                                                            >
                                                                <div>
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">SHARD_0x{idx.toString().padStart(2, '0')}</span>
                                                                        <div className="flex items-center gap-3">
                                                                            <button 
                                                                                onClick={() => togglePinShard(shard)}
                                                                                className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded transition-all ${
                                                                                    isPinned ? 'bg-red-950/30 text-red-400 border border-red-900/40' : 'bg-zinc-950 text-zinc-500 border border-zinc-900 hover:text-white'
                                                                                }`}
                                                                            >
                                                                                {isPinned ? 'Unpin' : 'Pin Intel'}
                                                                            </button>
                                                                            <div className="flex items-center gap-1">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                                                <span className="text-[7px] font-black text-zinc-500 uppercase font-mono">Reliable</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <a 
                                                                        href={shard.url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="block"
                                                                    >
                                                                        <h5 className="font-black text-sm text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">{shard.title}</h5>
                                                                    </a>
                                                                    <p className="text-[10px] text-zinc-500 italic mt-1.5 line-clamp-3 leading-relaxed">{shard.snippet}</p>
                                                                </div>
                                                                <div className="mt-4 pt-4 border-t border-zinc-900/40 flex justify-between items-center">
                                                                    <span className="text-[7px] text-blue-900 font-mono truncate max-w-[180px]">{shard.url}</span>
                                                                    <a 
                                                                        href={shard.url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="text-zinc-600 hover:text-cyan-400 transition-colors"
                                                                    >
                                                                        <ZapIcon className="w-3.5 h-3.5 group-hover:text-blue-500 transition-colors" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-900">
                                                    <p className="text-zinc-600 text-xs italic">No external web sources siphoned for this query.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab 4: Diagnostics & Telemetry */}
                                    {resultTab === 'telemetry' && (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            <h4 className="font-comic-header text-2xl text-white uppercase italic border-b border-zinc-900 pb-2 flex items-center gap-2">
                                                <GaugeIcon className="w-5 h-5 text-cyan-500" /> Siphon Signal Diagnostics
                                            </h4>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {/* Purity Circle Gauge */}
                                                <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center text-center">
                                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4">Signal Purity Rating</p>
                                                    <div className="relative w-36 h-36 flex items-center justify-center">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="72" cy="72" r="62" className="stroke-zinc-950" strokeWidth="6" fill="transparent" />
                                                            <circle cx="72" cy="72" r="62" className="stroke-cyan-500" strokeWidth="6" fill="transparent"
                                                                    strokeDasharray={389} strokeDashoffset={389 - (389 * (result.purityScore || 85)) / 100}
                                                                    strokeLinecap="round" />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-2xl font-comic-header text-white font-bold">{result.purityScore || 85}%</span>
                                                            <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest">VERIFIED SIGNAL</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Noise Attenuation Circle Gauge */}
                                                <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center text-center">
                                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4">Noise Attenuation</p>
                                                    <div className="relative w-36 h-36 flex items-center justify-center">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="72" cy="72" r="62" className="stroke-zinc-950" strokeWidth="6" fill="transparent" />
                                                            <circle cx="72" cy="72" r="62" className="stroke-red-500" strokeWidth="6" fill="transparent"
                                                                    strokeDasharray={389} strokeDashoffset={389 - (389 * (result.noiseRatio || 15)) / 100}
                                                                    strokeLinecap="round" />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-2xl font-comic-header text-white font-bold">{result.noiseRatio || 15}%</span>
                                                            <span className="text-[7px] font-black text-red-500 uppercase tracking-widest font-mono">ATTENUATION RATE</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details Breakdown */}
                                            <div className="p-4 bg-zinc-950/20 border border-zinc-900 rounded-xl space-y-3">
                                                <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase pb-1 border-b border-zinc-900">
                                                    <span>Diagnostic Property</span>
                                                    <span>Telemetry Reading</span>
                                                </div>
                                                {[
                                                    { key: 'Transmitted Channels', val: `${result.telemetry.providersReached.length} Grounded Pipelines` },
                                                    { key: 'Consensus Level', val: '99.4% Multi-Siphon Alignment' },
                                                    { key: 'Spectral Drift', val: '0.002ms absolute latency deviation' },
                                                    { key: 'Extraction Purity', val: `${result.purityScore || 85}% high-fidelity signal threshold` }
                                                ].map(item => (
                                                    <div key={item.key} className="flex justify-between text-[10px] py-1">
                                                        <span className="text-zinc-500 uppercase font-bold">{item.key}</span>
                                                        <span className="text-cyan-400 font-bold">{item.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bottom verified integrity stamp card */}
                                    <div className="flex justify-center pt-6">
                                        <div className="p-6 bg-zinc-950/60 border border-zinc-900 rounded-3xl text-center shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-transform max-w-sm w-full">
                                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-2">Conjunction Integrity Verified</p>
                                            <p className="text-xl font-comic-header text-white font-bold">0x03E2_HARMONY_OK</p>
                                            <p className="text-[7px] text-zinc-500 mt-2 font-black uppercase">Result Purity Coefficient: {result.telemetry.purity.toFixed(3)}</p>
                                        </div>
                                    </div>
                                </div>
                             )}
                         </div>
                    </div>
                </div>
            </div>

            {/* Footer Bar */}
            <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Network Status: SYNCED</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Stride: 1.82 PB/s | Conductor: Maestro | Mode: Universal_Search_Multi
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em] hidden sm:block">
                   conjunction reliable search network | v5.5.0
                </div>
            </div>
            
            <style>{`
                .animate-spin-slow {
                    animation: spin 15s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
