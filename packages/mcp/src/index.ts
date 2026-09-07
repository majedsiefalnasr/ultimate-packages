// packages/mcp/src/index.ts
export { createMcpServer } from "./server";
export { searchComponents, type SearchComponentsInput, type SearchComponentsResult } from "./tools/search-components";
export { getComponentApi, type GetComponentApiInput, type GetComponentApiResult } from "./tools/get-component-api";
export { getComponent, type GetComponentInput, type GetComponentResult } from "./tools/get-component";
export {
  getComponentAccessibility,
  type GetComponentAccessibilityInput,
  type GetComponentAccessibilityResult,
} from "./tools/get-component-accessibility";
export {
  checkFrameworkCompatibility,
  type CheckFrameworkCompatibilityInput,
  type CheckFrameworkCompatibilityResult,
} from "./tools/check-framework-compatibility";
export { readCompatibilityManifest, type CompatibilityManifestEntry } from "./manifest";
export {
  type McpToolError,
  invalidInputError,
  notFoundError,
  manifestUnreadableError,
  absentFacetError,
  internalError,
} from "./errors";
