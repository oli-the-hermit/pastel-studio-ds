import React from 'react';
import { cx } from '@pastel-studio/react';

// Overlays float over the page, so a gallery can't show them as they are. These two show the
// real thing in the flow of the page instead, and inert: it takes no focus, keys or clicks.
const inert = { inert: '' };

/** A popover's panel, standing still where it is written. Give it the classes of what it shows. */
export function StaticPopover({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div className="docs-static-overlay" {...inert}>
      <div className={cx('ps-popover', className)} style={style}>{children}</div>
    </div>
  );
}

/** A small window for an open Modal: its scrim and dialog stay inside this frame. */
export function ModalStage({ children }: { children: React.ReactNode }) {
  return <div className="docs-modal-stage" {...inert}>{children}</div>;
}
