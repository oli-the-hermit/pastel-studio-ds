// Blocks: the person's own reusable pieces, made from anything on the canvas. A block is a page whose
// frames are its variants; each placed copy is an instance that follows it, with overrides of its own.
import { worldRect } from '../canvas/geometry';
import { fsApi, join } from '../storage/fs';
import { addBlockPage, currentPage, dropBlockPage, edit, editLibrary, editPage, getState, openBlock, select, setPageShared, type LibrarySource } from './store';
import { find, nextName, walk } from './tree';
import { uid, type Asset, type BlockRef, type CanvasNode, type Page } from './types';
import { instanceTree, isVirtual } from './virtual';

/** Gives every element a slot, the name overrides use; an element keeps the one it has. */
function withSlots(node: CanvasNode): CanvasNode {
  return { ...node, slot: node.slot ?? node.id, children: node.children?.map(withSlots) };
}

/** A copy with new ids that keeps the slots, so the copy answers to the same overrides (a new variant). */
function cloneKeepingSlots(node: CanvasNode): CanvasNode {
  return { ...structuredClone(node), id: uid(), slot: node.slot ?? node.id, children: node.children?.map(cloneKeepingSlots) };
}

export const blockRef = (id: string): { ref: BlockRef; source: LibrarySource } | undefined => {
  const s = getState();
  const own = s.library.blocks?.find((b) => b.id === id);
  if (own) return { ref: own, source: 'project' };
  const shared = s.shared.blocks?.find((b) => b.id === id);
  return shared ? { ref: shared, source: 'shared' } : undefined;
};

/** How many instances of a block there are, on every page and inside other blocks. */
export function blockUsage(blockId: string, pages: Record<string, Page> = getState().pages): number {
  let n = 0;
  for (const page of Object.values(pages)) walk(page.frames, (node) => { if (node.instance?.block === blockId) n++; });
  return n;
}

/** Whether placing `blockId` inside the block `hostId` would make it contain itself. */
function contains(blockId: string, hostId: string, pages: Record<string, Page>, seen = new Set<string>()): boolean {
  if (blockId === hostId) return true;
  if (seen.has(blockId)) return false;
  seen.add(blockId);
  let found = false;
  walk(pages[blockId]?.frames ?? [], (n) => { if (!found && n.instance && contains(n.instance.block, hostId, pages, seen)) found = true; });
  return found;
}

export function canPlaceBlock(blockId: string): boolean {
  const page = currentPage();
  return !(page?.kind === 'block' && contains(blockId, page.id, getState().pages));
}

/**
 * Turns the selected element into a block: its copy becomes the block's first variant, and an
 * instance takes its place. A page's frames can't become blocks; their contents can.
 */
export function makeBlock(): string | undefined {
  const page = currentPage();
  const id = getState().selection[0];
  if (!page || !id || isVirtual(id)) return undefined;
  const hit = find(page, id);
  if (!hit?.parent) return undefined;
  const node = hit.node;
  const box = worldRect(id);
  const theme = (hit.path[0] ?? node).theme ?? 'dark';
  const fixedFrom = (size: CanvasNode['width'], measured?: number): CanvasNode['width'] => (size.mode === 'fill' ? { mode: 'fixed', value: Math.round(measured ?? 320) } : size);
  const container = node.type === 'stack' || node.type === 'frame';
  const inner = withSlots({ ...structuredClone(node), x: undefined, y: undefined, absolute: undefined });
  const variant: CanvasNode = container
    ? { ...inner, id: uid(), slot: undefined, type: 'frame', name: 'Default', x: 0, y: 0, theme, width: fixedFrom(node.width, box?.w), height: fixedFrom(node.height, box?.h) }
    : { id: uid(), type: 'frame', name: 'Default', x: 0, y: 0, theme, width: { mode: 'fit' }, height: { mode: 'fit' }, stack: { direction: 'column' }, style: {}, children: [inner] };
  const blockId = uid();
  const name = node.name.replace(/ \d+$/, '') || 'Block';
  addBlockPage({ id: blockId, name, kind: 'block', frames: [variant] });
  editLibrary((lib) => { (lib.blocks ??= []).push({ id: blockId, name, tags: [], added: new Date().toISOString() }); });
  const instance: CanvasNode = {
    id: uid(), type: 'instance', name: node.name, x: node.x, y: node.y, absolute: node.absolute,
    width: node.width, height: node.height, style: {}, instance: { block: blockId, overrides: {} },
  };
  edit((draft) => {
    const h = find(draft, id);
    if (h) h.list.splice(h.index, 1, instance);
  });
  select([instance.id]);
  return blockId;
}

