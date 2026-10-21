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
- One page template for every component: overview, an interactive demo, every state, variants
  and sizes, props, tokens used, keyboard and accessibility, do and don't, and related
  components. Examples live in `apps/docs/src/demos`, one file per component.
- Tests: unit tests with Vitest, Testing Library and jsdom (`npm test`, part of
  `npm run check`), including one that fails when a component's state or variant has no
  example in the docs. Screenshots of every docs page in both themes, compared pixel by pixel
  with a reviewed baseline (`npm run visual:capture`, `npm run visual:diff`).
- The first components, ported from Focus Space: `Button` (four variants, four sizes, leading
  and trailing icons, block, collapsible on phones), `IconButton` (three sizes, a danger tone,
  `active`, and `pressed` for toggles, which sets `aria-pressed`) and `TextButton`. All three
  take a `surface` prop, so their fill and hover stay one step above what they sit on.
- Two button heights Focus Space had and the tokens lacked: `--ps-button-height-lg` (44px)
  and `--ps-button-height-xs` (28px).
- A "Using components" guide: what every component accepts, states, surfaces, words and
  translation, and theming through tokens. The overview lists the components.
- Overlays, ported from Focus Space: `Popover` (anchored to an element or a point, flips above,
  works in another window's document), `Menu` (with `MenuList`, `tidyMenuItems` and the arrow
  keys), `ContextMenuProvider` with `useContextMenu` and `useContextMenuState`, and `Modal`.
  Also `useBlockingOverlay` / `isBlockingOverlayOpen`, so an app can pause its shortcuts, and
  `cssDurationMs`.
- New in the port: a popover takes the theme of the place it opened from; a modal keeps Tab
  inside it, takes focus when it has no field, returns focus to what opened it, and names
  itself with a unique id.
- The shared words get their first entries: `close`, `copy`, `actions`, `moreActions`. Each
  component page lists the words it uses.
- Tokens: `--ps-modal-max-width` (520px) and `--ps-modal-max-width-wide` (620px).
- Surfaces and feedback, ported from Focus Space: `Card` with `CardHeader` and `PanelHeader`,
  `Chip` (default and accent), `IconSwap`, `ProgressBar` and `Toast` with `ToastRegion`.
- New in the port: `ProgressBar` takes a `status` (`starting`, `processing`, `completed`,
  `failed`) in place of Focus Space's `complete`; while starting, the bar has no value and
  shows Material's indeterminate motion (two sweeping bars). With reduced motion one bar fills
  from start to finish and pauses, in a calm loop: `data-ps-keep-motion` exempts such a loop
  from the reduced-motion rule. `useToasts()` keeps the list of toasts and their timing.
  The toast region spans the window, so a toast never runs off a narrow screen, and
  `--ps-toast-region-top` moves it below an app bar.
- Inputs and the player button, ported from Focus Space: `Switch` (a settings row),
  `SegmentedControl` (a radio group with the arrow keys), `Field` with `TextInput`, `TextArea`,
  `FormHint` and `FormError`, `Select` (search, recent options first, create a new one) and
  `PlayerControl`. New in the port: `Field` takes `hint` and `error` and links them to its
  control (`aria-describedby`, `aria-invalid`, a red ring); `Select`'s trigger is a combobox
  that tells screen readers which option the arrow keys are on (`aria-activedescendant`);
  `PlayerControl`'s phase color is four tokens on its class (`--ps-player-control-phase`…).
- Tokens: `--ps-switch-width`, `--ps-switch-height`, `--ps-switch-knob` and the five
  `--ps-player-control-size*` sizes, all Focus Space values. Seven shared words for Select.
- `Slider`, adopted from the media package and kept hand-built: pointer drag, keyboard steps
  (arrows, Page Up/Down, Home/End), a buffered range, chapter gaps, a hover preview, `sm`, and
  a knob that is always shown, shown on hover or hidden. `readOnly` turns it into a progress
  track, the look of Focus Space's timer scrubber. Its colors are tokens on its class; a
  disabled slider uses the tertiary color instead of transparency. Size tokens
  `--ps-slider-height(-sm)`, `--ps-slider-hit`, `--ps-slider-knob(-sm)`, `--ps-slider-mark`.
