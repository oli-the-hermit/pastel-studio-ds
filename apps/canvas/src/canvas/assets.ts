// Image assets as object URLs, read once from the project folder and kept while the project is open.
import { useEffect, useState } from 'react';
import { getState, useEditor } from '../model/store';
import { fsApi, join } from '../storage/fs';

const urls = new Map<string, Promise<string>>();

const mime = (file: string) => {
  const ext = file.split('.').pop()?.toLowerCase();
  return ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext ?? 'png'}`;
};

export function assetUrl(dir: string, file: string): Promise<string> {
  const key = join(dir, file);
  let url = urls.get(key);
  if (!url) {
    url = fsApi.readBytes(key).then((bytes) => URL.createObjectURL(new Blob([bytes as BlobPart], { type: mime(file) })));
    urls.set(key, url);
  }
  return url;
}

/** Remembers bytes just added, so the new asset shows without reading it back. */
export function primeAsset(dir: string, file: string, bytes: Uint8Array) {
  urls.set(join(dir, file), Promise.resolve(URL.createObjectURL(new Blob([bytes as BlobPart], { type: mime(file) }))));
}

export function forgetAssets() {
  for (const url of urls.values()) void url.then((u) => URL.revokeObjectURL(u));
  urls.clear();
}

/** The object URL of a library asset, once it has loaded. */
export function useAssetUrl(id: string | undefined): string | undefined {
  const own = useEditor((s) => s.library.assets.find((a) => a.id === id));
  const shared = useEditor((s) => (own ? undefined : s.shared.assets.find((a) => a.id === id)));
  const asset = own ?? shared;
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const dir = own ? getState().dir : getState().sharedDir;
    if (!asset || !dir) return setUrl(undefined);
    let live = true;
    assetUrl(dir, asset.file).then((u) => live && setUrl(u), () => live && setUrl(undefined));
    return () => { live = false; };
  }, [asset, own]);
  return url;
}
