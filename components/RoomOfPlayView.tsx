
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { SavedModule, PinnedItem, PinType, ModuleMix } from '../types';
import { ImplementationFileBlock } from './ImplementationFileBlock';
// Fixed CheckCircleIcon, FlaskIcon and ZapIcon imports
import { PackageIcon, XIcon, PinIcon, ActivityIcon, SpinnerIcon, SearchIcon, ZapIcon, MusicIcon, FlaskIcon, CodeIcon, ChevronDownIcon, PlusIcon, CheckCircleIcon } from './icons';
import { generateSoftwareModule } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
// Added GoogleGenAI import
import { GoogleGenAI } from "@google/genai";

interface SimulationTerminalProps {
    module: SavedModule;
    onClose: () => void;
}

const SimulationTerminal: React.FC<SimulationTerminalProps> = ({ module, onClose }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isSimulating, setIsSimulating] = useState(true);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const simulationSteps = [
            `> Initializing environment for module: ${module.name}`,
            `> Validating checksums for ${module.files.length} files...`,
            "> Logic Analysis: " + module.files[0]?.filename + " loaded.",
            "> Starting execution sequence...",
            "> SYSLOG: Mapping virtual memory address 0x00A3F1",
            "> SYSLOG: Establishing secure AetherOS handshake...",
            "> MODULE_OUTPUT: System parameters within normal range.",
            "  [IGNITE_SISTERS_SHIELD] Real-time heuristic anomaly detection active.",
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

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

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
            <div ref={logEndRef} />
        </div>
    );
};

interface RoomOfPlayViewProps {
  modules: SavedModule[];
  onDeleteModule: (id: string) => void;
  pinnedItems: PinnedItem[];
  onTogglePin: (item: { referenceId: string; type: PinType; title: string; }) => void;
  moduleMixes: ModuleMix[];
  onAddModuleMix: (modules: SavedModule[], mixResult: string) => void;
}

