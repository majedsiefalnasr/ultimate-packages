# Angular collection presentation and transfer (#134)

Start with the [generated index](index.md) and [scoped validation](validation.md). Four family records account for 20 scoped files: twelve owned component, barrel and style sources and eight explicitly excluded supporting specifications and stories. The four components and one exported interface yield six entry-qualified exports. Family roots describe ownership, not a component count.

## Authorship and source boundaries

Edit `scripts/inventory/angular-collection-presentation.json`, not generated detail pages. The pilot schema, generator and reconciliation checks are reused unchanged. Regenerate with:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-collection-presentation.json --out docs/inventory/angular-collection-presentation
```

The Angular sources reside in `packages/ng/src/{data-view,order-list,pick-list,timeline}/`. DataView, OrderList and PickList are exported only through the package root (`packages/ng/src/index.ts` re-exports each family index, which in turn star-exports the component); the manifest has no secondary entry for them, so their entries map to the component source file because the barrel uses a star re-export. Timeline is exported from the root and from the `./timeline` manifest entry. `UOrderListButtonProps` is the only exported interface. Every style module is a local source-only `{css, classes}` object and none wraps `@ultimate/uix-styles`. The four `package.ultimate.ng.<family>` identities alias these local records for #134; external base, icon and preset identities remain explicitly pending their owning tickets; the listbox (#116) and paginator (#131) identities belong to other scopes whose inventories are already recorded, and are referenced here as external reconciled identities rather than described again.

All four extend `UBaseComponent`. Aura registers a preset for each family. No component-metadata record exists for these families at this revision. Manifest targets establish declared availability, not publication or artifact integrity. Prime references are neutral provenance, without parity judgments.

## Executed inventory checks

The source baseline is `3864a1d23b5ef0c5601ff740c104fdec4584d14d` on branch `issue134`; checks use Node `v24.15.0` from the prescribed nvm PATH. The scoped test checks all tracked source files and public exports, source declarations and anchors, local aliases, invalid ownership/export/reference mutations and deterministic views. These checks validate accounting and references, not rendered product behavior; authored interpretations require review. Scoped validation reports no problems and deliberately does not assert platform completeness.

## Product execution and CI configuration

Workspace dependency artifacts were already built, so the scoped command passed on its first attempt:

```sh
NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{data-view,order-list,pick-list,timeline}/*.spec.ts'
```

Exit 0, Vitest `4.0.8`: four files and 76 tests (Timeline 5, DataView 21, OrderList 13, PickList 37). The [captured run](product-run.json) records command, revision, outcome and summarized output. The recorded revision is the source baseline rather than the ticket commit because this ticket changes only inventory documentation and scripts; product sources under test are identical at both. Angular emitted NG8113 warnings for unused `UStepList` and `UStepPanels` in `src/g3c1-aura-styles.spec.ts`, and NG8102 for `step() ?? 1` at `src/input-number/input-number.ts:90:19`; these were not repaired. This local unit run is not browser, accessibility, visual, Storybook, full package build, publication, remote CI, or exhaustive coverage verification.

Existing `.github/workflows/ci.yml` conditionally runs root `pnpm run test` for non-docs classifications, recursively including Angular's `ng test --project=ng`. This is configured product-test enforcement, not observed remote execution or branch protection. Root `test:scripts` covers provenance tests, not inventory tests; this inventory suite is not claimed CI-enforced.

## Notable source observations

DataView renders each item as interpolated text from `itemTemplate`, so its item rendering is limited to the string returned by that function; its loading spinner is recorded as a scope exception (GAP-124). OrderList and PickList duplicate the same private `MatchMode`, `field` and `matches` helpers that DataView also carries. Timeline accepts `align` but its style module only branches on `layout`. OrderList and PickList choose between `UListbox` and CDK drag-and-drop rendering by the `dragdrop` input. These are descriptions of the present implementation, not product repairs or parity judgments.
