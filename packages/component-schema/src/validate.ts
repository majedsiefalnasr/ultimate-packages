// packages/component-schema/src/validate.ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { SCHEMA_VERSION } from "./version";
import type { ComponentMetadata } from "./component-metadata";

export type ValidationResult =
  | { valid: true; record: ComponentMetadata }
  | { valid: false; errors: string[] };

const KNOWN_TOP_LEVEL_KEYS = new Set([
  "name", "category", "description", "schemaVersion", "metadataVersion", "packages",
  "api", "accessibility", "style", "relationships", "provenanceRef", "guidance",
]);
const KNOWN_FRAMEWORKS = new Set(["ng", "react", "vue"]);
const KNOWN_PROVENANCE_PACKAGES = new Set(["ng", "react", "vue", "uix-styles"]);
const KNOWN_MECHANISMS = new Set(["output", "callback-prop", "emit"]);

// This file lives at <repo-root>/packages/component-schema/src/validate.ts.
// Resolve provenance JSON paths relative to THIS file's location (not
// process.cwd(), which varies by invocation context — e.g. pnpm --filter
// runs with cwd set to the package directory, not the repo root) so the
// real-file cross-check (checklist item 18) is robust regardless of how or
// from where this validator is invoked.
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../../..");

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function readProvenanceDestinations(pkg: string): Set<string> {
  const path = resolve(REPO_ROOT, "docs/architecture/provenance", `${pkg}.json`);
  const raw = readFileSync(path, "utf-8");
  const entries = JSON.parse(raw) as { ultimateDestination: string }[];
  return new Set(entries.map((e) => e.ultimateDestination));
}

/**
 * Proves an arbitrary runtime value conforms to the v1 ComponentMetadata
 * shape — this is the ONLY place that establishes trust in metadata content;
 * TypeScript types alone give no runtime guarantee for data read from disk.
 */
