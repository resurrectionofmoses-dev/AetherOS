
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as ReactKatex from 'react-katex';
import type { ChatMessage, ImplementationResponse, GroundingSource } from '../types';
import { AI_SEATS } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { CodeBlock } from './CodeBlock';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { ImplementationResult } from './ImplementationResult';
import { InteractionPrompt } from './InteractionPrompt';
import { ClockIcon, GlobeIcon } from './icons';

interface MessageProps {
  message: ChatMessage;
  onInteractionSubmit?: (messageTimestamp: Date, answer: string) => void;
  searchQuery: string;
}

const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);
};

const highlightText = (text: string, highlight: string): React.ReactNode => {
    if (!highlight || !highlight.trim()) return text;
    
    const safeHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeHighlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark 
                      key={i} 
                      className="bg-amber-400 text-black px-0.5 rounded-sm font-black shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-pulse inline-block"
                    >
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

const parseContent = (content: string, searchQuery: string): React.ReactNode => {
  const jsonCodeBlockMatch = content.match(/^```json\n([\s\S]*?)\n```$/);
  if (jsonCodeBlockMatch) {
      try {
          const jsonContent = jsonCodeBlockMatch[1].trim();
          const implParsed = JSON.parse(jsonContent) as ImplementationResponse;
          if (implParsed?.files?.length > 0) {
              return <ImplementationResult response={implParsed} />;
          }
      } catch (e) {
          console.warn("Failed to parse JSON content in message:", e);
      }
  }

  return (
    <div className="markdown-body text-sm leading-relaxed">
        <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
                code({node, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');
                    return !isInline && match ? (
                        <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} searchQuery={searchQuery} />
                    ) : (
                        <code className={`${className} bg-black/30 px-1 py-0.5 rounded text-amber-300 font-mono text-xs border border-white/10`} {...props}>
                            {children}
                        </code>
                    )
                },
                p: ({children}) => <p className="mb-2 last:mb-0">
                    {React.Children.map(children, child => {
                        if (typeof child === 'string') {
                            return highlightText(child, searchQuery);
                        }
                        return child;
                    })}
                </p>,
                ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({children}) => <li className="text-gray-300">
                    {React.Children.map(children, child => {
                        if (typeof child === 'string') {
                            return highlightText(child, searchQuery);
                        }
                        return child;
                    })}
                </li>,
                h1: ({children}) => <h1 className="text-xl font-bold mb-2 text-white border-b border-white/10 pb-1">
                    {React.Children.map(children, child => {
                        if (typeof child === 'string') {
                            return highlightText(child, searchQuery);
                        }
                        return child;
                    })}
                </h1>,
                h2: ({children}) => <h2 className="text-lg font-bold mb-2 text-white">
                    {React.Children.map(children, child => {
                        if (typeof child === 'string') {
                            return highlightText(child, searchQuery);
                        }
                        return child;
                    })}
                </h2>,
                h3: ({children}) => <h3 className="text-md font-bold mb-1 text-white">
                    {React.Children.map(children, child => {
                        if (typeof child === 'string') {
                            return highlightText(child, searchQuery);
                        }
                        return child;
                    })}
                </h3>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-2 bg-blue-900/10 py-1 pr-2 rounded-r">{children}</blockquote>,
                a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline hover:text-blue-300 transition-colors">{children}</a>,
                table: ({children}) => <div className="overflow-x-auto my-2 border border-white/10 rounded"><table className="min-w-full divide-y divide-white/10">{children}</table></div>,
                th: ({children}) => <th className="px-3 py-2 bg-white/5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{children}</th>,
                td: ({children}) => <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400 border-t border-white/5">{children}</td>,
            }}
        >
            {content}
        </ReactMarkdown>
    </div>
  );
};

