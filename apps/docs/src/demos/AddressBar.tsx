import React, { useState } from 'react';
import { AddressBar } from '@pastel-studio/react';
import { childrenOf, findPath, pathTo } from '../fixtures/folders';
import type { ComponentDemo } from './types';

const noop = () => {};
const wide = (node: React.ReactNode) => <div className="docs-gallery-span">{node}</div>;

function Demo() {
  const [at, setAt] = useState('albums');
  const [missing, setMissing] = useState('');
  return (
    <div className="docs-demo-form docs-demo-wide">
      <AddressBar
        path={pathTo(at)}
        childrenOf={childrenOf}
        onNavigate={(id) => { setAt(id); setMissing(''); }}
        onSubmitPath={(text) => { const id = findPath(text); if (id) setAt(id); setMissing(id ? '' : text); }}
      />
      <span className="docs-demo-status" role="status">{missing ? `No folder "${missing}"` : `In ${pathTo(at).at(-1)?.label}. Click the empty end or press F4 to type a path.`}</span>
    </div>
  );
}

// The path field as it looks while editing; the real one takes focus, which a gallery shouldn't.
const editing = (
  <div className="ps-address-bar is-editing">
    <input className="ps-address-bar-input" aria-label="Address" value="Home\Music\Albums" readOnly />
  </div>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Breadcrumbs: wide(<AddressBar path={pathTo('albums')} childrenOf={childrenOf} onNavigate={noop} />),
    Folded: wide(<AddressBar path={pathTo('tidal')} childrenOf={childrenOf} onNavigate={noop} maxVisible={2} />),
    Editing: wide(editing),
  },
  variants: {},
  dos: [
    'Pass `childrenOf` so people can jump to a sibling folder without going up first.',
    'Accept typed paths with `onSubmitPath` when people know where they are going.',
  ],
  donts: [
    'Don\'t use it for page navigation in an app: it is a file location.',
    'Don\'t leave a typed path that doesn\'t exist silently ignored: say so.',
  ],
};
