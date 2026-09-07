// packages/mcp/src/tools/search-components.ts
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import { invalidInputError, type McpToolError } from "../errors";

export interface SearchComponentsInput {
  query: string;
  framework?: "ng" | "react" | "vue";
}

export interface SearchComponentMatch {
  name: string;
  category: string;
  description: string;
}

export interface SearchComponentsResult {
  matches: SearchComponentMatch[];
}

const KNOWN_FRAMEWORKS = new Set(["ng", "react", "vue"]);

/**
 * v1 matching rule (spec §7.1, exact): case-insensitive substring match of
 * `query` against a component's name, category, OR description (any one
 * qualifies). Restricted to components with a `packages.{framework}` entry
 * when `framework` is supplied. Returns matches in ALL_COMPONENTS's own
 * array order — unranked. Fuzzy matching/relevance ranking is explicitly
 * deferred (spec §10), not implemented here.
 */
export function searchComponents(input: SearchComponentsInput): SearchComponentsResult | McpToolError {
  if (typeof input.query !== "string") {
    return invalidInputError("query", "must be a string");
  }
  if (input.framework !== undefined && !KNOWN_FRAMEWORKS.has(input.framework)) {
    return invalidInputError("framework", 'must be one of "ng", "react", "vue" when supplied');
  }

  const needle = input.query.toLowerCase();

  const matches = ALL_COMPONENTS.filter((component) => {
    if (input.framework !== undefined && component.packages[input.framework] === undefined) {
      return false;
    }
    return (
      component.name.toLowerCase().includes(needle) ||
      component.category.toLowerCase().includes(needle) ||
      component.description.toLowerCase().includes(needle)
    );
  }).map((component) => ({
    name: component.name,
    category: component.category,
    description: component.description,
  }));

  return { matches };
}
