/**
 * ═══════════════════════════════════════════════════════════════
 * VEHICLE DOMAIN CONNECTOR
 * Vehicle domain implementation for the CPH hub.
 * ═══════════════════════════════════════════════════════════════
 */

import { DomainConnector, EventBus } from './hubCore';

// ─── VEHICLE SCHEMA ───────────────────────────────────────────────────────────
// Single source of truth for what a "vehicle" looks like in the hub.

export const VEHICLE_STATUS = {
  IDLE:        'idle',
  DISPATCHED:  'dispatched',
  IN_TRANSIT:  'in_transit',
  RETURNING:   'returning',
  MAINTENANCE: 'maintenance',
  OFFLINE:     'offline',
} as const;

export type VehicleStatusType = typeof VEHICLE_STATUS[keyof typeof VEHICLE_STATUS];

export const VEHICLE_TYPE = {
  SCOUT:       'scout',       // fast, low-payload, long-range recon
  HAULER:      'hauler',      // high-payload, short-range transport
  RELAY:       'relay',       // comms bridge, stays in field
  SPECIALIST:  'specialist',  // domain-specific, assigned per mission
} as const;

export type VehicleTypeType = typeof VEHICLE_TYPE[keyof typeof VEHICLE_TYPE];

export interface VehicleRecord {
  id: string;
  label: string;
  type: VehicleTypeType;
  status: VehicleStatusType;
  health: number;           // 0–100
  fuel: number;             // 0–100 %
  payload: number;          // 0–100 % capacity used
  location: { zone: string; x: number; y: number };
  missionId: string | null;
  assignedAgent: string | null;
  odometer: number;         // total distance units
  faults: Array<{ code: string; severity: 'warn' | 'critical' }>;
  log: Array<{ msg: string; stamp: number }>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Create a new vehicle record.
 * Pure function — no side effects, fully deterministic.
 */
export function createVehicle({ id, type = VEHICLE_TYPE.SCOUT, label = '' }: { id: string; type?: VehicleTypeType; label?: string }): VehicleRecord {
  return {
    id,
    label:    label || `VH-${id.toUpperCase()}`,
    type,
    status:   VEHICLE_STATUS.IDLE,
    health:   100,
    fuel:     100,
    payload:  0,
    location: { zone: 'base', x: 0, y: 0 },
    missionId: null,
    assignedAgent: null,
    odometer: 0,
    faults:   [],
    log:      [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ─── CONNECTOR ───────────────────────────────────────────────────────────────

export class VehicleConnector extends DomainConnector {
  public _fleet: Map<string, VehicleRecord>;
  public _missions: Map<string, any>;
  public _opts: {
    initialFleetSize: number;
    fuelBurnRate: number;
    healthDriftRate: number;
    autoRefuel: boolean;
  };

  constructor(bus: EventBus, options: { 
    initialFleetSize?: number; 
    fuelBurnRate?: number; 
    healthDriftRate?: number; 
    autoRefuel?: boolean; 
  } = {}) {
    super('vehicle', 'Vehicle Domain', bus);

    this._fleet    = new Map();
    this._missions = new Map();
    this._opts = {
      initialFleetSize: options.initialFleetSize ?? 6, // changed option to 6 as requested in the guide
      fuelBurnRate:     options.fuelBurnRate     ?? 2,
      healthDriftRate:  options.healthDriftRate  ?? 0.5,
      autoRefuel:       options.autoRefuel       ?? true,
    };
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  override async onInit(): Promise<void> {
    const types = Object.values(VEHICLE_TYPE);
    for (let i = 0; i < this._opts.initialFleetSize; i++) {
      const id = `v${String(i + 1).padStart(3, '0')}`;
      const type = types[i % types.length];
      this._fleet.set(id, createVehicle({ id, type }));
    }
  }

  async onConnect(): Promise<void> {
    await new Promise(r => setTimeout(r, 120));
    this._log('Vehicle domain connected. Fleet initialised.');
  }

  override async onDisconnect(): Promise<void> {
    for (const v of this._fleet.values()) {
      if (v.status === VEHICLE_STATUS.DISPATCHED ||
          v.status === VEHICLE_STATUS.IN_TRANSIT) {
        this._updateVehicle(v.id, { status: VEHICLE_STATUS.RETURNING });
      }
    }
  }

  override async onTick(): Promise<number> {
    const now = Date.now();

    for (const v of this._fleet.values()) {
      if (v.status === VEHICLE_STATUS.OFFLINE) continue;

      // Burn fuel for active vehicles
      if (v.status === VEHICLE_STATUS.DISPATCHED || v.status === VEHICLE_STATUS.IN_TRANSIT) {
        const newFuel   = Math.max(0, v.fuel   - this._opts.fuelBurnRate);
        const newHealth = Math.max(0, v.health - this._opts.healthDriftRate);
        const newOdo    = v.odometer + Math.round(Math.random() * 10 + 5);
        this._updateVehicle(v.id, { fuel: newFuel, health: newHealth, odometer: newOdo });

        // Auto-recall when fuel critical
        if (newFuel < 15) {
          this._updateVehicle(v.id, { status: VEHICLE_STATUS.RETURNING });
          this._appendLog(v.id, 'FUEL_CRITICAL: auto-recall triggered');
        }
      }

      // Auto-refuel idle vehicles
      if (this._opts.autoRefuel && v.status === VEHICLE_STATUS.IDLE && v.fuel < 100) {
        const refuelled = Math.min(100, v.fuel + 10);
        this._updateVehicle(v.id, { fuel: refuelled });
      }

      // Vehicles returning arrive at base when health still > 0
      if (v.status === VEHICLE_STATUS.RETURNING) {
        this._updateVehicle(v.id, {
          status: VEHICLE_STATUS.IDLE,
          location: { zone: 'base', x: 0, y: 0 },
          missionId: null,
        });
        this._appendLog(v.id, 'RETURNED_TO_BASE');
      }
    }

    // Recalculate connector health = mean fleet health
    const healths = [...this._fleet.values()].map(v => v.health);
    const meanHealth = healths.reduce((a, b) => a + b, 0) / healths.length;

    this.bus.emit('vehicle.tick', { fleet: this.fleetSnapshot(), stamp: now });
    return Math.round(meanHealth);
  }

  // ── Operations (callable via connector.exec('opName', params)) ───────────────

  /**
   * op_dispatch — send a vehicle on a mission
   * Params: { vehicleId, missionId, destination: { zone, x, y } }
   */
  op_dispatch({ vehicleId, missionId, destination = { zone: 'field', x: 50, y: 50 } }: { 
    vehicleId: string; 
    missionId?: string; 
    destination?: { zone: string; x: number; y: number }; 
  }): { ok: boolean; missionId: string } {
    const v = this._requireVehicle(vehicleId);
    if (v.status !== VEHICLE_STATUS.IDLE) {
      throw new Error(`Vehicle ${vehicleId} is not idle (status: ${v.status})`);
    }
    if (v.fuel < 20) {
      throw new Error(`Vehicle ${vehicleId} has insufficient fuel (${v.fuel.toFixed(1)}%)`);
    }

    const mid = missionId ?? `m-${Date.now()}`;
    this._missions.set(mid, { id: mid, vehicleId, destination, startedAt: Date.now() });
    this._updateVehicle(vehicleId, {
      status:    VEHICLE_STATUS.DISPATCHED,
      missionId: mid,
      location:  destination,
    });
    this._appendLog(vehicleId, `DISPATCHED → zone:${destination.zone}`);
    this.bus.emit('vehicle.dispatched', { vehicleId, missionId: mid, destination });
    return { ok: true, missionId: mid };
  }

  /**
   * op_recall — pull a vehicle back to base immediately
   * Params: { vehicleId }
   */
  op_recall({ vehicleId }: { vehicleId: string }): { ok: boolean } {
    this._requireVehicle(vehicleId);
    this._updateVehicle(vehicleId, { status: VEHICLE_STATUS.RETURNING });
    this._appendLog(vehicleId, 'MANUAL_RECALL');
    this.bus.emit('vehicle.recalled', { vehicleId });
    return { ok: true };
  }

  /**
   * op_diagnose — return full vehicle record + fault analysis
   * Params: { vehicleId }
   */
  op_diagnose({ vehicleId }: { vehicleId: string }): { vehicle: VehicleRecord; faults: Array<{ code: string; severity: 'warn' | 'critical' }> } {
    const v = this._requireVehicle(vehicleId);
    const faults: Array<{ code: string; severity: 'warn' | 'critical' }> = [];
    if (v.fuel   < 25) faults.push({ code: 'LOW_FUEL',   severity: 'warn' });
    if (v.health < 40) faults.push({ code: 'LOW_HEALTH', severity: 'critical' });
    if (v.health < 70) faults.push({ code: 'DEGRADED',   severity: 'warn' });
    return { vehicle: { ...v }, faults };
  }

  /**
   * op_addVehicle — provision a new vehicle into the fleet
   * Params: { id, type, label }
   */
  op_addVehicle({ id, type, label }: { id: string; type?: VehicleTypeType; label?: string }): { ok: boolean; vehicle: VehicleRecord } {
    if (!id) throw new Error('id is required');
    if (this._fleet.has(id)) throw new Error(`Vehicle "${id}" already exists`);
    const v = createVehicle({ id, type, label });
    this._fleet.set(id, v);
    this.bus.emit('vehicle.added', { vehicleId: id });
    return { ok: true, vehicle: { ...v } };
  }

  /**
   * op_retire — permanently remove a vehicle
   * Params: { vehicleId }
   */
  op_retire({ vehicleId }: { vehicleId: string }): { ok: boolean } {
    this._requireVehicle(vehicleId);
    this._fleet.delete(vehicleId);
    this.bus.emit('vehicle.retired', { vehicleId });
    return { ok: true };
  }

  // ── Query helpers ────────────────────────────────────────────────────────────

  fleetSnapshot(): VehicleRecord[] {
    return [...this._fleet.values()].map(v => ({ ...v }));
  }

  missionSnapshot(): any[] {
    return [...this._missions.values()];
  }

  getVehicle(id: string): VehicleRecord | null {
    return this._fleet.has(id) ? { ...this._fleet.get(id)! } : null;
  }

  // ── Internal helpers ─────────────────────────────────────────────────────────

  _requireVehicle(id: string): VehicleRecord {
    const v = this._fleet.get(id);
    if (!v) throw new Error(`Unknown vehicle: ${id}`);
    return v;
  }

  _updateVehicle(id: string, patch: Partial<VehicleRecord>): void {
    const v = this._fleet.get(id);
    if (v) {
      Object.assign(v, patch, { updatedAt: Date.now() });
    }
  }

  _appendLog(vehicleId: string, msg: string): void {
    const v = this._fleet.get(vehicleId);
    if (v) {
      v.log.push({ msg, stamp: Date.now() });
      if (v.log.length > 20) v.log.shift();
    }
  }

  _log(msg: string): void {
    console.log(`[VehicleConnector] ${msg}`);
  }
}
