#!/usr/bin/env node
// scripts/provenance/validate-dependency-ceiling.mjs
//
// Fails if any packages/{ng,react,vue}* package.json declares a
// dependency on primeng/primevue/primereact directly, or on any
// @primeuix/* package above its pinned MIT ceiling. Ceilings match
// docs/architecture/DEPENDENCIES.md and PROVENANCE.md exactly.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CEILINGS = {
  "@primeuix/utils": "0.7.2",
  "@primeuix/styled": "0.7.4",
  "@primeuix/styles": "2.0.3",
  "@primeuix/motion": "0.0.10",
};
const FORBIDDEN_DIRECT_DEPS = ["primeng", "primevue", "primereact"];
const WATCHED_PREFIXES = ["ng", "react", "vue"];

function fail(message) {
  console.error(`[ceiling:validate] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[ceiling:validate] OK: ${message}`);
}

function parseVersion(v) {
  const match = v.replace(/^[\^~]/, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function exceedsCeiling(actual, ceiling) {
  const a = parseVersion(actual);
  const c = parseVersion(ceiling);
  if (!a || !c) return false;
  for (let i = 0; i < 3; i++) {
    if (a[i] > c[i]) return true;
    if (a[i] < c[i]) return false;
  }
  return false;
}

function findWatchedPackageJsons(root = "packages") {
  if (!statSync(root, { throwIfNoEntry: false })) return [];
  const results = [];
  for (const name of readdirSync(root)) {
    if (!WATCHED_PREFIXES.some((prefix) => name.startsWith(prefix))) continue;
    const pkgJsonPath = join(root, name, "package.json");
    if (statSync(pkgJsonPath, { throwIfNoEntry: false })) {
      results.push(pkgJsonPath);
    }
  }
  return results;
}

const pkgJsonPaths = findWatchedPackageJsons();
if (pkgJsonPaths.length === 0) {
  pass("no packages/{ng,react,vue}*/package.json files exist yet — nothing to validate");
  process.exit(0);
}

let violations = 0;
for (const path of pkgJsonPaths) {
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.peerDependencies };

  for (const forbidden of FORBIDDEN_DIRECT_DEPS) {
    if (deps[forbidden]) {
      console.error(`[ceiling:validate] VIOLATION: ${path} declares forbidden runtime dependency "${forbidden}"`);
      violations++;
    }
  }

  for (const [pkgName, ceiling] of Object.entries(CEILINGS)) {
    const declared = deps[pkgName];
    if (!declared) continue;

    const parsed = parseVersion(declared);
    if (!parsed) {
      console.error(
        `[ceiling:validate] VIOLATION: ${path} declares ${pkgName}@${declared} — version string could not be parsed as semver; cannot verify it is within the MIT ceiling ${ceiling}, blocking to be safe`
      );
      violations++;
    } else if (exceedsCeiling(declared, ceiling)) {
      console.error(
        `[ceiling:validate] VIOLATION: ${path} declares ${pkgName}@${declared}, exceeds MIT ceiling ${ceiling}`
      );
      violations++;
    }
  }
}

if (violations > 0) {
  fail(`${violations} dependency-ceiling violation(s) found`);
}

pass(`scanned ${pkgJsonPaths.length} package.json file(s), zero violations`);
process.exit(0);
