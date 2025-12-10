import { useState, useEffect } from "react";
import { format, subDays, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

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

export type MonthlyReflection = {
  id: string;
  month: string; // Format: "2024-01"
  selectedFavorites: string[]; // Array of entry IDs (up to 5)
  reflectionText: string;
  createdAt: string; // ISO date string
};

const STORAGE_KEY = "three-things-entries";
const MONTHLY_REFLECTIONS_KEY = "three-things-monthly-reflections";

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
  const [monthlyReflections, setMonthlyReflections] = useState<MonthlyReflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(false);
  }, []);

  // Load monthly reflections from localStorage on mount
  const loadMonthlyReflections = () => {
    const stored = localStorage.getItem(MONTHLY_REFLECTIONS_KEY);
    if (stored) {
      try {
        const parsedReflections = JSON.parse(stored);
        setMonthlyReflections(parsedReflections);
      } catch (error) {
        console.error("Failed to parse monthly reflections from localStorage:", error);
      }
    } else {
      setMonthlyReflections([]);
    }
  };

  useEffect(() => {
    loadMonthlyReflections();
    
    // Listen for custom event to reload monthly reflections
    const handleReload = () => {
      loadMonthlyReflections();
    };
    window.addEventListener("reloadMonthlyReflections", handleReload);
    return () => window.removeEventListener("reloadMonthlyReflections", handleReload);
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

  const importEntries = (importedEntries: Entry[]) => {
    // Filter out duplicates based on date and time
    const existingKeys = new Set(entries.map(entry => `${entry.date}-${entry.time}`));
    const newEntries = importedEntries.filter(entry => 
      !existingKeys.has(`${entry.date}-${entry.time}`)
    );
    
    // Combine with existing entries and sort by date (newest first)
    const combinedEntries = [...entries, ...newEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setEntries(combinedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combinedEntries));
    
    return newEntries.length; // Return count of newly imported entries
  };

  // Monthly Reflection functions
  const saveMonthlyReflection = (reflection: Omit<MonthlyReflection, 'id' | 'createdAt'>) => {
    const newReflection: MonthlyReflection = {
      ...reflection,
      id: `monthly-${reflection.month}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    // Check if reflection for this month already exists
    const existingIndex = monthlyReflections.findIndex(r => r.month === reflection.month);
    let updatedReflections: MonthlyReflection[];
    
    if (existingIndex >= 0) {
      // Update existing reflection
      updatedReflections = [...monthlyReflections];
      updatedReflections[existingIndex] = { ...newReflection, id: monthlyReflections[existingIndex].id, createdAt: monthlyReflections[existingIndex].createdAt };
    } else {
      // Add new reflection
      updatedReflections = [...monthlyReflections, newReflection];
    }
    
    setMonthlyReflections(updatedReflections);
    localStorage.setItem(MONTHLY_REFLECTIONS_KEY, JSON.stringify(updatedReflections));
  };

  const updateMonthlyReflection = (id: string, updates: Partial<Omit<MonthlyReflection, 'id' | 'createdAt'>>) => {
    const updatedReflections = monthlyReflections.map(reflection =>
      reflection.id === id ? { ...reflection, ...updates } : reflection
    );
    setMonthlyReflections(updatedReflections);
    localStorage.setItem(MONTHLY_REFLECTIONS_KEY, JSON.stringify(updatedReflections));
  };

  const getMonthlyReflection = (month: string) => {
    return monthlyReflections.find(r => r.month === month);
  };

  const getEntriesForMonth = (month: string) => {
    const monthDate = parseISO(`${month}-01`);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    return entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
    });
  };

  const getStarredItemsForMonth = (month: string) => {
    const monthEntries = getEntriesForMonth(month);
    const starredItems: Array<{ entryId: string; itemIndex: number; text: string }> = [];
    
    monthEntries.forEach(entry => {
      entry.items.forEach((item, index) => {
        if (item.favorite) {
          starredItems.push({
            entryId: entry.id,
            itemIndex: index,
            text: item.text,
          });
        }
      });
    });
    
    return starredItems;
  };

  const shouldShowMonthlyReviewPrompt = () => {
    const today = new Date();
    const isFirstOfMonth = today.getDate() === 1;
    
    // Only show on the 1st of the month
    if (!isFirstOfMonth) return false;
    
    const previousMonth = format(subDays(today, 1), "yyyy-MM");
    const hasReflection = monthlyReflections.some(r => r.month === previousMonth);
    const hasEntries = getEntriesForMonth(previousMonth).length > 0;
    
    return !hasReflection && hasEntries;
  };

  // Get months that have entries but no reflection yet
  const getMonthsNeedingReview = () => {
    const today = new Date();
    const currentMonth = format(today, "yyyy-MM");
    
    const monthsWithEntries = new Set<string>();
    entries.forEach(entry => {
      const month = format(parseISO(entry.date), "yyyy-MM");
      monthsWithEntries.add(month);
    });

    const monthsNeedingReview: string[] = [];
    monthsWithEntries.forEach(month => {
      // Only include months that have ended (not the current month or future months)
      // String comparison works for yyyy-MM format: "2025-11" < "2025-12" < "2026-01"
      if (month >= currentMonth) return;
      
      const hasReflection = monthlyReflections.some(r => r.month === month);
      if (!hasReflection) {
        monthsNeedingReview.push(month);
      }
    });

    // Sort newest first
    return monthsNeedingReview.sort((a, b) => b.localeCompare(a));
  };

  const getPreviousMonth = () => {
    return format(subDays(new Date(), 1), "yyyy-MM");
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
    importEntries,
    // Monthly reflection functions
    monthlyReflections,
    saveMonthlyReflection,
    updateMonthlyReflection,
    getMonthlyReflection,
    getEntriesForMonth,
    getStarredItemsForMonth,
    shouldShowMonthlyReviewPrompt,
    getPreviousMonth,
    getMonthsNeedingReview,
    // Loading state
    isLoading,
  };
}
