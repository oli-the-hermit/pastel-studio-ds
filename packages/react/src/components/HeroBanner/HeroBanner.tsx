import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { mergeRefs } from '../../lib/mergeRefs';
import { useControllable } from '../../lib/useControllable';
import { useKeepFocus } from '../../lib/useListFocus';
import { IconButton } from '../IconButton';

export interface HeroBannerItem {
  id: string;
  /** A short line above the title, in capitals: why it is suggested, e.g. "Continue watching". */
  overline?: string;
  title: string;
  /** Short facts under the title, joined with a middle dot: "Season 1 · Episode 3", "48 min". */
  facts?: string[];
  /** A few sentences about it; cut off after three lines. */
  summary?: string;
  /** A picture that covers the banner, fading out behind the text so it stays readable. */
  image?: string;
  /** Its buttons, e.g. a primary "Play" and a quieter "Details". */
  actions?: React.ReactNode;
}

export interface HeroBannerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'role'> {
  /** What to suggest, one at a time. At most six are shown; any more are ignored. */
  items: HeroBannerItem[];
  /** The item in view, for a banner the app controls. Leave it out and the banner keeps it, starting at the first. */
  index?: number;
  onIndexChange?: (index: number) => void;
  /**
   * Moves to the next item every so many milliseconds, e.g. `8000`; off by default. It waits
   * while the pointer is over the banner or the focus is in it, and never runs with reduced motion.
   */
  autoAdvance?: number | false;
  /** The banner's accessible name, e.g. "Suggested". */
  ariaLabel: string;
  /** The level of each item's title on the page (default 2). */
  headingLevel?: 2 | 3 | 4;
  labels?: LabelOverrides<'previous' | 'next' | 'carousel' | 'slideOf'>;
}

/** The most items a banner shows: more dots than this stop being readable at a glance. */
const MAX_ITEMS = 6;
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
/** Arrow keys that belong to the control they are pressed on, not to the banner. */
const OWN_ARROWS = 'input, textarea, select, [contenteditable="true"], [role="slider"], [role="radio"], [role="tab"], [role="menuitem"], [role="option"]';

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(REDUCED_MOTION).matches);
  useEffect(() => {
    const query = window.matchMedia?.(REDUCED_MOTION);
    if (!query) return;
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return reduced;
}

/**
 * A large banner that suggests one thing at a time: an overline, a title, a few facts, a summary
 * and its buttons, over a picture. With several items it is a carousel: dots show where it is,
 * Previous and Next (and ← → while the focus is in it) move between them, round and round.
 */
export const HeroBanner = forwardRef<HTMLElement, HeroBannerProps>(
  (
    { items, index, onIndexChange, autoAdvance = false, ariaLabel, headingLevel = 2, labels: ownLabels, className, onKeyDown, onFocus, onBlur, onPointerEnter, onPointerLeave, ...rest },
    ref
  ) => {
    const labels = useLabels(ownLabels);
    const slidesId = useId();
    const rootRef = useRef<HTMLElement | null>(null);
    const setRoot = useMemo(() => mergeRefs(ref, rootRef), [ref]);
    const [inner, setIndex] = useControllable(index, 0, onIndexChange);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [failed, setFailed] = useState<string | null>(null);
    const reducedMotion = useReducedMotion();
    // The buttons of the item that leaves take the focus with them: it stays in the banner.
    const keepFocus = useKeepFocus(rootRef, 0, () => null);

    const shown = items.slice(0, MAX_ITEMS);
    const count = shown.length;
    const current = Math.min(Math.max(0, Math.trunc(inner) || 0), Math.max(0, count - 1));
    const several = count > 1;
    const running = several && typeof autoAdvance === 'number' && autoAdvance > 0 && !hovered && !focused && !reducedMotion;

    useEffect(() => {
      if (!running) return;
      const timer = window.setInterval(() => setIndex((current + 1) % count), autoAdvance as number);
      return () => window.clearInterval(timer);
    }, [running, autoAdvance, current, count, setIndex]);

    if (!count) return null;
    const item = shown[current];
    const image = item.image && failed !== item.image ? item.image : undefined;
    const go = (step: 1 | -1) => setIndex((current + step + count) % count);
    const Title = `h${headingLevel}` as const;

    return (
      <section
        ref={setRoot}
        className={cx('ps-hero-banner', image && 'is-pictured', className)}
        aria-roledescription={labels.carousel}
        aria-label={ariaLabel}
        tabIndex={-1}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented || !several || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          if ((e.target as HTMLElement).closest(OWN_ARROWS)) return;
          e.preventDefault();
          go(e.key === 'ArrowRight' ? 1 : -1);
        }}
        onFocus={(e) => {
          onFocus?.(e);
          keepFocus.onFocus();
          setFocused(true);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          keepFocus.onBlur(e);
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
        onPointerEnter={(e) => {
          onPointerEnter?.(e);
          setHovered(true);
        }}
        onPointerLeave={(e) => {
          onPointerLeave?.(e);
          setHovered(false);
        }}
        {...rest}
      >
        {/* Read out when the item changes by hand; left alone while it changes by itself. */}
        <div className="ps-hero-banner-slides" id={slidesId} aria-live={running ? 'off' : 'polite'}>
          <div
            key={item.id}
            className="ps-hero-banner-slide"
            role="group"
            aria-label={labels.slideOf.replace('{current}', String(current + 1)).replace('{total}', String(count))}
          >
            {image && <img className="ps-hero-banner-image" src={image} alt="" draggable={false} onError={() => setFailed(image)} />}
            <div className="ps-hero-banner-text">
              {item.overline && <p className="ps-hero-banner-overline">{item.overline}</p>}
              <Title className="ps-hero-banner-title">{item.title}</Title>
              {!!item.facts?.length && <p className="ps-hero-banner-facts">{item.facts.join(' · ')}</p>}
              {item.summary && <p className="ps-hero-banner-summary">{item.summary}</p>}
              {item.actions && <div className="ps-hero-banner-actions">{item.actions}</div>}
            </div>
          </div>
        </div>
        {several && (
          <div className="ps-hero-banner-controls">
            <div className="ps-hero-banner-dots" aria-hidden="true">
              {shown.map((each, i) => <span key={each.id} className={cx('ps-hero-banner-dot', i === current && 'is-current')} />)}
            </div>
            <IconButton label={labels.previous} size="sm" surface={image ? 'overlay' : 2} aria-controls={slidesId} onClick={() => go(-1)}>
              <IconChevronLeft size={18} />
            </IconButton>
            <IconButton label={labels.next} size="sm" surface={image ? 'overlay' : 2} aria-controls={slidesId} onClick={() => go(1)}>
              <IconChevronRight size={18} />
            </IconButton>
          </div>
        )}
      </section>
    );
  }
);
HeroBanner.displayName = 'HeroBanner';
