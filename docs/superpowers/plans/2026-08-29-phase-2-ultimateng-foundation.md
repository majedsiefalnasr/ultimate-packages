# Phase 2 — UltimateNG Foundation & Angular Component Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `@ultimate/ng-core` and `@ultimate/ng` — the first framework-specific Ultimate packages — with an Ultimate-owned Angular foundation (base-class hierarchy, overlay/focus-trap infrastructure, icons, config) and five fully working, provenance-tracked, Ultimate-namespaced components (Button, Checkbox, Dialog, Menu, Tooltip) proving the architecture end-to-end.

**Architecture:** PrimeNG 21.1.9 source (already pinned in `.vendor-cache/primeng-21.1.9.tar.gz`, commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`) is extracted per-directory into a gitignored staging tree, then **redesigned, not ported** (Option B): `ng-core` gets a smaller, Ultimate-owned `UBaseComponent`/`UBaseEditableHolder` hierarchy that covers only what the five proof-set components need (DI wiring, lifecycle hooks, `@ultimate/uix-styled` style registration) — PrimeNG's full passthrough (`pt`)/global-config surface is explicitly out of scope this phase (spec: DEFER). Each component's raw CSS/token module is extracted separately into `@ultimate/uix-styles/<name>` with `.p-*` renamed to `.u-*`, following the `base` module's existing Phase 1 pattern. Both packages build with `ng-packagr` (Angular Package Format, single-entry-point barrel — see the correction recorded in Task 12: per-directory secondary entry points are not used, `ng-packagr`'s auto-discovery of nested `ng-package.json` files breaks the build) and test with the Angular CLI's Vitest builder over real `TestBed`.

**Tech Stack:** pnpm workspaces (existing), Angular `^21.0.7`, TypeScript 5.9 strict (existing `tsconfig.base.json` + Angular compiler options), `ng-packagr` (new), Angular CLI Vitest builder + `@angular/core/testing` `TestBed` (new), Node.js built-ins for provenance scripts (matching Phase 1 convention).

## Global Constraints

- PrimeNG baseline: `21.1.9`, commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593` (`docs/architecture/PROVENANCE.md`) — do not re-pin.
- Angular peer range: `^21.0.7` for both packages (`docs/architecture/COMPATIBILITY.md:18`).
- Two packages: `@ultimate/ng-core` (foundation) and `@ultimate/ng` (components + their directly-consumed primitives). Do not create a third package.
- `ng-core` owns: `UBaseComponent`/`UBaseEditableHolder`/`UBaseInput`, `Bind` directive, shared API types (subset), minimal config service, `Overlay`/`FocusTrap` directives, 5 icon components (Spinner, Times, WindowMaximize, WindowMinimize, BaseIcon).
- `ng` owns: `UButton`, `UCheckbox`, `UDialog`, `UMenu`, `UTooltip`, plus `Ripple`, `AutoFocus`, `Fluid`, `Badge` (Angular-facing primitives they directly consume). **Ripple/AutoFocus/Fluid/Badge do NOT go in `ng-core`.**
- Full Ultimate namespace rename in this phase: selectors (`p-button`→`u-button`), class names (`Button`→`UButton`), **and CSS classes** (`.p-button`→`.u-button`) — all three together, not deferred.
- Standalone components only. No `NgModule` authored anywhere in either package.
- `ChangeDetectionStrategy.OnPush` on every Ultimate-authored component, regardless of the PrimeNG reference file's own setting.
- Signal-based `input()`/`output()` exclusively in new Ultimate source — no decorator-based `@Input()`/`@Output()`.
- Homegrown overlay/focus-trap system retained (adapted into `ng-core`). Do not introduce `@angular/cdk` Overlay.
- `@angular/router` is a peer dependency of `@ultimate/ng` (not `ng-core`) because `UMenu` directly consumes `RouterModule`/`routerLink`. `@angular/cdk` is NOT a peer dependency of either package (confirmed unused by the entire proof-set closure).
- Zero runtime dependency on `primeng`, `primevue`, `primereact`, or `@primeuix/*` in either package's `package.json` (already enforced by `scripts/provenance/validate-dependency-ceiling.mjs`'s `WATCHED_PREFIXES`, which already includes `"ng"` — no script change needed for this rule).
- Every incorporated file needs a provenance record: package-level in `docs/architecture/PROVENANCE.md` (PrimeNG entry already exists, needs updating, not a new heading) and file-level in new `docs/architecture/provenance/{ng-core,ng}.json` manifests using the schema `{originalPath, ultimateDestination, modificationStatus, modificationDescription}`, adding a new `modificationStatus` value `"reimplemented-with-reference"` for genuinely rewritten base-class files.
- `sideEffects` for both packages is NOT fixed by this spec — must be determined by a real tree-shaking verification task before either `package.json` ships a final value.
- Build via `ng-packagr`, not `tsup`. Test via the Angular CLI's Vitest builder + `TestBed`, not Karma/Jasmine.
- `packages/uix-styles` gains 5 new subpath exports this phase (`./button`, `./checkbox`, `./dialog`, `./menu`, `./tooltip`) with class names renamed `.p-*`→`.u-*` at incorporation time. Its existing scope-guard test must be updated (not removed) to allow exactly these 5 new modules.
- Package manager: pnpm 9.6.0. Node: `>=20`.

---

## File Structure

```text
packages/
├── ng-core/                                    @ultimate/ng-core
│   ├── src/
│   │   ├── basecomponent/
│   │   │   ├── base-component.ts               (UBaseComponent — scoped-down reimplementation)
│   │   │   ├── base-component.spec.ts
│   │   │   └── index.ts
│   │   ├── base-editable-holder/
│   │   │   ├── base-editable-holder.ts         (UBaseEditableHolder — CVA base, needed by UCheckbox)
│   │   │   ├── base-editable-holder.spec.ts
│   │   │   └── index.ts
│   │   ├── bind/
│   │   │   ├── bind.ts                         (UBind directive)
│   │   │   ├── bind.spec.ts
│   │   │   └── index.ts
│   │   ├── overlay/
│   │   │   ├── overlay.ts                      (UOverlay directive)
│   │   │   ├── overlay.spec.ts
│   │   │   └── index.ts
│   │   ├── focus-trap/
│   │   │   ├── focus-trap.ts                   (UFocusTrap directive)
│   │   │   ├── focus-trap.spec.ts
│   │   │   └── index.ts
│   │   ├── config/
│   │   │   ├── ultimate-config.ts              (UltimateConfig service — minimal subset)
│   │   │   ├── ultimate-config.spec.ts
│   │   │   └── index.ts
│   │   ├── api/
│   │   │   ├── types.ts                        (shared type contracts: UMenuItem, UTooltipOptions subset)
│   │   │   └── index.ts
│   │   ├── icons/
│   │   │   ├── spinner-icon.ts
│   │   │   ├── times-icon.ts
│   │   │   ├── window-maximize-icon.ts
│   │   │   ├── window-minimize-icon.ts
│   │   │   ├── base-icon.ts
│   │   │   ├── icons.spec.ts
│   │   │   └── index.ts
│   │   └── index.ts                            (root barrel)
│   ├── package.json
│   ├── ng-package.json
│   ├── tsconfig.json
│   ├── README.md
│   └── THIRD-PARTY-NOTICES.md                  (new)
│
└── ng/                                          @ultimate/ng
    ├── src/
    │   ├── ripple/{ripple.ts, ripple.spec.ts, index.ts}
    │   ├── autofocus/{auto-focus.ts, auto-focus.spec.ts, index.ts}
    │   ├── fluid/{fluid.ts, fluid.spec.ts, index.ts}
    │   ├── badge/{badge.ts, badge.spec.ts, index.ts}
    │   ├── button/{button.ts, button.spec.ts, button-style.ts, index.ts}
    │   ├── checkbox/{checkbox.ts, checkbox.spec.ts, checkbox-style.ts, index.ts}
    │   ├── tooltip/{tooltip.ts, tooltip.spec.ts, tooltip-style.ts, index.ts}
    │   ├── dialog/{dialog.ts, dialog.spec.ts, dialog-style.ts, index.ts}
    │   ├── menu/{menu.ts, menu.spec.ts, menu-style.ts, index.ts}
    │   └── index.ts                             (root barrel — re-exports all 9)
    ├── package.json
    ├── ng-package.json                          (single entry point, packages/ng/src/index.ts barrel)
    ├── tsconfig.json
    ├── README.md
    └── THIRD-PARTY-NOTICES.md                   (populate existing stub)

packages/uix-styles/
├── src/{button,checkbox,dialog,menu,tooltip}/index.ts   (new — 5 modules)
└── test/scope-guard.test.ts                              (modified — allow-list extended)

scripts/provenance/
├── extract-primeng-source.mjs                  (new — untar + copy matching src/ paths, no sourcemap step)
├── extract-primeng-source.test.mjs             (new)
└── validate-provenance.mjs                      (modified — manifest-completeness check extended to packages/ng*)

docs/architecture/
├── PROVENANCE.md                                (modified — PrimeNG entry: Modification status/description/date)
├── DECISIONS.md                                 (modified — ADR-018 through ADR-022 added)
├── PACKAGE_ARCHITECTURE.md                      (modified — ng-core/ng move from "reserved" to "active")
├── COMPONENT_INVENTORY.md                       (new — full ~117-area classification)
├── PERFORMANCE.md                               (modified — Phase 2 baseline appended)
└── provenance/
    ├── ng-core.json                             (new — file-level manifest)
    └── ng.json                                  (new)

.gitignore                                       (modified — add .vendor-extracted/ng/ if not already covered)
```

**Why this shape:** `ng-core`'s directory names use kebab-case file names with PascalCase-prefixed exported classes (`base-component.ts` exports `UBaseComponent`), matching Angular's own file-naming convention (Angular CLI/ng-packagr tooling and most Angular style guides expect `kebab-case.ts` file names even though PrimeNG's own source uses flat lowercase like `basecomponent.ts` — Option B means Ultimate is not obligated to mirror PrimeNG's file-naming choice, only its architecture). Each `ng` component gets its own directory containing the component, its spec, and its `*-style.ts` adapter — mirroring the `packages/uix-utils/src/<module>/index.ts` one-directory-per-concern convention already established in Phase 1. `ng`'s 4 primitives (`ripple`, `autofocus`, `fluid`, `badge`) sit alongside the 5 components as peers, not nested under them, for consistency with that one-directory-per-concern layout — tree-shaking is achieved via each module's own barrel export from the single package-level `ng-package.json`, not per-directory secondary entry points (see the correction recorded in Task 12).

---

## Interfaces produced by shared/foundation infrastructure

These are the exact signatures every later task depends on. A task's own section lists which of these it consumes.

**`UBaseComponent`** (Task 4, `packages/ng-core/src/basecomponent/base-component.ts`):
```typescript
@Directive({ standalone: true })
export abstract class UBaseComponent {
  protected readonly document: Document;              // inject(DOCUMENT)
  protected readonly platformId: object;               // inject(PLATFORM_ID)
  protected readonly el: ElementRef;                    // inject(ElementRef)
  protected readonly renderer: Renderer2;               // inject(Renderer2)
  protected readonly config: UltimateConfig;            // inject(UltimateConfig)

  dt = input<Record<string, unknown> | undefined>();    // scoped design tokens (per-instance token override)
  unstyled = input<boolean | undefined>();

  protected abstract readonly componentName: string;    // e.g. "button" — used as the uix-styled registration key
  protected abstract readonly styleModule: { css: string; classes: Record<string, unknown> };

  protected cx(key: string, params?: Record<string, unknown>): string | undefined;
  // Resolves a class-name slot from styleModule.classes via @ultimate/uix-utils's cn(),
  // matching PrimeNG's own cx() contract but without the pt/passthrough merge layer.

  ngOnInit(): void;   // registers styleModule with @ultimate/uix-styled's StyleSheet service (once per componentName)
}
```
This is deliberately smaller than PrimeNG's `BaseComponent`: no `pt`/`ptOptions` inputs, no `$parentInstance` DI-token lookup, no passthrough machinery (`ptm`/`ptms`/`ptmo`) — all explicitly DEFERRED by the spec (Needs Architecture Decision). Style loading is delegated entirely to `@ultimate/uix-styled`'s `StyleSheet` service, not reimplemented.

**`UBaseEditableHolder`** (Task 5, `packages/ng-core/src/base-editable-holder/base-editable-holder.ts`) — confirmed against PrimeNG's real, extracted `baseeditableholder/baseeditableholder.ts` source, which uses a split read/write pattern for `disabled` because Angular's `input()` returns a read-only `InputSignal` with no `.set()`: the template-bindable `disabled` input and `setDisabledState`'s CVA-driven value are two different signals, combined via a computed:
```typescript
@Directive({ standalone: true })
export abstract class UBaseEditableHolder extends UBaseComponent implements ControlValueAccessor {
  disabled = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  protected readonly _disabled = signal(false);
  readonly $disabled = computed(() => this.disabled() || this._disabled());

  protected onModelChange: (value: unknown) => void = () => {};
  protected onModelTouched: () => void = () => {};

  writeValue(value: unknown): void;          // abstract-ish: base stores into a `value` signal subclasses read
  registerOnChange(fn: (value: unknown) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState(isDisabled: boolean): void;  // writes to `_disabled`, NOT to `disabled` — `disabled` is a read-only input, never written by CVA
}
```

**`UOverlay`** (Task 6, `packages/ng-core/src/overlay/overlay.ts`):
```typescript
@Directive({ selector: '[uOverlay]', standalone: true })
export class UOverlay {
  target = input<HTMLElement | undefined>();          // element to position against
  appendTo = input<'body' | HTMLElement | undefined>('body');
  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  // Exposes: position(), appendOverlay(), destroyOverlay() — called by consuming components (UDialog, UTooltip)
}
```

**`UFocusTrap`** (Task 6, `packages/ng-core/src/focus-trap/focus-trap.ts`):
```typescript
@Directive({ selector: '[uFocusTrap]', standalone: true })
export class UFocusTrap {
  uFocusTrapDisabled = input<boolean>(false, { transform: booleanAttribute });
  // Traps Tab/Shift+Tab cycling within the host element while active.
}
```

**`UltimateConfig`** (Task 7, `packages/ng-core/src/config/ultimate-config.ts`):
```typescript
@Injectable({ providedIn: 'root' })
export class UltimateConfig {
  unstyled = signal(false);
  ripple = signal(true);
  // Minimal subset only — full config surface is DEFERRED (Needs Architecture Decision) per spec.
}
```

