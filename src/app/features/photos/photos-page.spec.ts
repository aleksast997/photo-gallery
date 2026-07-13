import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';

import { PhotosPage } from './photos-page';
import { PhotoApiService } from '../../core/api/photo-api';
import { FavoritesService } from '../../core/services/favorites.service';
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

describe('PhotosPage', () => {
  let snackOpen: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    snackOpen = vi.fn();
    await TestBed.configureTestingModule({
      imports: [PhotosPage],
      providers: [
        { provide: PhotoApiService, useValue: { getPage: () => Promise.resolve([photo('1'), photo('2')]) } },
        { provide: KEY_VALUE_STORE, useValue: new FakeStore() },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(PhotosPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('loads and renders the first page of photos', async () => {
    const fixture = await render();
    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('app-photo-card');
    expect(cards).toHaveLength(2);
  });

  it('adds a photo to favorites when a card is selected', async () => {
    const fixture = await render();
    const favorites = TestBed.inject(FavoritesService);

    fixture.nativeElement.querySelector('app-photo-card button').click();

    expect(favorites.count()).toBe(1);
    expect(snackOpen).toHaveBeenCalledWith('Added to favorites', 'Dismiss', expect.anything());
  });
});