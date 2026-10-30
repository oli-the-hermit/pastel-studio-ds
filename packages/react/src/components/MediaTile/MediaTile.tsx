import React, { forwardRef, useState } from 'react';
import { IconCheck, IconHeart } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { FileIcon } from '../FileIcon';

export interface MediaTileProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The file or folder name, under the thumbnail. */
  name: string;
  /** The thumbnail. Without one, or while it loads, the tile shows the file type's icon. */
  src?: string;
  /** `folder` shows a folder in place of a thumbnail. */
  kind?: 'file' | 'folder';
  /** The second line under the name: "1920 × 1080", "12 items". */
  meta?: React.ReactNode;
  /** A short mark in the thumbnail's corner, e.g. a video's duration. */
  duration?: string;
  favorite?: boolean;
  /** A small mark of where the item came from, e.g. a site's icon for a saved web item. */
  source?: React.ReactNode;
  selected?: boolean;
  /** Shows the check on every tile, not only on hover: while anything is selected. */
  selecting?: boolean;
  /** What a Shift + click would do to this tile, while Shift is held over the grid. */
  preview?: 'add' | 'remove';
  /** A pulse while the thumbnail is on its way. */
  loading?: boolean;
  /** Hidden or unavailable items: drawn in the quiet text color. */
  dimmed?: boolean;
  /** Quick actions on the thumbnail, shown on hover and focus. Keep them in the item's menu too. */
  actions?: React.ReactNode;
  labels?: LabelOverrides<'favorite'>;
}

/**
 * One item of a media grid: a square thumbnail with its name and a line of meta under it, a
 * favorite and duration mark, a check for multiple selection and quick actions on hover. The tile
 * draws; the grid around it owns focus, selection and the keyboard. A click on the check (it
 * carries `data-media-check`) toggles the item instead of selecting only it.
 */
export const MediaTile = forwardRef<HTMLDivElement, MediaTileProps>(({
  name, src, kind = 'file', meta, duration, favorite = false, source, selected = false, selecting = false, preview, loading = false,
  dimmed = false, actions, labels: ownLabels, className, ...rest
}, ref) => {
  const labels = useLabels(ownLabels);
  const [failed, setFailed] = useState<string | null>(null);
  const showImg = src && failed !== src;
  return (
    <div
      ref={ref}
      className={cx(
        'ps-media-tile',
        kind === 'folder' && 'ps-media-tile--folder',
        selected && 'is-selected',
        selecting && 'is-selecting',
        preview && `is-preview-${preview}`,
        loading && 'is-loading',
        dimmed && 'is-dimmed',
        className
      )}
      {...rest}
    >
      <div className="ps-media-tile-frame">
        {showImg ? (
          <img src={src} alt="" draggable={false} onError={() => setFailed(src)} />
        ) : (
          <span className="ps-media-tile-placeholder">
            <FileIcon entry={{ kind, name }} size="xl" />
          </span>
        )}
        {kind === 'file' && (
          <span className="ps-media-tile-check" data-media-check="" aria-hidden="true">
            <IconCheck size={14} />
          </span>
        )}
        {favorite && (
          <span className="ps-media-tile-favorite" role="img" aria-label={labels.favorite} title={labels.favorite}>
            <IconHeart filled size={14} />
          </span>
        )}
        {source && <span className="ps-media-tile-source">{source}</span>}
        {duration && <span className="ps-media-tile-duration">{duration}</span>}
        {actions && <div className="ps-media-tile-actions">{actions}</div>}
      </div>
      <div className="ps-media-tile-caption">
        <span className="ps-media-tile-name" title={name}>{name}</span>
        {meta && <span className="ps-media-tile-meta">{meta}</span>}
      </div>
    </div>
  );
});
MediaTile.displayName = 'MediaTile';
