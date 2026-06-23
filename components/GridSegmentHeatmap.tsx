import React, { useState, useEffect, useMemo } from 'react';
import { ActivityIcon, TrashIcon } from './icons';

interface HeatmapCell {
  quadrant: 'α' | 'β' | 'γ' | 'δ';
  quadrantIndex: number;
  ring: 'Core' | 'Inner' | 'Outer' | 'Deep';
  ringIndex: number;
  density: number; // 0 to 10 px / percentage
  activeCount: number;
  threatDetails: string[];
}

interface GridSegmentHeatmapProps {
  shards: Array<{ id: string; threatLevel: string; origin: string; status: string }>;
}

export const GridSegmentHeatmap: React.FC<GridSegmentHeatmapProps> = ({ shards }) => {
  // 4 Quadrants representing Bearing angles:
  // Q0 (Alpha): 0° - 90°
  // Q1 (Beta): 90° - 180°
  // Q2 (Gamma): 180° - 270°
  // Q3 (Delta): 270° - 360°
  const QUADRANTS = [
    { label: 'Alpha', symbol: 'α', angleRange: '0° - 90°' },
    { label: 'Beta', symbol: 'β', angleRange: '90° - 180°' },
    { label: 'Gamma', symbol: 'γ', angleRange: '180° - 270°' },
    { label: 'Delta', symbol: 'δ', angleRange: '270° - 360°' }
  ];

  // 4 Concentric Rings representing Depth:
  // Ring 0: Core [0 - 30]
  // Ring 1: Inner [30 - 65]
  // Ring 2: Outer [65 - 95]
  // Ring 3: Deep [95 - 120]
  const RINGS = [
    { label: 'Deep', range: '95 - 120', baseColor: 'border-blue-900/30' },
    { label: 'Outer', range: '65 - 95', baseColor: 'border-amber-900/30' },
    { label: 'Inner', range: '30 - 65', baseColor: 'border-orange-950/40' },
    { label: 'Core', range: '0 - 30', baseColor: 'border-red-950/40' }
  ];

  // Initialize heatmap state (4 Rings on Y-axis, 4 Quadrants on X-axis)
  const [gridData, setGridData] = useState<number[][]>(() => {
    // Generate initial low-level random signal background
    return Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => Math.random() * 0.15)
    );
  });

  const [historicalSum, setHistoricalSum] = useState<number>(0);
  const [hoveredCell, setHoveredCell] = useState<{ r: number; q: number } | null>(null);

  // Parse shards to simulate current positions for density contributions
  const activeSimulatedPoints = useMemo(() => {
    return shards
      .filter((s) => s.status === 'ISOLATED' || s.status === 'INCOMING')
      .map((s, idx) => {
        // Derive pseudo-angle and Pseudo-radius based on indexing to match radar visualization
        const angle = (45 + idx * 135 + (idx * 17) % 360) % 360;
        const radius = 25 + (idx * 35) % 95; // 0 - 120 scale
        
        // Determine Quadrant Index (0-3)
        const qIdx = Math.floor(angle / 90) % 4;
        
        // Determine Ring Index (0-3: Core, Inner, Outer, Deep)
        let rIdx = 0; // Core
        if (radius > 95) rIdx = 3; // Deep
        else if (radius > 65) rIdx = 2; // Outer
        else if (radius > 30) rIdx = 1; // Inner

        // Heat Weight based on Threat level
        let weight = 0.2;
        if (s.threatLevel === 'CRITICAL') weight = 2.5;
        else if (s.threatLevel === 'HIGH') weight = 1.6;
        else if (s.threatLevel === 'MEDIUM') weight = 0.9;

        return {
          id: s.id,
          qIdx,
          rIdx,
          weight,
          origin: s.origin,
          threatLevel: s.threatLevel
        };
      });
  }, [shards]);

  // Periodic Ticker updates historical density over time (with a decay rate & threat reinforcement)
  useEffect(() => {
    const interval = setInterval(() => {
      setGridData((prev) => {
        const next = prev.map((row) => row.map((val) => val * 0.92)); // Apply 8% decay per tick

        // 1. Inject active threats
        activeSimulatedPoints.forEach((pts) => {
          // Adjust for Ring Index order (RINGS matches indexing 0=Deep, 1=Outer, 2=Inner, 3=Core visually,
          // corresponding to rIdx mapping: 3=Deep(0), 2=Outer(1), 1=Inner(2), 0=Core(3))
          const visualRingIndex = 3 - pts.rIdx; 
          next[visualRingIndex][pts.qIdx] = Math.min(10, next[visualRingIndex][pts.qIdx] + pts.weight);
        });

        // 2. Add subtle ambient fluctuations (sensory noise) across all cells
        for (let r = 0; r < 4; r++) {
          for (let q = 0; q < 4; q++) {
            if (Math.random() > 0.75) {
              const noise = (Math.random() - 0.4) * 0.08;
              next[r][q] = Math.max(0, Math.min(10, next[r][q] + noise));
            }
          }
        }

        // Calculate continuous sum index for telemetry logging
        let sum = 0;
        for (let r = 0; r < 4; r++) {
          for (let q = 0; q < 4; q++) sum += next[r][q];
        }
        setHistoricalSum(parseFloat(sum.toFixed(2)));

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSimulatedPoints]);

  const handleClearHistory = () => {
    setGridData(Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => 0.02)));
  };

  // Helper code to map density float values (0-10) to tailwind color ramps
  const getCellColor = (val: number) => {
    if (val < 0.1) return 'bg-zinc-950 border-white/5';
    if (val < 0.6) return 'bg-blue-950/45 border-blue-900/40 text-blue-500/80';
    if (val < 1.5) return 'bg-emerald-950/60 border-emerald-800/50 text-emerald-400';
    if (val < 3.2) return 'bg-amber-950/70 border-amber-700/60 text-amber-400 animate-pulse';
    if (val < 5.5) return 'bg-orange-600/30 border-orange-500 text-orange-400 font-bold';
    return 'bg-red-600/40 border-red-500 text-red-200 font-black shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse';
  };

  const getHeatLevelName = (val: number) => {
    if (val < 0.1) return 'DORMANT';
    if (val < 0.6) return 'NOMINAL TRACE';
    if (val < 1.5) return 'SENSORY COUPLING';
    if (val < 3.2) return 'ELEVATED INFLUX';
    if (val < 5.5) return 'HIGH DENSITY CONGESTION';
    return 'CRITICAL VECTOR OVERLOAD';
  };

  return (
    <div className="flex flex-col bg-black/80 rounded-2xl border-2 border-zinc-800 p-4 space-y-4 shadow-xl select-none font-mono max-w-sm w-full">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div>
            <span className="text-[10px] font-black uppercase text-cyan-400 block tracking-widest">
              2D GRID SEGMENT HEATMAP
            </span>
            <span className="text-[7.5px] text-zinc-500 uppercase font-bold">
              Dynamic circular grid density over time
            </span>
          </div>
        </div>
        <button
          onClick={handleClearHistory}
          className="p-1 text-zinc-600 hover:text-rose-500 rounded border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
          title="Flush Heat records"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid Layout Container */}
      <div className="flex gap-2">
        {/* Y Axis Ring labels */}
        <div className="flex flex-col justify-between text-[7px] text-zinc-500 font-black py-2.5 uppercase w-6 shrink-0 text-right pr-1">
          {RINGS.map((r, idx) => (
            <div key={idx} className="h-7 flex items-center justify-end leading-none" title={`Range: ${r.range}`}>
              {r.label}
            </div>
          ))}
        </div>

        {/* 4x4 Density Cells */}
        <div className="flex-1 space-y-1">
          {gridData.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-4 gap-1">
              {row.map((val, qIdx) => {
                const cellColor = getCellColor(val);
                const isHovered = hoveredCell?.r === rIdx && hoveredCell?.q === qIdx;
                
                return (
                  <div
                    key={qIdx}
                    onMouseEnter={() => setHoveredCell({ r: rIdx, q: qIdx })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`h-7 rounded-md border text-[8px] flex items-center justify-center transition-all duration-300 relative cursor-crosshair ${cellColor} ${
                      isHovered ? 'scale-105 border-cyan-400/90 shadow-[0_0_12px_cyan]' : ''
                    }`}
                  >
                    <span className="opacity-40 font-mono text-[7px]">
                      {QUADRANTS[qIdx].symbol}
                    </span>
                    
                    {/* Tiny signal beacon indicator on active heat */}
                    {val > 3.0 && (
                      <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-orange-400 animate-ping" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* X Axis Quadrant Labels */}
          <div className="grid grid-cols-4 gap-1 text-[8px] text-zinc-500 text-center uppercase tracking-widest font-black pt-1">
            {QUADRANTS.map((q, qIdx) => (
              <div key={qIdx} title={`Sectors Range: ${q.angleRange}`}>
                SEC_{q.symbol}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segment Legend & Inspector */}
      <div className="bg-zinc-950 border border-zinc-900/60 p-2 rounded-lg min-h-[72px] flex flex-col justify-center">
        {hoveredCell ? (
          <div className="space-y-1 text-left animate-in fade-in duration-100">
            <div className="flex justify-between text-[8px] uppercase">
              <span className="text-cyan-400 font-black font-sans leading-none">
                SECTOR {QUADRANTS[hoveredCell.q].symbol} ({QUADRANTS[hoveredCell.q].label})
              </span>
              <span className="text-zinc-500 leading-none">
                {QUADRANTS[hoveredCell.q].angleRange}
              </span>
            </div>
            <div className="flex justify-between text-[7px] uppercase text-zinc-400 font-mono">
              <span>RING ZONE: {RINGS[hoveredCell.r].label}</span>
              <span>R-COORDINATE: {RINGS[hoveredCell.r].range}%</span>
            </div>
            <div className="flex justify-between items-center text-[8px] font-black uppercase text-zinc-300">
              <span>HEAT VALUE:</span>
              <span className={gridData[hoveredCell.r][hoveredCell.q] > 3 ? 'text-orange-400' : 'text-emerald-400'}>
                {gridData[hoveredCell.r][hoveredCell.q].toFixed(2)} dB/m²
              </span>
            </div>
            <div className="text-[7px] text-zinc-500 uppercase leading-none truncate">
              STATUS: {getHeatLevelName(gridData[hoveredCell.r][hoveredCell.q])}
            </div>
          </div>
        ) : (
          <div className="text-center text-[7.5px] text-zinc-500 uppercase py-1 leading-relaxed">
            <span className="text-zinc-400 font-bold block mb-1">Interactive Diagnostic HUD</span>
            Hover over any grid pixel cell to analyze sector metrics, angular bearings, and accumulated vector energy.
          </div>
        )}
      </div>

      {/* Bottom metrics */}
      <div className="flex justify-between items-center text-[7.5px] text-zinc-600 bg-zinc-950/40 p-1.5 rounded-md border border-zinc-900 border-dashed">
        <span className="uppercase font-bold">Accumulative Sensor Vol:</span>
        <span className={`font-mono font-bold ${historicalSum > 10 ? 'text-orange-400 animate-pulse' : 'text-blue-500'}`}>
          {historicalSum} DB_UNITS
        </span>
      </div>
    </div>
  );
};
