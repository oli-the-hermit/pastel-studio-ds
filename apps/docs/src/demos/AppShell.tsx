import React, { useState } from 'react';
import { AppShell, AppShellPage, Button, IconButton, IconFolder, IconHelp, IconHome, IconMusic, IconSearch, IconSparkle, NavRail, TopBar, type AppShellProps, type NavRailItem } from '@pastel-studio/react';
import { ScaledStage } from '../blocks/ScaledStage';
import type { ComponentDemo } from './types';

const noop = () => {};
const items: NavRailItem[] = [
  { key: 'home', label: 'Home', icon: <IconHome size={20} /> },
  { key: 'library', label: 'Library', icon: <IconMusic size={20} /> },
  { key: 'search', label: 'Search', icon: <IconSearch size={20} /> },
  { key: 'files', label: 'Files', icon: <IconFolder size={20} /> },
];
const brand = { mark: <IconSparkle size={18} />, name: 'Pastel Studio' };
const nav = (active = 'library', variant: 'rail' | 'expanded' = 'rail', onSelect: (key: string) => void = noop) => (
  <NavRail label="Main" items={items} activeKey={active} onSelect={onSelect} brand={brand} variant={variant} />
);
const topBar = (title: string) => (
  <TopBar
    title={title}
    tools={
      <>
        <IconButton label="Search"><IconSearch size={19} /></IconButton>
        <IconButton label="Help"><IconHelp size={19} /></IconButton>
      </>
    }
  />
);
const cards = (
  <div className="docs-shell-page">
    {['Recently played', 'Albums', 'Playlists', 'Podcasts', 'Downloads', 'Liked songs'].map((t) => <div key={t} className="docs-shell-card">{t}</div>)}
  </div>
);
const aside = <div className="docs-shell-panel">Up next</div>;
const bottomBar = <div className="docs-shell-bar">Now playing: Tidal Lines · 1:12 / 4:31</div>;

const stage = (props: Partial<AppShellProps>, active = 'library', variant: 'rail' | 'expanded' = 'rail') => (
  <div className="docs-gallery-span">
    <ScaledStage width={1200} height={520}>
      <AppShell nav={nav(active, variant)} topBar={topBar('Library')} {...props}>
        <AppShellPage active>{cards}</AppShellPage>
      </AppShell>
    </ScaledStage>
  </div>
);

function Demo() {
  const [page, setPage] = useState('library');
  const [asideOpen, setAsideOpen] = useState(true);
  return (
    <div className="docs-demo-form docs-demo-wide">
      <ScaledStage width={1280} height={600}>
        <AppShell nav={nav(page, 'rail', setPage)} topBar={topBar(items.find((i) => i.key === page)!.label)} aside={aside} asideOpen={asideOpen} bottomBar={bottomBar}>
          <AppShellPage active={page === 'library'}>{cards}</AppShellPage>
          {items.filter((i) => i.key !== 'library').map((i) => (
            <AppShellPage key={i.key} active={page === i.key}><div className="docs-shell-card">{i.label}</div></AppShellPage>
          ))}
        </AppShell>
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
    'Side panel open': stage({ aside, asideOpen: true }),
    'Page change': (
      <div className="docs-gallery-span">
        <ScaledStage width={1200} height={360}>
          <AppShell nav={nav('files')} topBar={topBar('Files')}>
            <AppShellPage active={false}>{cards}</AppShellPage>
            <AppShellPage active><div className="docs-shell-card">Files: the only page showing. The Library page stays mounted behind it.</div></AppShellPage>
          </AppShell>
        </ScaledStage>
      </div>
    ),
    Transparent: (
      <div className="docs-gallery-span">
        <ScaledStage width={1200} height={420}>
          <div className="docs-shell-stage">
            <div className="docs-shell-picture" aria-hidden="true" />
            <AppShell nav={nav()} topBar={topBar('Library')} surface="transparent" style={{ position: 'relative' }}>
              <AppShellPage active><div className="docs-shell-card">The page is see-through; the bar and the drawer keep the background.</div></AppShellPage>
            </AppShell>
          </div>
        </ScaledStage>
      </div>
    ),
  },
  variants: {
    'Drawer and page': stage({}),
    'With bottom bar': stage({ bottomBar }),
    'Expanded drawer': stage({}, 'library', 'expanded'),
  },
  dos: [
    'Give it the whole window (or a frame with a height); put cards and lists inside the page, not around the shell.',
    'Keep every page mounted with `AppShellPage` so each keeps its scroll and its state.',
    'Use the side panel for something that accompanies every page: a queue, details.',
  ],
  donts: [
    'Don\'t add borders between the drawer, the bar and the page: the margin separates them.',
    'Don\'t scroll the whole window: only the page scrolls.',
    'Don\'t use `transparent` just for looks: it is for a picture drawn behind the window, such as a video engine.',
  ],
};
