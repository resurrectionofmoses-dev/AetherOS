import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    FileIntegrityRecord, 
    FileIntegrityStatus, 
    IntegrityBaselineManifest, 
    IntegrityScanResult 
} from '../types';
import { fileIntegrityMonitorService } from '../services/fileIntegrityMonitorService';
import { 
    FileCode, 
    Lock, 
    Unlock, 
    ShieldCheck, 
    ShieldAlert, 
    Zap, 
    FileCheck, 
    FileWarning, 
    Eye, 
    History, 
    Radio,
    Download,
    X,
    Filter,
    Key,
    RotateCcw,
    RefreshCw,
    AlertTriangle,
    Search,
    Check
} from 'lucide-react';

export const FileIntegrityMonitorView: React.FC = () => {
    const [scanResult, setScanResult] = useState<IntegrityScanResult | null>(null);
    const [baseline, setBaseline] = useState<IntegrityBaselineManifest | null>(null);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'SECURED' | 'TAMPERED' | 'QUARANTINED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<FileIntegrityRecord | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isRecalibrating, setIsRecalibrating] = useState(false);
    const [passphraseInput, setPassphraseInput] = useState('');
    const [showLockModal, setShowLockModal] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
    const [auditLogs, setAuditLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'info' | 'warn' | 'success' | 'alert' }>>([]);

    useEffect(() => {
        // Subscribe to real-time persistent monitoring updates
        const unsubscribe = fileIntegrityMonitorService.subscribe((res) => {
            setScanResult(res);
            setBaseline(fileIntegrityMonitorService.getBaselineManifest());

            if (res.isTamperDetected) {
                addAuditLog(`CRITICAL: Real-time scan detected ${res.tamperedCount} unauthorized file modification(s)!`, 'alert');
            } else {
                addAuditLog(`SCAN COMPLETE: ${res.matchedCount}/${res.totalScanned} files verified against baseline signature matrix.`, 'info');
            }
        });

        return () => unsubscribe();
    }, []);

    const addAuditLog = (msg: string, type: 'info' | 'warn' | 'success' | 'alert') => {
        const time = new Date().toLocaleTimeString();
        setAuditLogs(prev => [
            { id: Math.random().toString(36).substring(2, 9), time, msg, type },
            ...prev.slice(0, 49)
        ]);
    };

    const handleRunDeepScan = async () => {
        setIsScanning(true);
        addAuditLog('Initiating full system cryptographic hash recalculation scan...', 'info');
        try {
            const res = await fileIntegrityMonitorService.runIntegrityScan();
            setScanResult(res);
            setNotificationMessage(`Scan completed: ${res.matchedCount} verified, ${res.tamperedCount} tampered.`);
        } catch (e: any) {
            addAuditLog(`Scan failed: ${e.message}`, 'alert');
        } finally {
            setIsScanning(false);
        }
    };

    const handleRecalibrateBaseline = async () => {
        setIsRecalibrating(true);
        addAuditLog('Recalibrating known-good baseline manifest signatures...', 'warn');
        try {
            const newBaseline = await fileIntegrityMonitorService.updateBaselineFromCurrentScan();
            setBaseline(newBaseline);
            addAuditLog(`Baseline signature manifest recalibrated and cryptographically sealed: ${newBaseline.masterSignature.substring(0, 16)}...`, 'success');
            setNotificationMessage('Known-good baseline manifest updated successfully.');
        } catch (e: any) {
            addAuditLog(`Baseline update error: ${e.message}`, 'alert');
        } finally {
            setIsRecalibrating(false);
        }
    };

    const handleLockBaseline = async () => {
        if (!passphraseInput.trim()) return;
        try {
            const updated = await fileIntegrityMonitorService.lockBaseline(passphraseInput);
            setBaseline(updated);
            setShowLockModal(false);
            setPassphraseInput('');
            addAuditLog(`Baseline locked with passphrase seal [${updated.passphraseHash}].`, 'success');
            setNotificationMessage('Baseline cryptographically locked.');
        } catch (e: any) {
            addAuditLog(`Lock error: ${e.message}`, 'alert');
        }
    };

    const handleSimulateTamper = async (relativePath: string) => {
        addAuditLog(`SIMULATION: Injecting unauthorized code modification into ${relativePath}...`, 'alert');
        const res = await fileIntegrityMonitorService.simulateTamperEvent(relativePath);
        setScanResult(res);
        setNotificationMessage(`Simulated unauthorized edit on ${relativePath}. Real-time alert triggered!`);
    };

    const handleRestoreFile = async (relativePath: string) => {
        addAuditLog(`Restoring ${relativePath} back to verified baseline snapshot...`, 'info');
        const res = await fileIntegrityMonitorService.restoreFileToBaseline(relativePath);
        setScanResult(res);
        setNotificationMessage(`File ${relativePath} restored to baseline signature.`);
        addAuditLog(`Integrity restored for ${relativePath}. Signature matches baseline.`, 'success');
    };

    const handleQuarantineFile = async (relativePath: string) => {
        addAuditLog(`Isolating & quarantining ${relativePath}...`, 'warn');
        const res = await fileIntegrityMonitorService.quarantineFile(relativePath);
        setScanResult(res);
        setNotificationMessage(`File ${relativePath} placed into air-gapped quarantine.`);
    };

    const filteredRecords = scanResult?.records.filter(r => {
        const matchesQuery = r.relativePath.toLowerCase().includes(searchQuery.toLowerCase());
        if (filterStatus === 'SECURED') return matchesQuery && r.status === 'SECURED_MATCH';
        if (filterStatus === 'TAMPERED') return matchesQuery && r.status === 'UNAUTHORIZED_MODIFICATION';
        if (filterStatus === 'QUARANTINED') return matchesQuery && r.status === 'QUARANTINED';
        return matchesQuery;
    }) || [];

    const isSystemSecure = scanResult ? !scanResult.isTamperDetected : true;

    return (
        <div className="flex-1 flex flex-col bg-[#030712] text-zinc-100 p-6 overflow-hidden font-mono select-none">
            {/* TOP NOTIFICATION TOAST */}
            {notificationMessage && (
                <div className="mb-4 p-3 bg-cyan-950/90 border border-cyan-500 text-cyan-300 text-xs rounded-xl flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>{notificationMessage}</span>
                    </div>
                    <button onClick={() => setNotificationMessage(null)} className="text-zinc-400 hover:text-white font-bold">✕</button>
                </div>
            )}

            {/* HEADER */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-5">
                <div>
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl border ${isSystemSecure ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-rose-950/90 border-rose-500 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.5)] animate-bounce'}`}>
                            {isSystemSecure ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Persistent File Integrity Monitor</h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isSystemSecure ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'}`}>
                                    {isSystemSecure ? '● REAL-TIME PROTECTED' : '▲ TAMPER DETECTED'}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Real-time local signature comparison against secured known-good baseline manifest
                            </p>
                        </div>
                    </div>
                </div>

                {/* HEALTH SCORE & QUICK METRICS */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="px-4 py-2 bg-slate-950 border border-zinc-800 rounded-xl text-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Health Index</span>
                        <span className={`text-lg font-black ${isSystemSecure ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {scanResult?.healthScorePercent ?? 100}%
                        </span>
                    </div>

                    <div className="px-4 py-2 bg-slate-950 border border-zinc-800 rounded-xl text-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tracked Files</span>
                        <span className="text-lg font-black text-cyan-400">{scanResult?.totalScanned ?? 0}</span>
                    </div>

                    <div className="px-4 py-2 bg-slate-950 border border-zinc-800 rounded-xl text-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Tampered</span>
                        <span className={`text-lg font-black ${scanResult?.tamperedCount ? 'text-rose-500 animate-pulse' : 'text-zinc-500'}`}>
                            {scanResult?.tamperedCount ?? 0}
                        </span>
                    </div>

                    <div className="px-4 py-2 bg-slate-950 border border-zinc-800 rounded-xl text-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Daemon Status</span>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-1">
                            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                            <span>ACTIVE (4s)</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ACTION CONTROLS BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-950 border border-zinc-800 p-3.5 rounded-2xl">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleRunDeepScan}
                        disabled={isScanning}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                        {isScanning ? 'Hashing Files...' : 'Run Real-Time Scan'}
                    </button>

                    <button
                        onClick={handleRecalibrateBaseline}
                        disabled={isRecalibrating}
                        className="px-4 py-2 bg-amber-600/80 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Update Baseline Manifest
                    </button>

                    <button
                        onClick={() => setShowLockModal(true)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-zinc-700"
                    >
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        Lock Baseline Seal
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Simulate:</span>
                    <button
                        onClick={() => handleSimulateTamper('App.tsx')}
                        className="px-3 py-1.5 bg-rose-950/80 border border-rose-800 hover:bg-rose-900 text-rose-300 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                        <Zap className="w-3.5 h-3.5 text-rose-400" />
                        Inject Tamper (App.tsx)
                    </button>
                    <button
                        onClick={() => handleSimulateTamper('server.ts')}
                        className="px-3 py-1.5 bg-rose-950/80 border border-rose-800 hover:bg-rose-900 text-rose-300 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                        <Zap className="w-3.5 h-3.5 text-rose-400" />
                        Inject Tamper (server.ts)
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* LEFT 2 COLS: KNOWN-GOOD BASELINE & TRACKED FILE MATRIX */}
                <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
                    {/* BASELINE MANIFEST HEADER CARD */}
                    {baseline && (
                        <div className="bg-slate-950/80 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500 font-bold uppercase">Baseline Manifest ID:</span>
                                    <code className="text-cyan-400 font-bold">{baseline.manifestId}</code>
                                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[9px] uppercase border border-emerald-800 rounded-md flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Sealed
                                    </span>
                                </div>
                                <div className="text-[11px] text-zinc-400">
                                    Operator: <strong className="text-zinc-200">{baseline.lockedBy}</strong> • Locked: {new Date(baseline.createdTimestamp).toLocaleString()}
                                </div>
                            </div>

                            <div className="space-y-1 text-right md:text-right text-[11px]">
                                <span className="text-zinc-500 uppercase font-bold block">Master Signature Hash</span>
                                <code className="text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-zinc-800 text-[10px]">
                                    {baseline.masterSignature.substring(0, 24)}...
                                </code>
                            </div>
                        </div>
                    )}

                    {/* FILTER & SEARCH ROW */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 border border-zinc-800/80 p-3 rounded-2xl">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Filter className="w-4 h-4 text-zinc-500" />
                            <div className="flex gap-1 text-xs">
                                {(['ALL', 'SECURED', 'TAMPERED', 'QUARANTINED'] as const).map(st => (
                                    <button
                                        key={st}
                                        onClick={() => setFilterStatus(st)}
                                        className={`px-3 py-1 rounded-lg font-bold text-[11px] uppercase transition-all cursor-pointer ${
                                            filterStatus === st 
                                                ? 'bg-cyan-950 text-cyan-400 border border-cyan-700' 
                                                : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full sm:w-64 bg-slate-900 border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
                            <Search className="w-3.5 h-3.5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search tracked files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent outline-none text-zinc-200 placeholder-zinc-600"
                            />
                        </div>
                    </div>

                    {/* FILE MATRIX TABLE */}
                    <div className="flex-1 bg-slate-950 border border-zinc-800 rounded-2xl overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900 text-[10px] text-zinc-500 uppercase border-b border-zinc-800 sticky top-0 z-10">
                                <tr>
                                    <th className="p-3.5">Tracked File Path</th>
                                    <th className="p-3.5">Risk Level</th>
                                    <th className="p-3.5">Known-Good Baseline Signature</th>
                                    <th className="p-3.5">Real-Time Signature Hash</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                                            No file integrity records match criteria
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((rec) => {
                                        const isTampered = rec.status === 'UNAUTHORIZED_MODIFICATION';
                                        const isQuarantined = rec.status === 'QUARANTINED';

                                        return (
                                            <tr key={rec.relativePath} className={`hover:bg-slate-900/60 transition-colors ${isTampered ? 'bg-rose-950/20' : ''}`}>
                                                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                                                    <FileCode className={`w-4 h-4 ${isTampered ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
                                                    <span>{rec.relativePath}</span>
                                                </td>

                                                <td className="p-3.5">
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase border ${
                                                        rec.riskLevel === 'CRITICAL_SECURITY_BREACH' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                                                        rec.riskLevel === 'HIGH' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                                                        'bg-zinc-900 text-zinc-400 border-zinc-800'
                                                    }`}>
                                                        {rec.riskLevel === 'CRITICAL_SECURITY_BREACH' ? 'CRITICAL' : rec.riskLevel}
                                                    </span>
                                                </td>

                                                <td className="p-3.5 font-mono text-[10px] text-emerald-400/90">
                                                    {rec.baselineHash.substring(0, 16)}...
                                                </td>

                                                <td className="p-3.5 font-mono text-[10px]">
                                                    <span className={isTampered ? 'text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800' : 'text-cyan-400'}>
                                                        {rec.currentHash.substring(0, 16)}...
                                                    </span>
                                                </td>

                                                <td className="p-3.5">
                                                    {isTampered && (
                                                        <span className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 w-fit animate-pulse">
                                                            <AlertTriangle className="w-3 h-3 text-rose-400" /> TAMPERED
                                                        </span>
                                                    )}
                                                    {isQuarantined && (
                                                        <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 w-fit">
                                                            <Lock className="w-3 h-3 text-amber-400" /> QUARANTINED
                                                        </span>
                                                    )}
                                                    {rec.status === 'SECURED_MATCH' && (
                                                        <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 w-fit">
                                                            <Check className="w-3 h-3 text-emerald-400" /> VERIFIED
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="p-3.5 text-right space-x-1.5">
                                                    <button
                                                        onClick={() => setSelectedRecord(rec)}
                                                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase rounded-lg border border-zinc-700 cursor-pointer"
                                                    >
                                                        Inspect
                                                    </button>
                                                    {isTampered ? (
                                                        <button
                                                            onClick={() => handleRestoreFile(rec.relativePath)}
                                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded-lg cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                        >
                                                            Restore
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleQuarantineFile(rec.relativePath)}
                                                            className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                                                        >
                                                            Isolate
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT COL: REAL-TIME AUDIT EVENT STREAM */}
                <div className="bg-slate-950 border border-zinc-800 rounded-2xl p-4 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                            <History className="w-4 h-4 text-cyan-400" />
                            <span>Real-Time Audit Event Log</span>
                        </div>
                        <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 text-cyan-400 text-[9px] rounded-full uppercase">
                            LIVE STREAM
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-[11px]">
                        {auditLogs.length === 0 ? (
                            <div className="py-12 text-center text-zinc-600 font-bold uppercase tracking-widest text-[10px]">
                                Awaiting audit telemetry events...
                            </div>
                        ) : (
                            auditLogs.map((log) => (
                                <div 
                                    key={log.id} 
                                    className={`p-2.5 rounded-xl border space-y-1 transition-all ${
                                        log.type === 'alert' ? 'bg-rose-950/40 border-rose-800 text-rose-300' :
                                        log.type === 'warn' ? 'bg-amber-950/30 border-amber-800/60 text-amber-300' :
                                        log.type === 'success' ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' :
                                        'bg-slate-900/50 border-zinc-800/80 text-zinc-400'
                                    }`}
                                >
                                    <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold">
                                        <span>[{log.time}]</span>
                                        <span className="uppercase">{log.type}</span>
                                    </div>
                                    <p className="leading-snug">{log.msg}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* INSPECT DIFF MODAL */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0b1329] border border-cyan-500/50 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <div className="flex items-center gap-3">
                                <FileCode className="w-6 h-6 text-cyan-400" />
                                <div>
                                    <h3 className="text-lg font-black text-white">{selectedRecord.relativePath}</h3>
                                    <p className="text-xs text-zinc-400">Cryptographic Signature Verification Details</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRecord(null)} className="p-2 text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 bg-slate-950 rounded-xl border border-zinc-800 space-y-1">
                                <span className="text-zinc-500 font-bold uppercase text-[10px]">Known-Good Baseline Signature (SHA-256):</span>
                                <code className="block text-emerald-400 break-all">{selectedRecord.baselineHash}</code>
                            </div>

                            <div className="p-3 bg-slate-950 rounded-xl border border-zinc-800 space-y-1">
                                <span className="text-zinc-500 font-bold uppercase text-[10px]">Real-Time Measured Hash (SHA-256):</span>
                                <code className={`block break-all ${selectedRecord.status === 'UNAUTHORIZED_MODIFICATION' ? 'text-rose-400 font-bold' : 'text-cyan-400'}`}>
                                    {selectedRecord.currentHash}
                                </code>
                            </div>

                            {selectedRecord.diffPreview && (
                                <div className="space-y-1">
                                    <span className="text-zinc-400 font-bold uppercase text-[10px]">Code Modification Diff Preview:</span>
                                    <pre className="p-3 bg-slate-950 border border-rose-900/60 rounded-xl text-rose-300 text-[11px] leading-relaxed overflow-x-auto">
                                        {selectedRecord.diffPreview}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase rounded-xl cursor-pointer"
                            >
                                Close
                            </button>
                            {selectedRecord.status === 'UNAUTHORIZED_MODIFICATION' && (
                                <button
                                    onClick={() => {
                                        handleRestoreFile(selectedRecord.relativePath);
                                        setSelectedRecord(null);
                                    }}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer"
                                >
                                    Restore to Baseline
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* LOCK BASELINE MODAL */}
            {showLockModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0b1329] border border-emerald-500/50 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <div className="flex items-center gap-2 text-white font-bold text-base uppercase">
                                <Lock className="w-5 h-5 text-emerald-400" />
                                <span>Lock Baseline Seal</span>
                            </div>
                            <button onClick={() => setShowLockModal(false)} className="text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <p className="text-zinc-300 leading-relaxed">
                                Provide a master passphrase to cryptographically salt and seal the current known-good baseline manifest.
                            </p>
                            <input
                                type="password"
                                placeholder="Enter Master Lock Passphrase..."
                                value={passphraseInput}
                                onChange={(e) => setPassphraseInput(e.target.value)}
                                className="w-full bg-slate-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setShowLockModal(false)}
                                className="px-4 py-2 bg-zinc-800 text-zinc-400 font-bold text-xs uppercase rounded-xl cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLockBaseline}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer"
                            >
                                Seal Baseline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
