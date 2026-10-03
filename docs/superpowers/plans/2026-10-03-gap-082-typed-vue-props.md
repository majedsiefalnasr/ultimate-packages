# Typed Vue Component Props (GAP-082) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@ultimate/vue`'s generated declarations carry real component prop types so wrong prop value types are compile-time errors, without false errors for valid code and without any runtime behavior change, guarded by a CI-enforced consumer type-check.

**Architecture:** The 95 Vue base factories return `defineComponent({...})` (inferred) instead of `: ComponentOptions`. Wrong or too-narrow inferred types are corrected with type-only `PropType` casts, or JSDoc casts in JavaScript SFCs. These cover the 11 type-less props, readonly-accepting arrays, and contract-based nullability. A packed-package consumer check (`Bundler` + `NodeNext`, `skipLibCheck: false`, positive and negative fixtures) runs in the existing CI "Validate generated artifacts" step.

**Tech Stack:** Vue 3.5.42 (Options API, `extends:` chains, ADR-032), `vue-tsc` 2.2.12, TypeScript 5.9.3, `tsup`, pnpm 9.6, Node 20.19.2 (local builds and tests).

**Spec:** `docs/superpowers/specs/2026-10-03-gap-082-typed-vue-props-design.md` (approved; Spec Review decisions in its §12). Decision: ADR-049. Evidence: `docs/architecture/research/2026-10-03-gap-082-typed-vue-props-research.md`.

**Plan Review (2026-10-03):** approved with corrections, which are applied in this version:

- D2: truthiness is never N3 evidence.
- The 11 type-less props keep their fixed Spec §5.2 decisions in Task 4.
- Broad classification means every in-scope prop is classified, not that every one becomes nullable.
- Task 5 adds `| null` to each prop's existing public type, read from the build, never derived from the runtime constructor.
- D3 is approved as written.

Execution: subagent-driven. Task 4 has its own review gate before Task 5.

## Global Constraints

- **Node and tests:**
  - Use Node 20 for builds and tests: `export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"`.
  - Run per-package tests only (`pnpm --filter <pkg> test`), never full-monorepo `pnpm test`.
- **No runtime behavior change.**
  - The only allowed runtime-declaration difference is the 11 type-less props going from an absent `type` to `type: null`.
  - No option, prop default, emit, hook, method or computed may change value.
  - No runtime `String`/`Boolean`/other constructor may be added to a prop that lacks one.
  - Nullable casts keep the existing runtime `type` constructor.
- **SFCs:**
  - SFCs keep their plain JavaScript `<script>`: no `lang="ts"`, no `<script setup>`.
  - `extends:` chains are unchanged (ADR-032).
- **Forbidden typings:**
  - `PropType<unknown>` must not be used for the value-like props (it collapses to `undefined`). Use `PropType<any>`.
  - No literal-union / `HintedString` enum typing.
  - No slot typing, no emit-payload typing, no `pt`/`dt`/`unstyled` props, no unknown-prop rejection.
- **Bare `fluid`:** the runtime behavior of a bare `fluid` attribute must stay unchanged (the prop receives `""`). Fixing it is out of scope (a separate gap if confirmed).
- **Nullability rule (Spec §5.4):**
  - `null` enters a public type only on evidence N1 (Ultimate source handles `null` meaningfully), N2 (Ultimate usage passes `null` intentionally) or N3 (PrimeVue 4.5.5 declares `null` and Ultimate tolerates and handles it).
  - `default: null` alone is never evidence.
  - With no evidence, the prop is non-nullable and recorded as "no qualifying evidence".
- **Governance:**
  - Change no GAP status (closeout is a later gate).
  - Do not push, merge or open a PR.
- **Formatting and lint:**
  - No new prettier or lint failures in touched files.
  - Never `prettier --write` a whole pre-existing file that already fails. Format only new files, or check the prettier delta with the Task 1 tool.
- **Shell hook:** it blocks `rm -rf`, `unlink`, `git clean -f`, `git restore`, `git checkout --`, output redirects to variable paths, and heredocs containing angle-bracket placeholders. Use literal paths, Python scripts, or the Edit/Write tools.
- **Commits:**
  - Stage explicit files only, never `git add -A` / `git add .`.
  - Every commit ends with:
    `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
    `Claude-Session: https://claude.ai/code/session_01PpFcC3BnfH1gFB1Gc1n7VS`

## Review Focus

The input classes most likely to bite a consumer that no single code change exercises. Each is pinned by a line in the Task 1 fixtures.

1. **Barrel imports** (`import { UButton } from "@ultimate/vue"`) must carry the same prop types as subpath imports. Pinned by the `UBarrelButton` line in `ValidUsage.vue`.
2. **Partially typed components** (SFC-local props plus inherited factory props, e.g. `UScroller`) must expose both sets. Pinned by `<UScroller :items … disabled />`.
3. **`v-model` on an array-valued model** (`UOrderList`) must accept a mutable array ref. Pinned by `<UOrderList v-model="mutableRows" />`.
4. **Emit listeners** on inherited emits (`@value-change`, `@update:model-value`) must type-check. Pinned in `ValidUsage.vue`.
5. **Render-function consumers** (`h(UButton, {...})`): valid props compile and a wrong type errors. Pinned by `rendered` in both fixtures.

## Plan decisions requiring Plan Review

These operationalize Spec rules without changing them. Reject any of them at Plan Review.

- **D1 — N1 meaning.**
  - Counts: null-specific handling of the prop in the component, its base, or a component in the same directory that reads it. That means `??`, `?.`, `== null`, `=== null`, `!= null`, `!== null`, or `null` used as an assigned, emitted or compared sentinel.
  - Does not count on its own: a generic truthiness check (`v-if="x"`, `x ? … : …`, `x || …`). It does not distinguish `null` from other falsy values.
- **D2 — N3 (corrected at Plan Review).** N3 requires both of these:
  1. PrimeVue 4.5.5 declares the corresponding prop as nullable; and
  2. Ultimate contains concrete evidence that `null` is intentionally accepted as a meaningful or "unset" value for that prop. That means null-specific handling (`??`, `?.`, `== null`, `=== null`, `!= null`, `!== null`, or `null` as an assigned, emitted or compared sentinel), or intentional `null` usage under N2.

  Generic truthiness or falsy behavior (`if (foo)`, `foo || fallback`, `foo ? a : b`) is **not** sufficient on its own, because it does not distinguish `null` from other falsy values.

- **D3 — CI host.** The consumer check becomes `packages/vue`'s `validate` script. CI's existing "Validate generated artifacts" step (`pnpm run validate`, which runs after "Build" in `.github/workflows/ci.yml`) already runs every package's `validate`, so `ci.yml` itself is unchanged.
- **D4 — Runtime comparison.** A scratch build of the branch start (`376b23e`, which has the same code as `main` `5e76fd5`) is compared against each task's build by a scratch script. It is a one-time proof, not committed (Spec §9).
- **D5 — MIGRATION placement.** New bullets go in `docs/architecture/MIGRATION.md` §8 under a new "Added on `feature/gap-082-typed-vue-props`" sentence, matching how the follow-up phase added its entries.
- **D6 — `size:validate`.** It needs `origin/main`, which has no remote here, so it is externally unexercisable locally. Task 6 runs `size:measure` and the barrel-gzip check, and records the limitation.

---

### Task 1: Consumer type-check harness, fixtures, and scratch baseline tools

**Files:**

- Create: `packages/vue/scripts/validate-consumer-types.mjs`
- Create: `packages/vue/test/consumer-types/ValidUsage.vue`
- Create: `packages/vue/test/consumer-types/InvalidUsage.vue`
- Scratch (not committed): `/tmp/claude-501/gap082-impl/{make_nm.py,prettier_delta.py,runtime-compare.mjs}` and a built baseline copy at `/tmp/claude-501/gap082-impl/base`

**Interfaces:**

- Produces:
  - `node packages/vue/scripts/validate-consumer-types.mjs [--diagnostics]`. It exits 0 when both `Bundler` and `NodeNext` type-checks pass, and 1 otherwise, printing the `vue-tsc` output.
  - Fixtures live in `packages/vue/test/consumer-types/`. Later tasks add lines to them.
  - Scratch tools used by Tasks 2–6: `prettier_delta.py BASE FILE…` prints each file's prettier diff-line count at BASE and in the working tree. `runtime-compare.mjs BASE_ROOT TYPED_ROOT` prints runtime prop-declaration differences and a bare-`fluid` probe.

- [ ] **Step 1: Create the scratch tools directory and `make_nm.py`**

`mkdir -p /tmp/claude-501/gap082-impl`, then write `/tmp/claude-501/gap082-impl/make_nm.py`:

