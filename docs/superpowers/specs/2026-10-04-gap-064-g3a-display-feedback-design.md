# Specification — GAP-064 G3-A: Display Primitives (F5) and Feedback (F4) Use Their Aura Tokens

**Status:** Approved (Spec Review 2026-10-04); decisions and clarifications in §13.
**Date:** 2026-10-04
**Branch:** `feature/gap-064-g3a-display-feedback` (from `main` `fa5c150`)
**Origin:** GAP-064 (PARTIAL), G3 tranche G3-A. Decisions: ADR-051, D-G3-1..9 and the additional rulings in `docs/architecture/research/2026-10-04-gap-064-g3-research.md` §11. Parity baseline: ADR-048.

**Required sequence:** Decision (approved) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

Replace the hand-written CSS of the G3-A components with the applicable upstream structural CSS from `@primeuix/styles` 2.0.3, so that these components render with, and are customisable through, their already-registered Aura tokens.

- **F5 Display:** avatar, chip, tag, skeleton, overlaybadge, knob, progressbar, progressspinner, metergroup, timeline, terminal.
- **F4 Feedback:** message, inlinemessage (Vue only), toast.
- **Inventory:** 13 Angular components and 14 Vue components (§4.1).

The work has three parts:

1. **Port.** For each component, port the upstream rule groups that match DOM Ultimate actually renders. Selectors are mapped to Ultimate's existing class names (D-G3-1).
2. **Rename keys.** Where the registered style key differs from the Aura key, rename it under ADR-051 (5 components, 9 sites).
3. **Record.** Every omitted upstream rule group is listed as a feature exclusion (D-G3-3). Every adaptation and every retained Ultimate-only rule is listed as a parity exception (D-G3-8, D-G3-9).

GAP-064 stays PARTIAL; G3-B..E remain.

## 2. Decisions This Specification Implements

- **ADR-051:** the upstream preset key is the canonical lookup key.
- **D-G3-1 / D-G3-2:**
  - Selectors are adapted to the existing Ultimate DOM.
  - No component DOM class is renamed.
  - The mapping is explicit and testable.
  - No new public API or runtime abstraction.
- **D-G3-3 = A:** port only applicable rule groups and record omissions. No dead upstream CSS.
- **D-G3-4 = A:** not applicable to G3-A. No runtime-variable references occur in the G3-A keys.
- **D-G3-5:** not applicable to G3-A. None of the six upstream-unresolved references belongs to a G3-A key.
- **D-G3-6:** tranche G3-A = F5 + F4 only.
- **D-G3-7:**
  - "Before" baselines are generated in Linux Docker `mcr.microsoft.com/playwright:v1.63.0-jammy`.
  - Default tolerance.
  - Changes that fall inside the tolerance are recorded.
  - Visual-review gate before any baseline update.
- **D-G3-8:** Ultimate-only literals are retained unless an existing Aura token has the same semantic role and upstream evidence supports the mapping. Every retained or mapped deviation is a parity exception.
- **D-G3-9:** Angular and Vue are adapted independently. For G3-A, the two frameworks' DOM classes are identical for every shared key (§4.3).
- **Additional rulings:**
  - No new Aura modules.
  - No new GAPs.
  - AvatarGroup is not in G3-A.
  - Screenshot coverage is mandatory for every component and story whose CSS changes.
  - 15% size gate per tranche, measured after implementation.

## 3. Framework Applicability

- **Angular (`@ultimate/ng`):** 13 components.
- **Vue (`@ultimate/vue`):** 14 components.
- React, `@ultimate/themes`, `@ultimate/uix-styled`, `@ultimate/uix-styles`, `@ultimate/ng-core`, `@ultimate/vue-core`: no change.

## 4. Existing Behavior (verified on `fa5c150`)

### 4.1 Inventory, registration and current CSS

All style modules are `packages/<fw>/src/<dir>/<dir>-style.ts`. Registration sites are `file:line` under `packages/<fw>/src/`.

| Key             | Angular dir / registration                                                            | Vue dir / registration                                                                   | Current token use (raw `var()` refs / resolving today) |
| --------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| avatar          | avatar / `avatar/avatar.ts:46` `avatar`                                               | avatar / `avatar/BaseAvatar.ts:16` `avatar`                                              | none                                                   |
| chip            | chip / `chip/chip.ts:66` `chip`                                                       | chip / `chip/BaseChip.ts:11` `chip`                                                      | 3 / 2                                                  |
| tag             | tag / `tag/tag.ts:36` `tag`                                                           | tag / `tag/BaseTag.ts:10` `tag`                                                          | 8 / 0 (`--u-tag-*-bg` are not Aura names)              |
| skeleton        | skeleton / `skeleton/skeleton.ts:37` `skeleton`                                       | skeleton / `skeleton/BaseSkeleton.ts:12` `skeleton`                                      | 1 / 0                                                  |
| overlaybadge    | overlay-badge / `overlay-badge/overlay-badge.ts:38` **`overlay-badge`** ⚠             | overlay-badge / `overlay-badge/BaseOverlayBadge.ts:19` **`overlay-badge`** ⚠             | none                                                   |
| knob            | knob / `knob/knob.ts:73` `knob`                                                       | knob / `knob/BaseKnob.ts:38` `knob`                                                      | none                                                   |
| progressbar     | progress-bar / `progress-bar/progress-bar.ts:48` **`progress-bar`** ⚠                 | progress-bar / `progress-bar/BaseProgressBar.ts:10` **`progress-bar`** ⚠                 | 3 / 0                                                  |
| progressspinner | progress-spinner / `progress-spinner/progress-spinner.ts:32` **`progress-spinner`** ⚠ | progress-spinner / `progress-spinner/BaseProgressSpinner.ts:11` **`progress-spinner`** ⚠ | 4 / 0                                                  |
| metergroup      | meter-group / `meter-group/meter-group.ts:60` **`meter-group`** ⚠                     | meter-group / `meter-group/BaseMeterGroup.ts:15` **`meter-group`** ⚠                     | 1 / 0                                                  |
| timeline        | timeline / `timeline/timeline.ts:60` `timeline`                                       | timeline / `timeline/BaseTimeline.ts:11` `timeline`                                      | 3 / 0                                                  |
| terminal        | terminal / `terminal/terminal.ts:77` `terminal`                                       | terminal / `terminal/BaseTerminal.ts:10` `terminal`                                      | 2 / 1                                                  |
| message         | message / `message/message.ts:72` `message`                                           | message / `message/BaseMessage.ts:14` `message`                                          | 12 / 6                                                 |
| inlinemessage   | — (no Angular component)                                                              | inline-message / `inline-message/BaseInlineMessage.ts:22` **`inline-message`** ⚠         | 8 / 0                                                  |
| toast           | toast / `toast/toast.ts:83` `toast`                                                   | toast / `toast/BaseToast.ts:12` `toast`                                                  | 12 / 6                                                 |

