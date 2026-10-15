import React, { forwardRef } from 'react';
import { IconExplicit } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';

export interface TrackInfoProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string;
  artist?: string;
  album?: string;
  year?: number;
  /** Marks a track with explicit lyrics. */
  explicit?: boolean;
  /** Makes the artist a link-like button. */
  onArtistClick?: () => void;
  onAlbumClick?: () => void;
  align?: 'start' | 'center';
  /** `lg` a player card (the title wraps to two lines), `md` a bar, `sm` a row. */
  size?: 'lg' | 'md' | 'sm';
  /** Makes the title a heading of this level (in a player); a plain span otherwise. */
  headingLevel?: 2 | 3;
  labels?: LabelOverrides<'explicit'>;
}

/** A song's title over "Artist · Album · Year"; long names end with an ellipsis. */
export const TrackInfo = forwardRef<HTMLDivElement, TrackInfoProps>(
  ({ title, artist, album, year, explicit, onArtistClick, onAlbumClick, align = 'start', size = 'md', headingLevel, labels: ownLabels, className, ...rest }, ref) => {
    const labels = useLabels(ownLabels);
    const Title = headingLevel ? (`h${headingLevel}` as const) : 'span';
    const part = (text: string | undefined, onClick?: () => void, cls?: string) =>
      text &&
      (onClick ? (
        <button type="button" className={cx('ps-track-info-link', cls)} onClick={onClick}>{text}</button>
      ) : (
        <span className={cls}>{text}</span>
      ));
    const meta = [part(artist, onArtistClick, 'ps-track-info-artist'), part(album, onAlbumClick), year ? <span>{year}</span> : null].filter(Boolean);
    return (
      <div ref={ref} className={cx('ps-track-info', size !== 'md' && `ps-track-info--${size}`, align === 'center' && 'ps-track-info--center', className)} {...rest}>
        <Title className="ps-track-info-title" title={title}>
          {title}
          {explicit && <IconExplicit size={14} className="ps-track-info-explicit" role="img" aria-label={labels.explicit} aria-hidden={false} />}
        </Title>
        {meta.length > 0 && (
          <p className="ps-track-info-meta">
            {meta.map((m, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="ps-track-info-dot" aria-hidden="true">·</span>}
                {m}
              </React.Fragment>
            ))}
          </p>
        )}
      </div>
    );
  }
);
TrackInfo.displayName = 'TrackInfo';
