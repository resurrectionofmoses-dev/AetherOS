import { getAccessToken } from './firebaseAuthService';

export interface GoogleTaskList {
    id: string;
    title: string;
    updated: string;
}

export interface GoogleTask {
    id: string;
    title: string;
    notes?: string;
    status: 'needsAction' | 'completed';
    due?: string;
    completed?: string;
}

export const googleTasksService = {
    /**
     * Helper to perform authorized Google Tasks API requests
     */
    async fetchTasks(endpoint: string, options: RequestInit = {}): Promise<any> {
        const token = await getAccessToken();
        if (!token) {
            throw new Error('No active Google Tasks connection. Please sign in with Google.');
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const res = await fetch(`https://tasks.googleapis.com/v1/${endpoint}`, {
            ...options,
            headers
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            if (res.status === 401) {
                throw new Error('Google Tasks connection expired. Please reconnect.');
            }
            throw new Error(`Google Tasks API error (${res.status}): ${errBody || res.statusText}`);
        }

        if (res.status === 204) return null;
        return res.json();
    },

    /**
     * Lists task lists for the authenticated user
     */
    async listTaskLists(): Promise<GoogleTaskList[]> {
        const data = await this.fetchTasks('users/@me/lists');
        return data.items || [];
    },

    /**
     * Creates a new task list
     */
    async createTaskList(title: string): Promise<GoogleTaskList> {
        return this.fetchTasks('users/@me/lists', {
            method: 'POST',
            body: JSON.stringify({ title })
        });
    },

    /**
     * Lists tasks within a task list
     */
    async listTasks(taskListId: string, showCompleted = true): Promise<GoogleTask[]> {
        const query = showCompleted ? '?showCompleted=true&showHidden=true' : '?showCompleted=false';
        const data = await this.fetchTasks(`lists/${taskListId}/tasks${query}`);
        return data.items || [];
    },

    /**
     * Creates a new task
     */
    async createTask(taskListId: string, title: string, notes?: string, due?: string): Promise<GoogleTask> {
        return this.fetchTasks(`lists/${taskListId}/tasks`, {
            method: 'POST',
            body: JSON.stringify({
                title,
                notes,
                due: due ? new Date(due).toISOString() : undefined
            })
        });
    },

    /**
     * Updates completion status of a task
     */
    async toggleTaskStatus(taskListId: string, taskId: string, isCompleted: boolean): Promise<GoogleTask> {
        const status = isCompleted ? 'completed' : 'needsAction';
        return this.fetchTasks(`lists/${taskListId}/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status,
                // If status is needsAction, the completed date must be cleared.
                // The API handles clearing when status is needsAction, but completed can be set or cleared.
                completed: isCompleted ? new Date().toISOString() : null
            })
        });
    },

    /**
     * Deletes a task
     */
    async deleteTask(taskListId: string, taskId: string): Promise<void> {
        await this.fetchTasks(`lists/${taskListId}/tasks/${taskId}`, {
            method: 'DELETE'
        });
    }
};
