import { Injectable, computed, inject, signal } from '@angular/core';

import { PhotoApiService } from '../../core/api/photo-api';
import { Photo } from '../../core/models/photo';

const PAGE_SIZE = 30;

/**
 * Feature service (Layer 2) owning the photostream as signal state. It is the
 * only caller of the API layer for the stream and is provided at the Photos route
 * so each visit starts a fresh stream. Pages are fetched sequentially and
 * appended; an empty page marks the end.
 */
@Injectable()
export class PhotostreamService {
  private readonly api = inject(PhotoApiService);

  private readonly _photos = signal<Photo[]>([]);
  private readonly _loading = signal(false);
  private readonly _ended = signal(false);
  private readonly _error = signal(false);
  private nextPage = 1;

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
}
