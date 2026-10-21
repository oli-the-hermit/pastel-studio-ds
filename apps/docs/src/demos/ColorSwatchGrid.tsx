import React, { useState } from 'react';
import { ACCENT_PRESETS, accentTokens, ColorSwatchGrid, type SwatchOption } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const nameOf = (id: string) => {
  const words = id.replace(/-/g, ' ');
  return words[0].toUpperCase() + words.slice(1);
};
const calm: SwatchOption[] = ACCENT_PRESETS.filter((p) => p.group === 'calm').map((p) => {
  const t = accentTokens(p.id, 'dark');
  return { value: p.id, label: nameOf(p.id), color: t['--ps-accent'], onColor: t['--ps-on-accent'] };
});
const noop = () => {};

function Demo() {
  const [value, setValue] = useState<string>('sky');
  return (
    <div className="docs-demo-form">
      <ColorSwatchGrid options={calm} value={value} onChange={setValue} ariaLabel="Calm colors" />
      <span className="docs-demo-status" role="status">{nameOf(value)}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Selected: <div className="docs-gallery-span"><ColorSwatchGrid options={calm} value="lavender" onChange={noop} ariaLabel="Calm colors" /></div>,
    'Nothing selected': <div className="docs-gallery-span"><ColorSwatchGrid options={calm} value={null} onChange={noop} ariaLabel="Calm colors" /></div>,
  },
  variants: {
    Columns: <ColorSwatchGrid options={calm} value="mint" onChange={noop} ariaLabel="Calm colors" columns={4} />,
  },
  dos: [
    'Give every option a name: it is read out and shown as the tooltip.',
    'Pass an ink color that reads on each fill, so the check mark stays visible.',
  ],
  donts: [
    'Don\'t use it for things that are not colors: a SegmentedControl names its options.',
  ],
};
