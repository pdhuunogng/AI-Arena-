import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA7V86wdkmZMBCYIS3Lgnc5eKvxEvbAKMg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "loyal-core-pxfhk.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "loyal-core-pxfhk",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "loyal-core-pxfhk.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "177810381678",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:177810381678:web:f28d8628589d033bd3ff7f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
