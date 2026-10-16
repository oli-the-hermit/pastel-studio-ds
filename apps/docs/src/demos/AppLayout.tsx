import React, { useState } from 'react';
import { AppLayout, Button, IconFolder, IconHome, IconMusic, IconSearch, IconSparkle, NavRail, SearchField, TextButton, type AppLayoutProps, type NavRailItem } from '@pastel-studio/react';
import { ScaledStage } from '../blocks/ScaledStage';
import type { ComponentDemo } from './types';

const noop = () => {};
const items: NavRailItem[] = [
  { key: 'home', label: 'Home', icon: <IconHome size={20} /> },
  { key: 'library', label: 'Library', icon: <IconMusic size={20} /> },
  { key: 'search', label: 'Search', icon: <IconSearch size={20} /> },
  { key: 'files', label: 'Files', icon: <IconFolder size={20} /> },
];
const nav = <NavRail label="Main" items={items} activeKey="library" onSelect={noop} brand={{ mark: <IconSparkle size={18} />, name: 'Pastel Studio' }} />;
const appBar = (
  <div className="docs-shell-app-bar" role="menubar" aria-label="Menu">
    {['File', 'Edit', 'View', 'Help'].map((m) => <TextButton key={m} size="xs" role="menuitem">{m}</TextButton>)}
  </div>
);
const topBar = (
  <div className="docs-shell-top">
    <h2 className="docs-shell-title">Library</h2>
    <SearchField placeholder="Search library" value="" onChange={noop} />
  </div>
);
const page = (
  <div className="docs-shell-page">
    {['Recently played', 'Albums', 'Playlists', 'Podcasts', 'Downloads', 'Liked songs'].map((t) => <div key={t} className="docs-shell-card">{t}</div>)}
  </div>
);
const aside = <div className="docs-shell-panel">Up next</div>;
const bottomBar = <div className="docs-shell-bar">Now playing: Tidal Lines · 1:12 / 4:31</div>;

const stage = (width: number, props: Partial<AppLayoutProps>) => (
  <div className="docs-gallery-span">
    <ScaledStage width={width} height={520}>
      <AppLayout nav={nav} topBar={topBar} {...props}>{page}</AppLayout>
    </ScaledStage>
  </div>
);

function Demo() {
  const [asideOpen, setAsideOpen] = useState(true);
  return (
    <div className="docs-demo-form docs-demo-wide">
      <ScaledStage width={1280} height={600}>
        <AppLayout appBar={appBar} nav={nav} topBar={topBar} aside={aside} asideOpen={asideOpen} bottomBar={bottomBar}>{page}</AppLayout>
      </ScaledStage>
      <div className="docs-demo-row">
        <Button size="sm" onClick={() => setAsideOpen((o) => !o)}>{asideOpen ? 'Close the side panel' : 'Open the side panel'}</Button>
      </div>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    'Side panel open': stage(1200, { aside, asideOpen: true }),
  },
  variants: {
    'Drawer and page': stage(1200, {}),
    'With app bar': stage(1200, { appBar }),
    'With bottom bar': stage(1200, { bottomBar }),
  },
  dos: [
    'Give it the whole window; put cards and lists inside the page, not around the shell.',
    'Keep the app bar to the title and menus; page actions belong to the top bar.',
    'Use the side panel for something that accompanies every page: a queue, details.',
  ],
  donts: [
    'Don\'t add borders between the panels: the gaps separate them.',
    'Don\'t scroll the whole window: only the page scrolls.',
  ],
};
