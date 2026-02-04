
import React, { useState } from 'react';
import { ImplementationResult } from './ImplementationResult';
import type { ImplementationResponse, LabComponentProps } from '../types';
import { BuildIcon, SpinnerIcon, PackageIcon, CodeIcon, ZapIcon, TerminalIcon, FireIcon, CheckCircleIcon } from './icons';
import { PopularLanguages } from './PopularLanguages';
import { NetworkDirectiveIntake } from './NetworkDirectiveIntake';

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

  const toolSimulation = [
    { name: 'exiv2', desc: 'Metadata Extraction', color: 'text-cyan-400' },
    { name: 'gphoto2', desc: 'Digital Capture Interface', color: 'text-emerald-400' },
    { name: 'pulseaudio-utils', desc: 'Sonic Signal Conduction', color: 'text-fuchsia-400' }
  ];

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
        <div className="flex flex-col items-end gap-2">
            <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-amber-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
                DIR_SYNC: {globalDirective ? 'ACTIVE' : 'IDLE'}
            </div>
            <div className="text-[7px] text-gray-600 font-mono uppercase">path://root/labs/engineering</div>
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
                {globalDirective && (
                    <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 animate-pulse">
                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Net Folder Task:</span>
                        <span className="text-[9px] text-white font-bold">{globalDirective.activeTask || 'Awaiting Task Identification'}</span>
                    </div>
                )}
              </div>
              <textarea
                value={logic}
                onChange={(e) => setLogic(e.target.value)}
                placeholder={globalDirective ? `Align logic with [${globalDirective.title}]...` : "Describe the module logic..."}
                className="w-full h-44 bg-gray-900/60 border-4 border-black rounded-[2rem] p-6 resize-none focus:outline-none focus:border-amber-600 transition-all text-amber-400 font-mono text-sm leading-relaxed shadow-inner"
                required
                disabled={isLoading}
              />
              <button type="submit" disabled={!logic.trim() || isLoading} className="vista-button py-5 w-full mt-8 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-xl tracking-[0.2em] shadow-[6px_6px_0_0_#000] active:translate-y-1 transition-all rounded-3xl flex items-center justify-center gap-4">
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
                             <div className="flex items-center gap-3 mb-6 p-4 bg-green-950/20 border-2 border-green-600/30 rounded-2xl">
                                <CheckCircleIcon className="w-6 h-6 text-green-500" />
                                <span className="text-sm font-black text-green-400 uppercase tracking-widest">Shard Harmonized Successfully</span>
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
                <h3 className="font-comic-header text-2xl text-cyan-400 mb-6 uppercase italic flex items-center gap-3">
                    <ZapIcon className="w-6 h-6" /> Reliable Tools
                </h3>
                <div className="space-y-4">
                    {toolSimulation.map(tool => (
                        <div key={tool.name} className="p-4 bg-black/60 rounded-xl border border-white/5 group hover:border-cyan-500/30 transition-all">
                            <p className={`text-lg font-black uppercase tracking-tighter ${tool.color}`}>{tool.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono italic mt-1">{tool.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="aero-panel bg-slate-900/40 border-4 border-black p-6 shadow-[6px_6px_0_0_#000]">
                <h3 className="font-comic-header text-2xl text-violet-400 mb-6 uppercase italic flex items-center gap-3">
                    <PackageIcon className="w-6 h-6" /> Target Langs
                </h3>
                <PopularLanguages />
            </div>
            
            <div className="mt-auto p-6 bg-red-950/10 border-4 border-red-900/20 rounded-[2rem] italic text-red-400/60 text-[10px] leading-relaxed font-mono">
                "Every letter generated in this lab is signed by root://net_folder. Absolute reliability confirmed."
            </div>
        </div>
      </div>
    </div>
  );
};
