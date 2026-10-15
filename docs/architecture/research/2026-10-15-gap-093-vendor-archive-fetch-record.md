# GAP-093 — Vendor archive fetch: CI evidence and direct-to-main push record

**Date:** 2026-10-15
**Type:** Point-in-time evidence record. It does not change the GAP-093 status in `BLUEPRINT_GAPS.md`; that belongs to a separate closeout.
**Change:** `efd677fd` `fix(provenance): fetch pinned vendor archives for self-tests (GAP-093)`, per the [Spec](../../superpowers/specs/2026-10-15-gap-093-vendor-archive-fetch-design.md) and [Plan](../../superpowers/plans/2026-10-15-gap-093-vendor-archive-fetch.md). Spec Review, Plan Review and code review each passed with changes; the findings were applied.

## 1. Process deviation: pushed to `main` without a PR

`efd677fd` reached `origin/main` as a fast-forward from `bdc4dbcf`, without a pull request.

- **Cause:** the global git setting `push.default=upstream`. The work branch was created with `git worktree add -b fix/gap-093-vendor-archives … origin/main`, which set its upstream to `origin/main`. The command `git push -u origin fix/gap-093-vendor-archives` therefore updated `main` (`fix/gap-093-vendor-archives -> main`).
- **Content:** the push carried only the reviewed GAP-093 commit. The husky pre-push hook (build, typecheck, test) passed before the push.
- **Decision:** the user chose to keep the commit on `main` and record the deviation (2026-10-15). No history rewrite, no revert.
- **Prevention:** upstream tracking was removed from the other work branches. New worktrees are created with `--no-track` and pushed with an explicit `<branch>:<branch>` refspec.

## 2. CI comparison

| Step / job                                  | Baseline [38730856573](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38730856573) at `bdc4dbcf` | [38737652296](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38737652296) at `efd677fd` |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Fetch pinned vendor archives                | (step did not exist)                                                                                                | success                                                                                                    |
| Provenance scripts self-tests               | failure (`tar` cannot open `.vendor-cache/primereact-10.9.9.tar.gz` / `primevue-4.5.5.tar.gz`)                      | **success**                                                                                                |
| Provenance validation                       | failure (GAP-094)                                                                                                   | failure (GAP-094, unchanged, inherited)                                                                    |
| Browser `ng`                                | G3-D failure (GAP-097)                                                                                              | G3-D failure (inherited)                                                                                   |
| Browser `vue`                               | G3-B U2 and G3-D failures                                                                                           | same (inherited)                                                                                           |
| Browser `react`, SSR ng/react/vue           | success                                                                                                             | success                                                                                                    |
| Release run (`38730856595` → `38737652233`) | Select mode failure (GAP-087)                                                                                       | same; Version/Publish skipped                                                                              |

No regression is attributable to the change. The self-test step turned green, and every remaining failure is present in the baseline run.

## 3. Local verification (Node 24.15.0)

- `fetch-vendor-cache.test.mjs`: 6/6 pass.
- `pnpm run vendor:fetch -- primereact primevue` on an empty cache fetched both archives, and a rerun reported both as present. The hashes match `checksums.json`: `9598e1e3…8ecf` and `f34c320e…546d`.
- The real-extraction cases in both extraction test files pass.
- `pnpm run lint` and `pnpm run format:check` are clean.
- `pnpm run test:scripts` failed locally only in the two pack-install "real run" cases. Those cases need built `dist` output; CI builds first, and they pass in both CI runs.
