import React, { useState, useEffect, useRef } from 'react';
import { ActivityIcon, ShieldIcon, TerminalIcon, ServerIcon, AlertTriangleIcon, WrenchIcon, CheckCircleIcon } from './icons';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
}

interface Metrics {
  t: number;
  m1_total: number;
  m2_total: number;
  alpha_empirical: number;
  alpha_t: number;
  E_t: number;
  JS: number;
  MCI: number;
  sigma_ppl: number;
  LRD: number;
  status: 'Idle' | 'Running' | 'Suspended' | 'Correcting';
}

export const SelfHealingCRTView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    t: 0,
    m1_total: 1000, // initial archival_P0
    m2_total: 0,
    alpha_empirical: 1.0,
    alpha_t: 0.1,
    E_t: 0,
    JS: 0,
    MCI: 0,
    sigma_ppl: 0,
    LRD: 0,
    status: 'Idle'
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Constants from pseudo-code
  const alpha_min = 0.10;
  const B = 5.0; // Entropy budget
  const kappa = 2.0; // Sensitivity
  const emergency_alpha_threshold = 0.05;
  const w1 = 1.0, w2 = 1.5, w3 = 0.5, w4 = 1.2;

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString().substring(11, 19),
      message,
      type
    }].slice(-50)); // Keep last 50 logs
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setMetrics(prev => {
          if (prev.status === 'Suspended') {
            setIsRunning(false);
            return prev;
          }

          const t = prev.t + 1;
          
          // 1. Generate synthetic batch
          const n_synth = Math.floor(Math.random() * 500) + 500;
          let new_m2 = prev.m2_total + n_synth;

          // 2. Ingest new real data batch
          const n_real = Math.floor(Math.random() * 100) + 50;
          let new_m1 = prev.m1_total + n_real;

          // 3. Update dataset composition
          let alpha_empirical = new_m1 / (new_m1 + new_m2);

          // 4. Compute entropy signals (simulated drift)
          // Entropy tends to increase as synthetic data grows, unless corrected
          const drift_factor = (new_m2 / new_m1) * 0.05;
          const JS = Math.min(2.0, Math.max(0, prev.JS + (Math.random() * 0.2 - 0.05) + drift_factor));
          const MCI = Math.min(2.0, Math.max(0, prev.MCI + (Math.random() * 0.2 - 0.05) + drift_factor));
          const sigma_ppl = Math.min(2.0, Math.max(0, prev.sigma_ppl + (Math.random() * 0.2 - 0.05) + drift_factor));
          const LRD = Math.min(2.0, Math.max(0, prev.LRD + (Math.random() * 0.2 - 0.05) + drift_factor));
          
          const E_t = w1*JS + w2*MCI + w3*sigma_ppl + w4*LRD;

          // 5. Regulate alpha
          const alpha_t = Math.min(1.0, Math.max(alpha_min, alpha_min + (1 - alpha_min) * Math.exp(-kappa * E_t / B)));

          let currentStatus: Metrics['status'] = 'Running';

          // 9. Audit and circuit breakers (Check first to prevent bad state)
          if (E_t > B || alpha_empirical < emergency_alpha_threshold) {
            addLog(`CIRCUIT BREAKER ACTIVATED at t=${t}. E_t=${E_t.toFixed(2)}, alpha=${alpha_empirical.toFixed(3)}`, 'error');
            addLog('Suspending recursive updates. Reverting to last stable checkpoint.', 'system');
            setIsRunning(false);
            return {
              ...prev,
              t,
              E_t, JS, MCI, sigma_ppl, LRD,
              alpha_empirical, alpha_t,
              status: 'Suspended'
            };
          }

          // 6. If empirical alpha below regulated alpha, trigger correction
          if (alpha_empirical < alpha_t) {
            currentStatus = 'Correcting';
            const total_size = new_m1 + new_m2;
            const corrective_samples = Math.ceil((alpha_t - alpha_empirical) * total_size) + 200; // +200 for human corrections
            
            addLog(`Correction Engine Triggered! Injecting ${corrective_samples} real/archival samples.`, 'warning');
            
            // Prune synthetic high entropy (simulated by reducing m2)
            const pruned = Math.floor(new_m2 * 0.1);
            new_m2 -= pruned;
            addLog(`Pruned ${pruned} high-entropy synthetic samples.`, 'info');

            new_m1 += corrective_samples;
            alpha_empirical = new_m1 / (new_m1 + new_m2);
          }

          // 8. Mirror Node integration
          if (Math.random() > 0.8) {
            const mirror_feedback = Math.floor(Math.random() * 50) + 10;
            new_m1 += mirror_feedback;
            alpha_empirical = new_m1 / (new_m1 + new_m2);
            addLog(`Mirror Node feedback: Ingested ${mirror_feedback} high-value samples.`, 'success');
          }

          if (t % 5 === 0 && currentStatus !== 'Correcting') {
            addLog(`Iteration ${t} complete. E_t: ${E_t.toFixed(2)} | Alpha: ${alpha_empirical.toFixed(3)}`);
          }

          return {
            t,
            m1_total: new_m1,
            m2_total: new_m2,
            alpha_empirical,
            alpha_t,
            E_t,
            JS,
            MCI,
            sigma_ppl,
            LRD,
            status: currentStatus
          };
        });
      }, 1500); // Run loop every 1.5 seconds
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartStop = () => {
    if (metrics.status === 'Suspended') {
      // Reset if suspended
      setMetrics({
        t: 0,
        m1_total: 1000,
        m2_total: 0,
        alpha_empirical: 1.0,
        alpha_t: 0.1,
        E_t: 0,
        JS: 0,
        MCI: 0,
        sigma_ppl: 0,
        LRD: 0,
        status: 'Idle'
      });
      setLogs([]);
      addLog('System reset. Ready to initialize SH-CRT Loop.', 'system');
    } else {
      setIsRunning(!isRunning);
      if (!isRunning && metrics.t === 0) {
        addLog('Initializing archival_P0 and generator P_t0...', 'system');
        addLog(`Parameters: alpha_min=${alpha_min}, B=${B}, kappa=${kappa}`, 'system');
      }
      addLog(isRunning ? 'SH-CRT Loop Paused.' : 'SH-CRT Loop Started.', 'system');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'text-emerald-500';
      case 'Correcting': return 'text-amber-500';
      case 'Suspended': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-amber-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-emerald-400';
      case 'system': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] text-gray-200 font-mono overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-black flex justify-between items-center relative z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-900/20 border border-blue-500/30 flex items-center justify-center">
            <ActivityIcon className={`w-6 h-6 text-blue-400 ${isRunning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Self-Healing CRT Loop</h2>
            <p className="text-xs text-blue-400/70 uppercase tracking-widest mt-1">SH-CRT Recursive Training Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 flex items-center gap-3">
            <span className="text-xs text-gray-500 uppercase">Status</span>
            <span className={`text-sm font-bold uppercase ${getStatusColor(metrics.status)}`}>
              {metrics.status}
            </span>
          </div>
          <button 
            onClick={handleStartStop}
            className={`px-6 py-2 rounded-lg font-bold uppercase text-xs tracking-widest flex items-center gap-2 transition-colors ${
              metrics.status === 'Suspended' 
                ? 'bg-red-900/50 text-red-400 border border-red-500/50 hover:bg-red-900' 
                : isRunning 
                  ? 'bg-amber-900/50 text-amber-400 border border-amber-500/50 hover:bg-amber-900'
                  : 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-900'
            }`}
          >
            {metrics.status === 'Suspended' ? (
              <><WrenchIcon className="w-4 h-4" /> Reset System</>
            ) : isRunning ? (
              <><ShieldIcon className="w-4 h-4" /> Pause Loop</>
            ) : (
              <><CheckCircleIcon className="w-4 h-4" /> Start Loop</>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Panel: Metrics & Gauges */}
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto border-r border-gray-800 space-y-6 custom-scrollbar">
          
          {/* Top Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Iteration (t)</div>
              <div className="text-3xl font-light text-white">{metrics.t}</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Samples</div>
              <div className="text-3xl font-light text-white">{(metrics.m1_total + metrics.m2_total).toLocaleString()}</div>
            </div>
          </div>

          {/* Dataset Composition */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
              <ServerIcon className="w-4 h-4 text-blue-400" /> Dataset Composition
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400">Real/Archival (m1)</span>
                  <span className="text-gray-400">{metrics.m1_total.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(metrics.m1_total / (metrics.m1_total + metrics.m2_total)) * 100}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-purple-400">Synthetic (m2)</span>
                  <span className="text-gray-400">{metrics.m2_total.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${(metrics.m2_total / (metrics.m1_total + metrics.m2_total)) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Empirical Alpha</div>
                <div className={`text-xl font-mono ${metrics.alpha_empirical < metrics.alpha_t ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {metrics.alpha_empirical.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Regulated Alpha (t)</div>
                <div className="text-xl font-mono text-blue-400">
                  {metrics.alpha_t.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Entropy Signals */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-amber-400" /> Entropy Signals
              </h3>
              <div className={`text-xs px-2 py-1 rounded border ${metrics.E_t > B ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                Budget (B): {B.toFixed(1)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">JS Divergence</div>
                <div className="text-lg text-gray-300 font-mono">{metrics.JS.toFixed(3)}</div>
              </div>
              <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Mode Collapse (MCI)</div>
                <div className="text-lg text-gray-300 font-mono">{metrics.MCI.toFixed(3)}</div>
              </div>
              <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Perplexity Std (σ)</div>
                <div className="text-lg text-gray-300 font-mono">{metrics.sigma_ppl.toFixed(3)}</div>
              </div>
              <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Latent Distortion (LRD)</div>
                <div className="text-lg text-gray-300 font-mono">{metrics.LRD.toFixed(3)}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <div className="flex justify-between items-end mb-2">
                <div className="text-xs text-gray-400 uppercase tracking-widest">Total Entropy (E_t)</div>
                <div className={`text-2xl font-mono ${metrics.E_t > B ? 'text-red-500' : metrics.E_t > B * 0.8 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {metrics.E_t.toFixed(3)}
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${metrics.E_t > B ? 'bg-red-500' : metrics.E_t > B * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${Math.min(100, (metrics.E_t / B) * 100)}%` }} 
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Panel: Terminal Logs */}
        <div className="w-full lg:w-1/2 bg-black flex flex-col border-t lg:border-t-0 lg:border-l border-gray-800">
          <div className="p-4 border-b border-gray-800 flex items-center gap-2 bg-gray-900/30">
            <TerminalIcon className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Audit Log</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic">Waiting for system initialization...</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex gap-3 hover:bg-gray-900/30 p-1 rounded transition-colors">
                  <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
                  <span className={`${getLogColor(log.type)} break-words`}>
                    {log.type === 'error' && <AlertTriangleIcon className="w-3 h-3 inline mr-1 -mt-0.5" />}
                    {log.type === 'warning' && <ShieldIcon className="w-3 h-3 inline mr-1 -mt-0.5" />}
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
