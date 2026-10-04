# GAP-083 Vue floor closeout — `feature/gap-083-vue-floor-compat`

**Date:** 2026-10-04
**Range:** research and ADR-050 `6449248`; Spec `e99e871`; Plan `409ad41`; implementation `00fa270..269ac6e` (5 commits) on a branch from `main` `770d44e`.
**Status:** closeout recorded. Merge and push await user authorization. Nothing merged or pushed.

## Outcome

All five implementation Plan tasks are complete. The final whole-branch review (`770d44e..46e743e`) found no Critical issues and one Important issue. That issue and one Minor finding re-graded to Important were fixed in `269ac6e`, each verified red then green.

| GAP                                         | Status   | Delivered by                                          |
| ------------------------------------------- | -------- | ----------------------------------------------------- |
| GAP-083 Vue 3.5.0 declaration compatibility | RESOLVED | `00fa270`, `08e2dc4`, `47e90ff`, `46e743e`, `269ac6e` |

Delivered, per ADR-050:

- **Floor.** `peerDependencies.vue` of `@ultimate/vue` and `@ultimate/vue-core` is `^3.5.2`. The compatibility manifest's Vue `frameworkVersionRange` is `^3.5.2`, so the CLI and MCP report the same floor.
- **Floor check.** `packages/vue`'s `validate` runs the consumer type-check twice:
  - a **workspace** pass at the workspace-installed Vue (3.5.42);
  - a **floor** pass at the floor version.

  The floor is derived by `packages/vue/scripts/vue-floor.mjs` from both peer ranges and the manifest range, which must be one identical `^X.Y.Z` range or the check fails naming every range.

  Each pass runs in its own consumer directory with its own install. It verifies the installed `vue` version, imports every public export of both packages (94 + 1), and runs the fixtures and the props invariant under `Bundler` and `NodeNext`. An error inside one pass fails only that pass, under its label.

- **Tests.**
  - `packages/vue/test/vue-floor.test.ts`: 13 tests, including one that requires the repository's real floor statements to be `^3.5.2`.
  - MCP: 3.5.2 compatible, 3.5.1 incompatible.
  - The CLI `init` fixture sits on the floor (`^3.5.2`).
- **Documents.** `COMPATIBILITY.md`, `DEPENDENCIES.md` and both READMEs state Ultimate's supported floor. They note that PrimeVue 4.5.5 declares `^3.5.0` through `@primevue/core`. MIGRATION §8 records the peer-range change.
- **Unchanged:** component source, runtime output, the declaration build, `.github/workflows/ci.yml`, `devDependencies.vue`, the playground's `vue` range and the lockfile.

## Verification

All commands ran with Node 24.15.0 and pnpm 9.6.0.

- **Negative controls** (`08e2dc4`, before the floor was raised):

  | Floor                    | Workspace pass | Floor pass       | TS2707 (`@ultimate/vue` / `@ultimate/vue-core`) |
  | ------------------------ | -------------- | ---------------- | ----------------------------------------------- |
  | `3.5.0`                  | OK, both modes | FAIL, both modes | 396 (366 / 30)                                  |
  | `3.5.1` (temporary edit) | OK, both modes | FAIL, both modes | 396 (366 / 30)                                  |

- **Floor raised** (`47e90ff`): `validate` exit 0 with four OK lines, workspace 3.5.42 and floor 3.5.2, each in `bundler` and `nodenext`. Every line reports 94 + 1 entry points, 88 prop-bearing components, 661 runtime prop keys and 16 propless components.
- **Cost** (`--diagnostics`): 19 s wall clock for the whole check.

  | Pass, mode                 | Memory   | Check time | Total time |
  | -------------------------- | -------- | ---------- | ---------- |
  | workspace 3.5.42, bundler  | 443,565K | 3.09 s     | 3.96 s     |
  | workspace 3.5.42, nodenext | 490,649K | 2.51 s     | 2.91 s     |
  | floor 3.5.2, bundler       | 500,003K | 2.64 s     | 3.25 s     |
  | floor 3.5.2, nodenext      | 504,452K | 2.82 s     | 3.26 s     |

