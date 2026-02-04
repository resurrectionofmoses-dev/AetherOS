


import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MusicIcon, PlusIcon, XIcon, ChevronUpIcon, ChevronDownIcon, UserIcon, ActivityIcon, SignalIcon, ZapIcon, SpinnerIcon } from './icons';
import type { PlaylistSong, PlaylistCommand } from '../types';

interface CollaborativePlaylistViewProps {
    playlist: PlaylistSong[];
    onPlaylistUpdate: (command: PlaylistCommand) => void;
}

// Generate a unique client ID for this browser tab
const CLIENT_ID = `Operator-${uuidv4().slice(0, 8)}`;

export const CollaborativePlaylistView: React.FC<CollaborativePlaylistViewProps> = ({ playlist, onPlaylistUpdate }) => {
    const [newSongTitle, setNewSongTitle] = useState('');
    const [newSongArtist, setNewSongArtist] = useState('');
    const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const playlistEndRef = useRef<HTMLDivElement>(null);

    // Simulate other connected users (for demonstration purposes)
    useEffect(() => {
        const simulateUsers = () => {
            const users = new Set([CLIENT_ID, 'Operator-Alpha', 'Operator-Beta']);
            setConnectedUsers(Array.from(users).sort());
        };
        simulateUsers();
        const interval = setInterval(simulateUsers, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    // Scroll to bottom when playlist changes
    useEffect(() => {
        playlistEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [playlist]);

    const dispatchCommand = useCallback((command: PlaylistCommand) => {
        setIsUpdating(true);
        // Simulate network latency
        setTimeout(() => {
            onPlaylistUpdate({ ...command, senderId: CLIENT_ID, timestamp: Date.now() });
            setIsUpdating(false);
        }, 300); 
    }, [onPlaylistUpdate]);

    const handleAddSong = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSongTitle.trim() || !newSongArtist.trim() || isUpdating) return;

        const newSong: PlaylistSong = {
            id: uuidv4(),
            title: newSongTitle.trim(),
            artist: newSongArtist.trim(),
            addedBy: CLIENT_ID,
        };

        dispatchCommand({ type: 'add', payload: { song: newSong }, senderId: CLIENT_ID, timestamp: Date.now() });
        setNewSongTitle('');
        setNewSongArtist('');
    };

    const handleReorderSong = useCallback((id: string, direction: 'up' | 'down') => {
        const index = playlist.findIndex(song => song.id === id);
        if (index === -1 || isUpdating) return;

        let newIndex = index;
        if (direction === 'up') {
            newIndex = Math.max(0, index - 1);
        } else { // direction === 'down'
            newIndex = Math.min(playlist.length - 1, index + 1);
        }

        if (newIndex === index) return; // No change needed

        dispatchCommand({ type: 'reorder', payload: { oldIndex: index, newIndex }, senderId: CLIENT_ID, timestamp: Date.now() });
    }, [playlist, isUpdating, dispatchCommand]);

    const handleRemoveSong = useCallback((id: string) => {
        if (isUpdating) return;
        dispatchCommand({ type: 'remove', payload: { id }, senderId: CLIENT_ID, timestamp: Date.now() });
    }, [isUpdating, dispatchCommand]);

    return (
        <div className="h-full flex flex-col bg-[#050510] text-gray-200 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b-8 border-black sticky top-0 z-30 bg-slate-900 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-fuchsia-500/10 border-4 border-fuchsia-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                        <MusicIcon className="w-8 h-8 text-fuchsia-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-3xl text-fuchsia-500 wisdom-glow italic tracking-tighter uppercase">Sonic Conduction</h2>
                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] mt-0.5">Collaborative Playlist | Sync Protocol 0x03E2</p>
                    </div>
                </div>
                <div className="flex gap-6 items-center">
                    <div className="text-right">
                        <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Active Operators</p>
                        <p className="text-xl font-comic-header text-white">{connectedUsers.length}</p>
                    </div>
                    <ActivityIcon className="w-8 h-8 text-fuchsia-900 opacity-30" />
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-5 gap-5 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(217,70,239,0.02)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left Column: Playlist Display */}
                <div className="flex-1 flex flex-col aero-panel bg-black/60 border-fuchsia-500/20 shadow-[9px_9px_40px_rgba(0,0,0,0.4)] overflow-hidden">
                    <div className="p-4 border-b-4 border-black bg-white/5 flex justify-between items-center">
                        <h3 className="font-comic-header text-xl text-white uppercase italic tracking-tighter">Current Flow</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-black uppercase text-fuchsia-400">Total Shards: {playlist.length}</span>
                            {isUpdating && <SpinnerIcon className="w-3 h-3 text-fuchsia-400 animate-spin" />}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {playlist.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                                <MusicIcon className="w-14 h-14 text-gray-600 mb-3" />
                                <p className="text-base font-comic-header text-gray-500 uppercase tracking-wide">Silence in the pit.</p>
                                <p className="text-xs text-gray-600 italic">No sonic shards in the queue.</p>
                            </div>
                        ) : (
                            playlist.map((song, index) => (
                                <div key={song.id} className={`p-3 bg-black/40 rounded-lg border-2 border-black flex items-center justify-between gap-3 transition-all duration-300 ${song.addedBy === CLIENT_ID ? 'border-fuchsia-600/50' : 'border-white/5'}`}>
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-base font-comic-header text-fuchsia-400 flex-shrink-0 w-6 text-center">{index + 1}.</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-sm text-white truncate uppercase tracking-tight">{song.title}</p>
                                            <p className="text-xs text-gray-400 truncate italic">{song.artist}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <span className={`text-[6px] px-1 py-0.5 rounded-full border border-fuchsia-900/50 text-fuchsia-400 font-black uppercase ${song.addedBy === CLIENT_ID ? 'bg-fuchsia-950/30' : 'bg-gray-900'}`}>{song.addedBy === CLIENT_ID ? 'YOU' : song.addedBy.replace('Operator-', '')}</span>
                                        <div className="flex flex-col gap-0.5">
                                            <button 
                                                onClick={() => handleReorderSong(song.id, 'up')} 
                                                disabled={index === 0 || isUpdating}
                                                className="p-0.5 bg-gray-800 text-gray-400 hover:text-white rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronUpIcon className="w-3 h-3" />
                                            </button>
                                            <button 
                                                onClick={() => handleReorderSong(song.id, 'down')} 
                                                disabled={index === playlist.length - 1 || isUpdating}
                                                className="p-0.5 bg-gray-800 text-gray-400 hover:text-white rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronDownIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveSong(song.id)}
                                            disabled={isUpdating}
                                            className="p-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <XIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={playlistEndRef} />
                    </div>
                </div>

                {/* Right Column: Add Song & Connected Users */}
                <div className="lg:w-64 flex-shrink-0 flex flex-col gap-5">
                    <div className="aero-panel p-4 bg-slate-900 border-fuchsia-600/30 shadow-[6px_6px_0_0_rgba(0,0,0,0.8)]">
                        <h3 className="font-comic-header text-xl text-white uppercase italic tracking-tight mb-4 flex items-center gap-2">
                            <PlusIcon className="w-4 h-4 text-fuchsia-500" /> Inject Shard
                        </h3>
                        <form onSubmit={handleAddSong} className="space-y-3">
                            <input 
                                type="text"
                                value={newSongTitle}
                                onChange={e => setNewSongTitle(e.target.value)}
                                placeholder="Song Title (e.g., Quantum Echoes)"
                                className="w-full bg-black/60 border-2 border-black rounded-lg p-2.5 text-white font-mono text-xs placeholder:text-gray-800 focus:ring-0 outline-none focus:border-fuchsia-600 transition-all"
                                disabled={isUpdating}
                                required
                            />
                            <input 
                                type="text"
                                value={newSongArtist}
                                onChange={e => setNewSongArtist(e.target.value)}
                                placeholder="Artist (e.g., The Maestro)"
                                className="w-full bg-black/60 border-2 border-black rounded-lg p-2.5 text-white font-mono text-xs placeholder:text-gray-800 focus:ring-0 outline-none focus:border-fuchsia-600 transition-all"
                                disabled={isUpdating}
                                required
                            />
                            <button
                                type="submit"
                                disabled={!newSongTitle.trim() || !newSongArtist.trim() || isUpdating}
                                className="vista-button w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-3 text-sm font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-[2px_2px_0_0_#000] active:translate-y-0.5 disabled:opacity-50"
                            >
                                {isUpdating ? <SpinnerIcon className="w-3.5 h-3.5" /> : <ZapIcon className="w-3.5 h-3.5" />}
                                <span>{isUpdating ? 'CONDUCTING...' : 'ADD TO FLOW'}</span>
                            </button>
                        </form>
                    </div>

                    <div className="flex-1 aero-panel p-4 bg-black/40 border-white/5 overflow-hidden flex flex-col">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                            <UserIcon className="w-3 h-3 text-fuchsia-500" /> Active Operator Nodes
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                            {connectedUsers.map(user => (
                                <div key={user} className={`p-2 bg-black/40 border border-white/5 rounded-md flex items-center gap-2 ${user === CLIENT_ID ? 'border-fuchsia-500/50' : ''}`}>
                                    <SignalIcon className={`w-3 h-3 ${user === CLIENT_ID ? 'text-fuchsia-400' : 'text-gray-600'} animate-pulse`} />
                                    <span className="text-xs font-bold text-white truncate">{user === CLIENT_ID ? 'You (Maestro)' : user.replace('Operator-', 'Guest-')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-900 border-t-8 border-black flex items-center justify-between z-10 shadow-[0_-2px_6px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-5">
                   <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-fuchsia-500 animate-ping" />
                        <span className="text-[8px] font-black text-fuchsia-400 uppercase tracking-widest">Conjunction Flow: STABLE</span>
                   </div>
                   <div className="text-[8px] text-gray-600 font-mono italic">
                      Latency: ~300ms | Payload: {playlist.length} Shards
                   </div>
                </div>
                <div className="text-[8px] text-gray-700 uppercase font-black italic tracking-widest">
                   Conduction with pleasure and absolute authority.
                </div>
            </div>
        </div>
    );
};
