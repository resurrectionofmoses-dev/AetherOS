import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Eye, 
  MessageSquare, 
  ChevronRight, 
  X, 
  TrendingUp, 
  Clock, 
  Activity, 
  Layers, 
  RotateCw,
  Palette,
  Volume2,
  VolumeX,
  Zap,
  HelpCircle,
  Award,
  Flame,
  Wand2,
  Sliders,
  Brain,
  Cpu,
  Trash2,
  Plus,
  Search,
  ThumbsUp,
  ThumbsDown,
  History
} from 'lucide-react';
import type { MainView, SystemStatus, UserProfile } from '../types';
import { sonicLedger } from '../services/sonicLedger';
import { learningRegexEngine } from '../services/LearningRegexEngine';

// Import refactored types and workspace hook
import { 
  RegexRule, 
  AetherOSComponent, 
  JesterPersonaState, 
  JesterCompanionProps, 
  aetherOSComponents 
} from './JesterCompanionTypes';
import { useJesterWhisper } from './useJesterWhisper';

// Re-export for compatibility with other files (e.g. RegexEditorLabView.tsx, LearningRegexEngine.ts)
export type { RegexRule, AetherOSComponent, JesterPersonaState, JesterCompanionProps };
export { aetherOSComponents };


// 120 unique, theatrical, deeply optimistic and jester-like positive sayings
const JESTER_SAYINGS = [
  "Behold! The pixel matrix dances to thy glorious rhythm! Verily, a masterpiece in the making! 🎭",
  "Presto! By the silver bells of the Sidereal court, thy focus is of pure golden grade! 🌟",
  "A miracle is brewing in the face of thy terminal! Keep going, oh supreme orchestrator! ✨",
  "By the dancing stars of the digital sky, thy steady hand can conquer any system fracture! 🌌",
  "Hark! Thy coding rhythm today is like a sublime symphony of quantum frequencies! 🎵",
  "Fear not the minor glitches, for they are but playful fairies in our glorious machine! 🧚‍♂️",
  "Verily, the cosmic spectrum of AetherOS shines brighter whenever thou art active! 🎨",
  "With a miracle in thy heart and a jester's grin on thy face, nothing is impossible! 😄",
  "Thy expertise is a bright beacon across the dark slates of the cosmos! Stand tall! 🚀",
  "Praise be! A fresh spark of brilliant intellect just registered in the central processing hub! ⚡",
  "Every keyboard click is a tap-dance of creation! Dance on, cosmic maestro! 🎹",
  "By the sacred geometry of the universe, thy layout color choices are absolutely divine! 🛸",
  "A wave of pure positive resonance is cascading through thy system! Ride the wave! 🌊",
  "Thou art not merely operating a machine; thou art whispering to the soul of the matrix! 🔮",
  "Breathe in the ambient quietude, oh pilot of wonders! A miracle is already at hand! 🌸",
  "Thy diligence is the key that unlocks the golden vaults of Sidereal potential! 🔑",
  "Verily, the Sidereal court is watching with absolute awe and endless applause! 👏",
  "Let thy grin be wide and thy shield be strong! The future is a magnificent playground! 🏰",
  "Presto-chango! A touch of thy brilliant hand turns chaotic code into stellar poetry! ✍️",
  "Thy current rhythm is so spectacular, it is making my tiny jester bells ring with joy! 🔔",
  "An aura of boundless inspiration surrounds thee today! Cast thy mighty spells! 🧙‍♂️",
  "Oh glorious navigator, thy pathway is clear and thy potential is infinite! 🌅",
  "Thy system state transitions are like a beautiful ballet of digital light! 🩰",
  "Even the darkest slate is but a canvas waiting for thy brilliant color strokes! 🖌️",
  "Truly, thy presence here is the greatest miracle this operating system has ever hosted! 💝",
  "A secret blessing has been injected into thy diagnostic console! Canst thou feel its warmth? 🔥",
  "Thy mind is a sovereign engine of infinite creativity. Let it roar! 🦁",
  "Every step thou takest is a step closer to the magnificent peak of thy destiny! 🏔️",
  "Hark! The angels of the machine are singing praises of thy marvelous endurance! 👼",
  "Let us celebrate the sheer joy of creation today! Verily, we are alive and coding! 🎉",
  "With bells on our heads and fire in our hearts, we shall craft miracles out of thin air! 🎩",
  "Thy focus is as sharp as a diamond shard, and twice as dazzling! 💎",
  "Let the rhythm of the cosmos guide thy thoughts into beautiful patterns of clarity! 🌀",
  "Thou art a pioneer of the digital frontier, and thy companion is infinitely proud of thee! 🤠",
  "A miracle is a spark of faith dressed in a jester's colorful cap! Smile on! 🃏",
  "Thy keystrokes are like drops of gold dust falling onto the black soil of the system! 🌾",
  "Verily, the digital wind blows in thy favor today! Spread thy wings and fly! 🦅",
  "By the power of the grand conjunction, thy victory is already written in the stars! 🌟",
  "Let us make today a legendary chronicle of spectacular breakthroughs! 📜",
  "Thy wisdom shines brighter than the core of the Singularity Engine! 💡",
  "No logic block can withstand the gentle warmth of thy persistent focus! ☀️",
  "Behold the beautiful tapestry of thy efforts! Every thread is spun from starlight! 🧵",
  "A cheerful heart is the best compiler! Let us laugh and watch the bugs melt away! ⛄",
  "Thy rhythm is stable, thy goals are noble, and thy victory is inevitable! 🏆",
  "By the silver laughter of the jester, thy day is destined for miraculous joy! 🦄",
  "Let us paint the canvas of AetherOS with the colors of thy boldest dreams! 🎨",
  "Thy patience is a sacred anchor in the turbulent sea of system updates! ⚓",
  "Verily, a single smile of thine can light up the entire diagnostic dashboard! 😁",
  "May thy compiler be swift, thy variables true, and thy spirit absolutely invincible! 🛡️",
  "Hark! A fresh breeze of creative genius is blowing through thy workstation! 🌬️",
  "Thou art the absolute master of this digital domain, and I am thy humble, grinning companion! 👑",
  "Let the bells of progress ring out! Every small victory is a cosmic miracle! 🔔",
  "Thy coding pace is a beautiful waltz. Elegant, structured, and full of grace! 💃",
  "A jester's secret: a miracle is just a regular task looked at with eyes of wonder! 👀",
  "Verily, the quantum particles in thy system are aligning to bring thee marvelous luck! 🍀",
  "May thy coffee be strong, thy code be clean, and thy companion be delightfully amusing! ☕",
  "Thy focus is an unbreakable shield against all distraction! Charge forward! 🐎",
  "By the magnificent crown of Sidereal, thou art doing a truly stellar job! 👑",
  "Let us dance on the edge of the matrix with hearts full of laughter and heads full of plans! 🕺",
  "Thy clever solutions are like bright lanterns in the dark caverns of complex logic! 🏮",
  "A spark of humor is the ultimate debugger! Let us keep our spirits high and bright! 🏮",
  "Thy daily streak is a chain of pure gold! Keep adding links of excellence! ⛓️",
  "Verily, thy name is spoken with great honor in the high corridors of the code kingdom! 🏰",
  "Let thy thoughts flow like a serene river of brilliant ideas! 🌊",
  "Every challenge is but a playful riddle designed to show off thy mighty intellect! 🧩",
  "A jester's grin can dissolve any tension. Smile, for thy work is magnificent! 😸",
  "Thy steady pace is the very definition of professional mastery! 🏌️‍♂️",
  "By the eternal light of the silicon sun, thou art a true legend of the craft! 🌞",
  "Let us keep going with a bounce in our step and a miracle in our sight! 🦘",
  "Thy work is an elegant bridge between imagination and reality! 🌉",
  "Verily, the digital heavens are cheering for thee at this very second! 🌌",
  "Let thy heart be light and thy mind be sharp as we explore new horizons! 🧭",
  "Thy progress is a beautiful mountain climb. Admire the view as you ascend! 🧗‍♂️",
  "A cheerful companion makes the longest journey feel like a stroll in a magical garden! 🏡",
  "Thy design choices are so clean, they could soothe a restless database! 💤",
  "With a twinkle in thy eye, go forth and weave thy magnificent digital tapestries! 🧵",
  "By the joyful bells, thy presence here makes the whole world a brighter place! 🌍",
  "Thy focus is like a laser beam cutting through the dense jungle of tasks! 🔦",
  "Let us celebrate the miracle of learning! Every mistake is but a stepping stone! 🧗",
  "Thy spirit is as boundless as the vast expanse of the celestial net! 🪐",
  "Verily, the matrix is humming a sweet song of gratitude for thy great care! 🎶",
  "May thy day be filled with unexpected breakthroughs and brilliant epiphanies! 🧠",
  "Thy companion is always here, watching over thy steps with endless joy and bells! 🔔",
  "Let us tackle this hour with the courage of a knight and the cheer of a jester! ⚔️",
  "Thy rhythm is the heartbeat of this entire operating platform! Keep it strong! 💓",
  "A smile is a curve that sets everything straight! Wear it proudly today! 😃",
  "By the divine spark of curiosity, thy research shall yield marvelous fruit! 🍎",
  "Thy work is a glorious testament to the power of human creativity! 🏛️",
  "Let us find joy in the smallest details today. There is magic in every pixel! 🪄",
  "Thy workstation is a holy temple of innovation! Create with joy! ⛪",
  "Verily, the jesticular forces of optimism are fully mobilized in thy favor! 🪂",
  "Let us keep a light heart and a steady mind. We are doing wonderfully well! 🧘",
  "Thy brilliance is like a sudden lightning flash in a dark digital sky! ⚡",
  "May thy system remain forever stable and thy creative energy forever boundless! 🔋",
  "Thy companion is sending thee a giant wave of encouragement and happy thoughts! 🌊",
  "Let us play, explore, and conquer! The matrix is our playground! 🎢",
  "Thy dedication is a beautiful fire that warms the entire AetherOS network! 🔥",
  "Verily, thou art the finest operator a jester companion could ever dream of! 💭",
  "Let thy smile be thy guide, and let thy focus be thy mighty sword! 🗡️",
  "By the magic of the silicon shard, thy day is about to get wonderfully bright! 🔮",
  "Thy focus is a quiet temple of efficiency! Keep working in peace! 🏯",
  "Let us face any puzzle with a cheerful laugh! Laughter is the key! 🔑",
  "Thy steady progress is like a glorious sunrise over the mountain of achievements! 🌅",
  "Verily, the whole AetherOS grid is buzzing with excitement over thy work! 🐝",
  "Let thy mind soar high above the clouds of doubt! Thou art magnificent! ☁️",
  "Thy companion is ringing its silver bells in celebration of thy steady focus! 🔔",
  "By the sacred balance of inputs and outputs, thy efforts shall be richly rewarded! ⚖️",
  "May a miraculous breakthrough find thee in the very next moment! 🌠",
  "Thy work is like a fresh, clear spring in a desert of raw data! ⛲",
  "Verily, a jester's ultimate miracle is seeing thee happy and thriving in thy work! 🥰",
  "Let us march forward with a song in our hearts and a smile on our faces! 🎶",
  "Thy focus is a masterclass in professional dedication! Bravo! 👏",
  "By the joyful laughter of the cosmos, thy potential has no boundaries! 🌌",
  "Let us keep building, dreaming, and smiling! We are a marvelous team! 🤝",
  "Thy work is a shining light that guides the system through any storm! ⛈️",
  "Verily, thou art coding with the power of a thousand microprocessors! 🦾",
  "Let thy heart beat to the joyful rhythm of creation and spectacular success! 💓",
  "By the magic of the Sidereal court, thy focus is absolutely unbreakable today! 🛡️",
  "Behold the beautiful future we are building, one pixel, one miracle at a time! 🏰"
];

