
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    ShieldIcon, ZapIcon, FireIcon, ActivityIcon, SpinnerIcon, 
    TerminalIcon, LogicIcon, StarIcon, WarningIcon, LockIcon,
    SearchIcon, CheckCircleIcon, CodeIcon, GavelIcon, BrainIcon,
    HistoryIcon, UnlockIcon
} from './icons';
import type { ShieldTelemetry, ThreatShard, SystemIntegrityAudit, IntegrityVulnerability, MainView, NetworkProject } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useShieldReconciliation } from './useShieldReconciliation';
import { conductSystemIntegrityAudit } from '../services/geminiService';
import { ThreatVector3DGrid } from './ThreatVector3DGrid';
import { GridSegmentHeatmap } from './GridSegmentHeatmap';
import { GoogleMeetWarRoom } from './GoogleMeetWarRoom';
import { FloatingThreatHeatmap } from './FloatingThreatHeatmap';
import { ThreatNeutralizationLog } from './ThreatNeutralizationLog';
import { QuantumCoin3D } from './QuantumCoin3D';
import { generate1028BitKeyPair, encryptSovereignMessage, decryptSovereignMessage } from '../services/quantumCryptoService';

/**
 * SHIELD_MESH_SHADER: Renders a pulsing hexagonal grid representing the Sovereign Shield.
 */
const SHIELD_VS = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const SHIELD_FS = `
    precision mediump float;
    uniform float u_time;
    uniform float u_integrity;
    uniform vec2 u_resolution;

    float hex(vec2 p) {
        p.x *= 1.1547;
        float y = p.y + (floor(p.x) * 0.5);
        vec2 f = fract(vec2(p.x, y));
        if (f.x > 0.5) f.x = 1.0 - f.x;
        if (f.y > 0.5) f.y = 1.0 - f.y;
        return min(f.x, f.y);
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        uv *= 5.0; // Grid scale
        
        float h = hex(uv + u_time * 0.1);
        float pulse = sin(u_time * 2.0) * 0.1 + 0.9;
        
        // Shield ripple effect based on integrity
        float ripple = sin(length(uv) * 2.0 - u_time * 5.0) * 0.5 + 0.5;
        float mask = smoothstep(0.0, 0.05, h);
        
        vec3 color = mix(vec3(0.0, 0.3, 0.7), vec3(0.0, 0.8, 1.0), ripple);
        if (u_integrity < 50.0) {
            color = mix(color, vec3(0.9, 0.1, 0.0), (50.0 - u_integrity) / 50.0);
        }
        
        gl_FragColor = vec4(color * mask * pulse, mask * 0.6);
    }
`;

const ShieldVisualization: React.FC<{ integrity: number }> = ({ integrity }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const [webGlSupported, setWebGlSupported] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        try {
            const glCtx = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
            if (!glCtx) {
                setWebGlSupported(false);
                return;
            }
            const gl = glCtx;
            glRef.current = gl;

            const createShader = (type: number, source: string) => {
                const shader = gl.createShader(type);
                if (!shader) throw new Error("Shader creation failed");
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    throw new Error("Shader compile failed: " + gl.getShaderInfoLog(shader));
                }
                return shader;
            };

            const vs = createShader(gl.VERTEX_SHADER, SHIELD_VS);
            const fs = createShader(gl.FRAGMENT_SHADER, SHIELD_FS);
            const program = gl.createProgram()!;
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                throw new Error("Program link failed");
            }
            programRef.current = program;

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

            let animationFrame: number;
            const render = (time: number) => {
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.useProgram(program);

                const posLoc = gl.getAttribLocation(program, 'a_position');
                gl.enableVertexAttribArray(posLoc);
                gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

                gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time * 0.001);
                gl.uniform1f(gl.getUniformLocation(program, 'u_integrity'), integrity);
                gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), gl.canvas.width, gl.canvas.height);

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                animationFrame = requestAnimationFrame(render);
            };

            animationFrame = requestAnimationFrame(render);
            return () => cancelAnimationFrame(animationFrame);
        } catch (e) {
            console.warn("[SovereignShield WebGL Error] Falling back to high-fidelity SVG matrix:", e);
            setWebGlSupported(false);
        }
    }, [integrity]);

    if (!webGlSupported) {
        return (
            <div id="sovereign-svg-shield" className="w-full h-full relative bg-zinc-950 flex flex-col items-center justify-center rounded-3xl overflow-hidden border border-cyan-500/10">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 to-transparent pointer-events-none" />
                <svg className="w-full h-full min-h-[300px]" viewBox="0 0 600 400">
                    <defs>
                        <pattern id="hex-mesh" width="40" height="69.282" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
                            <path d="M 40,0 L 20,11.547 L 0,0 L 0,23.094 L 20,34.641 L 40,23.094 Z M 0,34.641 L 20,46.188 L 0,57.735 Z M 40,34.641 L 20,46.188 L 40,57.735 Z M 20,46.188 L 0,57.735 L 0,80.829 L 20,92.376 L 40,80.829 L 40,57.735 Z" 
                                  fill="none" 
                                  stroke={integrity < 50 ? "#ef4444" : "#06b6d4"} 
                                  strokeWidth="0.75" 
                                  strokeOpacity="0.3"
                                  className="animate-pulse"
                            />
                        </pattern>
                        <filter id="svg-glow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <rect width="600" height="400" fill="url(#hex-mesh)" />
                    
                    <circle cx="300" cy="200" r="140" fill="none" stroke={integrity < 50 ? "#f43f5e" : "#06b6d4"} strokeWidth="1" strokeDasharray="4,6" className="animate-ping" style={{ animationDuration: '4s', opacity: 0.15 }} />
                    <circle cx="300" cy="200" r="80" fill="none" stroke={integrity < 50 ? "#ef4444" : "#3b82f6"} strokeWidth="1.5" strokeOpacity="0.3" className="animate-ping" style={{ animationDuration: '2.5s', opacity: 0.25 }} />

                    <circle cx="300" cy="200" r="15" fill={integrity < 50 ? "#991b1b" : "#172554"} opacity="0.4" />
                    <circle cx="300" cy="200" r="5" fill={integrity < 50 ? "#ef4444" : "#60a5fa"} filter="url(#svg-glow)" className="animate-pulse" />

                    <g fill="#4b5563" fontSize="8px" fontFamily="monospace" opacity="0.6">
                        <text x="20" y="30">FALLBACK_COGNITIVE_GRID: COMPENSATING</text>
                        <text x="20" y="45">SVG_VECTOR_INTEGRITY: {integrity.toFixed(1)}%</text>
                        <text x="20" y="380">MESH_ALIGNED: PHYSICAL_ARRAY</text>
                        <text x="450" y="380">TACTICAL_COVALENCE: TRUE</text>
                    </g>
                </svg>
                <div className="absolute top-4 right-4 bg-zinc-900/95 px-2.5 py-1 rounded text-[7.5px] font-bold text-cyan-400 border border-cyan-500/20 tracking-wider">
                  SVG SHIELD VEILS ENGAGED
                </div>
            </div>
        );
    }

    return <canvas ref={canvasRef} className="w-full h-full rounded-3xl" width={600} height={400} />;
};

interface SovereignShieldViewProps {
    onNavigateToReport?: (view: MainView) => void;
    projects?: NetworkProject[];
    setProjects?: React.Dispatch<React.SetStateAction<NetworkProject[]>>;
}

