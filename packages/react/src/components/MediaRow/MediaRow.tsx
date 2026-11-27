import React, { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { IconButton } from '../IconButton';
import { TextButton } from '../TextButton';

export interface MediaRowProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'role'> {
  /** The row's heading, which also names its region: "Continue watching". */
  title: string;
  /** Shows "See all" at the heading's end, for the page with everything the row is a part of. */
  onSeeAll?: () => void;
  /** The heading's level on the page (default 2). */
  headingLevel?: 2 | 3 | 4;
  /**
   * The items, usually TitleTiles. Each child becomes one list item and should be one element
   * that can take the focus and passes `tabIndex` on (a button, a link): the row gives it the tab stop.
   */
  children?: React.ReactNode;
  labels?: LabelOverrides<'seeAll' | 'previous' | 'next'>;
}

interface Edges {
  /** Everything is in view: there is nothing to scroll to. */
  fits: boolean;
  atStart: boolean;
  atEnd: boolean;
}

const START: Edges = { fits: true, atStart: true, atEnd: true };
/** Scroll positions land a fraction of a pixel off on scaled displays. */
const SLACK = 1;

/**
 * A heading over one row of items that scrolls sideways, with Previous and Next beside the heading
 * to move a page at a time. One tab stop for the whole row: ← and → move between its items, Home
 * and End jump to the ends, and the item that takes the focus scrolls into view.
 */
export const MediaRow = forwardRef<HTMLElement, MediaRowProps>(
  ({ title, onSeeAll, headingLevel = 2, labels: ownLabels, className, children, ...rest }, ref) => {
    const labels = useLabels(ownLabels);
    const id = useId();
    const titleId = `${id}-title`;
    const listId = `${id}-list`;
    const listRef = useRef<HTMLUListElement | null>(null);
    const previousRef = useRef<HTMLButtonElement | null>(null);
    const nextRef = useRef<HTMLButtonElement | null>(null);
    const [edges, setEdges] = useState(START);
    const [stop, setStop] = useState(0);
    // The arrow that takes the focus when the one pressed is about to be disabled.
    const handOver = useRef<'previous' | 'next' | null>(null);

    const items = React.Children.toArray(children);
    const count = items.length;
    // The item with the tab stop; when items leave, the last one takes it.
    const tabStop = Math.min(stop, count - 1);

    const measure = useCallback(() => {
      const list = listRef.current;
      if (!list) return;
      const max = list.scrollWidth - list.clientWidth;
      const next: Edges = { fits: max <= SLACK, atStart: list.scrollLeft <= SLACK, atEnd: list.scrollLeft >= max - SLACK };
      setEdges((now) => (now.fits === next.fits && now.atStart === next.atStart && now.atEnd === next.atEnd ? now : next));
    }, []);

    // Items coming, going or changing size change how far the row scrolls; so does its width.
    useLayoutEffect(measure);
    useEffect(() => {
      const list = listRef.current;
      if (!list || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(measure);
      observer.observe(list);
      return () => observer.disconnect();
    }, [measure]);

    // An arrow pressed at the last page is disabled once the row gets there: the focus goes to the
    // other one first, as soon as it can take it, so the keyboard stays in the row.
    useLayoutEffect(() => {
      const button = handOver.current === 'previous' ? previousRef.current : handOver.current === 'next' ? nextRef.current : null;
      if (!button || button.disabled) return;
      handOver.current = null;
      // Not when the focus has gone somewhere else in the meantime.
      const active = button.ownerDocument.activeElement;
      if (active === previousRef.current || active === nextRef.current || active === button.ownerDocument.body) button.focus();
    }, [edges]);

    /** Scrolls about one page: on to the first item that is not wholly in view, or back by as many as fit. */
    const page = (direction: 1 | -1) => {
      const list = listRef.current;
      if (!list) return;
      const cells = Array.from(list.children) as HTMLElement[];
      if (!cells.length) return;
      const origin = cells[0].offsetLeft;
      const left = (cell: HTMLElement) => cell.offsetLeft - origin;
      const from = list.scrollLeft;
      const width = list.clientWidth;
      const max = list.scrollWidth - width;
      let to: number;
      if (direction > 0) {
        const cut = cells.find((cell) => left(cell) + cell.offsetWidth > from + width + SLACK);
        to = cut ? left(cut) : max;
      } else {
        // As far back as keeps the item just before the first one in view wholly in view.
        const before = cells.filter((cell) => left(cell) < from - SLACK);
        const last = before[before.length - 1];
        to = last ? left(cells.find((cell) => left(cell) >= left(last) + last.offsetWidth - width - SLACK) ?? last) : 0;
      }
      to = Math.max(0, Math.min(max, to));
      const active = list.ownerDocument.activeElement;
      if (to >= max - SLACK && active === nextRef.current) handOver.current = 'previous';
      else if (to <= SLACK && active === previousRef.current) handOver.current = 'next';
      else handOver.current = null;
      if (list.scrollTo) list.scrollTo({ left: to });
      else list.scrollLeft = to;
      measure();
    };

    const focusItem = (index: number) => {
      const cell = listRef.current?.children[index] as HTMLElement | undefined;
      if (!cell) return;
      setStop(index);
      (cell.firstElementChild as HTMLElement | null)?.focus({ preventScroll: true });
      cell.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    };

    const onKeyDown = (e: React.KeyboardEvent, index: number) => {
      // Only from the item itself: a field or a menu inside it keeps its own arrow keys.
      if (e.target !== e.currentTarget.firstElementChild || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.key === 'ArrowRight' ? index + 1 : e.key === 'ArrowLeft' ? index - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? count - 1 : null;
      if (target === null) return;
      e.preventDefault();
      if (target >= 0 && target < count && target !== index) focusItem(target);
    };

    const Heading = `h${headingLevel}` as const;
    return (
      <section ref={ref} className={cx('ps-media-row', className)} role="region" aria-labelledby={titleId} {...rest}>
        <div className="ps-media-row-header">
          <Heading className="ps-media-row-title" id={titleId}>{title}</Heading>
          {onSeeAll && (
            <TextButton className="ps-media-row-see-all" aria-describedby={titleId} onClick={onSeeAll}>{labels.seeAll}</TextButton>
          )}
          {!edges.fits && (
            <div className="ps-media-row-arrows">
              <IconButton ref={previousRef} label={labels.previous} size="sm" surface={0} disabled={edges.atStart} aria-controls={listId} aria-describedby={titleId} onClick={() => page(-1)}>
                <IconChevronLeft size={18} />
              </IconButton>
              <IconButton ref={nextRef} label={labels.next} size="sm" surface={0} disabled={edges.atEnd} aria-controls={listId} aria-describedby={titleId} onClick={() => page(1)}>
                <IconChevronRight size={18} />
              </IconButton>
            </div>
          )}
        </div>
        <ul ref={listRef} id={listId} role="list" className="ps-media-row-list" onScroll={measure}>
          {items.map((child, index) => (
            <li
              key={React.isValidElement(child) && child.key !== null ? child.key : index}
              className="ps-media-row-item"
              onFocus={(e) => { if (e.target === e.currentTarget.firstElementChild) setStop(index); }}
              onKeyDown={(e) => onKeyDown(e, index)}
            >
              {React.isValidElement<{ tabIndex?: number }>(child) ? React.cloneElement(child, { tabIndex: index === tabStop ? 0 : -1 }) : child}
            </li>
          ))}
        </ul>
      </section>
    );
  }
);
MediaRow.displayName = 'MediaRow';
