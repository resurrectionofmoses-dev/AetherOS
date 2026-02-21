import React, { useState } from 'react';
import { ImplementationResult } from './ImplementationResult';
import type { ImplementationResponse, LabComponentProps } from '../types';
import { BuildIcon, SpinnerIcon, PackageIcon, CodeIcon, TerminalIcon, FireIcon, CheckCircleIcon } from './icons';
import { PopularLanguages } from './PopularLanguages';

interface EngineeringLabViewProps {
  onGenerate: (logic: string) => Promise<ImplementationResponse | null>;
}

export const EngineeringLabView: React.FC<EngineeringLabViewProps & LabComponentProps> = ({ 
  onGenerate, 
  labName = "ENGINEERING LAB", 
  labIcon: LabIcon = CodeIcon, 
  labColor = "text-amber-400", 
  description = "Synthesize high-integrity software modules with gifted know-how.",
  globalDirective
}) => {
  const [logic, setLogic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedModule, setGeneratedModule] = useState<ImplementationResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logic.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedModule(null);

    try {
      const result = await onGenerate(logic);
      if (result) {
        setGeneratedModule(result);
      } else {
        setError('Synthesis stalled. Semantic drift too high.');
      }
    } catch (err) {
      setError('Architectural failure in the Conjunction Series.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050510] overflow-hidden">
      <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/10 border-4 border-amber-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 p-8 overflow-hidden">
        <div className="lg:w-2/3 flex flex-col gap-8 overflow-hidden">
            <form onSubmit={handleSubmit} className="aero-panel bg-black/40 p-8 border-4 border-black shadow-[10px_10px_0_0_#000]">
              <div className="flex items-center justify-between mb-6 border-b-2 border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <TerminalIcon className="w-6 h-6 text-amber-500" />
                    <h3 className="font-comic-header text-3xl text-white uppercase italic">Logic Input Portal</h3>
                </div>
              </div>
              <textarea
                value={logic}
                onChange={(e) => setLogic(e.target.value)}
                placeholder="Describe the module logic..."
                className="w-full h-44 bg-gray-900/60 border-4 border-black rounded-[2rem] p-6 resize-none focus:outline-none focus:border-amber-600 transition-all text-amber-400 font-mono text-sm leading-relaxed"
                required
                disabled={isLoading}
              />
              <button type="submit" disabled={!logic.trim() || isLoading} className="vista-button py-5 w-full mt-8 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-xl tracking-[0.2em] rounded-3xl flex items-center justify-center gap-4">
                {isLoading ? (
                  <>
                    <SpinnerIcon className="w-8 h-8 animate-spin" />
                    <span>SYNTHESIZING...</span>
                  </>
                ) : (
                  <>
                    <BuildIcon className="w-8 h-8" />
                    <span>INITIATE GENERATION</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex-1 aero-panel bg-black/60 border-4 border-black overflow-hidden flex flex-col shadow-[12px_12px_30px_rgba(0,0,0,0.5)]">
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {error && (
                        <div className="text-center p-10 bg-red-950/20 border-4 border-red-600 rounded-[2rem] animate-bounce">
                            <FireIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                            <p className="text-red-500 font-black uppercase tracking-widest">{error}</p>
                        </div>
                    )}
                    
                    {generatedModule ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <div className="flex items-center gap-2 mb-6 p-4 bg-green-950/20 border-2 border-green-600/30 rounded-2xl">
                                <CheckCircleIcon className="w-6 h-6 text-green-500" />
                                <span className="text-sm font-black text-green-400 uppercase tracking-widest">Shard Harmonized</span>
                             </div>
                            <ImplementationResult response={generatedModule} />
                        </div>
                    ) : !isLoading && !error && (
                        <div className="h-full flex flex-col items-center justify-center opacity-10 border-4 border-dashed border-white/5 rounded-[3rem]">
                            <CodeIcon className="w-24 h-24 mb-6" />
                            <p className="font-comic-header text-3xl uppercase tracking-[0.3em] italic">Awaiting Logic Ingress</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="lg:w-1/3 overflow-y-auto custom-scrollbar flex flex-col gap-8">
            <div className="aero-panel bg-slate-900/40 border-4 border-black p-6 shadow-[6px_6px_0_0_#000]">
                <h3 className="font-comic-header text-2xl text-violet-400 mb-6 uppercase italic flex items-center gap-3">
                    <PackageIcon className="w-6 h-6 text-violet-400" /> Target Langs
                </h3>
                <PopularLanguages />
            </div>
        </div>
      </div>
    </div>
  );
};
