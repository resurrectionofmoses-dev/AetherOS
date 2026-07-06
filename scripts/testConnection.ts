import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
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
