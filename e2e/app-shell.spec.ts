import { test, expect } from '@playwright/test';

import { mockPicsum } from './support/picsum';

test.describe('App shell', () => {
  test('toggles dark mode and remembers it across reload', async ({ page }) => {
    await mockPicsum(page);
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).toHaveCSS('color-scheme', 'light');

    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(html).toHaveCSS('color-scheme', 'dark');

    await page.reload();
    await expect(html).toHaveCSS('color-scheme', 'dark');
  });

  test('highlights the active view in the header', async ({ page }) => {
    await mockPicsum(page);
    await page.goto('/');

    await expect(page.getByRole('link', { name: /Photos/ })).toHaveClass(/header__link--active/);

    await page.getByRole('link', { name: /Favorites/ }).click();
    await expect(page).toHaveURL(/\/favorites$/);
    await expect(page.getByRole('link', { name: /Favorites/ })).toHaveClass(/header__link--active/);
  });
});