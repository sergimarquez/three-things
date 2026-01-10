/**
 * Safe localStorage utilities with error handling
 */

export type StorageError = {
  type: "quota_exceeded" | "disabled" | "unknown";
  message: string;
};

/**
 * Safely set an item in localStorage with error handling
 * @returns true if successful, false if failed
 */
export function safeSetItem(
  key: string,
  value: string
): { success: boolean; error?: StorageError } {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (error) {
    const err = error as DOMException;

    // Handle quota exceeded
    if (err.name === "QuotaExceededError" || err.code === 22) {
      return {
        success: false,
        error: {
          type: "quota_exceeded",
          message:
            "Storage is full. Please export your data and clear some space, or delete old entries.",
        },
      };
    }

    // Handle disabled storage or security errors
    if (err.name === "SecurityError" || err.code === 18) {
      return {
        success: false,
        error: {
          type: "disabled",
          message:
            "Storage is not available. Please allow cookies/localStorage or check your browser settings.",
        },
      };
    }

    // Unknown error
    return {
      success: false,
      error: {
        type: "unknown",
        message: "Failed to save data. Please try again or export your data as a backup.",
      },
    };
  }
}

/**
 * Safely get an item from localStorage
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    // If we can't read, return null (treat as if item doesn't exist)
    return null;
  }
}

/**
 * Safely remove an item from localStorage
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    // If we can't remove, that's okay - not critical
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

