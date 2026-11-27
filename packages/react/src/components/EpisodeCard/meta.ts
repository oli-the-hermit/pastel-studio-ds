import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'EpisodeCard',
  group: 'Media',
  summary: 'One episode of a series as a button: a 16:9 picture over its number and length, its title and two lines of its summary, made to sit in a MediaRow.',
  status: 'beta',
  states: [
    { name: 'Picture', description: '`image` fills the 16:9 picture, cropped to it. Under it: the overline with the length at the line\'s end, the title on one line, and the summary on at most two.' },
    { name: 'No picture', description: 'Without `image`, or when it fails to load, `icon` sits centred on a quiet surface, which steps up when hovered.' },
    { name: 'In progress', description: '`progress` from 0 to 1: a thin bar along the picture\'s lower edge. Nothing shows for 0 or when it is left out.' },
    { name: 'Watched', description: '`watched`: a check on the accent at the picture\'s top right.' },
    { name: 'Current', description: '`current`, the episode that is playing: an accent ring inside the picture\'s edge and the title in the accent text color.' },
    { name: 'Unavailable', description: '`unavailable` with the reason, e.g. "Can\'t find this file": the picture is dimmed under a warning mark and the reason takes the summary\'s place. It is still a button.' },
    { name: 'Long text', description: 'A long overline or title stays on one line and ends with an ellipsis; a long summary is cut off after two lines.' },
  ],
  variants: [
    { name: 'In a row', description: 'In a MediaRow the cards line up: each is 256px wide (`--ps-episode-card-width`), and the row gives one of them the tab stop.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves to the next card; each card is a button. In a MediaRow the row is one tab stop and ← → move between its cards.' },
    { keys: 'Enter', action: 'Opens the episode.' },
    { keys: 'Space', action: 'Opens the episode.' },
  ],
  labels: ['watched'],
  aria: [
    'A native `<button>` named by its overline, title and length, in that order, then "Watched" or the reason it is unavailable (`aria-labelledby`). An `aria-label` or `aria-labelledby` of your own replaces that name.',
    'The summary is the button\'s description (`aria-describedby`), read after the name, so a row of episodes can be gone through quickly.',
    'The picture is decorative (`alt=""`); the watched check is an image named "Watched"; the warning mark is decorative, because the reason is text.',
    '`current` sets `aria-current="true"`.',
    'The progress bar is decorative: when how far it has been played matters, say it in the length ("12 min left").',
    'The button is not disabled when the episode is unavailable: a click can open the way to find the file.',
  ],
  related: ['TitleTile', 'MediaRow', 'TitleHeader'],
};
