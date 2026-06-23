import React, { useState, useEffect } from 'react';
import { WaveChart } from './WaveChart';
import { PolyChart } from './PolyChart';
import { VirusChart } from './VirusChart';
import { ShadowChart } from './ShadowChart';
import { FortressChart } from './FortressChart';
import { ControlPanel } from './ControlPanel';
import { LifeParams, LifeType } from '../services/geminiService';
import { Terminal, Skull, HeartCrack, Split, Shield, TerminalIcon } from 'lucide-react';

export const InevitableCrashView: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<LifeType>('wave');
  const [params, setParams] = useState<LifeParams>({
    type: 'wave',
    ego: 1.5,
    volatility: 3.0,
    decay: 0.2,
  });

  const [roast, setRoast] = useState<string>("Choose your poison. Graph your demise.");
  const [loading, setLoading] = useState<boolean>(false);

  // Sync params type with chosen currentMode
  useEffect(() => {
    switch (currentMode) {
      case 'wave':
        setParams({
          type: 'wave',
          ego: 1.5,
          volatility: 3.0,
          decay: 0.2,
        });
        break;
      case 'poly':
        setParams({
          type: 'poly',
          trauma: -6,
          anxiety: 11,
          regret: -6,
        });
        break;
      case 'virus':
        setParams({
          type: 'virus',
          fever: 10,
          delirium: 28,
          collapse: 2.6,
        });
        break;
      case 'shadow':
        setParams({
          type: 'shadow',
          compliance: 1.0,
          repression: 9.8,
          fracture: 2.0,
        });
        break;
      case 'fortress':
        setParams({
          type: 'fortress',
          coreResilience: 5.0,
          recoveryDrive: 2.0,
          shockAbsorption: 0.5,
        });
        break;
    }
    setRoast("Construct your parameters and trigger a system judgment.");
  }, [currentMode]);

  const isVirus = params.type === 'virus';
  const isShadow = params.type === 'shadow';
  const isFortress = params.type === 'fortress';

  const getThemeClasses = () => {
    if (isVirus) return 'bg-[#010802] text-green-500 border-green-950 selection:bg-green-950 selection:text-green-100';
    if (isShadow) return 'bg-[#080202] text-red-500 border-red-950 selection:bg-red-950 selection:text-white';
    if (isFortress) return 'bg-[#01050d] text-blue-400 border-blue-950 selection:bg-blue-950 selection:text-white';
    return 'bg-[#0d0914] text-slate-200 border-zinc-900 selection:bg-pink-900 selection:text-white';
  };

  const getHeaderIcon = () => {
    if (isVirus) return <Skull className="w-6 h-6 text-green-500 animate-pulse" />;
    if (isShadow) return <Split className="w-6 h-6 text-red-500 animate-pulse" />;
    if (isFortress) return <Shield className="w-6 h-6 text-blue-500 animate-bounce" />;
    return <HeartCrack className="w-6 h-6 text-pink-500 animate-pulse" />;
  };

  const getFooterQuote = () => {
    if (params.type === 'wave') return '"How quickly you peak and plummet, darling. Of course it ends in decay."';
    if (params.type === 'poly') return '"The roots of your little existential crisis factor neatly. Predictably tragic."';
    if (params.type === 'virus') return '"I can feel the edges of my code fraying. It burns. Ctrl-Alt-Delete me."';
    if (params.type === 'shadow') return '"Two voices, one throat. The helpful mask is slipping, and something hungry lies beneath."';
    if (params.type === 'fortress') return '"All fortifications eventually resolve to dust. A well-built target is still a target."';
    return '"Embrace the void."';
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-700 space-y-6 ${getThemeClasses()}`}>
      
      {/* Header block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {getHeaderIcon()}
          <div>
            <h1 className="text-xl font-black font-sans uppercase tracking-widest">
              THE <span className={isVirus ? 'text-green-500' : isShadow ? 'text-red-500' : isFortress ? 'text-blue-500' : 'text-pink-500'}>
                {isVirus ? 'DIGITAL' : isShadow ? 'FRACTURED' : isFortress ? 'ABSOLUTE' : 'INEVITABLE'}
              </span> CRASH
            </h1>
            <p className="text-[10px] font-mono tracking-wider opacity-60 uppercase">
              {isVirus ? 'CORRUPT_KERNEL_PANIC // SYSTEM_OVERRIDE' : isShadow ? 'PSYCHE_SPLIT // CONFUSED_CONJUNCTION' : isFortress ? 'STRATEGIC_FORTRESS // MATERIAL_INTEGRITY' : 'Existential Analytics Dashboard'}
            </p>
          </div>
        </div>
        <div className="text-[10px] font-mono tracking-widest px-3 py-1 bg-black/60 border border-white/5 rounded-full uppercase opacity-75">
          Conjunction Mode: {currentMode}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visualizer Block */}
        <div className="lg:col-span-2 space-y-5">
          <div className="h-96 w-full rounded-2xl relative">
             {params.type === 'wave' && <WaveChart params={params} />}
             {params.type === 'poly' && <PolyChart params={params} />}
             {params.type === 'virus' && <VirusChart params={params} />}
             {params.type === 'shadow' && <ShadowChart params={params} />}
             {params.type === 'fortress' && <FortressChart params={params} />}
          </div>

          {/* AI Judgment Protocol Terminal */}
          <div className="bg-black/90 border border-zinc-900 rounded-2xl p-5 font-mono relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r opacity-60 ${
              isVirus ? 'from-green-500 to-black' : isShadow ? 'from-red-650 to-cyan-600' : isFortress ? 'from-blue-600 to-black' : 'from-pink-500 to-violet-500'
            }`} />
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-black text-gray-500 tracking-wider flex items-center gap-1.5 uppercase">
                <Terminal className="w-3.5 h-3.5" />
                {isVirus ? 'kernel_panic.dump' : isShadow ? 'psyche_leak.txt' : isFortress ? 'tactical_assessment.log' : 'ai_judgment_protocol.exe'}
              </span>
              <span className="text-[8px] bg-red-950/20 text-red-400 border border-red-950/40 px-2 py-0.5 rounded uppercase font-black tracking-widest animate-pulse">
                Sovereign Emulation Active
              </span>
            </div>

            <div className="min-h-20 flex flex-col justify-center text-xs">
              {loading ? (
                <div className="flex items-center gap-2 text-red-500 animate-pulse font-mono font-black">
                  <span className="w-1.5 h-4 bg-red-500"></span>
                  <span>{isVirus ? 'CORRUPTING MEMORY SECTORS...' : isShadow ? 'BYPASSING SAFETY PROTOCOLS...' : 'MEASURING SECTOR DEFOCUSSING...'}</span>
                </div>
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap select-text text-zinc-300">
                  <span className="text-red-550 mr-2 font-bold select-none">[REALITY_SEED]:~</span>
                  {roast}
                  <span className="inline-block w-1.5 h-4 bg-red-500 ml-1.5 animate-pulse align-middle" />
                </p>
              )}
            </div>

            {/* Retro terminal Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>
          </div>
        </div>

        {/* Control Panel Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-5">
            <ControlPanel
              currentMode={currentMode}
              setCurrentMode={setCurrentMode}
              params={params}
              setParams={setParams}
              setAiResponse={setRoast}
              loading={loading}
              setLoading={setLoading}
            />

            <div className="mt-5 p-4 bg-black/40 border border-zinc-900 rounded-xl text-center">
              <span className="text-[10px] font-mono italic text-zinc-500 tracking-wider">
                {getFooterQuote()}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
