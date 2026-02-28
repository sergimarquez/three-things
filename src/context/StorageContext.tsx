import { createContext, useContext, type ReactNode } from "react";
import { defaultStorageAdapter, type StorageAdapter } from "../utils/storage";

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

export function useStorage(): StorageAdapter {
  return useContext(StorageContext);
}
