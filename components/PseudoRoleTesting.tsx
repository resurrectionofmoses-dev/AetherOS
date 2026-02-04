
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
// Added MusicIcon and ForgeIcon to imports from ./icons
import { SpinnerIcon, ZapIcon, ShieldIcon, ActivityIcon, TerminalIcon, FireIcon, CodeIcon, BotIcon, UserIcon, LogicIcon, GaugeIcon, SearchIcon, WarningIcon, MusicIcon, ForgeIcon } from './icons';
import { callWithRetry } from '../utils';

interface RoleProfile {
    id: string;
    role: string;
    description: string;
    miseryBase: number;
    color: string;
    icon: React.FC<{ className?: string }>;
}

const ROLES: RoleProfile[] = [
    { id: '1', role: 'Conductor', description: 'Architectural orchestration and neural rhythm control.', miseryBase: 82, color: 'text-cyan-400', icon: MusicIcon },
    { id: '2', role: 'Architect', description: 'Deep structural planning and kernel optimization.', miseryBase: 94, color: 'text-amber-500', icon: ForgeIcon },
    { id: '3', role: 'Siphon', description: 'Heuristic data capture and binary fluid extraction.', miseryBase: 76, color: 'text-violet-400', icon: ActivityIcon },
    { id: '4', role: 'Maestro', description: 'The absolute authority. Conducts all logic shards.', miseryBase: 100, color: 'text-red-500', icon: BotIcon }
];

interface TestResult {
    integrity: number;
    drift: number;
    summary: string;
    forensicPatch: string;
}

