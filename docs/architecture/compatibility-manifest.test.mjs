import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { SCHEMA_VERSION } from "../../packages/component-schema/dist/index.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, "compatibility-manifest.json");

const REQUIRED_KEYS = [
  "framework",
  "frameworkVersionRange",
  "ultimateFrameworkPackage",
  "uixVersionRange",
  "themeVersionRange",
  "metadataSchemaVersion",
  "cliVersionRange",
];
const RESERVED_OPTIONAL_KEYS = ["mcpVersionRange", "aiSkillsVersionRange"];
const ALLOWED_KEYS = new Set([...REQUIRED_KEYS, ...RESERVED_OPTIONAL_KEYS]);

function readManifest() {
  const raw = readFileSync(MANIFEST_PATH, "utf8");
  return JSON.parse(raw);
}

test("compatibility-manifest.json is valid JSON", () => {
  assert.doesNotThrow(() => readManifest());
});

test("compatibility-manifest.json contains exactly 3 entries (angular, react, vue)", () => {
  const manifest = readManifest();
  assert.equal(manifest.length, 3);
  const frameworks = manifest.map((entry) => entry.framework).sort();
  assert.deepEqual(frameworks, ["angular", "react", "vue"]);
});

test("every entry has exactly the required keys plus optionally the reserved keys", () => {
  const manifest = readManifest();
  for (const entry of manifest) {
    const keys = Object.keys(entry);

    for (const requiredKey of REQUIRED_KEYS) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(entry, requiredKey),
        `entry for "${entry.framework}" is missing required key "${requiredKey}"`
      );
    }

    for (const key of keys) {
      assert.ok(
        ALLOWED_KEYS.has(key),
        `entry for "${entry.framework}" has unexpected key "${key}"`
      );
    }
  }
});

test("metadataSchemaVersion exactly equals the real @ultimate/component-schema SCHEMA_VERSION", () => {
  const manifest = readManifest();
  for (const entry of manifest) {
    assert.equal(
      entry.metadataSchemaVersion,
      SCHEMA_VERSION,
      `entry for "${entry.framework}" has metadataSchemaVersion "${entry.metadataSchemaVersion}", expected "${SCHEMA_VERSION}"`
    );
  }
});

test("no entry contains mcpVersionRange/aiSkillsVersionRange populated with a non-empty value", () => {
  const manifest = readManifest();
  for (const entry of manifest) {
    for (const reservedKey of RESERVED_OPTIONAL_KEYS) {
      if (Object.prototype.hasOwnProperty.call(entry, reservedKey)) {
        assert.ok(
          !entry[reservedKey],
          `entry for "${entry.framework}" has "${reservedKey}" populated with a non-empty value: ${entry[reservedKey]}`
        );
      }
    }
  }
});
