import { describe, it, expect, afterEach } from "vitest";
import { defaultStorageAdapter, createDualWriteAdapter, type StorageAdapter } from "./storage";

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

describe("createDualWriteAdapter", () => {
  const KEY = "dual-write-test";

  afterEach(async () => {
    await defaultStorageAdapter.remove(KEY);
  });

  it("get returns primary value and mirrors to secondary", async () => {
    const primary: StorageAdapter = {
      get: async () => "from-primary",
      set: async () => ({ success: true }),
      remove: async () => true,
    };
    const secondary = defaultStorageAdapter;
    const dual = createDualWriteAdapter(primary, secondary);
    const value = await dual.get(KEY);
    expect(value).toBe("from-primary");
    await new Promise((r) => setTimeout(r, 0));
    await expect(secondary.get(KEY)).resolves.toBe("from-primary");
  });

  it("get does not write to secondary when primary returns null", async () => {
    const primary: StorageAdapter = {
      get: async () => null,
      set: async () => ({ success: true }),
      remove: async () => true,
    };
    const secondary = defaultStorageAdapter;
    await secondary.set(KEY, "old");
    const dual = createDualWriteAdapter(primary, secondary);
    const value = await dual.get(KEY);
    expect(value).toBeNull();
    await expect(secondary.get(KEY)).resolves.toBe("old");
  });

  it("set writes to both primary and secondary", async () => {
    const primaryData: Record<string, string> = {};
    const secondaryData: Record<string, string> = {};
    const primary: StorageAdapter = {
      get: async (k) => primaryData[k] ?? null,
      set: async (k, v) => {
        primaryData[k] = v;
        return { success: true };
      },
      remove: async (k) => {
        delete primaryData[k];
        return true;
      },
    };
    const secondary: StorageAdapter = {
      get: async (k) => secondaryData[k] ?? null,
      set: async (k, v) => {
        secondaryData[k] = v;
        return { success: true };
      },
      remove: async (k) => {
        delete secondaryData[k];
        return true;
      },
    };
    const dual = createDualWriteAdapter(primary, secondary);
    const result = await dual.set(KEY, "value");
    expect(result.success).toBe(true);
    expect(primaryData[KEY]).toBe("value");
    expect(secondaryData[KEY]).toBe("value");
  });

  it("remove removes from both", async () => {
    const primaryData: Record<string, string> = { [KEY]: "v" };
    const secondaryData: Record<string, string> = { [KEY]: "v" };
    const primary: StorageAdapter = {
      get: async (k) => primaryData[k] ?? null,
      set: async (k, v) => {
        primaryData[k] = v;
        return { success: true };
      },
      remove: async (k) => {
        delete primaryData[k];
        return true;
      },
    };
    const secondary: StorageAdapter = {
      get: async (k) => secondaryData[k] ?? null,
      set: async (k, v) => {
        secondaryData[k] = v;
        return { success: true };
      },
      remove: async (k) => {
        delete secondaryData[k];
        return true;
      },
    };
    const dual = createDualWriteAdapter(primary, secondary);
    const ok = await dual.remove(KEY);
    expect(ok).toBe(true);
    expect(primaryData[KEY]).toBeUndefined();
    expect(secondaryData[KEY]).toBeUndefined();
  });
});
