# Ultimate Packages

Cross-framework UI component packages for the Ultimate Platform: Angular, React, and Vue component libraries built on shared, framework-neutral foundations for styling, theming, motion, and data semantics.

Ultimate owns its source, public API, package architecture, tooling, and metadata. It started from selected MIT-licensed Prime ecosystem source baselines (PrimeNG, PrimeReact, PrimeVue, and `@primeuix/*`), but it is not a fork and has no runtime dependency on any Prime package. See [`docs/architecture/BLUEPRINT.md`](docs/architecture/BLUEPRINT.md) for the full architecture baseline.

## Status

Pre-release. Every package is at version `0.1.0`, and nothing has been published to npm yet; unreleased consumer-facing changes are collected in [`docs/architecture/MIGRATION.md`](docs/architecture/MIGRATION.md).

Current work, open gaps, and decisions are tracked in the repository itself:

- [`docs/architecture/ROADMAP.md`](docs/architecture/ROADMAP.md) — phase status
- [`docs/architecture/BLUEPRINT_GAPS.md`](docs/architecture/BLUEPRINT_GAPS.md) — gap registry and open architectural decisions
- [`docs/architecture/COMPONENT_INVENTORY.md`](docs/architecture/COMPONENT_INVENTORY.md) — component coverage

The `ci` workflow runs every gate and reports each step on its own. Some gates currently fail on known, pre-existing repository debt, so a red job does not by itself mean a regression; check the individual step results.

## Prime parity

Component behavior is measured against the last MIT-licensed Prime releases — PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5, and the pinned `@primeuix/*` versions ([ADR-048](docs/architecture/DECISIONS.md)). Differences found by the parity audit are registered and resolved as gaps in [`BLUEPRINT_GAPS.md`](docs/architecture/BLUEPRINT_GAPS.md). Framework-native differences that are intentional are recorded there too, so they are not "fixed" for false parity.

## What the repository focuses on

- **Reusable components** for Angular, React, and Vue, each implemented natively for its framework rather than wrapped from another.
- **Cross-framework consistency** through shared framework-neutral packages and a common Aura-based theme preset.
- **Accessibility**: Playwright browser suites run axe-core scans and visual-regression checks on the Storybook stories they cover, in Chromium, Firefox, and WebKit. Scan results are checked against a committed [accessibility baseline](docs/architecture/ACCESSIBILITY_BASELINE.md). The suites currently cover a subset of components.
- **Theming and styling** through `@ultimate/themes` and the `@ultimate/uix-styled` token engine. Per-component token coverage is still partial; see GAP-064.
- **SSR**: per-framework server-rendering and hydration harnesses. Angular emits component styles into server-rendered HTML; React and Vue inject styles on the client.
- **Package quality**: CI gates for bundle size, coverage, pack/install integrity, package boundaries, licenses, dependency audit, SAST, and provenance.

## Packages

| Package                                                           | Purpose                                                                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `@ultimate/ng`, `@ultimate/react`, `@ultimate/vue`                | Component libraries, with per-component subpath exports                                  |
| `@ultimate/ng-core`, `@ultimate/react-core`, `@ultimate/vue-core` | Framework foundations: base components, overlay, focus management, style registration    |
| `@ultimate/uix-utils`                                             | Framework-neutral utility functions                                                      |
| `@ultimate/uix-styled`                                            | Theme and preset resolution engine                                                       |
| `@ultimate/uix-styles`                                            | Global and base CSS infrastructure                                                       |
| `@ultimate/uix-motion`                                            | Enter/leave transitions that respect `prefers-reduced-motion`                            |
| `@ultimate/uix-data`                                              | Shared data-component semantics (identity, selection, sorting, filtering)                |
| `@ultimate/themes`                                                | Framework-neutral theme contract and the Aura preset                                     |
| `@ultimate/component-schema`, `@ultimate/component-metadata`      | Versioned component metadata schema and source-verified records                          |
| `@ultimate/cli`                                                   | CLI (`init`, `add`, `theme`, `doctor`, `generate`)                                       |
| `@ultimate/mcp`                                                   | MCP server exposing component metadata and compatibility queries                         |
| `@ultimate/ai`                                                    | Generation and validation of Skill files and LLM context ([`skills/`](skills/README.md)) |

`apps/playground-angular`, `apps/playground-react`, and `apps/playground-vue` are the SSR/hydration verification harnesses. `apps/docs`, `apps/showcase`, `packages/uix`, and `tooling/` are empty placeholders.

```text
packages/   framework and shared packages
apps/       SSR playgrounds (docs and showcase are placeholders)
skills/     per-component Skill files and agent conventions
scripts/    provenance, validation, and CI gate scripts
docs/       architecture records, ADRs, research, specs, and plans
```

## Development

A pnpm workspace monorepo. Requires pnpm 9.6.0 (pinned through `packageManager`) and Node.js 24.15.0, the version CI uses. `pnpm install` enforces dependency engine ranges, and the Angular Storybook toolchain needs Node `^22.22.3` or `^24.15.0`.

```bash
pnpm install
pnpm run build       # build all packages
pnpm run typecheck   # run after build; packages resolve each other through dist
pnpm run test        # unit tests
pnpm run validate    # generated-artifact checks, including the Vue consumer type-check
pnpm run lint
pnpm run format:check
```

Browser, visual, and accessibility tests use Storybook and Playwright:

```bash
pnpm run storybook:ng      # also storybook:react, storybook:vue
pnpm run playwright:install-browsers
npx playwright test --project=vue-chromium   # projects are defined in playwright.config.ts
```

Other gates that CI runs are available as root scripts, for example `size:validate`, `coverage:validate`, `provenance:validate`, `boundary:validate`, and `integrity:pack-install`. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the full list.

Contributors and AI agents should start with [`AGENTS.md`](AGENTS.md): it sets out the source-of-truth hierarchy and the gated workflow (research, decision, spec, plan, implementation, review) used for every change.

## Documentation

- [Architecture blueprint](docs/architecture/BLUEPRINT.md) and [decision records](docs/architecture/DECISIONS.md)
- [Package architecture](docs/architecture/PACKAGE_ARCHITECTURE.md) and [compatibility](docs/architecture/COMPATIBILITY.md)
- [Performance and size baselines](docs/architecture/PERFORMANCE.md)
- [Migration and release process](docs/architecture/MIGRATION.md)
- [Security policy](SECURITY.md) and [changelog](CHANGELOG.md)

## Provenance and license

Every Prime-derived source area is recorded in [`docs/architecture/PROVENANCE.md`](docs/architecture/PROVENANCE.md) with its exact upstream version, commit SHA or tarball integrity hash, original license, and copyright holder; per-file records are in `docs/architecture/provenance/`.

Ultimate-authored code is licensed under the terms in [`LICENSE`](LICENSE) (MIT). Prime-derived source keeps its original MIT license and copyright notice, in the `THIRD-PARTY-NOTICES.md` file of each package that incorporates it.
