import type { ComponentMeta } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

// Each component's examples, found by file name: src/demos/Button.tsx exports `demo` for Button.
const modules = import.meta.glob<{ demo: ComponentDemo }>('./*.tsx', { eager: true });

const demos = new Map(Object.entries(modules).map(([file, { demo }]) => [file.slice(2, -4), demo]));

/** The examples and guidance for a component, if they've been written. */
export const demoFor = (name: string): ComponentDemo | undefined => demos.get(name);

/**
 * What a component's examples are missing or have too many of, against its meta.ts: every state
 * and variant needs one example under the same name, and nothing else.
 */
export function exampleGaps(meta: ComponentMeta, demo: ComponentDemo | undefined): string[] {
  if (!demo) return [`${meta.name}: no apps/docs/src/demos/${meta.name}.tsx`];
  const gaps: string[] = [];
  for (const kind of ['states', 'variants'] as const) {
    const named = meta[kind].map((entry) => entry.name);
    for (const name of named) if (!(name in demo[kind])) gaps.push(`${meta.name}: no example for "${name}" in ${kind}`);
    for (const name of Object.keys(demo[kind])) if (!named.includes(name)) gaps.push(`${meta.name}: example "${name}" in ${kind} is not in meta.ts`);
  }
  return gaps;
}
