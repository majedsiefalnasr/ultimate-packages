import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

// `__dirname` is available in this package's Vitest setup even though the
// package is `"type": "module"`: packages/vue/test/exports.test.ts:25-43
// already uses it and passes. Keep the same mechanism here.
const SCRIPT = join(__dirname, "..", "scripts", "rename-dts.mjs");

/** Writes `files` under <tmp>/dist, runs the script with cwd=<tmp>, returns the result. */
function run(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "vue-rename-dts-"));
  for (const [rel, content] of Object.entries(files)) {
    const path = join(root, "dist", rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  const result = spawnSync(process.execPath, [SCRIPT], { cwd: root, encoding: "utf8" });
  return {
    status: result.status,
    stderr: result.stderr,
    read: (rel: string) => readFileSync(join(root, "dist", rel), "utf8"),
  };
}

describe("packages/vue/scripts/rename-dts.mjs (GAP-079)", () => {
  it("renames .d.ts to .d.mts and rewrites an extensionless sibling specifier to .mjs", () => {
    const r = run({
      "button/index.d.ts": `export { createBaseButton } from "./base-button";\n`,
      "button/base-button.d.ts": `export declare const createBaseButton: 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("button/index.d.mts")).toContain(`from "./base-button.mjs"`);
  });

  it("rewrites a directory specifier to its index.mjs", () => {
    const r = run({
      "index.d.ts": `export * from "./button";\n`,
      "button/index.d.ts": `export declare const x: 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("index.d.mts")).toContain(`from "./button/index.mjs"`);
  });

  it("rewrites a .vue specifier to the emitted SFC declaration", () => {
    const r = run({
      "button/index.d.ts": `export { default as UButton } from "./Button.vue";\n`,
      "button/Button.vue.d.ts": `declare const _default: 1;\nexport default _default;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("button/index.d.mts")).toContain(`from "./Button.vue.mjs"`);
  });

  it("rewrites parent-directory and dynamic import() specifiers", () => {
    const r = run({
      "button/index.d.ts": `export type T = import("../shared").S;\n`,
      "shared.d.ts": `export type S = 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("button/index.d.mts")).toContain(`import("../shared.mjs")`);
  });

  it("leaves bare package specifiers untouched", () => {
    const r = run({
      "index.d.ts": `import type { App } from "vue";\nexport type { App };\nexport * from "@ultimate/vue-core";\n`,
    });
    expect(r.status).toBe(0);
    const out = r.read("index.d.mts");
    expect(out).toContain(`from "vue"`);
    expect(out).toContain(`from "@ultimate/vue-core"`);
  });

  it("fails the build when a relative specifier resolves to no declaration", () => {
    const r = run({ "index.d.ts": `export * from "./missing";\n` });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain(`"./missing"`);
  });

  // Regression: the previous script rewrote `from "./x.js"` to `from "./x.mjs"`
  // (tsup's DTS rollup emitted `.js` cross-entry specifiers). That behavior
  // must be kept, not skipped just because `.js` is an extension.
  it("keeps rewriting a relative .js specifier to .mjs (from form)", () => {
    const r = run({
      "index.d.ts": `export { UButton } from "./button/index.js";\n`,
      "button/index.d.ts": `export declare const UButton: 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("index.d.mts")).toContain(`from "./button/index.mjs"`);
  });

  it("rewrites a relative .js specifier in import() form too", () => {
    const r = run({
      "index.d.ts": `export type T = import("./shared.js").S;\n`,
      "shared.d.ts": `export type S = 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("index.d.mts")).toContain(`import("./shared.mjs")`);
  });

  it("fails the build for a relative .js specifier with no matching declaration", () => {
    const r = run({ "index.d.ts": `export * from "./gone.js";\n` });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain(`"./gone.js"`);
  });

  it("leaves a relative .mjs specifier that already resolves unchanged", () => {
    const r = run({
      "index.d.ts": `export * from "./button/index.mjs";\n`,
      "button/index.d.ts": `export declare const x: 1;\n`,
    });
    expect(r.status).toBe(0);
    expect(r.read("index.d.mts")).toContain(`from "./button/index.mjs"`);
  });
});
