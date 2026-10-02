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
- **Framework core packages** (`packages/{ng,react,vue}-core`): base component behavior, framework lifecycle integration, framework-native event/input mechanisms. `packages/ng-core` is active as of Phase 2 — see `packages/ng-core/README.md` for its `UBaseComponent`/`UBaseEditableHolder` hierarchy, overlay/focus-trap infrastructure, icons, and minimal config. `packages/react-core` is active as of Phase 3 — see `packages/react-core/README.md` for its `useComponentBase` hierarchy, overlay/focus-trap infrastructure, and minimal config. `packages/vue-core` is active as of Phase 4 — see `packages/vue-core/README.md` for its `BaseComponent`/`BaseEditableHolder`/`BaseInput`/`BaseDirective` architecture.
- **Framework component packages** (`packages/{ng,react,vue}`): actual components, public framework APIs, component-specific tests. `packages/ng` is active as of Phase 2 — see `packages/ng/README.md` for its 5-component proof set (Button, Checkbox, Dialog, Menu, Tooltip). `packages/react` is active as of Phase 3 — see `packages/react/README.md` for its 5-component proof set (Button, Checkbox, Dialog, Menu, Tooltip). `packages/vue` is active as of Phase 4 — see `packages/vue/README.md` for its 5-component proof set (Button, Checkbox, Dialog, Menu, Tooltip) plus `v-ripple` and `v-tooltip` directives.
- **Theme packages** (`packages/themes`): tokens, semantic values, variants, light/dark modes. `packages/themes` is active as of Phase 5 — see `packages/themes/README.md` for its theme contract, `auraPreset` (76 component modules after GAP-064's Batches 1-3 tranche; originally the five-component proof set: Button, Checkbox, Dialog, Menu, Tooltip), and `applyUltimateTheme()` entry point.
- **Metadata packages** (`packages/component-schema`, `packages/component-metadata`): schema, component metadata, API information. Deferred to Phase 6.
- **CLI** (`packages/cli`): orchestration only, never replaces official framework tooling. Deferred to Phase 7.
- **MCP** (`packages/mcp`): optional, never a runtime dependency. Deferred to Phase 8.
- **AI** (`packages/ai`): AI-oriented context generation, Skills packaging. Deferred to Phase 9.

All package names remain provisional per Blueprint §34 until npm availability, internal conventions, and long-term clarity are validated — not finalized by Phase 0.
