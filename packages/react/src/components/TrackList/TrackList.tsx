import React, { forwardRef } from 'react';
import { IconClock, IconGrip, IconPause, IconPlay } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { formatTime } from '../../lib/format';
import type { Track } from '../../lib/types';
import { CoverArt } from '../CoverArt';
import { Equalizer } from '../Equalizer';
import { LikeButton } from '../LikeButton';
import { Menu, type MenuItem } from '../Menu';
import { PlayerControl } from '../PlayerControl';
import { useSortable } from '../SortableList';
import { TrackInfo } from '../TrackInfo';

type TrackListWords = 'trackNumber' | 'trackTitle' | 'album' | 'dateAdded' | 'duration' | 'playTrack' | 'pauseTrack' | 'trackActions' | 'dragToReorder' | 'like' | 'unlike';

export interface TrackListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onPlay' | 'onPause'> {
  tracks: Track[];
  /** The track loaded in the player: marked in the accent, with the "now playing" bars. */
  currentId?: string;
  playing?: boolean;
  /** Plays a track: a double click, Enter, or the play button on its number. */
  onPlay: (track: Track) => void;
  onPause?: () => void;
  likedIds?: ReadonlySet<string>;
  /** Shows a heart on each row. */
  onLikedChange?: (track: Track, liked: boolean) => void;
  /** The ⋮ menu of a row. */
  rowActions?: (track: Track) => MenuItem[];
  /** Columns beyond number, title and duration. `cover` shows each track's art (a playlist). */
  columns?: { cover?: boolean; album?: boolean; added?: boolean };
  /** Makes the rows reorderable (a playlist): move `sourceId` to where `targetId` is. */
  onReorder?: (sourceId: string, targetId: string) => void;
  /** Shows the row of column names. */
  header?: boolean;
  /** The list's accessible name, e.g. the album's title. */
  ariaLabel?: string;
  labels?: LabelOverrides<TrackListWords>;
}

/**
 * A list of tracks: the number (a play button on hover, the bars while playing), title and artist,
 * an optional cover, album and date, a heart, the length and a ⋮ menu. Columns fold away as it narrows.
 */
export const TrackList = forwardRef<HTMLDivElement, TrackListProps>(
  (
    {
      tracks,
      currentId,
      playing = false,
      onPlay,
      onPause,
      likedIds,
      onLikedChange,
      rowActions,
      columns = {},
      onReorder,
      header = true,
      ariaLabel,
      labels: ownLabels,
      className,
      ...rest
    },
    ref
  ) => {
    const labels = useLabels(ownLabels);
    const sortable = useSortable({ ids: tracks.map((t) => t.id), onReorder: onReorder ?? (() => {}) });
    const named = (word: string, t: Track) => word.replace('{title}', t.title);
    return (
      <div
        ref={ref}
        className={cx(
          'ps-track-list',
          columns.album && 'ps-track-list--album',
          columns.added && 'ps-track-list--added',
          onReorder && 'ps-track-list--reorderable',
          className
        )}
        {...rest}
      >
        {header && (
          <div className="ps-track-list-head" aria-hidden="true">
            <span className="ps-track-list-num">{labels.trackNumber}</span>
            <span className="ps-track-list-title">{labels.trackTitle}</span>
            {columns.album && <span className="ps-track-list-album">{labels.album}</span>}
            {columns.added && <span className="ps-track-list-added">{labels.dateAdded}</span>}
            <span className="ps-track-list-like" />
            <span className="ps-track-list-duration" title={labels.duration}><IconClock size={15} /></span>
            <span className="ps-track-list-more" />
          </div>
        )}
        <ol className="ps-track-list-rows" aria-label={ariaLabel}>
          {tracks.map((t, i) => {
            const current = t.id === currentId;
            const isPlaying = current && playing;
            const liked = likedIds?.has(t.id) ?? false;
            const drag = onReorder ? sortable.itemProps(t.id) : undefined;
            return (
              <li
                key={t.id}
                className={cx(
                  'ps-track-list-row',
                  current && 'is-current',
                  sortable.isDragging(t.id) && 'is-dragging',
                  sortable.isDragOver(t.id) && 'is-drag-over'
                )}
                tabIndex={0}
                aria-current={current ? 'true' : undefined}
                aria-label={`${t.title}, ${t.artist}, ${formatTime(t.duration)}`}
                onDoubleClick={() => onPlay(t)}
                {...drag}
                onKeyDown={(e) => {
                  drag?.onKeyDown(e);
                  if (e.defaultPrevented) return;
                  if (e.key === 'Enter' && e.target === e.currentTarget) onPlay(t);
                }}
              >
                {drag && <IconGrip className="ps-track-list-grip" title={labels.dragToReorder} />}
                <span className="ps-track-list-num">
                  <span className="ps-track-list-num-text">{current ? <Equalizer playing={isPlaying} size={14} /> : t.number ?? i + 1}</span>
                  <PlayerControl
                    className="ps-track-list-num-play"
                    variant="ghost"
                    size="sm"
                    label={named(isPlaying ? labels.pauseTrack : labels.playTrack, t)}
                    tabIndex={-1}
                    onClick={() => (isPlaying ? onPause?.() : onPlay(t))}
                  >
                    {isPlaying ? <IconPause size={14} /> : <IconPlay size={14} />}
                  </PlayerControl>
                </span>
                <span className="ps-track-list-title">
                  {columns.cover && <CoverArt size="xs" src={t.cover} />}
                  <TrackInfo title={t.title} artist={t.artist} explicit={t.explicit} size="sm" />
                </span>
                {columns.album && <span className="ps-track-list-album">{t.album}</span>}
                {columns.added && <span className="ps-track-list-added">{t.addedAt ? new Date(t.addedAt).toLocaleDateString() : ''}</span>}
                <span className="ps-track-list-like">
                  {onLikedChange && (
                    <LikeButton liked={liked} onLikedChange={(v) => onLikedChange(t, v)} labels={{ like: labels.like, unlike: labels.unlike }} className={cx(liked && 'ps-track-list-liked')} />
                  )}
                </span>
                <span className="ps-track-list-duration">{formatTime(t.duration)}</span>
                <span className="ps-track-list-more">
                  {rowActions && <Menu ariaLabel={named(labels.trackActions, t)} items={rowActions(t)} triggerSize="xs" />}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
);
TrackList.displayName = 'TrackList';
