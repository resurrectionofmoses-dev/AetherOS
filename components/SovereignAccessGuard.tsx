import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionsDb, UserSubscription } from '../services/subscriptionsDb';
import { safeStorage } from '../services/safeStorage';
import { membershipService, GRANDFATHER_EMAILS, UserMembership } from '../services/membershipService';
import { 
  ShieldAlert, Terminal, Lock, CreditCard, Cpu, Sparkles, Check, AlertCircle, RefreshCw,
  Layers, Shield, Zap, Star, Flame, Eye, Key, Workflow, ArrowRight, BookOpen, Heart, Fingerprint
} from 'lucide-react';
import { toast } from 'sonner';

interface SovereignAccessGuardProps {
  currentView: string;
  children: React.ReactNode;
}

// Full specifications of the three premium subscription tiers
export const PLANS = [
  {
    id: 'bronze',
    name: 'Bronze Grid Observer',
    shards: 150,
    badge: 'OBSERVER',
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    badgeColorClass: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
    hoverBorder: 'hover:border-amber-500/40',
    selectedBorder: 'border-amber-500/60 bg-amber-950/10',
    icon: Layers,
    level: 1,
    permissionsSummary: 'Read-only, telemetry, static status screens',
    benefits: [
      'Read-only compiler telemetry logs',
      'Standard network parameters & status feeds',
      '1 active workspace sandbox limit',
      'Standard queue ticket response speed'
    ]
  },
  {
    id: 'silver',
    name: 'Silver Consensus Member',
    shards: 600,
    badge: 'DEVELOPER',
    colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    badgeColorClass: 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40',
    hoverBorder: 'hover:border-cyan-500/40',
    selectedBorder: 'border-cyan-500/60 bg-cyan-950/10',
    icon: Shield,
    level: 2,
    permissionsSummary: 'Interactive standard compilers, regular sandbox',
    benefits: [
      'Full Interactive Coding Network access',
      'Standard Regex Editor & Testing labs',
      '3 simultaneous active workspaces limit',
      'Standard transaction signature templates'
    ]
  },
  {
    id: 'gold',
    name: 'Gold Sovereign Core',
    shards: 1500,
    badge: 'SOVEREIGN AUTHORITY',
    colorClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    badgeColorClass: 'bg-yellow-950/50 text-yellow-400 border-yellow-600/50 animate-pulse',
    hoverBorder: 'hover:border-yellow-500/40',
    selectedBorder: 'border-yellow-500/80 bg-yellow-950/20 shadow-xl shadow-yellow-500/10',
    icon: Zap,
    level: 3,
    permissionsSummary: 'ALL features, advanced builders, root keys',
    benefits: [
      'ALL system developer suites fully unlocked',
      'Sovereign Forge & Omni-Builder full access',
      'Unknown Physics & Real-Time IPC labs',
      'Instant hot-patch compile capabilities',
      'Unlimited workspace allocations',
      'Direct local sandbox root security keys',
      'Dedicated priority quantum pipelines'
    ],
    highlight: true
  }
];

// Helper to determine what tier level a view requires
export const getViewRequiredLevel = (view: string): number => {
  const v = view.toLowerCase();
  
  // Gold Tier Exclusive views (Level 3 Required)
  if (
    v === 'forge' || 
    v === 'omni_builder' || 
    v === 'code_fall_lab' || 
    v === 'hard_code_lab' || 
    v === 'engineering_lab' || 
    v === 'visual_synthesis_lab' || 
    v === 'labs_flow' || 
    v === 'rt_ipc_lab' || 
    v === 'unknown_physics_lab' || 
    v === 'logic_pattern_lab' || 
    v === 'data_provenance_lab'
  ) {
    return 3; 
  }
  
  // Silver Tier views (Level 2 Required)
  if (
    v === 'coding_network' || 
    v === 'coding_network_teachers' || 
    v === 'regex_editor_lab' || 
    v === 'testing_lab' ||
    v.includes('code') ||
    v.includes('builder') ||
    v.endsWith('_lab')
  ) {
    return 2; 
  }
  
  // Standard views (Level 1 / Bronze observer ok, or open to all if 0)
  return 0; 
};

