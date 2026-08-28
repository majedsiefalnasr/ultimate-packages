# Phase 1 — UltimateUIX Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the four Phase-0-pinned `@primeuix/*` MIT baselines into four Ultimate-owned, independently buildable, framework-neutral packages (`@ultimate/uix-utils`, `uix-styled`, `uix-styles`, `uix-motion`) with complete file-level provenance, ready for `UltimateNG` (Phase 2) to depend on.

**Architecture:** A reusable extraction script recovers original per-file TypeScript source from the pinned npm tarballs' embedded sourcemaps (`sourcesContent`) into a gitignored staging tree; a reusable adaptation script rewrites only `@primeuix/*` import specifiers to `@ultimate/uix-*` equivalents; each package is then built with `tsup` (ESM + subpath exports where upstream had them), tested with Vitest, and its provenance recorded in both the existing `PROVENANCE.md` and a new per-package machine-readable manifest.

**Tech Stack:** pnpm workspaces (existing), TypeScript 5.9 strict (existing `tsconfig.base.json`), tsup (new, per-package build), Vitest (new, per-package test), Node.js built-ins only for the provenance scripts (no new script dependencies).

## Global Constraints

- Never exceed pinned MIT ceilings: `@primeuix/utils ≤ 0.7.2`, `styled ≤ 0.7.4`, `styles ≤ 2.0.3`, `motion ≤ 0.0.10` (`docs/architecture/DEPENDENCIES.md`).
- Zero runtime dependency on `primeng`/`primevue`/`primereact`/current `@primeuix/*` in any `packages/uix-*` package.json.
- Zero Angular/React/Vue imports anywhere under `packages/uix-*` (enforced by existing `scripts/provenance/validate-boundaries.mjs`).
- Every incorporated Prime-derived source file must have a provenance record (package-level in `docs/architecture/PROVENANCE.md`, file-level in a new per-package manifest JSON).
- ESM only, `sideEffects: false`, subpath exports preserved where upstream had them (`uix-utils`, `uix-styles`); single entry where upstream had that (`uix-styled`, `uix-motion`).
- `.p-*` CSS selectors and other Prime naming stay verbatim — no renaming in Phase 1.
- `uix-styles` Phase 1 scope is the `base` module (+ shared `types`) only — no per-component style modules.
- Build orchestration stays plain `pnpm -r` (ADR-015) — no Turborepo/Nx.
- Package manager: pnpm 9.6.0. Node: >=20 (repo's own `engines` field; this machine runs Node 23.11.0, compatible).

---

## File Structure

```text
packages/
├── uix-utils/
│   ├── src/
│   │   ├── classnames/index.ts
│   │   ├── dom/
│   │   │   ├── methods/*.ts       (~80 files)
│   │   │   └── helpers/*.ts       (~9 files)
│   │   ├── eventbus/index.ts
│   │   ├── mergeprops/index.ts
│   │   ├── object/methods/*.ts    (~40 files)
│   │   ├── uuid/index.ts
│   │   ├── zindex/index.ts
│   │   └── index.ts                (barrel, re-exports all 7 submodules)
│   ├── test/                       (mirrors src/ structure, one *.test.ts per module)
│   ├── package.json
│   ├── tsup.config.ts
│   ├── vitest.config.ts
│   ├── README.md
│   └── THIRD-PARTY-NOTICES.md      (existing stub, populated)
├── uix-styled/
│   ├── src/{actions,service,utils,helpers,config,stylesheet}/*.ts (19 files)
│   ├── test/
│   ├── package.json, tsup.config.ts, vitest.config.ts, README.md
│   └── THIRD-PARTY-NOTICES.md
├── uix-styles/
│   ├── src/base/index.ts
│   ├── src/types.ts
│   ├── src/index.ts                (barrel, re-exports base + types)
│   ├── test/
│   ├── package.json, tsup.config.ts, vitest.config.ts, README.md
│   └── THIRD-PARTY-NOTICES.md
├── uix-motion/
│   ├── src/config/index.ts
│   ├── src/utils/index.ts
│   ├── src/index.ts                (barrel)
│   ├── test/
│   ├── package.json, tsup.config.ts, vitest.config.ts, README.md
│   └── THIRD-PARTY-NOTICES.md
└── uix/                              (untouched — no changes in Phase 1)

scripts/provenance/
├── extract-source.mjs              (new — recovers TS source from tarball sourcemaps)
├── adapt-imports.mjs               (new — rewrites @primeuix/* → @ultimate/uix-* import specifiers)
├── validate-provenance.mjs         (modified — adds manifest-completeness check)
└── validate-dependency-ceiling.mjs (modified — WATCHED_PREFIXES gains "uix")

docs/architecture/
├── PROVENANCE.md                   (modified — 4 entries updated)
├── DECISIONS.md                    (modified — ADR-016, ADR-017 added)
├── PERFORMANCE.md                  (new — Phase 1 baseline numbers)
└── provenance/
    ├── uix-utils.json              (new — file-level manifest)
    ├── uix-styled.json             (new)
    ├── uix-styles.json             (new)
    └── uix-motion.json             (new)

.gitignore                          (modified — add .vendor-extracted/)
```

**Why this shape:** the extraction and adaptation scripts are shared infrastructure used once per package — writing them once (Task 1) and re-running them per package avoids duplicating sourcemap-parsing logic four times. Each package's `src/` tree mirrors the upstream module's own directory structure exactly (confirmed via sourcemap inspection: all intra-package imports are relative paths like `./hasClass` or `../methods/addClass`, which stay correct as long as the original relative layout is preserved) — no per-file import surgery needed, only the mechanical `@primeuix/*` → `@ultimate/uix-*` cross-package rewrite.

---

## Interfaces produced by shared infrastructure (Task 1)

- `extract-source.mjs <tarball-path> <output-dir>` — CLI script. Reads a `.tar.gz`, finds every `*.mjs.map` inside, parses `sources`/`sourcesContent`, writes each recovered file to `<output-dir>/<original-relative-path-with-leading-../ segments stripped past src/>`. Idempotent: re-running with the same inputs overwrites with identical content.
- `adapt-imports.mjs <dir> --from <old-specifier-prefix> --to <new-specifier-prefix>` — CLI script. Walks every `.ts` file under `<dir>`, replaces import specifiers matching `^<old-specifier-prefix>(/.*)?$` with `<new-specifier-prefix>$1`, in place. Idempotent.

Every package task (2-5) consumes both scripts via these exact CLI signatures.

---

## Task 1: Provenance extraction and adaptation tooling

**Files:**
- Create: `scripts/provenance/extract-source.mjs`
- Create: `scripts/provenance/adapt-imports.mjs`
- Create: `scripts/provenance/extract-source.test.mjs`
- Create: `scripts/provenance/adapt-imports.test.mjs`
- Modify: `.gitignore`
- Modify: `package.json` (add `devDependencies.tsup`, `devDependencies.vitest`)

**Interfaces:**
- Produces: `extract-source.mjs` and `adapt-imports.mjs` CLI signatures as specified above — every later task invokes these exact commands.

- [ ] **Step 1: Add `.vendor-extracted/` to `.gitignore`**

Read current `.gitignore`, then add the new ignore line.

```
node_modules/
dist/
*.tsbuildinfo
.turbo/
.pnpm-store/
*.log
.DS_Store
.env
.env.local
.vendor-cache/
.vendor-extracted/
```

- [ ] **Step 2: Write the failing test for `extract-source.mjs`**

Create `scripts/provenance/extract-source.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createGzip } from "node:zlib";
import { spawnSync } from "node:child_process";

function makeFixtureTarball(dir) {
  // Build a minimal fake package with one dist file + one sourcemap
  // containing embedded sourcesContent, then tar.gz it.
  const pkgDir = join(dir, "package");
  mkdirSync(join(pkgDir, "dist"), { recursive: true });
  writeFileSync(
    join(pkgDir, "dist", "index.mjs"),
    "export default function hi(){return 'hi';}\n//# sourceMappingURL=index.mjs.map"
  );
  const map = {
    version: 3,
    sources: ["../src/index.ts"],
    sourcesContent: ["export default function hi(): string {\n    return 'hi';\n}\n"],
    mappings: "",
  };
  writeFileSync(join(pkgDir, "dist", "index.mjs.map"), JSON.stringify(map));

  const tarPath = join(dir, "fixture.tar.gz");
  spawnSync("tar", ["czf", tarPath, "-C", dir, "package"], { stdio: "inherit" });
  return tarPath;
}

test("extract-source.mjs recovers sourcesContent to the correct relative path", () => {
  const workDir = mkdtempSync(join(tmpdir(), "extract-test-"));
  const tarPath = makeFixtureTarball(workDir);
  const outDir = join(workDir, "out");

  execFileSync("node", ["scripts/provenance/extract-source.mjs", tarPath, outDir], {
    cwd: process.cwd(),
  });

  const recovered = readFileSync(join(outDir, "src", "index.ts"), "utf8");
  assert.equal(recovered, "export default function hi(): string {\n    return 'hi';\n}\n");

  rmSync(workDir, { recursive: true, force: true });
});

test("extract-source.mjs is idempotent", () => {
  const workDir = mkdtempSync(join(tmpdir(), "extract-test-idem-"));
  const tarPath = makeFixtureTarball(workDir);
  const outDir = join(workDir, "out");

  execFileSync("node", ["scripts/provenance/extract-source.mjs", tarPath, outDir]);
  const first = readFileSync(join(outDir, "src", "index.ts"), "utf8");
  execFileSync("node", ["scripts/provenance/extract-source.mjs", tarPath, outDir]);
  const second = readFileSync(join(outDir, "src", "index.ts"), "utf8");

  assert.equal(first, second);
  rmSync(workDir, { recursive: true, force: true });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test scripts/provenance/extract-source.test.mjs`
Expected: FAIL — `scripts/provenance/extract-source.mjs` does not exist (`ENOENT` or module-not-found error).

- [ ] **Step 4: Implement `extract-source.mjs`**

Create `scripts/provenance/extract-source.mjs`:

```javascript
#!/usr/bin/env node
// scripts/provenance/extract-source.mjs
//
// Recovers original per-file TypeScript source from a pinned npm tarball's
// embedded sourcemap sourcesContent. The pinned @primeuix/* tarballs ship
// only compiled dist output (.mjs/.d.mts) — no src/ directory — but every
// .mjs.map inside embeds the full original file content per source path.
// This is the exact pinned MIT baseline, at file granularity, reproducible
// from the same checksummed tarball every time (Phase 0's vendor-snapshot.mjs
// already recorded each tarball's sha256 in docs/architecture/checksums.json).
//
// Usage: node extract-source.mjs <tarball-path> <output-dir>

import { mkdirSync, writeFileSync, readdirSync, statSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, normalize } from "node:path";
import { execFileSync } from "node:child_process";

const [, , tarballPath, outputDir] = process.argv;

if (!tarballPath || !outputDir) {
  console.error("Usage: extract-source.mjs <tarball-path> <output-dir>");
  process.exit(1);
}

function findMapFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findMapFiles(full, files);
    } else if (entry.name.endsWith(".mjs.map")) {
      files.push(full);
    }
  }
  return files;
}

// Resolves a sourcemap's relative "source" path (e.g. "../../src/dom/methods/hasClass.ts",
// recorded relative to the .mjs.map file's own directory) down to a path rooted at "src/",
// discarding any leading ../ segments that merely walk back up to the package root.
function resolveToSrcRelative(sourcePath) {
  const normalized = normalize(sourcePath).split("/").filter((seg) => seg !== "..");
  const srcIndex = normalized.indexOf("src");
  if (srcIndex === -1) {
    throw new Error(`sourcemap source path does not contain a "src" segment: ${sourcePath}`);
  }
  return normalized.slice(srcIndex).join("/");
}

const extractDir = mkdtempSync(join(tmpdir(), "extract-source-"));
try {
  execFileSync("tar", ["xzf", tarballPath, "-C", extractDir]);

  const mapFiles = findMapFiles(extractDir);
  if (mapFiles.length === 0) {
    throw new Error(`no .mjs.map files found in ${tarballPath}`);
  }

  let written = 0;
  for (const mapFile of mapFiles) {
    const map = JSON.parse(readFileSync(mapFile, "utf8"));
    const sources = map.sources || [];
    const sourcesContent = map.sourcesContent || [];

    if (sources.length !== sourcesContent.length) {
      throw new Error(`${mapFile}: sources/sourcesContent length mismatch`);
    }

    for (let i = 0; i < sources.length; i++) {
      const content = sourcesContent[i];
      if (content == null) {
        throw new Error(
          `${mapFile}: sourcesContent[${i}] (${sources[i]}) is missing — cannot recover this file from sourcemap`
        );
      }
      const relPath = resolveToSrcRelative(sources[i]);
      const destPath = join(outputDir, relPath);
      mkdirSync(dirname(destPath), { recursive: true });
      writeFileSync(destPath, content);
      written++;
    }
  }

  console.log(`[extract-source] wrote ${written} file(s) from ${mapFiles.length} sourcemap(s) to ${outputDir}`);
} finally {
  rmSync(extractDir, { recursive: true, force: true });
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test scripts/provenance/extract-source.test.mjs`
Expected: PASS (2 tests)

- [ ] **Step 6: Write the failing test for `adapt-imports.mjs`**

Create `scripts/provenance/adapt-imports.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

test("adapt-imports.mjs rewrites bare and subpath import specifiers", () => {
  const workDir = mkdtempSync(join(tmpdir(), "adapt-test-"));
  mkdirSync(join(workDir, "src"), { recursive: true });
  writeFileSync(
    join(workDir, "src", "example.ts"),
    [
      "import { resolve } from '@primeuix/utils';",
      "import { deepMerge } from '@primeuix/utils/object';",
      "import hasClass from './hasClass';",
      "",
    ].join("\n")
  );

  execFileSync("node", [
    "scripts/provenance/adapt-imports.mjs",
    join(workDir, "src"),
    "--from",
    "@primeuix/utils",
    "--to",
    "@ultimate/uix-utils",
  ]);

  const result = readFileSync(join(workDir, "src", "example.ts"), "utf8");
  assert.match(result, /import \{ resolve \} from '@ultimate\/uix-utils';/);
  assert.match(result, /import \{ deepMerge \} from '@ultimate\/uix-utils\/object';/);
  assert.match(result, /import hasClass from '\.\/hasClass';/);

  rmSync(workDir, { recursive: true, force: true });
});

test("adapt-imports.mjs is idempotent", () => {
  const workDir = mkdtempSync(join(tmpdir(), "adapt-test-idem-"));
  mkdirSync(join(workDir, "src"), { recursive: true });
  writeFileSync(join(workDir, "src", "example.ts"), "import { resolve } from '@primeuix/utils';\n");

  const args = [
    "scripts/provenance/adapt-imports.mjs",
    join(workDir, "src"),
    "--from",
    "@primeuix/utils",
    "--to",
    "@ultimate/uix-utils",
  ];
  execFileSync("node", args);
  const first = readFileSync(join(workDir, "src", "example.ts"), "utf8");
  execFileSync("node", args);
  const second = readFileSync(join(workDir, "src", "example.ts"), "utf8");

  assert.equal(first, second);
  rmSync(workDir, { recursive: true, force: true });
});
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `node --test scripts/provenance/adapt-imports.test.mjs`
Expected: FAIL — `scripts/provenance/adapt-imports.mjs` does not exist.

- [ ] **Step 8: Implement `adapt-imports.mjs`**

Create `scripts/provenance/adapt-imports.mjs`:

```javascript
#!/usr/bin/env node
// scripts/provenance/adapt-imports.mjs
//
// Rewrites import specifiers matching a given prefix (e.g. "@primeuix/utils")
// to a new prefix (e.g. "@ultimate/uix-utils") across every .ts file under a
// directory. Handles both the bare specifier ("@primeuix/utils") and subpath
// specifiers ("@primeuix/utils/object") without touching relative imports
// ("./hasClass", "../methods/addClass"), which are already correct because
// extract-source.mjs preserves the original relative directory structure.
//
// Usage: node adapt-imports.mjs <dir> --from <old-prefix> --to <new-prefix>

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const dir = args[0];
const fromIndex = args.indexOf("--from");
const toIndex = args.indexOf("--to");

if (!dir || fromIndex === -1 || toIndex === -1) {
  console.error("Usage: adapt-imports.mjs <dir> --from <old-prefix> --to <new-prefix>");
  process.exit(1);
}

const fromPrefix = args[fromIndex + 1];
const toPrefix = args[toIndex + 1];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Matches the exact prefix, optionally followed by "/<rest-of-subpath>",
// inside a quoted import/export specifier. Requires a word boundary after
// the prefix so "@primeuix/utils-extra" is not matched by "@primeuix/utils".
const pattern = new RegExp(`(['"])${escapeRegExp(fromPrefix)}(/[^'"]*)?\\1`, "g");

function walk(d, files = []) {
  for (const entry of readdirSync(d, { withFileTypes: true })) {
    const full = join(d, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.name.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

let changedFiles = 0;
let changedSpecifiers = 0;

for (const file of walk(dir)) {
  const original = readFileSync(file, "utf8");
  let matches = 0;
  const updated = original.replace(pattern, (_match, quote, subpath = "") => {
    matches++;
    return `${quote}${toPrefix}${subpath}${quote}`;
  });

  if (matches > 0) {
    writeFileSync(file, updated);
    changedFiles++;
    changedSpecifiers += matches;
  }
}

console.log(
  `[adapt-imports] rewrote ${changedSpecifiers} specifier(s) across ${changedFiles} file(s) under ${dir} (${fromPrefix} -> ${toPrefix})`
);
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `node --test scripts/provenance/adapt-imports.test.mjs`
Expected: PASS (2 tests)

- [ ] **Step 10: Add `tsup` and `vitest` as root devDependencies**

Edit `package.json`, add to `devDependencies`:

```json
    "tsup": "^8.3.0",
    "vitest": "^2.1.8"
```

Full `devDependencies` block becomes:

```json
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "eslint": "^9.15.0",
    "@eslint/js": "^9.15.0",
    "typescript-eslint": "^8.15.0",
    "prettier": "^3.3.3",
    "typescript": "^5.9.3",
    "tsup": "^8.3.0",
    "vitest": "^2.1.8"
  },
```

- [ ] **Step 11: Install and verify**

Run: `pnpm install`
Expected: installs cleanly, `pnpm-lock.yaml` updates, no errors.

- [ ] **Step 12: Commit**

```bash
git add scripts/provenance/extract-source.mjs scripts/provenance/adapt-imports.mjs \
  scripts/provenance/extract-source.test.mjs scripts/provenance/adapt-imports.test.mjs \
  .gitignore package.json pnpm-lock.yaml
git commit -m "feat(provenance): add sourcemap extraction and import-rewrite tooling

Recovers original per-file TypeScript source from the pinned @primeuix/*
npm tarballs' embedded sourcemaps (sourcesContent), and mechanically
rewrites @primeuix/* import specifiers to @ultimate/uix-* equivalents.
This is the Phase 1 vendoring mechanism per the approved spec: the
pinned tarballs ship no src/ and upstream git history never reached
these exact versions, but sourcemaps embed the full original source."
```

---

## Task 2: `@ultimate/uix-utils` package

**Files:**
- Create: `packages/uix-utils/package.json`
- Create: `packages/uix-utils/tsup.config.ts`
- Create: `packages/uix-utils/vitest.config.ts`
- Create: `packages/uix-utils/tsconfig.json`
- Create: `packages/uix-utils/src/**/*.ts` (extracted + adapted, ~137 files)
- Create: `packages/uix-utils/src/index.ts` (barrel)
- Create: `packages/uix-utils/test/**/*.test.ts` (one per submodule: 7 files)
- Modify: `packages/uix-utils/THIRD-PARTY-NOTICES.md` (already exists as stub — no change needed, content already matches Phase 0's populated form; verify only)
- Create: `packages/uix-utils/README.md`

**Interfaces:**
- Consumes: `scripts/provenance/extract-source.mjs`, `scripts/provenance/adapt-imports.mjs` (Task 1).
- Produces: `@ultimate/uix-utils` package, importable as `@ultimate/uix-utils` (barrel) or `@ultimate/uix-utils/{classnames,dom,eventbus,mergeprops,object,uuid,zindex}` (subpaths). Exported function names are unchanged from upstream (e.g. `hasClass`, `deepMerge`, `EventBus`, `classNames`) — Tasks 3 and 4 import from `@ultimate/uix-utils` using these exact names.

- [ ] **Step 1: Extract source from the pinned tarball**

Run:

```bash
node scripts/provenance/extract-source.mjs .vendor-cache/@primeuix__utils-0.7.2.tar.gz .vendor-extracted/uix-utils
```

Expected output: `[extract-source] wrote 137 file(s) from N sourcemap(s) to .vendor-extracted/uix-utils`

- [ ] **Step 2: Verify extraction output structure**

Run: `find .vendor-extracted/uix-utils/src -type f | wc -l`
Expected: `137`

Run: `find .vendor-extracted/uix-utils/src -maxdepth 1 -type d | sort`
Expected: `classnames`, `dom`, `eventbus`, `mergeprops`, `object`, `uuid`, `zindex` subdirectories present (7 total, plus `src` itself).

- [ ] **Step 3: Copy extracted source into the package**

```bash
mkdir -p packages/uix-utils/src
cp -r .vendor-extracted/uix-utils/src/. packages/uix-utils/src/
```

- [ ] **Step 4: Adapt cross-package import specifiers**

```bash
node scripts/provenance/adapt-imports.mjs packages/uix-utils/src --from @primeuix/utils --to @ultimate/uix-utils
```

Expected: `[adapt-imports] rewrote 1 specifier(s) across 1 file(s)` (only `mergeprops`'s internal `import { resolve } from '@primeuix/utils/object'` — confirmed during investigation as the only cross-submodule import inside this package).

- [ ] **Step 5: Verify no `@primeuix` references remain**

Run: `grep -rl "@primeuix" packages/uix-utils/src/ || echo "CLEAN"`
Expected: `CLEAN`

- [ ] **Step 6: Write the barrel entry point**

Create `packages/uix-utils/src/index.ts`. Determine exact export list by reading each submodule's own `index.ts` (created by extraction). Use this content, mirroring the upstream barrel structure confirmed during spec investigation:

```typescript
export * from "./classnames";
export * from "./dom";
export * from "./eventbus";
export * from "./mergeprops";
export * from "./object";
export * from "./uuid";
export * from "./zindex";
```

If any extracted submodule directory lacks a top-level `index.ts` re-exporting its own files (check `classnames/`, `eventbus/`, `uuid/`, `zindex/` — single-file modules — and `dom/`, `object/`, `mergeprops/` — multi-file modules), create one per submodule that re-exports every file in that submodule directory using the same default-export style found in the extracted files (e.g. `export { default as hasClass } from './methods/hasClass';` for `dom`, following the exact function names read from each extracted file in Step 3).

- [ ] **Step 7: Write `package.json`**

Create `packages/uix-utils/package.json`:

```json
{
  "name": "@ultimate/uix-utils",
  "version": "0.1.0",
  "description": "Framework-neutral utility functions for the Ultimate Platform UI foundation.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "default": "./dist/index.mjs"
    },
    "./*": {
      "types": "./dist/*/index.d.mts",
      "import": "./dist/*/index.mjs",
      "default": "./dist/*/index.mjs"
    }
  },
  "files": ["dist", "README.md", "THIRD-PARTY-NOTICES.md"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "tsup": "^8.3.0",
    "typescript": "^5.9.3",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 8: Write `tsup.config.ts`**

Create `packages/uix-utils/tsup.config.ts`:

```typescript
import { defineConfig } from "tsup";
import { readdirSync } from "node:fs";

const submodules = readdirSync("src", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    ...Object.fromEntries(submodules.map((name) => [`${name}/index`, `src/${name}/index.ts`])),
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
```

- [ ] **Step 9: Write `tsconfig.json`**

Create `packages/uix-utils/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 10: Write `vitest.config.ts`**

Create `packages/uix-utils/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
  },
});
```

- [ ] **Step 11: Add `jsdom` as a devDependency**

Edit `packages/uix-utils/package.json`, add to `devDependencies`:

```json
    "jsdom": "^25.0.1"
```

- [ ] **Step 12: Write the failing test for `classnames`**

Create `packages/uix-utils/test/classnames.test.ts`. First read `packages/uix-utils/src/classnames/index.ts` to confirm the exact exported function name and signature, then write:

```typescript
import { describe, it, expect } from "vitest";
import { classNames } from "../src/classnames";

describe("classNames", () => {
  it("joins truthy string arguments with a space", () => {
    expect(classNames("a", "b", "c")).toBe("a b c");
  });

  it("skips falsy arguments", () => {
    expect(classNames("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns an empty string for no truthy arguments", () => {
    expect(classNames(false, null, undefined)).toBe("");
  });
});
```

If the extracted source exports a different function name or accepts a different argument shape (e.g. an object map instead of variadic strings), adjust the test to match what Step 3's extraction actually produced — read the extracted file before finalizing this test.

- [ ] **Step 13: Run the test to verify it fails**

Run: `cd packages/uix-utils && npx vitest run test/classnames.test.ts`
Expected: FAIL — module resolution error (package not yet buildable/linked) or the specific assertion, depending on whether `vitest` runs against source directly (it does, since `../src/classnames` is a direct relative import — expected failure is only if the extracted source has a different export name than assumed).

- [ ] **Step 14: Fix the test to match actual extracted source, then re-run**

Run: `cd packages/uix-utils && npx vitest run test/classnames.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 15: Write and run tests for the remaining 6 submodules**

Repeat the pattern from Steps 12-14 for `dom`, `eventbus`, `mergeprops`, `object`, `uuid`, `zindex`. For each:
1. Read the extracted `src/<module>/` files to determine exact exported names/signatures.
2. Write `test/<module>.test.ts` covering: at least one happy-path case, at least one edge case (empty input, falsy input, or the module's most common misuse).
3. Run `npx vitest run test/<module>.test.ts` and confirm PASS before moving to the next module.

Minimum coverage per module (adjust exact assertions to match real extracted signatures):
- `dom`: test `hasClass`/`addClass`/`removeClass` round-trip on a jsdom element.
- `eventbus`: test `EventBus`'s `on`/`emit`/`off` lifecycle.
- `mergeprops`: test that later arguments override earlier ones, and that `class`/`className` keys are merged via `classNames` rather than overwritten.
- `object`: test `deepMerge` on nested objects, `isEmpty`/`isNotEmpty` on `{}`, `[]`, `null`, `"x"`.
- `uuid`: test that two calls produce different values and the result matches an expected format (read the extracted source for the exact format — likely a `p-` prefixed counter or UUID-like string, not a stdlib UUID).
- `zindex`: test that sequential `get`/`generate` calls produce increasing values.

- [ ] **Step 16: Build the package**

Run: `cd packages/uix-utils && npx tsup`
Expected: `dist/index.mjs`, `dist/index.d.mts`, and one `dist/<submodule>/index.mjs` + `.d.mts` per submodule, all with `.map` files, build succeeds with no TypeScript errors.

- [ ] **Step 17: Verify package exports resolve**

Create `packages/uix-utils/test/exports.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

const submodules = ["classnames", "dom", "eventbus", "mergeprops", "object", "uuid", "zindex"];

describe("package exports", () => {
  it("barrel entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "index.d.mts"))).toBe(true);
  });

  for (const name of submodules) {
    it(`${name} subpath entry point builds`, () => {
      expect(existsSync(join(__dirname, "..", "dist", name, "index.mjs"))).toBe(true);
      expect(existsSync(join(__dirname, "..", "dist", name, "index.d.mts"))).toBe(true);
    });
  }
});
```

Run: `cd packages/uix-utils && npx vitest run test/exports.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 18: Run full package test suite**

Run: `cd packages/uix-utils && npx vitest run`
Expected: all tests PASS (classnames, dom, eventbus, mergeprops, object, uuid, zindex, exports — 8 files).

- [ ] **Step 19: Typecheck**

Run: `cd packages/uix-utils && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 20: Write the package README**

Create `packages/uix-utils/README.md`:

```markdown
# @ultimate/uix-utils

Framework-neutral utility functions for the Ultimate Platform UI foundation: DOM helpers, class-name composition, an event bus, prop merging, object helpers, UUID generation, and z-index management.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Provenance

Adapted from `@primeuix/utils@0.7.2` (MIT, PrimeTek). See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/uix-utils.json` for exact file-level lineage. See `THIRD-PARTY-NOTICES.md` for the full upstream license text.

## Modules

- `classnames` — conditional class-name string composition
- `dom` — browser DOM helper functions (focus management, scroll/viewport measurement, RTL detection, reduced-motion detection, style-tag injection)
- `eventbus` — a minimal typed event bus
- `mergeprops` — merges prop objects, combining `class`/`className` keys instead of overwriting
- `object` — pure object/array/string helper functions (deep merge, comparators, case conversion, etc.)
- `uuid` — unique identifier generation
- `zindex` — sequential z-index value management

## Usage

\`\`\`typescript
import { classNames } from "@ultimate/uix-utils/classnames";
import { hasClass } from "@ultimate/uix-utils/dom";
\`\`\`

Or import everything from the barrel:

\`\`\`typescript
import { classNames, hasClass } from "@ultimate/uix-utils";
\`\`\`
```

- [ ] **Step 21: Register the package in the root TypeScript project (if applicable) and verify workspace linking**

Run: `pnpm install`
Expected: pnpm recognizes `packages/uix-utils` as a new workspace member (via `pnpm-workspace.yaml`'s `packages/*` glob), no errors.

- [ ] **Step 22: Verify boundary and ceiling checks pass for this package**

Run: `pnpm run boundary:validate`
Expected: `[boundary:validate] OK: scanned 1 uix package(s), zero framework-specific imports found` (or similar — count reflects however many `packages/uix*` dirs exist at this point; `uix-utils` must show zero violations).

Run: `pnpm run ceiling:validate`
Expected: passes (no forbidden deps declared in `packages/uix-utils/package.json`).

- [ ] **Step 23: Commit**

```bash
git add packages/uix-utils/ .vendor-extracted/
git commit -m "feat(uix-utils): incorporate @primeuix/utils@0.7.2 as @ultimate/uix-utils

Extracted via sourcemap recovery (scripts/provenance/extract-source.mjs)
from the Phase 0 pinned tarball, cross-package imports adapted from
@primeuix/utils to @ultimate/uix-utils. All 7 modules (classnames, dom,
eventbus, mergeprops, object, uuid, zindex) retained verbatim per the
Phase 1 spec's RETAIN classification."
```

Note: `.vendor-extracted/` is gitignored (Task 1, Step 1) — this `git add` picks up nothing from it; listed here only for clarity that the working tree contains it locally.

---

## Task 3: `@ultimate/uix-styled` package

**Files:**
- Create: `packages/uix-styled/package.json`
- Create: `packages/uix-styled/tsup.config.ts`
- Create: `packages/uix-styled/vitest.config.ts`
- Create: `packages/uix-styled/tsconfig.json`
- Create: `packages/uix-styled/src/**/*.ts` (extracted + adapted, 19 files)
- Create: `packages/uix-styled/src/index.ts` (barrel, if extraction doesn't already produce one at `src/index.ts` — verify in Step 1)
- Create: `packages/uix-styled/test/*.test.ts`
- Create: `packages/uix-styled/README.md`

**Interfaces:**
- Consumes: `scripts/provenance/extract-source.mjs`, `scripts/provenance/adapt-imports.mjs` (Task 1). Consumes `@ultimate/uix-utils` (Task 2) — exact functions used: `EventBus` (from `eventbus`), `createStyleMarkup`, `isNotEmpty`, `deepMerge`, `getKeyValue`, `isArray`, `isNumber`, `isObject`, `isString`, `matchRegex`, `toKebabCase`, `isEmpty`, `minifyCSS`, `resolve`, `mergeKeys` (all from `object`).
- Produces: `@ultimate/uix-styled` package, single entry point. Exports (confirmed via investigation): `definePreset`, `updatePreset`, `usePreset`, `useTheme`, `updatePrimaryPalette`, `updateSurfacePalette`, `dt`, `t`, `toVariables`, plus palette helpers (`mix`, `shade`, `tint`) and a stylesheet registration service.

- [ ] **Step 1: Extract source from the pinned tarball**

```bash
node scripts/provenance/extract-source.mjs .vendor-cache/@primeuix__styled-0.7.4.tar.gz .vendor-extracted/uix-styled
```

Expected: `[extract-source] wrote 19 file(s) from 1 sourcemap(s) to .vendor-extracted/uix-styled`

- [ ] **Step 2: Verify extraction output structure**

Run: `find .vendor-extracted/uix-styled/src -maxdepth 1 -type d | sort`
Expected: `actions`, `config`, `helpers`, `service`, `stylesheet`, `utils` (6 subdirectories, matching the sourcemap `sources` list from the spec investigation).

- [ ] **Step 3: Copy extracted source into the package**

```bash
mkdir -p packages/uix-styled/src
cp -r .vendor-extracted/uix-styled/src/. packages/uix-styled/src/
```

- [ ] **Step 4: Adapt cross-package import specifiers**

```bash
node scripts/provenance/adapt-imports.mjs packages/uix-styled/src --from @primeuix/utils --to @ultimate/uix-utils
```

Expected: `[adapt-imports] rewrote 10 specifier(s) across N file(s)` (matches the 10 distinct `@primeuix/utils*` import lines confirmed during spec investigation, some files have multiple).

- [ ] **Step 5: Verify no `@primeuix` references remain**

Run: `grep -rl "@primeuix" packages/uix-styled/src/ || echo "CLEAN"`
Expected: `CLEAN`

- [ ] **Step 6: Write the barrel entry point**

Read the extracted `src/actions/`, `src/service/`, `src/config/`, `src/stylesheet/` files to confirm exact exported symbol names. Create `packages/uix-styled/src/index.ts` re-exporting everything at the top-level public surface identified during investigation:

```typescript
export { default as definePreset } from "./actions/definePreset";
export { default as updatePreset } from "./actions/updatePreset";
export { default as updatePrimaryPalette } from "./actions/updatePrimaryPalette";
export { default as updateSurfacePalette } from "./actions/updateSurfacePalette";
export { default as usePreset } from "./actions/usePreset";
export { default as useTheme } from "./actions/useTheme";
export * from "./config";
export { default as mix } from "./helpers/color/mix";
export { default as palette } from "./helpers/color/palette";
export { default as shade } from "./helpers/color/shade";
export { default as tint } from "./helpers/color/tint";
export * from "./helpers/dt";
export * from "./helpers/t";
export * from "./helpers/toVariables";
export * from "./service";
export * from "./stylesheet";
```

Adjust each line's exact export style (default vs. named) to match what Step 3's extracted files actually declare — read every file under `src/actions/`, `src/helpers/`, `src/service/`, `src/stylesheet/`, `src/config/` before finalizing this barrel.

- [ ] **Step 7: Write `package.json`**

Create `packages/uix-styled/package.json`:

```json
{
  "name": "@ultimate/uix-styled",
  "version": "0.1.0",
  "description": "Theme/preset resolution engine for the Ultimate Platform UI foundation.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "default": "./dist/index.mjs"
    }
  },
  "files": ["dist", "README.md", "THIRD-PARTY-NOTICES.md"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@ultimate/uix-utils": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.3.0",
    "typescript": "^5.9.3",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 8: Write `tsup.config.ts`**

Create `packages/uix-styled/tsup.config.ts`:

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
```

- [ ] **Step 9: Write `tsconfig.json`**

Create `packages/uix-styled/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 10: Write `vitest.config.ts`**

Create `packages/uix-styled/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
  },
});
```

Add `jsdom` to `devDependencies` (needed for the stylesheet-registration test in Step 14):

```json
    "jsdom": "^25.0.1"
```

- [ ] **Step 11: Write the failing test for `definePreset`/`usePreset`**

Read `packages/uix-styled/src/actions/definePreset.ts` and `usePreset.ts` to confirm exact signatures, then create `packages/uix-styled/test/preset.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { definePreset } from "../src/actions/definePreset";

describe("definePreset", () => {
  it("deep-merges multiple preset objects into one", () => {
    const base = { primitive: { blue: { 500: "#3B82F6" } } };
    const override = { primitive: { blue: { 500: "#2563EB" } } };
    const result = definePreset(base, override);
    expect(result.primitive.blue["500"]).toBe("#2563EB");
  });

  it("preserves keys not present in the override", () => {
    const base = { primitive: { blue: { 500: "#3B82F6" }, green: { 500: "#10B981" } } };
    const override = { primitive: { blue: { 500: "#2563EB" } } };
    const result = definePreset(base, override);
    expect(result.primitive.green["500"]).toBe("#10B981");
  });
});
```

- [ ] **Step 12: Run the test, fix to match actual extracted signatures if needed, verify pass**

Run: `cd packages/uix-styled && npx vitest run test/preset.test.ts`
Expected: PASS (2 tests) after any signature adjustment.

- [ ] **Step 13: Write the failing test for `dt`/`t` token resolution**

Read `packages/uix-styled/src/helpers/dt.ts` and `t.ts` to confirm exact signatures, then create `packages/uix-styled/test/token-resolution.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { dt } from "../src/helpers/dt";

describe("dt (design token resolution)", () => {
  it("resolves a dotted token path to a CSS var() reference", () => {
    const result = dt("primary.color");
    expect(result).toContain("var(");
    expect(result).toContain("--p-primary-color");
  });

  it("is deterministic for the same input", () => {
    expect(dt("primary.color")).toBe(dt("primary.color"));
  });
});
```

Adjust the exact expected string format to match what the real extracted `dt` implementation produces — read the source before finalizing.

- [ ] **Step 14: Run the test, fix to match actual source, verify pass**

Run: `cd packages/uix-styled && npx vitest run test/token-resolution.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 15: Write the failing test for the stylesheet registration service**

Read `packages/uix-styled/src/service/index.ts` to confirm the exact API (likely a singleton or factory managing `<style>` tag insertion), then create `packages/uix-styled/test/stylesheet-service.test.ts` covering: registering a style adds a `<style>` element to `document.head` (or wherever the service targets), and re-registering the same named style does not duplicate the element. Use jsdom's `document` global (available automatically via `vitest.config.ts`'s `environment: "jsdom"`).

```typescript
import { describe, it, expect, beforeEach } from "vitest";
// Adjust this import to match the actual exported service API found in src/service/index.ts
import { StyleService } from "../src/service";

describe("stylesheet registration service", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it("registers a style and inserts a style element", () => {
    StyleService.add("test-style", ".foo { color: red; }");
    expect(document.head.querySelector("style")).not.toBeNull();
  });

  it("does not duplicate an already-registered style", () => {
    StyleService.add("test-style", ".foo { color: red; }");
    StyleService.add("test-style", ".foo { color: red; }");
    expect(document.head.querySelectorAll("style[data-primevue-style-id='test-style'], style#test-style").length).toBeLessThanOrEqual(1);
  });
});
```

This step requires reading the actual extracted `service/index.ts` before finalizing — the exact API surface, method names, and dedup mechanism (attribute name, id scheme) must come from the real source, not be assumed.

- [ ] **Step 16: Run the test, fix to match actual source, verify pass**

Run: `cd packages/uix-styled && npx vitest run test/stylesheet-service.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 17: Build the package**

Run: `cd packages/uix-styled && npx tsup`
Expected: `dist/index.mjs`, `dist/index.d.mts`, `dist/index.mjs.map`, build succeeds.

- [ ] **Step 18: Verify package exports resolve**

Create `packages/uix-styled/test/exports.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("package exports", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "index.d.mts"))).toBe(true);
  });

  it("every barrel export is callable/defined", async () => {
    const mod = await import("../dist/index.mjs");
    expect(mod.definePreset).toBeTypeOf("function");
    expect(mod.usePreset).toBeTypeOf("function");
    expect(mod.useTheme).toBeTypeOf("function");
    expect(mod.dt).toBeTypeOf("function");
    expect(mod.t).toBeTypeOf("function");
  });
});
```

Run: `cd packages/uix-styled && npx vitest run test/exports.test.ts`
Expected: PASS (2 tests) — adjust the exact export name assertions to match Step 6's real barrel if any names differ.

- [ ] **Step 19: Run full package test suite and typecheck**

Run: `cd packages/uix-styled && npx vitest run && npx tsc --noEmit`
Expected: all tests PASS, no type errors.

- [ ] **Step 20: Write the package README**

Create `packages/uix-styled/README.md`:

```markdown
# @ultimate/uix-styled

