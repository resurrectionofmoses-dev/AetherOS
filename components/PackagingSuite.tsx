import React, { useState, useEffect, useRef } from 'react';
import { 
    ShieldIcon, StarIcon, CheckCircleIcon, SpinnerIcon, WarningIcon, 
    ActivityIcon, TerminalIcon, LogicIcon, FireIcon, ZapIcon, 
    DownloadIcon, SignalIcon, CodeIcon, UserIcon 
} from './icons';
import { getDeviceCompat } from '../utils';
import type { DeviceCompatibility, AccessTier } from '../types';
import { RPM_COMPONENTS, RpmComponent } from './rpmData';

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

export const PackagingSuite: React.FC = () => {
    const [compat, setCompat] = useState<DeviceCompatibility | null>(null);
    const [accessTier, setAccessTier] = useState<AccessTier>('USER');
    const [isCompiling, setIsCompiling] = useState(false);
    const [compileProgress, setCompileProgress] = useState(0);
    const [buildLogs, setBuildLogs] = useState<string[]>([
        "[SYSTEM] Deployment Suite Initialized.", 
        "[ENV] Target: Hybrid Wrapper Protocol.",
        "[RPM] Checking RPM registrations..."
    ]);
    const [suInput, setSuInput] = useState('');
    const [isEscalating, setIsEscalating] = useState(false);
    
    // Enhanced Tabs: 'build' | 'rpm_registry' | 'json_sandbox'
    const [activeTab, setActiveTab] = useState<'build' | 'rpm_registry' | 'json_sandbox'>('build');

    // RPM Registry States
    const [rpmSearch, setRpmSearch] = useState('');
    const [rpmFilter, setRpmFilter] = useState<'ALL' | 'REGISTERED' | 'STANDBY' | 'ERROR'>('ALL');
    const [rpmList, setRpmList] = useState<RpmComponent[]>(RPM_COMPONENTS);
    const [selectedRpm, setSelectedRpm] = useState<RpmComponent | null>(RPM_COMPONENTS[0]);

    // JSON Sandbox States
    const [jsonInput, setJsonInput] = useState('{\n  "a": 1,\n  "b": [1, 2],\n  "c": "standard"\n}');
    const [jsonValidationResult, setJsonValidationResult] = useState<{
        valid: boolean;
        message: string;
        tips?: string[];
        parsed?: any;
    }>({ valid: true, message: "Valid JSON structure. No serialization errors detected." });

    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCompat(getDeviceCompat());
    }, []);

    useEffect(() => {
        if (activeTab === 'build') {
            logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [buildLogs, activeTab]);

    const runBuild = () => {
        setIsCompiling(true);
        setCompileProgress(0);
        const prefix = accessTier === 'ROOT' ? "[ROOT_FORGE]" : "[APK_BUILD]";
        setBuildLogs(prev => [...prev, `${prefix} Initializing Neural Net (npm init)...`, `${prefix} Installing Capacitor Exoskeleton...`]);

        const steps = accessTier === 'ROOT' 
            ? ["Overriding Bootloader...", "Mounting /system as RW...", "Injecting God Logic Binary...", "Stripping signature checks...", "Signing with 0x03E2 Key...", "Finalizing Rooted APK..."]
            : [
                "Configuring 'com.sovereign.box' Bundle ID...", 
                "Injecting Kernel into Capacitor...", 
                "Syncing Logic Shards to Android Layer...", 
                "Gradle Sync: Pulling Dependencies...", 
                "Compiling classes.dex...", 
                "Signing app-debug.apk..."
              ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < steps.length) {
                setBuildLogs(prev => [...prev, `${prefix} ${steps[i]}`]);
                setCompileProgress(prev => Math.min(95, prev + (100 / steps.length)));
                i++;
            } else {
                clearInterval(interval);
                setCompileProgress(100);
                setBuildLogs(prev => [...prev, `[SUCCESS] Build Complete: ${accessTier === 'ROOT' ? 'sovereign_root.apk' : 'app-debug.apk'}`]);
                setIsCompiling(false);
            }
        }, accessTier === 'ROOT' ? 1200 : 800);
    };

    const handleEscalate = (e: React.FormEvent) => {
        e.preventDefault();
        if (suInput.toLowerCase() === 'maestro' || suInput.toLowerCase() === '0x03e2') {
            setIsEscalating(true);
            setBuildLogs(prev => [...prev, "[!] SU COMMAND INTERCEPTED.", "[*] Gaining God Logic credentials..."]);
            setTimeout(() => {
                setAccessTier('ROOT');
                setIsEscalating(false);
                setSuInput('');
                setBuildLogs(prev => [...prev, "[#] ACCESS_TIER_ESCALATED: ROOT AUTHORITY GRANTED."]);
            }, 1800);
        } else {
            setBuildLogs(prev => [...prev, "[ERR] su: permission denied."]);
            setSuInput('');
        }
    };

    // Filtered RPM List
    const filteredRpms = rpmList.filter(comp => {
        const matchesSearch = comp.name.toLowerCase().includes(rpmSearch.toLowerCase()) || 
                              comp.version.toLowerCase().includes(rpmSearch.toLowerCase()) ||
                              comp.category.toLowerCase().includes(rpmSearch.toLowerCase());
        const matchesFilter = rpmFilter === 'ALL' || comp.status === rpmFilter;
        return matchesSearch && matchesFilter;
    });

    // Run JSON validation logic
    const validateJsonInput = (text: string) => {
        setJsonInput(text);
        if (!text.trim()) {
            setJsonValidationResult({ valid: false, message: "Input is empty." });
            return;
        }

        try {
            const parsed = JSON.parse(text);
            
            // Check for duplicate keys (JSON.parse allows them, but we want to detect structure patterns)
            const tips: string[] = [];
            
            // Look for common Newtonsoft.Json issues or mismatched array structures
            if (Array.isArray(parsed)) {
                if (parsed.length > 0 && typeof parsed[0] === 'object') {
                    const keys = Object.keys(parsed[0]);
                    const inconsistent = parsed.some(item => {
                        if (typeof item !== 'object' || item === null) return true;
                        const itemKeys = Object.keys(item);
                        return itemKeys.length !== keys.length || !keys.every(k => itemKeys.includes(k));
                    });
                    if (inconsistent) {
                        tips.push("WARNING: Array items contain inconsistent keys. This might trigger a Newtonsoft.Json.JsonSerializationException if the deserializer expects a rigid class model.");
                    }
                }
            } else if (typeof parsed === 'object' && parsed !== null) {
                // Check if there's a list with duplicate-like arrays, or mismatched fields
                const keys = Object.keys(parsed);
                if (keys.includes('b') && Array.isArray(parsed['b']) && keys.includes('c') && !Array.isArray(parsed['c'])) {
                    tips.push("Structure Tip: Detected 'b' array alongside non-array 'c' field. Ensure your target C# backend models map correct type signatures.");
                }
            }

            setJsonValidationResult({
                valid: true,
                message: "Valid JSON structure. No syntactic errors detected.",
                tips: tips.length > 0 ? tips : ["Structure is clean. Standard Key-Value pairing matches RFC 8259."],
                parsed
            });
        } catch (err: any) {
            // Detailed validation tips matching the user's manual guidance
            const errMsg = err.message || "Unknown syntax error";
            const errorTips = [
                "1. Ensure all object keys and string values are enclosed in double quotes (e.g. \"a\": 1).",
                "2. Check for missing commas between key-value pairs or array elements.",
                "3. Ensure all brackets [ ] and braces { } are properly balanced and closed.",
                "4. Check for duplicate keys or trailing commas which are invalid in strict JSON standards."
            ];
            
            setJsonValidationResult({
                valid: false,
                message: `JSON Syntax Error: ${errMsg}`,
                tips: errorTips
            });
        }
    };

    if (!compat) return null;

    return (
        <div className="h-full flex flex-col bg-[#02040a] text-gray-200 font-mono overflow-hidden">
            {/* Header */}
            <div className={`p-3.5 border-b-8 border-black flex justify-between items-center shadow-2xl relative z-20 transition-colors duration-1000 ${accessTier === 'ROOT' ? 'bg-red-950/20' : 'bg-slate-900'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 border-3 rounded-xl flex items-center justify-center transition-all duration-1000 ${accessTier === 'ROOT' ? 'bg-red-500/10 border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-emerald-500/10 border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
                        {accessTier === 'ROOT' ? <FireIcon className="w-7 h-7 text-red-500 animate-pulse" /> : <DownloadIcon className="w-7 h-7 text-emerald-500" />}
                    </div>
                    <div>
                        <h2 className={`font-comic-header text-3xl italic tracking-tighter uppercase transition-colors duration-1000 ${accessTier === 'ROOT' ? 'text-red-600' : 'text-emerald-500'}`}>DEPLOYMENT SUITE</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em]">Hybrid Wrapper & Package Manager</span>
                            <div className={`px-2 py-0.5 rounded-full border-2 text-[6px] font-black uppercase tracking-widest flex items-center gap-1 ${accessTier === 'ROOT' ? 'bg-red-600 text-black border-black animate-pulse' : 'bg-black text-emerald-500 border-emerald-900/50'}`}>
                                {accessTier === 'ROOT' ? <FireIcon className="w-1.5 h-1.5" /> : <UserIcon className="w-1.5 h-1.5" />}
                                {accessTier}_NODE
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Tab Switchers */}
                <div className="flex bg-black border border-white/10 p-1 rounded-lg gap-1.5">
                    <button 
                        onClick={() => setActiveTab('build')}
                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'build' ? 'bg-emerald-600 text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Build Console
                    </button>
                    <button 
                        onClick={() => setActiveTab('rpm_registry')}
                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'rpm_registry' ? 'bg-emerald-600 text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        RPM Registry ({rpmList.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('json_sandbox')}
                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'json_sandbox' ? 'bg-emerald-600 text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        JSON Sandbox
                    </button>
                </div>

                <div className="flex gap-6">
                    <div className="text-right">
                        <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Architecture</p>
                        <p className="text-base font-comic-header text-white">{compat.isMobile ? 'MOBILE/ARM' : 'STATION/X86'}</p>
                    </div>
                    <ActivityIcon className={`w-8 h-8 ${isCompiling ? (accessTier === 'ROOT' ? 'text-red-600 animate-spin' : 'text-emerald-500 animate-spin-slow') : 'text-gray-900'}`} />
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-5 gap-5 relative">
                
                {/* Tab Content: BUILD CONSOLE */}
                {activeTab === 'build' && (
                    <>
                        {/* Left Side Info Panel */}
                        <div className="lg:w-[320px] flex flex-col gap-5 flex-shrink-0">
                            <div className="aero-panel p-5 bg-slate-900/80 border-emerald-600/20 shadow-[6px_6px_0_0_rgba(0,0,0,0.8)]">
                                <h3 className="font-comic-header text-xl text-white uppercase italic tracking-tight mb-4 flex items-center gap-2">
                                    <ShieldIcon className="w-4 h-4 text-emerald-500" /> Compat Matrix
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Maestro PWA API', ok: compat.pwaSupport },
                                        { label: 'Multi-Touch Array', ok: compat.touchEnabled },
                                        { label: 'Kernel Escalation', ok: compat.canEscalate },
                                        { label: 'Radio Conjunction', ok: compat.bluetoothApi },
                                    ].map((check, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-black border border-white/5 rounded-md group hover:border-emerald-600/50 transition-all">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{check.label}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[7px] font-black uppercase ${check.ok ? 'text-green-500' : 'text-red-500'}`}>{check.ok ? 'PASSED' : 'STALLED'}</span>
                                                {check.ok ? <CheckCircleIcon className="w-3 h-3 text-green-500" /> : <WarningIcon className="w-3 h-3 text-red-500" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="aero-panel p-4 bg-black/60 border-red-900/30 flex flex-col gap-3">
                                <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                                    <TerminalIcon className="w-3 h-3" /> Authority Bridge
                                </h3>
                                {accessTier === 'USER' ? (
                                    <form onSubmit={handleEscalate} className="space-y-3">
                                        <p className="text-[8px] text-gray-500 italic leading-relaxed">
                                            "Operating in non-root environment. Enter the Maestro's secret letter to escalate to Root."
                                        </p>
                                        <div className="bg-gray-900 border-2 border-black p-1.5 rounded-md flex items-center gap-1.5">
                                            <span className="text-red-900 font-black text-[10px]">$ su</span>
                                            <input 
                                                value={suInput}
                                                onChange={e => setSuInput(e.target.value)}
                                                placeholder="password..."
                                                className="bg-transparent border-none p-0 focus:ring-0 text-white font-mono text-[10px] w-full"
                                                type="password"
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={!suInput || isEscalating}
                                            className="w-full py-1 bg-red-950/40 hover:bg-red-600 border border-red-600/30 text-red-400 hover:text-white transition-all text-[7px] font-black uppercase rounded-sm"
                                        >
                                            {isEscalating ? 'Gaining Entry...' : 'Escalate Privileges'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-red-950/40 border-2 border-red-600 p-3 rounded-lg text-center">
                                        <FireIcon className="w-6 h-6 text-red-500 mx-auto mb-1.5 animate-bounce" />
                                        <p className="text-white font-black uppercase text-[10px]">ROOT ACCESS ACTIVE</p>
                                        <p className="text-[7px] text-red-300 italic mt-0.5">Safety heuristics bypassed.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Build Console View */}
                        <div className="flex-1 flex flex-col gap-5 overflow-hidden">
                            <div className="aero-panel bg-black/95 border-4 border-black flex-1 flex flex-col shadow-[12px_12px_50px_rgba(0,0,0,1)] relative">
                                <div className={`p-4 border-b-4 border-black flex items-center justify-between bg-white/5 transition-colors ${accessTier === 'ROOT' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    <div className="flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em]">
                                        <TerminalIcon className="w-3.5 h-3.5" />
                                        <span>Build Output: /root/aetheros/{accessTier.toLowerCase()}/apk</span>
                                    </div>
                                    {isCompiling && <div className="text-[8px] font-black animate-pulse">FORGING_BINARY...</div>}
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-1.5 custom-scrollbar font-mono text-[10px]">
                                    {buildLogs.map((log, i) => (
                                        <div key={i} className={`animate-in slide-in-from-left-2 ${log.includes('[SUCCESS]') ? 'text-green-400 font-black' : log.includes('[ROOT_FORGE]') ? 'text-red-500 font-bold' : log.includes('[APK_BUILD]') ? 'text-cyan-400' : 'text-gray-600'}`}>
                                            <span className="opacity-30 mr-1">[{i.toString().padStart(3, '0')}]</span>{log}
                                        </div>
                                    ))}
                                    <div ref={logEndRef} />
                                </div>

                                {isCompiling && (
                                    <div className="px-6 pb-6">
                                        <div className={`flex justify-between items-center text-[8px] font-black uppercase mb-1 px-1 tracking-widest ${accessTier === 'ROOT' ? 'text-red-500' : 'text-emerald-500'}`}>
                                            <span>Compiling Artifact</span>
                                            <span>{Math.round(compileProgress)}%</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-900 border-4 border-black rounded-lg overflow-hidden p-0.5">
                                            <div className={`h-full transition-all duration-300 rounded-md ${accessTier === 'ROOT' ? 'bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]'}`} style={{ width: `${compileProgress}%` }} />
                                        </div>
                                    </div>
                                )}

                                <div className="p-5 border-t-4 border-black bg-white/5 flex flex-col gap-4">
                                     <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={runBuild}
                                            disabled={isCompiling}
                                            className={`vista-button w-full py-4 text-base font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-[4px_4px_0_0_#000] ${accessTier === 'ROOT' ? 'bg-red-600 hover:bg-red-500 text-black border-red-900/50' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                                        >
                                            <CodeIcon className="w-4 h-4" />
                                            <span>BUILD {accessTier === 'ROOT' ? 'ROOTED' : 'DEBUG'} APK</span>
                                        </button>
                                        <button 
                                            onClick={() => console.log("PC VECTOR: Launching Electron-Builder sequence... (simulated)")}
                                            disabled={isCompiling}
                                            className="vista-button w-full bg-emerald-600 hover:bg-emerald-500 text-black py-4 text-base font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-[4px_4px_0_0_#000] disabled:opacity-20"
                                        >
                                            <ZapIcon className="w-4 h-4" />
                                            <span>BUILD PC .EXE</span>
                                        </button>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Tab Content: RPM REGISTRY AUDITOR */}
                {activeTab === 'rpm_registry' && (
                    <div className="flex-1 flex flex-col lg:flex-row gap-5 overflow-hidden w-full h-full">
                        
                        {/* Package list & filters */}
                        <div className="flex-1 flex flex-col bg-black/45 border-2 border-white/5 rounded-lg overflow-hidden p-4">
                            
                            {/* Filter and search bar */}
                            <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
                                <div className="relative flex-1 w-full">
                                    <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="text"
                                        placeholder="Search registered software components..."
                                        value={rpmSearch}
                                        onChange={e => setRpmSearch(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                                    />
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    {(['ALL', 'REGISTERED', 'STANDBY', 'ERROR'] as const).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setRpmFilter(f)}
                                            className={`px-3 py-1.5 text-[8px] font-black uppercase rounded border transition-all ${rpmFilter === f ? 'bg-emerald-600 text-black border-emerald-500' : 'bg-zinc-900 text-gray-400 border-zinc-800 hover:text-white'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Main list container */}
                            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                                {filteredRpms.length === 0 ? (
                                    <div className="text-center p-12 text-zinc-600 italic text-xs">
                                        No registered components matching search.
                                    </div>
                                ) : (
                                    filteredRpms.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedRpm(item)}
                                            className={`p-3 bg-zinc-950/60 border rounded-lg cursor-pointer transition-all flex justify-between items-center hover:bg-zinc-900/40 ${selectedRpm?.id === item.id ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'border-zinc-800'}`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-white">{item.name}</span>
                                                    <span className="text-[9px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 font-mono">{item.version}</span>
                                                </div>
                                                <p className="text-[9px] text-zinc-500 mt-1 uppercase tracking-tight">{item.category}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[8px] font-mono text-zinc-600 font-bold select-none bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-800">.{item.fileExt}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border uppercase ${item.status === 'REGISTERED' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40' : item.status === 'ERROR' ? 'bg-red-950/20 text-red-400 border-red-800/40' : 'bg-amber-950/20 text-amber-400 border-amber-800/40'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Package details panel */}
                        <div className="lg:w-[360px] flex flex-col gap-4 flex-shrink-0">
                            
                            {/* Host System Metadata */}
                            <div className="aero-panel p-4 bg-slate-950 border border-zinc-800 shadow-[4px_4px_0_0_rgba(0,0,0,0.8)]">
                                <h3 className="font-comic-header text-sm text-white uppercase italic mb-3 flex items-center gap-1.5">
                                    <ShieldIcon className="w-4 h-4 text-emerald-500" /> Host SMBIOS
                                </h3>
                                <div className="space-y-2 text-[10px]">
                                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                                        <span className="text-zinc-500">Service Tag:</span>
                                        <span className="text-green-400 font-bold bg-green-950/20 px-1.5 py-0.2 rounded border border-green-900/30">F0S41T2 [VALID]</span>
                                    </div>
                                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                                        <span className="text-zinc-500">Host Product:</span>
                                        <span className="text-white">Dell TechHub (SRP1602)</span>
                                    </div>
                                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                                        <span className="text-zinc-500">Instance ID:</span>
                                        <span className="text-cyan-400 font-bold truncate max-w-[150px]" title="{d2f1c788-2b33-4348-aafb-5898d8282043}">{'{d2f1c788-b33...}'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                                        <span className="text-zinc-500">Sub Agent:</span>
                                        <span className="text-zinc-400">Bradbury API | v1.6.278.4</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">DataStore State:</span>
                                        <span className="text-emerald-500">IDataStorePlugin Init</span>
                                    </div>
                                </div>
                            </div>

                            {/* Active Component Inspect */}
                            {selectedRpm ? (
                                <div className="aero-panel p-5 bg-zinc-950 border border-emerald-800/20 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Inspect Component</span>
                                        </div>
                                        <h4 className="text-lg font-black text-white">{selectedRpm.name}</h4>
                                        <div className="grid grid-cols-2 gap-3 mt-4 text-[10px]">
                                            <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
                                                <span className="text-[8px] text-zinc-500 block">VERSION</span>
                                                <span className="text-emerald-400 font-bold font-mono">{selectedRpm.version}</span>
                                            </div>
                                            <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
                                                <span className="text-[8px] text-zinc-500 block">FILE SUFFIX</span>
                                                <span className="text-zinc-300 font-mono">.{selectedRpm.fileExt}</span>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-900/60 p-3 rounded border border-zinc-800 mt-3 text-[10px] space-y-1.5">
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Vendor Group:</span>
                                                <span className="text-zinc-300">Dell TechHub</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Category:</span>
                                                <span className="text-zinc-300 truncate max-w-[160px]">{selectedRpm.category}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Verification:</span>
                                                <span className="text-emerald-500">0x03E2 SIGNED</span>
                                            </div>
                                        </div>

                                        <p className="text-[8px] text-zinc-500 italic leading-relaxed mt-4 bg-zinc-900/30 p-2.5 rounded border border-zinc-800/30">
                                            "Peer registration completed successfully with CoreServices.Client|1.6.278.4. Live socket channel is established over named memory pipeline."
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => {
                                            if (window.confirm(`Attempt repair / re-registration of ${selectedRpm.name}?`)) {
                                                alert(`Component ${selectedRpm.name} successfully re-registered!`);
                                            }
                                        }}
                                        className="w-full py-2.5 bg-zinc-900 hover:bg-emerald-600 border border-zinc-800 hover:border-emerald-500 hover:text-black transition-all text-[9px] font-black uppercase tracking-widest rounded-lg mt-6"
                                    >
                                        Re-register Component
                                    </button>
                                </div>
                            ) : (
                                <div className="aero-panel p-5 bg-zinc-950 border border-zinc-800 flex-1 flex items-center justify-center text-zinc-600 italic text-xs">
                                    Select a component to inspect.
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* Tab Content: JSON DESERIALIZER SANDBOX */}
                {activeTab === 'json_sandbox' && (
                    <div className="flex-1 flex flex-col lg:flex-row gap-5 overflow-hidden w-full h-full">
                        
                        {/* JSON Input Editor */}
                        <div className="flex-1 flex flex-col bg-black/45 border-2 border-white/5 rounded-lg overflow-hidden p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <TerminalIcon className="w-3.5 h-3.5" /> JSON Input Sandbox
                                </h3>
                                <button
                                    onClick={() => validateJsonInput("")}
                                    className="p-1 hover:text-red-500 transition-colors"
                                    title="Clear Editor"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <textarea
                                value={jsonInput}
                                onChange={e => validateJsonInput(e.target.value)}
                                placeholder="Paste or type JSON structure here to audit..."
                                className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none h-full custom-scrollbar"
                            />
                            <div className="mt-3 flex gap-3 text-[9px]">
                                <button
                                    onClick={() => validateJsonInput('{\n  "a": 1,\n  "b": [1, 2],\n  "c": "standard"\n}')}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded border border-zinc-800 font-bold"
                                >
                                    Load Sample A (Standard)
                                </button>
                                <button
                                    onClick={() => validateJsonInput('[\n  { "name": "Tomcat", "port": 8080 },\n  { "name": "Cassandra", "port": 9042 }\n]')}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded border border-zinc-800 font-bold"
                                >
                                    Load Sample B (Consistent Array)
                                </button>
                                <button
                                    onClick={() => validateJsonInput('[\n  { "name": "Tomcat", "port": 8080 },\n  { "title": "Missing Port", "count": 2 }\n]')}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded border border-zinc-800 font-bold"
                                >
                                    Load Sample C (Inconsistent Array)
                                </button>
                            </div>
                        </div>

                        {/* Audit diagnostics panel */}
                        <div className="lg:w-[400px] flex flex-col gap-4 flex-shrink-0">
                            
                            {/* Validation Status */}
                            <div className={`aero-panel p-5 border flex flex-col gap-3 rounded-lg ${jsonValidationResult.valid ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-red-950/20 border-red-800/30'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${jsonValidationResult.valid ? 'bg-emerald-600/10 text-emerald-500' : 'bg-red-600/10 text-red-500'}`}>
                                        {jsonValidationResult.valid ? <CheckCircleIcon className="w-5 h-5" /> : <WarningIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase text-white">LINT AUDIT STATUS</h4>
                                        <p className={`text-[9px] font-bold ${jsonValidationResult.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {jsonValidationResult.valid ? 'PASSED_CLEAN' : 'SERIALIZATION_FAIL'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-400 bg-black/40 p-2.5 rounded border border-zinc-900 font-mono mt-2 leading-relaxed">
                                    {jsonValidationResult.message}
                                </p>
                            </div>

                            {/* Deserializer Audit Tips */}
                            <div className="aero-panel p-5 bg-zinc-950 border border-zinc-800 flex-1 flex flex-col">
                                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-3 flex items-center gap-1.5">
                                    <ShieldIcon className="w-4 h-4 text-emerald-500" /> Deserializer Safe-Guard
                                </h4>
                                <p className="text-[9px] text-zinc-500 italic leading-normal mb-4">
                                    To avoid NewtonSoft.Json.JsonSerializationException, our backend validators audit properties recursively before sending them to the Core Services API.
                                </p>
                                
                                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                    {jsonValidationResult.tips && jsonValidationResult.tips.map((tip, idx) => (
                                        <div key={idx} className="bg-zinc-900/60 p-3 rounded border border-zinc-800 text-[10px] text-zinc-300 font-mono flex gap-2">
                                            <span className="text-emerald-500 font-bold font-mono">▸</span>
                                            <span>{tip}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 border-t border-zinc-800/50 pt-3">
                                    <button
                                        onClick={() => {
                                            try {
                                                const parsed = JSON.parse(jsonInput);
                                                validateJsonInput(JSON.stringify(parsed, null, 2));
                                            } catch (err) {
                                                alert("Cannot format. Please resolve syntax errors first.");
                                            }
                                        }}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-black py-2 text-[10px] font-black uppercase rounded-lg transition-all"
                                    >
                                        Auto-Format JSON
                                    </button>
                                </div>
                            </div>

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};
