import { describe, it, expect, afterEach } from "vitest";
import { defaultStorageAdapter } from "./storage";

const TEST_KEY = "three-things-storage-adapter-test";

describe("defaultStorageAdapter", () => {
  afterEach(() => {
    defaultStorageAdapter.remove(TEST_KEY);
  });

  it("returns null for missing key", () => {
    expect(defaultStorageAdapter.get(TEST_KEY)).toBeNull();
  });

  it("stores and retrieves a value", () => {
    const value = '{"foo":1}';
    const result = defaultStorageAdapter.set(TEST_KEY, value);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(defaultStorageAdapter.get(TEST_KEY)).toBe(value);
  });

  it("overwrites existing value", () => {
    defaultStorageAdapter.set(TEST_KEY, "first");
    defaultStorageAdapter.set(TEST_KEY, "second");
    expect(defaultStorageAdapter.get(TEST_KEY)).toBe("second");
  });

  it("remove deletes the value", () => {
    defaultStorageAdapter.set(TEST_KEY, "value");
    const removed = defaultStorageAdapter.remove(TEST_KEY);
    expect(removed).toBe(true);
    expect(defaultStorageAdapter.get(TEST_KEY)).toBeNull();
  });

  it("remove returns true when key is missing", () => {
    expect(defaultStorageAdapter.remove(TEST_KEY)).toBe(true);
  });
});
