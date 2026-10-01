# Prime Parity: Theming Implementation Plan (GAP-064)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Execution approach:** Subagent-driven development, one implementer/reviewer cycle per component-module task. Chosen because each task is a mechanical port from real pinned source with no cross-task interface risk — a lighter, higher-throughput cadence than Table's own plan, but still independently reviewed per component to catch a mistranscribed token value.

**Goal:** Extend Aura per-component preset coverage from the original 5-component proof set to the components covered by migration Batches 1-3, following the Spec's own investigated sequencing (repository's existing Batch 1/2/3 grouping — no new heuristic).

**Spec:** `docs/superpowers/specs/2026-09-26-prime-parity-theming-design.md`.

**Corrections (2026-10-01, pre-dispatch source check, user decisions — see Spec §12):** (1) real `@primeuix/themes` 2.0.3 has no `inputmask` module (PrimeVue v4 InputMask reuses `inputtext` tokens), so `input-mask.ts` is dropped from Task 1 (24 modules); (2) Task 3 ports upstream `tabs` only as `tabs.ts` — upstream `tabview`/`tabmenu` modules are carried forward for React's `UTabView`/`UTabMenu`; (3) "export from the preset's own index" means registering each module in `auraPreset.components` (`aura/index.ts`), the existing 5's real pattern, with the themes bundle and emitted-CSS size measured before and after; (4) each new file gets a `docs/architecture/provenance/themes.json` entry like the existing aura entries (CI manifest check); (5) tests live in `packages/themes/test/*.test.ts`; port from the readable `.vendor-extracted/themes/src/presets/aura/<module>/index.ts` sources (same content as the tarball's `index.mjs`).

**Added after Task 1 review (2026-10-01, user decisions):** (6) **Upstream-fidelity snapshot.** `.vendor-extracted/` is gitignored, so a test reading it skips in CI. Each task commits the upstream token objects for its modules as a JSON test fixture under `packages/themes/test/` and deep-compares every Ultimate module against it (Task 2 also backfills Task 1's 24 modules). (7) **CI bundle-size gate.** Registering modules grows `@ultimate/themes` past `size:validate`'s 15% threshold (after Task 1: 5.23 KB → 7.9 KB gzip). Continue all tasks. **Corrected at closeout (2026-10-01, final review + user decision):** a baseline-only change cannot land first — the gate measures main's current, still-small bundle, and a branch off this one touches package source. The gate's designed order (Phase 10 plan `2026-09-08-phase-10-ci-security-quality-gates-implementation.md:217-218`) is: when this whole branch merges (after all 9 Plans), the failing size check needs an explicit human override; then a new branch off main changes only `docs/architecture/PERFORMANCE.md`, re-measured on main, covering every package that grew on this branch (themes, plus react/vue/ng-core from earlier Plans). No push or PR without explicit user authorization.

**Scope note, binding on this Plan:** this document sequences and executes the **first, largest, already-fully-mapped tranche** of GAP-064's own total scope — every real Prime preset module that corresponds to a Batch 1, 2, or 3 canonical capability (per the table below). It explicitly does not claim to close GAP-064 in full within this one Plan; the disclosed exceptions (editor/DECISION-B, tree-family/DECISION-D, `ripple`'s ambiguous status) remain genuinely unresolved and are not silently absorbed here.

## Sequencing Table (GAP-064's own investigated mapping — authoritative, not re-derived)