```python
"""Give a scratch copy (ROOT/packages/{vue-core,vue}) real node_modules directories
made of symlinks into the repo's installed deps, so tool caches stay in scratch.
@ultimate/vue-core inside vue points at the scratch vue-core copy.
Usage: python3 make_nm.py ROOT"""
import os
import pathlib
import sys

repo = pathlib.Path("/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/packages")
pipe = pathlib.Path(sys.argv[1]) / "packages"
SKIP = {"@ultimate", ".vite", ".vitest", ".cache"}
for pkg in ("vue-core", "vue"):
    src_nm, dst_nm = repo / pkg / "node_modules", pipe / pkg / "node_modules"
    assert not dst_nm.exists(), dst_nm
    dst_nm.mkdir()
    for entry in sorted(os.listdir(src_nm)):
        if entry not in SKIP:
            os.symlink(src_nm / entry, dst_nm / entry)
    (dst_nm / "@ultimate").mkdir()
    for entry in sorted(os.listdir(src_nm / "@ultimate")):
        target = os.path.realpath(src_nm / "@ultimate" / entry)
        if pkg == "vue" and entry == "vue-core":
            target = str(pipe / "vue-core")
        os.symlink(target, dst_nm / "@ultimate" / entry)
print("node_modules ready under", pipe)
```

- [ ] **Step 2: Build the baseline copy**

```bash
mkdir -p /tmp/claude-501/gap082-impl/base
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
git archive 376b23e packages/vue packages/vue-core tsconfig.base.json | tar -x -C /tmp/claude-501/gap082-impl/base
python3 /tmp/claude-501/gap082-impl/make_nm.py /tmp/claude-501/gap082-impl/base
export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"
cd /tmp/claude-501/gap082-impl/base/packages/vue-core && ./node_modules/.bin/tsup && node scripts/rename-dts.mjs
cd /tmp/claude-501/gap082-impl/base/packages/vue && ./node_modules/.bin/tsup && ./node_modules/.bin/vue-tsc -p tsconfig.dts.json --declaration --emitDeclarationOnly --outDir dist && node scripts/rename-dts.mjs
find /tmp/claude-501/gap082-impl/base/packages/vue/dist -name '*.d.mts' -exec cat {} + | wc -c
```

Expected: both builds exit 0, and the final byte count is `194079`, matching `main`'s `@ultimate/vue` declarations.

- [ ] **Step 3: Write `prettier_delta.py` and `runtime-compare.mjs`**

`/tmp/claude-501/gap082-impl/prettier_delta.py`:

```python
"""Usage: prettier_delta.py BASE FILE...  — prettier diff-line count at BASE vs working tree."""
import difflib
import subprocess
import sys

base, files = sys.argv[1], sys.argv[2:]
repo = "/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate"


def count(src, path):
    out = subprocess.run(["npx", "prettier", "--stdin-filepath", path], input=src, capture_output=True, text=True, cwd=repo).stdout
    diff = difflib.unified_diff(src.splitlines(), out.splitlines(), lineterm="", n=0)
    return sum(1 for l in diff if l[:1] in "+-" and not l.startswith(("+++", "---")))


for f in files:
    old = subprocess.run(["git", "show", f"{base}:{f}"], capture_output=True, text=True, cwd=repo)
    before = count(old.stdout, f) if old.returncode == 0 else "new"
    after = count(open(f"{repo}/{f}").read(), f)
    print(f, before, "->", after)
```

`/tmp/claude-501/gap082-impl/base/packages/vue/runtime-compare.mjs`. It lives inside the baseline copy so it resolves `vue`:

```js
// Compare effective runtime prop declarations (props merged through extends/mixins)
// of every exported U* object between two builds, and probe a bare `fluid`.
// Usage (from this directory): node runtime-compare.mjs BASE_ROOT TYPED_ROOT
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

const [baseRoot, typedRoot] = process.argv.slice(2);
const base = await import(`${baseRoot}/packages/vue/dist/index.mjs`);
const typed = await import(`${typedRoot}/packages/vue/dist/index.mjs`);
const ALLOWED = new Set([
  "modelValue",
  "defaultValue",
  "size",
  "fluid",
  "variant",
  "value",
  "trueValue",
  "falseValue",
]);

function describeType(t) {
  if (t === null || t === undefined) return String(t);
  if (Array.isArray(t)) return "[" + t.map(describeType).join(",") + "]";
  return t.name ?? typeof t;
}
function effectiveProps(c, seen = new Set()) {
  if (!c || typeof c !== "object" || seen.has(c)) return {};
  seen.add(c);
  const out = { ...effectiveProps(c.extends, seen) };
  for (const m of c.mixins ?? []) Object.assign(out, effectiveProps(m, seen));
  for (const [k, v] of Object.entries(c.props ?? {})) {
    const o = v && typeof v === "object" && !Array.isArray(v) ? v : { type: v };
    out[k] = {
      type: describeType(o.type),
      rest: JSON.stringify({
        default:
          typeof o.default === "function" ? "fn:" + JSON.stringify(o.default.call({})) : o.default,
        required: !!o.required,
      }),
    };
  }
  return out;
}

let compared = 0,
  props = 0,
  unexpected = 0;
const allowedByProp = {};
for (const name of Object.keys(base).filter(
  (n) => /^U[A-Z]/.test(n) && typeof base[n] === "object"
)) {
  compared++;
  const a = effectiveProps(base[name]),
    b = effectiveProps(typed[name]);
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    props++;
    const x = a[k],
      y = b[k];
    if (x && y && x.type === y.type && x.rest === y.rest) continue;
    if (
      x &&
      y &&
      x.rest === y.rest &&
      ALLOWED.has(k) &&
      x.type === "undefined" &&
      y.type === "null"
    ) {
      allowedByProp[k] = (allowedByProp[k] ?? 0) + 1;
      continue;
    }
    unexpected++;
    console.log(`UNEXPECTED ${name}.${k}: base=${JSON.stringify(x)} typed=${JSON.stringify(y)}`);
  }
}
console.log(
  `compared ${compared} exports, ${props} effective props; allowed type undefined->null: ${JSON.stringify(allowedByProp)}; unexpected: ${unexpected}`
);

for (const [label, mod] of [
  ["base", base],
  ["typed", typed],
]) {
  const warnings = [];
  let fluid, resolved;
  const Probe = {
    extends: mod.UInputText,
    created() {
      fluid = this.fluid;
      resolved = this.resolvedFluid;
    },
  };
  const app = createSSRApp({
    render: () => h(Probe, { fluid: "", size: 3, modelValue: { a: 1 } }),
  });
  app.config.warnHandler = (m) => warnings.push(m.split("\n")[0]);
  await renderToString(app);
  console.log(
    `[${label}] bare fluid -> this.fluid=${JSON.stringify(fluid)} resolvedFluid=${JSON.stringify(resolved)} warnings=${warnings.length ? warnings.join(" | ") : "none"}`
  );
}
if (unexpected) process.exit(1);
```

Run it with the baseline against itself to prove the tool:

```bash
cd /tmp/claude-501/gap082-impl/base/packages/vue && node runtime-compare.mjs /tmp/claude-501/gap082-impl/base /tmp/claude-501/gap082-impl/base
```

Expected: `unexpected: 0`, `allowed … {}`, and both probe lines show `this.fluid="" resolvedFluid="" warnings=none`.

- [ ] **Step 4: Write the consumer-check script**

`packages/vue/scripts/validate-consumer-types.mjs`:

