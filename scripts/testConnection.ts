import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const rawConfig = process.env.FIREBASE_CONFIG;
const firebaseConfig = rawConfig ? JSON.parse(rawConfig) : null;

async function test() {
  if (!firebaseConfig) {
    console.log('[Sovereign Mode] No external FIREBASE_CONFIG supplied; operating cleanly in local SafeStorage mode.');
    return;
  }
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log('Fetching test doc...');
  try {
    const docRef = doc(db, 'mission_items', 'test');
    await getDoc(docRef);
    console.log('Success - Connected to Firestore');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
