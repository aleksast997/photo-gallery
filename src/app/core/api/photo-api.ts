import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';

import { Photo } from '../models/photo';
import { isPicsumPhotoDto } from './dto/picsum-photo.dto';
import { toPhoto } from './photo.mapper';

const PICSUM_LIST_URL = 'https://picsum.photos/v2/list';
const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 300;
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * API layer (Layer 1): the single source of truth for HTTP. It is the only place
 * allowed to touch `HttpClient`/RxJS. Observables never leak out every method
 * resolves to plain, mapped domain data via a `Promise`. A random 200–300 ms
 * delay is added to emulate real-world latency.
 *
 * Requests are bounded by a timeout so a hung or pathologically slow response
 * becomes a rejection (which the caller surfaces as an error + retry) rather than
 * an indefinite wait; the timeout also aborts the in-flight request.
 */
@Injectable({ providedIn: 'root' })
export class PhotoApiService {
  private readonly http = inject(HttpClient);

  /** Fetch one page of the random photostream. */
  async getPage(page: number, limit: number): Promise<Photo[]> {
    const response = await firstValueFrom(
      this.http
        .get<unknown>(PICSUM_LIST_URL, { params: { page, limit } })
        .pipe(timeout(REQUEST_TIMEOUT_MS)),
    );
    await this.emulateLatency();
    return this.toPhotos(response);
  }

  private toPhotos(response: unknown): Photo[] {
    if (!Array.isArray(response)) {
      return [];
    }
    return response.filter(isPicsumPhotoDto).map(toPhoto);
  }

  private emulateLatency(): Promise<void> {
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