**`@ultimate/uix-styles/<component>`** (Task 3): each module exports `{ style: string }` only, matching the Phase 1 `base` module's actual precedent and the real pinned `@primeuix/styles@2.0.3` tarball's content (confirmed: it contains no `classes` export — that concept does not exist in this package). `style` is the CSS/token content, class strings renamed `.p-*`→`.u-*`. The per-slot `classes` resolver (a `{ instance } => [...]` function object) is genuinely PrimeNG-component-authored logic, not `@primeuix/styles` content — it lives inside PrimeNG's own `<component>/style/<component>style.ts` wrapper files (e.g. `primeng/button/style/buttonstyle.ts`'s local `const classes = {...}`), and each Phase 2 component's own `*-style.ts` adapter in `packages/ng` (Tasks 12-16) defines its own `classes` object, ported from that PrimeNG reference file with `.p-*`→`.u-*` renamed — it is not imported from `uix-styles`.

---

## Task 1: Vendoring script for PrimeNG source

**Files:**
- Create: `scripts/provenance/extract-primeng-source.mjs`
- Create: `scripts/provenance/extract-primeng-source.test.mjs`
- Modify: `.gitignore` (add `.vendor-extracted/` if not already present)

**Interfaces:**
- Produces: `extract-primeng-source.mjs <tarball-path> <src-relative-path> <output-dir>` — CLI script. Untars `<tarball-path>` to a temp dir, copies everything under `<extracted-root>/packages/primeng/src/<src-relative-path>` into `<output-dir>`, preserving relative structure. Every later extraction task invokes this exact signature. Unlike Phase 1's `extract-source.mjs` (sourcemap recovery), this is a direct copy — the PrimeNG tarball is a real git-archive with full original `.ts` source, no sourcemap step needed.

- [ ] **Step 1: Check `.gitignore` for `.vendor-extracted/`**

Read `.gitignore`. If `.vendor-extracted/` is not already present (Phase 1 added it for `@primeuix/*` extraction), add it. If already present, skip this step.

- [ ] **Step 2: Write the failing test**

Create `scripts/provenance/extract-primeng-source.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

function makeFixtureTarball(dir) {
  const root = join(dir, "primeng-testsha");
  const buttonDir = join(root, "packages", "primeng", "src", "button");
  const otherDir = join(root, "packages", "primeng", "src", "other");
  mkdirSync(buttonDir, { recursive: true });
  mkdirSync(otherDir, { recursive: true });
  writeFileSync(join(buttonDir, "button.ts"), "export class Button {}\n");
  writeFileSync(join(otherDir, "other.ts"), "export class Other {}\n");

  const tarballPath = join(dir, "fixture.tar.gz");
  execFileSync("tar", ["czf", tarballPath, "-C", dir, "primeng-testsha"]);
  return tarballPath;
}

test("extracts only the requested src subdirectory", () => {
  const workDir = mkdtempSync(join(tmpdir(), "extract-primeng-"));
  const outputDir = join(workDir, "out");
  try {
    const tarballPath = makeFixtureTarball(workDir);

    execFileSync("node", [
      "scripts/provenance/extract-primeng-source.mjs",
      tarballPath,
      "button",
      outputDir,
    ]);

    const extracted = readFileSync(join(outputDir, "button.ts"), "utf8");
    assert.equal(extracted, "export class Button {}\n");
    assert.equal(existsSync(join(outputDir, "other.ts")), false);
    assert.equal(existsSync(join(outputDir, "..", "other")), false);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
});

test("is idempotent — re-running overwrites with identical content", () => {
  const workDir = mkdtempSync(join(tmpdir(), "extract-primeng-idempotent-"));
  const outputDir = join(workDir, "out");
  try {
    const tarballPath = makeFixtureTarball(workDir);
    execFileSync("node", ["scripts/provenance/extract-primeng-source.mjs", tarballPath, "button", outputDir]);
    execFileSync("node", ["scripts/provenance/extract-primeng-source.mjs", tarballPath, "button", outputDir]);

    const extracted = readFileSync(join(outputDir, "button.ts"), "utf8");
    assert.equal(extracted, "export class Button {}\n");
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test scripts/provenance/extract-primeng-source.test.mjs`
Expected: FAIL — `scripts/provenance/extract-primeng-source.mjs` does not exist yet.

- [ ] **Step 4: Write the implementation**

Create `scripts/provenance/extract-primeng-source.mjs`:

```javascript
#!/usr/bin/env node
// scripts/provenance/extract-primeng-source.mjs
//
// Extracts a specific src/ subdirectory from the pinned PrimeNG tarball.
// Unlike scripts/provenance/extract-source.mjs (Phase 1, sourcemap recovery
// for @primeuix/* packages that ship no src/), this tarball is a real
// git-archive of the primefaces/primeng monorepo at the pinned commit —
// it already contains full original TypeScript source under
// packages/primeng/src/, so this is a direct copy, not a recovery.
//
// Usage: node extract-primeng-source.mjs <tarball-path> <src-relative-path> <output-dir>

import { mkdirSync, readdirSync, statSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const [, , tarballPath, srcRelativePath, outputDir] = process.argv;

if (!tarballPath || !srcRelativePath || !outputDir) {
  console.error("Usage: extract-primeng-source.mjs <tarball-path> <src-relative-path> <output-dir>");
  process.exit(1);
}

function findExtractedRoot(dir) {
  const entries = readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory());
  if (entries.length !== 1) {
    throw new Error(`expected exactly one top-level directory in extracted tarball, found ${entries.length}`);
  }
  return join(dir, entries[0].name);
}

function copyRecursive(srcDir, destDir) {
  mkdirSync(destDir, { recursive: true });
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

const extractDir = mkdtempSync(join(tmpdir(), "extract-primeng-source-"));
try {
  execFileSync("tar", ["xzf", tarballPath, "-C", extractDir]);

  const extractedRoot = findExtractedRoot(extractDir);
  const sourceDir = join(extractedRoot, "packages", "primeng", "src", srcRelativePath);

  if (!statSync(sourceDir, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`source directory not found in tarball: packages/primeng/src/${srcRelativePath}`);
  }

  copyRecursive(sourceDir, outputDir);
  console.log(`[extract-primeng-source] copied packages/primeng/src/${srcRelativePath} to ${outputDir}`);
} finally {
  rmSync(extractDir, { recursive: true, force: true });
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test scripts/provenance/extract-primeng-source.test.mjs`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add scripts/provenance/extract-primeng-source.mjs scripts/provenance/extract-primeng-source.test.mjs .gitignore
git commit -m "feat(provenance): add PrimeNG source extraction script for Phase 2"
```

---

## Task 2: `validate-provenance.mjs` extension for `packages/ng*`

**Context:** research confirmed `validate-provenance.mjs`'s manifest-completeness check (`findUixPackageDirs`) is hardcoded to discover only directories starting with `"uix"` — it will silently skip `packages/ng` and `packages/ng-core` entirely unless extended. This is a real gap, not automatically covered.

**Files:**
- Modify: `scripts/provenance/validate-provenance.mjs`

**Interfaces:**
- Consumes: none new.
- Produces: `findWatchedPackageDirs()` (renamed from `findUixPackageDirs()`) — generalizes the prefix filter to `["uix", "ng"]`, used by every subsequent manifest-completeness check.

- [ ] **Step 1: Read current `scripts/provenance/validate-provenance.mjs` in full to confirm the exact function name and prefix filter before editing**

Run: `grep -n "findUixPackageDirs\|startsWith" scripts/provenance/validate-provenance.mjs`
Expected output includes `.filter((name) => name.startsWith("uix"))` inside a function named `findUixPackageDirs`.

- [ ] **Step 2: Rename the function and generalize the prefix filter**

In `scripts/provenance/validate-provenance.mjs`, change:

```javascript
function findUixPackageDirs(root = "packages") {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((name) => name.startsWith("uix"))
    .map((name) => ({ name, path: join(root, name) }))
    .filter(({ path }) => statSync(path).isDirectory());
}
```

to:

```javascript
const MANIFEST_WATCHED_PREFIXES = ["uix", "ng"];

function findWatchedPackageDirs(root = "packages") {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((name) => MANIFEST_WATCHED_PREFIXES.some((prefix) => name.startsWith(prefix)))
    .map((name) => ({ name, path: join(root, name) }))
    .filter(({ path }) => statSync(path).isDirectory());
}
```

Then update the one call site (`const uixPackages = findUixPackageDirs();`) to `const watchedPackages = findWatchedPackageDirs();` and rename the loop variable `uixPackages` → `watchedPackages` at its usage below.

- [ ] **Step 3: Verify the script still runs cleanly against the current repo state**

Run: `node scripts/provenance/validate-provenance.mjs`
Expected: passes exactly as before (no `packages/ng*` directories with a `src/` exist yet at this point in the plan, so this is a no-op check for now — confirms the rename didn't break existing behavior).

- [ ] **Step 4: Commit**

```bash
git add scripts/provenance/validate-provenance.mjs
git commit -m "fix(provenance): extend manifest-completeness check to packages/ng*"
```

---

## Task 3: `@ultimate/uix-styles` gains 5 component style modules

**Files:**
- Create: `packages/uix-styles/src/button/index.ts`
- Create: `packages/uix-styles/src/checkbox/index.ts`
- Create: `packages/uix-styles/src/dialog/index.ts`
- Create: `packages/uix-styles/src/menu/index.ts`
- Create: `packages/uix-styles/src/tooltip/index.ts`
- Modify: `packages/uix-styles/src/index.ts` (barrel — do NOT re-export these 5; they stay subpath-only, matching how `base` is exported as `./base`, not from the root barrel, per the existing `package.json` exports map)
- Modify: `packages/uix-styles/package.json` (add 5 subpath exports)
- Modify: `packages/uix-styles/test/scope-guard.test.ts`
- Create: `docs/architecture/provenance/uix-styles.json` entries for the 5 new files (append to existing array)

**Interfaces:**
- Produces: `@ultimate/uix-styles/button`, `/checkbox`, `/dialog`, `/menu`, `/tooltip` — each exporting `{ style: string }` only (no `classes` export — confirmed absent from the real pinned `@primeuix/styles@2.0.3` tarball; matches the `base` module's own existing shape). Consumed by Task 12 (`ButtonStyle`), Task 14 (`CheckboxStyle`), Task 13 (`TooltipStyle`), Task 15 (`DialogStyle`), Task 16 (`MenuStyle`) for the `style` value only — each of those tasks defines its own `classes` object locally, ported from PrimeNG's corresponding `<component>style.ts` reference file.

- [ ] **Step 1: Extract the 5 style modules from the pinned `@primeuix/styles@2.0.3` tarball**

Run:
```bash
mkdir -p .vendor-extracted/uix-styles-components
node scripts/provenance/extract-source.mjs .vendor-cache/@primeuix__styles-2.0.3.tar.gz .vendor-extracted/uix-styles-components
```
This recovers all of `@primeuix/styles`'s original source (same sourcemap-recovery mechanism Phase 1 used for the `base` module) into the staging tree, including `button/`, `checkbox/`, `dialog/`, `menu/`, `tooltip/` subdirectories alongside `base/`.

- [ ] **Step 2: Write the failing test for one module (button), establishing the pattern the other 4 follow**

Create `packages/uix-styles/test/button.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { style } from "../src/button";

describe("uix-styles/button", () => {
  it("exports a style string with Ultimate-renamed classes, no leftover .p-button", () => {
    expect(style).toContain(".u-button");
    expect(style).not.toContain(".p-button");
  });
});
```
(Only `style` is exported — the real pinned `@primeuix/styles@2.0.3` tarball has no `classes` export in any module, confirmed by inspecting the actual extracted source before writing this task. The per-slot `classes` resolver is PrimeNG-component-authored logic living in PrimeNG's own `<component>style.ts` wrapper, not `@primeuix/styles` — it belongs in each Phase 2 component's own `*-style.ts` adapter in `packages/ng`, not here.)

- [ ] **Step 2b: Write the equivalent test file for checkbox, dialog, menu, tooltip**

Create `packages/uix-styles/test/checkbox.test.ts`, `dialog.test.ts`, `menu.test.ts`, `tooltip.test.ts` — same structure as Step 2, substituting the module name and its corresponding `.u-<name>` / `.p-<name>` strings.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/uix-styles test`
Expected: FAIL — `../src/button` (and the other 4) do not exist yet.

- [ ] **Step 4: Copy each extracted module into `src/`, renaming `.p-*` to `.u-*`**

For each of `button`, `checkbox`, `dialog`, `menu`, `tooltip`:

```bash
cp .vendor-extracted/uix-styles-components/<name>/index.ts packages/uix-styles/src/<name>/index.ts
```

Then, in each copied file, replace every `.p-<name>` and `.p-<name>-*` class-name string literal with the `.u-` equivalent (e.g. `.p-button` → `.u-button`, `.p-button-icon-only` → `.u-button-icon-only`). Do this with a careful find-and-replace scoped to string literals only (not identifiers) — read each file first to confirm the exact set of `.p-*` strings present before replacing, since some modules reference sibling-component classes (e.g. `dialog`'s style module may reference `.p-button` for its footer buttons) that also need the `.u-*` rename.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/uix-styles test`
Expected: PASS (all 5 new test files + existing scope-guard test)

- [ ] **Step 6: Add `package.json` subpath exports**

In `packages/uix-styles/package.json`, extend the `exports` map:

```json
{
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
    },
    "./button": {
      "types": "./dist/button/index.d.mts",
      "import": "./dist/button/index.mjs",
      "default": "./dist/button/index.mjs"
    },
    "./checkbox": {
      "types": "./dist/checkbox/index.d.mts",
      "import": "./dist/checkbox/index.mjs",
      "default": "./dist/checkbox/index.mjs"
    },
    "./dialog": {
      "types": "./dist/dialog/index.d.mts",
      "import": "./dist/dialog/index.mjs",
      "default": "./dist/dialog/index.mjs"
    },
    "./menu": {
      "types": "./dist/menu/index.d.mts",
      "import": "./dist/menu/index.mjs",
      "default": "./dist/menu/index.mjs"
    },
    "./tooltip": {
      "types": "./dist/tooltip/index.d.mts",
      "import": "./dist/tooltip/index.mjs",
      "default": "./dist/tooltip/index.mjs"
    }
  }
}
```

- [ ] **Step 7: Update `packages/uix-styles/tsup.config.ts` submodule discovery is already generic (reads `readdirSync("src")`) — verify it picks up the 5 new directories automatically**

Run: `pnpm --filter @ultimate/uix-styles build`
Expected: `dist/button/`, `dist/checkbox/`, `dist/dialog/`, `dist/menu/`, `dist/tooltip/` all produced, each with `index.mjs` + `index.d.mts`.

- [ ] **Step 8: Update the scope-guard test to allow the 5 new modules' selector prefixes**

Read `packages/uix-styles/test/scope-guard.test.ts` in full first (its current form only checks the `base` module against an allow-list of framework-level selectors). Add a second `describe` block:

```typescript
import { style as buttonStyle } from "../src/button";
import { style as checkboxStyle } from "../src/checkbox";
import { style as dialogStyle } from "../src/dialog";
import { style as menuStyle } from "../src/menu";
import { style as tooltipStyle } from "../src/tooltip";

describe("component style modules — exactly 5 exist alongside base", () => {
  it("uix-styles/src/ contains only base + the 5 Phase 2 component modules, no unexpected 6th", () => {
    const actualModules = readdirSync(join(__dirname, "..", "src"), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    expect(actualModules).toEqual(["base", "button", "checkbox", "dialog", "menu", "tooltip"].sort());
  });

  it("button style uses only .u-button* selectors", () => {
    expect(buttonStyle).not.toMatch(/\.p-button/);
  });
  it("checkbox style uses only .u-checkbox* selectors", () => {
    expect(checkboxStyle).not.toMatch(/\.p-checkbox/);
  });
  it("dialog style uses only .u-dialog* selectors", () => {
    expect(dialogStyle).not.toMatch(/\.p-dialog/);
  });
  it("menu style uses only .u-menu* selectors", () => {
    expect(menuStyle).not.toMatch(/\.p-menu/);
  });
  it("tooltip style uses only .u-tooltip* selectors", () => {
    expect(tooltipStyle).not.toMatch(/\.p-tooltip/);
  });
});
```

Add `import { readdirSync } from "node:fs"; import { join } from "node:path";` to the top of the file if not already present.

- [ ] **Step 9: Run the full uix-styles test suite**

Run: `pnpm --filter @ultimate/uix-styles test`
Expected: PASS — all tests including the updated scope-guard.

- [ ] **Step 10: Add file-level provenance entries**

Append to `docs/architecture/provenance/uix-styles.json`'s existing JSON array (read the file first — it's a JSON array, add 5 new elements, do not overwrite existing 3):

