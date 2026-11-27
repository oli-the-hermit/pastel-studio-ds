import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'PlayQueue',
  group: 'Media',
  summary: 'The music queue as a side card: what plays now, what plays next (reorder, remove), the history and the queue\'s actions.',
  status: 'beta',
  states: [
    { name: 'Up next', description: 'Now playing in the accent, then the queued tracks with their total length.' },
    { name: 'History', description: 'The tracks played so far; a click plays one again.' },
    { name: 'Empty', description: 'Nothing queued: a short line says how to add songs.' },
    { name: 'Unavailable', description: 'A track with `unavailable` (the reason, e.g. "Can\'t find this file") is dimmed and shows the reason where its artist was. A click, Enter or Space calls `onUnavailable` in place of `onPlay`; removing and reordering it still work.' },
  ],
  variants: [
    { name: 'Full', description: 'With a source ("Next from …"), the queue menu, a close button and the autoplay switch.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the tabs, the rows and their tools.' },
    { keys: 'Enter / Space', action: 'Plays the focused row; on an unavailable one, calls `onUnavailable`.' },
    { keys: 'Alt + ↑ / ↓', action: 'Moves the focused queued track, when `onReorder` is given.' },
  ],
  labels: ['queue', 'upNext', 'history', 'nowPlaying', 'nextFrom', 'queueEmpty', 'historyEmpty', 'queueActions', 'shuffleQueue', 'saveAsPlaylist', 'clearQueue', 'autoplay', 'autoplayHint', 'closeQueue', 'removeFromQueue', 'dragToReorder'],
  aria: [
    'An `aside` landmark named by its heading, "Queue".',
    'The playing row has `aria-current`; each remove tool names its track.',
    'An unavailable row reads its reason with its title, in the artist\'s place.',
    'Up next and history are lists; the tab switch is a SegmentedControl.',
  ],
  related: ['QueuePanel', 'TrackList', 'TransportControls'],
};
