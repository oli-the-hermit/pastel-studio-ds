import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'TrackList',
  group: 'Media',
  summary: 'The tracks of an album or a playlist in rows: number, title and artist, optional cover, album and date, a heart, the length and a menu.',
  status: 'beta',
  states: [
    { name: 'Rows', description: 'Quiet rows; on hover the number turns into a play button and the tools appear.' },
    { name: 'Current', description: '`currentId`: the loaded track in the accent, with the "now playing" bars in place of its number.' },
    { name: 'Liked', description: 'A liked track keeps its filled heart showing; the others show the heart on hover.' },
    { name: 'Unavailable', description: 'A track with `unavailable` (the reason, e.g. "Can\'t find this file") is dimmed and shows the reason where its artist was. It has no play button; a double click or Enter calls `onUnavailable` in place of `onPlay`. Its menu, its heart and reordering still work.' },
  ],
  variants: [
    { name: 'Album', description: 'Number, title, heart, length and menu.' },
    { name: 'Playlist', description: '`columns` with `cover`, `album` and `added`, and `onReorder` to drag rows. The date, then the album, fold away as the list narrows.' },
    { name: 'No header', description: '`header={false}` for a short list.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between rows and their tools.' },
    { keys: 'Enter', action: 'Plays the focused row; on an unavailable one, calls `onUnavailable`.' },
    { keys: 'Alt + ↑ / ↓', action: 'Moves the focused row, when `onReorder` is given, and says where it went.' },
  ],
  labels: ['trackNumber', 'trackTitle', 'album', 'dateAdded', 'duration', 'playTrack', 'pauseTrack', 'trackActions', 'dragToReorder', 'movedTo', 'like', 'unlike'],
  aria: [
    'An ordered list; each row is focusable and named "Title, Artist, 3:20".',
    'The play button on a number and the ⋮ menu name the track they act on.',
    'The loaded track has `aria-current`. A double click also plays a row.',
    'A move from the keyboard is announced in a polite live region: "Moved to position 2 of 12".',
    'An unavailable row adds the reason to its name: "Title, Artist, 3:20, Can\'t find this file".',
  ],
  related: ['PlayQueue', 'LikeButton', 'SortableList'],
};
