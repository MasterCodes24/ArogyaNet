// src/lib/firebase.ts
// Firebase app + Firestore initialization.
// Config values come from .env.local — never hard-coded here.

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialise the Firebase app once (safe during Next.js hot-reload)
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialise Firestore with persistent offline cache (IndexedDB).
// persistentLocalCache keeps writes queued in the browser when offline
// and automatically syncs them to the server once the connection returns.
// persistentMultipleTabManager allows the same cache to be shared across
// multiple browser tabs safely.
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  // initializeFirestore throws if called a second time on the same app
  // (e.g. during hot-reload). Fall back to getFirestore() in that case.
  db = getFirestore(app);
}

export { db };
export default app;
