import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, 
    ShieldAlert, 
    ShieldCheck, 
    Lock, 
    FileText, 
    CheckCircle2, 
    AlertTriangle, 
    XCircle, 
    Layers, 
    GitBranch, 
    Cpu, 
    Activity, 
    Download, 
    Copy, 
    Check, 
    RefreshCw, 
    ExternalLink, 
    Server, 
    Cloud, 
    Heart, 
    Terminal, 
    Sparkles, 
    HelpCircle,
    ArrowRight
} from 'lucide-react';
import { 
    SecureByDesignService, 
    DEVELOPMENT_GROUPS, 
    DevelopmentGroup, 
    SSDFControlItem, 
    SbDAssessmentReport 
} from '../services/secureByDesignService';
import { AntiTheftEngine } from '../services/antiTheftEngine';
import { RuntimeSecurityGuard } from '../services/runtimeSecurityGuard';

interface SecureByDesignViewProps {
    onNavigateToView?: (view: string) => void;
    compact?: boolean;
}

export const SecureByDesignView: React.FC<SecureByDesignViewProps> = ({ onNavigateToView, compact = false }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'development_groups' | 'ssdf_controls' | 'scenarios' | 'attestation'>('overview');
    const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PO' | 'PS' | 'PW' | 'RV'>('ALL');
    const [selectedDG, setSelectedDG] = useState<DevelopmentGroup>(SecureByDesignService.getTargetGroup());
    const [controls, setControls] = useState<SSDFControlItem[]>(SecureByDesignService.getControls());
    const [scenarios, setScenarios] = useState(SecureByDesignService.getScenarios());
    const [copiedCert, setCopiedCert] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);

    // Compute live assessment report
    const report: SbDAssessmentReport = useMemo(() => {
        return SecureByDesignService.calculateAssessment();
    }, [controls, scenarios, selectedDG]);

    const handleDGChange = (dg: DevelopmentGroup) => {
        setSelectedDG(dg);
        SecureByDesignService.setTargetGroup(dg);
    };

    const handleToggleStatus = (id: string, currentStatus: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT') => {
        const nextStatus: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' = 
            currentStatus === 'COMPLIANT' ? 'PARTIAL' :
            currentStatus === 'PARTIAL' ? 'NON_COMPLIANT' : 'COMPLIANT';
        
        SecureByDesignService.updateControlStatus(id, nextStatus);
        setControls([...SecureByDesignService.getControls()]);
    };

    const handleScenarioOptionSelect = (scenarioId: string, optionKey: string) => {
        SecureByDesignService.updateScenarioOption(scenarioId, optionKey);
        setScenarios([...SecureByDesignService.getScenarios()]);
    };

    const handleResetBaseline = () => {
        SecureByDesignService.resetToSovereignBaseline();
        setControls([...SecureByDesignService.getControls()]);
        setSelectedDG('DG3');
    };

    const handleCopyAttestation = () => {
        navigator.clipboard.writeText(`AETHEROS SECURE BY DESIGN (SbD) ATTESTATION CERTIFICATE
Certificate Hash: ${report.complianceCertificateHash}
Timestamp: ${report.timestamp}
Evaluated Group: ${report.actualEvaluatedGroup} (${DEVELOPMENT_GROUPS[report.actualEvaluatedGroup].name})
Target Group: ${report.targetGroup}
Overall SbD Score: ${report.overallScore}%
NIST SSDF PO Score: ${report.categoryScores.PO}%
NIST SSDF PS Score: ${report.categoryScores.PS}%
NIST SSDF PW Score: ${report.categoryScores.PW}%
NIST SSDF RV Score: ${report.categoryScores.RV}%
Google CLA Provenance Anchor: ${report.claAnchorProvenance.claSignatureId} (${report.claAnchorProvenance.contributorEmail})
Runtime Guard Status: ${report.runtimeGuardStatus}`);
        setCopiedCert(true);
        setTimeout(() => setCopiedCert(false), 2000);
    };

    const handleCopyJson = () => {
        navigator.clipboard.writeText(JSON.stringify(report, null, 2));
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
    };

    const filteredControls = useMemo(() => {
        if (selectedCategory === 'ALL') return controls;
        return controls.filter(c => c.category === selectedCategory);
    }, [controls, selectedCategory]);

    return (
        <div className={`w-full h-full flex flex-col bg-[#050508] text-zinc-100 font-mono overflow-y-auto custom-scrollbar select-text ${compact ? 'p-3' : 'p-6 md:p-8'}`}>
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border-2 border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)] shrink-0">
                        <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">
                                SECURE BY DESIGN (SbD)
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                NIST SSDF SP 800-218
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 border border-blue-500/30 text-blue-400">
                                SAFECode DG3 SPEC
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-sans mt-1">
                            A Guide to Assessing Software Security Practices: Code Resistance, Configuration, Anti-Tamper & Continuous Improvement.
                        </p>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={handleResetBaseline}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer hover:bg-zinc-850"
                        title="Reset all checks to AetherOS Sovereign High-Assurance baseline"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                        Reset Baseline
                    </button>
                    {onNavigateToView && (
                        <button
                            onClick={() => onNavigateToView('anti_theft_protection')}
                            className="px-3.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer"
                        >
                            <Shield className="w-3.5 h-3.5 text-cyan-400" />
                            Anti-Theft Guard
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-850 pt-4 pb-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'overview'
                            ? 'bg-emerald-600/25 border border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                            : 'bg-zinc-950 border border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    📊 Executive Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('development_groups')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'development_groups'
                            ? 'bg-blue-600/25 border border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                            : 'bg-zinc-950 border border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    🛡️ SAFECode Groups (DG1-3)
                </button>
                <button
                    onClick={() => setActiveTab('ssdf_controls')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'ssdf_controls'
                            ? 'bg-purple-600/25 border border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                            : 'bg-zinc-950 border border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    📋 NIST SSDF Assessment ({controls.length})
                </button>
                <button
                    onClick={() => setActiveTab('scenarios')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'scenarios'
                            ? 'bg-amber-600/25 border border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                            : 'bg-zinc-950 border border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    ⚙️ Architecture Scenarios
                </button>
                <button
                    onClick={() => setActiveTab('attestation')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'attestation'
                            ? 'bg-cyan-600/25 border border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                            : 'bg-zinc-950 border border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    📜 Attestation Certificate
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className="pt-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Top KPI Score Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Overall SbD Score */}
                            <div className="bg-[#09090e] border border-zinc-800/90 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Overall SbD Index</span>
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className={`text-4xl md:text-5xl font-black ${
                                            report.overallScore >= 90 ? 'text-emerald-400' :
                                            report.overallScore >= 75 ? 'text-blue-400' : 'text-amber-400'
                                        }`}>
                                            {report.overallScore}%
                                        </span>
                                        <span className="text-xs text-zinc-500 font-bold">COMPLIANT</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] font-sans">
                                    <span className="text-zinc-400">Evaluated Group:</span>
                                    <span className="font-bold text-white font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                                        {report.actualEvaluatedGroup} ({DEVELOPMENT_GROUPS[report.actualEvaluatedGroup].tier.split('/')[0].trim()})
                                    </span>
                                </div>
                            </div>

                            {/* Code Protection & Anti-Tamper */}
                            <div className="bg-[#09090e] border border-zinc-800/90 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
                                <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Protect the Software (PS)</span>
                                        <Lock className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-4xl md:text-5xl font-black text-cyan-400">
                                            {report.categoryScores.PS}%
                                        </span>
                                        <span className="text-xs text-cyan-500/80 font-bold">HIGH ASSURANCE</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] font-sans">
                                    <span className="text-zinc-400">Google CLA Shard:</span>
                                    <span className="font-mono text-cyan-400 text-[10px] truncate max-w-[130px]">
                                        {report.claAnchorProvenance.claSignatureId}
                                    </span>
                                </div>
                            </div>

                            {/* Well-Secured Software (PW) */}
                            <div className="bg-[#09090e] border border-zinc-800/90 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                                <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Produce Well-Secured (PW)</span>
                                        <Cpu className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-4xl md:text-5xl font-black text-purple-400">
                                            {report.categoryScores.PW}%
                                        </span>
                                        <span className="text-xs text-purple-500/80 font-bold">ROBUST</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] font-sans">
                                    <span className="text-zinc-400">Runtime Guard:</span>
                                    <span className="font-bold text-green-400 font-mono text-[10px]">
                                        ARMED & MONITORING
                                    </span>
                                </div>
                            </div>

                            {/* Continuous Vulnerability Response (RV) */}
                            <div className="bg-[#09090e] border border-zinc-800/90 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition-colors">
                                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Vulnerability Response (RV)</span>
                                        <Activity className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-4xl md:text-5xl font-black text-amber-400">
                                            {report.categoryScores.RV}%
                                        </span>
                                        <span className="text-xs text-amber-500/80 font-bold">ACTIVE SCAN</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] font-sans">
                                    <span className="text-zinc-400">Remediation Speed:</span>
                                    <span className="font-bold text-white font-mono text-[10px]">
                                        &lt; 2h CRITICAL SLA
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Four Fundamental Security Practices (From SAFECode SbD Guidance) */}
                        <div className="bg-[#09090e] border border-zinc-800/90 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <Layers className="w-5 h-5 text-emerald-400" />
                                    <h2 className="text-sm font-black uppercase tracking-wider text-white">
                                        Four Fundamental Security Practices (SAFECode & NIST SSDF)
                                    </h2>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500">MANDATORY FOR SBD ASSURANCE</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-black/60 border border-zinc-850 hover:border-zinc-750 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-xs font-black text-emerald-400">1</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-white uppercase">Creating Code That is Resistant to Attack</h3>
                                            <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-relaxed">
                                                Enforcing memory safety, strict input sanitization, least privilege execution boundaries, and threat modeling during design phases. Critical functions wrapped in tamper-resistant proxies.
                                            </p>
                                            <div className="mt-2.5 flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                                                    STATUS: VERIFIED
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-mono">PW.1, PW.5, PW.6</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-black/60 border border-zinc-850 hover:border-zinc-750 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-xs font-black text-cyan-400">2</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-white uppercase">Configuring Software Securely by Default</h3>
                                            <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-relaxed">
                                                Zero-trust defaults enabled out-of-the-box. Insecure protocols, legacy debug ports, and non-authenticated endpoints are permanently disabled across build configs.
                                            </p>
                                            <div className="mt-2.5 flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                                                    STATUS: ENFORCED
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-mono">PO.1, PW.2</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-black/60 border border-zinc-850 hover:border-zinc-750 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-xs font-black text-purple-400">3</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-white uppercase">Protecting Code from Unauthorized Change & GitHub Leaks</h3>
                                            <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-relaxed">
                                                Safeguarding repositories (GitHub) with branch protection, hardware MFA, signed commits, and Anti-Theft Sharding tied to Google CLA metadata that breaks and reports unauthorized reassembly.
                                            </p>
                                            <div className="mt-2.5 flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-950/60 border border-purple-500/30 text-purple-300">
                                                    STATUS: SHIELD ACTIVE
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-mono">PS.1, PS.2, CLA-88492</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-black/60 border border-zinc-850 hover:border-zinc-750 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-xs font-black text-amber-400">4</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-white uppercase">Continuous Improvement & Vulnerability Ingestion</h3>
                                            <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-relaxed">
                                                Fast feedback loops responding to vulnerability discoveries with regression test gating, root cause post-mortems, and hot-patch state reconciliation.
                                            </p>
                                            <div className="mt-2.5 flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-950/60 border border-amber-500/30 text-amber-300">
                                                    STATUS: CONTINUOUS
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-mono">RV.1, RV.2, RV.3</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Executive Summary & Architecture Profile Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-[#09090e] border border-zinc-800/90 rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-4 h-4 text-emerald-400" />
                                        <h3 className="text-xs font-black uppercase tracking-wider text-white">Executive Assessment Findings</h3>
                                    </div>
                                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                                        {report.executiveSummary}
                                    </p>
                                    
                                    {report.criticalGaps.length > 0 && (
                                        <div className="mt-4 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                                            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>Identified SbD Improvement Opportunities ({report.criticalGaps.length})</span>
                                            </div>
                                            <div className="space-y-1.5 font-mono text-[10px] text-zinc-300">
                                                {report.criticalGaps.slice(0, 3).map((gap, i) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <span className="text-amber-500">▶</span>
                                                        <span>{gap}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between flex-wrap gap-3">
                                    <div className="text-[10px] text-zinc-500">
                                        NIST SSDF SP 800-218 Verified / SAFECode Development Group Construct
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('attestation')}
                                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <span>View Attestation Certificate</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Active Context Indicators */}
                            <div className="bg-[#09090e] border border-zinc-800/90 rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">Architecture Profiles</h3>
                                    <div className="space-y-3 font-sans text-xs">
                                        <div className="p-3 rounded-xl bg-black/60 border border-zinc-850">
                                            <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Deployment Cadence</div>
                                            <div className="font-bold text-zinc-200 mt-0.5">{report.scenarios.boxed_vs_cicd}</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-black/60 border border-zinc-850">
                                            <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Repo & Developer Host</div>
                                            <div className="font-bold text-zinc-200 mt-0.5">{report.scenarios.local_vs_github_cis}</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-black/60 border border-zinc-850">
                                            <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Systems Topology</div>
                                            <div className="font-bold text-zinc-200 mt-0.5">{report.scenarios.monolith_vs_distributed}</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setActiveTab('scenarios')}
                                    className="mt-4 w-full py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                                >
                                    Adjust Architecture Scenarios
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: Development Groups (DG1, DG2, DG3) */}
                {activeTab === 'development_groups' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-[#09090e] border border-zinc-800/90 rounded-2xl p-6">
                            <div className="max-w-3xl">
                                <h2 className="text-base font-black uppercase tracking-wider text-white">
                                    SAFECode Three-Part Development Group Construct
                                </h2>
                                <p className="text-xs text-zinc-400 font-sans mt-1.5 leading-relaxed">
                                    As articulated in the SAFECode paper <em>"Application Software Security and the CIS Controls"</em>, not all software development contexts face identical threats or criticality. The three Development Groups (DG1, DG2, DG3) prioritize security activities commensurate with specific business cases and risk postures.
                                </p>
                            </div>

                            {/* DG Selection Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                {(['DG1', 'DG2', 'DG3'] as DevelopmentGroup[]).map((dgKey) => {
                                    const dg = DEVELOPMENT_GROUPS[dgKey];
                                    const isSelected = selectedDG === dgKey;
                                    const isCurrentEvaluated = report.actualEvaluatedGroup === dgKey;

                                    return (
                                        <div 
                                            key={dgKey}
                                            onClick={() => handleDGChange(dgKey)}
                                            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                                isSelected 
                                                    ? 'bg-blue-950/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.25)]' 
                                                    : 'bg-black/60 border-zinc-850 hover:border-zinc-700'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black font-mono text-zinc-500">{dgKey}</span>
                                                    {isCurrentEvaluated && (
                                                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                                                            CURRENT POSTURE
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-base font-black text-white mt-1">{dg.name}</h3>
                                                <div className="text-[11px] font-sans font-bold text-blue-400 mt-0.5">{dg.tier}</div>
                                                <p className="text-xs text-zinc-400 font-sans mt-3 leading-relaxed">
                                                    {dg.description}
                                                </p>
                                            </div>

                                            <div className="mt-5 pt-4 border-t border-zinc-850 space-y-2.5 text-xs font-sans">
                                                <div>
                                                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">Testing Cadence:</span>
                                                    <span className="text-zinc-300 font-medium">{dg.testingCadence}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">Repository Rigor:</span>
                                                    <span className="text-zinc-300 font-medium">{dg.repositoryRequirements}</span>
                                                </div>
                                                <div className="pt-2 flex items-center justify-between text-[11px]">
                                                    <span className="text-zinc-400">SSDF Target:</span>
                                                    <span className="font-mono font-bold text-blue-300">&ge; {dg.ssdfCoverageTarget}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* DG Comparison Matrix */}
                        <div className="bg-[#09090e] border border-zinc-800/90 rounded-2xl p-6 overflow-x-auto">
                            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">
                                SAFECode Controls Implementation Matrix
                            </h3>
                            <table className="w-full text-left text-xs font-sans">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase">
                                        <th className="py-2.5 px-3">Control Dimension</th>
                                        <th className="py-2.5 px-3">DG1 (Baseline)</th>
                                        <th className="py-2.5 px-3">DG2 (Commercial SaaS)</th>
                                        <th className="py-2.5 px-3 text-emerald-400">DG3 (Critical / Sovereign)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-850/60 font-mono text-[11px]">
                                    <tr>
                                        <td className="py-3 px-3 font-sans font-bold text-white">Repository Security (GitHub)</td>
                                        <td className="py-3 px-3 text-zinc-400">Basic 2FA, manual branch protection</td>
                                        <td className="py-3 px-3 text-zinc-300">Mandatory PR reviews, signed commits</td>
                                        <td className="py-3 px-3 text-emerald-300">FIDO2 MFA, Anti-Theft Sharding, CLA anchor</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-3 font-sans font-bold text-white">CI/CD Pipeline Security</td>
                                        <td className="py-3 px-3 text-zinc-400">Manual build triggers, periodic linting</td>
                                        <td className="py-3 px-3 text-zinc-300">Automated SAST/SCA on every PR</td>
                                        <td className="py-3 px-3 text-emerald-300">SLSA Level 3+ reproducible builds, dynamic fuzzing</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-3 font-sans font-bold text-white">Code Tamper Protection</td>
                                        <td className="py-3 px-3 text-zinc-400">Static git log history</td>
                                        <td className="py-3 px-3 text-zinc-300">Artifact hash verification</td>
                                        <td className="py-3 px-3 text-emerald-300">Runtime obfuscation, proxy guards, poison pill</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-3 font-sans font-bold text-white">SaaS & Third-Party Assurance</td>
                                        <td className="py-3 px-3 text-zinc-400">Ad-hoc package selection</td>
                                        <td className="py-3 px-3 text-zinc-300">SBOM generation & automated vulnerability alerts</td>
                                        <td className="py-3 px-3 text-emerald-300">Strict zero-trust vendor attestation & mTLS mesh</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB: NIST SSDF Interactive Assessment */}
                {activeTab === 'ssdf_controls' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Filter Bar */}
                        <div className="bg-[#09090e] border border-zinc-800/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 overflow-x-auto">
                                {[
                                    { id: 'ALL', label: 'All Categories' },
                                    { id: 'PO', label: 'PO: Prepare Org' },
                                    { id: 'PS', label: 'PS: Protect Software' },
                                    { id: 'PW', label: 'PW: Produce Well-Secured' },
                                    { id: 'RV', label: 'RV: Respond to Vulns' },
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id as any)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                                            selectedCategory === cat.id
                                                ? 'bg-purple-600/30 border border-purple-500 text-purple-300'
                                                : 'bg-black/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 text-xs font-mono">
                                <span className="text-zinc-400">Showing {filteredControls.length} tasks</span>
                                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-bold">
                                    {report.controlsSummary.compliant} / {report.controlsSummary.total} Pass
                                </span>
                            </div>
                        </div>

                        {/* Controls Checklist */}
                        <div className="space-y-3">
                            {filteredControls.map((item) => (
                                <div 
                                    key={item.id}
                                    className="bg-[#09090e] border border-zinc-850 hover:border-zinc-750 rounded-2xl p-5 transition-all"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
                                                    {item.id}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/40 border border-purple-500/30 text-purple-300">
                                                    {item.guidelineRef}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-blue-950/30 border border-blue-500/20 text-blue-400">
                                                    {item.safeCodeDG} Requirement
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-white pt-1">{item.taskName}</h3>
                                            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                                                {item.description}
                                            </p>
                                            <div className="pt-2 text-[11px] font-sans">
                                                <span className="text-zinc-500 font-mono">Current Implementation: </span>
                                                <span className="text-zinc-300">{item.implementationNotes}</span>
                                            </div>
                                            {item.status !== 'COMPLIANT' && (
                                                <div className="text-[11px] font-sans text-amber-400">
                                                    <span className="font-mono font-bold">Recommended Action: </span>
                                                    <span>{item.remediationAction}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Toggle Button */}
                                        <div className="shrink-0 flex items-center md:flex-col gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(item.id, item.status)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                                                    item.status === 'COMPLIANT'
                                                        ? 'bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                                        : item.status === 'PARTIAL'
                                                        ? 'bg-amber-950/50 border border-amber-500/50 text-amber-300'
                                                        : 'bg-red-950/50 border border-red-500/50 text-red-300'
                                                }`}
                                                title="Click to toggle compliance status"
                                            >
                                                {item.status === 'COMPLIANT' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                                {item.status === 'PARTIAL' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                                                {item.status === 'NON_COMPLIANT' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                                                <span>{item.status.replace('_', ' ')}</span>
                                            </button>
                                            <span className="text-[9px] text-zinc-500 font-mono">Weight: {item.weight} pts</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB: Architecture Scenarios Explorer */}
                {activeTab === 'scenarios' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-[#09090e] border border-zinc-800/90 rounded-2xl p-6">
                            <h2 className="text-base font-black uppercase tracking-wider text-white">
                                Architectural Context & Operational Environments
                            </h2>
                            <p className="text-xs text-zinc-400 font-sans mt-1.5 leading-relaxed">
                                The NIST SSDF and SAFECode guidelines specifically recognize that implementation varies dramatically depending on release cadence, development facility vs cloud repository, and application topology. Configure your active architectural dimensions below:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {scenarios.map((sc) => (
                                <div 
                                    key={sc.scenarioId}
                                    className="bg-[#09090e] border border-zinc-850 rounded-2xl p-6 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-bold text-white uppercase">{sc.title}</h3>
                                            <span className="text-[9px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                                                ACTIVE
                                            </span>
                                        </div>

                                        <div className="space-y-3 mt-4">
                                            {sc.options.map((opt) => {
                                                const isSelected = sc.activeOptionKey === opt.modeKey;
                                                return (
                                                    <div 
                                                        key={opt.modeKey}
                                                        onClick={() => handleScenarioOptionSelect(sc.scenarioId, opt.modeKey)}
                                                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                                            isSelected 
                                                                ? 'bg-amber-950/20 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                                                : 'bg-black/60 border-zinc-850 hover:border-zinc-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs font-bold text-white">{opt.label}</div>
                                                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                                                isSelected ? 'border-amber-400 bg-amber-400' : 'border-zinc-600'
                                                            }`}>
                                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-zinc-400 font-sans mt-1.5">
                                                            {opt.description}
                                                        </p>
                                                        <div className="mt-2.5 text-[11px] font-sans text-zinc-300">
                                                            <span className="font-mono text-zinc-500 text-[10px] block uppercase">SbD Assurance Expectation:</span>
                                                            {opt.sbdImplications}
                                                        </div>
                                                        <div className="mt-3 pt-2 border-t border-zinc-850/60">
                                                            <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Recommended Controls:</span>
                                                            <div className="space-y-1">
                                                                {opt.recommendedControls.map((rc, rIdx) => (
                                                                    <div key={rIdx} className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                                                                        <span className="text-amber-500/80">✔</span>
                                                                        <span>{rc}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-zinc-850 text-[11px] font-sans text-zinc-400">
                                        <span className="font-mono text-zinc-500 text-[10px] uppercase">AetherOS Context: </span>
                                        <span>{sc.assessmentNotes}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB: Attestation & Certification Export */}
                {activeTab === 'attestation' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Certificate Card */}
                        <div className="bg-[#09090e] border-2 border-emerald-500/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
                                <div>
                                    <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest block">
                                        OFFICIAL SOFTWARE ASSURANCE RECORD
                                    </span>
                                    <h2 className="text-xl font-black text-white uppercase tracking-wider mt-1">
                                        Secure by Design (SbD) Attestation Certificate
                                    </h2>
                                    <p className="text-xs text-zinc-400 font-sans mt-0.5">
                                        Formally certifying compliance with SAFECode Development Groups and NIST SSDF SP 800-218.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopyAttestation}
                                        className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                    >
                                        {copiedCert ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedCert ? 'Copied' : 'Copy Attestation'}</span>
                                    </button>
                                    <button
                                        onClick={handleCopyJson}
                                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                    >
                                        {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                                        <span>{copiedJson ? 'Copied JSON' : 'Export JSON'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Attestation Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6 border-b border-zinc-800">
                                <div>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Certificate Hash</span>
                                    <span className="text-xs font-mono font-bold text-emerald-400 break-all">
                                        {report.complianceCertificateHash}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Timestamp</span>
                                    <span className="text-xs font-mono text-zinc-200">{report.timestamp}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Evaluated SAFECode Tier</span>
                                    <span className="text-xs font-mono font-bold text-blue-400">
                                        {DEVELOPMENT_GROUPS[report.actualEvaluatedGroup].name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Overall SbD Score</span>
                                    <span className="text-2xl font-black text-white">{report.overallScore}%</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Google CLA Anchor</span>
                                    <span className="text-xs font-mono text-cyan-400">
                                        {report.claAnchorProvenance.claSignatureId}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Runtime Tamper Guard</span>
                                    <span className="text-xs font-mono text-green-400 font-bold">
                                        {report.runtimeGuardStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Sub-Category Scores */}
                            <div className="pt-6">
                                <h3 className="text-xs font-mono text-zinc-400 uppercase mb-3">NIST SSDF Category Breakdown</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 text-center">
                                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Prepare Org (PO)</span>
                                        <span className="text-lg font-black text-white">{report.categoryScores.PO}%</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 text-center">
                                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Protect Software (PS)</span>
                                        <span className="text-lg font-black text-cyan-400">{report.categoryScores.PS}%</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 text-center">
                                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Produce Secure (PW)</span>
                                        <span className="text-lg font-black text-purple-400">{report.categoryScores.PW}%</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 text-center">
                                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Respond Vulns (RV)</span>
                                        <span className="text-lg font-black text-amber-400">{report.categoryScores.RV}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
