import React, { useRef, useEffect } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XIcon } from './icons/XIcon';
import { TerminalIcon, FileIcon } from './icons';
import type { AttachedFile } from '../types';
import { BinaryFileAttachment } from './BinaryFileAttachment';
import { isBinaryFile } from '../utils';

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
    // Shift+Enter will naturally result in a newline as preventDefault is not called.
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      // Cap at 200px height for many lines
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
        <div className="flex flex-col rounded-2xl border-4 border-black bg-slate-800 overflow-hidden shadow-[8px_8px_0_0_#000]">
            
            {/* Attachment Staging Area - Visually Distinct */}
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
            <form onSubmit={handleSubmit} className="flex items-end gap-3 p-3 bg-slate-800">
                <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*,audio/*,text/plain,.pdf,.json" // Expanded accepted file types
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
                        placeholder={isRecording ? "Listening to the void..." : placeholder}
                        className="w-full bg-black/60 border-4 border-black rounded-xl p-3 max-h-48 text-amber-400 placeholder:text-gray-800 focus:outline-none focus:border-amber-600 transition-all font-mono text-sm leading-relaxed"
                        rows={1}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onToggleRecording}
                        className={`w-12 h-12 rounded-xl text-white flex items-center justify-center flex-shrink-0 transition-all duration-300 relative border-4 border-black shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none ${
                            isRecording 
                            ? 'bg-red-600' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        aria-label={isRecording ? 'Stop listening' : 'Start listening'}
                    >
                        {isRecording && <div className="absolute inset-0 rounded-lg bg-red-500/30 animate-ping"></div>}
                        <MicrophoneIcon className="w-6 h-6 z-10" />
                    </button>
                    
                    <button
                        type="submit"
                        disabled={isLoading || (!inputText.trim() && attachedFiles.length === 0)}
                        className="w-12 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-black flex items-center justify-center flex-shrink-0 disabled:bg-gray-700 disabled:text-gray-800 disabled:cursor-not-allowed transition-all border-4 border-black shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                            <path d="m22 2-7 20-4-9-9-4Z"/>
                            <path d="M22 2 11 13"/>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
        
        {/* Subtle typing indicator / status */}
        <div className="mt-2 flex justify-between px-2">
            <div className="flex gap-4">
                <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Logic: {inputText.length} bits</span>
                {isLoading && <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Maestro Thinking...</span>}
            </div>
            <span className="text-[8px] font-black text-gray-800 uppercase tracking-tighter italic">"Precision conduction requires focus."</span>
        </div>
      </div>
    </div>
  );
};