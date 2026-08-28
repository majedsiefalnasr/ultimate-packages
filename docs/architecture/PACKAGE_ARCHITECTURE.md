# Package Architecture

Records the approved Phase 0 monorepo package boundaries (Blueprint §4/§5, validated by Phase 0 spec Repository Requirements).

## Runtime dependency direction (Blueprint §6)

```text
Framework Components
        down to
Framework Core
        down to
UltimateUIX
```

## Package boundaries

- **Shared UIX packages** (`packages/uix*`): utilities, styling runtime, style resolution, motion, shared theme infrastructure. Must not contain framework-specific rendering logic — enforced by CI (`scripts/provenance/validate-boundaries.mjs`).
- **Framework core packages** (`packages/{ng,react,vue}-core`): base component behavior, framework lifecycle integration, framework-native event/input mechanisms.
- **Framework component packages** (`packages/{ng,react,vue}`): actual components, public framework APIs, component-specific tests.
- **Theme packages** (`packages/themes`): tokens, semantic values, variants, light/dark modes. Deferred to Phase 5.
- **Metadata packages** (`packages/component-schema`, `packages/component-metadata`): schema, component metadata, API information. Deferred to Phase 6.
- **CLI** (`packages/cli`): orchestration only, never replaces official framework tooling. Deferred to Phase 7.
- **MCP** (`packages/mcp`): optional, never a runtime dependency. Deferred to Phase 8.
- **AI** (`packages/ai`): AI-oriented context generation, Skills packaging. Deferred to Phase 9.

All package names remain provisional per Blueprint §34 until npm availability, internal conventions, and long-term clarity are validated — not finalized by Phase 0.