```js
#!/usr/bin/env node
// GAP-082 consumer type-check. Packs the built @ultimate/vue and its workspace
// runtime dependencies, installs them into a scratch consumer, and type-checks
// the consumer fixtures with vue-tsc under moduleResolution Bundler and NodeNext
// (skipLibCheck: false). Imports resolve through the packages' `exports` maps.
// The fixtures in test/consumer-types pin both directions: valid usage must
// produce no errors, and every @vue-expect-error / @ts-expect-error marker must
// be consumed (an unused marker, TS2578, means prop types were lost).
// Requires a prior `pnpm run build`. `--diagnostics` also prints vue-tsc's
// extended diagnostics (check time, memory) for the size/cost record.
import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const VUE_DIR = join(fileURLToPath(import.meta.url), "..", "..");
const PACKAGES_DIR = join(VUE_DIR, "..");
const FIXTURES_DIR = join(VUE_DIR, "test", "consumer-types");
const VUE_TSC = join(VUE_DIR, "node_modules", ".bin", "vue-tsc");
const DIAGNOSTICS = process.argv.includes("--diagnostics");

function readManifest(dir) {
  return JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
}

// @ultimate/vue plus the transitive closure of its workspace runtime dependencies.
function runtimeClosure() {
  const result = new Map([["@ultimate/vue", VUE_DIR]]);
  const queue = ["@ultimate/vue"];
  while (queue.length > 0) {
    const deps = readManifest(result.get(queue.shift())).dependencies ?? {};
    for (const [name, range] of Object.entries(deps)) {
      if (!String(range).startsWith("workspace:") || result.has(name)) continue;
      result.set(name, join(PACKAGES_DIR, name.replace(/^@ultimate\//, "")));
      queue.push(name);
    }
  }
  return result;
}

function pack(dir, destination) {
  const output = execFileSync("pnpm", ["pack", "--pack-destination", destination], {
    cwd: dir,
    encoding: "utf8",
  });
  return output.trim().split("\n").pop();
}

function writeConsumer(consumerDir, tarballs) {
  const overrides = Object.fromEntries([...tarballs].map(([name, tgz]) => [name, `file:${tgz}`]));
  const vueVersion = readManifest(join(VUE_DIR, "node_modules", "vue")).version;
  writeFileSync(
    join(consumerDir, "package.json"),
    JSON.stringify(
      {
        name: "ultimate-vue-consumer-types",
        private: true,
        type: "module",
        dependencies: { "@ultimate/vue": `file:${tarballs.get("@ultimate/vue")}`, vue: vueVersion },
        pnpm: { overrides },
      },
      null,
      2
    )
  );

  const exportKeys = Object.keys(readManifest(VUE_DIR).exports).filter(
    (key) => key !== "./package.json"
  );
  const imports = exportKeys.map((key, i) => {
    const specifier = key === "." ? "@ultimate/vue" : `@ultimate/vue/${key.slice(2)}`;
    return `import * as m${i} from "${specifier}";`;
  });
  imports.push(`export const allEntries = [${exportKeys.map((_, i) => `m${i}`).join(", ")}];`);
  writeFileSync(join(consumerDir, "all-entries.ts"), `${imports.join("\n")}\n`);

  const fixtures = readdirSync(FIXTURES_DIR).filter(
    (file) => file.endsWith(".vue") || file.endsWith(".ts")
  );
  for (const file of fixtures) copyFileSync(join(FIXTURES_DIR, file), join(consumerDir, file));

  for (const [mode, module, moduleResolution] of [
    ["bundler", "ESNext", "Bundler"],
    ["nodenext", "NodeNext", "NodeNext"],
  ]) {
    const compilerOptions = {
      target: "ES2022",
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      module,
      moduleResolution,
      strict: true,
      noEmit: true,
      skipLibCheck: false,
      jsx: "preserve",
    };
    writeFileSync(
      join(consumerDir, `tsconfig.${mode}.json`),
      JSON.stringify({ compilerOptions, include: ["all-entries.ts", ...fixtures] }, null, 2)
    );
  }
  return exportKeys.length;
}

function main() {
  const workDir = mkdtempSync(join(tmpdir(), "ultimate-vue-consumer-types-"));
  let failed = false;
  try {
    const packDir = join(workDir, "packs");
    const consumerDir = join(workDir, "consumer");
    execFileSync("mkdir", ["-p", packDir, consumerDir]);
    const tarballs = new Map();
    for (const [name, dir] of runtimeClosure()) tarballs.set(name, pack(dir, packDir));
    const entryCount = writeConsumer(consumerDir, tarballs);
    execFileSync("pnpm", ["install", "--no-lockfile", "--prefer-offline"], {
      cwd: consumerDir,
      stdio: "ignore",
    });

    for (const mode of ["bundler", "nodenext"]) {
      const args = [
        "-p",
        `tsconfig.${mode}.json`,
        ...(DIAGNOSTICS ? ["--extendedDiagnostics"] : []),
      ];
      const run = spawnSync(VUE_TSC, args, { cwd: consumerDir, encoding: "utf8" });
      const output = `${run.stdout}${run.stderr}`.trim();
      if (run.status === 0) {
        console.log(
          `[validate-consumer-types] OK (${mode}): ${entryCount} entry points and fixtures type-check`
        );
        if (DIAGNOSTICS)
          console.log(
            output
              .split("\n")
              .filter((l) => /^(Types|Memory used|Check time|Total time):/.test(l))
              .join("\n")
          );
      } else {
        failed = true;
        console.error(`[validate-consumer-types] FAIL (${mode}):\n${output}`);
      }
    }
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
  if (failed) process.exit(1);
}

main();
```

- [ ] **Step 5: Write the fixtures**

`packages/vue/test/consumer-types/ValidUsage.vue`:

```vue
<template>
  <!-- GAP-082 valid usage: every line must type-check with no error. -->
  <UButton label="Save" severity="danger" :loading="false" />
  <UBarrelButton label="From the barrel" />
  <UInputText v-model="text" size="small" variant="filled" fluid />
  <UInputText v-model="text" :fluid="true" default-value="seed" @value-change="onValueChange" />
  <USelect v-model="choice" :options="mutableOptions" @update:model-value="onChoice" />
  <USelect v-model="choice" :options="readonlyOptions" />
  <UCheckbox v-model="checked" binary />
  <UCheckbox v-model="answer" true-value="yes" false-value="no" />
  <URadioButton v-model="picked" :value="{ id: 1 }" />
  <UToggleSwitch v-model="flag" :true-value="1" :false-value="0" />
  <UTable :value="mutableRows" />
  <UTable :value="readonlyRows" />
  <UTable :value="mutableRows" :selection="mutableRows" />
  <UTable :value="mutableRows" :selection="readonlyRows" />
  <UTable :value="mutableRows" :selection="{ id: 1 }" />
  <UScroller :items="mutableOptions" :item-size="40" disabled />
  <UScroller :items="readonlyOptions" :item-size="40" />
  <UTieredMenuSub :items="mutableItems" />
  <UTieredMenuSub :items="readonlyItems" />
  <UAccordion value="0" />
  <UAccordion :value="0" />
  <UAccordion :value="readonlyKeys" />
  <UOrderList v-model="mutableRows" />
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import { UButton as UBarrelButton } from "@ultimate/vue";
import { UAccordion } from "@ultimate/vue/accordion";
import { UButton } from "@ultimate/vue/button";
import { UCheckbox } from "@ultimate/vue/checkbox";
import { UInputText } from "@ultimate/vue/input-text";
import { UOrderList } from "@ultimate/vue/order-list";
import { URadioButton } from "@ultimate/vue/radio-button";
import { UScroller } from "@ultimate/vue/scroller";
import { USelect } from "@ultimate/vue/select";
import { UTable } from "@ultimate/vue/table";
import { UTieredMenuSub } from "@ultimate/vue/tiered-menu";
import { UToggleSwitch } from "@ultimate/vue/toggle-switch";

const text = ref("hello");
const choice = ref<string | null>(null);
const checked = ref(false);
const answer = ref("no");
const picked = ref<{ id: number } | null>(null);
const flag = ref(0);
const mutableOptions: string[] = ["a", "b"];
const readonlyOptions: readonly string[] = ["a", "b"];
const mutableRows = ref<{ id: number }[]>([{ id: 1 }]);
const readonlyRows: readonly { id: number }[] = [{ id: 1 }];
const mutableItems = [{ label: "One" }];
const readonlyItems = [{ label: "One" }] as const;
const readonlyKeys: readonly string[] = ["0"];

function onValueChange(value: unknown): void {
  void value;
}
function onChoice(value: unknown): void {
  void value;
}

// Render-function consumers must type-check too.
export const rendered = h(UButton, { label: "Save", loading: true });
</script>
```

`packages/vue/test/consumer-types/InvalidUsage.vue`:

```vue
<template>
  <!-- GAP-082 invalid usage: every marker must be consumed by a real type error. -->
  <!-- @vue-expect-error label is a string prop -->
  <UButton :label="123" />
  <!-- @vue-expect-error loading is a boolean prop -->
  <UButton :loading="'yes'" />
  <!-- @vue-expect-error rows is a number prop -->
  <UTable :value="[]" :rows="'ten'" />
  <!-- @vue-expect-error size is a string prop -->
  <UInputText :size="3" />
  <!-- @vue-expect-error variant is a string prop -->
  <UInputText :variant="1" />
  <!-- @vue-expect-error fluid is a boolean prop -->
  <UInputText :fluid="'yes'" />
  <!-- @vue-expect-error UTable value (factory array prop) is an array -->
  <UTable :value="'not-an-array'" />
  <!-- @vue-expect-error UScroller items (factory array prop) is an array -->
  <UScroller :items="{ a: 1 }" />
  <!-- @vue-expect-error UTieredMenuSub items (SFC-local array prop) is an array -->
  <UTieredMenuSub :items="'not-an-array'" />
  <!-- @vue-expect-error UTable selection (union with Array) is an object or array -->
  <UTable :value="[]" :selection="5" />
  <!-- @vue-expect-error UAccordion value (union with Array) is a string, number or array -->
  <UAccordion :value="{ a: 1 }" />
</template>

<script setup lang="ts">
import { h } from "vue";
import { UAccordion } from "@ultimate/vue/accordion";
import { UButton } from "@ultimate/vue/button";
import { UInputText } from "@ultimate/vue/input-text";
import { UScroller } from "@ultimate/vue/scroller";
import { UTable } from "@ultimate/vue/table";
import { UTieredMenuSub } from "@ultimate/vue/tiered-menu";

// @ts-expect-error label is a string prop (render-function consumer)
export const rendered = h(UButton, { label: 123 });
</script>
```

