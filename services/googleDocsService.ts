import { getAccessToken } from './firebaseAuthService';

export interface GoogleDocument {
    documentId: string;
    title: string;
    bodyContent?: string;
}

export const googleDocsService = {
    /**
     * Helper to perform authorized Google Docs API requests
     */
    async fetchDocs(endpoint: string, options: RequestInit = {}): Promise<any> {
        const token = await getAccessToken();
        if (!token) {
            throw new Error('No active Google Docs connection. Please sign in with Google.');
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const res = await fetch(`https://docs.googleapis.com/v1/${endpoint}`, {
            ...options,
            headers
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            if (res.status === 401) {
                throw new Error('Google Docs connection expired. Please reconnect.');
            }
            throw new Error(`Google Docs API error (${res.status}): ${errBody || res.statusText}`);
        }

        if (res.status === 204) return null;
        return res.json();
    },

    /**
     * List documents (utilizing Drive API to filter by document mimeType)
     */
    async listDocuments(pageSize = 30, search = ''): Promise<any[]> {
        const token = await getAccessToken();
        if (!token) {
            throw new Error('No active Google Docs connection.');
        }

        let q = "mimeType = 'application/vnd.google-apps.document' and trashed = false";
        if (search.trim()) {
            q += ` and name contains '${search.replace(/'/g, "\\'")}'`;
        }

        const fields = 'files(id, name, modifiedTime, webViewLink)';
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            throw new Error(`Google Drive API query error: ${errBody || res.statusText}`);
        }

        const data = await res.json();
        return data.files || [];
    },

    /**
     * Fetch document structural info and text
     */
    async getDocument(documentId: string): Promise<GoogleDocument> {
        const data = await this.fetchDocs(`documents/${documentId}`);
        
        // Extract plain text from the document body
        let text = '';
        if (data.body && data.body.content) {
            for (const element of data.body.content) {
                if (element.paragraph && element.paragraph.elements) {
                    for (const run of element.paragraph.elements) {
                        if (run.textRun && run.textRun.content) {
                            text += run.textRun.content;
                        }
                    }
                }
            }
        }

        return {
            documentId: data.documentId,
            title: data.title,
            bodyContent: text
        };
    },

    /**
     * Create a new empty Google Doc
     */
    async createDocument(title: string): Promise<GoogleDocument> {
        const data = await this.fetchDocs('documents', {
            method: 'POST',
            body: JSON.stringify({ title })
        });
        return {
            documentId: data.documentId,
            title: data.title
        };
    },

    /**
     * Append text to a Google Doc
     */
    async appendText(documentId: string, text: string): Promise<void> {
        await this.fetchDocs(`documents/${documentId}:batchUpdate`, {
            method: 'POST',
            body: JSON.stringify({
                requests: [
                    {
                        insertText: {
                            text,
                            endOfSegmentLocation: {}
                        }
                    }
                ]
            })
        });
    },

    /**
     * Replace document content or rewrite it completely
     */
    async replaceContent(documentId: string, text: string): Promise<void> {
        // To rewrite completely, we first get the document length, then delete it and insert new text.
        // But a simpler approach is fetching current length or using a batchUpdate with a broad range.
        const currentDoc = await this.getDocument(documentId);
        const currentLen = currentDoc.bodyContent?.length || 0;

        const requests: any[] = [];
        if (currentLen > 1) {
            requests.push({
                deleteContentRange: {
                    range: {
                        startIndex: 1,
                        endIndex: currentLen
                    }
                }
            });
        }
        requests.push({
            insertText: {
                text,
                location: {
                    index: 1
                }
            }
        });

        await this.fetchDocs(`documents/${documentId}:batchUpdate`, {
            method: 'POST',
            body: JSON.stringify({ requests })
        });
    }
};
