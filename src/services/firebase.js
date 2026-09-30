import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// In Vite projects, environment variables MUST be accessed via import.meta.env.VITE_*
const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY || '').trim();
const authDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '').trim();
const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '').trim();
const storageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '').trim();
const messagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '').trim();
const appId = (import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.NEXT_PUBLIC_FIREBASE_APP_ID || '').trim();
const measurementId = (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || import.meta.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '').trim();

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
};

// Console.log the apiKey to verify it's loaded (first 10 chars only for safety)
if (apiKey) {
  console.log('[Label HemaReddy] Firebase API Key loaded:', apiKey.substring(0, 10) + '... (total length: ' + apiKey.length + ')');
} else {
  console.warn('[Label HemaReddy] Firebase API Key is NOT loaded / empty. Check your VITE_FIREBASE_API_KEY in .env or Vercel Environment Variables.');
}

console.log('[Label HemaReddy] Firebase Project ID:', projectId || 'EMPTY');

// Check if valid Firebase configuration is supplied (must have non-placeholder valid API key)
export const isFirebaseConfigured = Boolean(
  apiKey &&
  projectId &&
  apiKey !== '' &&
  !apiKey.includes('YOUR_') &&
  !apiKey.endsWith('...') &&
  apiKey.length > 20
);

console.log('[Label HemaReddy] isFirebaseConfigured:', isFirebaseConfigured);

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('[Label HemaReddy] Firebase connected successfully.');
  } catch (error) {
    console.error('[Label HemaReddy] Error initializing Firebase:', error);
  }
} else {
  console.info('[Label HemaReddy] Running in Local Studio Mode. Connect live Firebase by providing valid credentials in .env');
}

export { app, auth, db, storage, firebaseConfig };
