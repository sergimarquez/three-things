import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { safeSetItem, safeGetItem } from "../utils/storage";
import {
  validateEntries,
  validateMonthlyReflections,
  validateYearlyReviews,
} from "../utils/validation";

// Import types from centralized location
import type {
  Entry,
  EntryItem,
  MonthlyReflection,
  YearlyReview,
  StorageError,
  ValidationError,
} from "../types";
import { STORAGE_KEYS, DATA_VERSION } from "../types";

// Import pure utility functions
import {
  filterEntriesByYear,
  filterEntriesByMonth,
  getYearsWithEntries as getYearsWithEntriesUtil,
  getStarredItems,
  getMonthlyFavoritesForYear as getMonthlyFavoritesUtil,
  getYearSummary as getYearSummaryUtil,
  hasTodayEntry as hasTodayEntryUtil,
  hasYesterdayEntry as hasYesterdayEntryUtil,
  getTodayEntry as getTodayEntryUtil,
  getYesterdayEntry as getYesterdayEntryUtil,
  getPreviousMonth as getPreviousMonthUtil,
  getMonthsNeedingReview as getMonthsNeedingReviewUtil,
  generateFakeData,
} from "../utils/entries";

// Re-export types for backward compatibility with existing imports
export type { Entry, EntryItem, MonthlyReflection, YearlyReview };
export { DATA_VERSION };

