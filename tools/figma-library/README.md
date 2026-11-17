# Figma library

A Figma development plugin that builds the design system in Figma from this repo: the tokens as
variables, the type ramp as text styles, every icon, and the components bound to them. Screens can
then be mocked up with the real pieces, and nothing exists only in the Figma file: the whole
library can be rebuilt from here, into any file.

It runs inside the Figma desktop app, with no network access and no account limits.

## What it builds

1. **Foundations.**
   - The `Primitives` collection: the reference palette and the app's accent.
   - `Color (Dark)`: the theme's colour roles, aliased to the primitives.
   - `Spacing`, `Radius` and `Size`: every px token of `scales.css`.
   - The text styles, from `xs/Medium` to `4xl/Bold`, in Geist.
   - The `elevation/overlay` shadow.

   Each variable carries its CSS name as its web code syntax (`var(--ps-surface-1)`), so what is
   picked in Figma maps back to the code.
2. **Icons:** one `Icon/<Name>` component for each icon of `@pastel-studio/react`.
3. **Basic components:**
   - Button, IconButton, Chip, Checkbox and Switch.
   - TextInput, Field, PasswordField, SearchField and Card.
   - Menu with MenuItem, and TopBar with WindowControls.
   - NavItem, AddressBar and MediaTile.
4. **Dialogs:** TextButton, FormError, ActionRow, Modal and ConfirmModal.
5. **Explorer pieces:**
   - TreeItem and TreeHeading.
   - ListRow, DetailsPane, StatusBar and ToolbarDivider.
   - EmptyState, and the drawer, expanded and as a rail.
6. **Pickers and feedback:** SegmentedControl, Select, Slider, Tabs, ListPicker, Toast, StatusChip
   and Spinner.
7. **App and account:**
   - AccountMenu, and the appearance panel with every accent preset as a ColorSwatch.
   - FileIcon, Subform, ProgressBar and UpdateCard.
   - CrashScreen, the Tour card, and MenuBar.
8. **Media:**
   - PlayerControl, TransportControls, MediaTime, LikeButton, VolumeControl and CoverArt.
   - The MediaControls dock over a video, and the MediaViewer with its details panel.
9. **Layouts:**
   - The file views: FileRow and FileHeader, the details view, FileListItem, FileTile and FileIconCell.
   - SortableItem, the FileDialog, and the AppShell.
10. **A sample Files screen** made of those components, on a `Mockups` page.

Only the dark theme is built: Figma's free plan allows one mode per collection.

## Run it

1. Open a Figma file in the **Figma desktop app**: development plugins don't run in the browser.
   An empty file works; the plugin makes the `Components` and `Mockups` pages.
2. Menu → **Plugins → Development → Import plugin from manifest…**, then pick `manifest.json` in this
   folder. This is needed only once per computer.
3. Menu → **Plugins → Development → Pastel Studio DS: Figma library**, then one of:
   - **Build what's missing.** It adds whatever the file doesn't have yet and changes nothing that
     is there. A section that already exists is skipped, matched by its name. A variable or style
     that exists keeps its value, so colours tuned in Figma are safe. To rebuild a component,
     delete its section and run it again.
   - **Update the tokens from the code.** It rewrites the variables', text styles' and shadow's
     values from this repo, after the tokens changed. It doesn't touch the components, which follow
     the variables.

A message at the bottom says what was added. If it stops, the message names what it couldn't
find, and what it built before that stays.

## Keep it in step with the code

The plugin's data (tokens, the accent, the accent presets and icons) is written into `code.js` by the generator, from
`packages/tokens/src` and `packages/react/src` (the icons are rendered by React itself):

```
node tools/figma-library/generate.ts                     # accent: sky (Pastel Studio Pro's)
node tools/figma-library/generate.ts --accent=solar-lime # another app's accent
node tools/figma-library/generate.ts --check             # fails when code.js is out of date
```

After a token or icon changes, run the generator, commit `code.js`, then in Figma run **Update the
tokens from the code** (for tokens) or **Build what's missing** (for new icons).

## Add a component

Each batch (`buildBasics`, `buildDialogs`, `buildExplorer`, `buildPickers`, `buildApp`, `buildMedia`, `buildLayouts`…) is a list of blocks of
this shape:

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
- Reuse the components already built through `variantOf('Button', 'Style=Primary, Size=md')` and
  `prop(instance, 'Label', '…')`.
- Lint with `npx eslint tools/figma-library` before committing.
