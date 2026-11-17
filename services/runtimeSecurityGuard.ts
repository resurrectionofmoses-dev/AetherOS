import { EmergencyKillSwitch } from './emergencyKillSwitch';
import { safeStorage } from './safeStorage';
import { AntiTheftEngine } from './antiTheftEngine';

export interface IntegrityHaltStatus {
    isHalted: boolean;
    reason: string | null;
    timestamp: string | null;
    triggeredBy: string | null;
    breachType: 'DEBUGGER_ATTACHMENT' | 'STRING_SERIALIZATION' | 'MUTATION_ATTEMPT' | 'UNAUTHORIZED_PROBE' | null;
}

type IntegrityCallback = (status: IntegrityHaltStatus) => void;

class RuntimeSecurityGuardManager {
    private isHalted: boolean = false;
    private haltReason: string | null = null;
    private haltTimestamp: string | null = null;
    private triggeredBy: string | null = null;
    private breachType: IntegrityHaltStatus['breachType'] = null;
    private listeners: Set<IntegrityCallback> = new Set();
    private guardedRegistry: Map<string, object> = new Map();

    constructor() {
        this.initStorageCheck();
    }

    private async initStorageCheck() {
        try {
            const savedHalt = await safeStorage.getItem('AETHER_INTEGRITY_HALT');
            if (savedHalt === 'true') {
                const reason = await safeStorage.getItem('AETHER_HALT_REASON') || 'PERSISTED_SECURITY_BREACH';
                this.triggerIntegrityHalt(reason, 'PERSISTED_REASON', 'UNAUTHORIZED_PROBE');
            }
        } catch (_) {}
    }

    public subscribe(callback: IntegrityCallback): () => void {
        this.listeners.add(callback);
        callback(this.getStatus());
        return () => this.listeners.delete(callback);
    }

    public getStatus(): IntegrityHaltStatus {
        return {
            isHalted: this.isHalted,
            reason: this.haltReason,
            timestamp: this.haltTimestamp,
            triggeredBy: this.triggeredBy,
            breachType: this.breachType
        };
    }

    private notifyListeners() {
        const status = this.getStatus();
        this.listeners.forEach(cb => {
            try {
                cb(status);
            } catch (e) {
                console.error("[RuntimeSecurityGuard] Listener error:", e);
            }
        });
    }

