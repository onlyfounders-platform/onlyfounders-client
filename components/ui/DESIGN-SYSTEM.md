# Application design system

`app/globals.css` owns colors, typography, spacing, surfaces, and interaction
states for both themes. Components select semantic classes; routes compose
components. There is exactly one class layer — `ds-*`. Anything else is legacy.

## Tokens

The palette, type scale, radii and column widths mirror x.com. Dark is X's
"Lights out" (pure black); light is X's default white theme.

- **Text** has two levels, not three: `--text` for content, `--text-secondary`
  for metadata, handles, timestamps and icons. `--text-tertiary` exists but is
  reserved for placeholders and disabled states — never for readable copy.
- **Accent** is X blue (`#1D9BF0`). The action hues are fixed by meaning:
  reply blue, repost `--green`, like `--red` (pink), bookmark/share accent.
- **Radii** are pills (`--radius-full`) for every control and 16px
  (`--radius-lg`) for surfaces. Nothing in between.
- **Type** runs 12 / 13 / 15 / 17 / 20 / 31 (`--font-xs` … `--font-2xl`).
  Body copy is 15px; column headers are 20px at weight 800.
- **Layout** is 275px nav + 600px feed + 350px rail, capped at 1265px.

Routes must not hardcode a color, radius, or font size. If a value is missing
from the scale, add it to the scale.

## Components

| Component | Use for |
|---|---|
| `Button` | primary (inverted), secondary (blue), outline, ghost, danger; sm/md/lg. Always a pill. |
| `IconButton` | circular, text-free controls — overflow menus, closes, header affordances. Requires `label`. |
| `Input` / `Textarea` | fields with labels, hints and validation. Embedded native fields use `ds-field`. |
| `Tabs` | equal-width tabs with the short rounded underline and keyboard nav. |
| `Card` | outlined surface. No floating shadows, no lift on hover — it tints. |
| `ListSurface` | continuous edge-to-edge rows, rather than nested rounded cards. |
| `PageContent` / `Section` | shared route padding and section dividers. |
| `EmptyState` | every "nothing here" state. Do not hand-roll a centered div. |
| `Modal` | shared scrim, surface and sizing. |
| `ColumnHeader` | the sticky, translucent header at the top of a scrolling column. |

### Timeline primitives

A post is a hairline-divided row, never a card:

- `TimelineRow` — the row geometry: `media` slot on the left, body on the right.
- `AuthorAvatar` — avatar linked to a profile, the standard row media.
- `Byline` — display name, `@handle` and timestamp on one line, with an
  optional `trailing` slot for an overflow menu.
- `PostText` — body copy at the right size and leading.
- `ActionBar` + `Action` — the reply/repost/like/bookmark/share bar. `Action`
  owns the circular hover halo and the per-kind color; pass `kind`, `icon`,
  `label`, optional `count` and `active`.

### Right rail

- `RailModule` — the one surface that *is* a filled rounded card, with an
  optional trailing "show more" link.
- `RailRow` — a row inside a module.

## Rules

Keep API calls, permissions and actions in their owning screens. Use inline
styles only for data-driven values (a user's avatar color) or genuinely unique
layout geometry. Do not copy colors, radii, font scales, hover/focus handlers,
or action styling into routes — add a variant to the component and a class to
`globals.css` instead. Links styled as actions use `ds-button` with the same
variant classes as `Button`.

Marketing illustrations, image crops, and the contribution heatmap may keep
custom geometry; they must still use theme tokens for UI text and surfaces.
