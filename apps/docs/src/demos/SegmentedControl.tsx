import React, { useState } from 'react';
import { SegmentedControl } from '@pastel-studio/react';
import { OnSurface } from '../blocks/OnSurface';
import type { ComponentDemo } from './types';

const noop = () => {};
type Range = 'day' | 'week' | 'month';
const ranges: { value: Range; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];
const themes = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function Demo() {
  const [range, setRange] = useState<Range>('week');
  const [theme, setTheme] = useState('system');
  return (
    <div className="docs-demo-stack">
      <SegmentedControl ariaLabel="Range" options={ranges} value={range} onChange={setRange} surface={1} />
      <SegmentedControl ariaLabel="Theme" options={themes} value={theme} onChange={setTheme} size="lg" surface={1} />
      <span className="docs-demo-status" role="status">Showing this {range}, {theme} theme</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Selected: <SegmentedControl ariaLabel="Range" options={ranges} value="week" onChange={noop} surface={1} />,
    'Nothing selected': <SegmentedControl ariaLabel="Range" options={ranges} value={'year' as Range} onChange={noop} surface={1} />,
  },
  variants: {
    md: <div className="docs-gallery-span"><OnSurface surface={0}><SegmentedControl ariaLabel="Range" options={ranges} value="week" onChange={noop} /></OnSurface></div>,
    lg: <div className="docs-gallery-span"><OnSurface surface={0}><SegmentedControl ariaLabel="Theme" options={themes} value="system" onChange={noop} size="lg" /></OnSurface></div>,
    'On a card': <SegmentedControl ariaLabel="Range" options={ranges} value="day" onChange={noop} surface={1} />,
  },
  dos: [
    'Keep it to two to five short options that fit on one line.',
    'Use it to switch what a view shows, or for a setting with a few values.',
    'Give the group an `ariaLabel` that names the choice: "Range", "Theme".',
  ],
  donts: [
    'Don\'t use it for actions: each option is a value, not a command.',
    'Don\'t use it for a long or changing list: that is a Select.',
  ],
};
