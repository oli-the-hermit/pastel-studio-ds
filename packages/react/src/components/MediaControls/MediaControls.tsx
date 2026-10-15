import React, { forwardRef } from 'react';
import { IconCaptions, IconFullscreen, IconFullscreenExit, IconPip, IconSettings, IconTheater } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { formatTime } from '../../lib/format';
import type { MediaController } from '../../lib/media';
import { MediaTime } from '../MediaTime';
import { Menu, type MenuItem } from '../Menu';
import { PlayerControl } from '../PlayerControl';
import { Slider } from '../Slider';
import { TransportControls, type RepeatMode } from '../TransportControls';
import { VolumeControl } from '../VolumeControl';

export interface Chapter {
  /** Seconds. */
  start: number;
  title: string;
}

export interface ToggleAction {
  active?: boolean;
  onToggle: () => void;
}

/** The chapter playing at time `t`. */
export const chapterAt = (chapters: Chapter[] | undefined, t: number) =>
  chapters?.reduce<Chapter | undefined>((hit, c) => (c.start <= t ? c : hit), undefined);

type MediaControlsWords =
  | 'seek' | 'timeOf' | 'settings' | 'subtitlesOn' | 'subtitlesOff' | 'fullScreen' | 'exitFullScreen' | 'pictureInPicture' | 'theaterMode'
  | 'playback' | 'play' | 'pause' | 'previous' | 'next' | 'skipBack' | 'skipForward' | 'shuffle' | 'repeatOff' | 'repeatAll' | 'repeatOne'
  | 'mute' | 'unmute' | 'volume' | 'showRemainingTime';

export interface MediaControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  media: MediaController;
  /**
   * `basic` a file player: play, volume, time, settings, full screen. `movie` adds 10-second skips,
   * next episode, chapters, captions, picture in picture and theater mode. `audio` a sound file:
   * times beside the seek bar and a centered transport with shuffle and repeat.
   */
  variant?: 'basic' | 'movie' | 'audio';
  /** `filled` under the picture, on a card; `overlay` a dock floating over it. */
  surface?: 'filled' | 'overlay';
  /** Movie: shown in the middle of the bar. */
  title?: string;
  chapters?: Chapter[];
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  shuffle?: boolean;
  onShuffleChange?: (on: boolean) => void;
  repeat?: RepeatMode;
  onRepeatChange?: (mode: RepeatMode) => void;
  captions?: ToggleAction;
  /** The gear menu's items: build them with `buildMediaSettings()`. */
  settings?: MenuItem[];
  fullscreen?: ToggleAction;
  pip?: ToggleAction;
  theater?: ToggleAction;
  /** Extra controls at the start or the end of the bar. */
  startSlot?: React.ReactNode;
  endSlot?: React.ReactNode;
  /** Seconds the movie skips move. */
  skipSeconds?: number;
  labels?: LabelOverrides<MediaControlsWords>;
}

/**
 * The media control bar: a seek row over a bar of three slots (start, center, end), for three uses
 * (`variant`) on two backgrounds (`surface`). As the bar narrows, the extras fold away first (theater,
 * the title), then the optional ones (skips, the time, captions, picture in picture).
 */
