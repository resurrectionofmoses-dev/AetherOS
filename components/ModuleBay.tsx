
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { SavedModule, PinnedItem, PinType } from '../types';
import { ImplementationFileBlock } from './ImplementationFileBlock';
import { PackageIcon, XIcon, PinIcon, ActivityIcon, SpinnerIcon, SearchIcon } from './icons';

interface SimulationTerminalProps {
    module: SavedModule;
    onClose: () => void;
}

const SimulationTerminal: React.FC<SimulationTerminalProps> = ({ module, onClose }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isSimulating, setIsSimulating] = useState(true);

    useEffect(() => {
        const simulationSteps = [
            `> Initializing environment for module: ${module.name}`,
            `> Validating checksums for ${module.files.length} files...`,
            "> Logic Analysis: " + module.files[0]?.filename + " loaded.",
            "> Starting execution sequence...",
            "> SYSLOG: Mapping virtual memory address 0x00A3F1",
            "> SYSLOG: Establishing secure AetherOS handshake...",
            "> MODULE_OUTPUT: System parameters within normal range.",
            "> MODULE_OUTPUT: Executing logic payload...",
            "> " + module.name + " simulation successfully completed.",
            "> Session closed."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < simulationSteps.length) {
                setLogs(prev => [...prev, simulationSteps[i]]);
                i++;
            } else {
                setIsSimulating(false);
                clearInterval(interval);
            }
        }, 600);
        return () => clearInterval(interval);
    }, [module]);

    return (
        <div className="absolute inset-0 z-20 bg-black/90 flex flex-col p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center border-b border-green-500/50 pb-2 mb-4">
                <div className="flex items-center gap-2 text-green-400 font-mono">
                    <ActivityIcon className="w-5 h-5" />
                    <span className="font-bold">AetherOS Runtime Simulator</span>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white"><XIcon className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-sm text-green-500 space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className="animate-in slide-in-from-left-2 duration-200">{log}</div>
                ))}
                {isSimulating && (
                    <div className="flex items-center gap-2 mt-2 italic text-green-700">
                        <SpinnerIcon className="w-4 h-4" />
                        <span>Processing kernel signals...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ModuleBayProps {
  modules: SavedModule[];
  onDeleteModule: (id: string) => void;
  pinnedItems: PinnedItem[];
  onTogglePin: (item: { referenceId: string; type: PinType; title: string; }) => void;
}

export const ModuleBay: React.FC<ModuleBayProps> = ({ modules, onDeleteModule, pinnedItems, onTogglePin }) => {
  const [selectedModule, setSelectedModule] = useState<SavedModule | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModules = useMemo(() => {
    return modules.filter(module =>
        module.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [modules, searchTerm]);

  useEffect(() => {
    if (!selectedModule || !filteredModules.find(m => m.id === selectedModule.id)) {
        setSelectedModule(filteredModules[0] || null);
        setIsSimulating(false);
    }
  }, [filteredModules, selectedModule]);

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg relative">
      {isSimulating && selectedModule && (
          <SimulationTerminal module={selectedModule} onClose={() => setIsSimulating(false)} />
      )}
      <div className="p-4 border-b-4 border-black sticky top-0 z-10 bg-gray-800 rounded-t-lg">
        <h2 className="font-comic-header text-3xl text-white">Module Bay</h2>
        <p className="text-gray-400 -mt-1">Storage and browser for generated software modules.</p>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        <div className="lg:w-1/3 flex-shrink-0 comic-panel bg-black/50 overflow-hidden flex flex-col">
          
          <div className="p-4 bg-slate-900/80 border-b-2 border-black">
              <h3 className="font-comic-header text-2xl text-violet-300 mb-4 flex items-center gap-3">
                  <SearchIcon className="w-5 h-5 text-violet-500" /> Neural Filter Array
              </h3>
              <input
                  type="text"
                  placeholder="Search Module Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/60 border-2 border-black rounded-xl p-3 text-white font-mono text-sm placeholder:text-gray-800 focus:ring-0 outline-none focus:border-violet-600 transition-all"
              />
              {searchTerm && (
                  <button
                      onClick={() => setSearchTerm('')}
                      className="w-full py-2 mt-3 bg-gray-800 hover:bg-gray-700 text-gray-400 font-black uppercase text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                      <XIcon className="w-4 h-4" /> Reset Search
                  </button>
              )}
          </div>

          <h3 className="font-comic-header text-2xl text-violet-300 border-b-2 border-black p-3">Stored Modules</h3>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredModules.length === 0 ? (
              <div className="text-center text-gray-500 italic p-6">
                {searchTerm ? `No modules found matching "${searchTerm}".` : 'No modules stored. Generate one in the Software Workshop!'}
              </div>
            ) : (
              filteredModules.map(module => {
                const isPinned = pinnedItems.some(p => p.type === 'module' && p.referenceId === module.id);
                return (
                    <div key={module.id} className={`w-full text-left p-3 rounded-lg border-2 border-black transition-colors flex justify-between items-center ${selectedModule?.id === module.id ? 'bg-violet-800/50' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
                        <button onClick={() => {setSelectedModule(module); setIsSimulating(false);}} className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{module.name}</p>
                            <p className="text-xs text-gray-400">{module.timestamp.toLocaleString()}</p>
                        </button>
                        <button onClick={() => onTogglePin({ referenceId: module.id, type: 'module', title: module.name })} className="p-2 text-gray-500 hover:text-white flex-shrink-0">
                            <PinIcon className={`w-5 h-5 ${isPinned ? 'text-violet-400 fill-current' : ''}`} />
                        </button>
                    </div>
                )
              })
            )}
          </div>
        </div>

        <div className="flex-1 comic-panel bg-gray-800/50 overflow-hidden flex flex-col">
          {selectedModule ? (
            <>
              <div className="p-3 border-b-2 border-black flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-comic-header text-2xl text-violet-300 truncate">{selectedModule.name}</h3>
                  <p className="text-xs text-gray-500">Files: {selectedModule.files.length}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsSimulating(true)} className="comic-button bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4" /> Run Simulation
                    </button>
                    <button onClick={() => onDeleteModule(selectedModule.id)} className="comic-button bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm">
                        Delete
                    </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {selectedModule.files.map((file, index) => (
                  <ImplementationFileBlock key={index} file={file} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
              <PackageIcon className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-bold">No Module Selected</h3>
              <p className="text-sm italic mt-2">Select a module from the left panel to view its contents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
