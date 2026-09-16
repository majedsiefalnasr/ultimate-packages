# @ultimate/mcp

MCP server exposing Ultimate component metadata and compatibility queries (Phase 8).

## Status

Shipped (Phase 8) — stdio-transport MCP server exposing 5 real tools. See `docs/architecture/ROADMAP.md` for full details.

## Usage

```bash
npx @ultimate/mcp
```

Runs the server over stdio — intended to be spawned by an MCP-aware AI coding tool, not invoked interactively.

## Scope

See `docs/superpowers/specs/2026-09-07-phase-8-mcp-design.md` for the full v1 contract, including explicit non-goals (HTTP transport, MCP resources/prompts, usage-examples/theme-token/CLI-discovery tools, and any Phase 9 Skills/LLM-context functionality — none of which this package implements).
