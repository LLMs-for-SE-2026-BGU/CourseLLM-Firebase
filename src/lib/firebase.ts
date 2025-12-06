import { initializeApp, getApps } from "firebase/app";
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from "firebase/auth";
import { connectFirestoreEmulator, enableIndexedDbPersistence, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:123456",
};

// Prevent re-initialization in hot-reload scenarios
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Track emulator connection status to prevent double connections
let emulatorsConnected = false;

/**
 * Connect to Firebase Emulators in development mode.
 * Ports are aligned with firebase.json:
 * - Auth: 9099
 * - Firestore: 8080
 * - Storage: 9199
 */
function connectToEmulators() {
  if (emulatorsConnected) return;
  
  // Only connect in development (works for both Client and Server)
  if (process.env.NODE_ENV === 'development') {
    try {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      connectStorageEmulator(storage, '127.0.0.1', 9199);
      emulatorsConnected = true;
      console.log("✅ Connected to Firebase Emulators (Auth:9099, Firestore:8080, Storage:9199)");
    } catch (error) {
      // Emulators might already be connected
      console.warn("Emulator connection skipped (may already be connected):", error);
      emulatorsConnected = true;
    }
  }
}

// Connect to emulators on module load (client-side only)
connectToEmulators();

// Enable offline persistence so reads can be served from cache when offline.
// This is a best-effort call: it will fail in some environments (e.g. Safari private mode)
// and when multiple tabs conflict. We catch and ignore expected errors.
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db).catch((err) => {
      // failed-precondition: multiple tabs open, unimplemented: browser not supported
      console.warn("Could not enable IndexedDB persistence:", err.code || err.message || err);
    });
  } catch (e) {
    // Ignore synchronous errors
    console.warn("Persistence enable failed:", e);
  }
}

export const googleProvider = new GoogleAuthProvider();

export default app;
