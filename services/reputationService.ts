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
}

export const reputationService = new ReputationService();
