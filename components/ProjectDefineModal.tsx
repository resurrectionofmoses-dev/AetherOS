import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FolderPlus, 
  Calendar, 
  Flag, 
  Tag as TagIcon, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { NetworkProject, ProjectTask, BlueprintPriority } from '../types';
import { getPresetDate } from '../services/projectManagerUtils';

interface ProjectDefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<NetworkProject> & { initialTasks?: Partial<ProjectTask>[] }) => void;
  projectToEdit?: NetworkProject | null;
}

export const ProjectDefineModal: React.FC<ProjectDefineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<NetworkProject['status']>('BUILDING');
  const [priority, setPriority] = useState<BlueprintPriority>('Medium');
  const [deadline, setDeadline] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Initial tasks created with the project
  const [initialTasks, setInitialTasks] = useState<{ id: string; text: string; dueDate: string }[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const suggestedTags = ['Engineering', 'Design', 'Security', 'Operations', 'Research', 'Infrastructure'];

  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setTitle(projectToEdit.title || '');
        setDescription(projectToEdit.description || '');
        setStatus(projectToEdit.status || 'BUILDING');
        setPriority(projectToEdit.priority || 'Medium');
        setDeadline(projectToEdit.deadline || '');
        setTags(projectToEdit.tags || []);
        setInitialTasks([]);
      } else {
        setTitle('');
        setDescription('');
        setStatus('BUILDING');
        setPriority('Medium');
        setDeadline(getPresetDate('nextweek'));
        setTags(['Engineering']);
        setInitialTasks([
          { id: uuidv4(), text: 'Define project scope and architectural milestones', dueDate: getPresetDate('in3days') },
          { id: uuidv4(), text: 'Build core implementation deliverable', dueDate: getPresetDate('nextweek') }
        ]);
      }
      setNewTagInput('');
      setNewTaskText('');
      setNewTaskDueDate('');
    }
  }, [isOpen, projectToEdit]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddInitialTask = () => {
    if (!newTaskText.trim()) return;
    setInitialTasks(prev => [
      ...prev,
      {
        id: uuidv4(),
        text: newTaskText.trim(),
        dueDate: newTaskDueDate || getPresetDate('nextweek')
      }
    ]);
    setNewTaskText('');
    setNewTaskDueDate('');
  };

  const handleRemoveInitialTask = (id: string) => {
    setInitialTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || 'No description provided.',
      status,
      priority,
      deadline: deadline || undefined,
      tags,
      initialTasks: !projectToEdit ? initialTasks.map(t => ({
        text: t.text,
        dueDate: t.dueDate,
        completed: false,
        status: 'TODO',
        priority: 'MEDIUM',
        createdAt: Date.now()
      })) : undefined
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-zinc-950 border border-amber-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-zinc-900 to-black">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-serif font-bold uppercase tracking-widest text-amber-300">
                  {projectToEdit ? 'Edit Project Definition' : 'Define New Project'}
                </h2>
                <p className="text-[10px] font-mono text-zinc-400">
                  Configure objectives, target due date, priority, and initial work items
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Project Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center justify-between">
                <span>Project Title <span className="text-rose-400">*</span></span>
                <span className="text-zinc-500 font-normal text-[9px]">Clear, action-oriented name</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. NextGen Security Infrastructure"
                className="w-full bg-black/80 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Project Scope & Deliverables
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe project objectives, key deliverables, and target outcome..."
                className="w-full bg-black/80 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-colors resize-none"
              />
            </div>

            {/* Grid for Status, Priority, Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as NetworkProject['status'])}
                  className="w-full bg-black/80 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="IDEATING">Planning (Ideating)</option>
                  <option value="BUILDING">In Progress (Building)</option>
                  <option value="STABLE">On Track (Stable)</option>
                  <option value="FORGING">Review (Forging)</option>
                  <option value="DONE">Completed (Done)</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-amber-400" /> Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as BlueprintPriority)}
                  className="w-full bg-black/80 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Target Due Date
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-black/80 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Tags / Categories */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-purple-400" /> Category Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder="Add custom tag (press Enter)..."
                  className="flex-1 bg-black/80 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-650 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded-xl transition-colors"
                >
                  Add Tag
                </button>
              </div>
              
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestedTags.map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      if (!tags.includes(st)) setTags([...tags, st]);
                    }}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                      tags.includes(st)
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-black/40 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    + {st}
                  </button>
                ))}
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-lg"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-amber-400/60 hover:text-rose-400 ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Initial Tasks (Only for New Projects) */}
            {!projectToEdit && (
              <div className="border-t border-zinc-850 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Initial Project Tasks (With Due Dates)
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">{initialTasks.length} queued</span>
                </div>

                {/* Quick Add Initial Task Row */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddInitialTask(); } }}
                    placeholder="Task title (e.g. Set up authentication flow)..."
                    className="flex-1 bg-black/80 border border-zinc-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-650 outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={e => setNewTaskDueDate(e.target.value)}
                      className="bg-black/80 border border-zinc-800 focus:border-amber-400 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddInitialTask}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>

                {/* Initial Task Items */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {initialTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-zinc-850 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                        <span className="truncate text-zinc-200">{task.text}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {task.dueDate && (
                          <span className="text-[9px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                            📅 {task.dueDate}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveInitialTask(task.id)}
                          className="text-zinc-500 hover:text-rose-400 p-0.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-850">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-serif font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
              >
                {projectToEdit ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