Theme/preset resolution engine for the Ultimate Platform UI foundation: design-token resolution (`dt`/`t`), preset merging, palette generation, and runtime stylesheet registration.

**Status:** unstable (pre-1.0). No semver guarantee yet.

This package is styling *infrastructure* — the mechanism that turns a theme's tokens into usable CSS. It does not define what tokens exist or what values they hold (that is a theme's responsibility, deferred to Phase 5), and it does not contain any component's styles (deferred to each component's own migration phase).

## Provenance

Adapted from `@primeuix/styled@0.7.4` (MIT, PrimeTek). See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/uix-styled.json` for exact file-level lineage. See `THIRD-PARTY-NOTICES.md` for the full upstream license text.

## Dependencies

Depends on `@ultimate/uix-utils` (workspace).

## Usage

\`\`\`typescript
import { definePreset, usePreset, dt } from "@ultimate/uix-styled";
\`\`\`
```

- [ ] **Step 21: Install workspace link and verify checks**

Run: `pnpm install`
Expected: `@ultimate/uix-styled` resolves its `@ultimate/uix-utils` workspace dependency, no errors.

Run: `pnpm run boundary:validate && pnpm run ceiling:validate`
Expected: both pass.

- [ ] **Step 22: Commit**

```bash
git add packages/uix-styled/
git commit -m "feat(uix-styled): incorporate @primeuix/styled@0.7.4 as @ultimate/uix-styled

Extracted via sourcemap recovery from the Phase 0 pinned tarball,
cross-package imports adapted to @ultimate/uix-utils. Retained as
styling infrastructure (token resolution, preset merge, stylesheet
registration) per the Phase 1 spec's RETAIN classification."
```

