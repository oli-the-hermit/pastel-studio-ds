import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cssDurationMs } from '../../lib/css';
import { cx } from '../../lib/cx';
import { useBlockingOverlay } from '../../lib/overlays';
import { usePortalContainer } from '../../lib/portal';
import { keepTop, maxColumns, menuColumns, placeAtPoint, placeBeside, VIEWPORT_MARGIN } from '../../lib/position';
import { deepElementFromPoint, eventIsInside } from '../../lib/shadowDom';

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
  /**
   * Lets the content flow into side-by-side columns when the window is too short to show it
   * whole, instead of scrolling (menus). The content lays itself out from `data-columns` and
   * `--ps-popover-columns` on the panel.
   */
  columns?: boolean;
}

interface Position {
  top: number;
  left: number;
  maxHeight: number;
  minWidth: number;
  placement: 'below' | 'above';
  /** The theme of the place it opened from, so a popover in a themed region matches it. */
  theme?: string;
  /** More than 1 when the content flows into columns; `width` is then set to hold them. */
  columns: number;
  width?: number;
}

/** Space between columns, in px; matches the column gap in menu.css (--ps-space-6). */
const COLUMN_GAP = 6;

/** The panel's size as one column, measured by briefly taking its columns off. */
function naturalSize(panel: HTMLElement) {
  const cols = panel.getAttribute('data-columns');
  const width = panel.style.width;
  if (cols) {
    panel.removeAttribute('data-columns');
    panel.style.width = '';
  }
  const size = { width: panel.offsetWidth, height: panel.scrollHeight };
  if (cols) {
    panel.setAttribute('data-columns', cols);
    panel.style.width = width;
  }
  return size;
}

