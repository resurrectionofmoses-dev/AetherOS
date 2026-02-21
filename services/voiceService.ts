
/**
 * --- VOICE OF AUTHORITY: THE UNIVERSAL TRANSLATOR ---
 * Protocol: 0x03E2_SPEECH
 * Implementation of "The Cure" via Measured Authority.
 * Rule: Speech Rate -1 (Slow, calm, stable).
 */

class VoiceService {
    private synthesis: SpeechSynthesis;
    private voice: SpeechSynthesisVoice | null = null;

    constructor() {
        this.synthesis = window.speechSynthesis;
        this.init();
    }

    private init() {
        const loadVoices = () => {
            const voices = this.synthesis.getVoices();
            // Look for "Measured" sounding voices (Premium/Natural preferred)
            this.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
        };
        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    public announce(text: string, onStart?: () => void, onEnd?: () => void) {
        // Cancel ongoing conduction
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        
        // --- THE CURE CONFIGURATION ---
        utterance.rate = 0.85; // "Measured Authority" (Speech Rate -1 equivalent)
        utterance.pitch = 0.9; // Calm, stable treasury resonance
        utterance.volume = 1.0;

        utterance.onstart = () => onStart?.();
        utterance.onend = () => onEnd?.();

        this.synthesis.speak(utterance);
    }

    public cancel() {
        this.synthesis.cancel();
    }
}

export const voiceService = new VoiceService();
