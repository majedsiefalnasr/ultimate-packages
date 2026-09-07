# Phase Roadmap

Restated from Blueprint §35. See individual phase specs (`docs/superpowers/specs/`) for implementation-ready detail as each phase begins.

| Phase | Name                                                      | Status        |
| ----- | --------------------------------------------------------- | ------------- |
| 0     | Repository Foundation, Provenance & Baseline Verification | Complete      |
| 1     | UltimateUIX Foundation                                    | Complete      |
| 2     | UltimateNG                                                | Complete      |
| 3     | UltimateReact                                             | Complete      |
| 4     | UltimateVue                                               | Complete      |
| 5     | Themes                                                    | Complete [^1] |
| 6     | Component Metadata                                        | Complete [^2] |
| 7     | CLI                                                       | Complete [^3] |
| 8     | MCP                                                       | Not started   |
| 9     | AI Skills and LLM Context                                 | Not started   |
| 10    | Production Hardening                                      | Not started   |

[^1]: Cross-framework theme consistency is proven end-to-end for Vue and Angular. React's components under `packages/react/src/` do not yet source their CSS from `@ultimate/uix-styles` (they use hand-written static CSS with no `dt()` calls), so React's token resolution is proven at the `react-core` registration layer rather than through a real component's CSS. This is a pre-existing content gap in `packages/react`, not a defect in the theme pipeline; see `packages/themes/test/cross-framework-consistency.test.ts` and `packages/themes/README.md` (Scope) for detail.

[^2]: The `ComponentMetadata` schema (`@ultimate/component-schema`) and a real, source-verified metadata proof set (`@ultimate/component-metadata`) are complete for 8 components — Button, Checkbox, Dialog, Menu, Tooltip, Paginator, Scroller, Table — across Angular/React/Vue. This is the closed proof set this plan scoped itself to, not the full ~115-component `COMPONENT_INVENTORY.md` backlog; migrating the remaining inventory into this schema is future work, not part of this plan's scope.

[^3]: `@ultimate/cli` (`packages/cli`) ships five real commands — `init` (existing-project-only; detects the consumer's framework, resolves and installs the compatible `@ultimate/*` framework package via the compatibility manifest, writes `ultimate.config.json`; never scaffolds a new project), `add <package>` (installs a named package after a compatibility check), `theme <preset>` (the sole real preset `@ultimate/themes` ships, `"aura"`; installs `@ultimate/themes` if absent and writes `ultimate.config.json` plus a dedicated theme entry file calling the real `applyUltimateTheme()`), `doctor` (reports against the exact real 8-component `ALL_COMPONENTS` proof set — Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip — never implying broader coverage), and `generate <component>` (stdout-only import+usage snippet from real metadata; never writes files) — plus an `ai` stub that prints an unavailable message and exits non-zero. `create`, `migrate`, and `update` remain entirely unimplemented (not even stubbed), per spec §7.2/§7.3's explicit deferral. The CLI's compatibility manifest (`docs/architecture/compatibility-manifest.json`) covers 3 frameworks (Angular/React/Vue) across 6 evaluated axes (framework version, Ultimate framework package version, UIX version, theme version, exact metadata schema version, CLI version) plus 2 reserved, unpopulated axes (MCP, AI/Skills — excluded from all v1 compatibility evaluation per spec §6.3/§6.5). This manifest is a new, separate artifact; `docs/architecture/COMPATIBILITY.md` was not modified. CI gained two new gates: `compatibility-manifest:validate` and `boundary:validate:cli` (the latter enforces the dependency direction bidirectionally — the CLI never depends on `@ultimate/ng`/`react`/`vue`/`themes`, and none of those packages depend on the CLI).
