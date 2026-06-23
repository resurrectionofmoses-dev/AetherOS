import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { safeStorage } from '../services/safeStorage';
import { toast } from 'sonner';

// Importing standard icons from lucide-react
import { 
  Plus, 
  Search, 
  Tag, 
  Calendar, 
  Trash2, 
  Share2, 
  Sparkles, 
  Folder, 
  ExternalLink, 
  Code, 
  Layers, 
  Terminal, 
  User, 
  Globe,
  Milestone,
  Check,
  X,
  Heart,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

// Custom inline Github SVGs for absolute safety
const Github: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.2 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export interface ShowcaseProject {
  id: string;
  title: string;
  author?: string;
  shortDescription: string;
  detailedDescription: string;
  purpose?: string;
  challengesFaced?: string;
  outcomes?: string;
  technologies: string[];
  liveDemoUrl?: string;
  codeRepoUrl?: string;
  completionDate?: string;
  category: string;
  featured: boolean;
  metrics?: string[];
  role?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  status?: 'In Progress' | 'Completed' | string;
  likes?: string[];
  comments?: {
    id: string;
    username: string;
    text: string;
    timestamp: string;
  }[];
}

const DEFAULT_PROJECTS: ShowcaseProject[] = [
  {
    id: 'sp1',
    title: 'AetherOS Kernel Conduction Protocol',
    shortDescription: 'Sub-millisecond high-frequency asynchronous runtime task dispatcher executing secure logic pipelines.',
    detailedDescription: `### Architecture & Conduction Strategy
This engine forms the core architectural backbone of AetherOS's async operations, supporting zero-overhead scheduling, thread-stealing workers, and non-blocking pipeline orchestration.

#### Key Features:
- **Lock-Free Coroutines**: Tailored coroutines communicating via lock-free queue matrices.
- **Microsecond Ingress Latency**: Near zero overhead socket pipelines for stream multiplexing.
- **Sovereign Sandboxing**: Isolated memory spaces executing sandbox processes with safe state.

#### Low-Level Metrics:
- Dispatched **1.2M micro-ops/sec** at mere **12µs peak latency**.
- 100% memory safe execution stack validation via rigorous type soundness proofs.`,
    technologies: ['TypeScript', 'Rust', 'WebAssembly', 'Asynchronous', 'WebSockets'],
    liveDemoUrl: 'https://aetheros-kernel-demo.net',
    codeRepoUrl: 'https://github.com/aetheros-sovereign/kernel-conduction',
    completionDate: '2026-05-18',
    category: 'System Core',
    featured: true,
    role: 'Lead Kernel Engineer',
    metrics: ['1.2M micro-ops/sec', '12µs peak latency', '0 heap allocations in hot path'],
    mediaUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
    mediaType: 'image',
    status: 'Completed',
    likes: ['CyberWeaver_X', 'AcousticWeaver'],
    comments: [
      { id: 'c1', username: 'CyberWeaver_X', text: 'This lock-free coroutine matrix reduced my scheduler overhead to virtually zero. Astounding work!', timestamp: '2026-06-01T14:22:00Z' },
      { id: 'c2', username: 'Validator_Solo', text: 'Double checked typesafety constraints. Verification is flawless.', timestamp: '2026-06-02T09:15:00Z' }
    ]
  },
  {
    id: 'sp2',
    title: 'Eurodemux Layer-3 P2P Bridge',
    shortDescription: 'Decentralized secure peer-to-peer relay and RPC engine using cryptographic noise protocols and ephemeral keys.',
    detailedDescription: `### Secure Inter-Device Mesh Networks
Eurodemux delivers an absolute P2P signaling matrix bridging diverse sandbox nodes without standard centralized brokers.

#### Features:
- **Noise Protocol Handshakes**: Ephemeral Diffie-Hellman handshakes ensuring forward secrecy.
- **STUN/TURN Integration**: Dynamic NAT traversal executing high success rates behind symmetric firewalls.
- **Telemetry Visualizers**: Real-time signal metrics mapping network topological drift and packet loss.`,
    technologies: ['Go', 'TypeScript', 'WebRTC', 'NoiseProtocol', 'Express'],
    liveDemoUrl: 'https://eurodemux-network.io',
    codeRepoUrl: 'https://github.com/aetheros-sovereign/eurodemux-p2p',
    completionDate: '2026-04-05',
    category: 'Networking',
    featured: true,
    role: 'P2P Architect',
    metrics: ['STUN/TURN connection bypass 94%', '< 5ms round-trip latency', 'Zero-knowledge channel handshakes'],
    mediaUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    mediaType: 'image',
    status: 'In Progress',
    likes: ['Validator_Solo'],
    comments: [
      { id: 'c3', username: 'Validator_Solo', text: 'Securing ephemeral DH handshakes makes inter-device consensus incredibly bulletproof here.', timestamp: '2026-06-03T18:41:00Z' }
    ]
  },
  {
    id: 'sp3',
    title: 'Aetheric Smart Vault',
    shortDescription: 'Cryptographic multi-signature custody system with client-side zero-knowledge security models.',
    detailedDescription: `### Zero-Knowledge Multi-Sig Storage
The ultimate cryptographic lockbox. Protect highvalue keys, tokens, and records through a client-encrypted vault using local device enclave signatures.

#### Technology Stack:
- **AES-GCM-256 local encryption**: Direct client-side envelope decryption.
- **TSS Multi-party compute**: Key generation without reconstructing the private key root.
- **Immutable Audit Trails**: Anchors security checkpoint state onto unified distributed ledger frames.`,
    technologies: ['Solidity', 'TypeScript', 'Ethers.js', 'SubtleCrypto', 'React'],
    liveDemoUrl: 'https://vault.aetheros.ai',
    codeRepoUrl: 'https://github.com/aetheros-sovereign/smart-vault',
    completionDate: '2026-02-14',
    category: 'Security & Web3',
    featured: false,
    role: 'Cryptographic Lead',
    metrics: ['Zero plaintext ever leaves device', '2-of-3 threshold signature enclaves', 'Audited by Sovereign Shields'],
    mediaUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    mediaType: 'image',
    status: 'Completed',
    likes: ['CyberWeaver_X', 'DesignSage'],
    comments: [
      { id: 'c4', username: 'DesignSage', text: 'The interface here is super clean, especially the threshold visualizers.', timestamp: '2026-06-04T11:05:00Z' }
    ]
  }
];

const CATEGORIES = [
  'All',
  'System Core',
  'Networking',
  'Security & Web3',
  'Fullstack',
  'Frontend',
  'Backend',
  'AI & ML'
];

export const ProjectShowcaseView: React.FC = () => {
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ShowcaseProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Social Stats and Profile Integration
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [commentInput, setCommentInput] = useState('');
  const [postAsUsername, setPostAsUsername] = useState('');

  useEffect(() => {
    const loadProfileAndDefaultPoster = async () => {
      try {
        const stored = await safeStorage.getItem('aetheros_user_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentUserProfile(parsed);
          setPostAsUsername(parsed.username || 'Aetheros_Prime');
        } else {
          setPostAsUsername('Aetheros_Prime');
        }
      } catch (e) {
        setPostAsUsername('Aetheros_Prime');
      }
    };
    loadProfileAndDefaultPoster();
  }, [selectedProject]);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newDetailedDesc, setNewDetailedDesc] = useState('');
  const [newPurpose, setNewPurpose] = useState('');
  const [newChallenges, setNewChallenges] = useState('');
  const [newOutcomes, setNewOutcomes] = useState('');
  const [newCategory, setNewCategory] = useState('Fullstack');
  const [newTechs, setNewTechs] = useState('');
  const [newLiveUrl, setNewLiveUrl] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newFeatured, setNewFeatured] = useState(false);
  const [newMetric, setNewMetric] = useState('');
  const [newMetricsList, setNewMetricsList] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newStatus, setNewStatus] = useState<'In Progress' | 'Completed'>('Completed');

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const stored = await safeStorage.getItem('aetheros_showcase_projects');
        if (stored) {
          setProjects(JSON.parse(stored));
        } else {
          setProjects(DEFAULT_PROJECTS);
          await safeStorage.setItem('aetheros_showcase_projects', JSON.stringify(DEFAULT_PROJECTS));
        }
      } catch (err) {
        console.error('Failed to load showcase projects:', err);
        setProjects(DEFAULT_PROJECTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const saveProjects = async (updated: ShowcaseProject[]) => {
    setProjects(updated);
    try {
      await safeStorage.setItem('aetheros_showcase_projects', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save showcase projects:', err);
    }
  };

  const handleToggleLike = async (projId: string) => {
    const activeUsername = currentUserProfile?.username || 'Aetheros_Prime';
    const updated = projects.map(p => {
      if (p.id === projId) {
        const currentLikes = p.likes || [];
        const hasLiked = currentLikes.includes(activeUsername);
        const nextLikes = hasLiked 
          ? currentLikes.filter(u => u !== activeUsername)
          : [...currentLikes, activeUsername];
        return { ...p, likes: nextLikes };
      }
      return p;
    });
    await saveProjects(updated);
    
    if (selectedProject?.id === projId) {
      setSelectedProject(updated.find(p => p.id === projId) || null);
    }
    toast.success('Project like status modernized!');
  };

  const handleAddComment = async (projId: string) => {
    if (!commentInput.trim()) return;
    const author = postAsUsername || currentUserProfile?.username || 'Aetheros_Prime';
    const newComment = {
      id: `comm_${Date.now()}`,
      username: author,
      text: commentInput.trim(),
      timestamp: new Date().toISOString()
    };
    const updated = projects.map(p => {
      if (p.id === projId) {
        const currentComments = p.comments || [];
        return { ...p, comments: [...currentComments, newComment] };
      }
      return p;
    });
    await saveProjects(updated);
    setCommentInput('');
    
    if (selectedProject?.id === projId) {
      setSelectedProject(updated.find(p => p.id === projId) || null);
    }
    toast.success(`Comment successfully committed as @${author}`);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newShortDesc.trim()) {
      toast.error('Project Title and Short Description are required.');
      return;
    }

    const techArray = newTechs
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newProject: ShowcaseProject = {
      id: `sp-${Date.now()}`,
      title: newTitle.trim(),
      author: postAsUsername || currentUserProfile?.username || 'Aetheros_Prime',
      shortDescription: newShortDesc.trim(),
      detailedDescription: newDetailedDesc.trim() || 'No detailed description provided.',
      purpose: newPurpose.trim() || undefined,
      challengesFaced: newChallenges.trim() || undefined,
      outcomes: newOutcomes.trim() || undefined,
      technologies: techArray.length > 0 ? techArray : ['Web'],
      liveDemoUrl: newLiveUrl.trim() || undefined,
      codeRepoUrl: newRepoUrl.trim() || undefined,
      completionDate: newDate || new Date().toISOString().split('T')[0],
      category: newCategory,
      featured: newFeatured,
      role: newRole.trim() || undefined,
      metrics: newMetricsList.length > 0 ? newMetricsList : undefined,
      mediaUrl: newMediaUrl.trim() || undefined,
      mediaType: newMediaType,
      status: newStatus
    };

    const updated = [newProject, ...projects];
    saveProjects(updated);
    setIsFormOpen(false);
    toast.success('Successfully added showcase project!');

    // Reset Form fields
    setNewTitle('');
    setNewShortDesc('');
    setNewDetailedDesc('');
    setNewPurpose('');
    setNewChallenges('');
    setNewOutcomes('');
    setNewCategory('Fullstack');
    setNewTechs('');
    setNewLiveUrl('');
    setNewRepoUrl('');
    setNewDate('');
    setNewRole('');
    setNewFeatured(false);
    setNewMetric('');
    setNewMetricsList([]);
    setNewMediaUrl('');
    setNewMediaType('image');
    setNewStatus('Completed');
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this project from your showcase?')) {
      const updated = projects.filter(p => p.id !== id);
      saveProjects(updated);
      toast.success('Showcase project removed.');
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    }
  };

  const addMetricToForm = () => {
    if (newMetric.trim() && !newMetricsList.includes(newMetric.trim())) {
      setNewMetricsList([...newMetricsList, newMetric.trim()]);
      setNewMetric('');
    }
  };

  const removeMetricFromForm = (metric: string) => {
    setNewMetricsList(newMetricsList.filter(m => m !== metric));
  };

  const handleCopyShare = (proj: ShowcaseProject) => {
    const techString = proj.technologies.join(', ');
    const shareText = `🌌 PROJECT SHOWCASE: ${proj.title}
──────────────────────────────
${proj.shortDescription}

🛠️ Technologies: ${techString}
${proj.liveDemoUrl ? `🚀 Live Demo: ${proj.liveDemoUrl}` : ''}
${proj.codeRepoUrl ? `💻 Repository: ${proj.codeRepoUrl}` : ''}
📅 Completed: ${proj.completionDate || 'N/A'}
──────────────────────────────
Shared via AetherOS Sovereign Hub`;

    navigator.clipboard.writeText(shareText);
    toast.success('Project details formatted & copied to clipboard!');
  };

  // Get all unique technologies list for filtering
  const allTechnologies = Array.from(
    new Set(projects.flatMap(p => p.technologies))
  );

  // Filter project cards logic
  const filteredProjects = projects.filter(proj => {
    const matchesSearch = 
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.detailedDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || proj.category === selectedCategory;
    const matchesTech = !selectedTech || proj.technologies.includes(selectedTech);

    return matchesSearch && matchesCategory && matchesTech;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030307] text-gray-200 overflow-hidden relative" id="project_showcase_root">
      {/* Background cyber grid accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#080815_1px,transparent_1px),linear-gradient(to_bottom,#080815_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Primary View Header */}
      <header className="relative z-10 px-8 py-6 bg-black/40 border-b-2 border-white/5 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono font-bold tracking-widest">PRO_FILES v1.4</span>
            <div className="flex items-center gap-1.5 text-xs text-amber-500/80 font-mono">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-amber-500" />
              <span>Sovereign Portfolio Registry</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight font-sans">
            Project Showcase
          </h1>
          <p className="text-gray-400 text-xs mt-1 max-w-2xl font-sans leading-relaxed">
            Record, audit, and showcase your highly complex completed coding projects. Feature architectural blueprints, technologies, live nodes, and secure performance metrics.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_4px_12px_rgba(239,68,68,0.2)] border border-red-400/30 transition-all self-start md:self-auto"
          id="btn_add_project_showcase"
        >
          <Plus className="w-4 h-4" />
          Add To Showcase
        </motion.button>
      </header>

      {/* Filters Hub and Search Menu */}
      <section className="relative z-10 px-8 py-4 bg-black/20 border-b border-white/5 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects by engine, tech tag, descriptor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#090915] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 text-gray-200 placeholder-gray-500 transition-all font-mono"
            id="showcase_search_input"
          />
        </div>

        {/* Selected tech-tag filter helper */}
        {selectedTech && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-mono text-red-400">
            <Tag className="w-3.5 h-3.5 text-red-500" />
            <span>Tech Filter: <strong>{selectedTech}</strong></span>
            <button 
              onClick={() => setSelectedTech(null)}
              className="hover:text-white ml-1 font-bold transition-colors font-mono"
            >
              ×
            </button>
          </div>
        )}

        {/* Categories Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full no-scrollbar py-1">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all uppercase ${
                  isActive 
                    ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.05)] font-bold' 
                    : 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Container / Project Grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 font-mono text-gray-500">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span>LOADING_SECURE_REGISTRY_DATAFRAMES...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-white/5 rounded-2xl bg-black/20 h-full">
            <Folder className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">No showcase elements registered</h3>
            <p className="text-gray-500 text-xs mt-2 max-w-sm font-sans mx-auto">
              We found zero projects conforming to selected tags/filters. Add a new project or reset filters to display data.
            </p>
            {(searchQuery || selectedCategory !== 'All' || selectedTech) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedTech(null);
                }}
                className="mt-4 px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-mono rounded-lg transition-all border border-white/10 uppercase"
              >
                Reset Filter Lattice
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((proj) => {
                const hasDemo = !!proj.liveDemoUrl;
                const hasRepo = !!proj.codeRepoUrl;
                return (
                  <motion.div
                    key={proj.id}
                    layoutId={`card-${proj.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedProject(proj)}
                    className={`relative flex flex-col justify-between p-5 rounded-2xl bg-[#090915] border ${
                      proj.featured ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.02)]' : 'border-white/5 hover:border-white/10'
                    } hover:bg-[#0d0d21] cursor-pointer group transition-all duration-300 overflow-hidden min-h-[19rem] h-auto`}
                  >
                    {/* Featured badge / border illumination */}
                    {proj.featured && (
                      <div className="absolute top-0 right-0 z-10">
                        <div className="bg-amber-500/15 border-l border-b border-amber-500/30 text-amber-400 text-[8px] px-2.5 py-1 rounded-bl font-mono font-black uppercase tracking-widest flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Featured
                        </div>
                      </div>
                    )}

                    <div>
                      {/* Media Image/Video Preview */}
                      {proj.mediaUrl && (
                        <div className="w-full h-24 rounded-lg overflow-hidden border border-white/5 mb-3 select-none relative bg-black">
                          {proj.mediaType === 'video' ? (
                            <video 
                              src={proj.mediaUrl} 
                              className="w-full h-full object-cover opacity-85" 
                              muted 
                              loop 
                              playsInline
                              autoPlay
                            />
                          ) : (
                            <img 
                              src={proj.mediaUrl} 
                              alt={proj.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        </div>
                      )}

                      {/* Top detail indicator */}
                      <div className="flex items-center justify-between mb-3 text-gray-500">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono tracking-widest bg-white/5 text-gray-400 px-2 py-0.5 rounded uppercase font-bold">
                            {proj.category}
                          </span>
                          {proj.status && (
                            <span className={`text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded uppercase font-bold border ${
                              proj.status.toLowerCase().includes('in progress') 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {proj.status}
                            </span>
                          )}
                        </div>
                        {proj.completionDate && (
                          <span className="text-[10px] font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-600" />
                            {proj.completionDate}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-white group-hover:text-red-400 transition-colors uppercase tracking-tight leading-snug line-clamp-1 pr-14">
                        {proj.title}
                      </h3>

                      {/* Subtitle / Role & Author */}
                      <div className="flex items-center gap-2 mt-1 mb-2 font-mono text-[10px] select-none">
                        {proj.role && (
                          <span className="text-red-500/80 uppercase tracking-widest font-bold">
                            ROLE: {proj.role}
                          </span>
                        )}
                        <span className="text-zinc-800 font-extrabold">//</span>
                        <span className="text-zinc-500">AUTHOR:</span>
                        <span className="text-cyan-400 font-black tracking-wider">
                          @{proj.author || 'Aetheros_Prime'}
                        </span>
                      </div>

                      {/* Pitch */}
                      <p className="text-gray-400 text-xs mt-2 line-clamp-3 leading-relaxed font-sans pr-2">
                        {proj.shortDescription}
                      </p>
                    </div>

                    {/* Meta info & Action tools (Bottom line) */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
                      {/* Technologies wrap */}
                      <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                        {proj.technologies.slice(0, 4).map(tech => (
                          <span
                            key={tech}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTech(tech);
                            }}
                            className="text-[9px] font-mono px-2 py-0.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 rounded transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                        {proj.technologies.length > 4 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-black/30 text-gray-500 rounded font-bold">
                            +{proj.technologies.length - 4} More
                          </span>
                        )}
                      </div>

                      {/* Card utility tools */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex gap-2.5">
                          {hasRepo && (
                            <a
                              href={proj.codeRepoUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded text-gray-500 hover:text-white transition-colors"
                              title="Source Repository"
                            >
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {hasDemo && (
                            <a
                              href={proj.liveDemoUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded text-gray-500 hover:text-red-400 transition-colors"
                              title="Live Demo Node"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyShare(proj);
                            }}
                            className="p-1 rounded text-gray-500 hover:text-amber-500 transition-colors"
                            title="Format and copy showcase card"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLike(proj.id);
                            }}
                            className={`p-1 rounded transition-colors flex items-center gap-1.5 ${
                              (proj.likes || []).includes(currentUserProfile?.username || 'Aetheros_Prime')
                                ? 'text-rose-500 hover:text-rose-400'
                                : 'text-gray-500 hover:text-rose-500'
                            }`}
                            title="Like Project"
                          >
                            <Heart className={`w-3.5 h-3.5 ${(proj.likes || []).includes(currentUserProfile?.username || 'Aetheros_Prime') ? 'fill-current' : ''}`} />
                            <span className="font-mono text-[9px] font-black">{(proj.likes || []).length}</span>
                          </button>

                          <div 
                            className="p-1 text-gray-500 flex items-center gap-1.5"
                            title="Comments Count"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="font-mono text-[9px] font-black">{(proj.comments || []).length}</span>
                          </div>
                        </div>

                        {/* Removable system */}
                        <button
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          className="p-1.5 rounded text-gray-700 hover:text-red-500 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Project Showcase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* DETAILED PROJECT MODAL VIEW */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pr-12 md:pr-4">
            <motion.div
              layoutId={`card-${selectedProject.id}`}
              className="w-full max-w-2xl bg-[#070712] border-2 border-white/10 rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] text-gray-200 block"
            >
              <div className="flex flex-col h-[85vh] md:h-[75vh]">
                {/* Modal Header */}
                <div className="p-6 bg-black/40 border-b border-white/5 flex items-start justify-between relative">
                  <div className="pr-8">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-mono bg-red-500/10 text-red-400 px-2 py-0.5 rounded tracking-widest uppercase font-bold">
                        {selectedProject.category}
                      </span>
                      {selectedProject.status && (
                        <span className={`text-[9.5px] font-mono tracking-widest px-2 py-0.5 rounded uppercase font-bold border ${
                          selectedProject.status.toLowerCase().includes('in progress') 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {selectedProject.status}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-black text-white mt-2 leading-tight uppercase font-sans tracking-tight">
                      {selectedProject.title}
                    </h2>
                    {selectedProject.role && (
                      <div className="text-xs text-red-500/80 mt-1 font-mono uppercase tracking-widest font-bold">
                        // Assigned Role: {selectedProject.role}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedProject(null)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Contents Scroller */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 font-sans">
                  {/* Media Banner */}
                  {selectedProject.mediaUrl && (
                    <div className="w-full h-56 rounded-xl overflow-hidden border border-white/5 relative bg-black select-none">
                      {selectedProject.mediaType === 'video' ? (
                        <video 
                          src={selectedProject.mediaUrl} 
                          className="w-full h-full object-contain" 
                          controls 
                          muted 
                          playsInline 
                          autoPlay
                        />
                      ) : (
                        <img 
                          src={selectedProject.mediaUrl} 
                          alt={selectedProject.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  )}

                  {/* Technology badging layout */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Showcase Technologies Matrix</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.technologies.map(tech => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 bg-[#101026] text-xs font-mono text-gray-300 rounded-lg hover:bg-red-500/10 hover:text-red-400 cursor-pointer select-none border border-white/5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Core Metrics Bento Area */}
                  {selectedProject.metrics && selectedProject.metrics.length > 0 && (
                    <div className="p-4 bg-red-600/[0.02] border border-red-500/10 rounded-xl space-y-3">
                      <h4 className="text-[10px] font-mono uppercase text-red-400/80 tracking-wider flex items-center gap-1.5 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        Audited Performance Diagnostics
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedProject.metrics.map((met, i) => (
                          <div key={i} className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/5 text-xs font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)] flex-shrink-0" />
                            <span className="text-gray-300">{met}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project's Purpose Section */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono uppercase text-red-400 tracking-wider font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-red-500" />
                      1. Project Purpose & Objective
                    </h4>
                    <div className="bg-zinc-950/60 p-4 border border-white/5 rounded-xl text-xs leading-relaxed text-gray-300">
                      {selectedProject.purpose || selectedProject.shortDescription}
                    </div>
                  </div>

                  {/* Technologies Employed Section */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono uppercase text-sky-400 tracking-wider font-bold flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-sky-500" />
                      2. Technologies Employed
                    </h4>
                    <div className="bg-zinc-950/60 p-4 border border-white/5 rounded-xl text-xs leading-relaxed text-gray-300 space-y-1">
                      <p className="text-zinc-400">
                        Synthesized using <span className="text-white font-bold">{selectedProject.technologies.join(', ')}</span> as core structural elements to construct reliable development pipelines.
                      </p>
                    </div>
                  </div>

                  {/* Challenges Faced Section */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono uppercase text-amber-400 tracking-wider font-bold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-500" />
                      3. Challenges Faced & Bottlenecks
                    </h4>
                    <div className="bg-zinc-950/60 p-4 border border-white/5 rounded-xl text-xs leading-relaxed text-gray-300">
                      {selectedProject.challengesFaced || "Standard deployment architectures and structural thread latency constraints were solved with optimized queue routers."}
                    </div>
                  </div>

                  {/* Outcomes Section */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      4. Project Outcomes and Milestones
                    </h4>
                    <div className="bg-zinc-950/60 p-4 border border-emerald-500/10 rounded-xl text-xs leading-relaxed text-gray-300">
                      {selectedProject.outcomes || "Completed implementation with comprehensive unit coverage and fully functional live node verification."}
                    </div>
                  </div>

                  {/* Detailed Description fallback */}
                  {selectedProject.detailedDescription && selectedProject.detailedDescription.length > 100 && (
                    <div className="space-y-2 prose prose-invert max-w-none text-xs leading-relaxed text-gray-400 border-t border-white/5 pt-4">
                      <h4 className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Extended Technical Log Notes</h4>
                      <div className="bg-black/20 p-4 border border-white/5 rounded-xl whitespace-pre-wrap font-sans text-xs max-h-52 overflow-y-auto">
                        {selectedProject.detailedDescription}
                      </div>
                    </div>
                  )}

                  {/* Likes and Comments Social Block */}
                  <div className="space-y-4 border-t border-white/5 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-[10px] font-mono uppercase text-gray-500 tracking-wider font-bold">Social Interaction Portal</h4>
                        <p className="text-[9px] text-gray-500 uppercase mt-0.5">COMMUNITY TELEMETRY PROTOCOL</p>
                      </div>
                      <button
                        onClick={() => handleToggleLike(selectedProject.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                          (selectedProject.likes || []).includes(currentUserProfile?.username || 'Aetheros_Prime')
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                            : 'bg-[#101026] hover:bg-rose-500/10 border-white/5 text-gray-400 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${(selectedProject.likes || []).includes(currentUserProfile?.username || 'Aetheros_Prime') ? 'fill-current text-rose-500' : ''}`} />
                        <span>{(selectedProject.likes || []).length} Likes</span>
                      </button>
                    </div>

                    {/* Likes User List Tracker if any */}
                    {(selectedProject.likes || []).length > 0 && (
                      <div className="text-[9px] font-mono text-gray-400 leading-snug px-3 py-2 bg-black/40 rounded-lg border border-white/5 flex flex-wrap gap-1 items-center">
                        <span className="text-gray-600 uppercase font-black mr-1 select-none">Nodes who liked:</span>
                        {(selectedProject.likes || []).map((u, idx) => (
                          <span key={u} className="text-zinc-300 font-bold">
                            @{u}{idx < (selectedProject.likes || []).length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comments Node list */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-mono uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                        Network Comments Matrices ({(selectedProject.comments || []).length})
                      </h5>

                      <div className="space-y-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                        {(selectedProject.comments || []).map(comm => (
                          <div key={comm.id} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-xs font-bold text-red-400">@{comm.username}</span>
                              <span className="text-[9px] font-mono text-gray-505 text-gray-500">
                                {new Date(comm.timestamp).toLocaleTimeString() || comm.timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed font-sans">{comm.text}</p>
                          </div>
                        ))}
                        {(selectedProject.comments || []).length === 0 && (
                          <p className="text-[10px] text-gray-600 uppercase font-black text-center py-4 border border-dashed border-white/5 rounded-xl">No comments recorded. Post the first network feedback telemetry below!</p>
                        )}
                      </div>

                      {/* Comment Form Input */}
                      <div className="p-3.5 bg-black/45 border border-white/5 rounded-xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                          <label className="text-[9px] font-mono uppercase text-gray-500 font-black">Transmit Feedback as node:</label>
                          <select
                            value={postAsUsername}
                            onChange={(e) => setPostAsUsername(e.target.value)}
                            className="bg-black border border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-mono text-red-400 focus:outline-none"
                          >
                            <option value={currentUserProfile?.username || 'Aetheros_Prime'}>
                              @{currentUserProfile?.username || 'Aetheros_Prime'} (Your Active Profile Node)
                            </option>
                            <option value="CyberWeaver_X">@CyberWeaver_X (External Dev)</option>
                            <option value="AcousticWeaver">@AcousticWeaver (External Dev)</option>
                            <option value="Validator_Solo">@Validator_Solo (Security Analyst)</option>
                            <option value="DesignSage">@DesignSage (UX Specialist)</option>
                          </select>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Write secure network commentary feedback..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(selectedProject.id);
                              }
                            }}
                            className="flex-1 bg-[#090915] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-700 focus:outline-none focus:border-red-500"
                          />
                          <button
                            onClick={() => handleAddComment(selectedProject.id)}
                            disabled={!commentInput.trim()}
                            className="px-4 py-2 bg-red-600 hover:bg-red-505 hover:bg-red-500 disabled:opacity-40 disabled:bg-zinc-800 text-white rounded-lg text-xs font-black uppercase tracking-wider border border-red-400/20 transition-all font-mono"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer (Access tools) */}
                <div className="p-5 bg-black/40 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-gray-600">
                    ID: {selectedProject.id}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCopyShare(selectedProject)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-mono transition-colors uppercase border border-white/10"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Format Share
                    </button>

                    {selectedProject.codeRepoUrl && (
                      <a
                        href={selectedProject.codeRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3.5 py-1.5 bg-black/40 hover:bg-white/5 text-gray-300 hover:text-white rounded-lg text-xs font-mono transition-colors uppercase border border-white/10"
                      >
                        <Github className="w-3.5 h-3.5" />
                        Repository
                      </a>
                    )}

                    {selectedProject.liveDemoUrl && (
                      <a
                        href={selectedProject.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white rounded-lg text-xs font-mono transition-colors uppercase border border-red-500/30"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE NEW PROJECT SHOWCASE FORM (MODAL MODE) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto pr-12 md:pr-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-[#070712] border-2 border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] text-gray-200 block overflow-hidden"
            >
              <form onSubmit={handleAddProject} className="flex flex-col h-[90vh] md:h-[80vh] justify-between">
                {/* Form Header */}
                <div className="p-6 bg-black/40 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-tight">Register Completed Project</h2>
                      <span className="text-[9px] font-mono text-gray-500 tracking-wider">ADD A COMPONENT TO YOUR HUB</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Fields Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-sans">
                  {/* Row 1: Title, Category, and Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Project Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Asynchronous Threadpool Proxy"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                        id="form_title_input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                        id="form_category_select"
                      >
                        {CATEGORIES.slice(1).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Project Status *</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as 'In Progress' | 'Completed')}
                        className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                        id="form_status_select"
                      >
                        <option value="Completed font-black">Completed</option>
                        <option value="In Progress font-black">In Progress</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Role and Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Your Assigned Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Lead Dev, Fullstack Cryptic, Auditor"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Completion Date</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Pitch Description */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Card Short Description (Pitch) *</label>
                    <textarea
                      required
                      rows={2}
                      maxLength={180}
                      placeholder="Brief 1-2 sentence pitch showcasing what was optimized or resolved. Summarized on showcase tiles."
                      value={newShortDesc}
                      onChange={(e) => setNewShortDesc(e.target.value)}
                      className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      id="form_short_desc"
                    />
                  </div>

                  {/* Project's Purpose */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Project Purpose & Core Objective *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. To build an ultra-fast data processor for lock-free multi-threaded execution streams."
                      value={newPurpose}
                      onChange={(e) => setNewPurpose(e.target.value)}
                      className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500 text-xs"
                      id="form_purpose"
                    />
                  </div>

                  {/* Challenges Faced */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Challenges Faced & Bottlenecks *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Race conditions during parallel context-switches and managing sub-millisecond network sockets."
                      value={newChallenges}
                      onChange={(e) => setNewChallenges(e.target.value)}
                      className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500 text-xs"
                      id="form_challenges"
                    />
                  </div>

                  {/* Outcomes */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Project Outcomes & Performance gains *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Slashed CPU scheduling delays by 84% and achieved peak throughput of 1.2M micro-ops/sec."
                      value={newOutcomes}
                      onChange={(e) => setNewOutcomes(e.target.value)}
                      className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500 text-xs"
                      id="form_outcomes"
                    />
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Additional Technical Specs & Notes</label>
                    <textarea
                      rows={3}
                      placeholder="An optional comprehensive breakdown listing development logs, core milestones, or structural gains."
                      value={newDetailedDesc}
                      onChange={(e) => setNewDetailedDesc(e.target.value)}
                      className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500 text-xs"
                      id="form_detailed_desc"
                    />
                  </div>

                  {/* Tech Tags */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Technologies Used (Separated by commas)</label>
                    <input
                      type="text"
                      placeholder="React, TypeScript, Go, Solidity, AWS, IPFS"
                      value={newTechs}
                      onChange={(e) => setNewTechs(e.target.value)}
                      className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                      id="form_techs_input"
                    />
                  </div>

                  {/* Row 3: URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Live Demo Endpoint URL</label>
                      <input
                        type="url"
                        placeholder="https://client-node.io"
                        value={newLiveUrl}
                        onChange={(e) => setNewLiveUrl(e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Source Repository Link (GitHub)</label>
                      <input
                        type="url"
                        placeholder="https://github.com/project"
                        value={newRepoUrl}
                        onChange={(e) => setNewRepoUrl(e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Row 4: Optional Visual Showcase Media */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-3">
                    <div className="space-y-1.5 sm:col-span-2">
                       <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Showcase Media URL (Optional Image or Video)</label>
                       <input
                         type="url"
                         placeholder="e.g. https://images.unsplash.com/photo-..."
                         value={newMediaUrl}
                         onChange={(e) => setNewMediaUrl(e.target.value)}
                         className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                         id="form_media_url_input"
                       />
                     </div>

                     <div className="space-y-1.5">
                       <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Media Type</label>
                       <select
                         value={newMediaType}
                         onChange={(e) => setNewMediaType(e.target.value as 'image' | 'video')}
                         className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                         id="form_media_type_select"
                       >
                         <option value="image">Static Image</option>
                         <option value="video">Interactive Video</option>
                       </select>
                     </div>
                  </div>

                  {/* Interconnected Metric Auditor Array builder */}
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <label className="block text-[10px] font-mono uppercase text-gray-500 font-bold">Performance Benchmark Metrics</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. latency down to 14ms or 99% accuracy"
                        value={newMetric}
                        onChange={(e) => setNewMetric(e.target.value)}
                        className="flex-1 bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={addMetricToForm}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono rounded-xl hover:text-red-400 font-bold uppercase"
                      >
                        Add Check
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {newMetricsList.map((met, i) => (
                        <span key={i} className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-mono px-2 py-1 rounded">
                          <Check className="w-3 h-3 text-red-500" />
                          <span>{met}</span>
                          <button type="button" onClick={() => removeMetricFromForm(met)} className="text-red-500 hover:text-white font-black ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Featured Choice */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="form_featured_check"
                      checked={newFeatured}
                      onChange={(e) => setNewFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-red-500 focus:ring-red-500/20 bg-[#0d0d1a] border-white/10"
                    />
                    <label htmlFor="form_featured_check" className="text-[10px] font-mono uppercase text-gray-400 font-bold cursor-pointer select-none flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Highlight on showcase carousel (Featured Project)
                    </label>
                  </div>
                </div>

                {/* Form Footer Buttons */}
                <div className="p-5 bg-black/40 border-t border-white/5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white transition-colors text-xs font-mono rounded-xl uppercase"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-xl border border-red-400/30 transition-all shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
                    id="submit_add_showcase"
                  >
                    Add Component
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
