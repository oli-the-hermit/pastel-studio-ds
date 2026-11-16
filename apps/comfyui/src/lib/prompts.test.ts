import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchApi = vi.fn();
vi.stubGlobal('comfyAPI', { app: { app: {} }, api: { api: { fetchApi } } });

const { cleanPromptName, exportPrompts, listPrompts, PromptExistsError, renamePrompt, savePrompt } = await import('./prompts');

const respond = (status: number, body: BodyInit | null = null, headers: Record<string, string> = {}) => new Response(body, { status, headers });

beforeEach(() => fetchApi.mockReset());

describe('cleanPromptName', () => {
  it('keeps a readable name and drops what a file name can\'t hold', () => {
    expect(cleanPromptName('  Fox / snow: "dawn"?  ')).toBe('Fox snow dawn');
    expect(cleanPromptName('ends with dots...')).toBe('ends with dots');
    expect(cleanPromptName('tab\there')).toBe('tab here');
    expect(cleanPromptName('x'.repeat(200))).toHaveLength(120);
    expect(cleanPromptName(' / ')).toBe('');
  });
});

describe('saved prompts', () => {
  it('lists .md files in the prompts folder, newest first', async () => {
    fetchApi.mockResolvedValue(respond(200, JSON.stringify([
      { path: 'old.md', modified: 1 },
      { path: 'new.md', modified: 3 },
      { path: 'notes.txt', modified: 2 },
      { path: 'sub/deep.md', modified: 4 },
    ])));
    expect(await listPrompts()).toEqual([{ name: 'new', modified: 3 }, { name: 'old', modified: 1 }]);
    expect(fetchApi.mock.calls[0][0]).toBe('/userdata?dir=pastel_studio%2Fprompts&full_info=true');
  });

  it('treats a missing folder as no prompts', async () => {
    fetchApi.mockResolvedValue(respond(404));
    expect(await listPrompts()).toEqual([]);
  });

  it('saves to one encoded path and reports a taken name', async () => {
    fetchApi.mockResolvedValue(respond(200, '"ok"'));
    await savePrompt('fox & snow', '# Fox', false);
    expect(fetchApi.mock.calls[0][0]).toBe('/userdata/pastel_studio%2Fprompts%2Ffox%20%26%20snow.md?overwrite=false');
    expect(fetchApi.mock.calls[0][1]).toMatchObject({ method: 'POST', body: '# Fox' });

    fetchApi.mockResolvedValue(respond(409));
    await expect(savePrompt('fox', '', false)).rejects.toBeInstanceOf(PromptExistsError);
    await expect(renamePrompt('a', 'fox')).rejects.toBeInstanceOf(PromptExistsError);
  });

  it('exports a zip with the server\'s file name, or null when nothing is saved', async () => {
    fetchApi.mockResolvedValue(respond(200, 'zip', { 'Content-Disposition': 'attachment; filename="pastel-prompts-2026-11-16.zip"' }));
    expect((await exportPrompts())?.filename).toBe('pastel-prompts-2026-11-16.zip');
    fetchApi.mockResolvedValue(respond(404));
    expect(await exportPrompts()).toBeNull();
  });
});
