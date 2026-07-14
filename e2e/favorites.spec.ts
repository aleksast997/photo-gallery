import { test, expect } from '@playwright/test';

import { mockPicsum } from './support/picsum';

test.describe('Favorites', () => {
  test('shows an empty state when there are none', async ({ page }) => {
    await mockPicsum(page);
    await page.goto('/favorites');

    await expect(page.getByText(/No favorites yet/)).toBeVisible();
    await expect(page.locator('app-photo-card')).toHaveCount(0);
  });

  test('persists across reload, opens the detail page, and removes', async ({ page }) => {
    await mockPicsum(page);
    await page.goto('/');
    await page.locator('app-photo-card button').first().click();
    await expect(page.getByText('Added to favorites')).toBeVisible();

    // Survives a full page reload (persisted in localStorage).
    await page.reload();
    await page.getByRole('link', { name: /Favorites/ }).click();
    await expect(page.locator('app-photo-card')).toHaveCount(1);

    // Opens the single-photo page.
    await page.locator('app-photo-card button').first().click();
    await expect(page).toHaveURL(/\/photos\/0$/);
    await expect(page.locator('.detail__img')).toBeVisible();

    // Removing returns to an empty favorites list.
    await page.getByRole('button', { name: 'Remove from favorites' }).click();
    await expect(page).toHaveURL(/\/favorites$/);
    await expect(page.getByText(/No favorites yet/)).toBeVisible();
  });
});
