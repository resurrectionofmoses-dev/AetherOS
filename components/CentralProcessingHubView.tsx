import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ServerIcon, WrenchIcon, PlusIcon, TrashIcon, CheckIcon, 
    ShieldIcon, ActivityIcon, ZapIcon, TerminalIcon, GaugeIcon,
    SignalIcon, SpinnerIcon, WarningIcon, FireIcon
} from './icons';
import { Hub, EventBus } from '../services/hubCore';
import { VehicleConnector, VEHICLE_STATUS, VEHICLE_TYPE, VehicleRecord, VehicleStatusType, VehicleTypeType } from '../services/vehicleConnector';

// Persistent Singleton instance so state remains stable when switching views
let persistentHub: Hub | null = null;
let persistentVehicleConnector: VehicleConnector | null = null;
let persistentLogBuffer: string[] = [];

function getOrCreateHubInstance() {
  if (!persistentHub) {
    persistentHub = new Hub();
    persistentVehicleConnector = new VehicleConnector(persistentHub.bus, {
      initialFleetSize: 6,
      fuelBurnRate: 3,
      healthDriftRate: 0.8,
      autoRefuel: true
    });
    persistentHub.use(persistentVehicleConnector);
    // Automatically start it
    persistentHub.start().catch(console.error);
    persistentLogBuffer.push(`[${new Date().toLocaleTimeString()}] Hub fully initialized with Vehicle Domain (6 nodes).`);
  }
  return {
    hub: persistentHub,
    connector: persistentVehicleConnector!
  };
}

