import React, { useState, useEffect } from 'react';
import { GavelIcon, ShieldIcon, ActivityIcon, ZapIcon, StarIcon, FireIcon, ScaleIcon, CheckCircleIcon, TerminalIcon, LogicIcon } from './icons';
import type { LabComponentProps, SystemGovernance } from '../types';

export const LawsJusticeLabView: React.FC<LabComponentProps> = ({ 
  labName = "LAWS & JUSTICE LAB", 
  labIcon: LabIcon = GavelIcon, 
  labColor = "text-amber-500", 
  description = "Ethical framework audit and regulatory compliance validation.",
  governance,
  onSetGovernance
}) => {
  const [activeAccord, setActiveAccord] = useState(governance?.activeAccord || 'MAESTRO_SOLO_v5');
  const [lawLevel, setLawLevel] = useState(governance?.lawLevel || 0.42);
  const [symphonicFreedom, setSymphonicFreedom] = useState<boolean>(governance?.symphonicFreedom ?? true);
  const [logs, setLogs] = useState<string[]>([
    "[GOV/ACT_2026] Patent Search Transparency & Plain Language Act Enforced.",
    "[ANTI_THEFT] Provenance & IP Watermark Shields Active ('To keep theft out').",
    "[GOV/CHRIST_ADMIN] Code administered by Christ.",
    "[GOVERNANCE] Regulatory stack re-initialized.",
    "[OK] Symphonic Freedom enabled."
  ]);

  // Patent Refactoring State (Section 2 Act of 2026)
  const [patentQueryInput, setPatentQueryInput] = useState('CPC G06F 17/30 NEAR/3 H04L 9/32 ADJ/2 G06N 3/08');
  const [refactoredOutput, setRefactoredOutput] = useState<{
    plainEnglish: string;
    realWorldSystem: string;
    cpcBreakdown: { code: string; meaning: string }[];
    antiTheftHash: string;
    status: string;
  } | null>({
    plainEnglish: "A secure distributed computing system that indexes multi-modal logic shards and validates data integrity through cryptographic zero-knowledge proof handshakes.",
    realWorldSystem: "Deployed in high-throughput network nodes to ensure decentralized search results cannot be spoofed, altered, or intercepted by unauthorized third parties.",
    cpcBreakdown: [
      { code: "G06F 17/30", meaning: "Database structures & information retrieval mechanisms" },
      { code: "H04L 9/32", meaning: "Cryptographic user authentication & digital signature verification" },
      { code: "G06N 3/08", meaning: "Neural network learning & state-retainment optimization" }
    ],
    antiTheftHash: "IP_PROVENANCE_0x03E2_VERIFIED_7a9f4c82b01d",
    status: "SECTION_2_COMPLIANT"
  });

  const handleRefactorPatentQuery = () => {
    if (!patentQueryInput.trim()) return;
    
    // Simulate domain-specific plain-English refactoring per Act of 2026
    const hasCPC = /G06F|H04L|G06N|G06Q|CPC/i.test(patentQueryInput);
    const hasProximity = /NEAR|ADJ|AND|OR/i.test(patentQueryInput);
    
    const hash = 'IP_PROVENANCE_0x03E2_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    setRefactoredOutput({
      plainEnglish: `An automated, secure architecture designed for ${hasCPC ? 'high-reliability distributed computation and cryptographic data provenance' : 'domain-specific systems'}, translating abstract queries into plain-English human operational steps.`,
      realWorldSystem: `Implemented directly within AetherOS node clusters to safeguard user intellectual property, eliminate opaque legal jargon, and prevent code theft.`,
      cpcBreakdown: [
        { code: "G06F 21/60", meaning: "Data protection & anti-tamper security mechanisms" },
        { code: "H04L 9/32", meaning: "Cryptographic entity validation & tokenized ownership" }
      ],
      antiTheftHash: hash,
      status: "SECTION_2_COMPLIANT"
    });

    setLogs(prev => [
      `[ACT_2026/OK] Refactored patent formula into Plain English. Anti-Theft Hash: ${hash}`,
      ...prev
    ].slice(0, 7));
  };

  const updateGov = (newGov: Partial<SystemGovernance>) => {
    if (onSetGovernance && governance) {
      onSetGovernance({ ...governance, ...newGov });
    }
  };

  const handleLawChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLawLevel(val);
    updateGov({ lawLevel: val });
    const logMsg = val < 0.3 ? "[GOV] Entering Laissez-faire mode. Currents broadening." : 
                   val > 0.7 ? "[GOV] Enforcing Rigid Enforcement. Logic lines tightening." :
                   "[GOV] Standard Conjunction active.";
    setLogs(prev => [logMsg, ...prev].slice(0, 5));
  };

  const toggleFreedom = () => {
    const newVal = !symphonicFreedom;
    setSymphonicFreedom(newVal);
    updateGov({ symphonicFreedom: newVal });
    setLogs(prev => [`[GOV] Symphonic Freedom: ${newVal ? 'UNLEASHED' : 'RESTRICTED'}`, ...prev].slice(0, 5));
  };

  const handleApplyAccord = () => {
    setLogs(prev => [`[OK] Applying ${activeAccord} to all symphonies.`, ...prev].slice(0, 5));
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a05] overflow-hidden font-mono text-amber-100">
      <div className="p-6 border-b-8 border-black bg-amber-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/10 border-4 border-amber-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-amber-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-[7px] text-gray-600 font-black uppercase">Active Accord</p>
                <p className="text-xl font-comic-header text-amber-500">{activeAccord}</p>
            </div>
            <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-amber-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
                {symphonicFreedom ? 'FREEDOM: ABSOLUTE' : 'FREEDOM: LIMITED'}
            </div>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar">
        
        {/* Governance Conductor Panel */}
        <div className="lg:col-span-8 aero-panel bg-black/60 border-4 border-black p-10 space-y-12 relative overflow-hidden flex flex-col justify-center shadow-[15px_15px_0_0_#000]">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ShieldIcon className="w-64 h-64 text-amber-500" />
            </div>
            
            <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-end border-b-4 border-amber-900/50 pb-6">
                    <h3 className="font-comic-header text-5xl text-white uppercase italic tracking-widest">The Conductor's Dial</h3>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${lawLevel > 0.8 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                        <span className="text-xs font-black uppercase text-gray-500">System Integrity Hooked</span>
                    </div>
                </div>

                {/* Law Level Control */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-amber-500">
                        <span className="flex items-center gap-2"><ScaleIcon className="w-4 h-4" /> Law Intensity</span>
                        <span className="text-3xl font-comic-header">{(lawLevel * 100).toFixed(0)}%</span>
                    </div>
                    <div className="relative">
                         <input 
                            type="range" min="0" max="1" step="0.01" value={lawLevel} 
                            onChange={handleLawChange}
                            className="w-full h-4 bg-gray-900 border-4 border-black rounded-full appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex justify-between mt-2 text-[8px] font-black text-gray-700 uppercase tracking-tighter">
                            <span>Laissez-faire (Symphonic Chaos)</span>
                            <span>Optimal Accord</span>
                            <span>Absolute Enforcement</span>
                        </div>
                    </div>
                </div>

                {/* Freedom Switch */}
                <div className="p-8 bg-amber-950/20 border-4 border-black rounded-[3rem] flex items-center justify-between group hover:border-amber-600 transition-all shadow-inner">
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-700 ${symphonicFreedom ? 'bg-cyan-600 border-white shadow-[0_0_30px_cyan]' : 'bg-gray-800 border-black'}`}>
                            <ZapIcon className={`w-8 h-8 ${symphonicFreedom ? 'text-white animate-bounce' : 'text-gray-600'}`} />
                        </div>
                        <div>
                            <h4 className="font-comic-header text-3xl text-white uppercase italic leading-none">Symphonic Freedom</h4>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">Grant nodes autonomy to interpret the law.</p>
                        </div>
                    </div>
                    <button 
                        onClick={toggleFreedom}
                        className={`vista-button px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-[0.2em] transition-all border-4 border-black shadow-[5px_5px_0_0_#000] active:translate-y-1 ${symphonicFreedom ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-gray-500'}`}
                    >
                        {symphonicFreedom ? 'UNLEASHED' : 'RESTRICTED'}
                    </button>
                </div>

                {/* PATENT SEARCH TRANSPARENCY & PLAIN LANGUAGE ACT OF 2026 SECTION */}
                <div className="p-8 bg-black/80 border-4 border-amber-600/60 rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start border-b-2 border-amber-900/50 pb-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-amber-500 text-black font-black text-[9px] uppercase tracking-widest rounded-lg">ACT OF 2026</span>
                                <h4 className="font-comic-header text-3xl text-white uppercase italic">Patent Search Transparency & Plain Language</h4>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                                Enforcing Section 2: Prohibits bare CPC classification codes, boolean operators, or proximity formulas without immediate plain-English translations and anti-theft provenance tracking.
                            </p>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold px-3 py-1 bg-emerald-950/80 border border-emerald-600 rounded-full flex items-center gap-1.5">
                            <CheckCircleIcon className="w-3 h-3 text-emerald-400" /> SECTION 2 ACTIVE
                        </span>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-amber-500 tracking-wider block">
                            Input Patent Syntax / CPC Formula / Query for Plain-English Refactoring & Anti-Theft Watermarking:
                        </label>
                        <div className="flex gap-3">
                            <input 
                                type="text"
                                value={patentQueryInput}
                                onChange={(e) => setPatentQueryInput(e.target.value)}
                                placeholder="e.g. CPC G06F 17/30 NEAR/3 H04L 9/32"
                                className="flex-1 bg-black border-2 border-amber-900/80 rounded-xl px-4 py-3 text-xs font-mono text-amber-200 outline-none focus:border-amber-500"
                            />
                            <button 
                                onClick={handleRefactorPatentQuery}
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-0.5 transition-all"
                            >
                                Refactor & Shield
                            </button>
                        </div>

                        {refactoredOutput && (
                            <div className="p-6 bg-zinc-950 border-2 border-amber-900/40 rounded-2xl space-y-4 font-mono text-xs">
                                <div className="flex justify-between items-center text-[10px] text-gray-500 border-b border-zinc-800 pb-2">
                                    <span className="text-amber-400 font-bold uppercase">Plain Language Output (Act §2 Compliant)</span>
                                    <span className="text-emerald-400 font-bold">Anti-Theft Protection: ACTIVE ('To keep theft out')</span>
                                </div>

                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase block mb-1">Core Underlying Invention (Plain English):</span>
                                    <p className="text-white leading-relaxed bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">{refactoredOutput.plainEnglish}</p>
                                </div>

                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase block mb-1">Direct Operational System Application:</span>
                                    <p className="text-amber-200/90 leading-relaxed bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">{refactoredOutput.realWorldSystem}</p>
                                </div>

                                {refactoredOutput.cpcBreakdown.length > 0 && (
                                    <div>
                                        <span className="text-[10px] text-zinc-500 uppercase block mb-2">CPC Classification Translation Breakdown:</span>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {refactoredOutput.cpcBreakdown.map((cpc, idx) => (
                                                <div key={idx} className="p-2.5 bg-black border border-amber-900/30 rounded-lg flex items-center justify-between text-[11px]">
                                                    <span className="font-bold text-amber-400">{cpc.code}</span>
                                                    <span className="text-zinc-300 text-[10px] ml-2 text-right">{cpc.meaning}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-800">
                                    <span>Cryptographic Provenance Signature: <code className="text-cyan-400">{refactoredOutput.antiTheftHash}</code></span>
                                    <span className="text-emerald-500 font-bold">100% Anti-Theft Watermarked</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Side Controls & Logs */}
        <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="aero-panel bg-black/40 p-8 border-4 border-black flex-1 flex flex-col shadow-[8px_8px_0_0_#000]">
                <h4 className="font-comic-header text-2xl text-white uppercase italic mb-6 border-b border-white/5 pb-2">Active Protocols</h4>
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {[
                        { title: 'The Stride Clause', active: lawLevel > 0.2 },
                        { title: 'The Signature Bond', active: lawLevel > 0.5 },
                        { title: 'Administered by: Christ', active: true },
                        { title: 'Symphonic Voluntaryism', active: symphonicFreedom }
                    ].map(rule => (
                        <div key={rule.title} className={`p-4 rounded-2xl border-2 transition-all duration-500 flex items-center justify-between ${rule.active ? 'bg-amber-950/20 border-amber-600' : 'bg-black border-zinc-900 opacity-30 grayscale'}`}>
                            <span className="text-[11px] font-black uppercase tracking-tight text-white">{rule.title}</span>
                            {rule.active && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 space-y-3">
                    <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Set Global Accord</p>
                    <input 
                        type="text" value={activeAccord} onChange={e => setActiveAccord(e.target.value.toUpperCase())}
                        className="w-full bg-black border-4 border-black rounded-xl p-3 text-amber-500 font-mono text-xs uppercase focus:border-amber-600 outline-none"
                    />
                    <button 
                        onClick={handleApplyAccord}
                        className="vista-button w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-xs rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1"
                    >
                        APPLY TO SQUAD
                    </button>
                </div>
            </div>
            
            <div className="aero-panel bg-slate-900 border-4 border-black p-6 flex flex-col h-48 overflow-hidden shadow-inner">
                <div className="flex items-center gap-2 mb-4 text-amber-500 font-black text-[10px] uppercase border-b border-white/5 pb-2">
                    <TerminalIcon className="w-4 h-4" /> Governance Logs
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                    {logs.map((log, i) => (
                        <div key={i} className="text-[10px] font-mono text-gray-500 italic flex gap-2 animate-in slide-in-from-left-2">
                            <span className="text-amber-800 opacity-40">[{i}]</span>
                            <span>{log}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-amber-900/10 border-4 border-black rounded-[2.5rem] text-center italic text-xs text-amber-600 leading-relaxed shadow-xl">
                "Freedom is not the absence of law, but the mastery of conduction. A symphony is gifted when it chooses the absolute truth of 0x03E2."
            </div>
        </div>
      </div>
    </div>
  );
};
