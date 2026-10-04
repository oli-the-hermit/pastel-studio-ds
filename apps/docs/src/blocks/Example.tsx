import React from 'react';
import { cx } from '@pastel-studio/react';
import { useExampleThemes } from '../theme';
import type { ThemeName } from '../tokens/types';

const LABEL: Record<ThemeName, string> = { dark: 'Dark', light: 'Light' };

interface ExampleProps {
  /** Content, or a function of the theme it renders in (for theme-specific values). */
  children: React.ReactNode | ((theme: ThemeName) => React.ReactNode);
  /** Lay the content out without the frame's padding (tables, full-bleed demos). */
  flush?: boolean;
  /** Stack the two themes vertically in compare mode, for wide content. */
  stack?: boolean;
  className?: string;
}

/**
 * A live example. It renders in the site's theme, or, in compare mode, once per theme
 * side by side. Each frame carries its own data-theme, so everything inside resolves
 * that theme's tokens.
 */
export function Example({ children, flush, stack, className }: ExampleProps) {
  const themes = useExampleThemes();
  const compare = themes.length > 1;
  return (
    <div className={cx('docs-example-group', compare && 'is-compare', stack && 'is-stacked')}>
      {themes.map((theme) => (
        <figure key={theme} className="docs-example-figure">
          {compare && <figcaption className="ps-overline docs-example-caption">{LABEL[theme]}</figcaption>}
          <div data-theme={theme} className={cx('docs-example', flush && 'is-flush', className)}>
            {typeof children === 'function' ? children(theme) : children}
          </div>
        </figure>
      ))}
    </div>
  );
}
