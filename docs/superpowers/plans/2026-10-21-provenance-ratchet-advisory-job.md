# Provenance Ratchet for the Advisory CI Job Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** APPROVED — Plan Review passed (user, 2026-10-21), revision 2 (one branch and one PR, user, 2026-10-21). Spec revision 4 is approved and ADR-072 is accepted (user, 2026-10-21). The user asked to implement on the existing branch (2026-10-21); that is the authorization for Tasks 1–5 up to opening the PR. Each merge still needs the user's explicit authorization.

**Goal:** Make the Provenance validation step of the advisory CI job fail only on _new_ missing manifest entries, by comparing the validator's missing set with a committed known-missing list, so the job stops being red for debt that is already tracked (ADR-072, GAP-094).

**Architecture:**

- A new module, `scripts/provenance/known-missing.mjs`, holds the pure logic: validate the list's shape, then compare it with the missing set.
- `validate-provenance.mjs` gains `--known-missing <path>`. Without the flag its behaviour is unchanged.
- A generated JSON file, `docs/architecture/provenance/known-missing.json`, holds the 645 known entries.
- `ci.yml` passes the flag in the advisory job only. Records are updated last.

**Tech Stack:** Node 24.15.0 ESM, `node:test`, GitHub Actions YAML, `actionlint`, pnpm 9.6.0.

**Spec:** `docs/superpowers/specs/2026-10-21-provenance-ratchet-advisory-job-design.md` (revision 4). R1–R5 and AC1–AC7 are binding.

## Global Constraints

- **Branch:** everything, the docs and the implementation, lands on `docs/provenance-ratchet-advisory-job` in one PR against `develop` (user decision, 2026-10-21). It was created `--no-track` from `develop`. Node 24.15.0 is used in this checkout; the hooks already run here.
- **Push:** only with an explicit `src:dst` refspec. Each merge needs the user's explicit authorization.
- **Node:** prefix every `pnpm`/`node` command with `source ~/.nvm/nvm.sh && nvm use 24.15.0`.
- **Independent of this plan:** the Bundle-size baseline PR (`component-metadata`, +26.5%). It goes first (Spec §7). Nothing here depends on it, and AC5 is written for both orders.
- **Hands off:**
  - the production-scope classifier (`production-scope.mjs`), the diff check in `validate-provenance.mjs`, and every manifest file;
  - the `ci` job, `browser.yml`, `release.yml`, triggers, branch protection;
  - the Bundle-size, coverage and other advisory steps;
  - any backfill of manifest entries.
- **The list is never edited by hand to make a failure pass.** It is generated once (Task 3). Later changes only delete lines.

## Review Focus

1. **Only "has no entry" is excusable.** A classifier error, a missing manifest or an invalid manifest must still fail with the flag on (SR-2). Task 2 has a test for each.
2. **Fail closed on the list.** A missing, unreadable, malformed, unsorted or duplicated list fails; it is never read as empty (SR-3). Task 1 tests each case.
3. **Both directions.** A new missing file fails; a listed file that is no longer missing also fails, so the list only shrinks (Spec R2). Tasks 1 and 2.
4. **No flag, no change.** Without `--known-missing` the validator must behave exactly as today (AC4). Task 2 runs the existing tests unchanged and adds one on the real tree.
5. **Classifier snapshots.** The classifier test lists tracked files by path, so a new file in `scripts/provenance/` or `docs/architecture/provenance/` changes a snapshot (SR-4). Task 4.
6. **Count drift.** The list must be generated under Node 24.15.0 and equal 645 at the evidence baseline (K5). Task 3 asserts this by running the ratchet itself: it passes only if the list equals the missing set exactly.

---

### Task 1: List validation and comparison (pure logic)

**Files:**

- Create: `scripts/provenance/known-missing.mjs`
- Create: `scripts/provenance/known-missing.test.mjs`

**Interfaces:**

- Produces:
  - `parseKnownMissing(text: string) → { ok: true, list: Record<string, string[]> } | { ok: false, error: string }`;
  - `compareKnownMissing(missing: Record<string, string[]>, list: Record<string, string[]>) → { added: string[], stale: string[], remaining: number }`, where `added` is missing and not listed, `stale` is listed and not missing, and `remaining` is the number of missing files that are listed.
- Rules for `parseKnownMissing`: valid JSON; a plain object; keys are manifest names; each value is an array of strings; each array sorted by plain code-point order (not locale) and duplicate-free; each path starts with `packages/<key>/src/`. Anything else gives `ok: false` with a message naming the key or index.