export const Message: React.FC<MessageProps> = ({ message, onInteractionSubmit, searchQuery }) => {
  const isModel = message.sender === 'model';
  const seatInfo = message.seat ? AI_SEATS[message.seat] : null;

  const matchCount = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return 0;
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (message.content.match(regex) || []).length;
  }, [message.content, searchQuery]);

  return (
    <div className={`group flex flex-col w-full max-w-3xl mb-4 ${isModel ? 'items-start' : 'items-end'}`}>
      <div className={`flex items-center gap-2 mb-1 px-4 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {isModel ? (seatInfo?.name || 'Aether AI') : (message.senderName || 'Network Operator')}
            </span>
            {!isModel && message.senderRole && (
               <span className={`px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase ${
                  message.senderRole === 'admin' ? 'bg-red-600 text-white' : 
                  message.senderRole === 'operator' ? 'bg-amber-600 text-black' : 
                  message.senderRole === 'moderator' ? 'bg-blue-600 text-white' : 
                  'bg-gray-800 text-gray-400'
               }`}>
                  {message.senderRole}
               </span>
            )}
            {!isModel && message.senderSovereignty && (
                <span className="text-[8px] font-black uppercase text-amber-500/80 bg-amber-950/20 px-1 rounded">
                    {message.senderSovereignty}
                </span>
            )}
          </div>
          <div className="w-0.5 h-0.5 rounded-full bg-gray-800" />
          <span className="text-[8px] font-mono text-gray-600 flex items-center gap-1">
              <ClockIcon className="w-2.5 h-2.5" />
              {formatTimestamp(message.timestamp)}
          </span>
      </div>

      <div className={`flex items-start gap-3 w-full relative ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-black mt-1 transition-all duration-500 group-hover:scale-110 ${isModel ? 'bg-slate-700 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-blue-400 text-black shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}>
          {isModel ? <BotIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
        </div>
        
        <div className={`message-bubble relative transition-all duration-300 ${isModel ? 'message-bubble-model bg-slate-800/80 border-blue-500/20' : 'message-bubble-user bg-blue-900/40 border-blue-400/30'} ${searchQuery && matchCount > 0 ? 'ring-2 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : ''}`}>
          
          {searchQuery && matchCount > 0 && (
            <div className="absolute -top-3 right-4 bg-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full border border-black animate-bounce shadow-lg z-20">
              {matchCount} RESONANCE MATCH{matchCount === 1 ? '' : 'ES'}
            </div>
          )}

          {message.careScore !== undefined && (
            <div className="absolute -top-3 left-4 bg-green-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full border border-black shadow-lg z-20 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              CARE SCORE: {message.careScore}
            </div>
          )}

          {message.attachedFiles && message.attachedFiles.length > 0 && (
              <div className="mb-3 p-3 bg-black/40 rounded-lg border border-white/5 shadow-inner">
                  <div className="flex items-center gap-2 text-sm text-blue-300 font-black uppercase tracking-tighter mb-2">
                      <PaperclipIcon className="w-4 h-4" />
                      <span>{message.attachedFiles.length} Binary Attachments</span>
                  </div>
                  <ul className="list-disc list-inside text-[10px] text-gray-400 space-y-1 font-mono">
                      {message.attachedFiles.map(name => <li key={name}>{highlightText(name, searchQuery)}</li>)}
                  </ul>
              </div>
          )}
          
          {parseContent(message.content, searchQuery)}

          {message.groundingSources && message.groundingSources.length > 0 && (
            <div className="mt-4 p-3 bg-blue-900/20 border-2 border-blue-500/30 rounded-xl animate-in zoom-in-95 duration-500">
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <GlobeIcon className="w-3 h-3" /> Grounding Manifold (Sources)
              </p>
              <ul className="space-y-2">
                {message.groundingSources.map((source, idx) => (
                  <li key={idx} className="text-xs group/link">
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white transition-all flex items-center gap-2 truncate">
                      <div className="w-1 h-1 bg-blue-500 rounded-full group-hover/link:scale-150 transition-transform" />
                      <span className="truncate border-b border-transparent group-hover/link:border-blue-400">{highlightText(source.title, searchQuery)}</span>
                      <span className="text-[8px] font-mono text-gray-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">{source.bitSig || 'bits://N/A'}</span>
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
    </div>
  );
};

const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
