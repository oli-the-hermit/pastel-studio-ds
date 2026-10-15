import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'VideoSurface',
  group: 'Media',
  summary: 'The picture area of a video player: the letterbox, the video, captions, and the paused, buffering and ended layers.',
  status: 'beta',
  states: [
    { name: 'Paused', description: 'The big play button in the middle.' },
    { name: 'Playing', description: 'Only the picture.' },
    { name: 'Buffering', description: '`waiting` while playing: a spinner that keeps turning.' },
    { name: 'Ended', description: '`ended` with `onReplay`: a "Play again" button.' },
    { name: 'Captions', description: '`caption`: the line in a pill of the dock color, read out politely.' },
  ],
  variants: [
    { name: 'Fill', description: 'Without `aspectRatio` it fills its parent, like a picture-in-picture window.' },
  ],
  keyboard: [],
  labels: ['play', 'playAgain', 'buffering'],
  aria: [
    'The play and replay buttons are named; the spinner is a status named "Buffering".',
    'Captions are a polite live region, so a screen reader can follow them without being interrupted.',
    'The surface is dark in both themes: the video sets the mood, not the app.',
  ],
  related: ['MediaControls', 'Spinner'],
};
