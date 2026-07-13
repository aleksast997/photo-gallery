import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FavoritesService } from '../../core/services/favorites.service';

/**
 * Smart page (route '/photos/:id'): a single full-screen photo with a "Remove
 * from favorites" action. The photo is resolved from FavoritesService (the only
 * way to reach this page is via a favorite, and favorites are rehydrated from
 * storage on a cold load), so no API call is needed. An unknown id shows a
 * not-found state. The `id` route param is bound to the input.
 */
@Component({
  selector: 'app-photo-detail-page',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './photo-detail-page.html',
  styleUrl: './photo-detail-page.scss',
})
export class PhotoDetailPage {
  private readonly favorites = inject(FavoritesService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly photo = computed(() => this.favorites.getById(this.id()));

  protected remove(): void {
    this.favorites.remove(this.id());
    void this.router.navigate(['/favorites']);
  }
}
