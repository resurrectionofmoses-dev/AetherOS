import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GlitchTelemetry } from '../types';

interface GlitchLineChartProps {
    data: GlitchTelemetry[];
}

export const GlitchLineChart: React.FC<GlitchLineChartProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 24, right: 32, bottom: 36, left: 48 };
        const width = 600 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        // When data is cleared or empty, render a diagnostic baseline placeholder
        if (!data || data.length === 0) {
            const emptyG = svg
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Subtle grid line baseline
            emptyG.append('line')
                .attr('x1', 0)
                .attr('y1', height / 2)
                .attr('x2', width)
                .attr('y2', height / 2)
                .attr('stroke', '#27272a')
                .attr('stroke-dasharray', '4 4');

            emptyG.append('text')
                .attr('x', width / 2)
                .attr('y', height / 2 - 12)
                .attr('text-anchor', 'middle')
                .attr('fill', '#71717a')
                .attr('font-size', '11px')
                .attr('font-family', 'monospace')
                .attr('letter-spacing', '0.1em')
                .text('SYSTEM BASELINE STABLE • 0 GLITCH TELEMETRY EVENTS');

            emptyG.append('text')
                .attr('x', width / 2)
                .attr('y', height / 2 + 16)
                .attr('text-anchor', 'middle')
                .attr('fill', '#3f3f46')
                .attr('font-size', '9px')
                .attr('font-family', 'monospace')
                .text('Trigger "Force Glitch" in the top bar to record forensic anomalies');

            return;
        }

        try {
            // Filter valid telemetry items with real timestamps and durations, sorted chronologically for plotting
            const validData = data
                .filter(d => 
                    d && typeof d.timestamp === 'number' && !isNaN(d.timestamp) &&
                    typeof d.duration === 'number' && !isNaN(d.duration)
                )
                .sort((a, b) => a.timestamp - b.timestamp);

            if (validData.length === 0) return;

            const g = svg
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Safe date extent
            let [minDate, maxDate] = d3.extent(validData, d => new Date(d.timestamp)) as [Date, Date];
            if (!minDate || !maxDate || minDate.getTime() === maxDate.getTime()) {
                const center = (minDate || new Date()).getTime();
                minDate = new Date(center - 30000);
                maxDate = new Date(center + 30000);
            }

            const x = d3.scaleTime()
                .domain([minDate, maxDate])
                .range([0, width]);

            const maxDuration = Math.max(100, d3.max(validData, d => d.duration) || 2000);
            const y = d3.scaleLinear()
                .domain([0, maxDuration * 1.15])
                .range([height, 0]);

            // Background horizontal grid lines
            const yGrid = d3.axisLeft(y)
                .ticks(4)
                .tickSize(-width)
                .tickFormat(() => '');

            g.append('g')
                .attr('class', 'grid')
                .call(yGrid)
                .attr('stroke', '#18181b')
                .attr('stroke-opacity', 0.5);

            const line = d3.line<GlitchTelemetry>()
                .x(d => x(new Date(d.timestamp)))
                .y(d => y(d.duration))
                .curve(d3.curveMonotoneX);

            // Bottom X Axis
            g.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(5).tickFormat((d: any) => d3.timeFormat('%H:%M:%S')(d as Date)))
                .attr('color', '#52525b')
                .selectAll('text')
                .attr('font-size', '9px')
                .attr('font-family', 'monospace');

            // Left Y Axis with ms label
            g.append('g')
                .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}ms`))
                .attr('color', '#52525b')
                .selectAll('text')
                .attr('font-size', '9px')
                .attr('font-family', 'monospace');

            // Area fill under line for cyber aesthetic
            const area = d3.area<GlitchTelemetry>()
                .x(d => x(new Date(d.timestamp)))
                .y0(height)
                .y1(d => y(d.duration))
                .curve(d3.curveMonotoneX);

            // Gradient definition
            const defs = svg.append('defs');
            const gradient = defs.append('linearGradient')
                .attr('id', 'glitch-line-gradient')
                .attr('x1', '0%').attr('y1', '0%')
                .attr('x2', '0%').attr('y2', '100%');
            gradient.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.35);
            gradient.append('stop').attr('offset', '100%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.0);

            g.append('path')
                .datum(validData)
                .attr('fill', 'url(#glitch-line-gradient)')
                .attr('d', area);

            // Main line
            g.append('path')
                .datum(validData)
                .attr('fill', 'none')
                .attr('stroke', '#e11d48')
                .attr('stroke-width', 2.5)
                .attr('d', line);

            // Points
            g.selectAll('circle')
                .data(validData)
                .enter()
                .append('circle')
                .attr('cx', d => x(new Date(d.timestamp)))
                .attr('cy', d => y(d.duration))
                .attr('r', d => (d.isSnapshot ? 5 : 4.5))
                .attr('fill', d => (d.isSnapshot ? '#22d3ee' : '#f43f5e'))
                .attr('stroke', '#09090b')
                .attr('stroke-width', 1.5);

        } catch (err) {
            console.error("[GlitchLineChart] Rendering anomaly caught:", err);
        }
    }, [data]);

    return (
        <div className="w-full overflow-hidden">
            <svg ref={svgRef} width="100%" height="300" viewBox="0 0 600 300" className="w-full h-auto" />
        </div>
    );
};
