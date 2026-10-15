import React, { forwardRef } from 'react';
import { IconExpand, IconLyrics, IconMiniPlayer, IconQueue, IconSliders } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { formatTime } from '../../lib/format';
import type { MediaController } from '../../lib/media';
import type { Track } from '../../lib/types';
import { CoverArt } from '../CoverArt';
import { LikeButton } from '../LikeButton';
import { MediaTime } from '../MediaTime';
import { Menu, type MenuItem } from '../Menu';
import { PlayerControl } from '../PlayerControl';
import { Slider } from '../Slider';
import { TrackInfo } from '../TrackInfo';
import { TransportControls, type RepeatMode } from '../TransportControls';
import { VolumeControl } from '../VolumeControl';

type NowPlayingWords = 'player' | 'nothingPlaying' | 'queue' | 'lyrics' | 'soundSettings' | 'miniPlayer' | 'fullScreenPlayer' | 'seek' | 'timeOf';

const ghostTrigger = 'ps-player-control ps-player-control--ghost ps-player-control--sm ps-now-playing-bar-optional';

export interface NowPlayingBarProps extends React.HTMLAttributes<HTMLElement> {
  media: MediaController;
  /** Leave it out when nothing is loaded. */
  track?: Track;
  liked?: boolean;
  onLikedChange?: (liked: boolean) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  shuffle?: boolean;
  onShuffleChange?: (on: boolean) => void;
  repeat?: RepeatMode;
  onRepeatChange?: (mode: RepeatMode) => void;
  onArtistClick?: () => void;
  queueOpen?: boolean;
  onQueueToggle?: () => void;
  lyricsOpen?: boolean;
  onLyricsToggle?: () => void;
  soundSettings?: MenuItem[];
  onMiniPlayer?: () => void;
  /** Opens the full screen now-playing view. */
  onExpand?: () => void;
  labels?: LabelOverrides<NowPlayingWords>;
}

/**
 * The player bar along a music app: the track and its heart on the left, the transport over the seek
 * in the middle, tools on the right. It folds by its own width: first the side tools go, then the
 * seek becomes a thin line across the top.
 */
export const NowPlayingBar = forwardRef<HTMLElement, NowPlayingBarProps>(
  (
    {
      media,
      track,
      liked = false,
      onLikedChange,
      onPrevious,
      onNext,
      hasPrevious,
      hasNext,
      shuffle,
      onShuffleChange,
      repeat,
      onRepeatChange,
      onArtistClick,
      queueOpen,
      onQueueToggle,
      lyricsOpen,
      onLyricsToggle,
      soundSettings,
      onMiniPlayer,
      onExpand,
      labels: ownLabels,
      className,
      ...rest
    },
    ref
  ) => {
    const labels = useLabels(ownLabels);
    const pct = media.duration ? (media.currentTime / media.duration) * 100 : 0;
    const timeOf = (v: number) => labels.timeOf.replace('{current}', formatTime(v)).replace('{total}', formatTime(media.duration));
    return (
      <section ref={ref} className={cx('ps-now-playing-bar', className)} aria-label={labels.player} {...rest}>
        <div className="ps-now-playing-bar-inner">
          <div className="ps-now-playing-bar-hairline" aria-hidden="true"><div style={{ width: `${pct}%` }} /></div>
          <div className="ps-now-playing-bar-track">
            <CoverArt size="sm" src={track?.cover} />
            {track ? (
              <TrackInfo title={track.title} artist={track.artist} explicit={track.explicit} onArtistClick={onArtistClick} className="ps-now-playing-bar-info" />
            ) : (
              <span className="ps-now-playing-bar-empty">{labels.nothingPlaying}</span>
            )}
            {track && onLikedChange && <LikeButton liked={liked} onLikedChange={onLikedChange} className="ps-now-playing-bar-like" />}
          </div>

          <div className="ps-now-playing-bar-center">
            <TransportControls
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
              size="sm"
            />
            <div className="ps-now-playing-bar-seek">
              <MediaTime current={media.currentTime} duration={media.duration} mode="elapsed" size="sm" />
              <Slider label={labels.seek} value={media.currentTime} max={media.duration || 1} buffered={media.buffered} size="sm" knob="hover" valueText={timeOf} preview={formatTime} onChange={media.seek} />
              <MediaTime current={media.currentTime} duration={media.duration} defaultMode="total" toggleable size="sm" />
            </div>
          </div>

          <div className="ps-now-playing-bar-tools">
            {onLyricsToggle && (
              <PlayerControl variant="ghost" size="sm" label={labels.lyrics} pressed={lyricsOpen} onClick={onLyricsToggle} className="ps-now-playing-bar-optional">
                <IconLyrics size={16} />
              </PlayerControl>
            )}
            {onQueueToggle && (
              <PlayerControl variant="ghost" size="sm" label={labels.queue} pressed={queueOpen} onClick={onQueueToggle}>
                <IconQueue size={17} />
              </PlayerControl>
            )}
            {soundSettings && soundSettings.length > 0 && (
              <Menu ariaLabel={labels.soundSettings} items={soundSettings} trigger={<IconSliders size={16} />} triggerClassName={ghostTrigger} />
            )}
            <VolumeControl volume={media.volume} muted={media.muted} onVolumeChange={media.setVolume} onMuteToggle={media.toggleMute} layout="inline" className="ps-now-playing-bar-volume" />
            {onMiniPlayer && (
              <PlayerControl variant="ghost" size="sm" label={labels.miniPlayer} onClick={onMiniPlayer} className="ps-now-playing-bar-optional">
                <IconMiniPlayer size={16} />
              </PlayerControl>
            )}
            {onExpand && (
              <PlayerControl variant="ghost" size="sm" label={labels.fullScreenPlayer} onClick={onExpand} className="ps-now-playing-bar-optional">
                <IconExpand size={15} />
              </PlayerControl>
            )}
          </div>
        </div>
      </section>
    );
  }
);
NowPlayingBar.displayName = 'NowPlayingBar';
