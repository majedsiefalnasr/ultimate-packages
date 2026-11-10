# React menu and command navigation inventory (#126)

## Read and maintain

Start with the [generated index](index.md) and [scoped reconciliation](validation.md). Nine family records account for all 51 scoped files: 32 owned implementation, barrel, model, composition and style files; 19 supporting specs, stories and the menu API page explicitly excluded with reasons. A family folder is not treated as a component count.

Authored input: `scripts/inventory/react-menu-navigation.json`. The existing pilot schema, generator and coverage/reference checks are reused unchanged. Edit authored input, not generated detail pages. Root and secondary entries expose the same named barrel surface; root links are verified against direct root-barrel anchors, not a new full-package resolver. Declared dist exports do not prove npm publication or built artifact availability. No pilot record covers these families, so no duplicate pilot identity was introduced. The #106 reconciled family identities are local aliases for #126, never same-ticket pending deferrals.

UMegaMenuItem and UMegaMenuGroup are public types. UMegaMenuColumnGroup, UMenubarSub, UPanelMenuList and UTieredMenuSub and their prop interfaces are source-only, not public barrel exports (unlike the Angular sibling). UMenuItem is public and reused through type-only imports without composing UMenu. USpeedDialDirection and USpeedDialType are public, not internal aliases. Local style modules belong to their family owners and are not package exports. No separate base classes, factories, exported hooks, directives or provider/context sources exist in these roots.

Foundation links follow actual imports: react-core base/styling for all; overlay, escape, zindex and hooks for Menu and ContextMenu; motion for Menu only. Aura preset registration is recorded separately from rendered theme behavior: contextmenu, megamenu, panelmenu, tieredmenu and speeddial keys differ from hyphenated componentName values. MENU_METADATA explicitly references Menu's React source; no dedicated record exists for the other eight families. External foundation, theme and metadata identities remain pending under #149, #151 and #153. No direct UIX source dependency is invented from a matching family name. Prime source comments are provenance context only; this inventory makes no parity or gap judgment.

## Executed inventory verification

Source baseline: `af79b2ec8b18681f0163d9ede0beba387c462258`. Product sources were not changed. Commands used installed tooling, Node v24.22.2 and pnpm 9.6.0 (the repository recommends Node 24.15.0; no install or runtime replacement was performed).

- RED: `node --test --test-concurrency=1 scripts/inventory/react-menu-navigation.test.mjs` failed with missing authored input (4 failures) before records were created.
- GREEN: the same scoped test passed (4 tests). It checks every scoped file, declarations, public entries, source anchors, composition interpretation, local aliases, invalid deferrals, dangling references and deterministic generation.
- Scoped reconciliation/generation: `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-menu-navigation.json --out docs/inventory/react-menu-navigation` passed without problems. Running it again preserved authored JSON and this README byte-for-byte and produced identical generated pages.
- Inventory regression: `node --test --test-concurrency=1 scripts/inventory/pilot.test.mjs scripts/inventory/packages.test.mjs scripts/inventory/react-overlays-notifications.test.mjs scripts/inventory/angular-menu-navigation.test.mjs scripts/inventory/react-menu-navigation.test.mjs` passed (41 tests, 0 failures). These checks validate the inventory, not React rendering.
- Scoped ESLint: `pnpm exec eslint scripts/inventory/react-menu-navigation.test.mjs` passed. Prettier checks passed for the authored input, test, this directory and the inventory index. `node --check scripts/inventory/react-menu-navigation.test.mjs` passed. No TypeScript source was touched; the added JavaScript Node test and JSON/Markdown are not package TypeScript compilation inputs, so no package-wide typecheck was run.

## Product execution and CI configuration

Attempted bounded product command:

```sh
NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/menu/ src/context-menu/ src/breadcrumb/ src/mega-menu/ src/menubar/ src/panel-menu/ src/tiered-menu/ src/dock/ src/speed-dial/ --maxWorkers=1 --no-file-parallelism
```

Vitest 2.1.9 exited 1 before product assertions: `Failed to load PostCSS config` / `Cannot find module 'postcss-import'`, required by the host ancestor `/Users/majedsiefalnasr/postcss.config.mjs`. Each record captures the command, source revision, unavailable outcome, output and limitation. No host dependency/configuration or product repair was attempted. Test presence is not pass evidence. Builds, browser/visual tests and Storybook were not run.

The existing `.github/workflows/ci.yml` non-docs Test step invokes root `pnpm run test`, recursively including React's `vitest run`. This is workflow configuration only; no successful remote run or branch protection was observed. The existing `test:scripts` provenance-only glob does not include this inventory suite. No CI configuration was changed.

## Source observations, not repaired

Menu accepts but does not consume popupAlignment; popup CSS starts offscreen without target measurement. TieredMenu popup CSS also starts offscreen with no target positioning. ContextMenu schedules positioning in a microtask around deferred Portal mounting; no positioning success is inferred. Breadcrumb marks matching model links current, not the home link, despite its source comment. PanelMenu's root list uses a class whose local CSS is display:none; its expanded-parent selector only reveals child lists. SpeedDial emits a hidden class while CSS expects a data attribute and supplies no open/closed transform or opacity rule. Dock's disabled CSS selectors expect a list-item attribute the renderer does not emit. These are source observations, not executed defect/visual assertions. The generated family pages retain actual contracts and limitations rather than copying Angular facts or upstream comments as behavior.
