import type { Entry, EntryItem, MonthlyReflection, YearlyReview } from "../hooks/useEntries";
import { parseISO, isValid } from "date-fns";

/**
 * Validation utilities for data integrity
 * Validates data structure when loading from localStorage to prevent crashes
 */

export type ValidationError = {
  type: "invalid_entry" | "invalid_reflection" | "invalid_review";
  message: string;
  data?: unknown;
};

/**
 * Validate an EntryItem
 */
function isValidEntryItem(item: unknown): item is EntryItem {
  if (!item || typeof item !== "object") return false;
  const entryItem = item as Partial<EntryItem>;
  return typeof entryItem.text === "string";
}

/**
 * Validate an Entry
 */
export function validateEntry(entry: unknown): { valid: boolean; error?: ValidationError } {
  if (!entry || typeof entry !== "object") {
    return {
      valid: false,
      error: {
        type: "invalid_entry",
        message: "Entry is not an object",
        data: entry,
      },
    };
  }

  const e = entry as Partial<Entry>;

  // Check required fields
  if (typeof e.id !== "string" || !e.id.trim()) {
    return {
      valid: false,
      error: {
        type: "invalid_entry",
        message: "Entry missing or invalid 'id' field",
        data: entry,
      },
    };
  }

  if (typeof e.date !== "string" || !e.date.trim()) {
    return {
      valid: false,
      error: {
        type: "invalid_entry",
        message: "Entry missing or invalid 'date' field",
        data: entry,
      },
    };
  }

  // Validate date format (should be yyyy-MM-dd)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(e.date)) {
    return {
      valid: false,
      error: {
        type: "invalid_entry",
        message: `Entry has invalid date format: ${e.date}`,
        data: entry,
      },
    };
  }

  // Validate date is actually a valid date
  if (!isValid(parseISO(e.date))) {
    return {
      valid: false,
      error: {
        type: "invalid_entry",
        message: `Entry has invalid date value: ${e.date}`,
        data: entry,
      },
    };
  }

  if (typeof e.time !== "string" || !e.time.trim()) {
    return {
      valid: false,
      error: {
        type: "invalid_entry",
        message: "Entry missing or invalid 'time' field",
        data: entry,
      },
    };
  }

  // Validate time format (should be HH:mm)
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(e.time)) {
    return {
      valid: false,
      error: {
        type: "invalid_entry",
        message: `Entry has invalid time format: ${e.time}`,
        data: entry,
      },
    };
  }

  // Validate items array
  if (!Array.isArray(e.items) || e.items.length !== 3) {
    return {
      valid: false,
      error: {
        type: "invalid_entry",
        message: "Entry must have exactly 3 items",
        data: entry,
      },
    };
  }

  // Validate each item
  for (let i = 0; i < e.items.length; i++) {
    if (!isValidEntryItem(e.items[i])) {
      return {
        valid: false,
        error: {
          type: "invalid_entry",
          message: `Entry item ${i} is invalid`,
          data: entry,
        },
      };
    }
  }

  return { valid: true };
}

/**
 * Validate a MonthlyReflection
 */
export function validateMonthlyReflection(reflection: unknown): {
  valid: boolean;
  error?: ValidationError;
} {
  if (!reflection || typeof reflection !== "object") {
    return {
      valid: false,
      error: {
        type: "invalid_reflection",
        message: "Monthly reflection is not an object",
        data: reflection,
      },
    };
  }

  const r = reflection as Partial<MonthlyReflection>;

  if (typeof r.id !== "string" || !r.id.trim()) {
    return {
      valid: false,
      error: {
        type: "invalid_reflection",
        message: "Monthly reflection missing or invalid 'id' field",
        data: reflection,
      },
    };
  }

  if (typeof r.month !== "string" || !r.month.trim()) {
    return {
      valid: false,
      error: {
        type: "invalid_reflection",
        message: "Monthly reflection missing or invalid 'month' field",
        data: reflection,
      },
    };
  }

  // Validate month format (should be yyyy-MM)
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(r.month)) {
    return {
      valid: false,
      error: {
        type: "invalid_reflection",
        message: `Monthly reflection has invalid month format: ${r.month}`,
        data: reflection,
      },
    };
  }

  if (!Array.isArray(r.selectedFavorites)) {
    return {
      valid: false,
      error: {
        type: "invalid_reflection",
        message: "Monthly reflection 'selectedFavorites' must be an array",
        data: reflection,
      },
    };
  }

  if (typeof r.reflectionText !== "string") {
    return {
      valid: false,
      error: {
        type: "invalid_reflection",
        message: "Monthly reflection 'reflectionText' must be a string",
        data: reflection,
      },
    };
  }

  if (typeof r.createdAt !== "string" || !r.createdAt.trim()) {
    return {
      valid: false,
      error: {
        type: "invalid_reflection",
        message: "Monthly reflection missing or invalid 'createdAt' field",
        data: reflection,
      },
    };
  }

  return { valid: true };
}

/**
 * Validate a YearlyReview
 */