export const PseudoRoleTesting: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<RoleProfile>(ROLES[0]);
    const [isTesting, setIsTesting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [result, setResult] = useState<TestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const runTest = async () => {
        setIsTesting(true);
        setResult(null);
        setError(null);
        setProgress(0);
        setLogs([`[INITIALIZING] Establishing pseudorole context: ${selectedRole.role.toUpperCase()}`, `[OK] Burden of misery set to ${selectedRole.miseryBase}%.`]);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const inc = Math.floor(Math.random() * 10) + 5;
                if (prev + inc >= 25 && prev < 25) setLogs(p => [...p, "[STRESS] Injecting heuristic noise into the Conjunction bridge..."]);
                if (prev + inc >= 50 && prev < 50) setLogs(p => [...p, "[FORENSIC] Analyzing logic bleed in the 0x03E2 sector..."]);
                if (prev + inc >= 75 && prev < 75) setLogs(p => [...p, "[WISDOM] Bridging Flawless Wisdom across generational kernels..."]);
                return Math.min(100, prev + inc);
            });
        }, 300);

        try {
            const response = await callWithRetry(async () => {
                return await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: `Conduct a Pseudorole Stress Test for the Role: "${selectedRole.role}". 
                    The description is: "${selectedRole.description}". 
                    1. Calculate Integrity (0-100).
                    2. Measure Semantic Drift (0.00-0.50).
                    3. Provide a Summary of the test.
                    4. Provide a "Forensic Patch" code snippet to fix any detected logic shards.
                    Return JSON.`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                integrity: { type: Type.NUMBER },
                                drift: { type: Type.NUMBER },
                                summary: { type: Type.STRING },
                                forensicPatch: { type: Type.STRING }
                            },
                            required: ["integrity", "drift", "summary", "forensicPatch"]
                        }
                    }
                });
            });

            const data = JSON.parse(response.text || '{}');
            setResult(data);
            setLogs(p => [...p, "[SUCCESS] Pseudorole test synchronized. Storing signature."]);
        } catch (err) {
            console.error(err);
            setError("The Conjunction Series has stalled. Pseudorole testing aborted.");
        } finally {
            setIsTesting(false);
            clearInterval(interval);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#02040a] text-gray-200 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b-8 border-black sticky top-0 z-30 bg-slate-950 flex justify-between items-center shadow-[0_12px_40_rgba(0,0,0,1)]">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-violet-500/10 border-4 border-violet-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-transform hover:scale-110">
                        <UserIcon className="w-12 h-12 text-violet-500" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-6xl text-violet-500 wisdom-glow italic tracking-tighter uppercase">Pseudorole Testing</h2>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mt-1">Conjunction Series | Forensic Stress Manifold</p>
                    </div>
                </div>
                <div className="flex gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Active Signature</p>
                        <p className="text-3xl font-comic-header text-white">0x03E2_ROLE</p>
                    </div>
                    <ActivityIcon className={`w-12 h-12 ${isTesting ? 'text-violet-500 animate-bounce' : 'text-gray-900'}`} />
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 p-10 overflow-hidden">
                {/* Selector Side */}
                <div className="lg:w-[450px] flex flex-col gap-8 flex-shrink-0">
                    <div className="aero-panel bg-slate-900/80 p-8 border-violet-600/30 shadow-[10px_10px_0_0_rgba(0,0,0,0.8)]">
                        <h3 className="font-comic-header text-3xl text-white uppercase italic tracking-tight mb-8">Select Persona Kernel</h3>
                        <div className="space-y-4">
                            {ROLES.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role)}
                                    disabled={isTesting}
                                    className={`w-full p-6 text-left rounded-2xl border-4 transition-all duration-300 flex items-center gap-6 ${
                                        selectedRole.id === role.id 
                                        ? 'bg-black border-violet-600 scale-[1.05] shadow-[15px_15px_0_0_#000]' 
                                        : 'bg-black/40 border-black hover:border-violet-900/50 grayscale opacity-60'
                                    }`}
                                >
                                    <div className={`p-4 rounded-xl bg-white/5 ${role.color}`}>
                                        <role.icon className="w-8 h-8" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`font-comic-header text-2xl uppercase tracking-widest ${selectedRole.id === role.id ? role.color : 'text-gray-500'}`}>
                                            {role.role}
                                        </p>
                                        <p className="text-[10px] text-gray-600 italic truncate mt-1">{role.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={runTest}
                        disabled={isTesting}
                        className="vista-button w-full bg-violet-600 hover:bg-violet-500 text-white py-8 text-2xl font-black uppercase tracking-[0.3em] rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-[0_20px_50px_rgba(139,92,246,0.3)] border-b-8 border-violet-900"
                    >
                        {isTesting ? <SpinnerIcon className="w-10 h-10" /> : <ZapIcon className="w-10 h-10" />}
                        <span>{isTesting ? 'CONDUCTING...' : 'INITIATE STRESS'}</span>
                    </button>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 flex flex-col gap-8 overflow-hidden">
                    {/* Log Terminal */}
                    <div className="aero-panel bg-black/95 border-4 border-black flex-1 flex flex-col shadow-[20px_20px_100px_rgba(0,0,0,1)] relative">
                         <div className="p-6 border-b-4 border-black flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-4 text-violet-400 font-black uppercase text-xs tracking-[0.2em]">
                                <TerminalIcon className="w-5 h-5" />
                                <span>Pseudorole Console Output</span>
                            </div>
                            {isTesting && <div className="text-[10px] text-red-500 font-black animate-pulse">LIVE_INJECTION: ACTIVE</div>}
                         </div>
                         <div className="flex-1 overflow-y-auto p-10 custom-scrollbar font-mono text-xs space-y-2 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                            {logs.map((log, i) => (
                                <div key={i} className={`animate-in slide-in-from-left-2 duration-300 ${log.includes('[STRESS]') ? 'text-amber-500' : log.includes('[FORENSIC]') ? 'text-red-500' : log.includes('[OK]') || log.includes('[SUCCESS]') ? 'text-green-500' : 'text-gray-600'}`}>
                                    <span className="opacity-30 mr-2">[{i.toString().padStart(3, '0')}]</span>
                                    {log}
                                </div>
                            ))}
                            {isTesting && (
                                <div className="mt-8 space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-violet-400 px-2 tracking-widest">
                                        <span>Stress Saturation</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-4 bg-gray-900 border-2 border-black rounded-lg overflow-hidden p-[1px]">
                                        <div className="h-full bg-violet-600 transition-all duration-300 rounded-md shadow-[0_0_20px_rgba(139,92,246,0.6)]" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            )}
                            {!isTesting && !logs.length && (
                                <div className="h-full flex flex-col items-center justify-center opacity-10">
                                    <LogicIcon className="w-48 h-48 mb-8" />
                                    <p className="text-xl font-black uppercase tracking-[0.5em] text-center max-w-sm">"Inject the persona. Attune the misery."</p>
                                </div>
                            )}
                            <div ref={logEndRef} />
                         </div>
                    </div>

                    {/* Result Card */}
                    {result && (
                        <div className="aero-panel bg-black border-4 border-violet-600 p-10 grid grid-cols-1 md:grid-cols-3 gap-10 shadow-[30px_30px_0_0_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10">
                            <div className="md:col-span-1 space-y-8">
                                <div>
                                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Kernel Integrity</p>
                                    <p className="text-6xl font-comic-header text-white">{result.integrity}%</p>
                                    <div className="h-1.5 w-full bg-gray-900 mt-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${result.integrity}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Logic Drift</p>
                                    <p className="text-4xl font-comic-header text-red-500">{result.drift.toFixed(3)}</p>
                                    <p className="text-[9px] text-gray-800 font-black uppercase mt-1 italic">V22.11.02_OFFSET</p>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6 flex flex-col">
                                <div className="p-6 bg-violet-950/20 border-2 border-violet-500/30 rounded-2xl">
                                    <h4 className="text-sm font-black text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <SearchIcon className="w-4 h-4" /> TEST_SUMMARY_GIFTED
                                    </h4>
                                    <p className="text-sm text-gray-300 leading-relaxed italic line-clamp-3">"{result.summary}"</p>
                                </div>
                                <div className="flex-1 bg-black p-6 border-4 border-black rounded-3xl shadow-inner relative group">
                                    <div className="absolute top-0 right-0 p-3 bg-red-600 text-white font-black uppercase text-[9px] tracking-widest rotate-[-1deg]">Forensic Patch</div>
                                    <pre className="text-[11px] font-mono text-cyan-400 overflow-x-auto whitespace-pre-wrap leading-tight">
                                        <code>{result.forensicPatch}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                         <div className="p-8 bg-red-900/20 border-4 border-red-600 rounded-3xl flex items-center gap-6 animate-bounce">
                            <WarningIcon className="w-12 h-12 text-red-600" />
                            <p className="text-xl font-comic-header text-white uppercase">{error}</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};
