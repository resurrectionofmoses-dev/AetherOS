import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { NetworkProject } from '../types';
import { CheckCircleIcon, CodeIcon, ShieldIcon, ActivityIcon, StarIcon, EngineIcon } from './icons';

interface ProjectProgressRingChartProps {
    projects?: NetworkProject[];
    className?: string;
    onSelectProject?: (projectId: string) => void;
    compact?: boolean;
}

interface ProcessedProjectData {
    id: string;
    title: string;
    status: string;
    totalTasks: number;
    completedTasks: number;
    progress: number;
    color: string;
    glowColor: string;
    priority?: string;
    tags?: string[];
}

const DEFAULT_PROJECT_PALETTE = [
    { color: '#06b6d4', glow: 'rgba(6,182,212,0.6)' },   // Cyan
    { color: '#3b82f6', glow: 'rgba(59,130,246,0.6)' },  // Blue
    { color: '#10b981', glow: 'rgba(16,185,129,0.6)' },  // Emerald
    { color: '#f59e0b', glow: 'rgba(245,158,11,0.6)' },  // Amber
    { color: '#a855f7', glow: 'rgba(168,85,247,0.6)' },  // Purple
    { color: '#f43f5e', glow: 'rgba(244,63,94,0.6)' },   // Rose
    { color: '#14b8a6', glow: 'rgba(20,184,166,0.6)' },  // Teal
];

