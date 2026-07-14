import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

const SNACK_DURATION_MS = 5000;

/**
 * Router navigation-error handler. Lazily-loaded routes fetch their chunk on
 * demand; if that fetch fails (e.g. the connection dropped), the navigation
 * would otherwise reject with an uncaught "Failed to fetch dynamically imported
 * module" error and no user feedback. This surfaces it as a dismissible message
 * and leaves the user on their current page.
 *
 * Runs in the router's injection context, so `inject()` is available here.
 */
export function handleNavigationError(): void {
  inject(MatSnackBar).open(
    "Couldn't load that page. Check your connection and try again.",
    'Dismiss',
    { duration: SNACK_DURATION_MS },
  );
}