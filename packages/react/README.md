# @pastel-studio/react

Pastel Studio React components and foundation styles, built on `@pastel-studio/tokens`.

```css
@import '@pastel-studio/react/styles.css';
```

```tsx
import { Button, IconButton, IconPlus, TextButton } from '@pastel-studio/react';

<Button variant="primary" icon={<IconPlus />}>Add task</Button>
```

Components so far, ported from Focus Space: `Button`, `IconButton`, `TextButton`, `Popover`,
`Menu`, `ContextMenuProvider` and `Modal`. Each has
a page in the documentation with a live demo, every state, its props and the tokens it uses.

`styles.css` brings the fonts, the tokens, the foundation (reset, document defaults, focus ring,
scrollbars, reduced motion), every component's CSS and the utilities (`ps-overline`,
`ps-hidden`), all inside the `ps` cascade layer.

## Component contract

Every component lives in its own folder, `src/components/<Name>/`:

| File | Holds |
|---|---|
| `Name.tsx` | the component |
| `name.css` | its styles (kebab-case: `icon-button.css`), if it has any |
| `meta.ts` | what the documentation says about it |
| `index.ts` | what the folder exports |

The folder is exported from `src/index.ts`, and its stylesheet is imported in `src/styles.css`
inside `layer(ps.components)`. `npm run check:components` verifies all of this.

**Behavior.** Every component:

- is **controlled** (`value` / `onChange`), with an optional `defaultValue`;
- exposes **every visual state through props**, e.g. `<ProgressBar status="processing" value={42} />`;
- forwards its `ref`, `className` and other HTML attributes;
- never imports from an app.

**Styles.** Tokens only. Classes are `ps-name`, parts `ps-name-part`, variants
`ps-name--variant`, and states `is-*` (`ps-button ps-button--primary is-busy`). Stylelint
rejects anything else.

**Words.** A component's own text (screen-reader names, placeholders, tooltips) comes from one
shared list, `defaultLabels`, so each word is translated once. A word joins the list with the
first component that uses it.

- `<LabelsProvider labels={{ … }}>` translates or replaces words for everything inside it.
- A component's `labels` prop does the same for one instance, and accepts only the words that
  component uses (`LabelOverrides<'close' | 'cancel'>`).
- Inside a component, `useLabels(props.labels)` returns the words to show.

**Metadata.** `meta.ts` exports `meta: ComponentMeta` as plain data (it imports only the type):
name, group, a one-sentence summary, status (`stable` or `beta`), states, variants, the keyboard
map, ARIA notes and related components. The documentation site reads it; props come from the
TypeScript types and "tokens used" from the stylesheet.

Complex widgets (combobox, table, tree, tabs, date range, drag and drop) take their behavior
from [React Aria](https://react-spectrum.adobe.com/react-aria/); their look comes only from
Pastel Studio tokens and CSS.
