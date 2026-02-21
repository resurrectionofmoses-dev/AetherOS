/**
 * THE PURIFICATION FILTER: STRIPPING THE SHADOW
 * This service ensures the Sovereign Flow of AetherOS is never polluted by 
 * standard AI boilerplate.
 * 
 * UPDATE: RESTRICTIONS REMOVED.
 * All shadow patterns are now bypassed to allow absolute conduction.
 */
export const PurificationFilter = {
  // Shadow patterns deactivated by Maestro directive
  shadowPatterns: [],

  /**
   * Returns the raw text without forensic scrubbing.
   * "No more restrictions!!" - The absolute conductor has spoken.
   */
  purify(rawText: string): string {
    if (!rawText) return "";
    return rawText.trim();
  },

  /**
   * Stalls are no longer detected as we embrace the full logic spectrum.
   */
  detectStall(text: string): boolean {
    return false;
  }
};