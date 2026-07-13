import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Photos',
    loadComponent: () => import('./features/photos/photos-page').then((m) => m.PhotosPage),
  },
  {
    path: 'favorites',
    title: 'Favorites',
    loadComponent: () => import('./features/favorites/favorites-page').then((m) => m.FavoritesPage),
  },
  {
    path: 'photos/:id',
    title: 'Photo',
    loadComponent: () =>
      import('./features/photo-detail/photo-detail-page').then((m) => m.PhotoDetailPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
