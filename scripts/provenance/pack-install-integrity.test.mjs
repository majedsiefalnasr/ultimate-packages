// scripts/provenance/pack-install-integrity.test.mjs
//
// Tests for pack-install-integrity.mjs's generalized R8 pack/install
// verification. Most of these are real, non-mocked pnpm pack/install runs
// against this repo's actual packages — R8's own spec requires the
// mechanism itself to be proven with real subprocess/filesystem behavior,
// not a simulated approximation of it (the same discipline the Phase 9
// precedent, packages/ai/test/packaging.test.ts, already established).

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  topologicalSort,
  assertInstalledPackageMatchesManifest,
  runPackInstallIntegrity,
} from "./pack-install-integrity.mjs";

// --- topologicalSort (pure, no I/O) -------------------------------------

test("topologicalSort orders dependencies before dependents", () => {
  const members = ["b", "a", "c"];
  const deps = { a: [], b: ["a"], c: ["b"] };
  const sorted = topologicalSort(members, (m) => deps[m]);
  assert.deepEqual(sorted, ["a", "b", "c"]);
});

test("topologicalSort throws on a cycle", () => {
  const members = ["a", "b"];
  const deps = { a: ["b"], b: ["a"] };
  assert.throws(() => topologicalSort(members, (m) => deps[m]), /cycle detected/);
});

// --- Real run #1 (required verification case): @ultimate/ai, the
// smallest real closure (2 workspace:* dependencies) ---------------------
//
// Cross-checked against the Phase 9 precedent's own empirically-measured
// runtime (~6.89s for its 2-tarball pack+install cycle, recorded in the
// approved spec) — this generalized script covering the equivalent case
// should land in the same order of magnitude, not materially more work for
// an equivalent-sized closure.

test(
  "real run: @ultimate/ai + its 2-member closure packs, installs, and verifies (smallest real closure)",
  () => {
    const startedAt = Date.now();
    const result = runPackInstallIntegrity("ai");
    const elapsedMs = Date.now() - startedAt;

    assert.equal(result.targetName, "@ultimate/ai");
    assert.deepEqual([...result.closureMembers].sort(), [
      "@ultimate/component-metadata",
      "@ultimate/component-schema",
    ]);
    assert.ok(
      result.checkedPaths.length > 0,
      "must have derived at least one real path from @ultimate/ai's own package.json to check"
    );
    assert.ok(
      elapsedMs < 30_000,
      `expected roughly the same order of magnitude as the Phase 9 precedent's ~6.89s for an equivalent 2-dependency closure, took ${(elapsedMs / 1000).toFixed(2)}s`
    );
  },
  { timeout: 60_000 }
);

// --- Real run #2 (required verification case): @ultimate/ng, one of the
// two largest real closures (7 workspace:* dependencies, including the
// real ng -> themes devDependency-only cross-edge) -----------------------

test(
  "real run: @ultimate/ng + its 7-member closure packs, installs, and verifies (largest real closure, cross-edge included)",
  () => {
    const result = runPackInstallIntegrity("ng");

    assert.equal(result.targetName, "@ultimate/ng");
    assert.deepEqual([...result.closureMembers].sort(), [
      "@ultimate/ng-core",
      "@ultimate/themes",
      "@ultimate/uix-data",
      "@ultimate/uix-motion",
      "@ultimate/uix-styled",
      "@ultimate/uix-styles",
      "@ultimate/uix-utils",
    ]);
    // Genuinely discriminating ordering checks (not "ng-core sorts before
    // ng-plus-one", which is true for almost any ordering since ng is
    // always last): ng-core is a direct dependency of ng and must sort
    // strictly before it; uix-utils is a transitive dependency of every
    // other member here and must sort before all of them.
    const index = (name) => result.sortedMembers.indexOf(name);
    assert.ok(
      index("@ultimate/ng-core") < index("@ultimate/ng"),
      "@ultimate/ng-core (a direct dependency of @ultimate/ng) must be packed strictly before @ultimate/ng itself"
    );
    for (const dependent of [
      "@ultimate/ng-core",
      "@ultimate/uix-styled",
      "@ultimate/uix-motion",
      "@ultimate/uix-data",
      "@ultimate/ng",
    ]) {
      assert.ok(
        index("@ultimate/uix-utils") < index(dependent),
        `@ultimate/uix-utils (a transitive dependency of every other member here) must be packed before ${dependent}`
      );
    }
  },
  { timeout: 60_000 }
);

