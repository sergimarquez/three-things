import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";

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
    console.log("Loading from localStorage:", stored);
    if (stored) {
      try {
        const parsedEntries = JSON.parse(stored);
        console.log("Parsed entries:", parsedEntries);
        // Add IDs to old entries that don't have them
        const entriesWithIds = parsedEntries.map((entry: any) => ({
          ...entry,
          id: entry.id || `${entry.date}-${entry.time}`,
        }));
        console.log("Entries with IDs:", entriesWithIds);
        setEntries(entriesWithIds);
      } catch (error) {
        console.error("Failed to parse entries from localStorage:", error);
      }
    } else {
      console.log("No entries found in localStorage");
    }
  }, []);

  const saveEntry = (entry: Omit<Entry, 'id'>) => {
    const newEntry = {
      ...entry,
      id: `${entry.date}-${entry.time}`,
    };
    console.log("Saving entry:", newEntry);
    const updatedEntries = [newEntry, ...entries];
    console.log("Updated entries after save:", updatedEntries.map(e => ({ id: e.id, date: e.date })));
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
    const hasEntry = entries.some(entry => entry.date === today);
    console.log("hasTodayEntry check:", { today, entriesCount: entries.length, hasEntry, entries: entries.map(e => e.date) });
    return hasEntry;
  };

  const hasYesterdayEntry = () => {
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    const hasEntry = entries.some(entry => entry.date === yesterday);
    console.log("hasYesterdayEntry check:", { yesterday, entriesCount: entries.length, hasEntry, entries: entries.map(e => e.date) });
    return hasEntry;
  };

  const getTodayEntry = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return entries.find(entry => entry.date === today);
  };

  const getYesterdayEntry = () => {
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    return entries.find(entry => entry.date === yesterday);
  };

  return {
    entries,
    saveEntry,
    updateEntry,
    deleteEntry,
    hasTodayEntry,
    hasYesterdayEntry,
    getTodayEntry,
    getYesterdayEntry,
  };
}
