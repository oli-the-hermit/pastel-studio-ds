import React, { forwardRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { Chip } from '../Chip';

export interface TitleHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The title's name: the header's heading. */
  title: string;
  /** A short line above the title, in capitals: the kind of title, e.g. "Film", "Series". */
  overline?: string;
  /** Short facts under the title, joined with a middle dot: "2001", "1 h 52 min", "Drama, Mystery". */
  facts?: string[];
  /**
   * A score as a chip beside the facts: `value` "7.8" after `source` "IMDb". `label` is what a
   * screen reader says in place of the two: "IMDb rating 7.8 out of 10".
   */
  rating?: { value: string; source?: string; label?: string };
  /** The overview: the whole text, at a readable measure. */
  summary?: string;
  /**
   * A wide picture behind the header. It shows above the text and beside it, has faded out
   * where the text is and fades toward the lower edge, so the text stays on the page's own
   * surface. Without one, or when it fails to load, nothing is behind.
   */
  backdrop?: string;
  /** A 2:3 picture beside the text. */
  poster?: string;
  /** Shown in the poster's place when there is no poster or it fails: the kind of title, e.g. `<IconFileVideo />`. */
  icon?: React.ReactNode;
  /** Its buttons: Play, Resume, Start over. */
  actions?: React.ReactNode;
  /** The level of the title on the page (default 2). */
  headingLevel?: 1 | 2 | 3;
  /** A last line under the actions: a quiet link, a note. */
  children?: React.ReactNode;
}

const NONE: ReadonlySet<string> = new Set();
const given = (node: React.ReactNode) => node !== undefined && node !== null && node !== false && node !== '';

/**
 * The head of a film or series page: a poster beside the kind, the title, a few facts with a
 * rating, the overview and the buttons, over a wide picture that fades into the page.
 */
export const TitleHeader = forwardRef<HTMLElement, TitleHeaderProps>(
  ({ title, overline, facts, rating, summary, backdrop, poster, icon, actions, headingLevel = 2, className, children, ...rest }, ref) => {
    // A picture that failed is not asked for again; another address is.
    const [failed, setFailed] = useState(NONE);
    const fail = (address: string) => setFailed((now) => (now.has(address) ? now : new Set(now).add(address)));
    const behind = backdrop && !failed.has(backdrop) ? backdrop : undefined;
    const beside = poster && !failed.has(poster) ? poster : undefined;
    const hasPoster = beside !== undefined || given(icon);
    const Title = `h${headingLevel}` as const;
    return (
      <header ref={ref} className={cx('ps-title-header', hasPoster && 'ps-title-header--poster', behind && 'is-backdropped', className)} {...rest}>
        {behind && (
          <div className="ps-title-header-backdrop">
            <img src={behind} alt="" draggable={false} onError={() => fail(behind)} />
          </div>
        )}
        <div className="ps-title-header-body">
          {hasPoster && (
            <div className="ps-title-header-poster">
              {beside ? <img src={beside} alt="" draggable={false} onError={() => fail(beside)} /> : <span className="ps-title-header-icon">{icon}</span>}
            </div>
          )}
          <div className="ps-title-header-text">
            {overline && <p className="ps-title-header-overline">{overline}</p>}
            <Title className="ps-title-header-title">{title}</Title>
            {(!!facts?.length || rating) && (
              <div className="ps-title-header-facts">
                {!!facts?.length && <span>{facts.join(' · ')}</span>}
                {rating && (
                  <Chip className="ps-title-header-rating" role={rating.label ? 'img' : undefined} aria-label={rating.label}>
                    {rating.source && <span className="ps-title-header-rating-source">{rating.source}</span>}
                    {/* The space keeps the two apart when they are read; a flex container draws none of it. */}
                    {rating.source && ' '}
                    <span className="ps-title-header-rating-value">{rating.value}</span>
                  </Chip>
                )}
              </div>
            )}
            {summary && <p className="ps-title-header-summary">{summary}</p>}
            {given(actions) && <div className="ps-title-header-actions">{actions}</div>}
            {given(children) && <div className="ps-title-header-note">{children}</div>}
          </div>
        </div>
      </header>
    );
  }
);
TitleHeader.displayName = 'TitleHeader';
