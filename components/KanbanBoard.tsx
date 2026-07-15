import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  ArrowRight, 
  Edit3, 
  Check, 
  X,
  Play,
  Flame,
  Clock,
  Crown,
  Gem,
  Sparkles,
  Shield,
  Search,
  Tag,
  Link,
  Lock
} from 'lucide-react';
import { estimateTaskCompletion } from '../utils';
import type { NetworkProject, ProjectTask } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TaskModal } from './TaskModal';

export interface KanbanColumn {
  id: 'TODO' | 'IN_PROGRESS' | 'DONE';
  label: string;
}

interface KanbanBoardProps {
  project: NetworkProject;
  tasks: ProjectTask[];
  onToggleTask: (projectId: string, taskId: string) => void;
  onDeleteTask: (projectId: string, taskId: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<NetworkProject>) => void;
  playOperatorBeep?: (freq?: number, type?: OscillatorType, duration?: number) => void;
  isAudible?: boolean;
  speedStats?: { averageSpeedMs: number };
  columns?: KanbanColumn[];
}

interface ColumnConfig {
  id: 'TODO' | 'IN_PROGRESS' | 'DONE';
  label: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  barColor: string;
  emptyLabel: string;
  accentColor: string;
  headerBg: string;
  icon: React.ReactNode;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  project,
  tasks,
  onToggleTask,
  onDeleteTask,
  onUpdateProject,
  playOperatorBeep,
  isAudible = false,
  speedStats,
  columns: customColumns
}) => {
  const [draggedOverCol, setDraggedOverCol] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggedOverTaskId, setDraggedOverTaskId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
  
  // Inline Task Adding
  const [activeInlineAdd, setActiveInlineAdd] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | null>(null);
  const [inlineAddText, setInlineAddText] = useState('');
  
  // Inline Task Editing
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingDesc, setEditingDesc] = useState('');
  const [editingPriority, setEditingPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [editingDueDate, setEditingDueDate] = useState('');
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [editingDependencies, setEditingDependencies] = useState<string[]>([]);
  const [blockedWarningTaskId, setBlockedWarningTaskId] = useState<string | null>(null);

  // Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalSelectedTask, setModalSelectedTask] = useState<ProjectTask | null>(null);
  const [modalInitialStatus, setModalInitialStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');

  // Helper to check if a task is blocked by uncompleted prerequisites
  const isTaskBlocked = (task: ProjectTask) => {
    if (!task.dependencies || task.dependencies.length === 0) return false;
    return task.dependencies.some(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && !depTask.completed;
    });
  };

  // Pre-defined color mapping for common tags
  const getTagStyles = (tag: string) => {
    const t = tag.toLowerCase().trim();
    if (t === 'urgent' || t === 'high priority') {
      return {
        bg: 'bg-rose-950/30',
        text: 'text-rose-400',
        border: 'border-rose-500/30'
      };
    }
    if (t === 'low priority' || t === 'low') {
      return {
        bg: 'bg-zinc-900/40',
        text: 'text-zinc-400',
        border: 'border-zinc-800'
      };
    }
    if (t === 'research') {
      return {
        bg: 'bg-purple-950/30',
        text: 'text-purple-300',
        border: 'border-purple-500/20'
      };
    }
    if (t === 'bug') {
      return {
        bg: 'bg-red-950/30',
        text: 'text-red-400',
        border: 'border-red-500/20'
      };
    }
    if (t === 'feature' || t === 'idea') {
      return {
        bg: 'bg-emerald-950/30',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20'
      };
    }
    if (t === 'refactor' || t === 'core' || t === 'logic') {
      return {
        bg: 'bg-amber-950/30',
        text: 'text-amber-400',
        border: 'border-amber-500/20'
      };
    }
    return {
      bg: 'bg-blue-950/30',
      text: 'text-blue-400',
      border: 'border-blue-500/20'
    };
  };

  // Real-time search and tag filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string>('ALL');

  const filteredTasks = tasks.filter(task => {
    // 1. Tag filter matching
    if (activeTagFilter !== 'ALL') {
      const hasTag = task.tags?.some(tag => tag.toLowerCase().trim() === activeTagFilter.toLowerCase().trim());
      if (!hasTag) return false;
    }

    // 2. Search query matching
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesTitle = task.text?.toLowerCase().includes(query);
    const matchesDesc = task.description?.toLowerCase().includes(query);
    const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(query));
    return matchesTitle || matchesDesc || matchesTags;
  });

  const defaultColumns: ColumnConfig[] = [
    { 
      id: 'TODO', 
      label: 'To Do', 
      borderClass: 'border-amber-500/25 hover:border-amber-400/50 shadow-[inset_0_1px_2px_rgba(59,130,246,0.15)]', 
      bgClass: 'bg-gradient-to-b from-blue-950/20 via-zinc-950/80 to-black/95', 
      textClass: 'text-blue-300', 
      barColor: 'bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600',
      emptyLabel: 'No objectives in To Do',
      accentColor: '#3b82f6',
      headerBg: 'from-blue-950/50 to-transparent',
      icon: <Shield className="w-3.5 h-3.5 text-amber-400" />
    },
    { 
      id: 'IN_PROGRESS', 
      label: 'In Progress', 
      borderClass: 'border-amber-500/35 hover:border-amber-400/65 shadow-[inset_0_1px_2px_rgba(220,38,38,0.15)]', 
      bgClass: 'bg-gradient-to-b from-rose-950/25 via-zinc-950/80 to-black/95', 
      textClass: 'text-rose-300', 
      barColor: 'bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600',
      emptyLabel: 'No tasks currently In Progress',
      accentColor: '#dc2626',
      headerBg: 'from-rose-950/50 to-transparent',
      icon: <Crown className="w-3.5 h-3.5 text-amber-400" />
    },
    { 
      id: 'DONE', 
      label: 'Completed', 
      borderClass: 'border-amber-500/25 hover:border-amber-400/50 shadow-[inset_0_1px_2px_rgba(16,185,129,0.15)]', 
      bgClass: 'bg-gradient-to-b from-emerald-950/20 via-zinc-950/80 to-black/95', 
      textClass: 'text-emerald-300', 
      barColor: 'bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600',
      emptyLabel: 'All tasks Completed',
      accentColor: '#10b981',
      headerBg: 'from-emerald-950/50 to-transparent',
      icon: <Gem className="w-3.5 h-3.5 text-amber-400" />
    }
  ];

  const columns = customColumns && customColumns.length > 0
    ? defaultColumns.map(def => {
        const custom = customColumns.find(c => c.id === def.id);
        return custom ? { ...def, label: custom.label } : def;
      })
    : defaultColumns;

  // Drag and Drop implementation with reordering and status synchronization
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggingTaskId(taskId);
    if (isAudible && playOperatorBeep) {
      playOperatorBeep(450, 'sine', 0.03);
    }
  };

  const handleDragOverColumn = (e: React.DragEvent, colId: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    e.preventDefault();
    if (draggedOverCol !== colId) {
      setDraggedOverCol(colId);
    }
  };

  const handleDragLeaveColumn = () => {
    setDraggedOverCol(null);
  };

  const handleDragOverCard = (e: React.DragEvent, targetTaskId: string, colId: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggingTaskId === targetTaskId) return;

    if (draggedOverCol !== colId) {
      setDraggedOverCol(colId);
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const isTopHalf = relativeY < rect.height / 2;
    const position = isTopHalf ? 'before' : 'after';
    
    if (draggedOverTaskId !== targetTaskId || dropPosition !== position) {
      setDraggedOverTaskId(targetTaskId);
      setDropPosition(position);
    }
  };

  const handleDragLeaveCard = () => {
    setDraggedOverTaskId(null);
    setDropPosition(null);
  };

  const handleDropOnColumn = (e: React.DragEvent, targetStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    e.preventDefault();
    setDraggedOverCol(null);
    setDraggingTaskId(null);
    setDraggedOverTaskId(null);
    setDropPosition(null);
    
    try {
      const taskId = e.dataTransfer.getData('text/plain');
      if (!taskId) return;
      
      const dragIndex = tasks.findIndex(t => t.id === taskId);
      if (dragIndex === -1) return;

      const draggedTask = tasks[dragIndex];
      
      if (targetStatus === 'DONE' && isTaskBlocked(draggedTask)) {
        if (isAudible && playOperatorBeep) {
          playOperatorBeep(220, 'sawtooth', 0.15);
        }
        setBlockedWarningTaskId(draggedTask.id);
        setTimeout(() => setBlockedWarningTaskId(null), 1500);
        return;
      }

      let updatedTasks = [...tasks];

      if (draggedTask.status !== targetStatus) {
        updatedTasks.splice(dragIndex, 1);
        const updatedTask = {
          ...draggedTask,
          status: targetStatus,
          completed: targetStatus === 'DONE',
          completedAt: targetStatus === 'DONE' ? Date.now() : undefined
        };
        updatedTasks.push(updatedTask);
        onUpdateProject?.(project.id, { tasks: updatedTasks });
        if (isAudible && playOperatorBeep) {
          playOperatorBeep(650, 'sine', 0.08);
        }
      }
    } catch (err) {
      console.error('Failed to handle task drop on column:', err);
    }
  };

  const handleDropOnCard = (e: React.DragEvent, targetTaskId: string, targetStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    
    setDraggedOverCol(null);
    setDraggingTaskId(null);
    setDraggedOverTaskId(null);
    setDropPosition(null);

    if (!draggedId || draggedId === targetTaskId) return;

    try {
      const dragIndex = tasks.findIndex(t => t.id === draggedId);
      const targetIndex = tasks.findIndex(t => t.id === targetTaskId);
      if (dragIndex === -1 || targetIndex === -1) return;

      const draggedTask = tasks[dragIndex];

      if (targetStatus === 'DONE' && isTaskBlocked(draggedTask)) {
        if (isAudible && playOperatorBeep) {
          playOperatorBeep(220, 'sawtooth', 0.15);
        }
        setBlockedWarningTaskId(draggedTask.id);
        setTimeout(() => setBlockedWarningTaskId(null), 1500);
        return;
      }

      const updatedTask = {
        ...draggedTask,
        status: targetStatus,
        completed: targetStatus === 'DONE',
        completedAt: targetStatus === 'DONE' ? Date.now() : undefined
      };

      let updatedTasks = [...tasks];
      updatedTasks.splice(dragIndex, 1);

      let newTargetIndex = updatedTasks.findIndex(t => t.id === targetTaskId);
      if (dropPosition === 'after') {
        newTargetIndex += 1;
      }

      updatedTasks.splice(newTargetIndex, 0, updatedTask);

      onUpdateProject?.(project.id, { tasks: updatedTasks });
      if (isAudible && playOperatorBeep) {
        playOperatorBeep(650, 'sine', 0.08);
      }
    } catch (err) {
      console.error('Failed to handle task drop on card:', err);
    }
  };

  // Inline Quick Add
  const handleQuickAdd = (columnId: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (!inlineAddText.trim()) return;
    
    const newTask: ProjectTask = {
      id: uuidv4(),
      text: inlineAddText.trim(),
      completed: columnId === 'DONE',
      status: columnId,
      dueDate: '',
      priority: 'MEDIUM',
      createdAt: Date.now()
    };
    
    const updatedTasks = [...(project.tasks || []), newTask];
    onUpdateProject?.(project.id, { tasks: updatedTasks });
    setInlineAddText('');
    setActiveInlineAdd(null);
    if (isAudible && playOperatorBeep) {
      playOperatorBeep(750, 'sine', 0.05);
    }
  };

  // Double Click Edit
  const startEditing = (task: ProjectTask) => {
    setModalMode('edit');
    setModalSelectedTask(task);
    setIsModalOpen(true);
    if (isAudible && playOperatorBeep) {
      playOperatorBeep(520, 'sine', 0.02);
    }
  };

  const saveEditing = (taskId: string) => {
    if (!editingText.trim()) return;
    const updatedTasks = (project.tasks || []).map(t => 
      t.id === taskId ? { 
        ...t, 
        text: editingText.trim(),
        description: editingDesc.trim() || undefined,
        priority: editingPriority,
        dueDate: editingDueDate || undefined,
        tags: editingTags,
        dependencies: editingDependencies
      } : t
    );
    onUpdateProject?.(project.id, { tasks: updatedTasks });
    setEditingTaskId(null);
    setEditingText('');
    setEditingDesc('');
    setEditingPriority('MEDIUM');
    setEditingDueDate('');
    setEditingTags([]);
    setEditingDependencies([]);
    if (isAudible && playOperatorBeep) {
      playOperatorBeep(600, 'sine', 0.05);
    }
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingText('');
    setEditingDesc('');
    setEditingPriority('MEDIUM');
    setEditingDueDate('');
    setEditingTags([]);
    setEditingDependencies([]);
  };

  const handleSaveTaskFromModal = (taskData: {
    text: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dueDate?: string;
    tags?: string[];
    dependencies?: string[];
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    assignee?: string;
  }) => {
    if (modalMode === 'add') {
      const newTask: ProjectTask = {
        id: uuidv4(),
        text: taskData.text,
        description: taskData.description,
        completed: taskData.status === 'DONE',
        completedAt: taskData.status === 'DONE' ? Date.now() : undefined,
        status: taskData.status,
        dueDate: taskData.dueDate || '',
        priority: taskData.priority,
        tags: taskData.tags,
        dependencies: taskData.dependencies,
        assignee: taskData.assignee,
        createdAt: Date.now()
      };
      
      const updatedTasks = [...(project.tasks || []), newTask];
      onUpdateProject?.(project.id, { tasks: updatedTasks });
    } else if (modalMode === 'edit' && modalSelectedTask) {
      const updatedTasks = (project.tasks || []).map(t => 
        t.id === modalSelectedTask.id ? { 
          ...t, 
          text: taskData.text,
          description: taskData.description,
          status: taskData.status,
          completed: taskData.status === 'DONE',
          completedAt: taskData.status === 'DONE' ? (t.completedAt || Date.now()) : undefined,
          priority: taskData.priority,
          dueDate: taskData.dueDate || '',
          tags: taskData.tags,
          dependencies: taskData.dependencies,
          assignee: taskData.assignee
        } : t
      );
      onUpdateProject?.(project.id, { tasks: updatedTasks });
    }
  };

  // Cycle Status
  const cycleTaskStatus = (task: ProjectTask) => {
    const currentStatus = task.status || (task.completed ? 'DONE' : 'TODO');
    const statusOrder: Array<'TODO' | 'IN_PROGRESS' | 'DONE'> = ['TODO', 'IN_PROGRESS', 'DONE'];
    const nextIndex = (statusOrder.indexOf(currentStatus as any) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];
    
    if (nextStatus === 'DONE' && isTaskBlocked(task)) {
      if (isAudible && playOperatorBeep) {
        playOperatorBeep(220, 'sawtooth', 0.15);
      }
      setBlockedWarningTaskId(task.id);
      setTimeout(() => setBlockedWarningTaskId(null), 1500);
      return;
    }
    
    const updatedTasks = (project.tasks || []).map(t => 
      t.id === task.id 
        ? { 
            ...t, 
            status: nextStatus, 
            completed: nextStatus === 'DONE',
            completedAt: nextStatus === 'DONE' ? Date.now() : undefined
          } 
        : t
    );
    
    onUpdateProject?.(project.id, { tasks: updatedTasks });
    if (isAudible && playOperatorBeep) {
      playOperatorBeep(700, 'sine', 0.05);
    }
  };

  return (
    <div className="space-y-4">
      {/* Real-time Task Search Bar */}
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 bg-gradient-to-r from-zinc-950/90 to-black/95 border border-amber-500/20 p-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        {/* Baroque aesthetics corner ornaments */}
        <div className="absolute top-1 left-1 text-amber-500/30 text-[6px] pointer-events-none font-mono">✦</div>
        <div className="absolute top-1 right-1 text-amber-500/30 text-[6px] pointer-events-none font-mono">✦</div>
        <div className="absolute bottom-1 left-1 text-amber-500/30 text-[6px] pointer-events-none font-mono">✦</div>
        <div className="absolute bottom-1 right-1 text-amber-500/30 text-[6px] pointer-events-none font-mono">✦</div>
        <div className="absolute inset-1 border border-amber-500/5 rounded-xl pointer-events-none" />

        <div className="relative flex-1 z-10">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title or description..."
            className="w-full bg-zinc-950 border border-amber-500/15 focus:border-amber-400/50 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/10 font-mono transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                if (isAudible && playOperatorBeep) {
                  playOperatorBeep(420, 'sine', 0.02);
                }
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-400 transition-colors p-1 cursor-pointer"
              title="Clear Search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Matches Indicator */}
        {(searchQuery.trim() || activeTagFilter !== 'ALL') && (
          <div className="text-[9px] font-mono font-bold bg-amber-950/30 text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 shrink-0 z-10 self-end sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>MATCHED: {filteredTasks.length} / {tasks.length}</span>
          </div>
        )}
      </div>

      {/* Dynamic Tag Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gradient-to-r from-zinc-950/90 to-black/95 border border-zinc-900 rounded-xl relative z-10">
        <span className="text-[8px] font-mono font-bold uppercase text-zinc-500 mr-1 flex items-center gap-1 pl-1">
          <Tag className="w-2.5 h-2.5 text-amber-500" /> Filter by Tag:
        </span>
        
        {/* 'ALL' option */}
        <button
          onClick={() => {
            setActiveTagFilter('ALL');
            if (isAudible && playOperatorBeep) {
              playOperatorBeep(450, 'sine', 0.01);
            }
          }}
          className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer ${
            activeTagFilter === 'ALL'
              ? 'bg-amber-500 text-stone-950 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
          }`}
        >
          ALL TASKS
        </button>

        {/* Dynamic / pre-defined tags */}
        {['Urgent', 'Low Priority', 'Research', 'Bug', 'Feature', 'Refactor'].map(tag => {
          const isSelected = activeTagFilter.toLowerCase() === tag.toLowerCase();
          const count = tasks.filter(t => t.tags?.some(tg => tg.toLowerCase().trim() === tag.toLowerCase().trim())).length;
          
          if (count === 0 && !isSelected) return null; // Only show standard tags if they exist on some tasks, or if selected

          const styles = getTagStyles(tag);

          return (
            <button
              key={tag}
              onClick={() => {
                setActiveTagFilter(isSelected ? 'ALL' : tag);
                if (isAudible && playOperatorBeep) {
                  playOperatorBeep(520, 'sine', 0.01);
                }
              }}
              className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                isSelected
                  ? `${styles.bg} ${styles.text} ${styles.border} ring-1 ring-amber-500/30`
                  : 'bg-zinc-950/40 text-zinc-500 border-zinc-900 hover:border-zinc-800 hover:text-zinc-400'
              }`}
            >
              <span>{tag}</span>
              <span className="opacity-50 text-[7px]">({count})</span>
            </button>
          );
        })}

        {/* Extra dynamic tags from tasks */}
        {Array.from(new Set(tasks.flatMap(t => t.tags || [])))
          .filter(tag => !['Urgent', 'Low Priority', 'Research', 'Bug', 'Feature', 'Refactor'].some(pre => pre.toLowerCase() === tag.toLowerCase()))
          .map(tag => {
            const isSelected = activeTagFilter.toLowerCase() === tag.toLowerCase();
            const count = tasks.filter(t => t.tags?.some(tg => tg.toLowerCase().trim() === tag.toLowerCase().trim())).length;
            const styles = getTagStyles(tag);

            return (
              <button
                key={tag}
                onClick={() => {
                  setActiveTagFilter(isSelected ? 'ALL' : tag);
                  if (isAudible && playOperatorBeep) {
                    playOperatorBeep(520, 'sine', 0.01);
                  }
                }}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? `${styles.bg} ${styles.text} ${styles.border} ring-1 ring-amber-500/30`
                    : 'bg-zinc-950/40 text-zinc-500 border-zinc-900 hover:border-zinc-800 hover:text-zinc-400'
                }`}
              >
                <span>{tag}</span>
                <span className="opacity-50 text-[7px]">({count})</span>
              </button>
            );
          })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none pr-1">
        {columns.map(col => {
          // Filter tasks that belong to this column
          const colTasks = filteredTasks.filter(t => {
          const taskStatus = t.status || (t.completed ? 'DONE' : 'TODO');
          return taskStatus === col.id;
        });

        const isHovered = draggedOverCol === col.id;

        return (
          <div 
            key={col.id}
            onDragOver={(e) => handleDragOverColumn(e, col.id)}
            onDragLeave={handleDragLeaveColumn}
            onDrop={(e) => handleDropOnColumn(e, col.id)}
            className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-all duration-300 min-h-[250px] relative overflow-hidden ${
              isHovered 
                ? 'border-amber-400 bg-zinc-900/80 shadow-[0_0_25px_rgba(245,158,11,0.25)] scale-[1.01]' 
                : `${col.borderClass} ${col.bgClass}`
            }`}
          >
            {/* Elegant Baroque Corner Ornaments */}
            <div className="absolute top-1 left-1 text-amber-500/45 text-[7px] pointer-events-none font-mono select-none">✦</div>
            <div className="absolute top-1 right-1 text-amber-500/45 text-[7px] pointer-events-none font-mono select-none">✦</div>
            <div className="absolute bottom-1 left-1 text-amber-500/45 text-[7px] pointer-events-none font-mono select-none">✦</div>
            <div className="absolute bottom-1 right-1 text-amber-500/45 text-[7px] pointer-events-none font-mono select-none">✦</div>

            {/* Subtle inner gold frame thread */}
            <div className="absolute inset-1.5 border border-amber-500/5 rounded-xl pointer-events-none" />

            {/* Column Header */}
            <div className="flex justify-between items-center border-b border-amber-500/10 pb-2.5 flex-shrink-0 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-black/40 rounded-md border border-amber-500/15 flex items-center justify-center">
                  {col.icon}
                </div>
                <span className="text-[11px] font-bold font-serif uppercase tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 bg-clip-text text-transparent">
                  {col.label}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-amber-200 bg-black/60 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                {colTasks.length}
              </span>
            </div>

            {/* Task list container */}
            <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 flex-1 custom-scrollbar relative z-10">
              <AnimatePresence initial={false}>
                {colTasks.length === 0 ? (
                  <div className="text-[9px] text-zinc-500 font-serif italic py-12 text-center border border-dashed border-amber-500/10 rounded-xl bg-black/20">
                    {col.emptyLabel}
                  </div>
                ) : (
                  colTasks.map(task => {
                    const isEditing = editingTaskId === task.id;
                    const estimation = !task.completed && speedStats?.averageSpeedMs
                      ? estimateTaskCompletion(task, speedStats.averageSpeedMs)
                      : null;
                    const isBlocked = !task.completed && isTaskBlocked(task);

                    return (
                      <React.Fragment key={task.id}>
                        {draggedOverTaskId === task.id && dropPosition === 'before' && (
                          <div className="h-1 w-full bg-amber-500/50 rounded-full border border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)] my-1.5" />
                        )}
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          draggable={!isEditing}
                          onDragStartCapture={(e: any) => handleDragStart(e, task.id)}
                          onDragEndCapture={() => {
                            setDraggingTaskId(null);
                            setDraggedOverCol(null);
                            setDraggedOverTaskId(null);
                            setDropPosition(null);
                          }}
                          onDragOver={(e) => handleDragOverCard(e, task.id, col.id)}
                          onDragLeave={handleDragLeaveCard}
                          onDrop={(e) => handleDropOnCard(e, task.id, col.id)}
                          className={`p-3 rounded-xl border cursor-grab active:cursor-grabbing text-left space-y-2.5 transition-all duration-300 group/task relative overflow-hidden ${
                            task.completed 
                              ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-300/90 shadow-[inset_0_1px_3px_rgba(16,185,129,0.05)]' 
                              : 'bg-zinc-900/60 border-amber-500/15 hover:border-amber-400/45 hover:bg-zinc-900/80 border-l-2 border-l-amber-500/50 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                          } ${draggingTaskId === task.id ? 'opacity-30 border-dashed border-zinc-700 scale-95 shadow-inner' : ''}`}
                        >
                          {isEditing ? (
                            <div className="space-y-3 p-1 relative z-10" onClick={(e) => e.stopPropagation()}>
                              {/* Task Title */}
                              <div>
                                <label className="text-[8px] font-mono font-bold uppercase text-amber-500/70 block mb-1">Title</label>
                                <input
                                  autoFocus
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="w-full bg-zinc-950 border border-amber-500/25 rounded px-2 py-1 text-[10px] text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20"
                                  placeholder="Title"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditing(task.id);
                                    if (e.key === 'Escape') cancelEditing();
                                  }}
                                />
                              </div>

                              {/* Task Description */}
                              <div>
                                <label className="text-[8px] font-mono font-bold uppercase text-amber-500/70 block mb-1">Description</label>
                                <textarea
                                  value={editingDesc}
                                  onChange={(e) => setEditingDesc(e.target.value)}
                                  className="w-full bg-zinc-950 border border-amber-500/25 rounded px-2.5 py-1 text-[10px] text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20 min-h-[45px] resize-none"
                                  placeholder="Describe the objective..."
                                />
                              </div>

                              {/* Priority & Due Date Row */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[8px] font-mono font-bold uppercase text-amber-500/70 block mb-1">Priority</label>
                                  <select
                                    value={editingPriority}
                                    onChange={(e) => setEditingPriority(e.target.value as any)}
                                    className="w-full bg-zinc-950 border border-amber-500/25 rounded px-2 py-1 text-[9px] text-zinc-300 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20"
                                  >
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                    <option value="CRITICAL">CRITICAL</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[8px] font-mono font-bold uppercase text-amber-500/70 block mb-1">Due Date</label>
                                  <input
                                    type="date"
                                    value={editingDueDate}
                                    onChange={(e) => setEditingDueDate(e.target.value)}
                                    className="w-full bg-zinc-950 border border-amber-500/25 rounded px-2 py-1 text-[9px] text-zinc-300 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20"
                                  />
                                </div>
                              </div>

                              {/* Tag Manager */}
                              <div>
                                <label className="text-[8px] font-mono font-bold uppercase text-amber-500/70 block mb-1">Tags / Labels</label>
                                
                                {/* Pre-defined quick tags */}
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                  {['Urgent', 'Low Priority', 'Research', 'Bug', 'Feature', 'Refactor'].map(predef => {
                                    const isSelected = editingTags.includes(predef);
                                    const styles = getTagStyles(predef);
                                    return (
                                      <button
                                        type="button"
                                        key={predef}
                                        onClick={() => {
                                          if (isSelected) {
                                            setEditingTags(editingTags.filter(t => t !== predef));
                                          } else {
                                            setEditingTags([...editingTags, predef]);
                                          }
                                          if (isAudible && playOperatorBeep) {
                                            playOperatorBeep(480, 'sine', 0.01);
                                          }
                                        }}
                                        className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border transition-all ${
                                          isSelected 
                                            ? `${styles.bg} ${styles.text} ${styles.border} ring-1 ring-amber-500/30` 
                                            : 'bg-black/40 text-zinc-500 border-zinc-850 hover:border-zinc-700 hover:text-zinc-300'
                                        }`}
                                      >
                                        {predef}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Custom Tag Input */}
                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    id={`custom-tag-${task.id}`}
                                    placeholder="Custom tag + Enter..."
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val && !editingTags.includes(val)) {
                                          setEditingTags([...editingTags, val]);
                                          e.currentTarget.value = '';
                                          if (isAudible && playOperatorBeep) {
                                            playOperatorBeep(550, 'sine', 0.02);
                                          }
                                        }
                                      }
                                    }}
                                    className="flex-1 bg-zinc-950 border border-amber-500/20 rounded px-2 py-0.5 text-[8px] text-white font-mono focus:outline-none focus:border-amber-400 placeholder:text-zinc-650"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const el = document.getElementById(`custom-tag-${task.id}`) as HTMLInputElement;
                                      if (el) {
                                        const val = el.value.trim();
                                        if (val && !editingTags.includes(val)) {
                                          setEditingTags([...editingTags, val]);
                                          el.value = '';
                                          if (isAudible && playOperatorBeep) {
                                            playOperatorBeep(550, 'sine', 0.02);
                                          }
                                        }
                                      }
                                    }}
                                    className="px-2 py-0.5 bg-amber-950/40 hover:bg-amber-950 border border-amber-800 text-amber-300 text-[8px] font-mono font-bold rounded"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>

                              {/* Prerequisites / Dependencies Editor */}
                              <div className="border-t border-amber-500/5 pt-2">
                                <label className="text-[8px] font-mono font-bold uppercase text-amber-500/70 block mb-1">Prerequisites / Dependencies</label>
                                <div className="max-h-[85px] overflow-y-auto bg-zinc-950/80 border border-amber-500/15 rounded p-1.5 space-y-1 scrollbar-thin scrollbar-thumb-zinc-850">
                                  {tasks.filter(t => t.id !== task.id).length === 0 ? (
                                    <div className="text-[7.5px] font-mono text-zinc-650 italic py-1 text-center">No other tasks available</div>
                                  ) : (
                                    tasks.filter(t => t.id !== task.id).map(otherTask => {
                                      const isDepSelected = editingDependencies.includes(otherTask.id);
                                      return (
                                        <button
                                          type="button"
                                          key={otherTask.id}
                                          onClick={() => {
                                            if (isDepSelected) {
                                              setEditingDependencies(editingDependencies.filter(id => id !== otherTask.id));
                                            } else {
                                              setEditingDependencies([...editingDependencies, otherTask.id]);
                                            }
                                            if (isAudible && playOperatorBeep) {
                                              playOperatorBeep(450, 'sine', 0.01);
                                            }
                                          }}
                                          className={`w-full text-left flex items-center gap-1.5 px-1.5 py-1 rounded text-[8px] font-mono transition-all ${
                                            isDepSelected 
                                              ? 'bg-amber-950/20 text-amber-300 border border-amber-500/20' 
                                              : 'text-zinc-500 hover:text-zinc-350 bg-transparent border border-transparent hover:bg-zinc-900/30'
                                          }`}
                                        >
                                          <div className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center ${isDepSelected ? 'border-amber-400 bg-amber-950/40 text-amber-400' : 'border-zinc-800'}`}>
                                            {isDepSelected && <Check className="w-2 h-2" />}
                                          </div>
                                          <span className={`truncate ${otherTask.completed ? 'line-through opacity-50' : ''}`}>
                                            [{otherTask.priority || 'MEDIUM'}] {otherTask.text}
                                          </span>
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </div>

                              {/* Save / Cancel Controls */}
                              <div className="flex justify-end gap-1.5 border-t border-amber-500/5 pt-2">
                                <button 
                                  onClick={cancelEditing}
                                  className="px-2 py-0.5 bg-zinc-950 border border-zinc-850 text-zinc-400 rounded text-[8px] font-mono uppercase hover:bg-zinc-900"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => saveEditing(task.id)}
                                  className="px-2 py-0.5 bg-amber-600/20 border border-amber-500/35 text-amber-400 rounded text-[8px] font-bold font-mono uppercase hover:bg-amber-600/30"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Task Hover Gold Ribbon Glow */}
                              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-400/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover/task:opacity-100 transition-opacity duration-300" />

                              {/* Task main info */}
                              <div className="flex items-start gap-2.5 relative z-10">
                                {/* Checkbox */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!task.completed && isBlocked) {
                                      if (isAudible && playOperatorBeep) {
                                        playOperatorBeep(220, 'sawtooth', 0.15);
                                      }
                                      setBlockedWarningTaskId(task.id);
                                      setTimeout(() => setBlockedWarningTaskId(null), 1500);
                                      return;
                                    }
                                    onToggleTask(project.id, task.id);
                                  }}
                                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${
                                    task.completed 
                                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                                      : isBlocked
                                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-500 cursor-not-allowed hover:bg-rose-950/40 shadow-[0_0_4px_rgba(244,63,94,0.15)]'
                                        : 'bg-black/60 border-amber-500/30 hover:border-amber-400'
                                  }`}
                                  title={task.completed ? 'Mark Active' : isBlocked ? 'Prerequisites pending' : 'Mark Completed'}
                                >
                                  {task.completed ? (
                                    <Check className="w-3 h-3 text-black stroke-[3]" />
                                  ) : isBlocked ? (
                                    <Lock className="w-2.5 h-2.5 text-rose-400" />
                                  ) : null}
                                </button>

                                {/* Task text/title, description & tags */}
                                <div className="flex-1 min-w-0">
                                  <span 
                                    onDoubleClick={() => startEditing(task)}
                                    className={`text-[10px] font-bold uppercase tracking-tight transition-all duration-200 block break-words cursor-pointer leading-snug ${
                                      task.completed 
                                        ? 'line-through text-emerald-500/35 italic opacity-60' 
                                        : 'text-zinc-100 hover:text-amber-400'
                                    }`}
                                    title="Double-click to edit objective"
                                  >
                                    {task.text}
                                  </span>

                                  {/* Blocked warning banner */}
                                  {blockedWarningTaskId === task.id && (
                                    <motion.p 
                                      initial={{ opacity: 0, y: -2 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="text-[8px] font-mono text-rose-400 mt-1 font-bold animate-pulse flex items-center gap-1"
                                    >
                                      ⚠ CRITICAL: COMPLETE PREREQUISITES FIRST!
                                    </motion.p>
                                  )}

                                  {/* Description display */}
                                  {task.description && (
                                    <p className="text-[9px] text-zinc-400 mt-1 leading-normal font-sans break-words">
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Prerequisites list display */}
                                  {task.dependencies && task.dependencies.length > 0 && (
                                    <div className="flex flex-col gap-1 mt-2 border-t border-zinc-800/20 pt-1.5">
                                      <span className="text-[7px] font-mono text-zinc-500 flex items-center gap-1">
                                        <Link className="w-2 h-2 text-amber-500/60" />
                                        PREREQUISITES:
                                      </span>
                                      <div className="flex flex-wrap gap-1">
                                        {task.dependencies.map(depId => {
                                          const depTask = tasks.find(t => t.id === depId);
                                          if (!depTask) return null;
                                          return (
                                            <span 
                                              key={depId}
                                              className={`text-[6.5px] font-mono px-1 py-0.2 rounded border flex items-center gap-1 ${
                                                depTask.completed 
                                                  ? 'bg-zinc-950/50 text-zinc-650 border-zinc-900/30 line-through' 
                                                  : 'bg-amber-950/15 text-amber-400/80 border-amber-500/15'
                                              }`}
                                              title={depTask.completed ? 'Prerequisite Fulfilled' : 'Prerequisite Pending'}
                                            >
                                              {depTask.completed ? (
                                                <Check className="w-1.5 h-1.5 text-emerald-400" />
                                              ) : (
                                                <Lock className="w-1.5 h-1.5 text-amber-500/60" />
                                              )}
                                              {depTask.text}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Tags display */}
                                  {task.tags && task.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {task.tags.map(tag => {
                                        const styles = getTagStyles(tag);
                                        return (
                                          <span 
                                            key={tag}
                                            className={`text-[7.5px] font-mono font-bold px-1.5 py-0.2 rounded-md border ${styles.bg} ${styles.text} ${styles.border}`}
                                          >
                                            {tag}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Controls (edit / purge) */}
                                <div className="opacity-0 group-hover/task:opacity-100 flex items-center gap-1.5 ml-1 flex-shrink-0 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); startEditing(task); }}
                                    className="text-zinc-500 hover:text-amber-400 p-0.5 rounded transition-colors"
                                    title="Edit Details"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteTask(project.id, task.id); }}
                                    className="text-zinc-500 hover:text-rose-400 font-mono text-[9px] px-1 transition-colors"
                                    title="Purge Task"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>

                              {/* Task footer / metadata */}
                              <div className="flex flex-wrap gap-1.5 items-center justify-between pt-1.5 border-t border-amber-500/5 relative z-10">
                                {/* Left badges: priority and due date */}
                                <div className="flex flex-wrap gap-1 items-center">
                                  {isBlocked && (
                                    <span className="text-[6.5px] font-black px-1.5 py-0.2 rounded-sm border font-serif tracking-wider bg-rose-950 text-rose-400 border-rose-500/30 shadow-[0_0_6px_rgba(244,63,94,0.1)] animate-pulse flex items-center gap-0.5" title="Requires unresolved prerequisites to be completed first">
                                      <Lock className="w-1.5 h-1.5" />
                                      BLOCKED
                                    </span>
                                  )}
                                  {task.priority && (
                                    <span className={`text-[6.5px] font-black px-1.5 py-0.2 rounded-sm border font-serif tracking-wider ${
                                      task.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-200 border-amber-500/30 shadow-[0_0_6px_rgba(244,63,94,0.1)]' :
                                      task.priority === 'HIGH' ? 'bg-amber-950 text-amber-100 border-amber-500/30' :
                                      task.priority === 'MEDIUM' ? 'bg-blue-950 text-blue-200 border-amber-500/30' :
                                      'bg-zinc-900 text-zinc-500 border-zinc-850'
                                    }`}>
                                      {task.priority}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="text-[6.5px] font-mono px-1 py-0.2 rounded bg-black/40 border border-amber-500/10 text-zinc-400 flex items-center gap-0.5">
                                      <Calendar className="w-2 h-2 text-amber-500/70" />
                                      {task.dueDate}
                                    </span>
                                  )}
                                  {task.assignee && (
                                    <span className="text-[6.5px] font-mono px-1 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-0.5" title={`Assigned to ${task.assignee}`}>
                                      👤 {task.assignee}
                                    </span>
                                  )}
                                </div>

                                {/* Right badges: estimation & status cycler */}
                                <div className="flex items-center gap-1.5">
                                  {estimation?.isBehindSchedule && (
                                    <span className="text-[6.5px] text-amber-500 flex items-center gap-0.5" title={estimation.statusLabel}>
                                      <AlertTriangle className="w-2.5 h-2.5 animate-pulse" />
                                    </span>
                                  )}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); cycleTaskStatus(task); }}
                                    className="text-[6.5px] bg-black/60 hover:bg-zinc-900 border border-amber-500/20 hover:border-amber-400/50 px-1.5 py-0.5 rounded text-amber-200 hover:text-amber-100 flex items-center transition-all gap-1 font-mono uppercase"
                                    title="Move status forward"
                                  >
                                    <ArrowRight className="w-1.5 h-1.5" /> Status
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                        {draggedOverTaskId === task.id && dropPosition === 'after' && (
                          <div className="h-1 w-full bg-amber-500/50 rounded-full border border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)] my-1.5" />
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Column Quick Add */}
            <div className="mt-auto flex-shrink-0 pt-1.5 border-t border-amber-500/10 relative z-10">
              <button
                onClick={() => {
                  setModalMode('add');
                  setModalSelectedTask(null);
                  setModalInitialStatus(col.id);
                  setIsModalOpen(true);
                  if (isAudible && playOperatorBeep) {
                    playOperatorBeep(500, 'sine', 0.05);
                  }
                }}
                className="w-full py-1.5 text-center border border-dashed border-amber-500/15 hover:border-amber-400/40 bg-black/20 hover:bg-black/40 text-[8.5px] font-bold uppercase tracking-widest text-amber-200/60 hover:text-amber-200 rounded-lg transition-all flex items-center justify-center gap-1.5"
                id={`add-task-btn-${col.id}`}
              >
                <Plus className="w-2.5 h-2.5 text-amber-400" /> Add Task
              </button>
            </div>
          </div>
        );
      })}
    </div>
    
    <TaskModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSave={handleSaveTaskFromModal}
      task={modalSelectedTask || undefined}
      initialStatus={modalInitialStatus}
      allTasks={tasks}
      isAudible={isAudible}
      playOperatorBeep={playOperatorBeep}
      projectCollaborators={project.collaborators || []}
    />
    </div>
  );
};
