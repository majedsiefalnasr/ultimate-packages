# Root files inventory (#157)

Source revision: `70b74575698fb77a72a18022b91181c66df41484`. Authored input: [`scripts/inventory/root-files.json`](../../../scripts/inventory/root-files.json) (scope `root-files-157`). Evidence below was observed by reading the files and running read-only checks; no product source was changed.

## Why these files are uncovered

`scripts/inventory/packages.mjs` groups package files into families; files directly under the package directory or `src/` form `<package>.root`. Four such families exist (`package.ultimate.{ng,react,vue,uix-utils}.root`). No batch lists these seven files in a record's `files` or in a disposition (checked by search across `scripts/inventory/*.json`; other batches only cite `index.ts` lines as evidence anchors).

## Disposition per file (records: none)

All seven are supporting dispositions. None is a product item under #98 (components, utilities with own exports, schemas), and a record for a barrel would duplicate the public exports owned by family batches.

| File                              | Kind                                  | Evidence                                                                                                                                                                                                   |
| --------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ng/angular.json`        | Build/test/Storybook workspace config | One project `ng`, targets build (`@angular/build:ng-packagr`, `ng-package.json`), test, storybook, build-storybook; run via `ng test --project=ng` and `ng run ng:storybook` in `packages/ng/package.json` |
| `packages/ng/src/index.ts`        | Root barrel                           | 88 `export * from`, 0 other lines; all targets resolve; `ng-package.json` `lib.entryFile` is `src/index.ts`; `.` entry maps here                                                                           |
| `packages/react/src/index.ts`     | Root barrel                           | 86 `export * from`, 0 other lines; all resolve; no `src` subdirectory missing from it                                                                                                                      |
| `packages/react/vitest.setup.ts`  | Test support                          | Single import `@testing-library/jest-dom/vitest`; `vitest.config.ts` `setupFiles: ["./vitest.setup.ts"]`                                                                                                   |
| `packages/vue/src/index.ts`       | Root barrel                           | 94 `export * from`, 0 other lines; all resolve; no `src` subdirectory missing from it                                                                                                                      |
| `packages/vue/src/shims-vue.d.ts` | Ambient type shim                     | `declare module "*.vue"` as `DefineComponent`; `tsconfig.json` `include: ["src"]`; 108 `.vue` files under `src`, imported from family `index.ts` files (e.g. `src/tabs/index.ts`)                          |
| `packages/uix-utils/src/index.ts` | Root barrel                           | 9 `export * from` (classnames, dom, escape, eventbus, mergeprops, object, scroll-lock, uuid, zindex), all resolve; symbols owned by #143/#144                                                              |

## Findings

- **ng barrel gap (fact):** `packages/ng/src/index.ts` does not re-export `./input-number`, although `packages/ng/src/input-number/index.ts` exists and `packages/ng/package.json` exports `./input-number`. Intent is not documented; reachable only via `@ultimate/ng/input-number`. Not changed here.
- The ng barrel mixes `@ultimate/ng/<name>` self-package specifiers with relative `./<name>` ones (button, input-text, textarea, select-button, file-upload, dialog, menu, drawer, confirm-dialog, confirm-popup, dynamic-dialog, overlay-badge, split-button, table, panel, scroll-top, order-list, pick-list, data-view). Inconsistent, not a defect claim.
- No aliases are declared: `package.ultimate.*.root` is a topology identity owned by 12 (ng/react/vue) or 2 (uix-utils) tickets, and `global.mjs` rejects a single alias for a multi-owner identity. Aliasing it to one record would be a false alias.

## Limitations

See [validation.md](validation.md): the current tooling cannot validate or reconcile this batch. Claims here are source-reading evidence only; nothing was executed against built artifacts.