- **Guard proof** (temporary edit, `@ultimate/vue-core` `^3.5.13`): exit 1 with "Vue floor ranges must be one identical caret range ^X.Y.Z; got @ultimate/vue peerDependencies.vue=^3.5.2, @ultimate/vue-core peerDependencies.vue=^3.5.13, compatibility-manifest.json vue frameworkVersionRange=^3.5.2".
- **Floor equal to the workspace version** (temporary edit, all three `^3.5.42`): exit 0 and four OK lines. Both passes ran.
- **Pass isolation** (`269ac6e`, temporary injected error): before the fix, an error in the workspace pass aborted the run and the floor pass never ran. After the fix:
  - error in the workspace pass: `FAIL (workspace vue 3.5.42): injected failure`, floor pass OK in both modes;
  - error in the floor pass: workspace pass OK in both modes, `FAIL (floor vue 3.5.2): injected failure`;
  - exit 1 in both cases.
- **Build output:** `packages/vue/dist` (575 files) and `packages/vue-core/dist` (3 files) are identical to a build of `main` `770d44e`.
- **Suites and gates** (after the fixes):
  - `@ultimate/vue` 911/911 (898 + 13);
  - `@ultimate/vue-core` 96/96;
  - `@ultimate/cli` 70/70;
  - `@ultimate/mcp` 49/49;
  - `compatibility-manifest:validate` 5/5;
  - `integrity:pack-install @ultimate/vue` OK;
  - `@ultimate/vue` and `@ultimate/vue-core` typecheck OK;
  - `pnpm install --frozen-lockfile` OK, with no lockfile change.
- **Lint and format:** eslint is clean on the changed code. Prettier is clean on every changed file except `DECISIONS.md` and `packages/mcp/test/tools/check-framework-compatibility.test.ts`, which already failed on `main`; their changed lines are formatted.
- **Floor agreement (Spec criterion 9):** `validate` enforces agreement of the three machine-readable statements, and the CLI and MCP tests read the real manifest. The documents were checked with `git grep -nE '\^3\.5\.0' -- ':!pnpm-lock.yaml' ':!docs/superpowers' ':!docs/architecture/research'`. The only remaining matches are:
  - the GAP-083 registry text;
  - the PrimeVue wording in `COMPATIBILITY.md:19` and `DEPENDENCIES.md:12`;
  - ADR-042 and ADR-050;
  - the new MIGRATION note;
  - synthetic inputs in `vue-floor.test.ts`.

  None of them states Ultimate's floor as `^3.5.0`.

## Verification boundary

- The real CI run happens only on push.
- The `ci` job stays red because of inherited debt and the open items from GitHub run `37188652979`. GAP-083 is judged by its own "Validate generated artifacts" step.

## Accepted rulings

1. Temporary edits were reverted with a reverse `sed` instead of `git checkout --`, which the shell hook blocks. Each revert was confirmed by `git status`.
2. One reverse `sed` also changed `@ultimate/vue-core`'s `devDependencies.vue` from `^3.5.13` to `^3.5.2`. It was restored at once and the tree confirmed clean. Later temporary edits used line-addressed `sed`.
3. Task 2's completion was recorded by hand, because its verification is an expected-failing run (the floor was still `^3.5.0`).
4. The final review's Minor finding on the PrimeVue wording was re-graded to Important. It was a false statement in a maintained document that contradicted ADR-042, and it was fixed in `269ac6e`.
5. The output label `OK (floor vue 3.5.2, bundler)` names the pass, so it is a superset of the Spec §5.2 example `OK (vue 3.5.2, bundler)`.

## Deferred items (non-blocking)

- `vue-floor.test.ts` fixtures do not remove their temporary directories.
- The installed-version check reads the consumer's top-level `vue`. It does not also read the `vue` resolved from each package's own `.pnpm` location. These are the same today through peer linking, and the negative controls prove resolution reaches the requested version.
- No `resolveVueFloor` test covers all three ranges missing. That case is correct today through the range regex.
- The execution ledger is git-ignored: `.superpowers/sdd/2026-10-04-gap-083-vue-floor/progress.md`.

No new GAPs were created. GAP-064 is untouched.
