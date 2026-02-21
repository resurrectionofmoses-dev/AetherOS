
import { v4 as uuidv4 } from 'uuid';

/**
 * --- CELLULAR ENGINE: THE QUANTUM TICK ---
 * Protocol: 0x03E2_CELLULAR
 * Manages the transition: G1 -> S -> G2 -> M
 * Snaps all conduction to discrete biological intervals.
 */

export type CellPhase = 'G1' | 'S' | 'G2' | 'M';

export interface QuantumCycleState {
    phase: CellPhase;
    progress: number; // 0-100 within phase
    explanation: string;
    conductance: number; // 7, -7, +7, 8
}

class CellularEngine {
    private currentPhase: CellPhase = 'G1';
    private progress: number = 0;
    private listeners: ((state: QuantumCycleState) => void)[] = [];

    private readonly PHASE_CONFIG: Record<CellPhase, { duration: number, label: string, conductance: number }> = {
        'G1': { duration: 6000, label: 'ANNIHILATION: COMMIT TO DIVISION', conductance: 7 },
        'S':  { duration: 8000, label: 'VOID: DNA REPLICATION', conductance: -7 },
        'G2': { duration: 4000, label: 'QUANTIZATION: PREPARE MITOSIS', conductance: 7 },
        'M':  { duration: 2000, label: 'MANIFESTATION: PHYSICAL DIVISION', conductance: 8 }
    };

    constructor() {
        this.start();
    }

    private start() {
        const tick = () => {
            const config = this.PHASE_CONFIG[this.currentPhase];
            this.progress += (100 / (config.duration / 100)); // Incremental step

            if (this.progress >= 100) {
                this.progress = 0;
                this.transition();
            }

            this.notify();
            setTimeout(tick, 100);
        };
        tick();
    }

    private transition() {
        const phases: CellPhase[] = ['G1', 'S', 'G2', 'M'];
        const nextIdx = (phases.indexOf(this.currentPhase) + 1) % phases.length;
        this.currentPhase = phases[nextIdx];
    }

    private notify() {
        const state: QuantumCycleState = {
            phase: this.currentPhase,
            progress: Math.floor(this.progress),
            explanation: this.PHASE_CONFIG[this.currentPhase].label,
            conductance: this.PHASE_CONFIG[this.currentPhase].conductance
        };
        this.listeners.forEach(l => l(state));
    }

    public subscribe(fn: (state: QuantumCycleState) => void) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    }

    public getState(): QuantumCycleState {
        return {
            phase: this.currentPhase,
            progress: Math.floor(this.progress),
            explanation: this.PHASE_CONFIG[this.currentPhase].label,
            conductance: this.PHASE_CONFIG[this.currentPhase].conductance
        };
    }
}

export const cellularEngine = new CellularEngine();
