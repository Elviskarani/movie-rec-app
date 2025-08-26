// Client-safe storage utilities with SSR-safe fallback

// Detect browser environment
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// In-memory fallback for server/SSR where localStorage is unavailable
const memoryStore: Map<string, string> = (globalThis as any).__MEM_STORE__ || new Map();
if (!(globalThis as any).__MEM_STORE__) {
  (globalThis as any).__MEM_STORE__ = memoryStore;
}

export const setStorageItem = async <T>(key: string, value: T): Promise<void> => {
  try {
    const serialized = JSON.stringify(value);
    if (isBrowser) {
      localStorage.setItem(key, serialized);
    } else {
      memoryStore.set(key, serialized);
    }
  } catch {
    // Swallow errors to avoid breaking UI
  }
};

export const getStorageItem = async <T>(key: string): Promise<T | null> => {
  try {
    if (isBrowser) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    }
    const mem = memoryStore.get(key);
    return mem ? (JSON.parse(mem) as T) : null;
  } catch {
    return null;
  }
};

export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    if (isBrowser) {
      localStorage.removeItem(key);
    } else {
      memoryStore.delete(key);
    }
  } catch {
    // No-op
  }
};

// Client-only convenience aliases (sync) — safe guards included
export const setClientStorageItem = <T>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value);
    if (isBrowser) {
      localStorage.setItem(key, serialized);
    } else {
      memoryStore.set(key, serialized);
    }
  } catch {
    // No-op
  }
};

export const getClientStorageItem = <T>(key: string): T | null => {
  try {
    if (isBrowser) {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    }
    const mem = memoryStore.get(key);
    return mem ? (JSON.parse(mem) as T) : null;
  } catch {
    return null;
  }
};

export const removeClientStorageItem = (key: string): void => {
  try {
    if (isBrowser) {
      localStorage.removeItem(key);
    } else {
      memoryStore.delete(key);
    }
  } catch {
    // No-op
  }
};