import React from 'react';
import { cx, type Surface } from '@pastel-studio/react';

/** A patch of another surface, for examples of controls that adapt to what they sit on. */
export function OnSurface({ surface, className, children }: { surface: Exclude<Surface, 1>; className?: string; children: React.ReactNode }) {
  return <span className={cx('docs-surface', `is-${surface}`, className)}>{children}</span>;
}