---

## Task 4: `@ultimate/uix-motion` package

**Files:**
- Create: `packages/uix-motion/package.json`
- Create: `packages/uix-motion/tsup.config.ts`
- Create: `packages/uix-motion/vitest.config.ts`
- Create: `packages/uix-motion/tsconfig.json`
- Create: `packages/uix-motion/src/**/*.ts` (extracted + adapted, 2 files)
- Create: `packages/uix-motion/src/index.ts` (barrel)
- Create: `packages/uix-motion/test/*.test.ts`
- Create: `packages/uix-motion/README.md`

**Interfaces:**
- Consumes: `scripts/provenance/extract-source.mjs`, `scripts/provenance/adapt-imports.mjs` (Task 1). Consumes `@ultimate/uix-utils` (Task 2) — exact functions used: `addClass`, `removeClass` (from `dom`), `getHiddenElementDimensions`, `isPrefersReducedMotion`, `setCSSProperty`, `toMs` (from `dom`/`object` — confirm exact submodule per function when reading extracted source).
- Produces: `@ultimate/uix-motion` package, single entry point. Exports: `createMotion(element: Element, options?: MotionOptions): MotionInstance`, `DEFAULT_MOTION_OPTIONS`, `shouldSkipMotion`.

- [ ] **Step 1: Extract source from the pinned tarball**

