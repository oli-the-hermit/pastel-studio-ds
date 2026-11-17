import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchApi = vi.fn();
const execute = vi.fn();
const stored = new Map<string, unknown>();
vi.stubGlobal('comfyAPI', {
  app: { app: { extensionManager: { setting: { get: (id: string) => stored.get(id), set: async () => {} }, command: { execute } } } },
  api: { api: { fetchApi } },
});

const { loadSettings } = await import('./settings');
const { checkForUpdate, openManagerUpdates, takeAnnouncement } = await import('./updates');

const answer = (body: object) => new Response(JSON.stringify({ current: '0.1.0', latest: null, url: null, newer: false, error: null, ...body }));

beforeEach(() => {
  fetchApi.mockReset();
  execute.mockReset();
  stored.clear();
  loadSettings();
});

describe('update check', () => {
  it('asks nothing while checks are off, unless asked to', async () => {
    stored.set('PastelStudio.CheckUpdates', false);
    loadSettings();
    expect((await checkForUpdate()).status).toBe('off');
    expect(fetchApi).not.toHaveBeenCalled();

    fetchApi.mockResolvedValue(answer({}));
    expect((await checkForUpdate(true)).status).toBe('current');
    expect(fetchApi).toHaveBeenCalledWith('/pastel/update?force=1');
  });

  it('reports a newer version once per page', async () => {
    fetchApi.mockResolvedValue(answer({ latest: '0.2.0', url: 'release', newer: true }));
    const state = await checkForUpdate();
    expect(state).toMatchObject({ status: 'available', current: '0.1.0', latest: '0.2.0', url: 'release' });
    expect(takeAnnouncement()).toBe(true);
    expect(takeAnnouncement()).toBe(false);
  });

  it('says when GitHub could not be reached', async () => {
    fetchApi.mockResolvedValue(answer({ error: 'offline' }));
    expect((await checkForUpdate()).status).toBe('error');
  });

  it('opens ComfyUI Manager on its updates list only when Manager is running', async () => {
    fetchApi.mockResolvedValue(new Response('{}', { status: 200 }));
    execute.mockResolvedValue(undefined);
    expect(await openManagerUpdates()).toBe(true);
    expect(fetchApi).toHaveBeenCalledWith('/v2/manager/version');
    expect(execute).toHaveBeenCalledWith('Comfy.Manager.ShowUpdateAvailablePacks');

    execute.mockReset();
    fetchApi.mockResolvedValue(new Response('', { status: 404 }));
    expect(await openManagerUpdates()).toBe(false);
    expect(execute).not.toHaveBeenCalled();
  });
});
