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
  Shield
} from 'lucide-react';
import { estimateTaskCompletion } from '../utils';
import type { NetworkProject, ProjectTask } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface KanbanBoardProps {
  project: NetworkProject;
  tasks: ProjectTask[];
  onToggleTask: (projectId: string, taskId: string) => void;
  onDeleteTask: (projectId: string, taskId: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<NetworkProject>) => void;
  playOperatorBeep?: (freq?: number, type?: OscillatorType, duration?: number) => void;
  isAudible?: boolean;
  speedStats?: { averageSpeedMs: number };
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
  speedStats
}) => {
  const [draggedOverCol, setDraggedOverCol] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  
  // Inline Task Adding
  const [activeInlineAdd, setActiveInlineAdd] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | null>(null);
  const [inlineAddText, setInlineAddText] = useState('');
  
  // Inline Task Editing
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const columns: ColumnConfig[] = [
    { 
      id: 'TODO', 
      label: 'Royal Blue To Do', 
      borderClass: 'border-amber-500/25 hover:border-amber-400/50 shadow-[inset_0_1px_2px_rgba(59,130,246,0.15)]', 
      bgClass: 'bg-gradient-to-b from-blue-950/20 via-zinc-950/80 to-black/95', 
      textClass: 'text-blue-300', 
      barColor: 'bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600',
      emptyLabel: 'No Court Objectives Formulated',
      accentColor: '#3b82f6',
      headerBg: 'from-blue-950/50 to-transparent',
      icon: <Shield className="w-3.5 h-3.5 text-amber-400" />
    },
    { 
      id: 'IN_PROGRESS', 
      label: 'Imperial Burgundy In Progress', 
      borderClass: 'border-amber-500/35 hover:border-amber-400/65 shadow-[inset_0_1px_2px_rgba(220,38,38,0.15)]', 
      bgClass: 'bg-gradient-to-b from-rose-950/25 via-zinc-950/80 to-black/95', 
      textClass: 'text-rose-300', 
      barColor: 'bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600',
      emptyLabel: 'No Active Imperial Attunements',
      accentColor: '#dc2626',
      headerBg: 'from-rose-950/50 to-transparent',
      icon: <Crown className="w-3.5 h-3.5 text-amber-400" />
    },
    { 
      id: 'DONE', 
      label: 'Sovereign Emerald Completed', 
      borderClass: 'border-amber-500/25 hover:border-amber-400/50 shadow-[inset_0_1px_2px_rgba(16,185,129,0.15)]', 
      bgClass: 'bg-gradient-to-b from-emerald-950/20 via-zinc-950/80 to-black/95', 
      textClass: 'text-emerald-300', 
      barColor: 'bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600',
      emptyLabel: 'All Masterful Work Calibrated',
      accentColor: '#10b981',
      headerBg: 'from-emerald-950/50 to-transparent',
      icon: <Gem className="w-3.5 h-3.5 text-amber-400" />
    }
  ];

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ projectId: project.id, taskId }));
    setDraggingTaskId(taskId);
    if (isAudible && playOperatorBeep) {
      playOperatorBeep(450, 'sine', 0.03);
    }
  };

  const handleDragOver = (e: React.DragEvent, colId: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    e.preventDefault();
    if (draggedOverCol !== colId) {
      setDraggedOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    e.preventDefault();
    setDraggedOverCol(null);
    setDraggingTaskId(null);
    
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.projectId !== project.id) return;
      
      const updatedTasks = (project.tasks || []).map(t => 
        t.id === data.taskId 
          ? { 
              ...t, 
              status: targetStatus, 
              completed: targetStatus === 'DONE',
              completedAt: targetStatus === 'DONE' ? Date.now() : undefined
            } 
          : t
      );
      
      onUpdateProject?.(project.id, { tasks: updatedTasks });
      if (isAudible && playOperatorBeep) {
        playOperatorBeep(650, 'sine', 0.08);
      }
    } catch (err) {
      console.error('Failed to handle task drop:', err);
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
    setEditingTaskId(task.id);
    setEditingText(task.text);
    if (isAudible && playOperatorBeep) {
      playOperatorBeep(520, 'sine', 0.02);
    }
  };

  const saveEditing = (taskId: string) => {
    if (!editingText.trim()) return;
    const updatedTasks = (project.tasks || []).map(t => 
      t.id === taskId ? { ...t, text: editingText.trim() } : t
    );
    onUpdateProject?.(project.id, { tasks: updatedTasks });
    setEditingTaskId(null);
    setEditingText('');
    if (isAudible && playOperatorBeep) {
      playOperatorBeep(600, 'sine', 0.05);
    }
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  // Cycle Status
  const cycleTaskStatus = (task: ProjectTask) => {
    const currentStatus = task.status || (task.completed ? 'DONE' : 'TODO');
    const statusOrder: Array<'TODO' | 'IN_PROGRESS' | 'DONE'> = ['TODO', 'IN_PROGRESS', 'DONE'];
    const nextIndex = (statusOrder.indexOf(currentStatus as any) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];
    
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none pr-1">
      {columns.map(col => {
        // Filter tasks that belong to this column
        const colTasks = tasks.filter(t => {
          const taskStatus = t.status || (t.completed ? 'DONE' : 'TODO');
          return taskStatus === col.id;
        });

        const isHovered = draggedOverCol === col.id;

        return (
          <div 
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
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

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable={!isEditing}
                        onDragStartCapture={(e: any) => handleDragStart(e, task.id)}
                        onDragEndCapture={() => {
                          setDraggingTaskId(null);
                          setDraggedOverCol(null);
                        }}
                        className={`p-3 rounded-xl border cursor-grab active:cursor-grabbing text-left space-y-2.5 transition-all duration-300 group/task relative overflow-hidden ${
                          task.completed 
                            ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-300/90 shadow-[inset_0_1px_3px_rgba(16,185,129,0.05)]' 
                            : 'bg-zinc-900/60 border-amber-500/15 hover:border-amber-400/45 hover:bg-zinc-900/80 border-l-2 border-l-amber-500/50 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                        } ${draggingTaskId === task.id ? 'opacity-30 border-dashed border-zinc-700 scale-95 shadow-inner' : ''}`}
                      >
                        {/* Task Hover Gold Ribbon Glow */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-400/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover/task:opacity-100 transition-opacity duration-300" />

                        {/* Task main info */}
                        <div className="flex items-start gap-2.5 relative z-10">
                          {/* Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(project.id, task.id);
                            }}
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${
                              task.completed 
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                                : 'bg-black/60 border-amber-500/30 hover:border-amber-400'
                            }`}
                            title={task.completed ? 'Mark Active' : 'Mark Completed'}
                          >
                            {task.completed && <Check className="w-3 h-3 text-black stroke-[3]" />}
                          </button>

                          {/* Editable task title */}
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <input
                                  autoFocus
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditing(task.id);
                                    if (e.key === 'Escape') cancelEditing();
                                  }}
                                  className="w-full bg-zinc-950 border border-amber-500/30 rounded px-2 py-0.5 text-[10px] text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20"
                                />
                                <button 
                                  onClick={() => saveEditing(task.id)}
                                  className="p-0.5 bg-amber-950 border border-amber-800 text-amber-400 rounded hover:bg-amber-900"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={cancelEditing}
                                  className="p-0.5 bg-zinc-950 border border-zinc-850 text-zinc-400 rounded hover:bg-zinc-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
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
                            )}
                          </div>

                          {/* Controls (edit / purge) */}
                          <div className="opacity-0 group-hover/task:opacity-100 flex items-center gap-1.5 ml-1 flex-shrink-0 transition-opacity">
                            {!isEditing && (
                              <button
                                onClick={(e) => { e.stopPropagation(); startEditing(task); }}
                                className="text-zinc-500 hover:text-amber-400 p-0.5 rounded transition-colors"
                                title="Edit Title"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>
                            )}
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
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Column Quick Add */}
            <div className="mt-auto flex-shrink-0 pt-1.5 border-t border-amber-500/10 relative z-10">
              {activeInlineAdd === col.id ? (
                <div className="p-2 bg-black/50 border border-amber-500/20 rounded-xl flex flex-col gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  <input
                    autoFocus
                    value={inlineAddText}
                    onChange={(e) => setInlineAddText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickAdd(col.id);
                      if (e.key === 'Escape') {
                        setActiveInlineAdd(null);
                        setInlineAddText('');
                      }
                    }}
                    placeholder="Grand objective name..."
                    className="w-full bg-zinc-950 border border-amber-500/25 rounded px-2.5 py-1 text-[9px] text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20 placeholder:text-zinc-600"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setActiveInlineAdd(null);
                        setInlineAddText('');
                      }}
                      className="px-2 py-0.5 text-[8px] text-zinc-500 hover:text-zinc-300 font-mono"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => handleQuickAdd(col.id)}
                      className="px-2.5 py-0.5 bg-amber-600/20 hover:bg-amber-500/35 text-amber-400 border border-amber-500/30 hover:border-amber-500/60 rounded text-[8px] font-bold font-mono transition-all"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveInlineAdd(col.id);
                    setInlineAddText('');
                    if (isAudible && playOperatorBeep) {
                      playOperatorBeep(500, 'sine', 0.05);
                    }
                  }}
                  className="w-full py-1.5 text-center border border-dashed border-amber-500/15 hover:border-amber-400/40 bg-black/20 hover:bg-black/40 text-[8.5px] font-bold uppercase tracking-widest text-amber-200/60 hover:text-amber-200 rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-2.5 h-2.5 text-amber-400" /> Quick Add
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
