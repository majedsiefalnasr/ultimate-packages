# GAP-070 characterization: Angular secondary entry points vs the ng-packagr crash (2026-10-01)

**Status:** dated research snapshot (AGENTS.md §2 tier 6). Authoritative for what was true at `a869ad5`; re-confirm before relying on it later.
**Context:** Existing Commitments Plan Task 6 (`docs/superpowers/plans/2026-09-27-prime-parity-existing-commitments.md`), after the build prerequisites TS2729 (`4a47883`) and `@angular/cdk` as a peer dependency (`29a3390`). Produced by a characterization run and independently re-verified (spot-rebuilds of 10 passes and 8 failures, the combined build, minimal probes). Ledger: `.superpowers/sdd/2026-09-27-prime-parity-existing-commitments/progress.md`.

## Result

75 candidates: **61 build as their own secondary entry point, 14 fail.** Every failure is the same crash; there are no other build errors.

## Trigger condition (corrected by the independent review)

ng-packagr compiles each secondary entry with `rootDir` set to that entry file's own directory (`ng-packagr/src/lib/ts/tsconfig.js:108`). **Any source file outside the entry's own `src/<name>/` directory that the entry's compilation reaches is outside `rootDir` and fails with TS6059.** For a plain `.ts` file the TS6059 diagnostic is reported normally. When the out-of-directory file is an Angular `@Component`, formatting that diagnostic crashes in Angular's `ShimReferenceTagger` handling with `Cannot destructure property 'pos' of 'file.referencedFiles[index]' as it is undefined`, whether or not the imported component is itself a secondary entry point or barrel-exported.

This is broader than GAP-009's recorded wording (one secondary entry point directly importing another secondary entry point's root class), which described the subset observed at the time. Evidence:

- Every one of the 14 failures, and GAP-009's excluded five, has a relative import into another component directory; none of the 61 passes, or the existing 9, has one.
- An entry that only re-exports `UListbox` from `../listbox/listbox` crashes, while a trivial entry passes.
- A plain (non-component) sibling module produces a normal TS6059 instead of the crash.

## Environment and method

