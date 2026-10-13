// What a component says about itself, in the meta.ts of its own folder. The documentation site
// reads it. Props come from the component's types and "tokens used" from its stylesheet, so
// neither is repeated here.

/** The section a component is listed under in the documentation. */
export type ComponentGroup = 'Actions' | 'Inputs' | 'Feedback' | 'Overlays' | 'Layout' | 'Media' | 'Files';

/** A state or a variant: its name as the docs show it, and one sentence about it. */
export interface MetaEntry {
  /** The state gallery matches its examples by this name: "Disabled", "primary". */
  name: string;
  description: string;
}

export interface KeyboardEntry {
  /** The key or combination: "Enter", "Alt + ↑". */
  keys: string;
  action: string;
}

export interface ComponentMeta {
  /** The component's name; the same as its folder. */
  name: string;
  group: ComponentGroup;
  /** One sentence: what it is and when to use it. */
  summary: string;
  /** `beta` while its props may still change. */
  status: 'stable' | 'beta';
  /** Every visual state, each reachable through props. */
  states: MetaEntry[];
  /** Looks and sizes chosen by a prop. */
  variants: MetaEntry[];
  keyboard: KeyboardEntry[];
  /** Roles, names and attributes the component sets, and what the caller must provide. */
  aria: string[];
  /** Names of components used with it or instead of it. */
  related: string[];
}