⚠ marks a key mismatch: the component registers a hyphenated key, so its Aura variables are never defined today. That makes 5 components and 9 sites to rename.

### 4.2 Upstream sources

- **Structural CSS:** `@primeuix/styles` 2.0.3, module `<key>`. Readable source is in `.vendor-extracted/uix-styles-full/src/<key>/index.ts`. The pinned tarball is `.vendor-cache/@primeuix__styles-2.0.3.tar.gz` (`dist/<key>/index.mjs`, export `style`).
- **Tokens:** `@primeuix/themes` 2.0.3 Aura `<key>`. These are already registered in `auraPreset`.
- **Counterparts:**
  - PrimeNG 21.1.9 `packages/primeng/src/<key>` and PrimeVue 4.5.5 `packages/primevue/src/<key>`; each style class imports `@primeuix/styles/<key>`.
  - Exceptions: PrimeNG has no `inlinemessage` component, and its `overlaybadge` has no style import.
- **Toast positioning:** upstream sets the offset through component inline styles (PrimeNG `toast/style/toaststyle.ts` `inlineStyles`: `20px`), not through tokens.

### 4.3 Upstream-to-Ultimate class mapping (D-G3-1)

The mapping was derived by comparing every upstream class (renamed `p-` → `u-`) against the class literals and dynamic class templates the component actually emits:

- Toast `u-toast-${position}` and `u-toast-message-${severity}`;
- Message `u-message-${severity}`;
- Tag `u-tag-${severity}`;
- InlineMessage `u-inline-message-${severity}`;
- Timeline `u-timeline-${layout}`.

**Angular and Vue are identical for every shared key.** Unless listed below, an upstream class `p-X` maps to `u-X` by **identical name**.

| Key             | Renamed (upstream → Ultimate)                                                                                                                                               | Not rendered by Ultimate                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| avatar          | —                                                                                                                                                                           | `p-avatar-group` (AvatarGroup is a separate component, outside G3)                                                            |
| skeleton        | —                                                                                                                                                                           | `p-skeleton-animation-none` (inverse modifier; see PX-A3)                                                                     |
| progressbar     | `p-progressbar` → `u-progress-bar`; `-value` → `u-progress-bar-value`; `-label` → `u-progress-bar-label`; `-indeterminate` → `u-progress-bar-indeterminate`                 | `p-progressbar-determinate` (see PX-A1)                                                                                       |
| progressspinner | `p-progressspinner` → `u-progress-spinner`; `-spin` → `u-progress-spinner-spin`; `-circle` → `u-progress-spinner-circle`                                                    | —                                                                                                                             |
| metergroup      | `p-metergroup` → `u-meter-group` and every `p-metergroup-*` → `u-meter-group-*` (meters, meter, label-list, label, label-marker, label-icon, vertical, label-list-vertical) | `p-metergroup-horizontal`, `p-metergroup-label-list-horizontal` (see PX-A2)                                                   |
| timeline        | —                                                                                                                                                                           | `p-timeline-left`, `-right`, `-alternate`, `-bottom` (see FX-A3)                                                              |
| terminal        | —                                                                                                                                                                           | `p-terminal-input`                                                                                                            |
| message         | —                                                                                                                                                                           | `p-message-content-wrapper`, `-close-icon`, `-outlined`, `-simple`, `-sm`, `-lg`, `-enter-active`, `-leave-active`            |
| inlinemessage   | `p-inlinemessage` → `u-inline-message` and every `p-inlinemessage-*` → `u-inline-message-*` (text, icon, info, success, warn, error, secondary, contrast)                   | `p-inlinemessage-icon-only`                                                                                                   |
| toast           | —                                                                                                                                                                           | `p-toast-message-icon`, `-message-text`, `-close-icon`, `-message-enter-active`, `-message-leave-active`, `-message-leave-to` |

Notes:

- chip, tag, overlaybadge and knob map entirely by identical name.
- Upstream `@keyframes` names are renamed `p-…` → `u-…` (for example `u-progressspinner-rotate`). The ported animation declarations reference the renamed keyframes.

### 4.4 Rule groups: supported vs omitted

Counts are upstream rule groups. Angular equals Vue.

| Key                 | Ported / upstream groups | Omitted (feature exclusions)                                                                                                      | Adapted (parity exceptions) |
| ------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| avatar              | 10 / 15                  | FX-A1: 5 `.p-avatar-group …` groups                                                                                               | —                           |
| chip                | 7 / 7                    | —                                                                                                                                 | —                           |
| tag                 | 9 / 9                    | —                                                                                                                                 | —                           |
| skeleton            | 4 / 5                    | the `.p-skeleton-animation-none::after` group (subsumed by PX-A3)                                                                 | PX-A3                       |
| overlaybadge        | 3 / 3                    | —                                                                                                                                 | —                           |
| knob                | 5 / 5                    | —                                                                                                                                 | —                           |
| progressbar         | 7 / 7                    | —                                                                                                                                 | PX-A1 (2 groups)            |
| progressspinner     | 4 / 4                    | —                                                                                                                                 | —                           |
| metergroup          | 17 / 17                  | —                                                                                                                                 | PX-A2 (5 groups)            |
| timeline            | 18 / 30                  | FX-A3: 12 `left` / `right` / `alternate` / `bottom` groups                                                                        | —                           |
| terminal            | 5 / 6                    | FX-A4: `.p-terminal-input::-ms-clear`                                                                                             | —                           |
| message             | 25 / 53                  | FX-A5: 28 groups for content-wrapper, close-icon, outlined, simple, sm, lg and the enter/leave animations, plus their 2 keyframes | —                           |
| inlinemessage (Vue) | 15 / 16                  | FX-A6: `.p-inlinemessage-icon-only .p-inlinemessage-text`                                                                         | —                           |
| toast               | 36 / 42                  | FX-A7: 6 groups for message-icon, message-text, close-icon and the enter/leave animations, plus 2 keyframes                       | —                           |

