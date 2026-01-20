/**
 * Pure utility functions for entry-related computations
 * These functions are stateless and easily testable
 */

import { format, subDays, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import type { Entry, EntryItem, MonthlyReflection } from "../types";

/**
 * Starred item from an entry
 */
export type StarredItem = {
  entryId: string;
  itemIndex: number;
  text: string;
  date: string;
};

/**
 * Starred item with month info (from monthly reflections)
 */
export type MonthlyFavorite = StarredItem & {
  month: string;
};

/**
 * Top moment - union type that covers both starred items and monthly favorites
 * MonthlyFavorite extends StarredItem with optional month property for compatibility
 */
export type TopMoment = StarredItem & { month?: string };

/**
 * Year summary statistics
 */
export type YearSummary = {
  year: string;
  daysPracticed: number;
  totalReflections: number;
  totalItems: number;
  starredCount: number;
  longestStreak: number;
  consistency: number;
  topMoments: TopMoment[];
};

/**
 * Filter entries by year
 */
export function filterEntriesByYear(entries: Entry[], year: string): Entry[] {
  return entries.filter((entry) => format(parseISO(entry.date), "yyyy") === year);
}

/**
 * Filter entries by month (format: "yyyy-MM")
 */
export function filterEntriesByMonth(entries: Entry[], month: string): Entry[] {
  const monthDate = parseISO(`${month}-01`);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  return entries.filter((entry) => {
    const entryDate = parseISO(entry.date);
    return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
  });
}

/**
 * Get all years that have entries
 */
export function getYearsWithEntries(entries: Entry[]): string[] {
  const years = new Set<string>();
  entries.forEach((entry) => {
    const year = format(parseISO(entry.date), "yyyy");
    years.add(year);
  });
  return Array.from(years).sort((a, b) => b.localeCompare(a));
}

/**
 * Get starred items from a list of entries
 */
export function getStarredItems(entries: Entry[]): StarredItem[] {
  const starredItems: StarredItem[] = [];
  entries.forEach((entry) => {
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
}

/**
 * Get favorites from monthly reflections for a specific year
 */
export function getMonthlyFavoritesForYear(
  entries: Entry[],
  monthlyReflections: MonthlyReflection[],
  year: string
): MonthlyFavorite[] {
  const favorites: MonthlyFavorite[] = [];

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

  // Sort by date (chronologically, oldest first)
  return favorites.sort((a, b) => {
    const dateA = parseISO(a.date).getTime();
    const dateB = parseISO(b.date).getTime();
    return dateA - dateB;
  });
}

/**
 * Calculate longest streak from a list of date strings
 */
export function calculateLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = [...dates].sort();
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

  return longestStreak;
}

/**
 * Calculate consistency percentage for a year
 */
export function calculateYearConsistency(
  uniqueDaysCount: number,
  year: string,
  referenceDate: Date = new Date()
): number {
  const yearNum = Number(year);
  const yearStart = new Date(yearNum, 0, 1);
  const yearEnd = new Date(yearNum, 11, 31);
  const effectiveEnd = referenceDate.getFullYear() === yearNum ? referenceDate : yearEnd;
  const daysInRange =
    Math.floor((effectiveEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return daysInRange > 0 ? Math.round((uniqueDaysCount / daysInRange) * 100) : 0;
}

/**
 * Get comprehensive year summary
 */
export function getYearSummary(
  entries: Entry[],
  monthlyReflections: MonthlyReflection[],
  year: string
): YearSummary {
  const yearEntries = filterEntriesByYear(entries, year);
  const uniqueDays = new Set(yearEntries.map((e) => e.date));
  const starredItems = getStarredItems(yearEntries);
  const monthlyFavorites = getMonthlyFavoritesForYear(entries, monthlyReflections, year);

  // Prefer monthly favorites; fallback to starred items
  const topMoments = monthlyFavorites.length > 0 ? monthlyFavorites : starredItems;

  const longestStreak = calculateLongestStreak(Array.from(uniqueDays));
  const consistency = calculateYearConsistency(uniqueDays.size, year);

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
}

/**
 * Check if today's entry exists
 */
export function hasTodayEntry(entries: Entry[]): boolean {
  const today = format(new Date(), "yyyy-MM-dd");
  return entries.some((entry) => entry.date === today);
}

/**
 * Check if yesterday's entry exists
 */
export function hasYesterdayEntry(entries: Entry[]): boolean {
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  return entries.some((entry) => entry.date === yesterday);
}

/**
 * Get today's entry if it exists
 */
export function getTodayEntry(entries: Entry[]): Entry | undefined {
  const today = format(new Date(), "yyyy-MM-dd");
  return entries.find((entry) => entry.date === today);
}

/**
 * Get yesterday's entry if it exists
 */
export function getYesterdayEntry(entries: Entry[]): Entry | undefined {
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  return entries.find((entry) => entry.date === yesterday);
}

/**
 * Get previous month in yyyy-MM format
 */
export function getPreviousMonth(): string {
  return format(subDays(new Date(), 1), "yyyy-MM");
}

/**
 * Get months that have entries but no reflection yet
 */
export function getMonthsNeedingReview(
  entries: Entry[],
  monthlyReflections: MonthlyReflection[]
): string[] {
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
    if (month >= currentMonth) return;

    const hasReflection = monthlyReflections.some((r) => r.month === month);
    if (!hasReflection) {
      monthsNeedingReview.push(month);
    }
  });

  // Sort newest first
  return monthsNeedingReview.sort((a, b) => b.localeCompare(a));
}

/**
 * Generate fake data for testing/demo purposes
 */
export function generateFakeData(): Entry[] {
  const fakeEntries: Entry[] = [];

  const sampleItems: [EntryItem, EntryItem, EntryItem][] = [
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
      items: sampleItems[i % sampleItems.length],
    });
  }

  return fakeEntries;
}
