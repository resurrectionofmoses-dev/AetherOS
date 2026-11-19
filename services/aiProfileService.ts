import { safeStorage } from './safeStorage';
import type {
    AIDossierReport,
    ChatMessage,
    GlitchTelemetry,
    NetworkProject,
    UserProfile
} from '../types';

export interface CompileAIProfileRequest {
    identifier: string;
    githubUrl?: string;
    portfolioUrl?: string;
    email?: string;
    includeWorkspaceContext?: boolean;
    profile?: UserProfile;
    existingProfile?: UserProfile;
    projects?: NetworkProject[];
    glitchHistory?: GlitchTelemetry[];
    messages?: ChatMessage[];
}

export interface CompileAIProfileResponse {
    success: boolean;
    profileUpdates: Partial<UserProfile>;
    aiDossier: AIDossierReport;
}

export async function compileAIProfile(
    params: CompileAIProfileRequest
): Promise<CompileAIProfileResponse> {
    const includeWorkspace = params.includeWorkspaceContext !== false;

    let recentChatExcerpts: Array<{ sender: string; snippet: string }> = [];
    if (includeWorkspace) {
        let sourceMessages = params.messages;
        if (!sourceMessages || sourceMessages.length === 0) {
            try {
                const storedChat = await safeStorage.getItem('aetheros_chat_history');
                if (storedChat) {
                    const parsed = JSON.parse(storedChat);
                    if (Array.isArray(parsed)) sourceMessages = parsed;
                }
            } catch {
                // ignore malformed storage
            }
        }
        if (sourceMessages && sourceMessages.length > 0) {
            recentChatExcerpts = sourceMessages.slice(-14).map((m) => ({
                sender: m.sender || 'user',
                snippet: String(m.content || '').slice(0, 280)
            }));
        }
    }

    let glitches = params.glitchHistory || [];
    if (includeWorkspace && glitches.length === 0) {
        try {
            const storedGlitches = await safeStorage.getItem('aetheros_glitch_history');
            if (storedGlitches) {
                const parsed = JSON.parse(storedGlitches);
                if (Array.isArray(parsed)) glitches = parsed;
            }
        } catch {
            // ignore
        }
    }

    const projectSummaries = includeWorkspace
        ? (params.projects || []).slice(0, 12).map((p) => {
              const tasks = Array.isArray(p.tasks) ? p.tasks : [];
              const completed = tasks.filter((t) => t.completed).length;
              return {
                  title: p.title,
                  description: String(p.description || '').slice(0, 220),
                  status: p.status,
                  totalTasks: tasks.length,
                  completedTasks: completed,
                  unfinishedTasks: tasks.length - completed
              };
          })
        : [];

    const glitchSummaries = includeWorkspace
        ? glitches.slice(-15).map((g) => ({
              timestamp: g.timestamp,
              duration: g.duration,
              label: g.label,
              isSnapshot: Boolean(g.isSnapshot),
              activeGlitch: Boolean(g.activeGlitch),
              activityDensity: g.activityDensity,
              acousticPressure: g.acousticPressure,
              currentView: g.currentView,
              systemStatus: g.systemStatus
          }))
        : [];

    const response = await fetch('/api/ai/compile-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            identifier: params.identifier,
            githubUrl: params.githubUrl || '',
            portfolioUrl: params.portfolioUrl || '',
            email: params.email || '',
            includeWorkspaceContext: includeWorkspace,
            existingWorks: includeWorkspace
                ? ((params.profile || params.existingProfile)?.profileProjects || []).map((p) => ({
                      title: p.title,
                      roleDefined: p.roleDefined,
                      status: p.status,
                      contributionType: p.contributionType,
                      technologies: p.technologies,
                      sourceCodeUrl: p.sourceCodeUrl || p.link,
                      description: p.description
                  }))
                : [],
            workspaceContext: includeWorkspace
                ? {
                      projects: projectSummaries,
                      glitches: glitchSummaries,
                      recentChatExcerpts,
                      reputationScore: (params.profile || params.existingProfile)?.reputationScore ?? 0,
                      existingSkillsHint: (params.profile || params.existingProfile)?.skills || []
                  }
                : null
        })
    });

    let data: any = null;
    try {
        data = await response.json();
    } catch {
        throw new Error(`Profile compiler returned HTTP ${response.status}`);
    }

    if (!response.ok || !data?.success) {
        throw new Error(data?.error || `AI profile compilation failed (HTTP ${response.status})`);
    }

    return {
        success: true,
        profileUpdates: data.profileUpdates,
        aiDossier: data.aiDossier
    };
}
