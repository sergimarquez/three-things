import { useState, useEffect } from "react";
import { format } from "date-fns";

export type EntryItem = {
  text: string;
  favorite?: boolean;
};

export type Entry = {
  date: string; // "2025-06-15"
  time: string; // "14:03"
  items: [EntryItem?, EntryItem?, EntryItem?];
};

export type Entries = Entry[];

const STORAGE_KEY = "three-things-entries";

export function useEntries() {
  const [entries, setEntries] = useState<Entries>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

  const saveEntry = (entry: Entry) => {
    const updated = [entry, ...entries.filter(e => e.date !== entry.date)];
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getEntryByDate = (date: string): Entry | undefined => {
    return entries.find(e => e.date === date);
  };

  const hasTodayEntry = (): boolean => {
    const today = format(new Date(), "yyyy-MM-dd");
    return entries.some(e => e.date === today);
  };

  return {
    entries,
    saveEntry,
    getEntryByDate,
    hasTodayEntry,
  };
}
