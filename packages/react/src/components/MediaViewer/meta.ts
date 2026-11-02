import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'MediaViewer',
  group: 'Media',
  summary: 'One image or video over the app, as large as the window allows, with its name and tools, previous and next, zoom for images and the item\'s details beside it.',
  status: 'beta',
  states: [
    { name: 'Image', description: 'The image fitted to the stage: scaled up or down to the largest size that shows all of it, keeping its proportions.' },
    { name: 'Zoomed', description: 'The wheel zooms toward the pointer, a drag pans, a double-click goes between fitted and actual size; the readout shows the real pixel scale and resets to fitted.' },
    { name: 'With panel', description: '`panel` beside the stage, toggled by its button and I; when the viewer is narrower than 880px it floats over the stage.' },
    { name: 'Video', description: 'A video player as children fills the stage and fits itself; zoom stays off.' },
  ],
  variants: [
    { name: 'Full screen', description: 'F or the bar\'s button puts the viewer on the whole screen, without the margin.' },
  ],
  keyboard: [
    { keys: '← / →', action: 'Previous or next item (Shift + arrows are left to the media, e.g. to seek)' },
    { keys: '+ / − / 0', action: 'Zoom in, zoom out, back to fitted (images)' },
    { keys: 'I', action: 'Show or hide the details panel' },
    { keys: 'F', action: 'Full screen' },
    { keys: 'Escape', action: 'Leave full screen, then close' },
    { keys: 'Tab', action: 'Moves through the bar and the panel, and stays inside the viewer' },
  ],
  labels: ['close', 'previous', 'next', 'zoomIn', 'zoomOut', 'zoomFit', 'detailsPane', 'fullScreen', 'exitFullScreen'],
  aria: [
    'A modal dialog named by the item\'s `title`; focus moves in on open and back to the opener on close.',
    'It registers as a blocking overlay, so the app\'s own shortcuts pause while it is open.',
    'Give an image an `alt` when its name doesn\'t describe it.',
  ],
  related: ['VideoPlayer', 'MediaGrid', 'DetailsPane', 'Modal'],
};
