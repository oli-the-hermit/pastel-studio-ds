import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconCheck, IconChevronLeft, IconChevronRight, IconClose } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { Button } from '../Button';
import { IconButton } from '../IconButton';

export interface TourStep {
  id: string;
  /** `welcome` a card in the middle that opens the tour; `spot` a step pointing at an element; `done` the closing card. */
  kind: 'welcome' | 'spot' | 'done';
  /** The chapter a spot step belongs to (a key of `chapters`). */
  chapter?: string;
  /** The element it points at: matches a `data-tour` attribute. A step whose target isn't on screen is skipped. */
  target?: string;
  title: React.ReactNode;
  body: React.ReactNode;
  /** Called as the step starts, before its target is looked for: show the page it lives on. */
  onShow?: () => void;
}

export interface TourChapter {
  key: string;
  label: string;
}

export interface TourProps {
  open: boolean;
  /** The steps in order; the app writes them, the tour only shows them. */
  steps: TourStep[];
  /** The chapters spot steps are grouped in, shown as dots and as an overline with a count. */
  chapters?: TourChapter[];
  /** Closing: Escape, the close button, "Maybe later" or the last step's button. */
  onClose: () => void;
  /** The app's mark, on the welcome card. */
  mark?: React.ReactNode;
  labels?: LabelOverrides<'tour' | 'tourStart' | 'tourLater' | 'tourDone' | 'tourClose' | 'tourStepCount' | 'back' | 'next'>;
}

interface Box { top: number; left: number; width: number; height: number; round: boolean }
type Side = 'right' | 'left' | 'bottom' | 'top' | 'center';
interface CardPos { top: number; left: number; side: Side; arrow: number }

const GAP = 16;
const MARGIN = 16;
const SMALL_TARGET = 56;

const findTarget = (id?: string) => (id ? document.querySelector<HTMLElement>(`[data-tour="${id}"]`) : null);
const isVisible = (el: HTMLElement | null) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
};
/** A zero-size hole in the middle of the screen: the hole's shadow becomes a full scrim. */
const centerBox = (): Box => ({ top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0, round: false });

function boxFor(el: HTMLElement): Box {
  const r = el.getBoundingClientRect();
  const small = r.height <= SMALL_TARGET;
  const pad = small ? 6 : 8;
  // Keep the hole inside the viewport so tall pages don't push it off screen.
  const top = Math.max(MARGIN / 2, r.top - pad);
  const left = Math.max(MARGIN / 2, r.left - pad);
  const bottom = Math.min(window.innerHeight - MARGIN / 2, r.bottom + pad);
  const right = Math.min(window.innerWidth - MARGIN / 2, r.right + pad);
  return { top, left, width: right - left, height: bottom - top, round: small };
}

function placeCard(box: Box, cardW: number, cardH: number): CardPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const fits: Record<Exclude<Side, 'center'>, boolean> = {
    right: box.left + box.width + GAP + cardW <= vw - MARGIN,
    left: box.left - GAP - cardW >= MARGIN,
    bottom: box.top + box.height + GAP + cardH <= vh - MARGIN,
    top: box.top - GAP - cardH >= MARGIN,
  };
  const side: Side = (['right', 'left', 'bottom', 'top'] as const).find((s) => fits[s]) || 'center';
  const clampX = (x: number) => Math.min(Math.max(MARGIN, x), vw - cardW - MARGIN);
  const clampY = (y: number) => Math.min(Math.max(MARGIN, y), vh - cardH - MARGIN);
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  let top: number;
  let left: number;
  let arrow = 0;
  if (side === 'right' || side === 'left') {
    left = side === 'right' ? box.left + box.width + GAP : box.left - GAP - cardW;
    // Align with the top of big targets, centre on small ones.
    top = clampY(box.height > cardH ? box.top : cy - cardH / 2);
    arrow = Math.min(Math.max(20, cy - top), cardH - 20);
    if (box.height > cardH) arrow = Math.min(28, cardH - 20);
  } else if (side === 'bottom' || side === 'top') {
    top = side === 'bottom' ? box.top + box.height + GAP : box.top - GAP - cardH;
    left = clampX(cx - cardW / 2);
    arrow = Math.min(Math.max(20, cx - left), cardW - 20);
  } else {
    // The target fills the screen: float the card over its bottom-right corner.
    top = clampY(vh - cardH - MARGIN * 2);
    left = clampX(vw - cardW - MARGIN * 2);
  }
  return { top, left, side, arrow };
}

/**
 * A guided tour: a welcome card, steps that spotlight elements across the app (each pointed at by
 * its `data-tour` attribute), and a closing card. Everything outside the spotlight is dimmed and
 * inert. The arrow keys move, Enter continues, Escape closes, and Tab stays in the card.
 */
