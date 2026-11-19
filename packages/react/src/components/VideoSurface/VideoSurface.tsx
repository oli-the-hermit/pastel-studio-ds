import React, { forwardRef } from 'react';
import { IconPlay, IconReset } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { PlayerControl } from '../PlayerControl';
import { Spinner } from '../Spinner';

export interface VideoSurfaceProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The picture: a `<video>`, a `<canvas>` or a poster `<img>`. It fills the surface, letterboxed. */
  children?: React.ReactNode;
  /** Width / height, e.g. 16 / 9. Leave it out to fill the parent (a picture-in-picture window). */
  aspectRatio?: number;
  /**
   * Fill the parent whatever the picture's shape: the picture is fitted inside, never cropped.
   * `aspectRatio` then only says where the picture's edge is, for the hairline around it.
   */
  fill?: boolean;
  playing: boolean;
  /** Buffering: shows the spinner while playing. */
  waiting?: boolean;
  ended?: boolean;
  /** The current caption line. */
  caption?: string;
  /** The big play button in the middle while paused (default true). */
  showCenterPlay?: boolean;
  onPlay?: () => void;
  /** Shows a "Play again" button when it has ended. */
  onReplay?: () => void;
  labels?: LabelOverrides<'play' | 'playAgain' | 'buffering'>;
}

/**
 * The picture area of a video player: the letterbox, the media, the captions, and the layers for
 * paused, buffering and ended. Captions sit in a pill of the dock color, never in a band.
 */
export const VideoSurface = forwardRef<HTMLDivElement, VideoSurfaceProps>(
  ({ children, aspectRatio, fill = false, playing, waiting, ended, caption, showCenterPlay = true, onPlay, onReplay, labels: ownLabels, className, style, ...rest }, ref) => {
    const labels = useLabels(ownLabels);
    const fills = fill || !aspectRatio;
    const framed = fill && !!aspectRatio;
    return (
      <div
        ref={ref}
        className={cx('ps-video-surface', fills && 'ps-video-surface--fill', className)}
        style={{
          ...style,
          aspectRatio: fills ? undefined : String(aspectRatio),
          ...(framed ? ({ '--ps-video-surface-ratio': String(aspectRatio) } as React.CSSProperties) : null),
        }}
        {...rest}
      >
        <div className="ps-video-surface-media">{children}</div>
        {framed && <div className="ps-video-surface-frame" aria-hidden="true" />}
        {caption && (
          <div className="ps-video-surface-caption" aria-live="polite">
            <span>{caption}</span>
          </div>
        )}
        {waiting && playing && (
          <div className="ps-video-surface-layer">
            <Spinner size="lg" labels={{ loading: labels.buffering }} />
          </div>
        )}
        {ended && onReplay ? (
          <div className="ps-video-surface-layer">
            <PlayerControl variant="primary" label={labels.playAgain} onClick={onReplay} className="ps-video-surface-center">
              <IconReset size={26} />
            </PlayerControl>
          </div>
        ) : (
          !playing && showCenterPlay && onPlay && !waiting && (
            <div className="ps-video-surface-layer">
              <PlayerControl variant="primary" label={labels.play} onClick={onPlay} className="ps-video-surface-center">
                <IconPlay size={30} />
              </PlayerControl>
            </div>
          )
        )}
      </div>
    );
  }
);
VideoSurface.displayName = 'VideoSurface';
