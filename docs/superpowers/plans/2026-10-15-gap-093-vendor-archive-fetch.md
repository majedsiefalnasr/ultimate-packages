# GAP-093 Vendor Archive Fetch Implementation Plan

> **For agentic workers:** Execute inline, task by task, test first. Stop if the workflow or test files differ from what this plan assumes.

**Status:** APPROVED — Plan Review passed with changes (findings 1–7 applied, 2026-10-15).

**Goal:** Populate the two pinned archives the provenance self-tests read, in CI, from the URLs and SHA-256 values already committed in `docs/architecture/checksums.json`, failing closed on any mismatch.

**Architecture:** One new script `scripts/provenance/fetch-vendor-cache.mjs` with an exported, injectable core and a guarded CLI; one offline test file; one root script; one CI step before "Provenance scripts self-tests".

**Tech stack:** Node 24.15.0 (`node:test`, `node:crypto`, global `fetch`), pnpm 9.6.0, GitHub Actions.

## Global constraints

- [Approved Spec](../specs/2026-10-15-gap-093-vendor-archive-fetch-design.md) §§2–3 governs.
- Do not modify: `extract-primereact-source.test.mjs`, `extract-primevue-source.test.mjs`, the extraction scripts, `vendor-snapshot.mjs`, `checksums.json`, `.gitignore`, other CI steps, tracking documents.
- Files touched: `scripts/provenance/fetch-vendor-cache.mjs` (new), `scripts/provenance/fetch-vendor-cache.test.mjs` (new), `package.json` (one script line), `.github/workflows/ci.yml` (one step), plus this Plan and the Spec.

## Task 1: Failing tests

**File:** create `scripts/provenance/fetch-vendor-cache.test.mjs`.

Cases, each in a fresh `mkdtempSync` root with a synthetic artifact `{ package: "demo", cachedAt: ".vendor-cache/demo-1.0.0.tar.gz", sourceUrl: "https://example.invalid/demo.tgz", sha256: sha256("payload") }` and a fake `fetchImpl` that counts calls and returns `new globalThis.Response(body, { status })` (ESLint declares only `console`, `process`, `fetch` as globals for `.mjs`; use `globalThis.` for any other Node global, and do not change the ESLint config):

1. Present file with matching hash → resolves `"present"`, `fetchImpl` not called.
2. Missing file → fetched, file written with the payload, resolves `"fetched"`; no `.part` file remains.
3. Downloaded hash mismatch → rejects naming `demo`, expected and actual hash; neither the target nor a `.part` file exists.
4. HTTP 404 → rejects naming the status; no file remains.
5. Existing file with wrong hash → rejects naming `demo` and both hashes; `fetchImpl` not called; file content unchanged.
6. `selectArtifacts(["--", "demo"], artifacts)` returns the demo artifact; `selectArtifacts([], …)` and `selectArtifacts(["nope"], …)` throw.

Run `node --test scripts/provenance/fetch-vendor-cache.test.mjs` → fails (module missing).

## Task 2: Implement

**File:** create `scripts/provenance/fetch-vendor-cache.mjs`.

- `export function selectArtifacts(args, artifacts)`: drop one leading `--`; throw on zero names; map each name to the single artifact with that `package`, throw for unknown names.
- `export async function ensureVendorArchive({ artifact, rootDir, fetchImpl })`: target `join(rootDir, artifact.cachedAt)`. If it exists, hash it by streaming it through `createHash`: match → `"present"`, else throw (leave file). Otherwise `mkdirSync(dirname, { recursive: true })`, fetch `sourceUrl`; non-OK or null body → throw with status. `await pipeline(Readable.fromWeb(res.body), createWriteStream(part))` (`node:stream/promises`), then hash `.part`; mismatch → throw. A `try/catch` around the fetch, write and hash runs `rmSync(part, { force: true })` on any error (including a rejected `fetchImpl`) and rethrows. All errors name the package. On success `renameSync` into place → `"fetched"`.
- CLI behind the realpath guard already used in `installed-cli-mcp-smoke.mjs` (`import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href`; sturdier than the `affected-packages.mjs` form the Spec names, which misses symlinked paths): read `JSON.parse(readFileSync("docs/architecture/checksums.json")).artifacts` from `process.cwd()`, `selectArtifacts(process.argv.slice(2), artifacts)`, ensure each sequentially with `(url) => fetch(url, { signal: AbortSignal.timeout(300_000) })`, log `[vendor:fetch] <package>@<version>: present|fetched (sha256 <prefix>…)`, on error print `[vendor:fetch] FAILED: <message>` and exit 1.

Run Task 1 tests → pass.

## Task 3: Wire root script and CI

- `package.json`: add `"vendor:fetch": "node scripts/provenance/fetch-vendor-cache.mjs"` next to `test:scripts`.
- `.github/workflows/ci.yml`: insert immediately before "Provenance scripts self-tests":

```yaml
- name: Fetch pinned vendor archives
  if: ${{ !cancelled() }}
  run: pnpm run vendor:fetch -- primereact primevue
```

## Task 4: Local verification

0. `pnpm install --frozen-lockfile` in the worktree; run checks on Node 24.15.0 if available locally (else record the Node version used).
1. In the worktree (no `.vendor-cache/`): `pnpm run vendor:fetch -- primereact primevue` → both `fetched`; re-run → both `present`.
2. `pnpm run test:scripts` → record pass/fail counts; every case in the two extraction test files and the new test passes. Any other failure must be shown to also fail on `bdc4dbcf` (inherited) or is a regression to fix.
3. `pnpm exec eslint` on the two new `.mjs` files → clean; `pnpm exec prettier --check` on the new files, `ci.yml`, `package.json`, Spec and Plan → clean; full `pnpm run lint` and `pnpm run format:check` → any finding outside these files is shown inherited.

## Task 5: Review, commit, PR

Independent code review of the diff; fix in-scope findings. Commit (Conventional Commits) Spec + Plan + implementation; push `fix/gap-093-vendor-archives`; open PR to `main`. Compare PR CI with baseline run 38730856573: "Fetch pinned vendor archives" and "Provenance scripts self-tests" green; classify every other failure as inherited or regression.