// Use constants from types
const STORAGE_KEY = STORAGE_KEYS.ENTRIES;
const MONTHLY_REFLECTIONS_KEY = STORAGE_KEYS.MONTHLY_REFLECTIONS;
const YEARLY_REVIEWS_KEY = STORAGE_KEYS.YEARLY_REVIEWS;

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [monthlyReflections, setMonthlyReflections] = useState<MonthlyReflection[]>([]);
  const [yearlyReviews, setYearlyReviews] = useState<YearlyReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<StorageError | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Load entries from localStorage on mount
  useEffect(() => {
    const stored = safeGetItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedEntries = JSON.parse(stored);
        if (!Array.isArray(parsedEntries)) {
          throw new Error("Entries data is not an array");
        }

        // Add IDs to old entries that don't have them (before validation)
        const entriesWithIds = parsedEntries.map((entry: unknown) => {
          const e = entry as Partial<Entry>;
          return {
            ...e,
            id:
              e.id ||
              (e.date && e.time ? `${e.date}-${e.time}` : `entry-${Date.now()}-${Math.random()}`),
          };
        });

        // Validate and filter entries (repair happens inside validateEntries)
        const { valid, errors } = validateEntries(entriesWithIds);

        // If entries were repaired, save them back to localStorage
        if (valid.length > 0 && errors.some((e) => e.message.includes("repaired automatically"))) {
          const result = safeSetItem(STORAGE_KEY, JSON.stringify(valid));
          if (!result.success && result.error) {
            setStorageError(result.error);
          }
        }

        setEntries(valid);

        if (errors.length > 0) {
          setValidationErrors((prev) => [...prev, ...errors]);
          if (import.meta.env.DEV) {
            console.warn(`Found ${errors.length} invalid entries:`, errors);
          }
        }
      } catch (error) {
        console.error("Failed to parse entries from localStorage:", error);
        setStorageError({
          type: "unknown",
          message: "Failed to load your entries. Data may be corrupted. Please check your backup.",
        });
      }
    }
    setIsLoading(false);
  }, []);

  // Load monthly reflections from localStorage
  const loadMonthlyReflections = () => {
    const stored = safeGetItem(MONTHLY_REFLECTIONS_KEY);
    if (stored) {
      try {
        const parsedReflections = JSON.parse(stored);
        if (!Array.isArray(parsedReflections)) {
          throw new Error("Monthly reflections data is not an array");
        }

        const { valid, errors } = validateMonthlyReflections(parsedReflections);
        setMonthlyReflections(valid);

        if (errors.length > 0) {
          setValidationErrors((prev) => [...prev, ...errors]);
          if (import.meta.env.DEV) {
            console.warn(`Found ${errors.length} invalid monthly reflections:`, errors);
          }
        }
      } catch (error) {
        console.error("Failed to parse monthly reflections from localStorage:", error);
      }
    } else {
      setMonthlyReflections([]);
    }
  };

  const loadYearlyReviews = () => {
    const stored = safeGetItem(YEARLY_REVIEWS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
          throw new Error("Yearly reviews data is not an array");
        }

        const { valid, errors } = validateYearlyReviews(parsed);
        setYearlyReviews(valid);

        if (errors.length > 0) {
          setValidationErrors((prev) => [...prev, ...errors]);
          if (import.meta.env.DEV) {
            console.warn(`Found ${errors.length} invalid yearly reviews:`, errors);
          }
        }
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

  // ============================================================================
  // Entry CRUD Operations
  // ============================================================================

  const saveEntry = (entry: Omit<Entry, "id">) => {
    const newEntry = {
      ...entry,
      id: `${entry.date}-${entry.time}`,
    };
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);

    const result = safeSetItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    if (!result.success && result.error) {
      setStorageError(result.error);
      setEntries(entries);
      throw new Error(result.error.message);
    } else {
      setStorageError(null);
    }
  };

  const updateEntry = (id: string, updatedEntry: Omit<Entry, "id">) => {
    const updatedEntries = entries.map((entry) =>
      entry.id === id ? { ...updatedEntry, id } : entry
    );
    const previousEntries = entries;
    setEntries(updatedEntries);

    const result = safeSetItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    if (!result.success && result.error) {
      setStorageError(result.error);
      setEntries(previousEntries);
      throw new Error(result.error.message);
    } else {
      setStorageError(null);
    }
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    const previousEntries = entries;
    setEntries(updatedEntries);

    const result = safeSetItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    if (!result.success && result.error) {
      setStorageError(result.error);
      setEntries(previousEntries);
      throw new Error(result.error.message);
    } else {
      setStorageError(null);
    }
  };

  // ============================================================================
  // Entry Query Functions (delegate to pure utils)
  // ============================================================================

  const hasTodayEntry = () => hasTodayEntryUtil(entries);
  const hasYesterdayEntry = () => hasYesterdayEntryUtil(entries);
  const getTodayEntry = () => getTodayEntryUtil(entries);
  const getYesterdayEntry = () => getYesterdayEntryUtil(entries);
  const getYearsWithEntries = () => getYearsWithEntriesUtil(entries);
  const getYearEntries = (year: string) => filterEntriesByYear(entries, year);
  const getEntriesForMonth = (month: string) => filterEntriesByMonth(entries, month);
  const getPreviousMonth = () => getPreviousMonthUtil();
  const getMonthsNeedingReview = () => getMonthsNeedingReviewUtil(entries, monthlyReflections);

  const getYearStarredItems = (year: string) => {
    const yearEntries = filterEntriesByYear(entries, year);
    return getStarredItems(yearEntries);
  };

  const getStarredItemsForMonth = (month: string) => {
    const monthEntries = filterEntriesByMonth(entries, month);
    return getStarredItems(monthEntries);
  };

  const getMonthlyFavoritesForYear = (year: string) => {
    return getMonthlyFavoritesUtil(entries, monthlyReflections, year);
  };

  const getYearSummary = (year: string) => {
    return getYearSummaryUtil(entries, monthlyReflections, year);
  };

  // ============================================================================
  // Fake Data & Import
  // ============================================================================

  const addFakeData = () => {
    const fakeEntries = generateFakeData();
    const combinedEntries = [...fakeEntries, ...entries];
    const previousEntries = entries;
    setEntries(combinedEntries);

    const result = safeSetItem(STORAGE_KEY, JSON.stringify(combinedEntries));
    if (!result.success && result.error) {
      setStorageError(result.error);
      setEntries(previousEntries);
      throw new Error(result.error.message);
    } else {
      setStorageError(null);
    }
  };

  const importEntries = (importedEntries: unknown[]) => {
    const { valid: validEntries, errors } = validateEntries(importedEntries);

    if (errors.length > 0) {
      setValidationErrors((prev) => [...prev, ...errors]);
      if (import.meta.env.DEV) {
        console.warn(`Found ${errors.length} invalid entries during import:`, errors);
      }
    }

    const existingIds = new Set(entries.map((entry) => entry.id));

    // Also check localStorage directly for entries that might have been filtered out
    const stored = safeGetItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((entry: unknown) => {
            const e = entry as Partial<Entry>;
            if (e.id && typeof e.id === "string") {
              existingIds.add(e.id);
            }
          });
        }
      } catch {
        // Ignore parse errors
      }
    }

    const entriesToAdd: Entry[] = [];
    const entriesToUpdate: Entry[] = [];

    validEntries.forEach((entry) => {
      if (existingIds.has(entry.id)) {
        entriesToUpdate.push(entry);
      } else {
        entriesToAdd.push(entry);
      }
    });

    const entriesWithoutUpdated = entries.filter(
      (entry) => !entriesToUpdate.some((e) => e.id === entry.id)
    );
    const combinedEntries = [...entriesToUpdate, ...entriesToAdd, ...entriesWithoutUpdated].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const previousEntries = entries;
    setEntries(combinedEntries);

    const result = safeSetItem(STORAGE_KEY, JSON.stringify(combinedEntries));
    if (!result.success && result.error) {
      setStorageError(result.error);
      setEntries(previousEntries);
      throw new Error(result.error.message);
    } else {
      setStorageError(null);
    }

    return entriesToAdd.length + entriesToUpdate.length;
  };

  const importMonthlyReflections = (importedReflections: MonthlyReflection[]) => {
    const { valid: validReflections, errors } = validateMonthlyReflections(importedReflections);

    if (errors.length > 0) {
      setValidationErrors((prev) => [...prev, ...errors]);
      if (import.meta.env.DEV) {
        console.warn(`Found ${errors.length} invalid monthly reflections during import:`, errors);
      }
    }

    const existingMonths = new Set(monthlyReflections.map((r) => r.month));
    const newReflections = validReflections.filter(
      (reflection) => !existingMonths.has(reflection.month)
    );

    const combinedReflections = [...monthlyReflections, ...newReflections];
    const previousReflections = monthlyReflections;
    setMonthlyReflections(combinedReflections);

    const result = safeSetItem(MONTHLY_REFLECTIONS_KEY, JSON.stringify(combinedReflections));
    if (!result.success && result.error) {
      setStorageError(result.error);
      setMonthlyReflections(previousReflections);
      throw new Error(result.error.message);
    } else {
      setStorageError(null);
    }

    return newReflections.length;
  };

  const importYearlyReviews = (importedReviews: unknown[]) => {
    const { valid: validReviews, errors } = validateYearlyReviews(importedReviews);

    if (errors.length > 0) {
      setValidationErrors((prev) => [...prev, ...errors]);
      if (import.meta.env.DEV) {
        console.warn(`Found ${errors.length} invalid yearly reviews during import:`, errors);
      }
    }

    const existingYears = new Set(yearlyReviews.map((r) => r.year));
    const newReviews = validReviews.filter((review) => !existingYears.has(review.year));

    const combinedReviews = [...yearlyReviews, ...newReviews];
    const previousReviews = yearlyReviews;
    setYearlyReviews(combinedReviews);

    const result = safeSetItem(YEARLY_REVIEWS_KEY, JSON.stringify(combinedReviews));
    if (!result.success && result.error) {
      setStorageError(result.error);
      setYearlyReviews(previousReviews);
      throw new Error(result.error.message);
    } else {
      setStorageError(null);
    }

    return newReviews.length;
  };

  // ============================================================================
  // Monthly Reflection Operations
  // ============================================================================

  const saveMonthlyReflection = (reflection: Omit<MonthlyReflection, "id" | "createdAt">) => {
    const newReflection: MonthlyReflection = {
      ...reflection,
      id: `monthly-${reflection.month}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const existingIndex = monthlyReflections.findIndex((r) => r.month === reflection.month);
    let updatedReflections: MonthlyReflection[];

    if (existingIndex >= 0) {
      updatedReflections = [...monthlyReflections];
      updatedReflections[existingIndex] = {
        ...newReflection,
        id: monthlyReflections[existingIndex].id,
        createdAt: monthlyReflections[existingIndex].createdAt,
      };
    } else {
      updatedReflections = [...monthlyReflections, newReflection];
    }

    const previousReflections = monthlyReflections;
    setMonthlyReflections(updatedReflections);

    const result = safeSetItem(MONTHLY_REFLECTIONS_KEY, JSON.stringify(updatedReflections));
    if (!result.success && result.error) {
      setStorageError(result.error);
      setMonthlyReflections(previousReflections);
      throw new Error(result.error.message);
    } else {
      setStorageError(null);
    }
  };

  const updateMonthlyReflection = (
    id: string,
    updates: Partial<Omit<MonthlyReflection, "id" | "createdAt">>
  ) => {
    const updatedReflections = monthlyReflections.map((reflection) =>
      reflection.id === id ? { ...reflection, ...updates } : reflection
    );
    const previousReflections = monthlyReflections;
    setMonthlyReflections(updatedReflections);

    const result = safeSetItem(MONTHLY_REFLECTIONS_KEY, JSON.stringify(updatedReflections));
    if (!result.success && result.error) {
      setStorageError(result.error);
      setMonthlyReflections(previousReflections);
      throw new Error(result.error.message);
    } else {
      setStorageError(null);
    }
  };

  const getMonthlyReflection = (month: string) => {
    return monthlyReflections.find((r) => r.month === month);
  };

  // ============================================================================
  // Yearly Review Operations
  // ============================================================================

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

    const previousReviews = yearlyReviews;
    setYearlyReviews(updatedReviews);

    const result = safeSetItem(YEARLY_REVIEWS_KEY, JSON.stringify(updatedReviews));
    if (!result.success && result.error) {
      setStorageError(result.error);
      setYearlyReviews(previousReviews);
      throw new Error(result.error.message);
    } else {
      setStorageError(null);
    }
  };

  const getYearlyReview = (year: string) => {
    return yearlyReviews.find((r) => r.year === year);
  };

  // ============================================================================
  // Review Prompts
  // ============================================================================

  const shouldShowMonthlyReviewPrompt = () => {
    const today = new Date();
    const isFirstOfMonth = today.getDate() === 1;

    if (!isFirstOfMonth) return false;

    const previousMonth = format(subDays(today, 1), "yyyy-MM");
    const hasReflection = monthlyReflections.some((r) => r.month === previousMonth);
    const hasEntries = filterEntriesByMonth(entries, previousMonth).length > 0;

    return !hasReflection && hasEntries;
  };

  const shouldShowYearlyReviewPrompt = () => {
    const today = new Date();
    const isJanuary = today.getMonth() === 0;

    if (!isJanuary) return false;

    const previousYear = String(today.getFullYear() - 1);
    const hasReview = yearlyReviews.some((r) => r.year === previousYear);
    const hasEntries = filterEntriesByYear(entries, previousYear).length > 0;

    if (!hasEntries || hasReview) return false;

    const dayOfMonth = today.getDate();
    const decemberMonth = `${previousYear}-12`;
    const hasDecemberReview = monthlyReflections.some((r) => r.month === decemberMonth);

    if (dayOfMonth === 1) {
      return hasDecemberReview;
    }

    if (dayOfMonth >= 2) {
      const dismissedMonth = safeGetItem(STORAGE_KEYS.DISMISSED_MONTH);
      const decemberDismissed = dismissedMonth === decemberMonth;
      return hasDecemberReview || decemberDismissed;
    }

    return false;
  };

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // State
    entries,
    monthlyReflections,
    yearlyReviews,
    isLoading,
    storageError,
    validationErrors,

    // Entry operations
    saveEntry,
    updateEntry,
    deleteEntry,
    hasTodayEntry,
    hasYesterdayEntry,
    getTodayEntry,
    getYesterdayEntry,
    addFakeData,
    importEntries,

    // Entry queries
    getYearsWithEntries,
    getYearEntries,
    getEntriesForMonth,
    getYearStarredItems,
    getStarredItemsForMonth,
    getMonthlyFavoritesForYear,
    getYearSummary,

    // Monthly reflection operations
    saveMonthlyReflection,
    updateMonthlyReflection,
    getMonthlyReflection,
    importMonthlyReflections,

    // Yearly review operations
    saveYearlyReview,
    getYearlyReview,
    importYearlyReviews,

    // Review prompts
    shouldShowMonthlyReviewPrompt,
    shouldShowYearlyReviewPrompt,
    getPreviousMonth,
    getMonthsNeedingReview,

    // Error handling
    clearStorageError: () => setStorageError(null),
    clearValidationErrors: () => setValidationErrors([]),
  };
}
