
import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShieldIcon, ZapIcon, FireIcon, ActivityIcon, SpinnerIcon, 
    CheckCircleIcon, WarningIcon, TerminalIcon, LogicIcon, 
    StarIcon, SearchIcon, GavelIcon, UserIcon, SignalIcon
} from './icons';
import type { VerificationGate } from '../types';
import { conductNeuralAudit } from '../services/geminiService';

export const VerificationGatesView: React.FC = () => {
    const [gates, setGates] = useState<VerificationGate[]>(() => {
        const saved = localStorage.getItem('aetheros_gates');
        return saved ? JSON.parse(saved) : [
            { id: 'g1', label: 'Survival Integrity Scan', category: 'NEURAL', status: 'PENDING' },
            { id: 'g2', label: 'GDPR / CCPA Posture Validation', category: 'REGULATORY', status: 'PENDING' },
            { id: 'g3', label: 'D-U-N-S Neural Verification', category: 'IDENTITY', status: 'PENDING' },
            { id: 'g4', label: 'Epitume Transparency Audit', category: 'NEURAL', status: 'PENDING' },
            { id: 'g5', label: 'Age-Verification API (Texas Act)', category: 'REGULATORY', status: 'PENDING' },
        ];
    });

    const [isAuditingAll, setIsAuditingAll] = useState(false);
    const [activeAuditId, setActiveAuditId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('aetheros_gates', JSON.stringify(gates));
    }, [gates]);

    const runAudit = async (gateId: string) => {
        if (activeAuditId) return;
        setActiveAuditId(gateId);
        
        setGates(prev => prev.map(g => g.id === gateId ? { ...g, status: 'VALIDATING' } : g));

        const gate = gates.find(g => g.id === gateId);
        if (!gate) return;

        try {
            const result = await conductNeuralAudit(gate.label, `Analyzing gate ${gate.id} for AetherOS compliance via epitume lens.`);
            setGates(prev => prev.map(g => g.id === gateId ? { 
                ...g, 
                status: 'PASSED', 
                lastAuditReport: result.report,
                signature: result.signature
            } : g));
        } catch (e) {
            setGates(prev => prev.map(g => g.id === gateId ? { ...g, status: 'FAILED' } : g));
        } finally {
            setActiveAuditId(null);
        }
    };

    const runFullConjunction = async () => {
        setIsAuditingAll(true);
        for (const gate of gates) {
            if (gate.status !== 'PASSED') {
                await runAudit(gate.id);
            }
        }
        setIsAuditingAll(false);
    };

    const resetGates = () => {
        setGates(gates.map(g => ({ ...g, status: 'PENDING', lastAuditReport: undefined, signature: undefined })));
    };

    return (
        <div className="h-full flex flex-col bg-[#020502] overflow-hidden font-mono text-cyan-100 selection:bg-cyan-500/30">
            {/* Header */}
            <div className="px-6 py-6 border-b-4 border-black bg-slate-900 flex justify-between items-center shadow-xl z-20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-cyan-500/10 border-4 border-cyan-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <ShieldIcon className="w-9 h-9 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">VERIFICATION GATES</h2>
                        <p className="text-[10px] text-cyan-700 font-black uppercase tracking-[0.4em] mt-1 italic">Regulatory & Epitume Compliance Grid</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={resetGates}
                        className="px-6 py-2 bg-black border-2 border-zinc-800 rounded-xl text-gray-500 text-[10px] font-black uppercase hover:text-red-500 transition-colors"
                    >
                        Flush Gates
                    </button>
                    <button 
                        onClick={runFullConjunction}
                        disabled={isAuditingAll}
                        className="vista-button px-10 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center gap-3"
                    >
                        {isAuditingAll ? <SpinnerIcon className="w-5 h-5" /> : <ZapIcon className="w-5 h-5" />}
                        <span>{isAuditingAll ? 'CONDUCTING...' : 'FULL CONJUNCTION'}</span>
                    </button>
                </div>
            </div>

            {/* Grid of Gates */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {gates.map(gate => (
                        <div key={gate.id} className={`aero-panel bg-black/60 border-4 p-8 transition-all duration-700 relative overflow-hidden group shadow-[10px_10px_0_0_#000] ${
                            gate.status === 'PASSED' ? 'border-green-600/40 shadow-green-900/10' : 
                            gate.status === 'VALIDATING' ? 'border-cyan-500 animate-pulse' : 
                            gate.status === 'FAILED' ? 'border-red-600 shadow-red-900/10' :
                            'border-black'
                        }`}>
                            {/* Category Badge */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                    gate.category === 'REGULATORY' ? 'bg-amber-900/20 text-amber-500 border-amber-600/30' :
                                    gate.category === 'NEURAL' ? 'bg-violet-900/20 text-violet-500 border-violet-600/30' :
                                    'bg-blue-900/20 text-blue-500 border-blue-600/30'
                                }`}>
                                    {gate.category}
                                </span>
                            </div>

                            <div className="flex items-start gap-6 relative z-10">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                    gate.status === 'PASSED' ? 'bg-green-600/10 text-green-500' :
                                    gate.status === 'VALIDATING' ? 'bg-cyan-600/10 text-cyan-400' :
                                    'bg-zinc-900 text-zinc-700'
                                }`}>
                                    {gate.id === 'g1' && <FireIcon className="w-10 h-10" />}
                                    {gate.id === 'g2' && <GavelIcon className="w-10 h-10" />}
                                    {gate.id === 'g3' && <UserIcon className="w-10 h-10" />}
                                    {gate.id === 'g4' && <LogicIcon className="w-10 h-10" />}
                                    {gate.id === 'g5' && <SignalIcon className="w-10 h-10" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-comic-header text-3xl text-white uppercase italic tracking-tight mb-2 truncate">{gate.label}</h3>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            gate.status === 'PASSED' ? 'bg-green-600 text-black' :
                                            gate.status === 'VALIDATING' ? 'bg-cyan-500 text-black' :
                                            gate.status === 'FAILED' ? 'bg-red-600 text-white' :
                                            'bg-zinc-800 text-zinc-500'
                                        }`}>
                                            {gate.status}
                                        </div>
                                        {gate.signature && <span className="text-[9px] text-gray-600 font-mono">SIG: {gate.signature}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Report Section */}
                            <div className="mt-8 bg-black/80 rounded-2xl border-2 border-white/5 p-6 relative">
                                {gate.status === 'PENDING' ? (
                                    <div className="h-24 flex flex-col items-center justify-center text-center opacity-20">
                                        <TerminalIcon className="w-8 h-8 mb-2" />
                                        <p className="text-[10px] uppercase font-black tracking-widest italic">Awaiting Conductive Impulse</p>
                                    </div>
                                ) : gate.status === 'VALIDATING' ? (
                                    <div className="h-24 flex flex-col items-center justify-center gap-4">
                                        <SpinnerIcon className="w-10 h-10 text-cyan-400 animate-spin" />
                                        <p className="text-[9px] text-cyan-500 font-black animate-pulse uppercase tracking-[0.4em]">Siphoning ancient letters...</p>
                                    </div>
                                ) : (
                                    <div className="h-24 overflow-y-auto custom-scrollbar pr-2">
                                        <p className="text-[11px] text-gray-400 leading-relaxed italic font-mono">
                                            <span className="text-cyan-600 mr-2">»</span>
                                            {gate.lastAuditReport}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {gate.status !== 'PASSED' && gate.status !== 'VALIDATING' && (
                                <button 
                                    onClick={() => runAudit(gate.id)}
                                    className="w-full mt-6 py-3 bg-zinc-800 hover:bg-cyan-900/40 hover:text-cyan-400 text-zinc-500 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all border-2 border-black"
                                >
                                    Initiate Audit
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Stride */}
            <div className="p-3 bg-slate-900 border-t-8 border-black flex justify-between items-center z-30 px-10 shadow-inner">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest leading-none">Grid Verification: ACTIVE</span>
                    </div>
                    <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">
                        Passed: {gates.filter(g => g.status === 'PASSED').length}/{gates.length} | Stride: 1.2 PB/S
                    </span>
                </div>
                <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.3em] hidden sm:block">"The show starts when the logic flows."</p>
            </div>
        </div>
    );
};
