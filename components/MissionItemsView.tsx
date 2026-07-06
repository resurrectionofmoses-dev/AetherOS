import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Edit, Search, BookOpen, Compass, 
  Terminal, ShieldCheck, Database, HelpCircle, X, Check, FileText
} from 'lucide-react';
import { MissionItem } from '../types';
import { missionItemsDb } from '../services/missionItemsDb';
import { toast } from 'sonner';

export const MissionItemsView: React.FC = () => {
  const [items, setItems] = useState<MissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    reason: '',
    learn: '',
    go: '',
    coding: ''
  });

  // Deletion guard
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load items from database on mount
  useEffect(() => {
    let isMounted = true;
    const fetchItems = async () => {
      try {
        const fetched = await missionItemsDb.getItems();
        if (isMounted) {
          setItems(fetched);
          setLoading(false);
        }
      } catch (e) {
        console.error('[Mission Registry] Error loading items:', e);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchItems();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const lower = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lower) ||
      item.reason.toLowerCase().includes(lower) ||
      item.learn.toLowerCase().includes(lower) ||
      item.go.toLowerCase().includes(lower) ||
      item.coding.toLowerCase().includes(lower)
    );
  }, [items, searchQuery]);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('The Name of the item is required.');
      return;
    }
    if (!formData.reason.trim()) {
      toast.error('The Reason of Being is required.');
      return;
    }

    const toastId = toast.loading(editingId ? 'Syncing updates to database...' : 'Registering new item...');
    try {
      const newItem: MissionItem = {
        id: editingId || `item-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        reason: formData.reason.trim(),
        learn: formData.learn.trim(),
        go: formData.go.trim(),
        coding: formData.coding.trim(),
        createdAt: editingId ? (items.find(i => i.id === editingId)?.createdAt || Date.now()) : Date.now()
      };

      await missionItemsDb.saveItem(newItem);
      
      // Update UI state
      if (editingId) {
        setItems(prev => prev.map(i => i.id === editingId ? newItem : i));
        toast.success('Mission item successfully updated in persistent node.', { id: toastId });
      } else {
        setItems(prev => [newItem, ...prev]);
        toast.success('New mission item successfully linked to database.', { id: toastId });
      }

      // Reset Form State
      setFormData({ name: '', reason: '', learn: '', go: '', coding: '' });
      setEditingId(null);
    } catch (err) {
      console.error('[Mission Registry] Submission failed:', err);
      toast.error('Database sync warning. Item saved locally.', { id: toastId });
    }
  };

  // Load item into form for editing
  const handleEditClick = (item: MissionItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      reason: item.reason,
      learn: item.learn,
      go: item.go,
      coding: item.coding
    });
    // Scroll form into view on mobile
    const formElement = document.getElementById('mission-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cancel edit state
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', reason: '', learn: '', go: '', coding: '' });
  };

  // Handle Deletion
  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async (id: string) => {
    const toastId = toast.loading('Removing item from ledger...');
    try {
      await missionItemsDb.deleteItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setConfirmDeleteId(null);
      toast.success('Item safely expunged from persistent database.', { id: toastId });
    } catch (err) {
      console.error('[Mission Registry] Deletion error:', err);
      toast.error('Failed to expunge item from backend.', { id: toastId });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#020205] text-zinc-300 overflow-y-auto h-full p-4 lg:p-8 relative custom-scrollbar">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.05),transparent_40%)]" />

      {/* Cybernetic Status Line */}
      <div className="flex items-center justify-between border-b border-red-500/10 pb-4 mb-6 relative">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            <h1 className="font-sans font-black text-2xl tracking-wider text-red-500 uppercase">Sovereign Mission Registry</h1>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
            Database Ledger // Node: persistent_store_0x03E2
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-black/60 border border-zinc-900 rounded-lg px-3 py-1.5 font-mono text-[9px] text-zinc-400">
          <Database className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span className="text-amber-400 font-black">LOCAL_PERSISTENCE: SECURED</span>
          <span className="text-zinc-800">|</span>
          <span className="text-emerald-400 font-black">AES_LOCAL_BACKUP: ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Column: List of items */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Search bar & statistics */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between bg-zinc-950/70 border border-zinc-900 rounded-xl p-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                placeholder="Query mission matrix..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-zinc-900 hover:border-zinc-800 focus:border-red-500/50 rounded-lg py-1.5 pl-9 pr-4 text-xs text-zinc-300 font-mono focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-around sm:justify-end gap-6 px-2 font-mono text-[10px]">
              <div className="text-center sm:text-right">
                <div className="text-zinc-600 uppercase tracking-widest font-black text-[8px]">Index Scale</div>
                <div className="text-zinc-300 font-black mt-0.5">{items.length} Registered</div>
              </div>
              <div className="h-6 w-[1px] bg-zinc-900" />
              <div className="text-center sm:text-right">
                <div className="text-zinc-600 uppercase tracking-widest font-black text-[8px]">Query Matches</div>
                <div className="text-red-500/80 font-black mt-0.5">{filteredItems.length} Shown</div>
              </div>
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-900 rounded-2xl bg-black/20">
              <div className="w-10 h-10 border-t-2 border-r-2 border-red-500 rounded-full animate-spin mb-4" />
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Querying central ledger network...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-900/60 rounded-2xl bg-black/10 text-center px-6">
              <FileText className="w-8 h-8 text-zinc-750 mb-3" />
              <h3 className="font-sans font-bold text-sm text-zinc-400 uppercase tracking-wider">No matching artifacts</h3>
              <p className="text-xs text-zinc-650 mt-1 max-w-sm">
                No items match your active search terms. Use the terminal panel on the right to register a new system item.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => {
                  const isConfirmingDelete = confirmDeleteId === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
                      className="bg-black/65 border border-zinc-900 hover:border-zinc-800/80 rounded-xl p-5 relative overflow-hidden transition-all group"
                    >
                      {/* Decorative sidebar highlight */}
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-red-500/40 to-transparent opacity-30 group-hover:opacity-100 transition-opacity" />

                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-sans font-extrabold text-base text-zinc-200 tracking-tight leading-tight group-hover:text-white transition-colors">
                            {item.name}
                          </h3>
                          <span className="inline-block font-mono text-[8px] text-zinc-600 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900/60">
                            ID: {item.id}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(item)}
                            title="Edit Record"
                            className="p-1.5 rounded-lg border border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900/40 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1 bg-red-950/20 border border-red-900/40 rounded-lg p-0.5 animate-in fade-in zoom-in-95 duration-150">
                              <button
                                onClick={() => confirmDelete(item.id)}
                                className="px-2 py-1 text-[9px] font-mono font-bold bg-red-650 hover:bg-red-500 text-white rounded cursor-pointer transition-colors"
                              >
                                YES
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              title="Delete Record"
                              className="p-1.5 rounded-lg border border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900/40 text-zinc-650 hover:text-red-500 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Item Details Container */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-zinc-900/50">
                        
                        {/* Reason of being (Full width) */}
                        <div className="md:col-span-2 space-y-1 bg-zinc-950/45 border border-zinc-950 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                            <Compass className="w-3 h-3 text-red-500/60" />
                            <span>Reason of Being</span>
                          </div>
                          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                            {item.reason}
                          </p>
                        </div>

                        {/* Learn objectives */}
                        <div className="space-y-1 bg-zinc-950/20 border border-zinc-950 rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                            <BookOpen className="w-3 h-3 text-red-500/50" />
                            <span>Learn Goals</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed pl-1">
                            {item.learn || <span className="text-zinc-700 italic">Not specified</span>}
                          </p>
                        </div>

                        {/* Go actions */}
                        <div className="space-y-1 bg-zinc-950/20 border border-zinc-950 rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                            <Compass className="w-3 h-3 text-red-500/50" />
                            <span>Go Action Points</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed pl-1">
                            {item.go || <span className="text-zinc-700 italic">Not specified</span>}
                          </p>
                        </div>

                        {/* Coding specs */}
                        <div className="md:col-span-2 space-y-1 bg-black/40 border border-zinc-950 rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                            <Terminal className="w-3 h-3 text-red-500/50" />
                            <span>Coding Target & Specifications</span>
                          </div>
                          <p className="text-xs text-zinc-400 font-mono bg-zinc-950/40 p-2 rounded border border-zinc-900/30 whitespace-pre-wrap">
                            {item.coding || 'None defined'}
                          </p>
                        </div>

                      </div>

                      {/* Timestamp */}
                      <div className="flex justify-end mt-4 text-[8px] font-mono text-zinc-700 uppercase tracking-widest">
                        Linked: {new Date(item.createdAt).toLocaleString()}
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right Column: Submission Form */}
        <div id="mission-form-section" className="lg:col-span-5">
          <div className="bg-black/80 border-2 border-zinc-900 rounded-2xl p-6 relative">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-red-950/80 border border-red-500/40 rounded px-2.5 py-0.5 font-mono text-[8px] text-red-400 font-black uppercase tracking-widest">
              {editingId ? 'MOD_OVERRIDE_ACTIVE' : 'INTAKE_TERMINAL'}
            </div>

            <h2 className="font-sans font-black text-base text-zinc-200 tracking-wider uppercase mb-5">
              {editingId ? 'Edit Mission Record' : 'Register New Artifact'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Item Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Ethereum Tri-Athlete Core"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950/90 border border-zinc-900 hover:border-zinc-800 focus:border-red-500/60 rounded-xl px-3.5 py-2 text-xs text-zinc-300 font-sans focus:outline-none transition-colors"
                />
              </div>

              {/* Reason of Being */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Reason of Being <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  placeholder="The core purpose, cosmic why, and justification for this artifact..."
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950/90 border border-zinc-900 hover:border-zinc-800 focus:border-red-500/60 rounded-xl px-3.5 py-2 text-xs text-zinc-300 font-sans focus:outline-none transition-colors resize-none custom-scrollbar"
                />
              </div>

              {/* Learn Goals */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Learn Objectives (Educational Scope)
                </label>
                <textarea
                  name="learn"
                  rows={2}
                  placeholder="What knowledge, architectures, and strategies should be gained from this?"
                  value={formData.learn}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950/90 border border-zinc-900 hover:border-zinc-800 focus:border-red-500/60 rounded-xl px-3.5 py-2 text-xs text-zinc-300 font-sans focus:outline-none transition-colors resize-none custom-scrollbar"
                />
              </div>

              {/* Go Steps */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Go Targets (Actions & Deployments)
                </label>
                <textarea
                  name="go"
                  rows={2}
                  placeholder="Specific deployment guidelines, immediate steps, or action directives..."
                  value={formData.go}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950/90 border border-zinc-900 hover:border-zinc-800 focus:border-red-500/60 rounded-xl px-3.5 py-2 text-xs text-zinc-300 font-sans focus:outline-none transition-colors resize-none custom-scrollbar"
                />
              </div>

              {/* Coding Target */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Coding Specifications & Metaphors
                </label>
                <textarea
                  name="coding"
                  rows={3}
                  placeholder="e.g., const runTriathlon = () => { ... } // Strict standard structures only"
                  value={formData.coding}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950/90 border border-zinc-900 hover:border-zinc-800 focus:border-red-500/60 rounded-xl px-3.5 py-2 text-xs text-zinc-300 font-mono focus:outline-none transition-colors resize-y custom-scrollbar"
                />
              </div>

              {/* Submission Controls */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-sans font-extrabold text-[11px] uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-[0_0_12px_rgba(239,68,68,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingId ? 'Apply Update' : 'Initialize Artifact'}</span>
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-sans font-bold text-[11px] uppercase tracking-wider py-2.5 px-4 rounded-xl border border-zinc-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

            </form>

            {/* Quick tips panel */}
            <div className="mt-6 pt-5 border-t border-zinc-900 text-[10px] text-zinc-550 space-y-2">
              <div className="flex items-center gap-1.5 text-zinc-450 uppercase font-bold tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-red-500/40" />
                <span>Validation Guidance</span>
              </div>
              <p className="leading-relaxed">
                Persistent transactions are handled atomically. All fields are evaluated against schema constraint `MissionItem`.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
