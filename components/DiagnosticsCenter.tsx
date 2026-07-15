import React, { useState, useMemo, useEffect } from 'react';
import { DIAGNOSTIC_TROUBLE_CODES } from '../constants';
import type { VehicleSystem, MainView, SystemStatus, SystemState } from '../types';
import { WarningIcon, ZapIcon, SignalIcon, FireIcon, ActivityIcon, CheckCircleIcon } from './icons';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  BatteryCharging, 
  Zap, 
  Gauge, 
  Thermometer, 
  TrendingUp,
  Sliders,
  Activity
} from 'lucide-react';

const systemFilters: (VehicleSystem | 'All')[] = ['All', 'Engine', 'Battery', 'Navigation', 'Infotainment', 'Handling'];
const vehicleSystems: VehicleSystem[] = ['Engine', 'Battery', 'Navigation', 'Infotainment', 'Handling'];

interface DiagnosticsCenterProps {
  onSetView: (view: MainView) => void;
  systemStatus?: SystemStatus;
  onUpdateSystemStatus?: (system: VehicleSystem, state: SystemState) => void;
}

export const DiagnosticsCenter: React.FC<DiagnosticsCenterProps> = ({ onSetView, systemStatus, onUpdateSystemStatus }) => {
  const [activeFilter, setActiveFilter] = useState<VehicleSystem | 'All'>('All');

  // Primitives for dependency stability
  const engineState = systemStatus?.Engine || 'OK';
  const batteryState = systemStatus?.Battery || 'OK';
  const handlingState = systemStatus?.Handling || 'OK';
  const infotainmentState = systemStatus?.Infotainment || 'OK';

  // State for interactive features
  const [dampenActive, setDampenActive] = useState(false);
  const [auxReduced, setAuxReduced] = useState(false);
  const [overclockSecs, setOverclockSecs] = useState(0);

  // Chart view tab (Realtime Load vs 10-Minute Trend)
  const [batteryChartView, setBatteryChartView] = useState<'LIVE_LOAD' | 'TREND_10M'>('LIVE_LOAD');

  // Initial historic 10-minute power trend data (10 intervals at 1-minute intervals)
  const [tenMinTrendData, setTenMinTrendData] = useState(() => {
    const data = [];
    const now = Date.now();
    for (let i = 10; i >= 1; i--) {
      const d = new Date(now - i * 60 * 1000);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      data.push({
        time: timeStr,
        draw: Math.floor(40 + Math.random() * 15),
      });
    }
    return data;
  });

  // Initial historic battery data (12 intervals)
  const [batteryData, setBatteryData] = useState(() => {
    const data = [];
    const now = Date.now();
    for (let i = 11; i >= 0; i--) {
      const timeStr = new Date(now - i * 4000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      data.push({
        time: timeStr,
        draw: Math.floor(42 + Math.random() * 10),
        efficiency: Math.floor(92 + Math.random() * 4),
        temp: Math.floor(34 + Math.random() * 3),
      });
    }
    return data;
  });

  // Countdown timer for overclocking
  useEffect(() => {
    if (overclockSecs <= 0) return;
    const timer = setTimeout(() => {
      setOverclockSecs(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [overclockSecs]);

  // Periodic interval adding a new data point to Recharts
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryData(prev => {
        const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        let baseDraw = 46; 
        let baseTemp = 35;
        let baseEff = 93;

        // Apply impacts from core engine manual system states
        if (engineState === 'Warning') {
          baseDraw += 18;
          baseTemp += 7;
          baseEff -= 9;
        } else if (engineState === 'Error') {
          baseDraw += 38;
          baseTemp += 16;
          baseEff -= 22;
        }

        if (batteryState === 'Warning') {
          baseDraw += 10;
          baseTemp += 11;
          baseEff -= 13;
        } else if (batteryState === 'Error') {
          baseDraw += 25;
          baseTemp += 24;
          baseEff -= 32;
        }

        if (handlingState === 'Warning' || handlingState === 'Error') {
          baseDraw += 7;
          baseTemp += 3;
        }

        if (infotainmentState === 'Warning' || infotainmentState === 'Error') {
          baseDraw += 4;
        }

        // Apply interactive custom controls
        if (auxReduced) {
          baseDraw -= 12;
          baseEff += 2;
        }

        if (overclockSecs > 0) {
          baseDraw += 62;
          baseTemp += 22;
          baseEff -= 15;
        }

        // Variance / Noise control
        const variance = dampenActive ? 1.5 : 7;
        const randomNoiseDraw = Math.random() * variance - (variance / 2);
        const randomNoiseTemp = Math.random() * 1.6 - 0.8;
        const randomNoiseEff = Math.random() * 2 - 1;

        const newPoint = {
          time: nextTime,
          draw: Math.max(5, Math.floor(baseDraw + randomNoiseDraw)),
          efficiency: Math.max(15, Math.min(100, Math.floor(baseEff + randomNoiseEff))),
          temp: Math.max(15, Math.floor(baseTemp + randomNoiseTemp)),
        };

        // Update 10-minute trend data in tandem
        setTenMinTrendData(prevTrend => {
          const currentMinuteStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const lastPoint = prevTrend[prevTrend.length - 1];
          const newDraw = Math.max(5, Math.floor(baseDraw + randomNoiseDraw));

          if (lastPoint && lastPoint.time === currentMinuteStr) {
            const updated = [...prevTrend];
            updated[updated.length - 1] = {
              ...lastPoint,
              draw: Math.floor(lastPoint.draw * 0.95 + newDraw * 0.05),
            };
            return updated;
          } else {
            const nextPoint = {
              time: currentMinuteStr,
              draw: newDraw,
            };
            return [...prevTrend.slice(1), nextPoint];
          }
        });

        return [...prev.slice(1), newPoint];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [engineState, batteryState, handlingState, infotainmentState, dampenActive, auxReduced, overclockSecs > 0]);

  const latestPoint = batteryData[batteryData.length - 1] || { draw: 45, efficiency: 95, temp: 35 };

  const handleOverclock = () => {
    if (overclockSecs > 0) return;
    setOverclockSecs(10);
  };

  const filteredCodes = useMemo(() => {
    if (activeFilter === 'All') {
      return DIAGNOSTIC_TROUBLE_CODES;
    }
    return DIAGNOSTIC_TROUBLE_CODES.filter(code => code.system === activeFilter);
  }, [activeFilter]);

  const cycleStatus = (system: VehicleSystem) => {
    if (!systemStatus || !onUpdateSystemStatus) return;
    const currentState = systemStatus[system];
    const states: SystemState[] = ['OK', 'Warning', 'Error'];
    const nextIdx = (states.indexOf(currentState) + 1) % states.length;
    onUpdateSystemStatus(system, states[nextIdx]);
  };

  const getStatusColorClass = (state: SystemState) => {
    switch (state) {
      case 'Error': return 'bg-red-600 text-white border-red-400';
      case 'Warning': return 'bg-amber-500 text-black border-amber-300';
      default: return 'bg-green-600 text-black border-green-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg">
      <div className="p-4 border-b-4 border-black sticky top-0 z-10 bg-gray-800 rounded-t-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="font-comic-header text-3xl text-white">Diagnostics Center</h2>
            <p className="text-gray-400 -mt-1 uppercase text-[10px] font-black tracking-widest">Forensic Hub 0x03E2</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button 
                onClick={() => onSetView('system_diagnostic')}
                className="vista-button flex-1 sm:flex-none px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-[2px_2px_0_0_#000]"
            >
                <ActivityIcon className="w-4 h-4" />
                <span>System Logs</span>
            </button>
            <button 
                onClick={() => onSetView('healing_matrix')}
                className="vista-button flex-1 sm:flex-none px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-[2px_2px_0_0_#000]"
            >
                <FireIcon className="w-4 h-4" />
                <span>SYSTEM HEAL</span>
            </button>
            <button 
                onClick={() => onSetView('powertrain_conjunction')}
                className="vista-button flex-1 sm:flex-none px-3 py-2 bg-green-600 hover:bg-green-500 text-black font-black uppercase text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-[2px_2px_0_0_#000]"
            >
                <SignalIcon className="w-4 h-4" />
                <span>Sync</span>
            </button>
        </div>
      </div>

      <div className="p-4 border-b-4 border-black space-y-4">
        {/* System Override Panel */}
        <div className="aero-panel p-4 bg-black/40 border-2 border-white/5">
            <div className="flex items-center gap-2 mb-3">
                <ActivityIcon className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Manual System Override</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {vehicleSystems.map(sys => {
                    const state = systemStatus?.[sys] || 'OK';
                    return (
                        <button
                            key={sys}
                            onClick={() => cycleStatus(sys)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all active:scale-95 ${getStatusColorClass(state)}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-tighter mb-1">{sys}</span>
                            <span className="text-[8px] font-bold">{state}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mr-2">Filter Shards:</span>
          {systemFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 text-sm rounded-full border-2 border-black font-bold transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-violet-500 text-white comic-button shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-4">
          {/* Battery Load & Power Coupling Telemetry */}
          <div className="bg-zinc-950/60 p-5 rounded-2xl border-2 border-zinc-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col gap-5 backdrop-blur-md relative overflow-hidden">
            {/* Absolute Ambient Grid Accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Telemetry Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${overclockSecs > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-black text-gray-500 uppercase tracking-widest">Core Battery Load Telemetry</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-comic-header text-lg text-white font-black tracking-wide">AetherOS Core Load Meter</span>
                    {overclockSecs > 0 ? (
                      <span className="bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[8px] font-mono px-2 py-0.5 rounded-full uppercase animate-pulse">
                        Overclocking: {overclockSecs}s
                      </span>
                    ) : (
                      <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[8px] font-mono px-2 py-0.5 rounded-full uppercase">
                        Coupled & Stable
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Side controls inside the panel */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setDampenActive(!dampenActive)}
                  className={`px-3 py-1.5 rounded-lg border text-[9px] font-mono uppercase font-bold transition-all flex items-center gap-1.5 ${
                    dampenActive
                      ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>Dampen Waves: {dampenActive ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => setAuxReduced(!auxReduced)}
                  className={`px-3 py-1.5 rounded-lg border text-[9px] font-mono uppercase font-bold transition-all flex items-center gap-1.5 ${
                    auxReduced
                      ? 'bg-teal-500/20 border-teal-400/40 text-teal-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>Aux Load: {auxReduced ? 'LOW' : 'STD'}</span>
                </button>

                <button
                  onClick={handleOverclock}
                  disabled={overclockSecs > 0}
                  className={`px-3 py-1.5 rounded-lg border text-[9px] font-mono uppercase font-bold transition-all flex items-center gap-1.5 ${
                    overclockSecs > 0
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500/40 cursor-not-allowed'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400 active:scale-95'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>{overclockSecs > 0 ? 'Overclock Active' : 'Overclock 10s'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Indicators Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" /> Power Discharge
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-mono font-bold text-white">{latestPoint.draw}</span>
                  <span className="text-[9px] font-mono text-zinc-400">kW</span>
                </div>
              </div>

              <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Core Thermal
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-xl font-mono font-bold ${latestPoint.temp > 50 ? 'text-red-400' : latestPoint.temp > 42 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {latestPoint.temp}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">°C</span>
                </div>
              </div>

              <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-sky-400" /> Grid Efficiency
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-xl font-mono font-bold ${latestPoint.efficiency > 85 ? 'text-emerald-400' : latestPoint.efficiency > 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {latestPoint.efficiency}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">%</span>
                </div>
              </div>

              <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Load Target
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-mono font-bold text-zinc-300">150</span>
                  <span className="text-[9px] font-mono text-zinc-500">kW max</span>
                </div>
              </div>
            </div>

            {/* Chart View Selector Tabs */}
            <div className="flex gap-1 bg-[#09090b]/80 p-1 rounded-xl border border-zinc-800/60 max-w-[280px]">
              <button
                type="button"
                onClick={() => setBatteryChartView('LIVE_LOAD')}
                className={`flex-1 text-center py-1.5 text-[9px] font-mono font-black uppercase tracking-widest rounded-lg transition-all ${
                  batteryChartView === 'LIVE_LOAD'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/40 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                    : 'text-zinc-500 hover:text-zinc-400'
                }`}
              >
                Live Load
              </button>
              <button
                type="button"
                onClick={() => setBatteryChartView('TREND_10M')}
                className={`flex-1 text-center py-1.5 text-[9px] font-mono font-black uppercase tracking-widest rounded-lg transition-all ${
                  batteryChartView === 'TREND_10M'
                    ? 'bg-purple-950/80 text-purple-400 border border-purple-900/40 shadow-[0_0_10px_rgba(139,92,246,0.1)]'
                    : 'text-zinc-500 hover:text-zinc-400'
                }`}
              >
                10-Min Trend
              </button>
            </div>

            {/* Recharts Chart View */}
            <div className="relative w-full h-[220px] sm:h-[250px] bg-[#050507]/40 rounded-xl border border-zinc-800/60 p-2.5">
              <ResponsiveContainer width="100%" height="100%">
                {batteryChartView === 'LIVE_LOAD' ? (
                  <AreaChart
                    data={batteryData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorDraw" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#52525b" 
                      fontSize={8} 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={8} 
                      tickLine={false} 
                      domain={[0, 'auto']} 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#09090b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                      }}
                      labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', paddingTop: '5px' }}
                      verticalAlign="bottom"
                      height={20}
                    />
                    <Area 
                      type="monotone" 
                      name="Battery Draw (kW)" 
                      dataKey="draw" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorDraw)" 
                    />
                    <Area 
                      type="monotone" 
                      name="Thermal Core (°C)" 
                      dataKey="temp" 
                      stroke="#f59e0b" 
                      strokeWidth={1.5}
                      fillOpacity={1} 
                      fill="url(#colorTemp)" 
                    />
                  </AreaChart>
                ) : (
                  <LineChart
                    data={tenMinTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#52525b" 
                      fontSize={8} 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={8} 
                      tickLine={false} 
                      domain={[0, 'auto']} 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#09090b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                      }}
                      labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', paddingTop: '5px' }}
                      verticalAlign="bottom"
                      height={20}
                    />
                    <Line 
                      type="monotone" 
                      name="Battery Draw Trend (kW)" 
                      dataKey="draw" 
                      stroke="#c084fc" 
                      strokeWidth={3}
                      dot={{ r: 4, stroke: '#a855f7', strokeWidth: 1, fill: '#09090b' }}
                      activeDot={{ r: 6, stroke: '#d8b4fe', strokeWidth: 2, fill: '#a855f7' }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {filteredCodes.map(code => (
            <div key={code.code} className="p-4 bg-gray-800/50 rounded-xl border-2 border-black flex items-start justify-between gap-4 group hover:border-violet-500/50 transition-all">
               <div className="flex items-start gap-4">
                  <WarningIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${code.severity === 'Error' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3">
                        <p className="font-mono text-lg font-bold text-white tracking-widest">{code.code}</p>
                        <p className={`text-[8px] font-black px-2 py-0.5 rounded-full border border-black uppercase tracking-widest ${
                          code.system === 'Handling' ? 'bg-blue-900 text-blue-300' : 'bg-gray-900 text-gray-500'
                        }`}>{code.system}</p>
                    </div>
                    <p className="text-gray-300 leading-tight mt-1 text-sm italic">"{code.description}"</p>
                    <p className="text-[7px] text-gray-700 font-mono mt-2 uppercase">Signature: {code.signature}</p>
                  </div>
               </div>
               <button 
                onClick={() => onSetView('healing_matrix')}
                className="opacity-0 group-hover:opacity-100 transition-opacity vista-button px-3 py-1 bg-violet-600 text-white font-black uppercase text-[8px] rounded-lg flex items-center gap-2 whitespace-nowrap"
               >
                 <ZapIcon className="w-3 h-3" />
                 Heal Shard
               </button>
            </div>
          ))}
          {filteredCodes.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-20">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                  <p className="font-comic-header text-2xl uppercase tracking-widest">All Shards Harmonized</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
