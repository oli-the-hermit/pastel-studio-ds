// File access, the same in both places: the desktop app's own commands (src-tauri/src/main.rs), or the
// dev server's endpoints (fs-plugin.ts) when the canvas runs in a browser. Paths are absolute.
import { isDesktop } from '@pastel-studio/desktop';

export interface DirEntry {
  name: string;
  dir: boolean;
}

const invoke = async <T>(cmd: string, args?: Record<string, unknown>) =>
  (await import('@tauri-apps/api/core')).invoke<T>(cmd, args);

async function dev(op: string, path = '', init?: RequestInit): Promise<Response> {
  const res = await fetch(`/__canvas/${op}?path=${encodeURIComponent(path)}`, init);
  if (!res.ok) throw new Error((await res.text()) || `${op} failed: ${path}`);
  return res;
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export const fsApi = {
  /** The folder new projects go in. */
  root: (): Promise<string> => (isDesktop() ? invoke('projects_root') : dev('root').then((r) => r.json())),

  /** Asks for a folder (desktop only); resolves to undefined when cancelled. */
  pickFolder: async (): Promise<string | undefined> => (isDesktop() ? (await invoke<string | null>('pick_folder')) ?? undefined : undefined),

  list: (path: string): Promise<DirEntry[]> => (isDesktop() ? invoke('list_dir', { path }) : dev('list', path).then((r) => r.json())),

  exists: (path: string): Promise<boolean> => (isDesktop() ? invoke('path_exists', { path }) : dev('exists', path).then((r) => r.json())),

  readBytes: async (path: string): Promise<Uint8Array> =>
    new Uint8Array(isDesktop() ? await invoke<ArrayBuffer>('read_file', { path }) : await (await dev('read', path)).arrayBuffer()),

  readText: async (path: string): Promise<string> => new TextDecoder().decode(await fsApi.readBytes(path)),

  writeBytes: async (path: string, bytes: Uint8Array): Promise<void> => {
    if (isDesktop()) await invoke('write_file', { path, base64: toBase64(bytes) });
    else await dev('write', path, { method: 'POST', body: bytes as BodyInit });
  },

  writeText: (path: string, text: string) => fsApi.writeBytes(path, new TextEncoder().encode(text)),

  mkdir: async (path: string): Promise<void> => {
    if (isDesktop()) await invoke('make_dir', { path });
    else await dev('mkdir', path, { method: 'POST' });
  },

  remove: async (path: string): Promise<void> => {
    if (isDesktop()) await invoke('remove_file', { path });
    else await dev('remove', path, { method: 'POST' });
  },
};

/** Joins path parts with the separator the first part already uses. */
export function join(...parts: string[]): string {
  const sep = parts[0].includes('\\') ? '\\' : '/';
  return parts.map((p, i) => (i === 0 ? p.replace(/[\\/]+$/, '') : p.replace(/^[\\/]+|[\\/]+$/g, ''))).join(sep);
}
