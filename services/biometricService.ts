import { useState, useEffect, useCallback, useRef } from 'react';

export interface BiometricData {
    typingSpeed: number; // WPM
    accuracy: number;
    jitter: number; // Mouse movement variance
    keystrokeEntropy: number; // Timing variance
    learningProgress: number; // 0-100
    pressureIntensity: number; // Simulated from dwell/force
}

class BiometricIntelligence {
    private keystrokeTimings: number[] = [];
    private mousePositions: { x: number, y: number, t: number }[] = [];
    private lastKeystrokeTime: number = 0;
    private keyDepressTimes: Map<string, number> = new Map();
    private dwellTimings: number[] = [];
    private totalChars: number = 0;
    private currentForce: number = 0;
    private startTime: number = Date.now();

    public recordKeyDown(key: string) {
        this.keyDepressTimes.set(key, Date.now());
        
        const now = Date.now();
        if (this.lastKeystrokeTime > 0) {
            const delta = now - this.lastKeystrokeTime;
            if (delta < 2000) {
                this.keystrokeTimings.push(delta);
                if (this.keystrokeTimings.length > 100) this.keystrokeTimings.shift();
            }
        }
        this.lastKeystrokeTime = now;
        this.totalChars++;
    }

    public recordKeyUp(key: string) {
        const start = this.keyDepressTimes.get(key);
        if (start) {
            const dwell = Date.now() - start;
            this.dwellTimings.push(dwell);
            if (this.dwellTimings.length > 100) this.dwellTimings.shift();
            this.keyDepressTimes.delete(key);
        }
    }

    public recordPointerForce(force: number) {
        if (force > 0) {
            this.currentForce = force;
        }
    }

    public recordMouseMove(x: number, y: number) {
        this.mousePositions.push({ x, y, t: Date.now() });
        if (this.mousePositions.length > 50) this.mousePositions.shift();
    }

    public getReport(): BiometricData {
        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        const wpm = elapsedMinutes > 0 ? (this.totalChars / 5) / elapsedMinutes : 0;
        
        // Calculate Keystroke Jitter (Entropy)
        const avgTiming = this.keystrokeTimings.reduce((a, b) => a + b, 0) / (this.keystrokeTimings.length || 1);
        const variance = this.keystrokeTimings.reduce((a, b) => a + Math.pow(b - avgTiming, 2), 0) / (this.keystrokeTimings.length || 1);
        
        // Calculate Mouse Jitter
        let mouseJitter = 0;
        if (this.mousePositions.length > 2) {
            for (let i = 1; i < this.mousePositions.length; i++) {
                const d = Math.sqrt(
                    Math.pow(this.mousePositions[i].x - this.mousePositions[i-1].x, 2) + 
                    Math.pow(this.mousePositions[i].y - this.mousePositions[i-1].y, 2)
                );
                mouseJitter += d;
            }
            mouseJitter /= this.mousePositions.length;
        }

        const progress = Math.min(100, (this.totalChars / 500) * 100 + (this.mousePositions.length / 50) * 50);

        const avgDwell = this.dwellTimings.reduce((a, b) => a + b, 0) / (this.dwellTimings.length || 1);
        const pressureScore = Math.min(100, (avgDwell / 150) * 50 + (this.currentForce * 50));

        return {
            typingSpeed: Math.round(wpm),
            accuracy: 98,
            jitter: Math.round(mouseJitter * 10) / 10,
            keystrokeEntropy: Math.round(Math.sqrt(variance)),
            learningProgress: Math.round(progress),
            pressureIntensity: Math.round(pressureScore)
        };
    }
}

export const biometricEngine = new BiometricIntelligence();