/**
 * Floating panel anchored to an element or a point. Renders into the anchor's own
 * document (so it also works inside a Picture-in-Picture window), flips above the
 * anchor when there is no room below, and swallows Escape so it never reaches an
 * enclosing modal. At a point (a right-click) it slides to fit rather than shrinking,
 * and with `columns` it spreads into columns when the window is too short.
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
  columns = false,
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const portalContainer = usePortalContainer();
  const [pos, setPos] = useState<Position | null>(null);
  // Stays true after `open` turns false while the exit (--ps-dur-1 in popover.css) plays.
  const [mounted, setMounted] = useState(open);
  // Open menus pause an app's keyboard shortcuts.
  useBlockingOverlay(role === 'menu' && (open || mounted));

  const onCloseRef = useRef(onClose);
  const onEscapeRef = useRef(onEscape);
  onCloseRef.current = onClose;
  onEscapeRef.current = onEscape;

  // What a point menu last measured and where it went, so rows changing in place (a submenu)
  // keep its top edge still.
  const lastPoint = useRef<{ point: AnchorPoint; natural: number; top: number } | null>(null);
  // The element that was right-clicked, found once per point (later the menu covers the point).
  const origin = useRef<{ point: AnchorPoint | null | undefined; el: Element | null }>({ point: undefined, el: null });
  // Columns added when groups that never split left the balanced columns a little too tall.
  const columnBump = useRef({ natural: 0, extra: 0 });

  const getDoc = useCallback(
    () => anchorRef?.current?.ownerDocument || anchorPoint?.doc || document,
    [anchorRef, anchorPoint]
  );

  const getAnchorRect = useCallback((): DOMRect | null => {
    if (anchorPoint) return new DOMRect(anchorPoint.x, anchorPoint.y, 0, 0);
    return anchorRef?.current?.getBoundingClientRect() ?? null;
  }, [anchorRef, anchorPoint]);

  const originElement = useCallback((): Element | null => {
    if (!anchorPoint) return anchorRef?.current ?? null;
    if (origin.current.point !== anchorPoint) {
      origin.current = { point: anchorPoint, el: deepElementFromPoint(getDoc(), anchorPoint.x, anchorPoint.y) };
    }
    return origin.current.el;
  }, [anchorPoint, anchorRef, getDoc]);

  const reposition = useCallback(
    (fresh = false) => {
      const rect = getAnchorRect();
      const panel = panelRef.current;
      if (!rect || !panel) return;
      const doc = getDoc();
      const win = doc.defaultView || window;
      const viewport = { width: win.innerWidth, height: win.innerHeight };
      const available = viewport.height - 2 * VIEWPORT_MARGIN;

      const natural = naturalSize(panel);
      const shown = Number(panel.getAttribute('data-columns') || 1);
      let cols = 1;
      if (columns) {
        cols = menuColumns(natural.height, natural.width, viewport, { gap: COLUMN_GAP });
        if (columnBump.current.natural !== natural.height) columnBump.current = { natural: natural.height, extra: 0 };
        if (cols > 1) {
          const widest = maxColumns(natural.width, viewport, { gap: COLUMN_GAP });
          cols = Math.min(widest, cols + columnBump.current.extra);
          if (shown === cols && panel.scrollHeight > available && cols < widest) {
            columnBump.current.extra += 1;
            cols += 1;
          }
        }
      }
      const width = cols > 1 ? cols * natural.width + (cols - 1) * COLUMN_GAP : undefined;
      // When the column count just changed, the panel on screen is not the one being placed:
      // estimate its height; the ResizeObserver places it again once it has rendered.
      const height = cols === shown ? panel.scrollHeight : Math.ceil(natural.height / cols);
      const size = { width: width ?? Math.max(natural.width, matchWidth ? rect.width : 0), height };

      let placed;
      if (anchorPoint) {
        placed = placeAtPoint(anchorPoint, size, viewport);
        const last = lastPoint.current;
        // Rows changed in place (a submenu, or back): keep the top edge, only moving it up to fit.
        if (!fresh && last && last.point === anchorPoint && last.natural !== natural.height) {
          placed.top = keepTop(last.top, Math.min(size.height, placed.maxHeight), viewport);
          placed.side = 'below';
        }
        lastPoint.current = { point: anchorPoint, natural: natural.height, top: placed.top };
      } else {
        placed = placeBeside(rect, size, viewport, { gap: offset, align });
      }

      // The panel lives outside any themed region its anchor may be in (in <body> or a
      // PortalProvider's container), so it takes the anchor's theme.
      const theme = originElement()?.closest('[data-theme]')?.getAttribute('data-theme') ?? undefined;

      setPos({
        top: placed.top,
        left: placed.left,
        maxHeight: placed.maxHeight,
        minWidth: matchWidth ? rect.width : 0,
        placement: placed.side,
        theme,
        columns: cols,
        width,
      });
    },
    [getAnchorRect, getDoc, originElement, anchorPoint, align, matchWidth, offset, columns]
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => {
      setMounted(false);
      setPos(null);
      lastPoint.current = null;
    }, cssDurationMs('--ps-dur-1', getDoc()));
    return () => window.clearTimeout(t);
  }, [open, getDoc]);

  useLayoutEffect(() => {
    if (open && mounted) reposition();
  }, [open, mounted, reposition]);

  // A new column count was placed from an estimate: place it again now that it has rendered.
  const shownColumns = pos?.columns;
  useLayoutEffect(() => {
    if (open && mounted && shownColumns) reposition();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the count changes
  }, [shownColumns]);

  // Content can change size (search filtering, inline create, a submenu): keep the placement
  // right. The panel's own box stops growing at its height limit, so its rows are watched too.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !mounted || !panel || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => reposition());
    ro.observe(panel);
    Array.from(panel.children).forEach((child) => ro.observe(child));
    return () => ro.disconnect();
  }, [open, mounted, reposition]);

  useEffect(() => {
    if (!open) return;
    const doc = getDoc();
    const win = doc.defaultView || window;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (eventIsInside(e, panelRef.current)) return;
      if (eventIsInside(e, anchorRef?.current)) return;
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

    // Scrolling inside the panel (a long list) never moves it. An anchored panel follows its
    // anchor. A point has nothing to follow: it closes when the page, or whatever holds the
    // element that was right-clicked, scrolls; an unrelated area scrolling leaves it alone.
    const handleScroll = (e: Event) => {
      if (eventIsInside(e, panelRef.current)) return;
      if (!anchorPoint) {
        reposition();
        return;
      }
      const target = e.target as Node | null;
      const clicked = originElement();
      const isPage = !target || target === doc || target === doc.documentElement || target === doc.body;
      if (isPage || (clicked && typeof target.contains === 'function' && target.contains(clicked))) onCloseRef.current();
    };
    // A resized window places it again from scratch, so it stays whole in a smaller window.
    const handleResize = () => reposition(true);
    const handleBlur = () => onCloseRef.current();

    doc.addEventListener('mousedown', handlePointerDown);
    doc.addEventListener('touchstart', handlePointerDown);
    doc.addEventListener('keydown', handleKeyDown, true);
    win.addEventListener('resize', handleResize);
    win.addEventListener('scroll', handleScroll, true);
    win.addEventListener('blur', anchorPoint ? handleBlur : noop);
    return () => {
      doc.removeEventListener('mousedown', handlePointerDown);
      doc.removeEventListener('touchstart', handlePointerDown);
      doc.removeEventListener('keydown', handleKeyDown, true);
      win.removeEventListener('resize', handleResize);
      win.removeEventListener('scroll', handleScroll, true);
      win.removeEventListener('blur', anchorPoint ? handleBlur : noop);
    };
  }, [open, anchorRef, anchorPoint, getDoc, reposition, originElement]);

  if (!open && !mounted) return null;
  const stateClass = !open ? 'is-leaving' : pos ? `is-${pos.placement}` : 'is-measuring';
  const multi = pos && pos.columns > 1 ? pos.columns : undefined;

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role={role}
      aria-label={ariaLabel}
      data-theme={pos?.theme}
      data-columns={multi}
      className={cx('ps-popover', pos && !open && `is-${pos.placement}`, stateClass, className)}
      style={
        {
          top: pos?.top ?? -9999,
          left: pos?.left ?? -9999,
          maxHeight: pos?.maxHeight,
          minWidth: pos?.minWidth,
          width: pos?.width,
          '--ps-popover-columns': multi,
          pointerEvents: open ? undefined : 'none',
        } as React.CSSProperties
      }
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
    // A PortalProvider's container, unless the anchor is in another window (Picture-in-Picture).
    portalContainer && portalContainer.ownerDocument === getDoc() ? portalContainer : getDoc().body
  );
}

function noop() {}
