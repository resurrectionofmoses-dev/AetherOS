
import React, { useEffect, useRef, useMemo } from 'react';
import type { ChatMessage } from '../types';
import { Message } from './Message';
import { WarningIcon, TerminalIcon, ActivityIcon, ShieldIcon } from './icons';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onInteractionSubmit?: (messageTimestamp: Date, answer: string) => void;
  searchQuery: string;
  startDate: string;
  endDate: string;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center p-4">
        <div className="flex space-x-1.5">
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"></div>
        </div>
    </div>
);

export const ChatView: React.FC<ChatViewProps> = ({ 
  messages, isLoading, onInteractionSubmit, searchQuery,
  startDate, endDate
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.content.toLowerCase().includes(q) || 
        m.attachedFiles?.some(f => f.toLowerCase().includes(q))
      );
    }

    // Filter by start date
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(m => m.timestamp >= start);
    }

    // Filter by end date
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => m.timestamp <= end);
    }

    return filtered;
  }, [messages, searchQuery, startDate, endDate]);

  useEffect(() => {
    if (scrollRef.current && !searchQuery && !startDate && !endDate) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, searchQuery, startDate, endDate]);

  const isAnyFilterActive = searchQuery || startDate || endDate;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-900 rounded-t-lg">
      <div className="max-w-4xl mx-auto w-full p-4 md:px-8 space-y-6">
        {isAnyFilterActive && (
            <div className="text-center text-[10px] text-green-500 font-black py-2 px-4 bg-green-950/20 rounded-xl border-2 border-green-600/40 sticky top-2 z-20 flex items-center justify-center gap-3 backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <ShieldIcon className="w-3 h-3 text-amber-500" />
                <span className="uppercase tracking-widest text-white">
                  {filteredMessages.length} Logic Shard{filteredMessages.length === 1 ? '' : 's'} <span className="text-amber-500">Harmonized</span> in Temporal Window
                </span>
                <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
            </div>
        )}

        {filteredMessages.length === 0 && isAnyFilterActive ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-40">
             <div className="relative mb-6">
                <ActivityIcon className="w-20 h-20 text-red-900" />
                <WarningIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-amber-500 animate-pulse" />
             </div>
             <p className="font-comic-header text-3xl text-gray-500 uppercase italic tracking-tighter">Vibration Static</p>
             <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2 bg-black/40 px-4 py-1 rounded-full border border-white/5">No chronological matching conduction in this sector.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
              const isModel = msg.sender === 'model';
              return (
                   <div key={msg.timestamp.getTime()} className={`flex w-full ${isModel ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                      <Message 
                          message={msg} 
                          onInteractionSubmit={onInteractionSubmit}
                          searchQuery={searchQuery}
                      />
                  </div>
              )
          })
        )}

        {isLoading && messages[messages.length - 1]?.sender === 'model' && !messages[messages.length - 1]?.content &&(
             <div className="flex items-start gap-4 p-4 md:p-6 w-full justify-start">
                <div className="flex items-end gap-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-600" />
                    <div className="message-bubble message-bubble-model">
                        <LoadingIndicator />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};