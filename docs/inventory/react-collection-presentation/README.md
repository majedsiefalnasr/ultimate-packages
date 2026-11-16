# React collection presentation and transfer inventory (#135)

## Read and maintain

Start with the [generated index](index.md) and [scoped validation](validation.md). Five family records account for 25 scoped files: 15 owned component, barrel and style files, and 10 supporting specs and stories excluded with reasons. Family names bound the scope rather than determining the product count.

The authored input is `scripts/inventory/react-collection-presentation.json`. Edit it rather than generated detail pages. The pilot generator reconciles public barrel exports, source ownership, evidence and relationships. Each family is exported from the package root barrel and from a `./<family>` manifest subpath with the same named surface; declared distribution paths do not establish publication. The family `index.ts` of data-view, order-list, organization-chart and pick-list star-exports the component file, so their entries map to that file; timeline re-exports `UTimeline` and the `UTimelineProps` type explicitly. Style modules are source exports of their style files and are not exposed by the family barrels.

All five use React core base and styling and have Aura preset registrations. Data-view composes the paginator owned by #132; organization-chart uses the `SelectionMode` type from UIX data. Order-list and pick-list implement their own listbox markup and do not import the listbox component. No component-metadata record or UIX style entry exists for these families in this revision. The paginator identity is already recorded by the completed #132 scope; remaining external identities stay with their owning tickets. Prime references in source are provenance context, without parity judgments.

## Executed inventory verification

Source revision: `3864a1d23b5ef0c5601ff740c104fdec4584d14d`. Product sources were not changed. Commands use Node v24.15.0.

- `node --test scripts/inventory/react-collection-presentation.test.mjs` checks file accounting, public entries, declarations, evidence, ownership, references and deterministic generated views.
- `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-collection-presentation.json --out docs/inventory/react-collection-presentation` regenerates scoped views without replacing authored input or this README.
- Inventory checks do not verify rendered product behavior. No TypeScript source was changed.

## Product execution and CI configuration

The standard bounded Vitest command is blocked by the host ancestor `/Users/majedsiefalnasr/postcss.config.mjs`, which requires the missing `postcss-import` (see the React table inventory, #132). The run therefore used a temporary configuration, copied into `packages/react`, then removed and never committed:

```sh
NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/data-view src/order-list src/organization-chart src/pick-list src/timeline --config vitest-react135.tmp.config.mjs --maxWorkers=1 --no-file-parallelism
```

The configuration was `export default { css: { postcss: { plugins: [] } }, test: { environment: "jsdom", globals: true, setupFiles: ["./vitest.setup.ts"] } };`. Workspace dependencies were already built. Vitest 2.1.9 on Node v24.15.0 passed 63 tests across five files: pick-list 30, order-list 13, data-view 10, organization-chart 5 and timeline 5. The override excludes PostCSS plugin processing. The [captured run](product-run.json) records the command and source revision; it does not establish browser, visual or exhaustive behavior.

The configured non-docs CI Test step invokes root `pnpm run test`, recursively including React's `vitest run`, conditional on its workflow dependencies and scope. This describes configuration only: no remote run was observed and no branch-protection claim is made. `test:scripts` covers provenance tests, not inventory tests.

## Source observations, not repaired

Data-view accepts `loadingIcon` as a React node but has no filter. Order-list and pick-list each carry private `MatchMode`, `field` and `matches` helpers whose query handling differs (order-list accepts an array for `in`, pick-list a comma-separated string), and data-view carries its own `field`. Timeline accepts `align` but its style module reads only `layout`. Organization-chart nodes are keyed by index. These are descriptions of the present implementation, not product repairs, parity judgments or a request to change behavior.
