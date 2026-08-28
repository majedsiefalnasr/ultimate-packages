import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

function makeFixtureTarball(dir) {
  // Build a minimal fake package with one dist file + one sourcemap
  // containing embedded sourcesContent, then tar.gz it.
  const pkgDir = join(dir, "package");
  mkdirSync(join(pkgDir, "dist"), { recursive: true });
  writeFileSync(
    join(pkgDir, "dist", "index.mjs"),
    "export default function hi(){return 'hi';}\n//# sourceMappingURL=index.mjs.map"
  );
  const map = {
    version: 3,
    sources: ["../src/index.ts"],
    sourcesContent: ["export default function hi(): string {\n    return 'hi';\n}\n"],
    mappings: "",
  };
  writeFileSync(join(pkgDir, "dist", "index.mjs.map"), JSON.stringify(map));

  const tarPath = join(dir, "fixture.tar.gz");
  spawnSync("tar", ["czf", tarPath, "-C", dir, "package"], { stdio: "inherit" });
  return tarPath;
}

test("extract-source.mjs recovers sourcesContent to the correct relative path", () => {
  const workDir = mkdtempSync(join(tmpdir(), "extract-test-"));
  const tarPath = makeFixtureTarball(workDir);
  const outDir = join(workDir, "out");

  execFileSync("node", ["scripts/provenance/extract-source.mjs", tarPath, outDir], {
    cwd: process.cwd(),
  });

  const recovered = readFileSync(join(outDir, "src", "index.ts"), "utf8");
  assert.equal(recovered, "export default function hi(): string {\n    return 'hi';\n}\n");

  rmSync(workDir, { recursive: true, force: true });
});

test("extract-source.mjs is idempotent", () => {
  const workDir = mkdtempSync(join(tmpdir(), "extract-test-idem-"));
  const tarPath = makeFixtureTarball(workDir);
  const outDir = join(workDir, "out");

  execFileSync("node", ["scripts/provenance/extract-source.mjs", tarPath, outDir]);
  const first = readFileSync(join(outDir, "src", "index.ts"), "utf8");
  execFileSync("node", ["scripts/provenance/extract-source.mjs", tarPath, outDir]);
  const second = readFileSync(join(outDir, "src", "index.ts"), "utf8");

  assert.equal(first, second);
  rmSync(workDir, { recursive: true, force: true });
});
