import { InjectionToken } from '@angular/core';

/**
 * Persistence port. Feature services depend on this abstraction rather than the
 * Web Storage API directly, so the backing store is swappable (e.g. IndexedDB)
 * and trivially faked in unit tests.
 */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/**
 * Default `KeyValueStore` backed by `localStorage`. This is the single place in
 * the app that touches the Web Storage API. Every call is guarded so that a
 * disabled/full/unavailable store degrades gracefully instead of throwing.
 */
export class LocalStorageStore implements KeyValueStore {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore: private mode, quota exceeded, or storage unavailable */
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

/** Injectable persistence port; defaults to a `localStorage`-backed store. */
export const KEY_VALUE_STORE = new InjectionToken<KeyValueStore>('KEY_VALUE_STORE', {
  providedIn: 'root',
  factory: () => new LocalStorageStore(),
});