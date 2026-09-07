// packages/mcp/src/tools/get-component-api.ts
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { EventFact, PropFact } from "@ultimate/component-schema";
import { invalidInputError, notFoundError, absentFacetError, type McpToolError } from "../errors";

export interface GetComponentApiInput {
  name: string;
  framework: "ng" | "react" | "vue";
}

export interface GetComponentApiResult {
  props: PropFact[];
  events: EventFact[];
}

const KNOWN_FRAMEWORKS = new Set(["ng", "react", "vue"]);

/**
 * Returns `api.{framework}.{props,events}` exactly as recorded on the real
 * metadata record — no reshaping, no filtering. `events` is real per-record
 * data: non-empty on 6 of the 8 v1 records, empty (`[]`) on exactly Button
 * and Tooltip (verified against packages/component-metadata/src/records/*.ts;
 * this tool never assumes a uniform "no events" shape across the proof set).
 * Returns `facet_not_recorded` (case 4) rather than an error when
 * `packages.{framework}` or `api.{framework}` is absent for an otherwise
 * valid component/framework pair.
 */
export function getComponentApi(input: GetComponentApiInput): GetComponentApiResult | McpToolError {
  if (typeof input.name !== "string") {
    return invalidInputError("name", "must be a string");
  }
  if (!KNOWN_FRAMEWORKS.has(input.framework)) {
    return invalidInputError("framework", 'must be one of "ng", "react", "vue"');
  }

  const component = ALL_COMPONENTS.find((c) => c.name === input.name);
  if (component === undefined) {
    return notFoundError(
      input.name,
      ALL_COMPONENTS.map((c) => c.name)
    );
  }

  const frameworkApi = component.api?.[input.framework];
  if (frameworkApi === undefined) {
    return absentFacetError(`api.${input.framework}`);
  }

  return { props: frameworkApi.props, events: frameworkApi.events };
}
