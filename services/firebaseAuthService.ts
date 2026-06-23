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

// Initialize the Firebase app instance
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Auth Provider setup with Google Meet and Google Sheets scopes as requested
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/meetings.space.created');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Initializes auth state observer to monitor background changes.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
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
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error('[Firebase OAuth] Sign out error:', error);
  }
};