### 4.5 Tokens

✅ Every `dt()` path in every supported G3-A rule group resolves against the current Ultimate preset: own-key, semantic, or cross-component. There are **no unresolved references** in G3-A, so no E1 or E3 exception list is needed. Every current Ultimate `var(--u-…)` reference with an invented name is removed by the port (for example `--u-tag-success-bg`, `--u-toast-info-bg`, `--u-message-info-bg`, `--u-progress-bar-value-bg`).

### 4.6 Existing coverage

- **Unit tests:** no G3-A unit test asserts on style keys or CSS.
- **Screenshots:** no G3-A component has screenshot coverage. Accessibility scans don't cover them either.
- **Stories:**
  - ng and vue: Avatar Label/Icon/Image/Circle/Large; Chip Default/WithIcon/Removable; Tag Default/Severity (success only); Skeleton Default/Circle; OverlayBadge Default/DotOnly; Knob Default/NoValueText/Readonly; ProgressBar Determinate/Indeterminate; ProgressSpinner Default; MeterGroup Default/Vertical; Timeline Default (vertical); Terminal Default; Message Default/Closable (info); Toast Default.
  - vue only: InlineMessage Default (error) / Success.
- **Stories that don't exercise their CSS:**
  - Both Toast stories render an empty toast, so no message is shown.
  - Avatar "Image" loads an external CDN URL, so it is not deterministic.
- **Provenance:** none of the 27 G3-A style files has a provenance entry. Missing entries are a broad pre-existing condition (`provenance:validate` already fails on main for ng/vue component files).

## 5. Required Behavior

### 5.1 Style keys (ADR-051)

The 9 sites marked ⚠ in §4.1 register the Aura key: `overlaybadge`, `progressbar`, `progressspinner`, `metergroup` (Angular and Vue) and `inlinemessage` (Vue). Only the key literal changes.

### 5.2 Structural CSS per component

Each G3-A style module's `css` becomes, in this canonical order (§13 item 10):

1. **Upstream-derived groups, in upstream source order.** These are:
   - the supported upstream rule groups of §4.4, with selectors rewritten by the §4.3 mapping;
   - the parity-exception groups (§5.3), with the exact selector rewrite given there;
   - the keyframes used by them, renamed per §4.3.

   They are interleaved exactly as upstream orders them. Declarations are unchanged, including every `dt('…')` call and every literal value.

2. **Retained Ultimate-only rules.** Only those listed in §5.3 (PX-A4, PX-A5, PX-A6), with exactly the text given there and in that order. None of them redeclares a property of an upstream-derived rule on the same selector, so appending them does not change the upstream cascade.

**Removed:** every other current hand-written rule — every rule whose selector targets a mapped class.

**Unchanged:** the `classes` resolver and the component template/DOM. G3-A changes no emitted class, element or attribute.

Location: the CSS stays in each framework's own style module. See §12 item 1.

### 5.3 Parity exceptions (recorded, both frameworks unless noted)

- **PX-A1, ProgressBar determinate.** Ultimate renders determinate mode as the absence of `u-progress-bar-indeterminate`; there is no determinate class. The two `.p-progressbar-determinate …` groups are ported with the selector prefix `.u-progress-bar:not(.u-progress-bar-indeterminate) …`.
- **PX-A2, MeterGroup horizontal.** Horizontal is the default, shown by the absence of `u-meter-group-vertical`. The selectors are rewritten:
  - `.p-metergroup-horizontal` → `.u-meter-group:not(.u-meter-group-vertical)`;
  - `.p-metergroup-label-list-horizontal` → `.u-meter-group-label-list:not(.u-meter-group-label-list-vertical)`.
  - This covers 5 groups.
- **PX-A3, Skeleton animation.** Ultimate adds `u-skeleton-wave` when `animation="wave"` (the default) and omits it for `"none"`. Upstream instead animates `.p-skeleton::after` by default and removes the animation with `.p-skeleton-animation-none`. The `.p-skeleton::after` group (and its RTL variant) is ported as `.u-skeleton-wave::after`, and the animation-none group is not needed.
- **PX-A4, Toast root positioning (retained literals).**
  - **Evidence.** Upstream supplies the root's `position: fixed` and the per-position offsets (`20px` / `50%`) through component inline styles, not CSS or tokens: PrimeNG `toast/style/toaststyle.ts` and PrimeVue `toast/style/ToastStyle.js` `inlineStyles.root`. The stacking order is managed at runtime by `ZIndexUtils`. Upstream `.p-toast` CSS sets only `width`, `white-space` and `word-break`.
  - **Rules.** Ultimate expresses these in CSS, so the following rules are retained, with exactly this text, in both frameworks (D-G3-8: no token has these roles):
    ```css
    .u-toast {
      position: fixed;
      z-index: 1200;
      max-width: calc(100vw - 2rem);
    }
    .u-toast-top-right {
      top: 1rem;
      right: 1rem;
    }
    .u-toast-top-left {
      top: 1rem;
      left: 1rem;
    }
    .u-toast-bottom-right {
      bottom: 1rem;
      right: 1rem;
    }
    .u-toast-bottom-left {
      bottom: 1rem;
      left: 1rem;
    }
    .u-toast-top-center {
      top: 1rem;
      left: 50%;
    }
    .u-toast-bottom-center {
      bottom: 1rem;
      left: 50%;
    }
    .u-toast-center {
      top: 50%;
      left: 50%;
    }
    ```
  - **Transforms and widths.** The `transform` and `min-width` of the center positions come from the ported upstream `.p-toast-top-center`, `-bottom-center` and `-center` groups (identical-name mapping), so they are not repeated in the retained rules. The toast width comes from the ported `.p-toast` group (`dt('toast.width')`).
  - **Recorded differences:**
    - offsets of `1rem` vs upstream `20px`;
    - a fixed `z-index: 1200` vs runtime `ZIndexUtils`;
    - the Ultimate-only responsive `max-width`.
  - **Dropped.** The current `display: flex; flex-direction: column; gap: 0.5rem` on `.u-toast` is not retained. Upstream spaces messages with the ported `.p-toast-message { margin: 0 0 1rem 0 }`.