export function validateComponentMetadata(record: unknown, allRecords: unknown[]): ValidationResult {
  const errors: string[] = [];

  if (!isObject(record)) {
    return { valid: false, errors: ["record must be a non-null, non-array object"] };
  }

  for (const key of Object.keys(record)) {
    if (!KNOWN_TOP_LEVEL_KEYS.has(key)) errors.push(`Unrecognized top-level field: ${key}`);
  }
  for (const required of ["name", "category", "description", "schemaVersion"] as const) {
    if (typeof record[required] !== "string") errors.push(`${required} must be a string`);
  }
  if (typeof record.metadataVersion !== "number" || !Number.isInteger(record.metadataVersion) || record.metadataVersion < 1) {
    errors.push(`metadataVersion must be a positive integer starting at 1, got: ${JSON.stringify(record.metadataVersion)}`);
  }
  if (record.schemaVersion === SCHEMA_VERSION) {
    // compatible — no error
  } else if (typeof record.schemaVersion === "string") {
    errors.push(`schemaVersion ${record.schemaVersion} is not compatible with ${SCHEMA_VERSION}`);
  }
  if (!isObject(record.packages)) {
    errors.push("packages must be an object");
  } else {
    for (const key of Object.keys(record.packages)) {
      if (!KNOWN_FRAMEWORKS.has(key)) errors.push(`packages has unrecognized framework key: ${key}`);
      const entry = record.packages[key];
      if (!isObject(entry) || typeof entry.packageName !== "string" || typeof entry.sourcePath !== "string") {
        errors.push(`packages.${key} must be {packageName: string, sourcePath: string}`);
      }
    }
  }

  const packagesObj = isObject(record.packages) ? record.packages : {};
  if (record.api !== undefined) {
    if (!isObject(record.api)) {
      errors.push("api must be an object");
    } else {
      for (const framework of Object.keys(record.api)) {
        if (!KNOWN_FRAMEWORKS.has(framework)) errors.push(`api has unrecognized framework key: ${framework}`);
        if (!packagesObj[framework]) errors.push(`api.${framework} present but packages.${framework} is missing`);
        const frameworkApi = record.api[framework];
        if (!isObject(frameworkApi) || !Array.isArray(frameworkApi.props) || !Array.isArray(frameworkApi.events)) {
          errors.push(`api.${framework} must be {props: PropFact[], events: EventFact[]}`);
          continue;
        }
        for (const [i, prop] of frameworkApi.props.entries()) {
          if (!isObject(prop) || typeof prop.name !== "string" || typeof prop.type !== "string" || typeof prop.required !== "boolean") {
            errors.push(`api.${framework}.props[${i}] is not a valid PropFact`);
          } else if (prop.default !== undefined && typeof prop.default !== "string") {
            errors.push(`api.${framework}.props[${i}].default must be a string`);
          } else if (prop.description !== undefined && typeof prop.description !== "string") {
            errors.push(`api.${framework}.props[${i}].description must be a string`);
          }
        }
        for (const [i, event] of frameworkApi.events.entries()) {
          if (
            !isObject(event) ||
            typeof event.semanticId !== "string" ||
            typeof event.frameworkName !== "string" ||
            !KNOWN_MECHANISMS.has(event.mechanism as string)
          ) {
            errors.push(`api.${framework}.events[${i}] is not a valid EventFact (mechanism must be output/callback-prop/emit)`);
          } else if (event.payloadDescription !== undefined && typeof event.payloadDescription !== "string") {
            errors.push(`api.${framework}.events[${i}].payloadDescription must be a string`);
          }
        }
      }
    }
  }

  if (record.accessibility !== undefined) {
    if (!isObject(record.accessibility)) {
      errors.push("accessibility must be an object");
    } else {
      const KNOWN_ACCESSIBILITY_KEYS = new Set(["verifiedRoles", "verifiedAriaAttributes", "guidance"]);
      for (const key of Object.keys(record.accessibility)) {
        if (!KNOWN_ACCESSIBILITY_KEYS.has(key)) errors.push(`accessibility has unrecognized field: ${key}`);
      }
      const { verifiedRoles, verifiedAriaAttributes, guidance } = record.accessibility;
      if (verifiedRoles !== undefined && !isStringArray(verifiedRoles)) errors.push("accessibility.verifiedRoles must be string[]");
      if (verifiedAriaAttributes !== undefined && !isStringArray(verifiedAriaAttributes)) errors.push("accessibility.verifiedAriaAttributes must be string[]");
      if (guidance !== undefined && typeof guidance !== "string") errors.push("accessibility.guidance must be a string");
    }
  }

  if (record.style !== undefined) {
    if (!isObject(record.style) || typeof record.style.componentName !== "string") {
      errors.push("style must be an object with a required string componentName");
    } else if (record.style.styleModuleRef !== undefined && typeof record.style.styleModuleRef !== "string") {
      errors.push("style.styleModuleRef must be a string");
    }
  }

  if (record.relationships !== undefined) {
    if (!isObject(record.relationships)) {
      errors.push("relationships must be an object");
    } else {
      for (const key of Object.keys(record.relationships)) {
        if (key !== "dependsOn") errors.push(`relationships has unrecognized field: ${key}`);
      }
      if (record.relationships.dependsOn !== undefined && !isStringArray(record.relationships.dependsOn)) {
        errors.push("relationships.dependsOn must be string[]");
      }
    }
  }

  if (record.provenanceRef !== undefined) {
    if (!isObject(record.provenanceRef) || !KNOWN_PROVENANCE_PACKAGES.has(record.provenanceRef.package as string) || !isStringArray(record.provenanceRef.ultimateDestinations)) {
      errors.push("provenanceRef must be {package: 'ng'|'react'|'vue'|'uix-styles', ultimateDestinations: string[]}");
    } else {
      const destinations = readProvenanceDestinations(record.provenanceRef.package as string);
      for (const dest of record.provenanceRef.ultimateDestinations as string[]) {
        if (!destinations.has(dest)) errors.push(`provenanceRef points at a nonexistent provenance entry: ${dest}`);
      }
    }
  }

  if (record.guidance !== undefined) {
    if (!isObject(record.guidance)) {
      errors.push("guidance must be an object");
    } else {
      const KNOWN_GUIDANCE_KEYS = new Set(["usageNotes", "antiPatterns", "migrationNotes"]);
      for (const key of Object.keys(record.guidance)) {
        if (!KNOWN_GUIDANCE_KEYS.has(key)) errors.push(`guidance has unrecognized field: ${key}`);
      }
      const { usageNotes, antiPatterns, migrationNotes } = record.guidance;
      if (usageNotes !== undefined && typeof usageNotes !== "string") errors.push("guidance.usageNotes must be a string");
      if (antiPatterns !== undefined && !isStringArray(antiPatterns)) errors.push("guidance.antiPatterns must be string[]");
      if (migrationNotes !== undefined && typeof migrationNotes !== "string") errors.push("guidance.migrationNotes must be a string");
    }
  }

  const validObjectRecords = allRecords.filter(isObject);
  const sameName = validObjectRecords.filter((r) => r.name === record.name);
  if (sameName.length > 1) errors.push(`Duplicate component identity: ${String(record.name)}`);
  if (isObject(record.relationships) && isStringArray(record.relationships.dependsOn)) {
    const knownNames = new Set(validObjectRecords.map((r) => r.name));
    for (const dep of record.relationships.dependsOn) {
      if (!knownNames.has(dep)) errors.push(`relationships.dependsOn references unknown component: ${dep}`);
    }
  }

  return errors.length === 0
    ? { valid: true, record: record as unknown as ComponentMetadata }
    : { valid: false, errors };
}
