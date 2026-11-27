import React, { forwardRef, useState } from 'react';
import { IconCheck } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';

/** A title's picture: a square cover, a 2:3 poster, a 16:9 frame, or a circle with centred text. */
export type TitleTileShape = 'cover' | 'poster' | 'wide' | 'round';

export interface TitleTileProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  /** The title's name, under the picture: one line, cut off with an ellipsis. */
  title: string;
  /** A second, quieter line: the artist, the year, "Season 1 · Episode 3". */
  subtitle?: string;
  /** `cover` 1:1 (default) for albums, `poster` 2:3 for films and series, `wide` 16:9 for episodes and videos, `round` a circle with centred text for artists. */
  shape?: TitleTileShape;
  /** The picture's address; it fills the shape, cropped. Without one, or when it fails, `icon` sits on a quiet surface. */
  image?: string;
  /** Shown in place of a picture: the kind of title, e.g. `<IconMusic />`. */
  icon?: React.ReactNode;
  /** How far it has been played, 0 to 1: a thin bar along the picture's lower edge. Not shown when undefined or 0. */
  progress?: number;
  /** A check at the picture's top right: played to the end. */
  watched?: boolean;
  /** The title that is playing: an accent ring and name, and `aria-current`. */
  current?: boolean;
  labels?: LabelOverrides<'watched'>;
}

/**
 * A title of a music or video library as a button: its picture, its name and a quieter line under
 * it. On its own it is as wide as its shape's narrowest (`--ps-title-tile-min`); in a TitleGrid
 * it fills its cell. Defaults to `type="button"`.
 */
export const TitleTile = forwardRef<HTMLButtonElement, TitleTileProps>(
  ({ title, subtitle, shape = 'cover', image, icon, progress, watched = false, current = false, labels: ownLabels, className, type = 'button', ...rest }, ref) => {
    const labels = useLabels(ownLabels);
    const [failed, setFailed] = useState<string | null>(null);
    const showImage = image && failed !== image;
    const played = progress === undefined || Number.isNaN(progress) ? 0 : Math.min(1, Math.max(0, progress));
    return (
      <button
        ref={ref}
        type={type}
        className={cx('ps-title-tile', shape !== 'cover' && `ps-title-tile--${shape}`, current && 'is-current', className)}
        aria-current={current ? 'true' : undefined}
        {...rest}
      >
        <span className="ps-title-tile-picture">
          {showImage ? (
            <img src={image} alt="" loading="lazy" decoding="async" draggable={false} onError={() => setFailed(image)} />
          ) : (
            <span className="ps-title-tile-icon">{icon}</span>
          )}
          {played > 0 && (
            <span className="ps-title-tile-progress" aria-hidden="true">
              <span className="ps-title-tile-progress-fill" style={{ width: `${played * 100}%` }} />
            </span>
          )}
          {watched && (
            <span className="ps-title-tile-watched" role="img" aria-label={labels.watched}>
              <IconCheck size={12} />
            </span>
          )}
        </span>
        {/* The spaces keep the words apart in the button's name; a flex container draws none of them. */}
        {' '}
        <span className="ps-title-tile-title">{title}</span>
        {subtitle && <>{' '}<span className="ps-title-tile-subtitle">{subtitle}</span></>}
      </button>
    );
  }
);
TitleTile.displayName = 'TitleTile';

export interface TitleGridProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'role'> {
  /** The shape of its tiles, which sets the narrowest column: 160px, or 256px for `wide`. */
  shape?: TitleTileShape;
  /** The tiles. Each child becomes one list item; a fragment counts as one child. */
  children?: React.ReactNode;
}

/**
 * A grid of TitleTiles that fills its width with as many columns as fit. A list: each child is
 * wrapped in a list item. Name it with `aria-label` or `aria-labelledby`.
 */
export const TitleGrid = forwardRef<HTMLUListElement, TitleGridProps>(({ shape = 'cover', className, children, ...rest }, ref) => (
  <ul ref={ref} role="list" className={cx('ps-title-grid', shape === 'wide' && 'ps-title-grid--wide', className)} {...rest}>
    {React.Children.map(children, (child) =>
      child === null || child === undefined || typeof child === 'boolean' ? null : <li className="ps-title-grid-item">{child}</li>
    )}
  </ul>
));
TitleGrid.displayName = 'TitleGrid';
