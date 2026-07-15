import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionsDb } from '../services/subscriptionsDb';
import { 
  FileCode2, 
  Users2, 
  MessageSquare, 
  Send, 
  Play, 
  Terminal, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Shield, 
  CheckCircle2, 
  Plus, 
  X,
  Lock,
  Wallet,
  ChevronRight,
  MonitorPlay
} from 'lucide-react';
import { safeStorage } from '../services/safeStorage';

interface CollabFile {
  name: string;
  content: string;
}

interface UserPresence {
  username: string;
  activeFile: string;
  line: number;
  char: number;
  color: string;
  isTyping: boolean;
}

interface ChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export const CollaborativeEditorView: React.FC = () => {
  const { user } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const subRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscriptionsDb.subscribeToStatus(user.uid, (data) => {
      setSub(data);
      subRef.current = data;
    });
    return () => unsub();
  }, [user]);

  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState<string>("App.tsx");
  const [presence, setPresence] = useState<UserPresence[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>(["[AetherOS Sandbox] Kernel node ready.", "[AetherOS Sandbox] Live sync enabled."]);
  const [myUsername, setMyUsername] = useState("Operator-You");
  const [myColor] = useState(() => {
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
    return colors[Math.floor(Math.random() * colors.length)];
  });
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorChar, setCursorChar] = useState(1);
  const [isPeerSimulationActive, setIsPeerSimulationActive] = useState(true);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Pay-to-Code state
  const [shards, setShards] = useState<number>(99999);
  const [cphBalance, setCphBalance] = useState<number>(1300);
  const [isLicensed, setIsLicensed] = useState<boolean>(false);
  const [licenseSecondsLeft, setLicenseSecondsLeft] = useState<number>(0);

  // Load username, shards, CPH, and active lease from safeStorage and localStorage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const stored = await safeStorage.getItem('aetheros_user_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.username) {
            setMyUsername(parsed.username);
          }
        }
      } catch (e) {
        console.error("Failed to load username", e);
      }
    };
    fetchProfile();

    // Load Shards
    const loadShards = async () => {
      try {
        const stored = await safeStorage.getItem('aetheros_conjunction_progress');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed.shards === 'number') {
            setShards(parsed.shards);
          }
        }
      } catch (err) {
        console.error("Failed to load shards", err);
      }
    };

    // Load CPH
    const loadCph = () => {
      try {
        const stored = localStorage.getItem('aetheros_resource_reserve');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed.totalBackedCPH === 'number') {
            setCphBalance(parsed.totalBackedCPH);
          }
        }
      } catch (err) {
        console.error("Failed to load CPH", err);
      }
    };

    // Check lease
    const checkLease = () => {
      try {
        if (subRef.current && subRef.current.status === 'active') {
          setIsLicensed(true);
          setLicenseSecondsLeft(86400);
          return;
        }
        const leaseStr = localStorage.getItem('aetheros_editor_lease');
        if (leaseStr) {
          const lease = JSON.parse(leaseStr);
          const expiresAt = lease.expiresAt;
          const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
          if (remaining > 0) {
            setIsLicensed(true);
            setLicenseSecondsLeft(remaining);
          } else {
            setIsLicensed(false);
            setLicenseSecondsLeft(0);
          }
        } else {
          setIsLicensed(false);
          setLicenseSecondsLeft(0);
        }
      } catch (err) {
        console.error("Failed to load lease", err);
      }
    };

    loadShards();
    loadCph();
    checkLease();

    const interval = setInterval(() => {
      checkLease();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePurchaseLease = async (method: 'shards' | 'cph') => {
    if (method === 'shards') {
      const cost = 50;
      if (shards < cost) {
        toast.error("Insufficient Cosmic Shards in your junction reserve!");
        return;
      }
      try {
        // 1. Deduct Shards
        const stored = await safeStorage.getItem('aetheros_conjunction_progress');
        let parsed = stored ? JSON.parse(stored) : { shards: 99999, level: 5 };
        parsed.shards = Math.max(0, parsed.shards - cost);
        await safeStorage.setItem('aetheros_conjunction_progress', JSON.stringify(parsed));
        setShards(parsed.shards);

        // 2. Set Lease (10 minutes = 600s)
        const expiresAt = Date.now() + 600 * 1000;
        localStorage.setItem('aetheros_editor_lease', JSON.stringify({ expiresAt }));
        setIsLicensed(true);
        setLicenseSecondsLeft(600);

        // Broadcast chat notification
        await fetch("/api/collaboration/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "System-Gate",
            text: `[RESTRICTION OVERRIDE] Operator-You authorized automatic transaction fee of 50 Cosmic Shards. Codespace licensed for 10 minutes.`
          })
        });

        toast.success("DEV LICENSE GRANTED", {
          description: "Authorized automatic transaction fee of 50 Cosmic Shards. Pipeline open."
        });
      } catch (err) {
        toast.error("Failed to authorize cosmic lease.");
      }
    } else {
      const cost = 100;
      if (cphBalance < cost) {
        toast.error("Insufficient Physical Assets (CPH) in your real money reserve!");
        return;
      }
      try {
        // 1. Deduct CPH via RealMoneySystem consumption
        const storedRes = localStorage.getItem('aetheros_resource_reserve');
        if (storedRes) {
          const reserve = JSON.parse(storedRes);
          reserve.totalBackedCPH = Math.max(0, reserve.totalBackedCPH - cost);
          reserve.cphInStorage = Math.max(0, reserve.cphInStorage - cost);
          reserve.resourcesConsumedCPH += cost;
          reserve.netResourceBalance = reserve.totalBackedCPH;
          localStorage.setItem('aetheros_resource_reserve', JSON.stringify(reserve));
          setCphBalance(reserve.totalBackedCPH);
        }

        // 2. Set Lease (10 minutes = 600s)
        const expiresAt = Date.now() + 600 * 1000;
        localStorage.setItem('aetheros_editor_lease', JSON.stringify({ expiresAt }));
        setIsLicensed(true);
        setLicenseSecondsLeft(600);

        // Broadcast chat notification
        await fetch("/api/collaboration/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "System-Gate",
            text: `[RESTRICTION OVERRIDE] Operator-You authorized automatic transaction fee of 100 CPH. Codespace licensed for 10 minutes.`
          })
        });

        toast.success("DEV LICENSE GRANTED", {
          description: "Authorized automatic transaction fee of 100 CPH from resource reserves. Pipeline open."
        });
      } catch (err) {
        toast.error("Failed to authorize asset lease.");
      }
    }
  };

  // Fetch all data from server (files, presence, chat)
  const fetchData = async () => {
    try {
      // Fetch Files
      const filesRes = await fetch("/api/collaboration/files");
      if (filesRes.ok) {
        const data = await filesRes.json();
        if (data.success && data.files) {
          setFiles(data.files);
          // Sync editor contents if active file has changed or editor content is not loaded yet
          if (data.files[activeFile] !== undefined) {
            // Only update local text state if NOT currently active or text is empty to prevent cursor jump during typing
            if (document.activeElement !== editorRef.current || !editorContent) {
              setEditorContent(data.files[activeFile]);
            }
          }
        }
      }

      // Fetch Presence
      const presenceRes = await fetch("/api/collaboration/presence");
      if (presenceRes.ok) {
        const data = await presenceRes.json();
        if (data.success && data.presence) {
          // Filter out myself so I can show other users
          setPresence(data.presence.filter((p: any) => p.username !== myUsername));
        }
      }

      // Fetch Chat
      const chatRes = await fetch("/api/collaboration/chat");
      if (chatRes.ok) {
        const data = await chatRes.json();
        if (data.success && data.chat) {
          setChat(data.chat);
        }
      }
    } catch (err) {
      console.warn("Failed to poll collaboration server frame", err);
    }
  };

  // Initial and periodic sync
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1500);
    return () => clearInterval(interval);
  }, [activeFile, myUsername, editorContent]);

  // Update server editor contents when typing
  const handleEditorChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextContent = e.target.value;
    setEditorContent(nextContent);
    setFiles(prev => ({ ...prev, [activeFile]: nextContent }));

    // Send to server
    try {
      await fetch("/api/collaboration/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: activeFile, content: nextContent })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Sync cursor & active file to server
  const handleEditorActivity = async (e: any) => {
    const textarea = e.target as HTMLTextAreaElement;
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length;
    const char = lines[lines.length - 1].length + 1;

    setCursorLine(line);
    setCursorChar(char);

    try {
      await fetch("/api/collaboration/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: myUsername,
          activeFile,
          line,
          char,
          color: myColor,
          isTyping: document.activeElement === editorRef.current
        })
      });
    } catch (err) {
      console.warn(err);
    }
  };

  // Peer coding simulation loop
  useEffect(() => {
    if (!isPeerSimulationActive) return;

    const simulatePeerTyping = async () => {
      const activePeers = ["CyberWeaver_X", "AcousticWeaver"];
      const randomPeer = activePeers[Math.floor(Math.random() * activePeers.length)];
      
      // Determine what files the peer can edit
      const targetFile = activeFile;
      
      // Find current file content
      const currentText = files[targetFile] || editorContent || "";
      let updatedText = currentText;

      // Make a small logical addition based on file
      if (targetFile === "App.tsx") {
        if (!currentText.includes("SimulatedPeerMarker")) {
          updatedText = currentText.replace(
            "Incr Matrix:",
            "Incr Matrix: {/* SimulatedPeerMarker @CyberWeaver_X live coding */}"
          );
        } else {
          updatedText = currentText.replace(
            "Incr Matrix: {/* SimulatedPeerMarker @CyberWeaver_X live coding */}",
            "Incr Matrix:"
          );
        }
      } else if (targetFile === "styles.css") {
        if (!currentText.includes(".peer-glow")) {
          updatedText = currentText + `\n\n/* Interactive neon class added by peer */\n.peer-glow {\n  box-shadow: 0 0 15px #a855f7;\n}`;
        } else {
          updatedText = currentText.replace(`\n\n/* Interactive neon class added by peer */\n.peer-glow {\n  box-shadow: 0 0 15px #a855f7;\n}`, "");
        }
      }

      // Only perform update occasionally
      if (updatedText !== currentText) {
        // Send edit update to server
        try {
          await fetch("/api/collaboration/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: targetFile, content: updatedText })
          });

          // Send message to chat
          await fetch("/api/collaboration/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: randomPeer,
              text: `Refactored logic inside ${targetFile} to improve node routing efficiency!`
            })
          });

          // Sync local state if we aren't currently editing
          if (document.activeElement !== editorRef.current) {
            setEditorContent(updatedText);
          }
          
          toast.info(`@${randomPeer} performed a live code update in ${targetFile}!`, {
            description: "Synchronized changes broadcasted to all connected lattices.",
            duration: 4000,
          });
        } catch (err) {
          console.error(err);
        }
      }

      // Update peer presence coordinates randomly
      const randomLine = Math.floor(Math.random() * 8) + 2;
      const randomChar = Math.floor(Math.random() * 20) + 1;
      try {
        await fetch("/api/collaboration/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: randomPeer,
            activeFile: targetFile,
            line: randomLine,
            char: randomChar,
            color: randomPeer === "CyberWeaver_X" ? "#a855f7" : "#06b6d4",
            isTyping: Math.random() > 0.5
          })
        });
      } catch (err) {
        console.error(err);
      }
    };

    const peerInterval = setInterval(simulatePeerTyping, 12000);
    return () => clearInterval(peerInterval);
  }, [isPeerSimulationActive, activeFile, files, editorContent]);

  // Handle adding a new file
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFileName.trim();
    if (!name) return;

    if (files[name] !== undefined) {
      toast.error("File already exists in sandbox repository.");
      return;
    }

    const initialText = `// AetherOS - ${name}\n// Created in collaboration sandbox\n\nexport const setup = () => {\n  console.log("Conduction successful");\n};`;
    
    try {
      await fetch("/api/collaboration/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: name, content: initialText })
      });
      setFiles(prev => ({ ...prev, [name]: initialText }));
      setActiveFile(name);
      setEditorContent(initialText);
      setNewFileName("");
      setIsAddingFile(false);
      toast.success(`Registered new collaborative file: ${name}`);
    } catch (err) {
      toast.error("Failed to add file.");
    }
  };

  // Handle Sending Chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg) return;

    try {
      const res = await fetch("/api/collaboration/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: myUsername, text: msg })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.chat) {
          setChat(data.chat);
          setChatInput("");
        }
      }
    } catch (err) {
      toast.error("Message broadcasting failed.");
    }
  };

  // Simulated run of code inside sandbox container
  const handleRunCode = () => {
    setIsRunningCode(true);
    setRunLogs(prev => [...prev, `[Compile] Initiating sandbox compiler on active frame: ${activeFile}...`]);

    setTimeout(() => {
      const timestamp = new Date().toLocaleTimeString();
      let outputLogs = [
        `[${timestamp}] [Success] Active code compiled into local WebAssembly sandbox chunk!`,
        `[${timestamp}] [Launch] Execution completed in 14.2ms. Exit Code: 0 (OPTIMAL)`
      ];

      if (activeFile === "App.tsx") {
        outputLogs.unshift(`[${timestamp}] [Runtime] Running Virtual Component mounting sequences...`);
      } else if (activeFile === "server.ts") {
        outputLogs.unshift(`[${timestamp}] [Runtime] Initializing sandbox router... Express mock server running on port 3310.`);
      }

      setRunLogs(prev => [...prev, ...outputLogs]);
      setIsRunningCode(false);
      toast.success(`${activeFile} compiled and executed in local isolation!`);
    }, 1800);
  };

  // Get line numbers rendering array
  const lineNumbers = editorContent.split('\n').map((_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-[#020208] text-zinc-300 relative font-sans overflow-hidden">
      {/* Visual background grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(168,85,247,0.04)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      {/* View Header */}
      <div className="p-5 border-b border-purple-950/40 bg-[#04040e]/90 backdrop-blur flex items-center justify-between flex-wrap gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <MonitorPlay className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-[0.2em]">Real-Time Collaborative Code Space</h1>
            <p className="text-[9px] font-mono text-purple-400 mt-1 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              LATTICE TUNNEL STABLE // LATENCY: 0.04ms // CONDUCTIONS ACTIVE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPeerSimulationActive(!isPeerSimulationActive)}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-mono border transition-all uppercase flex items-center gap-1.5 cursor-pointer ${
              isPeerSimulationActive 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                : 'bg-zinc-950/60 border-zinc-900 text-zinc-550 hover:text-zinc-400'
            }`}
            title="Toggle background activity from system developers"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            Peer Activity: {isPeerSimulationActive ? 'STREAMING' : 'OFFLINE'}
          </button>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-[#090918] border border-zinc-850 text-purple-400 hover:text-white transition-colors cursor-pointer"
            title="Force refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* SIDEBAR: File Repository Explorer */}
        <aside className="w-64 bg-[#03030b] border-r border-purple-950/40 flex flex-col justify-between shrink-0">
          
          {/* File Repo List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.15em] flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-purple-500" /> Sandbox Repository
              </h3>
              <button
                onClick={() => setIsAddingFile(true)}
                className="p-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:text-white transition-all cursor-pointer"
                title="Create a new workspace file"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* New File Input Modal Mode inline */}
            <AnimatePresence>
              {isAddingFile && (
                <motion.form 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  onSubmit={handleCreateFile}
                  className="p-3.5 bg-purple-950/10 border border-purple-500/20 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono uppercase text-purple-400 font-black">Register File Parameter</span>
                    <button type="button" onClick={() => setIsAddingFile(false)} className="text-zinc-550 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    required
                    type="text"
                    placeholder="e.g. index.html, helper.ts"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full bg-black border border-purple-500/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    id="new_file_input_box"
                  />
                  <button
                    type="submit"
                    className="w-full py-1 bg-purple-650 hover:bg-purple-555 text-white text-[9px] font-mono font-black uppercase rounded transition-all cursor-pointer"
                  >
                    Mount File Node
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              {Object.keys(files).map(name => {
                const isCurrent = activeFile === name;
                // Count peers actively browsing this file
                const browsingPeers = presence.filter(p => p.activeFile === name);
                return (
                  <button
                    key={name}
                    onClick={() => {
                      setActiveFile(name);
                      setEditorContent(files[name] || "");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between group cursor-pointer ${
                      isCurrent 
                        ? 'bg-purple-950/20 border border-purple-500/30 text-white font-bold' 
                        : 'border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-purple-400' : 'text-zinc-650'}`} />
                      <span className="truncate">{name}</span>
                    </div>

                    {/* Active peer indicators on file */}
                    {browsingPeers.length > 0 && (
                      <div className="flex gap-1">
                        {browsingPeers.map(p => (
                          <div
                            key={p.username}
                            className="w-2 h-2 rounded-full shadow-[0_0_4px_currentColor]"
                            style={{ backgroundColor: p.color, color: p.color }}
                            title={`Active: @${p.username}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connected User Grid List */}
          <div className="p-4 border-t border-purple-950/40 bg-black/40 space-y-3">
            <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.15em] flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-purple-500" /> Connected Members
            </h4>

            <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
              {/* Myself */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: myColor }} />
                  <span className="text-[11px] font-mono text-zinc-350 truncate">@{myUsername} (You)</span>
                </div>
                <span className="text-[8px] font-mono text-purple-400 uppercase font-black tracking-widest px-1 bg-purple-500/10 rounded">Self</span>
              </div>

              {/* Other Active Users */}
              {presence.map(p => (
                <div 
                  key={p.username} 
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/40 border border-zinc-900"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-[11px] font-mono text-zinc-400 truncate">@{p.username}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[8px] uppercase">
                    {p.isTyping && (
                      <span className="text-purple-400 animate-pulse font-bold">TYPING</span>
                    )}
                    <span className="text-zinc-650 font-black">{p.activeFile}</span>
                  </div>
                </div>
              ))}
              {presence.length === 0 && (
                <div className="text-center py-2 text-[9px] font-mono text-zinc-600 uppercase italic">
                  Awaiting secondary tunnel connections...
                </div>
              )}
            </div>
          </div>

        </aside>

        {/* CENTER COLUMN: Code Viewport Editor */}
        <section className="flex-1 flex flex-col justify-between bg-[#04040a]/50 relative">
          
          {/* Editor Header Details */}
          <div className="px-4 py-2.5 bg-black/40 border-b border-purple-950/40 flex items-center justify-between font-mono text-[10px] text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 uppercase font-bold">ACTIVE FILE:</span>
              <span className="text-white font-bold bg-[#090918] px-2 py-0.5 rounded border border-purple-950/30 flex items-center gap-1">
                <FileCode2 className="w-3 h-3 text-purple-400" />
                {activeFile}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {isLicensed ? (
                <span className="text-emerald-400 font-bold font-mono animate-pulse bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  DEVELOPER LICENSE ACTIVE ({Math.floor(licenseSecondsLeft / 60)}:{(licenseSecondsLeft % 60).toString().padStart(2, '0')})
                </span>
              ) : (
                <span className="text-red-400 font-bold font-mono bg-red-950/20 px-2 py-0.5 rounded border border-red-500/30">
                  DEVELOPER LICENSE SUSPENDED
                </span>
              )}
              <span>LINE: {cursorLine} // CHAR: {cursorChar}</span>
              <button
                onClick={handleRunCode}
                disabled={isRunningCode || !isLicensed}
                className="px-3.5 py-1 bg-purple-650 hover:bg-purple-550 disabled:bg-zinc-800 text-white uppercase font-black tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer border border-purple-400/20"
              >
                <Play className="w-3 h-3 text-white shrink-0" />
                {isRunningCode ? 'Compiling...' : 'Run in Sandbox'}
              </button>
            </div>
          </div>

          {/* Code Text Grid Frame */}
          <div className="flex-1 flex font-mono text-xs overflow-hidden bg-black/35 relative">
            
            {/* Line numbers ribbon */}
            <div className="w-12 bg-black/20 border-r border-purple-950/20 text-zinc-600 text-right pr-3 select-none py-4 space-y-[4px] leading-[18px]">
              {lineNumbers.map(n => (
                <div key={n} className={n === cursorLine ? 'text-purple-400 font-extrabold' : ''}>
                  {n}
                </div>
              ))}
            </div>

            {/* Input viewport block */}
            <div className="flex-1 relative h-full">
              <textarea
                ref={editorRef}
                value={editorContent}
                onChange={handleEditorChange}
                onKeyUp={handleEditorActivity}
                onSelect={handleEditorActivity}
                onClick={handleEditorActivity}
                className={`w-full h-full bg-transparent text-zinc-300 px-4 py-4 focus:outline-none resize-none font-mono text-xs leading-[18px] relative z-10 custom-scrollbar select-text whitespace-pre overflow-auto ${!isLicensed ? 'filter blur-sm select-none pointer-events-none' : ''}`}
                style={{ tabSize: 2 }}
                placeholder="// Start writing high-integrity collaborative parameters..."
                id="main_collab_textarea"
                disabled={!isLicensed}
              />

              {!isLicensed && (
                <div className="absolute inset-0 bg-[#020205]/95 backdrop-blur-md z-25 flex flex-col items-center justify-center p-6 text-center">
                  <div className="p-4 rounded-full bg-red-500/10 border border-red-500/25 text-red-500 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans font-black text-white text-base tracking-[0.15em] uppercase mb-2">CODESPACE INTERCEPT: PAY-TO-CODE ACTIVE</h3>
                  <p className="text-zinc-400 text-xs max-w-md leading-relaxed mb-6">
                    AetherOS security frameworks require a verifiable real-money or cosmic resource lease to engage developer tool compiles. Any modifications to source lattices must be authorized automatically.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full">
                    <button
                      onClick={() => handlePurchaseLease('cph')}
                      className="p-4 rounded-xl bg-sky-950/20 hover:bg-sky-900/30 border border-sky-500/30 hover:border-sky-400 text-left transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono text-sky-400 uppercase font-black tracking-widest">Option A</span>
                        <Wallet className="w-4 h-4 text-sky-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1 uppercase">CPH Liquidity</h4>
                      <p className="text-[10px] text-zinc-400 leading-normal mb-3">Consume 100 CPH from your Physical Resource Reserve. Active for 10 min.</p>
                      <div className="text-xs font-mono font-bold text-sky-400 uppercase">
                        Cost: 100 CPH (Bal: {cphBalance} CPH)
                      </div>
                    </button>

                    <button
                      onClick={() => handlePurchaseLease('shards')}
                      className="p-4 rounded-xl bg-purple-950/20 hover:bg-purple-900/30 border border-purple-500/30 hover:border-purple-400 text-left transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono text-purple-400 uppercase font-black tracking-widest">Option B</span>
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1 uppercase">Cosmic Shards</h4>
                      <p className="text-[10px] text-zinc-400 leading-normal mb-3">Exchange 50 Cosmic Shards from your Aether Conjunction. Active for 10 min.</p>
                      <div className="text-xs font-mono font-bold text-purple-400 uppercase">
                        Cost: 50 Shards (Bal: {shards} Shards)
                      </div>
                    </button>
                  </div>

                  <p className="text-[9px] font-mono text-red-400 mt-6 uppercase tracking-widest">
                    // STRICT FAILSAFE IN PLACE. CODE COMPILATION WILL ABORT WITHOUT LEASE.
                  </p>
                </div>
              )}

              {/* Cursor Presence overlays inside text box */}
              <div className="absolute inset-x-0 inset-y-0 pointer-events-none select-none z-0">
                {presence.filter(p => p.activeFile === activeFile).map(p => {
                  // Position relative cursors logically by estimated calculations
                  const percentageOffsetLine = Math.min(100, Math.max(0, (p.line * 18) + 12));
                  const percentageOffsetChar = Math.min(100, Math.max(0, (p.char * 7) + 20));
                  return (
                    <motion.div
                      key={p.username}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute flex flex-col items-start"
                      style={{ 
                        top: `${percentageOffsetLine}px`, 
                        left: `${percentageOffsetChar}px` 
                      }}
                    >
                      {/* Active cursor line tag */}
                      <div className="w-[1.5px] h-[16px] animate-pulse" style={{ backgroundColor: p.color }} />
                      <div 
                        className="text-[7.5px] px-1 py-0.5 rounded text-white font-black uppercase tracking-wider whitespace-nowrap shadow-lg flex items-center gap-0.5"
                        style={{ backgroundColor: p.color }}
                      >
                        @{p.username}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sandbox Running Output Logs Panel (Bottom) */}
          <div className="h-44 border-t border-purple-950/40 bg-[#030309] flex flex-col relative">
            <div className="px-4 py-2 bg-black/60 border-b border-purple-950/30 flex items-center justify-between text-[9px] font-mono text-zinc-500">
              <span className="uppercase font-black flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-purple-400" /> Virtual Compilation Output Console
              </span>
              <button
                onClick={() => setRunLogs([])}
                className="hover:text-red-400 uppercase font-bold"
              >
                Clear Output
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-1 custom-scrollbar text-[10.5px] font-mono leading-relaxed text-zinc-400 select-text">
              {runLogs.map((log, index) => {
                const isError = log.includes("[Error]");
                const isSuccess = log.includes("[Success]");
                return (
                  <div key={index} className={`whitespace-pre-wrap ${isError ? 'text-red-450 text-red-400 font-bold' : isSuccess ? 'text-emerald-450 text-emerald-400' : ''}`}>
                    {log}
                  </div>
                );
              })}
              {runLogs.length === 0 && (
                <div className="text-zinc-650 italic text-[10px] text-center py-4">Output console is clear. Make changes and execute sandbox frame.</div>
              )}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: Inline Collaboration Chat Panel */}
        <aside className="w-72 bg-[#03030b] border-l border-purple-950/40 flex flex-col justify-between shrink-0 relative">
          
          <div className="p-4 border-b border-purple-950/40 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.15em] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-500" /> In-Line Editor Chat
            </h3>
            <span className="text-[8px] font-mono bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded uppercase font-black">Sync-Net</span>
          </div>

          {/* Chat feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar text-xs">
            {chat.map(msg => {
              const isMe = msg.username === myUsername;
              return (
                <div key={msg.id} className={`flex flex-col space-y-1 text-left ${isMe ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-1.5 font-mono text-[9.5px]">
                    <span className={isMe ? 'text-purple-400 font-black' : 'text-red-400 font-black'}>
                      @{msg.username}
                    </span>
                    <span className="text-zinc-600 text-[8px]">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    isMe 
                      ? 'bg-purple-650 text-white rounded-tr-none border border-purple-500/10' 
                      : 'bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-purple-950/40 bg-[#04040e]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Secure channel broadcast..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-black border border-purple-500/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500"
                id="inline_collab_chat_input"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 bg-purple-650 hover:bg-purple-550 disabled:opacity-45 text-white rounded-xl cursor-pointer transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </aside>

      </div>
    </div>
  );
};
