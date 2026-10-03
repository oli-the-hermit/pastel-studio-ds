# @pastel-studio/react

Pastel Studio React components and foundation styles, built on `@pastel-studio/tokens`.

```css
@import '@pastel-studio/react/styles.css';
```

```ts
import { cx } from '@pastel-studio/react';
```

`styles.css` brings the fonts, the tokens, the foundation (reset, document defaults, focus ring,
scrollbars, reduced motion), every component's CSS and the utilities (`ps-overline`,
`ps-hidden`), all inside the `ps` cascade layer.

## Component contract

Every component:

- is **controlled** (`value` / `onChange`), with an optional `defaultValue`;
- exposes **every visual state through props**, e.g. `<ProgressBar status="processing" value={42} />`;
- forwards its `ref`, `className` and other HTML attributes;
- takes its text through a **`labels` prop with defaults**, so apps can translate it;
- never imports from an app;
- uses tokens only, with `ps-*` classes and `is-*` states;
- ships a `meta.ts` (description, status, keyboard map, ARIA notes, tokens used) that the
  documentation site reads.

Complex widgets (combobox, table, tree, tabs, date range, drag and drop) take their behavior
from [React Aria](https://react-spectrum.adobe.com/react-aria/); their look comes only from
Pastel Studio tokens and CSS.
