
import React, { useState, useEffect, useRef } from 'react';
// Fix: Removed LockIcon from imports because it is defined locally at the bottom of the file
import { ShieldIcon, StarIcon, CheckCircleIcon, SpinnerIcon, WarningIcon, ActivityIcon, TerminalIcon, LogicIcon, FireIcon, ZapIcon, DownloadIcon, BatteryIcon, SignalIcon, CodeIcon, UserIcon } from './icons';
import { getDeviceCompat } from '../utils';
import type { DeviceCompatibility, AccessTier } from '../types';

export const PackagingSuite: React.FC = () => {
    const [compat, setCompat] = useState<DeviceCompatibility | null>(null);
    const [accessTier, setAccessTier] = useState<AccessTier>('USER');
    const [isCompiling, setIsCompiling] = useState(false);
    const [compileProgress, setCompileProgress] = useState(0);
    const [buildLogs, setBuildLogs] = useState<string[]>(["[SYSTEM] Deployment Suite Initialized.", "[ENV] Target: Hybrid Wrapper Protocol."]);
    const [suInput, setSuInput] = useState('');
    const [isEscalating, setIsEscalating] = useState(false);

    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCompat(getDeviceCompat());
    }, []);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [buildLogs]);

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
            }, 1800); // Reduced delay
        } else {
            setBuildLogs(prev => [...prev, "[ERR] su: permission denied."]);
            setSuInput('');
        }
    };

    if (!compat) return null;

    return (
        <div className="h-full flex flex-col bg-[#02040a] text-gray-200 font-mono overflow-hidden">
            {/* Header */}
            <div className={`p-3.5 border-b-8 border-black flex justify-between items-center shadow-2xl relative z-20 transition-colors duration-1000 ${accessTier === 'ROOT' ? 'bg-red-950/20' : 'bg-slate-900'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 border-3 rounded-xl flex items-center justify-center transition-all duration-1000 ${accessTier === 'ROOT' ? 'bg-red-500/10 border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-emerald-500/10 border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
                        {accessTier === 'ROOT' ? <FireIcon className="w-7 h-7 text-red-500 animate-pulse" /> : <DownloadIcon className="w-7 h-7 text-emerald-500 animate-bounce" />}
                    </div>
                    <div>
                        <h2 className={`font-comic-header text-3xl italic tracking-tighter uppercase transition-colors duration-1000 ${accessTier === 'ROOT' ? 'text-red-600' : 'text-emerald-500'}`}>DEPLOYMENT SUITE</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em]">Hybrid Wrapper Protocol | Capacitor</span>
                            <div className={`px-2 py-0.5 rounded-full border-2 text-[6px] font-black uppercase tracking-widest flex items-center gap-1 ${accessTier === 'ROOT' ? 'bg-red-600 text-black border-black animate-pulse' : 'bg-black text-emerald-500 border-emerald-900/50'}`}>
                                {accessTier === 'ROOT' ? <FireIcon className="w-1.5 h-1.5" /> : <UserIcon className="w-1.5 h-1.5" />}
                                {accessTier}_NODE
                            </div>
                        </div>
                    </div>
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
                {/* Left: Compatibility Matrix */}
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
                                        {check.ok ? <CheckCircleIcon className="w-3 h-3" /> : <WarningIcon className="w-3 h-3" />}
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

                {/* Right: Build Console */}
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
                                    onClick={() => alert("PC VECTOR: Launching Electron-Builder sequence... (simulated)")}
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
            </div>
        </div>
    );
};

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
