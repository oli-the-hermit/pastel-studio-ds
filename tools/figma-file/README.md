# The whole Figma file

One Figma development plugin that builds a complete design file from the code, in a new, empty
file. It is the library plugin (`tools/figma-library`) and each app's screens put together, laid out
in three pages, the free plan's limit:

- **Library:** the cover and Getting started, the foundations (variables, text styles, icons), then
  the small components by family.
- **Blocks:** the big pieces made of small ones (the app shell, dialogs, the file views, players and
  the viewer, the music blocks, transfers), then each app's own components
  ("Pastel Studio Pro components", "Pastel Media Pro components", "Pastel Espresso components").
- **Mockups:** a section per app with its screens, and the sample Files screen.

It runs inside the Figma desktop app, with no network access and no account limits. The Figma MCP
connector isn't used.

## Run it

1. Install the **Geist** font on the computer (the plugin stops without it).
2. In the **Figma desktop app**, make a new design file and leave it empty.
3. Menu → **Plugins → Development → Import plugin from manifest…**, and pick `manifest.json` in
   this folder. This is needed once per computer.
4. Menu → **Plugins → Development → Pastel Studio: the whole file → Build everything**.

It takes a few minutes; a message at the bottom says what it is doing, and what it added when it
ends. If it stops, the message names what went wrong, and what it built before that stays.

The other commands build one part:

- **Library and Blocks:** the first and third pages. Run it before an app's mockups.
- **Mockups: Pastel Studio Pro / Pastel Media Pro / Pastel Espresso:** that app's components and
  screens.
- **Update the tokens from the code:** rewrites the variables', text styles' and shadow's values
  after the tokens changed in the code.

Every command only **adds what is missing**, found by name. Nothing that is in the file is changed,
so move, restyle and redraw freely. To get a screen, a component or a section built again, delete
it and run the command. New screens are placed under the ones already in the app's section.

Things to know:

- Only the dark theme is built (one mode per collection on the free plan).
- Pictures are grey boxes with an icon: a new file has no images. Give a box an image fill.
- The library is in Pastel Studio Pro's accent (sky). Media Pro's and Espresso's screens are
  re-pointed to their own accent, which lives in the **App colours** collection (`media/…`,
  `espresso/…`). Change those variables to try another accent.
- Screens marked **proposal** in their name don't exist in the app yet: they are a starting point
  for a design, drawn from the request, not from code.

## Build it

`code.js` is generated. After changing the library, the kit or an app's screens:

```
node tools/figma-file/build.mjs
```

It puts together:

- `tools/figma-library/code.js` (the library; its tokens and icons come from `generate.ts`);
- `tools/figma-library/screens-kit.js` (what screens are written with);
- each app's `tools/figma-screens/screens.js`, read from the app's repo beside this one
  (`pastel-studio-pro`, `pastel-media-pro`, `time-tracker`; a `…-figma` worktree is used first when
  there is one). `--pro=<folder>`, `--media=<folder>` and `--espresso=<folder>` point elsewhere. An
  app that isn't found is left out.

Each app keeps its own screens plugin too (`npm run figma:screens` there), which builds the same
screens into a file laid out the older way (Library, Screens, Mockups).

## Check it without Figma

`figma-stub.mjs` is a stand-in for Figma's plugin API that keeps a document in memory. It refuses
what Figma refuses (a variant or property that doesn't exist, FILL outside auto layout, moving a
layer inside an instance, a size that isn't a number, a fourth page), and can draw frames as SVG
with a rough auto layout.

```
node tools/figma-file/smoke.mjs                         # build everything twice; the second run must add nothing
node tools/figma-file/smoke.mjs --preview=<folder>      # and draw every screen and block there
node tools/figma-file/preview-server.mjs <folder>       # look at them: http://localhost:5330/
node tools/figma-file/catalog.mjs                       # every component, its variants and properties
```

A trial build of one app, without touching `code.js`:

```
node tools/figma-file/build.mjs --apps=media --out=<file>
node tools/figma-file/smoke.mjs --only=media --code=<file> --preview=<folder>
```

What passes here can still fail or look different in Figma: the stand-in doesn't know every rule,
and its layout and text widths are estimates.

## Writing screens

A screen is a frame of instances of the library, written with the kit's helpers:

```js
if (!exists('Music · albums')) {
  const f = await screen('Music · albums', SW, SH);          // a window-sized frame in the app's section
  const { page } = await win(f, 'Music');                     // the app's own window: drawer, top bar, page
  page.appendChild(use('Button', 'Style=Primary, Size=md', { Label: 'Add a folder', 'Show icon': true, Icon: 'FolderPlus' }));
  await useAppAccent(f);                                      // only for an app with its own accent
}
```

- **Lookups:** `find(name)`, `variantOf(set, variant)`, `icon(name)`, `use(set, variant, props)`
  (an `Icon` property takes an icon's name), `prop(instance, name, value)`, `setText(root, layer,
  value)` and `setTextAt(root, layer, index, value)` for text layers that aren't properties.
- **Frames:** `auto(direction, name, gapVariable)`, `fixed(frame, w, h)`, `fill(node)`,
  `fillBoth(node)`, `pad(node, top, right, bottom, left)`, `radius(node, name)`, `bindNum(node,
  field, name)`, `paint(name)`, `text(chars, style, colour, name)`, `iconInst(name, colour, px)`,
  `card(parent, name, padding, gap)`, `picture(name, w, h, icon, radius, fill)`, `rule(w)`,
  `elevate(node)`.
- **Screens:** `exists(name)`, `screen(name, w, h)`, `overlay(frame, layer, at)` (with the scrim),
  `float(frame, layer, x, y)` (without).
- **The app's own components:** `componentsSection(name)` gives their section (on Blocks in this
  file), `ownComponent(section, name)` finds one already there, `shelve(section, node)` places a new
  one, `variants(section, name, components, description)` makes a set and places it.
- **Colours of its own:** `setUpAccent(prefix)`, `appColour(name, hex)`, `useAppAccent(root)`.

Rules that keep a build from stopping in Figma:

- Take sizes, gaps, radii and colours from variables (`'space/12'`, `'radius/lg'`, `'surface/1'`),
  never raw numbers, except a frame's own width and height.
- `fill(node)` only after the node is inside an auto-layout frame.
- After `resize()` on an auto-layout frame, say which axes hug: `resize` fixes both.
- `layoutWrap = 'WRAP'` before a `counterAxisSpacing`.
- Inside an instance, text, fills, visibility and properties can change; layers can't be added,
  removed or moved. Wrap a resize or a layout change of such a layer in `soft(() => …)`: it is
  tried, and skipped when Figma refuses.
- Give every screen a name of its own and guard it with `if (!exists(name))`, so a second run adds
  nothing.
