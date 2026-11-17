import React, { forwardRef, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconClose, IconStop } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { formatBytes, formatDateTime, formatTimeLeft } from '../../lib/format';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { IconButton } from '../IconButton';
import { ProgressBar } from '../ProgressBar';
import { TextButton } from '../TextButton';

/** Where a transfer is: in line, counting what it has to do, copying, asking about a name, or over. */
export type TransferState = 'queued' | 'sizing' | 'running' | 'waiting' | 'done' | 'failed' | 'cancelled';

/** How to settle a name that is already taken at the destination. */
export type ConflictChoice = 'replace' | 'skip' | 'keep_both';

export interface TransferConflict {
  /** The name taken at the destination. */
  name: string;
  incoming: { size: number; modified?: string };
  existing: { size: number; modified?: string };
  /** How many more clashes there are likely to be, for "Do this for the rest". */
  remaining?: number;
}

type TransferWord =
  | 'transferStop' | 'transferWaiting' | 'transferCounting' | 'transferBytesOf' | 'transferTimeLeft' | 'transferSpeed'
  | 'transferExists' | 'transferIncoming' | 'transferExisting' | 'transferReplace' | 'transferSkip' | 'transferKeepBoth'
  | 'transferForRest' | 'transferErrors';

export interface TransferRowProps {
  /** What it does and where: "Copying 48 files to Art". */
  title: string;
  state: TransferState;
  /** The file being copied now. */
  current?: string;
  doneBytes?: number;
  totalBytes?: number;
  bytesPerSecond?: number;
  secondsLeft?: number;
  /** How it ended, for a finished row: "Done", "Stopped after 12 of 48". */
  result?: React.ReactNode;
  /** One line per file that didn't make it. */
  errors?: string[];
  conflict?: TransferConflict;
  onStop?: () => void;
  onResolve?: (choice: ConflictChoice, forTheRest: boolean) => void;
  /** Takes a finished row away. */
  onDismiss?: () => void;
  labels?: LabelOverrides<TransferWord | 'close'>;
}

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));

const finished = (state: TransferState) => state === 'done' || state === 'failed' || state === 'cancelled';

/**
 * One copy, move or upload: what and where, a progress bar, how much of how much with the time
 * left and the speed, and a Stop button. When a name is taken it asks what to do, with "Do this
 * for the rest". Finished, it says how it went and lists what went wrong.
 */
