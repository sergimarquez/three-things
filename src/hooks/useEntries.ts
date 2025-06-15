import { useState, useEffect } from "react";
import { format } from "date-fns";

export type EntryItem = {
  text: string;
  favorite?: boolean;
};

export type Entry = {
  date: string;
  time: string;
  items: [EntryItem, EntryItem, EntryItem];
};

const STORAGE_KEY = "three-things-entries";

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);

  // Load entries from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse entries from localStorage:", error);
      }
    }
  }, []);

  const saveEntry = (entry: Entry) => {
    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  };

  const hasTodayEntry = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return entries.some(entry => entry.date === today);
  };

  const getTodayEntry = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return entries.find(entry => entry.date === today);
  };

  return {
    entries,
    saveEntry,
    hasTodayEntry,
    getTodayEntry,
  };
}
