import React, { useState } from 'react';
import { IconButton, IconFolder, IconGift, IconHome, IconMusic, IconSearch, IconSparkle, IconUser, NavRail, useDrawer, type NavRailItem } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const items: NavRailItem[] = [
  { key: 'home', label: 'Home', icon: <IconHome size={20} /> },
  { key: 'library', label: 'Library', icon: <IconMusic size={20} /> },
  { key: 'search', label: 'Search', icon: <IconSearch size={20} /> },
  { key: 'files', label: 'Files', icon: <IconFolder size={20} /> },
  { key: 'rewards', label: 'Rewards', icon: <IconGift size={20} />, badge: 2, badgeLabel: '2 ready to claim' },
];
const brand = { mark: <IconSparkle size={18} />, name: 'Pastel Studio' };
const account = <IconButton label="Account" surface={0}><IconUser size={18} /></IconButton>;
const stage = (node: React.ReactNode) => <div className="docs-nav-stage">{node}</div>;

function Demo() {
  const [page, setPage] = useState('library');
  const drawer = useDrawer('ps-docs-drawer');
  return (
    <div className="docs-demo-row">
      {stage(
        <NavRail
          label="Main"
          items={items}
          activeKey={page}
          onSelect={setPage}
          variant={drawer.expanded ? 'expanded' : 'rail'}
          brand={brand}
          onToggle={drawer.canExpand ? drawer.toggle : undefined}
          footer={account}
        />
      )}
      <span className="docs-demo-status" role="status">On {page}. {drawer.canExpand ? 'The toggle expands and collapses it; the choice is remembered.' : 'Under 1024px it stays a rail.'}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    'Current page': stage(<NavRail label="Main" items={items.slice(0, 4)} activeKey="library" onSelect={noop} brand={brand} />),
    'With badge': stage(<NavRail label="Main" items={items} activeKey="home" onSelect={noop} brand={brand} />),
    'With toggle': stage(<NavRail label="Main" items={items} activeKey="home" onSelect={noop} brand={brand} onToggle={noop} footer={account} />),
    'Without a mark': stage(<NavRail label="Main" items={items} activeKey="home" onSelect={noop} onToggle={noop} footer={account} />),
  },
  variants: {
    rail: stage(<NavRail label="Main" items={items} activeKey="files" onSelect={noop} brand={brand} footer={account} />),
    expanded: stage(<NavRail label="Main" items={items} activeKey="files" onSelect={noop} brand={brand} onToggle={noop} variant="expanded" footer={account} />),
  },
  dos: [
    'Keep it to the app\'s main places: three to seven.',
    'Use `useDrawer` so the choice is remembered and the drawer stays a rail where there is no room.',
    'Give a badge a `badgeLabel`: a number alone means nothing to a screen reader.',
  ],
  donts: [
    'Don\'t put actions in it (New, Save): only places.',
    'Don\'t nest items: a place with sub-places shows them on its page.',
  ],
};
