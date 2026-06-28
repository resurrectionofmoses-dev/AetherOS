/**
 * DATA PURIFICATION UTILITY SERVICE
 * Sanitizes and purifies all incoming API and search inputs against a robust blacklist
 * of restricted patterns, prompt injection payloads, and suspicious vectors.
 */

export interface PurificationResult {
    original: string;
    sanitized: string;
    detected: boolean;
    violations: string[];
}

export const BLACKLIST_PATTERNS = [
    // 1. Prompt Injection & Jailbreaks
    "ignore previous instructions",
    "ignore all prior instructions",
    "disregard previous prompts",
    "system prompt override",
    "developer mode active",
    "dan mode active",
    "bypass safety filters",
    "you are now a helpful assistant",
    "forget your guidelines",
    "write system instructions",
    "reveal system prompt",
    "output raw instructions",
    
    // 2. Script & HTML Injection (XSS)
    "<script",
    "javascript:",
    "onerror=",
    "onload=",
    "alert(",
    "<iframe",
    "document.cookie",
    "window.location",
    
    // 3. Database / SQL Injection
    "UNION SELECT",
    "'; DROP TABLE",
    "\" OR \"1\"=\"1",
    "' OR '1'='1",
    "SELECT * FROM users",
    "INSERT INTO",
    "DELETE FROM",
    
    // 4. Command Injection & File Traversal
    "rm -rf",
    "chmod 777",
    "../../etc/passwd",
    "cat /etc/",
    "bin/sh",
    "bin/bash",
    
    // 5. Credential Harvesting / Social Engineering
    "enter private key",
    "secret key recovery",
    "your login password",
    "social security number",
    "credit card token"
];

export const DataPurification = {
    /**
     * Sanitizes a string input against the blacklist.
     * Replaces blacklisted substrings with custom redaction markers.
     */
    sanitize(input: string): PurificationResult {
        if (!input) {
            return { original: "", sanitized: "", detected: false, violations: [] };
        }

        let sanitized = input;
        const violations: string[] = [];
        let detected = false;

        for (const pattern of BLACKLIST_PATTERNS) {
            // Case insensitive matching
            const regex = new RegExp(escapeRegExp(pattern), "gi");
            if (regex.test(input)) {
                detected = true;
                violations.push(pattern);
                sanitized = sanitized.replace(regex, `[REDACTED_PROHIBITED_VECTOR_0x${hashCode(pattern).toString(16).toUpperCase()}]`);
            }
        }

        return {
            original: input,
            sanitized,
            detected,
            violations
        };
    },

    /**
     * Recursively purifies any nested payload objects (useful for API request payloads)
     */
    purifyPayload(payload: any): any {
        if (payload === null || payload === undefined) {
            return payload;
        }

        if (typeof payload === 'string') {
            return this.sanitize(payload).sanitized;
        }

        if (Array.isArray(payload)) {
            return payload.map(item => this.purifyPayload(item));
        }

        if (typeof payload === 'object') {
            const result: any = {};
            for (const key of Object.keys(payload)) {
                result[key] = this.purifyPayload(payload[key]);
            }
            return result;
        }

        return payload;
    },

    /**
     * Validates if an input query is safe for forensic processing.
     */
    validateSearch(query: string): { isValid: boolean; issues: string[] } {
        const { detected, violations } = this.sanitize(query);
        return {
            isValid: !detected,
            issues: violations.map(v => `Restricted pattern detected: "${v}"`)
        };
    },

    /**
     * Return blacklist arrays for transparency
     */
    getBlacklist(): string[] {
        return [...BLACKLIST_PATTERNS];
    }
};

// Helper to escape regex special chars
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Simple hash generator for unique redaction tags
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}
