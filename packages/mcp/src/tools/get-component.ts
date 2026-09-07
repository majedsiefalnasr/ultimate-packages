// packages/mcp/src/tools/get-component.ts
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { ComponentMetadata } from "@ultimate/component-schema";
import { invalidInputError, notFoundError, type McpToolError } from "../errors";

export interface GetComponentInput {
  name: string;
  framework?: "ng" | "react" | "vue";
}

export type GetComponentResult = ComponentMetadata;

const KNOWN_FRAMEWORKS = new Set(["ng", "react", "vue"]);

/**
 * Exactly one output rule (spec §7.1, no ambiguity):
 * - Without `framework`: the complete metadata record, unmodified.
 * - With `framework`: every framework-neutral facet (name, category,
 *   description, accessibility?, style?, relationships?, guidance?,
 *   provenanceRef?) returned in full — none of these are framework-specific,
 *   so none are dropped or filtered — PLUS only that one framework's
 *   entries for the two facets that ARE structured per-framework:
 *   `packages` narrowed to `packages.{framework}` alone, `api` narrowed to
 *   `api.{framework}` alone (the whole `api` key is omitted if the
 *   framework has no api entry — not returned as an empty object; per
 *   spec §4.1 case 4, absence is signaled by the key's absence here, since
 *   this is a facet already present on the base record, not a
 *   caller-facing error condition on its own).
 */
export function getComponent(input: GetComponentInput): GetComponentResult | McpToolError {
  if (typeof input.name !== "string") {
    return invalidInputError("name", "must be a string");
  }
  if (input.framework !== undefined && !KNOWN_FRAMEWORKS.has(input.framework)) {
    return invalidInputError("framework", 'must be one of "ng", "react", "vue" when supplied');
  }

  const component = ALL_COMPONENTS.find((c) => c.name === input.name);
  if (component === undefined) {
    return notFoundError(
      input.name,
      ALL_COMPONENTS.map((c) => c.name)
    );
  }

  if (input.framework === undefined) {
    return component;
  }

  const narrowedPackages: ComponentMetadata["packages"] = {};
  const packageEntry = component.packages[input.framework];
  if (packageEntry !== undefined) {
    narrowedPackages[input.framework] = packageEntry;
  }

  const narrowedApi = component.api?.[input.framework];

  return {
    name: component.name,
    category: component.category,
    description: component.description,
    schemaVersion: component.schemaVersion,
    metadataVersion: component.metadataVersion,
    packages: narrowedPackages,
    ...(narrowedApi !== undefined ? { api: { [input.framework]: narrowedApi } } : {}),
    ...(component.accessibility !== undefined ? { accessibility: component.accessibility } : {}),
    ...(component.style !== undefined ? { style: component.style } : {}),
    ...(component.relationships !== undefined ? { relationships: component.relationships } : {}),
    ...(component.guidance !== undefined ? { guidance: component.guidance } : {}),
    ...(component.provenanceRef !== undefined ? { provenanceRef: component.provenanceRef } : {}),
  };
}
