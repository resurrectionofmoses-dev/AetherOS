import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, AccessRole, UserStatus, UserRegistryEntry } from '../types';
import { BiometricScanner } from '../components/BiometricScanner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  updateSovereignty: (sovereignty: string) => Promise<void>;
  updateStatus: (status: UserStatus) => void;
  toggleSeclusion: () => void;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  userRegistry: UserRegistryEntry[];
  verifyBiometricSignature: (operationName: string) => Promise<boolean>;
}

const AFK_TIMEOUT = 15 * 60 * 1000; // 15 minutes in ms

const getMachineId = () => {
    let mid = localStorage.getItem('aetheros_machine_id');
    if (!mid) {
        mid = `NODE_${uuidv4().split('-')[0].toUpperCase()}`;
        localStorage.setItem('aetheros_machine_id', mid);
    }
    return mid;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRegistry, setUserRegistry] = useState<UserRegistryEntry[]>([]);

  // Function to sync user to mocked registry
  const syncToRegistry = useCallback((u: User) => {
    const registry = JSON.parse(localStorage.getItem('aetheros_user_registry') || '[]');
    const existingIdx = registry.findIndex((r: any) => r.uid === u.uid);
    
    // Attempt to guess location from TZ
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locationHint = tz.split('/')[1]?.replace('_', ' ') || 'UNKNOWN_SEC';

    const entry: UserRegistryEntry = {
        ...u,
        ip: existingIdx !== -1 ? registry[existingIdx].ip : `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        createdAt: existingIdx !== -1 ? registry[existingIdx].createdAt : Date.now(),
        lastSeen: Date.now(),
        machineId: getMachineId(),
        locationHint: locationHint.toUpperCase(),
        userAgent: navigator.userAgent.slice(0, 50) + '...'
    };

    if (existingIdx !== -1) {
        registry[existingIdx] = entry;
    } else {
        registry.push(entry);
    }

    localStorage.setItem('aetheros_user_registry', JSON.stringify(registry));
    setUserRegistry(registry);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('aetheros_user');
    const registry = JSON.parse(localStorage.getItem('aetheros_user_registry') || '[]');
    setUserRegistry(registry);

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (!parsed.role) parsed.role = 'guest';
        const userWithMachine = { 
            ...parsed, 
            status: 'active' as UserStatus, 
            lastActive: Date.now(),
            machineId: getMachineId(),
            seclusionActive: parsed.seclusionActive ?? true
        };
        setUser(userWithMachine);
        syncToRegistry(userWithMachine);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setLoading(false);
  }, [syncToRegistry]);

  // Inactivity monitoring
  useEffect(() => {
    if (!user) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
        if (user.status !== 'active') {
            const updatedUser = { ...user, status: 'active' as UserStatus, lastActive: Date.now() };
            setUser(updatedUser);
            syncToRegistry(updatedUser);
        } else {
            setUser(prev => prev ? { ...prev, lastActive: Date.now() } : null);
        }

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const updatedUser = { ...user, status: 'afk' as UserStatus };
            setUser(updatedUser);
            syncToRegistry(updatedUser);
        }, AFK_TIMEOUT);
    };

    const handleActivity = () => {
        resetTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    resetTimer();

    return () => {
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('click', handleActivity);
        clearTimeout(timeout);
    };
  }, [user?.uid, user?.status]);

  const updateStatus = (status: UserStatus) => {
    if (!user) return;
    const updatedUser = { ...user, status, lastActive: Date.now() };
    setUser(updatedUser);
    syncToRegistry(updatedUser);
  };

  const toggleSeclusion = () => {
    if (!user) return;
    const updatedUser = { ...user, seclusionActive: !user.seclusionActive };
    setUser(updatedUser);
    localStorage.setItem('aetheros_user', JSON.stringify(updatedUser));
    syncToRegistry(updatedUser);
  };

  const login = async (email: string, pass: string) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    let mockUser: User | null = null;

    if (email === 'admin@aetheros.local' && pass === 'AetherSovereign2026') {
      mockUser = {
        uid: 'aether-admin-001',
        displayName: 'System Administrator',
        email: 'admin@aetheros.local',
        role: 'admin',
        sovereignty: 'CENTRAL_COMMAND'
      };
    } else if (email === 'mod@aetheros.local' && pass === 'GuardianPass') {
      mockUser = {
        uid: 'mod-001',
        displayName: 'Lattice Guardian',
        email: 'mod@aetheros.local',
        role: 'moderator',
        sovereignty: 'VIGIL_NETWORK'
      };
    } else if (email === 'operator@aetheros.local' && pass === 'OperatorActive') {
      mockUser = {
        uid: 'op-001',
        displayName: 'Grid Operator',
        email: 'operator@aetheros.local',
        role: 'operator',
        sovereignty: 'SOVEREIGN_SYSTEM'
      };
    }

    if (mockUser) {
      const userWithStatus = { 
          ...mockUser, 
          status: 'active' as UserStatus, 
          lastActive: Date.now(),
          machineId: getMachineId(),
          seclusionActive: true
      };
      setUser(userWithStatus);
      localStorage.setItem('aetheros_user', JSON.stringify(userWithStatus));
      syncToRegistry(userWithStatus);
    } else {
      throw new Error("INVALID_CREDENTIALS: The Sovereign Shield rejected your access key.");
    }
  };

  const updateSovereignty = async (sovereignty: string) => {
    if (!user) return;
    const updatedUser = { ...user, sovereignty };
    setUser(updatedUser);
    localStorage.setItem('aetheros_user', JSON.stringify(updatedUser));
    syncToRegistry(updatedUser);
  };

  const guestLogin = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const guestUser: User = {
      uid: `guest-${uuidv4().split('-')[0]}`,
      displayName: 'Guest Observer',
      email: 'guest@aetheros.local',
      role: 'guest',
      sovereignty: 'UNKNOWN_SECTOR'
    };
    const userWithStatus = { 
        ...guestUser, 
        status: 'active' as UserStatus, 
        lastActive: Date.now(),
        machineId: getMachineId(),
        seclusionActive: false
    };
    setUser(userWithStatus);
    localStorage.setItem('aetheros_user', JSON.stringify(userWithStatus));
    syncToRegistry(userWithStatus);
    setLoading(false);
  };

  const logout = async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    setUser(null);
    localStorage.removeItem('aetheros_user');
  };

  const [biometricPrompt, setBiometricPrompt] = useState<{
    isOpen: boolean;
    operationName: string;
    resolve: (value: boolean) => void;
  } | null>(null);

  const verifyBiometricSignature = useCallback((operationName: string) => {
    return new Promise<boolean>((resolve) => {
      setBiometricPrompt({
        isOpen: true,
        operationName,
        resolve,
      });
    });
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      guestLogin, 
      logout, 
      updateSovereignty, 
      updateStatus, 
      toggleSeclusion, 
      userRegistry,
      verifyBiometricSignature
    }}>
      {!loading && children}
      {biometricPrompt?.isOpen && (
        <BiometricScanner
          operationName={biometricPrompt.operationName}
          onVerify={(success) => {
            biometricPrompt.resolve(success);
            setBiometricPrompt(null);
          }}
          onClose={() => {
            biometricPrompt.resolve(false);
            setBiometricPrompt(null);
          }}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
