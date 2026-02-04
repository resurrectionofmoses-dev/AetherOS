
import React, { useState } from 'react';

interface InteractionPromptProps {
  prompt: string;
  onSubmit: (answer: string) => void;
}

export const InteractionPrompt: React.FC<InteractionPromptProps> = ({ prompt, onSubmit }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border-2 border-dashed border-[var(--theme-color-main)]" data-theme="aetheros">
      <p className="font-bold text-gray-100 mb-3">{prompt}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full bg-gray-900/80 border border-gray-700 rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--theme-color-main)] transition-all text-gray-200"
          required
        />
        <button
          type="submit"
          className="py-2 px-4 bg-[var(--theme-color-main)] hover:opacity-90 text-white font-bold rounded-lg transition-colors disabled:opacity-50 comic-button self-end"
          disabled={!answer.trim()}
        >
          Submit Answer
        </button>
      </form>
    </div>
  );
};