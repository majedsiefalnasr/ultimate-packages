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
| 6     | Component Metadata                                        | Not started   |
| 7     | CLI                                                       | Not started   |
| 8     | MCP                                                       | Not started   |
| 9     | AI Skills and LLM Context                                 | Not started   |
| 10    | Production Hardening                                      | Not started   |

[^1]: Cross-framework theme consistency is proven end-to-end for Vue and Angular. React's components under `packages/react/src/` do not yet source their CSS from `@ultimate/uix-styles` (they use hand-written static CSS with no `dt()` calls), so React's token resolution is proven at the `react-core` registration layer rather than through a real component's CSS. This is a pre-existing content gap in `packages/react`, not a defect in the theme pipeline; see `packages/themes/test/cross-framework-consistency.test.ts` and `packages/themes/README.md` (Scope) for detail.
