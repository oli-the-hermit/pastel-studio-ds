import React, { useLayoutEffect, useRef, useState } from 'react';
import { AppearancePanel, type AccentId, type ResolvedTheme, type ThemeMode } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};

/** The panel, its swatches drawn in the theme of the frame it sits in (one per theme in Compare). */
function Panel({ recent, start = 'solar-lime' }: { recent?: AccentId[]; start?: AccentId }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [accent, setAccent] = useState<AccentId>(start);
  const [drawn, setDrawn] = useState<ResolvedTheme>('dark');
  const stage = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    setDrawn(stage.current?.closest('[data-theme]')?.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  }, []);
  return (
    <div ref={stage} className="docs-appearance-stage">
      <AppearancePanel theme={theme} onThemeChange={setTheme} accent={accent} onAccentChange={setAccent} recent={recent} onRemember={noop} resolvedTheme={drawn} />
    </div>
  );
}

function Demo() {
  return <Panel recent={['moonlight-blue', 'sage', 'solar-lime']} />;
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    'With recent colors': <div className="docs-gallery-span"><Panel recent={['moonlight-blue', 'sage']} start="sage" /></div>,
    'First time': <div className="docs-gallery-span"><Panel /></div>,
  },
  variants: {},
  dos: [
    'Apply each change at once (useThemeSync): the panel is a live preview, not a form with Save.',
    'Pass the theme store\'s `recent()` and its `pushRecent` as `recent` and `onRemember`.',
    'Show it as a view of the account menu\'s dialog, beside Profile and Settings.',
  ],
  donts: [
    'Don\'t offer your own color picker beside the presets: every preset is checked for contrast in both themes, a free color is not.',
    'Don\'t rename the presets in one place only: their names are shared words, translated once.',
  ],
};
