# Vue table and viewport data inventory (#133)

## Scope and maintenance

Start with the [generated index](index.md) and [scoped validation](validation.md). Three family records account for all 21 scoped files: 12 implementation, base, barrel and style files are owned, and nine specs, stories and API documents are excluded with reasons. Root and secondary entries expose each component and its base factory, for 12 entry-qualified exports. Declared distribution exports do not establish publication. No pilot record duplicates these families. Edit `scripts/inventory/vue-table-viewport.json`, not generated pages.

UTable composes UPaginator and UScroller. Source-only style modules and local table helpers are attributed to their family. Foundation, metadata, theme and UIX identities are pending their respective batches. Aura registers paginator; a table or scroller Aura key is not asserted. Prime references are neutral provenance, not a parity assessment.

## Product execution

Source revision: `3864a1d23b5ef0c5601ff740c104fdec4584d14d`. Node 24.15.0 and Vitest 2.1.9 were used. `pnpm --filter '@ultimate/vue^...' --if-present run build` completed successfully as a prerequisite. The standard bounded command, `NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/table/ src/paginator/ src/scroller/ --maxWorkers=1 --no-file-parallelism`, failed before assertions because the host ancestor `/Users/majedsiefalnasr/postcss.config.mjs` requires missing `postcss-import`. The same scoped specs passed with a temporary config outside the repository:

```sh
NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/table/ src/paginator/ src/scroller/ --config /tmp/vitest-vue133.config.mjs --maxWorkers=1 --no-file-parallelism
```

The override supplies the Vue plugin, jsdom, globals, and `css.postcss.plugins=[]`. Three files and 97 tests passed. The override bypasses PostCSS plugins, so it does not verify PostCSS processing or visual CSS. See [product-run.json](product-run.json) for the matching recorded run. No remote CI run was observed. The existing conditional non-docs CI Test step calls the root test script, which includes the Vue tests; that is workflow configuration, not evidence of a remote run. Inventory Node tests are not included in the provenance-only `test:scripts` glob.

## Inventory verification

Run `node --test scripts/inventory/vue-table-viewport.test.mjs` and `node --test scripts/inventory/*.test.mjs`. Generate and validate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-table-viewport.json --out docs/inventory/vue-table-viewport`; repeat generation to check byte stability. This bounded discovery checks files, mapped named exports and anchors; authored interpretations require review and do not assert platform completeness. No TypeScript source is changed.
