import { useState, useEffect } from "react";
import { format } from "date-fns";

export type EntryItem = {
  text: string;
  favorite?: boolean;
};

export type Entry = {
  id: string;
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
        const parsedEntries = JSON.parse(stored);
        // Add IDs to old entries that don't have them
        const entriesWithIds = parsedEntries.map((entry: any) => ({
          ...entry,
          id: entry.id || `${entry.date}-${entry.time}`,
        }));
        setEntries(entriesWithIds);
      } catch (error) {
        console.error("Failed to parse entries from localStorage:", error);
      }
    }
  }, []);

  const saveEntry = (entry: Omit<Entry, 'id'>) => {
    const newEntry = {
      ...entry,
      id: `${entry.date}-${entry.time}`,
    };
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  };

  const updateEntry = (id: string, updatedEntry: Omit<Entry, 'id'>) => {
    const updatedEntries = entries.map(entry => 
      entry.id === id 
        ? { ...updatedEntry, id }
        : entry
    );
    setEntries(updatedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
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
    updateEntry,
    deleteEntry,
    hasTodayEntry,
    getTodayEntry,
  };
}
