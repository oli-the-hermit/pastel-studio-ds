import React, { useState } from 'react';
import { Button, IconCheck, IconChevronLeft, IconChevronRight, IconClose, IconSparkle, Tour, type TourChapter, type TourStep } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const chapters: TourChapter[] = [
  { key: 'player', label: 'Player' },
  { key: 'library', label: 'Library' },
];
const steps: TourStep[] = [
  { id: 'welcome', kind: 'welcome', title: 'Hi Sam, welcome', body: 'A quick look around? It takes about a minute.' },
  { id: 'play', kind: 'spot', chapter: 'player', target: 'docs-tour-play', title: 'Play and pause', body: 'The big button starts and stops what is playing.' },
  { id: 'queue', kind: 'spot', chapter: 'player', target: 'docs-tour-queue', title: 'What plays next', body: 'The queue lists the songs coming up; drag to reorder them.' },
  { id: 'missing', kind: 'spot', chapter: 'library', target: 'docs-tour-not-here', title: 'Skipped', body: 'This step points at nothing on screen, so the tour skips it.' },
  { id: 'search', kind: 'spot', chapter: 'library', target: 'docs-tour-search', title: 'Find anything', body: 'Search songs, albums and playlists from here.' },
  { id: 'done', kind: 'done', title: 'You\'re all set', body: 'Replay this tour anytime from Help.' },
];

function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="docs-tour-app">
      <div className="docs-demo-row">
        <Button variant="primary" onClick={() => setOpen(true)}>Start the tour</Button>
        <Button data-tour="docs-tour-search">Search</Button>
      </div>
      <div className="docs-tour-panels">
        <div className="docs-shell-card" data-tour="docs-tour-play">Player</div>
        <div className="docs-shell-card" data-tour="docs-tour-queue">Queue</div>
      </div>
      <Tour open={open} steps={steps} chapters={chapters} onClose={() => setOpen(false)} mark={<IconSparkle size={26} />} />
    </div>
  );
}

/** The card as it stands still, for the gallery (the real tour covers the window). */
function Card({ kind, children }: { kind: 'welcome' | 'spot' | 'done'; children: React.ReactNode }) {
  const center = kind !== 'spot';
  return (
    <div className="docs-gallery-span docs-tour-stage" {...{ inert: '' }}>
      <div className={center ? 'ps-tour-card is-center' : 'ps-tour-card is-spot is-side-left'}>
        <span className="ps-icon-button ps-icon-button--sm ps-tour-close"><IconClose size={16} /></span>
        {children}
      </div>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Welcome: (
      <Card kind="welcome">
        <span className="ps-tour-badge"><IconSparkle size={26} /></span>
        <h2 className="ps-tour-title">Hi Sam, welcome</h2>
        <p className="ps-tour-body">A quick look around? It takes about a minute.</p>
        <div className="ps-tour-footer"><div className="ps-tour-actions"><Button surface={3}>Maybe later</Button><Button variant="primary">Show me around</Button></div></div>
      </Card>
    ),
    Spotlight: (
      <Card kind="spot">
        <div className="ps-tour-meta"><span className="ps-overline">Player</span><span className="ps-tour-count">2 of 2</span></div>
        <h2 className="ps-tour-title">What plays next</h2>
        <p className="ps-tour-body">The queue lists the songs coming up; drag to reorder them.</p>
        <div className="ps-tour-footer">
          <div className="ps-tour-dots"><span className="ps-tour-dot is-current" /><span className="ps-tour-dot" /></div>
          <div className="ps-tour-actions"><Button surface={3} icon={<IconChevronLeft size={16} />}>Back</Button><Button variant="primary" trailingIcon={<IconChevronRight size={16} />}>Next</Button></div>
        </div>
      </Card>
    ),
    Done: (
      <Card kind="done">
        <span className="ps-tour-badge is-done"><IconCheck size={26} strokeWidth={2.6} /></span>
        <h2 className="ps-tour-title">You&apos;re all set</h2>
        <p className="ps-tour-body">Replay this tour anytime from Help.</p>
        <div className="ps-tour-footer"><div className="ps-tour-actions"><Button surface={3} icon={<IconChevronLeft size={16} />}>Back</Button><Button variant="primary">Done</Button></div></div>
      </Card>
    ),
  },
  variants: {},
  dos: [
    'Offer it once on first run (and from Help), never in the middle of work.',
    'Keep a step to one thing and two short sentences; group steps in chapters a person recognises.',
    'Mark what a step points at with `data-tour`, and show its page in `onShow`.',
  ],
  donts: [
    'Don\'t make the tour the only place something is explained: it can be skipped.',
  ],
};
