
import React, { useState, useEffect } from 'react';
import { 
    MovieIcon, ActivityIcon, ZapIcon, GaugeIcon, SpinnerIcon, 
    ShieldIcon, FireIcon, CheckCircleIcon, TerminalIcon, 
    GavelIcon, SearchIcon, WarningIcon, UserIcon, RulesIcon, ScaleIcon
} from './icons';
import type { LabComponentProps, FinancialForensicAudit } from '../types';
import { conductAgeVerificationAudit, conductFinancialForensicAudit } from '../services/geminiService';

interface AgeAuditReport {
    report: string;
    riskLevel: string;
    complianceChecklist: string[];
    signature: string;
}

export const PornographyStudioView: React.FC<LabComponentProps> = ({ 
  labName = "PORNOGRAPHY STUDIO", 
  labIcon: LabIcon = MovieIcon, 
  labColor = "text-red-900", 
  description = "Forensic analysis of visual pleasure, aesthetics, and neural impact." 
}) => {
  const [fps, setFps] = useState(60);
  const [saturation, setSaturation] = useState(88);
  const [isRendering, setIsRendering] = useState(false);
  const [frameBuffer, setFrameBuffer] = useState<string[]>([]);
  
  // Audit States
  const [isAgeAuditing, setIsAgeAuditing] = useState(false);
  const [ageAuditReport, setAgeAuditReport] = useState<AgeAuditReport | null>(null);
  const [isFinancialAuditing, setIsFinancialAuditing] = useState(false);
  const [financialAuditReport, setFinancialAuditReport] = useState<FinancialForensicAudit | null>(null);
  const [studioName, setStudioName] = useState('AetherOS-Internal-Media');

  useEffect(() => {
    let interval: number;
    if (isRendering) {
      // FIX: Use window.setInterval to guarantee browser timer ID type (number)
      interval = window.setInterval(() => {
        setFps(prev => Math.max(24, Math.min(120, prev + (Math.random() - 0.5) * 10)));
        setSaturation(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
        setFrameBuffer(prev => {
            const hex = "0x" + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
            return [`[RENDER] Frame ${hex} processed.`, ...prev].slice(0, 5);
        });
      }, 500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRendering]);

  const runAgeAudit = async () => {
    setIsAgeAuditing(true);
    setAgeAuditReport(null);
    try {
        const result = await conductAgeVerificationAudit(studioName);
        setAgeAuditReport(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAgeAuditing(false);
    }
  };

  const runFinancialAudit = async () => {
    setIsFinancialAuditing(true);
    setFinancialAuditReport(null);
    try {
        const result = await conductFinancialForensicAudit(studioName);
        setFinancialAuditReport(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsFinancialAuditing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050000] overflow-hidden font-mono text-red-100">
      <div className="p-6 border-b-8 border-black bg-red-950/40 flex justify-between items-center shadow-xl z-20">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-900/10 border-4 border-red-900 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(153,27,27,0.3)]">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-red-900 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setIsRendering(!isRendering)}
                className={`px-6 py-3 rounded-2xl border-4 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isRendering ? 'bg-amber-500 text-black' : 'bg-red-600 text-white animate-pulse'}`}
            >
                {isRendering ? 'HALT PRODUCTION' : 'INITIATE CAPTURE'}
            </button>
            <button 
                onClick={runFinancialAudit}
                disabled={isFinancialAuditing}
                className="px-6 py-3 bg-zinc-900 hover:bg-emerald-900/40 text-emerald-500 border-4 border-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center gap-2"
            >
                {isFinancialAuditing ? <SpinnerIcon className="w-4 h-4" /> : <ScaleIcon className="w-4 h-4" />}
                FINANCIAL FORENSICS
            </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar">
        
        {/* Render Engine Monitor */}
        <div className="lg:col-span-8 aero-panel bg-black/80 border-4 border-black p-8 flex flex-col justify-center items-center relative overflow-hidden shadow-[12px_12px_0_0_#000]">
             <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#991b1b 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             
             <div className="text-center space-y-10 relative z-10 w-full">
                <div className="flex justify-between items-end">
                    <div className="text-left">
                        <p className="text-[10px] text-red-900 font-black uppercase tracking-[0.5em] mb-4">Neural Frame Resonance</p>
                        <div className="text-9xl font-black text-white wisdom-glow tracking-tighter leading-none">
                            {Math.floor(fps)}<span className="text-2xl text-red-900 ml-2">FPS</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Conjunction Stride</p>
                        <p className="text-4xl font-comic-header text-red-500">1.2 PB/S</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
                    <div className="p-4 bg-black border-2 border-red-900/30 rounded-2xl">
                        <p className="text-[8px] text-red-800 font-black uppercase mb-1">Color Saturation</p>
                        <p className="text-2xl font-comic-header text-white">{saturation.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-black border-2 border-red-900/30 rounded-2xl">
                        <p className="text-[8px] text-red-800 font-black uppercase mb-1">Censure Bypass</p>
                        <p className="text-2xl font-comic-header text-green-500">ACTIVE</p>
                    </div>
                    <div className="p-4 bg-black border-2 border-red-900/30 rounded-2xl">
                        <p className="text-[8px] text-red-800 font-black uppercase mb-1">Financial Integrity</p>
                        <p className={`text-2xl font-comic-header ${financialAuditReport?.financialFlowStatus === 'SECURE' ? 'text-green-500' : 'text-red-500'}`}>
                            {financialAuditReport?.financialFlowStatus || 'PENDING'}
                        </p>
                    </div>
                    <div className={`p-4 bg-black border-2 rounded-2xl transition-colors ${ageAuditReport?.riskLevel === 'CRITICAL' ? 'border-red-600 bg-red-900/20' : 'border-red-900/30'}`}>
                        <p className="text-[8px] text-red-800 font-black uppercase mb-1">Age Gate Status</p>
                        <p className={`text-2xl font-comic-header ${ageAuditReport?.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-amber-500 animate-pulse'}`}>{ageAuditReport?.riskLevel || 'PENDING'}</p>
                    </div>
                </div>
             </div>

             {/* Dynamic Log Area */}
             <div className="w-full mt-10 p-6 bg-red-950/10 border-2 border-red-900/20 rounded-3xl">
                <h4 className="font-comic-header text-2xl text-red-700 uppercase italic mb-4 flex items-center gap-3">
                    <TerminalIcon className="w-6 h-6" /> Production Stream
                </h4>
                <div className="space-y-2 font-mono text-[10px] text-red-400 h-24 overflow-y-auto custom-scrollbar">
                    {isRendering ? (
                        frameBuffer.map((log, i) => (
                            <div key={i} className="flex gap-3 border-l-2 border-red-900 pl-4 py-0.5 animate-in slide-in-from-left-2">
                                <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                                <span className="italic">{log}</span>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-20 py-4">
                            <p className="uppercase tracking-[0.3em] font-black">Awaiting Conjunction Trigger.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Regulatory & Financial Sidecar */}
        <div className="lg:col-span-4 flex flex-col gap-8 overflow-hidden">
            {/* Age Verification Section */}
            <div className="aero-panel bg-slate-900 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col max-h-[50%]">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 className="font-comic-header text-2xl text-red-500 uppercase italic flex items-center gap-2">
                        <RulesIcon className="w-5 h-5" /> Age Audit
                    </h3>
                    <button onClick={runAgeAudit} className="text-[8px] font-black uppercase text-red-900 hover:text-red-500 transition-colors">Rescan</button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                    {isAgeAuditing ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-10 text-red-500">
                            <SpinnerIcon className="w-8 h-8 animate-spin" />
                            <p className="text-[8px] font-black uppercase tracking-[0.3em]">Siphoning Data...</p>
                        </div>
                    ) : ageAuditReport ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                            <div className={`p-3 rounded-xl border-2 flex items-center gap-3 ${ageAuditReport.riskLevel === 'CRITICAL' ? 'bg-red-900/20 border-red-600' : 'bg-green-900/20 border-green-600'}`}>
                                <WarningIcon className={`w-6 h-6 ${ageAuditReport.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-green-500'}`} />
                                <span className="text-lg font-comic-header uppercase">{ageAuditReport.riskLevel}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 italic leading-relaxed">
                                {ageAuditReport.report}
                            </p>
                        </div>
                    ) : (
                        <p className="text-[10px] text-gray-600 italic">Age gate analysis pending.</p>
                    )}
                </div>
            </div>

            {/* Financial Forensics Section */}
            <div className="aero-panel bg-black/60 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 className="font-comic-header text-2xl text-emerald-500 uppercase italic flex items-center gap-2">
                        <ScaleIcon className="w-5 h-5" /> Financial Forensics
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                    {isFinancialAuditing ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 py-10 text-emerald-500">
                            <SpinnerIcon className="w-10 h-10 animate-spin" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">Tracing Money Flows...</p>
                        </div>
                    ) : financialAuditReport ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-emerald-900/10 border border-emerald-600/30 rounded-xl text-center">
                                    <p className="text-[7px] font-black text-emerald-700 uppercase mb-1">Verified Performers</p>
                                    <p className="text-2xl font-comic-header text-white">{financialAuditReport.verifiedPerformersCount}</p>
                                </div>
                                <div className={`p-3 border rounded-xl text-center flex flex-col justify-center ${financialAuditReport.financialFlowStatus === 'SECURE' ? 'bg-green-950/20 border-green-600/40' : 'bg-red-950/20 border-red-600/40'}`}>
                                    <p className="text-[7px] font-black text-gray-500 uppercase mb-1">Flow Integrity</p>
                                    <p className={`text-lg font-comic-header ${financialAuditReport.financialFlowStatus === 'SECURE' ? 'text-green-500' : 'text-red-500'}`}>{financialAuditReport.financialFlowStatus}</p>
                                </div>
                            </div>

                            <div className="bg-black/80 p-4 rounded-xl border border-white/5 space-y-3">
                                <h5 className="text-[9px] font-black uppercase text-emerald-400 tracking-widest border-b border-emerald-900/40 pb-2">Forensic Analysis</h5>
                                <p className="text-[11px] text-gray-400 italic leading-relaxed">
                                    {financialAuditReport.report}
                                </p>
                            </div>

                            {financialAuditReport.redFlags.length > 0 && (
                                <div className="space-y-2">
                                    <h5 className="text-[9px] font-black uppercase text-red-500 tracking-widest">Red Flags Detected</h5>
                                    {financialAuditReport.redFlags.map((flag, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2 bg-red-900/10 border border-red-600/20 rounded-lg">
                                            <FireIcon className="w-3 h-3 text-red-600" />
                                            <span className="text-[9px] font-bold text-red-400 uppercase truncate">{flag}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="p-2 bg-emerald-950/40 rounded-lg border-2 border-black text-center mt-4">
                                <p className="text-[8px] font-black text-emerald-800 uppercase mb-1">Legal Support Active</p>
                                <p className="text-[10px] font-black text-white uppercase italic">ChaseLawyers Secured</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-950/10 border-2 border-emerald-900/20 rounded-2xl relative overflow-hidden group">
                                <GavelIcon className="absolute -right-4 -bottom-4 w-20 h-20 opacity-5 group-hover:scale-110 transition-transform" />
                                <h4 className="text-sm font-black text-white uppercase mb-2">Financial Integrity Audit</h4>
                                <p className="text-[10px] text-gray-400 leading-relaxed italic mb-4">
                                    Verify performer payments, trace flows for illegal activity, and identify regulatory risks before they become liabilities.
                                </p>
                                <button 
                                    onClick={runFinancialAudit}
                                    className="w-full py-2 bg-emerald-600 text-black rounded-lg text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000]"
                                >
                                    Initiate Forensic Scan
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 p-4 bg-amber-900/10 border-2 border-amber-600/30 rounded-2xl">
                    <p className="text-[9px] text-gray-400 leading-relaxed italic">
                        "Regular financial audits ensure studio practices are transparent and legally sound. ChaseLawyers provides assistant in drafting compliance policies."
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Lab Footer */}
      <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-30 px-10 shadow-inner">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">Studio Protocol: SECURE</span>
            </div>
            <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">
                Render Integrity: 0x03E2 | Forensic Stride: 1.2 PB/S
            </span>
        </div>
        <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.3em] hidden sm:block">"Pleasure flows where logic is hard-coded."</p>
      </div>
    </div>
  );
};
