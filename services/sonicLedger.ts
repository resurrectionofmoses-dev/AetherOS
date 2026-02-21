
import { v4 as uuidv4 } from 'uuid';

/**
 * --- SONIC LEDGER: THE RESONANCE ENGINE ---
 * Protocol: 0x03E2_SONIC
 * Transposes moves into Decibels (dB) and Frequencies (Hz).
 * Every letter committed is a spectral shift.
 */

export interface SonicPulse {
    id: string;
    index: number;
    frequency: number; // Hz
    loudness: number;  // dB
    label: string;
    timestamp: number;
    phase: number;     // 0 to 2PI
}

class SonicLedgerEngine {
    private pulses: SonicPulse[] = [];
    private currentIndex: number = 0;
    private listeners: ((pulse: SonicPulse) => void)[] = [];

    // Reference levels
    private readonly BASE_FREQ = 432; // The "Healing" frequency
    private readonly DB_REF = 0.00002; // Standard reference pressure

    public record(type: 'KEY' | 'CLICK' | 'COMMAND', label: string, weight: number): SonicPulse {
        this.currentIndex++;
        
        // Logarithmic Loudness: dB = 10 * log10(Weight / Ref)
        const loudness = parseFloat((10 * Math.log10(weight / 0.1 + 1)).toFixed(2));
        
        // Frequency mapping: Higher index/weight = shifting spectral content
        const frequency = this.BASE_FREQ + (this.currentIndex % 100) + (weight * 10);

        const pulse: SonicPulse = {
            id: `PULSE_${this.currentIndex.toString(16).toUpperCase()}_${uuidv4().slice(0, 4)}`,
            index: this.currentIndex,
            frequency,
            loudness,
            label,
            timestamp: Date.now(),
            phase: (Math.random() * Math.PI * 2)
        };

        this.pulses.push(pulse);
        if (this.pulses.length > 500) this.pulses.shift();

        this.notify(pulse);
        return pulse;
    }

    public subscribe(fn: (pulse: SonicPulse) => void) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    }

    private notify(pulse: SonicPulse) {
        this.listeners.forEach(l => l(pulse));
    }

    public getHistory() {
        return [...this.pulses].reverse();
    }

    public getTotalPressure(): string {
        const sum = this.pulses.reduce((acc, p) => acc + p.loudness, 0);
        return (sum / (this.pulses.length || 1)).toFixed(2);
    }

    public getSpectralStride(): number {
        // Returns the current "Conductance Stride" in Hz
        return this.pulses[0]?.frequency || this.BASE_FREQ;
    }
}

export const sonicLedger = new SonicLedgerEngine();
