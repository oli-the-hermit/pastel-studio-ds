import React, { forwardRef, useId, useState } from 'react';
import { IconClose, IconGrip, IconPlaylistAdd, IconShuffle, IconTrash } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { formatDuration, formatTime } from '../../lib/format';
import type { Track } from '../../lib/types';
import { useControllable } from '../../lib/useControllable';
import { Card, PanelHeader } from '../Card';
import { CoverArt } from '../CoverArt';
import { Equalizer } from '../Equalizer';
import { IconButton } from '../IconButton';
import { Menu, tidyMenuItems } from '../Menu';
import { SegmentedControl } from '../SegmentedControl';
import { useSortable, type SortableItemProps } from '../SortableList';
import { Switch } from '../Switch';
import { TrackInfo } from '../TrackInfo';

export type PlayQueueTab = 'next' | 'history';

type PlayQueueWords =
  | 'queue' | 'upNext' | 'history' | 'nowPlaying' | 'nextFrom' | 'queueEmpty' | 'historyEmpty' | 'queueActions'
  | 'shuffleQueue' | 'saveAsPlaylist' | 'clearQueue' | 'autoplay' | 'autoplayHint' | 'closeQueue' | 'removeFromQueue' | 'dragToReorder' | 'movedTo';

interface RowProps {
  track: Track;
  active?: boolean;
  playing?: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  drag?: SortableItemProps;
  dragLabel?: string;
  isDragging?: boolean;
  isDragOver?: boolean;
}

