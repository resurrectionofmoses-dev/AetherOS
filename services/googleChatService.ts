import { getAccessToken } from './firebaseAuthService';

export interface GoogleChatSpace {
    name: string; // "spaces/SPACE_ID"
    displayName: string;
    spaceType: 'SPACE' | 'DIRECT_MESSAGE' | 'GROUP_CHAT';
}

export interface GoogleChatMessage {
    name: string; // "spaces/SPACE_ID/messages/MESSAGE_ID"
    text: string;
    createTime: string;
    sender?: {
        name: string;
        displayName: string;
        avatarUrl?: string;
    };
}

export interface GoogleChatMember {
    name: string;
    member: {
        name: string;
        displayName: string;
        type: string;
    };
}

export const googleChatService = {
    /**
     * Helper to perform authorized Google Chat API requests
     */
    async fetchChat(endpoint: string, options: RequestInit = {}): Promise<any> {
        const token = await getAccessToken();
        if (!token) {
            throw new Error('No active Google Chat connection. Please sign in with Google.');
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const res = await fetch(`https://chat.googleapis.com/v1/${endpoint}`, {
            ...options,
            headers
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            if (res.status === 401) {
                throw new Error('Google Chat connection expired. Please reconnect.');
            }
            throw new Error(`Google Chat API error (${res.status}): ${errBody || res.statusText}`);
        }

        if (res.status === 204) return null;
        return res.json();
    },

    /**
     * Lists the spaces the authenticated user is a member of
     */
    async listSpaces(): Promise<GoogleChatSpace[]> {
        const data = await this.fetchChat('spaces');
        return data.spaces || [];
    },

    /**
     * Creates a new chat Space
     */
    async createSpace(displayName: string): Promise<GoogleChatSpace> {
        return this.fetchChat('spaces', {
            method: 'POST',
            body: JSON.stringify({
                spaceType: 'SPACE',
                displayName
            })
        });
    },

    /**
     * Fetch messages in a space
     */
    async listMessages(spaceName: string, pageSize = 50): Promise<GoogleChatMessage[]> {
        // spaceName is formatted as "spaces/SPACE_ID"
        const data = await this.fetchChat(`${spaceName}/messages?pageSize=${pageSize}`);
        return data.messages || [];
    },

    /**
     * Posts a new message into a space
     */
    async createMessage(spaceName: string, text: string): Promise<GoogleChatMessage> {
        return this.fetchChat(`${spaceName}/messages`, {
            method: 'POST',
            body: JSON.stringify({ text })
        });
    },

    /**
     * Deletes a message posted by this credentials
     */
    async deleteMessage(messageName: string): Promise<void> {
        // messageName is formatted as "spaces/SPACE_ID/messages/MESSAGE_ID"
        await this.fetchChat(messageName, {
            method: 'DELETE'
        });
    },

    /**
     * Lists members of a chat space
     */
    async listMembers(spaceName: string): Promise<GoogleChatMember[]> {
        const data = await this.fetchChat(`${spaceName}/members`);
        return data.membersities || data.memberships || [];
    }
};
