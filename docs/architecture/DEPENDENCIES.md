# Dependency Inventory

Classification model and direct-dependency facts established in Phase 0. Full transitive closure is deferred to CI/implementation as lockfiles are installed per package.

## Runtime — retained, legitimate framework ecosystem (never vendor)

| Package | Version range | Framework line |
|---|---|---|
| `@angular/core`, `common`, `forms`, `cdk`, `router`, `platform-browser` | `^21.x` | Angular (per PrimeNG 21.1.9 peer range) |
| `rxjs` | per Angular 21 peer range | Angular |
| `tslib` | per Angular 21 peer range | Angular |
| Vue 3.x | `^3.5.0` line | Vue (per PrimeVue 4.5.5 peer range) |
| `react`, `react-dom` | `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` | React |
| `react-transition-group` | per PrimeReact 10.9.9 | React (PrimeReact's only non-framework runtime dep) |

## UIX — candidates for Ultimate-owned adaptation (seed for `UltimateUIX`, not permanent external deps)

| Package | Pinned version | Ceiling (never exceed without license review) |
|---|---|---|
| `@primeuix/utils` | `0.7.2` | `0.7.2` |
| `@primeuix/styled` | `0.7.4` | `0.7.4` |
| `@primeuix/styles` | `2.0.3` | `2.0.3` |
| `@primeuix/motion` | `0.0.10` | `0.0.10` |

## Build-time only — not shipped

- `ng-packagr`, `@angular/cli` (Angular line)
- PrimeVue's pnpm-based build chain
- PrimeReact's `rollup` + `gulp` build

## Must remain external — never vendor

`@angular/*`, `react`, `vue`, `rxjs`, `tslib` — the no-Prime-runtime-dependency rule targets Prime/PrimeUIX packages specifically, not the underlying frameworks.

## Excluded — out of scope for Phase 0 core

`@primeuix/forms` (not a runtime dep of PrimeNG 21.1.9 or PrimeVue 4.5.5), `@primeuix/themes` (theme layer is a separate Phase 5 concern), `@primeuix/mcp` (standalone MCP server tool — depends on `zod` and `@modelcontextprotocol/sdk`, unrelated to UI component runtime).

## Flagged exclusion — copy-paste risk

PrimeReact's repository root is its Next.js showcase app. Its dependencies (`next`, `chart.js`, `docsearch`, `xlsx`, `primeflex`, `quill`, `jspdf`, etc.) belong to the demo site, not the library, and must never be pulled into Ultimate's dependency tree during Phase 3 migration. Migrate only the library source directory (`components/lib`), never the showcase app's `package.json`.
