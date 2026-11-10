# Vue menu and command navigation — issue #127

Implements [#127](https://github.com/majedsiefalnasr/ultimate-packages/issues/127)
under #98 using actual Vue source, not inferred Angular or React contracts.
Source revision: `c15f80a751deffcf91566d7a4353d95d73548589` on `issue127`.
Start with the [generated index](index.md) and [validation](validation.md).

## Authorship and bounded accounting

Edit `scripts/inventory/vue-menu-navigation.json`, not generated detail pages. The existing
pilot schema/generator is reused unchanged. Nine families delimit scope, not component
counts: menu, context-menu, breadcrumb, mega-menu, menubar, panel-menu, tiered-menu, dock
and speed-dial. The 60 scoped files are partitioned into 41 owned runtime/barrel/base/style
files and 19 explicitly excluded supporting specs, stories and the menu API page. All 42
entry-qualified exports reconcile (21 symbols exposed through root and secondary entries).
Four composition components are public: UMegaMenuColumnGroup, UMenubarSub, UPanelMenuList
and UTieredMenuSub. UMenuitem is source-only. createBaseContextMenu is source-only; the
other eight base factories are public. All seven style parameter interfaces and all nine
style modules are attributed to their family but not package-barrel exported. There are
no owned composables, install plugins or independent exported model types in these roots.

The root exports, manifest secondary entries and tsup inputs are checked independently.
Reconciled `package.ultimate.vue.<family>` identities alias local records; none are deferred
to this ticket. Foundation dependencies remain pending under #150, themes #151, metadata
#153, ripple #142, DOM utilities #143, escape utilities #144 and shared menu CSS #146.
Only menu has a dedicated metadata record; its Vue event model is selective (focus/blur
are not modeled). All nine Aura registry keys exist; hyphens are removed for multiword
keys. Base/style registration provides the indirect theme dependency. Other source imports
are linked only where used; no invented UButton, router, focus trap or motion dependencies
are attached to families that do not import them. Shared exports tests, Aura styling tests,
menu e2e/snapshots and foundation implementations outside the roots are not owned here.
Prime mentions in existing source comments are provenance references, not parity judgments.

## Executed checks and reproducibility

Execution environment: macOS local checkout, Node `v24.22.2`, pnpm `9.6.0`, installed
repository dependencies. This differs from the prescribed CI Node `24.15.0`; no install,
host repair, product edit, commit, push or branch switch was performed by the implementation worker.

Before committing, the lead subsequently ran `pnpm install --frozen-lockfile` under Node
`v24.15.0` with pnpm `9.6.0`: passed, lockfile unchanged, Husky prepare completed.
The earlier verification environment above remains the provenance of the worker's results.

The inventory regression seam was authorized in the task. First,
`node --test scripts/inventory/vue-menu-navigation.test.mjs` failed all four tests with
`ENOENT` for the absent authored JSON (real red). After records and generated views were
added, the same command passed all four (green). The suite checks independent tracked-file
and public-entry coverage, TypeScript declarations and SFC names, important Vue-specific
surface interpretations, missing ownership/invented export/dangling reference/local-deferral
mutations, authored preservation and byte-exact generated views. Anchor checks prove
presence, not semantic correctness; owner review remains needed.

Commands used for regeneration and scoped checks:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-menu-navigation.json --out docs/inventory/vue-menu-navigation
node --test scripts/inventory/vue-menu-navigation.test.mjs
pnpm exec eslint scripts/inventory/vue-menu-navigation.test.mjs
pnpm exec prettier --check scripts/inventory/vue-menu-navigation.json scripts/inventory/vue-menu-navigation.test.mjs docs/inventory/vue-menu-navigation docs/inventory/README.md
```

Final local results: scoped regression 4/4 passed; full `node --test scripts/inventory/*.test.mjs`
135/135 passed; scoped ESLint passed; scoped Prettier passed; `git diff --check` passed.
An initial formatting check flagged repeated spaces in authored class-parameter prose; those
were normalized in the JSON and regenerated, not patched in generated output.

Generation has zero reconciliation problems; `complete: false` deliberately means global
completeness is not asserted. Repeated generation is compared byte-for-byte by the test,
and the authored JSON is not mutated. Formatting is applied to authored files only; generated
views remain generator output. Inventory checks do not verify rendered behavior.

## Bounded product attempt: failed before assertions

```sh
pnpm --filter @ultimate/vue exec vitest run src/menu/menu.spec.ts src/context-menu/context-menu.spec.ts src/breadcrumb/breadcrumb.spec.ts src/mega-menu/mega-menu.spec.ts src/menubar/menubar.spec.ts src/panel-menu/panel-menu.spec.ts src/tiered-menu/tiered-menu.spec.ts src/dock/dock.spec.ts src/speed-dial/speed-dial.spec.ts --maxWorkers=1 --minWorkers=1
```

Exit 1, Vitest `2.1.9`: `Failed to load PostCSS config` followed by
`Loading PostCSS Plugin failed: Cannot find module 'postcss-import'`, require stack
`/Users/majedsiefalnasr/postcss.config.mjs`. No product assertions completed; this is an
ancestor host configuration/dependency failure, not a component-test result. No bypass or
repair was attempted. Builds, typechecks, browser/accessibility/visual tests and remote CI
were not executed. Existing spec presence is not pass evidence.

CI configuration (`.github/workflows/ci.yml`) conditionally runs root `pnpm run test` for
non-docs classifications; the Vue package script runs `vitest run`. This is configured
product-test enforcement, not an observed successful CI run. Scoped inventory tests are
not included in the root provenance-only `test:scripts` glob and are not claimed CI-enforced.
Branch protection and external runtime/publish behavior were not exercised.

## Source observations, not repairs

Menu/context-menu are flat; tiered-menu/menubar recurse; mega-menu has columns/groups;
panel-menu holds a position-derived expansion Set. Context-menu alone supplies a trigger
slot; remaining scoped templates are fixed. Menu uses local Escape, context-menu shared
Escape/display-order, and tiered-menu/speed-dial document listeners. Tiered popup CSS starts
offscreen without target-coordinate alignment. Speed-dial's external visible watcher does
not invoke its show/hide listener lifecycle. These are source observations, not rendered
verification or parity/gap classifications. Full per-family defaults, events, helper
availability and dependency explanations are in the generated pages.
