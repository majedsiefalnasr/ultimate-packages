// packages/mcp/src/manifest-path.ts
//
// This file's ONLY job is to hold the manifest's resolved absolute path as
// a separately-importable constant, so test/manifest.test.ts can mock it in
// isolation (via vi.doMock) without needing to mock node:fs's readFileSync
// for the "malformed content" case (only the "file does not exist" case
// needs the fs-level mock).
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// This file lives at <repo-root>/packages/mcp/src/manifest-path.ts — resolve
// relative to THIS file's location (not process.cwd(), which varies by
// invocation context), matching the exact convention already established by
// @ultimate/component-schema/src/validate.ts's own REPO_ROOT resolution.
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");

export const COMPATIBILITY_MANIFEST_PATH = join(
  REPO_ROOT,
  "docs",
  "architecture",
  "compatibility-manifest.json"
);
