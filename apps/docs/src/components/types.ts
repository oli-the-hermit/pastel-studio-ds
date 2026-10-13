// The shape of 'virtual:ps-components' (built by components-plugin.ts from
// packages/react/src/components), and of a component once its meta.ts is joined to it.
import type { ComponentMeta } from '@pastel-studio/react';

export interface PropDoc {
  name: string;
  /** The type as written, or a union's values: '"primary" | "tonal"'. */
  type: string;
  required: boolean;
  /** The default as text: "md", "false". */
  defaultValue?: string;
  /** The prop's doc comment. */
  description: string;
}

/** One exported component of a folder: most folders have one, a few add parts (Card, CardHeader). */
export interface ExportDoc {
  name: string;
  /** The component's doc comment. */
  description: string;
  /** Its own props, in source order. Attributes inherited from the DOM are left out. */
  props: PropDoc[];
  /** The DOM attributes it also accepts, by their React type: "ButtonHTMLAttributes". */
  htmlAttributes?: string;
}

export interface ComponentData {
  /** The folder and the main component: "IconButton". */
  name: string;
  /** Its address in the docs: "icon-button". */
  slug: string;
  exports: ExportDoc[];
  /** Tokens from @pastel-studio/tokens that its stylesheet reads, in name order. */
  tokens: string[];
  /** Tokens its stylesheet declares: the component's own knobs, with their defaults. */
  ownTokens: { name: string; value: string }[];
}

/** A component as the docs show it: what its code says, plus what its meta.ts says. */
export interface ComponentDoc extends ComponentData {
  meta: ComponentMeta;
}
