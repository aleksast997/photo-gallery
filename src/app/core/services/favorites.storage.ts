import { Photo } from '../models/photo';

/**
 * Serializable snapshot of a favorited photo — the localStorage shape, kept
 * decoupled from the domain `Photo` so the persistence format can evolve
 * independently. Photos are stored whole (including URLs) so the single-photo
 * page renders on a cold load without any network call.
 */
export interface StoredPhoto {
  id: string;
  author: string;
  width: number;
  height: number;
  thumbUrl: string;
  fullUrl: string;
}

/** Versioned envelope so the stored format can change without breaking readers. */
interface FavoritesEnvelopeV1 {
  version: 1;
  photos: StoredPhoto[];
}

const STORAGE_VERSION = 1;

export function toStoredPhoto(photo: Photo): StoredPhoto {
  return {
    id: photo.id,
    author: photo.author,
    width: photo.width,
    height: photo.height,
    thumbUrl: photo.thumbUrl,
    fullUrl: photo.fullUrl,
  };
}

export function fromStoredPhoto(stored: StoredPhoto): Photo {
  return {
    id: stored.id,
    author: stored.author,
    width: stored.width,
    height: stored.height,
    thumbUrl: stored.thumbUrl,
    fullUrl: stored.fullUrl,
  };
}

export function isStoredPhoto(value: unknown): value is StoredPhoto {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const photo = value as Record<string, unknown>;
  return (
    typeof photo['id'] === 'string' &&
    typeof photo['author'] === 'string' &&
    typeof photo['width'] === 'number' &&
    typeof photo['height'] === 'number' &&
    typeof photo['thumbUrl'] === 'string' &&
    typeof photo['fullUrl'] === 'string'
  );
}

/** Parse a persisted payload into domain photos, tolerating corruption/old shapes. */
export function parseFavorites(raw: string | null): Photo[] {
  if (!raw) {
    return [];
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }

  if (data === null || typeof data !== 'object') {
    return [];
  }
  const envelope = data as Record<string, unknown>;
  if (envelope['version'] !== STORAGE_VERSION || !Array.isArray(envelope['photos'])) {
    return [];
  }

  return envelope['photos'].filter(isStoredPhoto).map(fromStoredPhoto);
}

/** Serialize domain photos into a versioned, persistable string. */
export function serializeFavorites(photos: readonly Photo[]): string {
  const envelope: FavoritesEnvelopeV1 = {
    version: STORAGE_VERSION,
    photos: photos.map(toStoredPhoto),
  };
  return JSON.stringify(envelope);
}