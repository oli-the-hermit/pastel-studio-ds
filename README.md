# Pastel Studio Design System

The shared design system of the Pastel Studio app family: design tokens, React components
and (soon) a documentation site. It started as the interface of
[Focus Space](https://github.com/oli-the-hermit/Focus-Space) and is the foundation every
app in the family is built on.

> **Status: 0.1, foundation only.** Tokens (light and dark) and the base styles are in place.
> Components are promoted one by one; the documentation site comes next.

## Packages

| Package | What it holds |
|---|---|
| [`@pastel-studio/tokens`](packages/tokens) | Plain CSS custom properties: the reference palette, the dark and light themes, and the type, space, shape, size and motion scales. Works without React. |
| [`@pastel-studio/react`](packages/react) | React components and the foundation styles (reset, document defaults, focus, utilities). Depends on the tokens. |

## Using it in an app

```css
/* The app's main stylesheet */
@import '@pastel-studio/react/styles.css';   /* tokens + foundation + components, in layer "ps" */
@layer ps, app;                               /* the app's own layer comes after, so it wins */
```

```html
<html data-theme="light">   <!-- omit, or "dark", for the dark theme -->
```

Themes can be nested: `data-theme` on any element switches that subtree.

## Principles

- **Flat Material.** Surfaces are separated by tonal steps (`--ps-bg` < `--ps-surface-1` … `-4`),
  never by borders, gradients, transparency or decorative shadows. Only floating layers
  (menus, popovers, modals) use `--ps-elev-overlay`.
- **Tokens only.** Every color, size, radius, duration and layer comes from a token.
  Stylelint rejects raw values outside `packages/tokens`.
- **Three token tiers.**
  1. *Reference* (`reference.css`): the raw palette, named by tone. `--ps-lime-85` is the
     accent `#D1DD23`, with a CIELAB lightness of 85. Only themes use it.
  2. *Semantic* (`themes/*.css`): roles like `--ps-surface-1`, `--ps-text-2`, `--ps-accent`.
     **A theme overrides this tier only.**
  3. *Component*: tokens like `--ps-button-bg`, defined with each component where theming needs them.
- **One cascade layer.** Everything lives in `@layer ps` (`ps.tokens`, `ps.reset`, `ps.base`,
  `ps.components`, `ps.utilities`). App styles outside it always win, with no `!important`.
- **Prefixed names.** Tokens are `--ps-*`; classes are `ps-*`, with `is-*` for states.

## Repository layout

```
packages/tokens/    reference.css, scales.css, themes/{dark,light}.css, aliases.css, fonts.css
packages/react/     src/foundation/ (reset, base, reduced motion, utilities), src/lib/, components
scripts/tokens/     check.ts: token-tier rules (npm run check:tokens)
```

## Development

Requires Node 22.18 or later.

```bash
npm install
npm run check        # typecheck, ESLint, Stylelint, token checks
```

## License

MIT with the Commons Clause condition. See [LICENSE](LICENSE).
