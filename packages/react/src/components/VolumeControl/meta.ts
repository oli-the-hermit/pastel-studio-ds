import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'VolumeControl',
  group: 'Media',
  summary: 'A mute button with a volume slider; the icon follows the level.',
  status: 'beta',
  states: [
    { name: 'High', description: 'Half the volume or more: the full speaker icon.' },
    { name: 'Low', description: 'Below half: a speaker with one wave.' },
    { name: 'Muted', description: '`muted` or a volume of 0: the crossed speaker, and the slider drops to 0 until unmuted.' },
  ],
  variants: [
    { name: 'Expand', description: 'The default: just the button until hovered or focused, then the slider unfolds. For bars.' },
    { name: 'Inline', description: '`layout="inline"`: the slider always shows.' },
    { name: 'Button', description: '`layout="button"`: mute only, for tiny windows.' },
  ],
  keyboard: [
    { keys: '← → ↑ ↓', action: 'On the slider: 5% down or up.' },
    { keys: 'Home / End', action: 'On the slider: silent or full.' },
  ],
  labels: ['mute', 'unmute', 'volume'],
  aria: [
    'The button is named Mute or Unmute; the slider is named Volume and reads its level as a percent.',
    'The folded slider unfolds on focus too, so it can be reached with Tab.',
  ],
  related: ['Slider', 'TransportControls'],
};
