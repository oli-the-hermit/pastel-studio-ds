import React, { forwardRef } from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { TitlePicture } from './TitlePicture';

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
  /**
   * Several pictures for a title made of others (a playlist's album covers), used when `image` is
   * not given: four or more distinct ones make a mosaic of the first four, two rows of two; fewer
   * show the first alone. One that fails to load is left out.
   */
  images?: string[];
  /** Shown in place of a picture: the kind of title, e.g. `<IconMusic />`. */
  icon?: React.ReactNode;
  /** How far it has been played, 0 to 1: a thin bar along the picture's lower edge. Not shown when undefined or 0. */
  progress?: number;
  /** A check at the picture's top right: played to the end. */
  watched?: boolean;
  /** The title that is playing: an accent ring and name, and `aria-current`. */
  current?: boolean;
  /**
   * Why the title can't be played, in a few words: "Can't find this file". The picture is dimmed
   * under a warning mark and the reason takes the subtitle's place. The tile stays a button, so
   * a click can open the way to fix it.
   */
  unavailable?: string;
  labels?: LabelOverrides<'watched'>;
}

/**
 * A title of a music or video library as a button: its picture, its name and a quieter line under
 * it. On its own it is as wide as its shape's narrowest (`--ps-title-tile-min`); in a TitleGrid
 * it fills its cell. Defaults to `type="button"`.
 */
export const TitleTile = forwardRef<HTMLButtonElement, TitleTileProps>(
  ({ title, subtitle, shape = 'cover', image, images, icon, progress, watched = false, current = false, unavailable, labels: ownLabels, className, type = 'button', ...rest }, ref) => {
    const labels = useLabels(ownLabels);
    const second = unavailable || subtitle;
    return (
      <button
        ref={ref}
        type={type}
        className={cx('ps-title-tile', shape !== 'cover' && `ps-title-tile--${shape}`, current && 'is-current', unavailable && 'is-unavailable', className)}
        aria-current={current ? 'true' : undefined}
        {...rest}
      >
        <TitlePicture image={image} images={images} icon={icon} progress={progress} watched={watched} watchedLabel={labels.watched} unavailable={!!unavailable} />
        {/* The spaces keep the words apart in the button's name; a flex container draws none of them. */}
        {' '}
        <span className="ps-title-tile-title">{title}</span>
        {second && <>{' '}<span className="ps-title-tile-subtitle">{second}</span></>}
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
