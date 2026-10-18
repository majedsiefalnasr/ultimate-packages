# GAP-094 W1 manifest-only batch: evidence record (React Toolbar)

**Date:** 2026-10-18
**Base:** `main` `4a426b34` (PR #39, Workstream 1 W1 merge).
**Authority:** ADR-052 X-12(2) as re-scoped by ADR-062, ADR-064 with its theme-screening clarification, ADR-065, ADR-067, the GAP-094 Specification §3.4 (Amendment A1) and §4, and the Workstream 1 Plan Task 2.

## Scope: the files W1 changed

W1 (PR #39) changed four files under `packages/react/src/toolbar/`:

| File                  | Production scope (ADR-062) | Manifest state at the base                                                                  | Action in this batch                    |
| --------------------- | -------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| `toolbar-style.ts`    | Yes (distributed)          | No entry. Held since GAP-094 batch 3 (ADR-064 clarification, the `lara-light` combination). | Classify and add entries (below).       |
| `toolbar.tsx`         | Yes (distributed)          | Entry exists (REFERENCE, batch 3, `components/lib/toolbar/Toolbar.js`).                     | None. Existing entry unchanged (below). |
| `toolbar.spec.tsx`    | No (test, excluded)        | Not required.                                                                               | None.                                   |
| `toolbar.stories.tsx` | No (story, excluded)       | Not required.                                                                               | None.                                   |

**X-12(2) record.** Changed-file completeness for W1 is satisfied by this batch: every production file W1 changed has a truthful manifest entry once this batch merges. The two files are `toolbar-style.ts` (entries added here) and `toolbar.tsx` (entry already present and still true).

## Method

- **Upstream archives.** Verified against `docs/architecture/checksums.json` by SHA-256, from the local `.vendor-cache`:
  - PrimeReact 10.9.9 at `d0f574e3`, `9598e1e3709641b13111a0b222db1430160ae47c08277d2037520482e0e78ecf`;
  - `@primeuix/styles` 2.0.3, `e4f6ef614d2412c223560403c8b0c1bebe6ab07d8242470572310f3e23423403`.
- **Classification.** ADR-064 is applied to the file as it stands after PR #39, not to the earlier file that batch 3 held.
- **Name and directory search for ORIGINAL.** Not needed: counterparts exist (`components/lib/toolbar/ToolbarBase.js`, `@primeuix/styles` `dist/toolbar/index.mjs`).
- **Screening (ADR-064 clarification).** All 56 pinned PrimeReact themes (`public/themes/*/theme.css`) were compared as screening evidence only.

## `toolbar-style.ts`: classified COPY (2 entries, 1 file)

### Comparison with `@primeuix/styles@2.0.3` toolbar (`dist/toolbar/index.mjs`)

The rewritten `css` is structurally identical to the pinned style. A mechanical comparison, after renaming `.p-` to `.u-` and removing whitespace, finds the two strings equal.

- The root rule keeps all ten declarations in upstream's order: `display: flex`, `align-items: center`, `justify-content: space-between`, `flex-wrap: wrap`, then `padding`, `background`, `border: 1px solid`, `color`, `border-radius` and `gap` as the identical `dt('toolbar.padding')`, `dt('toolbar.background')`, `dt('toolbar.border.color')`, `dt('toolbar.color')`, `dt('toolbar.border.radius')` and `dt('toolbar.gap')` token paths.
- The group rule keeps upstream's selector list (`-start`, `-center`, `-end`) and both declarations (`display: flex; align-items: center`).
- Changes: the prefix rename and whitespace compaction only.

This is retained declaration-block expression, so the class is **COPY**, sub-label `adapted` (ADR-064 matrix: any COPY other than verbatim or import-path rewrite).

### Comparison with PrimeReact 10.9.9 `components/lib/toolbar/ToolbarBase.js`

- **Kept:** the root's `display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap` and the group rule's `display: flex; align-items: center`, rule by rule; the class map's four keys (`root`, `start`, `center`, `end`); the root class shape `p-toolbar p-component` (here `u-toolbar u-component`).
- **Differs:** ToolbarBase names the groups `-group-start`, `-group-center`, `-group-end` and has separate `-group-left` and `-group-right` alias rules, and it carries no colour, border, radius, gap or padding. Ultimate has no aliases and uses the `@primeuix/styles` names.
- **Class:** **COPY** (ambiguity rule). Uncertainty stated: the declarations are common flex layout CSS and the selectors follow public class names. The rule-by-rule retention is the evidence.

### Theme screening (ADR-064 clarification, §1-§3): negative

- The rewritten file has **no literal theme value**. Colours, border colour, radius, gap and padding are all `dt('toolbar.*')` paths. The only literals are layout keywords and `1px solid`, which are generic (§2).
- The four values that held the earlier file (batch 3: `background: #f9fafb`, `border: 1px solid #e5e7eb`, `border-radius: 6px`, `gap: 0.5rem`, found together only in the eight `lara-light-*` themes) are **removed**. As a spot check, `background: #f9fafb` still appears in 8 of 56 themes, all `lara-light-*`; it is not in the file.
- There is therefore no retained theme-only declaration, no isolated distinctive value and no family-unique combination (§3). No theme entry is added, and ADR-065's two-file exception is not extended.
- Resolution: the batch 3 hold on `toolbar-style.ts` is **resolved** by Toolbar Option B (ADR-067, Workstream 1 W1, PR #39). ADR-067 also fixes the source rule this file follows: ported visual CSS comes from the pinned `@primeuix/styles@2.0.3`, with no PrimeReact theme CSS.

### Entries added (`react.json`, appended)

| Entry (file ⇐ source)                                        | Class | `modificationStatus` | `originalPath`                          |
| ------------------------------------------------------------ | ----- | -------------------- | --------------------------------------- |
| `toolbar-style.ts` ⇐ `components/lib/toolbar/ToolbarBase.js` | COPY  | `adapted`            | `components/lib/toolbar/ToolbarBase.js` |
| `toolbar-style.ts` ⇐ `@primeuix/styles@2.0.3` toolbar        | COPY  | `adapted`            | `@primeuix/styles@2.0.3 toolbar`        |

Both use `ultimateDestination` `packages/react/src/toolbar/toolbar-style.ts`. Two entries cover one file, as for `divider-style.ts` in batch 3. Existing entries are not edited.

## `toolbar.tsx`: existing entry stays true, not edited

The batch 3 entry classifies it REFERENCE (every statement rewritten against `components/lib/toolbar/Toolbar.js`; shared are standard ARIA `role="toolbar"`, the public `start`/`center`/`end` props and equivalent slot output). PR #39 added only one `style?: React.CSSProperties` prop, passed to the root element. `style` is a standard React prop name, and ToolbarBase's `defaultProps` also lists `style`; a public name alone never establishes copying (ADR-064 Decision 2). No statement was copied, so the class is unchanged. ADR-064 Decision 6 and the task rule forbid editing existing entries, and none is needed.

## Validator check

`node scripts/provenance/validate-provenance.mjs` (full) and `--base-ref origin/main` (PR diff), run from this worktree at `4a426b34` before the manifest edit and again after it.

| Package   | Before: production / excluded / missing | After: production / excluded / missing |
| --------- | --------------------------------------- | -------------------------------------- |
| ng        | 277 / 185 / 164                         | 277 / 185 / 164                        |
| react     | 265 / 173 / **217**                     | 265 / 173 / **216**                    |
| vue       | 385 / 190 / 265                         | 385 / 190 / 265                        |
| **Total** | **646** problems                        | **645** problems                       |

- **Missing count.** 646 → 645. It drops by exactly one, the one file that gained entries (`toolbar-style.ts`): two entries for one file (GAP-094 Spec §4.6 counts files).
- **Failure lines.** A line-by-line diff of the before and after output shows only three changes: the React summary line, the removed `toolbar-style.ts has no entry` line and the total. No new failure line, and no change to the production and excluded counts of any package (the excluded set is unchanged).
- **Diff check.** `--base-ref origin/main` reports the same changes, and its "diff check against origin/main passed" line is present before and after.
- **Remaining:** ng 164, react 216, vue 265. No file is held under ADR-065 any longer.

## Result

| Framework | COPY | REFERENCE | ORIGINAL | Entries | Files |
| --------- | ---- | --------- | -------- | ------- | ----- |
| React     | 1    | 0         | 0        | 2       | 1     |

- Files and tests changed: none outside the manifest and documents. No source, test or baseline is touched.
- Tracking updated in the same PR: `BLUEPRINT_GAPS.md` (GAP-064 React bullet, U2 status, W1 progress line; GAP-094 hold and counts), `COMPLETION_REGISTER.md` (C04, C05), `ROADMAP.md` footnote 1 and the `PROVENANCE.md` W1 disclosure.
