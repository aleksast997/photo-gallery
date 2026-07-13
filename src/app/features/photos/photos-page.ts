import { Component, inject } from '@angular/core';
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
 * route-scoped PhotostreamService and the app-wide FavoritesService, and lets the
 * dumb PhotoCard / InfiniteScroll do the presentation. Clicking a photo adds it
 * to favorites.
 */
@Component({
  selector: 'app-photos-page',
  imports: [PhotoCard, InfiniteScroll, MatButtonModule, MatProgressSpinnerModule],
  providers: [PhotostreamService],
  templateUrl: './photos-page.html',
  styleUrl: './photos-page.scss',
})
export class PhotosPage {
  private readonly stream = inject(PhotostreamService);
  private readonly favorites = inject(FavoritesService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly photos = this.stream.photos;
  protected readonly loading = this.stream.loading;
  protected readonly ended = this.stream.ended;
  protected readonly error = this.stream.error;

  constructor() {
    void this.stream.loadMore();
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