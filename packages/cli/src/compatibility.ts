/**
 * Deterministic multi-axis compatibility resolver (spec §6.5).
 *
 * A `CompatibilityEntry` matches only when every populated v1 compatibility
 * axis applicable to the target project satisfies its declared constraint.
 * `mcpVersionRange`/`aiSkillsVersionRange` (§6.3) are reserved/unpopulated
 * and are never read from `input` or evaluated here — that is enforced at
 * compile time by `matchCompatibility`'s own input type not declaring them.
 *
 * Range satisfaction is implemented by hand rather than via the `semver`
 * npm package: every range shape in the real manifest
 * (`docs/architecture/compatibility-manifest.json`) is either a bare caret
 * range (`^x.y.z`) or an `||`-separated union of such ranges (e.g.
 * `"^17.0.0 || ^18.0.0 || ^19.0.0"`), so a minimal caret-only comparator is
 * sufficient and avoids adding a new dependency no other package here uses.
 */

export type Framework = "angular" | "react" | "vue";

export interface CompatibilityEntry {
  framework: Framework;
  frameworkVersionRange: string;
  ultimateFrameworkPackage: { name: string; versionRange: string };
  uixVersionRange: string;
  themeVersionRange: string;
  /** Exact `SCHEMA_VERSION` string value — never a range (see §6.2/§6.4). */
  metadataSchemaVersion: string;
  cliVersionRange: string;
  /** Reserved, unpopulated in v1 (§6.3) — never read by `matchCompatibility`. */
  mcpVersionRange?: string;
  /** Reserved, unpopulated in v1 (§6.3) — never read by `matchCompatibility`. */
  aiSkillsVersionRange?: string;
}

export interface MatchCompatibilityInput {
  framework: Framework;
  frameworkVersion: string;
  ultimateFrameworkPackageVersion?: string;
  uixVersion?: string;
  themeVersion?: string;
  metadataSchemaVersion?: string;
  cliVersion: string;
}

export type MatchCompatibilityResult =
  | { matched: true; entry: CompatibilityEntry }
  | { matched: false; reason: string };

/** A single `x.y.z` version, parsed from a plain (non-range) version string. */
interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

function parseVersion(version: string): ParsedVersion | null {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!match) {
    return null;
  }
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function compareVersions(a: ParsedVersion, b: ParsedVersion): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

/**
 * Does `version` satisfy a single caret range `^x.y.z`?
 *
 * Caret semantics (per the only shapes present in this repo's manifest):
 * - `^0.0.z` allows only exactly `0.0.z` (no updates at all).
 * - `^0.y.z` (y > 0) allows `>=0.y.z <0.(y+1).0`.
 * - `^x.y.z` (x > 0) allows `>=x.y.z <(x+1).0.0`.
 */
function satisfiesCaretRange(version: ParsedVersion, range: ParsedVersion): boolean {
  if (compareVersions(version, range) < 0) {
    return false;
  }

  if (range.major > 0) {
    return version.major === range.major;
  }
  if (range.minor > 0) {
    return version.major === 0 && version.minor === range.minor;
  }
  return version.major === 0 && version.minor === 0 && version.patch === range.patch;
}

/**
 * Does `versionString` satisfy `rangeString`, where `rangeString` is either
 * a single caret range (`^x.y.z`) or an `||`-separated union of caret
 * ranges/exact versions? This is the only range grammar present in v1's
 * manifest — anything else fails closed (returns `false`) rather than
 * guessing.
 */
function satisfiesRange(versionString: string, rangeString: string): boolean {
  const version = parseVersion(versionString);
  if (!version) {
    return false;
  }

  const alternatives = rangeString.split("||").map((part) => part.trim());

  return alternatives.some((alternative) => {
    if (alternative.startsWith("^")) {
      const range = parseVersion(alternative.slice(1));
      return range !== null && satisfiesCaretRange(version, range);
    }
    // Exact-version alternative (no leading `^`).
    const exact = parseVersion(alternative);
    return exact !== null && compareVersions(version, exact) === 0;
  });
}

interface AxisCheck {
  /** Name reported in the refusal reason — matches the manifest field name. */
  axisName: string;
  /** `undefined` means the axis was not supplied by the caller: not applicable, skipped. */
  inputValue: string | undefined;
  constraint: string;
  /** Exact string equality instead of range-satisfaction (metadataSchemaVersion only). */
  exact?: boolean;
}

/**
 * Implements spec §6.5's exact rule: a `CompatibilityEntry` matches only
 * when every populated v1 axis applicable to the target project satisfies
 * its declared constraint. Axes omitted from `input` are treated as "not
 * applicable to the target project" and are skipped, never treated as
 * failures. `metadataSchemaVersion` is compared by exact string equality;
 * every other axis is a range-satisfaction check.
 */
export function matchCompatibility(
  input: MatchCompatibilityInput,
  manifest: CompatibilityEntry[],
): MatchCompatibilityResult {
  const candidates = manifest.filter((entry) => entry.framework === input.framework);

  if (candidates.length === 0) {
    return { matched: false, reason: `no entry for framework "${input.framework}"` };
  }

  let firstFailureReason: string | null = null;

  for (const entry of candidates) {
    const axisChecks: AxisCheck[] = [
      {
        axisName: "frameworkVersionRange",
        inputValue: input.frameworkVersion,
        constraint: entry.frameworkVersionRange,
      },
      {
        axisName: "ultimateFrameworkPackage.versionRange",
        inputValue: input.ultimateFrameworkPackageVersion,
        constraint: entry.ultimateFrameworkPackage.versionRange,
      },
      {
        axisName: "uixVersionRange",
        inputValue: input.uixVersion,
        constraint: entry.uixVersionRange,
      },
      {
        axisName: "themeVersionRange",
        inputValue: input.themeVersion,
        constraint: entry.themeVersionRange,
      },
      {
        axisName: "metadataSchemaVersion",
        inputValue: input.metadataSchemaVersion,
        constraint: entry.metadataSchemaVersion,
        exact: true,
      },
      {
        axisName: "cliVersionRange",
        inputValue: input.cliVersion,
        constraint: entry.cliVersionRange,
      },
    ];

    const failedAxis = axisChecks.find((axis) => {
      if (axis.inputValue === undefined) {
        // Not supplied - not applicable to the target project. Skip.
        return false;
      }
      if (axis.exact) {
        return axis.inputValue !== axis.constraint;
      }
      return !satisfiesRange(axis.inputValue, axis.constraint);
    });

    if (!failedAxis) {
      return { matched: true, entry };
    }

    if (firstFailureReason === null) {
      firstFailureReason = failedAxis.exact
        ? `${failedAxis.axisName} exact-match failed: expected "${failedAxis.constraint}", got "${failedAxis.inputValue}"`
        : `${failedAxis.axisName} range-match failed: "${failedAxis.inputValue}" does not satisfy "${failedAxis.constraint}"`;
    }
  }

  return { matched: false, reason: firstFailureReason ?? "no matching entry" };
}
