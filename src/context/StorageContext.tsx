import { createContext, useContext, useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { defaultStorageAdapter, createDualWriteAdapter, type StorageAdapter } from "../utils/storage";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";
import { createFirebaseAdapter } from "../lib/firebaseAdapter";
import { STORAGE_KEYS, type Entry, type MonthlyReflection, type YearlyReview } from "../types";
import { validateEntries, validateMonthlyReflections, validateYearlyReviews } from "../utils/validation";

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
  const lastMigratedUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  const adapter = useMemo(() => {
    if (!user || !db) return defaultStorageAdapter;
    const cloud = createFirebaseAdapter(db, user.uid);
    return createDualWriteAdapter(cloud, defaultStorageAdapter);
  }, [user?.uid]);

  useEffect(() => {
    if (!user || !db) return;
    if (lastMigratedUidRef.current === user.uid) return;
    lastMigratedUidRef.current = user.uid;

    const cloud = createFirebaseAdapter(db, user.uid);
    const local = defaultStorageAdapter;

    function safeParseArray(value: string | null): unknown[] {
      if (!value) return [];
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    function mergeById<T extends { id: string }>(a: T[], b: T[]): T[] {
      const map = new Map<string, T>();
      for (const item of a) map.set(item.id, item);
      for (const item of b) map.set(item.id, item);
      return Array.from(map.values());
    }

    async function migrateLocalToCloudOnce() {
      // If cloud is empty but local has data, copy/merge so enabling backup doesn't appear to “lose” reviews.
      const [cloudEntries, cloudMonthly, cloudYearly] = await Promise.all([
        cloud.get(STORAGE_KEYS.ENTRIES),
        cloud.get(STORAGE_KEYS.MONTHLY_REFLECTIONS),
        cloud.get(STORAGE_KEYS.YEARLY_REVIEWS),
      ]);
      const [localEntries, localMonthly, localYearly] = await Promise.all([
        local.get(STORAGE_KEYS.ENTRIES),
        local.get(STORAGE_KEYS.MONTHLY_REFLECTIONS),
        local.get(STORAGE_KEYS.YEARLY_REVIEWS),
      ]);

      const cloudEntriesArr = safeParseArray(cloudEntries);
      const localEntriesArr = safeParseArray(localEntries);
      const cloudMonthlyArr = safeParseArray(cloudMonthly);
      const localMonthlyArr = safeParseArray(localMonthly);
      const cloudYearlyArr = safeParseArray(cloudYearly);
      const localYearlyArr = safeParseArray(localYearly);

      const mergedEntries = (() => {
        const { valid: a } = validateEntries(cloudEntriesArr);
        const { valid: b } = validateEntries(localEntriesArr);
        return mergeById<Entry>(a, b);
      })();
      const mergedMonthly = (() => {
        const { valid: a } = validateMonthlyReflections(cloudMonthlyArr);
        const { valid: b } = validateMonthlyReflections(localMonthlyArr);
        return mergeById<MonthlyReflection>(a, b);
      })();
      const mergedYearly = (() => {
        const { valid: a } = validateYearlyReviews(cloudYearlyArr);
        const { valid: b } = validateYearlyReviews(localYearlyArr);
        return mergeById<YearlyReview>(a, b);
      })();

      // Only write when local adds something cloud doesn't already have.
      if (mergedEntries.length > cloudEntriesArr.length) {
        await cloud.set(STORAGE_KEYS.ENTRIES, JSON.stringify(mergedEntries));
      }
      if (mergedMonthly.length > cloudMonthlyArr.length) {
        await cloud.set(STORAGE_KEYS.MONTHLY_REFLECTIONS, JSON.stringify(mergedMonthly));
      }
      if (mergedYearly.length > cloudYearlyArr.length) {
        await cloud.set(STORAGE_KEYS.YEARLY_REVIEWS, JSON.stringify(mergedYearly));
      }

      // Carry over dismissed prompts if cloud doesn't have them yet.
      const [cloudDismissedMonth, cloudDismissedYear] = await Promise.all([
        cloud.get(STORAGE_KEYS.DISMISSED_MONTH),
        cloud.get(STORAGE_KEYS.DISMISSED_YEAR),
      ]);
      const [localDismissedMonth, localDismissedYear] = await Promise.all([
        local.get(STORAGE_KEYS.DISMISSED_MONTH),
        local.get(STORAGE_KEYS.DISMISSED_YEAR),
      ]);
      if (!cloudDismissedMonth && localDismissedMonth) {
        await cloud.set(STORAGE_KEYS.DISMISSED_MONTH, localDismissedMonth);
      }
      if (!cloudDismissedYear && localDismissedYear) {
        await cloud.set(STORAGE_KEYS.DISMISSED_YEAR, localDismissedYear);
      }
    }

    migrateLocalToCloudOnce().catch((e) => {
      if (import.meta.env.DEV) console.warn("Cloud migration skipped:", e);
    });
  }, [user?.uid]);

  return <StorageProvider adapter={adapter}>{children}</StorageProvider>;
}

export function useStorage(): StorageAdapter {
  return useContext(StorageContext);
}
