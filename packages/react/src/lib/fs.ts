import { defaultLabels, type Labels } from '../labels';

/** An entry in a file tree, as the file components read it. Plain data: adapt your backend to it. */
export interface FsEntry {
  id: string;
  name: string;
  kind: 'folder' | 'file' | 'drive';
  /** Bytes (files). */
  size?: number;
  /** ISO dates. */
  modified?: string;
  created?: string;
  hidden?: boolean;
  /** Folders and drives. Undefined means "not loaded"; [] means empty. */
  children?: FsEntry[];
  /** Drives: bytes. */
  capacity?: number;
  free?: number;
  /** More facts for the details pane: { Dimensions: '1920 × 1080', Length: '3:20' }. */
  meta?: Record<string, string>;
  /** Pinned to Quick access. */
  pinned?: boolean;
}

export type FileCategory =
  | 'folder' | 'drive' | 'image' | 'video' | 'audio' | 'text' | 'document' | 'pdf' | 'spreadsheet'
  | 'presentation' | 'code' | 'archive' | 'app' | 'font' | 'model' | 'file';

const EXT: Record<string, FileCategory> = {};
const add = (c: FileCategory, list: string) => list.split(' ').forEach((e) => (EXT[e] = c));
add('image', 'png jpg jpeg gif webp avif svg bmp tif tiff heic psd exr hdr');
add('video', 'mp4 mov mkv webm avi m4v');
add('audio', 'mp3 wav flac ogg m4a aac aif aiff');
add('text', 'txt md log csv ini cfg');
add('document', 'doc docx odt rtf pages');
add('pdf', 'pdf');
add('spreadsheet', 'xls xlsx ods numbers');
add('presentation', 'ppt pptx key odp');
add('code', 'js ts tsx jsx json py rs html css c cpp h cs java go rb sh bat ps1 yml yaml toml');
add('archive', 'zip rar 7z tar gz bz2 xz');
add('app', 'exe msi app dmg apk');
add('font', 'ttf otf woff woff2');
add('model', 'blend fbx obj gltf glb stl usd usdz uasset');

const TYPE_WORD: Record<Exclude<FileCategory, 'folder' | 'drive' | 'pdf'>, keyof Labels> = {
  image: 'typeImage', video: 'typeVideo', audio: 'typeAudio', text: 'typeText', document: 'typeDocument',
  spreadsheet: 'typeSpreadsheet', presentation: 'typePresentation', code: 'typeCode', archive: 'typeArchive',
  app: 'typeApp', font: 'typeFont', model: 'typeModel', file: 'typeOther',
};

/** "png" for "Cover.PNG"; "" without one. */
export const extensionOf = (name: string) => {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i + 1).toLowerCase() : '';
};

export function categoryOf(e: Pick<FsEntry, 'kind' | 'name'>): FileCategory {
  if (e.kind === 'folder') return 'folder';
  if (e.kind === 'drive') return 'drive';
  return EXT[extensionOf(e.name)] ?? 'file';
}

/** "PNG image", "Folder", "File". Pass the words from `useLabels()` to translate it. */
export function typeLabel(e: Pick<FsEntry, 'kind' | 'name'>, labels: Labels = defaultLabels): string {
  const c = categoryOf(e);
  if (c === 'folder') return labels.typeFolder;
  if (c === 'drive') return labels.typeDrive;
  if (c === 'pdf') return labels.typePdf;
  const ext = extensionOf(e.name);
  if (!ext) return labels.typeFile;
  return labels[TYPE_WORD[c]].replace('{ext}', ext.toUpperCase());
}

/** Folders and drives: things you open by going into them. */
export const isContainer = (e: FsEntry) => e.kind !== 'file';

/** Depth-first search for an entry and the entries leading to it, root first. */
export function findPath(root: FsEntry, id: string, trail: FsEntry[] = []): FsEntry[] | null {
  const here = [...trail, root];
  if (root.id === id) return here;
  for (const c of root.children ?? []) {
    const hit = findPath(c, id, here);
    if (hit) return hit;
  }
  return null;
}

/** Every descendant of an entry, flattened (for search). */
export function descendants(e: FsEntry): FsEntry[] {
  return (e.children ?? []).flatMap((c) => [c, ...descendants(c)]);
}

/** Does a file pass an extension filter (["png", "jpg"])? An empty filter or ["*"] passes everything. */
export function matchesFilter(e: FsEntry, exts?: string[]): boolean {
  if (e.kind !== 'file' || !exts || exts.length === 0 || exts.includes('*')) return true;
  return exts.includes(extensionOf(e.name));
}
