import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Photo } from '../../core/models/photo';

/**
 * Dumb, reusable photo tile: a square thumbnail with the author caption and an
 * optional "favorited" badge. It injects nothing and knows nothing about what a
 * click means — it just emits `select` with its photo, and the smart parent
 * decides (add to favorites, open the detail page, etc.).
 */
@Component({
  selector: 'app-photo-card',
  imports: [MatIconModule],
  templateUrl: './photo-card.html',
  styleUrl: './photo-card.scss',
})
export class PhotoCard {
  readonly photo = input.required<Photo>();
  readonly favorited = input(false);
  readonly photoSelected = output<Photo>();

  protected onSelect(): void {
    this.photoSelected.emit(this.photo());
  }
}