export const SovereignShieldView: React.FC<SovereignShieldViewProps> = ({ onNavigateToReport, projects, setProjects }) => {
    const [activeVisualMode, setActiveVisualMode] = useState<'shader' | 'radar' | 'quantum' | 'reconciliation' | 'anomaly'>('reconciliation');
    const [shieldStrength, setShieldStrength] = useState(100);
    const [telemetry, setTelemetry] = useState<ShieldTelemetry>({
        integrity: 98.4,
        deflectionRate: 1240,
        dissonanceSuppression: 99.1,
        lastBreachAttempt: '192.168.1.15',
        signature: '0x03E2_ALPHA'
    });

    const [shards, setShards] = useState<ThreatShard[]>([
        { id: 'S-01', origin: 'External_Node_77', payloadSize: '42KB', threatLevel: 'HIGH', binaryPreview: 'PK...v1Czçg...Ýg...F...2b7fc9eda065', status: 'ISOLATED' },
        { id: 'S-02', origin: 'Semantic_Drift_Buffer', payloadSize: '2KB', threatLevel: 'LOW', binaryPreview: '0x00A1...FF32...0001', status: 'ISOLATED' }
    ]);

    const [rightSidebarTab, setRightSidebarTab] = useState<'buffer' | 'history'>('buffer');
    const [liveNeutralizations, setLiveNeutralizations] = useState<any[]>([]);

    const [isNeutralizing, setIsNeutralizing] = useState<string | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<SystemIntegrityAudit | null>(null);
    const [logs, setLogs] = useState<string[]>(["[SHIELD] Sovereign Link Established.", "[OK] Entropy filters at 100%."]);

    // Real-Time Anomaly Engine and Escalation parameters
    const [defensiveEnvelope, setDefensiveEnvelope] = useState({
        amplitude: 85.5,
        frequency: 44.2,
        phaseLock: 98.9,
        latencyOffset: 14.5,
        entropyQuotient: 18.2
    });
    const [anomalyAlerts, setAnomalyAlerts] = useState<Array<{ id: string, name: string, severity: 'WARNING' | 'CRITICAL', timestamp: string, resolved: boolean }>>([
        { id: 'AN-01', name: 'Amplitude fluctuation beyond safe threshold', severity: 'WARNING', timestamp: new Date().toISOString(), resolved: false }
    ]);
    const [escalationLevel, setEscalationLevel] = useState<'OBSERVATION' | 'ISOLATION' | 'QUARANTINE' | 'OVERRIDE' | 'LOCK'>('OBSERVATION');
    const [isFailSafeArmed, setIsFailSafeArmed] = useState(true);
    const [isAutoTuning, setIsAutoTuning] = useState(false);

    // Calculate new defensive envelope thresholds
    const calculateDefensiveEnvelope = () => {
        addLog("[ANOMALY ENGINE] Initiating multi-dimensional envelope recalculation step...", "WARN");
        setIsAutoTuning(true);
        setTimeout(() => {
            setDefensiveEnvelope(prev => ({
                ...prev,
                amplitude: 90.0 + (Math.random() * 5),
                frequency: 45.0 + (Math.random() * 2),
                phaseLock: 99.5 + (Math.random() * 0.4),
                latencyOffset: 12.0 + (Math.random() * 2),
                entropyQuotient: 15.0 + (Math.random() * 3)
            }));
            setAnomalyAlerts(prev => prev.map(alert => ({ ...alert, resolved: true })));
            setTelemetry(prev => ({ ...prev, integrity: Math.min(100, prev.integrity + 1.5) }));
            setIsAutoTuning(false);
            addLog("[ANOMALY ENGINE] Defensive envelope parameters successfully calculated and locked within nominal safety matrix.", "SUCCESS");
        }, 1500);
    };

    // Change operator escalation level
    const handleEscalation = (level: 'OBSERVATION' | 'ISOLATION' | 'QUARANTINE' | 'OVERRIDE' | 'LOCK') => {
        setEscalationLevel(level);
        const randToken = Math.random().toString(16).substring(2, 10).toUpperCase();
        addLog(`[SECURITY] Escalated Operational Level to L-${level} by operator command. Auth token generated: ${randToken}`, "WARN");
        if (level === 'LOCK') {
            addLog("[FAIL-SAFE] !!! SYSTEM LOCK TRIGGERED !!! All access keys are frozen, egress pipelines isolated and quarantined.", "SUCCESS");
            setTelemetry(prev => ({ ...prev, integrity: 100 }));
        }
    };

    const handleToggleFailSafe = () => {
        setIsFailSafeArmed(prev => {
            const next = !prev;
            addLog(`[FAIL-SAFE] Fail-safe sequence ${next ? 'ARMED' : 'DISARMED'}. Auto-isolation active on boundary fault bounds.`, next ? 'SUCCESS' : 'WARN');
            return next;
        });
    };

    // Quantum Sovereign Cryptography State Space
    const [quantumKeys, setQuantumKeys] = useState<any | null>(null);
    const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
    const isGeneratingKeysRef = useRef(false);
    const [msgChannel, setMsgChannel] = useState<'SHIELD_TO_CORE' | 'CORE_TO_SHIELD'>('SHIELD_TO_CORE');
    const [messageInput, setMessageInput] = useState('CRITICAL PROTOCOL G00-A2: Forcing ABS subnet node synchronization.');
    const [encryptedPayload, setEncryptedPayload] = useState<any | null>(null);
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [decryptedText, setDecryptedText] = useState<string>('');
    const [isDecrypting, setIsDecrypting] = useState(false);

    const addLog = useCallback((msg: string, type: 'INFO' | 'WARN' | 'SUCCESS' = 'INFO') => {
        const color = type === 'SUCCESS' ? 'text-green-400' : type === 'WARN' ? 'text-red-500 font-bold' : 'text-cyan-500';
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] <span class="${color}">${msg}</span>`, ...prev].slice(0, 20));
    }, []);

    const syncShieldTaskCompletion = useCallback((taskId: string, completed: boolean) => {
        if (!setProjects) return;
        setProjects(prev => prev.map(p => {
            if (p.title === 'Sovereign Shield') {
                const updatedTasks = (p.tasks || []).map((t: any) => {
                    const matchesId = t.id === taskId;
                    const matchesText = (taskId === 'shield_task_keys' && t.text.toLowerCase().includes('key-pair')) ||
                                        (taskId === 'shield_task_audit' && t.text.toLowerCase().includes('integrity')) ||
                                        (taskId === 'shield_task_purge' && t.text.toLowerCase().includes('purge'));
                    if (matchesId || matchesText) {
                        return { ...t, completed };
                    }
                    return t;
                });
                return { ...p, tasks: updatedTasks };
            }
            return p;
        }));
    }, [setProjects]);

    const updateShieldProjectPerformance = useCallback((integrityValue: number, shieldStrengthValue: number) => {
        if (!setProjects) return;
        setProjects(prev => prev.map(p => {
            if (p.title === 'Sovereign Shield') {
                const totalTasks = p.tasks ? p.tasks.length : 0;
                const completedTasks = p.tasks ? p.tasks.filter((t: any) => t.completed).length : 0;
                let nextStatus = p.status;
                if (totalTasks > 0 && completedTasks === totalTasks) {
                    nextStatus = 'DONE';
                } else if (integrityValue > 95) {
                    nextStatus = 'STABLE';
                } else if (integrityValue > 75) {
                    nextStatus = 'FORGING';
                } else {
                    nextStatus = 'IDEATING';
                }
                return {
                    ...p,
                    fightVector: Math.round(integrityValue),
                    crazyLevel: Math.round(100 - shieldStrengthValue),
                    status: nextStatus
                };
            }
            return p;
        }));
    }, [setProjects]);

    // Initialize Sovereign Shield project in collaboration hub if missing
    useEffect(() => {
        if (!Array.isArray(projects) || !setProjects) return;
        const exists = projects.some(p => p && p.title === 'Sovereign Shield');
        if (!exists) {
            setProjects(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                if (prevArray.some(p => p && p.title === 'Sovereign Shield')) return prevArray;
                return [
                    ...prevArray,
                    {
                        id: 'sovereign_shield_project_id',
                        title: 'Sovereign Shield',
                        description: 'Real-time multi-dimensional defensive envelope and metric tracking system. Syncs automatically with Sovereign Shield views.',
                        crazyLevel: 2,
                        fightVector: 98,
                        tasks: [
                            {
                                id: 'shield_task_keys',
                                text: 'Conduct post-quantum lattice key-pair rotation',
                                completed: true,
                                createdAt: Date.now()
                            },
                            {
                                id: 'shield_task_audit',
                                text: 'Audit core system integrity and resolve module vulnerabilities',
                                completed: false,
                                createdAt: Date.now()
                            },
                            {
                                id: 'shield_task_purge',
                                text: 'Purge isolated danger shards from the cognitive field',
                                completed: false,
                                createdAt: Date.now()
                            }
                        ],
                        status: 'STABLE',
                        priority: 'Critical',
                        isWisdomHarmonized: true,
                        timestamp: new Date()
                    }
                ];
            });
        }
    }, [projects, setProjects]);

    // Extract primitive hash to avoid reference-based re-triggering loops
    const shieldProjStringified = Array.isArray(projects) ? JSON.stringify(projects.find(p => p && p.title === 'Sovereign Shield')) : '';

    useEffect(() => {
        if (!shieldProjStringified) return;
        try {
            const shieldProj = JSON.parse(shieldProjStringified);
            if (!shieldProj) return;

            const keyTask = shieldProj.tasks?.find((t: any) => t.id === 'shield_task_keys' || t.text.toLowerCase().includes('key-pair'));
            const auditTask = shieldProj.tasks?.find((t: any) => t.id === 'shield_task_audit' || t.text.toLowerCase().includes('integrity'));
            const purgeTask = shieldProj.tasks?.find((t: any) => t.id === 'shield_task_purge' || t.text.toLowerCase().includes('purge'));

            // Sync Key Completion manually toggled via Project Hub
            if (keyTask && !keyTask.completed && quantumKeys) {
                setQuantumKeys(null);
                addLog("[SYNC] Post-quantum keys cleared from Sovereign Collaboration Hub directive.", 'WARN');
            } else if (keyTask && keyTask.completed && !quantumKeys && !isGeneratingKeysRef.current) {
                handleGenerateFreshKeys();
            }

            // Sync Audit Completion manually toggled via Project Hub
            if (auditTask && auditTask.completed && auditResult && auditResult.vulnerabilities.some(v => v.status === 'OPEN')) {
                setAuditResult(prev => {
                    if (!prev) return null;
                    const updated = prev.vulnerabilities.map(v => ({ ...v, status: 'PATCHED' as const }));
                    setTelemetry(t => ({ ...t, integrity: 100 }));
                    addLog("[SYNC] All vulnerabilities patched via Collaboration Hub audit confirmation.", 'SUCCESS');
                    return { ...prev, overallIntegrity: 100, vulnerabilities: updated };
                });
            }

            // Sync Purge Completion manually toggled via Project Hub
            if (purgeTask && purgeTask.completed && shards.some(s => s.status !== 'PURGED')) {
                setShards(prev => {
                    const updated = prev.map(s => ({ ...s, status: 'PURGED' as const, threatLevel: 'LOW' as const }));
                    addLog("[SYNC] Danger shards purged via Collaboration Hub coordination.", 'SUCCESS');
                    return updated;
                });
            }
        } catch (err) {
            console.error("Sovereign Shield project state sync mismatch:", err);
        }
    }, [shieldProjStringified]);

    const handleGenerateFreshKeys = async () => {
        if (isGeneratingKeysRef.current) return;
        isGeneratingKeysRef.current = true;
        setIsGeneratingKeys(true);
        addLog("Initiating high-entropy PQC-1028 seed sequence...", 'INFO');
        try {
            const keys = await generate1028BitKeyPair();
            setQuantumKeys(keys);
            addLog(`Fresh hybrid 1028-bit key-pair generated: ${keys.id}`, 'SUCCESS');
            addLog(`Entropy Weight: ${keys.entropyWeight} σ standard deviation`, 'INFO');
            
            // Sync with collaboration hub
            syncShieldTaskCompletion('shield_task_keys', true);
            updateShieldProjectPerformance(telemetry.integrity, shieldStrength);
        } catch (e: any) {
            addLog(`Key generation error: ${e.message}`, 'WARN');
        } finally {
            setIsGeneratingKeys(false);
            isGeneratingKeysRef.current = false;
        }
    };

    const handleEncryptMessage = async () => {
        if (!quantumKeys) {
            addLog("No active keypair found. Absolute shielding required before encrypting.", 'WARN');
            return;
        }
        setIsEncrypting(true);
        setDecryptedText('');
        addLog(`Deriving AES-GCM-256 target key via PBKDF2 from 1028-bit public material...`, 'INFO');
        try {
            const payload = await encryptSovereignMessage(messageInput, quantumKeys.publicKey);
            setEncryptedPayload(payload);
            addLog(`Transmission encrypted [${msgChannel}]. Mode: AES-GCM. Ciphertext length: ${payload.encryptedData.length} chars.`, 'SUCCESS');
        } catch (e: any) {
            addLog(`Encryption error: ${e.message}`, 'WARN');
        } finally {
            setIsEncrypting(false);
        }
    };

    const handleDecryptPayload = async () => {
        if (!encryptedPayload || !quantumKeys) {
            addLog("Decrypt failed: Missing cryptogram or key pairing reference.", 'WARN');
            return;
        }
        setIsDecrypting(true);
        addLog(`Importing raw 1028-bit private segment to check parity checksum...`, 'INFO');
        try {
            const original = await decryptSovereignMessage(encryptedPayload, quantumKeys.privateKey);
            setDecryptedText(original);
            addLog(`Decryption successful! Plaintext recovered: "${original}"`, 'SUCCESS');
        } catch (e: any) {
            addLog(`Decryption block error: ${e.message}`, 'WARN');
        } finally {
            setIsDecrypting(false);
        }
    };

    // Auto-generate keys on mount for instant visual load
    useEffect(() => {
        handleGenerateFreshKeys();
    }, []);

    const handleAudit = async () => {
        setIsAuditing(true);
        addLog("Initiating System Integrity Audit...", 'WARN');
        addLog("Scanning core modules: SovereignBridge, KineticInterlock, CareMaestro...", 'INFO');
        
        try {
            const result = await conductSystemIntegrityAudit(['SovereignBridge', 'KineticInterlock', 'CareMaestro']);
            setAuditResult(result);
            setTelemetry(prev => {
                const nextT = { ...prev, integrity: result.overallIntegrity };
                updateShieldProjectPerformance(result.overallIntegrity, shieldStrength);
                return nextT;
            });
            addLog(`Audit complete. Overall Integrity: ${result.overallIntegrity}%`, result.overallIntegrity > 90 ? 'SUCCESS' : 'WARN');
            if (result.vulnerabilities.length > 0) {
                addLog(`Detected ${result.vulnerabilities.length} vulnerabilities.`, 'WARN');
                syncShieldTaskCompletion('shield_task_audit', false);
            } else {
                syncShieldTaskCompletion('shield_task_audit', true);
            }
        } catch (e) {
            addLog("Audit failed: Logic fracture detected in the scanner.", 'WARN');
        } finally {
            setIsAuditing(false);
        }
    };

    const handlePatch = (vId: string) => {
        addLog(`Applying logic patch to ${vId}...`, 'INFO');
        setTimeout(() => {
            setAuditResult(prev => {
                if (!prev) return null;
                const updatedVuls = prev.vulnerabilities.map(v => v.id === vId ? { ...v, status: 'PATCHED' as const } : v);
                const patchedCount = updatedVuls.filter(v => v.status === 'PATCHED').length;
                const newIntegrity = Math.min(100, prev.overallIntegrity + (patchedCount * 5));
                setTelemetry(t => {
                    const nextT = { ...t, integrity: newIntegrity };
                    updateShieldProjectPerformance(newIntegrity, shieldStrength);
                    return nextT;
                });
                
                const allPatched = updatedVuls.every(v => v.status === 'PATCHED');
                syncShieldTaskCompletion('shield_task_audit', allPatched);
                
                return { ...prev, overallIntegrity: newIntegrity, vulnerabilities: updatedVuls };
            });
            addLog(`Vulnerability ${vId} patched. Integrity restored.`, 'SUCCESS');
        }, 1500);
    };

    const handleNeutralize = (id: string, details?: any) => {
        setIsNeutralizing(id);
        addLog(`Initiating forensic purge of shard ${id}...`, 'WARN');
        
        setTimeout(() => {
            let threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
            let origin = 'UNKNOWN_SENSITIVE_NODE';
            let payloadSize = '4.2KB';
            let finalId = id;

            const existingShard = shards.find(s => s.id === id);
            if (existingShard) {
                threatLevel = existingShard.threatLevel;
                origin = existingShard.origin;
                payloadSize = existingShard.payloadSize;
                finalId = `VECT_${existingShard.id}`;
            } else if (details) {
                threatLevel = details.threatLevel || 'LOW';
                origin = details.origin || 'DYNAMIC_VECTOR';
                payloadSize = details.payloadSize || '12KB';
                finalId = `VECT_${details.id || id}`;
            } else {
                if (id.includes('CRITICAL')) threatLevel = 'CRITICAL';
                else if (id.includes('HIGH')) threatLevel = 'HIGH';
                else if (id.includes('MEDIUM')) threatLevel = 'MEDIUM';
                finalId = `VECT_${id}`;
            }

            const nowLocalDate = new Date();
            const yyyy = nowLocalDate.getUTCFullYear();
            const mm = String(nowLocalDate.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(nowLocalDate.getUTCDate()).padStart(2, '0');
            const hh = String(nowLocalDate.getUTCHours()).padStart(2, '0');
            const min = String(nowLocalDate.getUTCMinutes()).padStart(2, '0');
            const ss = String(nowLocalDate.getUTCSeconds()).padStart(2, '0');
            const formattedTimestamp = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} UTC`;

            const newLogItem = {
                id: finalId,
                origin,
                threatLevel,
                payloadSize,
                timestamp: formattedTimestamp,
                resolutionMethod: details ? 'ENTROPY_REFLECT' : 'CRYPTO_PURGE',
                status: 'NEUTRALIZED' as const
            };

            setLiveNeutralizations(prev => [newLogItem, ...prev]);

            setShards(prev => {
                const updated = prev.map(s => s.id === id ? { ...s, status: 'PURGED' as const, threatLevel: 'LOW' as const } : s);
                const allPurged = updated.every(s => s.status === 'PURGED');
                syncShieldTaskCompletion('shield_task_purge', allPurged);
                return updated;
            });
            setIsNeutralizing(null);
            
            const nextStrength = Math.min(100, shieldStrength + 5);
            setShieldStrength(nextStrength);
            setTelemetry(prev => {
                const nextIntegrity = Math.min(100, prev.integrity + 0.5);
                updateShieldProjectPerformance(nextIntegrity, nextStrength);
                return { ...prev, integrity: nextIntegrity };
            });
            addLog(`Shard ${id} neutralized. Logic reconciled.`, 'SUCCESS');
        }, 2000);
    };

    const patchAllVulnerabilities = useCallback(() => {
        setAuditResult(prev => {
            if (!prev) return null;
            const updated = prev.vulnerabilities.map(v => ({ ...v, status: 'PATCHED' as const }));
            setTelemetry(t => {
                const nextT = { ...t, integrity: 100 };
                updateShieldProjectPerformance(100, shieldStrength);
                return nextT;
            });
            addLog("Mass patched all open system vulnerabilities via state reconciliation trigger.", "SUCCESS");
            return { ...prev, overallIntegrity: 100, vulnerabilities: updated };
        });
    }, [addLog, shieldStrength]);

    const {
        divergences,
        reconciliationScore,
        lastScanTime,
        isReconciling,
        reconcileItem,
        reconcileAll,
        runManualScan
    } = useShieldReconciliation({
        projects,
        setProjects,
        shieldStrength,
        setShieldStrength,
        telemetry,
        setTelemetry,
        quantumKeys,
        setQuantumKeys,
        generateFreshKeys: handleGenerateFreshKeys,
        shards,
        setShards,
        vulnerabilities: auditResult ? auditResult.vulnerabilities : [],
        patchAllVulnerabilities,
        addLog
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry(prev => ({
                ...prev,
                deflectionRate: Math.max(1000, prev.deflectionRate + (Math.random() - 0.5) * 50)
            }));
            // Fluctuate shield strength slightly to show activity
            setShieldStrength(prev => Math.min(100, Math.max(85, prev + (Math.random() - 0.5) * 2)));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col bg-black text-cyan-100 font-mono overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 opacity-5 pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="p-6 border-b-8 border-black bg-black flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600/10 border-4 border-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                        <ShieldIcon className="w-10 h-10 text-blue-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">SOVEREIGN_SHIELD</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] bg-blue-950/40 text-blue-500 px-2 py-0.5 border border-blue-900/30 rounded font-black">PROTOCOL: 0x03E2_DEFENSE</span>
                            <span className="text-[10px] text-gray-500">SIGNATURE: {telemetry.signature}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8 items-center">
                    {onNavigateToReport && (
                        <button 
                            onClick={() => onNavigateToReport('vulnerability_report')}
                            className="vista-button px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center gap-2 animate-pulse"
                        >
                            <WarningIcon className="w-4 h-4" />
                            <span>CRITICAL ALERT</span>
                        </button>
                    )}
                    <button 
                        onClick={() => onNavigateToReport && onNavigateToReport('tactical_intelligence')}
                        className="vista-button px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center gap-2"
                    >
                        <SearchIcon className="w-4 h-4" />
                        <span>TACTICAL INTEL</span>
                    </button>
                    <button 
                        onClick={() => onNavigateToReport && onNavigateToReport('behavioral_specs')}
                        className="vista-button px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-xs rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center gap-2"
                    >
                        <CodeIcon className="w-4 h-4" />
                        <span>BEHAVIORAL SPECS</span>
                    </button>
                    <button 
                        onClick={() => onNavigateToReport && onNavigateToReport('cognitive_pipeline')}
                        className="vista-button px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center gap-2"
                    >
                        <BrainIcon className="w-4 h-4" />
                        <span>COGNITIVE PIPELINE</span>
                    </button>
                    <button 
                        onClick={handleAudit}
                        disabled={isAuditing}
                        className="vista-button px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center gap-2"
                    >
                        {isAuditing ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <GavelIcon className="w-4 h-4" />}
                        <span>SYSTEM AUDIT</span>
                    </button>
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Grid Integrity</p>
                        <p className={`text-xl font-comic-header ${telemetry.integrity > 90 ? 'text-green-500' : 'text-amber-500'}`}>{telemetry.integrity.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Deflection/sec</p>
                        <p className="text-xl font-comic-header text-cyan-400">{telemetry.deflectionRate.toFixed(0)}</p>
                    </div>
                </div>
            </div>

            {/* ... (rest of the component remains unchanged) */}


            <div className="flex-1 flex overflow-hidden p-8 gap-8 relative z-20">
                
                {/* Left: Shield Visualization & Telemetry */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    <div className="flex-1 flex gap-6 min-h-0">
                        {/* Main Interactive Visualizer */}
                        <div className="flex-1 aero-panel bg-black/60 border-4 border-black relative overflow-hidden flex flex-col shadow-[20px_20px_100px_rgba(0,0,0,1)]">
                            <div className="absolute top-4 left-4 z-10 flex gap-4">
                                <div className="px-3 py-1 bg-black/80 border border-blue-500/30 rounded-full text-[8px] font-black text-blue-400 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                    SCANNING_D4D_SPECTRUM
                                </div>
                            </div>

                            {/* Interactive Visual Mode Selector */}
                            <div className="absolute top-4 right-4 z-40 flex gap-2">
                                <button
                                    onClick={() => setActiveVisualMode('anomaly')}
                                    className={`px-2.5 py-1 text-[8px] font-black uppercase rounded cursor-pointer border transition-all ${
                                        activeVisualMode === 'anomaly'
                                            ? 'bg-amber-600/35 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                                            : 'bg-[#0f0f15]/85 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                                    }`}
                                >
                                    🛡️ ANOMALY ENGINE & ESCALATION
                                </button>
                                <button
                                    onClick={() => setActiveVisualMode('reconciliation')}
                                    className={`px-2.5 py-1 text-[8px] font-black uppercase rounded cursor-pointer border transition-all ${
                                        activeVisualMode === 'reconciliation'
                                            ? 'bg-cyan-600/30 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                            : 'bg-black/90 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    🔬 STATE RECONCILIATION HUB
                                </button>
                                <button
                                    onClick={() => setActiveVisualMode('quantum')}
                                    className={`px-2.5 py-1 text-[8px] font-black uppercase rounded cursor-pointer border transition-all ${
                                        activeVisualMode === 'quantum'
                                            ? 'bg-rose-600/30 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                                            : 'bg-black/90 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    🗝 1028-BIT QUANTUM GATE
                                </button>
                                <button
                                    onClick={() => setActiveVisualMode('radar')}
                                    className={`px-2.5 py-1 text-[8px] font-black uppercase rounded cursor-pointer border transition-all ${
                                        activeVisualMode === 'radar'
                                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                            : 'bg-black/90 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    3D RADAR
                                </button>
                                <button
                                    onClick={() => setActiveVisualMode('shader')}
                                    className={`px-2.5 py-1 text-[8px] font-black uppercase rounded cursor-pointer border transition-all ${
                                        activeVisualMode === 'shader'
                                            ? 'bg-blue-600/30 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                            : 'bg-black/90 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    SHIELD MESH
                                </button>
                            </div>


                            {activeVisualMode === 'anomaly' ? (
                                <div className="flex-1 flex flex-col p-6 pt-16 gap-6 overflow-y-auto custom-scrollbar relative z-10 text-zinc-200 animate-in fade-in duration-300">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-zinc-900 pb-4 gap-4">
                                        <div>
                                            <h3 className="text-sm font-black uppercase text-amber-500 tracking-wider flex items-center gap-2">
                                                <ShieldIcon className="w-4 h-4 text-amber-500 animate-pulse" />
                                                REAL-TIME ANOMALY DETECTION & PREEMPTIVE FAILURE ISOLATION
                                            </h3>
                                            <p className="text-[9px] text-zinc-400 font-sans mt-0.5">
                                                Tracks multidimensional high-frequency telemetry metrics against calculated mathematical bounds to detect drift anomaly signals.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 self-end md:self-auto">
                                            <button
                                                id="failsafe-toggle-btn"
                                                onClick={handleToggleFailSafe}
                                                className={`px-3 py-1.5 border text-[8.5px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                                                    isFailSafeArmed 
                                                        ? 'bg-red-950/20 border-red-500 text-red-100 font-bold shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                                                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                                                }`}
                                            >
                                                {isFailSafeArmed ? '● FAIL-SAFE SIGNATURE ARMED' : 'FAIL-SAFE COLD DISARMED'}
                                            </button>
                                            <button
                                                id="recalculate-envelope-btn"
                                                onClick={calculateDefensiveEnvelope}
                                                disabled={isAutoTuning}
                                                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black text-[8.5px] font-black uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-1.5 cursor-pointer"
                                            >
                                                {isAutoTuning ? <SpinnerIcon className="w-3.5 h-3.5 animate-spin text-black" /> : null}
                                                CALCULATE DEFENSIVE ENVELOPE
                                            </button>
                                        </div>
                                    </div>

                                    {/* Multi-Dimensional Metrics Layout */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                        {[
                                            { label: 'Amplitude Deviation', metric: 'amplitude', unit: 'GHz', limit: '< 92.5', value: defensiveEnvelope.amplitude.toFixed(1), color: defensiveEnvelope.amplitude < 90 ? 'text-red-500' : 'text-emerald-400' },
                                            { label: 'Frequency Jitter', metric: 'frequency', unit: 'MHz', limit: '< 46.0', value: defensiveEnvelope.frequency.toFixed(1), color: defensiveEnvelope.frequency < 45 ? 'text-red-500' : 'text-emerald-400' },
                                            { label: 'Phase Calibration Lock', metric: 'phaseLock', unit: '%', limit: '> 99.1', value: defensiveEnvelope.phaseLock.toFixed(1) + '%', color: 'text-amber-400' },
                                            { label: 'Sovereign Latency Offset', metric: 'latencyOffset', unit: 'ms', limit: '< 13.0', value: defensiveEnvelope.latencyOffset.toFixed(1) + 'ms', color: defensiveEnvelope.latencyOffset > 13 ? 'text-rose-500 animate-pulse' : 'text-purple-400' },
                                            { label: 'Entropy Boundary Quotient', metric: 'entropyQuotient', unit: 'kH', limit: '< 16.5', value: defensiveEnvelope.entropyQuotient.toFixed(1), color: defensiveEnvelope.entropyQuotient > 16.5 ? 'text-red-400 animate-pulse' : 'text-cyan-400' }
                                        ].map(item => (
                                            <div key={item.label} className="bg-[#050508] border-2 border-zinc-900 rounded-3xl p-5 hover:border-amber-500/20 transition-all flex flex-col justify-between group">
                                                <div>
                                                    <div className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">{item.label}</div>
                                                    <div className={`text-2xl font-comic-header mt-1.5 ${item.color} leading-none`}>{item.value}</div>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between text-[7.5px] text-zinc-500 border-t border-zinc-950/40 pt-2 font-mono">
                                                    <span>LIMIT: {item.limit}</span>
                                                    <span>{item.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                                        {/* Left Side: Real-Time Waveform Threshold visualizer & active anomalies */}
                                        <div className="lg:col-span-8 flex flex-col gap-4">
                                            <div className="bg-[#030305] rounded-3xl border border-zinc-900/65 p-5 flex flex-col justify-between h-64 relative overflow-hidden">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[8.5px] font-black uppercase text-zinc-400 tracking-wider">DEFENSIVE ENVELOPE AMPLITUDE SPECTROGRAM (LIVE)</span>
                                                    <div className="flex gap-2 text-[7.5px] font-mono text-zinc-500">
                                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> ANOMALY TRIGGER</span>
                                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> ADJUSTED UPPER BOUND</span>
                                                    </div>
                                                </div>
                                                {/* Graphical dynamic grid representation */}
                                                <div className="flex-1 w-full flex items-end justify-around gap-1 px-4 relative h-36">
                                                    <div className="absolute inset-x-0 h-[2px] bg-red-500/40 opacity-40 top-1/4 animate-pulse" title="Threshold Alert Boundary" />
                                                    <div className="absolute inset-x-0 h-[2px] bg-amber-500/20 opacity-30 bottom-1/4" title="Tolerant Decay Baseline" />
                                                    {Array.from({ length: 24 }).map((_, i) => {
                                                        const randomHeight = Math.floor(30 + Math.sin(i * 0.5) * 40 + (Math.random() * 20));
                                                        const isTriggered = randomHeight > 75;
                                                        return (
                                                            <div key={i} className="flex flex-col items-center justify-end h-full w-full">
                                                                <div 
                                                                    className={`w-1.5 rounded-t-full transition-all duration-300 ${
                                                                        isTriggered 
                                                                            ? 'bg-gradient-to-t from-red-600 to-amber-550 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                                                            : 'bg-gradient-to-t from-zinc-850 to-zinc-700'
                                                                    }`}
                                                                    style={{ height: `${randomHeight}%` }} 
                                                                />
                                                                <span className="text-[6px] text-zinc-600 font-mono mt-1">{i * 2}s</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="text-[8px] text-zinc-500 mt-2 font-mono flex items-center justify-between border-t border-zinc-950/40 pt-2">
                                                    <span>COORDINATE SCAN OFFSET: X_WAVE_992 (AXIS_DIVERGENT)</span>
                                                    <span className="text-red-500 animate-pulse text-[7.5px] font-bold">▲ ACTIVE ENTRONIC SPIKE IDENTIFIED</span>
                                                </div>
                                            </div>

                                            {/* Live alerts log inside anomaly engine */}
                                            <div className="bg-[#030305] rounded-3xl border border-zinc-900/65 p-5 flex flex-col justify-between">
                                                <div className="text-[9px] font-black uppercase text-zinc-400 mb-3 tracking-wider">ACTIVE ANOMALY DEVIATIONS DETECTED ({anomalyAlerts.filter(a => !a.resolved).length})</div>
                                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                                    {anomalyAlerts.map(alert => (
                                                        <div key={alert.id} className={`p-3 rounded-xl border flex justify-between items-center text-[9px] font-mono ${alert.resolved ? 'bg-green-950/10 border-green-500/10 text-green-400' : 'bg-red-950/10 border-red-500/20 text-red-100'}`}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full ${alert.resolved ? 'bg-green-500' : 'bg-red-500 animate-ping'}`} />
                                                                <span className="font-bold">[{alert.id}]</span>
                                                                <span>{alert.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                                                <span className="bg-black/60 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                                                    {alert.resolved ? '✓ SECURED' : '▲ OUT-OF-BOUNDS'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Operator Escalation flow controls */}
                                        <div className="lg:col-span-4 flex flex-col gap-4">
                                            <div className="bg-[#030305] rounded-3xl border border-zinc-900/65 p-5 flex flex-col justify-between h-full">
                                                <div>
                                                    <div className="text-[9px] font-black uppercase text-zinc-400 border-b border-zinc-950/40 pb-2 mb-3 tracking-widest flex items-center gap-1.5">
                                                        <GavelIcon className="w-3.5 h-3.5 text-zinc-450" />
                                                        <span>OPERATOR ESCALATION FLOW PROTOCOLS (LOCKDOWN)</span>
                                                    </div>
                                                    <p className="text-[9px] text-zinc-400 leading-relaxed font-sans mb-4">
                                                        Authorize local cryptographic escalation checkpoints below. Higher clearance limits operational boundary vectors, enforcing immediate sandbox state quarantine on fault detection.
                                                    </p>
                                                    <div className="space-y-3">
                                                        {[
                                                            { id: 'OBSERVATION', label: 'L-1: STATIC OBSERVATION', desc: 'Standard ambient telemetry and verification scanning' },
                                                            { id: 'ISOLATION', label: 'L-2: ENVELOPE ISOLATION', desc: 'Quarantine peripheral ingress tunnels on drift alerts' },
                                                            { id: 'QUARANTINE', label: 'L-3: HARD QUARANTINE', desc: 'Preemptive lockdown of all active API access points' },
                                                            { id: 'OVERRIDE', label: 'L-4: SOVEREIGN OVERRIDE', desc: 'Operator controls hijack key decryption stacks' },
                                                            { id: 'LOCK', label: 'L-5: FULL SYSTEM SECURE LOCK', desc: 'Immediate cold storage frozen, maximum quarantine armed' }
                                                        ].map(level => {
                                                            const isActive = escalationLevel === level.id;
                                                            return (
                                                                <button
                                                                    key={level.id}
                                                                    id={`escalation-btn-${level.id.toLowerCase()}`}
                                                                    onClick={() => handleEscalation(level.id as any)}
                                                                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden ${
                                                                        isActive 
                                                                            ? level.id === 'LOCK' 
                                                                                ? 'bg-red-950/30 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)] font-bold'
                                                                                : 'bg-amber-950/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold'
                                                                            : 'bg-black/60 border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:text-zinc-300'
                                                                    }`}
                                                                >
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="text-[9px] font-black uppercase tracking-wide">{level.label}</div>
                                                                        <div className="text-[8px] text-zinc-400 mt-0.5 font-sans leading-normal truncate max-w-[200px]">{level.desc}</div>
                                                                    </div>
                                                                    {isActive && (
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping shrink-0" />
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-zinc-950/40 flex justify-between items-center text-[7.5px] font-mono text-zinc-500">
                                                    <span>ACTIVE STAGE CLEARANCE: L-{escalationLevel}</span>
                                                    <span className="text-amber-500">PRE-DEPLOY TRIAL STATUS: SEALED</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : activeVisualMode === 'quantum' ? (
                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 p-6 gap-6 pt-14 overflow-y-auto custom-scrollbar relative z-10 text-zinc-200">
                                    {/* 3D Coin Column */}
                                    <div className="flex flex-col gap-4">
                                        <QuantumCoin3D />
                                        <div className="bg-[#050508] border-2 border-zinc-900 rounded-3xl p-5 text-[10px] space-y-2.5">
                                            <div className="flex items-center gap-2 text-rose-500 font-bold border-b border-zinc-900 pb-1.5 uppercase tracking-wide">
                                                <ShieldIcon className="w-4 h-4 animate-pulse" />
                                                <span>1028-Bit Parity Layout</span>
                                            </div>
                                            <p className="text-zinc-400 leading-relaxed font-sans text-[9px]">
                                                The interactive 3D coin visualizes sovereign node vectors. Drag to rotate or trigger momentum. The system leverages high-entropy matrix blocks representing dual state-spaces.
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-zinc-500 font-mono mt-1 text-[8px]">
                                                <div>• CLASSICAL ENTROPY: <span className="text-white font-bold">512 BITS</span></div>
                                                <div>• POST-QUANTUM LATTICE: <span className="text-white font-bold">512 BITS</span></div>
                                                <div>• HAMMING MODULO PARITY: <span className="text-white font-bold">4 BITS</span></div>
                                                <div>• SECURITY TARGET: <span className="text-[#06b6d4] font-bold">AES-GCM-256</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantum Cryptography Controls */}
                                    <div className="flex flex-col gap-4 bg-zinc-950/80 border-2 border-zinc-900 p-5 rounded-3xl overflow-hidden shadow-xl">
                                        <div className="flex justify-between items-center border-b border-zinc-805 pb-3">
                                            <div className="flex items-center gap-2">
                                                <LockIcon className="w-5 h-5 text-rose-500" />
                                                <span className="text-xs font-black uppercase text-white tracking-widest leading-none">Sovereign Key-Gateway</span>
                                            </div>
                                            <button
                                                id="quantum-regen-keys-btn"
                                                name="regen_keys"
                                                onClick={handleGenerateFreshKeys}
                                                disabled={isGeneratingKeys}
                                                className="px-3 py-1.5 bg-rose-955/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-400 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                                            >
                                                {isGeneratingKeys ? (
                                                    <>
                                                        <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                                                        <span>GENERATING...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <HistoryIcon className="w-3.5 h-3.5" />
                                                        <span>RE-KEY NODE (1028-BIT)</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {quantumKeys ? (
                                            <div className="space-y-3.5 text-[8.5px] tabular-nums font-mono">
                                                <div className="p-3 bg-black/60 rounded-xl border border-zinc-900">
                                                    <div className="flex justify-between text-zinc-500 text-[8px] uppercase font-bold mb-1">
                                                        <span>Key Identification Hash (ID)</span>
                                                        <span className="text-green-500 font-black">✔ SECURED VIA WEBCRYPTO</span>
                                                    </div>
                                                    <div className="text-rose-400 font-bold">{quantumKeys.id}</div>
                                                </div>

                                                <div className="p-3 bg-black/60 rounded-xl border border-zinc-900">
                                                    <div className="text-zinc-500 text-[8px] uppercase font-bold mb-1">Composite Public Key (1028-Bit representation)</div>
                                                    <div className="text-white break-all max-h-12 overflow-y-auto custom-scrollbar p-1 bg-[#050508] rounded border border-zinc-950 font-bold tracking-tight select-all leading-tight">
                                                        {quantumKeys.publicKey}
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-black/60 rounded-xl border border-zinc-900">
                                                    <div className="text-zinc-500 text-[8px] uppercase font-bold mb-1">Composite Private Key (Obfuscated)</div>
                                                    <div className="text-zinc-400 break-all max-h-12 overflow-y-auto custom-scrollbar p-1 bg-[#050508] rounded border border-zinc-950 select-all leading-tight">
                                                        {quantumKeys.privateKey.slice(0, 32)}... [ENCRYPTED MEMORY BUFFER] ... {quantumKeys.privateKey.slice(-16)}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-10 text-center opacity-45 text-zinc-500 gap-2">
                                                <SpinnerIcon className="w-8 h-8 animate-spin" />
                                                <span className="text-[9px] uppercase font-bold">Aligning High-Entropy Spinors...</span>
                                            </div>
                                        )}

                                        {/* Cryptographic Secure Messaging Box */}
                                        <div className="border-t border-zinc-900 pt-4 mt-1 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Secure Conjunction Courier</span>
                                                {/* Channel Selector */}
                                                <div className="flex border border-zinc-900 rounded-lg overflow-hidden text-[7.5px] font-bold">
                                                    <button
                                                        id="chan-shield-btn"
                                                        name="chan_shield"
                                                        onClick={() => setMsgChannel('SHIELD_TO_CORE')}
                                                        className={`px-2.5 py-1 transition-all cursor-pointer ${msgChannel === 'SHIELD_TO_CORE' ? 'bg-rose-955/40 text-rose-450 border-r border-zinc-900 font-bold' : 'bg-black text-zinc-500'}`}
                                                    >
                                                        SHIELD ➜ CORE
                                                    </button>
                                                    <button
                                                        id="chan-core-btn"
                                                        name="chan_core"
                                                        onClick={() => setMsgChannel('CORE_TO_SHIELD')}
                                                        className={`px-2.5 py-1 transition-all cursor-pointer ${msgChannel === 'CORE_TO_SHIELD' ? 'bg-rose-955/40 text-rose-450 border-l border-zinc-900 font-bold' : 'bg-black text-zinc-500'}`}
                                                    >
                                                        CORE ➜ SHIELD
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[7.5px] font-bold text-zinc-500 uppercase">Active Payload Plaintext</label>
                                                <input
                                                    id="quantum-msg-plain-input"
                                                    name="msg_plain"
                                                    type="text"
                                                    value={messageInput}
                                                    onChange={(e) => setMessageInput(e.target.value)}
                                                    className="w-full text-[10px] bg-black border border-zinc-900 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500/50"
                                                    placeholder="Enter secure message contents..."
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    id="encrypt-action-btn"
                                                    name="encrypt_action"
                                                    onClick={handleEncryptMessage}
                                                    disabled={isEncrypting || !quantumKeys}
                                                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-[9px] rounded-xl transition-all active:translate-y-0.5 shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    {isEncrypting ? <SpinnerIcon className="w-3.5 h-3.5 animate-spin" /> : <LockIcon className="w-3.5 h-3.5" />}
                                                    <span>GENERATE CRYPTOGRAM & ENCRYPT</span>
                                                </button>
                                            </div>

                                            {/* Transmitted Cryptogram Result */}
                                            {encryptedPayload && (
                                                <div className="p-3 bg-[#030305] rounded-2xl border border-zinc-900/60 space-y-2 text-[8px] font-mono leading-tight">
                                                    <div className="flex justify-between text-zinc-500 text-[7.5px] font-bold border-b border-zinc-900/40 pb-1 uppercase">
                                                        <span>Encrypted Envelope Payload</span>
                                                        <span className="text-rose-400 font-bold">{encryptedPayload.algorithm}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-[7.5px] text-zinc-400">
                                                        <div>• IV VECTOR: <span className="text-white font-bold select-all">{encryptedPayload.iv}</span></div>
                                                        <div>• SALT DERIVATION: <span className="text-white font-bold select-all">{encryptedPayload.salt}</span></div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-zinc-500 text-[7.5px] uppercase font-bold text-left">AES-GCM Ciphertext (Base64 representation)</div>
                                                        <div className="p-1.5 bg-[#010102] rounded border border-zinc-950 font-bold text-rose-400/85 break-all select-all max-h-12 overflow-y-auto custom-scrollbar leading-tight">
                                                            {encryptedPayload.encryptedData}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 pt-1 border-t border-zinc-900/40">
                                                        <button
                                                            id="decrypt-action-btn"
                                                            name="decrypt_action"
                                                            onClick={handleDecryptPayload}
                                                            disabled={isDecrypting}
                                                            className="w-full py-1.5 bg-[#0a0f1d] hover:bg-blue-900/40 border border-blue-500/20 text-blue-400 hover:text-white font-bold uppercase text-[8px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                                        >
                                                            {isDecrypting ? <SpinnerIcon className="w-3 h-3 animate-spin" /> : <UnlockIcon className="w-3 h-3" />}
                                                            <span>VERIFY DECRYPTION OVER SOVEREIGN NODE</span>
                                                        </button>
                                                    </div>

                                                    {decryptedText && (
                                                        <div className="p-2 bg-green-950/20 border border-green-500/25 rounded-lg text-green-400 text-[8.5px] space-y-1 animate-in slide-in-from-bottom-1 duration-200">
                                                            <div className="font-bold uppercase text-[8px] text-green-500 tracking-wider">✔ DECRYPTED PLANET-SIDE MATCH:</div>
                                                            <div className="italic font-sans text-[10px] text-zinc-200">"{decryptedText}"</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : activeVisualMode === 'shader' ? (
                                <>
                                    {/* Shield Strength HUD Overlay */}
                                    <div className="absolute bottom-6 left-6 z-10 w-64 animate-in fade-in duration-200">
                                        <div className="bg-black/90 border-2 border-blue-500/50 p-4 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Shield Strength</p>
                                                <ActivityIcon className="w-3 h-3 text-blue-400 animate-pulse" />
                                            </div>
                                            <div className="flex items-end gap-3">
                                                <span className="text-5xl font-comic-header text-white leading-none wisdom-glow">{shieldStrength.toFixed(0)}%</span>
                                            </div>
                                            <div className="mt-3 h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-blue-900/30">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 shadow-[0_0_15px_cyan]" 
                                                    style={{ width: `${shieldStrength}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <ShieldVisualization integrity={telemetry.integrity} />
                                </>
                            ) : activeVisualMode === 'radar' ? (
                                <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 p-2 text-zinc-200 mt-12 animate-in fade-in duration-300">
                                    <ThreatVector3DGrid 
                                        shards={shards} 
                                        intensity={telemetry.integrity} 
                                        onNeutralize={(id) => handleNeutralize(id)}
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 p-6 pt-14 text-zinc-200 overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-lg font-black uppercase text-cyan-450 tracking-wider">STATE RECONCILIATION NETWORK</h3>
                                            <p className="text-[9px] text-zinc-400 font-sans mt-0.5">Validates and aligns collaboration board tasks with real-time defensive shield telemetry.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={runManualScan}
                                                className="px-3 py-1.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 rounded-lg text-[8.5px] font-black uppercase transition-all cursor-pointer"
                                            >
                                                Run Fresh Scan
                                            </button>
                                            <button
                                                onClick={reconcileAll}
                                                disabled={isReconciling || divergences.length === 0}
                                                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white rounded-lg text-[8.5px] font-black uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5 cursor-pointer"
                                            >
                                                {isReconciling ? <SpinnerIcon className="w-3.5 h-3.5 animate-spin" /> : null}
                                                {divergences.length === 0 ? 'STATE FULLY ALIGNED' : `HEAL & RECONCILE ALL (${divergences.length})`}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dashboard Cards Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-[#050508] border-2 border-zinc-900 rounded-3xl p-5 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[8px] text-zinc-500 uppercase font-black">Coherent Alignment Index</div>
                                                <div className="text-3xl font-comic-header text-white mt-1">{reconciliationScore}%</div>
                                            </div>
                                            <div className="mt-3 text-[8px] text-zinc-400 font-sans leading-normal">
                                                {reconciliationScore === 100 
                                                    ? 'Zero structural divergence detected. Node synergy optimal.'
                                                    : 'Deviation detected. Core board sync is lagging behind real-time reactive shield indicators.'}
                                            </div>
                                        </div>

                                        <div className="bg-[#050508] border-2 border-zinc-900 rounded-3xl p-5 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[8px] text-zinc-500 uppercase font-bold font-black">Active Divergences</div>
                                                <div className={`text-3xl font-comic-header mt-1 ${divergences.length > 0 ? 'text-rose-500' : 'text-green-500'}`}>
                                                    {divergences.length}
                                                </div>
                                            </div>
                                            <div className="mt-3 text-[8px] text-zinc-400 font-sans leading-normal">
                                                Instances of conflict between the Project Collaboration Board and live high-entropy defensive states.
                                            </div>
                                        </div>

                                        <div className="bg-[#050508] border-2 border-zinc-900 rounded-3xl p-5 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[8px] text-zinc-500 uppercase font-black">Last System Scan</div>
                                                <div className="text-sm font-bold text-white mt-2 font-mono">
                                                    {lastScanTime.toLocaleTimeString()}
                                                </div>
                                            </div>
                                            <div className="mt-3 text-[8px] text-zinc-400 font-sans leading-normal">
                                                Auto-triggered scanning ensures 100% telemetry resolution between standard views.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divergence Items List */}
                                    {divergences.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-zinc-900 rounded-3xl bg-zinc-950/20">
                                            <CheckCircleIcon className="w-12 h-12 text-green-500 mb-3 animate-bounce" />
                                            <h4 className="text-sm font-bold text-white uppercase">State Coherence Absolute</h4>
                                            <p className="text-[10px] text-zinc-400 mt-1 max-w-md font-sans">
                                                All collaboration hub tasks, audit vulnerabilities, threat purges, and keys are fully integrated and aligned. No healing action is needed.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 font-mono">
                                            <div className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">Telemetry Divergence Ledger // ({divergences.length} structural skew verified)</div>
                                            <div className="grid grid-cols-1 gap-4 text-left">
                                                {divergences.map((div) => (
                                                    <div key={div.id} className="p-5 rounded-2xl bg-[#08080c] border border-zinc-900 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                        <div className="space-y-1.5 max-w-xl">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className={`px-2 py-0.5 rounded text-[7.5px] font-black uppercase ${
                                                                    div.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                                                    div.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-450 font-bold' :
                                                                    div.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-450' :
                                                                    'bg-zinc-800 text-zinc-400'
                                                                }`}>
                                                                    {div.severity}
                                                                </span>
                                                                <span className="text-[8px] text-cyan-400 uppercase tracking-wider font-bold">Category: {div.category}</span>
                                                                <span className="text-zinc-600 text-[8px]">[{div.source}]</span>
                                                            </div>
                                                            <h4 className="text-xs font-black text-white uppercase">{div.title}</h4>
                                                            <p className="text-[9px] text-zinc-400 font-sans leading-normal">{div.description}</p>
                                                        </div>

                                                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0">
                                                            <div className="flex gap-4 text-right">
                                                                <div>
                                                                    <div className="text-[7.5px] text-zinc-600 uppercase font-bold">Shield Enclave</div>
                                                                    <div className="text-[9.5px] font-bold text-cyan-400 font-mono">{String(div.actualShieldValue)}</div>
                                                                </div>
                                                                <div className="border-r border-zinc-900" />
                                                                <div>
                                                                    <div className="text-[7.5px] text-zinc-600 uppercase font-bold">Board Stored</div>
                                                                    <div className="text-[9.5px] font-bold text-amber-500 font-mono">{String(div.collabHubValue)}</div>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => reconcileItem(div.id)}
                                                                className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-600 border border-cyan-500/30 text-cyan-400 hover:text-white rounded-lg text-[8.5px] font-black uppercase transition-all cursor-pointer"
                                                            >
                                                                Heal Node
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Floating 2D Heatmap Panel Overlay */}
                            <FloatingThreatHeatmap 
                                shards={shards} 
                                className={activeVisualMode === 'shader' ? 'left-[290px]' : 'left-6'} 
                            />
                        </div>

                        {/* Sovereign Tactical Sidebars Block */}
                        <div className="w-80 flex flex-col gap-6 flex-shrink-0">
                            {/* 2D Circular Segment Density Heatmap */}
                            <GridSegmentHeatmap shards={shards} />

                            {/* Google Meet Crisis Briefing Controls */}
                            <GoogleMeetWarRoom onAddLog={addLog} />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: 'Dissonance Suppression', val: telemetry.dissonanceSuppression + '%', icon: StarIcon, color: 'text-violet-400' },
                            { label: 'Aetheric Pressure', val: '1.22 PB/S', icon: ActivityIcon, color: 'text-cyan-400' },
                            { label: 'Sentinel Status', val: 'ABSOLUTE', icon: LockIcon, color: 'text-amber-500' }
                        ].map(item => (
                            <div key={item.label} className="aero-panel bg-black/40 border-2 border-white/5 p-4 text-center group hover:border-blue-500/30 transition-all">
                                <item.icon className={`w-6 h-6 mx-auto mb-2 opacity-40 group-hover:opacity-100 transition-opacity ${item.color}`} />
                                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{item.label}</p>
                                <p className="text-sm font-bold text-white mt-1">{item.val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Threat Ledger & Terminal */}
                <div className="w-96 flex flex-col gap-6 flex-shrink-0 min-h-0 overflow-hidden">
                    <div className="flex-1 aero-panel bg-black border-4 border-black flex flex-col overflow-hidden shadow-[10px_10px_0_0_#000]">
                        {/* Tab header buttons */}
                        <div className="flex border-b-2 border-white/5 bg-white/5 justify-between select-none">
                            <button
                                onClick={() => setRightSidebarTab('buffer')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase text-center border-r border-white/5 transition-all cursor-pointer ${
                                    rightSidebarTab === 'buffer'
                                        ? 'bg-red-950/20 text-red-500 border-b-2 border-b-red-500'
                                        : 'bg-black/40 text-gray-400 hover:text-white'
                                }`}
                            >
                                ⚠ Isolated Buffer ({shards.filter(s => s.status === 'ISOLATED').length})
                            </button>
                            <button
                                onClick={() => setRightSidebarTab('history')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase text-center transition-all cursor-pointer ${
                                    rightSidebarTab === 'history'
                                        ? 'bg-emerald-950/20 text-emerald-400 border-b-2 border-b-emerald-400'
                                        : 'bg-black/40 text-gray-400 hover:text-white'
                                }`}
                            >
                                ✓ Mitigation History (50)
                            </button>
                        </div>

                        {rightSidebarTab === 'buffer' ? (
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {shards.map(shard => (
                                    <div key={shard.id} className={`p-4 bg-black/60 rounded-2xl border-2 transition-all duration-500 ${shard.status === 'PURGED' ? 'border-green-600/30 opacity-50' : 'border-red-600/30 hover:border-red-500'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-[9px] font-black text-white uppercase tracking-tighter">{shard.id} // {shard.origin}</p>
                                                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border border-black ${shard.threatLevel === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                                    LEVEL: {shard.threatLevel}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[8px] font-mono text-gray-700">{shard.payloadSize}</span>
                                            </div>
                                        </div>
                                        <div className="bg-black/60 p-2 rounded-lg border border-white/5 mb-4 overflow-hidden">
                                            <p className="text-[10px] font-mono text-red-400/60 whitespace-nowrap overflow-hidden">
                                                {shard.binaryPreview}
                                            </p>
                                        </div>
                                        {shard.status === 'ISOLATED' ? (
                                            <button 
                                                onClick={() => handleNeutralize(shard.id)}
                                                disabled={isNeutralizing !== null}
                                                className="w-full py-2 bg-red-950/40 hover:bg-red-600 border border-red-600/30 text-red-500 hover:text-white transition-all text-[8px] font-black uppercase rounded-lg flex items-center justify-center gap-2"
                                            >
                                                {isNeutralizing === shard.id ? <SpinnerIcon className="w-3 h-3 animate-spin" /> : <FireIcon className="w-3 h-3" />}
                                                {isNeutralizing === shard.id ? 'NEUTRALIZING...' : 'EXECUTE PURGE'}
                                            </button>
                                        ) : (
                                            <div className="w-full py-2 bg-green-950/20 text-green-500 text-[8px] font-black uppercase rounded-lg flex items-center justify-center gap-2">
                                                <CheckCircleIcon className="w-3 h-3" /> SHARD PURGED
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 overflow-hidden">
                                <ThreatNeutralizationLog activeNeutralizations={liveNeutralizations} />
                            </div>
                        )}
                    </div>
                    
                    {auditResult && (
                        <div className="h-64 aero-panel bg-black border-4 border-black flex flex-col overflow-hidden shadow-[10px_10px_0_0_#000]">
                            <div className="p-4 border-b-2 border-white/5 bg-blue-900/20 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GavelIcon className="w-5 h-5 text-blue-400" />
                                    <span className="text-[10px] font-black uppercase text-blue-400">Integrity Audit Report</span>
                                </div>
                                <span className="text-[8px] font-mono text-gray-700">{auditResult.signature}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {auditResult.vulnerabilities.map(vul => (
                                    <div key={vul.id} className={`p-3 rounded-xl border-2 transition-all ${vul.status === 'PATCHED' ? 'border-green-600/20 bg-green-950/10' : 'border-blue-600/30 bg-blue-950/10'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[9px] font-black text-white uppercase">{vul.module}</span>
                                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${vul.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                                                {vul.severity}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 leading-tight mb-2">{vul.description}</p>
                                        {vul.status === 'OPEN' ? (
                                            <button 
                                                onClick={() => handlePatch(vul.id)}
                                                className="w-full py-1.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-600/30 text-blue-400 hover:text-white transition-all text-[8px] font-black uppercase rounded-lg flex items-center justify-center gap-2"
                                            >
                                                <ZapIcon className="w-3 h-3" /> APPLY PATCH
                                            </button>
                                        ) : (
                                            <div className="w-full py-1.5 bg-green-950/40 text-green-500 text-[8px] font-black uppercase rounded-lg flex items-center justify-center gap-2">
                                                <CheckCircleIcon className="w-3 h-3" /> MODULE SECURED
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="h-64 aero-panel bg-black border-4 border-black p-4 flex flex-col overflow-hidden shadow-inner">
                        <div className="flex items-center gap-2 mb-3 text-cyan-900 border-b border-white/5 pb-2">
                            <TerminalIcon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Defense Log</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                            {logs.map((log, i) => (
                                <div key={i} className="text-[10px] font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: log }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-3 bg-black border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Defense Grid: CONDUCTING</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Stride: 1.22 PB/s | Last Attempt: {telemetry.lastBreachAttempt}
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.5em] hidden sm:block">
                   conjunction reliable series | absolute authority
                </div>
            </div>
        </div>
    );
};
