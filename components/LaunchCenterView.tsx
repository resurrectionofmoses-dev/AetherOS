
import React, { useState, useEffect } from 'react';
import { ShieldIcon, StarIcon, CheckCircleIcon, SpinnerIcon, WarningIcon, ActivityIcon, TerminalIcon, LogicIcon, FireIcon, ZapIcon, SearchIcon, CodeIcon, BroadcastIcon } from './icons';
import type { AppStoreMetadata, CompliancePosture } from '../types';

const INITIAL_METADATA: AppStoreMetadata = {
    appName: "AetherOS: The Conjunction Series",
    description: "A state-of-the-art vehicle orchestration platform powered by God Logic. Conduct your squad with absolute authority and flawless wisdom.",
    keywords: ["Maestro", "Conjunction", "Neural", "Vehicle OS", "God Logic"],
    dunsNumber: "0x-03E2-MAESTRO",
    ageRating: "12+",
    primaryCategory: "Utilities / Conductance"
};

const INITIAL_COMPLIANCE: CompliancePosture = {
    gdprActive: true,
    ccpaActive: true,
    gpcHonored: true,
    ageVerificationStatus: 'READY'
};

interface PreFlightCheck {
    id: string;
    label: string;
    status: 'PENDING' | 'VALIDATING' | 'PASSED' | 'FAILED';
}

