import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Added Storage support

// --- CONNECT TO EMULATORS (Local Dev Only) ---
// This block redirects the frontend SDKs to your local running emulators
if (process.env.NODE_ENV === 'development') {
  console.log("🔧 Frontend: Connecting to Firebase Emulators...");
  
  // Connect Auth (Port 9099)
  // Note: We explicitly disable the warning about running on http
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  
  // Connect Firestore (Port 8080)
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  
  // Connect Storage (Port 9199)
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn("Could not enable IndexedDB persistence:", err.code || err.message || err);
  });
} catch (e) {
  console.warn("Persistence enable failed:", e);
}

export const googleProvider = new GoogleAuthProvider();

export default app;