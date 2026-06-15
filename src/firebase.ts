import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, getDocFromServer, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// CRITICAL: We must use the specific database ID from the config
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function login() {
  return signInWithPopup(auth, googleProvider);
}

export async function logout() {
  return auth.signOut();
}

/**
 * Validates connection to Firestore.
 */
export async function testConnection() {
  try {
    // Attempt to read something that might exist or just a random doc to trigger a request
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();

export interface AppConfig {
  images: Record<string, string>;
  seo?: Record<string, string>;
  updatedAt: any;
  updatedBy: string;
}

const CONFIG_DOC = 'config/main';

export async function fetchConfig(): Promise<any | null> {
  const docRef = doc(db, CONFIG_DOC);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function saveConfig(images: Record<string, string>, seo?: Record<string, string>, user?: User | null) {
  const docRef = doc(db, CONFIG_DOC);
  const payload: any = {
    images,
    updatedAt: serverTimestamp(),
    updatedBy: user ? user.uid : 'admin_password'
  };
  if (seo) {
    payload.seo = seo;
  }
  return setDoc(docRef, payload, { merge: true });
}

export function subscribeToConfig(callback: (config: { images: Record<string, string> | null; seo: Record<string, string> | null } | null) => void) {
  const docRef = doc(db, CONFIG_DOC);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        images: data.images || null,
        seo: data.seo || null
      });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Config subscription error:", error);
  });
}
