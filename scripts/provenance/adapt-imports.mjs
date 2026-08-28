#!/usr/bin/env node
// scripts/provenance/adapt-imports.mjs
//
// Rewrites import specifiers matching a given prefix (e.g. "@primeuix/utils")
// to a new prefix (e.g. "@ultimate/uix-utils") across every .ts file under a
// directory. Handles both the bare specifier ("@primeuix/utils") and subpath
// specifiers ("@primeuix/utils/object") without touching relative imports
// ("./hasClass", "../methods/addClass"), which are already correct because
// extract-source.mjs preserves the original relative directory structure.
//
// Usage: node adapt-imports.mjs <dir> --from <old-prefix> --to <new-prefix>

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const dir = args[0];
const fromIndex = args.indexOf("--from");
const toIndex = args.indexOf("--to");

if (!dir || fromIndex === -1 || toIndex === -1) {
  console.error("Usage: adapt-imports.mjs <dir> --from <old-prefix> --to <new-prefix>");
  process.exit(1);
}

const fromPrefix = args[fromIndex + 1];
const toPrefix = args[toIndex + 1];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Matches the exact prefix, optionally followed by "/<rest-of-subpath>",
// inside a quoted import/export specifier. Requires a word boundary after
// the prefix so "@primeuix/utils-extra" is not matched by "@primeuix/utils".
const pattern = new RegExp(`(['"])${escapeRegExp(fromPrefix)}(/[^'"]*)?\\1`, "g");

function walk(d, files = []) {
  for (const entry of readdirSync(d, { withFileTypes: true })) {
    const full = join(d, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.name.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

let changedFiles = 0;
let changedSpecifiers = 0;

for (const file of walk(dir)) {
  const original = readFileSync(file, "utf8");
  let matches = 0;
  const updated = original.replace(pattern, (_match, quote, subpath = "") => {
    matches++;
    return `${quote}${toPrefix}${subpath}${quote}`;
  });

  if (matches > 0) {
    writeFileSync(file, updated);
    changedFiles++;
    changedSpecifiers += matches;
  }
}

console.log(
  `[adapt-imports] rewrote ${changedSpecifiers} specifier(s) across ${changedFiles} file(s) under ${dir} (${fromPrefix} -> ${toPrefix})`
);