- [ ] **Step 6: Run the check against the current code (negative control: must fail)**

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"
pnpm --filter "@ultimate/vue..." run build
node packages/vue/scripts/validate-consumer-types.mjs
```

Expected: exit 1. Each mode prints `FAIL` with exactly these errors:

- `TS2578 Unused '@ts-expect-error' directive` on `InvalidUsage.vue` lines 3, 5, 7, 9, 11, 13, 15, 17, 21, 23 and 36. Line 19 is already typed today, because SFC-local props survive.
- One `TS4104` on `ValidUsage.vue` line 21 (`UTieredMenuSub` readonly items).

Record this output in the task report as the GAP-082 negative control.

- [ ] **Step 7: Lint and format the new files**

```bash
npx prettier --check packages/vue/scripts/validate-consumer-types.mjs packages/vue/test/consumer-types/ValidUsage.vue packages/vue/test/consumer-types/InvalidUsage.vue
pnpm exec eslint packages/vue/scripts/validate-consumer-types.mjs packages/vue/test/consumer-types/ValidUsage.vue packages/vue/test/consumer-types/InvalidUsage.vue
```

These files are new, so `npx prettier --write` on them is allowed. Fix any eslint finding, then re-run Step 6. The same failures are still expected.

- [ ] **Step 8: Commit**

```bash
git add packages/vue/scripts/validate-consumer-types.mjs packages/vue/test/consumer-types/ValidUsage.vue packages/vue/test/consumer-types/InvalidUsage.vue
git commit -m "test(vue): add GAP-082 consumer type-check harness and fixtures" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01PpFcC3BnfH1gFB1Gc1n7VS"
```

---

### Task 2: Typed factories and the 11 type-less props

**Files:**

- Modify: every file under `packages/vue/src` and `packages/vue-core/src` that defines a `: ComponentOptions` factory (95 factories). This includes `packages/vue-core/src/base/{base-component,base-editable-holder,base-input}.ts` and `packages/vue-core/src/escape/{create-display-order-mixin,use-global-escape-key}.ts`.
- Modify (the 11 props): `packages/vue-core/src/base/base-editable-holder.ts`, `packages/vue-core/src/base/base-input.ts`, `packages/vue/src/checkbox/BaseCheckbox.ts`, `packages/vue/src/radio-button/BaseRadioButton.ts`, `packages/vue/src/toggle-switch/BaseToggleSwitch.ts`.

**Interfaces:**

- Consumes: the Task 1 harness and scratch tools.
- Produces: factories return inferred `defineComponent(...)` types. The 11 props have type-only types: `any` for `modelValue`, `defaultValue`, `value`, `trueValue` and `falseValue`; `string | null` for `size` and `variant`; `boolean | null` for `fluid`.

- [ ] **Step 1: Write the transform script**

`/tmp/claude-501/gap082-impl/transform.py`:

```python
"""GAP-082 Task 2 transform: `function f(...): ComponentOptions { return {...}; }`
-> `function f(...) { return defineComponent({...}); }` with clean `vue` imports.
Usage: python3 transform.py REPO_ROOT   (edits packages/{vue,vue-core}/src in place)."""
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1])
files_changed = factories = 0
skipped = []


def match_brace(text, open_idx):
    depth, j = 1, open_idx + 1
    while depth:
        c = text[j]
        depth += c == "{"
        depth -= c == "}"
        j += 1
    return j


def fix_imports(text):
    def repl(m):
        names = [n.strip() for n in m.group(1).split(",") if n.strip()]
        rest = re.sub(r"//[^\n]*|/\*.*?\*/", "", text.replace(m.group(0), ""), flags=re.S)
        if "ComponentOptions" in names and not re.search(r"\bComponentOptions\b", rest):
            names.remove("ComponentOptions")
        return f'import type {{ {", ".join(names)} }} from "vue";' if names else ""

    text = re.sub(r'import type \{([^}]*)\} from "vue";\n?', lambda m: (repl(m) + "\n") if repl(m) else "", text, count=1)
    value_import = re.search(r'import \{([^}]*)\} from "vue";', text)
    if value_import:
        names = [n.strip() for n in value_import.group(1).split(",") if n.strip()]
        if "defineComponent" not in names:
            names.append("defineComponent")
            text = text.replace(value_import.group(0), f'import {{ {", ".join(names)} }} from "vue";', 1)
    else:
        first_import = re.search(r"^import .*$", text, re.M)
        at = first_import.start() if first_import else 0
        text = text[:at] + 'import { defineComponent } from "vue";\n' + text[at:]
    return text


for src in (root / "packages/vue/src", root / "packages/vue-core/src"):
    for f in sorted(src.rglob("*.ts")):
        if f.name.endswith((".spec.ts", ".stories.ts", ".d.ts")):
            continue
        text = f.read_text()
        if "): ComponentOptions {" not in text:
            continue
        out, i, n = [], 0, 0
        while True:
            k = text.find("): ComponentOptions {", i)
            if k < 0:
                out.append(text[i:])
                break
            body_start = k + len("): ComponentOptions {")
            out.append(text[i:k] + ") {")
            fn_end = match_brace(text, body_start - 1)
            r = re.compile(r"\n  return \{\n").search(text, body_start)
            if not r or r.start() > fn_end:
                skipped.append(f"{f}:{text.count(chr(10), 0, k) + 1}")
                out.append(text[body_start:fn_end])
                i = fn_end
                continue
            obj_open = r.end() - 2
            obj_close = match_brace(text, obj_open)
            assert text[obj_close] == ";", f
            out.append(text[body_start:obj_open] + "defineComponent(" + text[obj_open:obj_close] + ")" + text[obj_close:fn_end])
            i, n = fn_end, n + 1
        f.write_text(fix_imports("".join(out)))
        files_changed += 1
        factories += n

print(f"files={files_changed} factories={factories} skipped={len(skipped)}")
for s in skipped:
    print("SKIPPED:", s)
```

- [ ] **Step 2: Apply the transform**

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
python3 /tmp/claude-501/gap082-impl/transform.py .
grep -rln "): ComponentOptions {" packages/vue/src packages/vue-core/src --include='*.ts'
grep -rn "^import.*\bComponentOptions\b" packages/vue/src packages/vue-core/src --include='*.ts' | grep -v "spec\|stories"
```

Expected:

- `files=95 factories=95 skipped=0`;
- both greps print nothing. A `BaseComponentOptions` import is fine, and the second grep's `\b` boundary excludes it.

If `skipped` is non-zero, stop and report: a factory has an unexpected shape.

- [ ] **Step 3: Type the 11 type-less props**

Make these exact replacements with the Edit tool. Add `PropType` to each file's `import type { … } from "vue"` (create `import type { PropType } from "vue";` if the file has no type import from `vue`).

`packages/vue-core/src/base/base-editable-holder.ts`:

```ts
      modelValue: { default: undefined },
      defaultValue: { default: undefined },
```

→

```ts
      modelValue: { type: null as unknown as PropType<any>, default: undefined },
      defaultValue: { type: null as unknown as PropType<any>, default: undefined },
```

`packages/vue-core/src/base/base-input.ts`:

```ts
      size: { default: null },
      fluid: { default: null },
      variant: { default: null },
```

→

```ts
      size: { type: null as unknown as PropType<string | null>, default: null },
      fluid: { type: null as unknown as PropType<boolean | null>, default: null },
      variant: { type: null as unknown as PropType<string | null>, default: null },
```

`packages/vue/src/checkbox/BaseCheckbox.ts`: `value: { default: null }` → `value: { type: null as unknown as PropType<any>, default: null }`; `trueValue: { default: true }` → `trueValue: { type: null as unknown as PropType<any>, default: true }`; `falseValue: { default: false }` → `falseValue: { type: null as unknown as PropType<any>, default: false }`.

`packages/vue/src/radio-button/BaseRadioButton.ts`: `value: { default: null }` → `value: { type: null as unknown as PropType<any>, default: null }`.

