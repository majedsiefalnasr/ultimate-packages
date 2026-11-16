# Vue collection presentation and transfer inventory (#136)

## Scope and maintenance

Start with the [generated index](index.md) and [scoped validation](validation.md). Five family records account for 30 scoped files: 20 owned component, base factory, barrel and style files, and 10 supporting specs and stories excluded with reasons. Family names bound the scope rather than determining the product count. Edit `scripts/inventory/vue-collection-presentation.json`, not generated pages.

Each family is exported from the package root barrel and from a `./<family>` manifest subpath with the same named surface; declared distribution paths do not establish publication. Family barrels export the `.vue` component. Only timeline also exports its base factory `createBaseTimeline`; the other base factories and all style modules are source files that the barrels do not expose.

All five use Vue core base and styling and have Aura preset registrations. Data-view composes the paginator, and order-list and pick-list compose the listbox; those identities are already recorded by the completed #133 and #118 scopes. Organization-chart uses the `SelectionMode` type from UIX data. No component-metadata record or UIX style entry exists for these families in this revision. Remaining external identities stay with their owning tickets. Prime references in source are provenance context, without parity judgments.

## Product execution

Source revision: `3864a1d23b5ef0c5601ff740c104fdec4584d14d`. Product sources were not changed. Commands use Node v24.15.0 and Vitest 2.1.9. Workspace dependencies were already built. The run used the committed `scripts/inventory/vue-disclosure-vitest.config.mjs`, which extends the Vue package config with `css.postcss.plugins=[]` because the host ancestor `/Users/majedsiefalnasr/postcss.config.mjs` requires the missing `postcss-import` (see #133):

```sh
NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/data-view src/order-list src/organization-chart src/pick-list src/timeline --config ../../scripts/inventory/vue-disclosure-vitest.config.mjs --maxWorkers=1 --no-file-parallelism
```

Five files and 52 tests passed: pick-list 22, order-list 14, data-view 6, organization-chart 5 and timeline 5. The override excludes PostCSS plugin processing. The [captured run](product-run.json) does not establish browser, visual or exhaustive behavior.

The configured non-docs CI Test step invokes root `pnpm run test`, which includes the Vue test script, conditional on its workflow dependencies and scope. This describes configuration only: no remote run was observed and no branch-protection claim is made. `test:scripts` covers provenance tests, not inventory tests.

## Inventory verification

Run `node --test scripts/inventory/vue-collection-presentation.test.mjs` and `node --test scripts/inventory/*.test.mjs`. Regenerate scoped views with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-collection-presentation.json --out docs/inventory/vue-collection-presentation`; this does not replace authored input or this README. Inventory checks do not verify rendered product behavior.

## Source observations, not repaired

Data-view declares no filter and renders items as interpolated text of `itemTemplate`. Order-list and pick-list each carry their own selection, move and identity logic. Timeline accepts `align` but its style module reads only `layout`, and its events are keyed by index. These are descriptions of the present implementation, not product repairs, parity judgments or a request to change behavior.
