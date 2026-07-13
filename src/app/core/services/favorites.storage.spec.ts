import {
  fromStoredPhoto,
  isStoredPhoto,
  parseFavorites,
  serializeFavorites,
  toStoredPhoto,
} from './favorites.storage';
import { Photo } from '../models/photo';

const photo: Photo = {
  id: '1',
  author: 'A',
  width: 100,
  height: 100,
  thumbUrl: 'https://picsum.photos/id/1/500/500',
  fullUrl: 'https://picsum.photos/id/1/1200/1200',
};

describe('favorites.storage', () => {
  it('round-trips photos through serialize/parse', () => {
    const parsed = parseFavorites(serializeFavorites([photo]));
    expect(parsed).toEqual([photo]);
  });

  it('maps between domain and stored shapes', () => {
    expect(fromStoredPhoto(toStoredPhoto(photo))).toEqual(photo);
  });

  it('returns an empty list for null or invalid JSON', () => {
    expect(parseFavorites(null)).toEqual([]);
    expect(parseFavorites('{not json')).toEqual([]);
  });

  it('ignores payloads with an unknown version', () => {
    const raw = JSON.stringify({ version: 999, photos: [toStoredPhoto(photo)] });
    expect(parseFavorites(raw)).toEqual([]);
  });

  it('filters out entries that are not valid stored photos', () => {
    const raw = JSON.stringify({ version: 1, photos: [toStoredPhoto(photo), { id: 5 }] });
    expect(parseFavorites(raw)).toEqual([photo]);
  });

  it('validates the stored-photo shape', () => {
    expect(isStoredPhoto(toStoredPhoto(photo))).toBe(true);
    expect(isStoredPhoto({ id: '1' })).toBe(false);
    expect(isStoredPhoto(null)).toBe(false);
  });
});