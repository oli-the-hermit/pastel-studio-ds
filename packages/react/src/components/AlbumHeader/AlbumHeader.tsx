import React, { forwardRef } from 'react';
import { IconDownload, IconPause, IconPlay, IconShare, IconShuffle } from '../../icons';
import { useLabels, type LabelOverrides, type Labels } from '../../labels';
import { cx } from '../../lib/cx';
import { formatDuration } from '../../lib/format';
import type { Album } from '../../lib/types';
import { CoverArt } from '../CoverArt';
import { LikeButton } from '../LikeButton';
import { Menu, type MenuItem } from '../Menu';
import { PlayerControl } from '../PlayerControl';

type AlbumHeaderWords = 'album' | 'ep' | 'single' | 'playlist' | 'compilation' | 'songOne' | 'songOther' | 'play' | 'pause' | 'shuffle' | 'saveToLibrary' | 'removeFromLibrary' | 'download' | 'share' | 'moreActions';

/** The word for an album's kind. */
const kindWord = (kind: Album['kind'], labels: Labels) =>
  ({ Album: labels.album, EP: labels.ep, Single: labels.single, Playlist: labels.playlist, Compilation: labels.compilation })[kind];

export interface AlbumHeaderProps extends React.HTMLAttributes<HTMLElement> {
  album: Album;
  /** This album is the one playing. */
  playing?: boolean;
  onPlayPause: () => void;
  shuffle?: boolean;
  onShuffleChange?: (on: boolean) => void;
  saved?: boolean;
  /** Shows the heart that saves it to the library. */
  onSavedChange?: (saved: boolean) => void;
  onArtistClick?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  /** The ⋮ menu: play next, add to queue, go to the artist, add to a playlist, copy the link. */
  actions?: MenuItem[];
  labels?: LabelOverrides<AlbumHeaderWords>;
}

/** The top of an album or playlist page: big art, the kind, the title, the artist and facts, then the actions. */
export const AlbumHeader = forwardRef<HTMLElement, AlbumHeaderProps>(
  ({ album, playing = false, onPlayPause, shuffle, onShuffleChange, saved = false, onSavedChange, onArtistClick, onDownload, onShare, actions, labels: ownLabels, className, ...rest }, ref) => {
    const labels = useLabels(ownLabels);
    const total = album.tracks.reduce((sum, t) => sum + t.duration, 0);
    const count = album.tracks.length;
    const songs = (count === 1 ? labels.songOne : labels.songOther).replace('{count}', String(count));
    return (
      <header ref={ref} className={cx('ps-album-header', className)} {...rest}>
        <CoverArt className="ps-album-header-art" src={album.cover} alt={album.title} size="lg" />
        <div className="ps-album-header-main">
          <span className="ps-album-header-kind">{kindWord(album.kind, labels)}</span>
          <h1 className="ps-album-header-title">{album.title}</h1>
          <p className="ps-album-header-meta">
            {onArtistClick ? (
              <button type="button" className="ps-album-header-artist" onClick={onArtistClick}>{album.artist}</button>
            ) : (
              <span className="ps-album-header-artist">{album.artist}</span>
            )}
            {album.year && <span>{album.year}</span>}
            <span>{songs}</span>
            <span>{formatDuration(total)}</span>
          </p>
          <div className="ps-album-header-actions">
            <PlayerControl variant="primary" label={playing ? labels.pause : labels.play} onClick={onPlayPause} className="ps-album-header-play">
              {playing ? <IconPause size={24} /> : <IconPlay size={24} />}
            </PlayerControl>
            {onShuffleChange && (
              <PlayerControl variant="ghost" size="sm" label={labels.shuffle} pressed={!!shuffle} onClick={() => onShuffleChange(!shuffle)}>
                <IconShuffle size={18} />
              </PlayerControl>
            )}
            {onSavedChange && <LikeButton liked={saved} onLikedChange={onSavedChange} labels={{ like: labels.saveToLibrary, unlike: labels.removeFromLibrary }} />}
            {onDownload && (
              <PlayerControl variant="ghost" size="sm" label={labels.download} onClick={onDownload}>
                <IconDownload size={18} />
              </PlayerControl>
            )}
            {onShare && (
              <PlayerControl variant="ghost" size="sm" label={labels.share} onClick={onShare}>
                <IconShare size={18} />
              </PlayerControl>
            )}
            {actions && actions.length > 0 && <Menu ariaLabel={labels.moreActions} items={actions} align="start" />}
          </div>
        </div>
      </header>
    );
  }
);
AlbumHeader.displayName = 'AlbumHeader';