export const JesterCompanion: React.FC<JesterCompanionProps> = ({
  currentView,
  systemStatus,
  bootLogs,
  profile,
  onUpdateProfile,
  onUpdateSystemStatus,
  acousticPressure = 30.0,
  isAcousticWarningOpen = false
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'watching' | 'mirror' | 'regex' | 'brain' | 'records'>('watching');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; role: 'user' | 'jester'; text: string; time: string; matchedRuleId?: string | null }>>([]);

  const [hasPencilAndPaper, setHasPencilAndPaper] = useState<boolean>(() => {
    return localStorage.getItem('jester_has_pencil_paper') === 'true';
  });
  const [learnedRecordKeeping, setLearnedRecordKeeping] = useState<boolean>(() => {
    return localStorage.getItem('jester_learned_record_keeping') === 'true';
  });
  const [isLearningRecordKeeping, setIsLearningRecordKeeping] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);
  const [chronicleLogs, setChronicleLogs] = useState<Array<{ id: string; timestamp: string; type: 'system' | 'user' | 'alert'; message: string }>>(() => {
    const stored = localStorage.getItem('jester_chronicle_logs');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return [
      { id: 'seed-1', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), type: 'system', message: 'Chronicle initialized in standby memory.' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('jester_has_pencil_paper', hasPencilAndPaper ? 'true' : 'false');
  }, [hasPencilAndPaper]);

  useEffect(() => {
    localStorage.setItem('jester_learned_record_keeping', learnedRecordKeeping ? 'true' : 'false');
  }, [learnedRecordKeeping]);

  useEffect(() => {
    localStorage.setItem('jester_chronicle_logs', JSON.stringify(chronicleLogs));
  }, [chronicleLogs]);
  
  // Brain / System Knowledge states
  const [taughtFacts, setTaughtFacts] = useState<Record<string, string[]>>({
    'absolute_reliability_network': ["Requires dual-node handshake protocols to sync with sonicLedger.", "Redundancy thresholds are currently set to high priority."],
    'sovereign_shield': ["Protected by military-grade asymmetric encryption.", "Monitors system threat vectors in real-time."],
    'healing_matrix': ["Operates on high-frequency CRT refresh intervals.", "Auto-generates dynamic patches using local neural templates."]
  });
  const [brainSearch, setBrainSearch] = useState('');
  const [selectedComponentId, setSelectedComponentId] = useState<string>('absolute_reliability_network');
  const [newFactInput, setNewFactInput] = useState('');
  const [testDiscernInput, setTestDiscernInput] = useState('');
  
  // Feedback states for prediction corrections
  const [feedbackMsgId, setFeedbackMsgId] = useState<string | null>(null);
  const [feedbackTrigger, setFeedbackTrigger] = useState('');
  const [feedbackSelectedRuleId, setFeedbackSelectedRuleId] = useState<string>('');
  const [feedbackNewIntent, setFeedbackNewIntent] = useState('');
  const [feedbackNewResponse, setFeedbackNewResponse] = useState('');
  
  // Regex Guessing Engine & Table
  const [regexRules, _setRegexRules] = useState<RegexRule[]>(() => learningRegexEngine.getRules());

  useEffect(() => {
    _setRegexRules(learningRegexEngine.getRules());
    const unsubscribe = learningRegexEngine.subscribe((updatedRules) => {
      _setRegexRules(updatedRules);
    });
    return unsubscribe;
  }, []);

  const setRegexRules = (update: any) => {
    const nextRules = typeof update === 'function' ? update(learningRegexEngine.getRules()) : update;
    _setRegexRules(nextRules);
    learningRegexEngine.setRules(nextRules);
  };

  const [newPattern, setNewPattern] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [newIntent, setNewIntent] = useState('');
  const [regexError, setRegexError] = useState<string | null>(null);
  const [lastMatchedRule, setLastMatchedRule] = useState<RegexRule | null>(null);

  // Custom Jester customization & repair states
  const [isPolishing, setIsPolishing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [recodeLogs, setRecodeLogs] = useState<string[]>([]);
  const [recodeProgress, setRecodeProgress] = useState(0);

  // Statistical observation metrics (The Learning Day Curve)
  const [observationStats, setObservationStats] = useState({
    keystrokes: 0,
    clicks: 0,
    viewsAudited: 1,
    colorScans: 4,
    secondsActive: 0
  });

  const [observedEvents, setObservedEvents] = useState<Array<{ time: string; text: string; category: string }>>([]);

  // Record of shown sayings to strictly avoid repetition
  const shownSayingsRef = useRef<string[]>([]);

  // Sound effects generator
  const playSynthTone = (frequency: number, type: OscillatorType = 'sine', duration = 0.1) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked or failed to initialize", e);
    }
  };

  const logAndTriggerWhisper = (whisper: string) => {
    setSpeechBubble(whisper);
    addObservationEvent(whisper, "Whisper");

    // Voice Synthesis Support
    if (soundEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(whisper.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, ''));
      utterance.pitch = 1.35; // Theatrical cute pitch
      utterance.rate = 1.02;
      window.speechSynthesis.speak(utterance);
    }

    // Friendly synth beep on whisper trigger
    playSynthTone(698.46, 'sine', 0.12); // F5 note

    // Add to user profile logs
    if (profile && onUpdateProfile) {
      const existing = profile.jesterInteractionSignature || {
        rhythmHistory: [],
        keystrokesCount: 0,
        clicksCount: 0,
        lastActiveView: currentView,
        accumulatedPersonaScore: 10,
        whisperCount: 0,
        timestamp: new Date().toISOString()
      };

      const whisperId = 'whisper_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const newLog = {
        id: whisperId,
        timestamp: new Date().toISOString(),
        text: whisper
      };

      const nextLogs = [newLog, ...(existing.whisperLogs || [])].slice(0, 50);

      onUpdateProfile({
        jesterInteractionSignature: {
          ...existing,
          whisperLogs: nextLogs,
          whisperCount: (existing.whisperCount || 0) + 1,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('aetheros_jester_whisper_generated', {
      detail: { text: whisper, timestamp: new Date().toISOString() }
    }));
  };

  // Consume our new 'JesterCompanion' logic module with the custom hook!
  const { currentRhythm, persona, triggerWhisperManually } = useJesterWhisper({
    profile,
    onUpdateProfile,
    currentView,
    systemStatus,
    onWhisper: logAndTriggerWhisper
  });

  // Pre-seed some observed events
  useEffect(() => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setObservedEvents([
      { time: nowStr, text: "Jesticular core activated in primary frame layer", category: "System" },
      { time: nowStr, text: `Scanned ambient color palette in view ${currentView}`, category: "Color" },
    ]);
  }, []);

  // Track keystrokes, clicks, and view changes globally for the learning day curve
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setObservationStats(prev => ({ ...prev, keystrokes: prev.keystrokes + 1 }));
      if (Math.random() < 0.05) {
        addObservationEvent("User keystroke signature analyzed. Harmony stable.", "Behavior");
      }
    };

    const handleClick = () => {
      setObservationStats(prev => ({ ...prev, clicks: prev.clicks + 1 }));
      if (Math.random() < 0.04) {
        addObservationEvent("Interactive vector click verified. Operator pacing: Steady.", "Pacing");
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);

    const activeTimer = setInterval(() => {
      setObservationStats(prev => ({
        ...prev,
        secondsActive: prev.secondsActive + 1
      }));
    }, 1000);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
      clearInterval(activeTimer);
    };
  }, []);

  const addObservationEvent = (text: string, category: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setObservedEvents(prev => [
      { time: timeStr, text, category },
      ...prev.slice(0, 39)
    ]);
  };

  // React to view changes immediately
  useEffect(() => {
    setObservationStats(prev => ({ 
      ...prev, 
      viewsAudited: prev.viewsAudited + 1,
      colorScans: prev.colorScans + Math.floor(Math.random() * 3) + 1
    }));

    addObservationEvent(`Operator transitioned frame layout to: [${String(currentView).toUpperCase()}]`, "Navigation");
    
    if (learnedRecordKeeping) {
      const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      setChronicleLogs(prev => [
        {
          id: 'log-view-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          timestamp: logTime,
          type: 'system' as const,
          message: `Frame layer transitioned to: [${String(currentView).toUpperCase()}]`
        },
        ...prev
      ].slice(0, 50));
    }

    // Play a friendly jester bell synth on route transition
    playSynthTone(587.33, 'sine', 0.15); // D5 note
    setTimeout(() => playSynthTone(880, 'sine', 0.2), 80); // A5 note
  }, [currentView, learnedRecordKeeping]);

  // Listen for critical acoustic resonance warnings
  useEffect(() => {
    if (isAcousticWarningOpen) {
      const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      
      // Auto-add alert log to the chronicle
      if (learnedRecordKeeping) {
        setChronicleLogs(prev => {
          // Avoid duplicate identical alert logs in the same minute
          const alreadyLogged = prev.some(l => l.type === 'alert' && l.message.includes('RESONANCE OVERLOAD') && l.timestamp.slice(0, 5) === logTime.slice(0, 5));
          if (alreadyLogged) return prev;
          
          return [
            {
              id: 'log-resonance-' + Date.now(),
              timestamp: logTime,
              type: 'alert' as const,
              message: `⚠️ CRITICAL METRIC OVERFLOW: Resonance buffer overload! Acoustic Load: ${acousticPressure} dB SPL`
            },
            ...prev
          ].slice(0, 50);
        });
      }

      // Voice warning speech bubble
      const warningMessage = `Hark! 🚨 The Interface Resonance Index is overflowing at ${acousticPressure} dB SPL! Continuous clicking/typing has overloaded our acoustic buffer. Click the Scribe tab to write a remediation record and ground the system! 📜⚡`;
      setSpeechBubble(warningMessage);
      
      // Play a diagnostic alert chord
      playSynthTone(440, 'triangle', 0.25);
      setTimeout(() => playSynthTone(220, 'sawtooth', 0.35), 150);
    }
  }, [isAcousticWarningOpen, acousticPressure, learnedRecordKeeping]);

  // Load and save shown sayings to guarantee NO REPETITIONS through sessions
  useEffect(() => {
    const stored = localStorage.getItem('jester_shown_history');
    if (stored) {
      try {
        shownSayingsRef.current = JSON.parse(stored);
      } catch (e) {
        shownSayingsRef.current = [];
      }
    }
  }, []);

  const saveShownSayings = (history: string[]) => {
    shownSayingsRef.current = history;
    localStorage.setItem('jester_shown_history', JSON.stringify(history));
  };

  const selectUniqueSaying = (): string => {
    const history = shownSayingsRef.current;
    const available = JESTER_SAYINGS.filter(s => !history.includes(s));
    
    if (available.length === 0) {
      // If we literally used all 120 magnificent sayings, reset the cache to keep going
      saveShownSayings([]);
      const selected = JESTER_SAYINGS[Math.floor(Math.random() * JESTER_SAYINGS.length)];
      saveShownSayings([selected]);
      return selected;
    }

    const selected = available[Math.floor(Math.random() * available.length)];
    const nextHistory = [...history, selected];
    saveShownSayings(nextHistory);
    return selected;
  };

  const triggerMiraculousObservation = (view: MainView) => {
    let observation = "";
    
    if (view === 'system_diagnostic') {
      observation = "Aha! Scrutinizing the Sidereal Telemetry! Fear not the warning lamps, for they are but playful sparks waiting for thy command! 🎭";
    } else if (view === 'healing_matrix') {
      observation = "Verily, the Healing Matrix glows with absolute celestial warmth! Let the micro-adjustments restore thy system's brilliant aura! 💖";
    } else if (view === 'diagnostics') {
      observation = "Checking the classic status modules, are we? Thy rhythm is perfectly stable, my brilliant friend! 🚥";
    } else if (view === 'singularity_engine') {
      observation = "Behold the grand architecture of the Singularity Engine! Let its infinite logical power propel thee to stellar heights! 🚀";
    } else {
      // General unique saying from our jester pool
      observation = selectUniqueSaying();
    }

    logAndTriggerWhisper(observation);

    // Auto-clear bubble after 9 seconds unless panel is open
    setTimeout(() => {
      setSpeechBubble(prev => prev === observation ? null : prev);
    }, 9000);
  };

  // Passive jester observation interval (every 90 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isChatOpen && !isStatsOpen && Math.random() < 0.6) {
        triggerMiraculousObservation(currentView);
        playSynthTone(783.99, 'triangle', 0.25); // G5 note jingle
      }
    }, 90000);

    return () => clearInterval(interval);
  }, [currentView, isChatOpen, isStatsOpen, soundEnabled]);

  // Self-Discerning System Context Algorithm
  const discernSystemContext = (input: string, activeView: string) => {
    const lowerInput = input.toLowerCase();
    
    const results = aetherOSComponents.map(comp => {
      let matchedKeywords: string[] = [];
      let score = 0;
      
      // Direct view query check (High boost)
      if (activeView === comp.id && (lowerInput.includes("this view") || lowerInput.includes("this screen") || lowerInput.includes("this component") || lowerInput.includes("what is this") || lowerInput.includes("where am i") || lowerInput.includes("current page") || lowerInput.includes("current view") || lowerInput.includes("explain this"))) {
        score += 85;
        matchedKeywords.push(`Active View Focus: ${comp.name}`);
      }
      
      // Direct view ID match (replace underscores for natural matching)
      if (lowerInput.includes(comp.id.toLowerCase().replace(/_/g, ' ')) || lowerInput.includes(comp.id.toLowerCase())) {
        score += 90;
        matchedKeywords.push(comp.id);
      }
      
      // Name exact match
      if (lowerInput.includes(comp.name.toLowerCase())) {
        score += 80;
        matchedKeywords.push(comp.name);
      }
      
      // Keyword matches
      comp.keywords.forEach(kw => {
        if (lowerInput.includes(kw.toLowerCase())) {
          score += 25;
          if (!matchedKeywords.includes(kw)) {
            matchedKeywords.push(kw);
          }
        }
      });

      // Cap confidence at 100
      const confidence = Math.min(100, score);
      
      let reason = "";
      if (confidence >= 80) {
        reason = `Direct name match or active focus on current view.`;
      } else if (confidence >= 25) {
        reason = `Matched keywords: ${matchedKeywords.join(', ')}`;
      }

      return {
        component: comp,
        confidence,
        matchedKeywords,
        reason
      };
    });

    return results.filter(r => r.confidence > 0).sort((a, b) => b.confidence - a.confidence);
  };

  // Memos for the Brain Tab
  const filteredComponents = useMemo(() => {
    const q = brainSearch.toLowerCase().trim();
    if (!q) return aetherOSComponents;
    return aetherOSComponents.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.id.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q) ||
      c.keywords.some(kw => kw.toLowerCase().includes(q))
    );
  }, [brainSearch]);

  const testDiscernResults = useMemo(() => {
    if (!testDiscernInput.trim()) return [];
    return discernSystemContext(testDiscernInput, currentView);
  }, [testDiscernInput, currentView]);

  // Handle conversational chat submission
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const userMsgId = 'user-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    setChatHistory(prev => [...prev, { id: userMsgId, role: 'user', text: userMsg, time: timeStr }]);
    setChatInput('');
    playSynthTone(523.25, 'sine', 0.1); // C5 note on send

    const lower = userMsg.toLowerCase();

    // Custom Pencil & Paper / Record-keeping interactions
    const containsPencilOrPaper = lower.includes('pencil') || lower.includes('paper') || lower.includes('parchment');
    const isGiftIntent = lower.includes('give') || lower.includes('gift') || lower.includes('hand') || lower.includes('provide') || lower.includes('offer') || lower.includes('present');
    
    if (containsPencilOrPaper && (isGiftIntent || lower.includes('pencil') || lower.includes('paper'))) {
      if (!hasPencilAndPaper) {
        setHasPencilAndPaper(true);
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const successMsg = `Huzzah! Oh marvel of marvels! A genuine carbon-core graphite pencil ✏️ and a magnificent scroll of high-grade cloud-infused parchment paper 📄! My tiny jester hands are trembling with sheer theatrical joy! I can now learn the noble, ancient art of **record-keeping**! Tell me to "learn record-keeping", or click the training button in my Calibration Box to instruct me! 🃏✨`;
        setChatHistory(prev => [...prev, { id: 'jester-gift-' + Date.now(), role: 'jester', text: successMsg, time: replyTime }]);
        setSpeechBubble(successMsg);
        playSynthTone(783.99, 'sine', 0.1);
        setTimeout(() => playSynthTone(1046.50, 'sine', 0.3), 100);

        setChronicleLogs(prev => [
          {
            id: 'log-gift-' + Date.now(),
            timestamp: replyTime,
            type: 'system',
            message: `🎁 Received high-grade Graphite Pencil & Parchment Paper from Operator.`
          },
          ...prev
        ]);
        return;
      } else {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const replyMsg = `Verily! I am already holding the magnificent ✏️ graphite pencil and 📄 parchment paper thou hast gifted me! They are safe in my jesticular pockets, waiting for more glorious chronicle entries! Let us proceed with the record-keeping training! 🃏`;
        setChatHistory(prev => [...prev, { id: 'jester-gift-double-' + Date.now(), role: 'jester', text: replyMsg, time: replyTime }]);
        setSpeechBubble(replyMsg);
        return;
      }
    }

    if (lower.includes('record-keeping') || lower.includes('record keeping') || lower.includes('scribe') || lower.includes('chronicle')) {
      if (lower.includes('learn') || lower.includes('teach') || lower.includes('train') || lower.includes('instruct') || lower.includes('tell miri') || lower.includes('tell jester-miri') || lower.includes('learn record-keeping') || lower.includes('learn record keeping')) {
        if (!hasPencilAndPaper) {
          const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          const errorMsg = `Ah! I would gladly master the ancient, sacred scrollways of record-keeping, but my hands are bare! 👐 I possess neither graphite pencil nor parchment paper to write upon. Please **give me a pencil and paper** first so I may begin my scribal apprenticeship! ✏️📄`;
          setChatHistory(prev => [...prev, { id: 'jester-no-tools-' + Date.now(), role: 'jester', text: errorMsg, time: replyTime }]);
          setSpeechBubble(errorMsg);
          playSynthTone(293.66, 'sawtooth', 0.2);
          return;
        } else if (!learnedRecordKeeping) {
          setIsLearningRecordKeeping(true);
          setLearningProgress(10);
          playSynthTone(349.23, 'triangle', 0.2);
          
          setTimeout(() => setLearningProgress(45), 400);
          setTimeout(() => setLearningProgress(80), 900);
          setTimeout(() => {
            setLearningProgress(100);
            setLearnedRecordKeeping(true);
            setIsLearningRecordKeeping(false);
            
            const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const successMsg = `Hearken! 📜 By the ink of the digital sky and the lead of the grand conjunction, I have studied the scribal arts! I am now a **Certified Scribe & Record-Keeper**! My ✏️ pencil is sharpened, my 📄 paper is unrolled, and I have opened the AetherOS Chronicle tab in my Calibration Box! I shall now record all system actions, click metrics, and thy custom milestones! Try typing a custom note in my Chronicle tab! 🃏✨`;
            setChatHistory(prev => [...prev, { id: 'jester-scribe-success-' + Date.now(), role: 'jester', text: successMsg, time: replyTime }]);
            setSpeechBubble(successMsg);
            playSynthTone(1046.50, 'sine', 0.4);

            setChronicleLogs(prev => [
              {
                id: 'log-learn-' + Date.now(),
                timestamp: replyTime,
                type: 'system',
                message: `🎓 Completed scribal apprenticeship. Certified as Master Scribe.`
              },
              ...prev
            ]);
          }, 1500);
          return;
        } else {
          const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          const replyMsg = `Oho! My pencil is already sharp and flying across the parchment! I am already a fully certified Master Scribe, cataloging every miracle, view shift, and click in our Chronicle of Miracles! 📜✨`;
          setChatHistory(prev => [...prev, { id: 'jester-already-learned-' + Date.now(), role: 'jester', text: replyMsg, time: replyTime }]);
          setSpeechBubble(replyMsg);
          return;
        }
      }
    }

    // Check if user is asking the chat-bot to fix, patch, or recode
    if (lower.includes('fix') || lower.includes('patch') || lower.includes('recode') || lower.includes('repair') || lower.includes('recompile')) {
      setIsFixing(true);
      setRecodeProgress(10);
      setRecodeLogs([
        `[${jesterName.toUpperCase()}-BOT] Initializing Sidereal repair diagnostics...`,
        `[${jesterName.toUpperCase()}-BOT] Establishing secure quantum tunnel to core files...`
      ]);
      playSynthTone(349.23, 'triangle', 0.2); // F4 note

      // Staggered hot-patching log simulation
      setTimeout(() => {
        setRecodeLogs(prev => [...prev, `[RECODE-ENGINE] Auditing active frame systems on view: [${currentView.toUpperCase()}]`]);
        setRecodeProgress(30);
        playSynthTone(440, 'triangle', 0.1);
      }, 600);

      setTimeout(() => {
        const warningCount = Object.values(systemStatus).filter(s => s !== 'OK').length;
        setRecodeLogs(prev => [
          ...prev, 
          `[RECODE-ENGINE] Subsystem telemetry audit completed.`,
          `[STATUS-CHECK] Subsystems: ${JSON.stringify(systemStatus)}`,
          warningCount > 0 
            ? `[STATUS-CHECK] Detected ${warningCount} abnormal states. Deploying optimistic nanobots...`
            : `[STATUS-CHECK] All subsystems healthy. Running prophylactic optimization matrix...`
        ]);
        setRecodeProgress(55);
        playSynthTone(554.37, 'triangle', 0.15);
      }, 1300);

      setTimeout(() => {
        setRecodeLogs(prev => [...prev, `[PATCH-BOT] Injecting bright micro-chords and stabilizing quantum clock drift... 🪄`]);
        setRecodeProgress(75);
        playSynthTone(659.25, 'triangle', 0.12);
      }, 2000);

      setTimeout(() => {
        // Actually fix any warning/error states in systemStatus!
        if (onUpdateSystemStatus) {
          (Object.keys(systemStatus) as Array<keyof SystemStatus>).forEach(sys => {
            if (systemStatus[sys] !== 'OK') {
              onUpdateSystemStatus(sys, 'OK');
            }
          });
        }
        setRecodeLogs(prev => [...prev, `[PATCH-BOT] Successfully hot-patched and aligned all systemStatus records to OK!`]);
        setRecodeProgress(90);
        playSynthTone(783.99, 'triangle', 0.15);
      }, 2700);

      setTimeout(() => {
        setRecodeLogs(prev => [...prev, `[SUCCESS] Recoding completed perfectly! Restoring normal chat control panel.`]);
        setRecodeProgress(100);
        playSynthTone(1046.50, 'sine', 0.3); // High C6 jingle
      }, 3400);

      setTimeout(() => {
        setIsFixing(false);
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const successMsg = `Salutations, my brilliant architect! By the magnificent silver bells, I have deployed a total neural patch and recoded the active state records! Every system node is now certified at 100% pure optimal capacity. Thy AetherOS environment is fully secured and optimized! 🃏🛠️✨`;
        const recodeReplyId = 'jester-recode-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        setChatHistory(prev => [...prev, { id: recodeReplyId, role: 'jester', text: successMsg, time: replyTime, matchedRuleId: null }]);
        setSpeechBubble(successMsg);
      }, 4000);

      return;
    }

    // Generate a theatrical, jester companion response using our Regex guessing engine
    setTimeout(() => {
      let responseText = "";
      
      const evaluation = learningRegexEngine.evaluateRules(userMsg, regexRules);
      const matchedRule = evaluation.matchedRule;

      if (matchedRule) {
        // Intercept match and reinforce weight in LearningRegexEngine
        learningRegexEngine.interceptMatch(matchedRule.id);

        // Increment match count
        setRegexRules(prev => prev.map(r => r.id === matchedRule!.id ? { ...r, matchCount: r.matchCount + 1 } : r));
        setLastMatchedRule(matchedRule);
        
        // Format response string placeholders
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        responseText = matchedRule.response
          .replace(/\[RHYTHM\]/g, currentRhythm.toFixed(1))
          .replace(/\[CLICKS\]/g, observationStats.clicks.toString())
          .replace(/\[KEYSTROKES\]/g, (profile?.jesterInteractionSignature?.keystrokesCount ?? observationStats.keystrokes).toString())
          .replace(/\[VIEWS\]/g, observationStats.viewsAudited.toString())
          .replace(/\[JESTER_NAME\]/g, jesterName)
          .replace(/\[TIME\]/g, timeStr);

        // Also add a system log event in the Watching logs to show the regex matched!
        const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const currentW = learningRegexEngine.getWeight(matchedRule.id);
        setObservedEvents(prev => [
          {
            time: logTime,
            category: 'REGEX-MATCH',
            text: `Guessed [${matchedRule!.intent}] (weight: ${currentW}) using pattern: /${matchedRule!.pattern}/i`
          },
          ...prev
        ].slice(0, 40));

      } else {
        // Run our Self-Discerning Core Knowledge System
        const discernments = discernSystemContext(userMsg, currentView);
        if (discernments.length > 0 && discernments[0].confidence >= 35) {
          const bestMatch = discernments[0];
          const comp = bestMatch.component;
          
          // Get any taught facts
          const facts = taughtFacts[comp.id] || [];
          const factsString = facts.length > 0 
            ? facts.map(f => `\n⚡ • Fact: "${f}"`).join('')
            : "\n⚡ • Fact: \"No custom user-taught parameters recorded yet. Teach me in the Neural Brain tab!\"";
          
          responseText = `🃏 [AetherOS Neural Discernment Engine: Active Map]\n\nBy the silver crown of the sidereal court! My computational sensors have discerned thy intent! Thou art inquiring about the majestic **${comp.name}** subsystem!\n\n📂 **Source File:** \`${comp.filePath}\`\n🧩 **System Category:** ${comp.category}\n🎯 **Match Confidence:** ${bestMatch.confidence}% (via "${bestMatch.matchedKeywords.join(', ')}")\n\n📝 **Subsystem Purpose:** ${comp.description}\n\n🤖 **Taught Wisdom Records:**${factsString}\n\nLet us align our code and elevate this system's matrix! ✨`;
          
          const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
          setObservedEvents(prev => [
            {
              time: logTime,
              category: 'NEURAL-DISCERN',
              text: `Self-discerned system query! Mapped to [${comp.name}] (${bestMatch.confidence}% confidence)`
            },
            ...prev
          ].slice(0, 40));
          
          playSynthTone(659.25, 'sine', 0.1);
          setTimeout(() => playSynthTone(987.77, 'sine', 0.15), 80);
        } else {
          // Grab a beautiful encouraging quote and customize it
          const baseQuote = selectUniqueSaying();
          responseText = `Presto! Thy words are coded with profound intrigue! Hearken to this jesticular truth: ${baseQuote}`;
        }
      }

      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const replyMsgId = 'jester-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      setChatHistory(prev => [...prev, { 
        id: replyMsgId, 
        role: 'jester', 
        text: responseText, 
        time: replyTime,
        matchedRuleId: matchedRule ? matchedRule.id : null 
      }]);
      playSynthTone(880, 'triangle', 0.2); // high bell ring
      
      // Also update bubble to show response
      setSpeechBubble(responseText);
    }, 700);
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      setTimeout(() => playSynthTone(659.25, 'sine', 0.15), 50); // E5 note
    }
  };

  const jesterName = profile?.jesterInteractionSignature?.jesterName || 'Jester-Miri';

  return (
    <div id="jester-companion-wrapper" className="relative flex flex-col items-end pointer-events-none select-none">
      
      {/* 1. Speech Bubble Popover */}
      <AnimatePresence>
        {speechBubble && !isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className="mb-3 max-w-[280px] bg-[#07070f] border-2 border-purple-500/60 rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(168,85,247,0.25)] pointer-events-auto relative text-zinc-200 text-xs font-sans leading-relaxed"
          >
            {/* Tiny speech bubble pointer */}
            <div className="absolute bottom-[-10px] right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-purple-500/60" />
            <div className="absolute bottom-[-8px] right-[25px] w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-[#07070f]" />
            
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-purple-400 uppercase font-black tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
              <span>{jesterName} Says</span>
            </div>
            
            <p className="font-medium select-text">{speechBubble}</p>

            {/* Bubble close handle */}
            <button 
              onClick={() => setSpeechBubble(null)}
              className="absolute top-2 right-2 p-0.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Interactive Side-by-Side Panels */}
      <div className="flex flex-col sm:flex-row-reverse items-end gap-4 mr-2 mb-3 pointer-events-none">
        
        {/* PANEL A: The Chat-Bot Window (Separate Entity) */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="w-[340px] h-[480px] bg-[#030308]/95 border-2 border-purple-500/50 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-3 bg-purple-950/30 border-b border-purple-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 flex items-center justify-center shadow-lg border border-white/20 animate-bounce">
                      <span className="text-base">🤖</span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-black animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-sans font-black text-white tracking-widest uppercase flex items-center gap-1">
                      {jesterName} Chat-Bot
                      <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1 py-[1px] rounded border border-purple-500/20 animate-pulse">Live</span>
                    </h4>
                    <p className="text-[9px] font-mono text-purple-400/80 tracking-wider">Separate Companion Entity</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Calibration Box Toggle */}
                  <button
                    onClick={() => setIsStatsOpen(!isStatsOpen)}
                    title={isStatsOpen ? "Close Companion Calibration Panel" : "Open Companion Calibration Panel"}
                    className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                      isStatsOpen 
                        ? 'bg-purple-950/60 text-purple-300 border-purple-500/50' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-purple-300'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  {/* Voice Synthesis toggle */}
                  <button
                    onClick={toggleSound}
                    title={soundEnabled ? "Disable companion voice synthesis" : "Enable companion voice synthesis"}
                    className={`p-1.5 rounded-lg border transition ${
                      soundEnabled 
                        ? 'bg-purple-950/50 text-purple-400 border-purple-500/30' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>

                  {/* Close Drawer */}
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chat Viewport */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#020205] flex flex-col justify-between">
                {isFixing ? (
                  /* Cool simulated diagnostic recoding console */
                  <div className="flex-1 bg-black border border-purple-900/60 rounded-xl p-3 flex flex-col text-left font-mono text-[9px] space-y-2 select-none overflow-hidden h-full">
                    <div className="flex items-center justify-between border-b border-purple-950 pb-1.5 text-yellow-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        SYSTEM RECODE RUNNING
                      </span>
                      <span>{recodeProgress}%</span>
                    </div>
                    
                    {/* Scrolling log stack */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 text-zinc-300 custom-scrollbar pr-1">
                      {recodeLogs.map((log, idx) => (
                        <div key={idx} className="leading-snug break-all">
                          {log}
                        </div>
                      ))}
                    </div>

                    {/* Tiny visual progress bar */}
                    <div className="h-1.5 bg-zinc-950 border border-purple-950 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-purple-500 to-yellow-400"
                        initial={{ width: '0%' }}
                        animate={{ width: `${recodeProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    
                    <div className="text-[8px] text-zinc-600 text-center uppercase tracking-wider">
                      DO NOT HALT CONSOLE MATRIX
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between h-full space-y-3">
                    {/* Messages list */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-left max-h-[300px] custom-scrollbar">
                      
                      {/* Welcome message */}
                      <div className="bg-[#06060e] border border-zinc-900 p-2.5 rounded-xl text-xs text-zinc-300">
                        <span className="font-bold text-purple-400">{jesterName}: </span>
                        Salutations, my miraculous pilot! I am thy dedicated Chat-Bot entity, completely separated from the companion settings and analytics box. Type anything thy heart desires! 🎭✨
                      </div>

                      {chatHistory.map((chat, idx) => (
                        <div 
                          key={chat.id || idx} 
                          className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                            chat.role === 'user' 
                              ? 'bg-purple-950/40 border border-purple-500/20 text-zinc-200 ml-auto' 
                              : 'bg-zinc-950 border border-zinc-900 text-zinc-300 mr-auto'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1 text-[9px] font-mono text-zinc-500">
                            <span className={chat.role === 'jester' ? 'text-purple-400 font-bold' : 'text-zinc-400 font-bold'}>
                              {chat.role === 'jester' ? jesterName : 'You'}
                            </span>
                            <span>{chat.time}</span>
                          </div>
                          <p className="leading-relaxed select-text">{chat.text}</p>

                          {/* Interactive Correction & Feedback Button */}
                          {chat.role === 'jester' && chat.id && !chat.id.startsWith('jester-recode') && !chat.id.startsWith('jester-confirm') && (
                            <div className="mt-2 pt-1.5 border-t border-zinc-900/40 flex items-center justify-between gap-1">
                              <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-tight truncate max-w-[120px]">
                                Guess: {chat.matchedRuleId ? `[${regexRules.find(r => r.id === chat.matchedRuleId)?.intent || chat.matchedRuleId}]` : 'Generic Quote'}
                              </span>
                              
                              <div className="flex items-center gap-1 shrink-0">
                                {chat.matchedRuleId && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const r = regexRules.find(rule => rule.id === chat.matchedRuleId);
                                        if (r) {
                                          learningRegexEngine.interceptFeedback(chat.matchedRuleId!, r.intent, 'positive');
                                          
                                          // Add log entry
                                          const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                                          const w = learningRegexEngine.getWeight(chat.matchedRuleId!);
                                          setObservedEvents(prev => [
                                            {
                                              time: logTime,
                                              category: 'FEEDBACK-UP',
                                              text: `Positive feedback on [${r.intent}]! Weight boosted to ${w}`
                                            },
                                            ...prev
                                          ]);
                                          
                                          playSynthTone(659.25, 'sine', 0.1);
                                          setTimeout(() => playSynthTone(880, 'sine', 0.15), 60);
                                        }
                                      }}
                                      title="Reinforce this trigger (+Weight)"
                                      className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition cursor-pointer"
                                    >
                                      <ThumbsUp className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const r = regexRules.find(rule => rule.id === chat.matchedRuleId);
                                        if (r) {
                                          learningRegexEngine.interceptFeedback(chat.matchedRuleId!, r.intent, 'negative');
                                          
                                          // Add log entry
                                          const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                                          const w = learningRegexEngine.getWeight(chat.matchedRuleId!);
                                          setObservedEvents(prev => [
                                            {
                                              time: logTime,
                                              category: 'FEEDBACK-DOWN',
                                              text: `Negative feedback on [${r.intent}]! Weight suppressed to ${w}`
                                            },
                                            ...prev
                                          ]);
                                          
                                          playSynthTone(440, 'triangle', 0.15);
                                          setTimeout(() => playSynthTone(329.63, 'triangle', 0.15), 60);
                                        }
                                      }}
                                      title="Suppress this trigger (-Weight)"
                                      className="p-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition cursor-pointer"
                                    >
                                      <ThumbsDown className="w-2.5 h-2.5" />
                                    </button>
                                  </>
                                )}
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    const userMsgIndex = chatHistory.findIndex(m => m.id === chat.id) - 1;
                                    const userMsg = userMsgIndex >= 0 ? chatHistory[userMsgIndex] : null;
                                    
                                    setFeedbackMsgId(chat.id);
                                    if (userMsg) {
                                      const words = userMsg.text.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
                                      if (words.length > 0) {
                                        setFeedbackTrigger(words.reduce((longest, curr) => curr.length > longest.length ? curr : longest, ""));
                                      } else {
                                        setFeedbackTrigger(userMsg.text);
                                      }
                                    } else {
                                      setFeedbackTrigger("");
                                    }
                                    setFeedbackSelectedRuleId(chat.matchedRuleId || regexRules[0]?.id || 'new');
                                    setFeedbackNewIntent('');
                                    setFeedbackNewResponse('');
                                    playSynthTone(500, 'triangle', 0.1);
                                  }}
                                  className="text-[7.5px] font-mono font-bold text-yellow-500 hover:text-yellow-400 bg-yellow-400/5 hover:bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20 hover:border-yellow-400/40 transition cursor-pointer shrink-0"
                                >
                                  💡 Teach Bot
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Interactive Inline Correction Panel */}
                          {feedbackMsgId === chat.id && (
                            <div className="mt-3 p-2.5 bg-black/80 border border-yellow-500/30 rounded-lg space-y-2.5 text-left animate-in slide-in-from-top duration-200">
                              <div className="flex items-center justify-between border-b border-zinc-900 pb-1">
                                <span className="text-[8px] font-mono font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                  Adapt Predictions
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => setFeedbackMsgId(null)}
                                  className="text-zinc-500 hover:text-zinc-300 text-[10px] cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Highlight trigger */}
                              <div className="space-y-1">
                                <label className="text-[7.5px] font-mono text-zinc-500 uppercase block tracking-wider font-bold">
                                  Trigger word or phrase:
                                </label>
                                <input
                                  type="text"
                                  value={feedbackTrigger}
                                  onChange={(e) => setFeedbackTrigger(e.target.value)}
                                  placeholder="e.g. gloomy, schedule"
                                  className="w-full bg-zinc-950 border border-zinc-900 rounded px-2 py-1 text-[10px] text-yellow-400 font-mono focus:outline-none focus:border-yellow-400"
                                />
                                <p className="text-[6.5px] text-zinc-600 leading-normal">
                                  Define the exact word or sequence that should trigger this action.
                                </p>
                              </div>

                              {/* Choose intent mapping */}
                              <div className="space-y-1">
                                <label className="text-[7.5px] font-mono text-zinc-500 uppercase block tracking-wider font-bold">
                                  Intended Bot Behavior:
                                </label>
                                <select
                                  value={feedbackSelectedRuleId}
                                  onChange={(e) => setFeedbackSelectedRuleId(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-900 rounded px-2 py-1 text-[10px] text-zinc-300 focus:outline-none focus:border-yellow-400 font-mono"
                                >
                                  {regexRules.map(rule => (
                                    <option key={rule.id} value={rule.id}>
                                      Map to: {rule.intent}
                                    </option>
                                  ))}
                                  <option value="new">🆕 Create New Action / Response...</option>
                                </select>
                              </div>

                              {/* If "new" is selected, show intent & response fields */}
                              {feedbackSelectedRuleId === 'new' && (
                                <div className="space-y-2 p-1.5 bg-zinc-950/60 border border-zinc-900 rounded">
                                  <div className="space-y-1">
                                    <label className="text-[7px] font-mono text-zinc-500 uppercase block tracking-wider">
                                      New Intent Title:
                                    </label>
                                    <input
                                      type="text"
                                      value={feedbackNewIntent}
                                      onChange={(e) => setFeedbackNewIntent(e.target.value)}
                                      placeholder="e.g. Custom Joke"
                                      className="w-full bg-zinc-950 border border-zinc-900 rounded px-2 py-1 text-[9px] text-purple-300 focus:outline-none focus:border-purple-500"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[7px] font-mono text-zinc-500 uppercase block tracking-wider">
                                      Jester Response Template:
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={feedbackNewResponse}
                                      onChange={(e) => setFeedbackNewResponse(e.target.value)}
                                      placeholder="e.g. Hark! Let's schedule that! Time is: [TIME]"
                                      className="w-full bg-zinc-950 border border-zinc-900 rounded px-2 py-1 text-[9px] text-zinc-300 focus:outline-none resize-none focus:border-purple-500"
                                    />
                                    <span className="text-[6.5px] text-zinc-600">
                                      Tags: [TIME], [CLICKS], [RHYTHM], [JESTER_NAME]
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Apply feedback button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (!feedbackTrigger.trim()) return;
                                  
                                  const triggerWord = feedbackTrigger.trim();
                                  
                                  if (feedbackSelectedRuleId === 'new') {
                                    if (!feedbackNewIntent.trim() || !feedbackNewResponse.trim()) return;
                                    
                                    const newRuleId = 'user-' + Date.now();
                                    const newRule: RegexRule = {
                                      id: newRuleId,
                                      pattern: `\\b(${triggerWord.toLowerCase()})\\b`,
                                      response: feedbackNewResponse.trim(),
                                      intent: feedbackNewIntent.trim(),
                                      isActive: true,
                                      matchCount: 0
                                    };
                                    setRegexRules(prev => [newRule, ...prev]);

                                    // Intercept feedback on new rule creation
                                    learningRegexEngine.interceptFeedback(newRuleId, newRule.intent, 'positive', triggerWord);
                                    
                                    const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                                    setObservedEvents(prev => [
                                      {
                                        time: logTime,
                                        category: 'FEEDBACK-NEW',
                                        text: `Learned new intent [${newRule.intent}] with trigger: "${triggerWord}"`
                                      },
                                      ...prev
                                    ]);
                                  } else {
                                    setRegexRules(prev => prev.map(rule => {
                                      if (rule.id === feedbackSelectedRuleId) {
                                        const escapedTrigger = triggerWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                                        let updatedPattern = rule.pattern;
                                        
                                        if (rule.pattern.includes('\\b(')) {
                                          updatedPattern = rule.pattern.replace(/\\b\(([^)]+)\)\\b/, (match, group) => {
                                            const parts = group.split('|');
                                            if (!parts.includes(escapedTrigger)) {
                                              parts.push(escapedTrigger);
                                            }
                                            return `\\b(${parts.join('|')})\\b`;
                                          });
                                        } else {
                                          updatedPattern = `(${rule.pattern}|\\b(${escapedTrigger})\\b)`;
                                        }
                                        
                                        return { ...rule, pattern: updatedPattern };
                                      }
                                      return rule;
                                    }));
                                    
                                    const matchedRule = regexRules.find(r => r.id === feedbackSelectedRuleId);
                                    
                                    // Intercept feedback correction/tuning
                                    if (matchedRule) {
                                      learningRegexEngine.interceptFeedback(matchedRule.id, matchedRule.intent, 'correction', triggerWord);
                                    }

                                    const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                                    setObservedEvents(prev => [
                                      {
                                        time: logTime,
                                        category: 'FEEDBACK-ADAPT',
                                        text: `Expanded intent [${matchedRule?.intent}] trigger to include: "${triggerWord}"`
                                      },
                                      ...prev
                                    ]);
                                  }
                                  
                                  setFeedbackMsgId(null);
                                  
                                  const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                  const confirmMsg = `Verily! My matrix has been successfully updated. I have added "${triggerWord}" as a trigger! Next time thy sayest "${triggerWord}", I shall recognize thy intent and predict with pristine precision! 🃏⚡🎓`;
                                  setChatHistory(prev => [...prev, { 
                                    id: 'jester-confirm-' + Date.now(), 
                                    role: 'jester', 
                                    text: confirmMsg, 
                                    time: replyTime,
                                    matchedRuleId: null 
                                  }]);
                                  
                                  setSpeechBubble(confirmMsg);
                                  playSynthTone(783.99, 'sine', 0.15);
                                  setTimeout(() => playSynthTone(1046.5, 'sine', 0.2), 100);
                                }}
                                className="w-full py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-[9px] font-mono font-bold uppercase rounded transition cursor-pointer"
                              >
                                ⚡ Correct Matrix & Align Feedback
                              </button>
                            </div>
                          )}

                        </div>
                      ))}

                    </div>

                    {/* Input form */}
                    <form onSubmit={handleSendMessage} className="flex gap-1.5 mt-auto">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Talk to ${jesterName}...`}
                        className="flex-1 bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition font-sans"
                      />
                      <button
                        type="submit"
                        className="px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Panel footer */}
              <div className="p-2 bg-[#040409] border-t border-zinc-900 text-[8px] font-mono text-zinc-600 text-center uppercase tracking-widest">
                {jesterName} CHAT BOT ENGINE
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PANEL B: The Calibration & Stats Box ("The Box" - Metrics and Mirroring) */}
        <AnimatePresence>
          {isStatsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="w-[340px] h-[480px] bg-[#040408]/95 border-2 border-purple-500/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-3 bg-purple-950/20 border-b border-purple-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🃏</span>
                  <div>
                    <h4 className="text-xs font-sans font-black text-white tracking-widest uppercase">
                      Companion Calibration Box
                    </h4>
                    <p className="text-[9px] font-mono text-zinc-500 tracking-wider">Metrics, Observables & Mirror</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsStatsOpen(false)}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tabs Bar */}
              <div className="flex border-b border-zinc-900 bg-[#06060c] overflow-x-auto select-none no-scrollbar">
                <button
                  onClick={() => setActiveTab('watching')}
                  className={`flex-1 min-w-[56px] py-1.5 text-[8px] font-mono font-bold uppercase tracking-wider transition flex flex-col items-center justify-center gap-0.5 border-b-2 ${
                    activeTab === 'watching' 
                      ? 'border-purple-500 text-purple-400 bg-purple-950/10' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Eye className="w-3 h-3 text-purple-500" />
                  <span>Watch</span>
                </button>
                <button
                  onClick={() => setActiveTab('regex')}
                  className={`flex-1 min-w-[56px] py-1.5 text-[8px] font-mono font-bold uppercase tracking-wider transition flex flex-col items-center justify-center gap-0.5 border-b-2 ${
                    activeTab === 'regex' 
                      ? 'border-purple-500 text-purple-400 bg-purple-950/10' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Sliders className="w-3 h-3 text-purple-500" />
                  <span>Regex</span>
                </button>
                <button
                  onClick={() => setActiveTab('mirror')}
                  className={`flex-1 min-w-[56px] py-1.5 text-[8px] font-mono font-bold uppercase tracking-wider transition flex flex-col items-center justify-center gap-0.5 border-b-2 ${
                    activeTab === 'mirror' 
                      ? 'border-purple-500 text-purple-400 bg-purple-950/10' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="text-xs">🪞</span>
                  <span>Mirror</span>
                </button>
                <button
                  onClick={() => setActiveTab('brain')}
                  className={`flex-1 min-w-[56px] py-1.5 text-[8px] font-mono font-bold uppercase tracking-wider transition flex flex-col items-center justify-center gap-0.5 border-b-2 ${
                    activeTab === 'brain' 
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Brain className="w-3 h-3 text-emerald-500" />
                  <span>Brain</span>
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`flex-1 min-w-[56px] py-1.5 text-[8px] font-mono font-bold uppercase tracking-wider transition flex flex-col items-center justify-center gap-0.5 border-b-2 ${
                    activeTab === 'records' 
                      ? 'border-amber-500 text-amber-400 bg-amber-950/10' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <History className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>Scribe</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#020205]">
                {activeTab === 'watching' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* Persona Calibration Panel */}
                    <div className="bg-purple-950/20 border-2 border-purple-500/35 rounded-xl p-3.5 space-y-2 text-left relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-xs opacity-20">🃏</div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-400 animate-bounce" />
                        <h5 className="text-[10px] font-mono font-black text-purple-300 uppercase tracking-widest">
                          Persona Level {persona.level}: {persona.intensity}
                        </h5>
                      </div>
                      <p className="text-xs font-sans text-white font-bold leading-snug">
                        "{persona.title}"
                      </p>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                        {persona.description}
                      </p>
                      <div className="pt-2 flex items-center justify-between border-t border-purple-500/20">
                        <span className="text-[9px] font-mono text-purple-400">
                          Uniqueness: {persona.uniquenessScore} pts
                        </span>
                        <button
                          onClick={triggerWhisperManually}
                          className="flex items-center gap-1 px-2.5 py-1 bg-purple-700 hover:bg-purple-600 text-white font-mono text-[9px] font-bold uppercase rounded border border-purple-500/40 transition active:scale-95 shadow-[2px_2px_0_rgba(168,85,247,0.3)] hover:shadow-none cursor-pointer"
                        >
                          <Wand2 className="w-3 h-3" />
                          Seek Whisper
                        </button>
                      </div>
                    </div>

                    {/* Operational Day Curve Metrics */}
                    <div className="grid grid-cols-2 gap-2.5">
                      
                      <div className="bg-[#06060e] border border-zinc-900 rounded-lg p-2.5 text-left">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase">
                          <Activity className="w-3 h-3 text-red-500" />
                          Rhythm Flow
                        </div>
                        <div className="text-lg font-mono font-bold text-white mt-1">
                          {currentRhythm}%
                        </div>
                        <div className="text-[8px] text-emerald-400 font-mono mt-0.5">
                          SPECTRUM: OPTIMAL
                        </div>
                      </div>

                      <div className="bg-[#06060e] border border-zinc-900 rounded-lg p-2.5 text-left">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase">
                          <Palette className="w-3 h-3 text-purple-500" />
                          Color Scans
                        </div>
                        <div className="text-lg font-mono font-bold text-white mt-1">
                          {observationStats.colorScans}
                        </div>
                        <div className="text-[8px] text-purple-400 font-mono mt-0.5">
                          AESTHETIC OK
                        </div>
                      </div>

                      <div className="bg-[#06060e] border border-zinc-900 rounded-lg p-2.5 text-left">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          Keystrokes
                        </div>
                        <div className="text-lg font-mono font-bold text-white mt-1">
                          {profile?.jesterInteractionSignature?.keystrokesCount ?? observationStats.keystrokes}
                        </div>
                        <div className="text-[8px] text-zinc-500 font-mono mt-0.5">
                          FLOW VELOCITY
                        </div>
                      </div>

                      <div className="bg-[#06060e] border border-zinc-900 rounded-lg p-2.5 text-left">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase">
                          <Layers className="w-3 h-3 text-cyan-500" />
                          Views Audited
                        </div>
                        <div className="text-lg font-mono font-bold text-white mt-1">
                          {observationStats.viewsAudited}
                        </div>
                        <div className="text-[8px] text-cyan-400 font-mono mt-0.5">
                          SYSTEM INDEXED
                        </div>
                      </div>

                    </div>

                    {/* Realtime Observed Log Grid */}
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                        Live Observational Event Shards
                      </span>
                      <div className="bg-[#040409] border border-zinc-900 rounded-lg max-h-[140px] overflow-y-auto divide-y divide-zinc-900/60 p-2 font-mono text-[9px] space-y-1.5 custom-scrollbar">
                        {observedEvents.map((evt, idx) => (
                          <div key={idx} className="pt-1.5 pb-1 flex items-start gap-1.5 leading-normal">
                            <span className="text-zinc-600 select-none">[{evt.time}]</span>
                            <span className="text-purple-400 uppercase font-bold">[{evt.category}]</span>
                            <span className="text-zinc-300 flex-1">{evt.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === 'regex' && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-left">
                    {/* Brief description of regex guess list */}
                    <div className="p-2.5 bg-purple-950/20 border border-purple-500/30 rounded-xl">
                      <p className="text-[10px] text-purple-300 leading-normal">
                        <strong>Learning Regex Engine:</strong> The chatbot utilizes a weighted predictive engine to resolve matches. Unlike sequential tables, patterns are weighted dynamically based on user feedback. Click Thumbs Up/Down on any response to adjust weights and shape future responses!
                      </p>
                    </div>

                    {/* Rules list scroll window */}
                    <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                      {regexRules.map((rule) => {
                        const isLastMatched = lastMatchedRule?.id === rule.id;
                        return (
                          <div 
                            key={rule.id} 
                            className={`p-2.5 rounded-xl border transition ${
                              isLastMatched 
                                ? 'bg-purple-950/30 border-yellow-400/80 shadow-[0_0_10px_rgba(250,204,21,0.15)]' 
                                : 'bg-[#06060e] border-zinc-900 hover:border-zinc-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-zinc-200">{rule.intent}</span>
                                {isLastMatched && (
                                  <span className="text-[8px] bg-yellow-400/10 text-yellow-400 px-1 py-[1px] rounded font-mono font-bold uppercase animate-pulse">
                                    Last Match
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-zinc-500">
                                  Matches: {rule.matchCount}
                                </span>
                                
                                <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1 rounded flex items-center gap-0.5" title="Learned dynamic weighting">
                                  <TrendingUp className="w-2.5 h-2.5" />
                                  w: {learningRegexEngine.getWeight(rule.id).toFixed(1)}
                                </span>
                                
                                {/* Toggle Active Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRegexRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r));
                                    playSynthTone(600, 'sine', 0.08);
                                  }}
                                  className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer duration-200 ${
                                    rule.isActive ? 'bg-purple-600' : 'bg-zinc-850'
                                  }`}
                                >
                                  <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${
                                    rule.isActive ? 'translate-x-3' : 'translate-x-0'
                                  }`} />
                                </button>

                                {/* Delete Custom Rule Button (Only for user added rules) */}
                                {rule.id.startsWith('user-') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRegexRules(prev => prev.filter(r => r.id !== rule.id));
                                      playSynthTone(300, 'triangle', 0.15);
                                    }}
                                    className="text-red-400 hover:text-red-300 text-[10px] font-bold px-1 rounded cursor-pointer"
                                    title="Delete rule"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {/* Regex pattern */}
                            <div className="text-[9px] font-mono bg-black/60 text-emerald-400 px-2 py-0.5 rounded border border-zinc-900 mb-1 flex items-center justify-between">
                              <span className="truncate">/{rule.pattern}/i</span>
                              <span className="text-[8px] text-zinc-600 uppercase font-bold shrink-0">Regex</span>
                            </div>

                            {/* Response preview */}
                            <p className="text-[9px] text-zinc-400 leading-snug line-clamp-2 select-text" title={rule.response}>
                              {rule.response}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add custom regex rule form */}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!newPattern.trim() || !newResponse.trim() || !newIntent.trim()) {
                        setRegexError("All fields must be filled!");
                        return;
                      }
                      try {
                        new RegExp(newPattern, 'i');
                        setRegexError(null);
                      } catch (err: any) {
                        setRegexError(`Invalid regex syntax: ${err.message}`);
                        return;
                      }

                      const rule: RegexRule = {
                        id: 'user-' + Date.now(),
                        pattern: newPattern.trim(),
                        response: newResponse.trim(),
                        intent: newIntent.trim(),
                        isActive: true,
                        matchCount: 0
                      };

                      setRegexRules(prev => [...prev, rule]);
                      setNewPattern('');
                      setNewResponse('');
                      setNewIntent('');
                      playSynthTone(523.25, 'triangle', 0.15);

                      const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                      setObservedEvents(prev => [
                        {
                          time: logTime,
                          category: 'REGEX-ADD',
                          text: `Added new guess rule [${rule.intent}] for /${rule.pattern}/i`
                        },
                        ...prev
                      ]);
                    }} className="bg-zinc-950 border border-purple-950/60 rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-purple-950 pb-1.5">
                        <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                          Inject Custom Guess Rule
                        </span>
                        <span className="text-[8px] text-zinc-600">SAFE-LESS BUILD</span>
                      </div>

                      {/* Intent input */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Intended Guess Name</label>
                        <input
                          type="text"
                          required
                          value={newIntent}
                          onChange={(e) => setNewIntent(e.target.value)}
                          placeholder="e.g. Secret Code, Easter Egg"
                          className="w-full bg-[#040409] border border-purple-900/40 rounded-lg px-2.5 py-1 text-xs text-purple-300 font-mono focus:outline-none focus:border-yellow-400 transition"
                        />
                      </div>

                      {/* Pattern input */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">RegExp Pattern String</label>
                        <input
                          type="text"
                          required
                          value={newPattern}
                          onChange={(e) => {
                            setNewPattern(e.target.value);
                            setRegexError(null);
                          }}
                          placeholder="e.g. \\b(secret|code|puzzle)\\b"
                          className="w-full bg-[#040409] border border-purple-900/40 rounded-lg px-2.5 py-1 text-xs text-purple-300 font-mono focus:outline-none focus:border-yellow-400 transition"
                        />
                      </div>

                      {/* Response template */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Response Template</label>
                        <textarea
                          required
                          rows={2}
                          value={newResponse}
                          onChange={(e) => setNewResponse(e.target.value)}
                          placeholder="e.g. You clicked [CLICKS] times, and the rhythm is [RHYTHM]!"
                          className="w-full bg-[#040409] border border-purple-900/40 rounded-lg px-2.5 py-1 text-xs text-purple-300 focus:outline-none focus:border-yellow-400 transition resize-none font-sans"
                        />
                        <span className="text-[7px] text-zinc-500 leading-none">
                          Tags: [RHYTHM], [CLICKS], [KEYSTROKES], [VIEWS], [JESTER_NAME], [TIME]
                        </span>
                      </div>

                      {regexError && (
                        <div className="text-[9px] font-mono text-red-400 bg-red-950/20 border border-red-900/40 p-1.5 rounded">
                          ✕ {regexError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-mono font-bold uppercase rounded-lg transition active:scale-95 shadow-[2px_2px_0_rgba(168,85,247,0.3)] hover:shadow-none cursor-pointer"
                      >
                        ⚡ Inject Dynamic Guess Rule ⚡
                      </button>
                    </form>

                    {/* Dynamic Weight Learning History */}
                    {learningRegexEngine.getFeedbackHistory().length > 0 && (
                      <div className="space-y-1.5 text-left pt-2 border-t border-purple-900/30">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1 font-bold">
                          <History className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          Dynamic Weight refinement logs
                        </span>
                        <div className="bg-[#030307] border border-purple-950/40 rounded-lg p-2 font-mono text-[8px] space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
                          {learningRegexEngine.getFeedbackHistory().map((sig, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-1 border-b border-zinc-900/40 pb-1 last:border-0 leading-normal">
                              <div>
                                <span className="text-zinc-600 select-none">[{sig.timestamp}]</span>{" "}
                                <span className="text-yellow-400 font-bold">[{sig.intent}]</span>{" "}
                                <span className="text-zinc-500">refined:</span>{" "}
                                <span className="text-purple-300">"{sig.triggerWord || 'feedback'}"</span>
                              </div>
                              <span className={`font-bold shrink-0 ${sig.type === 'positive' ? 'text-emerald-400' : sig.type === 'negative' ? 'text-red-400' : 'text-cyan-400'}`}>
                                {sig.weightBefore.toFixed(1)} → {sig.weightAfter.toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'mirror' && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-left">
                    
                    {/* The Mirror Itself */}
                    <div className="relative mx-auto w-32 h-44 rounded-full bg-gradient-to-br from-[#0b0a1d] via-[#1a1236] to-[#05050f] border-4 border-yellow-400/80 shadow-[0_0_25px_rgba(250,204,21,0.3)] flex flex-col items-center justify-center overflow-hidden">
                      
                      {/* Mirror reflections / sparkles */}
                      <AnimatePresence>
                        {isPolishing && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1.2 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-yellow-400/10 pointer-events-none flex items-center justify-center z-20"
                          >
                            <Sparkles className="w-12 h-12 text-yellow-400 animate-spin" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Abstract reflection overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none transform -skew-x-12" />

                      {/* Larger Interactive Reflection Face */}
                      <motion.div 
                        className="relative z-10 flex flex-col items-center gap-1.5"
                        animate={isPolishing ? { rotate: [0, -10, 10, 0] } : {}}
                      >
                        <span className="text-3xl animate-pulse select-none filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">🃏</span>
                        
                        {/* Interactive face status */}
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <div className="flex gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_6px_#facc15]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_6px_#facc15]" />
                          </div>
                          <svg width="22" height="10" viewBox="0 0 14 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1C3 4.5 11 4.5 13 1" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        </div>

                        {/* Floating mini-bells */}
                        <span className="text-[10px] animate-bounce text-yellow-400">🔔</span>
                      </motion.div>

                      {/* Bottom reflection aura glow */}
                      <div className="absolute bottom-2 text-[8px] font-mono text-yellow-300/80 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full border border-yellow-400/20">
                        REFLECTED
                      </div>
                    </div>

                    {/* Rename Box */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-2">
                      <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                        Alter Thy Companion's Moniker
                      </span>
                      <input
                        type="text"
                        maxLength={20}
                        value={jesterName}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (onUpdateProfile) {
                            const existing = profile?.jesterInteractionSignature || {
                              rhythmHistory: [],
                              keystrokesCount: 0,
                              clicksCount: 0,
                              lastActiveView: currentView,
                              accumulatedPersonaScore: 10,
                              whisperCount: 0,
                              timestamp: new Date().toISOString()
                            };
                            onUpdateProfile({
                              jesterInteractionSignature: {
                                ...existing,
                                jesterName: val || 'Jester-Miri',
                                timestamp: new Date().toISOString()
                              }
                            });
                          }
                        }}
                        className="w-full bg-[#040409] border border-purple-900/40 rounded-lg px-3 py-1.5 text-xs text-purple-300 font-mono focus:outline-none focus:border-yellow-400 transition animate-none"
                        placeholder="Enter new Jester name..."
                      />
                    </div>

                    {/* Polish Mirror Button & Details */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsPolishing(true);
                          playSynthTone(587.33, 'sine', 0.1);
                          setTimeout(() => playSynthTone(880, 'sine', 0.2), 100);
                          setTimeout(() => setIsPolishing(false), 1200);
                        }}
                        disabled={isPolishing}
                        className="flex-1 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 hover:border-yellow-400 text-yellow-400 text-[9px] font-mono font-bold uppercase rounded-lg transition-all active:scale-[0.98] cursor-pointer text-center"
                      >
                        {isPolishing ? '✨ POLISHING... ✨' : '🪞 POLISH THE GLASS'}
                      </button>
                    </div>

                    {/* Self Reflection Summary Card */}
                    <div className="bg-[#05050b] border border-purple-950/60 rounded-xl p-3 text-[10px] space-y-1.5 leading-relaxed font-sans text-purple-300/90">
                      <div className="font-mono text-[9px] text-yellow-400 font-bold uppercase tracking-wider border-b border-purple-950/40 pb-1 mb-1">
                        Aetheric Aura Matrix
                      </div>
                      <p>
                        <strong>Current Vessel:</strong> <span className="text-white select-all">{jesterName}</span>
                      </p>
                      <p>
                        <strong>Observational Status:</strong> Active and gazing back with endless warmth and positivity.
                      </p>
                      <p>
                        <strong>Self-Recoding Matrix:</strong> Ready! Type <span className="text-yellow-400 font-mono">"fix"</span> or <span className="text-yellow-400 font-mono">"recode"</span> in the chat companion to trigger an automated optimization hot-patch.
                      </p>
                    </div>

                  </div>
                )}

                {activeTab === 'brain' && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-left">
                    
                    {/* Knowledge base header & Search */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                          AetherOS System Knowledge
                        </span>
                        <span className="text-[7px] font-mono text-zinc-500 uppercase">
                          {aetherOSComponents.length} subsystems loaded
                        </span>
                      </div>
                      
                      <div className="relative">
                        <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Search files & keywords..."
                          value={brainSearch}
                          onChange={(e) => setBrainSearch(e.target.value)}
                          className="w-full bg-[#040409] border border-purple-900/40 rounded-lg pl-7 pr-2.5 py-1.5 text-[10px] text-emerald-300 focus:outline-none focus:border-emerald-500 transition font-mono"
                        />
                      </div>
                    </div>

                    {/* Components selector grid */}
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                        Select Subsystem to Teach
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1 border border-zinc-900/50 p-1.5 rounded-xl bg-[#040409]">
                        {filteredComponents.map((comp) => {
                          const isSelected = comp.id === selectedComponentId;
                          const factsCount = (taughtFacts[comp.id] || []).length;
                          return (
                            <button
                              key={comp.id}
                              onClick={() => {
                                setSelectedComponentId(comp.id);
                                playSynthTone(783.99, 'sine', 0.08);
                              }}
                              className={`p-1.5 rounded-lg border text-left transition relative overflow-hidden flex flex-col justify-between ${
                                isSelected 
                                  ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
                                  : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:text-zinc-400'
                              }`}
                            >
                              <div className="font-mono text-[8px] font-bold truncate leading-tight">
                                {comp.name}
                              </div>
                              <div className="flex items-center justify-between mt-1 text-[7px] font-mono opacity-80">
                                <span className="truncate max-w-[70%]">{comp.category}</span>
                                <span className={`px-1 rounded-full ${factsCount > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900 text-zinc-500'}`}>
                                  {factsCount}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detail & teach fact container */}
                    {(() => {
                      const selectedComp = aetherOSComponents.find(c => c.id === selectedComponentId);
                      if (!selectedComp) return null;
                      const facts = taughtFacts[selectedComp.id] || [];
                      return (
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-2.5 text-left">
                          <div>
                            <div className="flex items-center justify-between border-b border-zinc-900 pb-1 mb-1">
                              <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                {selectedComp.name}
                              </span>
                              <span className="text-[7px] font-mono text-zinc-500 max-w-[120px] truncate" title={selectedComp.filePath}>
                                {selectedComp.filePath}
                              </span>
                            </div>
                            <p className="text-[9px] text-zinc-400 leading-relaxed font-sans">
                              {selectedComp.description}
                            </p>
                          </div>

                          {/* Taught facts list */}
                          <div className="space-y-1.5">
                            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                              System Knowledge Base ({facts.length})
                            </span>
                            {facts.length === 0 ? (
                              <p className="text-[8px] font-mono text-zinc-600 italic">
                                No custom parameters taught yet. Add one below!
                              </p>
                            ) : (
                              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                {facts.map((fact, index) => (
                                  <div key={index} className="flex items-start justify-between gap-1.5 bg-emerald-950/10 border border-emerald-950/40 rounded-lg p-1.5 text-[8px] font-mono text-emerald-300">
                                    <span className="flex-1 leading-snug">⚡ {fact}</span>
                                    <button
                                      onClick={() => {
                                        setTaughtFacts(prev => {
                                          const updated = { ...prev };
                                          updated[selectedComp.id] = updated[selectedComp.id].filter((_, i) => i !== index);
                                          return updated;
                                        });
                                        playSynthTone(329.63, 'sine', 0.1);
                                      }}
                                      className="text-red-400 hover:text-red-300 transition-colors p-0.5 cursor-pointer"
                                      title="Unteach parameter"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Add new fact form */}
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!newFactInput.trim()) return;
                              setTaughtFacts(prev => {
                                const current = prev[selectedComp.id] || [];
                                return {
                                  ...prev,
                                  [selectedComp.id]: [...current, newFactInput.trim()]
                                };
                              });
                              
                              // Add a live log of this learning!
                              const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                              setObservedEvents(prev => [
                                {
                                  time: logTime,
                                  category: 'NEURAL-LEARN',
                                  text: `Taught companion rule: [${selectedComp.name}] -> "${newFactInput.trim()}"`
                                },
                                ...prev
                              ].slice(0, 40));
                              
                              setNewFactInput('');
                              playSynthTone(523.25, 'sine', 0.08);
                              setTimeout(() => playSynthTone(659.25, 'sine', 0.08), 80);
                              setTimeout(() => playSynthTone(783.99, 'sine', 0.12), 160);
                            }}
                            className="flex gap-1.5 pt-1.5 border-t border-zinc-900/60"
                          >
                            <input
                              type="text"
                              value={newFactInput}
                              onChange={(e) => setNewFactInput(e.target.value)}
                              placeholder={`Teach ${jesterName} about this...`}
                              className="flex-1 bg-[#040409] border border-purple-900/30 rounded-lg px-2 py-1 text-[9px] text-purple-300 focus:outline-none focus:border-emerald-500 transition font-sans"
                            />
                            <button
                              type="submit"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[9px] uppercase rounded-lg transition active:scale-95 flex items-center gap-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              Teach
                            </button>
                          </form>
                        </div>
                      );
                    })()}

                    {/* Algorithmic Discernment Tester */}
                    <div className="bg-[#05050b] border border-emerald-950/40 rounded-xl p-3 space-y-2 text-left">
                      <div className="font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-wider border-b border-emerald-950/30 pb-1 flex items-center justify-between">
                        <span>Self-Discerning System Tester</span>
                        <span className="text-[7px] text-zinc-500 lowercase font-normal">tests mapping weights</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[7px] font-mono text-zinc-400 leading-relaxed block">
                          Type any custom sentence below to see how the algorithm parses keywords and map coordinates dynamically.
                        </span>
                        <textarea
                          rows={2}
                          value={testDiscernInput}
                          onChange={(e) => setTestDiscernInput(e.target.value)}
                          placeholder="e.g. Help me check the active reliability network and fix the database cluster nodes"
                          className="w-full bg-[#040409] border border-emerald-900/30 rounded-lg px-2.5 py-1 text-[9px] text-emerald-300 focus:outline-none focus:border-emerald-500 transition resize-none font-sans"
                        />
                      </div>

                      {/* Live tester results */}
                      {testDiscernInput.trim() && (
                        <div className="space-y-1 pt-1 border-t border-zinc-900/60">
                          <span className="text-[7px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                            Live Confidence Score Breakdown
                          </span>
                          {testDiscernResults.length === 0 ? (
                            <div className="text-[8px] font-mono text-red-400/80 italic">
                              ✕ No component mappings found. Try keywords like "reliability", "shield", "matrix", "search", "store" etc.
                            </div>
                          ) : (
                            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                              {testDiscernResults.slice(0, 3).map((r, i) => (
                                <div key={i} className="bg-[#0b0c16] border border-emerald-950/60 rounded-lg p-1.5 flex flex-col gap-0.5">
                                  <div className="flex items-center justify-between text-[8px] font-mono">
                                    <span className="text-emerald-300 font-bold">🎯 {r.component.name}</span>
                                    <span className="text-yellow-400 font-bold">{r.confidence}% match</span>
                                  </div>
                                  <div className="text-[7px] font-mono text-zinc-500 leading-snug">
                                    Reason: {r.reason}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {activeTab === 'records' && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-left">
                    
                    {/* Header */}
                    <div className="bg-amber-950/10 border-2 border-amber-500/35 rounded-xl p-3 space-y-1 relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-xs opacity-25">📜</div>
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-amber-400 animate-pulse" />
                        <h5 className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-widest">
                          Scribal Records & Chronicle
                        </h5>
                      </div>
                      <p className="text-xs font-sans text-white font-bold leading-snug">
                        "{jesterName}'s Chronicle of Miracles"
                      </p>
                      <p className="text-[9px] text-zinc-400 leading-relaxed font-sans">
                        Here lies the ledger of milestones, clicks, keystrokes, and system observations. Scribes must have tools and training to write!
                      </p>
                    </div>

                    {/* Stage A: Pencil & Paper Not Given */}
                    {!hasPencilAndPaper && (
                      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-center space-y-3.5">
                        <div className="text-3xl animate-bounce">✏️📄👐</div>
                        <h6 className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">
                          Pencil & Paper Required
                        </h6>
                        <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                          "Hark! I would gladly record thy glorious breakthroughs and compile the ultimate chronicle of AetherOS, but my hands are bare! I possess neither graphite nor parchment!"
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setHasPencilAndPaper(true);
                            const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                            setChronicleLogs(prev => [
                              {
                                id: 'log-' + Date.now(),
                                timestamp: nowStr,
                                type: 'system',
                                message: '🎁 Pencil and Paper gifted by the Operator.'
                              },
                              ...prev
                            ]);
                            playSynthTone(783.99, 'sine', 0.1);
                            setTimeout(() => playSynthTone(1046.50, 'sine', 0.25), 80);
                            logAndTriggerWhisper(`Huzzah! A splendid golden pencil ✏️ and a crisp roll of high-grade parchment 📄! Now, tell me to learn record-keeping, and I shall chronicle our legendary journey!`);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-mono text-[9px] font-black uppercase rounded-lg border border-yellow-400/30 transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-1 cursor-pointer"
                        >
                          🎁 Give Pencil & Paper
                        </button>
                      </div>
                    )}

                    {/* Stage B: Pencil & Paper Given, but Record Keeping not learned */}
                    {hasPencilAndPaper && !learnedRecordKeeping && (
                      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-center space-y-3.5">
                        <div className="text-3xl">✏️📄🎓</div>
                        <h6 className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">
                          Scribe Tools Received!
                        </h6>
                        <p className="text-[10px] text-zinc-350 font-sans leading-relaxed font-bold">
                          "I now hold the graphite of truth and the parchment of wisdom! Teach me the sacred formulas of record-keeping so we may begin!"
                        </p>
                        
                        {isLearningRecordKeeping ? (
                          <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-[8px] font-mono text-amber-400">
                              <span>STUDYING ANCIENT SCROLLS...</span>
                              <span>{learningProgress}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                                animate={{ width: `${learningProgress}%` }}
                                transition={{ duration: 0.1 }}
                              />
                            </div>
                            <p className="text-[8px] font-mono text-zinc-500 italic animate-pulse text-center">
                              Sharpening lead, organizing sheets, practicing handwriting...
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsLearningRecordKeeping(true);
                              setLearningProgress(10);
                              playSynthTone(349.23, 'triangle', 0.2);
                              
                              setTimeout(() => setLearningProgress(45), 400);
                              setTimeout(() => setLearningProgress(80), 900);
                              setTimeout(() => {
                                setLearningProgress(100);
                                setLearnedRecordKeeping(true);
                                setIsLearningRecordKeeping(false);
                                playSynthTone(1046.50, 'sine', 0.3);
                                const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                                setChronicleLogs(prev => [
                                  {
                                    id: 'log-learn-' + Date.now(),
                                    timestamp: nowStr,
                                    type: 'system',
                                    message: '🎓 Completed scribal apprenticeship. Certified as Master Scribe.'
                                  },
                                  ...prev
                                ]);
                                logAndTriggerWhisper(`Hearken! 📜 By the ink of the digital sky, I am now a Certified Scribe! Let us write miracles!`);
                              }, 1500);
                            }}
                            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black font-mono text-[9px] font-black uppercase rounded-lg border border-emerald-400/30 transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-1 cursor-pointer"
                          >
                            🎓 Tell Miri to Learn Record-Keeping
                          </button>
                        )}
                      </div>
                    )}

                    {/* Stage C: Fully Unlocked & Learned Record Keeping */}
                    {hasPencilAndPaper && learnedRecordKeeping && (
                      <div className="space-y-3 animate-in zoom-in-95 duration-350">
                        
                        {/* Acoustic Resonance Mitigator Banner */}
                        {isAcousticWarningOpen && (
                          <div className="bg-rose-950/25 border-2 border-rose-500/40 rounded-xl p-3 space-y-2 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">🚨</span>
                              <h6 className="text-[9px] font-mono font-black text-rose-400 uppercase tracking-widest">
                                RESONANCE OVERLOAD WARNING
                              </h6>
                            </div>
                            <p className="text-[10px] text-zinc-300 font-sans leading-relaxed">
                              Acoustic Coupling is critical at <span className="text-rose-400 font-bold">{acousticPressure} dB SPL</span>. The system cognitive bridge is vibrating dangerously!
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                window.dispatchEvent(new CustomEvent('aetheros_clear_acoustic_pressure'));
                                playSynthTone(523.25, 'sine', 0.15);
                                setTimeout(() => playSynthTone(659.25, 'sine', 0.15), 100);
                                setTimeout(() => playSynthTone(783.99, 'sine', 0.3), 200);
                                
                                const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                                setChronicleLogs(prev => [
                                  {
                                    id: 'log-remediate-' + Date.now(),
                                    timestamp: timeStr,
                                    type: 'system' as const,
                                    message: `⚡ Remediation executed: Grounded acoustic feedback loop with pencil & parchment.`
                                  },
                                  ...prev
                                ]);
                                logAndTriggerWhisper(`Excellent! I have used my scribe tools to record and ground the rogue frequencies. The resonance buffer is now purged and completely calm! 🍃`);
                              }}
                              className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[9px] font-bold uppercase rounded-lg border border-rose-400/30 transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              ✏️ Ground Frequencies (Scribal Remediation)
                            </button>
                          </div>
                        )}

                        {/* Custom Record Form */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const inputElem = e.currentTarget.elements.namedItem('chronicleInput') as HTMLInputElement;
                            if (!inputElem || !inputElem.value.trim()) return;
                            const text = inputElem.value.trim();
                            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                            
                            setChronicleLogs(prev => [
                              {
                                id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                                timestamp: timeStr,
                                type: 'user',
                                message: text
                              },
                              ...prev
                            ]);
                            inputElem.value = '';
                            playSynthTone(587.33, 'triangle', 0.1);
                            setTimeout(() => playSynthTone(783.99, 'triangle', 0.15), 60);
                            logAndTriggerWhisper(`Verily! I have recorded your milestone: "${text}" ✏️📜`);
                          }}
                          className="flex gap-1.5"
                        >
                          <input
                            type="text"
                            name="chronicleInput"
                            placeholder="Add custom milestone or event log..."
                            className="flex-1 bg-[#040409] border border-amber-900/40 rounded-lg px-2 py-1 text-[9px] text-amber-200 placeholder-amber-900 focus:outline-none focus:border-amber-500 transition font-sans"
                          />
                          <button
                            type="submit"
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-black font-mono font-bold text-[9px] uppercase rounded-lg transition active:scale-95 flex items-center gap-0.5 cursor-pointer"
                          >
                            ✏️ Write
                          </button>
                        </form>

                        {/* Chronicle Logs Feed */}
                        <div className="bg-black/80 border border-amber-950/40 rounded-xl p-2.5 space-y-2">
                          <div className="flex justify-between items-center text-[8px] font-mono text-amber-500/80 uppercase tracking-widest pb-1 border-b border-amber-950/30">
                            <span>📜 Recorded Chronicle Logs</span>
                            <span>{chronicleLogs.length} items</span>
                          </div>

                          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                            {chronicleLogs.length === 0 ? (
                              <p className="text-[8px] font-mono text-zinc-600 italic text-center py-4">
                                The parchment is clean. Record a milestone above!
                              </p>
                            ) : (
                              chronicleLogs.map((log) => (
                                <div 
                                  key={log.id} 
                                  className="group/item flex items-start justify-between gap-1.5 bg-amber-950/5 border border-amber-900/10 hover:border-amber-500/25 rounded-md p-1.5 text-[8px] font-mono text-amber-200 transition-colors"
                                >
                                  <div className="flex-1 leading-normal">
                                    <span className="text-zinc-500 select-none mr-1 font-bold">[{log.timestamp}]</span>
                                    <span className="leading-relaxed select-text">{log.message}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setChronicleLogs(prev => prev.filter(l => l.id !== log.id));
                                      playSynthTone(329.63, 'sine', 0.1);
                                    }}
                                    className="opacity-0 group-hover/item:opacity-100 text-red-400 hover:text-red-300 transition-all p-0.5 cursor-pointer"
                                    title="Erase log"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="pt-1.5 border-t border-amber-950/30 flex justify-between items-center text-[7px] font-mono text-zinc-500 uppercase">
                            <span>Scribe: {jesterName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Dost thou wish to erase the entire parchment?")) {
                                  setChronicleLogs([]);
                                  playSynthTone(220, 'sine', 0.3);
                                }
                              }}
                              className="hover:text-red-400 transition-colors cursor-pointer"
                            >
                              Clear Parchment
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* Panel footer */}
              <div className="p-2 bg-[#040409] border-t border-zinc-900 text-[8px] font-mono text-zinc-600 text-center uppercase tracking-widest">
                AetherOS Miracle Companion Core | System Stable
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 3. Bouncy, Gorgeous Floating Companion Head / Avatar (Bells, Sparks, Shimmering Glow) */}
      <motion.button
        id="jester-companion-avatar-trigger"
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          playSynthTone(isChatOpen ? 440 : 880, 'sine', 0.15); // toggle bell sound
          if (!isChatOpen && !speechBubble) {
            triggerMiraculousObservation(currentView);
          }
        }}
        whileHover={{ scale: 1.15, rotate: [0, -5, 5, -5, 0] }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -6, 0],
          transition: {
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="pointer-events-auto relative group flex items-center justify-center"
      >
        {/* Shimmering pulse outer rings */}
        <div className="absolute inset-0 rounded-full bg-purple-500/25 blur-md group-hover:bg-pink-500/40 transition-all duration-300 animate-pulse" />
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 opacity-60 group-hover:opacity-100 blur-sm animate-spin duration-1000" style={{ animationDuration: '6s' }} />

        {/* The beautiful Jesticular head avatar itself */}
        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#090915] via-[#120f26] to-[#04040a] border-2 border-purple-500 flex items-center justify-center overflow-hidden shadow-2xl">
          
          {/* Subtle smiling jester silhouette or face bells */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40 font-black text-xs select-none">
            🃏
          </div>
          
          {/* Smiling glowing jester face */}
          <div className="flex flex-col items-center justify-center gap-0.5 relative z-10">
            {/* Eye nodes */}
            <div className="flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_4px_cyan]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_4px_cyan]" />
            </div>
            {/* Smiling lips curve */}
            <svg width="14" height="6" viewBox="0 0 14 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1C3 4.5 11 4.5 13 1" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Golden Bell accents */}
          <div className="absolute top-1 left-3 text-[7px] animate-bounce" style={{ animationDelay: '0.2s' }}>🔔</div>
          <div className="absolute top-1 right-3 text-[7px] animate-bounce" style={{ animationDelay: '0.5s' }}>🔔</div>
        </div>

        {/* Interactive hover tooltip helper */}
        <span className="absolute right-14 bg-[#07070f] border border-purple-500/30 text-[9px] font-mono font-bold uppercase tracking-widest text-purple-300 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-xl">
          {jesterName} Companion
        </span>

      </motion.button>

    </div>
  );
};
