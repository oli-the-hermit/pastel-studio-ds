// Elements that show somewhere with changes of their own: inside an instance of a block, and inside a
// breakpoint (a frame's layout at another width). Both are built on the fly from the original, with
// ids that say where they are:
//   instance/slot      an element of a block, as one instance shows it
//   frame@bp           a breakpoint's frame
//   frame@bp/node      an element, at that breakpoint
// Reading one gives the element as it looks there; writing one stores only what differs from the
// original, so setting a value back to the original's removes the override.
import { find } from './tree';
import { OVERRIDE_KEYS, type Breakpoint, type CanvasNode, type Override, type Page } from './types';

/**
 * Fields kept whole in an override, and the three kept field by field: a style, a stack, and a
 * component's props each change one value at a time, so the rest keeps following the original
 * (a variant's tonal button stays the variant's when an instance changes only its label). A
 * value of null in one of those removes it.
 */
const MERGED = ['style', 'stack'] as const;

function mergeFields<T extends object>(base: T | undefined, o: Record<string, unknown> | undefined): T | undefined {
  if (!o) return base;
  const out: Record<string, unknown> = { ...(base ?? {}) };
  for (const [k, v] of Object.entries(o)) {
    if (v === null) delete out[k];
    else out[k] = structuredClone(v);
  }
  return out as T;
}

function applied(node: CanvasNode, o?: Override): CanvasNode {
  if (!o) return node;
  const { style, stack, component, ...whole } = o as Override & Record<string, unknown>;
  const out: CanvasNode = { ...node, ...structuredClone(whole) };
  if (style) out.style = mergeFields(node.style, style as unknown as Record<string, unknown>) ?? {};
  if (stack) out.stack = mergeFields(node.stack, stack as unknown as Record<string, unknown>);
  if (component && node.component) out.component = { ...node.component, props: mergeFields(node.component.props, (component as { props?: Record<string, unknown> }).props) ?? {} };
  return out;
}

/** The fields of `after` that differ from `before`, with null for those it removed. */
function fieldDiff(before: Record<string, unknown> | undefined, after: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  const out: Record<string, unknown> = {};
  for (const k of new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])) {
    const a = after?.[k];
    if (JSON.stringify(a) === JSON.stringify(before?.[k])) continue;
    out[k] = a === undefined ? null : structuredClone(a);
  }
  return Object.keys(out).length ? out : undefined;
}

export const breakpointId = (frameId: string, bpId: string) => `${frameId}@${bpId}`;
export const isVirtual = (id: string) => id.includes('/') || id.includes('@');

const sizeOf = (n: CanvasNode, fallback: number) => (n.width.mode === 'fixed' ? n.width.value : fallback);

/** A breakpoint's frame as it shows, beside the frame: the frame with the breakpoint's changes. */
export function breakpointTree(frame: CanvasNode, bp: Breakpoint, x = 0): CanvasNode {
  const prefix = breakpointId(frame.id, bp.id);
  const map = (n: CanvasNode): CanvasNode => {
    const o = applied(n, bp.overrides[n.id]);
    return { ...o, id: `${prefix}/${n.id}`, children: o.children?.map(map) };
  };
  const root = applied(frame, bp.overrides[frame.id]);
  return {
    ...root,
    id: prefix,
    name: bp.name,
    x,
    y: frame.y,
    breakpoints: undefined,
    width: { mode: 'fixed', value: bp.width },
    height: bp.height ? { mode: 'fixed', value: bp.height } : root.height,
    children: root.children?.map(map),
  };
}

/** Every breakpoint frame of a page, placed in a row to the right of its frame. */
export function breakpointFrames(frame: CanvasNode): CanvasNode[] {
  let x = (frame.x ?? 0) + sizeOf(frame, 1440) + 120;
  return (frame.breakpoints ?? []).map((bp) => {
    const tree = breakpointTree(frame, bp, x);
    x += bp.width + 120;
    return tree;
  });
}

/** The variant an instance shows, from its block's page. */
export function variantOf(pages: Record<string, Page>, inst: CanvasNode): CanvasNode | undefined {
  const block = inst.instance ? pages[inst.instance.block] : undefined;
  return block?.frames.find((f) => f.id === inst.instance!.variant) ?? block?.frames[0];
}

/** The element of a variant with this slot (its own id, when it has no slot). */
export function slotNode(variant: CanvasNode, slot: string): CanvasNode | undefined {
  let hit: CanvasNode | undefined;
  const visit = (n: CanvasNode) => {
    if (hit) return;
    if ((n.slot ?? n.id) === slot) hit = n;
    else n.children?.forEach(visit);
  };
  variant.children?.forEach(visit);
  return hit;
}

/**
 * An instance as it shows: the variant's layout and style, the instance's own size and place, and
 * its overrides on the elements inside. Instances nested inside are built too; anything inside an
 * instance that is itself inside another (or inside a breakpoint) is display only.
 */
export function instanceTree(node: CanvasNode, pages: Record<string, Page>, depth = 0): CanvasNode {
  const variant = depth < 8 ? variantOf(pages, node) : undefined;
  const base: CanvasNode = { ...node, children: [] };
  if (!variant) return base;
  const overrides = node.instance?.overrides ?? {};
  const inert = node.inert || node.id.includes('/');
  const map = (n: CanvasNode): CanvasNode => {
    const slot = n.slot ?? n.id;
    const o = applied(n, overrides[slot]);
    const out: CanvasNode = { ...o, id: `${node.id}/${slot}`, inert: inert || undefined, children: o.children?.map(map) };
    return out.type === 'instance' && out.instance ? instanceTree({ ...out, inert: true }, pages, depth + 1) : out;
  };
  return {
    ...base,
    stack: variant.stack,
    style: { ...variant.style, ...node.style },
    children: variant.children?.map(map) ?? [],
  };
}