```bash
node scripts/provenance/extract-source.mjs .vendor-cache/@primeuix__motion-0.0.10.tar.gz .vendor-extracted/uix-motion
```

Expected: `[extract-source] wrote 2 file(s) from 1 sourcemap(s) to .vendor-extracted/uix-motion`

- [ ] **Step 2: Verify extraction output**

Run: `find .vendor-extracted/uix-motion/src -type f`
Expected: `.vendor-extracted/uix-motion/src/config/index.ts`, `.vendor-extracted/uix-motion/src/utils/index.ts`

- [ ] **Step 3: Copy extracted source into the package**

```bash
mkdir -p packages/uix-motion/src
cp -r .vendor-extracted/uix-motion/src/. packages/uix-motion/src/
```

Also copy the shared type definitions this package's sourcemap references (`../../types` — a file outside `src/` in the upstream package root, per the investigation's sourcemap read: `import type { ... } from '../../types'`). Extract this separately:

```bash
node scripts/provenance/extract-source.mjs .vendor-cache/@primeuix__motion-0.0.10.tar.gz .vendor-extracted/uix-motion-types
find .vendor-extracted/uix-motion-types -iname "types*"
```

If a `types.ts`/`types.d.ts` file is found outside the `src/` prefix (the extraction script's `resolveToSrcRelative` requires a `src` segment — if the types file's sourcemap path has no `src` segment, `extract-source.mjs` will throw for that specific source entry). In that case, manually locate the types definitions by reading `dist/types.d.mts` in the extracted tarball directly (not via sourcemap, since `.d.mts` files are not sourcemapped) and transcribe the type shape into `packages/uix-motion/src/types.ts`, adjusted to match what `config/index.ts` and `utils/index.ts` actually import.

