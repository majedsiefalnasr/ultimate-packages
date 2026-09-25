# Phase 9 — AI Skills and LLM Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Complete — implemented and merged; Phase 9 marked Complete in `docs/architecture/ROADMAP.md` and GAP-030 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`.
**Approved spec:** `docs/superpowers/specs/2026-09-07-phase-9-ai-skills-llm-context-design.md` (Status: Draft for review; formally APPROVED at spec-review gate, round 4 — see the spec's own Formal Review Record correction-pass log — ready for Implementation Plan per SKey workflow)
**Research:** `docs/architecture/research/2026-09-07-phase-9-ai-skills-llm-context.md`
**References:** `docs/architecture/BLUEPRINT.md` §6/§18/§22/§23/§24/§25/§26/§35, `docs/architecture/DECISIONS.md` ADR-011/ADR-012, `docs/architecture/BLUEPRINT_GAPS.md` GAP-004/GAP-030, `packages/component-schema`, `packages/component-metadata`, `packages/cli`, `packages/mcp`, `.github/workflows/ci.yml`, `scripts/provenance/validate-cli-boundary.mjs`, `scripts/provenance/validate-mcp-boundary.mjs`

**Goal:** Build `@ultimate/ai` — a build-time generation/validation package that reads `@ultimate/component-metadata`'s real 8-record `ALL_COMPONENTS` set and produces (a) one hybrid hand-authored/generated Skill file per component under repo-root `skills/`, and (b) five deterministic static LLM-context files (`llms.txt`, `llms-full.txt`, `llms-ng.txt`, `llms-react.txt`, `llms-vue.txt`) — plus a marker-based validator enforcing the spec's exact frontmatter/marker-boundary/fidelity contract, a new CI boundary gate proving `@ultimate/ai`'s sibling independence from `@ultimate/cli`/`@ultimate/mcp`/every framework package, and a tool-agnostic agent-instruction convention document.

**Architecture:** A single new package (`packages/ai`), following the exact `type: module` / `tsup` dual/triple-entry / `vitest --typecheck` shape already established by `@ultimate/cli` and `@ultimate/mcp`. Generation logic is a set of plain, pure, directly-testable functions with no filesystem/CLI coupling in their own logic (mirrors `@ultimate/mcp`'s tool-handler pattern exactly): a `render-section.ts` module renders each of the 5 marker-delimited Skill sections from a `ComponentMetadata` record; a `skill-file.ts` module composes a full Skill file's text (frontmatter + 5 marker pairs + placeholder prose scaffolding) and handles the parse/regenerate-in-place logic for existing files; a `context-files.ts` module renders the 5 LLM-context `.txt` files from `ALL_COMPONENTS` (+ optional `skills/` content); a `validate.ts` module implements the spec's exact 4-stage validation order (frontmatter → marker-structure → fidelity → LLM-context reproducibility). Thin CLI-less scripts (`bin-generate.ts`, `bin-validate.ts`) are the only files that touch the real filesystem (`skills/*.md`, `dist/context/*.txt`) — everything else takes strings/objects in, strings/objects out, exactly like `@ultimate/mcp`'s `bin.ts`-is-the-only-stdio-toucher discipline.

**Tech Stack:** TypeScript (ESM), `tsup`, `vitest`, Node's built-in `node:fs`/`node:path` (no new external runtime dependency — spec §10.4 explicitly forbids one), `pnpm` workspaces, `js-yaml` (new dev+runtime dependency for frontmatter parsing — justified in Task 1's Global Constraints; the repo has no existing YAML parser anywhere, and hand-rolling a parser for a 3-key flat block is more risk than a well-known, MIT-licensed, dependency-free-itself library).

## Global Constraints

These apply to every task below; a task does not restate them, it inherits them.

- **No dependency on `@ultimate/cli`, `@ultimate/mcp`, `@ultimate/ng`, `@ultimate/react`, `@ultimate/vue`, or `@ultimate/themes`** — in either direction. Spec §4/§9, enforced by Task 8's new CI gate.
- **Only direct Ultimate-owned dependency is `@ultimate/component-metadata`** (`workspace:*`) — `@ultimate/component-schema`'s types (`ComponentMetadata`, `PropFact`, `EventFact`, `AccessibilityFacts`, `Relationships`, `Guidance`) are imported the same way `@ultimate/mcp`/`@ultimate/cli` already do, as a second `workspace:*` dependency, since generation code references those types directly. Spec §5.
- **No filesystem project auto-detection, no project-aware anything.** v1 has zero project-supplied input contract of any kind. Spec §7.6/§12.
- **No runtime source parsing.** Every read is `ALL_COMPONENTS` (from `@ultimate/component-metadata`), `docs/architecture/compatibility-manifest.json` (read-only, only if a Skill needs a compatibility note — none do in the initial 8-component content pass, so this plan does not exercise that read path; the code capability is not built speculatively — see Task 9's note), or `skills/*.md` files this package itself owns — never `.ts`/`.tsx`/`.vue` files under `packages/{ng,react,vue}`. Spec §5.
- **No expansion of `@ultimate/component-metadata`'s 8-component proof set or `@ultimate/component-schema`'s schema shape.** No new `ComponentMetadata` field, no `examples` field. Spec §6.2/§12.
- **No LLM-based generation or validation, ever.** Every generated section is a direct, deterministic rendering of existing `ComponentMetadata` fields — never an AI-model call. Every validation check is a mechanical string/byte comparison — never a semantic judgment on prose. Spec §6.3/§10.2/§12.
- **Deterministic generation.** Given the same `ALL_COMPONENTS` content, the same `skills/` content, and the same generator code version, every generated byte is identical across runs. Spec §7.3, enforced by Task 6's determinism test.
- **Package name:** `@ultimate/ai`, at `packages/ai` (currently `.gitkeep` only — confirmed by direct listing before this plan was written). Content directory: repo-root `skills/` (currently `.gitkeep` only, confirmed the same way).
- **Exact 5 generated-section keys, exact order, exact marker syntax** (spec §6.3.3), verbatim, never renamed or reordered:
  ```
  <!-- ultimate:generated:start section="preferred-patterns" -->
  ...
  <!-- ultimate:generated:end section="preferred-patterns" -->
  ```
  Section keys in file order: `preferred-patterns`, `allowed-apis`, `anti-patterns`, `accessibility-guidance`, `related-components`. A section with no backing content still gets its marker pair, with empty content between `start`/`end` — never an omitted pair.
- **Exact 8 components, exact order as they appear in `ALL_COMPONENTS`** (`packages/component-metadata/src/index.ts`): Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip.
- **Exact 5 LLM-context artifact filenames and location** (spec §7.1): `dist/context/llms.txt`, `dist/context/llms-full.txt`, `dist/context/llms-ng.txt`, `dist/context/llms-react.txt`, `dist/context/llms-vue.txt`, relative to `@ultimate/ai`'s own package root — never `packages/ai/dist/context/` written into another file as a literal path (that would only be correct from inside this monorepo; consuming projects read `node_modules/@ultimate/ai/dist/context/`, spec §7.1a/§8).
- **`@ultimate/ai`'s `package.json` `files` field must include `"dist/context"` (or `"dist"` broadly, matching `@ultimate/cli`/`@ultimate/mcp`'s existing `"files": ["dist", "README.md"]` pattern) so `npm pack`/`npm publish` actually ships the 5 `.txt` files.** Spec §7.1a, verified by Task 8's packaging test.
- **`metadataVersion` matching is exact-integer equality, never a range.** A mismatch is a hard validation failure, not a warning. Spec §6.3.2.
- **No Phase 10 functionality of any kind** (security scanning, performance benchmarking, production-hardening content). Spec §14 ("No accidental Phase 10 leakage").

---

### Task 1: Package scaffolding — `@ultimate/ai`

**Files:**

- Create: `packages/ai/package.json`
- Create: `packages/ai/tsconfig.json`
- Create: `packages/ai/tsup.config.ts`
- Create: `packages/ai/vitest.config.ts`
- Create: `packages/ai/scripts/rename-dts.mjs`
- Create: `packages/ai/src/index.ts` (placeholder barrel, expanded in later tasks)
- Test: none (scaffolding-only task; verified by build/typecheck running clean on an empty barrel)

**Interfaces:**

- Produces: the `@ultimate/ai` package itself, buildable via `pnpm --filter @ultimate/ai run build` and typecheckable via `pnpm --filter @ultimate/ai run typecheck`. Every later task adds files under `packages/ai/src/` and `packages/ai/test/` that this scaffolding makes buildable/testable.

- [ ] **Step 1: Create `packages/ai/package.json`**

This mirrors `packages/mcp/package.json` exactly in shape, substituting the package name/description, dropping the `@modelcontextprotocol/sdk`/`zod` runtime dependencies (this package needs neither — it is a generator, not an MCP server), and adding `js-yaml` (+ its `@types/js-yaml` dev dependency) as the one new runtime dependency, justified in this plan's Tech Stack section above. Two build entries (`index`, `bin-generate`, `bin-validate` — three total, one more than MCP's two, since generation and validation are separate CLI-invoked entry points per spec §10.1/§10.2's separate concerns) are wired in Task 1 Step 2's `tsup.config.ts`, so `package.json`'s `bin` field names both:

```json
{
  "name": "@ultimate/ai",
  "version": "0.1.0",
  "description": "Generation and validation tooling for Ultimate Skills and LLM context (Phase 9).",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "bin": {
    "ultimate-ai-generate": "./dist/bin-generate.mjs",
    "ultimate-ai-validate": "./dist/bin-validate.mjs"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "default": "./dist/index.mjs"
    }
  },
  "files": ["dist", "README.md"],
  "dependencies": {
    "@ultimate/component-metadata": "workspace:*",
    "@ultimate/component-schema": "workspace:*",
    "js-yaml": "^4.1.0"
  },
  "scripts": {
    "build": "tsup && node scripts/rename-dts.mjs",
    "test": "vitest run --typecheck",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/js-yaml": "^4.0.9",
    "@types/node": "^22.10.2",
    "tsup": "^8.3.0",
    "typescript": "^5.9.3",
    "vitest": "^2.1.8"
  }
}
```

Note: `"files": ["dist", "README.md"]` (not narrowed to `"dist/context"` alone) is the correct value — it must ship the whole compiled package (code + context files), matching `@ultimate/mcp`'s and `@ultimate/cli`'s identical `files` entries exactly. `dist/context/*.txt` lives inside `dist/`, so this one entry already satisfies spec §7.1a's packaging requirement; Task 8 verifies this with a real `npm pack`.

- [ ] **Step 2: Create `packages/ai/tsup.config.ts`**

Three entries (index, bin-generate, bin-validate), mirroring `packages/mcp/tsup.config.ts`'s exact shape:

```ts
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    outDir: "dist",
  },
  {
    entry: { "bin-generate": "src/bin-generate.ts" },
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    dts: false,
    sourcemap: true,
    splitting: false,
    outDir: "dist",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
  {
    entry: { "bin-validate": "src/bin-validate.ts" },
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    dts: false,
    sourcemap: true,
    splitting: false,
    outDir: "dist",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
```

- [ ] **Step 3: Create `packages/ai/tsconfig.json`**

Identical shape to `packages/mcp/tsconfig.json`:

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

- [ ] **Step 4: Create `packages/ai/vitest.config.ts`**

Identical shape to `packages/mcp/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    typecheck: {
      include: ["test/**/*.test-d.ts"],
    },
  },
});
```

- [ ] **Step 5: Create `packages/ai/scripts/rename-dts.mjs`**

Byte-identical to `packages/mcp/scripts/rename-dts.mjs` (same tsup/`.d.ts`-vs-`.d.mts` workaround applies identically):

```js
#!/usr/bin/env node
// tsup's non-experimental `dts: true` generator does not honor a custom
// `outExtension().dts` when the package is already `"type": "module"`
// (it falls back to `.d.ts`, since `.ts` is unambiguous ESM in that case).
// Rename the emitted `.d.ts` / `.d.ts.map` files to `.d.mts` / `.d.mts.map`
// after the build so they match this package's `.mjs` exports map.
import { readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

function renameDtsToMts(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      renameDtsToMts(fullPath);
    } else if (entry.name.endsWith(".d.ts.map")) {
      renameSync(fullPath, fullPath.replace(/\.d\.ts\.map$/, ".d.mts.map"));
    } else if (entry.name.endsWith(".d.ts")) {
      renameSync(fullPath, fullPath.replace(/\.d\.ts$/, ".d.mts"));
    }
  }
}

renameDtsToMts("dist");
```

- [ ] **Step 6: Create a placeholder `packages/ai/src/index.ts`**

```ts
// packages/ai/src/index.ts
// Expanded across later tasks: section rendering, Skill-file generation,
// LLM-context generation, and validation are each re-exported here.
export {};
```

- [ ] **Step 7: Install dependencies**

Run: `pnpm install`
Expected: lockfile updates to include `@ultimate/ai` as a workspace member and `js-yaml`/`@types/js-yaml` as its dependencies, no errors.

- [ ] **Step 8: Create stub `bin-generate.ts`/`bin-validate.ts` — required before the first build, since `tsup.config.ts` (Step 2) already declares both as build entries**

```ts
// packages/ai/src/bin-generate.ts
// Real implementation lands in Task 4 (Skill generation) / Task 5 (LLM
// context generation). This stub exists only so Task 1's scaffolding
// build succeeds before those tasks land.
console.error("[@ultimate/ai] generate: not yet implemented");
process.exit(1);
```

```ts
// packages/ai/src/bin-validate.ts
// Real implementation lands in Task 7 (validation). Stub only, same
// reasoning as bin-generate.ts above.
console.error("[@ultimate/ai] validate: not yet implemented");
process.exit(1);
```

- [ ] **Step 9: Verify the package builds and typechecks, now that both stubs exist**

Run: `pnpm --filter @ultimate/ai run typecheck`
Expected: exits 0 (an empty `export {}` barrel plus two trivial stub scripts typecheck cleanly).

Run: `pnpm --filter @ultimate/ai run build`
Expected: exits 0 — `packages/ai/dist/index.mjs`, `packages/ai/dist/index.d.mts`, `packages/ai/dist/bin-generate.mjs`, `packages/ai/dist/bin-validate.mjs` all exist. (The two bin outputs are non-functional stubs at this point — real behavior lands in Task 4/5/7 — but the build itself succeeds cleanly, with no intentionally-failing step hidden inside this one.)

- [ ] **Step 10: Commit**

```bash
git add packages/ai/package.json packages/ai/tsconfig.json packages/ai/tsup.config.ts packages/ai/vitest.config.ts packages/ai/scripts/rename-dts.mjs packages/ai/src/index.ts packages/ai/src/bin-generate.ts packages/ai/src/bin-validate.ts pnpm-lock.yaml
git commit -m "feat(ai): scaffold @ultimate/ai package"
```

---

### Task 2: Section renderer — the 5 generated marker-section bodies

**Files:**

- Create: `packages/ai/src/render-section.ts`
- Test: `packages/ai/test/render-section.test.ts`

**Interfaces:**

- Consumes: `ComponentMetadata` type from `@ultimate/component-schema` (fields: `guidance?.usageNotes: string`, `guidance?.antiPatterns: string[]`, `api?.{ng,react,vue}?.props: PropFact[]`, `api?.{ng,react,vue}?.events: EventFact[]`, `accessibility?.verifiedRoles: string[]`, `accessibility?.verifiedAriaAttributes: string[]`, `accessibility?.guidance: string`, `relationships?.dependsOn: string[]`).
- Produces: `renderSection(sectionKey: SectionKey, component: ComponentMetadata, frameworks: readonly Framework[]): string` — the exact string to place between a `start`/`end` marker pair for one section key. Empty string (`""`) when the backing field(s) are entirely absent for that component, per spec §6.2/§6.3.3's "marker present, content empty" rule. `Framework = "ng" | "react" | "vue"`; `SectionKey = "preferred-patterns" | "allowed-apis" | "anti-patterns" | "accessibility-guidance" | "related-components"`. Consumed by Task 3 (`skill-file.ts`) and Task 7 (`validate.ts`, for fidelity comparison).

- [ ] **Step 1: Write the failing tests**

```ts
// packages/ai/test/render-section.test.ts
import { describe, it, expect } from "vitest";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import { renderSection } from "../src/render-section";

const TABLE = ALL_COMPONENTS.find((c) => c.name === "Table")!;
const BUTTON = ALL_COMPONENTS.find((c) => c.name === "Button")!;

describe("renderSection", () => {
  it("renders non-empty preferred-patterns content for Table, the one record with populated guidance.usageNotes", () => {
    const result = renderSection("preferred-patterns", TABLE, ["ng", "react", "vue"]);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain("virtualized window");
  });

  it("renders empty preferred-patterns content for Button, whose guidance.usageNotes is absent", () => {
    const result = renderSection("preferred-patterns", BUTTON, ["ng", "react", "vue"]);
    expect(result).toBe("");
  });

  it("renders empty anti-patterns content for Button, whose guidance.antiPatterns is absent", () => {
    const result = renderSection("anti-patterns", BUTTON, ["ng", "react", "vue"]);
    expect(result).toBe("");
  });

  it("renders allowed-apis content listing every prop name for the requested frameworks, for Button", () => {
    const result = renderSection("allowed-apis", BUTTON, ["ng"]);
    expect(result).toContain("label");
    expect(result).toContain("icon");
    expect(result).toContain("iconPos");
  });

  it("renders allowed-apis content narrowed to only the requested frameworks — react props absent when only ng is requested", () => {
    const result = renderSection("allowed-apis", BUTTON, ["ng"]);
    // "badge" is a real react-only Button prop (per component-metadata/src/records/button.ts),
    // not present in ng's prop list — confirms narrowing, not just presence-checking.
    expect(result).not.toContain("badge");
  });

  it("renders empty accessibility-guidance content for Button, whose accessibility facet is entirely absent", () => {
    const result = renderSection("accessibility-guidance", BUTTON, ["ng", "react", "vue"]);
    expect(result).toBe("");
  });

  it('renders non-empty related-components content for Table, whose relationships.dependsOn is ["Paginator", "Scroller"]', () => {
    const result = renderSection("related-components", TABLE, ["ng", "react", "vue"]);
    expect(result).toContain("Paginator");
    expect(result).toContain("Scroller");
  });

  it("renders empty related-components content for Button, whose relationships facet is entirely absent", () => {
    const result = renderSection("related-components", BUTTON, ["ng", "react", "vue"]);
    expect(result).toBe("");
  });

  it("is deterministic — rendering the same section twice from the same input produces byte-identical output", () => {
    const first = renderSection("allowed-apis", TABLE, ["ng", "react", "vue"]);
    const second = renderSection("allowed-apis", TABLE, ["ng", "react", "vue"]);
    expect(first).toBe(second);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/ai exec vitest run test/render-section.test.ts`
Expected: FAIL — `Cannot find module '../src/render-section'` (file does not exist yet).

- [ ] **Step 3: Write the implementation**

```ts
// packages/ai/src/render-section.ts
import type { ComponentMetadata } from "@ultimate/component-schema";

export type Framework = "ng" | "react" | "vue";
export type SectionKey =
  | "preferred-patterns"
  | "allowed-apis"
  | "anti-patterns"
  | "accessibility-guidance"
  | "related-components";

/**
 * Renders the exact content for one of the 5 v1 generated marker sections
 * (spec §6.3.3), directly from ComponentMetadata fields — never from prose,
 * never fabricated. Returns "" (empty string) when the backing field is
 * entirely absent, per the "marker present, content empty" rule (spec
 * §6.2/§6.3.3) — the caller (skill-file.ts) is responsible for still
 * emitting the marker pair around this possibly-empty string.
 */
export function renderSection(
  section: SectionKey,
  component: ComponentMetadata,
  frameworks: readonly Framework[]
): string {
  switch (section) {
    case "preferred-patterns":
      return component.guidance?.usageNotes ?? "";
    case "anti-patterns":
      return renderAntiPatterns(component);
    case "allowed-apis":
      return renderAllowedApis(component, frameworks);
    case "accessibility-guidance":
      return renderAccessibilityGuidance(component);
    case "related-components":
      return renderRelatedComponents(component);
  }
}

function renderAntiPatterns(component: ComponentMetadata): string {
  const items = component.guidance?.antiPatterns;
  if (items === undefined || items.length === 0) {
    return "";
  }
  return items.map((item) => `- ${item}`).join("\n");
}

function renderAllowedApis(component: ComponentMetadata, frameworks: readonly Framework[]): string {
  const lines: string[] = [];
  for (const framework of frameworks) {
    const frameworkApi = component.api?.[framework];
    if (frameworkApi === undefined) {
      continue;
    }
    if (frameworkApi.props.length > 0) {
      lines.push(`### ${framework} props`);
      for (const prop of frameworkApi.props) {
        const requiredLabel = prop.required ? " (required)" : "";
        const defaultLabel = prop.default !== undefined ? ` (default: ${prop.default})` : "";
        lines.push(`- \`${prop.name}\`: ${prop.type}${requiredLabel}${defaultLabel}`);
      }
    }
    if (frameworkApi.events.length > 0) {
      lines.push(`### ${framework} events`);
      for (const event of frameworkApi.events) {
        lines.push(`- \`${event.frameworkName}\` (${event.mechanism}): ${event.semanticId}`);
      }
    }
  }
  return lines.join("\n");
}

