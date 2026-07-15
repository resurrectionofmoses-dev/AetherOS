import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SendIcon, ShieldIcon, UserIcon, TrashIcon, ClockIcon, LockIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { PrivateMessage, User } from '../types';
import { safeStorage } from '../services/safeStorage';
import { v4 as uuidv4 } from 'uuid';
import { QuarantinedItem } from '../utils';
import { ShieldAlert, Trash2, ShieldCheck, Database, Server } from 'lucide-react';

export const ModeratorLoungeView: React.FC = () => {
    const { user, userRegistry } = useAuth();
    const [messages, setMessages] = useState<PrivateMessage[]>([]);
    const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // Quarantine tab states
    const [activeTab, setActiveTab] = useState<'comms' | 'quarantine'>('comms');
    const [quarantineItems, setQuarantineItems] = useState<QuarantinedItem[]>([]);

    useEffect(() => {
        const loadMessages = async () => {
            const saved = await safeStorage.getItem('aetheros_private_messages');
            if (saved) {
                setMessages(JSON.parse(saved));
            }
            setIsLoading(false);
        };
        loadMessages();
    }, []);

    const loadQuarantine = () => {
        try {
            const saved = localStorage.getItem('quarantine_langchang');
            if (saved) {
                setQuarantineItems(JSON.parse(saved));
            } else {
                setQuarantineItems([]);
            }
        } catch (e) {
            console.error('Failed to load quarantine items:', e);
        }
    };

    useEffect(() => {
        loadQuarantine();
    }, [activeTab]);

    const saveMessages = async (updatedMessages: PrivateMessage[]) => {
        await safeStorage.setItem('aetheros_private_messages', JSON.stringify(updatedMessages));
    };

    const handleSendMessage = async () => {
        if (!user || !selectedRecipientId || !newMessage.trim()) return;

        const message: PrivateMessage = {
            id: uuidv4(),
            senderId: user.uid,
            senderName: user.displayName || 'Operator',
            recipientId: selectedRecipientId,
            content: newMessage.trim(),
            timestamp: Date.now(),
            isRead: false
        };

        const updated = [...messages, message];
        setMessages(updated);
        await saveMessages(updated);
        setNewMessage('');
    };

    const handleDeleteMessage = async (id: string) => {
        const updated = messages.filter(m => m.id !== id);
        setMessages(updated);
        await saveMessages(updated);
    };

    const handlePurgeQuarantineItem = (id: string) => {
        const updated = quarantineItems.filter(item => item.id !== id);
        setQuarantineItems(updated);
        localStorage.setItem('quarantine_langchang', JSON.stringify(updated));
    };

    const handleClearAllQuarantine = () => {
        setQuarantineItems([]);
        localStorage.removeItem('quarantine_langchang');
    };

    const moderators = userRegistry.filter(u => (u.role === 'moderator' || u.role === 'admin') && u.uid !== user?.uid);

    const conversation = messages.filter(m => 
        (m.senderId === user?.uid && m.recipientId === selectedRecipientId) ||
        (m.senderId === selectedRecipientId && m.recipientId === user?.uid)
    ).sort((a, b) => a.timestamp - b.timestamp);

    if (isLoading) return <div className="h-full flex items-center justify-center text-blue-500 font-mono animate-pulse">DECRYPTING_COMMS_LATTICE...</div>;

    return (
        <div className="h-full flex flex-col bg-[#050510] relative overflow-hidden animate-in fade-in duration-300">
            {/* Security Header */}
            <header className="p-6 border-b-4 border-blue-900/30 bg-blue-950/10 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-black text-blue-400 italic tracking-tighter uppercase flex items-center gap-3">
                        <ShieldIcon className="w-6 h-6" />
                        Moderator Lounge
                    </h2>
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.3em] mt-1">
                        Secure Comms Lattice // Zero-Trust Verified
                    </p>
                </div>
                
                {/* Tab switcher */}
                <div className="flex bg-black/60 p-1 border-2 border-blue-900/40 rounded-xl gap-2">
                    <button 
                        onClick={() => setActiveTab('comms')}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'comms' ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]' : 'text-blue-400 hover:text-white'}`}
                    >
                        Encrypted Channels
                    </button>
                    <button 
                        onClick={() => setActiveTab('quarantine')}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeTab === 'quarantine' ? 'bg-red-600 text-white shadow-[0_2px_10px_rgba(220,38,38,0.4)]' : 'text-red-400 hover:text-white'}`}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        Quarantine Langchang
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Active Channels</span>
                        <span className="text-xl font-comic-header text-blue-500">{moderators.length + 1} Authorized Nodes</span>
                    </div>
                    <div className="p-3 rounded-lg border-2 border-blue-600/20 bg-blue-900/10">
                        <LockIcon className="w-5 h-5 text-blue-500" />
                    </div>
                </div>
            </header>

            {activeTab === 'comms' ? (
                <div className="flex-1 flex overflow-hidden">
                    {/* Recipients List */}
                    <div className="w-72 border-r-4 border-blue-900/20 bg-black/40 p-4 overflow-y-auto custom-scrollbar">
                        <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 px-2">Authorized Entities</h3>
                        <div className="space-y-2">
                            {moderators.map(mod => {
                                const unreadCount = messages.filter(m => m.senderId === mod.uid && m.recipientId === user?.uid && !m.isRead).length;
                                return (
                                    <button
                                        key={mod.uid}
                                        onClick={() => setSelectedRecipientId(mod.uid)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border-2 ${selectedRecipientId === mod.uid ? 'bg-blue-600 border-blue-400' : 'bg-black/60 border-white/5 hover:border-blue-600/40'}`}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center border-2 border-blue-600/20 flex-shrink-0">
                                            <UserIcon className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-black uppercase tracking-widest truncate ${selectedRecipientId === mod.uid ? 'text-white' : 'text-blue-400'}`}>
                                                    {mod.displayName}
                                                </span>
                                                {unreadCount > 0 && (
                                                    <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[8px] text-gray-500 uppercase block mt-0.5">{mod.role}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-black/20">
                        {selectedRecipientId ? (
                            <>
                                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                                    {conversation.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-4 rounded-2xl border-2 relative group ${msg.senderId === user?.uid ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/60 border-blue-900/50 text-blue-100'}`}>
                                                <div className="flex items-center justify-between gap-4 mb-2">
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                                                        {msg.senderId === user?.uid ? 'SENT' : 'RECEIVED'} // {new Date(msg.timestamp).toLocaleTimeString()}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400"
                                                    >
                                                        <TrashIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-mono whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {conversation.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-20">
                                            <LockIcon className="w-24 h-24 mb-4" />
                                            <span className="text-xs font-black uppercase tracking-[0.5em]">No Secure Logs Found</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-black/40 border-t-4 border-blue-900/20">
                                    <div className="flex items-center gap-4">
                                        <textarea
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Transmit secure directive..."
                                            className="flex-1 bg-black border-2 border-blue-900/50 rounded-xl p-4 text-blue-100 text-xs focus:border-blue-500 outline-none transition-all placeholder:text-blue-900/50 resize-none font-mono"
                                            rows={2}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            className="p-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-xl transition-all shadow-[0_4px_0_0_#2563eb] active:translate-y-1 active:shadow-none"
                                        >
                                            <SendIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                                <ShieldIcon className="w-32 h-32 text-blue-900 mb-6" />
                                <h3 className="text-2xl font-black text-blue-900 uppercase italic tracking-tighter">Secure Lattice Standby</h3>
                                <p className="text-xs text-blue-900/60 max-w-sm mt-2 uppercase tracking-widest leading-loose">
                                    Select an authorized operator node from the registry to initiate encrypted communication.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Quarantine Langchang Panel */
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col bg-[#0b0303]/40">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                            <h3 className="text-lg font-black text-red-400 uppercase tracking-wider flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                                Isolated Threat Repositories
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase mt-1 tracking-widest">
                                Containment Sweep Active // Scanning forum posts, user profiles, emails & communications
                            </p>
                        </div>
                        {quarantineItems.length > 0 && (
                            <button 
                                onClick={handleClearAllQuarantine}
                                className="px-4 py-2 bg-red-950/40 border-2 border-red-800/60 hover:bg-red-900/30 text-red-400 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                            >
                                Clear Quarantine Records
                            </button>
                        )}
                    </div>

                    {quarantineItems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 border-4 border-dashed border-zinc-900/40 rounded-3xl bg-black/20 text-center">
                            <ShieldCheck className="w-20 h-20 text-emerald-500/40 mb-4" />
                            <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Lattice Integrity Intact</h4>
                            <p className="text-xs text-zinc-600 uppercase max-w-sm mt-2 tracking-wider leading-relaxed">
                                No compromised Vector Security payloads or David Ross entities have been detected in active stasis pools.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {quarantineItems.map((item) => (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-5 rounded-2xl border-2 border-red-900/40 bg-black/60 relative group flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3 border-b border-red-950/50 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] bg-red-950 text-red-400 border border-red-800/40 px-2 py-0.5 rounded font-mono font-bold">
                                                        {item.id}
                                                    </span>
                                                    <span className="text-[9px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                                        {item.sourceType} origin
                                                    </span>
                                                </div>
                                                <span className="text-[9px] text-zinc-600 font-mono">
                                                    {new Date(item.timestamp).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="text-xs font-mono text-red-400 font-black mb-2 flex items-center gap-2">
                                                <Server className="w-3.5 h-3.5" />
                                                {item.reason}
                                            </div>

                                            <div className="p-3 rounded-lg bg-black/80 border border-zinc-900 text-[11px] font-mono text-zinc-400 max-h-48 overflow-y-auto custom-scrollbar break-all">
                                                {typeof item.originalData === 'string' ? item.originalData : JSON.stringify(item.originalData, null, 2)}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-red-950/30 pt-3">
                                            <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-1">
                                                <Database className="w-3 h-3" />
                                                Storage: local_quarantine_langchang
                                            </span>
                                            <button 
                                                onClick={() => handlePurgeQuarantineItem(item.id)}
                                                className="p-2 bg-red-950/40 border border-red-900/40 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all"
                                                title="Purge permanently"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            {/* Footer Intel */}
            <footer className="px-6 py-2 border-t-2 border-blue-900/20 flex items-center justify-between bg-black/60">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Encryption: AES-256V Simulation</span>
                    </div>
                    <span className="text-[8px] text-gray-700 font-mono italic">SESSIONID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                </div>
                <div className="text-[8px] text-gray-700 font-black uppercase italic tracking-[0.2em]">Authorized Personnel Only // Breach Protocol Active</div>
            </footer>
        </div>
    );
};
