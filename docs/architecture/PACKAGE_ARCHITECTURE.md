# Package Architecture

Package roles and dependency boundaries. This file states rules, not current state: it carries no counts, phase labels or status. For what a package contains today, read its `README.md` and source. Intent and governance live in `BLUEPRINT.md` sections 4 to 6.

## Runtime dependency direction (Blueprint section 6)

```text
Framework Components
        down to
Framework Core
        down to
UltimateUIX
```

AI and developer tooling consume platform knowledge. Runtime components must not depend on `cli`, `mcp` or `ai`.

## Package roles

- **Shared UIX packages** (`packages/uix*`): utilities, styling runtime, style resolution, motion, data and shared theme infrastructure. Must not contain framework-specific rendering logic. CI enforces this with `scripts/provenance/validate-boundaries.mjs`.
- **Shared component styles** (`packages/uix-styles`): a family's structural style is one module here by default, consumed by all three frameworks (ADR-082). A style stays framework-local only with a recorded reason in the family ticket and the family's provenance record.
- **Framework core packages** (`packages/{ng,react,vue}-core`): base component behavior, framework lifecycle integration and framework-native event and input mechanisms.
- **Framework component packages** (`packages/{ng,react,vue}`): components, public framework APIs and component-specific tests.
- **Theme package** (`packages/themes`): tokens, semantic values, variants, light and dark modes, and presets.
- **Metadata packages** (`packages/component-schema`, `packages/component-metadata`): schema, component metadata and API information.
- **CLI** (`packages/cli`): orchestration only. It never replaces official framework tooling.
- **MCP** (`packages/mcp`): optional tooling. Never a runtime dependency.
- **AI** (`packages/ai`): AI-oriented context generation and Skills packaging.

Package names remain provisional per Blueprint section 34 and section 43.