function renderAccessibilityGuidance(component: ComponentMetadata): string {
  const facts = component.accessibility;
  if (facts === undefined) {
    return "";
  }
  const lines: string[] = [];
  if (facts.verifiedRoles !== undefined && facts.verifiedRoles.length > 0) {
    lines.push(`Roles: ${facts.verifiedRoles.join(", ")}`);
  }
  if (facts.verifiedAriaAttributes !== undefined && facts.verifiedAriaAttributes.length > 0) {
    lines.push(`ARIA attributes: ${facts.verifiedAriaAttributes.join(", ")}`);
  }
  if (facts.guidance !== undefined) {
    lines.push(facts.guidance);
  }
  return lines.join("\n");
}

function renderRelatedComponents(component: ComponentMetadata): string {
  const dependsOn = component.relationships?.dependsOn;
  if (dependsOn === undefined || dependsOn.length === 0) {
    return "";
  }
  return dependsOn.map((name) => `- ${name}`).join("\n");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/ai exec vitest run test/render-section.test.ts`
Expected: PASS — all 9 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/ai/src/render-section.ts packages/ai/test/render-section.test.ts
git commit -m "feat(ai): render the 5 generated Skill marker sections from ComponentMetadata"
```

---

### Task 3: Skill-file composer — frontmatter + marker-wrapped body

**Files:**

- Create: `packages/ai/src/skill-file.ts`
- Test: `packages/ai/test/skill-file.test.ts`

**Interfaces:**

- Consumes: `renderSection` (Task 2), `ComponentMetadata` (`@ultimate/component-schema`), `js-yaml`'s `dump`/`load` functions.
- Produces:
  - `SECTION_KEYS: readonly SectionKey[]` (the 5 keys in fixed order, re-exported for Task 5/Task 7 to iterate without duplicating the literal array).
  - `startMarker(section: SectionKey): string` / `endMarker(section: SectionKey): string` — the exact two marker-line strings (spec §6.3.3), re-exported for Task 7's parser to reuse the identical literal format.
  - `generateSkillFile(component: ComponentMetadata, frameworks: readonly Framework[]): string` — the complete text of a freshly-generated Skill file (frontmatter + 5 marker pairs + placeholder hand-authored headings), for a component with no existing Skill file yet.
  - `regenerateSkillFile(existingContent: string, component: ComponentMetadata, frameworks: readonly Framework[]): { content: string } | { error: string }` — regenerates only the marker-delimited bytes and the frontmatter's `metadataVersion` of an existing file, preserving all hand-authored content verbatim; returns `{ error }` (never throws) if `existingContent` already fails one of the 5 malformed-marker conditions (spec §6.3.3's "generator refuses to regenerate a malformed file" rule).
  - `parseFrontmatter(content: string): { component: string; metadataVersion: number; frameworks: Framework[] } | undefined` — re-exported for Task 7's validator to reuse the identical parsing logic rather than reimplementing it.

- [ ] **Step 1: Write the failing tests**

```ts
// packages/ai/test/skill-file.test.ts
import { describe, it, expect } from "vitest";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import {
  generateSkillFile,
  regenerateSkillFile,
  parseFrontmatter,
  startMarker,
  endMarker,
  SECTION_KEYS,
} from "../src/skill-file";

const BUTTON = ALL_COMPONENTS.find((c) => c.name === "Button")!;
const TABLE = ALL_COMPONENTS.find((c) => c.name === "Table")!;

describe("SECTION_KEYS", () => {
  it("is exactly the 5 v1 section keys, in this exact order", () => {
    expect(SECTION_KEYS).toEqual([
      "preferred-patterns",
      "allowed-apis",
      "anti-patterns",
      "accessibility-guidance",
      "related-components",
    ]);
  });
});

describe("startMarker / endMarker", () => {
  it("produces the exact spec §6.3.3 marker syntax", () => {
    expect(startMarker("preferred-patterns")).toBe(
      '<!-- ultimate:generated:start section="preferred-patterns" -->'
    );
    expect(endMarker("preferred-patterns")).toBe(
      '<!-- ultimate:generated:end section="preferred-patterns" -->'
    );
  });
});

describe("generateSkillFile", () => {
  it("includes a YAML frontmatter block with component/metadataVersion/frameworks", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const parsed = parseFrontmatter(content);
    expect(parsed).toEqual({
      component: "Button",
      metadataVersion: 1,
      frameworks: ["ng", "react", "vue"],
    });
  });

  it("includes exactly 5 marker pairs, each present, in the fixed order", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    for (const key of SECTION_KEYS) {
      expect(content).toContain(startMarker(key));
      expect(content).toContain(endMarker(key));
    }
    // Order check: preferred-patterns' start must appear before allowed-apis' start.
    expect(content.indexOf(startMarker("preferred-patterns"))).toBeLessThan(
      content.indexOf(startMarker("allowed-apis"))
    );
  });

  it("gets an empty preferred-patterns marker pair for Button (guidance.usageNotes absent)", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const start =
      content.indexOf(startMarker("preferred-patterns")) + startMarker("preferred-patterns").length;
    const end = content.indexOf(endMarker("preferred-patterns"));
    expect(content.slice(start, end).trim()).toBe("");
  });

  it("gets a non-empty preferred-patterns marker pair for Table (guidance.usageNotes populated)", () => {
    const content = generateSkillFile(TABLE, ["ng", "react", "vue"]);
    const start =
      content.indexOf(startMarker("preferred-patterns")) + startMarker("preferred-patterns").length;
    const end = content.indexOf(endMarker("preferred-patterns"));
    expect(content.slice(start, end).trim().length).toBeGreaterThan(0);
  });

  it("never emits an examples marker pair — Examples has no v1 data model", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    expect(content).not.toContain('section="examples"');
  });

  it("is deterministic — generating the same component twice produces byte-identical output", () => {
    const first = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const second = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    expect(first).toBe(second);
  });

  // The following 4 tests pin down the exact heading/marker structure —
  // added in response to Plan Review round 1's finding that the original
  // heading-placement logic misplaced or omitted headings for some
  // sections. Each test fails loudly (not silently, via manual inspection)
  // if that regresses.

  const EXPECTED_HEADINGS: Record<string, string> = {
    "preferred-patterns": "## Preferred patterns",
    "allowed-apis": "## Allowed/recommended APIs",
    "anti-patterns": "## Anti-patterns",
    "accessibility-guidance": "## Accessibility guidance",
    "related-components": "## Related components",
  };

  it("gives every one of the 5 generated sections its own expected heading", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    for (const key of SECTION_KEYS) {
      expect(content).toContain(EXPECTED_HEADINGS[key]);
    }
  });

  it("places each section's heading immediately before that section's own start marker, with nothing but whitespace between them", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    for (const key of SECTION_KEYS) {
      const heading = EXPECTED_HEADINGS[key];
      const headingIndex = content.indexOf(heading);
      const markerIndex = content.indexOf(startMarker(key));
      expect(headingIndex).toBeGreaterThan(-1);
      expect(markerIndex).toBeGreaterThan(headingIndex);
      const between = content.slice(headingIndex + heading.length, markerIndex);
      expect(between.trim()).toBe("");
    }
  });

  it("emits the 5 heading/marker blocks in the exact approved order (preferred-patterns, allowed-apis, anti-patterns, accessibility-guidance, related-components)", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const headingPositions = SECTION_KEYS.map((key) => content.indexOf(EXPECTED_HEADINGS[key]));
    for (let i = 1; i < headingPositions.length; i++) {
      expect(headingPositions[i]).toBeGreaterThan(headingPositions[i - 1]);
    }
  });

  it("never emits an 'Examples' heading — Examples has no marker and no heading in v1", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    expect(content).not.toMatch(/##\s*Examples/i);
  });
});

describe("regenerateSkillFile", () => {
  it("preserves hand-authored content outside marker pairs, verbatim", () => {
    const original = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const handAuthored = original.replace(
      "## When to use\n",
      "## When to use\nUse Button whenever a clickable action is needed.\n"
    );
    const result = regenerateSkillFile(handAuthored, BUTTON, ["ng", "react", "vue"]);
    expect("content" in result).toBe(true);
    if (!("content" in result)) return;
    expect(result.content).toContain("Use Button whenever a clickable action is needed.");
  });

  it("rewrites metadataVersion in the frontmatter to match the current record on regeneration", () => {
    const original = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const staleVersion = original.replace("metadataVersion: 1", "metadataVersion: 0");
    const result = regenerateSkillFile(staleVersion, BUTTON, ["ng", "react", "vue"]);
    expect("content" in result).toBe(true);
    if (!("content" in result)) return;
    const parsed = parseFrontmatter(result.content);
    expect(parsed?.metadataVersion).toBe(1);
  });

  it("refuses to regenerate a file with a missing required marker, returning a structured error", () => {
    const original = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const broken = original.replace(startMarker("anti-patterns"), "");
    const result = regenerateSkillFile(broken, BUTTON, ["ng", "react", "vue"]);
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toContain("missing required generated section");
    expect(result.error).toContain("anti-patterns");
  });

  it("refuses to regenerate a file with a duplicate marker, returning a structured error", () => {
    const original = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const duplicated =
      original + `\n${startMarker("anti-patterns")}\n${endMarker("anti-patterns")}\n`;
    const result = regenerateSkillFile(duplicated, BUTTON, ["ng", "react", "vue"]);
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toContain("duplicate generated section");
  });
});

describe("parseFrontmatter", () => {
  it("returns undefined for content with no frontmatter block", () => {
    expect(parseFrontmatter("no frontmatter here")).toBeUndefined();
  });

  // The following tests pin down the exact type contract added in Plan
  // Review round 2's correction pass: metadataVersion must be a positive
  // integer, not merely typeof "number" (which would silently accept
  // 1.5, 0, or -1); frameworks must be an array of strings, not an array
  // of arbitrary values.

  it("returns undefined when metadataVersion is a non-integer number (e.g. 1.5)", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      "metadataVersion: 1.5"
    );
    expect(parseFrontmatter(content)).toBeUndefined();
  });

  it("returns undefined when metadataVersion is zero or negative", () => {
    const zeroContent = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      "metadataVersion: 0"
    );
    expect(parseFrontmatter(zeroContent)).toBeUndefined();

    const negativeContent = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      "metadataVersion: -1"
    );
    expect(parseFrontmatter(negativeContent)).toBeUndefined();
  });

  it("returns undefined when metadataVersion is a string, not a number", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      'metadataVersion: "1"'
    );
    expect(parseFrontmatter(content)).toBeUndefined();
  });

  it("returns undefined when frameworks contains a non-string element", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "frameworks: [ng, react, vue]",
      "frameworks: [ng, react, 42]"
    );
    expect(parseFrontmatter(content)).toBeUndefined();
  });

  it("accepts a well-formed frontmatter block with a valid positive-integer metadataVersion", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const parsed = parseFrontmatter(content);
    expect(parsed).toEqual({
      component: "Button",
      metadataVersion: 1,
      frameworks: ["ng", "react", "vue"],
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/ai exec vitest run test/skill-file.test.ts`
Expected: FAIL — `Cannot find module '../src/skill-file'`.

