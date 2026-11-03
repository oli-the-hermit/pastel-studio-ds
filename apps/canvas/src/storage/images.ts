// Adding image files to the project: copied into assets/ under a new id, measured, and listed in the library.
import { primeAsset } from '../canvas/assets';
import { editLibrary, getState } from '../model/store';
import { uid, type Asset } from '../model/types';
import { fsApi, join } from './fs';

const IMAGE = /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i;
export const isImageFile = (f: File) => f.type.startsWith('image/') || IMAGE.test(f.name);

/** The image's size, when the browser can tell within a moment; an unknown size never holds up an import. */
async function measure(file: File): Promise<{ width?: number; height?: number }> {
  const timeout = new Promise<{ width?: number; height?: number }>((resolve) => setTimeout(() => resolve({}), 2000));
  const read = (async () => {
    try {
      const bitmap = await createImageBitmap(file);
      const size = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return size;
    } catch {
      // SVG and some formats can't become a bitmap: read them as an <img> instead.
      const url = URL.createObjectURL(file);
      try {
        const img = new Image();
        img.src = url;
        await img.decode();
        return { width: img.naturalWidth || undefined, height: img.naturalHeight || undefined };
      } finally {
        URL.revokeObjectURL(url);
      }
    }
  })().catch(() => ({}));
  return Promise.race([read, timeout]);
}

export async function importImages(files: File[], folder?: string): Promise<Asset[]> {
  const dir = getState().dir;
  if (!dir) return [];
  const added: Asset[] = [];
  for (const f of files.filter(isImageFile)) {
    const id = uid();
    const ext = (f.name.match(IMAGE)?.[1] ?? 'png').toLowerCase();
    const file = `assets/${id}.${ext}`;
    const bytes = new Uint8Array(await f.arrayBuffer());
    await fsApi.writeBytes(join(dir, file), bytes);
    primeAsset(dir, file, bytes);
    added.push({ id, kind: 'image', name: f.name, file, folder, tags: [], ...(await measure(f)), added: new Date().toISOString() });
  }
  if (added.length) editLibrary((lib) => { lib.assets.push(...added); });
  return added;
}
