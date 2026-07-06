import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ThumbsUp, ExternalLink, Code, MessageSquare, Plus, Trash2, User, Globe } from 'lucide-react';
import { ProfileProject, ProfileProjectTestimonial } from '../types';

interface PortfolioProjectCardProps {
    project: ProfileProject;
    isOwnProject: boolean;
    onAddTestimonial?: (projectId: string, testimonial: ProfileProjectTestimonial) => void;
    onEndorse?: (projectId: string) => void;
    onRate?: (projectId: string, rating: number) => void;
    currentUsername?: string;
    ownerSkills?: string[];
    ownerSkillEndorsements?: Record<string, string[]>;
    onQuickEndorse?: (skillName: string) => void;
}

export const PortfolioProjectCard: React.FC<PortfolioProjectCardProps> = ({
    project,
    isOwnProject,
    onAddTestimonial,
    onEndorse,
    onRate,
    currentUsername = 'Operator-You',
    ownerSkills = [],
    ownerSkillEndorsements = {},
    onQuickEndorse
}) => {
    const [showTestimonials, setShowTestimonials] = useState(false);
    const [showQuickEndorseSkills, setShowQuickEndorseSkills] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [authorName, setAuthorName] = useState(currentUsername === 'Operator-You' ? '' : currentUsername);

    const averageRating = project.rating || 5;
    const endorsementsCount = (project.endorsements || []).length;
    const hasEndorsed = (project.endorsements || []).includes(currentUsername);

    const handleAddTestimonialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const finalAuthor = authorName.trim() || currentUsername;
        const testimonial: ProfileProjectTestimonial = {
            id: `test_${Date.now()}`,
            author: finalAuthor,
            rating: newRating,
            comment: newComment.trim(),
            timestamp: Date.now()
        };

        if (onAddTestimonial) {
            onAddTestimonial(project.id, testimonial);
        }

        setNewComment('');
        setNewRating(5);
        if (currentUsername === 'Operator-You') {
            setAuthorName('');
        }
    };

    return (
        <div className="bg-[#0c0c1b] border border-zinc-900 rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl">
            {/* Top Header */}
            <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h4 className="text-sm font-extrabold text-white tracking-tight uppercase font-mono">{project.title}</h4>
                        <div className="text-[10px] text-purple-400 font-mono uppercase mt-0.5">
                            Role: {project.roleDefined || 'Creator / Architect'}
                        </div>
                    </div>
                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                        project.status === 'current' 
                        ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/10' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}>
                        {project.status === 'current' ? 'In Progress' : 'Completed'}
                    </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans">{project.description}</p>
            </div>

            {/* Technologies */}
            {(project.technologies || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.technologies?.map((tech) => (
                        <span 
                            key={tech} 
                            className="text-[9px] font-mono bg-purple-950/20 text-purple-400 border border-purple-900/30 px-2 py-0.5 rounded-md uppercase font-bold"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            )}

            {/* Project Links Section */}
            {(project.link || project.liveDemoUrl || project.sourceCodeUrl) && (
                <div className="flex flex-wrap gap-3 pt-2 border-t border-zinc-950">
                    {project.link && (
                        <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors"
                        >
                            <ExternalLink className="w-3 h-3 text-purple-500" />
                            <span>Primary Link</span>
                        </a>
                    )}
                    {project.liveDemoUrl && (
                        <a 
                            href={project.liveDemoUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors"
                        >
                            <Globe className="w-3 h-3 text-emerald-500" />
                            <span>Live Demo</span>
                        </a>
                    )}
                    {project.sourceCodeUrl && (
                        <a 
                            href={project.sourceCodeUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors"
                        >
                            <Code className="w-3 h-3 text-blue-500" />
                            <span>Source Code</span>
                        </a>
                    )}
                </div>
            )}

            {/* Interactive Section for Endorsements & Rating */}
            <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-900/60 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* Rating display / interact */}
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono">Rating:</span>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(starVal => (
                                <button 
                                    key={starVal}
                                    onClick={() => onRate && onRate(project.id, starVal)}
                                    disabled={isOwnProject}
                                    className={`transition-colors duration-150 ${isOwnProject ? 'cursor-default' : 'hover:text-yellow-400 cursor-pointer'}`}
                                    title={isOwnProject ? `Rating is ${averageRating}` : `Rate ${starVal} Stars`}
                                >
                                    <Star className={`w-3 h-3 ${starVal <= Math.round(averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-700'}`} />
                                </button>
                            ))}
                        </div>
                        <span className="text-[9px] font-mono font-bold text-zinc-400 ml-1">({averageRating.toFixed(1)})</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Endorse Button */}
                        <button 
                            onClick={() => onEndorse && onEndorse(project.id)}
                            disabled={isOwnProject}
                            className={`px-2.5 py-1 rounded text-[8px] font-mono tracking-wider transition-all uppercase flex items-center gap-1 ${
                                isOwnProject 
                                ? 'bg-zinc-900/30 text-zinc-650 border border-zinc-850/20 cursor-not-allowed'
                                : hasEndorsed 
                                    ? 'bg-purple-650 text-white font-extrabold shadow-md' 
                                    : 'bg-zinc-900 border border-zinc-800 text-purple-400 hover:bg-zinc-850 cursor-pointer'
                            }`}
                        >
                            <ThumbsUp className="w-2.5 h-2.5" />
                            <span>{isOwnProject ? `${endorsementsCount} ENDORSEMENTS` : hasEndorsed ? 'ENDORSED' : `ENDORSE (${endorsementsCount})`}</span>
                        </button>

                        {/* Quick Endorse Button */}
                        {!isOwnProject && ownerSkills && ownerSkills.length > 0 && (
                            <button 
                                type="button"
                                onClick={() => setShowQuickEndorseSkills(!showQuickEndorseSkills)}
                                className={`px-2.5 py-1 rounded text-[8px] font-mono tracking-wider transition-all uppercase flex items-center gap-1 border ${
                                    showQuickEndorseSkills 
                                        ? 'bg-purple-600 text-black font-black border-purple-500 shadow-md shadow-purple-500/10' 
                                        : 'bg-zinc-900 border-zinc-800 text-purple-400 hover:bg-zinc-850 hover:border-purple-500/40 cursor-pointer'
                                }`}
                                title="Quick endorse owner skills"
                            >
                                <Star className="w-2.5 h-2.5" />
                                <span>Quick Endorse</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Endorse Skills Selection Panel */}
                <AnimatePresence>
                    {showQuickEndorseSkills && !isOwnProject && ownerSkills && ownerSkills.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-zinc-900/60 pt-3 mt-1 space-y-2"
                        >
                            <span className="text-[9px] uppercase font-black text-purple-400 tracking-wider block font-mono">
                                Single-click a skill to endorse the project owner:
                            </span>
                            <div className="flex flex-wrap gap-1.5 pb-1 select-none">
                                {ownerSkills.map(skill => {
                                    const endorsers = ownerSkillEndorsements?.[skill] || [];
                                    const alreadyEndorsed = endorsers.includes(currentUsername);
                                    return (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => onQuickEndorse?.(skill)}
                                            className={`px-2 py-1 rounded text-[9px] font-mono tracking-wider transition-all uppercase flex items-center gap-1 border cursor-pointer ${
                                                alreadyEndorsed
                                                    ? 'bg-purple-950/40 border-purple-500 text-purple-400 font-extrabold shadow-[0_0_8px_rgba(147,51,234,0.1)]'
                                                    : 'bg-zinc-900/60 border-zinc-850/60 text-zinc-400 hover:border-purple-500 hover:text-white'
                                            }`}
                                            title={alreadyEndorsed ? `Retract endorsement for ${skill}` : `Endorse owner for ${skill}`}
                                        >
                                            <ThumbsUp className="w-2.5 h-2.5" />
                                            <span>{skill} {endorsers.length > 0 ? `(${endorsers.length})` : ''}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Testimonials Toggler */}
                <div className="flex items-center justify-between border-t border-zinc-900/80 pt-2 text-[9px] text-zinc-500">
                    <button 
                        onClick={() => setShowTestimonials(!showTestimonials)}
                        className="flex items-center gap-1 text-zinc-400 hover:text-purple-400 font-mono uppercase font-black cursor-pointer"
                    >
                        <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                        <span>Testimonials & Comments ({(project.testimonials || []).length})</span>
                    </button>
                    {project.endorsements && project.endorsements.length > 0 && (
                        <span className="text-zinc-600 truncate max-w-[120px] font-mono">
                            By: {project.endorsements.join(', ')}
                        </span>
                    )}
                </div>
            </div>

            {/* Testimonials Panel Drawer */}
            <AnimatePresence>
                {showTestimonials && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-3 bg-[#080814] p-3 rounded-xl border border-zinc-950/80"
                    >
                        {/* Testimonials List */}
                        <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                            {(project.testimonials || []).length === 0 ? (
                                <p className="text-[10px] text-zinc-600 italic font-mono py-2 text-center">No testimonials or comments yet. Add the first one!</p>
                            ) : (
                                project.testimonials?.map((t) => (
                                    <div key={t.id} className="bg-black/30 border border-zinc-900/50 p-2.5 rounded-lg space-y-1">
                                        <div className="flex justify-between items-center text-[9px]">
                                            <span className="font-mono font-black text-purple-400">@{t.author}</span>
                                            <div className="flex items-center gap-1 text-zinc-500">
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(v => (
                                                        <Star key={v} className={`w-2 h-2 ${v <= t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-800'}`} />
                                                    ))}
                                                </div>
                                                <span>•</span>
                                                <span className="font-mono text-[8px]">{new Date(t.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-zinc-350 leading-relaxed font-sans">{t.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Leave a Comment Form */}
                        <form onSubmit={handleAddTestimonialSubmit} className="border-t border-zinc-900/60 pt-3.5 space-y-2">
                            <span className="text-[9px] uppercase font-black text-purple-400 tracking-wider block font-mono">Recommend this Project</span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {currentUsername === 'Operator-You' && (
                                    <input 
                                        type="text"
                                        placeholder="Your signature/username..."
                                        value={authorName}
                                        onChange={e => setAuthorName(e.target.value)}
                                        className="bg-black border border-zinc-850 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-purple-500 font-mono"
                                        required
                                    />
                                )}
                                <div className="flex items-center gap-1.5 bg-black border border-zinc-850 rounded px-2 py-1">
                                    <span className="text-[8px] font-mono text-zinc-500 uppercase">Rating:</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(v => (
                                            <button 
                                                type="button"
                                                key={v}
                                                onClick={() => setNewRating(v)}
                                                className="text-zinc-600 hover:text-yellow-400 transition-colors"
                                            >
                                                <Star className={`w-2.5 h-2.5 ${v <= newRating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-800'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-1.5 items-end">
                                <textarea 
                                    placeholder="Leave feedback or testimonial about this showcase..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    className="flex-1 bg-black border border-zinc-850 rounded p-2 text-[10px] text-zinc-300 focus:outline-none focus:border-purple-500 min-h-[36px] resize-none"
                                    required
                                />
                                <button 
                                    type="submit"
                                    className="px-3 py-2 bg-purple-650 hover:bg-purple-600 text-white rounded text-[10px] font-black font-mono uppercase tracking-wider h-[36px] shrink-0 cursor-pointer"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