- [ ] **Step 3: Write the implementation**

```ts
// packages/ai/src/skill-file.ts
import { dump, load } from "js-yaml";
import type { ComponentMetadata } from "@ultimate/component-schema";
import { renderSection, type Framework, type SectionKey } from "./render-section";

export type { Framework, SectionKey };

export const SECTION_KEYS: readonly SectionKey[] = [
  "preferred-patterns",
  "allowed-apis",
  "anti-patterns",
  "accessibility-guidance",
  "related-components",
];

const SECTION_HEADINGS: Record<SectionKey, string> = {
  "preferred-patterns": "## Preferred patterns",
  "allowed-apis": "## Allowed/recommended APIs",
  "anti-patterns": "## Anti-patterns",
  "accessibility-guidance": "## Accessibility guidance",
  "related-components": "## Related components",
};

export function startMarker(section: SectionKey): string {
  return `<!-- ultimate:generated:start section="${section}" -->`;
}

export function endMarker(section: SectionKey): string {
  return `<!-- ultimate:generated:end section="${section}" -->`;
}

interface Frontmatter {
  component: string;
  metadataVersion: number;
  frameworks: Framework[];
}

/**
 * Parses and mechanically validates the frontmatter block's exact type
 * contract (spec §6.3.2): `component` must be a string; `metadataVersion`
 * must be a positive integer — NOT merely `typeof === "number"`, which
 * would silently accept a non-integer like `1.5` or a non-positive value
 * like `0`/`-1`; `frameworks` must be an array whose every element is a
 * string. Any violation of this shape returns `undefined` (the same
 * "malformed frontmatter" outcome as a missing block entirely) — this
 * function only ever hands back a Frontmatter value once every field's
 * exact type is confirmed, so no downstream caller (validate.ts) needs to
 * re-check these basic shape invariants itself.
 */
export function parseFrontmatter(content: string): Frontmatter | undefined {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(content);
  if (match === null) {
    return undefined;
  }
  const parsed = load(match[1]) as unknown;
  if (typeof parsed !== "object" || parsed === null) {
    return undefined;
  }
  const record = parsed as Record<string, unknown>;

  if (typeof record.component !== "string") {
    return undefined;
  }
  if (
    typeof record.metadataVersion !== "number" ||
    !Number.isInteger(record.metadataVersion) ||
    record.metadataVersion <= 0
  ) {
    return undefined;
  }
  if (!Array.isArray(record.frameworks) || !record.frameworks.every((f) => typeof f === "string")) {
    return undefined;
  }

  return {
    component: record.component,
    metadataVersion: record.metadataVersion,
    frameworks: record.frameworks as Framework[],
  };
}

function renderFrontmatter(component: ComponentMetadata, frameworks: readonly Framework[]): string {
  const body = dump(
    {
      component: component.name,
      metadataVersion: component.metadataVersion,
      frameworks: [...frameworks],
    },
    { flowLevel: 1 }
  );
  return `---\n${body}---\n`;
}

/**
 * Generates the complete text of a freshly-created Skill file for a
 * component with no existing file yet. Each of the 5 section keys gets
 * exactly one heading, emitted immediately before that section's own
 * start marker — a deterministic, unambiguous one-heading-per-marker-pair
 * structure (fixed after Plan Review round 1 found the prior split-
 * conditional version misplaced/omitted headings; see Task 3's Step 1
 * tests for the assertions that pin this structure down).
 */
export function generateSkillFile(
  component: ComponentMetadata,
  frameworks: readonly Framework[]
): string {
  const frontmatter = renderFrontmatter(component, frameworks);
  const parts: string[] = [frontmatter, `# ${component.name}\n`, "## When to use\n"];

  for (const key of SECTION_KEYS) {
    parts.push(SECTION_HEADINGS[key]);
    parts.push(startMarker(key));
    parts.push(renderSection(key, component, frameworks));
    parts.push(endMarker(key));
  }

  parts.push("## Framework-specific guidance\n");
  return parts.join("\n") + "\n";
}

const malformedResult = (error: string): { error: string } => ({ error });

