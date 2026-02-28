/**
 * Firestore-backed StorageAdapter for cloud backup.
 * One doc per user: users/{userId}, with each storage key as a field (JSON string).
 */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
  type Firestore,
} from "firebase/firestore";
import type { StorageAdapter } from "../utils/storage";
import type { StorageError } from "../types";

const USER_DOC_PATH = "users";

function firestoreErrorToStorageError(err: unknown): StorageError {
  const message = err instanceof Error ? err.message : "Unknown error";
  return {
    type: "unknown",
    message,
  };
}

/**
 * Creates a StorageAdapter that reads/writes to Firestore at users/{userId}.
 * Use when the user is signed in; otherwise use defaultStorageAdapter.
 */
export function createFirebaseAdapter(db: Firestore, userId: string): StorageAdapter {
  const docRef = doc(db, USER_DOC_PATH, userId);

  return {
    async get(key: string): Promise<string | null> {
      try {
        const snap = await getDoc(docRef);
        const value = snap.get(key);
        if (value == null) return null;
        return typeof value === "string" ? value : JSON.stringify(value);
      } catch (err) {
        console.error("[FirebaseAdapter] get failed:", err);
        return null;
      }
    },

    async set(key: string, value: string): Promise<{ success: boolean; error?: StorageError }> {
      try {
        await setDoc(docRef, { [key]: value }, { merge: true });
        return { success: true };
      } catch (err) {
        console.error("[FirebaseAdapter] set failed:", err);
        return {
          success: false,
          error: firestoreErrorToStorageError(err),
        };
      }
    },

    async remove(key: string): Promise<boolean> {
      try {
        await updateDoc(docRef, { [key]: deleteField() });
        return true;
      } catch (err) {
        console.error("[FirebaseAdapter] remove failed:", err);
        return false;
      }
    },
  };
}
