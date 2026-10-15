import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { IconChevronLeft } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import type { MediaController } from '../../lib/media';
import { useIdle } from '../../lib/useIdle';
import { IconButton } from '../IconButton';
import { MediaControls, type Chapter, type MediaControlsProps, type ToggleAction } from '../MediaControls';
import type { MenuItem } from '../Menu';
import { VideoSurface } from '../VideoSurface';

export interface VideoPlayerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  media: MediaController;
  /** The picture: a `<video>` bound with `useMediaElement`, or a canvas. */
  children: React.ReactNode;
  /** `basic` a video file; `movie` films and episodes (chapters, captions, next). */
  variant?: 'basic' | 'movie';
  /** `filled` the controls under the picture, on a card; `overlay` a dock over it (always in full screen). */
  controls?: 'filled' | 'overlay';
  aspectRatio?: number;
  title?: string;
  /** Above the title, e.g. "Season 1 · Episode 3". */
  overline?: string;
  chapters?: Chapter[];
  /** The captions toggle and the line to show now. */
  captions?: ToggleAction & { text?: string };
  settings?: MenuItem[];
  onNext?: () => void;
  hasNext?: boolean;
  pip?: ToggleAction;
  theater?: ToggleAction;
  /** A back button in the overlay header, to leave the film. */
  onBack?: () => void;
  /** Hides the overlay controls after a moment without activity while playing (default true). */
  autoHide?: boolean;
  labels?: MediaControlsProps['labels'] & LabelOverrides<'back' | 'videoPlayer'>;
}

/**
 * A video player: VideoSurface and MediaControls, with full screen, controls that hide while you
 * watch, and keyboard shortcuts when it has focus: Space or K play, J and L 10 s, ← and → 5 s,
 * ↑ and ↓ volume, M mute, F full screen, C captions, 0–9 jump to 0–90%.
 */
export const VideoPlayer = forwardRef<HTMLDivElement, VideoPlayerProps>(
  (
    {
      media,
      children,
      variant = 'basic',
      controls = 'filled',
      aspectRatio = 16 / 9,
      title,
      overline,
      chapters,
      captions,
      settings,
      onNext,
      hasNext,
      pip,
      theater,
      onBack,
      autoHide = true,
      labels: ownLabels,
      className,
      ...rest
    },
    forwardedRef
  ) => {
    const labels = useLabels(ownLabels);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [isFullscreen, setFullscreen] = useState(false);
    const overlay = controls === 'overlay' || isFullscreen;
    const [idle, wake] = useIdle(overlay && autoHide && media.playing);

    useEffect(() => {
      const doc = rootRef.current?.ownerDocument;
      if (!doc) return;
      const sync = () => setFullscreen(doc.fullscreenElement === rootRef.current);
      doc.addEventListener('fullscreenchange', sync);
      return () => doc.removeEventListener('fullscreenchange', sync);
    }, []);

    const toggleFullscreen = () => {
      const el = rootRef.current;
      if (!el) return;
      if (el.ownerDocument.fullscreenElement) void el.ownerDocument.exitFullscreen();
      else void el.requestFullscreen?.();
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
      wake();
      const onControl = (e.target as HTMLElement).closest('button, [role="slider"], input');
      const k = e.key.toLowerCase();
      const act = (fn: () => void) => {
        e.preventDefault();
        fn();
      };
      if (k === ' ' && !onControl) act(media.toggle);
      else if (k === 'k') act(media.toggle);
      else if (k === 'j') act(() => media.skip(-10));
      else if (k === 'l') act(() => media.skip(10));
      else if (k === 'm') act(media.toggleMute);
      else if (k === 'f') act(toggleFullscreen);
      else if (k === 'c' && captions) act(captions.onToggle);
      else if (onControl) return;
      else if (k === 'arrowleft') act(() => media.skip(-5));
      else if (k === 'arrowright') act(() => media.skip(5));
      else if (k === 'arrowup') act(() => media.setVolume(Math.min(1, media.volume + 0.05)));
      else if (k === 'arrowdown') act(() => media.setVolume(Math.max(0, media.volume - 0.05)));
      else if (/^[0-9]$/.test(k)) act(() => media.seek((Number(k) / 10) * media.duration));
    };

    return (
      <div
        ref={(el) => {
          rootRef.current = el;
          if (typeof forwardedRef === 'function') forwardedRef(el);
          else if (forwardedRef) forwardedRef.current = el;
        }}
        className={cx('ps-video-player', overlay && 'ps-video-player--overlay', isFullscreen && 'is-fullscreen', idle && 'is-idle', !media.playing && 'is-paused', className)}
        tabIndex={0}
        aria-label={title ?? labels.videoPlayer}
        onPointerMove={wake}
        onPointerDown={wake}
        onKeyDown={onKeyDown}
        onFocus={wake}
        {...rest}
      >
        <VideoSurface
          aspectRatio={isFullscreen ? undefined : aspectRatio}
          playing={media.playing}
          waiting={media.waiting}
          ended={media.ended}
          caption={captions?.active ? captions.text : undefined}
          onPlay={media.play}
          onReplay={() => {
            media.seek(0);
            media.play();
          }}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('.ps-video-surface-media')) media.toggle();
          }}
          onDoubleClick={toggleFullscreen}
          className="ps-video-player-surface"
          labels={ownLabels}
        >
          {children}
        </VideoSurface>

        {overlay && (title || onBack) && (
          <div className="ps-video-player-header">
            {onBack && (
              <IconButton label={labels.back} surface="overlay" className="ps-video-player-back" onClick={onBack}>
                <IconChevronLeft size={18} />
              </IconButton>
            )}
            {title && (
              <div className="ps-video-player-heading">
                {overline && <span className="ps-video-player-overline">{overline}</span>}
                <span className="ps-video-player-title">{title}</span>
              </div>
            )}
          </div>
        )}

        <MediaControls
          className="ps-video-player-controls"
          media={media}
          variant={variant}
          surface={overlay ? 'overlay' : 'filled'}
          title={overlay ? undefined : title}
          chapters={chapters}
          captions={captions}
          settings={settings}
          onNext={onNext}
          hasNext={hasNext}
          pip={pip}
          theater={theater}
          fullscreen={{ active: isFullscreen, onToggle: toggleFullscreen }}
          labels={ownLabels}
        />
      </div>
    );
  }
);
VideoPlayer.displayName = 'VideoPlayer';