- **PX-A5, Ultimate-only layout rules (retained literals).** These are retained unchanged; no upstream rule or Aura token has the same role:
  - `.u-chip-label { line-height: 1.5; padding: 0.25rem 0; }`;
  - `.u-terminal-welcome-message { margin-bottom: 0.5rem; }`;
  - `.u-terminal-command { display: block; margin-bottom: 0.25rem; }`.
- **PX-A6, Skeleton root `position: relative` (retained literal).**
  - **Evidence.** Upstream supplies `position: relative` on the skeleton root through component inline styles: PrimeNG `skeleton/style/skeletonstyle.ts` and PrimeVue `skeleton/style/SkeletonStyle.js` `inlineStyles.root`. The ported `::after` group is absolutely positioned and depends on it.
  - **Rule.** Retained in both frameworks, with exactly this text: `.u-skeleton { position: relative; }`.
- **Not a G3-A exception: Chip's upstream inline style.** Chip's upstream inline style (`display: none` when not visible) has no CSS counterpart. Ultimate removes the chip from the DOM instead. No rule is needed.

### 5.4 Feature exclusions (D-G3-3; recorded, not ported)

- **FX-A1:** AvatarGroup rules. AvatarGroup is a separate component, outside G3 (user ruling).
- **FX-A2:** Skeleton `animation-none`. It is subsumed by PX-A3.
- **FX-A3:** Timeline `align` variants (`left`, `right`, `alternate`, `bottom`). Both frameworks accept an `align` input but emit no alignment class, so the upstream groups can never match.
  - The ignored `align` input is a pre-existing behaviour gap. It is recorded as a follow-up, not fixed in G3-A.
- **FX-A4:** Terminal `-ms-clear`. This is a legacy IE pseudo-element on a class Ultimate doesn't render.
- **FX-A5:** Message content-wrapper, close-icon, outlined/simple variants, sm/lg sizes, and enter/leave animations. Ultimate renders none of these.
- **FX-A6:** InlineMessage icon-only.
- **FX-A7:** Toast message-icon, message-text, close-icon, and enter/leave/leave-to animations. Ultimate renders no severity icon, text wrapper, close icon or animation classes.

### 5.5 Provenance

Each of the 27 G3-A style files gets one entry in `docs/architecture/provenance/{ng,vue}.json`:

- `modificationStatus: "reference-derived"`;
- the description reads "Ported (Option B — reference, not verbatim copy) from `@primeuix/styles@2.0.3` `<key>`, selectors adapted to Ultimate's DOM per the GAP-064 G3-A mapping; exceptions PX-…/FX-…".

The other missing ng/vue entries are pre-existing and out of scope.

### 5.6 What does not change

