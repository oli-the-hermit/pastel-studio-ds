import { Modal } from '@pastel-studio/react';
import { labels } from '../labels';

const t = labels.tips;

function Rows({ rows, mono = true }: { rows: Record<string, readonly [string, string]>; mono?: boolean }) {
  return (
    <dl className="pastel-tips-rows">
      {Object.entries(rows).map(([key, [term, meaning]]) => (
        <div key={key} className="pastel-tips-row">
          <dt>{mono ? <kbd>{term}</kbd> : <code>{term}</code>}</dt>
          <dd>{meaning}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Help: what to type, the keys, and what each output is for. */
export function TipsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} title={t.title} onClose={onClose} dismissible>
      <div className="pastel-tips">
        <p>{t.intro}</p>
        <h4>{t.typing}</h4>
        <Rows rows={t.rows} />
        <h4>{t.keys}</h4>
        <Rows rows={t.shortcuts} />
        <h4>{t.outputs}</h4>
        <Rows rows={t.outputRows} mono={false} />
      </div>
    </Modal>
  );
}
