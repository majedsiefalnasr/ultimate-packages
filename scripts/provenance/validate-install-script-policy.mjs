#!/usr/bin/env node
// scripts/provenance/validate-install-script-policy.mjs
//
// Per spec §4 R5, this is deliberately narrow: verify the repository has
// not silently re-enabled unrestricted install-time script execution. This
// checks only mechanisms confirmed real by direct pnpm@9.6.0 inspection
// (pnpm config get <key>, real repository file contents) — no
// pattern-matching against hypothetical key names. See task-3-brief.md for
// the evidence trail behind these two mechanisms.
//
// Mechanism 1 (informational only, no independent pass/fail power):
// .npmrc's `enable-scripts` setting. This is pnpm's blanket, repository-wide
// lifecycle-script kill-switch. `true` is pnpm's own out-of-the-box
// default, so its mere presence/absence at the default value carries no
// signal about a newly introduced risk. Checked and reported purely for
// visibility.
//
// Mechanism 2 (the real, meaningful check): pnpm-workspace.yaml's
// `onlyBuiltDependencies` / `ignoredBuiltDependencies` fields — pnpm's
// modern (9.x-era) allowlist mechanism for which dependencies are
// permitted to run install-time build/lifecycle scripts. If either field
// is defined and non-empty, this check fails when any listed package name
// is not already present in the repository's own pnpm-lock.yaml dependency
// tree — an allowlist/ignorelist entry naming a package that isn't a real,
// resolvable dependency is itself suspicious (stale, or a sign of a
// manually-added, unreviewed entry meant to pre-authorize a not-yet-added
// dependency's install scripts).

import { readFileSync, statSync } from "node:fs";

function fail(message) {
  console.error(`[install-script-policy:validate] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[install-script-policy:validate] OK: ${message}`);
}

function readFileIfExists(path) {
  if (!statSync(path, { throwIfNoEntry: false })) return null;
  return readFileSync(path, "utf8");
}

// --- Mechanism 1: .npmrc `enable-scripts` (informational only) ---------

const npmrcContent = readFileIfExists(".npmrc");
if (npmrcContent) {
  const match = npmrcContent.match(/^\s*enable-scripts\s*=\s*(\S+)\s*$/m);
  if (match) {
    console.log(`[install-script-policy:validate] INFO: .npmrc enable-scripts=${match[1]}`);
  } else {
    console.log("[install-script-policy:validate] INFO: .npmrc has no enable-scripts override");
  }
} else {
  console.log("[install-script-policy:validate] INFO: no .npmrc present");
}

// --- Mechanism 2: pnpm-workspace.yaml build-approval allowlists --------

// Extracts the package names listed under a given top-level YAML key whose
// value is a block sequence of quoted or bare scalar strings, e.g.:
//   onlyBuiltDependencies:
//     - "esbuild"
//     - foo
// Stops at the next top-level (unindented) key or end of file.
function extractYamlListValues(content, key) {
  const lines = content.split("\n");
  const values = [];
  let inList = false;
  for (const line of lines) {
    if (!inList) {
      if (new RegExp(`^${key}\\s*:\\s*$`).test(line.trim()) && /^\S/.test(line)) {
        inList = true;
      }
      continue;
    }
    if (/^\s*-\s*/.test(line)) {
      const raw = line.replace(/^\s*-\s*/, "").trim();
      const unquoted = raw.replace(/^["']|["']$/g, "");
      if (unquoted) values.push(unquoted);
    } else if (/^\S/.test(line)) {
      // Next top-level key — list has ended.
      break;
    }
  }
  return values;
}

// Extracts all resolvable dependency package names from pnpm-lock.yaml's
// top-level `packages:` section, whose entries are shaped like:
//   '@scope/name@1.2.3':
//   name@1.2.3:
function extractLockfilePackageNames(content) {
  const names = new Set();
  const lines = content.split("\n");
  let inPackages = false;
  for (const line of lines) {
    if (!inPackages) {
      if (/^packages:\s*$/.test(line)) inPackages = true;
      continue;
    }
    if (/^\S/.test(line)) break; // next top-level key ends the section
    const entryMatch = line.match(/^\s{2}['"]?(.+?)['"]?:\s*$/);
    if (!entryMatch) continue;
    const spec = entryMatch[1];
    // Strip the trailing "@<version>" — scoped names retain their leading
    // "@", so only the LAST "@" in the spec is the version separator.
    const lastAt = spec.lastIndexOf("@");
    const name = lastAt > 0 ? spec.slice(0, lastAt) : spec;
    names.add(name);
  }
  return names;
}

const workspaceYamlContent = readFileIfExists("pnpm-workspace.yaml");
let violations = 0;

if (workspaceYamlContent) {
  const onlyBuilt = extractYamlListValues(workspaceYamlContent, "onlyBuiltDependencies");
  const ignoredBuilt = extractYamlListValues(workspaceYamlContent, "ignoredBuiltDependencies");
  const overrideEntries = [
    ...onlyBuilt.map((name) => ({ name, field: "onlyBuiltDependencies" })),
    ...ignoredBuilt.map((name) => ({ name, field: "ignoredBuiltDependencies" })),
  ];

  if (overrideEntries.length > 0) {
    const lockfileContent = readFileIfExists("pnpm-lock.yaml");
    const lockfileNames = lockfileContent
      ? extractLockfilePackageNames(lockfileContent)
      : new Set();

    for (const { name, field } of overrideEntries) {
      if (!lockfileNames.has(name)) {
        console.error(
          `[install-script-policy:validate] VIOLATION: pnpm-workspace.yaml's ${field} lists "${name}", which is not a resolvable dependency in pnpm-lock.yaml`
        );
        violations++;
      }
    }

    if (violations === 0) {
      pass(
        `pnpm-workspace.yaml build-script allowlist/ignorelist entries (${overrideEntries.length}) all resolve in pnpm-lock.yaml`
      );
    }
  } else {
    pass("no build-script allowlist/ignorelist overrides present in pnpm-workspace.yaml");
  }
} else {
  pass("no pnpm-workspace.yaml present — no build-script allowlist/ignorelist overrides possible");
}

if (violations > 0) {
  fail(
    `${violations} orphaned build-script allowlist/ignorelist entr${violations === 1 ? "y" : "ies"} found`
  );
}

process.exit(0);