```json
{
  "originalPath": "src/button/index.ts",
  "ultimateDestination": "packages/uix-styles/src/button/index.ts",
  "modificationStatus": "adapted",
  "modificationDescription": "Extracted via sourcemap recovery from @primeuix/styles@2.0.3; .p-button* class-name string literals renamed to .u-button* to match Phase 2's Ultimate namespace decision."
}
```
(repeat for `checkbox`, `dialog`, `menu`, `tooltip`, adjusting the path and class-name prefix each time)

- [ ] **Step 11: Commit**

```bash
git add packages/uix-styles/ docs/architecture/provenance/uix-styles.json
git commit -m "feat(uix-styles): add button/checkbox/dialog/menu/tooltip style modules

Extracted from @primeuix/styles@2.0.3 per ADR-017's deferred plan.
Class names renamed .p-*→.u-* per Phase 2's Ultimate namespace decision."
```

---

## Task 4: `@ultimate/ng-core` package scaffold + `UBaseComponent`

**Files:**
- Create: `packages/ng-core/package.json`
- Create: `packages/ng-core/ng-package.json`
- Create: `packages/ng-core/tsconfig.json`
- Create: `packages/ng-core/README.md`
- Create: `packages/ng-core/THIRD-PARTY-NOTICES.md`
- Create: `packages/ng-core/src/basecomponent/base-component.ts`
- Create: `packages/ng-core/src/basecomponent/base-component.spec.ts`
- Create: `packages/ng-core/src/basecomponent/index.ts`
- Create: `packages/ng-core/src/index.ts`
- Delete: `packages/ng-core/.gitkeep`

