import React, { useState } from 'react';
import {
  IconBookmark, IconButton, IconDrive, IconFolder, IconGift, IconHome, IconMusic, IconPlus, IconSearch, IconSparkle, IconStar, IconUser, NavRail, useDrawer,
  type NavRailItem, type NavRailSection,
} from '@pastel-studio/react';
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
// A photo library's places: what it pins, what it collects and where it reads from.
const folder = <IconFolder size={16} />;
const collection = <IconBookmark size={16} />;
const drive = <IconDrive size={16} />;
const sections: NavRailSection[] = [
  { key: 'quick', label: 'Quick access', icon: <IconStar size={20} />, places: [
    { key: 'pictures', label: 'Pictures', icon: folder },
    { key: 'trips', label: 'Trips', icon: folder, active: true },
  ] },
  { key: 'collections', label: 'Collections', icon: <IconBookmark size={20} />, action: { label: 'New collection', icon: <IconPlus size={16} />, onClick: noop }, places: [
    { key: 'best', label: 'Best of 2026', icon: collection, meta: 48 },
    { key: 'portfolio', label: 'Portfolio', icon: collection, meta: 12 },
  ] },
  { key: 'drives', label: 'Drives', icon: <IconDrive size={20} />, places: [
    { key: 'c', label: 'Local Disk (C:)', icon: drive },
    { key: 'd', label: 'Photos (D:)', icon: drive },
  ] },
];
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
    'With sections': (
      <div className="docs-demo-row">
        {stage(<NavRail label="Main" items={items.slice(0, 4)} activeKey="files" onSelect={noop} brand={brand} onToggle={noop} sections={sections} variant="expanded" footer={account} />)}
        {stage(<NavRail label="Main" items={items.slice(0, 4)} activeKey="files" onSelect={noop} brand={brand} onToggle={noop} sections={sections} footer={account} />)}
      </div>
    ),
  },
  variants: {
    rail: stage(<NavRail label="Main" items={items} activeKey="files" onSelect={noop} brand={brand} footer={account} />),
    expanded: stage(<NavRail label="Main" items={items} activeKey="files" onSelect={noop} brand={brand} onToggle={noop} variant="expanded" footer={account} />),
  },
  dos: [
    'Keep it to the app\'s main places: three to seven.',
    'Use `useDrawer` so the choice is remembered and the drawer stays a rail where there is no room.',
    'Give a badge a `badgeLabel`: a number alone means nothing to a screen reader.',
    'Put the places people come back to (pinned folders, collections, drives) in `sections`, rather than in a column beside the page.',
  ],
  donts: [
    'Don\'t put actions in it (New, Save): only places. A section\'s own action, such as New collection, is the exception.',
    'Don\'t nest items: a place with sub-places shows them on its page, or lists them in a section.',
  ],
};
