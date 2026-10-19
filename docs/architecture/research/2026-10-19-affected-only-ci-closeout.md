# Affected-Only CI — closeout record (2026-10-19)

**Status:** Closeout record for the Affected-Only CI work (Plan Task 7). It records evidence only. It changes no workflow, script, setting or GAP status. This record's own PR is the AC6 evidence, because the PR changes only this Markdown file. AC6 is met (§3).

**Records:** research `2026-10-19-affected-only-ci-research.md`; Spec `docs/superpowers/specs/2026-10-19-affected-only-ci-design.md` (revision 2, Amendment A1); Plan `docs/superpowers/plans/2026-10-19-affected-only-ci.md` (revision 2); ADR-069.

## 1. What landed

- [PR #46](https://github.com/majedsiefalnasr/ultimate-packages/pull/46), head `3f983b13`, merged with the user's authorization as merge commit `49a5242c` into `develop`. Its parents are `2b93c2e2` and `3f983b13`. The merge tree equals the PR head plus PR #45's change to the Gitflow closeout record.
- Branch commits:
  - `6d6ab200`: classifier;
  - `c3227fed`: `affected-packages` widening;
  - `d6cd6482`: `ci` step gates;
  - `da972ade`: Browser track-a scope;
  - `9a326d8c`: ADR-069 and records;
  - `3f983b13`: final-review fix, Spec Amendment A1.

## 2. Local verification (before push)

- Classifier tests: 15/15.
- `test:scripts`: 302/302.
- Scope-gate check (Spec AC3 and R4): all pass.
- `actionlint`: no errors.
- `pnpm run lint`, `prettier --check .` and `agents-md-pointers:validate`: pass.
- Local `build && typecheck && test`: pass.
- The pre-push hook passed on Node 24.15.0.
- Final whole-branch review by a fresh reviewer: 0 Critical, 0 Important, 5 Minor. One Minor was re-graded to Important and fixed: ADR-069 had overstated push runs (Spec A1).

## 3. GitHub runs

| Criterion                                                                              | Run                                                                                                  | Result                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC5: PR #46                                                                            | CI [39303955225](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39303955225)      | Classifier `event=pull_request scope=full frameworks=["ng","react","vue"]`. All 16 gated steps succeeded, with no step skipped. `ci` passed (6 min). `affected-packages` selected all 17 packages (the AO-4 widening), and pack/install integrity took 33 s. `ci-extended` failed only in its two known steps |
| AC5                                                                                    | Browser [39303955271](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39303955271) | `changes` reported full. track-a ng, react and vue passed. All three SSR jobs passed                                                                                                                                                                                                                          |
| AC7: push to `develop` `49a5242c`                                                      | CI [39308302796](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39308302796)      | Classifier `event=push scope=full`. `ci` passed (8 min) with 0 skipped steps. `affected-packages` selected 0 packages on the push, the documented ADR-069 limitation (Spec A1). `ci-extended` failed only in its two known steps                                                                              |
| AC7                                                                                    | Browser [39308302789](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39308302789) | track-a ng, react and vue passed. All three SSR jobs passed                                                                                                                                                                                                                                                   |
| AC6: [PR #47](https://github.com/majedsiefalnasr/ultimate-packages/pull/47), docs-only | CI [39318597948](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39318597948)      | Classifier `event=pull_request scope=docs frameworks=[]`. `ci` passed in **75 s**, with exactly the 16 gated steps skipped. Install, supply chain, Lint, Format and the fast validators ran. `ci-extended` failed only in its two known steps                                                                 |
| AC6                                                                                    | Browser [39318598082](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39318598082) | `changes` reported `scope=docs frameworks=[]`. `track-a-browser-visual-a11y` was skipped as one job, with no matrix expansion. All three SSR jobs ran and passed                                                                                                                                              |

The two known `ci-extended` failures are unchanged:

- the Bundle-size regression check (`component-metadata` +26.5%);
- Provenance validation (645 manifest problems, GAP-094).

## 4. Open items

- **Pack/install integrity on pushes** selects no package, because a push's diff against its own branch is empty. This predates ADR-069. Changing it needs a separate decision.
- **Deferred minors from the final review:**
  - `affected-packages` lists renames with `--name-only`;
  - a classifier crash makes later steps fail noisily;
  - `.changeset/*.md` counts as docs-only;
  - the CLI's main-module guard on percent-encoded paths.
- **Not started:** Phase 2; deferred S1–S7.
