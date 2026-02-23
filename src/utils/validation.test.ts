import { describe, it, expect } from "vitest";
import {
  validateEntry,
  validateEntries,
  validateMonthlyReflection,
  validateMonthlyReflections,
  validateYearlyReview,
  validateYearlyReviews,
} from "./validation";
import type { Entry, EntryItem, MonthlyReflection, YearlyReview } from "../types";

function validEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: "2024-01-15-12:00",
    date: "2024-01-15",
    time: "12:00",
    items: [
      { text: "Item 1" },
      { text: "Item 2" },
      { text: "Item 3" },
    ],
    ...overrides,
  };
}

function validMonthlyReflection(overrides: Partial<MonthlyReflection> = {}): MonthlyReflection {
  return {
    id: "monthly-2024-01-123",
    month: "2024-01",
    selectedFavorites: [],
    reflectionText: "A good month.",
    createdAt: "2024-02-01T10:00:00.000Z",
    ...overrides,
  };
}

function validYearlyReview(overrides: Partial<YearlyReview> = {}): YearlyReview {
  return {
    id: "yearly-2023-456",
    year: "2023",
    reflectionText: "A good year.",
    createdAt: "2024-01-15T10:00:00.000Z",
    ...overrides,
  };
}

describe("validateEntry", () => {
  it("accepts a valid entry", () => {
    const result = validateEntry(validEntry());
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects null or non-object", () => {
    expect(validateEntry(null).valid).toBe(false);
    expect(validateEntry(undefined).valid).toBe(false);
    expect(validateEntry(42).valid).toBe(false);
    expect(validateEntry("string").valid).toBe(false);
    expect(validateEntry([]).valid).toBe(false);
  });

  it("rejects missing or empty id", () => {
    expect(validateEntry(validEntry({ id: "" })).valid).toBe(false);
    expect(validateEntry(validEntry({ id: "   " })).valid).toBe(false);
    const e = validEntry();
    delete (e as Partial<Entry>).id;
    expect(validateEntry(e).valid).toBe(false);
  });

  it("rejects missing or invalid date", () => {
    expect(validateEntry(validEntry({ date: "" })).valid).toBe(false);
    const e = validEntry();
    delete (e as Partial<Entry>).date;
    expect(validateEntry(e).valid).toBe(false);
  });

  it("rejects invalid date format", () => {
    expect(validateEntry(validEntry({ date: "15-01-2024" })).valid).toBe(false);
    expect(validateEntry(validEntry({ date: "2024/01/15" })).valid).toBe(false);
    expect(validateEntry(validEntry({ date: "invalid" })).valid).toBe(false);
  });

  it("rejects invalid date value", () => {
    expect(validateEntry(validEntry({ date: "2024-02-30" })).valid).toBe(false);
    expect(validateEntry(validEntry({ date: "2024-13-01" })).valid).toBe(false);
  });

  it("rejects missing or invalid time format", () => {
    expect(validateEntry(validEntry({ time: "" })).valid).toBe(false);
    expect(validateEntry(validEntry({ time: "1:00" })).valid).toBe(false);
    expect(validateEntry(validEntry({ time: "12:0" })).valid).toBe(false);
  });

  it("rejects entry without exactly 3 items", () => {
    expect(validateEntry(validEntry({ items: [] as unknown as Entry["items"] })).valid).toBe(false);
    expect(validateEntry(validEntry({ items: [{ text: "1" }] as unknown as Entry["items"] })).valid).toBe(false);
    expect(
      validateEntry(
        validEntry({
          items: [
            { text: "1" },
            { text: "2" },
            { text: "3" },
            { text: "4" },
          ] as unknown as Entry["items"],
        })
      ).valid
    ).toBe(false);
  });

  it("rejects invalid item (missing text)", () => {
    const e = validEntry();
    (e.items[0] as Partial<EntryItem>).text = 1 as unknown as string;
    expect(validateEntry(e).valid).toBe(false);
  });

  it("accepts items with optional favorite", () => {
    const result = validateEntry(
      validEntry({
        items: [
          { text: "A", favorite: true },
          { text: "B", favorite: false },
          { text: "C" },
        ],
      })
    );
    expect(result.valid).toBe(true);
  });
});

