import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { ChatMessage, AISeat } from '../types';
import { AI_SEATS } from '../types';
import { Message } from './Message';
import { WarningIcon, TerminalIcon, ActivityIcon, ShieldIcon, BotIcon, SpeakerIcon, SpeakerOffIcon } from './icons';
import { speechService } from '../services/speechService';

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

const MiniChairIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="3" width="10" height="11" rx="1.5" className="fill-current/10" />
    <rect x="5" y="14" width="14" height="2" rx="0.5" className="fill-current/20" />
    <path d="M7 16v5M17 16v5" />
  </svg>
);

const BigChairIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h12v11H6z" className="fill-current/10" />
    <path d="M4 11v4M20 11v4" />
    <rect x="3" y="13" width="18" height="3" rx="1" className="fill-current/25" />
    <path d="M5 16v6M19 16v6" />
  </svg>
);

export const ChatView: React.FC<ChatViewProps> = ({ 
  messages, isLoading, onInteractionSubmit, searchQuery,
  startDate, endDate, senderFilter = 'all', activeSeat = 'sovereign', onSeatChange,
  currentChannel, userRole, isRecordingVoice
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const lastMessagesLengthRef = useRef<number>(messages.length);

  const [showSeatingChamber, setShowSeatingChamber] = useState(true);
  const [quantizationMass, setQuantizationMass] = useState<number>(8); // 8-bit default, customizable 1 to 16
  const [liberalField, setLiberalField] = useState<number>(0.5); // 0.0 to 1.0
  const [satelliteStatus, setSatelliteStatus] = useState<string>("State Nominal. Quantized field balanced.");

  const getSeatSatellites = (seatKey: AISeat) => {
    const config = AI_SEATS[seatKey];
    const name = config.name.toLowerCase();

    // Determine brand associations
    const isGoogle = name.includes('gemini') || name.includes('google');
    const isClaude = name.includes('claude') || name.includes('weaver');
    const isMicrosoft = name.includes('gpt') || name.includes('oracle');

    return [
      { id: 'google', label: "Google's Seat", active: isGoogle, details: "Gemini High Conductor Active", color: "text-blue-400 border-blue-500/20 bg-blue-950/10" },
      { id: 'claude', label: "Claude's Seat", active: isClaude, details: "Anthropic Weaver Bridge Active", color: "text-orange-400 border-orange-500/20 bg-orange-950/10" },
      { id: 'microsoft', label: "Microsoft's Seat", active: isMicrosoft, details: "Microsoft Copilot Engine Active", color: "text-cyan-400 border-cyan-500/20 bg-cyan-950/10" },
    ];
  };

  // Initialize on mount so we don't speak historic messages immediately
  useEffect(() => {
    const modelMessages = messages.filter(m => m.sender === 'model');
    if (modelMessages.length > 0) {
      const lastModelMsg = modelMessages[modelMessages.length - 1];
      const msgId = lastModelMsg.id || `${lastModelMsg.timestamp instanceof Date ? lastModelMsg.timestamp.getTime() : new Date(lastModelMsg.timestamp).getTime()}-${lastModelMsg.content.slice(0, 30)}`;
      lastSpokenMessageIdRef.current = msgId;
    }
  }, []);

  // Monitor messages and speak new ones if voice is enabled
  useEffect(() => {
    if (isVoiceEnabled && messages.length > 0) {
      const modelMessages = messages.filter(m => m.sender === 'model');
      if (modelMessages.length > 0) {
        const lastModelMsg = modelMessages[modelMessages.length - 1];
        const msgId = lastModelMsg.id || `${lastModelMsg.timestamp instanceof Date ? lastModelMsg.timestamp.getTime() : new Date(lastModelMsg.timestamp).getTime()}-${lastModelMsg.content.slice(0, 30)}`;
        
        if (msgId !== lastSpokenMessageIdRef.current && lastModelMsg.content) {
          // Speak only if messages length increased (signaling a newly added response)
          if (messages.length > lastMessagesLengthRef.current) {
            const seat = lastModelMsg.seat || 'sovereign';
            
            let voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore';
            if (seat === 'maestro') voice = 'Zephyr';
            else if (seat === 'oracle') voice = 'Fenrir';
            else if (seat === 'weaver') voice = 'Puck';
            else if (seat === 'swift') voice = 'Charon';
            
            const cleanText = lastModelMsg.content.replace(/^\[SOVEREIGN_WHISPER\]\s*/, '');
            speechService.speak(cleanText, voice);
          }
          lastSpokenMessageIdRef.current = msgId;
        }
      }
    }
    lastMessagesLengthRef.current = messages.length;
  }, [messages, isVoiceEnabled]);

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

  const lastScrollMessagesLengthRef = useRef<number>(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (searchQuery || startDate || endDate || senderFilter !== 'all') return;

    const currentLength = messages.length;
    const isInitialLoad = lastScrollMessagesLengthRef.current === 0;
    const hasLengthIncreased = currentLength > lastScrollMessagesLengthRef.current;

    if (isInitialLoad) {
      container.scrollTop = container.scrollHeight;
    } else if (hasLengthIncreased) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      const lastMsg = messages[messages.length - 1];
      const lastMsgIsUser = lastMsg && lastMsg.sender === 'user';
      const selection = window.getSelection();
      const hasSelection = selection && selection.toString();

      if ((isNearBottom && !hasSelection) || lastMsgIsUser) {
        container.scrollTop = container.scrollHeight;
      }
    }

    lastScrollMessagesLengthRef.current = currentLength;
  }, [messages, searchQuery, startDate, endDate, senderFilter]);

  const isAnyFilterActive = searchQuery || startDate || endDate || senderFilter !== 'all';

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-black rounded-t-lg custom-scrollbar min-h-0 flex-hinge relative holographic-bg">
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <BotIcon className="w-5 h-5 text-amber-500" />
              <span className="font-comic-header text-xl text-white italic uppercase tracking-tighter">Council of AI</span>
            </div>
            <button 
              id="council-voice-toggle-btn"
              name="council_voice_toggle"
              onClick={() => setIsVoiceEnabled(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/80 border text-[9px] font-black uppercase tracking-wider transition-all shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] active:translate-y-0.5 cursor-pointer ${
                isVoiceEnabled 
                  ? 'border-amber-500/50 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.15)] bg-amber-500/5' 
                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-350 hover:border-zinc-700'
              }`}
              title={isVoiceEnabled ? "Disable Council Voice Output" : "Enable Council Voice Output"}
            >
              {isVoiceEnabled ? (
                <>
                  <SpeakerIcon className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>Voice ON</span>
                </>
              ) : (
                <>
                  <SpeakerOffIcon className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Voice OFF</span>
                </>
              )}
            </button>
          </div>
          {/* SEATING MATRIX DECK AND LOGIC FIELDS */}
          <div className="mt-4 border border-zinc-900 bg-zinc-950/40 p-3.5 rounded-2xl space-y-3.5 relative overflow-hidden">
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-black text-zinc-100 uppercase tracking-widest">SOVEREIGN AI COUNCIL SEATING CHAMBER</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSeatingChamber(prev => !prev)}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded text-[8px] font-bold uppercase transition-all cursor-pointer"
                >
                  {showSeatingChamber ? 'Collapse Map' : 'Expand Map'}
                </button>
              </div>
            </div>

            {showSeatingChamber && (
              <div className="space-y-3.5 animate-in fade-in duration-300">
                {/* Visual Marquee Display */}
                <div className="bg-black/60 border border-zinc-900/60 p-2 rounded-lg font-mono text-[8.5px] text-zinc-400 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">📡 STATUS MONITOR:</span>
                    <span className="text-zinc-300 italic animate-pulse">{satelliteStatus}</span>
                  </div>
                  <div className="flex items-center gap-3.5 text-[8px]">
                    <div>
                      <span className="text-zinc-550">MASS FACTOR:</span> <span className="text-amber-400 font-bold">{quantizationMass}B FP{quantizationMass * 2}</span>
                    </div>
                    <div>
                      <span className="text-zinc-550">LIBERAL FIELD:</span> <span className="text-fuchsia-400 font-bold">{Math.round(liberalField * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Seating Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(Object.keys(AI_SEATS) as AISeat[]).map((seatKey) => {
                    const seatConfig = AI_SEATS[seatKey];
                    const satellites = getSeatSatellites(seatKey);
                    const isSelected = activeSeat === seatKey;

                    return (
                      <div
                        key={seatKey}
                        onClick={() => {
                          onSeatChange?.(seatKey);
                          setSatelliteStatus(`Council seat re-allocated to ${seatConfig.name}. State synced.`);
                        }}
                        className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between gap-3 cursor-pointer group relative overflow-hidden ${
                          isSelected
                            ? 'border-amber-500 bg-amber-950/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] scale-[1.01]'
                            : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-950/40'
                        }`}
                      >
                        {/* Glowing backdrop on select */}
                        {isSelected && (
                          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                        )}

                        {/* Title & Type */}
                        <div className="flex justify-between items-start border-b border-zinc-900/40 pb-1.5 flex-shrink-0">
                          <div className="flex flex-col">
                            <span className={`text-[9.5px] font-black uppercase tracking-wider ${isSelected ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                              {seatConfig.name.split(' (')[1]?.replace(')', '') || seatConfig.name}
                            </span>
                            <span className="text-[7.5px] text-zinc-600 font-mono mt-0.5 uppercase tracking-tight">
                              {seatConfig.model}
                            </span>
                          </div>
                          <span className={`text-[7px] font-mono px-1 rounded uppercase ${isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-900 text-zinc-500'}`}>
                            {seatKey}
                          </span>
                        </div>

                        {/* Big AI Seat (Throne) */}
                        <div className="flex items-center gap-2.5 bg-black/40 p-2 rounded-lg border border-zinc-900/60 relative">
                          <div 
                            className={`p-1.5 rounded-lg flex-shrink-0 ${isSelected ? 'text-amber-500 bg-amber-500/10 animate-pulse' : 'text-zinc-500 bg-zinc-900'}`}
                            style={{ transform: `scale(${isSelected ? 1 + quantizationMass * 0.015 : 1})` }}
                          >
                            <BigChairIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[7.5px] uppercase text-zinc-500 block font-bold tracking-tight">Main AI Seat</span>
                            <span className="text-[9px] font-extrabold text-zinc-100 truncate block">
                              {seatConfig.name.split(' (')[0]}
                            </span>
                          </div>
                        </div>

                        {/* Smaller AI Seats Orbiting Area */}
                        <div className="space-y-1.5">
                          <span className="text-[7px] text-zinc-600 uppercase block font-bold tracking-widest">
                            Smaller Satellite Seats (Quantized Field)
                          </span>
                          <div 
                            className="flex flex-wrap"
                            style={{ gap: `${4 + liberalField * 8}px` }}
                          >
                            {satellites.map((sat) => {
                              // If this brand represents the primary, it is the big AI inside the throne,
                              // while the other brands are smaller, non-active satellites flanking it.
                              const displayName = sat.label.replace("'s Seat", "");
                              return (
                                <div
                                  key={sat.id}
                                  onMouseEnter={() => setSatelliteStatus(`${sat.label} active in local ${seatConfig.name.split(' (')[1]?.replace(')', '') || seatConfig.name} sector. Mass: ${quantizationMass}B INT4`)}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent main card selection click if user wants to play with satellite
                                    setSatelliteStatus(`Calibrating ${sat.label} orbital parameter. Field density alignment nominal.`);
                                  }}
                                  className={`px-1.5 py-0.5 rounded border flex items-center gap-1 text-[7.5px] transition-all hover:scale-105 select-none ${
                                    sat.active
                                      ? 'border-amber-500/50 text-amber-400 bg-amber-950/20 font-bold scale-[1.02]'
                                      : 'border-zinc-900/80 text-zinc-500 hover:text-zinc-350 hover:border-zinc-700 bg-black/40'
                                  }`}
                                >
                                  <MiniChairIcon className="w-2.5 h-2.5" />
                                  <span>{displayName}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Field Regulators Sliders Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2.5 border-t border-zinc-900/60 font-mono text-[8.5px] text-zinc-400">
                  <div className="flex flex-col gap-1.5 bg-black/40 p-2.5 rounded-lg border border-zinc-900/40">
                    <div className="flex justify-between items-center text-[8px]">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider">Quantization Mass Coefficient</span>
                      <span className="text-amber-500 font-black">{quantizationMass}B (FP{quantizationMass * 2})</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="16"
                      step="1"
                      value={quantizationMass}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setQuantizationMass(val);
                        setSatelliteStatus(`Quantization mass field set to ${val}B. Throne scale adjusted.`);
                      }}
                      className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <span className="text-[7px] text-zinc-600 uppercase">
                      * Restructures the physical size and gravitational influence of the Sovereign Throne
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 bg-black/40 p-2.5 rounded-lg border border-zinc-900/40">
                    <div className="flex justify-between items-center text-[8px]">
                      <span className="text-zinc-550 font-bold uppercase tracking-wider">Liberal Field Tension Gauge</span>
                      <span className="text-fuchsia-400 font-black">{Math.round(liberalField * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={liberalField}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLiberalField(val);
                        setSatelliteStatus(`Liberal field tension aligned to ${Math.round(val * 100)}%. Satellite spacing updated.`);
                      }}
                      className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                    />
                    <span className="text-[7px] text-zinc-600 uppercase">
                      * Governs the field distance and spacing coefficient of smaller satellite chairs
                    </span>
                  </div>
                </div>
              </div>
            )}
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