import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Photos',
    loadComponent: () => import('./features/photos/photos-page').then((m) => m.PhotosPage),
  },
];