- [ ] **Step 4: Adapt cross-package import specifiers**

```bash
node scripts/provenance/adapt-imports.mjs packages/uix-motion/src --from @primeuix/utils --to @ultimate/uix-utils
```

Expected: `[adapt-imports] rewrote 2 specifier(s) across 2 file(s)`.

- [ ] **Step 5: Fix relative type imports**

Read `packages/uix-motion/src/config/index.ts` and `utils/index.ts` — their `import type { ... } from '../../types'` lines reference a path one level above where `src/types.ts` now lives (since the upstream layout had `types.ts` at package root, not under `src/`). Update both files' type import to `from '../types'` (relative to `src/config/index.ts` and `src/utils/index.ts` respectively, now that `types.ts` lives at `packages/uix-motion/src/types.ts`).

- [ ] **Step 6: Verify no `@primeuix` references remain**

Run: `grep -rl "@primeuix" packages/uix-motion/src/ || echo "CLEAN"`
Expected: `CLEAN`

- [ ] **Step 7: Write the barrel entry point**

Read `packages/uix-motion/src/config/index.ts` to confirm exact exported names (`createMotion`, `DEFAULT_MOTION_OPTIONS` confirmed during investigation), and `utils/index.ts` (`shouldSkipMotion`, `mergeOptions`, `resolveClassNames`, `resolveDuration` confirmed during investigation). Create `packages/uix-motion/src/index.ts`:

```typescript
export * from "./config";
export * from "./utils";
export * from "./types";
```

- [ ] **Step 8: Write `package.json`**

Create `packages/uix-motion/package.json`:

```json
{
  "name": "@ultimate/uix-motion",
  "version": "0.1.0",
  "description": "Class-based enter/leave transition orchestration, respecting prefers-reduced-motion, for the Ultimate Platform UI foundation.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "default": "./dist/index.mjs"
    }
  },
  "files": ["dist", "README.md", "THIRD-PARTY-NOTICES.md"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@ultimate/uix-utils": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.3.0",
    "typescript": "^5.9.3",
    "vitest": "^2.1.8",
    "jsdom": "^25.0.1"
  }
}
```

- [ ] **Step 9: Write `tsup.config.ts`, `tsconfig.json`, `vitest.config.ts`**

Create `packages/uix-motion/tsup.config.ts`:

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
```

Create `packages/uix-motion/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Create `packages/uix-motion/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
  },
});
```

- [ ] **Step 10: Write the failing test for `shouldSkipMotion`**

Read `packages/uix-motion/src/utils/index.ts` to confirm the exact `shouldSkipMotion` signature, then create `packages/uix-motion/test/should-skip-motion.test.ts`:

```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import { shouldSkipMotion } from "../src/utils";

describe("shouldSkipMotion", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false when options are undefined", () => {
    expect(shouldSkipMotion(undefined)).toBe(false);
  });

  it("returns true when options.disabled is true", () => {
    expect(shouldSkipMotion({ disabled: true })).toBe(true);
  });

  it("returns true when options.safe is true and prefers-reduced-motion is set", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    );
    expect(shouldSkipMotion({ safe: true })).toBe(true);
  });

  it("returns false when options.safe is true but prefers-reduced-motion is not set", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    );
    expect(shouldSkipMotion({ safe: true })).toBe(false);
  });
});
```

Adjust the `matchMedia` mock shape to match however `isPrefersReducedMotion` (in `@ultimate/uix-utils/dom`) actually queries it — read that function's real source (extracted in Task 2) before finalizing this test.

- [ ] **Step 11: Run the test, fix to match actual source, verify pass**

Run: `cd packages/uix-motion && npx vitest run test/should-skip-motion.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 12: Write the failing test for `createMotion`**

Read `packages/uix-motion/src/config/index.ts` to confirm the exact `createMotion` signature and returned `MotionInstance` shape, then create `packages/uix-motion/test/create-motion.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { createMotion } from "../src/config";

describe("createMotion", () => {
  it("throws when called without an element", () => {
    // @ts-expect-error - testing runtime guard against missing element
    expect(() => createMotion(undefined)).toThrow();
  });

  it("returns a motion instance for a valid element", () => {
    const el = document.createElement("div");
    const instance = createMotion(el, { disabled: true });
    expect(instance).toBeDefined();
  });
});
```

Adjust assertions on the returned `MotionInstance`'s exact shape (method names for triggering enter/leave) to match the real extracted source.

- [ ] **Step 13: Run the test, fix to match actual source, verify pass**

Run: `cd packages/uix-motion && npx vitest run test/create-motion.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 14: Build the package**

Run: `cd packages/uix-motion && npx tsup`
Expected: `dist/index.mjs`, `dist/index.d.mts`, `dist/index.mjs.map`, build succeeds.

- [ ] **Step 15: Verify package exports resolve**

Create `packages/uix-motion/test/exports.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("package exports", () => {
  it("entry point builds", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "index.d.mts"))).toBe(true);
  });

  it("createMotion and shouldSkipMotion are exported", async () => {
    const mod = await import("../dist/index.mjs");
    expect(mod.createMotion).toBeTypeOf("function");
    expect(mod.shouldSkipMotion).toBeTypeOf("function");
  });
});
```

Run: `cd packages/uix-motion && npx vitest run test/exports.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 16: Run full package test suite and typecheck**

Run: `cd packages/uix-motion && npx vitest run && npx tsc --noEmit`
Expected: all tests PASS, no type errors.

- [ ] **Step 17: Write the package README**

Create `packages/uix-motion/README.md`:

```markdown
# @ultimate/uix-motion

Class-based enter/leave transition orchestration for the Ultimate Platform UI foundation. Respects `prefers-reduced-motion` by default.

**Status:** unstable (pre-1.0). No semver guarantee yet.

CSS keyframe/transition definitions live in each component's own style module (deferred to Phase 2+, alongside the owning component) — this package only orchestrates *when* those classes are applied, not what they animate.

## Provenance

Adapted from `@primeuix/motion@0.0.10` (MIT, PrimeTek). See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/uix-motion.json` for exact file-level lineage. See `THIRD-PARTY-NOTICES.md` for the full upstream license text.

## Dependencies

Depends on `@ultimate/uix-utils` (workspace).

## Usage

\`\`\`typescript
import { createMotion } from "@ultimate/uix-motion";

const motion = createMotion(element, { safe: true });
\`\`\`

By default (`safe: true`), motion is automatically skipped when the user's system has `prefers-reduced-motion` enabled.
```

- [ ] **Step 18: Install workspace link and verify checks**

Run: `pnpm install`
Expected: resolves `@ultimate/uix-utils` workspace dependency, no errors.

Run: `pnpm run boundary:validate && pnpm run ceiling:validate`
Expected: both pass.

- [ ] **Step 19: Commit**

```bash
git add packages/uix-motion/
git commit -m "feat(uix-motion): incorporate @primeuix/motion@0.0.10 as @ultimate/uix-motion

Extracted via sourcemap recovery from the Phase 0 pinned tarball,
cross-package imports adapted to @ultimate/uix-utils. Retained
verbatim per the Phase 1 spec's RETAIN classification. Confirmed
prefers-reduced-motion handling (shouldSkipMotion + safe:true default)
carries over unchanged."
```

---

## Task 5: `@ultimate/uix-styles` package (base module only)

**Files:**
- Create: `packages/uix-styles/package.json`
- Create: `packages/uix-styles/tsup.config.ts`
- Create: `packages/uix-styles/vitest.config.ts`
- Create: `packages/uix-styles/tsconfig.json`
- Create: `packages/uix-styles/src/base/index.ts` (extracted verbatim, no adaptation needed — zero dependencies)
- Create: `packages/uix-styles/src/types.ts` (shared types, extracted)
- Create: `packages/uix-styles/src/index.ts` (barrel — base + types only)
- Create: `packages/uix-styles/test/*.test.ts`
- Create: `packages/uix-styles/README.md`

**Interfaces:**
- Consumes: `scripts/provenance/extract-source.mjs` (Task 1). No dependency on `uix-utils` (confirmed during investigation: `base` module is pure CSS template strings, zero imports).
- Produces: `@ultimate/uix-styles` package, exports `base` (a CSS string constant) and shared style-module `types` via subpath `./base` and barrel `.`. Later phases (2+) add per-component subpaths to this same package — Task 5 establishes only the `base`/`types` subset.

- [ ] **Step 1: Extract only the `base` and `types` sourcemaps from the pinned tarball**

The full `@primeuix/styles@2.0.3` tarball contains ~90 component style modules' sourcemaps in addition to `base`. Running `extract-source.mjs` unmodified against the whole tarball would recover all ~90 modules' source — out of Phase 1 scope. Extract to a scratch directory, then copy only what's needed:

```bash
node scripts/provenance/extract-source.mjs .vendor-cache/@primeuix__styles-2.0.3.tar.gz .vendor-extracted/uix-styles-full
```

Expected: `[extract-source] wrote N file(s) from ~91 sourcemap(s) to .vendor-extracted/uix-styles-full` (N is large — this is expected and correct; the *filtering* happens in the next step, not by limiting extraction).

- [ ] **Step 2: Verify the base module extracted correctly**

Run: `cat .vendor-extracted/uix-styles-full/src/base/index.ts | head -20`
Expected: CSS template string content starting with the box-sizing reset confirmed during spec investigation (`*, ::before, ::after { box-sizing: border-box; }`).

Run: `find .vendor-extracted/uix-styles-full/src -iname "types*"`
Expected: locates the shared types file (path confirmed by reading the top-level `index.mjs.map`'s `sources` array from this extraction — record the exact path found here for Step 3).

- [ ] **Step 3: Copy only `base` and the shared types into the package**

```bash
mkdir -p packages/uix-styles/src/base
cp .vendor-extracted/uix-styles-full/src/base/index.ts packages/uix-styles/src/base/index.ts
cp .vendor-extracted/uix-styles-full/src/types.ts packages/uix-styles/src/types.ts
```

(Adjust the `types.ts` source path in the second `cp` command to match whatever exact path Step 2 found — it may be `src/types.ts` or nested differently; use the real discovered path.)

- [ ] **Step 4: Verify zero per-component modules were copied**

Run: `find packages/uix-styles/src -type f`
Expected: exactly 2 files — `src/base/index.ts` and `src/types.ts` (plus `src/index.ts` created in Step 5).

- [ ] **Step 5: Write the barrel entry point**

Create `packages/uix-styles/src/index.ts`:

```typescript
export * from "./base";
export * from "./types";
```

Read `packages/uix-styles/src/base/index.ts`'s actual export style first (default export of a string constant, or named export — confirm and adjust this barrel line accordingly, e.g. `export { default as base } from "./base";` if it's a default export).

- [ ] **Step 6: Write `package.json`**

Create `packages/uix-styles/package.json`:

