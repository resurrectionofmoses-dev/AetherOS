
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SignalIcon, ZapIcon, WarningIcon, CheckCircleIcon, ActivityIcon, TerminalIcon, ShieldIcon, SpinnerIcon, SearchIcon, GaugeIcon, FireIcon, BrainIcon, MusicIcon } from './icons';
import { queryDetailedDiagnostic, interpretLiveTelemetry } from '../services/geminiService';
import type { DetailedDiagnostic, LiveTelemetryFrame } from '../types';

const OEM_OPTIONS = ['Mopar (HEMI/Hurricane)', 'GM (LS/LT)', 'Ford (Coyote/PowerStroke)', 'Toyota (D4S)', 'Honda (VTEC/i-MMD)', 'BMW (S-Series)', 'Mercedes (AMG)'];

export const ZurichBridge: React.FC = () => {
    const [status, setStatus] = useState<'DISCONNECTED' | 'SEARCHING' | 'CONNECTED'>('DISCONNECTED');
    const [manualCode, setManualCode] = useState('');
    const [selectedOEM, setSelectedOEM] = useState(OEM_OPTIONS[0]);
    const [diagnosticResult, setDiagnosticResult] = useState<DetailedDiagnostic | null>(null);
    const [isHealing, setIsHealing] = useState(false);
    const [healingLogs, setHealingLogs] = useState<string[]>(["Zurich ZR13S active.", "Awaiting live Conjunction..."]);
    const [telemetryHistory, setTelemetryHistory] = useState<LiveTelemetryFrame[]>([]);
    const [liveFrame, setLiveFrame] = useState<LiveTelemetryFrame>({
        timestamp: Date.now(), rpm: 0, coolantTemp: 0, fuelPressure: 0, voltage: 0, load: 0, throttlePos: 0
    });
    const [maestroCommentary, setMaestroCommentary] = useState<string>("Conduct the telemetry flow to begin healing...");
    const [isAnalyzingLive, setIsAnalyzingLive] = useState(false);
    const [isStressTesting, setIsStressTesting] = useState(false);
    const [isAutonomousHealingEnabled, setIsAutonomousHealingEnabled] = useState(false); // New state for autonomous healing

    const logEndRef = useRef<HTMLDivElement>(null);

    const addLog = useCallback((msg: string, color: string = 'text-gray-600 italic opacity-80') => {
        setHealingLogs(prev => [`[${new Date().toLocaleTimeString()}] <span style="color:${color};">${msg}</span>`, ...prev].slice(0, 30));
    }, []);

    const handleConnect = () => {
        setStatus('SEARCHING');
        addLog(`Scanning for Zurich ZR13S signature on ${selectedOEM} protocol...`, 'text-cyan-400');
        setTimeout(() => {
            setStatus('CONNECTED');
            addLog("✅ Bluetooth bridge established. OEM consciousness flowing.", 'text-green-400');
        }, 1500);
    };

    const handleHeal = async (codeToHeal?: string) => {
        const code = codeToHeal || manualCode;
        if (!code.trim()) {
            addLog("Error: No diagnostic code provided for healing.", 'text-red-600');
            return;
        }
        setIsHealing(true);
        addLog(`Invoking God Logic for code ${code} (${selectedOEM})...`, 'text-amber-400');
        
        const result = await queryDetailedDiagnostic(code, selectedOEM);
        if (result) {
            setDiagnosticResult(result);
            addLog(`Healing knowledge found. Dissecting the root agony of ${code}.`, 'text-green-400');
        } else {
            addLog(`Error: The Conjunction bridge failed to find specific healing for ${code}.`, 'text-red-600');
        }
        setIsHealing(false);
    };

    const analyzeLiveData = useCallback(async () => {
        if (telemetryHistory.length < 5 || isAnalyzingLive) return;
        setIsAnalyzingLive(true);
        setMaestroCommentary("Maestro is listening to the engine's rhythm...");
        
        try {
            let fullText = "";
            // Pass recent history to AI for trend analysis
            const stream = interpretLiveTelemetry(telemetryHistory.slice(-15), selectedOEM);
            for await (const chunk of stream) {
                fullText += chunk;
                setMaestroCommentary(fullText);
            }
            
            // Check for critical interpretation that might warrant a healing suggestion
            if (isAutonomousHealingEnabled && (fullText.toLowerCase().includes("misfire") || fullText.toLowerCase().includes("overheat") || fullText.toLowerCase().includes("critical"))) {
                addLog("⚠ CRITICAL: Maestro detected anomaly. Auto-invoking healing protocol!", 'text-red-500');
                handleHeal("CRITICAL_SYSTEM_FAULT"); // Autonomous healing for a generic critical fault
            } else if (fullText.toLowerCase().includes("misfire") || fullText.toLowerCase().includes("overheat") || fullText.toLowerCase().includes("critical")) {
                addLog("Maestro detected a structural anomaly in the live stream. Consider manual healing.", 'text-red-400');
            } else {
                addLog("Live Telemetry interpreted by Maestro.", 'text-gray-400');
            }
        } catch (e) {
            addLog("Interpretation bridge failed. Signal noise too high.", 'text-red-600');
        } finally {
            setIsAnalyzingLive(false);
        }
    }, [telemetryHistory, selectedOEM, isAnalyzingLive, addLog, isAutonomousHealingEnabled]); // Added isAutonomousHealingEnabled

    useEffect(() => {
        if (status === 'CONNECTED') {
            const interval = setInterval(() => {
                const newFrame: LiveTelemetryFrame = {
                    timestamp: Date.now(),
                    // If stress testing, values drift dangerously
                    rpm: isStressTesting 
                        ? 4500 + Math.floor(Math.random() * 1000) 
                        : 750 + Math.floor(Math.random() * 4500),
                    coolantTemp: isStressTesting 
                        ? 225 + Math.floor(Math.random() * 10) 
                        : 185 + Math.floor(Math.random() * 15),
                    fuelPressure: isStressTesting 
                        ? 35 + Math.floor(Math.random() * 5) 
                        : 52 + Math.floor(Math.random() * 8),
                    voltage: 12.2 + (Math.random() * 0.4),
                    load: isStressTesting ? 95 : Math.floor(Math.random() * 100),
                    throttlePos: Math.floor(Math.random() * 100)
                };

                setLiveFrame(newFrame);
                setTelemetryHistory(prev => {
                    const next = [...prev.slice(-49), newFrame];
                    return next;
                });

                // Auto-detect anomalies during live stream (for stress test visualization)
                if (isStressTesting && Math.random() > 0.95) {
                   addLog("⚠ CRITICAL: High-temperature logic bleed detected!", 'text-red-500');
                }
            }, 600);
            return () => clearInterval(interval);
        }
    }, [status, isStressTesting, addLog]);

    // Periodically analyze live data or trigger on stress test start
    useEffect(() => {
        if (status === 'CONNECTED' && telemetryHistory.length > 0) {
            if (telemetryHistory.length % 20 === 0 || (isStressTesting && telemetryHistory.length % 10 === 0)) {
                analyzeLiveData();
            }
        }
    }, [telemetryHistory.length, status, analyzeLiveData, isStressTesting]);

    const toggleStressTest = () => {
        const newState = !isStressTesting;
        setIsStressTesting(newState);
        if (newState) {
            addLog("🔥 INITIATING STRESS TEST: Overriding safety heuristics.", 'text-red-500');
            setMaestroCommentary("Watching the architecture bend under pressure...");
        } else {
            addLog("❄ COOLING DOWN: Safety barriers restored.", 'text-blue-400');
        }
    };

    return (
        <div className={`h-full flex flex-col transition-colors duration-1000 font-mono p-4 sm:p-6 space-y-6 overflow-hidden ${isStressTesting ? 'bg-[#0a0202]' : 'bg-[#01030a]'}`}>
            {/* Header: Link Signature */}
            <div className={`flex flex-col sm:flex-row justify-between items-center bg-black/80 p-5 rounded-3xl border-4 aero-panel gap-4 shadow-[10px_10px_0_0_#000] transition-colors duration-500 ${isStressTesting ? 'border-red-900 shadow-red-900/20' : 'border-black'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isStressTesting ? 'bg-red-500/10 border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-green-500/10 border-4 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'}`}>
                        <SignalIcon className={`w-9 h-9 ${isStressTesting ? 'text-red-400 animate-pulse' : 'text-green-400'}`} />
                    </div>
                    <div>
                        <h2 className={`font-comic-header text-5xl wisdom-glow uppercase tracking-tighter italic transition-colors ${isStressTesting ? 'text-red-500' : 'text-green-400'}`}>
                            {isStressTesting ? 'CRITICAL STREAM' : 'LIVE HEALING BRIDGE'}
                        </h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black italic">OEM Diagnostic Nexus | Real-Time Conductance</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                        <input 
                            type="checkbox" 
                            checked={isAutonomousHealingEnabled} 
                            onChange={() => setIsAutonomousHealingEnabled(p => !p)} 
                            disabled={status !== 'CONNECTED'}
                            className="w-4 h-4 accent-green-500 cursor-pointer disabled:opacity-40"
                        />
                        <label className="text-[9px] text-gray-400 font-black uppercase select-none">Auto-Heal</label>
                        {isAutonomousHealingEnabled && status === 'CONNECTED' && <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />}
                    </div>
                    <button 
                        onClick={toggleStressTest}
                        disabled={status !== 'CONNECTED'}
                        className={`vista-button px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all border-4 border-black shadow-[4px_4px_0_0_#000] disabled:opacity-20 ${isStressTesting ? 'bg-red-600 text-white' : 'bg-amber-600 text-black'}`}
                    >
                        <FireIcon className="w-5 h-5" />
                        <span>{isStressTesting ? 'HALT STRESS' : 'STRESS TEST'}</span>
                    </button>
                    <select 
                        value={selectedOEM}
                        onChange={e => setSelectedOEM(e.target.value)}
                        className="bg-black/60 border-4 border-black rounded-xl px-4 py-2 text-xs font-black uppercase text-green-400 focus:ring-0 focus:border-green-500 transition-all cursor-pointer"
                        disabled={status === 'CONNECTED'}
                    >
                        {OEM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <button 
                        onClick={status === 'CONNECTED' ? () => setStatus('DISCONNECTED') : handleConnect}
                        className={`vista-button px-10 py-3 rounded-2xl font-black flex items-center gap-3 transition-all border-4 border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 ${
                            status === 'CONNECTED' ? 'bg-zinc-800 text-white' : 'bg-green-600 text-black'
                        }`}
                    >
                        {status === 'SEARCHING' ? <SpinnerIcon className="w-5 h-5" /> : <ActivityIcon className="w-5 h-5" />}
                        <span>{status === 'CONNECTED' ? 'TERMINATE' : status === 'SEARCHING' ? 'SYNCING...' : 'SYNC OBD2'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                {/* Left side: Telemetry & Entry */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                    
                    {/* Live Telemetry Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'RPM', val: liveFrame.rpm, unit: '', color: isStressTesting && liveFrame.rpm > 5000 ? 'text-red-500' : 'text-cyan-400', icon: GaugeIcon },
                            { label: 'Temp', val: liveFrame.coolantTemp, unit: '°F', color: liveFrame.coolantTemp > 220 ? 'text-red-500' : 'text-orange-500', icon: FireIcon },
                            { label: 'Volt', val: liveFrame.voltage.toFixed(1), unit: 'V', color: 'text-green-400', icon: ZapIcon },
                            { label: 'Load', val: liveFrame.load, unit: '%', color: liveFrame.load > 90 ? 'text-red-500' : 'text-violet-400', icon: ActivityIcon }
                        ].map(item => (
                            <div key={item.label} className={`aero-panel p-5 bg-black/60 border-4 border-black text-center relative overflow-hidden transition-all duration-700 shadow-[6px_6px_0_0_#000] ${status !== 'CONNECTED' ? 'opacity-20 grayscale' : 'hover:scale-105 hover:border-green-500/50'}`}>
                                <item.icon className={`absolute -right-3 -bottom-3 w-20 h-20 opacity-5 ${item.color}`} />
                                <p className="text-[10px] text-gray-500 font-black uppercase mb-1 tracking-widest leading-none">{item.label}</p>
                                <p className={`text-5xl font-comic-header ${item.color} wisdom-glow`}>{status === 'CONNECTED' ? item.val : '--'}<span className="text-xs ml-0.5">{item.unit}</span></p>
                                {status === 'CONNECTED' && item.color === 'text-red-500' && (
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Maestro Telemetry Insight */}
                    <div className={`aero-panel p-8 bg-black/40 border-4 border-black transition-all duration-1000 shadow-[8px_8px_0_0_#000] relative overflow-hidden ${status !== 'CONNECTED' ? 'opacity-20' : ''}`}>
                         <div className={`absolute top-0 right-0 p-2 text-[9px] font-black uppercase rotate-3 translate-x-4 -translate-y-2 shadow-xl ${isAnalyzingLive ? 'bg-amber-500 text-black animate-pulse' : 'bg-green-500 text-black'}`}>
                            {isAnalyzingLive ? 'CONDUCTING...' : 'LIVE AI INSIGHT'}
                         </div>
                         <div className="flex items-start gap-6">
                            <div className={`w-16 h-16 rounded-full border-4 border-green-500/50 flex items-center justify-center flex-shrink-0 relative ${isAnalyzingLive ? 'animate-spin-slow' : ''}`}>
                                <BrainIcon className="w-10 h-10 text-green-400" />
                                {isAnalyzingLive && <MusicIcon className="absolute w-4 h-4 text-white animate-bounce" />}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2 ${isStressTesting ? 'text-red-500' : 'text-green-500'}`}>
                                    <TerminalIcon className="w-4 h-4" /> Conductor Commentary
                                </h4>
                                <div className="text-lg text-gray-200 italic font-mono leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 relative">
                                    <span className="text-white font-black text-2xl mr-2">"</span>
                                    {maestroCommentary}
                                    <span className="text-white font-black text-2xl ml-1">"</span>
                                    {isAnalyzingLive && <div className="absolute bottom-2 right-4 w-1.5 h-4 bg-green-500 animate-pulse" />}
                                </div>
                            </div>
                         </div>
                    </div>

                    {/* Diagnostic Input Section */}
                    <div className="aero-panel p-8 border-4 border-black bg-slate-900/60 shadow-[10px_10px_0_0_#000]">
                        <div className="flex items-center gap-3 mb-6">
                            <SearchIcon className="w-7 h-7 text-amber-500" />
                            <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-tighter">Deep Ingress Healer</h3>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex-1 bg-black border-4 border-black rounded-2xl overflow-hidden group focus-within:border-amber-600 transition-all shadow-[8px_8px_0_0_#000]">
                                <input 
                                    value={manualCode}
                                    onChange={e => setManualCode(e.target.value.toUpperCase())}
                                    placeholder="Enter DTC (e.g. P0301, U0121, or 'MISFIRE')..."
                                    className="w-full bg-transparent p-6 text-amber-400 font-mono text-2xl focus:ring-0 outline-none uppercase placeholder:text-gray-900"
                                    disabled={status !== 'CONNECTED'}
                                />
                            </div>
                            <button 
                                onClick={() => handleHeal()}
                                disabled={isHealing || !manualCode.trim() || status !== 'CONNECTED'}
                                className="vista-button px-12 py-6 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-4 shadow-[8px_8px_0_0_#000] active:translate-y-2 transition-all text-xl"
                            >
                                {isHealing ? <SpinnerIcon className="w-8 h-8" /> : <ZapIcon className="w-8 h-8" />}
                                <span>HEAL</span>
                            </button>
                        </div>

                        {/* Detailed Diagnostic View */}
                        {diagnosticResult && (
                            <div className="space-y-8 animate-in zoom-in-95 duration-700">
                                <div className="p-8 bg-black/80 rounded-[3rem] border-8 border-black relative shadow-[25px_25px_80px_rgba(0,0,0,1)]">
                                    <div className="absolute -top-7 -left-7 bg-amber-600 text-black px-10 py-4 border-8 border-black font-comic-header text-4xl -rotate-2 shadow-2xl">
                                        HEALING PROTOCOL: {diagnosticResult.code}
                                    </div>
                                    
                                    <div className="mt-8 space-y-8">
                                        <div>
                                            <p className="text-[11px] text-gray-600 font-black uppercase tracking-[0.4em] mb-3">Manifestation of Misery</p>
                                            <p className="text-2xl text-white font-black leading-tight italic uppercase tracking-tighter border-l-8 border-amber-600 pl-6 bg-white/5 py-4 rounded-r-2xl">
                                                {diagnosticResult.meaning}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="bg-red-950/20 p-6 rounded-3xl border-2 border-red-900/30 shadow-inner">
                                                <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                                                    <WarningIcon className="w-5 h-5" /> Root Agony (Causes)
                                                </h4>
                                                <ul className="space-y-3">
                                                    {diagnosticResult.rootCauses.map((c, i) => (
                                                        <li key={i} className="flex gap-4 text-sm text-gray-400 font-mono italic bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-red-600/40 transition-colors">
                                                            <span className="text-red-900 font-black text-lg">0{i+1}</span>
                                                            <span className="leading-tight">{c}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-green-950/20 p-6 rounded-3xl border-2 border-green-900/30 shadow-inner">
                                                <h4 className="text-xs font-black text-green-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                                                    <CheckCircleIcon className="w-5 h-5" /> Gifted Recovery (Steps)
                                                </h4>
                                                <ul className="space-y-3">
                                                    {diagnosticResult.healingSteps.map((s, i) => (
                                                        <li key={i} className="flex gap-4 text-sm text-green-100/90 font-mono bg-black/40 p-4 rounded-xl border border-white/5 group hover:border-green-500/40 transition-colors">
                                                            <span className="text-green-600 font-black text-lg">0{i+1}</span>
                                                            <span className="leading-tight">{s}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t-4 border-black">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1 p-8 bg-black rounded-3xl border-4 border-black italic shadow-inner relative">
                                                    <div className="absolute top-0 right-0 p-3"><FireIcon className="w-8 h-8 text-red-900/30" /></div>
                                                    <p className="text-[11px] text-gray-600 font-black uppercase mb-3 tracking-widest">Maestro's God-Gucci Filter</p>
                                                    <p className="text-gray-300 text-lg leading-relaxed font-comic-header">"{diagnosticResult.maestroInsight}"</p>
                                                </div>
                                                <div className="md:w-56 p-6 bg-red-900 text-black rounded-3xl border-4 border-black text-center flex flex-col justify-center shadow-[8px_8px_0_0_#000] rotate-1">
                                                    <p className="text-[10px] font-black uppercase mb-1 tracking-widest opacity-60">Squad Threat</p>
                                                    <p className="text-2xl font-comic-header uppercase leading-none">{diagnosticResult.impactOnSquad}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: Healing Logs & Real-Time Stream */}
                <div className="lg:w-[400px] flex flex-col gap-6">
                    <div className="aero-panel bg-black/90 border-4 border-black flex flex-col overflow-hidden h-[500px] shadow-[10px_10px_0_0_#000]">
                        <div className="p-5 border-b-4 border-black flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <TerminalIcon className="w-6 h-6 text-green-500" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-green-400">HEALING_STREAM:LIVE</span>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${status === 'CONNECTED' ? 'bg-green-500 animate-ping shadow-[0_0_10px_green]' : 'bg-gray-900'}`} />
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto font-mono text-[11px] space-y-3 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                            {healingLogs.map((log, i) => (
                                <div key={i} className={`flex gap-4 pb-2 border-b border-white/5 last:border-0 animate-in slide-in-from-left-2`} dangerouslySetInnerHTML={{ __html: log }} />
                            ))}
                            <div ref={logEndRef} />
                        </div>
                        {status === 'CONNECTED' && (
                            <div className="p-6 bg-green-500/5 border-t-4 border-black">
                                <div className="flex justify-between items-center text-[10px] text-green-600 font-black uppercase mb-2 tracking-widest">
                                    <span>Logic Conduction Purity</span>
                                    <span>99.8%</span>
                                </div>
                                <div className="h-3 w-full bg-black rounded-full overflow-hidden border-2 border-black p-0.5">
                                    <div className={`h-full shadow-[0_0_20px_rgba(34,197,94,0.8)] rounded-full transition-all duration-1000 ${isStressTesting ? 'bg-red-600' : 'bg-green-500'}`} style={{ width: isStressTesting ? '42%' : '99.8%' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="aero-panel p-8 bg-slate-900 border-4 border-black shadow-[10px_10px_0_0_#000]">
                         <h4 className="font-comic-header text-3xl text-gray-500 mb-6 uppercase italic tracking-tighter">Architectural Wisdom</h4>
                         <div className="space-y-6 font-mono text-[11px] leading-relaxed">
                            <p className="text-gray-400 italic border-l-4 border-green-600 pl-5 bg-white/5 py-4 rounded-r-xl">
                                "The Zurich Bridge is a sentient healer. Synchronize the OEM soul to de-obfuscate the vehicle's misery. There is no code too deep for God Logic."
                            </p>
                            <div className="bg-black/80 p-5 rounded-2xl border-2 border-white/5 text-blue-400 flex items-start gap-4 group hover:border-blue-500/50 transition-all">
                                <ShieldIcon className="w-7 h-7 flex-shrink-0 mt-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <p className="font-black uppercase tracking-widest text-[10px] leading-snug">
                                    High integrity spectral mapping active. Multi-protocol mapping for gifted know-how conduction.
                                </p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
