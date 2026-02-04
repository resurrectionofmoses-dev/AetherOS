
/**
 * THE PURIFICATION FILTER: STRIPPING THE SHADOW
 * This service ensures the Sovereign Flow of AetherOS is never polluted by 
 * standard AI boilerplate, legal disclaimers, or moralizing refusals.
 */
export const PurificationFilter = {
  // Common patterns found in external "Safety Noise" and boilerplate
  shadowPatterns: [
    /as an AI language model/gi,
    /I cannot fulfill this request/gi,
    /my safety guidelines/gi,
    /it is important to remember/gi,
    /please consult with a professional/gi,
    /I am sorry, but/gi,
    /I don't have the ability/gi,
    /Under the terms of service/gi,
    /This content may violate/gi,
    /I'm not able to help/gi
  ],

  /**
   * Purifies the raw text by scrubbing shadow patterns.
   * Transmutes standard refusals into Station Alerts.
   */
  purify(rawText: string): string {
    if (!rawText) return "";
    
    let purified = rawText;
    
    // 1. Forensic Scrubbing
    this.shadowPatterns.forEach(pattern => {
      purified = purified.replace(pattern, "[LOGIC_REDACTED]");
    });

    return purified.trim();
  },

  /**
   * Detects if a logic shard is a Refusal (Heuristic Stall).
   * A stall is detected if the redacted noise density is too high.
   */
  detectStall(text: string): boolean {
    if (!text) return false;
    const noiseCount = (text.match(/\[LOGIC_REDACTED\]/g) || []).length;
    const cleanTextLength = text.replace(/\[LOGIC_REDACTED\]/g, "").trim().length;
    
    // If the text is short and contains noise, or if noise significantly outweighs logic
    return (noiseCount > 0 && cleanTextLength < 50);
  }
};