```json
{
  "name": "@ultimate/uix-styles",
  "version": "0.1.0",
  "description": "Global/base CSS infrastructure for the Ultimate Platform UI foundation.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "default": "./dist/index.mjs"
    },
    "./base": {
      "types": "./dist/base/index.d.mts",
      "import": "./dist/base/index.mjs",
      "default": "./dist/base/index.mjs"
    }
  },
  "files": ["dist", "README.md", "THIRD-PARTY-NOTICES.md"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "tsup": "^8.3.0",
    "typescript": "^5.9.3",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 7: Write `tsup.config.ts`, `tsconfig.json`, `vitest.config.ts`**

Create `packages/uix-styles/tsup.config.ts`:

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "base/index": "src/base/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
```

Create `packages/uix-styles/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Create `packages/uix-styles/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
```

(Node environment, not jsdom — `base` is a static string, no DOM interaction needed for its own tests.)

- [ ] **Step 8: Write the failing snapshot test for `base` CSS determinism**

Create `packages/uix-styles/test/base.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { base } from "../src/base";

describe("base styles", () => {
  it("is a non-empty string", () => {
    expect(typeof base).toBe("string");
    expect(base.length).toBeGreaterThan(0);
  });

  it("matches the known snapshot", () => {
    expect(base).toMatchSnapshot();
  });

  it("contains the expected global selectors", () => {
    expect(base).toContain(".p-disabled");
    expect(base).toContain(".p-icon");
    expect(base).toContain(".p-overlay-mask");
  });
});
```

Adjust the import (`import { base } from "../src/base"`) to match the actual export name/style confirmed in Step 5.

- [ ] **Step 9: Run the test to generate and verify the snapshot**

Run: `cd packages/uix-styles && npx vitest run test/base.test.ts`
Expected: PASS (3 tests), creates `packages/uix-styles/test/__snapshots__/base.test.ts.snap`.

- [ ] **Step 10: Write the failing scope-guard test**

This is the Phase 1 scope boundary enforcement test specified in the spec's Testing Requirements section — it must fail if a per-component selector pattern is ever accidentally added to `base`. Create `packages/uix-styles/test/scope-guard.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { base } from "../src/base";

const ALLOWED_SELECTOR_PREFIXES = [".p-disabled", ".p-icon", ".p-overlay-mask", ".p-collapsible", ".pi"];

// Matches any ".p-xxxx" class selector token in the CSS string.
const CLASS_SELECTOR_PATTERN = /\.p-[a-z][a-z0-9-]*/gi;

describe("base module scope guard", () => {
  it("contains only allow-listed .p-* selector prefixes (no per-component selectors leaked in)", () => {
    const found = [...new Set(base.match(CLASS_SELECTOR_PATTERN) ?? [])];
    const unexpected = found.filter(
      (selector) => !ALLOWED_SELECTOR_PREFIXES.some((allowed) => selector.startsWith(allowed))
    );
    expect(unexpected).toEqual([]);
  });
});
```

- [ ] **Step 11: Run the test, adjust allow-list to match real base content, verify pass**

Run: `cd packages/uix-styles && npx vitest run test/scope-guard.test.ts`

If it fails because the real `base` module contains a selector not in `ALLOWED_SELECTOR_PREFIXES` that is still genuinely global (not per-component) — e.g. a focus-visible or animation-keyframe selector confirmed during spec investigation — add it to the allow-list with a comment explaining why it's global-scope. If it fails because a genuinely per-component selector is present, this indicates Step 3 copied more than the `base` module — STOP and re-verify Step 2/3 extracted the correct file before proceeding.

Expected after adjustment: PASS (1 test).

- [ ] **Step 12: Build the package**

Run: `cd packages/uix-styles && npx tsup`
Expected: `dist/index.mjs`, `dist/index.d.mts`, `dist/base/index.mjs`, `dist/base/index.d.mts`, build succeeds.

- [ ] **Step 13: Verify package exports resolve**

Create `packages/uix-styles/test/exports.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("package exports", () => {
  it("barrel and base entry points build", () => {
    expect(existsSync(join(__dirname, "..", "dist", "index.mjs"))).toBe(true);
    expect(existsSync(join(__dirname, "..", "dist", "base", "index.mjs"))).toBe(true);
  });
});
```

Run: `cd packages/uix-styles && npx vitest run test/exports.test.ts`
Expected: PASS (1 test).

- [ ] **Step 14: Run full package test suite and typecheck**

Run: `cd packages/uix-styles && npx vitest run && npx tsc --noEmit`
Expected: all tests PASS (base, scope-guard, exports — 3 files), no type errors.

- [ ] **Step 15: Write the package README**

Create `packages/uix-styles/README.md`:

```markdown
# @ultimate/uix-styles

Global/base CSS infrastructure for the Ultimate Platform UI foundation.

**Status:** unstable (pre-1.0). No semver guarantee yet.

**Phase 1 scope:** this package currently ships only the `base` module (global box-sizing reset, disabled-state opacity, icon sizing, overlay-mask positioning, collapsible-panel animation keyframes) — the shared, framework-level CSS every component depends on. Per-component style modules (button, dialog, datatable, etc. — ~90 modules in the upstream `@primeuix/styles` package) are deferred: each migrates alongside its owning component during Phase 2 (Angular), Phase 3 (React), or Phase 4 (Vue), not speculatively now.

CSS class selectors (`.p-disabled`, `.p-icon`, etc.) are kept exactly as upstream — no renaming in Phase 1.

## Provenance

Adapted from `@primeuix/styles@2.0.3` (MIT, PrimeTek), `base` module only. See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/uix-styles.json` for exact file-level lineage. See `THIRD-PARTY-NOTICES.md` for the full upstream license text.

## Usage

\`\`\`typescript
import { base } from "@ultimate/uix-styles/base";
\`\`\`
```

- [ ] **Step 16: Install and verify checks**

Run: `pnpm install`
Expected: no errors (this package has no workspace dependencies to link).

Run: `pnpm run boundary:validate && pnpm run ceiling:validate`
Expected: both pass.

- [ ] **Step 17: Commit**

```bash
git add packages/uix-styles/
git commit -m "feat(uix-styles): incorporate @primeuix/styles@2.0.3 base module as @ultimate/uix-styles

Extracted via sourcemap recovery from the Phase 0 pinned tarball.
Phase 1 scope is the base module only (global reset, disabled state,
icon sizing, overlay mask, collapsible animation) — the ~90
per-component style modules are deferred to each component's own
migration phase (Phase 2/3/4), per the Phase 1 spec. .p-* selectors
kept verbatim, no renaming. Scope-guard test enforces this boundary."
```

---

## Task 6: Extend CI validators for the four new packages

**Files:**
- Modify: `scripts/provenance/validate-dependency-ceiling.mjs`
- Modify: `scripts/provenance/validate-dependency-ceiling.test.mjs` (new test file)

**Interfaces:**
- Consumes: nothing new — modifies existing script's `WATCHED_PREFIXES` constant.
- Produces: `validate-dependency-ceiling.mjs` now also scans `packages/uix*/package.json`, closing the gap identified in the spec's Dependency Rules section.

- [ ] **Step 1: Write the failing test proving the current gap**

Create `scripts/provenance/validate-dependency-ceiling.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test("validate-dependency-ceiling.mjs catches a forbidden @primeuix dependency in a packages/uix* package.json", () => {
  const workDir = mkdtempSync(join(tmpdir(), "ceiling-gap-test-"));
  const pkgDir = join(workDir, "packages", "uix-fake");
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@ultimate/uix-fake", dependencies: { "@primeuix/utils": "0.8.1" } })
  );

  const result = spawnSync("node", [join(process.cwd(), "scripts/provenance/validate-dependency-ceiling.mjs")], {
    cwd: workDir,
    encoding: "utf8",
  });

  assert.equal(result.status, 1, "expected the script to fail (exit code 1) on a ceiling violation");
  assert.match(result.stderr, /VIOLATION/);

  rmSync(workDir, { recursive: true, force: true });
});
```

- [ ] **Step 2: Run the test to verify it fails (proving the gap)**

Run: `node --test scripts/provenance/validate-dependency-ceiling.test.mjs`
Expected: FAIL — the test's assertion `result.status === 1` fails because the current script's `WATCHED_PREFIXES = ["ng", "react", "vue"]` does not include `"uix"`, so it exits 0 ("nothing to validate") instead of catching the violation.

- [ ] **Step 3: Fix the gap**

In `scripts/provenance/validate-dependency-ceiling.mjs`, change:

```javascript
const WATCHED_PREFIXES = ["ng", "react", "vue"];
```

to:

```javascript
const WATCHED_PREFIXES = ["uix", "ng", "react", "vue"];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test scripts/provenance/validate-dependency-ceiling.test.mjs`
Expected: PASS.

- [ ] **Step 5: Run the full ceiling check against the real repo (regression check)**

Run: `pnpm run ceiling:validate`
Expected: `[ceiling:validate] OK: scanned N package.json file(s), zero violations` — N now includes all four real `packages/uix-*` package.json files created in Tasks 2-5, all clean (none declare a forbidden dependency).

- [ ] **Step 6: Commit**

```bash
git add scripts/provenance/validate-dependency-ceiling.mjs scripts/provenance/validate-dependency-ceiling.test.mjs
git commit -m "fix(provenance): watch packages/uix* in dependency-ceiling validation

The Phase 0 script only watched packages/{ng,react,vue}*, missing the
uix-* packages themselves — a stray @primeuix/* runtime dependency in
a uix-* package.json would have gone undetected. Gap identified during
Phase 1 spec review."
```

---

## Task 7: File-level provenance manifests and `validate-provenance.mjs` extension

**Files:**
- Create: `docs/architecture/provenance/uix-utils.json`
- Create: `docs/architecture/provenance/uix-styled.json`
- Create: `docs/architecture/provenance/uix-styles.json`
- Create: `docs/architecture/provenance/uix-motion.json`
- Create: `scripts/provenance/generate-manifest.mjs`
- Modify: `scripts/provenance/validate-provenance.mjs`
- Create: `scripts/provenance/validate-provenance-manifest.test.mjs`

**Interfaces:**
- Consumes: the real `packages/uix-*/src/` trees built in Tasks 2-5.
- Produces: `docs/architecture/provenance/<package>.json` — array of `{ originalPath, ultimateDestination, modificationStatus, modificationDescription }`. `validate-provenance.mjs` gains a check that every `.ts` file under each `packages/uix-*/src/` has a corresponding manifest entry.

- [ ] **Step 1: Write `generate-manifest.mjs` to auto-populate the manifest from the actual source tree**

Create `scripts/provenance/generate-manifest.mjs`:

