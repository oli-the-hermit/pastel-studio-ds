import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'VideoPlayer',
  group: 'Media',
  summary: 'A whole video player: the picture, the controls under it or floating over it, full screen, and keyboard shortcuts.',
  status: 'beta',
  states: [
    { name: 'Paused', description: 'The big play button over the picture; the controls stay in view.' },
    { name: 'Playing', description: 'Pause in place of play. With overlay controls, the controls and the header slide away after a moment without activity; a move or a key brings them back.' },
  ],
  variants: [
    { name: 'Filled', description: 'The default: a card, the picture as a rounded tile and the controls under it.' },
    { name: 'Overlay', description: '`controls="overlay"`: the picture edge to edge with the dock and a header (back, title) floating over it. Full screen is always like this.' },
  ],
  keyboard: [
    { keys: 'Space / K', action: 'Play or pause.' },
    { keys: 'J / L', action: '10 seconds back or forward.' },
    { keys: '← / →', action: '5 seconds back or forward (when no control has focus).' },
    { keys: '↑ / ↓', action: 'Volume up or down.' },
    { keys: 'M', action: 'Mute.' },
    { keys: 'F', action: 'Full screen; a double click on the picture too.' },
    { keys: 'C', action: 'Captions on or off.' },
    { keys: '0–9', action: 'Jump to 0% to 90%.' },
  ],
  labels: ['videoPlayer', 'back'],
  aria: [
    'The player takes focus and is named by its title, so its shortcuts work after a click or Tab.',
    'Keys meant for a focused control (Space on a button, arrows on a slider) stay with that control.',
    'The controls never hide while a menu is open.',
  ],
  related: ['MediaControls', 'VideoSurface', 'PipPlayer'],
};
