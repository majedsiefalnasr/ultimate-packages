# Vue media and containers inventory (#139)

This scope documents carousel, galleria, image, image-compare, card, panel, fieldset, splitter, divider and scroll-panel at source revision `cc6e7ab39f0a963bbfddc0dd6a181dc3c6feffc6`. Read the [generated index](index.md), [validation](validation.md) and [captured product run](product-run.json).

## Scope and maintenance

The authored input is `scripts/inventory/vue-media-containers.json`; edit it rather than generated detail pages. Ten records attribute 41 runtime, base, internal and style files. Twenty spec/story files are explicitly excluded from runtime accounting, for 61 tracked scoped files total. Galleria's internal `UGalleriaContent` belongs to its family record. All ten components and all ten `createBase*` factories are barrel-exported at both root and family subpath: 40 entry-qualified exports. Source-exported style modules and carousel style parameter interfaces are described but are not consumer barrel exports. No `SplitterPanel` composition component is declared.

Each family extends its local base factory and `createBaseComponent` from `@ultimate/vue-core`, uses a local style module and has an Aura preset registration. No scoped `@ultimate/uix-styles` entry or component-metadata record exists in this revision. External foundations remain owned by #150, presets by #151, the escape utility by #144 and the panel's button dependency by #109. Relationships describe source usage, not external-ticket completion or publication.

## Executed verification

The command and complete summary are in [product-run.json](product-run.json). Node 24.15.0 and Vitest 2.1.9 passed ten scoped files and 79 tests: galleria 21, carousel 9, image 8, splitter 7, scroll-panel 7, fieldset 7, panel 7, card 5, image-compare 4 and divider 4. The recorded invocation uses trailing slashes in its filters to select only these families. An initial passing invocation without trailing slashes also selected panel-menu through `src/panel`, adding 18 passing tests for a total of 11 files and 97 tests; the exact scoped repeat passed 10 files and 79 tests.

Both test invocations ran in the main checkout with identical product sources and already-built workspace dependencies. The committed `scripts/inventory/vue-disclosure-vitest.config.mjs` overrides PostCSS with an empty plugin list because the host ancestor configuration requires unavailable `postcss-import`; PostCSS processing was not exercised. No warnings were observed. These are local jsdom unit checks, not browser, accessibility, visual, Storybook, publication or remote CI evidence.

CI claims describe configuration only: the conditional non-docs Test step runs root `pnpm run test`, which invokes Vue's product suite. Earlier failures can prevent execution; no remote run or branch protection was observed. Inventory tests are outside `test:scripts` and are not CI-enforced.

Run the scoped inventory checks with:

```sh
node --test scripts/inventory/vue-media-containers.test.mjs
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-media-containers.json
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-media-containers.json --out docs/inventory/vue-media-containers
```

The scoped test accounts for every tracked file, checks manifest/root/build entries, interprets source-exported declarations and SFC names, rejects mutated coverage/exports/references/ownership and compares deterministic generated views. Anchor presence cannot establish semantic accuracy; source interpretation remains reviewed prose.

## Notable source observations

Carousel autoplay wraps regardless of `circular`; indicator navigation leaves autoplay running while previous/next navigation stops it. Galleria initializes its internal index from `activeIndex` without watching later prop changes and starts autoplay without watching interval changes. Its internal content component owns keyboard navigation and item/thumbnail rendering.

Image resets zoom/rotation when preview closes. The preview image does not bind the thumbnail's `alt` prop. Image-compare starts at 50% and directly writes an inline left-to-right clip path during input; its stylesheet also has an RTL selector.

Card has named content slots without a default slot. Panel's region label refers to an id assigned to the string header span, while fieldset's label id is assigned only to its toggle button. Splitter uses configuration objects and initializes equal panel sizes without a panels watcher; its keyboard repeat uses a 40ms interval. Scroll-panel generates `contentId` for scrollbar controls without binding it to its content div, and its keyboard timer is a single 40ms timeout despite the repeating intent in a source comment. Divider declares layout and default content only.

These observations describe current implementation and do not repair product behavior or assert parity. Prime references remain neutral provenance context.