/** One queued track: grip, cover, title and artist, its length, and a remove tool on hover. */
function Row({ track, active, playing, onSelect, onRemove, removeLabel, drag, dragLabel, isDragging, isDragOver }: RowProps) {
  return (
    <li
      className={cx('ps-play-queue-row', drag && 'ps-play-queue-row--reorderable', active && 'is-active', track.unavailable && 'is-unavailable', isDragging && 'is-dragging', isDragOver && 'is-drag-over')}
      tabIndex={0}
      aria-current={active ? 'true' : undefined}
      onClick={onSelect}
      {...drag}
      onKeyDown={(e) => {
        drag?.onKeyDown(e);
        if (e.defaultPrevented) return;
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {drag && <IconGrip className="ps-play-queue-row-grip" title={dragLabel} />}
      <CoverArt size="xs" src={track.cover} badge={active ? <Equalizer playing={playing} size={16} /> : undefined} />
      {/* A track that can't be played says why where its artist was. */}
      <TrackInfo title={track.title} artist={track.unavailable || track.artist} size="sm" className="ps-play-queue-row-info" />
      <span className="ps-play-queue-row-time">{formatTime(track.duration)}</span>
      {onRemove && !active && (
        <span className="ps-play-queue-row-tools">
          <IconButton label={removeLabel ?? ''} size="xs" surface={3} onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            <IconClose size={15} />
          </IconButton>
        </span>
      )}
    </li>
  );
}

export interface PlayQueueProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onPlay'> {
  /** The track loaded in the player. */
  current?: Track;
  playing?: boolean;
  upNext: Track[];
  history?: Track[];
  /** Where the queue comes from: "Midnight Static" reads "Next from Midnight Static". */
  source?: string;
  /** Plays a track from a list. */
  onPlay: (track: Track, list: PlayQueueTab) => void;
  /**
   * A click, Enter or Space on a track with `unavailable`, in place of `onPlay`: the way to fix
   * it, e.g. a page to find the file.
   */
  onUnavailable?: (track: Track) => void;
  /** Shows a remove tool on each row of Up next. */
  onRemove?: (track: Track) => void;
  /** Makes Up next reorderable: move `sourceId` to where `targetId` is. */
  onReorder?: (sourceId: string, targetId: string) => void;
  onClear?: () => void;
  onSaveAsPlaylist?: () => void;
  onShuffle?: () => void;
  /** A switch at the bottom that keeps music going when the queue ends. */
  autoplay?: { value: boolean; onChange: (value: boolean) => void };
  /** Shows a close button in the header. */
  onClose?: () => void;
  /** The tab shown; leave it out to let the panel own it from `defaultTab`. */
  tab?: PlayQueueTab;
  defaultTab?: PlayQueueTab;
  onTabChange?: (tab: PlayQueueTab) => void;
  labels?: LabelOverrides<PlayQueueWords>;
}

/** The play queue as a side card: now playing, up next (reorder, remove) and history, with the queue's actions. */
export const PlayQueue = forwardRef<HTMLElement, PlayQueueProps>(
  (
    {
      current,
      playing,
      upNext,
      history = [],
      source,
      onPlay,
      onUnavailable,
      onRemove,
      onReorder,
      onClear,
      onSaveAsPlaylist,
      onShuffle,
      autoplay,
      onClose,
      tab,
      defaultTab = 'next',
      onTabChange,
      labels: ownLabels,
      className,
      ...rest
    },
    ref
  ) => {
    const labels = useLabels(ownLabels);
    const titleId = useId();
    const [shown, setShown] = useControllable<PlayQueueTab>(tab, defaultTab, onTabChange);
    // Where a track went after Alt + ↑ / ↓, for a screen reader: the move itself is silent.
    const [announcement, setAnnouncement] = useState('');
    const sortable = useSortable({
      ids: upNext.map((t) => t.id),
      onReorder: onReorder ?? (() => {}),
      onKeyboardMove: (_, index) =>
        setAnnouncement(labels.movedTo.replace('{position}', String(index + 1)).replace('{total}', String(upNext.length))),
    });
    const remaining = upNext.reduce((sum, t) => sum + t.duration, 0);
    const select = (track: Track, list: PlayQueueTab) => (track.unavailable ? onUnavailable?.(track) : onPlay(track, list));
    const menu = tidyMenuItems([
      onShuffle && { key: 'shuffle', label: labels.shuffleQueue, icon: <IconShuffle size={16} />, onSelect: onShuffle },
      onSaveAsPlaylist && { key: 'save', label: labels.saveAsPlaylist, icon: <IconPlaylistAdd size={16} />, onSelect: onSaveAsPlaylist },
      onClear && { key: 'divider', divider: true },
      onClear && { key: 'clear', label: labels.clearQueue, icon: <IconTrash size={16} />, danger: true, disabled: upNext.length === 0, onSelect: onClear },
    ]);

    return (
      <Card ref={ref} as="aside" padding="none" className={cx('ps-play-queue', className)} aria-labelledby={titleId} {...rest}>
        <div className="ps-play-queue-head">
          <PanelHeader
            title={labels.queue}
            titleId={titleId}
            action={
              <span className="ps-play-queue-head-tools">
                {menu.length > 0 && <Menu ariaLabel={labels.queueActions} items={menu} triggerSize="sm" />}
                {onClose && (
                  <IconButton label={labels.closeQueue} size="sm" onClick={onClose}>
                    <IconClose size={17} />
                  </IconButton>
                )}
              </span>
            }
          />
          <SegmentedControl<PlayQueueTab>
            ariaLabel={labels.queue}
            surface={1}
            value={shown}
            onChange={setShown}
            options={[
              { value: 'next', label: labels.upNext },
              { value: 'history', label: labels.history },
            ]}
          />
        </div>

        <div className="ps-play-queue-body">
          {shown === 'next' ? (
            <>
              {current && (
                <section className="ps-play-queue-section" aria-label={labels.nowPlaying}>
                  <span className="ps-play-queue-label" aria-hidden="true">{labels.nowPlaying}</span>
                  <ul className="ps-play-queue-list">
                    <Row track={current} active playing={playing} onSelect={() => select(current, 'next')} />
                  </ul>
                </section>
              )}
              <section className="ps-play-queue-section" aria-label={labels.upNext}>
                <span className="ps-play-queue-label" aria-hidden="true">
                  <span>{source ? labels.nextFrom.replace('{source}', source) : labels.upNext}</span>
                  {upNext.length > 0 && <span className="ps-play-queue-label-meta">{formatDuration(remaining)}</span>}
                </span>
                {upNext.length === 0 ? (
                  <p className="ps-play-queue-empty">{labels.queueEmpty}</p>
                ) : (
                  <ol className="ps-play-queue-list">
                    {upNext.map((track) => (
                      <Row
                        key={track.id}
                        track={track}
                        onSelect={() => select(track, 'next')}
                        onRemove={onRemove && (() => onRemove(track))}
                        removeLabel={labels.removeFromQueue.replace('{title}', track.title)}
                        drag={onReorder ? sortable.itemProps(track.id) : undefined}
                        dragLabel={labels.dragToReorder}
                        isDragging={sortable.isDragging(track.id)}
                        isDragOver={sortable.isDragOver(track.id)}
                      />
                    ))}
                  </ol>
                )}
              </section>
            </>
          ) : history.length === 0 ? (
            <p className="ps-play-queue-empty">{labels.historyEmpty}</p>
          ) : (
            <ol className="ps-play-queue-list" aria-label={labels.history}>
              {history.map((track, i) => (
                <Row key={`${track.id}-${i}`} track={track} onSelect={() => select(track, 'history')} />
              ))}
            </ol>
          )}
        </div>

        {autoplay && (
          <div className="ps-play-queue-foot">
            <Switch label={labels.autoplay} hint={labels.autoplayHint} checked={autoplay.value} onChange={autoplay.onChange} />
          </div>
        )}
        {onReorder && <span role="status" className="ps-visually-hidden">{announcement}</span>}
      </Card>
    );
  }
);
PlayQueue.displayName = 'PlayQueue';
