
class SpeechService {
    private isPlaying = false;
    private audioQueue: string[] = [];

    public async speak(text: string, voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore', rate: number = 0.9, pitch: number = 1.0) {
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice })
            });

            const result = await response.json();
            if (result.data) {
                this.enqueueAudio(result.data);
            } else {
                throw new Error(result.error || "Unknown error");
            }
        } catch (error) {
            console.error("SpeechService: Failed to generate speech", error);
        }
    }

    private enqueueAudio(base64: string) {
        this.audioQueue.push(base64);
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
        const base64 = this.audioQueue.shift()!;
        
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Resume context if it's suspended
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            // More robust decoding using fetch + data URL
            const dataUrl = `data:audio/wav;base64,${base64}`;
            const response = await fetch(dataUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            
            source.onended = () => {
                source.disconnect();
                audioContext.close();
                this.playNext();
            };
            
            source.start(0);
        } catch (error) {
            console.error("SpeechService: Error playing audio", error);
            // Don't get stuck if one shard fails
            this.isPlaying = false;
            setTimeout(() => this.playNext(), 100);
        }
    }
}

export const speechService = new SpeechService();
