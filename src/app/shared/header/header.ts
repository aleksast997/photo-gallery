import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

import { ThemeMode } from '../../core/models/theme';

/**
 * Dumb, reusable app header: brand, the Photos/Favorites navigation with an
 * active highlight and a favorites count badge, and a theme toggle. It holds no
 * state and injects no services — data comes in via inputs, intent goes out via
 * the `toggleTheme` output. The smart shell wires it to the feature services.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly favoritesCount = input.required<number>();
  readonly theme = input.required<ThemeMode>();
  readonly toggleTheme = output<void>();
}