import { describe, expect, it } from 'vitest';
import { wordsType } from './components-plugin.ts';

describe('wordsType', () => {
  it('shortens a labels prop to the words it accepts', () => {
    expect(wordsType('Partial<Pick<{ close: string; copy: string; actions: string; }, "close">>')).toBe('{ close?: string }');
    expect(wordsType('Partial<Pick<{ close: string; copy: string; }, "copy" | "close">>')).toBe('{ copy?: string; close?: string }');
  });

  it('leaves every other type as it is', () => {
    expect(wordsType('boolean')).toBe('boolean');
    expect(wordsType('() => void')).toBe('() => void');
  });
});
