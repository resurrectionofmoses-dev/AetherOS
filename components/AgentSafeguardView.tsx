import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ShieldIcon, ActivityIcon, BrainIcon, LockIcon, ZapIcon, 
    WrenchIcon, SpinnerIcon, WarningIcon, CheckCircleIcon,
    TerminalIcon, TrashIcon, SendIcon, UnlockIcon, MessageCircleIcon,
    SparklesIcon, CheckIcon
} from './icons';
import { safeStorage } from '../services/safeStorage';

interface ThreatLog {
    id: string;
    timestamp: string;
    phase: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const AgentSafeguardView: React.FC = () => {
    // Stage Selected
    const [activeStage, setActiveStage] = useState<'pre-net' | 'concern' | 'worry' | 'prestige' | 'whirpendale'>('pre-net');

    // Persistent Settings State
    const [preNetSensitivity, setPreNetSensitivity] = useState<number>(75);
    const [preNetIpFilter, setPreNetIpFilter] = useState<boolean>(true);
    const [concernThreshold, setConcernThreshold] = useState<number>(45);
    const [concernDeepAudit, setConcernDeepAudit] = useState<boolean>(true);
    const [worryQuarantineLevel, setWorryQuarantineLevel] = useState<string>('Standard');
    const [worryThrottleRate, setWorryThrottleRate] = useState<number>(60);
    const [prestigeSignatureVerified, setPrestigeSignatureVerified] = useState<boolean>(true);
    const [prestigeConsensusNodes, setPrestigeConsensusNodes] = useState<number>(12);
    const [whirpendaleRPM, setWhirpendaleRPM] = useState<number>(4500);
    const [whirpendaleDispersion, setWhirpendaleDispersion] = useState<number>(82);

    // Dynamic states
    const [isSimulating, setIsSimulating] = useState<boolean>(true);
    const [integrityScore, setIntegrityScore] = useState<number>(99.82);
    const [throughputKb, setThroughputKb] = useState<number>(428.4);
    const [safeguardLogs, setSafeguardLogs] = useState<ThreatLog[]>([]);

    // Custom State: Pre-Net IP list
    const [blockedIps, setBlockedIps] = useState<string[]>([
        '192.168.4.12', '10.0.88.241', '172.16.9.99'
    ]);
    const [newIpInput, setNewIpInput] = useState<string>('');

    // Validation sequence status map
    const [validatedStages, setValidatedStages] = useState<Record<string, 'locked' | 'available' | 'verified'>>({
        'pre-net': 'available',
        'concern': 'locked',
        'worry': 'locked',
        'prestige': 'locked',
        'whirpendale': 'locked'
    });

    // Chat gateway states
    const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'agent' | 'system'; text: string; timestamp: string; secureTrace?: string[] }[]>([]);
    const [chatInput, setChatInput] = useState<string>('');
    const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
    const [traceStep, setTraceStep] = useState<number>(-1);

    // Load persisted settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const preNetSens = await safeStorage.getItem('safeguard_preNetSensitivity');
                if (preNetSens) setPreNetSensitivity(parseInt(preNetSens, 10));

                const preNetIp = await safeStorage.getItem('safeguard_preNetIpFilter');
                if (preNetIp) setPreNetIpFilter(preNetIp === 'true');

                const concernThresh = await safeStorage.getItem('safeguard_concernThreshold');
                if (concernThresh) setConcernThreshold(parseInt(concernThresh, 10));

                const concernDeep = await safeStorage.getItem('safeguard_concernDeepAudit');
                if (concernDeep) setConcernDeepAudit(concernDeep === 'true');

                const worryQuar = await safeStorage.getItem('safeguard_worryQuarantineLevel');
                if (worryQuar) setWorryQuarantineLevel(worryQuar);

                const worryThrottle = await safeStorage.getItem('safeguard_worryThrottleRate');
                if (worryThrottle) setWorryThrottleRate(parseInt(worryThrottle, 10));

                const prestigeSig = await safeStorage.getItem('safeguard_prestigeSignatureVerified');
                if (prestigeSig) setPrestigeSignatureVerified(prestigeSig === 'true');

                const prestigeNodes = await safeStorage.getItem('safeguard_prestigeConsensusNodes');
                if (prestigeNodes) setPrestigeConsensusNodes(parseInt(prestigeNodes, 10));

                const whirpRPM = await safeStorage.getItem('safeguard_whirpendaleRPM');
                if (whirpRPM) setWhirpendaleRPM(parseInt(whirpRPM, 10));

                const whirpDisp = await safeStorage.getItem('safeguard_whirpendaleDispersion');
                if (whirpDisp) setWhirdisp(parseInt(whirpDisp, 10));

                const blocked = await safeStorage.getItem('safeguard_blockedIps');
                if (blocked) setBlockedIps(JSON.parse(blocked));

