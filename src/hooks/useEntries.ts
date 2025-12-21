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

export type YearlyReview = {
  id: string;
  year: string; // Format: "2024"
  reflectionText: string;
  createdAt: string;
};

const STORAGE_KEY = "three-things-entries";
const MONTHLY_REFLECTIONS_KEY = "three-things-monthly-reflections";
const YEARLY_REVIEWS_KEY = "three-things-yearly-reviews";
export const DATA_VERSION = "1.1.0";

// Fake data for testing
const generateFakeData = (): Entry[] => {
  const fakeEntries: Entry[] = [];

  const sampleItems = [
    [
      { text: "Had a great coffee this morning that perfectly started my day", favorite: true },
      { text: "Received a thoughtful message from an old friend", favorite: false },
      { text: "Finished reading an interesting chapter in my book", favorite: false },
    ],
    [
      { text: "Enjoyed a peaceful walk in the park during lunch break", favorite: false },
      { text: "Successfully completed a challenging work project", favorite: true },
      { text: "Cooked a delicious dinner that turned out better than expected", favorite: true },
    ],
    [
      { text: "Watched a beautiful sunset from my window", favorite: true },
      { text: "Had a meaningful conversation with my family", favorite: false },
      { text: "Discovered a new song that I absolutely love", favorite: false },
    ],
    [
      { text: "Felt grateful for my health and energy today", favorite: false },
      { text: "Helped a colleague solve a difficult problem", favorite: true },
      { text: "Enjoyed a moment of quiet reflection before bed", favorite: false },
    ],
    [
      { text: "Laughed until my stomach hurt with friends", favorite: true },
      { text: "Found a perfect parking spot right when I needed it", favorite: false },
      { text: "Treated myself to my favorite dessert", favorite: false },
    ],
    [
      { text: "Woke up feeling refreshed and optimistic", favorite: false },
      { text: "Received unexpected good news about a project", favorite: true },
      { text: "Spent quality time with my pet", favorite: true },
    ],
    [
      { text: "Accomplished all items on my to-do list", favorite: false },
      { text: "Had a spontaneous dance session in my room", favorite: true },
      { text: "Enjoyed a warm, comforting meal", favorite: false },
    ],
  ];

  // Generate entries for the past 10 days
  for (let i = 0; i < 10; i++) {
    const date = subDays(new Date(), i + 1);
    const dateStr = format(date, "yyyy-MM-dd");
    const timeStr = format(
      new Date(date.getTime() + Math.random() * 12 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      "HH:mm"
    );

    fakeEntries.push({
      id: `fake-${dateStr}-${timeStr}`,
      date: dateStr,
      time: timeStr,
      items: sampleItems[i % sampleItems.length] as [EntryItem, EntryItem, EntryItem],
    });
  }

  return fakeEntries;
};

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [monthlyReflections, setMonthlyReflections] = useState<MonthlyReflection[]>([]);
  const [yearlyReviews, setYearlyReviews] = useState<YearlyReview[]>([]);
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

  const loadYearlyReviews = () => {
    const stored = localStorage.getItem(YEARLY_REVIEWS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setYearlyReviews(parsed);
      } catch (error) {
        console.error("Failed to parse yearly reviews from localStorage:", error);
      }
    } else {
      setYearlyReviews([]);
    }
  };

  useEffect(() => {
    loadMonthlyReflections();
    loadYearlyReviews();

    // Listen for custom event to reload monthly reflections
    const handleReload = () => {
      loadMonthlyReflections();
      loadYearlyReviews();
    };
    window.addEventListener("reloadMonthlyReflections", handleReload);
    return () => window.removeEventListener("reloadMonthlyReflections", handleReload);
  }, []);

  const saveEntry = (entry: Omit<Entry, "id">) => {
    const newEntry = {
      ...entry,
      id: `${entry.date}-${entry.time}`,
    };
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  };

  const updateEntry = (id: string, updatedEntry: Omit<Entry, "id">) => {
    const updatedEntries = entries.map((entry) =>
      entry.id === id ? { ...updatedEntry, id } : entry
    );
    setEntries(updatedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  };

  const hasTodayEntry = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return entries.some((entry) => entry.date === today);
  };

  const hasYesterdayEntry = () => {
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    return entries.some((entry) => entry.date === yesterday);
  };

  const getTodayEntry = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return entries.find((entry) => entry.date === today);
  };

  const getYesterdayEntry = () => {
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    return entries.find((entry) => entry.date === yesterday);
  };

  const addFakeData = () => {
    const fakeEntries = generateFakeData();
    const combinedEntries = [...fakeEntries, ...entries];
    setEntries(combinedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combinedEntries));
  };

  const importEntries = (importedEntries: Entry[]) => {
    // Filter out duplicates based on date and time
    const existingKeys = new Set(entries.map((entry) => `${entry.date}-${entry.time}`));
    const newEntries = importedEntries.filter(
      (entry) => !existingKeys.has(`${entry.date}-${entry.time}`)
    );

    // Combine with existing entries and sort by date (newest first)
    const combinedEntries = [...entries, ...newEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setEntries(combinedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combinedEntries));

    return newEntries.length; // Return count of newly imported entries
  };

  const importMonthlyReflections = (importedReflections: MonthlyReflection[]) => {
    // Filter out duplicates based on month
    const existingMonths = new Set(monthlyReflections.map((r) => r.month));
    const newReflections = importedReflections.filter(
      (reflection) => !existingMonths.has(reflection.month)
    );

    // Combine with existing reflections
    const combinedReflections = [...monthlyReflections, ...newReflections];

    setMonthlyReflections(combinedReflections);
    localStorage.setItem(MONTHLY_REFLECTIONS_KEY, JSON.stringify(combinedReflections));

    return newReflections.length;
  };

  const importYearlyReviews = (importedReviews: YearlyReview[]) => {
    // Filter out duplicates based on year
    const existingYears = new Set(yearlyReviews.map((r) => r.year));
    const newReviews = importedReviews.filter((review) => !existingYears.has(review.year));

    // Combine with existing reviews
    const combinedReviews = [...yearlyReviews, ...newReviews];

    setYearlyReviews(combinedReviews);
    localStorage.setItem(YEARLY_REVIEWS_KEY, JSON.stringify(combinedReviews));

    return newReviews.length;
  };

  // Monthly Reflection functions
  const saveMonthlyReflection = (reflection: Omit<MonthlyReflection, "id" | "createdAt">) => {
    const newReflection: MonthlyReflection = {
      ...reflection,
      id: `monthly-${reflection.month}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Check if reflection for this month already exists
    const existingIndex = monthlyReflections.findIndex((r) => r.month === reflection.month);
    let updatedReflections: MonthlyReflection[];

    if (existingIndex >= 0) {
      // Update existing reflection
      updatedReflections = [...monthlyReflections];
      updatedReflections[existingIndex] = {
        ...newReflection,
        id: monthlyReflections[existingIndex].id,
        createdAt: monthlyReflections[existingIndex].createdAt,
      };
    } else {
      // Add new reflection
      updatedReflections = [...monthlyReflections, newReflection];
    }

    setMonthlyReflections(updatedReflections);
    localStorage.setItem(MONTHLY_REFLECTIONS_KEY, JSON.stringify(updatedReflections));
  };

  // Yearly Review functions
  const saveYearlyReview = (review: Omit<YearlyReview, "id" | "createdAt">) => {
    const newReview: YearlyReview = {
      ...review,
      id: `yearly-${review.year}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const existingIndex = yearlyReviews.findIndex((r) => r.year === review.year);
    let updatedReviews: YearlyReview[];

    if (existingIndex >= 0) {
      updatedReviews = [...yearlyReviews];
      updatedReviews[existingIndex] = {
        ...newReview,
        id: yearlyReviews[existingIndex].id,
        createdAt: yearlyReviews[existingIndex].createdAt,
      };
    } else {
      updatedReviews = [...yearlyReviews, newReview];
    }

    setYearlyReviews(updatedReviews);
    localStorage.setItem(YEARLY_REVIEWS_KEY, JSON.stringify(updatedReviews));
  };

  const getYearlyReview = (year: string) => {
    return yearlyReviews.find((r) => r.year === year);
  };

  const getYearsWithEntries = () => {
    const years = new Set<string>();
    entries.forEach((entry) => {
      const year = format(parseISO(entry.date), "yyyy");
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  };

  const getYearEntries = (year: string) => {
    return entries.filter((entry) => format(parseISO(entry.date), "yyyy") === year);
  };

  const getYearStarredItems = (year: string) => {
    const yearEntries = getYearEntries(year);
    const starredItems: Array<{ entryId: string; itemIndex: number; text: string; date: string }> =
      [];
    yearEntries.forEach((entry) => {
      entry.items.forEach((item, index) => {
        if (item.favorite) {
          starredItems.push({
            entryId: entry.id,
            itemIndex: index,
            text: item.text,
            date: entry.date,
          });
        }
      });
    });
    return starredItems;
  };

  const getMonthlyFavoritesForYear = (year: string) => {
    // Collect favorites from monthly reflections of that year
    const favorites: Array<{
      entryId: string;
      itemIndex: number;
      text: string;
      date: string;
      month: string;
    }> = [];

    monthlyReflections
      .filter((r) => r.month.startsWith(year))
      .forEach((reflection) => {
        reflection.selectedFavorites.forEach((key) => {
          const lastDashIndex = key.lastIndexOf("-");
          if (lastDashIndex === -1) return;
          const entryId = key.substring(0, lastDashIndex);
          const itemIndex = parseInt(key.substring(lastDashIndex + 1));
          if (isNaN(itemIndex)) return;
          const entry = entries.find((e) => e.id === entryId);
          if (entry && entry.items[itemIndex]) {
            favorites.push({
              entryId,
              itemIndex,
              text: entry.items[itemIndex].text,
              date: entry.date,
              month: reflection.month,
            });
          }
        });
      });

    return favorites;
  };

  const getYearSummary = (year: string) => {
    const yearEntries = getYearEntries(year);
    const uniqueDays = new Set(yearEntries.map((e) => e.date));
    const starredItems = getYearStarredItems(year);
    const monthlyFavorites = getMonthlyFavoritesForYear(year);

    // Prefer monthly favorites; fallback to starred items
    const topMoments = monthlyFavorites.length > 0 ? monthlyFavorites : starredItems;

    // Longest streak within the year
    const sortedDates = Array.from(uniqueDays).sort();
    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;
    sortedDates.forEach((dateStr) => {
      const d = parseISO(dateStr);
      if (prevDate) {
        const diff = (d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      prevDate = d;
    });

    // Consistency: days practiced / days passed in the year (or total days if past year)
    const yearStart = new Date(Number(year), 0, 1);
    const yearEnd = new Date(Number(year), 11, 31);
    const today = new Date();
    const effectiveEnd = today.getFullYear() === Number(year) ? today : yearEnd;
    const daysInRange =
      Math.floor((effectiveEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const consistency = daysInRange > 0 ? Math.round((uniqueDays.size / daysInRange) * 100) : 0;

    return {
      year,
      daysPracticed: yearEntries.length,
      totalReflections: yearEntries.length,
      totalItems: yearEntries.length * 3,
      starredCount: starredItems.length,
      longestStreak,
      consistency,
      topMoments,
    };
  };

  const updateMonthlyReflection = (
    id: string,
    updates: Partial<Omit<MonthlyReflection, "id" | "createdAt">>
  ) => {
    const updatedReflections = monthlyReflections.map((reflection) =>
      reflection.id === id ? { ...reflection, ...updates } : reflection
    );
    setMonthlyReflections(updatedReflections);
    localStorage.setItem(MONTHLY_REFLECTIONS_KEY, JSON.stringify(updatedReflections));
  };

  const getMonthlyReflection = (month: string) => {
    return monthlyReflections.find((r) => r.month === month);
  };

  const getEntriesForMonth = (month: string) => {
    const monthDate = parseISO(`${month}-01`);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    return entries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
    });
  };

  const getStarredItemsForMonth = (month: string) => {
    const monthEntries = getEntriesForMonth(month);
    const starredItems: Array<{ entryId: string; itemIndex: number; text: string }> = [];

    monthEntries.forEach((entry) => {
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
    const hasReflection = monthlyReflections.some((r) => r.month === previousMonth);
    const hasEntries = getEntriesForMonth(previousMonth).length > 0;

    return !hasReflection && hasEntries;
  };

  const shouldShowYearlyReviewPrompt = () => {
    const today = new Date();
    const isJanFirst = today.getMonth() === 0 && today.getDate() === 1; // January is month 0
    if (!isJanFirst) return false;

    const previousYear = String(today.getFullYear() - 1);
    const hasReview = yearlyReviews.some((r) => r.year === previousYear);
    const hasEntries = getYearEntries(previousYear).length > 0;

    return !hasReview && hasEntries;
  };

  // Get months that have entries but no reflection yet
  const getMonthsNeedingReview = () => {
    const today = new Date();
    const currentMonth = format(today, "yyyy-MM");

    const monthsWithEntries = new Set<string>();
    entries.forEach((entry) => {
      const month = format(parseISO(entry.date), "yyyy-MM");
      monthsWithEntries.add(month);
    });

    const monthsNeedingReview: string[] = [];
    monthsWithEntries.forEach((month) => {
      // Only include months that have ended (not the current month or future months)
      // String comparison works for yyyy-MM format: "2025-11" < "2025-12" < "2026-01"
      if (month >= currentMonth) return;

      const hasReflection = monthlyReflections.some((r) => r.month === month);
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
    importMonthlyReflections,
    importYearlyReviews,
    // Monthly reflection functions
    monthlyReflections,
    saveMonthlyReflection,
    updateMonthlyReflection,
    getMonthlyReflection,
    getEntriesForMonth,
    getStarredItemsForMonth,
    shouldShowMonthlyReviewPrompt,
    shouldShowYearlyReviewPrompt,
    getPreviousMonth,
    getMonthsNeedingReview,
    yearlyReviews,
    saveYearlyReview,
    getYearlyReview,
    getYearsWithEntries,
    getYearEntries,
    getYearStarredItems,
    getMonthlyFavoritesForYear,
    getYearSummary,
    // Loading state
    isLoading,
  };
}
