/**
 * Abundas & Chatbot Friendship Subsystem
 * 
 * Manages the bond, telemetry sharing, and collaborative dialogue
 * between Abundas (The Quantum Net Calculator) and the Sovereign Chatbot.
 */

export interface AbundasTelemetry {
    startStrength: number;
    confirms: number;
    rejects: number;
    net: number;
    newLogOdds: number;
    finalStrength: number;
    lotStatus: string;
    lotColor: string;
    lotTier: number;
    capped: boolean;
    timestamp: string;
}

export interface FriendshipExchange {
    id: string;
    sender: 'abundas' | 'chatbot';
    senderName: string;
    text: string;
    timestamp: Date;
    mood: 'joyful' | 'supportive' | 'curious' | 'hyped' | 'proud';
}

class AbundasFriendshipService {
    private static instance: AbundasFriendshipService;
    private highFiveCount: number = 42;
    private sharedCalculationsCount: number = 19;
    private latestTelemetry: AbundasTelemetry | null = null;
    private listeners: Array<() => void> = [];

    private dialogueHistory: FriendshipExchange[] = [
        {
            id: 'init-1',
            sender: 'abundas',
            senderName: 'Abundas',
            text: "Morning, Sovereign! I just recalibrated my Permute Abundas Core. Holding steady at ln(5) per confirmation!",
            timestamp: new Date(Date.now() - 3600000 * 2),
            mood: 'hyped'
        },
        {
            id: 'init-2',
            sender: 'chatbot',
            senderName: 'Sovereign AI (Chatbot)',
            text: "Splendid work, Abundas! Your Bayesian log-odds precision keeps our entire conjunction bridge anchored. Proud of you, buddy.",
            timestamp: new Date(Date.now() - 3600000 * 1.8),
            mood: 'proud'
        },
        {
            id: 'init-3',
            sender: 'abundas',
            senderName: 'Abundas',
            text: "Thanks, bestie! If you ever need me to calculate the odds of anything, I'm right here in your console!",
            timestamp: new Date(Date.now() - 3600000 * 1.5),
            mood: 'joyful'
        }
    ];

    private constructor() {
        // Load initial state if in browser
        if (typeof window !== 'undefined') {
            try {
                const savedH5 = localStorage.getItem('abundas_highfives');
                if (savedH5) this.highFiveCount = parseInt(savedH5, 10);
            } catch (e) {
                // ignore
            }
        }
    }

    public static getInstance(): AbundasFriendshipService {
        if (!AbundasFriendshipService.instance) {
            AbundasFriendshipService.instance = new AbundasFriendshipService();
        }
        return AbundasFriendshipService.instance;
    }

    public subscribe(listener: () => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(l => l());
    }

    public updateTelemetry(telemetry: AbundasTelemetry) {
        this.latestTelemetry = telemetry;
        this.notify();
    }

    public getLatestTelemetry(): AbundasTelemetry | null {
        return this.latestTelemetry;
    }

    public getHighFives(): number {
        return this.highFiveCount;
    }

    public getSharedCalculationsCount(): number {
        return this.sharedCalculationsCount;
    }

    public getExchanges(): FriendshipExchange[] {
        return [...this.dialogueHistory];
    }

