import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  FolderPlus, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  Table as TableIcon, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Flag,
  Sparkles,
  TrendingUp,
  BarChart3,
  Check,
  ShieldCheck
} from 'lucide-react';
import { NetworkProject, ProjectTask } from '../types';
import { getProjectStats, getGlobalSummary, formatDueDate, getPresetDate } from '../services/projectManagerUtils';
import { v4 as uuidv4 } from 'uuid';

interface ProjectStatusOverviewProps {
  projects: NetworkProject[];
  onSelectProject: (projectId: string) => void;
  onOpenDefineModal: (projectToEdit?: NetworkProject | null) => void;
  onDeleteProject: (projectId: string) => void;
  onToggleTask: (projectId: string, taskId: string) => void;
  onQuickAddTask: (projectId: string, text: string, dueDate: string) => void;
  onUpdateProjectStatus: (projectId: string, status: NetworkProject['status']) => void;
}

export const ProjectStatusOverview: React.FC<ProjectStatusOverviewProps> = ({
  projects,
  onSelectProject,
  onOpenDefineModal,
  onDeleteProject,
  onToggleTask,
  onQuickAddTask,
  onUpdateProjectStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BUILDING' | 'IDEATING' | 'DONE' | 'AT_RISK'>('ALL');
  const [sortBy, setSortBy] = useState<'PROGRESS_ASC' | 'PROGRESS_DESC' | 'DEADLINE' | 'TASKS_COUNT' | 'NAME'>('PROGRESS_ASC');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Accordion state for quick task inspection directly inside overview cards
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Inline quick task add on a specific project card
  const [addingTaskId, setAddingTaskId] = useState<string | null>(null);
  const [inlineTaskText, setInlineTaskText] = useState('');
  const [inlineTaskDueDate, setInlineTaskDueDate] = useState(getPresetDate('tomorrow'));

  // Global Portfolio KPI Summary
  const globalSummary = useMemo(() => getGlobalSummary(projects), [projects]);

  // Filtered and Sorted Projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Status filter
    if (statusFilter === 'BUILDING') {
      result = result.filter(p => p.status === 'BUILDING' || p.status === 'FORGING' || p.status === 'STABLE');
    } else if (statusFilter === 'IDEATING') {
      result = result.filter(p => p.status === 'IDEATING');
    } else if (statusFilter === 'DONE') {
      result = result.filter(p => p.status === 'DONE' || getProjectStats(p).health === 'COMPLETED');
    } else if (statusFilter === 'AT_RISK') {
      result = result.filter(p => getProjectStats(p).health === 'AT_RISK');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        p.tasks?.some(t => t.text.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      const statsA = getProjectStats(a);
      const statsB = getProjectStats(b);

      if (sortBy === 'PROGRESS_ASC') {
        return statsA.progressPercent - statsB.progressPercent;
      } else if (sortBy === 'PROGRESS_DESC') {
        return statsB.progressPercent - statsA.progressPercent;
      } else if (sortBy === 'DEADLINE') {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      } else if (sortBy === 'TASKS_COUNT') {
        return statsB.totalTasks - statsA.totalTasks;
      } else if (sortBy === 'NAME') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [projects, statusFilter, searchQuery, sortBy]);

  const toggleAccordion = (projectId: string) => {
    setExpandedProjectId(prev => prev === projectId ? null : projectId);
  };

  const handleInlineTaskSubmit = (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTaskText.trim()) return;
    onQuickAddTask(projectId, inlineTaskText.trim(), inlineTaskDueDate);
    setInlineTaskText('');
    setInlineTaskDueDate(getPresetDate('tomorrow'));
    setAddingTaskId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & New Project Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-950/80 border border-amber-500/20 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 rounded-xl text-amber-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-serif font-bold uppercase tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 bg-clip-text text-transparent">
                Projects Status Overview
              </h1>
              <span className="text-[9px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full uppercase">
                Portfolio Dashboard
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
              Real-time tracking of project health, task completion rates, and upcoming deadlines
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenDefineModal(null)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-serif font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
        >
          <FolderPlus className="w-4 h-4" /> Define New Project
        </button>
      </div>

      {/* Global Portfolio KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Projects */}
        <div className="p-3.5 bg-zinc-950/60 border border-zinc-850 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Projects</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-serif text-zinc-100">{globalSummary.totalProjects}</div>
          <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
            {globalSummary.activeProjects} active • {globalSummary.completedProjects} done
          </div>
        </div>

        {/* Global Progress */}
        <div className="p-3.5 bg-zinc-950/60 border border-zinc-850 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Overall Progress</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-serif text-emerald-400">{globalSummary.overallProgress}%</div>
          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden mt-1.5">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all" 
              style={{ width: `${globalSummary.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Total Tasks */}
        <div className="p-3.5 bg-zinc-950/60 border border-zinc-850 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Objectives</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-serif text-zinc-100">{globalSummary.totalTasks}</div>
          <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
            {globalSummary.completedTasks} completed • {globalSummary.pendingTasks} pending
          </div>
        </div>

        {/* Completed Projects */}
        <div className="p-3.5 bg-zinc-950/60 border border-zinc-850 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Completed</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-serif text-teal-400">{globalSummary.completedProjects}</div>
          <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
            100% finished projects
          </div>
        </div>

        {/* Overdue Tasks Alert */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          globalSummary.overdueTasks > 0
            ? 'bg-rose-950/30 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.1)]'
            : 'bg-zinc-950/60 border-zinc-850'
        }`}>
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className={`text-[10px] font-mono uppercase tracking-wider ${
              globalSummary.overdueTasks > 0 ? 'text-rose-400 font-bold' : ''
            }`}>
              Overdue Tasks
            </span>
            <AlertTriangle className={`w-3.5 h-3.5 ${
              globalSummary.overdueTasks > 0 ? 'text-rose-400 animate-pulse' : 'text-zinc-500'
            }`} />
          </div>
          <div className={`text-xl font-bold font-serif ${
            globalSummary.overdueTasks > 0 ? 'text-rose-400' : 'text-zinc-400'
          }`}>
            {globalSummary.overdueTasks}
          </div>
          <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
            {globalSummary.overdueTasks > 0 ? 'Action required on deadlines' : 'All schedules on track'}
          </div>
        </div>
      </div>

      {/* Filter, Search & Layout Switcher Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-black/40 border border-zinc-850 rounded-xl">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              statusFilter === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setStatusFilter('BUILDING')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              statusFilter === 'BUILDING'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('IDEATING')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              statusFilter === 'IDEATING'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            Planning
          </button>
          <button
            onClick={() => setStatusFilter('DONE')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              statusFilter === 'DONE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('AT_RISK')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
              statusFilter === 'AT_RISK'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-zinc-400 hover:text-rose-300 border border-transparent'
            }`}
          >
            {globalSummary.overdueTasks > 0 && <AlertTriangle className="w-3 h-3 text-rose-400" />}
            At Risk
          </button>
        </div>

        {/* Search, Sort and View Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search all projects..."
              className="bg-black/80 border border-zinc-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-650 outline-none w-44 focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-black/80 border border-zinc-800 rounded-lg px-2 py-1">
            <ArrowUpDown className="w-3 h-3 text-zinc-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-zinc-300 outline-none cursor-pointer font-mono"
            >
              <option value="PROGRESS_ASC" className="bg-zinc-950">Needs Progress First</option>
              <option value="PROGRESS_DESC" className="bg-zinc-950">Highest Progress</option>
              <option value="DEADLINE" className="bg-zinc-950">Target Deadline</option>
              <option value="TASKS_COUNT" className="bg-zinc-950">Most Objectives</option>
              <option value="NAME" className="bg-zinc-950">A-Z Name</option>
            </select>
          </div>

          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center bg-black/80 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'CARDS' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'TABLE' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Status Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display: Cards or Table */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-zinc-850 rounded-2xl bg-black/30 space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-zinc-300">
              No Projects Match Current Filter
            </h3>
            <p className="text-[10px] font-mono text-zinc-500">
              Try adjusting your search criteria or define a new project to get started.
            </p>
          </div>
          <button
            onClick={() => onOpenDefineModal(null)}
            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Define New Project
          </button>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map(project => {
            const stats = getProjectStats(project);
            const isExpanded = expandedProjectId === project.id;
            const isAddingTask = addingTaskId === project.id;
            const deadlineInfo = project.deadline ? formatDueDate(project.deadline, stats.health === 'COMPLETED') : null;

            return (
              <motion.div
                key={project.id}
                layout
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden bg-zinc-950/70 shadow-lg ${
                  stats.health === 'AT_RISK'
                    ? 'border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.06)]'
                    : stats.health === 'COMPLETED'
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : 'border-zinc-850 hover:border-amber-500/40'
                }`}
              >
                {/* Card Top: Badges + Title */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Status Badge */}
                      <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                        project.status === 'DONE' || stats.health === 'COMPLETED'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : project.status === 'BUILDING'
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                          : project.status === 'STABLE'
                          ? 'bg-teal-500/15 border-teal-500/30 text-teal-400'
                          : project.status === 'FORGING'
                          ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                          : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                      }`}>
                        {project.status === 'IDEATING' ? 'PLANNING' : project.status || 'ACTIVE'}
                      </span>

                      {/* Health Indicator Badge */}
                      {stats.health === 'AT_RISK' && (
                        <span className="text-[9px] font-mono bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" /> {stats.overdueTasks} Overdue
                        </span>
                      )}

                      {/* Priority */}
                      {project.priority && (
                        <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                          {project.priority}
                        </span>
                      )}
                    </div>

                    {/* Deadline Badge */}
                    {deadlineInfo && (
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                        deadlineInfo.status === 'overdue'
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          : deadlineInfo.status === 'today'
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}>
                        <Calendar className="w-3 h-3 opacity-70" />
                        {deadlineInfo.label}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-serif font-bold text-zinc-100 uppercase tracking-wider mb-1 line-clamp-1">
                    {project.title}
                  </h3>

                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Progress Bar & Stats */}
                  <div className="space-y-1.5 mb-4 p-3 bg-black/40 rounded-xl border border-zinc-900">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-400">
                        {stats.completedTasks} of {stats.totalTasks} tasks complete
                      </span>
                      <span className={`font-bold ${
                        stats.progressPercent === 100 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {stats.progressPercent}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.progressPercent === 100
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        }`}
                        style={{ width: `${stats.progressPercent}%` }}
                      />
                    </div>

                    {/* Mini Task Status Pills */}
                    <div className="flex items-center gap-2 pt-1 text-[9px] font-mono text-zinc-400">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {stats.pendingTasks} Pending
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {stats.completedTasks} Done
                      </span>
                      {stats.overdueTasks > 0 && (
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {stats.overdueTasks} Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Task Accordion Inspection */}
                <div className="border-t border-zinc-850 pt-3 mt-1 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(project.id)}
                      className="text-[10px] font-mono text-amber-400/90 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span>{isExpanded ? 'Hide Objectives' : `View Objectives (${project.tasks?.length || 0})`}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setAddingTaskId(isAddingTask ? null : project.id)}
                        className="text-[10px] font-mono text-zinc-400 hover:text-amber-300 px-2 py-0.5 rounded hover:bg-zinc-900 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Quick Add
                      </button>
                    </div>
                  </div>

                  {/* Inline Add Task Form */}
                  {isAddingTask && (
                    <form onSubmit={e => handleInlineTaskSubmit(project.id, e)} className="p-2.5 bg-black/60 border border-amber-500/30 rounded-xl space-y-2 text-xs">
                      <input
                        type="text"
                        required
                        value={inlineTaskText}
                        onChange={e => setInlineTaskText(e.target.value)}
                        placeholder="Task description..."
                        className="w-full bg-black border border-zinc-800 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 outline-none"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="date"
                          value={inlineTaskDueDate}
                          onChange={e => setInlineTaskDueDate(e.target.value)}
                          className="bg-black border border-zinc-800 rounded-lg px-2 py-1 text-[10px] text-white outline-none"
                        />
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAddingTaskId(null)}
                            className="px-2 py-1 text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-mono font-bold"
                          >
                            Save Task
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Expanded Task List Preview */}
                  {isExpanded && (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar pt-1">
                      {(!project.tasks || project.tasks.length === 0) ? (
                        <p className="text-[10px] font-mono text-zinc-600 italic py-2 text-center">
                          No tasks defined yet. Click "Quick Add" to create one.
                        </p>
                      ) : (
                        project.tasks.map(t => {
                          const due = formatDueDate(t.dueDate, t.completed);
                          return (
                            <div
                              key={t.id}
                              className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-colors ${
                                t.completed 
                                  ? 'bg-black/30 border-zinc-900 text-zinc-500' 
                                  : due.status === 'overdue'
                                  ? 'bg-rose-950/20 border-rose-500/30'
                                  : 'bg-black/40 border-zinc-850'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => onToggleTask(project.id, t.id)}
                                  className="text-zinc-400 hover:text-white cursor-pointer transition-transform active:scale-90"
                                  title={t.completed ? "Mark incomplete" : "Mark complete"}
                                >
                                  {t.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-zinc-500 hover:text-amber-400" />
                                  )}
                                </button>
                                <span className={`truncate text-[11px] ${
                                  t.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                                }`}>
                                  {t.text}
                                </span>
                              </div>

                              {t.dueDate && (
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border flex-shrink-0 ${
                                  t.completed 
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                                    : due.status === 'overdue'
                                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                                    : due.status === 'today'
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                                }`}>
                                  {due.formattedDate || t.dueDate}
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenDefineModal(project)}
                        className="p-1 rounded text-zinc-500 hover:text-amber-300 transition-colors"
                        title="Edit Project Definition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete project "${project.title}"?`)) {
                            onDeleteProject(project.id);
                          }
                        }}
                        className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectProject(project.id)}
                      className="px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW OF ALL PROJECTS */
        <div className="border border-zinc-850 rounded-2xl overflow-hidden bg-zinc-950/80 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black border-b border-zinc-800 text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Target Deadline</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-3 text-center">Tasks</th>
                  <th className="py-3 px-3 text-center">Health</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredProjects.map(project => {
                  const stats = getProjectStats(project);
                  const deadlineInfo = project.deadline ? formatDueDate(project.deadline, stats.health === 'COMPLETED') : null;

                  return (
                    <tr key={project.id} className="hover:bg-black/40 transition-colors">
                      <td className="py-3.5 px-4 font-serif font-bold text-zinc-100 uppercase tracking-wide">
                        <div className="flex flex-col">
                          <span>{project.title}</span>
                          <span className="text-[9px] font-mono text-zinc-500 font-normal line-clamp-1">
                            {project.description}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                          project.status === 'DONE' || stats.health === 'COMPLETED'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : project.status === 'BUILDING'
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                            : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                        }`}>
                          {project.status === 'IDEATING' ? 'PLANNING' : project.status || 'ACTIVE'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-zinc-400 font-mono text-[10px]">
                        {project.priority || 'Medium'}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[10px]">
                        {deadlineInfo ? (
                          <span className={deadlineInfo.status === 'overdue' ? 'text-rose-400 font-bold' : 'text-zinc-300'}>
                            {deadlineInfo.formattedDate || project.deadline}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
                            <div 
                              className={`h-full rounded-full ${
                                stats.progressPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${stats.progressPercent}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-zinc-300 w-8 text-right">
                            {stats.progressPercent}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono text-[10px] text-zinc-300">
                        {stats.completedTasks} / {stats.totalTasks}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        {stats.health === 'AT_RISK' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" /> At Risk
                          </span>
                        ) : stats.health === 'COMPLETED' ? (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Completed
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-teal-400 bg-teal-500/15 px-2 py-0.5 rounded-full border border-teal-500/30">
                            On Track
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectProject(project.id)}
                            className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-mono transition-colors"
                          >
                            Workspace
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenDefineModal(project)}
                            className="p-1 text-zinc-500 hover:text-amber-300"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete "${project.title}"?`)) onDeleteProject(project.id);
                            }}
                            className="p-1 text-zinc-500 hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
