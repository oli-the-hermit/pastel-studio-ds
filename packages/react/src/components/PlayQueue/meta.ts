import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'PlayQueue',
  group: 'Media',
  summary: 'The music queue as a side card: what plays now, what plays next (reorder, remove), the history and the queue\'s actions. A queue of thousands draws only the rows near the screen.',
  status: 'beta',
  states: [
    { name: 'Up next', description: 'Now playing in the accent, then the queued tracks with their total length.' },
    { name: 'History', description: 'The tracks played so far; a click plays one again.' },
    { name: 'Empty', description: 'Nothing queued: a short line says how to add songs.' },
    { name: 'Unavailable', description: 'A track with `unavailable` (the reason, e.g. "Can\'t find this file") is dimmed and shows the reason where its artist was. A click, Enter or Space calls `onUnavailable` in place of `onPlay`; removing and reordering it still work.' },
    { name: 'Long queue', description: 'With more than 200 tracks in Up next or in the history, only the rows near the screen are drawn as the card\'s body scrolls; the rest are stood for by empty space of their height. The focused row and a dragged row stay drawn, and rows can be played, removed and moved as before.' },
  ],
  variants: [
    { name: 'Full', description: 'With a source ("Next from …"), the queue menu, a close button and the autoplay switch.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the tabs, the rows and their tools.' },
    { keys: 'Enter / Space', action: 'Plays the focused row; on an unavailable one, calls `onUnavailable`.' },
    { keys: 'Alt + ↑ / ↓', action: 'Moves the focused queued track, when `onReorder` is given, and says where it went.' },
  ],
  labels: ['queue', 'upNext', 'history', 'nowPlaying', 'nextFrom', 'queueEmpty', 'historyEmpty', 'queueActions', 'shuffleQueue', 'saveAsPlaylist', 'clearQueue', 'autoplay', 'autoplayHint', 'closeQueue', 'removeFromQueue', 'dragToReorder', 'movedTo'],
  aria: [
    'An `aside` landmark named by its heading, "Queue".',
    'The playing row has `aria-current`; each remove tool names its track.',
    'An unavailable row reads its reason with its title, in the artist\'s place.',
    'Up next and history are lists; the tab switch is a SegmentedControl.',
    'With more than 200 tracks in a list only the rows near the screen are in the page: each has `aria-posinset` and `aria-setsize`, and the row that last had the focus stays in the page while it is scrolled away.',
    'A move from the keyboard is announced in a polite live region: "Moved to position 2 of 12".',
  ],
  related: ['QueuePanel', 'TrackList', 'TransportControls'],
};
