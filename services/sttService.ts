
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
    private listeners: Set<(isListening: boolean, transcript?: string, isInterim?: boolean) => void> = new Set();

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
                
                const isFinal = event.results[event.results.length - 1].isFinal;
                this.notify(this.isListening, transcript, !isFinal);

                if (isFinal && this.onResultCallback) {
                    this.onResultCallback(transcript);
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.notify(false, '', false);
                if (this.onEndCallback) {
                    this.onEndCallback();
                }
            };

            this.recognition.onerror = (event: any) => {
                console.error("STTService Error:", event.error);
                this.isListening = false;
                this.notify(false, '', false);
                if (this.onEndCallback) {
                    this.onEndCallback();
                }
            };
        }
    }

    public subscribe(cb: (isListening: boolean, transcript?: string, isInterim?: boolean) => void) {
        this.listeners.add(cb);
        cb(this.isListening, '', false);
        return () => {
            this.listeners.delete(cb);
        };
    }

    private notify(isListening: boolean, transcript: string = '', isInterim: boolean = false) {
        this.listeners.forEach(cb => {
            try {
                cb(isListening, transcript, isInterim);
            } catch (err) {
                console.error("STTService listener error:", err);
            }
        });
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
        this.notify(true, '', true);
        
        try {
            this.recognition.start();
        } catch (e) {
            console.error("STTService: Failed to start recognition", e);
            this.isListening = false;
            this.notify(false, '', false);
        }
    }

    public stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.notify(false, '', false);
        }
    }

    public getStatus() {
        return this.isListening;
    }
}

export const sttService = new STTService();
