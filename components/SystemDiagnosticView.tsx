import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  Database, 
  Search, 
  RefreshCw, 
  Sliders, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Filter, 
  Info,
  Calendar,
  Clock,
  Settings,
  HeartPulse,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import type { SystemStatus, SystemState, MainView } from '../types';

interface SystemDiagnosticViewProps {
  systemStatus: SystemStatus;
  bootLogs: string[];
  onUpdateSystemStatus?: (system: 'Engine' | 'Battery' | 'Navigation' | 'Infotainment' | 'Handling', state: SystemState) => void;
  onSetView: (view: MainView) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onClearBootLogs?: () => void;
}

interface ParsedLog {
  id: number;
  raw: string;
  timestamp: string;
  domain: 'QUANTUM' | 'BOOT' | 'SYSTEM' | 'ERROR' | 'INFO';
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
}

export const SystemDiagnosticView: React.FC<SystemDiagnosticViewProps> = ({
  systemStatus,
  bootLogs,
  onUpdateSystemStatus,
  onSetView,
  searchQuery,
  onSearchQueryChange,
  onClearBootLogs
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [customLogs, setCustomLogs] = useState<ParsedLog[]>(() => {
    try {
      const stored = localStorage.getItem('aetheros_forensic_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aetheros_forensic_logs', JSON.stringify(customLogs));
    } catch (e) {
      console.error("Failed to save custom forensic logs:", e);
    }
  }, [customLogs]);
  const [areDefaultLogsCleared, setAreDefaultLogsCleared] = useState(false);

  const isControlled = searchQuery !== undefined;
  const currentSearchQuery = isControlled ? searchQuery : localSearchQuery;
  const handleSearchQueryChange = (val: string) => {
    if (onSearchQueryChange) {
      onSearchQueryChange(val);
    } else {
      setLocalSearchQuery(val);
    }
  };

  // Parse existing bootLogs into structured objects
  const parsedBootLogs = useMemo(() => {
    const baseLogs = bootLogs.map((log, index) => {
      // Extract domain and severity level based on log contents
      let domain: ParsedLog['domain'] = 'SYSTEM';
      let level: ParsedLog['level'] = 'info';
      let cleanMsg = log;

      if (log.includes('[QUANTUM]')) {
        domain = 'QUANTUM';
        cleanMsg = log.replace('[QUANTUM]', '').trim();
        level = cleanMsg.toLowerCase().includes('fail') || cleanMsg.toLowerCase().includes('error') ? 'error' : 'success';
      } else if (log.includes('[BOOT]')) {
        domain = 'BOOT';
        cleanMsg = log.replace('[BOOT]', '').trim();
        level = cleanMsg.toLowerCase().includes('fail') ? 'error' : 'info';
      } else if (log.includes('error') || log.includes('fail') || log.includes('exception')) {
        domain = 'ERROR';
        level = 'error';
      }

      // Generate a mock sequential timestamp for review realism
      const minutesAgo = Math.max(0, bootLogs.length - index);
      const timeStr = new Date(Date.now() - minutesAgo * 60 * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      return {
        id: index,
        raw: log,
        timestamp: timeStr,
        domain,
        message: cleanMsg,
        level
      };
    });

    // Subsystem-specific default logs for immersive click-to-filter experience
    const subsystemDefaultLogs: ParsedLog[] = [
      {
        id: -1,
        raw: `[SYSTEM] [OK] Engine core synchronization phase locked at 4200 RPM.`,
        timestamp: new Date(Date.now() - 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        domain: 'SYSTEM',
        message: 'Engine core synchronization phase locked at 4200 RPM.',
        level: 'success'
      },
      {
        id: -2,
        raw: `[SYSTEM] [OK] Battery cells thermal gradient nominal at 312K.`,
        timestamp: new Date(Date.now() - 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        domain: 'SYSTEM',
        message: 'Battery cells thermal gradient nominal at 312K.',
        level: 'success'
      },
      {
        id: -3,
        raw: `[SYSTEM] [OK] Navigation GPS multi-path signal reception locked on 12 satellites.`,
        timestamp: new Date(Date.now() - 15000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        domain: 'SYSTEM',
        message: 'Navigation GPS multi-path signal reception locked on 12 satellites.',
        level: 'success'
      },
      {
        id: -4,
        raw: `[SYSTEM] [OK] Infotainment low-latency audio packet buffer size set to 256 samples.`,
        timestamp: new Date(Date.now() - 20000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        domain: 'SYSTEM',
        message: 'Infotainment low-latency audio packet buffer size set to 256 samples.',
        level: 'success'
      },
      {
        id: -5,
        raw: `[SYSTEM] [OK] Handling active stability control loop calibration verified.`,
        timestamp: new Date(Date.now() - 25000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        domain: 'SYSTEM',
        message: 'Handling active stability control loop calibration verified.',
        level: 'success'
      },
      {
        id: -6,
        raw: `[SYSTEM] [WARN] Infotainment bus throttling under heavy visual processing payloads.`,
        timestamp: new Date(Date.now() - 30000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        domain: 'SYSTEM',
        message: 'Infotainment bus throttling under heavy visual processing payloads.',
        level: 'warning'
      },
      {
        id: -7,
        raw: `[SYSTEM] [FAIL] Engine temperature sensor 2 reported outlier value of 145C.`,
        timestamp: new Date(Date.now() - 35000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        domain: 'ERROR',
        message: 'Engine temperature sensor 2 reported outlier value of 145C.',
        level: 'error'
      },
      {
        id: -8,
        raw: `[SYSTEM] [FAIL] Battery pack charge imbalance detected in block C3.`,
        timestamp: new Date(Date.now() - 40000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        domain: 'ERROR',
        message: 'Battery pack charge imbalance detected in block C3.',
        level: 'error'
      },
      {
        id: -9,
        raw: `[SYSTEM] [WARN] Navigation telemetry tracking latency exceeded 150ms.`,
        timestamp: new Date(Date.now() - 45000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        domain: 'SYSTEM',
        message: 'Navigation telemetry tracking latency exceeded 150ms.',
        level: 'warning'
      },
      {
        id: -10,
        raw: `[SYSTEM] [WARN] Handling hydraulic reservoir level in secondary actuator near minimum limit.`,
        timestamp: new Date(Date.now() - 50000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        domain: 'SYSTEM',
        message: 'Handling hydraulic reservoir level in secondary actuator near minimum limit.',
        level: 'warning'
      }
    ];

    return areDefaultLogsCleared ? baseLogs : [...baseLogs, ...subsystemDefaultLogs];
  }, [bootLogs, areDefaultLogsCleared]);

  // Combine default system boot logs with custom developer added event logs
  const allLogs = useMemo(() => {
    return [...parsedBootLogs, ...customLogs].sort((a, b) => b.id - a.id);
  }, [parsedBootLogs, customLogs]);

  // Filter logs based on developer search query, category domain, and severity level
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchesSearch = log.raw.toLowerCase().includes(currentSearchQuery.toLowerCase()) || 
                            log.message.toLowerCase().includes(currentSearchQuery.toLowerCase());
      
      const matchesDomain = domainFilter === 'all' || log.domain.toLowerCase() === domainFilter.toLowerCase();
      const matchesLevel = levelFilter === 'all' || log.level === levelFilter;

      return matchesSearch && matchesDomain && matchesLevel;
    });
  }, [allLogs, currentSearchQuery, domainFilter, levelFilter]);

  // Handle manual injection of simulated error logs or system checkpoints
  const injectSimulatedEvent = (type: 'info' | 'warning' | 'error' | 'success') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    let newLog: ParsedLog;

    const id = Date.now() * 1000 + Math.floor(Math.random() * 1000);

    if (type === 'error') {
      newLog = {
        id,
        raw: `[SYSTEM] [FAIL] Critical system interrupt detected on diagnostic shard ${id.toString(16).toUpperCase()}`,
        timestamp: timeStr,
        domain: 'ERROR',
        message: `Critical system interrupt detected on diagnostic shard ${id.toString(16).toUpperCase()}`,
        level: 'error'
      };
    } else if (type === 'warning') {
      newLog = {
        id,
        raw: `[SYSTEM] [WARN] Infotainment bus throttling under heavy visual processing payloads`,
        timestamp: timeStr,
        domain: 'SYSTEM',
        message: 'Infotainment bus throttling under heavy visual processing payloads',
        level: 'warning'
      };
    } else if (type === 'success') {
      newLog = {
        id,
        raw: `[QUANTUM] Resonance cascade verification completed successfully on channel 0x${(id % 256).toString(16).toUpperCase()}`,
        timestamp: timeStr,
        domain: 'QUANTUM',
        message: `Resonance cascade verification completed successfully on channel 0x${(id % 256).toString(16).toUpperCase()}`,
        level: 'success'
      };
    } else {
      newLog = {
        id,
        raw: `[SYSTEM] Developer diagnostics ping verified by operator`,
        timestamp: timeStr,
        domain: 'SYSTEM',
        message: 'Developer diagnostics ping verified by operator',
        level: 'info'
      };
    }

    setCustomLogs(prev => [newLog, ...prev]);
  };

  const clearCustomLogs = () => {
    setCustomLogs([]);
  };

  const handleScrubDiagnostics = () => {
    onClearBootLogs?.();
    setCustomLogs([]);
    setAreDefaultLogsCleared(true);
  };

  const handleLogError = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    const hash = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    
    const snapshotDetails = Object.entries(systemStatus)
      .map(([sys, state]) => `${sys}:${state}`)
      .join(' | ');

    const newLog: ParsedLog = {
      id,
      raw: `[FORENSIC] [FAIL] State Snapshot 0x${hash}: ${snapshotDetails}`,
      timestamp: timeStr,
      domain: 'ERROR',
      message: `[FORENSIC SNAPSHOT 0x${hash}] Current System State: ${snapshotDetails} (Lattice Intact)`,
      level: 'error'
    };

    setCustomLogs(prev => [newLog, ...prev]);
  };

  const getSystemStatusIcon = (state: SystemState) => {
    switch (state) {
      case 'Error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getSystemStatusBg = (state: SystemState) => {
    switch (state) {
      case 'Error':
        return 'bg-red-950/40 border-red-900/50 hover:bg-red-950/60';
      case 'Warning':
        return 'bg-amber-950/30 border-amber-900/40 hover:bg-amber-950/50';
      default:
        return 'bg-emerald-950/20 border-emerald-900/30 hover:bg-emerald-950/30';
    }
  };

  const getSystemStatusBadgeColor = (state: SystemState) => {
    switch (state) {
      case 'Error':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getLogLevelStyle = (level: ParsedLog['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-400 bg-red-950/30 border-red-900/30';
      case 'warning':
        return 'text-amber-400 bg-amber-950/30 border-amber-900/30';
      case 'success':
        return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30';
      default:
        return 'text-cyan-400 bg-cyan-950/30 border-cyan-900/30';
    }
  };

  return (
    <div id="system-diagnostic-root" className="h-full flex flex-col bg-[#05050a] text-zinc-300 font-sans select-none overflow-hidden">
      
      {/* Upper Control Bar / Header */}
      <div className="p-4 md:p-6 border-b border-zinc-900 bg-[#07070f] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-red-500 uppercase">
              Sidereal Telemetry Active
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 mt-1">
            <Terminal className="w-6 h-6 text-red-500" />
            System Diagnostic Console
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Real-time verification gates & state audit log
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => onSetView('diagnostics')}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400 transition flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Classic Diagnostics</span>
          </button>
          <button 
            onClick={() => onSetView('healing_matrix')}
            className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/40 rounded-lg text-xs font-medium text-emerald-400 transition flex items-center gap-1.5"
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Healing Matrix</span>
          </button>
          <button 
            onClick={handleLogError}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 border border-red-500/30 rounded-lg text-xs font-medium text-white transition flex items-center gap-1.5"
            title="Log current system state snapshot to forensic logs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
            <span>Log Error</span>
          </button>
          <button 
            onClick={handleScrubDiagnostics}
            className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800/40 rounded-lg text-xs font-medium text-red-400 transition flex items-center gap-1.5"
            title="Clear all diagnostic logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Scrub Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        
        {/* State Status Overview Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {(Object.keys(systemStatus) as Array<keyof SystemStatus>).map((sys) => {
            const state = systemStatus[sys] || 'OK';
            return (
              <div 
                key={sys}
                className={`p-4 border rounded-xl transition-all ${getSystemStatusBg(state)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase">
                    {sys}
                  </span>
                  {getSystemStatusIcon(state)}
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getSystemStatusBadgeColor(state)}`}>
                    {state}
                  </span>
                  {onUpdateSystemStatus && (
                    <button
                      onClick={() => {
                        const states: SystemState[] = ['OK', 'Warning', 'Error'];
                        const nextIdx = (states.indexOf(state) + 1) % states.length;
                        onUpdateSystemStatus(sys, states[nextIdx]);
                      }}
                      className="text-[9px] font-mono text-zinc-500 hover:text-white underline"
                    >
                      Cycle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Developer Sandbox Event Injectors */}
        <div className="bg-[#080812] border border-zinc-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-900/60 pb-2">
            <span className="text-xs font-mono font-bold text-zinc-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-red-500" />
              Developer Event Injections & Simulation Shards
            </span>
            {customLogs.length > 0 && (
              <button 
                onClick={clearCustomLogs}
                className="text-[10px] font-mono text-red-400 hover:text-red-300 transition"
              >
                Clear Custom Logs ({customLogs.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => injectSimulatedEvent('info')}
              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs font-mono font-bold text-cyan-400 transition"
            >
              + Sim Info Log
            </button>
            <button
              onClick={() => injectSimulatedEvent('success')}
              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs font-mono font-bold text-emerald-400 transition"
            >
              + Sim Success Log
            </button>
            <button
              onClick={() => injectSimulatedEvent('warning')}
              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs font-mono font-bold text-amber-500 transition"
            >
              + Sim Warning Log
            </button>
            <button
              onClick={() => injectSimulatedEvent('error')}
              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs font-mono font-bold text-red-500 transition"
            >
              + Sim Fault Log
            </button>
            <button
              onClick={handleLogError}
              className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/30 border border-red-900/50 rounded text-xs font-mono font-bold text-red-400 transition"
              title="Capture current system state snapshot to forensic logs"
            >
              + Log Error Snapshot
            </button>
          </div>
        </div>

        {/* Logs Interactive Module Board */}
        <div className="bg-[#04040a] border border-zinc-900 rounded-xl flex flex-col min-h-[400px]">
          
          {/* Filters & Search Toolbar */}
          <div className="p-4 border-b border-zinc-900 flex flex-col md:flex-row justify-between gap-4 bg-[#06060c]">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={currentSearchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                placeholder="Search events, signatures or log keywords..."
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition font-mono"
              />
            </div>

            {/* Category / Domain filter */}
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="text-zinc-500 font-mono mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Domain:
              </span>
              {['all', 'quantum', 'boot', 'system', 'error'].map((domain) => (
                <button
                  key={domain}
                  onClick={() => setDomainFilter(domain)}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition uppercase ${
                    domainFilter === domain
                      ? 'bg-red-950 text-red-400 border border-red-900'
                      : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>

            {/* Severity Level filter */}
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="text-zinc-500 font-mono mr-1 flex items-center gap-1">
                <Sliders className="w-3 h-3" />
                Level:
              </span>
              {['all', 'info', 'success', 'warning', 'error'].map((level) => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition uppercase ${
                    levelFilter === level
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Log Console Rows */}
          <div className="flex-1 overflow-y-auto max-h-[500px] font-mono text-[11px] divide-y divide-zinc-900/60 p-2 bg-[#020205]">
            {filteredLogs.map((log, logIdx) => (
              <div 
                key={`${log.id}-${logIdx}`} 
                className="py-2.5 px-3 hover:bg-zinc-950/80 transition flex items-start gap-3 rounded"
              >
                {/* Timestamp */}
                <span className="text-zinc-600 font-semibold select-none flex-shrink-0 pt-0.5">
                  [{log.timestamp}]
                </span>

                {/* Domain & Severity Badges */}
                <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider select-none border flex-shrink-0 ${getLogLevelStyle(log.level)}`}>
                  {log.domain}
                </span>

                {/* Event Message */}
                <div className="flex-1 text-zinc-300 break-all select-text">
                  {log.message}
                </div>

                {/* Raw View Tooltip trigger */}
                <div className="text-[9px] text-zinc-700 select-none uppercase">
                  ID: 0x{log.id.toString(16).toUpperCase()}
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-zinc-600 font-mono text-xs">
                -- NO MATCHING DIAGNOSTIC RECORDS DETECTED IN STORAGE --
              </div>
            )}
          </div>

          {/* Console Summary Footer */}
          <div className="p-3 bg-[#05050c] border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <div>
              TOTAL SYSTEMS MONITORED: 5 | ACTIVE LOG EVENT CAPACITY: 200/200
            </div>
            <div>
              SHOWING: {filteredLogs.length} OF {allLogs.length} RECORDS
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
