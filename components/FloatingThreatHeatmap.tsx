import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  Trash2, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Flame, 
  TrendingUp, 
  Crosshair,
  Zap,
  Info
} from 'lucide-react';

interface HistoricPoint {
  id?: string;
  x: number;
  y: number;
  weight: number;
  timestamp: number;
}

interface FloatingThreatHeatmapProps {
  shards: Array<{ id: string; threatLevel: string; origin: string; status: string }>;
  className?: string;
}

export const FloatingThreatHeatmap: React.FC<FloatingThreatHeatmapProps> = ({ shards, className }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [history, setHistory] = useState<HistoricPoint[]>([]);
  const [timeWindowSecs, setTimeWindowSecs] = useState<number>(60); // 10s to 60s slider
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Position offset state for simulated movement of the panel itself (draggable layout reference)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Core background simulation and real shard capture interval
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = Date.now();

      // 1. Process active shards from props & simulate realistic coordinate movement
      const capturedPoints: HistoricPoint[] = shards
        .filter(s => s.status !== 'PURGED')
        .map((s, idx) => {
          // Compute logical mapping for coordinate positions matching active vectors
          const angle = (45 + idx * 135 + (idx * 17) % 360) % 360;
          // Shards drift inwards slowly over time
          const period = 20; // 20s travel period
          const elapsedSecs = (now / 1000) + idx * 4;
          const progress = (elapsedSecs % period) / period;
          const distance = 110 - (progress * 90); // radius 110 to 20

          const rad = (angle * Math.PI) / 180;
          const x = distance * Math.cos(rad);
          const y = distance * Math.sin(rad);

          let weight = 1.0;
          if (s.threatLevel === 'CRITICAL') weight = 4.0;
          else if (s.threatLevel === 'HIGH') weight = 2.5;
          else if (s.threatLevel === 'MEDIUM') weight = 1.5;

          return {
            id: s.id,
            x,
            y,
            weight,
            timestamp: now
          };
        });

      // 2. Add realistic background vector streams (sensory threat drift noise)
      const noiseCount = 4;
      const noisePoints: HistoricPoint[] = [];
      for (let i = 0; i < noiseCount; i++) {
        const timeFactor = (now / 1000) + i * 15;
        // Lissajous / parametric circular paths for dynamic spatial drift density
        const radius = 30 + Math.abs(Math.sin(timeFactor * 0.1) * 75);
        const angle = (timeFactor * 12 + i * 45) % 360;
        const rad = (angle * Math.PI) / 180;
        const x = radius * Math.cos(rad);
        const y = radius * Math.sin(rad);

        noisePoints.push({
          id: `NOISE-0${i}`,
          x,
          y,
          weight: 0.6,
          timestamp: now
        });
      }

      // Append new sample ticks and discard data older than 60 seconds
      setHistory(prev => {
        const cutoff = now - 60000;
        return [...prev, ...capturedPoints, ...noisePoints].filter(pt => pt.timestamp >= cutoff);
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [shards, isLive]);

  // Clean historical records
  const handleFlush = () => {
    setHistory([]);
    setHoveredCell(null);
  };

  // Filter history points based on selected observation time window
  const filteredHistory = useMemo(() => {
    const cutoff = Date.now() - (timeWindowSecs * 1000);
    return history.filter(pt => pt.timestamp >= cutoff);
  }, [history, timeWindowSecs]);

  // Map 2D coordinate points into an 8x8 spatial density matrix
  // Coordinates X/Y are modeled as range [-120, 120]
  const GRID_SIZE = 8;
  const RANGE = 240; // -120 to 120
  const STEP = RANGE / GRID_SIZE; // 30 units per block

  const densityGrid = useMemo(() => {
    const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

    filteredHistory.forEach(pt => {
      // Offset X and Y to translate [-120, 120] to [0, RANGE]
      const shiftedX = pt.x + 120;
      const shiftedY = pt.y + 120;

      // Calculate indices (clamped safely inside bounds)
      const col = Math.min(GRID_SIZE - 1, Math.max(0, Math.floor(shiftedX / STEP)));
      const row = Math.min(GRID_SIZE - 1, Math.max(0, Math.floor(shiftedY / STEP)));

      grid[row][col] += pt.weight;
    });

    return grid;
  }, [filteredHistory]);

  // Calculate peak density details
  const peakDensityInfo = useMemo(() => {
    let maxVal = 0;
    const maxCells: Array<{ row: number; col: number; val: number }> = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = densityGrid[r][c];
        if (val > 0) {
          maxCells.push({ row: r, col: c, val });
        }
        if (val > maxVal) {
          maxVal = val;
        }
      }
    }

    const peakCell = maxCells.find(cell => cell.val === maxVal) || null;
    
    // Total aggregate heat volume
    const totalVolume = maxCells.reduce((sum, cell) => sum + cell.val, 0);

    return {
      peakCell,
      maxValue: parseFloat(maxVal.toFixed(1)),
      totalVolume: parseFloat(totalVolume.toFixed(1))
    };
  }, [densityGrid]);

  // Compute color scale matching density value
  const getCellBgClass = (val: number) => {
    if (val === 0) return 'bg-zinc-950/60 border-zinc-900/40 hover:bg-zinc-900/30';
    if (val < 1.0) return 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400 font-bold';
    if (val < 3.0) return 'bg-blue-900/40 border-blue-500/30 text-blue-300 font-bold';
    if (val < 6.0) return 'bg-indigo-900/40 border-indigo-500/40 text-indigo-200 font-mono';
    if (val < 12.0) return 'bg-orange-950/60 border-orange-600/50 text-orange-400 animate-pulse';
    return 'bg-red-950/70 border-red-500/80 text-red-200 font-extrabold animate-pulse shadow-[inset_0_0_8px_rgba(239,68,68,0.4)]';
  };

  // Convert row, col indexes to physical coordinates bounds
  const getGridLabel = (row: number, col: number) => {
    const xMin = -120 + col * STEP;
    const xMax = xMin + STEP;
    const yMin = -120 + row * STEP;
    const yMax = yMin + STEP;
    return `X: [${Math.round(xMin)} to ${Math.round(xMax)}], Y: [${Math.round(yMin)} to ${Math.round(yMax)}]`;
  };

  const getQuadrantLabelName = (row: number, col: number) => {
    const isNorth = row >= GRID_SIZE / 2;
    const isEast = col >= GRID_SIZE / 2;
    return `${isNorth ? 'NORTH' : 'SOUTH'}_${isEast ? 'EAST' : 'WEST'}`;
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={`absolute bottom-6 z-50 flex items-center gap-2 p-3 rounded-xl bg-zinc-950/95 border-2 border-dashed border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-400 transition-all font-mono text-[9px] font-black cursor-pointer uppercase animate-bounce ${className || 'left-6'}`}
        title="Open Historical Threat Heatmap Layout"
        id="reopen-heatmap-trigger"
      >
        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse animate-spin shrink-0" style={{ animationDuration: '4s' }} />
        <span>THREAT PANEL [H_{timeWindowSecs}S]</span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`absolute bottom-6 z-50 w-[310px] backdrop-blur-md bg-zinc-950/85 border-2 border-dashed border-cyan-500/30 rounded-2xl p-4 shadow-[0_8px_40px_rgba(0,0,0,0.8)] text-cyan-200 font-mono text-[9px] flex flex-col pointer-events-auto select-none border-blue-500/20 ${className || 'left-6'}`}
      id="floating-historical-heatmap-panel"
    >
      {/* Header dragging element & control labels */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <div>
            <span className="text-[10px] font-black uppercase text-cyan-400 block tracking-widest">
              HISTORICAL DENSITY [60S]
            </span>
            <span className="text-[7px] text-zinc-500 uppercase font-black tracking-wider">
              Cumulative Threat Vector Matrix
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-1 rounded text-[7px] font-black uppercase border ${
              isLive ? 'border-green-500/30 text-green-400 bg-green-950/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-400'
            }`}
            title={isLive ? 'Pause Capture feed' : 'Resume Capture feed'}
          >
            {isLive ? 'LIVE' : 'HALT'}
          </button>
          
          <button
            onClick={handleFlush}
            className="p-1 text-zinc-500 hover:text-red-500 hover:bg-zinc-900 rounded transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
            title="Purge Historical Buffer records"
          >
            <Trash2 className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-zinc-500 hover:text-cyan-400 hover:bg-zinc-900 rounded transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
            title="Minimize Panel Layout"
            id="minimize-heatmap-btn"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Grid Heatmap Visualization representation */}
      <div className="bg-black/60 rounded-xl p-2.5 border border-zinc-900 flex flex-col items-center justify-center relative mb-3">
        {/* Horizontal & Vertical grid coordinate guidelines */}
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
          <div className="w-[1px] h-full bg-cyan-400 border-l border-dashed border-cyan-400 mx-auto" />
        </div>
        <div className="absolute inset-0 flex items-center pointer-events-none opacity-10">
          <div className="h-[1px] w-full bg-cyan-400 border-t border-dashed border-cyan-400 my-auto" />
        </div>

        <div className="grid grid-cols-8 gap-0.5 w-[240px]">
          {densityGrid.map((rowArr, rIdx) => (
            rowArr.map((densityValue, cIdx) => {
              const bgClass = getCellBgClass(densityValue);
              const isHovered = hoveredCell?.row === rIdx && hoveredCell?.col === cIdx;
              const hasAlert = densityValue > 11.5;

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`h-6 rounded-sm border transition-all duration-300 relative cursor-crosshair flex items-center justify-center ${bgClass} ${
                    isHovered ? 'scale-110 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)] z-20' : ''
                  }`}
                  onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {/* Tiny dot inside to anchor design visual */}
                  {densityValue > 0 && (
                    <span className="text-[6px] font-sans font-bold leading-none tracking-tighter shrink-0 opacity-80" style={{ fontSize: '4.8px' }}>
                      {Math.ceil(densityValue)}
                    </span>
                  )}

                  {/* Hot Beacon micro pin indicator */}
                  {hasAlert && (
                    <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>
              );
            })
          ))}
        </div>

        {/* Polar Crosshair visual markers */}
        <div className="w-full flex justify-between p-1 text-[6.5px] text-zinc-600 font-bold">
          <span>-120x, -120y</span>
          <span>0,0 CENTER</span>
          <span>120x, 120y</span>
        </div>
      </div>

      {/* Observation Time Range Window slider controller */}
      <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900/60 mb-3 space-y-1.5">
        <div className="flex justify-between items-center text-[7.5px] font-black text-zinc-400">
          <span>TIME EVAL: Last {timeWindowSecs}s</span>
          <span className="text-zinc-600">SAMPLES: {filteredHistory.length} TRACKED</span>
        </div>
        <input 
          type="range"
          min="10"
          max="60"
          step="5"
          value={timeWindowSecs}
          onChange={(e) => setTimeWindowSecs(Number(e.target.value))}
          className="w-full h-1 accent-cyan-400 bg-zinc-800 rounded outline-none cursor-pointer"
        />
        <div className="flex justify-between text-[6px] text-zinc-600 font-black">
          <span>ZOOM: 10S</span>
          <span>30S</span>
          <span>FULL WINDOW: 60S</span>
        </div>
      </div>

      {/* Dynamic Inspector details / Peak values view */}
      <div className="bg-black border border-zinc-900/70 p-2 text-[7.5px] rounded-lg min-h-[58px] flex flex-col justify-center gap-1">
        {hoveredCell ? (
          <div className="space-y-1 font-mono text-left animate-in fade-in duration-100">
            <div className="flex justify-between text-[8px] uppercase">
              <span className="text-cyan-400 font-black flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-cyan-400 shrink-0" />
                SECTOR {getQuadrantLabelName(hoveredCell.row, hoveredCell.col)}
              </span>
              <span className="text-zinc-600">
                G({hoveredCell.row + 1},{hoveredCell.col + 1})
              </span>
            </div>
            <p className="text-zinc-400">{getGridLabel(hoveredCell.row, hoveredCell.col)}</p>
            <div className="flex justify-between items-center font-bold">
              <span className="text-zinc-500">AGGREGATE HEAP VALUE:</span>
              <span className={densityGrid[hoveredCell.row][hoveredCell.col] > 6 ? 'text-red-400 font-extrabold animate-pulse' : 'text-blue-400'}>
                {densityGrid[hoveredCell.row][hoveredCell.col].toFixed(1.5)} DB/M²
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-black tracking-wider block uppercase">SYSTEM PEAK SPECTRUM:</span>
              {peakDensityInfo.peakCell && (
                <span className="text-orange-400 font-black flex items-center gap-0.5 uppercase tracking-wide">
                  <Flame className="w-3 h-3 text-orange-400 shrink-0" />
                  PEAK ACCUMULATION ({peakDensityInfo.maxValue})
                </span>
              )}
            </div>

            {peakDensityInfo.peakCell ? (
              <div className="grid grid-cols-2 gap-1.5 text-[7px] text-zinc-400 bg-zinc-950/40 p-1 border border-zinc-900/60 rounded">
                <div>
                  <span className="text-zinc-600 font-bold block uppercase">HOTTEST COORDINATES:</span>
                  <span className="text-zinc-200 block text-[6.5px]">
                    {getQuadrantLabelName(peakDensityInfo.peakCell.row, peakDensityInfo.peakCell.col)} [G{peakDensityInfo.peakCell.row+1},{peakDensityInfo.peakCell.col+1}]
                  </span>
                </div>
                <div>
                  <span className="text-zinc-600 font-bold block uppercase">TOTAL MASS HEAT VOLUME:</span>
                  <span className="text-zinc-200 block text-[6.5px] font-sans font-bold text-cyan-400">
                    {peakDensityInfo.totalVolume} dBUnits
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 leading-normal text-[7px]">
                Capture feed active. Dynamic sensors are analyzing telemetry vectors to construct spatial coordinates maps inside the buffer. Coordinates will project here.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dynamic timeline small graph showing trends */}
      <div className="mt-2 text-[7px] text-zinc-600 flex justify-between items-center">
        <span className="flex items-center gap-1 uppercase">
          <TrendingUp className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
          Status Integrity:
        </span>
        <span className={`font-black uppercase font-mono ${peakDensityInfo.totalVolume > 50 ? 'text-rose-500 animate-pulse' : peakDensityInfo.totalVolume > 15 ? 'text-orange-400' : 'text-emerald-400'}`}>
          {peakDensityInfo.totalVolume > 50 ? '▲ ZONE ELEVATED RISKS' : peakDensityInfo.totalVolume > 15 ? '■ SIGNAL INFLUX COUPLING' : '● NOMINAL SAFE INTEGRITY'}
        </span>
      </div>
    </div>
  );
};
