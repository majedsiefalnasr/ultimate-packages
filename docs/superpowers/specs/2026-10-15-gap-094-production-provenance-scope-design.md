# GAP-094 — Production-scope provenance manifest enforcement

**Date:** 2026-10-15
**Status:** APPROVED (revision 3) — Spec Review round 1 returned CHANGES REQUIRED (findings 1–12 applied); round 2 returned APPROVED WITH CHANGES (findings N1–N8 applied), 2026-10-15.
**Authority:** [ADR-062](../../architecture/DECISIONS.md) (DR-5 Option B, user decision 2026-10-15); [GAP-094](../../architecture/BLUEPRINT_GAPS.md#gap-094--provenancevalidate-fails-on-a-missing-manifest-entry); C04 in [`COMPLETION_REGISTER.md`](../../architecture/COMPLETION_REGISTER.md); options and evidence in [`research/2026-10-15-gap-094-dr5-provenance-scope-options.md`](../../architecture/research/2026-10-15-gap-094-dr5-provenance-scope-options.md). [ADR-061](../../architecture/DECISIONS.md) (PR-diff check) is unaffected. [ADR-052](../../architecture/DECISIONS.md) X-12 is amended by ADR-062 as stated there.

## 1. Verified problem

- At `main` `ccb97d68` (CI baseline [38737652296](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38737652296) at `efd677fd`, with the same `packages/` tree apart from the Vue Card story), "Provenance validation" fails with `packages/ng/src/accordion/accordion.spec.ts has no entry in docs/architecture/provenance/ng.json`.
- [`validate-provenance.mjs`](../../../scripts/provenance/validate-provenance.mjs) checks every `.ts`/`.tsx`/`.vue` file under `packages/{uix,ng,react,vue,themes}*/src/` and exits at the first missing one. A full count finds 1163 of 1915 files without an entry.
- ADR-062 narrows the required scope to production (distributed) source, determined from build evidence.

## 2. Build evidence that defines "production"

The repository's builds today:

| Package(s)                                  | `package.json` `build`                                                                                        | What is distributed                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ng`, `ng-core`                             | `ng-packagr -p ng-package.json`                                                                               | ng-packagr discovers entry points with the glob `**/ng-package.json`, ignoring `**/node_modules/**`, `**/.git/**` and `<dest>/**` (ng-packagr 21.2.7 `discover-packages.js`). Each entry point compiles from its `lib.entryFile` (default `src/public_api.ts`), and those files' imports are distributed. Cross-entry `@ultimate/ng/<x>` imports resolve through ng-packagr's module-ID mapping to another entry point, which is itself an entry. |
| `vue`, `react`                              | `tsup && (vue-)tsc -p tsconfig.dts.json --declaration --emitDeclarationOnly … && node scripts/rename-dts.mjs` | JS: the `tsup.config.ts` `entry` map and the files it imports. For example, `vue` builds `ripple/index` although `exports` has no such key. Types: every non-`.d.ts` file in the `tsconfig.dts.json` program, which is `include: ["src"]` minus `src/**/*.spec.ts(x)` and `*.stories.ts(x)`.                                                                                                                                                      |
| `vue-core`, `react-core`, `themes`, `uix-*` | `tsup && node scripts/rename-dts.mjs` (`dts: true`)                                                           | The tsup entries and their imports, including type-only imports bundled into declarations. `uix-utils` and `uix-styles` derive their entries from `readdirSync("src")` as `src/<dir>/index.ts`.                                                                                                                                                                                                                                                   |

- Only `dist`, `README.md` and `THIRD-PARTY-NOTICES.md` are published (`files`).
- `.d.ts` source files (for example `packages/vue/src/shims-vue.d.ts`) are compiler inputs. They are never emitted, so they are not distributed unless the reachability walk finds a reference to them.

## 3. Required behavior

### 3.1 Production classifier

Add `scripts/provenance/production-scope.mjs`, exporting `classifyPackage(pkgDir)`. It returns either:

- `{ production, excluded }`, sets of repository-relative paths that together cover every watched source file (`.ts`, `.tsx`, `.vue` under `src/`, including `.d.ts`); or
- `{ error }`, a reason string. The validator treats this as a validation failure for that package.

**Fail-closed rule.** When the build cannot be modelled from the recognised forms below, the result is "all files production" if that is safe and stated. Otherwise it is an error. A file is never excluded because of its name or extension alone: a `*.spec.ts` that an entry imports is production.

1. **Build script.**
   - No `package.json`, or no `build` script → all files production.
   - Otherwise split `build` on `&&` and `;`. Each command is matched exactly, by its name and its whole argument list. Every command must be one of:
     - bare `tsup`, with no arguments; CLI entries or `--config` count as unrecognised;
     - `ng-packagr -p <file>`;
     - `tsc` or `vue-tsc` with only `-p <file>`, `--declaration`, `--emitDeclarationOnly` and `--outDir <dir>`. Its program is `-p <file>`, or `tsconfig.json` when `-p` is absent. Whether it is a declaration program is read from the parsed compiler options: `declaration` or `composite` true, combined with the CLI flags, and `noEmit` not set;
     - `node scripts/rename-dts.mjs`. This is trusted on review evidence: every package's copy only renames and rewrites emitted `.d.ts` files. The react and vue copies differ from the others and were reviewed separately.
   - Any other command → all files production.
2. **ng-packagr entries.**
   - Discover `**/ng-package.json` under the package with ng-packagr's ignore list (`node_modules`, `.git`, and the root config's `dest`).
   - Each entry is `lib.entryFile`, defaulting to `src/public_api.ts`, resolved relative to its `ng-package.json`.
   - A missing entry file → error.
3. **tsup entries.**
   - Parse `tsup.config.ts` (or `.js`/`.mjs`) with the TypeScript AST and find the `entry` property of the `defineConfig` argument.
   - Accepted forms:
     - an array or object literal of string literals;
     - spreads of the recognised directory-listing form, `Object.fromEntries(readdirSync("src"…)…map(… [`${name}/index`, `src/${name}/index.ts`]))` or the equivalent `submodules` variable, which expands to every `src/<dir>/index.ts` that exists.
   - Any other form → error.
   - Exact recognition rules:
     - Exactly one `tsup.config.{ts,js,mjs}` with exactly one `defineConfig` object argument that has an `entry` property. A missing file, a missing `entry`, or several configs → error.
     - An accepted spread is either the inline `Object.fromEntries(readdirSync("src", { withFileTypes: true }).filter(<isDirectory>).map(...))`, or a same-file `const` initialised with exactly that shape (`.map(entry => entry.name)` then a template map). The templates must be exactly `` `${name}/index` `` and `` `src/${name}/index.ts` ``.
     - A listed `src/<dir>` without `index.ts` → error.
     - tsup options that copy files into `dist` (`publicDir`, `onSuccess`) → all files production.
   - For **tsup-built packages only**, union the entries with the `package.json` `exports` targets under `./dist/`. ng-packagr packages use only their `ng-package.json` entries, because ng-packagr generates their `dist` exports.
   - Mapping by condition:
     - `import`, `require` and `default`: `./dist/<key>.{mjs,cjs,js}` → `src/<key>.ts(x)`;
     - `types`: `./dist/<key>.d.{mts,cts,ts}` → `src/<key>.ts(x)`.
   - A `*` wildcard expands over the `src` subdirectories that contain the matching file.
   - Any other condition → error.
   - A target outside `./dist/` other than `./package.json` → error. A mapped target with no source file → error.
   - Zero entries → error.
4. **Reachability.**
   - Walk the import graph from the entries with TypeScript `preProcessFile`, which covers static, type-only, re-export, literal dynamic-import and triple-slash references.
   - For `.vue`, parse with `@vue/compiler-sfc` `parse`, resolved with `createRequire` from `packages/vue/package.json` (no new root dependency; unresolvable → error), and walk `<script>`/`<script setup>` content. `<script src>` → error. A `lang` other than none, `ts`, `tsx` or `js` → error.
   - Follow relative specifiers. Also follow the package's own name and subpaths when they resolve to an entry.
   - Resolve with `.ts`, `.tsx`, `.vue`, `.d.ts` and `index.ts`/`index.tsx`; a `.js`/`.mjs` suffix maps to `.ts`/`.tsx`.
   - Ignore asset imports: `.css`, `.scss`, `.json` and image types.
   - Error on:
     - an unresolvable relative or self-package specifier;
     - a non-literal `import()` or `require()`;
     - `import.meta.glob`;
     - `new URL(…, import.meta.url)`.
5. **Declaration programs.** A declaration program is parsed with the TypeScript API, `getParsedCommandLineOfConfigFile`. For `vue-tsc` it also passes `extraFileExtensions: [{ extension: ".vue", isMixedContent: true, scriptKind: ScriptKind.Deferred }]`, because vue-tsc emits `X.vue.d.ts` for every `.vue` file in the program.
6. **Classification.**
   - `production` = reachable ∪ the non-`.d.ts` files of every declaration program. A `.d.ts` input is production only if the reachability walk reaches it; otherwise it is excluded as an unreferenced `.d.ts` input.
   - `excluded` = all other watched files.

### 3.2 Validator change

In `validate-provenance.mjs`, the manifest-completeness section:

- calls `classifyPackage` for each watched package and continues to the next package after an error, so that all problems are reported;
- requires a manifest entry for every **production** file;
- reports **every** missing file and every classifier error, then exits 1 if there are any;
- prints, per package, the production, excluded and missing counts.

Unchanged:

- extra entries are allowed, including existing entries for excluded files;
- the heading check, the PR-diff check (ADR-061) and the manifest-file-existence check (now applied to packages with production files).

### 3.3 Tests

`production-scope.test.mjs` runs on temporary fixture packages. Existing `validate-provenance-*.test.mjs` fixtures are extended. A fixture without a `package.json` keeps its every-file behavior.

- **Positive:**
  - a file reachable from an entry, through a type-only import and through a `.vue` `<script setup>` import;
  - a declaration-program file that no entry imports, including a `.vue` file in a `vue-tsc` program;
  - an `exports` map with the real `{ types, import, default }` shape;
  - a tsup `entry` file absent from `exports`;
  - a nested ng-packagr secondary entry;
  - the `readdirSync` directory form;
  - a `./*` wildcard export.
- **Negative:** an unreachable `*.spec.ts`/`*.stories.ts` outside the declaration program is excluded; a `.d.ts` input is excluded unless referenced.
- **Name is not proof:** a `*.spec.ts` that an entry imports is production.
- **Fail-closed:**
  - errors: an unmappable export; a non-`./dist/` target; an unknown condition; zero entries; an unparseable tsup `entry`; a missing `tsup.config`; a listed directory without `index.ts`; an unresolved relative or self import; a non-literal dynamic import; `import.meta.glob`; `<script src>`; an unexpected SFC `lang`;
  - all files production: no `package.json`, no `build` script, an unrecognised build command (including `tsup` with arguments), and a tsup `publicDir`/`onSuccess` option. The existing `validate-provenance-manifest.test.mjs` fixture has no `package.json` and keeps its every-file behavior unchanged.
- **Report-all:** two missing production files plus a classifier error in another package are all reported, with exit 1.

### 3.4 Manifests: evidence-backed backfill (separate batch PRs)

The first implementation PR changes only the classifier, the validator, the tests and the tracking text in §3.5. Manifest backfill follows in batch PRs under this Specification.

Entries use the existing schema: `ultimateDestination`, `originalPath`, `modificationStatus` and `modificationDescription`. They also use the existing status vocabulary, and `originalPath: "n/a"` when no upstream file exists (the ng/react/vue convention). Every entry is backed by per-file evidence recorded in the batch's evidence table:

1. the file's adding commit and any later commits that changed its lineage;
2. the Specification/Plan rows that governed that commit, such as the Phase C capability table naming the consulted upstream paths, or a G3 port record;
3. a check for an upstream counterpart in the pinned archive (`vendor:fetch`). For style modules this means `@primeuix/styles` 2.0.3; for components and barrels, the same-named upstream file or directory.

Classification follows that evidence. Re-export-only content does not by itself make a barrel `authored`: an upstream counterpart can make it `adapted` or `unmodified`, as the `uix-utils` and `uix-styles` barrels show. A file whose evidence is inconclusive gets no entry, so it stays a validator failure, and is listed for the user's decision.

### 3.5 Tracking text (first PR)

- GAP-094 in `BLUEPRINT_GAPS.md`:
  - "Expected state" → every production file (ADR-062) has a manifest entry and the validator passes;
  - "Architectural decision required" → "Yes — decided, ADR-062";
  - add the reconciled counts from Acceptance 2.
- C04 in `COMPLETION_REGISTER.md`: "Decide repository-wide provenance scope" → decided (ADR-062); the next gate is backfill batches.
- Status stays OPEN.

## 4. Acceptance

1. All classifier and validator tests pass; `test:scripts` shows no new failures.
2. **Reconciliation**, recorded in a dated research note (`docs/architecture/research/2026-10-15-gap-094-production-scope-reconciliation.md`) that the GAP-094 entry links to:
   - The current tree's 1915 watched files = production + excluded.
   - The missing production count matches the options draft's 696, or the difference is explained.
   - Every excluded file is listed by role. The excluded missing files are expected to be the 467 test and story files.
   - The vue difference between 386 production and 385 emitted declarations is explained by `shims-vue.d.ts`, which is excluded as an unreferenced `.d.ts` input. It already has an entry, which stays allowed.
   - The options draft's file-name categories, such as "index barrels" including the two `uix-styles` style modules, are noted as name-based estimates.
3. **Soundness against a real build, recorded:**
   - After `pnpm run build`, every source file named in the JS sourcemaps (`dist/**/*.map` `sources`) and every per-file declaration emitted for `vue`/`react` maps to a production file. Zero distributed files are classified as excluded.
   - Limitation, stated rather than claimed: bundled declarations (tsup `dts: true`, ng-packagr) carry no per-file mapping. Type-only files in those packages are covered by the static reachability walk only.
4. `pnpm run provenance:validate` lists all missing production files and exits 1 until the backfill completes. CI "Provenance validation" stays red only for missing production entries. Every other step is compared against the current `main` baseline.
   - _Amendment (2026-10-21, ADR-072):_ without the flag the validator is unchanged and still exits 1 on every missing entry. In the advisory CI job the step now runs as a ratchet over `docs/architecture/provenance/known-missing.json`, so CI no longer stays red for the known missing entries; see `2026-10-21-provenance-ratchet-advisory-job-design.md`. GAP-094 is resolved only when that list is empty and `provenance:validate` exits 0 without the flag.
5. Lint and format checks are clean.
6. **Each backfill batch PR:**
   - passes review with its evidence table;
   - shows the validator's missing count dropping by exactly the batch's files, with no new missing file and an unchanged excluded set.
     GAP-094 is resolved only when `provenance:validate` exits 0 in CI without `--known-missing` (see the 2026-10-21 amendment under item 4).

## 5. Boundaries

- No CI exception. No change to the heading check, the diff check or existing entries.
- Out of scope: the deferred validator Minor findings and the GAP-091/C01 records.
- Next gate: Plan and Plan Review (`AGENTS.md` §3).

## Errata (Plan Review, 2026-10-15)

- **E1 — §3.1(3), accepted directory-listing forms.** Three shapes are accepted, and nothing else:
  - the inline `Object.fromEntries(readdirSync("src", { withFileTypes: true }).filter((p) => p.isDirectory()).map(<cb>))` spread;
  - a same-file `const` initialised with that whole `Object.fromEntries(...)` call and then spread (the `uix-styles` form);
  - a same-file `const` holding `readdirSync("src", { withFileTypes: true }).filter((p) => p.isDirectory()).map((p) => p.name)`, then mapped inline inside `Object.fromEntries(<const>.map(<cb>))` (the `uix-utils` form).

  The callback must return exactly ``[`${X}/index`, `src/${X}/index.ts`]``, where `X` is either the callback's identifier parameter or `<param>.name` of a Dirent parameter.

- **E2 — §3.1(4), SFC parser module.** Under pnpm, `@vue/compiler-sfc` is not resolvable from `packages/vue`. The parser is loaded as `vue/compiler-sfc` (the same `parse` API, re-exported by the `vue` devDependency of `packages/vue`) with `createRequire` from that package's `package.json`. A resolution failure becomes a classifier `{ error }`.
- **E3 — Code review (2026-10-15), fail-closed tightening:**
  - **Configuration sources.** tsup configuration must come from exactly one `tsup.config.{ts,cts,mts,js,cjs,mjs}`: no `tsup.config.json`, no `tsup` key in `package.json`, and no second config file.
  - **`defineConfig` options.** Every property must be plainly named. A spread, a computed key or a duplicate `entry` → error.
  - **Emitting tsc/vue-tsc programs.** A program without `noEmit` distributes its files whether or not it emits declarations: a JS-emitting program ships JS. Its config diagnostics (for example a missing `extends`) are errors.
  - **Program files are reachability seeds.** tsc emits output for imports of root files even when `exclude` drops them.
  - **Other distribution channels → every file production:**
    - a `package.json` `files` list that is absent, or that contains anything other than `dist[/…]` and top-level docs;
    - an `ng-package.json` with non-empty `assets`.
  - **Partition.** The production/excluded partition holds by construction (each watched file is assigned to exactly one set), so no separate runtime check is kept.
- **E4 — CodeQL review (PR #22, 2026-10-15): `exports` subpath patterns follow Node's rules.**
  - **Key:** a key may contain at most one `*`. More than one → error.
  - **Key and target agree:** a `*` must appear in both the key and the target, or in neither. Otherwise → error.
  - **Target:** every `*` in a target takes the same value, enforced with a regex backreference (the first `*` captures and every later `*` must repeat it), so a value containing `/` still matches. `*` matches any non-empty string, including `/`. The self specifier substitutes the value literally (`split("*").join(value)`), so `$` sequences are never treated as replacement patterns.
  - **Matching:** the pattern is matched against every non-`.d.ts` `.ts`/`.tsx` path under `src/`. This is conservative: a match may name a file the build does not emit.
  - **No match:** a pattern that matches no source → error.
  - **Previous behavior:** the first implementation replaced only the first `*` and only expanded over `src` directories. A multi-`*`, file-level or nested pattern therefore matched nothing, silently. That was fail-open.

## Amendment A1 — Classification contract (ADR-064, 2026-10-16)

User decision, Option B, recorded in [ADR-064](../../architecture/DECISIONS.md#adr-064--provenance-source-class-copy-reference-original-is-evidence-based-modificationstatus-is-a-descriptive-sub-label) with evidence in [`research/2026-10-16-gap-094-provenance-classification-semantics.md`](../../architecture/research/2026-10-16-gap-094-provenance-classification-semantics.md). This amends §3.4 for every backfill batch after batch 1.

- **Evidence item 3 is a side-by-side comparison.** The comparison is made with the counterpart in the checksum-verified pinned archive. For ORIGINAL, the evidence records the names and the same-named file or directory paths searched in every pinned archive.
- **Each evidence table has a Source class column** (COPY, REFERENCE or ORIGINAL), decided by ADR-064 Decision 1.
- **"Classification follows that evidence"** now means:
  - the source class follows the comparison;
  - `modificationStatus` is chosen from ADR-064's compatibility matrix for that class (COPY: `unmodified`, `import-path-adapted` or `adapted`; REFERENCE: `reimplemented-with-reference`; ORIGINAL: `authored` with `originalPath: "n/a"`);
  - legacy-only values are not used.
- **Barrels.** §3.4's sentence that "an upstream counterpart can make it `adapted` or `unmodified`" reads under ADR-064 as follows:
  - a barrel that retains a same-named upstream barrel's re-export structure is COPY;
  - one that shares only export names is REFERENCE;
  - genuine doubt between the two is COPY;
  - a barrel with no counterpart is ORIGINAL.
- **Ambiguity.** Genuine uncertainty about retained upstream wording, statements or structure is resolved as COPY, citing the compared upstream file and stating the uncertainty. That uncertainty is no longer "inconclusive".
- **Inconclusive** now means only that the evidence cannot support any class: for example, the lineage or the upstream comparison cannot be established. Such a file gets no entry, stays a validator failure, and is listed for the user's decision.
- **Batch 1 entries are unchanged.** Batch 1 (PR #25) merged before ADR-064, and its entries are not edited, migrated or reclassified. Its re-evaluation, including four entries that are uncertain under the new rule, is recorded in the research document §5.1 and tracked under GAP-132.
