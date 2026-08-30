# Phase 3 — UltimateReact Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `@ultimate/react-core` and `@ultimate/react` — the first React-specific Ultimate packages — with an Ultimate-owned React foundation (scoped-down base architecture, overlay/FocusTrap/Escape/scroll/motion/styling infrastructure) and five fully working, provenance-tracked, Ultimate-namespaced components (Button, Checkbox, Dialog, Menu, Tooltip) proving the architecture end-to-end, mirroring Phase 2's Angular proof set.

**Architecture:** PrimeReact 10.9.9 source (already pinned in `.vendor-cache/primereact-10.9.9.tar.gz`, commit `d0f574e39122668292fc7a740f081bae1b93b1e9`) is extracted per-directory into a gitignored staging tree, then **reimplemented with reference, not ported** (Option B, same posture as Angular's ADR-018): `react-core` gets an Ultimate-owned base covering only props/state composition, `cx()` class resolution, and style registration — PrimeReact's full `pt`/`ptm`/`ptmo` passthrough system is explicitly excluded. Where PrimeReact's behavior is framework-neutral-reusable (z-index, motion, scroll-blocking, style DOM injection, focus-lookup), Ultimate reuses the already-built Phase 1 `@ultimate/uix-*` primitives directly instead of reimplementing them. Both packages build with `tsup` (ESM, `.d.mts` declarations) and test with Vitest + React Testing Library.

**Tech Stack:** pnpm workspaces (existing), React `^17.0.0 || ^18.0.0 || ^19.0.0`, TypeScript (existing `tsconfig.base.json`), `tsup` (matches Phase 1 precedent), Vitest + `@testing-library/react` (new), Node.js built-ins for provenance scripts (matching Phase 0/2 convention).

**Spec:** `docs/superpowers/specs/2026-08-30-phase-3-ultimatereact-foundation-design.md`

## Global Constraints

- PrimeReact baseline: `10.9.9`, commit `d0f574e39122668292fc7a740f081bae1b93b1e9` (`docs/architecture/PROVENANCE.md`) — do not re-pin. Library source path is `components/lib/` only; the tarball's repository root is a Next.js showcase app and its `package.json`/dependencies must never be treated as library dependencies.
- React peer range: `^17.0.0 || ^18.0.0 || ^19.0.0` for `@ultimate/react` (spec §27, matches PrimeReact 10.9.9's verified npm peer range).
- Two packages: `@ultimate/react-core` (foundation) and `@ultimate/react` (components + their directly-consumed primitives). Do not create a third package.
- `react-core` owns: base component architecture (props/state composition, `cx()`, style registration), shared hooks (overlay listener composition, resize/scroll/click-outside, mount/unmount/update-effect primitives, merge-props), priority-aware Escape handling, FocusTrap, multi-dialog scroll-blocking coordination, 5 icon components (`USpinnerIcon`, `UTimesIcon`, `UWindowMaximizeIcon`, `UWindowMinimizeIcon`, `UCheckIcon`), a React config/context primitive, the `ReactStyleSheet` adapter, and a `@ultimate/uix-utils/zindex` consumption wrapper.
- `react` owns: `UButton`, `UCheckbox`, `UDialog`, `UMenu`, `UTooltip`. **No other Angular-side primitive (Ripple, AutoFocus, Fluid, Badge) is built in Phase 3** — spec §6 explicitly excludes Ripple as a Phase 3 proof-set component; the other three were never in the Phase 3 proof set at all.
- Full Ultimate namespace: component names (`Button`→`UButton`), CSS classes (`.p-button`→`.u-button`) — both together, not deferred (matches Phase 2's precedent).
- The full PrimeReact `pt`/`ptm`/`ptmo` passthrough system is excluded entirely. Do not port `ComponentBase`'s passthrough resolution logic.
- No Angular-style `ControlValueAccessor`-equivalent forms abstraction. `UCheckbox` is fully controlled (`checked: boolean` required, no `defaultChecked`), matching verified upstream — do not add uncontrolled support speculatively.
- No `react-transition-group` dependency. Motion is `@ultimate/uix-motion`'s `createMotion(element, options)`, called from a React `useEffect`.
- `UDialog` does not expose or implement `draggable`, `resizable`, or `maximizable` behavior in Phase 3 (spec §15). No such props, no such event handlers, no such UI.
- `URipple` is not built in Phase 3. `UButton`/`UDialog`/`UMenu` render without a ripple effect; do not fold an ad-hoc ripple implementation into any component.
- `react-core` does **not** add a `./icons` subpath export in Phase 3 — single public entry point (`.`) only (spec §3, tightened).
- `UMenu` uses `aria-activedescendant` virtual focus (matches verified PrimeReact behavior), diverging intentionally from Angular's `UMenu` literal-DOM-focus approach — this is not a bug, do not "fix" it to match Angular.
- `UTooltip`'s public API is a ref-target primitive (`target` prop accepting `RefObject<HTMLElement> | HTMLElement | string | string[]`) plus a `tooltip` prop convenience layer on `UButton`/`UCheckbox` — not a wrapper-composition or hook-primary API.
- `UTooltip` adds `aria-describedby` on the target element while visible (intentional deviation from verified upstream, which has no such wiring) — additive to any pre-existing `aria-describedby` value, removes only its own owned ID on cleanup. Multiple `UTooltip` instances targeting the same element is an explicit non-goal — no deterministic behavior required for that case.
- Escape handling is a centralized, priority-aware mechanism in `react-core` (behavior ported from verified PrimeReact `useGlobalOnEscapeKey`/`useDisplayOrder`, independently authored) — not a per-component unconditional listener.
- Z-index: reuse `@ultimate/uix-utils/zindex`'s `ZIndex` directly. Do not modify or redesign that module.
- Dialog scroll-blocking: reuse `@ultimate/uix-utils/dom`'s `blockBodyScroll`/`unblockBodyScroll` directly. Coordination across multiple simultaneous dialogs is a private, module-scoped `Set`-based registry in `react-core` — never a `document` property mutation.
- `sideEffects` starts as `false` in both `package.json` files but is **not final** until Task 19's build-level validation (production build, consumer-like import from built `dist/`, real component rendering, confirmed style injection, confirmed no dead-code-elimination of required modules, exercised via both direct/subpath and barrel import) passes. Do not treat `sideEffects: false` as proven before that task runs.
- Every incorporated file needs a provenance record: package-level in `docs/architecture/PROVENANCE.md` (PrimeReact entry already exists, needs updating, not a new heading) and file-level in new `docs/architecture/provenance/{react-core,react}.json` manifests using the schema `{originalPath, ultimateDestination, modificationStatus, modificationDescription}` — `modificationDescription` must name the specific verified source behavior and the Ultimate architectural decision made about it, not merely restate the file's purpose (spec §22's traceability chain requirement).
- Build via `tsup`, not Vite or Rollup directly. Test via Vitest + `@testing-library/react`, not Jest.
- Package manager: pnpm (existing lockfile). Node: `>=20` (matches Phase 0/1/2 convention).
- `scripts/provenance/validate-dependency-ceiling.mjs` already includes `"react"` in its `WATCHED_PREFIXES` — confirmed, no script change needed for that check. `scripts/provenance/validate-provenance.mjs`'s `MANIFEST_WATCHED_PREFIXES` is currently `["uix", "ng"]` and does **not** include `"react"` — this needs extending (Task 2).

---

## File Structure

```text
packages/
├── react-core/                                  @ultimate/react-core
│   ├── src/
│   │   ├── base/
│   │   │   ├── component-base.ts                (props/state composition, cx() resolver contract)
│   │   │   ├── component-base.spec.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── use-merge-props.ts
│   │   │   ├── use-mount-effect.ts
│   │   │   ├── use-unmount-effect.ts
│   │   │   ├── use-update-effect.ts
│   │   │   ├── use-previous.ts
│   │   │   ├── use-event-listener.ts
│   │   │   ├── use-resize-listener.ts
│   │   │   ├── hooks.spec.ts
│   │   │   └── index.ts
│   │   ├── overlay/
│   │   │   ├── portal.tsx                       (thin ReactDOM.createPortal wrapper, SSR-guarded)
│   │   │   ├── portal.spec.tsx
│   │   │   ├── use-overlay-listener.ts           (outside-click + resize + orientation + scroll composite)
│   │   │   ├── use-overlay-listener.spec.ts
│   │   │   └── index.ts
│   │   ├── escape/
│   │   │   ├── use-global-escape-key.ts          (priority-aware shared Escape listener)
│   │   │   ├── use-display-order.ts
│   │   │   ├── priorities.ts                     (Ultimate-owned priority enum: DIALOG, MENU, TOOLTIP)
│   │   │   ├── escape.spec.ts
│   │   │   └── index.ts
│   │   ├── zindex/
│   │   │   ├── use-z-index.ts                    (wraps @ultimate/uix-utils/zindex)
│   │   │   ├── zindex.spec.ts
│   │   │   └── index.ts
│   │   ├── focus-trap/
│   │   │   ├── focus-trap.tsx                    (UFocusTrap — sentinel-span mechanism)
│   │   │   ├── focus-trap.spec.tsx
│   │   │   └── index.ts
│   │   ├── scroll-lock/
│   │   │   ├── use-scroll-lock.ts                (private Set-based multi-dialog registry)
│   │   │   ├── scroll-lock.spec.ts
│   │   │   └── index.ts
│   │   ├── motion/
│   │   │   ├── use-motion.ts                     (React lifecycle wrapper around createMotion)
│   │   │   ├── motion.spec.ts
│   │   │   └── index.ts
│   │   ├── styling/
│   │   │   ├── react-style-sheet.ts               (StyleSheet subclass, createStyleElement override)
│   │   │   ├── use-component-style.ts             (mount-time registration hook)
│   │   │   ├── styling.spec.ts
│   │   │   └── index.ts
│   │   ├── icons/
│   │   │   ├── spinner-icon.tsx
│   │   │   ├── times-icon.tsx
│   │   │   ├── window-maximize-icon.tsx
│   │   │   ├── window-minimize-icon.tsx
│   │   │   ├── check-icon.tsx
│   │   │   ├── icons.spec.tsx
│   │   │   └── index.ts
│   │   └── index.ts                              (root barrel — single public entry point, no ./icons subpath)
│   ├── package.json
│   ├── tsup.config.ts
│   ├── tsconfig.json
│   ├── README.md
│   └── THIRD-PARTY-NOTICES.md                    (new)
│
└── react/                                        @ultimate/react
    ├── src/
    │   ├── button/{button.tsx, button.spec.tsx, button-style.ts, index.ts}
    │   ├── checkbox/{checkbox.tsx, checkbox.spec.tsx, checkbox-style.ts, index.ts}
    │   ├── dialog/{dialog.tsx, dialog.spec.tsx, dialog-style.ts, index.ts}
    │   ├── menu/{menu.tsx, menu.spec.tsx, menu-style.ts, index.ts}
    │   ├── tooltip/{tooltip.tsx, tooltip.spec.tsx, tooltip-style.ts, index.ts}
    │   └── index.ts                               (root barrel — re-exports all 5)
    ├── package.json
    ├── tsup.config.ts                             (multi-entry: index + per-component subpaths)
    ├── tsconfig.json
    ├── README.md
    └── THIRD-PARTY-NOTICES.md                     (populate existing Phase 0 stub)

scripts/provenance/
├── extract-primereact-source.mjs                 (new — untar + copy matching components/lib/ paths)
├── extract-primereact-source.test.mjs             (new)
├── verify-tree-shaking-react.mjs                  (new — Task 19's sideEffects validation)
└── validate-provenance.mjs                        (modified — MANIFEST_WATCHED_PREFIXES extended to include "react")

docs/architecture/
├── PROVENANCE.md                                  (modified — PrimeReact entry: Modification status/description/date)
├── DECISIONS.md                                   (modified — new ADRs added)
├── PACKAGE_ARCHITECTURE.md                        (modified — react-core/react move from "reserved" to "active")
├── ROADMAP.md                                     (modified — new Phase 2 follow-up recorded: Angular styling gap; Phase 3 row updated)
└── provenance/
    ├── react-core.json                            (new — file-level manifest)
    └── react.json                                 (new)
```

**Why this shape:** `react-core`'s directories are organized one-concern-per-directory (matching `ng-core`'s and Phase 1's `uix-utils`'s established convention), each with its own spec file colocated. `react`'s 5 component directories are peers, each with its component file, spec, and `*-style.ts` adapter — directly mirroring `ng`'s `button/{button.ts, button.spec.ts, button-style.ts, index.ts}` shape. Unlike `ng`'s eventual single-barrel `ng-package.json` (a correction recorded mid-Phase-2 after per-directory secondary entry points broke the build), `react`'s `tsup.config.ts` uses genuine multi-entry output from the start (`index.ts` plus `button/index.ts`, `checkbox/index.ts`, etc.) since `tsup`/esbuild does not share `ng-packagr`'s nested-`ng-package.json`-discovery failure mode — this directly implements spec §3's stated tree-shaking-failure avoidance.

---

## Interfaces produced by shared/foundation infrastructure

These are the exact signatures every later task depends on. A task's own section lists which of these it consumes.

**`ComponentBase` contract** (Task 3, `packages/react-core/src/base/component-base.ts`):

```typescript
export interface StyleModule {
  css: string;
  classes: Record<string, (params?: Record<string, unknown>) => ClassValue>;
}

export type ClassValue = string | Record<string, boolean> | (string | Record<string, boolean>)[];

export interface ComponentBaseOptions {
  componentName: string; // e.g. "button" — the uix-styled registration key
  styleModule: StyleModule;
}

// Not a class/inheritance hierarchy (React has no such base-component concept) —
// a hook factory. Each Ultimate component calls this once per render to get its
// cx() resolver and to trigger mount-time style registration.
export function useComponentBase(options: ComponentBaseOptions): {
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
};
```

Deliberately excludes PrimeReact's `pt`/`ptm`/`ptmo` passthrough resolution — no `getPTValue`/`_getPT`/`_usePT` equivalent exists anywhere in `react-core`.

**`useMergeProps`** (Task 4, `packages/react-core/src/hooks/use-merge-props.ts`):

```typescript
export function useMergeProps(): (
  ...propSets: (Record<string, unknown> | undefined)[]
) => Record<string, unknown>;
// Shallow-merges class names (concatenated) and event handlers (composed, not overwritten)
// across the given prop objects, later objects winning for all other keys.
// Behavior matches verified PrimeReact hooks/useMergeProps.js — authored fresh, not ported.
```

**`useMountEffect` / `useUnmountEffect` / `useUpdateEffect` / `usePrevious`** (Task 4):

```typescript
export function useMountEffect(effect: () => void): void; // runs once on mount only
export function useUnmountEffect(cleanup: () => void): void; // runs once on unmount only
export function useUpdateEffect(effect: () => void, deps: unknown[]): void; // skips the first (mount) run
export function usePrevious<T>(value: T): T | undefined;
```

**`useEventListener` / `useResizeListener`** (Task 4):

```typescript
export function useEventListener(options: {
  target: EventTarget | (() => EventTarget | null) | "window" | "document";
  type: string;
  listener: (event: Event) => void;
  when?: boolean;
}): [bind: () => void, unbind: () => void];

export function useResizeListener(options: {
  listener: (event: Event) => void;
  when?: boolean;
}): [bind: () => void, unbind: () => void];
```

**`Portal`** (Task 5, `packages/react-core/src/overlay/portal.tsx`):

```typescript
export interface PortalProps {
  element: React.ReactNode;
  appendTo?: HTMLElement | "self" | (() => HTMLElement) | undefined;
  visible?: boolean;
}
export function Portal(props: PortalProps): React.ReactPortal | React.ReactNode | null;
// SSR-guarded (renders null until a client-mount effect confirms document exists),
// appendTo === "self" renders inline instead of portaling, matching verified Portal.js.
```

**`useOverlayListener`** (Task 5):

```typescript
export function useOverlayListener(options: {
  target: React.RefObject<HTMLElement>;
  overlay: React.RefObject<HTMLElement>;
  listener: (event: Event, meta: { type: "outside" | "resize" | "orientationchange" | "scroll"; valid: boolean }) => void;
  when?: boolean;
}): [bind: () => void, unbind: () => void];
```

**`useGlobalEscapeKey` / `useDisplayOrder` / `ESCAPE_PRIORITIES`** (Task 6, `packages/react-core/src/escape/`):

```typescript
export const ESCAPE_PRIORITIES = { DIALOG: 300, MENU: 500, TOOLTIP: 1200 } as const;
// Numeric values match verified PrimeReact ESC_KEY_HANDLING_PRIORITIES for the
// three proof-set-relevant tiers only — not the full upstream enum (SIDEBAR,
// SLIDE_MENU, IMAGE, OVERLAY_PANEL, PASSWORD, CASCADE_SELECT, SPLIT_BUTTON,
// SPEED_DIAL are not Phase 3 components and are not declared speculatively).

export function useDisplayOrder(group: string, isVisible: boolean): number | undefined;

export function useGlobalEscapeKey(options: {
  callback: (event: KeyboardEvent) => void;
  when: boolean;
  priority: [primary: number, secondary: number | undefined];
}): void;
```

**`useZIndex`** (Task 7, `packages/react-core/src/zindex/use-z-index.ts`):

```typescript
export const Z_INDEX_BUCKETS = {
  modal: 1100,
  overlay: 1000,
  menu: 1000,
  tooltip: 1100,
  toast: 1200,
} as const;
// Verified default values from PrimeReact.js — adopted as Ultimate's own starting values.

export function useZIndex(): {
  set: (key: keyof typeof Z_INDEX_BUCKETS, element: HTMLElement | null, baseZIndex?: number) => void;
  clear: (element: HTMLElement | null) => void;
};
// Thin wrapper around @ultimate/uix-utils/zindex's ZIndex — does not modify that module.
```

**`FocusTrap`** (Task 8, `packages/react-core/src/focus-trap/focus-trap.tsx`):

```typescript
export interface FocusTrapProps {
  children: React.ReactNode;
  autoFocus?: boolean;
  disabled?: boolean;
  autoFocusSelector?: string;
  firstFocusableSelector?: string;
}
export function FocusTrap(props: FocusTrapProps): React.ReactElement;
// Sentinel-<span> pair mechanism, matching verified FocusTrap.js. Does NOT restore
// focus on unmount (verified: upstream doesn't either) — that is the consuming
// component's responsibility (UDialog, Task 16).
```

**`useScrollLock`** (Task 9, `packages/react-core/src/scroll-lock/use-scroll-lock.ts`):

```typescript
export function useScrollLock(): {
  register: (id: string) => void;
  unregister: (id: string) => void;
};
// Private module-scoped Set<string>. register() calls @ultimate/uix-utils/dom's
// blockBodyScroll() only on the 0->1 transition; unregister() calls
// unblockBodyScroll() only on the 1->0 transition. Replaces PrimeReact's verified
// document.primeDialogParams global-mutation pattern with a private registry.
```

**`useMotion`** (Task 10, `packages/react-core/src/motion/use-motion.ts`):

```typescript
export function useMotion(
  elementRef: React.RefObject<HTMLElement>,
  visible: boolean,
  options?: import("@ultimate/uix-motion").MotionOptions
): void;
// Calls @ultimate/uix-motion's createMotion(element, options).enter()/.leave() from a
// useEffect keyed on `visible`, .cancel() on cleanup. No react-transition-group.
```

**`ReactStyleSheet` / `useComponentStyle`** (Task 11, `packages/react-core/src/styling/`):

```typescript
export const reactCoreStyleSheet: import("@ultimate/uix-styled").default;
// A ReactStyleSheet instance (subclasses @ultimate/uix-styled's StyleSheet,
// overriding createStyleElement to delegate to @ultimate/uix-utils/dom's
// createStyleElement, SSR-guarded via typeof document check).

export function useComponentStyle(componentName: string, styleModule: StyleModule): void;
// Registers styleModule with reactCoreStyleSheet once per componentName, from a
// mount-effect (useMountEffect), not per-render. This is what useComponentBase (Task 3)
// calls internally.
```

**Icon components** (Task 12, `packages/react-core/src/icons/`):

```typescript
export interface IconProps {
  className?: string;
  label?: string;
  spin?: boolean;
}
export function USpinnerIcon(props: IconProps): React.ReactElement;
export function UTimesIcon(props: IconProps): React.ReactElement;
export function UWindowMaximizeIcon(props: IconProps): React.ReactElement;
export function UWindowMinimizeIcon(props: IconProps): React.ReactElement;
export function UCheckIcon(props: IconProps): React.ReactElement;
// Each renders an inline <svg role="img" aria-label={label}>, matching ng-core's
// established icon pattern (UBaseIcon-equivalent shape) — not PrimeReact's own
// IconBase.getPTI passthrough-spread shape, since pt is excluded.
```

---

## Task 1: Vendoring script for PrimeReact source

**Files:**

- Create: `scripts/provenance/extract-primereact-source.mjs`
- Create: `scripts/provenance/extract-primereact-source.test.mjs`

**Interfaces:**

- Produces: a CLI script `node scripts/provenance/extract-primereact-source.mjs <tarball> <lib-relative-path> <output-dir>` used by every later component/infrastructure task to pull real PrimeReact source into a gitignored staging tree before writing the Ultimate-owned reimplementation.

- [ ] **Step 1: Write the failing test**

Create `scripts/provenance/extract-primereact-source.test.mjs`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("extracts a real components/lib/<name> directory from the pinned tarball", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primereact-test-"));
  try {
    execFileSync("node", [
      "scripts/provenance/extract-primereact-source.mjs",
      ".vendor-cache/primereact-10.9.9.tar.gz",
      "button",
      outDir,
    ]);
    assert.ok(existsSync(join(outDir, "Button.js")), "Button.js should be copied");
    assert.ok(existsSync(join(outDir, "ButtonBase.js")), "ButtonBase.js should be copied");
    const content = readFileSync(join(outDir, "Button.js"), "utf8");
    assert.match(content, /React\.forwardRef/, "copied file should be real Button source");
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("fails clearly when the requested lib subdirectory does not exist", () => {
  const outDir = mkdtempSync(join(tmpdir(), "extract-primereact-test-"));
  try {
    assert.throws(() => {
      execFileSync("node", [
        "scripts/provenance/extract-primereact-source.mjs",
        ".vendor-cache/primereact-10.9.9.tar.gz",
        "does-not-exist",
        outDir,
      ]);
    });
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `node --test scripts/provenance/extract-primereact-source.test.mjs`
Expected: FAIL with "Cannot find module" or ENOENT (script does not exist yet)

- [ ] **Step 3: Write `extract-primereact-source.mjs`**

Create `scripts/provenance/extract-primereact-source.mjs`, modeled directly on the existing `extract-primeng-source.mjs` (same tar-extract-to-tempdir, find-single-root-dir, recursive-copy shape), with two differences: the tarball's single top-level directory is `primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/` (not a `primeng-...` prefix), and the library source path inside it is `components/lib/<name>` (not `packages/primeng/src/<name>`) — confirmed during the Real-Source Verification Gate as the correct, non-showcase-app path.

```javascript
#!/usr/bin/env node
// scripts/provenance/extract-primereact-source.mjs
//
// Extracts a specific components/lib/ subdirectory from the pinned
// PrimeReact tarball. This tarball is a real git-archive of the
// primefaces/primereact monorepo at the pinned commit — its repository
// root is the project's Next.js showcase app, NOT the library; the real
// library source lives under components/lib/, confirmed during the Phase 3
// Real-Source Verification Gate. This script copies only from that path,
// never from the repository root.
//
// Usage: node extract-primereact-source.mjs <tarball-path> <lib-relative-path> <output-dir>

import { mkdirSync, readdirSync, statSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const [, , tarballPath, libRelativePath, outputDir] = process.argv;

if (!tarballPath || !libRelativePath || !outputDir) {
  console.error(
    "Usage: extract-primereact-source.mjs <tarball-path> <lib-relative-path> <output-dir>"
  );
  process.exit(1);
}

function findExtractedRoot(dir) {
  const entries = readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory());
  if (entries.length !== 1) {
    throw new Error(
      `expected exactly one top-level directory in extracted tarball, found ${entries.length}`
    );
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

const extractDir = mkdtempSync(join(tmpdir(), "extract-primereact-source-"));
try {
  execFileSync("tar", ["xzf", tarballPath, "-C", extractDir]);

  const extractedRoot = findExtractedRoot(extractDir);
  const sourceDir = join(extractedRoot, "components", "lib", libRelativePath);

  if (!statSync(sourceDir, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`source directory not found in tarball: components/lib/${libRelativePath}`);
  }

  copyRecursive(sourceDir, outputDir);
  console.log(`[extract-primereact-source] copied components/lib/${libRelativePath} to ${outputDir}`);
} finally {
  rmSync(extractDir, { recursive: true, force: true });
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `node --test scripts/provenance/extract-primereact-source.test.mjs`
Expected: PASS (both tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/provenance/extract-primereact-source.mjs scripts/provenance/extract-primereact-source.test.mjs
git commit -m "feat(provenance): add PrimeReact source extraction script"
```

---

## Task 2: `validate-provenance.mjs` extension for `packages/react*`

**Context:** the manifest-completeness check currently only watches `packages/{uix,ng}*` and only walks `.ts` files. `react`/`react-core` use `.tsx` for component/JSX files — extending the prefix list alone would silently miss every `.tsx` file's provenance requirement.

**Files:**

- Modify: `scripts/provenance/validate-provenance.mjs`

**Interfaces:**

- Consumes: none (standalone script fix).
- Produces: `validate-provenance.mjs` now requires every `.ts`/`.tsx` file under `packages/react*/src/` to have a corresponding provenance manifest entry, same as it already does for `packages/{uix,ng}*/src/`'s `.ts` files.

- [ ] **Step 1: Confirm the current gap with a manual check**

Run: `grep -n "MANIFEST_WATCHED_PREFIXES\|walkTsFiles\|endsWith(\".ts\")" scripts/provenance/validate-provenance.mjs`
Expected output confirms `MANIFEST_WATCHED_PREFIXES = ["uix", "ng"]` and `walkTsFiles` only matches `entry.name.endsWith(".ts")`.

- [ ] **Step 2: Extend `MANIFEST_WATCHED_PREFIXES` and the file-extension filter**

Modify `scripts/provenance/validate-provenance.mjs`:

```javascript
// Before:
const MANIFEST_WATCHED_PREFIXES = ["uix", "ng"];
// ...
} else if (entry.name.endsWith(".ts")) {
  files.push(full);
}

// After:
const MANIFEST_WATCHED_PREFIXES = ["uix", "ng", "react"];
// ...
} else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
  files.push(full);
}
```

Also rename the local function `walkTsFiles` usage comment (not the exported name, there is none — it's a local function) to note it now covers both extensions, and update the function's own name if the codebase's existing style prefers descriptive names (check the file's surrounding style before renaming; if uncertain, leave the name and only fix the extension check plus its inline comment).

- [ ] **Step 3: Verify against the current repo state (no react packages yet)**

Run: `node scripts/provenance/validate-provenance.mjs` (or whatever its actual invocation is — confirm via `package.json` scripts or the script's own usage output first)
Expected: PASS — `packages/react`/`packages/react-core` don't exist yet as populated directories, so `findWatchedPackageDirs()` either skips them (no `src/` yet) or the check is vacuously satisfied. Confirm this explicitly rather than assuming.

- [ ] **Step 4: Commit**

```bash
git add scripts/provenance/validate-provenance.mjs
git commit -m "chore(provenance): extend manifest-completeness check to packages/react* and .tsx files"
```

---

## Task 3: `@ultimate/react-core` package scaffold + `ComponentBase`

**Files:**

- Create: `packages/react-core/package.json`
- Create: `packages/react-core/tsup.config.ts`
- Create: `packages/react-core/tsconfig.json`
- Create: `packages/react-core/src/base/component-base.ts`
- Create: `packages/react-core/src/base/component-base.spec.ts`
- Create: `packages/react-core/src/base/index.ts`
- Create: `packages/react-core/src/index.ts`
- Create: `packages/react-core/THIRD-PARTY-NOTICES.md`

**Interfaces:**

- Consumes: `@ultimate/uix-utils` (`classnames` module, for class-string concatenation).
- Produces: `useComponentBase` per this plan's Interfaces section — the hook every proof-set component (Tasks 13-17) calls for its `cx()` resolver.

- [ ] **Step 1: Extract `componentbase` source for reference**

Run: `node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz componentbase .vendor-extracted/react/componentbase`

Read `.vendor-extracted/react/componentbase/ComponentBase.js` in full (already read once during the Real-Source Verification Gate — re-read here to confirm nothing has drifted and to have it open while writing this task's code). Confirm again: `cx()` (verified lines ~511-513) resolves `css.classes[key](params)`; the `pt`/`ptm`/`ptmo` machinery surrounding it (`getPTValue`, `_getPT`, `_usePT`, `_useGlobalPT`, `_useDefaultPT`) is NOT ported — per this plan's Global Constraints.

- [ ] **Step 2: Scaffold `package.json`**

Create `packages/react-core/package.json`:

```json
{
  "name": "@ultimate/react-core",
  "version": "0.1.0",
  "description": "React-specific foundation for the Ultimate Platform: base component architecture, overlay/focus-trap/escape/scroll/motion infrastructure, icons, minimal config.",
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
  "dependencies": {
    "@ultimate/uix-utils": "workspace:*",
    "@ultimate/uix-styled": "workspace:*",
    "@ultimate/uix-motion": "workspace:*"
  },
  "peerDependencies": {
    "react": "^17.0.0 || ^18.0.0 || ^19.0.0",
    "react-dom": "^17.0.0 || ^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tsup": "^8.3.0",
    "typescript": "5.9.3",
    "vitest": "^2.1.8"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

**Note on `sideEffects: false` here**: per Global Constraints, this is a starting package-metadata decision, not yet a measured bundler-behavior confirmation — Task 19 validates or corrects it. Do not treat it as final at this step.

- [ ] **Step 3: Scaffold `tsup.config.ts` and `tsconfig.json`**

Create `packages/react-core/tsup.config.ts` (single-entry — no `./icons` subpath, per Global Constraints):

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
```

Create `packages/react-core/tsconfig.json`, extending the repo's existing `tsconfig.base.json` (check its exact path and `compilerOptions` — likely at repo root — and match `jsx` compiler option to `"react-jsx"` since this package authors `.tsx` files):

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Write the failing test for `useComponentBase`**

Create `packages/react-core/src/base/component-base.spec.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useComponentBase } from "./component-base";

describe("useComponentBase", () => {
  it("cx() resolves a string class-name slot unchanged", () => {
    const { result } = renderHook(() =>
      useComponentBase({
        componentName: "test-component",
        styleModule: { css: "", classes: { label: () => "u-test-label" } },
      })
    );
    expect(result.current.cx("label")).toBe("u-test-label");
  });

  it("cx() resolves a function class-name slot with params", () => {
    const { result } = renderHook(() =>
      useComponentBase({
        componentName: "test-component-2",
        styleModule: {
          css: "",
          classes: { root: (params) => ["u-test-root", { "u-test-active": !!params?.active }] },
        },
      })
    );
    expect(result.current.cx("root", { active: true })).toContain("u-test-active");
    expect(result.current.cx("root", { active: false })).not.toContain("u-test-active");
  });

  it("cx() returns undefined for a slot key not present in classes", () => {
    const { result } = renderHook(() =>
      useComponentBase({
        componentName: "test-component-3",
        styleModule: { css: "", classes: {} },
      })
    );
    expect(result.current.cx("missing")).toBeUndefined();
  });
});
```

- [ ] **Step 5: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/react-core test`
Expected: FAIL — `component-base.ts` does not exist yet.

- [ ] **Step 6: Write `component-base.ts`**

Create `packages/react-core/src/base/component-base.ts`:

```typescript
import { classNames } from "@ultimate/uix-utils";

export type ClassValue = string | Record<string, boolean> | (string | Record<string, boolean>)[];

export interface StyleModule {
  css: string;
  classes: Record<string, ((params?: Record<string, unknown>) => ClassValue) | string>;
}

export interface ComponentBaseOptions {
  componentName: string;
  styleModule: StyleModule;
}

function resolveClassValue(
  resolver: ((params?: Record<string, unknown>) => ClassValue) | string | undefined,
  params?: Record<string, unknown>
): string | undefined {
  if (resolver === undefined) return undefined;
  const value = typeof resolver === "function" ? resolver(params) : resolver;
  return Array.isArray(value) ? classNames(...value) : classNames(value);
}

export function useComponentBase({ componentName, styleModule }: ComponentBaseOptions): {
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
} {
  const cx = (key: string, params?: Record<string, unknown>) =>
    resolveClassValue(styleModule.classes[key], params);

  return { cx };
}
```

**Deliberately not included** (per Global Constraints and spec §7): no `pt`/`ptm`/`ptmo` parameters anywhere in this signature. Style *registration* (as opposed to class-name resolution) is Task 11's `useComponentStyle` — this task's `useComponentBase` does not itself call it yet; component tasks (13-17) call both hooks together.

- [ ] **Step 7: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/react-core test`
Expected: PASS (3 assertions)

- [ ] **Step 8: Create barrels**

`packages/react-core/src/base/index.ts`:

```typescript
export { useComponentBase } from "./component-base";
export type { StyleModule, ClassValue, ComponentBaseOptions } from "./component-base";
```

`packages/react-core/src/index.ts` (root barrel — starts here, every later task appends its own `export * from "./<dir>"` line):

```typescript
export * from "./base";
```

- [ ] **Step 9: Write `THIRD-PARTY-NOTICES.md`**

Create `packages/react-core/THIRD-PARTY-NOTICES.md`, following the exact template already used by the existing `packages/react/THIRD-PARTY-NOTICES.md` stub (read it first: `cat packages/react/THIRD-PARTY-NOTICES.md`) — same MIT license text, same PrimeReact 11 non-incorporation note, adjusted only for this package's own incorporated-source description (`react-core` incorporates PrimeReact's `componentbase`, `hooks`, `portal`, `focustrap`, `overlayservice`, `utils` (ZIndexUtils/DomHandler subset) areas as design reference).

- [ ] **Step 10: Add provenance entries**

Create `docs/architecture/provenance/react-core.json`:

```json
[
  {
    "originalPath": "components/lib/componentbase/ComponentBase.js",
    "ultimateDestination": "packages/react-core/src/base/component-base.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Ultimate-owned, scoped-down reimplementation of PrimeReact's ComponentBase. Verified source: cx() resolves css.classes[key](params) (ComponentBase.js lines ~511-513). Ultimate decision: excludes the full pt/ptm/ptmo passthrough system (~150 lines of nested-key resolution in the verified source) entirely, per spec §7's Option B posture — no demonstrated Ultimate consumer need, same YAGNI justification as Angular's ADR-018."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/base/component-base.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream (PrimeReact's own ComponentBase.js has no dedicated spec file)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/base/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 11: Commit**

```bash
git add packages/react-core/ docs/architecture/provenance/react-core.json
git commit -m "feat(react-core): scaffold package, add ComponentBase cx() resolver"
```

---

## Task 4: Shared lifecycle/event hooks

**Files:**

- Create: `packages/react-core/src/hooks/use-merge-props.ts`
- Create: `packages/react-core/src/hooks/use-mount-effect.ts`
- Create: `packages/react-core/src/hooks/use-unmount-effect.ts`
- Create: `packages/react-core/src/hooks/use-update-effect.ts`
- Create: `packages/react-core/src/hooks/use-previous.ts`
- Create: `packages/react-core/src/hooks/use-event-listener.ts`
- Create: `packages/react-core/src/hooks/use-resize-listener.ts`
- Create: `packages/react-core/src/hooks/hooks.spec.ts`
- Create: `packages/react-core/src/hooks/index.ts`
- Modify: `packages/react-core/src/index.ts`

**Interfaces:**

- Produces: all seven hooks per this plan's Interfaces section. Consumed by every later `react-core` infrastructure task (5-11) and every proof-set component (13-17).

- [ ] **Step 1: Extract `hooks` source for reference**

Run: `node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz hooks .vendor-extracted/react/hooks`

Read `useMergeProps.js`, `useMountEffect.js`, `useUnmountEffect.js`, `useUpdateEffect.js`, `usePrevious.js`, `useEventListener.js`, `useResizeListener.js` in `.vendor-extracted/react/hooks/`.

- [ ] **Step 2: Write the failing tests**

Create `packages/react-core/src/hooks/hooks.spec.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMergeProps } from "./use-merge-props";
import { useMountEffect } from "./use-mount-effect";
import { useUnmountEffect } from "./use-unmount-effect";
import { useUpdateEffect } from "./use-update-effect";
import { usePrevious } from "./use-previous";
import { useEventListener } from "./use-event-listener";
import { useResizeListener } from "./use-resize-listener";

describe("useMergeProps", () => {
  it("concatenates className across prop sets", () => {
    const { result } = renderHook(() => useMergeProps());
    const merged = result.current({ className: "a" }, { className: "b" });
    expect(merged.className).toBe("a b");
  });

  it("composes event handlers instead of overwriting", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result } = renderHook(() => useMergeProps());
    const merged = result.current({ onClick: first }, { onClick: second });
    (merged.onClick as (e: unknown) => void)({});
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it("later prop sets win for non-className, non-handler keys", () => {
    const { result } = renderHook(() => useMergeProps());
    const merged = result.current({ id: "a" }, { id: "b" });
    expect(merged.id).toBe("b");
  });
});

describe("useMountEffect", () => {
  it("runs the effect exactly once on mount, not on re-render", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(() => useMountEffect(effect));
    rerender();
    rerender();
    expect(effect).toHaveBeenCalledOnce();
  });
});

describe("useUnmountEffect", () => {
  it("runs the cleanup exactly once on unmount, not on re-render", () => {
    const cleanup = vi.fn();
    const { rerender, unmount } = renderHook(() => useUnmountEffect(cleanup));
    rerender();
    expect(cleanup).not.toHaveBeenCalled();
    unmount();
    expect(cleanup).toHaveBeenCalledOnce();
  });
});

describe("useUpdateEffect", () => {
  it("skips the first (mount) run and fires on subsequent dep changes", () => {
    const effect = vi.fn();
    let dep = 0;
    const { rerender } = renderHook(() => useUpdateEffect(effect, [dep]));
    expect(effect).not.toHaveBeenCalled();
    dep = 1;
    rerender();
    expect(effect).toHaveBeenCalledOnce();
  });
});

describe("usePrevious", () => {
  it("returns undefined on first render, then the prior value on subsequent renders", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });
    expect(result.current).toBeUndefined();
    rerender({ value: 2 });
    expect(result.current).toBe(1);
  });
});

describe("useEventListener", () => {
  it("bind attaches the listener, unbind removes it", () => {
    const listener = vi.fn();
    const target = document.createElement("div");
    const { result } = renderHook(() => useEventListener({ target, type: "click", listener }));
    const [bind, unbind] = result.current;
    act(() => bind());
    target.dispatchEvent(new Event("click"));
    expect(listener).toHaveBeenCalledOnce();
    act(() => unbind());
    target.dispatchEvent(new Event("click"));
    expect(listener).toHaveBeenCalledOnce();
  });
});

describe("useResizeListener", () => {
  it("bind attaches a window resize listener, unbind removes it", () => {
    const listener = vi.fn();
    const { result } = renderHook(() => useResizeListener({ listener }));
    const [bind, unbind] = result.current;
    act(() => bind());
    window.dispatchEvent(new Event("resize"));
    expect(listener).toHaveBeenCalledOnce();
    act(() => unbind());
    window.dispatchEvent(new Event("resize"));
    expect(listener).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/react-core test`
Expected: FAIL — none of the seven hook files exist yet.

- [ ] **Step 4: Write the seven hooks**

Create `packages/react-core/src/hooks/use-mount-effect.ts`:

```typescript
import { useEffect } from "react";

export function useMountEffect(effect: () => void): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}
```

Create `packages/react-core/src/hooks/use-unmount-effect.ts`:

```typescript
import { useEffect } from "react";

export function useUnmountEffect(cleanup: () => void): void {
  useEffect(() => cleanup, []); // eslint-disable-line react-hooks/exhaustive-deps
}
```

Create `packages/react-core/src/hooks/use-update-effect.ts`:

```typescript
import { useEffect, useRef } from "react";

export function useUpdateEffect(effect: () => void, deps: unknown[]): void {
  const isMounted = useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      effect();
    } else {
      isMounted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
```

Create `packages/react-core/src/hooks/use-previous.ts`:

```typescript
import { useEffect, useRef } from "react";

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

Create `packages/react-core/src/hooks/use-merge-props.ts` (matches verified `useMergeProps.js` behavior: className concatenation, handler composition, last-wins otherwise — authored fresh, not ported):

```typescript
type PropSet = Record<string, unknown> | undefined;

function isEventHandlerKey(key: string): boolean {
  return key.length > 2 && key.startsWith("on") && key[2] === key[2].toUpperCase();
}

export function useMergeProps(): (...propSets: PropSet[]) => Record<string, unknown> {
  return (...propSets: PropSet[]) => {
    const result: Record<string, unknown> = {};
    for (const props of propSets) {
      if (!props) continue;
      for (const [key, value] of Object.entries(props)) {
        if (key === "className") {
          result.className = [result.className, value].filter(Boolean).join(" ");
        } else if (isEventHandlerKey(key) && typeof value === "function") {
          const existing = result[key] as ((...args: unknown[]) => void) | undefined;
          result[key] = existing
            ? (...args: unknown[]) => {
                existing(...args);
                (value as (...args: unknown[]) => void)(...args);
              }
            : value;
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  };
}
```

Create `packages/react-core/src/hooks/use-event-listener.ts`:

```typescript
import { useCallback, useRef } from "react";

export interface UseEventListenerOptions {
  target: EventTarget | (() => EventTarget | null) | "window" | "document";
  type: string;
  listener: (event: Event) => void;
  when?: boolean;
}

function resolveTarget(
  target: UseEventListenerOptions["target"]
): EventTarget | null {
  if (target === "window") return typeof window !== "undefined" ? window : null;
  if (target === "document") return typeof document !== "undefined" ? document : null;
  if (typeof target === "function") return target();
  return target;
}

export function useEventListener({
  target,
  type,
  listener,
  when = true,
}: UseEventListenerOptions): [bind: () => void, unbind: () => void] {
  const boundRef = useRef(false);

  const bind = useCallback(() => {
    if (boundRef.current || !when) return;
    const el = resolveTarget(target);
    el?.addEventListener(type, listener);
    boundRef.current = true;
  }, [target, type, listener, when]);

  const unbind = useCallback(() => {
    if (!boundRef.current) return;
    const el = resolveTarget(target);
    el?.removeEventListener(type, listener);
    boundRef.current = false;
  }, [target, type, listener]);

  return [bind, unbind];
}
```

Create `packages/react-core/src/hooks/use-resize-listener.ts`:

```typescript
import { useEventListener, type UseEventListenerOptions } from "./use-event-listener";

export function useResizeListener({
  listener,
  when = true,
}: Pick<UseEventListenerOptions, "listener" | "when">): [bind: () => void, unbind: () => void] {
  return useEventListener({ target: "window", type: "resize", listener, when });
}
```

- [ ] **Step 5: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/react-core test`
Expected: PASS (all assertions across all seven describe blocks)

- [ ] **Step 6: Create barrel, update root index**

`packages/react-core/src/hooks/index.ts`:

```typescript
export { useMergeProps } from "./use-merge-props";
export { useMountEffect } from "./use-mount-effect";
export { useUnmountEffect } from "./use-unmount-effect";
export { useUpdateEffect } from "./use-update-effect";
export { usePrevious } from "./use-previous";
export { useEventListener } from "./use-event-listener";
export type { UseEventListenerOptions } from "./use-event-listener";
export { useResizeListener } from "./use-resize-listener";
```

Update `packages/react-core/src/index.ts`, adding `export * from "./hooks";`.

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/react-core.json`:

```json
[
  {
    "originalPath": "components/lib/hooks/useMountEffect.js",
    "ultimateDestination": "packages/react-core/src/hooks/use-mount-effect.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: runs an effect exactly once on mount via useEffect with an empty dependency array. Authored fresh in TypeScript, not ported line-for-line — trivial enough that the verified behavior fully specifies the implementation."
  },
  {
    "originalPath": "components/lib/hooks/useUnmountEffect.js",
    "ultimateDestination": "packages/react-core/src/hooks/use-unmount-effect.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: runs a cleanup function once on unmount via useEffect returning that cleanup, empty dependency array."
  },
  {
    "originalPath": "components/lib/hooks/useUpdateEffect.js",
    "ultimateDestination": "packages/react-core/src/hooks/use-update-effect.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: skips the effect on the first (mount) run, fires on subsequent dependency changes, via a mounted-ref guard."
  },
  {
    "originalPath": "components/lib/hooks/usePrevious.js",
    "ultimateDestination": "packages/react-core/src/hooks/use-previous.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: returns undefined on first render, the previous value thereafter, via a ref updated in a post-render effect."
  },
  {
    "originalPath": "components/lib/hooks/useMergeProps.js",
    "ultimateDestination": "packages/react-core/src/hooks/use-merge-props.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior (useMergeProps.js): shallow-merges class names (concatenated) and event handlers (composed, not overwritten) across prop sets, later objects winning for all other keys. Authored fresh, not ported line-for-line."
  },
  {
    "originalPath": "components/lib/hooks/useEventListener.js",
    "ultimateDestination": "packages/react-core/src/hooks/use-event-listener.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: bind/unbind pair attaching/detaching a listener on a resolved target (supports 'window'/'document' string targets and function-resolved targets), gated by a `when` flag."
  },
  {
    "originalPath": "components/lib/hooks/useResizeListener.js",
    "ultimateDestination": "packages/react-core/src/hooks/use-resize-listener.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: a window-resize-specific specialization of the event-listener bind/unbind pattern. Implemented here as a thin wrapper over useEventListener rather than a duplicate implementation."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/hooks/hooks.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test suite covering all seven hooks, not derived from upstream (PrimeReact's own hooks have no dedicated per-hook spec files in this version)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/hooks/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

(Merge these into the existing array from Task 3 — do not overwrite.)

- [ ] **Step 8: Commit**

```bash
git add packages/react-core/src/hooks/ packages/react-core/src/index.ts docs/architecture/provenance/react-core.json
git commit -m "feat(react-core): add shared lifecycle and event hooks"
```

---

## Task 5: `Portal` and `useOverlayListener`

**Files:**

- Create: `packages/react-core/src/overlay/portal.tsx`
- Create: `packages/react-core/src/overlay/portal.spec.tsx`
- Create: `packages/react-core/src/overlay/use-overlay-listener.ts`
- Create: `packages/react-core/src/overlay/use-overlay-listener.spec.ts`
- Create: `packages/react-core/src/overlay/index.ts`
- Modify: `packages/react-core/src/index.ts`

**Interfaces:**

- Consumes: `useEventListener`, `useResizeListener`, `useMountEffect` (Task 4).
- Produces: `Portal`, `useOverlayListener` per this plan's Interfaces section. Consumed by `UDialog` (Task 16), `UMenu` (Task 17), `UTooltip` (Task 14).

- [ ] **Step 1: Extract `portal` source for reference**

Run: `node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz portal .vendor-extracted/react/portal`

Read `.vendor-extracted/react/portal/Portal.js` in full (already read once during the gate — confirm `DomHandler.isClient()` guard, `mountedState` via `useState`+mount-effect, `appendTo === 'self'` inline-render escape hatch, `ReactDOM.createPortal(element, appendTo)`).

- [ ] **Step 2: Write the failing test for `Portal`**

Create `packages/react-core/src/overlay/portal.spec.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Portal } from "./portal";

describe("Portal", () => {
  it("renders nothing when visible is false", () => {
    render(<Portal element={<div>content</div>} visible={false} />);
    expect(screen.queryByText("content")).toBeNull();
  });

  it("renders into document.body by default when visible", async () => {
    render(<Portal element={<div data-testid="portal-content">content</div>} visible />);
    const node = await screen.findByTestId("portal-content");
    expect(document.body.contains(node)).toBe(true);
  });

  it("renders inline (not portaled) when appendTo is 'self'", async () => {
    const { container } = render(
      <Portal element={<div data-testid="inline-content">content</div>} appendTo="self" visible />
    );
    const node = await screen.findByTestId("inline-content");
    expect(container.contains(node)).toBe(true);
  });
});
```

- [ ] **Step 3: Write the failing test for `useOverlayListener`**

Create `packages/react-core/src/overlay/use-overlay-listener.spec.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOverlayListener } from "./use-overlay-listener";

describe("useOverlayListener", () => {
  it("fires the listener with type 'outside' on a click outside both target and overlay", () => {
    const target = { current: document.createElement("div") };
    const overlay = { current: document.createElement("div") };
    document.body.append(target.current, overlay.current);
    const listener = vi.fn();

    const { result } = renderHook(() =>
      useOverlayListener({ target, overlay, listener, when: true })
    );
    const [bind] = result.current;
    act(() => bind());

    const outsideEl = document.createElement("div");
    document.body.appendChild(outsideEl);
    outsideEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(listener).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ type: "outside", valid: true })
    );

    document.body.removeChild(target.current);
    document.body.removeChild(overlay.current);
    document.body.removeChild(outsideEl);
  });

  it("does not fire for a click on the target itself", () => {
    const target = { current: document.createElement("div") };
    const overlay = { current: document.createElement("div") };
    document.body.append(target.current, overlay.current);
    const listener = vi.fn();

    const { result } = renderHook(() =>
      useOverlayListener({ target, overlay, listener, when: true })
    );
    const [bind] = result.current;
    act(() => bind());

    target.current.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(listener).not.toHaveBeenCalled();

    document.body.removeChild(target.current);
    document.body.removeChild(overlay.current);
  });
});
```

- [ ] **Step 4: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/react-core test`
Expected: FAIL — `portal.tsx`/`use-overlay-listener.ts` do not exist yet.

- [ ] **Step 5: Write `Portal`**

Create `packages/react-core/src/overlay/portal.tsx`:

```typescript
import * as React from "react";
import { createPortal } from "react-dom";
import { useMountEffect } from "../hooks";

export interface PortalProps {
  element: React.ReactNode;
  appendTo?: HTMLElement | "self" | (() => HTMLElement) | undefined;
  visible?: boolean;
}

function isClient(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function Portal({ element, appendTo, visible = false }: PortalProps): React.ReactNode {
  const [mounted, setMounted] = React.useState(false);

  useMountEffect(() => {
    if (isClient()) setMounted(true);
  });

  if (!visible || !mounted) return null;

  let target = appendTo;
  if (typeof target === "function") target = target();
  if (!target) target = document.body;

  return target === "self" ? element : createPortal(element, target);
}
```

- [ ] **Step 6: Write `useOverlayListener`**

Create `packages/react-core/src/overlay/use-overlay-listener.ts`:

```typescript
import { useCallback, useRef } from "react";
import { useEventListener } from "../hooks/use-event-listener";
import { useResizeListener } from "../hooks/use-resize-listener";

export interface OverlayListenerMeta {
  type: "outside" | "resize" | "orientationchange" | "scroll";
  valid: boolean;
}

export interface UseOverlayListenerOptions {
  target: React.RefObject<HTMLElement>;
  overlay: React.RefObject<HTMLElement>;
  listener: (event: Event, meta: OverlayListenerMeta) => void;
  when?: boolean;
}

export function useOverlayListener({
  target,
  overlay,
  listener,
  when = true,
}: UseOverlayListenerOptions): [bind: () => void, unbind: () => void] {
  const isOutsideClicked = useCallback(
    (event: Event) => {
      const t = target.current;
      const o = overlay.current;
      const eventTarget = event.target as Node;
      if (!t) return false;
      return !(t.isSameNode(eventTarget) || t.contains(eventTarget) || o?.contains(eventTarget));
    },
    [target, overlay]
  );

  const [bindClick, unbindClick] = useEventListener({
    target: "document",
    type: "click",
    listener: (event) => listener(event, { type: "outside", valid: isOutsideClicked(event) }),
    when,
  });

  const [bindResize, unbindResize] = useResizeListener({
    listener: (event) => listener(event, { type: "resize", valid: true }),
    when,
  });

  const bind = useCallback(() => {
    bindClick();
    bindResize();
  }, [bindClick, bindResize]);

  const unbind = useCallback(() => {
    unbindClick();
    unbindResize();
  }, [unbindClick, unbindResize]);

  return [bind, unbind];
}
```

**Scope note**: verified PrimeReact's real `useOverlayListener.js` (read during the gate) also composes `orientationchange` and overlay-scroll listeners. This Ultimate implementation covers `outside`-click and `resize` — the two paths actually exercised by the Phase 3 proof set's `UMenu` (Task 17) popup-mode usage; `orientationchange`/scroll-specific composition is not added speculatively. If a later proof-set need demonstrates it, extend this hook then, following the same verified-behavior-first process.

- [ ] **Step 7: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/react-core test`
Expected: PASS (all Portal and useOverlayListener assertions)

- [ ] **Step 8: Create barrel, update root index**

`packages/react-core/src/overlay/index.ts`:

```typescript
export { Portal } from "./portal";
export type { PortalProps } from "./portal";
export { useOverlayListener } from "./use-overlay-listener";
export type { UseOverlayListenerOptions, OverlayListenerMeta } from "./use-overlay-listener";
```

Update `packages/react-core/src/index.ts`, adding `export * from "./overlay";`.

- [ ] **Step 9: Add provenance entries**

Append to `docs/architecture/provenance/react-core.json`:

```json
[
  {
    "originalPath": "components/lib/portal/Portal.js",
    "ultimateDestination": "packages/react-core/src/overlay/portal.tsx",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior (Portal.js): DomHandler.isClient()-guarded mount state, ReactDOM.createPortal to a resolved appendTo target defaulting to document.body, appendTo==='self' renders inline instead of portaling. Reimplemented as isClient()-equivalent check + useMountEffect, not ported line-for-line."
  },
  {
    "originalPath": "components/lib/hooks/useOverlayListener.js",
    "ultimateDestination": "packages/react-core/src/overlay/use-overlay-listener.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: composite outside-click + resize (+ orientationchange + overlay-scroll, not included here) dismissal listener. Ultimate decision: scoped to outside-click + resize only, matching the Phase 3 proof set's actual UMenu popup-mode usage — orientationchange/scroll composition deferred until a real consumer needs it, per YAGNI."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/overlay/portal.spec.tsx",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream (Portal.js has no dedicated spec file in this version)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/overlay/use-overlay-listener.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/overlay/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 10: Commit**

```bash
git add packages/react-core/src/overlay/ packages/react-core/src/index.ts docs/architecture/provenance/react-core.json
git commit -m "feat(react-core): add Portal and useOverlayListener"
```

---

## Task 6: Priority-aware Escape handling

**Files:**

- Create: `packages/react-core/src/escape/priorities.ts`
- Create: `packages/react-core/src/escape/use-display-order.ts`
- Create: `packages/react-core/src/escape/use-global-escape-key.ts`
- Create: `packages/react-core/src/escape/escape.spec.ts`
- Create: `packages/react-core/src/escape/index.ts`
- Modify: `packages/react-core/src/index.ts`

**Interfaces:**

- Produces: `ESCAPE_PRIORITIES`, `useDisplayOrder`, `useGlobalEscapeKey` per this plan's Interfaces section. Consumed by `UDialog` (Task 16), `UMenu` (Task 17), `UTooltip` (Task 14) — none of which are implemented before this task.

- [ ] **Step 1: Extract `hooks` source for reference (already extracted in Task 4, re-read the Escape-specific files)**

Read `.vendor-extracted/react/hooks/useGlobalOnEscapeKey.js` and `.vendor-extracted/react/hooks/useDisplayOrder.js` in full (already read during the gate — confirm the two-level priority tuple, the module-level `escKeyListeners` Map, `refreshGlobalKeyDownListener`'s attach/detach-on-empty behavior, and `useDisplayOrder`'s `groupToDisplayedElements` registry).

- [ ] **Step 2: Write the failing tests**

Create `packages/react-core/src/escape/escape.spec.ts`:

```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDisplayOrder } from "./use-display-order";
import { useGlobalEscapeKey } from "./use-global-escape-key";
import { ESCAPE_PRIORITIES } from "./priorities";

function fireEscape() {
  document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
}

describe("useDisplayOrder", () => {
  it("assigns increasing order to successively mounted instances in the same group", () => {
    const { result: first } = renderHook(() => useDisplayOrder("test-group-a", true));
    const { result: second } = renderHook(() => useDisplayOrder("test-group-a", true));
    expect(second.current).toBeGreaterThan(first.current ?? 0);
  });
});

describe("useGlobalEscapeKey", () => {
  afterEach(() => {
    document.removeEventListener("keydown", () => {});
  });

  it("calls the callback on Escape when when is true", () => {
    const callback = vi.fn();
    renderHook(() => useGlobalEscapeKey({ callback, when: true, priority: [ESCAPE_PRIORITIES.DIALOG, 1] }));
    fireEscape();
    expect(callback).toHaveBeenCalledOnce();
  });

  it("does not call the callback when when is false", () => {
    const callback = vi.fn();
    renderHook(() => useGlobalEscapeKey({ callback, when: false, priority: [ESCAPE_PRIORITIES.DIALOG, 1] }));
    fireEscape();
    expect(callback).not.toHaveBeenCalled();
  });

  it("only the highest-priority-tuple listener fires when two are registered", () => {
    const dialogCallback = vi.fn();
    const menuCallback = vi.fn();
    renderHook(() =>
      useGlobalEscapeKey({ callback: dialogCallback, when: true, priority: [ESCAPE_PRIORITIES.DIALOG, 1] })
    );
    renderHook(() =>
      useGlobalEscapeKey({ callback: menuCallback, when: true, priority: [ESCAPE_PRIORITIES.MENU, 1] })
    );
    fireEscape();
    // MENU (500) > DIALOG (300) — MENU's tuple wins.
    expect(menuCallback).toHaveBeenCalledOnce();
    expect(dialogCallback).not.toHaveBeenCalled();
  });

  it("deregisters on unmount, so a later Escape does not call a stale callback", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() =>
      useGlobalEscapeKey({ callback, when: true, priority: [ESCAPE_PRIORITIES.TOOLTIP, 1] })
    );
    unmount();
    fireEscape();
    expect(callback).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/react-core test`
Expected: FAIL — none of `priorities.ts`/`use-display-order.ts`/`use-global-escape-key.ts` exist yet.

- [ ] **Step 4: Write `priorities.ts`**

Create `packages/react-core/src/escape/priorities.ts`:

```typescript
// Numeric values match verified PrimeReact ESC_KEY_HANDLING_PRIORITIES (Tooltip.js
// import, confirmed during the Real-Source Verification Gate) for the three
// proof-set-relevant tiers only. Upstream's full enum also has SIDEBAR (100),
// SLIDE_MENU (200), IMAGE (400), OVERLAY_PANEL (600), PASSWORD (700),
// CASCADE_SELECT (800), SPLIT_BUTTON (900), SPEED_DIAL (1000) — not declared
// here since none are Phase 3 components; extend only when a real component
// needs a tier.
export const ESCAPE_PRIORITIES = {
  DIALOG: 300,
  MENU: 500,
  TOOLTIP: 1200,
} as const;
```

- [ ] **Step 5: Write `use-display-order.ts`**

Create `packages/react-core/src/escape/use-display-order.ts`:

```typescript
import { useEffect, useState } from "react";

let uidCounter = 0;
const groupToDisplayedElements: Record<string, (number | undefined)[]> = {};

export function useDisplayOrder(group: string, isVisible = true): number | undefined {
  const [uid] = useState(() => ++uidCounter);
  const [displayOrder, setDisplayOrder] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isVisible) return;

    if (!groupToDisplayedElements[group]) groupToDisplayedElements[group] = [];
    const newOrder = groupToDisplayedElements[group].push(uid);
    setDisplayOrder(newOrder);

    return () => {
      delete groupToDisplayedElements[group][newOrder - 1];
      const list = groupToDisplayedElements[group];
      let lastIndex = list.length - 1;
      while (lastIndex >= 0 && list[lastIndex] === undefined) lastIndex--;
      list.length = lastIndex + 1;
      setDisplayOrder(undefined);
    };
  }, [group, uid, isVisible]);

  return displayOrder;
}
```

- [ ] **Step 6: Write `use-global-escape-key.ts`**

Create `packages/react-core/src/escape/use-global-escape-key.ts`:

```typescript
import { useEffect } from "react";

type EscapeListener = (event: KeyboardEvent) => void;

const escKeyListeners = new Map<number, Map<number, EscapeListener>>();

function onGlobalKeyDown(event: KeyboardEvent): void {
  if (event.code !== "Escape") return;
  const primaryKeys = [...escKeyListeners.keys()];
  if (primaryKeys.length === 0) return;
  const maxPrimary = Math.max(...primaryKeys);
  const secondaryMap = escKeyListeners.get(maxPrimary);
  if (!secondaryMap || secondaryMap.size === 0) return;
  const maxSecondary = Math.max(...secondaryMap.keys());
  secondaryMap.get(maxSecondary)?.(event);
}

function refreshGlobalListener(): void {
  if (typeof document === "undefined") return;
  const hasListeners = [...escKeyListeners.values()].some((m) => m.size > 0);
  document.removeEventListener("keydown", onGlobalKeyDown);
  if (hasListeners) document.addEventListener("keydown", onGlobalKeyDown);
}

export interface UseGlobalEscapeKeyOptions {
  callback: EscapeListener;
  when: boolean;
  priority: [primary: number, secondary: number | undefined];
}

export function useGlobalEscapeKey({ callback, when, priority }: UseGlobalEscapeKeyOptions): void {
  const [primary, secondary] = priority;

  useEffect(() => {
    if (!when || secondary === undefined) return;

    if (!escKeyListeners.has(primary)) escKeyListeners.set(primary, new Map());
    const secondaryMap = escKeyListeners.get(primary)!;
    secondaryMap.set(secondary, callback);
    refreshGlobalListener();

    return () => {
      secondaryMap.delete(secondary);
      if (secondaryMap.size === 0) escKeyListeners.delete(primary);
      refreshGlobalListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, when, primary, secondary]);
}
```

- [ ] **Step 7: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/react-core test`
Expected: PASS (all assertions, including the priority-tuple-wins case)

- [ ] **Step 8: Create barrel, update root index**

`packages/react-core/src/escape/index.ts`:

```typescript
export { ESCAPE_PRIORITIES } from "./priorities";
export { useDisplayOrder } from "./use-display-order";
export { useGlobalEscapeKey } from "./use-global-escape-key";
export type { UseGlobalEscapeKeyOptions } from "./use-global-escape-key";
```

Update `packages/react-core/src/index.ts`, adding `export * from "./escape";`.

- [ ] **Step 9: Add provenance entries**

Append to `docs/architecture/provenance/react-core.json`:

```json
[
  {
    "originalPath": "components/lib/hooks/useGlobalOnEscapeKey.js",
    "ultimateDestination": "packages/react-core/src/escape/use-global-escape-key.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: a single shared document keydown listener gated by a two-level [primaryPriority, secondaryPriority] tuple map, only the highest tuple's callback fires, listener attaches/detaches based on whether any registration exists. Independently authored per spec §11 — this is more correct than Angular's existing UDialog Escape handling (ADR-020's documented gap: no multi-dialog stacking), and this reimplementation is what closes that gap for React."
  },
  {
    "originalPath": "components/lib/hooks/useDisplayOrder.js",
    "ultimateDestination": "packages/react-core/src/escape/use-display-order.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: per-named-group module-level registry assigning each mounted-and-visible instance an incrementing display-order index, cleaned up on unmount with array-tail-trimming. Feeds useGlobalEscapeKey's secondary priority."
  },
  {
    "originalPath": "components/lib/hooks/useGlobalOnEscapeKey.js (ESC_KEY_HANDLING_PRIORITIES constant)",
    "ultimateDestination": "packages/react-core/src/escape/priorities.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Verified upstream enum values for DIALOG (300), MENU (500), TOOLTIP (1200) — the three Phase 3 proof-set-relevant tiers only. Upstream's other 8 tiers (SIDEBAR, SLIDE_MENU, IMAGE, OVERLAY_PANEL, PASSWORD, CASCADE_SELECT, SPLIT_BUTTON, SPEED_DIAL) are not declared, per spec's explicit instruction not to speculatively declare priorities for non-Phase-3 components."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/escape/escape.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, including a genuinely new test category (multi-instance priority-tuple stacking) that upstream itself has no dedicated spec file to cover."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/escape/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 10: Commit**

```bash
git add packages/react-core/src/escape/ packages/react-core/src/index.ts docs/architecture/provenance/react-core.json
git commit -m "feat(react-core): add priority-aware Escape key handling"
```

---

## Task 7: `useZIndex` wrapper

**Files:**

- Create: `packages/react-core/src/zindex/use-z-index.ts`
- Create: `packages/react-core/src/zindex/zindex.spec.ts`
- Create: `packages/react-core/src/zindex/index.ts`
- Modify: `packages/react-core/src/index.ts`

**Interfaces:**

- Consumes: `@ultimate/uix-utils/zindex`'s `ZIndex` (already built, Phase 1 — do not modify it).
- Produces: `useZIndex`, `Z_INDEX_BUCKETS` per this plan's Interfaces section. Consumed by `UDialog` (Task 16), `UMenu` (Task 17), `UTooltip` (Task 14).

- [ ] **Step 1: Confirm the existing `ZIndex` API**

Run: `cat packages/uix-utils/src/zindex/index.ts`
Expected: confirms `ZIndex.set(key, element, baseZIndex)`, `ZIndex.clear(element)`, `ZIndex.get(element)`, `ZIndex.getCurrent(key)` — same shape already used by Angular's `UOverlay`. Do not modify this file.

- [ ] **Step 2: Write the failing test**

Create `packages/react-core/src/zindex/zindex.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useZIndex, Z_INDEX_BUCKETS } from "./use-z-index";

describe("useZIndex", () => {
  it("set() assigns a numeric z-index style to the element for the given bucket key", () => {
    const { result } = renderHook(() => useZIndex());
    const el = document.createElement("div");
    result.current.set("modal", el);
    expect(Number(el.style.zIndex)).toBeGreaterThan(Z_INDEX_BUCKETS.modal);
  });

  it("clear() resets the element's z-index style", () => {
    const { result } = renderHook(() => useZIndex());
    const el = document.createElement("div");
    result.current.set("tooltip", el);
    result.current.clear(el);
    expect(el.style.zIndex).toBe("");
  });

  it("Z_INDEX_BUCKETS exposes the verified default bucket values", () => {
    expect(Z_INDEX_BUCKETS).toEqual({
      modal: 1100,
      overlay: 1000,
      menu: 1000,
      tooltip: 1100,
      toast: 1200,
    });
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/react-core test`
Expected: FAIL — `use-z-index.ts` does not exist yet.

- [ ] **Step 4: Write `use-z-index.ts`**

Create `packages/react-core/src/zindex/use-z-index.ts`:

```typescript
import { useCallback } from "react";
import { ZIndex } from "@ultimate/uix-utils";

// Verified default values from PrimeReact's real api/PrimeReact.js — adopted as
// Ultimate's own starting values (spec §12).
export const Z_INDEX_BUCKETS = {
  modal: 1100,
  overlay: 1000,
  menu: 1000,
  tooltip: 1100,
  toast: 1200,
} as const;

export function useZIndex(): {
  set: (key: keyof typeof Z_INDEX_BUCKETS, element: HTMLElement | null, baseZIndex?: number) => void;
  clear: (element: HTMLElement | null) => void;
} {
  const set = useCallback(
    (key: keyof typeof Z_INDEX_BUCKETS, element: HTMLElement | null, baseZIndex?: number) => {
      if (!element) return;
      ZIndex.set(key, element, baseZIndex ?? Z_INDEX_BUCKETS[key]);
    },
    []
  );

  const clear = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    ZIndex.clear(element);
  }, []);

  return { set, clear };
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/react-core test`
Expected: PASS (3 assertions)

- [ ] **Step 6: Create barrel, update root index**

`packages/react-core/src/zindex/index.ts`:

```typescript
export { useZIndex, Z_INDEX_BUCKETS } from "./use-z-index";
```

Update `packages/react-core/src/index.ts`, adding `export * from "./zindex";`.

- [ ] **Step 7: Add provenance entry**

Append to `docs/architecture/provenance/react-core.json`:

```json
[
  {
    "originalPath": "components/lib/api/PrimeReact.js (zIndex bucket defaults)",
    "ultimateDestination": "packages/react-core/src/zindex/use-z-index.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Wraps the already-built, framework-neutral @ultimate/uix-utils/zindex's ZIndex directly — no redesign of that module (confirmed algorithmically identical to PrimeReact's own ZIndexUtils.js by line-by-line comparison during the Real-Source Verification Gate). Default bucket values (modal 1100, overlay 1000, menu 1000, tooltip 1100, toast 1200) adopted verbatim from verified api/PrimeReact.js."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/zindex/zindex.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/zindex/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/react-core/src/zindex/ packages/react-core/src/index.ts docs/architecture/provenance/react-core.json
git commit -m "feat(react-core): add useZIndex wrapper around @ultimate/uix-utils/zindex"
```

---

## Task 8: `FocusTrap`

**Files:**

- Create: `packages/react-core/src/focus-trap/focus-trap.tsx`
- Create: `packages/react-core/src/focus-trap/focus-trap.spec.tsx`
- Create: `packages/react-core/src/focus-trap/index.ts`
- Modify: `packages/react-core/src/index.ts`

**Interfaces:**

- Consumes: `getFirstFocusableElement(element: Element, selector?: string): Element | null`, `getLastFocusableElement` (same signature) from `@ultimate/uix-utils` (already built, Phase 1 — confirmed exact signatures).
- Produces: `FocusTrap` per this plan's Interfaces section. Consumed by `UDialog` (Task 16).

- [ ] **Step 1: Extract `focustrap` source for reference**

Run: `node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz focustrap .vendor-extracted/react/focustrap`

Read `.vendor-extracted/react/focustrap/FocusTrap.js` in full (already read during the gate — confirm the sentinel-`<span>` pair, `onFirstHiddenElementFocus`/`onLastHiddenElementFocus` redirect logic, `autoFocus`/`disabled` mount-time behavior, no keydown interception anywhere, no focus-restoration-on-unmount).

- [ ] **Step 2: Write the failing tests**

Create `packages/react-core/src/focus-trap/focus-trap.spec.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FocusTrap } from "./focus-trap";

describe("FocusTrap", () => {
  it("renders two hidden, focusable sentinel spans bracketing children", () => {
    render(
      <FocusTrap>
        <button>Inside</button>
      </FocusTrap>
    );
    const sentinels = screen.getAllByRole("presentation", { hidden: true });
    expect(sentinels).toHaveLength(2);
    sentinels.forEach((s) => expect(s.tabIndex).toBe(0));
  });

  it("focusing the last sentinel redirects focus to the first focusable descendant", () => {
    render(
      <FocusTrap>
        <button>First</button>
        <button>Second</button>
      </FocusTrap>
    );
    const sentinels = screen.getAllByRole("presentation", { hidden: true });
    const lastSentinel = sentinels[1];
    lastSentinel.dispatchEvent(new FocusEvent("focus", { bubbles: false }));
    lastSentinel.focus();
    // jsdom does not run the onFocus React handler from .focus() directly in all
    // versions — dispatch explicitly to be certain:
    lastSentinel.dispatchEvent(new Event("focus"));
    expect(document.activeElement?.textContent).toBe("First");
  });

  it("does not auto-focus when disabled is true", () => {
    render(
      <FocusTrap disabled>
        <button>Inside</button>
      </FocusTrap>
    );
    expect(document.activeElement?.textContent).not.toBe("Inside");
  });
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/react-core test`
Expected: FAIL — `focus-trap.tsx` does not exist yet.

- [ ] **Step 4: Write `focus-trap.tsx`**

Create `packages/react-core/src/focus-trap/focus-trap.tsx`:

```typescript
import * as React from "react";
import { getFirstFocusableElement, getLastFocusableElement } from "@ultimate/uix-utils";
import { useMountEffect } from "../hooks";

export interface FocusTrapProps {
  children: React.ReactNode;
  autoFocus?: boolean;
  disabled?: boolean;
  autoFocusSelector?: string;
  firstFocusableSelector?: string;
}

export function FocusTrap({
  children,
  autoFocus = false,
  disabled = false,
  autoFocusSelector = "",
  firstFocusableSelector = "",
}: FocusTrapProps): React.ReactElement {
  const firstRef = React.useRef<HTMLSpanElement>(null);
  const lastRef = React.useRef<HTMLSpanElement>(null);
  const targetRef = React.useRef<Element | null>(null);

  const computedSelector = (selector: string) =>
    `:not(.u-hidden-focusable):not([data-u-hidden-focusable="true"])${selector}`;

  const setAutoFocus = (target: Element) => {
    const autoFocusEl =
      getFirstFocusableElement(target, `[autofocus]${computedSelector(autoFocusSelector)}`) ??
      getFirstFocusableElement(target, `[data-u-autofocus='true']${computedSelector(autoFocusSelector)}`);
    let focusable: Element | null = autoFocusEl;
    if (autoFocus && !focusable) {
      focusable = getFirstFocusableElement(target, computedSelector(firstFocusableSelector));
    }
    (focusable as HTMLElement | null)?.focus?.();
  };

  useMountEffect(() => {
    if (disabled) return;
    targetRef.current = firstRef.current?.parentElement ?? null;
    if (targetRef.current) setAutoFocus(targetRef.current);
  });

  const onFirstHiddenFocus = () => {
    const target = firstRef.current?.parentElement;
    if (!target) return;
    const focusable = getLastFocusableElement(target, computedSelector(firstFocusableSelector));
    (focusable as HTMLElement | null)?.focus?.();
  };

  const onLastHiddenFocus = () => {
    const target = lastRef.current?.parentElement;
    if (!target) return;
    const focusable = getFirstFocusableElement(target, computedSelector(firstFocusableSelector));
    (focusable as HTMLElement | null)?.focus?.();
  };

  return (
    <>
      <span
        ref={firstRef}
        className="u-hidden-accessible u-hidden-focusable"
        tabIndex={0}
        role="presentation"
        aria-hidden
        data-u-hidden-focusable="true"
        onFocus={onFirstHiddenFocus}
      />
      {children}
      <span
        ref={lastRef}
        className="u-hidden-accessible u-hidden-focusable"
        tabIndex={0}
        role="presentation"
        aria-hidden
        data-u-hidden-focusable="true"
        onFocus={onLastHiddenFocus}
      />
    </>
  );
}
```

**Scope note**: verified `FocusTrap.js`'s real redirect logic additionally distinguishes "focus arrived here via Tab-forward from inside" vs "via Shift+Tab from outside" using a `relatedTarget` comparison against the *other* sentinel — this simplified version always redirects to the nearest end of the trap on either sentinel's focus, which is the correct behavior for the Phase 3 proof set's single-level, non-nested trap usage (`UDialog` only). If a future need demonstrates the `relatedTarget` distinction matters (e.g. distinguishing which direction focus is cycling), extend this then per the same verified-behavior-first process — do not add it speculatively now.

- [ ] **Step 5: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/react-core test`
Expected: PASS (all 3 assertions)

- [ ] **Step 6: Create barrel, update root index**

`packages/react-core/src/focus-trap/index.ts`:

```typescript
export { FocusTrap } from "./focus-trap";
export type { FocusTrapProps } from "./focus-trap";
```

Update `packages/react-core/src/index.ts`, adding `export * from "./focus-trap";`.

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/react-core.json`:

```json
[
  {
    "originalPath": "components/lib/focustrap/FocusTrap.js",
    "ultimateDestination": "packages/react-core/src/focus-trap/focus-trap.tsx",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream mechanism: hidden sentinel-span pair bracketing children, onFocus handlers on each sentinel redirect real DOM focus back into the trapped region via getFirstFocusableElement/getLastFocusableElement lookups. Reuses @ultimate/uix-utils's already-built getFirstFocusableElement/getLastFocusableElement (already consumed today by Angular's UFocusTrap/UAutoFocus) rather than reimplementing focusable-element lookup. Materially different mechanism than Angular's UFocusTrap (keydown Tab/Shift+Tab interception) — intentional, per spec §14. Simplified relative to verified source: does not distinguish forward-vs-backward cycling direction via relatedTarget, since the Phase 3 proof set's only consumer (UDialog) is a single-level, non-nested trap. No test file exists for FocusTrap in PrimeReact 10.9.9 (verified absent) — this test suite is entirely Ultimate-authored."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/focus-trap/focus-trap.spec.tsx",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test — no upstream test file exists to adapt from."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/focus-trap/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/react-core/src/focus-trap/ packages/react-core/src/index.ts docs/architecture/provenance/react-core.json
git commit -m "feat(react-core): add FocusTrap sentinel-span mechanism"
```

---

## Task 9: `useScrollLock` — Dialog scroll-blocking coordination

**Files:**

- Create: `packages/react-core/src/scroll-lock/use-scroll-lock.ts`
- Create: `packages/react-core/src/scroll-lock/scroll-lock.spec.ts`
- Create: `packages/react-core/src/scroll-lock/index.ts`
- Modify: `packages/react-core/src/index.ts`

**Interfaces:**

- Consumes: `blockBodyScroll(option: string | BlockBodyScrollOptions | undefined): void`, `unblockBodyScroll` (same shape) from `@ultimate/uix-utils` — confirmed exact signatures, both take an options param, default class name is `p-overflow-hidden` unless overridden.
- Produces: `useScrollLock` per this plan's Interfaces section. Consumed by `UDialog` (Task 16).

- [ ] **Step 1: Confirm the existing helpers' signatures**

Run: `cat packages/uix-utils/src/dom/helpers/blockBodyScroll.ts packages/uix-utils/src/dom/helpers/unblockBodyScroll.ts`
Expected: confirms both take `option: string | { className?: string; variableName?: string } | undefined`, default class name `p-overflow-hidden`. Do not modify these files.

- [ ] **Step 2: Write the failing test**

Create `packages/react-core/src/scroll-lock/scroll-lock.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrollLock } from "./use-scroll-lock";

describe("useScrollLock", () => {
  beforeEach(() => {
    document.body.className = "";
  });

  it("registering the first dialog blocks body scroll", () => {
    const { result } = renderHook(() => useScrollLock());
    act(() => result.current.register("dialog-1"));
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
  });

  it("registering a second dialog while one is already blocking does not re-toggle", () => {
    const { result } = renderHook(() => useScrollLock());
    act(() => {
      result.current.register("dialog-1");
      result.current.register("dialog-2");
    });
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
  });

  it("unregistering one of two blocking dialogs keeps scroll blocked", () => {
    const { result } = renderHook(() => useScrollLock());
    act(() => {
      result.current.register("dialog-1");
      result.current.register("dialog-2");
      result.current.unregister("dialog-1");
    });
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
  });

  it("unregistering the last blocking dialog unblocks scroll", () => {
    const { result } = renderHook(() => useScrollLock());
    act(() => {
      result.current.register("dialog-1");
      result.current.unregister("dialog-1");
    });
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });

  it("unregistering an id that was never registered is a no-op", () => {
    const { result } = renderHook(() => useScrollLock());
    act(() => result.current.unregister("never-registered"));
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/react-core test`
Expected: FAIL — `use-scroll-lock.ts` does not exist yet.

- [ ] **Step 4: Write `use-scroll-lock.ts`**

Create `packages/react-core/src/scroll-lock/use-scroll-lock.ts`:

```typescript
import { useCallback } from "react";
import { blockBodyScroll, unblockBodyScroll } from "@ultimate/uix-utils";

// Private, module-scoped — NOT a document property. Replaces PrimeReact's verified
// document.primeDialogParams global-mutation pattern (spec §16). Coordinates
// body-scroll blocking across multiple simultaneous UDialog instances: scroll
// stays blocked as long as at least one dialog is registered.
const blockingIds = new Set<string>();
const SCROLL_LOCK_OPTIONS = { className: "u-overflow-hidden", variableName: "--u-scrollbar-width" };

export function useScrollLock(): {
  register: (id: string) => void;
  unregister: (id: string) => void;
} {
  const register = useCallback((id: string) => {
    const wasEmpty = blockingIds.size === 0;
    blockingIds.add(id);
    if (wasEmpty) blockBodyScroll(SCROLL_LOCK_OPTIONS);
  }, []);

  const unregister = useCallback((id: string) => {
    if (!blockingIds.has(id)) return;
    blockingIds.delete(id);
    if (blockingIds.size === 0) unblockBodyScroll(SCROLL_LOCK_OPTIONS);
  }, []);

  return { register, unregister };
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/react-core test`
Expected: PASS (5 assertions)

- [ ] **Step 6: Create barrel, update root index**

`packages/react-core/src/scroll-lock/index.ts`:

```typescript
export { useScrollLock } from "./use-scroll-lock";
```

Update `packages/react-core/src/index.ts`, adding `export * from "./scroll-lock";`.

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/react-core.json`:

```json
[
  {
    "originalPath": "components/lib/dialog/Dialog.js (document.primeDialogParams, updateScrollBlocker)",
    "ultimateDestination": "packages/react-core/src/scroll-lock/use-scroll-lock.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: document.primeDialogParams tracks {id, hasBlockScroll} per mounted-and-visible Dialog, updateScrollBlocker() checks .some(i => i.hasBlockScroll) across all instances. Ultimate decision (intentional deviation, spec §16): replaced the global document-property mutation with a private module-scoped Set<string> registry — coalesces the same way (scroll blocked while >=1 dialog registered), calls @ultimate/uix-utils/dom's already-built blockBodyScroll/unblockBodyScroll only at the 0->1/1->0 boundary transitions, matching verified behavior without exposing a public global."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/scroll-lock/scroll-lock.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, including explicit multi-dialog 0->1/1->0 transition regression coverage per spec §23 — no upstream test file exists to adapt from (Dialog.js has zero PrimeReact-authored tests, verified during the gate)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/scroll-lock/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/react-core/src/scroll-lock/ packages/react-core/src/index.ts docs/architecture/provenance/react-core.json
git commit -m "feat(react-core): add useScrollLock multi-dialog coordination registry"
```

---

## Task 10: `useMotion` — React lifecycle wrapper around `createMotion`

**Files:**

- Create: `packages/react-core/src/motion/use-motion.ts`
- Create: `packages/react-core/src/motion/motion.spec.ts`
- Create: `packages/react-core/src/motion/index.ts`
- Modify: `packages/react-core/src/index.ts`
- Modify: `packages/react-core/package.json` (add `@ultimate/uix-motion` dependency if not already present from Task 3's scaffold — confirm)

**Interfaces:**

- Consumes: `createMotion(element: Element, options?: MotionOptions): MotionInstance` from `@ultimate/uix-motion` (already built, Phase 1 — confirmed exact export shape: `MotionInstance` has `enter()`, `leave()`, `cancel()`, `update()`, each `enter`/`leave` returning a `Promise<void>`).
- Produces: `useMotion` per this plan's Interfaces section. Consumed by `UDialog` (Task 16), `UMenu` (Task 17).

- [ ] **Step 1: Confirm `createMotion`'s exact API**

Run: `cat packages/uix-motion/src/config/index.ts | head -40`
Expected: confirms `createMotion(element, options)` returns `{ enter, leave, cancel, update }`, `enter()`/`leave()` return Promises, `cancel()` is synchronous. Do not modify this file.

- [ ] **Step 2: Write the failing test**

Create `packages/react-core/src/motion/motion.spec.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMotion } from "./use-motion";

describe("useMotion", () => {
  it("does not throw when the element ref is null on mount", () => {
    const ref = { current: null };
    expect(() => renderHook(() => useMotion(ref, false))).not.toThrow();
  });

  it("calling with visible=true on a real element does not throw", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const ref = { current: el };
    expect(() => renderHook(() => useMotion(ref, true, { name: "u-test", safe: false }))).not.toThrow();
    document.body.removeChild(el);
  });

  it("unmounting while a motion is in flight does not throw (cancel is called)", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const ref = { current: el };
    const { unmount } = renderHook(() => useMotion(ref, true, { name: "u-test", safe: false }));
    expect(() => unmount()).not.toThrow();
    document.body.removeChild(el);
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/react-core test`
Expected: FAIL — `use-motion.ts` does not exist yet.

- [ ] **Step 4: Write `use-motion.ts`**

Create `packages/react-core/src/motion/use-motion.ts`:

```typescript
import { useEffect, useRef } from "react";
import { createMotion, type MotionOptions, type MotionInstance } from "@ultimate/uix-motion";

// React lifecycle integration for @ultimate/uix-motion's imperative, Promise-based
// createMotion — no react-transition-group dependency (spec §17, intentional
// deviation from verified PrimeReact CSSTransition.js, which wraps the real npm
// react-transition-group package).
export function useMotion(
  elementRef: React.RefObject<HTMLElement>,
  visible: boolean,
  options?: MotionOptions
): void {
  const motionRef = useRef<MotionInstance | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    motionRef.current = createMotion(element, options);
    if (visible) {
      motionRef.current.enter();
    } else {
      motionRef.current.leave();
    }

    return () => {
      motionRef.current?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/react-core test`
Expected: PASS (3 assertions)

- [ ] **Step 6: Confirm `@ultimate/uix-motion` is declared as a dependency**

Run: `grep uix-motion packages/react-core/package.json`
Expected: present (added in Task 3's scaffold). If missing, add `"@ultimate/uix-motion": "workspace:*"` to `dependencies` and re-run `pnpm install`.

- [ ] **Step 7: Create barrel, update root index**

`packages/react-core/src/motion/index.ts`:

```typescript
export { useMotion } from "./use-motion";
```

Update `packages/react-core/src/index.ts`, adding `export * from "./motion";`.

- [ ] **Step 8: Add provenance entries**

Append to `docs/architecture/provenance/react-core.json`:

```json
[
  {
    "originalPath": "components/lib/csstransition/CSSTransition.js",
    "ultimateDestination": "packages/react-core/src/motion/use-motion.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream: CSSTransition.js is a thin wrapper around the real npm react-transition-group package's CSSTransition component (declarative, JSX-driven: in/classNames/timeout props). Ultimate decision (intentional deviation, spec §17): reuses @ultimate/uix-motion's already-built, framework-agnostic, Promise-based createMotion(element, options).enter()/.leave() instead, called from a React useEffect keyed on the visible flag, .cancel() on cleanup. No react-transition-group dependency added — no functional gap was found during the Real-Source Verification Gate that would require the declarative wrapper PrimeReact needed."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/motion/motion.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/motion/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 9: Commit**

```bash
git add packages/react-core/src/motion/ packages/react-core/src/index.ts packages/react-core/package.json docs/architecture/provenance/react-core.json
git commit -m "feat(react-core): add useMotion wrapper around @ultimate/uix-motion/createMotion"
```

---

## Task 11: `ReactStyleSheet` adapter and `useComponentStyle`

**Context:** the Real-Source Verification Gate found a real, previously-undocumented gap: `@ultimate/uix-styled`'s `StyleSheet.createStyleElement` is an intentionally-overridable no-op in the base class (confirmed by an existing test literally named `"base createStyleElement is a no-op hook (no DOM element created)"`), and Angular's `ngCoreStyleSheet` never overrides it — meaning Angular currently registers style metadata for dedup only, injecting no real `<style>` element. This task gives React its own working subclass from day one. Per spec §8's explicit decision, this task does **not** fix Angular's parallel gap — that is recorded as a new Phase 2 follow-up in Task 20, not fixed here.

**Files:**

- Create: `packages/react-core/src/styling/react-style-sheet.ts`
- Create: `packages/react-core/src/styling/use-component-style.ts`
- Create: `packages/react-core/src/styling/styling.spec.ts`
- Create: `packages/react-core/src/styling/index.ts`
- Modify: `packages/react-core/src/base/component-base.ts` (wire `useComponentStyle` into `useComponentBase`)
- Modify: `packages/react-core/src/base/component-base.spec.ts` (add a style-registration assertion)
- Modify: `packages/react-core/src/index.ts`

**Interfaces:**

- Consumes: `StyleSheet` (class), `StyleMeta` (type) from `@ultimate/uix-styled`; `createStyleElement(css: string, attributes?: Record<string, unknown>, container?: Element): HTMLStyleElement` from `@ultimate/uix-utils/dom` (already built, Phase 1 — confirmed exact signature); `useMountEffect` (Task 4).
- Produces: `reactCoreStyleSheet`, `useComponentStyle` per this plan's Interfaces section. `useComponentBase` (Task 3) is modified here to call `useComponentStyle` internally. Consumed by every proof-set component (Tasks 13-17) via `useComponentBase`.

- [ ] **Step 1: Confirm `StyleSheet`'s and `createStyleElement`'s exact signatures**

Run: `cat packages/uix-styled/src/stylesheet/index.ts` and `cat packages/uix-utils/src/dom/methods/createStyleElement.ts`
Expected: confirms `StyleSheet`'s `createStyleElement(meta: StyleMeta): E | undefined` override point, and `@ultimate/uix-utils/dom`'s `createStyleElement(css, attributes, container)` real DOM-injection implementation. Do not modify either file.

- [ ] **Step 2: Write the failing tests**

Create `packages/react-core/src/styling/styling.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { reactCoreStyleSheet } from "./react-style-sheet";
import { useComponentStyle } from "./use-component-style";

describe("ReactStyleSheet", () => {
  beforeEach(() => {
    reactCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("createStyleElement injects a real <style> element into document.head", () => {
    reactCoreStyleSheet.add("test-component", ".u-test { color: red; }");
    const styleEl = document.head.querySelector("style");
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain(".u-test");
  });
});

describe("useComponentStyle", () => {
  beforeEach(() => {
    reactCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("registers the style module once per component name on mount", () => {
    renderHook(() => useComponentStyle("test-button", { css: ".u-button {}", classes: {} }));
    expect(reactCoreStyleSheet.has("test-button")).toBe(true);
    const styleEl = document.head.querySelector('style[data-ultimate-style-id="test-button"], style');
    expect(document.head.querySelector("style")?.textContent).toContain(".u-button");
  });

  it("does not re-register (no duplicate <style> tags) on re-render", () => {
    const { rerender } = renderHook(() =>
      useComponentStyle("test-button-2", { css: ".u-button-2 {}", classes: {} })
    );
    rerender();
    rerender();
    const matching = [...document.head.querySelectorAll("style")].filter((el) =>
      el.textContent?.includes(".u-button-2")
    );
    expect(matching).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/react-core test`
Expected: FAIL — `react-style-sheet.ts`/`use-component-style.ts` do not exist yet.

- [ ] **Step 4: Write `react-style-sheet.ts`**

Create `packages/react-core/src/styling/react-style-sheet.ts`:

```typescript
import StyleSheet, { type StyleMeta } from "@ultimate/uix-styled";
import { createStyleElement } from "@ultimate/uix-utils";

class ReactStyleSheet extends StyleSheet<HTMLStyleElement> {
  override createStyleElement(meta: StyleMeta): HTMLStyleElement | undefined {
    if (typeof document === "undefined") return undefined; // SSR guard
    return createStyleElement(meta.css ?? "", meta.attrs, document.head);
  }
}

// Single module-level instance, matching Angular's ngCoreStyleSheet singleton
// pattern — every Ultimate React component registers against this one instance.
export const reactCoreStyleSheet = new ReactStyleSheet();
```

- [ ] **Step 5: Write `use-component-style.ts`**

Create `packages/react-core/src/styling/use-component-style.ts`:

```typescript
import { useMountEffect } from "../hooks";
import { reactCoreStyleSheet } from "./react-style-sheet";
import type { StyleModule } from "../base/component-base";

export function useComponentStyle(componentName: string, styleModule: StyleModule): void {
  useMountEffect(() => {
    if (!reactCoreStyleSheet.has(componentName)) {
      reactCoreStyleSheet.add(componentName, styleModule.css);
    }
  });
}
```

- [ ] **Step 6: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/react-core test`
Expected: PASS (3 assertions)

- [ ] **Step 7: Wire `useComponentStyle` into `useComponentBase`**

Modify `packages/react-core/src/base/component-base.ts`, importing `useComponentStyle` and calling it inside `useComponentBase`:

```typescript
import { classNames } from "@ultimate/uix-utils";
import { useComponentStyle } from "../styling/use-component-style";

// ... (StyleModule/ComponentBaseOptions/resolveClassValue unchanged from Task 3) ...

export function useComponentBase({ componentName, styleModule }: ComponentBaseOptions): {
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
} {
  useComponentStyle(componentName, styleModule);

  const cx = (key: string, params?: Record<string, unknown>) =>
    resolveClassValue(styleModule.classes[key], params);

  return { cx };
}
```

- [ ] **Step 8: Add a style-registration assertion to `component-base.spec.ts`**

Modify `packages/react-core/src/base/component-base.spec.ts`, adding one new test (keep the three existing ones from Task 3 unchanged):

```typescript
import { reactCoreStyleSheet } from "../styling/react-style-sheet";

// ... inside the existing describe("useComponentBase", ...) block, add:

it("registers the component's style with reactCoreStyleSheet on mount, injecting a real <style> element", () => {
  document.head.querySelectorAll("style").forEach((el) => el.remove());
  renderHook(() =>
    useComponentBase({
      componentName: "test-component-4",
      styleModule: { css: ".u-test-4 { color: blue; }", classes: {} },
    })
  );
  expect(reactCoreStyleSheet.has("test-component-4")).toBe(true);
  const matching = [...document.head.querySelectorAll("style")].filter((el) =>
    el.textContent?.includes(".u-test-4")
  );
  expect(matching).toHaveLength(1);
});
```

This is exactly the regression test that would have caught Angular's silent gap (spec §23, §33) — it must pass for React from day one.

- [ ] **Step 9: Run the full `react-core` test suite, verify everything passes**

Run: `pnpm --filter @ultimate/react-core test`
Expected: PASS (all tests across all modules built so far)

- [ ] **Step 10: Create barrel, update root index**

`packages/react-core/src/styling/index.ts`:

```typescript
export { reactCoreStyleSheet } from "./react-style-sheet";
export { useComponentStyle } from "./use-component-style";
```

Update `packages/react-core/src/index.ts`, adding `export * from "./styling";`.

- [ ] **Step 11: Add provenance entries**

Append to `docs/architecture/provenance/react-core.json`:

```json
[
  {
    "originalPath": "components/lib/hooks/useStyle.js",
    "ultimateDestination": "packages/react-core/src/styling/react-style-sheet.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream behavior: creates a real <style data-primereact-style-id> element, dedupes by name, appends to document.head, SSR-safe. Ultimate decision: does NOT port useStyle.js's implementation — instead subclasses the already-built, framework-neutral @ultimate/uix-styled StyleSheet (whose base createStyleElement is a documented no-op, confirmed by an existing uix-styled test), overriding createStyleElement to delegate to the already-built @ultimate/uix-utils/dom createStyleElement. This closes a real, previously-undocumented gap: Angular's ngCoreStyleSheet never overrides this hook either, so no <style> element is currently injected by Angular's style-registration path. Per spec §8's explicit decision, this task fixes it for React only; the Angular-side gap is recorded as a new Phase 2 follow-up (Task 20), not fixed here."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/styling/use-component-style.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored mount-time registration hook, calling reactCoreStyleSheet.add() once per componentName via useMountEffect — not per-render. No direct upstream equivalent (PrimeReact's useHandleStyle bundles this together with base/common/global style loading and passthrough hook invocation, both excluded per spec §7)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/styling/styling.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, including the specific real-<style>-element-injection regression test that would have caught Angular's silent gap (spec §23, §33)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/styling/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 12: Commit**

```bash
git add packages/react-core/src/styling/ packages/react-core/src/base/ packages/react-core/src/index.ts docs/architecture/provenance/react-core.json
git commit -m "feat(react-core): add ReactStyleSheet adapter, wire style registration into useComponentBase

Closes a real gap found during Phase 3 research: @ultimate/uix-styled's
StyleSheet.createStyleElement is a documented no-op unless subclassed, and
Angular's ngCoreStyleSheet never overrides it. React gets a working
subclass from day one; the Angular-side gap is tracked separately."
```

---

## Task 12: Five icon components

**Files:**

- Create: `packages/react-core/src/icons/spinner-icon.tsx`
- Create: `packages/react-core/src/icons/times-icon.tsx`
- Create: `packages/react-core/src/icons/window-maximize-icon.tsx`
- Create: `packages/react-core/src/icons/window-minimize-icon.tsx`
- Create: `packages/react-core/src/icons/check-icon.tsx`
- Create: `packages/react-core/src/icons/icons.spec.tsx`
- Create: `packages/react-core/src/icons/index.ts`
- Modify: `packages/react-core/src/index.ts`

**Interfaces:**

- Produces: `USpinnerIcon`, `UTimesIcon`, `UWindowMaximizeIcon`, `UWindowMinimizeIcon`, `UCheckIcon` per this plan's Interfaces section. Consumed by `UButton` (Task 13, `USpinnerIcon`), `UCheckbox` (Task 15, `UCheckIcon`), `UDialog` (Task 16, all three window/times icons).

- [ ] **Step 1: Extract `icons` source for reference**

Run:
```bash
node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz icons/spinner .vendor-extracted/react/icons-spinner
node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz icons/times .vendor-extracted/react/icons-times
node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz icons/windowmaximize .vendor-extracted/react/icons-windowmaximize
node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz icons/windowminimize .vendor-extracted/react/icons-windowminimize
node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz icons/check .vendor-extracted/react/icons-check
```

Read each extracted `index.js` — confirm the inline `<svg>` markup and `path d="..."` data for each (already partially confirmed for Spinner during the gate; read the other four now). Also confirm `IconBase.getPTI` is the only passthrough-specific piece — not ported, per Global Constraints.

- [ ] **Step 2: Write the failing tests**

Create `packages/react-core/src/icons/icons.spec.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { USpinnerIcon, UTimesIcon, UWindowMaximizeIcon, UWindowMinimizeIcon, UCheckIcon } from "./index";

const icons = [
  ["USpinnerIcon", USpinnerIcon],
  ["UTimesIcon", UTimesIcon],
  ["UWindowMaximizeIcon", UWindowMaximizeIcon],
  ["UWindowMinimizeIcon", UWindowMinimizeIcon],
  ["UCheckIcon", UCheckIcon],
] as const;

describe.each(icons)("%s", (_name, Icon) => {
  it("renders an svg with role='img'", () => {
    const { container } = render(<Icon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("role")).toBe("img");
  });

  it("applies aria-label from the label prop", () => {
    const { container } = render(<Icon label="Loading" />);
    expect(container.querySelector("svg")?.getAttribute("aria-label")).toBe("Loading");
  });

  it("forwards an additional className", () => {
    const { container } = render(<Icon className="u-extra" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toContain("u-extra");
  });
});

describe("USpinnerIcon spin behavior", () => {
  it("adds a spin class when spin is true", () => {
    const { container } = render(<USpinnerIcon spin />);
    expect(container.querySelector("svg")?.getAttribute("class")).toContain("u-icon-spin");
  });
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/react-core test`
Expected: FAIL — none of the five icon files exist yet.

- [ ] **Step 4: Write the five icon components**

Create `packages/react-core/src/icons/spinner-icon.tsx` (path data from the extracted reference, confirmed during the gate):

```typescript
import * as React from "react";
import { classNames } from "@ultimate/uix-utils";

export interface IconProps {
  className?: string;
  label?: string;
  spin?: boolean;
}

export function USpinnerIcon({ className, label, spin }: IconProps): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      className={classNames("u-icon", { "u-icon-spin": spin }, className)}
    >
      <path
        d="M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z"
        fill="currentColor"
      />
    </svg>
  );
}
```

Create `packages/react-core/src/icons/times-icon.tsx`, `window-maximize-icon.tsx`, `window-minimize-icon.tsx`, `check-icon.tsx` following the exact same shape (same `IconProps` interface imported from `spinner-icon.tsx` or redeclared identically, same `<svg role="img" aria-label={label} className={classNames("u-icon", ..., className)}>` wrapper) — use each extracted reference file's real `<path>`/`d` attribute data from Step 1, do not invent placeholder SVG paths.

**Deliberately not included**: `IconBase.getPTI(inProps)` (passthrough prop injection) — not ported, per Global Constraints. `label`/`spin`/`className` are plain props, matching Angular's already-built `UBaseIcon` shape (`label`/`spin` inputs, `role="img"`) rather than PrimeReact's passthrough-spread shape.

- [ ] **Step 5: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/react-core test`
Expected: PASS (all assertions across all 5 `describe.each` blocks plus the spin-specific test)

- [ ] **Step 6: Create barrel, update root index**

`packages/react-core/src/icons/index.ts`:

```typescript
export { USpinnerIcon } from "./spinner-icon";
export { UTimesIcon } from "./times-icon";
export { UWindowMaximizeIcon } from "./window-maximize-icon";
export { UWindowMinimizeIcon } from "./window-minimize-icon";
export { UCheckIcon } from "./check-icon";
export type { IconProps } from "./spinner-icon";
```

Update `packages/react-core/src/index.ts`, adding `export * from "./icons";`. Confirmed: this is exposed only via the single root barrel, no `./icons` subpath export in `package.json`/`tsup.config.ts` (spec §3, tightened — do not add one).

- [ ] **Step 7: Add provenance entries**

Append to `docs/architecture/provenance/react-core.json` (one entry per icon file, same shape — showing the pattern for one, replicate for the other four with their own `originalPath`):

```json
[
  {
    "originalPath": "components/lib/icons/spinner/index.js",
    "ultimateDestination": "packages/react-core/src/icons/spinner-icon.tsx",
    "modificationStatus": "adapted",
    "modificationDescription": "Verified upstream: inline <svg> with real path data, React.memo(React.forwardRef(...)) wrapper, IconBase.getPTI passthrough spread. Ultimate decision: path data ported verbatim (pure visual asset, not behavior); passthrough spread excluded per spec §7, replaced with plain label/spin/className props matching Angular's already-built UBaseIcon shape. Verified minimum icon set (5) confirmed via direct import inspection of Button.js/Dialog.js/Checkbox.js during the Real-Source Verification Gate."
  },
  {
    "originalPath": "components/lib/icons/times/index.js",
    "ultimateDestination": "packages/react-core/src/icons/times-icon.tsx",
    "modificationStatus": "adapted",
    "modificationDescription": "Same treatment as spinner-icon.tsx above: path data ported verbatim, passthrough spread excluded."
  },
  {
    "originalPath": "components/lib/icons/windowmaximize/index.js",
    "ultimateDestination": "packages/react-core/src/icons/window-maximize-icon.tsx",
    "modificationStatus": "adapted",
    "modificationDescription": "Same treatment as spinner-icon.tsx above: path data ported verbatim, passthrough spread excluded."
  },
  {
    "originalPath": "components/lib/icons/windowminimize/index.js",
    "ultimateDestination": "packages/react-core/src/icons/window-minimize-icon.tsx",
    "modificationStatus": "adapted",
    "modificationDescription": "Same treatment as spinner-icon.tsx above: path data ported verbatim, passthrough spread excluded."
  },
  {
    "originalPath": "components/lib/icons/check/index.js",
    "ultimateDestination": "packages/react-core/src/icons/check-icon.tsx",
    "modificationStatus": "adapted",
    "modificationDescription": "Same treatment as spinner-icon.tsx above: path data ported verbatim, passthrough spread excluded. New relative to Angular's icon set — UCheckbox styles its native input directly on the Angular side, no icon; React's Checkbox uses a decorative check icon (verified: Checkbox.js's CheckIcon usage)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/icons/icons.spec.tsx",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test covering all 5 icons via describe.each, not derived from upstream."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react-core/src/icons/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent. Exposed only via the single root package entry point — no ./icons subpath export (spec §3, tightened)."
  }
]
```

- [ ] **Step 8: Commit**

```bash
git add packages/react-core/src/icons/ packages/react-core/src/index.ts docs/architecture/provenance/react-core.json
git commit -m "feat(react-core): add 5 icon components (Spinner, Times, WindowMaximize, WindowMinimize, Check)"
```

---

## Task 13: `@ultimate/react` package scaffold

**Files:**

- Create: `packages/react/package.json`
- Create: `packages/react/tsup.config.ts`
- Create: `packages/react/tsconfig.json`
- Create: `packages/react/src/index.ts`
- Verify: `packages/react/THIRD-PARTY-NOTICES.md` (already exists as a Phase 0 stub — confirm accuracy, do not recreate)

**Interfaces:**

- Consumes: `@ultimate/react-core`'s full barrel (Tasks 3-12).
- Produces: an empty-but-buildable `@ultimate/react` package scaffold with multi-entry `tsup` config ready for Tasks 14-18 to populate.

- [ ] **Step 1: Read the existing Phase 0 stub**

Run: `cat packages/react/THIRD-PARTY-NOTICES.md`
Expected: confirms the MIT license text and PrimeReact 11 non-incorporation note are already correct (written during Phase 0). No changes needed unless something is stale — if so, fix inline and note it in this step's own commit message rather than silently.

- [ ] **Step 2: Scaffold `package.json`**

Create `packages/react/package.json`:

```json
{
  "name": "@ultimate/react",
  "version": "0.1.0",
  "description": "Ultimate Platform React components: Button, Checkbox, Dialog, Menu, Tooltip.",
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
  },
  "files": ["dist", "README.md", "THIRD-PARTY-NOTICES.md"],
  "dependencies": {
    "@ultimate/react-core": "workspace:*",
    "@ultimate/uix-utils": "workspace:*",
    "@ultimate/uix-styled": "workspace:*",
    "@ultimate/uix-motion": "workspace:*"
  },
  "peerDependencies": {
    "react": "^17.0.0 || ^18.0.0 || ^19.0.0",
    "react-dom": "^17.0.0 || ^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tsup": "^8.3.0",
    "typescript": "5.9.3",
    "vitest": "^2.1.8"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

Note: `sideEffects: false` here is the same starting decision as `react-core`'s, subject to the same Task 19 validation.

- [ ] **Step 3: Scaffold `tsup.config.ts` with genuine multi-entry output**

Create `packages/react/tsup.config.ts`:

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "button/index": "src/button/index.ts",
    "checkbox/index": "src/checkbox/index.ts",
    "dialog/index": "src/dialog/index.ts",
    "menu/index": "src/menu/index.ts",
    "tooltip/index": "src/tooltip/index.ts",
  },
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
```

This is the genuine multi-entry-point shape that avoids Phase 2's `ng-packagr` single-barrel tree-shaking failure (spec §3) — each component subpath is a real separate build output, not a barrel re-export bundled together.

- [ ] **Step 4: Scaffold `tsconfig.json`**

Create `packages/react/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create the root barrel (empty until Tasks 14-18 populate it)**

Create `packages/react/src/index.ts`:

```typescript
export {};
```

- [ ] **Step 6: Confirm the package installs and typechecks**

Run: `pnpm install && pnpm --filter @ultimate/react typecheck`
Expected: succeeds (trivially, since `src/index.ts` has no real content yet).

- [ ] **Step 7: Commit**

```bash
git add packages/react/package.json packages/react/tsup.config.ts packages/react/tsconfig.json packages/react/src/index.ts
git commit -m "feat(react): scaffold @ultimate/react package with multi-entry tsup config"
```

---

## Task 14: `UButton`

**Files:**

- Create: `packages/react/src/button/button.tsx`
- Create: `packages/react/src/button/button.spec.tsx`
- Create: `packages/react/src/button/button-style.ts`
- Create: `packages/react/src/button/index.ts`
- Modify: `packages/react/src/index.ts`

**Interfaces:**

- Consumes: `useComponentBase` (Task 3, 11), `USpinnerIcon` (Task 12). Does **not** consume `UTooltip` yet within this task's own build steps — `UTooltip` does not exist until Task 15. **Execution note:** because Button's real upstream behavior conditionally renders `<Tooltip>`, this task builds `UButton` WITHOUT the `tooltip` prop wired to a real `<UTooltip>` render in its first pass. Task 15 (which builds `UTooltip`) includes a dedicated Step 9 that comes back and wires the `tooltip`/`tooltipOptions` props into this file, once `UTooltip` exists. Do not stub a fake tooltip render here.
- Produces: `UButton` — function component. Props (matching confirmed PrimeReact `Button.js`/`button.d.ts` surface, spec §18): `label?: string`, `icon?: React.ReactNode`, `iconPos?: 'left' | 'right' | 'top' | 'bottom'`, `loading?: boolean`, `loadingIcon?: React.ReactNode`, `disabled?: boolean`, `severity?: 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help' | 'contrast'`, `size?: 'small' | 'large'`, `text?: boolean`, `raised?: boolean`, `rounded?: boolean`, `outlined?: boolean`, `link?: boolean`, `plain?: boolean`, `badge?: string`, `badgeClassName?: string`, `visible?: boolean`, `tooltip?: string`, `tooltipOptions?: Record<string, unknown>` (typed loosely for now, tightened once `UTooltip`'s real options type exists post-Task-18), plus all native `React.ButtonHTMLAttributes<HTMLButtonElement>` except `disabled`/`ref` (matching verified `Omit<..., 'disabled' | 'ref'>`), `children?: React.ReactNode`. Ref: `React.forwardRef<HTMLButtonElement, UButtonProps>`. Consumed by `UDialog`'s header/footer close/maximize buttons only insofar as `UDialog` renders its OWN inline `<button>` elements (verified: `Dialog.js` does not import/render `Button` — confirmed during the gate's Dialog import-closure inspection, spec §6's table). No cross-component consumption.

- [ ] **Step 1: Extract `button` source**

Run: `node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz button .vendor-extracted/react/button`

Read `.vendor-extracted/react/button/Button.js`, `ButtonBase.js`, `button.d.ts` in full (already read during the gate — re-read to confirm nothing drifted).

- [ ] **Step 2: Write the failing test**

Create `packages/react/src/button/button.spec.tsx`:

```typescript
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UButton } from "./button";

describe("UButton", () => {
  it("renders the label prop as visible text", () => {
    render(<UButton label="Save" />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("fires onClick when clicked and not disabled", () => {
    const onClick = vi.fn();
    render(<UButton label="Save" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled (native disabled attribute prevents it)", () => {
    const onClick = vi.fn();
    render(<UButton label="Save" onClick={onClick} disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders u-button-loading class and a spinner icon when loading is true", () => {
    render(<UButton label="Save" loading />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("u-button-loading");
    expect(button.querySelector("svg")).not.toBeNull();
  });

  it("applies the disabled attribute to the native <button> when disabled is true", () => {
    render(<UButton label="Save" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("computes a default aria-label from label + badge when no explicit aria-label is given", () => {
    render(<UButton label="Save" badge="3" />);
    expect(screen.getByRole("button").getAttribute("aria-label")).toBe("Save 3");
  });

  it("forwards the ref to the underlying <button> DOM element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<UButton label="Save" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("applies severity/size/outlined boolean-modifier classes", () => {
    render(<UButton label="Save" severity="danger" size="large" outlined />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("u-button-danger");
    expect(button.className).toContain("u-button-lg");
    expect(button.className).toContain("u-button-outlined");
  });
});
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `pnpm --filter @ultimate/react test`
Expected: FAIL — `button.tsx` does not exist yet.

- [ ] **Step 4: Write `button-style.ts`**

Create `packages/react/src/button/button-style.ts` (ported from the extracted reference's design intent, `.p-*`→`.u-*` renamed, `instance.x` passthrough-fallback pattern dropped since `pt` is excluded — matches Angular's already-built `button-style.ts` adapter's own established approach):

```typescript
import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-button {
  margin: 0;
  display: inline-flex;
  cursor: pointer;
  user-select: none;
  align-items: center;
  vertical-align: bottom;
  text-align: center;
  overflow: hidden;
  position: relative;
}
.u-button-label { flex: 1 1 auto; }
.u-button-icon { pointer-events: none; }
.u-button-icon-right { order: 1; }
.u-button:disabled { cursor: default; }
.u-button-icon-only { justify-content: center; }
.u-button-icon-only .u-button-label { visibility: hidden; width: 0; flex: 0 0 auto; }
.u-button-vertical { flex-direction: column; }
`;

export interface ButtonClassesParams {
  hasIcon?: boolean;
  label?: string;
  loading?: boolean;
  severity?: string;
  raised?: boolean;
  rounded?: boolean;
  text?: boolean;
  outlined?: boolean;
  link?: boolean;
  plain?: boolean;
  size?: "small" | "large";
  iconPos?: "left" | "right" | "top" | "bottom";
}

const classes = {
  root: (params: ButtonClassesParams = {}) => {
    const { hasIcon, label, loading, severity, raised, rounded, text, outlined, link, plain, size } = params;
    return [
      "u-button u-component",
      {
        "u-button-icon-only": hasIcon && !label,
        "u-button-loading": loading,
        [`u-button-${severity}`]: severity,
        "u-button-raised": raised,
        "u-button-rounded": rounded,
        "u-button-text": text,
        "u-button-outlined": outlined,
        "u-button-link": link,
        "u-button-plain": plain,
        "u-button-sm": size === "small",
        "u-button-lg": size === "large",
      },
    ];
  },
  loadingIcon: "u-button-loading-icon",
  icon: (params: ButtonClassesParams = {}) => [
    "u-button-icon",
    { [`u-button-icon-${params.iconPos}`]: params.label },
  ],
  label: "u-button-label",
};

export const buttonStyleModule: StyleModule = { css, classes };
```

- [ ] **Step 5: Write `button.tsx`**

Create `packages/react/src/button/button.tsx`:

```typescript
import * as React from "react";
import { useComponentBase, USpinnerIcon } from "@ultimate/react-core";
import { buttonStyleModule } from "./button-style";

export interface UButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  label?: string;
  icon?: React.ReactNode;
  iconPos?: "left" | "right" | "top" | "bottom";
  loading?: boolean;
  loadingIcon?: React.ReactNode;
  disabled?: boolean;
  severity?: "secondary" | "success" | "info" | "warning" | "danger" | "help" | "contrast";
  size?: "small" | "large";
  text?: boolean;
  raised?: boolean;
  rounded?: boolean;
  outlined?: boolean;
  link?: boolean;
  plain?: boolean;
  badge?: string;
  badgeClassName?: string;
  visible?: boolean;
  tooltip?: string;
  tooltipOptions?: Record<string, unknown>;
}

export const UButton = React.forwardRef<HTMLButtonElement, UButtonProps>(function UButton(
  {
    label,
    icon,
    iconPos = "left",
    loading = false,
    loadingIcon,
    disabled = false,
    severity,
    size,
    text,
    raised,
    rounded,
    outlined,
    link,
    plain,
    badge,
    badgeClassName,
    visible = true,
    className,
    children,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "button", styleModule: buttonStyleModule });
  const isDisabled = disabled || loading;
  const hasIcon = Boolean(icon || loading);

  if (!visible) return null;

  const defaultAriaLabel = label ? label + (badge ? " " + badge : "") : ariaLabel;

  const renderIcon = () => {
    if (loading) {
      return loadingIcon ?? <USpinnerIcon className={cx("loadingIcon")} spin />;
    }
    if (icon) {
      return <span className={cx("icon", { iconPos, label })}>{icon}</span>;
    }
    return null;
  };

  return (
    <button
      ref={ref}
      type="button"
      {...rest}
      disabled={isDisabled}
      aria-label={defaultAriaLabel}
      className={[
        cx("root", { hasIcon, label, loading, severity, raised, rounded, text, outlined, link, plain, size }),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {renderIcon()}
      {label && <span className={cx("label")}>{label}</span>}
      {children}
      {badge && <span className={badgeClassName}>{badge}</span>}
    </button>
  );
});
```

**Scope note (matches this task's Interfaces block)**: `tooltip`/`tooltipOptions` props are accepted and typed here but not yet wired to a real `<UTooltip>` render — that wiring is added in Task 15's Step 9, after `UTooltip` exists, to avoid a forward reference to a component this task hasn't built yet. `Ripple` is verified-absent from this render per Global Constraints (not a Phase 3 component).

- [ ] **Step 6: Run the test, verify it passes**

Run: `pnpm --filter @ultimate/react test`
Expected: PASS (all 8 assertions)

- [ ] **Step 7: Create barrel, update root index**

`packages/react/src/button/index.ts`:

```typescript
export { UButton } from "./button";
export type { UButtonProps } from "./button";
```

Update `packages/react/src/index.ts`:

```typescript
export * from "./button";
```

- [ ] **Step 8: Add provenance entries**

Create/append `docs/architecture/provenance/react.json` (new file, first entries):

```json
[
  {
    "originalPath": "components/lib/button/Button.js",
    "ultimateDestination": "packages/react/src/button/button.tsx",
    "modificationStatus": "adapted",
    "modificationDescription": "Verified upstream API (Button.js, button.d.ts): label/icon/iconPos/loading/loadingIcon/severity/size/text/raised/rounded/outlined/link/plain/badge/badgeClassName/tooltip/tooltipOptions/disabled/visible, extends native ButtonHTMLAttributes Omit<'disabled'|'ref'>, React.forwardRef with no useImperativeHandle (ref resolves to raw <button>), default aria-label = label + badge. Ultimate decision: preserved verbatim per spec §18's convergent-evidence justification (Angular's already-built UButton independently arrived at the same boolean-modifier prop set, not a variant enum) — no React-native redesign needed. pt/ptm/ptmo excluded per spec §7. Ripple excluded per spec §6 (not a Phase 3 component). tooltip/tooltipOptions props accepted here but wired to a real UTooltip render only in Task 15's Step 9, after UTooltip exists."
  },
  {
    "originalPath": "components/lib/button/ButtonBase.js",
    "ultimateDestination": "packages/react/src/button/button-style.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Verified upstream classes/css object shape, .p-*->.u-* renamed, instance.x passthrough-fallback pattern dropped since pt is excluded. Ported from the extracted reference file's real class-name logic, not invented."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react/src/button/button.spec.tsx",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, adapting scenario coverage from verified Button.spec.js (the one PrimeReact-authored test file in the proof set) plus additional Ultimate-specific assertions (ref forwarding, boolean-modifier classes)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react/src/button/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 9: Commit**

```bash
git add packages/react/src/button/ packages/react/src/index.ts docs/architecture/provenance/react.json
git commit -m "feat(react): add UButton component"
```

---

## Task 15: `UTooltip`

**Files:**

- Create: `packages/react/src/tooltip/tooltip.tsx`
- Create: `packages/react/src/tooltip/tooltip.spec.tsx`
- Create: `packages/react/src/tooltip/tooltip-style.ts`
- Create: `packages/react/src/tooltip/index.ts`
- Modify: `packages/react/src/index.ts`

**Interfaces:**

- Consumes: `useComponentBase` (Task 3, 11), `Portal` (Task 5), `useZIndex` (Task 7), `useGlobalEscapeKey`/`useDisplayOrder`/`ESCAPE_PRIORITIES` (Task 6), `useEventListener`/`useMountEffect`/`useUnmountEffect`/`useUpdateEffect` (Task 4).
- Produces: `UTooltip` — function component. Props: `target: React.RefObject<HTMLElement> | HTMLElement | string | string[]`, `content?: React.ReactNode`, `position?: 'right' | 'left' | 'top' | 'bottom'`, `event?: 'hover' | 'focus' | 'both'`, `showDelay?: number`, `hideDelay?: number`, `disabled?: boolean`, `closeOnEscape?: boolean`, `autoZIndex?: boolean`, `baseZIndex?: number`, `id?: string` (used for the `aria-describedby` link — auto-generated if omitted), `className?: string`. Consumed as prop-sugar by `UButton` (Task 14, retrofitted in this task's Step 9) and `UCheckbox` (Task 16).

- [ ] **Step 1: Extract `tooltip` source**

Run: `node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz tooltip .vendor-extracted/react/tooltip`

Read `.vendor-extracted/react/tooltip/Tooltip.js`, `TooltipBase.js`, `tooltip.d.ts` in full (already read in depth during the gate — the target-resolution model, event binding via `addEventListener` on the resolved target, `role="tooltip"`/`aria-hidden`, absence of `aria-describedby`).

- [ ] **Step 2: Write the failing tests**

Create `packages/react/src/tooltip/tooltip.spec.tsx`:

```typescript
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UTooltip } from "./tooltip";

function Trigger({ tooltipContent }: { tooltipContent: string }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={ref}>Hover me</button>
      <UTooltip target={ref} content={tooltipContent} showDelay={0} hideDelay={0} />
    </>
  );
}

describe("UTooltip", () => {
  it("shows the tooltip on mouseenter of the target and hides it on mouseleave", async () => {
    render(<Trigger tooltipContent="Save changes" />);
    const target = screen.getByText("Hover me");
    expect(screen.queryByText("Save changes")).toBeNull();
    fireEvent.mouseEnter(target);
    await waitFor(() => expect(screen.getByText("Save changes")).toBeVisible());
    fireEvent.mouseLeave(target);
    await waitFor(() => expect(screen.queryByText("Save changes")).toBeNull());
  });

  it("renders role='tooltip' on the panel", async () => {
    render(<Trigger tooltipContent="Save changes" />);
    fireEvent.mouseEnter(screen.getByText("Hover me"));
    await waitFor(() => {
      const panel = screen.getByText("Save changes").closest('[role="tooltip"]');
      expect(panel).not.toBeNull();
    });
  });

  it("sets aria-describedby on the target while visible, pointing at the tooltip panel's id", async () => {
    render(<Trigger tooltipContent="Save changes" />);
    const target = screen.getByText("Hover me");
    fireEvent.mouseEnter(target);
    await waitFor(() => {
      const describedBy = target.getAttribute("aria-describedby");
      expect(describedBy).not.toBeNull();
      const panel = document.getElementById(describedBy!);
      expect(panel?.textContent).toContain("Save changes");
    });
  });

  it("removes only its own owned aria-describedby id on hide, preserving a pre-existing unrelated value", async () => {
    function TriggerWithExistingDescribedBy() {
      const ref = React.useRef<HTMLButtonElement>(null);
      React.useEffect(() => {
        ref.current?.setAttribute("aria-describedby", "unrelated-id");
      }, []);
      return (
        <>
          <button ref={ref}>Hover me</button>
          <div id="unrelated-id">Unrelated description</div>
          <UTooltip target={ref} content="Save changes" showDelay={0} hideDelay={0} />
        </>
      );
    }
    render(<TriggerWithExistingDescribedBy />);
    const target = screen.getByText("Hover me");
    fireEvent.mouseEnter(target);
    await waitFor(() => {
      expect(target.getAttribute("aria-describedby")).toContain("unrelated-id");
    });
    fireEvent.mouseLeave(target);
    await waitFor(() => {
      expect(target.getAttribute("aria-describedby")).toBe("unrelated-id");
    });
  });

  it("does not show when disabled", async () => {
    function DisabledTrigger() {
      const ref = React.useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={ref}>Hover me</button>
          <UTooltip target={ref} content="Save changes" disabled showDelay={0} />
        </>
      );
    }
    render(<DisabledTrigger />);
    fireEvent.mouseEnter(screen.getByText("Hover me"));
    await new Promise((r) => setTimeout(r, 10));
    expect(screen.queryByText("Save changes")).toBeNull();
  });
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/react test`
Expected: FAIL — `tooltip.tsx` does not exist yet.

- [ ] **Step 4: Write `tooltip-style.ts`**

Create `packages/react/src/tooltip/tooltip-style.ts`:

```typescript
import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-tooltip { position: absolute; padding: .25em .5rem; top: -9999px; left: -9999px; }
.u-tooltip-text { white-space: pre-line; word-break: break-word; }
`;

const classes = {
  root: (params: { position?: string } = {}) => ["u-tooltip u-component", `u-tooltip-${params.position ?? "right"}`],
  text: "u-tooltip-text",
};

export const tooltipStyleModule: StyleModule = { css, classes };
```

- [ ] **Step 5: Write `tooltip.tsx`**

Create `packages/react/src/tooltip/tooltip.tsx`:

```typescript
import * as React from "react";
import {
  useComponentBase,
  Portal,
  useZIndex,
  useGlobalEscapeKey,
  useDisplayOrder,
  ESCAPE_PRIORITIES,
  useMountEffect,
  useUnmountEffect,
  useUpdateEffect,
} from "@ultimate/react-core";
import { tooltipStyleModule } from "./tooltip-style";

export interface UTooltipProps {
  target: React.RefObject<HTMLElement> | HTMLElement | string | string[];
  content?: React.ReactNode;
  position?: "right" | "left" | "top" | "bottom";
  event?: "hover" | "focus" | "both";
  showDelay?: number;
  hideDelay?: number;
  disabled?: boolean;
  closeOnEscape?: boolean;
  autoZIndex?: boolean;
  baseZIndex?: number;
  id?: string;
  className?: string;
}

let tooltipIdCounter = 0;

function resolveTargetElement(target: UTooltipProps["target"]): HTMLElement | null {
  if (typeof target === "string") return document.querySelector<HTMLElement>(target);
  if (Array.isArray(target)) return document.querySelector<HTMLElement>(target[0]);
  if (target instanceof HTMLElement) return target;
  return target.current;
}

export function UTooltip({
  target,
  content,
  position = "right",
  event = "hover",
  showDelay = 0,
  hideDelay = 0,
  disabled = false,
  closeOnEscape = false,
  autoZIndex = true,
  baseZIndex,
  id,
  className,
}: UTooltipProps): React.ReactElement | null {
  const { cx } = useComponentBase({ componentName: "tooltip", styleModule: tooltipStyleModule });
  const { set: setZIndex, clear: clearZIndex } = useZIndex();
  const [visible, setVisible] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const targetElRef = React.useRef<HTMLElement | null>(null);
  const [panelId] = React.useState(() => id ?? `u-tooltip-${++tooltipIdCounter}`);
  const showTimeout = React.useRef<ReturnType<typeof setTimeout>>();
  const hideTimeout = React.useRef<ReturnType<typeof setTimeout>>();

  const isCloseOnEscape = visible && closeOnEscape;
  const displayOrder = useDisplayOrder("tooltip", isCloseOnEscape);

  const hide = React.useCallback(() => {
    clearTimeout(showTimeout.current);
    hideTimeout.current = setTimeout(() => setVisible(false), hideDelay);
  }, [hideDelay]);

  useGlobalEscapeKey({
    callback: hide,
    when: isCloseOnEscape,
    priority: [ESCAPE_PRIORITIES.TOOLTIP, displayOrder],
  });

  const show = React.useCallback(() => {
    if (disabled || !content) return;
    clearTimeout(hideTimeout.current);
    showTimeout.current = setTimeout(() => setVisible(true), showDelay);
  }, [disabled, content, showDelay]);

  useMountEffect(() => {
    const el = resolveTargetElement(target);
    targetElRef.current = el;
    if (!el) return;

    const showEvents = event === "focus" ? ["focus"] : event === "both" ? ["focus", "mouseenter"] : ["mouseenter"];
    const hideEvents = event === "focus" ? ["blur"] : event === "both" ? ["blur", "mouseleave"] : ["mouseleave"];
    showEvents.forEach((e) => el.addEventListener(e, show));
    hideEvents.forEach((e) => el.addEventListener(e, hide));
  });

  useUnmountEffect(() => {
    const el = targetElRef.current;
    if (el) {
      ["mouseenter", "focus"].forEach((e) => el.removeEventListener(e, show));
      ["mouseleave", "blur"].forEach((e) => el.removeEventListener(e, hide));
    }
    clearTimeout(showTimeout.current);
    clearTimeout(hideTimeout.current);
    removeDescribedBy();
    clearZIndex(panelRef.current);
  });

  function addDescribedBy() {
    const el = targetElRef.current;
    if (!el) return;
    const existing = el.getAttribute("aria-describedby");
    const ids = existing ? existing.split(" ").filter(Boolean) : [];
    if (!ids.includes(panelId)) {
      el.setAttribute("aria-describedby", [...ids, panelId].join(" "));
    }
  }

  function removeDescribedBy() {
    const el = targetElRef.current;
    if (!el) return;
    const existing = el.getAttribute("aria-describedby");
    if (!existing) return;
    const remaining = existing
      .split(" ")
      .filter(Boolean)
      .filter((tokenId) => tokenId !== panelId);
    if (remaining.length > 0) {
      el.setAttribute("aria-describedby", remaining.join(" "));
    } else {
      el.removeAttribute("aria-describedby");
    }
  }

  useUpdateEffect(() => {
    if (visible) {
      addDescribedBy();
      if (autoZIndex) setZIndex("tooltip", panelRef.current, baseZIndex);
    } else {
      removeDescribedBy();
      clearZIndex(panelRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!content) return null;

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      role="tooltip"
      aria-hidden={!visible}
      className={[cx("root", { position }), className].filter(Boolean).join(" ")}
    >
      <span className={cx("text")}>{content}</span>
    </div>
  );

  return <Portal element={panel} visible={visible} />;
}
```

**Deliberately not included** (per Global Constraints and spec §9): the `data-pr-*` DOM-attribute config channel, mouse-tracking, multi-target-selector-array iteration beyond the first match, and any `pt`/passthrough props. Multiple `UTooltip` instances targeting the same element is an explicit non-goal per spec §9 — the `addDescribedBy`/`removeDescribedBy` contract above is correct for the single-tooltip-per-target case only.

- [ ] **Step 6: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/react test`
Expected: PASS (all 5 assertions, including the `aria-describedby` additive/owned-ID-only-removal test)

- [ ] **Step 7: Create barrel, update root index**

`packages/react/src/tooltip/index.ts`:

```typescript
export { UTooltip } from "./tooltip";
export type { UTooltipProps } from "./tooltip";
```

Update `packages/react/src/index.ts`, adding `export * from "./tooltip";`.

- [ ] **Step 8: Add provenance entries**

Append to `docs/architecture/provenance/react.json`:

```json
[
  {
    "originalPath": "components/lib/tooltip/Tooltip.js",
    "ultimateDestination": "packages/react/src/tooltip/tooltip.tsx",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Verified upstream (Tooltip.js, 571 lines, full read; Tooltip.spec.js, all 13 tests read): target-based component, resolves target via ref/HTMLElement/selector, imperatively addEventListener's show/hide events on the resolved node, portal-renders a role='tooltip' panel only while visible. Ultimate decision: intentional accessibility improvement (spec §9) — adds aria-describedby on the target while visible (verified absent upstream), additive to any pre-existing value, removes only its own owned id on cleanup; multi-tooltip-same-target explicitly a non-goal. data-pr-* attribute config channel and mouse-tracking excluded per spec §9 (not React-idiomatic, no Ultimate internal convention needs it)."
  },
  {
    "originalPath": "components/lib/tooltip/TooltipBase.js",
    "ultimateDestination": "packages/react/src/tooltip/tooltip-style.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Verified upstream classes/css shape, .p-*->.u-* renamed."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react/src/tooltip/tooltip.spec.tsx",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, adapting scenario coverage from verified Tooltip.spec.js (show/hide on hover, disabled-element non-display) plus new tests specific to the aria-describedby intentional deviation (spec §23's explicit regression-test requirement)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react/src/tooltip/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 9: Wire `tooltip`/`tooltipOptions` prop sugar into `UButton` (deferred from Task 14)**

Modify `packages/react/src/button/button.tsx`: import `UTooltip` from `../tooltip`, add a `React.useRef<HTMLButtonElement>(null)` internal ref combined with the forwarded `ref` (via a small merge — either `useImperativeHandle` exposing the DOM node, or a simple ref-merging utility; keep it minimal: assign to both the internal ref and call the forwarded ref/set `.current` on a `RefObject` forwarded ref), and render `{tooltip && <UTooltip target={internalRef} content={tooltip} {...tooltipOptions} />}` as a sibling after the `<button>`, matching verified `Button.js` line 136's real composition (`<Tooltip target={elementRef} content={props.tooltip} {...props.tooltipOptions} />`).

Add one new test to `packages/react/src/button/button.spec.tsx`:

```typescript
it("renders a UTooltip targeting itself when the tooltip prop is set", async () => {
  render(<UButton label="Save" tooltip="Save changes" />);
  fireEvent.mouseEnter(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByText("Save changes")).toBeVisible());
});
```

(add `waitFor` to the existing `@testing-library/react` import at the top of the file)

Run: `pnpm --filter @ultimate/react test`
Expected: PASS (the 8 existing Button assertions plus this new one)

Update `docs/architecture/provenance/react.json`'s existing `button.tsx` entry's `modificationDescription`, changing the last sentence from "tooltip/tooltipOptions props accepted here but wired to a real UTooltip render only in Task 15's Step 9" to "tooltip/tooltipOptions props wired to a real `<UTooltip target={internalRef} content={tooltip} {...tooltipOptions}>` render, matching verified Button.js line 136's composition exactly, second confirmation (with Checkbox, Task 16) of the approved ref-target-primitive-plus-prop-sugar Tooltip API decision."

- [ ] **Step 10: Commit**

```bash
git add packages/react/src/tooltip/ packages/react/src/button/ packages/react/src/index.ts docs/architecture/provenance/react.json
git commit -m "feat(react): add UTooltip component, wire tooltip prop sugar into UButton"
```

---

## Task 16: `UCheckbox`

**Files:**

- Create: `packages/react/src/checkbox/checkbox.tsx`
- Create: `packages/react/src/checkbox/checkbox.spec.tsx`
- Create: `packages/react/src/checkbox/checkbox-style.ts`
- Create: `packages/react/src/checkbox/index.ts`
- Modify: `packages/react/src/index.ts`

**Interfaces:**

- Consumes: `useComponentBase` (Task 3, 11), `UCheckIcon` (Task 12), `UTooltip` (Task 15).
- Produces: `UCheckbox` — function component. Props (matching spec §19's minimum contract): `checked: boolean` (required), `trueValue?: unknown` (default `true`), `falseValue?: unknown` (default `false`), `onChange?: (event: UCheckboxChangeEvent) => void`, `disabled?: boolean`, `readOnly?: boolean`, `invalid?: boolean`, `name?: string`, `inputRef?: React.Ref<HTMLInputElement>`, `id?: string`, `inputId?: string`, `tooltip?: string`, `tooltipOptions?: Record<string, unknown>`, `autoFocus?: boolean`, `className?: string`. No `indeterminate`, no `defaultChecked` (spec §19, explicit). No cross-component consumption from other proof-set components.

- [ ] **Step 1: Extract `checkbox` source**

Run: `node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz checkbox .vendor-extracted/react/checkbox`

Read `.vendor-extracted/react/checkbox/Checkbox.js`, `CheckboxBase.js`, `checkbox.d.ts` in full (already read during the gate — confirm `checked: boolean` is required/non-optional in the `.d.ts`, the dual native-input-plus-decorative-box structure, the custom `CheckboxChangeEvent` shape, absence of `indeterminate`).

- [ ] **Step 2: Write the failing tests**

Create `packages/react/src/checkbox/checkbox.spec.tsx`:

```typescript
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UCheckbox } from "./checkbox";

describe("UCheckbox", () => {
  it("renders a native checkbox input reflecting the checked prop", () => {
    render(<UCheckbox checked={true} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("does not manage its own internal checked state — stays checked=false until the prop changes", () => {
    const onChange = vi.fn();
    render(<UCheckbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledOnce();
    // A fully-controlled component must not flip its own visual state without a prop change:
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("onChange receives a custom event shape with checked/value/originalEvent", () => {
    const onChange = vi.fn();
    render(<UCheckbox checked={false} onChange={onChange} name="agree" />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        checked: true,
        target: expect.objectContaining({ name: "agree", checked: true }),
      })
    );
  });

  it("respects trueValue/falseValue for non-boolean checked semantics", () => {
    render(<UCheckbox checked="yes" trueValue="yes" falseValue="no" onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("applies disabled to the native input and prevents onChange", () => {
    const onChange = vi.fn();
    render(<UCheckbox checked={false} onChange={onChange} disabled />);
    const input = screen.getByRole("checkbox");
    expect(input).toBeDisabled();
    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("sets aria-invalid from the invalid prop", () => {
    render(<UCheckbox checked={false} onChange={() => {}} invalid />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards inputRef to the native <input> element", () => {
    const inputRef = React.createRef<HTMLInputElement>();
    render(<UCheckbox checked={false} onChange={() => {}} inputRef={inputRef} />);
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(inputRef.current?.type).toBe("checkbox");
  });
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/react test`
Expected: FAIL — `checkbox.tsx` does not exist yet.

- [ ] **Step 4: Write `checkbox-style.ts`**

Create `packages/react/src/checkbox/checkbox-style.ts`:

```typescript
import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-checkbox { position: relative; display: inline-flex; user-select: none; vertical-align: bottom; }
.u-checkbox-box { display: flex; align-items: center; justify-content: center; }
.u-checkbox-input { cursor: pointer; position: absolute; opacity: 0; inset: 0; margin: 0; }
`;

const classes = {
  root: (params: { checked?: boolean } = {}) => ["u-checkbox u-component", { "u-checkbox-checked": params.checked }],
  box: (params: { checked?: boolean } = {}) => ["u-checkbox-box", { "u-checkbox-box-checked": params.checked }],
  input: "u-checkbox-input",
  icon: "u-checkbox-icon",
};

export const checkboxStyleModule: StyleModule = { css, classes };
```

- [ ] **Step 5: Write `checkbox.tsx`**

Create `packages/react/src/checkbox/checkbox.tsx`:

```typescript
import * as React from "react";
import { useComponentBase, UCheckIcon } from "@ultimate/react-core";
import { UTooltip } from "../tooltip";
import { checkboxStyleModule } from "./checkbox-style";

export interface UCheckboxChangeEvent {
  originalEvent: React.ChangeEvent<HTMLInputElement>;
  value: unknown;
  checked: unknown;
  target: { type: "checkbox"; name?: string; id?: string; value: unknown; checked: unknown };
}

export interface UCheckboxProps {
  checked: unknown;
  trueValue?: unknown;
  falseValue?: unknown;
  onChange?: (event: UCheckboxChangeEvent) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  name?: string;
  value?: unknown;
  id?: string;
  inputId?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  tooltip?: string;
  tooltipOptions?: Record<string, unknown>;
  autoFocus?: boolean;
  className?: string;
}

export function UCheckbox({
  checked,
  trueValue = true,
  falseValue = false,
  onChange,
  disabled = false,
  readOnly = false,
  invalid = false,
  name,
  value,
  id,
  inputId,
  inputRef,
  tooltip,
  tooltipOptions,
  autoFocus = false,
  className,
}: UCheckboxProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "checkbox", styleModule: checkboxStyleModule });
  const elementRef = React.useRef<HTMLDivElement>(null);
  const internalInputRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(inputRef, () => internalInputRef.current as HTMLInputElement);

  const isChecked = checked === trueValue;

  const handleChange = (originalEvent: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly || !onChange) return;
    const nextValue = isChecked ? falseValue : trueValue;
    onChange({
      originalEvent,
      value,
      checked: nextValue,
      target: { type: "checkbox", name, id, value, checked: nextValue },
    });
  };

  return (
    <>
      <div ref={elementRef} className={[cx("root", { checked: isChecked }), className].filter(Boolean).join(" ")}>
        <input
          ref={internalInputRef}
          type="checkbox"
          id={inputId}
          className={cx("input")}
          name={name}
          checked={isChecked}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          aria-invalid={invalid}
          onChange={handleChange}
        />
        <div className={cx("box", { checked: isChecked })}>
          {isChecked && <UCheckIcon className={cx("icon")} />}
        </div>
      </div>
      {tooltip && <UTooltip target={elementRef} content={tooltip} {...tooltipOptions} />}
    </>
  );
}
```

**Deliberately not included** (spec §19, §20): no `indeterminate` prop, no `defaultChecked`/uncontrolled mode — `checked` is required and this component never manages its own boolean state internally, matching verified upstream exactly.

- [ ] **Step 6: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/react test`
Expected: PASS (all 7 assertions)

- [ ] **Step 7: Create barrel, update root index**

`packages/react/src/checkbox/index.ts`:

```typescript
export { UCheckbox } from "./checkbox";
export type { UCheckboxProps, UCheckboxChangeEvent } from "./checkbox";
```

Update `packages/react/src/index.ts`, adding `export * from "./checkbox";`.

- [ ] **Step 8: Add provenance entries**

Append to `docs/architecture/provenance/react.json`:

```json
[
  {
    "originalPath": "components/lib/checkbox/Checkbox.js",
    "ultimateDestination": "packages/react/src/checkbox/checkbox.tsx",
    "modificationStatus": "adapted",
    "modificationDescription": "Verified upstream (Checkbox.js full read both halves, checkbox.d.ts full read): checked: boolean is a required prop (no defaultChecked/uncontrolled mode exists upstream), trueValue/falseValue let checked represent non-boolean values, onChange receives a custom event shape not a raw DOM ChangeEvent, real hidden native <input type=checkbox> plus a separate decorative box rendering the check icon, inputRef targets the native input specifically. No indeterminate prop exists in verified source — confirmed absent, not an oversight. No PrimeReact-authored test file exists for Checkbox (verified absent) — this spec file is entirely Ultimate-authored. Fourth confirmation (with Button, twice) of the ref-target-primitive-plus-prop-sugar Tooltip API decision."
  },
  {
    "originalPath": "components/lib/checkbox/CheckboxBase.js",
    "ultimateDestination": "packages/react/src/checkbox/checkbox-style.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Verified upstream classes/css shape, .p-*->.u-* renamed."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react/src/checkbox/checkbox.spec.tsx",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test — no upstream test file exists to adapt from. Includes an explicit assertion that the component does not manage its own internal checked state (fully-controlled contract regression coverage, spec §23)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react/src/checkbox/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 9: Commit**

```bash
git add packages/react/src/checkbox/ packages/react/src/index.ts docs/architecture/provenance/react.json
git commit -m "feat(react): add UCheckbox component"
```

---

## Task 17: `UDialog`

**Files:**

- Create: `packages/react/src/dialog/dialog.tsx`
- Create: `packages/react/src/dialog/dialog.spec.tsx`
- Create: `packages/react/src/dialog/dialog-style.ts`
- Create: `packages/react/src/dialog/index.ts`
- Modify: `packages/react/src/index.ts`

**Interfaces:**

- Consumes: `useComponentBase` (Task 3, 11), `Portal` (Task 5), `useGlobalEscapeKey`/`useDisplayOrder`/`ESCAPE_PRIORITIES` (Task 6), `useZIndex` (Task 7), `FocusTrap` (Task 8), `useScrollLock` (Task 9), `useMotion` (Task 10), `UTimesIcon`/`UWindowMaximizeIcon`/`UWindowMinimizeIcon` (Task 12).
- Produces: `UDialog` — function component. Props: `visible: boolean` (required), `onHide: (event?: React.SyntheticEvent) => void` (required), `header?: React.ReactNode`, `footer?: React.ReactNode`, `children?: React.ReactNode`, `modal?: boolean` (default `true`), `closable?: boolean` (default `true`), `showCloseIcon?: boolean` (default `true`), `closeOnEscape?: boolean` (default `false`, matching verified upstream default), `dismissableMask?: boolean`, `blockScroll?: boolean` (default `false`), `baseZIndex?: number`, `appendTo?: HTMLElement | (() => HTMLElement)`, `className?: string`, `style?: React.CSSProperties`, `id?: string`. **No `draggable`, `resizable`, or `maximizable` props exist on this component in Phase 3** (Global Constraints, spec §15 — do not add them). No cross-component consumption from other proof-set components (verified: `Dialog.js` does not import `Button`).

- [ ] **Step 1: Extract `dialog` source**

Run: `node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz dialog .vendor-extracted/react/dialog`

Read `.vendor-extracted/react/dialog/Dialog.js`, `DialogBase.js`, `dialog.d.ts` in full (already read in full during the gate — the `visible`/`onHide` controlled contract, `aria-labelledby`/`aria-describedby`/`aria-modal`/`role="dialog"` already-correct wiring, focus-return-on-close via `onExited`, the draggable/resizable/maximizable feature surface that is explicitly excluded here).

- [ ] **Step 2: Write the failing tests**

Create `packages/react/src/dialog/dialog.spec.tsx`:

```typescript
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UDialog } from "./dialog";

describe("UDialog", () => {
  it("renders nothing when visible is false", () => {
    render(
      <UDialog visible={false} onHide={() => {}} header="Title">
        Content
      </UDialog>
    );
    expect(screen.queryByText("Content")).toBeNull();
  });

  it("renders header/content/footer when visible is true", async () => {
    render(
      <UDialog visible onHide={() => {}} header="Title" footer={<button>OK</button>}>
        Content
      </UDialog>
    );
    await waitFor(() => {
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(screen.getByText("OK")).toBeInTheDocument();
    });
  });

  it("has role='dialog', aria-modal, aria-labelledby, aria-describedby", async () => {
    render(
      <UDialog visible onHide={() => {}} header="Title">
        Content
      </UDialog>
    );
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
      expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    });
  });

  it("calls onHide when the close icon is clicked", async () => {
    const onHide = vi.fn();
    render(
      <UDialog visible onHide={onHide} header="Title">
        Content
      </UDialog>
    );
    await waitFor(() => screen.getByLabelText(/close/i));
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(onHide).toHaveBeenCalledOnce();
  });

  it("exposes no draggable, resizable, or maximizable props or UI", async () => {
    render(
      <UDialog visible onHide={() => {}} header="Title">
        Content
      </UDialog>
    );
    await waitFor(() => screen.getByRole("dialog"));
    expect(screen.queryByLabelText(/maximize/i)).toBeNull();
    expect(document.querySelector(".u-resizable-handle")).toBeNull();
    // @ts-expect-error - draggable/resizable/maximizable must not exist on UDialogProps
    const _typeCheck: import("./dialog").UDialogProps = { visible: true, onHide: () => {}, draggable: true };
  });

  it("returns focus to the previously-focused element after closing", async () => {
    function Harness() {
      const [visible, setVisible] = React.useState(false);
      return (
        <>
          <button onClick={() => setVisible(true)}>Open</button>
          <UDialog visible={visible} onHide={() => setVisible(false)} header="Title" focusOnShow>
            <button>Inside</button>
          </UDialog>
        </>
      );
    }
    render(<Harness />);
    const openButton = screen.getByText("Open");
    openButton.focus();
    fireEvent.click(openButton);
    await waitFor(() => screen.getByText("Inside"));
    fireEvent.click(screen.getByLabelText(/close/i));
    await waitFor(() => expect(document.activeElement).toBe(openButton));
  });
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/react test`
Expected: FAIL — `dialog.tsx` does not exist yet. (The `@ts-expect-error` type-check line in the negative test is a compile-time assertion — it will only "fail correctly" once `UDialogProps` is defined without those fields; leave it as-is, it validates itself once Step 4 is done and `pnpm typecheck` runs clean.)

- [ ] **Step 4: Write `dialog-style.ts`**

Create `packages/react/src/dialog/dialog-style.ts`:

```typescript
import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-dialog-mask { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
.u-dialog { display: flex; flex-direction: column; pointer-events: auto; max-height: 90%; }
.u-dialog-header { display: flex; align-items: center; justify-content: space-between; }
.u-dialog-content { overflow-y: auto; flex-grow: 1; }
.u-dialog-footer { display: flex; justify-content: flex-end; }
`;

const classes = {
  mask: "u-dialog-mask",
  root: () => "u-dialog u-component",
  header: "u-dialog-header",
  headerTitle: "u-dialog-header-title",
  headerIcons: "u-dialog-header-icons",
  closeButton: "u-dialog-close-button",
  closeButtonIcon: "u-dialog-close-icon",
  content: "u-dialog-content",
  footer: "u-dialog-footer",
};

export const dialogStyleModule: StyleModule = { css, classes };
```

- [ ] **Step 5: Write `dialog.tsx`**

Create `packages/react/src/dialog/dialog.tsx`:

```typescript
import * as React from "react";
import {
  useComponentBase,
  Portal,
  useGlobalEscapeKey,
  useDisplayOrder,
  ESCAPE_PRIORITIES,
  useZIndex,
  FocusTrap,
  useScrollLock,
  useMotion,
  UTimesIcon,
} from "@ultimate/react-core";
import { dialogStyleModule } from "./dialog-style";

export interface UDialogProps {
  visible: boolean;
  onHide: (event?: React.SyntheticEvent) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  modal?: boolean;
  closable?: boolean;
  showCloseIcon?: boolean;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
  blockScroll?: boolean;
  baseZIndex?: number;
  appendTo?: HTMLElement | (() => HTMLElement);
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  focusOnShow?: boolean;
}

let dialogIdCounter = 0;

export function UDialog({
  visible,
  onHide,
  header,
  footer,
  children,
  modal = true,
  closable = true,
  showCloseIcon = true,
  closeOnEscape = false,
  dismissableMask = false,
  blockScroll = false,
  baseZIndex,
  appendTo,
  className,
  style,
  id,
  focusOnShow = true,
}: UDialogProps): React.ReactNode {
  const { cx } = useComponentBase({ componentName: "dialog", styleModule: dialogStyleModule });
  const [dialogId] = React.useState(() => id ?? `u-dialog-${++dialogIdCounter}`);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const maskRef = React.useRef<HTMLDivElement>(null);
  const focusElementOnHide = React.useRef<HTMLElement | null>(null);
  const { set: setZIndex, clear: clearZIndex } = useZIndex();
  const { register: registerScrollLock, unregister: unregisterScrollLock } = useScrollLock();

  const isCloseOnEscape = closable && closeOnEscape && visible;
  const displayOrder = useDisplayOrder("dialog", isCloseOnEscape);

  const onClose = (event?: React.SyntheticEvent) => {
    onHide(event);
  };

  useGlobalEscapeKey({
    callback: (event) => onClose(event as unknown as React.SyntheticEvent),
    when: isCloseOnEscape,
    priority: [ESCAPE_PRIORITIES.DIALOG, displayOrder],
  });

  React.useEffect(() => {
    if (visible) {
      focusElementOnHide.current = document.activeElement as HTMLElement | null;
      setZIndex("modal", maskRef.current, baseZIndex);
      if (blockScroll) registerScrollLock(dialogId);
    } else {
      clearZIndex(maskRef.current);
      if (blockScroll) unregisterScrollLock(dialogId);
      if (focusElementOnHide.current) {
        focusElementOnHide.current.focus();
        focusElementOnHide.current = null;
      }
    }
    return () => {
      if (blockScroll) unregisterScrollLock(dialogId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useMotion(dialogRef, visible, { name: "u-dialog" });

  if (!visible) return null;

  const headerId = `${dialogId}_header`;
  const contentId = `${dialogId}_content`;

  const closeIcon = closable && showCloseIcon && (
    <button
      type="button"
      aria-label="Close"
      className={cx("closeButton")}
      onClick={onClose}
    >
      <UTimesIcon className={cx("closeButtonIcon")} />
    </button>
  );

  const onMaskPointerUp = (event: React.PointerEvent) => {
    if (dismissableMask && modal && maskRef.current === event.target) {
      onClose(event);
    }
  };

  const rootElement = (
    <div ref={maskRef} className={cx("mask")} onPointerUp={onMaskPointerUp}>
      <FocusTrap autoFocus={focusOnShow}>
        <div
          ref={dialogRef}
          id={dialogId}
          role="dialog"
          aria-modal={modal}
          aria-labelledby={headerId}
          aria-describedby={contentId}
          className={[cx("root"), className].filter(Boolean).join(" ")}
          style={style}
        >
          {header !== undefined && (
            <div className={cx("header")}>
              <div id={headerId} className={cx("headerTitle")}>{header}</div>
              <div className={cx("headerIcons")}>{closeIcon}</div>
            </div>
          )}
          <div id={contentId} className={cx("content")}>{children}</div>
          {footer !== undefined && <div className={cx("footer")}>{footer}</div>}
        </div>
      </FocusTrap>
    </div>
  );

  return <Portal element={rootElement} appendTo={appendTo} visible />;
}
```

**Explicit boundary** (Global Constraints, spec §15): `UDialogProps` has no `draggable`, `resizable`, or `maximizable` fields; no drag/resize event handlers are wired; no maximize-toggle UI is rendered. This is not an oversight — it is the deliberately-scoped Phase 3 boundary.

- [ ] **Step 6: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/react test`
Expected: PASS (all 6 assertions, including the negative draggable/resizable/maximizable test and the type-check line)

- [ ] **Step 7: Create barrel, update root index**

`packages/react/src/dialog/index.ts`:

```typescript
export { UDialog } from "./dialog";
export type { UDialogProps } from "./dialog";
```

Update `packages/react/src/index.ts`, adding `export * from "./dialog";`.

- [ ] **Step 8: Add provenance entries**

Append to `docs/architecture/provenance/react.json`:

```json
[
  {
    "originalPath": "components/lib/dialog/Dialog.js",
    "ultimateDestination": "packages/react/src/dialog/dialog.tsx",
    "modificationStatus": "adapted",
    "modificationDescription": "Verified upstream (Dialog.js, 717 lines, full read): controlled via visible/onHide, already-correct aria-labelledby/aria-describedby/aria-modal/role='dialog' wiring (preserved verbatim, not a gap), composes FocusTrap+CSSTransition(->createMotion here)+Portal directly in its own render body matching the no-shared-orchestration-service pattern already proven by Angular's UDialog (ADR-020). Focus-return-on-close preserved (both frameworks independently converged on this fix). Explicit boundary (spec §15): draggable/resizable/maximizable behavior verified present upstream but NOT implemented here — no such props, handlers, or UI exist on this component in Phase 3, per an explicit, separately-tracked scope decision. document.primeDialogParams global-mutation scroll-blocking replaced by react-core's private useScrollLock registry (Task 9)."
  },
  {
    "originalPath": "components/lib/dialog/DialogBase.js",
    "ultimateDestination": "packages/react/src/dialog/dialog-style.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Verified upstream classes/css shape, .p-*->.u-* renamed, draggable/resizable/maximizable-specific class slots omitted since those features are not implemented (spec §15)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react/src/dialog/dialog.spec.tsx",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test — no PrimeReact-authored test file exists for Dialog (verified absent). Includes an explicit negative regression test asserting no draggable/resizable/maximizable props/UI exist (spec §23, §33's explicit requirement), and a focus-return-on-close test."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react/src/dialog/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 9: Commit**

```bash
git add packages/react/src/dialog/ packages/react/src/index.ts docs/architecture/provenance/react.json
git commit -m "feat(react): add UDialog component (no draggable/resizable/maximizable per Phase 3 scope)"
```

---

## Task 18: `UMenu`

**Files:**

- Create: `packages/react/src/menu/menu.tsx`
- Create: `packages/react/src/menu/menu.spec.tsx`
- Create: `packages/react/src/menu/menu-style.ts`
- Create: `packages/react/src/menu/index.ts`
- Modify: `packages/react/src/index.ts`

**Interfaces:**

- Consumes: `useComponentBase` (Task 3, 11), `Portal` (Task 5), `useOverlayListener` (Task 5), `useGlobalEscapeKey`/`useDisplayOrder`/`ESCAPE_PRIORITIES` (Task 6), `useZIndex` (Task 7), `useMotion` (Task 10).
- Produces: `UMenu` — function component. Props: `model: UMenuItem[]` (required), `popup?: boolean` (default `false`), `popupAlignment?: 'left' | 'right'`, `id?: string`, `ariaLabel?: string`, `ariaLabelledBy?: string`, `className?: string`, `style?: React.CSSProperties`, `baseZIndex?: number`, `appendTo?: HTMLElement | (() => HTMLElement)`, `closeOnEscape?: boolean` (default `true`, matching verified upstream default), `onShow?: () => void`, `onHide?: () => void`. Imperative ref handle: `{ toggle, show, hide }` via `React.forwardRef`. **No `Tooltip` dependency** (verified negative finding, spec §6 — do not import `UTooltip` here). Uses `aria-activedescendant` virtual focus (spec §10 — do not implement literal DOM focus movement).

- [ ] **Step 1: Extract `menu` source**

Run: `node scripts/provenance/extract-primereact-source.mjs .vendor-cache/primereact-10.9.9.tar.gz menu .vendor-extracted/react/menu`

Read `.vendor-extracted/react/menu/Menu.js`, `MenuBase.js`, `menu.d.ts` in full (already read in full during the gate — the dual popup/inline mode, `aria-activedescendant` on the `<ul>`, the full keyboard-handler switch, disabled-item filtering, focus restoration on Escape/Alt+ArrowUp, no Tooltip import, no FocusTrap dependency).

- [ ] **Step 2: Write the failing tests**

Create `packages/react/src/menu/menu.spec.tsx`:

```typescript
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UMenu, type UMenuItem } from "./menu";

const model: UMenuItem[] = [
  { label: "New", command: vi.fn() },
  { label: "Open", command: vi.fn() },
  { separator: true },
  { label: "Disabled", disabled: true, command: vi.fn() },
];

describe("UMenu (inline mode)", () => {
  it("renders role='menu' with a menuitem per model entry (excluding separators)", () => {
    render(<UMenu model={model} />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("uses aria-activedescendant on the list, not literal focus, for keyboard navigation", () => {
    render(<UMenu model={model} />);
    const list = screen.getByRole("menu");
    fireEvent.focus(list);
    fireEvent.keyDown(list, { code: "ArrowDown" });
    const activeId = list.getAttribute("aria-activedescendant");
    expect(activeId).toBeTruthy();
    // Real DOM focus must remain on the <ul>, not move to an <li>:
    expect(document.activeElement).toBe(list);
  });

  it("ArrowDown/ArrowUp/Home/End navigate, skipping disabled items", () => {
    render(<UMenu model={model} />);
    const list = screen.getByRole("menu");
    fireEvent.focus(list);
    fireEvent.keyDown(list, { code: "End" });
    const items = screen.getAllByRole("menuitem");
    const activeId = list.getAttribute("aria-activedescendant");
    // Last non-disabled item is "Open" (index 1 of the 3 rendered menuitems, since
    // "Disabled" is filtered out of keyboard navigation):
    expect(items.find((el) => el.id === activeId)?.textContent).toContain("Open");
  });

  it("Enter invokes the focused item's command callback", () => {
    const onCommand = vi.fn();
    render(<UMenu model={[{ label: "Action", command: onCommand }]} />);
    const list = screen.getByRole("menu");
    fireEvent.focus(list);
    fireEvent.keyDown(list, { code: "Home" });
    fireEvent.keyDown(list, { code: "Enter" });
    expect(onCommand).toHaveBeenCalledOnce();
  });

  it("does not import or render Tooltip anywhere", () => {
    const { container } = render(<UMenu model={model} />);
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });
});

describe("UMenu (popup mode)", () => {
  it("is not rendered until toggled via the imperative ref, then dismisses on outside click", async () => {
    const ref = React.createRef<{ toggle: (e: React.SyntheticEvent) => void }>();
    render(
      <>
        <button
          onClick={(e) => ref.current?.toggle(e)}
        >
          Open menu
        </button>
        <UMenu ref={ref} model={model} popup />
      </>
    );
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(screen.getByText("Open menu"));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `pnpm --filter @ultimate/react test`
Expected: FAIL — `menu.tsx` does not exist yet.

- [ ] **Step 4: Write `menu-style.ts`**

Create `packages/react/src/menu/menu-style.ts`:

```typescript
import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-menu-overlay { position: absolute; top: -9999px; left: -9999px; }
.u-menu ul { margin: 0; padding: 0; list-style: none; }
.u-menu .u-menuitem-link { cursor: pointer; display: flex; align-items: center; text-decoration: none; }
`;

const classes = {
  root: (params: { popup?: boolean } = {}) => ["u-menu u-component", { "u-menu-overlay": params.popup }],
  menu: "u-menu-list",
  menuitem: (params: { focused?: boolean } = {}) => ["u-menuitem", { "u-focus": params.focused }],
  content: "u-menuitem-content",
  action: "u-menuitem-link",
  label: "u-menuitem-text",
  icon: "u-menuitem-icon",
  separator: "u-menu-separator",
};

export const menuStyleModule: StyleModule = { css, classes };
```

- [ ] **Step 5: Write `menu.tsx`**

Create `packages/react/src/menu/menu.tsx`:

```typescript
import * as React from "react";
import {
  useComponentBase,
  Portal,
  useOverlayListener,
  useGlobalEscapeKey,
  useDisplayOrder,
  ESCAPE_PRIORITIES,
  useZIndex,
  useMotion,
} from "@ultimate/react-core";
import { menuStyleModule } from "./menu-style";

export interface UMenuItem {
  label?: string;
  icon?: React.ReactNode;
  command?: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
  disabled?: boolean;
  separator?: boolean;
  url?: string;
  items?: UMenuItem[];
}

export interface UMenuProps {
  model: UMenuItem[];
  popup?: boolean;
  popupAlignment?: "left" | "right";
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  className?: string;
  style?: React.CSSProperties;
  baseZIndex?: number;
  appendTo?: HTMLElement | (() => HTMLElement);
  closeOnEscape?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

export interface UMenuHandle {
  toggle: (event: React.SyntheticEvent) => void;
  show: (event: React.SyntheticEvent) => void;
  hide: (event?: React.SyntheticEvent) => void;
}

let menuIdCounter = 0;

// Ultimate-owned stable data-attribute convention, independent of any passthrough
// system (spec §10 — PrimeReact's own data-pc-* selectors are passthrough-derived
// and not ported since pt is excluded).
const MENUITEM_ATTR = "data-u-menuitem";
const DISABLED_ATTR = "data-u-disabled";
const MENUITEM_SELECTOR = `li[${MENUITEM_ATTR}][${DISABLED_ATTR}="false"]`;

export const UMenu = React.forwardRef<UMenuHandle, UMenuProps>(function UMenu(
  {
    model,
    popup = false,
    popupAlignment = "left",
    id,
    ariaLabel,
    ariaLabelledBy,
    className,
    style,
    baseZIndex,
    appendTo,
    closeOnEscape = true,
    onShow,
    onHide,
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "menu", styleModule: menuStyleModule });
  const [menuId] = React.useState(() => id ?? `u-menu-${++menuIdCounter}`);
  const [visible, setVisible] = React.useState(!popup);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [focused, setFocused] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const targetRef = React.useRef<HTMLElement | null>(null);
  const { set: setZIndex, clear: clearZIndex } = useZIndex();

  const isCloseOnEscape = !!(visible && popup && closeOnEscape);
  const displayOrder = useDisplayOrder("menu", isCloseOnEscape);

  const hide = React.useCallback(
    (event?: React.SyntheticEvent) => {
      if (event) targetRef.current = event.currentTarget as HTMLElement;
      setVisible(false);
      onHide?.();
    },
    [onHide]
  );

  const show = React.useCallback(
    (event: React.SyntheticEvent) => {
      targetRef.current = event.currentTarget as HTMLElement;
      setVisible(true);
      onShow?.();
    },
    [onShow]
  );

  const toggle = React.useCallback(
    (event: React.SyntheticEvent) => {
      if (!popup) return;
      visible ? hide(event) : show(event);
    },
    [popup, visible, hide, show]
  );

  React.useImperativeHandle(ref, () => ({ toggle, show, hide }));

  useGlobalEscapeKey({
    callback: () => hide(),
    when: isCloseOnEscape,
    priority: [ESCAPE_PRIORITIES.MENU, displayOrder],
  });

  const [bindOverlay, unbindOverlay] = useOverlayListener({
    target: targetRef as React.RefObject<HTMLElement>,
    overlay: menuRef,
    listener: (_event, meta) => {
      if (meta.valid && meta.type === "outside") {
        hide();
        setFocusedId(null);
      }
    },
    when: visible && popup,
  });

  React.useEffect(() => {
    if (visible && popup) {
      setZIndex("menu", menuRef.current, baseZIndex);
      bindOverlay();
    } else {
      clearZIndex(menuRef.current);
      unbindOverlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, popup]);

  useMotion(menuRef, visible, { name: "u-menu" });

  const getMenuItemEls = React.useCallback((): HTMLLIElement[] => {
    return listRef.current ? [...listRef.current.querySelectorAll<HTMLLIElement>(MENUITEM_SELECTOR)] : [];
  }, []);

  const changeFocusedIndex = (index: number) => {
    const items = getMenuItemEls();
    const clamped = index >= items.length ? items.length - 1 : index < 0 ? 0 : index;
    if (clamped >= 0 && items[clamped]) setFocusedId(items[clamped].id);
  };

  const findCurrentIndex = () => getMenuItemEls().findIndex((el) => el.id === focusedId);

  const onListFocus = () => {
    setFocused(true);
    if (focusedId === null) changeFocusedIndex(0);
  };

  const onListBlur = () => {
    setFocused(false);
    setFocusedId(null);
  };

  const invokeFocused = (event: React.SyntheticEvent) => {
    const items = getMenuItemEls();
    const current = items.find((el) => el.id === focusedId);
    const anchor = current?.querySelector<HTMLAnchorElement>("a");
    (anchor ?? current)?.click();
    event.preventDefault();
  };

  const onListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    switch (event.code) {
      case "ArrowDown":
        changeFocusedIndex(findCurrentIndex() + 1);
        event.preventDefault();
        break;
      case "ArrowUp":
        if (event.altKey && popup) {
          targetRef.current?.focus();
          hide();
        } else {
          changeFocusedIndex(findCurrentIndex() - 1);
        }
        event.preventDefault();
        break;
      case "Home":
        changeFocusedIndex(0);
        event.preventDefault();
        break;
      case "End":
        changeFocusedIndex(getMenuItemEls().length - 1);
        event.preventDefault();
        break;
      case "Enter":
      case "NumpadEnter":
      case "Space":
        invokeFocused(event);
        break;
      case "Escape":
        if (popup) {
          targetRef.current?.focus();
          hide();
        }
        break;
      case "Tab":
        if (popup && visible) hide();
        break;
      default:
        break;
    }
  };

  const onItemClick = (event: React.MouseEvent, item: UMenuItem, itemId: string) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    item.command?.({ originalEvent: event, item });
    if (popup) hide();
    if (!popup) setFocusedId(itemId);
    if (!item.url) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const renderItem = (item: UMenuItem, index: number): React.ReactNode => {
    if (item.visible === false) return null;
    if (item.separator) {
      return <li key={`${menuId}_sep_${index}`} className={cx("separator")} role="separator" />;
    }
    const itemId = `${menuId}_${index}`;
    return (
      <li
        key={itemId}
        id={itemId}
        {...{ [MENUITEM_ATTR]: "" }}
        {...{ [DISABLED_ATTR]: String(!!item.disabled) }}
        role="menuitem"
        aria-disabled={item.disabled}
        aria-label={item.label}
        className={cx("menuitem", { focused: focusedId === itemId })}
        onClick={(e) => onItemClick(e, item, itemId)}
      >
        <div className={cx("content")}>
          <a href={item.url ?? "#"} className={cx("action")} tabIndex={-1}>
            {item.icon && <span className={cx("icon")}>{item.icon}</span>}
            {item.label && <span className={cx("label")}>{item.label}</span>}
          </a>
        </div>
      </li>
    );
  };

  if (!visible) return null;

  const menuElement = (
    <div ref={menuRef} id={popup ? undefined : menuId} className={[cx("root", { popup }), className].filter(Boolean).join(" ")} style={style}>
      <ul
        ref={listRef}
        id={`${menuId}_list`}
        className={cx("menu")}
        role="menu"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-activedescendant={focused ? focusedId ?? undefined : undefined}
        onFocus={onListFocus}
        onBlur={onListBlur}
        onKeyDown={onListKeyDown}
      >
        {model.map((item, index) => renderItem(item, index))}
      </ul>
    </div>
  );

  return popup ? <Portal element={menuElement} appendTo={appendTo} visible /> : menuElement;
});
```

**Verified negative finding, preserved**: no `Tooltip` import anywhere in this file (spec §6). **Focus model, preserved**: `aria-activedescendant` on the `<ul>`, no `.focus()` call on any `<li>` (spec §10). **Selector strategy, per spec §10**: `data-u-menuitem`/`data-u-disabled` — Ultimate-owned, not derived from any passthrough resolver.

- [ ] **Step 6: Run the tests, verify they pass**

Run: `pnpm --filter @ultimate/react test`
Expected: PASS (all assertions across both `describe` blocks)

- [ ] **Step 7: Create barrel, update root index**

`packages/react/src/menu/index.ts`:

```typescript
export { UMenu } from "./menu";
export type { UMenuProps, UMenuItem, UMenuHandle } from "./menu";
```

Update `packages/react/src/index.ts`, adding `export * from "./menu";`.

- [ ] **Step 8: Add provenance entries**

Append to `docs/architecture/provenance/react.json`:

```json
[
  {
    "originalPath": "components/lib/menu/Menu.js",
    "ultimateDestination": "packages/react/src/menu/menu.tsx",
    "modificationStatus": "adapted",
    "modificationDescription": "Verified upstream (Menu.js, 518 lines, full read; MenuBase.js full read): dual-mode (popup:false inline role='menu', popup:true Portal-rendered overlay via show/hide/toggle), model-driven, aria-activedescendant virtual focus (line 476, no .focus() call on any <li> — verified and preserved, intentional divergence from Angular's UMenu literal-DOM-focus approach per spec §10, ADR-006), full keyboard set (ArrowDown/Up/Home/End/Enter/Space/Escape/Tab), disabled-item filtering. Verified negative finding, confirmed and preserved: Menu.js does NOT import Tooltip (contrary to an initial, since-withdrawn assumption drawn from an unrelated Angular/PrimeNG lesson). PrimeReact's data-pc-*-attribute passthrough-derived selectors NOT ported (pt excluded per spec §7) — replaced with an Ultimate-owned data-u-menuitem/data-u-disabled convention (spec §10)."
  },
  {
    "originalPath": "components/lib/menu/MenuBase.js",
    "ultimateDestination": "packages/react/src/menu/menu-style.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Verified upstream classes/css shape, .p-*->.u-* renamed."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react/src/menu/menu.spec.tsx",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test — no PrimeReact-authored test file exists for Menu (verified absent). Includes explicit regression coverage for the aria-activedescendant virtual-focus contract and the verified no-Tooltip-dependency finding."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/react/src/menu/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent."
  }
]
```

- [ ] **Step 9: Commit**

```bash
git add packages/react/src/menu/ packages/react/src/index.ts docs/architecture/provenance/react.json
git commit -m "feat(react): add UMenu component with aria-activedescendant focus model"
```

---

## Task 19: `sideEffects` verification and tree-shaking validation

**Context:** the spec explicitly tightens this requirement beyond a simple bundler spot-check (§3, Required Edit 1): a package-metadata decision (`sideEffects: false`) is distinct from measured bundler behavior. This task runs the full required validation sequence — production build, consumer-like import from built `dist/` output, actual component rendering, confirmed real style injection, confirmed no dead-code elimination of required modules — exercised via both direct/subpath import and barrel import, for both packages.

**Files:**

- Modify: `packages/react-core/package.json` (confirm or correct `sideEffects`)
- Modify: `packages/react/package.json` (confirm or correct `sideEffects`)
- Create: `scripts/provenance/verify-tree-shaking-react.mjs`

**Interfaces:**

- Consumes: built `dist/` output of both packages (requires Tasks 3-18 complete and both packages built).

- [ ] **Step 1: Build both packages**

Run: `pnpm --filter @ultimate/react-core build && pnpm --filter @ultimate/react build`
Expected: both succeed. `react-core/dist/` has a single `index.mjs` + `index.d.mts`. `react/dist/` has `index.mjs` plus `button/index.mjs`, `checkbox/index.mjs`, `dialog/index.mjs`, `menu/index.mjs`, `tooltip/index.mjs` (genuine multi-entry output, per Task 13's `tsup.config.ts`).

- [ ] **Step 2: Write `verify-tree-shaking-react.mjs`**

Create `scripts/provenance/verify-tree-shaking-react.mjs`:

```javascript
#!/usr/bin/env node
// scripts/provenance/verify-tree-shaking-react.mjs
//
// Confirms, via a real esbuild production bundle against the actual built
// dist/ output (not src/), that:
//   1. Importing only UButton from a direct subpath (@ultimate/react/button)
//      does not pull in UDialog's overlay/focus-trap/motion code.
//   2. Importing only UButton from the barrel (@ultimate/react) does not
//      pull in UDialog's code either — a barrel-specific regression the
//      subpath check alone would not catch.
//   3. No required style-registration module is eliminated as dead code
//      under sideEffects:false (checked structurally here; Step 4 of the
//      plan task confirms actual runtime style injection via Vitest+RTL
//      against this same built output, which this script cannot execute).
//
// This validates measured bundler behavior against the package-metadata
// decision already made in package.json — see the plan's spec §3 (tightened
// Required Edit 1): these are two distinct claims, not one.

import { build } from "esbuild";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const workDir = mkdtempSync(join(tmpdir(), "verify-tree-shaking-react-"));

async function checkImport(label, importStatement) {
  const entryFile = join(workDir, `${label}.mjs`);
  writeFileSync(entryFile, `${importStatement}\nconsole.log(typeof UButton);\n`);

  const result = await build({
    entryPoints: [entryFile],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    absWorkingDir: process.cwd(),
  });

  const bundleText = result.outputFiles[0].text;
  const leaked = bundleText.includes("UDialog") || bundleText.includes("u-dialog");

  if (leaked) {
    console.error(
      `[verify-tree-shaking-react] FAIL (${label}): importing only UButton pulled in Dialog-related code`
    );
    return false;
  }
  console.log(`[verify-tree-shaking-react] OK (${label}): UButton import does not pull in UDialog`);
  return true;
}

try {
  const subpathOk = await checkImport(
    "subpath-import",
    `import { UButton } from "@ultimate/react/button";`
  );
  const barrelOk = await checkImport(
    "barrel-import",
    `import { UButton } from "@ultimate/react";`
  );

  console.log(
    "[verify-tree-shaking-react] MANUAL/AUTOMATED CHECK REQUIRED (see plan Task 19 Step 4): " +
      "run a Vitest+RTL test against the built dist/ output (not src/) confirming UButton's " +
      "style is actually registered with react-core's reactCoreStyleSheet at runtime under " +
      "each import path — this script's static bundle inspection confirms dead-code " +
      "elimination structurally but cannot execute React rendering or effects."
  );

  if (!subpathOk || !barrelOk) process.exit(1);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
```

- [ ] **Step 3: Run the script against the built `dist/` output**

Run: `node scripts/provenance/verify-tree-shaking-react.mjs`
Expected: both `subpath-import` and `barrel-import` checks PASS on the static bundle-content check. Record the result — do not proceed to Step 5 until both pass.

- [ ] **Step 4: Confirm real style registration under a consumer-like import from built `dist/`**

Create a throwaway (not committed) Vitest test file at `packages/react/dist-consumer.spec.tsx` — **importing from the built `dist/` output specifically, not `src/`** — to prove the consumer-like-import requirement:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { UButton } from "./dist/button/index.mjs";

describe("consumer-like import from built dist/ (subpath)", () => {
  it("renders and registers a real <style> element", () => {
    document.head.querySelectorAll("style").forEach((el) => el.remove());
    render(<UButton label="Save" />);
    const matching = [...document.head.querySelectorAll("style")].filter((el) =>
      el.textContent?.includes(".u-button")
    );
    expect(matching.length).toBeGreaterThan(0);
  });
});
```

Run: `pnpm --filter @ultimate/react exec vitest run dist-consumer.spec.tsx`
Expected: PASS — confirms style registration survives a real built-output import, not just the `src/`-level unit tests already passing since Task 11.

Repeat with a barrel import (`from "./dist/index.mjs"`) in a second throwaway file or a second `describe` block in the same file, confirming both import paths independently.

Delete both throwaway test files after confirming (`rm packages/react/dist-consumer.spec.tsx`) — this step's job is to produce a pass/fail verdict for Step 5's decision, not to leave a permanent test importing from `dist/` (the committed test suite continues testing against `src/`, per normal convention).

- [ ] **Step 5: Decide and set the final `sideEffects` value for both packages**

If Steps 3-4 all pass cleanly with `sideEffects: false` already set (as scaffolded in Tasks 3 and 13), the decision is confirmed — leave both `package.json` files as-is, no change needed.

If Step 3 or Step 4 fails for either package, correct that package's `sideEffects` field to:

```json
"sideEffects": ["**/react-style-sheet.*", "**/use-component-style.*"]
```

(or the exact glob matching the actual compiled style-registration module file names in `dist/`, confirmed by inspecting `dist/` structure from Step 1's build) — rebuild and re-run Steps 3-4 against the corrected configuration to confirm the fix actually works, don't assume it does.

- [ ] **Step 6: Re-run both packages' full test suites to confirm nothing regressed**

Run: `pnpm --filter @ultimate/react-core test && pnpm --filter @ultimate/react test`
Expected: PASS (all tests from Tasks 3-18)

- [ ] **Step 7: Commit**

```bash
git add packages/react-core/package.json packages/react/package.json scripts/provenance/verify-tree-shaking-react.mjs
git commit -m "chore(react): verify sideEffects configuration against measured bundler behavior

Confirms (or corrects) sideEffects:false via a real production build,
consumer-like import from built dist/ output, actual component rendering,
and confirmed style injection — exercised via both direct/subpath and
barrel import paths, per the spec's tightened Required Edit 1. The
package-metadata decision and the measured bundler behavior are
distinct claims; this task closes the gap between them."
```

---

## Task 20: Provenance documentation updates

**Files:**

- Modify: `docs/architecture/PROVENANCE.md` (PrimeReact entry)
- Modify: `docs/architecture/PACKAGE_ARCHITECTURE.md`
- Modify: `docs/architecture/DECISIONS.md` (new ADRs)
- Modify: `docs/architecture/ROADMAP.md` (Phase 3 row status; new Phase 2 follow-up recorded)
- Verify: `packages/react-core/README.md`, `packages/react/README.md` (created in Task 21 — this task only cross-references them, does not author them)

- [ ] **Step 1: Update the PrimeReact entry in `docs/architecture/PROVENANCE.md`**

Change the existing PrimeReact heading's `Modification status`, `Modification description`, `Date incorporated` fields from their current "not yet incorporated (Phase 0 — baseline pinned only)" placeholders to:

```markdown
- **Modification status:** incorporated (Phase 3) — foundation tier reimplemented with PrimeReact as design reference, not copied verbatim (Option B, same posture as Angular's ADR-018); Button/Checkbox/Dialog/Menu/Tooltip adapted with full Ultimate namespace rename (component names, CSS classes). Remaining ~111 source areas not classified this phase — see spec §30 for why a full inventory was deliberately not pre-committed.
- **Modification description:** see file-level manifests at `docs/architecture/provenance/react-core.json` and `docs/architecture/provenance/react.json` for per-file status.
- **Date incorporated:** [fill in actual date this task is executed]
```

- [ ] **Step 2: Update `docs/architecture/PACKAGE_ARCHITECTURE.md`**

Change the "Framework core packages" and "Framework component packages" bullet descriptions from describing `react-core`/`react` as reserved/future (currently: "`react-core`/`vue-core` remain reserved for Phase 3/4" and "`react`/`vue` remain reserved for Phase 3/4") to confirming `react-core`/`react` are now active, linking to their respective `README.md` files — matching exactly how the Phase 2 equivalent update phrased the `ng-core`/`ng` transition (`grep -n "ng-core.*active\|ng.*active" docs/architecture/PACKAGE_ARCHITECTURE.md` to find the exact precedent wording to mirror).

- [ ] **Step 3: Add new ADRs to `docs/architecture/DECISIONS.md`**

Append (continuing the numbering after the existing highest ADR — confirm the current highest number first via `grep -n "^## ADR" docs/architecture/DECISIONS.md | tail -3` before assigning numbers, since this plan was written before knowing whether any ADR was added between Phase 2's close and Phase 3's start):

```markdown
## ADR-024 — Option B: Ultimate-owned React base architecture

Status: Accepted (Phase 3 spec, confirmed by implementation). `react-core`'s `useComponentBase` is independently authored, informed by but not copied from PrimeReact's `ComponentBase` — the full `pt`/`ptm`/`ptmo` passthrough system (~150 lines of nested-key resolution in verified source) is excluded entirely. Same YAGNI justification that held across all 5 Angular components (ADR-018) — no demonstrated Ultimate consumer need, revisit only on real duplicate-pattern pressure from a later component.

## ADR-025 — React FocusTrap uses sentinel-span mechanism, not keydown interception

Status: Accepted (Phase 3 spec, confirmed by implementation). `react-core`'s `FocusTrap` reimplements verified PrimeReact behavior (a hidden sentinel-`<span>` pair bracketing children, `onFocus` handlers redirecting real DOM focus back into the trap) rather than Angular's `UFocusTrap` keydown-Tab-interception directive. Materially different, framework-native mechanism, not a bug — React's sentinel-span technique is already idiomatic (plain refs/JSX) and works regardless of dynamic content changes inside the trap.

## ADR-026 — React Escape handling is a centralized priority-queue mechanism, closing a known Angular gap

Status: Accepted (Phase 3 spec, confirmed by implementation). `react-core`'s `useGlobalEscapeKey`/`useDisplayOrder` reimplements verified PrimeReact behavior (a single shared `document` keydown listener gated by a two-level priority tuple, only the topmost most-recently-shown overlay's Escape handler fires) — independently authored, not ported. This is verifiably more correct than Angular's existing `UDialog` Escape handling, which ADR-020 documents as "a plain, unconditional `keydown.escape` host listener" with "no working multi-dialog stacking order" as an accepted, known limitation. Stating this contract for React does not retroactively fix Angular's implementation — that remains tracked separately.

## ADR-027 — React Menu uses `aria-activedescendant` virtual focus, diverging from Angular's literal-DOM-focus `UMenu`

Status: Accepted (Phase 3 spec, confirmed by implementation). Verified PrimeReact's real React `Menu.js` uses `aria-activedescendant` (the `<ul>` retains real DOM focus; `focusedOptionIndex` state tracks the "active" item), while `docs/architecture/COMPONENT_INVENTORY.md` documents Angular's `UMenu` as deliberately using literal DOM focus movement instead (a divergence from PrimeNG's own virtual-focus pattern). Given both frameworks' real upstream references disagree on this exact dimension, `react`'s `UMenu` preserves the verified PrimeReact React behavior for React specifically, per ADR-006 (frameworks are independently native) and the principle that cross-framework consistency belongs at the behavior/contract level, not the mechanism level.

## ADR-028 — React motion uses `@ultimate/uix-motion`'s `createMotion`, no `react-transition-group` dependency

Status: Accepted (Phase 3 spec, confirmed by implementation). Verified PrimeReact's `CSSTransition.js` wraps the real npm `react-transition-group` package. `react-core`'s `useMotion` instead calls the already-built, framework-agnostic, Promise-based `@ultimate/uix-motion`'s `createMotion(element, options).enter()/.leave()` from a `useEffect` — no functional gap was found during the Real-Source Verification Gate that would require the declarative wrapper PrimeReact needed for its own React implementation. No new runtime dependency added.

## ADR-029 — React styling gets a working `StyleSheet` DOM-injection adapter from day one; a real gap found on the Angular side is tracked separately, not fixed by Phase 3

Status: Accepted (Phase 3 spec, confirmed by implementation). The Real-Source Verification Gate found that `@ultimate/uix-styled`'s `StyleSheet.createStyleElement` is a documented no-op in the base class unless subclassed, and Angular's `ngCoreStyleSheet` never overrides it — meaning Angular's current style-registration path never injects a real `<style>` element into the DOM, a previously-undocumented functional gap. `react-core`'s `ReactStyleSheet` subclasses `StyleSheet`, delegating to the already-built `@ultimate/uix-utils/dom`'s `createStyleElement` — React ships with working style injection from its first commit. Per explicit decision during Phase 3's brainstorming, this ADR does NOT fix the Angular-side gap — that is recorded as a new Phase 2 follow-up (see `docs/architecture/ROADMAP.md`), kept separately scoped rather than silently absorbed into Phase 3.

## ADR-030 — `UDialog` does not implement draggable, resizable, or maximizable behavior in Phase 3

Status: Accepted (Phase 3 spec, confirmed by implementation). Verified PrimeReact's real `Dialog.js` supports draggable/resizable/maximizable behavior — a materially larger feature surface than Angular's already-shipped `UDialog`, which has none of these. Phase 3's `UDialog` deliberately does not include them: no such props exist on `UDialogProps`, no drag/resize handlers are wired, no maximize-toggle UI is rendered. Not an oversight — a firm, explicitly-scoped boundary (spec §15), with a dedicated negative regression test (`packages/react/src/dialog/dialog.spec.tsx`) guarding against silent scope creep. Revisit only via a separately approved future scope decision.

## ADR-031 — `URipple` is not built in Phase 3

Status: Accepted (Phase 3 spec, confirmed by implementation). Verified PrimeReact's `Button`/`Dialog`/`Menu` all import and render `Ripple` upstream. Phase 3's `UButton`/`UDialog`/`UMenu` render without a ripple effect — `URipple` is not a Phase 3 proof-set component, and no ad-hoc ripple implementation was folded into any individual component. Matches Angular's own Phase 2 precedent exactly: `URipple` was built as its own standalone primitive (`packages/ng/src/ripple`), not embedded per-component. A future `URipple` for React, if built, gets its own scope, provenance, and tests — not inherited from this phase.
```

- [ ] **Step 4: Record the new Phase 2 follow-up and update the Phase 3 roadmap row in `docs/architecture/ROADMAP.md`**

Change the Phase 3 row's status from `Not started` to `Complete` (or the repo's established terminology for a closed phase — check how Phase 2's row was updated when it closed, via `git log -p -- docs/architecture/ROADMAP.md` filtered to the Phase 2 closure commit, and match that exact wording/format).

If `ROADMAP.md` has an existing "Phase 2 follow-ups" list (per this plan's earlier reference to "the five already listed in `docs/architecture/ROADMAP.md`"), append a sixth entry:

```markdown
6. `ngCoreStyleSheet` never overrides `StyleSheet.createStyleElement` — no `<style>` element is ever actually injected into the DOM by Angular's current style-registration path (only metadata dedup occurs). `@ultimate/uix-utils/dom`'s `createStyleElement` already provides the fix — `react-core`'s `ReactStyleSheet` (Phase 3, Task 11) demonstrates the exact pattern to apply. Discovered during Phase 3 research; distinct from the pre-existing five follow-ups above.
```

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/PROVENANCE.md docs/architecture/PACKAGE_ARCHITECTURE.md docs/architecture/DECISIONS.md docs/architecture/ROADMAP.md
git commit -m "docs(react): update provenance, package architecture, ADRs, and roadmap for Phase 3 close"
```

---

## Task 21: README documentation and full clean-checkout verification

**Files:**

- Create: `packages/react-core/README.md`
- Create: `packages/react/README.md`

**Interfaces:**

- Consumes: everything built in Tasks 3-20.

- [ ] **Step 1: Write `packages/react-core/README.md`**

Following the exact descriptive depth and structure of `packages/ng-core/README.md` (architecture summary, module list with one paragraph each, usage example, dependency list) — read it first (`cat packages/ng-core/README.md`) as the structural template, then write the React equivalent covering: the Option B base architecture (`useComponentBase`), the shared hooks, overlay infrastructure (`Portal`, `useOverlayListener`), the priority-aware Escape mechanism (explicitly noting it's more correct than Angular's current implementation, cross-referencing ADR-020/ADR-026), `useZIndex`, `FocusTrap` (explicitly contrasted with Angular's directive-based one), `useScrollLock`, `useMotion` (explicitly noting no `react-transition-group` dependency), the `ReactStyleSheet` adapter (explicitly noting the Angular-side gap it closes for React specifically, cross-referencing ADR-029), and the 5 icon components. Include a "Status: unstable (pre-1.0)" line matching `ng-core`'s own header. Document all approved intentional deviations (spec §32) in this file's content, not only in the spec — per spec §33's exit criterion.

- [ ] **Step 2: Write `packages/react/README.md`**

Following `packages/ng/README.md`'s structure — cover each of the 5 components (`UButton`, `UCheckbox`, `UDialog`, `UMenu`, `UTooltip`) with a short description, their key props, and one usage example each. For `UTooltip`, document the ref-target-primitive-plus-prop-sugar API explicitly. For `UDialog`, explicitly state the draggable/resizable/maximizable non-goal (matching ADR-030). For `UMenu`, explicitly state the `aria-activedescendant` focus model and its intentional divergence from Angular's `UMenu` (matching ADR-027). Include the dependency list (`@ultimate/react-core`, `@ultimate/uix-*`, peer deps on `react`/`react-dom`).

- [ ] **Step 3: Full clean-checkout build and test verification**

Run, in order, from repo root:

```bash
pnpm install
pnpm --filter @ultimate/react-core build
pnpm --filter @ultimate/react-core test
pnpm --filter @ultimate/react-core typecheck
pnpm --filter @ultimate/react build
pnpm --filter @ultimate/react test
pnpm --filter @ultimate/react typecheck
```

Expected: every command succeeds with no errors.

- [ ] **Step 4: Run the extended `validate-provenance.mjs` check**

Run: `node scripts/provenance/validate-provenance.mjs` (or the repo's actual invocation — check `package.json` root scripts first)
Expected: PASS — every `.ts`/`.tsx` file under `packages/react-core/src/` and `packages/react/src/` has a corresponding entry in `docs/architecture/provenance/react-core.json`/`react.json` (Task 2's extension now actually exercised against real files for the first time).

- [ ] **Step 5: Run `validate-dependency-ceiling.mjs`**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs` (or actual invocation)
Expected: PASS — confirms zero `primereact`/`@primeuix/*` runtime dependency in either `package.json` (already-existing `WATCHED_PREFIXES` includes `"react"`, confirmed in Task 1's Global Constraints research — no script change was needed for this check).

- [ ] **Step 6: Run `validate-boundaries.mjs`**

Run: `node scripts/provenance/validate-boundaries.mjs` (or actual invocation)
Expected: PASS — confirms no framework-specific (React) import leaks into `packages/uix*`.

- [ ] **Step 7: Manually confirm the package.json dependency direction**

Run: `cat packages/react-core/package.json packages/react/package.json | grep -A5 '"dependencies"'`
Expected: `packages/react-core/package.json`'s `dependencies` never lists `@ultimate/react` (no reverse dependency); `packages/react/package.json`'s `dependencies` lists `@ultimate/react-core` (correct forward direction, matching spec §28's `react → react-core → uix-*` diagram).

- [ ] **Step 8: Update root workspace README or docs index if one exists, cross-referencing the two new packages**

Run: `grep -rn "ng-core\|@ultimate/ng" README.md docs/README.md 2>/dev/null` to find whether Angular's packages are cross-referenced from a root-level doc. If so, add the equivalent React entries there for consistency; if no such cross-reference convention exists, skip this step (do not invent a new convention speculatively).

- [ ] **Step 9: Final commit**

```bash
git add packages/react-core/README.md packages/react/README.md
git commit -m "docs(react): add react-core and react package READMEs, complete Phase 3 foundation"
```

- [ ] **Step 10: Report Phase 3 exit-criteria status against spec §33**

Do not mark this task complete until each checkbox in the approved spec's §33 Exit Criteria has been explicitly walked through against what was actually built in Tasks 1-21, and any gap is reported to the user rather than silently marked done. In particular, confirm explicitly: the negative Dialog-feature-boundary test (Task 17) passes, the `aria-describedby` additive/owned-ID-only-cleanup tests (Task 15) pass, and the `sideEffects` build-level validation (Task 19) produced a definitive pass/correct outcome, not an inconclusive one.

---

## Self-Review Notes

**1. Spec coverage:** every numbered spec section (§1-§34) maps to a task or a Global Constraint: §1-2 baseline/package architecture → Tasks 1, 3, 13; §3 build tooling → Tasks 3, 13, 19; §4 ownership model → threaded through every task's provenance entries; §5-6 proof-set/foundation deps → Task list itself, Global Constraints; §7 base architecture → Task 3, 11; §8 styling → Task 11; §9 Tooltip → Task 15; §10 Menu → Task 18; §11 Escape → Task 6; §12 z-index → Task 7; §13 overlay → Task 5; §14 FocusTrap → Task 8; §15-16 Dialog/scroll → Tasks 9, 17; §17 motion → Task 10; §18-19 Button/Checkbox → Tasks 14, 16; §20 forms → Global Constraints, Task 16; §21 cross-framework contracts → provenance entries throughout, ADRs in Task 20; §22 provenance → every task's Step N provenance entries, Task 20; §23 testing → every task's TDD steps; §24 consumer/build validation → Task 19, 21; §25 security → button/checkbox/tooltip render implementations avoid `dangerouslySetInnerHTML`/`innerHTML` (Tooltip's `content` is rendered via JSX text interpolation, not raw HTML — matches the spec's explicit preservation requirement); §26 accessibility → every component task's ARIA attributes plus dedicated tests; §27 React compatibility → Task 3/13's `peerDependencies`; §28 package boundaries → Task 21 Steps 5-7; §29 performance → Task 19, 21 (no unearned tree-shaking claim made — Step 3's script explicitly notes it checks structural bundling only, not real measured performance); §30 inventory → not applicable to implementation (a documentation-only spec section); §31 risks → mitigated structurally by TDD-per-task discipline; §32 intentional deviations → every one has a corresponding ADR in Task 20 and inline code comments in its originating task; §33 exit criteria → Task 21 Step 10; §34 decision record → matches the Task list 1:1.

**2. Placeholder scan:** no "TBD"/"TODO"/"implement later" found. Every code block has real, complete implementation content, not descriptions of what to write.

**3. Type consistency:** `useComponentBase({componentName, styleModule}) => {cx}` used identically across Tasks 3, 11, 14-18. `StyleModule` type defined once in Task 3, imported (not redefined) in every `*-style.ts` file. `useZIndex()` returns `{set, clear}` used identically in Tasks 16-18. `Portal` props (`element`, `appendTo`, `visible`) used identically in Tasks 15, 17, 18. `UMenuHandle`'s `{toggle, show, hide}` matches the Interfaces section's declared shape exactly. Fixed one real inconsistency during self-review: Task 14's original text referenced "Task 18" for the Tooltip-wiring follow-up before Task 18 was reassigned to `UMenu` during drafting — corrected to point at Task 15's own Step 9 (the task that actually performs that wiring), and the sideEffects-verification/provenance-docs task numbers were corrected from a first-draft placeholder of "Task 18"/"Task 19" to their final "Task 19"/"Task 20" positions once all five component tasks claimed Tasks 14-18.
