/**
 * ═══════════════════════════════════════════════════════════════
 * HUB CORE — Central Processing Hub
 * Domain connector registry, event bus, and base connector class
 * ═══════════════════════════════════════════════════════════════
 */

// ─── EVENT BUS ───────────────────────────────────────────────────────────────
// Lightweight pub/sub so connectors and agents communicate without coupling

export interface EventEnvelope {
  event: string;
  payload: any;
  stamp: number;
}

export class EventBus {
  private _listeners: Map<string, Set<Function>>;

  constructor() {
    this._listeners = new Map();
  }

  on(event: string, fn: Function): () => void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(fn);
    return () => this._listeners.get(event)?.delete(fn); // returns unsubscribe fn
  }

  emit(event: string, payload: any): void {
    const stamp = Date.now();
    const envelope: EventEnvelope = { event, payload, stamp };
    
    // Exact match
    (this._listeners.get(event) || new Set<Function>()).forEach(fn => fn(envelope));
    // Wildcard match
    (this._listeners.get('*') || new Set<Function>()).forEach(fn => fn(envelope));
  }
}

// ─── DOMAIN CONNECTOR BASE ───────────────────────────────────────────────────
// Every domain connector extends this. Enforces a contract the hub can rely on.

export abstract class DomainConnector {
  public id: string;
  public name: string;
  public bus: EventBus;
  public status: 'idle' | 'connecting' | 'active' | 'error' | 'offline'; // idle | connecting | active | error | offline
  public health: number; // 0–100 numeric health score
  public errors: Array<{ msg: string; stamp: number }>;
  public _agents: Map<string, any>; // agentId → agent
  public _connectedAt: number | null;

  /**
   * @param id        - unique connector ID (e.g. "vehicle")
   * @param name      - human label
   * @param bus     - shared hub event bus
   */
  constructor(id: string, name: string, bus: EventBus) {
    this.id     = id;
    this.name   = name;
    this.bus    = bus;
    this.status = 'idle';
    this.health = 100;
    this.errors = [];
    this._agents = new Map();
    this._connectedAt = null;
  }

  // ── Lifecycle hooks (override in subclass) ──────────────────────────────────

  /** Called once when hub first registers this connector. */
  async onInit(): Promise<void> { /* override */ }

  /** Called to establish the domain connection. */
  abstract onConnect(): Promise<void>;

  /** Called on graceful shutdown. */
  async onDisconnect(): Promise<void> { /* override */ }

  /** Called every hub tick (default: 5 s). Return updated health 0–100. */
  async onTick(): Promise<number> { return this.health; }

  // ── Public API used by the hub ──────────────────────────────────────────────

  async connect(): Promise<void> {
    this._setStatus('connecting');
    try {
      await this.onConnect();
      this._connectedAt = Date.now();
      this._setStatus('active');
      this.bus.emit(`connector.${this.id}.connected`, { id: this.id });
    } catch (err: any) {
      this._recordError(err);
      this._setStatus('error');
    }
  }

  async disconnect(): Promise<void> {
    await this.onDisconnect();
    this._setStatus('idle');
    this._connectedAt = null;
    this.bus.emit(`connector.${this.id}.disconnected`, { id: this.id });
  }

  async tick(): Promise<void> {
    if (this.status !== 'active') return;
    try {
      this.health = Math.max(0, Math.min(100, await this.onTick()));
      this.bus.emit(`connector.${this.id}.tick`, { id: this.id, health: this.health });
    } catch (err: any) {
      this._recordError(err);
    }
  }

  /** Expose a typed operation to the hub (e.g. "dispatch", "diagnose"). */
  async exec(operation: string, params: any = {}): Promise<any> {
    const handler = (this as any)[`op_${operation}`];
    if (!handler) {
      throw new Error(`Unknown operation: ${operation} on ${this.id}`);
    }
    return handler.call(this, params);
  }

  /** Return the connector's full status snapshot. */
  snapshot(): any {
    return {
      id:          this.id,
      name:        this.name,
      status:      this.status,
      health:      this.health,
      agents:      this._agents.size,
      connectedAt: this._connectedAt,
      uptime:      this._connectedAt ? Date.now() - this._connectedAt : 0,
      errors:      this.errors.slice(-5),   // last 5 only
    };
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  _setStatus(s: 'idle' | 'connecting' | 'active' | 'error' | 'offline'): void {
    this.status = s;
    this.bus.emit(`connector.${this.id}.status`, { id: this.id, status: s });
  }

  _recordError(err: any): void {
    const entry = { msg: err?.message || String(err), stamp: Date.now() };
    this.errors.push(entry);
    if (this.errors.length > 50) {
      this.errors.shift(); // bounded buffer
    }
    this.bus.emit(`connector.${this.id}.error`, { id: this.id, error: entry });
  }
}

// ─── DOMAIN REGISTRY ─────────────────────────────────────────────────────────
// The hub's single source of truth for all registered connectors.

export class DomainRegistry {
  public bus: EventBus;
  private _connectors: Map<string, DomainConnector>;
  private _tickTimer: any;
  public tickInterval: number; // ms

  constructor(bus: EventBus) {
    this.bus        = bus;
    this._connectors = new Map();
    this._tickTimer  = null;
    this.tickInterval = 5000; // ms
  }

  /** Register a connector class instance. */
  register(connector: DomainConnector): DomainRegistry {
    if (!(connector instanceof DomainConnector)) {
      throw new TypeError('Must be a DomainConnector instance');
    }
    if (this._connectors.has(connector.id)) {
      throw new Error(`Connector "${connector.id}" already registered`);
    }

    this._connectors.set(connector.id, connector);
    connector.onInit();
    this.bus.emit('registry.registered', { id: connector.id });
    return this;
  }

  get(id: string): DomainConnector | null {
    return this._connectors.get(id) ?? null;
  }

  list(): any[] {
    return [...this._connectors.values()].map(c => c.snapshot());
  }

  async connectAll(): Promise<void> {
    await Promise.all([...this._connectors.values()].map(c => c.connect()));
    this._startTicker();
  }

  async disconnectAll(): Promise<void> {
    this._stopTicker();
    await Promise.all([...this._connectors.values()].map(c => c.disconnect()));
  }

  _startTicker(): void {
    if (this._tickTimer) clearInterval(this._tickTimer);
    this._tickTimer = setInterval(() => {
      this._connectors.forEach(c => c.tick());
    }, this.tickInterval);
  }

  _stopTicker(): void {
    if (this._tickTimer) {
      clearInterval(this._tickTimer);
      this._tickTimer = null;
    }
  }
}

// ─── HUB ─────────────────────────────────────────────────────────────────────
// Top-level singleton that wires everything together.

export class Hub {
  public bus: EventBus;
  public registry: DomainRegistry;

  constructor() {
    this.bus      = new EventBus();
    this.registry = new DomainRegistry(this.bus);
  }

  use(connector: DomainConnector): Hub {
    this.registry.register(connector);
    return this;
  }

  async start(): Promise<Hub> {
    await this.registry.connectAll();
    this.bus.emit('hub.started', { stamp: Date.now() });
    return this;
  }

  async stop(): Promise<void> {
    await this.registry.disconnectAll();
    this.bus.emit('hub.stopped', { stamp: Date.now() });
  }

  status(): any {
    return {
      connectors: this.registry.list(),
    };
  }
}