`packages/vue/src/toggle-switch/BaseToggleSwitch.ts`: `trueValue: { default: true }` → `trueValue: { type: null as unknown as PropType<any>, default: true }`; `falseValue: { default: false }` → `falseValue: { type: null as unknown as PropType<any>, default: false }`.

If eslint reports `@typescript-eslint/no-explicit-any` on these `PropType<any>` lines, add `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Vue infers PropType<unknown> as undefined; these props accept any value (GAP-082)` directly above each such line. Do not change `any` to `unknown`.

- [ ] **Step 4: Typecheck, build, test**

```bash
export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"
pnpm --filter @ultimate/vue-core typecheck
pnpm --filter @ultimate/vue typecheck
pnpm --filter "@ultimate/vue..." run build
pnpm --filter @ultimate/vue-core test
pnpm --filter @ultimate/vue test
```

Expected:

- both typechecks report 0 errors;
- both builds exit 0, including `rename-dts.mjs`'s specifier guard;
- vue-core `96 passed (96)`;
- vue `898 passed (898)`.

- [ ] **Step 5: Consumer check (expected: readonly-array errors only)**

```bash
node packages/vue/scripts/validate-consumer-types.mjs
```

Expected:

- exit 1;
- in both modes, every `InvalidUsage.vue` marker is consumed (no TS2578);
- the only errors are `TS4104` on `ValidUsage.vue` lines that pass a `readonly…` identifier to an array prop.

Task 3 fixes those. Any other error is a defect in this task: fix it, or stop and report.

- [ ] **Step 6: Runtime comparison**

```bash
cd /tmp/claude-501/gap082-impl/base/packages/vue && node runtime-compare.mjs /tmp/claude-501/gap082-impl/base /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
```

Expected:

- `unexpected: 0`;
- the allowed `undefined->null` differences are only for the 11 prop names;
- both probe lines show `this.fluid="" resolvedFluid="" warnings=none`.

- [ ] **Step 7: Prettier and lint deltas**

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
python3 /tmp/claude-501/gap082-impl/prettier_delta.py HEAD $(git diff --name-only)
pnpm exec eslint $(git diff --name-only)
```

Expected: every file's prettier count after the change is no greater than before.

For any file whose count grew, format only the changed factory body by hand. Never run `prettier --write` on a pre-existing failing file. If `prettier_delta` shows the file was clean before (`0 ->`), `npx prettier --write` on that file is allowed.

eslint must report no problem on lines this task changed (compare against `git diff -U0`).

- [ ] **Step 8: Commit**

```bash
git add $(git diff --name-only)
git status --short
git commit -m "feat(vue): infer component prop types from typed base factories (GAP-082)" -m "Factories return defineComponent(...) instead of ComponentOptions so inherited props reach the generated declarations. The 11 type-less props get type-only types (any for model/value props, string|null for size and variant, boolean|null for fluid) with no runtime change.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01PpFcC3BnfH1gFB1Gc1n7VS"
```

`git diff --name-only` lists only the files this task changed. Check `git status --short` before committing: there must be no untracked or unrelated files.

---

### Task 3: Readonly-accepting array props

**Files:**

- Modify: the factory files containing the 36 `type: Array,` props (in `packages/vue/src` and `packages/vue-core/src`).
- Modify: `packages/vue/src/table/base-table.ts` (`selection`) and `packages/vue/src/accordion/BaseAccordion.ts` (`value`) for the 2 union props.
- Modify: `packages/vue/src/tiered-menu/TieredMenuSub.vue`, `packages/vue/src/menubar/MenubarSub.vue`, `packages/vue/src/panel-menu/PanelMenuList.vue`, `packages/vue/src/galleria/GalleriaContent.vue`, `packages/vue/src/cascade-select/CascadeSelectSublist.vue` (6 SFC-local props).

**Interfaces:**

- Consumes: the Task 2 typed factories.
- Produces: every array prop's public type accepts `readonly unknown[]` (or a union containing it). Task 5 adds `| null` to some of them.

- [ ] **Step 1: Write and run the array transform**

`/tmp/claude-501/gap082-impl/arrays.py`:

```python
"""GAP-082 Task 3: readonly-accepting array props (type-only).
Usage: python3 arrays.py REPO_ROOT"""
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1]) / "packages"
counts = {"factory": 0, "union": 0, "sfc": 0}
UNIONS = {
    "vue/src/table/base-table.ts": ("type: [Object, Array],", "type: [Object, Array] as PropType<Record<string, any> | readonly unknown[]>,"),
    "vue/src/accordion/BaseAccordion.ts": ("type: [String, Number, Array],", "type: [String, Number, Array] as PropType<string | number | readonly unknown[]>,"),
}


def ensure_proptype_import(s):
    if re.search(r'import type \{[^}]*\bPropType\b[^}]*\} from "vue";', s):
        return s
    m = re.search(r'import type \{([^}]*)\} from "vue";', s)
    if m:
        return s.replace(m.group(0), "import type {" + m.group(1).rstrip() + ', PropType } from "vue";', 1)
    first_import = re.search(r"^import .*$", s, re.M)
    at = first_import.start() if first_import else 0
    return s[:at] + 'import type { PropType } from "vue";\n' + s[at:]


for f in sorted(list((root / "vue/src").rglob("*")) + list((root / "vue-core/src").rglob("*"))):
    if f.suffix not in (".ts", ".vue") or f.name.endswith((".spec.ts", ".stories.ts", ".d.ts")):
        continue
    s = f.read_text()
    orig = s
    rel = str(f.relative_to(root))
    if f.suffix == ".ts":
        counts["factory"] += s.count("type: Array,")
        s = s.replace("type: Array,", "type: Array as PropType<readonly unknown[]>,")
        if rel in UNIONS:
            a, b = UNIONS[rel]
            assert s.count(a) == 1, (rel, a)
            s = s.replace(a, b)
            counts["union"] += 1
        if s != orig:
            s = ensure_proptype_import(s)
    else:
        counts["sfc"] += s.count("type: Array,")
        s = s.replace("type: Array,", "type: /** @type {import('vue').PropType<readonly unknown[]>} */ (Array),")
    if s != orig:
        f.write_text(s)
print("treated:", counts)
```

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
python3 /tmp/claude-501/gap082-impl/arrays.py .
grep -rn "type: \[[^]]*Array[^]]*\]," packages/vue/src packages/vue-core/src --include='*.ts' | grep -v "spec\|stories"
```

Expected: `treated: {'factory': 36, 'union': 2, 'sfc': 6}`, and the grep prints nothing, because every remaining Array union carries a cast. If the counts differ, stop and report.

- [ ] **Step 2: Typecheck, build, test**

```bash
export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"
pnpm --filter @ultimate/vue-core typecheck && pnpm --filter @ultimate/vue typecheck
pnpm --filter "@ultimate/vue..." run build
pnpm --filter @ultimate/vue-core test && pnpm --filter @ultimate/vue test
grep -c "readonly unknown\[\]" packages/vue/dist/tiered-menu/TieredMenuSub.vue.d.mts
```

Expected: 0 typecheck errors; builds exit 0; `96 passed` and `898 passed`. The grep count is at least 1, showing the JSDoc cast reached the SFC declaration.

- [ ] **Step 3: Consumer check (expected: pass)**

```bash
node packages/vue/scripts/validate-consumer-types.mjs
```

Expected: exit 0, with `OK (bundler)` and `OK (nodenext)`.

- [ ] **Step 3b: Empty-props probe over all exported components (Spec §8 row 1)**

`/tmp/claude-501/gap082-impl/props_probe.py`:

```python
"""Type-level probe over the built @ultimate/vue: reports every exported SFC component
whose public $props has no component-specific keys. Usage: python3 props_probe.py REPO_ROOT"""
import os
import pathlib
import re
import subprocess
import sys

repo = pathlib.Path(sys.argv[1])
vue = repo / "packages/vue"
names = sorted(set(re.findall(r'default as (U[A-Za-z]+) \} from "\./[A-Za-z]+\.vue"',
                              "".join(p.read_text() for p in (vue / "src").glob("*/index.ts")))))
work = pathlib.Path("/tmp/claude-501/gap082-impl/props-probe")
work.mkdir(parents=True, exist_ok=True)
if not (work / "node_modules").exists():
    os.symlink(vue / "node_modules", work / "node_modules")
lines = [
    'import type { PublicProps } from "vue";',
    f'import type * as V from "{vue}/dist/index.mjs";',
    "type Own<C> = C extends abstract new (...args: any) => infer I",
    '  ? I extends { $props: infer P } ? Exclude<keyof P, keyof PublicProps | "class" | "style" | `on${string}`> : never',
    "  : never;",
    'type Probe<C> = [Own<C>] extends [never] ? "EMPTY" : "TYPED";',
]
lines += [f'export const {n}_probe: "TYPED" = null as unknown as Probe<typeof V.{n}>;' for n in names]
(work / "probe.ts").write_text("\n".join(lines) + "\n")
(work / "tsconfig.json").write_text('{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler",'
                                    '"strict":true,"noEmit":true,"skipLibCheck":true},"include":["probe.ts"]}\n')
out = subprocess.run([str(work / "node_modules/.bin/tsc"), "-p", "tsconfig.json"], cwd=work, capture_output=True, text=True).stdout
src = (work / "probe.ts").read_text().splitlines()
empty = sorted(re.search(r"export const (\w+)_probe", src[int(n) - 1]).group(1)
               for n in re.findall(r"^probe\.ts\((\d+),\d+\): error TS2322", out, re.M))
other = [l for l in out.splitlines() if "error TS" in l and "TS2322" not in l]
print(f"{len(names)} exported SFC components; {len(empty)} report no props: {', '.join(empty)}")
print("other errors:", other or "none")
```

