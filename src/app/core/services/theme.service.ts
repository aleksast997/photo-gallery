import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

import { ThemeMode } from '../models/theme';
import { KEY_VALUE_STORE } from '../storage/key-value-store';

const THEME_STORAGE_KEY = 'photo-gallery.theme';

/**
 * Owns the light/dark theme as signal state (Layer 2). The theme is hydrated
 * synchronously from persistence (falling back to the OS preference), applied to
 * `<html>` via `color-scheme` — which drives Angular Material's M3 system
 * variables — and persisted on every change.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly store = inject(KEY_VALUE_STORE);

  private readonly _theme = signal<ThemeMode>(this.readInitialTheme());

  /** Current theme, read-only to the rest of the app. */
  readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      const mode = this._theme();
      this.document.documentElement.style.colorScheme = mode;
      this.store.set(THEME_STORAGE_KEY, mode);
    });
  }

  /** Flip between light and dark. */
  toggle(): void {
    this._theme.update((mode) => (mode === 'light' ? 'dark' : 'light'));
  }

  private readInitialTheme(): ThemeMode {
    const stored = this.store.get(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    const prefersDark =
      this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    return prefersDark ? 'dark' : 'light';
  }
}
