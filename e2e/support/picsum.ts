import { Page } from '@playwright/test';

/**
 * Deterministic, offline-safe mocks for the Picsum endpoints the app uses, so the
 * E2E suite never depends on the live service (fast and stable in CI). Kept small:
 * two pages of photos, then an empty page so the stream reaches its end.
 */
export const ITEMS_PER_PAGE = 6;
export const PAGES_WITH_CONTENT = 2;
export const TOTAL_ITEMS = ITEMS_PER_PAGE * PAGES_WITH_CONTENT;

const TILE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">' +
  '<rect width="500" height="500" fill="#8a8a8a"/></svg>';

interface PicsumItem {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

/** List payload for a 1-based page number; empty beyond the seeded range. */
export function listPayload(pageNumber: number): PicsumItem[] {
  if (pageNumber < 1 || pageNumber > PAGES_WITH_CONTENT) {
    return [];
  }
  const start = (pageNumber - 1) * ITEMS_PER_PAGE;
  return Array.from({ length: ITEMS_PER_PAGE }, (_, i) => {
    const id = String(start + i);
    return {
      id,
      author: `Author ${id}`,
      width: 1000,
      height: 1000,
      url: `https://example.test/${id}`,
      download_url: `https://example.test/${id}.jpg`,
    };
  });
}

/** Serve fake image bytes so <img> load events fire (skeleton -> image). */
export async function routePicsumImages(page: Page): Promise<void> {
  await page.route(/picsum\.photos\/id\//, (route) =>
    route.fulfill({ contentType: 'image/svg+xml', body: TILE_SVG }),
  );
}

/** Happy-path Picsum mock: paginated list responses + fake images. */
export async function mockPicsum(page: Page): Promise<void> {
  await page.route(/\/v2\/list/, (route, request) => {
    const pageNumber = Number(new URL(request.url()).searchParams.get('page') ?? '1');
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(listPayload(pageNumber)),
    });
  });
  await routePicsumImages(page);
}
