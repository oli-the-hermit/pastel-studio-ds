import React from 'react';
import { cx } from '@pastel-studio/react';
import { covers } from '../fixtures/covers';

/** A still "video" with the see-through control dock over it, for examples of `surface="overlay"`. */
export function OnVideo({ wide, children }: { wide?: boolean; children: React.ReactNode }) {
  return (
    <span className={cx('docs-on-video', wide && 'is-wide')}>
      <img src={covers.tidal} alt="" />
      <span className="docs-on-video-dock">{children}</span>
    </span>
  );
}
