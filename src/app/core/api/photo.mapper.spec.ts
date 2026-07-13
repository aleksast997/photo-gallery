import { toPhoto } from './photo.mapper';
import { PicsumPhotoDto } from './dto/picsum-photo.dto';

const dto: PicsumPhotoDto = {
  id: '42',
  author: 'Ada Lovelace',
  width: 2000,
  height: 1000,
  url: 'https://unsplash.com/x',
  download_url: 'https://picsum.photos/id/42/2000/1000',
};

describe('toPhoto', () => {
  it('maps core fields from the DTO', () => {
    const photo = toPhoto(dto);
    expect(photo.id).toBe('42');
    expect(photo.author).toBe('Ada Lovelace');
    expect(photo.width).toBe(2000);
    expect(photo.height).toBe(1000);
  });

  it('builds a square thumbnail URL', () => {
    expect(toPhoto(dto).thumbUrl).toBe('https://picsum.photos/id/42/500/500');
  });

  it('builds an aspect-preserved full URL', () => {
    // 1200 wide at a 2:1 ratio => 600 tall
    expect(toPhoto(dto).fullUrl).toBe('https://picsum.photos/id/42/1200/600');
  });
});
