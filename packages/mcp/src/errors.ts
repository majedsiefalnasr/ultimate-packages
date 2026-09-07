//
// The one shared error contract every @ultimate/mcp tool handler uses, per
// the approved Phase 8 spec §4.1's five-case taxonomy. No tool invents its
// own ad hoc error shape — every tool handler in src/tools/* returns
// McpToolError values constructed only by the five functions below.

export interface McpToolError {
  // Load-bearing as the tool response discriminant (see toToolResponse) — must not be introduced onto any tool Result type.
  readonly code: "invalid_input" | "not_found" | "manifest_unreadable" | "facet_not_recorded" | "internal_error";
  readonly message: string;
}

/** Case 1: input fails the tool's declared JSON-schema contract. */
export function invalidInputError(field: string, reason: string): McpToolError {
  return {
    code: "invalid_input",
    message: `Invalid input for field "${field}": ${reason}`,
  };
}

/** Case 2: a supplied component name does not match any real record. */
export function notFoundError(name: string, knownNames: readonly string[]): McpToolError {
  return {
    code: "not_found",
    message: `Component "${name}" is not in the known component set. Known components: ${knownNames.join(", ")}.`,
  };
}

/**
 * Case 3: the compatibility manifest could not be read or parsed. Never
 * embeds the raw underlying error's detail (which may contain a filesystem
 * path) — that belongs on stderr (case 5's no-leak rule), not in the
 * tool-error payload a calling host/agent sees.
 */
export function manifestUnreadableError(_detail: string): McpToolError {
  return {
    code: "manifest_unreadable",
    message: "The compatibility manifest could not be read or parsed. No compatibility result can be returned.",
  };
}

/** Case 4: an optional metadata facet is absent on an otherwise-valid, found record. */
export function absentFacetError(facetName: string): McpToolError {
  return {
    code: "facet_not_recorded",
    message: `"${facetName}" facts are not recorded for this component.`,
  };
}

/**
 * Case 5: an unexpected internal error. Deliberately takes no arguments —
 * there is nothing for a caller to pass that could leak a stack trace,
 * filesystem path, or internal module name into the response. Any detail
 * useful for local debugging goes to stderr (spec §5.1.1) at the call
 * site, separately from this function's return value.
 */
export function internalError(): McpToolError {
  return {
    code: "internal_error",
    message: "An unexpected internal error occurred.",
  };
}