export const MediaControls = forwardRef<HTMLDivElement, MediaControlsProps>(
  (
    {
      media,
      variant = 'basic',
      surface = 'filled',
      title,
      chapters,
      onPrevious,
      onNext,
      hasPrevious,
      hasNext,
      shuffle,
      onShuffleChange,
      repeat,
      onRepeatChange,
      captions,
      settings,
      fullscreen,
      pip,
      theater,
      startSlot,
      endSlot,
      skipSeconds = 10,
      labels: ownLabels,
      className,
      ...rest
    },
    ref
  ) => {
    const labels = useLabels(ownLabels);
    const s = surface === 'overlay' ? 'overlay' : 'default';
    const chapter = chapterAt(chapters, media.currentTime);
    const timeOf = (v: number) => labels.timeOf.replace('{current}', formatTime(v)).replace('{total}', formatTime(media.duration));

    const seek = (
      <Slider
        className="ps-media-controls-slider"
        label={labels.seek}
        value={media.currentTime}
        max={media.duration || 1}
        step={1}
        buffered={media.buffered}
        marks={chapters?.map((c) => ({ value: c.start, label: c.title }))}
        knob={variant === 'audio' ? 'always' : 'hover'}
        surface={s}
        valueText={timeOf}
        preview={(v) => {
          const c = chapterAt(chapters, v);
          return c ? `${formatTime(v)} · ${c.title}` : formatTime(v);
        }}
        onChange={media.seek}
      />
    );

    const tool = (label: string, icon: React.ReactNode, a: ToggleAction | undefined, cls?: string) =>
      a && (
        <PlayerControl variant="ghost" size="sm" surface={s} label={label} pressed={a.active} onClick={a.onToggle} className={cls}>
          {icon}
        </PlayerControl>
      );

    const gearLook = cx('ps-player-control ps-player-control--ghost ps-player-control--sm', s === 'overlay' && 'is-on-overlay', 'ps-media-controls-gear');
    const settingsMenu = settings && settings.length > 0 && (
      <Menu ariaLabel={labels.settings} items={settings} trigger={<IconSettings size={18} />} triggerClassName={gearLook} surface={s} />
    );

    const volume = <VolumeControl volume={media.volume} muted={media.muted} onVolumeChange={media.setVolume} onMuteToggle={media.toggleMute} surface={s} labels={ownLabels} />;

    const transport =
      variant === 'audio' ? (
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
          surface={s}
          labels={ownLabels}
        />
      ) : variant === 'movie' ? (
        <TransportControls
          playing={media.playing}
          onPlayPause={media.toggle}
          onSkipBack={() => media.skip(-skipSeconds)}
          onSkipForward={() => media.skip(skipSeconds)}
          onNext={onNext}
          hasNext={hasNext}
          skipSeconds={skipSeconds}
          size="sm"
          surface={s}
          className="ps-media-controls-transport"
          labels={ownLabels}
        />
      ) : (
        <TransportControls playing={media.playing} onPlayPause={media.toggle} size="sm" playVariant={s === 'overlay' ? 'ghost' : 'secondary'} surface={s} labels={ownLabels} />
      );

    return (
      <div
        ref={ref}
        className={cx('ps-media-controls', variant !== 'basic' && `ps-media-controls--${variant}`, surface === 'overlay' && 'ps-media-controls--overlay', className)}
        {...rest}
      >
        {variant === 'audio' ? (
          <div className="ps-media-controls-seek">
            <MediaTime current={media.currentTime} duration={media.duration} mode="elapsed" size="sm" surface={s} />
            {seek}
            <MediaTime current={media.currentTime} duration={media.duration} defaultMode="total" toggleable size="sm" surface={s} labels={ownLabels} />
          </div>
        ) : (
          <div className="ps-media-controls-seek">{seek}</div>
        )}
        <div className="ps-media-controls-bar">
          <div className="ps-media-controls-start">
            {variant !== 'audio' && transport}
            {variant !== 'audio' && volume}
            {variant !== 'audio' && (
              <MediaTime className="ps-media-controls-optional" current={media.currentTime} duration={media.duration} toggleable size="sm" surface={s} labels={ownLabels} />
            )}
            {startSlot}
          </div>
          <div className="ps-media-controls-center">
            {variant === 'audio' && transport}
            {variant === 'movie' && (title || chapter) && (
              <div className="ps-media-controls-title ps-media-controls-extra">
                {chapter && <span className="ps-media-controls-chapter">{chapter.title}</span>}
                {title && <span className="ps-media-controls-name">{title}</span>}
              </div>
            )}
          </div>
          <div className="ps-media-controls-end">
            {endSlot}
            {variant === 'audio' && volume}
            {tool(captions?.active ? labels.subtitlesOn : labels.subtitlesOff, <IconCaptions size={19} />, captions, 'ps-media-controls-optional')}
            {settingsMenu}
            {tool(labels.pictureInPicture, <IconPip size={18} />, pip, 'ps-media-controls-optional')}
            {tool(labels.theaterMode, <IconTheater size={18} />, theater, 'ps-media-controls-extra')}
            {fullscreen &&
              tool(fullscreen.active ? labels.exitFullScreen : labels.fullScreen, fullscreen.active ? <IconFullscreenExit size={18} /> : <IconFullscreen size={18} />, { onToggle: fullscreen.onToggle })}
          </div>
        </div>
      </div>
    );
  }
);
MediaControls.displayName = 'MediaControls';
