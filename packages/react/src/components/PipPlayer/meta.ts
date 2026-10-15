import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'PipPlayer',
  group: 'Media',
  summary: 'A borderless video for a picture-in-picture window or a floating tile, showing as many controls as its size allows.',
  status: 'beta',
  states: [
    { name: 'Controls showing', description: 'On hover, focus or pause: the controls as pills over the picture. While it plays untouched for two seconds they fade, and a thin progress line stays at the bottom.' },
  ],
  variants: [
    { name: 'Tiny', description: 'The default, under 260 × 150px: play and close.' },
    { name: 'Small', description: 'From 260 × 150px: the skips, the seek bar and back to the player.' },
    { name: 'Medium', description: 'From 400 × 220px: the times, volume, captions, settings and the title.' },
  ],
  keyboard: [
    { keys: 'Space', action: 'Play or pause, when the player itself has focus.' },
  ],
  labels: ['video', 'backToPlayer', 'close', 'settings', 'subtitles', 'seek', 'timeOf'],
  aria: [
    'Named by its title, or "Video".',
    '`dragHandleProps` marks the free space of the chrome as the window\'s drag region, e.g. `{ "data-tauri-drag-region": "" }`; the library adds no app-specific attribute.',
  ],
  related: ['VideoPlayer', 'MediaControls'],
};
