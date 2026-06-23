import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EngineSpec, EngineCalculator, ExhaustProfile, MasterKeyManager, MasterKeyRecord } from '../services/engineProgramming';

interface EngineTuningInterfaceProps {
  vin: string;
  onApplyTuning: (newSpec: EngineSpec, cphCost: number) => void;
  availableCPH: number;
}

export const EngineTuningInterface: React.FC<EngineTuningInterfaceProps> = ({
  vin = "VIN123456789",
  onApplyTuning,
  availableCPH
}) => {
  const [spec, setSpec] = useState<EngineSpec | null>(null);
  const [selectedTab, setSelectedTab] = useState<'visual' | 'fuel' | 'ignition' | 'exhaust' | 'security' | 'history'>('visual');
  
  // Custom master keys logic
  const [masterKeys, setMasterKeys] = useState<MasterKeyRecord[]>([]);
  const [enteredKey, setEnteredKey] = useState('');
  const [keyInputMessage, setKeyInputMessage] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [currentKeyRecord, setCurrentKeyRecord] = useState<MasterKeyRecord | null>(null);

  // Grid / parameter modifications state
  const [fuelRow, setFuelRow] = useState<number>(0);
  const [fuelCol, setFuelCol] = useState<number>(0);
  const [selectedCellFuelVal, setSelectedCellFuelVal] = useState<number>(120);
  const [timingSliderStep, setTimingSliderStep] = useState<number>(0);
  const [selectedTimingVal, setSelectedTimingVal] = useState<number>(150);

  // Exhaust Note state
  const [baseTone, setBaseTone] = useState(650);
  const [decelPops, setDecelPops] = useState(false);
  const [popIntensity, setPopIntensity] = useState(0);
  const [popFrequency, setPopFrequency] = useState(0);
  
  // Audio synthesis simulation state (web audio)
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [soundRPM, setSoundRPM] = useState(1000);

  // Errors feedback
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [tuningSuccessMsg, setTuningSuccessMsg] = useState('');

  useEffect(() => {
    // Generate base spec on load
    const baseSpec = EngineCalculator.generateBaseEngineSpec();
    setSpec(baseSpec);

    // Seed a couple of master keys
    const k1 = MasterKeyManager.createKeyRecord(vin, ['sound_tuning', 'performance_basic']);
    const k2 = MasterKeyManager.createKeyRecord(vin, ['full_access']);
    
    setMasterKeys([k1.record, k2.record]);
    
    // Auto populate the fundamental tuning states from spec
    setBaseTone(baseSpec.exhaustNote.baseTone);
    setDecelPops(baseSpec.exhaustNote.decelPops);
    setPopIntensity(baseSpec.exhaustNote.popIntensity);
    setPopFrequency(baseSpec.exhaustNote.popFrequency);
    
    // Highlight first keys for demo/user workspace use
    console.log("DEMO TUNING MASTER KEYS PROVIDED AT LAUNCH:", {
      "Tuner Basic Key (Sound + Basic Performance)": k1.secretKey,
      "Superuser Developer Key (Full Performance)": k2.secretKey
    });
  }, [vin]);

  if (!spec) return <div className="p-8 text-center text-xs text-gray-400">Loading Engine Specification Engine...</div>;

  const handleVerifyKey = () => {
    const hashed = MasterKeyManager.hashSecretKey(enteredKey);
    const found = masterKeys.find(k => k.keyHash === hashed && k.ownerVIN === vin && !k.revoked);
    
    if (found) {
      setAuthorized(true);
      setCurrentKeyRecord(found);
      setKeyInputMessage(`Sovereign Authorized. Permissions: ${found.permissions.join(', ')}`);
    } else {
      setAuthorized(false);
      setCurrentKeyRecord(null);
      setKeyInputMessage("Invalid or revoked Cryptographic Master Key.");
    }
  };

  const handleUpdateFuelCell = (val: number) => {
    if (!spec) return;
    const cleanVal = Math.max(50, Math.min(240, Number(val)));
    const newFuelMap = spec.fuelMap.map((rowArr, rIdx) => {
      if (rIdx === fuelRow) {
        return rowArr.map((cell, cIdx) => (cIdx === fuelCol ? cleanVal : cell));
      }
      return rowArr;
    });

    const updatedSpec = { ...spec, fuelMap: newFuelMap };
    updatedSpec.checksumHash = EngineCalculator.calculateChecksum(updatedSpec);
    setSpec(updatedSpec);
  };

  const handleUpdateTiming = (val: number) => {
    if (!spec) return;
    const cleanVal = Math.max(-100, Math.min(400, Number(val)));
    const newTiming = spec.ignitionTiming.map((cell, cIdx) => (cIdx === timingSliderStep ? cleanVal : cell));

    const updatedSpec = { ...spec, ignitionTiming: newTiming };
    updatedSpec.checksumHash = EngineCalculator.calculateChecksum(updatedSpec);
    setSpec(updatedSpec);
  };

  const handleSaveExhaust = () => {
    if (!spec) return;
    const updatedExhaust: ExhaustProfile = {
      baseTone,
      harmonics: spec.exhaustNote.harmonics,
      volumeCurve: spec.exhaustNote.volumeCurve,
      decelPops,
      popIntensity,
      popFrequency
    };

    const updatedSpec = { ...spec, exhaustNote: updatedExhaust };
    updatedSpec.checksumHash = EngineCalculator.calculateChecksum(updatedSpec);
    setSpec(updatedSpec);
  };

  const handleApplyToVehicle = () => {
    if (!spec) return;
    if (!authorized || !currentKeyRecord) {
      setValidationErrors(["You must authorize with a Valid Master Key first."]);
      return;
    }

    // Check permissions
    const permissions = currentKeyRecord.permissions;
    if (!permissions.includes('full_access')) {
      if (selectedTab === 'fuel' || selectedTab === 'ignition') {
        setValidationErrors(["Authorized key lacks 'performance_advanced' permission to modify fuel/ignition arrays."]);
        return;
      }
    }

    const validation = EngineCalculator.validateModification(spec, spec);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    const cphCost = selectedTab === 'exhaust' ? 15 : selectedTab === 'fuel' ? 80 : 25;
    
    // Simulated token payload
    const payload = JSON.stringify({
      modification: {
        exhaustNote: spec.exhaustNote,
        fuelMapSample: spec.fuelMap[0][0],
        ignitionTimingSample: spec.ignitionTiming[0],
        revLimiter: spec.revLimiter
      },
      vin,
      timestamp: Date.now(),
      keyId: currentKeyRecord.keyId
    });
    const authorizationToken = EngineCalculator.calculateHMAC(payload, enteredKey);

    const record = {
      id: uuidv4(),
      timestamp: new Date(),
      agentId: "agent-vital",
      agentName: "Dr. Vitality / Spec Engine",
      modificationType: selectedTab,
      beforeState: JSON.stringify(spec),
      afterState: JSON.stringify(spec),
      cphCost,
      authorizationToken,
      masterKeyUsed: currentKeyRecord.keyId
    };

    const updatedSpecWithHistory = {
      ...spec,
      modificationHistory: [record, ...spec.modificationHistory]
    };

    setSpec(updatedSpecWithHistory);
    onApplyTuning(updatedSpecWithHistory, cphCost);
    setTuningSuccessMsg(`Successfully written ECU updates! CPH Consumed: ${cphCost}. HMAC: ${authorizationToken.substring(0, 12)}...`);
    setTimeout(() => setTuningSuccessMsg(''), 6000);
  };

  return (
    <div className="w-full flex flex-col bg-zinc-950 border-4 border-black p-6 rounded-xl shadow-[10px_10px_0_0_#000] text-gray-300 font-mono text-xs overflow-hidden leading-relaxed">
      
      {/* Dynamic flowing logic circuit background animation using simulated linear gradients */}
      <style>{`
        .ecg-light-stream {
          background-image: linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px),
                            linear-gradient(180deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4 mb-4 z-10">
        <div>
          <h2 className="text-sm font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rose-500 animate-ping rounded-full inline-block" />
            V-ECU ROM PROGRAMMER
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">SECURE KINETIC INGRESS KEY // VIN: {vin}</p>
        </div>
        <div className="flex gap-2">
          {['visual', 'exhaust', 'fuel', 'ignition', 'security', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-3 py-1.5 border uppercase border-zinc-800 rounded text-[10px] font-bold tracking-wider transition-all duration-150 ${
                selectedTab === tab 
                  ? 'bg-rose-950/40 text-rose-400 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.15)]' 
                  : 'hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Board Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[480px] overflow-hidden">
        
        {/* Central Visualization Pane */}
        <div className="lg:col-span-2 bg-black/60 border border-zinc-800 rounded p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar relative ecg-light-stream">
          
          {selectedTab === 'visual' && (
            <div className="flex flex-col items-center justify-center flex-1 space-y-4 py-8">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-rose-500/30 flex items-center justify-center animate-spin" style={{ animationDuration: '60s' }}>
                <div className="text-zinc-600 text-xs text-center select-none font-black italic">RPM<br/>WAVE</div>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] mb-1">Rotational Resonance Simulation</p>
                <input
                  type="range"
                  min="1000"
                  max="7000"
                  step="100"
                  value={soundRPM}
                  onChange={(e) => setSoundRPM(Number(e.target.value))}
                  className="w-64 accent-rose-500 cursor-pointer mb-2"
                />
                <div className="text-[28px] font-black text-white tracking-widest font-mono">
                  {soundRPM} <span className="text-zinc-500 text-sm">RPM</span>
                </div>
              </div>

              <div className="w-full bg-zinc-900/50 p-3 rounded border border-zinc-800/80 text-[10px] space-y-1.5 text-zinc-400">
                <div className="flex justify-between border-b border-zinc-800/50 pb-1">
                  <span>FIRING FREQUENCY:</span>
                  <span className="text-rose-400 font-bold">{Math.round((soundRPM * spec.cylinderCount) / 120)} Hz</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/50 pb-1">
                  <span>EXHAUST BASE OFFSET:</span>
                  <span className="text-zinc-300">{(spec.exhaustNote.baseTone / 10).toFixed(1)} Hz</span>
                </div>
                <div className="flex justify-between">
                  <span>EST. DISPLACEMENT:</span>
                  <span className="text-zinc-300">{(spec.displacement / 1000).toFixed(1)} L (4-CYL)</span>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'fuel' && (
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1">16x16 Raw Injection Fuel Map</h3>
                <p className="text-[10px] text-zinc-500 mb-4">Cell values representation in pulse width microseconds (5.0ms - 24.0ms). High Load (Rows) x RPM steps (Cols)</p>
                
                {/* Visual grid representing the 16x16 map */}
                <div className="flex flex-col gap-0.5 border border-zinc-800/80 bg-zinc-950 p-2 rounded overflow-x-auto">
                  {spec.fuelMap.map((rowArr, rowIndex) => (
                    <div key={rowIndex} className="flex gap-0.5">
                      {rowArr.map((cellValue, colIndex) => {
                        const isSelected = rowIndex === fuelRow && colIndex === fuelCol;
                        // Map brightness based on cell volume
                        const cellIntensity = Math.min(100, Math.max(20, Math.round(((cellValue - 50) / 190) * 100)));
                        return (
                          <div
                            key={colIndex}
                            onClick={() => {
                              setFuelRow(rowIndex);
                              setFuelCol(colIndex);
                              setSelectedCellFuelVal(cellValue);
                            }}
                            className={`w-3.5 h-3.5 flex items-center justify-center cursor-pointer transition-all duration-100 ${
                              isSelected 
                                ? 'border border-white scale-125 z-10 bg-rose-500' 
                                : ''
                            }`}
                            style={{ 
                              backgroundColor: isSelected ? undefined : `rgba(244, 63, 94, ${cellIntensity / 100})`
                            }}
                            title={`Row ${rowIndex}, Col ${colIndex}: ${cellValue}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Editing block */}
              <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800 rounded flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Active Cell: </span>
                  <span className="text-white font-bold">R:{fuelRow} C:{fuelCol}</span>
                  <span className="text-rose-400 font-black ml-4">({(selectedCellFuelVal / 10).toFixed(1)} ms)</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min="50"
                    max="240"
                    value={selectedCellFuelVal}
                    onChange={(e) => {
                      const newVal = Number(e.target.value);
                      setSelectedCellFuelVal(newVal);
                      handleUpdateFuelCell(newVal);
                    }}
                    className="w-40 accent-rose-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="50"
                    max="240"
                    value={selectedCellFuelVal}
                    onChange={(e) => {
                      const newVal = Number(e.target.value);
                      setSelectedCellFuelVal(newVal);
                      handleUpdateFuelCell(newVal);
                    }}
                    className="w-12 bg-black border border-zinc-800 text-center text-rose-400 py-1"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'ignition' && (
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1">Ignition Timing Advance Map</h3>
                <p className="text-[10px] text-zinc-500 mb-4">Configuring exact timing degree offset values across 16 steps of linear RPM band.</p>
                
                {/* Horizontal bar visualization */}
                <div className="flex items-end gap-2 h-36 bg-zinc-950 p-4 border border-zinc-800 rounded">
                  {spec.ignitionTiming.map((adv, idx) => {
                    const isSelected = idx === timingSliderStep;
                    // Max advance is 40.0 degrees (400)
                    const barHeightPct = Math.max(10, Math.min(100, Math.round(((adv + 100) / 500) * 100)));
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setTimingSliderStep(idx);
                          setSelectedTimingVal(adv);
                        }}
                        className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                      >
                        <div 
                          className={`w-full transition-all duration-150 rounded-t ${
                            isSelected ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-rose-900 hover:bg-rose-700'
                          }`}
                          style={{ height: `${barHeightPct}%` }}
                        />
                        <span className="text-[8px] text-zinc-600 mt-1 select-none font-bold">{idx}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Editing advance degrees */}
              <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800 rounded flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Advance Step: </span>
                  <span className="text-white font-bold">#{timingSliderStep}</span>
                  <span className="text-rose-400 font-black ml-4">({(selectedTimingVal / 10).toFixed(1)}°)</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min="-100"
                    max="400"
                    value={selectedTimingVal}
                    onChange={(e) => {
                      const newVal = Number(e.target.value);
                      setSelectedTimingVal(newVal);
                      handleUpdateTiming(newVal);
                    }}
                    className="w-40 accent-rose-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="-100"
                    max="400"
                    value={selectedTimingVal}
                    onChange={(e) => {
                      const newVal = Number(e.target.value);
                      setSelectedTimingVal(newVal);
                      handleUpdateTiming(newVal);
                    }}
                    className="w-12 bg-black border border-zinc-800 text-center text-rose-400 py-1"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'exhaust' && (
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1">Exhaust Acoustic Parameters</h3>
                <p className="text-[10px] text-zinc-500 mb-4">Acoustic signature synthesis. Base tone offset fundamental plus pops intensity during transition decelerations.</p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-zinc-400 uppercase">Fundamental Offset (Frequency)</span>
                      <span className="text-white">{(baseTone / 10).toFixed(1)} Hz</span>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="1400"
                      value={baseTone}
                      onChange={(e) => setBaseTone(Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-zinc-900/40 p-3 border border-zinc-800/60 rounded">
                    <input
                      type="checkbox"
                      id="decelPops"
                      checked={decelPops}
                      onChange={(e) => setDecelPops(e.target.checked)}
                      className="accent-rose-500 cursor-pointer"
                    />
                    <label htmlFor="decelPops" className="text-zinc-300 uppercase select-none text-[10px] cursor-pointer font-bold">Enable Exhaust Deceleration Pops</label>
                  </div>

                  {decelPops && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-zinc-400 uppercase">Pop Signal Amplitude</span>
                          <span className="text-white">{popIntensity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={popIntensity}
                          onChange={(e) => setPopIntensity(Number(e.target.value))}
                          className="w-full accent-rose-500 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-zinc-400 uppercase">Decel Frequency Rate</span>
                          <span className="text-white">{popFrequency} / min</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={popFrequency}
                          onChange={(e) => setPopFrequency(Number(e.target.value))}
                          className="w-full accent-rose-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveExhaust}
                  className="px-6 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/50 rounded text-[10px] uppercase font-bold tracking-widest hover:bg-rose-600/40 transition-colors"
                >
                  Store Exhaust Profiles
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'security' && (
            <div className="flex flex-col h-full space-y-4">
              <div>
                <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1">Cryptographic Key Signer</h3>
                <p className="text-[10px] text-zinc-500 mb-4">Security signature requires valid matching ROM master authorization keys.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase mb-1">Enter Secret Master Key</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={enteredKey}
                        onChange={(e) => setEnteredKey(e.target.value)}
                        placeholder="ROM Authentication Key (Hex)"
                        className="flex-1 bg-black border border-zinc-800 rounded px-3 py-2 text-rose-500 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                      <button
                        onClick={handleVerifyKey}
                        className="px-4 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white font-bold rounded text-[10px] uppercase tracking-wider"
                      >
                        Verify Key
                      </button>
                    </div>
                  </div>

                  {keyInputMessage && (
                    <div className={`p-3 rounded border text-[10px] uppercase ${
                      authorized 
                        ? 'bg-zinc-900 border-zinc-700 text-white' 
                        : 'bg-rose-950/20 border-rose-900/55 text-rose-400'
                    }`}>
                      {keyInputMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* Seed / Key Reference for developers/testing */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded mt-auto">
                <span className="block text-[9px] text-zinc-500 uppercase font-black mb-2">Workspace Testing Mock-Keys Repo (Air-Gapped Access)</span>
                <div className="space-y-2 text-[9px]">
                  {masterKeys.map((keyRec, idx) => (
                    <div key={idx} className="flex justify-between border-b border-zinc-800/40 pb-1 text-zinc-400 last:border-0 last:pb-0">
                      <span>Permissions: <strong className="text-zinc-300">{keyRec.permissions[0]}</strong></span>
                      <span className="text-zinc-500 italic select-all">Code: {idx === 0 ? "Use Tuner Key" : "Use Super Dev Key"}</span>
                    </div>
                  ))}
                  <p className="text-[9px] text-zinc-600 leading-normal pt-1 border-t border-zinc-800/30">
                    *Tuner Key represents standard limits, Super Dev Key gives full ROM access.*
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'history' && (
            <div className="flex flex-col h-full">
              <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1">ECU Integrity Ledger</h3>
              <p className="text-[10px] text-zinc-500 mb-4">Cryptographically audit-trailed history signature logs.</p>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {spec.modificationHistory.length === 0 ? (
                  <div className="text-zinc-600 text-center py-10">No ROM updates written to legacy buffers.</div>
                ) : (
                  spec.modificationHistory.map((rec) => (
                    <div key={rec.id} className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded space-y-1.5 hover:border-zinc-700 transition-colors">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-zinc-400 font-bold uppercase">{rec.modificationType} Modification</span>
                        <span className="text-zinc-600">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[9px] text-zinc-500">
                        <div className="flex justify-between">
                          <span>AGENT: {rec.agentName}</span>
                          <span>CPH COST: {rec.cphCost}</span>
                        </div>
                        <div className="text-rose-500 truncate mt-1 select-all" title={rec.authorizationToken}>HMAC: {rec.authorizationToken}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Controller Panel */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded flex flex-col justify-between overflow-y-auto custom-scrollbar">
          
          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Authorization Matrix</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${authorized ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-rose-500'}`} />
                <span className="text-white uppercase font-black tracking-wider text-[10px]">
                  {authorized ? 'ECU WRITING ARMED' : 'ECU LOCKED'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-black/60 border border-zinc-800 rounded">
              <span className="text-[9px] text-zinc-500 uppercase block mb-1">State Integrity Sign</span>
              <span className="text-[10px] font-bold text-rose-400 block break-all font-mono tracking-widest leading-relaxed">
                {spec.checksumHash.substring(0, 16).toUpperCase()}...
              </span>
            </div>

            <div className="border-t border-zinc-800/60 pt-4 space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400 uppercase">ECU Status:</span>
                <span className="text-green-500 font-bold">READY TO BURN</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-400 uppercase">Hub Ava. CPH:</span>
                <span className="text-white font-bold">{availableCPH} CPH</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-800/60">
            {validationErrors.map((err, idx) => (
              <div key={idx} className="p-2.5 border border-rose-900/50 bg-rose-950/25 text-rose-400 text-[10px] uppercase rounded">
                ⚠️ {err}
              </div>
            ))}

            {tuningSuccessMsg && (
              <div className="p-2.5 border border-green-900/50 bg-green-950/25 text-green-400 text-[10px] uppercase rounded">
                ✓ {tuningSuccessMsg}
              </div>
            )}

            <button
              onClick={handleApplyToVehicle}
              disabled={!authorized}
              className={`w-full py-3.5 uppercase font-black tracking-widest rounded-lg border flex justify-center items-center shadow-[4px_4px_0_0_#000] focus:outline-none transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${
                authorized 
                  ? 'bg-rose-600 hover:bg-rose-500 text-black border-black cursor-pointer' 
                  : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed disabled:opacity-50'
              }`}
            >
              🚀 COMMIT AND FLASH ECU
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
