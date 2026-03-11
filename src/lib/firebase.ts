/**
 * Firebase init. Reads config from env (VITE_*) so secrets aren't committed.
 * If env is missing or invalid, the app still runs with cloud backup disabled (no throw).
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let configured = false;

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (projectId && apiKey) {
  try {
    app = initializeApp({
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
    auth = getAuth(app);
    db = getFirestore(app);
    configured = true;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("Firebase init failed, cloud backup disabled:", e);
    }
  }
}

export { app, auth, db };
/** True when Firebase env is valid and init succeeded; cloud backup is available. */
export const isFirebaseConfigured = configured;
