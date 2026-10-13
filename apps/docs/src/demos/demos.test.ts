import type { ComponentMeta } from '@pastel-studio/react';
import { describe, expect, it } from 'vitest';
import { components } from '../components';
import { demoFor, exampleGaps } from './index';
import type { ComponentDemo } from './types';

const meta: ComponentMeta = {
  name: 'Sample',
  group: 'Actions',
  summary: 'A sample.',
  status: 'beta',
  states: [{ name: 'Default', description: 'Ready.' }, { name: 'Disabled', description: 'Off.' }],
  variants: [{ name: 'primary', description: 'The main one.' }],
  keyboard: [],
  labels: [],
  aria: [],
  related: [],
};
const demo = (parts: Partial<ComponentDemo>): ComponentDemo => ({ Demo: () => null, states: {}, variants: {}, dos: [], donts: [], ...parts });

describe('exampleGaps', () => {
  it('finds nothing when every state and variant has its example', () => {
    expect(exampleGaps(meta, demo({ states: { Default: 'a', Disabled: 'b' }, variants: { primary: 'c' } }))).toEqual([]);
  });

  it('names each state or variant without an example', () => {
    expect(exampleGaps(meta, demo({ states: { Default: 'a' } }))).toEqual([
      'Sample: no example for "Disabled" in states',
      'Sample: no example for "primary" in variants',
    ]);
  });

  it('names an example that meta.ts does not describe', () => {
    expect(exampleGaps(meta, demo({ states: { Default: 'a', Disabled: 'b', Busy: 'x' }, variants: { primary: 'c' } }))).toEqual([
      'Sample: example "Busy" in states is not in meta.ts',
    ]);
  });

  it('says so when a component has no demo file', () => {
    expect(exampleGaps(meta, undefined)).toEqual(['Sample: no apps/docs/src/demos/Sample.tsx']);
  });
});

describe('the component library', () => {
  it('has a complete set of examples for every component', () => {
    expect(components.flatMap((component) => exampleGaps(component.meta, demoFor(component.name)))).toEqual([]);
  });
});
