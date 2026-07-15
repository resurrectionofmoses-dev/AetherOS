import React, { useState, useEffect } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { AssayTestLog } from './AssayTestLog';
import { toast } from 'sonner';
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

  // Workspace sub-tab states
  const [activeTab, setActiveTab] = useState<'TASKS' | 'ASSAY_LOG' | 'TEAM'>('TASKS');
  const [collaboratorInput, setCollaboratorInput] = useState('');
  const [techTag, setTechTag] = useState('');
  const [gitHubRepoInput, setGitHubRepoInput] = useState('');

  // Synchronize repo input and sub-tab on selected project transition
  useEffect(() => {
    setActiveTab('TASKS');
    if (activeProject) {
      setGitHubRepoInput(activeProject.gitHubRepo || '');
    }
  }, [selectedProjectId, activeProject?.id]);

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

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaboratorInput.trim()) return;
    if (!activeProject) return;
    const current = activeProject.collaborators || [];
    if (current.includes(collaboratorInput.trim())) {
      toast.error('Collaborator already exists in this project group');
      return;
    }
    const updated = [...current, collaboratorInput.trim()];
    handleUpdateProject(activeProject.id, { collaborators: updated });
    setCollaboratorInput('');
    toast.success(`${collaboratorInput.trim()} added to the project group!`);
  };

  const handleRemoveCollaborator = (collab: string) => {
    if (!activeProject) return;
    const updated = (activeProject.collaborators || []).filter(c => c !== collab);
    handleUpdateProject(activeProject.id, { collaborators: updated });
    toast.success(`${collab} removed from the project group.`);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techTag.trim()) return;
    if (!activeProject) return;
    const current = activeProject.tags || [];
    if (current.includes(techTag.trim())) return;
    const updated = [...current, techTag.trim()];
    handleUpdateProject(activeProject.id, { tags: updated });
    setTechTag('');
    toast.success(`Tagged project with ${techTag.trim()}!`);
  };

  const handleRemoveTag = (tag: string) => {
    if (!activeProject) return;
    const updated = (activeProject.tags || []).filter(t => t !== tag);
    handleUpdateProject(activeProject.id, { tags: updated });
  };

  const handleSaveRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    handleUpdateProject(activeProject.id, { gitHubRepo: gitHubRepoInput.trim() });
    toast.success('GitHub repository link configured successfully!');
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

              {/* Workspace Navigation Tabs */}
              <div className="flex border-b border-amber-500/10 gap-6 pb-0.5">
                <button
                  onClick={() => setActiveTab('TASKS')}
                  className={`pb-2.5 text-[10px] font-serif uppercase tracking-widest border-b-2 transition-all ${
                    activeTab === 'TASKS'
                      ? 'border-amber-400 text-amber-300 font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  📋 Campaign Objectives
                </button>
                <button
                  onClick={() => setActiveTab('ASSAY_LOG')}
                  className={`pb-2.5 text-[10px] font-serif uppercase tracking-widest border-b-2 transition-all ${
                    activeTab === 'ASSAY_LOG'
                      ? 'border-amber-400 text-amber-300 font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  🧪 Assay Test Log
                </button>
                <button
                  onClick={() => setActiveTab('TEAM')}
                  className={`pb-2.5 text-[10px] font-serif uppercase tracking-widest border-b-2 transition-all ${
                    activeTab === 'TEAM'
                      ? 'border-amber-400 text-amber-300 font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  👥 Team & Metadata
                </button>
              </div>

              {/* Dynamic Sub-View Workspace Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                {activeTab === 'TASKS' && (
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
                    {/* Card 1: Collaborators & Skills Network Integration */}
                    <div className="p-5 bg-zinc-950/60 border border-amber-500/10 rounded-2xl space-y-4">
                      <div className="pb-2 border-b border-amber-500/10 flex justify-between items-center">
                        <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300">Project Group Team</h3>
                        <span className="text-[9px] font-mono text-zinc-500">Collaborative Network</span>
                      </div>

                      <form onSubmit={handleAddCollaborator} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter user name / collaborator..."
                          value={collaboratorInput}
                          onChange={(e) => setCollaboratorInput(e.target.value)}
                          className="flex-1 bg-black border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono focus:border-amber-500/50 outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-xl text-[10px] font-mono uppercase tracking-wider"
                        >
                          Add Member
                        </button>
                      </form>

                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                        {(!activeProject.collaborators || activeProject.collaborators.length === 0) ? (
                          <p className="text-[10px] text-zinc-650 font-mono italic text-center py-6">No team collaborators assigned yet.</p>
                        ) : (
                          activeProject.collaborators.map(member => (
                            <div key={member} className="flex items-center justify-between p-2.5 bg-black/40 border border-zinc-900 rounded-xl hover:bg-black/60 transition-colors">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-serif text-[10px] font-black uppercase">
                                  {member.slice(0, 2)}
                                </div>
                                <span className="text-xs font-mono text-zinc-300 font-bold">{member}</span>
                              </div>
                              <button
                                onClick={() => handleRemoveCollaborator(member)}
                                className="text-rose-500 hover:text-rose-400 p-1 text-[10px] font-mono hover:bg-rose-500/10 rounded transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Card 2: Metadata & Repositories */}
                    <div className="p-5 bg-zinc-950/60 border border-amber-500/10 rounded-2xl space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="pb-2 border-b border-amber-500/10">
                          <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300">Showcase Settings</h3>
                        </div>

                        {/* GitHub Repo */}
                        <form onSubmit={handleSaveRepo} className="space-y-1.5">
                          <label className="text-[9px] font-mono text-zinc-550 uppercase block font-bold">GitHub Repository Link</label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="e.g. https://github.com/prospector/aetheros"
                              value={gitHubRepoInput}
                              onChange={(e) => setGitHubRepoInput(e.target.value)}
                              className="flex-1 bg-black border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono focus:border-amber-500/50 outline-none"
                            />
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-colors"
                            >
                              Save Link
                            </button>
                          </div>
                        </form>

                        {/* Technology Tags */}
                        <div className="space-y-2 pt-2">
                          <label className="text-[9px] font-mono text-zinc-550 uppercase block font-bold">Technology Tags</label>
                          <form onSubmit={handleAddTag} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add technology (e.g. React, D3)..."
                              value={techTag}
                              onChange={(e) => setTechTag(e.target.value)}
                              className="flex-1 bg-black border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono focus:border-amber-500/50 outline-none"
                            />
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-colors"
                            >
                              Tag
                            </button>
                          </form>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(!activeProject.tags || activeProject.tags.length === 0) ? (
                              <span className="text-[9px] text-zinc-650 italic font-mono">No tech tags configured yet.</span>
                            ) : (
                              activeProject.tags.map(tag => (
                                <span key={tag} className="text-[9px] font-mono bg-zinc-900 border border-amber-500/10 px-2.5 py-0.5 rounded-md text-amber-300/80 flex items-center gap-1.5">
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-red-400 text-zinc-500 transition-colors"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