export const CentralProcessingHubView: React.FC = () => {
  const { hub, connector } = getOrCreateHubInstance();
  
  // React State mirrors for the background Hub elements
  const [hubStatus, setHubStatus] = useState<string>(hub.registry.list()[0]?.status || 'idle');
  const [fleet, setFleet] = useState<VehicleRecord[]>(connector.fleetSnapshot());
  const [hubLogs, setHubLogs] = useState<string[]>([...persistentLogBuffer]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  // Form/Action states
  const [newVehicleId, setNewVehicleId] = useState('');
  const [newVehicleLabel, setNewVehicleLabel] = useState('');
  const [newVehicleType, setNewVehicleType] = useState<VehicleTypeType>('scout');
  
  // Custom dispatch states
  const [dispatchVehicleId, setDispatchVehicleId] = useState('');
  const [dispatchZone, setDispatchZone] = useState('sector-7');
  const [dispatchX, setDispatchX] = useState<number>(120);
  const [dispatchY, setDispatchY] = useState<number>(45);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to Hub EventBus on mount
  useEffect(() => {
    // Sync initial states
    setFleet(connector.fleetSnapshot());
    setHubStatus(connector.status);

    const unsubscribeWildcard = hub.bus.on('*', (envelope: any) => {
      const { event, payload, stamp } = envelope;
      const timeStr = new Date(stamp).toLocaleTimeString();
      let logLine = `[${timeStr}] ${event.toUpperCase()}: ${JSON.stringify(payload)}`;
      
      // Simplify log lines slightly for readability
      if (event.includes('tick')) {
        // Suppress complete fleet array logs to keep console clean, just show status
        logLine = `[${timeStr}] ${event.toUpperCase()} - Fleet Telemetry Synchronized (Score: ${connector.health}%)`;
      } else if (event.includes('status')) {
        logLine = `[${timeStr}] NODE status switched to ${payload.status?.toUpperCase()}`;
      } else if (event.includes('dispatched')) {
        logLine = `[${timeStr}] VEHICLE ${payload.vehicleId} DISPATCHED successfully (Mission: ${payload.missionId})`;
      } else if (event.includes('recalled')) {
        logLine = `[${timeStr}] VEHICLE ${payload.vehicleId} MANUAL RECALL command acknowledge`;
      } else if (event.includes('added')) {
        logLine = `[${timeStr}] NEW VEHICLE Node registered: ${payload.vehicleId}`;
      }

      persistentLogBuffer.push(logLine);
      if (persistentLogBuffer.length > 100) {
        persistentLogBuffer.shift();
      }
      setHubLogs([...persistentLogBuffer]);
    });

    // Handle local updates on ticks/changes
    const unsubscribeTick = hub.bus.on(`connector.${connector.id}.tick`, () => {
      setFleet(connector.fleetSnapshot());
      setHubStatus(connector.status);
    });

    const unsubscribeStatus = hub.bus.on(`connector.${connector.id}.status`, (e: any) => {
      setHubStatus(e.payload.status);
    });

    const unsubscribeExtra = hub.bus.on(`vehicle.dispatched`, () => setFleet(connector.fleetSnapshot()));
    const unsubscribeRecalled = hub.bus.on(`vehicle.recalled`, () => setFleet(connector.fleetSnapshot()));
    const unsubscribeAdded = hub.bus.on(`vehicle.added`, () => setFleet(connector.fleetSnapshot()));

    return () => {
      unsubscribeWildcard();
      unsubscribeTick();
      unsubscribeStatus();
      unsubscribeExtra();
      unsubscribeRecalled();
      unsubscribeAdded();
    };
  }, [hub, connector]);

  // Scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hubLogs]);

  // Actions
  const handleToggleHubConnection = async () => {
    if (connector.status === 'active') {
      await connector.disconnect();
      persistentLogBuffer.push(`[${new Date().toLocaleTimeString()}] MANUAL_SHUTDOWN: Terminated connection to vehicle nodes.`);
      setHubLogs([...persistentLogBuffer]);
    } else {
      await connector.connect();
      persistentLogBuffer.push(`[${new Date().toLocaleTimeString()}] HANDSHAKE: Handshaking vehicle node registry...`);
      setHubLogs([...persistentLogBuffer]);
    }
    setFleet(connector.fleetSnapshot());
    setHubStatus(connector.status);
  };

  const handleRegisterVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleId.trim()) return;
    try {
      connector.exec('addVehicle', {
        id: newVehicleId.trim().toLowerCase(),
        type: newVehicleType,
        label: newVehicleLabel.trim() || undefined
      });
      setNewVehicleId('');
      setNewVehicleLabel('');
      setFleet(connector.fleetSnapshot());
    } catch (err: any) {
      alert(`Registration Failed: ${err.message}`);
    }
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const vId = dispatchVehicleId || fleet.find(v => v.status === VEHICLE_STATUS.IDLE)?.id;
    if (!vId) {
      alert('No idle vehicles available for dispatch.');
      return;
    }
    try {
      connector.exec('dispatch', {
        vehicleId: vId,
        destination: { zone: dispatchZone, x: Number(dispatchX), y: Number(dispatchY) }
      });
      setFleet(connector.fleetSnapshot());
    } catch (err: any) {
      alert(`Dispatch Error: ${err.message}`);
    }
  };

  const handleRecall = (id: string) => {
    try {
      connector.exec('recall', { vehicleId: id });
      setFleet(connector.fleetSnapshot());
    } catch (err: any) {
      alert(`Recall Error: ${err.message}`);
    }
  };

  const selectedVehicle = fleet.find(v => v.id === selectedVehicleId);
  const activeCount = fleet.filter(v => v.status === VEHICLE_STATUS.DISPATCHED || v.status === VEHICLE_STATUS.IN_TRANSIT).length;
  const meanCapacity = fleet.length ? Math.round(fleet.reduce((acc, v) => acc + v.fuel, 0) / fleet.length) : 0;

  return (
    <div className="h-full flex flex-col bg-[#020205] overflow-hidden text-gray-200 font-mono relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(139,92,246,0.04)_0%,_transparent_75%)] pointer-events-none" />

      {/* Header Panel */}
      <div className="p-6 border-b-4 border-purple-900/30 bg-black/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-500/15 border-2 border-purple-600/50 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.25)]">
            <ServerIcon className="w-7 h-7 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Central Processing Hub</h1>
            <p className="text-[10px] text-purple-400 font-black tracking-[0.34em] uppercase">CPH Domain Connector Registry (Protocol 0x03E2)</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-black/60 rounded border border-white/5 flex items-center gap-2">
            <span className="text-[8px] text-gray-500 uppercase">Registry Status</span>
            <span className={`text-[10px] font-bold uppercase shrink-0 ${connector.status === 'active' ? 'text-green-400' : 'text-amber-500'}`}>
              ● {connector.status}
            </span>
          </div>

          <button 
            onClick={handleToggleHubConnection}
            className={`px-4 py-2 border border-black font-bold uppercase text-[10px] tracking-widest rounded transition-all active:translate-y-0.5 shadow-lg ${
              connector.status === 'active' 
                ? 'bg-red-800/20 text-red-400 border-red-500/40 hover:bg-red-600 hover:text-white' 
                : 'bg-green-800/25 text-green-400 border-green-500/40 hover:bg-green-600 hover:text-black'
            }`}
          >
            {connector.status === 'active' ? 'DISCONNECT HUB' : 'CONNECT VEHICLES'}
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto custom-scrollbar relative z-10">
        
        {/* Core Metrics & Live Registry Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CPH Stats Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-black/80 border-2 border-zinc-900 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-[6px_6px_0_0_rgba(139,92,246,0.15)]">
              <div className="flex justify-between items-start">
                <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">Connected Nodes</span>
                <GaugeIcon className="w-8 h-8 opacity-20 text-purple-400" />
              </div>
              <div className="mt-2">
                <span className="text-4xl font-black text-white">{fleet.length}</span>
                <span className="text-xs text-gray-500 ml-2">/ 12 Max</span>
              </div>
              <div className="w-full mt-3 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-purple-500" style={{ width: `${(fleet.length / 12) * 100}%` }} />
              </div>
            </div>

            <div className="bg-black/80 border-2 border-zinc-900 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-[6px_6px_0_0_rgba(139,92,246,0.15)]">
              <div className="flex justify-between items-start">
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Active Ticks</span>
                <ActivityIcon className="w-8 h-8 opacity-20 text-emerald-400" />
              </div>
              <div className="mt-2">
                <span className="text-4xl font-black text-white">{activeCount}</span>
                <span className="text-xs text-gray-500 ml-2">dispatched</span>
              </div>
              <p className="text-[8px] text-gray-500 uppercase mt-2">Continuous fuel/health drift compensation</p>
            </div>

            <div className="bg-black/80 border-2 border-zinc-900 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-[6px_6px_0_0_rgba(139,92,246,0.15)]">
              <div className="flex justify-between items-start">
                <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Mean Energy Reserve</span>
                <SignalIcon className="w-8 h-8 opacity-20 text-indigo-400" />
              </div>
              <div className="mt-2">
                <span className="text-4xl font-black text-white">{meanCapacity}%</span>
                <span className="text-xs text-gray-500 ml-2">fleet fuel</span>
              </div>
              <div className="w-full mt-3 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-indigo-500 animate-pulse" style={{ width: `${meanCapacity}%` }} />
              </div>
            </div>
          </div>

          {/* Node Map Radar Visualizer */}
          <div className="bg-zinc-950/60 border-2 border-purple-900/10 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5"><SignalIcon className="w-24 h-24" /></div>
            <div className="flex justify-between items-center mb-4 border-b border-purple-900/20 pb-2">
              <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 animate-ping" /> Telemetry Radar Map
              </h3>
              <span className="text-[8px] text-gray-500 font-black">SCAN SPEED: T_FAST_5S</span>
            </div>

            {/* Radar Canvas Panel */}
            <div className="bg-black border border-purple-900/30 rounded-lg p-3 h-64 relative flex items-center justify-center overflow-hidden">
              {/* Concentric circular grids */}
              <div className="absolute w-56 h-56 border border-purple-500/5 rounded-full" />
              <div className="absolute w-40 h-40 border border-purple-500/5 rounded-full" />
              <div className="absolute w-24 h-24 border border-purple-500/5 rounded-full" />
              
              {/* Radar sweep line */}
              <motion.div 
                className="absolute w-36 h-0.5 bg-gradient-to-r from-purple-500/0 to-purple-500/30 origin-left"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                style={{ top: '50%', left: '50%' }}
              />

              {/* Coordinates indicators */}
              <div className="absolute left-3 top-3 text-[8px] text-gray-600 font-bold uppercase">Base Station (0,0)</div>
              
              {/* Base coordinate marker */}
              <div className="absolute w-2.5 h-2.5 bg-purple-500 border border-white rounded-full flex items-center justify-center z-10 shadow-[0_0_12px_purple]" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} title="HQ Base" />

              {/* Vehicle Node Plotter */}
              {fleet.map((v) => {
                // Approximate coordinate offset into style
                const isDispatched = v.status === VEHICLE_STATUS.DISPATCHED || v.status === VEHICLE_STATUS.IN_TRANSIT;
                let xPercent = 50;
                let yPercent = 50;

                if (isDispatched) {
                  // Normalize coordinate mock (location.x is in -150 to 150)
                  const nodeX = v.location?.x || 0;
                  const nodeY = v.location?.y || 0;
                  xPercent = Math.max(10, Math.min(90, 50 + (nodeX / 3.5)));
                  yPercent = Math.max(10, Math.min(90, 50 - (nodeY / 3.5)));
                } else if (v.status === VEHICLE_STATUS.RETURNING) {
                  // Put it animated close to the center
                  xPercent = 51 + Math.sin(Date.now() / 300) * 4;
                  yPercent = 49 + Math.cos(Date.now() / 300) * 4;
                }

                return (
                  <motion.div 
                    key={v.id}
                    title={`${v.label} type: ${v.type} status: ${v.status}`}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className="absolute cursor-pointer flex flex-col items-center group z-20"
                    style={{ left: `${xPercent}%`, top: `${yPercent}%`, transform: 'translate(-50%, -50%)' }}
                    layoutId={`radar-${v.id}`}
                  >
                    <div className={`w-3 h-3 rounded-full border border-white flex items-center justify-center transition-all ${
                      v.status === VEHICLE_STATUS.IDLE 
                        ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]' 
                        : isDispatched 
                          ? 'bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]' 
                          : v.status === VEHICLE_STATUS.OFFLINE || v.health < 35 
                            ? 'bg-red-600 shadow-[0_0_10px_red]' 
                            : 'bg-zinc-650'
                    }`}>
                      <span className="text-[5px] text-white font-black">{v.id.substring(1)}</span>
                    </div>

                    <div className="absolute bottom-4 scale-0 group-hover:scale-100 transition-transform bg-black border border-purple-500/30 px-1.5 py-0.5 rounded text-[7px] text-gray-300 font-bold whitespace-nowrap z-50">
                      #{v.label} ({v.location?.zone})
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Node Registry Inventory list */}
          <div className="bg-black/40 border-2 border-zinc-900 rounded-xl p-6">
            <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest border-b border-white/5 pb-3 mb-4">
              Connector Fleet Inventory ({fleet.length} Active Nodes)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fleet.map((v) => (
                <div 
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedVehicleId === v.id 
                      ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                      : 'bg-black/60 border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[7px] px-1.5 py-0.5 bg-zinc-800 text-purple-400 font-black rounded uppercase mr-1.5">
                        {v.id}
                      </span>
                      <span className="text-xs font-black text-white">{v.label}</span>
                    </div>
                    
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      v.status === VEHICLE_STATUS.IDLE 
                        ? 'bg-blue-950/50 text-blue-400 border-blue-500/30'
                        : v.status === VEHICLE_STATUS.DISPATCHED
                          ? 'bg-green-950/50 text-green-400 border-green-500/30 animate-pulse'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  {/* Tiny progress status bars for vehicle reserves */}
                  <div className="space-y-2 mt-3 pt-2 border-t border-white/5">
                    <div>
                      <div className="flex justify-between text-[8px] text-gray-500 uppercase mb-0.5">
                        <span>Energy / Fuel</span>
                        <span className={v.fuel < 25 ? 'text-red-400 font-bold' : 'text-gray-300'}>{v.fuel}%</span>
                      </div>
                      <div className="h-1 bg-black rounded-full overflow-hidden">
                        <div className={`h-full ${v.fuel < 25 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${v.fuel}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[9px] pt-1">
                      <div>
                        <span className="text-gray-600">Health: </span>
                        <span className="text-gray-300 font-bold">{v.health.toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Odo: </span>
                        <span className="text-gray-300 font-bold">{v.odometer} units</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Console Logs, Diagnostics, & Forms Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Node Operations Form Sidebar */}
          <div className="bg-black/80 border-2 border-zinc-900 rounded-xl p-5 space-y-4">
            <h4 className="text-[10px] text-purple-400 font-black tracking-widest uppercase flex items-center gap-2">
              <PlusIcon className="w-3.5 h-3.5" /> Provision New Node
            </h4>
            
            <form onSubmit={handleRegisterVehicle} className="space-y-3">
              <div>
                <label className="block text-[8px] text-gray-500 uppercase mb-1">Node Identifier ID</label>
                <input 
                  type="text"
                  placeholder="e.g. v007"
                  value={newVehicleId}
                  onChange={e => setNewVehicleId(e.target.value)}
                  className="w-full bg-black border border-zinc-900 rounded px-2.5 py-1.5 text-xs text-white uppercase focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] text-gray-500 uppercase mb-1">Custom Display label</label>
                <input 
                  type="text"
                  placeholder="e.g. Delta Recon"
                  value={newVehicleLabel}
                  onChange={e => setNewVehicleLabel(e.target.value)}
                  className="w-full bg-black border border-zinc-900 rounded px-2.5 py-1.5 text-xs text-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] text-gray-500 uppercase mb-1">Specialized Vehicle Type</label>
                <select
                  value={newVehicleType}
                  onChange={e => setNewVehicleType(e.target.value as any)}
                  className="w-full bg-black border border-zinc-900 rounded px-2.5 py-1.5 text-xs text-white focus:border-purple-600 focus:outline-none"
                >
                  {Object.values(VEHICLE_TYPE).map(type => (
                    <option key={type} value={type}>{type.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                disabled={!newVehicleId.trim()}
                className="w-full py-2 bg-purple-900/45 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 rounded text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                PROVISION NODE
              </button>
            </form>
          </div>

          {/* Connected Operations Deck (Dispatcher) */}
          <div className="bg-black/80 border-2 border-zinc-900 rounded-xl p-5 space-y-4">
            <h4 className="text-[10px] text-emerald-400 font-black tracking-widest uppercase flex items-center gap-2">
              <ZapIcon className="w-3.5 h-3.5 animate-pulse" /> Dispatch Controller
            </h4>

            <form onSubmit={handleDispatch} className="space-y-3">
              <div>
                <label className="block text-[8px] text-gray-500 uppercase mb-1">Target Vehicle Node</label>
                <select
                  value={dispatchVehicleId}
                  onChange={e => setDispatchVehicleId(e.target.value)}
                  className="w-full bg-black border border-zinc-900 rounded px-2.5 py-1.5 text-xs text-white focus:border-purple-600 focus:outline-none"
                >
                  <option value="">-- Choose Idle Node --</option>
                  {fleet.filter(v => v.status === VEHICLE_STATUS.IDLE).map(v => (
                    <option key={v.id} value={v.id}>{v.id.toUpperCase()}: #{v.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] text-gray-500 uppercase mb-1">Command destination</label>
                  <input 
                    type="text"
                    value={dispatchZone}
                    onChange={e => setDispatchZone(e.target.value)}
                    className="w-full bg-black border border-zinc-900 rounded px-2.5 py-1.5 text-xs text-white focus:border-purple-600 focus:outline-none"
                    placeholder="e.g. sector-7"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase mb-1">X-Coord</label>
                    <input 
                      type="number"
                      value={dispatchX}
                      onChange={e => setDispatchX(Number(e.target.value))}
                      className="w-full bg-black border border-zinc-900 rounded px-1 px-1.5 text-xs text-white focus:border-purple-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase mb-1">Y-Coord</label>
                    <input 
                      type="number"
                      value={dispatchY}
                      onChange={e => setDispatchY(Number(e.target.value))}
                      className="w-full bg-black border border-zinc-900 rounded px-1 px-1.5 text-xs text-white focus:border-purple-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-emerald-900/45 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/30 rounded text-[9px] font-black uppercase tracking-widest transition-all"
              >
                DISPATCH TARGET
              </button>
            </form>
          </div>

          {/* Diagnostic Inspector for Selected Node */}
          {selectedVehicleId && selectedVehicle && (
            <motion.div 
              layoutId="inspector"
              className="bg-[#0b0416] border-2 border-purple-500/40 rounded-xl p-5 space-y-4 shadow-[0_0_20px_rgba(139,92,246,0.15)] relative"
            >
              <button 
                onClick={() => setSelectedVehicleId(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
                title="Close Inspector"
              >
                ×
              </button>

              <h4 className="text-[10px] text-purple-400 font-black tracking-widest uppercase flex items-center gap-2 border-b border-purple-500/20 pb-2">
                <WrenchIcon className="w-4 h-4 text-purple-400" /> Diagnostics Check: {selectedVehicle.label}
              </h4>

              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">Engine Status</span>
                  <span className={selectedVehicle.health > 70 ? 'text-green-400 font-bold' : 'text-amber-500 font-bold'}>
                    {selectedVehicle.health > 70 ? '✓ NOMINAL' : '▲ DEGRADED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">Location Zone</span>
                  <span className="text-white uppercase font-bold">{selectedVehicle.location?.zone} ({selectedVehicle.location?.x}, {selectedVehicle.location?.y})</span>
                </div>
                {selectedVehicle.missionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 uppercase">Mission ID</span>
                    <span className="text-emerald-400 font-bold">{selectedVehicle.missionId}</span>
                  </div>
                )}
                {selectedVehicle.faults && selectedVehicle.faults.length > 0 && (
                  <div className="pt-2 border-t border-purple-900/30">
                    <span className="text-[8px] text-gray-500 uppercase font-black block mb-1">Active Fault Diagnostic Codes</span>
                    <div className="p-2.5 bg-red-950/20 rounded border border-red-900/30 space-y-1">
                      {selectedVehicle.faults.map((f, i) => (
                        <div key={i} className="flex justify-between text-[9px]">
                          <span className="text-red-400 font-bold">▲ {f.code}</span>
                          <span className="text-gray-500 text-[8px] uppercase">{f.severity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for selected node */}
              <div className="flex gap-2.5 pt-2">
                {(selectedVehicle.status === VEHICLE_STATUS.DISPATCHED || selectedVehicle.status === VEHICLE_STATUS.IN_TRANSIT) && (
                  <button 
                    onClick={() => handleRecall(selectedVehicle.id)}
                    className="flex-1 py-1.5 bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded text-[9.5px] font-black uppercase tracking-wider transition-all"
                  >
                    Recall to Base
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Real-time Event bus Log Terminal */}
          <div className="bg-black border-2 border-zinc-900 rounded-xl p-5 flex flex-col h-72">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] text-indigo-400 font-black tracking-widest uppercase flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-indigo-400" /> Event Bus Telemetry
              </h4>
              <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1 rounded uppercase">PUB / SUB</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950 border border-zinc-900 rounded-lg p-3 font-mono text-[9px] text-gray-400">
              <div className="text-zinc-600 mb-2 border-b border-zinc-900/50 pb-1">» CENTRAL_EVENT_RECEIVER</div>
              {hubLogs.map((log, index) => (
                <div key={index} className="mb-1.5 animate-in slide-in-from-left-1 duration-150 py-0.5 leading-normal">
                  <span className="text-indigo-500">›</span> {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

        </div>

      </div>

      {/* Footer Status Row */}
      <div className="p-4 bg-slate-950 border-t-8 border-black flex justify-between items-center z-30 px-10 shadow-inner">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span className="text-[10px] uppercase font-black tracking-widest text-green-500">
              CPH: SYNCHRONIZED
            </span>
          </div>
          <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase hidden lg:inline">
            EventBus Stream: UP | Registry Connectors: 1 | Multi-client: READY
          </span>
        </div>
        <p className="text-[9px] text-gray-700 font-black uppercase italic tracking-[0.3em] hidden sm:block">"Conducting domain entities with zero abstraction."</p>
      </div>
    </div>
  );
};
