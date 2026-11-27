import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'TitleHeader',
  group: 'Media',
  summary: 'The head of a film or series page: a poster beside the kind, the title, its facts and rating, the overview and the buttons, over a wide picture that fades into the page.',
  status: 'beta',
  states: [
    { name: 'With a backdrop', description: '`backdrop` covers the header behind everything. It shows in a band above the text and to the right of it, has faded out where the text is and fades toward the lower edge, so the text stays on the page\'s surface in both themes. The header is then at least 360px tall.' },
    { name: 'Without a backdrop', description: 'No `backdrop`, or one that fails to load: the same poster and text with nothing behind, and no empty band above them.' },
    { name: 'No poster', description: 'Without `poster`, or when it fails to load, `icon` sits in its place on a quiet surface. With neither, the text starts at the left edge.' },
    { name: 'With a rating', description: '`rating` is a chip beside the facts: the source, then the score in the primary text color.' },
    { name: 'Long text', description: 'A long title wraps. The overview is shown whole, on lines no longer than the text\'s measure.' },
  ],
  variants: [
    { name: 'Title only', description: 'Only `title` is required: the overline, the facts, the rating, the overview, the pictures, the actions and the last line are each optional.' },
    { name: 'Narrow', description: 'Under 640px wide the poster is smaller and sits above the text, and the backdrop is the band above them.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the buttons in `actions`, then anything in the last line.' },
  ],
  labels: [],
  aria: [
    'A `header`; the title is a heading (`h2`, or the `headingLevel` given: use 1 when it is the page\'s title).',
    'The backdrop and the poster are decorative (`alt=""`): the title says what they show.',
    'The rating reads as its text, "IMDb 7.8". With `rating.label` the chip is an image named by it instead: "IMDb rating 7.8 out of 10".',
    'It has no words of its own: the overline, the facts and the buttons arrive translated.',
  ],
  related: ['HeroBanner', 'EpisodeCard', 'MediaRow', 'TitleTile', 'AlbumHeader'],
};
