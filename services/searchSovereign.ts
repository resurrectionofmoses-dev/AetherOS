import type { SovereignSearchResult } from '../types';

/**
 * --- 31. SOVEREIGN SEARCH: THE CROSS-PROVIDER SIPHON ---
 * Protocol: 0x03E2_SEARCH_NET
 * Proxies search requests to the secure Express server-side endpoint.
 */
export const SearchSovereign = {
    async conduct(
        query: string, 
        bypassLimits = false, 
        purificationMode: 'off' | 'silver' | 'gold' | 'sovereign' = 'silver'
    ): Promise<SovereignSearchResult | null> {
        try {
            const response = await fetch('/api/search-sovereign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    bypassLimits,
                    purificationMode
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Server returned status ${response.status}`);
            }

            return await response.json();
        } catch (e: any) {
            console.error("[SEARCH_STALL] Sovereign search proxy request failed.", e);
            return null;
        }
    }
};
