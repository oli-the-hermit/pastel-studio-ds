import { describe, expect, it } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('joins class names and skips what is empty or falsy', () => {
    expect(cx('ps-button', false, 'is-busy', undefined, null, '')).toBe('ps-button is-busy');
    expect(cx()).toBe('');
  });
});
