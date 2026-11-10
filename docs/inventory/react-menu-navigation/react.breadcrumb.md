# React UBreadcrumb

ID: react.breadcrumb

Framework: react; availability: public

## Authored interpretation

Ordered breadcrumb navigation trail with an optional home link.

## Framework surface

UBreadcrumb forwards an HTMLElement ref to nav. UBreadcrumbProps: model defaults [], home, homeAriaLabel, onItemClick({originalEvent,item}), className. model/home reuse public UMenuItem as a type only; UBreadcrumb does not compose UMenu. Visible entries render an ol with chevron separators. Disabled clicks prevent default; enabled clicks call item.command then onItemClick and suppress navigation/propagation without a url. isCurrent is a non-exported component-local helper comparing url with window.location.pathname under an SSR guard. aria-current=page is applied to model links, not the home link (despite the source comment describing both). homeAriaLabel labels the home anchor. No custom hooks, factories, provider or directive are declared. breadcrumbStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. Each family uses useComponentBase from react-core/base, whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/breadcrumb expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers breadcrumb; its preset key matches componentName "breadcrumb"; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision.

## Public exports

@ultimate/react#UBreadcrumb
@ultimate/react/breadcrumb#UBreadcrumb
@ultimate/react#UBreadcrumbProps
@ultimate/react/breadcrumb#UBreadcrumbProps

## Owned source and evidence

packages/react/src/breadcrumb/breadcrumb-style.ts
packages/react/src/breadcrumb/breadcrumb.tsx
packages/react/src/breadcrumb/index.ts

```text
packages/react/src/breadcrumb/index.ts: export { UBreadcrumb } from "./breadcrumb";
packages/react/src/breadcrumb/breadcrumb.tsx: componentName: "breadcrumb"
packages/react/src/breadcrumb/breadcrumb-style.ts: export const breadcrumbStyleModule: StyleModule = { css, classes };
packages/react/src/index.ts: export * from "./breadcrumb";
packages/react/package.json: "./breadcrumb": {
packages/themes/src/presets/aura/index.ts:     breadcrumb,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/react/src/breadcrumb/breadcrumb.tsx: export interface UBreadcrumbProps {
packages/react/src/breadcrumb/breadcrumb.tsx: export const UBreadcrumb = React.forwardRef<HTMLElement, UBreadcrumbProps>(function UBreadcrumb(
packages/react/src/breadcrumb/breadcrumb.tsx: aria-current={isCurrent(item.url)}
packages/react/src/breadcrumb/breadcrumb.tsx: aria-label={homeAriaLabel}
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.breadcrumb → [react.breadcrumb](react.breadcrumb.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
react.menu

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Inspected component, types, owned composition and local style sources exist. Source interpretation and supporting spec presence are not passing runtime verification."
  },
  {
    "state": "unavailable",
    "behavior": "Bounded existing React product specifications were attempted, but the runner aborted before assertions.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/menu/ src/context-menu/ src/breadcrumb/ src/mega-menu/ src/menubar/ src/panel-menu/ src/tiered-menu/ src/dock/ src/speed-dial/ --maxWorkers=1 --no-file-parallelism",
    "outcome": "unavailable",
    "revision": "af79b2ec8b18681f0163d9ede0beba387c462258",
    "output": "Vitest 2.1.9 exited 1: Failed to load PostCSS config; Cannot find module 'postcss-import'; Require stack: /Users/majedsiefalnasr/postcss.config.mjs",
    "limitations": "Node v24.22.2 and pnpm 9.6.0; ancestor host PostCSS configuration prevents execution. No product assertions passed; no host or product repair attempted."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/react vitest run. Workflow configuration only, not an observed successful CI execution or branch-protection claim. test:scripts is provenance-only and does not include inventory tests.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); upstream dependencies may prevent execution. No remote CI observed."
  }
]
```
