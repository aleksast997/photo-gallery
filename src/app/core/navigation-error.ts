import { DOCUMENT, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationError } from '@angular/router';

const SNACK_DURATION_MS = 5000;

/** A failed dynamic import (lazy route chunk) reports one of these messages. */
function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(message);
}

/**
 * Router navigation-error handler. Lazily-loaded routes fetch their chunk on
 * demand; if that fetch fails (e.g. the connection dropped) the navigation would
 * otherwise reject with an uncaught error and no feedback.
 *
 * A failed dynamic import also *poisons* that module's record for the lifetime of
 * the page, so it keeps failing even once the connection is back. The only clean
 * recovery is a fresh document load: when the failure is a chunk load and we're
 * back online, we do a full navigation to the target URL (fresh module graph →
 * the chunk fetches cleanly). Otherwise — offline, or a non-chunk error — we show
 * a dismissible message and leave the user where they are.
 *
 * Runs in the router's injection context, so `inject()` is available here.
 */
export function handleNavigationError(navigationError: NavigationError): void {
  const win = inject(DOCUMENT).defaultView;
  const snackBar = inject(MatSnackBar);
  const online = win?.navigator.onLine ?? false;

  if (isChunkLoadError(navigationError.error) && online) {
    win?.location.assign(navigationError.url);
    return;
  }

  snackBar.open("Couldn't load that page. Check your connection and try again.", 'Dismiss', {
    duration: SNACK_DURATION_MS,
  });
}
