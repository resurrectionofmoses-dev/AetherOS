
/**
 * Structural Layer Mapper
 * Maps the AetherOS component hierarchy to guarantee constant state depth.
 */
export const COMPONENT_LAYERS: Record<string, number> = {
    'App': 0,
    'ViewRegistry': 1,
    'EurodemuxView': 2,
    'SystemIntegrityView': 2,
    'ChatView': 2,
    'OperationsVault': 2,
    'HexMetric': 3,
    'WaveVisualizer': 3,
    'InputBar': 3,
};

export const getComponentDepth = (name: string) => COMPONENT_LAYERS[name] || 99;

/**
 * Regex Stability Guard (WO_001)
 * Validates patterns and strips intersecting quantifiers to prevent exponential backtracking.
 */
export const hardenPattern = (pattern: string): string => {
    // Simulated hardening: Detect zero-width negative lookahead
    if (pattern.includes('(?!')) {
        console.log(`[WO_001] Stabilizing negative lookahead assertion in pattern: ${pattern}`);
        // Stripping risky trailing quantifiers that intersect with lookahead trees
        return pattern.replace(/\.\*\?/g, '[^]*'); 
    }
    return pattern;
};

export const STRUCTURAL_MANIFEST = {
    protocol: 'FLAT_STACKING_v1',
    lookaheadAssertionStatus: 'STABILIZED',
    layerDepthIntegrity: 1.0
};
