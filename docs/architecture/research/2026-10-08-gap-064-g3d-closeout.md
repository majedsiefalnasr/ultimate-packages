# GAP-064 G3-D closeout — `feature/gap-064-g3d-overlays-composites`

**Date:** 2026-10-08
**Range:**

- Research (F3 Overlays + F8 Composites) and decisions D-D1..D-D7: `4eaceb3`, merged into the branch at `c5e7626`.
- Spec: `314b7bf`, with the Spec Review decisions OI-D1..OI-D4 in `f56f39f` (§16) and the gate results in `63b68c7` (§17).
- Plan: `89626ae` (12 tasks), with the Plan Review decisions PR-1..PR-4 in `ef059d8`.
- Implementation: `efb3f59` through `fc8efad`, plus the final-review corrections in `56b1992`, on a branch from `main` `c567039`.

**Status:** closeout recorded on the feature branch. GAP-064 stays **PARTIAL**: G3-B, G3-C1, G3-C2 and G3-D are complete; G3-E remains open. Nothing is merged or pushed: merge to `main` and push each need a separate user decision. The git-ignored evidence directory `.superpowers/sdd/2026-10-07-gap-064-g3d-overlays-composites/` (ledger `progress.md`, Docker logs, gate data, review package, final-review report) is kept.

## Outcome

G3-D (families F3 Overlays and F8 Composites) is complete:

- **Scope.** 6 Aura keys: confirmdialog, confirmpopup, drawer, popover, splitbutton and speeddial, in 6 Angular and 6 Vue style modules.
- **Key renames (ADR-051).** `confirm-dialog` → `confirmdialog`, `confirm-popup` → `confirmpopup`, `split-button` → `splitbutton`, `speed-dial` → `speeddial`, at **8 sites** (Angular 4, Vue 4). `drawer` and `popover` were unchanged.
- **Port.** Each style module's `css` is the applicable `@primeuix/styles` 2.0.3 structural CSS, with selectors mapped to the existing Ultimate DOM. It is generated from a committed upstream fixture by `packages/themes/test/utils/g3d-port.mjs`, in the module order D3 → D1 → D4 → D5.
- **Data model, per framework.** Of 77 upstream groups, **34 are ported and 43 omitted** (Spec §5):

  | Key           | Upstream | Ported | Omitted |
  | ------------- | -------- | ------ | ------- |
  | confirmdialog | 2        | 2      | 0       |
  | confirmpopup  | 13       | 6      | 7       |
  | drawer        | 33       | 12     | 21      |
  | popover       | 9        | 2      | 7       |
  | splitbutton   | 10       | 5      | 5       |
  | speeddial     | 10       | 7      | 3       |

- **D5 rules.** R-D1 retained (D-D3c fallback). Gate G-D1 kept R-D2, R-D3 and R-D4 and dropped R-D5 (Spec §17).
- **Defect corrections.** F-D1: the SpeedDial trigger is reachable by a real click and closed actions are hidden and non-interactive. F-D2: ConfirmDialog content styling reaches the dialog. F-D3: the Angular Drawer content grows to fill the drawer.
- **Visual baselines.** 108 Docker baselines; 102 updated after user review of all 12 component × framework groups (2026-10-08). ConfirmDialog Default is unchanged.
- **Accessibility.** 66 pre-existing rows recorded in `docs/architecture/research/2026-10-07-gap-064-g3d-accessibility-preexisting.md`. 36 introduced SpeedDial `region` rows were accepted into `ACCESSIBILITY_BASELINE.md` as environmental (the action items are itemised because R-D2 now hides the `visible: false` item).
- **Size (AC9).** Angular fesm2022 total 326456 → 327557 B (+0.34%), Vue `dist/index.mjs` 142613 → 143201 B (+0.41%). The 15% gate passes.
- **CI.** The strict scan excludes `G3-D`; three G3-D steps run the verification specs, the differential validator `scripts/provenance/validate-g3d-accessibility.mjs` and the report upload.
- **Consumer-visible changes:** `docs/architecture/MIGRATION.md` §8, "Added for GAP-064 G3-D" (wording approved by the user).

## User decisions during execution

- **PR-1 (Plan Review):** the D-0 anchoring check subtracts the overlay's computed `margin-block-start` (the ported gutter). Test-contract correction; no parity exception.
- **PR-2..PR-4:** SpeedDial `Directions` story layout scaffolding; MIGRATION scope; Vue Drawer left coverage reuses `Default`.
- **G-D3 (2026-10-07):** the Angular Drawer wrapper is compared with the drawer's inner box (`clientHeight`), which the D-D7 rule governs; the outer box also holds the ported borders. 24/24 after the correction.
- **R-D4 (2026-10-07):** kept. R-D5 dropped (no difference in any engine).
- **X-1 reach (2026-10-07):** a reach-only Vue `WithFooter` Drawer story supplies the footer slot (option A); no screenshot.
- **Screenshots and accessibility (2026-10-08):** all 12 groups approved; the 36 `region` rows accepted with the environmental tag.
- **MIGRATION wording (2026-10-08):** approved as-is.
- **Known failure retained (2026-10-08):** see "Known failure" below.

