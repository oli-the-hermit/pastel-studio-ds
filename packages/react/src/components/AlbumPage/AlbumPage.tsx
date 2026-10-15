import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';
import type { Track } from '../../lib/types';
import { AlbumDetails } from '../AlbumDetails';
import { AlbumHeader, type AlbumHeaderProps } from '../AlbumHeader';
import { TrackList, type TrackListProps } from '../TrackList';

export interface AlbumPageProps extends AlbumHeaderProps {
  /** The track loaded in the player. */
  currentId?: string;
  /** The player is playing: the current row's bars move. */
  isPlaying?: boolean;
  onPlayTrack: (track: Track) => void;
  onPause?: () => void;
  likedIds?: ReadonlySet<string>;
  onTrackLikedChange?: (track: Track, liked: boolean) => void;
  rowActions?: TrackListProps['rowActions'];
  /** A playlist: covers, albums and dates in the rows, and an `onReorder` to drag them. */
  playlist?: { onReorder?: (sourceId: string, targetId: string) => void };
}

/** An album or playlist page on one card: the header, the track list and the details. */
export const AlbumPage = forwardRef<HTMLDivElement, AlbumPageProps>(
  ({ album, currentId, isPlaying, onPlayTrack, onPause, likedIds, onTrackLikedChange, rowActions, playlist, className, ...header }, ref) => (
    <div ref={ref} className={cx('ps-album-page', className)}>
      <AlbumHeader album={album} {...header} />
      <TrackList
        ariaLabel={album.title}
        tracks={album.tracks}
        currentId={currentId}
        playing={isPlaying}
        onPlay={onPlayTrack}
        onPause={onPause}
        likedIds={likedIds}
        onLikedChange={onTrackLikedChange}
        rowActions={rowActions}
        columns={playlist ? { cover: true, album: true, added: true } : undefined}
        onReorder={playlist?.onReorder}
      />
      {(album.description || album.label || album.releaseDate) && <AlbumDetails album={album} />}
    </div>
  )
);
AlbumPage.displayName = 'AlbumPage';
