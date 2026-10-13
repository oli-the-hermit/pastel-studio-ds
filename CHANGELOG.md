# Changelog

All notable changes to the Pastel Studio Design System. Versions follow
[semantic versioning](https://semver.org): renaming or removing a token or a component prop
is a breaking change.

## 0.1.0 (unreleased)

- Monorepo with `@pastel-studio/tokens` and `@pastel-studio/react`.
- Tokens ported from Focus Space 1.2.0 in three tiers: a reference palette named by tone,
  dark and light semantic themes, and scales. Every token is `--ps-*`. Colors, spacing, radius,
  sizes and durations keep their values. See [MIGRATING.md](packages/tokens/MIGRATING.md).
- Type scale reduced from 13 sizes to 8 (`xs` 11.25px to `4xl` 39px).
- Two distinct curves: `--ps-ease-standard` and `--ps-ease-emphasized`, now the real
  Material 3 emphasized curve (`linear()`). `--ps-transition` uses standard instead of `ease`.
- Nested themes: `data-theme="dark"` or `"light"` on any element switches that subtree.
- Foundation styles (reset, document defaults, focus ring, scrollbars, reduced motion,
  utilities) inside the `ps` cascade layer.
- Guardrails: Stylelint (tokens only, no reference colors outside themes) and
  `npm run check:tokens` (theme parity, palette usage, tone names).
- Contrast rules as data (`contrast.json`): every intended color pairing with its WCAG 2.2 AA
  minimum, checked in both themes. All 18 pass.
- WCAG AA fixes for four colors inherited from Focus Space, each kept on its hue and moved only
  in lightness: `--ps-text-3` (dark `#8F938B`, light `#65685E`), light `--ps-success`
  (`#26762B`), and dark `--ps-on-live` (now dark ink, `--ps-coral-10`). See MIGRATING.md.
- The component contract: one folder per component (`Name.tsx`, `name.css`, `meta.ts`,
  `index.ts`), a `ComponentMeta` type for the documentation, and a shared list of translatable
  words with `LabelsProvider`, `useLabels` and a per-component `labels` prop. Checked by
  `npm run check:components` and a Stylelint rule for class names (`ps-name`,
  `ps-name--variant`, `is-*`).
- Component pages build themselves: the documentation reads each component's props from its
  TypeScript types, the tokens it uses from its stylesheet and the rest from its `meta.ts`, and
  lists it under Components with no page to register.
- Icons: the 54 Focus Space icons (24 × 24 grid, 2px round strokes, `currentColor`), without
  the Focus Space logo.
- Documentation site (`apps/docs`): Overview, Getting started, and Foundations pages for
  principles, color (roles, contrast, palette), typography, spacing and sizing, shape,
  elevation and layers, motion and iconography. Dark, light and a side-by-side compare mode.
