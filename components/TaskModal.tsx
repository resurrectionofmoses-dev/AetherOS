import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Tag, 
  Calendar, 
  AlertTriangle, 
  Check, 
  Plus, 
  Link as LinkIcon, 
  Lock, 
  Clock, 
  Shield, 
  Crown, 
  Gem, 
  Sparkles 
} from 'lucide-react';
import type { ProjectTask } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    text: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dueDate?: string;
    tags?: string[];
    dependencies?: string[];
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    assignee?: string;
  }) => void;
  task?: ProjectTask | null; // If provided, we are in EDIT mode
  allTasks: ProjectTask[];   // To select dependencies
  initialStatus?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'; // For ADD mode, which column was clicked
  isAudible?: boolean;
  playOperatorBeep?: (freq?: number, type?: OscillatorType, duration?: number) => void;
  projectCollaborators?: string[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  allTasks,
  initialStatus = 'TODO',
  isAudible = false,
  playOperatorBeep,
  projectCollaborators = []
}) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'>('TODO');
  const [tags, setTags] = useState<string[]>([]);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [assignee, setAssignee] = useState('');

  // Pre-defined quick tags
  const predefinedTags = ['Urgent', 'Low Priority', 'Research', 'Bug', 'Feature', 'Refactor'];

  // Sync state when modal opens or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setText(task.text || '');
        setDescription(task.description || '');
        setPriority(task.priority || 'MEDIUM');
        setDueDate(task.dueDate || '');
        setStatus(task.status || (task.completed ? 'DONE' : 'TODO'));
        setTags(task.tags || []);
        setDependencies(task.dependencies || []);
        setAssignee(task.assignee || '');
      } else {
        setText('');
        setDescription('');
        setPriority('MEDIUM');
        setDueDate('');
        setStatus(initialStatus);
        setTags([]);
        setDependencies([]);
        setAssignee('');
      }
    }
  }, [isOpen, task, initialStatus]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (isAudible && playOperatorBeep) {
      playOperatorBeep(600, 'sine', 0.08);
    }

    onSave({
      text: text.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      tags: tags.length > 0 ? tags : undefined,
      dependencies: dependencies.length > 0 ? dependencies : undefined,
      status,
      assignee: assignee || undefined
    });
    onClose();
  };

  const toggleTag = (tag: string) => {
    if (isAudible && playOperatorBeep) {
      playOperatorBeep(480, 'sine', 0.01);
    }
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const val = customTag.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setCustomTag('');
      if (isAudible && playOperatorBeep) {
        playOperatorBeep(550, 'sine', 0.02);
      }
    }
  };

  const toggleDependency = (depId: string) => {
    if (isAudible && playOperatorBeep) {
      playOperatorBeep(450, 'sine', 0.01);
    }
    if (dependencies.includes(depId)) {
      setDependencies(dependencies.filter(id => id !== depId));
    } else {
      setDependencies([...dependencies, depId]);
    }
  };

  const getTagStyles = (tag: string) => {
    const t = tag.toLowerCase().trim();
    if (t === 'urgent' || t === 'high priority') {
      return 'bg-rose-950/40 text-rose-400 border-rose-500/30';
    }
    if (t === 'low priority' || t === 'low') {
      return 'bg-zinc-900/50 text-zinc-400 border-zinc-800';
    }
    if (t === 'research') {
      return 'bg-purple-950/40 text-purple-300 border-purple-500/20';
    }
    if (t === 'bug') {
      return 'bg-red-950/40 text-red-400 border-red-500/20';
    }
    if (t === 'feature' || t === 'idea') {
      return 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20';
    }
    if (t === 'refactor' || t === 'core' || t === 'logic') {
      return 'bg-amber-950/40 text-amber-400 border-amber-500/20';
    }
    return 'bg-blue-950/40 text-blue-300 border-blue-500/20';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (isAudible && playOperatorBeep) playOperatorBeep(350, 'sine', 0.05);
              onClose();
            }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            id="modal-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden max-h-[90vh] flex flex-col z-10"
            id="task-modal-container"
          >
            {/* Baroque Corner Ornaments */}
            <div className="absolute top-1.5 left-1.5 text-amber-500/40 text-[8px] pointer-events-none font-mono">✦</div>
            <div className="absolute top-1.5 right-1.5 text-amber-500/40 text-[8px] pointer-events-none font-mono">✦</div>
            <div className="absolute bottom-1.5 left-1.5 text-amber-500/40 text-[8px] pointer-events-none font-mono">✦</div>
            <div className="absolute bottom-1.5 right-1.5 text-amber-500/40 text-[8px] pointer-events-none font-mono">✦</div>
            <div className="absolute inset-1 border border-amber-500/5 rounded-xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/15 p-4 relative z-10 bg-gradient-to-r from-zinc-950 to-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-serif uppercase tracking-widest text-amber-300">
                    {task ? 'Edit Grand Objective' : 'Formulate Objective'}
                  </h3>
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                    {task ? `ID: ${task.id.substring(0, 8)}` : 'Initiate new process thread'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isAudible && playOperatorBeep) playOperatorBeep(350, 'sine', 0.05);
                  onClose();
                }}
                className="text-zinc-500 hover:text-amber-400 p-1.5 hover:bg-zinc-900/50 rounded-lg border border-transparent hover:border-zinc-800 transition-all"
                id="close-modal-btn"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar relative z-10">
              
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold uppercase text-amber-500/70 tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400/80" />
                  Objective Title / Core Directive
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="E.g., Synchronize Quantum Chronology"
                  className="w-full bg-zinc-950/80 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20 placeholder:text-zinc-650 transition-all"
                  id="task-title-input"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold uppercase text-amber-500/70 tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400/80" />
                  Description / Method Protocol
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the procedural steps, telemetry outputs, and expected alignment matrices..."
                  className="w-full bg-zinc-950/80 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20 placeholder:text-zinc-650 min-h-[80px] resize-none transition-all"
                  id="task-desc-input"
                />
              </div>

              {/* Priority, Due Date, Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Priority Selection */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold uppercase text-amber-500/70 tracking-wider block">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => {
                      setPriority(e.target.value as any);
                      if (isAudible && playOperatorBeep) playOperatorBeep(450, 'sine', 0.02);
                    }}
                    className="w-full bg-zinc-950 border border-amber-500/20 rounded-xl px-3 py-2 text-[10px] text-zinc-300 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20"
                    id="task-priority-select"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                {/* Due Date Picker */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold uppercase text-amber-500/70 tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-500/60" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-amber-500/20 rounded-xl px-3 py-2 text-[10px] text-zinc-300 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20"
                    id="task-date-input"
                  />
                </div>

                {/* Column/Status Selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold uppercase text-amber-500/70 tracking-wider block">
                    Current Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as any);
                      if (isAudible && playOperatorBeep) playOperatorBeep(450, 'sine', 0.02);
                    }}
                    className="w-full bg-zinc-950 border border-amber-500/20 rounded-xl px-3 py-2 text-[10px] text-zinc-300 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20"
                    id="task-status-select"
                  >
                    <option value="TODO">TO DO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">COMPLETED</option>
                  </select>
                </div>
              </div>

              {/* Assignee Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold uppercase text-amber-500/70 tracking-wider block">
                  Assigned Team Member
                </label>
                <select
                  value={assignee}
                  onChange={(e) => {
                    setAssignee(e.target.value);
                    if (isAudible && playOperatorBeep) playOperatorBeep(450, 'sine', 0.02);
                  }}
                  className="w-full bg-zinc-950 border border-amber-500/20 rounded-xl px-3 py-2 text-[10px] text-zinc-300 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20"
                  id="task-assignee-select"
                >
                  <option value="">Unassigned</option>
                  {(projectCollaborators || []).map(member => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Multi-Select Section */}
              <div className="space-y-2 border-t border-amber-500/10 pt-3">
                <label className="text-[9px] font-mono font-bold uppercase text-amber-500/70 tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-400/80" />
                  Tags & Classifications
                </label>
                
                {/* Pre-defined labels to toggle */}
                <div className="flex flex-wrap gap-1.5">
                  {predefinedTags.map(pTag => {
                    const isSelected = tags.includes(pTag);
                    const tagStyle = getTagStyles(pTag);
                    return (
                      <button
                        type="button"
                        key={pTag}
                        onClick={() => toggleTag(pTag)}
                        className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all ${
                          isSelected 
                            ? `${tagStyle} ring-1 ring-amber-500/30 font-extrabold scale-102` 
                            : 'bg-black/40 text-zinc-500 border-zinc-900 hover:border-zinc-800 hover:text-zinc-350'
                        }`}
                      >
                        {pTag}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tag Input */}
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Add custom tag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    className="flex-1 bg-zinc-950 border border-amber-500/15 focus:border-amber-400/40 rounded-lg px-2.5 py-1 text-[9px] text-white font-mono focus:outline-none"
                    id="custom-tag-modal-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-2.5 py-1 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/30 text-amber-400 text-[9px] font-mono font-bold rounded-lg transition-all flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add
                  </button>
                </div>

                {/* Selected Custom Tags (if not predefined) */}
                {tags.filter(t => !predefinedTags.includes(t)).length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[7.5px] font-mono text-zinc-500 self-center mr-1">CUSTOM:</span>
                    {tags.filter(t => !predefinedTags.includes(t)).map(cTag => (
                      <span 
                        key={cTag}
                        className="text-[8px] font-mono bg-zinc-900 text-amber-300/80 border border-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1"
                      >
                        {cTag}
                        <button 
                          type="button" 
                          onClick={() => toggleTag(cTag)}
                          className="hover:text-red-400 text-zinc-500 transition-colors"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dependencies Selection (if other tasks exist) */}
              <div className="space-y-2 border-t border-amber-500/10 pt-3">
                <label className="text-[9px] font-mono font-bold uppercase text-amber-500/70 tracking-wider flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-amber-400/80" />
                  Prerequisites / Dependency Map
                </label>
                
                <div className="max-h-[100px] overflow-y-auto bg-zinc-950/80 border border-amber-500/15 rounded-xl p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
                  {allTasks.filter(t => t.id !== task?.id).length === 0 ? (
                    <div className="text-[8px] font-mono text-zinc-650 italic py-2 text-center">No other tasks available to establish links</div>
                  ) : (
                    allTasks.filter(t => t.id !== task?.id).map(otherTask => {
                      const isDepSelected = dependencies.includes(otherTask.id);
                      return (
                        <button
                          type="button"
                          key={otherTask.id}
                          onClick={() => toggleDependency(otherTask.id)}
                          className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] font-mono transition-all ${
                            isDepSelected 
                              ? 'bg-amber-950/20 text-amber-300 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]' 
                              : 'text-zinc-500 hover:text-zinc-350 bg-transparent border border-transparent hover:bg-zinc-900/30'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${isDepSelected ? 'border-amber-400 bg-amber-950/40 text-amber-400' : 'border-zinc-800'}`}>
                            {isDepSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <span className={`truncate flex-1 ${otherTask.completed ? 'line-through opacity-50 text-zinc-600' : ''}`}>
                            [{otherTask.priority || 'MEDIUM'}] {otherTask.text}
                          </span>
                          {otherTask.completed ? (
                            <span className="text-[7px] text-emerald-500 bg-emerald-950/25 border border-emerald-500/10 px-1 py-0.2 rounded font-sans uppercase">FULFILLED</span>
                          ) : (
                            <span className="text-[7px] text-amber-500/60 flex items-center gap-0.5">
                              <Lock className="w-2 h-2" /> PENDING
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

            </form>

            {/* Footer Actions */}
            <div className="border-t border-amber-500/15 p-4 bg-zinc-950 flex justify-end gap-2.5 relative z-10">
              <button
                type="button"
                onClick={() => {
                  if (isAudible && playOperatorBeep) playOperatorBeep(350, 'sine', 0.05);
                  onClose();
                }}
                className="px-4 py-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all"
                id="modal-cancel-btn"
              >
                Abrogate / Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!text.trim()}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold font-mono uppercase tracking-widest transition-all border ${
                  text.trim()
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-zinc-900 border-zinc-850 text-zinc-600 cursor-not-allowed'
                }`}
                id="modal-submit-btn"
              >
                {task ? 'Commit Changes' : 'Execute Directive'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