export function TransferRow({
  title, state, current, doneBytes = 0, totalBytes = 0, bytesPerSecond, secondsLeft, result, errors = [], conflict,
  onStop, onResolve, onDismiss, labels: ownLabels,
}: TransferRowProps) {
  const labels = useLabels(ownLabels);
  const [forTheRest, setForTheRest] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const over = finished(state);
  const percent = totalBytes > 0 ? Math.min(100, (doneBytes / totalBytes) * 100) : 0;
  const status = state === 'done' ? 'completed' : state === 'failed' ? 'failed' : state === 'queued' || state === 'sizing' ? 'starting' : 'processing';

  const facts: string[] = [];
  if (state === 'queued') facts.push(labels.transferWaiting);
  else if (state === 'sizing') facts.push(labels.transferCounting);
  else if (!over && totalBytes > 0) {
    facts.push(fill(labels.transferBytesOf, { done: formatBytes(doneBytes), total: formatBytes(totalBytes) }));
    facts.push(`${Math.floor(percent)}%`);
    if (state === 'running' && secondsLeft !== undefined && secondsLeft > 0) facts.push(fill(labels.transferTimeLeft, { time: formatTimeLeft(secondsLeft) }));
    if (state === 'running' && bytesPerSecond) facts.push(fill(labels.transferSpeed, { speed: formatBytes(bytesPerSecond) }));
  }

  return (
    <div className={cx('ps-transfer-row', `is-${state}`)} aria-busy={!over || undefined}>
      <div className="ps-transfer-row-head">
        <span className="ps-transfer-row-title">{title}</span>
        {!over && onStop && (
          <IconButton size="xs" label={labels.transferStop} onClick={onStop}>
            <IconStop size={12} />
          </IconButton>
        )}
        {over && onDismiss && (
          <IconButton size="xs" label={labels.close} onClick={onDismiss}>
            <IconClose size={12} />
          </IconButton>
        )}
      </div>
      {!over && <ProgressBar value={percent} status={status} label={title} />}
      {!over && current && state === 'running' && <span className="ps-transfer-row-current">{current}</span>}
      {facts.length > 0 && <span className="ps-transfer-row-facts">{facts.join(' · ')}</span>}
      {over && result && <span className="ps-transfer-row-result">{result}</span>}

      {state === 'waiting' && conflict && (
        <div className="ps-transfer-conflict" role="group" aria-label={fill(labels.transferExists, { name: conflict.name })}>
          <span className="ps-transfer-conflict-title">{fill(labels.transferExists, { name: conflict.name })}</span>
          <dl className="ps-transfer-conflict-files">
            <dt>{labels.transferIncoming}</dt>
            <dd>{[formatBytes(conflict.incoming.size), conflict.incoming.modified && formatDateTime(conflict.incoming.modified)].filter(Boolean).join(' · ')}</dd>
            <dt>{labels.transferExisting}</dt>
            <dd>{[formatBytes(conflict.existing.size), conflict.existing.modified && formatDateTime(conflict.existing.modified)].filter(Boolean).join(' · ')}</dd>
          </dl>
          {!!conflict.remaining && (
            <label className="ps-transfer-conflict-rest">
              <Checkbox checked={forTheRest} onChange={setForTheRest} />
              {fill(labels.transferForRest, { count: conflict.remaining })}
            </label>
          )}
          <div className="ps-transfer-conflict-actions">
            <Button size="sm" variant="tonal" onClick={() => onResolve?.('keep_both', forTheRest)}>{labels.transferKeepBoth}</Button>
            <Button size="sm" onClick={() => onResolve?.('skip', forTheRest)}>{labels.transferSkip}</Button>
            <Button size="sm" variant="danger" onClick={() => onResolve?.('replace', forTheRest)}>{labels.transferReplace}</Button>
          </div>
        </div>
      )}

      {over && errors.length > 0 && (
        <>
          <TextButton className="ps-transfer-row-errors-toggle" aria-expanded={showErrors} onClick={() => setShowErrors((s) => !s)}>
            {labels.transferErrors} ({errors.length})
          </TextButton>
          {showErrors && (
            <ul className="ps-transfer-row-errors">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export interface TransferCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** How many are still going, shown after the title. */
  activeCount: number;
  /** Folded to its header. */
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  /** Hides the card; the transfers keep going. */
  onHide: () => void;
  /** Takes every finished row away; shown when there are some. */
  onClearFinished?: () => void;
  /** The TransferRows, newest last. */
  children: React.ReactNode;
  labels?: LabelOverrides<'transfers' | 'transferClearFinished' | 'transferCollapse' | 'transferExpand' | 'transferHide'>;
}

/**
 * The transfers under way, in a card that floats over the corner of the window: copies, moves and
 * uploads, each a TransferRow. It folds to its header and hides; neither stops a transfer.
 */
export const TransferCard = forwardRef<HTMLElement, TransferCardProps>(
  ({ activeCount, collapsed, onCollapsedChange, onHide, onClearFinished, children, labels: ownLabels, className, ...rest }, ref) => {
    const labels = useLabels(ownLabels);
    return (
      <section
        ref={ref}
        className={cx('ps-transfer-card', collapsed && 'is-collapsed', className)}
        aria-label={labels.transfers}
        {...rest}
      >
        <header className="ps-transfer-card-head">
          <h2 className="ps-transfer-card-title">
            {labels.transfers}
            {activeCount > 0 && <span className="ps-transfer-card-count">{activeCount}</span>}
          </h2>
          {onClearFinished && !collapsed && (
            <TextButton className="ps-transfer-card-clear" onClick={onClearFinished}>
              {labels.transferClearFinished}
            </TextButton>
          )}
          <IconButton size="xs" label={collapsed ? labels.transferExpand : labels.transferCollapse} aria-expanded={!collapsed} onClick={() => onCollapsedChange(!collapsed)}>
            {collapsed ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          </IconButton>
          <IconButton size="xs" label={labels.transferHide} onClick={onHide}>
            <IconClose size={14} />
          </IconButton>
        </header>
        {!collapsed && <div className="ps-transfer-card-list">{children}</div>}
      </section>
    );
  }
);
TransferCard.displayName = 'TransferCard';

export interface TransferIndicatorProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** 0–1 across everything going on; undefined while nothing has a size yet. */
  progress?: number;
  /** How many transfers are going. */
  count: number;
  /** Something needs an answer (a name is taken): the ring takes the warning color. */
  attention?: boolean;
  /** Its name and tooltip: "Transfers". */
  label: string;
  description?: React.ReactNode;
}

/** The top bar's button for the transfers: a ring of overall progress around their count. */
export const TransferIndicator = forwardRef<HTMLButtonElement, TransferIndicatorProps>(
  ({ progress, count, attention = false, label, description, className, ...rest }, ref) => {
    const r = 13;
    const circumference = 2 * Math.PI * r;
    const known = progress !== undefined;
    const value = known ? Math.min(1, Math.max(0, progress)) : 0.25;
    return (
      <IconButton
        ref={ref}
        label={label}
        description={description}
        className={cx('ps-transfer-indicator', !known && 'is-indeterminate', attention && 'is-attention', className)}
        {...rest}
      >
        <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
          <circle className="ps-transfer-indicator-track" cx="16" cy="16" r={r} />
          <circle
            className="ps-transfer-indicator-fill"
            cx="16"
            cy="16"
            r={r}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value)}
          />
        </svg>
        <span className="ps-transfer-indicator-count">{count}</span>
      </IconButton>
    );
  }
);
TransferIndicator.displayName = 'TransferIndicator';