```bash
export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"
python3 /tmp/claude-501/gap082-impl/props_probe.py /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
```

Expected:

- `104 exported SFC components; 16 report no props`, and the list is exactly: `UAccordionContent, UAccordionHeader, UAvatarGroup, UButtonGroup, UCard, UDeferredContent, UDynamicDialog, UIconField, UIftaLabel, UInputGroup, UInputGroupAddon, UInputIcon, UStepList, UStepPanels, UTabList, UTabPanels`;
- `other errors: none`.

These 16 declare no props in either their factory or their SFC. For any other name in the list, inspect it and fix the task. Record the output in the task report.

- [ ] **Step 4: Playground and runtime comparison**

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/apps/playground-vue && ../../packages/vue/node_modules/.bin/vue-tsc --noEmit -p tsconfig.json
cd /tmp/claude-501/gap082-impl/base/packages/vue && node runtime-compare.mjs /tmp/claude-501/gap082-impl/base /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
```

Expected:

- the playground type-checks with 0 errors, including `App.vue:44` (`UScroller :items` with a `readonly string[]`);
- runtime comparison shows `unexpected: 0` with the same allowed set as Task 2.

- [ ] **Step 5: Prettier and lint deltas**

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
python3 /tmp/claude-501/gap082-impl/prettier_delta.py HEAD $(git diff --name-only)
pnpm exec eslint $(git diff --name-only)
```

Expected: no file's prettier count grows (wrap long cast lines by hand if needed), and no eslint problem on changed lines. The JSDoc-cast style in the 5 SFCs must pass both tools.

- [ ] **Step 6: Commit**

```bash
git add $(git diff --name-only)
git status --short
git commit -m "feat(vue): accept readonly arrays in array prop types (GAP-082)" -m "Type-only PropType<readonly unknown[]> casts on 36 factory array props and 2 union props, and JSDoc casts on 6 SFC-local array props; runtime prop types unchanged.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01PpFcC3BnfH1gFB1Gc1n7VS"
```

---

### Task 4: Nullability classification (documentation only)

**Files:**

- Modify: `docs/architecture/research/2026-10-03-gap-082-typed-vue-props-research.md` (add §7).
- Scratch: `/tmp/claude-501/gap082-impl/null_candidates.py` and its TSV output; the PrimeVue tarball at `/tmp/claude-501/gap082-impl/pv`.

**Interfaces:**

- Consumes: the Spec §5.4 rule; Plan decisions D1 and D2.
- Scope (Spec Review Q1): every in-scope prop (about 222) gets an explicit classification:
  - `nullable`, with qualifying evidence; or
  - `non-nullable`, recorded as `no qualifying evidence`.

  The task classifies every prop; it does not make every `default: null` prop nullable. A result of "222 in scope, X nullable, 222−X non-nullable" is valid when the evidence supports it.

- Fixed decisions: the 11 type-less props are **not** re-decided here. Their Spec §5.2 decisions are fixed:
  - `modelValue`, `defaultValue`, `value`, `trueValue`, `falseValue` → `any`;
  - `size`, `variant` → `string | null`;
  - `fluid` → `boolean | null`.

  §7 documents them and their evidence, and no heuristic result can change them.

- Produces: research §7, a table with one row per in-scope prop. Columns: `#`, `prop`, `file:line`, `runtime declaration`, `classification` (`nullable` / `non-nullable`), `evidence`.
  - The evidence cites `N1 file:line …`, `N2 file:line …` or `N3 PrimeVue <component>.<prop>: <type> + Ultimate file:line …`, or reads `no qualifying evidence`.
  - The 11 type-less props appear with their Spec §5.2 decisions.
  - Task 5 applies every `nullable` row.

- [ ] **Step 1: Fetch the pinned PrimeVue declarations**

```bash
mkdir -p /tmp/claude-501/gap082-impl/pv && cd /tmp/claude-501/gap082-impl/pv && npm pack primevue@4.5.5 --silent && mkdir -p primevue && tar -xzf primevue-4.5.5.tgz -C primevue && ls primevue/package/button/index.d.ts
```

Expected: the path prints.

- [ ] **Step 2: Write and run the candidate lister**

`/tmp/claude-501/gap082-impl/null_candidates.py`:

```python
"""GAP-082 Task 4 helper: list every prop in the nullability scope with candidate
evidence hints. Hints are leads to verify by reading code, not decisions.
Usage: python3 null_candidates.py REPO_ROOT PRIMEVUE_PACKAGE_DIR OUT_TSV"""
import pathlib
import re
import sys

repo, pv, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3])
# The 11 type-less props: decisions fixed by Spec §5.2, never re-decided by heuristics.
FIXED = {
    ("packages/vue-core/src/base/base-editable-holder.ts", "modelValue"): "any (Spec §5.2)",
    ("packages/vue-core/src/base/base-editable-holder.ts", "defaultValue"): "any (Spec §5.2)",
    ("packages/vue-core/src/base/base-input.ts", "size"): "string | null (Spec §5.2)",
    ("packages/vue-core/src/base/base-input.ts", "variant"): "string | null (Spec §5.2)",
    ("packages/vue-core/src/base/base-input.ts", "fluid"): "boolean | null (Spec §5.2)",
    ("packages/vue/src/checkbox/BaseCheckbox.ts", "value"): "any (Spec §5.2)",
    ("packages/vue/src/checkbox/BaseCheckbox.ts", "trueValue"): "any (Spec §5.2)",
    ("packages/vue/src/checkbox/BaseCheckbox.ts", "falseValue"): "any (Spec §5.2)",
    ("packages/vue/src/radio-button/BaseRadioButton.ts", "value"): "any (Spec §5.2)",
    ("packages/vue/src/toggle-switch/BaseToggleSwitch.ts", "trueValue"): "any (Spec §5.2)",
    ("packages/vue/src/toggle-switch/BaseToggleSwitch.ts", "falseValue"): "any (Spec §5.2)",
}
PV_ALIAS = {"table": "datatable", "scroller": "virtualscroller"}


def kebab(name):
    return re.sub(r"([A-Z])", lambda m: "-" + m.group(1).lower(), name)


def prop_entries(text):
    for block in re.finditer(r"\n(\s+)props: \{\n(.*?)\n\1\},", text, re.S):
        indent = block.group(1) + "  "
        for m in re.finditer(rf"^{indent}(\w+): (\{{.*?\}}|\w+),?$", block.group(2), re.M | re.S):
            yield m.group(1), m.group(2).replace("\n", " "), block.start(2) + m.start()


def pv_decl(comp_dir, prop):
    f = pv / PV_ALIAS.get(comp_dir, comp_dir.replace("-", "")) / "index.d.ts"
    if not f.is_file():
        return ""
    m = re.search(rf"^\s{{4}}{prop}\?:\s*([^;]+);", f.read_text(), re.M)
    return re.sub(r"\s+", " ", m.group(1)) if m else ""


usage_files = [p for p in (repo / "packages/vue/src").rglob("*") if p.name.endswith((".spec.ts", ".stories.ts"))]
usage_files += list((repo / "apps/playground-vue/src").rglob("*.vue"))
usage_text = {p: p.read_text() for p in usage_files}

rows = []
for base in (repo / "packages/vue/src", repo / "packages/vue-core/src"):
    for f in sorted(base.rglob("*")):
        if f.suffix not in (".ts", ".vue") or f.name.endswith((".spec.ts", ".stories.ts", ".d.ts")):
            continue
        text = f.read_text()
        rel = f.relative_to(repo)
        comp_dir = rel.parts[3] if rel.parts[1] == "vue" else "(vue-core)"
        for prop, decl, offset in prop_entries(text):
            fixed = FIXED.get((str(rel), prop), "")
            in_scope = fixed or ("default: null" in decl) or re.search(r"\bArray\b", decl)
            if not in_scope:
                continue
            line = text.count("\n", 0, offset) + 1
            siblings = [p for p in f.parent.iterdir() if p.suffix in (".ts", ".vue") and not p.name.endswith((".spec.ts", ".stories.ts"))]
            n1 = []
            for s in siblings:
                for m in re.finditer(rf"\b{prop}\b\s*(\?\?|\?\.|===\s*null|==\s*null|!==\s*null|!=\s*null)", s.read_text()):
                    n1.append(f"{s.name}:{m.group(1).replace(' ', '')}")
            n2 = sorted({p.name for p, t in usage_text.items() if (p.parent == f.parent or "playground-vue" in str(p)) and re.search(rf"(\b{prop}:\s*null\b|:{kebab(prop)}=\"null\")", t)})
            rows.append([str(rel), str(line), comp_dir, prop, fixed, decl[:90], ",".join(sorted(set(n1)))[:160], ",".join(n2)[:160], pv_decl(comp_dir, prop)[:110]])

header = ["file", "line", "component_dir", "prop", "fixed_decision", "declaration", "N1_hints", "N2_hints", "PrimeVue_4.5.5_decl"]
out.write_text("\t".join(header) + "\n" + "\n".join("\t".join(r) for r in rows) + "\n")
print(f"{len(rows)} props in scope -> {out}")
print("fixed (Spec §5.2):", sum(1 for r in rows if r[4]), "| N1 hints:", sum(1 for r in rows if r[6]), "| N2 hints:", sum(1 for r in rows if r[7]), "| PrimeVue decl includes null:", sum(1 for r in rows if "null" in r[8]))
```

