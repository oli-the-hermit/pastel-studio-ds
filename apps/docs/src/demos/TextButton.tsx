import React, { useState } from 'react';
import { IconPlus, TextButton } from '@pastel-studio/react';
import { OnSurface } from '../blocks/OnSurface';
import type { ComponentDemo } from './types';

function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="docs-demo-stack">
      <p>Three sessions this week, two of them over an hour.</p>
      {open && <p className="docs-demo-status">Monday 1h 20m · Wednesday 45m · Friday 1h 05m</p>}
      <TextButton accent aria-expanded={open} onClick={() => setOpen((on) => !on)}>{open ? 'Hide details' : 'Show details'}</TextButton>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Default: <TextButton>Skip for now</TextButton>,
    'With icon': <TextButton><IconPlus size={16} />Add a note</TextButton>,
  },
  variants: {
    accent: <TextButton accent>See all sessions</TextButton>,
    xs: <TextButton size="xs" accent>+3 more</TextButton>,
    'On a raised surface': <OnSurface surface={3}><TextButton surface={3}>Skip for now</TextButton></OnSurface>,
  },
  dos: [
    'Use it for the quiet action beside a main one: "Skip for now" next to "Continue".',
    'Use `accent` for at most one text button in a group.',
  ],
  donts: [
    'Don\'t use it for the main action of a surface: use a `primary` `Button`.',
    'Don\'t use it to go to another page: use a link.',
  ],
};
