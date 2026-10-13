import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cssDurationMs } from '../../lib/css';
import { cx } from '../../lib/cx';
import { useBlockingOverlay } from '../../lib/overlays';

/** A viewport point to anchor to instead of an element (right-click menus). */
export interface AnchorPoint {
  x: number;
  y: number;
  /** Document the point belongs to (a Picture-in-Picture window has its own). */
  doc?: Document;
}

export interface PopoverProps {
  open: boolean;
  /** Element to anchor to. Either this or `anchorPoint` is required. */
  anchorRef?: React.RefObject<HTMLElement>;
  /** A point to open at, instead of an element. */
  anchorPoint?: AnchorPoint | null;
  /** Called on a press outside, and on Escape unless `onEscape` is given. */
  onClose: () => void;
  /** Called on Escape instead of `onClose` (e.g. to leave an inline sub-mode first). */
  onEscape?: () => void;
  children: React.ReactNode;
  /** The edge of the anchor it lines up with. */
  align?: 'start' | 'end';
  /** Panel is at least as wide as the anchor. */
  matchWidth?: boolean;
  /** Gap between the anchor and the panel, in px. */
  offset?: number;
  className?: string;
  role?: string;
  id?: string;
  ariaLabel?: string;
}

interface Position {
  top: number;
  left: number;
  maxHeight: number;
  minWidth: number;
  placement: 'below' | 'above';
  /** The theme of the place it opened from, so a popover in a themed region matches it. */
  theme?: string;
}

const VIEWPORT_MARGIN = 8;

/**
 * Floating panel anchored to an element or a point. Renders into the anchor's own
 * document (so it also works inside a Picture-in-Picture window), flips above the
 * anchor when there is no room below, and swallows Escape so it never reaches an
 * enclosing modal.
 */
export function Popover({
  open,
  anchorRef,
  anchorPoint,
  onClose,
  onEscape,
  children,
  align = 'start',
  matchWidth = true,
  offset = 6,
  className,
  role,
  id,
  ariaLabel,
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Position | null>(null);
  // Stays true after `open` turns false while the exit (--ps-dur-1 in popover.css) plays.
  const [mounted, setMounted] = useState(open);
  // Open menus pause an app's keyboard shortcuts.
  useBlockingOverlay(role === 'menu' && (open || mounted));

  const onCloseRef = useRef(onClose);
  const onEscapeRef = useRef(onEscape);
  onCloseRef.current = onClose;
  onEscapeRef.current = onEscape;

  const getDoc = useCallback(
    () => anchorRef?.current?.ownerDocument || anchorPoint?.doc || document,
    [anchorRef, anchorPoint]
  );

  const getAnchorRect = useCallback((): DOMRect | null => {
    if (anchorPoint) return new DOMRect(anchorPoint.x, anchorPoint.y, 0, 0);
    return anchorRef?.current?.getBoundingClientRect() ?? null;
  }, [anchorRef, anchorPoint]);

  const reposition = useCallback(() => {
    const rect = getAnchorRect();
    const panel = panelRef.current;
    if (!rect || !panel) return;
    const doc = getDoc();
    const win = doc.defaultView || window;
    // A point anchor opens right at the cursor, not a gap away from it.
    const gap = anchorPoint ? 2 : offset;
    const panelHeight = panel.scrollHeight;
    const panelWidth = Math.max(panel.offsetWidth, matchWidth ? rect.width : 0);

    const spaceBelow = win.innerHeight - rect.bottom - gap - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - gap - VIEWPORT_MARGIN;
    const placement: Position['placement'] =
      panelHeight <= spaceBelow || spaceBelow >= spaceAbove ? 'below' : 'above';
    const maxHeight = Math.max(120, placement === 'below' ? spaceBelow : spaceAbove);
    const height = Math.min(panelHeight, maxHeight);

    let left = align === 'end' ? rect.right - panelWidth : rect.left;
    left = Math.min(Math.max(VIEWPORT_MARGIN, left), win.innerWidth - panelWidth - VIEWPORT_MARGIN);
    const top = placement === 'below' ? rect.bottom + gap : rect.top - gap - height;

    // The panel lives in <body>, outside any themed region its anchor may be in.
    const origin = anchorPoint ? doc.elementFromPoint?.(anchorPoint.x, anchorPoint.y) : anchorRef?.current;
    const theme = origin?.closest('[data-theme]')?.getAttribute('data-theme') ?? undefined;

    setPos({ top, left, maxHeight, minWidth: matchWidth ? rect.width : 0, placement, theme });
  }, [getAnchorRect, getDoc, anchorRef, anchorPoint, align, matchWidth, offset]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => {
      setMounted(false);
      setPos(null);
    }, cssDurationMs('--ps-dur-1', getDoc()));
    return () => window.clearTimeout(t);
  }, [open, getDoc]);

  useLayoutEffect(() => {
    if (open && mounted) reposition();
  }, [open, mounted, reposition]);

  // Content can change height (search filtering, inline create): keep the placement right.
  useLayoutEffect(() => {
    if (!open || !mounted || !panelRef.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => reposition());
    ro.observe(panelRef.current);
    return () => ro.disconnect();
  }, [open, mounted, reposition]);

  useEffect(() => {
    if (!open) return;
    const doc = getDoc();
    const win = doc.defaultView || window;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef?.current?.contains(target)) return;
      onCloseRef.current();
    };

    // Capture phase on the document runs before a modal's window-level listener,
    // so stopping propagation here keeps Escape from also closing the modal.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      e.preventDefault();
      (onEscapeRef.current || onCloseRef.current)();
    };

    // A point has nothing to follow: close on scroll or resize instead of drifting.
    const handleViewportChange = () => (anchorPoint ? onCloseRef.current() : reposition());

    doc.addEventListener('mousedown', handlePointerDown);
    doc.addEventListener('touchstart', handlePointerDown);
    doc.addEventListener('keydown', handleKeyDown, true);
    win.addEventListener('resize', handleViewportChange);
    win.addEventListener('scroll', handleViewportChange, true);
    win.addEventListener('blur', anchorPoint ? handleViewportChange : noop);
    return () => {
      doc.removeEventListener('mousedown', handlePointerDown);
      doc.removeEventListener('touchstart', handlePointerDown);
      doc.removeEventListener('keydown', handleKeyDown, true);
      win.removeEventListener('resize', handleViewportChange);
      win.removeEventListener('scroll', handleViewportChange, true);
      win.removeEventListener('blur', anchorPoint ? handleViewportChange : noop);
    };
  }, [open, anchorRef, anchorPoint, getDoc, reposition]);

  if (!open && !mounted) return null;
  const stateClass = !open ? 'is-leaving' : pos ? `is-${pos.placement}` : 'is-measuring';

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role={role}
      aria-label={ariaLabel}
      data-theme={pos?.theme}
      className={cx('ps-popover', pos && !open && `is-${pos.placement}`, stateClass, className)}
      style={{
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        maxHeight: pos?.maxHeight,
        minWidth: pos?.minWidth,
        pointerEvents: open ? undefined : 'none',
      }}
      // Portaled content still bubbles through the React tree; keep clicks from
      // reaching clickable ancestors such as a selectable card.
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {children}
    </div>,
    getDoc().body
  );
}

function noop() {}
