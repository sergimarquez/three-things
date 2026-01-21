/**
 * useEntries - wrapper around EntriesContext for backward compatibility
 */

import { useEntriesContext } from "../context/EntriesContext";

import type { Entry, EntryItem, MonthlyReflection, YearlyReview } from "../types";
import { DATA_VERSION } from "../types";

export type { Entry, EntryItem, MonthlyReflection, YearlyReview };
export { DATA_VERSION };

export function useEntries() {
  return useEntriesContext();
}
