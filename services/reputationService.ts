import { safeStorage } from './safeStorage';

export interface UserReputationInfo {
    reputationScore: number;
    forumUpvotes: number;
    projectLikes: number;
    badgeName: string;
    badgeClass: string;
}

class ReputationService {
    /**
     * Calculates user reputation points derived dynamically from 
     * upvotes on forum posts (questions & answers) and project showcases.
     * 
     * @param username The username to calculate metrics for
     */
    async calculateReputation(username: string): Promise<UserReputationInfo> {
        try {
            const normalizedUsername = username || 'Aetheros_Prime';

            // 1. Forum reputation: sum of upvotes on questions and answers published by this username
            let forumUpvotes = 0;
            const savedForum = await safeStorage.getItem('AETHER_FORUM_DATA');
            if (savedForum) {
                try {
                    const questions = JSON.parse(savedForum);
                    if (Array.isArray(questions)) {
                        questions.forEach((q: any) => {
                            if (q.author === normalizedUsername) {
                                forumUpvotes += (q.upvotes || 0);
                            }
                            if (Array.isArray(q.answers)) {
                                q.answers.forEach((a: any) => {
                                    if (a.author === normalizedUsername) {
                                        forumUpvotes += (a.upvotes || 0);
                                    }
                                });
                            }
                        });
                    }
                } catch (parseError) {
                    console.error("Failed to parse AETHER_FORUM_DATA inside ReputationService", parseError);
                }
            }

            // 2. Showcase project likes: sum of likes on projects authored by this username
            let projectLikes = 0;
            const savedProjects = await safeStorage.getItem('aetheros_showcase_projects');
            if (savedProjects) {
                try {
                    const projectsList = JSON.parse(savedProjects);
                    if (Array.isArray(projectsList)) {
                        projectsList.forEach((p: any) => {
                            const author = p.author || 'Aetheros_Prime';
                            if (author === normalizedUsername && Array.isArray(p.likes)) {
                                projectLikes += p.likes.length;
                            }
                        });
                    }
                } catch (parseError) {
                    console.error("Failed to parse aetheros_showcase_projects inside ReputationService", parseError);
                }
            }

            const totalScore = Math.max(0, forumUpvotes + projectLikes);
            const badgeName = this.getBadgeName(totalScore);
            const badgeClass = this.getBadgeClass(totalScore);

            return {
                reputationScore: totalScore,
                forumUpvotes,
                projectLikes,
                badgeName,
                badgeClass
            };
        } catch (error) {
            console.error("Error calculating holistic user reputation:", error);
            return {
                reputationScore: 0,
                forumUpvotes: 0,
                projectLikes: 0,
                badgeName: 'Novice Catalyst',
                badgeClass: 'bg-zinc-950/80 text-zinc-400 border-zinc-500/20'
            };
        }
    }

    /**
     * Determines badge name corresponding to reputation scope
     */
    getBadgeName(score: number): string {
        if (score >= 100) return 'AetherOS Legendary Legend';
        if (score >= 60) return 'Elite Conduit';
        if (score >= 30) return 'Sovereign Architect';
        if (score >= 10) return 'Qualified Verifier';
        return 'Qualified Verifier'; // Fallback per profile layout default mapping or can be customized
    }

    /**
     * Determines CSS styling classes corresponding to reputation score scope
     */
    getBadgeClass(score: number): string {
        if (score >= 100) {
            return 'bg-fuchsia-950/80 text-fuchsia-400 border-fuchsia-500/50 shadow-[0_0_12px_rgba(217,70,239,0.3)]';
        }
        if (score >= 60) {
            return 'bg-rose-950/80 text-rose-400 border-rose-500/45 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse';
        }
        if (score >= 30) {
            return 'bg-amber-955/80 text-amber-400 border-amber-500/40 shadow-[0_0_6px_rgba(245,158,11,0.2)]';
        }
        if (score >= 10) {
            return 'bg-teal-950/80 text-teal-400 border-teal-500/30';
        }
        return 'bg-teal-950/80 text-teal-400 border-teal-500/30'; // Per Profile default class matching index
    }

