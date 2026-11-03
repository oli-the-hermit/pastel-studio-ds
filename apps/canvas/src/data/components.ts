// The design-system components as the canvas knows them: their props (read from their TypeScript types
// at build time, like the docs), their meta.ts, and props that make each one show something useful
// when it's dropped on a frame.
import { COMPONENT_GROUPS, type ComponentGroup, type ComponentMeta } from '@pastel-studio/react';
import { components as data } from 'virtual:ps-components';

export interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

interface ExportDoc {
  name: string;
  description: string;
  props: PropDoc[];
  htmlAttributes?: string;
}

interface ComponentData {
  name: string;
  slug: string;
  exports: ExportDoc[];
}

export interface CatalogEntry {
  /** The folder's name, shown in the library. */
  name: string;
  /** The export placed on the canvas: the folder's namesake, or its first part (FormLayout → ModalForm). */
  exportName: string;
  group: ComponentGroup;
  summary: string;
  meta: ComponentMeta;
  /** The main export's props, plus `children` when it only takes them as an HTML attribute. */
  props: PropDoc[];
}

const metas = import.meta.glob<{ meta: ComponentMeta }>('../../../../packages/react/src/components/*/meta.ts', { eager: true });
const metaByName = new Map(Object.values(metas).map(({ meta }) => [meta.name, meta]));

/**
 * Components that can't sit inside a frame: they open in a portal above the whole window, hang off an
 * anchor element, or only draw what code hands them (MediaGrid renders tiles through callbacks).
 */
const PORTALED = new Set(['Popover', 'Menu', 'ContextMenu', 'Tour', 'ListPicker', 'MediaGrid']);

/** Props never shown in the panel: wiring, not design. */
export const HIDDEN_PROPS = new Set(['className', 'style', 'id', 'ref', 'key', 'as', 'dragRegionProps', 'dragHandleProps']);

export const isCallback = (p: PropDoc) => p.type.includes('=>') || /^\(.*\)$/.test(p.type);

export const CATALOG: CatalogEntry[] = (data as ComponentData[])
  .filter((c) => !PORTALED.has(c.name) && metaByName.has(c.name))
  .map((c) => {
    const meta = metaByName.get(c.name)!;
    const main = c.exports.find((e) => e.name === c.name) ?? c.exports[0];
    const props = [...(main?.props ?? [])];
    if (!props.some((p) => p.name === 'children') && main?.htmlAttributes) {
      props.push({ name: 'children', type: 'ReactNode', required: false, description: 'The content inside.' });
    }
    return { name: c.name, exportName: main?.name ?? c.name, group: meta.group, summary: meta.summary, meta, props };
  })
  .sort((a, b) => COMPONENT_GROUPS.indexOf(a.group) - COMPONENT_GROUPS.indexOf(b.group) || a.name.localeCompare(b.name));

/** By folder name or by the export placed on the canvas. */
export const catalogEntry = (name: string) => CATALOG.find((c) => c.name === name) ?? CATALOG.find((c) => c.exportName === name);

/** A union's values, when the prop is one: '"primary" | "tonal"' → ['primary', 'tonal']. */
export function enumValues(p: PropDoc): (string | number | boolean)[] | undefined {
  const parts = p.type.split('|').map((s) => s.trim());
  if (parts.length < 2) return undefined;
  const values = parts.map((s) => (/^".*"$|^'.*'$/.test(s) ? s.slice(1, -1) : /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : s === 'true' ? true : s === 'false' ? false : null));
  return values.every((v) => v !== null) ? (values as (string | number | boolean)[]) : undefined;
}