- [ ] **Step 1: Write the failing tests** in `known-missing.test.mjs`:
  - `parseKnownMissing`: accepts `{"ng":["packages/ng/src/a.ts","packages/ng/src/b.ts"]}`; accepts `{}`; rejects invalid JSON, a top-level array, a non-array value, a non-string item, an unsorted array, a duplicate, and a path outside `packages/<key>/src/`. Each rejection asserts the error text names the problem.
  - `compareKnownMissing`: equal sets give `added: []`, `stale: []`, `remaining` equal to the size; one extra missing file is in `added`; one listed file that is not missing is in `stale`; a key present only in the list or only in the missing set is handled; paths come back sorted.
- [ ] **Step 2: Run** `node --test scripts/provenance/known-missing.test.mjs`. Expected: FAIL; the module does not exist.
- [ ] **Step 3: Implement** both functions. No file or git access in this module (the CLI reads the file, as in `validate-bundle-size.mjs`'s pure-logic split).
- [ ] **Step 4: Run** the test file. Expected: PASS.
- [ ] **Step 5: Commit** `feat(ci): add the known-missing list validation and comparison`.

### Task 2: `--known-missing` in the validator

**Files:**

- Modify: `scripts/provenance/validate-provenance.mjs`
- Modify: `scripts/provenance/validate-provenance-manifest.test.mjs`

**Interfaces:**

- Consumes: `parseKnownMissing`, `compareKnownMissing` from Task 1.
- Produces: `node scripts/provenance/validate-provenance.mjs --known-missing <path>`.

- [ ] **Step 1: Write the failing tests** next to the existing manifest tests, reusing `runValidator`, `tsupPackage` and `writeTree`. The helper gains an optional extra-argument list and a list file path inside the temp tree.
  - Known missing is excused: one package with one missing production file, listed. Exit 0; the output says one known entry remains.
  - A new missing file fails: the file is not listed. Exit 1; the output names the file and says it is not in the list.
  - A stale line fails: the listed file now has a manifest entry. Exit 1; the output names the file and says to remove it from the list.
  - **Other failures stay failures (Review Focus 1):** with the flag on and every missing file listed, a package with no manifest, one with an invalid manifest, and one with an unresolvable import each still exit 1 with their existing message.
  - **Bad list fails closed (Review Focus 2):** a missing list file, invalid JSON and an unsorted list each exit 1 with a message naming the list path.
  - **No flag, no change (Review Focus 4):** the existing tests are not edited. One new test runs the same fixture as "known missing is excused" without the flag and expects exit 1, as today.
  - `--known-missing` with no value exits 1 with a message, like `--base-ref`.
- [ ] **Step 2: Run** `node --test scripts/provenance/validate-provenance-manifest.test.mjs`. Expected: the new tests FAIL; the existing ones pass.
- [ ] **Step 3: Implement.**
  - Parse the flag next to `--base-ref`. Read the file and call `parseKnownMissing`; any failure calls `fail(...)` before the package loop.
  - In the package loop, keep a `missingByPackage` map, and keep pushing the other failures to `failures` as today.
  - Without the flag, keep today's code path byte-for-byte: the per-package `FAIL` summary line and one failure per missing file.
  - With the flag, print the per-package summary as `OK` with `known=<n> new=<n>`, call `compareKnownMissing`, and add one failure per `added` and per `stale` file. Print `known-missing: <remaining> remaining` at the end. Exit 1 if `failures` is not empty.
- [ ] **Step 4: Run** the test file, then `pnpm run test:scripts`. Expected: all pass, including every existing provenance test.
- [ ] **Step 5: Commit** `feat(ci): add the --known-missing ratchet to the provenance validator`.

### Task 3: Generate the list and prove AC1, AC4 and AC6

**Files:**

- Create: `docs/architecture/provenance/known-missing.json`

- [ ] **Step 1: Confirm the baseline.** Run `node scripts/provenance/validate-provenance.mjs` (no flag) under Node 24.15.0 on the implementation branch. Expected: exit 1, `645 manifest problem(s)` (ng 164, react 216, vue 265). If the count differs, stop and report; `develop` has moved and the Spec's numbers need a decision.
- [ ] **Step 2: Generate** the file from that output with a one-off command, not committed: read the `<path> has no entry in docs/architecture/provenance/<name>.json` lines, group by `<name>`, sort each group by code point, and write `{ "ng": [...], "react": [...], "vue": [...] }` with two-space indent and a final newline. Run `npx prettier --write` on the file.
- [ ] **Step 3: Prove it (AC1, AC6).** Run `node scripts/provenance/validate-provenance.mjs --known-missing docs/architecture/provenance/known-missing.json`. Expected: exit 0 and `known-missing: 645 remaining`. This run passes only if the list equals the missing set exactly, so it also proves the count and that nothing was invented.
- [ ] **Step 4: Prove the no-flag path (AC4).** Run the validator without the flag. Expected: exit 1 and `645 manifest problem(s)`, as in Step 1.
- [ ] **Step 5: Prove both directions on the real tree (AC2, AC3).** In a scratch copy of the list (not committed), delete one line, then add one nonexistent but well-formed line. Expected: the first run exits 1 naming the new missing file; the second exits 1 naming the stale line. Record both outputs.
- [ ] **Step 6: Commit** `chore(ci): add the known-missing provenance list (645 entries)`.

### Task 4: Classifier snapshots and CI wiring

**Files:**

- Modify: `scripts/provenance/classify-changes.mjs`
- Modify: `scripts/provenance/classify-changes.test.mjs`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Run** `node --test scripts/provenance/classify-changes.test.mjs` now that the new files exist. Expected: the snapshot test of tracked files matched by `isNonBrowserPath` fails on `known-missing.json`; note any other failure.
- [ ] **Step 2: Update the classifier and its tests only as far as the failures require.**
  - Add `known-missing.mjs` and `known-missing.test.mjs` to the `scripts/provenance/` list in `NON_BROWSER_PATHS`, as every other validator and its test are.
  - Update the snapshot tests: add `docs/architecture/provenance/known-missing.json` and the two new script files in sorted position. Change no other expectation.
  - The prefix `docs/architecture/provenance/` already covers the JSON file, so no prefix changes.
- [ ] **Step 3: Run** the classifier test file. Expected: PASS. Then run the classifier on this branch's own diff against `origin/develop` and record the output (`scope` and `frameworks`).
- [ ] **Step 4: Wire CI.** In the advisory job (`ci-extended`) change only the run line of the "Provenance validation" step to add `--known-missing docs/architecture/provenance/known-missing.json`. Keep the step name, the `if:` and the other arguments. Update the comment above the job: Provenance validation is now a ratchet, and Bundle-size is the remaining known failure (or none, if its baseline PR has landed).
- [ ] **Step 5: Run** `actionlint .github/workflows/ci.yml`. Expected: no new findings. Run `npx prettier --check` on every changed file.
- [ ] **Step 6: Commit** `ci: run the provenance validation step as a ratchet in the advisory job`.

### Task 5: Records, landing and AC5 evidence

**Files:**

- Modify: `docs/architecture/BLUEPRINT_GAPS.md` (GAP-094)
- Modify: `docs/architecture/DECISIONS.md` (ADR-072 status)
- Modify: `docs/superpowers/specs/2026-10-15-gap-094-production-provenance-scope-design.md` (amendment note)
- Modify: `docs/architecture/COMPLETION_REGISTER.md` only if its GAP-094 line states the old resolved condition

- [ ] **Step 1: Records (Spec R5).**
  - GAP-094: stays OPEN. Add the ratchet to its evidence. Change the resolved condition to "the known-missing list is empty and `provenance:validate` exits 0 without the flag". Do not change its status, type or blocking level.
  - GAP-094 Specification: a short amendment note under §4 item 4 saying CI reporting is superseded by ADR-072 and pointing to the new Spec. The Specification's other text is unchanged.
  - ADR-072: already Accepted (user, 2026-10-21); no change.
  - Run `npx prettier --check` on the changed files.
- [ ] **Step 2: Landing.** With authorization, push with an explicit `src:dst` refspec and open the PR against `develop`. State in the description what the ratchet does and does not excuse. Stop; the merge needs the user's authorization.
- [ ] **Step 3: AC5 evidence.** On the PR's `CI` run, read the advisory job's steps:
  - Provenance validation is green;
  - Bundle-size is the only red step, if its baseline PR has not landed, or the whole job is green if it has;
  - `ci` is green.
- [ ] **Step 4: AC7.** Record that the `ci` job's "Provenance scripts self-tests" step passed with the new test files.
- [ ] **Step 5:** Write a short closeout record in the style of the earlier CI closeouts (what landed, the Task 3 outputs, AC1–AC7 with run links, open items) in its own docs-only PR. Stop; the merge needs the user's authorization.

---

## Self-check against the Spec and Plan Review record

- **Requirement coverage:** R1 → Task 3; R2 → Tasks 1 and 2; R3 → Task 4; R4 → Global Constraints (the list only shrinks, no task adds a line) and the Task 3 Step 5 check; R5 → Task 5.
- **Acceptance coverage:** AC1 → Task 3 Step 3; AC2, AC3 → Task 1, Task 2 and Task 3 Step 5; AC4 → Task 2 and Task 3 Step 4; AC5 → Task 5 Step 3; AC6 → Task 3 Step 3; AC7 → Tasks 1, 2 and 5 Step 4.
- **Settled at Plan Review (user approved the plan as written, 2026-10-21):**
  - The Spec leaves open an automatic comparison of the list with the base branch's copy; the plan does not include it. A later change can add it.
  - Task 3 uses a one-off generation command and no committed generator. A repeatable generator would be a new script and a new classifier entry, outside this plan.
  - One branch and one PR carry the docs and the implementation (user, 2026-10-21). The closeout record is the only separate, later docs-only PR.
