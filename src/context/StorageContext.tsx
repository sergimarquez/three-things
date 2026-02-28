import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { defaultStorageAdapter, type StorageAdapter } from "../utils/storage";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";
import { createFirebaseAdapter } from "../lib/firebaseAdapter";

const StorageContext = createContext<StorageAdapter>(defaultStorageAdapter);

type StorageProviderProps = {
  children: ReactNode;
  /** Optional: override adapter (e.g. for tests or future cloud). Defaults to localStorage. */
  adapter?: StorageAdapter;
};

export function StorageProvider({ children, adapter = defaultStorageAdapter }: StorageProviderProps) {
  return (
    <StorageContext.Provider value={adapter}>
      {children}
    </StorageContext.Provider>
  );
}

/**
 * Uses Firebase auth to switch between local and cloud storage.
 * When signed in, uses Firestore (users/{uid}); otherwise localStorage.
 * When Firebase isn't configured, always uses localStorage.
 */
export function AuthAwareStorageProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  const adapter = useMemo(
    () => (user ? createFirebaseAdapter(db, user.uid) : defaultStorageAdapter),
    [user?.uid]
  );

  return <StorageProvider adapter={adapter}>{children}</StorageProvider>;
}

export function useStorage(): StorageAdapter {
  return useContext(StorageContext);
}