| Real Prime module | Ultimate directory | Batch | Task |
|---|---|---|---|
| radiobutton, toggleswitch, togglebutton, inputtext, textarea, inputnumber, ~~inputmask~~ (no upstream module — dropped 2026-10-01), inputotp, password, autocomplete, select, multiselect, cascadeselect, listbox, selectbutton, rating, slider, knob, colorpicker, datepicker, fileupload, iconfield, floatlabel, inputchips, iftalabel | `radio-button`, `toggle-switch`, `toggle-button`, `input-text`, `textarea`, `input-number`, ~~`input-mask`~~, `input-otp`, `password`, `autocomplete`, `select`, `multi-select`, `cascade-select`, `listbox`, `select-button`, `rating`, `slider`, `knob`, `color-picker`, `date-picker`, `file-upload`, `icon-field`, `float-label`, `input-chips`, `ifta-label` | Batch 1 §3.1 (Form) | Task 1 |
| popover, drawer, contextmenu, confirmdialog, confirmpopup, overlaybadge | `popover`, `drawer`, `context-menu`, `confirm-dialog`, `confirm-popup`, `overlay-badge` | Batch 1 §3.2 (Overlay) | Task 2 |
| breadcrumb, megamenu, menubar, panelmenu, tieredmenu, tabs (upstream `tabs` only; `tabview`/`tabmenu` carried forward — 2026-10-01), stepper, steps, dock, speeddial, splitbutton | `breadcrumb`, `mega-menu`, `menubar`, `panel-menu`, `tiered-menu`, `tabs`, `stepper`, `steps`, `dock`, `speed-dial`, `split-button` | Batch 1 §3.3 (Navigation) | Task 3 |
| accordion, avatar, blockui, card, carousel, chip, divider, fieldset, galleria, image, imagecompare, inplace, message, metergroup, panel, progressbar, progressspinner, scrollpanel, skeleton, splitter, tag, terminal, timeline, toolbar, toast | `accordion`, `avatar`, `block-ui`, `card`, `carousel`, `chip`, `divider`, `fieldset`, `galleria`, `image`, `image-compare`, `inplace`, `message`, `meter-group`, `panel`, `progress-bar`, `progress-spinner`, `scroll-panel`, `skeleton`, `splitter`, `tag`, `terminal`, `timeline`, `toolbar`, `toast` | Batch 1 §3.4 (Panel/Layout/Display/Feedback) | Task 4 |
| inlinemessage | `inline-message` | Batch 2 §3.2 | Task 5 |
| orderlist, picklist, dataview | `order-list`, `pick-list`, `data-view` | Batch 3 §3.1-3.3 | Task 6 |
| organizationchart | `organization-chart` | Batch 3 §3.4 (React/Vue only — DECISION-D excludes Angular) | Task 7 |

**Explicitly not in this Plan's scope, per the Spec's own disclosed exceptions:** `editor` (DECISION-B), `tree`/`treeselect`/`treetable` (DECISION-D), `ripple` (ambiguous — see below), `virtualscroller` (naming note only — Ultimate's `scroller` is already-Built, pre-dates this audit, and was never itself gated on this gap; not included in any task above), `css` (not a component), `datatable`/`table` (tracked separately by GAP-041-047's own Table Plan, not this one), and the original 5-proof-set components (`checkbox`/`button`/`menu`/`tooltip`/`dialog` — already have presets).

**`ripple` — flagged, not resolved:** the investigation found this genuinely ambiguous (a visual-effect directive, not clearly a themeable-surface component in the same sense as the others). No task in this Plan adds a `ripple.ts` preset module. If a human reviewer determines during Plan Review that `ripple` should be included, that requires an explicit decision, not an assumption made here.

## Global Constraints