export const RoomOfPlayView: React.FC<RoomOfPlayViewProps> = ({ modules, onDeleteModule, pinnedItems, onTogglePin, moduleMixes, onAddModuleMix }) => {
  const [selectedModule, setSelectedModule] = useState<SavedModule | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mixMode, setMixMode] = useState(false);
  const [selectedMixModules, setSelectedMixModules] = useState<SavedModule[]>([]);
  const [isMixing, setIsMixing] = useState(false);
  const [mixResultText, setMixResultText] = useState('');

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

  const handleToggleMixMode = () => {
    setMixMode(prev => {
        if (prev) { // Exiting mix mode, clear selections
            setSelectedMixModules([]);
            setMixResultText('');
        }
        return !prev;
    });
  };

  const handleSelectMixModule = (module: SavedModule) => {
    setSelectedMixModules(prev => {
        if (prev.some(m => m.id === module.id)) {
            return prev.filter(m => m.id !== module.id);
        } else if (prev.length < 2) {
            return [...prev, module];
        }
        return prev;
    });
  };

  const handleMixModules = async () => {
    if (selectedMixModules.length !== 2 || isMixing) return;
    setIsMixing(true);
    setMixResultText('Synthesizing new neural blend...');

    const prompt = `Mix the functionalities of these two software modules:
    Module 1: Name: ${selectedMixModules[0].name}, Code: \`${selectedMixModules[0].files[0]?.code || 'N/A'}\`
    Module 2: Name: ${selectedMixModules[1].name}, Code: \`${selectedMixModules[1].files[0]?.code || 'N/A'}\`
    
    Describe the synergistic outcome and potential new capabilities of this blended module. Provide a conceptual name for the mixed module. Max 200 words.`;

    try {
        // Initialize ai with proper config
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: "You are the Aether Maestro. Provide creative, conceptual descriptions of mixed software modules, focusing on synergy and new features. Use vivid, evocative language.",
                temperature: 0.8,
                maxOutputTokens: 200,
                thinkingConfig: { thinkingBudget: 100 }
            }
        });
        const result = response.text || "Failed to conceptualize the mix.";
        setMixResultText(result);
        onAddModuleMix(selectedMixModules, result);
    } catch (error) {
        console.error("Module mix failed:", error);
        setMixResultText("Conjunction failed. Semantic noise prevented a clear blend.");
    } finally {
        setIsMixing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg relative">
      {isSimulating && selectedModule && (
          <SimulationTerminal module={selectedModule} onClose={() => setIsSimulating(false)} />
      )}
      <div className="p-4 border-b-4 border-black sticky top-0 z-10 bg-gray-800 rounded-t-lg">
        <h2 className="font-comic-header text-3xl text-white">Room of Play</h2>
        <p className="text-gray-400 -mt-1">Where modules dance and logic blends.</p>
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
               <button 
                  onClick={handleToggleMixMode}
                  className={`w-full py-2 mt-3 font-black uppercase text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all ${mixMode ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
              >
                  <FlaskIcon className="w-4 h-4" /> {mixMode ? 'Exit Mix Mode' : 'Enter Mix Mode'}
              </button>
          </div>

          <h3 className="font-comic-header text-2xl text-violet-300 border-b-2 border-black p-3">Stored Modules</h3>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredModules.length === 0 ? (
              <div className="text-center text-gray-500 italic p-6">
                {searchTerm ? `No modules found matching "${searchTerm}".` : 'No modules stored. Generate one in the Engineering Lab!'}
              </div>
            ) : (
              filteredModules.map(module => {
                const isPinned = pinnedItems.some(p => p.type === 'module' && p.referenceId === module.id);
                const isSelectedForMix = selectedMixModules.some(m => m.id === module.id);
                return (
                    <div 
                        key={module.id} 
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors flex justify-between items-center ${
                            selectedModule?.id === module.id ? 'bg-violet-800/50' : 'bg-gray-800/50 hover:bg-gray-700/50'
                        } ${isSelectedForMix && mixMode ? 'border-fuchsia-500 bg-fuchsia-900/30' : 'border-black'}`}
                    >
                        <button onClick={() => { mixMode ? handleSelectMixModule(module) : setSelectedModule(module); setIsSimulating(false); }} className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{module.name}</p>
                            <p className="text-xs text-gray-400">{module.timestamp.toLocaleString()}</p>
                        </button>
                        {!mixMode && (
                            <button onClick={() => onTogglePin({ referenceId: module.id, type: 'module', title: module.name })} className="p-2 text-gray-500 hover:text-white flex-shrink-0">
                                <PinIcon className={`w-5 h-5 ${isPinned ? 'text-violet-400 fill-current' : ''}`} />
                            </button>
                        )}
                        {mixMode && (
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelectedForMix ? 'bg-fuchsia-500 border-fuchsia-400' : 'border-gray-600'}`}>
                                {isSelectedForMix && <CheckCircleIcon className="w-3 h-3 text-white" />}
                             </div>
                        )}
                    </div>
                )
              })
            )}
          </div>
        </div>

        <div className="flex-1 comic-panel bg-gray-800/50 overflow-hidden flex flex-col">
          {mixMode ? (
              <>
                <div className="p-3 border-b-2 border-black flex justify-between items-start gap-4">
                    <h3 className="font-comic-header text-2xl text-fuchsia-300 truncate flex items-center gap-2">
                        <FlaskIcon className="w-5 h-5" /> Module Mixer
                    </h3>
                    <button 
                        onClick={handleMixModules} 
                        disabled={selectedMixModules.length !== 2 || isMixing}
                        className={`comic-button px-4 py-2 text-sm flex items-center gap-2 ${selectedMixModules.length === 2 ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                    >
                        {isMixing ? <SpinnerIcon className="w-4 h-4" /> : <ZapIcon className="w-4 h-4" />}
                        <span>{isMixing ? 'MIXING...' : 'Mix Scripts'}</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    <div className="p-4 bg-black/60 rounded-lg border-2 border-black">
                        <h4 className="text-[10px] font-black uppercase text-fuchsia-400 mb-2">Selected Modules for Mixing ({selectedMixModules.length}/2)</h4>
                        {selectedMixModules.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">Select two modules from the left to begin mixing.</p>
                        ) : (
                            <ul className="space-y-1">
                                {selectedMixModules.map(m => (
                                    <li key={m.id} className="text-white font-bold text-sm flex items-center gap-2">
                                        <CodeIcon className="w-4 h-4 text-fuchsia-400" /> {m.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {mixResultText && (
                        <div className="p-4 bg-black/60 rounded-lg border-2 border-fuchsia-500/50 animate-in fade-in slide-in-from-bottom-2">
                            <h4 className="text-[10px] font-black uppercase text-green-400 mb-2">Mixed Module Concept</h4>
                            <p className="text-white text-sm italic">{mixResultText}</p>
                        </div>
                    )}
                    <div className="p-4 bg-black/60 rounded-lg border-2 border-black">
                        <h4 className="text-[10px] font-black uppercase text-violet-400 mb-2">Previous Mixes</h4>
                        {moduleMixes.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">No mixes recorded yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {moduleMixes.map(mix => (
                                    <li key={mix.id} className="text-gray-400 text-xs italic border-b border-gray-700 pb-2 last:border-0">
                                        <span className="font-bold text-white">{mix.modules.map(m => m.name).join(' & ')}</span> mixed: "{mix.mixResult?.slice(0, 50)}..."
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
              </>
          ) : (
            selectedModule ? (
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
            )
          )}
        </div>
      </div>
    </div>
  );
};
