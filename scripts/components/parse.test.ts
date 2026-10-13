import { describe, expect, it } from 'vitest';
import { kebab, stylesheetTokens } from './parse.ts';

describe('kebab', () => {
  it("turns a component's name into its stylesheet name and docs address", () => {
    expect(kebab('Button')).toBe('button');
    expect(kebab('IconButton')).toBe('icon-button');
    expect(kebab('NowPlayingBar')).toBe('now-playing-bar');
  });
});

describe('stylesheetTokens', () => {
  const css = `
    /* var(--ps-commented-out) is not a use */
    .ps-button {
      --ps-button-fill: var(--ps-surface-2);
      background: var(--ps-button-fill);
      color: var(--ps-text-1);
      padding: 0 var(--ps-space-20);
    }
    .ps-button:hover { color: var(--ps-text-1); background: var( --ps-surface-3 ); }
  `;

  it('lists the tokens a stylesheet reads once each, in name order, without its own', () => {
    expect(stylesheetTokens(css).used).toEqual(['--ps-space-20', '--ps-surface-2', '--ps-surface-3', '--ps-text-1']);
  });

  it('lists the tokens a stylesheet declares, with their defaults', () => {
    expect(stylesheetTokens(css).own).toEqual([{ name: '--ps-button-fill', value: 'var(--ps-surface-2)' }]);
  });

  it('has nothing to report for a component without a stylesheet', () => {
    expect(stylesheetTokens('')).toEqual({ used: [], own: [] });
  });
});
