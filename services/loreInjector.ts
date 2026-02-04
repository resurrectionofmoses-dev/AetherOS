
import { SOVEREIGN_MANIFEST } from '../constants';
import type { SquadMember } from '../types';

export const LoreInjector = {
  /**
   * Injects the Sovereign Manifest into a context string.
   */
  inject(context: string, node?: SquadMember): string {
    const nodeHeader = node ? `[ACTING_AS: ${node.name} | ${node.type}]\n` : '';
    return `
${nodeHeader}
--- SOVEREIGN_LORE_INGRESS ---
${SOVEREIGN_MANIFEST}
--- END_LORE ---

CURRENT_TASK_CONTEXT:
${context}

DIRECTIVE: Ensure the output follows the AetherOS Chain of Operation. 
Use forensic language. Ensure 0x03E2 alignment.
    `.trim();
  }
};
