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

// Fake data for testing
const generateFakeData = (): Entry[] => {
  const fakeEntries: Entry[] = [];
  
  const sampleItems = [
    [
      { text: "Had a great coffee this morning that perfectly started my day", favorite: true },
      { text: "Received a thoughtful message from an old friend", favorite: false },
      { text: "Finished reading an interesting chapter in my book", favorite: false }
    ],
    [
      { text: "Enjoyed a peaceful walk in the park during lunch break", favorite: false },
      { text: "Successfully completed a challenging work project", favorite: true },
      { text: "Cooked a delicious dinner that turned out better than expected", favorite: true }
    ],
    [
      { text: "Watched a beautiful sunset from my window", favorite: true },
      { text: "Had a meaningful conversation with my family", favorite: false },
      { text: "Discovered a new song that I absolutely love", favorite: false }
    ],
    [
      { text: "Felt grateful for my health and energy today", favorite: false },
      { text: "Helped a colleague solve a difficult problem", favorite: true },
      { text: "Enjoyed a moment of quiet reflection before bed", favorite: false }
    ],
    [
      { text: "Laughed until my stomach hurt with friends", favorite: true },
      { text: "Found a perfect parking spot right when I needed it", favorite: false },
      { text: "Treated myself to my favorite dessert", favorite: false }
    ],
    [
      { text: "Woke up feeling refreshed and optimistic", favorite: false },
      { text: "Received unexpected good news about a project", favorite: true },
      { text: "Spent quality time with my pet", favorite: true }
    ],
    [
      { text: "Accomplished all items on my to-do list", favorite: false },
      { text: "Had a spontaneous dance session in my room", favorite: true },
      { text: "Enjoyed a warm, comforting meal", favorite: false }
    ]
  ];

  // Generate entries for the past 10 days
  for (let i = 0; i < 10; i++) {
    const date = subDays(new Date(), i + 1);
    const dateStr = format(date, "yyyy-MM-dd");
    const timeStr = format(new Date(date.getTime() + Math.random() * 12 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), "HH:mm");
    
    fakeEntries.push({
      id: `fake-${dateStr}-${timeStr}`,
      date: dateStr,
      time: timeStr,
      items: sampleItems[i % sampleItems.length] as [EntryItem, EntryItem, EntryItem]
    });
  }
  
  return fakeEntries;
};

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

  const hasYesterdayEntry = () => {
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    return entries.some(entry => entry.date === yesterday);
  };

  const getTodayEntry = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return entries.find(entry => entry.date === today);
  };

  const getYesterdayEntry = () => {
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    return entries.find(entry => entry.date === yesterday);
  };

  const addFakeData = () => {
    const fakeEntries = generateFakeData();
    const combinedEntries = [...fakeEntries, ...entries];
    setEntries(combinedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combinedEntries));
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
    addFakeData,
  };
}
