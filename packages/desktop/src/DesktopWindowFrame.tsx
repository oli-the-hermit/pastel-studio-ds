import type { ReactNode } from 'react';
import { WindowFrame } from '@pastel-studio/react';
import { DesktopWindowControls, type DesktopWindowControlsProps } from './DesktopWindowControls';
import { DRAG_REGION, isDesktop } from './window';

export interface DesktopWindowFrameProps {
  /** The screen with no TopBar: starting up, signing in, a first-run step. */
  children: ReactNode;
  className?: string;
  /** The window buttons' words, as for DesktopWindowControls. */
  labels?: DesktopWindowControlsProps['labels'];
}

/**
 * WindowFrame wired to the Tauri window: a bare title bar that moves the window, with its buttons,
 * above a screen that has no TopBar. In a browser the screen is rendered alone.
 */
export function DesktopWindowFrame({ children, className, labels }: DesktopWindowFrameProps) {
  if (!isDesktop()) return <>{children}</>;
  return (
    <WindowFrame className={className} dragRegionProps={DRAG_REGION} windowControls={<DesktopWindowControls labels={labels} />}>
      {children}
    </WindowFrame>
  );
}
