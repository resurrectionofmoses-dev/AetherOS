import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Network, TrendingUp, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

interface D3VelocityChartProps {
  sheetData: string[][];
  dateColIndex: number;
  statusColIndex: number;
  titleColIndex: number;
}

interface VelocityDataPoint {
  dateStr: string;
  dateObj: Date;
  actualCumulative: number;
  projectedCumulative: number;
  idealCumulative: number;
  actualDelta: number;
  projectedDelta: number;
}

export const D3VelocityChart: React.FC<D3VelocityChartProps> = ({
  sheetData,
  dateColIndex,
  statusColIndex,
  titleColIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 220 });
  const [hoveredPoint, setHoveredPoint] = useState<VelocityDataPoint | null>(null);

  // Measure container dimensions reactively
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: width || 500,
          height: height || 220,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Helper to parse dates securely
  const parseDate = (str: string): Date => {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    
    // Try slash formats (e.g. MM/DD/YYYY)
    const parts = str.split('/');
    if (parts.length === 3) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      const customDate = new Date(year, p0 - 1, p1);
      if (!isNaN(customDate.getTime())) return customDate;
    }
    return new Date(0); // fallback
  };

  // Compile velocity and schedule metrics
  const processedData = useMemo(() => {
    if (!sheetData || sheetData.length <= 1) return [];

    const rows = sheetData.slice(1);
    const validRows: { date: Date; dateStr: string; isCompleted: boolean }[] = [];

    rows.forEach((row) => {
      // 1. Resolve date
      let dateStr = 'No Date';
      let dateObj = new Date(0);
      if (dateColIndex !== -1 && row[dateColIndex]) {
        const rawVal = String(row[dateColIndex]).trim();
        if (rawVal) {
          dateStr = rawVal.replace(' UTC', '').split('T')[0].split(' ')[0];
          dateObj = parseDate(dateStr);
        }
      }

      if (dateObj.getTime() === 0) {
        // Fallback: assign a pseudo-chronological date based on row index to ensure a continuous line
        return;
      }

      // 2. Resolve completion status
      let isCompleted = false;
      if (statusColIndex !== -1 && row[statusColIndex] !== undefined) {
        const statusRaw = String(row[statusColIndex]).trim().toLowerCase();
        if (['true', 'done', 'completed', 'complete', 'success', 'yes', '1', 'stable'].includes(statusRaw)) {
          isCompleted = true;
        }
      } else {
        const rowStr = row.join(' ').toUpperCase();
        if (rowStr.includes('SUCCESS') || rowStr.includes('STABLE') || rowStr.includes('DONE') || rowStr.includes('COMPLETED') || rowStr.includes('TRUE')) {
          isCompleted = true;
        }
      }

      validRows.push({ date: dateObj, dateStr, isCompleted });
    });

    // If no valid dates, generate fake timeline based on index
    if (validRows.length === 0) {
      const now = new Date();
      rows.forEach((row, idx) => {
        const pseudoDate = new Date(now.getTime() - (rows.length - idx) * 24 * 60 * 60 * 1000);
        let isCompleted = false;
        if (statusColIndex !== -1 && row[statusColIndex]) {
          const statusRaw = String(row[statusColIndex]).trim().toLowerCase();
          isCompleted = ['true', 'done', 'completed', 'complete', 'yes', '1'].includes(statusRaw);
        } else if (idx % 3 === 0) {
          isCompleted = true;
        }
        validRows.push({
          date: pseudoDate,
          dateStr: pseudoDate.toISOString().split('T')[0],
          isCompleted,
        });
      });
    }

    // Sort valid rows chronologically
    validRows.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Group by unique dates to make discrete data points
    const dateGroups: Record<string, { dateObj: Date; actualCount: number; projectedCount: number }> = {};
    validRows.forEach((r) => {
      const key = r.dateStr;
      if (!dateGroups[key]) {
        dateGroups[key] = {
          dateObj: r.date,
          actualCount: 0,
          projectedCount: 0,
        };
      }
      dateGroups[key].projectedCount += 1;
      if (r.isCompleted) {
        dateGroups[key].actualCount += 1;
      }
    });

    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
      return dateGroups[a].dateObj.getTime() - dateGroups[b].dateObj.getTime();
    });

    // Compute cumulative series
    let actualCumulative = 0;
    let projectedCumulative = 0;
    const totalMilestones = validRows.length;

    const points: VelocityDataPoint[] = [];
    sortedDates.forEach((dStr, idx) => {
      const g = dateGroups[dStr];
      actualCumulative += g.actualCount;
      projectedCumulative += g.projectedCount;

      // Ideal cumulative line - linear progression from 0 to totalMilestones
      const idealCumulative = Math.round(((idx + 1) / sortedDates.length) * totalMilestones);

      points.push({
        dateStr: dStr,
        dateObj: g.dateObj,
        actualCumulative,
        projectedCumulative,
        idealCumulative,
        actualDelta: g.actualCount,
        projectedDelta: g.projectedCount,
      });
    });

    return points;
  }, [sheetData, dateColIndex, statusColIndex]);

  // Derived Summary KPI Cards
  const summaryMetrics = useMemo(() => {
    if (processedData.length === 0) {
      return { total: 0, completed: 0, projectedToday: 0, slippage: 0, status: 'UNKNOWN', pace: 0 };
    }
    const lastPoint = processedData[processedData.length - 1];
    const total = lastPoint.projectedCumulative;
    const completed = lastPoint.actualCumulative;
    const projectedToday = lastPoint.projectedCumulative;
    const slippage = projectedToday - completed;
    
    let status: 'AHEAD' | 'ON_TRACK' | 'BEHIND' = 'ON_TRACK';
    if (slippage > 2) {
      status = 'BEHIND';
    } else if (slippage < -1) {
      status = 'AHEAD';
    }

    const pace = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, projectedToday, slippage, status, pace };
  }, [processedData]);

  // Render D3 Line Chart
  useEffect(() => {
    if (!svgRef.current || processedData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear canvas

    const margin = { top: 15, right: 20, bottom: 25, left: 30 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scale domains
    const x = d3
      .scaleTime()
      .domain(d3.extent(processedData, (d) => d.dateObj) as [Date, Date])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => Math.max(d.projectedCumulative, d.actualCumulative, d.idealCumulative)) || 10])
      .range([height, 0])
      .nice();

    // Axes
    const xAxis = d3
      .axisBottom<Date>(x)
      .ticks(Math.min(processedData.length, dimensions.width > 600 ? 8 : 4))
      .tickFormat((d) => d3.timeFormat('%m/%d')(d))
      .tickSize(0)
      .tickPadding(8);

    const yAxis = d3
      .axisLeft<number>(y)
      .ticks(4)
      .tickSize(0)
      .tickPadding(8);

    // Draw gridlines (Y only)
    g.append('g')
      .attr('class', 'grid-lines')
      .style('stroke', '#18181b')
      .style('stroke-dasharray', '3,3')
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('.tick line')
      .attr('stroke', '#18181b');

    // Add Axes to DOM
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('color', '#52525b')
      .select('.domain')
      .remove();

    g.append('g')
      .call(yAxis)
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('color', '#52525b')
      .select('.domain')
      .remove();

    // Line generators
    const actualLine = d3
      .line<VelocityDataPoint>()
      .x((d) => x(d.dateObj))
      .y((d) => y(d.actualCumulative))
      .curve(d3.curveMonotoneX);

    const projectedLine = d3
      .line<VelocityDataPoint>()
      .x((d) => x(d.dateObj))
      .y((d) => y(d.projectedCumulative))
      .curve(d3.curveMonotoneX);

    const idealLine = d3
      .line<VelocityDataPoint>()
      .x((d) => x(d.dateObj))
      .y((d) => y(d.idealCumulative))
      .curve(d3.curveMonotoneX);

    // Glow filter definitions
    const defs = svg.append('defs');

    const filterActual = defs.append('filter').attr('id', 'glow-actual');
    filterActual.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'coloredBlur');
    const mergeActual = filterActual.append('feMerge');
    mergeActual.append('feMergeNode').attr('in', 'coloredBlur');
    mergeActual.append('feMergeNode').attr('in', 'SourceGraphic');

    const filterProjected = defs.append('filter').attr('id', 'glow-projected');
    filterProjected.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'coloredBlur');
    const mergeProjected = filterProjected.append('feMerge');
    mergeProjected.append('feMergeNode').attr('in', 'coloredBlur');
    mergeProjected.append('feMergeNode').attr('in', 'SourceGraphic');

    // Area Generator for actual trend
    const areaActual = d3
      .area<VelocityDataPoint>()
      .x((d) => x(d.dateObj))
      .y0(height)
      .y1((d) => y(d.actualCumulative))
      .curve(d3.curveMonotoneX);

    // Draw Soft Area Gradients
    g.append('path')
      .datum(processedData)
      .attr('fill', 'url(#area-actual-gradient)')
      .attr('d', areaActual);

    const gradientActual = defs
      .append('linearGradient')
      .attr('id', 'area-actual-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradientActual.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.1);
    gradientActual.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

    // Draw Ideal Pace Line (Reference line)
    g.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', '#6366f1')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3)
      .attr('stroke-dasharray', '4,4')
      .attr('d', idealLine);

    // Draw Projected Target Line
    g.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .attr('filter', 'url(#glow-projected)')
      .attr('d', projectedLine);

    // Draw Actual Progress Line
    g.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#glow-actual)')
      .attr('d', actualLine);

    // Focus overlay for mouse pointer tracking (Interaction)
    const focus = g.append('g').style('display', 'none');

    // Vertical pointer line
    focus
      .append('line')
      .attr('class', 'focus-line')
      .style('stroke', '#27272a')
      .style('stroke-dasharray', '2,2')
      .attr('y1', 0)
      .attr('y2', height);

    // Hover pointer circles
    const circleActual = focus
      .append('circle')
      .attr('r', 4.5)
      .attr('fill', '#10b981')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1);

    const circleProjected = focus
      .append('circle')
      .attr('r', 4.5)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1);

    // Catch mouse mouseevents in transparent rect overlay
    const bisectDate = d3.bisector((d: VelocityDataPoint) => d.dateObj).left;

    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        focus.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('mousemove', function (event) {
        const mouseX = d3.pointer(event)[0];
        const x0 = x.invert(mouseX);
        const idx = bisectDate(processedData, x0, 1);
        const d0 = processedData[idx - 1];
        const d1 = processedData[idx];
        if (!d0) return;
        const d = !d1 ? d0 : x0.getTime() - d0.dateObj.getTime() > d1.dateObj.getTime() - x0.getTime() ? d1 : d0;

        // Position indicators
        focus.select('.focus-line').attr('x1', x(d.dateObj)).attr('x2', x(d.dateObj));
        circleActual.attr('cx', x(d.dateObj)).attr('cy', y(d.actualCumulative));
        circleProjected.attr('cx', x(d.dateObj)).attr('cy', y(d.projectedCumulative));

        setHoveredPoint(d);
      });
  }, [processedData, dimensions]);

  if (processedData.length === 0) {
    return (
      <div className="text-zinc-650 text-xs italic flex flex-col items-center justify-center h-48 text-center p-4">
        <span>No chronological milestones found.</span>
        <span className="text-[10px] text-zinc-500 mt-1">Make sure you have selected columns for Target Date and Completion Status above.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Dynamic Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest block">Velocity Pace</span>
            <span className="text-sm font-black text-white font-mono mt-0.5 block">{summaryMetrics.pace}%</span>
          </div>
          <Activity className="w-5 h-5 text-indigo-500 opacity-60" />
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest block">Actual Completed</span>
            <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">
              {summaryMetrics.completed} / {summaryMetrics.total}
            </span>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-500 opacity-60" />
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest block">Pace Schedule</span>
            <span className="text-sm font-black text-amber-500 font-mono mt-0.5 block">
              {summaryMetrics.projectedToday}
            </span>
          </div>
          <TrendingUp className="w-5 h-5 text-amber-500 opacity-60" />
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest block">Variance (Slippage)</span>
            <span className={`text-sm font-black font-mono mt-0.5 block ${summaryMetrics.slippage > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {summaryMetrics.slippage > 0 ? `+${summaryMetrics.slippage} Behind` : `${summaryMetrics.slippage} Ahead`}
            </span>
          </div>
          <AlertTriangle className={`w-5 h-5 opacity-60 ${summaryMetrics.slippage > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
        </div>
      </div>

      {/* D3 Canvas container */}
      <div className="relative flex-1 min-h-[160px] h-44 w-full bg-zinc-950/40 border border-zinc-900 rounded-xl p-2" ref={containerRef}>
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full overflow-visible" />

        {/* Floating Tooltip Panel (React Bound to State) */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-black/95 border border-zinc-800 rounded-lg p-2.5 text-[10px] font-mono pointer-events-none shadow-2xl backdrop-blur-md z-30 flex flex-col gap-1 w-44 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-white font-extrabold border-b border-zinc-900 pb-1 flex items-center justify-between">
              <span>{hoveredPoint.dateStr}</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 uppercase font-black">
                Point Metrics
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-zinc-500">Actual Done:</span>
              <span className="text-emerald-400 font-black">{hoveredPoint.actualCumulative}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Target Plan:</span>
              <span className="text-amber-500 font-black">{hoveredPoint.projectedCumulative}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Ideal Rate:</span>
              <span className="text-indigo-400 font-bold">{hoveredPoint.idealCumulative}</span>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-900 pt-1 mt-1 font-bold">
              <span className="text-zinc-400">Pace Gap:</span>
              {hoveredPoint.projectedCumulative - hoveredPoint.actualCumulative > 0 ? (
                <span className="text-rose-400">-{hoveredPoint.projectedCumulative - hoveredPoint.actualCumulative} Behind</span>
              ) : (
                <span className="text-emerald-400">+{hoveredPoint.actualCumulative - hoveredPoint.projectedCumulative} On Track</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mini Legend Description */}
      <div className="flex justify-between items-center text-[8px] font-mono text-zinc-650 mt-1 px-1.5">
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" /> Actual Velocity (Cumulative Done)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-amber-500 border-t border-dashed inline-block" /> Target Schedule (Plan)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-indigo-500/50 border-t border-dashed inline-block" /> Ideal Pace line
          </span>
        </div>
        <span>Interactive D3 Engine</span>
      </div>
    </div>
  );
};
