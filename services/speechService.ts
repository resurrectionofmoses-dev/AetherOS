
interface AudioQueueItem {
    base64: string;
    text: string;
    mimeType?: string;
}

class SpeechService {
    private isPlaying = false;
    private audioQueue: AudioQueueItem[] = [];

    public async speak(text: string, voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore', rate: number = 0.9, pitch: number = 1.0) {
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice })
            });

            if (!response.ok) {
                throw new Error(`HTTP_${response.status}`);
            }

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                throw new Error("Received non-JSON response from server");
            }

            const result = await response.json();
            if (result.data) {
                this.enqueueAudio(result.data, text, result.mimeType || "audio/aac");
            } else {
                throw new Error(result.error || "Unknown error");
            }
        } catch (error) {
            console.warn("SpeechService: Server API TTS failed, falling back to Web SpeechSynthesis...", error);
            this.speakWithSpeechSynthesis(text, rate, pitch);
        }
    }

    private speakWithSpeechSynthesis(text: string, rate: number = 0.85, pitch: number = 1.0) {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            console.error("SpeechSynthesis not supported in this browser context.");
            return;
        }

        try {
            // Cancel extreme overlaps
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = rate;
            utterance.pitch = pitch;

            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const enVoice = voices.find(v => v.lang.startsWith('en'));
                if (enVoice) {
                    utterance.voice = enVoice;
                }
            }

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.error("SpeechSynthesis speak invocation failed:", err);
        }
    }

    private enqueueAudio(base64: string, text: string, mimeType: string = "audio/aac") {
        this.audioQueue.push({ base64, text, mimeType });
        if (!this.isPlaying) {
            this.playNext();
        }
    }

    private async playNext() {
        if (this.audioQueue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const item = this.audioQueue.shift()!;
        const { base64, text, mimeType } = item;
        const activeMime = mimeType || "audio/aac";
        
        // Try playing via robust HTML5 Audio element first (works with standard compression codecs like mp3/aac encoded as base64 data URLs)
        const dataUrl = `data:${activeMime};base64,${base64}`;
        
        let fallbackTriggered = false;
        const triggerFallback = async (reason: string) => {
            if (fallbackTriggered) return;
            fallbackTriggered = true;
            console.log(`SpeechService: HTML5 audio failed (${reason}), transitioning to fallback...`);
            await this.playAudioContextFallback(base64, text, activeMime);
        };

        try {
            const audioObj = new Audio(dataUrl);
            
            audioObj.onended = () => {
                this.playNext();
            };
            
            audioObj.onerror = (e) => {
                triggerFallback("HTML5 audio playback error event fired");
            };

            await audioObj.play();
        } catch (html5Error) {
            // Autoplay blocking or codec missing
            await triggerFallback("HTML5 play attempt rejected");
        }
    }

    private async playAudioContextFallback(base64: string, text: string, mimeType: string = "audio/aac") {
        // [Paul-Matrix Quantum Compress State]:
        // In the flow of qubits, our Bell State acts as the decision point.
        // We handle any audio buffer as a superposition. If a state collapse is detected during the transition,
        // we use systemic Patience to seamlessly transition back to high-fidelity native SpeechSynthesis.
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) {
                throw new Error("Web Audio API not supported in this browser context");
            }
            const audioContext = new AudioContextClass();
            
            // Resume context if it's suspended
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            // High performance, direct synchronous in-memory base64 arraybuffer decoding
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const arrayBuffer = bytes.buffer;

            let audioBuffer: AudioBuffer | null = null;
            try {
                // Clone arrayBuffer defensively before passing to prevent sudden detachment
                const initialAttemptBuffer = arrayBuffer.slice(0);
                audioBuffer = await audioContext.decodeAudioData(initialAttemptBuffer);
            } catch (decodeErr) {
                console.warn("Promise-based direct decode failed, attempting safe callback decode fallback...", decodeErr);
                // Since modern browsers might reject some AAC/ADTS audio configurations, let's verify if callback interface works
                try {
                    audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
                        audioContext.decodeAudioData(
                            arrayBuffer, // Still valid since only the slice clone was collapsed/detached
                            (buf) => resolve(buf),
                            (err) => reject(err || new Error("Failed to decode audio data in legacy callback"))
                        );
                    });
                } catch (legacyErr) {
                    console.log("Both modern and legacy Web Audio decoding paths failed (expected if browser lacks local AAC decoder):", legacyErr);
                    throw legacyErr;
                }
            }
            
            if (!audioBuffer) {
                throw new Error("Resolved audioBuffer is empty");
            }

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            
            source.onended = () => {
                source.disconnect();
                audioContext.close().catch(() => {});
                this.playNext();
            };
            
            source.start(0);
        } catch (error) {
            console.log("SpeechService: Audio synthesis/decoding fell back to Web SpeechSynthesis. Dynamic state reconciled.", error);
            
            // Native speech synthesis as the ultimate self-healing quantum observer
            try {
                this.speakWithSpeechSynthesis(text);
            } catch (synthErr) {
                console.warn("SpeechSynthesis final safeguard failed:", synthErr);
            }

            // Move gracefully to the next element in the superposition queue
            this.isPlaying = false;
            setTimeout(() => this.playNext(), 200);
        }
    }
}

export const speechService = new SpeechService();