export interface Hit {
  node: CanvasNode;
  parent?: CanvasNode;
  path: CanvasNode[];
  /** Where a virtual element sits; undefined for an element of the page itself. */
  virtual?: 'breakpoint-frame' | 'breakpoint' | 'instance';
}

const inTree = (tree: CanvasNode, id: string) => find({ id: '', name: '', frames: [tree] }, id);

/** Any element by id, as it shows: the page's own, or one inside a breakpoint or an instance. */
export function lookup(page: Page, id: string, pages: Record<string, Page>): Hit | undefined {
  const plain = find(page, id);
  if (plain) return { node: plain.node, parent: plain.parent, path: plain.path };
  const [head, ...rest] = id.split('/');
  if (head.includes('@')) {
    const [frameId, bpId] = head.split('@');
    const frame = find(page, frameId)?.node;
    const bp = frame?.breakpoints?.find((b) => b.id === bpId);
    if (!frame || !bp) return undefined;
    const tree = breakpointTree(frame, bp, breakpointFrames(frame)[frame.breakpoints!.indexOf(bp)]?.x);
    if (!rest.length) return { node: tree, path: [], virtual: 'breakpoint-frame' };
    const hit = inTree(tree, id);
    return hit && { node: hit.node, parent: hit.parent, path: hit.path, virtual: 'breakpoint' };
  }
  const inst = find(page, head);
  if (!inst || inst.node.type !== 'instance') return undefined;
  const hit = inTree(instanceTree(inst.node, pages), id);
  return hit && { node: hit.node, parent: hit.parent, path: [...inst.path, ...hit.path], virtual: 'instance' };
}

/** Keeps the fields where `after` differs from `raw` as the override, or drops the override when none do. */
function writeOverride(map: Record<string, Override>, key: string, raw: CanvasNode, after: CanvasNode, skip: readonly string[] = []) {
  const o: Record<string, unknown> = {};
  for (const k of OVERRIDE_KEYS) {
    if (skip.includes(k)) continue;
    if ((MERGED as readonly string[]).includes(k)) {
      const d = fieldDiff(raw[k] as Record<string, unknown> | undefined, after[k] as Record<string, unknown> | undefined);
      if (d) o[k] = d;
    } else if (k === 'component') {
      const d = fieldDiff(raw.component?.props, after.component?.props);
      if (d) o.component = { props: d };
    } else if (JSON.stringify(after[k]) !== JSON.stringify(raw[k])) o[k] = structuredClone(after[k]);
  }
  if (Object.keys(o).length) map[key] = o as Override;
  else delete map[key];
}

/**
 * Changes an element of a page draft by id. A virtual element's change becomes an override on the
 * breakpoint or the instance. Structure (children) never changes through an override.
 */
export function mutate(draft: Page, id: string, fn: (n: CanvasNode) => void, pages: Record<string, Page>) {
  const plain = find(draft, id);
  if (plain) return fn(plain.node);
  const [head, ...rest] = id.split('/');
  if (head.includes('@')) {
    const [frameId, bpId] = head.split('@');
    const frame = find(draft, frameId)?.node;
    const bp = frame?.breakpoints?.find((b) => b.id === bpId);
    if (!frame || !bp) return;
    if (!rest.length) {
      const before = breakpointTree(frame, bp);
      const after = structuredClone(before);
      fn(after);
      if (after.name !== before.name) bp.name = after.name;
      if (after.width.mode === 'fixed') bp.width = after.width.value;
      if (after.height.mode === 'fixed' && JSON.stringify(after.height) !== JSON.stringify(before.height)) bp.height = after.height.value;
      writeOverride(bp.overrides, frame.id, frame, { ...after, id: frame.id }, ['name', 'width', 'height', 'x', 'y']);
      return;
    }
    const nodeId = rest.join('/');
    const raw = find(draft, nodeId)?.node;
    if (!raw) return;
    const after = structuredClone(applied(raw, bp.overrides[nodeId]));
    fn(after);
    writeOverride(bp.overrides, nodeId, raw, after);
    return;
  }
  const inst = find(draft, head)?.node;
  const variant = inst ? variantOf(pages, inst) : undefined;
  const slot = rest[0];
  const raw = variant && slot ? slotNode(variant, slot) : undefined;
  if (!inst?.instance || !raw || rest.length > 1) return;
  const after = structuredClone(applied(raw, inst.instance.overrides[slot]));
  fn(after);
  writeOverride(inst.instance.overrides, slot, raw, after);
}

/** Removes a virtual element's override: it looks like the original again. */
export function resetOverride(draft: Page, id: string) {
  const [head, ...rest] = id.split('/');
  if (head.includes('@')) {
    const [frameId, bpId] = head.split('@');
    const bp = find(draft, frameId)?.node.breakpoints?.find((b) => b.id === bpId);
    if (bp) delete bp.overrides[rest.length ? rest.join('/') : frameId];
    return;
  }
  const inst = find(draft, head)?.node;
  if (inst?.instance && rest[0]) delete inst.instance.overrides[rest[0]];
}

/** Whether a virtual element has an override of its own. */
export function hasOverride(page: Page, id: string): boolean {
  const [head, ...rest] = id.split('/');
  if (head.includes('@')) {
    const [frameId, bpId] = head.split('@');
    const bp = find(page, frameId)?.node.breakpoints?.find((b) => b.id === bpId);
    return !!bp?.overrides[rest.length ? rest.join('/') : frameId];
  }
  return !!find(page, head)?.node.instance?.overrides[rest[0]];
}