- **Packages:** no change to any template, `classes` resolver, input/prop/emit, `@ultimate/themes` (no new module, no token change), `@ultimate/uix-styled`, `@ultimate/uix-styles`, the cores, or React.
- **Excluded from G3-A:**
  - G3-B..E components;
  - AvatarGroup;
  - every Tranche 1 follow-up;
  - FileUpload's dependency on Message/Button tokens, which G3-A's Message port does not resolve (FileUpload's CSS still reads `message.error.*` only when a Message is mounted).

## 6. API Requirements

- No public API or signature change in any package.
- No DOM, class or attribute change.
- **Consumer-visible change, intended:** the 27 components render with Aura token values and follow theme customisation.
- Generated style keys change for the 5 renamed components (ADR-051 runtime artifact).
- `MIGRATION.md` is decided at Plan Review, as for Tranche 1.

## 7. Affected Files

| File(s)                                                                         | Change                                                                                                                                   |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| The 27 style modules in §4.1                                                    | `css` replaced per §5.2/§5.3. `classes` unchanged.                                                                                       |
| The 9 ⚠ registration sites in §4.1                                              | Key literal only.                                                                                                                        |
| `docs/architecture/provenance/{ng,vue}.json`                                    | 27 entries (§5.5).                                                                                                                       |
| `packages/themes/test/fixtures/primeuix-styles-g3a.json` (new)                  | Upstream structural CSS of the **14 unique keys**, generated from the pinned `@primeuix/styles` 2.0.3 tarball; no hand edits.            |
| `packages/themes/test/g3a-upstream-fidelity.test.ts` (new)                      | C3. Reads the 27 style modules' `css` source text (no package imports) and holds the explicit mapping, omitted-group and exception data. |
| `packages/{ng,vue}/src/g3a-aura-styles.spec.ts` (new)                           | C1, C2 and the C3 dynamic-class checks (runtime mounts).                                                                                 |
| Verification-only stories (§8 C5) in `packages/{ng,vue}/src/<dir>/*.stories.ts` | Test infrastructure.                                                                                                                     |
| `packages/{ng,vue}/e2e/g3a-aura-styles.spec.ts` and `*-snapshots/`              | Screenshot and accessibility coverage.                                                                                                   |
| `docs/architecture/ACCESSIBILITY_BASELINE.md`                                   | Only for violations you approve at the review gate.                                                                                      |
| `docs/architecture/BLUEPRINT_GAPS.md`, closeout record                          | At closeout; GAP-064 stays PARTIAL.                                                                                                      |

Any other file found necessary is reported at Plan Review.

## 8. Acceptance Criteria

All are checked in both frameworks. Generated-style checks use the rendered `<style data-u-ng-style|data-u-style>` elements, as in Tranche 1.

1. **C1 — Keys.** Each of the 5 renamed components, mounted alone, produces exactly one structural element and one `<key>-variables` element under its Aura key, and none under the old hyphenated key. The 22 already-correct components keep their key.
2. **C2 — Variable resolution.** Every G3-A component is mounted with representative props, covering every severity/size/layout/mode variant that §4.4 ports. Every `var(--u-…)` referenced by its structural CSS is defined by a registered element.
   - The unresolved-token exception list is **empty** for all 27 components. This is asserted bidirectionally, using the Tranche 1 pattern.
   - **Own-token invariant.** The **ported structural CSS** of each component contains at least one `var(--u-<key>-` reference. The ported structural CSS is the §5.2 items 1 and 2 (ported plus adapted groups). The invariant does not apply to the retained Ultimate-only rules (PX-A4, PX-A5, PX-A6), which are literal-only by design.
3. **C3 — Upstream fidelity, mapping and exactness.**
   - **The fixture** contains the CSS of the **14 unique Aura keys** (14 `@primeuix/styles` modules), generated from the tarball. **All 27 framework style files** (13 Angular + 14 Vue) are validated against that same fixture. Angular and Vue are each checked separately, with their own mapping data (identical for shared keys).
   - **Static exactness** (`packages/themes/test/g3a-upstream-fidelity.test.ts`). For each style file, take the fixture's supported groups and apply the §4.3 mapping and the §5.3 selector rewrites. Then:
     - every supported upstream group is present after mapping, with identical declarations (whitespace-normalised, `dt()` calls compared as written);
     - none of the §5.4 omitted groups is present;
     - PX-A4, PX-A5 and PX-A6 are the **only** retained Ultimate-only rules, with exactly the §5.3 text;
     - **no other rule exists**. No unrelated old hand-written CSS may survive merely because it existed before G3-A;
     - every upstream `@keyframes` used by a ported group is present under its renamed `u-` name, every ported `animation` reference uses the renamed name, and no `p-` keyframe name remains.
   - **Dynamic-class coverage** (`packages/{ng,vue}/src/g3a-aura-styles.spec.ts`). The mapping is verified against **actually emitted classes, not static literal scans**. Each component is mounted with representative values for every dynamic class template, and the test checks that the mapped class appears on the rendered element **and** that the mapped selector exists in the registered CSS. The templates covered are at least:
     - `u-toast-${position}`, all 7 positions;
     - `u-toast-message-${severity}`, all 6 severities;
     - `u-message-${severity}`, 6;
     - `u-tag-${severity}`, 6;
     - `u-inline-message-${severity}`, Vue, 6;
     - `u-timeline-${layout}`, vertical and horizontal.
   - **Data, not convention.** The mapping, the dynamic-variant table, the omitted-group list and the exception list are data in the tests, so they are explicit and testable.
   - **Authoritative coverage evidence.** The pre-correction static class-match counts from the research are not coverage evidence. For Message, Tag, InlineMessage and Toast, the six-severity verification stories (C5) and these dynamic-class checks are the authoritative mechanism.
4. **C4 — DOM unchanged.** Within the affected existing component implementation files:
   - templates/DOM are unchanged;
   - `classes` resolvers are unchanged;
   - props/inputs/emits are unchanged;
   - only the style module `css` and the nine approved registration key literals change.

   This is checked by a scoped diff in verification. C4 does not restrict the separately listed new or changed test, fixture, provenance, story, e2e and documentation files (§7).

5. **C5 — Screenshots (D-G3-7).**
   - **Before:** a Docker-recorded screenshot ("before" state) exists for every G3-A story exercising changed CSS, in all three browsers per framework, before any CSS change. The changed CSS of each component is exercised by at least one story.
   - **Verification-only stories** are added where coverage is missing, and listed in the review record. Initial set:
     - Toast with deterministic sticky messages of all six severities;
     - Message with all six severities;
     - Tag with all six severities;
     - InlineMessage (Vue) with all six severities;
     - Timeline horizontal;
     - Avatar xl;
     - Avatar with a local (data-URI) image replacing the CDN dependency in the screenshot set.
   - **After:** the after-run differences are reviewed at the visual gate before any baseline update. Changes inside the tolerance are recorded.
6. **C6 — Accessibility.** Each G3-A screenshot story also runs the existing axe scan envelope. New violations are reported at the review gate. Only approved ones enter `ACCESSIBILITY_BASELINE.md`.
7. **C7 — Size.** `size:validate` is run after implementation. If any package exceeds 15%, the work stops and is reported; there is no silent override.
8. **C8 — Scope.** The diff touches no G3-B..E file, no AvatarGroup, no React, no `@ultimate/themes` source, no `@ultimate/uix-styled`/`uix-styles`, and no Tranche 1 follow-up.
9. **C9 — Regression.** The unit suites pass for ng, ng-core, vue, vue-core, themes, uix-styled and react; typecheck passes; the Angular SSR harness passes; existing screenshots not listed in C5 are unchanged.

## 9. Verification Approach

- TDD order: C1–C3 tests first (red), then the port.
- Visual: Task-1-style Docker "before" baselines, then the port, then a Docker run, then the review gate.
- The upstream fixture is regenerated from the tarball and checked against `.vendor-extracted` locally, like the Tranche 1 tokens fixture.
- The size gate and a scoped diff are recorded in the review record.

## 10. Evidence/Source References

- G3 research §2, §4–§7 and §11.
- Rule-level analysis performed for this Spec: the §4.3 mapping, §4.4 group counts and §4.5 token resolution, re-derived at Plan time.
- `@primeuix/styles` 2.0.3 `<key>` sources; PrimeNG `toast/style/toaststyle.ts` `inlineStyles`.

## 11. Explicit Out-of-Scope Items

- G3-B..E;
- AvatarGroup;
- Ripple; DataTable/VirtualScroller; TabView/TabMenu; React tokenization;
- the Tranche 1 follow-ups (Ultimate-only token paths, RadioButton tolerance, IconField/InputGroup stories, FloatLabel, FileUpload Button/Message, PERFORMANCE.md baselines, React docs, Angular InputNumber, Ripple);
- the Timeline `align` behaviour gap (recorded as a new follow-up only);
- the pre-existing missing provenance entries outside the 27 G3-A style files;
- unrelated CI failures; any other GAP.

## 12. Open Items for Spec Review

1. **Location of the ported CSS.**
   - (a) **Recommended:** each framework's existing style module holds its own copy. This needs no new exports and is consistent with the "no new public API" ruling and the existing G3 file layout. The Angular and Vue copies are identical for shared keys, and C3 enforces both against the same fixture.
   - (b) New shared `@ultimate/uix-styles/<key>` subpaths, as Tranche 1-era Angular did. That avoids duplication but adds 14 public package exports.
2. **Provenance entries.** Add entries for the 27 G3-A style files (recommended), even though the broader ng/vue provenance gap stays pre-existing.
3. **Verification-only stories (C5).** Approve the initial set. In particular, the Avatar data-URI image story replaces the network-dependent "Image" story in the screenshot set; the existing story is left unchanged.
4. **Accessibility scans (C6).** Add axe scans for the G3-A stories (recommended, because colours change). Any resulting violations come to the review gate.
5. **Timeline `align`.** Record the ignored `align` input as a GAP-064 follow-up, not a G3-A fix.

## 13. Spec Review Decisions (2026-10-04)

1. **Ported CSS location: (a).** Each framework's existing style module holds its own copy. No shared `@ultimate/uix-styles/<key>` subpaths and no new exports. The duplication is intentional for this tranche and is not refactored into a shared package in G3-A.
2. **Provenance: approved.** Entries are added for all 27 G3-A style files (`reference-derived`, Option-B wording). The broader pre-existing provenance gap is not repaired here.
3. **Verification-only stories: approved.**
   - Toast with deterministic sticky messages of all six severities. These must render visible Toast content.
   - Message, Tag and Vue InlineMessage, each with all six severities.
   - Timeline horizontal.
   - Avatar xl.
   - Avatar with a local data-URI image.
   - The existing CDN Avatar Image story stays unchanged; only the deterministic story is part of the screenshot contract.
4. **Accessibility: approved.** The existing axe scan envelope is added to the G3-A screenshot stories. No violation is pre-baselined. New violations come to the mandatory visual/accessibility review gate, and only explicitly approved ones enter `ACCESSIBILITY_BASELINE.md`.
5. **Timeline `align`: follow-up.** Not fixed in G3-A. Recorded as a GAP-064 follow-up: both frameworks accept the input, neither emits an alignment class, so the upstream alignment groups are correctly excluded (FX-A3). No new GAP unless a later architectural review requires independent tracking.
6. **Clarifications applied:**
   - **A:** dynamic-class coverage in C3, using emitted classes, not literal scans.
   - **B:** the C2 own-token invariant applies to the ported structural CSS only.
   - **C:** C3 exactness; no old hand-written CSS survives.
   - **D:** C4 scope.
   - **E:** 14 unique keys in the fixture, 27 style files validated against it.
   - **F:** the six-severity stories and dynamic checks are the authoritative coverage for Message, Tag, InlineMessage and Toast.
7. **Unchanged:**
   - no new Aura modules, no new GAP IDs;
   - no DOM/class restructuring, no React changes;
   - no Ripple, DataTable/VirtualScroller or TabView/TabMenu;
   - no Tranche 1 follow-up implementation, no Timeline `align` implementation;
   - no broader provenance cleanup, no runtime JS additions.

   The five renamed registrations are exactly `overlaybadge`, `progressbar`, `progressspinner`, `metergroup` and Vue `inlinemessage`.

8. **Spec Review final check (correction, evidence-backed).** The draft's "retained rules are exactly PX-A4/PX-A5" would have removed CSS that upstream supplies through component **inline styles** rather than stylesheets. Because Ultimate expresses those declarations in CSS, they must be retained:
   - **Toast root positioning:** `position: fixed`, the per-position offsets, and the stacking `z-index`.
   - **Skeleton root `position: relative`.**

   PX-A4 is restated with its exact retained text, and PX-A6 is added. All upstream `inlineStyles` in the G3-A keys were checked (PrimeNG 21.1.9 and PrimeVue 4.5.5): only toast, skeleton and chip have any. Chip's needs no rule, because Ultimate removes the element from the DOM.

   This correction follows the approved D-G3-8 rule (retain literals with no token role, recorded as parity exceptions). It does not change any architectural decision.

9. **Count correction (found while writing the Plan, by dry-running the Plan's port module against the vendored upstream source).** ProgressBar has **7** upstream rule groups (5 ported + 2 adapted, PX-A1), not 13. The research parser had counted the inner frames of the two `@-webkit-keyframes` blocks as rule groups. §4.4 is corrected. All other §4.4 counts are confirmed. The keyframes themselves are unaffected: the four used keyframes, including the `-webkit-` ones, are still ported and renamed.
10. **Canonical C3 order (Plan Review, 2026-10-04).** The ported, adapted and keyframe groups keep **upstream source order**, so the cascade among same-specificity upstream rules is preserved. The retained PX-A4/A5/A6 rules follow, in §5.3 order. §5.2 is updated accordingly. The draft's grouping into "ported, then adapted, then retained" was not intended as a reordering of upstream rules.

## 14. Proposed Amendment A1 — CI accessibility contract for the G3-A verification stories

**Status: APPROVED (Spec Review, 2026-10-05; decisions in §14.10). IMPLEMENTED and locally VERIFIED; the local verification was accepted on 2026-10-05 (§14.11). Real-CI validation is pending.** It is implemented as §14.8 lists. `scripts/provenance/validate-accessibility-baseline.mjs` is unchanged.

### 14.1 Problem (evidence)

- CI job `track-a-browser-visual-a11y` (matrix `ng`, `react`, `vue`):
  - runs **every** spec in `<fw>-chromium`, `<fw>-firefox` and `<fw>-webkit`, which includes `packages/{ng,vue}/e2e/g3a-aura-styles.spec.ts`;
  - then runs `validate-accessibility-baseline.mjs --check "test-results/accessibility/<fw>/**/*.json"`.
- That check fails on any fingerprint absent from `ACCESSIBILITY_BASELINE.md`.
- The G3-A accessibility tests scan 65 new story IDs (31 ng, 34 vue). None of them overlaps the story IDs scanned by the existing specs (31 ng, 25 vue; checked on the Task 8 Docker envelopes).
- Those new IDs expose 200 pre-existing page-level/DOM rows that predate the port. Task 8 decision (c) excludes them from the global baseline, so the unchanged job would fail for `ng` and `vue`.

### 14.2 Decision (user, 2026-10-04): change what CI scans, not the validator

- **Repository contract (unchanged semantics):** strict `--check` over the established accessibility suite only.
- **G3-A acceptance contract (new, tranche-scoped):** differential validation of the G3-A verification stories.
- `validate-accessibility-baseline.mjs` is not modified. It gains no historical-commit comparison.

### 14.3 Which specs each contract covers

| Contract | Playwright selection | Specs covered |
| -------- | -------------------- | ------------- |
| Strict (existing step, input narrowed) | the existing project flags plus `--grep-invert "G3-A"` | **ng:** aura-token-wiring, auto-focus, badge, button, checkbox, dialog, fluid, menu, paginator, ripple, scroller, table, tooltip. **vue:** aura-token-wiring, button, checkbox, dialog, hidden-accessible, menu, paginator, ripple, scroller, stepper, table, tooltip. **react:** all specs, unaffected (no G3-A spec). |
| G3-A differential (new steps, `ng` and `vue` only) | `packages/<fw>/e2e/g3a-aura-styles.spec.ts` on the same 3 projects | the 31 ng and 34 vue G3-A stories, visual and accessibility |

- Every G3-A test title contains "G3-A" (`<Fw>/<Name> G3-A visual|accessibility`), and no existing test title does.
- This exact selection was exercised in Task 8. The Docker `regression` mode (`--grep-invert "G3-A"`, all 9 Storybook projects) gave strict `--check` OK for ng (261 nodes), vue (217) and react (197).
- Excluding the G3-A tests from the strict run excludes nothing that the strict contract covers today. Before G3-A, those specs did not exist.

### 14.4 How the G3-A differential validation runs

New steps after the existing strict check and the upload of its reports, guarded by `if: matrix.framework != 'react'`:

1. `npx playwright test packages/<fw>/e2e/g3a-aura-styles.spec.ts --project=<fw>-chromium --project=<fw>-firefox --project=<fw>-webkit`
2. `node scripts/provenance/validate-g3a-accessibility.mjs <fw>` (new, tranche-scoped, no write mode).
3. Upload `test-results/accessibility/<fw>/` as `g3a-accessibility-reports-<fw>`.

`validate-g3a-accessibility.mjs` **imports** the existing validator's exported `loadBaseline`, `readEnvelopes` and `BASELINE_PATH`, so fingerprinting is identical by construction. It reads two lists:

- `ACCESSIBILITY_BASELINE.md`, the global baseline. It holds the 9 approved G3-A parity rows.
- `docs/architecture/research/2026-10-04-gap-064-g3a-accessibility-preexisting.md` (new):
  - The 200 pre-existing fingerprints, in the same table format (`| fingerprint | rule | story | note |`), parsed by the exported parser.
  - Derivation: the unique rows observed both in the pre-port run (`bdc0041`) and the post-port run, recorded in the Task 8 review record.
  - The file is evidence of pre-existing debt and is explicitly **not** a baseline. It is read only by the G3-A script.

The script then performs these checks:

| Check | Rule | Outcome on violation |
| ----- | ---- | -------------------- |
| Completeness | Every story ID in the pre-existing list has an envelope for each of chromium, firefox and webkit (93 ng / 102 vue files). Every G3-A story has at least the page-level rows, so the list names all 65 stories. | FAIL |
| Introduced | `envelope fingerprints − ACCESSIBILITY_BASELINE.md − pre-existing list` must be empty. | FAIL, printing each rule, story and target |
| Approved exceptions | The 9 G3-A rows are satisfied through `ACCESSIBILITY_BASELINE.md`, like every other baselined row. | none (accounted) |
| Pre-existing still present | Count by rule. | informational |
| Pre-existing no longer observed | List of rows (debt fixed). | informational; the list may be pruned by a reviewed human edit |

### 14.5 Why a genuinely new G3-A violation cannot be ignored

- Any fingerprint not in the global baseline and not in the frozen pre-existing list fails the step. The step is not `continue-on-error`.
- The completeness check makes a skipped, filtered or crashed scan fail. An empty or partial glob cannot pass vacuously.
- Both lists change only through human-authored, reviewed git diffs. The script has no write, populate or update mode (PD-11 precedent).
- The strict contract for the established suite is unchanged, so G3-A cannot hide a regression there.
- **Known limitation, shared with the strict validator:** fingerprints are `rule:story:target` and carry no contrast ratio. A worsened ratio on an already-listed fingerprint is invisible to both checks. Example: the ProgressBar label row, 3.67 → 2.53, recorded in the Task 8 review record.

### 14.6 Side effects to note

- **Toast:** the new G3-A step also runs the G3-A visual tests. It fails on the 6 held Toast screenshots until U2 is resolved. This is intended, because U2 blocks closeout.
- **Approved rows only used by the G3-A check:** the 9 approved rows stay in `ACCESSIBILITY_BASELINE.md`, as approved. The narrowed strict scan no longer reads them, and the G3-A script does. An unused baseline row never fails the strict check.
- **Clean test-results:** Playwright's `test-results` directory is per run. The script additionally filters envelopes to the G3-A story set, so the result does not depend on whether the earlier strict run's envelopes are still present.
- **Tranche scope:** the pre-existing list and the script are G3-A specific. Later tranches (G3-B onward) decide separately whether to reuse or generalise them.

### 14.7 Alternatives rejected

- **Add the 200 rows to `ACCESSIBILITY_BASELINE.md`:** rejected by the user in Task 8 decision (c).
- **Add a base-ref comparison mode to the validator:** rejected by the user. It broadens a general-purpose validator for a tranche-specific need.
- **Run a live pre-port comparison in CI** (check out `bdc0041`, build, scan): rejected. It doubles the job's install/build/Storybook time and pins CI to a historic commit forever. The frozen pre-existing list is the same evidence, captured once and reviewed.
- **Redirect G3-A envelopes to a separate directory through an env var in the test helper:** not needed. Selecting by test title and filtering by story set separates them without editing test code.

### 14.8 Files this amendment would touch, once approved through Plan Review

| File | Change |
| ---- | ------ |
| `.github/workflows/ci.yml` | add `--grep-invert "G3-A"` to the existing run step; add 3 G3-A steps for ng and vue |
| `scripts/provenance/validate-g3a-accessibility.mjs` | new, read-only |
| `docs/architecture/research/2026-10-04-gap-064-g3a-accessibility-preexisting.md` | new, 200 rows, evidence |
| `scripts/provenance/validate-accessibility-baseline.mjs` | **unchanged** |
| `ACCESSIBILITY_BASELINE.md` | **unchanged** beyond the 9 already-approved rows |

### 14.9 Questions for review

1. Is the location of the pre-existing list right? The proposal uses `docs/architecture/research/` because it is dated evidence (AGENTS.md tier 6). The alternative is next to the script.
2. Is a separate step in the same job acceptable, or should G3-A run as its own CI job?
3. Should the step print the pre-existing rows that are no longer observed, but never fail on them? The proposal says yes.

### 14.10 Spec Review decisions for A1 (2026-10-05)

A1 is **approved**. The review questions in §14.9 are resolved as follows.

1. **Pre-existing list location:** `docs/architecture/research/2026-10-04-gap-064-g3a-accessibility-preexisting.md` stays where it is. It is evidence of historical debt, not an accessibility baseline and not CI configuration, so it is not moved next to the validator.
2. **CI placement:** the G3-A differential validation runs as additional steps inside the existing `track-a-browser-visual-a11y` job. There is no separate job and no duplicated browser/environment setup.
3. **Strict contract:** `validate-accessibility-baseline.mjs --check` is unchanged. The existing strict scan uses exactly the proven selection `--grep-invert "G3-A"`.
4. **Differential contract** (`validate-g3a-accessibility.mjs`, Angular and Vue, read-only). How each case is treated:

   | Case | Result |
   | ---- | ------ |
   | missing report | **FAIL** |
   | violation in neither `ACCESSIBILITY_BASELINE.md` nor the pre-existing list | **FAIL** |
   | violation in `ACCESSIBILITY_BASELINE.md` | PASS |
   | violation documented as pre-existing | PASS |
   | pre-existing entry no longer observed | **STALE**, informational, never fails |

   The script never modifies either list.
5. **Coverage invariant:** all 65 G3-A stories in all three browsers, so ng 31 × 3 = 93 reports, vue 34 × 3 = 102, 195 in total. A missing or skipped report can never produce a pass.
6. **Approved exceptions:** the 9 G3-A Aura parity rows live only in `ACCESSIBILITY_BASELINE.md` and are not duplicated in the pre-existing file.
7. **Known limitation kept:** the identity contract stays `rule + story + target`. Detecting contrast-ratio changes is out of scope.
8. **CI artifacts:** the G3-A accessibility reports and the differential-validator output are uploaded.
9. **Toast:** the 6 held Toast screenshots keep failing the G3-A visual gate until U2 is resolved. That failure is neither weakened nor bypassed.


### 14.11 A1 verification (2026-10-05)

- **Evidence regenerated.** The Task 8 envelopes in `/tmp` had been deleted, so both trees were re-run in Docker:
  - pre-port `bdc0041`: 390 passed, 228 unique rows;
  - Task 8 accepted state `f6b9627`: 384 passed and 6 failed (the held Toast tests), 200 rows.

  The regenerated set reproduces the Task 8 record exactly: 0 introduced, 28 removed, and the same counts per rule.
- **Script tests:** `node --test scripts/provenance/validate-g3a-accessibility.test.mjs` passes 8/8 (missing report, introduced violation, stale, story-table size, story-id mismatch, framework guard, read-only). `pnpm run test:scripts` passes 126/126.
- **Detection check:** run against the pre-port envelopes, the script FAILS on exactly the 28 rows in neither list (13 ng, 15 vue unique fingerprints). Run against the post-port envelopes, it passes: ng 93/93, vue 102/102, 0 introduced, 0 stale.
- **Workflow lint:** `actionlint .github/workflows/ci.yml` is clean.
- **End-to-end simulation** of the edited `track-a-browser-visual-a11y` steps, in Docker `mcr.microsoft.com/playwright:v1.63.0-jammy`, on the full working state (tree `cc9ce06`; `runner: .superpowers/sdd/…/docker/run.sh ci <fw>`):

| Framework | Strict run (`--grep-invert "G3-A"`) | Strict `--check` | G3-A run | G3-A differential check |
| --------- | ----------------------------------- | ---------------- | -------- | ----------------------- |
| ng        | 309 passed                          | OK, 261 nodes    | 183 passed, **3 failed** (Toast AllSeverities × 3 browsers) | OK, 93/93 reports, 0 introduced, 0 stale |
| vue       | 282 passed                          | OK, 219 nodes    | 201 passed, **3 failed** (Toast AllSeverities × 3 browsers) | OK, 102/102 reports, 0 introduced, 0 stale |
| react     | 216 passed                          | OK, 198 nodes    | step skipped (no G3-A spec) | step skipped |

- **Expected job state:** the ng and vue jobs stay red only on the 6 held Toast screenshots (decision 9). Everything else is green, including the strict contract. The validator output file `test-results/g3a-accessibility/<fw>-validation.txt` is produced, ready for the artifact upload.
- **What this does not show:** an actual GitHub Actions run (`always()`/`!cancelled()` semantics, artifact upload) cannot be exercised locally. It is verified on the first CI run after push.
