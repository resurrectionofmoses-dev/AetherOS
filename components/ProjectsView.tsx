import React, { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import type { NetworkProject, ProjectTask, UserProfile } from '../types';
import { 
  FolderPlus, 
  Layers, 
  Layout, 
  List, 
  Plus, 
  Sparkles, 
  Trophy, 
  Clock, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ProjectsViewProps {
  profile?: UserProfile;
  projects: NetworkProject[];
  setProjects: React.Dispatch<React.SetStateAction<NetworkProject[]>>;
  isSystemFractured?: boolean;
  onToggleFracture?: (val?: boolean) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  profile,
  projects = [],
  setProjects,
  isSystemFractured = false,
  onToggleFracture
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    return projects.length > 0 ? projects[0].id : null;
  });

  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Active Project Reference
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

  // Task operation callbacks that sync updated state back to this parent component
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
  };

  const handleDeleteTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        tasks: (p.tasks || []).filter(t => t.id !== taskId)
      };
    }));
  };

  const handleUpdateProject = (projectId: string, updates: Partial<NetworkProject>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        ...updates
      };
    }));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    const newProject: NetworkProject = {
      id: uuidv4(),
      title: newProjectTitle.trim(),
      description: newProjectDesc.trim() || 'No description provided.',
      status: 'IDEATING',
      fightVector: 50,
      crazyLevel: 50,
      isWisdomHarmonized: false,
      timestamp: new Date(),
      tasks: [],
      collaborators: [],
      tags: []
    };

    setProjects(prev => [...prev, newProject]);
    setSelectedProjectId(newProject.id);
    setNewProjectTitle('');
    setNewProjectDesc('');
    setIsAddingProject(false);
  };

  const handleAddNewTaskDirect = (projectId: string, text: string) => {
    if (!text.trim()) return;
    const newTask: ProjectTask = {
      id: uuidv4(),
      text: text.trim(),
      completed: false,
      status: 'TODO',
      dueDate: '',
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
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05050a] text-zinc-100 overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/10 bg-black/40 backdrop-blur-sm relative z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Layout className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-serif font-bold uppercase tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 bg-clip-text text-transparent">
              Sovereign Projects Hub
            </h1>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">
              Multi-Threaded Kanban Engine & Active Attunements
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingProject(!isAddingProject)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-serif uppercase tracking-widest transition-all"
        >
          <FolderPlus className="w-3.5 h-3.5 text-amber-400" /> New Campaign
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Sidebar Project Selector */}
        <div className="w-64 border-r border-amber-500/10 bg-black/30 flex flex-col flex-shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-amber-500/5">
            <span className="text-[9px] font-mono font-bold text-amber-500/60 uppercase tracking-widest">
              Campaign Selector
            </span>
          </div>

          <div className="p-2 space-y-1 flex-1">
            {projects.map(p => {
              const isActive = activeProject && p.id === activeProject.id;
              const pendingCount = p.tasks?.filter(t => !t.completed).length || 0;
              const totalCount = p.tasks?.length || 0;

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setIsAddingProject(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1.5 relative overflow-hidden group ${
                    isActive
                      ? 'bg-zinc-900/80 border-amber-500/40 shadow-[0_4px_12px_rgba(0,0,0,0.4)]'
                      : 'bg-black/10 border-transparent hover:border-amber-500/15 hover:bg-zinc-950/40'
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
                    <span className="text-[9px] font-mono bg-black/40 border border-amber-500/15 text-amber-200 px-1.5 py-0.2 rounded-sm flex-shrink-0">
                      {pendingCount}/{totalCount}
                    </span>
                  </div>

                  <p className="text-[9px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Project View / Kanban Board */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/10">
          {isAddingProject ? (
            /* New Project Creator View */
            <div className="p-8 max-w-xl mx-auto w-full space-y-6 overflow-y-auto">
              <div className="border border-amber-500/20 bg-zinc-950/80 p-6 rounded-2xl relative shadow-2xl">
                <div className="absolute top-1 left-1 text-amber-500/30 text-[8px] font-mono">✦</div>
                <div className="absolute top-1 right-1 text-amber-500/30 text-[8px] font-mono">✦</div>
                <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300 mb-4 pb-2 border-b border-amber-500/15">
                  Formulate Grand Campaign
                </h2>

                <form onSubmit={handleAddProject} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
                      Campaign Title
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Operation Golden Sceptre"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      className="w-full bg-black border border-amber-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20 placeholder:text-zinc-650"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
                      Strategic Scope Description
                    </label>
                    <textarea
                      placeholder="Outline the grand vision and bounds of this operational thread..."
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      rows={4}
                      className="w-full bg-black border border-amber-500/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20 placeholder:text-zinc-650 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProject(false)}
                      className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200"
                    >
                      ABORT
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-black font-bold font-serif rounded-lg text-xs uppercase tracking-widest shadow-lg hover:from-amber-500 hover:to-yellow-600 transition-all border border-amber-400/30"
                    >
                      ENGAGE CAMPAIGN
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : activeProject ? (
            /* Active Kanban Workspace */
            <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
              
              {/* Active Campaign Header Card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-zinc-950/40 border border-amber-500/10 rounded-2xl gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {activeProject.status || 'ACTIVE'}
                    </span>
                    <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-zinc-100">
                      {activeProject.title}
                    </h2>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed max-w-2xl">
                    {activeProject.description}
                  </p>
                </div>

                {/* Status metrics bar */}
                <div className="flex items-center gap-4 border-l border-amber-500/10 pl-4 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-[9px] font-mono text-zinc-500 uppercase">Objectives</div>
                    <div className="text-xs font-bold text-amber-300 font-serif">
                      {activeProject.tasks?.length || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] font-mono text-zinc-500 uppercase">Calibrated</div>
                    <div className="text-xs font-bold text-emerald-400 font-serif">
                      {activeProject.tasks?.filter(t => t.completed).length || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Kanban Board Board Component Integration */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <KanbanBoard
                  project={activeProject}
                  tasks={activeProject.tasks || []}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onUpdateProject={handleUpdateProject}
                  isAudible={true}
                />
              </div>

            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="p-4 rounded-full bg-zinc-900 border border-amber-500/20 shadow-inner">
                <Layers className="w-8 h-8 text-amber-500 opacity-60 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300">
                  No Campaign Selected
                </h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Engage a pre-existing campaign or create a new operational track to activate the Kanban Board.
                </p>
              </div>
              <button
                onClick={() => setIsAddingProject(true)}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-xl text-[10px] font-bold font-mono tracking-widest uppercase transition-all"
              >
                CREATE FIRST CAMPAIGN
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
