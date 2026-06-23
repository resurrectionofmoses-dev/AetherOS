import { useState, useEffect, useCallback, useMemo } from 'react';
import type { NetworkProject, ProjectTask, ShieldTelemetry, ThreatShard } from '../types';

export interface DivergenceItem {
    id: string;
    category: 'KEYS' | 'INTEGRITY' | 'VULNERABILITIES' | 'SHARDS' | 'STRENGTH';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    actualShieldValue: string | number;
    collabHubValue: string | number;
    source: string;
    fixable: boolean;
}

interface UseShieldReconciliationProps {
    projects: NetworkProject[] | undefined;
    setProjects: React.Dispatch<React.SetStateAction<NetworkProject[]>> | undefined;
    shieldStrength: number;
    setShieldStrength: React.Dispatch<React.SetStateAction<number>>;
    telemetry: ShieldTelemetry;
    setTelemetry: React.Dispatch<React.SetStateAction<ShieldTelemetry>>;
    quantumKeys: any;
    setQuantumKeys: React.Dispatch<React.SetStateAction<any>>;
    generateFreshKeys: () => Promise<void>;
    shards: ThreatShard[];
    setShards: React.Dispatch<React.SetStateAction<ThreatShard[]>>;
    vulnerabilities: any[];
    setVulnerabilities?: React.Dispatch<React.SetStateAction<any[]>>;
    patchAllVulnerabilities: () => void;
    addLog: (msg: string, type?: 'SUCCESS' | 'WARN' | 'INFO') => void;
}

