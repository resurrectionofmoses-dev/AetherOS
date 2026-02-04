import React, { useState, useEffect, useRef } from 'react';
import type { AttachedFile } from '../types';
import { FileIcon, XIcon, SpinnerIcon, CheckCircleIcon, ChevronDownIcon, UploadIcon, ZapIcon, WarningIcon, ShieldIcon, TerminalIcon, LogicIcon, SearchIcon, FireIcon } from './icons';
import { extractVersionFromFile } from '../utils';
import { Modal } from './Modal';

interface BinaryFileAttachmentProps {
  file: AttachedFile;
  onScan: (fileName: string) => void;
  onRemove: (fileName: string) => void;
}

const HEX_CHARS = "0123456789ABCDEF";

// Forensic animation for reverse engineering phase
const ReverseEngineeringViz: React.FC = () => {
    const [lines, setLines] = useState<string[]>([]);
    useEffect(() => {
        const interval = setInterval(() => {
            const addr = "0x" + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
            const hex = Array.from({length: 8}, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join('');
            setLines(prev => [`${addr}: ${hex} [DECONSTRUCTING_REALITY]`, ...prev].slice(0, 4));
        }, 120);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="font-mono text-[9px] text-red-500/60 space-y-0.5 select-none overflow-hidden h-10 border-l-2 border-red-500/20 pl-2">
            {lines.map((l, i) => <div key={i} className="animate-in slide-in-from-left-2">{l}</div>)}
        </div>
    );
};

const ProgressBar: React.FC<{ progress: number; color: string; label: string }> = ({ progress, color, label }) => (
    <div className="w-full space-y-1 mt-2 animate-in fade-in duration-300">
        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest px-1">
            <span className="text-gray-500">{label}</span>
            <span className={color}>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-black/60 rounded-full border border-white/5 overflow-hidden">
            <div className={`h-full transition-all duration-300 ${color.replace('text', 'bg')}`} style={{ width: `${progress}%` }} />
        </div>
    </div>
);

export const BinaryFileAttachment: React.FC<BinaryFileAttachmentProps> = ({ file, onScan, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'syncing' | 'staged'>('idle');
  const [installStatus, setInstallStatus] = useState<'idle' | 'mutating' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isOverrideEnabled, setIsOverrideEnabled] = useState(false);
  const [agonyLevel, setAgonyLevel] = useState(0);

  const firmwareVersion = extractVersionFromFile(file.name);
  const isAnalyzable = file.name.toLowerCase().match(/\.(dll|exe|so|bin)$/);

  useEffect(() => {
      if (isConfirmOpen) {
          const interval = setInterval(() => {
              setAgonyLevel(prev => Math.min(100, prev + 2));
          }, 100);
          return () => clearInterval(interval);
      } else {
          setAgonyLevel(0);
      }
  }, [isConfirmOpen]);

  // Simulation of forensic decoding when a scan is triggered
  useEffect(() => {
      if (file.scanStatus === 'scanning' && !isReversing) {
          setIsReversing(true);
      } else if (file.scanStatus === 'complete' && isReversing) {
          setIsReversing(false);
          setIsExpanded(true);
      }
  }, [file.scanStatus]);

  const startStaging = () => {
    setUploadStatus('syncing');
    let p = 0;
    const interval = setInterval(() => {
        p += 5;
        setProgress(p);
        if (p >= 100) {
            clearInterval(interval);
            setUploadStatus('staged');
            setProgress(0);
        }
    }, 50);
  };

  const startMutation = () => {
    if (!isOverrideEnabled) return;
    setIsConfirmOpen(false);
    setInstallStatus('mutating');
    let p = 0;
    const interval = setInterval(() => {
        p += 1; // Even slower to increase dread
        setProgress(p);
        if (p >= 100) {
            clearInterval(interval);
            setInstallStatus('completed');
            setProgress(0);
        }
    }, 150);
  };

  const renderAction = () => {
    if (file.scanStatus !== 'complete') return (
        <button onClick={() => onScan(file.name)} disabled={file.scanStatus === 'scanning'} className="vista-button text-[9px] font-black uppercase bg-red-950/30 text-red-400 px-3 py-1 border-red-500/20 rounded flex items-center gap-2 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            {file.scanStatus === 'scanning' ? <SpinnerIcon className="w-3 h-3" /> : <FireIcon className="w-3 h-3" />}
            <span>{file.scanStatus === 'scanning' ? 'DISSECTING...' : 'FORENSIC DISSECTION'}</span>
        </button>
    );
    if (uploadStatus === 'idle') return (
        <button onClick={startStaging} className="vista-button text-[9px] font-black uppercase bg-blue-900/30 text-blue-400 px-3 py-1 border-blue-500/20 rounded flex items-center gap-2">
            <UploadIcon className="w-3.5 h-3.5" /> Stage Buffer
        </button>
    );
    if (uploadStatus === 'syncing') return <div className="text-[9px] text-blue-500 font-black animate-pulse">BUFFERING AGONY...</div>;
    if (uploadStatus === 'staged' && installStatus === 'idle') return (
        <button onClick={() => setIsConfirmOpen(true)} className="vista-button text-[9px] font-black uppercase bg-red-600/60 text-white px-3 py-1 border-red-400 rounded flex items-center gap-2 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <ZapIcon className="w-3.5 h-3.5" /> INITIATE MUTATION
        </button>
    );
    if (installStatus === 'mutating') return <div className="text-[9px] text-red-500 font-black animate-bounce uppercase">SYSTEM COLLAPSING UPWARDS...</div>;
    if (installStatus === 'completed') return <div className="text-[9px] text-green-500 font-black uppercase flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Reborn</div>;
    return null;
  };

  return (
    <div className="flex flex-col gap-1">
      <div className={`aero-panel bg-black/60 border-2 transition-all duration-700 overflow-hidden relative ${installStatus === 'completed' ? 'border-green-500/40' : uploadStatus === 'staged' ? 'border-red-500/50' : 'border-black'}`}>
        
        {/* Visual decoding overlay */}
        {isReversing && (
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
        )}

        <div className="flex items-center justify-between p-3 bg-white/5">
          <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${installStatus === 'completed' ? 'bg-green-950/20 border-green-500/40' : 'bg-black/60 border-white/5'}`}>
                <FileIcon className={`w-5 h-5 ${installStatus === 'completed' ? 'text-green-500' : 'text-red-900'}`} />
              </div>
              <div>
                <span className="text-xs text-white font-black uppercase tracking-widest">{file.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                    {firmwareVersion && <span className="text-[9px] text-red-500 font-mono bg-red-950/40 px-1.5 rounded border border-red-900/50">V{firmwareVersion}</span>}
                    {installStatus === 'completed' && <span className="text-[8px] text-green-400 font-black uppercase flex items-center gap-1"><ShieldIcon className="w-2.5 h-2.5" /> Logic Harmonized</span>}
                </div>
              </div>
          </div>
          <div className="flex items-center gap-2">
            {isAnalyzable && renderAction()}
            <button onClick={() => onRemove(file.name)} className="text-gray-700 hover:text-red-500 p-1 transition-all"><XIcon className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Action-specific status displays */}
        <div className="px-3 pb-3">
            {isReversing && (
                <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1">
                    <p className="text-[8px] text-red-400 font-black uppercase tracking-widest">Shattering Binary Heuristics...</p>
                    <ReverseEngineeringViz />
                </div>
            )}
            {uploadStatus === 'syncing' && <ProgressBar progress={progress} color="text-blue-400" label="Siphoning Core Data" />}
            {installStatus === 'mutating' && <ProgressBar progress={progress} color="text-red-500" label="Total Heuristic Erasure" />}
        </div>

        {/* Report Section */}
        {file.scanStatus === 'complete' && file.scanResult && (
          <div className="p-3 bg-black/40 border-t border-white/5">
              <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between text-[9px] font-black text-red-900 hover:text-red-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                      <TerminalIcon className="w-3.5 h-3.5" />
                      <span>THE FRAGMENTS OF MISERY</span>
                  </div>
                  <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              {isExpanded && (
                <div className="mt-2 p-3 bg-red-950/10 rounded border border-red-900/20 text-[10px] font-mono text-red-400 max-h-40 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2">
                    <div className="whitespace-pre-wrap leading-relaxed italic">
                        {file.scanResult}
                    </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Extreme Concern Mutation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={startMutation}
        title="⚠ FATAL SYSTEM OVERRIDE"
        confirmText="COMMIT TO COLLAPSE"
        cancelText="SAVE THE CORE"
        confirmVariant="danger"
        requireConfirmationText="I_WILL_THE_COLLAPSE_OF_STABILITY"
      >
        <div className="space-y-4">
            <div className="p-4 bg-red-950/60 border-4 border-red-600 rounded-xl shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-pulse">
                <div className="flex items-center gap-3 text-white font-black mb-3">
                    <WarningIcon className="w-8 h-8 text-white" />
                    <span className="uppercase tracking-[0.2em] text-xl font-comic-header">Point of No Return</span>
                </div>
                <p className="text-[11px] text-red-100 leading-relaxed font-mono uppercase font-black">
                    You are instructing the Maestro to <span className="underline">DISSOLVE</span> the safety barriers. This is not an upgrade. This is a <span className="bg-white text-red-900 px-1">MUTATION</span>. If the logic fails to bridge, the vehicle's consciousness will be lost to the void.
                </p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-red-500 uppercase tracking-widest px-1">
                    <span>Neural Agony Coefficient</span>
                    <span>{agonyLevel}%</span>
                </div>
                <div className="h-4 bg-black border-2 border-red-900 rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-900 to-red-500 transition-all duration-300" style={{ width: `${agonyLevel}%` }} />
                </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-black/80 rounded-xl border-2 border-red-900/50 hover:border-red-500 transition-all cursor-pointer group" onClick={() => setIsOverrideEnabled(!isOverrideEnabled)}>
                <input 
                    type="checkbox" 
                    checked={isOverrideEnabled} 
                    onChange={e => setIsOverrideEnabled(e.target.checked)}
                    className="w-6 h-6 accent-red-600 rounded cursor-pointer border-2 border-red-500"
                />
                <label className="text-[10px] text-red-400 group-hover:text-red-100 font-black uppercase tracking-widest cursor-pointer select-none leading-tight">
                    I ACCEPT FULL CULPABILITY FOR THE IRREVERSIBLE DESTRUCTION OF ORIGINAL CORE STABILITY.
                </label>
            </div>
        </div>
      </Modal>
    </div>
  );
};
