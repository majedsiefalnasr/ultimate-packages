// packages/mcp/src/server.ts
//
// Constructs the McpServer and registers all 5 v1 tools. Deliberately
// exports createMcpServer() as a separate function from the transport
// connection (done only in bin.ts) so this file's tool-registration logic
// is testable without spawning a real stdio process (spec §5.1.1: nothing
// in this file writes to stdout — only tool return values flow through the
// SDK's own response-serialization path).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { searchComponents } from "./tools/search-components";
import { getComponentApi } from "./tools/get-component-api";
import { getComponent } from "./tools/get-component";
import { getComponentAccessibility } from "./tools/get-component-accessibility";
import { checkFrameworkCompatibility } from "./tools/check-framework-compatibility";
import { internalError, type McpToolError } from "./errors";

const FRAMEWORK_ENUM_NG = z.enum(["ng", "react", "vue"]);
const FRAMEWORK_ENUM_ANGULAR = z.enum(["angular", "react", "vue"]);

/**
 * Wraps a tool function's `Result | McpToolError` return into the MCP SDK's
 * own tool-response shape. Per spec §4.1 case 5: any exception thrown by
 * the tool function itself (not a structured McpToolError return, a real
 * unhandled throw) is caught here and converted into a generic
 * internalError() — never lets a raw stack trace or exception message
 * reach the response. That raw detail goes to stderr (spec §5.1.1), never
 * into the tool-response payload.
 */
function toToolResponse<T>(result: T | McpToolError) {
  if (result !== null && typeof result === "object" && "code" in result) {
    const err = result as McpToolError;
    return {
      isError: true,
      content: [{ type: "text" as const, text: JSON.stringify({ code: err.code, message: err.message }) }],
    };
  }
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result) }],
  };
}

function safeHandler<TInput>(fn: (input: TInput) => unknown) {
  return (input: TInput) => {
    try {
      return toToolResponse(fn(input));
    } catch (error) {
      // Real internal detail goes to stderr only — never into the response.
      console.error("[@ultimate/mcp] unexpected internal error:", error);
      return toToolResponse(internalError());
    }
  };
}

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "@ultimate/mcp", version: "0.1.0" });

  server.registerTool(
    "search_components",
    {
      description: "Case-insensitive substring search over Ultimate component name/category/description.",
      inputSchema: {
        query: z.string(),
        framework: FRAMEWORK_ENUM_NG.optional(),
      },
    },
    safeHandler(searchComponents)
  );

  server.registerTool(
    "get_component",
    {
      description:
        "Returns the full metadata record for a known component, optionally narrowed to one framework's packages/api entries.",
      inputSchema: {
        name: z.string(),
        framework: FRAMEWORK_ENUM_NG.optional(),
      },
    },
    safeHandler(getComponent)
  );

  server.registerTool(
    "get_component_api",
    {
      description: "Returns a component's props/events for one specific framework, exactly as recorded.",
      inputSchema: {
        name: z.string(),
        framework: FRAMEWORK_ENUM_NG,
      },
    },
    safeHandler(getComponentApi)
  );

  server.registerTool(
    "get_component_accessibility",
    {
      description: "Returns a component's recorded accessibility facts, or an honest not-recorded result.",
      inputSchema: {
        name: z.string(),
      },
    },
    safeHandler(getComponentAccessibility)
  );

  server.registerTool(
    "check_framework_compatibility",
    {
      description:
        "Checks a caller-supplied framework/version pair against the compatibility manifest's frameworkVersionRange axis only — not a full multi-axis compatibility check.",
      inputSchema: {
        framework: FRAMEWORK_ENUM_ANGULAR,
        frameworkVersion: z.string(),
      },
    },
    safeHandler(checkFrameworkCompatibility)
  );

  return server;
}