export const useShieldReconciliation = ({
    projects,
    setProjects,
    shieldStrength,
    setShieldStrength,
    telemetry,
    setTelemetry,
    quantumKeys,
    setQuantumKeys,
    generateFreshKeys,
    shards,
    setShards,
    vulnerabilities,
    setVulnerabilities,
    patchAllVulnerabilities,
    addLog
}: UseShieldReconciliationProps) => {
    const [lastScanTime, setLastScanTime] = useState<Date>(new Date());
    const [isReconciling, setIsReconciling] = useState(false);

    // Get the Sovereign Shield project from the collaboration hub
    const shieldProject = useMemo(() => {
        if (!projects) return null;
        return projects.find(p => p.title === 'Sovereign Shield') || null;
    }, [projects]);

    // Compute active divergences
    const divergences = useMemo((): DivergenceItem[] => {
        const list: DivergenceItem[] = [];
        if (!shieldProject) return list;

        const tasks = shieldProject.tasks || [];
        const keyTask = tasks.find((t: any) => t.id === 'shield_task_keys' || t.text.toLowerCase().includes('key-pair'));
        const auditTask = tasks.find((t: any) => t.id === 'shield_task_audit' || t.text.toLowerCase().includes('integrity'));
        const purgeTask = tasks.find((t: any) => t.id === 'shield_task_purge' || t.text.toLowerCase().includes('purge'));

        // 1. Quantum Key pair mismatch
        const keysExist = !!quantumKeys;
        const keyTaskCompleted = !!keyTask?.completed;
        if (keysExist !== keyTaskCompleted) {
            list.push({
                id: 'keys_mismatch',
                category: 'KEYS',
                severity: 'HIGH',
                title: 'Quantum Lattice Key Alliance Skew',
                description: keyTaskCompleted 
                    ? 'The collaboration list reports rotated lattice keys, but active high-entropy keys are missing in the secure shield enclave.' 
                    : 'Active quantum keys exist in the shield enclave, but the collaboration hub task remains unfulfilled.',
                actualShieldValue: keysExist ? 'KEYS_PRESENT' : 'KEYS_VACANT',
                collabHubValue: keyTaskCompleted ? 'COMPLETED' : 'INCOMPLETE',
                source: 'Quantum Crypto Module',
                fixable: true
            });
        }

        // 2. Integrity misalignment
        const LiveIntegrity = Math.round(telemetry.integrity);
        const CollabFightVector = Math.round(shieldProject.fightVector || 0);
        if (Math.abs(LiveIntegrity - CollabFightVector) > 1) {
            list.push({
                id: 'integrity_divergence',
                category: 'INTEGRITY',
                severity: 'CRITICAL',
                title: 'Integrity Rating Calibration Deficit',
                description: `Live shield integrity metric (${LiveIntegrity}%) diverges from the project hub fight vector value (${CollabFightVector}%).`,
                actualShieldValue: LiveIntegrity,
                collabHubValue: CollabFightVector,
                source: 'System Integrity Scanner',
                fixable: true
            });
        }

        // 3. Vulnerability status discrepancy
        const openVuls = vulnerabilities.filter(v => v.status === 'OPEN').length;
        const auditTaskCompleted = !!auditTask?.completed;
        if (openVuls > 0 && auditTaskCompleted) {
            list.push({
                id: 'audit_status_discrepancy',
                category: 'VULNERABILITIES',
                severity: 'CRITICAL',
                title: 'False Secure Declaration',
                description: 'The audit and verification task is marked completed on the board, but unpatched system security vulnerabilities reside in the active shield mesh.',
                actualShieldValue: `${openVuls} Open Vulnerabilities`,
                collabHubValue: 'COMPLETED',
                source: 'Vulnerability Analysis Lab',
                fixable: true
            });
        } else if (openVuls === 0 && !auditTaskCompleted && vulnerabilities.length > 0) {
            list.push({
                id: 'audit_task_stale',
                category: 'VULNERABILITIES',
                severity: 'LOW',
                title: 'Stale Audit Board Item',
                description: 'All system vulnerabilities are verified patched, but the collaboration task has not been progressed to completion.',
                actualShieldValue: '0 Open Vulnerabilities',
                collabHubValue: 'INCOMPLETE',
                source: 'View Synchronization Engine',
                fixable: true
            });
        }

        // 4. Shard clearance divergence
        const unpurgedShards = shards.filter(s => s.status !== 'PURGED').length;
        const purgeTaskCompleted = !!purgeTask?.completed;
        if (unpurgedShards > 0 && purgeTaskCompleted) {
            list.push({
                id: 'shards_purge_divergence',
                category: 'SHARDS',
                severity: 'HIGH',
                title: 'Threat Shards Isolation Divergence',
                description: 'The threat purge project is flagged completed, but radioactive danger shards remain isolated but active within the cognitive mesh.',
                actualShieldValue: `${unpurgedShards} Active Shards`,
                collabHubValue: 'COMPLETED',
                source: 'Sovereign Threat Radar',
                fixable: true
            });
        } else if (unpurgedShards === 0 && !purgeTaskCompleted && shards.length > 0) {
            list.push({
                id: 'shards_task_stale',
                category: 'SHARDS',
                severity: 'LOW',
                title: 'Stale Shard Clearance Task',
                description: 'All danger shards have been fully purged, but the board status has not updated.',
                actualShieldValue: '0 Active Shards',
                collabHubValue: 'INCOMPLETE',
                source: 'Threat Shards Log',
                fixable: true
            });
        }

        // 5. Threat deflection level calibration mismatch
        const calculatedCrazy = Math.round(100 - shieldStrength);
        const CollabCrazyLevel = Math.round(shieldProject.crazyLevel || 0);
        if (Math.abs(calculatedCrazy - CollabCrazyLevel) > 1) {
            list.push({
                id: 'strength_crazy_discrepancy',
                category: 'STRENGTH',
                severity: 'MEDIUM',
                title: 'Shield Deflection Pressure Deficit',
                description: `Live cognitive load gauge (${calculatedCrazy} crazy-equivalent) does not align with stored Board deflection metrics (${CollabCrazyLevel}).`,
                actualShieldValue: calculatedCrazy,
                collabHubValue: CollabCrazyLevel,
                source: 'Cognitive Load Indicator',
                fixable: true
            });
        }

        return list;
    }, [shieldProject, quantumKeys, telemetry.integrity, vulnerabilities, shards, shieldStrength]);

    // Reconciliation progress index (0 to 100%)
    const reconciliationScore = useMemo(() => {
        if (!shieldProject) return 100;
        const totalChecks = 5;
        const passedChecks = totalChecks - divergences.length;
        return Math.round((passedChecks / totalChecks) * 100);
    }, [shieldProject, divergences]);

    // Reconcile a single divergence item
    const reconcileItem = useCallback(async (divergenceId: string) => {
        if (!setProjects || !shieldProject) return;

        setIsReconciling(true);
        addLog(`Initiating micro-reconciliation sequence for: ${divergenceId}...`, 'INFO');

        try {
            switch (divergenceId) {
                case 'keys_mismatch': {
                    const tasks = shieldProject.tasks || [];
                    const keyTask = tasks.find((t: any) => t.id === 'shield_task_keys' || t.text.toLowerCase().includes('key-pair'));
                    if (keyTask?.completed && !quantumKeys) {
                        // Rotation reported completed, generate keys to sync up
                        await generateFreshKeys();
                        addLog("Reconciliation sync: Completed, fresh hybrid lattice keys instantiated.", "SUCCESS");
                    } else if (quantumKeys && !keyTask?.completed) {
                        // Keys exist, mark board task complete
                        setProjects(prev => prev.map(p => {
                            if (p.title === 'Sovereign Shield') {
                                return {
                                    ...p,
                                    tasks: (p.tasks || []).map(t => t.id === 'shield_task_keys' ? { ...t, completed: true } : t)
                                };
                            }
                            return p;
                        }));
                        addLog("Reconciliation sync: Board task marked completed.", "SUCCESS");
                    }
                    break;
                }

                case 'integrity_divergence': {
                    // Sync fight vector on board to live value
                    const liveInt = Math.round(telemetry.integrity);
                    setProjects(prev => prev.map(p => {
                        if (p.title === 'Sovereign Shield') {
                            return { ...p, fightVector: liveInt };
                        }
                        return p;
                    }));
                    addLog(`Reconciliation sync: Collaboration Board fight vector calibrated to live ${liveInt}%.`, "SUCCESS");
                    break;
                }

                case 'audit_status_discrepancy': {
                    // Force patch vulnerabilities to restore live state match
                    patchAllVulnerabilities();
                    addLog("Reconciliation sync: Mass patched active vulnerabilities to comply with secure board state.", "SUCCESS");
                    break;
                }

                case 'audit_task_stale': {
                    // Update task completion
                    setProjects(prev => prev.map(p => {
                        if (p.title === 'Sovereign Shield') {
                            return {
                                ...p,
                                tasks: (p.tasks || []).map(t => t.id === 'shield_task_audit' ? { ...t, completed: true } : t)
                            };
                        }
                        return p;
                    }));
                    addLog("Reconciliation sync: Board audit task promoted to completed state.", "SUCCESS");
                    break;
                }

                case 'shards_purge_divergence': {
                    // Cleanse shards from grid
                    setShards(prev => prev.map(s => ({ ...s, status: 'PURGED' as const, threatLevel: 'LOW' as const })));
                    addLog("Reconciliation sync: Cleansed threat radar grid to restore secure state alignment.", "SUCCESS");
                    break;
                }

                case 'shards_task_stale': {
                    setProjects(prev => prev.map(p => {
                        if (p.title === 'Sovereign Shield') {
                            return {
                                ...p,
                                tasks: (p.tasks || []).map(t => t.id === 'shield_task_purge' ? { ...t, completed: true } : t)
                            };
                        }
                        return p;
                    }));
                    addLog("Reconciliation sync: Board threat purge status resolved to resolved.", "SUCCESS");
                    break;
                }

                case 'strength_crazy_discrepancy': {
                    const calculatedCrazy = Math.round(100 - shieldStrength);
                    setProjects(prev => prev.map(p => {
                        if (p.title === 'Sovereign Shield') {
                            return { ...p, crazyLevel: calculatedCrazy };
                        }
                        return p;
                    }));
                    addLog(`Reconciliation sync: Deflection state match calibrated at ${calculatedCrazy}% board alignment.`, "SUCCESS");
                    break;
                }

                default:
                    addLog("Unsupported schema healing operation requested.", 'WARN');
                    break;
            }
        } catch (e: any) {
            console.error(e);
            addLog(`Friction encountered during micro-reconciliation: ${e.message || e}`, 'WARN');
        } finally {
            setIsReconciling(false);
            setLastScanTime(new Date());
        }
    }, [setProjects, shieldProject, quantumKeys, telemetry.integrity, generateFreshKeys, patchAllVulnerabilities, setShards, shieldStrength, addLog]);

    // Force run full loop reconciliation for all discrepancies
    const reconcileAll = useCallback(async () => {
        if (divergences.length === 0) {
            addLog("No calibration deviations or active discrepancies mapped. System state fully coherent.", 'SUCCESS');
            return;
        }

        setIsReconciling(true);
        addLog(`Initiating mass state reconciliation sequence for ${divergences.length} divergences...`, 'INFO');

        try {
            // First pass: Resolve Board metrics
            const liveInt = Math.round(telemetry.integrity);
            const calculatedCrazy = Math.round(100 - shieldStrength);

            // Sync Board Core state
            if (setProjects) {
                setProjects(prev => prev.map(p => {
                    if (p.title === 'Sovereign Shield') {
                        const updatedTasks = (p.tasks || []).map((t: any) => {
                            if (t.id === 'shield_task_keys' && quantumKeys) {
                                return { ...t, completed: true };
                            }
                            if (t.id === 'shield_task_audit' && vulnerabilities.every(v => v.status === 'PATCHED')) {
                                return { ...t, completed: true };
                            }
                            if (t.id === 'shield_task_purge' && shards.every(s => s.status === 'PURGED')) {
                                return { ...t, completed: true };
                            }
                            return t;
                        });
                        return {
                            ...p,
                            fightVector: liveInt,
                            crazyLevel: calculatedCrazy,
                            tasks: updatedTasks
                        };
                    }
                    return p;
                }));
            }

            // Sync components state
            const hasStalePurge = divergences.some(d => d.id === 'shards_purge_divergence');
            const hasStaleVuls = divergences.some(d => d.id === 'audit_status_discrepancy');
            const hasStaleKeys = divergences.some(d => d.id === 'keys_mismatch' && !quantumKeys);

            if (hasStaleKeys) {
                await generateFreshKeys();
            }
            if (hasStaleVuls) {
                patchAllVulnerabilities();
            }
            if (hasStalePurge) {
                setShards(prev => prev.map(s => ({ ...s, status: 'PURGED' as const, threatLevel: 'LOW' as const })));
            }

            addLog("Autonomous State Reconciliation Complete. Calibration discrepancy index: 0.", 'SUCCESS');
        } catch (e: any) {
            console.error(e);
            addLog(`Self-healing routine was partially interrupted: ${e.message}`, 'WARN');
        } finally {
            setIsReconciling(false);
            setLastScanTime(new Date());
        }
    }, [divergences, telemetry.integrity, shieldStrength, setProjects, quantumKeys, vulnerabilities, shards, generateFreshKeys, patchAllVulnerabilities, setShards, addLog]);

    return {
        divergences,
        reconciliationScore,
        lastScanTime,
        isReconciling,
        reconcileItem,
        reconcileAll,
        runManualScan: () => setLastScanTime(new Date())
    };
};
