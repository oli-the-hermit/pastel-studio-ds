# Figma library

A Figma development plugin that builds the design system's components in Figma, bound to the
design system's own tokens, so screens can be mocked up with the real pieces.

It runs inside the Figma desktop app with no network access and no account limits.

## What the Figma file must already have

The plugin builds on foundations that are already in the file. It finds all of them by name:

| What | Names |
| --- | --- |
| A page | `Components` |
| Color variables (one mode) | `surface/bg`, `surface/1`–`surface/4`, `text/1`–`text/3`, `accent/accent`, `accent/hover`, `accent/on-accent`, `accent/on-accent-2`, `accent/container`, `accent/on-container`, `accent/text`, `status/*`, `structure/*`, `field/bg`, `field/hover`, `row/bg`, `row/hover`, `drawer/bg`, `drawer/hover` |
| Number variables | `space/1`…`space/48`, `radius/2xs`…`radius/pill`, `size/*` (named after the `--ps-*` size tokens); a `Size` collection for the ones the plugin adds |
| Text styles (Geist) | `xs/Medium`, `sm/Regular`, `md/SemiBold`, `xl/Bold` and the like: size `xs`–`4xl` over a weight |
| Effect style | `elevation/overlay` |
| Icons | `Icon/<Name>`, one component per icon of `@pastel-studio/react` (`Icon/Folder`, `Icon/Close`…) |
| Basic components | `Button`, `IconButton`, `Chip`, `Checkbox`, `Switch`, `TextInput`, `Field`, `PasswordField`, `SearchField`, `Card`, `MenuItem`, `Menu`, `WindowControls`, `TopBar`, `NavItem`, `AddressBar`, `MediaTile` |

Each variable carries its CSS name as its web code syntax (`var(--ps-surface-1)`), so what is
picked in Figma maps back to the code.

## Run it

1. Open the file in the **Figma desktop app**: development plugins don't run in the browser.
2. Menu → **Plugins → Development → Import plugin from manifest…**, then pick `manifest.json` in this
   folder. This is needed only once.
3. Menu → **Plugins → Development → Pastel Studio DS: Figma library**.

A message at the bottom says how many sections it added. If it stops, the message names what it
couldn't find, and what it built before that stays.

Running it again adds only what is missing. A section that already exists, matched by its name, is
skipped. To rebuild one component, delete its section and run the plugin again.

## Add a component

Each batch (`buildDialogs`, `buildExplorer`, `buildPickers`…) is a list of blocks of this shape:

```js
if (!exists('Name')) {
  const c = comp('HORIZONTAL', 'Name');          // an auto-layout component
  await pad(c, 'space/12', 'space/14', 'space/12', 'space/14');
  await radius(c, 'radius/lg');
  c.fills = [await paint('surface/2')];          // bound to the variable
  c.appendChild(await text('Label', 'md/SemiBold', 'text/1', 'Label'));
  await section('Name', [c]);
}
```

- Take every value from the component's CSS in `packages/react/src/components/<Name>/`, as variable
  names, never as raw numbers or colours.
- Build states as variants (`State=Hover`), combined with `figma.combineAsVariants`, and expose text
  and icons as component properties.
- Reuse the components already in the file through `variantOf('Button', 'Style=Primary, Size=md')`
  and `prop(instance, 'Label', '…')`.
- Lint with `npx eslint tools/figma-library` before committing.
