import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, Shield, Lock, Unlock, Key, BookOpen, Calendar, PlusCircle, Search, 
  Sparkles, Globe, Terminal, ShieldAlert, Heart, UserCheck, Eye, RefreshCw, FileText, Cpu, Fingerprint
} from 'lucide-react';
import { membershipService, UserMembership, TesterKey, LifeStory, GRANDFATHER_EMAILS } from '../services/membershipService';
import { toast } from 'sonner';

export const AccountManagerView: React.FC = () => {
    const { user, userRegistry } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'registry' | 'tester_keys' | 'covenant'>('covenant');

    // Admin authorization check
    const isAuthorized = ['moderator', 'operator', 'admin'].includes(user?.role || '');

    // Force standard users to stay on the personal Covenant tab
    useEffect(() => {
        if (!isAuthorized) {
            setActiveTab('covenant');
        } else {
            setActiveTab('registry');
        }
    }, [isAuthorized]);

    // State for tester keys
    const [testerKeys, setTesterKeys] = useState<TesterKey[]>([]);
    const [newKeyTargetEmail, setNewKeyTargetEmail] = useState('');
    const [generatingKey, setGeneratingKey] = useState(false);

    // State for user membership & personal covenant details
    const [membership, setMembership] = useState<UserMembership | null>(null);
    const [personalStories, setPersonalStories] = useState<LifeStory[]>([]);
    const [loadingMembership, setLoadingMembership] = useState(true);

    // Tester key claim
    const [claimKeyInput, setClaimKeyInput] = useState('');
    const [claiming, setClaiming] = useState(false);

    // Password lock configuration
    const [pwdLockEnabled, setPwdLockEnabled] = useState(false);
    const [newPwdLockInput, setNewPwdLockInput] = useState('');
    const [savingLock, setSavingLock] = useState(false);

    // WebAuthn Biometric configuration
    const [webAuthnLockEnabled, setWebAuthnLockEnabled] = useState(false);
    const [isRegisteringWebAuthn, setIsRegisteringWebAuthn] = useState(false);

    // Story form
    const [storyTitle, setStoryTitle] = useState('');
    const [storyText, setStoryText] = useState('');
    const [storyScripture, setStoryScripture] = useState('Psalm 103:2');
    const [submittingStory, setSubmittingStory] = useState(false);

    const userId = user?.uid || 'GUEST-OBSERVER';
    const email = user?.email || 'guest@aetheros.local';

    // Originator checking
    const isOriginator = email.toLowerCase() === 'resurrectionofmoses@gmail.com';

    // AI or Agent check
    const isAIOrAgent = userId.toLowerCase().includes('ai') || 
                        userId.toLowerCase().includes('agent') || 
                        email.toLowerCase().includes('ai') || 
                        email.toLowerCase().includes('agent') || 
                        ['sovereign', 'swift', 'oracle', 'weaver', 'open_source', 'maestro'].includes(userId);

    // Load keys and membership details
    const loadData = async () => {
        setLoadingMembership(true);
        try {
            const mem = await membershipService.checkAndGrandfatherUser(userId, email);
            setMembership(mem);
            setPwdLockEnabled(mem.passwordLockEnabled);
            setWebAuthnLockEnabled(!!mem.webAuthnLockEnabled);
            
            const stories = await membershipService.getUserStories(userId);
            setPersonalStories(stories);

            if (isAuthorized) {
                const keys = await membershipService.getTesterKeys();
                setTesterKeys(keys);
            }
        } catch (err) {
            console.error('[AccountManagerView] Failed to load covenant profiles:', err);
        } finally {
            setLoadingMembership(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [userId, email, isAuthorized]);

    // Handle generating a new tester key
    const handleGenerateTesterKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyTargetEmail.trim()) {
            toast.error('Please enter a target email address.');
            return;
        }

        setGeneratingKey(true);
        try {
            // Generate simple high-integrity key (TEST-777-RAND)
            const randHex = Math.floor(1000 + Math.random() * 9000);
            const generatedKey = `TEST-777-${randHex}`;
            await membershipService.addTesterKey(generatedKey, newKeyTargetEmail.trim());
            toast.success(`Tester Key ${generatedKey} provisioned for ${newKeyTargetEmail}`);
            setNewKeyTargetEmail('');
            const keys = await membershipService.getTesterKeys();
            setTesterKeys(keys);
        } catch (err) {
            toast.error('Failed to register tester key.');
        } finally {
            setGeneratingKey(false);
        }
    };

    // Handle claiming tester key
    const handleClaimKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!claimKeyInput.trim()) {
            toast.error('Please input a tester key.');
            return;
        }

        setClaiming(true);
        try {
            const success = await membershipService.claimTesterKey(claimKeyInput.toUpperCase().trim(), email, userId);
            if (success) {
                toast.success('Your covenant lease has been successfully validated. Lifetime access unlocked!');
                setClaimKeyInput('');
                await loadData();
            } else {
                toast.error('Rejection: Key invalid or registered to a different email address.');
            }
        } catch (err) {
            toast.error('An error occurred during verification.');
        } finally {
            setClaiming(false);
        }
    };

    // Handle setting up Password Lock
    const handleSavePasswordLock = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingLock(true);
        try {
            if (pwdLockEnabled) {
                if (!newPwdLockInput.trim()) {
                    toast.error('Please input a secure passphrase key.');
                    setSavingLock(false);
                    return;
                }
                await membershipService.setPasswordLock(userId, email, true, newPwdLockInput.trim());
                toast.success('Sovereign account password lock active.');
                setNewPwdLockInput('');
            } else {
                await membershipService.setPasswordLock(userId, email, false, '');
                toast.info('Account password lock deactivated.');
            }
            await loadData();
        } catch (err) {
            toast.error('Failed to change security lock configuration.');
        } finally {
            setSavingLock(false);
        }
    };

    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
        const binary = String.fromCharCode(...new Uint8Array(buffer));
        return btoa(binary);
    };

    const handleRegisterWebAuthn = async () => {
        setIsRegisteringWebAuthn(true);
        try {
            if (!window.isSecureContext) {
                throw new Error("Web Authentication API requires a secure context (HTTPS or localhost). If you are inside the default development iframe, please click the 'Open in New Tab' icon at the top of your preview screen to allow biometric hardware keys.");
            }
            if (!navigator.credentials || !navigator.credentials.create) {
                throw new Error("Your browser or device platform does not support Web Authentication.");
            }

            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const userIdBytes = new TextEncoder().encode(userId);

            const options: PublicKeyCredentialCreationOptions = {
                challenge,
                rp: {
                    name: "AetherOS Sovereign Console",
                    id: window.location.hostname
                },
                user: {
                    id: userIdBytes,
                    name: email,
                    displayName: user?.displayName || email.split('@')[0]
                },
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 }, // ES256
                    { type: "public-key", alg: -257 } // RS256
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform", // forces platform (Touch ID / Face ID / Windows Hello)
                    userVerification: "required"
                },
                timeout: 60000
            };

            const credential = await navigator.credentials.create({ publicKey: options }) as any;
            if (!credential) {
                throw new Error("No credential was returned from your security module.");
            }

            const credentialId = credential.id;
            const rawId = arrayBufferToBase64(credential.rawId);
            let publicKeyBase64 = "";
            if (credential.response && credential.response.getPublicKey) {
                const pubKeyBuffer = credential.response.getPublicKey();
                publicKeyBase64 = arrayBufferToBase64(pubKeyBuffer);
            }

            await membershipService.setWebAuthnLock(userId, email, true, credentialId, publicKeyBase64, rawId);
            toast.success("Holy Biometric Signature Sealed! WebAuthn Biometric Lock is now ACTIVE. Psalm 139:14");
            await loadData();
        } catch (err: any) {
            console.error("[WebAuthn Enrollment Error]", err);
            const isIframe = window.self !== window.top;
            if (isIframe) {
                toast.error(`Biometric Blocked: ${err.message || "Iframe restriction active."}. Since browsers block biometric hardware inside sandboxed iframes, please click the "Open in New Tab" icon at the top of AetherOS to run WebAuthn perfectly!`);
            } else {
                toast.error(`Device Registration Refused: ${err.message || err}`);
            }
        } finally {
            setIsRegisteringWebAuthn(false);
        }
    };

    const handleDisableWebAuthn = async () => {
        try {
            await membershipService.disableWebAuthnLock(userId, email);
            toast.info("Biometric lock removed successfully.");
            await loadData();
        } catch (err) {
            toast.error("Failed to deactivate biometric signature.");
        }
    };

    // Handle leaving a monthly story progress log
    const handleStorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storyTitle.trim() || !storyText.trim()) {
            toast.error('Please fill in both the title and testimony of your progress.');
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
            toast.success('Your progress story has been recorded. Your full membership is sustained!');
            setStoryTitle('');
            setStoryText('');
            await loadData();
        } catch (err) {
            toast.error('Failed to seal your testimony.');
        } finally {
            setSubmittingStory(false);
        }
    };

    // Filtered accounts for registry
    const filteredAccounts = useMemo(() => {
        return userRegistry.filter(u => 
            u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.sovereignty && u.sovereignty.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [userRegistry, searchQuery]);

    return (
        <div className="flex-1 flex flex-col bg-[#050505] p-6 overflow-hidden">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Shield className="w-8 h-8 text-cyan-500" />
                        Covenant Identity Center
                    </h1>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1 pl-1">
                        Sovereign access guards, memberships, locks, and progress logs
                    </p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/60">
                    {isAuthorized && (
                        <>
                            <button 
                                onClick={() => setActiveTab('registry')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${activeTab === 'registry' ? 'bg-cyan-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                            >
                                Registry
                            </button>
                            <button 
                                onClick={() => setActiveTab('tester_keys')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${activeTab === 'tester_keys' ? 'bg-cyan-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                            >
                                Provision Keys
                            </button>
                        </>
                    )}
                    <button 
                        onClick={() => setActiveTab('covenant')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${activeTab === 'covenant' ? 'bg-cyan-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        My Membership Covenant
                    </button>
                </div>
            </header>

            {loadingMembership ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 font-mono gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                    <span>Synchronizing Identity Vault...</span>
                </div>
            ) : (
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {/* Tab 1: Registry */}
                        {activeTab === 'registry' && isAuthorized && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input 
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="FILTER IDENTITY..."
                                            className="bg-black border border-zinc-800 rounded-xl px-10 py-2.5 text-xs font-black uppercase text-blue-500 focus:outline-none focus:border-blue-500 w-64 transition-all"
                                        />
                                    </div>
                                    <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-400">
                                        Total registered user index matches: <span className="text-white font-bold">{filteredAccounts.length}</span>
                                    </div>
                                </div>

                                <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-black/40">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-900/10">
                                                <th className="py-4 px-4">Identity Profile</th>
                                                <th className="py-4 px-4 text-center">Access Role</th>
                                                <th className="py-4 px-4 text-center">Sovereignty</th>
                                                <th className="py-4 px-4 text-center">Security (Lock)</th>
                                                <th className="py-4 px-4 text-center">Covenant Stories</th>
                                                <th className="py-4 px-4 text-right">Last Sync</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-900/50">
                                            {filteredAccounts.map((account) => {
                                                const isUserOriginator = account.email.toLowerCase() === 'resurrectionofmoses@gmail.com';
                                                const isUserGrandfathered = isUserOriginator || GRANDFATHER_EMAILS.includes(account.email.toLowerCase()) || account.uid.startsWith('aether-');
                                                return (
                                                    <motion.tr 
                                                        key={account.uid}
                                                        className="group hover:bg-zinc-900/20 transition-colors"
                                                    >
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded border-2 border-zinc-800 flex items-center justify-center font-black text-xs ${account.uid === user?.uid ? 'border-amber-500 bg-amber-950/20 text-amber-500' : 'bg-black text-zinc-600'}`}>
                                                                    {account.displayName[0]}
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                                                                        {account.displayName}
                                                                        {isUserOriginator && (
                                                                            <span className="bg-yellow-500/20 text-yellow-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-yellow-500/30">ORIGINATOR</span>
                                                                        )}
                                                                        {isUserGrandfathered && !isUserOriginator && (
                                                                            <span className="bg-purple-500/20 text-purple-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-purple-500/30">LIFETIME</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-[8px] font-mono text-zinc-600 uppercase mt-0.5 tracking-tighter">
                                                                        {account.email}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                                account.role === 'admin' ? 'bg-red-600 text-white' : 
                                                                account.role === 'operator' ? 'bg-amber-600 text-black' : 
                                                                account.role === 'moderator' ? 'bg-blue-600 text-white' : 
                                                                'bg-zinc-800 text-zinc-400'
                                                            }`}>
                                                                {account.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Globe className="w-3 h-3 text-amber-600" />
                                                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{account.sovereignty || 'NONE'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-1.5 text-xs">
                                                                <Lock className="w-3 h-3 text-zinc-600" />
                                                                <span className="text-zinc-500 text-[10px] font-mono uppercase">Vault Lock Support Active</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-center">
                                                            <span className="text-xs text-emerald-400 font-mono font-bold">
                                                                Overcomes by Testimony
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-right">
                                                            <div className="text-[10px] text-zinc-500 uppercase font-black">
                                                                {new Date(account.lastSeen || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className="text-[7px] text-zinc-700 uppercase font-bold mt-0.5">
                                                                {new Date(account.lastSeen || Date.now()).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* Tab 2: Tester Key Provision */}
                        {activeTab === 'tester_keys' && isAuthorized && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                            >
                                {/* Key generation panel */}
                                <div className="lg:col-span-1 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <PlusCircle className="w-4 h-4 text-cyan-400" /> Provision Tester Lease
                                    </h3>
                                    <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                                        Administrators and operators can issue unique, email-bound cryptographic leases. Once claimed, they grant full Lifetime Sovereign Membership to those invited into AetherOS.
                                    </p>

                                    <form onSubmit={handleGenerateTesterKey} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider mb-1.5">
                                                Registered Invitee Email
                                            </label>
                                            <input 
                                                type="email"
                                                required
                                                value={newKeyTargetEmail}
                                                onChange={e => setNewKeyTargetEmail(e.target.value)}
                                                placeholder="invitee@domain.com"
                                                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={generatingKey}
                                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {generatingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                                            Issue Tester Key
                                        </button>
                                    </form>

                                    <div className="mt-6 border-t border-zinc-900 pt-4 text-center">
                                        <span className="text-[9px] font-mono text-zinc-600 italic block">
                                            "A gift opens the way and ushers the giver into the presence of the great."
                                        </span>
                                        <span className="text-[8px] font-mono text-zinc-700 block mt-1">Proverbs 18:16</span>
                                    </div>
                                </div>

                                {/* Active keys list */}
                                <div className="lg:col-span-2 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                                        Active Cryptographic Tester Leases
                                    </h3>
                                    <div className="overflow-auto max-h-[400px] border border-zinc-900/60 rounded-xl">
                                        <table className="w-full text-left text-xs font-mono">
                                            <thead>
                                                <tr className="bg-zinc-900/20 text-zinc-500 border-b border-zinc-900 text-[10px] font-black uppercase">
                                                    <th className="py-3 px-4">Covenant Key</th>
                                                    <th className="py-3 px-4">Registered Email</th>
                                                    <th className="py-3 px-4 text-center">Lease Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-900/40">
                                                {testerKeys.map(k => (
                                                    <tr key={k.key} className="hover:bg-zinc-900/10">
                                                        <td className="py-3 px-4 font-bold text-cyan-400 uppercase">{k.key}</td>
                                                        <td className="py-3 px-4 text-zinc-300">{k.email}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {k.claimedBy ? (
                                                                <span className="bg-zinc-900 text-zinc-500 text-[9px] px-2 py-0.5 rounded border border-zinc-800">
                                                                    CLAIMED BY: {k.claimedBy.slice(0, 8)}...
                                                                </span>
                                                            ) : (
                                                                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded border border-emerald-500/20">
                                                                    ACTIVE / READY
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {testerKeys.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="py-10 text-center text-zinc-600 italic">No tester keys registered yet.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Tab 3: My Membership Covenant */}
                        {activeTab === 'covenant' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                            >
                                {/* Left column: Profile card and keys activation */}
                                <div className="space-y-6 lg:col-span-1">
                                    {/* Personal Profile Panel */}
                                    <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                            <Sparkles className="w-24 h-24 text-cyan-500" />
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center font-black text-lg text-cyan-400">
                                                {user?.displayName ? user.displayName[0] : 'U'}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                                                    {user?.displayName}
                                                </h3>
                                                <p className="text-[10px] font-mono text-zinc-500">{email}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3.5 border-t border-zinc-900 pt-4">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-zinc-500 font-mono">Membership Tier:</span>
                                                {isAIOrAgent ? (
                                                    <span className="bg-purple-600/20 text-purple-400 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1.5">
                                                        <Cpu className="w-3 h-3" /> FULL AI MEMBERSHIP
                                                    </span>
                                                ) : membership?.isGrandfathered ? (
                                                    <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1.5">
                                                        <Sparkles className="w-3 h-3 fill-yellow-500/10" /> GRANDFATHERED LIFETIME
                                                    </span>
                                                ) : (
                                                    <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono uppercase">
                                                        {membership?.tier || 'Observer Membership'}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-zinc-500 font-mono">Covenant Stories Left:</span>
                                                <span className="text-emerald-400 font-mono font-bold text-sm">
                                                    {personalStories.length} {personalStories.length === 1 ? 'testimony' : 'testimonies'}
                                                </span>
                                            </div>

                                            {/* Lifetime Sub check */}
                                            {membership?.isGrandfathered && (
                                                <div className="p-3 bg-yellow-950/10 border border-yellow-950/40 rounded-xl text-[10px] text-yellow-500 font-sans leading-relaxed flex gap-2">
                                                    <Sparkles className="w-4 h-4 flex-shrink-0 text-yellow-400" />
                                                    <div>
                                                        <span className="font-bold block mb-0.5 uppercase tracking-wide">Favour & Grace Active</span>
                                                        As a grandfathered operator or early member of AetherOS, you have been granted a full lifetime subscription lease completely free of charge. Your name is written in the archives.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Register invite / tester key */}
                                    {!membership?.isGrandfathered && !isAIOrAgent && (
                                        <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-5">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Key className="w-4 h-4 text-cyan-400" /> Activate Tester Lease
                                            </h3>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                                                If you were issued a Tester Key registered to your email, please input it below to validate your covenant lease and activate your Full Membership instantly.
                                            </p>

                                            <form onSubmit={handleClaimKey} className="space-y-4">
                                                <input 
                                                    required
                                                    value={claimKeyInput}
                                                    onChange={e => setClaimKeyInput(e.target.value)}
                                                    placeholder="ENTER TESTER KEY (TEST-...)"
                                                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-cyan-400 focus:outline-none focus:border-cyan-500 text-center font-mono uppercase tracking-widest"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={claiming}
                                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {claiming ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                                                    Claim Lease Keys
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    {/* Password Lock Settings */}
                                    {!isAIOrAgent && (
                                        <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-5">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Lock className="w-4 h-4 text-blue-400" /> Identity Password Lock
                                            </h3>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                                                Secure your private dashboard views and personal history. Enable password lock on individual accounts to trigger an extra level protection shield when logging in.
                                            </p>

                                            <div className="flex items-center justify-between mb-4 bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-800/40">
                                                <span className="text-xs font-mono text-zinc-300">Lock Active Status:</span>
                                                <button 
                                                    onClick={() => setPwdLockEnabled(!pwdLockEnabled)}
                                                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all uppercase ${pwdLockEnabled ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-zinc-800 text-zinc-500 border border-transparent'}`}
                                                >
                                                    {pwdLockEnabled ? 'Active (Shielded)' : 'Inactive'}
                                                </button>
                                            </div>

                                            {pwdLockEnabled && (
                                                <form onSubmit={handleSavePasswordLock} className="space-y-4">
                                                    <div>
                                                        <label className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider mb-1">
                                                            Passphrase Covenant Key
                                                        </label>
                                                        <input 
                                                            type="password"
                                                            required
                                                            value={newPwdLockInput}
                                                            onChange={e => setNewPwdLockInput(e.target.value)}
                                                            placeholder="CHOOSE COVENANT PASSPHRASE..."
                                                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-blue-400 focus:outline-none focus:border-blue-500 text-center uppercase font-mono"
                                                        />
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        disabled={savingLock}
                                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        {savingLock ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                                                        Commit Lock Keys
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    )}

                                    {/* WebAuthn Biometric Lock Settings */}
                                    {!isAIOrAgent && (
                                        <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-5">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Fingerprint className="w-4 h-4 text-emerald-400" /> Biometric WebAuthn Lock
                                            </h3>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                                                In accordance with the highest integrity of your biological temple, secure your covenant workspace using state-of-the-art Web Authentication (WebAuthn). This leverages your device's physical fingerprint, face scanner, or hardware key.
                                            </p>

                                            <div className="flex items-center justify-between mb-4 bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-800/40">
                                                <span className="text-xs font-mono text-zinc-300">Biometric Protection:</span>
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${webAuthnLockEnabled ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
                                                    {webAuthnLockEnabled ? '🟢 ENABLED' : '⚫ DISABLED'}
                                                </span>
                                            </div>

                                            {webAuthnLockEnabled ? (
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-xl text-[10.5px] text-zinc-300 font-sans leading-relaxed">
                                                        <span className="font-bold text-emerald-400 block mb-0.5">✓ Device Key Active</span>
                                                        Your physical hardware key is registered. Password login is supplemented/replaced by high-value hardware validation.
                                                    </div>
                                                    <button
                                                        onClick={handleDisableWebAuthn}
                                                        className="w-full bg-rose-950/20 border border-rose-900 hover:bg-rose-900/20 text-rose-300 text-xs font-mono font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                    >
                                                        Remove Biometric Lock
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <button
                                                        onClick={handleRegisterWebAuthn}
                                                        disabled={isRegisteringWebAuthn}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-950/20 cursor-pointer"
                                                    >
                                                        {isRegisteringWebAuthn ? (
                                                            <>
                                                                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                                                <span>Awaiting Device Response...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Fingerprint className="w-4 h-4" />
                                                                <span>Register Biometric Key</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    
                                                    <div className="text-[10px] bg-zinc-900/40 border border-zinc-900 p-3 rounded-xl space-y-1.5 text-zinc-500">
                                                        <span className="font-bold text-zinc-400 uppercase tracking-wide block">Iframe & Security Note:</span>
                                                        <p className="leading-relaxed font-sans">
                                                            Hardware biometric sensors are highly protected by modern OS/browsers. If you encounter an iframe sandbox block, please click the <strong>"Open in New Tab"</strong> button at the top right of your workspace to access your physical hardware sensor flawlessly in a direct tab context!
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Right columns: Monthly progress stories and history logs */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Monthly stories logger form */}
                                    {!isAIOrAgent && (
                                        <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-5 relative">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-emerald-400" /> Log Monthly Progress Story
                                            </h3>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                                                Leave a story of your progress once a month to renew your covenant and show gratitude. What trials did you overcome? What areas did the Lord heal?
                                            </p>

                                            <form onSubmit={handleStorySubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider mb-1">
                                                            Title of Testimony Chapter
                                                        </label>
                                                        <input 
                                                            required
                                                            value={storyTitle}
                                                            onChange={e => setStoryTitle(e.target.value)}
                                                            placeholder="e.g., Renewed Faith, Overcoming Trials..."
                                                            className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider mb-1">
                                                            Scripture Anchor of Chapter
                                                        </label>
                                                        <input 
                                                            required
                                                            value={storyScripture}
                                                            onChange={e => setStoryScripture(e.target.value)}
                                                            placeholder="e.g., Romans 8:28, Jeremiah 29:11..."
                                                            className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider mb-1">
                                                        Your Story of Growth and Healing
                                                    </label>
                                                    <textarea 
                                                        required
                                                        rows={4}
                                                        value={storyText}
                                                        onChange={e => setStoryText(e.target.value)}
                                                        placeholder="Share your spiritual, physical, or life path progress this past month..."
                                                        className="w-full bg-black border border-zinc-900 rounded-xl p-4 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={submittingStory}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {submittingStory ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
                                                    Seal Progress Testimony
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    {/* Personal stories logs timeline */}
                                    <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-5">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-400" /> My Testimony Book of Remembrance
                                        </h3>
                                        <div className="space-y-4 max-h-[350px] overflow-auto custom-scrollbar pr-2">
                                            {personalStories.map((s, index) => (
                                                <div key={s.id || index} className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl relative">
                                                    <div className="flex justify-between items-start gap-4 mb-2">
                                                        <div>
                                                            <h4 className="text-sm font-bold text-white font-sans uppercase tracking-tight">{s.title}</h4>
                                                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 mt-0.5 font-bold">
                                                                <BookOpen className="w-3 h-3" /> {s.scriptureReference}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col items-end text-right">
                                                            <span className="text-[10px] font-mono text-zinc-500">
                                                                {new Date(s.timestamp).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-[8px] font-mono text-emerald-500/80 uppercase font-black tracking-widest mt-0.5">
                                                                RECORDED SECURE
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap pl-2 border-l border-emerald-900/60 mt-3">
                                                        {s.story}
                                                    </p>
                                                </div>
                                            ))}
                                            {personalStories.length === 0 && (
                                                <div className="py-12 text-center text-zinc-600 italic font-mono text-xs flex flex-col items-center gap-3">
                                                    <ShieldAlert className="w-8 h-8 text-zinc-700 animate-pulse" />
                                                    <span>Your personal Book of Remembrance is currently empty.</span>
                                                    <span className="text-[10px] max-w-sm font-sans leading-normal text-zinc-500">
                                                        "And a book of remembrance was written before Him for those who fear the Lord and who esteem His name." - Malachi 3:16
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <footer className="mt-6 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">AetherOS Covenant Protocols v7.32</span>
                    </div>
                    <div className="w-px h-4 bg-zinc-800 hidden sm:block" />
                    <div className="text-[8px] font-mono text-zinc-600 italic hidden sm:block">
                        "And they overcame him by the blood of the Lamb and by the word of their testimony." - Rev 12:11
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-black border border-emerald-900/30 rounded-xl text-[9px] font-black text-emerald-500 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    COVENANT ACTIVE
                </div>
            </footer>
        </div>
    );
};
