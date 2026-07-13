/**
 * Domain photo model used throughout the app. Deliberately source-agnostic: it
 * carries ready-to-use image URLs, so nothing downstream knows or cares that the
 * images come from Picsum. Only the API-layer mapper knows the provider's URL
 * format.
 */
export interface Photo {
  readonly id: string;
  readonly author: string;
  readonly width: number;
  readonly height: number;
  /** Square image for grid/list tiles. */
  readonly thumbUrl: string;
  /** Large, aspect-preserved image for the single-photo page. */
  readonly fullUrl: string;
}