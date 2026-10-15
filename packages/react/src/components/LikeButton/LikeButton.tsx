import React, { forwardRef } from 'react';
import { IconHeart } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { PlayerControl, type PlayerControlProps } from '../PlayerControl';

export interface LikeButtonProps extends Omit<PlayerControlProps, 'label' | 'pressed' | 'onClick' | 'variant' | 'children'> {
  liked: boolean;
  onLikedChange: (liked: boolean) => void;
  labels?: LabelOverrides<'like' | 'unlike'>;
}

/** A heart toggle: liked, it fills in the phase color with a small pop. */
export const LikeButton = forwardRef<HTMLButtonElement, LikeButtonProps>(({ liked, onLikedChange, labels: ownLabels, size = 'sm', className, ...rest }, ref) => {
  const labels = useLabels(ownLabels);
  return (
    <PlayerControl
      ref={ref}
      variant="ghost"
      size={size}
      pressed={liked}
      label={liked ? labels.unlike : labels.like}
      onClick={() => onLikedChange(!liked)}
      className={cx('ps-like-button', className)}
      {...rest}
    >
      <IconHeart size={size === 'sm' ? 17 : 20} filled={liked} />
    </PlayerControl>
  );
});
LikeButton.displayName = 'LikeButton';