export const ProjectProgressRingChart: React.FC<ProjectProgressRingChartProps> = ({
    projects = [],
    className = '',
    onSelectProject,
    compact = false
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [hoveredProject, setHoveredProject] = useState<ProcessedProjectData | null>(null);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'BUILDING' | 'DONE'>('ALL');
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 380, height: 380 });

    // Fallback default projects if no projects are provided
    const defaultFallbackProjects: ProcessedProjectData[] = useMemo(() => [
        { id: 'proj_shield', title: 'Sovereign Shield Envelope', status: 'STABLE', totalTasks: 18, completedTasks: 17, progress: 94, color: '#06b6d4', glowColor: 'rgba(6,182,212,0.6)', priority: 'CRITICAL' },
        { id: 'proj_conjunction', title: 'Neural Conjunction Engine', status: 'BUILDING', totalTasks: 12, completedTasks: 9, progress: 75, color: '#3b82f6', glowColor: 'rgba(59,130,246,0.6)', priority: 'HIGH' },
        { id: 'proj_crypto', title: '1028-Bit Quantum Gateway', status: 'BUILDING', totalTasks: 10, completedTasks: 6, progress: 60, color: '#a855f7', glowColor: 'rgba(168,85,247,0.6)', priority: 'HIGH' },
        { id: 'proj_maestro', title: 'Maestro Solo v5 Orchestration', status: 'FORGING', totalTasks: 15, completedTasks: 12, progress: 80, color: '#10b981', glowColor: 'rgba(16,185,129,0.6)', priority: 'CRITICAL' },
        { id: 'proj_kernel', title: 'AetherOS Core Kernel', status: 'DONE', totalTasks: 20, completedTasks: 20, progress: 100, color: '#f59e0b', glowColor: 'rgba(245,158,11,0.6)', priority: 'STABLE' },
    ], []);

    // Process network projects array into structured chart metrics
    const processedProjects: ProcessedProjectData[] = useMemo(() => {
        if (!Array.isArray(projects) || projects.length === 0) {
            return defaultFallbackProjects;
        }

        return projects.map((p, idx) => {
            const palette = DEFAULT_PROJECT_PALETTE[idx % DEFAULT_PROJECT_PALETTE.length];
            const tasks = p.tasks || [];
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.completed || t.status === 'DONE').length;

            let progress = 0;
            if (totalTasks > 0) {
                progress = Math.round((completedTasks / totalTasks) * 100);
            } else {
                switch (p.status) {
                    case 'DONE': progress = 100; break;
                    case 'STABLE': progress = 92; break;
                    case 'FORGING': progress = 78; break;
                    case 'BUILDING': progress = 55; break;
                    case 'IDEATING': progress = 25; break;
                    default: progress = 50;
                }
            }

            return {
                id: p.id || `proj_${idx}`,
                title: p.title || `Project #${idx + 1}`,
                status: p.status || 'BUILDING',
                totalTasks: totalTasks || 10,
                completedTasks: totalTasks ? completedTasks : Math.round((progress / 100) * 10),
                progress: Math.min(100, Math.max(0, progress)),
                color: palette.color,
                glowColor: palette.glow,
                priority: p.priority || 'MEDIUM',
                tags: p.tags || []
            };
        });
    }, [projects, defaultFallbackProjects]);

    // Filter projects based on status tab
    const filteredProjects = useMemo(() => {
        if (statusFilter === 'ALL') return processedProjects;
        if (statusFilter === 'DONE') return processedProjects.filter(p => p.progress === 100 || p.status === 'DONE' || p.status === 'STABLE');
        return processedProjects.filter(p => p.progress < 100 && p.status !== 'DONE' && p.status !== 'STABLE');
    }, [processedProjects, statusFilter]);

    // Overall summary metrics
    const overallMetrics = useMemo(() => {
        if (filteredProjects.length === 0) return { avgProgress: 0, totalCompleted: 0, totalTasks: 0 };
        const sumProgress = filteredProjects.reduce((acc, p) => acc + p.progress, 0);
        const sumCompleted = filteredProjects.reduce((acc, p) => acc + p.completedTasks, 0);
        const sumTotal = filteredProjects.reduce((acc, p) => acc + p.totalTasks, 0);
        return {
            avgProgress: Math.round(sumProgress / filteredProjects.length),
            totalCompleted: sumCompleted,
            totalTasks: sumTotal
        };
    }, [filteredProjects]);

    // Measure container for responsive D3 canvas
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            if (!entries[0]) return;
            const { width } = entries[0].contentRect;
            const size = compact ? Math.min(width, 280) : Math.min(width, 420);
            setDimensions({ width: size, height: size });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [compact]);

    // D3 Render Logic
    useEffect(() => {
        if (!svgRef.current || filteredProjects.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = dimensions.width;
        const height = dimensions.height;
        const margin = compact ? 15 : 25;
        const maxRadius = (Math.min(width, height) / 2) - margin;
        const minRadius = compact ? 35 : 55;

        const numRings = filteredProjects.length;
        const ringSpacing = 3;
        const totalThickness = maxRadius - minRadius;
        const ringThickness = Math.max(8, (totalThickness / numRings) - ringSpacing);

        const g = svg
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        // Add Defs for Glow Filters
        const defs = svg.append('defs');
        
        // Filter for glowing arcs
        const filter = defs.append('filter')
            .attr('id', 'sovereign-ring-glow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        filter.append('feGaussianBlur')
            .attr('stdDeviation', '3.5')
            .attr('result', 'coloredBlur');

        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Draw each concentric ring
        filteredProjects.forEach((proj, idx) => {
            const outerR = maxRadius - (idx * (ringThickness + ringSpacing));
            const innerR = outerR - ringThickness;

            const isHovered = hoveredProject?.id === proj.id;
            const activeThickness = isHovered ? ringThickness + 3 : ringThickness;
            const currentOuterR = isHovered ? outerR + 1.5 : outerR;
            const currentInnerR = isHovered ? innerR - 1.5 : innerR;

            // Background Track Arc (full 360 ring)
            const trackArc = d3.arc()
                .innerRadius(innerR)
                .outerRadius(outerR)
                .startAngle(0)
                .endAngle(2 * Math.PI)
                .cornerRadius(4);

            g.append('path')
                .attr('d', trackArc as any)
                .attr('fill', '#09090d')
                .attr('stroke', '#181824')
                .attr('stroke-width', 0.8)
                .attr('opacity', 0.85);

            // Foreground Progress Arc
            const progressRatio = proj.progress / 100;
            const targetEndAngle = progressRatio * 2 * Math.PI;

            const arcGenerator = d3.arc()
                .innerRadius(currentInnerR)
                .outerRadius(currentOuterR)
                .startAngle(0)
                .cornerRadius(Math.min(5, activeThickness / 2));

            const pathGroup = g.append('g')
                .attr('class', 'project-ring-group')
                .style('cursor', 'pointer');

            const path = pathGroup.append('path')
                .datum({ endAngle: 0 })
                .attr('fill', proj.color)
                .attr('filter', isHovered ? 'url(#sovereign-ring-glow)' : null)
                .attr('opacity', isHovered ? 1 : 0.88);

            // D3 Arc Interpolation Animation
            path.transition()
                .duration(1100)
                .ease(d3.easeCubicOut)
                .attrTween('d', function (d: any) {
                    const interpolate = d3.interpolate(d.endAngle, targetEndAngle);
                    return function (t: number) {
                        d.endAngle = interpolate(t);
                        return arcGenerator(d as any) || '';
                    };
                });

            // Glowing Indicator Cap at arc end if progress > 0
            if (proj.progress > 0 && proj.progress < 100) {
                const endAngle = targetEndAngle;
                const midRadius = (innerR + outerR) / 2;
                const capX = midRadius * Math.sin(endAngle);
                const capY = -midRadius * Math.cos(endAngle);

                g.append('circle')
                    .attr('cx', capX)
                    .attr('cy', capY)
                    .attr('r', ringThickness / 3.5)
                    .attr('fill', '#ffffff')
                    .attr('filter', 'url(#sovereign-ring-glow)')
                    .attr('opacity', 0.9);
            }

            // Interactive Event Handlers
            pathGroup
                .on('mouseenter', () => {
                    setHoveredProject(proj);
                })
                .on('mouseleave', () => {
                    setHoveredProject(null);
                })
                .on('click', () => {
                    if (onSelectProject) onSelectProject(proj.id);
                });
        });

        // Center Radial Pulse Accent
        g.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', minRadius - 6)
            .attr('fill', '#030305')
            .attr('stroke', hoveredProject ? hoveredProject.color : '#1f2937')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '3,3')
            .attr('class', 'transition-all duration-300');

    }, [filteredProjects, dimensions, hoveredProject, compact, onSelectProject]);

    const activeProject = hoveredProject || filteredProjects[0];

    return (
        <div className={`bg-black/90 border-2 border-zinc-900 rounded-3xl p-5 shadow-2xl flex flex-col ${className}`}>
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-3 gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center">
                        <EngineIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                            ACTIVE PROJECTS COMPLETION RING
                            <span className="bg-cyan-950 text-cyan-400 text-[8px] px-2 py-0.5 rounded border border-cyan-500/30 font-black">
                                {filteredProjects.length} ACTIVE
                            </span>
                        </h3>
                        <p className="text-[8px] text-zinc-500 font-mono">
                            Multi-ring D3 telemetry tracking tasks completion vectors across sovereign nodes
                        </p>
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 self-start sm:self-auto">
                    {(['ALL', 'BUILDING', 'DONE'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                                statusFilter === tab
                                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Interactive Ring Display Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-4 flex-1">
                {/* Left: D3 Ring Canvas */}
                <div ref={containerRef} className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[300px]">
                    <svg ref={svgRef} className="overflow-visible" />

                    {/* Center Stat Overlay over the D3 Ring */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        {hoveredProject ? (
                            <div className="animate-in fade-in zoom-in-95 duration-150 px-4 max-w-[150px]">
                                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block truncate">
                                    {hoveredProject.status}
                                </span>
                                <div className="text-xl font-black text-white tracking-tight leading-none mt-0.5 truncate">
                                    {hoveredProject.progress}%
                                </div>
                                <p className="text-[8px] font-bold text-cyan-400 mt-1 line-clamp-1 truncate">
                                    {hoveredProject.title}
                                </p>
                                <span className="text-[7px] text-zinc-500 font-mono block mt-0.5">
                                    {hoveredProject.completedTasks} / {hoveredProject.totalTasks} Tasks
                                </span>
                            </div>
                        ) : (
                            <div className="px-4 max-w-[150px]">
                                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block">
                                    AVERAGE VECTOR
                                </span>
                                <div className="text-2xl font-black text-cyan-400 tracking-tight leading-none mt-0.5">
                                    {overallMetrics.avgProgress}%
                                </div>
                                <span className="text-[8px] font-bold text-zinc-400 mt-1 block">
                                    {overallMetrics.totalCompleted} / {overallMetrics.totalTasks} Tasks
                                </span>
                                <span className="text-[7px] text-emerald-500 font-mono block mt-0.5">
                                    ✓ ALL SYSTEMS ONLINE
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Detailed Projects Breakdown & Progress Bars */}
                <div className="lg:col-span-6 space-y-3">
                    <div className="text-[8px] font-black uppercase text-zinc-400 tracking-wider flex items-center justify-between border-b border-zinc-900 pb-2">
                        <span>PROJECT PROGRESS BREAKDOWN</span>
                        <span className="text-cyan-400 font-mono">COMPLETION STATUS</span>
                    </div>

                    <div className="space-y-2.5 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                        {filteredProjects.map((p) => {
                            const isHovered = hoveredProject?.id === p.id;
                            return (
                                <div
                                    key={p.id}
                                    onMouseEnter={() => setHoveredProject(p)}
                                    onMouseLeave={() => setHoveredProject(null)}
                                    onClick={() => onSelectProject && onSelectProject(p.id)}
                                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                        isHovered
                                            ? 'bg-zinc-900/90 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                            : 'bg-zinc-950/80 border-zinc-900 hover:border-zinc-800'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                                style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.glowColor}` }}
                                            />
                                            <span className="text-xs font-bold text-white truncate max-w-[180px]">
                                                {p.title}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-[7.5px] font-black px-2 py-0.5 rounded uppercase border ${
                                                p.progress === 100 
                                                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-blue-950/40 text-blue-400 border-blue-500/30'
                                            }`}>
                                                {p.status}
                                            </span>
                                            <span className="text-xs font-black text-white font-mono min-w-[36px] text-right">
                                                {p.progress}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800/80">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${p.progress}%`,
                                                backgroundColor: p.color,
                                                boxShadow: `0 0 8px ${p.glowColor}`
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-[7.5px] text-zinc-500 font-mono mt-1.5">
                                        <span>Tasks: {p.completedTasks} / {p.totalTasks} Done</span>
                                        {p.priority && (
                                            <span className={p.priority === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-zinc-500'}>
                                                PRIORITY: {p.priority}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer Summary Metric Bar */}
            <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-wrap items-center justify-between text-[8px] font-mono text-zinc-500 gap-2">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                        {overallMetrics.totalCompleted} Completed Tasks
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                        <ActivityIcon className="w-3 h-3 text-cyan-400" />
                        {filteredProjects.length} Projects Tracked
                    </span>
                </div>
                <div className="text-zinc-600 uppercase font-black tracking-widest">
                    D3 Sovereign Telemetry Ring v2.4
                </div>
            </div>
        </div>
    );
};
