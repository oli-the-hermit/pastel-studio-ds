# Pastel Studio Design System

The shared design system of the Pastel Studio app family: design tokens, React components,
icons and a documentation site. It started as the interface of
[Focus Space](https://github.com/oli-the-hermit/Focus-Space) and is the foundation every
app in the family is built on.

> **Status: 0.1, foundations.** Tokens (light and dark), base styles, icons and the
> documentation site with its Foundations pages are in place. Components are promoted next,
> one by one.

## Packages

| Package | What it holds |
|---|---|
| [`@pastel-studio/tokens`](packages/tokens) | Plain CSS custom properties: the reference palette, the dark and light themes, and the type, space, shape, size and motion scales. Works without React. |
| [`@pastel-studio/react`](packages/react) | React components, the icon set, and the foundation styles (reset, document defaults, focus, utilities). Depends on the tokens. |
| [`apps/docs`](apps/docs) | The documentation site (not published as a package). Every token, value and contrast ratio on it is read from the token files at build time. |

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
packages/tokens/    reference.css, scales.css, themes/{dark,light}.css, aliases.css, fonts.css,
                    contrast.json (intended color pairings and their WCAG minimums)
packages/react/     src/foundation/ (reset, base, reduced motion, utilities), src/icons/, src/lib/
apps/docs/          the documentation site (Vite + React Router); tokens-plugin.ts feeds it the tokens
scripts/tokens/     parse.ts (reads the token files), check.ts (npm run check:tokens)
```

## Development

Requires Node 22.18 or later.

```bash
npm install
npm run docs         # the documentation site on http://localhost:5310
npm run check        # typecheck, ESLint, Stylelint, token and contrast checks, docs build
```

The docs build for a sub-path (for example GitHub Pages) with `DOCS_BASE=/pastel-studio-ds/`.

## License

MIT with the Commons Clause condition. See [LICENSE](LICENSE).
