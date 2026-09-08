import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// __dirname does not exist in ESM (this package is "type": "module",
// Task 1) — resolve the package root the ESM-safe way, once, from this
// test file's own location. No CommonJS interop.
const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = join(PACKAGE_ROOT, "..", "..");
const COMPONENT_METADATA_ROOT = join(REPO_ROOT, "packages", "component-metadata");
const COMPONENT_SCHEMA_ROOT = join(REPO_ROOT, "packages", "component-schema");

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

  // `npm pack` leaves `@ultimate/ai`'s `workspace:*` dependency specifiers
  // (on `@ultimate/component-metadata` / `@ultimate/component-schema`)
  // untouched in the packed package.json — that protocol is pnpm-specific
  // and only `pnpm pack`/`pnpm publish` rewrite it to a real version. A
  // plain `npm install` of an `npm pack`-produced tarball therefore fails
  // immediately with EUNSUPPORTEDPROTOCOL, before ever reaching this
  // package's own files. `pnpm pack` rewrites `workspace:*` to the real
  // pinned version (`0.1.0`), so this test uses `pnpm pack`/`pnpm install`
  // for the install leg (test 1 above stays on plain `npm pack`, which
  // already passes and needs no pnpm dependency to just list a tarball's
  // contents).
  //
  // That still leaves the rewritten `0.1.0` specifiers pointing at real
  // packages that have never been published to any registry (they're
  // workspace-only). So this scratch consumer is not a bare `pnpm install
  // <tarball>` of `@ultimate/ai` alone: it also packs
  // `component-metadata`/`component-schema` into their own tarballs and
  // wires them into the consumer via `pnpm.overrides` pointing at those
  // tarball paths (a `file:` override, not a `pnpm-workspace.yaml`
  // membership) so pnpm's resolver is satisfied entirely from local
  // tarballs and never needs to reach a registry for any `@ultimate/*`
  // package. The consumer directory has no `pnpm-workspace.yaml` of its
  // own and is not part of this repo's workspace — it is a genuinely
  // standalone install of three real packed tarballs.
  it("installing the packed tarball into a scratch consumer resolves all 5 files at node_modules/@ultimate/ai/dist/context/", () => {
    const packDir = mkdtempSync(join(tmpdir(), "ultimate-ai-pack-"));
    const consumerDir = mkdtempSync(join(tmpdir(), "ultimate-ai-consumer-"));
    try {
      // `pnpm pack` (unlike `npm pack`) has no `--json` flag in this pnpm
      // version — it prints the absolute tarball path as plain stdout text.
      const packOne = (cwd: string): string => {
        const packOutput = execSync("pnpm pack --pack-destination " + JSON.stringify(packDir), {
          cwd,
          encoding: "utf8",
        });
        return packOutput.trim();
      };

      const schemaTarball = packOne(COMPONENT_SCHEMA_ROOT);
      const metadataTarball = packOne(COMPONENT_METADATA_ROOT);
      const aiTarball = packOne(PACKAGE_ROOT);

      writeFileSync(
        join(consumerDir, "package.json"),
        JSON.stringify(
          {
            name: "scratch-consumer",
            version: "1.0.0",
            private: true,
            dependencies: {
              "@ultimate/ai": `file:${aiTarball}`,
            },
            pnpm: {
              overrides: {
                "@ultimate/component-metadata": `file:${metadataTarball}`,
                "@ultimate/component-schema": `file:${schemaTarball}`,
              },
            },
          },
          null,
          2
        )
      );

      execSync("pnpm install --no-lockfile", { cwd: consumerDir, stdio: "ignore" });

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
  }, 90_000);
});
