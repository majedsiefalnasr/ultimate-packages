# React table and viewport data inventory (#132)

## Read and maintain

Start with the [generated index](index.md) and [scoped reconciliation](validation.md). Four family records account for 23 scoped files: 12 owned implementation, barrel and style files, and 11 supporting specs, stories and API documents excluded with reasons. Family names bound the scope rather than determining the product count. No pilot record covers these families.

The authored input is `scripts/inventory/react-table-viewport.json`. Edit it rather than generated detail pages. The pilot generator reconciles public barrel exports, source ownership, evidence and relationships. Root and secondary package entry points expose the same named surface; declared distribution paths do not establish publication. `UTableSortEvent` and the style modules are source exports that the family barrels do not expose.

Table composes paginator and scroller. All four use React core base and styling; table, paginator and scroller use shared UIX data and style sources, and table also uses UIX object utilities. Aura registers paginator; no matching registration was found for the other three. Component metadata references the React table, paginator and scroller sources; no dedicated data-scroller metadata record was found. External identities remain pending under their owning tickets. Metadata and theme registrations do not establish runtime integration or rendered appearance. Prime references in source are provenance context, without parity judgments.

## Executed inventory verification

Source revision: `3864a1d23b5ef0c5601ff740c104fdec4584d14d`. Product sources were not changed. Commands use Node v24.15.0.

- `node --test scripts/inventory/react-table-viewport.test.mjs` checks file accounting, public entries, declarations, evidence, ownership, references and deterministic generated views.
- `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-table-viewport.json --out docs/inventory/react-table-viewport` regenerates scoped views without replacing authored input or this README.
- Inventory checks do not verify rendered product behavior. No TypeScript source was changed.

## Product execution and CI configuration

The standard bounded Vitest command stopped before assertions because the host ancestor `/Users/majedsiefalnasr/postcss.config.mjs` requires missing `postcss-import`. A first retry with a temporary PostCSS override also stopped before collection because the `@ultimate/react-core` package entry had not been built. `pnpm --filter '@ultimate/react^...' run build` then passed, after which the following command passed:

```sh
NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/table/ src/paginator/ src/scroller/ src/data-scroller/ --config /tmp/vitest-react132.config.mjs --maxWorkers=1 --no-file-parallelism
```

The temporary configuration was `export default { css: { postcss: { plugins: [] } }, test: { environment: "jsdom", globals: true, setupFiles: ["./vitest.setup.ts"] } };`. Vitest 2.1.9 on Node v24.15.0 passed 103 tests across four files: table 70, paginator 7, scroller 20 and data-scroller 6. The override excludes PostCSS plugin processing. The [captured run](product-run.json) records the command and source revision; it does not establish browser, visual or exhaustive behavior.

The configured non-docs CI Test step invokes root `pnpm run test`, recursively including React's `vitest run`, conditional on its workflow dependencies and scope. This describes configuration only: no remote run was observed and no branch-protection claim is made. `test:scripts` covers provenance tests, not inventory tests.

## Source observations, not repaired

Table accepts `onFilter`, `cellEditValidator`, `onCellEditComplete` and `onCellEditCancel` without invoking them. Its custom filter mode returns false. Its virtualized row keyboard navigation is limited to mounted rows. Data-scroller accumulates loaded items independently of scroller's windowed rendering. These observations do not constitute a new product test or a request to repair behavior.
