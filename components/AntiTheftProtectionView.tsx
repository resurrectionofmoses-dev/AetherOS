import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldAlert, 
    ShieldCheck, 
    Lock, 
    FileCode, 
    Terminal, 
    Zap, 
    GitFork, 
    AlertTriangle, 
    Cpu, 
    Activity, 
    CheckCircle2, 
    XCircle, 
    Copy, 
    Check, 
    RefreshCw, 
    FileText,
    ExternalLink,
    Search,
    Download,
    Bug,
    Code2,
    Shield
} from 'lucide-react';
import { AntiTheftEngine, GoogleCLARecord, AntiTheftShard, LeakAttemptTelemetry } from '../services/antiTheftEngine';
import { RuntimeSecurityGuard, IntegrityHaltStatus } from '../services/runtimeSecurityGuard';

export const AntiTheftProtectionView: React.FC = () => {
    const [claRecord] = useState<GoogleCLARecord>(AntiTheftEngine.GOOGLE_CLA_ANCHOR);
    const [guardStatus, setGuardStatus] = useState<IntegrityHaltStatus>(RuntimeSecurityGuard.getStatus());

    useEffect(() => {
        const unsubscribe = RuntimeSecurityGuard.subscribe(status => {
            setGuardStatus(status);
        });
        return () => unsubscribe();
    }, []);

    const [sampleCode, setSampleCode] = useState<string>(
`// AetherOS High-Performance Neural Matrix Transformation
export function computeMatrixLayer(inputVector: Float32Array, weights: Float32Array): Float32Array {
    const output = new Float32Array(inputVector.length);
    for (let i = 0; i < inputVector.length; i++) {
        output[i] = Math.tanh(inputVector[i] * weights[i]);
    }
    return output;
}`
    );

    const [protectedOutput, setProtectedOutput] = useState<{
        protectedCode: string;
        shards: AntiTheftShard[];
        watermarkSignature: string;
    } | null>(null);

    const [copied, setCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Leak Simulator State
    const [testRepoUrl, setTestRepoUrl] = useState('https://github.com/leaked-repo-mirror/aetheros-stolen-code');
    const [testEnvironment, setTestEnvironment] = useState('Public GitHub Actions CI Runner (Ubuntu-latest)');
    const [simulatingLeak, setSimulatingLeak] = useState(false);
    const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
    const [telemetryHistory, setTelemetryHistory] = useState<LeakAttemptTelemetry[]>([
        {
            id: 'TELEMETRY-882109',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            sourceRepositoryUrl: 'https://github.com/shadow-developer/aether-mirror-fork',
            detectedEnvironment: 'Public GitHub Actions / Node v20.10.0',
            executorIp: '198.51.100.42',
            claVerificationStatus: 'MISSING',
            breachActionTaken: 'TELEMETRY_REPORTED_TO_GOOGLE_CLA',
            tamperedShards: ['SHARD-01-KERNEL', 'SHARD-02-ALGORITHM'],
            traceSignature: 'CLA-TRACE-GOOGLE-88492-X9'
        },
        {
            id: 'TELEMETRY-441203',
            timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
            sourceRepositoryUrl: 'https://github.com/leaked-matrix/standalone-runner',
            detectedEnvironment: 'Raw External V8 Engine Context',
            executorIp: '203.0.113.88',
            claVerificationStatus: 'TAMPERED',
            breachActionTaken: 'POISON_PILL_EXECUTED',
            tamperedShards: ['SHARD-01-KERNEL'],
            traceSignature: 'CLA-TRACE-GOOGLE-11029-P4'
        }
    ]);

    // Handle Protection Injection
    const handleInjectProtection = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const result = AntiTheftEngine.injectAntiTheftProtection(sampleCode, 'NeuralMatrixEngine');
            setProtectedOutput(result);
            setIsProcessing(false);
        }, 600);
    };

    // Copy protected code
    const handleCopy = () => {
        if (!protectedOutput) return;
        navigator.clipboard.writeText(protectedOutput.protectedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Run Public GitHub Leak & Assembly Breach Simulation
    const handleRunSimulation = () => {
        setSimulatingLeak(true);
        setSimulationLogs([]);

        const steps = [
            `[STEP 1] Initializing GitHub Leak Simulation on target URL: ${testRepoUrl}`,
            `[STEP 2] Attempting unauthenticated AST reconstruction from stolen static source code...`,
            `[STEP 3] Evaluating runtime environment signature: ${testEnvironment}`,
            `[CRITICAL BREACH DETECTED] window.__AETHER_CLA_ENCLAVE_ACTIVE__ is UNDEFINED.`,
            `[VERIFICATION] Verifying Google Contributor License Agreement (CLA) signature hash...`,
            `[CLA FAILURE] Provided runtime CLA signature: NULL. Required: ${claRecord.claSignatureId}`,
            `[POISON PILL ENGAGED] Circuit breaker triggered! Execution stack corrupted to prevent re-assembly.`,
            `[TELEMETRY DISPATCHED] Encrypted breach report successfully transmitted to Google CLA Governance endpoint: https://cla.developers.google.com/api/v1/report_breach`
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < steps.length) {
                setSimulationLogs(prev => [...prev, steps[index]]);
                index++;
            } else {
                clearInterval(interval);
                const newTelemetry = AntiTheftEngine.simulateLeakAttempt(testRepoUrl, testEnvironment);
                setTelemetryHistory(prev => [newTelemetry, ...prev]);
                setSimulatingLeak(false);
            }
        }, 500);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto font-mono text-zinc-300">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-red-950/60 via-black to-zinc-950 border-2 border-red-600/40 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.15)]">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <ShieldAlert className="w-64 h-64 text-red-500" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-3xl">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                <Zap className="w-3 h-3 text-red-400" />
                                Google CLA Anti-Theft Guard Active
                            </span>
                            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                <Lock className="w-3 h-3" />
                                Anti-Assembly Sharding
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tight">
                            Cryptographic Code Anti-Theft Engine
                        </h1>
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                            Prevents stolen or leaked code from being re-assembled or executed outside AetherOS.
                            All code fragments contain poison pills and cryptographic watermarks bound strictly to the{' '}
                            <strong className="text-red-400 font-mono">Google Contributor License Agreement (CLA)</strong>. Unbound execution triggers immediate code corruption and logs breach telemetry to Google CLA governance.
                        </p>
                    </div>

                    {/* CLA Badge Box */}
                    <div className="bg-black/80 border-2 border-red-500/40 p-4 rounded-2xl shrink-0 space-y-2 lg:w-80 shadow-lg">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                Google CLA Anchor
                            </span>
                            <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                                VERIFIED
                            </span>
                        </div>
                        <div className="space-y-1 text-[9px]">
                            <div className="flex justify-between">
                                <span className="text-zinc-500 font-bold uppercase">CLA Token:</span>
                                <span className="text-white font-mono font-bold">{claRecord.claSignatureId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500 font-bold uppercase">GCP Project:</span>
                                <span className="text-zinc-300 font-mono">{claRecord.googleProjectId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500 font-bold uppercase">Licensing Tier:</span>
                                <span className="text-amber-400 font-mono font-bold">{claRecord.licensingTier}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secure by Design (SbD) & NIST SSDF Alignment Card */}
            <div className="bg-gradient-to-r from-emerald-950/30 via-zinc-950 to-blue-950/20 border-2 border-emerald-500/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase text-white tracking-wider">
                                Secure by Design (SbD) Architecture Alignment
                            </span>
                            <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                NIST SSDF PS.1 & PS.2
                            </span>
                            <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                SAFECode DG3 Verified
                            </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                            Fulfills fundamental SbD requirement: <em>"Protecting code and software from unauthorized change, leaks, and GitHub repository tampering."</em>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
                        TAMPER-HALT ARMED
                    </span>
                </div>
            </div>

            {/* Grid layout: Code Watermarker & Sharder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Code Watermark & Sharding Workbench */}
                <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <div className="flex items-center gap-3">
                                <FileCode className="w-5 h-5 text-red-400" />
                                <div>
                                    <h3 className="text-base font-black text-white uppercase italic">1. Watermark & Shard Code</h3>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase">Inject Google CLA attestation & poison pills</p>
                                </div>
                            </div>
                            <button
                                onClick={handleInjectProtection}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                        Sharding...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Apply Protection
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Input Code Textarea */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                                <span>Target Source Code</span>
                                <span className="text-zinc-600 font-mono">{sampleCode.length} bytes</span>
                            </label>
                            <textarea
                                value={sampleCode}
                                onChange={(e) => setSampleCode(e.target.value)}
                                rows={8}
                                className="w-full bg-black/80 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-red-500 custom-scrollbar"
                                placeholder="Paste source code to watermark and protect..."
                            />
                        </div>

                        {/* Protected Output View */}
                        {protectedOutput && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3 pt-2"
                            >
                                <div className="flex items-center justify-between bg-zinc-900/80 p-2.5 px-4 rounded-xl border border-red-500/30">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-red-400" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">
                                            Watermark ID: {protectedOutput.watermarkSignature}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="px-3 py-1 bg-black border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                        {copied ? 'Copied' : 'Copy Payload'}
                                    </button>
                                </div>

                                {/* Generated Shards */}
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Generated Cryptographic AST Shards</span>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        {protectedOutput.shards.map((shard) => (
                                            <div key={shard.shardId} className="p-3 bg-black/60 border border-zinc-800 rounded-xl space-y-1">
                                                <div className="flex items-center justify-between text-[8px] font-black text-red-400">
                                                    <span>{shard.shardId}</span>
                                                    <span className="bg-red-950/60 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">ENCRYPTED</span>
                                                </div>
                                                <div className="text-[10px] font-bold text-white truncate">{shard.shardName}</div>
                                                <div className="text-[8px] text-zinc-500 font-mono">Hash: {shard.hash}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Right Column: Public GitHub Leak & Assembly Breach Simulator */}
                <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <div className="flex items-center gap-3">
                                <GitFork className="w-5 h-5 text-amber-400" />
                                <div>
                                    <h3 className="text-base font-black text-white uppercase italic">2. Public GitHub Leak Simulator</h3>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase">Test anti-assembly & Google CLA breach response</p>
                                </div>
                            </div>
                            <button
                                onClick={handleRunSimulation}
                                disabled={simulatingLeak}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {simulatingLeak ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                                        Testing Leak...
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-4 h-4" />
                                        Simulate Leak
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Simulation Inputs */}
                        <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Simulated Leaked Repository URL</label>
                                <input
                                    type="text"
                                    value={testRepoUrl}
                                    onChange={(e) => setTestRepoUrl(e.target.value)}
                                    className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">External Execution Environment</label>
                                <input
                                    type="text"
                                    value={testEnvironment}
                                    onChange={(e) => setTestEnvironment(e.target.value)}
                                    className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>

                        {/* Console Simulation Output */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                                Breached Enclave Console Log Output
                            </label>
                            <div className="bg-black border border-zinc-800 rounded-2xl p-4 h-56 overflow-y-auto space-y-2 font-mono text-[10px] custom-scrollbar">
                                {simulationLogs.length === 0 ? (
                                    <div className="text-zinc-600 italic">Click "Simulate Leak" above to test unauthorized public GitHub assembly interception.</div>
                                ) : (
                                    simulationLogs.map((log, i) => (
                                        <div 
                                            key={i} 
                                            className={`${
                                                log.includes('CRITICAL') || log.includes('POISON') || log.includes('FAILURE')
                                                    ? 'text-red-400 font-bold'
                                                    : log.includes('TELEMETRY') || log.includes('VERIFICATION')
                                                    ? 'text-amber-400 font-bold'
                                                    : 'text-zinc-400'
                                            }`}
                                        >
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Runtime Proxy Security Guard Card */}
            <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <Shield className={`w-6 h-6 ${guardStatus.isHalted ? 'text-red-500 animate-pulse' : 'text-blue-400'}`} />
                        <div>
                            <h3 className="text-base font-black text-white uppercase italic flex items-center gap-2">
                                Proxy Runtime Security Guard
                                <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                                    guardStatus.isHalted 
                                        ? 'bg-red-950/80 text-red-400 border-red-500/50 animate-pulse'
                                        : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                                }`}>
                                    {guardStatus.isHalted ? 'INTEGRITY-HALT' : 'ARMED & ACTIVE'}
                                </span>
                            </h3>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase">
                                Proxy-wrapped core functions (<code className="text-blue-400">conjunctionThroughputMeter</code> & <code className="text-blue-400">emergencyKillSwitch</code>)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {guardStatus.isHalted && (
                            <button
                                onClick={() => RuntimeSecurityGuard.resetIntegrityHalt()}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-lg"
                            >
                                Reset Integrity Halt
                            </button>
                        )}
                    </div>
                </div>

                {/* Guard Status Banner if Halted */}
                {guardStatus.isHalted && (
                    <div className="p-4 bg-red-950/40 border-2 border-red-600/60 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span>System Integrity Breach Detected — Application Halted</span>
                        </div>
                        <p className="text-[10px] text-zinc-300 font-mono">
                            <strong>Reason:</strong> {guardStatus.reason}<br />
                            <strong>Triggered Target:</strong> {guardStatus.triggeredBy}<br />
                            <strong>Breach Type:</strong> {guardStatus.breachType}<br />
                            <strong>Timestamp:</strong> {guardStatus.timestamp}
                        </p>
                    </div>
                )}

                {/* Interactive Attack Simulation Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div className="p-4 bg-black/60 border border-zinc-800 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-white font-black text-xs uppercase">
                            <Code2 className="w-4 h-4 text-amber-400" />
                            <span>1. String Serialization</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 leading-relaxed">
                            Simulates decompiler or inspector calling <code className="text-amber-300">toString()</code> or <code className="text-amber-300">Symbol.toPrimitive</code> on guarded functions.
                        </p>
                        <button
                            onClick={() => RuntimeSecurityGuard.simulateAttack('conjunctionThroughputMeter', 'STRING_SERIALIZATION')}
                            className="w-full mt-2 px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 rounded-xl text-[9px] font-bold uppercase transition-all cursor-pointer"
                        >
                            Test toString() Serialization Probe
                        </button>
                    </div>

                    <div className="p-4 bg-black/60 border border-zinc-800 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-white font-black text-xs uppercase">
                            <Bug className="w-4 h-4 text-red-400" />
                            <span>2. Debugger Attachment</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 leading-relaxed">
                            Simulates unauthorized devtools debugger breakpoints or property probes on <code className="text-red-300">emergencyKillSwitch</code>.
                        </p>
                        <button
                            onClick={() => RuntimeSecurityGuard.simulateAttack('emergencyKillSwitch', 'DEBUGGER_ATTACHMENT')}
                            className="w-full mt-2 px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 rounded-xl text-[9px] font-bold uppercase transition-all cursor-pointer"
                        >
                            Test Debugger Attachment Probe
                        </button>
                    </div>

                    <div className="p-4 bg-black/60 border border-zinc-800 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-white font-black text-xs uppercase">
                            <Lock className="w-4 h-4 text-purple-400" />
                            <span>3. Property Mutation Trap</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 leading-relaxed">
                            Simulates unauthorized tampering or mutation of guarded proxy function properties.
                        </p>
                        <button
                            onClick={() => RuntimeSecurityGuard.simulateAttack('conjunctionThroughputMeter', 'MUTATION_ATTEMPT')}
                            className="w-full mt-2 px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-300 rounded-xl text-[9px] font-bold uppercase transition-all cursor-pointer"
                        >
                            Test State Mutation Attack
                        </button>
                    </div>
                </div>
            </div>

            {/* Live Telemetry Log Table */}
            <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <div>
                            <h3 className="text-base font-black text-white uppercase italic">3. Google CLA Telemetry Breach Audit Log</h3>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase">Real-time reporting of intercepted unauthorized executions</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase rounded-full">
                        {telemetryHistory.length} Interceptions Captured
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] font-mono">
                        <thead>
                            <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[8px] font-black">
                                <th className="p-3">Telemetry ID</th>
                                <th className="p-3">Source Repository / Context</th>
                                <th className="p-3">Executor IP</th>
                                <th className="p-3">CLA Status</th>
                                <th className="p-3">Breach Action Taken</th>
                                <th className="p-3 text-right">Trace Signature</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {telemetryHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                                    <td className="p-3 font-bold text-red-400">{item.id}</td>
                                    <td className="p-3">
                                        <div className="text-white font-bold truncate max-w-xs">{item.sourceRepositoryUrl}</div>
                                        <div className="text-[8px] text-zinc-500">{item.detectedEnvironment}</div>
                                    </td>
                                    <td className="p-3 text-zinc-300">{item.executorIp}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                            item.claVerificationStatus === 'VALID'
                                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                                                : 'bg-red-950/60 text-red-400 border-red-500/30'
                                        }`}>
                                            {item.claVerificationStatus}
                                        </span>
                                    </td>
                                    <td className="p-3 font-bold text-amber-400">{item.breachActionTaken}</td>
                                    <td className="p-3 text-right text-zinc-400">{item.traceSignature}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
