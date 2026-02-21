
import { v4 as uuidv4 } from 'uuid';
import type { QuantumMove } from '../types';

/**
 * --- QUANTUM LEDGER: THE MOVE ENGINE ---
 * Protocol: 0x03E2_QUANTUM
 * Tracks every discrete action (keystroke, click, command)
 * to ensure absolute architectural lineage.
 */
class QuantumLedgerEngine {
    private moves: QuantumMove[] = [];
    private currentIndex: number = 0;
    private listeners: ((move: QuantumMove) => void)[] = [];

    constructor() {
        this.moves = [];
    }

    public record(type: QuantumMove['type'], label: string, weight: number = 1): QuantumMove {
        this.currentIndex++;
        const move: QuantumMove = {
            id: `MOVE_${this.currentIndex.toString(16).toUpperCase()}_${uuidv4().slice(0, 4)}`,
            index: this.currentIndex,
            type,
            label,
            timestamp: Date.now(),
            weight
        };

        this.moves.push(move);
        // Keep memory lean: row into a 500-move limit
        if (this.moves.length > 500) this.moves.shift();

        this.notify(move);
        return move;
    }

    public subscribe(fn: (move: QuantumMove) => void) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    }

    private notify(move: QuantumMove) {
        this.listeners.forEach(l => l(move));
    }

    public getHistory() {
        return [...this.moves].reverse();
    }

    public getTotalCount() {
        return this.currentIndex;
    }

    public getByteStride() {
        return (this.moves.reduce((acc, m) => acc + m.weight, 0) / 1024).toFixed(3);
    }
}

export const quantumLedger = new QuantumLedgerEngine();
