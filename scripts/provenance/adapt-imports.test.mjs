import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

test("adapt-imports.mjs rewrites bare and subpath import specifiers", () => {
  const workDir = mkdtempSync(join(tmpdir(), "adapt-test-"));
  mkdirSync(join(workDir, "src"), { recursive: true });
  writeFileSync(
    join(workDir, "src", "example.ts"),
    [
      "import { resolve } from '@primeuix/utils';",
      "import { deepMerge } from '@primeuix/utils/object';",
      "import hasClass from './hasClass';",
      "",
    ].join("\n")
  );

  execFileSync("node", [
    "scripts/provenance/adapt-imports.mjs",
    join(workDir, "src"),
    "--from",
    "@primeuix/utils",
    "--to",
    "@ultimate/uix-utils",
  ]);

  const result = readFileSync(join(workDir, "src", "example.ts"), "utf8");
  assert.match(result, /import \{ resolve \} from '@ultimate\/uix-utils';/);
  assert.match(result, /import \{ deepMerge \} from '@ultimate\/uix-utils\/object';/);
  assert.match(result, /import hasClass from '\.\/hasClass';/);

  rmSync(workDir, { recursive: true, force: true });
});

test("adapt-imports.mjs is idempotent", () => {
  const workDir = mkdtempSync(join(tmpdir(), "adapt-test-idem-"));
  mkdirSync(join(workDir, "src"), { recursive: true });
  writeFileSync(join(workDir, "src", "example.ts"), "import { resolve } from '@primeuix/utils';\n");

  const args = [
    "scripts/provenance/adapt-imports.mjs",
    join(workDir, "src"),
    "--from",
    "@primeuix/utils",
    "--to",
    "@ultimate/uix-utils",
  ];
  execFileSync("node", args);
  const first = readFileSync(join(workDir, "src", "example.ts"), "utf8");
  execFileSync("node", args);
  const second = readFileSync(join(workDir, "src", "example.ts"), "utf8");

  assert.equal(first, second);
  rmSync(workDir, { recursive: true, force: true });
});
