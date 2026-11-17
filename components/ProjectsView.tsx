import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { NetworkProject, ProjectTask, UserProfile } from '../types';
import { 
  FolderPlus, 
  Layers, 
  Layout, 
  ListTodo, 
  Plus, 
  Sparkles, 
  Calendar, 
  Activity, 
  CheckCircle2,
  Kanban,
  BarChart3,
  Users,
  ChevronRight,
  Filter,
  CheckSquare
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { KanbanBoard } from './KanbanBoard';
import { AssayTestLog } from './AssayTestLog';
import { ProjectStatusOverview } from './ProjectStatusOverview';
import { ProjectTaskList } from './ProjectTaskList';
import { ProjectDefineModal } from './ProjectDefineModal';
import { getProjectStats, formatDueDate, getPresetDate } from '../services/projectManagerUtils';

interface ProjectsViewProps {
  profile?: UserProfile;
  projects: NetworkProject[];
  setProjects: React.Dispatch<React.SetStateAction<NetworkProject[]>>;
  isSystemFractured?: boolean;
  onToggleFracture?: (val?: boolean) => void;
  onNavigateToView?: (view: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  profile,
  projects = [],
  setProjects,
  isSystemFractured = false,
  onToggleFracture,
  onNavigateToView
}) => {
  // Main view mode: OVERVIEW (all projects status) or WORKSPACE (single project deep dive)
  const [viewMode, setViewMode] = useState<'OVERVIEW' | 'WORKSPACE'>('OVERVIEW');

  // Selected Project
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    return projects.length > 0 ? projects[0].id : null;
  });

  // Modal for defining new or editing existing project
  const [isDefineModalOpen, setIsDefineModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<NetworkProject | null>(null);

  // Active Project Reference
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

  // Workspace sub-tab states: TASKS_LIST (default), KANBAN, ASSAY_LOG, TEAM
  const [activeTab, setActiveTab] = useState<'TASKS_LIST' | 'KANBAN' | 'ASSAY_LOG' | 'TEAM'>('TASKS_LIST');
  const [collaboratorInput, setCollaboratorInput] = useState('');
  const [techTag, setTechTag] = useState('');
  const [gitHubRepoInput, setGitHubRepoInput] = useState('');

  // Keep selectedProjectId valid if projects list changes
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Synchronize repo input on active project transition
  useEffect(() => {
    if (activeProject) {
      setGitHubRepoInput(activeProject.gitHubRepo || '');
    }
  }, [activeProject?.id]);

  // Toggle task completion
  const handleToggleTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        tasks: (p.tasks || []).map(t => {
          if (t.id !== taskId) return t;
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'DONE' : 'TODO',
            completedAt: nextCompleted ? Date.now() : undefined
          };
        })
      };
    }));

    toast.success('Task status updated');
  };

  // Delete task
  const handleDeleteTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        tasks: (p.tasks || []).filter(t => t.id !== taskId)
      };
    }));
    toast.success('Task removed');
  };

  // Update project fields
  const handleUpdateProject = (projectId: string, updates: Partial<NetworkProject>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        ...updates
      };
    }));
  };

  // Quick add task with due date
  const handleQuickAddTask = (projectId: string, text: string, dueDate: string) => {
    if (!text.trim()) return;
    const newTask: ProjectTask = {
      id: uuidv4(),
      text: text.trim(),
      completed: false,
      status: 'TODO',
      dueDate: dueDate || undefined,
      priority: 'MEDIUM',
      createdAt: Date.now()
    };

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        tasks: [...(p.tasks || []), newTask]
      };
    }));

    toast.success('Task created with due date!');
  };

  // Delete project
  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) {
      const remaining = projects.filter(p => p.id !== projectId);
      setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null);
    }
    toast.success('Project deleted');
  };

  // Open define modal for new project or edit
  const handleOpenDefineModal = (proj?: NetworkProject | null) => {
    setProjectToEdit(proj || null);
    setIsDefineModalOpen(true);
  };

  // Save project definition
  const handleSaveProjectDefinition = (data: Partial<NetworkProject> & { initialTasks?: Partial<ProjectTask>[] }) => {
    if (projectToEdit) {
      // Edit existing
      handleUpdateProject(projectToEdit.id, {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline,
        tags: data.tags
      });
      toast.success('Project updated successfully');
    } else {
      // Define new project
      const newTasks: ProjectTask[] = (data.initialTasks || []).map(t => ({
        id: uuidv4(),
        text: t.text || 'Initial Objective',
        completed: false,
        status: 'TODO',
        dueDate: t.dueDate || getPresetDate('nextweek'),
        priority: 'MEDIUM',
        createdAt: Date.now()
      }));

      const newProj: NetworkProject = {
        id: uuidv4(),
        title: data.title || 'Untitled Project',
        description: data.description || 'No description provided.',
        status: data.status || 'BUILDING',
        priority: data.priority || 'Medium',
        deadline: data.deadline,
        fightVector: 50,
        crazyLevel: 50,
        isWisdomHarmonized: false,
        timestamp: new Date(),
        tasks: newTasks,
        collaborators: [],
        tags: data.tags || ['Engineering']
      };

      setProjects(prev => [newProj, ...prev]);
      setSelectedProjectId(newProj.id);
      setViewMode('WORKSPACE');
      toast.success(`Project "${newProj.title}" defined successfully!`);
    }
  };

  // Jump from overview directly to project workspace
  const handleSelectProjectFromOverview = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewMode('WORKSPACE');
    setActiveTab('TASKS_LIST');
  };

  // Collaborators management
  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaboratorInput.trim() || !activeProject) return;
    const current = activeProject.collaborators || [];
    if (current.includes(collaboratorInput.trim())) {
      toast.error('Collaborator already added');
      return;
    }
    const updated = [...current, collaboratorInput.trim()];
    handleUpdateProject(activeProject.id, { collaborators: updated });
    setCollaboratorInput('');
    toast.success(`${collaboratorInput.trim()} added to team!`);
  };

  const handleRemoveCollaborator = (collab: string) => {
    if (!activeProject) return;
    const updated = (activeProject.collaborators || []).filter(c => c !== collab);
    handleUpdateProject(activeProject.id, { collaborators: updated });
    toast.success(`${collab} removed.`);
  };

  // Tag management
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techTag.trim() || !activeProject) return;
    const current = activeProject.tags || [];
    if (current.includes(techTag.trim())) return;
    handleUpdateProject(activeProject.id, { tags: [...current, techTag.trim()] });
    setTechTag('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!activeProject) return;
    handleUpdateProject(activeProject.id, { tags: (activeProject.tags || []).filter(t => t !== tag) });
  };

  const handleSaveRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    handleUpdateProject(activeProject.id, { gitHubRepo: gitHubRepoInput.trim() });
    toast.success('Repository linked!');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05050a] text-zinc-100 overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Top Application Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-amber-500/15 bg-black/70 backdrop-blur-md relative z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-serif font-bold uppercase tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 bg-clip-text text-transparent">
                Project Management System
              </h1>
              <span className="text-[9px] font-mono text-zinc-500 uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hidden sm:inline-block">
                {projects.length} Projects
              </span>
            </div>
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider mt-0.5">
              Define Projects • Add Tasks with Due Dates • Mark Complete • Track Status
            </p>
          </div>
        </div>

        {/* View Mode Switcher and Actions */}
        <div className="flex items-center gap-2">
          {/* Status Overview vs Workspace Tabs */}
          <div className="flex items-center bg-black/80 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('OVERVIEW')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                viewMode === 'OVERVIEW'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Status Overview</span>
            </button>
            <button
              onClick={() => {
                if (projects.length === 0) {
                  handleOpenDefineModal(null);
                } else {
                  setViewMode('WORKSPACE');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                viewMode === 'WORKSPACE'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Project Workspace</span>
            </button>
          </div>

          {/* Define New Project Button */}
          <button
            onClick={() => handleOpenDefineModal(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-serif font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Define Project</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {viewMode === 'OVERVIEW' ? (
          /* ==================== ALL PROJECTS STATUS OVERVIEW ==================== */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <div className="max-w-6xl mx-auto">
              <ProjectStatusOverview
                projects={projects}
                onSelectProject={handleSelectProjectFromOverview}
                onOpenDefineModal={handleOpenDefineModal}
                onDeleteProject={handleDeleteProject}
                onToggleTask={handleToggleTask}
                onQuickAddTask={handleQuickAddTask}
                onUpdateProjectStatus={(projectId, status) => handleUpdateProject(projectId, { status })}
              />
            </div>
          </div>
        ) : (
          /* ==================== PROJECT WORKSPACE ==================== */
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Project Selector */}
            <div className="w-64 border-r border-amber-500/10 bg-black/40 flex flex-col flex-shrink-0 overflow-y-auto">
              <div className="p-3.5 border-b border-amber-500/10 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-500/80 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-amber-400" /> Projects
                </span>
                <button
                  onClick={() => handleOpenDefineModal(null)}
                  className="p-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[10px] font-mono"
                  title="New Project"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="p-2 space-y-1 flex-1">
                {projects.map(p => {
                  const isActive = activeProject && p.id === activeProject.id;
                  const stats = getProjectStats(p);

                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1.5 relative overflow-hidden group ${
                        isActive
                          ? 'bg-zinc-900/90 border-amber-500/40 shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                          : 'bg-black/20 border-transparent hover:border-amber-500/15 hover:bg-zinc-950/60'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-yellow-600" />
                      )}

                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[11px] font-bold tracking-tight uppercase line-clamp-1 transition-colors ${
                          isActive ? 'text-amber-300' : 'text-zinc-300 group-hover:text-amber-200'
                        }`}>
                          {p.title}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-sm flex-shrink-0 border ${
                          stats.progressPercent === 100
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-black/40 border-zinc-800 text-zinc-400'
                        }`}>
                          {stats.completedTasks}/{stats.totalTasks}
                        </span>
                      </div>

                      {/* Mini progress bar */}
                      <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${stats.progressPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${stats.progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                        <span className="uppercase">{p.status || 'ACTIVE'}</span>
                        {stats.overdueTasks > 0 && (
                          <span className="text-rose-400 font-bold">⚠️ {stats.overdueTasks} Overdue</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Project Workspace */}
            <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
              {activeProject ? (
                <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 gap-5">
                  {/* Active Project Header Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-zinc-950/60 border border-amber-500/20 rounded-2xl gap-4 shadow-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {activeProject.status || 'BUILDING'}
                        </span>
                        {activeProject.priority && (
                          <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                            Priority: {activeProject.priority}
                          </span>
                        )}
                        {activeProject.deadline && (
                          <span className="text-[9px] font-mono text-zinc-300 bg-black/60 border border-zinc-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-emerald-400" />
                            Due: {formatDueDate(activeProject.deadline, false).formattedDate || activeProject.deadline}
                          </span>
                        )}
                        <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-zinc-100">
                          {activeProject.title}
                        </h2>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed max-w-2xl">
                        {activeProject.description}
                      </p>
                    </div>

                    {/* Quick project actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenDefineModal(activeProject)}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 rounded-xl text-xs font-mono transition-colors"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => setViewMode('OVERVIEW')}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-mono transition-colors flex items-center gap-1"
                      >
                        <BarChart3 className="w-3.5 h-3.5" /> All Projects
                      </button>
                    </div>
                  </div>

                  {/* Workspace Sub-tabs Navigation */}
                  <div className="flex border-b border-amber-500/10 gap-6 pb-0.5">
                    <button
                      onClick={() => setActiveTab('TASKS_LIST')}
                      className={`pb-2 text-xs font-serif uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                        activeTab === 'TASKS_LIST'
                          ? 'border-amber-400 text-amber-300 font-bold'
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <ListTodo className="w-3.5 h-3.5" />
                      <span>Tasks & Due Dates</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('KANBAN')}
                      className={`pb-2 text-xs font-serif uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                        activeTab === 'KANBAN'
                          ? 'border-amber-400 text-amber-300 font-bold'
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Kanban className="w-3.5 h-3.5" />
                      <span>Kanban Board</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('TEAM')}
                      className={`pb-2 text-xs font-serif uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                        activeTab === 'TEAM'
                          ? 'border-amber-400 text-amber-300 font-bold'
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Team & Tags</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('ASSAY_LOG')}
                      className={`pb-2 text-xs font-serif uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                        activeTab === 'ASSAY_LOG'
                          ? 'border-amber-400 text-amber-300 font-bold'
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Assay Log</span>
                    </button>
                  </div>

                  {/* Workspace Content Pane */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-1">
                    {activeTab === 'TASKS_LIST' && (
                      <ProjectTaskList
                        project={activeProject}
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                        onUpdateProject={handleUpdateProject}
                      />
                    )}

                    {activeTab === 'KANBAN' && (
                      <KanbanBoard
                        project={activeProject}
                        tasks={activeProject.tasks || []}
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                        onUpdateProject={handleUpdateProject}
                        isAudible={true}
                      />
                    )}

                    {activeTab === 'ASSAY_LOG' && (
                      <AssayTestLog
                        project={activeProject}
                        onUpdateProject={handleUpdateProject}
                      />
                    )}

                    {activeTab === 'TEAM' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        {/* Team Collaborators */}
                        <div className="p-5 bg-zinc-950/60 border border-amber-500/10 rounded-2xl space-y-4">
                          <div className="pb-2 border-b border-amber-500/10 flex justify-between items-center">
                            <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300">Team Collaborators</h3>
                            <span className="text-[9px] font-mono text-zinc-500">Project Group</span>
                          </div>

                          <form onSubmit={handleAddCollaborator} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter collaborator name..."
                              value={collaboratorInput}
                              onChange={(e) => setCollaboratorInput(e.target.value)}
                              className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono focus:border-amber-500/50 outline-none"
                            />
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-xl text-[10px] font-mono uppercase tracking-wider"
                            >
                              Add
                            </button>
                          </form>

                          <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                            {(!activeProject.collaborators || activeProject.collaborators.length === 0) ? (
                              <p className="text-[10px] text-zinc-650 font-mono italic text-center py-6">No collaborators assigned yet.</p>
                            ) : (
                              activeProject.collaborators.map(member => (
                                <div key={member} className="flex items-center justify-between p-2.5 bg-black/40 border border-zinc-900 rounded-xl">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-serif text-[10px] font-black uppercase">
                                      {member.slice(0, 2)}
                                    </div>
                                    <span className="text-xs font-mono text-zinc-300 font-bold">{member}</span>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveCollaborator(member)}
                                    className="text-rose-500 hover:text-rose-400 p-1 text-[10px] font-mono rounded"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Metadata & Tags */}
                        <div className="p-5 bg-zinc-950/60 border border-amber-500/10 rounded-2xl space-y-4">
                          <div className="pb-2 border-b border-amber-500/10">
                            <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300">Project Tags & Repository</h3>
                          </div>

                          {/* GitHub Repo */}
                          <form onSubmit={handleSaveRepo} className="space-y-1.5">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase block font-bold">Repository Link</label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                placeholder="https://github.com/..."
                                value={gitHubRepoInput}
                                onChange={(e) => setGitHubRepoInput(e.target.value)}
                                className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono focus:border-amber-500/50 outline-none"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-xl text-[10px] font-mono uppercase"
                              >
                                Save
                              </button>
                            </div>
                          </form>

                          {/* Tags */}
                          <div className="space-y-2 pt-2">
                            <label className="text-[9px] font-mono text-zinc-400 uppercase block font-bold">Category Tags</label>
                            <form onSubmit={handleAddTag} className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add category tag..."
                                value={techTag}
                                onChange={(e) => setTechTag(e.target.value)}
                                className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono focus:border-amber-500/50 outline-none"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-xl text-[10px] font-mono uppercase"
                              >
                                Tag
                              </button>
                            </form>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {activeProject.tags?.map(tag => (
                                <span key={tag} className="text-[9px] font-mono bg-zinc-900 border border-amber-500/10 px-2.5 py-0.5 rounded-md text-amber-300/80 flex items-center gap-1.5">
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-red-400 text-zinc-500"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Empty Projects State */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="p-4 rounded-full bg-zinc-900 border border-amber-500/20 shadow-inner">
                    <Layers className="w-8 h-8 text-amber-500 opacity-60 animate-pulse" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300">
                      No Project Selected
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                      Select a project from the sidebar or define a new project to start managing tasks.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenDefineModal(null)}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all"
                  >
                    DEFINE FIRST PROJECT
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Project Define/Edit Modal */}
      <ProjectDefineModal
        isOpen={isDefineModalOpen}
        onClose={() => {
          setIsDefineModalOpen(false);
          setProjectToEdit(null);
        }}
        onSave={handleSaveProjectDefinition}
        projectToEdit={projectToEdit}
      />
    </div>
  );
};
