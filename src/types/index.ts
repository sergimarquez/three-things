/**
 * Core domain types for the 3Good gratitude journal app
 */

export type EntryItem = {
  text: string;
  favorite?: boolean;
};

export type Entry = {
  id: string;
  date: string; // Format: "yyyy-MM-dd"
  time: string; // Format: "HH:mm"
  items: [EntryItem, EntryItem, EntryItem];
};

export type MonthlyReflection = {
  id: string;
  month: string; // Format: "yyyy-MM"
  selectedFavorites: string[]; // Array of entry IDs (up to 5)
  reflectionText: string;
  createdAt: string; // ISO date string
};

export type YearlyReview = {
  id: string;
  year: string; // Format: "yyyy"
  reflectionText: string;
  createdAt: string; // ISO date string
};

/**
 * Storage-related types
 */
export type StorageError = {
  type: "quota_exceeded" | "disabled" | "unknown";
  message: string;
};

export type ValidationError = {
  type: "invalid_entry" | "invalid_reflection" | "invalid_review";
  message: string;
  data?: unknown;
};

/**
 * Constants
 */
export const STORAGE_KEYS = {
  ENTRIES: "three-things-entries",
  MONTHLY_REFLECTIONS: "three-things-monthly-reflections",
  YEARLY_REVIEWS: "three-things-yearly-reviews",
  DISMISSED_MONTH: "three-things-dismissed-month",
  DISMISSED_YEAR: "three-things-dismissed-year",
} as const;

export const DATA_VERSION = "1.2.0";
