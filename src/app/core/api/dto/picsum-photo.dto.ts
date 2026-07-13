/**
 * Raw item shape returned by Picsum's `GET /v2/list` endpoint (snake_case wire
 * format). This DTO is private to the API layer and must never cross into
 * services or components — the mapper converts it to the domain `Photo`.
 */
export interface PicsumPhotoDto {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

/**
 * Runtime guard narrowing an untrusted value to a `PicsumPhotoDto`. Only the
 * fields the mapper actually consumes are required, so a partially-changed API
 * response still yields as many usable photos as possible.
 */
export function isPicsumPhotoDto(value: unknown): value is PicsumPhotoDto {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const dto = value as Record<string, unknown>;
  return (
    typeof dto['id'] === 'string' &&
    typeof dto['author'] === 'string' &&
    typeof dto['width'] === 'number' &&
    typeof dto['height'] === 'number'
  );
}