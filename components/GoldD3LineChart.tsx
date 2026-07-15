import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Play, 
  Pause, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Lock, 
  Eye, 
  Terminal 
} from 'lucide-react';
import type { AssayLog } from '../types';
import { toast } from 'sonner';

interface GoldD3LineChartProps {
  assayLogs: AssayLog[];
}

interface PriceTick {
  timestamp: number;
  price: number;
}

export const GoldD3LineChart: React.FC<GoldD3LineChartProps> = ({ assayLogs }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Dimensions state tracked via ResizeObserver
  const [dimensions, setDimensions] = useState({ width: 500, height: 260 });
  
  // Simulation Controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [shockType, setShockType] = useState<'normal' | 'spike' | 'crash'>('normal');
  const [goldPrices, setGoldPrices] = useState<PriceTick[]>(() => {
    // Preseed with historical 21-day trend aligned with the campaign duration
    const initialTicks: PriceTick[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Base price around $2,350/oz
    let currentPrice = 2350.0;
    for (let i = 21; i >= 0; i--) {
      const noise = (Math.random() - 0.5) * 15;
      currentPrice += noise;
      initialTicks.push({
        timestamp: now - i * dayMs,
        price: parseFloat(currentPrice.toFixed(2))
      });
    }
    return initialTicks;
  });

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ 
          width: Math.max(width, 280), 
          height: Math.max(height, 240) 
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Real-time market feed simulator loop (appends ticker pricing data)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setGoldPrices((prev) => {
        const lastTick = prev[prev.length - 1];
        const nextTimestamp = lastTick ? lastTick.timestamp + 5000 : Date.now(); // 5-second steps for live feel
        
        let drift = 0;
        if (shockType === 'spike') {
          drift = Math.random() * 25 + 10; // Geopolitical premium spike
        } else if (shockType === 'crash') {
          drift = -Math.random() * 25 - 10; // Massive market liquidation dump
        } else {
          drift = (Math.random() - 0.48) * 8; // Slight upward organic bias
        }

        const nextPrice = Math.max(1500, parseFloat(( (lastTick?.price || 2350.0) + drift ).toFixed(2)));
        
        // Keep the sliding window restricted to the last 40 ticks for optimal UI performance
        const nextTicks = [...prev, { timestamp: nextTimestamp, price: nextPrice }];
        if (nextTicks.length > 40) {
          nextTicks.shift();
        }
        return nextTicks;
      });

      // Decay shock state back to normal configuration
      if (shockType !== 'normal') {
        setShockType('normal');
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying, shockType]);

  // Handle direct testing interventions
  const triggerGeopoliticalSpike = () => {
    setShockType('spike');
    toast.warning('[SIMULATION_ALARM] Geo-Economic shock injected: Gold spot price spiking.');
  };

  const triggerLiquidationCrash = () => {
    setShockType('crash');
    toast.error('[SIMULATION_ALARM] Liquidation shock injected: Gold spot price crashing.');
  };

  // Pre-calculate assay ROI logs overlay data
  const processedLogs = useMemo(() => {
    return assayLogs.map(log => {
      const roe = log.sampleMass > 0 ? (log.colorCount / log.sampleMass) : 0;
      return {
        id: log.id,
        siteName: log.siteName,
        roe: parseFloat(roe.toFixed(2)),
        timestamp: log.timestamp,
        mass: log.sampleMass,
        colors: log.colorCount
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  }, [assayLogs]);

  // Main D3 Drawing Effect
  useEffect(() => {
    if (!svgRef.current || goldPrices.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Flush previous canvas layout to prevent overlap leaks

    const margin = { top: 20, right: 50, bottom: 35, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 1. Establish Scales
    // X-Axis represents timeline. We encompass both pricing feed dates and log timestamps.
    const allTimestamps = [
      ...goldPrices.map(t => t.timestamp),
      ...processedLogs.map(l => l.timestamp)
    ];
    const minTime = d3.min(allTimestamps) || Date.now();
    const maxTime = d3.max(allTimestamps) || Date.now();

    const xScale = d3.scaleTime()
      .domain([minTime, maxTime])
      .range([0, width]);

    // Left Y-Axis: Gold Spot Price ($/oz)
    const minPrice = d3.min(goldPrices, d => d.price) || 2000;
    const maxPrice = d3.max(goldPrices, d => d.price) || 2600;
    const padPrice = (maxPrice - minPrice) * 0.15 || 50;

    const yPriceScale = d3.scaleLinear()
      .domain([Math.max(0, minPrice - padPrice), maxPrice + padPrice])
      .range([height, 0]);

    // Right Y-Axis: Return on Effort (ROE) (Colors / kg)
    const maxRoe = d3.max(processedLogs, l => l.roe) || 10;
    const yRoeScale = d3.scaleLinear()
      .domain([0, Math.max(1, maxRoe * 1.2)])
      .range([height, 0]);

    // 2. Render Gridlines
    g.append('g')
      .attr('class', 'grid-lines')
      .attr('stroke', '#1f1f2e')
      .attr('stroke-opacity', 0.6)
      .call(
        d3.axisLeft(yPriceScale)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .call(g => g.select('.domain').remove());

    // 3. Draw Axis Lines
    // X-Axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('class', 'axis-x font-mono text-[8px] text-zinc-500')
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%H:%M:%S') as any))
      .call(g => g.select('.domain').attr('stroke', '#3f3f46'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#27272a'));

    // Left Axis (Gold Price)
    g.append('g')
      .attr('class', 'axis-y-left font-mono text-[8px]')
      .call(d3.axisLeft(yPriceScale).ticks(5).tickFormat(d => `$${d}`))
      .call(g => g.select('.domain').attr('stroke', '#fbbf24'))
      .call(g => g.selectAll('.tick text').attr('fill', '#f59e0b'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#fbbf24').attr('stroke-opacity', 0.3));

    // Right Axis (Return on Effort)
    g.append('g')
      .attr('transform', `translate(${width}, 0)`)
      .attr('class', 'axis-y-right font-mono text-[8px]')
      .call(d3.axisRight(yRoeScale).ticks(5).tickFormat(d => `${d} c/kg`))
      .call(g => g.select('.domain').attr('stroke', '#10b981'))
      .call(g => g.selectAll('.tick text').attr('fill', '#10b981'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#10b981').attr('stroke-opacity', 0.3));

    // Axis Labels
    // Gold Price Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -38)
      .attr('x', -height / 2)
      .attr('fill', '#fbbf24')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('text-anchor', 'middle')
      .text('SPOT PRICE ($/OZ)');

    // ROE Label
    g.append('text')
      .attr('transform', 'rotate(90)')
      .attr('y', -width - 38)
      .attr('x', height / 2)
      .attr('fill', '#10b981')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('text-anchor', 'middle')
      .text('RETURN ON EFFORT (COLORS/KG)');

    // 4. Render Gold Spot Price Line & Gradient Area
    // Area generator for styling
    const areaGenerator = d3.area<PriceTick>()
      .x(d => xScale(d.timestamp))
      .y0(height)
      .y1(d => yPriceScale(d.price))
      .curve(d3.curveMonotoneX);

    // Gradient Definition
    const grad = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'gold-price-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#fbbf24').attr('stop-opacity', 0.15);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#fbbf24').attr('stop-opacity', 0);

    g.append('path')
      .datum(goldPrices)
      .attr('fill', 'url(#gold-price-gradient)')
      .attr('d', areaGenerator);

    // Gold Price Line
    const lineGenerator = d3.line<PriceTick>()
      .x(d => xScale(d.timestamp))
      .y(d => yPriceScale(d.price))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(goldPrices)
      .attr('fill', 'none')
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 1.5)
      .attr('d', lineGenerator);

    // 5. Render Prospecting Site Return on Effort (ROE) Data Path
    if (processedLogs.length > 0) {
      // Connect points with a dashed emerald line indicating travel/sequence path
      const roeLineGenerator = d3.line<any>()
        .x(d => xScale(d.timestamp))
        .y(d => yRoeScale(d.roe));

      g.append('path')
        .datum(processedLogs)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('d', roeLineGenerator);

      // Render interactive diamond nodes for each field site
      g.selectAll('.site-node')
        .data(processedLogs)
        .enter()
        .append('path')
        .attr('class', 'site-node cursor-pointer')
        .attr('d', d3.symbol().type(d3.symbolDiamond).size(50))
        .attr('transform', d => `translate(${xScale(d.timestamp)}, ${yRoeScale(d.roe)})`)
        .attr('fill', '#10b981')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1)
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('transform', `translate(${xScale(d.timestamp)}, ${yRoeScale(d.roe)}) scale(1.4)`)
            .attr('fill', '#34d399');

          // Draw floating coordinate line
          g.append('line')
            .attr('id', 'hover-probe-line')
            .attr('x1', xScale(d.timestamp))
            .attr('y1', 0)
            .attr('x2', xScale(d.timestamp))
            .attr('y2', height)
            .attr('stroke', '#10b981')
            .attr('stroke-dasharray', '2,2')
            .attr('stroke-opacity', 0.7);

          // Draw floating label text
          g.append('g')
            .attr('id', 'hover-probe-card')
            .attr('transform', `translate(${Math.min(width - 120, xScale(d.timestamp) + 10)}, ${Math.max(10, yRoeScale(d.roe) - 30)})`)
            .call(gCard => {
              gCard.append('rect')
                .attr('width', 115)
                .attr('height', 36)
                .attr('rx', 4)
                .attr('fill', '#09090b')
                .attr('stroke', '#10b981')
                .attr('stroke-width', 1);

              gCard.append('text')
                .attr('x', 6)
                .attr('y', 12)
                .attr('fill', '#fff')
                .attr('font-size', '8px')
                .attr('font-family', 'JetBrains Mono')
                .attr('font-weight', 'bold')
                .text(d.siteName.slice(0, 16));

              gCard.append('text')
                .attr('x', 6)
                .attr('y', 24)
                .attr('fill', '#a1a1aa')
                .attr('font-size', '7px')
                .attr('font-family', 'JetBrains Mono')
                .text(`ROE: ${d.roe} c/kg (${d.colors} spcks)`);
            });
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('transform', `translate(${xScale(d.timestamp)}, ${yRoeScale(d.roe)}) scale(1.0)`)
            .attr('fill', '#10b981');

          g.select('#hover-probe-line').remove();
          g.select('#hover-probe-card').remove();
        });
    }

    // 6. Crosshair / Hover Overlay Tracker for Real-time Feeds
    const focus = g.append('g')
      .style('display', 'none');

    focus.append('line')
      .attr('class', 'focus-line-y')
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '3,3')
      .attr('y1', 0)
      .attr('y2', height);

    focus.append('circle')
      .attr('r', 4)
      .attr('fill', '#fbbf24')
      .attr('stroke', '#09090b')
      .attr('stroke-width', 1.5);

    const tooltipGroup = focus.append('g')
      .attr('class', 'realtime-tooltip')
      .attr('transform', 'translate(10, -10)');

    tooltipGroup.append('rect')
      .attr('width', 90)
      .attr('height', 24)
      .attr('rx', 4)
      .attr('fill', '#09090b')
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 1);

    const tooltipTextTime = tooltipGroup.append('text')
      .attr('x', 6)
      .attr('y', 10)
      .attr('fill', '#a1a1aa')
      .attr('font-size', '7px')
      .attr('font-family', 'JetBrains Mono');

    const tooltipTextPrice = tooltipGroup.append('text')
      .attr('x', 6)
      .attr('y', 18)
      .attr('fill', '#fbbf24')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-weight', 'bold');

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => focus.style('display', 'none'))
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event);
        const xDate = xScale.invert(mouseX);
        
        // Find nearest price tick
        const bisect = d3.bisector((d: PriceTick) => d.timestamp).left;
        const idx = bisect(goldPrices, xDate.getTime());
        
        const d0 = goldPrices[idx - 1];
        const d1 = goldPrices[idx];
        let d = d1 || d0;
        
        if (d0 && d1) {
          d = xDate.getTime() - d0.timestamp > d1.timestamp - xDate.getTime() ? d1 : d0;
        }

        if (d) {
          const cx = xScale(d.timestamp);
          const cy = yPriceScale(d.price);

          focus.select('.focus-line-y')
            .attr('x1', cx)
            .attr('x2', cx);

          focus.select('circle')
            .attr('cx', cx)
            .attr('cy', cy);

          // Position tooltip to avoid edges
          const tooltipX = cx > width - 110 ? cx - 105 : cx + 8;
          const tooltipY = cy > height - 40 ? cy - 30 : cy - 10;
          tooltipGroup.attr('transform', `translate(${tooltipX}, ${tooltipY})`);

          const formatTime = d3.timeFormat('%M:%S');
          tooltipTextTime.text(`Time: ${formatTime(new Date(d.timestamp))}`);
          tooltipTextPrice.text(`Spot: $${d.price}`);
        }
      });

  }, [goldPrices, processedLogs, dimensions]);

  return (
    <div className="bg-zinc-950/80 border border-amber-500/10 p-4 rounded-2xl space-y-3">
      {/* Title / Status Ribbon */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <h4 className="text-[10px] font-serif font-black uppercase tracking-widest text-amber-300">
            Gold Spot Price & Site Assay Telemetry
          </h4>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[8px] bg-black border border-zinc-900 px-2 py-0.5 rounded-md text-zinc-500">
          <Lock className="w-2.5 h-2.5 text-emerald-500" /> Secure Sandbox Node
        </div>
      </div>

      {/* D3 Render Canvas */}
      <div ref={containerRef} className="w-full h-56 relative bg-black/40 rounded-xl overflow-hidden border border-zinc-900">
        <svg 
          ref={svgRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="block overflow-visible"
        />
      </div>

      {/* Operational Simulation Controller Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border uppercase transition-all ${
              isPlaying 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title={isPlaying ? 'Pause simulation timeline feed' : 'Resume real-time market drift feed'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span>Monitoring Feed</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Feed Paused</span>
              </>
            )}
          </button>
        </div>

        {/* Security / System Injection Actions */}
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-zinc-550 uppercase font-black">Resilience Testing:</span>
          
          <button
            onClick={triggerGeopoliticalSpike}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg transition-colors uppercase text-[8px]"
            title="Simulate geopolitical stress incident driving gold value premiums upward"
          >
            <TrendingUp className="w-2.5 h-2.5" />
            <span>Spike Spot</span>
          </button>

          <button
            onClick={triggerLiquidationCrash}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors uppercase text-[8px]"
            title="Simulate emergency asset liquidation driving sudden price collapse"
          >
            <ShieldAlert className="w-2.5 h-2.5" />
            <span>Crash Spot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
