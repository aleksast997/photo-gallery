import { Component, DestroyRef, DOCUMENT, afterNextRender, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PhotostreamService } from './photostream.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Photo } from '../../core/models/photo';
import { PhotoCard } from '../../shared/photo-card/photo-card';
import { InfiniteScroll } from '../../shared/infinite-scroll';

const SNACK_DURATION_MS = 2000;

/**
 * Smart page (route '/'): the infinite random photostream. Orchestrates the
 * app-level PhotostreamService and the app-wide FavoritesService, and lets the
 * dumb PhotoCard / InfiniteScroll do the presentation. Clicking a photo adds it
 * to favorites. Because the stream is a singleton, the loaded feed and scroll
 * position are preserved when leaving and returning to this page.
 */
@Component({
  selector: 'app-photos-page',
  imports: [PhotoCard, InfiniteScroll, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './photos-page.html',
  styleUrl: './photos-page.scss',
})
export class PhotosPage {
  private readonly stream = inject(PhotostreamService);
  private readonly favorites = inject(FavoritesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly photos = this.stream.photos;
  protected readonly loading = this.stream.loading;
  protected readonly ended = this.stream.ended;
  protected readonly error = this.stream.error;

  constructor() {
    // Only fetch the first page on a genuinely fresh stream; on return the
    // singleton already holds the loaded feed.
    if (this.stream.isEmpty()) {
      void this.stream.loadMore();
    }

    afterNextRender(() => {
      const win = this.document.defaultView;
      if (!win) {
        return;
      }

      // Restore the previous position now that the preserved feed has rendered.
      const offset = this.stream.getScrollOffset();
      if (offset > 0) {
        win.scrollTo(0, offset);
      }

      // Track the scroll position continuously while browsing. Registered as a
      // passive DOM listener (not an Angular host binding) so frequent scroll
      // events don't trigger change detection. Capturing here — rather than on
      // destroy — avoids reading 0 after the grid has been detached.
      const onScroll = () => this.stream.saveScrollOffset(win.scrollY);
      win.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => win.removeEventListener('scroll', onScroll));
    });
  }

  protected isFavorite(id: string): boolean {
    return this.favorites.isFavorite(id);
  }

  protected onSelect(photo: Photo): void {
    if (this.favorites.isFavorite(photo.id)) {
      this.snackBar.open('Already in your favorites', 'Dismiss', { duration: SNACK_DURATION_MS });
      return;
    }
    this.favorites.add(photo);
    this.snackBar.open('Added to favorites', 'Dismiss', { duration: SNACK_DURATION_MS });
  }

  protected loadMore(): void {
    void this.stream.loadMore();
  }

  protected retry(): void {
    void this.stream.retry();
  }
}
