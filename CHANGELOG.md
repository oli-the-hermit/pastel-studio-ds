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
- A disabled `IconButton` dims its glyph to `--ps-text-3`, like a disabled `Button` (the media
  package's extra 50% opacity is left out: nothing rests translucent).
- Component pages show a `labels` prop briefly and point to the Words section.
- A modal's long content scrolls inside the dialog's padding, cut before the edge, with the
  scrollbar half a padding from the text and from the edge.
- A menu grows with its content up to `--ps-menu-max-width` (280px, Material 3's limit). Its
  header lines up with the items' text and ends with an ellipsis past that width.
- Icons: the 54 Focus Space icons (24 × 24 grid, 2px round strokes, `currentColor`), without
  the Focus Space logo.
- Documentation site (`apps/docs`): Overview, Getting started, and Foundations pages for
  principles, color (roles, contrast, palette), typography, spacing and sizing, shape,
  elevation and layers, motion and iconography. Dark, light and a side-by-side compare mode.