- Scratch git worktree of HEAD `a869ad5`, installed with `pnpm install --frozen-lockfile --offline` under Node 24.15; removed afterwards. ng-packagr builds ran under Node 23.11. Tool versions: `ng-packagr@21.2.7`, `@angular/compiler-cli@21.2.22`, `typescript@5.9.3`. The `@ultimate/ng` workspace dependencies were built first.
- Entry-point shape: each candidate got `packages/ng/<name>/ng-package.json` with `$schema ../node_modules/ng-packagr/ng-entrypoint.schema.json` and `lib.entryFile ../src/<name>/index.ts`, identical in shape to the existing 9. Builds ran `ng-packagr -p ng-package.json` from `packages/ng` (the package's own `build` script).
- Baseline (existing 9 only): exit 0, 10 entry points, about 5 s, 20 "conflicting export condition" warnings.
- Runs (all real ng-packagr builds):
  1. **All 75 candidates at once:** exit 1 at the first failing entry (`confirm-dialog`); ng-packagr stops at the first failure, so this run gives no per-candidate verdicts.
  2. **One build per candidate (75 builds):** the existing 9 plus only that candidate, 3–6 s each. **Every verdict below comes from this run.**
  3. **Solo confirmation of every failure (14 builds):** only the primary entry plus the candidate (existing 9 removed). All 14 failed again identically.
  4. **Combined final set:** the existing 9 plus all 61 passes: exit 0, 71 entry points, about 11–12 s, 142 warnings (71 × types/default).
  5. **Minimal probes:** a trivial entry passed; an entry re-exporting `UListbox` from `../listbox/listbox` crashed although `listbox` was not a secondary entry in that build.
- Crash site: `typescript.js:126740` (`({ pos, end } = file.referencedFiles[index])`), with Angular's `ShimReferenceTagger` (`@angular/compiler-cli/bundles/chunk-XMX6JBER.js:9291`, `originalReferencedFiles` at :9314–9317) having rewritten `sf.referencedFiles`. The message is identical to the one recorded for GAP-009.

## Candidates

`packages/ng/src/` contains 89 directories, all components or directives (each with an `index.ts`):

- **Existing 9 secondary entries (not re-tested):** autofocus, badge, checkbox, fluid, input-number, paginator, ripple, scroller, tooltip.
- **GAP-009's excluded 5 (not re-tested):** button, dialog, menu, table, input-text.
- **75 candidates:** accordion, animate-on-scroll, autocomplete, avatar, avatar-group, block-ui, breadcrumb, button-group, card, carousel, cascade-select, chip, color-picker, confirm-dialog, confirm-popup, context-menu, data-view, date-picker, divider, dock, drawer, dynamic-dialog, fieldset, file-upload, float-label, galleria, icon-field, ifta-label, image, image-compare, inplace, input-group, input-mask, input-otp, key-filter, knob, listbox, mega-menu, menubar, message, meter-group, multi-select, order-list, overlay-badge, panel, panel-menu, password, pick-list, popover, progress-bar, progress-spinner, radio-button, rating, scroll-panel, scroll-top, select, select-button, skeleton, slider, speed-dial, split-button, splitter, stepper, steps, style-class, tabs, tag, terminal, textarea, tiered-menu, timeline, toast, toggle-button, toggle-switch, toolbar.

## Characterization table

"iso" = existing 9 plus the candidate; "solo" = primary entry plus the candidate. Every failure is the crash above.

### Failures (14)

| Component      | iso  | solo | Triggering import                                                   | Import target a secondary entry?                                    |
| -------------- | ---- | ---- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| confirm-dialog | FAIL | FAIL | `confirm-dialog.ts:12` `../button/button`; `:13` `../dialog/dialog` | No (excluded 5)                                                     |
| confirm-popup  | FAIL | FAIL | `confirm-popup.ts:16` `../button/button`                            | No (excluded 5)                                                     |
| data-view      | FAIL | FAIL | `data-view.ts:14` `../paginator/paginator`                          | Yes in iso, no in solo                                              |
| drawer         | FAIL | FAIL | `drawer.ts:13` `../button/button`                                   | No (excluded 5)                                                     |
| dynamic-dialog | FAIL | FAIL | `dynamic-dialog.ts:4` `../dialog/dialog`                            | No (excluded 5)                                                     |
| file-upload    | FAIL | FAIL | `file-upload.ts:15` `../progress-bar/progress-bar`                  | **No** (progress-bar itself passes)                                 |
| order-list     | FAIL | FAIL | `order-list.ts:19` `../listbox/listbox`                             | **No**                                                              |
| overlay-badge  | FAIL | FAIL | `overlay-badge.ts:3` `../badge/badge`                               | Yes in iso, no in solo                                              |
| panel          | FAIL | FAIL | `panel.ts:13` `../button`                                           | No (excluded 5)                                                     |
| pick-list      | FAIL | FAIL | `pick-list.ts:25` `../listbox/listbox`                              | **No**                                                              |
| scroll-top     | FAIL | FAIL | `scroll-top.ts:19` `../button`                                      | No (excluded 5)                                                     |
| select-button  | FAIL | FAIL | `select-button.ts:13` `../toggle-button/toggle-button`              | **No**                                                              |
| split-button   | FAIL | FAIL | `split-button.ts:11` `../button`; `:12` `../menu`                   | No (excluded 5)                                                     |
| textarea       | FAIL | FAIL | `textarea.ts:14` `../fluid/fluid`                                   | Yes in iso, no in solo (same shape as GAP-009's input-text → fluid) |

### Passes (61)

Each built in its own iso build and again in the combined 71-entry build (iso build seconds in parentheses):

accordion (5), animate-on-scroll (5), autocomplete (4), avatar (5), avatar-group (5), block-ui (5), breadcrumb (5), button-group (4), card (5), carousel (4), cascade-select (5), chip (4), color-picker (4), context-menu (4), date-picker (4), divider (4), dock (4), fieldset (5), float-label (4), galleria (4), icon-field (4), ifta-label (4), image (5), image-compare (5), inplace (4), input-group (5), input-mask (5), input-otp (4), key-filter (5), knob (5), listbox (4), mega-menu (4), menubar (4), message (5), meter-group (4), multi-select (4), panel-menu (4), password (4), popover (4), progress-bar (4), progress-spinner (4), radio-button (4), rating (4), scroll-panel (4), select (4), skeleton (4), slider (4), speed-dial (5), splitter (4), stepper (5), steps (5), style-class (4), tabs (4), tag (4), terminal (5), tiered-menu (4), timeline (5), toast (6), toggle-button (6), toggle-switch (5), toolbar (5).

## Consequences recorded at characterization time

- **Combined build:** each passing subpath emits its `fesm2022` bundle and `types` declarations, and a scratch consumer type-checks all 70 subpaths under Bundler and NodeNext.
- **Advertised but unbuildable:** 11 subpaths in `packages/ng/package.json` `exports` point at artifacts that can never be built: `./textarea`, `./select-button`, `./file-upload`, `./split-button`, `./drawer`, `./confirm-dialog`, `./confirm-popup`, `./dynamic-dialog`, `./overlay-badge`, `./panel`, `./scroll-top`. `data-view`, `order-list`, `pick-list` and GAP-009's excluded five are not advertised.
- **CI pack/install integrity:** `scripts/provenance/pack-install-integrity.mjs` (CI step "Pack/install integrity (affected)") fails for `@ultimate/ng` on missing export paths: 144 at `a869ad5` (72 unbuilt subpaths × 2); 22 if only the 61 are added and the 11 kept.
- **Generated `dist/package.json`:** copies the hand-written exports including unbuilt subpaths and points `main`/`types` at nested `dist/dist` paths. Publishing (`changeset publish`, `files` including `dist`) and the playground resolve through the hand-written `packages/ng/package.json`, so its `types`/`default` conditions stay despite ng-packagr's "conflicting export condition" warnings.
- **Dual instances:** the primary `@ultimate/ng` bundle contains every component's code and does not import its subpaths, so using both `@ultimate/ng` and a `@ultimate/ng/<name>` subpath loads two copies of a class (pre-existing for GAP-009's nine; widened by adding the 61).