// Props that make a component look like itself on a frame. Icons are written { $icon: 'IconStar' }, so
// a page file stays plain JSON; the renderer turns them into the icon.
const icon = (name: string) => ({ $icon: name });
const PRESETS: Record<string, Record<string, unknown>> = {
  Button: { children: 'Button', variant: 'primary' },
  IconButton: { label: 'Add', children: icon('IconPlus') },
  TextButton: { children: 'Text button' },
  LikeButton: { liked: true },
  Chip: { children: 'Chip' },
  IconTag: { children: 'Tag', icon: icon('IconTag') },
  Card: { children: 'Card content' },
  EmptyState: { children: 'Nothing here yet' },
  Switch: { label: 'A setting', checked: true },
  Checkbox: { checked: true, 'aria-label': 'Checked' },
  SegmentedControl: { options: [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }], value: 'week', ariaLabel: 'Range' },
  Select: { options: [{ value: 'a', label: 'First option' }, { value: 'b', label: 'Second option' }], value: 'a', ariaLabel: 'Option' },
  Slider: { value: 40, label: 'Volume' },
  SearchField: { value: '', placeholder: 'Search' },
  Field: { label: 'Name', children: { $input: 'Your name' } },
  Tabs: { tabs: [{ key: 'one', label: 'Overview' }, { key: 'two', label: 'Details' }, { key: 'three', label: 'History' }], value: 'one', ariaLabel: 'Sections', children: 'Tab content' },
  ProgressBar: { value: 60, label: 'Progress' },
  StatusChip: { tone: 'live', label: 'Focus', value: '24:59' },
  Spinner: {},
  Toolbar: { label: 'Tools', children: 'Toolbar' },
  StatusBar: { children: '12 items', end: '3 selected' },
  TopBar: { title: 'Library' },
  NavRail: {
    label: 'Main',
    activeKey: 'home',
    items: [
      { key: 'home', label: 'Home', icon: icon('IconHome') },
      { key: 'library', label: 'Library', icon: icon('IconGallery') },
      { key: 'settings', label: 'Settings', icon: icon('IconSettings') },
    ],
  },
  TreeView: { label: 'Folders', nodes: [{ id: 'a', label: 'Pictures', icon: icon('IconFolder'), children: [{ id: 'b', label: 'Trips', icon: icon('IconFolder') }] }, { id: 'c', label: 'Music', icon: icon('IconFolder') }], defaultExpanded: ['a'] },
  MediaTile: { name: 'Sunset.jpg', meta: '2.4 MB' },
  CoverArt: { size: 'md' },
  TrackInfo: { title: 'Tidal Lines', artist: 'Pastel', album: 'Shorelines' },
  FormActions: { dirty: true, primaryLabel: 'Save' },
  Modal: { isOpen: true, title: 'A dialog', children: 'What the dialog says.' },
  ConfirmModal: { message: 'Delete this photo? It goes to the bin.', confirmLabel: 'Delete' },
  AccountMenu: { profile: { name: 'Sam Rivera', handle: '@sam' }, views: [], exit: { label: 'Sign out', icon: { $icon: 'IconLogOut' } } },
  AlbumDetails: { album: { $fixture: 'album' } },
  AlbumHeader: { album: { $fixture: 'album' } },
  AlbumPage: { album: { $fixture: 'album' } },
  FileDialog: { open: true, mode: 'open', root: { $fixture: 'computer' } },
  FileExplorer: { root: { $fixture: 'computer' } },
  FileIcon: { entry: { kind: 'file', name: 'Photo.jpg' }, size: 'lg' },
  MediaControls: { media: { $fixture: 'media' }, title: 'Tidal Lines' },
  MusicPlayer: { media: { $fixture: 'media' }, track: { $fixture: 'track' } },
  NowPlayingBar: { media: { $fixture: 'media' }, track: { $fixture: 'track' } },
  PipPlayer: { media: { $fixture: 'media' }, title: 'Tidal Lines', children: { $cover: 'tidal' } },
  VideoPlayer: { media: { $fixture: 'media' }, title: 'Tidal Lines', children: { $cover: 'tidal' } },
  MediaViewer: { open: true, title: 'Tidal Lines.png', children: { $cover: 'tidal' } },
};

/** A value for a required prop the preset doesn't give. */
function fallback(p: PropDoc, component: string): unknown {
  const values = enumValues(p);
  if (values) return values[0];
  if (p.type === 'string') return p.name === 'label' || p.name === 'title' ? component : p.name[0].toUpperCase() + p.name.slice(1);
  if (p.type === 'number') return 0;
  if (p.type === 'boolean') return false;
  if (p.type.includes('ReactNode') || p.type === 'ReactNode') return component;
  if (p.type.endsWith('[]')) return [];
  return undefined;
}

export function defaultProps(name: string): Record<string, unknown> {
  const entry = catalogEntry(name);
  const props: Record<string, unknown> = { ...(PRESETS[name] ?? {}) };
  for (const p of entry?.props ?? []) {
    if (p.name in props || !p.required || isCallback(p)) continue;
    const v = fallback(p, name);
    if (v !== undefined) props[p.name] = v;
  }
  return props;
}
