
import React, { useState } from 'react';
import type { CustomCommand, PinnedItem, PinType } from '../types';
import { TerminalIcon, XIcon, PinIcon } from './icons';

interface CommandDeckProps {
  commands: CustomCommand[];
  onAddCommand: (title: string, text: string) => void;
  onDeleteCommand: (id: string) => void;
  onExecuteCommand: (text: string) => void;
  pinnedItems: PinnedItem[];
  onTogglePin: (item: { referenceId: string; type: PinType; title: string; content?: string; }) => void;
}

export const CommandDeck: React.FC<CommandDeckProps> = ({ commands, onAddCommand, onDeleteCommand, onExecuteCommand, pinnedItems, onTogglePin }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');

  const handleAddCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;
    onAddCommand(newTitle, newText);
    setNewTitle('');
    setNewText('');
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg">
      <div className="p-4 border-b-4 border-black sticky top-0 z-10 bg-gray-800 rounded-t-lg">
        <h2 className="font-comic-header text-3xl text-white">AETHEROS Control</h2>
        <p className="text-gray-400 -mt-1">Define, manage, and execute custom directives for AETHEROS.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* New Command Form */}
        <div className="lg:w-1/3 flex-shrink-0">
            <form onSubmit={handleAddCommand} className="comic-panel bg-gray-800/50 p-4 h-full flex flex-col">
                <h3 className="font-comic-header text-2xl text-violet-300 border-b-2 border-black pb-2 mb-3">New Directive</h3>
                <div className="space-y-4 flex-1 flex flex-col">
                    <div>
                        <label htmlFor="cmd-title" className="block text-sm font-bold text-gray-300 mb-1">Title</label>
                        <input
                            id="cmd-title"
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="e.g., 'Morning Commute Prep'"
                            className="w-full bg-gray-900/80 border-2 border-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200"
                            required
                        />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label htmlFor="cmd-text" className="block text-sm font-bold text-gray-300 mb-1">Directive Text</label>
                        <textarea
                            id="cmd-text"
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder="e.g., 'Set cabin temp to 20°C, play my 'Focus' playlist, and navigate to work.'"
                            className="w-full flex-1 bg-gray-900/80 border-2 border-black rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-200"
                            required
                        />
                    </div>
                </div>
                 <button type="submit" disabled={!newTitle.trim() || !newText.trim()} className="comic-button bg-violet-600 hover:bg-violet-700 text-white w-full mt-4 py-2">
                    Save Directive
                </button>
            </form>
        </div>
        
        {/* Command List */}
        <div className="flex-1 flex flex-col comic-panel bg-black/50 overflow-hidden">
            <h3 className="font-comic-header text-2xl text-violet-300 border-b-2 border-black p-3">Saved Directives</h3>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {commands.length === 0 ? (
                    <div className="text-center text-gray-500 italic p-6">
                        No custom directives saved. Create one to get started!
                    </div>
                ) : (
                    commands.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(cmd => {
                        const isPinned = pinnedItems.some(p => p.type === 'command' && p.referenceId === cmd.id);
                        return (
                            <div key={cmd.id} className="bg-gray-800/50 rounded-lg border-2 border-black p-3 fade-in">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-bold text-lg text-white">{cmd.title}</h4>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => onTogglePin({ referenceId: cmd.id, type: 'command', title: cmd.title, content: cmd.text })} className="p-1 text-gray-500 hover:text-white" title={isPinned ? "Unpin from Mainframe" : "Pin to Mainframe"}>
                                            <PinIcon className={`w-4 h-4 ${isPinned ? 'text-violet-400 fill-current' : ''}`} />
                                        </button>
                                        <button onClick={() => onDeleteCommand(cmd.id)} className="text-gray-500 hover:text-red-400 p-1">
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mt-1 mb-3 font-mono bg-black/30 p-2 rounded-md border border-black">{cmd.text}</p>
                                <div className="text-right">
                                    <button onClick={() => onExecuteCommand(cmd.text)} className="comic-button bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 text-sm inline-flex items-center gap-2">
                                        <TerminalIcon className="w-4 h-4" />
                                        Execute
                                    </button>
                                </div>
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
