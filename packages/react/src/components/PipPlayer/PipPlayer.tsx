import React, { forwardRef } from 'react';
import { IconCaptions, IconClose, IconRestore, IconSettings } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { formatTime } from '../../lib/format';
import type { MediaController } from '../../lib/media';
import { useIdle } from '../../lib/useIdle';
import { IconButton } from '../IconButton';
import type { Chapter, ToggleAction } from '../MediaControls';
import { MediaTime } from '../MediaTime';
import { Menu, type MenuItem } from '../Menu';
import { PlayerControl } from '../PlayerControl';
import { Slider } from '../Slider';
import { TransportControls } from '../TransportControls';
import { VideoSurface } from '../VideoSurface';
import { VolumeControl } from '../VolumeControl';

type PipWords = 'video' | 'backToPlayer' | 'close' | 'settings' | 'subtitles' | 'seek' | 'timeOf' | 'mute' | 'unmute' | 'playback' | 'play' | 'pause' | 'previous' | 'next' | 'skipBack' | 'skipForward';

export interface PipPlayerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  media: MediaController;
  /** The picture: a video or a canvas. */
  children: React.ReactNode;
  title?: string;
  chapters?: Chapter[];
  captions?: ToggleAction & { text?: string };
  settings?: MenuItem[];
  onNext?: () => void;
  onPrevious?: () => void;
  /** Back to the full player (the tab or the main window). */
  onExpand?: () => void;
  onClose?: () => void;
  /**
   * Attributes for the window's drag regions (the free space of the chrome), e.g.
   * `{ 'data-tauri-drag-region': '' }` in a Tauri window. The library adds none of its own.
   */
  dragHandleProps?: React.HTMLAttributes<HTMLElement> & Record<`data-${string}`, string>;
  labels?: LabelOverrides<PipWords>;
}

/**
 * A borderless video for a picture-in-picture window or a floating tile. It fills its box and reads
 * its own size, showing as much as fits: tiny, play and close; small, the skips, the seek bar and
 * back to the player; medium, the times, volume, captions, settings and the title. The chrome shows
 * on hover, focus and pause; while playing untouched, only a thin progress line stays.
 */
export const PipPlayer = forwardRef<HTMLDivElement, PipPlayerProps>(
  ({ media, children, title, chapters, captions, settings, onNext, onPrevious, onExpand, onClose, dragHandleProps, labels: ownLabels, className, ...rest }, ref) => {
    const labels = useLabels(ownLabels);
    const [idle, wake] = useIdle(media.playing, 2200);
    const pct = media.duration ? (media.currentTime / media.duration) * 100 : 0;
    const timeOf = (v: number) => labels.timeOf.replace('{current}', formatTime(v)).replace('{total}', formatTime(media.duration));
    const gearLook = 'ps-player-control ps-player-control--ghost ps-player-control--sm is-on-overlay';
    return (
      <div
        ref={ref}
        className={cx('ps-pip-player', idle && 'is-idle', !media.playing && 'is-paused', className)}
        tabIndex={0}
        aria-label={title ?? labels.video}
        onPointerMove={wake}
        onFocus={wake}
        onKeyDown={(e) => {
          wake();
          if (e.key === ' ' && e.target === e.currentTarget) {
            e.preventDefault();
            media.toggle();
          }
        }}
        {...rest}
      >
        <VideoSurface playing={media.playing} waiting={media.waiting} caption={captions?.active ? captions.text : undefined} showCenterPlay={false} className="ps-pip-player-surface">
          {children}
        </VideoSurface>

        <div className="ps-pip-player-chrome" {...dragHandleProps}>
          <div className="ps-pip-player-top" {...dragHandleProps}>
            {title && <span className="ps-pip-player-title" {...dragHandleProps}>{title}</span>}
            <span className="ps-pip-player-spacer" {...dragHandleProps} />
            {onExpand && (
              <IconButton label={labels.backToPlayer} size="xs" surface="overlay" className="ps-pip-player-expand" onClick={onExpand}>
                <IconRestore size={15} />
              </IconButton>
            )}
            {onClose && (
              <IconButton label={labels.close} size="xs" surface="overlay" onClick={onClose}>
                <IconClose size={16} />
              </IconButton>
            )}
          </div>

          <div className="ps-pip-player-center">
            <TransportControls
              playing={media.playing}
              onPlayPause={media.toggle}
              onSkipBack={() => media.skip(-10)}
              onSkipForward={() => media.skip(10)}
              onPrevious={onPrevious}
              onNext={onNext}
              size="sm"
              surface="overlay"
              labels={ownLabels}
            />
          </div>

          <div className="ps-pip-player-bottom">
            <MediaTime className="ps-pip-player-time" current={media.currentTime} duration={media.duration} mode="elapsed" size="sm" surface="overlay" />
            <Slider
              className="ps-pip-player-seek"
              label={labels.seek}
              value={media.currentTime}
              max={media.duration || 1}
              buffered={media.buffered}
              marks={chapters?.map((c) => ({ value: c.start }))}
              size="sm"
              knob="hover"
              surface="overlay"
              valueText={timeOf}
              preview={formatTime}
              onChange={media.seek}
            />
            <MediaTime className="ps-pip-player-time" current={media.currentTime} duration={media.duration} defaultMode="remaining" size="sm" surface="overlay" />
            <div className="ps-pip-player-tools">
              <VolumeControl volume={media.volume} muted={media.muted} onVolumeChange={media.setVolume} onMuteToggle={media.toggleMute} layout="button" surface="overlay" labels={ownLabels} />
              {captions && (
                <PlayerControl variant="ghost" size="sm" surface="overlay" label={labels.subtitles} pressed={captions.active} onClick={captions.onToggle}>
                  <IconCaptions size={16} />
                </PlayerControl>
              )}
              {settings && settings.length > 0 && (
                <Menu ariaLabel={labels.settings} items={settings} trigger={<IconSettings size={16} />} triggerClassName={gearLook} surface="overlay" />
              )}
            </div>
          </div>
        </div>

        <div className="ps-pip-player-hairline" aria-hidden="true">
          <div style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }
);
PipPlayer.displayName = 'PipPlayer';
