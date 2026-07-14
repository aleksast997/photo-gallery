import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationError } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';

import { handleNavigationError } from './navigation-error';

const CHUNK_ERROR = 'Failed to fetch dynamically imported module';

function setup(onLine: boolean) {
  const assign = vi.fn();
  const open = vi.fn();
  const doc = { defaultView: { navigator: { onLine }, location: { assign } } };
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      { provide: MatSnackBar, useValue: { open } },
    ],
  });
  return { assign, open };
}

function navError(message: string, url = '/favorites'): NavigationError {
  return { error: new Error(message), url } as unknown as NavigationError;
}

function run(error: NavigationError): void {
  TestBed.runInInjectionContext(() => handleNavigationError(error));
}

describe('handleNavigationError', () => {
  it('reloads the target URL to recover a poisoned chunk when online', () => {
    const { assign, open } = setup(true);
    run(navError(CHUNK_ERROR, '/favorites'));
    expect(assign).toHaveBeenCalledWith('/favorites');
    expect(open).not.toHaveBeenCalled();
  });

  it('shows a dismissible message on a chunk failure while offline', () => {
    const { assign, open } = setup(false);
    run(navError(CHUNK_ERROR));
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('Check your connection'),
      'Dismiss',
      expect.objectContaining({ duration: 5000 }),
    );
    expect(assign).not.toHaveBeenCalled();
  });

  it('shows a message (no reload) for non-chunk navigation errors', () => {
    const { assign, open } = setup(true);
    run(navError('A route guard rejected'));
    expect(open).toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });
});
