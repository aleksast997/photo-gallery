import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { PhotoDetailPage } from './photo-detail-page';
import { FavoritesService } from '../../core/services/favorites.service';
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

describe('PhotoDetailPage', () => {
  async function render(id: string, seed?: Photo[]) {
    await TestBed.configureTestingModule({
      imports: [PhotoDetailPage],
      providers: [provideRouter([]), { provide: KEY_VALUE_STORE, useValue: new SeededStore(seed) }],
    }).compileComponents();
    const fixture = TestBed.createComponent(PhotoDetailPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the favorited photo full-screen', async () => {
    const el = (await render('7', [photo('7')])).nativeElement as HTMLElement;
    const img = el.querySelector('.detail__img') as HTMLImageElement | null;
    expect(img?.getAttribute('src')).toBe('https://picsum.photos/id/7/1200/1200');
    expect(el.textContent).toContain('Remove from favorites');
    expect(el.querySelector('a[href="/favorites"]')).not.toBeNull();
  });

  it('shows a not-found state for an unknown id', async () => {
    const el = (await render('missing', [photo('7')])).nativeElement as HTMLElement;
    expect(el.querySelector('.detail--missing')).not.toBeNull();
    expect(el.querySelector('.detail__img')).toBeNull();
  });

  it('removes the photo and navigates back to favorites', async () => {
    const fixture = await render('7', [photo('7')]);
    const favorites = TestBed.inject(FavoritesService);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.nativeElement.querySelector('.detail__bar button').click();

    expect(favorites.isFavorite('7')).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/favorites']);
  });
});
