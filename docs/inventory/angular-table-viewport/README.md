# Angular table and viewport data (#131)

Start with the [generated index](index.md) and [scoped validation](validation.md). Three family records account for 18 scoped files: nine owned component, barrel and style sources and nine explicitly excluded supporting specifications, stories and generated API documentation files. The three components and two exported interfaces yield nine entry-qualified exports. Family roots describe ownership, not a component count.

## Authorship and source boundaries

Edit `scripts/inventory/angular-table-viewport.json`, not generated detail pages. The pilot schema, generator and reconciliation checks are reused unchanged. Regenerate with:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-table-viewport.json --out docs/inventory/angular-table-viewport
```

The Angular sources reside in `packages/ng/src/{table,paginator,scroller}/`. Table's root barrel exports `UTable`, but there is no `./table` manifest entry and `UTableColumn` is source-only. Paginator and Scroller export their components and their event/context interfaces from root and secondary entries. Local style modules, constants and private/protected helpers belong to their family records. No pilot record covers these families. The three `package.ultimate.ng.<family>` identities alias these local records for #131; external foundations, style, metadata and preset identities remain explicitly pending their owning tickets.

All three extend `UBaseComponent` and use shared UIX styles. Paginator is registered in Aura; no Table or Scroller registry entry is inferred. Metadata records refer to each Angular source; generated API MDX is supporting material rather than an extra runtime export. Manifest targets establish declared availability, not publication or artifact integrity. Prime references are neutral provenance, without parity judgments.

## Executed inventory checks

The source baseline is `3864a1d23b5ef0c5601ff740c104fdec4584d14d` on branch `issue131`; checks use Node `v24.15.0` from the prescribed nvm PATH. The scoped test checks all tracked source files and public exports, source declarations and anchors, local aliases, invalid ownership/export/reference mutations and deterministic views. These checks validate accounting and references, not rendered product behavior; authored interpretations require review. Scoped validation reports no problems and deliberately does not assert platform completeness (`complete: false`).

## Product execution and CI configuration

The first attempt at the scoped product command failed at Angular compilation before assertions because workspace dependency artifacts were missing, including imports from `@ultimate/ng-core`, `@ultimate/uix-data`, `@ultimate/uix-styles/table` and `@ultimate/themes`. No product source was repaired. The dependency build below then passed (11 workspace projects selected):

```sh
NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter '@ultimate/ng^...' --if-present run build
```

The scoped command subsequently passed once:

```sh
NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{table,paginator,scroller}/*.spec.ts'
```

Exit 0, Vitest `4.0.8`: three files and 135 tests (Table 95, Paginator 16, Scroller 24). The [captured run](product-run.json) records command, revision, outcome and summarized output. Angular emitted NG8113 warnings for unused `UStepList` and `UStepPanels` in `src/g3c1-aura-styles.spec.ts`, and NG8102 for `step() ?? 1` at `src/input-number/input-number.ts:90:19`; these were not repaired. This local unit run is not browser, accessibility, visual, Storybook, full package build, publication, remote CI, or exhaustive coverage verification.

Existing `.github/workflows/ci.yml` conditionally runs root `pnpm run test` for non-docs classifications, recursively including Angular's `ng test --project=ng`. This is configured product-test enforcement, not observed remote execution or branch protection. Root `test:scripts` covers provenance tests, not inventory tests; this inventory suite is not claimed CI-enforced.

## Notable source observations

Table composes Paginator and Scroller. Its `rowsPerPageOptions` and `lazyLoadOnInit` inputs are declared but not used, and virtual mode omits several non-virtual controls and limits keyboard movement to mounted rows. Paginator maintains its own page offset and emits a page event. Scroller exposes a direct `#content` template with absolute indices and emits lazy ranges on changed scroll positions. These are descriptions of the present implementation, not product repairs or parity judgments.
