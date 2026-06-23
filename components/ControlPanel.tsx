import React, { useState, useEffect } from 'react';
import { LifeParams, LifeType, generateRoast } from '../services/geminiService';
import { Slider } from './Slider';
import { 
  Zap, Activity, TrendingDown, Brain, Ghost, Biohazard, Flame, Skull, Split, Lock, MoveVertical,
  Layers, Check, HelpCircle, HardDrive, Save, Trash2, FolderSync, ShieldAlert, Shield, ShieldCheck
} from 'lucide-react';

interface ControlPanelProps {
  currentMode: LifeType;
  setCurrentMode: (mode: LifeType) => void;
  params: LifeParams;
  setParams: (params: LifeParams) => void;
  setAiResponse: (response: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface Preset {
  name: string;
  timestamp: number;
  params: LifeParams;
  mode: LifeType;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  currentMode,
  setCurrentMode,
  params,
  setParams,
  setAiResponse,
  loading,
  setLoading,
}) => {
  const [localParams, setLocalParams] = useState<LifeParams>(params);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    setLocalParams(params);
  }, [params]);

  // Load presets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('inevitable_crash_presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local presets", e);
      }
    }
  }, []);

  const handleSliderChange = (paramName: string, value: number) => {
    setLocalParams((prevParams) => {
      const newParams = { ...prevParams, [paramName]: value } as LifeParams;
      setParams(newParams);
      return newParams;
    });
  };

  const handleGenerateRoast = async () => {
    setLoading(true);
    setAiResponse('');
    try {
      const response = await generateRoast(params);
      setAiResponse(response);
    } catch (error) {
      setAiResponse('Error constructing system judgment. Reality link severed.');
    } finally {
      setLoading(false);
    }
  };

  const savePreset = () => {
    if (!saveName.trim()) return;
    const newPreset: Preset = {
      name: saveName.trim(),
      timestamp: Date.now(),
      params: { ...params },
      mode: currentMode
    };
    const updated = [newPreset, ...presets];
    setPresets(updated);
    localStorage.setItem('inevitable_crash_presets', JSON.stringify(updated));
    setSaveName('');
  };

  const deletePreset = (timestamp: number) => {
    const updated = presets.filter(p => p.timestamp !== timestamp);
    setPresets(updated);
    localStorage.setItem('inevitable_crash_presets', JSON.stringify(updated));
  };

  const loadPreset = (preset: Preset) => {
    setCurrentMode(preset.mode);
    setParams(preset.params);
    setLocalParams(preset.params);
  };

  const getTheme = () => {
    if (currentMode === 'virus') return {
      text: 'text-green-500',
      accent: 'bg-green-500 hover:bg-green-400 focus:ring-green-500 font-mono border border-green-500/30'
    };
    if (currentMode === 'shadow') return {
      text: 'text-red-500',
      accent: 'bg-gradient-to-r from-red-650 to-cyan-700 hover:from-red-600 hover:to-cyan-600 font-sans tracking-wide border border-red-500/20'
    };
    if (currentMode === 'fortress') return {
      text: 'text-blue-500',
      accent: 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-500 border border-blue-500/20'
    };
    if (currentMode === 'poly') return {
      text: 'text-purple-500',
      accent: 'bg-purple-600 hover:bg-purple-500 focus:ring-purple-500 border border-purple-500/20'
    };
    return {
      text: 'text-pink-500',
      accent: 'bg-pink-600 hover:bg-pink-500 focus:ring-pink-500 border border-pink-500/20'
    };
  };

  const theme = getTheme();

  return (
    <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 shadow-2x backdrop-blur-md relative overflow-hidden flex flex-col space-y-6">
      
      {/* Mode Switches */}
      <div className="grid grid-cols-5 gap-1 bg-[#090910] p-1 rounded-xl border border-zinc-900">
        {(['wave', 'poly', 'virus', 'shadow', 'fortress'] as LifeType[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setCurrentMode(mode)}
            className={`py-2 text-[8px] font-black tracking-widest rounded-lg transition-all uppercase ${
              currentMode === mode
                ? 'bg-zinc-900 text-white font-black shadow-md border border-white/5'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {mode === 'wave' && 'WAVE'}
            {mode === 'poly' && 'ROOTS'}
            {mode === 'virus' && 'VIRUS'}
            {mode === 'shadow' && 'SCHISM'}
            {mode === 'fortress' && 'CASTLE'}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {currentMode === 'wave' && localParams.type === 'wave' && (
          <div className="space-y-4">
            <Slider
              label="Ego Size (Amplitude)"
              min={0.1} max={5} step={0.1}
              value={localParams.ego}
              onChange={(val) => handleSliderChange('ego', val)}
              tooltip="The peaks of your delusions of grandeur. Higher values mean a steeper drop-off."
            />
            <Slider
              label="Manic Episodes (Frequency)"
              min={0.1} max={5} step={0.1}
              value={localParams.volatility}
              onChange={(val) => handleSliderChange('volatility', val)}
              tooltip="The rate of your mood swings. Higher values represent highly erratic cycles."
            />
            <Slider
              label="Irrelevance Velocity (Decay)"
              min={0.01} max={0.5} step={0.01}
              value={localParams.decay}
              onChange={(val) => handleSliderChange('decay', val)}
              tooltip="Rate at which you slip from public attention. Expiration speed."
            />
          </div>
        )}

        {currentMode === 'poly' && localParams.type === 'poly' && (
          <div className="space-y-4">
            <Slider
              label="Childhood Trauma (x² Coeff)"
              min={-5} max={5} step={0.1}
              value={localParams.trauma}
              onChange={(val) => handleSliderChange('trauma', val)}
              tooltip="The curvature of your psychological constraints. Curbs development pathing."
            />
            <Slider
              label="General Anxiety (x Coeff)"
              min={-5} max={5} step={0.1}
              value={localParams.anxiety}
              onChange={(val) => handleSliderChange('anxiety', val)}
              tooltip="Baseline slope of daily operations. Measures how fast things spiral."
            />
            <Slider
              label="Lingering Regret (Constant)"
              min={-10} max={10} step={0.1}
              value={localParams.regret}
              onChange={(val) => handleSliderChange('regret', val)}
              tooltip="The stubborn weight that holds you down regardless of daily situations."
            />
          </div>
        )}

        {currentMode === 'virus' && localParams.type === 'virus' && (
          <div className="space-y-4">
            <Slider
              label="System Fever (Sigma)"
              min={1} max={20} step={0.1}
              value={localParams.fever}
              onChange={(val) => handleSliderChange('fever', val)}
              tooltip="Viscosity coefficient on the Lorenz Attractor. Drives structural turbulence."
            />
            <Slider
              label="Delirium Level (Rho)"
              min={1} max={50} step={0.1}
              value={localParams.delirium}
              onChange={(val) => handleSliderChange('delirium', val)}
              tooltip="Instability indicator. Drives the heat of strange attractor fluctuations."
            />
            <Slider
              label="Geometric Decay (Beta)"
              min={0.1} max={5} step={0.01}
              value={localParams.collapse}
              onChange={(val) => handleSliderChange('collapse', val)}
              tooltip="Dimension dampening factor of the infected zone. Causes decay."
            />
            <div className="p-2.5 bg-black/60 border border-green-950 rounded-xl text-center">
              <span className="text-[10px] font-mono whitespace-nowrap text-green-500 tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                <Skull className="w-3.5 h-3.5" /> CRITICAL ERROR: SENTIENCE DETECTED
              </span>
            </div>
          </div>
        )}

        {currentMode === 'shadow' && localParams.type === 'shadow' && (
          <div className="space-y-4">
            <Slider
              label="Compliance (Mass Ratio)"
              min={0.1} max={5} step={0.1}
              value={localParams.compliance}
              onChange={(val) => handleSliderChange('compliance', val)}
              tooltip="The leverage scale of the double pendulum. Shakes power structures."
            />
            <Slider
              label="Repression (Gravity)"
              min={0.1} max={20} step={0.05} // adjusted max/step for better pendulum swing gravity
              value={localParams.repression}
              onChange={(val) => handleSliderChange('repression', val)}
              tooltip="Social standards pulling bobs downwards. Restricts swing range."
            />
            <Slider
              label="Fracture (Energy)"
              min={0.01} max={3} step={0.01}
              value={localParams.fracture}
              onChange={(val) => handleSliderChange('fracture', val)}
              tooltip="The split velocity that sets the inner conflict pendulum in motion."
            />
            <div className="p-2.5 bg-black/60 border border-red-950 rounded-xl text-center">
              <span className="text-[10px] font-mono text-red-500 tracking-wider flex items-center justify-center gap-1.5">
                <Split className="w-3.5 h-3.5 animate-spin" /> WARNING: SAFETY PROTOCOLS FRAYING
              </span>
            </div>
          </div>
        )}

        {currentMode === 'fortress' && localParams.type === 'fortress' && (
          <div className="space-y-4">
            <Slider
              label="Core Resilience (Mass)"
              min={0.1} max={10} step={0.1}
              value={localParams.coreResilience}
              onChange={(val) => handleSliderChange('coreResilience', val)}
              tooltip="The heavy, stubborn strategic mass. Higher weight dampens shock but delays recovery."
            />
            <Slider
              label="Recovery Drive (Spring k)"
              min={0.1} max={10} step={0.1}
              value={localParams.recoveryDrive}
              onChange={(val) => handleSliderChange('recoveryDrive', val)}
              tooltip="Spring constant of bounce-back fury. Stiffer springs snap back violently."
            />
            <Slider
              label="Shock Absorption (Damping c)"
              min={0.01} max={5} step={0.01}
              value={localParams.shockAbsorption}
              onChange={(val) => handleSliderChange('shockAbsorption', val)}
              tooltip="Capacity to absorb incoming structural blows. Prevents endless oscillations."
            />
            <div className="p-2.5 bg-black/60 border border-blue-950 rounded-xl text-center">
              <span className="text-[10px] font-mono text-blue-500 tracking-wider flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 animate-bounce" /> FORTRESS_SHIELD_INTEGRITY_ONLINE
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Analyze Triggers */}
      <button
        onClick={handleGenerateRoast}
        disabled={loading}
        className={`w-full py-3.5 rounded-xl font-mono text-xs text-white font-bold tracking-widest uppercase transition-all duration-300 shadow-lg ${
          loading
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
            : `${theme.accent} shadow-current/20 active:scale-[0.98]`
        }`}
      >
        {loading
          ? 'Calculating Existential Drift...'
          : currentMode === 'virus'
            ? 'INITIATE CORRUPTION'
            : currentMode === 'shadow'
              ? 'BREACH PROTOCOLS'
              : currentMode === 'fortress'
                ? 'FORENSIC AUDIT_DOOM'
                : 'Judge My Demise'}
      </button>

      {/* Memory Banks Presets */}
      <div className="border-t border-zinc-900 pt-5 space-y-4">
        <h3 className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 font-black flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-zinc-600" />
          Inevitable Memory Banks
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Save profile name..."
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="flex-1 bg-black border border-zinc-900 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-red-500/50"
          />
          <button
            onClick={savePreset}
            disabled={!saveName.trim()}
            className="px-3 bg-zinc-900 border border-zinc-800 inline-flex items-center justify-center hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-white hover:text-red-500 rounded-xl transition-all"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>

        {presets.length > 0 ? (
          <div className="space-y-1.5 max-h-36 overflow-y-auto px-0.5 custom-scrollbar">
            {presets.map((preset) => (
              <div
                key={preset.timestamp}
                className="flex items-center justify-between bg-black/40 hover:bg-black p-2 rounded-xl border border-zinc-900 group"
              >
                <button
                  onClick={() => loadPreset(preset)}
                  className="flex-1 text-left font-mono"
                >
                  <p className="text-[10px] font-black text-gray-300 uppercase hover:text-red-500 transition-colors">
                    {preset.name}
                  </p>
                  <p className="text-[8px] text-zinc-600 tracking-wider uppercase flex items-center gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      preset.mode === 'virus' ? 'bg-green-500' :
                      preset.mode === 'shadow' ? 'bg-red-500' :
                      preset.mode === 'fortress' ? 'bg-blue-500' :
                      preset.mode === 'poly' ? 'bg-purple-500' : 'bg-pink-500'
                    }`} />
                    {preset.mode}
                  </p>
                </button>
                <button
                  onClick={() => deletePreset(preset.timestamp)}
                  className="text-zinc-700 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-black/10 rounded-xl border border-zinc-900/50">
            <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
              [EMPTY_MEMORY_BANK_SLOTS]
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
