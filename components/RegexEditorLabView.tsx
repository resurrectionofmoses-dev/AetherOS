import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  Trash2, 
  Plus, 
  Search, 
  RotateCw, 
  Play, 
  CheckCircle, 
  TrendingUp, 
  Info, 
  ShieldAlert,
  Save,
  Check,
  ToggleLeft,
  ToggleRight,
  Brain,
  Cpu
} from 'lucide-react';
import { learningRegexEngine, FeedbackSignal } from '../services/LearningRegexEngine';
import type { RegexRule } from './JesterCompanion';

export const RegexEditorLabView: React.FC = () => {
  const [rules, setRules] = useState<RegexRule[]>(() => learningRegexEngine.getRules());
  const [feedbackLogs, setFeedbackLogs] = useState<FeedbackSignal[]>(() => learningRegexEngine.getFeedbackHistory());
  const [neuralContextEnabled, setNeuralContextEnabled] = useState<boolean>(() => learningRegexEngine.isNeuralContextEnabled());
  
  // Rule creator states
  const [newId, setNewId] = useState('');
  const [newIntent, setNewIntent] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [creatorError, setCreatorError] = useState<string | null>(null);

  // Edit inline states
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editIntent, setEditIntent] = useState('');
  const [editPattern, setEditPattern] = useState('');
  const [editResponse, setEditResponse] = useState('');

  // Sandbox Test states
  const [testMessage, setTestMessage] = useState('');
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  // Sound effects helper using Synth Audio context
  const playSynthTone = (freq: number, type: OscillatorType = 'sine', duration = 0.1) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored if blocked by browser policy
    }
  };

  // Synchronize rules & feedback logs
  useEffect(() => {
    setRules(learningRegexEngine.getRules());
    setFeedbackLogs(learningRegexEngine.getFeedbackHistory());
    setNeuralContextEnabled(learningRegexEngine.isNeuralContextEnabled());

    const unsubscribe = learningRegexEngine.subscribe((updatedRules) => {
      setRules(updatedRules);
      setFeedbackLogs(learningRegexEngine.getFeedbackHistory());
      setNeuralContextEnabled(learningRegexEngine.isNeuralContextEnabled());
    });
    return unsubscribe;
  }, []);

  const handleToggleNeuralContext = () => {
    const nextState = !neuralContextEnabled;
    learningRegexEngine.setNeuralContextEnabled(nextState);
    setNeuralContextEnabled(nextState);
    playSynthTone(nextState ? 600 : 300, 'sine', 0.12);
  };

  const liveNeuralAnalysis = learningRegexEngine.analyzeSystemState();

  // Creator Action
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    setCreatorError(null);

    if (!newIntent.trim() || !newPattern.trim() || !newResponse.trim()) {
      setCreatorError('All fields are required to establish a new cognitive vector.');
      playSynthTone(150, 'triangle', 0.2);
      return;
    }

    const cleanId = newId.trim() ? 'user-' + newId.trim().toLowerCase().replace(/\s+/g, '-') : 'user-' + Date.now();
    
    // Check for duplicate ID
    if (rules.some(r => r.id === cleanId)) {
      setCreatorError(`Rule identifier '${cleanId}' is already registered in the core registry.`);
      playSynthTone(150, 'triangle', 0.2);
      return;
    }

    // Validate Regex pattern syntax
    try {
      new RegExp(newPattern);
    } catch (err: any) {
      setCreatorError(`Invalid regex syntax: ${err.message}`);
      playSynthTone(150, 'triangle', 0.2);
      return;
    }

    const newRule: RegexRule = {
      id: cleanId,
      intent: newIntent.trim(),
      pattern: newPattern.trim(),
      response: newResponse.trim(),
      isActive: true,
      matchCount: 0
    };

    learningRegexEngine.addRule(newRule);
    
    // Add artificial positive feedback log to trace custom addition
    learningRegexEngine.interceptFeedback(cleanId, newRule.intent, 'positive', 'Manual Addition');

    // Reset fields
    setNewId('');
    setNewIntent('');
    setNewPattern('');
    setNewResponse('');
    playSynthTone(880, 'sine', 0.15);
  };

  // Trigger editing rule mode
  const startEditing = (rule: RegexRule) => {
    setEditingRuleId(rule.id);
    setEditIntent(rule.intent);
    setEditPattern(rule.pattern);
    setEditResponse(rule.response);
    playSynthTone(440, 'sine', 0.05);
  };

  const cancelEditing = () => {
    setEditingRuleId(null);
    playSynthTone(300, 'triangle', 0.08);
  };

  const saveEditedRule = (ruleId: string) => {
    if (!editIntent.trim() || !editPattern.trim() || !editResponse.trim()) {
      playSynthTone(150, 'triangle', 0.2);
      return;
    }

    try {
      new RegExp(editPattern);
    } catch (err) {
      playSynthTone(150, 'triangle', 0.2);
      return;
    }

    const updatedRules = rules.map(r => {
      if (r.id === ruleId) {
        return {
          ...r,
          intent: editIntent.trim(),
          pattern: editPattern.trim(),
          response: editResponse.trim()
        };
      }
      return r;
    });

    learningRegexEngine.setRules(updatedRules);
    setEditingRuleId(null);
    playSynthTone(587.33, 'sine', 0.12);
  };

  // Toggle active rule
  const toggleRuleActive = (ruleId: string) => {
    const updated = rules.map(r => {
      if (r.id === ruleId) {
        return { ...r, isActive: !r.isActive };
      }
      return r;
    });
    learningRegexEngine.setRules(updated);
    playSynthTone(523.25, 'sine', 0.08);
  };

  // Delete rule
  const deleteRule = (ruleId: string) => {
    const updated = rules.filter(r => r.id !== ruleId);
    learningRegexEngine.setRules(updated);
    playSynthTone(220, 'sawtooth', 0.15);
  };

  // Set Manual Weight
  const handleWeightChange = (ruleId: string, val: number) => {
    learningRegexEngine.updateWeight(ruleId, val);
  };

  // Run Sandbox Evaluation
  const evaluateSandbox = () => {
    if (!testMessage.trim()) return;

    const res = learningRegexEngine.evaluateRules(testMessage, rules);
    setSandboxResult(res);
    playSynthTone(659.25, 'sine', 0.12);
  };

  const handleResetDefaults = () => {
    if (confirm('Are you absolutely sure you want to reset the learning model matrix to stock defaults? All custom rules and weights will be wiped.')) {
      learningRegexEngine.resetToDefaults();
      setSandboxResult(null);
      setTestMessage('');
      playSynthTone(293.66, 'sawtooth', 0.3);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-black text-zinc-300 font-sans p-6 custom-scrollbar">
      {/* Cybersecurity Cyberpunk Header */}
      <div className="mb-6 bg-zinc-950 p-4 rounded-xl border border-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.03)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            <span className="text-[9px] font-mono font-black text-red-500 tracking-widest uppercase">AetherOS :: Core Lab</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wide mt-1 uppercase">Regex Predictive Learning Lab</h1>
          <p className="text-[10px] text-zinc-500 font-mono tracking-tight mt-0.5">
            COGNITIVE INTERCEPT INTERFACE & IN-MEMORY WEIGHT RECONCILIATION GATEWAY [PROTOCOL 0x074B]
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-900/50 hover:border-red-500/50 rounded-lg text-[10px] font-mono uppercase tracking-widest transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Reset Matrix Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Side: Rule Weights & Matrix Controller */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-black text-white uppercase tracking-wider">Predictive Regex Rules Matrix</h2>
              </div>
              <span className="text-[9px] font-mono text-zinc-500 font-bold bg-zinc-900 px-2 py-0.5 rounded-full">
                ACTIVE CODES: {rules.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto custom-scrollbar pr-1">
              <AnimatePresence initial={false}>
                {rules.map((rule) => {
                  const currentWeight = learningRegexEngine.getWeight(rule.id);
                  const isEditing = editingRuleId === rule.id;

                  return (
                    <motion.div
                      key={rule.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3.5 rounded-xl border text-left transition duration-200 ${
                        isEditing 
                          ? 'bg-purple-950/20 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.1)]' 
                          : 'bg-[#06060c] border-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      {/* Top Header Row of each Rule */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editIntent}
                              onChange={(e) => setEditIntent(e.target.value)}
                              className="bg-black border border-purple-500/50 text-white rounded px-2 py-0.5 text-[11px] font-bold font-sans focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />
                          ) : (
                            <span className="text-xs font-black text-white uppercase tracking-wide">
                              {rule.intent}
                            </span>
                          )}
                          <span className="text-[8px] font-mono text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">
                            {rule.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Weight Slider Controller */}
                          <div className="flex items-center gap-1.5 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-900 font-mono">
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Weight:</span>
                            <span className={`text-[10px] font-black ${
                              currentWeight > 1.5 ? 'text-emerald-400' : (currentWeight < 0.8 ? 'text-red-400' : 'text-amber-400')
                            }`}>
                              {currentWeight.toFixed(2)}x
                            </span>
                            <input
                              type="range"
                              min="0.1"
                              max="3.0"
                              step="0.05"
                              value={currentWeight}
                              onChange={(e) => handleWeightChange(rule.id, parseFloat(e.target.value))}
                              className="w-16 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                          </div>

                          {/* Active Switch */}
                          <button
                            type="button"
                            onClick={() => toggleRuleActive(rule.id)}
                            className="text-zinc-500 hover:text-white transition cursor-pointer"
                            title={rule.isActive ? 'Deactivate Trigger' : 'Activate Trigger'}
                          >
                            {rule.isActive ? (
                              <ToggleRight className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-zinc-700" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Pattern / Regex row */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Trigger Pattern RegExp:</span>
                          <span className="text-zinc-600 text-[8px] tracking-normal uppercase">Matches: {rule.matchCount}</span>
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPattern}
                            onChange={(e) => setEditPattern(e.target.value)}
                            className="w-full bg-black border border-purple-500/50 text-emerald-400 rounded px-2.5 py-1 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                        ) : (
                          <div className="text-[10px] font-mono bg-black/60 text-emerald-400 px-2.5 py-1 rounded border border-zinc-900 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                            {rule.pattern}
                          </div>
                        )}
                      </div>

                      {/* Response template */}
                      <div className="mt-2.5 space-y-1">
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Jester Response Template:</span>
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={editResponse}
                            onChange={(e) => setEditResponse(e.target.value)}
                            className="w-full bg-black border border-purple-500/50 text-zinc-300 rounded px-2 py-1 text-[10px] leading-relaxed resize-none focus:outline-none"
                          />
                        ) : (
                          <p className="text-[10px] bg-zinc-950/40 text-zinc-400 p-2 rounded border border-zinc-900/60 leading-normal italic">
                            &ldquo;{rule.response}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 pt-2 border-t border-zinc-900 flex justify-end gap-2 text-[9px] font-mono font-bold uppercase">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="px-2 py-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEditedRule(rule.id)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded cursor-pointer shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                            >
                              <Save className="w-3 h-3" />
                              Commit Vector
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(rule)}
                              className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded cursor-pointer"
                            >
                              Refine Rule
                            </button>
                            {(rule.id.startsWith('user-') || rule.id.includes('-')) && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Do you want to purge rule '${rule.intent}' from memory?`)) {
                                    deleteRule(rule.id);
                                  }
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                Purge
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Rule Creator, Live Sandbox & Audit Feed */}
        <div className="xl:col-span-5 space-y-6">
          {/* Neural Context Orchestrator Panel */}
          <div className="bg-zinc-950 rounded-xl border border-purple-950/40 p-4 shadow-[0_0_15px_rgba(168,85,247,0.05)] text-left">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                <h2 className="text-xs font-black text-white uppercase tracking-wider">Neural Context Orchestrator</h2>
              </div>
              <button
                type="button"
                onClick={handleToggleNeuralContext}
                className="text-zinc-500 hover:text-white transition cursor-pointer"
                title={neuralContextEnabled ? 'Disable Neural Context State Injection' : 'Enable Neural Context State Injection'}
              >
                {neuralContextEnabled ? (
                  <ToggleRight className="w-6 h-6 text-purple-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-zinc-700" />
                )}
              </button>
            </div>

            <p className="text-[10px] text-zinc-400 leading-normal mb-3">
              Automatically harvests system states (active project tasks, error/warning streams) and weaves them into the cognitive match priority weights upon user feedback signals.
            </p>

            {neuralContextEnabled ? (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* Active Harvesting Stats */}
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                  <div className="p-2 bg-[#09050d] border border-purple-950/50 rounded-lg">
                    <span className="text-purple-400 font-bold uppercase block mb-0.5">Tasks Harvested</span>
                    <span className="text-white font-black text-[11px]">{liveNeuralAnalysis.analyzedTasks.length} Active</span>
                  </div>
                  <div className="p-2 bg-[#09050d] border border-purple-950/50 rounded-lg">
                    <span className="text-purple-400 font-bold uppercase block mb-0.5">Errors Intercepted</span>
                    <span className="text-amber-400 font-black text-[11px]">{liveNeuralAnalysis.analyzedErrors.length} Spikes</span>
                  </div>
                </div>

                {/* Insight Box */}
                <div className="p-2.5 bg-black/60 border border-zinc-900 rounded-lg">
                  <span className="text-[8px] font-mono text-purple-400 font-black uppercase tracking-wider block mb-1">
                    Calculated Cognitive Insight
                  </span>
                  <p className="text-[10px] text-zinc-300 italic leading-relaxed font-sans">
                    &ldquo;{liveNeuralAnalysis.systemInsight}&rdquo;
                  </p>
                </div>

                {/* Injected Biases */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-zinc-500 font-black uppercase tracking-widest block">
                    Dynamic Bias Scaling Modifiers
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(liveNeuralAnalysis.injectedWeightAdjustments).map(([id, val]) => (
                      <span key={id} className="text-[9px] font-mono px-2 py-0.5 bg-purple-950/40 border border-purple-900/60 text-purple-300 rounded font-bold">
                        {id}: +{val.toFixed(2)}x
                      </span>
                    ))}
                    {Object.keys(liveNeuralAnalysis.injectedWeightAdjustments).length === 0 && (
                      <span className="text-[8px] font-mono text-zinc-650 italic">No bias modifiers calculated (System nominal)</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-900 text-center text-zinc-500 font-mono text-[9px] py-4">
                [NEURAL CONTEXT HARVESTING OFFLINE :: PROTOCOL BYPASSED]
              </div>
            )}
          </div>

          {/* Section 1: Cognitive Rule Creator */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-900">
              <Plus className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-black text-white uppercase tracking-wider">Register New Cognitive Trigger</h2>
            </div>

            <form onSubmit={handleAddRule} className="space-y-3.5 text-left">
              {creatorError && (
                <div className="p-2.5 bg-red-950/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-300 leading-normal">{creatorError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-black">
                    Unique ID (Optional):
                  </label>
                  <input
                    type="text"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    placeholder="e.g. system-recode"
                    className="w-full bg-black border border-zinc-900 hover:border-zinc-800 focus:border-emerald-500 rounded px-2.5 py-1 text-[10px] text-zinc-300 font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-black">
                    Intent Name / Title:
                  </label>
                  <input
                    type="text"
                    value={newIntent}
                    onChange={(e) => setNewIntent(e.target.value)}
                    placeholder="e.g. System Override"
                    required
                    className="w-full bg-black border border-zinc-900 hover:border-zinc-800 focus:border-emerald-500 rounded px-2.5 py-1 text-[10px] text-zinc-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-black">
                  Trigger Pattern (RegExp Syntax):
                </label>
                <input
                  type="text"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  placeholder="\\b(recode|re-compile|compile|run test)\\b"
                  required
                  className="w-full bg-black border border-zinc-900 hover:border-zinc-800 focus:border-emerald-500 rounded px-2.5 py-1 text-[10px] text-emerald-400 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-black">
                  Jester Response Template:
                </label>
                <textarea
                  rows={2}
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Hark! I shall compile that dynamic module instantly! 🃏🛠️ [TIME]"
                  required
                  className="w-full bg-black border border-zinc-900 hover:border-zinc-800 focus:border-emerald-500 rounded px-2.5 py-1.5 text-[10px] text-zinc-300 resize-none focus:outline-none"
                />
                <span className="text-[6.5px] text-zinc-650 uppercase tracking-wide block">
                  Supportable Tags: [TIME], [CLICKS], [KEYSTROKES], [VIEWS], [RHYTHM], [JESTER_NAME]
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black text-[9px] font-mono font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)] flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Register Cognitive Vector
              </button>
            </form>
          </div>

          {/* Section 2: Active System Match Sandbox */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-4 shadow-lg text-left">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-yellow-400" />
                <h2 className="text-xs font-black text-white uppercase tracking-wider">Predictive Match Sandbox</h2>
              </div>
              <span className="text-[7px] text-yellow-500 font-mono font-black tracking-widest uppercase">TEST ARENA</span>
            </div>

            <div className="space-y-3">
              <p className="text-[9.5px] text-zinc-400 leading-normal">
                Submit a mock message to simulate cognitive parsing and analyze final calculated scores.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && evaluateSandbox()}
                  placeholder="Type a trial query... e.g. hi buddy how are you"
                  className="flex-1 bg-black border border-zinc-900 hover:border-zinc-800 focus:border-yellow-400 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={evaluateSandbox}
                  className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg transition cursor-pointer flex items-center gap-1 shadow-[0_0_8px_rgba(234,179,8,0.2)]"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Evaluate
                </button>
              </div>

              {sandboxResult && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  {/* Top triggered rule summary */}
                  <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl">
                    <span className="text-[8px] font-mono text-yellow-400 font-black tracking-widest uppercase block mb-1">
                      Matched Predictive Vector
                    </span>
                    {sandboxResult.matchedRule ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-black text-white uppercase">{sandboxResult.matchedRule.intent}</span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Score: {(100 * learningRegexEngine.getWeight(sandboxResult.matchedRule.id)).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 italic leading-relaxed font-mono truncate">
                          pattern: {sandboxResult.matchedRule.pattern}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold font-mono">
                        [NO MATCH DETECTED :: FALLBACK ROUTED]
                      </span>
                    )}
                  </div>

                  {/* Mathematical breakdowns */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-mono text-zinc-500 font-black uppercase tracking-widest block">
                      Evaluation Weights Ledger
                    </span>
                    <div className="space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar">
                      {sandboxResult.scoreBreakdown.map((item: any) => (
                        <div 
                          key={item.rule.id} 
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded text-[10px] font-mono border ${
                            item.isMatch 
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                              : 'bg-black border-zinc-900 text-zinc-500'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${item.isMatch ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-800'}`} />
                            <span className="font-bold">{item.rule.intent}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Base: {item.isMatch ? '100' : '0'}</span>
                            <span>×</span>
                            <span>w: {item.weight.toFixed(2)}</span>
                            <span>=</span>
                            <span className={`font-black ${item.isMatch ? 'text-emerald-400' : ''}`}>
                              {item.finalScore.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Diagnostic Feedback Auditing Logs */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-4 shadow-lg text-left">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-900">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-black text-white uppercase tracking-wider">Dynamic Feedback Logs</h2>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              {feedbackLogs.length === 0 ? (
                <div className="text-center py-6 text-zinc-600 font-mono text-[10px]">
                  [NO FEEDBACK SIGNALS COLLECTED YET]
                </div>
              ) : (
                feedbackLogs.map((log, index) => {
                  const isPositive = log.type === 'positive';
                  const isNegative = log.type === 'negative';
                  const isCorrection = log.type === 'correction';

                  return (
                    <div 
                      key={index} 
                      className="p-2 bg-black border border-zinc-900 rounded-lg flex flex-col gap-1 text-[9.5px] font-mono"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-600 text-[8px]">{log.timestamp}</span>
                        <span className={`px-1 rounded text-[8px] font-bold uppercase ${
                          isPositive 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : (isNegative ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400')
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-1 text-zinc-300">
                        <span>Intent</span>
                        <span className="font-bold text-white uppercase bg-zinc-900 px-1 py-[1px] rounded">
                          {log.intent}
                        </span>
                        {log.triggerWord && (
                          <>
                            <span>trigger:</span>
                            <span className="text-yellow-400 italic">
                              &ldquo;{log.triggerWord}&rdquo;
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex justify-between border-t border-zinc-900/60 pt-1 mt-1 text-[8.5px] text-zinc-500">
                        <span>Weight Shift:</span>
                        <span>
                          {log.weightBefore.toFixed(2)} &rarr; {log.weightAfter.toFixed(2)}
                        </span>
                      </div>

                      {log.neuralContext && (
                        <div className="mt-2 pt-2 border-t border-purple-950/40 space-y-1.5 bg-[#09050d]/40 p-1.5 rounded border border-purple-950/10">
                          <div className="flex items-center gap-1 text-purple-400 font-bold text-[8px] uppercase tracking-wide">
                            <Brain className="w-2.5 h-2.5 animate-pulse" />
                            <span>Neural Context Injected</span>
                          </div>
                          
                          <p className="text-[8.5px] text-zinc-400 italic font-sans leading-normal">
                            &ldquo;{log.neuralContext.systemInsight}&rdquo;
                          </p>

                          <div className="space-y-1 pl-1 border-l border-purple-900/40 text-[7.5px]">
                            {log.neuralContext.analyzedTasks.slice(0, 2).map((t, idx) => (
                              <div key={idx} className="text-zinc-500 truncate" title={t}>
                                📋 {t}
                              </div>
                            ))}
                            {log.neuralContext.analyzedErrors.slice(0, 2).map((err, idx) => (
                              <div key={idx} className="text-red-400/80 truncate" title={err}>
                                ⚠️ {err}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
