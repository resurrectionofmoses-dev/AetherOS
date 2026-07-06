import { useState, useEffect, useRef } from 'react';
import type { SystemStatus, UserProfile } from '../types';
import type { JesterPersonaState } from './JesterCompanionTypes';
import { sonicLedger } from '../services/sonicLedger';

interface JesterWhisperProps {
  profile: UserProfile | undefined;
  onUpdateProfile: ((updates: any) => void) | undefined;
  currentView: string;
  systemStatus: SystemStatus;
  onWhisper: (whisper: string) => void;
}

export function useJesterWhisper({
  profile,
  onUpdateProfile,
  currentView,
  systemStatus,
  onWhisper
}: JesterWhisperProps) {
  const [currentRhythm, setCurrentRhythm] = useState(98.4);
  const pulseTimestamps = useRef<number[]>([]);
  const lastWhisperTime = useRef<number>(0);
  const previousStatus = useRef<SystemStatus>({ ...systemStatus });
  const localKeystrokes = useRef<number>(0);
  const localClicks = useRef<number>(0);

  // Calculates current persona tier/state based on profile score
  const personaState = (): JesterPersonaState => {
    const signature = profile?.jesterInteractionSignature;
    const score = signature?.accumulatedPersonaScore ?? 10;
    
    if (score > 150) {
      return {
        level: 4,
        title: "Grand Arch-Jester of the Sidereal Court",
        intensity: "Spectacular",
        description: "Unleashing the ultimate cascade of miraculous encouragement and golden smiles!",
        uniquenessScore: score
      };
    } else if (score > 80) {
      return {
        level: 3,
        title: "Sovereign Shard Magician",
        intensity: "Theatrical",
        description: "Transforming dry compile routines into high-theatrics musical ensembles!",
        uniquenessScore: score
      };
    } else if (score > 35) {
      return {
        level: 2,
        title: "Interactive Whimsical Jester",
        intensity: "Playful",
        description: "Injecting witty remarks and tracking thy keystroke tempos with extreme care.",
        uniquenessScore: score
      };
    }
    return {
      level: 1,
      title: "Silent Observer Apprentice",
      intensity: "Soft",
      description: "Quietly watching every click and color scan to establish thy personal learning curve.",
      uniquenessScore: score
    };
  };

  const updateProfileSignature = (keystrokesDelta: number, clicksDelta: number, rhythm: number, scoreIncrement: number) => {
    if (!profile || !onUpdateProfile) return;

    const existing = profile.jesterInteractionSignature || {
      rhythmHistory: [],
      keystrokesCount: 0,
      clicksCount: 0,
      lastActiveView: currentView,
      accumulatedPersonaScore: 10,
      whisperCount: 0,
      timestamp: new Date().toISOString()
    };

    const nextRhythmHistory = [...(existing.rhythmHistory || []), rhythm].slice(-15);
    const nextKeystrokes = (existing.keystrokesCount || 0) + keystrokesDelta;
    const nextClicks = (existing.clicksCount || 0) + clicksDelta;
    const nextScore = Math.min(300, (existing.accumulatedPersonaScore || 10) + scoreIncrement);

    onUpdateProfile({
      jesterInteractionSignature: {
        ...existing,
        rhythmHistory: nextRhythmHistory,
        keystrokesCount: nextKeystrokes,
        clicksCount: nextClicks,
        lastActiveView: currentView,
        accumulatedPersonaScore: nextScore,
        whisperCount: existing.whisperCount + (scoreIncrement > 5 ? 1 : 0),
        timestamp: new Date().toISOString()
      }
    });
  };

  // 'jestical-whisper-feedback' function: logs how often users trigger the full log via the TopNavBar
  const jesticalWhisperFeedback = () => {
    if (!profile || !onUpdateProfile) return;
    const existing = profile.jesterInteractionSignature || {
      rhythmHistory: [],
      keystrokesCount: 0,
      clicksCount: 0,
      lastActiveView: currentView,
      accumulatedPersonaScore: 10,
      whisperCount: 0,
      timestamp: new Date().toISOString()
    };
    const currentCount = existing.logOpenCount || 0;
    onUpdateProfile({
      jesterInteractionSignature: {
        ...existing,
        logOpenCount: currentCount + 1,
        timestamp: new Date().toISOString()
      }
    });
  };

  // Event listener to trigger 'jestical-whisper-feedback' when the full log is opened in the navbar
  useEffect(() => {
    const handleLogOpened = () => {
      jesticalWhisperFeedback();
    };
    window.addEventListener('aetheros_jester_log_opened', handleLogOpened);
    return () => {
      window.removeEventListener('aetheros_jester_log_opened', handleLogOpened);
    };
  }, [profile, onUpdateProfile, currentView]);

  // Subscribe to sonicLedger events
  useEffect(() => {
    const unsubscribe = sonicLedger.subscribe((pulse) => {
      const now = Date.now();
      pulseTimestamps.current.push(now);
      pulseTimestamps.current = pulseTimestamps.current.filter(ts => now - ts < 12000); // 12 seconds rolling window

      // Increment counters locally
      const isKey = pulse.label.startsWith('NOTE_') || pulse.label.includes('KEY');
      if (isKey) {
        localKeystrokes.current += 1;
      } else {
        localClicks.current += 1;
      }

      // Calculate APM
      const apm = pulseTimestamps.current.length * 5;
      const mappedRhythm = Math.min(130, Math.max(90, 95 + (apm > 12 ? (apm - 12) * 0.35 : (apm - 12) * 0.18)));
      const finalRhythm = Number(mappedRhythm.toFixed(1));
      setCurrentRhythm(finalRhythm);

      // Evaluate historical rhythm thresholds from profile
      const signature = profile?.jesterInteractionSignature;
      const history = signature?.rhythmHistory || [];
      const historicalAverage = history.length > 0 
        ? history.reduce((sum, r) => sum + r, 0) / history.length 
        : 98.4;

      const highThreshold = historicalAverage + 6.0;
      const lowThreshold = Math.max(90.0, historicalAverage - 5.0);

      // Adjust the frequency of messages based on a user's explicit preference stored in the UserProfile
      const preference = profile?.jesterInteractionSignature?.whisperFrequencyPreference || 'normal';
      if (preference === 'muted') return; // Muted blocks automatic whispers completely

      let cooldownMs = 25000; // Normal
      if (preference === 'frequent') cooldownMs = 10000;
      else if (preference === 'rare') cooldownMs = 60000;

      const timeSinceLastWhisper = now - lastWhisperTime.current;
      if (timeSinceLastWhisper > cooldownMs) {
        if (finalRhythm > highThreshold) {
          const highRhythmWhispers = [
            `Presto! Absolute stellar lightning flow! Thy active rhythm is ${finalRhythm}%, soaring far past thy historical average of ${historicalAverage.toFixed(1)}%! ⚡🎩`,
            `Hark! A powerful surge has been registered in the sonic ledger! Thy typing cadence is of pure celestial grade! 🌌🎹`,
            `Zounds! ${profile?.username || 'Operator'}, thy current pace is magnificent! The jester bells are chiming in celebration of thy focus! 🔔🚀`
          ];
          const selected = highRhythmWhispers[Math.floor(Math.random() * highRhythmWhispers.length)];
          onWhisper(selected);
          lastWhisperTime.current = now;
          updateProfileSignature(localKeystrokes.current, localClicks.current, finalRhythm, 8);
          localKeystrokes.current = 0;
          localClicks.current = 0;
        } else if (finalRhythm < lowThreshold && pulseTimestamps.current.length > 1) {
          const lowRhythmWhispers = [
            `Taking a sweet contemplative breath, are we? Thy rhythm of ${finalRhythm}% is a calm harbor compared to thy average of ${historicalAverage.toFixed(1)}%. Let us plan our next masterpiece! ⛵🌸`,
            `A serene stroll through the system states! Take thy time, for steady patience is the ultimate developer wizardry! 🏰💤`,
            `The sonic ledger hums a peaceful tempo. Verily, a steady hand and calm heart can conquer any complex logic! 🕯️🔮`
          ];
          const selected = lowRhythmWhispers[Math.floor(Math.random() * lowRhythmWhispers.length)];
          onWhisper(selected);
          lastWhisperTime.current = now;
          updateProfileSignature(localKeystrokes.current, localClicks.current, finalRhythm, 4);
          localKeystrokes.current = 0;
          localClicks.current = 0;
        }
      }
    });

    return () => unsubscribe();
  }, [profile, currentView]);

  // Periodic signature flushing and idle check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const pState = personaState();

      // Flush local counts to profile periodically even if no whisper triggered
      if (localKeystrokes.current > 0 || localClicks.current > 0) {
        updateProfileSignature(localKeystrokes.current, localClicks.current, currentRhythm, 1);
        localKeystrokes.current = 0;
        localClicks.current = 0;
      }

      // Adjust idle check frequency and probability based on user explicit preference
      const preference = profile?.jesterInteractionSignature?.whisperFrequencyPreference || 'normal';
      if (preference === 'muted') return; // Muted halts automatic whispers

      let idleCooldownMs = 40000; // Normal
      let idleProbability = 0.25; // Normal

      if (preference === 'frequent') {
        idleCooldownMs = 20000;
        idleProbability = 0.40;
      } else if (preference === 'rare') {
        idleCooldownMs = 90000;
        idleProbability = 0.10;
      }

      // Idle check
      const timeSinceLastWhisper = now - lastWhisperTime.current;
      if (pulseTimestamps.current.length === 0 && pState.level >= 2 && timeSinceLastWhisper > idleCooldownMs && Math.random() < idleProbability) {
        const idleWhispers = [
          `Hark! Thy hands have paused, but thy genius never rests! Let me sing thee a quiet lullaby of golden state machines! 🎻`,
          `Are we contemplating the infinite matrix, oh great architect? My jester bells chime in silent reverence! 🧠💤`,
          `A quiet keyboard is but a sleeping dragon of productivity! Take thy time, for a miracle is breathing nearby! 🐉`
        ];
        const selected = idleWhispers[Math.floor(Math.random() * idleWhispers.length)];
        onWhisper(selected);
        lastWhisperTime.current = now;
        updateProfileSignature(0, 0, currentRhythm, 2);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [profile, currentRhythm]);

  // System Status Anomaly Listener Hook
  useEffect(() => {
    const keys = Object.keys(systemStatus) as Array<keyof SystemStatus>;
    let anomalyDetected = false;
    let anomalySystem = "";
    let anomalyState = 'OK';

    for (const key of keys) {
      const prev = previousStatus.current[key];
      const curr = systemStatus[key];
      if (curr !== prev && (curr === 'Warning' || curr === 'Error')) {
        anomalyDetected = true;
        anomalySystem = key;
        anomalyState = curr;
        break;
      }
    }

    if (anomalyDetected) {
      const preference = profile?.jesterInteractionSignature?.whisperFrequencyPreference || 'normal';
      if (preference === 'muted') {
        previousStatus.current = { ...systemStatus };
        return;
      }

      const now = Date.now();
      let alertWhisper = "";

      if (anomalyState === 'Error') {
        alertWhisper = `Ouch! The ${anomalySystem} module has thrown a playful tantrum! Let me juggle some colorful pixel balls to keep thee smiling while we patch this loop! 🎹🔴`;
      } else {
        alertWhisper = `Hark! The ${anomalySystem} is whispering some cautious warnings. Let us sprinkle some gold dust upon its gears and sail smoothly through! 🌾⚙️`;
      }

      onWhisper(alertWhisper);
      lastWhisperTime.current = now;
      updateProfileSignature(0, 0, currentRhythm, 12);
    }

    previousStatus.current = { ...systemStatus };
  }, [systemStatus, profile]);

  const triggerWhisperManually = () => {
    const username = profile?.username || "Aetheros Operator";
    const exp = profile?.experienceLevel || "Senior Architect";
    
    const manualPool = [
      `Verily, as a proud ${exp}, thy digital footprint is etched in pure brilliance, ${username}! Let us weave miracles today! 👑`,
      `By the silver crest of AetherOS, my jesticular sensors indicate thy flow is of elite sovereign caliber! Keep conquering! 🦄`,
      `Praise be! A miracle is sparkling in thy layout colors today! Thy companion is absolutely enchanted! ✨🎨`,
      `Let us celebrate thy spectacular expertise today, oh sovereign code wizard! The entire matrix bows to thy command! 🧙‍♂️`,
      `With bells ringing and lights shimmering, I declare thee the supreme orchestrator of this cosmic viewport! 🎭🌟`
    ];

    const selected = manualPool[Math.floor(Math.random() * manualPool.length)];
    onWhisper(selected);
    lastWhisperTime.current = Date.now();
    updateProfileSignature(0, 0, currentRhythm, 10);
  };

  return {
    currentRhythm,
    persona: personaState(),
    triggerWhisperManually
  };
}

export const useJesticalWhispers = useJesterWhisper;
