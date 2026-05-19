import React, { useState, useEffect } from 'react';
import { UserProfile, NetworkProject } from '../types';
import { UserIcon, EditIcon, CheckIcon, CodeIcon, XIcon, PlusIcon, ShieldIcon, TrashIcon } from './icons';
import { KeyIcon, RefreshCwIcon, CalendarIcon, Trash2Icon, PlusSquareIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { safeStorage } from '../services/safeStorage';

interface ApiKey {
    id: string;
    key: string;
    expirationDate: string;
    createdAt: number;
}

interface UserProfileViewProps {
    profile: UserProfile;
    projects: NetworkProject[];
    onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ profile, projects, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<UserProfile>(profile);
    const [newSkill, setNewSkill] = useState('');
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isKeysLoading, setIsKeysLoading] = useState(true);
    const [passphrase, setPassphrase] = useState('');
    const [isPassphraseSet, setIsPassphraseSet] = useState(false);

    const handleSetPassphrase = () => {
        if (!passphrase.trim()) return;
        safeStorage.setPassphrase(passphrase);
        setIsPassphraseSet(true);
        // Reload keys with the new passphrase
        loadKeys();
    };

    const loadKeys = async () => {
        setIsKeysLoading(true);
        const saved = await safeStorage.getItem('aetheros_api_keys');
        if (saved) {
            try { 
                setApiKeys(JSON.parse(saved)); 
            } catch (e) { 
                console.error("Failed to load API keys", e); 
                setApiKeys([]);
            }
        }
        setIsKeysLoading(false);
    };

    useEffect(() => {
        loadKeys();
    }, []);

    useEffect(() => {
        const persistKeys = async () => {
            if (!isKeysLoading) {
                await safeStorage.setItem('aetheros_api_keys', JSON.stringify(apiKeys));
            }
        };
        persistKeys();
    }, [apiKeys, isKeysLoading]);


    const completedProjects = projects.filter(p => p.status === 'DONE');

    const handleSave = () => {
        onUpdateProfile(editForm);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditForm(profile);
        setIsEditing(false);
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
            setEditForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setEditForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const handleGenerateKey = async () => {
        const newKey: ApiKey = {
            id: uuidv4(),
            key: `sk_live_v1_${Math.random().toString(36).substring(2, 15)}...`,
            expirationDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // 1 year from now
            createdAt: Date.now()
        };
        const updated = [...apiKeys, newKey];
        setApiKeys(updated);
    };

    const handleRevokeKey = async (id: string) => {
        const updated = apiKeys.filter(k => k.id !== id);
        setApiKeys(updated);
    };


    return (
        <div className="h-full flex flex-col bg-[#050505] text-gray-200 font-mono p-6 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full space-y-8">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-800 pb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-blue-900/20 border-2 border-blue-500/30 rounded-2xl flex items-center justify-center overflow-hidden">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-12 h-12 text-blue-400" />
                            )}
                        </div>
                        <div>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <input 
                                        value={editForm.username}
                                        onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                        className="bg-black/40 border border-gray-700 rounded px-3 py-1 text-2xl font-bold text-white focus:outline-none focus:border-blue-500 w-full max-w-xs"
                                        placeholder="Sovereign Name"
                                    />
                                    <div className="flex gap-2">
                                        <select 
                                            value={editForm.role}
                                            onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value as any }))}
                                            className="bg-black/40 border border-gray-700 rounded px-2 py-1 text-[10px] uppercase font-black text-blue-400 focus:outline-none"
                                        >
                                            <option value="guest">Guest</option>
                                            <option value="user">User</option>
                                            <option value="moderator">Moderator</option>
                                            <option value="operator">Operator</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <input 
                                             value={editForm.sovereignty || ''}
                                             onChange={e => setEditForm(prev => ({ ...prev, sovereignty: e.target.value }))}
                                             className="bg-black/40 border border-gray-700 rounded px-3 py-1 text-[10px] font-black uppercase text-amber-500 focus:outline-none focus:border-amber-500 flex-1"
                                             placeholder="Your Sovereignty (e.g. THE_REACH)"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-4xl font-bold text-white tracking-tight">{profile.username}</h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                            profile.role === 'admin' ? 'bg-red-600 text-white' : 
                                            profile.role === 'operator' ? 'bg-amber-600 text-black' : 
                                            profile.role === 'moderator' ? 'bg-blue-600 text-white' : 
                                            'bg-gray-800 text-gray-400'
                                        }`}>
                                            {profile.role}
                                        </span>
                                        <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">//</span>
                                        <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">{profile.sovereignty || 'NONE'}</span>
                                        <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">// ID: {profile.id.substring(0, 8)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        {isEditing ? (
                            <div className="flex gap-3">
                                <button onClick={handleCancel} className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-bold uppercase">
                                    <XIcon className="w-4 h-4" /> Cancel
                                </button>
                                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors flex items-center gap-2 text-sm font-bold uppercase">
                                    <CheckIcon className="w-4 h-4" /> Save Profile
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase">
                                <EditIcon className="w-4 h-4" /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Bio & Skills */}
                    <div className="md:col-span-1 space-y-8">
                        {/* Bio Section */}
                        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Biography</h3>
                            {isEditing ? (
                                <textarea 
                                    value={editForm.bio}
                                    onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                    className="w-full bg-black/40 border border-gray-700 rounded p-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 min-h-[120px] resize-none"
                                    placeholder="Enter your biography..."
                                />
                            ) : (
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {profile.bio || <span className="text-gray-600 italic">No biography provided.</span>}
                                </p>
                            )}
                        </div>

                        {/* Skills Section */}
                        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Technical Skills</h3>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(isEditing ? editForm.skills : profile.skills).map(skill => (
                                    <div key={skill} className="bg-blue-900/20 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                                        {skill}
                                        {isEditing && (
                                            <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-400 transition-colors">
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {(!isEditing && profile.skills.length === 0) && (
                                    <span className="text-gray-600 italic text-sm">No skills listed.</span>
                                )}
                            </div>

                            {isEditing && (
                                <div className="flex gap-2">
                                    <input 
                                        value={newSkill}
                                        onChange={e => setNewSkill(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                                        placeholder="Add a skill..."
                                        className="flex-1 bg-black/40 border border-gray-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    />
                                    <button onClick={handleAddSkill} className="bg-gray-800 hover:bg-gray-700 text-white p-1.5 rounded transition-colors">
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* API Keys Section */}
                        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <KeyIcon className="w-4 h-4 text-amber-500" /> API Keys
                                </h3>
                                {profile.role === 'operator' && (
                                    <button 
                                        onClick={handleGenerateKey}
                                        className="p-1.5 bg-amber-900/20 border border-amber-500/30 text-amber-500 rounded-lg hover:bg-amber-900/40 transition-all active:scale-95"
                                        title="Generate New Key"
                                    >
                                        <PlusSquareIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Sovereign Encryption Sub-Section */}
                            <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldIcon className="w-3 h-3 text-red-500" />
                                    <span className="text-[9px] font-black uppercase text-red-500 tracking-wider">Sovereign Gate: AES-GCM (v3)</span>
                                </div>
                                <p className="text-[8px] text-gray-500 mb-3 leading-relaxed">
                                    {profile.role === 'operator' 
                                        ? "Set a session passphrase to encrypt your keys with your own AEC-SIM signature. If omitted, DEFAULT_VAULT_2026 is used."
                                        : "Encryption lattice is locked for Guest Observers. Sovereign keys cannot be modified."}
                                </p>
                                {profile.role === 'operator' && (
                                    <div className="flex gap-2">
                                        <input 
                                            type="password"
                                            value={passphrase}
                                            onChange={e => setPassphrase(e.target.value)}
                                            placeholder="Enter Passphrase..."
                                            className="flex-1 bg-black/40 border border-red-900/30 rounded px-2 py-1.5 text-[10px] text-red-400 focus:outline-none focus:border-red-500"
                                        />
                                        <button 
                                            onClick={handleSetPassphrase}
                                            className={`px-2 py-1.5 rounded text-[8px] font-bold uppercase transition-all ${isPassphraseSet ? 'bg-green-600 text-black' : 'bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-black'}`}
                                        >
                                            {isPassphraseSet ? 'Set' : 'Engage'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {isKeysLoading ? (
                                    <div className="text-center py-4">
                                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        <p className="text-[8px] text-amber-500/50 uppercase">Decrypting_Lattice...</p>
                                    </div>
                                ) : apiKeys.length === 0 ? (
                                    <div className="text-center py-4 border border-dashed border-gray-800 rounded-lg">
                                        <p className="text-[10px] text-gray-600 font-black uppercase">No Active Keys</p>
                                    </div>
                                ) : (
                                    apiKeys.map(key => (
                                        <div key={key.id} className="bg-black/40 border border-gray-800 rounded-xl p-4 group hover:border-amber-500/20 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-tighter mb-1">Live Access Key</p>
                                                    <p className="text-xs font-mono text-zinc-300 break-all">{key.key}</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleRevokeKey(key.id)}
                                                    className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors opacity-40 group-hover:opacity-100"
                                                    title="Revoke Key"
                                                >
                                                    <Trash2Icon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-[8px] text-zinc-500 font-black uppercase">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    Expires: {key.expirationDate}
                                                </div>
                                                <div className="flex items-center gap-1 text-[8px] text-emerald-500 font-black uppercase">
                                                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                                    Active
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <p className="text-[8px] text-gray-600 mt-4 leading-relaxed italic">
                                * API keys provide full access to your network resources. Treat them like passwords.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Completed Projects */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <CodeIcon className="w-6 h-6 text-emerald-500" />
                            <h2 className="text-xl font-bold text-white uppercase tracking-widest">Completed Projects</h2>
                            <span className="ml-auto bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                                {completedProjects.length} Total
                            </span>
                        </div>

                        {completedProjects.length === 0 ? (
                            <div className="bg-gray-900/30 border border-gray-800 border-dashed rounded-xl p-12 text-center">
                                <CodeIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500">No completed projects yet.</p>
                                <p className="text-xs text-gray-600 mt-2">Finish projects in the Network to display them here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {completedProjects.map(project => (
                                    <div key={project.id} className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 hover:border-emerald-500/30 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">{project.title}</h4>
                                            <span className="text-[10px] text-gray-500 font-mono">
                                                {new Date(project.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                                        
                                        <div className="flex gap-4 text-xs font-mono text-gray-500">
                                            <span>Tasks: {project.tasks?.filter(t => t.completed).length || 0}/{project.tasks?.length || 0}</span>
                                            <span>Resonance: {project.fightVector}dB</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
