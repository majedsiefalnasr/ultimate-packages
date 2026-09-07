// packages/mcp/src/tools/check-framework-compatibility.ts
import { readCompatibilityManifest } from "../manifest";
import { invalidInputError, type McpToolError } from "../errors";

export interface CheckFrameworkCompatibilityInput {
  framework: "angular" | "react" | "vue";
  frameworkVersion: string;
}

export interface CheckFrameworkCompatibilityResult {
  compatible: boolean;
  reason?: string;
}

const KNOWN_FRAMEWORKS = new Set(["angular", "react", "vue"]);

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

function parseVersion(version: string): ParsedVersion | null {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function compareVersions(a: ParsedVersion, b: ParsedVersion): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

/** Public, well-understood caret-range semantics — not imported from @ultimate/cli (spec §5.2). */
function satisfiesCaretRange(version: ParsedVersion, range: ParsedVersion): boolean {
  if (compareVersions(version, range) < 0) return false;
  if (range.major > 0) return version.major === range.major;
  if (range.minor > 0) return version.major === 0 && version.minor === range.minor;
  return version.major === 0 && version.minor === 0 && version.patch === range.patch;
}

function satisfiesRange(versionString: string, rangeString: string): boolean {
  const version = parseVersion(versionString);
  if (!version) return false;

  return rangeString
    .split("||")
    .map((part) => part.trim())
    .some((alternative) => {
      if (alternative.startsWith("^")) {
        const range = parseVersion(alternative.slice(1));
        return range !== null && satisfiesCaretRange(version, range);
      }
      const exact = parseVersion(alternative);
      return exact !== null && compareVersions(version, exact) === 0;
    });
}

/**
 * A single-axis framework-version compatibility check (spec §7.4, corrected
 * terminology: NOT a full multi-axis "compatibility verdict" — evaluates
 * ONLY frameworkVersionRange against the real compatibility-manifest.json,
 * via Task 4's independent reader, never @ultimate/cli's matchCompatibility().
 * Makes no claim about ultimateFrameworkPackage version, uix version, theme
 * version, metadata schema version, cli version, or any other axis
 * @ultimate/cli's own resolver evaluates.
 */
export function checkFrameworkCompatibility(
  input: CheckFrameworkCompatibilityInput
): CheckFrameworkCompatibilityResult | McpToolError {
  if (!KNOWN_FRAMEWORKS.has(input.framework)) {
    return invalidInputError("framework", 'must be one of "angular", "react", "vue"');
  }
  if (typeof input.frameworkVersion !== "string") {
    return invalidInputError("frameworkVersion", "must be a string");
  }

  const manifestResult = readCompatibilityManifest();
  if ("code" in manifestResult) {
    return manifestResult;
  }

  const entry = manifestResult.find((e) => e.framework === input.framework);
  if (entry === undefined) {
    return { compatible: false, reason: `no compatibility-manifest entry for framework "${input.framework}"` };
  }

  const matched = satisfiesRange(input.frameworkVersion, entry.frameworkVersionRange);
  if (matched) {
    return { compatible: true };
  }
  return {
    compatible: false,
    reason: `frameworkVersion "${input.frameworkVersion}" does not satisfy "${entry.frameworkVersionRange}"`,
  };
}
