import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, ArrowUpDown, User, Clock, Trash2, Search, Filter, 
  Database, ShieldAlert, Sparkles, Download, RefreshCw, Play,
  ChevronRight, Laptop, HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

// Define the shape of a rich structured activity log entry
interface RichActivityLog {
  id: string;
  timestamp: string; // ISO string
  userEmail: string;
  role: string;
  machineId: string;
  type: 'VIEW_SWITCH' | 'ADMIN_ACTION' | 'SYSTEM_ALERT' | 'USER_ACTIVITY';
  fromView?: string;
  toView?: string;
  message: string;
  details?: Record<string, any>;
}

export const ActivityLogsView: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<RichActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'VIEW_SWITCH' | 'ADMIN_ACTION' | 'SYSTEM_ALERT'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST_FIRST' | 'OLDEST_FIRST'>('NEWEST_FIRST');
  const [selectedLog, setSelectedLog] = useState<RichActivityLog | null>(null);

  // Administrative verification
  const isAuthorized = ['admin', 'operator', 'moderator'].includes(user?.role || '');

  // Load and normalize logs from localStorage
  const loadLogs = () => {
    try {
      const rawTabLogs = localStorage.getItem('aetheros_tab_activity_logs');
      if (rawTabLogs) {
        const parsed = JSON.parse(rawTabLogs);
        
        // Normalize logs: if they are simple strings, transform them into rich log entries
        const normalized: RichActivityLog[] = parsed.map((item: any, index: number) => {
          if (typeof item === 'string') {
            // e.g. "[16:20:46.123] Switch: CHAT ➔ SYSTEM (Armored)"
            const timeMatch = item.match(/\[(.*?)\]/);
            const timeStr = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString();
            
            // Guess a timestamp based on time string for today
            const [hms, ms] = timeStr.split('.');
            const [hours, minutes, seconds] = hms.split(':').map(Number);
            const dateObj = new Date();
            if (!isNaN(hours)) dateObj.setHours(hours);
            if (!isNaN(minutes)) dateObj.setMinutes(minutes);
            if (!isNaN(seconds)) dateObj.setSeconds(seconds);
            if (ms && !isNaN(Number(ms))) dateObj.setMilliseconds(Number(ms));

            // Extract from / to views if present
            const switchMatch = item.match(/Switch:\s+(\w+)\s+➔\s+(\w+)/i);
            const fromView = switchMatch ? switchMatch[1] : undefined;
            const toView = switchMatch ? switchMatch[2] : undefined;

            return {
              id: `log_legacy_${index}_${dateObj.getTime()}`,
              timestamp: dateObj.toISOString(),
              userEmail: 'resurrectionofmoses@gmail.com', // fallback default user
              role: 'admin',
              machineId: 'NODE-0x3FA2',
              type: 'VIEW_SWITCH',
              fromView,
              toView,
              message: item,
            };
          } else if (typeof item === 'object' && item !== null) {
            // Already a rich log
            return {
              id: item.id || `log_${index}_${Date.now()}`,
              timestamp: item.timestamp || new Date().toISOString(),
              userEmail: item.userEmail || 'unknown@aetheros.local',
              role: item.role || 'guest',
              machineId: item.machineId || 'NODE-GENERIC',
              type: item.type || 'USER_ACTIVITY',
              fromView: item.fromView,
              toView: item.toView,
              message: item.message || item.raw || 'Activity registered.',
              details: item.details
            };
          }
          return null;
        }).filter(Boolean) as RichActivityLog[];

        setLogs(normalized);
      } else {
        // Initialize with default template history if empty
        const defaultSeeds: RichActivityLog[] = [
          {
            id: 'seed_1',
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 24h ago
            userEmail: 'resurrectionofmoses@gmail.com',
            role: 'admin',
            machineId: 'XPS-NODE-992',
            type: 'ADMIN_ACTION',
            message: 'AetherOS system initialization. Security lattice deployed.',
            details: { action: 'SYS_INIT', version: 'v3.2.0-secure' }
          },
          {
            id: 'seed_2',
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), // 12h ago
            userEmail: 'guest_observer@aetheros.local',
            role: 'guest',
            machineId: 'GUEST-CELL-1',
            type: 'VIEW_SWITCH',
            fromView: 'CHAT',
            toView: 'PROJECTS',
            message: '[12 hours ago] Switch: CHAT ➔ PROJECTS (Unarmored)'
          },
          {
            id: 'seed_3',
            timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), // 3h ago
            userEmail: 'resurrectionofmoses@gmail.com',
            role: 'admin',
            machineId: 'XPS-NODE-992',
            type: 'ADMIN_ACTION',
            message: 'Passphrase modification triggered. Derived keys recalculated.',
            details: { action: 'KEY_ROTATION', engine: 'AEC-SIM v3' }
          },
          {
            id: 'seed_4',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
            userEmail: 'operator_alpha@aetheros.local',
            role: 'operator',
            machineId: 'NODE-0xDEAD',
            type: 'SYSTEM_ALERT',
            message: 'Sovereign shield quarantine activated: Threat vectors scanned.',
            details: { alertLevel: 'LOW', nodeHost: '10.0.8.23' }
          }
        ];
        
        localStorage.setItem('aetheros_tab_activity_logs', JSON.stringify(defaultSeeds));
        setLogs(defaultSeeds);
      }
    } catch (e) {
      console.error('Failed to parse logs from storage:', e);
      toast.error('Failed to fetch activity logs.');
    }
  };

  useEffect(() => {
    loadLogs();
    
    // Listen for real-time tab switch logs
    const handleSwitchEvent = () => {
      loadLogs();
    };
    window.addEventListener('aetheros_tab_switch', handleSwitchEvent);
    return () => {
      window.removeEventListener('aetheros_tab_switch', handleSwitchEvent);
    };
  }, []);

  // Write a simulated mock log to test real-time reactivity and filtering
  const handleSimulateLog = (type: 'VIEW_SWITCH' | 'ADMIN_ACTION' | 'SYSTEM_ALERT') => {
    try {
      const now = new Date();
      const simplifiedTime = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      
      let simulatedEntry: RichActivityLog;

      if (type === 'VIEW_SWITCH') {
        const views = ['CHAT', 'NET_DIRECTIVES', 'SOVEREIGN_SHIELD', 'DIAGNOSTICS', 'MODERATOR_LOUNGE', 'FORENSIC_AUDIT'];
        const from = views[Math.floor(Math.random() * views.length)];
        const to = views.filter(v => v !== from)[Math.floor(Math.random() * (views.length - 1))];
        
        simulatedEntry = {
          id: `sim_${Date.now()}`,
          timestamp: now.toISOString(),
          userEmail: Math.random() > 0.4 ? 'resurrectionofmoses@gmail.com' : 'simulated_operator@aetheros.local',
          role: Math.random() > 0.4 ? 'admin' : 'operator',
          machineId: `NODE-0x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`,
          type: 'VIEW_SWITCH',
          fromView: from,
          toView: to,
          message: `[${simplifiedTime}] Switch: ${from} ➔ ${to} (Armored)`
        };
      } else if (type === 'ADMIN_ACTION') {
        const actions = [
          { msg: 'Modified user sovereignty authorization tier to OMNIPOTENT.', details: { action: 'UPDATE_ROLE', target: 'resurrectionofmoses@gmail.com' } },
          { msg: 'Flushed corrupted memory caches from RT-IPC engine.', details: { action: 'FLUSH_CACHE', target: 'RT-IPC-01' } },
          { msg: 'Engaged cryptographic bypass protocol on sandbox boundary.', details: { action: 'BYPASS_ENGAGE', target: 'SANDBOX' } }
        ];
        const selected = actions[Math.floor(Math.random() * actions.length)];
        
        simulatedEntry = {
          id: `sim_${Date.now()}`,
          timestamp: now.toISOString(),
          userEmail: 'resurrectionofmoses@gmail.com',
          role: 'admin',
          machineId: 'XPS-NODE-992',
          type: 'ADMIN_ACTION',
          message: `[${simplifiedTime}] Admin: ${selected.msg}`,
          details: selected.details
        };
      } else {
        simulatedEntry = {
          id: `sim_${Date.now()}`,
          timestamp: now.toISOString(),
          userEmail: 'system_monitor@aetheros.local',
          role: 'operator',
          machineId: 'HYPERVISOR-CORE-0',
          type: 'SYSTEM_ALERT',
          message: `[${simplifiedTime}] Warning: Memory utilization reached 84%. Auto-scaling engaged.`,
          details: { memoryUsedGb: 26.8, threshold: 0.8 }
        };
      }

      // Read current logs
      const currentLogsRaw = localStorage.getItem('aetheros_tab_activity_logs');
      let currentLogs: any[] = [];
      if (currentLogsRaw) {
        try {
          currentLogs = JSON.parse(currentLogsRaw);
        } catch {
          currentLogs = [];
        }
      }

      currentLogs.push(simulatedEntry);
      if (currentLogs.length > 500) {
        currentLogs.shift();
      }
      
      localStorage.setItem('aetheros_tab_activity_logs', JSON.stringify(currentLogs));
      loadLogs();
      toast.success(`Simulated ${type.toLowerCase()} log entry.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Clear all logs
  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to purge all activity logs? This is irreversible.')) {
      try {
        localStorage.removeItem('aetheros_tab_activity_logs');
        setLogs([]);
        setSelectedLog(null);
        toast.success('All activity logs purged successfully.');
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Export logs to JSON
  const handleExportLogs = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `aetheros_activity_logs_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Logs exported successfully.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export logs.');
    }
  };

  // Filter logs based on search query (email, role, message, machineId, from/to views) and type filter
  const filteredLogs = useMemo(() => {
    let result = logs.filter(log => {
      // 1. Type Filter
      if (typeFilter !== 'ALL' && log.type !== typeFilter) {
        return false;
      }

      // 2. Search Query (checks user email, role, message, machineId, views)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const emailMatch = log.userEmail.toLowerCase().includes(query);
        const roleMatch = log.role.toLowerCase().includes(query);
        const messageMatch = log.message.toLowerCase().includes(query);
        const machineMatch = log.machineId.toLowerCase().includes(query);
        const fromMatch = log.fromView?.toLowerCase().includes(query);
        const toMatch = log.toView?.toLowerCase().includes(query);

        return emailMatch || roleMatch || messageMatch || machineMatch || fromMatch || toMatch;
      }

      return true;
    });

    // 3. Sort chronologically (oldest-first or newest-first)
    return result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'NEWEST_FIRST' ? dateB - dateA : dateA - dateB;
    });
  }, [logs, searchQuery, typeFilter, sortOrder]);

  const stats = useMemo(() => {
    const counts = { ALL: logs.length, VIEW_SWITCH: 0, ADMIN_ACTION: 0, SYSTEM_ALERT: 0 };
    logs.forEach(l => {
      if (l.type in counts) {
        counts[l.type]++;
      }
    });
    return counts;
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020205] text-zinc-300 font-mono overflow-hidden">
      {/* Header Panel */}
      <div className="p-4 bg-black border-b border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-800">
              <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                Sovereign Administrative Logs
                <span className="text-[9px] bg-purple-900/60 border border-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full">
                  Timeline
                </span>
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase mt-0.5">
                Chronological ledger of node switching, user operations, and structural updates
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isAuthorized && (
            <div className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-950/80 p-1 rounded-lg">
              <span className="text-[8px] text-zinc-600 font-bold px-1.5">SIMULATE:</span>
              <button 
                onClick={() => handleSimulateLog('VIEW_SWITCH')}
                className="text-[9px] px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded hover:bg-zinc-800 transition-all uppercase font-black"
                title="Log a random view switch event"
              >
                Switch
              </button>
              <button 
                onClick={() => handleSimulateLog('ADMIN_ACTION')}
                className="text-[9px] px-2 py-1 bg-purple-950/40 border border-purple-900/40 text-purple-400 rounded hover:bg-purple-900/30 transition-all uppercase font-black"
                title="Log a simulated administrative command"
              >
                Admin
              </button>
              <button 
                onClick={() => handleSimulateLog('SYSTEM_ALERT')}
                className="text-[9px] px-2 py-1 bg-amber-950/40 border border-amber-900/40 text-amber-500 rounded hover:bg-amber-900/30 transition-all uppercase font-black"
                title="Log a simulated warning alert"
              >
                Alert
              </button>
            </div>
          )}

          <button
            onClick={handleExportLogs}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-all text-zinc-400"
            title="Export full log data to JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          {isAuthorized && (
            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded bg-red-950/30 border border-red-900/40 hover:bg-red-900/30 text-red-400 hover:border-red-500 transition-all"
              title="Purge logs from localStorage"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={loadLogs}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:text-white transition-all text-zinc-400"
            title="Reload logs database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container: Filter bar + content bento */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Logs Timeline Grid */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-900">
          
          {/* Search and Filters Bar */}
          <div className="p-3 bg-zinc-950 border-b border-zinc-900 flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-600" />
              <input
                type="text"
                placeholder="Search user, role, node, message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-white placeholder-zinc-600 focus:outline-none focus:border-purple-900 transition-all uppercase"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[8px] text-zinc-500 hover:text-zinc-300 uppercase"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Categories & Toggle order */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <div className="flex items-center gap-1 border border-zinc-800 bg-black p-1 rounded-lg shrink-0">
                {(['ALL', 'VIEW_SWITCH', 'ADMIN_ACTION', 'SYSTEM_ALERT'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setTypeFilter(cat)}
                    className={`text-[8px] font-black uppercase px-2 py-1 rounded transition-all ${
                      typeFilter === cat 
                        ? 'bg-purple-900/60 border border-purple-500/30 text-white shadow-[0_0_8px_rgba(168,85,247,0.2)]' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {cat === 'ALL' ? 'ALL' : cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Chronological Sort Toggle */}
              <button
                onClick={() => setSortOrder(prev => prev === 'NEWEST_FIRST' ? 'OLDEST_FIRST' : 'NEWEST_FIRST')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-[9px] font-black uppercase transition-all shrink-0 cursor-pointer"
                title={sortOrder === 'NEWEST_FIRST' ? 'Showing newest entries first' : 'Showing oldest entries first'}
              >
                <ArrowUpDown className="w-3 h-3 text-purple-400" />
                <span>
                  {sortOrder === 'NEWEST_FIRST' ? 'Newest First' : 'Oldest First'}
                </span>
              </button>
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Database className="w-12 h-12 text-zinc-800 mb-4 animate-bounce" />
                <span className="text-[11px] text-zinc-500 uppercase font-black">No Logs Found</span>
                <p className="text-[9px] text-zinc-650 uppercase mt-1 max-w-xs">
                  No actions matched "{searchQuery}" with category {typeFilter}. Change filters or simulate a log.
                </p>
              </div>
            ) : (
              <div className="relative border-l border-zinc-800 ml-3 pl-6 space-y-4">
                {filteredLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  
                  // Stylings based on event type
                  let badgeColor = 'text-blue-400 bg-blue-950/20 border-blue-900/40';
                  let iconColor = 'text-blue-400';
                  let borderHover = 'hover:border-blue-900/40';

                  if (log.type === 'ADMIN_ACTION') {
                    badgeColor = 'text-purple-400 bg-purple-950/20 border-purple-900/40';
                    iconColor = 'text-purple-400';
                    borderHover = 'hover:border-purple-900/40';
                  } else if (log.type === 'SYSTEM_ALERT') {
                    badgeColor = 'text-amber-500 bg-amber-950/20 border-amber-900/40';
                    iconColor = 'text-amber-500';
                    borderHover = 'hover:border-amber-950/40';
                  }

                  const formattedDate = new Date(log.timestamp).toLocaleString();

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`relative p-3 bg-zinc-950/50 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-purple-500/60 bg-purple-950/10 shadow-[0_0_12px_rgba(168,85,247,0.05)]' 
                          : `border-zinc-900/75 ${borderHover}`
                      } cursor-pointer group`}
                      onClick={() => setSelectedLog(isSelected ? null : log)}
                    >
                      {/* Left Dot Indicator */}
                      <div className="absolute -left-[31px] top-4 flex items-center justify-center">
                        <div className={`w-2.5 h-2.5 rounded-full bg-[#020205] border-2 transition-transform duration-350 group-hover:scale-125 ${
                          log.type === 'ADMIN_ACTION' 
                            ? 'border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' 
                            : log.type === 'SYSTEM_ALERT'
                            ? 'border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                            : 'border-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]'
                        }`} />
                      </div>

                      {/* Log Entry Layout */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter ${badgeColor}`}>
                            {log.type}
                          </span>
                          <div className="flex items-center gap-1 text-[8.5px] text-zinc-500 uppercase">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[8.5px] text-zinc-500">
                          <span className="text-zinc-650">BY:</span>
                          <span className="text-zinc-400 font-bold max-w-[120px] truncate" title={log.userEmail}>
                            {log.userEmail.split('@')[0].toUpperCase()}
                          </span>
                          <span className="opacity-30">|</span>
                          <span className="text-zinc-400 bg-zinc-900/40 px-1 rounded border border-zinc-800 font-black">
                            {log.role.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Display message */}
                      <div className="mt-2.5 text-[10px] font-mono leading-relaxed text-zinc-300">
                        {log.message}
                      </div>

                      {/* Quick Details footer */}
                      <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-zinc-900/40 text-[8px] text-zinc-500">
                        <div className="flex items-center gap-2">
                          <Laptop className="w-2.5 h-2.5 text-zinc-600" />
                          <span>{log.machineId}</span>
                          {log.fromView && (
                            <>
                              <span className="opacity-20">•</span>
                              <span className="text-zinc-600 font-bold">FLOW:</span>
                              <span className="text-zinc-400">{log.fromView}</span>
                              <ChevronRight className="w-2.5 h-2.5 text-zinc-600" />
                              <span className="text-zinc-300">{log.toView}</span>
                            </>
                          )}
                        </div>
                        <span className="text-purple-500/70 opacity-0 group-hover:opacity-100 transition-opacity">
                          Details ➔
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Log Inspector & Summary statistics */}
        <div className="w-full md:w-80 p-4 bg-zinc-950 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          
          {/* Metadata Metrics widget */}
          <div className="bg-black/40 border border-zinc-900 p-3 rounded-xl space-y-3">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block border-b border-zinc-900 pb-1.5">
              TELEMETRY_LEDGER_STATS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-900/30 p-2 rounded-lg border border-zinc-900/50 text-center">
                <span className="text-[8px] text-zinc-500 block uppercase">TOTAL LOGGED</span>
                <span className="text-lg font-black text-white font-mono mt-0.5 block">{stats.ALL}</span>
              </div>
              <div className="bg-zinc-900/30 p-2 rounded-lg border border-zinc-900/50 text-center">
                <span className="text-[8px] text-purple-400 block uppercase">ADMIN COMMANDS</span>
                <span className="text-lg font-black text-purple-400 font-mono mt-0.5 block">{stats.ADMIN_ACTION}</span>
              </div>
              <div className="bg-zinc-900/30 p-2 rounded-lg border border-zinc-900/50 text-center">
                <span className="text-[8px] text-blue-400 block uppercase">TRANSITIONS</span>
                <span className="text-lg font-black text-blue-400 font-mono mt-0.5 block">{stats.VIEW_SWITCH}</span>
              </div>
              <div className="bg-zinc-900/30 p-2 rounded-lg border border-zinc-900/50 text-center">
                <span className="text-[8px] text-amber-500 block uppercase">ALERTS / WARNS</span>
                <span className="text-lg font-black text-amber-500 font-mono mt-0.5 block">{stats.SYSTEM_ALERT}</span>
              </div>
            </div>
          </div>

          {/* Log Inspector */}
          <div className="flex-1 bg-black/40 border border-zinc-900 rounded-xl p-3 flex flex-col min-h-[220px]">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block border-b border-zinc-900 pb-1.5">
              SECURE_LOG_INSPECTOR
            </span>
            
            <AnimatePresence mode="wait">
              {selectedLog ? (
                <motion.div
                  key={selectedLog.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col pt-3 space-y-3"
                >
                  <div className="space-y-1">
                    <span className="text-[8px] text-zinc-600 font-bold block uppercase">LOG_ID</span>
                    <span className="text-[9px] text-zinc-300 select-all font-mono break-all">{selectedLog.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[8px] text-zinc-600 font-bold block uppercase">MACHINE NODE</span>
                      <span className="text-[9px] text-zinc-300 font-bold">{selectedLog.machineId}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-600 font-bold block uppercase">SYSTEM ROLE</span>
                      <span className="text-[9px] text-zinc-300 font-bold uppercase">{selectedLog.role}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] text-zinc-600 font-bold block uppercase">OPERATOR COVENANT</span>
                    <span className="text-[9px] text-zinc-300 font-mono font-black break-all select-all">
                      {selectedLog.userEmail}
                    </span>
                  </div>

                  {selectedLog.fromView && (
                    <div className="grid grid-cols-2 gap-2 bg-zinc-950/75 p-2 rounded-lg border border-zinc-900">
                      <div>
                        <span className="text-[7.5px] text-zinc-600 font-bold block uppercase">DEPARTED VIEW</span>
                        <span className="text-[9px] text-zinc-400 font-bold">{selectedLog.fromView}</span>
                      </div>
                      <div>
                        <span className="text-[7.5px] text-purple-500 font-bold block uppercase">TARGET VIEW</span>
                        <span className="text-[9px] text-purple-400 font-bold">{selectedLog.toView}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 space-y-1 overflow-hidden flex flex-col">
                    <span className="text-[8px] text-zinc-600 font-bold block uppercase">STRUCTURAL DETAILS</span>
                    <div className="flex-1 bg-black/85 p-2 rounded-lg border border-zinc-900 overflow-y-auto text-[9px] text-emerald-400 font-mono whitespace-pre-wrap select-text leading-relaxed">
                      {selectedLog.details ? (
                        JSON.stringify(selectedLog.details, null, 2)
                      ) : (
                        `// No explicit telemetry payload. \n// Transition armored correctly.\n// Integrity check pass.`
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <HelpCircle className="w-8 h-8 text-zinc-800 mb-2" />
                  <span className="text-[9px] text-zinc-600 uppercase font-black">No Log Selected</span>
                  <p className="text-[8px] text-zinc-700 uppercase mt-1">
                    Click any event in the chronological timeline to inspect its comprehensive variables, security context, and structural payload.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </div>
  );
};
