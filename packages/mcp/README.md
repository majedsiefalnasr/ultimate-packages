# @ultimate/mcp

MCP server exposing Ultimate component metadata and compatibility queries (Phase 8).

## Status

v1 — stdio-transport MCP server, 5 tools: `search_components`, `get_component`, `get_component_api`, `get_component_accessibility`, `check_framework_compatibility`. Reads `@ultimate/component-metadata`'s real 8-component `ALL_COMPONENTS` set and `docs/architecture/compatibility-manifest.json` directly. Depends on exactly two Ultimate packages: `@ultimate/component-metadata` and `@ultimate/component-schema` — in particular, has no dependency on `@ultimate/cli`, `@ultimate/ng`, `@ultimate/react`, `@ultimate/vue`, or `@ultimate/themes`, in either direction (see `docs/superpowers/specs/2026-09-07-phase-8-mcp-design.md` §5.2, enforced by `scripts/provenance/validate-mcp-boundary.mjs`).

## Usage

```bash
npx @ultimate/mcp
```

Runs the server over stdio — intended to be spawned by an MCP-aware AI coding tool, not invoked interactively.

## Scope

See `docs/superpowers/specs/2026-09-07-phase-8-mcp-design.md` for the full v1 contract, including explicit non-goals (HTTP transport, MCP resources/prompts, usage-examples/theme-token/CLI-discovery tools, and any Phase 9 Skills/LLM-context functionality — none of which this package implements).
