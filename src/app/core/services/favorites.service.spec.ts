import { TestBed } from '@angular/core/testing';

import { FavoritesService } from './favorites.service';
import { serializeFavorites } from './favorites.storage';
import { KEY_VALUE_STORE, KeyValueStore } from '../storage/key-value-store';
import { Photo } from '../models/photo';

const FAVORITES_KEY = 'photo-gallery.favorites';

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

describe('FavoritesService', () => {
  let store: FakeStore;

  function create(seed: Photo[] = []): FavoritesService {
    store = new FakeStore();
    if (seed.length) {
      store.set(FAVORITES_KEY, serializeFavorites(seed));
    }
    TestBed.configureTestingModule({
      providers: [{ provide: KEY_VALUE_STORE, useValue: store }],
    });
    return TestBed.inject(FavoritesService);
  }

  it('hydrates synchronously from storage', () => {
    const service = create([photo('1'), photo('2')]);
    expect(service.count()).toBe(2);
    expect(service.isFavorite('1')).toBe(true);
    expect(service.isFavorite('x')).toBe(false);
  });

  it('adds newest-first and de-duplicates by id', () => {
    const service = create();
    service.add(photo('1'));
    service.add(photo('2'));
    service.add(photo('1'));
    expect(service.photos().map((p) => p.id)).toEqual(['2', '1']);
    expect(service.count()).toBe(2);
  });

  it('removes by id', () => {
    const service = create([photo('1')]);
    service.remove('1');
    expect(service.count()).toBe(0);
  });

  it('toggles a photo in and out of favorites', () => {
    const service = create();
    service.toggle(photo('1'));
    expect(service.isFavorite('1')).toBe(true);
    service.toggle(photo('1'));
    expect(service.isFavorite('1')).toBe(false);
  });

  it('looks up a favorite by id', () => {
    const service = create([photo('7')]);
    expect(service.getById('7')?.id).toBe('7');
    expect(service.getById('missing')).toBeUndefined();
  });

  it('persists changes through the storage port', () => {
    const service = create();
    service.add(photo('1'));
    TestBed.tick();
    expect(store.get(FAVORITES_KEY)).toContain('"id":"1"');
  });
});