## Known failure (retained, user decision 2026-10-08)

`Drawer full and RTL G3-D layout` fails in all three engines in both frameworks, so the CI step "Run G3-D verification specs" stays red until GAP-097 is resolved:

- Viewport 1280 × 720; drawer outer box 1280 × 722; inner box 1278 × 720; `box-sizing: content-box`, 1 px border.
- Cause: the faithful port of `height: 100vh !important` with a 1 px border, without upstream's global `border-box`.
- Neither the product nor the assertion was changed. Because the test stops at this assertion, its RTL half (mask `flex-direction: row-reverse`) does not run in CI. The user accepted this for the closeout. A temporary, uncommitted probe ran the same RTL assertions: 6/6 pass in Docker. It also showed that a `left` Drawer still renders at the physical left in RTL (x = 0); MIGRATION.md says so.

## Test-contract audit (2026-10-08)

The user asked for an audit of every check change made after a failure. No change weakens, bypasses or relocates a check:

- `693e7b1`: `resolved()` polls until the `--u-` variable is defined (same expectation); the SpeedDial x3b test waits for the open transition before measuring (adds a precondition); STORIES ids are literals (the id, ready and state list is identical in both frameworks).
- `af68cb0` (PR-1) and `63b68c7` (G-D3) are the two user-authorized contract corrections.
- The shared harness (Playwright config, envelope helper, earlier validators) has no change, and no baseline changed outside Task 11.

## Final review (2026-10-08)

Whole-branch review of `c567039..fc8efad`: **APPROVE WITH NITS** (0 critical, 0 important, 6 minor). It confirmed the fixture is byte-identical to the pinned tarball, the counts, order, `KEPT` and the SpeedDial mask cascade, the eight renames, the frozen G3-A..G3-C2 tooling, the CI change and provenance coverage.

- **Fixed in `56b1992`:** M1 validator header comment; M2 gate comment for R-D4; M3 provenance descriptions (unit-spec coverage, Vue drawer wrapper rule, per-component F-D corrections). Comments and docs only; the validator self-test (9/9) and fidelity test (59/59) pass after the change.
- **Recorded, not changed:**
  - M4: MIGRATION.md says ConfirmDialog "right-aligns its footer buttons"; that rule already existed before G3-D (kept as R-D3). The wording is user-approved as-is.
  - M5: the known failure, recorded above.
  - M6: Prettier added a trailing comma to the existing Angular ConfirmDialog `Default` story template (Spec §9.1 says existing stories are unchanged). It has no behavioural effect; reverting it would fail the format check.

## Verification (fresh, `--retries=0`, at `fc8efad`, 2026-10-08)

| Check                                                     | Result                                                                                                          |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Unit: ng / vue / themes                                   | 1174 / 1176 / 954 pass                                                                                          |
| Typecheck (all packages)                                  | OK                                                                                                              |
| Fidelity test                                             | 59/59                                                                                                           |
| `test:scripts`                                            | 159/160; `pack-install-integrity` real run fails in `pnpm install --no-lockfile` (environmental, as G3-C2 R-18) |
| Docker `d` (G3-D, 6 projects)                             | 318 passed; 6 failed = the known Drawer full check                                                              |
| Docker `regression` (all other specs, 9 projects + 3 SSR) | 2127 passed; 1 failed = U2 (Vue Card WithHeaderAndFooter, WebKit, inherited)                                    |
| D-0 and C2-0 specs (in `regression`)                      | 21/21                                                                                                           |
| CI simulation strict: ng / vue / react                    | 330 / 282 / 216 pass; baseline checks OK                                                                        |
| CI simulation G3-A..G3-C2                                 | all validators OK; only U2 fails (Vue G3-B run)                                                                 |
| CI simulation G3-D run / validator                        | 159/162 per framework (3 × Drawer full); validator OK, 51/51 each, 0 introduced                                 |
| Size                                                      | Angular +0.34%, Vue +0.41%                                                                                      |

## Remaining GAP-064 scope

G3-E (F6 + F7). GAP-064 stays PARTIAL.

## New gaps (registered at this closeout; separately authorized follow-ups, not G3-D scope)

- **GAP-096** — SpeedDial's action list is in normal flow, so a closed SpeedDial occupies layout space (~192 px displacement for the four-action vertical dial).
- **GAP-097** — Drawer sizing under `content-box`: the content area overflows the drawer by its padding, and a `full` Drawer is 2 px taller than the viewport. It owns the known G3-D CI failure.

## Inherited, not G3-D

U2 (Vue Card WebKit screenshot), the `test:scripts` pack-install environmental failure, and GAP-087..GAP-094 CI debt.
