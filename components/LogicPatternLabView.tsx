import React, { useState, useEffect, useMemo } from 'react';
import { 
    ActivityIcon, SearchIcon, CodeIcon, ShieldIcon, 
    CheckIcon, AlertTriangleIcon, TerminalIcon, ServerIcon,
    LogicIcon
} from './icons';

interface RegexTestResult {
    match: boolean;
    groups: Record<string, string | null>;
    captures: string[];
    executionTime: number;
    error?: string;
}

export const LogicPatternLabView: React.FC = () => {
    const [pattern, setPattern] = useState('(?<word>\\w+)');
    const [testString, setTestString] = useState('AetherOS Logic Engine');
    const [flags, setFlags] = useState('g');
    const [result, setResult] = useState<RegexTestResult | null>(null);
    const [activeTab, setActiveTab] = useState<'REGEX' | 'SCHEMA' | 'TESTS'>('REGEX');

    // Predefined tests from the provided specification
    const standardTests = [
        { name: 'Basic Word Match', pattern: '(\\w)+', input: 'abc' },
        { name: 'Named Group', pattern: '(?<first>first) (?<second>second)', input: 'first second' },
        { name: 'IP Address', pattern: '^(\\d{1,3})(?:\\.(\\d{1,3})){3}$', input: '192.168.0.1' },
        { name: 'Lookbehind', pattern: '123(?<=a\\d+)', input: 'a123' },
        { name: 'Fuzzy Approximation', pattern: '(foobar){e<=1}', input: 'fobar' }, // Simulation of fuzzy logic
    ];

    const runRegex = () => {
        const start = performance.now();
        try {
            const re = new RegExp(pattern, flags);
            const match = re.exec(testString);
            
            if (match) {
                const groups: Record<string, string | null> = {};
                if (match.groups) {
                    Object.keys(match.groups).forEach(key => {
                        groups[key] = match.groups![key];
                    });
                }

                setResult({
                    match: true,
                    groups,
                    captures: Array.from(match),
                    executionTime: performance.now() - start
                });
            } else {
                setResult({
                    match: false,
                    groups: {},
                    captures: [],
                    executionTime: performance.now() - start
                });
            }
        } catch (e: any) {
            setResult({
                match: false,
                groups: {},
                captures: [],
                executionTime: performance.now() - start,
                error: e.message
            });
        }
    };

    useEffect(() => {
        runRegex();
    }, [pattern, testString, flags]);

    return (
        <div className="h-full flex flex-col bg-[#020205] text-blue-100 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-blue-900/40 bg-black/40 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-900/20 border border-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <LogicIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Logic & Pattern Lab</h1>
                        <p className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase">Diagnostic Engine v2.4.9</p>
                    </div>
                </div>
                
                <div className="flex bg-blue-950/30 border border-blue-900/50 rounded-lg p-1">
                    {(['REGEX', 'SCHEMA', 'TESTS'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded text-[10px] font-black tracking-widest transition-all ${
                                activeTab === tab 
                                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                                : 'text-blue-500 hover:text-blue-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Controls */}
                <div className="w-1/2 border-r border-blue-900/40 p-8 overflow-y-auto custom-scrollbar">
                    {activeTab === 'REGEX' && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] text-blue-500 font-black uppercase tracking-widest flex items-center gap-2">
                                    <SearchIcon className="w-3 h-3" />
                                    Pattern Definition
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
                                    <input 
                                        value={pattern}
                                        onChange={(e) => setPattern(e.target.value)}
                                        className="relative w-full bg-black border border-blue-900/50 rounded-lg px-4 py-3 text-blue-100 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                                        placeholder="Enter regex pattern..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] text-blue-500 font-black uppercase tracking-widest flex items-center gap-2">
                                    <ServerIcon className="w-3 h-3" />
                                    Test Sequence
                                </label>
                                <textarea 
                                    value={testString}
                                    onChange={(e) => setTestString(e.target.value)}
                                    className="w-full h-32 bg-black border border-blue-900/50 rounded-lg px-4 py-3 text-blue-100 focus:outline-none focus:border-blue-500 transition-colors font-mono resize-none"
                                    placeholder="Enter string to test..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Engine Flags</span>
                                    <input 
                                        value={flags}
                                        onChange={(e) => setFlags(e.target.value)}
                                        className="w-full bg-black/60 border border-blue-900/30 rounded px-3 py-2 text-xs text-blue-400 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Complexity</span>
                                    <div className="h-9 flex items-center px-3 bg-blue-900/10 border border-blue-900/30 rounded text-xs text-blue-500 font-bold">
                                        O(N) LINEAR
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'TESTS' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-6">Standard Test Suite</h3>
                            {standardTests.map((test, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setPattern(test.pattern);
                                        setTestString(test.input);
                                        setActiveTab('REGEX');
                                    }}
                                    className="w-full text-left p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl hover:border-blue-500 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-black text-white group-hover:text-blue-400">{test.name}</span>
                                        <span className="text-[8px] bg-blue-900/30 px-2 py-0.5 rounded text-blue-500">UNIT_TEST</span>
                                    </div>
                                    <div className="text-[10px] text-blue-500 font-mono truncate">
                                        {test.pattern}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'SCHEMA' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <ShieldIcon className="w-12 h-12 text-blue-900/40" />
                            <div>
                                <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest">Schema Validator</h3>
                                <p className="text-xs text-gray-500 mt-2">Pydantic-inspired validation pipeline in development.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Results */}
                <div className="w-1/2 bg-black/20 p-8 overflow-y-auto custom-scrollbar">
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-blue-500 uppercase tracking-widest">Diagnostic Output</h2>
                            {result?.match ? (
                                <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                                    <CheckIcon className="w-3 h-3" />
                                    Match Success
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                                    <AlertTriangleIcon className="w-3 h-3" />
                                    {result?.error ? 'Engine Error' : 'No Match'}
                                </div>
                            )}
                        </div>

                        {result?.error && (
                            <div className="p-4 bg-red-900/10 border border-red-500/50 rounded-lg text-red-400 text-xs font-mono">
                                {result.error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-900/5 border border-blue-900/30 rounded-xl p-4">
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Execution Time</span>
                                <span className="text-xl font-black text-blue-400">{result?.executionTime.toFixed(3)}ms</span>
                            </div>
                            <div className="bg-blue-900/5 border border-blue-900/30 rounded-xl p-4">
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Capture Groups</span>
                                <span className="text-xl font-black text-blue-400">{Object.keys(result?.groups || {}).length}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Captured Segments</h3>
                            <div className="space-y-2">
                                {result?.captures.map((cap, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-black/40 border border-blue-900/20 rounded-lg p-3 group hover:border-blue-500/30 transition-all">
                                        <span className="text-[10px] text-blue-900 font-black w-6">{i}</span>
                                        <span className="text-xs text-blue-100 font-mono break-all">{cap}</span>
                                    </div>
                                ))}
                                {result?.captures.length === 0 && !result?.error && (
                                    <div className="text-xs text-gray-600 italic">Waiting for valid sequence...</div>
                                )}
                            </div>
                        </div>

                        {Object.keys(result?.groups || {}).length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Named Groups</h3>
                                <div className="space-y-2">
                                    {Object.entries(result?.groups || {}).map(([name, value]) => (
                                        <div key={name} className="flex items-center justify-between bg-blue-900/10 border border-blue-900/30 rounded-lg p-3">
                                            <span className="text-[10px] text-blue-400 font-black uppercase">{name}</span>
                                            <span className="text-xs text-white font-mono">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="px-6 py-2 bg-blue-950/20 border-t border-blue-900/40 flex items-center justify-between text-[8px] text-blue-900 font-black uppercase tracking-[0.3em]">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        Logic Core Active
                    </span>
                    <span>Buffer: 1024KB</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>AetherOS // Pattern_Lab</span>
                    <span className="text-blue-700">0x7F_0x00_0x01</span>
                </div>
            </div>
        </div>
    );
};
