// Firebase configuration
import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCtArgwqQ8rA2Hg2yFI5uCzm8jB7S7yJzw",
  authDomain: "coursellm-afe61.firebaseapp.com",
  projectId: "coursellm-afe61",
  storageBucket: "coursellm-afe61.firebasestorage.app",
  messagingSenderId: "478932947274",
  appId: "1:478932947274:web:9f643c08d347659738b1b3",
  measurementId: "G-S1ZZ71PMGZ"
};

// Initialize Firebase (avoid reinitializing if already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics (only in browser)
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, analytics };