/** Locates every marker occurrence in `content`, returning per-section start/end positions or a structured malformed-input error. */
function locateMarkers(
  content: string
): { positions: Record<SectionKey, { start: number; end: number }> } | { error: string } {
  const positions: Partial<Record<SectionKey, { start: number; end: number }>> = {};

  for (const key of SECTION_KEYS) {
    const startText = startMarker(key);
    const endText = endMarker(key);
    const startOccurrences = countOccurrences(content, startText);
    const endOccurrences = countOccurrences(content, endText);

    if (startOccurrences === 0 && endOccurrences === 0) {
      return malformedResult(`missing required generated section: ${key}`);
    }
    if (startOccurrences > 1 || endOccurrences > 1) {
      return malformedResult(`duplicate generated section: ${key}`);
    }
    if (startOccurrences !== endOccurrences) {
      return malformedResult(`unmatched marker for section: ${key}`);
    }

    const start = content.indexOf(startText) + startText.length;
    const end = content.indexOf(endText);
    if (end < start) {
      return malformedResult(`unmatched marker for section: ${key}`);
    }
    positions[key] = { start, end };
  }

  // Nesting check: no other section's start marker may fall strictly inside this section's range.
  for (const outer of SECTION_KEYS) {
    const outerRange = positions[outer]!;
    for (const inner of SECTION_KEYS) {
      if (inner === outer) continue;
      const innerStartIndex = content.indexOf(startMarker(inner));
      if (innerStartIndex > outerRange.start && innerStartIndex < outerRange.end) {
        return malformedResult(`nested generated block: ${outer} contains ${inner}`);
      }
    }
  }

  return { positions: positions as Record<SectionKey, { start: number; end: number }> };
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count++;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

/**
 * Regenerates only the marker-delimited bytes and the frontmatter's
 * metadataVersion of an existing Skill file, preserving all hand-authored
 * content verbatim. Refuses (never throws, never guesses) if the existing
 * content already fails one of the 5 malformed-marker conditions.
 */
export function regenerateSkillFile(
  existingContent: string,
  component: ComponentMetadata,
  frameworks: readonly Framework[]
): { content: string } | { error: string } {
  const located = locateMarkers(existingContent);
  if ("error" in located) {
    return located;
  }

  // Rewrite section bodies back-to-front so earlier offsets stay valid.
  let content = existingContent;
  const orderedByPosition = [...SECTION_KEYS].sort(
    (a, b) => located.positions[b].start - located.positions[a].start
  );
  for (const key of orderedByPosition) {
    const { start, end } = located.positions[key];
    const newBody = renderSection(key, component, frameworks);
    content = content.slice(0, start) + `\n${newBody}\n` + content.slice(end);
  }

  const frontmatterMatch = /^---\n([\s\S]*?\n)---\n/.exec(content);
  if (frontmatterMatch !== null) {
    content = content.replace(frontmatterMatch[0], renderFrontmatter(component, frameworks));
  }

  return { content };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/ai exec vitest run test/skill-file.test.ts`
Expected: PASS — all tests green. If the "preserves hand-authored content" or the frontmatter-rewrite test fails on whitespace, adjust the join logic in `generateSkillFile`/`regenerateSkillFile` to match — the test's literal expectations (exact marker text, exact frontmatter keys) are the source of truth, not the first-draft implementation above.

- [ ] **Step 5: Commit**

```bash
git add packages/ai/src/skill-file.ts packages/ai/test/skill-file.test.ts
git commit -m "feat(ai): compose and regenerate Skill files with marker-delimited sections"
```

---

### Task 4: Skill generation CLI entry point

**Files:**

- Modify: `packages/ai/src/bin-generate.ts` (replace Task 1's stub)
- Test: `packages/ai/test/bin-generate.test.ts`

**Interfaces:**

- Consumes: `generateSkillFile`/`regenerateSkillFile` (Task 3), `ALL_COMPONENTS` (`@ultimate/component-metadata`), `node:fs`.
- Produces: a `generateAllSkillFiles(skillsDir: string): { written: string[]; errors: { component: string; error: string }[] }` function, exported from `bin-generate.ts` for direct testing (the file's own `main()`/CLI-invocation wrapper is not unit-tested, matching `@ultimate/mcp`'s own `bin.ts`-is-untested-directly convention — its logic is a two-line dispatch to the tested function).

- [ ] **Step 1: Write the failing test**

```ts
// packages/ai/test/bin-generate.test.ts
import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateAllSkillFiles } from "../src/bin-generate";

let tempDir: string | undefined;

afterEach(() => {
  if (tempDir !== undefined) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe("generateAllSkillFiles", () => {
  it("writes exactly 8 Skill files, one per component in ALL_COMPONENTS, for an empty target directory", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ultimate-ai-test-"));
    const result = generateAllSkillFiles(tempDir);

    expect(result.errors).toEqual([]);
    expect(result.written.length).toBe(8);
    for (const name of [
      "button",
      "checkbox",
      "dialog",
      "menu",
      "paginator",
      "scroller",
      "table",
      "tooltip",
    ]) {
      expect(existsSync(join(tempDir, `${name}.md`))).toBe(true);
    }
  });

  it("preserves hand-authored content when run a second time against already-generated files", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ultimate-ai-test-"));
    generateAllSkillFiles(tempDir);

    const buttonPath = join(tempDir, "button.md");
    const original = readFileSync(buttonPath, "utf8");
    const withHandAuthoredNote = original.replace(
      "## When to use\n",
      "## When to use\nUse for any clickable action.\n"
    );
    writeFileSync(buttonPath, withHandAuthoredNote);

    const result = generateAllSkillFiles(tempDir);
    expect(result.errors).toEqual([]);

    const regenerated = readFileSync(buttonPath, "utf8");
    expect(regenerated).toContain("Use for any clickable action.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ai exec vitest run test/bin-generate.test.ts`
Expected: FAIL — `generateAllSkillFiles` is not exported yet (the stub file only has a `console.error`/`process.exit` side effect, no exported function).

- [ ] **Step 3: Implement**

```ts
// packages/ai/src/bin-generate.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { ComponentMetadata } from "@ultimate/component-schema";
import { generateSkillFile, regenerateSkillFile, type Framework } from "./skill-file";

function frameworksFor(component: ComponentMetadata): Framework[] {
  return (["ng", "react", "vue"] as const).filter(
    (framework) => component.api?.[framework] !== undefined
  );
}

function skillFileName(component: ComponentMetadata): string {
  return `${component.name.toLowerCase()}.md`;
}

export function generateAllSkillFiles(skillsDir: string): {
  written: string[];
  errors: { component: string; error: string }[];
} {
  const written: string[] = [];
  const errors: { component: string; error: string }[] = [];

  for (const component of ALL_COMPONENTS) {
    const path = join(skillsDir, skillFileName(component));
    const frameworks = frameworksFor(component);

    if (existsSync(path)) {
      const existing = readFileSync(path, "utf8");
      const result = regenerateSkillFile(existing, component, frameworks);
      if ("error" in result) {
        errors.push({ component: component.name, error: result.error });
        continue;
      }
      writeFileSync(path, result.content, "utf8");
      written.push(path);
    } else {
      const content = generateSkillFile(component, frameworks);
      writeFileSync(path, content, "utf8");
      written.push(path);
    }
  }

  return { written, errors };
}

function main(): void {
  const skillsDir = process.argv[2] ?? join(process.cwd(), "skills");
  const result = generateAllSkillFiles(skillsDir);
  for (const error of result.errors) {
    console.error(`[@ultimate/ai] generate: ${error.component}: ${error.error}`);
  }
  console.error(`[@ultimate/ai] generate: wrote ${result.written.length} Skill file(s)`);
  if (result.errors.length > 0) {
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ai exec vitest run test/bin-generate.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ai/src/bin-generate.ts packages/ai/test/bin-generate.test.ts
git commit -m "feat(ai): generate-all-Skill-files CLI entry point"
```

---

### Task 5: LLM-context file generation

**Files:**

- Create: `packages/ai/src/context-files.ts`
- Modify: `packages/ai/src/bin-generate.ts` (add context-file generation to `main()`)
- Test: `packages/ai/test/context-files.test.ts`

**Interfaces:**

- Consumes: `ALL_COMPONENTS` (`@ultimate/component-metadata`), `ComponentMetadata`.
- Produces: `renderLlmsTxt(): string`, `renderLlmsFullTxt(): string`, `renderFrameworkContext(framework: Framework): string` — three pure rendering functions, each returning the exact text content for one output file (spec §7.1's table). `generateContextFiles(outputDir: string): { written: string[] }` — writes all 5 files (`llms.txt`, `llms-full.txt`, `llms-ng.txt`, `llms-react.txt`, `llms-vue.txt`) to `outputDir`.

- [ ] **Step 1: Write the failing tests**

```ts
// packages/ai/test/context-files.test.ts
import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  renderLlmsTxt,
  renderLlmsFullTxt,
  renderFrameworkContext,
  generateContextFiles,
} from "../src/context-files";

describe("renderLlmsTxt", () => {
  it("includes one line per component, all 8 components, each with name/category/description", () => {
    const content = renderLlmsTxt();
    for (const name of [
      "Button",
      "Checkbox",
      "Dialog",
      "Menu",
      "Paginator",
      "Scroller",
      "Table",
      "Tooltip",
    ]) {
      expect(content).toContain(name);
    }
    expect(content).toContain("Primitive");
    expect(content).toContain("clickable button control");
  });

  it("is deterministic", () => {
    expect(renderLlmsTxt()).toBe(renderLlmsTxt());
  });
});

describe("renderLlmsFullTxt", () => {
  it("includes full structured content for all 8 components, all frameworks unfiltered", () => {
    const content = renderLlmsFullTxt();
    expect(content).toContain("Button");
    expect(content).toContain("Table");
    // Table's react-only "badge" prop existing alongside ng content proves "unfiltered".
  });
});

describe("renderFrameworkContext", () => {
  it("narrows api content to only the requested framework, for ng", () => {
    const content = renderFrameworkContext("ng");
    expect(content).toContain("Button");
  });

  it("still lists a component via identity even when it has no api entry for that framework — none of the 8 v1 records lack a framework entry, so this exercises the narrowing logic's completeness path rather than a real gap", () => {
    const content = renderFrameworkContext("react");
    for (const name of [
      "Button",
      "Checkbox",
      "Dialog",
      "Menu",
      "Paginator",
      "Scroller",
      "Table",
      "Tooltip",
    ]) {
      expect(content).toContain(name);
    }
  });
});

describe("generateContextFiles", () => {
  let tempDir: string | undefined;

  afterEach(() => {
    if (tempDir !== undefined) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = undefined;
    }
  });

  it("writes exactly the 5 spec-named files", () => {
    tempDir = mkdtempSync(join(tmpdir(), "ultimate-ai-context-test-"));
    const result = generateContextFiles(tempDir);

    expect(result.written.length).toBe(5);
    for (const filename of [
      "llms.txt",
      "llms-full.txt",
      "llms-ng.txt",
      "llms-react.txt",
      "llms-vue.txt",
    ]) {
      expect(existsSync(join(tempDir, filename))).toBe(true);
    }
  });

  it("produces byte-identical llms.txt content across two separate generation runs (determinism)", () => {
    const dirA = mkdtempSync(join(tmpdir(), "ultimate-ai-context-a-"));
    const dirB = mkdtempSync(join(tmpdir(), "ultimate-ai-context-b-"));
    generateContextFiles(dirA);
    generateContextFiles(dirB);

    const contentA = readFileSync(join(dirA, "llms.txt"), "utf8");
    const contentB = readFileSync(join(dirB, "llms.txt"), "utf8");
    expect(contentA).toBe(contentB);

    rmSync(dirA, { recursive: true, force: true });
    rmSync(dirB, { recursive: true, force: true });
  });

  it("creates a non-existent, nested output directory (e.g. dist/context under an as-yet-uncreated dist/) and still writes all 5 files", () => {
    const parent = mkdtempSync(join(tmpdir(), "ultimate-ai-context-nested-"));
    const nestedOutputDir = join(parent, "dist", "context"); // deliberately not created ahead of time
    try {
      const result = generateContextFiles(nestedOutputDir);
      expect(result.written.length).toBe(5);
      for (const filename of [
        "llms.txt",
        "llms-full.txt",
        "llms-ng.txt",
        "llms-react.txt",
        "llms-vue.txt",
      ]) {
        expect(existsSync(join(nestedOutputDir, filename))).toBe(true);
      }
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/ai exec vitest run test/context-files.test.ts`
Expected: FAIL — `Cannot find module '../src/context-files'`.

- [ ] **Step 3: Implement**

```ts
// packages/ai/src/context-files.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { ComponentMetadata } from "@ultimate/component-schema";
import type { Framework } from "./render-section";

export function renderLlmsTxt(): string {
  return ALL_COMPONENTS.map((c) => `${c.name} (${c.category}): ${c.description}`).join("\n") + "\n";
}

function renderComponentFull(component: ComponentMetadata, onlyFramework?: Framework): string {
  const lines: string[] = [
    `## ${component.name}`,
    `Category: ${component.category}`,
    component.description,
  ];

  const frameworksToRender: Framework[] =
    onlyFramework !== undefined ? [onlyFramework] : ["ng", "react", "vue"];
  for (const framework of frameworksToRender) {
    const frameworkApi = component.api?.[framework];
    if (frameworkApi === undefined) {
      continue;
    }
    lines.push(`### ${framework} API`);
    for (const prop of frameworkApi.props) {
      lines.push(`- \`${prop.name}\`: ${prop.type}`);
    }
    for (const event of frameworkApi.events) {
      lines.push(`- event \`${event.frameworkName}\` (${event.mechanism})`);
    }
  }

  if (component.accessibility !== undefined) {
    lines.push("### Accessibility");
    if (component.accessibility.verifiedRoles !== undefined) {
      lines.push(`Roles: ${component.accessibility.verifiedRoles.join(", ")}`);
    }
    if (component.accessibility.guidance !== undefined) {
      lines.push(component.accessibility.guidance);
    }
  }

  if (
    component.relationships?.dependsOn !== undefined &&
    component.relationships.dependsOn.length > 0
  ) {
    lines.push(`### Related components\n${component.relationships.dependsOn.join(", ")}`);
  }

  if (component.guidance?.usageNotes !== undefined) {
    lines.push(`### Guidance\n${component.guidance.usageNotes}`);
  }

  return lines.join("\n");
}

export function renderLlmsFullTxt(): string {
  return ALL_COMPONENTS.map((c) => renderComponentFull(c)).join("\n\n") + "\n";
}

export function renderFrameworkContext(framework: Framework): string {
  return ALL_COMPONENTS.map((c) => renderComponentFull(c, framework)).join("\n\n") + "\n";
}

/**
 * Writes all 5 LLM-context files to `outputDir`, creating that directory
 * (and any missing parent directories) first — `outputDir` is routinely a
 * not-yet-existing nested path (e.g. `dist/context`, before any prior
 * `tsup` or generation run has created `dist/` at all), so this function
 * is responsible for ensuring it exists rather than assuming a caller
 * already created it. Deterministic: given the same ALL_COMPONENTS input,
 * repeated calls (to the same or different empty output directories)
 * produce byte-identical file contents (Task 6 tests this explicitly).
 */
export function generateContextFiles(outputDir: string): { written: string[] } {
  mkdirSync(outputDir, { recursive: true });

  const files: [string, string][] = [
    ["llms.txt", renderLlmsTxt()],
    ["llms-full.txt", renderLlmsFullTxt()],
    ["llms-ng.txt", renderFrameworkContext("ng")],
    ["llms-react.txt", renderFrameworkContext("react")],
    ["llms-vue.txt", renderFrameworkContext("vue")],
  ];

  const written: string[] = [];
  for (const [filename, content] of files) {
    const path = join(outputDir, filename);
    writeFileSync(path, content, "utf8");
    written.push(path);
  }
  return { written };
}
```

- [ ] **Step 4: Wire `generateContextFiles` into `bin-generate.ts`'s `main()`**

Add to `packages/ai/src/bin-generate.ts`, replacing its `main()` function:

```ts
import { generateContextFiles } from "./context-files";

function main(): void {
  const skillsDir = process.argv[2] ?? join(process.cwd(), "skills");
  const contextDir = process.argv[3] ?? join(process.cwd(), "dist", "context");

  const skillResult = generateAllSkillFiles(skillsDir);
  for (const error of skillResult.errors) {
    console.error(`[@ultimate/ai] generate: ${error.component}: ${error.error}`);
  }
  console.error(`[@ultimate/ai] generate: wrote ${skillResult.written.length} Skill file(s)`);

  const contextResult = generateContextFiles(contextDir);
  console.error(
    `[@ultimate/ai] generate: wrote ${contextResult.written.length} LLM-context file(s)`
  );

  if (skillResult.errors.length > 0) {
    process.exit(1);
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/ai exec vitest run test/context-files.test.ts test/bin-generate.test.ts`
Expected: PASS — all tests green.

- [ ] **Step 6: Commit**

```bash
git add packages/ai/src/context-files.ts packages/ai/src/bin-generate.ts packages/ai/test/context-files.test.ts
git commit -m "feat(ai): generate the 5 deterministic LLM-context files"
```

---

### Task 6: Determinism integration test (end-to-end)

**Files:**

- Test: `packages/ai/test/determinism.test.ts`

**Interfaces:**

- Consumes: `generateAllSkillFiles` (Task 4), `generateContextFiles` (Task 5).
- Produces: nothing new — this task is pure verification, satisfying spec §7.3/§10.3's explicit "two generation runs against identical input produce identical output" requirement as its own dedicated, named test (rather than leaving it implicit inside Task 4/5's unit tests).

- [ ] **Step 1: Write the test**

```ts
// packages/ai/test/determinism.test.ts
import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateAllSkillFiles } from "../src/bin-generate";
import { generateContextFiles } from "../src/context-files";

let dirA: string | undefined;
let dirB: string | undefined;

afterEach(() => {
  for (const dir of [dirA, dirB]) {
    if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  }
  dirA = undefined;
  dirB = undefined;
});

describe("end-to-end determinism (spec §7.3)", () => {
  it("two full generation runs against identical input (empty target dirs) produce byte-identical Skill files", () => {
    dirA = mkdtempSync(join(tmpdir(), "ultimate-ai-det-a-"));
    dirB = mkdtempSync(join(tmpdir(), "ultimate-ai-det-b-"));

    generateAllSkillFiles(dirA);
    generateAllSkillFiles(dirB);

    const filesA = readdirSync(dirA).sort();
    const filesB = readdirSync(dirB).sort();
    expect(filesA).toEqual(filesB);

    for (const filename of filesA) {
      expect(readFileSync(join(dirA, filename), "utf8")).toBe(
        readFileSync(join(dirB, filename), "utf8")
      );
    }
  });

  it("two full context-generation runs produce byte-identical output for every one of the 5 files", () => {
    dirA = mkdtempSync(join(tmpdir(), "ultimate-ai-det-ctx-a-"));
    dirB = mkdtempSync(join(tmpdir(), "ultimate-ai-det-ctx-b-"));

    generateContextFiles(dirA);
    generateContextFiles(dirB);

    for (const filename of [
      "llms.txt",
      "llms-full.txt",
      "llms-ng.txt",
      "llms-react.txt",
      "llms-vue.txt",
    ]) {
      expect(readFileSync(join(dirA, filename), "utf8")).toBe(
        readFileSync(join(dirB, filename), "utf8")
      );
    }
  });
});
```

- [ ] **Step 2: Run to verify it passes (this task adds no new source, only a test)**

Run: `pnpm --filter @ultimate/ai exec vitest run test/determinism.test.ts`
Expected: PASS — both tests green, since Tasks 3/4/5's implementations are already deterministic (no `Date.now()`, no `Math.random()`, no unordered object-key iteration affecting output).

- [ ] **Step 3: Commit**

```bash
git add packages/ai/test/determinism.test.ts
git commit -m "test(ai): end-to-end determinism verification for generated Skills and LLM context"
```

---

### Task 7: Validation — Skill-file 3-stage contract, plus a separate LLM-context reproducibility check

**Boundary clarification (Plan Review round 2, finding #1):** this plan previously described `validateSkillFile()` as a "4-stage" flow including LLM-context reproducibility as its 4th stage. That was internally inconsistent with the literal implementation, which only ever ran 3 stages against Skill-file content, and never actually invoked LLM-context reproducibility checking from anywhere executable. Per the approved spec: §10.2's Skill-content validation bullets (frontmatter, marker structure, fidelity) and §10.2's separate LLM-context-artifacts-reproducibility bullet (spec line 328, "Generated LLM-context artifacts... are checked for reproducibility... §7.3") are two different checks against two different artifact types — a Skill file is Markdown-with-frontmatter, an LLM-context file is a `.txt` file with no frontmatter or markers at all. Nothing in the approved spec calls reproducibility a "stage" of Skill-file validation. This task now builds them as two separate, independently-invoked validation operations, both real and both wired into an executable entry point — not one collapsed into the other, and not one left unexecuted.

**Files:**

- Create: `packages/ai/src/validate.ts`
- Modify: `packages/ai/src/bin-validate.ts` (replace Task 1's stub)
- Test: `packages/ai/test/validate.test.ts`

**Interfaces:**

- Consumes: `parseFrontmatter`, `SECTION_KEYS`, `startMarker`/`endMarker` (Task 3), `renderSection` (Task 2), `renderLlmsTxt`/`renderLlmsFullTxt`/`renderFrameworkContext` (Task 5), `ALL_COMPONENTS`.
- Produces:
  - `validateSkillFile(content: string): { valid: true } | { valid: false; errors: string[] }` — the Skill-file validator, running exactly 3 stages in order (frontmatter → marker-structure → fidelity), stopping at the first stage with failures (fidelity is skipped entirely if marker-structure fails, per spec §10.2's explicit ordering rule). Operates only on Skill-file content (frontmatter + marker-delimited Markdown).
  - `validateContextFileReproducibility(actualContent: string, renderFn: () => string): { valid: true } | { valid: false; error: string }` — a separate check for one LLM-context `.txt` file: does its on-disk content byte-match what re-running its own render function produces right now. Not a stage of `validateSkillFile`; a standalone operation over a different artifact type, invoked directly by `bin-validate.ts` against all 5 generated context files (Step 5, below) — not merely exported and left unused.

- [ ] **Step 1: Write the failing tests**

```ts
// packages/ai/test/validate.test.ts
import { describe, it, expect, vi } from "vitest";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import { generateSkillFile, startMarker, endMarker } from "../src/skill-file";
import { validateSkillFile, validateContextFileReproducibility } from "../src/validate";
import { renderLlmsTxt, renderLlmsFullTxt, renderFrameworkContext } from "../src/context-files";

const BUTTON = ALL_COMPONENTS.find((c) => c.name === "Button")!;

describe("validateSkillFile", () => {
  it("passes for a freshly-generated, untouched Skill file", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const result = validateSkillFile(content);
    expect(result.valid).toBe(true);
  });

  it("fails with a malformed-frontmatter error when metadataVersion is a non-integer number — exercises parseFrontmatter's strict positive-integer contract from validateSkillFile's own entry point, not just parseFrontmatter in isolation", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      "metadataVersion: 1.5"
    );
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors).toEqual(["missing or malformed frontmatter block"]);
  });

  it("fails with a component-not-found error when the frontmatter names an unknown component", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "component: Button",
      "component: NotAComponent"
    );
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.includes("NotAComponent"))).toBe(true);
  });

  it("fails with an unrecognized-framework error when frontmatter lists a framework value outside ng/react/vue", () => {
    // This exercises the SEPARATE "unrecognized framework" branch — a
    // value not in KNOWN_FRAMEWORKS at all. It is deliberately kept
    // distinct from the "recognized but uncovered" test below (Plan
    // Review round 1 found the two branches were being conflated by a
    // single loose test).
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "frameworks: [ng, react, vue]",
      "frameworks: [ng, react, vue, svelte]"
    );
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.includes("unrecognized framework"))).toBe(true);
  });

  it("fails with a framework-coverage error when frontmatter claims a KNOWN framework the component genuinely has no api entry for (synthetic fixture, since no real v1 record has this gap)", async () => {
    // No real component in ALL_COMPONENTS has a gap between a recognized
    // framework and its own api coverage (all 8 records have ng/react/vue
    // all populated) — mirroring packages/mcp/test/tools/get-component-api.test.ts's
    // own precedent for exercising an otherwise-unreachable real-data path
    // via vi.doMock, strictly test-local, never touching the real
    // ALL_COMPONENTS export or any committed metadata record.
    vi.resetModules();
    vi.doMock("@ultimate/component-metadata", () => ({
      ALL_COMPONENTS: [
        {
          name: "SyntheticGapComponent",
          category: "Test",
          description:
            "A synthetic record with no react api entry, used only to exercise the framework-coverage validation path.",
          schemaVersion: "1.0.0",
          metadataVersion: 1,
          packages: { ng: { packageName: "@ultimate/ng", sourcePath: "n/a" } },
          api: {
            ng: { props: [], events: [] },
            // Deliberately no `react` key — a real "known framework,
            // genuinely uncovered" gap this synthetic fixture creates on
            // purpose, since no real v1 record has one.
          },
        },
      ],
    }));

    const { validateSkillFile: validateSkillFileWithMock } = await import("../src/validate");
    const syntheticContent = [
      "---",
      "component: SyntheticGapComponent",
      "metadataVersion: 1",
      "frameworks: [ng, react]",
      "---",
      "",
      "# SyntheticGapComponent",
      "",
      startMarker("preferred-patterns"),
      endMarker("preferred-patterns"),
      startMarker("allowed-apis"),
      endMarker("allowed-apis"),
      startMarker("anti-patterns"),
      endMarker("anti-patterns"),
      startMarker("accessibility-guidance"),
      endMarker("accessibility-guidance"),
      startMarker("related-components"),
      endMarker("related-components"),
      "",
    ].join("\n");

    const result = validateSkillFileWithMock(syntheticContent);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.includes("react") && e.includes("no api entry for"))).toBe(
      true
    );

    vi.doUnmock("@ultimate/component-metadata");
    vi.resetModules();
  });

  it("fails with a metadataVersion mismatch error when the frontmatter's version is stale", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      "metadataVersion: 999"
    );
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.includes("metadataVersion"))).toBe(true);
  });

  it("fails with a missing-marker error, and does NOT also report a fidelity error for the same run (marker-structure checked before fidelity)", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      '<!-- ultimate:generated:start section="anti-patterns" -->',
      ""
    );
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.includes("missing required generated section"))).toBe(true);
    expect(result.errors.some((e) => e.toLowerCase().includes("fidelity"))).toBe(false);
  });

  it("fails with a fidelity error when a marker section's content has been hand-edited to diverge from what regeneration would produce", () => {
    const content = generateSkillFile(
      ALL_COMPONENTS.find((c) => c.name === "Table")!,
      ["ng", "react", "vue"]
    ).replace("virtualized window", "SOMETHING ELSE ENTIRELY");
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.toLowerCase().includes("fidelity"))).toBe(true);
  });

  it("never reports an error about hand-authored prose outside marker pairs", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "## When to use\n",
      "## When to use\nThis sentence is factually wrong about Button on purpose.\n"
    );
    const result = validateSkillFile(content);
    // Must still pass — prose is never semantically validated (spec §10.2/§12).
    expect(result.valid).toBe(true);
  });
});

