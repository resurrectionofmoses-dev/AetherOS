import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize the Firebase app instance safely
let app: any = null;
let auth: any = null;

const configObj = firebaseConfig as Record<string, any>;
const hasValidConfig = configObj && typeof configObj.apiKey === 'string' && configObj.apiKey.trim() !== "";

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.warn('[Firebase Auth] Failed to initialize Firebase Auth with provided config:', error);
  }
} else {
  console.warn('[Firebase Auth] No valid Firebase configuration found (API Key is missing or empty). Web Auth features are disabled.');
}

// Google Auth Provider setup with Google Meet, Google Sheets and Gmail scopes as requested
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/meetings.space.created');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');

// Google Drive scopes
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.activity');
provider.addScope('https://www.googleapis.com/auth/drive.activity.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.appdata');
provider.addScope('https://www.googleapis.com/auth/drive.apps.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.install');
provider.addScope('https://www.googleapis.com/auth/drive.meet.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.metadata');
provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.photos.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.scripts');

// Google Docs scopes
provider.addScope('https://www.googleapis.com/auth/documents');
provider.addScope('https://www.googleapis.com/auth/documents.readonly');

// Google Chat scopes
provider.addScope('https://www.googleapis.com/auth/chat.messages');
provider.addScope('https://www.googleapis.com/auth/chat.messages.create');
provider.addScope('https://www.googleapis.com/auth/chat.messages.readonly');
provider.addScope('https://www.googleapis.com/auth/chat.spaces');
provider.addScope('https://www.googleapis.com/auth/chat.spaces.create');
provider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');
provider.addScope('https://www.googleapis.com/auth/chat.memberships');
provider.addScope('https://www.googleapis.com/auth/chat.memberships.readonly');

// Google Tasks scopes
provider.addScope('https://www.googleapis.com/auth/tasks');
provider.addScope('https://www.googleapis.com/auth/tasks.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Initializes auth state observer to monitor background changes.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Executes a Google Sign-In popup with requested Google Workspace scopes,
 * capturing the accessToken securely.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth) {
    console.error('[Firebase OAuth] Cannot sign in: Firebase Authentication has not been initialized (invalid or missing API Key).');
    throw new Error('Firebase Authentication is not configured or initialized. Please configure a valid Firebase API Key in your applet settings.');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('OAuth credential acquisition failed: token is missing');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('[Firebase OAuth] Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieve current active access token.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Signs the active observer out of Firebase Google Auth and voids token.
 */
export const googleSignOut = async (): Promise<void> => {
  if (!auth) {
    cachedAccessToken = null;
    return;
  }
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error('[Firebase OAuth] Sign out error:', error);
  }
};
