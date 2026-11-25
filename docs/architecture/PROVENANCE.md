# Provenance Record

This file records the exact origin of every Prime-derived source area incorporated into Ultimate Platform. Phase 0 populates baseline-level entries only; component-level entries are added during Phase 1+ migration.

Field template (per Blueprint §6/§8):

```text
Source repository       Source package         Source version
Source commit SHA       Source path             Original license
Copyright holder         Third-party notices     Ultimate destination
Modification status      Modification description  Date incorporated
```

## Manifest classification (ADR-064)

The file-level manifests in `docs/architecture/provenance/*.json` record each production file's lineage. The authoritative contract is [ADR-064](DECISIONS.md#adr-064--provenance-source-class-copy-reference-original-is-evidence-based-modificationstatus-is-a-descriptive-sub-label).

- **Source class (evidence-based).** Each new entry's class is decided by a side-by-side comparison with the checksum-verified pinned upstream archive, and recorded with that evidence in the batch evidence record:
  - **COPY** — upstream wording, statements or structure are retained.
  - **REFERENCE** — only interface facts are shared with a compared upstream counterpart.
  - **ORIGINAL** — no upstream counterpart exists.
- **Ambiguity.** Genuine uncertainty about retained upstream expression is classified COPY, with the compared upstream file cited and the uncertainty stated. Standard APIs, public names or equivalent behavior alone do not establish copying.
- **Theme screening ([ADR-064 clarification](DECISIONS.md#clarification-2026-10-16-theme-comparisons-are-screening-evidence)).** Comparisons with out-of-boundary sources such as PrimeReact theme CSS are screening evidence. A generic value or a published palette or scale constant alone does not establish retained theme expression. A file is held for an ADR-065 decision only on distinctive evidence absent from in-boundary sources: an isolated distinctive value, or three or more retained theme-only declarations that occur together only within one theme family. This applies to new entries only.
- **`modificationStatus` (descriptive sub-label).** New entries use only:

  | Source class | `modificationStatus`                                                                                                       | `originalPath`                                            |
  | ------------ | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
  | COPY         | `unmodified` (identical), `import-path-adapted` (only imports rewritten), `adapted` (any other retained-expression change) | the upstream file                                         |
  | REFERENCE    | `reimplemented-with-reference`                                                                                             | the compared upstream file                                |
  | ORIGINAL     | `authored`                                                                                                                 | `"n/a"` (any Ultimate source is named in the description) |

- **Legacy-only values.** `reference-derived`, `rebranded`, `reconstructed`, `transcribed`, `ultimate-authored` and `re-export` remain on existing entries only. Historical enumerations (`modified`, `refactored`) are not permitted.
- **Existing entries.** These are not reclassified. Their inconsistencies are tracked as GAP-132.

---

## PrimeNG

- **Source repository:** https://github.com/primefaces/primeng
- **Source package:** `primeng`
- **Source version:** `21.1.9`
- **Source commit SHA:** `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`
- **Source path:** `packages/primeng` (monorepo subdirectory)
- **Original license:** MIT (community/non-`-lts` section of the dual-license `LICENSE.md`)
- **Copyright holder:** PrimeTek, 2016-2026
- **Third-party notices:** none found upstream (no root-level `NOTICE` file at this tag)
- **Ultimate destination:** `packages/ng`, `packages/ng-core` (Phase 2)
- **Modification status:** incorporated (Phase 2) — foundation tier reimplemented with PrimeNG as design reference, not copied verbatim (Option B); Button/Checkbox/Dialog/Menu/Tooltip and their direct primitive dependencies (Ripple/AutoFocus/Fluid/Badge/Bind) adapted with full Ultimate namespace rename (selectors, class names, CSS classes). Scroller (`packages/primeng/src/scroller/scroller.ts`) also adapted with full Ultimate namespace rename — mixed provenance: direct per-framework adaptation of real upstream Scroller measurement/windowing/lazy-load behavior, plus consumption of the `@ultimate/uix-data` shared `calculateNumItemsInViewport`/`calculateLast` primitives (see that package's own entry below). Paginator (`packages/primeng/src/paginator/paginator.ts`) also adapted with full Ultimate namespace rename — mixed provenance: direct per-framework adaptation of real upstream Paginator state-ownership/page-link-boundary behavior, plus consumption of the `@ultimate/uix-data` shared `getPageCount` primitive (see that package's own entry below), plus the directly-ported `packages/uix-styles/src/paginator/index.ts` style-token file (see `@primeuix/styles` entry below). Remaining ~112 source areas classified but not incorporated — see `docs/architecture/COMPONENT_INVENTORY.md`.
- **Modification description:** see file-level manifests at `docs/architecture/provenance/ng-core.json` and `docs/architecture/provenance/ng.json` for per-file status.
- **Date incorporated:** 2026-08-29

## PrimeVue

- **Source repository:** https://github.com/primefaces/primevue
- **Source package:** `primevue`
- **Source version:** `4.5.5`
- **Source commit SHA:** `66dde6788220fc9e6822342919d1ceb0e3460ece`
- **Source path:** `packages/primevue`, `packages/core` (dual-root monorepo subdirectories — verified during Phase 4's Real-Source Verification Gate; unlike PrimeReact's single `components/lib/` root, PrimeVue's own repo splits foundation-tier source from components/directives)
- **Original license:** MIT
- **Copyright holder:** PrimeTek, 2018-2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/vue`, `packages/vue-core` (Phase 4)
- **Modification status:** incorporated (Phase 4) — foundation tier reimplemented with PrimeVue as design reference, not copied verbatim (Option B, same posture as ADR-018/024); Button/Checkbox/Dialog/Menu/Tooltip and their direct primitive dependencies (Ripple, Portal, FocusTrap, BaseComponent/BaseDirective/BaseEditableHolder/BaseInput) adapted with full Ultimate namespace rename. Scroller (`packages/primevue/src/virtualscroller/VirtualScroller.vue`) also reimplemented-with-reference with full Ultimate namespace rename — mixed provenance: direct per-framework adaptation of real upstream VirtualScroller measurement/windowing/lazy-load behavior (including its genuine, verified `ResizeObserver` usage), plus consumption of the `@ultimate/uix-data` shared `calculateNumItemsInViewport`/`calculateLast` primitives (see that package's own entry below). Paginator (`packages/primevue/src/paginator/Paginator.vue`) also adapted with full Ultimate namespace rename — mixed provenance: direct per-framework adaptation of real upstream Paginator's internal-with-full-v-model state-ownership behavior, plus consumption of the `@ultimate/uix-data` shared `getPageCount` primitive (see that package's own entry below), plus the directly-ported `packages/uix-styles/src/paginator/index.ts` style-token file (see `@primeuix/styles` entry below). Remaining ~145 source areas classified but not incorporated — see `docs/architecture/COMPONENT_INVENTORY.md` if a Vue-native inventory is added in a later phase (not committed this phase, spec §30).
- **Modification description:** see file-level manifests at `docs/architecture/provenance/vue-core.json` and `docs/architecture/provenance/vue.json` for per-file status.
- **Date incorporated:** 2026-09-01

## PrimeReact

- **Source repository:** https://github.com/primefaces/primereact
- **Source package:** `primereact`
- **Source version:** `10.9.9`
- **Source commit SHA:** `d0f574e39122668292fc7a740f081bae1b93b1e9`
- **Source path:** `components/lib` (library source only — repo root is the Next.js showcase app and must never be treated as library source)
- **Original license:** MIT
- **Copyright holder:** PrimeTek, 2016-2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/react`, `packages/react-core` (Phase 3)
- **Modification status:** incorporated (Phase 3) — foundation tier reimplemented with PrimeReact as design reference, not copied verbatim (Option B, same posture as Angular's ADR-018); Button/Checkbox/Dialog/Menu/Tooltip adapted with full Ultimate namespace rename (component names, CSS classes). Scroller (`components/lib/virtualscroller/VirtualScroller.js`) also adapted with full Ultimate namespace rename — mixed provenance: direct per-framework adaptation of real upstream VirtualScroller measurement/windowing/lazy-load behavior, plus consumption of the `@ultimate/uix-data` shared `calculateNumItemsInViewport`/`calculateLast` primitives (see that package's own entry below). Paginator (`components/lib/paginator/Paginator.js`) also adapted with full Ultimate namespace rename — mixed provenance: direct per-framework adaptation of real upstream Paginator's fully-controlled, no-uncontrolled-fallback state-ownership behavior, plus consumption of the `@ultimate/uix-data` shared `getPageCount` primitive (see that package's own entry below), plus the directly-ported `packages/uix-styles/src/paginator/index.ts` style-token file (see `@primeuix/styles` entry below). Remaining ~111 source areas not classified this phase — see spec §30 for why a full inventory was deliberately not pre-committed.
- **Modification description:** see file-level manifests at `docs/architecture/provenance/react-core.json` and `docs/architecture/provenance/react.json` for per-file status.
- **Date incorporated:** 2026-08-31
- **Architectural reference only (not incorporated):** PrimeReact `11.1.0` — commercial "PrimeUI License", not MIT. Its `@primereact/{core,headless}` package-split pattern is useful prior art for Ultimate's React package boundaries, but no source is incorporated from it.

## @primeuix/utils

- **Source repository:** https://github.com/primefaces/primeuix
- **Source package:** `@primeuix/utils`
- **Source version:** `0.7.2`
- **Source commit SHA:** none — confirmed provenance gap (repo's `main` branch history stops at `utils@0.6.4`; npm registry `gitHead` is `null` for this release). Pinned instead by npm tarball integrity hash.
- **Tarball shasum:** `0ded7f74bddf191f0e16aea34b593a7fcffa94b5`
- **Tarball integrity:** `sha512-pmEbSfP0Phf9W9RweiM66zXnkn73ZeKyYINElbX3uZ2+stzzaba2svLAl3B1pHVcRw5t43O0VciaGe4ye2EXKw==`
- **Source path:** `packages/utils` (monorepo subdirectory)
- **Original license:** MIT (verified from `LICENSE` file inside the published npm tarball)
- **Copyright holder:** PrimeTek, 2026
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/uix-utils` (Phase 1)
- **Modification status:** incorporated (Phase 1) — cross-package `@primeuix/*` import specifiers adapted to `@ultimate/uix-*` via `scripts/provenance/adapt-imports.mjs`; all other source retained verbatim. File-level detail: `docs/architecture/provenance/uix-utils.json`.
- **Modification description:** see file-level manifest at `docs/architecture/provenance/uix-utils.json` for per-file status.
- **Date incorporated:** 2026-08-29

## @primeuix/styled

- **Source repository:** https://github.com/primefaces/primeuix
- **Source package:** `@primeuix/styled`
- **Source version:** `0.7.4`
- **Source commit SHA:** none — confirmed provenance gap (same cause as `@primeuix/utils` above). Pinned instead by npm tarball integrity hash.
- **Tarball shasum:** `d2108a7fad297dea60d549b2c10ed744dc0cbc0e`
- **Tarball integrity:** `sha512-QSO/NpOQg8e9BONWRBx9y8VGMCMYz0J/uKfNJEya/RGEu7ARx0oYW0ugI1N3/KB1AAvyGxzKBzGImbwg0KUiOQ==`
- **Source path:** `packages/styled` (monorepo subdirectory)
- **Original license:** MIT (verified from `LICENSE` file inside the published npm tarball)
- **Copyright holder:** PrimeTek, 2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/uix-styled` (Phase 1)
- **Modification status:** incorporated (Phase 1) — cross-package `@primeuix/*` import specifiers adapted to `@ultimate/uix-*` via `scripts/provenance/adapt-imports.mjs`; `src/stylesheet/index.ts` later had one obsolete ESLint directive removed during GAP-092 lint repair. Other source changes remain described in the file-level manifest at `docs/architecture/provenance/uix-styled.json`.
- **Modification description:** see file-level manifest at `docs/architecture/provenance/uix-styled.json` for per-file status.
- **Date incorporated:** 2026-08-29

## @primeuix/styles

- **Source repository:** https://github.com/primefaces/primeuix
- **Source package:** `@primeuix/styles`
- **Source version:** `2.0.3`
- **Source commit SHA:** none — confirmed provenance gap (same cause as above). Pinned instead by npm tarball integrity hash.
- **Tarball shasum:** `e42d14c138fe092683228d65a3f6de17de70d6a0`
- **Tarball integrity:** `sha512-2ykAB6BaHzR/6TwF8ShpJTsZrid6cVIEBVlookSdvOdmlWuevGu5vWOScgIwqWwlZcvkFYAGR/SUV3OHCTBMdw==`
- **Source path:** `packages/styles` (monorepo subdirectory)
- **Original license:** MIT (verified from `LICENSE` file inside the published npm tarball)
- **Copyright holder:** PrimeTek, 2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/uix-styles` (Phase 1)
- **Modification status:** incorporated (Phase 1) — `base` module only; ~90 per-component style modules remain classified LATER PHASE per the Phase 1 spec, deferred to each component's own migration phase (2/3/4). `virtualscroller` (Scroller's style-token module) incorporated directly-ported, consumed by all three frameworks' own `packages/{ng,react,vue}/src/scroller/scroller-style.ts` modules. `paginator` (Paginator's style-token module) also incorporated directly-ported, consumed by all three frameworks' own `packages/{ng,react,vue}/src/paginator/paginator-style.ts` modules. No import adaptation needed (zero dependencies). Per-component structural CSS was also ported (reference-derived, Option B, not copied verbatim) into each framework's own style modules: for GAP-064 G3-A, 14 keys (avatar, chip, tag, skeleton, overlaybadge, knob, progressbar, progressspinner, metergroup, timeline, terminal, message, inlinemessage, toast) across 27 ng/vue style files; for GAP-064 G3-B, 10 keys (accordion, blockui, card, divider, fieldset, inplace, panel, scrollpanel, splitter, toolbar) across 20 ng/vue style files; for GAP-064 G3-C1, 5 keys (breadcrumb, dock, steps, stepper, tabs) across 10 ng/vue style files. GAP-064 G3-C2 (Menus) style modules are also reference-derived from this package. GAP-064 G3-E E-1 (Image, ImageCompare) style modules are also reference-derived from this package: 2 keys (image, imagecompare) across 4 ng/vue style files. The file-level entries for these ports are in `docs/architecture/provenance/{ng,vue}.json`. G3-E E-2 (Carousel, Galleria) style modules are also reference-derived from this package: 2 keys (carousel, galleria) across 4 ng/vue style files, with file-level entries in `docs/architecture/provenance/{ng,vue}.json`. G3-E E-3 (OrderList, PickList) style modules are also reference-derived from this package: 2 keys (orderlist, picklist) across 4 ng/vue style files, with file-level entries in `docs/architecture/provenance/{ng,vue}.json`. G3-E E-4 (DataView, OrganizationChart) style modules are also reference-derived from this package: 2 keys (dataview in ng/vue, organizationchart in vue) across 3 style files, with file-level entries in `docs/architecture/provenance/{ng,vue}.json`. File-level detail: `docs/architecture/provenance/uix-styles.json`. G3-E E-1 Angular ImageCompare has a reference-derived style module with an Ultimate-authored retained-span adaptation (E1-V2 C1); file-level provenance is in `provenance/ng.json`.
- **Modification description:** see file-level manifest at `docs/architecture/provenance/uix-styles.json` for per-file status.
- **Date incorporated:** 2026-08-29

## @primeuix/motion

- **Source repository:** https://github.com/primefaces/primeuix
- **Source package:** `@primeuix/motion`
- **Source version:** `0.0.10`
- **Source commit SHA:** none — confirmed provenance gap (same cause as above). Pinned instead by npm tarball integrity hash.
- **Tarball shasum:** `9af4238226042d80518dd343c6481d03582e374a`
- **Tarball integrity:** `sha512-PsZwOPq79Scp7/ionshRcQ5xKVf9+zuLcyY5mf6onK8chHT5C9JGphmcIZ4CzcqxuGEpsm8AIbTGy+zS3RtzLA==`
- **Source path:** `packages/motion` (monorepo subdirectory)
- **Original license:** MIT (verified from `LICENSE` file inside the published npm tarball)
- **Copyright holder:** PrimeTek, 2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/uix-motion` (Phase 1)
- **Modification status:** incorporated (Phase 1) — cross-package `@primeuix/*` import specifiers adapted to `@ultimate/uix-*` via `scripts/provenance/adapt-imports.mjs`; all other source retained verbatim. File-level detail: `docs/architecture/provenance/uix-motion.json`.
- **Modification description:** see file-level manifest at `docs/architecture/provenance/uix-motion.json` for per-file status.
- **Date incorporated:** 2026-08-29

## @primeuix/themes

- **Source repository:** https://github.com/primefaces/primeuix
- **Source package:** `@primeuix/themes`
- **Source version:** `2.0.3`
- **Source commit SHA:** none — confirmed provenance gap (same cause as the other `@primeuix/*` entries above). Pinned instead by npm tarball integrity hash.
- **Tarball shasum:** `c3919d49e818b3bbac611ab8d89a52d4ffed6815`
- **Tarball integrity:** `sha512-3fS1883mtCWhgUgNf/feiaaDSOND4EBIOu9tZnzJlJ8QtYyL6eFLcA6V3ymCWqLVXQ1+lTVEZv1gl47FIdXReg==`
- **Source path:** `packages/themes` (monorepo subdirectory)
- **Original license:** MIT (verified from `LICENSE` file inside the published npm tarball)
- **Copyright holder:** PrimeTek, 2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/themes` (Phase 5)
- **Modification status:** incorporated (Phase 5) — Aura preset token values used as reference (Option B — reference, not verbatim), reimplemented under Ultimate naming/prefix for the five-component proof set (Button, Checkbox, Dialog, Menu, Tooltip) plus the base primitive/semantic tier. Remaining ~88 component preset modules and the Lara/Nora/Material preset families are not incorporated — out of Phase 5 scope.
- **Modification description:** see file-level manifest at `docs/architecture/provenance/themes.json` for per-file status.
- **Date incorporated:** 2026-09-01

## @ultimate/uix-data

- **Source repository:** none — no single upstream package. Mixed provenance: one function re-exported from an existing Ultimate package, five modules authored by Ultimate and verified against real pinned Prime source.
- **Source package:** n/a
- **Source version:** n/a
- **Ultimate destination:** `packages/uix-data`
- **Modification status:** incorporated — `equals` is re-exported unchanged from `@ultimate/uix-utils/object` (see that package's own `PROVENANCE.md` entry and `docs/architecture/provenance/uix-utils.json` for its provenance). The remaining five modules (`SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata`, `PaginationState`/`getPageCount`, `calculateNumItemsInViewport`/`calculateLast`) are Ultimate-authored, each verified against real pinned PrimeNG 21.1.9, PrimeReact 10.9.9, and PrimeVue 4.5.5 source per the approved architecture research. File-level verification basis: `docs/architecture/provenance/uix-data.json`.
- **Modification description:** see file-level manifest at `docs/architecture/provenance/uix-data.json` for the specific real-source evidence backing each module.
- **Date incorporated:** 2026-09-01

---

**Excluded from Phase 0 core (not runtime dependencies of any confirmed baseline):** `@primeuix/forms`, `@primeuix/mcp`. See `docs/architecture/DEPENDENCIES.md` for exclusion rationale.

**Upstream provenance gap note:** the `primefaces/primeuix` GitHub repository has exactly one branch (`main`) and 17 lightweight tags, none reaching past bare version `0.6.0`. All four `@primeuix/*` packages above were published to npm with `gitHead: null`. This is PrimeTek's own upstream gap (repo archived mid-history), not a verification failure — see spec Finding 3 for full detail.

### Phase C Batch 3 source disclosure

OrderList, PickList, and DataView reference PrimeNG 21.1.9, PrimeReact 10.9.9, and PrimeVue 4.5.5. OrganizationChart references only PrimeReact 10.9.9 and PrimeVue 4.5.5; Angular is excluded by DECISION-D. The implementations are Ultimate-owned, framework-native components without Prime runtime dependencies. Per-file records are in provenance/ng.json, provenance/react.json, and provenance/vue.json.

Angular OrderList/PickList add the MIT-licensed @angular/cdk dependency solely for optional drag/drop. React uses native HTML5 events; Vue has no drag/drop. The exact CDK version and license verification are recorded in Task 0's commit and pnpm-lock.yaml.

### Prime-parity audit source disclosure

The Prime-parity Implementation Plans (GAP-041–GAP-070, `feature/prime-parity-audit-gaps`, 2026-09-27..2026-10-01) changed existing `ng`, `react` and `vue` components against the same pinned upstream baselines recorded above: PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5, `@primeuix/styles` 2.0.3 and `@primeuix/themes` 2.0.3. No new upstream package or version was introduced, and no Prime runtime dependency was added. GAP-064 ported 71 Aura per-component preset modules from `@primeuix/themes` 2.0.3, each recorded in provenance/themes.json. GAP-063 added `packages/vue/src/stepper/StepperSeparator.vue`, recorded in provenance/vue.json.

### GAP-124 icon-spin source disclosure

The shared `.u-icon-spin` rule in `packages/uix-styled/src/stylesheet/icon-spin.ts` is adapted from PrimeNG 21.1.9 `icons/baseicon/style/baseiconstyle.ts` (identical in PrimeVue 4.5.5 `@primevue/icons`), renamed to the `u-` prefix. The reduced-motion stop and the `registerIconSpin()` helper are Ultimate-authored. Per-file records are in `docs/architecture/provenance/uix-styled.json`.

### GAP-098 box-model source disclosure

The per-component `border-box` rule built by `packages/uix-styled/src/stylesheet/box-model.ts` is reference-derived from PrimeReact 10.9.9 `components/lib/componentbase/ComponentBase.js` (`.p-component, .p-component * { box-sizing: border-box }`) and `@primeuix/styles` 2.0.3 `base` (`*, ::before, ::after { box-sizing: border-box }`). Ultimate's form is authored (ADR-063): one rule per component, scoped to that component's own root, overlay, panel, mask and list classes (and `*Root`/`*Overlay`/`*Mask` keys), with `:where()` zero specificity and no page-wide selector; the Angular, Vue and React cores register it from their existing style-registration points. Per-file records are in `docs/architecture/provenance/uix-styled.json`.

### A6 shared base source disclosure

`packages/uix-styles/src/base/index.ts` is `@primeuix/styles` 2.0.3 `base` renamed to the `u-` prefix (ADR-081). The page-wide `box-sizing` rule and the PrimeIcons `.pi` rule are not ported, and the `--px-mask-background` wrapper is dropped. `registerSharedBase()` in `packages/uix-styled/src/stylesheet/base.ts` is Ultimate-authored; the Angular, React and Vue cores call it once, next to `registerThemeVariables`. Per-file records are in `docs/architecture/provenance/uix-styles.json` and `docs/architecture/provenance/uix-styled.json`.

### F4 preset global style source disclosure

`packages/themes/src/presets/aura/css.ts` is the Aura preset's top-level `css` string, copied from `@primeuix/themes` 2.0.3 `aura/css` (source class COPY, ADR-064): one selector list and one `transition: none` declaration block. Ultimate renames the class names to its own (`u-` prefix; `cascade-select`, `multi-select` and `table` for upstream's `cascadeselect`, `multiselect` and `datatable`) and leaves out the selectors for Tree, TreeTable and PanelMenu item content, which have no Ultimate class yet. `registerThemeVariables()` in `packages/uix-styled/src/stylesheet/theme-variables.ts` registers that string as the global style (`u-global-style`), after the common variables, following PrimeNG 21.1.9 `basecomponent.ts:355-360` and PrimeVue 4.5.5 `BaseComponent.vue:170-175`; the Angular, React and Vue cores call it from their existing registration points. Per-file records are in `docs/architecture/provenance/themes.json` and `docs/architecture/provenance/uix-styled.json`.

### GAP-132 batch 2 correction source disclosure

The GAP-132 correction of GAP-094 batch 2 (2026-10-16) recorded two kinds of source lineage beyond the per-package entries above.

- **PrimeNG material in the React and Vue packages.** `packages/react/src/chip/chip.tsx` and `packages/vue/src/chip/Chip.vue` retain a statement from PrimeNG 21.1.9 `packages/primeng/src/chip/chip.ts` (source class COPY under ADR-064). `packages/react/THIRD-PARTY-NOTICES.md` and `packages/vue/THIRD-PARTY-NOTICES.md` therefore add the PrimeNG Community Versions MIT notice, excluding the LTS section.
- **PrimeReact theme CSS.** `packages/react/src/chip/chip-style.ts` and `packages/react/src/tag/tag-style.ts` retain declaration values from PrimeReact 10.9.9 theme CSS: `public/themes/saga-blue/theme.css` and `public/themes/tailwind-light/theme.css`. The `primereact` package distributes these as `resources/themes`.
- **Limited exception (ADR-065).** That theme source lies outside the `components/lib` source path recorded in the PrimeReact entry above. [ADR-065](DECISIONS.md#adr-065--limited-exception-two-pre-existing-react-stylesheets-retain-primereact-theme-css-values-outside-componentslib) records it as an explicitly limited exception for these two pre-existing Phase C Batch 1 files only. The PrimeReact source boundary stays `components/lib`, and theme CSS is not authorized as a source for any other file or future work.
- **Legal review.** Whether any further notice is required is a legal question for company-policy review (Blueprint §8).

### Storybook docs tooling disclosure

Storybook docs tooling and generated API pages from Ultimate metadata; no Prime-derived source incorporated. `@storybook/addon-docs` 10.6.0 is registered in `packages/{ng,react,vue}/.storybook/main.ts`, and each `packages/{ng,react,vue}/src/<component>/<component>.api.mdx` page is generated by `packages/component-metadata/scripts/generate-api-docs.mjs` from the `@ultimate/component-metadata` records.

### W1 React Toolbar style source disclosure

The Workstream 1 pilot (ADR-067) rewrote `packages/react/src/toolbar/toolbar-style.ts` so the React Toolbar consumes Aura `toolbar.*` tokens through `dt()`. Its structural rules (flex layout, `padding`, `background`, `border`, `color`, `border-radius` and `gap` driven by `dt('toolbar.*')`, and the `start`/`center`/`end` slot rules) are the same declarations as `packages/vue/src/toolbar/toolbar-style.ts`, which records them as the applicable `@primeuix/styles` 2.0.3 toolbar structural CSS. The earlier literal fallbacks (`#f9fafb`, `#e5e7eb`, `6px`) are removed, and no PrimeReact theme CSS is added. The per-file source classification for this file is recorded in the W1 manifest-only batch (evidence): COPY from `ToolbarBase.js` and `@primeuix/styles@2.0.3` toolbar (ADR-064).

### W2 menu behaviour fixes source disclosure

Workstream 1 wave W2 fixed three menu defects against the pinned upstream baselines recorded above (PrimeNG 21.1.9, PrimeVue 4.5.5). No new upstream package or version was introduced, and no Prime runtime dependency was added.

- **GAP-086, ContextMenu keyboard navigation.** `packages/ng/src/context-menu/context-menu.ts` and `packages/vue/src/context-menu/ContextMenu.vue` adapt the keyboard model of PrimeNG 21.1.9 `contextmenu/contextmenu.ts` and PrimeVue 4.5.5 `contextmenu/ContextMenu.vue`: opening focuses the list, `aria-activedescendant` names the focused item, and `onKeyDown`'s ArrowDown/ArrowUp (no wrap, skipping separators and disabled items), Home/End, Enter/Space (clicking the item link) and Tab (close) handlers are reduced to Ultimate's flat item list. Submenu keys and type-ahead search are not ported. The code is Ultimate-authored.
- **GAP-085, disabled MegaMenu column items.** `packages/ng/src/mega-menu/mega-menu-column.ts` and `packages/vue/src/mega-menu/MegaMenuColumnGroup.vue` emit the existing `u-megamenu-item-disabled` class on disabled column items, as PrimeNG 21.1.9 and PrimeVue 4.5.5 `MegaMenuSub` emit their disabled class.
- **GAP-084, Vue open state for plain model arrays.** `packages/vue/src/tiered-menu/TieredMenuSub.vue`, `packages/vue/src/menubar/MenubarSub.vue` and `packages/vue/src/mega-menu/MegaMenu.vue` compare the open item with `toRaw`. This is an Ultimate-authored correction; it incorporates no new Prime-derived source.

### A1 theme-change propagation source disclosure

Ticket #171 (spec #167) makes already-mounted components follow `Theme.setTheme`, `setPreset` and `setOptions`. `packages/uix-styled/src/stylesheet/index.ts` keeps its upstream shape and replaces the empty `@todo` `update()` (present in the pinned `@primeuix/styled` 0.7.4 `src/stylesheet/index.ts`) with an in-place rewrite plus an `updateStyleElement` hook. `packages/uix-styled/src/stylesheet/theme-variables.ts` subscribes each sheet to `theme:change` and rewrites its variable blocks and structural CSS; it is reference-derived from PrimeVue 4.5.5 `BaseComponent.vue` (`_themeChangeListener`, `_load`) and PrimeNG 21.1.9 `basecomponent.ts` (`_themeChangeListener`), which share only the event name and the behavior of reloading the variables. The per-sheet `WeakMap`, the `WeakRef` subscription, `registerComponentCss` and the `updateStyleElement` overrides in `ng-core`, `react-core` and `vue-core` are Ultimate-authored; PrimeReact 10.9.9 `useStyle.js` `update()` is the only upstream counterpart for the one-line `textContent` write. Per-file records are in `docs/architecture/provenance/uix-styled.json`, `ng-core.json`, `react-core.json` and `vue-core.json`.

### F7 registration-key normalization source disclosure

Ticket #174 (spec #167) makes React's kebab-case registration names (`input-text`, `date-picker`, `confirm-dialog`) find their flat Aura keys. `packages/uix-styled/src/stylesheet/theme-variables.ts` now reads a component's preset block under the registration name with its hyphens removed, in one private helper that both the first registration and the `theme:change` rewrite use. The block stays registered under the name it was given. This is Ultimate-authored and has no upstream counterpart: PrimeNG 21.1.9 and PrimeVue 4.5.5 components register under the flat Aura key itself (ADR-051). No upstream code or wording is incorporated and no new upstream package or version was introduced. The per-file record is in `docs/architecture/provenance/uix-styled.json`; the class stays REFERENCE.

### A5 per-instance unstyled and dt source disclosure

Ticket #175 (spec #167, ADR-085) builds per-instance `unstyled` and `dt` in `ng-core`, `react-core` and `vue-core`. The behavior is reference-derived from the pinned baselines, read from the vendor archives and never imported (ADR-004): PrimeNG 21.1.9 `basecomponent.ts` (`$unstyled`, scoped theme loading, `cx`), PrimeVue 4.5.5 `BaseComponent.vue` (`isUnstyled`, scoped theme loading, the `dt` watcher and lifecycle hooks) and PrimeReact 10.9.9 `useHandleStyle.js` and `ComponentBase.js` (`isUnstyled`, base versus component style loading). The following are Ultimate-authored: `packages/uix-styled/src/stylesheet/scoped-theme.ts` (`createScopedTheme`, which reuses the in-package `presetKey` and the `theme:change` event of A1 and removes the `<style>` element on dispose), the Vue `WeakMap` per-instance state and `uuid("pc")` selector, the React `useEffect` registration keyed on `unstyled`, and the Angular `registerStyles` split and `DestroyRef` disposal. React `dt` has no counterpart because PrimeReact 10.9.9 has no per-instance `dt` API. No upstream code or wording is incorporated verbatim and no new upstream package or version was introduced. Per-file records are in `docs/architecture/provenance/uix-styled.json`, `ng-core.json`, `react-core.json`, `react.json` and `vue-core.json`; `scoped-theme.ts` is REFERENCE.

### A0 shared PassThrough source disclosure

Ticket #170 (spec #167, ADR-077, ADR-079, ADR-080) builds one instance-level `pt`/`ptOptions` mechanism per framework against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004); the sources were read from the checksum-verified archives (ADR-064).

- **`passthrough.ts` in `ng-core`, `react-core` and `vue-core` (source class COPY, sub-label `adapted`).** Each file keeps the statements and control flow of the oracle's pass-through resolver: PrimeNG `basecomponent.ts` `_getPTValue`, PrimeReact `ComponentBase.js` `getPTValue`, PrimeVue `BaseComponent.vue` `_getPTValue`. That covers the `searchOut` test, the self, datasets and global construction, the `data-pc-name`, `data-pc-section` and `data-pc-extend` rules and the merge formula, rewritten as typed free functions. The global and default `pt` lookups against the config are replaced by one `context.global` input, so the global source, `usePassThrough`, `pt.hooks` and the `$attrSelector` dataset are not present. The oracle oddities that were ported as they are are listed in ADR-080.
- **`UBaseComponent` (`ng-core`) and `createBaseComponent` (`vue-core`).** They gain the `pt`/`ptOptions` inputs or props and the `ptm`, `ptms` or `ptmi`, and `ptmo` members, with the host-instance lookup of ADR-079. `ptms`/`ptmo` and the `ptm` and `$params` shapes follow PrimeNG `basecomponent.ts`; the Vue provide and inject of `$parentInstance` and the `hostName` walk follow PrimeVue `BaseComponent.vue`. `component-base.ts` in `react-core` is unchanged.
- **`parent-instance.token.ts` (`ng-core`, source class REFERENCE).** It shares only the interface facts of PrimeNG's `PARENT_INSTANCE` token with the oracle; name, typing and comments are Ultimate's. Ultimate Angular has no `hostName` input, because PrimeNG's `_getHostInstance` compares `this.$name` with `hostName` and so does not resolve (ADR-079).
- **Pilot `Card` in `ng`, `react` and `vue` (source class COPY, sub-label `adapted`).** The three Card files had no manifest entry. They gain one now because they carry the passthrough wiring, each compared side by side with PrimeNG `card/card.ts`, PrimeReact `card/Card.js` and PrimeVue `card/Card.vue`. The other Card files (`card-style.ts` entries aside) keep their pre-existing missing-manifest status and are not part of this change.
- **Specs.** The three `passthrough.spec.ts` files are Ultimate-authored; the oracles ship no spec for these files.

Per-file records are in `docs/architecture/provenance/ng-core.json`, `react-core.json`, `vue-core.json`, `ng.json`, `react.json` and `vue.json`.

### F6 CSS layer-order registration source disclosure

Ticket #173 (spec #167) registers the `@layer` order statement when `cssLayer` is on. `packages/uix-styled/src/stylesheet/theme-variables.ts` now sets the statement from `Theme.getLayerOrderCSS()` under `u-layer-order`, first in the sheet, after the common and component variable blocks have recorded their layer names, and again after `theme:change`. It is reference-derived from PrimeNG 21.1.9 `basecomponent.ts:375-381` and PrimeVue 4.5.5 `BaseComponent.vue:191-197`, which load a `layer-order` style with `first: true`; they share only the `Theme.getLayerOrderCSS` call, the `first` placement and the order-after-variables sequence. `packages/uix-styled/src/stylesheet/index.ts` gains an optional `first` flag on `add` and `update` and keeps its upstream shape otherwise (the class stays COPY). The `createStyleElement` overrides in `ng-core`, `react-core` and `vue-core` prepend a `first` element to the document head with one standard DOM call, as PrimeNG `usestyle.ts:29` and PrimeVue `UseStyle.js:57` do. PrimeReact 10.9.9 has no layer-order mechanism: a search of `components/lib` finds no `cssLayer`, `getLayerOrder` or `layer-order`, only `@layer primereact` written into its component CSS. No new upstream package or version was introduced. Per-file records are in `docs/architecture/provenance/uix-styled.json`, `ng-core.json`, `react-core.json` and `vue-core.json`.

### L0a InputText source disclosure

Ticket #188 (spec #167, ADR-086) brings InputText to parity across the three frameworks against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004); the sources were read from the checksum-verified archives re-fetched into `.vendor-cache` (ADR-064).

- **React `input-text.tsx` and `input-text-style.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeReact `inputtext/InputText.js` and `InputTextBase.js`. The single native input, the prop merge with `ptm('root')`, the `p-filled` rule and the root class resolver keys are upstream's. `keyfilter`, `tooltip` and `validatePattern` stay separate composition (ADR-086), and `size` is Ultimate's visual-size prop. The CSS is the shared `@ultimate/uix-styles/inputtext` module.
- **Vue `InputText.vue` and `input-text-style.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeVue `inputtext/InputText.vue` and `style/InputTextStyle.js`. The template bindings, `onInput`, `dataP` and the root class resolver keys are upstream's; the `formField` merge is absent. The hand-ported CSS copy is replaced by the shared module.
- **Vue `BaseInputText.ts` and the three barrels (source class REFERENCE).** They share only interface facts with the compared upstream files. `BaseInputText.ts` now passes its name and style through `createBaseInput(options)` instead of shadowing `cx` and `mounted`.
- **Angular `input-text.ts` and `input-text-style.ts`.** The existing entries gain the `uSize` input, the `UBind` root binding and the `.ng-invalid.ng-dirty` rules.
- **Specs.** The InputText specs are Ultimate-authored.

The seven React and Vue InputText files left `known-missing.json` because they now have manifest entries. Per-file records are in `docs/architecture/provenance/ng.json`, `react.json`, `vue.json` and `vue-core.json`.

### L0a Avatar source disclosure

Ticket #201 (spec #167, ADR-087) brings Avatar and AvatarGroup to parity across the three frameworks against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004); the sources were read from the checksum-verified archives re-fetched into `.vendor-cache` (ADR-064).

- **Angular `avatar.ts` and `avatar-group.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `avatar/avatar.ts` and `avatargroup/avatargroup.ts`. The content order, the `label`, `icon`, `image`, `size`, `shape` and aria inputs, the emit-only `onImageError` and the content-projecting group host are upstream's. `pt`, `unstyled` and `dt` come from `UBaseComponent` and the `UBind` host directive.
- **React `avatar.tsx` and `avatar-group.tsx` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeReact `avatar/Avatar.js` and `avatargroup/AvatarGroup.js`. The content order, `imageAlt`, `imageFallback`, `onImageError`, the clickable class, the group's `role="group"` span and the prop merge with `ptm('root')` are upstream's. The `template` function prop is replaced by `children`. A fallback after a failed image is kept when `onImageError` is supplied (user ruling 2026-11-18).
- **Vue `Avatar.vue` and `AvatarGroup.vue` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeVue `avatar/Avatar.vue` and `avatargroup/AvatarGroup.vue`. The default slot, the `icon` slot, the emit-only `@error` and `ptmi('root')` are upstream's; the `data-p` attribute is absent. The `icon` slot is wrapped in a span carrying `u-avatar-icon` and the icon `ptm`, which is Ultimate's (ADR-087, divergence 5).
- **Style resolvers (source class COPY, sub-label `adapted`).** The six `avatar-style.ts` and `avatar-group-style.ts` files keep the upstream class resolver keys under the `u-` prefix. Their CSS is the shared `packages/uix-styles/src/avatar/index.ts`.
- **`packages/uix-styles/src/avatar/index.ts` (source class COPY, sub-label `adapted`).** The `@primeuix/styles` 2.0.3 avatar module with `.p-avatar*` renamed to `.u-avatar*`, plus one added rule, `.u-avatar-clickable { cursor: pointer; }`, which is PrimeReact's own click styling.
- **`BaseAvatar.ts`, `BaseAvatarGroup.ts` and the barrels (source class REFERENCE).** They share only interface facts with the compared upstream files.
- **Specs.** The Avatar and AvatarGroup specs are Ultimate-authored.

The 18 Avatar files left `known-missing.json` because they now have manifest entries. Per-file records are in `docs/architecture/provenance/ng.json`, `react.json`, `vue.json` and `uix-styles.json`.

### L0a Badge source disclosure

Ticket #202 (spec #167, ADR-088) brings Badge, OverlayBadge and the attribute form to parity across the three frameworks against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004); the sources were read from the checksum-verified archives in `.vendor-cache` (ADR-064).

- **Angular `badge.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `badge/badge.ts`. The `Bind` host directive, the `ptms(['host', 'root'])` binding and the `PARENT_INSTANCE` provider (renamed `UBind` and `U_PARENT_INSTANCE`) are upstream's. The attribute form is not in this file; it is `badge-directive.ts` (ADR-088).
- **Angular `overlay-badge.ts` (source class COPY, sub-label `adapted`).** The root div, the `[pBind]` pairing (renamed `uBind`), the `pcBadge` forwarding and the `ptm('host')` binding are upstream's from PrimeNG `overlaybadge/overlaybadge.ts`. `badgeStyle` and `badgeStyleClass` stand in for `style` and `styleClass`.
- **Angular `badge-directive.ts` (new, source class COPY, sub-label `adapted`).** Compared side by side with `BadgeDirective` in PrimeNG `badge/badge.ts`. The inputs (`badgeDisabled`, `badgeSize`, `severity`, `value`, `badgeStyle`, `badgeStyleClass`) and the result (a badge inside the host, the host marked as an overlay) are upstream's. It creates a real `UBadge` with `createComponent` instead of a hand-built span, takes the overlay look from `overlay-badge-style.ts`, and forwards `pt` as `pcBadge` and `unstyled` to the badge in place of `pBadgePT` and `pBadgeUnstyled`. The deprecated `size` setter and the first-child targeting are not carried (ADR-088).
- **React `badge.tsx` and `badge-style.ts` (new, source class COPY, sub-label `adapted`).** Compared side by side with PrimeReact `badge/Badge.js` and `BadgeBase.js`. The root span with `value`, the `mergeProps` of the component's props, the remaining props and `ptm('root')`, and the class modifiers (dot, single character, large, extra large, severity) are upstream's. The inline `@layer primereact` CSS is replaced by the shared `@ultimate/uix-styles/badge` module (ADR-082). The imperative handle is replaced by a ref to the span.
- **React `index.ts` (new, source class REFERENCE).** A barrel that shares only the exported component with PrimeReact's badge module.
- **React `button.tsx`.** The existing entry notes that the badge now renders through `UBadge`.
- **Vue `Badge.vue` and `OverlayBadge.vue` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeVue `badge/Badge.vue` and `overlaybadge/OverlayBadge.vue`. The `v-bind="ptmi('root')"` root, the slot fallback to `value`, and the composed badge with `:pt="ptm('pcBadge')"` are upstream's. The `data-p` attribute and the `v-badge` provide pair are not carried.
- **Specs and story.** The Badge, OverlayBadge and directive specs and the React story are Ultimate-authored.

The two Vue files and the Angular `overlay-badge.ts` left `known-missing.json` because they now have manifest entries. Per-file records are in `docs/architecture/provenance/ng.json`, `react.json` and `vue.json`.

### L0a Toolbar source disclosure

Ticket #205 (spec #167, ADR-089) brings Toolbar to parity across the three frameworks against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004); the sources were read from the checksum-verified archives in `.vendor-cache` (ADR-064).

- **Angular `toolbar.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `toolbar/toolbar.ts`. The `[pBind]="ptm('x')"` pairing on each region (renamed `uBind`), `hostDirectives`, the `ptms(['host', 'root'])` root binding in `ngAfterViewChecked` and the `PARENT_INSTANCE` provider (renamed `U_PARENT_INSTANCE`) are upstream's. The `PrimeTemplate` fallbacks, `styleClass`, `getBlockableElement()` and `ToolbarModule` stay out (ADR-089).
- **React `toolbar.tsx` (re-classified from REFERENCE to COPY, sub-label `adapted`).** The source re-read found upstream statements in the file: the per-region `mergeProps({ className: cx(x) }, ptm(x))` pairing, the root `mergeProps` with the remaining props and `ptm('root')`, and the function form of the regions. The `left` and `right` aliases and the imperative handle stay out; regions render only when provided (ADR-089).
- **Vue `Toolbar.vue` (source class COPY, sub-label `adapted`).** The root line now carries `v-bind="ptmi('root')"` and each region carries `v-bind="ptm(x)"`, as upstream's template does; regions render conditionally (ADR-089).
- **Specs.** The Toolbar specs are Ultimate-authored.

Per-file records are in `docs/architecture/provenance/ng.json`, `react.json` and `vue.json`.

### F13 motion default name source disclosure

`packages/uix-motion/src/config/index.ts` is copied from `@primeuix/motion` (source class COPY, ADR-064). Ticket #177 (spec #167) changes one value in `DEFAULT_MOTION_OPTIONS`: the default `name` is `"u"` instead of upstream's `"p"`, so a `createMotion` call without a name generates `u-enter-*` and `u-leave-*` classes, matching the `u` prefix Ultimate already uses for the theme, the CSS layer and the SSR attribute. Every Dialog and Menu call site in Angular, React and Vue already passes its own `u-dialog` or `u-menu` name, so no component source changed and no new upstream package or version was introduced. The file-level record is `docs/architecture/provenance/uix-motion.json`, with the sub-label moved from `import-path-adapted` to `adapted`.

### L0a FloatLabel source disclosure

Ticket #191 (spec #167, ADR-090) brings FloatLabel to parity across the three frameworks against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004); the sources were read from the checksum-verified archives in `.vendor-cache` (ADR-064).

- **`packages/uix-styles/src/floatlabel/index.ts` (source class COPY, sub-label `adapted`).** Recovered from `@primeuix/styles` 2.0.3 `floatlabel`. The `.p-floatlabel*` selectors are renamed to `.u-float-label*`, and the sibling-field selectors are changed to the classes the Ultimate siblings emit; the state classes stay `p-filled`, `p-invalid` and `p-inputwrapper-*`. The two padding selectors the earlier local copies lacked are carried from upstream.
- **Angular `float-label.ts` and `float-label-style.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `floatlabel/floatlabel.ts` and `floatlabelstyle.ts`. The template, host class, `variant` input, `Bind` binding and parent-instance provider are upstream's; the `.ng-invalid.ng-dirty` rule is upstream's.
- **React `float-label.tsx` and `float-label-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeReact `FloatLabel.js` and `FloatLabelBase.js`. The root span, the prop merge with `ptm('root')` and the root class key are upstream's; the hand-written CSS is replaced by the shared module.
- **Vue `FloatLabel.vue` and `float-label-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeVue `FloatLabel.vue` and `FloatLabelStyle.js`. The root span, `ptmi('root')` and the class key are upstream's; the hand-ported CSS copy is replaced by the shared module.
- **Vue `BaseFloatLabel.ts` and the three barrels (source class REFERENCE).** They share only interface facts with the compared upstream files.
- **Specs and stories.** The FloatLabel specs and stories are Ultimate-authored.

The ten FloatLabel source files left `known-missing.json` because they now have manifest entries. Per-file records are in `docs/architecture/provenance/ng.json`, `react.json`, `vue.json` and `uix-styles.json`.

### L0a IconField source disclosure

Ticket #192 (spec #167, ADR-091) brings IconField and InputIcon to parity across the three frameworks against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004); the sources were read from the checksum-verified archives in `.vendor-cache` (ADR-064).

- **`packages/uix-styles/src/iconfield/index.ts` (source class COPY, sub-label `adapted`).** Recovered from `@primeuix/styles` 2.0.3 `iconfield`. The `.p-iconfield*` and `.p-inputicon` selectors are renamed to `.u-icon-field*` and `.u-input-icon`, and the sibling-field selectors are changed to the classes the Ultimate siblings emit (`.u-inputtext`, `.p-inputwrapper`, and `-sm`/`-lg` under both `u-inputtext-*` and `u-inputfield-*`).
- **Angular `icon-field.ts` and `icon-field-style.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `iconfield/iconfield.ts`, `inputicon/inputicon.ts` and `iconfieldstyle.ts`. The templates, the `iconPosition` input and its host class, the `Bind` binding and the parent-instance provider are upstream's. The instance tokens and the deprecated `styleClass` input are not carried. `aria-hidden` on InputIcon is an Ultimate addition (user ruling).
- **React `icon-field.tsx` and `icon-field-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeReact `IconField.js`, `InputIcon.js` and `IconFieldBase.js`. The root element, the prop merge with `ptm('root')` and the root class key are upstream's. `iconPosition` defaults to `left`, where PrimeReact defaults to `right` (user ruling). The `cloneElement` injection is not carried. The hand-written CSS is replaced by the shared module.
- **Vue `IconField.vue`, `InputIcon.vue` and `icon-field-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeVue `IconField.vue`, `InputIcon.vue` and `IconFieldStyle.js`. The root elements, `ptmi('root')` and the class keys are upstream's. `aria-hidden` sits before `v-bind` so it can be replaced, where PrimeVue writes it after. The hand-ported CSS copy is replaced by the shared module.
- **Vue `BaseIconField.ts`, `BaseInputIcon.ts` and the three barrels (source class REFERENCE).** They share only interface facts with the compared upstream files.
- **Specs and stories.** The IconField specs and stories are Ultimate-authored.

The twelve IconField source files left `known-missing.json` because they now have manifest entries. Per-file records are in `docs/architecture/provenance/ng.json`, `react.json`, `vue.json` and `uix-styles.json`.

### L0a IftaLabel source disclosure

Ticket #193 (spec #167, ADR-092) brings IftaLabel to parity in Angular and Vue against the pinned oracles PrimeNG 21.1.9 and PrimeVue 4.5.5. PrimeReact ships no IftaLabel, so React has no component and no entry. No Prime package is a dependency (ADR-004). The `.vendor-cache` archives are absent in this worktree, so the sources were read from the installed `primeng` 21.1.9 (`fesm2022/primeng-iftalabel.mjs`), `primevue` 4.5.5 (`iftalabel/*.vue`) and `@primeuix/styles` 2.0.3 (`dist/iftalabel/index.mjs`) packages in `node_modules` (ADR-064).

- **`packages/uix-styles/src/iftalabel/index.ts` (source class COPY, sub-label `adapted`).** Recovered from `@primeuix/styles` 2.0.3 `iftalabel`. The `.p-iftalabel*` selectors are renamed to `.u-ifta-label*` and `.p-inputicon` to `.u-input-icon`, and the sibling-field selectors are changed to the classes the Ultimate siblings emit; the state classes stay `p-invalid` and `p-inputwrapper-focus`. The two padding selectors the earlier local copies lacked are carried from upstream.
- **Angular `ifta-label.ts` and `ifta-label-style.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `iftalabel.ts` and `iftalabelstyle.ts`. The template, host class, `Bind` binding and parent-instance provider are upstream's; the `.ng-invalid.ng-dirty` rule is upstream's and was missing from the local copy.
- **Vue `IftaLabel.vue` and `ifta-label-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeVue `IftaLabel.vue` and `IftaLabelStyle.js`. The root span, `ptmi('root')` and the class key are upstream's; the hand-ported CSS copy is replaced by the shared module.
- **Vue `BaseIftaLabel.ts` and the barrels (source class REFERENCE).** They share only interface facts with the compared upstream files.
- **Specs and stories.** The IftaLabel specs and stories are Ultimate-authored.

The seven IftaLabel source files left `known-missing.json` because they now have manifest entries. Per-file records are in `docs/architecture/provenance/ng.json`, `vue.json` and `uix-styles.json`.

### L0a InputGroup source disclosure

Ticket #194 (spec #167, ADR-093 and ADR-094) brings InputGroup to parity in Angular and Vue against the pinned oracles PrimeNG 21.1.9 and PrimeVue 4.5.5. PrimeReact ships no InputGroup component, only a CSS pattern, so the React components are Ultimate-authored (ADR-094). No Prime package is a dependency (ADR-004). The sources were read from the installed `primeng` 21.1.9, `primevue` 4.5.5 and `@primeuix/styles` 2.0.3 packages in `node_modules` (ADR-064).

- **`packages/uix-styles/src/inputgroup/index.ts` (source class COPY, sub-label `adapted`).** Recovered from `@primeuix/styles` 2.0.3 `inputgroup`. The `.p-inputgroup*` selectors are renamed to `.u-input-group*`, and the `.p-iconfield`, `.p-floatlabel` and `.p-iftalabel` wrappers to `.u-icon-field`, `.u-float-label` and `.u-ifta-label`. The text-field selector is changed to `.u-inputtext`, and the focus rule keys on the `.p-focus` state class the Select family emits. The `.p-inputwrapper` and `.p-inputwrapper-focus` state classes are kept.
- **Angular `input-group.ts` and `input-group-style.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `inputgroup.ts`, `inputgroupaddon.ts` and their style modules. The template, host class, `Bind` binding and the `p-button` and `p-inputmask` host-element rules are upstream's, renamed to `u-button` and `u-input-mask`. The `:first-child` guard on the button reset rule is dropped (ADR-093).
- **Vue `InputGroup.vue`, `InputGroupAddon.vue` and `input-group-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeVue `InputGroup.vue`, `InputGroupAddon.vue` and their style modules. The root element, the default slot and the class key are upstream's; the `ptmi('root')` binding is added in #194.
- **Vue `BaseInputGroup.ts`, `BaseInputGroupAddon.ts` and the barrel (source class REFERENCE).** They share only interface facts with the compared upstream files.
- **React `input-group.tsx`, `input-group-style.ts` and `index.ts` (source class AUTHORED).** No upstream file exists. They mirror the Angular and Vue components and consume the shared module.
- **Specs and stories.** Ultimate-authored.

The nine InputGroup source files left `known-missing.json` because they now have manifest entries (three Angular, six Vue). Per-file records are in `docs/architecture/provenance/ng.json`, `vue.json` and `uix-styles.json`.

### L0a InputMask source disclosure

Ticket #190 (spec #167, ADR-095) brings InputMask to parity in Angular, React and Vue against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004). The sources were read from the installed `primeng` 21.1.9 and `primevue` 4.5.5 packages in `node_modules` and the pinned PrimeReact source in `.vendor-cache` (ADR-064).

- **Angular `input-mask.ts` and `input-mask-style.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `inputmask.ts` and its style module. The component and directive surface, the clear icon and the control value accessor wiring are upstream's. The directive is `[uInputMask]`, and the pass-through names are unprefixed (ADR-095). PrimeNG's `BaseComponent`, injected style services and NgModule wrapper are not carried.
- **Angular `input-mask-engine.ts` (source class COPY, sub-label `adapted`).** The buffer algorithm moved out of the component into one engine shared by the component and the directive. Composition guards, the deferred paste reformat and the re-entrancy flag are Ultimate additions.
- **React `input-mask.tsx` and `input-mask-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeReact `InputMask.js` and `InputMaskBase.js`. The algorithm is upstream's. Two upstream defects are corrected (Delete at a collapsed caret, and the controlled-echo wipe). The style registers the shared `@ultimate/uix-styles/inputtext` CSS under the `inputtext` key (ADR-095).
- **Vue `InputMask.vue` and `input-mask-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeVue `InputMask.vue` and `InputMaskStyle.js`. The nested `InputText` render and the algorithm are upstream's; the differences are listed in ADR-095.
- **Vue `BaseInputMask.ts` and the barrels (source class REFERENCE).** They share only interface facts with the compared upstream files. The Angular barrel is authored.
- **Specs and stories.** Ultimate-authored.

The ten InputMask source files left `known-missing.json` because they now have manifest entries (three Angular, three React, four Vue). The new Angular engine file has its own entry. Per-file records are in `docs/architecture/provenance/ng.json`, `react.json` and `vue.json`.

### L0a TriStateCheckbox source disclosure

Ticket #209 (spec #167, ADR-096) brings the React TriStateCheckbox to parity against the pinned oracle PrimeReact 10.9.9. PrimeNG 21.1.9 and PrimeVue 4.5.5 ship no such control, so Angular and Vue have no component and no entry. No Prime package is a dependency (ADR-004). The sources were read from the pinned PrimeReact archive in `.vendor-cache` (ADR-064).

- **React `tri-state-checkbox.tsx` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeReact `TriStateCheckbox.js`. The cycle, the guards, the key handling, the markup, the change event shape, the forwarded ARIA, the icons, the focus callbacks, autoFocus and the ref handle are upstream's. PrimeReact's context, base props and internal value state are replaced by `useComponentBase`, `createPassThrough`, `useMergeProps` and a value derived from the prop. The differences are listed in ADR-096.
- **React `tri-state-checkbox-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeReact `TriStateCheckboxBase.js`. The root class and its modifiers follow upstream's; the CSS stays hand-authored (ADR-067(c)).
- **React `index.ts` (source class REFERENCE).** It shares only the exported names with the compared upstream entry point.
- **Spec and stories.** Ultimate-authored.

The three TriStateCheckbox source files left `known-missing.json` because they now have manifest entries. Per-file records are in `docs/architecture/provenance/react.json`.

### L0a Textarea source disclosure

Ticket #189 (spec #167, ADR-097) brings Textarea to parity across the three frameworks against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004); the sources were read from the checksum-verified archives in `.vendor-cache` (ADR-064).

- **`packages/uix-styles/src/textarea/index.ts` (source class COPY, sub-label `adapted`).** Recovered from `@primeuix/styles` 2.0.3 `textarea`. The `.p-textarea*` selectors are renamed to `.u-textarea*`; `p-invalid` and `p-variant-filled` are kept.
- **Angular `textarea.ts` and `textarea-style.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `textarea/textarea.ts` and `textareastyle.ts`. The directive shape, the inputs, the `onResize` output, the NgControl sync, the Fluid lookup, the `Bind` binding and the class resolver are upstream's. `resize()` treats a missing `max-height` as no cap, and the `ngAfterViewChecked` trigger is replaced by `NgControl.valueChanges`. `pSize` is `uSize`. The `config.inputStyle()` and `config.inputVariant()` fallback is not carried.
- **React `input-textarea.tsx` and `input-textarea-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeReact `InputTextarea.js` and `InputTextareaBase.js`. The root element, the resize routine and its triggers, the prop merge with `ptm('root')` and the root class key are upstream's. `p-filled` is derived from the value, `size` is an Ultimate addition, and `keyfilter` and `tooltip` are not carried. The hand-written CSS is replaced by the shared module.
- **Vue `Textarea.vue` and `textarea-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeVue `Textarea.vue` and `TextareaStyle.js`. The root element, `ptmi('root')`, the `ResizeObserver` resize and the class keys are upstream's. `formField` is not carried. The hand-ported CSS copy is replaced by the shared module.
- **Vue `BaseTextarea.ts` and `index.ts` and the Angular and React barrels (source class REFERENCE).** They share only interface facts or exported names with the compared upstream files.
- **Specs and stories.** Ultimate-authored.

The eleven Textarea source files left `known-missing.json` because they now have manifest entries. Per-file records are in `docs/architecture/provenance/ng.json`, `react.json`, `vue.json` and `uix-styles.json`.

### L0a MultiStateCheckbox source disclosure

Ticket #208 (spec #167, ADR-099) brings the React MultiStateCheckbox to parity against the pinned oracle PrimeReact 10.9.9. PrimeNG 21.1.9 and PrimeVue 4.5.5 ship no such control, so Angular and Vue have no component and no entry. No Prime package is a dependency (ADR-004). The sources were read from the pinned PrimeReact archive in `.vendor-cache` (ADR-064).

- **React `multi-state-checkbox.tsx` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeReact `MultiStateCheckbox.js`. The cycle, the `empty` wrap, the option resolution, the change event shape, the Space handling, the live region, the forwarded ARIA, autoFocus, the focus callbacks and the ref handle are upstream's. PrimeReact's context, base props and nested `<Checkbox>` are replaced by `useComponentBase`, `createPassThrough`, `useMergeProps` and a self-contained `role="checkbox"` box. The differences are listed in ADR-099.
- **React `multi-state-checkbox-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeReact `MultiStateCheckboxBase.js`. The root class and its modifiers follow upstream's; the CSS stays hand-authored (ADR-067(c)).
- **React `index.ts` (source class REFERENCE).** It shares only the exported names with the compared upstream entry point.
- **Spec and stories.** Ultimate-authored.

The three MultiStateCheckbox source files left `known-missing.json` because they now have manifest entries. Per-file records are in `docs/architecture/provenance/react.json`.

### L0a Chip source disclosure

Ticket #203 (spec #167, ADR-098) brings Chip to parity across the three frameworks against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004); the sources were read from the checksum-verified archives in `.vendor-cache` (ADR-064).

- **`packages/uix-styles/src/chip/index.ts` (source class COPY, sub-label `adapted`).** Recovered from `@primeuix/styles` 2.0.3 `chip`. The `.p-chip*` selectors are renamed to `.u-chip*`. Every declaration and token is upstream's. The `.u-chip-label` rule is the one the earlier local copies carried and `@primeuix/styles` lacks.
- **Angular `chip.ts` and `chip-style.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `chip.ts` and `chipstyle.ts`. The `Bind` binding, the parent-instance provider, the `data-p` getter, the `p-disabled` class, the `removeIcon` input, the `removeicon` template and the host `display: none` are upstream's. `chipProps`, `styleClass`, the instance token and `TimesCircleIcon` are not carried.
- **React `chip.tsx` and `chip-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeReact `Chip.js` and `ChipBase.js`. The `template` prop, the `removeIcon` prop, the root prop merge with `ptm('root')` and the class keys are upstream's. The hand-written CSS is replaced by the shared module. The remove payload and veto, and the imperative API, are not carried.
- **Vue `Chip.vue`, `BaseChip.ts` and `chip-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeVue `Chip.vue`, `BaseChip.vue` and `ChipStyle.js`. The slots, `ptmi('root')`, the `removeIcon` prop, `data-p` and the class keys are upstream's. The `icon` slot sits in a wrapper span, and the hand-ported CSS copy is replaced by the shared module.
- **Barrels (source class REFERENCE).** They share only the exported names with the compared upstream entry points.
- **Specs and stories.** The Chip specs and stories are Ultimate-authored.

No Chip source file was in `known-missing.json`. The existing manifest entries for the Chip files are updated, and one entry is added for the shared module. Per-file records are in `docs/architecture/provenance/ng.json`, `react.json`, `vue.json` and `uix-styles.json`.

### L0a ToggleSwitch source disclosure

Ticket #197 (spec #167, ADR-100) brings ToggleSwitch, and React's InputSwitch, to parity across the three frameworks against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004); the sources were read from the checksum-verified archives in `.vendor-cache` (ADR-064).

- **`packages/uix-styles/src/toggleswitch/index.ts` (source class COPY, sub-label `adapted`).** Recovered from `@primeuix/styles` 2.0.3 `toggleswitch`. The `.p-toggleswitch*` selectors are renamed to `.u-toggle-switch*`. Every declaration and token is upstream's, with `position: relative` on the root. `p-disabled` and `p-invalid` are kept unrenamed.
- **Angular `toggle-switch.ts` and `toggle-switch-style.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `toggleswitch.ts` and `toggleswitchstyle.ts`. The native input, the value pair, the input surface, the handle template, the data hooks, touched on blur, the change output and the `Bind` binding are upstream's. `styleClass`, the `size` input and the instance token are not carried.
- **React `input-switch.tsx` and `input-switch-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeReact `InputSwitch.js` and `InputSwitchBase.js`. The controlled `checked`, the change event shape, the focus and blur callbacks, the aria and tabIndex wiring, `inputRef` and the imperative handle are upstream's. The root `role="checkbox"` wrapper and the tooltip props are not carried. The hand-written CSS is replaced by the shared module.
- **Vue `ToggleSwitch.vue`, `BaseToggleSwitch.ts` and `toggle-switch-style.ts` (source class COPY, sub-label `adapted`; the base factory is `reimplemented-with-reference`).** Compared with PrimeVue `ToggleSwitch.vue`, `BaseToggleSwitch.vue` and `ToggleSwitchStyle.js`. The input wiring, the slider and handle pair, the `handle` slot, the data hooks and the class keys are upstream's. The hand-ported CSS copy is replaced by the shared module, and `$pcToggleSwitch` is not carried.
- **Barrels (source class REFERENCE; the Angular barrel is `authored`).** They share only the exported names with the compared upstream entry points.
- **Specs and stories.** The ToggleSwitch and InputSwitch specs and stories are Ultimate-authored.

The ten ToggleSwitch and InputSwitch source files that were in `known-missing.json` (Angular 3, React 3, Vue 4) now have manifest entries and are removed from it, and one entry is added for the shared module. Per-file records are in `docs/architecture/provenance/ng.json`, `react.json`, `vue.json` and `uix-styles.json`.

### L0a Slider source disclosure

Ticket #198 (spec #167, ADR-101) brings Slider to parity across the three frameworks against the pinned oracles PrimeNG 21.1.9, PrimeReact 10.9.9 and PrimeVue 4.5.5. No Prime package is a dependency (ADR-004); the sources were read from the checksum-verified archives in `.vendor-cache` (ADR-064).

- **`packages/uix-styles/src/slider/index.ts` (source class COPY, sub-label `adapted`).** Recovered from `@primeuix/styles` 2.0.3 `slider`. The `.p-slider*` selectors are renamed to `.u-slider*`. Every declaration and token is upstream's, with `position: absolute` added on the handle and the range, which Prime sets inline. `p-disabled` and `p-invalid` are kept unrenamed.
- **Angular `slider.ts` and `slider-style.ts` (source class COPY, sub-label `adapted`).** Compared side by side with PrimeNG `slider.ts` and `sliderstyle.ts`. The handle and range markup, the `role=slider` handles with their value attributes, the name attributes, the tab stop that is removed when disabled, the touch handlers, the `inset-inline-start` placement, the step rule and the keyboard map are upstream's. `animate`, `styleClass`, `autofocus` and the instance token are not carried. The touch handler uses the absolute position as Ultimate's mouse handler does, where PrimeNG adds a delta from the touch start.
- **React `slider.tsx` and `slider-style.ts` (source class COPY, sub-label `adapted`).** Compared with PrimeReact `Slider.js` and `SliderBase.js`. The controlled value, the range handles, the touch identifier, the track click, the keyboard map and the aria wiring are upstream's. Placement uses `inset-inline-start` where PrimeReact uses `left`, and the tab stop is removed when disabled. The hand-written CSS is replaced by the shared module.
- **Vue `Slider.vue`, `BaseSlider.ts` and `slider-style.ts` (source class COPY, sub-label `adapted`; the base factory is `reimplemented-with-reference`).** Compared with PrimeVue `Slider.vue`, `BaseSlider.vue` and `SliderStyle.js`. The template, the touch handlers, the `inset-inline-start` placement, the name attributes and the cleanup on unmount are upstream's. The tab stop is removed when disabled, and `$pcSlider` is not carried. The hand-ported CSS copy is replaced by the shared module.
- **Barrels (source class REFERENCE; the Angular barrel is `authored`).** They share only the exported names with the compared upstream entry points.
- **Specs and stories.** The Slider specs and stories are Ultimate-authored.

The ten Slider source files that were in `known-missing.json` (Angular 3, React 3, Vue 4) now have manifest entries and are removed from it, and one entry is added for the shared module. Per-file records are in `docs/architecture/provenance/ng.json`, `react.json`, `vue.json` and `uix-styles.json`.
