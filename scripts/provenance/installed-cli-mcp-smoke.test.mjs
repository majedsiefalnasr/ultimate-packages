// scripts/provenance/installed-cli-mcp-smoke.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import * as packInstall from "./pack-install-integrity.mjs";

test("pack-install-integrity exports the helpers the smoke harness reuses", () => {
  for (const name of [
    "toScopedName",
    "packageRoot",
    "getPackageDependenciesFromDisk",
    "packOne",
    "topologicalSort",
  ]) {
    assert.equal(typeof packInstall[name], "function", `${name} is exported`);
  }
});
