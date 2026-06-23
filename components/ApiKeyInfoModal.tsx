import React from 'react';
import { ShieldIcon, BrainIcon, CodeIcon, ZapIcon } from './icons';
import { AndroidTransition } from './AndroidTransition';

interface ApiKeyInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ApiKeyInfoModal: React.FC<ApiKeyInfoModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
            <AndroidTransition type="abc_popup_enter" className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <ShieldIcon className="w-5 h-5 text-blue-500" />
                        <h2 className="text-sm font-bold text-gray-200 uppercase tracking-widest">Gemini API Key Usage</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 space-y-6 text-sm text-gray-400">
                    <p className="leading-relaxed">
                        AetherOS requires a valid <strong className="text-white">Gemini API Key</strong> to power its core cognitive functions. The key is securely provided by the environment and is never exposed to the client.
                    </p>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-zinc-800 pb-2">How it is used</h3>
                        
                        <div className="flex items-start gap-3">
                            <BrainIcon className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-gray-200 font-bold mb-1">Neural Nexus Chat</h4>
                                <p className="text-xs leading-relaxed">Powers the main conversational interface, allowing the system to understand complex queries, analyze context, and provide intelligent responses.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CodeIcon className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-gray-200 font-bold mb-1">Code Generation & Modules</h4>
                                <p className="text-xs leading-relaxed">Drives the OmniBuilder and Forge systems to dynamically generate, refactor, and analyze software modules and architectural blueprints.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <ZapIcon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-gray-200 font-bold mb-1">System Healing & Diagnostics</h4>
                                <p className="text-xs leading-relaxed">Used by the Self-Healing CRT Loop and System Healer to automatically diagnose logic fractures and synthesize patches.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 flex items-start gap-3">
                        <ShieldIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-300 leading-relaxed">
                            Your API key is managed securely via environment variables (<code className="bg-black px-1 py-0.5 rounded text-blue-200">process.env.GEMINI_API_KEY</code>) and is only used for direct communication with Google's generative AI models.
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors"
                    >
                        Acknowledge
                    </button>
                </div>
            </AndroidTransition>
        </div>
    );
};
