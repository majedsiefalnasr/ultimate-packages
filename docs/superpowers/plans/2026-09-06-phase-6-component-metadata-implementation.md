# Phase 6 — Component Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@ultimate/component-schema` (the `ComponentMetadata` contract + validator) and `@ultimate/component-metadata` (populated records for the closed proof set), implementing `docs/superpowers/specs/2026-09-06-phase-6-component-metadata-design.md` exactly — no schema redesign, no new categories, no runtime component behavior, no Phase 7/8/9 coupling.

**Spec:** `docs/superpowers/specs/2026-09-06-phase-6-component-metadata-design.md` (approved, passed formal Spec Review)

**Architecture:** Two from-scratch, framework-neutral, pure-types-and-data packages — no framework runtime dependency, matching `@ultimate/uix-data`'s own already-approved scaffold shape (`type: "module"`, `sideEffects: false`, `tsup` build, `vitest run --typecheck`, `tsc --noEmit`, per-concern `src/` subdirectories, `test/*.test.ts` + `test/*.test-d.ts` split). `@ultimate/component-metadata` depends on `@ultimate/component-schema` only; neither package is ever imported by `packages/{ng,react,vue}` at runtime (declarative/build-time artifact only, per spec §1/§8).

**Ground truth:** Every metadata record and every validator test in this plan is checked against the real, closed proof set — Button, Checkbox, Dialog, Menu, Tooltip, Paginator, Scroller, Table — across Angular, React, Vue. Confirmed this planning pass by direct source read:
- Button: no custom events in any framework (native click passthrough only) — the `events: []` empty-list case.
- Checkbox: `binary` boolean input (Angular `input(false, {transform: booleanAttribute})`); doc comment at `packages/ng/src/checkbox/checkbox.ts:29` explicitly confirms no `onChange`/`onFocus`/`onBlur` outputs exist in this component's real shipped surface — a genuinely-empty-events case distinct from Button's (Button never had events; Checkbox's spec/doc comment records an explicit decision not to add them yet).
- Dialog: real `onShow`/`onHide` Angular `output<void>()`s (`packages/ng/src/dialog/dialog.ts:180,182`) — a lifecycle-event case, structurally different from Table's state-change events (no payload, `void` type).
- Table: `sortFieldChange`/`onSort`/`sort` (Angular `output`/React `callback-prop`/Vue `emit`, all sharing one semantic id) — the richest event-divergence case, already the spec's own worked example (spec §12).
- All eight components' base-component layer exposes an identical `componentName`+`styleModule` pair (Angular `UBaseComponent`, React `useComponentBase`, Vue `createBaseComponent`) — confirmed directly for Button/Checkbox/Dialog/Table this pass, and known-established-once-and-reused per each framework's own foundation-phase closure for Menu/Tooltip/Paginator/Scroller.

**No architectural fork found while preparing this plan.** Every task below implements a concrete, already-resolved decision from the approved spec (§5/§5.1 versioning, §6 schema blocks, §6.1a description/guidance boundary, §9 generated-vs-guidance split, §10 provenance boundary, §13 validation rules) — no schema-level question remains open. If implementation surfaces a genuine contradiction between the spec and real source (e.g., a proof-set component whose real API cannot be represented by the approved shape), that is a **STOP and report `ARCHITECTURAL DECISION REQUIRED`** condition per the plan's own governance, not something a task should silently resolve by inventing a workaround.

## Global Constraints

- `@ultimate/component-schema` and `@ultimate/component-metadata` are the only two packages this plan creates, matching Blueprint §34's already-named split and the spec's own §4 package definitions. No third package is introduced.
- Neither package is added as a dependency of `packages/{ng,react,vue}` — verified by this plan's own Task 11 (package-boundary validation). These are tooling/knowledge artifacts, never a runtime dependency of the shipped component packages (spec §1, §8, §11).
- `docs/architecture/provenance/*.json` and `docs/architecture/COMPONENT_INVENTORY.md` are read-only ground truth for this plan — never modified. `provenanceRef` records reference into the former by path; `relationships.dependsOn`/`category` values are informed by the latter's existing judgment, never re-derived independently (spec §6.5, §6.6, §10).
- Metadata records in this plan cover exactly the closed proof set (8 components × up to 3 frameworks each = up to 24 per-framework API blocks, 8 top-level records) — not the full ~115-component `COMPONENT_INVENTORY.md` backlog (spec §1, explicitly out of scope).
- `metadataVersion` is a **positive integer starting at `1`** (never `0`, never a string) for every record authored in this plan (spec §5.1) — no record in this plan's initial population has a prior version to increment from. This exact phrasing — "positive integer starting at 1" — is used consistently everywhere in this plan; do not alternate with "non-negative" elsewhere.
- Every validator behavior in this plan traces to a specific spec §13 rule — no extra validation rule invented, no spec-mandated rule skipped.
- Match `@ultimate/uix-data`'s exact scaffold conventions (confirmed this planning pass by reading its real `package.json`/`tsconfig.json`/`vitest.config.ts`/directory layout): `type: "module"`, `sideEffects: false`, `main`/`module`/`types` pointing at `dist/index.mjs`/`dist/index.d.mts`, `exports["."]` triad, `scripts: {build: "tsup && node scripts/rename-dts.mjs", test: "vitest run --typecheck", typecheck: "tsc --noEmit"}`, `tsconfig.json` extending `../../tsconfig.base.json`, per-concern `src/` subdirectories, `test/*.test.ts` (runtime) + `test/*.test-d.ts` (type-level) split, a `package-exports.test.ts` verifying the barrel.
- Node/pnpm environment: bare `pnpm` fails on wrong node version in this environment; use `PATH=/Users/majedsiefalnasr/.nvm/versions/node/v24.15.0/bin:/Users/majedsiefalnasr/.dotfiles/node/.nvm/versions/node/v23.11.0/bin:/usr/bin:/bin pnpm ...` for every command.

---

## Task Group A — `@ultimate/component-schema` Foundation

### Task 1: Scaffold `@ultimate/component-schema` package

**Files:**
- Create: `packages/component-schema/package.json`
- Create: `packages/component-schema/tsconfig.json`
- Create: `packages/component-schema/vitest.config.ts`
- Create: `packages/component-schema/src/index.ts`
- Create: `packages/component-schema/scripts/rename-dts.mjs` (copy from `packages/uix-data/scripts/rename-dts.mjs` verbatim — read it first to confirm it's genuinely generic, not uix-data-specific)
- Test: `packages/component-schema/test/package-exports.test.ts`

**Interfaces:**
- Consumes: nothing (foundation package, matching `uix-data`'s own zero-dependency start)
- Produces: an installable, buildable, testable empty package with a barrel `src/index.ts` — consumed by every later task in this group

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-schema/test/package-exports.test.ts
import { describe, it, expect } from "vitest";
import * as ComponentSchema from "../src/index";

describe("@ultimate/component-schema package exports", () => {
  it("exports a defined module (barrel exists and is importable)", () => {
    expect(ComponentSchema).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: FAIL — package/workspace member does not exist yet

- [ ] **Step 3: Write minimal implementation**

Read `packages/uix-data/package.json`, `packages/uix-data/tsconfig.json`, `packages/uix-data/vitest.config.ts`, and `packages/uix-data/scripts/rename-dts.mjs` in full first — this task's files are near-verbatim copies with only `name`/`description` changed:

```json
// packages/component-schema/package.json
{
  "name": "@ultimate/component-schema",
  "version": "0.1.0",
  "description": "Versioned schema/contract and validator for Ultimate Platform component metadata (Phase 6).",
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
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup && node scripts/rename-dts.mjs",
    "test": "vitest run --typecheck",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "tsup": "^8.3.0",
    "typescript": "^5.9.3",
    "vitest": "^2.1.8"
  }
}
```

`tsconfig.json` and `vitest.config.ts`: identical shape to `uix-data`'s own (extends `../../tsconfig.base.json`; `test.include: ["test/**/*.test.ts"]`, `test.typecheck.include: ["test/**/*.test-d.ts"]`).

`src/index.ts`: an empty barrel (`export {};` placeholder), populated by Task 2 onward.

Add this package to the workspace's root `pnpm-workspace.yaml`/`tsconfig.json` project references if `uix-data` required an equivalent registration step when it was scaffolded — check `pnpm-workspace.yaml` for a `packages/*` glob (if already present, no edit needed; if package-by-package listing, add the new entry).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm install` (register the new workspace member), then `pnpm --filter @ultimate/component-schema test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-schema/
git commit -m "feat(component-schema): scaffold package"
```

---

### Task 2: `schemaVersion` constant and top-level `ComponentMetadata` identity block type

**Files:**
- Create: `packages/component-schema/src/version.ts`
- Create: `packages/component-schema/src/identity.ts`
- Modify: `packages/component-schema/src/index.ts`
- Test: `packages/component-schema/test/version.test.ts`
- Test: `packages/component-schema/test/identity.test-d.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `SCHEMA_VERSION: string` constant (spec §5); `ComponentIdentity` type covering `name`/`category`/`description`/`schemaVersion`/`metadataVersion`/`packages` (spec §6.1) — consumed by every later schema-block task and by Task 8 (validator)

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-schema/test/version.test.ts
import { describe, it, expect } from "vitest";
import { SCHEMA_VERSION } from "../src/version";

describe("SCHEMA_VERSION", () => {
  it("is a non-empty semver-shaped string", () => {
    expect(typeof SCHEMA_VERSION).toBe("string");
    expect(SCHEMA_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
```

```typescript
// packages/component-schema/test/identity.test-d.ts
import { expectTypeOf } from "vitest";
import type { ComponentIdentity } from "../src/identity";

// metadataVersion must be a number (spec §5.1), never a string — this is the
// exact type-level guard against the "semver-string" mistake the spec's own
// fix round corrected.
expectTypeOf<ComponentIdentity["metadataVersion"]>().toEqualTypeOf<number>();
expectTypeOf<ComponentIdentity["schemaVersion"]>().toEqualTypeOf<string>();
expectTypeOf<ComponentIdentity["packages"]>().toMatchTypeOf<{
  ng?: { packageName: string; sourcePath: string };
  react?: { packageName: string; sourcePath: string };
  vue?: { packageName: string; sourcePath: string };
}>();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: FAIL — `Cannot find module '../src/version'` / `'../src/identity'`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/component-schema/src/version.ts
export const SCHEMA_VERSION = "1.0.0";
```

```typescript
// packages/component-schema/src/identity.ts
export interface ComponentIdentity {
  name: string;
  category: string;
  description: string;
  schemaVersion: string;
  metadataVersion: number;
  packages: {
    ng?: { packageName: string; sourcePath: string };
    react?: { packageName: string; sourcePath: string };
    vue?: { packageName: string; sourcePath: string };
  };
}
```

Export both from `src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-schema/src/version.ts packages/component-schema/src/identity.ts packages/component-schema/src/index.ts packages/component-schema/test/version.test.ts packages/component-schema/test/identity.test-d.ts
git commit -m "feat(component-schema): add SCHEMA_VERSION and ComponentIdentity type"
```

---

### Task 3: Per-framework API block types (`PropFact`, `EventFact`)

**Files:**
- Create: `packages/component-schema/src/api.ts`
- Modify: `packages/component-schema/src/index.ts`
- Test: `packages/component-schema/test/api.test-d.ts`
- Test: `packages/component-schema/test/api.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `PropFact`, `EventFact`, `FrameworkApi` (`{props: PropFact[]; events: EventFact[]}`), `ComponentApi` (`{ng?, react?, vue?}: FrameworkApi`) types (spec §6.2) — consumed by Task 8 (validator) and Task 9-16 (metadata records)

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-schema/test/api.test-d.ts
import { expectTypeOf } from "vitest";
import type { PropFact, EventFact, ComponentApi } from "../src/api";

expectTypeOf<EventFact["mechanism"]>().toEqualTypeOf<"output" | "callback-prop" | "emit">();
expectTypeOf<PropFact["required"]>().toEqualTypeOf<boolean>();
// events/props are per-framework arrays, never a single unified list —
// the type-level guard against re-introducing a universal event name.
expectTypeOf<ComponentApi["ng"]>().toMatchTypeOf<
  { props: PropFact[]; events: EventFact[] } | undefined
>();
```

```typescript
// packages/component-schema/test/api.test.ts
import { describe, it, expect } from "vitest";
import type { EventFact } from "../src/api";

describe("EventFact — Table's sort-changed divergence (spec §12 worked example)", () => {
  it("represents the same semanticId with three different, non-unified frameworkName/mechanism pairs", () => {
    const ngEvent: EventFact = { semanticId: "sort-changed", frameworkName: "sortFieldChange", mechanism: "output" };
    const reactEvent: EventFact = { semanticId: "sort-changed", frameworkName: "onSort", mechanism: "callback-prop" };
    const vueEvent: EventFact = { semanticId: "sort-changed", frameworkName: "sort", mechanism: "emit" };
    expect(ngEvent.semanticId).toBe(reactEvent.semanticId);
    expect(ngEvent.semanticId).toBe(vueEvent.semanticId);
    expect(new Set([ngEvent.frameworkName, reactEvent.frameworkName, vueEvent.frameworkName]).size).toBe(3);
  });
});

describe("EventFact — Button's empty-events case", () => {
  it("permits an empty events array (no custom events, native click passthrough only)", () => {
    const events: EventFact[] = [];
    expect(events).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: FAIL — `Cannot find module '../src/api'`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/component-schema/src/api.ts
export interface PropFact {
  name: string;
  type: string;
  default?: string;
  required: boolean;
  description?: string;
}

export interface EventFact {
  semanticId: string;
  frameworkName: string;
  mechanism: "output" | "callback-prop" | "emit";
  payloadDescription?: string;
}

export interface FrameworkApi {
  props: PropFact[];
  events: EventFact[];
}

export interface ComponentApi {
  ng?: FrameworkApi;
  react?: FrameworkApi;
  vue?: FrameworkApi;
}
```

Export from `src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-schema/src/api.ts packages/component-schema/src/index.ts packages/component-schema/test/api.test-d.ts packages/component-schema/test/api.test.ts
git commit -m "feat(component-schema): add PropFact/EventFact/ComponentApi types"
```

---

### Task 4: Accessibility, style, relationships, provenance-reference block types

**Files:**
- Create: `packages/component-schema/src/accessibility.ts`
- Create: `packages/component-schema/src/style.ts`
- Create: `packages/component-schema/src/relationships.ts`
- Create: `packages/component-schema/src/provenance-ref.ts`
- Modify: `packages/component-schema/src/index.ts`
- Test: `packages/component-schema/test/blocks.test-d.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `AccessibilityFacts`, `StyleIdentity`, `Relationships`, `ProvenanceRef` types (spec §6.3-§6.6) — consumed by Task 8 (validator), Task 9-16 (metadata records)

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-schema/test/blocks.test-d.ts
import { expectTypeOf } from "vitest";
import type { AccessibilityFacts } from "../src/accessibility";
import type { StyleIdentity } from "../src/style";
import type { Relationships } from "../src/relationships";
import type { ProvenanceRef } from "../src/provenance-ref";

expectTypeOf<AccessibilityFacts["verifiedRoles"]>().toMatchTypeOf<string[] | undefined>();
expectTypeOf<StyleIdentity["componentName"]>().toEqualTypeOf<string>();
expectTypeOf<Relationships["dependsOn"]>().toMatchTypeOf<string[] | undefined>();
expectTypeOf<ProvenanceRef["package"]>().toEqualTypeOf<"ng" | "react" | "vue" | "uix-styles">();
expectTypeOf<ProvenanceRef["ultimateDestinations"]>().toEqualTypeOf<string[]>();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: FAIL — modules not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/component-schema/src/accessibility.ts
export interface AccessibilityFacts {
  verifiedRoles?: string[];
  verifiedAriaAttributes?: string[];
  guidance?: string;
}
```

```typescript
// packages/component-schema/src/style.ts
export interface StyleIdentity {
  componentName: string;
  styleModuleRef?: string;
}
```

```typescript
// packages/component-schema/src/relationships.ts
export interface Relationships {
  dependsOn?: string[];
}
```

```typescript
// packages/component-schema/src/provenance-ref.ts
export interface ProvenanceRef {
  package: "ng" | "react" | "vue" | "uix-styles";
  ultimateDestinations: string[];
}
```

Export all four from `src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-schema/src/accessibility.ts packages/component-schema/src/style.ts packages/component-schema/src/relationships.ts packages/component-schema/src/provenance-ref.ts packages/component-schema/src/index.ts packages/component-schema/test/blocks.test-d.ts
git commit -m "feat(component-schema): add accessibility/style/relationships/provenanceRef types"
```

---

### Task 5: Human-authored guidance block type

**Files:**
- Create: `packages/component-schema/src/guidance.ts`
- Modify: `packages/component-schema/src/index.ts`
- Test: `packages/component-schema/test/guidance.test-d.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `Guidance` type (`usageNotes?`/`antiPatterns?`/`migrationNotes?`, all optional — spec §6.7) — consumed by Task 6 (top-level assembly), Task 8 (validator)

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-schema/test/guidance.test-d.ts
import { expectTypeOf } from "vitest";
import type { Guidance } from "../src/guidance";

// All three fields optional in v1 (spec §6.7) — a component with zero
// authored guidance content must still produce a valid, empty Guidance value.
expectTypeOf<Guidance>().toMatchTypeOf<{}>();
expectTypeOf<Guidance["antiPatterns"]>().toMatchTypeOf<string[] | undefined>();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/component-schema/src/guidance.ts
export interface Guidance {
  usageNotes?: string;
  antiPatterns?: string[];
  migrationNotes?: string;
}
```

Export from `src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-schema/src/guidance.ts packages/component-schema/src/index.ts packages/component-schema/test/guidance.test-d.ts
git commit -m "feat(component-schema): add Guidance type"
```

---

### Task 6: Assemble the top-level `ComponentMetadata` type

**Files:**
- Create: `packages/component-schema/src/component-metadata.ts`
- Modify: `packages/component-schema/src/index.ts`
- Test: `packages/component-schema/test/component-metadata.test-d.ts`

**Interfaces:**
- Consumes: `ComponentIdentity` (Task 2), `ComponentApi` (Task 3), `AccessibilityFacts`/`StyleIdentity`/`Relationships`/`ProvenanceRef` (Task 4), `Guidance` (Task 5)
- Produces: `ComponentMetadata` — the single canonical shape (spec §6) — consumed by every metadata-record task (9-16) and the validator (Task 8)

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-schema/test/component-metadata.test-d.ts
import { expectTypeOf } from "vitest";
import type { ComponentMetadata } from "../src/component-metadata";

// Strict-mode shape check (spec §13): exactly these top-level keys, nothing
// else — a future unrecognized field is a deliberate schemaVersion-bump
// event, not something that silently type-checks today.
type ExpectedKeys =
  | "name" | "category" | "description" | "schemaVersion" | "metadataVersion" | "packages"
  | "api" | "accessibility" | "style" | "relationships" | "provenanceRef" | "guidance";
expectTypeOf<keyof ComponentMetadata>().toEqualTypeOf<ExpectedKeys>();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/component-schema/src/component-metadata.ts
import type { ComponentIdentity } from "./identity";
import type { ComponentApi } from "./api";
import type { AccessibilityFacts } from "./accessibility";
import type { StyleIdentity } from "./style";
import type { Relationships } from "./relationships";
import type { ProvenanceRef } from "./provenance-ref";
import type { Guidance } from "./guidance";

export type ComponentMetadata = ComponentIdentity & {
  api?: ComponentApi;
  accessibility?: AccessibilityFacts;
  style?: StyleIdentity;
  relationships?: Relationships;
  provenanceRef?: ProvenanceRef;
  guidance?: Guidance;
};
```

Export from `src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-schema/src/component-metadata.ts packages/component-schema/src/index.ts packages/component-schema/test/component-metadata.test-d.ts
git commit -m "feat(component-schema): assemble canonical ComponentMetadata type"
```

---

### Task 7: `metadataVersion` increment-semantics helper (testable behavior, not just a type)

**Files:**
- Create: `packages/component-schema/src/metadata-version.ts`
- Modify: `packages/component-schema/src/index.ts`
- Test: `packages/component-schema/test/metadata-version.test.ts`

**Interfaces:**
- Consumes: `ComponentMetadata` (Task 6) — this helper operates strictly on the already-defined v1 `ComponentMetadata` representation from Task 6; it introduces no separate canonical/normalized form of a record and no new versioning abstraction beyond the single integer already approved in spec §5.1.
- Produces: `nextMetadataVersion(current: ComponentMetadata, next: Omit<ComponentMetadata, "metadataVersion">): number` — compares `next` against `current`'s content with `metadataVersion` itself excluded from the comparison, and returns either `current.metadataVersion + 1` (content differs) or `current.metadataVersion` unchanged (content identical) — the one piece of spec §5.1 behavior precise enough to be a runtime function, not merely a type. Used by a future authoring workflow, not by this plan's own record population — Task 10-15 author records starting at `metadataVersion: 1` directly, since they have no prior version to increment from.

**What the tests must prove (spec §5.1's semantics, restated as concrete scenarios — not implementation-detail assertions about serialization or key order):**

1. A genuinely changed scalar field (e.g. `description`) → version increments by exactly 1.
2. Genuinely changed nested content (e.g. an `api.ng.props` entry's `type` field) → version increments by exactly 1.
3. Byte-for-byte unchanged content, including a no-op regeneration re-run → version stays the same.
4. A `schemaVersion`-only change with every other field identical → version stays the same (schema-shape changes are `SCHEMA_VERSION`'s concern, not `metadataVersion`'s, per spec §5).
5. A change to a generated-fact field (e.g. `api.ng.events`) → version increments by exactly 1.
6. A change to a human-authored guidance field (e.g. `guidance.usageNotes`) → version increments by exactly 1 — generated facts and human-authored guidance share one version, never two independent counters (spec §5.1).

If the implementation happens to use JSON serialization internally to detect "did the content change," that is a private implementation detail of this one function, not a canonicalization subsystem and not something any other task or package may depend on — the tests below assert only on the six semantic scenarios above, never on serialized-string equality or object-key ordering, so the implementation is free to be replaced by any other equally-correct content-comparison technique later without breaking a single test.

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-schema/test/metadata-version.test.ts
import { describe, it, expect } from "vitest";
import { nextMetadataVersion } from "../src/metadata-version";
import type { ComponentMetadata } from "../src/component-metadata";

const base: ComponentMetadata = {
  name: "Button", category: "Primitive", description: "A button.",
  schemaVersion: "1.0.0", metadataVersion: 1,
  packages: { ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/button/button.ts" } },
  api: { ng: { props: [{ name: "loading", type: "boolean", required: false }], events: [] } },
  guidance: { usageNotes: "Prefer text buttons for secondary actions." },
};

describe("nextMetadataVersion (spec §5.1 increment semantics — six required scenarios)", () => {
  it("1. increments by exactly 1 when a scalar field genuinely changes", () => {
    const changed = { ...base, description: "A clickable button." };
    expect(nextMetadataVersion(base, changed)).toBe(2);
  });

  it("2. increments by exactly 1 when nested content genuinely changes", () => {
    const changed = {
      ...base,
      api: { ng: { props: [{ name: "loading", type: "'true' | 'false'", required: false }], events: [] } },
    };
    expect(nextMetadataVersion(base, changed)).toBe(2);
  });

  it("3. does NOT increment when re-run against byte-identical content (no-op regeneration)", () => {
    const identical = { ...base };
    expect(nextMetadataVersion(base, identical)).toBe(1);
  });

  it("4. does NOT increment on a schemaVersion-only change with everything else identical", () => {
    const schemaBumpedOnly = { ...base, schemaVersion: "1.1.0" };
    expect(nextMetadataVersion(base, schemaBumpedOnly)).toBe(1);
  });

  it("5. increments by exactly 1 when a generated-fact field (api.ng.events) changes", () => {
    const changed = {
      ...base,
      api: { ng: { props: base.api!.ng!.props, events: [{ semanticId: "clicked", frameworkName: "click", mechanism: "output" as const }] } },
    };
    expect(nextMetadataVersion(base, changed)).toBe(2);
  });

  it("6. increments by exactly 1 when a human-authored guidance field changes — shares the same single version counter as generated facts, not a separate one", () => {
    const changed = { ...base, guidance: { usageNotes: "Prefer outlined buttons for secondary actions." } };
    expect(nextMetadataVersion(base, changed)).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/component-schema/src/metadata-version.ts
import type { ComponentMetadata } from "./component-metadata";

/**
 * Per spec §5.1: metadataVersion increments by exactly 1 on any real content
 * change (generated facts or human-authored guidance, no distinction — one
 * shared counter), and does NOT increment on a no-op regeneration (identical
 * content) or on a schemaVersion-only change. Compares every field except
 * metadataVersion itself. The comparison technique below (JSON
 * serialization) is a private implementation detail of this one function —
 * not a canonicalization subsystem, not depended on by any other task.
 */
export function nextMetadataVersion(
  current: ComponentMetadata,
  next: Omit<ComponentMetadata, "metadataVersion">
): number {
  const { metadataVersion: _currentVersion, schemaVersion: _currentSchema, ...currentContent } = current;
  // `next`'s static type is Omit<ComponentMetadata, "metadataVersion">, but
  // callers commonly build it by spreading a full ComponentMetadata (e.g.
  // `{ ...base, description: "..." }`), which copies metadataVersion at
  // runtime despite the type. Strip it explicitly here too — omitting this
  // strip caused a real false-increment bug on the no-op-regeneration and
  // schemaVersion-only-change test scenarios during Task 7's implementation.
  const { metadataVersion: _nextVersion, schemaVersion: _nextSchema, ...nextContent } = next as ComponentMetadata;
  const changed = JSON.stringify(currentContent) !== JSON.stringify(nextContent);
  return changed ? current.metadataVersion + 1 : current.metadataVersion;
}
```

Export from `src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-schema/src/metadata-version.ts packages/component-schema/src/index.ts packages/component-schema/test/metadata-version.test.ts
git commit -m "feat(component-schema): add nextMetadataVersion increment-semantics helper"
```

---

### Task 8: Validator — runtime structural narrowing of `unknown`, implementing every §13 rule

**Critical distinction this task exists to enforce (do not weaken it):** TypeScript types (Tasks 2-6) describe the contract to developers at compile time only — they provide zero runtime guarantee about a value coming from disk (a hand-authored `.ts` record file, a future JSON-authored record, or any other untrusted source). `validateComponentMetadata` is the only place in this package that actually **proves** an arbitrary runtime value conforms to the v1 `ComponentMetadata` shape. Its input parameter type must be `unknown`, never `ComponentMetadata` — accepting an already-typed parameter would let the validator silently rely on the caller's own (possibly wrong) type assertion instead of independently checking the data, defeating the entire purpose of a runtime validator. The validator performs structural narrowing (property-existence checks, `typeof` checks, `Array.isArray` checks, allowed-value-set checks) at every level of the object graph before ever treating a piece of data as trustworthy.

**Files:**
- Create: `packages/component-schema/src/validate.ts`
- Modify: `packages/component-schema/src/index.ts`
- Test: `packages/component-schema/test/validate.test.ts`

**Interfaces:**
- Consumes: `ComponentMetadata` type (Task 6, used only for the narrowed return type, never for trusting the input); `SCHEMA_VERSION` (Task 2)
- Produces: `validateComponentMetadata(record: unknown, allRecords: unknown[]): ValidationResult` where `ValidationResult = {valid: true; record: ComponentMetadata} | {valid: false; errors: string[]}` (the `valid: true` branch carries the now-proven-narrowed `record` back to the caller, so a caller never needs a second, separate cast) — consumed by Task 16 (validate-all-records script)

**Complete runtime validation checklist (every item below must have its own narrowing/check in the implementation and its own dedicated test — this is the literal, exhaustive expansion of spec §13, not a subset):**

1. Input is a non-null object (rejects `null`, arrays, primitives, `undefined`).
2. Every required top-level field is present: `name`, `category`, `description`, `schemaVersion`, `metadataVersion`, `packages`.
3. Every top-level field has the correct runtime type (`name`/`category`/`description`/`schemaVersion` are `string`; `metadataVersion` is `number`; `packages` is an object).
4. Strict-mode: every key present on the input is one of the known top-level keys (`name`, `category`, `description`, `schemaVersion`, `metadataVersion`, `packages`, `api`, `accessibility`, `style`, `relationships`, `provenanceRef`, `guidance`) — an unrecognized key is a validation failure, not silently ignored.
5. `schemaVersion` equals this validator's compiled-in `SCHEMA_VERSION` exactly (exact-match compatibility in v1, per spec §5).
6. `metadataVersion` is an integer and is `>= 1` (a positive integer starting at 1, per spec §5.1 — never `0`, never negative, never a non-integer, never a string).
7. `packages` is an object whose only allowed keys are `ng`/`react`/`vue`, each (if present) itself an object with required string fields `packageName`/`sourcePath`.
8. `api` (if present) is an object whose only allowed keys are `ng`/`react`/`vue`.
9. Every framework key present in `api` has a corresponding key present in `packages` (framework/package correspondence — an `api` entry for a framework the component doesn't ship in is invalid).
10. Each per-framework `api.<framework>` value is an object with required `props: unknown[]` and `events: unknown[]` arrays.
11. Every element of `props` is validated as a `PropFact`: required string `name`, required string `type`, required boolean `required`, optional string `default`, optional string `description` — any other shape is rejected.
12. Every element of `events` is validated as an `EventFact`: required string `semanticId`, required string `frameworkName`, required `mechanism` that is exactly one of `"output"`/`"callback-prop"`/`"emit"` (an event-triple check — any other string value for `mechanism` is rejected), optional string `payloadDescription`.
13. `accessibility` (if present) is an object whose only allowed keys are `verifiedRoles`/`verifiedAriaAttributes`/`guidance`, with `verifiedRoles`/`verifiedAriaAttributes` (if present) each a `string[]` and `guidance` (if present) a `string`.
14. `style` (if present) is an object with required string `componentName` and optional string `styleModuleRef`.
15. `relationships` (if present) is an object whose only allowed key is `dependsOn`, itself (if present) a `string[]`.
16. `provenanceRef` (if present) is an object with required `package` that is exactly one of `"ng"`/`"react"`/`"vue"`/`"uix-styles"`, and required `ultimateDestinations: string[]`.
17. `guidance` (if present) is an object whose only allowed keys are `usageNotes`/`antiPatterns`/`migrationNotes`, with `usageNotes`/`migrationNotes` (if present) each a `string` and `antiPatterns` (if present) a `string[]`.
18. Every `provenanceRef.ultimateDestinations` entry genuinely exists as an `ultimateDestination` value in the real `docs/architecture/provenance/<package>.json` file for the referenced `package` (a broken pointer is a failure — checked against the real file, never a fixture).
19. No two elements of `allRecords` share the same `name` (duplicate component identity).
20. Every `relationships.dependsOn` entry matches the `name` of some element of `allRecords` (dangling relationship reference).

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-schema/test/validate.test.ts
import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "../src/validate";

function valid(): unknown {
  return {
    name: "Button", category: "Primitive", description: "A button.",
    schemaVersion: "1.0.0", metadataVersion: 1,
    packages: { ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/button/button.ts" } },
    api: { ng: { props: [], events: [] } },
    provenanceRef: { package: "ng", ultimateDestinations: ["packages/ng/src/button/button.ts"] },
  };
}

describe("validateComponentMetadata — accepts unknown, proves the shape at runtime (spec §13)", () => {
  it("accepts a well-formed record and narrows it to ComponentMetadata", () => {
    const result = validateComponentMetadata(valid(), [valid()]);
    expect(result.valid).toBe(true);
  });

  it("rejects null, arrays, and primitives outright (input is not even an object)", () => {
    expect(validateComponentMetadata(null, []).valid).toBe(false);
    expect(validateComponentMetadata([], []).valid).toBe(false);
    expect(validateComponentMetadata("Button", []).valid).toBe(false);
    expect(validateComponentMetadata(42, []).valid).toBe(false);
  });

  it("rejects a record missing a required top-level field", () => {
    const record = valid() as Record<string, unknown>;
    delete record.category;
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a required top-level field with the wrong runtime type (e.g. name as a number)", () => {
    const record = { ...(valid() as Record<string, unknown>), name: 42 };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects an unrecognized top-level field (strict mode)", () => {
    const record = { ...(valid() as Record<string, unknown>), unknownField: "surprise" };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a schemaVersion this validator's SCHEMA_VERSION doesn't recognize (exact-match in v1)", () => {
    const record = { ...(valid() as Record<string, unknown>), schemaVersion: "2.0.0" };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects metadataVersion 0, a negative number, a non-integer, and a string", () => {
    for (const bad of [0, -1, 1.5, "1"]) {
      const record = { ...(valid() as Record<string, unknown>), metadataVersion: bad };
      expect(validateComponentMetadata(record, [record]).valid, `metadataVersion=${JSON.stringify(bad)} should be rejected`).toBe(false);
    }
  });

  it("rejects an api.<framework> entry with no matching packages.<framework> entry", () => {
    const record = { ...(valid() as Record<string, unknown>), api: { react: { props: [], events: [] } } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed PropFact (missing required 'required' boolean)", () => {
    const record = valid() as Record<string, unknown>;
    (record.api as Record<string, unknown>).ng = { props: [{ name: "loading", type: "boolean" }], events: [] };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects an EventFact with an invalid mechanism value (not one of output/callback-prop/emit)", () => {
    const record = valid() as Record<string, unknown>;
    (record.api as Record<string, unknown>).ng = {
      props: [],
      events: [{ semanticId: "sort-changed", frameworkName: "sortFieldChange", mechanism: "signal" }],
    };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed accessibility block (verifiedRoles not an array of strings)", () => {
    const record = { ...(valid() as Record<string, unknown>), accessibility: { verifiedRoles: "row" } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed style block (missing required componentName)", () => {
    const record = { ...(valid() as Record<string, unknown>), style: { styleModuleRef: "@ultimate/uix-styles/button" } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed relationships block (dependsOn not an array)", () => {
    const record = { ...(valid() as Record<string, unknown>), relationships: { dependsOn: "Paginator" } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed provenanceRef (package not one of the allowed literals)", () => {
    const record = { ...(valid() as Record<string, unknown>), provenanceRef: { package: "primeng", ultimateDestinations: [] } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a malformed guidance block (antiPatterns not an array of strings)", () => {
    const record = { ...(valid() as Record<string, unknown>), guidance: { antiPatterns: "don't do this" } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects a provenanceRef pointing at a path not present in the real provenance JSON", () => {
    const record = { ...(valid() as Record<string, unknown>), provenanceRef: { package: "ng", ultimateDestinations: ["packages/ng/src/nonexistent.ts"] } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("rejects two records sharing the same name (duplicate identity)", () => {
    const a = valid();
    const b = valid();
    expect(validateComponentMetadata(a, [a, b]).valid).toBe(false);
  });

  it("rejects a relationships.dependsOn entry that doesn't match any real record name (dangling reference)", () => {
    const record = { ...(valid() as Record<string, unknown>), relationships: { dependsOn: ["NonexistentComponent"] } };
    expect(validateComponentMetadata(record, [record]).valid).toBe(false);
  });

  it("accepts a valid relationships.dependsOn entry that matches a real sibling record (Table -> Paginator/Scroller case)", () => {
    const paginator = { ...(valid() as Record<string, unknown>), name: "Paginator" };
    const scroller = { ...(valid() as Record<string, unknown>), name: "Scroller" };
    const table = { ...(valid() as Record<string, unknown>), name: "Table", relationships: { dependsOn: ["Paginator", "Scroller"] } };
    expect(validateComponentMetadata(table, [paginator, scroller, table]).valid).toBe(true);
  });
});
```

Note: the "provenanceRef points at a real path" test needs a real provenance-JSON read — implement this test against the ACTUAL `docs/architecture/provenance/ng.json` file (read it in the test setup, extract one genuinely-real `ultimateDestination` value for the "accepts" case in `valid()`, and use an obviously-fake path for the "rejects" case) rather than a hand-rolled fixture, so this test only passes if the validator genuinely cross-checks the real file — matching this whole plan's ground-truth discipline.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/component-schema/src/validate.ts
import { readFileSync } from "node:fs";
import { SCHEMA_VERSION } from "./version";
import type { ComponentMetadata } from "./component-metadata";

export type ValidationResult = { valid: true; record: ComponentMetadata } | { valid: false; errors: string[] };

const KNOWN_TOP_LEVEL_KEYS = new Set([
  "name", "category", "description", "schemaVersion", "metadataVersion", "packages",
  "api", "accessibility", "style", "relationships", "provenanceRef", "guidance",
]);
const KNOWN_FRAMEWORKS = new Set(["ng", "react", "vue"]);
const KNOWN_PROVENANCE_PACKAGES = new Set(["ng", "react", "vue", "uix-styles"]);
const KNOWN_MECHANISMS = new Set(["output", "callback-prop", "emit"]);

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function readProvenanceDestinations(pkg: string): Set<string> {
  const raw = readFileSync(`docs/architecture/provenance/${pkg}.json`, "utf-8");
  const entries = JSON.parse(raw) as { ultimateDestination: string }[];
  return new Set(entries.map((e) => e.ultimateDestination));
}

/**
 * Proves an arbitrary runtime value conforms to the v1 ComponentMetadata
 * shape — this is the ONLY place that establishes trust in metadata content;
 * TypeScript types alone give no runtime guarantee for data read from disk.
 */
export function validateComponentMetadata(record: unknown, allRecords: unknown[]): ValidationResult {
  const errors: string[] = [];

  if (!isObject(record)) {
    return { valid: false, errors: ["record must be a non-null, non-array object"] };
  }

  for (const key of Object.keys(record)) {
    if (!KNOWN_TOP_LEVEL_KEYS.has(key)) errors.push(`Unrecognized top-level field: ${key}`);
  }
  for (const required of ["name", "category", "description", "schemaVersion"] as const) {
    if (typeof record[required] !== "string") errors.push(`${required} must be a string`);
  }
  if (typeof record.metadataVersion !== "number" || !Number.isInteger(record.metadataVersion) || record.metadataVersion < 1) {
    errors.push(`metadataVersion must be a positive integer starting at 1, got: ${JSON.stringify(record.metadataVersion)}`);
  }
  if (record.schemaVersion === SCHEMA_VERSION) {
    // compatible — no error
  } else if (typeof record.schemaVersion === "string") {
    errors.push(`schemaVersion ${record.schemaVersion} is not compatible with ${SCHEMA_VERSION}`);
  }
  if (!isObject(record.packages)) {
    errors.push("packages must be an object");
  } else {
    for (const key of Object.keys(record.packages)) {
      if (!KNOWN_FRAMEWORKS.has(key)) errors.push(`packages has unrecognized framework key: ${key}`);
      const entry = record.packages[key];
      if (!isObject(entry) || typeof entry.packageName !== "string" || typeof entry.sourcePath !== "string") {
        errors.push(`packages.${key} must be {packageName: string, sourcePath: string}`);
      }
    }
  }

  const packagesObj = isObject(record.packages) ? record.packages : {};
  if (record.api !== undefined) {
    if (!isObject(record.api)) {
      errors.push("api must be an object");
    } else {
      for (const framework of Object.keys(record.api)) {
        if (!KNOWN_FRAMEWORKS.has(framework)) errors.push(`api has unrecognized framework key: ${framework}`);
        if (!packagesObj[framework]) errors.push(`api.${framework} present but packages.${framework} is missing`);
        const frameworkApi = record.api[framework];
        if (!isObject(frameworkApi) || !Array.isArray(frameworkApi.props) || !Array.isArray(frameworkApi.events)) {
          errors.push(`api.${framework} must be {props: PropFact[], events: EventFact[]}`);
          continue;
        }
        for (const [i, prop] of frameworkApi.props.entries()) {
          if (!isObject(prop) || typeof prop.name !== "string" || typeof prop.type !== "string" || typeof prop.required !== "boolean") {
            errors.push(`api.${framework}.props[${i}] is not a valid PropFact`);
          }
        }
        for (const [i, event] of frameworkApi.events.entries()) {
          if (
            !isObject(event) ||
            typeof event.semanticId !== "string" ||
            typeof event.frameworkName !== "string" ||
            !KNOWN_MECHANISMS.has(event.mechanism as string)
          ) {
            errors.push(`api.${framework}.events[${i}] is not a valid EventFact (mechanism must be output/callback-prop/emit)`);
          }
        }
      }
    }
  }

  if (record.accessibility !== undefined) {
    if (!isObject(record.accessibility)) {
      errors.push("accessibility must be an object");
    } else {
      const { verifiedRoles, verifiedAriaAttributes, guidance } = record.accessibility;
      if (verifiedRoles !== undefined && !isStringArray(verifiedRoles)) errors.push("accessibility.verifiedRoles must be string[]");
      if (verifiedAriaAttributes !== undefined && !isStringArray(verifiedAriaAttributes)) errors.push("accessibility.verifiedAriaAttributes must be string[]");
      if (guidance !== undefined && typeof guidance !== "string") errors.push("accessibility.guidance must be a string");
    }
  }

  if (record.style !== undefined) {
    if (!isObject(record.style) || typeof record.style.componentName !== "string") {
      errors.push("style must be an object with a required string componentName");
    }
  }

  if (record.relationships !== undefined) {
    if (!isObject(record.relationships) || (record.relationships.dependsOn !== undefined && !isStringArray(record.relationships.dependsOn))) {
      errors.push("relationships.dependsOn must be string[]");
    }
  }

  if (record.provenanceRef !== undefined) {
    if (!isObject(record.provenanceRef) || !KNOWN_PROVENANCE_PACKAGES.has(record.provenanceRef.package as string) || !isStringArray(record.provenanceRef.ultimateDestinations)) {
      errors.push("provenanceRef must be {package: 'ng'|'react'|'vue'|'uix-styles', ultimateDestinations: string[]}");
    } else {
      const destinations = readProvenanceDestinations(record.provenanceRef.package as string);
      for (const dest of record.provenanceRef.ultimateDestinations as string[]) {
        if (!destinations.has(dest)) errors.push(`provenanceRef points at a nonexistent provenance entry: ${dest}`);
      }
    }
  }

  if (record.guidance !== undefined) {
    if (!isObject(record.guidance)) {
      errors.push("guidance must be an object");
    } else {
      const { usageNotes, antiPatterns, migrationNotes } = record.guidance;
      if (usageNotes !== undefined && typeof usageNotes !== "string") errors.push("guidance.usageNotes must be a string");
      if (antiPatterns !== undefined && !isStringArray(antiPatterns)) errors.push("guidance.antiPatterns must be string[]");
      if (migrationNotes !== undefined && typeof migrationNotes !== "string") errors.push("guidance.migrationNotes must be a string");
    }
  }

  const validObjectRecords = allRecords.filter(isObject);
  const sameName = validObjectRecords.filter((r) => r.name === record.name);
  if (sameName.length > 1) errors.push(`Duplicate component identity: ${record.name}`);
  if (isObject(record.relationships) && isStringArray(record.relationships.dependsOn)) {
    const knownNames = new Set(validObjectRecords.map((r) => r.name));
    for (const dep of record.relationships.dependsOn) {
      if (!knownNames.has(dep)) errors.push(`relationships.dependsOn references unknown component: ${dep}`);
    }
  }

  return errors.length === 0
    ? { valid: true, record: record as unknown as ComponentMetadata }
    : { valid: false, errors };
}
```

Export from `src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-schema test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-schema/src/validate.ts packages/component-schema/src/index.ts packages/component-schema/test/validate.test.ts
git commit -m "feat(component-schema): add validateComponentMetadata — runtime narrowing of unknown, implementing every spec §13 rule"
```

---

## Task Group B — `@ultimate/component-metadata` Foundation

### Task 9: Scaffold `@ultimate/component-metadata` package

**Files:**
- Create: `packages/component-metadata/package.json`
- Create: `packages/component-metadata/tsconfig.json`
- Create: `packages/component-metadata/vitest.config.ts`
- Create: `packages/component-metadata/src/index.ts`
- Test: `packages/component-metadata/test/package-exports.test.ts`

**Interfaces:**
- Consumes: `@ultimate/component-schema` (Task 1-8, as a `dependencies` entry — not `devDependencies`, since records are typed against it at runtime-adjacent build time)
- Produces: an installable, buildable, testable empty package with a barrel `src/index.ts` exporting `ALL_COMPONENTS: ComponentMetadata[]` (initially empty) — consumed by Task 10 onward

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-metadata/test/package-exports.test.ts
import { describe, it, expect } from "vitest";
import { ALL_COMPONENTS } from "../src/index";

describe("@ultimate/component-metadata package exports", () => {
  it("exports an ALL_COMPONENTS array", () => {
    expect(Array.isArray(ALL_COMPONENTS)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: FAIL — package/workspace member does not exist yet

- [ ] **Step 3: Write minimal implementation**

Same scaffold shape as Task 1, with `"name": "@ultimate/component-metadata"` and `"dependencies": {"@ultimate/component-schema": "workspace:*"}`. `src/index.ts`:

```typescript
// packages/component-metadata/src/index.ts
import type { ComponentMetadata } from "@ultimate/component-schema";

export const ALL_COMPONENTS: ComponentMetadata[] = [];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm install`, then `pnpm --filter @ultimate/component-metadata test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-metadata/
git commit -m "feat(component-metadata): scaffold package"
```

---

### Task 10: Button and Checkbox records — the empty-events cases

**Files:**
- Create: `packages/component-metadata/src/records/button.ts`
- Create: `packages/component-metadata/src/records/checkbox.ts`
- Modify: `packages/component-metadata/src/index.ts`
- Test: `packages/component-metadata/test/button.test.ts`
- Test: `packages/component-metadata/test/checkbox.test.ts`

**Interfaces:**
- Consumes: `ComponentMetadata`, `validateComponentMetadata` (`@ultimate/component-schema`)
- Produces: `BUTTON_METADATA`, `CHECKBOX_METADATA` records, added to `ALL_COMPONENTS` — consumed by Task 16 (whole-set validation script + its own test)

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-metadata/test/button.test.ts
import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { BUTTON_METADATA } from "../src/records/button";
import { ALL_COMPONENTS } from "../src/index";

describe("Button metadata record (ground truth: packages/{ng,react,vue}/src/button/*)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(BUTTON_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("has an empty events array in every framework (no custom events, native click passthrough only — confirmed against real source)", () => {
    expect(BUTTON_METADATA.api?.ng?.events).toEqual([]);
    expect(BUTTON_METADATA.api?.react?.events).toEqual([]);
    expect(BUTTON_METADATA.api?.vue?.events).toEqual([]);
  });

  it("records real, framework-native prop names, not a normalized universal name", () => {
    const ngPropNames = BUTTON_METADATA.api?.ng?.props.map((p) => p.name) ?? [];
    expect(ngPropNames).toContain("loading");
    expect(ngPropNames).toContain("raised");
  });

  it("has componentName 'button' in its style block (verified real convergence across all 3 frameworks)", () => {
    expect(BUTTON_METADATA.style?.componentName).toBe("button");
  });
});
```

```typescript
// packages/component-metadata/test/checkbox.test.ts
import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { CHECKBOX_METADATA } from "../src/records/checkbox";
import { ALL_COMPONENTS } from "../src/index";

describe("Checkbox metadata record (ground truth: packages/ng/src/checkbox/checkbox.ts:29 doc comment confirms no output()s exist)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(CHECKBOX_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("has an empty ng events array, distinct reasoning from Button's (an explicit documented decision, not merely 'never added')", () => {
    expect(CHECKBOX_METADATA.api?.ng?.events).toEqual([]);
  });

  it("records the real 'binary' boolean prop", () => {
    const ngPropNames = CHECKBOX_METADATA.api?.ng?.props.map((p) => p.name) ?? [];
    expect(ngPropNames).toContain("binary");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: FAIL — modules not found

- [ ] **Step 3: Write minimal implementation**

Read `packages/ng/src/button/button.ts`, `packages/react/src/button/button.tsx`, `packages/vue/src/button/base-button.ts`, and the equivalent Checkbox files in full first — every `PropFact`/`EventFact`/`provenanceRef` value in these records must be copied from real, currently-shipped source, never invented or guessed. Populate `BUTTON_METADATA`/`CHECKBOX_METADATA` as full `ComponentMetadata` objects (`metadataVersion: 1`, real `provenanceRef.ultimateDestinations` pointing at real entries confirmed present in `docs/architecture/provenance/ng.json`/`react.json`/`vue.json`, `relationships.dependsOn` left absent for both — neither has a real dependency per `COMPONENT_INVENTORY.md`). Add both to `ALL_COMPONENTS` in `src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-metadata/src/records/button.ts packages/component-metadata/src/records/checkbox.ts packages/component-metadata/src/index.ts packages/component-metadata/test/button.test.ts packages/component-metadata/test/checkbox.test.ts
git commit -m "feat(component-metadata): add Button and Checkbox records"
```

---

### Task 11: Dialog record — the lifecycle-event case (`onShow`/`onHide`)

**Files:**
- Create: `packages/component-metadata/src/records/dialog.ts`
- Modify: `packages/component-metadata/src/index.ts`
- Test: `packages/component-metadata/test/dialog.test.ts`

**Interfaces:**
- Consumes: `ComponentMetadata`, `validateComponentMetadata` (`@ultimate/component-schema`)
- Produces: `DIALOG_METADATA` — consumed by Task 16 (whole-set validation script + its own test)

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-metadata/test/dialog.test.ts
import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { DIALOG_METADATA } from "../src/records/dialog";
import { ALL_COMPONENTS } from "../src/index";

describe("Dialog metadata record (ground truth: packages/ng/src/dialog/dialog.ts:180,182 — real output<void>()s)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(DIALOG_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("records onShow/onHide as void-payload lifecycle events, distinct shape from Table's payload-bearing state-change events", () => {
    const ngEvents = DIALOG_METADATA.api?.ng?.events ?? [];
    const show = ngEvents.find((e) => e.semanticId === "shown");
    const hide = ngEvents.find((e) => e.semanticId === "hidden");
    expect(show?.frameworkName).toBe("onShow");
    expect(hide?.frameworkName).toBe("onHide");
    expect(show?.mechanism).toBe("output");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Read `packages/ng/src/dialog/dialog.ts`, `packages/react/src/dialog/*`, `packages/vue/src/dialog/*` in full. Populate `DIALOG_METADATA` with real `onShow`/`onHide` events (`semanticId: "shown"`/`"hidden"`) using each framework's real, currently-shipped mechanism/name — do not assume React/Vue use the same names as Angular without checking. Add to `ALL_COMPONENTS`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-metadata/src/records/dialog.ts packages/component-metadata/src/index.ts packages/component-metadata/test/dialog.test.ts
git commit -m "feat(component-metadata): add Dialog record"
```

---

### Task 12: Menu and Tooltip records

**Files:**
- Create: `packages/component-metadata/src/records/menu.ts`
- Create: `packages/component-metadata/src/records/tooltip.ts`
- Modify: `packages/component-metadata/src/index.ts`
- Test: `packages/component-metadata/test/menu.test.ts`
- Test: `packages/component-metadata/test/tooltip.test.ts`

**Interfaces:**
- Consumes: `ComponentMetadata`, `validateComponentMetadata`
- Produces: `MENU_METADATA`, `TOOLTIP_METADATA` — consumed by Task 16 (whole-set validation script + its own test)

- [ ] **Step 1: Write the failing test**

Mirror Task 10/11's test shape: schema-validity assertion + at least one real-prop-name assertion + at least one real-event (or confirmed-empty-events) assertion per framework, each value traced to a real file read, not invented.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: FAIL — modules not found

- [ ] **Step 3: Write minimal implementation**

Read `packages/{ng,react,vue}/src/menu/*` and `packages/{ng,react,vue}/src/tooltip/*` in full first. Populate both records from real source only. Add both to `ALL_COMPONENTS`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-metadata/src/records/menu.ts packages/component-metadata/src/records/tooltip.ts packages/component-metadata/src/index.ts packages/component-metadata/test/menu.test.ts packages/component-metadata/test/tooltip.test.ts
git commit -m "feat(component-metadata): add Menu and Tooltip records"
```

---

### Task 13: Paginator record

**Files:**
- Create: `packages/component-metadata/src/records/paginator.ts`
- Modify: `packages/component-metadata/src/index.ts`
- Test: `packages/component-metadata/test/paginator.test.ts`

**Interfaces:**
- Consumes: `ComponentMetadata`, `validateComponentMetadata`
- Produces: `PAGINATOR_METADATA` — consumed by Task 16 (Table's `relationships.dependsOn` needs this name to exist first, or Task 17's whole-set pass must run after both are added regardless of order) and Task 17

- [ ] **Step 1: Write the failing test**

Schema-validity assertion + real `first`/`rows`/`totalRecords` prop-name assertions per framework + real `onPageChange`/`page`-family event assertions (framework-native names, per the already-closed Paginator implementation's real shipped surface — read `packages/{ng,react,vue}/src/paginator/*` to get exact names, do not assume they match Table's own `onPage` naming from a different component).

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Read `packages/{ng,react,vue}/src/paginator/*` in full. Populate `PAGINATOR_METADATA` from real source. Add to `ALL_COMPONENTS`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-metadata/src/records/paginator.ts packages/component-metadata/src/index.ts packages/component-metadata/test/paginator.test.ts
git commit -m "feat(component-metadata): add Paginator record"
```

---

### Task 14: Scroller record

**Files:**
- Create: `packages/component-metadata/src/records/scroller.ts`
- Modify: `packages/component-metadata/src/index.ts`
- Test: `packages/component-metadata/test/scroller.test.ts`

**Interfaces:**
- Consumes: `ComponentMetadata`, `validateComponentMetadata`
- Produces: `SCROLLER_METADATA` — consumed by Task 16, Task 17

- [ ] **Step 1: Write the failing test**

Schema-validity assertion + real `items`/`itemSize`/`numToleratedItems` prop-name assertions + real `onLazyLoad`/`lazy-load`-family event assertions per framework (read `packages/{ng,react,vue}/src/scroller/*` for exact names).

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Read `packages/{ng,react,vue}/src/scroller/*` in full. Populate `SCROLLER_METADATA` from real source. Add to `ALL_COMPONENTS`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-metadata/src/records/scroller.ts packages/component-metadata/src/index.ts packages/component-metadata/test/scroller.test.ts
git commit -m "feat(component-metadata): add Scroller record"
```

---

### Task 15: Table record — the richest event-divergence case, `relationships.dependsOn`, and full description/guidance boundary worked example

**Files:**
- Create: `packages/component-metadata/src/records/table.ts`
- Modify: `packages/component-metadata/src/index.ts`
- Test: `packages/component-metadata/test/table.test.ts`

**Interfaces:**
- Consumes: `ComponentMetadata`, `validateComponentMetadata`; `PAGINATOR_METADATA`/`SCROLLER_METADATA` names (Task 13-14, for the dependency-reference validation to pass)
- Produces: `TABLE_METADATA` — consumed by Task 16 (whole-set validation script + its own test)

- [ ] **Step 1: Write the failing test**

```typescript
// packages/component-metadata/test/table.test.ts
import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { TABLE_METADATA } from "../src/records/table";
import { ALL_COMPONENTS } from "../src/index";

describe("Table metadata record (spec §12's own worked example: sort-changed divergence)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(TABLE_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("represents the real sort-changed divergence: same semanticId, three different frameworkName/mechanism pairs", () => {
    const ng = TABLE_METADATA.api?.ng?.events.find((e) => e.semanticId === "sort-changed");
    const react = TABLE_METADATA.api?.react?.events.find((e) => e.semanticId === "sort-changed");
    const vue = TABLE_METADATA.api?.vue?.events.find((e) => e.semanticId === "sort-changed");
    expect(ng).toMatchObject({ frameworkName: "sortFieldChange", mechanism: "output" });
    expect(react).toMatchObject({ frameworkName: "onSort", mechanism: "callback-prop" });
    expect(vue).toMatchObject({ frameworkName: "sort", mechanism: "emit" });
  });

  it("declares Paginator and Scroller as real, valid dependencies (spec §12, §6.5)", () => {
    expect(TABLE_METADATA.relationships?.dependsOn).toEqual(expect.arrayContaining(["Paginator", "Scroller"]));
  });

  it("has verified accessibility facts (role, aria-sort, aria-selected) matching the just-closed milestone's real shipped markup", () => {
    expect(TABLE_METADATA.accessibility?.verifiedRoles).toEqual(expect.arrayContaining(["row", "columnheader"]));
    expect(TABLE_METADATA.accessibility?.verifiedAriaAttributes).toEqual(expect.arrayContaining(["aria-sort", "aria-selected"]));
  });

  it("description and accessibility.guidance carry non-overlapping content (spec §6.1a boundary)", () => {
    // description must not restate the accessibility-specific windowed-keyboard-nav
    // limitation, and accessibility.guidance must not restate the identity statement —
    // this is a direct regression guard against the exact duplication risk §6.1a exists to prevent.
    expect(TABLE_METADATA.description).not.toContain("window");
    expect(TABLE_METADATA.accessibility?.guidance).toMatch(/window/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Read `packages/{ng,react,vue}/src/table/*` in full (the just-closed `UTable` implementation — real source, not the plan/spec prose). Populate `TABLE_METADATA`:
- `description`: an evergreen identity statement (spec §6.1a's test: true regardless of specific usage) — e.g. "Table renders tabular data with sorting, filtering, selection, pagination, virtualization, and row/cell editing."
- `accessibility.guidance`: the real, already-documented windowed-keyboard-navigation limitation from Table's own Scroller-composition tasks (Tasks 9/15b/21b of the Table plan) — e.g. "Keyboard navigation only operates within the currently-rendered virtualized window, not the full logical dataset."
- `api.*.events`: at minimum the `sort-changed` triple above, plus `selection-changed`/`page-changed` following the same per-framework-real-name discipline (read `packages/{ng,react,vue}/src/table/table.{ts,tsx}` /`Table.vue` for the real `selectionChange`/`onSelectionChange`/`update:selection` and `firstChange`/`onPage`/`page` names).
- `relationships.dependsOn: ["Paginator", "Scroller"]` (matches `COMPONENT_INVENTORY.md`'s existing Table dependency row).
- `provenanceRef` pointing at real `ultimateDestination` entries confirmed present in all three frameworks' provenance JSON plus `uix-styles`'s Table entry.

Add to `ALL_COMPONENTS`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/component-metadata/src/records/table.ts packages/component-metadata/src/index.ts packages/component-metadata/test/table.test.ts
git commit -m "feat(component-metadata): add Table record (sort-changed divergence worked example)"
```

---

### Task 16: Whole-proof-set validation script and package-exports test — creates the durable `validate` command

**This task's one responsibility: create the durable, standalone `pnpm --filter @ultimate/component-metadata run validate` command.** This is new functionality (a script + a package.json entry point that did not exist before this task), not a re-run of anything — Task 17 (below) is the task that re-runs what this task creates, and the two must never be described as implementing the same thing twice.

**Files:**
- Create: `packages/component-metadata/scripts/validate-all.mjs`
- Modify: `packages/component-metadata/package.json` (add `"validate": "node scripts/validate-all.mjs"` script)
- Test: `packages/component-metadata/test/package-exports.test.ts` (extend)

**Interfaces:**
- Consumes: `validateComponentMetadata` (`@ultimate/component-schema`); `ALL_COMPONENTS` (Task 9-15)
- Produces: a real, runnable `pnpm --filter @ultimate/component-metadata run validate` command that validates every record in `ALL_COMPONENTS` against every other record (cross-record checks — duplicate names, dangling relationship references — require the full set, not one record in isolation) — this exact command is what Task 17 re-runs as the dedicated Phase 6 whole-set verification gate

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/component-metadata/test/package-exports.test.ts
describe("whole-set validation (cross-record checks)", () => {
  it("every record in ALL_COMPONENTS is individually and cross-validated (no duplicate names, no dangling relationships)", () => {
    for (const record of ALL_COMPONENTS) {
      const result = validateComponentMetadata(record, ALL_COMPONENTS);
      expect(result.valid, `record ${record.name} failed: ${!result.valid ? result.errors.join("; ") : ""}`).toBe(true);
    }
  });

  it("contains exactly the 8 proof-set components, no more, no fewer (this plan's own scope boundary)", () => {
    const names = ALL_COMPONENTS.map((c) => c.name).sort();
    expect(names).toEqual(["Button", "Checkbox", "Dialog", "Menu", "Paginator", "Scroller", "Table", "Tooltip"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-metadata test`
Expected: FAIL (or already passing if Task 9-15 landed correctly — if so, this is a durable regression guard, matching the convention already established in the Table plan's own Task 24)

- [ ] **Step 3: Write minimal implementation**

```javascript
// packages/component-metadata/scripts/validate-all.mjs
import { validateComponentMetadata } from "@ultimate/component-schema";
import { ALL_COMPONENTS } from "../dist/index.mjs";

let failed = false;
for (const record of ALL_COMPONENTS) {
  const result = validateComponentMetadata(record, ALL_COMPONENTS);
  if (!result.valid) {
    failed = true;
    console.error(`[validate] ${record.name}: ${result.errors.join("; ")}`);
  }
}
if (failed) {
  console.error("[validate] FAILED");
  process.exit(1);
}
console.log(`[validate] OK: ${ALL_COMPONENTS.length} record(s) validated`);
```

Add `"validate": "node scripts/validate-all.mjs"` to `package.json`'s `scripts` (run after `build`, since it imports from `dist/`).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/component-metadata test`, then `pnpm --filter @ultimate/component-metadata run build && pnpm --filter @ultimate/component-metadata run validate`
Expected: PASS, `[validate] OK: 8 record(s) validated`

- [ ] **Step 5: Commit**

```bash
git add packages/component-metadata/scripts/validate-all.mjs packages/component-metadata/package.json packages/component-metadata/test/package-exports.test.ts
git commit -m "feat(component-metadata): add whole-set validation script"
```

---

## Task Group C — Cross-Package Verification, Boundary, Closeout

### Task 17: Whole-set verification gate — re-runs Task 16's durable command (verification-only, no new functionality)

**This task's one responsibility: re-run the durable command Task 16 created**, as this plan's dedicated Phase 6 whole-set verification checkpoint. Task 17 implements nothing new and must not be described as re-implementing Task 16's functionality — it is the governance/checkpoint act of invoking that already-real command and confirming it is still green, kept as a distinct, separately-tracked task so a future re-run of Phase 6's verification always has one unambiguous task to point at (matching the Table plan's own precedent of separating "a command exists" from "the command was checked at the closeout gate"). No code is expected to change in this task under normal circumstances.

**Files:**
- None expected (verification-only task)

**Interfaces:**
- Consumes: `pnpm --filter @ultimate/component-metadata run validate` (the exact command Task 16 created)

- [ ] **Step 1: Write the failing test**

N/A — verification-only. There is no new test to write here; this task's entire content is invoking Task 16's already-tested command and inspecting its result.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/component-metadata run build && pnpm --filter @ultimate/component-metadata run validate`
Expected: PASS is expected here (all 8 records already validated individually in Tasks 10-15, and by Task 16's own test) — this step's "failure" case is any regression introduced by a later task's edit to an earlier record; it is not expected to fail under normal execution of this plan.

- [ ] **Step 3: Write minimal implementation**

None expected — this task's own scope produces zero file changes. If the command genuinely fails, the fix belongs in the specific record's own task (Task 10-15) or in Task 16's script itself, never authored fresh inside this task.

- [ ] **Step 4: Run test to verify it passes**

Run the same command again.
Expected: PASS

- [ ] **Step 5: Commit**

No commit if nothing changed (verification-only).

---

### Task 18: Package-boundary, dependency-ceiling, and repository-wide verification gate

**Files:**
- None expected (verification-only task; any fix belongs in whichever earlier task's file actually violates something)

**Interfaces:**
- Consumes: `scripts/provenance/validate-boundaries.mjs`, `scripts/provenance/validate-dependency-ceiling.mjs`, `scripts/provenance/validate-provenance.mjs`, the repo's root `build`/`test`/`typecheck` scripts

**Verification checklist (matching this repo's established CI step order and the Table plan's own final-gate convention):**

- [ ] `pnpm run build` — confirm `@ultimate/component-schema` and `@ultimate/component-metadata` both build clean alongside every existing package (zero regression to Phases 0-5/uix-data/Paginator/Scroller/Table).
- [ ] `pnpm run test` — confirm the two new packages' test suites pass, and confirm zero regression to any existing package's suite (compare against the last known-good whole-workspace count from the Table milestone's own closeout, then add this plan's own new test count on top).
- [ ] `pnpm run typecheck` — confirm zero errors across the whole workspace including the two new packages.
- [ ] Content-only provenance validator invocation (no `--base-ref`, since this repo has no `origin` remote — established convention from the Table plan's Task 25/26/27) — confirm it does not regress (this plan adds no new *source-file* provenance entries of its own, since `component-schema`/`component-metadata` are Ultimate-original code with no upstream Prime equivalent — see Task 19 for the one required documentation note about this).
- [ ] `pnpm run boundary:validate` — confirm neither new package imports `@angular/*`/`react`/`react-dom`/`vue` (they are framework-neutral, per this plan's own Global Constraints) and confirm the validator's existing `uix*`-prefix package scan either already covers `component-schema`/`component-metadata` or is confirmed out-of-scope-by-design for non-`uix`-prefixed packages (read the real validator script to determine which, exactly as the Table plan's Task 26 did for its own boundary check — do not assume).
- [ ] `pnpm run ceiling:validate` — confirm neither new package's `package.json` declares a forbidden Prime-branded runtime dependency (they should declare none at all beyond `@ultimate/component-schema` itself for `component-metadata`).
- [ ] Grep both new packages' entire `src/`/`test/`/`scripts/` trees for any `primeng`/`primereact`/`primevue`/`@primeuix/*` import — confirm zero matches (this plan's own explicit "no forbidden runtime dependency" requirement, restated as a directly-checkable grep rather than trusted from the ceiling validator alone).
- [ ] Confirm neither `packages/ng`, `packages/react`, nor `packages/vue`'s `package.json` gained a new dependency on `@ultimate/component-schema` or `@ultimate/component-metadata` (this plan's own explicit "no runtime dependency from Angular/React/Vue component packages on the metadata system" requirement) — `git diff` those three `package.json` files against this plan's own commit range and confirm empty.
- [ ] `git status` — confirm a clean working tree at the end.

- [ ] **Step 5: Commit**

No commit if all green (verification-only). If a genuine violation surfaces, fix it at its source task and note the fix in this task's own commit message.

---

### Task 19: GAP-027 documentation update (status only, not a rewrite)

**Files:**
- Modify: `docs/architecture/BLUEPRINT_GAPS.md` (GAP-027 status field only)
- Modify: `docs/architecture/ROADMAP.md` (Phase 6 status row only)

**Interfaces:**
- Consumes: the fully green Task 18 verification gate

Per this plan's own §11 constraint ("do not silently rewrite historical architecture documentation... identify the required closeout/documentation action, but keep the current run limited to plan authoring") — this task is the one place in this plan where that identified action is actually executed, once implementation is real and verified, exactly mirroring the Table plan's own Task 27 (`GAP-014` closure) precedent.

- [ ] **Step 1: Write the failing test**

N/A — this is a documentation-closeout gate, not a unit test, matching the Table plan's own Task 27 convention.

- [ ] **Step 2: Run test to verify it fails**

Read `docs/architecture/BLUEPRINT_GAPS.md`'s current GAP-027 entry and `docs/architecture/ROADMAP.md`'s Phase 6 row — both currently say `MISSING`/`Not started`. This is the "failing" state.

- [ ] **Step 3: Write minimal implementation**

Update GAP-027's `Status` field to `RESOLVED`, add one sentence to its `Source/evidence` field citing this implementation plan's own tasks as the resolution evidence (matching the exact style of GAP-014's own closure, done during the Table milestone's Task 27 — read that entry first to match format precisely). Update `ROADMAP.md`'s Phase 6 row from `Not started` to `Complete`, with a footnote (matching Phase 5's own footnote-style precedent) noting the scope boundary: schema + 8-component proof set populated, not the full ~115-component `COMPONENT_INVENTORY.md` backlog.

Do **not** touch any other gap entry, any other phase row, or `COMPONENT_INVENTORY.md` itself (out of scope, per this plan's own constraints).

- [ ] **Step 4: Run test to verify it passes**

Re-run Task 18's full verification gate once more after this doc-only edit, confirm still green.

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/BLUEPRINT_GAPS.md docs/architecture/ROADMAP.md
git commit -m "docs(blueprint-gaps): resolve GAP-027, mark Phase 6 complete"
```

---

## Acceptance Criteria (restated from the approved spec, mapped to this plan's tasks)

- [ ] `ComponentMetadata` canonical shape matches spec §6 exactly — Tasks 2-6.
- [ ] `schemaVersion`/`metadataVersion` implemented per spec §5/§5.1 precisely (integer format, increment semantics, no relationship to package version) — Task 2, Task 7.
- [ ] Validator implements every spec §13 rule (schema validity, version validity, framework-mapping validity, event-triple well-formedness, provenance-reference validity, duplicate-identity detection, dangling-relationship detection, strict-mode) — Task 8.
- [ ] `description`/`accessibility.guidance`/`guidance.*` boundary (spec §6.1a) is directly tested, not just documented — Task 15's dedicated regression test.
- [ ] Provenance remains a reference, never duplicated (spec §10) — Task 8's validator, Task 10-15's records, Task 18's grep-level confirmation.
- [ ] Generated facts vs. human-authored guidance stay in separate, distinguishable blocks (spec §9) — every record task (10-15).
- [ ] Framework-native API differences are preserved, never normalized (spec §8) — every record task, explicit worked example in Task 15 (Table's sort-changed divergence).
- [ ] Proof set (Button/Checkbox/Dialog/Menu/Tooltip/Paginator/Scroller/Table × Angular/React/Vue) is represented without scope expansion beyond it — Task 10-16.
- [ ] No runtime dependency introduced from `packages/{ng,react,vue}` onto either new package — Task 18.
- [ ] No forbidden Prime-branded runtime dependency introduced — Task 18.
- [ ] GAP-027 and `ROADMAP.md`'s Phase 6 row updated to reflect completion, at closeout time only — Task 19.

### Verification commands for the complete merged state

```bash
pnpm run build
pnpm run test
pnpm run typecheck
pnpm run boundary:validate
pnpm run ceiling:validate
pnpm --filter @ultimate/component-metadata run validate
```

### Deferred / Out of Scope (restated from the approved spec, not reopened by this plan)

Slots/templates normalization, formal variants/states taxonomy, structured migration-classification system (beyond the free-text `guidance.migrationNotes` field), full documentation/Storybook content generation, CLI-specific metadata contracts (Phase 7), MCP-specific metadata contracts (Phase 8), AI/LLM-specific metadata contracts (Phase 9), a runtime metadata registry, universal event naming, universal framework API abstraction, and migration of the full ~115-component `COMPONENT_INVENTORY.md` backlog into this schema. None of these are implemented, stubbed, or partially started by any task in this plan.