```bash
python3 /tmp/claude-501/gap082-impl/null_candidates.py /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate /tmp/claude-501/gap082-impl/pv/primevue/package /tmp/claude-501/gap082-impl/null_candidates.tsv
```

Expected: about 222 props in scope (the pre-implementation measurement was 222), with `fixed (Spec §5.2): 11` and the hint counts. Every one of the 11 rows has a non-empty `fixed_decision`.

- [ ] **Step 3: Classify every row by reading the code**

Every row with a non-empty `fixed_decision` keeps that decision. Record it in §7 with its evidence; do not re-classify it.

For every other row, decide `nullable` or `non-nullable` using Spec §5.4 with D1 and D2:

1. **Hints are leads.** Open the cited lines and confirm the handling is about this prop. A hint can match a same-named local variable or a different component's prop.
2. **No hint is not proof of absence.** Also check the component's `.vue`/`.ts` for uses through a computed or method, and check the base factory's consumers in the same directory.
3. **N2:** confirm the `null` is intended usage, not a test asserting that `null` is rejected.
4. **N3:** needs PrimeVue `null` AND concrete Ultimate evidence per corrected D2. Cite both. A truthiness check (`if (x)`, `x || y`, `x ? a : b`) never qualifies, under N1 or under N3.
5. **The 11 fixed rows:**
   - `modelValue`, `defaultValue`, `value`, `trueValue`, `falseValue` → classification `any (Spec §5.2)`. Evidence: these hold arbitrary model values, and `PropType<unknown>` collapses in Vue's inference.
   - `size`, `variant` → `nullable (string | null, Spec §5.2)`; `fluid` → `nullable (boolean | null, Spec §5.2)`. Cite the `base-input.ts` lines as supporting evidence (`variant ?? null`, `fluid ?? pcFluid`, and how `size` reaches the style params). The classification stands on Spec §5.2 regardless of what the helper reports.
6. **Default:** with no qualifying evidence, the row is `non-nullable — no qualifying evidence`.

- [ ] **Step 4: Write research §7**

Append to the research file:

```markdown
## 7. Nullability classification (GAP-082 Task 4)

Rule: Spec §5.4 (ADR-049) with Plan decisions D1 (N1 = null-specific handling) and D2 (N3 = PrimeVue 4.5.5 declares `null` AND concrete Ultimate evidence that `null` is intentionally accepted). Generic truthiness never qualifies, and `default: null` alone is never evidence. The 11 type-less props carry their fixed Spec §5.2 decisions.

Totals: <N> props in scope; 11 fixed by Spec §5.2 (5 `any`, 3 nullable); <a> classified nullable (N1 <x>, N2 <y>, N3 <z>); <b> non-nullable (no qualifying evidence).

| #   | Prop               | File:line                                 | Runtime declaration                                  | Classification | Evidence                                                                                                      |
| --- | ------------------ | ----------------------------------------- | ---------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | `UTable.selection` | `packages/vue/src/table/base-table.ts:19` | `[Object, Array] as PropType<…>, default: undefined` | nullable       | N1 `Table.vue:<line>` (`selection == null`); N3 PrimeVue `datatable.selection: T[] \| T \| undefined \| null` |
```

Replace the totals placeholders with the real counts, and make the example row match what the code actually shows. Then write one row per in-scope prop. Run `npx prettier --check` on the research file. If it fails only because of this new section, format the file with `npx prettier --write`; the file was prettier-clean before this task, so this is allowed.

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/research/2026-10-03-gap-082-typed-vue-props-research.md
git commit -m "docs(gap-082): record nullability classification for Vue props" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01PpFcC3BnfH1gFB1Gc1n7VS"
```

---

### Task 5: Apply nullable typing

**Files:**

- Modify: each file containing a prop that research §7 classifies `nullable`, excluding the 11 type-less props, which Task 2 already typed.
- Modify: `packages/vue/test/consumer-types/ValidUsage.vue`, `packages/vue/test/consumer-types/InvalidUsage.vue`.

**Interfaces:**

- Consumes: research §7 (Task 4); the array casts from Task 3.
- Produces: each nullable prop's public type becomes its existing public type plus `| null`, and its runtime `type` constructor is unchanged.

- [ ] **Step 1: Read each nullable prop's existing public type**

Never derive a type from the runtime constructor (e.g. do not map `Object` → `Record<string, any>` mechanically). Read the type the built declarations already expose, and add `| null` to it.

Write `/tmp/claude-501/gap082-impl/print_prop_types.py`:

```python
"""Print the current public (consumer-facing) type of each Component.prop from the
built @ultimate/vue declarations, without `undefined`. Usage:
  python3 print_prop_types.py REPO_ROOT UTable.selection UButton.label ..."""
import os
import pathlib
import re
import subprocess
import sys

repo = pathlib.Path(sys.argv[1])
pairs = sys.argv[2:]
vue = repo / "packages/vue"
work = pathlib.Path("/tmp/claude-501/gap082-impl/prop-types")
work.mkdir(parents=True, exist_ok=True)
if not (work / "node_modules").exists():
    os.symlink(vue / "node_modules", work / "node_modules")
lines = [
    f'import type * as V from "{vue}/dist/index.mjs";',
    "type P<C> = C extends abstract new (...args: any) => infer I ? (I extends { $props: infer Q } ? Q : never) : never;",
    "type Show<T> = { readonly show: T };",
    "declare const probe: unique symbol;",
]
for i, pair in enumerate(pairs):
    comp, prop = pair.split(".")
    lines.append(f'export const p{i}: Show<Exclude<P<typeof V.{comp}>["{prop}"], undefined>> = 0 as unknown as typeof probe;')
(work / "probe.ts").write_text("\n".join(lines) + "\n")
(work / "tsconfig.json").write_text('{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler",'
                                    '"strict":true,"noEmit":true,"skipLibCheck":true,"noErrorTruncation":true},"include":["probe.ts"]}\n')
out = subprocess.run([str(work / "node_modules/.bin/tsc"), "-p", "tsconfig.json"], cwd=work, capture_output=True, text=True).stdout
found = {}
for line in out.splitlines():
    m = re.match(r"probe\.ts\((\d+),\d+\): error TS\d+: (.*)", line)
    if not m:
        continue
    idx = int(m.group(1)) - 5
    t = re.search(r"to type 'Show<(.*)>'", m.group(2))
    found[idx] = t.group(1) if t else "ERROR: " + m.group(2)[:160]
for i, pair in enumerate(pairs):
    print(f"{pair}: {found.get(i, 'ERROR: no output (prop or component not found?)')}")
