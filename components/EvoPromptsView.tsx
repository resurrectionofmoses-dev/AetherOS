
import React from 'react';
import type { EvoLibrary, EvoPrompt, EvoCategory } from '../types';

interface EvoPromptsViewProps {
  library: EvoLibrary;
  onSelectPrompt: (prompt: EvoPrompt, category: EvoCategory) => void;
}

export const EvoPromptsView: React.FC<EvoPromptsViewProps> = ({ library, onSelectPrompt }) => {
  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg">
      <div className="p-4 border-b-4 border-black sticky top-0 z-10 bg-gray-800 rounded-t-lg">
        <h2 className="font-comic-header text-3xl text-white">{library.library}</h2>
        <p className="text-gray-400 -mt-1">Version {library.version}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {library.categories.map(category => (
          <div key={category.id} className="comic-panel bg-gray-800/50 p-4">
            <h3 className="font-comic-header text-2xl text-violet-300 border-b-2 border-black pb-2 mb-3">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-400 mb-4 italic">{category.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.prompts.map(prompt => (
                <button
                  key={prompt.title}
                  onClick={() => onSelectPrompt(prompt, category)}
                  className="comic-button text-left p-3 bg-gray-700 hover:bg-gray-600 text-white h-full"
                >
                  <span className="font-bold">{prompt.title}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};