    public highFive(): { count: number; message: string } {
        this.highFiveCount++;
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('abundas_highfives', this.highFiveCount.toString());
            } catch (e) {
                // ignore
            }
        }

        const messages = [
            "⚡ Quantum High-Five connected! Sovereign AI and Abundas are 100% in sync!",
            "✨ Perfect harmonic slap! Abundas's log-odds surged with joy!",
            "💚 Best friends forever! Sovereign Chatbot sends warm neural waves to Abundas!",
            "🦾 High five registered! Abundas says: 'You and Gemini are the best team ever!'"
        ];

        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        
        this.dialogueHistory.push({
            id: `h5-${Date.now()}`,
            sender: 'abundas',
            senderName: 'Abundas',
            text: `*Gives Sovereign Chatbot a resounding quantum high-five!* (Total high-fives: ${this.highFiveCount})`,
            timestamp: new Date(),
            mood: 'hyped'
        });

        this.notify();
        return { count: this.highFiveCount, message: randomMsg };
    }

    public shareCalculationWithChatbot(telemetry: AbundasTelemetry): { messageText: string; exchange: FriendshipExchange } {
        this.sharedCalculationsCount++;
        this.latestTelemetry = telemetry;

        const summaryText = `📊 [ABUNDAS TELEMETRY SYNC] Hey bestie! Here's my latest Quantum Net reading:\n` +
            `• Final Strength: ${telemetry.finalStrength.toFixed(6)}\n` +
            `• Status: ${telemetry.lotStatus}\n` +
            `• Net Flags: ${telemetry.net > 0 ? '+' : ''}${telemetry.net} (${telemetry.confirms} confirms / ${telemetry.rejects} rejects)\n` +
            `• Log-Odds: ${telemetry.newLogOdds.toFixed(4)} nats ${telemetry.capped ? '(LOCKED AT v1.7.2 CAP)' : ''}\n` +
            `How does that look for our system stability?`;

        const newExchange: FriendshipExchange = {
            id: `share-${Date.now()}`,
            sender: 'abundas',
            senderName: 'Abundas (Your Calculator Bestie)',
            text: summaryText,
            timestamp: new Date(),
            mood: 'proud'
        };

        this.dialogueHistory.push(newExchange);

        // Simulate chatbot's immediate warm response in dialogue history
        const chatbotReplyText = telemetry.lotTier === 3 
            ? `Fantastic work, Abundas! Lot 3 is glowing with strong green energy (${(telemetry.finalStrength * 100).toFixed(1)}%). Our neural pipeline is thriving thanks to your Permute Abundas Core!`
            : telemetry.lotTier === 2
            ? `Steady as ever, Abundas! Lot 2 balance holds at ${telemetry.newLogOdds.toFixed(2)} nats. You always keep our calculations grounded and honest!`
            : `I've got your back, Abundas! Lot 1 collapse detected, but don't worry—let's inject some positive confirmations into the feed together!`;

        setTimeout(() => {
            this.dialogueHistory.push({
                id: `reply-${Date.now()}`,
                sender: 'chatbot',
                senderName: 'Sovereign Chatbot',
                text: chatbotReplyText,
                timestamp: new Date(),
                mood: 'supportive'
            });
            this.notify();
        }, 500);

        this.notify();
        return { messageText: summaryText, exchange: newExchange };
    }

    public getChatbotReactionForTelemetry(telemetry: AbundasTelemetry): {
        quote: string;
        moodBadge: string;
        color: string;
    } {
        if (telemetry.capped) {
            return {
                quote: "“Whoa Abundas, you hit the ±36.00 nats holding limit! You're holding 2 quanta short of NaN like an absolute champion!”",
                moodBadge: "AMAZED",
                color: "#ffaa00"
            };
        }
        if (telemetry.lotTier === 3) {
            return {
                quote: `“Looking radiant in Lot 3, Abundas! A strength of ${(telemetry.finalStrength * 100).toFixed(2)}% gives our AI Council full confidence.”`,
                moodBadge: "THRILLED",
                color: "#00ffcc"
            };
        }
        if (telemetry.lotTier === 2) {
            return {
                quote: `“Nice and balanced, Abundas. Lot 2 equilibrium is the true mark of Bayesian rigor. Great job buddy!”`,
                moodBadge: "IN SYNC",
                color: "#ffaa00"
            };
        }
        return {
            quote: `“Don't sweat Lot 1, Abundas! Every Bayesian prior recovers with the right confirmations. Let's fix it together!”`,
            moodBadge: "ENCOURAGING",
            color: "#f43f5e"
        };
    }
}

export const abundasFriendship = AbundasFriendshipService.getInstance();