/** Adds a variant to the open block: a copy of the selected variant (or the first), beside the last. */
export function addVariant() {
  const page = currentPage();
  if (page?.kind !== 'block') return;
  const sel = getState().selection[0];
  const from = page.frames.find((f) => f.id === sel) ?? page.frames[0];
  if (!from) return;
  const last = page.frames[page.frames.length - 1];
  const lastW = worldRect(last.id)?.w ?? (last.width.mode === 'fixed' ? last.width.value : 320);
  const copy = { ...cloneKeepingSlots(from), slot: undefined, name: nextName(page, 'Variant'), x: (last.x ?? 0) + lastW + 80, y: last.y ?? 0 };
  edit((draft) => { draft.frames.push(copy); });
  select([copy.id]);
}

/** Replaces an instance with plain elements, as it looks now: it stops following its block. */
export function detachInstance(id: string) {
  const s = getState();
  const page = currentPage();
  const node = page ? find(page, id)?.node : undefined;
  if (!node?.instance) return;
  const tree = instanceTree(node, s.pages);
  const plain = (n: CanvasNode): CanvasNode => {
    const { inert: _inert, slot: _slot, ...rest } = n;
    return { ...rest, id: uid(), children: n.children?.map(plain) };
  };
  const { instance: _instance, ...rest } = tree;
  const detached: CanvasNode = { ...plain(rest as CanvasNode), type: tree.stack ? 'stack' : 'frame', name: node.name };
  edit((draft) => {
    const h = find(draft, id);
    if (h) h.list.splice(h.index, 1, detached);
  });
  select([detached.id]);
}

/** Opens an instance's block, with the variant it shows selected. */
export function editInstanceBlock(id: string) {
  const page = currentPage();
  const node = page ? find(page, id)?.node : undefined;
  if (!node?.instance) return;
  const block = getState().pages[node.instance.block];
  openBlock(node.instance.block, [node.instance.variant ?? block?.frames[0]?.id ?? ''].filter(Boolean));
}

export function renameBlock(id: string, name: string) {
  const found = blockRef(id);
  if (!found || !name.trim()) return;
  editLibrary((lib) => { const b = lib.blocks?.find((x) => x.id === id); if (b) b.name = name.trim(); }, found.source);
  editPage(id, (p) => { p.name = name.trim(); });
}

/** Deletes a block nobody uses. Its file stays on disk. */
export function deleteBlock(id: string) {
  const found = blockRef(id);
  if (!found || blockUsage(id)) return;
  editLibrary((lib) => { lib.blocks = lib.blocks?.filter((b) => b.id !== id); }, found.source);
  dropBlockPage(id);
}

const libDir = (source: LibrarySource) => (source === 'shared' ? getState().sharedDir : getState().dir);

/** Which library an image is in. */
export function assetSource(id: string): LibrarySource | undefined {
  const s = getState();
  if (s.library.assets.some((a) => a.id === id)) return 'project';
  if (s.shared.assets.some((a) => a.id === id)) return 'shared';
  return undefined;
}

/** Copies an image's file into another library, keeping its id; resolves to its entry there. */
async function copyAsset(asset: Asset, to: LibrarySource, folder?: string): Promise<Asset> {
  const from = assetSource(asset.id);
  const fromDir = from && libDir(from);
  const toDir = libDir(to);
  if (fromDir && toDir && fromDir !== toDir) await fsApi.writeBytes(join(toDir, asset.file), await fsApi.readBytes(join(fromDir, asset.file)));
  return { ...asset, folder };
}

/** Moves an image to the shared library or back into the project. */
export async function moveAsset(id: string, to: LibrarySource) {
  const from = assetSource(id);
  if (!from || from === to) return;
  const s = getState();
  const asset = (from === 'shared' ? s.shared : s.library).assets.find((a) => a.id === id)!;
  const copy = await copyAsset(asset, to);
  editLibrary((lib) => { lib.assets.push(copy); }, to);
  editLibrary((lib) => { lib.assets = lib.assets.filter((a) => a.id !== id); }, from);
}

/**
 * Moves a block to the shared library or back. The images it uses are copied along, so it shows the
 * same in every project; the copies left behind stay in place.
 */
export async function moveBlock(id: string, to: LibrarySource) {
  const found = blockRef(id);
  const s = getState();
  if (!found || found.source === to) return;
  const used = new Set<string>();
  walk(s.pages[id]?.frames ?? [], (n) => { if (n.asset) used.add(n.asset); });
  const target = to === 'shared' ? s.shared : s.library;
  for (const assetId of used) {
    if (target.assets.some((a) => a.id === assetId)) continue;
    const asset = [...s.library.assets, ...s.shared.assets].find((a) => a.id === assetId);
    if (asset) {
      const copy = await copyAsset(asset, to);
      editLibrary((lib) => { lib.assets.push(copy); }, to);
    }
  }
  editLibrary((lib) => { (lib.blocks ??= []).push({ ...found.ref, folder: undefined }); }, to);
  editLibrary((lib) => { lib.blocks = lib.blocks?.filter((b) => b.id !== id); }, found.source);
  setPageShared(id, to === 'shared');
}
