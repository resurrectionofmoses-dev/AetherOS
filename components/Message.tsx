
import React from 'react';
import * as ReactKatex from 'react-katex';
import type { ChatMessage, ImplementationResponse, GroundingSource } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { CodeBlock } from './CodeBlock';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { ImplementationResult } from './ImplementationResult';
import { InteractionPrompt } from './InteractionPrompt';

interface MessageProps {
  message: ChatMessage;
  onInteractionSubmit?: (messageTimestamp: Date, answer: string) => void;
  searchQuery: string;
}

const highlightText = (text: string, highlight: string): React.ReactNode => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return (
        <>
            {text.split(regex).map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={i} className="bg-blue-500 text-white px-0.5 rounded-sm">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

const parseText = (text: string, searchQuery: string): React.ReactNode[] => {
    const regex = /(```[\w]*\n[\s\S]*?\n```|\$\$[\s\S]*?\$\$|\$.*?\$|\*\*.*?\*\*)/g;
    const parts = text.split(regex);

    return parts.filter(part => part).map((part, index) => {
        const codeBlockMatch = part.match(/^```(\w*)\n([\s\S]*?)\n```$/);
        if (codeBlockMatch) {
            const [, language, code] = codeBlockMatch;
            return <CodeBlock key={index} language={language} code={code.trim()} />;
        }
        if (part.match(/^\$\$([\s\S]*?)\$\$$/)) {
            return <ReactKatex.BlockMath key={index} math={part.match(/^\$\$([\s\S]*?)\$\$$/)![1].trim()} />;
        }
        if (part.match(/^\$([\s\S]*?)\$/)) {
            return <ReactKatex.InlineMath key={index} math={part.match(/^\$([\s\S]*?)\$/)![1].trim()} />;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-blue-300">{highlightText(part.slice(2, -2), searchQuery)}</strong>;
        }
        return highlightText(part, searchQuery);
    });
};

const parseContent = (content: string, searchQuery: string): React.ReactNode => {
  // Check if the content is explicitly a JSON code block
  const jsonCodeBlockMatch = content.match(/^```json\n([\s\S]*?)\n```$/);
  if (jsonCodeBlockMatch) {
      try {
          const jsonContent = jsonCodeBlockMatch[1].trim();
          const implParsed = JSON.parse(jsonContent) as ImplementationResponse;
          if (implParsed?.files?.length > 0) {
              return <ImplementationResult response={implParsed} />;
          }
      } catch (e) {
          // If JSON parsing fails, treat it as a regular text block
          console.warn("Failed to parse JSON content in message:", e);
      }
  }
  // If not a JSON code block or parsing failed, proceed with general text parsing
  return <div className="whitespace-pre-wrap leading-relaxed">{parseText(content, searchQuery)}</div>;
};

export const Message: React.FC<MessageProps> = ({ message, onInteractionSubmit, searchQuery }) => {
  const isModel = message.sender === 'model';

  return (
    <div className={`group flex items-start gap-3 max-w-3xl w-full relative ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-black mt-1 ${isModel ? 'bg-slate-700 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-blue-400 text-black shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}>
        {isModel ? <BotIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
      </div>
      <div className={`message-bubble ${isModel ? 'message-bubble-model bg-slate-800/80 border-blue-500/20' : 'message-bubble-user bg-blue-900/40 border-blue-400/30'}`}>
        {message.attachedFiles?.length > 0 && (
            <div className="mb-3 p-3 bg-black/40 rounded-lg border border-white/5">
                <div className="flex items-center gap-2 text-sm text-blue-300 font-black uppercase tracking-tighter mb-2">
                    <PaperclipIcon className="w-4 h-4" />
                    <span>{message.attachedFiles.length} Binary Attachments</span>
                </div>
                <ul className="list-disc list-inside text-[10px] text-gray-400 space-y-1 font-mono">
                    {message.attachedFiles.map(name => <li key={name}>{name}</li>)}
                </ul>
            </div>
        )}
        
        {parseContent(message.content, searchQuery)}

        {message.groundingSources?.length > 0 && (
          <div className="mt-4 p-3 bg-blue-900/20 border-2 border-blue-500/30 rounded-xl animate-in zoom-in-95 duration-500">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <LinkIcon className="w-3 h-3" /> Ancient Letters (Ingested Sources)
            </p>
            <ul className="space-y-2">
              {message.groundingSources.map((source, idx) => (
                <li key={idx} className="text-xs group/link">
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white transition-all flex items-center gap-2 truncate">
                    <div className="w-1 h-1 bg-blue-500 rounded-full group-hover/link:scale-150 transition-transform" />
                    <span className="truncate border-b border-transparent group-hover/link:border-blue-400">{source.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {message.interactionPrompt && !message.interactionPrompt.submittedAnswer && onInteractionSubmit && (
            <InteractionPrompt 
                prompt={message.interactionPrompt.prompt} 
                onSubmit={(answer) => onInteractionSubmit(message.timestamp, answer)}
            />
        )}
      </div>
    </div>
  );
};

const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);