import React, { useState } from 'react';
import { Plus, X, FolderPlus } from 'lucide-react';
import { ProfileProject } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ProjectShowcaseEditorProps {
    projects: ProfileProject[];
    onUpdateProjects: (projects: ProfileProject[]) => void;
}

export const ProjectShowcaseEditor: React.FC<ProjectShowcaseEditorProps> = ({ projects, onUpdateProjects }) => {
    const [editingProject, setEditingProject] = useState<ProfileProject | null>(null);

    const handleAdd = () => {
        setEditingProject({
            id: uuidv4(),
            title: '',
            description: '',
            status: 'current',
            technologies: [],
            link: '',
            liveDemoUrl: '',
            sourceCodeUrl: ''
        });
    };

    const handleSave = () => {
        if (!editingProject) return;
        if (projects.find(p => p.id === editingProject.id)) {
            onUpdateProjects(projects.map(p => p.id === editingProject.id ? editingProject : p));
        } else {
            onUpdateProjects([...projects, editingProject]);
        }
        setEditingProject(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Project Showcase</h3>
                <button onClick={handleAdd} className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(p => (
                    <div key={p.id} className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <span className="text-xs text-zinc-200">{p.title}</span>
                        <button onClick={() => setEditingProject(p)} className="text-[10px] text-purple-400 hover:text-purple-300">Edit</button>
                    </div>
                ))}
            </div>

            {editingProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-zinc-950 p-6 rounded-2xl w-full max-w-md border border-zinc-800 space-y-4">
                        <h3 className="text-sm font-bold text-white">Edit Project</h3>
                        <input value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} placeholder="Title" className="w-full bg-black p-2 rounded text-sm text-white border border-zinc-700" />
                        <textarea value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} placeholder="Description" className="w-full bg-black p-2 rounded text-sm text-white border border-zinc-700" />
                        <input value={editingProject.technologies?.join(', ')} onChange={e => setEditingProject({...editingProject, technologies: e.target.value.split(',').map(s => s.trim())})} placeholder="Tech (comma separated)" className="w-full bg-black p-2 rounded text-sm text-white border border-zinc-700" />
                        <input value={editingProject.sourceCodeUrl} onChange={e => setEditingProject({...editingProject, sourceCodeUrl: e.target.value})} placeholder="GitHub URL" className="w-full bg-black p-2 rounded text-sm text-white border border-zinc-700" />
                        <input value={editingProject.liveDemoUrl} onChange={e => setEditingProject({...editingProject, liveDemoUrl: e.target.value})} placeholder="Live Demo URL" className="w-full bg-black p-2 rounded text-sm text-white border border-zinc-700" />
                        
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingProject(null)} className="px-4 py-2 bg-zinc-800 rounded text-sm">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-purple-600 rounded text-sm text-white">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
