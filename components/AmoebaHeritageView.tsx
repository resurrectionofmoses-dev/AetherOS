import React, { useState, useMemo } from 'react';
import { 
    BookOpenIcon, SearchIcon, TerminalIcon, LogicIcon, ZapIcon, ShieldIcon, 
    CheckCircleIcon, ActivityIcon, SignalIcon, ClockIcon 
} from './icons';

interface AmoebaCommand {
    name: string;
    description: string;
    synopsis: string;
    usage: string;
}

const AMOEBA_COMMANDS: AmoebaCommand[] = [
    { name: 'aal', description: 'archiver and library maintainer', synopsis: 'aal {adrtx}[vlc] archive [filename ...]', usage: 'Aal maintains groups of ACK-object files combined into a single archive file. An index table is automatically maintained.' },
    { name: 'ack', description: 'Amsterdam Compiler Kit', synopsis: 'ack arguments...', usage: 'Single compiler capable of compiling several different languages and producing binaries for various architectures.' },
    { name: 'ail', description: 'Amoeba Interface Language', synopsis: 'ail [options] [Source]', usage: 'Amoeba stub-compiler used to generate RPC stubs for both clients and servers.' },
    { name: 'ainstall', description: 'transform Amoeba binary into executable', synopsis: 'ainstall [options] unix-file [amoeba-file]', usage: 'Creates an Amoeba executable file from loader output produced under UNIX.' },
    { name: 'amsh', description: 'start an Amoeba shell running in a UNIX tty', synopsis: 'amsh [options] [cmd [args]]', usage: 'Used under UNIX to start a shell running under Amoeba which uses a UNIX tty for its input and output.' },
    { name: 'aps', description: 'show process status', synopsis: 'aps [-a] [-v] [-u username] ...', usage: 'Prints information about the processes running on each host in each directory.' },
    { name: 'ax', description: 'execute program using specified environment and host', synopsis: 'ax [options] program [argument] ...', usage: 'Used to start a new Amoeba process from Amoeba or from UNIX.' },
    { name: 'bullet', description: 'Amoeba file server', synopsis: 'Internal service', usage: 'High-performance immutable file server used in Amoeba. Files are created atomically and contiguously.' },
    { name: 'soap', description: 'Amoeba directory server', synopsis: 'Internal service', usage: 'Naming service for objects in the Amoeba distributed system, implementing an arbitrary directed graph.' },
    { name: 'session', description: 'session server for process management', synopsis: 'session [-a|-p] [command ...]', usage: 'Provides personal POSIX emulation, pipes, and process management for user applications.' },
    { name: 'starch', description: 'backup and restore tool', synopsis: 'starch -o [options] path ...', usage: 'Saves an entire Soap directory graph to an archive file from which it can later be restored.' },
    { name: 'std_info', description: 'get standard information about an object', synopsis: 'std_info object ...', usage: 'Prints the standard information string for specified objects, including type and size.' },
    { name: 'stun', description: 'paralyze, possibly kill a process', synopsis: 'stun [options] process ...', usage: 'Sends a "stun" request to stop, snapshot, or destroy a process.' },
    { name: 'yap', description: 'yet another pager', synopsis: 'yap [options] [filename ...]', usage: 'Allows users to examine continuous text, one screen full at a time, with forward/backward paging.' },
    { name: 'ksh', description: 'the Korn Shell', synopsis: 'ksh [-st] [-c command] [file ...]', usage: 'Bourne Shell compatible shell with command line editing and history features.' },
    { name: 'm2', description: 'ACK Modula-2 compiler', synopsis: 'm2 [options] file ...', usage: 'Compiler for Modula-2 within the Amsterdam Compiler Kit framework.' },
    { name: 'nm', description: 'print symbol table of Amoeba executables', synopsis: 'nm [-dgnopru] [file] ...', usage: 'Displays the symbol table, preceding symbols with addresses and type letters.' },
    { name: 'pdump', description: 'dump process descriptor', synopsis: 'pdump core-file', usage: 'Prints process descriptor and stack traces in symbolic form for diagnostic analysis.' },
    { name: 'std_copy', description: 'replicate an object', synopsis: 'std_copy servercap original newcopy', usage: 'Replicates an object across different servers for higher availability and redundancy.' },
];