    /**
     * Generates a fully dynamic leaderboard list of users in the network
     * based on real-time safeStorage activity mixed with legendary node presets.
     */
    async getLeaderboard(currentUsername: string): Promise<LeaderboardUser[]> {
        const normalizedCurrent = currentUsername || 'Aetheros_Prime';
        
        // Dynamic stats map for authors in the network
        const dynamicStats: Record<string, { forumUpvotes: number; projectLikes: number }> = {};

        // 1. Gather all forum upvotes
        try {
            const savedForum = await safeStorage.getItem('AETHER_FORUM_DATA');
            if (savedForum) {
                const questions = JSON.parse(savedForum);
                if (Array.isArray(questions)) {
                    questions.forEach((q: any) => {
                        if (q.author) {
                            if (!dynamicStats[q.author]) dynamicStats[q.author] = { forumUpvotes: 0, projectLikes: 0 };
                            dynamicStats[q.author].forumUpvotes += (q.upvotes || 0);
                        }
                        if (Array.isArray(q.answers)) {
                            q.answers.forEach((a: any) => {
                                if (a.author) {
                                    if (!dynamicStats[a.author]) dynamicStats[a.author] = { forumUpvotes: 0, projectLikes: 0 };
                                    dynamicStats[a.author].forumUpvotes += (a.upvotes || 0);
                                }
                            });
                        }
                    });
                }
            }
        } catch (e) {
            console.error("Leaderboard forum parse failure:", e);
        }

        // 2. Gather all project showcase likes
        try {
            const savedProjects = await safeStorage.getItem('aetheros_showcase_projects');
            if (savedProjects) {
                const projectsList = JSON.parse(savedProjects);
                if (Array.isArray(projectsList)) {
                    projectsList.forEach((p: any) => {
                        const author = p.author || 'Aetheros_Prime';
                        if (!dynamicStats[author]) dynamicStats[author] = { forumUpvotes: 0, projectLikes: 0 };
                        if (Array.isArray(p.likes)) {
                            dynamicStats[author].projectLikes += p.likes.length;
                        }
                    });
                }
            }
        } catch (e) {
            console.error("Leaderboard projects parse failure:", e);
        }

        // Presets of network players with baselines
        const presets: Record<string, { role: string; baseForum: number; baseProject: number }> = {
            'Maestro': { role: 'System Administrator', baseForum: 140, baseProject: 45 },
            'Sovereign_Admin': { role: 'Core Architect', baseForum: 85, baseProject: 30 },
            'CHAIN-X_VERIFIER': { role: 'Automated QC Node', baseForum: 65, baseProject: 15 },
            'Logic_Maestro': { role: 'Senior Conduit Developer', baseForum: 48, baseProject: 18 },
            'NullPointer_Whisperer': { role: 'Expert Member', baseForum: 32, baseProject: 10 },
            'Byte_Surgeon': { role: 'Active Conduit', baseForum: 20, baseProject: 6 },
            'Quantum_Coder': { role: 'Enthusiastic Node', baseForum: 12, baseProject: 4 },
            'Decentralized_Scribe': { role: 'Initiative Node', baseForum: 4, baseProject: 2 },
        };

        // Combine presets and dynamic stats
        const usersMap: Record<string, LeaderboardUser> = {};

        // Initialize presets
        Object.entries(presets).forEach(([username, meta]) => {
            const dynamic = dynamicStats[username] || { forumUpvotes: 0, projectLikes: 0 };
            const finalForum = meta.baseForum + dynamic.forumUpvotes;
            const finalProject = meta.baseProject + dynamic.projectLikes;
            const score = finalForum + finalProject;
            
            usersMap[username] = {
                username,
                forumUpvotes: finalForum,
                projectLikes: finalProject,
                reputationScore: score,
                badgeName: this.getBadgeName(score),
                badgeClass: this.getBadgeClass(score),
                role: meta.role,
                isCurrentUser: username === normalizedCurrent
            };
        });

        // Add or merge current user (if different from presets, or ensure current user is represented)
        const currentUserStats = dynamicStats[normalizedCurrent] || { forumUpvotes: 0, projectLikes: 0 };
        if (usersMap[normalizedCurrent]) {
            // Already initialized as preset, mark as current user
            usersMap[normalizedCurrent].isCurrentUser = true;
        } else {
            // New user, calculate their score
            const score = currentUserStats.forumUpvotes + currentUserStats.projectLikes;
            usersMap[normalizedCurrent] = {
                username: normalizedCurrent,
                forumUpvotes: currentUserStats.forumUpvotes,
                projectLikes: currentUserStats.projectLikes,
                reputationScore: score,
                badgeName: this.getBadgeName(score),
                badgeClass: this.getBadgeClass(score),
                role: 'Sovereign operator',
                isCurrentUser: true
            };
        }

        // Add any other dynamic authors who are not presets
        Object.entries(dynamicStats).forEach(([username, stats]) => {
            if (!usersMap[username]) {
                const score = stats.forumUpvotes + stats.projectLikes;
                usersMap[username] = {
                    username,
                    forumUpvotes: stats.forumUpvotes,
                    projectLikes: stats.projectLikes,
                    reputationScore: score,
                    badgeName: this.getBadgeName(score),
                    badgeClass: this.getBadgeClass(score),
                    role: 'Conduit Peer',
                    isCurrentUser: username === normalizedCurrent
                };
            }
        });

        // Convert to array and sort descending by reputation score
        return Object.values(usersMap).sort((a, b) => b.reputationScore - a.reputationScore);
    }
}

export interface LeaderboardUser {
    username: string;
    reputationScore: number;
    forumUpvotes: number;
    projectLikes: number;
    badgeName: string;
    badgeClass: string;
    role: string;
    isCurrentUser?: boolean;
}

export const reputationService = new ReputationService();
