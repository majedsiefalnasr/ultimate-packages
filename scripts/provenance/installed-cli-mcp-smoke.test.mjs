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

import { CONSUMERS, SMOKE_ROOTS, buildConsumerPackageJson } from "./installed-cli-mcp-smoke.mjs";

test("consumers cover angular, react and vue with manifest-satisfying versions", () => {
  assert.deepEqual(
    CONSUMERS.map((c) => c.framework),
    ["angular", "react", "vue"]
  );
  const angular = CONSUMERS[0];
  assert.equal(angular.dependencies["@angular/core"], "^21.2.22");
  assert.equal(angular.dependencies["@angular/cdk"], "^21.0.0");
  assert.equal(angular.dependencies.rxjs, "^7.8.1");
  assert.equal(CONSUMERS[1].dependencies.react, "^18.3.1");
  assert.equal(CONSUMERS[1].dependencies["react-dom"], "^18.3.1");
  assert.equal(CONSUMERS[2].dependencies.vue, "^3.5.13");
});

test("smoke roots are the CLI, MCP, the three framework packages, themes and uix-utils", () => {
  assert.deepEqual([...SMOKE_ROOTS].sort(), [
    "@ultimate/cli",
    "@ultimate/mcp",
    "@ultimate/ng",
    "@ultimate/react",
    "@ultimate/themes",
    "@ultimate/uix-utils",
    "@ultimate/vue",
  ]);
});

test("consumer package.json depends on the CLI and MCP tarballs and overrides every packed member", () => {
  const tarballs = new Map([
    ["@ultimate/cli", "/t/cli.tgz"],
    ["@ultimate/mcp", "/t/mcp.tgz"],
    ["@ultimate/uix-utils", "/t/uix-utils.tgz"],
  ]);
  const pkg = buildConsumerPackageJson(CONSUMERS[1], tarballs);
  assert.equal(pkg.private, true);
  assert.equal(pkg.dependencies["@ultimate/cli"], "file:/t/cli.tgz");
  assert.equal(pkg.dependencies["@ultimate/mcp"], "file:/t/mcp.tgz");
  assert.equal(pkg.dependencies.react, "^18.3.1");
  assert.deepEqual(pkg.pnpm.overrides, {
    "@ultimate/cli": "file:/t/cli.tgz",
    "@ultimate/mcp": "file:/t/mcp.tgz",
    "@ultimate/uix-utils": "file:/t/uix-utils.tgz",
  });
});

import { mentionsManifestFailure } from "./installed-cli-mcp-smoke.mjs";

test("mentionsManifestFailure detects a missing compatibility manifest", () => {
  assert.equal(
    mentionsManifestFailure(
      "Error: ENOENT: no such file or directory, open '/x/node_modules/docs/architecture/compatibility-manifest.json'"
    ),
    true
  );
  assert.equal(mentionsManifestFailure('{"code":"manifest_unreadable","message":"ENOENT"}'), true);
  assert.equal(
    mentionsManifestFailure("init: installed @ultimate/react and wrote ultimate.config.json."),
    false
  );
});