export const AmoebaHeritageView: React.FC = () => {
    const [search, setSearch] = useState('');
    const [selectedCmd, setSelectedCmd] = useState<AmoebaCommand | null>(null);

    const filtered = useMemo(() => {
        return AMOEBA_COMMANDS.filter(c => 
            c.name.toLowerCase().includes(search.toLowerCase()) || 
            c.description.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    return (
        <div className="h-full flex flex-col bg-[#050505] text-gray-200 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600/10 border-4 border-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        <BookOpenIcon className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-blue-400 wisdom-glow italic tracking-tighter uppercase leading-none">Heritage Protocol</h2>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mt-1 italic">Amoeba Reference Manual | Archives Ingested</p>
                    </div>
                </div>
                <div className="flex gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Knowledge Sync</p>
                        <p className="text-xl font-comic-header text-white">0x03E2_READY</p>
                    </div>
                    <ActivityIcon className="w-12 h-12 text-blue-900 opacity-30" />
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.02)_0%,_transparent_70%)] pointer-events-none" />

                {/* Left: Command List */}
                <div className="lg:w-80 flex flex-col gap-6 flex-shrink-0 relative z-10">
                    <div className="aero-panel p-6 bg-slate-900/80 border-blue-600/30 shadow-[8px_8px_0_0_#000]">
                        <h3 className="font-comic-header text-2xl text-white uppercase italic mb-4 flex items-center gap-2">
                            <SearchIcon className="w-5 h-5 text-blue-500" /> Siphon Index
                        </h3>
                        <input 
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search Command..."
                            className="w-full bg-black/60 border-2 border-black rounded-xl p-3 text-blue-400 text-xs placeholder:text-gray-800 focus:ring-0 outline-none focus:border-blue-600 transition-all"
                        />
                    </div>

                    <div className="aero-panel bg-black/40 border-white/5 flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar p-4 pr-1">
                            {filtered.map(cmd => (
                                <button 
                                    key={cmd.name} 
                                    onClick={() => setSelectedCmd(cmd)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${
                                        selectedCmd?.name === cmd.name 
                                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                                        : 'bg-black border-zinc-900 text-gray-500 hover:border-blue-500/50 hover:text-gray-300'
                                    }`}
                                >
                                    <p className="font-black uppercase text-sm tracking-widest">{cmd.name}</p>
                                    <p className="text-[10px] italic truncate mt-1 opacity-70">{cmd.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Detail View */}
                <div className="flex-1 overflow-hidden relative z-10">
                    {selectedCmd ? (
                        <div className="h-full aero-panel bg-black/60 p-8 border-4 border-black flex flex-col shadow-[15px_15px_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex justify-between items-start mb-8 border-b-4 border-blue-600/30 pb-4">
                                <div>
                                    <h3 className="font-comic-header text-6xl text-white italic tracking-tighter uppercase leading-none">{selectedCmd.name}</h3>
                                    <p className="text-xl text-blue-400 uppercase font-black tracking-widest mt-2">{selectedCmd.description}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-black text-gray-700 uppercase mb-1">Heritage_ID</span>
                                    <span className="text-xs font-mono text-blue-900 font-black">REF: {selectedCmd.name.toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pr-4">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <TerminalIcon className="w-4 h-4" /> SYNOPSIS
                                    </h4>
                                    <div className="bg-slate-900 border-2 border-black p-4 rounded-xl font-mono text-cyan-400 shadow-inner">
                                        {selectedCmd.synopsis}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <LogicIcon className="w-4 h-4" /> ARCHITECTURAL USAGE
                                    </h4>
                                    <div className="text-gray-300 leading-relaxed italic text-lg border-l-4 border-blue-600 pl-6 bg-white/5 py-4 rounded-r-xl">
                                        "{selectedCmd.usage}"
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-950/20 border-2 border-blue-900/30 rounded-[2rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <ShieldIcon className="w-32 h-32 text-blue-500" />
                                    </div>
                                    <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Maestro Forensic Note</h5>
                                    <p className="text-xs text-gray-400 leading-relaxed italic">
                                        "The {selectedCmd.name} protocol is an ancestral shard of distributed know-how. By siphoning this logic, we align the AetherOS grid with high-fidelity reliable series."
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                                <button className="vista-button px-12 py-4 bg-blue-600 hover:bg-blue-500 text-black font-black uppercase text-sm tracking-[0.2em] rounded-2xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all">
                                    INGEST SHARD
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full aero-panel bg-black/40 border-4 border-black border-dashed flex flex-col items-center justify-center opacity-20">
                             <BookOpenIcon className="w-40 h-40 mb-8" />
                             <p className="font-comic-header text-5xl uppercase tracking-[0.2em] italic">Heritage Siphon</p>
                             <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-4">Legacy Kernel Archives Ingested</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Heritage Feed: SECURE</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Archive: Amoeba 5.3 | Conductor: Maestro | Shard: Heritage
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.5em]">
                   Distributed Wisdom from the First Conjunction.
                </div>
            </div>
        </div>
    );
};
