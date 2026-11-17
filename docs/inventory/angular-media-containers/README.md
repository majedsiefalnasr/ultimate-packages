# Angular media and containers inventory (#137)

This bounded inventory covers carousel, galleria, image, image-compare, card, panel, fieldset, splitter, divider and scroll-panel at source revision `cc6e7ab39f0a963bbfddc0dd6a181dc3c6feffc6`. It documents current implementation; it does not judge Prime parity or repair product behavior.

Start with [the generated index](index.md) and [scoped validation](validation.md). Authored records live in `scripts/inventory/angular-media-containers.json`; the shared generator remains unchanged. Regenerate this scope with:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-media-containers.json --out docs/inventory/angular-media-containers
```

## Accounting and consumer availability

Ten family records attribute 30 owned source files (components, public interfaces/directive, barrels and local styles). Twenty spec/story files have explicit supporting-file exclusions, giving 50 tracked scoped files with no unaccounted paths. Family folders are workload boundaries: Splitter owns the public `USplitterPanel` template directive and `USplitterResizeEvent`; Carousel and Galleria own their public item-context interfaces, and Carousel owns its page-event interface. The style modules and `CarouselItemListParams` are source-only exports, not consumer barrel exports.

There are 29 entry-qualified exports: 15 through `@ultimate/ng` and 14 through nine secondary entries. `UPanel` is available from the root only: its local barrel is root-reexported, but the manifest has no `./panel` entry. Explicit named barrels are mapped independently for root and secondary entries and checked against the actual manifest/root barrel.

All ten components extend `UBaseComponent`, inherit `dt` and `unstyled`, and use local style modules rather than `@ultimate/uix-styles` imports. The base registers theme variables using each componentName; Aura registers all ten keys, including `imagecompare` and `scrollpanel`. None of these families has a record in the current `@ultimate/component-metadata` registry. Pending reconciled relationships point to basecomponent/overlay/focus-trap/icons (#148), theme presets (#151), UUID/escape utilities (#144), and Button (#107); those external owning tickets remain outside this scope.

## Executed verification and CI configuration

[Product run evidence](product-run.json) records one successful bounded run under Node 24.15.0 with `NODE_OPTIONS=--max-old-space-size=1024`. It ran in the main checkout with prebuilt workspace dependency artifacts and identical product sources, because the assigned worktree has no `packages/*/dist`. No product source or tracked main-checkout file was changed. An initial invocation with `--maxWorkers=1` was rejected before testing (`Error: Unknown argument: maxWorkers`); the supported template command then passed.

Vitest 4.0.8 passed 10 spec files and 79 tests: Carousel 9, Galleria 21, Image 7, ImageCompare 4, Card 5, Panel 6, Fieldset 7, Splitter 8, Divider 3 and ScrollPanel 9. Observed warnings were NG8113 for unused `UStepList`/`UStepPanels` in `VerticalStepperHost`, NG8102 for `step() ?? 1` in InputNumber, and NG0912 for a component-ID collision between `SsrHostComponent` and `HostComponent` in the splitter panel-wrapper spec. They were disclosed without repair.

This is local unit execution, not browser, accessibility, visual, Storybook, publication, full-build or remote-CI proof. Coverage includes imported foundations and is not exhaustive. The configured non-docs CI Test step runs root `pnpm run test`, recursively including Angular tests; this is a configuration-only CI claim. Inventory tests are outside provenance-only `test:scripts`, and branch protection was not observed.

## Notable source observations

Carousel and Galleria start autoplay at initialization and always wrap at the end, including when `circular` is false. Previous/next navigation stops the timer. Galleria seeds its public active-index signal from the aliased input in the constructor; there is no later input synchronization effect.

Image reuses `src` for the preview and does not bind `alt` on that preview image. Zoom-button disabled comparisons evaluate the next step against inclusive limits. ImageCompare has an RTL initial CSS clip, while its input handler always writes a left-to-right inline polygon.

Panel and Fieldset use an internal collapsed-state override after the first user toggle and remove collapsed body markup with `@if`. Splitter uses template directives, equal initial sizes and pointer/keyboard resize chains; its destroy callback removes mouse listeners, while touch listeners and the interval are cleared by their interaction-end paths.

ScrollPanel writes a generated content ID into thumb `aria-controls` without assigning it to the content div. Its keyboard timer schedules a single 40 ms timeout per keydown. Its focus CSS requests `scrollpanel.barfocus.ring.width/offset` alongside `scrollpanel.bar.focus.ring.*` tokens. These are current source observations, not claims of passing behavioral checks for every path.
