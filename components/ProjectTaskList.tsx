import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Search, 
  ArrowUpDown, 
  Edit3, 
  Check, 
  X,
  Flag,
  Sparkles,
  Tag as TagIcon
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ProjectTask, NetworkProject } from '../types';
import { formatDueDate, getPresetDate } from '../services/projectManagerUtils';
import { TaskModal } from './TaskModal';

interface ProjectTaskListProps {
  project: NetworkProject;
  onToggleTask: (projectId: string, taskId: string) => void;
  onDeleteTask: (projectId: string, taskId: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<NetworkProject>) => void;
}

export const ProjectTaskList: React.FC<ProjectTaskListProps> = ({
  project,
  onToggleTask,
  onDeleteTask,
  onUpdateProject
}) => {
  const tasks = project.tasks || [];

  // Quick Add Form State
  const [quickText, setQuickText] = useState('');
  const [quickDueDate, setQuickDueDate] = useState<string>(getPresetDate('tomorrow'));
  const [quickPriority, setQuickPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');

  // Filters & Search
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'OVERDUE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'DUE_DATE' | 'PRIORITY' | 'NEWEST' | 'ALPHABETICAL'>('DUE_DATE');

  // Task Modal for detailed edit
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Inline Due Date Editing
  const [inlineDateTaskId, setInlineDateTaskId] = useState<string | null>(null);

  // Statistics
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const overdueCount = tasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    return formatDueDate(t.dueDate, false).status === 'overdue';
  }).length;
  const percentComplete = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  // Filtered & Sorted Tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by mode
    if (filterMode === 'PENDING') {
      result = result.filter(t => !t.completed);
    } else if (filterMode === 'COMPLETED') {
      result = result.filter(t => t.completed);
    } else if (filterMode === 'OVERDUE') {
      result = result.filter(t => !t.completed && t.dueDate && formatDueDate(t.dueDate, false).status === 'overdue');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.text.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'DUE_DATE') {
        // Incomplete overdue first, then earliest due date, then tasks without due dates
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      } else if (sortBy === 'PRIORITY') {
        const priorityOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const pA = priorityOrder[a.priority || 'MEDIUM'] || 0;
        const pB = priorityOrder[b.priority || 'MEDIUM'] || 0;
        return pB - pA;
      } else if (sortBy === 'NEWEST') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      } else if (sortBy === 'ALPHABETICAL') {
        return a.text.localeCompare(b.text);
      }
      return 0;
    });

    return result;
  }, [tasks, filterMode, searchQuery, sortBy]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) return;

    const newTask: ProjectTask = {
      id: uuidv4(),
      text: quickText.trim(),
      completed: false,
      status: 'TODO',
      dueDate: quickDueDate || undefined,
      priority: quickPriority,
      createdAt: Date.now()
    };

    const updatedTasks = [...tasks, newTask];
    onUpdateProject?.(project.id, { tasks: updatedTasks });

    setQuickText('');
    setQuickDueDate(getPresetDate('tomorrow'));
  };

  const handleInlineDueDateChange = (taskId: string, newDate: string) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, dueDate: newDate || undefined } : t
    );
    onUpdateProject?.(project.id, { tasks: updatedTasks });
    setInlineDateTaskId(null);
  };

  const handleMarkAllDone = () => {
    const updatedTasks = tasks.map(t => ({
      ...t,
      completed: true,
      status: 'DONE' as const,
      completedAt: t.completedAt || Date.now()
    }));
    onUpdateProject?.(project.id, { tasks: updatedTasks });
  };

  const handleClearCompleted = () => {
    const updatedTasks = tasks.filter(t => !t.completed);
    onUpdateProject?.(project.id, { tasks: updatedTasks });
  };

  return (
    <div className="space-y-6">
      {/* Top Summary & Progress Card */}
      <div className="p-5 bg-zinc-950/70 border border-amber-500/20 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Task Management
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {completedCount} of {tasks.length} objectives completed
              </span>
            </div>
            <h2 className="text-base font-serif font-bold text-zinc-100 uppercase tracking-wider">
              {project.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllDone}
              disabled={tasks.length === 0 || completedCount === tasks.length}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Mark All Done
            </button>
            <button
              onClick={handleClearCompleted}
              disabled={completedCount === 0}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Completed
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
            <span>Overall Completion</span>
            <span className="font-bold text-amber-400">{percentComplete}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-zinc-800">
            <motion.div
              className={`h-full transition-all rounded-full ${
                percentComplete === 100 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Quick Add Task with Due Date Form */}
      <div className="p-4 bg-zinc-950/80 border border-amber-500/30 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-300">
              Add Task with Due Date
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase mr-1">Quick Date:</span>
            <button
              type="button"
              onClick={() => setQuickDueDate(getPresetDate('today'))}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-amber-400 text-zinc-300 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setQuickDueDate(getPresetDate('tomorrow'))}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-amber-400 text-zinc-300 transition-colors"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setQuickDueDate(getPresetDate('in3days'))}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-amber-400 text-zinc-300 transition-colors"
            >
              +3 Days
            </button>
            <button
              type="button"
              onClick={() => setQuickDueDate(getPresetDate('nextweek'))}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-amber-400 text-zinc-300 transition-colors"
            >
              +1 Week
            </button>
          </div>
        </div>

        <form onSubmit={handleQuickAdd} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              required
              value={quickText}
              onChange={e => setQuickText(e.target.value)}
              placeholder="What needs to be done? (e.g. Conduct compliance audit, run load tests)..."
              className="w-full bg-black/90 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
            />
          </div>

          {/* Due Date Picker */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="date"
                required
                value={quickDueDate}
                onChange={e => setQuickDueDate(e.target.value)}
                className="bg-black/90 border border-zinc-800 focus:border-amber-400 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none cursor-pointer"
                title="Task due date"
              />
            </div>

            {/* Priority Select */}
            <select
              value={quickPriority}
              onChange={e => setQuickPriority(e.target.value as any)}
              className="bg-black/90 border border-zinc-800 focus:border-amber-400 rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer font-mono"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold font-serif text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-850">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
              filterMode === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            All <span className="text-[10px] opacity-70">({tasks.length})</span>
          </button>
          <button
            onClick={() => setFilterMode('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
              filterMode === 'PENDING'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            Active <span className="text-[10px] opacity-70">({pendingCount})</span>
          </button>
          <button
            onClick={() => setFilterMode('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
              filterMode === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            Completed <span className="text-[10px] opacity-70">({completedCount})</span>
          </button>
          <button
            onClick={() => setFilterMode('OVERDUE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
              filterMode === 'OVERDUE'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : overdueCount > 0
                  ? 'text-rose-400 hover:bg-rose-500/10 border border-rose-500/20'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            {overdueCount > 0 && <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />}
            Overdue <span className="text-[10px] opacity-70">({overdueCount})</span>
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="bg-black/60 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-650 outline-none w-40 sm:w-48 focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-black/60 border border-zinc-800 rounded-xl px-2 py-1">
            <ArrowUpDown className="w-3 h-3 text-zinc-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-zinc-300 outline-none cursor-pointer font-mono"
            >
              <option value="DUE_DATE" className="bg-zinc-950">Due Date</option>
              <option value="PRIORITY" className="bg-zinc-950">Priority</option>
              <option value="NEWEST" className="bg-zinc-950">Newest</option>
              <option value="ALPHABETICAL" className="bg-zinc-950">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {processedTasks.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-850 rounded-2xl bg-black/30 space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-serif font-bold uppercase tracking-wider text-zinc-400">
                {filterMode === 'OVERDUE' 
                  ? 'No Overdue Tasks' 
                  : filterMode === 'COMPLETED'
                  ? 'No Completed Tasks Yet'
                  : 'No Tasks Found'}
              </p>
              <p className="text-[10px] font-mono text-zinc-600">
                {filterMode === 'ALL'
                  ? 'Use the form above to add your first objective with a due date.'
                  : 'Adjust filters or add a new task to get started.'}
              </p>
            </div>
          </div>
        ) : (
          processedTasks.map(task => {
            const dueInfo = formatDueDate(task.dueDate, task.completed);
            const isEditingDate = inlineDateTaskId === task.id;

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group relative overflow-hidden ${
                  task.completed
                    ? 'bg-zinc-950/40 border-zinc-900/60 text-zinc-500 opacity-80'
                    : dueInfo.status === 'overdue'
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.08)]'
                    : dueInfo.status === 'today'
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                    : 'bg-zinc-950/80 border-zinc-850 hover:border-amber-500/30'
                }`}
              >
                {/* Left side: Checkbox + Title + Description */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Mark Task Complete Button */}
                  <button
                    type="button"
                    onClick={() => onToggleTask(project.id, task.id)}
                    className="mt-0.5 p-0.5 rounded-lg text-zinc-400 hover:text-white transition-transform active:scale-90 flex-shrink-0 cursor-pointer"
                    title={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-500 hover:text-amber-400 transition-colors" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <p className={`text-xs font-medium tracking-tight transition-all break-words ${
                      task.completed ? 'line-through text-zinc-500' : 'text-zinc-100 font-semibold'
                    }`}>
                      {task.text}
                    </p>

                    {task.description && (
                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {task.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono px-2 py-0.2 rounded bg-black/60 border border-zinc-800 text-zinc-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Due Date Badge + Priority + Actions */}
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-900">
                  {/* Due Date Display / Inline Edit */}
                  {isEditingDate ? (
                    <div className="flex items-center gap-1 bg-black border border-amber-400 rounded-lg px-2 py-1">
                      <input
                        type="date"
                        defaultValue={task.dueDate || ''}
                        onChange={e => handleInlineDueDateChange(task.id, e.target.value)}
                        className="bg-transparent text-[10px] text-white outline-none"
                      />
                      <button
                        onClick={() => setInlineDateTaskId(null)}
                        className="text-zinc-400 hover:text-white text-xs ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setInlineDateTaskId(task.id)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                        task.completed
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                          : dueInfo.status === 'overdue'
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold'
                          : dueInfo.status === 'today'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold animate-pulse'
                          : dueInfo.status === 'tomorrow'
                          ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                          : task.dueDate
                          ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                          : 'bg-zinc-900 border-dashed border-zinc-800 text-zinc-500 hover:border-amber-500/40 hover:text-zinc-300'
                      }`}
                      title="Click to edit due date"
                    >
                      {dueInfo.status === 'overdue' ? (
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                      ) : (
                        <Calendar className="w-3 h-3 opacity-70" />
                      )}
                      <span>{task.dueDate ? dueInfo.label : '+ Due Date'}</span>
                    </button>
                  )}

                  {/* Priority Badge */}
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${
                    task.priority === 'CRITICAL'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                      : task.priority === 'HIGH'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : task.priority === 'LOW'
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}>
                    {task.priority || 'MEDIUM'}
                  </span>

                  {/* Edit and Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(task);
                        setIsModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-zinc-500 hover:text-amber-300 hover:bg-zinc-900 transition-colors"
                      title="Edit task details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(project.id, task.id)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Task Edit Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          task={editingTask}
          allTasks={tasks}
          onSave={taskData => {
            if (editingTask) {
              const updatedTasks = tasks.map(t =>
                t.id === editingTask.id ? { ...t, ...taskData } : t
              );
              onUpdateProject?.(project.id, { tasks: updatedTasks });
            }
            setIsModalOpen(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};