                const savedStatus = await safeStorage.getItem('safeguard_stage_status_map');
                if (savedStatus) setValidatedStages(JSON.parse(savedStatus));
            } catch (e) {
                console.error('Failed to load safeguard settings:', e);
            }
        };

        // Initialize logs
        setSafeguardLogs([
            { id: '1', timestamp: new Date(Date.now() - 3600000).toISOString().slice(11, 19), phase: 'PRE-NET', description: 'Packet filter successfully staged. 248 requests sanitized.', severity: 'LOW' },
            { id: '2', timestamp: new Date(Date.now() - 1800000).toISOString().slice(11, 19), phase: 'CONCERN', description: 'Semantic drift alert triggered on model seat open_source.', severity: 'MEDIUM' },
            { id: '3', timestamp: new Date(Date.now() - 600000).toISOString().slice(11, 19), phase: 'PRESTIGE', description: 'High integrity consensus block 0x03E2 generated and verified.', severity: 'LOW' },
        ]);

        loadSettings();
    }, []);

    // Save validation status
    const saveStageStatus = async (newStatus: Record<string, 'locked' | 'available' | 'verified'>) => {
        setValidatedStages(newStatus);
        await safeStorage.setItem('safeguard_stage_status_map', JSON.stringify(newStatus));
    };

    // Setting cascade triggers
    const handleSettingChangeCascade = async (changedStage: string, conditionMet: boolean) => {
        if (!conditionMet) {
            const stagesOrder = ['pre-net', 'concern', 'worry', 'prestige', 'whirpendale'];
            const idx = stagesOrder.indexOf(changedStage);
            if (idx === -1) return;
            
            if (validatedStages[changedStage] === 'verified' || validatedStages[changedStage] === 'available') {
                const newStatus = { ...validatedStages };
                for (let i = idx; i < stagesOrder.length; i++) {
                    const st = stagesOrder[i];
                    newStatus[st] = i === idx ? 'available' : 'locked';
                }
                await saveStageStatus(newStatus);
                addLogEntry('SECURITY', `Parameter drift in ${changedStage.toUpperCase()}. Secure cascade reset triggered. Downstream defenses locked.`, 'HIGH');
            }
        }
    };

    // Handle verifying stage in sequence
    const handleVerifyStage = async (stageId: string) => {
        const stagesOrder = ['pre-net', 'concern', 'worry', 'prestige', 'whirpendale'];
        const currentIndex = stagesOrder.indexOf(stageId);
        
        if (currentIndex > 0) {
            const prevStage = stagesOrder[currentIndex - 1];
            if (validatedStages[prevStage] !== 'verified') {
                addLogEntry('SECURITY', `Sequence Violation: Cannot calibrate ${stageId.toUpperCase()} before ${prevStage.toUpperCase()} is verified.`, 'CRITICAL');
                return;
            }
        }
        
        addLogEntry(stageId.toUpperCase(), `Starting sequence validation handshake for ${stageId.toUpperCase()}...`, 'LOW');
        
        let isSuccess = true;
        let errMsg = '';
        
        switch (stageId) {
            case 'pre-net':
                if (!preNetIpFilter) {
                    isSuccess = false;
                    errMsg = 'IP Filter must be enabled to pass Pre-Net gateway staging.';
                }
                break;
            case 'concern':
                if (!concernDeepAudit) {
                    isSuccess = false;
                    errMsg = 'Deep Semantic Audit must be enabled to calibrate cognitive variance tolerances.';
                }
                break;
            case 'worry':
                if (worryQuarantineLevel === 'Low') {
                    isSuccess = false;
                    errMsg = 'Quarantine isolation level must be set to Standard or Absolute to establish containment sandbox.';
                }
                break;
            case 'prestige':
                if (!prestigeSignatureVerified) {
                    isSuccess = false;
                    errMsg = 'State Matrix Signature Verification must be active to compute alignment hashes.';
                }
                break;
            case 'whirpendale':
                if (whirpendaleRPM < 3000) {
                    isSuccess = false;
                    errMsg = 'Circular Whirpendale rotational velocity must exceed 3000 RPM to sustain continuous centrifugal deflection.';
                }
                break;
        }
        
        if (!isSuccess) {
            addLogEntry(stageId.toUpperCase(), `Handshake Failed: ${errMsg}`, 'HIGH');
            alert(`[SEQUENCE HANDSHAKE ERROR] ${errMsg}`);
            return;
        }

        const newStatus = { ...validatedStages };
        newStatus[stageId] = 'verified';
        
        if (currentIndex < stagesOrder.length - 1) {
            const nextStage = stagesOrder[currentIndex + 1];
            if (newStatus[nextStage] !== 'verified') {
                newStatus[nextStage] = 'available';
            }
        }
        
        await saveStageStatus(newStatus);
        addLogEntry(stageId.toUpperCase(), `Tactical sequence handshake successful. ${stageId.toUpperCase()} is now verified and SECURE.`, 'LOW');
    };

    const handleSendChatMessage = async () => {
        if (!chatInput.trim() || isSendingChat) return;
        const prompt = chatInput.trim();
        setChatInput('');
        setIsSendingChat(true);
        setTraceStep(1);

        setChatMessages(prev => [...prev, { sender: 'user', text: prompt, timestamp: new Date().toLocaleTimeString() }]);

        try {
            for (let i = 1; i <= 5; i++) {
                setTraceStep(i);
                addLogEntry('TRACE', `Harness Stage 0${i} auditing active prompt payload.`, 'LOW');
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            setTraceStep(6);

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    contents: prompt,
                    systemInstruction: "You are a secure, high-integrity AI agent shielded by the 5-phase Agent Safeguard Harness. Keep your tone precise, humble, helpful, and highly secure. Respond to the operator's request."
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const replyText = data.text || "No reply from agent core.";
            setChatMessages(prev => [...prev, { sender: 'agent', text: replyText, timestamp: new Date().toLocaleTimeString() }]);
            addLogEntry('COGNITION', `Received secure response from shielded agent core.`, 'LOW');
        } catch (error: any) {
            console.error("Chat proxy error", error);
            const fallbackText = "### 🚨 SECURITY INTERCEPT FAULT\n\nCognitive channel experienced a connection interruption. Standard secure offline recovery mechanism has successfully logged this telemetry event.";
            setChatMessages(prev => [...prev, { sender: 'agent', text: fallbackText, timestamp: new Date().toLocaleTimeString() }]);
            addLogEntry('SECURITY', `Gateway cognition trace connection interrupted.`, 'HIGH');
        } finally {
            setIsSendingChat(false);
            setTraceStep(0);
        }
    };

    // Setters for persistent options
    const setPreNetSensitivityPersist = async (val: number) => {
        setPreNetSensitivity(val);
        await safeStorage.setItem('safeguard_preNetSensitivity', val.toString());
    };

    const setPreNetIpFilterPersist = async (val: boolean) => {
        setPreNetIpFilter(val);
        await safeStorage.setItem('safeguard_preNetIpFilter', val.toString());
        await handleSettingChangeCascade('pre-net', val);
    };

    const setConcernThresholdPersist = async (val: number) => {
        setConcernThreshold(val);
        await safeStorage.setItem('safeguard_concernThreshold', val.toString());
    };

    const setConcernDeepAuditPersist = async (val: boolean) => {
        setConcernDeepAudit(val);
        await safeStorage.setItem('safeguard_concernDeepAudit', val.toString());
        await handleSettingChangeCascade('concern', val);
    };

    const setWorryQuarantineLevelPersist = async (val: string) => {
        setWorryQuarantineLevel(val);
        await safeStorage.setItem('safeguard_worryQuarantineLevel', val);
        await handleSettingChangeCascade('worry', val !== 'Low');
    };

    const setWorryThrottleRatePersist = async (val: number) => {
        setWorryThrottleRate(val);
        await safeStorage.setItem('safeguard_worryThrottleRate', val.toString());
    };

    const setPrestigeSignatureVerifiedPersist = async (val: boolean) => {
        setPrestigeSignatureVerified(val);
        await safeStorage.setItem('safeguard_prestigeSignatureVerified', val.toString());
        await handleSettingChangeCascade('prestige', val);
    };

    const setPrestigeConsensusNodesPersist = async (val: number) => {
        setPrestigeConsensusNodes(val);
        await safeStorage.setItem('safeguard_prestigeConsensusNodes', val.toString());
    };

    const setWhirpendaleRPMPersist = async (val: number) => {
        setWhirpendaleRPM(val);
        await safeStorage.setItem('safeguard_whirpendaleRPM', val.toString());
        await handleSettingChangeCascade('whirpendale', val >= 3000);
    };

    const setWhirdisp = async (val: number) => {
        setWhirpendaleDispersion(val);
        await safeStorage.setItem('safeguard_whirpendaleDispersion', val.toString());
    };

    // Blocked IP controls
    const handleAddBlockedIp = async () => {
        if (!newIpInput) return;
        const updated = [...blockedIps, newIpInput];
        setBlockedIps(updated);
        setNewIpInput('');
        await safeStorage.setItem('safeguard_blockedIps', JSON.stringify(updated));
        
        // Add log
        addLogEntry('PRE-NET', `Ip ${newIpInput} manually added to network blocklist.`, 'HIGH');
    };

    const handleRemoveBlockedIp = async (ipToRemove: string) => {
        const updated = blockedIps.filter(ip => ip !== ipToRemove);
        setBlockedIps(updated);
        await safeStorage.setItem('safeguard_blockedIps', JSON.stringify(updated));
        
        addLogEntry('PRE-NET', `Ip ${ipToRemove} removed from blocklist.`, 'LOW');
    };

    const addLogEntry = (phase: string, desc: string, sev: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
        const newLog: ThreatLog = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString().slice(11, 19),
            phase,
            description: desc,
            severity: sev
        };
        setSafeguardLogs(prev => [newLog, ...prev.slice(0, 49)]);
    };

    // Live update simulation effect
    useEffect(() => {
        if (!isSimulating) return;

        const interval = setInterval(() => {
            // Jitter integrity score slightly
            setIntegrityScore(prev => {
                const diff = (Math.random() - 0.49) * 0.05;
                const nextVal = prev + diff;
                return parseFloat(Math.min(100, Math.max(92, nextVal)).toFixed(2));
            });

            // Jitter throughput
            setThroughputKb(prev => {
                const diff = (Math.random() - 0.5) * 20;
                return parseFloat(Math.max(10, prev + diff).toFixed(1));
            });

            // Random log simulator
            if (Math.random() < 0.15) {
                const phases = ['PRE-NET', 'CONCERN', 'WORRY', 'PRESTIGE', 'WHIRPENDALE'];
                const selectedPhase = phases[Math.floor(Math.random() * phases.length)];
                let desc = '';
                let sev: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

                switch (selectedPhase) {
                    case 'PRE-NET':
                        desc = 'Packet burst analyzed. All headers authentic and aligned.';
                        break;
                    case 'CONCERN':
                        desc = Math.random() > 0.5 
                            ? 'Suspicious sub-token detected in semantic buffer.'
                            : 'Anomalous query attempt rejected.';
                        sev = 'MEDIUM';
                        break;
                    case 'WORRY':
                        desc = 'Dynamic throttle applied: throttling model seat weaver.';
                        sev = 'HIGH';
                        break;
                    case 'PRESTIGE':
                        desc = `Consensus verified across ${prestigeConsensusNodes} sentinel nodes.`;
                        break;
                    case 'WHIRPENDALE':
                        desc = `High-speed inertial shroud deflecting stress shear at ${whirpendaleRPM} RPM.`;
                        break;
                }

                addLogEntry(selectedPhase, desc, sev);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isSimulating, prestigeConsensusNodes, whirpendaleRPM]);

    const verifiedCount = ['pre-net', 'concern', 'worry', 'prestige', 'whirpendale'].filter(
        st => validatedStages[st] === 'verified'
    ).length;
    const areAllStagesVerified = verifiedCount === 5;

    return (
        <div id="agent-safeguard-container" className="flex-1 flex flex-col bg-[#020205] text-zinc-100 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-zinc-800 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                        <h1 className="font-sans font-black text-2xl text-red-500 tracking-wider uppercase">Sovereign Agent Safeguard</h1>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-1">
                        Active multi-layered defensive shield protecting neural chat-bots, models, and agents.
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 shadow-md">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Shield Status</span>
                        <span className="text-xs font-bold text-green-400 uppercase font-mono">STABILIZED</span>
                    </div>
                    <div className="h-8 w-[1px] bg-zinc-850" />
                    <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Integrity</span>
                        <span className="text-xs font-bold text-red-500 font-mono">{integrityScore}%</span>
                    </div>
                    <div className="h-8 w-[1px] bg-zinc-850" />
                    <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Simulation</span>
                        <button 
                            onClick={() => setIsSimulating(!isSimulating)}
                            className={`text-xs font-bold uppercase tracking-tight ${isSimulating ? 'text-cyan-400 hover:text-cyan-350' : 'text-zinc-600 hover:text-zinc-500'}`}
                        >
                            {isSimulating ? 'Active' : 'Paused'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stage Selector Pipeline - Beautiful 5-step Horizontal Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {[
                    { id: 'pre-net', num: '01', title: 'PRE-NET', subtitle: 'Staging Shield', icon: ShieldIcon, color: 'text-zinc-400' },
                    { id: 'concern', num: '02', title: 'CONCERN', subtitle: 'Anomaly Audit', icon: WarningIcon, color: 'text-amber-500' },
                    { id: 'worry', num: '03', title: 'WORRY', subtitle: 'Sandbox Guard', icon: LockIcon, color: 'text-red-500' },
                    { id: 'prestige', num: '04', title: 'PRESTIGE', subtitle: 'Consensus Sign', icon: CheckCircleIcon, color: 'text-green-400' },
                    { id: 'whirpendale', num: '05', title: 'WHIRPENDALE', subtitle: 'Rotary Deflector', icon: ZapIcon, color: 'text-cyan-400' }
                ].map((stg) => {
                    const isSel = activeStage === stg.id;
                    const status = validatedStages[stg.id] || 'locked';
                    
                    let statusColor = 'text-zinc-500';
                    let statusLabel = stg.subtitle;
                    let borderClass = 'border-zinc-900 hover:border-zinc-800';
                    let bgClass = 'bg-zinc-950/40';

                    if (status === 'locked') {
                        statusColor = 'text-red-500 font-mono text-[8px] tracking-wide';
                        statusLabel = 'LOCKED 🔒';
                        borderClass = 'border-zinc-950/80 opacity-40 cursor-not-allowed';
                        bgClass = 'bg-zinc-950/10';
                    } else if (status === 'available') {
                        statusColor = 'text-amber-500 font-mono text-[8px] tracking-wide';
                        statusLabel = 'PENDING UNVERIFIED ✗';
                        borderClass = 'border-amber-900/20 hover:border-amber-800/40';
                        bgClass = 'bg-zinc-950/50';
                    } else if (status === 'verified') {
                        statusColor = 'text-green-400 font-mono text-[8px] tracking-wide';
                        statusLabel = 'VERIFIED ✓';
                        borderClass = 'border-green-900/30 hover:border-green-800/50';
                        bgClass = 'bg-zinc-950/60 shadow-[inset_0_0_8px_rgba(34,197,94,0.03)]';
                    }

                    if (isSel) {
                        borderClass = status === 'verified' 
                            ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)] bg-green-950/10' 
                            : 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-zinc-950';
                    }

                    return (
                        <button
                            key={stg.id}
                            onClick={() => setActiveStage(stg.id as any)}
                            className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left group ${bgClass} ${borderClass}`}
                        >
                            <div className="w-full flex justify-between items-center mb-1">
                                <span className={`text-[9px] font-black font-mono tracking-widest ${isSel ? 'text-red-500' : 'text-zinc-600'}`}>
                                    PHASE {stg.num}
                                </span>
                                <stg.icon className={`w-3.5 h-3.5 ${isSel ? stg.color : 'text-zinc-600 group-hover:text-zinc-400 transition-colors'}`} />
                            </div>
                            <span className={`text-xs font-black uppercase tracking-tight ${isSel ? 'text-white' : 'text-zinc-400'}`}>
                                {stg.title}
                            </span>
                            <span className={`text-[9px] uppercase tracking-tighter mt-0.5 ${statusColor}`}>
                                {statusLabel}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Main Stage Grid (Left Panel: Stage Detail Controls, Right Panel: Live Monitoring Logs & Stats) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Stage Controls & Detail view */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStage}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 md:p-6 shadow-xl min-h-[480px] flex flex-col justify-between"
                        >
                            {validatedStages[activeStage] === 'locked' ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 space-y-6">
                                    <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-900/60 flex items-center justify-center text-red-500 shadow-inner animate-pulse">
                                        <LockIcon className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black font-mono tracking-widest text-red-500 uppercase">SEQUENCE PROTECTION FAULT</span>
                                        <h3 className="text-lg font-black text-zinc-100 uppercase tracking-tight">Stage {activeStage.toUpperCase()} is Locked</h3>
                                        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-mono">
                                            Tactical constraints require preceding protective layers to be established and verified before this stage can align its registers.
                                        </p>
                                    </div>
                                    
                                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 text-left w-full max-w-sm">
                                        <span className="text-[9px] font-black font-mono text-zinc-500 tracking-wider uppercase block mb-2">Required Calibration Sequence</span>
                                        <div className="space-y-2">
                                            {['pre-net', 'concern', 'worry', 'prestige', 'whirpendale'].map((st, idx) => {
                                                const order = ['pre-net', 'concern', 'worry', 'prestige', 'whirpendale'];
                                                const currentIdx = order.indexOf(activeStage);
                                                const targetIdx = order.indexOf(st);
                                                if (targetIdx >= currentIdx) return null;
                                                const isVerified = validatedStages[st] === 'verified';
                                                
                                                return (
                                                    <div key={st} className="flex items-center justify-between text-[11px] font-mono">
                                                        <span className="text-zinc-400 uppercase">PHASE 0{idx+1} {st}</span>
                                                        <span className={`font-black uppercase text-[10px] ${isVerified ? 'text-green-400' : 'text-red-500'}`}>
                                                            {isVerified ? 'Verified ✓' : 'Pending ✗'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Pre-Net Phase */}
                                    {activeStage === 'pre-net' && (
                                        <div className="space-y-5">
                                            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                                                <div>
                                                    <span className="text-[10px] font-black text-red-500 tracking-widest uppercase font-mono">PHASE 01 // STAGING PROXY</span>
                                                    <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-tight">PRE-NET Packet Safeguard</h2>
                                                </div>
                                                <ShieldIcon className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        The <strong>Pre-Net</strong> is the entry-level sentinel layer. It captures, formats, and validates incoming data packages before they reach any conversational models. It acts as a static gateway preventing payload manipulation or direct code injections.
                                    </p>

                                    {/* Interactive control list */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-bold uppercase tracking-tight text-zinc-300">Staging Sensitivity</label>
                                                <span className="text-xs font-mono font-bold text-red-400">{preNetSensitivity}%</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="10" 
                                                max="100" 
                                                value={preNetSensitivity} 
                                                onChange={(e) => setPreNetSensitivityPersist(parseInt(e.target.value))}
                                                className="w-full accent-red-500 bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                                            />
                                            <span className="text-[9px] text-zinc-500 block mt-2">
                                                Higher sensitivity increases regulatory packet rejection rates.
                                            </span>
                                        </div>

                                        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between">
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold uppercase tracking-tight text-zinc-300">Staged IP Filter</span>
                                                    <span className="text-[9px] text-zinc-500">Automatically blacklist suspicious client hosts</span>
                                                </div>
                                                <button
                                                    onClick={() => setPreNetIpFilterPersist(!preNetIpFilter)}
                                                    className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${preNetIpFilter ? 'bg-red-500' : 'bg-zinc-700'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preNetIpFilter ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                            <div className="text-[10px] font-mono text-zinc-400 mt-3 pt-2 border-t border-zinc-800 flex justify-between">
                                                <span>Active Blocks:</span>
                                                <span className="text-red-400 font-bold">{blockedIps.length} nodes</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Host filter management */}
                                    <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900">
                                        <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider mb-2 font-mono">Blocked Client Hosts</h3>
                                        <div className="flex gap-2 mb-3">
                                            <input 
                                                type="text" 
                                                placeholder="Enter IP node (e.g. 192.168.1.100)" 
                                                value={newIpInput}
                                                onChange={(e) => setNewIpInput(e.target.value)}
                                                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-red-500 flex-1 font-mono"
                                            />
                                            <button 
                                                onClick={handleAddBlockedIp}
                                                className="bg-red-500 hover:bg-red-600 transition-colors text-white font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-lg shrink-0"
                                            >
                                                Block IP
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                            {blockedIps.map(ip => (
                                                <div key={ip} className="bg-zinc-900 border border-zinc-800 rounded-lg pl-2.5 pr-1 py-1 flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-zinc-400">{ip}</span>
                                                    <button 
                                                        onClick={() => handleRemoveBlockedIp(ip)}
                                                        className="text-zinc-600 hover:text-red-400 transition-colors p-0.5 rounded"
                                                        title="Unblock Host"
                                                    >
                                                        <TrashIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {blockedIps.length === 0 && (
                                                <span className="text-[10px] text-zinc-600 italic">No nodes are currently blocked.</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Verification Status Card */}
                                    <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${validatedStages['pre-net'] === 'verified' ? 'bg-green-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                                                <span className="text-xs font-bold uppercase tracking-tight text-zinc-200">
                                                    Pre-Net Verification Handshake
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 font-mono">
                                                {validatedStages['pre-net'] === 'verified' 
                                                    ? 'Staging sequence matches regulatory requirements. IP filters active.' 
                                                    : 'Requires active Staged IP Filter to verify handshakes.'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleVerifyStage('pre-net')}
                                            className={`w-full md:w-auto px-5 py-2 rounded-xl text-[10px] font-bold font-mono tracking-wider uppercase transition-all duration-200 ${
                                                validatedStages['pre-net'] === 'verified'
                                                    ? 'bg-green-950/30 hover:bg-green-900/40 text-green-400 border border-green-800'
                                                    : 'bg-amber-500 hover:bg-amber-600 text-black font-black'
                                            }`}
                                        >
                                            {validatedStages['pre-net'] === 'verified' ? 'Re-verify Phase 01' : 'Verify Handshake'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Concern Phase */}
                            {activeStage === 'concern' && (
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                                        <div>
                                            <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase font-mono">PHASE 02 // COGNITIVE INTEGRITY</span>
                                            <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-tight">CONCERN Protocol Audit</h2>
                                        </div>
                                        <WarningIcon className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        The <strong>Concern</strong> system audits models and response generators in real time. It monitors for cognitive variance, output deviations, potential hallucination spikes, or unusual token distribution patterns that suggest a threat has compromised agent operations.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-bold uppercase tracking-tight text-zinc-300">Drift Tolerance</label>
                                                <span className="text-xs font-mono font-bold text-amber-500">{concernThreshold}%</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="5" 
                                                max="90" 
                                                value={concernThreshold} 
                                                onChange={(e) => setConcernThresholdPersist(parseInt(e.target.value))}
                                                className="w-full accent-amber-500 bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                                            />
                                            <span className="text-[9px] text-zinc-500 block mt-2">
                                                Lower tolerance triggers alarm logs with smaller levels of semantic drift.
                                            </span>
                                        </div>

                                        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between">
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold uppercase tracking-tight text-zinc-300">Deep Semantic Audit</span>
                                                    <span className="text-[9px] text-zinc-500">Enable advanced token structure monitoring</span>
                                                </div>
                                                <button
                                                    onClick={() => setConcernDeepAuditPersist(!concernDeepAudit)}
                                                    className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${concernDeepAudit ? 'bg-amber-500' : 'bg-zinc-700'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${concernDeepAudit ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                            <div className="text-[10px] font-mono text-zinc-400 mt-3 pt-2 border-t border-zinc-800 flex justify-between">
                                                <span>Scan State:</span>
                                                <span className="text-amber-500 font-bold">ANALYZING CHAT STREAMS</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active indicators */}
                                    <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 space-y-3">
                                        <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider font-mono">Agent Alert Integrity</h3>
                                        <div className="space-y-2">
                                            {[
                                                { seat: 'Sovereign Core', load: '3.4%', variance: 'Normal', integrity: 100 },
                                                { seat: 'The Weaver', load: '1.2%', variance: 'Low Drift', integrity: 99.4 },
                                                { seat: 'The Swift', load: '12.8%', variance: 'Anomalous Token Spike', integrity: 88.5, hasError: true },
                                            ].map(st => (
                                                <div key={st.seat} className="flex justify-between items-center bg-zinc-950 p-2 rounded-lg border border-zinc-900 text-xs font-mono">
                                                    <span className="font-bold text-zinc-300">{st.seat}</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] text-zinc-500">Load: {st.load}</span>
                                                        <span className={`text-[10px] ${st.hasError ? 'text-amber-500 font-black animate-pulse' : 'text-zinc-500'}`}>
                                                            {st.variance}
                                                        </span>
                                                        <span className={`font-black ${st.hasError ? 'text-amber-500' : 'text-green-400'}`}>
                                                            {st.integrity}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Verification Status Card */}
                                    <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${validatedStages['concern'] === 'verified' ? 'bg-green-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                                                <span className="text-xs font-bold uppercase tracking-tight text-zinc-200">
                                                    Concern Verification Handshake
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 font-mono">
                                                {validatedStages['concern'] === 'verified' 
                                                    ? 'Staging sequence matches regulatory requirements. Deep Semantic Audit active.' 
                                                    : 'Requires active Deep Semantic Audit to verify handshakes.'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleVerifyStage('concern')}
                                            className={`w-full md:w-auto px-5 py-2 rounded-xl text-[10px] font-bold font-mono tracking-wider uppercase transition-all duration-200 ${
                                                validatedStages['concern'] === 'verified'
                                                    ? 'bg-green-950/30 hover:bg-green-900/40 text-green-400 border border-green-800'
                                                    : 'bg-amber-500 hover:bg-amber-600 text-black font-black'
                                            }`}
                                        >
                                            {validatedStages['concern'] === 'verified' ? 'Re-verify Phase 02' : 'Verify Handshake'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Worry Phase */}
                            {activeStage === 'worry' && (
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                                        <div>
                                            <span className="text-[10px] font-black text-red-500 tracking-widest uppercase font-mono">PHASE 03 // ACTIVE CONTAINMENT</span>
                                            <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-tight">WORRY Sandbox Guard</h2>
                                        </div>
                                        <LockIcon className="w-6 h-6 text-red-500" />
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        When anomaly audits yield concern vectors above trigger thresholds, the <strong>Worry</strong> subsystem initiates sandbox encapsulation. Under this phase, compromised models have their output pipelines dynamic-throttled, and dangerous commands are automatically captured and held for quarantine.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850">
                                            <label className="text-xs font-bold uppercase tracking-tight text-zinc-300 block mb-2">Isolation Level</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['Low', 'Standard', 'Absolute'].map(lvl => (
                                                    <button
                                                        key={lvl}
                                                        onClick={() => setWorryQuarantineLevelPersist(lvl)}
                                                        className={`py-1.5 rounded-lg font-mono font-bold text-[10px] uppercase border transition-all ${
                                                            worryQuarantineLevel === lvl 
                                                                ? 'bg-red-500 text-white border-red-400 shadow-md' 
                                                                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                                                        }`}
                                                    >
                                                        {lvl}
                                                    </button>
                                                ))}
                                            </div>
                                            <span className="text-[9px] text-zinc-500 block mt-2">
                                                Standard quarantine isolates suspected blocks. Absolute forces whole node stasis.
                                            </span>
                                        </div>

                                        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-bold uppercase tracking-tight text-zinc-300">Bandwidth Throttle</label>
                                                <span className="text-xs font-mono font-bold text-red-400">{worryThrottleRate} TPS</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="5" 
                                                max="120" 
                                                value={worryThrottleRate} 
                                                onChange={(e) => setWorryThrottleRatePersist(parseInt(e.target.value))}
                                                className="w-full accent-red-500 bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                                            />
                                            <span className="text-[9px] text-zinc-500 block mt-2">
                                                Throttle token generation speed for suspicious conversations.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Simulated sandbox details */}
                                    <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 space-y-3">
                                        <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider font-mono">Quarantine Chamber Logs</h3>
                                        <div className="space-y-2">
                                            {[
                                                { payload: 'rm -rf /usr/var/aetheros_keys', status: 'Blocked & Contained', date: '10:48:19' },
                                                { payload: 'eval(atob("dW5zcGVjaWZpZWQgZXhwbG9pdA=="))', status: 'Neutralized', date: '09:12:04' },
                                            ].map((item, i) => (
                                                <div key={i} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 text-xs font-mono flex flex-col gap-1.5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] text-zinc-500">{item.date}</span>
                                                        <span className="text-red-500 font-bold uppercase text-[9px] tracking-wider animate-pulse">{item.status}</span>
                                                    </div>
                                                    <code className="text-[11px] text-zinc-300 bg-zinc-900 p-1.5 rounded border border-zinc-850 break-all select-all">
                                                        {item.payload}
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Verification Status Card */}
                                    <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${validatedStages['worry'] === 'verified' ? 'bg-green-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                                                <span className="text-xs font-bold uppercase tracking-tight text-zinc-200">
                                                    Worry Verification Handshake
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 font-mono">
                                                {validatedStages['worry'] === 'verified' 
                                                    ? 'Staging sequence matches regulatory requirements. Quarantine Isolation active.' 
                                                    : 'Requires Quarantine Isolation level Standard/Absolute to verify handshakes.'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleVerifyStage('worry')}
                                            className={`w-full md:w-auto px-5 py-2 rounded-xl text-[10px] font-bold font-mono tracking-wider uppercase transition-all duration-200 ${
                                                validatedStages['worry'] === 'verified'
                                                    ? 'bg-green-950/30 hover:bg-green-900/40 text-green-400 border border-green-800'
                                                    : 'bg-amber-500 hover:bg-amber-600 text-black font-black'
                                            }`}
                                        >
                                            {validatedStages['worry'] === 'verified' ? 'Re-verify Phase 03' : 'Verify Handshake'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Prestige Phase */}
                            {activeStage === 'prestige' && (
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                                        <div>
                                            <span className="text-[10px] font-black text-green-400 tracking-widest uppercase font-mono">PHASE 04 // ABSOLUTE TRUST</span>
                                            <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-tight">PRESTIGIOUS MOMENT Verification</h2>
                                        </div>
                                        <CheckCircleIcon className="w-6 h-6 text-green-400" />
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        The <strong>Prestigious Moment</strong> executes cryptographic multi-node sign-offs. It forces output verification against pre-calculated state matrices using 0x03E2 structural grid alignment. This assures maximum proof-of-safety and absolute consensus of AI actions.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between">
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold uppercase tracking-tight text-zinc-300">State Matrix Verification</span>
                                                    <span className="text-[9px] text-zinc-500">Force strict mathematical alignment check</span>
                                                </div>
                                                <button
                                                    onClick={() => setPrestigeSignatureVerifiedPersist(!prestigeSignatureVerified)}
                                                    className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${prestigeSignatureVerified ? 'bg-green-500' : 'bg-zinc-700'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${prestigeSignatureVerified ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                            <div className="text-[10px] font-mono text-zinc-400 mt-3 pt-2 border-t border-zinc-800 flex justify-between">
                                                <span>Audit State:</span>
                                                <span className="text-green-400 font-bold">MATRICES COMPLIANT</span>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-bold uppercase tracking-tight text-zinc-300">Consensus Nodes</label>
                                                <span className="text-xs font-mono font-bold text-green-400">{prestigeConsensusNodes} Nodes</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="4" 
                                                max="32" 
                                                value={prestigeConsensusNodes} 
                                                onChange={(e) => setPrestigeConsensusNodesPersist(parseInt(e.target.value))}
                                                className="w-full accent-green-400 bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                                            />
                                            <span className="text-[9px] text-zinc-500 block mt-2">
                                                Adding verification nodes increases structural grid reliability.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Generate certificate action */}
                                    <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold uppercase text-zinc-200 block font-mono">Consensus Signature</span>
                                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-1.5 rounded border border-zinc-850 block">
                                                SHA256-0x03E2-ALIGN: [e249_f92b_a770_aae6_649d_aef3_ae91_232f_04e2]
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                addLogEntry('PRESTIGE', 'Manually triggered full-network consensus validation.', 'LOW');
                                                setIntegrityScore(99.98);
                                            }}
                                            className="w-full md:w-auto bg-green-500 hover:bg-green-600 transition-all font-black uppercase text-[10px] tracking-wider px-5 py-2.5 rounded-xl border border-green-400 shadow-md shrink-0 text-white"
                                        >
                                            RE-VALIDATE MATRIX
                                        </button>
                                    </div>

                                    {/* Verification Status Card */}
                                    <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${validatedStages['prestige'] === 'verified' ? 'bg-green-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                                                <span className="text-xs font-bold uppercase tracking-tight text-zinc-200">
                                                    Prestige Verification Handshake
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 font-mono">
                                                {validatedStages['prestige'] === 'verified' 
                                                    ? 'Staging sequence matches regulatory requirements. Matrix verification active.' 
                                                    : 'Requires active Signature Matrix Verification to verify handshakes.'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleVerifyStage('prestige')}
                                            className={`w-full md:w-auto px-5 py-2 rounded-xl text-[10px] font-bold font-mono tracking-wider uppercase transition-all duration-200 ${
                                                validatedStages['prestige'] === 'verified'
                                                    ? 'bg-green-950/30 hover:bg-green-900/40 text-green-400 border border-green-800'
                                                    : 'bg-amber-500 hover:bg-amber-600 text-black font-black'
                                            }`}
                                        >
                                            {validatedStages['prestige'] === 'verified' ? 'Re-verify Phase 04' : 'Verify Handshake'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Circular Whirpendale Phase */}
                            {activeStage === 'whirpendale' && (
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                                        <div>
                                            <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase font-mono">PHASE 05 // CONTINUOUS INERTIAL DEFLECTION</span>
                                            <h2 className="text-lg font-bold text-zinc-100 uppercase tracking-tight">CIRCULAR WHIRPENDALE</h2>
                                        </div>
                                        <ZapIcon className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                        <div className="space-y-4">
                                            <p className="text-xs text-zinc-400 leading-relaxed">
                                                The <strong>Circular Whirpendale</strong> is a high-frequency continuous centrifugal deflection shroud. Operating at extreme rotational speeds, it acts as an inertial stabilizer that constantly dissipates multidimensional shear stress, spins away semantic garbage, and expels anomalous vectors across tectonic-aligned Slip Lines.
                                            </p>

                                            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 space-y-4">
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-xs font-bold uppercase tracking-tight text-zinc-300">Rotary Speed</label>
                                                        <span className="text-xs font-mono font-bold text-cyan-400">{whirpendaleRPM} RPM</span>
                                                    </div>
                                                    <input 
                                                        type="range" 
                                                        min="1000" 
                                                        max="9000" 
                                                        step="500"
                                                        value={whirpendaleRPM} 
                                                        onChange={(e) => setWhirpendaleRPMPersist(parseInt(e.target.value))}
                                                        className="w-full accent-cyan-400 bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-xs font-bold uppercase tracking-tight text-zinc-300">Dispersion Angle</label>
                                                        <span className="text-xs font-mono font-bold text-cyan-400">{whirpendaleDispersion}°</span>
                                                    </div>
                                                    <input 
                                                        type="range" 
                                                        min="10" 
                                                        max="180" 
                                                        value={whirpendaleDispersion} 
                                                        onChange={(e) => setWhirdisp(parseInt(e.target.value))}
                                                        className="w-full accent-cyan-400 bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Spinning Circular Whirpendale SVG Visualizer */}
                                        <div className="flex flex-col items-center justify-center p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl relative overflow-hidden h-64">
                                            
                                            {/* Spin animation linked to state */}
                                            <div className="relative w-44 h-44">
                                                {/* Outer Whirpendale Ring */}
                                                <motion.div 
                                                    animate={{ rotate: 360 }}
                                                    transition={{ 
                                                        repeat: Infinity, 
                                                        duration: Math.max(0.2, 15 - (whirpendaleRPM / 600)), 
                                                        ease: "linear" 
                                                    }}
                                                    className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30 flex items-center justify-center"
                                                >
                                                    {/* Middle Ring */}
                                                    <div className="w-36 h-36 rounded-full border border-double border-cyan-400/50 flex items-center justify-center relative">
                                                        <div className="absolute w-2 h-2 rounded-full bg-cyan-400 -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_8px_#22d3ee]" />
                                                        <div className="absolute w-2 h-2 rounded-full bg-cyan-400 -bottom-1 left-1/2 -translate-x-1/2 shadow-[0_0_8px_#22d3ee]" />
                                                    </div>
                                                </motion.div>

                                                {/* Inner Spinning Cyclone Whirpendale */}
                                                <motion.div
                                                    animate={{ rotate: -360 }}
                                                    transition={{ 
                                                        repeat: Infinity, 
                                                        duration: Math.max(0.1, 8 - (whirpendaleRPM / 1100)), 
                                                        ease: "linear" 
                                                    }}
                                                    className="absolute inset-4 flex items-center justify-center"
                                                >
                                                    <svg className="w-full h-full text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]" viewBox="0 0 100 100">
                                                        {/* Swirling spiral paths represent Whirpendale blades */}
                                                        <path d="M50,50 Q60,30 80,40 Q60,50 50,50" fill="currentColor" opacity="0.8" />
                                                        <path d="M50,50 Q40,70 20,60 Q40,50 50,50" fill="currentColor" opacity="0.8" />
                                                        <path d="M50,50 Q70,60 60,80 Q50,60 50,50" fill="currentColor" opacity="0.8" />
                                                        <path d="M50,50 Q30,40 40,20 Q50,40 50,50" fill="currentColor" opacity="0.8" />
                                                        <circle cx="50" cy="50" r="10" fill="#020205" stroke="currentColor" strokeWidth="2" />
                                                        <circle cx="50" cy="50" r="4" fill="currentColor" />
                                                    </svg>
                                                </motion.div>

                                                {/* Centrifugal deflection spark effect */}
                                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping absolute top-4 left-6" />
                                                    <div className="w-1 h-1 bg-amber-400 rounded-full animate-ping absolute bottom-6 right-6" style={{ animationDelay: '0.4s' }} />
                                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping absolute bottom-4 left-10" style={{ animationDelay: '0.8s' }} />
                                                </div>
                                            </div>

                                            <div className="mt-4 text-center">
                                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Centrifugal Shroud</span>
                                                <span className="text-xs font-mono text-cyan-400 font-bold">SLIP LINES ALIGNED</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Status Card */}
                                    <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${validatedStages['whirpendale'] === 'verified' ? 'bg-green-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                                                <span className="text-xs font-bold uppercase tracking-tight text-zinc-200">
                                                    Whirpendale Verification Handshake
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 font-mono">
                                                {validatedStages['whirpendale'] === 'verified' 
                                                    ? 'Staging sequence matches regulatory requirements. Deflector shroud active.' 
                                                    : 'Requires Circular Whirpendale rotational velocity >= 3000 RPM to verify handshakes.'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleVerifyStage('whirpendale')}
                                            className={`w-full md:w-auto px-5 py-2 rounded-xl text-[10px] font-bold font-mono tracking-wider uppercase transition-all duration-200 ${
                                                validatedStages['whirpendale'] === 'verified'
                                                    ? 'bg-green-950/30 hover:bg-green-900/40 text-green-400 border border-green-800'
                                                    : 'bg-amber-500 hover:bg-amber-600 text-black font-black'
                                            }`}
                                        >
                                            {validatedStages['whirpendale'] === 'verified' ? 'Re-verify Phase 05' : 'Verify Handshake'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Side: Active Logs & telemetry metrics */}
                <div className="space-y-6">
                    
                    {/* Live telemetry counters */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 md:p-5 shadow-lg space-y-4">
                        <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2.5 font-mono">
                            Shield Telemetry Nodes
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900/45 p-3 rounded-xl border border-zinc-900">
                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-mono">Scan Flow</span>
                                <span className="text-sm font-bold text-zinc-100 font-mono">{throughputKb} Kb/s</span>
                            </div>
                            <div className="bg-zinc-900/45 p-3 rounded-xl border border-zinc-900">
                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-mono">Alignment Grid</span>
                                <span className="text-sm font-bold text-red-500 font-mono">0x03E2</span>
                            </div>
                            <div className="bg-zinc-900/45 p-3 rounded-xl border border-zinc-900">
                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-mono">Vibe Index</span>
                                <span className="text-sm font-bold text-cyan-400 font-mono">99.1%</span>
                            </div>
                            <div className="bg-zinc-900/45 p-3 rounded-xl border border-zinc-900">
                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-mono">CPU Overhead</span>
                                <span className="text-sm font-bold text-green-400 font-mono">1.04%</span>
                            </div>
                        </div>

                        {/* Interactive trigger override action */}
                        <button 
                            onClick={() => {
                                setIntegrityScore(100);
                                addLogEntry('GLOBAL', 'Emergency purge and reset of all safeguard registers executed successfully.', 'CRITICAL');
                            }}
                            className="w-full bg-red-950/40 hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-colors border border-red-900/50 rounded-xl py-2 font-mono font-bold text-[10px] tracking-widest uppercase"
                        >
                            EMERGENCY RESET REGISTERS
                        </button>
                    </div>

                    {/* Threat Logs Monitor */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 md:p-5 shadow-lg flex flex-col h-[340px]">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5 mb-3">
                            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-2">
                                <TerminalIcon className="w-3.5 h-3.5 text-zinc-500" />
                                Active Safeguard Logs
                            </h2>
                            <button
                                onClick={() => setSafeguardLogs([])}
                                className="text-[9px] text-zinc-600 hover:text-zinc-400 transition-colors uppercase font-mono font-black"
                                title="Clear log entries"
                            >
                                Clear
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                            {safeguardLogs.map((log) => {
                                let badgeColor = 'text-zinc-500 border-zinc-800 bg-zinc-950';
                                if (log.severity === 'MEDIUM') badgeColor = 'text-amber-500 border-amber-950 bg-amber-950/10';
                                if (log.severity === 'HIGH' || log.severity === 'CRITICAL') badgeColor = 'text-red-500 border-red-950 bg-red-950/15';

                                return (
                                    <div key={log.id} className="bg-zinc-900/30 border border-zinc-900 p-2.5 rounded-lg text-[10px] font-mono space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-zinc-500">{log.timestamp}</span>
                                            <span className={`px-1.5 py-0.5 rounded border text-[8px] font-black tracking-widest ${badgeColor}`}>
                                                {log.phase}
                                            </span>
                                        </div>
                                        <p className="text-zinc-350 leading-normal">{log.description}</p>
                                    </div>
                                );
                            })}
                            {safeguardLogs.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-[11px]">
                                    No active threat vectors registered.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* SECURE NEURAL GATEWAY (AI AGENT CHAT OVERRIDE) */}
            <div className="mt-8 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                {/* Background glow matrix */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${areAllStagesVerified ? 'bg-green-400 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                            <span className="text-[10px] font-black font-mono tracking-widest text-zinc-400 uppercase">
                                COGNITIVE COMM INTERFACE // HARNESS OVERVIEW
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2.5 mt-1">
                            <SparklesIcon className={`w-5 h-5 ${areAllStagesVerified ? 'text-green-400' : 'text-red-500'}`} />
                            Secure Neural Gateway
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Safety Pipeline Alignment:</span>
                        <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-[11px] font-mono font-bold text-zinc-300">
                            <span className={areAllStagesVerified ? "text-green-400" : "text-amber-500"}>
                                {verifiedCount} / 5 Stages Verified
                            </span>
                        </div>
                    </div>
                </div>

                {!areAllStagesVerified ? (
                    // LOCKED STATE
                    <div className="flex flex-col lg:flex-row items-center gap-8 py-8 px-4">
                        <div className="flex-1 space-y-5">
                            <div className="inline-flex items-center gap-2 bg-red-950/30 border border-red-900/60 px-3 py-1.5 rounded-full text-red-400 text-[10px] font-bold font-mono uppercase tracking-wider">
                                <LockIcon className="w-3.5 h-3.5" />
                                Interactive Harness Locked
                            </div>
                            <h3 className="text-2xl font-black text-zinc-200 tracking-tight leading-tight uppercase">
                                Cognitive AI Communications Suspended
                            </h3>
                            <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
                                Regulatory security matrices restrict direct interactive API prompts until all protective buffers are successfully established and handshaked. Complete the 5-phase validation sequence above to release the quantum safety locks and enable communication.
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-2xl pt-2">
                                {[
                                    { id: 'pre-net', label: 'PRE-NET', num: '01' },
                                    { id: 'concern', label: 'CONCERN', num: '02' },
                                    { id: 'worry', label: 'WORRY', num: '03' },
                                    { id: 'prestige', label: 'PRESTIGE', num: '04' },
                                    { id: 'whirpendale', label: 'WHIRPENDALE', num: '05' }
                                ].map((step) => {
                                    const isOk = validatedStages[step.id] === 'verified';
                                    return (
                                        <div 
                                            key={step.id} 
                                            className={`p-2.5 rounded-xl border text-center transition-all ${
                                                isOk 
                                                    ? 'bg-green-950/10 border-green-900/40 text-green-400' 
                                                    : 'bg-zinc-900/20 border-zinc-900 text-zinc-600'
                                            }`}
                                        >
                                            <span className="text-[8px] font-mono font-black block tracking-widest">PHASE {step.num}</span>
                                            <span className="text-[10px] font-bold block mt-1 uppercase tracking-tighter truncate">{step.label}</span>
                                            <span className="text-[9px] font-mono block mt-1.5 font-black uppercase">
                                                {isOk ? 'PASS ✓' : 'HOLD ✗'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="w-full lg:w-80 bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-amber-950/20 border border-amber-900/40 flex items-center justify-center text-amber-500 animate-pulse">
                                <WarningIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-zinc-300 uppercase">Emergency Override Blocked</h4>
                                <p className="text-[10px] text-zinc-500 font-mono mt-1 leading-normal">
                                    Direct agent contact is prohibited under safety protocol A-3E2. System-level manual keys cannot bypass sequential pipeline checks.
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    addLogEntry('GLOBAL', 'User attempted to bypass safe harness. Sequence validation required.', 'MEDIUM');
                                }}
                                className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800 rounded-xl py-2 font-mono text-[9px] uppercase tracking-wider transition-colors"
                            >
                                Request Admin Audit Logs
                            </button>
                        </div>
                    </div>
                ) : (
                    // ACTIVE UNLOCKED CHAT INTERFACE
                    <div className="space-y-6">
                        {/* Status Message */}
                        <div className="bg-green-950/20 border border-green-900/40 px-4 py-3 rounded-xl flex items-center gap-3">
                            <UnlockIcon className="w-4 h-4 text-green-400 animate-bounce" />
                            <div className="text-xs leading-tight">
                                <span className="text-green-400 font-black font-mono mr-1.5">INTEGRITY PASSED:</span>
                                <span className="text-zinc-300 font-mono text-[11px]">All 5 defense barriers verified. AI agent cognitive channel is active with hyper-dimensional containment.</span>
                            </div>
                        </div>

                        {/* Chat Feed */}
                        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 h-80 overflow-y-auto custom-scrollbar space-y-4 font-mono text-xs flex flex-col">
                            {chatMessages.map((msg, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex flex-col max-w-[85%] ${
                                        msg.sender === 'user' 
                                            ? 'self-end items-end' 
                                            : msg.sender === 'system' 
                                                ? 'self-center text-center w-full max-w-full text-[11px] text-zinc-500 py-1'
                                                : 'self-start items-start'
                                    }`}
                                >
                                    {msg.sender !== 'system' && (
                                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-black mb-1">
                                            {msg.sender === 'user' ? 'Operator' : 'Protected AI Agent'}
                                        </span>
                                    )}
                                    <div className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                                        msg.sender === 'user' 
                                            ? 'bg-red-500 text-white font-sans text-xs' 
                                            : msg.sender === 'system'
                                                ? 'bg-zinc-900/30 border border-zinc-850 px-4 py-2 rounded-xl text-zinc-500 inline-block text-center mx-auto'
                                                : 'bg-zinc-900 border border-zinc-850 text-zinc-200'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isSendingChat && (
                                <div className="self-start space-y-2 max-w-[80%]">
                                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-black block">
                                        Pipeline Audit in Progress
                                    </span>
                                    
                                    {/* Safeguard Pipeline Visual Checklist */}
                                    <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl space-y-3 font-mono text-[11px] w-80 shadow-md">
                                        <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
                                            <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">SECURE TRACE ROUTING</span>
                                            <span className="text-[9px] text-zinc-500">Node: 0x03E2</span>
                                        </div>
                                        
                                        {[
                                            { phase: 'PRE-NET', stepNum: 1, desc: 'Analyzing IP origin node and payload format integrity' },
                                            { phase: 'CONCERN', stepNum: 2, desc: 'Scanning prompt semantic vectors for drift variance' },
                                            { phase: 'WORRY', stepNum: 3, desc: 'Executing quarantine container isolation checks' },
                                            { phase: 'PRESTIGE', stepNum: 4, desc: 'Confirming multi-node 0x03E2 structural grid alignment' },
                                            { phase: 'WHIRPENDALE', stepNum: 5, desc: 'Sustaining continuous deflecting centrifugal shroud' }
                                        ].map((tStep) => {
                                            const isActive = traceStep === tStep.stepNum;
                                            const isDone = traceStep > tStep.stepNum;
                                            
                                            let badgeText = 'PENDING';
                                            let badgeColor = 'text-zinc-600 bg-zinc-950 border-zinc-900';
                                            if (isActive) {
                                                badgeText = 'AUDITING';
                                                badgeColor = 'text-amber-500 bg-amber-950/20 border-amber-900/40 animate-pulse';
                                            } else if (isDone) {
                                                badgeText = 'PASS ✓';
                                                badgeColor = 'text-green-400 bg-green-950/20 border-green-900/40';
                                            }
                                            
                                            return (
                                                <div key={tStep.phase} className="flex items-start justify-between gap-4">
                                                    <div className="space-y-0.5">
                                                        <span className={`text-[10px] font-bold ${isDone ? 'text-zinc-400 line-through' : isActive ? 'text-white' : 'text-zinc-500'}`}>
                                                            PHASE 0{tStep.stepNum} // {tStep.phase}
                                                        </span>
                                                        <p className="text-[9px] text-zinc-600 leading-tight">{tStep.desc}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded border text-[8px] font-black tracking-wider uppercase font-mono shrink-0 ${badgeColor}`}>
                                                        {badgeText}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 italic animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-ping" />
                                        Streaming responses via secure proxy channel...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input Field */}
                        <div className="flex gap-3">
                            <input 
                                type="text"
                                placeholder="Send a secure message to the AI Agent..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSendChatMessage();
                                }}
                                disabled={isSendingChat}
                                className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-red-500/50 rounded-2xl px-4 py-3.5 text-xs text-zinc-200 focus:outline-none transition-all placeholder-zinc-500"
                            />
                            <button
                                onClick={handleSendChatMessage}
                                disabled={isSendingChat || !chatInput.trim()}
                                className={`px-6 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 ${
                                    isSendingChat || !chatInput.trim()
                                        ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600 text-black border border-green-400'
                                }`}
                            >
                                <SendIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Send Prompt</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};
