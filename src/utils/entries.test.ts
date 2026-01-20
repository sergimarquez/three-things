import { describe, it, expect } from "vitest";
import {
  filterEntriesByYear,
  filterEntriesByMonth,
  getYearsWithEntries,
  getStarredItems,
  calculateLongestStreak,
  calculateYearConsistency,
  hasTodayEntry,
  hasYesterdayEntry,
  getMonthsNeedingReview,
} from "./entries";
import type { Entry, MonthlyReflection } from "../types";

// Helper to create test entries
const createEntry = (
  date: string,
  items: Array<{ text: string; favorite?: boolean }> = [
    { text: "Item 1" },
    { text: "Item 2" },
    { text: "Item 3" },
  ]
): Entry => ({
  id: `${date}-12:00`,
  date,
  time: "12:00",
  items: items as [Entry["items"][0], Entry["items"][1], Entry["items"][2]],
});

describe("filterEntriesByYear", () => {
  it("filters entries by year correctly", () => {
    const entries = [
      createEntry("2024-01-15"),
      createEntry("2024-06-20"),
      createEntry("2023-12-01"),
      createEntry("2025-01-01"),
    ];

    const result = filterEntriesByYear(entries, "2024");

    expect(result).toHaveLength(2);
    expect(result.every((e) => e.date.startsWith("2024"))).toBe(true);
  });

  it("returns empty array when no entries match", () => {
    const entries = [createEntry("2024-01-15")];

    const result = filterEntriesByYear(entries, "2020");

    expect(result).toHaveLength(0);
  });

  it("handles empty entries array", () => {
    const result = filterEntriesByYear([], "2024");
    expect(result).toHaveLength(0);
  });
});

describe("filterEntriesByMonth", () => {
  it("filters entries by month correctly", () => {
    const entries = [
      createEntry("2024-01-15"),
      createEntry("2024-01-20"),
      createEntry("2024-02-01"),
      createEntry("2024-01-31"),
    ];

    const result = filterEntriesByMonth(entries, "2024-01");

    expect(result).toHaveLength(3);
    expect(result.every((e) => e.date.startsWith("2024-01"))).toBe(true);
  });

  it("handles month boundaries correctly", () => {
    const entries = [
      createEntry("2024-01-31"),
      createEntry("2024-02-01"),
    ];

    const januaryEntries = filterEntriesByMonth(entries, "2024-01");
    const februaryEntries = filterEntriesByMonth(entries, "2024-02");

    expect(januaryEntries).toHaveLength(1);
    expect(februaryEntries).toHaveLength(1);
  });
});

describe("getYearsWithEntries", () => {
  it("returns unique years sorted descending", () => {
    const entries = [
      createEntry("2022-05-01"),
      createEntry("2024-01-15"),
      createEntry("2023-06-20"),
      createEntry("2024-12-01"),
    ];

    const result = getYearsWithEntries(entries);

    expect(result).toEqual(["2024", "2023", "2022"]);
  });

  it("returns empty array for no entries", () => {
    const result = getYearsWithEntries([]);
    expect(result).toEqual([]);
  });
});

describe("getStarredItems", () => {
  it("extracts starred items from entries", () => {
    const entries = [
      createEntry("2024-01-15", [
        { text: "Starred item", favorite: true },
        { text: "Not starred" },
        { text: "Also starred", favorite: true },
      ]),
      createEntry("2024-01-16", [
        { text: "Not starred" },
        { text: "Not starred" },
        { text: "Starred", favorite: true },
      ]),
    ];

    const result = getStarredItems(entries);

    expect(result).toHaveLength(3);
    expect(result[0].text).toBe("Starred item");
    expect(result[0].itemIndex).toBe(0);
    expect(result[1].text).toBe("Also starred");
    expect(result[1].itemIndex).toBe(2);
  });

  it("returns empty array when no starred items", () => {
    const entries = [
      createEntry("2024-01-15", [
        { text: "Not starred" },
        { text: "Not starred" },
        { text: "Not starred" },
      ]),
    ];

    const result = getStarredItems(entries);
    expect(result).toHaveLength(0);
  });
});

