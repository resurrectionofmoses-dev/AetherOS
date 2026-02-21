
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { HexMetric } from './HexMetric';

interface CodeBlockProps {
  language: string;
  code: string;
  searchQuery?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, searchQuery }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderCode = () => {
    if (!searchQuery || !searchQuery.trim()) return code;

    const safeQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    const parts = code.split(regex);

    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark 
          key={i} 
          className="bg-amber-400 text-black px-0.5 rounded-sm font-black shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse inline-block"
        >
          {part}
        </mark>
      ) : part
    );
  };

  const lines = code.split('\n');

  return (
    <div className="bg-gray-900 rounded-lg my-4 overflow-hidden border-2 border-gray-700 shadow-xl group/codeblock">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 text-xs text-gray-400 border-b-2 border-gray-700">
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500/50" />
            <span className="font-mono font-bold uppercase tracking-widest">{language || 'shard'}</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-2 hover:text-white transition-colors bg-gray-700 px-2 py-1 rounded-md border-2 border-black active:translate-y-0.5">
          <ClipboardIcon className="w-4 h-4" />
          {copied ? 'COPIED!' : 'COPY'}
        </button>
      </div>
      <div className="flex bg-[#050505] overflow-x-auto custom-scrollbar">
        {/* Quantum Hex Gutter */}
        <div className="flex flex-col gap-0 py-4 px-2 border-r border-white/5 bg-black/40">
          {lines.map((_, i) => (
            <div key={i} className="h-5 flex items-center justify-center opacity-30 group-hover/codeblock:opacity-100 transition-opacity">
                <HexMetric size="nano" value={i + 1} colorClass="border-zinc-800 text-gray-600" glow={false} />
            </div>
          ))}
        </div>
        <pre className="flex-1 p-4 pt-4 text-sm text-gray-200 bg-transparent">
          <code>{renderCode()}</code>
        </pre>
      </div>
    </div>
  );
};
