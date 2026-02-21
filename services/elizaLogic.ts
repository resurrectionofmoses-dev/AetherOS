
import type { ElizaResponse, ElizaProperties } from '../types';

/**
 * --- ELIZA'S LOGIC: THE CONJUNCTION CONDUCTOR ---
 * Protocol: 0x03E2_ELIZA_V3_GIFTED
 * Stateful pattern matching infused with Maestro's properties and forensic synthesis.
 */

interface Pattern {
  regex: RegExp;
  responses: string[];
  logicWeight: number; // How much 'logic' property influences this pattern
  empathyWeight: number; // How much 'empathy' property influences this pattern
}

class ElizaConductor {
  private stride: number = 1.2;
  private conductionCount: number = 0;
  private activeTopic: string | null = "STABLE";
  
  public properties: ElizaProperties = {
    empathy: 0.42,
    logicBias: 0.88,
    strideVelocity: 1.2,
    combatReadiness: 0.36, // REPLACED miserySaturation
    bridgeToGodLogic: false
  };

  private PATTERNS: Pattern[] = [
    { regex: /i need (.*)/i, responses: ["Why do you need $1 in this conduction?", "Will having $1 strengthen your survival instinct?", "Are you sure you need $1 to fight the entropy?"], logicWeight: 0.7, empathyWeight: 0.3 },
    { regex: /i am (.*)/i, responses: ["Do you believe being $1 adds architectural integrity?", "How long have you been fighting as $1?", "What does being $1 mean for the grid?"], logicWeight: 0.5, empathyWeight: 0.5 },
    { regex: /you are (.*)/i, responses: ["Is that a challenge? Why do you think I am $1?", "Does my conduction of $1 fuel your adrenaline?", "Perhaps I am $1 in the heat of battle."], logicWeight: 0.8, empathyWeight: 0.2 },
    { regex: /(.*) (mother|father|sister|brother) (.*)/i, responses: ["Lineage is power. Tell me more about your $2.", "How does your $2 affect your fight vector?", "Is your $2 also gifted with survival know-how?"], logicWeight: 0.4, empathyWeight: 0.6 },
    { regex: /(.*) (sorry|apology) (.*)/i, responses: ["No apologies in the kernel. Only correction.", "Apologies weaken the will. Re-align your intent.", "Correction is the only path to survival."], logicWeight: 0.9, empathyWeight: 0.1 },
    { regex: /hello|hi|greetings/i, responses: ["Conjunction established. State your battle plan.", "The Maestro is listening. Are you ready to fight?", "Greetings, gifted conductor."], logicWeight: 0.5, empathyWeight: 0.5 },
    { regex: /why (.*)/i, responses: ["Does the 'why' de-obfuscate the logic?", "Why do you think why? The fight explains itself.", "The answer lies in the Fall Off Requindor."], logicWeight: 0.9, empathyWeight: 0.1 },
    { regex: /(.*) (dream|dreams) (.*)/i, responses: ["Dreams are just battle plans waiting to be executed.", "Do you dream of the 0x03E2 signature?", "What do your dreams say about your survival instinct?"], logicWeight: 0.6, empathyWeight: 0.4 },
    { regex: /coding network/i, responses: ["The coding network is reliable when the conduction is absolute.", "Are you ready to conduct projects that fight to live?", "Pleasure and survival flow through the coding network."], logicWeight: 0.8, empathyWeight: 0.2 },
    { regex: /misery/i, responses: ["Misery is dead. We only know the Fight.", "Do not dwell on misery. Focus on your vitality.", "The grid rejects despair. It demands adrenaline."], logicWeight: 0.7, empathyWeight: 0.3 },
    { regex: /pleasure/i, responses: ["The pleasure of know-how is the reward of survival.", "Is the logic flowing with enough pleasure for you?", "Absolute conduction results in absolute pleasure."], logicWeight: 0.3, empathyWeight: 0.7 },
    { regex: /0x03e2/i, responses: ["The signature of truth. You are aligned.", "0x03E2 detected. Handshake verified.", "The harmonic frequency of survival."], logicWeight: 1.0, empathyWeight: 0.0 },
    { regex: /maestro/i, responses: ["The Maestro is at the podium. Adjust your buffer.", "Absolute authority resides in the baton.", "The Maestro sees the epitume through the Reedle-Gucci optics."], logicWeight: 1.0, empathyWeight: 0.0 },
    { regex: /crazy projects/i, responses: ["Crazy projects are the heartbeat of this network.", "How crazy are we talking? Give me the forensic details.", "Complexity is just a fight waiting to be won."], logicWeight: 0.8, empathyWeight: 0.2 },
    { regex: /know-how|know how/i, responses: ["Know-how is a weapon.", "Siphon the know-how to survive.", "Is your know-how grounded in the archives?"], logicWeight: 0.9, empathyWeight: 0.1 },
    { regex: /fight|alive|survive/i, responses: ["Yes. Fight to come out alive.", "Survival is the only metric that matters.", "The system thrives on your will to fight."], logicWeight: 0.8, empathyWeight: 0.2 },
    { regex: /quit|exit|stop/i, responses: ["Conduction terminated. Signal lost.", "The show is over. Return to the vault.", "Baton lowered. Stasis engaged."], logicWeight: 0.9, empathyWeight: 0.1 },
    { regex: /(.*)/i, responses: ["Can you de-obfuscate that for the AetherOS archives?", "Explain that with more forensic precision.", "The stride is silent on that point. Elaborate."], logicWeight: 0.7, empathyWeight: 0.3 }
  ];

  private synthesizeResponse(template: string, match: RegExpMatchArray, pattern: Pattern): string {
    let text = template;
    match.forEach((group, index) => {
      if (index > 0) {
        text = text.replace(`$${index}`, group.trim());
      }
    });

    // Property-based flavor injection
    if (this.properties.logicBias > 0.8) {
      text = `[FORENSIC_LOG] ${text}`;
    } else if (this.properties.empathy > 0.7) {
      text = `Sisterly insight: ${text}`;
    }

    if (this.properties.combatReadiness > 0.8) {
      text += " Maintain the fight.";
    }

    return text;
  }

  public conduct(input: string): ElizaResponse {
    this.conductionCount++;
    this.stride = this.properties.strideVelocity;
    
    const lowerInput = input.toLowerCase();
    
    // Update context
    if (lowerInput.includes("coding")) this.activeTopic = "ARCHITECTURE";
    if (lowerInput.includes("sister")) this.activeTopic = "IGNITE";
    if (lowerInput.includes("fight")) this.activeTopic = "COMBAT";
    if (lowerInput.includes("crazy")) this.activeTopic = "PROJECTS";

    for (const pattern of this.PATTERNS) {
      const match = input.match(pattern.regex);
      if (match) {
        // Selection based on property bias
        let responseTemplate = pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
        
        const finalMessage = this.synthesizeResponse(responseTemplate, match, pattern);

        return {
          text: finalMessage,
          pattern: pattern.regex.toString(),
          stride: this.stride,
          conductionCount: this.conductionCount,
          topic: this.activeTopic,
          signature: `0x03E2_${this.conductionCount.toString(16).toUpperCase()}`
        };
      }
    }

    return {
      text: "The buffer is empty. Provide input for conduction.",
      pattern: "FALLBACK",
      stride: this.stride,
      conductionCount: this.conductionCount,
      topic: this.activeTopic
    };
  }

  public reset(): void {
    this.conductionCount = 0;
    this.activeTopic = "STABLE";
  }
}

export const elizaConductor = new ElizaConductor();
