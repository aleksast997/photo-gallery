import { isPicsumPhotoDto } from './picsum-photo.dto';

const valid = {
  id: '0',
  author: 'A',
  width: 100,
  height: 200,
  url: 'x',
  download_url: 'y',
};

describe('isPicsumPhotoDto', () => {
  it('accepts a well-formed DTO', () => {
    expect(isPicsumPhotoDto(valid)).toBe(true);
  });

  it('rejects non-objects', () => {
    expect(isPicsumPhotoDto(null)).toBe(false);
    expect(isPicsumPhotoDto('nope')).toBe(false);
    expect(isPicsumPhotoDto(undefined)).toBe(false);
  });

  it('rejects wrong-typed required fields', () => {
    expect(isPicsumPhotoDto({ ...valid, id: 0 })).toBe(false);
    expect(isPicsumPhotoDto({ ...valid, width: '100' })).toBe(false);
    expect(isPicsumPhotoDto({ ...valid, author: undefined })).toBe(false);
  });
});