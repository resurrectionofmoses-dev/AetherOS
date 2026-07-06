import { getAccessToken } from './firebaseAuthService';

export interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime: string;
    webViewLink?: string;
    iconLink?: string;
    thumbnailLink?: string;
    parents?: string[];
}

export const googleDriveService = {
    /**
     * Checks if Google Access Token is currently cached
     */
    async hasConnection(): Promise<boolean> {
        const token = await getAccessToken();
        return !!token;
    },

    /**
     * Helper to perform authorized Google Drive API requests
     */
    async fetchDrive(endpoint: string, options: RequestInit = {}): Promise<any> {
        const token = await getAccessToken();
        if (!token) {
            throw new Error('No active Google Drive connection. Please sign in with Google to grant permission.');
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const res = await fetch(`https://www.googleapis.com/drive/v3/${endpoint}`, {
            ...options,
            headers
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            if (res.status === 401) {
                throw new Error('Google Drive connection expired. Please reconnect to continue.');
            }
            throw new Error(`Google Drive API error (${res.status}): ${errBody || res.statusText}`);
        }

        if (res.status === 204) return null;
        return res.json();
    },

    /**
     * Lists files from Google Drive
     */
    async listFiles(pageSize = 30, query = ''): Promise<GoogleDriveFile[]> {
        try {
            const fields = 'files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink, thumbnailLink, parents)';
            const qParam = query ? `&q=${encodeURIComponent(query)}` : '';
            const data = await this.fetchDrive(`files?pageSize=${pageSize}&fields=${encodeURIComponent(fields)}${qParam}`);
            return data.files || [];
        } catch (error) {
            console.error('[googleDriveService] Failed listing files:', error);
            throw error;
        }
    },

    /**
     * Downloads content of a specific text-based file
     */
    async getFileContent(fileId: string): Promise<string> {
        const token = await getAccessToken();
        if (!token) {
            throw new Error('No active Google Drive connection.');
        }

        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            throw new Error(`Failed to download file: ${errBody || res.statusText}`);
        }

        return res.text();
    },

    /**
     * Deletes a specific file permanently
     */
    async deleteFile(fileId: string): Promise<void> {
        await this.fetchDrive(`files/${fileId}`, {
            method: 'DELETE'
        });
    },

    /**
     * Trashes a specific file (moves to trash)
     */
    async trashFile(fileId: string): Promise<void> {
        await this.fetchDrive(`files/${fileId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                trashed: true
            })
        });
    },

    /**
     * Creates a new folder in Google Drive
     */
    async createFolder(name: string, parentId?: string): Promise<GoogleDriveFile> {
        const parents = parentId ? [parentId] : undefined;
        return this.fetchDrive('files', {
            method: 'POST',
            body: JSON.stringify({
                name,
                mimeType: 'application/vnd.google-apps.folder',
                parents
            })
        });
    },

    /**
     * Uploads/Creates a new text-based file in Google Drive using multipart upload
     */
    async createTextFile(name: string, content: string, mimeType = 'text/plain', parentId?: string): Promise<GoogleDriveFile> {
        const token = await getAccessToken();
        if (!token) {
            throw new Error('No active Google Drive connection.');
        }

        const metadata = {
            name,
            mimeType,
            parents: parentId ? [parentId] : undefined
        };

        const boundary = 'AetherOSBoundary';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const multipartBody = 
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            `Content-Type: ${mimeType}\r\n\r\n` +
            content +
            closeDelimiter;

        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,iconLink', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `multipart/related; boundary=${boundary}`
            },
            body: multipartBody
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            throw new Error(`Failed to upload file to Google Drive: ${errBody || res.statusText}`);
        }

        return res.json();
    }
};
