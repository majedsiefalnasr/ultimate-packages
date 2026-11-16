# React media and containers inventory (#138)

## Read and maintain

Start with the [generated index](index.md) and [scoped validation](validation.md). Nine family records account for all 45 scoped files: 27 owned component, barrel and style files, and 18 supporting specs and stories excluded with reasons. The public surface contains nine components and thirteen interfaces, each exposed at both the package root and its family subpath (44 entry-qualified exports). Family names bound the scope rather than determining the product count. Splitter panel configuration and the scroll-panel handle are public interfaces, not additional component exports.

The authored input is `scripts/inventory/react-media-containers.json`. Edit it rather than generated detail pages. The unchanged pilot generator reconciles public barrel exports, source ownership, evidence and relationships. Every family barrel explicitly re-exports its component and types. Local `{css, classes}` style modules are source exports and are not exposed by those barrels. Declared distribution paths do not establish publication.

All nine use `useComponentBase` from React core and local styling, and have Aura preset registrations. None has a family UIX style entry or a component-metadata record at the source baseline. Galleria and image compose React core Portal, FocusTrap and UTimesIcon; image also uses the escape registry and display order. Panel composes UButton, owned by #108. External React core (#149) and preset (#151) identities remain with their owning scopes. The button identity is already inventoried by the completed #108 scope (react-actions). These relationships do not assert completion of those scopes. The Aura `imagecompare` preset is present, but there is no React image-compare source family in this revision; no React record is invented for it. Prime references in source are neutral provenance context, without parity judgments.

## Executed inventory verification

Source revision: `cc6e7ab39f0a963bbfddc0dd6a181dc3c6feffc6`. Product sources were not changed. Commands use Node v24.15.0; the ticket worktree already had `pnpm install` completed.

- `node --test scripts/inventory/react-media-containers.test.mjs` checks all scoped files, export counts, public entries, declarations, evidence, ownership aliases, references, run-evidence consistency and deterministic generated views, with negative mutations.
- `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-media-containers.json --out docs/inventory/react-media-containers` regenerates scoped views without replacing authored input, this README or captured product evidence.
- Inventory checks do not verify rendered product behavior. No TypeScript source was changed.

## Product execution and CI configuration

The existing scoped specs ran in the main checkout with prebuilt workspace dependencies and identical product sources at the baseline revision. Following #135's host workaround, a temporary config was created outside tracked files at `/private/tmp/claude-501/ult-wt/react138-vitest.config.mjs`, then removed after execution. It set `css.postcss.plugins=[]`, `test.environment="jsdom"`, `test.globals=true` and `setupFiles` to the absolute main-checkout `packages/react/vitest.setup.ts` path. This bypassed the host ancestor `/Users/majedsiefalnasr/postcss.config.mjs`, which requires missing `postcss-import`. PostCSS plugin processing was not exercised. The main checkout was clean before and after execution.

```sh
NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/carousel/ src/galleria/ src/image/ src/card/ src/panel/ src/fieldset/ src/splitter/ src/divider/ src/scroll-panel/ --config /private/tmp/claude-501/ult-wt/react138-vitest.config.mjs --maxWorkers=1 --no-file-parallelism
```

Vitest 2.1.9 on Node v24.15.0 passed 75 tests across nine files: galleria 22, carousel 9, image 8, fieldset 7, panel 7, splitter 7, scroll-panel 6, card 5 and divider 4. An initial broader filter run also selected panel-menu and passed 95 tests across ten files. At review request, the command was rerun with trailing-slash directory filters; only the nine-family run above supports the recorded verified claims. Carousel emitted repeated React warnings: `Warning: An update to UCarousel inside a test was not wrapped in act(...).` The [captured run](product-run.json) records command, revision, preparation and limitations. Local jsdom specs do not establish browser, accessibility, visual, Storybook, publication or exhaustive behavior.

The configured non-docs CI Test step invokes root `pnpm run test`, recursively including React's `vitest run`, conditional on scope, cancellation and prerequisite steps. This describes configuration only: no remote run was observed and no branch-protection claim is made. `test:scripts` covers provenance tests, not inventory tests.

## Source observations, not repaired

Carousel and galleria autoplay wrap independently of `circular`, while manual navigation consults it. Carousel does not normalize `numVisible` or `numScroll`. Galleria's active-index default makes the callback alone select controlled behavior; its uncontrolled fullscreen state starts closed and no opening control is rendered. Fullscreen galleria uses a local Escape handler, whereas image also uses the global priority registry. Image's preview img omits the base image's alt and error callback; its zoom controls use strict step guards at the stated bounds.

Card uses truthiness to render optional regions, while divider accepts any non-null child. Panel and fieldset conditionally unmount collapsed content and can emit `aria-labelledby` references without the corresponding header element. Splitter uses configured panel content with index keys, initializes equal sizes once and repeats keyboard resize every 40ms. Scroll-panel's keyboard timeout performs one delayed step without rescheduling; its computed `contentId` is used by the bars' `aria-controls` but is not assigned to the content element. These are descriptions of current source, not product repairs or parity judgments.
