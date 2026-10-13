import React, { useRef, useState } from 'react';
import { Button, IconChevronDown, Popover } from '@pastel-studio/react';
import { StaticPopover } from '../blocks/StaticOverlay';
import type { ComponentDemo } from './types';

function Demo() {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <div className="docs-demo-row">
      <Button ref={anchor} trailingIcon={<IconChevronDown size={16} />} aria-expanded={open} onClick={() => setOpen((on) => !on)}>
        About this week
      </Button>
      <Popover open={open} anchorRef={anchor} onClose={() => setOpen(false)} onEscape={() => { setOpen(false); anchor.current?.focus(); }}>
        <div className="docs-popover-body">
          <p>Three sessions, two of them over an hour. Your longest streak this month.</p>
          <Button size="sm" surface={3} onClick={() => setOpen(false)}>Got it</Button>
        </div>
      </Popover>
    </div>
  );
}

const lines = ['Monday 1h 20m', 'Tuesday, no sessions', 'Wednesday 45m', 'Thursday, no sessions', 'Friday 1h 05m', 'Saturday 30m', 'Sunday, no sessions'];

export const demo: ComponentDemo = {
  Demo,
  states: {
    Open: (
      <StaticPopover>
        <div className="docs-popover-body"><p>Three sessions, two of them over an hour.</p></div>
      </StaticPopover>
    ),
    Scrolling: (
      <StaticPopover style={{ maxHeight: 132 }}>
        <div className="docs-popover-scroll">{lines.map((line) => <p key={line}>{line}</p>)}</div>
      </StaticPopover>
    ),
  },
  variants: {
    Rounder: (
      <StaticPopover className="docs-popover-rounder">
        <div className="docs-popover-body"><p>Rounder corners, for pill-shaped content.</p></div>
      </StaticPopover>
    ),
    Tinted: (
      <StaticPopover className="docs-popover-tinted">
        <div className="docs-popover-body"><p>A fill that matches the tinted area it opened from.</p></div>
      </StaticPopover>
    ),
  },
  dos: [
    'Build on it for anything that floats beside what opened it: a menu, a select, a picker.',
    'Give focus back to the anchor in `onEscape`, so keyboard users land where they were.',
    'Set `surface={3}` on buttons inside it: a popover sits on surface 3.',
  ],
  donts: [
    'Don\'t use it for a list of actions: `Menu` already has the roles and the keys.',
    'Don\'t put a task that needs an answer in it: a press outside closes it. Use a `Modal`.',
  ],
};
