import React, { useEffect, useId, useRef, useState } from 'react';
import { IconChevronLeft, IconChevronRight, IconClose, IconFullscreen, IconFullscreenExit, IconMinus, IconPanelRight, IconPlus } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { useBlockingOverlay } from '../../lib/overlays';
import { useZoomPan } from '../../lib/useZoomPan';
import { IconButton } from '../IconButton';

type MediaViewerWord = 'close' | 'previous' | 'next' | 'zoomIn' | 'zoomOut' | 'zoomFit' | 'detailsPane' | 'fullScreen' | 'exitFullScreen';

export interface MediaViewerProps {
  open: boolean;
  onClose: () => void;
  /** The item's name, the dialog's title. */
  title: string;
  /** Where the item sits in its list: "12 of 340". */
  position?: string;
  /** Each one shows its button and its arrow key. */
  onPrevious?: () => void;
  onNext?: () => void;
  /**
   * The media: an `<img>` or a `<video>` is fitted to the stage, as large as it can be without
   * cropping; anything else (a video player) fills the stage and fits itself.
   */
  children: React.ReactNode;
  /** Wheel zoom, drag to pan and a fitted / actual-size toggle: for images. */
  zoomable?: boolean;
  /** The media's own size, for actual size, the zoom readout and the pan limits. */
  naturalSize?: { width: number; height: number };
  /** Changes when the item changes, so zoom goes back to fitted. Defaults to `title`. */
  itemKey?: string;
  /** Beside the stage: the item's details. */
  panel?: React.ReactNode;
  panelOpen?: boolean;
  /** Shows the details button and lets I toggle the panel. */
  onPanelOpenChange?: (open: boolean) => void;
  /** More tools in the bar, before zoom: favorite, share. */
  actions?: React.ReactNode;
  className?: string;
  labels?: LabelOverrides<MediaViewerWord>;
}

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
const isTyping = (el: EventTarget | null) => el instanceof HTMLElement && el.closest('input, textarea, select, [contenteditable="true"]') !== null;

/**
 * The full view of one item, over the app: the media as large as the window allows, with a margin
 * that grows with the window, a bar with its name and tools, previous and next on the stage's
 * edges and the item's details in a panel beside it. Images zoom toward the pointer and pan.
 */
export function MediaViewer({
  open, onClose, title, position, onPrevious, onNext, children, zoomable = false, naturalSize, itemKey, panel, panelOpen = false,
  onPanelOpenChange, actions, className, labels: ownLabels,
}: MediaViewerProps) {
  const labels = useLabels(ownLabels);
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const zoom = useZoomPan({ content: naturalSize, resetKey: itemKey ?? title });
  useBlockingOverlay(open);

  // Focus moves in on open and back to whatever opened it on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    rootRef.current?.focus();
    return () => {
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current && rootRef.current !== null);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  if (!open) return null;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void rootRef.current?.requestFullscreen?.();
  };

  const showPanel = panel !== undefined && panelOpen;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first) return e.preventDefault();
      if (e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      // The browser leaves full screen by itself on Escape; a second Escape closes.
      if (!document.fullscreenElement) onClose();
      return;
    }
    if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toLowerCase();
    const plain = !e.shiftKey;
    const action =
      key === 'arrowleft' && plain ? onPrevious
      : key === 'arrowright' && plain ? onNext
      : key === 'f' ? toggleFullscreen
      : key === 'i' && onPanelOpenChange && panel !== undefined ? () => onPanelOpenChange(!panelOpen)
      : !zoomable ? undefined
      : key === '+' || key === '=' ? () => zoom.zoomBy(1.25)
      : key === '-' ? () => zoom.zoomBy(1 / 1.25)
      : key === '0' ? zoom.reset
      : undefined;
    if (!action) return;
    e.preventDefault();
    action();
  };

  const percent = zoom.pixelRatio !== undefined ? `${Math.round(zoom.pixelRatio * 100)}%` : `${Math.round(zoom.state.scale * 100)}%`;

  return (
    <div className="ps-media-viewer-backdrop">
      <div
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx('ps-media-viewer', showPanel && 'is-panel-open', fullscreen && 'is-fullscreen', className)}
        onKeyDown={onKeyDown}
      >
        <div className="ps-media-viewer-main">
          <header className="ps-media-viewer-bar">
            <h2 className="ps-media-viewer-title" id={titleId} title={title}>{title}</h2>
            {position && <span className="ps-media-viewer-position">{position}</span>}
            <span className="ps-media-viewer-spacer" />
            {actions}
            {zoomable && (
              <div className="ps-media-viewer-zoom">
                <IconButton label={labels.zoomOut} size="sm" onClick={() => zoom.zoomBy(1 / 1.25)} disabled={!zoom.zoomed}>
                  <IconMinus size={16} />
                </IconButton>
                <button type="button" className="ps-media-viewer-percent" title={labels.zoomFit} aria-label={`${labels.zoomFit} (${percent})`} onClick={zoom.reset}>
                  {percent}
                </button>
                <IconButton label={labels.zoomIn} size="sm" onClick={() => zoom.zoomBy(1.25)}>
                  <IconPlus size={16} />
                </IconButton>
              </div>
            )}
            {onPanelOpenChange && panel !== undefined && (
              <IconButton label={labels.detailsPane} size="sm" pressed={panelOpen} onClick={() => onPanelOpenChange(!panelOpen)}>
                <IconPanelRight size={16} />
              </IconButton>
            )}
            <IconButton label={fullscreen ? labels.exitFullScreen : labels.fullScreen} size="sm" onClick={toggleFullscreen}>
              {fullscreen ? <IconFullscreenExit size={16} /> : <IconFullscreen size={16} />}
            </IconButton>
            <IconButton label={labels.close} size="sm" onClick={onClose}>
              <IconClose size={16} strokeWidth={2.2} />
            </IconButton>
          </header>
          <div
            ref={zoomable ? zoom.stageRef : undefined}
            className={cx('ps-media-viewer-stage', zoomable && 'is-zoomable', zoom.zoomed && 'is-zoomed', zoom.dragging && 'is-dragging')}
            onDoubleClick={zoomable ? (e) => !(e.target as HTMLElement).closest('button') && zoom.toggle({ x: e.clientX, y: e.clientY }) : undefined}
            {...(zoomable ? zoom.panHandlers : {})}
            onPointerDown={zoomable ? (e) => !(e.target as HTMLElement).closest('button') && zoom.panHandlers.onPointerDown?.(e) : undefined}
          >
            <div className="ps-media-viewer-canvas" style={zoomable ? zoom.style : undefined}>
              {children}
            </div>
            {onPrevious && (
              <IconButton className="ps-media-viewer-nav is-previous" label={labels.previous} surface="overlay" onClick={onPrevious}>
                <IconChevronLeft size={20} />
              </IconButton>
            )}
            {onNext && (
              <IconButton className="ps-media-viewer-nav is-next" label={labels.next} surface="overlay" onClick={onNext}>
                <IconChevronRight size={20} />
              </IconButton>
            )}
          </div>
        </div>
        {showPanel && <aside className="ps-media-viewer-panel" aria-label={labels.detailsPane}>{panel}</aside>}
      </div>
    </div>
  );
}
