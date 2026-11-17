import React, { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

const PortalContext = createContext<HTMLElement | null>(null);

export interface PortalProviderProps {
  /** Where floating layers render. Must be styled with the design system, like the app. */
  container: HTMLElement | null;
  children: React.ReactNode;
}

/**
 * Sets where floating layers render: popovers, menus, tours, modals and toasts. Without it,
 * popovers and tours go to the document's body and modals and toasts render in place, which is
 * right for a page. An app inside a shadow root or a transformed element (a node in a graph
 * editor, an embedded widget) gives them a container of its own, outside the transform and
 * inside its styles, so they are neither unstyled nor clipped.
 */
export function PortalProvider({ container, children }: PortalProviderProps) {
  return <PortalContext.Provider value={container}>{children}</PortalContext.Provider>;
}

/** The container set by the nearest PortalProvider, or null. */
export function usePortalContainer(): HTMLElement | null {
  return useContext(PortalContext);
}

/** Renders into the PortalProvider's container when there is one, otherwise in place. */
export function InPortal({ children }: { children: React.ReactNode }) {
  const container = usePortalContainer();
  return container ? createPortal(children, container) : <>{children}</>;
}