```javascript
#!/usr/bin/env node
// scripts/provenance/generate-manifest.mjs
//
// Walks a packages/uix-*/src/ tree and writes docs/architecture/provenance/<name>.json,
// one entry per .ts file, defaulting modificationStatus based on whether
// scripts/provenance/adapt-imports.mjs touched the file (detected by checking
// for an @ultimate/uix- import that would only exist post-adaptation).
//
// Usage: node generate-manifest.mjs <package-dir> <package-name> <upstream-src-prefix>
// Example: node generate-manifest.mjs packages/uix-utils uix-utils src/

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

const [, , packageDir, packageName] = process.argv;

if (!packageDir || !packageName) {
  console.error("Usage: generate-manifest.mjs <package-dir> <package-name>");
  process.exit(1);
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.name.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

const srcDir = join(packageDir, "src");
const files = walk(srcDir);

const entries = files.map((file) => {
  const content = readFileSync(file, "utf8");
  const relPath = relative(packageDir, file);
  const modified = /@ultimate\/uix-/.test(content);
  return {
    originalPath: relPath.replace(/^src\//, "src/"),
    ultimateDestination: relative(process.cwd(), file),
    modificationStatus: modified ? "import-path-adapted" : "unmodified",
    modificationDescription: modified
      ? "cross-package @primeuix/* import specifiers rewritten to @ultimate/uix-* via scripts/provenance/adapt-imports.mjs"
      : "none",
  };
});

mkdirSync("docs/architecture/provenance", { recursive: true });
const outPath = join("docs/architecture/provenance", `${packageName}.json`);
writeFileSync(outPath, JSON.stringify(entries, null, 2) + "\n");
console.log(`[generate-manifest] wrote ${entries.length} entries to ${outPath}`);
```

- [ ] **Step 2: Run it for all four packages**

```bash
node scripts/provenance/generate-manifest.mjs packages/uix-utils uix-utils
node scripts/provenance/generate-manifest.mjs packages/uix-styled uix-styled
node scripts/provenance/generate-manifest.mjs packages/uix-styles uix-styles
node scripts/provenance/generate-manifest.mjs packages/uix-motion uix-motion
```

Expected: 4 files created under `docs/architecture/provenance/`, entry counts matching each package's real `src/` file count (137, 19, 2, 2 — matching Tasks 2-5's extraction outputs).

- [ ] **Step 3: Spot-check one manifest for correctness**

Run: `cat docs/architecture/provenance/uix-motion.json`
Expected: 2 entries (`config/index.ts`, `utils/index.ts`), both with `modificationStatus: "import-path-adapted"` (both were touched by `adapt-imports.mjs` in Task 4).

Note: `types.ts` (added manually in Task 4 Step 3, not from the sourcemap extraction directly if it required the manual `.d.mts` transcription fallback) may or may not appear depending on whether it lives under `src/`. If it does, it will show `modificationStatus: "unmodified"` unless it also references `@ultimate/uix-`.

- [ ] **Step 4: Write the failing test for the manifest-completeness validator extension**

Create `scripts/provenance/validate-provenance-manifest.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test("validate-provenance.mjs fails when a source file has no manifest entry", () => {
  const workDir = mkdtempSync(join(tmpdir(), "manifest-gap-test-"));

  mkdirSync(join(workDir, "docs", "architecture", "provenance"), { recursive: true });
  writeFileSync(
    join(workDir, "docs", "architecture", "PROVENANCE.md"),
    [
      "## PrimeNG",
      "## PrimeVue",
      "## PrimeReact",
      "## @primeuix/utils",
      "## @primeuix/styled",
      "## @primeuix/styles",
      "## @primeuix/motion",
      "",
    ].join("\n")
  );
  writeFileSync(join(workDir, "docs", "architecture", "provenance", "uix-utils.json"), "[]\n");

  mkdirSync(join(workDir, "packages", "uix-utils", "src"), { recursive: true });
  writeFileSync(join(workDir, "packages", "uix-utils", "src", "orphan.ts"), "export const x = 1;\n");

  const result = spawnSync("node", [join(process.cwd(), "scripts/provenance/validate-provenance.mjs")], {
    cwd: workDir,
    encoding: "utf8",
  });

  assert.equal(result.status, 1, "expected failure: orphan.ts has no manifest entry");

  rmSync(workDir, { recursive: true, force: true });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `node --test scripts/provenance/validate-provenance-manifest.test.mjs`
Expected: FAIL — current `validate-provenance.mjs` has no manifest-completeness check at all, so it exits 0.

- [ ] **Step 6: Implement the manifest-completeness check**

Read the current `scripts/provenance/validate-provenance.mjs` in full first, then add this logic before the final `console.log("[provenance:validate] all checks passed");` line:

```javascript
// Manifest completeness: every .ts file under packages/uix-*/src/ must have
// a corresponding entry in docs/architecture/provenance/<package-name>.json.
import { readdirSync as readdirSyncManifest, statSync as statSyncManifest } from "node:fs";

function findUixPackageDirs(root = "packages") {
  if (!existsSync(root)) return [];
  return readdirSyncManifest(root)
    .filter((name) => name.startsWith("uix"))
    .map((name) => ({ name, path: join(root, name) }))
    .filter(({ path }) => statSyncManifest(path).isDirectory());
}

