
import React from 'react';
import { CodeIcon } from './icons';

const languages = [
  { name: 'Python', description: 'Versatile, high-level language. Great for AI, web dev, and scripting.' },
  { name: 'JavaScript / TypeScript', description: 'The language of the web. Essential for frontend and backend with Node.js.' },
  { name: 'Rust', description: 'Systems programming with a focus on safety, concurrency, and performance.' },
  { name: 'Go', description: 'Simple, efficient, and great for building networked services and CLI tools.' },
  { name: 'C++', description: 'High-performance language used in game engines, embedded systems, and finance.' },
  { name: 'Kotlin', description: 'Modern language for Android development and backend services.' },
];

export const PopularLanguages: React.FC = () => {
  return (
    <div className="comic-panel bg-gray-800/50 p-4 h-full">
      <h3 className="font-comic-header text-2xl text-violet-300 border-b-2 border-black pb-2 mb-3 flex items-center gap-2">
        <CodeIcon className="w-6 h-6" />
        <span>Popular Languages</span>
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        AetherOS modules can be conceptualized in various languages. Here are some popular choices for modern systems:
      </p>
      <div className="space-y-3">
        {languages.map(lang => (
          <div key={lang.name} className="bg-gray-900/50 rounded-lg border-2 border-black p-3">
            <h4 className="font-bold text-white">{lang.name}</h4>
            <p className="text-xs text-gray-400 mt-1">{lang.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
