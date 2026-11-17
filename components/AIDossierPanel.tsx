import React from 'react';
import { CheckCircle2, AlertTriangle, ExternalLink, FileCode2, Cpu, ShieldAlert } from 'lucide-react';
import type { AIDossierReport } from '../types';

interface AIDossierPanelProps {
    dossier?: AIDossierReport;
    username?: string;
    compact?: boolean;
}

export const AIDossierPanel: React.FC<AIDossierPanelProps> = ({ dossier, username, compact = false }) => {
    if (!dossier) {
        return (
            <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-200">
                    <Cpu className="w-4 h-4 text-zinc-400" />
                    <span>No AI Audit Record Compiled Yet</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                    Profiles in this network are populated exclusively by AI rather than self-authored by the user.
                    Run an AI profile audit to inspect workspace code, session telemetry, and public web records for{' '}
                    <span className="text-zinc-200 font-mono">@{username || 'operator'}</span> — including both strengths and flaws.
                </p>
            </div>
        );
    }

    const goodList = dossier.theGood || [];
    const badList = dossier.theBad || [];
    const sources = dossier.evidenceSources || [];
    const metrics = dossier.workspaceMetrics;

    return (
        <div className="space-y-5 text-left">
            {/* Unfiltered Verdict Banner */}
            <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                        <h4 className="text-sm font-semibold text-white tracking-tight">
                            Unfiltered AI Profile Audit
                        </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400 tabular-nums">
                        <span>Subject: {dossier.subjectIdentifier}</span>
                        <span aria-hidden="true">·</span>
                        <span>Model: {dossier.modelUsed}</span>
                        <span aria-hidden="true">·</span>
                        <span>Audited {new Date(dossier.generatedAt).toLocaleString()}</span>
                    </div>
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                    {dossier.verdictSummary}
                </p>

                {dossier.candorNotice && (
                    <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                        {dossier.candorNotice}
                    </p>
                )}

                {metrics && !compact && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs font-mono tabular-nums">
                        <div>
                            <span className="text-zinc-500 block text-[11px]">Files Scanned</span>
                            <span className="text-zinc-100 font-semibold">{metrics.totalFilesScanned}</span>
                        </div>
                        <div>
                            <span className="text-zinc-500 block text-[11px]">Monolithic Files (&gt;900L)</span>
                            <span className={metrics.oversizedFilesCount > 0 ? 'text-amber-300 font-semibold' : 'text-zinc-100 font-semibold'}>
                                {metrics.oversizedFilesCount}
                            </span>
                        </div>
                        <div>
                            <span className="text-zinc-500 block text-[11px]">TODO / FIXME Markers</span>
                            <span className="text-zinc-100 font-semibold">{metrics.todoCount}</span>
                        </div>
                        <div>
                            <span className="text-zinc-500 block text-[11px]">Glitches Observed</span>
                            <span className={metrics.glitchesObserved > 0 ? 'text-rose-300 font-semibold' : 'text-zinc-100 font-semibold'}>
                                {metrics.glitchesObserved}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Side-by-Side: The Good vs The Bad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* THE GOOD */}
                <div className="bg-[#0b0f17] border border-emerald-500/25 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <h5 className="text-xs font-mono font-bold uppercase tracking-wider">
                                Verified Strengths & Wins
                            </h5>
                        </div>
                        <span className="text-xs font-mono text-zinc-400 tabular-nums">
                            {goodList.length} noted
                        </span>
                    </div>

                    {goodList.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {goodList.map((item, idx) => (
                                <div key={`${item.title}_${idx}`} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-xs font-semibold text-zinc-100">
                                            {item.title}
                                        </span>
                                        <span className="text-[10px] font-mono text-emerald-400/90 shrink-0">
                                            {item.source}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                        {item.detail}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-500 font-mono">
                            No verified strengths recorded in this audit.
                        </p>
                    )}
                </div>

                {/* THE BAD */}
                <div className="bg-[#0b0f17] border border-rose-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                        <div className="flex items-center gap-2 text-rose-400">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <h5 className="text-xs font-mono font-bold uppercase tracking-wider">
                                Flaws, Debt & Red Flags
                            </h5>
                        </div>
                        <span className="text-xs font-mono text-zinc-400 tabular-nums">
                            {badList.length} noted
                        </span>
                    </div>

                    {badList.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {badList.map((item, idx) => (
                                <div key={`${item.title}_${idx}`} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-xs font-semibold text-rose-100">
                                            {item.title}
                                        </span>
                                        <span className="text-[10px] font-mono text-rose-400/90 shrink-0">
                                            {item.sentiment === 'risk' ? 'Risk · ' : ''}{item.source}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                        {item.detail}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-500 font-mono">
                            No flaws reported yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Grounding & Audit Sources */}
            {sources.length > 0 && (
                <div className="bg-[#0b0f17] border border-white/10 rounded-2xl px-5 py-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                        <FileCode2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Evidence & Grounding Sources ({sources.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-mono">
                        {sources.map((src, i) =>
                            src.url ? (
                                <a
                                    key={`${src.url}_${i}`}
                                    href={src.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2 inline-flex items-center gap-1"
                                >
                                    <span className="truncate max-w-[260px]">{src.title}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                            ) : (
                                <span key={`${src.title}_${i}`} className="text-zinc-400">
                                    {src.title}
                                </span>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
