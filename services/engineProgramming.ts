import { v4 as uuidv4 } from 'uuid';

export interface ExhaustProfile {
  baseTone: number; // Hz * 10 (e.g., 950 = 95.0 Hz)
  harmonics: number[]; // 5 harmonic values
  volumeCurve: number[]; // 3 points: [idle, mid, high] (0-1000 representing 100%)
  decelPops: boolean;
  popIntensity: number; // 0-100
  popFrequency: number; // pops per minute on decel
}

export interface EngineSpec {
  cylinderCount: number;
  displacement: number; // cc
  maxRPM: number;
  compressionRatio: number; // ratio * 100 (e.g., 1050 = 10.5:1)
  
  // Software parameters
  fuelMap: number[][]; // 16x16 grid, values 0-255
  ignitionTiming: number[]; // 16 values, degrees * 10
  throttleResponse: number; // 0-1000
  revLimiter: number; // RPM
  exhaustNote: ExhaustProfile;

  // Security & Audit
  checksumHash: string;
  modificationHistory: ModificationRecord[];
}

export interface ModificationRecord {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  modificationType: string;
  beforeState: string; // JSON string of spec
  afterState: string; // JSON string of spec
  cphCost: number;
  authorizationToken: string;
  masterKeyUsed: string;
}

export interface MasterKeyRecord {
  keyId: string;
  keyHash: string;
  permissions: string[];
  ownerVIN: string;
  revoked: boolean;
}

export class EngineCalculator {
  // Pure TS simple hash code to represent SHA-256 deteriministically
  static calculateChecksum(spec: Partial<EngineSpec>): string {
    const dataString = JSON.stringify({
      fuelMap: spec.fuelMap,
      ignitionTiming: spec.ignitionTiming,
      throttleResponse: spec.throttleResponse,
      revLimiter: spec.revLimiter,
      exhaustNote: spec.exhaustNote
    });

    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    
    // Convert to elegant 64-character deterministic hex string
    const hexParts: string[] = [];
    for (let i = 0; i < 8; i++) {
      const segment = Math.abs((hash ^ (i * 0x7fffffff)) % 16777216);
      hexParts.push(segment.toString(16).padStart(8, '0'));
    }
    return hexParts.join('');
  }

  static calculateHMAC(payload: string, key: string): string {
    const combined = payload + '::' + key;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hexParts: string[] = [];
    for (let i = 0; i < 8; i++) {
      const segment = Math.abs((hash ^ (i * 0x55555555)) % 16777216);
      hexParts.push(segment.toString(16).padStart(8, '0'));
    }
    return hexParts.join('');
  }

  static generateBaseEngineSpec(): EngineSpec {
    // 16x16 standard fuel map
    const fuelMap: number[][] = Array.from({ length: 16 }, (_, tIndex) => {
      const throttlePct = (tIndex * 100) / 15;
      return Array.from({ length: 16 }, (_, rIndex) => {
        // Linear increase with throttle and slight increase with RPM
        const base = 120 + Math.round((throttlePct / 100) * 80) + Math.round((rIndex * 55) / 15);
        return Math.min(255, base);
      });
    });

    // 16 step ignition map (RPM)
    const ignitionTiming = [
      100, 110, 120, 130, 150, 170, 190, 210, 
      230, 250, 260, 270, 280, 280, 280, 280
    ];

    const exhaustNote: ExhaustProfile = {
      baseTone: 650, // 65.0 Hz
      harmonics: [80, 50, 30, 15, 5],
      volumeCurve: [150, 420, 650], // custom curve [idle, mid, high]
      decelPops: false,
      popIntensity: 0,
      popFrequency: 0
    };

    const spec: Partial<EngineSpec> = {
      cylinderCount: 4,
      displacement: 1998,
      maxRPM: 7000,
      compressionRatio: 1050, // 10.5:1
      fuelMap,
      ignitionTiming,
      throttleResponse: 350, // 35.0%
      revLimiter: 7000,
      exhaustNote,
      modificationHistory: []
    };

    spec.checksumHash = this.calculateChecksum(spec);
    return spec as EngineSpec;
  }

  static validateModification(currentSpec: EngineSpec, modifications: Partial<EngineSpec>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation checks
    if (modifications.revLimiter !== undefined) {
      if (modifications.revLimiter < 2000 || modifications.revLimiter > currentSpec.maxRPM + 500) {
        errors.push(`Rev limiter must be between 2000 and ${currentSpec.maxRPM + 500} RPM.`);
      }
    }

    if (modifications.ignitionTiming !== undefined) {
      modifications.ignitionTiming.forEach((val, idx) => {
        if (val < -100 || val > 400) { // -10.0 to 40.0 degrees
          errors.push(`Ignition timing at step ${idx} is raw value ${val}, out of bounds (-10.0° to +40.0°)`);
        }
      });
    }

    if (modifications.fuelMap !== undefined) {
      modifications.fuelMap.forEach((row, rIdx) => {
        row.forEach((val, cIdx) => {
          if (val < 50 || val > 240) {
            errors.push(`Fuel map at [${rIdx}][${cIdx}] is ${val}, must be between 50 and 240.`);
          }
        });
      });
    }

    if (modifications.throttleResponse !== undefined) {
      if (modifications.throttleResponse < 100 || modifications.throttleResponse > 1000) {
        errors.push(`Throttle response ${modifications.throttleResponse} is out of bounds (10% to 100%).`);
      }
    }

    if (modifications.exhaustNote !== undefined) {
      const exc = modifications.exhaustNote;
      if (exc.baseTone < 200 || exc.baseTone > 1500) {
        errors.push(`Exhaust fundamental base tone ${exc.baseTone} must be within 20.0Hz and 150.0Hz.`);
      }
      exc.volumeCurve.forEach((vol, idx) => {
        if (vol < 0 || vol > 950) {
          errors.push(`Exhaust sound volume point ${idx} (${vol}) exceeds safe exposure maximum 95%.`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export class MasterKeyManager {
  static generateSecretKey(): string {
    return uuidv4().replace(/-/g, '').substring(0, 32);
  }

  static hashSecretKey(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  static createKeyRecord(vin: string, permissions: string[]): { secretKey: string; record: MasterKeyRecord } {
    const secretKey = this.generateSecretKey();
    const keyHash = this.hashSecretKey(secretKey);
    const record: MasterKeyRecord = {
      keyId: 'mk_' + uuidv4().substring(0, 8),
      keyHash,
      permissions,
      ownerVIN: vin,
      revoked: false
    };
    return { secretKey, record };
  }
}
