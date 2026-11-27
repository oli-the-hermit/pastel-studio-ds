import React from 'react';
import { IconCheck, IconWarning } from '../../icons';
import { Mosaic, usePictures } from '../../lib/mosaic';

export interface TitlePictureProps {
  image?: string;
  images?: readonly string[];
  icon?: React.ReactNode;
  progress?: number;
  watched?: boolean;
  /** The word for the watched check, which is an image with a name. */
  watchedLabel: string;
  /** An id for the watched check, for a caller that names itself with `aria-labelledby`. */
  watchedId?: string;
  /** Shows the warning mark. The caller says why in its text, so the mark is decorative. */
  unavailable?: boolean;
}

/**
 * The picture of a TitleTile, with what lies over it: the progress bar, the watched check and
 * the warning mark. EpisodeCard draws the same picture, so both look and fall back alike.
 * Its shape comes from --ps-title-tile-ratio and --ps-title-tile-radius on the element around it.
 */
export function TitlePicture({ image, images, icon, progress, watched = false, watchedLabel, watchedId, unavailable = false }: TitlePictureProps) {
  const { pictures, onError } = usePictures(image, images);
  const played = progress === undefined || Number.isNaN(progress) ? 0 : Math.min(1, Math.max(0, progress));
  return (
    <span className="ps-title-tile-picture">
      {pictures.length > 1 ? (
        <Mosaic className="ps-title-tile-mosaic" pictures={pictures} onError={onError} lazy />
      ) : pictures.length ? (
        <img src={pictures[0]} alt="" loading="lazy" decoding="async" draggable={false} onError={() => onError(pictures[0])} />
      ) : (
        <span className="ps-title-tile-icon">{icon}</span>
      )}
      {played > 0 && (
        <span className="ps-title-tile-progress" aria-hidden="true">
          <span className="ps-title-tile-progress-fill" style={{ width: `${played * 100}%` }} />
        </span>
      )}
      {unavailable && (
        <span className="ps-title-tile-warning" aria-hidden="true">
          <IconWarning size={12} />
        </span>
      )}
      {watched && (
        <span className="ps-title-tile-watched" id={watchedId} role="img" aria-label={watchedLabel}>
          <IconCheck size={12} />
        </span>
      )}
    </span>
  );
}
