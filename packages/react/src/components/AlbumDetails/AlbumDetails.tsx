import React, { forwardRef, useId, useState } from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { formatDuration } from '../../lib/format';
import type { Album } from '../../lib/types';
import { PanelHeader } from '../Card';
import { TextButton } from '../TextButton';

type AlbumDetailsWords = 'aboutAlbum' | 'released' | 'recordLabel' | 'tracks' | 'length' | 'showMore' | 'showLess';

export interface AlbumDetailsProps extends React.HTMLAttributes<HTMLElement> {
  album: Album;
  labels?: LabelOverrides<AlbumDetailsWords>;
}

/** About an album: its description (folded after four lines), its facts and the copyright line. Shows only what is known. */
export const AlbumDetails = forwardRef<HTMLElement, AlbumDetailsProps>(({ album, labels: ownLabels, className, ...rest }, ref) => {
  const labels = useLabels(ownLabels);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const total = album.tracks.reduce((sum, t) => sum + t.duration, 0);
  const facts = [
    album.releaseDate && [labels.released, new Date(album.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })],
    album.label && [labels.recordLabel, album.label],
    [labels.tracks, String(album.tracks.length)],
    [labels.length, formatDuration(total)],
  ].filter(Boolean) as [string, string][];
  return (
    <section ref={ref} className={cx('ps-album-details', className)} aria-labelledby={titleId} {...rest}>
      <PanelHeader title={labels.aboutAlbum} titleId={titleId} />
      {album.description && (
        <div className="ps-album-details-about">
          <p className={cx('ps-album-details-text', open && 'is-open')}>{album.description}</p>
          <TextButton aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? labels.showLess : labels.showMore}
          </TextButton>
        </div>
      )}
      <dl className="ps-album-details-facts">
        {facts.map(([name, value]) => (
          <div key={name} className="ps-album-details-fact">
            <dt>{name}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {album.copyright && <p className="ps-album-details-copyright">{album.copyright}</p>}
    </section>
  );
});
AlbumDetails.displayName = 'AlbumDetails';
