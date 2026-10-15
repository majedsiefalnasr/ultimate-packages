# GAP-093 — Verified fetch of pinned vendor archives for provenance self-tests

**Date:** 2026-10-15
**Status:** APPROVED — Spec Review passed with changes (findings 1–7 applied, 2026-10-15).
**Authority:** [Blueprint §40](../../architecture/BLUEPRINT.md#40-definition-of-done-for-the-platform); [GAP-093](../../architecture/BLUEPRINT_GAPS.md#gap-093--provenance-script-self-tests-need-vendor-tarballs-that-ci-does-not-have); [`docs/architecture/checksums.json`](../../architecture/checksums.json) (the committed Phase 0 baseline identity and SHA-256 record produced by [`vendor-snapshot.mjs`](../../../scripts/provenance/vendor-snapshot.mjs)).

## 1. Verified problem

On `main` commit `bdc4dbcf54f0bba78394f9d771d3b75d24e1ee60`, [CI run 38730856573](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38730856573), `ci` job, step "Provenance scripts self-tests" (`pnpm run test:scripts`) fails. Each real-extraction case in [`extract-primereact-source.test.mjs`](../../../scripts/provenance/extract-primereact-source.test.mjs) and [`extract-primevue-source.test.mjs`](../../../scripts/provenance/extract-primevue-source.test.mjs) runs `tar xzf .vendor-cache/primereact-10.9.9.tar.gz` / `.vendor-cache/primevue-4.5.5.tar.gz` and fails with `tar (child): Error is not recoverable`. The negative cases ("fails clearly…") pass today without testing anything, because `tar` fails regardless; the fix makes them meaningful again.

Root cause: `.vendor-cache/` is git-ignored (`.gitignore` line 10) and nothing in the CI workflow populates it. The only producer is `vendor-snapshot.mjs`, a developer-run generator that downloads every baseline **and rewrites** `checksums.json`; it is not a verifier and is never invoked in CI. Locally the cache was populated on 2026-09-01, so the tests pass only on machines that ran the snapshot.

Evidence that a verified fetch is reproducible: on 2026-10-15 the pinned `sourceUrl` values for PrimeVue (`codeload.github.com/primefaces/primevue/tar.gz/66dde67…`) and PrimeReact (`…/primereact/tar.gz/d0f574e…`) were downloaded fresh and hash to `f34c320e…546d` and `9598e1e3…8ecf`, byte-identical to the `sha256` recorded in `checksums.json`. All eight locally cached archives also match their recorded hashes.

## 2. Required behavior and scope

1. Add `scripts/provenance/fetch-vendor-cache.mjs`, invoked as `node scripts/provenance/fetch-vendor-cache.mjs <package>...`. For each named package it looks up the single `checksums.json` artifact with that `package` value and ensures the file at its `cachedAt` path exists with the recorded `sha256`:
   - existing file with matching hash → kept, reported as already present;
   - missing file → downloaded from the recorded `sourceUrl` to a temporary sibling path, hashed, and moved into place only if the hash matches;
   - hash mismatch (existing or downloaded), HTTP failure, or a package name absent from `checksums.json` → non-zero exit with a diagnostic naming the package, expected and actual hash. The temporary file is removed on any failure; an existing mismatched file is left untouched for inspection. The cache directory is created as needed.
   - One leading `--` argument (passed through by pnpm 9.6.0, as handled in `validate-sast-baseline.mjs` and `affected-packages.mjs`) is dropped. Zero package arguments is an error, so a typo cannot make the step pass while fetching nothing.
   - Test seam: the module exports an `ensureVendorArchive({ artifact, rootDir, fetchImpl })` function (and the package lookup) and runs its CLI only behind the direct-invocation guard used in `affected-packages.mjs`, so importing it from a test performs no I/O and tests inject a fake `fetchImpl` and a temporary `rootDir`.
2. `checksums.json` stays the sole source of URLs and hashes. The script never writes it and never accepts an unrecorded hash. GitHub `codeload` archives are not contractually byte-stable; a future mismatch is a real failure to investigate, never fixed within this scope by re-running `vendor-snapshot.mjs` or editing `checksums.json`.
3. Add a root script `"vendor:fetch": "node scripts/provenance/fetch-vendor-cache.mjs"`.
4. In `.github/workflows/ci.yml`, add a step "Fetch pinned vendor archives" immediately before "Provenance scripts self-tests", running `pnpm run vendor:fetch -- primereact primevue` with the same `if: ${{ !cancelled() }}` guard. A fetch failure fails that step visibly; the self-test step then fails on its own as today.
5. Unchanged: both extraction test files, the extraction scripts, `vendor-snapshot.mjs`, `checksums.json`, `.gitignore`, every other CI step, and tracking documents. No test is skipped, made conditional, or switched to fixtures.

Out of scope: caching the archives between CI runs (`actions/cache`); fetching the six baselines no current test reads; GAP-094 "Provenance validation" (separate workstream); GAP-093 status/closeout edits.

## 3. Acceptance and verification

1. `fetch-vendor-cache.test.mjs` (run by the existing `test:scripts` glob, no network) covers: present-and-matching file kept without fetching; missing file fetched and written; downloaded hash mismatch fails and leaves no file; existing mismatched file fails without fetching or overwriting; unknown package fails; a leading `--` is ignored; zero packages fails.
2. Locally, with `.vendor-cache/` removed in the worktree, `pnpm run vendor:fetch -- primereact primevue` downloads both archives, and `pnpm run test:scripts` then passes every extraction case; a second fetch run reports both as already present.
3. `pnpm run lint` and `pnpm run format:check` report no findings on the new script and test.
4. On the PR's GitHub-hosted CI run, "Fetch pinned vendor archives" succeeds and "Provenance scripts self-tests" passes, compared against baseline run 38730856573. Any other failure is classified as inherited (present in the baseline) or a regression.

## 4. Boundaries

No architectural decision is reopened (GAP-093 records "Architectural decision required: No"). GAP-093's tracking status changes only in a separate closeout after CI evidence.

Next gate: Implementation Plan and Plan Review (`AGENTS.md` §3).
