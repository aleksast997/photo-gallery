import { test, expect } from '@playwright/test';

import { listPayload, mockPicsum, routePicsumImages, TOTAL_ITEMS } from './support/picsum';

test.describe('Photostream', () => {
  test('loads photos under the Photos heading', async ({ page }) => {
    await mockPicsum(page);
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Photos', level: 1 })).toBeVisible();
    await expect(page.locator('app-photo-card').first()).toBeVisible();
  });

  test('pages through the stream and reaches the end', async ({ page }) => {
    await mockPicsum(page);
    await page.goto('/');
    await expect(page.locator('app-photo-card').first()).toBeVisible();

    const end = page.getByText("You've reached the end.");
    for (let i = 0; i < 12 && !(await end.isVisible()); i++) {
      await page.mouse.wheel(0, 3000);
      await page.waitForTimeout(250);
    }

    await expect(end).toBeVisible();
    await expect(page.locator('app-photo-card')).toHaveCount(TOTAL_ITEMS);
  });

  test('clicking a photo adds it to favorites', async ({ page }) => {
    await mockPicsum(page);
    await page.goto('/');

    await page.locator('app-photo-card button').first().click();
    await expect(page.getByText('Added to favorites')).toBeVisible();

    await page.getByRole('link', { name: /Favorites/ }).click();
    await expect(page.locator('app-photo-card')).toHaveCount(1);
  });

  test('shows an error with retry, then recovers', async ({ page }) => {
    let fail = true;
    await page.route(/\/v2\/list/, (route, request) => {
      if (fail) {
        return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      }
      const pageNumber = Number(new URL(request.url()).searchParams.get('page') ?? '1');
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(listPayload(pageNumber)),
      });
    });
    await routePicsumImages(page);

    await page.goto('/');
    await expect(page.getByText("Couldn't load photos.")).toBeVisible();

    fail = false;
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.locator('app-photo-card').first()).toBeVisible();
  });
});
