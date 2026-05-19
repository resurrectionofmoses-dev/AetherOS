import React, { useEffect, useRef, useMemo } from 'react';
import type { ChatMessage, AISeat } from '../types';
import { AI_SEATS } from '../types';
import { Message } from './Message';
import { WarningIcon, TerminalIcon, ActivityIcon, ShieldIcon, BotIcon } from './icons';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onInteractionSubmit?: (messageTimestamp: Date, answer: string) => void;
  searchQuery: string;
  startDate: string;
  endDate: string;
  senderFilter: string;
  activeSeat?: AISeat;
  onSeatChange?: (seat: AISeat) => void;
  currentChannel?: 'global' | 'moderator';
  userRole?: string;
  isRecordingVoice?: boolean;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
        <div className="flex items-center gap-1 h-8">
            {[...Array(6)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-1 bg-amber-500 rounded-full animate-pulse"
                    style={{ 
                        height: '100%',
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.6s'
                    }}
                />
            ))}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60 animate-pulse italic">
            Siphoning Logic...
        </span>
    </div>
);

export const ChatView: React.FC<ChatViewProps> = ({ 
  messages, isLoading, onInteractionSubmit, searchQuery,
  startDate, endDate, senderFilter = 'all', activeSeat = 'sovereign', onSeatChange,
  currentChannel, userRole, isRecordingVoice
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Filter by sender
    if (senderFilter !== 'all') {
      if (senderFilter === 'user' || senderFilter === 'model') {
        filtered = filtered.filter(m => m.sender === senderFilter);
      } else {
        // Specific seat filter
        filtered = filtered.filter(m => m.sender === 'model' && m.seat === senderFilter);
      }
    }

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
  }, [messages, searchQuery, startDate, endDate, senderFilter]);

  useEffect(() => {
    if (scrollRef.current && !searchQuery && !startDate && !endDate && senderFilter === 'all') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, searchQuery, startDate, endDate, senderFilter]);

  const isAnyFilterActive = searchQuery || startDate || endDate || senderFilter !== 'all';

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-black rounded-t-lg custom-scrollbar min-h-0 flex-hinge relative holographic-bg">
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BotIcon className="w-5 h-5 text-amber-500" />
            <span className="font-comic-header text-xl text-white italic uppercase tracking-tighter">Council of AI</span>
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
            {(Object.keys(AI_SEATS) as AISeat[]).map((seat) => (
              <button
                key={seat}
                onClick={() => onSeatChange?.(seat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeSeat === seat 
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
                title={AI_SEATS[seat].description}
              >
                {AI_SEATS[seat].name.split(' (')[1]?.replace(')', '') || AI_SEATS[seat].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full p-4 md:px-8 space-y-6 relative z-10">
        {isRecordingVoice && (
            <div className="sticky top-20 z-40 w-full animate-in zoom-in-95 duration-500">
                <div className="bg-blue-600/20 backdrop-blur-xl border-4 border-blue-600/40 p-6 rounded-3xl flex flex-col items-center gap-4 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                    <div className="flex items-center gap-2 h-10">
                        {[...Array(24)].map((_, i) => (
                            <div 
                                key={i} 
                                className="w-1 bg-blue-400 rounded-full animate-pulse"
                                style={{ 
                                    height: `${Math.random() * 80 + 20}%`,
                                    animationDelay: `${i * 0.05}s`,
                                    animationDuration: '0.4s'
                                }}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 italic">Neural Ear: Listening to Sovereign Intent</span>
                    </div>
                </div>
            </div>
        )}
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
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-60">
             <div className="relative mb-6">
                <BotIcon className="w-20 h-20 text-amber-900" />
                <TerminalIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-amber-500 animate-pulse" />
             </div>
             <p className="font-comic-header text-3xl text-gray-400 uppercase italic tracking-tighter">
                {activeSeat === 'oracle' ? 'Awaiting Inquiry' : activeSeat === 'maestro' ? 'Ready to Code' : 'System Ready'}
             </p>
             <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2 bg-black/40 px-4 py-1 rounded-full border border-white/5 text-center max-w-md">
                {activeSeat === 'oracle' 
                    ? 'Suggesting more detailed explanations and comprehensive analysis.' 
                    : activeSeat === 'maestro' 
                    ? 'Responding with hyper-relevant, concise code modules.' 
                    : 'Awaiting your command. The Sovereign network is listening.'}
             </p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
              const isModel = msg.sender === 'model';
              return (
                   <div key={`${msg.timestamp.getTime()}-${index}`} className={`flex w-full ${isModel ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                      <Message 
                          message={msg} 
                          onInteractionSubmit={onInteractionSubmit}
                          searchQuery={searchQuery}
                      />
                  </div>
              )
          })
        )}

        {isLoading && messages[messages.length - 1]?.sender === 'model' && !messages[messages.length - 1]?.content && (
             <div className="flex flex-col items-start w-full max-w-3xl mb-4 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-1 px-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                        {AI_SEATS[activeSeat].name}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[8px] font-mono text-amber-600 uppercase">
                        SYSTEM_PENDING
                    </span>
                </div>
                <div className="flex items-start gap-3 w-full">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-amber-900 bg-slate-900 text-amber-500 animate-pulse">
                        <BotIcon className="w-5 h-5" />
                    </div>
                    <div className="message-bubble message-bubble-model bg-slate-800/40 border-amber-500/20">
                        <LoadingIndicator />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};