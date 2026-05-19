
/**
 * --- STT SERVICE: THE NEURAL EAR ---
 * Protocol: 0x03E2_RECOGNITION
 * Implementation of Speech-to-Text using standard Web Speech API.
 */

class STTService {
    private recognition: any = null;
    private isListening = false;
    private onResultCallback: ((text: string) => void) | null = null;
    private onEndCallback: (() => void) | null = null;

    constructor() {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');
                
                if (event.results[0].isFinal && this.onResultCallback) {
                    this.onResultCallback(transcript);
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                if (this.onEndCallback) {
                    this.onEndCallback();
                }
            };

            this.recognition.onerror = (event: any) => {
                console.error("STTService Error:", event.error);
                this.isListening = false;
                if (this.onEndCallback) {
                    this.onEndCallback();
                }
            };
        }
    }

    public start(onResult: (text: string) => void, onEnd: () => void) {
        if (!this.recognition) {
            console.error("STTService: Speech recognition not supported in this browser.");
            return;
        }

        if (this.isListening) return;

        this.onResultCallback = onResult;
        this.onEndCallback = onEnd;
        this.isListening = true;
        
        try {
            this.recognition.start();
        } catch (e) {
            console.error("STTService: Failed to start recognition", e);
            this.isListening = false;
        }
    }

    public stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    public getStatus() {
        return this.isListening;
    }
}

export const sttService = new STTService();
