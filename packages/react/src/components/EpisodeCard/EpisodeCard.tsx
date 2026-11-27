import React, { forwardRef, useId } from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { TitlePicture } from '../TitleTile/TitlePicture';

export interface EpisodeCardProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  /** The episode's name: "Secrets". One line, cut off with an ellipsis. */
  title: string;
  /** A short line above the title: which episode it is, e.g. "Episode 3". */
  overline?: string;
  /** How long it is, at the end of the overline's line: "48 min". */
  length?: string;
  /** What happens in it; cut off after two lines. */
  summary?: string;
  /** A 16:9 picture's address; it is cropped to fill. Without one, or when it fails, `icon` sits on a quiet surface. */
  image?: string;
  /** Shown in place of a picture, e.g. `<IconFileVideo />`. */
  icon?: React.ReactNode;
  /** How far it has been played, 0 to 1: a thin bar along the picture's lower edge. Not shown when undefined or 0. */
  progress?: number;
  /** A check at the picture's top right: played to the end. */
  watched?: boolean;
  /** The episode that is playing: an accent ring and name, and `aria-current`. */
  current?: boolean;
  /**
   * Why the episode can't be played, in a few words: "Can't find this file". The picture is dimmed
   * under a warning mark and the reason takes the summary's place. The card stays a button, so a
   * click can open the way to fix it.
   */
  unavailable?: string;
  labels?: LabelOverrides<'watched'>;
}

/**
 * One episode as a button: a 16:9 picture over its number and length, its title and two lines of
 * its summary. Every card is as wide as `--ps-episode-card-width`, so they line up in a MediaRow.
 * Defaults to `type="button"`.
 */
export const EpisodeCard = forwardRef<HTMLButtonElement, EpisodeCardProps>(
  (
    {
      title, overline, length, summary, image, icon, progress, watched = false, current = false, unavailable, labels: ownLabels, className, type = 'button',
      'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy, ...rest
    },
    ref
  ) => {
    const labels = useLabels(ownLabels);
    const id = useId();
    const ids = { overline: `${id}-overline`, title: `${id}-title`, length: `${id}-length`, watched: `${id}-watched`, reason: `${id}-reason`, summary: `${id}-summary` };
    // What tells episodes apart is the name: which one, its title, its length, and whether it was
    // watched or can't be played. The summary is the description, read after the name, so a row
    // of cards can be gone through quickly. A name given from outside replaces the card's own.
    const ownName = [overline && ids.overline, ids.title, length && ids.length, watched && ids.watched, unavailable && ids.reason].filter(Boolean).join(' ');
    const named = ariaLabel !== undefined || labelledBy !== undefined;
    const described = [describedBy, !unavailable && summary && ids.summary].filter(Boolean).join(' ');
    return (
      <button
        ref={ref}
        type={type}
        className={cx('ps-episode-card', current && 'is-current', unavailable && 'is-unavailable', className)}
        aria-current={current ? 'true' : undefined}
        aria-label={ariaLabel}
        aria-labelledby={named ? labelledBy : ownName}
        aria-describedby={described || undefined}
        {...rest}
      >
        <TitlePicture image={image} icon={icon} progress={progress} watched={watched} watchedLabel={labels.watched} watchedId={ids.watched} unavailable={!!unavailable} />
        {(overline || length) && (
          <span className="ps-episode-card-meta">
            {overline && <span id={ids.overline} className="ps-episode-card-overline">{overline}</span>}
            {length && <span id={ids.length} className="ps-episode-card-length">{length}</span>}
          </span>
        )}
        <span id={ids.title} className="ps-episode-card-title">{title}</span>
        {unavailable ? (
          <span id={ids.reason} className="ps-episode-card-summary">{unavailable}</span>
        ) : (
          summary && <span id={ids.summary} className="ps-episode-card-summary">{summary}</span>
        )}
      </button>
    );
  }
);
EpisodeCard.displayName = 'EpisodeCard';
