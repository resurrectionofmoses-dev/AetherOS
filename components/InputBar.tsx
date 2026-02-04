
import React, { useRef, useEffect, useState } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XIcon } from './icons/XIcon';
import { TerminalIcon, FileIcon, ShieldIcon, ZapIcon } from './icons';
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
  const [showNullError, setShowNullError] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmedText = inputText.trim();
    const hasFiles = attachedFiles.length > 0;
    
    // VALIDATION: Prevent submission if only whitespace is entered and no files are present
    if (trimmedText || hasFiles) {
      onSendMessage(trimmedText); // Conduct the trimmed logic only
      setInputText(''); // Clear buffer
      setShowNullError(false);
    } else if (inputText.length > 0) {
      // User typed something but it's only whitespace
      setShowNullError(true);
      setTimeout(() => setShowNullError(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Shift+Enter allows multiline conduction
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

  // Visual button state logic: Button is disabled if input is empty (trimmed) AND no files are attached
  const isSubmissionDisabled = isLoading || (!inputText.trim() && !hasAttachments);

  return (
    <div className="p-1.5 pt-1 bg-slate-900 border-t-4 border-black relative">
      <div className="max-w-4xl mx-auto">
        <div className={`flex flex-col rounded-lg border-4 border-black bg-slate-800 overflow-hidden shadow-[4px_4px_0_0_#000] transition-all duration-300 ${showNullError ? 'border-red-600 animate-pulse' : ''}`}>
            
            {/* Attachment Staging Area - Visually Distinct */}
            {hasAttachments && (
                <div className="bg-black/40 border-b-4 border-black p-1 space-y-1 animate-in slide-in-from-top-1 duration-300">
                    <div className="flex items-center justify-between mb-0.5 px-0.5">
                        <div className="flex items-center gap-0.5 text-[6px] font-black text-blue-400 uppercase tracking-widest">
                            <TerminalIcon className="w-1.5 h-1.5" />
                            <span>Staging Buffer: {attachedFiles.length} Object{attachedFiles.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="w-0.5 h-0.5 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                    
                    {binaryFiles.length > 0 && (
                        <div className="space-y-0.5">
                            {binaryFiles.map(file => (
                                <BinaryFileAttachment key={file.name} file={file} onScan={onScanFile} onRemove={onRemoveFile} />
                            ))}
                        </div>
                    )}

                    {textFiles.length > 0 && (
                        <div className="flex flex-wrap gap-0.5">
                            {textFiles.map(file => (
                                <div key={file.name} className="flex items-center gap-0.5 bg-gray-900 rounded-[3px] py-0.5 px-1.5 text-[7px] text-white border-2 border-black group hover:border-blue-500/50 transition-all">
                                    <FileIcon className="w-1.5 h-1.5" />
                                    <span className="font-mono truncate max-w-[80px]">{file.name}</span>
                                    <button onClick={() => onRemoveFile(file.name)} className="text-gray-600 hover:text-red-500 transition-colors">
                                        <XIcon className="w-1.5 h-1.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Input Form Area */}
            <form onSubmit={handleSubmit} className="flex items-end gap-1.5 p-1.5 bg-slate-800">
                <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*,audio/*,text/plain,.pdf,.json"
                    ref={fileInputRef} 
                    onChange={(e) => onFilesChange(e.target.files)}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={handleAttachClick}
                    className="w-8 h-8 rounded-md text-gray-800 bg-gray-300 hover:bg-white flex items-center justify-center flex-shrink-0 transition-all border-4 border-black shadow-[1.5px_1.5px_0_0_#000] active:translate-y-0.5 active:shadow-none"
                    aria-label="Upload Firmware"
                >
                    <PaperclipIcon className="w-3.5 h-3.5" />
                </button>
                
                <div className="flex-1 relative group">
                    <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRecording ? "Listening to the void..." : placeholder}
                        className={`w-full bg-black/60 border-4 border-black rounded-lg p-1.5 max-h-[80px] text-amber-400 placeholder:text-gray-800 focus:outline-none focus:border-amber-600 transition-all font-mono text-xs leading-relaxed ${showNullError ? 'text-red-400' : ''}`}
                        rows={1}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onToggleRecording}
                        className={`w-8 h-8 rounded-md text-white flex items-center justify-center flex-shrink-0 transition-all duration-300 relative border-4 border-black shadow-[1.5px_1.5px_0_0_#000] active:translate-y-0.5 active:shadow-none ${
                            isRecording 
                            ? 'bg-red-600' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        aria-label={isRecording ? 'Stop listening' : 'Start listening'}
                    >
                        {isRecording && <div className="absolute inset-0 rounded-[3px] bg-red-500/30 animate-ping"></div>}
                        <MicrophoneIcon className="w-3.5 h-3.5 z-10" />
                    </button>
                    
                    <button
                        type="submit"
                        disabled={isSubmissionDisabled}
                        className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-all border-4 border-black shadow-[1.5px_1.5px_0_0_#000] active:translate-y-0.5 active:shadow-none ${
                            isSubmissionDisabled 
                            ? 'bg-gray-700 text-gray-800 cursor-not-allowed' 
                            : 'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <path d="m22 2-7 20-4-9-9-4Z"/>
                            <path d="M22 2 11 13"/>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
        
        {/* Validation & System Metadata */}
        <div className="flex justify-between items-center px-1 mt-0.5 h-2">
            <div className="flex gap-2">
                <span className="text-[5px] font-black text-gray-700 uppercase tracking-widest">Logic Intensity: {inputText.length} bits</span>
                {isLoading && (
                    <div className="flex items-center gap-1">
                        <ZapIcon className="w-1.5 h-1.5 text-amber-500 animate-spin" />
                        <span className="text-[5px] font-black text-amber-600 uppercase tracking-widest animate-pulse">Maestro Conducting...</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                {showNullError && (
                    <div className="flex items-center gap-1 animate-in slide-in-from-right-1 duration-300">
                        <ShieldIcon className="w-1.5 h-1.5 text-red-600" />
                        <span className="text-[5px] font-black text-red-600 uppercase">Null Conduction Error: Whitespace Only</span>
                    </div>
                )}
                {!isLoading && (
                    <div className="flex items-center gap-1">
                        <div className="w-0.5 h-0.5 rounded-full bg-green-500 shadow-[0_0_2px_green]" />
                        <span className="text-[5px] font-black text-gray-800 uppercase">Reliability: 99.4%</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
