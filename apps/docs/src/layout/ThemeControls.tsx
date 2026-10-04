import React from 'react';
import { cx } from '@pastel-studio/react';
import { useDocsTheme } from '../theme';
import type { ThemeName } from '../tokens/types';

const THEMES: { id: ThemeName; label: string }[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
];

/** Site theme (Dark / Light) and Compare, which shows every example in both themes. */
export function ThemeControls() {
  const { theme, setTheme, compare, setCompare } = useDocsTheme();
  return (
    <div className="docs-theme-controls">
      <div className="docs-segmented" role="group" aria-label="Theme">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={cx('docs-segmented-option', theme === t.id && 'is-selected')}
            aria-pressed={theme === t.id}
            onClick={() => setTheme(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={cx('docs-toggle', compare && 'is-selected')}
        aria-pressed={compare}
        onClick={() => setCompare(!compare)}
      >
        Compare
      </button>
    </div>
  );
}