export function validateYearlyReview(review: unknown): { valid: boolean; error?: ValidationError } {
  if (!review || typeof review !== "object") {
    return {
      valid: false,
      error: {
        type: "invalid_review",
        message: "Yearly review is not an object",
        data: review,
      },
    };
  }

  const r = review as Partial<YearlyReview>;

  if (typeof r.id !== "string" || !r.id.trim()) {
    return {
      valid: false,
      error: {
        type: "invalid_review",
        message: "Yearly review missing or invalid 'id' field",
        data: review,
      },
    };
  }

  if (typeof r.year !== "string" || !r.year.trim()) {
    return {
      valid: false,
      error: {
        type: "invalid_review",
        message: "Yearly review missing or invalid 'year' field",
        data: review,
      },
    };
  }

  // Validate year format (should be yyyy)
  const yearRegex = /^\d{4}$/;
  if (!yearRegex.test(r.year)) {
    return {
      valid: false,
      error: {
        type: "invalid_review",
        message: `Yearly review has invalid year format: ${r.year}`,
        data: review,
      },
    };
  }

  if (typeof r.reflectionText !== "string") {
    return {
      valid: false,
      error: {
        type: "invalid_review",
        message: "Yearly review 'reflectionText' must be a string",
        data: review,
      },
    };
  }

  if (typeof r.createdAt !== "string" || !r.createdAt.trim()) {
    return {
      valid: false,
      error: {
        type: "invalid_review",
        message: "Yearly review missing or invalid 'createdAt' field",
        data: review,
      },
    };
  }

  return { valid: true };
}

/**
 * Try to repair an entry by fixing common issues
 * Returns repaired entry or null if unfixable
 */
function repairEntry(entry: unknown): Entry | null {
  if (!entry || typeof entry !== "object") return null;

  const e = entry as Partial<Entry>;
  const repaired: Partial<Entry> = { ...e };

  // Fix missing ID
  if (!repaired.id || typeof repaired.id !== "string") {
    if (repaired.date && repaired.time) {
      repaired.id = `${repaired.date}-${repaired.time}`;
    } else {
      repaired.id = `entry-${Date.now()}-${Math.random()}`;
    }
  }

  // Fix missing date - can't repair, need date
  if (!repaired.date || typeof repaired.date !== "string") {
    return null;
  }

  // Fix missing time - default to current time
  if (!repaired.time || typeof repaired.time !== "string") {
    repaired.time = new Date().toTimeString().slice(0, 5); // HH:mm format
  }

  // Fix items array
  let items: EntryItem[] = [];
  if (Array.isArray(repaired.items)) {
    items = repaired.items;
  }

  // Ensure exactly 3 items - pad with empty items if needed
  while (items.length < 3) {
    items.push({ text: "" });
  }
  // Trim to 3 if more than 3
  if (items.length > 3) {
    items = items.slice(0, 3);
  }

  // Fix invalid items - ensure each has text
  const fixedItems: EntryItem[] = items.map((item) => {
    if (!item || typeof item !== "object") {
      return { text: "" };
    }
    return {
      text: typeof item.text === "string" ? item.text : "",
      favorite: item.favorite === true,
    };
  });

  // Final validation - check if we have minimum required data
  if (!repaired.date || fixedItems.every((item) => !item.text.trim())) {
    return null; // Can't repair - no meaningful data
  }

  return {
    id: repaired.id!,
    date: repaired.date,
    time: repaired.time!,
    items: fixedItems as [EntryItem, EntryItem, EntryItem],
  };
}

/**
 * Validate and filter an array of entries
 * Tries to repair entries before discarding them
 * Returns valid/repaired entries and array of validation errors
 */
export function validateEntries(entries: unknown[]): { valid: Entry[]; errors: ValidationError[] } {
  const valid: Entry[] = [];
  const errors: ValidationError[] = [];

  entries.forEach((entry, index) => {
    const result = validateEntry(entry);
    if (result.valid) {
      valid.push(entry as Entry);
    } else {
      // Try to repair the entry
      const repaired = repairEntry(entry);
      if (repaired) {
        // Validate the repaired entry
        const repairedResult = validateEntry(repaired);
        if (repairedResult.valid) {
          valid.push(repaired);
          errors.push({
            ...result.error!,
            message: `Entry ${index + 1}: ${result.error!.message} (repaired automatically)`,
          });
        } else {
          // Couldn't repair
          errors.push({
            ...result.error!,
            message: `Entry ${index + 1}: ${result.error!.message} (could not be repaired)`,
          });
        }
      } else {
        // Couldn't repair
        errors.push({
          ...result.error!,
          message: `Entry ${index + 1}: ${result.error!.message} (could not be repaired)`,
        });
      }
    }
  });

  return { valid, errors };
}

/**
 * Validate and filter an array of monthly reflections
 */
export function validateMonthlyReflections(reflections: unknown[]): {
  valid: MonthlyReflection[];
  errors: ValidationError[];
} {
  const valid: MonthlyReflection[] = [];
  const errors: ValidationError[] = [];

  reflections.forEach((reflection, index) => {
    const result = validateMonthlyReflection(reflection);
    if (result.valid) {
      valid.push(reflection as MonthlyReflection);
    } else {
      errors.push({
        ...result.error!,
        message: `Monthly reflection ${index + 1}: ${result.error!.message}`,
      });
    }
  });

  return { valid, errors };
}

/**
 * Validate and filter an array of yearly reviews
 */
export function validateYearlyReviews(reviews: unknown[]): {
  valid: YearlyReview[];
  errors: ValidationError[];
} {
  const valid: YearlyReview[] = [];
  const errors: ValidationError[] = [];

  reviews.forEach((review, index) => {
    const result = validateYearlyReview(review);
    if (result.valid) {
      valid.push(review as YearlyReview);
    } else {
      errors.push({
        ...result.error!,
        message: `Yearly review ${index + 1}: ${result.error!.message}`,
      });
    }
  });

  return { valid, errors };
}




