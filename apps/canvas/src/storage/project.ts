// A project on disk: a folder named "<name>.canvas" holding project.json, pages/<id>.json,
// library.json and assets/. Everything is pretty-printed JSON, so git diffs and Claude read it easily.
import { uid, type LibraryFile, type Page, type ProjectFile } from '../model/types';
import { newFrame } from '../model/factory';
import { fsApi, join } from './fs';

export const PROJECT_EXT = '.canvas';

export interface LoadedProject {
  dir: string;
  project: ProjectFile;
  pages: Record<string, Page>;
  library: LibraryFile;
}

const pretty = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
export const emptyLibrary = (): LibraryFile => ({ version: 1, folders: [], assets: [] });

export async function listProjects(root: string): Promise<{ name: string; dir: string }[]> {
  const entries = await fsApi.list(root);
  return entries
    .filter((e) => e.dir && e.name.endsWith(PROJECT_EXT))
    .map((e) => ({ name: e.name.slice(0, -PROJECT_EXT.length), dir: join(root, e.name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createProject(root: string, name: string): Promise<string> {
  const safe = name.replace(/[<>:"/\\|?*]+/g, '-').trim() || 'Untitled';
  const dir = join(root, safe + PROJECT_EXT);
  if (await fsApi.exists(dir)) throw new Error(`A project named "${safe}" already exists.`);
  const page: Page = { id: uid(), name: 'Page 1', frames: [newFrame('Desktop', 0, 0, 1440, 900)] };
  const project: ProjectFile = { version: 1, name: safe, pages: [{ id: page.id, name: page.name }] };
  await fsApi.mkdir(join(dir, 'assets'));
  await fsApi.writeText(join(dir, 'project.json'), pretty(project));
  await fsApi.writeText(join(dir, 'pages', `${page.id}.json`), pretty(page));
  await fsApi.writeText(join(dir, 'library.json'), pretty(emptyLibrary()));
  return dir;
}

export async function loadProject(dir: string): Promise<LoadedProject> {
  const project = JSON.parse(await fsApi.readText(join(dir, 'project.json'))) as ProjectFile;
  const pages: Record<string, Page> = {};
  for (const ref of project.pages) {
    const path = join(dir, 'pages', `${ref.id}.json`);
    pages[ref.id] = (await fsApi.exists(path)) ? JSON.parse(await fsApi.readText(path)) : { id: ref.id, name: ref.name, frames: [] };
  }
  const libPath = join(dir, 'library.json');
  const library = (await fsApi.exists(libPath)) ? (JSON.parse(await fsApi.readText(libPath)) as LibraryFile) : emptyLibrary();
  return { dir, project, pages, library };
}

export const saveProjectFile = (dir: string, project: ProjectFile) => fsApi.writeText(join(dir, 'project.json'), pretty(project));
export const savePage = (dir: string, page: Page) => fsApi.writeText(join(dir, 'pages', `${page.id}.json`), pretty(page));
export const saveLibrary = (dir: string, library: LibraryFile) => fsApi.writeText(join(dir, 'library.json'), pretty(library));
