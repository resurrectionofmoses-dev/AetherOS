import React, { useState, useEffect, useRef } from 'react';
import { 
    SearchIcon, GlobeIcon, SignalIcon, ZapIcon, ActivityIcon, 
    SpinnerIcon, ShieldIcon, TerminalIcon, LogicIcon, StarIcon,
    FireIcon, CodeIcon, LockIcon, ChevronDownIcon, CheckCircleIcon,
    GaugeIcon, EyeIcon
} from './icons';
import { SearchSovereign } from '../services/searchSovereign';
import type { SovereignSearchResult, SearchProviderStatus } from '../types';

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
    
    useEffect(() => {
        const int = setInterval(() => {
            setSpectrum(p => (p + 1) % 100);
            if (isSearching) {
                setCarmelaLoad(prev => Math.min(100, prev + Math.random() * 5));
            } else {
                setCarmelaLoad(prev => Math.max(30, prev - (Math.random() * 2)));
            }
        }, 50);
        return () => clearInterval(int);
    }, [isSearching]);

    const handleSovereignSearch = async (e?: React.FormEvent, manualQuery?: string) => {
        if (e) e.preventDefault();
        const finalQuery = manualQuery || query;
        if (!finalQuery.trim() || isSearching) return;

        setIsSearching(true);
        setResult(null);
        if (!manualQuery) setQuery(finalQuery);
        
        const data = await SearchSovereign.conduct(finalQuery);
        setResult(data);
        setIsSearching(false);
    };

    const mountCampaign = (q: string) => {
        setQuery(q);
        handleSovereignSearch(undefined, q);
    };

    return (
        <div className="h-full flex flex-col bg-[#01050a] text-cyan-100 font-mono overflow-hidden">
            {/* Header: Search Authority */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600/10 border-4 border-blue-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                        <GlobeIcon className="w-10 h-10 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-blue-400 wisdom-glow italic tracking-tighter uppercase leading-none">SEARCH_SOVEREIGN</h2>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Multi-Provider Conjunction | Stride 1.2 PB/S</span>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isSearching ? 'bg-red-500 animate-ping' : 'bg-green-500 shadow-[0_0_5px_green]'}`} />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Node: Carmela</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Spectrum Pulse</p>
                        <div className="w-32 h-2 bg-black rounded-full border border-white/5 overflow-hidden">
                            <div className="h-full bg-blue-500 animate-pulse" style={{ width: `${spectrum}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-8 gap-8 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(59,130,246,0.05)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left Side: Campaign Mounting Station */}
                <div className="lg:w-96 flex flex-col gap-6 flex-shrink-0 z-20">
                    <div className="aero-panel p-6 bg-red-950/20 border-4 border-red-900/40 shadow-[10px_10px_0_0_#000] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><FireIcon className="w-20 h-20" /></div>
                        <h3 className="font-comic-header text-3xl text-red-500 uppercase italic mb-6 flex items-center gap-3 border-b border-red-950 pb-2">
                            <ZapIcon className="w-6 h-6" /> Mount Campaign
                        </h3>
                        <div className="space-y-4">
                            {FORENSIC_CAMPAIGNS.map(campaign => (
                                <button 
                                    key={campaign.id}
                                    onClick={() => mountCampaign(campaign.query)}
                                    disabled={isSearching}
                                    className={`w-full p-4 rounded-2xl bg-black/60 border-2 transition-all duration-300 text-left hover:scale-[1.02] active:translate-y-1 ${campaign.color} hover:bg-black group`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-black uppercase text-[11px] tracking-widest">{campaign.name}</p>
                                        <ActivityIcon className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-[9px] text-gray-500 italic leading-snug">{campaign.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="aero-panel p-6 bg-black/60 border-4 border-black flex flex-col flex-1 shadow-[10px_10px_0_0_#000] overflow-hidden">
                         <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                            Node: Carmela Telemetry
                         </h3>
                         <div className="flex-1 space-y-6 flex flex-col justify-center items-center">
                            <div className="relative">
                                <div className="w-32 h-32 border-8 border-cyan-500/20 rounded-full animate-spin-slow" />
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-4xl font-comic-header text-white">{carmelaLoad.toFixed(0)}%</span>
                                    <span className="text-[8px] font-black text-cyan-400 uppercase">LOAD</span>
                                </div>
                                <div className="absolute inset-[-10px] border-2 border-cyan-500/10 rounded-full animate-ping" />
                            </div>
                            <div className="w-full space-y-3">
                                {[
                                    { label: 'Ingress Rate', val: isSearching ? '3.88 PB/S' : '1.22 PB/S', icon: GaugeIcon },
                                    { label: 'Spectral Drift', val: '0.002ms', icon: ActivityIcon },
                                    { label: 'Epitume Focus', val: isSearching ? 'MAXIMAL' : 'NOMINAL', icon: EyeIcon }
                                ].map(stat => (
                                    <div key={stat.label} className="flex justify-between items-center p-2 bg-black rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <stat.icon className="w-3 h-3 text-gray-700" />
                                            <span className="text-[8px] font-black text-gray-500 uppercase">{stat.label}</span>
                                        </div>
                                        <span className="text-[9px] font-mono text-cyan-500">{stat.val}</span>
                                    </div>
                                ))}
                            </div>
                         </div>
                         <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl mt-4 italic text-[9px] text-cyan-600 leading-relaxed">
                            "Carmela mount: Turning 1000 pages of the Digital Abyss per second to find the gifted letters."
                         </div>
                    </div>
                </div>

                {/* Main Content: Input & Shards */}
                <div className="flex-1 flex flex-col gap-6 relative z-10 min-w-0">
                    <form onSubmit={handleSovereignSearch} className="aero-panel bg-slate-900 border-8 border-black p-2 flex items-center gap-4 shadow-[15px_15px_60px_rgba(0,0,0,1)] focus-within:border-blue-600 transition-all rounded-[3rem]">
                        <div className="pl-8 text-blue-900">
                            <GlobeIcon className="w-8 h-8" />
                        </div>
                        <input 
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Mounting Campaign: Input Forensic Intent..."
                            className="flex-1 bg-transparent border-none text-white font-black text-3xl uppercase focus:ring-0 outline-none placeholder:text-gray-900 py-6"
                            autoFocus
                        />
                        <button 
                            type="submit"
                            disabled={isSearching || !query.trim()}
                            className="w-20 h-20 bg-blue-600 hover:bg-blue-500 text-black rounded-[2.5rem] transition-all active:scale-95 disabled:opacity-20 shadow-[8px_8px_0_0_#000] active:shadow-none flex items-center justify-center mr-2"
                        >
                            {isSearching ? <SpinnerIcon className="w-10 h-10 animate-spin" /> : <SearchIcon className="w-10 h-10" />}
                        </button>
                    </form>

                    <div className="flex-1 aero-panel bg-black border-4 border-black overflow-hidden flex flex-col shadow-2xl">
                         <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10 relative">
                             {!result && !isSearching && (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale py-20">
                                    <LogicIcon className="w-64 h-64 mb-10" />
                                    <p className="font-comic-header text-7xl uppercase italic tracking-widest text-center">Gaze into the Flow</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.6em] mt-4">Maestro Solo Conduction Series</p>
                                </div>
                             )}

                             {isSearching && (
                                <div className="h-full flex flex-col items-center justify-center gap-10">
                                    <div className="relative">
                                        <div className="w-48 h-48 border-8 border-blue-500/20 rounded-full animate-spin-slow" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FireIcon className="w-20 h-20 text-blue-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-2xl font-comic-header uppercase tracking-[0.4em] animate-pulse">Node Carmela Siphoning...</p>
                                        <p className="text-xs text-gray-700 italic">"Gazing across 12 search engines via the absolute bridge."</p>
                                    </div>
                                </div>
                             )}

                             {result && (
                                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12">
                                    <div className="p-8 bg-slate-900/60 border-4 border-black rounded-[3rem] shadow-inner relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-5 opacity-5"><TerminalIcon className="w-32 h-32" /></div>
                                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-6 flex items-center gap-4">
                                            <StarIcon className="w-5 h-5" /> Forensic Deconstruction
                                        </h4>
                                        <p className="text-gray-300 italic text-xl leading-relaxed first-letter:text-5xl first-letter:font-comic-header first-letter:mr-2 first-letter:float-left first-letter:text-blue-500">
                                            "{result.deconstruction}"
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="font-comic-header text-3xl text-white uppercase italic border-b-4 border-black pb-2 flex items-center gap-4">
                                            <GlobeIcon className="w-8 h-8 text-cyan-500" /> Siphoned Web Shards
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {result.shards.map((shard, idx) => (
                                                <a 
                                                    key={shard.id} 
                                                    href={shard.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="p-6 bg-black border-4 border-black hover:border-blue-600/40 transition-all rounded-[2rem] shadow-lg group relative overflow-hidden"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">SHARD_0x{idx.toString().padStart(2, '0')}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                                            <span className="text-[7px] font-black text-gray-600 uppercase">Reliable</span>
                                                        </div>
                                                    </div>
                                                    <h5 className="font-black text-lg text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors truncate">{shard.title}</h5>
                                                    <p className="text-[10px] text-gray-500 italic mt-2 line-clamp-2 leading-relaxed">{shard.snippet}</p>
                                                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                                        <span className="text-[7px] text-blue-900 font-mono truncate max-w-[200px]">{shard.url}</span>
                                                        <ZapIcon className="w-4 h-4 text-blue-900 group-hover:text-blue-500 transition-colors" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-10">
                                        <div className="p-8 bg-black border-4 border-blue-600 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em] mb-4">Conjunction Integrity Verified</p>
                                            <p className="text-4xl font-comic-header text-white">0x03E2_HARMONY</p>
                                            <p className="text-[8px] text-blue-900 mt-4 font-black uppercase">Result Purity: {(result.telemetry.purity * 100).toFixed(1)}%</p>
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
                      Stride: 1.22 PB/s | Conductor: Maestro | Mode: Campaign_Mount
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em] hidden sm:block">
                   conjunction reliable search network | v5.4.1
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