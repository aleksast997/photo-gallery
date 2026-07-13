import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './shared/header/header';
import { ThemeService } from './core/services/theme.service';
import { FavoritesService } from './core/services/favorites.service';

/**
 * Smart application shell. Renders the persistent header (present on every route)
 * and the routed content, wiring the dumb `Header` to the feature services.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly themeService = inject(ThemeService);
  private readonly favorites = inject(FavoritesService);

  protected readonly theme = this.themeService.theme;
  protected readonly favoritesCount = this.favorites.count;

  protected onToggleTheme(): void {
    this.themeService.toggle();
  }
}