- **`base.ts` is never modified by any task.** Confirmed Parity Confirmed, exact match — no task reads or reasons about changing it.
- **Material/Lara/Nora are never referenced by any task.** DEFERRED, separate decision — no task in this Plan creates a `material/`, `lara/`, or `nora/` directory anywhere.
- **Each new preset module follows the exact same shape as the existing 5** (`packages/themes/src/presets/aura/{checkbox,button,menu,tooltip,dialog}.ts`) — a `dt()`-resolvable token object, referencing `base.ts`'s own semantic tokens via `{token.path}` interpolation, not hardcoded literal values, wherever the real Prime source itself uses a semantic reference (only truly primitive, non-semantic values like fixed pixel sizes are transcribed as literals, matching the existing 5's own established "Option B — reference, not verbatim" precedent).
- **Every new module is ported from real, pinned Prime source** (`.vendor-cache/@primeuix__themes-2.0.3.tar.gz`, `package/dist/aura/<module>/index.mjs`) — no task invents token values not present in that real source.
- **No task consumes/wires a new preset module into its corresponding component's own style file.** This Plan's own scope (per the Spec's own §1) is authoring the preset-module content itself; wiring each component's `*-style.ts` to consume `dt()` calls referencing the new module is a separate, larger body of work the Spec explicitly leaves to future sequencing (Spec §5's own "unresolved, marked explicitly" framing) — **not silently included here**. Each task's own completion criterion is "the preset module exists, exports the correct shape, and is unit-tested for shape/value correctness," not "the component visually re-themes."

## Review Focus

- **A component whose real Prime preset module references a token path that doesn't exist in Ultimate's own `base.ts`** — confirmed unlikely given `base.ts`'s own exact verbatim match to real Prime's `base` module, but each task's own test must assert every `{token.path}` reference in the new module resolves against `base.ts`'s actual exported shape, not merely that the module's own object literal is well-formed.
- **A component with real Prime's own `colorScheme`-split token structure** (mode-aware light/dark values, confirmed present in `button`/`tooltip`/`dialog`'s existing modules per `checkbox.ts`'s own doc comment contrasting itself against them) vs. one without (like `checkbox` itself) — each new module must be ported using whichever real shape that specific component's own real Prime module actually has, not forced into one shape uniformly across all new modules.

---

### Task 1: Form family preset modules (25 modules)

**Files:** create `packages/themes/src/presets/aura/{radio-button,toggle-switch,toggle-button,input-text,textarea,input-number,input-otp,password,autocomplete,select,multi-select,cascade-select,listbox,select-button,rating,slider,knob,color-picker,date-picker,file-upload,icon-field,float-label,input-chips,ifta-label}.ts` (24 — `input-mask` dropped 2026-10-01). Tests: `packages/themes/test/` (this package's convention). Also: `aura/index.ts` (register), `docs/architecture/provenance/themes.json` (entries).

- [ ] **Step 1: Extract real source**

For each of the 25 real Prime module names (left column of the Task 1 row above), extract `package/dist/aura/<module>/index.mjs` from `.vendor-cache/@primeuix__themes-2.0.3.tar.gz`.

- [ ] **Step 2: Write the failing tests**

For each module, a test asserting: the exported token object's shape matches real source's own top-level keys exactly (e.g. `root`, `icon`, or whatever that specific module's real top-level keys are — do not assume `{root, icon}` uniformly, confirm per module), and every `{token.path}`-style string value is a syntactically valid reference resolvable against `base.ts`'s own exported shape (a small helper test utility walking both objects and cross-checking paths is acceptable and reusable across all 25 — write it once, in a shared test-utils file if this package doesn't already have one for this purpose).

- [ ] **Step 3: Author each module**

Port each of the 25 modules following `checkbox.ts`'s own established doc-comment convention (cite the exact `.vendor-extracted/` path, note whether the module has a `colorScheme` split or not, transcribe values as references where real source uses references, literals where real source uses literals).

- [ ] **Step 4: Export from the preset's own index**

Register each new module in `auraPreset.components` in `packages/themes/src/presets/aura/index.ts`, matching the existing 5's real pattern (import + `components` key named as upstream's preset key, e.g. `radiobutton`), and add a `themes.json` provenance entry per new file (corrected 2026-10-01; originally "add each new module's named export"). Record the themes bundle size and the CSS emitted by `applyUltimateTheme` before and after.

- [ ] **Step 5: Tests, package suite, dependency ceiling**

`pnpm --filter @ultimate/themes test`, the themes typecheck/build, `pnpm run ceiling:validate` (corrected 2026-10-01: originally also `pnpm test`; full-monorepo runs have pre-existing unrelated failures).

---

### Task 2: Overlay family preset modules (6 modules)

**Files:** create `packages/themes/src/presets/aura/{popover,drawer,context-menu,confirm-dialog,confirm-popup,overlay-badge}.ts` + tests. Same Steps 1-5 pattern as Task 1, for the 6 real Prime modules (`popover`, `drawer`, `contextmenu`, `confirmdialog`, `confirmpopup`, `overlaybadge`).

---

### Task 3: Navigation family preset modules (11 modules)

**Files:** create `packages/themes/src/presets/aura/{breadcrumb,mega-menu,menubar,panel-menu,tiered-menu,tabs,stepper,steps,dock,speed-dial,split-button}.ts` + tests. Same pattern, for the 11 real Prime modules listed in the sequencing table's Batch 1 §3.3 row.

---

### Task 4: Panel/Layout/Display/Feedback family preset modules (25 modules)

**Files:** create `packages/themes/src/presets/aura/{accordion,avatar,block-ui,card,carousel,chip,divider,fieldset,galleria,image,image-compare,inplace,message,meter-group,panel,progress-bar,progress-spinner,scroll-panel,skeleton,splitter,tag,terminal,timeline,toolbar,toast}.ts` + tests. Same pattern, for the 25 real Prime modules in the sequencing table's Batch 1 §3.4 row.

---

### Task 5: Vue InlineMessage preset module

**Files:** create `packages/themes/src/presets/aura/inline-message.ts` + test. Same pattern, real Prime's `inlinemessage` module.

---

### Task 6: Data family preset modules (3 modules)

**Files:** create `packages/themes/src/presets/aura/{order-list,pick-list,data-view}.ts` + tests. Same pattern, real Prime's `orderlist`/`picklist`/`dataview` modules.

---

### Task 7: OrganizationChart preset module

**Files:** create `packages/themes/src/presets/aura/organization-chart.ts` + test. Same pattern, real Prime's `organizationchart` module. **Framework note (documentation only, no code implication for this Plan):** this component exists only in React/Vue (DECISION-D excludes Angular) — the preset module itself is framework-neutral (the shared `@ultimate/themes` package), so this task's own scope is identical regardless; only the eventual component-wiring step (explicitly out of this Plan's scope, per Global Constraints) would ever differ by framework.

---

## Completion Criteria

- All 7 tasks' new preset modules exist, are exported from `packages/themes/src/presets/aura/index.ts`, and pass their own shape/token-path-resolution tests.
- `base.ts` is byte-identical to its pre-plan state (verify via `git diff`).
- No `material/`, `lara/`, or `nora/` directory exists anywhere in `packages/themes/src/presets/` after this plan (verify via `git status`/directory listing).
- `pnpm --filter @ultimate/themes test` and `pnpm run ceiling:validate` pass after each task (corrected 2026-10-01: originally `pnpm test`).
- Every new preset file has a `themes.json` provenance entry.
- `input-mask.ts`, `tab-view.ts` and `tab-menu.ts` do not exist (2026-10-01 decisions).
- `editor.ts`, `tree.ts`, `treeselect.ts`, `treetable.ts`, and `ripple.ts` do not exist anywhere in `packages/themes/src/presets/aura/` after this plan.

## Unresolved, Carried Forward (Not Silently Closed)

- **Wiring each new preset module into its corresponding component's own style file** — explicitly out of this Plan's own scope (Global Constraints), required before any component actually becomes re-themeable via the new modules. This is real, substantial follow-up work this Plan does not authorize.
- **`ripple`'s inclusion/exclusion** — genuinely undecided, flagged for Plan Review.
- **Upstream `tabview` and `tabmenu` modules** (added 2026-10-01) — not ported; needed when React's `UTabView`/`UTabMenu` are wired to tokens.
- **InputMask** (added 2026-10-01) — no upstream module; upstream InputMask uses `inputtext` tokens, which Task 1 ports.
- **Unmapped components with upstream modules** (added at closeout 2026-10-01, user decision — tracked in GAP-064, no new GAP): `badge` (ng/vue), `inputgroup` (ng/vue `input-group`), `paginator` (all three) — neither in the sequencing table nor in its out-of-scope list.
- **Bundle size baseline** — see item (7) above; handled when the branch merges.
- **Any Ultimate component built after Batch 3** (if any exist by the time this Plan executes) that has no corresponding entry in the sequencing table above — this Plan's own mapping was computed against the migration batches' own text as they existed at Spec-authoring time; if new components have shipped since, they are not covered here and would need their own follow-up task.

## Documentation/Ledger Updates

Upon Final Review/Closeout: update GAP-064's own status in `docs/architecture/BLUEPRINT_GAPS.md` to reflect partial resolution (Batches 1-3 covered; wiring and `ripple` still open) — not full RESOLVED, since this Plan does not close the gap in full. Not performed by this plan document.