**Interfaces:**
- Consumes: `@ultimate/uix-utils` (`cn` from `classnames`), `@ultimate/uix-styled` (`StyleSheet` service — exact import path and method names TBD by reading `packages/uix-styled/src/stylesheet/index.ts`'s public exports before writing Step 4 below; if the service's registration method is not literally named `register`, use its actual exported name).
- Produces: `UBaseComponent` exactly as specified in "Interfaces produced by shared/foundation infrastructure" above. `UltimateConfig` is a forward reference used here (injected) but implemented in Task 7 — for this task, stub `UltimateConfig` as a minimal local `@Injectable({providedIn: 'root'}) class UltimateConfig { unstyled = signal(false); }` placeholder in `base-component.ts` itself, then Task 7 replaces the import with the real `packages/ng-core/src/config/` module and deletes the stub. (This ordering exists so `UBaseComponent`'s test suite doesn't block on Task 7; Task 7's own step list includes removing the stub.)

- [ ] **Step 1: Read `packages/uix-styled/src/stylesheet/index.ts`'s exports to confirm the real service name/API before writing any code**

Run: `grep -n "^export" packages/uix-styled/src/stylesheet/index.ts`
Record the exact class/function name and its public method signatures — use these exact names in Step 4, not the placeholder names shown here.

- [ ] **Step 2: Scaffold `package.json`**

Create `packages/ng-core/package.json` (modeled on `packages/uix-utils/package.json`'s shape, adapted for Angular/APF — `main`/`module`/`types` fields are omitted here because `ng-packagr` generates its own `package.json` fields per Angular Package Format convention at build time into `dist/`; this source-tree `package.json` only needs the fields ng-packagr and pnpm need):

```json
{
  "name": "@ultimate/ng-core",
  "version": "0.1.0",
  "description": "Angular-specific foundation for the Ultimate Platform: base component hierarchy, overlay/focus-trap infrastructure, icons, minimal config.",
  "license": "MIT",
  "dependencies": {
    "@ultimate/uix-utils": "workspace:*",
    "@ultimate/uix-styled": "workspace:*",
    "@ultimate/uix-motion": "workspace:*",
    "@ultimate/uix-styles": "workspace:*"
  },
  "peerDependencies": {
    "@angular/core": "^21.0.7",
    "@angular/common": "^21.0.7",
    "@angular/forms": "^21.0.7",
    "@angular/platform-browser": "^21.0.7",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "ng-packagr": "^21.0.0",
    "@angular/build": "^21.0.0",
    "@angular/compiler-cli": "^21.0.7",
    "typescript": "^5.9.3"
  },
  "scripts": {
    "build": "ng-packagr -p ng-package.json",
    "test": "ng test --project=ng-core",
    "typecheck": "tsc --noEmit"
  }
}
```
(`sideEffects` field intentionally omitted here — Task 21 determines and adds it after verification, per the Global Constraints rule.)

- [ ] **Step 3: Scaffold `ng-package.json`, `tsconfig.json`, delete `.gitkeep`**

Create `packages/ng-core/ng-package.json`:
```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "dist",
  "lib": {
    "entryFile": "src/index.ts"
  }
}
```

Create `packages/ng-core/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "experimentalDecorators": false,
    "target": "ES2022",
    "useDefineForClassFields": false
  },
  "include": ["src"],
  "angularCompilerOptions": {
    "strictTemplates": true
  }
}
```
(Angular 21's decorator handling and the exact `angularCompilerOptions` flag set must be verified against the installed `@angular/compiler-cli` version's own schema — run `npx ng-packagr --help` and check `node_modules/@angular/compiler-cli/package.json`'s peer requirements before finalizing; if `experimentalDecorators: false` causes a compile error, Angular 21 may require `true` — this is exactly the kind of "implementation verifies the exact flag set" item the spec flags as not pre-decided.)

Delete `packages/ng-core/.gitkeep` (run `git rm packages/ng-core/.gitkeep`).

- [ ] **Step 4: Write the failing test for `UBaseComponent`**

Create `packages/ng-core/src/basecomponent/base-component.spec.ts`:

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UBaseComponent } from './base-component';

@Component({
  standalone: true,
  selector: 'u-test-component',
  template: '<div [class]="cx(\'root\')"></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent extends UBaseComponent {
  protected override readonly componentName = 'test-component';
  protected override readonly styleModule = {
    css: '.u-test-component-root { color: red; }',
    classes: { root: () => 'u-test-component-root' },
  };
}

describe('UBaseComponent', () => {
  it('resolves a class-name slot via cx()', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div');
    expect(div.className).toBe('u-test-component-root');
  });

  it('registers its style module on init (registration call happens exactly once per componentName)', () => {
    const fixtureA = TestBed.createComponent(TestHostComponent);
    fixtureA.detectChanges();
    const fixtureB = TestBed.createComponent(TestHostComponent);
    fixtureB.detectChanges();
    // Both instances share componentName "test-component" — style registration
    // must be idempotent (registered once), verified by checking the
    // uix-styled StyleSheet service's internal registered-name set exposes
    // "test-component" exactly once, not twice. Exact assertion API depends
    // on Step 1's findings — replace this comment with a concrete assertion
    // against the real StyleSheet service's introspection method once named.
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: FAIL — `./base-component` module does not exist.

- [ ] **Step 6: Write `UBaseComponent`**

Create `packages/ng-core/src/basecomponent/base-component.ts` implementing exactly the interface specified in "Interfaces produced by shared/foundation infrastructure" above, using:
- `inject(DOCUMENT)`, `inject(PLATFORM_ID)`, `inject(ElementRef)`, `inject(Renderer2)` at field-initializer level (matching PrimeNG's own confirmed pattern — see spec's Angular Component Architecture section).
- `cn` imported from `@ultimate/uix-utils/classnames` for the `cx()` implementation.
- The real `StyleSheet` service import/method name from Step 1's findings for `ngOnInit()`'s registration call.
- `standalone: true` on the `@Directive` decorator, no `providers` array (unlike PrimeNG's `BaseComponent`, which provides `BaseComponentStyle`/`BaseStyle` — Ultimate's scoped-down version has no equivalent service pair to provide, since `uix-styled`'s `StyleSheet` is already `providedIn: 'root'`).

- [ ] **Step 7: Run the test to verify it passes**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: PASS

- [ ] **Step 8: Create the barrel files**

`packages/ng-core/src/basecomponent/index.ts`:
```typescript
export { UBaseComponent } from './base-component';
```

`packages/ng-core/src/index.ts`:
```typescript
export * from './basecomponent';
```

- [ ] **Step 9: Write `README.md`**

Create `packages/ng-core/README.md` modeled on `packages/uix-utils/README.md`'s structure (Status, Provenance, Modules, Usage sections), stating: Ultimate-owned Angular foundation, Option B architecture (informed by PrimeNG's `BaseComponent`/`BaseEditableHolder` pattern but independently authored and scoped down — no passthrough/`pt` system), links to `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/ng-core.json`.

- [ ] **Step 10: Write `THIRD-PARTY-NOTICES.md`**

Create `packages/ng-core/THIRD-PARTY-NOTICES.md`, copying the MIT license text verbatim from `packages/ng/THIRD-PARTY-NOTICES.md` (the existing Phase 0 stub — reuse its exact license block and PrimeTek copyright line, updating only the package-specific framing sentence to describe `ng-core` rather than `ng`).

- [ ] **Step 11: Commit**

```bash
git add packages/ng-core/
git commit -m "feat(ng-core): scaffold package and add UBaseComponent

UBaseComponent is a scoped-down reimplementation of PrimeNG's
BaseComponent (Option B) — covers DI wiring, lifecycle, and
uix-styled-backed style registration only. Passthrough (pt) and
global-config surface are explicitly deferred per spec."
```

---

## Task 5: `UBaseEditableHolder` (CVA base for Checkbox)

**Files:**
- Create: `packages/ng-core/src/base-editable-holder/base-editable-holder.ts`
- Create: `packages/ng-core/src/base-editable-holder/base-editable-holder.spec.ts`
- Create: `packages/ng-core/src/base-editable-holder/index.ts`
- Modify: `packages/ng-core/src/index.ts`

**Interfaces:**
- Consumes: `UBaseComponent` (Task 4).
- Produces: `UBaseEditableHolder` exactly as specified above — consumed by Task 11 (`UCheckbox`).

- [ ] **Step 1: Write the failing test**

Create `packages/ng-core/src/base-editable-holder/base-editable-holder.spec.ts`:

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UBaseEditableHolder } from './base-editable-holder';

@Component({
  standalone: true,
  selector: 'u-test-editable',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestEditableComponent extends UBaseEditableHolder {
  protected override readonly componentName = 'test-editable';
  protected override readonly styleModule = { css: '', classes: {} };
  value: unknown;
  override writeValue(value: unknown): void {
    this.value = value;
  }
}

describe('UBaseEditableHolder', () => {
  it('calls registerOnChange callback when onModelChange is invoked', () => {
    const fixture = TestBed.createComponent(TestEditableComponent);
    const instance = fixture.componentInstance;
    let received: unknown;
    instance.registerOnChange((v) => (received = v));
    (instance as unknown as { onModelChange: (v: unknown) => void }).onModelChange('new-value');
    expect(received).toBe('new-value');
  });

  it('setDisabledState writes to the internal _disabled signal, reflected via $disabled', () => {
    // disabled() itself is a read-only InputSignal (Angular's input() has no
    // .set()) — it only reflects a template [disabled] binding. CVA's
    // setDisabledState writes to the separate _disabled signal instead;
    // $disabled = computed(() => disabled() || _disabled()) is the value
    // components actually read. Matches PrimeNG's own confirmed
    // baseeditableholder.ts split-signal pattern exactly.
    const fixture = TestBed.createComponent(TestEditableComponent);
    const instance = fixture.componentInstance;
    expect(instance.$disabled()).toBe(false);
    instance.setDisabledState(true);
    fixture.detectChanges();
    expect(instance.$disabled()).toBe(true);
  });

  it('$disabled is true when the disabled input is bound, even if setDisabledState was never called', () => {
    @Component({
      standalone: true,
      imports: [TestEditableComponent],
      template: `<u-test-editable [disabled]="true" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const editable = fixture.debugElement.query(By.directive(TestEditableComponent))
      .componentInstance as TestEditableComponent;
    expect(editable.$disabled()).toBe(true);
  });

  it('integrates with a real FormControl via [formControl] binding', () => {
    TestBed.configureTestingModule({ imports: [ReactiveFormsModule] });
    const control = new FormControl('initial');
    const fixture = TestBed.createComponent(TestEditableComponent);
    fixture.componentInstance.writeValue(control.value);
    expect(fixture.componentInstance.value).toBe('initial');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: FAIL — `./base-editable-holder` does not exist.

- [ ] **Step 3: Write `UBaseEditableHolder`**

Create `packages/ng-core/src/base-editable-holder/base-editable-holder.ts` implementing `ControlValueAccessor` exactly per the interface above, confirmed against PrimeNG's real `baseeditableholder.ts`:
- `disabled = input<boolean | undefined>(undefined, { transform: booleanAttribute })` — read-only, template-bindable, never written to directly.
- `protected readonly _disabled = signal(false)` — the writable half.
- `readonly $disabled = computed(() => this.disabled() || this._disabled())` — the value every consumer (including Task 14's `UCheckbox` template/host bindings) reads; never read `disabled()` alone for actual disabled-state logic.
- `setDisabledState(isDisabled: boolean): void { this._disabled.set(isDisabled); }` — writes to `_disabled`, never to `disabled`.
- `onModelChange`/`onModelTouched` as protected fields defaulting to no-op functions (`() => {}`), replaced by `registerOnChange`/`registerOnTouched`.

**Do NOT provide `NG_VALUE_ACCESSOR` on `UBaseEditableHolder` itself.** Confirmed against PrimeNG's real source: `BaseEditableHolder` declares no `providers` array at all — every leaf component (`Checkbox` confirmed directly) declares its own `NG_VALUE_ACCESSOR` provider in its own `@Component.providers`, with `useExisting` pointing at the concrete leaf class. This settles the open verification question from this task's original brief: Angular DI providers on a base `@Directive` do NOT propagate to a derived `@Component` — each leaf must redeclare. Task 14's `UCheckbox` therefore must declare `providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UCheckbox, multi: true }]` on its own `@Component` decorator; `UBaseEditableHolder` provides none.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: PASS

- [ ] **Step 5: Create barrel and update root index**

`packages/ng-core/src/base-editable-holder/index.ts`:
```typescript
export { UBaseEditableHolder } from './base-editable-holder';
```

Update `packages/ng-core/src/index.ts`, adding: `export * from './base-editable-holder';`

- [ ] **Step 6: Commit**

```bash
git add packages/ng-core/src/base-editable-holder/ packages/ng-core/src/index.ts
git commit -m "feat(ng-core): add UBaseEditableHolder CVA base for form components"
```

---

## Task 6: `UOverlay` and `UFocusTrap` directives

**Files:**
- Create: `packages/ng-core/src/overlay/overlay.ts`
- Create: `packages/ng-core/src/overlay/overlay.spec.ts`
- Create: `packages/ng-core/src/overlay/index.ts`
- Create: `packages/ng-core/src/focus-trap/focus-trap.ts`
- Create: `packages/ng-core/src/focus-trap/focus-trap.spec.ts`
- Create: `packages/ng-core/src/focus-trap/index.ts`
- Modify: `packages/ng-core/src/index.ts`

**Interfaces:**
- Consumes: `@ultimate/uix-utils`'s `zindex` submodule (for `UOverlay`'s z-index assignment), `@ultimate/uix-motion` (for `UOverlay`'s enter/leave hooks — exposed as `output()`s the consuming component wires to `uix-motion`'s `createMotion`, not internally called by `UOverlay` itself, keeping motion orchestration in the component per the spec's Overlay Architecture responsibility split).
- Produces: `UOverlay`, `UFocusTrap` exactly as specified above — consumed by Task 14 (`UDialog`).

- [ ] **Step 1: Read `packages/uix-utils/src/zindex/index.ts`'s exports to confirm the exact function name/signature**

Run: `grep -n "^export" packages/uix-utils/src/zindex/index.ts`

- [ ] **Step 2: Write the failing test for `UFocusTrap`**

Create `packages/ng-core/src/focus-trap/focus-trap.spec.ts`:

```typescript
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UFocusTrap } from './focus-trap';

@Component({
  standalone: true,
  imports: [UFocusTrap],
  template: `
    <div uFocusTrap>
      <button id="first">First</button>
      <button id="last">Last</button>
    </div>
  `,
})
class TestHostComponent {}

describe('UFocusTrap', () => {
  it('wraps focus from the last focusable element back to the first on Tab', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const last = fixture.nativeElement.querySelector('#last') as HTMLElement;
    const first = fixture.nativeElement.querySelector('#first') as HTMLElement;
    last.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    last.dispatchEvent(event);
    expect(document.activeElement).toBe(first);
  });

  it('does nothing when uFocusTrapDisabled is true', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentRef.setInput('uFocusTrapDisabled', true);
    fixture.detectChanges();
    const last = fixture.nativeElement.querySelector('#last') as HTMLElement;
    last.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    last.dispatchEvent(event);
    expect(document.activeElement).toBe(last);
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: FAIL

- [ ] **Step 4: Write `UFocusTrap`**

Create `packages/ng-core/src/focus-trap/focus-trap.ts` — a `@Directive({selector: '[uFocusTrap]', standalone: true, host: {'(keydown.tab)': 'onTab($event)', '(keydown.shift.tab)': 'onShiftTab($event)'}})` that queries all focusable descendants of `inject(ElementRef).nativeElement` (buttons, links, inputs, and elements with `tabindex` not `-1` — use `@ultimate/uix-utils`'s DOM helpers if a `getFocusableElements`-equivalent exists; check `packages/uix-utils/src/dom/` for one before writing a new query from scratch) and redirects focus at the boundary, guarded by the `uFocusTrapDisabled` input.

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: PASS

- [ ] **Step 6: Write the failing test for `UOverlay`**

Create `packages/ng-core/src/overlay/overlay.spec.ts`:

```typescript
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UOverlay } from './overlay';

@Component({
  standalone: true,
  imports: [UOverlay],
  template: `<div uOverlay [visible]="visible" (visibleChange)="visible = $event">content</div>`,
})
class TestHostComponent {
  visible = false;
}

describe('UOverlay', () => {
  it('appends the host element to document.body when visible becomes true and appendTo is "body"', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const overlayEl = fixture.nativeElement.querySelector('div');
    expect(overlayEl.parentElement).toBe(document.body);
  });

  it('assigns a z-index when appended', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const overlayEl = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(Number(overlayEl.style.zIndex)).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 7: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: FAIL

- [ ] **Step 8: Write `UOverlay`**

Create `packages/ng-core/src/overlay/overlay.ts` exactly per the interface specified above — on `visible` transitioning to `true`, moves the host element (via `Renderer2.appendChild(document.body, el.nativeElement)` when `appendTo() === 'body'`, or the given `HTMLElement` otherwise) and assigns a z-index from `@ultimate/uix-utils`'s zindex function (Step 1's confirmed name). Guard all DOM manipulation behind `isPlatformBrowser(inject(PLATFORM_ID))` per the spec's SSR requirement.

- [ ] **Step 9: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: PASS

- [ ] **Step 10: Create barrels, update root index**

`packages/ng-core/src/overlay/index.ts`: `export { UOverlay } from './overlay';`
`packages/ng-core/src/focus-trap/index.ts`: `export { UFocusTrap } from './focus-trap';`
Update `packages/ng-core/src/index.ts`, adding both exports.

- [ ] **Step 11: Commit**

```bash
git add packages/ng-core/src/overlay/ packages/ng-core/src/focus-trap/ packages/ng-core/src/index.ts
git commit -m "feat(ng-core): add UOverlay and UFocusTrap directives"
```

---

## Task 7: `UltimateConfig` service + remove `UBaseComponent`'s stub

**Files:**
- Create: `packages/ng-core/src/config/ultimate-config.ts`
- Create: `packages/ng-core/src/config/ultimate-config.spec.ts`
- Create: `packages/ng-core/src/config/index.ts`
- Modify: `packages/ng-core/src/basecomponent/base-component.ts` (remove the Task 4 stub, import the real service)
- Modify: `packages/ng-core/src/index.ts`

**Interfaces:**
- Produces: `UltimateConfig` exactly as specified above.

- [ ] **Step 1: Write the failing test**

Create `packages/ng-core/src/config/ultimate-config.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { UltimateConfig } from './ultimate-config';

describe('UltimateConfig', () => {
  it('defaults unstyled to false and ripple to true', () => {
    const config = TestBed.inject(UltimateConfig);
    expect(config.unstyled()).toBe(false);
    expect(config.ripple()).toBe(true);
  });

  it('is a singleton across injections (providedIn root)', () => {
    const a = TestBed.inject(UltimateConfig);
    const b = TestBed.inject(UltimateConfig);
    expect(a).toBe(b);
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: FAIL

- [ ] **Step 3: Write `UltimateConfig`**

Create `packages/ng-core/src/config/ultimate-config.ts` exactly per the interface above.

- [ ] **Step 4: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: PASS

- [ ] **Step 5: Remove the Task 4 stub from `base-component.ts`, wire in the real service**

Edit `packages/ng-core/src/basecomponent/base-component.ts`: delete the local placeholder `UltimateConfig` class definition, add `import { UltimateConfig } from '../config/ultimate-config';` at the top.

- [ ] **Step 6: Run `UBaseComponent`'s and `UBaseEditableHolder`'s tests to confirm nothing broke**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: PASS — all tests from Tasks 4, 5, 6, 7.

- [ ] **Step 7: Create barrel, update root index**

`packages/ng-core/src/config/index.ts`: `export { UltimateConfig } from './ultimate-config';`
Update `packages/ng-core/src/index.ts`, adding the export.

- [ ] **Step 8: Commit**

```bash
git add packages/ng-core/src/config/ packages/ng-core/src/basecomponent/base-component.ts packages/ng-core/src/index.ts
git commit -m "feat(ng-core): add UltimateConfig service, wire into UBaseComponent"
```

---

## Task 8: `UBind` directive

**Files:**
- Create: `packages/ng-core/src/bind/bind.ts`
- Create: `packages/ng-core/src/bind/bind.spec.ts`
- Create: `packages/ng-core/src/bind/index.ts`
- Modify: `packages/ng-core/src/index.ts`

**Interfaces:**
- Produces: `UBind` — a standalone attribute directive, selector `[uBind]`, `input()` accepting `Record<string, unknown> | undefined`, applying arbitrary attribute/style/event-listener bindings to its host element. Not consumed by any Phase 2 proof-set component directly (PrimeNG's `Bind`/passthrough usage inside Button/Dialog/Menu is part of the `pt` machinery this phase's `UBaseComponent` deliberately excludes — see Task 4's interface note) — included because the spec classifies `bind` as ADAPT (foundation infrastructure), not because a Phase 2 component wires it in yet. Confirm this is still true before writing tests: grep the vendored `button.ts`/`dialog.ts`/`menu.ts` for `Bind` usage outside the `pt`/passthrough attribute-injection call sites (`[pBind]="ptm(...)"` pattern) — if none is found outside that pattern, `UBind` is foundation-only in Phase 2, with no direct consumer among the 5 components, and this task still ships it (per spec classification) but its test suite is self-contained, not integration-tested against a Phase 2 component.

- [ ] **Step 1: Write the failing test**

Create `packages/ng-core/src/bind/bind.spec.ts`:

```typescript
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UBind } from './bind';

@Component({
  standalone: true,
  imports: [UBind],
  template: `<div [uBind]="attrs"></div>`,
})
class TestHostComponent {
  attrs: Record<string, unknown> = { 'data-testid': 'example', class: 'foo bar' };
}

describe('UBind', () => {
  it('applies attributes from the bound object to the host element', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div');
    expect(div.getAttribute('data-testid')).toBe('example');
  });

  it('applies class strings via the class key', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div');
    expect(div.classList.contains('foo')).toBe(true);
    expect(div.classList.contains('bar')).toBe(true);
  });

  it('removes an attribute when its value becomes null', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    fixture.componentInstance.attrs = { 'data-testid': null };
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div');
    expect(div.hasAttribute('data-testid')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: FAIL

- [ ] **Step 3: Write `UBind`**

Create `packages/ng-core/src/bind/bind.ts`, adapted from the confirmed PrimeNG `Bind` source (`bind/bind.ts` in the vendored tarball — already extracted at `.vendor-extracted/` per Task 1's mechanism if run for this directory, or re-run `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz bind .vendor-extracted/ng-core/bind` first): rename `Bind` → `UBind`, selector `[pBind]` → `[uBind]`, input `pBind` → keep the input's bound property name matching the selector convention (`uBind`), rewrite the `@primeuix/utils` import (`cn`, `equals`) to `@ultimate/uix-utils/classnames` and `@ultimate/uix-utils/object` respectively (confirm `equals`'s actual submodule location first: `grep -rn "export.*equals" packages/uix-utils/src/`).

- [ ] **Step 4: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: PASS

- [ ] **Step 5: Create barrel, update root index**

`packages/ng-core/src/bind/index.ts`: `export { UBind } from './bind';`
Update `packages/ng-core/src/index.ts`, adding the export.

- [ ] **Step 6: Commit**

```bash
git add packages/ng-core/src/bind/ packages/ng-core/src/index.ts
git commit -m "feat(ng-core): add UBind attribute-binding directive"
```

---

## Task 9: 5 icon components

**Files:**
- Create: `packages/ng-core/src/icons/base-icon.ts`
- Create: `packages/ng-core/src/icons/spinner-icon.ts`
- Create: `packages/ng-core/src/icons/times-icon.ts`
- Create: `packages/ng-core/src/icons/window-maximize-icon.ts`
- Create: `packages/ng-core/src/icons/window-minimize-icon.ts`
- Create: `packages/ng-core/src/icons/icons.spec.ts`
- Create: `packages/ng-core/src/icons/index.ts`
- Modify: `packages/ng-core/src/index.ts`

**Interfaces:**
- Produces: `USpinnerIcon`, `UTimesIcon`, `UWindowMaximizeIcon`, `UWindowMinimizeIcon` — standalone Angular components, each rendering one inline SVG icon, sharing a `UBaseIcon` directive base for the `label` (aliased to `aria-label`) and `spin` inputs. (No `size` input — confirmed absent from real PrimeNG icon source; not invented.) Consumed by Task 12 (`UButton`, loading spinner) and Task 15 (`UDialog`, maximize/minimize/close icons — note: Dialog's close icon is `TimesIcon`, already covered). **Architecture note (found during Task 9):** real PrimeNG icons are `[data-p-icon]` attribute-selector directives whose host IS the consumer-written `<svg>` element, with no `role`/`aria-label` anywhere upstream — this task's actual output is instead element-selector components (`<u-spinner-icon aria-label="..." />`) with a nested accessible `<svg role="img">`, since Angular component inheritance cannot share a template across a `@Component` subclass and the task's own test contract required this shape. Tasks 12/15 consume these as ordinary standalone elements in their `imports` array — this works with either architecture and requires no further change.

- [ ] **Step 1: Extract the 5 icon source files**

Run:
```bash
mkdir -p .vendor-extracted/ng-core/icons
for icon in baseicon spinner times windowmaximize windowminimize; do
  node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz "icons/$icon" ".vendor-extracted/ng-core/icons/$icon"
done
```

- [ ] **Step 2: Write the failing test**

Create `packages/ng-core/src/icons/icons.spec.ts`:

```typescript
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { USpinnerIcon, UTimesIcon, UWindowMaximizeIcon, UWindowMinimizeIcon } from '.';

@Component({
  standalone: true,
  imports: [USpinnerIcon, UTimesIcon, UWindowMaximizeIcon, UWindowMinimizeIcon],
  template: `
    <u-spinner-icon aria-label="loading" />
    <u-times-icon aria-label="close" />
    <u-window-maximize-icon aria-label="maximize" />
    <u-window-minimize-icon aria-label="minimize" />
  `,
})
class TestHostComponent {}

describe('icon components', () => {
  it('each renders exactly one <svg> element', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const svgs = fixture.nativeElement.querySelectorAll('svg');
    expect(svgs.length).toBe(4);
  });

  it('each svg has role="img" and reflects the aria-label input', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const spinnerSvg = fixture.nativeElement.querySelector('u-spinner-icon svg');
    expect(spinnerSvg.getAttribute('role')).toBe('img');
    expect(spinnerSvg.getAttribute('aria-label')).toBe('loading');
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: FAIL

- [ ] **Step 4: Write `UBaseIcon` and the 4 icon components**

Read each extracted file (`.vendor-extracted/ng-core/icons/baseicon/baseicon.ts`, etc.) in full first. Create `packages/ng-core/src/icons/base-icon.ts` (`UBaseIcon`, adapted: `BaseIcon`→`UBaseIcon`, selector/class renames per the Ultimate namespace policy, `role="img"` and `aria-label` input preserved verbatim since these are the confirmed accessibility RETAIN items from the spec). Create the 4 icon files, each extending `UBaseIcon`, with their inline SVG path data copied verbatim from the extracted source (SVG path data is not PrimeNG-branded content — copy it unchanged) and selectors renamed `p-spinner-icon`→`u-spinner-icon` etc.

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: PASS

- [ ] **Step 6: Create barrel, update root index**

`packages/ng-core/src/icons/index.ts`:
```typescript
export { UBaseIcon } from './base-icon';
export { USpinnerIcon } from './spinner-icon';
export { UTimesIcon } from './times-icon';
export { UWindowMaximizeIcon } from './window-maximize-icon';
export { UWindowMinimizeIcon } from './window-minimize-icon';
```
Update `packages/ng-core/src/index.ts`, adding `export * from './icons';`.

- [ ] **Step 7: Commit**

```bash
git add packages/ng-core/src/icons/ packages/ng-core/src/index.ts
git commit -m "feat(ng-core): add 5 icon components (spinner, times, window-maximize/minimize)"
```

---

## Task 10: shared API types (subset)

**Files:**
- Create: `packages/ng-core/src/api/types.ts`
- Create: `packages/ng-core/src/api/index.ts`
- Modify: `packages/ng-core/src/index.ts`

**Interfaces:**
- Produces: `UMenuItem` (interface — fields: `label?: string; icon?: string; routerLink?: string | string[]; command?: (event: unknown) => void; items?: UMenuItem[]; separator?: boolean; disabled?: boolean;` — the subset Task 15's `UMenu` actually renders, confirmed against `menu.ts`'s template bindings, not PrimeNG's full `MenuItem` surface which includes many fields Phase 2's Menu doesn't use), `UTooltipOptions` (interface — fields: `value: string; position?: 'top' | 'bottom' | 'left' | 'right'; disabled?: boolean;` — subset Task 13's `UTooltip` uses). Consumed by Task 13 (`UTooltip`) and Task 15 (`UMenu`).

- [ ] **Step 1: Confirm the exact field subset by reading `menu.ts` and `tooltip.ts`'s template bindings**

Run: `grep -n "item\.\|options\." /tmp/primeng-extract/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src/menu/menu.ts | head -30` (adjust path if the plan is executed on a different machine — re-extract via Task 1's script if `.vendor-extracted/` doesn't already have `menu`/`tooltip` from prior tasks) and the equivalent for `tooltip.ts`, to finalize the exact field list — this is a no-code verification step, not a test.

- [ ] **Step 2: Write `types.ts`**

Create `packages/ng-core/src/api/types.ts` with `UMenuItem` and `UTooltipOptions` interfaces per Step 1's confirmed field list. No test file for this task — it's type-only, no runtime behavior; type correctness is verified transitively by Tasks 13/15 compiling successfully against these types.

- [ ] **Step 3: Create barrel, update root index**

`packages/ng-core/src/api/index.ts`: `export type { UMenuItem, UTooltipOptions } from './types';`
Update `packages/ng-core/src/index.ts`, adding `export * from './api';`.

- [ ] **Step 4: Run typecheck to confirm no syntax errors**

Run: `pnpm --filter @ultimate/ng-core typecheck`
Expected: PASS (no errors — nothing consumes these types yet, so this only validates the file itself parses).

- [ ] **Step 5: Commit**

```bash
git add packages/ng-core/src/api/ packages/ng-core/src/index.ts
git commit -m "feat(ng-core): add shared API type contracts (UMenuItem, UTooltipOptions)"
```

---

## Task 11: `@ultimate/ng` package scaffold + `Ripple`, `AutoFocus`, `Fluid`, `Badge`

**Files:**
- Create: `packages/ng/package.json`
- Create: `packages/ng/ng-package.json`
- Create: `packages/ng/tsconfig.json`
- Create: `packages/ng/src/ripple/{ripple.ts, ripple.spec.ts, index.ts}`
- Create: `packages/ng/src/autofocus/{auto-focus.ts, auto-focus.spec.ts, index.ts}`
- Create: `packages/ng/src/fluid/{fluid.ts, fluid.spec.ts, index.ts}`
- Create: `packages/ng/src/badge/{badge.ts, badge.spec.ts, badge-style.ts, index.ts}`
- Create: `packages/ng/src/index.ts`
- Modify: `packages/ng/THIRD-PARTY-NOTICES.md` (populate existing stub)

**Interfaces:**
- Consumes: `UBaseComponent` (Task 4, for `Badge`, which is a full component with styling), `@ultimate/uix-utils` (DOM helpers for `Ripple`'s pointer-event geometry, `AutoFocus`'s focus call).
- Produces: `URipple` (`[uRipple]` attribute directive), `UAutoFocus` (`[uAutoFocus]` attribute directive), `UFluid` (`[uFluid]` attribute directive, controls responsive-width behavior of descendant form controls), `UBadge` (`u-badge` component). Consumed by Task 12 (`UButton` uses `URipple`, `UAutoFocus`, `UFluid`, `UBadge`), Task 15 (`UMenu` uses `URipple`, `UBadge`).

- [ ] **Step 1: Scaffold `packages/ng/package.json`**

```json
{
  "name": "@ultimate/ng",
  "version": "0.1.0",
  "description": "Ultimate Platform Angular components: Button, Checkbox, Dialog, Menu, Tooltip.",
  "license": "MIT",
  "dependencies": {
    "@ultimate/ng-core": "workspace:*",
    "@ultimate/uix-utils": "workspace:*",
    "@ultimate/uix-styled": "workspace:*",
    "@ultimate/uix-motion": "workspace:*",
    "@ultimate/uix-styles": "workspace:*"
  },
  "peerDependencies": {
    "@angular/core": "^21.0.7",
    "@angular/common": "^21.0.7",
    "@angular/forms": "^21.0.7",
    "@angular/platform-browser": "^21.0.7",
    "@angular/router": "^21.0.7",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "ng-packagr": "^21.0.0",
    "@angular/build": "^21.0.0",
    "@angular/compiler-cli": "^21.0.7",
    "typescript": "^5.9.3"
  },
  "scripts": {
    "build": "ng-packagr -p ng-package.json",
    "test": "ng test --project=ng",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: Scaffold `ng-package.json` (single entry point) and `tsconfig.json`**

Create `packages/ng/ng-package.json`:
```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "dist",
  "lib": {
    "entryFile": "src/index.ts"
  }
}
```
**Correction found during Task 12 (do not add per-directory `ng-package.json` files):** an earlier draft of this plan called for per-directory `ng-package.json` files (one per component/primitive, each pointing at its local `index.ts`), intending PrimeNG's own per-component secondary-entry-point convention. In practice, `ng-packagr` auto-discovers any nested `ng-package.json` as a secondary entry point relative to the package root — a bare `{"lib": {"entryFile": "index.ts"}}` file under `src/<name>/` is not self-consistent with the primary package's own build config (no matching `dest`, no shared compiler context) and fails with `ng-packagr`'s own internal error ("Cannot destructure property 'pos' of 'file.referencedFiles[index]' as it is undefined") the moment one exists — confirmed by adding one and rebuilding. Since `@ultimate/ng` uses a single-entry-point barrel (`packages/ng/src/index.ts`), matching `ng-core`'s own already-approved shape (Task 11's correct deviation from a stricter per-directory reading of this plan), no per-directory `ng-package.json` file is created for any primitive or component in this phase — tree-shaking is still achieved via each module's own barrel export, verified by Task 17's tree-shaking spot-check against the single built package.

Create `packages/ng/tsconfig.json` — identical shape to `packages/ng-core/tsconfig.json` (Task 4, Step 3).

- [ ] **Step 3: Write the failing test for `URipple`**

Create `packages/ng/src/ripple/ripple.spec.ts`:

```typescript
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { URipple } from './ripple';

@Component({
  standalone: true,
  imports: [URipple],
  template: `<button uRipple>Click</button>`,
})
class TestHostComponent {}

describe('URipple', () => {
  it('adds a ripple span element on pointerdown', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new PointerEvent('pointerdown', { clientX: 5, clientY: 5, bubbles: true }));
    fixture.detectChanges();
    expect(button.querySelector('.u-ink')).not.toBeNull();
  });
});
```
(Confirm the exact ripple element's class name from the extracted `ripple.ts` source before finalizing this assertion — PrimeNG's own convention may use a different class name than `.u-ink`; read `.vendor-extracted/ng/ripple/ripple.ts` — extract it first via `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz ripple .vendor-extracted/ng/ripple` — and use its actual class name, renamed to the `.u-*` equivalent.)

- [ ] **Step 4: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng test`
Expected: FAIL

- [ ] **Step 5: Write `URipple`**

Extract via `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz ripple .vendor-extracted/ng/ripple` (if not already done in Step 3). Read the extracted `ripple.ts` in full. Create `packages/ng/src/ripple/ripple.ts`: `Ripple`→`URipple`, selector `[pRipple]`→`[uRipple]`, rewrite `@primeuix/utils` imports to `@ultimate/uix-utils` equivalents, rename `.p-ink`-family classes to `.u-ink`.

- [ ] **Step 6: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng test`
Expected: PASS

- [ ] **Step 7: Repeat Steps 3-6 for `UAutoFocus`**

Test file `packages/ng/src/autofocus/auto-focus.spec.ts` — asserts that an element with `[uAutoFocus]="true"` receives DOM focus after `fixture.detectChanges()` (`expect(document.activeElement).toBe(theElement)`). Extract via `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz autofocus .vendor-extracted/ng/autofocus`. Implementation `packages/ng/src/autofocus/auto-focus.ts`: `AutoFocus`→`UAutoFocus`, `[pAutoFocus]`→`[uAutoFocus]`.

- [ ] **Step 8: Repeat Steps 3-6 for `UFluid`**

Test file `packages/ng/src/fluid/fluid.spec.ts` — asserts `[uFluid]` applies a `.u-fluid` class to its host (read the extracted `fluid.ts` first to confirm its actual mechanism — the spec notes it's a small directive PrimeNG's Button/InputText consume for responsive width). Extract via `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz fluid .vendor-extracted/ng/fluid`. Implementation `packages/ng/src/fluid/fluid.ts`: `Fluid`→`UFluid`, `[pFluid]`→`[uFluid]`.

- [ ] **Step 9: `UBadge` (full component, not just a directive) — write the failing test**

Create `packages/ng/src/badge/badge.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { UBadge } from './badge';

describe('UBadge', () => {
  it('renders its value input as text content', () => {
    const fixture = TestBed.createComponent(UBadge);
    fixture.componentRef.setInput('value', '5');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('5');
  });

  it('applies the u-badge root class', () => {
    const fixture = TestBed.createComponent(UBadge);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('u-badge')).toBe(true);
  });
});
```

- [ ] **Step 10: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng test`
Expected: FAIL

- [ ] **Step 11: Extract and write `UBadge` + `BadgeStyle`**

Run: `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz badge .vendor-extracted/ng/badge`. Read the extracted `badge.ts` and `style/badgestyle.ts` in full. Create `packages/ng/src/badge/badge.ts` (`Badge`→`UBadge`, extends `UBaseComponent`, selector `p-badge`→`u-badge`) and `packages/ng/src/badge/badge-style.ts` (the Angular-side style adapter — `@Injectable`, imports only `style` from `@ultimate/uix-styles/badge`, per Task 3's corrected finding that `@primeuix/styles` exports no `classes`; define `classes` locally in `badge-style.ts`, ported from the extracted `style/badgestyle.ts` reference file's own `const classes = {...}` object with `.p-*`→`.u-*` renamed). **Note:** the spec's Phase 2 proof set does not include a dedicated `uix-styles/badge` module in Task 3's list of 5 — Task 3 only covers `button/checkbox/dialog/menu/tooltip`. Before writing `badge-style.ts`, extract `@primeuix/styles/badge` the same way Task 3 did for the 5 named components (same mechanism: `node scripts/provenance/extract-source.mjs .vendor-cache/@primeuix__styles-2.0.3.tar.gz .vendor-extracted/uix-styles-components` if not already extracted, then copy `badge/index.ts` into `packages/uix-styles/src/badge/index.ts` — it too exports only `style`, no `classes` — with `.p-badge`→`.u-badge` renaming, add its `package.json` subpath export and provenance entry — this is additional necessary work this task must also perform, matching Task 3's corrected pattern exactly, since `UBadge` cannot be styled without it).

- [ ] **Step 12: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng test`
Expected: PASS

- [ ] **Step 13: Create barrels, root index, populate `THIRD-PARTY-NOTICES.md`**

`packages/ng/src/ripple/index.ts`: `export { URipple } from './ripple';`
`packages/ng/src/autofocus/index.ts`: `export { UAutoFocus } from './auto-focus';`
`packages/ng/src/fluid/index.ts`: `export { UFluid } from './fluid';`
`packages/ng/src/badge/index.ts`: `export { UBadge } from './badge';`
`packages/ng/src/index.ts`:
```typescript
export * from './ripple';
export * from './autofocus';
export * from './fluid';
export * from './badge';
```

Update `packages/ng/THIRD-PARTY-NOTICES.md`: replace its "will incorporate" placeholder sentence with "incorporates source derived from `primeng@21.1.9`" (same MIT text already present in the file is otherwise correct and needs no other change).

- [ ] **Step 14: Commit**

```bash
git add packages/ng/ packages/uix-styles/src/badge/ packages/uix-styles/package.json docs/architecture/provenance/uix-styles.json
git commit -m "feat(ng): scaffold package, add Ripple/AutoFocus/Fluid/Badge primitives"
```

---

## Task 12: `UButton`

**Files:**
- Create: `packages/ng/src/button/button.ts`
- Create: `packages/ng/src/button/button.spec.ts`
- Create: `packages/ng/src/button/button-style.ts`
- Create: `packages/ng/src/button/index.ts`
- Modify: `packages/ng/src/index.ts`

**Interfaces:**
- Consumes: `UBaseComponent` (Task 4), `URipple`/`UAutoFocus`/`UFluid`/`UBadge` (Task 11), `USpinnerIcon` (Task 9), `@ultimate/uix-styles/button` (Task 3).
- Produces: `UButton` — standalone component, selector `u-button`. Inputs (signal-based, matching confirmed PrimeNG `button.ts` surface, spec-mandated `input()` not `@Input()`): `label = input<string>()`, `icon = input<string>()`, `iconPos = input<'left'|'right'|'top'|'bottom'>('left')`, `loading = input(false, {transform: booleanAttribute})`, `disabled = input(false, {transform: booleanAttribute})`, `severity = input<string>()`, `raised = input(false, {transform: booleanAttribute})`, `rounded = input(false, {transform: booleanAttribute})`, `text = input(false, {transform: booleanAttribute})`, `outlined = input(false, {transform: booleanAttribute})`, `size = input<'small'|'large'>()`, `fluid = input(false, {transform: booleanAttribute})`. Outputs: `onClick = output<MouseEvent>()`, `onFocus = output<FocusEvent>()`, `onBlur = output<FocusEvent>()`. Consumed by Task 14 (`UDialog` uses `UButton` for header/footer buttons).

- [ ] **Step 1: Extract `button` source**

Run: `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz button .vendor-extracted/ng/button`

Read `.vendor-extracted/ng/button/button.ts` in full.

- [ ] **Step 2: Write the failing test**

Create `packages/ng/src/button/button.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { UButton } from './button';

describe('UButton', () => {
  it('renders the label input as visible text', () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput('label', 'Save');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Save');
  });

  it('emits onClick when clicked and not disabled', () => {
    const fixture = TestBed.createComponent(UButton);
    let emitted: MouseEvent | undefined;
    fixture.componentInstance.onClick.subscribe((e: MouseEvent) => (emitted = e));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(emitted).toBeDefined();
  });

  it('does not emit onClick when disabled', () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput('disabled', true);
    let emitted = false;
    fixture.componentInstance.onClick.subscribe(() => (emitted = true));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(emitted).toBe(false);
  });

  it('renders u-button-loading class and a spinner icon when loading is true', () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').classList.contains('u-button-loading')).toBe(true);
    expect(fixture.nativeElement.querySelector('u-spinner-icon')).not.toBeNull();
  });

  it('applies the disabled attribute to the native <button> when disabled input is true', () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });

  it('has aria-label reflecting the label input when no explicit ariaLabel is set', () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput('label', 'Save');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label') ?? fixture.nativeElement.textContent).toContain('Save');
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng test`
Expected: FAIL

- [ ] **Step 4: Write `ButtonStyle` adapter**

Extract PrimeNG's own `button/style/buttonstyle.ts` reference file (via `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz button/style .vendor-extracted/ng/button-style` if not already covered by Step 1's `button` extraction) and read its `const classes = {...}` object in full — this is the design reference for the `classes` object below, not something imported from `uix-styles` (confirmed during Task 3: `@primeuix/styles` exports only raw CSS, no `classes`).

Create `packages/ng/src/button/button-style.ts`:
```typescript
import { Injectable } from '@angular/core';
import { style } from '@ultimate/uix-styles/button';

@Injectable()
export class ButtonStyle {
  readonly style = style;
  readonly classes = {
    root: ({ instance }: { instance: any }) => [
      'u-button u-component',
      {
        'u-button-icon-only': instance.hasIcon && !instance.label,
        'u-button-loading': instance.loading,
        [`u-button-${instance.severity}`]: instance.severity,
        'u-button-raised': instance.raised,
        'u-button-rounded': instance.rounded,
        'u-button-text': instance.text,
        'u-button-outlined': instance.outlined,
        'u-button-sm': instance.size === 'small',
        'u-button-lg': instance.size === 'large',
        'u-button-fluid': instance.fluid,
      },
    ],
    loadingIcon: 'u-button-loading-icon',
    icon: ({ instance }: { instance: any }) => [
      'u-button-icon',
      {
        [`u-button-icon-${instance.iconPos}`]: instance.label,
      },
    ],
    label: 'u-button-label',
  };
}
```
(Ported from PrimeNG's own `buttonstyle.ts` `const classes = {...}` object — the extracted reference file, above — with `.p-*`→`.u-*` renamed and PrimeNG's `instance.buttonProps?.x` passthrough-fallback pattern dropped, since Phase 2's `UButton` has no passthrough/`pt` system per Task 4's scoped-down `UBaseComponent`. This is the "thin Angular `@Injectable` adapter" the spec's Styling Strategy describes — `style` still comes from `@ultimate/uix-styles/button`, `classes` is genuinely component-authored and lives here, not upstream. No loaded-style-name bookkeeping reimplemented here, that responsibility stays in `UBaseComponent`'s `ngOnInit`/`uix-styled` registration call.)

- [ ] **Step 5: Write `UButton`**

Create `packages/ng/src/button/button.ts`, extending `UBaseComponent`, `standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`, `selector: 'u-button'`, importing `URipple`/`UAutoFocus`/`UFluid`/`UBadge`/`USpinnerIcon` in its `imports` array, with the inline template rendering a native `<button>` element (matching PrimeNG's confirmed pattern of a real `<button>`, not a `<div>` with ARIA role), all inputs/outputs exactly per this task's Interfaces section, `cx('root')`/`cx('label')`/`cx('icon')`/`cx('loadingIcon')` calls (inherited from `UBaseComponent`) resolving classes from the injected `ButtonStyle`'s locally-defined `classes` object above, disabled/loading state driving both the native `disabled` attribute and the `.u-button-loading`/`.u-button-icon-only` conditional classes.

- [ ] **Step 6: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng test`
Expected: PASS (all 6 assertions)

- [ ] **Step 7: Create barrel, secondary entry point config, update root index**

`packages/ng/src/button/index.ts`: `export { UButton } from './button';`
Update `packages/ng/src/index.ts`, adding `export * from './button';`

- [ ] **Step 8: Add file-level provenance entries for button**

Append entries to (new, created in this task if not already started) `docs/architecture/provenance/ng.json` for `button.ts` (status: `"adapted"`) and `button-style.ts` (status: `"adapted"`, description noting it delegates loaded-style tracking to `@ultimate/uix-styled` per the spec's Styling Strategy, unlike PrimeNG's own `BaseStyle`).

- [ ] **Step 9: Commit**

```bash
git add packages/ng/src/button/ docs/architecture/provenance/ng.json
git commit -m "feat(ng): add UButton component"
```

---

## Task 13: `UTooltip`

**Files:**
- Create: `packages/ng/src/tooltip/tooltip.ts`
- Create: `packages/ng/src/tooltip/tooltip.spec.ts`
- Create: `packages/ng/src/tooltip/tooltip-style.ts`
- Create: `packages/ng/src/tooltip/index.ts`
- Modify: `packages/ng/src/index.ts`

**Interfaces:**
- Consumes: `UBaseComponent` (Task 4), `UTooltipOptions` (Task 10), `@ultimate/uix-styles/tooltip` (Task 3), `@ultimate/uix-utils`'s `zindex` and DOM-measurement helpers (`getViewport`, `getOuterWidth`, `getOuterHeight`, `getWindowScrollLeft`, `getWindowScrollTop` — confirm exact names via `grep -n "^export" packages/uix-utils/src/dom/index.ts` before writing Step 5).
- Produces: `UTooltip` — standalone attribute directive, selector `[uTooltip]`. Inputs: `uTooltip = input<string>()` (the tooltip text, matching PrimeNG's `[pTooltip]` binding convention), `uTooltipPosition = input<'top'|'bottom'|'left'|'right'>('top')`, `uTooltipDisabled = input(false, {transform: booleanAttribute})`. Consumed by Task 15 (`UMenu` applies `[uTooltip]` to truncated item labels).

- [ ] **Step 1: Extract `tooltip` source**

Run: `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz tooltip .vendor-extracted/ng/tooltip`

Read `.vendor-extracted/ng/tooltip/tooltip.ts` in full.

- [ ] **Step 2: Write the failing test**

Create `packages/ng/src/tooltip/tooltip.spec.ts`:

```typescript
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UTooltip } from './tooltip';

@Component({
  standalone: true,
  imports: [UTooltip],
  template: `<button [uTooltip]="'Save changes'">Save</button>`,
})
class TestHostComponent {}

describe('UTooltip', () => {
  it('does not render a tooltip element before hover/focus', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('shows a tooltip element with role="tooltip" and the bound text on mouseenter', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    const tooltip = document.querySelector('[role="tooltip"]');
    expect(tooltip).not.toBeNull();
    expect(tooltip!.textContent).toContain('Save changes');
  });

  it('hides the tooltip on mouseleave', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('does not show a tooltip when uTooltipDisabled is true', () => {
    TestBed.overrideComponent(TestHostComponent, {
      set: { template: `<button [uTooltip]="'Save changes'" [uTooltipDisabled]="true">Save</button>` },
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng test`
Expected: FAIL

- [ ] **Step 4: Write `TooltipStyle` adapter**

Create `packages/ng/src/tooltip/tooltip-style.ts` — same shape as `ButtonStyle` (Task 12, Step 4): import only `style` from `@ultimate/uix-styles/tooltip` (it exports no `classes`), define `classes` locally in this file, ported from PrimeNG's own extracted `tooltip/style/tooltipstyle.ts` reference file with `.p-*`→`.u-*` renamed.

- [ ] **Step 5: Write `UTooltip`**

Create `packages/ng/src/tooltip/tooltip.ts`, extending `UBaseComponent`, `@Directive({selector: '[uTooltip]', standalone: true, host: {'(mouseenter)': 'show()', '(mouseleave)': 'hide()', '(focus)': 'show()', '(blur)': 'hide()'}})`. On `show()`: create the tooltip DOM element via `Renderer2`, set `role="tooltip"` (per the spec's confirmed accessibility RETAIN item), position it using the DOM-measurement helpers from `@ultimate/uix-utils` relative to the host element per the input `uTooltipPosition`, append to `document.body`, assign z-index via `@ultimate/uix-utils`'s zindex function. On `hide()`: remove the element. Guard DOM creation behind `isPlatformBrowser()`.

- [ ] **Step 6: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng test`
Expected: PASS

- [ ] **Step 7: Create barrel, secondary entry point config, update root index**

`packages/ng/src/tooltip/index.ts`: `export { UTooltip } from './tooltip';`
Update `packages/ng/src/index.ts`, adding `export * from './tooltip';`

- [ ] **Step 8: Append provenance entries to `docs/architecture/provenance/ng.json`**

Entries for `tooltip.ts` and `tooltip-style.ts`, status `"adapted"`.

- [ ] **Step 9: Commit**

```bash
git add packages/ng/src/tooltip/ docs/architecture/provenance/ng.json
git commit -m "feat(ng): add UTooltip directive"
```

---

## Task 14: `UCheckbox`

**Files:**
- Create: `packages/ng/src/checkbox/checkbox.ts`
- Create: `packages/ng/src/checkbox/checkbox.spec.ts`
- Create: `packages/ng/src/checkbox/checkbox-style.ts`
- Create: `packages/ng/src/checkbox/index.ts`
- Modify: `packages/ng/src/index.ts`

**Interfaces:**
- Consumes: `UBaseEditableHolder` (Task 5), `@ultimate/uix-styles/checkbox` (Task 3).
- Produces: `UCheckbox` — standalone component, selector `u-checkbox`, implements `ControlValueAccessor` via inherited `UBaseEditableHolder`. Inputs: `binary = input(false, {transform: booleanAttribute})`, `label = input<string>()`, plus inherited `disabled`. No `UCheckbox`-specific outputs beyond the CVA contract (matching confirmed PrimeNG behavior — value changes flow through `onModelChange`, not a separate `output()`).

- [ ] **Step 1: Extract `checkbox` source**

Run: `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz checkbox .vendor-extracted/ng/checkbox`

Read `.vendor-extracted/ng/checkbox/checkbox.ts` in full.

- [ ] **Step 2: Write the failing test**

Create `packages/ng/src/checkbox/checkbox.spec.ts`:

```typescript
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UCheckbox } from './checkbox';

describe('UCheckbox', () => {
  it('renders a native input[type=checkbox] with role reflecting native semantics', () => {
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(input).not.toBeNull();
  });

  it('toggles aria-checked / checked state on click', () => {
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    input.click();
    fixture.detectChanges();
    expect(input.checked).toBe(true);
  });

  it('toggles on Space keypress', () => {
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();
    expect(input.checked).toBe(true);
  });

  it('integrates with FormControl — writeValue reflects into the checkbox, user interaction propagates back', () => {
    @Component({
      standalone: true,
      imports: [UCheckbox, ReactiveFormsModule],
      template: `<u-checkbox [formControl]="control" [binary]="true" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it('respects the disabled input by disabling the native input', () => {
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(input.disabled).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng test`
Expected: FAIL

- [ ] **Step 4: Write `CheckboxStyle` adapter**

Create `packages/ng/src/checkbox/checkbox-style.ts` — same shape as `ButtonStyle` (Task 12, Step 4): import only `style` from `@ultimate/uix-styles/checkbox` (it exports no `classes`), define `classes` locally in this file, ported from PrimeNG's own extracted `checkbox/style/checkboxstyle.ts` reference file with `.p-*`→`.u-*` renamed.

- [ ] **Step 5: Write `UCheckbox`**

Create `packages/ng/src/checkbox/checkbox.ts`, extending `UBaseEditableHolder`, `standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`, `selector: 'u-checkbox'`, `providers: [{provide: NG_VALUE_ACCESSOR, useExisting: UCheckbox, multi: true}]` (required here — confirmed during Task 5 against PrimeNG's real source that `UBaseEditableHolder` provides no `NG_VALUE_ACCESSOR` of its own; every leaf component must declare its own), template rendering a real `<input type="checkbox">` bound to `$disabled()` (the combined computed value — never bind to the base `disabled()` input alone, since it doesn't reflect `setDisabledState`'s CVA-driven value) and a local `checked` signal, `(change)` handler calling `writeValue`+`onModelChange`, `(keydown.space)` handler toggling and preventing default space-scroll behavior.

- [ ] **Step 6: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng test`
Expected: PASS

- [ ] **Step 7: Create barrel, secondary entry point config, update root index**

`packages/ng/src/checkbox/index.ts`: `export { UCheckbox } from './checkbox';`
Update `packages/ng/src/index.ts`, adding `export * from './checkbox';`

- [ ] **Step 8: Append provenance entries**

Entries in `docs/architecture/provenance/ng.json` for `checkbox.ts`, `checkbox-style.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ng/src/checkbox/ docs/architecture/provenance/ng.json
git commit -m "feat(ng): add UCheckbox component"
```

---

## Task 15: `UDialog`

**Files:**
- Create: `packages/ng/src/dialog/dialog.ts`
- Create: `packages/ng/src/dialog/dialog.spec.ts`
- Create: `packages/ng/src/dialog/dialog-style.ts`
- Create: `packages/ng/src/dialog/index.ts`
- Modify: `packages/ng/src/index.ts`

**Interfaces:**
- Consumes: `UBaseComponent` (Task 4), `UOverlay`/`UFocusTrap` (Task 6), `UButton` (Task 12), `UTimesIcon`/`UWindowMaximizeIcon`/`UWindowMinimizeIcon` (Task 9), `@ultimate/uix-motion` (enter/leave animation), `@ultimate/uix-styles/dialog` (Task 3).
- Produces: `UDialog` — standalone component, selector `u-dialog`. Inputs: `visible = input(false)`, `header = input<string>()`, `closable = input(true, {transform: booleanAttribute})`, `closeOnEscape = input(true, {transform: booleanAttribute})`, `modal = input(true, {transform: booleanAttribute})`. Outputs: `visibleChange = output<boolean>()`, `onShow = output<void>()`, `onHide = output<void>()`.

- [ ] **Step 1: Extract `dialog` source**

Run: `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz dialog .vendor-extracted/ng/dialog`

Read `.vendor-extracted/ng/dialog/dialog.ts` in full (already read once during spec research — re-read now for implementation-level detail, e.g. `bindDocumentEscapeListener`'s exact implementation, confirmed present at the source's line ~991-992 per the spec).

- [ ] **Step 2: Write the failing test**

Create `packages/ng/src/dialog/dialog.spec.ts`:

```typescript
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UDialog } from './dialog';

@Component({
  standalone: true,
  imports: [UDialog],
  template: `<u-dialog [(visible)]="visible" header="Confirm" [modal]="true">Body content</u-dialog>`,
})
class TestHostComponent {
  visible = false;
}

describe('UDialog', () => {
  it('does not render dialog content when visible is false', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders with role="dialog", aria-modal="true", and aria-labelledby pointing at the header when visible', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const dialogEl = document.querySelector('[role="dialog"]');
    expect(dialogEl).not.toBeNull();
    expect(dialogEl!.getAttribute('aria-modal')).toBe('true');
    const labelledBy = dialogEl!.getAttribute('aria-labelledby');
    expect(document.getElementById(labelledBy!)?.textContent).toContain('Confirm');
  });

  it('closes and emits visibleChange(false) on Escape when closeOnEscape is true', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.visible).toBe(false);
  });

  it('does not close on Escape when closeOnEscape is false', () => {
    TestBed.overrideComponent(TestHostComponent, {
      set: {
        template: `<u-dialog [(visible)]="visible" header="Confirm" [closeOnEscape]="false">Body</u-dialog>`,
      },
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.visible).toBe(true);
  });

  it('traps focus within the dialog while open', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const dialogEl = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialogEl.querySelector('[uFocusTrap]')).not.toBeNull();
  });

  it('returns focus to the triggering element when closed', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    fixture.componentInstance.visible = false;
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
```
(This last test operationalizes the spec's flagged "needs implementation-time verification" item for Dialog's focus-return-on-close — if it fails, that confirms the spec's flagged gap is real and `UDialog` must implement focus-return explicitly, storing `document.activeElement` on open and restoring it on close, since PrimeNG's own confirmed source did not verify this behavior either way.)

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng test`
Expected: FAIL

- [ ] **Step 4: Write `DialogStyle` adapter**

Create `packages/ng/src/dialog/dialog-style.ts` — same shape as `ButtonStyle` (Task 12, Step 4): import only `style` from `@ultimate/uix-styles/dialog` (it exports no `classes`), define `classes` locally in this file, ported from PrimeNG's own extracted `dialog/style/dialogstyle.ts` reference file with `.p-*`→`.u-*` renamed.

- [ ] **Step 5: Write `UDialog`**

Create `packages/ng/src/dialog/dialog.ts`, extending `UBaseComponent`, `standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`, `selector: 'u-dialog'`, importing `UOverlay`/`UFocusTrap`/`UButton`/`UTimesIcon`/`UWindowMaximizeIcon`/`UWindowMinimizeIcon` in its `imports` array. Template: an `[uOverlay]`-hosted root with `role="dialog"`, `[attr.aria-modal]="modal()"`, `[attr.aria-labelledby]`, wrapping content in `[uFocusTrap]`. On `ngOnInit`/effect watching `visible()`: when transitioning to `true`, capture `document.activeElement` into a private field; when transitioning to `false`, restore focus to it (addressing the spec's flagged gap directly, confirmed necessary by Step 2's test). Escape handling: a `(document:keydown.escape)` host listener (or explicit `Renderer2.listen(document, 'keydown', ...)` matching PrimeNG's confirmed `bindDocumentEscapeListener` pattern) guarded by `closeOnEscape()`, setting `visible` to `false` and emitting `visibleChange(false)`/`onHide()`. Wire `@ultimate/uix-motion`'s enter/leave animation to the visibility transition per the spec's Overlay Architecture responsibility split (component wires `UOverlay` + `UFocusTrap` + `uix-motion` together, not abstracted into a shared service — spec's explicit YAGNI call since Dialog is the only overlay component this phase).

- [ ] **Step 6: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng test`
Expected: PASS (all 6 assertions, including the focus-return test)

- [ ] **Step 7: Create barrel, secondary entry point config, update root index**

`packages/ng/src/dialog/index.ts`: `export { UDialog } from './dialog';`
Update `packages/ng/src/index.ts`, adding `export * from './dialog';`

- [ ] **Step 8: Append provenance entries**

Entries in `docs/architecture/provenance/ng.json` for `dialog.ts`, `dialog-style.ts` — note in the `modificationDescription` for `dialog.ts` that focus-return-on-close was added during implementation to close the gap the spec explicitly flagged as unverified in the source.

- [ ] **Step 9: Commit**

```bash
git add packages/ng/src/dialog/ docs/architecture/provenance/ng.json
git commit -m "feat(ng): add UDialog component

Implements focus-return-to-trigger-on-close explicitly, closing the
accessibility gap the Phase 2 spec flagged as unverified in PrimeNG's
own source."
```

---

## Task 16: `UMenu`

**Files:**
- Create: `packages/ng/src/menu/menu.ts`
- Create: `packages/ng/src/menu/menu.spec.ts`
- Create: `packages/ng/src/menu/menu-style.ts`
- Create: `packages/ng/src/menu/index.ts`
- Modify: `packages/ng/src/index.ts`

**Interfaces:**
- Consumes: `UBaseComponent` (Task 4), `URipple`/`UBadge` (Task 11), `UTooltip` (Task 13), `UMenuItem` (Task 10), `@angular/router`'s `RouterModule` (external peer dep), `@ultimate/uix-styles/menu` (Task 3).
- Produces: `UMenu` — standalone component, selector `u-menu`. Inputs: `model = input<UMenuItem[]>([])`, `popup = input(false, {transform: booleanAttribute})`.

- [ ] **Step 1: Extract `menu` source**

Run: `node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz menu .vendor-extracted/ng/menu`

Read `.vendor-extracted/ng/menu/menu.ts` in full (this is the file that revealed the Menu→Tooltip dependency during spec research — re-confirm the exact `pTooltip`/`routerLink` template bindings at this implementation stage, since the plan must wire `[uTooltip]` and `routerLink` using the Ultimate-renamed selectors, not the PrimeNG originals).

- [ ] **Step 2: Write the failing test**

Create `packages/ng/src/menu/menu.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { UMenu } from './menu';
import type { UMenuItem } from '@ultimate/ng-core';

describe('UMenu', () => {
  const items: UMenuItem[] = [
    { label: 'Home', icon: 'home' },
    { separator: true },
    { label: 'Settings', routerLink: '/settings' },
  ];

  it('renders role="menu" on the root list and role="menuitem" per item', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput('model', items);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBe(2);
  });

  it('renders role="separator" for separator items', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput('model', items);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="separator"]')).not.toBeNull();
  });

  it('moves focus to the next menuitem on ArrowDown (roving tabindex)', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput('model', items);
    fixture.detectChanges();
    const menuItems = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    menuItems[0].focus();
    menuItems[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(menuItems[1]);
  });

  it('applies routerLink navigation to items with a routerLink field', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'settings', children: [] }])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput('model', items);
    fixture.detectChanges();
    const settingsLink = Array.from(fixture.nativeElement.querySelectorAll('a')).find((a) =>
      (a as HTMLElement).textContent?.includes('Settings')
    ) as HTMLAnchorElement;
    expect(settingsLink.getAttribute('href')).toContain('/settings');
  });

  it('applies [uTooltip] to an item label so a tooltip appears on hover for long labels', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput('model', [{ label: 'A very long menu item label that truncates' }]);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('[role="menuitem"] span, [role="menuitem"]');
    label.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/ng test`
Expected: FAIL

- [ ] **Step 4: Write `MenuStyle` adapter**

Create `packages/ng/src/menu/menu-style.ts` — same shape as `ButtonStyle` (Task 12, Step 4): import only `style` from `@ultimate/uix-styles/menu` (it exports no `classes`), define `classes` locally in this file, ported from PrimeNG's own extracted `menu/style/menustyle.ts` reference file with `.p-*`→`.u-*` renamed.

- [ ] **Step 5: Write `UMenu`**

Create `packages/ng/src/menu/menu.ts`, extending `UBaseComponent`, `standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`, `selector: 'u-menu'`, importing `RouterModule`, `URipple`, `UBadge`, `UTooltip` in its `imports` array. Template: `<ul role="menu">` iterating `model()` via `@for`, each non-separator item as `<li role="none"><a role="menuitem" [tabindex]="...">` with `[routerLink]="item.routerLink"` when present, `[uTooltip]="item.label"` on the label span (per the confirmed Menu→Tooltip dependency), separator items as `<li role="separator">`. Keyboard navigation: `(keydown.arrowDown)`/`(keydown.arrowUp)` host listeners on the root implementing roving tabindex (move `tabindex="0"` to the next/previous non-disabled, non-separator item, call `.focus()` on it) — this operationalizes the spec's flagged "needs implementation-time verification" item for Menu's roving tabindex, confirmed necessary by Step 2's test.

- [ ] **Step 6: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/ng test`
Expected: PASS (all 5 assertions)

- [ ] **Step 7: Create barrel, secondary entry point config, update root index**

`packages/ng/src/menu/index.ts`: `export { UMenu } from './menu';`
Update `packages/ng/src/index.ts`, adding `export * from './menu';`

- [ ] **Step 8: Append provenance entries**

Entries in `docs/architecture/provenance/ng.json` for `menu.ts`, `menu-style.ts` — note in `modificationDescription` for `menu.ts` that roving-tabindex keyboard navigation was implemented explicitly during Phase 2, closing the gap the spec flagged as unverified.

- [ ] **Step 9: Commit**

```bash
git add packages/ng/src/menu/ docs/architecture/provenance/ng.json
git commit -m "feat(ng): add UMenu component

Implements roving-tabindex keyboard navigation explicitly, closing
the accessibility gap the Phase 2 spec flagged as unverified. Confirms
and wires the Menu→Tooltip dependency the spec's research surfaced."
```

---

## Task 17: `sideEffects` verification and tree-shaking spot-check

**Context:** the spec explicitly forbids mandating `sideEffects: false` without verification (Global Constraints). This task performs that verification and sets the final value in both `package.json` files.

**Files:**
- Modify: `packages/ng-core/package.json` (add `sideEffects` field)
- Modify: `packages/ng/package.json` (add `sideEffects` field)
- Create: `scripts/provenance/verify-tree-shaking.mjs` (throwaway-but-committed verification script, per spec's Performance section)

**Interfaces:**
- Consumes: built `dist/` output of both packages (requires Tasks 4-16 complete and both packages built).

- [ ] **Step 1: Build both packages**

Run: `pnpm --filter @ultimate/ng-core build && pnpm --filter @ultimate/ng build`
Expected: both succeed, producing a single-entry-point `dist/` for each package (`fesm2022/ultimate-ng-core.mjs`, `fesm2022/ultimate-ng.mjs`, plus `types/`) — per Task 12's correction, neither package uses per-directory secondary entry points, so there is one bundle per package, not one subdirectory per component.

- [ ] **Step 2: Write `verify-tree-shaking.mjs`**

**Architecture note (from Task 12's correction):** because `@ultimate/ng` is a single-entry-point barrel (no `@ultimate/ng/button`-style subpath exports), a consumer importing `UButton` writes `import { UButton } from "@ultimate/ng"`, not a per-component subpath. This means tree-shaking of `UDialog`'s code out of a `UButton`-only bundle depends entirely on the downstream bundler's ES-module dead-code elimination correctly analyzing the single `ultimate-ng.mjs` file's named exports — it is a materially weaker guarantee than true per-component subpath isolation (which real PrimeNG's per-directory secondary entry points provide, and which an earlier, broken draft of this plan assumed `@ultimate/ng` would also have). This script verifies the weaker, still-real guarantee — that a bundler *can* eliminate unused exports from the single barrel — not file-level isolation. If Task 19's bundle-size measurements show this guarantee is insufficient in practice, revisiting true secondary entry points (via a correctly-configured multi-entry-point `ng-packagr` setup, not per-directory `ng-package.json` files) is a later-phase decision, not resolved here.

Create `scripts/provenance/verify-tree-shaking.mjs`:

```javascript
#!/usr/bin/env node
// scripts/provenance/verify-tree-shaking.mjs
//
// Confirms that importing only UButton from the single @ultimate/ng barrel
// (via a minimal esbuild bundle) does not pull in UDialog's overlay/focus-
// trap/motion dependencies, and that style registration still executes when
// sideEffects is set to false. If style registration silently breaks under
// sideEffects:false, this script's second check fails, and package.json
// must instead declare an explicit array of side-effectful paths (each
// component's style module).
//
// Verifies bundler-level dead-code elimination within the single barrel
// export, not per-component file isolation — see this task's own
// Architecture note for why @ultimate/ng has no per-component subpaths.

import { build } from "esbuild";
import { writeFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const workDir = mkdtempSync(join(tmpdir(), "verify-tree-shaking-"));
const entryFile = join(workDir, "entry.mjs");
writeFileSync(entryFile, `import { UButton } from "@ultimate/ng";\nconsole.log(UButton);\n`);

try {
  const result = await build({
    entryPoints: [entryFile],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    absWorkingDir: process.cwd(),
  });

  const bundleText = result.outputFiles[0].text;

  if (bundleText.includes("u-dialog") || bundleText.includes("UDialog")) {
    console.error(
      "[verify-tree-shaking] FAIL: importing only UButton pulled in Dialog-related code — the bundler is not eliminating unused exports from the single @ultimate/ng barrel"
    );
    process.exit(1);
  }
  console.log("[verify-tree-shaking] OK: importing UButton does not pull in UDialog");

  console.log(
    "[verify-tree-shaking] MANUAL CHECK REQUIRED: run the built bundle in a browser/jsdom context and confirm UButton's style is actually registered with @ultimate/uix-styled's StyleSheet service at runtime — this script's static bundle inspection cannot execute Angular DI/lifecycle, only confirm dead-code elimination worked structurally."
  );
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
```

- [ ] **Step 3: Run the verification script with `sideEffects` unset (default: bundler assumes side-effect-free)**

Run: `node scripts/provenance/verify-tree-shaking.mjs`
Expected: PASS on the static bundle-content check. Record the result.

- [ ] **Step 4: Manually verify style registration under this configuration**

In a scratch Angular test (or by extending one of Task 12's existing `UButton` spec assertions temporarily), confirm that after `TestBed.createComponent(UButton)` + `detectChanges()`, `@ultimate/uix-styled`'s `StyleSheet` service reports `button`'s style as registered (use the real introspection method confirmed during Task 4, Step 1). This confirms style-registration side effects survive real Angular's module evaluation, independent of the bundler-level tree-shaking check in Step 3.

- [ ] **Step 5: Decide and set the final `sideEffects` value**

If Steps 3-4 both pass cleanly with no `sideEffects` field at all (bundler default, which treats the package as NOT side-effect-free unless declared otherwise — the safe default), set explicitly:

```json
"sideEffects": false
```

in both `packages/ng-core/package.json` and `packages/ng/package.json`, ONLY if Step 4's style-registration check still passes when re-run against a build produced with `sideEffects: false` set (rebuild and re-test after adding the field, don't assume the earlier passing result still holds). If style registration breaks under `sideEffects: false`, set instead:

```json
"sideEffects": ["**/*-style.ts", "**/*-style.mjs"]
```

(or the exact glob matching the actual compiled style-adapter file names in `dist/`, confirmed by inspecting `dist/` structure from Step 1's build).

- [ ] **Step 6: Re-run both packages' full test suites to confirm nothing regressed**

Run: `pnpm --filter @ultimate/ng-core test && pnpm --filter @ultimate/ng test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add packages/ng-core/package.json packages/ng/package.json scripts/provenance/verify-tree-shaking.mjs
git commit -m "chore(ng): determine and set verified sideEffects configuration

Resolves the spec's explicit requirement not to mandate sideEffects:false
without verifying it against real Angular/APF tree-shaking and UIX
style-registration behavior together."
```

---

## Task 18: Provenance documentation updates

**Files:**
- Modify: `docs/architecture/PROVENANCE.md` (PrimeNG entry)
- Modify: `docs/architecture/PACKAGE_ARCHITECTURE.md`
- Modify: `docs/architecture/DECISIONS.md` (ADR-018 through ADR-022)
- Create: `docs/architecture/COMPONENT_INVENTORY.md`
- Modify: `packages/ng-core/README.md`, `packages/ng/README.md` (if not already finalized in earlier tasks — confirm both exist and are accurate)

- [ ] **Step 1: Update the PrimeNG entry in `docs/architecture/PROVENANCE.md`**

Change the existing PrimeNG heading's `Modification status`, `Modification description`, `Date incorporated` fields from their current "not yet incorporated" placeholders to:

```markdown
- **Modification status:** incorporated (Phase 2) — foundation tier reimplemented with PrimeNG as design reference, not copied verbatim (Option B); Button/Checkbox/Dialog/Menu/Tooltip and their direct primitive dependencies (Ripple/AutoFocus/Fluid/Badge) adapted with full Ultimate namespace rename (selectors, class names, CSS classes). Remaining ~112 source areas classified but not incorporated — see `docs/architecture/COMPONENT_INVENTORY.md`.
- **Modification description:** see file-level manifests at `docs/architecture/provenance/ng-core.json` and `docs/architecture/provenance/ng.json` for per-file status.
- **Date incorporated:** [fill in actual date this task is executed]
```

- [ ] **Step 2: Update `docs/architecture/PACKAGE_ARCHITECTURE.md`**

Change the "Framework core packages" and "Framework component packages" bullet descriptions from describing `ng-core`/`ng` as reserved/future to confirming they are now active, linking to their respective `README.md` files.

- [ ] **Step 3: Add ADR-018 through ADR-022 to `docs/architecture/DECISIONS.md`**

Append:

```markdown
## ADR-018 — Option B: Ultimate-owned Angular base-class architecture

Status: Accepted (Phase 2 spec). `ng-core`'s `UBaseComponent`/`UBaseEditableHolder` hierarchy is independently authored, informed by but not copied from PrimeNG's `BaseComponent`/`BaseEditableHolder` — notably, PrimeNG's full passthrough (`pt`)/global-config surface is excluded from Phase 2's `UBaseComponent`, which covers only DI wiring, lifecycle, and `@ultimate/uix-styled`-backed style registration. Revisit passthrough support only if a later-phase component creates real duplicate-pattern pressure (spec: DEFER, Needs Architecture Decision).

## ADR-019 — Standalone-only, no NgModule support

Status: Accepted (Phase 2 spec). No `NgModule` authored in `ng-core` or `ng`. Ultimate has no pre-existing external consumer base requiring NgModule backward compatibility.

## ADR-020 — Homegrown overlay/focus-trap retained over `@angular/cdk` Overlay

Status: Accepted (Phase 2 spec). `@angular/cdk` is confirmed unused across the entire 5-component proof-set's dependency closure; PrimeNG's own homegrown overlay/focus-trap system (adapted into `ng-core`'s `UOverlay`/`UFocusTrap`) has no found defect motivating a CDK migration.

## ADR-021 — `ng-packagr` build tooling for Angular packages

Status: Accepted (Phase 2 spec). `tsup` (used elsewhere in the monorepo) does not understand Angular decorators/templates/partial-compilation metadata; `ng-packagr` (which PrimeNG itself uses) produces correct Angular Package Format output without reimplementing that tooling.

## ADR-022 — Angular CLI Vitest builder + TestBed for Angular package tests

Status: Accepted (Phase 2 spec). Keeps Vitest-everywhere consistency with Phase 0/1 while still exercising real Angular DI/compiler/template integration via `TestBed`, over Karma/Jasmine (PrimeNG's own stack).
```

- [ ] **Step 4: Create `docs/architecture/COMPONENT_INVENTORY.md`**

Generate the full ~117-area classification table using the 11-column schema from the spec's Component Inventory section (Component | Prime source path | Category | Dependencies | UIX dependencies | Angular-specific responsibilities | Style dependencies | Accessibility responsibilities | Migration classification | Migration phase | Risk). Populate the 11 areas implemented this phase (button, checkbox, dialog, menu, tooltip, ripple, autofocus, fluid, badge, basecomponent-tier, focustrap/overlay) with `Phase 2`/complete detail; populate the remaining ~106 areas by listing every top-level directory under `.vendor-extracted`'s or the tarball's `packages/primeng/src/` (re-run `tar -tzf .vendor-cache/primeng-21.1.9.tar.gz | grep -E "packages/primeng/src/[^/]+/$"` to get the authoritative full list) with the classification (`Later Phase` / `Not Needed` / `Needs Architecture Decision`) matching the spec's Component Inventory table's category groupings (form components, overlay components, navigation, data components, panel/layout, feedback, misc) and Not-Needed list (`usestyle`, PrimeNG's own `classnames`, `ts-helpers`).

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/PROVENANCE.md docs/architecture/PACKAGE_ARCHITECTURE.md docs/architecture/DECISIONS.md docs/architecture/COMPONENT_INVENTORY.md
git commit -m "docs(phase-2): update provenance, package architecture, ADRs, component inventory"
```

---

## Task 19: Performance baseline

**Files:**
- Modify: `scripts/provenance/measure-package-size.mjs` (extend `findUixPackages` prefix filter, matching Task 2's pattern)
- Modify: `docs/architecture/PERFORMANCE.md` (append Phase 2 section)

- [ ] **Step 1: Extend `measure-package-size.mjs`'s package discovery**

Change `findUixPackages`'s filter from `name.startsWith("uix") && name !== "uix"` to also match `name.startsWith("ng")`, matching Task 2's `MANIFEST_WATCHED_PREFIXES` pattern (consider extracting this into a small shared constant if a third script needs the same list — not required yet with only 2 scripts sharing it, per YAGNI).

- [ ] **Step 2: Run the measurement script**

Run: `node scripts/provenance/measure-package-size.mjs`
Expected: a markdown table row for `packages/ng-core` and `packages/ng`, alongside the existing 4 `uix-*` rows.

- [ ] **Step 3: Record component-creation-cost and Dialog/Tooltip timing**

Write a throwaway benchmark (not committed as a permanent script, per spec — a one-off Node/`ts-node` script or a temporary `.spec.ts` timing block using `performance.now()` around `TestBed.createComponent(UButton)` vs `TestBed.createComponent(UDialog)` across 100 iterations each) and record the resulting numbers directly into `docs/architecture/PERFORMANCE.md`'s prose — do not commit the throwaway script itself.

- [ ] **Step 4: Append results to `docs/architecture/PERFORMANCE.md`**

Add a "## Phase 2 — UltimateNG" section with the measured `dist/` sizes, gzip sizes, component-creation timings, and a note confirming the tree-shaking spot-check from Task 17 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/provenance/measure-package-size.mjs docs/architecture/PERFORMANCE.md
git commit -m "perf(phase-2): record UltimateNG package size and component-creation baselines"
```

---

## Task 20: CI verification and full clean-checkout build

**Files:**
- No file changes expected unless CI fails and reveals a real gap (in which case, fix inline and note the fix).

- [ ] **Step 1: Run the full local pipeline matching `.github/workflows/ci.yml`'s steps**

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run format:check
pnpm run typecheck
pnpm run build
pnpm run test
pnpm run test:scripts
pnpm run provenance:validate -- --base-ref main
pnpm run boundary:validate
pnpm run ceiling:validate
```

Expected: every command exits 0.

- [ ] **Step 2: If any command fails, diagnose and fix**

Common expected friction points to check first if something fails:
- `boundary:validate` should report `packages/ng*` is out of its scan scope (it only scans `packages/uix*`) — if it errors instead, something in Task 2's edit broke it; re-check the diff against the original script.
- `ceiling:validate` should pass cleanly since neither `ng-core` nor `ng`'s `package.json` declares any forbidden dependency — if it fails, check for an accidentally-added `primeng`/`@primeuix/*` devDependency left over from a copy-paste during extraction-script development.
- `provenance:validate` should now find both `docs/architecture/provenance/ng-core.json` and `docs/architecture/provenance/ng.json` via Task 2's extended `findWatchedPackageDirs` — if it reports a missing manifest entry, find the specific `.ts` file under `packages/{ng-core,ng}/src/` missing from its manifest and add the entry.

- [ ] **Step 3: Verify representative UIX integration — `UButton` actually renders using `@ultimate/uix-styled`'s token resolution, not hardcoded CSS**

Run a manual smoke check: in a scratch Angular test, call `TestBed.inject` on `@ultimate/uix-styled`'s theme/token service, set a custom token value, render `UButton`, and confirm the rendered element's computed style reflects the custom token — this is the concrete verification that `ng` consumes `uix-styled`'s real token-resolution pipeline rather than a duplicated/hardcoded stand-in, satisfying the spec's "styling infrastructure is consumed, not duplicated" exit criterion.

- [ ] **Step 4: Commit any fixes discovered in Step 2 individually, with commit messages describing the specific gap found and fixed (not a generic "fix CI" message)**

---

## Task 21: Documentation pass

**Files:**
- Modify: `packages/ng-core/README.md` (finalize if not already complete)
- Modify: `packages/ng/README.md` (create if not present, or finalize)
- Create: per-component doc sections (can live in `packages/ng/README.md` as subsections, matching Phase 1's single-README-per-package depth, per spec's Documentation section: "no public documentation site built in Phase 2")

- [ ] **Step 1: Write/finalize `packages/ng/README.md`**

Modeled on `packages/uix-utils/README.md`'s structure (Status, Provenance, Modules, Usage), with one subsection per component (Button, Checkbox, Dialog, Menu, Tooltip) covering: PrimeNG foundation (which reference component, what changed under Option B — link to `docs/architecture/provenance/ng.json`), Ultimate behavior, public API (inputs/outputs table), styling (which `uix-styles` subpath), accessibility (summarized from the spec's Accessibility table plus this plan's Task 15/16 findings), migration notes (naming changed to `u-*`, see spec's Public API Strategy).

- [ ] **Step 2: Verify every code example in both READMEs actually compiles/runs against the real built packages**

For each `import` statement shown in a README usage example, confirm the import path and exported symbol name match what Tasks 4-16 actually produced (a mismatched README is worse than no README) — run `pnpm --filter @ultimate/ng typecheck` against a scratch file containing each README example's code if any doubt exists.

- [ ] **Step 3: Commit**

```bash
git add packages/ng-core/README.md packages/ng/README.md
git commit -m "docs(phase-2): finalize ng-core and ng package documentation"
```

---

## Self-Review Notes

**Spec coverage check:** every spec section maps to a task — PrimeNG Baseline Findings/Angular Baseline (informs Global Constraints), Package Architecture (Tasks 4, 11), Public API Strategy (naming applied throughout Tasks 12-16), Component Migration Strategy (task ordering itself), Styling Strategy (Task 3 + each component's `*-style.ts`), Overlay Architecture (Task 6, Task 15), Forms Architecture (Task 5, Task 14), Dependency Rules (Global Constraints, Task 11's package.json), Provenance (Tasks 1, 2, 18), Licensing (Task 4/11 THIRD-PARTY-NOTICES, Task 18), Build Strategy (Task 4/11 ng-package.json), Testing Strategy (every task's spec file), Accessibility (Tasks 12-16's specific a11y assertions), Security (no `innerHTML`/dynamic component creation introduced — verified structurally by every component using inline templates and interpolation, not string concatenation), Performance (Task 19), Documentation (Task 21), Phase Exit Criteria (Task 20).

**Known deliberate scope exclusions carried over from the spec, not gaps in this plan:** `config`'s full surface, `passthrough`, remaining ~85+ icons, remaining `api` surface — all spec-classified "Needs Architecture Decision," correctly not tasked here. Data components, remaining ~106 component areas — spec-classified "Later Phase," correctly only inventoried (Task 18) not implemented.

**Type consistency verified:** `UMenuItem`/`UTooltipOptions` (Task 10) are the exact types Task 13 (`UTooltip`) and Task 15 (`UMenu`) consume — no divergent redefinition. `UBaseComponent`'s `cx()`/`componentName`/`styleModule` contract (Task 4) is the exact shape every component task (12-16) implements via `protected override`. `UOverlay`/`UFocusTrap` (Task 6) selectors (`[uOverlay]`, `[uFocusTrap]`) match exactly what Task 15's `UDialog` template uses.
