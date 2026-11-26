import React, { useContext, useEffect, useId, useRef, useState } from 'react';
import { IconChevronLeft, IconChevronRight, IconClose, IconFullscreen, IconFullscreenExit, IconMinus, IconPanelRight, IconPlus } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { OverlayDepth, useBlockingOverlay } from '../../lib/overlays';
import { useIdle } from '../../lib/useIdle';
import { useZoomPan } from '../../lib/useZoomPan';
import { IconButton } from '../IconButton';
import { Tooltip } from '../Tooltip';

type MediaViewerWord = 'close' | 'previous' | 'next' | 'zoomIn' | 'zoomOut' | 'zoomFit' | 'detailsPane' | 'fullScreen' | 'exitFullScreen';

export interface MediaViewerProps {
  open: boolean;
  onClose: () => void;
  /** The item's name, the dialog's title. */
  title: string;
  /** Where the item sits in its list: "12 of 340", at the far end of the title's row. */
  position?: string;
  /** Before the title: what kind of item it is (an image or a video icon, 16px). */
  icon?: React.ReactNode;
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
  /**
   * The item's own tools (favorite, copy, a menu): one group, at the head of the panel while it is
   * open and in the bar while it is closed.
   */
  actions?: React.ReactNode;
  /**
   * Shortcuts to what the panel holds (labels, collections): one group in the bar, only while the
   * panel is closed.
   */
  panelTools?: React.ReactNode;
  className?: string;
  labels?: LabelOverrides<MediaViewerWord>;
}

// How long the pointer and the keys rest before the zoom box fades away.
const ZOOM_IDLE_MS = 2000;
const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
const isTyping = (el: EventTarget | null) => el instanceof HTMLElement && el.closest('input, textarea, select, [contenteditable="true"]') !== null;

/**
 * The full view of one item, over the app: the media as large as the window allows, in a rounded
 * stage inside a card with a margin that grows with the window. The bar holds the item's kind, name
 * and place in its list; the tools sit at the head of the details panel while it is open and move
 * into the bar, in groups, while it is closed. Previous and next sit on the stage's edges, and
 * images zoom toward the pointer and pan, with a see-through zoom box that fades when idle.
 */
export function MediaViewer({
  open, onClose, title, position, icon, onPrevious, onNext, children, zoomable = false, naturalSize, itemKey, panel, panelOpen = false,
  onPanelOpenChange, actions, panelTools, className, labels: ownLabels,
}: MediaViewerProps) {
  const labels = useLabels(ownLabels);
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const zoom = useZoomPan({ content: naturalSize, resetKey: itemKey ?? title });
  // The zoom box fades away when the pointer rests and no key is pressed, and comes back with either.
  // The viewer is itself a blocking overlay: what it holds (a video player) may go idle inside it.
  const depth = useContext(OverlayDepth);
  const [idle, wake] = useIdle(open && zoomable, ZOOM_IDLE_MS, 1);
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

  const hasPanel = panel !== undefined && onPanelOpenChange !== undefined;
  const showPanel = panel !== undefined && panelOpen;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    wake();
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

  const panelToggle = hasPanel && (
    <IconButton label={labels.detailsPane} size="sm" pressed={panelOpen} onClick={() => onPanelOpenChange(!panelOpen)}>
      <IconPanelRight size={16} />
    </IconButton>
  );
  // The item's tools, then the window's: groups that keep together wherever they sit.
  const tools = (
    <>
      {actions && <div className="ps-media-viewer-group">{actions}</div>}
      <div className="ps-media-viewer-group">
        <IconButton label={fullscreen ? labels.exitFullScreen : labels.fullScreen} size="sm" onClick={toggleFullscreen}>
          {fullscreen ? <IconFullscreenExit size={16} /> : <IconFullscreen size={16} />}
        </IconButton>
        <IconButton label={labels.close} size="sm" onClick={onClose}>
          <IconClose size={16} strokeWidth={2.2} />
        </IconButton>
      </div>
    </>
  );

  return (
    <OverlayDepth.Provider value={depth + 1}>
      <div className="ps-media-viewer-backdrop">
        <div
          ref={rootRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={cx('ps-media-viewer', showPanel && 'is-panel-open', fullscreen && 'is-fullscreen', idle && 'is-idle', className)}
          onKeyDown={onKeyDown}
          onPointerMove={wake}
          onPointerDown={wake}
          onWheel={wake}
        >
          <div className="ps-media-viewer-main">
            <header className="ps-media-viewer-bar">
              <div className="ps-media-viewer-heading">
                {icon && <span className="ps-media-viewer-icon" aria-hidden="true">{icon}</span>}
                <Tooltip label={title} onlyWhenClipped>
                  <h2 className="ps-media-viewer-title" id={titleId}>{title}</h2>
                </Tooltip>
                {position && <span className="ps-media-viewer-position">{position}</span>}
              </div>
              {!showPanel && (
                <>
                  {panelToggle && <div className="ps-media-viewer-group">{panelToggle}</div>}
                  {panelTools && <div className="ps-media-viewer-group">{panelTools}</div>}
                  {tools}
                </>
              )}
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
              {zoomable && (
                <div className="ps-media-viewer-zoom">
                  <IconButton label={labels.zoomOut} size="sm" surface="overlay" onClick={() => zoom.zoomBy(1 / 1.25)} disabled={!zoom.zoomed}>
                    <IconMinus size={16} />
                  </IconButton>
                  <button type="button" className="ps-media-viewer-percent" title={labels.zoomFit} aria-label={`${labels.zoomFit} (${percent})`} onClick={zoom.reset}>
                    {percent}
                  </button>
                  <IconButton label={labels.zoomIn} size="sm" surface="overlay" onClick={() => zoom.zoomBy(1.25)}>
                    <IconPlus size={16} />
                  </IconButton>
                </div>
              )}
            </div>
          </div>
          {showPanel && (
            <aside className="ps-media-viewer-panel" aria-label={labels.detailsPane}>
              <div className="ps-media-viewer-panel-head">
                {panelToggle}
                <span className="ps-media-viewer-spacer" />
                {tools}
              </div>
              <div className="ps-media-viewer-panel-body">{panel}</div>
            </aside>
          )}
        </div>
      </div>
    </OverlayDepth.Provider>
  );
}
