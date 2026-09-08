# @ultimate/ai

Generation and validation tooling for Ultimate Skills and LLM context (Phase 9).

## Status

v1 — build-time generator + validator. Produces one Skill file per component under repo-root `skills/`, and 5 deterministic LLM-context files (`llms.txt`, `llms-full.txt`, `llms-ng.txt`, `llms-react.txt`, `llms-vue.txt`) under `dist/context/`. Reads `@ultimate/component-metadata`'s real 8-component `ALL_COMPONENTS` set directly. Depends on exactly `@ultimate/component-metadata` and `@ultimate/component-schema` — no dependency on `@ultimate/cli`, `@ultimate/mcp`, `@ultimate/ng`, `@ultimate/react`, `@ultimate/vue`, or `@ultimate/themes`, in either direction (see `docs/superpowers/specs/2026-09-07-phase-9-ai-skills-llm-context-design.md` §4/§9, enforced by `scripts/provenance/validate-ai-boundary.mjs`).

## Usage

```bash
npx ultimate-ai-generate [skillsDir] [contextDir]
npx ultimate-ai-validate [skillsDir]
```

Build-time tooling — not a runtime service, not an MCP-style query interface. See `docs/superpowers/specs/2026-09-07-phase-9-ai-skills-llm-context-design.md` §7.2.

## Scope

See the spec for the full v1 contract, including explicit non-goals (project-aware context, an `examples` metadata field, any MCP/CLI dependency edge, a runtime service, LLM-generated Skill prose, semantic prose validation — none of which this package implements).
