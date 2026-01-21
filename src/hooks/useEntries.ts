/**
 * useEntries Hook
 *
 * This hook provides access to entries, monthly reflections, and yearly reviews.
 * It's a thin wrapper around EntriesContext for backward compatibility.
 *
 * ARCHITECTURE:
 * - EntriesContext (in context/EntriesContext.tsx) does all the heavy lifting
 * - This hook just re-exports the context value
 * - All components using useEntries() automatically share the same state
 *
 * WHY THIS PATTERN:
 * - Backward compatibility: existing components don't need to change their imports
 * - Single source of truth: data is loaded once in EntriesProvider
 * - Easy migration: we could eventually remove this wrapper if desired
 */

import { useEntriesContext } from "../context/EntriesContext";

// Re-export types for backward compatibility
import type { Entry, EntryItem, MonthlyReflection, YearlyReview } from "../types";
import { DATA_VERSION } from "../types";

export type { Entry, EntryItem, MonthlyReflection, YearlyReview };
export { DATA_VERSION };

/**
 * Hook to access entries state and operations.
 * Must be used within an EntriesProvider (wrapped in main.tsx).
 */
export function useEntries() {
  return useEntriesContext();
}
