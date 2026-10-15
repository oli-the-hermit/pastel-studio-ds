import React, { forwardRef } from 'react';
import { IconForward10, IconPause, IconPlay, IconPrevious, IconRepeat, IconRepeatOne, IconReplay10, IconShuffle, IconSkip, IconStop } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { PlayerControl } from '../PlayerControl';

export type RepeatMode = 'off' | 'all' | 'one';

/** The next repeat mode in the cycle off → all → one → off. */
export const nextRepeat = (mode: RepeatMode): RepeatMode => (mode === 'off' ? 'all' : mode === 'all' ? 'one' : 'off');

type TransportWords = 'playback' | 'play' | 'pause' | 'previous' | 'next' | 'stop' | 'skipBack' | 'skipForward' | 'shuffle' | 'repeatOff' | 'repeatAll' | 'repeatOne';

export interface TransportControlsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  playing: boolean;
  onPlayPause: () => void;
  /** Each of the other buttons shows only when its handler is given. */
  onPrevious?: () => void;
  onNext?: () => void;
  onStop?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  /** Seconds the skip buttons move, for their names; the handlers do the moving. */
  skipSeconds?: number;
  shuffle?: boolean;
  onShuffleChange?: (on: boolean) => void;
  repeat?: RepeatMode;
  onRepeatChange?: (mode: RepeatMode) => void;
  /** False greys out Previous, e.g. on the first track. */
  hasPrevious?: boolean;
  /** False greys out Next, e.g. on the last track without repeat. */
  hasNext?: boolean;
  /** `md` full players, `sm` bars and mini players. */
  size?: 'md' | 'sm';
  /** The play button: `primary` in the phase color (default), `secondary` a tonal circle, `ghost` quiet. */
  playVariant?: 'primary' | 'secondary' | 'ghost';
  /** The buttons around play: `ghost` quiet (default) or `secondary` filled circles. */
  variant?: 'secondary' | 'ghost';
  /** `spread` fills the width (a player card); `cluster` hugs the buttons (a bar). */
  layout?: 'cluster' | 'spread';
  labels?: LabelOverrides<TransportWords>;
}

/**
 * The transport row: [shuffle] [previous] [back] [stop] play/pause [forward] [next] [repeat].
 * Built on PlayerControl. The buttons follow the handlers given, so one component serves a
 * basic file player, a movie, a music player and a mini player.
 */
export const TransportControls = forwardRef<HTMLDivElement, TransportControlsProps>(
  (
    {
      playing,
      onPlayPause,
      onPrevious,
      onNext,
      onStop,
      onSkipBack,
      onSkipForward,
      skipSeconds = 10,
      shuffle,
      onShuffleChange,
      repeat = 'off',
      onRepeatChange,
      hasPrevious = true,
      hasNext = true,
      size = 'md',
      playVariant = 'primary',
      variant = 'ghost',
      layout = 'cluster',
      labels: ownLabels,
      className,
      ...rest
    },
    ref
  ) => {
    const labels = useLabels(ownLabels);
    const glyph = size === 'sm' ? 17 : 20;
    const seconds = (word: string) => word.replace('{seconds}', String(skipSeconds));
    const repeatLabel = repeat === 'one' ? labels.repeatOne : repeat === 'all' ? labels.repeatAll : labels.repeatOff;
    return (
      <div
        ref={ref}
        className={cx('ps-transport-controls', size === 'sm' && 'ps-transport-controls--sm', layout === 'spread' && 'ps-transport-controls--spread', className)}
        role="group"
        aria-label={labels.playback}
        {...rest}
      >
        {onShuffleChange && (
          <PlayerControl size={size} variant="ghost" label={labels.shuffle} pressed={!!shuffle} onClick={() => onShuffleChange(!shuffle)}>
            <IconShuffle size={glyph - 1} />
          </PlayerControl>
        )}
        {onPrevious && (
          <PlayerControl size={size} variant={variant} label={labels.previous} disabled={!hasPrevious} onClick={onPrevious}>
            <IconPrevious size={glyph} />
          </PlayerControl>
        )}
        {onSkipBack && (
          <PlayerControl size={size} variant={variant} label={seconds(labels.skipBack)} onClick={onSkipBack}>
            <IconReplay10 size={glyph + 1} />
          </PlayerControl>
        )}
        {onStop && (
          <PlayerControl size={size} variant={variant} label={labels.stop} onClick={onStop}>
            <IconStop size={glyph - 2} />
          </PlayerControl>
        )}
        <PlayerControl size={size} variant={playVariant} label={playing ? labels.pause : labels.play} onClick={onPlayPause} className="ps-transport-controls-play">
          {playing ? <IconPause size={playVariant === 'primary' ? glyph + 6 : glyph} /> : <IconPlay size={playVariant === 'primary' ? glyph + 6 : glyph} />}
        </PlayerControl>
        {onSkipForward && (
          <PlayerControl size={size} variant={variant} label={seconds(labels.skipForward)} onClick={onSkipForward}>
            <IconForward10 size={glyph + 1} />
          </PlayerControl>
        )}
        {onNext && (
          <PlayerControl size={size} variant={variant} label={labels.next} disabled={!hasNext} onClick={onNext}>
            <IconSkip size={glyph} />
          </PlayerControl>
        )}
        {onRepeatChange && (
          <PlayerControl size={size} variant="ghost" label={repeatLabel} pressed={repeat !== 'off'} onClick={() => onRepeatChange(nextRepeat(repeat))}>
            {repeat === 'one' ? <IconRepeatOne size={glyph - 1} /> : <IconRepeat size={glyph - 1} />}
          </PlayerControl>
        )}
      </div>
    );
  }
);
TransportControls.displayName = 'TransportControls';
