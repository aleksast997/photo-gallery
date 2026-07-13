import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { FavoritesPage } from './favorites-page';
import { serializeFavorites } from '../../core/services/favorites.storage';
import { KEY_VALUE_STORE, KeyValueStore } from '../../core/storage/key-value-store';
import { Photo } from '../../core/models/photo';

const photo = (id: string): Photo => ({
  id,
  author: `Author ${id}`,
  width: 100,
  height: 100,
  thumbUrl: `https://picsum.photos/id/${id}/500/500`,
  fullUrl: `https://picsum.photos/id/${id}/1200/1200`,
});

class SeededStore implements KeyValueStore {
  private readonly map = new Map<string, string>();
  constructor(seed?: Photo[]) {
    if (seed?.length) {
      this.map.set('photo-gallery.favorites', serializeFavorites(seed));
    }
  }
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

describe('FavoritesPage', () => {
  let navigate: ReturnType<typeof vi.fn>;

  async function render(seed?: Photo[]) {
    navigate = vi.fn();
    await TestBed.configureTestingModule({
      imports: [FavoritesPage],
      providers: [
        { provide: KEY_VALUE_STORE, useValue: new SeededStore(seed) },
        { provide: Router, useValue: { navigate } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(FavoritesPage);
    fixture.detectChanges();
    return fixture;
  }

  it('shows an empty state when there are no favorites', async () => {
    const el = (await render()).nativeElement as HTMLElement;
    expect(el.querySelector('.favorites__empty')).not.toBeNull();
    expect(el.querySelectorAll('app-photo-card')).toHaveLength(0);
  });

  it('renders a card for each favorite', async () => {
    const el = (await render([photo('1'), photo('2')])).nativeElement as HTMLElement;
    expect(el.querySelector('.favorites__empty')).toBeNull();
    expect(el.querySelectorAll('app-photo-card')).toHaveLength(2);
  });

  it('navigates to the single-photo page when a card is clicked', async () => {
    const fixture = await render([photo('7')]);
    fixture.nativeElement.querySelector('app-photo-card button').click();
    expect(navigate).toHaveBeenCalledWith(['/photos', '7']);
  });
});