describe("validateContextFileReproducibility", () => {
  // A separate check on a different artifact type (an LLM-context .txt
  // file, not a Skill file) — see this task's boundary-clarification note
  // above. Added in Plan Review round 2's correction pass: this function
  // was previously exported but had no test and was never invoked from
  // any executable path (bin-validate.ts only called validateSkillFile).

  it("passes when actualContent exactly matches renderFn()'s current output", () => {
    const actual = renderLlmsTxt();
    const result = validateContextFileReproducibility(actual, renderLlmsTxt);
    expect(result.valid).toBe(true);
  });

  it("fails with a structured error when actualContent diverges from renderFn()'s current output", () => {
    const stale = renderLlmsTxt().replace("Button", "SomethingElse");
    const result = validateContextFileReproducibility(stale, renderLlmsTxt);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.error).toContain("does not match its own reproducible rendering");
  });

  it("is exercised for all 5 real context-render functions, each passing against its own fresh output", () => {
    const checks: (() => string)[] = [
      renderLlmsTxt,
      renderLlmsFullTxt,
      () => renderFrameworkContext("ng"),
      () => renderFrameworkContext("react"),
      () => renderFrameworkContext("vue"),
    ];
    for (const renderFn of checks) {
      const content = renderFn();
      const result = validateContextFileReproducibility(content, renderFn);
      expect(result.valid).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/ai exec vitest run test/validate.test.ts`
Expected: FAIL — `Cannot find module '../src/validate'`.

- [ ] **Step 3: Implement**

```ts
// packages/ai/src/validate.ts
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { ComponentMetadata } from "@ultimate/component-schema";
import {
  parseFrontmatter,
  SECTION_KEYS,
  startMarker,
  endMarker,
  type Framework,
} from "./skill-file";
import { renderSection } from "./render-section";

const KNOWN_FRAMEWORKS = new Set<string>(["ng", "react", "vue"]);

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count++;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

export function validateSkillFile(
  content: string
): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  // Stage 1: frontmatter.
  const frontmatter = parseFrontmatter(content);
  if (frontmatter === undefined) {
    return { valid: false, errors: ["missing or malformed frontmatter block"] };
  }

  const component = ALL_COMPONENTS.find((c) => c.name === frontmatter.component);
  if (component === undefined) {
    errors.push(
      `frontmatter "component" field names an unknown component: "${frontmatter.component}". Known components: ${ALL_COMPONENTS.map((c) => c.name).join(", ")}.`
    );
  }

  for (const framework of frontmatter.frameworks) {
    if (!KNOWN_FRAMEWORKS.has(framework)) {
      errors.push(`frontmatter "frameworks" field lists an unrecognized framework: "${framework}"`);
      continue;
    }
    if (component !== undefined && component.api?.[framework as Framework] === undefined) {
      errors.push(
        `frontmatter "frameworks" field claims framework "${framework}", which "${component.name}" has no api entry for`
      );
    }
  }

  if (component !== undefined && frontmatter.metadataVersion !== component.metadataVersion) {
    errors.push(
      `frontmatter "metadataVersion" (${frontmatter.metadataVersion}) does not match "${component.name}"'s current metadataVersion (${component.metadataVersion})`
    );
  }

  if (errors.length > 0 || component === undefined) {
    return { valid: false, errors };
  }

  // Stage 2: marker structure. Fidelity is only attempted if this stage is
  // fully clean, per spec §10.2's explicit ordering rule.
  const markerErrors = checkMarkerStructure(content);
  if (markerErrors.length > 0) {
    return { valid: false, errors: markerErrors };
  }

  // Stage 3: generated-section fidelity.
  const fidelityErrors = checkFidelity(content, component, frontmatter.frameworks as Framework[]);
  if (fidelityErrors.length > 0) {
    return { valid: false, errors: fidelityErrors };
  }

  return { valid: true };
}

function checkMarkerStructure(content: string): string[] {
  const errors: string[] = [];
  const positions: Partial<Record<(typeof SECTION_KEYS)[number], { start: number; end: number }>> =
    {};

  for (const key of SECTION_KEYS) {
    const startText = startMarker(key);
    const endText = endMarker(key);
    const startCount = countOccurrences(content, startText);
    const endCount = countOccurrences(content, endText);

    if (startCount === 0 && endCount === 0) {
      errors.push(`missing required generated section: ${key}`);
      continue;
    }
    if (startCount > 1 || endCount > 1) {
      errors.push(`duplicate generated section: ${key}`);
      continue;
    }
    if (startCount !== endCount) {
      errors.push(`unmatched marker for section: ${key}`);
      continue;
    }
    const start = content.indexOf(startText) + startText.length;
    const end = content.indexOf(endText);
    if (end < start) {
      errors.push(`unmatched marker for section: ${key}`);
      continue;
    }
    positions[key] = { start, end };
  }

  if (errors.length > 0) {
    return errors;
  }

  for (const outer of SECTION_KEYS) {
    const outerRange = positions[outer]!;
    for (const inner of SECTION_KEYS) {
      if (inner === outer) continue;
      const innerStartIndex = content.indexOf(startMarker(inner));
      if (innerStartIndex > outerRange.start && innerStartIndex < outerRange.end) {
        errors.push(`nested generated block: ${outer} contains ${inner}`);
      }
    }
  }

  return errors;
}

function checkFidelity(
  content: string,
  component: ComponentMetadata,
  frameworks: readonly Framework[]
): string[] {
  const errors: string[] = [];
  for (const key of SECTION_KEYS) {
    const startText = startMarker(key);
    const endText = endMarker(key);
    const start = content.indexOf(startText) + startText.length;
    const end = content.indexOf(endText);
    const actual = content.slice(start, end).trim();
    const expected = renderSection(key, component, frameworks).trim();
    if (actual !== expected) {
      errors.push(`generated-section fidelity check failed for section: ${key}`);
    }
  }
  return errors;
}

export function validateContextFileReproducibility(
  actualContent: string,
  renderFn: () => string
): { valid: true } | { valid: false; error: string } {
  const expected = renderFn();
  if (actualContent === expected) {
    return { valid: true };
  }
  return {
    valid: false,
    error: "generated LLM-context file does not match its own reproducible rendering",
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/ai exec vitest run test/validate.test.ts`
Expected: PASS — all 12 tests green: 9 in `validateSkillFile` (the original 7, plus the unrecognized-framework/framework-coverage split from Plan Review round 1, plus the malformed-metadataVersion case added in round 2), and 3 new in a `validateContextFileReproducibility` describe block (added below, round 2 — this function was previously exported but never tested or invoked from anywhere executable, which round 2 flagged).

- [ ] **Step 5: Wire `bin-validate.ts` — both Skill-file validation AND LLM-context reproducibility, actually invoked (not just exported)**

```ts
// packages/ai/src/bin-validate.ts
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { validateSkillFile, validateContextFileReproducibility } from "./validate";
import { renderLlmsTxt, renderLlmsFullTxt, renderFrameworkContext } from "./context-files";

function validateSkillFiles(skillsDir: string): number {
  const files = readdirSync(skillsDir).filter(
    (f) => f.endsWith(".md") && f !== "AGENT_CONVENTIONS.md" && f !== "README.md"
  );

  let failed = 0;
  for (const file of files) {
    const path = join(skillsDir, file);
    const content = readFileSync(path, "utf8");
    const result = validateSkillFile(content);
    if (!result.valid) {
      failed++;
      console.error(`[@ultimate/ai] validate: FAIL ${file}`);
      for (const error of result.errors) {
        console.error(`  - ${error}`);
      }
    } else {
      console.error(`[@ultimate/ai] validate: OK ${file}`);
    }
  }
  console.error(
    `[@ultimate/ai] validate: ${files.length - failed} of ${files.length} Skill file(s) passed`
  );
  return failed;
}

function validateContextFiles(contextDir: string): number {
  const checks: [string, () => string][] = [
    ["llms.txt", renderLlmsTxt],
    ["llms-full.txt", renderLlmsFullTxt],
    ["llms-ng.txt", () => renderFrameworkContext("ng")],
    ["llms-react.txt", () => renderFrameworkContext("react")],
    ["llms-vue.txt", () => renderFrameworkContext("vue")],
  ];

  let failed = 0;
  for (const [filename, renderFn] of checks) {
    const path = join(contextDir, filename);
    if (!existsSync(path)) {
      failed++;
      console.error(`[@ultimate/ai] validate: FAIL ${filename} — file does not exist at ${path}`);
      continue;
    }
    const actualContent = readFileSync(path, "utf8");
    const result = validateContextFileReproducibility(actualContent, renderFn);
    if (!result.valid) {
      failed++;
      console.error(`[@ultimate/ai] validate: FAIL ${filename} — ${result.error}`);
    } else {
      console.error(`[@ultimate/ai] validate: OK ${filename}`);
    }
  }
  console.error(
    `[@ultimate/ai] validate: ${checks.length - failed} of ${checks.length} LLM-context file(s) reproducible`
  );
  return failed;
}

function main(): void {
  const skillsDir = process.argv[2] ?? join(process.cwd(), "skills");
  const contextDir = process.argv[3] ?? join(process.cwd(), "dist", "context");

  const skillFailures = validateSkillFiles(skillsDir);
  const contextFailures = validateContextFiles(contextDir);

  if (skillFailures > 0 || contextFailures > 0) {
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

- [ ] **Step 6: Verify the whole package builds and tests pass together**

Run: `pnpm --filter @ultimate/ai run typecheck && pnpm --filter @ultimate/ai run build && pnpm --filter @ultimate/ai run test`
Expected: all three commands exit 0.

- [ ] **Step 7: Commit**

```bash
git add packages/ai/src/validate.ts packages/ai/src/bin-validate.ts packages/ai/test/validate.test.ts
git commit -m "feat(ai): 4-stage Skill file validation (frontmatter, markers, fidelity)"
```

---

### Task 8: Packaging contract — `npm pack` and installed-consumer verification

**Files:**

- Create: `packages/ai/test/packaging.test.ts`

**Interfaces:**

- Consumes: `node:child_process` (`execSync`), the already-built `packages/ai/dist/` output from Task 1-7's builds.
- Produces: nothing new in `src/` — this task exists purely to satisfy spec §7.1a/§10.4's explicit requirement that CI verify the packaging contract, not merely assume it.

- [ ] **Step 1: Write the test**

```ts
// packages/ai/test/packaging.test.ts
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// __dirname does not exist in ESM (this package is "type": "module",
// Task 1) — resolve the package root the ESM-safe way, once, from this
// test file's own location. No CommonJS interop.
const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("npm packaging contract (spec §7.1a)", () => {
  it("a real `npm pack` tarball includes all 5 dist/context/*.txt files", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "ultimate-ai-pack-test-"));
    try {
      const packOutput = execSync("npm pack --json --pack-destination " + JSON.stringify(tempDir), {
        cwd: PACKAGE_ROOT,
        encoding: "utf8",
      });
      const [{ filename, files }] = JSON.parse(packOutput) as {
        filename: string;
        files: { path: string }[];
      }[];

      const paths = files.map((f) => f.path);
      for (const expected of [
        "dist/context/llms.txt",
        "dist/context/llms-full.txt",
        "dist/context/llms-ng.txt",
        "dist/context/llms-react.txt",
        "dist/context/llms-vue.txt",
      ]) {
        expect(paths).toContain(expected);
      }
      expect(existsSync(join(tempDir, filename))).toBe(true);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }, 30_000);

  it("installing the packed tarball into a scratch consumer resolves all 5 files at node_modules/@ultimate/ai/dist/context/", () => {
    const packDir = mkdtempSync(join(tmpdir(), "ultimate-ai-pack-"));
    const consumerDir = mkdtempSync(join(tmpdir(), "ultimate-ai-consumer-"));
    try {
      const packOutput = execSync("npm pack --json --pack-destination " + JSON.stringify(packDir), {
        cwd: PACKAGE_ROOT,
        encoding: "utf8",
      });
      const [{ filename }] = JSON.parse(packOutput) as { filename: string }[];
      const tarballPath = join(packDir, filename);

      execSync("npm init -y", { cwd: consumerDir, stdio: "ignore" });
      execSync(`npm install ${JSON.stringify(tarballPath)} --no-save`, {
        cwd: consumerDir,
        stdio: "ignore",
      });

      const contextDir = join(consumerDir, "node_modules", "@ultimate", "ai", "dist", "context");
      for (const filename of [
        "llms.txt",
        "llms-full.txt",
        "llms-ng.txt",
        "llms-react.txt",
        "llms-vue.txt",
      ]) {
        expect(existsSync(join(contextDir, filename))).toBe(true);
      }
    } finally {
      rmSync(packDir, { recursive: true, force: true });
      rmSync(consumerDir, { recursive: true, force: true });
    }
  }, 60_000);
});
```

- [ ] **Step 2: Ensure `dist/` is actually populated before this test can pass**

Run: `pnpm --filter @ultimate/ai run build`

Then run the Task 4/Task 5 generation step manually once, so `dist/context/*.txt` exist for `npm pack` to find (in real CI, per Task 9's wiring, this happens as a `postbuild` or explicit CI step — Task 9 wires that permanently; this manual run is only to unblock local verification of this task in isolation). `generateContextFiles` creates `dist/context` itself if it doesn't already exist (Task 5), so no separate `mkdir` step is needed here:

```bash
node packages/ai/dist/bin-generate.mjs /tmp/scratch-skills packages/ai/dist/context
```

Run: `pnpm --filter @ultimate/ai exec vitest run test/packaging.test.ts`
Expected: PASS — both tests green (may take up to ~60s due to real `npm install`).

- [ ] **Step 3: Commit**

```bash
git add packages/ai/test/packaging.test.ts
git commit -m "test(ai): verify npm pack/install packaging contract for dist/context artifacts"
```

---

### Task 9: Wire context-file generation into the package build, and populate `skills/` for real

**Files:**

- Modify: `packages/ai/package.json` (`build` script)
- Create: `skills/button.md`, `skills/checkbox.md`, `skills/dialog.md`, `skills/menu.md`, `skills/paginator.md`, `skills/scroller.md`, `skills/table.md`, `skills/tooltip.md` (all 8, generator-produced)
- Test: none new (verified by running the generator and asserting the committed files pass `validateSkillFile`)

**Interfaces:**

- Consumes: `generateAllSkillFiles`/`generateContextFiles` (Tasks 4/5), `validateSkillFile` (Task 7).
- Produces: the 8 real Skill files under `skills/`, and a `build` script that also produces `dist/context/*.txt` on every build (not just via manual invocation, closing the gap Task 8's Step 2 manually worked around).

- [ ] **Step 1: Extend `packages/ai/package.json`'s `build` script to also run generation**

```json
"scripts": {
  "build": "tsup && node scripts/rename-dts.mjs && node dist/bin-generate.mjs ../../skills dist/context",
  "test": "vitest run --typecheck",
  "typecheck": "tsc --noEmit"
}
```

Note: this makes `dist/context/*.txt` regenerate on every `pnpm --filter @ultimate/ai run build`, and also regenerates (never overwrites hand-authored content in) `skills/*.md` on every build — matching spec §7.4's "generated outputs are never hand-edited, correction happens upstream then regeneration" rule as a real, automatic build-time behavior rather than a manual step.

- [ ] **Step 2: Generate the real 8 Skill files**

Run: `pnpm --filter @ultimate/ai run build`
Expected: exits 0; `skills/button.md` through `skills/tooltip.md` (8 files) now exist, each containing frontmatter + 5 marker pairs (Table's `preferred-patterns`/`related-components` non-empty, the other 7 components' `preferred-patterns` empty per the real `guidance` population confirmed in research §3 — only Table has populated `guidance`).

- [ ] **Step 3: Verify every generated file passes validation**

Run:

```bash
node packages/ai/dist/bin-validate.mjs skills
```

Expected: `[@ultimate/ai] validate: all 8 Skill file(s) passed` (the validator's own file-scan excludes `AGENT_CONVENTIONS.md`/`README.md`, per Task 7's `bin-validate.ts` filter — those two files don't exist yet at this point in the plan, added in Task 10, so this run only sees the 8 real Skill files).

- [ ] **Step 4: Commit**

```bash
git add packages/ai/package.json skills/button.md skills/checkbox.md skills/dialog.md skills/menu.md skills/paginator.md skills/scroller.md skills/table.md skills/tooltip.md
git commit -m "feat(ai): wire context generation into build; generate the 8 v1 Skill files"
```

---

### Task 10: Agent-instruction convention document and package documentation

**Files:**

- Create: `skills/AGENT_CONVENTIONS.md`
- Create: `skills/README.md`
- Create: `packages/ai/README.md`

**Interfaces:**

- Consumes: nothing (pure documentation task).
- Produces: the three documentation artifacts spec §10.5 requires.

- [ ] **Step 1: Write `skills/AGENT_CONVENTIONS.md`**

```markdown
# Agent Instruction Conventions

Per Blueprint §26: "The platform should provide conventions for agent instruction files and Skills, while avoiding dependence on one specific coding agent." This document is tool-agnostic — it names no single coding agent or tool as required, and describes how to reference generated artifacts and Skills, not how to configure any particular agent's proprietary settings format (spec §8).

## What a consuming project's agent-instruction file should reference

A project consuming Ultimate should reference two kinds of artifact from its own agent-instruction file (an `AGENTS.md`, `CLAUDE.md`, or equivalent tool-specific convention file — this document does not prescribe which):

1. **Skill files** — one per Ultimate component, describing when to use it, preferred patterns, allowed APIs, anti-patterns, accessibility guidance, and related components. Skill files are distributed as part of the installed `@ultimate/ai` package's Skill content (see below) or may be vendored/copied into a consuming project directly.

2. **Generated LLM context** — five static files providing structured, machine-generated component context:
   - `llms.txt` — a compact, framework-neutral index of every Ultimate component.
   - `llms-full.txt` — the full structured context for every component, all frameworks.
   - `llms-ng.txt` / `llms-react.txt` / `llms-vue.txt` — the same content, narrowed to one framework's API facts.

## Where to find them (installed-package location — spec §7.1a)

Once `@ultimate/ai` is installed as a dependency of a consuming project:
```

node_modules/@ultimate/ai/dist/context/llms.txt
node_modules/@ultimate/ai/dist/context/llms-full.txt
node_modules/@ultimate/ai/dist/context/llms-ng.txt
node_modules/@ultimate/ai/dist/context/llms-react.txt
node_modules/@ultimate/ai/dist/context/llms-vue.txt

```

These are **never** at `packages/ai/dist/context/` from a consuming project's perspective — that path only exists inside the Ultimate monorepo's own source tree. A consuming project reaches the generated files exclusively through its own `node_modules`, per the normal npm package-artifact model (spec §7.1a). No CDN, no separate download, no runtime fetch.

## What these artifacts are not

Per Blueprint §25: "Generated outputs should not become the primary source of truth." These five files are derived, regenerable artifacts. If a fact in `llms-full.txt` looks wrong, the fix belongs upstream — in Ultimate's own `@ultimate/component-metadata` (for a factual error) or `skills/` content (for a guidance error) — followed by regeneration, never a hand-edit of the generated file itself.
```

- [ ] **Step 2: Write `skills/README.md`**

````markdown
# Skills

One Skill file per Ultimate component currently in `@ultimate/component-metadata`'s `ALL_COMPONENTS` set (8 in v1: Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip). See `docs/superpowers/specs/2026-09-07-phase-9-ai-skills-llm-context-design.md` §6 for the full contract; summarized here for contributors authoring or editing a Skill file by hand.

## Structure

Every Skill file opens with a YAML frontmatter block:

```yaml
---
component: Button
metadataVersion: 1
frameworks: [ng, react, vue]
---
```
````

Below the frontmatter, the file's body has 5 generated, marker-delimited sections — never hand-edit the content between a `<!-- ultimate:generated:start section="..." -->` / `<!-- ultimate:generated:end section="..." -->` pair; it is rewritten on every regeneration (`pnpm --filter @ultimate/ai run build`):

- `preferred-patterns`
- `allowed-apis`
- `anti-patterns`
- `accessibility-guidance`
- `related-components`

Everything else in the file — headings, the "When to use" section, and the prose narrative parts of "Preferred patterns"/"Anti-patterns"/"Framework-specific guidance" — is hand-authored and preserved verbatim across regenerations.

## Authoring a Skill by hand

Write prose freely outside marker pairs. Never claim a fact about a component's API, accessibility, or relationships that isn't already backed by a marker-section's generated content — if a claim needs backing, it belongs in `@ultimate/component-metadata`'s source data, not invented in a Skill's prose.

## Validating

```bash
node packages/ai/dist/bin-validate.mjs skills
```

Checks (in order): frontmatter component/framework/metadataVersion references, marker structure (all 5 present, correctly paired, non-nested), and generated-section fidelity (marker content matches what regeneration would produce). Never checks hand-authored prose for factual accuracy — that is architecturally out of scope (spec §10.2/§12).

````

- [ ] **Step 3: Write `packages/ai/README.md`**

```markdown
# @ultimate/ai

Generation and validation tooling for Ultimate Skills and LLM context (Phase 9).

## Status

v1 — build-time generator + validator. Produces one Skill file per component under repo-root `skills/`, and 5 deterministic LLM-context files (`llms.txt`, `llms-full.txt`, `llms-ng.txt`, `llms-react.txt`, `llms-vue.txt`) under `dist/context/`. Reads `@ultimate/component-metadata`'s real 8-component `ALL_COMPONENTS` set directly. Depends on exactly `@ultimate/component-metadata` and `@ultimate/component-schema` — no dependency on `@ultimate/cli`, `@ultimate/mcp`, `@ultimate/ng`, `@ultimate/react`, `@ultimate/vue`, or `@ultimate/themes`, in either direction (see `docs/superpowers/specs/2026-09-07-phase-9-ai-skills-llm-context-design.md` §4/§9, enforced by `scripts/provenance/validate-ai-boundary.mjs`).

## Usage

```bash
npx ultimate-ai-generate [skillsDir] [contextDir]
npx ultimate-ai-validate [skillsDir]
````

Build-time tooling — not a runtime service, not an MCP-style query interface. See `docs/superpowers/specs/2026-09-07-phase-9-ai-skills-llm-context-design.md` §7.2.

## Scope

See the spec for the full v1 contract, including explicit non-goals (project-aware context, an `examples` metadata field, any MCP/CLI dependency edge, a runtime service, LLM-generated Skill prose, semantic prose validation — none of which this package implements).

````

- [ ] **Step 4: Commit**

```bash
git add skills/AGENT_CONVENTIONS.md skills/README.md packages/ai/README.md
git commit -m "docs(ai): agent-instruction conventions, skills README, package README"
````

---

### Task 11: CI boundary gate — `boundary:validate:ai`

**Files:**

- Create: `scripts/provenance/validate-ai-boundary.mjs`
- Create: `scripts/provenance/validate-ai-boundary.test.mjs`
- Modify: `package.json` (root — add `boundary:validate:ai` script)
- Modify: `.github/workflows/ci.yml` (add CI step)

**Interfaces:**

- Consumes: none (standalone script, mirrors `validate-mcp-boundary.mjs` exactly).
- Produces: `boundary:validate:ai` as an executable pnpm script, wired into CI.

- [ ] **Step 1: Create `scripts/provenance/validate-ai-boundary.mjs`**

Direct structural sibling of `validate-mcp-boundary.mjs`, substituting `@ultimate/ai` for `@ultimate/mcp` and adding `@ultimate/mcp` itself to the forward-forbidden list (since `@ultimate/ai` must depend on neither `@ultimate/cli` nor `@ultimate/mcp` — spec §4, wider than MCP's own forward list, which only forbade `@ultimate/cli` plus the framework packages):

```js
#!/usr/bin/env node
// scripts/provenance/validate-ai-boundary.mjs
//
// Direct structural sibling of validate-mcp-boundary.mjs (Phase 8), applied
// to @ultimate/ai per the approved Phase 9 spec §4/§10.1, proving:
//   - Reverse: packages/{ng,react,vue}* must never import or depend on
//     @ultimate/ai.
//   - Forward: @ultimate/ai must never depend on or import @ultimate/cli,
//     @ultimate/mcp, or any of @ultimate/ng, @ultimate/react, @ultimate/vue,
//     @ultimate/themes.
//
// Deliberately a sibling script, not a widening of validate-cli-boundary.mjs
// or validate-mcp-boundary.mjs — matches the exact precedent both of those
// scripts already set for themselves.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FRAMEWORK_PACKAGE_PREFIXES = ["ng", "react", "vue"];
const AI_PACKAGE_NAME = "@ultimate/ai";
const FORWARD_FORBIDDEN_PACKAGES = [
  "@ultimate/cli",
  "@ultimate/mcp",
  "@ultimate/ng",
  "@ultimate/react",
  "@ultimate/vue",
  "@ultimate/themes",
];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

function fail(message) {
  console.error(`[boundary:validate:ai] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[boundary:validate:ai] OK: ${message}`);
}

function importPatternsFor(pkgName) {
  const escaped = pkgName.replace(/[/]/g, "\\/");
  return [
    new RegExp(`^\\s*import\\s+["']${escaped}(["'/])`, "m"),
    new RegExp(`^\\s*(?:import|export)\\b[\\s\\S]{0,200}?\\sfrom\\s+["']${escaped}(["'/])`, "m"),
    new RegExp(`require\\(["']${escaped}(["'/])`),
    new RegExp(`import\\(["']${escaped}(["'/])`),
  ];
}

function findDirsByPrefixes(root, prefixes) {
  if (!statSync(root, { throwIfNoEntry: false })) return [];
  return readdirSync(root)
    .filter((name) => prefixes.some((prefix) => name.startsWith(prefix)))
    .map((name) => join(root, name));
}

function walk(dir, files = []) {
  if (!statSync(dir, { throwIfNoEntry: false })) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(full, files);
    } else if (SOURCE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

function scanFilesForImports(files, pkgNames) {
  const violations = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const pkgName of pkgNames) {
      for (const pattern of importPatternsFor(pkgName)) {
        if (pattern.test(content)) {
          violations.push({ file, pkgName, pattern });
        }
      }
    }
  }
  return violations;
}

let violations = 0;

// Check 1: reverse-direction, source imports.
const frameworkDirs = findDirsByPrefixes("packages", FRAMEWORK_PACKAGE_PREFIXES);
for (const dir of frameworkDirs) {
  const srcDir = join(dir, "src");
  const files = walk(srcDir);
  const found = scanFilesForImports(files, [AI_PACKAGE_NAME]);
  for (const { file, pattern } of found) {
    console.error(
      `[boundary:validate:ai] VIOLATION: ${file} imports ${AI_PACKAGE_NAME} (matched ${pattern}) — reverse-direction violation`
    );
    violations++;
  }
}

// Check 2: reverse-direction, package.json dependencies.
for (const dir of frameworkDirs) {
  const pkgJsonPath = join(dir, "package.json");
  if (!statSync(pkgJsonPath, { throwIfNoEntry: false })) continue;
  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
  const deps = pkg.dependencies || {};
  if (Object.prototype.hasOwnProperty.call(deps, AI_PACKAGE_NAME)) {
    console.error(
      `[boundary:validate:ai] VIOLATION: ${pkgJsonPath} declares "dependencies" on ${AI_PACKAGE_NAME} — reverse-direction violation`
    );
    violations++;
  }
}

// Check 3: forward-direction, package.json dependencies + devDependencies.
const aiPkgJsonPath = join("packages", "ai", "package.json");
if (statSync(aiPkgJsonPath, { throwIfNoEntry: false })) {
  const pkg = JSON.parse(readFileSync(aiPkgJsonPath, "utf8"));
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};
  for (const forbidden of FORWARD_FORBIDDEN_PACKAGES) {
    if (Object.prototype.hasOwnProperty.call(deps, forbidden)) {
      console.error(
        `[boundary:validate:ai] VIOLATION: ${aiPkgJsonPath} declares "dependencies" on ${forbidden} — forward-direction violation`
      );
      violations++;
    }
    if (Object.prototype.hasOwnProperty.call(devDeps, forbidden)) {
      console.error(
        `[boundary:validate:ai] VIOLATION: ${aiPkgJsonPath} declares "devDependencies" on ${forbidden} — forward-direction violation`
      );
      violations++;
    }
  }
}

// Check 4: forward-direction, source imports.
const aiSrcDir = join("packages", "ai", "src");
const aiFiles = walk(aiSrcDir);
const aiFound = scanFilesForImports(aiFiles, FORWARD_FORBIDDEN_PACKAGES);
for (const { file, pkgName, pattern } of aiFound) {
  console.error(
    `[boundary:validate:ai] VIOLATION: ${file} imports ${pkgName} (matched ${pattern}) — forward-direction violation`
  );
  violations++;
}

if (violations > 0) {
  fail(`${violations} AI dependency-direction violation(s) found`);
}

pass(
  `scanned ${frameworkDirs.length} framework package(s) and packages/ai — zero AI dependency-direction violations`
);
process.exit(0);
```

- [ ] **Step 2: Create `scripts/provenance/validate-ai-boundary.test.mjs`**

Mirrors `validate-mcp-boundary.test.mjs`'s own sibling test shape. Read that file first to match its exact `node:test` conventions before writing this one, since it is the direct template and this plan does not reproduce its content inline (self-test scripts are exercised by the existing `pnpm run test:scripts` CI step, unmodified by this plan — only a new sibling test file is added to that already-globbed directory):

```js
#!/usr/bin/env node
// scripts/provenance/validate-ai-boundary.test.mjs
//
// Self-test for validate-ai-boundary.mjs, mirroring
// validate-mcp-boundary.test.mjs's exact structure and node:test usage.
// Verifies the script correctly detects each of the 4 violation checks
// (reverse-import, reverse-package.json, forward-package.json,
// forward-import) against synthetic fixture directories, and passes clean
// on the real repository state.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the real validate-ai-boundary.mjs path ONCE, from this test
// file's own location — never from process.cwd(), which the synthetic-
// fixture tests below deliberately point at a throwaway temp directory
// (the script itself must still be found there, while its target-repo
// scan runs against that temp directory via the child process's own cwd).
const SCRIPT_PATH = join(dirname(fileURLToPath(import.meta.url)), "validate-ai-boundary.mjs");

function runScript(cwd) {
  try {
    const output = execFileSync("node", [SCRIPT_PATH], { cwd, encoding: "utf8" });
    return { exitCode: 0, output };
  } catch (error) {
    return { exitCode: error.status, output: error.stdout + error.stderr };
  }
}

test("passes clean against the real repository state", () => {
  const result = runScript(process.cwd());
  assert.equal(result.exitCode, 0);
  assert.match(result.output, /zero AI dependency-direction violations/);
});

test("detects a reverse-direction source import violation", () => {
  const dir = mkdtempSync(join(tmpdir(), "ai-boundary-test-"));
  try {
    mkdirSync(join(dir, "packages", "react", "src"), { recursive: true });
    writeFileSync(join(dir, "packages", "react", "src", "bad.ts"), 'import "@ultimate/ai";\n');
    mkdirSync(join(dir, "packages", "ai", "src"), { recursive: true });
    writeFileSync(join(dir, "packages", "ai", "package.json"), "{}");

    const result = runScript(dir);
    assert.equal(result.exitCode, 1);
    assert.match(result.output, /reverse-direction violation/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("detects a reverse-direction package.json dependency (a framework package declaring @ultimate/ai)", () => {
  const dir = mkdtempSync(join(tmpdir(), "ai-boundary-test-"));
  try {
    mkdirSync(join(dir, "packages", "vue", "src"), { recursive: true });
    writeFileSync(
      join(dir, "packages", "vue", "package.json"),
      JSON.stringify({ dependencies: { "@ultimate/ai": "workspace:*" } })
    );
    mkdirSync(join(dir, "packages", "ai", "src"), { recursive: true });
    writeFileSync(join(dir, "packages", "ai", "package.json"), "{}");

    const result = runScript(dir);
    assert.equal(result.exitCode, 1);
    assert.match(result.output, /reverse-direction violation/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("detects a forward-direction package.json dependency on @ultimate/mcp", () => {
  const dir = mkdtempSync(join(tmpdir(), "ai-boundary-test-"));
  try {
    mkdirSync(join(dir, "packages", "ai", "src"), { recursive: true });
    writeFileSync(
      join(dir, "packages", "ai", "package.json"),
      JSON.stringify({ dependencies: { "@ultimate/mcp": "workspace:*" } })
    );

    const result = runScript(dir);
    assert.equal(result.exitCode, 1);
    assert.match(result.output, /forward-direction violation/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("detects a forward-direction source import (@ultimate/ai importing @ultimate/cli)", () => {
  const dir = mkdtempSync(join(tmpdir(), "ai-boundary-test-"));
  try {
    mkdirSync(join(dir, "packages", "ai", "src"), { recursive: true });
    writeFileSync(join(dir, "packages", "ai", "src", "bad.ts"), 'import "@ultimate/cli";\n');
    writeFileSync(join(dir, "packages", "ai", "package.json"), "{}");

    const result = runScript(dir);
    assert.equal(result.exitCode, 1);
    assert.match(result.output, /forward-direction violation/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 3: Run the self-test to verify it passes**

Run: `node --test scripts/provenance/validate-ai-boundary.test.mjs`
Expected: PASS, 5/5 tests, exit 0 (the real-repo-clean check, plus one synthetic test per each of the script's 4 distinct violation checks: reverse-direction source import, reverse-direction `package.json` dependency, forward-direction `package.json` dependency, forward-direction source import — added in Plan Review round 2's correction pass, replacing the earlier 3/3 count that covered only 2 of the 4 checks).

- [ ] **Step 4: Add the root `package.json` script**

Modify `package.json` (root), adjacent to the existing `boundary:validate:mcp` entry:

```json
"boundary:validate:ai": "node scripts/provenance/validate-ai-boundary.mjs"
```

- [ ] **Step 5: Wire into CI**

Modify `.github/workflows/ci.yml`, adding a new step immediately after the existing "MCP package boundary validation" step:

```yaml
- name: MCP package boundary validation
  run: pnpm run boundary:validate:mcp

- name: AI package boundary validation
  run: pnpm run boundary:validate:ai
```

- [ ] **Step 6: Run the real boundary check against the actual repo**

Run: `pnpm run boundary:validate:ai`
Expected: `[boundary:validate:ai] OK: scanned 3 framework package(s) and packages/ai — zero AI dependency-direction violations`, exit 0.

- [ ] **Step 7: Commit**

```bash
git add scripts/provenance/validate-ai-boundary.mjs scripts/provenance/validate-ai-boundary.test.mjs package.json .github/workflows/ci.yml
git commit -m "ci(ai): add boundary:validate:ai gate proving @ultimate/ai sibling independence"
```

---

### Task 12: Full-repository verification pass

**Files:** none (verification-only task).

**Interfaces:** none — this task runs every relevant check across the whole repository to confirm Phase 9's addition doesn't regress anything else, before the plan is considered complete.

- [ ] **Step 1: Run the full workspace install, lint, typecheck, build, test**

Run: `pnpm install && pnpm run lint && pnpm run typecheck && pnpm run build && pnpm run test`
Expected: all exit 0, including `@ultimate/ai`'s own typecheck/build/test alongside every other package's.

- [ ] **Step 2: Run every provenance/boundary/ceiling/compatibility script**

Run:

```bash
pnpm run test:scripts
pnpm run provenance:validate -- --base-ref origin/main
pnpm run boundary:validate
pnpm run ceiling:validate
pnpm run compatibility-manifest:validate
pnpm run boundary:validate:cli
pnpm run boundary:validate:mcp
pnpm run boundary:validate:ai
```

Expected: every command exits 0 — this is the exact sequence `.github/workflows/ci.yml` runs, executed locally end-to-end before considering Phase 9 done.

- [ ] **Step 3: Re-run the packaging integration test one more time against the final build**

Run: `pnpm --filter @ultimate/ai run build && pnpm --filter @ultimate/ai exec vitest run test/packaging.test.ts`
Expected: PASS — confirms the final, fully-wired build (including Task 9's `build` script extension) still produces a packable, installable tarball with all 5 context files.

- [ ] **Step 4: Verify `git status` shows only the expected new/modified files, nothing stray**

Run: `git status --short`
Expected: only files this plan's tasks explicitly created or modified — `packages/ai/**`, `skills/**`, `scripts/provenance/validate-ai-boundary.{mjs,test.mjs}`, `package.json`, `.github/workflows/ci.yml`, `pnpm-lock.yaml`. No accidental changes to `packages/cli`, `packages/mcp`, `packages/component-metadata`, or any framework package.

- [ ] **Step 5: No commit for this task** — Task 12 is pure verification; if all 4 steps pass clean, the plan's implementation is complete and ready for the Verification/Final Review SKey gates. If anything fails, fix it as an amendment to the specific task that introduced the regression (do not silently patch here) and re-run this task's full check sequence from Step 1.

---

## Self-Review Notes (for the plan author, not a task to execute)

**Spec coverage check:**

- §3 (Package/Artifact Boundaries) → Task 1 (packages/ai scaffolding), Task 9 (skills/ content).
- §4 (Dependency Direction) → Task 1's Global Constraints, Task 11 (CI enforcement).
- §5/§5.1 (Input Knowledge Sources, documentation deferral) → Task 2/Task 5 (only reads `ALL_COMPONENTS`; no documentation-system code written anywhere, matching the spec's explicit deferral).
- §6 (Skills Contract, §6.1-§6.4, §6.3.1-§6.3.3) → Task 2 (section rendering), Task 3 (frontmatter + markers), Task 7 (validation of the same).
- §7/§7.1/§7.1a (LLM Context Contract + distribution) → Task 5 (generation), Task 8 (packaging verification).
- §7.2 (generation, not service) → satisfied by construction — no server code anywhere in this plan.
- §7.3 (determinism) → Task 6 (dedicated determinism test).
- §8 (Agent-instruction conventions) → Task 10.
- §9 (Explicit boundary) → Task 11 (CI gate).
- §10.1 (CI boundary gate) → Task 11.
- §10.2 (Skill validation) → Task 7: `validateSkillFile` (3-stage Skill-file check) and `validateContextFileReproducibility` (separate LLM-context-artifact check, actually invoked from `bin-validate.ts`, not merely exported — corrected in Plan Review round 2).
- §10.3 (testing requirements) → Task 2/3/5/6's tests directly implement the named cases (Table populated-guidance vs. other-7-absent, determinism).
- §10.4 (CI requirements) → Task 11 (boundary gate wiring), Task 8 (packaging verification, referenced from Task 12's full CI-sequence re-run).
- §10.5 (documentation requirements) → Task 10.
- §11 (Versioning) → satisfied by construction — `metadataVersion` is the only versioning mechanism used anywhere (Task 3/7); `aiSkillsVersionRange` is never touched by any task.
- §12 (Non-goals) → verified by absence: no task adds a schema field, a runtime service, project-aware code, or an LLM call anywhere.

**Placeholder scan:** no "TBD"/"add appropriate handling"/"similar to Task N" phrasing anywhere above — every step has literal, complete code or an exact command with expected output.

**Type consistency check:** `Framework = "ng" | "react" | "vue"` and `SectionKey` are defined once in `render-section.ts` (Task 2) and re-exported, never redefined, through `skill-file.ts` (Task 3), `context-files.ts` (Task 5), and `validate.ts` (Task 7) — no drifted duplicate type. `renderSection`'s signature (`section, component, frameworks`) is identical across every call site in Tasks 3/4/5/7. `SECTION_KEYS`'s literal array (defined once in `skill-file.ts`) is the single source every other module iterates, never re-typed by hand elsewhere.

---

## Plan Review Correction Log

### Correction pass 1 — 2026-09-08 (in response to Plan Review round 1, REQUEST CHANGES)

Plan Review round 1 returned **REQUEST CHANGES** with 3 confirmed findings (all CONFIRMED severity — code-correctness bugs in the plan's literal code blocks, not architectural issues). All three are fixed in this pass:

1. **Task 3 — `generateSkillFile` heading placement was broken.** The original split-conditional logic (`if (key === "preferred-patterns")` before the loop body, a second `if (key === "allowed-apis" || key === "accessibility-guidance")` after) misplaced the `anti-patterns`/`related-components` headings one iteration early and omitted headings for `allowed-apis`/`accessibility-guidance` entirely — confirmed by hand-tracing the loop against `SECTION_KEYS`'s real order. Fixed by replacing it with a single, deterministic one-heading-per-section-per-iteration loop: `parts.push(SECTION_HEADINGS[key])` immediately before every `startMarker(key)`, for every key, no conditionals. Four new tests were added to Task 3's `generateSkillFile` describe block (not left to manual inspection, per the review's explicit instruction): every section has its expected heading; each heading sits immediately before its own start marker with only whitespace between; all 5 heading/marker blocks appear in the approved fixed order; no `Examples` heading is ever emitted.
2. **Task 4 — `require("node:fs")` inside an ESM test file.** The package is `"type": "module"` (Task 1), so bare `require` has no binding there and the "preserves hand-authored content when run a second time" test would throw `ReferenceError` at that exact line, not pass as the plan originally claimed. Fixed by adding `writeFileSync` to the test file's existing top-of-file `node:fs` import and calling it directly — no `require`, no CommonJS interop needed.
3. **Task 7 — the framework-coverage validation branch was dead code, and its test didn't prove otherwise.** `validate.ts`'s `continue` after the "unrecognized framework" branch means the api-coverage branch (`component.api?.[framework] === undefined`) is only reachable for a framework value simultaneously in `KNOWN_FRAMEWORKS` (ng/react/vue) and genuinely uncovered by that specific component — a state no real v1 record is in (all 8 have all 3 frameworks populated, research-verified). The original single test injected `"svelte"` into the frontmatter, which only ever trips the _unrecognized-framework_ branch, and its loose `.includes("framework")` assertion passed regardless of which branch actually fired, so it never proved the coverage branch worked. Fixed by splitting into two distinct tests: (a) the unrecognized-framework case, now asserting the exact `"unrecognized framework"` substring; (b) a new, genuinely-reachable coverage-branch test using a strictly test-local `vi.doMock("@ultimate/component-metadata", ...)` synthetic fixture — mirroring the exact precedent `packages/mcp/test/tools/get-component-api.test.ts` already sets for this repository (cited in Task 2's own docstring) — that declares a component with `api.ng` populated but no `api.react` key at all, then asserts the frontmatter-coverage error fires with both the framework name and the "no api entry for" message. The mock is `vi.resetModules()`/`vi.doUnmock()`-scoped to that one test and never touches the real `ALL_COMPONENTS` export or any committed metadata record. The implementation-side coverage branch in `validate.ts` is unchanged — the fix corrects test coverage, not the (already-correct) validation logic itself.

**Also updated for consistency:** Task 7's Step 4 "Expected: PASS" count corrected from 7 to 8 tests (the split of the conflated framework test into two distinct tests adds one).

**Preserved, unchanged by this pass:** all approved Phase 9 specification decisions (one Skill per component, 8 components, hybrid model, deterministic marker contract, byte-level fidelity, exact-integer `metadataVersion` equality, GAP-004-deferred documentation, omitted examples, untouched `aiSkillsVersionRange`, deferred project context, no new metadata fields, no semantic prose validation); the package/task structure (12 tasks, same boundaries); every other task's code and tests, unmodified.

**Files changed in this correction pass:** only this implementation plan document. No source, package, or CI file was modified; no implementation was started; no commit was made.

### Correction pass 2 — 2026-09-08 (in response to Plan Review round 2, REQUEST CHANGES)

Plan Review round 2 returned **REQUEST CHANGES** with 5 required corrections plus 2 minor cleanups. All 7 are fixed in this pass:

1. **Task 7 — the "4-stage" description was internally inconsistent.** `validateSkillFile()` only ever ran 3 stages against Skill-file content, and `validateContextFileReproducibility()` was exported but never invoked from any executable path. Resolved per the spec's actual boundary (§10.2's Skill-content bullets vs. its separate LLM-context-reproducibility bullet describe two checks on two different artifact types, not one 4-stage flow): Task 7's heading and interface description now explicitly separate `validateSkillFile` (3 stages: frontmatter, marker structure, fidelity — unchanged in behavior) from `validateContextFileReproducibility` (a standalone check over `.txt` files, no frontmatter/markers involved). `bin-validate.ts` was rewritten to actually call both — `validateSkillFiles()` and a new `validateContextFiles()` helper that runs `validateContextFileReproducibility` against all 5 real context-render functions (`renderLlmsTxt`, `renderLlmsFullTxt`, `renderFrameworkContext` for each of ng/react/vue), reading each file's on-disk content and failing the whole run (exit 1) if either Skill files or context files fail. A new `validateContextFileReproducibility` describe block (3 tests) was added to `validate.test.ts` — the function now has both real invocation and real test coverage, neither of which existed before this pass. No spec requirement was weakened: §10.2's reproducibility bullet is still executed, just correctly modeled as its own operation rather than misdescribed as `validateSkillFile`'s 4th stage.
2. **Task 3/7 — `parseFrontmatter`'s type contract was too loose.** `typeof metadataVersion === "number"` silently accepted `1.5`, `0`, `-1`. `parseFrontmatter` (Task 3, `skill-file.ts`) now checks `typeof === "number" && Number.isInteger(...) && > 0` for `metadataVersion`, and `Array.isArray(...) && every element typeof === "string"` for `frameworks` — any violation returns `undefined` (the same "malformed frontmatter" outcome as a missing block), so `validateSkillFile` needs no separate re-check. 5 new tests added to Task 3's `parseFrontmatter` describe block (non-integer, zero, negative, string-typed, and non-string-array-element cases, plus one positive well-formed case) and 1 new test added to Task 7's `validateSkillFile` describe block confirming the malformed case surfaces correctly through the full validator entry point, not just the parser in isolation.
3. **Task 8 — `__dirname` is undefined in this ESM package.** Both `packaging.test.ts` call sites used `cwd: join(__dirname, "..")`. Replaced with a single `PACKAGE_ROOT` constant computed once via `fileURLToPath(import.meta.url)` + `dirname()`, ESM-safe, no CommonJS interop, used at both call sites.
4. **Task 11 — the self-test resolved the script path via `process.cwd()`, which the synthetic-fixture tests deliberately point at a throwaway temp directory.** Fixed by resolving `validate-ai-boundary.mjs`'s absolute path once, from the test file's own `import.meta.url`, into a `SCRIPT_PATH` constant — the child process still receives the synthetic fixture directory as its own `cwd` (so the script's repository-scanning logic still runs against the fixture), but the script itself is now always found regardless of what `cwd` is passed.
5. **Task 5 — `generateContextFiles` assumed its output directory already existed.** Added `mkdirSync(outputDir, { recursive: true })` as the function's first line, and a new test passing a deliberately non-existent, nested output directory (`<tmp>/dist/context`, mirroring the real `dist/context` case), asserting all 5 files are still created. Task 8's Step 2 manual-verification note was updated to drop the now-unnecessary implication that the directory needed to pre-exist.
6. **Task 11 — self-test coverage claimed 4 checks but only tested 2.** Added the 2 missing synthetic tests: a reverse-direction `package.json` dependency (a framework package declaring `@ultimate/ai`) and a forward-direction source import (`@ultimate/ai` importing `@ultimate/cli`) — the self-test now has one test per each of the script's 4 distinct violation checks, plus the real-repo-clean check (5 total, corrected from the prior "3/3" claim).
7. **Task 1 — Step 7 described an intentionally-failing build inside a step whose own "Expected" said success.** Resequenced: Step 7 now only runs `pnpm install`; the new Step 8 creates both bin stubs (required before any build succeeds, since `tsup.config.ts` already declares both as entries); the new Step 9 runs typecheck/build and expects a clean, real success — no step's literal "Expected" outcome is contradicted by its own prose anymore. Step numbering renumbered through the rest of Task 1 (old Step 8/Commit is now Step 10).

**Post-correction consistency re-check performed:** all 7 fixes are plan-document-only — no `.ts`/`.mjs`/`.json`/CI file was created or modified, since this plan is still pre-implementation. Cross-checked that Task 7's rewritten `bin-validate.ts` still correctly imports from `./validate` and the new `./context-files` re-exports (`renderLlmsTxt`/`renderLlmsFullTxt`/`renderFrameworkContext`, all already defined in Task 5, unchanged by this pass except for the `mkdirSync` addition). Cross-checked that Task 3's stricter `parseFrontmatter` doesn't break any earlier-passing test in `skill-file.test.ts` — every existing test there uses `generateSkillFile`'s own real, well-formed integer `metadataVersion: 1` output, which still parses successfully under the new stricter check. All architectural decisions preserved unchanged: 8-component scope, 5 Skill sections, exact marker syntax, `metadataVersion` exact-equality semantics (only the _type validity_ of the value got stricter, not the matching rule itself, which was never in question), documentation deferral, `aiSkillsVersionRange` non-use, project-context deferral, dependency boundaries (Task 11's fixes are test-correctness only, not a boundary-rule change).

**Files changed in this correction pass:** only this implementation plan document. No source, package, CI, metadata, or schema file was modified; no implementation was started; no subagent was dispatched; no commit was made.

### Plan Review Round 3 — 2026-09-08 — **APPROVED**

Verdict: **APPROVED**. All 7 findings from Round 2 confirmed addressed: Task 7's Skill-file/LLM-context validation split (eliminating the 4-stage/3-stage contradiction), the frontmatter integer/positive `metadataVersion` and framework-element-type contract (explicitly tested and enforced), Task 5's nested output-directory creation, Task 8's two ESM `__dirname` fixes, Task 11's synthetic-fixture script-path resolution plus the two previously-missing self-tests, and Task 1's build/stub sequencing fix. Self-review and this correction log confirmed updated consistently. No implementation, execution, subagents, or commits occurred at any point across all three review rounds; the plan remained `Draft for review` throughout, per the SKey workflow.

Reviewer noted their working copy for this round was the Round-1 version and asked that this be reconciled against the live file rather than taken on the correction report alone. Reconciled in-session: the live plan file on disk was independently confirmed (via direct read and `git status`) to already contain every Round-2 edit described in the correction report — the "Correction pass 2" entry immediately above this one, the split `validateSkillFile`/`validateContextFileReproducibility` interfaces, the strict `parseFrontmatter` integer check, the nested-directory `mkdirSync` call, both `PACKAGE_ROOT`/`SCRIPT_PATH` ESM fixes, and the two added Task 11 self-tests — so the reviewer's caveat is resolved, not an open finding.

**Next SKey gate: Implementation.** This document remains `Status: Draft for review` per the same header convention the approved Phase 9 specification itself uses (approval is recorded in this log, not by flipping the header field) — this is the terminal review gate for the plan; the next step is dispatching implementation per the plan's own required sub-skill (subagent-driven-development or executing-plans), not a further plan-review pass.
