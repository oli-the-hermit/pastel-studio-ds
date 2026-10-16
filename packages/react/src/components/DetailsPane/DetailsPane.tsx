import React, { forwardRef } from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { formatBytes, formatDateTime } from '../../lib/format';
import { typeLabel, type FsEntry } from '../../lib/fs';
import { FileIcon } from '../FileIcon';
import { ProgressBar } from '../ProgressBar';

type DetailsWord = 'details' | 'fileType' | 'fileSize' | 'items' | 'capacity' | 'freeSpace' | 'usedSpace' | 'modified' | 'created' | 'location' | 'itemsSelected'
  | 'typeFolder' | 'typeDrive' | 'typeFile' | 'typeImage' | 'typeVideo' | 'typeAudio' | 'typeText' | 'typeDocument' | 'typePdf' | 'typeSpreadsheet'
  | 'typePresentation' | 'typeCode' | 'typeArchive' | 'typeApp' | 'typeFont' | 'typeModel' | 'typeOther';

export interface DetailsPaneProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** The selection; with none, the pane describes `folder`. */
  entries: FsEntry[];
  folder: FsEntry;
  /** "Music › Albums", for the Location row. */
  location?: string;
  /** Buttons under the facts: Open, Share. */
  actions?: React.ReactNode;
  labels?: LabelOverrides<DetailsWord>;
}

/** The selected entry's icon, name and facts; for several, how many and their total size. */
export const DetailsPane = forwardRef<HTMLElement, DetailsPaneProps>(({ entries, folder, location, actions, labels: ownLabels, className, ...rest }, ref) => {
  const labels = useLabels(ownLabels);
  const single = entries.length === 1 ? entries[0] : entries.length === 0 ? folder : null;
  const facts: [string, string][] = [];
  if (single) {
    facts.push([labels.fileType, typeLabel(single, labels)]);
    if (single.kind === 'file') facts.push([labels.fileSize, formatBytes(single.size ?? 0)]);
    if (single.kind !== 'file' && single.children) facts.push([labels.items, String(single.children.length)]);
    if (single.capacity) facts.push([labels.capacity, formatBytes(single.capacity)], [labels.freeSpace, formatBytes(single.free ?? 0)]);
    if (single.modified) facts.push([labels.modified, formatDateTime(single.modified)]);
    if (single.created) facts.push([labels.created, formatDateTime(single.created)]);
    if (location) facts.push([labels.location, location]);
    Object.entries(single.meta ?? {}).forEach((fact) => facts.push(fact));
  } else {
    facts.push([labels.fileSize, formatBytes(entries.reduce((sum, e) => sum + (e.size ?? 0), 0))]);
  }
  const used = single?.capacity ? ((single.capacity - (single.free ?? 0)) / single.capacity) * 100 : undefined;
  return (
    <aside ref={ref} className={cx('ps-details-pane', className)} aria-label={labels.details} {...rest}>
      <div className="ps-details-pane-hero">
        {single ? <FileIcon entry={single} size="xl" className="ps-details-pane-icon" /> : <span className="ps-details-pane-count">{entries.length}</span>}
        <h2 className="ps-details-pane-name">{single ? single.name : labels.itemsSelected.replace('{count}', String(entries.length))}</h2>
      </div>
      {used !== undefined && <ProgressBar value={used} label={labels.usedSpace} size="lg" tone={used > 90 ? 'danger' : used > 75 ? 'warning' : 'accent'} />}
      <dl className="ps-details-pane-facts">
        {facts.map(([term, value]) => (
          <div key={term} className="ps-details-pane-fact">
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {actions && <div className="ps-details-pane-actions">{actions}</div>}
    </aside>
  );
});
DetailsPane.displayName = 'DetailsPane';
