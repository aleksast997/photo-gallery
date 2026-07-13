import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { PhotostreamService } from './photostream.service';
import { PhotoApiService } from '../../core/api/photo-api';
import { Photo } from '../../core/models/photo';

const photo = (id: string): Photo => ({
  id,
  author: `Author ${id}`,
  width: 100,
  height: 100,
  thumbUrl: `https://picsum.photos/id/${id}/500/500`,
  fullUrl: `https://picsum.photos/id/${id}/1200/1200`,
});

describe('PhotostreamService', () => {
  let getPage: ReturnType<typeof vi.fn>;
  let service: PhotostreamService;

  beforeEach(() => {
    getPage = vi.fn();
    TestBed.configureTestingModule({
      providers: [PhotostreamService, { provide: PhotoApiService, useValue: { getPage } }],
    });
    service = TestBed.inject(PhotostreamService);
  });

  it('loads and appends the first page', async () => {
    getPage.mockResolvedValueOnce([photo('1'), photo('2')]);
    await service.loadMore();

    expect(getPage).toHaveBeenCalledWith(1, 30);
    expect(service.photos().map((p) => p.id)).toEqual(['1', '2']);
    expect(service.loading()).toBe(false);
    expect(service.ended()).toBe(false);
  });

  it('fetches the next page number on subsequent calls', async () => {
    getPage.mockResolvedValueOnce([photo('1')]);
    await service.loadMore();
    getPage.mockResolvedValueOnce([photo('2')]);
    await service.loadMore();

    expect(getPage).toHaveBeenNthCalledWith(2, 2, 30);
    expect(service.photos().map((p) => p.id)).toEqual(['1', '2']);
  });

  it('marks the stream ended on an empty page and stops fetching', async () => {
    getPage.mockResolvedValueOnce([]);
    await service.loadMore();
    expect(service.ended()).toBe(true);

    await service.loadMore();
    expect(getPage).toHaveBeenCalledTimes(1);
  });

  it('records an error and recovers on retry', async () => {
    getPage.mockRejectedValueOnce(new Error('network'));
    await service.loadMore();
    expect(service.error()).toBe(true);
    expect(service.loading()).toBe(false);

    getPage.mockResolvedValueOnce([photo('1')]);
    await service.retry();
    expect(service.error()).toBe(false);
    expect(service.photos().map((p) => p.id)).toEqual(['1']);
  });
});