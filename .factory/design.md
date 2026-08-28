# Triagebox visual system

## Direction: topographic cartography

Triagebox treats a messy folder as terrain to survey, not a pile to “fix” behind
the user’s back. Fine contour lines describe the unknown folder, coordinate marks
make the system feel precise, and destination buckets read like named regions on a
field map. The visual metaphor explains the product: first survey, then mark a
route, then move only with approval. It deliberately avoids dashboard cards and
generic productivity gradients.

## Palette

The light treatment is “field paper”; the dark treatment is “night survey”. Both
are first-class and follow the operating-system preference.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#F3EEDC` | `#111915` | Page/background |
| `--surface` | `#FFFCF0` | `#19241E` | Raised work areas |
| `--ink` | `#17251F` | `#F5F0DF` | Primary text |
| `--muted` | `#536158` | `#AAB7AC` | Secondary text |
| `--line` | `#B8B8A1` | `#48584E` | Contours and rules |
| `--moss` | `#245C45` | `#72C69D` | Primary action/safe route |
| `--moss-ink` | `#FFFFFF` | `#0C2118` | Text on primary action |
| `--ochre` | `#A64B22` | `#F2A36F` | Selected route/emphasis |
| `--success` | `#246247` | `#79D6A7` | Completed action |
| `--warning` | `#8A5213` | `#F4BE72` | Review required |
| `--danger` | `#9B352C` | `#FF9A8E` | Failed/destructive state |

All body combinations are designed for at least 4.5:1 contrast. Status never
depends on color: labels and icons are always present.

## Typography

- **Headings / wayfinding:** `Aptos Display`, `Segoe UI`, system sans-serif.
  Condensed-feeling uppercase eyebrow labels act like map legends.
- **Body / controls:** `Aptos`, `Inter`, `Segoe UI`, system sans-serif. The utility
  stays fast and ships no font payload or third-party request.
- **Coordinates / file facts:** `ui-monospace`, `SFMono-Regular`, `Consolas`,
  monospace, with tabular figures.
- Scale: 12, 14, 16, 20, 28, and clamp(40–68) px. Body never drops below 16 px.

## Spacing and structure

An 8 px base grid with 4 px for tight optical adjustment. Main gutters are 20 px
on phones, 32 px on tablets, and 48 px on desktop. Workbench controls use a
minimum 44 px target. Thin rules and whitespace establish groups before surfaces
are introduced. The file queue is one continuous ledger; independent summaries
sit as map-legend blocks.

At 390 px, the desktop ledger becomes stacked file records, secondary metadata is
condensed, and the sticky action rail becomes a safe-area-aware bottom bar. No
capability is removed on phone, though writable folder access is clearly described
as a desktop Chromium feature.

## Interaction grammar

- **Survey:** choose a folder; a determinate count and small coordinate readout
  confirm traversal.
- **Mark:** each proposal has a plain-language rationale, an approval checkbox,
  and an editable destination. Bulk controls announce exactly how many rows change.
- **Traverse:** execution copies, verifies, then removes each approved source. A
  quiet route line fills once; no celebratory confetti.
- **Receipt:** every run ends with portable JSON/CSV controls and a prominent undo
  route when the same folder handle remains available.

Focus is a 3 px ochre outline plus 2 px paper offset. Pressed controls translate
1 px. Dialog focus returns to its origin. Errors name the file and the recovery
action.

## Motion policy

Interface motion lasts 160–240 ms and only animates opacity or transform. Ledger
rows enter once from their scan origin; route progress moves forward; an update
toast rises from the service-worker boundary. Nothing loops. Under
`prefers-reduced-motion: reduce`, transitions and scrolling become instant, while
layering, labels, and progress values preserve hierarchy.

## Asset plan and provenance

The hero is an original square editorial illustration: an overhead paper
topographic map whose contour valleys resolve into file tabs, with one moss route
threading through stamped category markers. It clarifies “survey before moving”
without pretending to show the live app. UI icons and the Triagebox contour mark
are hand-authored SVG/CSS primitives.

### Image prompt sheet

- **Use case:** stylized-concept
- **Subject:** overhead abstract field map of a messy digital folder becoming a
  carefully surveyed route; layered file-tab landforms and contour lines; small
  unlabeled brass survey pins; no people.
- **World/materials:** tactile archival paper, ink, cut-paper tabs, subtle grain,
  precision cartography.
- **Light/lens:** soft raking daylight, straight overhead orthographic framing,
  shallow physical relief but no photographic scene horizon.
- **Palette words:** field-paper cream, deep forest ink, moss green, restrained
  burnt ochre, charcoal.
- **Composition:** square, central winding route, calm negative space around the
  boundary, legible at 480 px.
- **Negative list:** no text, no letters, no numbers, no logos, no watermark, no
  computer screens, no people, no neon gradient, no glossy 3D, no recognizable
  brands, no misleading UI.

Generated via the factory Azure image deployment (`factory-image`) on 2026-08-28.
The generated source and exact prompt sidecar live in `assets/src/`. Product WebP
derivatives and the 1200×630 social crop (`triage-social.jpg`) live in
`public/assets/`; the social crop is a mechanical derivative of that original
asset. Generated imagery is original to this product; hand-authored icons are
MIT-licensed with the application.