describe("validateEntries", () => {
  it("returns empty valid and errors for empty array", () => {
    const { valid, errors } = validateEntries([]);
    expect(valid).toEqual([]);
    expect(errors).toEqual([]);
  });

  it("returns all entries when all valid", () => {
    const entries = [validEntry(), validEntry({ id: "2024-01-16-09:00", date: "2024-01-16" })];
    const { valid, errors } = validateEntries(entries);
    expect(valid).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  it("rejects invalid entries and reports errors", () => {
    const input = [validEntry(), null, validEntry({ date: "bad" })];
    const { valid, errors } = validateEntries(input);
    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(2);
    expect(errors.every((e) => e.message.includes("Entry "))).toBe(true);
  });

  it("repairs entries with missing id when date and time exist", () => {
    const entryNoId = validEntry();
    delete (entryNoId as Partial<Entry>).id;
    const { valid, errors } = validateEntries([entryNoId]);
    expect(valid).toHaveLength(1);
    expect(valid[0].id).toBe("2024-01-15-12:00");
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("repaired automatically");
  });

  it("repairs entries with missing or invalid items by padding or fixing", () => {
    const entryShortItems = validEntry({
      items: [{ text: "Only one" }] as unknown as Entry["items"],
    });
    const { valid, errors } = validateEntries([entryShortItems]);
    expect(valid).toHaveLength(1);
    expect(valid[0].items).toHaveLength(3);
    expect(valid[0].items[0].text).toBe("Only one");
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("repaired automatically");
  });

  it("does not repair entries with no date", () => {
    const entryNoDate = validEntry();
    delete (entryNoDate as Partial<Entry>).date;
    const { valid, errors } = validateEntries([entryNoDate]);
    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("could not be repaired");
  });
});

describe("validateMonthlyReflection", () => {
  it("accepts a valid monthly reflection", () => {
    const result = validateMonthlyReflection(validMonthlyReflection());
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects null or non-object", () => {
    expect(validateMonthlyReflection(null).valid).toBe(false);
    expect(validateMonthlyReflection(42).valid).toBe(false);
  });

  it("rejects missing or empty id", () => {
    expect(validateMonthlyReflection(validMonthlyReflection({ id: "" })).valid).toBe(false);
  });

  it("rejects missing or invalid month", () => {
    expect(validateMonthlyReflection(validMonthlyReflection({ month: "" })).valid).toBe(false);
    expect(validateMonthlyReflection(validMonthlyReflection({ month: "01-2024" })).valid).toBe(false);
    expect(validateMonthlyReflection(validMonthlyReflection({ month: "2024" })).valid).toBe(false);
  });

  it("rejects when selectedFavorites is not an array", () => {
    expect(
      validateMonthlyReflection(validMonthlyReflection({ selectedFavorites: "x" as unknown as string[] })).valid
    ).toBe(false);
  });

  it("rejects missing reflectionText or createdAt", () => {
    expect(validateMonthlyReflection(validMonthlyReflection({ reflectionText: 1 as unknown as string })).valid).toBe(false);
    expect(validateMonthlyReflection(validMonthlyReflection({ createdAt: "" })).valid).toBe(false);
  });
});

describe("validateMonthlyReflections", () => {
  it("returns empty arrays for empty input", () => {
    const { valid, errors } = validateMonthlyReflections([]);
    expect(valid).toEqual([]);
    expect(errors).toEqual([]);
  });

  it("returns all valid reflections when all valid", () => {
    const reflections = [
      validMonthlyReflection(),
      validMonthlyReflection({ id: "m2", month: "2024-02" }),
    ];
    const { valid, errors } = validateMonthlyReflections(reflections);
    expect(valid).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  it("splits valid and invalid and prefixes error message with index", () => {
    const input = [validMonthlyReflection(), null, validMonthlyReflection({ month: "bad" })];
    const { valid, errors } = validateMonthlyReflections(input);
    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(2);
    expect(errors[0].message).toContain("Monthly reflection 2:");
    expect(errors[1].message).toContain("Monthly reflection 3:");
  });
});

describe("validateYearlyReview", () => {
  it("accepts a valid yearly review", () => {
    const result = validateYearlyReview(validYearlyReview());
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects null or non-object", () => {
    expect(validateYearlyReview(null).valid).toBe(false);
    expect(validateYearlyReview([]).valid).toBe(false);
  });

  it("rejects missing or empty id or year", () => {
    expect(validateYearlyReview(validYearlyReview({ id: "" })).valid).toBe(false);
    expect(validateYearlyReview(validYearlyReview({ year: "" })).valid).toBe(false);
  });

  it("rejects invalid year format", () => {
    expect(validateYearlyReview(validYearlyReview({ year: "23" })).valid).toBe(false);
    expect(validateYearlyReview(validYearlyReview({ year: "2024-01" })).valid).toBe(false);
  });

  it("rejects missing reflectionText or createdAt", () => {
    expect(validateYearlyReview(validYearlyReview({ reflectionText: null as unknown as string })).valid).toBe(false);
    expect(validateYearlyReview(validYearlyReview({ createdAt: "" })).valid).toBe(false);
  });
});

describe("validateYearlyReviews", () => {
  it("returns empty arrays for empty input", () => {
    const { valid, errors } = validateYearlyReviews([]);
    expect(valid).toEqual([]);
    expect(errors).toEqual([]);
  });

  it("returns all valid reviews when all valid", () => {
    const reviews = [validYearlyReview(), validYearlyReview({ id: "y2", year: "2022" })];
    const { valid, errors } = validateYearlyReviews(reviews);
    expect(valid).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  it("splits valid and invalid and prefixes error message with index", () => {
    const input = [validYearlyReview(), {}, validYearlyReview({ year: "99" })];
    const { valid, errors } = validateYearlyReviews(input);
    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(2);
    expect(errors[0].message).toContain("Yearly review 2:");
    expect(errors[1].message).toContain("Yearly review 3:");
  });
});
