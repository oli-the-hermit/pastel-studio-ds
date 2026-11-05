import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'ListRow',
  group: 'Actions',
  summary: 'A row in a list of destinations, such as a Help page: an icon, a title over a short description, and a chevron.',
  status: 'beta',
  states: [
    { name: 'External', description: '`external` swaps the chevron for an external-link mark, for a row that opens a page outside the app.' },
  ],
  variants: [
    { name: 'With description', description: 'A title and one line saying what is there.' },
    { name: 'Title only', description: 'Without `description` the row keeps its height.' },
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'Opens the destination.' },
  ],
  labels: [],
  aria: [
    'A `<button>` named by its title and described by its description. The icon and the chevron are hidden from screen readers.',
  ],
  related: ['Modal', 'ActionRow'],
};
