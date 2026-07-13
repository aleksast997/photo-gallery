import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { FavoritesService } from '../../core/services/favorites.service';
import { Photo } from '../../core/models/photo';
import { PhotoCard } from '../../shared/photo-card/photo-card';

/**
 * Smart page (route '/favorites'): the full list of saved photos (no infinite
 * scroll). Clicking a photo opens its single-photo page.
 */
@Component({
  selector: 'app-favorites-page',
  imports: [PhotoCard],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.scss',
})
export class FavoritesPage {
  private readonly favorites = inject(FavoritesService);
  private readonly router = inject(Router);

  protected readonly photos = this.favorites.photos;

  protected openPhoto(photo: Photo): void {
    void this.router.navigate(['/photos', photo.id]);
  }
}
