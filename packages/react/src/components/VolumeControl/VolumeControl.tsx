import React, { forwardRef } from 'react';
import { IconSoundOn, IconVolumeLow, IconVolumeMute } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { PlayerControl } from '../PlayerControl';
import { Slider } from '../Slider';

export interface VolumeIconProps {
  /** 0–1. */
  volume: number;
  muted: boolean;
  size?: number;
}

/** The volume glyph that follows the level: muted, low or high. */
export const VolumeIcon = ({ volume, muted, size = 18 }: VolumeIconProps) =>
  muted || volume === 0 ? <IconVolumeMute size={size} /> : volume < 0.5 ? <IconVolumeLow size={size} /> : <IconSoundOn size={size} />;

export interface VolumeControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onVolumeChange'> {
  /** 0–1. */
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  /** `expand` the slider unfolds on hover and focus (bars, the default); `inline` always shown; `button` mute only. */
  layout?: 'inline' | 'expand' | 'button';
  /** `sm` (default) for bars, `md` for full players. */
  size?: 'md' | 'sm';
  labels?: LabelOverrides<'mute' | 'unmute' | 'volume'>;
}

/** A mute toggle with a volume slider; the slider steps 5% with the arrow keys. */
export const VolumeControl = forwardRef<HTMLDivElement, VolumeControlProps>(
  ({ volume, muted, onVolumeChange, onMuteToggle, layout = 'expand', size = 'sm', labels: ownLabels, className, ...rest }, ref) => {
    const labels = useLabels(ownLabels);
    const level = muted ? 0 : volume;
    return (
      <div ref={ref} className={cx('ps-volume-control', layout !== 'inline' && `ps-volume-control--${layout}`, className)} {...rest}>
        <PlayerControl variant="ghost" size={size} label={muted ? labels.unmute : labels.mute} onClick={onMuteToggle}>
          <VolumeIcon volume={volume} muted={muted} size={size === 'sm' ? 17 : 19} />
        </PlayerControl>
        {layout !== 'button' && (
          <div className="ps-volume-control-slider">
            <Slider
              value={Math.round(level * 100)}
              max={100}
              step={5}
              size="sm"
              label={labels.volume}
              valueText={(v) => `${Math.round(v)}%`}
              onChange={(v) => onVolumeChange(v / 100)}
            />
          </div>
        )}
      </div>
    );
  }
);
VolumeControl.displayName = 'VolumeControl';
