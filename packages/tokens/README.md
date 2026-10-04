# @pastel-studio/tokens

The Pastel Studio design tokens as plain CSS custom properties. No build step and no framework.

```css
@import '@pastel-studio/tokens/fonts.css';   /* Geist Variable, self-hosted */
@import '@pastel-studio/tokens';             /* everything, in layer ps.tokens */
```

| File | Tier | Contents |
|---|---|---|
| `reference.css` | 1, reference | The raw palette, named by tone (CIELAB L*, 0–100): graphite, stone, lime, coral, amber, green. Used only by themes. |
| `themes/dark.css` | 2, semantic | The default theme, on `:root` and `[data-theme="dark"]`. |
| `themes/light.css` | 2, semantic | `[data-theme="light"]`. Defines exactly the same roles as dark. |
| `aliases.css` | 2, semantic | Roles built from other roles (`--ps-field-bg`), re-resolved inside nested themes. |
| `scales.css` | n/a | Type, space, radius, rings, component sizes, motion, z-index. |
| `contrast.json` | n/a | Intended color pairings and their WCAG 2.2 AA minimums; checked in every theme. |

## Making a theme

Create a stylesheet that redefines the semantic roles under its own selector, using any
colors you like (your own palette or the reference one):

```css
[data-theme="dusk"] {
  --ps-bg: #…;
  --ps-surface-1: #…;
  /* …every role in themes/dark.css */
  color-scheme: dark;
}
```

Load it after Pastel Studio and set `data-theme="dusk"` on `<html>` or on any element.
Components never need to change.
