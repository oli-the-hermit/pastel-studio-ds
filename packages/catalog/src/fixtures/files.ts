import type { FsEntry } from '@pastel-studio/react';

// A small computer for the file components' examples: fixed dates, so screenshots stay the same.
const GB = 1024 ** 3;
const MB = 1024 ** 2;
const file = (id: string, name: string, size: number, modified: string, extra: Partial<FsEntry> = {}): FsEntry => ({ id, name, kind: 'file', size, modified, created: modified, ...extra });

export const albums: FsEntry = {
  id: 'albums', name: 'Albums', kind: 'folder', modified: '2026-10-02T18:20:00', children: [
    { id: 'tidal', name: 'Tidal Lines', kind: 'folder', modified: '2026-09-28T10:05:00', children: [] },
    { id: 'harbour', name: 'Harbour Lights', kind: 'folder', modified: '2026-08-14T21:40:00', children: [] },
    file('cover', 'Cover.png', 2.4 * MB, '2026-09-28T10:12:00', { meta: { Dimensions: '3000 × 3000' } }),
    file('cover-psd', 'Cover.psd', 84 * MB, '2026-09-27T16:30:00'),
    file('low-tide', '01 Low Tide.flac', 38 * MB, '2026-09-28T10:06:00', { meta: { Length: '4:12' } }),
    file('the-turn', '02 The Turn.flac', 41 * MB, '2026-09-28T10:07:00', { meta: { Length: '4:31' } }),
    file('liner', 'Liner notes.pdf', 1.1 * MB, '2026-09-20T09:00:00'),
    file('tracklist', 'Tracklist.txt', 2 * 1024, '2026-09-20T09:04:00'),
    file('masters', 'Masters.zip', 1.6 * GB, '2026-09-29T23:10:00'),
    file('session', 'Session.blend', 212 * MB, '2026-07-02T14:00:00'),
    file('desktop-ini', 'desktop.ini', 180, '2026-01-04T08:00:00', { hidden: true }),
  ],
};

export const music: FsEntry = {
  id: 'music', name: 'Music', kind: 'folder', modified: '2026-10-02T18:20:00', children: [
    albums,
    { id: 'podcasts', name: 'Podcasts', kind: 'folder', modified: '2026-09-30T07:15:00', children: [] },
    file('mix', 'Late mix.mp3', 96 * MB, '2026-10-01T22:45:00'),
    file('budget', 'Studio budget.xlsx', 48 * 1024, '2026-09-12T11:30:00'),
    file('player', 'Player setup.exe', 64 * MB, '2026-06-08T13:00:00'),
  ],
};

export const computer: FsEntry = {
  id: 'pc', name: 'This computer', kind: 'folder', children: [
    { id: 'c', name: 'System (C:)', kind: 'drive', capacity: 512 * GB, free: 41 * GB, children: [] },
    { id: 'd', name: 'Media (D:)', kind: 'drive', capacity: 2048 * GB, free: 410 * GB, children: [music] },
    { id: 'e', name: 'Backup (E:)', kind: 'drive', capacity: 1024 * GB, free: 802 * GB, children: [] },
  ],
};
