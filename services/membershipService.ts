import { safeStorage } from './safeStorage';
import { 
  getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firestore if possible
let dbInstance: any = null;
function getDb() {
  if (!dbInstance) {
    try {
      const app = initializeApp(firebaseConfig);
      dbInstance = getFirestore(app);
    } catch (e) {
      console.warn('[AetherOS Membership Service] Firebase fallback active.', e);
    }
  }
  return dbInstance;
}

export interface TesterKey {
  key: string;
  email: string;
  registeredAt: number;
  claimedBy?: string;
  claimedAt?: number;
}

export interface AccountPasswordLock {
  uid: string;
  email: string;
  isLocked: boolean;
  passwordHash: string; // Dynamic secure local hash
}

export interface LifeStory {
  id: string;
  uid: string;
  email: string;
  timestamp: number;
  title: string;
  story: string;
  scriptureReference: string;
}

export interface UserMembership {
  uid: string;
  email: string;
  type: 'Human' | 'AI' | 'Agent';
  tier: 'Full Membership' | 'Observer Membership';
  isGrandfathered: boolean;
  passwordLockEnabled: boolean;
  lastStoryTimestamp?: number;
  storiesCount: number;
  webAuthnLockEnabled?: boolean;
  webAuthnCredentialId?: string;
  webAuthnPublicKey?: string;
  webAuthnRawId?: string;
}

// Default Grandfathered Origins list (e.g. resurrectionofmoses@gmail.com and default local operators)
export const GRANDFATHER_EMAILS = [
  'resurrectionofmoses@gmail.com',
  'admin@aetheros.local',
  'mod@aetheros.local',
  'operator@aetheros.local'
];

export const membershipService = {
  /**
   * Check if a user is Grandfathered and get/create their lifetime subscription.
   * "Grandfather everyone that has been in AetherOS so they have a full subscription thats lifetime"
   */
  async checkAndGrandfatherUser(uid: string, email: string): Promise<UserMembership> {
    const db = getDb();
    
    // Check if user is in grandfather list or has been registered before
    const isGrandfathered = GRANDFATHER_EMAILS.includes(email.toLowerCase()) || 
                            email.endsWith('.local') || 
                            uid.startsWith('aether-') ||
                            uid.startsWith('mod-') ||
                            uid.startsWith('op-');

    // Create default membership schema
    const defaultMembership: UserMembership = {
      uid,
      email,
      type: 'Human',
      tier: isGrandfathered ? 'Full Membership' : 'Observer Membership',
      isGrandfathered,
      passwordLockEnabled: false,
      storiesCount: 0
    };

    try {
      if (db) {
        const docRef = doc(db, 'memberships', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const currentData = docSnap.data() as UserMembership;
          // Ensure they are marked grandfathered and have Full Membership if they qualify
          if (isGrandfathered && (!currentData.isGrandfathered || currentData.tier !== 'Full Membership')) {
            currentData.isGrandfathered = true;
            currentData.tier = 'Full Membership';
            await setDoc(docRef, currentData);
          }
          return currentData;
        } else {
          await setDoc(docRef, defaultMembership);
          return defaultMembership;
        }
      }
    } catch (e) {
      console.warn('[AetherOS Membership] Firestore checkAndGrandfatherUser failed, using local storage:', e);
    }

    // Local Storage Fallback
    try {
      const stored = await safeStorage.getItem(`aether_membership_${uid}`);
      if (stored) {
        const currentData = JSON.parse(stored) as UserMembership;
        if (isGrandfathered && (!currentData.isGrandfathered || currentData.tier !== 'Full Membership')) {
          currentData.isGrandfathered = true;
          currentData.tier = 'Full Membership';
          await safeStorage.setItem(`aether_membership_${uid}`, JSON.stringify(currentData));
        }
        return currentData;
      } else {
        await safeStorage.setItem(`aether_membership_${uid}`, JSON.stringify(defaultMembership));
        return defaultMembership;
      }
    } catch (err) {
      console.error('[AetherOS Membership] Local storage membership failed:', err);
    }

    return defaultMembership;
  },

  /**
   * Save human user membership
   */
  async saveUserMembership(membership: UserMembership): Promise<void> {
    const db = getDb();
    try {
      if (db) {
        await setDoc(doc(db, 'memberships', membership.uid), membership);
      }
    } catch (e) {
      console.warn('[AetherOS Membership] Firestore save failed, using local fallback:', e);
    }
    await safeStorage.setItem(`aether_membership_${membership.uid}`, JSON.stringify(membership));
  },

  /**
   * Get all registered tester keys
   */
  async getTesterKeys(): Promise<TesterKey[]> {
    const db = getDb();
    const defaultKeys: TesterKey[] = [
      { key: 'TEST-777-PEACE', email: 'believer@aetheros.local', registeredAt: Date.now() },
      { key: 'TEST-120-HEALING', email: 'healer@aetheros.local', registeredAt: Date.now() },
      { key: 'TEST-316-GRACE', email: 'grace@aetheros.local', registeredAt: Date.now() }
    ];

    try {
      if (db) {
        const colRef = collection(db, 'tester_keys');
        const querySnap = await getDocs(colRef);
        if (!querySnap.empty) {
          const keys: TesterKey[] = [];
          querySnap.forEach((doc) => {
            keys.push(doc.data() as TesterKey);
          });
          return keys;
        } else {
          // Initialize default keys in Firestore
          for (const tk of defaultKeys) {
            await setDoc(doc(db, 'tester_keys', tk.key), tk);
          }
          return defaultKeys;
        }
      }
    } catch (e) {
      console.warn('[AetherOS Membership] Firestore getTesterKeys failed, using local fallback:', e);
    }

    // Local Storage Fallback
    try {
      const stored = await safeStorage.getItem('aether_tester_keys');
      if (stored) {
        return JSON.parse(stored) as TesterKey[];
      } else {
        await safeStorage.setItem('aether_tester_keys', JSON.stringify(defaultKeys));
        return defaultKeys;
      }
    } catch (err) {
      return defaultKeys;
    }
  },

  /**
   * Add a tester key registered to an email
   */
  async addTesterKey(key: string, email: string): Promise<void> {
    const db = getDb();
    const cleanKey = key.toUpperCase().trim();
    const newKey: TesterKey = {
      key: cleanKey,
      email: email.toLowerCase().trim(),
      registeredAt: Date.now()
    };

    try {
      if (db) {
        await setDoc(doc(db, 'tester_keys', cleanKey), newKey);
      }
    } catch (e) {
      console.warn('[AetherOS Membership] Firestore addTesterKey failed, using local fallback:', e);
    }

    const currentKeys = await this.getTesterKeys();
    const updated = [...currentKeys.filter(k => k.key !== cleanKey), newKey];
    await safeStorage.setItem('aether_tester_keys', JSON.stringify(updated));
  },

  /**
   * Claim a tester key during registration/membership activation
   */
  async claimTesterKey(key: string, email: string, uid: string): Promise<boolean> {
    const keys = await this.getTesterKeys();
    const cleanKey = key.toUpperCase().trim();
    const matched = keys.find(k => k.key === cleanKey);

    if (!matched) {
      return false; // Key not found
    }

    if (matched.email.toLowerCase() !== email.toLowerCase()) {
      return false; // Key registered to a different email
    }

    // Mark as claimed
    matched.claimedBy = uid;
    matched.claimedAt = Date.now();

    const db = getDb();
    try {
      if (db) {
        await setDoc(doc(db, 'tester_keys', cleanKey), matched);
      }
    } catch (e) {
      console.warn('[AetherOS Membership] Firestore claimTesterKey failed:', e);
    }

    const updated = [...keys.filter(k => k.key !== cleanKey), matched];
    await safeStorage.setItem('aether_tester_keys', JSON.stringify(updated));

    // Grant Full Membership immediately
    const userMembership = await this.checkAndGrandfatherUser(uid, email);
    userMembership.tier = 'Full Membership';
    userMembership.isGrandfathered = true; // Tester keys grant lifetime covenant access
    await this.saveUserMembership(userMembership);

    return true;
  },

  /**
   * Get all life progress stories left by a user
   */
  async getUserStories(uid: string): Promise<LifeStory[]> {
    const db = getDb();
    try {
      if (db) {
        const colRef = collection(db, 'life_stories');
        const querySnap = await getDocs(colRef);
        const stories: LifeStory[] = [];
        querySnap.forEach((doc) => {
          const data = doc.data() as LifeStory;
          if (data.uid === uid) {
            stories.push(data);
          }
        });
        return stories.sort((a, b) => b.timestamp - a.timestamp);
      }
    } catch (e) {
      console.warn('[AetherOS Membership] Firestore getUserStories failed, using local fallback:', e);
    }

    // Local Storage Fallback
    try {
      const stored = await safeStorage.getItem(`aether_stories_${uid}`);
      if (stored) {
        return (JSON.parse(stored) as LifeStory[]).sort((a, b) => b.timestamp - a.timestamp);
      }
    } catch (err) {
      console.error(err);
    }
    return [];
  },

  /**
   * Add a monthly progress story
   * "memberships come at a cost of leaving a story once a month on thier progress in life."
   */
  async submitMonthlyStory(uid: string, email: string, title: string, story: string, scripture: string): Promise<LifeStory> {
    const db = getDb();
    const id = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newStory: LifeStory = {
      id,
      uid,
      email,
      timestamp: Date.now(),
      title,
      story,
      scriptureReference: scripture
    };

    try {
      if (db) {
        await setDoc(doc(db, 'life_stories', id), newStory);
      }
    } catch (e) {
      console.warn('[AetherOS Membership] Firestore submitMonthlyStory failed, using local fallback:', e);
    }

    // Local Storage update
    const currentStories = await this.getUserStories(uid);
    const updatedStories = [newStory, ...currentStories];
    await safeStorage.setItem(`aether_stories_${uid}`, JSON.stringify(updatedStories));

    // Update User Membership counters
    const membership = await this.checkAndGrandfatherUser(uid, email);
    membership.lastStoryTimestamp = Date.now();
    membership.storiesCount = updatedStories.length;
    membership.tier = 'Full Membership'; // Maintain Full Membership status
    await this.saveUserMembership(membership);

    return newStory;
  },

  /**
   * Password Lock status check
   */
  async getPasswordLock(uid: string): Promise<AccountPasswordLock | null> {
    const db = getDb();
    try {
      if (db) {
        const docRef = doc(db, 'password_locks', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as AccountPasswordLock;
        }
      }
    } catch (e) {
      console.warn('[AetherOS Membership] Firestore getPasswordLock failed, using local fallback:', e);
    }

    // Local fallback
    try {
      const stored = await safeStorage.getItem(`aether_pwd_lock_${uid}`);
      if (stored) {
        return JSON.parse(stored) as AccountPasswordLock;
      }
    } catch (err) {}
    return null;
  },

  /**
   * Set or Update Password Lock
   */
  async setPasswordLock(uid: string, email: string, isLocked: boolean, passwordHash: string): Promise<void> {
    const db = getDb();
    const lockData: AccountPasswordLock = {
      uid,
      email,
      isLocked,
      passwordHash
    };

    try {
      if (db) {
        await setDoc(doc(db, 'password_locks', uid), lockData);
      }
    } catch (e) {
      console.warn('[AetherOS Membership] Firestore setPasswordLock failed:', e);
    }

    await safeStorage.setItem(`aether_pwd_lock_${uid}`, JSON.stringify(lockData));

    // Sync state in membership schema
    const membership = await this.checkAndGrandfatherUser(uid, email);
    membership.passwordLockEnabled = isLocked;
    await this.saveUserMembership(membership);
  },

  /**
   * Set or Update WebAuthn Biometric Lock
   */
  async setWebAuthnLock(uid: string, email: string, isEnabled: boolean, credentialId: string, publicKey: string, rawId: string): Promise<void> {
    const membership = await this.checkAndGrandfatherUser(uid, email);
    membership.webAuthnLockEnabled = isEnabled;
    membership.webAuthnCredentialId = credentialId;
    membership.webAuthnPublicKey = publicKey;
    membership.webAuthnRawId = rawId;
    await this.saveUserMembership(membership);
  },

  /**
   * Disable WebAuthn Biometric Lock
   */
  async disableWebAuthnLock(uid: string, email: string): Promise<void> {
    const membership = await this.checkAndGrandfatherUser(uid, email);
    membership.webAuthnLockEnabled = false;
    membership.webAuthnCredentialId = undefined;
    membership.webAuthnPublicKey = undefined;
    membership.webAuthnRawId = undefined;
    await this.saveUserMembership(membership);
  }
};
