# Migrating from Focus Space tokens

Pastel Studio started as the CORE section of Focus Space's `src/styles/foundation/tokens.css`.
Colors, spacing, radius, rings, component sizes, z-index and durations kept their values;
only their names changed. The type scale and two easing curves changed on purpose.

## Names

Every token gains the `--ps-` prefix (`--surface-1` → `--ps-surface-1`, `--dur-2` →
`--ps-dur-2`), with three renames for clarity:

| Focus Space | Pastel Studio |
|---|---|
| `--font` | `--ps-font-family` |
| `--text-root` | `--ps-font-size-root` |
| `--weight-*` | `--ps-font-weight-*` |

`--text-1`, `--text-2` and `--text-3` (text colors) are now `--ps-text-1/2/3`. Font sizes moved
to `--ps-font-size-*`, so `text` always means a color.

## Type scale: 13 sizes → 8

Same step names, new meanings. Map by the **Focus Space** name:

| Focus Space | px | Pastel Studio | px |
|---|---|---|---|
| `--text-3xs` | 10.8 | `--ps-font-size-xs` | 11.25 |
| `--text-2xs` | 11.7 | `--ps-font-size-xs` | 11.25 |
| `--text-xs` | 12.8 | `--ps-font-size-sm` | 12.75 |
| `--text-sm` | 13.5 | `--ps-font-size-md` | 14.25 |
| `--text-md` | 14.3 | `--ps-font-size-md` | 14.25 |
| `--text-base` | 15 | `--ps-font-size-md` | 14.25 |
| `--text-lg` | 16.5 | `--ps-font-size-lg` | 16.5 |
| `--text-xl` | 19.5 | `--ps-font-size-xl` | 19.5 |
| `--text-2xl` | 21.8 | `--ps-font-size-2xl` | 22.5 |
| `--text-3xl` | 24.8 | `--ps-font-size-2xl` | 22.5 |
| `--text-4xl` | 29.3 | `--ps-font-size-3xl` | 30 |
| `--text-5xl` | 39 | `--ps-font-size-4xl` | 39 |
| `--text-6xl` | 60 | none: a product token in Focus Space (celebration emoji) | 60 |

Where `--text-base` gave emphasis, use `--ps-font-weight-semibold` with `--ps-font-size-md`.

## Easing

| Focus Space | Pastel Studio |
|---|---|
| `--ease-standard` `cubic-bezier(0.2, 0, 0, 1)` | `--ps-ease-standard`, unchanged |
| `--ease-emphasized` `cubic-bezier(0.2, 0, 0, 1)` (identical to standard) | `--ps-ease-emphasized`: the real Material 3 emphasized curve, as `linear()` |
| `--ease-decel`, `--ease-accel` | `--ps-ease-decel`, `--ps-ease-accel`, unchanged |
| `--transition` `var(--dur-2) ease` | `--ps-transition` `var(--ps-dur-2) var(--ps-ease-standard)` |

## Not carried over (Focus Space product tokens)

`--break*` (break phase colors), `--rail-width`, `--topbar-height`, `--modal-max-width*`,
`--dur-celebrate`, `--dur-equalizer`, `--dur-bell`, `--dur-art-ring`, the `@property --phase*`
registrations and `--text-6xl` stay in Focus Space. A component that needs one gets its own
component token when it is promoted.
