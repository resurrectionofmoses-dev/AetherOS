
import React, { useState, useMemo } from 'react';
import type { ArchiveEntry } from '../types';
import { XIcon, WarningIcon } from './icons';

interface SystemArchivesProps {
  archives: ArchiveEntry[];
  onAddArchive: (title: string, text: string) => void;
  onDeleteArchive: (id: string) => void;
}

export const SystemArchives: React.FC<SystemArchivesProps> = ({ archives, onAddArchive, onDeleteArchive }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [directivesOnTop, setDirectivesOnTop] = useState(true);

  const handleAddArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;
    onAddArchive(newTitle, newText);
    setNewTitle('');
    setNewText('');
  };

  const sortedArchives = useMemo(() => {
    return [...archives].sort((a, b) => {
      if (directivesOnTop) {
        const aDir = a.isDirective ? 1 : 0;
        const bDir = b.isDirective ? 1 : 0;
        if (aDir !== bDir) {
          return bDir - aDir;
        }
      }
      
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [archives, sortOrder, directivesOnTop]);

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg">
      <div className="p-4 border-b-4 border-black sticky top-0 z-10 bg-gray-800 rounded-t-lg">
        <h2 className="font-comic-header text-3xl text-white">System Archives</h2>
        <p className="text-gray-400 -mt-1">A persistent log of important system directives and memories.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* New Entry Form */}
        <div className="lg:w-1/3 flex-shrink-0">
            <form onSubmit={handleAddArchive} className="comic-panel bg-gray-800/50 p-4 h-full flex flex-col">
                <h3 className="font-comic-header text-2xl text-violet-300 border-b-2 border-black pb-2 mb-3">New Archive Entry</h3>
                <div className="space-y-4 flex-1 flex flex-col">
                    <div>
                        <label htmlFor="archive-title" className="block text-sm font-bold text-gray-300 mb-1">Title</label>
                        <input
                            id="archive-title"
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="e.g., 'Mission Log'"
                            className="w-full bg-gray-900/80 border-2 border-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200"
                            required
                        />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label htmlFor="archive-text" className="block text-sm font-bold text-gray-300 mb-1">Entry Text</label>
                        <textarea
                            id="archive-text"
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder="Enter important text to save..."
                            className="w-full flex-1 bg-gray-900/80 border-2 border-black rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200"
                            required
                        />
                    </div>
                </div>
                 <button type="submit" disabled={!newTitle.trim() || !newText.trim()} className="comic-button bg-violet-600 hover:bg-violet-700 text-white w-full mt-4 py-2">
                    Save Entry
                </button>
            </form>
        </div>
        
        {/* Archive List */}
        <div className="flex-1 flex flex-col comic-panel bg-black/50 overflow-hidden">
            <div className="border-b-2 border-black p-3 flex flex-wrap items-center justify-between gap-3 bg-gray-950/20">
                <h3 className="font-comic-header text-2xl text-violet-300">Saved Entries</h3>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setDirectivesOnTop(!directivesOnTop)}
                        className={`comic-button font-mono px-2.5 py-1 text-[10px] uppercase font-black transition-all ${
                            directivesOnTop 
                                ? 'bg-yellow-400 text-black border-black border-2 hover:bg-yellow-300' 
                                : 'bg-gray-800 text-gray-400 border-black border-2 hover:bg-gray-700'
                        }`}
                        title="Show Core Directives before regular system archive logs"
                    >
                        Directives First: {directivesOnTop ? 'ON' : 'OFF'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                        className="comic-button bg-violet-600 hover:bg-violet-500 text-white font-mono px-3 py-1 border-2 border-black text-[10px] font-black uppercase transition-all"
                    >
                        Sort: {sortOrder === 'desc' ? 'Newest ⬇' : 'Oldest ⬆'}
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {sortedArchives.length === 0 ? (
                    <div className="text-center text-gray-500 italic p-6">
                        No entries saved in the archive.
                    </div>
                ) : (
                    sortedArchives.map(entry => {
                        const isDirective = entry.isDirective;
                        return (
                            <div key={entry.id} className={`bg-gray-800/50 rounded-lg border-2 p-3 fade-in ${isDirective ? 'border-yellow-400' : 'border-black'}`}>
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <h4 className="font-bold text-lg text-white">{entry.title}</h4>
                                        {isDirective && (
                                            <div className="flex items-center gap-1 text-xs text-yellow-300 font-bold mt-1">
                                                <WarningIcon className="w-4 h-4"/>
                                                <span>CORE DIRECTIVE</span>
                                            </div>
                                        )}
                                    </div>
                                    {!isDirective && (
                                        <button onClick={() => onDeleteArchive(entry.id)} className="text-gray-500 hover:text-red-400 p-1">
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-300 mt-2 mb-2 font-mono bg-black/30 p-2 rounded-md border border-black">{entry.text}</p>
                                <p className="text-xs text-gray-500 text-right">Saved: {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}</p>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
