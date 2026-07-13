import { Photo } from '../models/photo';
import { PicsumPhotoDto } from './dto/picsum-photo.dto';

/**
 * The single place that knows the Picsum image-URL format. Builds a square
 * thumbnail and a large, aspect-preserved image so the rest of the app only ever
 * deals with plain URLs on the domain `Photo`.
 */
const PICSUM_IMAGE_BASE = 'https://picsum.photos/id';
const THUMB_SIZE = 500;
const FULL_WIDTH = 1200;

export function toPhoto(dto: PicsumPhotoDto): Photo {
  const fullHeight = Math.max(1, Math.round((FULL_WIDTH * dto.height) / dto.width));
  return {
    id: dto.id,
    author: dto.author,
    width: dto.width,
    height: dto.height,
    thumbUrl: `${PICSUM_IMAGE_BASE}/${dto.id}/${THUMB_SIZE}/${THUMB_SIZE}`,
    fullUrl: `${PICSUM_IMAGE_BASE}/${dto.id}/${FULL_WIDTH}/${fullHeight}`,
  };
}
