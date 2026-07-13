import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { Photo } from '../models/photo';
import { KEY_VALUE_STORE } from '../storage/key-value-store';
import { parseFavorites, serializeFavorites } from './favorites.storage';

const FAVORITES_STORAGE_KEY = 'photo-gallery.favorites';

/**
 * Feature service (Layer 2) owning the favorites collection as signal state.
 * State is hydrated synchronously from the storage port on startup and written
 * back through it on every change. All mutations go through this service's
 * methods — nothing outside can change the collection.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly store = inject(KEY_VALUE_STORE);

  private readonly _photos = signal<Photo[]>(parseFavorites(this.store.get(FAVORITES_STORAGE_KEY)));

  /** All favorites, most-recently-added first. */
  readonly photos = this._photos.asReadonly();
  readonly count = computed(() => this._photos().length);

  private readonly ids = computed(() => new Set(this._photos().map((photo) => photo.id)));

  constructor() {
    effect(() => {
      this.store.set(FAVORITES_STORAGE_KEY, serializeFavorites(this._photos()));
    });
  }

  isFavorite(id: string): boolean {
    return this.ids().has(id);
  }

  getById(id: string): Photo | undefined {
    return this._photos().find((photo) => photo.id === id);
  }

  add(photo: Photo): void {
    if (this.ids().has(photo.id)) {
      return;
    }
    this._photos.update((photos) => [photo, ...photos]);
  }

  remove(id: string): void {
    this._photos.update((photos) => photos.filter((photo) => photo.id !== id));
  }

  toggle(photo: Photo): void {
    if (this.isFavorite(photo.id)) {
      this.remove(photo.id);
    } else {
      this.add(photo);
    }
  }
}
