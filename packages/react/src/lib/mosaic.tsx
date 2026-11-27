// A title's picture made of several: a playlist shown by the covers of its first albums, a folder
// by its first films. Shared by TitleTile and CoverArt, so both choose and fall back the same way.
import React, { useCallback, useState } from 'react';

/** A mosaic is two rows of two. */
const CELLS = 4;
const NONE: ReadonlySet<string> = new Set();

export interface Pictures {
  /** What to draw: four addresses for a mosaic, one for a single picture, none for the placeholder. */
  pictures: string[];
  /** Give it the address of a picture that failed to load: it is left out from then on. */
  onError: (address: string) => void;
}

/**
 * The pictures to draw. `image` alone when it is given. Otherwise the first four distinct
 * `images` as a mosaic, or the first one alone when fewer than four are left. An address that
 * failed to load no longer counts, so a mosaic that loses a cell falls back to four others or to
 * one picture, and never shows a hole.
 */
export function usePictures(image: string | undefined, images: readonly string[] | undefined): Pictures {
  const [failed, setFailed] = useState(NONE);
  const onError = useCallback((address: string) => {
    setFailed((now) => (now.has(address) ? now : new Set(now).add(address)));
  }, []);
  const left = [...new Set(image ? [image] : images)].filter((address) => address && !failed.has(address));
  return { pictures: left.slice(0, left.length >= CELLS ? CELLS : 1), onError };
}

export interface MosaicProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onError'> {
  /** The four addresses, from `usePictures`. */
  pictures: readonly string[];
  onError: (address: string) => void;
  /** Loads the pictures only when they come near the screen. */
  lazy?: boolean;
}

/** Four pictures as two rows of two. Decorative: name it on the element itself when it stands alone. */
export function Mosaic({ pictures, onError, lazy = false, ...rest }: MosaicProps) {
  return (
    <span {...rest}>
      {pictures.map((address) => (
        <img
          key={address}
          src={address}
          alt=""
          loading={lazy ? 'lazy' : undefined}
          decoding={lazy ? 'async' : undefined}
          draggable={false}
          onError={() => onError(address)}
        />
      ))}
    </span>
  );
}
