// The document: what a project, a page and each element on it are, as saved on disk. Kept plain and
// readable on purpose: Claude reads these files to learn what was changed.

/**
 * A design value. A token name ("--ps-surface-2") is on the system; anything else ("#ff0000",
 * "13px") is a raw value, shown as "off-system" so it reads as a proposed change to the tokens.
 */
export type Value = string;

export const isToken = (v: Value | undefined): v is string => !!v && v.startsWith('--ps-');
/** The CSS for a value: a token becomes var(--ps-…). */
export const css = (v: Value | undefined): string | undefined => (v === undefined || v === '' ? undefined : isToken(v) ? `var(${v})` : v);

/** How an element sizes along one axis: a fixed size, fill the free space, or fit its content. */
export type Size = { mode: 'fixed'; value: number } | { mode: 'fill' } | { mode: 'fit' };

export type NodeType = 'frame' | 'stack' | 'text' | 'rect' | 'image' | 'icon' | 'component' | 'instance';

export interface StackLayout {
  direction: 'row' | 'column';
  gap?: Value;
  /** Padding along the block axis (top and bottom) and the inline axis (left and right). */
  padY?: Value;
  padX?: Value;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
}

export interface Style {
  fill?: Value;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderColor?: Value;
  radius?: Value;
  elevation?: 'none' | 'overlay';
  opacity?: number;
  /** Text and icons. */
  color?: Value;
  fontSize?: Value;
  fontWeight?: Value;
  lineHeight?: Value;
  textAlign?: 'left' | 'center' | 'right';
  /** Images. */
  fit?: 'cover' | 'contain';
}

export interface CanvasNode {
  id: string;
  type: NodeType;
  name: string;
  hidden?: boolean;
  locked?: boolean;
  /**
   * Position: on the canvas for a page's frames; inside the parent for an element placed
   * absolutely (a frame without a stack, or `absolute`).
   */
  x?: number;
  y?: number;
  absolute?: boolean;
  width: Size;
  height: Size;
  /** Frames and stacks: how the children are laid out. A frame without one places them absolutely. */
  stack?: StackLayout;
  style: Style;
  /** Frames: the theme inside. */
  theme?: 'dark' | 'light';
  text?: string;
  /** Images: the asset's id in the library. */
  asset?: string;
  /** Icons: the export name, "IconStar". */
  icon?: string;
  /** Components: the design-system export and its props. */
  component?: { name: string; props: Record<string, unknown> };
  /** Instances: the block, its variant (a frame of the block's page), and what this copy changes. */
  instance?: { block: string; variant?: string; overrides: Record<string, Override> };
  /**
   * Inside a block: the name its instances' overrides use for this element. Variants share it, so
   * an override (a changed label, say) follows the instance from one variant to another.
   */
  slot?: string;
  /** Top-level frames: the same layout at other widths, each with its own changes. */
  breakpoints?: Breakpoint[];
  /** Built for display only (inside an instance placed in a breakpoint): not selectable. */
  inert?: boolean;
  children?: CanvasNode[];
}

/** What an instance or a breakpoint changes on one element: whole fields, replacing the original's. */
export type Override = Partial<Pick<CanvasNode, 'name' | 'text' | 'hidden' | 'asset' | 'icon' | 'style' | 'stack' | 'width' | 'height' | 'x' | 'y' | 'absolute' | 'component' | 'instance'>>;
export const OVERRIDE_KEYS = ['name', 'text', 'hidden', 'asset', 'icon', 'style', 'stack', 'width', 'height', 'x', 'y', 'absolute', 'component', 'instance'] as const;

export interface Breakpoint {
  id: string;
  name: string;
  width: number;
  height?: number;
  /** Changes for this width, by element id. */
  overrides: Record<string, Override>;
}

export interface Page {
  id: string;
  name: string;
  /** The top-level frames (artboards), placed on the canvas. On a block's page, its variants. */
  frames: CanvasNode[];
  /** A block's page: its variants, edited like any page but saved under blocks/. */
  kind?: 'block';
  /** A block from the shared library rather than the project's own. */
  shared?: boolean;
}

export interface ThemeOverrides {
  /** An accent preset id from the design system ("sky-blue"); none keeps the default. */
  accent?: string;
  /** Token values per theme: { "--ps-surface-2": "#2b2f36" }. */
  dark?: Record<string, string>;
  light?: Record<string, string>;
}

export interface ProjectFile {
  version: 1;
  name: string;
  pages: { id: string; name: string }[];
  /** Proposed changes to the design system's tokens, shown on every frame. */
  theme?: ThemeOverrides;
}

export interface Folder {
  id: string;
  name: string;
  parent?: string;
  /** What the folder holds: images (the default) or blocks. */
  kind?: 'image' | 'block';
}

/** A reusable block: its variants live in blocks/<id>.json, a page of their own. */
export interface BlockRef {
  id: string;
  name: string;
  folder?: string;
  tags: string[];
  description?: string;
  added: string;
}

/** Images, blocks and the way they're organized: one per project, and one shared by all of them. */
export interface LibraryFile {
  version: 1;
  folders: Folder[];
  assets: Asset[];
  blocks?: BlockRef[];
}

export interface Asset {
  id: string;
  kind: 'image';
  name: string;
  /** Path inside the project folder: "assets/ab12.png". */
  file: string;
  folder?: string;
  tags: string[];
  favorite?: boolean;
  width?: number;
  height?: number;
  added: string;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
