# AI/Tooling Architecture Constraints

Restated from Blueprint §14/§2.6/§2.7/§6. Phase 0 preserves these constraints architecturally without implementing them.

## Constraints

- `packages/cli`, `packages/mcp`, `packages/ai` are reserved as directory scaffolding only in Phase 0 — no implementation.
- These packages must never become a runtime dependency of `packages/{uix,ng,react,vue}*` — enforced by CI package-boundary check.
- Component metadata (Phase 6+) is expected to live in `packages/component-schema` and `packages/component-metadata`, consumed by `cli`/`mcp`/`ai`/`skills`.

## AI/tooling dependency direction (Blueprint §6)

```text
Component Source
      +
Component Metadata
      +
Documentation
      down to
CLI / MCP / AI / Skills / LLM outputs
```

Prohibited direction: `Ultimate Components -> CLI -> MCP -> AI`. AI and developer tooling must consume platform knowledge; runtime components must not depend on those tools.

## Prior art noted for later phases

PrimeVue 4.5.5 already ships its own `mcp` and `metadata` sibling packages — useful prior art to review during Phase 6/8 planning. No action taken in Phase 0.
