
import React, { useState, useEffect, useRef } from 'react';
import { 
    ShieldIcon, SearchIcon, ActivityIcon, ZapIcon, 
    TerminalIcon, GlobeIcon, BrainIcon, LockIcon,
    CheckCircleIcon, AlertTriangleIcon, BugIcon, CpuIcon
} from './icons';
import { runFullRecon, ReconResults } from '../services/remixService';

export const RemixScopeLabView: React.FC = () => {
    const [targetUrl, setTargetUrl] = useState('');
    const [programUrl, setProgramUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [results, setResults] = useState<ReconResults | null>(null);
    const [logs, setLogs] = useState<string[]>(["[REMIX] Scope Engine Initialized.", "[FLAIDICOSE] AI Diagnostic Core Ready."]);
    const logEndRef = useRef<HTMLDivElement>(null);

    const addLog = (msg: string, color: string = 'text-cyan-500') => {
        setLogs(prev => [`[${new Date().toLocaleTimeString([], {hour12:false})}] <span class="${color}">${msg}</span>`, ...prev].slice(0, 50));
    };

    const handleStartRecon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUrl.trim() || isScanning) return;

        setIsScanning(true);
        setResults(null);
        addLog(`Initiating Remix Recon on: ${targetUrl}`, "text-amber-400 font-bold");
        
        try {
            addLog("Analyzing Scope Patterns...", "text-blue-400");
            // Simulate progress
            await new Promise(r => setTimeout(r, 1500));
            addLog("Enumerating Subdomains via Care Protocol...", "text-blue-400");
            await new Promise(r => setTimeout(r, 1000));
            addLog("Detecting Technologies & Port Mapping...", "text-blue-400");
            await new Promise(r => setTimeout(r, 1200));
            addLog("Engaging Fl.aidicose AI Engine...", "text-violet-400 font-bold");
            await new Promise(r => setTimeout(r, 1500));

            const data = await runFullRecon(targetUrl, programUrl);
            setResults(data);
            addLog("Reconnaissance Complete. Care Score: " + data.scope.careScore, "text-green-400 font-black");
        } catch (err: any) {
            addLog(`FRACTURE: ${err.message}`, "text-red-500");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#020408] text-gray-200 font-mono overflow-hidden selection:bg-amber-500/30">
            {/* Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-violet-500/10 border-4 border-violet-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                        <BugIcon className="w-10 h-10 text-violet-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white tracking-tighter italic uppercase leading-none">REMIX_SCOPE</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] bg-violet-950/40 text-violet-500 px-2 py-0.5 border border-violet-900/30 rounded font-black">ENGINE: FL.AIDICOSE v2.0</span>
                            <span className="text-[10px] text-gray-500">MODE: ADAPTIVE_RECON</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Care Integrity</p>
                        <p className="text-3xl font-comic-header text-green-400">{results ? results.scope.careScore : '--'}%</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] text-gray-500 font-black uppercase mb-1">AI_CONFIDENCE</span>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-2 h-4 rounded-sm border border-black ${results && i < Math.floor(results.flaidicose.confidence / 20) ? 'bg-violet-500 shadow-[0_0_5px_violet]' : 'bg-gray-800'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-6 gap-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(139,92,246,0.05)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left: Input & Logs */}
                <div className="lg:w-96 flex flex-col gap-6 flex-shrink-0 z-20">
                    <div className="aero-panel p-6 bg-slate-900/80 border-violet-600/20 border-4 shadow-[8px_8px_0_0_#000] flex flex-col">
                        <h3 className="font-comic-header text-2xl text-white uppercase italic mb-6 border-b border-white/5 pb-2 flex items-center gap-2">
                            <TerminalIcon className="w-5 h-5 text-violet-500" /> Command Ingress
                        </h3>
                        <form onSubmit={handleStartRecon} className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Target URL</label>
                                <input 
                                    value={targetUrl}
                                    onChange={e => setTargetUrl(e.target.value)}
                                    placeholder="example.com"
                                    className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-violet-500 outline-none transition-all"
                                    disabled={isScanning}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Program URL (Optional)</label>
                                <input 
                                    value={programUrl}
                                    onChange={e => setProgramUrl(e.target.value)}
                                    placeholder="hackerone.com/..."
                                    className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-violet-500 outline-none transition-all"
                                    disabled={isScanning}
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isScanning || !targetUrl.trim()}
                                className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[4px_4px_0_0_#000] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-3 disabled:opacity-20"
                            >
                                {isScanning ? <ActivityIcon className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5" />}
                                {isScanning ? "Engaging..." : "Start Recon"}
                            </button>
                        </form>
                    </div>

                    <div className="flex-1 aero-panel bg-black/40 border-4 border-black p-5 flex flex-col shadow-[8px_8px_0_0_#000] overflow-hidden">
                         <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                            <ActivityIcon className="w-4 h-4" /> Diagnostic Feed
                         </h4>
                         <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-2 font-mono text-[9px]">
                            {logs.map((log, i) => (
                                <div key={i} className="animate-in slide-in-from-left-2 transition-all">
                                    <span className="text-gray-700 mr-2">[{logs.length - i}]</span>
                                    <span dangerouslySetInnerHTML={{ __html: log }} />
                                </div>
                            ))}
                            <div ref={logEndRef} />
                         </div>
                    </div>
                </div>

                {/* Center: Results */}
                <div className="flex-1 flex flex-col gap-6 min-w-0 z-20">
                    <div className="flex-1 aero-panel bg-black border-4 border-black overflow-hidden flex flex-col shadow-[20px_20px_100px_rgba(0,0,0,1)] relative">
                         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                         
                         {results ? (
                             <div className="flex-1 flex flex-col overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-700">
                                 <div className="p-8 border-b-4 border-black bg-white/5 flex justify-between items-center backdrop-blur-md">
                                     <div>
                                         <h3 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{results.target}</h3>
                                         <p className="text-xs text-gray-500 mt-2 uppercase font-black tracking-[0.3em]">RECON_MANIFEST_0x{Math.random().toString(16).slice(2, 8).toUpperCase()}</p>
                                     </div>
                                     <div className="flex gap-4">
                                         <div className="text-right">
                                             <span className="text-[10px] text-gray-600 font-black uppercase">Vulnerabilities</span>
                                             <p className="text-3xl font-comic-header text-red-500">{results.vulnerabilities.length}</p>
                                         </div>
                                         <div className="text-right">
                                             <span className="text-[10px] text-gray-600 font-black uppercase">Subdomains</span>
                                             <p className="text-3xl font-comic-header text-cyan-400">{results.subdomains.length}</p>
                                         </div>
                                     </div>
                                 </div>
                                 
                                 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                                    {/* Fl.aidicose Predictions */}
                                    <section>
                                        <h4 className="text-xs font-black text-violet-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                            <BrainIcon className="w-4 h-4" /> Fl.aidicose AI Predictions
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {results.flaidicose.predictions.map((p, i) => (
                                                <div key={i} className="bg-violet-950/20 border-2 border-violet-500/30 p-4 rounded-2xl relative overflow-hidden group hover:border-violet-500 transition-all">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-black text-violet-400 uppercase">{p.type}</span>
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded border border-black ${
                                                            p.severity === 'critical' ? 'bg-red-600 text-white' : 
                                                            p.severity === 'high' ? 'bg-orange-600 text-black' : 'bg-amber-600 text-black'
                                                        }`}>
                                                            {p.severity.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-white font-bold mb-2">{p.reason}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1 bg-black rounded-full overflow-hidden">
                                                            <div className="h-full bg-violet-500" style={{ width: `${p.confidence}%` }} />
                                                        </div>
                                                        <span className="text-[8px] font-mono text-violet-400">{p.confidence}% CONF</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Scope Details */}
                                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-slate-900/40 border-2 border-white/5 p-6 rounded-2xl">
                                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <GlobeIcon className="w-4 h-4" /> In-Scope Patterns
                                            </h4>
                                            <ul className="space-y-2">
                                                {results.scope.inScope.map((s, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-xs text-gray-300 font-mono">
                                                        <CheckCircleIcon className="w-3 h-3 text-green-500" /> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-slate-900/40 border-2 border-white/5 p-6 rounded-2xl">
                                            <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <LockIcon className="w-4 h-4" /> Out-of-Scope
                                            </h4>
                                            <ul className="space-y-2">
                                                {results.scope.outOfScope.map((s, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                                        <AlertTriangleIcon className="w-3 h-3 text-red-900" /> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </section>

                                    {/* Tech Stack */}
                                    <section>
                                        <h4 className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                            <CpuIcon className="w-4 h-4" /> Technology Fingerprints
                                        </h4>
                                        <div className="flex flex-wrap gap-3">
                                            {results.technologies.map((t, i) => (
                                                <div key={i} className="bg-black/60 border-2 border-cyan-900/30 px-4 py-2 rounded-xl flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                                    <span className="text-xs font-bold text-white">{t.name}</span>
                                                    <span className="text-[9px] font-mono text-cyan-600">{t.version}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                 </div>
                             </div>
                         ) : (
                             <div className="flex-1 flex flex-col items-center justify-center opacity-10 grayscale text-center p-20">
                                <SearchIcon className="w-64 h-64 mb-10" />
                                <p className="font-comic-header text-7xl uppercase italic tracking-widest">Awaiting Target</p>
                                <p className="text-xl font-black uppercase tracking-[0.5em] mt-4">Inject a target URL to initiate Remix Scope analysis.</p>
                             </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};
