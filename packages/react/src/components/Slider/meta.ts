import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'Slider',
  group: 'Inputs',
  summary: 'A track with a knob for picking a value by dragging: seeking in a song, volume, or showing a timer\'s progress read only.',
  status: 'beta',
  states: [
    { name: 'Default', description: 'The fill and the knob at `value`; a click or a drag anywhere on the track moves them.' },
    { name: 'Buffered', description: '`buffered` draws the loaded part of a song or video under the fill.' },
    { name: 'Chapters', description: '`marks` split the track into chapters with small gaps.' },
    { name: 'Read only', description: '`readOnly`: progress that can\'t be changed, like a running timer. It eases with each tick and is read out as progress.' },
    { name: 'Disabled', description: '`disabled`: the fill in the tertiary color; it can\'t be dragged or focused.' },
  ],
  variants: [
    { name: 'md', description: 'The default, for full players.' },
    { name: 'sm', description: '`size="sm"`: a thinner track and a smaller knob, for bars and volume.' },
    { name: 'Knob on hover', description: '`knob="hover"`: a thin bar that grows a knob when the pointer or the keyboard reaches it.' },
    { name: 'No knob', description: '`knob="none"`: a plain bar, like a mini player\'s timer.' },
    { name: 'On video', description: '`surface="overlay"` on the dock over video: a light track and buffer the picture shows through, no halo.' },
    { name: 'Retinted', description: 'Set `--ps-slider-fill` (and `-track`, `-buffer`, `-halo`) on its class for another phase.' },
  ],
  keyboard: [
    { keys: '→ ↑', action: 'One step up.' },
    { keys: '← ↓', action: 'One step down.' },
    { keys: 'Page Up / Page Down', action: 'A tenth of the range up or down.' },
    { keys: 'Home / End', action: 'The minimum or the maximum.' },
  ],
  labels: [],
  aria: [
    'The knob is a `slider` with its minimum, maximum and value; `label` names it.',
    '`valueText` gives the spoken value, like "1:04 of 3:20", instead of a bare number.',
    'Read only, the whole track is a `progressbar` and the knob is hidden from screen readers.',
    '`onChange` fires while dragging; `onChangeEnd` once at the end, so a seek can wait for the drop.',
  ],
  related: ['ProgressBar', 'PlayerControl'],
};
