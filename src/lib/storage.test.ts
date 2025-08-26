import { describe, it, expect, vi, beforeEach } from 'vitest';

// Helper to create a mock localStorage
function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => void store.set(key, value)),
    removeItem: vi.fn((key: string) => void store.delete(key)),
    clear: vi.fn(() => void store.clear()),
    _store: store,
  } as unknown as Storage;
}

// Utility to re-import the module fresh with current globals
async function importStorageModule() {
  vi.resetModules();
  return await import('./storage');
}

describe('storage SSR-safe utilities', () => {
  beforeEach(() => {
    // Ensure SSR-like env
    delete (global as any).window;
    delete (global as any).localStorage;
    // Reset in-memory store
    delete (global as any).__MEM_STORE__;
  });

  it('uses in-memory store when window/localStorage are unavailable (SSR)', async () => {
    const storage = await importStorageModule();

    await storage.setStorageItem('foo', { a: 1 });
    const val = await storage.getStorageItem<{ a: number }>('foo');
    expect(val).toEqual({ a: 1 });

    await storage.removeStorageItem('foo');
    const after = await storage.getStorageItem('foo');
    expect(after).toBeNull();
  });

  it('handles JSON errors gracefully and returns null on get', async () => {
    // Simulate corrupted JSON in memory store by directly mutating global map after import
    const storage = await importStorageModule();
    // Access internal mem store via global symbol used in module
    const mem: Map<string, string> = (global as any).__MEM_STORE__;
    mem.set('bad', '{invalid json');
    const val = await storage.getStorageItem('bad');
    expect(val).toBeNull();
  });
});

describe('storage in browser environment (localStorage)', () => {
  beforeEach(() => {
    // Provide a browser-like env
    vi.stubGlobal('window', {} as any);
    vi.stubGlobal('localStorage', createLocalStorageMock());
  });

  it('persists values to localStorage when available', async () => {
    const storage = await importStorageModule();

    await storage.setStorageItem('user', { name: 'Ada' });
    const got = await storage.getStorageItem<{ name: string }>('user');
    expect(got).toEqual({ name: 'Ada' });

    await storage.removeStorageItem('user');
    const after = await storage.getStorageItem('user');
    expect(after).toBeNull();
  });

  it('client sync helpers work without throwing', async () => {
    const storage = await importStorageModule();

    storage.setClientStorageItem('k', 123);
    const v = storage.getClientStorageItem<number>('k');
    expect(v).toBe(123);

    storage.removeClientStorageItem('k');
    const after = storage.getClientStorageItem<number>('k');
    expect(after).toBeNull();
  });
});