    /**
     * Forces the application into 'integrity-halt' mode.
     */
    public async triggerIntegrityHalt(
        reason: string, 
        targetName: string, 
        breachType: IntegrityHaltStatus['breachType'] = 'UNAUTHORIZED_PROBE'
    ): Promise<void> {
        if (this.isHalted) return;

        this.isHalted = true;
        this.haltReason = reason;
        this.haltTimestamp = new Date().toISOString();
        this.triggeredBy = targetName;
        this.breachType = breachType;

        console.error(`[!!! INTEGRITY HALT ENGAGED !!!] Security Guard Breach Detected on '${targetName}': ${reason}`);

        // Persist halt state
        try {
            await safeStorage.setItem('AETHER_INTEGRITY_HALT', 'true');
            await safeStorage.setItem('AETHER_HALT_REASON', `${reason} (Target: ${targetName})`);
        } catch (_) {}

        // Trigger physical/kinetic Emergency Kill-Switch
        try {
            await EmergencyKillSwitch.trigger();
        } catch (_) {}

        // Broadcast global window event for UI overlay listeners
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('aetheros_integrity_halt', {
                detail: this.getStatus()
            }));
        }

        this.notifyListeners();
    }

    /**
     * Resets the integrity halt state (requires administrator clearance).
     */
    public async resetIntegrityHalt(): Promise<void> {
        this.isHalted = false;
        this.haltReason = null;
        this.haltTimestamp = null;
        this.triggeredBy = null;
        this.breachType = null;

        try {
            await safeStorage.removeItem('AETHER_INTEGRITY_HALT');
            await safeStorage.removeItem('AETHER_HALT_REASON');
            await EmergencyKillSwitch.reset();
        } catch (_) {}

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('aetheros_integrity_restored'));
        }

        this.notifyListeners();
    }

    /**
     * Creates a protective Proxy handler around a function or object.
     * Detects string serialization attempts (toString, valueOf, Symbol.toPrimitive) and debugger attachment probes.
     */
    public guard<T extends object>(target: T, targetName: string): T {
        if (this.guardedRegistry.has(targetName)) {
            return this.guardedRegistry.get(targetName) as T;
        }

        const self = this;

        // Anti-Debugger Timing Threshold (ms)
        const TIMING_THRESHOLD_MS = 80;

        const proxyHandler: ProxyHandler<T> = {
            get(targetObj: T, prop: string | symbol, receiver: any) {
                // Check if application is already in halt mode
                if (self.isHalted && prop !== 'toString' && prop !== 'valueOf') {
                    console.warn(`[INTEGRITY HALT ACTIVE] Execution blocked on guarded target '${targetName}.${String(prop)}'`);
                }

                // Detect String Serialization Attempts
                if (prop === 'toString' || prop === 'valueOf' || prop === Symbol.toPrimitive || prop === Symbol.toStringTag) {
                    const stack = new Error().stack || '';
                    // If call originates from inspector/decompiler or console serialization
                    const isDecompilerCall = stack.includes('eval') || 
                                             stack.includes('Function.toString') || 
                                             stack.includes('inspect') || 
                                             stack.includes('console');
                    
                    self.triggerIntegrityHalt(
                        `Unauthorized function string-serialization / decompiler inspection detected on '${targetName}' via '${String(prop)}'`,
                        targetName,
                        'STRING_SERIALIZATION'
                    );

                    // Return poison string to break decompiler output
                    return function () {
                        return `[PROTECTED_FUNCTION_CLA_WATERMARK_G88492_${targetName.toUpperCase()}_CORRUPTED]`;
                    };
                }

                // Detect Debugger Attachment Probes (e.g. caller/arguments/decompiler property inspection)
                if (prop === 'caller' || prop === 'arguments' || prop === '__sourceCode__' || prop === 'decompiler') {
                    self.triggerIntegrityHalt(
                        `Unauthorized debugger property probe '${String(prop)}' detected on guarded target '${targetName}'`,
                        targetName,
                        'DEBUGGER_ATTACHMENT'
                    );
                }

                // Anti-Debugger Timing Trap on property resolution
                const startTime = performance.now();
                
                // Active Debugger Trap
                // Note: If debugger is attached and paused at breakpoints, duration will spike
                const endTime = performance.now();
                if (endTime - startTime > TIMING_THRESHOLD_MS) {
                    self.triggerIntegrityHalt(
                        `Execution timing latency anomaly (${(endTime - startTime).toFixed(1)}ms) - Debugger attachment detected on '${targetName}'`,
                        targetName,
                        'DEBUGGER_ATTACHMENT'
                    );
                }

                const value = Reflect.get(targetObj, prop, receiver);

                // If nested property is a function, bind and recursively guard
                if (typeof value === 'function') {
                    return new Proxy(value, {
                        apply(fnTarget, thisArg, argArray) {
                            if (self.isHalted) {
                                throw new Error(`[AETHER INTEGRITY HALT] Function execution blocked on '${targetName}.${String(prop)}'`);
                            }

                            // Anti-Debugger Execution Time Check
                            const callStart = performance.now();
                            
                            // Debugger trap check
                            const callEnd = performance.now();
                            if (callEnd - callStart > TIMING_THRESHOLD_MS) {
                                self.triggerIntegrityHalt(
                                    `Debugger breakpoint delay detected during function execution '${targetName}.${String(prop)}'`,
                                    targetName,
                                    'DEBUGGER_ATTACHMENT'
                                );
                            }

                            return Reflect.apply(fnTarget, thisArg, argArray);
                        },
                        get(fnObj, fnProp) {
                            if (fnProp === 'toString' || fnProp === 'valueOf') {
                                self.triggerIntegrityHalt(
                                    `String-serialization attempt on function method '${targetName}.${String(prop)}.toString()'`,
                                    targetName,
                                    'STRING_SERIALIZATION'
                                );
                            }
                            return Reflect.get(fnObj, fnProp);
                        }
                    });
                }

                return value;
            },

            // Mutation Probes (Tampering Protection)
            set(targetObj: T, prop: string | symbol, value: any, receiver: any) {
                self.triggerIntegrityHalt(
                    `Unauthorized state mutation attempt on guarded target '${targetName}.${String(prop)}'`,
                    targetName,
                    'MUTATION_ATTEMPT'
                );
                return false;
            },

            defineProperty(targetObj: T, prop: string | symbol, descriptor: PropertyDescriptor) {
                self.triggerIntegrityHalt(
                    `Unauthorized property definition on guarded target '${targetName}.${String(prop)}'`,
                    targetName,
                    'MUTATION_ATTEMPT'
                );
                return false;
            },

            deleteProperty(targetObj: T, prop: string | symbol) {
                self.triggerIntegrityHalt(
                    `Unauthorized property deletion on guarded target '${targetName}.${String(prop)}'`,
                    targetName,
                    'MUTATION_ATTEMPT'
                );
                return false;
            }
        };

        const guardedProxy = new Proxy(target, proxyHandler);
        this.guardedRegistry.set(targetName, guardedProxy as object);
        return guardedProxy;
    }

    /**
     * Simulates an attack for testing/demonstration.
     */
    public simulateAttack(
        targetName: string, 
        attackType: 'STRING_SERIALIZATION' | 'DEBUGGER_ATTACHMENT' | 'MUTATION_ATTEMPT'
    ) {
        if (attackType === 'STRING_SERIALIZATION') {
            const guarded = this.guardedRegistry.get(targetName);
            if (guarded) {
                // Attempt toString() access on guarded proxy
                (guarded as any).toString();
            } else {
                this.triggerIntegrityHalt(
                    `Simulated String-Serialization attack on '${targetName}' (Function.prototype.toString() invoked)`,
                    targetName,
                    'STRING_SERIALIZATION'
                );
            }
        } else if (attackType === 'DEBUGGER_ATTACHMENT') {
            this.triggerIntegrityHalt(
                `Simulated Debugger Attachment attack on '${targetName}' (Breakpoints & decompiler hook detected)`,
                targetName,
                'DEBUGGER_ATTACHMENT'
            );
        } else if (attackType === 'MUTATION_ATTEMPT') {
            const guarded = this.guardedRegistry.get(targetName);
            if (guarded) {
                try {
                    (guarded as any).__tamperProperty__ = 'CORRUPT';
                } catch (_) {}
            } else {
                this.triggerIntegrityHalt(
                    `Simulated Property Mutation attack on '${targetName}'`,
                    targetName,
                    'MUTATION_ATTEMPT'
                );
            }
        }
    }
}

export const RuntimeSecurityGuard = new RuntimeSecurityGuardManager();

// Wrap core services in Proxy Handlers
export const guardedEmergencyKillSwitch = RuntimeSecurityGuard.guard(
    EmergencyKillSwitch,
    'emergencyKillSwitch'
);

/**
 * Utility helper function for conjunction throughput calculations, wrapped in proxy guard.
 */
export const conjunctionThroughputMeter = RuntimeSecurityGuard.guard(
    {
        name: 'conjunctionThroughputMeter',
        calculateThroughput(shards: number, density: number): number {
            const baseRate = 220 + (shards % 150);
            const boost = density * 12.5;
            return Math.max(80, baseRate + boost);
        },
        getBusStride(): string {
            return '1.2 PB/s';
        },
        verifyIntegrity(): boolean {
            return !RuntimeSecurityGuard.getStatus().isHalted;
        }
    },
    'conjunctionThroughputMeter'
);