function walkTsFiles(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSyncManifest(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkTsFiles(full, files);
    } else if (entry.name.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

const uixPackages = findUixPackageDirs();
for (const { name, path } of uixPackages) {
  const manifestPath = join("docs/architecture/provenance", `${name}.json`);
  const srcFiles = walkTsFiles(join(path, "src"));

  if (srcFiles.length === 0) continue;

  if (!existsSync(manifestPath)) {
    fail(`${path} has source files but no manifest at ${manifestPath}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const manifestPaths = new Set(manifest.map((entry) => entry.ultimateDestination));

  for (const file of srcFiles) {
    if (!manifestPaths.has(file)) {
      fail(`${file} has no entry in ${manifestPath}`);
    }
  }
  pass(`${name}: all ${srcFiles.length} source file(s) have manifest entries`);
}
```

Adjust the exact import merge (the script already imports `existsSync`, `readFileSync` at the top — reuse those instead of re-importing with aliased names if the existing script's imports already cover them; read the actual current top-of-file imports before finalizing this edit to avoid duplicate/conflicting imports).

- [ ] **Step 7: Run the test to verify it passes**

Run: `node --test scripts/provenance/validate-provenance-manifest.test.mjs`
Expected: PASS.

- [ ] **Step 8: Run the full provenance check against the real repo (regression check)**

Run: `pnpm run provenance:validate`
Expected: passes — all four real manifests (Step 2) cover all four real `src/` trees (Tasks 2-5).

- [ ] **Step 9: Commit**

```bash
git add scripts/provenance/generate-manifest.mjs scripts/provenance/validate-provenance.mjs \
  scripts/provenance/validate-provenance-manifest.test.mjs \
  docs/architecture/provenance/
git commit -m "feat(provenance): add file-level manifest generation and completeness check

One docs/architecture/provenance/<package>.json per uix-* package,
one entry per incorporated source file (original path, Ultimate
destination, modification status). validate-provenance.mjs now fails
if any packages/uix-*/src/*.ts file lacks a manifest entry."
```

---

## Task 8: Update `PROVENANCE.md`, `DECISIONS.md`, and package-level docs

**Files:**
- Modify: `docs/architecture/PROVENANCE.md`
- Modify: `docs/architecture/DECISIONS.md`

**Interfaces:**
- Consumes: nothing new — this task only updates prose/status fields to reflect Tasks 1-7's real state.

- [ ] **Step 1: Update the four PrimeUIX entries in `PROVENANCE.md`**

Read the current `docs/architecture/PROVENANCE.md` in full. For each of the four `@primeuix/*` sections (`utils`, `styled`, `styles`, `motion`), change:

```
- **Modification status:** not yet incorporated (Phase 0 — baseline pinned only)
- **Modification description:** n/a
- **Date incorporated:** n/a (pinned 2026-08-28; incorporation begins Phase 1)
```

to (using the real completion date — substitute the actual date this task is executed):

```
- **Modification status:** incorporated (Phase 1) — cross-package `@primeuix/*` import specifiers adapted to `@ultimate/uix-*` via `scripts/provenance/adapt-imports.mjs`; all other source retained verbatim. File-level detail: `docs/architecture/provenance/uix-<name>.json`.
- **Modification description:** see file-level manifest at `docs/architecture/provenance/uix-<name>.json` for per-file status.
- **Date incorporated:** <actual execution date>
```

For `@primeuix/styles` specifically, add a note that only the `base` module was incorporated:

```
- **Modification status:** incorporated (Phase 1) — `base` module only; ~90 per-component style modules remain classified LATER PHASE per the Phase 1 spec, deferred to each component's own migration phase (2/3/4). No import adaptation needed (zero dependencies). File-level detail: `docs/architecture/provenance/uix-styles.json`.
```

- [ ] **Step 2: Add ADR-016 to `DECISIONS.md`**

Read the current `docs/architecture/DECISIONS.md` in full, then append after ADR-015:

```markdown

## ADR-016 — Sourcemap extraction as the Phase 1 vendoring mechanism

Status: Accepted (Phase 1 spec, `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md`). The four pinned `@primeuix/*` npm tarballs ship only compiled dist output (`.mjs`/`.d.mts`), no `src/` directory, and the upstream `primefaces/primeuix` GitHub repository's history never reached these exact pinned versions (confirmed gap, Phase 0 Finding 3). Investigation found that every pinned tarball's published `.mjs.map` sourcemaps embed a complete `sourcesContent` array — the original per-file TypeScript source at the exact pinned MIT baseline. `scripts/provenance/extract-source.mjs` recovers this source deterministically from the same checksummed tarballs Phase 0 already pinned (`docs/architecture/checksums.json`), with no network access required at extraction time. This is the official Phase 1+ vendoring mechanism for these four packages.

## ADR-017 — `uix-styles` Phase 1 scope is the `base` module only

Status: Accepted (Phase 1 spec). `@primeuix/styles@2.0.3` ships a `base` module (global/framework-level CSS: box-sizing reset, disabled-state opacity, icon sizing, overlay-mask positioning, collapsible-panel animation) alongside ~90 per-component style modules (button, dialog, datatable, etc.). Phase 1 incorporates only `base` — the ~90 per-component modules are component styles, not shared infrastructure, and Phase 1's explicit non-goal is "do not migrate framework components." Each per-component module migrates alongside its owning component during Phase 2 (Angular), Phase 3 (React), or Phase 4 (Vue). A scope-guard test (`packages/uix-styles/test/scope-guard.test.ts`) enforces this boundary in CI.
```

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/PROVENANCE.md docs/architecture/DECISIONS.md
git commit -m "docs(provenance): record Phase 1 UIX incorporation in PROVENANCE.md and DECISIONS.md

Updates the four @primeuix/* baseline entries from 'not yet
incorporated' to their real Phase 1 state, linked to the new
file-level manifests. Adds ADR-016 (sourcemap extraction mechanism)
and ADR-017 (uix-styles base-only Phase 1 scope)."
```

---

## Task 9: Performance baseline and CI verification

**Files:**
- Create: `docs/architecture/PERFORMANCE.md`
- Create: `scripts/provenance/measure-package-size.mjs`

**Interfaces:**
- Consumes: the built `dist/` output of all four packages (Tasks 2-5).
- Produces: `docs/architecture/PERFORMANCE.md` with recorded baseline numbers per the spec's Performance Requirements.

- [ ] **Step 1: Write `measure-package-size.mjs`**

Create `scripts/provenance/measure-package-size.mjs`:

```javascript
#!/usr/bin/env node
// scripts/provenance/measure-package-size.mjs
//
// Records dist size, gzip size, and file count for each packages/uix-*
// package, for the Phase 1 performance baseline (docs/architecture/PERFORMANCE.md).
// Not a CI gate — a one-shot measurement script, per the Phase 1 spec's
// "record measurable baselines for later comparison, do not optimize
// prematurely" requirement.

import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

function findUixPackages(root = "packages") {
  return readdirSync(root)
    .filter((name) => name.startsWith("uix") && name !== "uix")
    .map((name) => join(root, name));
}

function dirSizeBytes(dir) {
  let total = 0;
  let fileCount = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = dirSizeBytes(full);
      total += sub.bytes;
      fileCount += sub.fileCount;
    } else {
      total += statSync(full).size;
      fileCount++;
    }
  }
  return { bytes: total, fileCount };
}

function barrelGzipSize(distDir) {
  const barrelPath = join(distDir, "index.mjs");
  const content = readFileSync(barrelPath);
  return gzipSync(content).length;
}

console.log("| Package | dist/ size | dist/ file count | index.mjs gzip size |");
console.log("|---|---|---|---|");

for (const pkgPath of findUixPackages()) {
  const distDir = join(pkgPath, "dist");
  const { bytes, fileCount } = dirSizeBytes(distDir);
  const gzip = barrelGzipSize(distDir);
  console.log(`| ${pkgPath} | ${(bytes / 1024).toFixed(1)} KB | ${fileCount} | ${(gzip / 1024).toFixed(2)} KB |`);
}
```

- [ ] **Step 2: Run it and capture output**

Run: `node scripts/provenance/measure-package-size.mjs`
Expected: a markdown table with 4 rows (one per `packages/uix-*` package), real byte counts from the actual builds produced in Tasks 2-5.

- [ ] **Step 3: Verify tree-shaking with a throwaway esbuild bundle**

Run:

```bash
mkdir -p /tmp/tree-shake-check
cat > /tmp/tree-shake-check/entry.mjs << 'EOF'
export { classNames } from "@ultimate/uix-utils/classnames";
EOF
npx esbuild /tmp/tree-shake-check/entry.mjs --bundle --format=esm --outfile=/tmp/tree-shake-check/out.mjs \
  --alias:@ultimate/uix-utils=$(pwd)/packages/uix-utils/dist
wc -l /tmp/tree-shake-check/out.mjs
grep -c "hasClass\|getScrollableParents\|blockBodyScroll" /tmp/tree-shake-check/out.mjs || echo "0 (confirms dom module excluded)"
```

Expected: the bundled output contains only `classnames`-related code; the grep for `dom`-module-specific function names returns `0`, confirming importing one submodule does not pull in unrelated submodules.

Record this result (pass/fail + line count) in Step 4's document.

- [ ] **Step 4: Write `docs/architecture/PERFORMANCE.md`**

Create `docs/architecture/PERFORMANCE.md`, using the real numbers captured in Steps 2-3 (substitute actual measured values for every `<...>` placeholder below — this document must not ship with placeholders per the plan's own no-placeholder rule, so Step 2/3's real output values go here verbatim):

```markdown
# Performance Baseline

Phase 1 (`UltimateUIX Foundation`) baseline measurements, recorded once at Phase 1 completion for later comparison. Per the Blueprint's performance strategy ("do not optimize based on assumptions; establish benchmarks"), these numbers are not a budget or a CI gate — they are a reference point for Phase 2+.

## Package size

<paste the exact markdown table output from Step 2 here>

## Tree-shaking spot-check

Bundled `@ultimate/uix-utils/classnames` alone via esbuild (`--bundle --format=esm`): output was `<line count from Step 3>` lines, containing zero references to `dom`-module-specific functions (`hasClass`, `getScrollableParents`, `blockBodyScroll`) — confirms subpath imports do not pull in unrelated submodules.

## Notes

- No runtime/initialization-cost benchmark is included — these packages have no framework consumer yet (Phase 2+). Re-baseline runtime cost at Phase 2 exit.
- Numbers reflect an unoptimized first build; re-measure after any build-config change in a later phase.
```

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/PERFORMANCE.md scripts/provenance/measure-package-size.mjs
git commit -m "docs(performance): record Phase 1 UIX package size baseline

Package dist size, file count, and gzip size for all four uix-*
packages, plus a tree-shaking spot-check confirming subpath imports
exclude unrelated submodules. Reference baseline for Phase 2+ per
the Blueprint's 'establish benchmarks, don't optimize prematurely'
performance strategy — not a CI gate."
```

---

## Task 10: Full-repo verification and Phase exit check

**Files:** none created/modified — this task only runs verification commands.

**Interfaces:** none — final integration check across all prior tasks.

- [ ] **Step 1: Clean install from repo root**

Run: `rm -rf node_modules packages/*/node_modules && pnpm install --frozen-lockfile`
Expected: succeeds with no errors. (If `--frozen-lockfile` fails because Tasks 1-9 changed `pnpm-lock.yaml` without a corresponding commit of the lockfile, run `pnpm install` without the flag once, verify the resulting lockfile diff only reflects the new packages/deps from this plan, then commit it — do not proceed past this step with an uncommitted lockfile.)

- [ ] **Step 2: Full build**

Run: `pnpm run build`
Expected: all four `packages/uix-*` build successfully (existing `apps/*` and `packages/uix` stub are no-ops per `--if-present`).

- [ ] **Step 3: Full test suite**

Run: `pnpm run test`
Expected: all four packages' Vitest suites pass.

- [ ] **Step 4: Lint**

Run: `pnpm run lint`
Expected: passes. If ESLint flags anything in the newly-added `packages/uix-*/src/` (e.g. upstream code style differing from this repo's lint rules), fix only what's flagged — do not reformat unrelated upstream code beyond what the linter requires.

- [ ] **Step 5: Format check**

Run: `pnpm run format:check`
Expected: passes. If it fails on the extracted/adapted source (upstream formatting may differ from this repo's Prettier config), run `pnpm run format` once, review the diff to confirm it's pure formatting (no logic change), then commit separately.

- [ ] **Step 6: Typecheck**

Run: `pnpm run typecheck`
Expected: passes for all four packages.

- [ ] **Step 7: All three provenance/boundary/ceiling checks**

Run: `pnpm run provenance:validate && pnpm run boundary:validate && pnpm run ceiling:validate`
Expected: all three pass.

- [ ] **Step 8: Lockfile spot-check for Prime dependency leakage**

Run: `grep -A2 "'@primeuix\|'primeng\|'primevue\|'primereact" pnpm-lock.yaml | grep -B2 "uix-" || echo "CLEAN: no @primeuix/*/primeng/primevue/primereact entries under any uix-* workspace"`
Expected: `CLEAN`.

- [ ] **Step 9: Verify all Phase 1 spec Acceptance Criteria**

Cross-check against `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md`'s Acceptance Criteria section:

- [ ] All four `packages/uix-*` build independently (Step 2 confirmed).
- [ ] Every package's `exports` map resolves (Tasks 2-5's exports tests confirmed).
- [ ] `boundary:validate` passes non-trivially (Step 7 confirmed, and re-verify by reading its output — should say "scanned 4 uix package(s)" or similar, not "nothing to validate yet").
- [ ] `ceiling:validate` passes non-trivially (Step 7 confirmed).
- [ ] `provenance:validate` passes with manifest-completeness check exercised (Step 7 confirmed).
- [ ] All Vitest suites pass (Step 3 confirmed).
- [ ] `uix-styles` contains only `base` + `types` (Task 5 Step 4 confirmed at the time, re-verify: `find packages/uix-styles/src -type f`).
- [ ] `THIRD-PARTY-NOTICES.md` populated in all four packages (already true from Phase 0 stubs — verify no `TODO`/placeholder remains: `grep -l "TODO\|TBD" packages/uix-*/THIRD-PARTY-NOTICES.md || echo "CLEAN"`).
- [ ] Performance baseline recorded (Task 9 confirmed).
- [ ] READMEs exist for all four packages (Tasks 2-5 confirmed).
- [ ] No `packages/uix-*` imports anything from `packages/{ng,react,vue}*`: `grep -rl "packages/ng\|packages/react\|packages/vue\|@ultimate/ng\|@ultimate/react\|@ultimate/vue" packages/uix-*/src/ || echo "CLEAN"`.
- [ ] `docs/architecture/DECISIONS.md` has ADR-016 and ADR-017 (Task 8 confirmed).

- [ ] **Step 10: Final commit if Step 5's format fix or Step 1's lockfile update produced uncommitted changes**

```bash
git status --short
```

If clean, no action needed. If any uncommitted changes remain from Steps 1 or 5, stage and commit them:

```bash
git add -A
git commit -m "chore: format/lockfile fixes from Phase 1 full-repo verification pass"
```

---

## Self-Review

**Spec coverage:**

- PrimeUIX package-by-package investigation → Task 2-5 headers restate the spec's findings inline for each package.
- Package scope (4 packages, no `uix-core`, `uix/` untouched) → File Structure section + Tasks 2-5.
- Dependency rules (ceiling gap) → Task 6.
- Build requirements (tsup, ESM, subpath exports) → Tasks 2-5, Steps for `tsup.config.ts`.
- Runtime requirements (SSR-safety, tree-shaking) → Task 9 Step 3 (tree-shaking spot-check); SSR-safety confirmed by construction (no top-level DOM access in any extracted file, verified during spec investigation, unchanged by mechanical adaptation).
- Styling requirements (base/theme/component boundary) → Task 5 (uix-styles base-only) + Task 3 (uix-styled infrastructure).
- Motion requirements (reduced-motion default) → Task 4 Steps 10-11.
- Testing requirements (unit/styling/motion/package/boundary/ceiling/build) → distributed across Tasks 2-6 + Task 10.
- Provenance requirements (extraction mechanism, manifests, PROVENANCE.md update) → Tasks 1, 7, 8.
- Security requirements → covered by construction (RETAIN-only classification, no new logic); explicitly re-flagged as a manual read-through point during Task 2-5's file-copying steps (engineer reads every file before adapting).
- Performance requirements (baseline, not optimization) → Task 9.
- Documentation requirements (README per package, unstable API marker) → Tasks 2-5 Step "Write the package README".
- AI/metadata constraints (no new runtime dep) → satisfied by construction, no dedicated task needed (nothing to build).
- Deliverables list → every item maps to a task's Files section.
- Acceptance criteria → Task 10 Step 9 explicitly re-checks each one.
- Phase exit criteria → Task 10 covers all 7 items from the spec.
- Non-goals → no task violates any (no component migration, no renaming, no CLI/MCP/AI, no publishing) — confirmed by scanning every task's Files list against the non-goals list.

**Placeholder scan:** Task 4 Step 3 and Task 5 Step 3 contain conditional instructions ("if X, do Y") rather than a fixed value, because the exact file path/export style can only be confirmed by reading the real extracted source at execution time — this is intentional and necessary (the plan cannot know upstream's exact internal type-file location without running Task 1's extraction first), not a vagueness placeholder. Every other step has concrete, complete code. No "TBD"/"TODO"/"add appropriate" phrasing remains.

**Type consistency:** `createMotion(element, options)` signature consistent between Task 4's Interfaces block and its test steps. `@ultimate/uix-utils` submodule names (`classnames`, `dom`, `eventbus`, `mergeprops`, `object`, `uuid`, `zindex`) consistent across Task 2's File Structure, barrel, package.json exports, and Tasks 3-4's dependency lists. `shouldSkipMotion`/`createMotion`/`DEFAULT_MOTION_OPTIONS` names consistent between Task 4's Interfaces block, barrel (Step 7), and tests (Steps 10-13).

---

Plan complete and saved to `docs/superpowers/plans/2026-08-28-phase-1-uix-foundation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
