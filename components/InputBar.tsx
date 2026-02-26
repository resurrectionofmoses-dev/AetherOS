
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XIcon } from './icons/XIcon';
import { TerminalIcon, FileIcon, UploadIcon, ZapIcon, SpinnerIcon } from './icons';
import type { AttachedFile } from '../types';
import { BinaryFileAttachment } from './BinaryFileAttachment';
import { isBinaryFile } from '../utils';
import { transcribeAudio } from '../services/geminiService';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  attachedFiles: AttachedFile[];
  onFilesChange: (files: FileList | null) => void;
  onRemoveFile: (fileName: string) => void;
  onScanFile: (fileName: string) => void;
}

export const InputBar: React.FC<InputBarProps> = ({ 
    onSendMessage, isLoading, inputText, setInputText, 
    isRecording, onToggleRecording, attachedFiles, onFilesChange, onRemoveFile, onScanFile
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const dragCounter = useRef(0);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputText.trim() || attachedFiles.length > 0) {
      onSendMessage(inputText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startRecording = useCallback(async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          mediaRecorder.onstop = async () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              setIsTranscribing(true);
              try {
                  const reader = new FileReader();
                  reader.readAsDataURL(audioBlob);
                  reader.onloadend = async () => {
                      const base64Audio = (reader.result as string).split(',')[1];
                      const transcription = await transcribeAudio(base64Audio, 'audio/webm');
                      if (transcription) {
                        setInputText(prev => prev + (prev ? ' ' : '') + transcription);
                      }
                  };
              } catch (err) {
                  console.error("[VOICE] Transcription failed:", err);
              } finally {
                  setIsTranscribing(false);
              }
              // Stop all tracks in the stream
              stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          onToggleRecording();
      } catch (err) {
          console.error("[VOICE] Failed to start recording:", err);
          alert("Microphone access denied. Conjunction bridge severed.");
      }
  }, [onToggleRecording, setInputText]);

  const stopRecording = useCallback(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          onToggleRecording();
      }
  }, [onToggleRecording]);

  const handleMicClick = () => {
      if (isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesChange(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [inputText]);
  
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const placeholder = "Conduct a neural command... (Shift+Enter for newline)";
  
  const textFiles = attachedFiles.filter(f => !isBinaryFile(f.name));
  const binaryFiles = attachedFiles.filter(f => isBinaryFile(f.name));
  const hasAttachments = textFiles.length > 0 || binaryFiles.length > 0;

  return (
    <div className="p-4 pt-2 bg-slate-900 border-t-4 border-black relative">
      <div className="max-w-4xl mx-auto">
        <div 
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col rounded-2xl border-4 transition-all duration-500 relative overflow-hidden shadow-[8px_8px_0_0_#000] ${
            isDragging 
            ? 'border-amber-500 border-dashed bg-amber-950/20 scale-[1.02] shadow-[0_0_50px_rgba(245,158,11,0.3)] ring-4 ring-amber-500/10' 
            : 'border-black bg-slate-800'
          }`}
        >
            {/* Neural Ingress Overlay - Visible only during active drag */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[6px] flex flex-col items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-300">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0)_0%,_rgba(245,158,11,0.1)_50%,_rgba(245,158,11,0)_100%)] animate-pulse pointer-events-none" />
                    <div className="flex flex-col items-center gap-6 relative z-10">
                        <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.7)] animate-bounce relative">
                           <UploadIcon className="w-12 h-12 text-black" />
                           <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping opacity-30" />
                        </div>
                        <div className="text-center">
                            <span className="text-3xl font-comic-header text-amber-400 uppercase tracking-[0.4em] italic wisdom-glow block drop-shadow-lg">Release to Conduct</span>
                            <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.2em] mt-2 bg-black/40 px-4 py-1 rounded-full border border-amber-500/20">Maestro's Ingress Terminal Active</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Attachment Staging Area */}
            {hasAttachments && (
                <div className="bg-black/40 border-b-4 border-black p-3 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-1 px-1">
                        <div className="flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                            <TerminalIcon className="w-3 h-3" />
                            <span>Staging Buffer: {attachedFiles.length} Object{attachedFiles.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                    
                    {binaryFiles.length > 0 && (
                        <div className="space-y-2">
                            {binaryFiles.map(file => (
                                <BinaryFileAttachment key={file.name} file={file} onScan={onScanFile} onRemove={onRemoveFile} />
                            ))}
                        </div>
                    )}

                    {textFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {textFiles.map(file => (
                                <div key={file.name} className="flex items-center gap-2 bg-gray-900 rounded-lg py-1.5 px-3 text-[10px] text-white border-2 border-black group hover:border-blue-500/50 transition-all">
                                    <FileIcon className="w-3 h-3" />
                                    <span className="font-mono truncate max-w-[150px]">{file.name}</span>
                                    <button onClick={() => onRemoveFile(file.name)} className="text-gray-600 hover:text-red-500 transition-colors">
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Input Form Area */}
            <form onSubmit={handleSubmit} className="flex items-end gap-3 p-3">
                <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    onChange={(e) => onFilesChange(e.target.files)}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={handleAttachClick}
                    className="w-12 h-12 rounded-xl text-gray-800 bg-gray-300 hover:bg-white flex items-center justify-center flex-shrink-0 transition-all border-4 border-black shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"
                    aria-label="Upload Firmware"
                >
                    <PaperclipIcon className="w-6 h-6" />
                </button>
                
                <div className="flex-1 relative group">
                    <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRecording ? "Listening to the void..." : isTranscribing ? "Siphoning voice logic..." : placeholder}
                        className="w-full bg-black/60 border-4 border-black rounded-xl p-3 max-h-48 text-amber-400 placeholder:text-gray-800 focus:outline-none focus:border-amber-600 transition-all font-mono text-sm leading-relaxed"
                        rows={1}
                        disabled={isLoading || isTranscribing}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleMicClick}
                        disabled={isTranscribing}
                        className={`w-12 h-12 rounded-xl text-white flex items-center justify-center flex-shrink-0 transition-all duration-300 relative border-4 border-black shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none ${
                            isRecording 
                            ? 'bg-red-600' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        aria-label={isRecording ? 'Stop listening' : 'Start listening'}
                    >
                        {isRecording && <div className="absolute inset-0 rounded-lg bg-red-500/30 animate-ping"></div>}
                        {isTranscribing ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : <MicrophoneIcon className="w-6 h-6 z-10" />}
                    </button>
                    
                    <button
                        type="submit"
                        disabled={isLoading || isTranscribing || (!inputText.trim() && attachedFiles.length === 0)}
                        className="w-12 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-black flex items-center justify-center flex-shrink-0 disabled:bg-gray-700 disabled:text-gray-800 disabled:cursor-not-allowed transition-all border-4 border-black shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"
                    >
                        <ZapIcon className="w-6 h-6" />
                    </button>
                </div>
            </form>
        </div>
        
        {/* Subtle status indicators */}
        <div className="mt-2 flex justify-between px-2">
            <div className="flex gap-4">
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Logic: {inputText.length} bits</span>
                {isLoading && <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Maestro Thinking...</span>}
                {isTranscribing && <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">Voice Siphon Active...</span>}
            </div>
            <span className="text-[8px] font-black text-gray-800 uppercase tracking-tighter italic">"Precision conduction requires focus."</span>
        </div>
      </div>
    </div>
  );
};