export function Tour({ open, steps, chapters = [], onClose, mark, labels: ownLabels }: TourProps) {
  const labels = useLabels(ownLabels);
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box>(centerBox);
  const [cardPos, setCardPos] = useState<CardPos | null>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const direction = useRef<1 | -1>(1);
  const step = steps[Math.min(index, steps.length - 1)];
  const isSpot = step?.kind === 'spot';

  // Start from the first step each time the tour opens.
  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setBox(centerBox());
    setTarget(null);
  }, [open]);

  const measure = useCallback((el: HTMLElement | null) => setBox(el && isVisible(el) ? boxFor(el) : centerBox()), []);

  // Show the step's page, wait for its target to have a size, then spotlight it.
  useEffect(() => {
    if (!open || !step) return;
    if (!isSpot) {
      setTarget(null);
      setBox(centerBox());
      return;
    }
    step.onShow?.();
    // Timers rather than animation frames, which pause while the window isn't painting.
    let timer = 0;
    let tries = 0;
    const seek = () => {
      const el = findTarget(step.target);
      if (isVisible(el)) {
        el!.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        setTarget(el);
        measure(el);
        return;
      }
      // About half a second (page transitions take 260ms); a missing target skips the step.
      if (++tries > 30) {
        setIndex(Math.max(0, Math.min(steps.length - 1, index + direction.current)));
        return;
      }
      timer = window.setTimeout(seek, 16);
    };
    timer = window.setTimeout(seek, 16);
    return () => window.clearTimeout(timer);
    // The step is read through the index; its object may be rebuilt on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  // Follow the target when the window resizes or the content shifts.
  useEffect(() => {
    if (!open) return;
    const onChange = () => measure(target);
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    const ro = target && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onChange) : null;
    if (target) ro?.observe(target);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
      ro?.disconnect();
    };
  }, [open, target, measure]);

  // Place the card next to the hole once both sizes are known.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!open || !card) return;
    if (!isSpot) {
      setCardPos(null);
      return;
    }
    if (box.width === 0) return;
    setCardPos(placeCard(box, card.offsetWidth, card.offsetHeight));
  }, [open, isSpot, box, index]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => nextRef.current?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(t);
  }, [open, index]);

  const go = useCallback((delta: 1 | -1) => {
    direction.current = delta;
    setIndex((i) => Math.max(0, Math.min(steps.length - 1, i + delta)));
  }, [steps.length]);

  // Captured, so the app's own shortcuts and anything underneath never see these keys.
  useEffect(() => {
    if (!open) return;
    const next = () => (index < steps.length - 1 ? go(1) : onClose());
    const onKey = (e: KeyboardEvent) => {
      const onButton = (e.target as HTMLElement)?.tagName === 'BUTTON';
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Enter' && !onButton) next();
      else if (e.key === 'Tab') {
        const list = Array.from(cardRef.current?.querySelectorAll<HTMLElement>('button') || []);
        if (list.length) {
          const i = list.indexOf(document.activeElement as HTMLElement);
          list[e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : (i + 1) % list.length].focus();
        }
      } else if ((e.key === 'Enter' || e.key === ' ') && onButton) {
        // Let the focused button click itself.
        e.stopPropagation();
        return;
      } else {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, index, steps.length, go, onClose]);

  const chapterInfo = useMemo(() => {
    if (!step?.chapter) return null;
    const inChapter = steps.filter((s) => s.chapter === step.chapter);
    return { name: chapters.find((c) => c.key === step.chapter)?.label ?? '', current: inChapter.indexOf(step) + 1, total: inChapter.length };
  }, [step, steps, chapters]);

  if (!open || !step) return null;
  const isLast = index === steps.length - 1;
  const cardStyle: React.CSSProperties = isSpot
    ? cardPos
      ? ({ top: cardPos.top, left: cardPos.left, '--ps-tour-arrow': `${cardPos.arrow}px` } as React.CSSProperties)
      : { top: -9999, left: -9999 }
    : {};

  return createPortal(
    <div className="ps-tour" role="dialog" aria-modal="true" aria-label={labels.tour}>
      <div
        className={cx('ps-tour-hole', box.round && 'is-round')}
        style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
        aria-hidden="true"
      />
      <div
        ref={cardRef}
        key={step.id}
        className={cx('ps-tour-card', isSpot ? `is-spot is-side-${cardPos?.side ?? 'center'}` : 'is-center')}
        style={cardStyle}
      >
        <IconButton label={labels.tourClose} size="sm" className="ps-tour-close" onClick={onClose}>
          <IconClose size={16} />
        </IconButton>
        {!isSpot && (
          <span className={cx('ps-tour-badge', step.kind === 'done' && 'is-done')} aria-hidden="true">
            {step.kind === 'done' ? <IconCheck size={26} strokeWidth={2.6} /> : mark}
          </span>
        )}
        {chapterInfo && (
          <div className="ps-tour-meta">
            <span className="ps-overline">{chapterInfo.name}</span>
            <span className="ps-tour-count">
              {labels.tourStepCount.replace('{current}', String(chapterInfo.current)).replace('{total}', String(chapterInfo.total))}
            </span>
          </div>
        )}
        <h2 className="ps-tour-title">{step.title}</h2>
        <p className="ps-tour-body" aria-live="polite">{step.body}</p>
        <div className="ps-tour-footer">
          {isSpot && chapters.length > 0 && (
            <div className="ps-tour-dots" aria-hidden="true">
              {chapters.map((c) => <span key={c.key} className={cx('ps-tour-dot', c.key === step.chapter && 'is-current')} />)}
            </div>
          )}
          <div className="ps-tour-actions">
            {step.kind === 'welcome' ? (
              <Button surface={3} onClick={onClose}>{labels.tourLater}</Button>
            ) : (
              <Button surface={3} icon={<IconChevronLeft size={16} />} onClick={() => go(-1)}>{labels.back}</Button>
            )}
            <Button
              ref={nextRef}
              variant="primary"
              trailingIcon={!isLast && step.kind !== 'welcome' ? <IconChevronRight size={16} /> : undefined}
              onClick={() => (isLast ? onClose() : go(1))}
            >
              {step.kind === 'welcome' ? labels.tourStart : isLast ? labels.tourDone : labels.next}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
