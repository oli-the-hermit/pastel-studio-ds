import React, { createContext, useContext, useMemo } from 'react';

/**
 * The components' own words (screen-reader names, placeholders, tooltips), in one shared list,
 * so each word is translated once. Components never import an app's strings.
 * A word is added here together with the first component that uses it.
 */
export const defaultLabels = {};

export type Labels = typeof defaultLabels;

/** The type of a component's `labels` prop: only the words that component uses. */
export type LabelOverrides<K extends keyof Labels> = Partial<Pick<Labels, K>>;

const LabelsContext = createContext<Labels>(defaultLabels);

interface LabelsProviderProps {
  /** The words to translate or replace; the rest keep their defaults. */
  labels: Partial<Labels>;
  children: React.ReactNode;
}

/** Translates or replaces the components' words for everything inside it. Providers nest. */
export function LabelsProvider({ labels, children }: LabelsProviderProps) {
  const inherited = useContext(LabelsContext);
  const value = useMemo(() => ({ ...inherited, ...labels }), [inherited, labels]);
  return <LabelsContext.Provider value={value}>{children}</LabelsContext.Provider>;
}

/** A component's words: the defaults, then the nearest provider's, then its own `labels` prop. */
export function useLabels(overrides?: Partial<Labels>): Labels {
  const labels = useContext(LabelsContext);
  return overrides ? { ...labels, ...overrides } : labels;
}
