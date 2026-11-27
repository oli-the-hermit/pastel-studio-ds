import React, { forwardRef } from 'react';
import { IconMusic } from '../../icons';
import { cx } from '../../lib/cx';
import { Mosaic, usePictures } from '../../lib/mosaic';

export interface CoverArtProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  /**
   * Several covers for art made of others (a playlist's albums), used when `src` is not given:
   * four or more distinct ones make a mosaic of the first four, two rows of two; fewer show the
   * first alone. One that fails to load is left out.
   */
  images?: string[];
  /** Describes the art ("Midnight Static cover"); leave it empty when the title is right beside it. */
  alt?: string;
  /** A size from the tokens, or `fluid` to fill the width (always square). */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'fluid';
  /** `round` for artists and a portrait mini player. */
  shape?: 'square' | 'round';
  /** A pulse while the image loads. */
  loading?: boolean;
  /** 0–100: a progress ring around the cover (a round mini player). */
  progress?: number;
  /** A small mark in the corner, e.g. the "now playing" bars; it fills a small cover. */
  badge?: React.ReactNode;
}

/** Album or track art, or a mosaic of four covers, with a placeholder when there is no image or it fails, a loading pulse and an optional ring. */
export const CoverArt = forwardRef<HTMLDivElement, CoverArtProps>(
  ({ src, images, alt = '', size = 'fluid', shape = 'square', loading = false, progress, badge, className, ...rest }, ref) => {
    const { pictures, onError } = usePictures(src, images);
    return (
      <div
        ref={ref}
        className={cx(
          'ps-cover-art',
          size !== 'fluid' && `ps-cover-art--${size}`,
          shape === 'round' && 'ps-cover-art--round',
          progress !== undefined && 'ps-cover-art--ringed',
          loading && 'is-loading',
          className
        )}
        {...rest}
      >
        <div className="ps-cover-art-frame">
          {pictures.length > 1 ? (
            <Mosaic className="ps-cover-art-mosaic" pictures={pictures} onError={onError} role={alt ? 'img' : undefined} aria-label={alt || undefined} />
          ) : pictures.length ? (
            <img src={pictures[0]} alt={alt} draggable={false} onError={() => onError(pictures[0])} />
          ) : (
            <span className="ps-cover-art-placeholder" role={alt ? 'img' : undefined} aria-label={alt || undefined}>
              <IconMusic />
            </span>
          )}
        </div>
        {progress !== undefined && (
          <svg className="ps-cover-art-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="48" pathLength="100" />
            <circle cx="50" cy="50" r="48" pathLength="100" className="ps-cover-art-ring-fill" style={{ strokeDashoffset: 100 - Math.min(100, Math.max(0, progress)) }} />
          </svg>
        )}
        {badge && <span className="ps-cover-art-badge">{badge}</span>}
      </div>
    );
  }
);
CoverArt.displayName = 'CoverArt';
