// packages/mcp/src/manifest.ts
//
// An independent, minimal reader of docs/architecture/compatibility-manifest.json.
// Deliberately does NOT import @ultimate/cli's matchCompatibility()/
// detectFramework() (spec §5.2) — reads the same shared, plain-JSON data
// file @ultimate/cli itself reads, but does so on its own, narrowly, for
// exactly the one axis check_framework_compatibility needs
// (frameworkVersionRange). This is a deliberately smaller shape than CLI's
// own 6-field CompatibilityEntry — not a port of it.
import { readFileSync } from "node:fs";
import { manifestUnreadableError, type McpToolError } from "./errors";
import { COMPATIBILITY_MANIFEST_PATH } from "./manifest-path";

export interface CompatibilityManifestEntry {
  framework: "angular" | "react" | "vue";
  frameworkVersionRange: string;
}

function isValidEntry(value: unknown): value is CompatibilityManifestEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    (entry.framework === "angular" || entry.framework === "react" || entry.framework === "vue") &&
    typeof entry.frameworkVersionRange === "string"
  );
}

/**
 * Reads docs/architecture/compatibility-manifest.json and returns exactly
 * the {framework, frameworkVersionRange} facts this package's one
 * compatibility tool needs — ignoring every other real field the file
 * contains (ultimateFrameworkPackage, uixVersionRange, themeVersionRange,
 * metadataSchemaVersion, cliVersionRange, and the reserved
 * mcpVersionRange/aiSkillsVersionRange axes), since this tool makes no
 * claim about any of those (spec §7.4).
 *
 * Fails closed per spec §4.1 case 3: any read or parse failure returns a
 * structured manifest_unreadable error — never throws an unstructured
 * exception (unlike @ultimate/cli's own doctor.ts, which does not guard
 * this read — see this plan's Pre-flight #11), and never falls back to an
 * empty array or a fabricated successful result.
 */
export function readCompatibilityManifest(): CompatibilityManifestEntry[] | McpToolError {
  let raw: string;
  try {
    raw = readFileSync(COMPATIBILITY_MANIFEST_PATH, "utf-8");
  } catch (error) {
    return manifestUnreadableError(error instanceof Error ? error.message : String(error));
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return manifestUnreadableError(error instanceof Error ? error.message : String(error));
  }

  if (!Array.isArray(parsed)) {
    return manifestUnreadableError("compatibility-manifest.json did not parse to an array");
  }

  const entries: CompatibilityManifestEntry[] = [];
  for (const item of parsed) {
    if (!isValidEntry(item)) {
      return manifestUnreadableError("compatibility-manifest.json contained a malformed entry");
    }
    entries.push({ framework: item.framework, frameworkVersionRange: item.frameworkVersionRange });
  }

  return entries;
}
