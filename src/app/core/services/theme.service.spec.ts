import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';
import { KEY_VALUE_STORE, KeyValueStore } from '../storage/key-value-store';

const THEME_KEY = 'photo-gallery.theme';

class FakeStore implements KeyValueStore {
  private readonly map = new Map<string, string>();
  get(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  set(key: string, value: string): void {
    this.map.set(key, value);
  }
  remove(key: string): void {
    this.map.delete(key);
  }
}

describe('ThemeService', () => {
  let store: FakeStore;

  function createService(seed?: 'light' | 'dark'): ThemeService {
    store = new FakeStore();
    if (seed) {
      store.set(THEME_KEY, seed);
    }
    TestBed.configureTestingModule({
      providers: [{ provide: KEY_VALUE_STORE, useValue: store }],
    });
    return TestBed.inject(ThemeService);
  }

  it('hydrates from the persisted theme', () => {
    expect(createService('dark').theme()).toBe('dark');
  });

  it('defaults to light when nothing is stored', () => {
    expect(createService().theme()).toBe('light');
  });

  it('toggles between light and dark', () => {
    const service = createService('light');
    service.toggle();
    expect(service.theme()).toBe('dark');
    service.toggle();
    expect(service.theme()).toBe('light');
  });

  it('persists and applies the theme on change', () => {
    const service = createService('light');
    service.toggle();
    TestBed.tick();
    expect(store.get(THEME_KEY)).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});