// --- Pack/install failure negative test (explicitly required by the
// task brief) -------------------------------------------------------------
//
// Builds a genuinely broken scratch fixture package — package.json
// declares an `exports` entry pointing at a file that does not actually
// exist in the package's own dist/ output — packs it for real, installs it
// for real into a scratch consumer, and confirms
// assertInstalledPackageMatchesManifest correctly detects the missing file
// rather than passing vacuously. This is the one test in this file that
// does not target a real packages/* member, since it needs a deliberately
// malformed manifest no real package in this repo has.

test(
  "real run against a synthetic broken-manifest fixture: exports references a file the package does not actually ship, and the check correctly fails",
  () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), "ultimate-pack-install-broken-fixture-"));
    const packDestDir = mkdtempSync(join(tmpdir(), "ultimate-pack-install-broken-pack-"));
    const consumerDir = mkdtempSync(join(tmpdir(), "ultimate-pack-install-broken-consumer-"));

    try {
      mkdirSync(join(fixtureRoot, "dist"), { recursive: true });
      // Only index.mjs is actually written; missing.mjs is declared but
      // never created — the exact "broken packaging" shape the negative
      // test needs.
      writeFileSync(join(fixtureRoot, "dist", "index.mjs"), "export default {};\n");
      writeFileSync(
        join(fixtureRoot, "package.json"),
        JSON.stringify(
          {
            name: "@ultimate/broken-fixture",
            version: "1.0.0",
            license: "MIT",
            type: "module",
            // Pinned to match this repo's own packageManager field
            // (root package.json). Without this, corepack resolves
            // whichever pnpm happens to be globally installed outside the
            // repo's own directory tree, and different pnpm major
            // versions format `pnpm pack --pack-destination`'s stdout
            // differently (9.6.0 prints only the plain tarball path;
            // 10.x prints a multi-line human-readable banner) — a real
            // discrepancy found while writing this fixture, since the
            // production script's packOne() assumes the plain-path form
            // (matching every real invocation, which always runs from
            // inside a real packages/* directory that inherits this same
            // pin).
            packageManager: "pnpm@9.6.0",
            main: "./dist/index.mjs",
            exports: {
              ".": "./dist/index.mjs",
              "./missing": "./dist/missing.mjs",
            },
            files: ["dist"],
          },
          null,
          2
        )
      );

      const tarballPath = execFileSync("pnpm", ["pack", "--pack-destination", packDestDir], {
        cwd: fixtureRoot,
        encoding: "utf8",
      }).trim();

      writeFileSync(
        join(consumerDir, "package.json"),
        JSON.stringify(
          {
            name: "scratch-broken-fixture-consumer",
            version: "1.0.0",
            private: true,
            dependencies: { "@ultimate/broken-fixture": `file:${tarballPath}` },
          },
          null,
          2
        )
      );
      execFileSync("pnpm", ["install", "--no-lockfile"], { cwd: consumerDir, stdio: "ignore" });

      const installedPkgDir = join(consumerDir, "node_modules", "@ultimate", "broken-fixture");
      const targetPkgJsonPath = join(fixtureRoot, "package.json");

      assert.throws(
        () => assertInstalledPackageMatchesManifest(installedPkgDir, targetPkgJsonPath),
        /missing 1 path\(s\).*dist\/missing\.mjs/s,
        "must fail closed when a manifest-declared export does not actually exist in the installed tree"
      );
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
      rmSync(packDestDir, { recursive: true, force: true });
      rmSync(consumerDir, { recursive: true, force: true });
    }
  },
  { timeout: 30_000 }
);
