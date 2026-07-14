import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';

import { handleNavigationError } from './navigation-error';

describe('handleNavigationError', () => {
  it('shows a dismissible message when a route fails to load', () => {
    const open = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: { open } }],
    });

    TestBed.runInInjectionContext(() => handleNavigationError());

    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('Check your connection'),
      'Dismiss',
      expect.objectContaining({ duration: 5000 }),
    );
  });
});