```

Build first (`pnpm --filter "@ultimate/vue..." run build`). Then pass one exported component that exposes each `nullable` row's prop (`UComponent.prop`):

```bash
python3 /tmp/claude-501/gap082-impl/print_prop_types.py /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate UTable.selection UButton.label
```

Pre-implementation reference output on the typed spike: `UTable.selection: Record<string, any> | readonly unknown[]` and `UButton.label: string`. Any `ERROR:` line means the component or prop name is wrong; fix the pair.

- [ ] **Step 1b: Apply the casts row by row**

For each `nullable` row, take the printed existing type `E` and change only the declaration's `type:` value to a type-only cast of `E | null`. The runtime constructor, `default` and `required` stay as they are.

| Current declaration (printed type `E`)                                          | New declaration                                                                            |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `type: String, default: null` (`E` = `string`)                                  | `type: String as PropType<string \| null>, default: null`                                  |
| `type: [String, Object], default: null` (`E` = `string \| Record<string, any>`) | `type: [String, Object] as PropType<string \| Record<string, any> \| null>, default: null` |
| `type: Array as PropType<readonly unknown[]>, …` (`E` = `readonly unknown[]`)   | `type: Array as PropType<readonly unknown[] \| null>, …`                                   |
| `type: X as PropType<E>, …` (already cast)                                      | `type: X as PropType<E \| null>, …`                                                        |
| SFC-local `type: String, default: null` in a `.vue` `<script>` (`E` = `string`) | `type: /** @type {import('vue').PropType<string \| null>} */ (String), default: null`      |

The table shows the form. The type always comes from the printer, never from this table. Add the `PropType` type import where a `.ts` file lacks it.

After rebuilding, re-run the printer for every changed prop. Each must print exactly `E | null`, with the same non-null members as before. Record the before and after lines in the task report.

- [ ] **Step 2: Extend the fixtures with null usage**

In `ValidUsage.vue`, add before `</template>`:

- `<UInputText :size="null" :variant="null" :fluid="null" />`;
- one line passing `null` to at least three other props classified `nullable` in research §7. Include one array prop if any array prop is nullable, and one scalar from the `default: null` set. Import their components from their subpaths.

In `InvalidUsage.vue`, add before `</template>` one marker pair for a prop classified `non-nullable — no qualifying evidence`:

```vue
<!-- @vue-expect-error <Component>.<prop> is non-nullable (research §7 row <n>) -->
<UComponent :prop="null" />
```

Fill `<Component>.<prop>` and the row number from §7, and add the import.

- [ ] **Step 3: Verify**

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"
pnpm --filter @ultimate/vue-core typecheck && pnpm --filter @ultimate/vue typecheck
pnpm --filter "@ultimate/vue..." run build
pnpm --filter @ultimate/vue-core test && pnpm --filter @ultimate/vue test
node packages/vue/scripts/validate-consumer-types.mjs
cd apps/playground-vue && ../../packages/vue/node_modules/.bin/vue-tsc --noEmit -p tsconfig.json
cd /tmp/claude-501/gap082-impl/base/packages/vue && node runtime-compare.mjs /tmp/claude-501/gap082-impl/base /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
```

Expected:

- 0 typecheck errors; builds exit 0; `96 passed` and `898 passed`;
- the consumer check exits 0 in both modes;
- the playground has 0 errors;
- runtime comparison shows `unexpected: 0` with only the Task 2 allowed set.

- [ ] **Step 4: Cross-check classification against code**

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
grep -rn "| null>" packages/vue/src packages/vue-core/src | grep -v "spec\|stories" | wc -l
```

Expected: the count equals the number of `nullable` rows in research §7 that are not among the 11 type-less props, plus 3 (`size`, `variant`, `fluid` from Task 2). If it differs, reconcile the code or the table before committing.

- [ ] **Step 5: Prettier and lint deltas, then commit**

```bash
python3 /tmp/claude-501/gap082-impl/prettier_delta.py HEAD $(git diff --name-only)
pnpm exec eslint $(git diff --name-only)
git add $(git diff --name-only)
git status --short
git commit -m "feat(vue): type contract-nullable props as T | null (GAP-082)" -m "Applies the research §7 classification with type-only PropType/JSDoc casts; runtime prop types unchanged. Fixtures pin null acceptance and one non-nullable rejection.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01PpFcC3BnfH1gFB1Gc1n7VS"
```

Expected before committing: no prettier count grows, and no eslint problem on changed lines.

---

### Task 6: CI wiring, MIGRATION note, cost record

**Files:**

- Modify: `packages/vue/package.json` (add a `validate` script).
- Modify: `docs/architecture/MIGRATION.md` (§8).
- Modify: `docs/architecture/research/2026-10-03-gap-082-typed-vue-props-research.md` (§5: add measured final values).

**Interfaces:**

- Consumes: Tasks 1–5.
- Produces: `pnpm --filter @ultimate/vue run validate` runs the consumer check. CI's "Validate generated artifacts" step (after "Build") picks it up through the root `validate` script.

- [ ] **Step 1: Wire the check into the package `validate` script**

In `packages/vue/package.json` `scripts`, add after `"typecheck": "vue-tsc --noEmit",`:

```json
    "validate": "node scripts/validate-consumer-types.mjs",
```

Then confirm the CI wiring needs no workflow change:

```bash
grep -n "run: pnpm run build\|run: pnpm run validate" .github/workflows/ci.yml
node -e 'console.log(require("./package.json").scripts.validate)'
```

Expected:

- `pnpm run build` appears on an earlier line than `pnpm run validate` in the `ci` job;
- the root `validate` prints `pnpm -r --if-present run validate`.

- [ ] **Step 2: Run the package validate script**

```bash
export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"
pnpm --filter "@ultimate/vue..." run build
pnpm --filter @ultimate/vue run validate
```

Expected: `OK (bundler)` and `OK (nodenext)`, exit 0.

- [ ] **Step 3: Measure and record costs**

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
find packages/vue/dist -name '*.d.mts' -exec cat {} + | wc -c
wc -c < packages/vue-core/dist/index.d.mts
node -e 'console.log(require("zlib").gzipSync(require("fs").readFileSync("packages/vue/dist/index.mjs")).length)'
mkdir -p /tmp/claude-501/gap082-impl/pack && cd packages/vue && pnpm pack --pack-destination /tmp/claude-501/gap082-impl/pack && ls -l /tmp/claude-501/gap082-impl/pack
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate && node packages/vue/scripts/validate-consumer-types.mjs --diagnostics
pnpm run size:measure
```

In research §5, add a row group "Final (after Tasks 1–5)" with the measured values:

- declaration bytes;
- vue-core `index.d.mts` bytes;
- barrel gzip;
- tarball size;
- `Check time` / `Memory used` per mode.

Add one sentence: "`size:validate` compares against `origin/main`; this repository has no remote, so it is externally unexercisable locally — `size:measure` and the barrel gzip above stand in." Keep the existing pre-implementation rows.

- [ ] **Step 4: MIGRATION §8 note**

Append at the end of `docs/architecture/MIGRATION.md` §8 (after the last follow-up-phase bullet):

```markdown
Added on `feature/gap-082-typed-vue-props` (2026-10-03), same status — unreleased, no changesets:

- **`@ultimate/vue` — component props are typed in the shipped declarations.** Every exported component's declaration now carries its real prop types, so passing a wrong prop value type (e.g. `<UButton :label="123" />`) is a TypeScript error. Array props accept mutable and readonly arrays. A prop accepts `null` only where `null` is part of its contract (ADR-049). Runtime behavior is unchanged. Consumer code that previously compiled with wrongly typed props must be corrected. (GAP-082.)
- **`@ultimate/vue`, `@ultimate/vue-core` — `createBase*` factory return types.** The exported base factories now return their inferred component types instead of `ComponentOptions`. Using a factory result as a `ComponentOptions` value (annotation, parameter or spread) is now a TypeScript error; `extends: createBaseX()` is unaffected. (GAP-082.)
```

- [ ] **Step 5: Final checks**

```bash
python3 /tmp/claude-501/gap082-impl/prettier_delta.py HEAD packages/vue/package.json docs/architecture/MIGRATION.md docs/architecture/research/2026-10-03-gap-082-typed-vue-props-research.md
pnpm --filter @ultimate/vue test && pnpm --filter @ultimate/vue-core test
node scripts/provenance/pack-install-integrity.mjs @ultimate/vue
pnpm run agents-md-pointers:validate
```

Expected:

- no prettier count grows;
- tests `898 passed` and `96 passed`;
- pack/install integrity OK for `@ultimate/vue`;
- pointers OK.

- [ ] **Step 6: Commit**

```bash
git add packages/vue/package.json docs/architecture/MIGRATION.md docs/architecture/research/2026-10-03-gap-082-typed-vue-props-research.md
git status --short
git commit -m "ci(vue): enforce the GAP-082 consumer type-check and record costs" -m "packages/vue validate runs the packed-package consumer type-check (Bundler and NodeNext, skipLibCheck false, positive and negative fixtures), which CI's Validate generated artifacts step already runs after Build. MIGRATION §8 records typed props and the createBase* return-type change; research §5 records final size and type-check costs.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01PpFcC3BnfH1gFB1Gc1n7VS"
```