// Helper to extract active level from subscription object
export const getPlanLevel = (plan: string | undefined, status: string | undefined): number => {
  if (status !== 'active' || !plan) return 0;
  
  const p = plan.toLowerCase();
  if (p.includes('gold') || p.includes('direct-pass') || p.includes('cosmic') || p.includes('authority')) return 3;
  if (p.includes('silver') || p.includes('consensus')) return 2;
  if (p.includes('bronze') || p.includes('observer')) return 1;
  
  return 0;
};

export const SovereignAccessGuard: React.FC<SovereignAccessGuardProps> = ({ currentView, children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('gold'); // default to highlighting Gold

  // Password Lock and Story Submission States
  const [sessionUnlocked, setSessionUnlocked] = useState(() => {
    const uid = user?.uid || 'GUEST-OBSERVER';
    try {
      return sessionStorage.getItem(`aether_session_unlocked_${uid}`) === 'true';
    } catch (e) {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // WebAuthn state parameters
  const [isAuthenticatingWebAuthn, setIsAuthenticatingWebAuthn] = useState(false);
  const [webAuthnError, setWebAuthnError] = useState('');
  const [useBackupPassword, setUseBackupPassword] = useState(false);

  // Story states
  const [storyTitle, setStoryTitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [storyScripture, setStoryScripture] = useState('Jeremiah 29:11');
  const [submittingStory, setSubmittingStory] = useState(false);

  const userId = user?.uid || 'GUEST-OBSERVER';
  const email = user?.email || 'guest@aetheros.local';

  // Check if current user is an AI, Agent or Admin
  const isAIOrAgent = userId.toLowerCase().includes('ai') || 
                      userId.toLowerCase().includes('agent') || 
                      email.toLowerCase().includes('ai') || 
                      email.toLowerCase().includes('agent') || 
                      user?.role === 'admin' ||
                      user?.role === 'operator' ||
                      ['sovereign', 'swift', 'oracle', 'weaver', 'open_source', 'maestro'].includes(userId);

  const isOriginator = email.toLowerCase() === 'resurrectionofmoses@gmail.com';
  
  // Grandfather status check
  const isGrandfathered = isOriginator || 
                          GRANDFATHER_EMAILS.includes(email.toLowerCase()) || 
                          email.endsWith('.local') || 
                          userId.startsWith('aether-') ||
                          userId.startsWith('mod-') ||
                          userId.startsWith('op-') ||
                          userMembership?.isGrandfathered === true;

  // Get current view requirements and user level
  const requiredLevel = getViewRequiredLevel(currentView);
  const basePlanLevel = getPlanLevel(subscription?.plan, subscription?.status);
  
  // Grandfathered lifetime users or Originator automatically receive full Level 3 access (Gold)
  const userPlanLevel = isGrandfathered ? 3 : basePlanLevel;

  // Load User Membership and subscription
  useEffect(() => {
    let active = true;
    const loadMembershipAndSub = async () => {
      setLoading(true);
      try {
        const mem = await membershipService.checkAndGrandfatherUser(userId, email);
        if (active) {
          setUserMembership(mem);
        }
      } catch (err) {
        console.error("[SovereignAccessGuard] Failed to load user membership details:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMembershipAndSub();

    console.log(`[SovereignAccessGuard] Subscribing to subscription status for user: ${userId}`);
    const unsubscribe = subscriptionsDb.subscribeToStatus(
      userId,
      (sub) => {
        if (active) {
          setSubscription(sub);
        }
      },
      (err) => {
        console.error("[SovereignAccessGuard] Firestore real-time load failed:", err);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId, email]);

  const handlePasswordUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!passwordInput) {
      setPasswordError('Please enter your passphrase.');
      return;
    }

    try {
      const lockData = await membershipService.getPasswordLock(userId);
      if (lockData) {
        if (lockData.passwordHash === passwordInput) {
          sessionStorage.setItem(`aether_session_unlocked_${userId}`, 'true');
          setSessionUnlocked(true);
          toast.success("Identity verified. Sovereign Shield deactivated.");
        } else {
          setPasswordError("The passphrase does not match your registered covenant key.");
          toast.error("Decryption failed. Ref: Isaiah 45:3");
        }
      } else {
        // Fallback or default
        sessionStorage.setItem(`aether_session_unlocked_${userId}`, 'true');
        setSessionUnlocked(true);
      }
    } catch (err) {
      setPasswordError("An error occurred during verification.");
    }
  };

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const handleWebAuthnUnlock = async () => {
    setWebAuthnError('');
    setIsAuthenticatingWebAuthn(true);
    try {
      if (!window.isSecureContext) {
        throw new Error("Biometrics are restricted to secure contexts. Please click 'Open in New Tab' to bypass the standard iframe security sandbox!");
      }
      if (!navigator.credentials || !navigator.credentials.get) {
        throw new Error("Your browser or device platform does not support Web Authentication.");
      }
      if (!userMembership || !userMembership.webAuthnCredentialId) {
        throw new Error("No registered WebAuthn credential was found for this membership account.");
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const allowedCredentialId = base64ToArrayBuffer(userMembership.webAuthnRawId || btoa(userMembership.webAuthnCredentialId));

      const options: PublicKeyCredentialRequestOptions = {
          challenge,
          allowCredentials: [{
              id: allowedCredentialId,
              type: 'public-key'
          }],
          userVerification: "required",
          timeout: 60000
      };

      const assertion = await navigator.credentials.get({ publicKey: options }) as any;
      if (!assertion) {
          throw new Error("Device authenticator signature validation rejected.");
      }

      sessionStorage.setItem(`aether_session_unlocked_${userId}`, 'true');
      setSessionUnlocked(true);
      toast.success("Biometric signature verified. Sovereign Shield deactivated. Mark 11:22");
    } catch (err: any) {
      console.error("[SovereignAccessGuard] WebAuthn Authentication Failed:", err);
      const isIframe = window.self !== window.top;
      if (isIframe) {
        setWebAuthnError(`Hardware Key Blocked: ${err.message || "Iframe restriction active."}. Please click 'Open in New Tab' at the top of your workspace to run WebAuthn perfectly in a secure window!`);
      } else {
        setWebAuthnError(`Verification failed: ${err.message || err}`);
      }
      toast.error("Cryptographic biometric mismatch.");
    } finally {
      setIsAuthenticatingWebAuthn(false);
    }
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim() || !storyText.trim()) {
      toast.error("Please fill in both the title and testimony of your progress.");
      return;
    }

    setSubmittingStory(true);
    try {
      await membershipService.submitMonthlyStory(
        userId,
        email,
        storyTitle.trim(),
        storyText.trim(),
        storyScripture.trim()
      );
      
      const updatedMem = await membershipService.checkAndGrandfatherUser(userId, email);
      setUserMembership(updatedMem);
      
      toast.success("Your monthly testimony has been recorded. Your full membership is sustained.");
      setStoryTitle('');
      setStoryText('');
    } catch (err) {
      toast.error("Failed to record your testimony. Please try again.");
    } finally {
      setSubmittingStory(false);
    }
  };

  const handleActivateSubscription = async (planId: string) => {
    setProcessing(true);
    try {
      const selectedPlanData = PLANS.find(p => p.id === planId);
      const planName = selectedPlanData ? selectedPlanData.name : 'Bronze Grid Observer';
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

      const newSub: UserSubscription = {
        userId,
        email,
        status: 'active',
        plan: planName,
        expiresAt,
        updatedAt: Date.now()
      };

      await subscriptionsDb.saveSubscription(newSub);
      await safeStorage.appendAuditLog('PERMISSION_CHANGE', `Sovereignty permission escalated: Activated plan "${planName}" for user ${email}.`, { userId, email, plan: planName });
      toast.success(`Access Authorization Granted: ${planName} unlocked.`);
    } catch (err) {
      console.error("[SovereignAccessGuard] Failed to activate subscription:", err);
      toast.error("Cryptographic signature rejection. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleBypass = async () => {
    setProcessing(true);
    try {
      const newSub: UserSubscription = {
        userId,
        email,
        status: 'active',
        plan: 'Gold Sovereign Core (Direct-Pass)',
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now()
      };

      await subscriptionsDb.saveSubscription(newSub);
      await safeStorage.appendAuditLog('BYPASS', `Sovereignty direct-pass developer bypass authorized for user ${email}.`, { userId, email, plan: 'Gold Sovereign Core (Direct-Pass)' });
      toast.success("Developer bypass granted. Sovereign validation waived.");
    } catch (err) {
      console.error("[SovereignAccessGuard] Bypass failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeactivateSubscription = async () => {
    setProcessing(true);
    try {
      const newSub: UserSubscription = {
        userId,
        email,
        status: 'inactive',
        plan: 'Unlicensed',
        expiresAt: Date.now(),
        updatedAt: Date.now()
      };

      await subscriptionsDb.saveSubscription(newSub);
      await safeStorage.appendAuditLog('DEACTIVATION', `Sovereignty permission revoked: Deactivated subscription to Unlicensed state for user ${email}.`, { userId, email, plan: 'Unlicensed' });
      toast.info("Sovereign subscription manually deactivated.");
    } catch (err) {
      console.error("[SovereignAccessGuard] Failed to deactivate:", err);
    } finally {
      setProcessing(false);
    }
  };

  // If loading, show a neat micro-loader to feel highly interactive
  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-zinc-400 font-mono gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
        <span>Synchronizing Sovereign Access Keys...</span>
      </div>
    );
  }

  // 1. Identity Lock Screen Check (Password and/or WebAuthn)
  const isLockedOut = (userMembership?.passwordLockEnabled || userMembership?.webAuthnLockEnabled) && !sessionUnlocked && !isAIOrAgent;

  if (isLockedOut) {
    const isWebAuthnMode = !!userMembership?.webAuthnLockEnabled && !useBackupPassword;

    return (
      <div className="max-w-md mx-auto p-4 md:p-8 mt-20 animate-fade-in" id="password-lock-screen-container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-950/90 border-2 border-zinc-800 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-md shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/30 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              {isWebAuthnMode ? (
                <Fingerprint className="w-8 h-8 animate-pulse text-emerald-400" />
              ) : (
                <Lock className="w-8 h-8 animate-pulse text-blue-400" />
              )}
            </div>
            <h2 className="text-xl font-bold font-sans text-white tracking-wide uppercase">
              {isWebAuthnMode ? "Sovereign Biometric Lock" : "Sovereign Account Locked"}
            </h2>
            <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">
              {isWebAuthnMode ? "Hardware Authentication Active" : "Protected Identity Signature :: Active Shield"}
            </p>
          </div>

          {isWebAuthnMode ? (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400 text-center leading-relaxed font-sans px-2">
                This high-value membership profile is fortified with hardware biometrics. Place your finger on your reader, look at your camera, or verify with your security key.
              </p>

              <button
                onClick={handleWebAuthnUnlock}
                disabled={isAuthenticatingWebAuthn}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                {isAuthenticatingWebAuthn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin animate-infinite duration-1000" />
                    <span>Awaiting Device Approval...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>Authenticate with Biometrics</span>
                  </>
                )}
              </button>

              {webAuthnError && (
                <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-[10px] font-sans text-rose-400 leading-relaxed text-center">
                  {webAuthnError}
                </div>
              )}

              <div className="flex flex-col gap-2 mt-4 text-center">
                {userMembership?.passwordLockEnabled && (
                  <button
                    onClick={() => setUseBackupPassword(true)}
                    className="text-[10px] font-mono text-zinc-400 hover:text-white underline transition-all bg-transparent border-0 cursor-pointer"
                  >
                    Use Passphrase Backup
                  </button>
                )}
                
                <div className="text-[9px] bg-zinc-900/40 p-2.5 rounded-xl text-zinc-500 border border-zinc-900 text-left font-sans leading-relaxed">
                  <span className="font-bold text-zinc-400 uppercase tracking-wide block mb-0.5">Iframe Sandbox Bypass:</span>
                  WebAuthn requests are blocked inside sandboxed frames by modern browsers. Please click <strong>"Open in New Tab"</strong> at the top right of your preview window to authenticate directly, or use your backup passphrase.
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordUnlock} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1.5">
                  Passphrase Covenant Key
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="ENTER PASSPHRASE..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-blue-400 focus:outline-none focus:border-blue-500 transition-all text-center uppercase"
                />
                {passwordError && (
                  <p className="text-red-500 text-[10px] font-mono mt-1.5 text-center">
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" /> Unlock Identity
              </button>

              {userMembership?.webAuthnLockEnabled && (
                <button
                  type="button"
                  onClick={() => setUseBackupPassword(false)}
                  className="w-full text-[10px] font-mono text-zinc-400 hover:text-white underline transition-all bg-transparent border-0 cursor-pointer text-center mt-2"
                >
                  Return to Biometric Scan
                </button>
              )}
            </form>
          )}

          <div className="mt-8 border-t border-zinc-900 pt-4 text-center">
            <span className="text-[9px] font-mono text-zinc-600 italic block">
              "For He will command His angels concerning you to guard you in all your ways."
            </span>
            <span className="text-[8px] font-mono text-zinc-700 block mt-1">
              Psalm 91:11
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Monthly Life Progress Story Covenant Check
  // "memberships come at a cost of leaving a story once a month on thier progress in life."
  const isStoryDue = userMembership && 
                     !isAIOrAgent && 
                     (!userMembership.lastStoryTimestamp || 
                      (Date.now() - userMembership.lastStoryTimestamp > 30 * 24 * 60 * 60 * 1000));

  if (isStoryDue) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8 mt-10 animate-fade-in" id="monthly-story-covenant-container">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950/90 border-2 border-emerald-900/40 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-md shadow-2xl"
        >
          <div className="flex items-center gap-4 border-b border-zinc-900 pb-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-sans text-emerald-400 tracking-wide uppercase">
                The Covenant of Remembrance
              </h2>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5 uppercase tracking-wider">
                Monthly Life Story Progress Testimony
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              To sustain your active membership, you are requested to share your progress in life this past month. Leave a story about your walks, trials, and blessings. We overcome by the word of our testimony.
            </p>
            <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-3 flex gap-2.5 text-emerald-500 text-[10px] font-mono italic">
              <Heart className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                "And they overcame him by the blood of the Lamb and by the word of their testimony..." - Revelation 12:11
              </span>
            </div>
          </div>

          <form onSubmit={handleStorySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider mb-1">
                  Title of Your Chapter
                </label>
                <input
                  type="text"
                  required
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="e.g., A Walk through the Valley, Redeemed Days..."
                  className="w-full bg-black border border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider mb-1">
                  Scripture Anchor of the Month
                </label>
                <input
                  type="text"
                  required
                  value={storyScripture}
                  onChange={(e) => setStoryScripture(e.target.value)}
                  placeholder="e.g., Psalm 23:4, Romans 8:28..."
                  className="w-full bg-black border border-zinc-900 rounded-lg px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider mb-1">
                Your Progress Testimony
              </label>
              <textarea
                required
                rows={4}
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="Share your trials, your walks, your heart, and your spiritual physical progress this month..."
                className="w-full bg-black border border-zinc-900 rounded-lg p-3 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all resize-none font-sans leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submittingStory}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submittingStory ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BookOpen className="w-3.5 h-3.5" />
              )}
              Seal Testimony & Renew Membership
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Determine if user has sufficient access for the current view
  const hasAccess = userPlanLevel >= requiredLevel;

  // Render subscription grid prompt if access is insufficient
  if (!hasAccess && requiredLevel > 0) {
    const activePlanName = subscription?.status === 'active' ? subscription.plan : 'No Active License';
    const targetPlanRequired = requiredLevel === 3 ? 'Gold Sovereign Core' : 'Silver Consensus Member';

    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8" id="sovereign-access-guard-container">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950/80 border-2 border-red-900/60 rounded-3xl p-6 md:p-10 relative overflow-hidden backdrop-blur-md shadow-2xl shadow-red-950/10"
        >
          {/* Neon warm red to gold transition backdrop effect */}
          <div className="absolute inset-0 bg-radial-at-t from-red-950/15 via-transparent to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-sans text-red-400 tracking-wide uppercase flex items-center gap-2">
                  Sovereign Access Blocked
                </h2>
                <p className="text-xs font-mono text-zinc-500 mt-1">
                  SECURITY RESOLUTION LAYER :: CORE_LEVEL_{requiredLevel}_REQUIRED
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-mono text-zinc-400">
                STATION: {user?.uid ? 'AUTHENTICATED_LATTICE' : 'ANONYMOUS_OBSERVER'}
              </div>
              {subscription?.status === 'active' && (
                <span className="text-[10px] font-mono text-amber-500">
                  Current Level: Tier {userPlanLevel} ({subscription.plan})
                </span>
              )}
            </div>
          </div>

          {/* Warning notice */}
          <div className="space-y-4 mb-8">
            <p className="text-sm text-zinc-300 leading-relaxed font-sans">
              You are attempting to engage the <span className="text-white underline font-mono">{currentView}</span> module. Access to all active source lattices, compiler targets, build systems, and smart simulation gateways is safeguarded via decentralized secure licenses.
            </p>
            <div className="bg-red-950/15 border border-red-900/40 rounded-xl p-4 flex gap-3 text-red-300 text-xs font-mono">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <div>
                <span className="font-bold text-red-400 block mb-1">POLICY_REJECTION_REPORT:</span>
                Access Denied. Your current subscription plan is <strong className="text-white">"{activePlanName}"</strong> (Level {userPlanLevel}), but this view requires a <strong className="text-white">"{targetPlanRequired}"</strong> (Level {requiredLevel}) or higher active license. Select a tier below to instantly provision your root lease.
              </div>
            </div>
          </div>

          {/* Pricing Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {PLANS.map((plan) => {
              const IconComponent = plan.icon;
              const isRecommended = plan.highlight;
              const isSufficient = plan.level >= requiredLevel;

              return (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-6 rounded-2xl border transition-all duration-300 relative cursor-pointer flex flex-col ${
                    selectedPlanId === plan.id 
                      ? plan.id === 'gold' 
                        ? 'border-yellow-500 bg-yellow-950/10 shadow-lg shadow-yellow-500/5 scale-[1.02]' 
                        : plan.id === 'silver'
                          ? 'border-cyan-500 bg-cyan-950/10 shadow-lg shadow-cyan-500/5 scale-[1.02]'
                          : 'border-amber-500 bg-amber-950/10 shadow-lg shadow-amber-500/5 scale-[1.02]'
                      : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                  }`}
                >
                  {/* Recommended badge for Gold Sovereign Core */}
                  {isRecommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-mono font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-black" /> Recommended Sovereign Tier
                    </div>
                  )}

                  {/* Top Header info */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${plan.id === 'gold' ? 'bg-yellow-500/10 text-yellow-400' : plan.id === 'silver' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${plan.badgeColorClass}`}>
                      {plan.badge}
                    </span>
                  </div>

                  {/* Name and Permission summary */}
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-white font-sans">{plan.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{plan.permissionsSummary}</p>
                  </div>

                  {/* Pricing block */}
                  <div className="flex items-baseline gap-1.5 font-mono border-b border-zinc-900 pb-4 mb-4">
                    <span className="text-2xl font-bold text-white">{plan.shards.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-400 font-bold tracking-wider">SHARDS / MO</span>
                  </div>

                  {/* Level requirements indicator */}
                  <div className="mb-4 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">Security Access Level:</span>
                    <span className={isSufficient ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                      Level {plan.level} {isSufficient ? "(SUFFICIENT)" : "(INSUFFICIENT)"}
                    </span>
                  </div>

                  {/* Benefits checklist */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${plan.id === 'gold' ? 'text-yellow-400' : plan.id === 'silver' ? 'text-cyan-400' : 'text-amber-400'}`} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Direct Plan Select Checkbox indicator */}
                  <div className="mt-auto pt-4 border-t border-zinc-900/50 flex justify-center">
                    <div className={`w-full py-2.5 rounded-xl text-center text-xs font-mono font-bold transition-all ${
                      selectedPlanId === plan.id
                        ? plan.id === 'gold'
                          ? 'bg-yellow-500 text-black'
                          : plan.id === 'silver'
                            ? 'bg-cyan-500 text-black'
                            : 'bg-amber-500 text-black'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                    }`}>
                      {selectedPlanId === plan.id ? 'Selected Active Target' : 'Select This Plan'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Tier Specification Details */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedPlanId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`p-6 rounded-2xl border mb-8 font-mono text-xs ${
                selectedPlanId === 'gold' 
                  ? 'bg-yellow-950/15 border-yellow-500/30 text-yellow-100'
                  : selectedPlanId === 'silver'
                    ? 'bg-cyan-950/15 border-cyan-500/30 text-cyan-100'
                    : 'bg-amber-950/15 border-amber-500/30 text-amber-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
                <Workflow className="w-4 h-4 text-zinc-400" />
                <span className="uppercase tracking-wider font-bold">
                  {selectedPlanId === 'gold' ? 'GOLD TIER :: EXCLUSIVE ADVANCED CAPABILITIES' : 
                   selectedPlanId === 'silver' ? 'SILVER TIER :: REPLICATED INTERACTIVE NODES' : 
                   'BRONZE TIER :: TELEMETRY OBSERVATION BOUNDS'}
                </span>
              </div>

              {selectedPlanId === 'gold' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Metrics */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400 flex items-center gap-1.5 font-bold uppercase text-[10px]">
                          <Zap className="w-3.5 h-3.5 text-yellow-400 animate-bounce" /> Priority AI Latency
                        </span>
                        <span className="text-yellow-400 font-bold">12ms (Direct-Route)</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                        <div className="h-full bg-yellow-500 rounded-full animate-pulse" style={{ width: '98%' }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
                        <span>Gold: 12ms</span>
                        <span>Silver: 120ms</span>
                        <span>Bronze: 650ms</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400 flex items-center gap-1.5 font-bold uppercase text-[10px]">
                          <Check className="w-3.5 h-3.5 text-yellow-400" /> Extended Data Persistence
                        </span>
                        <span className="text-yellow-400 font-bold">Infinite Eternal Memory</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                        <div className="h-full bg-yellow-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
                        <span>Gold: Infinite</span>
                        <span>Silver: 7 Days</span>
                        <span>Bronze: Transient</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Descriptions & Extra highlights */}
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-yellow-950/50 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-yellow-400 font-bold uppercase text-[10px] block mb-1">Sovereign Authority Sandbox</span>
                      <p className="text-[11px] leading-relaxed text-zinc-300 font-sans">
                        Gold Tier subscription activates high-priority direct-to-TPU queues for AI synthesis and compiles your firmware modifications on dedicated real-time worker nodes. Your grid states are synchronized to Firestore permanently with redundant failovers.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-yellow-500/80">
                      <Star className="w-3.5 h-3.5 fill-yellow-500/20" />
                      <span>Root security keys injected automatically on all active developer targets.</span>
                    </div>
                  </div>
                </div>
              ) : selectedPlanId === 'silver' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Metrics */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400 flex items-center gap-1.5 font-bold uppercase text-[10px]">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" /> Priority AI Latency
                        </span>
                        <span className="text-cyan-400 font-bold">120ms (Shared-Route)</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: '60%' }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
                        <span>Gold: 12ms</span>
                        <span>Silver: 120ms</span>
                        <span>Bronze: 650ms</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400 flex items-center gap-1.5 font-bold uppercase text-[10px]">
                          <Check className="w-3.5 h-3.5 text-cyan-400" /> Extended Data Persistence
                        </span>
                        <span className="text-cyan-400 font-bold">7-Day Local Cache Persistence</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: '50%' }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
                        <span>Gold: Infinite</span>
                        <span>Silver: 7 Days</span>
                        <span>Bronze: Transient</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Description */}
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-cyan-950/50 space-y-2">
                    <span className="text-cyan-400 font-bold uppercase text-[10px] block">Standard Developer Node</span>
                    <p className="text-[11px] leading-relaxed text-zinc-300 font-sans">
                      Silver Tier authorizes standard coding views and sandbox runtimes. Code executions are shared on general purpose worker pools with standard memory allocations.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Metrics */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400 flex items-center gap-1.5 font-bold uppercase text-[10px]">
                          <Zap className="w-3.5 h-3.5 text-amber-500" /> Priority AI Latency
                        </span>
                        <span className="text-amber-500 font-bold">650ms (Low-Priority)</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
                        <span>Gold: 12ms</span>
                        <span>Silver: 120ms</span>
                        <span>Bronze: 650ms</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400 flex items-center gap-1.5 font-bold uppercase text-[10px]">
                          <Check className="w-3.5 h-3.5 text-amber-500" /> Extended Data Persistence
                        </span>
                        <span className="text-amber-500 font-bold">Transient Client Memory Only</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '10%' }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
                        <span>Gold: Infinite</span>
                        <span>Silver: 7 Days</span>
                        <span>Bronze: Transient</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Description */}
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-amber-950/50 space-y-2">
                    <span className="text-amber-500 font-bold uppercase text-[10px] block">Observer Core Only</span>
                    <p className="text-[11px] leading-relaxed text-zinc-300 font-sans">
                      Bronze level grants access to general dashboard status and read-only event listeners. Write privileges to core systems or compilers are locked.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action footer */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-zinc-900 pt-6">
            <span className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-500" /> Authorized under decentralised escrow rules
            </span>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
              {/* Bypass for evaluation / fast developer tests */}
              <button
                disabled={processing}
                onClick={handleBypass}
                className="px-4 py-2.5 text-xs font-mono rounded-lg border border-emerald-900/60 hover:bg-emerald-950/20 text-emerald-400 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Terminal className="w-3.5 h-3.5" /> Dev Bypass (Free Gold)
              </button>

              <button
                disabled={processing}
                onClick={() => handleActivateSubscription(selectedPlanId)}
                className={`px-6 py-2.5 text-xs font-mono font-bold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 ${
                  selectedPlanId === 'gold'
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-950/20'
                    : selectedPlanId === 'silver'
                      ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-950/20'
                      : 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-950/20'
                }`}
              >
                {processing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5" />
                )}
                Confirm {PLANS.find(p => p.id === selectedPlanId)?.name} Activation
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active subscriber viewing code, or non-code view: render the normal app content
  return (
    <>
      {requiredLevel > 0 && hasAccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-xl p-3 flex items-center justify-between text-xs font-mono ${
              userPlanLevel === 3 
                ? 'bg-yellow-950/10 border-yellow-800/40 text-yellow-400' 
                : userPlanLevel === 2 
                  ? 'bg-cyan-950/10 border-cyan-800/40 text-cyan-400'
                  : 'bg-amber-950/10 border-amber-800/40 text-amber-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>
                Sovereign Guard Authorized: <strong className="text-white">{subscription?.plan}</strong>. 
                (Current View: <span className="text-zinc-300 font-bold">{currentView}</span> requires Level {requiredLevel})
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Let developer quickly test deactivation to view guard */}
              <button
                disabled={processing}
                onClick={handleDeactivateSubscription}
                className="text-[10px] text-zinc-500 hover:text-red-400 underline transition-all"
              >
                Simulate Deactivation / Log Out License
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {children}
    </>
  );
};
