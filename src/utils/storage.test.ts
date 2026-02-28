import { describe, it, expect, afterEach } from "vitest";
import { defaultStorageAdapter } from "./storage";

const TEST_KEY = "three-things-storage-adapter-test";

describe("defaultStorageAdapter", () => {
  afterEach(async () => {
    await defaultStorageAdapter.remove(TEST_KEY);
  });

  it("returns null for missing key", async () => {
    await expect(defaultStorageAdapter.get(TEST_KEY)).resolves.toBeNull();
  });

  it("stores and retrieves a value", async () => {
    const value = '{"foo":1}';
    const result = await defaultStorageAdapter.set(TEST_KEY, value);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    await expect(defaultStorageAdapter.get(TEST_KEY)).resolves.toBe(value);
  });

  it("overwrites existing value", async () => {
    await defaultStorageAdapter.set(TEST_KEY, "first");
    await defaultStorageAdapter.set(TEST_KEY, "second");
    await expect(defaultStorageAdapter.get(TEST_KEY)).resolves.toBe("second");
  });

  it("remove deletes the value", async () => {
    await defaultStorageAdapter.set(TEST_KEY, "value");
    const removed = await defaultStorageAdapter.remove(TEST_KEY);
    expect(removed).toBe(true);
    await expect(defaultStorageAdapter.get(TEST_KEY)).resolves.toBeNull();
  });

  it("remove returns true when key is missing", async () => {
    await expect(defaultStorageAdapter.remove(TEST_KEY)).resolves.toBe(true);
  });
});
