
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg my-4 overflow-hidden border-2 border-gray-700">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 text-xs text-gray-400 border-b-2 border-gray-700">
        <span className="font-mono font-bold">{language || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-2 hover:text-white transition-colors bg-gray-700 px-2 py-1 rounded-md border-2 border-black">
          <ClipboardIcon className="w-4 h-4" />
          {copied ? 'COPIED!' : 'COPY'}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-gray-200 bg-gray-900/50">
        <code>{code}</code>
      </pre>
    </div>
  );
};