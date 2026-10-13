import type { ComponentDemo } from './types';

// Each component's examples, found by file name: src/demos/Button.tsx exports `demo` for Button.
const modules = import.meta.glob<{ demo: ComponentDemo }>('./*.tsx', { eager: true });

const demos = new Map(Object.entries(modules).map(([file, { demo }]) => [file.slice(2, -4), demo]));

/** The examples and guidance for a component, if they've been written. */
export const demoFor = (name: string): ComponentDemo | undefined => demos.get(name);
