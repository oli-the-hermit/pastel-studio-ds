// The editor's state, in one small store read through useEditor(selector). Every change to a page goes
// through edit(), which keeps the undo history and saves the project a moment later.
import { useSyncExternalStore } from 'react';
import { emptyLibrary, saveLibrary, savePage, saveProjectFile, type LoadedProject } from '../storage/project';
import { uid, type LibraryFile, type Page, type ProjectFile } from './types';
import { newFrame } from './factory';

export interface View {
  x: number;
  y: number;
  zoom: number;
}

export type SaveState = 'saved' | 'unsaved' | 'saving' | 'error';

export interface EditorState {
  dir?: string;
  project?: ProjectFile;
  pages: Record<string, Page>;
  pageId?: string;
  library: LibraryFile;
  selection: string[];
  view: View;
  save: SaveState;
  saveError?: string;
  /** The node under the pointer, outlined on the canvas and in the layers. */
  hover?: string;
  /** The text element being typed into on the canvas. */
  editing?: string;
}

let state: EditorState = { pages: {}, library: emptyLibrary(), selection: [], view: { x: 80, y: 80, zoom: 0.5 }, save: 'saved' };
const listeners = new Set<() => void>();

function set(patch: Partial<EditorState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const getState = () => state;
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useEditor<T>(selector: (s: EditorState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

export const currentPage = (s: EditorState = state): Page | undefined => (s.pageId ? s.pages[s.pageId] : undefined);

// ── History ────────────────────────────────────────────────────────────────

interface Snapshot {
  pageId: string;
  page: Page;
  selection: string[];
}
const HISTORY = 200;
let past: Snapshot[] = [];
let future: Snapshot[] = [];
let lastMerge: { key: string; at: number } | undefined;

/**
 * Changes the current page. Edits with the same `merge` key in quick succession (a drag, typing in a
 * field) become one undo step.
 */
export function edit(fn: (page: Page) => void, merge?: string) {
  const page = currentPage();
  if (!page) return;
  const now = Date.now();
  const merging = merge && lastMerge?.key === merge && now - lastMerge.at < 1200;
  if (!merging) {
    past.push({ pageId: page.id, page, selection: state.selection });
    if (past.length > HISTORY) past.shift();
    future = [];
  }
  lastMerge = merge ? { key: merge, at: now } : undefined;
  const draft = structuredClone(page);
  fn(draft);
  set({ pages: { ...state.pages, [page.id]: draft } });
  markDirty({ page: page.id });
}

/** Ends a merge run, so the next edit with the same key is its own step (e.g. on pointer up). */
export const endMerge = () => { lastMerge = undefined; };

function restore(from: Snapshot[], to: Snapshot[]) {
  const snap = from.pop();
  if (!snap) return;
  const current = state.pages[snap.pageId];
  if (current) to.push({ pageId: snap.pageId, page: current, selection: state.selection });
  lastMerge = undefined;
  set({ pages: { ...state.pages, [snap.pageId]: snap.page }, pageId: snap.pageId, selection: snap.selection });
  markDirty({ page: snap.pageId });
}
export const undo = () => restore(past, future);
export const redo = () => restore(future, past);

// ── Saving ─────────────────────────────────────────────────────────────────

const dirty = { pages: new Set<string>(), project: false, library: false };
let timer: ReturnType<typeof setTimeout> | undefined;

function markDirty(what: { page?: string; project?: boolean; library?: boolean }) {
  if (what.page) dirty.pages.add(what.page);
  if (what.project) dirty.project = true;
  if (what.library) dirty.library = true;
  if (state.save !== 'saving') set({ save: 'unsaved' });
  clearTimeout(timer);
  timer = setTimeout(() => void flush(), 700);
}

/** Writes whatever changed. Called by the autosave timer, Ctrl+S and before leaving a project. */
export async function flush(): Promise<void> {
  const { dir, project } = state;
  if (!dir || !project) return;
  clearTimeout(timer);
  const pages = [...dirty.pages];
  const writeProject = dirty.project;
  const writeLibrary = dirty.library;
  dirty.pages.clear();
  dirty.project = dirty.library = false;
  if (!pages.length && !writeProject && !writeLibrary) return;
  set({ save: 'saving' });
  try {
    for (const id of pages) if (state.pages[id]) await savePage(dir, state.pages[id]);
    if (writeProject) await saveProjectFile(dir, state.project!);
    if (writeLibrary) await saveLibrary(dir, state.library);
    set({ save: dirty.pages.size || dirty.project || dirty.library ? 'unsaved' : 'saved', saveError: undefined });
  } catch (e) {
    pages.forEach((p) => dirty.pages.add(p));
    dirty.project ||= writeProject;
    dirty.library ||= writeLibrary;
    set({ save: 'error', saveError: e instanceof Error ? e.message : String(e) });
  }
}

// ── Project and pages ──────────────────────────────────────────────────────

export function openProject(p: LoadedProject) {
  past = [];
  future = [];
  set({ dir: p.dir, project: p.project, pages: p.pages, library: p.library, pageId: p.project.pages[0]?.id, selection: [], save: 'saved' });
}

export async function closeProject() {
  await flush();
  past = [];
  future = [];
  set({ dir: undefined, project: undefined, pages: {}, pageId: undefined, library: emptyLibrary(), selection: [] });
}

export const setPage = (pageId: string) => set({ pageId, selection: [] });

export function addPage() {
  const project = state.project;
  if (!project) return;
  const page: Page = { id: uid(), name: `Page ${project.pages.length + 1}`, frames: [newFrame('Desktop', 0, 0, 1440, 900)] };
  set({ project: { ...project, pages: [...project.pages, { id: page.id, name: page.name }] }, pages: { ...state.pages, [page.id]: page }, pageId: page.id, selection: [] });
  markDirty({ page: page.id, project: true });
}

export function renamePage(id: string, name: string) {
  const project = state.project;
  if (!project || !name.trim()) return;
  set({ project: { ...project, pages: project.pages.map((p) => (p.id === id ? { ...p, name } : p)) }, pages: { ...state.pages, [id]: { ...state.pages[id], name } } });
  markDirty({ page: id, project: true });
}

/** Removes a page from the project. Its file stays on disk, so nothing is lost by mistake. */
export function removePage(id: string) {
  const project = state.project;
  if (!project || project.pages.length < 2) return;
  const pages = project.pages.filter((p) => p.id !== id);
  set({ project: { ...project, pages }, pageId: state.pageId === id ? pages[0].id : state.pageId, selection: [] });
  markDirty({ project: true });
}

// ── Selection, view, library ───────────────────────────────────────────────

export const select = (selection: string[]) => set({ selection, editing: state.editing && selection.includes(state.editing) ? state.editing : undefined });
export const setEditing = (editing?: string) => set({ editing });
export const setHover = (hover?: string) => { if (state.hover !== hover) set({ hover }); };
export const setView = (view: View) => set({ view });

export function editLibrary(fn: (lib: LibraryFile) => void) {
  const draft = structuredClone(state.library);
  fn(draft);
  set({ library: draft });
  markDirty({ library: true });
}
