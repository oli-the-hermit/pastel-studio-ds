import React, { forwardRef } from 'react';
import { IconLyrics, IconMiniPlayer, IconQueue, IconSliders } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { formatTime } from '../../lib/format';
import type { MediaController } from '../../lib/media';
import type { Track } from '../../lib/types';
import { Chip } from '../Chip';
import { CoverArt } from '../CoverArt';
import { LikeButton } from '../LikeButton';
import { MediaTime } from '../MediaTime';
import { Menu, type MenuItem } from '../Menu';
import { PlayerControl } from '../PlayerControl';
import { Slider } from '../Slider';
import { TrackInfo } from '../TrackInfo';
import { TransportControls, type RepeatMode } from '../TransportControls';
import { VolumeControl } from '../VolumeControl';

type MusicPlayerWords = 'nowPlaying' | 'queue' | 'lyrics' | 'soundSettings' | 'moreActions' | 'miniPlayer' | 'seek' | 'timeOf';

/** The trigger look of a menu that sits among the player's ghost controls. */
const ghostTrigger = 'ps-player-control ps-player-control--ghost ps-player-control--sm';

export interface MusicPlayerProps extends React.HTMLAttributes<HTMLElement> {
  media: MediaController;
  track: Track;
  /** Where the music comes from: "Album · Midnight Static". */
  source?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  shuffle?: boolean;
  onShuffleChange?: (on: boolean) => void;
  repeat?: RepeatMode;
  onRepeatChange?: (mode: RepeatMode) => void;
  liked?: boolean;
  /** Shows the heart beside the title. */
  onLikedChange?: (liked: boolean) => void;
  onArtistClick?: () => void;
  onAlbumClick?: () => void;
  /** Sound options in a menu: equalizer, crossfade, sleep timer, output, speed. */
  soundSettings?: MenuItem[];
  /** Track actions in a ⋮ menu: add to a playlist, go to the album, share. */
  actions?: MenuItem[];
  queueOpen?: boolean;
  /** Shows the queue toggle. */
  onQueueToggle?: () => void;
  lyricsOpen?: boolean;
  /** Shows the lyrics toggle. */
  onLyricsToggle?: () => void;
  /** Shows the mini player button. */
  onMiniPlayer?: () => void;
  /** `auto` (default) follows the card's width: a column when narrow, the art beside the controls when wide. */
  layout?: 'auto' | 'stack' | 'row';
  labels?: LabelOverrides<MusicPlayerWords>;
}

/**
 * A music player card, Focus Space's timer player turned to sound: art, track, seek, transport and a
 * foot row of sound tools, from CoverArt, TrackInfo, Slider, MediaTime, TransportControls, VolumeControl,
 * LikeButton and Menu.
 */
export const MusicPlayer = forwardRef<HTMLElement, MusicPlayerProps>(
  (
    {
      media,
      track,
      source,
      onPrevious,
      onNext,
      hasPrevious,
      hasNext,
      shuffle,
      onShuffleChange,
      repeat,
      onRepeatChange,
      liked = false,
      onLikedChange,
      onArtistClick,
      onAlbumClick,
      soundSettings,
      actions,
      queueOpen,
      onQueueToggle,
      lyricsOpen,
      onLyricsToggle,
      onMiniPlayer,
      layout = 'auto',
      labels: ownLabels,
      className,
      ...rest
    },
    ref
  ) => {
    const labels = useLabels(ownLabels);
    const timeOf = (v: number) => labels.timeOf.replace('{current}', formatTime(v)).replace('{total}', formatTime(media.duration));
    return (
      <section
        ref={ref}
        className={cx('ps-music-player', layout !== 'auto' && `ps-music-player--${layout}`, media.playing && 'is-playing', className)}
        aria-label={labels.nowPlaying}
        {...rest}
      >
        <div className="ps-music-player-inner">
          <div className="ps-music-player-head">
            <span className="ps-overline">{labels.nowPlaying}</span>
            {source && <Chip tone="accent" className="ps-music-player-source">{source}</Chip>}
          </div>

          <CoverArt className="ps-music-player-art" src={track.cover} alt={track.album ?? ''} />

          <div className="ps-music-player-track">
            <TrackInfo
              title={track.title}
              artist={track.artist}
              album={track.album}
              explicit={track.explicit}
              onArtistClick={onArtistClick}
              onAlbumClick={onAlbumClick}
              size="lg"
              headingLevel={2}
              className="ps-music-player-info"
            />
            {onLikedChange && <LikeButton liked={liked} onLikedChange={onLikedChange} />}
          </div>

          <div className="ps-music-player-seek">
            <Slider label={labels.seek} value={media.currentTime} max={media.duration || 1} buffered={media.buffered} valueText={timeOf} preview={formatTime} onChange={media.seek} />
            <div className="ps-music-player-times">
              <MediaTime current={media.currentTime} duration={media.duration} mode="elapsed" size="sm" />
              <MediaTime current={media.currentTime} duration={media.duration} defaultMode="remaining" toggleable size="sm" />
            </div>
          </div>

          <TransportControls
            className="ps-music-player-transport"
            playing={media.playing}
            onPlayPause={media.toggle}
            onPrevious={onPrevious}
            onNext={onNext}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            shuffle={shuffle}
            onShuffleChange={onShuffleChange}
            repeat={repeat}
            onRepeatChange={onRepeatChange}
            variant="secondary"
            layout="spread"
          />

          <div className="ps-music-player-foot">
            <VolumeControl volume={media.volume} muted={media.muted} onVolumeChange={media.setVolume} onMuteToggle={media.toggleMute} />
            <span className="ps-music-player-spacer" />
            {onLyricsToggle && (
              <PlayerControl variant="ghost" size="sm" label={labels.lyrics} pressed={lyricsOpen} onClick={onLyricsToggle}>
                <IconLyrics size={17} />
              </PlayerControl>
            )}
            {onQueueToggle && (
              <PlayerControl variant="ghost" size="sm" label={labels.queue} pressed={queueOpen} onClick={onQueueToggle}>
                <IconQueue size={18} />
              </PlayerControl>
            )}
            {onMiniPlayer && (
              <PlayerControl variant="ghost" size="sm" label={labels.miniPlayer} onClick={onMiniPlayer}>
                <IconMiniPlayer size={17} />
              </PlayerControl>
            )}
            {soundSettings && soundSettings.length > 0 && (
              <Menu ariaLabel={labels.soundSettings} items={soundSettings} trigger={<IconSliders size={17} />} triggerClassName={ghostTrigger} />
            )}
            {actions && actions.length > 0 && <Menu ariaLabel={labels.moreActions} items={actions} triggerSize="sm" />}
          </div>
        </div>
      </section>
    );
  }
);
MusicPlayer.displayName = 'MusicPlayer';
