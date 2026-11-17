// Files on the user's own drives. The File System Access pickers work in Chromium browsers and
// in the ComfyUI desktop app; elsewhere a save becomes a download and an open uses a file input.

interface PickerType {
  description: string;
  accept: Record<string, string[]>;
}

interface FileHandle {
  createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }>;
  getFile: () => Promise<File>;
}

interface PickerWindow {
  showSaveFilePicker?: (options: { suggestedName: string; types: PickerType[] }) => Promise<FileHandle>;
  showOpenFilePicker?: (options: { types: PickerType[]; multiple: false }) => Promise<FileHandle[]>;
}

export const MARKDOWN_TYPE: PickerType = { description: 'Markdown', accept: { 'text/markdown': ['.md'], 'text/plain': ['.txt'] } };
export const ZIP_TYPE: PickerType = { description: 'Zip archive', accept: { 'application/zip': ['.zip'] } };

const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Asks where to save, then saves. False when the person cancelled. */
export async function saveFileAs(blob: Blob, suggestedName: string, type: PickerType): Promise<boolean> {
  const picker = (window as PickerWindow).showSaveFilePicker;
  if (!picker) {
    download(blob, suggestedName);
    return true;
  }
  try {
    const handle = await picker({ suggestedName, types: [type] });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (error) {
    if (isAbort(error)) return false;
    throw error;
  }
}

/** Asks for a file and reads it as text. Null when the person cancelled. */
export async function openTextFile(type: PickerType): Promise<{ name: string; text: string } | null> {
  const picker = (window as PickerWindow).showOpenFilePicker;
  if (picker) {
    try {
      const [handle] = await picker({ types: [type], multiple: false });
      const file = await handle.getFile();
      return { name: file.name, text: await file.text() };
    } catch (error) {
      if (isAbort(error)) return null;
      throw error;
    }
  }
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = Object.values(type.accept).flat().join(',');
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      resolve(file ? { name: file.name, text: await file.text() } : null);
    });
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}

/** "fox-in-snow.md" → "fox-in-snow". */
export const baseName = (filename: string) => filename.replace(/\.(md|markdown|txt)$/i, '');
