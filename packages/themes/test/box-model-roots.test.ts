// GAP-098 (ADR-063, Spec §4.1 / Amendment A1): every Angular, Vue and React
// component style module must yield at least one `u-` scope root, so the
// per-component box-model rule covers it. Fail-closed guard against future
// style modules without a root/overlay/panel/mask key.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { scopeRootsOf } from "@ultimate/uix-styled";

const BODY_CLASSES = ["u-scroll-panel-bar-grabbed", "p-overflow-hidden", "u-overflow-hidden"];

const MODULES = {
  ng: import.meta.glob<Record<string, unknown>>("../../ng/src/*/*-style.ts", { eager: true }),
  vue: import.meta.glob<Record<string, unknown>>("../../vue/src/*/*-style.ts", { eager: true }),
  react: import.meta.glob<Record<string, unknown>>("../../react/src/*/*-style.ts", { eager: true }),
};

function styleFilesOnDisk(framework: string): string[] {
  const src = join(__dirname, "..", "..", framework, "src");
  return readdirSync(src, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .flatMap((dir) =>
      readdirSync(join(src, dir.name))
        .filter((name) => name.endsWith("-style.ts"))
        .map((name) => `../../${framework}/src/${dir.name}/${name}`)
    )
    .sort();
}

function styleObjects(module: Record<string, unknown>) {
  return Object.entries(module).filter(
    ([, value]) =>
      value !== null &&
      typeof value === "object" &&
      "css" in value &&
      "classes" in value &&
      typeof (value as { classes: unknown }).classes === "object"
  ) as [string, { classes: Record<string, unknown> }][];
}

function assertRoots(label: string, classes: Record<string, unknown>) {
  const roots = scopeRootsOf(classes);
  expect(roots.length, `${label} yields no u- scope root`).toBeGreaterThan(0);
  for (const root of roots) {
    expect(root, label).toMatch(/^u-/);
    expect(BODY_CLASSES, `${label} root ${root} is a class added to <body>`).not.toContain(root);
  }
}

describe("GAP-098 box-model scope roots", () => {
  for (const [framework, modules] of Object.entries(MODULES)) {
    describe(framework, () => {
      it("globs every *-style.ts file on disk (non-vacuous)", () => {
        const globbed = Object.keys(modules).sort();
        expect(globbed.length).toBeGreaterThan(0);
        expect(globbed).toEqual(styleFilesOnDisk(framework));
      });

      it("every style file exports a style object, and every style object yields u- roots", () => {
        for (const [path, module] of Object.entries(modules)) {
          const objects = styleObjects(module);
          expect(objects.length, `${path} exports no { css, classes } object`).toBeGreaterThan(0);
          for (const [name, value] of objects) assertRoots(`${path}#${name}`, value.classes);
        }
      });
    });
  }

  it("rejects a style object without a scope key (proof the guard can fail)", () => {
    expect(() => assertRoots("fixture", { header: "u-fixture-header" })).toThrow();
  });
});
