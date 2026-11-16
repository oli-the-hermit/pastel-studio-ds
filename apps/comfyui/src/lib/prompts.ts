import { api } from '../comfy';

// Saved prompts are .md files in the ComfyUI user's folder (user/<name>/pastel_studio/prompts),
// next to its workflows, through ComfyUI's own /userdata API: per user, and inside ComfyUI's
// path checks. Only the export has a route of its own (pack/pastel_studio/routes.py).
const DIR = 'pastel_studio/prompts';

export interface SavedPrompt {
  name: string;
  /** Milliseconds since the epoch. */
  modified: number;
}

export class PromptExistsError extends Error {}

const fileOf = (name: string) => encodeURIComponent(`${DIR}/${name}.md`);

/** A name that is safe as a file name on every system: no path characters, no trailing dots. */
export function cleanPromptName(raw: string): string {
  return [...raw]
    .map((ch) => (ch.charCodeAt(0) < 32 ? ' ' : ch))
    .join('')
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.\s]+$/, '')
    .slice(0, 120);
}

async function ensureOk(response: Response, what: string): Promise<Response> {
  if (!response.ok) throw new Error(`${what} failed (${response.status})`);
  return response;
}

export async function listPrompts(): Promise<SavedPrompt[]> {
  const response = await api.fetchApi(`/userdata?dir=${encodeURIComponent(DIR)}&full_info=true`);
  if (response.status === 404) return [];
  const files = (await (await ensureOk(response, 'Listing prompts')).json()) as { path: string; modified: number }[];
  return files
    .filter((f) => f.path.toLowerCase().endsWith('.md') && !f.path.includes('/'))
    .map((f) => ({ name: f.path.slice(0, -3), modified: f.modified }))
    .sort((a, b) => b.modified - a.modified);
}

export async function loadPrompt(name: string): Promise<string> {
  const response = await ensureOk(await api.fetchApi(`/userdata/${fileOf(name)}`), 'Loading the prompt');
  return response.text();
}

/** Saves a prompt; with `overwrite` false, throws PromptExistsError when the name is taken. */
export async function savePrompt(name: string, markdown: string, overwrite: boolean): Promise<void> {
  const response = await api.fetchApi(`/userdata/${fileOf(name)}?overwrite=${overwrite}`, {
    method: 'POST',
    body: markdown,
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
  if (response.status === 409) throw new PromptExistsError(name);
  await ensureOk(response, 'Saving the prompt');
}

export async function deletePrompt(name: string): Promise<void> {
  await ensureOk(await api.fetchApi(`/userdata/${fileOf(name)}`, { method: 'DELETE' }), 'Deleting the prompt');
}

export async function renamePrompt(from: string, to: string): Promise<void> {
  const response = await api.fetchApi(`/userdata/${fileOf(from)}/move/${fileOf(to)}?overwrite=false`, { method: 'POST' });
  if (response.status === 409) throw new PromptExistsError(to);
  await ensureOk(response, 'Renaming the prompt');
}

/** Every saved prompt in one .zip, or null when there are none. */
export async function exportPrompts(): Promise<{ blob: Blob; filename: string } | null> {
  const response = await api.fetchApi('/pastel/prompts/export');
  if (response.status === 404) return null;
  await ensureOk(response, 'Exporting prompts');
  const filename = /filename="([^"]+)"/.exec(response.headers.get('Content-Disposition') ?? '')?.[1] ?? 'pastel-prompts.zip';
  return { blob: await response.blob(), filename };
}
