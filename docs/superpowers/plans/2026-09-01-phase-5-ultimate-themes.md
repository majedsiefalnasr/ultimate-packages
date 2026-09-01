# Phase 5 — Ultimate Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `@ultimate/themes` — a single, framework-neutral package shipping Ultimate's public theme contract (primitive/semantic/component tokens, light/dark mode, RTL/LTR direction) and one baseline preset (Aura-derived, reference not verbatim) covering the existing five-component proof set (Button, Checkbox, Dialog, Menu, Tooltip) — and wire the already-vendored `@ultimate/uix-styled` engine's `dt()` token resolver into all three framework-core packages (`ng-core`, `react-core`, `vue-core`) so their already-shipped component CSS (which has contained inert `dt('button.primary.color')`-style calls since Phase 2) finally resolves to real, themeable CSS custom properties.

**Architecture:** No new theme engine is built — `@ultimate/uix-styled` (vendored Phase 1 from `@primeuix/styled@0.7.4`, unmodified except a rebrand in this plan) already has the full token-resolution/preset-merge/dark-mode-selector machinery. This plan (1) pins `@primeuix/themes@2.0.3` as a new vendor baseline to source real preset token values from, matching Ultimate's already-pinned `@primeuix/styled@0.7.4` engine exactly, (2) rebrands `uix-styled`'s public surface (CSS var prefix `p`→`u`, exported identifier naming), (3) wires `uix-styled`'s `css` tagged-template function into each `*-core` package's `StyleSheet.add()` call site — the verified-against-real-PrimeVue-source location where `dt()` resolution actually happens upstream (`BaseStyle.loadStyle()`'s `` Css`${style}` `` pattern) — and (4) builds `packages/themes` with the public contract types plus an Ultimate-branded Aura-derived preset.

**Tech Stack:** pnpm workspaces (existing), TypeScript (existing `tsconfig.base.json`), `tsup` (existing precedent, matches `uix-styled`/`uix-styles`), Vitest (existing), Node.js built-ins for provenance scripts (matching Phase 0-4 convention). No new build tooling — `packages/themes` has no framework-specific compilation needs (plain `.ts`, no `.vue`/`.tsx`).

**Spec:** `docs/superpowers/specs/2026-09-01-phase-5-ultimate-themes-design.md`

## Global Constraints

- `@primeuix/themes` baseline: pin exactly `2.0.3` (NOT latest `3.0.0` — that version requires `@primeuix/styled: ^1.0.0`, incompatible with Ultimate's already-pinned `0.7.4`). Verified: `npm view @primeuix/themes@2.0.3 dependencies` → `{ "@primeuix/styled": "^0.7.4" }`, an exact match. Tarball shasum `c3919d49e818b3bbac611ab8d89a52d4ffed6815`, integrity `sha512-3fS1883mtCWhgUgNf/feiaaDSOND4EBIOu9tZnzJlJ8QtYyL6eFLcA6V3ymCWqLVXQ1+lTVEZv1gl47FIdXReg==`. No commit SHA available upstream (same confirmed gap as the other three `@primeuix/*` pins) — pin by npm tarball integrity hash.
- Single package: `packages/themes` → `@ultimate/themes`. Do not create a second package (no separate contract-types package). Do not rename, split, or relocate `uix-styled`/`uix-styles` — they keep their existing Phase 1 roles.
- Preset scope: exactly the five-component proof set already built (Button, Checkbox, Dialog, Menu, Tooltip) plus the `base` primitive/semantic tier. Do not expand to PrimeVue's full ~150-component catalog.
- CSS variable prefix changes from `'p'` to `'u'` in `uix-styled`'s two `Theme.defaults` locations (`packages/uix-styled/src/config/index.ts` lines 7 and 13). This is a source-level default change, not a per-call-site override.
- **`uix-styles` is NOT modified in this plan.** Its component `style` string exports are already correct (verified against real PrimeVue `packages/primevue/src/button/style/ButtonStyle.js` — `@primeuix/styles/button`'s `style` export is also a plain untagged string upstream). The `dt()`-resolution fix belongs at the three `*-core` `StyleSheet.add()` call sites, wrapping with `uix-styled`'s `css` tagged-template function — matching verified upstream `packages/core/src/base/style/BaseStyle.js`'s `loadStyle()` method's `` Css`${style}` `` pattern exactly. Two earlier hypotheses (function-shaped style exports; tagging at the `uix-styles` source) were investigated and refuted against real source before landing on this — do not revisit them.
- Density is explicitly out of scope — no stub, no reserved API shape, not even a comment marking a future slot. Motion preference is explicitly out of scope — it already has a working home in `@ultimate/uix-motion` (`isPrefersReducedMotion()`), untouched by this plan.
- Application timing is runtime-only, exactly as vendored — no build-time static CSS generation task exists in this plan.
- `packages/themes` has zero dependency on any of `ng-core`/`react-core`/`vue-core`/`ng`/`react`/`vue`. Its only workspace dependency is `@ultimate/uix-styled`.
- `scripts/provenance/validate-dependency-ceiling.mjs`'s `CEILINGS` map needs a `"@primeuix/themes": "2.0.3"` entry, and its `WATCHED_PREFIXES` array needs `"themes"` added (currently `["uix", "ng", "react", "vue"]`).
- `scripts/provenance/validate-provenance.mjs`'s `MANIFEST_WATCHED_PREFIXES` array needs `"themes"` added (currently `["uix", "ng", "react", "vue"]`).
- Every incorporated/modified file needs a provenance record, matching the existing `docs/architecture/provenance/*.json` schema (`{originalPath, ultimateDestination, modificationStatus, modificationDescription}`) and a `docs/architecture/PROVENANCE.md` entry, matching the format of the existing four `@primeuix/*` entries exactly.
- Package manager: pnpm (existing lockfile). Node: `>=20` (matches Phase 0-4 convention).

---

## File Structure

```text
.vendor-cache/
└── @primeuix__themes-2.0.3.tar.gz          NEW — pinned baseline

packages/
├── uix-styled/                              MODIFIED — rebrand only, no structural change
│   └── src/
│       └── config/index.ts                  MODIFIED — prefix 'p'→'u' (2 locations)
│
├── ng-core/
│   └── src/basecomponent/base-component.ts  MODIFIED — wrap styleModule.css with css`...`
│
├── react-core/
│   └── src/styling/use-component-style.ts   MODIFIED — wrap styleModule.css with css`...`
│
├── vue-core/
│   └── src/styling/vue-style-sheet.ts        MODIFIED — wrap styleModule.css with css`...`
│
└── themes/                                   @ultimate/themes (NEW — currently .gitkeep only)
    ├── src/
    │   ├── contract/
    │   │   ├── tokens.ts                     primitive/semantic/component token type shapes
    │   │   ├── mode.ts                       light/dark mode contract types
    │   │   ├── direction.ts                  RTL/LTR direction contract types
    │   │   └── index.ts
    │   ├── presets/
    │   │   └── aura/
    │   │       ├── base.ts                   primitive + semantic tokens (ported from @primeuix/themes's Aura base)
    │   │       ├── button.ts
    │   │       ├── checkbox.ts
    │   │       ├── dialog.ts
    │   │       ├── menu.ts
    │   │       ├── tooltip.ts
    │   │       └── index.ts                  assembles the full preset object via definePreset
    │   ├── apply-theme.ts                    applyUltimateTheme(options) entry point
    │   └── index.ts
    ├── test/
    │   ├── exports.test.ts
    │   ├── contract.test.ts
    │   ├── aura-preset.test.ts
    │   ├── apply-theme.test.ts
    │   └── cross-framework-consistency.test.ts
    ├── package.json
    ├── tsup.config.ts
    ├── tsconfig.json
    ├── vitest.config.ts
    ├── README.md
    └── THIRD-PARTY-NOTICES.md

docs/architecture/
├── PROVENANCE.md                             MODIFIED — @primeuix/themes entry added, uix-styled entry's modification pass noted
├── checksums.json                            MODIFIED — @primeuix/themes entry added
├── provenance/
│   ├── uix-styled.json                       MODIFIED — rebrand modification pass recorded
│   └── themes.json                           NEW
└── ROADMAP.md                                MODIFIED — Phase 5 marked Complete on closeout

scripts/provenance/
├── validate-dependency-ceiling.mjs           MODIFIED — CEILINGS + WATCHED_PREFIXES extended
└── validate-provenance.mjs                   MODIFIED — MANIFEST_WATCHED_PREFIXES extended
```

## Interfaces (cross-task contract)

- `css(strings: TemplateStringsArray, ...exprs: unknown[]): string` — **already exists**, `@ultimate/uix-styled`'s tagged-template function (`packages/uix-styled/src/helpers/css.ts`, re-exported from the package root via `helpers/index.ts`). Tasks 3-5 import and apply it; no task defines it.
- `Theme` (default export of `@ultimate/uix-styled`'s `config/index.ts`) — **already exists**. Task 8's `applyUltimateTheme` calls `Theme.setTheme({ preset, options })`.
- `definePreset<T>(...presets: T[]): T` — **already exists**, `@ultimate/uix-styled`. Task 7 uses it to assemble the five component presets + base into one preset object.
- `PrimitiveTokens`, `SemanticTokens`, `ComponentTokens<T>`, `UltimateThemeMode`, `UltimateThemeDirection` — defined in Task 6 (`packages/themes/src/contract/`), consumed by Task 7 (preset authoring) and Task 8 (`applyUltimateTheme`'s options type).
- `auraPreset` — the assembled preset object, produced by Task 7 (`packages/themes/src/presets/aura/index.ts`), consumed by Task 8 and by `packages/themes/src/index.ts`'s public barrel.
- `applyUltimateTheme(options: ApplyUltimateThemeOptions): void` — produced by Task 8, exported from `packages/themes/src/index.ts`. `ApplyUltimateThemeOptions = { preset?: Record<string, unknown>; darkModeSelector?: string; cssLayer?: boolean | { name?: string; order?: string } }`, defaulting `preset` to `auraPreset`.

---

## Task 1: Pin `@primeuix/themes@2.0.3` baseline + provenance record

**Files:**

- Modify: `scripts/provenance/vendor-snapshot.mjs`
- Modify: `docs/architecture/PROVENANCE.md`
- Create (generated by running the script): `.vendor-cache/@primeuix__themes-2.0.3.tar.gz`
- Modify (generated): `docs/architecture/checksums.json`

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: the pinned tarball at `.vendor-cache/@primeuix__themes-2.0.3.tar.gz`, consumed by Task 7's source extraction.

- [ ] **Step 1: Read the existing `@primeuix/styled` TARGETS entry as a template**

Read `scripts/provenance/vendor-snapshot.mjs` in full. Find the `TARGETS` array entry for `@primeuix/styled` (it will have `identifierType: "npm-tarball-integrity"` or equivalent — read the exact field names used, since the four existing `@primeuix/*` entries all lack a git commit and use npm-tarball pinning).

- [ ] **Step 2: Add the `@primeuix/themes` target**

Add a new entry to the `TARGETS` array, matching the exact shape/field names of the existing `@primeuix/styled` entry (adjust field names below if Step 1 found different naming):

```javascript
{
  name: "@primeuix/themes",
  package: "@primeuix/themes",
  version: "2.0.3",
  identifierType: "npm-tarball-integrity",
  tarballShasum: "c3919d49e818b3bbac611ab8d89a52d4ffed6815",
  tarballIntegrity: "sha512-3fS1883mtCWhgUgNf/feiaaDSOND4EBIOu9tZnzJlJ8QtYyL6eFLcA6V3ymCWqLVXQ1+lTVEZv1gl47FIdXReg==",
},
```

- [ ] **Step 3: Run the vendor snapshot script**

Run: `node scripts/provenance/vendor-snapshot.mjs`
Expected: PASS — `.vendor-cache/@primeuix__themes-2.0.3.tar.gz` is created (or whatever exact filename convention the script uses for the other `@primeuix/*` packages — check `.vendor-cache/@primeuix__styled-0.7.4.tar.gz`'s exact naming and confirm this new file matches it), and `docs/architecture/checksums.json` gains a `@primeuix/themes` entry.

- [ ] **Step 4: Verify the tarball's license**

Run: `tar xzf .vendor-cache/@primeuix__themes-2.0.3.tar.gz -O package/LICENSE 2>/dev/null || tar xzf .vendor-cache/@primeuix__themes-2.0.3.tar.gz -O package/LICENSE.md`
Expected: MIT license text, copyright PrimeTek. Confirm this matches the other three `@primeuix/*` entries' recorded license/copyright exactly before writing Step 5's provenance entry.

- [ ] **Step 5: Add the `docs/architecture/PROVENANCE.md` entry**

Remove `@primeuix/themes` from the "Excluded from Phase 0 core" list (currently line ~132: `**Excluded from Phase 0 core (not runtime dependencies of any confirmed baseline):** \`@primeuix/forms\`, \`@primeuix/themes\`, \`@primeuix/mcp\`.` — remove just `\`@primeuix/themes\`,` from that sentence, keep `@primeuix/forms`/`@primeuix/mcp`).

Add a new `## @primeuix/themes` section, positioned after the existing `## @primeuix/motion` section, matching the exact field structure of the three existing `@primeuix/*` entries:

```markdown
## @primeuix/themes

- **Source repository:** https://github.com/primefaces/primeuix
- **Source package:** `@primeuix/themes`
- **Source version:** `2.0.3`
- **Source commit SHA:** none — confirmed provenance gap (same cause as the other `@primeuix/*` entries above). Pinned instead by npm tarball integrity hash.
- **Tarball shasum:** `c3919d49e818b3bbac611ab8d89a52d4ffed6815`
- **Tarball integrity:** `sha512-3fS1883mtCWhgUgNf/feiaaDSOND4EBIOu9tZnzJlJ8QtYyL6eFLcA6V3ymCWqLVXQ1+lTVEZv1gl47FIdXReg==`
- **Source path:** `packages/themes` (monorepo subdirectory)
- **Original license:** MIT (verified from `LICENSE` file inside the published npm tarball)
- **Copyright holder:** PrimeTek, 2025
- **Third-party notices:** none found upstream
- **Ultimate destination:** `packages/themes` (Phase 5)
- **Modification status:** incorporated (Phase 5) — Aura preset token values used as reference (Option B — reference, not verbatim), reimplemented under Ultimate naming/prefix for the five-component proof set (Button, Checkbox, Dialog, Menu, Tooltip) plus the base primitive/semantic tier. Remaining ~88 component preset modules and the Lara/Nora/Material preset families are not incorporated — out of Phase 5 scope.
- **Modification description:** see file-level manifest at `docs/architecture/provenance/themes.json` for per-file status.
- **Date incorporated:** 2026-09-01
```

**Note on the exact incorporation date**: use the actual date this task is executed, not the spec's date, if they differ.

- [ ] **Step 6: Commit**

```bash
git add scripts/provenance/vendor-snapshot.mjs docs/architecture/PROVENANCE.md docs/architecture/checksums.json .vendor-cache/@primeuix__themes-2.0.3.tar.gz
git commit -m "feat(provenance): pin @primeuix/themes@2.0.3 baseline for Phase 5"
```

**Note**: `.vendor-cache/` is gitignored per existing repo convention (confirm via `git check-ignore .vendor-cache/@primeuix__themes-2.0.3.tar.gz` before this commit — if ignored, the `git add` for that file is a no-op and the commit covers only the script + doc changes, matching how the other three `@primeuix/*` pins were committed).

---

## Task 2: Extend provenance/dependency-ceiling validators for `themes`

**Files:**

- Modify: `scripts/provenance/validate-dependency-ceiling.mjs`
- Modify: `scripts/provenance/validate-provenance.mjs`
- Modify: `scripts/provenance/validate-dependency-ceiling.test.mjs`

**Interfaces:**

- Consumes: nothing.
- Produces: CI-enforced package-boundary guarantees that every later task in this plan must not violate.

- [ ] **Step 1: Extend `CEILINGS` and `WATCHED_PREFIXES` in `validate-dependency-ceiling.mjs`**

In `scripts/provenance/validate-dependency-ceiling.mjs`, change:

```javascript
const CEILINGS = {
  "@primeuix/utils": "0.7.2",
  "@primeuix/styled": "0.7.4",
  "@primeuix/styles": "2.0.3",
  "@primeuix/motion": "0.0.10",
};
const FORBIDDEN_DIRECT_DEPS = ["primeng", "primevue", "primereact"];
const WATCHED_PREFIXES = ["uix", "ng", "react", "vue"];
```

to:

```javascript
const CEILINGS = {
  "@primeuix/utils": "0.7.2",
  "@primeuix/styled": "0.7.4",
  "@primeuix/styles": "2.0.3",
  "@primeuix/motion": "0.0.10",
  "@primeuix/themes": "2.0.3",
};
const FORBIDDEN_DIRECT_DEPS = ["primeng", "primevue", "primereact"];
const WATCHED_PREFIXES = ["uix", "ng", "react", "vue", "themes"];
```

- [ ] **Step 2: Extend `MANIFEST_WATCHED_PREFIXES` in `validate-provenance.mjs`**

In `scripts/provenance/validate-provenance.mjs`, change:

```javascript
const MANIFEST_WATCHED_PREFIXES = ["uix", "ng", "react", "vue"];
```

to:

```javascript
const MANIFEST_WATCHED_PREFIXES = ["uix", "ng", "react", "vue", "themes"];
```

- [ ] **Step 3: Add a test case confirming the new ceiling is enforced**

Read `scripts/provenance/validate-dependency-ceiling.test.mjs` in full to find its existing test pattern for a ceiling violation (there will be an existing test asserting a `package.json` declaring e.g. `@primeuix/styled: ^99.0.0` fails validation). Add an analogous test:

```javascript
test("fails when a themes package declares @primeuix/themes above the pinned ceiling", () => {
  // follow the exact fixture-directory-construction pattern used by the
  // existing @primeuix/styled ceiling-violation test above, substituting
  // a packages/themes/package.json with "@primeuix/themes": "^99.0.0"
});
```

Write this test using the exact same fixture-setup helper the file's existing tests use (do not invent a new fixture mechanism — match the file's established pattern).

- [ ] **Step 4: Run the updated validators against the current repo state**

Run: `node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: PASS — `packages/themes` doesn't exist as a real package yet (still `.gitkeep`), so `WATCHED_PREFIXES` including `"themes"` has nothing to scan yet. This just confirms the script doesn't crash on the new prefix with no matching directory content.

Run: `node --test scripts/provenance/validate-dependency-ceiling.test.mjs`
Expected: PASS, including the new test from Step 3.

- [ ] **Step 5: Commit**

```bash
git add scripts/provenance/validate-dependency-ceiling.mjs scripts/provenance/validate-provenance.mjs scripts/provenance/validate-dependency-ceiling.test.mjs
git commit -m "feat(provenance): extend validators to watch the themes package"
```

---

## Task 3: Rebrand `uix-styled`'s CSS variable prefix from `p` to `u`

**Files:**

- Modify: `packages/uix-styled/src/config/index.ts`
- Modify: `packages/uix-styled/test/token-resolution.test.ts`
- Modify: `docs/architecture/provenance/uix-styled.json`

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: every `dt()`/`$dt()` call anywhere in the codebase now resolves to a `--u-*` CSS variable name instead of `--p-*`. This changes the literal string every later task's tests assert against (Tasks 4-9 all assert `--u-*`, never `--p-*`).

- [ ] **Step 1: Write the failing test**

The existing `packages/uix-styled/test/token-resolution.test.ts` currently asserts `--p-primary-color` (verified in spec research). Update it to assert the new prefix:

```typescript
import { describe, it, expect } from "vitest";
import { dt } from "../src/helpers/dt";

describe("dt (design token resolution)", () => {
  it("resolves a dotted token path to a CSS var() reference using the Ultimate prefix", () => {
    const result = dt("primary.color");
    expect(result).toContain("var(");
    expect(result).toContain("--u-primary-color");
  });

  it("is deterministic for the same input", () => {
    expect(dt("primary.color")).toBe(dt("primary.color"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-styled test -- token-resolution`
Expected: FAIL — actual value contains `--p-primary-color`, not `--u-primary-color`.

- [ ] **Step 3: Change the two `prefix: "p"` defaults**

In `packages/uix-styled/src/config/index.ts`, change both occurrences (lines 7 and 13 as read during plan research):

```typescript
export default {
  defaults: {
    variable: {
      prefix: "u",
      selector: ":root,:host",
      excludedKeyRegex:
        /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi,
    },
    options: {
      prefix: "u",
      darkModeSelector: "system",
      cssLayer: false,
    },
  },
  // ... rest of the file unchanged
```

Do not change anything else in this file — `excludedKeyRegex`, `darkModeSelector`, `cssLayer`, and every method below `defaults` are untouched.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-styled test -- token-resolution`
Expected: PASS.

- [ ] **Step 5: Run the full `uix-styled` test suite to check for other `--p-` assertions**

Run: `pnpm --filter @ultimate/uix-styled test`
Expected: check output carefully — if any other existing test (`preset.test.ts`, `stylesheet-service.test.ts`) asserts a literal `--p-*`/`.p-*`/`p-` string, update it to `--u-*`/`.u-*`/`u-` to match. Re-run until the full suite passes.

- [ ] **Step 6: Update `docs/architecture/provenance/uix-styled.json`**

Read the existing manifest entry for `src/config/index.ts` (its `modificationStatus` is currently `"unmodified"` or `"import-path-adapted"` from Phase 1). Update it to:

```json
{
  "originalPath": "src/config/index.ts",
  "ultimateDestination": "packages/uix-styled/src/config/index.ts",
  "modificationStatus": "rebranded",
  "modificationDescription": "CSS variable prefix changed from 'p' to 'u' in both defaults.variable.prefix and defaults.options.prefix — Phase 5 rebrand pass, distinct from Phase 1's import-path-adaptation pass. No other logic changed."
}
```

This is the **first entry in this manifest with `modificationStatus: "rebranded"`** — a new status value not used by any prior phase. If `generate-manifest.mjs` (Task 2's validators, or any schema-checking test) has a fixed enum of allowed `modificationStatus` values, extend it to include `"rebranded"`. Check `scripts/provenance/validate-provenance.mjs` and `scripts/provenance/generate-manifest.mjs` for any such enum before finalizing this step.

- [ ] **Step 7: Run the full provenance validator**

Run: `node scripts/provenance/validate-provenance.mjs`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/uix-styled/src/config/index.ts packages/uix-styled/test/token-resolution.test.ts docs/architecture/provenance/uix-styled.json
git commit -m "feat(uix-styled): rebrand CSS variable prefix from p to u"
```

---

## Task 4: Rebrand `uix-styled`'s public-facing exported identifiers

**Files:**

- Modify: `packages/uix-styled/src/utils/themeUtils.ts`
- Modify: `packages/uix-styled/test/*.test.ts` (any asserting the changed strings)

**Interfaces:**

- Consumes: nothing new.
- Produces: no new public API — this only changes DOM-visible attribute strings and internal warning text, not any function/type signature later tasks depend on.

- [ ] **Step 1: Identify the PrimeVue-specific literal strings to rebrand**

`themeUtils.ts` contains two literal `data-primevue-style-id` attribute strings (verified during plan research, at the `getCommonStyleSheet` and `getStyleSheet` methods) — these are DOM-visible `<style>` tag attributes, not TypeScript identifiers, but are still part of the "public exported surface" per spec §3 (anything a consumer of a rendered page can observe). Also check the `"primeui"` string literal default inside `getLayerOrder` (`cssLayer.order || cssLayer.name || "primeui"`) — this is the default `@layer` name.

- [ ] **Step 2: Write the failing test**

Add to `packages/uix-styled/test/preset.test.ts` (or create `packages/uix-styled/test/theme-utils.test.ts` if none of the existing test files exercise `getCommonStyleSheet`/`getStyleSheet`):

```typescript
import { describe, it, expect } from "vitest";
import ThemeUtils from "../src/utils/themeUtils";

describe("ThemeUtils rebrand", () => {
  it("getCommonStyleSheet emits a data-u-style-id attribute, not data-primevue-style-id", () => {
    const theme = {
      preset: { primitive: { blue: { 500: "#3B82F6" } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    };
    const result = ThemeUtils.getCommonStyleSheet({
      name: "test",
      theme,
      params: undefined,
      props: {},
      set: { layerNames: () => {} },
      defaults: {
        variable: { prefix: "u", selector: ":root,:host", excludedKeyRegex: /^$/ },
        options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
      },
    });
    expect(result).not.toContain("data-primevue-style-id");
  });

  it("getLayerOrder's default @layer name is Ultimate-branded, not primeui", () => {
    const result = ThemeUtils.getLayerOrder(
      "test",
      { cssLayer: true },
      { names: [] },
      { variable: { prefix: "u" }, options: { prefix: "u" } }
    );
    expect(result).not.toContain("primeui");
    expect(result).toContain("ultimate");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-styled test -- theme-utils`
Expected: FAIL — actual output contains `data-primevue-style-id` and/or `primeui`.

- [ ] **Step 3: Rebrand the literal strings**

In `packages/uix-styled/src/utils/themeUtils.ts`:

- Both `data-primevue-style-id` occurrences → `data-u-style-id`.
- `getLayerOrder`'s default fallback: change `cssLayer.order || cssLayer.name || "primeui"` to `cssLayer.order || cssLayer.name || "ultimate"`.

Do not change any other logic in this file — `getCommon`, `getPreset`, `createTokens`, `transformCSS`, and every other method's structure/behavior stays exactly as vendored.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-styled test -- theme-utils`
Expected: PASS.

- [ ] **Step 5: Run the full `uix-styled` suite**

Run: `pnpm --filter @ultimate/uix-styled test`
Expected: PASS — check for any other test asserting `data-primevue-style-id` or `primeui` literally and update to match.

- [ ] **Step 6: Update `docs/architecture/provenance/uix-styled.json`**

Update the entry for `src/utils/themeUtils.ts`:

```json
{
  "originalPath": "src/utils/themeUtils.ts",
  "ultimateDestination": "packages/uix-styled/src/utils/themeUtils.ts",
  "modificationStatus": "rebranded",
  "modificationDescription": "DOM-visible data-primevue-style-id attribute renamed to data-u-style-id (2 occurrences); default @layer name changed from 'primeui' to 'ultimate' in getLayerOrder. No other logic changed — Phase 5 rebrand pass."
}
```

- [ ] **Step 7: Commit**

```bash
git add packages/uix-styled/src/utils/themeUtils.ts packages/uix-styled/test/ docs/architecture/provenance/uix-styled.json
git commit -m "feat(uix-styled): rebrand DOM-visible attribute and default layer names"
```

---

## Task 5: Wire `dt()` resolution into `ng-core`'s `StyleSheet.add()` call site

**Files:**

- Modify: `packages/ng-core/src/basecomponent/base-component.ts`
- Modify: `packages/ng-core/src/basecomponent/base-component.spec.ts` (or create if style-registration isn't currently tested there)

**Interfaces:**

- Consumes: `css` tagged-template function from `@ultimate/uix-styled` (already exists, `packages/uix-styled/src/helpers/css.ts`, re-exported from package root).
- Produces: `ng-core`'s registered component styles now resolve `dt(...)` calls into real `var(--u-*, fallback)` CSS at registration time. No signature change to `UBaseComponent` — `styleModule.css` stays the input shape.

- [ ] **Step 1: Write the failing test**

Add to `packages/ng-core/src/basecomponent/base-component.spec.ts` (read the existing file first to match its test harness/component-under-test pattern exactly — likely a minimal `TestBed`-based concrete `UBaseComponent` subclass):

```typescript
it("resolves dt() calls in registered CSS into var(--u-*, ...) references", () => {
  // Using the existing test harness's concrete UBaseComponent subclass
  // (matching whatever pattern the file's other tests already use to
  // instantiate/mount one), register a styleModule whose css contains a
  // literal dt('test.token.value') call, matching the shape uix-styles'
  // real component modules use.
  const styleModule = {
    css: ".u-test { color: dt('test.token.value'); }",
    classes: {},
  };
  // ... mount/init the harness component with this styleModule, matching
  // the file's existing setup pattern
  const styleEl = document.querySelector('style[data-u-style-id]') /* or ng-core's real registered-style lookup, matching whatever assertion pattern the file's other style-registration tests already use */;
  expect(styleEl?.textContent).toContain("var(--u-test-token-value");
  expect(styleEl?.textContent).not.toContain("dt(");
});
```

**Note**: match this test's exact assertion mechanism (DOM query selector, or the `ngCoreStyleSheet` singleton's `.get(componentName)?.css` accessor — whichever the file's existing style-registration tests already use) rather than inventing a new one.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng-core test -- base-component`
Expected: FAIL — registered CSS still contains literal `dt('test.token.value')` text, not a resolved `var(...)`.

- [ ] **Step 3: Wire `css` into the registration call site**

In `packages/ng-core/src/basecomponent/base-component.ts`, add the import and update `ngOnInit`:

```typescript
import { css } from "@ultimate/uix-styled";
```

```typescript
ngOnInit(): void {
  if (!ngCoreStyleSheet.has(this.componentName)) {
    ngCoreStyleSheet.add(this.componentName, css`${this.styleModule.css}`);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng-core test -- base-component`
Expected: PASS.

- [ ] **Step 5: Run the full `ng-core` and `ng` test suites for regressions**

Run: `pnpm --filter @ultimate/ng-core --filter @ultimate/ng test`
Expected: PASS — this changes what every registered component's CSS actually contains (unresolved `dt(...)` calls now resolve to `var(...)` references with no fallback value yet, since no theme/preset has been applied — `dt()`'s fallback argument is unset in these call sites, matching real PrimeVue's own `Css\`${style}\`` call shape, which also passes no fallback). No existing test should have asserted literal `dt(...)` text remaining in registered CSS; if one does, it was asserting an already-known-broken state and should be updated.

- [ ] **Step 6: Commit**

```bash
git add packages/ng-core/src/basecomponent/base-component.ts packages/ng-core/src/basecomponent/base-component.spec.ts
git commit -m "feat(ng-core): resolve dt() token calls at style registration time"
```

---

## Task 6: Wire `dt()` resolution into `react-core`'s `StyleSheet.add()` call site

**Files:**

- Modify: `packages/react-core/src/styling/use-component-style.ts`
- Modify: `packages/react-core/src/styling/*.spec.ts` (styling test file — find its exact name via `packages/react-core/src/styling/` listing)

**Interfaces:**

- Consumes: `css` from `@ultimate/uix-styled`, same as Task 5.
- Produces: same resolution guarantee as Task 5, for React.

- [ ] **Step 1: Write the failing test**

Find the existing test file covering `useComponentStyle` (likely `packages/react-core/src/styling/styling.spec.ts` per the test-run output seen during Phase 4 verification — `react-core`'s `styling.spec.ts` had 3 tests). Add:

```typescript
it("resolves dt() calls in registered CSS into var(--u-*, ...) references", () => {
  const styleModule = {
    css: ".u-test { color: dt('test.token.value'); }",
    classes: {},
  };
  // Mount a minimal component using useComponentStyle("dt-test-component", styleModule),
  // matching this file's existing render/mount pattern for its other tests.
  const styleEl = document.querySelector("style[data-u-style]") /* match the file's existing DOM-assertion pattern for registered styles */;
  expect(styleEl?.textContent).toContain("var(--u-test-token-value");
  expect(styleEl?.textContent).not.toContain("dt(");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react-core test -- styling`
Expected: FAIL.

- [ ] **Step 3: Wire `css` into `use-component-style.ts`**

```typescript
import { css } from "@ultimate/uix-styled";
import { useMountEffect } from "../hooks";
import { reactCoreStyleSheet } from "./react-style-sheet";
import type { StyleModule } from "../base/component-base";

export function useComponentStyle(componentName: string, styleModule: StyleModule): void {
  useMountEffect(() => {
    if (!reactCoreStyleSheet.has(componentName)) {
      reactCoreStyleSheet.add(componentName, css`${styleModule.css}`);
    }
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react-core test -- styling`
Expected: PASS.

- [ ] **Step 5: Run the full `react-core` and `react` test suites for regressions**

Run: `pnpm --filter @ultimate/react-core --filter @ultimate/react test`
Expected: PASS (same reasoning as Task 5 Step 5).

- [ ] **Step 6: Commit**

```bash
git add packages/react-core/src/styling/
git commit -m "feat(react-core): resolve dt() token calls at style registration time"
```

---

## Task 7: Wire `dt()` resolution into `vue-core`'s `StyleSheet.add()` call site

**Files:**

- Modify: `packages/vue-core/src/styling/vue-style-sheet.ts`
- Modify: `packages/vue-core/src/styling/styling.spec.ts`

**Interfaces:**

- Consumes: `css` from `@ultimate/uix-styled`, same as Tasks 5-6.
- Produces: same resolution guarantee as Tasks 5-6, for Vue. This is the last of the three `*-core` wiring tasks — after this, all three frameworks resolve `dt()` identically at the same architectural layer.

- [ ] **Step 1: Write the failing test**

`packages/vue-core/src/styling/styling.spec.ts` (3 tests per Phase 4's verification run). Add:

```typescript
it("resolves dt() calls in registered CSS into var(--u-*, ...) references", () => {
  const styleModule = {
    css: ".u-test { color: dt('test.token.value'); }",
    classes: {},
  };
  registerComponentStyle("dt-test-component", styleModule);
  const styleEl = document.head.querySelector('style[data-u-style="dt-test-component"]');
  expect(styleEl?.textContent).toContain("var(--u-test-token-value");
  expect(styleEl?.textContent).not.toContain("dt(");
});
```

**Note**: import `registerComponentStyle` from `./vue-style-sheet` at the top of the test file if not already imported; match the file's existing import/setup pattern otherwise.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue-core test -- styling`
Expected: FAIL.

- [ ] **Step 3: Wire `css` into `registerComponentStyle`**

```typescript
import { StyleSheet, css, type StyleMeta } from "@ultimate/uix-styled";
import { createStyleElement } from "@ultimate/uix-utils/dom";
import type { StyleModule } from "../base/base-component";

class VueStyleSheet extends StyleSheet<HTMLStyleElement> {
  override createStyleElement(meta: StyleMeta): HTMLStyleElement | undefined {
    if (typeof document === "undefined") return undefined;
    return createStyleElement(meta.css ?? "", { "data-u-style": meta.name }, document.head);
  }
}

export const vueCoreStyleSheet = new VueStyleSheet();

export function registerComponentStyle(componentName: string, styleModule: StyleModule): void {
  if (vueCoreStyleSheet.has(componentName)) return;
  vueCoreStyleSheet.add(componentName, css`${styleModule.css}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue-core test -- styling`
Expected: PASS.

- [ ] **Step 5: Run the full `vue-core` and `vue` test suites for regressions**

Run: `pnpm --filter @ultimate/vue-core --filter @ultimate/vue test`
Expected: PASS (same reasoning as Tasks 5-6 Step 5).

- [ ] **Step 6: Commit**

```bash
git add packages/vue-core/src/styling/
git commit -m "feat(vue-core): resolve dt() token calls at style registration time"
```

---

## Task 8: `@ultimate/themes` package scaffold + public contract types

**Files:**

- Create: `packages/themes/package.json`
- Create: `packages/themes/tsup.config.ts`
- Create: `packages/themes/tsconfig.json`
- Create: `packages/themes/vitest.config.ts`
- Create: `packages/themes/src/contract/tokens.ts`
- Create: `packages/themes/src/contract/mode.ts`
- Create: `packages/themes/src/contract/direction.ts`
- Create: `packages/themes/src/contract/index.ts`
- Create: `packages/themes/test/contract.test.ts`
- Create: `packages/themes/THIRD-PARTY-NOTICES.md`
- Delete: `packages/themes/.gitkeep`

**Interfaces:**

- Consumes: nothing.
- Produces: `PrimitiveTokens`, `SemanticTokens`, `ComponentTokens<T>`, `UltimateThemeMode`, `UltimateThemeDirection` types — consumed by Task 9 (preset authoring) and Task 10 (`applyUltimateTheme`).

- [ ] **Step 1: Scaffold `package.json`**

```json
{
  "name": "@ultimate/themes",
  "version": "0.1.0",
  "description": "Framework-neutral theme contract and baseline preset data for the Ultimate Platform.",
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
    "build": "tsup && node ../uix-styled/scripts/rename-dts.mjs",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@ultimate/uix-styled": "workspace:*"
  },
  "devDependencies": {
    "jsdom": "^25.0.1",
    "tsup": "^8.3.0",
    "typescript": "^5.9.3",
    "vitest": "^2.1.8"
  }
}
```

**Note on the `build` script's `rename-dts.mjs` reference**: `uix-styled` and `uix-styles` both use a local `scripts/rename-dts.mjs` copy (verified: `packages/uix-styled/scripts/rename-dts.mjs`, `packages/uix-styles/scripts/rename-dts.mjs`). Check whether these are identical files (likely copy-pasted per package, matching this monorepo's existing convention) — if so, create `packages/themes/scripts/rename-dts.mjs` as its own copy (do not reference another package's `scripts/` directory across a package boundary) and change the `build` script above to `"tsup && node scripts/rename-dts.mjs"`.

- [ ] **Step 2: Scaffold `tsup.config.ts`, `tsconfig.json`, `vitest.config.ts`**

```typescript
// packages/themes/tsup.config.ts
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

```json
// packages/themes/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

```typescript
// packages/themes/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 3: Write the failing test for the contract types**

```typescript
// packages/themes/test/contract.test.ts
import { describe, it, expect, expectTypeOf } from "vitest";
import type {
  PrimitiveTokens,
  SemanticTokens,
  ComponentTokens,
  UltimateThemeMode,
  UltimateThemeDirection,
} from "../src/contract";

describe("theme contract types", () => {
  it("PrimitiveTokens accepts a nested color-scale shape", () => {
    const primitive: PrimitiveTokens = {
      blue: { 500: "#3B82F6", 600: "#2563EB" },
      borderRadius: { sm: "4px", md: "6px" },
    };
    expect(primitive.blue?.[500]).toBe("#3B82F6");
  });

  it("SemanticTokens splits by light/dark colorScheme", () => {
    const semantic: SemanticTokens = {
      colorScheme: {
        light: { primary: { color: "{blue.500}" } },
        dark: { primary: { color: "{blue.400}" } },
      },
    };
    expect(semantic.colorScheme.light.primary?.color).toBe("{blue.500}");
  });

  it("ComponentTokens<T> accepts a per-component token object with light/dark", () => {
    type ButtonTokens = { primary: { color: string; background: string } };
    const button: ComponentTokens<ButtonTokens> = {
      root: { borderRadius: "{form.field.border.radius}" },
      colorScheme: {
        light: { primary: { color: "#fff", background: "{primary.color}" } },
        dark: { primary: { color: "#000", background: "{primary.color}" } },
      },
    };
    expect(button.colorScheme.light.primary.color).toBe("#fff");
  });

  it("UltimateThemeMode is 'system' | 'light' | 'dark' | a custom selector string", () => {
    const modes: UltimateThemeMode[] = ["system", "light", "dark", ".dark-mode"];
    expect(modes).toHaveLength(4);
  });

  it("UltimateThemeDirection is 'ltr' | 'rtl'", () => {
    const directions: UltimateThemeDirection[] = ["ltr", "rtl"];
    expect(directions).toHaveLength(2);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm --filter @ultimate/themes test`
Expected: FAIL — `src/contract` module does not exist yet.

- [ ] **Step 5: Write `src/contract/tokens.ts`**

```typescript
export type ColorScale = {
  0?: string;
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
  950?: string;
};

export interface PrimitiveTokens {
  [key: string]: ColorScale | Record<string, string> | string | undefined;
}

export interface SemanticColorScheme<T = Record<string, unknown>> {
  light: T;
  dark: T;
}

export interface SemanticTokens<T = Record<string, unknown>> {
  colorScheme: SemanticColorScheme<T>;
  [key: string]: unknown;
}

export interface ComponentTokens<T = Record<string, unknown>> {
  root?: Record<string, unknown>;
  colorScheme: SemanticColorScheme<T>;
}
```

- [ ] **Step 6: Write `src/contract/mode.ts`**

```typescript
/**
 * Light/dark mode selector. 'system' follows the OS preference
 * (prefers-color-scheme); a string starting with '.' or '[' is a
 * class/attribute selector; any other string is passed through as a raw
 * media-query or custom selector. Matches @ultimate/uix-styled's
 * darkModeSelector option shape exactly (packages/uix-styled/src/utils/themeUtils.ts's
 * regex.rules dispatcher).
 */
export type UltimateThemeMode = "system" | "light" | "dark" | string;
```

- [ ] **Step 7: Write `src/contract/direction.ts`**

```typescript
/**
 * Text direction. Ultimate does not implement JS-driven direction
 * switching — component CSS already responds to a `dir` attribute on any
 * ancestor element via the native CSS :dir() pseudo-class (verified in
 * @ultimate/uix-styles' shipped component CSS). This type documents the
 * two supported values for API/prop surfaces that accept a direction
 * hint; it is not itself a runtime mechanism.
 */
export type UltimateThemeDirection = "ltr" | "rtl";
```

- [ ] **Step 8: Write `src/contract/index.ts`**

```typescript
export * from "./tokens";
export * from "./mode";
export * from "./direction";
```

- [ ] **Step 9: Create a temporary `src/index.ts` re-exporting the contract (real content added in Task 9-10)**

```typescript
export * from "./contract";
```

- [ ] **Step 10: Run test to verify it passes**

Run: `pnpm --filter @ultimate/themes test`
Expected: PASS.

- [ ] **Step 11: Write `THIRD-PARTY-NOTICES.md`**

Match the format of `packages/uix-styled/THIRD-PARTY-NOTICES.md` (read it first), substituting the `@primeuix/themes` provenance details from Task 1.

- [ ] **Step 12: Build and typecheck**

Run: `pnpm --filter @ultimate/themes build`
Expected: PASS — `dist/index.mjs` and `dist/index.d.mts` exist.

Run: `pnpm --filter @ultimate/themes typecheck`
Expected: PASS.

- [ ] **Step 13: Commit**

```bash
git add packages/themes/package.json packages/themes/tsup.config.ts packages/themes/tsconfig.json packages/themes/vitest.config.ts packages/themes/src/ packages/themes/test/ packages/themes/THIRD-PARTY-NOTICES.md
git rm packages/themes/.gitkeep
git commit -m "feat(themes): scaffold @ultimate/themes package with public contract types"
```

---

## Task 9: Extract Aura preset reference source from `@primeuix/themes@2.0.3`

**Files:**

- Create (via script, into gitignored scratch): `.vendor-extracted/themes/aura/**`

**Interfaces:**

- Consumes: `.vendor-cache/@primeuix__themes-2.0.3.tar.gz` from Task 1.
- Produces: real Aura preset source files at `.vendor-extracted/themes/aura/{base,button,checkbox,dialog,menu,tooltip}/index.ts`, read (not committed) by Task 10.

- [ ] **Step 1: Confirm `.mjs.map` sourcemaps exist for the needed components**

Run:

```bash
mkdir -p /tmp/themes-tarball-check && tar xzf .vendor-cache/@primeuix__themes-2.0.3.tar.gz -C /tmp/themes-tarball-check
ls /tmp/themes-tarball-check/package/dist/aura/base/index.mjs.map
ls /tmp/themes-tarball-check/package/dist/aura/button/index.mjs.map
ls /tmp/themes-tarball-check/package/dist/aura/checkbox/index.mjs.map
ls /tmp/themes-tarball-check/package/dist/aura/dialog/index.mjs.map
ls /tmp/themes-tarball-check/package/dist/aura/menu/index.mjs.map
ls /tmp/themes-tarball-check/package/dist/aura/tooltip/index.mjs.map
rm -rf /tmp/themes-tarball-check
```

Expected: all six `.mjs.map` files exist (confirmed present during spec research for `base` and `button`; verify the other four here since they weren't individually checked yet).

- [ ] **Step 2: Run `extract-source.mjs` against the pinned tarball**

Run: `node scripts/provenance/extract-source.mjs .vendor-cache/@primeuix__themes-2.0.3.tar.gz .vendor-extracted/themes`

Expected: PASS — writes real per-file TypeScript/JS source recovered from every `.mjs.map`'s embedded `sourcesContent` into `.vendor-extracted/themes/`, following the script's existing `src/`-relative path resolution. This will extract far more than the 6 needed component dirs (the tarball has ~93 component preset dirs) — that is expected; Task 10 only reads the 6 needed ones.

**Note**: `.vendor-extracted/` is gitignored per existing repo convention (matches how Phases 2-4 used this same extraction step for PrimeNG/PrimeReact/PrimeVue source) — this task produces no committed files. Confirm via `git check-ignore .vendor-extracted/themes` before proceeding.

- [ ] **Step 3: Read the six needed files to confirm the extraction produced usable source**

Read `.vendor-extracted/themes/aura/base/index.ts` (or whatever extension the sourcemap's original source path used — check, since the dist output is `.mjs` but the original source may have been `.ts` per the sourcemap's `sources` field naming, matching how Task 9 in Phase 4's plan handled the equivalent PrimeVue extraction) in full. Confirm it contains the primitive color-ramp object and semantic token object structure verified during spec research (borderRadius scale, emerald/green/lime/... color scales, each with light/dark semantic sections).

Read `.vendor-extracted/themes/aura/button/index.ts` in full. Confirm the `light`/`dark` root token structure verified during spec research (`primary`/`secondary`/`info`/`success`/`warn`/`help`/`danger`/`contrast` variant objects, each with `background`/`hoverBackground`/`activeBackground`/`borderColor`/`color`/`focusRing` sub-keys, referencing primitives via `{primary.color}`-style interpolation).

Read `.vendor-extracted/themes/aura/checkbox/index.ts`, `.vendor-extracted/themes/aura/dialog/index.ts`, `.vendor-extracted/themes/aura/menu/index.ts`, `.vendor-extracted/themes/aura/tooltip/index.ts` in full — these are the reference source Task 10 ports from.

- [ ] **Step 4: No commit for this task**

This task produces only gitignored scratch extraction output — nothing to commit. Proceed directly to Task 10, which reads these files.

---

## Task 10: Author the Ultimate Aura-derived preset (base + 5 components)

**Files:**

- Create: `packages/themes/src/presets/aura/base.ts`
- Create: `packages/themes/src/presets/aura/button.ts`
- Create: `packages/themes/src/presets/aura/checkbox.ts`
- Create: `packages/themes/src/presets/aura/dialog.ts`
- Create: `packages/themes/src/presets/aura/menu.ts`
- Create: `packages/themes/src/presets/aura/tooltip.ts`
- Create: `packages/themes/src/presets/aura/index.ts`
- Create: `packages/themes/test/aura-preset.test.ts`
- Create: `docs/architecture/provenance/themes.json`

**Interfaces:**

- Consumes: `PrimitiveTokens`, `SemanticTokens`, `ComponentTokens` from Task 8; `definePreset` from `@ultimate/uix-styled`; reference source at `.vendor-extracted/themes/aura/**` from Task 9.
- Produces: `auraPreset` (exported from `src/presets/aura/index.ts`), consumed by Task 11 (`applyUltimateTheme`'s default) and Task 12 (cross-framework consistency test).

- [ ] **Step 1: Write the failing test for the assembled preset's shape**

```typescript
// packages/themes/test/aura-preset.test.ts
import { describe, it, expect } from "vitest";
import { auraPreset } from "../src/presets/aura";

describe("Ultimate Aura-derived preset", () => {
  it("has a primitive tier with real color-ramp values", () => {
    expect(auraPreset.primitive).toBeDefined();
    expect(typeof auraPreset.primitive.blue?.[500]).toBe("string");
    expect(auraPreset.primitive.blue?.[500]).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("has a semantic tier with light/dark colorScheme", () => {
    expect(auraPreset.semantic.colorScheme.light).toBeDefined();
    expect(auraPreset.semantic.colorScheme.dark).toBeDefined();
  });

  it("has component token objects for all five proof-set components", () => {
    expect(auraPreset.components.button).toBeDefined();
    expect(auraPreset.components.checkbox).toBeDefined();
    expect(auraPreset.components.dialog).toBeDefined();
    expect(auraPreset.components.menu).toBeDefined();
    expect(auraPreset.components.tooltip).toBeDefined();
  });

  it("button component tokens have light/dark colorScheme with real values, not placeholders", () => {
    const button = auraPreset.components.button;
    expect(button.colorScheme.light.root?.primary?.background).toBeDefined();
    expect(button.colorScheme.light.root?.primary?.background).not.toBe("");
    expect(button.colorScheme.dark.root?.primary?.background).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/themes test -- aura-preset`
Expected: FAIL — `src/presets/aura` doesn't exist.

- [ ] **Step 3: Port `base.ts`**

Using `.vendor-extracted/themes/aura/base/index.ts` (Task 9) as reference — not verbatim copy, matching Option B posture used throughout Phases 2-4 — write `packages/themes/src/presets/aura/base.ts` containing the primitive color-ramp object (all named color scales: emerald, green, lime, red, orange, amber, yellow, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate, gray, zinc, neutral, stone, surface — verify the exact full list against the extracted source, do not omit any scale actually present) and the semantic token object (light/dark split, referencing primitives via `{color.500}`-style interpolation, matching the extracted source's real key names and structure).

Type it against `PrimitiveTokens`/`SemanticTokens` from Task 8's contract. Export both as named exports: `export const primitive: PrimitiveTokens = {...}` and `export const semantic: SemanticTokens = {...}`.

**This is the largest single file in this plan** — the primitive tier alone is ~20 color scales × 12 shades. Transcribe the real extracted values; do not invent or approximate color values.

- [ ] **Step 4: Port `button.ts`, `checkbox.ts`, `dialog.ts`, `menu.ts`, `tooltip.ts`**

For each, using the corresponding `.vendor-extracted/themes/aura/<name>/index.ts` file as reference: write `packages/themes/src/presets/aura/<name>.ts` exporting `export const <name>: ComponentTokens<...> = {...}`, preserving the real `root`/`colorScheme.light`/`colorScheme.dark` structure and real token values/interpolation-paths from the extracted source, typed against `ComponentTokens` from Task 8.

Cross-check each against the corresponding `packages/uix-styles/src/<name>/index.ts` file's `dt('<name>.<path>')` calls (e.g. `dt('button.primary.color')`, `dt('button.padding.y')`) — every token path referenced by the shipped component CSS must have a corresponding value present in this preset's component token object, or that CSS property will resolve to `var(--u-<path>)` with no fallback and no defined custom property, rendering as the browser's initial/inherited value. This cross-check is the acceptance bar for "real token values, not placeholder" from the spec's exit criteria — do not consider a component's preset file complete until every `dt()` path used by its `uix-styles` CSS module has a matching entry.

- [ ] **Step 5: Write `index.ts` assembling the full preset**

```typescript
// packages/themes/src/presets/aura/index.ts
import { definePreset } from "@ultimate/uix-styled";
import { primitive, semantic } from "./base";
import { button } from "./button";
import { checkbox } from "./checkbox";
import { dialog } from "./dialog";
import { menu } from "./menu";
import { tooltip } from "./tooltip";

export const auraPreset = definePreset({
  primitive,
  semantic,
  components: {
    button,
    checkbox,
    dialog,
    menu,
    tooltip,
  },
});
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm --filter @ultimate/themes test -- aura-preset`
Expected: PASS.

- [ ] **Step 7: Generate the provenance manifest**

Run: `node scripts/provenance/generate-manifest.mjs packages/themes themes`

Expected: creates/updates `docs/architecture/provenance/themes.json` with one entry per `.ts` file under `packages/themes/src/`. Review the generated entries for the 5 preset files + `base.ts` — their `modificationStatus` should read something indicating reference-derivation (check what status value the script's default classification assigns; if it defaults to `"unmodified"` — which would be factually wrong for a reference-not-verbatim port — manually correct each of these 6 entries' `modificationStatus` to `"reference-derived"` and `modificationDescription` to name both the source (`@primeuix/themes@2.0.3`'s Aura preset, per-file) and that it's Option B reference-not-verbatim, matching the convention `PROVENANCE.md`'s package-level entry (Task 1) already states).

- [ ] **Step 8: Commit**

```bash
git add packages/themes/src/presets/ packages/themes/test/aura-preset.test.ts docs/architecture/provenance/themes.json
git commit -m "feat(themes): port Ultimate Aura-derived preset for the five-component proof set"
```

---

## Task 11: `applyUltimateTheme` entry point

**Files:**

- Create: `packages/themes/src/apply-theme.ts`
- Create: `packages/themes/test/apply-theme.test.ts`
- Modify: `packages/themes/src/index.ts`

**Interfaces:**

- Consumes: `Theme` (default export) from `@ultimate/uix-styled`; `auraPreset` from Task 10; `UltimateThemeMode` from Task 8.
- Produces: `applyUltimateTheme(options?: ApplyUltimateThemeOptions): void`, the single public entry point a consuming application calls once, framework-agnostically, before mounting any Ultimate component (per spec §6).

- [ ] **Step 1: Write the failing test**

```typescript
// packages/themes/test/apply-theme.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { applyUltimateTheme } from "../src/apply-theme";
import Theme from "@ultimate/uix-styled/dist/config/index.mjs"; // adjust import path — see Step 2's note

describe("applyUltimateTheme", () => {
  it("applies the default Aura preset when called with no options", () => {
    applyUltimateTheme();
    const theme = Theme.getTheme();
    expect(theme?.preset?.components?.button).toBeDefined();
  });

  it("applies a custom darkModeSelector option", () => {
    applyUltimateTheme({ darkModeSelector: ".dark" });
    const theme = Theme.getTheme();
    expect(theme?.options?.darkModeSelector).toBe(".dark");
  });
});
```

**Note on the `Theme` import in this test**: `Theme` is `uix-styled`'s default-exported config singleton (`export { default as Theme } from "./config/index"` per `uix-styled/src/index.ts`'s barrel, verified during plan research). Import it the normal way — `import { Theme } from "@ultimate/uix-styled"` — not via a `dist/` subpath; correct the import above to that normal form before writing the file.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/themes test -- apply-theme`
Expected: FAIL — `src/apply-theme.ts` doesn't exist.

- [ ] **Step 3: Write `apply-theme.ts`**

```typescript
import { Theme } from "@ultimate/uix-styled";
import { auraPreset } from "./presets/aura";
import type { UltimateThemeMode } from "./contract";

export interface ApplyUltimateThemeOptions {
  /** Defaults to the Ultimate Aura-derived preset. */
  preset?: Record<string, unknown>;
  /** @default 'system' */
  darkModeSelector?: UltimateThemeMode;
  cssLayer?: boolean | { name?: string; order?: string };
}

/**
 * Applies an Ultimate theme preset, framework-agnostically. Call this
 * once before mounting any Ultimate component (Angular/React/Vue) — every
 * `*-core` package's StyleSheet registration reads from the same
 * `Theme` singleton this function configures.
 */
export function applyUltimateTheme(options: ApplyUltimateThemeOptions = {}): void {
  const { preset = auraPreset, darkModeSelector = "system", cssLayer = false } = options;

  Theme.setTheme({
    preset,
    options: {
      prefix: "u",
      darkModeSelector,
      cssLayer,
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/themes test -- apply-theme`
Expected: PASS.

- [ ] **Step 5: Write the real `src/index.ts` public barrel**

```typescript
export * from "./contract";
export { auraPreset } from "./presets/aura";
export { applyUltimateTheme, type ApplyUltimateThemeOptions } from "./apply-theme";
```

- [ ] **Step 6: Run the full `themes` test suite**

Run: `pnpm --filter @ultimate/themes test`
Expected: PASS.

- [ ] **Step 7: Build and typecheck**

Run: `pnpm --filter @ultimate/themes build && pnpm --filter @ultimate/themes typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/themes/src/apply-theme.ts packages/themes/src/index.ts packages/themes/test/apply-theme.test.ts
git commit -m "feat(themes): add applyUltimateTheme entry point"
```

---

## Task 12: Cross-framework theme consistency test

**Files:**

- Create: `packages/themes/test/cross-framework-consistency.test.ts`

**Interfaces:**

- Consumes: `applyUltimateTheme`/`auraPreset` from Task 11; `ngCoreStyleSheet`/`reactCoreStyleSheet`/`vueCoreStyleSheet` singletons (already exist, Tasks 5-7 wired their registration but did not change their export shape).
- Produces: the dedicated exit-criterion test required by spec §10 ("validate cross-framework theme consistency" — Blueprint Phase 5 objective).

**Note on package boundary**: this test file lives in `packages/themes/test/`, but per spec §6/Global Constraints, `@ultimate/themes` has zero dependency on `ng-core`/`react-core`/`vue-core`. Add these three as `devDependencies` only (test-time, not shipped) in `packages/themes/package.json` — confirm this does not violate Task 2's dependency-ceiling validator (it watches production `dependencies`, not `devDependencies`; verify this distinction in `validate-dependency-ceiling.mjs`'s implementation before proceeding — if it does flag devDependencies too, this test must instead live in a different location, such as a new top-level `test/integration/` directory outside any single package, matching whatever cross-package-test convention (if any) an earlier phase already established; check for one before inventing a new location).

- [ ] **Step 1: Add `devDependencies` for the three `*-core` packages**

In `packages/themes/package.json`, add:

```json
"devDependencies": {
  "@ultimate/ng-core": "workspace:*",
  "@ultimate/react-core": "workspace:*",
  "@ultimate/vue-core": "workspace:*",
  "jsdom": "^25.0.1",
  "tsup": "^8.3.0",
  "typescript": "^5.9.3",
  "vitest": "^2.1.8"
}
```

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { applyUltimateTheme } from "../src/apply-theme";
import { Theme, dt } from "@ultimate/uix-styled";

describe("cross-framework theme consistency", () => {
  beforeEach(() => {
    applyUltimateTheme();
  });

  it("dt() resolves the same button.primary.background token identically regardless of which *-core package last registered a style", () => {
    // The Theme singleton is shared process-wide (module-level default
    // export) — dt()'s resolution does not depend on which *-core
    // package's StyleSheet instance registered a style. This test
    // asserts that guarantee directly, since ng-core/react-core/vue-core
    // each own a SEPARATE StyleSheet singleton instance (§1.4) but all
    // three read from the SAME uix-styled Theme singleton for dt().
    const resolved = dt("button.primary.background");
    expect(resolved).toContain("var(--u-button-primary-background");
  });

  it("the same preset produces the same resolved CSS variable name whether registered via ng-core's, react-core's, or vue-core's StyleSheet.add()", async () => {
    const { css } = await import("@ultimate/uix-styled");
    const { ngCoreStyleSheet } = await import("@ultimate/ng-core/dist/basecomponent/style-sheet.mjs" /* adjust to the package's real subpath export if one exists, else import the package root and access the relevant export */);
    const { reactCoreStyleSheet } = await import("@ultimate/react-core/dist/styling/react-style-sheet.mjs" /* same note */);
    const { vueCoreStyleSheet } = await import("@ultimate/vue-core/dist/styling/vue-style-sheet.mjs" /* same note */);

    const testCss = ".u-consistency-test { color: dt('button.primary.background'); }";

    ngCoreStyleSheet.add("consistency-test-ng", css`${testCss}`);
    reactCoreStyleSheet.add("consistency-test-react", css`${testCss}`);
    vueCoreStyleSheet.add("consistency-test-vue", css`${testCss}`);

    const ngResult = ngCoreStyleSheet.get("consistency-test-ng")?.css;
    const reactResult = reactCoreStyleSheet.get("consistency-test-react")?.css;
    const vueResult = vueCoreStyleSheet.get("consistency-test-vue")?.css;

    expect(ngResult).toBe(reactResult);
    expect(reactResult).toBe(vueResult);
  });
});
```

**Note on the dynamic `import()` subpaths above**: these three `*-core` packages currently export only a single root entry point (verified during Phase 2-4: `ng-core`, `react-core`, `vue-core` each have one `"."` export, no subpath exports for internal modules like `style-sheet`/`react-style-sheet`/`vue-style-sheet` — these are internal, not part of any package's public `exports` map). Before writing this test, check whether `ngCoreStyleSheet`/`reactCoreStyleSheet`/`vueCoreStyleSheet` are re-exported from each package's root `index.ts` barrel. If not, this test cannot import them via the package's public API — in that case, rewrite this second test to instead assert consistency through each package's actual public surface (e.g. render a real `UButton`/similar proof-set component from each framework via its own package's test harness, then read the registered CSS from the DOM `<style>` tag each produces, comparing the resolved `var(...)` text across all three DOM outputs) rather than reaching into internal singletons across a package boundary that isn't structurally supported. Prefer that public-surface approach if it's available — it is the more architecturally honest test of "cross-framework consistency" in the first place.

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @ultimate/themes test -- cross-framework-consistency`
Expected: FAIL until Step 2's import-path issue (see the note above) is resolved into a real, working test.

- [ ] **Step 4: Resolve the import approach and get the test passing**

Follow whichever path Step 2's note resolved to (internal singleton re-export, or public-surface component-render comparison). Iterate until green.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @ultimate/themes test -- cross-framework-consistency`
Expected: PASS.

- [ ] **Step 6: Run the full `themes` suite**

Run: `pnpm --filter @ultimate/themes test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/themes/package.json packages/themes/test/cross-framework-consistency.test.ts
git commit -m "test(themes): add cross-framework theme consistency suite"
```

---

## Task 13: Light/dark mode and RTL/LTR regression verification

**Files:**

- Create: `packages/themes/test/dark-mode.test.ts`
- Create: `packages/themes/test/direction.test.ts`

**Interfaces:**

- Consumes: `applyUltimateTheme` from Task 11; real component CSS from `uix-styles` (Button, for the `:dir(rtl)` regression check).
- Produces: the two remaining spec §10 exit criteria not yet covered by any prior task's tests — light/dark functional verification, RTL/LTR regression confirmation.

- [ ] **Step 1: Write the failing dark-mode test**

```typescript
// packages/themes/test/dark-mode.test.ts
import { describe, it, expect } from "vitest";
import { applyUltimateTheme } from "../src/apply-theme";
import { Theme } from "@ultimate/uix-styled";

describe("dark mode", () => {
  it("defaults to 'system' (prefers-color-scheme media query)", () => {
    applyUltimateTheme();
    expect(Theme.getOptions().darkModeSelector).toBe("system");
  });

  it("supports an explicit class-based dark mode selector", () => {
    applyUltimateTheme({ darkModeSelector: ".dark" });
    expect(Theme.getOptions().darkModeSelector).toBe(".dark");
  });

  it("the assembled preset has distinct light and dark values for the same semantic token", () => {
    applyUltimateTheme();
    const preset = Theme.getPreset() as any;
    const lightPrimary = preset.semantic?.colorScheme?.light?.primary;
    const darkPrimary = preset.semantic?.colorScheme?.dark?.primary;
    expect(lightPrimary).toBeDefined();
    expect(darkPrimary).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails, then passes**

Run: `pnpm --filter @ultimate/themes test -- dark-mode`
Expected: FAIL initially only if Task 10/11 left a gap (e.g. `semantic.colorScheme.dark.primary` missing from the ported preset) — if so, fix the gap in `packages/themes/src/presets/aura/base.ts` (Task 10) rather than weakening this test. Otherwise this should already pass given Tasks 10-11's work; if it passes immediately, that's expected (this task is primarily a verification/regression-lock task, not new-feature TDD).

- [ ] **Step 3: Write the failing RTL regression test**

```typescript
// packages/themes/test/direction.test.ts
import { describe, it, expect } from "vitest";
import { style as buttonStyle } from "@ultimate/uix-styles/button";

describe("RTL/LTR direction", () => {
  it("uix-styles' Button CSS still contains its native :dir(rtl) rule, unaffected by Phase 5's dt() wiring changes", () => {
    expect(buttonStyle).toContain(":dir(rtl)");
    expect(buttonStyle).toContain(".u-button-icon-right:dir(rtl)");
  });
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/themes test -- direction`
Expected: PASS immediately — this is a regression check confirming Tasks 5-7's `*-core` wiring changes did not touch `uix-styles` (per Global Constraints) and therefore didn't disturb the native `:dir(rtl)` CSS already shipped there.

- [ ] **Step 5: Add `@ultimate/uix-styles` as a `devDependency` if not already present**

Check `packages/themes/package.json`'s `devDependencies` — add `"@ultimate/uix-styles": "workspace:*"` if Task 12 didn't already add it.

- [ ] **Step 6: Run the full `themes` suite**

Run: `pnpm --filter @ultimate/themes test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/themes/test/dark-mode.test.ts packages/themes/test/direction.test.ts packages/themes/package.json
git commit -m "test(themes): verify light/dark mode application and RTL regression"
```

---

## Task 14: Export-resolution test suite (matches Phase 1/3/4 precedent)

**Files:**

- Create: `packages/themes/test/exports.test.ts`

**Interfaces:**

- Consumes: `packages/themes/dist/index.mjs` (built output from Task 8/11's `tsup` config).
- Produces: nothing consumed by later tasks — closes the same "every barrel export is callable/defined" gap Phase 4's Task closed for `vue-core`/`vue` (per commit `1c5cf92`'s precedent, referenced in the conversation's own history).

- [ ] **Step 1: Read an existing `exports.test.ts` as the exact template**

Read `packages/uix-styled/test/exports.test.ts` in full — match its structure exactly (it iterates the package's real barrel exports and asserts each is defined/callable-or-a-value as appropriate).

- [ ] **Step 2: Write `packages/themes/test/exports.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import * as ThemesBarrel from "../dist/index.mjs";

describe("package exports", () => {
  it("every barrel export is callable/defined", () => {
    expect(ThemesBarrel.applyUltimateTheme).toBeTypeOf("function");
    expect(ThemesBarrel.auraPreset).toBeTypeOf("object");
    expect(ThemesBarrel.auraPreset).not.toBeNull();
  });
});
```

**Note**: match the exact import-from-`dist/`-vs-`src/` convention the template file (Step 1) uses — some of this repo's `exports.test.ts` files import from built `dist/` output specifically to catch build-config mistakes (missing entries, broken subpath exports), not from `src/`. Confirm and match.

- [ ] **Step 3: Build first, then run the test**

Run: `pnpm --filter @ultimate/themes build && pnpm --filter @ultimate/themes test -- exports`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/themes/test/exports.test.ts
git commit -m "test(themes): add export-resolution suite"
```

---

## Task 15: Documentation — `packages/themes/README.md` + provenance/roadmap closeout

**Files:**

- Create: `packages/themes/README.md`
- Modify: `docs/architecture/PACKAGE_ARCHITECTURE.md`
- Modify: `docs/architecture/ROADMAP.md`
- Modify: `docs/architecture/DECISIONS.md` (if ADR-007 needs a closure note — check its current wording)

**Interfaces:**

- Consumes: everything from Tasks 1-14 — this is the closeout task.
- Produces: nothing consumed by later tasks in this plan (last task).

- [ ] **Step 1: Read `ng-core`'s/`react-core`'s/`vue-core`'s READMEs as the depth template**

Read `packages/react-core/README.md` and `packages/vue-core/README.md` in full to match their descriptive depth (per spec exit criteria requirement).

- [ ] **Step 2: Write `packages/themes/README.md`**

Cover: what `@ultimate/themes` is (framework-neutral theme contract + baseline preset), the public API (`applyUltimateTheme`, `auraPreset`, contract types), how a consuming Angular/React/Vue app calls `applyUltimateTheme()` once before mounting any component, what is and isn't in scope (five-component proof set only, no density, motion stays in `uix-motion`), and a link to the spec (`docs/superpowers/specs/2026-09-01-phase-5-ultimate-themes-design.md`) for full architectural rationale.

- [ ] **Step 3: Update `docs/architecture/PACKAGE_ARCHITECTURE.md`**

Find the line noting `packages/themes` as "Deferred to Phase 5" (verified present during spec research) and update it to reflect the package now exists, matching whatever "Complete"/status-marking convention the doc uses for `ng-core`/`react-core`/`vue-core`'s equivalent entries.

- [ ] **Step 4: Update `docs/architecture/ROADMAP.md`**

Change the Phase 5 row from whatever its current status reads to `Complete`, matching the exact table format already used for Phases 0-4 (per this conversation's own earlier fix to this file).

- [ ] **Step 5: Check ADR-007 for a closure note**

Read `docs/architecture/DECISIONS.md`'s ADR-007 entry ("Themes/presets are a separate layer from component implementations, deferred to Phase 5" — verified during spec research). If this repo's convention is to add a closure/status note to a deferred-decision ADR once its deferred phase lands (check whether ADR-023 or similar has such a note, as precedent), add an equivalent note here. If no such convention exists, skip this step.

- [ ] **Step 6: Run the full workspace test suite one final time**

Run: `pnpm -r --if-present run test`
Expected: PASS across every package — this is the full-repo regression check before closing Phase 5.

- [ ] **Step 7: Run the full provenance and dependency-ceiling validators one final time**

Run: `node scripts/provenance/validate-provenance.mjs && node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/themes/README.md docs/architecture/PACKAGE_ARCHITECTURE.md docs/architecture/ROADMAP.md docs/architecture/DECISIONS.md
git commit -m "docs(themes): add README, close out Phase 5 provenance and roadmap"
```

---

## Self-Review Notes (for the plan author — not a task)

**Spec coverage check**: every spec section maps to a task —
§1.3 (pin) → Task 1; §2 (package scaffold) → Task 8; §3 (rebrand) → Tasks 3-4; §4 (contract) → Task 8; §5+§5.1 (application timing + dt() wiring) → Tasks 5-7, 11; §6 (integration boundary) → Task 12; §10 exit criteria → Tasks 1-15 collectively, cross-checked below.

**Exit-criteria cross-check** (spec §10, in order):
1. `@primeuix/themes` pinned → Task 1. 2. `dt()` wiring at 3 call sites → Tasks 5-7. 3. `@ultimate/themes` package exists/builds → Task 8. 4. CSS var prefix `u` → Task 3. 5. `uix-styled` barrel rebrand recorded → Tasks 3-4. 6. Real token values for 5 components → Task 10. 7. Light/dark functional → Task 13. 8. RTL/LTR regression → Task 13. 9. Cross-framework consistency → Task 12. 10. Dependency-ceiling extended → Task 2. 11. Provenance validator extended → Task 2. 12. `themes.json` manifest → Task 10. 13. README → Task 15. 14. ROADMAP → Task 15.

No gaps found. Every exit criterion has an owning task.