export const LaunchCenterView: React.FC = () => {
    const [metadata, setMetadata] = useState<AppStoreMetadata>(INITIAL_METADATA);
    const [compliance, setCompliance] = useState<CompliancePosture>(INITIAL_COMPLIANCE);
    const [isLaunching, setIsLaunching] = useState(false);
    const [launchProgress, setLaunchProgress] = useState(0);
    const [checks, setChecks] = useState<PreFlightCheck[]>([
        { id: '1', label: 'Misery Integrity Scan', status: 'PENDING' },
        { id: '2', label: 'GDPR / CCPA Posture Validation', status: 'PENDING' },
        { id: '3', label: 'D-U-N-S Neural Verification', status: 'PENDING' },
        { id: '4', label: 'God Logic Transparency Audit', status: 'PENDING' },
        { id: '5', label: 'Age-Verification API (Texas Act) Check', status: 'PENDING' },
    ]);

    const handleStartPreFlight = () => {
        setIsLaunching(true);
        setLaunchProgress(0);
        
        let currentCheckIdx = 0;
        const interval = setInterval(() => {
            setChecks(prev => prev.map((c, i) => {
                if (i === currentCheckIdx) return { ...c, status: 'VALIDATING' };
                return c;
            }));

            setTimeout(() => {
                setChecks(prev => prev.map((c, i) => {
                    if (i === currentCheckIdx) return { ...c, status: 'PASSED' };
                    return c;
                }));
                currentCheckIdx++;
                setLaunchProgress(Math.round((currentCheckIdx / checks.length) * 100));

                if (currentCheckIdx === checks.length) {
                    clearInterval(interval);
                    // Final success logic would go here
                }
            }, 800);

        }, 1200);
    };

    return (
        <div className="h-full flex flex-col bg-[#050810] text-gray-200 font-mono overflow-hidden">
            {/* Header: Launch Authority */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-20">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-amber-500/10 border-4 border-amber-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                        <StarIcon className="w-12 h-12 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-6xl text-amber-500 wisdom-glow italic tracking-tighter uppercase">Launch Center</h2>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mt-1">App Store Readiness Protocol v2026.04</p>
                    </div>
                </div>
                <div className="flex gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Store Status</p>
                        <p className="text-3xl font-comic-header text-white">PRE-SUBMISSION</p>
                    </div>
                    <ActivityIcon className="w-12 h-12 text-amber-700 opacity-30" />
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-8 gap-8 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.02)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left: Metadata & Compliance */}
                <div className="lg:w-[450px] flex flex-col gap-8 flex-shrink-0">
                    <div className="aero-panel p-8 bg-slate-900/80 border-amber-600/20 shadow-[10px_10px_0_0_rgba(0,0,0,0.8)]">
                        <h3 className="font-comic-header text-3xl text-white uppercase italic tracking-tight mb-6 flex items-center gap-3">
                            <CodeIcon className="w-6 h-6 text-amber-500" /> Storefront Assets
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-black/60 p-4 border border-white/5 rounded-2xl">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">Bundle ID</span>
                                <p className="text-white font-mono text-sm">com.aetheros.maestro.conjunction</p>
                            </div>
                            <div className="bg-black/60 p-4 border border-white/5 rounded-2xl">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">App Name</span>
                                <input 
                                    className="bg-transparent border-none p-0 focus:ring-0 text-amber-400 font-bold w-full"
                                    value={metadata.appName}
                                    onChange={e => setMetadata({...metadata, appName: e.target.value})}
                                />
                            </div>
                            <div className="bg-black/60 p-4 border border-white/5 rounded-2xl">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">D-U-N-S Neural ID</span>
                                <p className="text-cyan-400 font-mono text-sm">{metadata.dunsNumber}</p>
                            </div>
                        </div>
                    </div>

                    <div className="aero-panel p-8 bg-black/60 border-red-900/30">
                        <h3 className="font-comic-header text-2xl text-red-500 uppercase italic mb-6 flex items-center gap-3">
                            <ShieldIcon className="w-6 h-6 text-red-600" /> Compliance Posture
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'GDPR Granular Consent', active: compliance.gdprActive },
                                { label: 'CCPA Right-to-Delete (DSAR)', active: compliance.ccpaActive },
                                { label: 'GPC Signal Response', active: compliance.gpcHonored },
                            ].map((c, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-black border border-white/5 rounded-xl">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{c.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-green-500 uppercase">ACTIVE</span>
                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 p-4 bg-red-950/20 border border-red-600/30 rounded-2xl">
                                <span className="text-[9px] font-black text-red-400 uppercase block mb-1">Age Verification Status</span>
                                <p className="text-xl font-comic-header text-white">{compliance.ageVerificationStatus}</p>
                                <p className="text-[9px] text-gray-600 italic mt-2">Required by Texas App Store Act §48.A</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Pre-Flight & Commit */}
                <div className="flex-1 flex flex-col gap-8 overflow-hidden">
                    <div className="aero-panel bg-black/95 border-4 border-black flex-1 flex flex-col shadow-[20px_20px_100px_rgba(0,0,0,1)] relative">
                        <div className="p-6 border-b-4 border-black flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-4 text-amber-500 font-black uppercase text-xs tracking-[0.2em]">
                                <TerminalIcon className="w-5 h-5" />
                                <span>Pre-Submission Checks</span>
                            </div>
                            {isLaunching && <div className="text-[10px] text-amber-500 font-black animate-pulse">VALIDATING_FOR_PRODUCTION...</div>}
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
                            <div className="grid grid-cols-1 gap-4">
                                {checks.map(check => (
                                    <div key={check.id} className={`p-6 rounded-3xl border-4 transition-all duration-500 flex items-center justify-between ${
                                        check.status === 'PASSED' ? 'bg-green-950/10 border-green-600/40 opacity-100' :
                                        check.status === 'VALIDATING' ? 'bg-amber-950/10 border-amber-600 animate-pulse' :
                                        'bg-black/40 border-black opacity-40'
                                    }`}>
                                        <div className="flex items-center gap-6">
                                            {check.status === 'PASSED' ? <CheckCircleIcon className="w-8 h-8 text-green-500" /> :
                                             check.status === 'VALIDATING' ? <SpinnerIcon className="w-8 h-8 text-amber-500" /> :
                                             <div className="w-8 h-8 rounded-full border-4 border-gray-900" />}
                                            <p className={`text-xl font-comic-header uppercase tracking-wide ${check.status === 'PASSED' ? 'text-white' : 'text-gray-500'}`}>
                                                {check.label}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                                            check.status === 'PASSED' ? 'text-green-500' : 'text-gray-700'
                                        }`}>
                                            {check.status}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {isLaunching && (
                                <div className="mt-8 space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-amber-500 px-2 tracking-widest">
                                        <span>Production Synthesis</span>
                                        <span>{launchProgress}%</span>
                                    </div>
                                    <div className="h-6 bg-gray-900 border-4 border-black rounded-2xl overflow-hidden p-1">
                                        <div className="h-full bg-amber-500 transition-all duration-300 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.6)]" style={{ width: `${launchProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {!isLaunching && checks.every(c => c.status === 'PENDING') && (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 py-10">
                                    <StarIcon className="w-48 h-48 mb-8 text-gray-500" />
                                    <p className="text-xl font-black uppercase tracking-[0.5em] text-center max-w-sm">"The squad is ready. Execute the final conjunction."</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t-4 border-black bg-white/5 flex flex-col gap-6">
                             <div className="p-4 bg-amber-500/5 border-2 border-amber-600/30 rounded-3xl text-center">
                                <p className="text-xs text-amber-200/60 leading-relaxed italic">
                                    "Readying the AetherOS Conjunction Series for public distribution requires absolute heuristic clarity and regulatory transparency. The Maestro’s signature is your bond."
                                </p>
                             </div>
                             <button 
                                onClick={handleStartPreFlight}
                                disabled={isLaunching || checks.every(c => c.status === 'PASSED')}
                                className="vista-button w-full bg-amber-600 hover:bg-amber-500 text-black py-8 text-3xl font-black uppercase tracking-[0.3em] rounded-[2.5rem] flex items-center justify-center gap-6 transition-all active:scale-95 shadow-[0_20px_50px_rgba(251,191,36,0.3)] border-b-8 border-amber-900"
                            >
                                {isLaunching ? <SpinnerIcon className="w-10 h-10" /> : <FireIcon className="w-10 h-10" />}
                                <span>{isLaunching ? 'COMMITTING...' : 'INITIATE SUBMISSION'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer: Regulatory Stamp */}
            <div className="p-4 bg-slate-950 border-t-4 border-black flex items-center justify-between z-10">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Compliance Status: <span className="text-green-500">OPTIMAL</span></span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono">
                      AGE_GATE: <span className="text-cyan-400">§48.A READY</span> | GPC_SIG: <span className="text-white">HONORED</span>
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em]">
                   One Conductor. Global Distribution. Absolute God Logic.
                </div>
            </div>
        </div>
    );
};
