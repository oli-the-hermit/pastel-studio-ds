import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'HeroBanner',
  group: 'Media',
  summary: 'A large banner at the top of a home page that suggests one title at a time, with its facts, a summary and its buttons over a picture.',
  status: 'beta',
  states: [
    { name: 'With a picture', description: '`image` covers the banner and fades out behind the text, which stays on the banner\'s own surface; the dots and arrows take the media dock\'s colors.' },
    { name: 'Without a picture', description: 'No `image`, or one that fails: the text on the plain surface.' },
    { name: 'One item', description: 'A single item shows no dots and no arrows, and the arrow keys do nothing.' },
    { name: 'Long text', description: 'A long title wraps; the summary is cut off after three lines.' },
    { name: 'Auto advance', description: '`autoAdvance={8000}` moves on every 8 seconds. It waits while the pointer is over the banner or the focus is in it, and never runs with reduced motion.' },
  ],
  variants: [
    { name: 'Title only', description: 'Only `title` is required: the overline, the facts, the summary and the actions are each optional.' },
    { name: 'Narrow', description: 'In a narrow place the title shrinks, the text keeps clear of the dots and arrows, and the picture stays faint behind it.' },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the item\'s buttons, then Previous and Next.' },
    { keys: '← →', action: 'With the focus in the banner, shows the previous or next item; after the last comes the first.' },
  ],
  labels: ['previous', 'next', 'carousel', 'slideOf'],
  aria: [
    'A named region (`ariaLabel`) with `aria-roledescription="carousel"`; the item in view is a `group` named by its place, "1 of 6", and its title is a heading (`h2`, or the `headingLevel` given).',
    'The item is in a polite live region, so one shown by hand is read out; while the banner advances by itself the region is off.',
    'The picture and the dots are decorative; Previous and Next say what they change with `aria-controls`.',
    'When the item changes, its buttons leave with it: the focus then moves to the banner itself, so the arrow keys keep working.',
    'Auto advance waits for the pointer and the focus but has no pause button: leave it off, or keep it slow, where the text has to be read.',
    'At most six items are shown: pass the six that matter.',
  ],
  related: ['MediaRow', 'TitleTile', 'TitleHeader', 'Button'],
};
