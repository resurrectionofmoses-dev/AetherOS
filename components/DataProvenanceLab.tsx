import React, { useState } from 'react';
import { ShieldIcon, CheckCircleIcon, XIcon, ActivityIcon, TerminalIcon, PlusIcon, ServerIcon } from './icons';
import { v4 as uuidv4 } from 'uuid';

interface Dataset {
  id: string;
  name: string;
  provenance: string;
  labelingStandard: 'Gold Standard' | 'Silver Standard' | 'Automated' | 'Unlabeled';
  consentStatus: 'Verified' | 'Pending' | 'Revoked';
  isSynthetic: boolean;
  traceable: boolean;
  validated: boolean;
}

export const DataProvenanceLab: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: uuidv4(),
      name: 'Human Interaction Corpus A',
      provenance: 'Internal User Studies Q1',
      labelingStandard: 'Gold Standard',
      consentStatus: 'Verified',
      isSynthetic: false,
      traceable: true,
      validated: true,
    },
    {
      id: uuidv4(),
      name: 'Simulated Edge Cases',
      provenance: 'Generative Adversarial Network V2',
      labelingStandard: 'Automated',
      consentStatus: 'Verified',
      isSynthetic: true,
      traceable: false,
      validated: false,
    }
  ]);

  const [newName, setNewName] = useState('');
  const [newProvenance, setNewProvenance] = useState('');
  const [newIsSynthetic, setNewIsSynthetic] = useState(false);

  const handleAddDataset = () => {
    if (!newName.trim() || !newProvenance.trim()) return;
    
    const newDataset: Dataset = {
      id: uuidv4(),
      name: newName,
      provenance: newProvenance,
      labelingStandard: 'Unlabeled',
      consentStatus: 'Pending',
      isSynthetic: newIsSynthetic,
      traceable: false,
      validated: false,
    };
    
    setDatasets([...datasets, newDataset]);
    setNewName('');
    setNewProvenance('');
    setNewIsSynthetic(false);
  };

  const toggleValidation = (id: string) => {
    setDatasets(datasets.map(d => d.id === id ? { ...d, validated: !d.validated } : d));
  };

  const toggleTraceability = (id: string) => {
    setDatasets(datasets.map(d => d.id === id ? { ...d, traceable: !d.traceable } : d));
  };

  const updateConsent = (id: string, status: Dataset['consentStatus']) => {
    setDatasets(datasets.map(d => d.id === id ? { ...d, consentStatus: status } : d));
  };

  const updateLabeling = (id: string, standard: Dataset['labelingStandard']) => {
    setDatasets(datasets.map(d => d.id === id ? { ...d, labelingStandard: standard } : d));
  };

  const deleteDataset = (id: string) => {
    setDatasets(datasets.filter(d => d.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-[#02040a] text-gray-200 font-mono overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600/10 border-4 border-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <ServerIcon className="w-10 h-10 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h2 className="font-comic-header text-5xl text-white tracking-tighter italic leading-none uppercase">Data Provenance Lab</h2>
            <div className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
               Track Provenance, Labeling & Consent
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        
        {/* Add Dataset Form */}
        <div className="aero-panel bg-black/80 border-2 border-emerald-600/40 p-6 shadow-xl flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Dataset Name</label>
            <input 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-black/40 border-2 border-black rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-600 transition-all font-bold"
              placeholder="e.g., Synthetic Audio V1"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Provenance / Source</label>
            <input 
              value={newProvenance}
              onChange={(e) => setNewProvenance(e.target.value)}
              className="w-full bg-black/40 border-2 border-black rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-600 transition-all font-bold"
              placeholder="e.g., Generated via GAN model 4.2"
            />
          </div>
          <div className="flex items-center gap-3 pb-2">
            <input 
              type="checkbox" 
              checked={newIsSynthetic}
              onChange={(e) => setNewIsSynthetic(e.target.checked)}
              className="w-5 h-5 accent-emerald-500"
            />
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Is Synthetic</label>
          </div>
          <button 
            onClick={handleAddDataset}
            className="px-6 py-2 bg-emerald-600 text-black rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 font-black uppercase text-xs tracking-widest flex items-center gap-2 border-2 border-black"
          >
            <PlusIcon className="w-4 h-4" /> Register
          </button>
        </div>

        {/* Dataset List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {datasets.map(dataset => {
            const isSyntheticValid = !dataset.isSynthetic || (dataset.traceable && dataset.validated);
            const isConsentValid = dataset.consentStatus === 'Verified';
            const isUsable = isSyntheticValid && isConsentValid;

            return (
              <div key={dataset.id} className={`aero-panel p-6 flex flex-col relative overflow-hidden border-4 border-black shadow-[8px_8px_0_0_#000] transition-all ${isUsable ? 'bg-emerald-950/20' : 'bg-red-950/20'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-comic-header text-2xl text-white italic uppercase tracking-tighter">{dataset.name}</h4>
                      {dataset.isSynthetic && (
                        <span className="px-2 py-0.5 bg-purple-900/50 border border-purple-500 text-purple-400 text-[8px] font-black uppercase rounded">Synthetic</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono">Provenance: <span className="text-gray-300">{dataset.provenance}</span></p>
                  </div>
                  <button onClick={() => deleteDataset(dataset.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Labeling Standard</label>
                    <select 
                      value={dataset.labelingStandard}
                      onChange={(e) => updateLabeling(dataset.id, e.target.value as any)}
                      className="w-full bg-black/40 border border-black rounded px-2 py-1 text-[10px] text-gray-300 focus:outline-none focus:border-emerald-600 transition-all uppercase"
                    >
                      <option value="Gold Standard">Gold Standard</option>
                      <option value="Silver Standard">Silver Standard</option>
                      <option value="Automated">Automated</option>
                      <option value="Unlabeled">Unlabeled</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Consent Status</label>
                    <select 
                      value={dataset.consentStatus}
                      onChange={(e) => updateConsent(dataset.id, e.target.value as any)}
                      className={`w-full bg-black/40 border border-black rounded px-2 py-1 text-[10px] focus:outline-none transition-all uppercase ${dataset.consentStatus === 'Verified' ? 'text-emerald-400' : dataset.consentStatus === 'Revoked' ? 'text-red-400' : 'text-amber-400'}`}
                    >
                      <option value="Verified">Verified</option>
                      <option value="Pending">Pending</option>
                      <option value="Revoked">Revoked</option>
                    </select>
                  </div>
                </div>

                {dataset.isSynthetic && (
                  <div className="bg-black/40 border-2 border-purple-900/30 p-4 rounded-xl mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldIcon className="w-4 h-4 text-purple-500" />
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Synthetic Data Policy</span>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => toggleTraceability(dataset.id)}
                        className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-1 rounded border ${dataset.traceable ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}
                      >
                        {dataset.traceable ? <CheckCircleIcon className="w-3 h-3" /> : <XIcon className="w-3 h-3" />} Traceable
                      </button>
                      <button 
                        onClick={() => toggleValidation(dataset.id)}
                        className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-1 rounded border ${dataset.validated ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}
                      >
                        {dataset.validated ? <CheckCircleIcon className="w-3 h-3" /> : <XIcon className="w-3 h-3" />} Validated
                      </button>
                    </div>
                  </div>
                )}

                <div className={`mt-auto p-3 border-2 rounded-xl flex items-center justify-between ${isUsable ? 'bg-emerald-900/20 border-emerald-600/30' : 'bg-red-900/20 border-red-600/30'}`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isUsable ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isUsable ? 'APPROVED FOR TRAINING' : 'QUARANTINED'}
                  </span>
                  {!isUsable && (
                    <span className="text-[8px] text-red-400/80 font-mono">
                      {!isConsentValid ? 'Missing Consent. ' : ''}
                      {(dataset.isSynthetic && !isSyntheticValid) ? 'Synthetic data lacks traceability/validation.' : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-40 px-12">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Provenance Engine: ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
             <TerminalIcon className="w-4 h-4 text-gray-800" />
             <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.2em]">Data Integrity Enforced.</p>
        </div>
      </div>
    </div>
  );
};
