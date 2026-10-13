import type React from 'react';

/**
 * What the docs add to a component, in src/demos/<Name>.tsx: its live examples and its
 * guidance. Everything else on the page comes from the component's own code and meta.ts.
 * Examples are front-end only: fake data and simulated work, never a backend.
 */
export interface ComponentDemo {
  /** The interactive demo at the top of the page: the component doing its job. */
  Demo: React.ComponentType;
  /** One example per state in meta.ts, by the state's name. */
  states: Record<string, React.ReactNode>;
  /** One example per variant in meta.ts, by the variant's name. */
  variants: Record<string, React.ReactNode>;
  /** When and how to use it, one sentence each. */
  dos: string[];
  /** What to avoid, and what to use instead. */
  donts: string[];
}
