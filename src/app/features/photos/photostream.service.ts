import { Injectable, computed, inject, signal } from '@angular/core';

import { PhotoApiService } from '../../core/api/photo-api';
import { Photo } from '../../core/models/photo';

const PAGE_SIZE = 30;

/**
 * Feature service (Layer 2) owning the photostream as signal state, and the only
 * caller of the API layer for the stream. It is an app singleton so the loaded
 * feed and scroll position survive navigating away from and back to the Photos
 * page (the page only fetches the first page when the stream is still empty).
 * Pages are fetched sequentially and appended; an empty page marks the end.
 */
@Injectable({ providedIn: 'root' })
export class PhotostreamService {
  private readonly api = inject(PhotoApiService);

  private readonly _photos = signal<Photo[]>([]);
  private readonly _loading = signal(false);
  private readonly _ended = signal(false);
  private readonly _error = signal(false);
  private nextPage = 1;
  private scrollOffset = 0;

  readonly photos = this._photos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly ended = this._ended.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isEmpty = computed(() => this._photos().length === 0);

  /** Fetch and append the next page. No-op while loading or once ended. */
  async loadMore(): Promise<void> {
    if (this._loading() || this._ended()) {
      return;
    }

    this._loading.set(true);
    this._error.set(false);
    try {
      const batch = await this.api.getPage(this.nextPage, PAGE_SIZE);
      if (batch.length === 0) {
        this._ended.set(true);
      } else {
        this._photos.update((photos) => [...photos, ...batch]);
        this.nextPage += 1;
      }
    } catch {
      this._error.set(true);
    } finally {
      this._loading.set(false);
    }
  }

  /** Clear the error and try the failed page again. */
  retry(): Promise<void> {
    this._error.set(false);
    return this.loadMore();
  }

  /** Last known scroll offset of the Photos page, restored when returning to it. */
  getScrollOffset(): number {
    return this.scrollOffset;
  }

  saveScrollOffset(offset: number): void {
    this.scrollOffset = offset;
  }
}
