import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'MediaControls',
  group: 'Media',
  summary: 'The control bar of a video or audio player: seek over transport, volume, time and tools, under the picture or floating over it.',
  status: 'beta',
  states: [
    { name: 'Chapters', description: '`chapters` split the seek bar; the preview and the bar\'s middle name the chapter playing.' },
    { name: 'Settings open', description: 'The gear opens `settings` (from `buildMediaSettings`): groups like speed and quality open in place as radio rows.' },
  ],
  variants: [
    { name: 'basic', description: 'A file player: play, volume, time, settings and full screen.' },
    { name: 'movie', description: '`variant="movie"`: 10-second skips, next episode, the title and chapter, captions, picture in picture and theater mode.' },
    { name: 'audio', description: '`variant="audio"`: times beside the seek bar and a centered transport with shuffle and repeat.' },
    { name: 'Overlay', description: '`surface="overlay"`: a see-through dock floating over the picture, light in both themes.' },
    { name: 'Narrow', description: 'Under 620px the extras fold away; under 440px the optional tools and the skips too.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the seek bar and the controls.' },
    { keys: '← → on the seek bar', action: 'One second back or forward.' },
  ],
  labels: ['seek', 'timeOf', 'settings', 'subtitlesOn', 'subtitlesOff', 'fullScreen', 'exitFullScreen', 'pictureInPicture', 'theaterMode', 'playback', 'play', 'pause', 'skipBack', 'skipForward', 'mute', 'unmute', 'volume', 'showRemainingTime'],
  aria: [
    'The seek bar reads "1:04 of 3:20"; toggles set `aria-pressed`; full screen changes its name with its state.',
    'Each tool shows only when its handler is given; what folds away on narrow bars is hidden from everyone.',
    '`buildMediaSettings(config, useLabels())` builds the gear menu in the reader\'s language.',
  ],
  related: ['VideoSurface', 'TransportControls', 'Slider', 'Menu'],
};
