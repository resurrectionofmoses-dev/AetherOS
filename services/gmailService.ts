import { getAccessToken } from './firebaseAuthService';

export interface GmailMessageHeader {
    name: string;
    value: string;
}

export interface GmailMessage {
    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    historyId: string;
    internalDate: string;
    payload: {
        partId: string;
        mimeType: string;
        filename: string;
        headers: GmailMessageHeader[];
        body: {
            size: number;
            data?: string;
        };
        parts?: any[];
    };
    sizeEstimate: number;
    raw?: string;
}

export interface DecodedEmail {
    id: string;
    subject: string;
    from: string;
    to: string;
    date: string;
    snippet: string;
    body: string;
    labels: string[];
}

/**
 * Encodes string to url-safe base64
 */
function base64UrlEncode(str: string): string {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Decodes base64Url string to standard text
 */
function decodeBase64Url(data: string): string {
    try {
        const decodedBytes = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
        return decodeURIComponent(escape(decodedBytes));
    } catch (e) {
        try {
            return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
        } catch (err) {
            return '[Payload undecodable]';
        }
    }
}

/**
 * Traverses body parts to extract full email text body
 */
function extractBody(payload: any): string {
    if (!payload) return '[No Body]';
    if (payload.body && payload.body.data) {
        return decodeBase64Url(payload.body.data);
    }
    if (payload.parts && payload.parts.length > 0) {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                return decodeBase64Url(part.body.data);
            }
        }
        // Fallback to first HTML part or other parts
        for (const part of payload.parts) {
            if (part.mimeType === 'text/html' && part.body && part.body.data) {
                return decodeBase64Url(part.body.data);
            }
            if (part.parts) {
                const subBody = extractBody(part);
                if (subBody && subBody !== '[No Body]') return subBody;
            }
        }
    }
    return '[No plain text payload found]';
}

export const gmailService = {
    /**
     * Checks if Google Access Token is currently cached
     */
    async hasConnection(): Promise<boolean> {
        const token = await getAccessToken();
        return !!token;
    },

    /**
     * Helper to perform authorized Gmail API requests
     */
    async fetchGmail(endpoint: string, options: RequestInit = {}): Promise<any> {
        const token = await getAccessToken();
        if (!token) {
            throw new Error('No active Gmail connection. Please sign in with Google to grant permission.');
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${endpoint}`, {
            ...options,
            headers
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            if (res.status === 401) {
                throw new Error('Gmail connection expired. Please reconnect to continue.');
            }
            throw new Error(`Gmail API error (${res.status}): ${errBody || res.statusText}`);
        }

        if (res.status === 204) return null;
        return res.json();
    },

    /**
     * Lists recent Gmail messages
     */
    async listMessages(maxResults = 10, query = ''): Promise<DecodedEmail[]> {
        try {
            const queryParam = query ? `&q=${encodeURIComponent(query)}` : '';
            const data = await this.fetchGmail(`messages?maxResults=${maxResults}${queryParam}`);
            if (!data.messages || data.messages.length === 0) {
                return [];
            }

            // Fetch details in parallel
            const detailPromises = data.messages.map((m: { id: string }) => 
                this.getMessageDetails(m.id).catch(() => null)
            );
            const details = await Promise.all(detailPromises);
            return details.filter((d): d is DecodedEmail => d !== null);
        } catch (error: any) {
            console.error('[gmailService] Failed listing messages:', error);
            throw error;
        }
    },

    /**
     * Fetches details and parses a single Gmail message
     */
    async getMessageDetails(id: string): Promise<DecodedEmail> {
        const msg: GmailMessage = await this.fetchGmail(`messages/${id}`);
        const headers = msg.payload?.headers || [];
        
        const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
        const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || 'Me';
        const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';

        const parsedBody = extractBody(msg.payload);

        return {
            id: msg.id,
            subject,
            from,
            to,
            date,
            snippet: msg.snippet || '',
            body: parsedBody,
            labels: msg.labelIds || []
        };
    },

    /**
     * Sends an authorized email message
     */
    async sendMessage(to: string, subject: string, bodyContent: string): Promise<void> {
        const emailLines = [
            `To: ${to}`,
            `Subject: ${subject}`,
            'Content-Type: text/plain; charset=utf-8',
            'MIME-Version: 1.0',
            '',
            bodyContent
        ];
        const rawEmail = emailLines.join('\r\n');
        const encodedEmail = base64UrlEncode(rawEmail);

        await this.fetchGmail('messages/send', {
            method: 'POST',
            body: JSON.stringify({
                raw: encodedEmail
            })
        });
    },

    /**
     * Deletes / trashes a specific message
     */
    async trashMessage(id: string): Promise<void> {
        await this.fetchGmail(`messages/${id}/trash`, {
            method: 'POST'
        });
    }
};