describe("calculateLongestStreak", () => {
  it("calculates streak for consecutive days", () => {
    const dates = ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"];
    expect(calculateLongestStreak(dates)).toBe(4);
  });

  it("finds longest streak among gaps", () => {
    const dates = [
      "2024-01-01",
      "2024-01-02",
      // gap
      "2024-01-05",
      "2024-01-06",
      "2024-01-07",
      "2024-01-08",
    ];
    expect(calculateLongestStreak(dates)).toBe(4);
  });

  it("returns 1 for single entry", () => {
    expect(calculateLongestStreak(["2024-01-15"])).toBe(1);
  });

  it("returns 0 for empty array", () => {
    expect(calculateLongestStreak([])).toBe(0);
  });

  it("handles unsorted dates", () => {
    const dates = ["2024-01-03", "2024-01-01", "2024-01-02"];
    expect(calculateLongestStreak(dates)).toBe(3);
  });

  it("handles non-consecutive days", () => {
    const dates = ["2024-01-01", "2024-01-03", "2024-01-05"];
    expect(calculateLongestStreak(dates)).toBe(1);
  });
});

describe("calculateYearConsistency", () => {
  it("calculates 100% for full year", () => {
    // Past year with all 365 days
    const result = calculateYearConsistency(365, "2023", new Date("2024-06-01"));
    expect(result).toBe(100);
  });

  it("calculates partial consistency", () => {
    // 50 days out of 365
    const result = calculateYearConsistency(50, "2023", new Date("2024-06-01"));
    expect(result).toBe(14); // Math.round(50/365 * 100)
  });

  it("handles current year correctly", () => {
    // If we're on day 100 of 2024 and have 50 entries
    const jan1 = new Date(2024, 0, 1);
    const apr10 = new Date(2024, 3, 10); // Day 101 of 2024
    const daysElapsed = Math.floor((apr10.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const result = calculateYearConsistency(50, "2024", apr10);
    expect(result).toBe(Math.round((50 / daysElapsed) * 100));
  });
});

describe("hasTodayEntry", () => {
  it("returns true when today entry exists", () => {
    const today = new Date().toISOString().split("T")[0];
    const entries = [createEntry(today)];
    
    expect(hasTodayEntry(entries)).toBe(true);
  });

  it("returns false when no today entry", () => {
    const entries = [createEntry("2020-01-01")];
    
    expect(hasTodayEntry(entries)).toBe(false);
  });
});

describe("hasYesterdayEntry", () => {
  it("returns true when yesterday entry exists", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const entries = [createEntry(yesterday)];
    
    expect(hasYesterdayEntry(entries)).toBe(true);
  });

  it("returns false when no yesterday entry", () => {
    const entries = [createEntry("2020-01-01")];
    
    expect(hasYesterdayEntry(entries)).toBe(false);
  });
});

describe("getMonthsNeedingReview", () => {
  it("returns months with entries but no reflection", () => {
    const entries = [
      createEntry("2024-01-15"),
      createEntry("2024-02-15"),
      createEntry("2024-03-15"),
    ];
    
    const reflections: MonthlyReflection[] = [
      {
        id: "r1",
        month: "2024-01",
        selectedFavorites: [],
        reflectionText: "",
        createdAt: "2024-02-01",
      },
    ];

    // Mock current month to be after these months
    const result = getMonthsNeedingReview(entries, reflections);
    
    // Should return 2024-02 and 2024-03 if they're in the past
    // (depends on current date when test runs)
    expect(result.includes("2024-01")).toBe(false); // has reflection
  });

  it("excludes current and future months", () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    const futureMonth = futureDate.toISOString().slice(0, 7);
    
    const entries = [createEntry(`${futureMonth}-15`)];
    const reflections: MonthlyReflection[] = [];

    const result = getMonthsNeedingReview(entries, reflections);
    
    expect(result.includes(futureMonth)).toBe(false);
  });

  it("returns months sorted newest first", () => {
    // Use dates far in the past so they're definitely "needing review"
    const entries = [
      createEntry("2020-01-15"),
      createEntry("2020-03-15"),
      createEntry("2020-02-15"),
    ];
    const reflections: MonthlyReflection[] = [];

    const result = getMonthsNeedingReview(entries, reflections);
    
    expect(result).toEqual(["2020-03", "2020-02", "2020-01"]);
  });
});
