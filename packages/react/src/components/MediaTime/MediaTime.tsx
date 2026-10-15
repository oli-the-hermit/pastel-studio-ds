import React from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { formatTime } from '../../lib/format';
import { useControllable } from '../../lib/useControllable';

export type MediaTimeMode = 'pair' | 'elapsed' | 'remaining' | 'total';

export interface MediaTimeProps {
  /** Seconds played. */
  current: number;
  /** Seconds in all. */
  duration: number;
  /** `pair` "1:04 / 3:20", `elapsed` "1:04", `remaining` "-2:16", `total` "3:20". Leave it out to let a toggle own it. */
  mode?: MediaTimeMode;
  /** The starting mode when `mode` is left out. */
  defaultMode?: MediaTimeMode;
  /** A click flips between the default mode and the remaining time. */
  toggleable?: boolean;
  onModeChange?: (mode: MediaTimeMode) => void;
  /** `sm` for bars. */
  size?: 'md' | 'sm';
  /** `overlay` on the see-through dock over video. */
  surface?: 'default' | 'overlay';
  className?: string;
  labels?: LabelOverrides<'showRemainingTime'>;
}

/** Elapsed or remaining time in figures that don't jiggle as they change. */
export function MediaTime({ current, duration, mode, defaultMode = 'pair', toggleable = false, onModeChange, size = 'md', surface = 'default', className, labels: ownLabels }: MediaTimeProps) {
  const labels = useLabels(ownLabels);
  const [m, setM] = useControllable<MediaTimeMode>(mode, defaultMode, onModeChange);
  const text =
    m === 'pair' ? `${formatTime(current)} / ${formatTime(duration)}`
    : m === 'elapsed' ? formatTime(current)
    : m === 'total' ? formatTime(duration)
    : `-${formatTime(duration - current)}`;
  const cls = cx('ps-media-time', size === 'sm' && 'ps-media-time--sm', surface === 'overlay' && 'is-on-overlay', className);
  if (!toggleable) return <span className={cls}>{text}</span>;
  const other: MediaTimeMode = defaultMode === 'remaining' ? 'pair' : defaultMode;
  return (
    <button
      type="button"
      className={cx(cls, 'is-toggle')}
      title={labels.showRemainingTime}
      aria-label={`${text}. ${labels.showRemainingTime}`}
      aria-pressed={m === 'remaining'}
      onClick={() => setM(m === 'remaining' ? other : 'remaining')}
    >
      {text}
    </button>
  );
}
