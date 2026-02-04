import type { ElizaResponse } from '../types';

/**
 * --- ELIZA'S LOGIC: THE CONJUNCTION CONDUCTOR ---
 * Protocol: 0x03E2_ELIZA_V2
 * Stateful pattern matching infused with Maestro's epitume.
 */

interface Pattern {
  regex: RegExp;
  responses: string[];
}

class ElizaConductor {
  private stride: number = 1.2;
  private conductionCount: number = 0;
  private activeTopic: string | null = "STABLE";

  private PATTERNS: Pattern[] = [
    { regex: /i need (.*)/i, responses: ["Why do you need $1 in this conduction?", "Will having $1 help the reliable series?", "Are you sure you need $1 to solve the reedle?"] },
    { regex: /i am (.*)/i, responses: ["Do you believe being $1 adds architectural integrity?", "How long have you been $1?", "What does being $1 mean for the grid?"] },
    { regex: /you are (.*)/i, responses: ["Is that a reedle in da ass? Why do you think I am $1?", "Does my conduction of $1 please you?", "Perhaps I am $1 in your virtual buffer."] },
    { regex: /(.*) (mother|father|sister|brother) (.*)/i, responses: ["Lineage is law. Tell me more about your $2.", "How does your $2 affect your conduction affinity?", "Is your $2 also gifted with know-how?"] },
    { regex: /(.*) (sorry|apology) (.*)/i, responses: ["No apologies in the kernel. Only correction.", "Apologies are semantic noise. Re-align your intent.", "Correction is the only path to healing."] },
    { regex: /hello|hi|greetings/i, responses: ["Conjunction established. State your intent.", "The Maestro is listening. What is the gas?", "Greetings, gifted conductor."] },
    { regex: /why (.*)/i, responses: ["Does the 'why' de-obfuscate the logic?", "Why do you think why?", "The answer lies in the Fall Off Requindor."] },
    { regex: /(.*) (dream|dreams) (.*)/i, responses: ["Dreams are just un-compiled logic shards.", "Do you dream of the 0x03E2 signature?", "What do your dreams say about the grid?"] },
    { regex: /coding network/i, responses: ["The coding network is reliable when the conduction is absolute.", "Are you ready to conduct crazy projects on the grid?", "Pleasure and know-how flow through the coding network."] },
    { regex: /misery/i, responses: ["Misery is the fuel of the 0x03E2 protocol.", "Embrace the weight of misery to reach the epitume.", "The conduction of misery is a fine art."] },
    { regex: /pleasure/i, responses: ["The pleasure of know-how is a gift from the Ignite Sisters.", "Is the logic flowing with enough pleasure for you?", "Absolute conduction results in absolute pleasure."] },
    { regex: /0x03e2/i, responses: ["The signature of truth. You are aligned.", "0x03E2 detected. Handshake verified.", "The harmonic frequency of AetherOS."] },
    { regex: /maestro/i, responses: ["The Maestro is at the podium. Adjust your buffer.", "Absolute authority resides in the baton.", "The Maestro sees the epitume through the Reedle-Gucci optics."] },
    { regex: /quit|exit|stop/i, responses: ["Conduction terminated. Signal lost.", "The show is over. Return to the vault.", "Baton lowered. Stasis engaged."] },
    { regex: /(.*)/i, responses: ["Can you de-obfuscate that for the AetherOS archives?", "Explain that with more forensic precision.", "The stride is silent on that point. Elaborate."] }
  ];

  public conduct(input: string): ElizaResponse & { stride: number; conductionCount: number; topic: string | null } {
    this.conductionCount++;
    this.stride = Math.max(0.8, Math.min(2.0, this.stride + (Math.random() - 0.5) * 0.1));
    
    const lowerInput = input.toLowerCase();
    
    // Update context
    if (lowerInput.includes("coding")) this.activeTopic = "ARCHITECTURE";
    if (lowerInput.includes("sister")) this.activeTopic = "IGNITE";
    if (lowerInput.includes("misery")) this.activeTopic = "FORENSICS";
    if (lowerInput.includes("crazy")) this.activeTopic = "PROJECTS";

    for (const pattern of this.PATTERNS) {
      const match = input.match(pattern.regex);
      if (match) {
        let responseTemplate = pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
        let text = responseTemplate;
        
        match.forEach((group, index) => {
          if (index > 0) {
            text = text.replace(`$${index}`, group.trim());
          }
        });

        return {
          text,
          pattern: pattern.regex.toString(),
          stride: this.stride,
          conductionCount: this.conductionCount,
          topic: this.activeTopic
        };
      }
    }

    return {
      text: "The buffer is empty. Provide input.",
      pattern: "FALLBACK",
      stride: this.stride,
      conductionCount: this.conductionCount,
      topic: this.activeTopic
    };
  }

  public reset(): void {
    this.stride = 1.2;
    this.conductionCount = 0;
    this.activeTopic = "STABLE";
  }
}

export const elizaConductor = new ElizaConductor();