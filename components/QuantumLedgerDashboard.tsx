import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { cachedLedgerState, QuantumTick } from './QuantumLedgerView';
import { 
  Atom, Gauge, TrendingUp, Activity, HelpCircle, 
  Database, Zap, ArrowUpRight, Cpu
} from 'lucide-react';

export const QuantumLedgerDashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Keep local ticks in sync with cachedLedgerState.ticks in real-time
  const [ticks, setTicks] = useState<QuantumTick[]>(() => [...(cachedLedgerState.ticks || [])]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const [hoveredTick, setHoveredTick] = useState<QuantumTick | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Sync state ticks
  useEffect(() => {
    const interval = setInterval(() => {
      if (cachedLedgerState?.ticks) {
        setTicks([...cachedLedgerState.ticks]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update dimensions on resize
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height || 400, 350)
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // D3 Rendering code
  useEffect(() => {
    if (!svgRef.current || ticks.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear for fresh redraw

    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 30, right: 60, bottom: 50, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create chart container group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Define Glow Filter
    const defs = svg.append('defs');
    
    // Gas Glow
    const gasGlow = defs.append('filter')
      .attr('id', 'gas-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    gasGlow.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    gasGlow.append('feMerge').selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter().append('feMergeNode')
      .attr('in', d => d);

    // Consensus Glow
    const consensusGlow = defs.append('filter')
      .attr('id', 'consensus-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    consensusGlow.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    consensusGlow.append('feMerge').selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter().append('feMergeNode')
      .attr('in', d => d);

    // Area Gradients
    const gasGrad = defs.append('linearGradient')
      .attr('id', 'gas-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gasGrad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#F59E0B')
      .attr('stop-opacity', '0.25');
    gasGrad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#F59E0B')
      .attr('stop-opacity', '0');

    const consensusGrad = defs.append('linearGradient')
      .attr('id', 'consensus-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    consensusGrad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', '0.2');
    consensusGrad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', '0');

    // SCALES
    const xScale = d3.scaleLinear()
      .domain(d3.extent(ticks, d => d.blockHeight) as [number, number])
      .range([0, chartWidth]);

    const yGasScale = d3.scaleLinear()
      .domain([0, Math.max(65, d3.max(ticks, d => d.gasPrice) || 50)])
      .range([chartHeight, 0]);

    const yConsensusScale = d3.scaleLinear()
      .domain([97.5, 100.2])
      .range([chartHeight, 0]);

    const yVolumeScale = d3.scaleLinear()
      .domain([0, d3.max(ticks, d => d.volumeDelta) || 150])
      .range([chartHeight, chartHeight - 80]); // Volume sits at the very bottom

    // GRIDLINES
    g.append('g')
      .attr('class', 'grid-lines')
      .attr('stroke', '#1E1E2E')
      .attr('stroke-opacity', '0.4')
      .call(d3.axisLeft(yGasScale).tickSize(-chartWidth).tickFormat(() => ''));

    // AXES
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(ticks.length, 8))
      .tickFormat(d => `#${d}`);

    const yGasAxis = d3.axisLeft(yGasScale)
      .ticks(6)
      .tickFormat(d => `${d} G`);

    const yConsensusAxis = d3.axisRight(yConsensusScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    // Render X Axis
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .attr('class', 'x-axis text-zinc-500 font-mono text-[9px]')
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#71717A');

    g.select('.x-axis path').attr('stroke', '#27272A');
    g.selectAll('.x-axis line').attr('stroke', '#27272A');

    // Render Left Y Axis (Gas)
    g.append('g')
      .attr('class', 'y-gas-axis text-amber-500/70 font-mono text-[9px]')
      .call(yGasAxis)
      .selectAll('text')
      .attr('fill', '#D97706');

    g.select('.y-gas-axis path').attr('stroke', '#78350F');
    g.selectAll('.y-gas-axis line').attr('stroke', '#78350F');

    // Render Right Y Axis (Consensus)
    g.append('g')
      .attr('transform', `translate(${chartWidth}, 0)`)
      .attr('class', 'y-consensus-axis text-emerald-500/70 font-mono text-[9px]')
      .call(yConsensusAxis)
      .selectAll('text')
      .attr('fill', '#059669');

    g.select('.y-consensus-axis path').attr('stroke', '#064E3B');
    g.selectAll('.y-consensus-axis line').attr('stroke', '#064E3B');

    // AREA GENERATORS (drawn first under lines)
    const gasArea = d3.area<QuantumTick>()
      .x(d => xScale(d.blockHeight))
      .y0(chartHeight)
      .y1(d => yGasScale(d.gasPrice))
      .curve(d3.curveMonotoneX);

    const consensusArea = d3.area<QuantumTick>()
      .x(d => xScale(d.blockHeight))
      .y0(chartHeight)
      .y1(d => yConsensusScale(d.consensusRate))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(ticks)
      .attr('fill', 'url(#gas-gradient)')
      .attr('d', gasArea);

    g.append('path')
      .datum(ticks)
      .attr('fill', 'url(#consensus-gradient)')
      .attr('d', consensusArea);

    // VOLUME DELTA BARS (at the very bottom)
    g.selectAll('.volume-bar')
      .data(ticks)
      .enter()
      .append('rect')
      .attr('class', 'volume-bar')
      .attr('x', d => xScale(d.blockHeight) - 2)
      .attr('y', d => yVolumeScale(d.volumeDelta))
      .attr('width', 4)
      .attr('height', d => chartHeight - yVolumeScale(d.volumeDelta))
      .attr('fill', '#8B5CF6')
      .attr('opacity', 0.22)
      .attr('rx', 1);

    // LINE GENERATORS
    const gasLine = d3.line<QuantumTick>()
      .x(d => xScale(d.blockHeight))
      .y(d => yGasScale(d.gasPrice))
      .curve(d3.curveMonotoneX);

    const consensusLine = d3.line<QuantumTick>()
      .x(d => xScale(d.blockHeight))
      .y(d => yConsensusScale(d.consensusRate))
      .curve(d3.curveMonotoneX);

    // DRAW LINES
    g.append('path')
      .datum(ticks)
      .attr('fill', 'none')
      .attr('stroke', '#F59E0B')
      .attr('stroke-width', '2')
      .attr('filter', 'url(#gas-glow)')
      .attr('d', gasLine);

    g.append('path')
      .datum(ticks)
      .attr('fill', 'none')
      .attr('stroke', '#10B981')
      .attr('stroke-width', '2')
      .attr('filter', 'url(#consensus-glow)')
      .attr('d', consensusLine);

    // INTERACTIVE HOVER TRACKING OVERLAY
    const hoverLine = g.append('line')
      .attr('stroke', '#6366F1')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .style('opacity', 0);

    const hoverDotGas = g.append('circle')
      .attr('r', 5)
      .attr('fill', '#F59E0B')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5)
      .style('opacity', 0);

    const hoverDotConsensus = g.append('circle')
      .attr('r', 5)
      .attr('fill', '#10B981')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5)
      .style('opacity', 0);

    // Invisible rectangle to capture hover events
    g.append('rect')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .on('mousemove', function (event) {
        const mouseX = d3.pointer(event)[0];
        const xVal = xScale.invert(mouseX);
        
        // Find closest tick
        let closest = ticks[0];
        let minDist = Math.abs(closest.blockHeight - xVal);
        
        for (let i = 1; i < ticks.length; i++) {
          const dist = Math.abs(ticks[i].blockHeight - xVal);
          if (dist < minDist) {
            minDist = dist;
            closest = ticks[i];
          }
        }

        if (closest) {
          const xPos = xScale(closest.blockHeight);
          hoverLine
            .attr('x1', xPos)
            .attr('x2', xPos)
            .style('opacity', 1);

          hoverDotGas
            .attr('cx', xPos)
            .attr('cy', yGasScale(closest.gasPrice))
            .style('opacity', 1);

          hoverDotConsensus
            .attr('cx', xPos)
            .attr('cy', yConsensusScale(closest.consensusRate))
            .style('opacity', 1);

          setHoveredTick(closest);
          
          // Position tooltip relatively inside container
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: xPos + margin.left + 15,
              y: Math.min(yGasScale(closest.gasPrice) + margin.top - 10, chartHeight - 50)
            });
          }
        }
      })
      .on('mouseleave', () => {
        hoverLine.style('opacity', 0);
        hoverDotGas.style('opacity', 0);
        hoverDotConsensus.style('opacity', 0);
        setHoveredTick(null);
      });

  }, [ticks, dimensions]);

  // Derive simple aggregations
  const currentGas = ticks[ticks.length - 1]?.gasPrice || 15;
  const avgGas = (ticks.reduce((acc, t) => acc + t.gasPrice, 0) / (ticks.length || 1)).toFixed(1);
  const currentConsensus = ticks[ticks.length - 1]?.consensusRate || 99.8;
  const currentBlock = ticks[ticks.length - 1]?.blockHeight || 40291;
  const currentVolume = ticks[ticks.length - 1]?.totalVolume || 142980.5;

  return (
    <div className="h-full flex flex-col bg-[#050508] text-gray-200 font-mono overflow-auto" id="quantum_ledger_dashboard">
      {/* Overview Stat Strip */}
      <div className="p-4 border-b border-zinc-900 bg-[#020205] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">CONDUITED HEIGHT</span>
            <span className="text-lg font-black text-white">#{currentBlock}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Atom className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">CURRENT GAS PRICE</span>
            <span className="text-lg font-black text-amber-500">{currentGas} <span className="text-xs">Gwei</span></span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Gauge className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">CONSENSUS INTEGRITY</span>
            <span className="text-lg font-black text-emerald-400">{(currentConsensus).toFixed(2)}%</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">TOTAL MINTED VOLUME</span>
            <span className="text-lg font-black text-violet-400">{(currentVolume).toLocaleString(undefined, { maximumFractionDigits: 1 })} AETH</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
            <Database className="w-5 h-5 text-violet-400" />
          </div>
        </div>
      </div>

      {/* Main visualization container */}
      <div className="flex-1 p-6 flex flex-col min-h-0 min-w-0 relative">
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-black tracking-widest text-zinc-300 uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> QUANTUM LEDGER REAL-TIME TICKS
            </h2>
            <p className="text-[9px] text-zinc-500 italic mt-0.5">Plotting telemetry streams across the last 100 fast-conduction ledger validations.</p>
          </div>
          
          <div className="flex items-center gap-4 text-[9px] text-zinc-400 bg-zinc-950 px-3 py-1.5 border border-zinc-900 rounded-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              <span>Gas Price (Avg: {avgGas} Gwei)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>Consensus Rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-violet-500 rounded-full" />
              <span>Volume Delta</span>
            </div>
          </div>
        </div>

        {/* The SVG wrapper */}
        <div className="flex-1 bg-zinc-950/40 border border-zinc-900/60 rounded-2xl p-4 min-h-[350px] relative" ref={containerRef}>
          <svg 
            ref={svgRef} 
            className="w-full h-full block"
          />

          {/* D3 tooltip element overlay */}
          {hoveredTick && (
            <div 
              className="absolute z-30 p-3 bg-zinc-950/95 border border-indigo-500/40 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none w-56 font-mono text-[9.5px] space-y-1"
              style={{ 
                left: `${tooltipPos.x}px`, 
                top: `${tooltipPos.y}px`,
                transform: tooltipPos.x > dimensions.width - 260 ? 'translateX(-110%)' : 'none'
              }}
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 mb-1.5">
                <span className="font-bold text-white">Block #{hoveredTick.blockHeight}</span>
                <span className="text-zinc-500 text-[8.5px]">
                  {new Date(hoveredTick.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Gas Price:</span>
                <span className="font-bold text-amber-400">{hoveredTick.gasPrice} Gwei</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Consensus Rate:</span>
                <span className="font-bold text-emerald-400">{(hoveredTick.consensusRate).toFixed(3)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Volume Delta:</span>
                <span className="font-bold text-violet-400">+{hoveredTick.volumeDelta} AETH</span>
              </div>
              <div className="flex justify-between border-t border-zinc-900/60 pt-1 mt-1 text-[8.5px]">
                <span className="text-zinc-500">Cumulative:</span>
                <span className="text-zinc-300">{(hoveredTick.totalVolume).toLocaleString(undefined, {maximumFractionDigits:1})} AETH</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
