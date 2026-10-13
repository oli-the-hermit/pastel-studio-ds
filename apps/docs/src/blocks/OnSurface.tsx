import React from 'react';
import type { Surface } from '@pastel-studio/react';

/** A patch of another surface, for examples of controls that adapt to what they sit on. */
export function OnSurface({ surface, children }: { surface: Exclude<Surface, 1>; children: React.ReactNode }) {
  return <span className={`docs-surface is-${surface}`}>{children}</span>;
}
