# React UGalleria

ID: react.galleria

Framework: react; availability: public

## Authored interpretation

Present one caller-rendered item with optional thumbnail selection, navigation, autoplay and fullscreen overlay.

## Framework surface

UGalleria<T> and UGalleriaProps<T> expose required value and itemTemplate(item), optional thumbnailTemplate(item), activeIndex (default 0), onActiveIndexChange(index), showItemNavigators (true), showThumbnails (true), circular (false), autoplayInterval (0), fullScreen (false), fullScreenActive, onFullScreenActiveChange(active) and className. Internal active index initializes from activeIndex; isActiveIndexControlled checks onActiveIndexChange plus activeIndexProp after its default has made it defined. Consequently supplying the callback alone also selects the controlled branch with index zero. Navigation checks range, updates internal state only in uncontrolled mode and emits the numeric index. Previous/Next use circular wraparound; autoplay wraps to zero regardless of circular. Thumbnail rendering falls back to itemTemplate; role button li elements support Enter/Space and aria-current. The content key handler supports ArrowLeft/ArrowRight, Home/End and Escape to close active fullscreen, ignoring editable descendants via private isEditableTarget. fullScreenActive is independently controlled when defined, otherwise internal; no opening control is rendered, and the internal state starts false. The fullscreen branch composes Portal, FocusTrap autoFocus and UTimesIcon from React core; Close emits false and the mask has role dialog. The inline branch has role region. These parts are imported dependencies, not owned Galleria exports; no separate GalleriaItem or GalleriaThumbnails is exported. galleriaStyleModule is a source-only local {css, classes} object consumed by useComponentBase with componentName galleria; it is exported from the style file but not the family barrel. No family @ultimate/uix-styles entry or component-metadata record exists in this revision. Each family barrel explicitly exports the component and public types; root and family subpath expose the same named surface. Declared dist paths do not establish publication. Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context. Props are explicitly declared; no arbitrary native-attribute spread is implemented.

## Public exports

@ultimate/react#UGalleria
@ultimate/react/galleria#UGalleria
@ultimate/react#UGalleriaProps
@ultimate/react/galleria#UGalleriaProps

## Owned source and evidence

packages/react/src/galleria/galleria-style.ts
packages/react/src/galleria/galleria.tsx
packages/react/src/galleria/index.ts

```text
packages/react/src/galleria/index.ts: export { UGalleria } from "./galleria";
packages/react/src/galleria/galleria.tsx: componentName: "galleria"
packages/react/src/index.ts: export * from "./galleria";
packages/react/package.json: "./galleria": {
packages/react/src/galleria/galleria-style.ts: export const galleriaStyleModule
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/themes/src/presets/aura/index.ts:     galleria,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/react-core/src/overlay/index.ts: export { Portal } from "./portal";
packages/react-core/src/focus-trap/index.ts: export { FocusTrap } from "./focus-trap";
packages/react-core/src/icons/index.ts: export { UTimesIcon } from "./times-icon";
packages/react/src/galleria/galleria.tsx: onActiveIndexChange !== undefined && activeIndexProp !== undefined;
packages/react/src/galleria/galleria.tsx: const [internalFullScreenActive, setInternalFullScreenActive] = React.useState(false);
```

## Relationships

package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.react-core.overlay (pending cross-batch)
package.ultimate.react-core.focus-trap (pending cross-batch)
package.ultimate.react-core.icons (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Inspected component, public types, owned composition and local style sources exist. Source interpretation and supporting spec presence are not passing runtime verification."
  },
  {
    "state": "verified",
    "behavior": "Existing scoped React product specifications passed; this family contributed 22 tests to the captured run.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/carousel/ src/galleria/ src/image/ src/card/ src/panel/ src/fieldset/ src/splitter/ src/divider/ src/scroll-panel/ --config /private/tmp/claude-501/ult-wt/react138-vitest.config.mjs --maxWorkers=1 --no-file-parallelism",
    "revision": "cc6e7ab39f0a963bbfddc0dd6a181dc3c6feffc6",
    "outcome": "passed",
    "output": "Vitest 2.1.9, Node v24.15.0: Test Files 9 passed (9); Tests 75 passed (75): galleria 22, carousel 9, image 8, fieldset 7, panel 7, splitter 7, scroll-panel 6, card 5, divider 4. Carousel emitted React act(...) warnings.",
    "limitations": "Temporary config /private/tmp/claude-501/ult-wt/react138-vitest.config.mjs was outside tracked files and removed after the run. It set css.postcss.plugins=[] to bypass host ancestor /Users/majedsiefalnasr/postcss.config.mjs requiring missing postcss-import, with jsdom, globals:true and the absolute main-checkout vitest.setup.ts path. PostCSS plugin processing was not exercised. Workspace dependencies were already built. Local jsdom unit tests only; not browser, accessibility, visual, Storybook, publication or remote CI evidence.",
    "run": "docs/inventory/react-media-containers/product-run.json"
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/react vitest run. Workflow configuration only, not an observed successful CI execution or branch-protection claim. test:scripts is provenance-only and does not include inventory tests.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); upstream dependencies may prevent execution. No remote CI observed."
  }
]
```
