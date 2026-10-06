# Provenance Record

This file records the exact origin of every Prime-derived source area incorporated into Ultimate Platform. Phase 0 populates baseline-level entries only; component-level entries are added during Phase 1+ migration.

Field template (per Blueprint §6/§8):

```text
Source repository       Source package         Source version
Source commit SHA       Source path             Original license
Copyright holder         Third-party notices     Ultimate destination
Modification status      Modification description  Date incorporated
```

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
- **Modification status:** incorporated (Phase 1) — cross-package `@primeuix/*` import specifiers adapted to `@ultimate/uix-*` via `scripts/provenance/adapt-imports.mjs`; all other source retained verbatim. File-level detail: `docs/architecture/provenance/uix-styled.json`.
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
- **Modification status:** incorporated (Phase 1) — `base` module only; ~90 per-component style modules remain classified LATER PHASE per the Phase 1 spec, deferred to each component's own migration phase (2/3/4). `virtualscroller` (Scroller's style-token module) incorporated directly-ported, consumed by all three frameworks' own `packages/{ng,react,vue}/src/scroller/scroller-style.ts` modules. `paginator` (Paginator's style-token module) also incorporated directly-ported, consumed by all three frameworks' own `packages/{ng,react,vue}/src/paginator/paginator-style.ts` modules. No import adaptation needed (zero dependencies). Per-component structural CSS was also ported (reference-derived, Option B, not copied verbatim) into each framework's own style modules: for GAP-064 G3-A, 14 keys (avatar, chip, tag, skeleton, overlaybadge, knob, progressbar, progressspinner, metergroup, timeline, terminal, message, inlinemessage, toast) across 27 ng/vue style files; for GAP-064 G3-B, 10 keys (accordion, blockui, card, divider, fieldset, inplace, panel, scrollpanel, splitter, toolbar) across 20 ng/vue style files; for GAP-064 G3-C1, 5 keys (breadcrumb, dock, steps, stepper, tabs) across 10 ng/vue style files. GAP-064 G3-C2 (Menus) style modules are also reference-derived from this package. The file-level entries for these ports are in `docs/architecture/provenance/{ng,vue}.json`. File-level detail: `docs/architecture/provenance/uix-styles.json`.
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
- **Modification status:** incorporated — `equals` is re-exported unchanged from `@ultimate/uix-utils/object` (see that package's own `PROVENANCE.md` entry and `docs/architecture/provenance/uix-utils.json` for its provenance). The remaining five modules (`SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata`, `PaginationState`/`getPageCount`, `calculateNumItemsInViewport`/`calculateLast`) are Ultimate-authored, each verified against real pinned PrimeNG 21.1.9, PrimeReact 10.9.9, and PrimeVue 4.5.5 source per the approved architecture research (six research passes; see `docs/superpowers/specs/2026-09-01-uix-data-foundation-design.md` Context section for the full research trail). File-level verification basis: `docs/architecture/provenance/uix-data.json`.
- **Modification description:** see file-level manifest at `docs/architecture/provenance/uix-data.json` for the specific real-source evidence backing each module.
- **Date incorporated:** 2026-09-01

---

**Excluded from Phase 0 core (not runtime dependencies of any confirmed baseline):** `@primeuix/forms`, `@primeuix/mcp`. See `docs/architecture/DEPENDENCIES.md` for exclusion rationale.

**Upstream provenance gap note:** the `primefaces/primeuix` GitHub repository has exactly one branch (`main`) and 17 lightweight tags, none reaching past bare version `0.6.0`. All four `@primeuix/*` packages above were published to npm with `gitHead: null`. This is PrimeTek's own upstream gap (repo archived mid-history), not a verification failure — see spec Finding 3 for full detail.

### Phase C Batch 3 source disclosure

OrderList, PickList, and DataView reference PrimeNG 21.1.9, PrimeReact 10.9.9, and PrimeVue 4.5.5. OrganizationChart references only PrimeReact 10.9.9 and PrimeVue 4.5.5; Angular is excluded by DECISION-D. The implementations are Ultimate-owned, framework-native components without Prime runtime dependencies. Per-file records are in provenance/ng.json, provenance/react.json, and provenance/vue.json.

Angular OrderList/PickList add the MIT-licensed @angular/cdk dependency solely for optional drag/drop. React uses native HTML5 events; Vue has no drag/drop. The exact CDK version and license verification are recorded in Task 0's commit and pnpm-lock.yaml.

### Prime-parity audit source disclosure

The Prime-parity Implementation Plans (GAP-041–GAP-070, `feature/prime-parity-audit-gaps`, 2026-09-27..2026-10-01) changed existing `ng`, `react` and `vue` components against the same pinned upstream baselines recorded above: PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5, `@primeuix/styles` 2.0.3 and `@primeuix/themes` 2.0.3. No new upstream package or version was introduced, and no Prime runtime dependency was added. GAP-064 ported 71 Aura per-component preset modules from `@primeuix/themes` 2.0.3, each recorded in provenance/themes.json. GAP-063 added `packages/vue/src/stepper/StepperSeparator.vue`, recorded in provenance/vue.json. GAP status and evidence are in `docs/architecture/BLUEPRINT_GAPS.md`.
