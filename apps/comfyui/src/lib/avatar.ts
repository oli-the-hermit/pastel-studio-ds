import { useEffect, useState } from 'react';
import { api } from '../comfy';
import { getSettings, setSetting } from './settings';

// The profile picture is user/<name>/pastel_studio/avatar.png. ComfyUI serves user files as
// downloads, so it is fetched once into an object URL that every node shares.
const FILE = encodeURIComponent('pastel_studio/avatar.png');
const SIZE = 256;

let cached: { version: string; url: Promise<string | null> } | null = null;

function avatarUrl(version: string): Promise<string | null> {
  if (cached?.version === version) return cached.url;
  const url = api.fetchApi(`/userdata/${FILE}`).then(async (r) => (r.ok ? URL.createObjectURL(await r.blob()) : null));
  cached = { version, url };
  return url;
}

/** The profile picture's URL, or undefined without one. */
export function useAvatar(version: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>();
  useEffect(() => {
    let live = true;
    if (!version) setUrl(undefined);
    else void avatarUrl(version).then((u) => live && setUrl(u ?? undefined));
    return () => {
      live = false;
    };
  }, [version]);
  return url;
}

/** A square crop of the picture, SIZE pixels, as PNG: small enough to keep with the settings. */
async function squarePng(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  canvas.getContext('2d')!.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('The picture could not be read'))), 'image/png'));
}

export async function setAvatar(file: File): Promise<void> {
  const response = await api.fetchApi(`/userdata/${FILE}?overwrite=true`, { method: 'POST', body: await squarePng(file) });
  if (!response.ok) throw new Error(`Saving the picture failed (${response.status})`);
  await setSetting('avatarVersion', String(Date.now()));
}

export async function removeAvatar(): Promise<void> {
  if (!getSettings().avatarVersion) return;
  const response = await api.fetchApi(`/userdata/${FILE}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 404) throw new Error(`Removing the picture failed (${response.status})`);
  await setSetting('avatarVersion', '');
}
