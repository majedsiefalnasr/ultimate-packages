// packages/mcp/src/tools/get-component-accessibility.ts
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { AccessibilityFacts } from "@ultimate/component-schema";
import { invalidInputError, notFoundError, absentFacetError, type McpToolError } from "../errors";

export interface GetComponentAccessibilityInput {
  name: string;
}

export type GetComponentAccessibilityResult = AccessibilityFacts;

/**
 * Returns a component's accessibility.{verifiedRoles, verifiedAriaAttributes,
 * guidance} facet if populated, or an explicit facet_not_recorded result
 * (case 4, spec §4.1) if the optional facet is absent — never a fabricated
 * empty-but-implying-verified response. Per Pre-flight #4, only Table (1 of
 * 8 real records) currently populates this facet; this function does not
 * assume or special-case that — it degrades honestly for whichever record
 * is queried, based on the real data present.
 */
export function getComponentAccessibility(
  input: GetComponentAccessibilityInput
): GetComponentAccessibilityResult | McpToolError {
  if (typeof input.name !== "string") {
    return invalidInputError("name", "must be a string");
  }

  const component = ALL_COMPONENTS.find((c) => c.name === input.name);
  if (component === undefined) {
    return notFoundError(
      input.name,
      ALL_COMPONENTS.map((c) => c.name)
    );
  }

  if (component.accessibility === undefined) {
    return absentFacetError("accessibility");
  }

  return component.accessibility;
}
