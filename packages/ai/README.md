# @ultimate/ai

Generation and validation tooling for Ultimate Skills and LLM context (Phase 9).

## Status

Shipped (Phase 9) — real, tested generation/validation tooling. See `docs/architecture/ROADMAP.md` for full details.

## Usage

```bash
npx ultimate-ai-generate [skillsDir] [contextDir]
npx ultimate-ai-validate [skillsDir]
```

Build-time tooling — not a runtime service, not an MCP-style query interface. See `docs/superpowers/specs/2026-09-07-phase-9-ai-skills-llm-context-design.md` §7.2.

## Scope

See the spec for the full v1 contract, including explicit non-goals (project-aware context, an `examples` metadata field, any MCP/CLI dependency edge, a runtime service, LLM-generated Skill prose, semantic prose validation — none of which this package implements).
