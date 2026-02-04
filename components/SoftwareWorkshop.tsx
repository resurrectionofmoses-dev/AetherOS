
import React, { useState } from 'react';
import { ImplementationResult } from './ImplementationResult';
import type { ImplementationResponse, LabComponentProps } from '../types';
import { BuildIcon, SpinnerIcon, PackageIcon, CodeIcon } from './icons'; // Added CodeIcon for the lab icon
import { PopularLanguages } from './PopularLanguages';

interface EngineeringLabViewProps {
  onGenerate: (logic: string) => Promise<ImplementationResponse | null>;
}

// Export a static labIcon property for the new LabComponentProps pattern
export const EngineeringLabView: React.FC<EngineeringLabViewProps & LabComponentProps> = ({ onGenerate, labName = "ENGINEERING LAB", labIcon: LabIcon = CodeIcon, labColor = "text-amber-400", description = "Synthesize and test new software modules." }) => {
  const [logic, setLogic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedModule, setGeneratedModule] = useState<ImplementationResponse | null>(null);
  const [moduleWasSaved, setModuleWasSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logic.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedModule(null);
    setModuleWasSaved(false);

    try {
      const result = await onGenerate(logic);
      if (result) {
        setGeneratedModule(result);
        setModuleWasSaved(true);
      } else {
        setError('Failed to generate module.');
      }
    } catch (err) {
      setError('Unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a10] overflow-hidden">
      <div className="p-4 sm:p-8 border-b-4 border-black bg-slate-900 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-500/10 border-4 border-amber-600 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-8 h-8 sm:w-10 sm:h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-3xl sm:text-5xl text-white italic tracking-tighter uppercase">{labName}</h2>
                <p className="text-[8px] sm:text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">{description}</p>
            </div>
        </div>
        {/* Placeholder for dynamic lab status */}
        <div className="px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
            STATUS: ACTIVE
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-8 overflow-hidden">
        
        <div className="lg:w-2/3 flex flex-col gap-6 overflow-hidden">
            <form onSubmit={handleSubmit} className="aero-panel bg-white/[0.03] p-4 sm:p-6 border border-white/5">
              <h3 className="font-aggressive-header text-2xl sm:text-3xl text-white/80 mb-4 sm:mb-6 border-b border-white/10 pb-3 sm:pb-4">MODULE LOGIC</h3>
              <textarea
                value={logic}
                onChange={(e) => setLogic(e.target.value)}
                placeholder="Describe the functionality..."
                className="w-full h-32 sm:h-40 bg-black/40 border border-white/10 rounded-lg p-3 sm:p-4 resize-none focus:outline-none focus:border-red-500/50 text-gray-200 font-mono transition-all"
                required
                disabled={isLoading}
              />
              <button type="submit" disabled={!logic.trim() || isLoading} className="sidebar-button py-3 sm:py-4 w-full mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3 font-bold uppercase tracking-widest active:scale-[0.98]">
                {isLoading ? (
                  <>
                    <SpinnerIcon className="w-4 h-4 sm:w-5 h-5 animate-spin" />
                    <span>SYNTHESIZING...</span>
                  </>
                ) : (
                  <>
                    <BuildIcon className="w-4 h-4 sm:w-5 h-5" />
                    <span>INITIATE GENERATION</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex-1 aero-panel bg-black/40 border border-white/5 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    {error && <div className="text-center text-red-500 p-4 sm:p-6 font-bold">{error}</div>}
                    
                    {!isLoading && generatedModule && moduleWasSaved && (
                        <div className="text-center text-green-400 mb-4 sm:mb-6 p-3 sm:p-4 border border-green-500/20 bg-green-500/5 rounded-xl fade-in flex items-center justify-center gap-2 sm:gap-3">
                            <PackageIcon className="w-5 h-5 sm:w-6 h-6" />
                            <p className="font-black uppercase tracking-widest text-xs sm:text-sm">Module Harmonized in Room of Play</p>
                        </div>
                    )}

                    {generatedModule ? (
                        <div className="fade-in">
                            <ImplementationResult response={generatedModule} />
                        </div>
                    ) : !isLoading && !error && (
                        <div className="h-full flex items-center justify-center text-gray-700 italic border-2 border-dashed border-white/5 rounded-2xl">
                            <p className="font-aggressive-header text-xl sm:text-2xl opacity-10">Awaiting Signal Ingress</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="lg:w-1/3 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
                <div className="p-4 sm:p-6 border border-white/5 bg-white/[0.01] rounded-xl">
                    <h3 className="font-aggressive-header text-xl sm:text-2xl text-white/40 mb-4">POPULAR LANGUAGES</h3>
                    <PopularLanguages />
                </div>
                
                <div className="p-4 sm:p-6 bg-red-950/10 border border-red-900/20 rounded-xl italic text-red-400/60 text-xs leading-relaxed font-mono">
                    "Maestro's Warning: Logic generated in the workshop is gifted. Handle with absolute reliable intent."
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
