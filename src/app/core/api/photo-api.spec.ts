import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { PhotoApiService } from './photo-api';

describe('PhotoApiService', () => {
  let api: PhotoApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PhotoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests the given page/limit and maps valid photos, filtering invalid ones', async () => {
    const promise = api.getPage(2, 10);

    const req = httpMock.expectOne((r) => r.url === 'https://picsum.photos/v2/list');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('10');

    req.flush([
      { id: '0', author: 'Alejandro', width: 5000, height: 2500, url: 'x', download_url: 'y' },
      { garbage: true },
    ]);

    const photos = await promise;
    expect(photos).toHaveLength(1);
    expect(photos[0].id).toBe('0');
    expect(photos[0].thumbUrl).toBe('https://picsum.photos/id/0/500/500');
  });

  it('returns an empty list when the response is not an array', async () => {
    const promise = api.getPage(1, 5);
    httpMock.expectOne(() => true).flush({ unexpected: 'shape' });
    expect(await promise).toEqual([]);
  });

  it('rejects and cancels the request when it exceeds the timeout', async () => {
    vi.useFakeTimers();
    try {
      const promise = api.getPage(1, 30);
      const req = httpMock.expectOne((r) => r.url === 'https://picsum.photos/v2/list');
      const rejection = expect(promise).rejects.toThrow();

      await vi.advanceTimersByTimeAsync(10_000);

      await rejection;
      expect(req.cancelled).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