- `SortableList`, `useSortable` and `moveById`: drag rows into a new order by their grip
  (Focus Space's task rows and reorder hook), plus Alt + ↑ / ↓ from any control in a row (from
  the media package), with focus kept and the move announced. Rows glide to their new place and
  new rows slide in. New: the `--ps-grip` theme role and the `--ps-row-bg` alias (Focus Space
  values), three shared words, and a `.ps-visually-hidden` utility.
- Music parts, adopted from the media package: `CoverArt` (placeholder, loading pulse,
  progress ring, corner badge, four sizes or fluid, round), `TrackInfo`, `MediaTime` (pair,
  elapsed, remaining, total; a toggle that can own its mode) and `Spinner` (it keeps turning
  with reduced motion). `Equalizer` takes Focus Space's bars and timing and replaces
  `IconEqualizer`, which had no styles in the library. The media controller: the
  `MediaController` and `MediaState` types and `useMediaElement`, plus `formatTime`.
- Tokens: `--ps-cover-size-xs/sm/md/lg`, `--ps-dur-equalizer` (Focus Space's 900ms) and
  `--ps-dur-spin`. Icons: `IconMusic`, `IconExplicit`. Three shared words.
- Transport, adopted from the media package on PlayerControl: `TransportControls` (the
  buttons follow the handlers given; shuffle, repeat off/all/one with `nextRepeat`, skips,
  stop; `md` and `sm`, cluster or spread), `LikeButton` and `VolumeControl` (expand, inline
  or button; with `VolumeIcon`). Their words join the shared list; ten transport icons; the
  `--ps-volume-slider-width` token.
- `QueuePanel`, `QueueItem` and `QueueMetaItem` from Focus Space (its session and list queues), on the
  shared reorder hook, so rows also move with Alt + arrows; `EmptyState` from Focus Space. The
  row motion (glide and slide-in) is shared in `lib/listMotion`.
- Card takes `as` (`section`, `aside`, `article`) and `padding` (`sm`, `none`); the PanelHeader
  title is now an `h2` with the same look, with `titleId`. Chosen by the user.
- `PlayQueue` (the music queue: now playing, up next with reorder and remove, history, the
  queue menu, autoplay) and `TrackList` (number that turns into play, cover, album and date
  columns that fold away as it narrows, heart, length, menu, reorder), adopted from the media
  package on the library's pieces. `Track` and `Album` types, `formatDuration` in the reader's
  language, `IconPlaylistAdd`, 23 words, and tokens for the track row, the time column and the
  queue width.
- `MusicPlayer` (a column or a row, chosen by its own width; a side-panel size) and `NowPlayingBar`
  (folds its tools, then its seek into a thin progress line, then down to play), adopted from the
  media package on the library's pieces, with sm controls throughout. TransportControls marks its
  play button. Three icons, nine words, `--ps-progress-hairline`.
- `AlbumHeader`, `AlbumDetails` and `AlbumPage` (an album or playlist page on one card), adopted from
  the media package. The kind and the song count come from shared words, so they translate.
  `IconShare`, `IconDownload`, 17 words.
- Media roles, the same in both themes: `--ps-media-backdrop`, the see-through `--ps-media-overlay` dock and
  its hover, track, buffer and text colors, all from the reference palette (new tone `--ps-graphite-1`).
  The dock is the second documented exception to the flat rule, after the scrim (the user's choice).
  `surface="overlay"` on PlayerControl, IconButton, Slider and MediaTime, and `tone="overlay"` on Chip.
- Menu: in-place submenus with a Back row (→ opens, ← goes back), check rows (`checked`, `radio`),
  `keepOpen`, and `surface="overlay"` for a dark panel over video, as the user chose.
- `VideoSurface` and `MediaControls` (basic, movie and audio; filled or overlay; folding as the
  bar narrows) adopted from the media package, with `buildMediaSettings` and `speedChoices` for the
  gear menu in the reader's language. TransportControls and VolumeControl take `surface="overlay"`.
  Ten video icons, 21 words.
- `VideoPlayer` (filled or overlay controls, full screen, controls that hide while you watch, keyboard
  shortcuts) and `PipPlayer` (a picture-in-picture window that shows as much as its size allows),
  adopted from the media package. The window drag regions come from `dragHandleProps`, so the
  library knows nothing about Tauri (the user's choice). `useIdle` waits while a menu is open.
- A new Files group, adopted from the media package: `Toolbar` (with `ToolbarGroup`,
  `ToolbarDivider`, `ToolbarSpacer`; ← and → move between its buttons), `SearchField`,
  `AddressBar` (breadcrumbs, subfolder menus, an earlier-folders menu, an editable path that
  gives focus back when it closes), `TreeView` (roving focus, lazy children) and `StatusBar`.
  Five words. Tokens `--ps-row-height` (40px, the menu and option rows' existing height, now
  shared) and `--ps-tree-indent` (16px). 31 file icons: folders, file types, drives, cut, paste,
  rename, sort and view modes.
- `FileIcon`, `FileView` (details, list, tiles and icons; a desktop's selection and keyboard;
  sorting, renaming in place, search results) and `DetailsPane`, adopted from the media package,
  with `useFileBrowser` (folder, history, selection, sort, view, search, hidden files) and the
  `FsEntry` helpers (`categoryOf`, `typeLabel`, `findPath`…). Type names such as "PNG image"
  are words with an `{ext}` placeholder, so they translate. `formatBytes` and `formatDateTime`
  follow the reader's locale. 35 words, two arrow icons, six size tokens. Unavailable and hidden
  files fade to `--ps-text-3` instead of the media package's opacity.
- `FileExplorer`, adopted from the media package: navigation, address and search over a folder
  tree, the folder's content and a details pane, as three tonal cards that step aside as the
  window narrows. It changes no files itself: each command shows only when the app gives its
  operation. Its `labels` reach its parts too. `buttonClass()` lets a Menu trigger look like a
  labelled Button. Four icons (back, forward, refresh, home), `--ps-tree-width`, 37 words.
- `FileDialog`, adopted from the media package: the app's own open, save and folder dialog,
  with recent and bookmarked places, a type filter, New folder and hidden items. It reads the
  tree it is given and never touches a disk. `Modal` takes a `className`; `Switch` takes
  `layout="inline"` (the user's choice), a smaller switch beside its label. Six size tokens,
  15 words.
- `NavRail`, ported from Focus Space's navigation drawer (the source, compared with the media
  package's): the mark doubles as the expand toggle, the app's name shows as an overline when
  expanded, badges have their own words, and the current item's pill is a view-transition layer.
  `useDrawer` remembers the choice on the device and keeps the rail under 1024px. Items carry
  `data-key` (Focus Space used `data-tab`). New roles `--ps-drawer-bg` and `--ps-drawer-hover`,
  a step below the page and tinted with the accent's hue (four lime tones), with their contrast
  pairs. `IconSidebar`, two words.
- `ProgressBar` takes `tone="warning"` or `"danger"`; drive meters turn amber past 75% full and
  red past 90% (the user's choice).
- `--ps-measure` (72ch), the longest comfortable line of running text; an album's description
  keeps to it.
- A disabled `IconButton` dims its glyph to `--ps-text-3`, like a disabled `Button` (the media
  package's extra 50% opacity is left out: nothing rests translucent).
- Component pages show a `labels` prop briefly and point to the Words section.
- A modal's long content scrolls inside the dialog's padding, cut before the edge, with the
  scrollbar half a padding from the text and from the edge.
- A menu grows with its content up to `--ps-menu-max-width` (280px, Material 3's limit). Its
  header lines up with the items' text and ends with an ellipsis past that width.
- The drag grip reads as a handle in both themes: `--ps-grip` steps up to `--ps-surface-4` in
  dark instead of sinking below the row, and down to the new `--ps-stone-80` in light, the same
  distance from the row either way. `IconGrip` stands about twice as tall (six rows of dots).
- A disabled `primary` button keeps the neutral fill of the surface it sits on instead of being
  pinned to `--ps-surface-2`, where it matched a raised panel and read as bare text.
- The navigation drawer sits on `--ps-surface-1`, the same surface as the page's cards, in both
  themes. The accent tint is gone, and with it the four lime tones that existed only for it.
- `NavRail` has its own expand and collapse button in the head instead of making the app's mark
  the toggle, and `brand` is now optional, for apps that carry their mark in an app bar. As a rail
  the head stacks, so both controls fit its width.
- `AppShell` and `AppShellPage` replace `AppLayout` (removed with its demo and docs page; nothing else used it). It is Focus Space's
  window: the drawer floats at the left with the page margin around it, and beside it a column holds the top bar over the page, which
  scrolls on its own. Slots: `nav`, `topBar`, the page, `overlays`, `bottomBar`, and `aside` with `asideOpen` (a column beside the page;
  under 1024px wide it floats over the end of the page). `surface="transparent"` leaves the page see-through for a picture drawn behind
  the window, while the top bar and the drawer's gutter keep the background. The margin and gutter are 16px, 20 from 1024 and 24 from
  1920, set on the shell with container queries (it measures itself, not the screen), so everything inside reads `--ps-grid-margin`
  and `--ps-grid-gutter`. `AppShellPage` keeps every page mounted and shows the active one, sliding it in; `fill` makes a page a column
  as tall as the shell. Step 0.6a of the shared shell for Pastel Media Pro.
- `TopBar`: the bar above the page, from Focus Space. Slots: `title` (the page's `h1`), `status` beside it, `tools` at the end,
  `windowControls` after them (which tightens the right padding to sit near the corner), and `dragRegionProps`, spread on the bar, the
  title and the free space so a frameless window can be moved from the empty part (`{ 'data-tauri-drag-region': true }`; the library
  knows no shell). Its side padding is `--ps-grid-margin` when inside an `AppShell`, 16px alone. New token `--ps-topbar-height` (68px).
- `WindowControls` and `WindowButton`: minimize, maximize or restore, and close for a frameless window, as Focus Space draws them
  (40 x 36, the close button red on hover; `size="sm"` at 26 x 26 and `pressed` for a mini window's pin). They draw and report; the app
  makes the window calls. New tokens `--ps-window-button-width`, `-height` and `-size-sm`; three words, `minimize`, `maximize`,
  `restore`. Step 0.6b of the shared shell for Pastel Media Pro.
- The theme module (`packages/react/src/theme`), from Focus Space: `resolveTheme` (`system` follows the OS), `accentTokens`, `applyTheme`
  (sets `data-theme`, `color-scheme` and the accent's eight `--ps-*` tokens inline on any document, so a second window gets the same
  call), `createThemeStore({ prefix, defaultAccent })` (the last mode and accent, so every window paints right on its first frame, and
  the recent accents; keys such as `focusspace_theme_cache`, never throws when storage is blocked) and `useThemeSync`. **The default
  accent is the app's**: the store takes it and the library never picks one, so a new library default cannot repaint an app.
- 32 accent presets in three groups (vibrant, calm, muted) and `npm run accents`, which fits each into sRGB, derives its eight roles for
  both themes and fails when a pairing misses WCAG 2.2 AA (text 4.5:1, focus ring 3:1). It writes `palette.json`; `npm run check:accents`
  (part of `check`) fails when that file is stale. The generator can add a partner family of roles that must never look like the accent
  (Focus Space's break colors) when an app asks; the library's own palette has none. Color math and the generator live in `scripts/accents`.
- Documentation: a Themes and accents page with a live chooser and every preset's roles in both themes. Step 0.6c of the shared shell
  for Pastel Media Pro.
- `ColorSwatchGrid`, from Focus Space: round color swatches as a radio group laid out in rows (one tab stop, arrow keys move and
  select, Home and End). Each option brings its fill and its ink, so it shows any palette; the selected swatch gets a check and a ring in
  its own color. New token `--ps-swatch-size` (36px).
- `AppearancePanel`, from Focus Space's Appearance view: the theme (light, dark, system) and the accent from the recent colors and the 32
  presets in their three groups. It reports (`onThemeChange`, `onAccentChange`) and asks to remember the accents used (`onRemember`) when it
  goes away; `recent` is read once so the grid never moves under the pointer. Spaced like a dialog's body, so it sits in a Modal unchanged.
  Words: the headings and the 32 color names join the shared list (`colorSolarLime`…); the hint is generic ("Colors buttons, highlights and
  the focus ring."), Focus Space passes its own. Step 0.6d of the shared shell for Pastel Media Pro.
- `AccountMenu`, from Focus Space's user badge and account dialog: the signed-in profile at the bottom of the drawer. Its avatar (a
  picture or the initials, with an optional marker dot) opens a menu with the name and handle, the app's views and the exit; a view opens
  in a wide Modal titled by it, and stays while the dialog closes. The exit ("Sign out", "Switch profile") is disabled while its promise
  runs. `compact` shows the avatar alone, for the rail; the view can be controlled with `view` and `onViewChange`. It uses the library's
  own menu look (Focus Space tinted it with the drawer's accent, which the library dropped). New tokens `--ps-avatar-size` (40px) and
  `--ps-avatar-marker-size` (12px).
- `NavRail`'s `footer` can be a function of `{ expanded }`, so an account badge can follow the drawer. Step 0.6e of the shared shell
  for Pastel Media Pro.
- `Tabs`, the folder look designed for Focus Space's Settings: the active tab and its panel share a color (`--ps-surface-2`, on a
  dialog's `--ps-surface-1`) and read as one piece, the tab's bottom corners curving outward into the panel (a transparent square with
  one rounded corner and a solid shadow in the panel's color: a shape, not a decorative shadow). With the first tab active the panel's
  top-left corner is square. Inactive tabs are text, with a fill halfway between the dialog and the panel on hover. Tabs are 40px tall
  with the large radius (14px) at the top; the panel has the 2xl radius. A tab list with automatic activation: one tab stop, the arrows
  move and open (wrapping), Home and End; an optional icon per tab. Step 0.6f of the shared shell for Pastel Media Pro.
- `Checkbox`, from Focus Space, in the corrected look (L9): recessed into its row, a filled square a step darker than its surface
  (`--ps-checkbox-fill`, the page background by default) with a thin ring in `--ps-text-3`, which keeps its edge at 4.8:1 or more on
  every surface (the fill alone was about 1.1:1, under WCAG's 3:1); checked, the accent with a check painted in `--ps-on-accent`.
  New token `--ps-checkbox-mark-size` (14px).
- `StatusChip`, from Focus Space: a live status in the top bar (dot, label, value, action). Tones `idle`, `live` (the dot pulses in the
  accent) and `paused` (amber); the colors are custom properties on the chip (`--ps-status-dot`, `--ps-status-value`, `--ps-status-pulse`),
  so an app adds its own tone, as Focus Space will for its break. Tokens `--ps-status-chip-height` (36px), `--ps-status-dot-size` (8px).
- `ActionRow`, `ConfirmModal`, `FormActions` and the form layouts `ModalForm`, `FormRow` and `Subform`, from Focus Space: a dialog's
  footer buttons, a confirm dialog's body (Cancel and a focused danger action), the form footer whose Cancel appears once something was
  edited, the column of a dialog's fields, two fields side by side (or an emoji button and a field, `--ps-emoji-field-width` 64px) and a
  form nested on a tinted panel. Step 0.6g of the shared shell for Pastel Media Pro.
- Icons: the 54 Focus Space icons (24 × 24 grid, 2px round strokes, `currentColor`), without
  the Focus Space logo.
- Documentation site (`apps/docs`): Overview, Getting started, and Foundations pages for
  principles, color (roles, contrast, palette), typography, spacing and sizing, shape,
  elevation and layers, motion and iconography. Dark, light and a side-by-side compare mode.
