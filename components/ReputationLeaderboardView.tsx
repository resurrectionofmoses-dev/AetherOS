import React, { useState, useEffect } from 'react';
import { 
    Award, Search, ThumbsUp, MessageSquare, Zap, 
    Trophy, ArrowUp, Crown, User, Activity, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { reputationService, LeaderboardUser } from '../services/reputationService';
import type { UserProfile } from '../types';

interface ReputationLeaderboardViewProps {
    profile: UserProfile;
    onSetView?: (view: string) => void;
}

export const ReputationLeaderboardView: React.FC<ReputationLeaderboardViewProps> = ({ profile, onSetView }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [tierFilter, setTierFilter] = useState<'all' | 'legendary' | 'elite' | 'sovereign' | 'verifier'>('all');
    const [reputationMetric, setReputationMetric] = useState<'global' | 'projects' | 'social'>('global');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadLeaderboard = async () => {
        try {
            const data = await reputationService.getLeaderboard(profile.username || 'Aetheros_Prime');
            setLeaderboard(data);
        } catch (error) {
            console.error("Failed to load reputation leaderboard:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadLeaderboard();
    }, [profile.username]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadLeaderboard();
    };

    // Dynamically sort based on selected metric
    const sortedLeaderboard = [...leaderboard].sort((a, b) => {
        if (reputationMetric === 'projects') {
            return b.projectLikes - a.projectLikes;
        } else if (reputationMetric === 'social') {
            return b.forumUpvotes - a.forumUpvotes;
        } else {
            return b.reputationScore - a.reputationScore;
        }
    });

    // Filter results
    const filteredLeaderboard = sortedLeaderboard.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              user.role.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (tierFilter === 'all') return matchesSearch;
        
        const badgeNameLower = user.badgeName.toLowerCase();
        if (tierFilter === 'legendary') return matchesSearch && badgeNameLower.includes('legend');
        if (tierFilter === 'elite') return matchesSearch && badgeNameLower.includes('elite');
        if (tierFilter === 'sovereign') return matchesSearch && badgeNameLower.includes('sovereign');
        if (tierFilter === 'verifier') return matchesSearch && (badgeNameLower.includes('verifier') || badgeNameLower.includes('catalyst'));
        
        return matchesSearch;
    });

    // Get current value based on metric
    const getMetricValue = (user: LeaderboardUser) => {
        if (reputationMetric === 'projects') return user.projectLikes;
        if (reputationMetric === 'social') return user.forumUpvotes;
        return user.reputationScore;
    };

    // Stats calculations
    const totalUsers = leaderboard.length;
    const totalNetworkScore = leaderboard.reduce((acc, curr) => acc + getMetricValue(curr), 0);
    const avgScore = totalUsers > 0 ? Math.round(totalNetworkScore / totalUsers) : 0;
    const topPerformer = sortedLeaderboard[0];

    // Current user status
    const currentUserRank = sortedLeaderboard.findIndex(u => u.isCurrentUser) + 1;
    const currentUserData = sortedLeaderboard.find(u => u.isCurrentUser);

    return (
        <div className="flex-1 overflow-y-auto bg-[#020205] text-zinc-100 font-mono p-4 md:p-8 relative">
            {/* Background cybernetic grid lines */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(244,63,94,0.02)_1px,_transparent_1px),_linear-gradient(90deg,rgba(244,63,94,0.02)_1px,_transparent_1px)] bg-[length:32px_32px] opacity-70" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.05),transparent_60%)]" />

            <div className="max-w-6xl mx-auto space-y-6 relative z-10">
                {/* Header Block */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-950/40 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-amber-500 animate-pulse" />
                            <h1 className="text-3xl font-black uppercase tracking-widest text-white">
                                AetherOS Reputation Leaderboard
                            </h1>
                        </div>
                        <p className="text-xs text-rose-400/80 uppercase tracking-widest">
                            Real-time Node Status, Cognitive Authority, & Consensus Standings
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 px-4 py-2 border border-rose-900/50 hover:border-rose-600 bg-rose-950/20 hover:bg-rose-950/40 rounded-xl text-rose-400 text-xs transition-all active:scale-95 cursor-pointer font-bold uppercase tracking-wider"
                            disabled={refreshing}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>{refreshing ? 'Syncing...' : 'Sync Standings'}</span>
                        </button>
                        {onSetView && (
                            <button
                                onClick={() => onSetView('user_profile')}
                                className="px-4 py-2 border-2 border-rose-600 hover:border-rose-400 bg-rose-950/40 text-rose-400 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-[3px_3px_0_0_rgba(244,63,94,0.3)] hover:shadow-[1px_1px_0_0_rgba(244,63,94,0.3)]"
                            >
                                My Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Dashboard Stats Panel */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-zinc-950/60 border border-zinc-900/80 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group hover:border-rose-900/40 transition-all">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Crown className="w-16 h-16 text-rose-500" />
                        </div>
                        <div className="p-3 bg-rose-950/40 border border-rose-900/30 rounded-xl text-rose-400">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest block">Network Leader</span>
                            <span className="text-sm font-bold text-white truncate max-w-[140px] block">
                                {loading ? '...' : topPerformer ? `@${topPerformer.username}` : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-zinc-950/60 border border-zinc-900/80 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group hover:border-teal-900/40 transition-all">
                        <div className="p-3 bg-teal-950/40 border border-teal-900/30 rounded-xl text-teal-400">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest block">Active Nodes</span>
                            <span className="text-xl font-bold text-white block">
                                {loading ? '...' : totalUsers}
                            </span>
                        </div>
                    </div>

                    <div className="bg-zinc-950/60 border border-zinc-900/80 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group hover:border-amber-900/40 transition-all">
                        <div className="p-3 bg-amber-950/40 border border-amber-900/30 rounded-xl text-amber-400">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest block">Avg {reputationMetric}</span>
                            <span className="text-xl font-bold text-white block">
                                {loading ? '...' : `${avgScore} Pt`}
                            </span>
                        </div>
                    </div>

                    <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-rose-950/30 to-purple-950/20 border border-rose-900/30 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Zap className="w-16 h-16 text-rose-400" />
                        </div>
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[9px] text-rose-400 uppercase font-black tracking-widest block">Your Standing</span>
                            <span className="text-sm font-bold text-white block truncate">
                                {loading ? '...' : currentUserData ? `Rank #${currentUserRank} (${getMetricValue(currentUserData)} Pt)` : 'Rank N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metric Tab Toggle System */}
                <div className="border border-rose-950/40 bg-zinc-950/80 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_15px_rgba(244,63,94,0.05)]">
                    <span className="text-[10px] text-rose-400/80 font-black uppercase tracking-widest pl-2 flex items-center gap-2">
                        <Award className="w-4 h-4 text-rose-500" />
                        Reputation Category
                    </span>
                    <div className="grid grid-cols-3 gap-1 w-full sm:w-auto min-w-[280px] sm:min-w-[400px]">
                        <button
                            onClick={() => setReputationMetric('global')}
                            className={`py-2 px-3 text-[10px] rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                reputationMetric === 'global'
                                    ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                            }`}
                        >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>Global</span>
                        </button>
                        <button
                            onClick={() => setReputationMetric('projects')}
                            className={`py-2 px-3 text-[10px] rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                reputationMetric === 'projects'
                                    ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                            }`}
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Projects</span>
                        </button>
                        <button
                            onClick={() => setReputationMetric('social')}
                            className={`py-2 px-3 text-[10px] rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                                reputationMetric === 'social'
                                    ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                            }`}
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Social</span>
                        </button>
                    </div>
                </div>

                {/* Top 3 Podium Cards */}
                {!loading && sortedLeaderboard.length >= 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {/* 2nd Place Card */}
                        {sortedLeaderboard[1] && (
                            <div className="bg-zinc-950/80 border-2 border-zinc-700/60 p-5 rounded-2xl flex flex-col items-center text-center relative overflow-hidden order-2 md:order-1 hover:border-zinc-500 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                                <div className="absolute top-3 left-3 px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-black rounded uppercase">
                                    Rank 2
                                </div>
                                <div className="w-12 h-12 bg-zinc-800 border-2 border-zinc-500 text-zinc-400 rounded-full flex items-center justify-center font-black text-xl mb-3 shadow-[0_0_15px_rgba(156,163,175,0.2)]">
                                    II
                                </div>
                                <span className="font-bold text-white text-base">@{sortedLeaderboard[1].username}</span>
                                <span className="text-[10px] text-zinc-500 uppercase mt-0.5 block font-bold">{sortedLeaderboard[1].role}</span>
                                <span className={`mt-2.5 px-2 py-0.5 rounded text-[9px] font-bold border ${sortedLeaderboard[1].badgeClass}`}>
                                    {sortedLeaderboard[1].badgeName}
                                </span>
                                <div className="flex gap-4 mt-4 text-[11px] text-zinc-400 pt-3 border-t border-zinc-900/40 w-full justify-center">
                                    <span className="flex items-center gap-1" title="Forum Upvotes"><MessageSquare className="w-3.5 h-3.5 text-zinc-500" /> {sortedLeaderboard[1].forumUpvotes}</span>
                                    <span className="flex items-center gap-1" title="Showcase Likes"><ThumbsUp className="w-3.5 h-3.5 text-zinc-500" /> {sortedLeaderboard[1].projectLikes}</span>
                                </div>
                                <div className="mt-4 text-zinc-300 font-bold text-sm bg-zinc-900 border border-zinc-800 py-1 px-4 rounded-xl">
                                    {getMetricValue(sortedLeaderboard[1])} Pt
                                </div>
                            </div>
                        )}

                        {/* 1st Place Card - Main Winner */}
                        {sortedLeaderboard[0] && (
                            <div className="bg-zinc-950 border-2 border-amber-500/80 p-6 rounded-3xl flex flex-col items-center text-center relative overflow-hidden order-1 md:order-2 hover:border-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.15)] md:-translate-y-2">
                                <div className="absolute top-4 left-4 px-2.5 py-0.5 bg-amber-950/80 text-amber-400 border border-amber-600/50 text-[10px] font-black rounded uppercase tracking-wider flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    <span>Rank 1</span>
                                </div>
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-950 to-yellow-950 border-2 border-amber-500 text-amber-400 rounded-full flex items-center justify-center font-black text-2xl mb-3 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse">
                                    👑
                                </div>
                                <span className="font-bold text-white text-lg">@{sortedLeaderboard[0].username}</span>
                                <span className="text-[10px] text-amber-500/90 uppercase mt-0.5 block font-black">{sortedLeaderboard[0].role}</span>
                                <span className={`mt-2.5 px-3 py-1 rounded text-[10px] font-black border uppercase tracking-wider shadow-md ${sortedLeaderboard[0].badgeClass}`}>
                                    {sortedLeaderboard[0].badgeName}
                                </span>
                                <div className="flex gap-6 mt-5 text-[12px] text-zinc-400 pt-3 border-t border-amber-950/30 w-full justify-center">
                                    <span className="flex items-center gap-1.5" title="Forum Upvotes"><MessageSquare className="w-4 h-4 text-amber-600" /> {sortedLeaderboard[0].forumUpvotes}</span>
                                    <span className="flex items-center gap-1.5" title="Showcase Likes"><ThumbsUp className="w-4 h-4 text-rose-600" /> {sortedLeaderboard[0].projectLikes}</span>
                                </div>
                                <div className="mt-5 text-amber-300 font-extrabold text-base bg-amber-950/50 border border-amber-600/40 py-1.5 px-6 rounded-2xl shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                                    {getMetricValue(sortedLeaderboard[0])} Pt
                                </div>
                            </div>
                        )}

                        {/* 3rd Place Card */}
                        {sortedLeaderboard[2] && (
                            <div className="bg-zinc-950/80 border-2 border-amber-900/40 p-5 rounded-2xl flex flex-col items-center text-center relative overflow-hidden order-3 hover:border-amber-900/80 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                                <div className="absolute top-3 left-3 px-2 py-0.5 bg-zinc-900 text-amber-600 border border-amber-900/40 text-[10px] font-black rounded uppercase">
                                    Rank 3
                                </div>
                                <div className="w-12 h-12 bg-amber-950/20 border-2 border-amber-800 text-amber-700 rounded-full flex items-center justify-center font-black text-xl mb-3 shadow-[0_0_15px_rgba(180,83,9,0.15)]">
                                    III
                                </div>
                                <span className="font-bold text-white text-base">@{sortedLeaderboard[2].username}</span>
                                <span className="text-[10px] text-zinc-500 uppercase mt-0.5 block font-bold">{sortedLeaderboard[2].role}</span>
                                <span className={`mt-2.5 px-2 py-0.5 rounded text-[9px] font-bold border ${sortedLeaderboard[2].badgeClass}`}>
                                    {sortedLeaderboard[2].badgeName}
                                </span>
                                <div className="flex gap-4 mt-4 text-[11px] text-zinc-400 pt-3 border-t border-zinc-900/40 w-full justify-center">
                                    <span className="flex items-center gap-1" title="Forum Upvotes"><MessageSquare className="w-3.5 h-3.5 text-zinc-500" /> {sortedLeaderboard[2].forumUpvotes}</span>
                                    <span className="flex items-center gap-1" title="Showcase Likes"><ThumbsUp className="w-3.5 h-3.5 text-zinc-500" /> {sortedLeaderboard[2].projectLikes}</span>
                                </div>
                                <div className="mt-4 text-amber-600/90 font-bold text-sm bg-zinc-900 border border-zinc-800 py-1 px-4 rounded-xl">
                                    {getMetricValue(sortedLeaderboard[2])} Pt
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Filter and Search controls */}
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Find Node operator / role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-xs py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:border-rose-600 font-mono"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {(['all', 'legendary', 'elite', 'sovereign', 'verifier'] as const).map(tier => (
                            <button
                                key={tier}
                                onClick={() => setTierFilter(tier)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                    tierFilter === tier 
                                        ? 'bg-rose-950/80 text-rose-400 border-rose-500' 
                                        : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:border-zinc-850 hover:text-zinc-300'
                                }`}
                            >
                                {tier}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leaderboard Table List */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-zinc-900 bg-zinc-950/80 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                                    <th className="py-4 px-6 text-center w-20">Rank</th>
                                    <th className="py-4 px-4">Operator Node</th>
                                    <th className="py-4 px-4 hidden md:table-cell">Assigned Authority Role</th>
                                    <th className="py-4 px-4 hidden sm:table-cell">Cognitive Tier Badge</th>
                                    <th className="py-4 px-4 text-center">Forum Upvotes</th>
                                    <th className="py-4 px-4 text-center">Showcase Likes</th>
                                    <th className="py-4 px-6 text-right w-36">Points ({reputationMetric})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900 text-xs">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-zinc-500">
                                            <span className="inline-block animate-ping w-2.5 h-2.5 bg-rose-500 rounded-full mr-2.5" />
                                            Reading AetherOS chain logs...
                                        </td>
                                    </tr>
                                ) : filteredLeaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-zinc-500 uppercase">
                                            No operator nodes found matching the criteria
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeaderboard.map((user, index) => {
                                        const globalIndex = sortedLeaderboard.findIndex(u => u.username === user.username) + 1;
                                        return (
                                            <tr 
                                                key={user.username}
                                                className={`transition-all duration-150 ${
                                                    user.isCurrentUser 
                                                        ? 'bg-rose-950/15 hover:bg-rose-950/20 border-l-4 border-l-rose-500 shadow-[inset_4px_0_0_0_#f43f5e]' 
                                                        : 'hover:bg-zinc-900/30'
                                                }`}
                                            >
                                                {/* Rank column */}
                                                <td className="py-4 px-6 text-center font-bold">
                                                    <div className="flex justify-center items-center">
                                                        {globalIndex === 1 ? (
                                                            <span className="text-lg" title="1st Place">👑</span>
                                                        ) : globalIndex === 2 ? (
                                                            <span className="text-base text-zinc-400" title="2nd Place">🥈</span>
                                                        ) : globalIndex === 3 ? (
                                                            <span className="text-base text-amber-700" title="3rd Place">🥉</span>
                                                        ) : (
                                                            <span className="text-zinc-500">#{globalIndex}</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Username column */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-bold hover:text-rose-400 transition-colors">
                                                            @{user.username}
                                                        </span>
                                                        {user.isCurrentUser && (
                                                            <span className="px-1.5 py-0.5 bg-rose-950 text-rose-400 text-[8px] font-black rounded uppercase border border-rose-500/30">
                                                                YOU
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Role column */}
                                                <td className="py-4 px-4 text-zinc-400 hidden md:table-cell font-bold">
                                                    {user.role}
                                                </td>

                                                {/* Badge column */}
                                                <td className="py-4 px-4 hidden sm:table-cell">
                                                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border ${user.badgeClass}`}>
                                                        {user.badgeName}
                                                    </span>
                                                </td>

                                                {/* Forum upvotes column */}
                                                <td className={`py-4 px-4 text-center font-bold transition-all ${reputationMetric === 'social' ? 'bg-rose-500/5 text-rose-400' : 'text-zinc-300'}`}>
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <MessageSquare className="w-3.5 h-3.5 text-zinc-650" />
                                                        <span>{user.forumUpvotes}</span>
                                                    </div>
                                                </td>

                                                {/* Project showcase likes column */}
                                                <td className={`py-4 px-4 text-center font-bold transition-all ${reputationMetric === 'projects' ? 'bg-rose-500/5 text-rose-400' : 'text-zinc-300'}`}>
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <ThumbsUp className="w-3.5 h-3.5 text-zinc-650" />
                                                        <span>{user.projectLikes}</span>
                                                    </div>
                                                </td>

                                                {/* Total score column */}
                                                <td className="py-4 px-6 text-right font-black text-white text-sm">
                                                    <div className="inline-block bg-zinc-900 border border-zinc-800/80 px-3 py-1 rounded-lg">
                                                        {getMetricValue(user)} Pt
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer and Explanatory Section */}
                <div className="bg-zinc-950/40 border border-zinc-900/60 p-5 rounded-2xl space-y-2">
                    <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-current" />
                        Reputation Computation Formula
                    </h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">
                        The score is derived from on-chain forum interactions and project creations: 
                        <span className="text-zinc-300 font-bold ml-1">1 Upvote on your question/answer = +1 Point</span> • 
                        <span className="text-zinc-300 font-bold ml-1">1 Like on your Showcase project = +1 Point</span>. 
                        Tiers are synchronized dynamically as consensus changes.
                    </p>
                </div>
            </div>
        </div>
    );
};
