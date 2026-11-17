# React UImage

ID: react.image

Framework: react; availability: public

## Authored interpretation

Display an image with optional modal preview, rotation and zoom controls.

## Framework surface

UImage and UImageProps expose src, alt, width:string, height:string, preview (default false), onShow(), onHide(), onImageError(React.SyntheticEvent<HTMLImageElement>) and className. The base img receives src/alt/width/height and onError. A Zoom image button opens internal maskVisible and previewVisible, emits onShow and queues focus to Close. The overlay composes Portal, FocusTrap autoFocus and UTimesIcon; useDisplayOrder("image", maskVisible) and useGlobalEscapeKey use [ESCAPE_PRIORITIES.IMAGE, displayOrder]. The mask has role dialog and aria-modal, closes on mask click and also handles Escape locally. Toolbar/image clicks stop propagation. Rotate left/right change by 90 degrees; private ZOOM_STEP=0.1, ZOOM_MIN=0.5 and ZOOM_MAX=1.5 use <=/>= boundary guards, so boundary values are not deliberately set by the step controls. close resets rotation to zero and scale to one and calls onHide. The preview img receives src and transform but not the base img alt or onImageError. The eye glyph is inline SVG. There are no exported preview composition members. imageStyleModule is a source-only local {css, classes} object consumed by useComponentBase with componentName image; it is exported from the style file but not the family barrel. No family @ultimate/uix-styles entry or component-metadata record exists in this revision. Each family barrel explicitly exports the component and public types; root and family subpath expose the same named surface. Declared dist paths do not establish publication. Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context. Props are explicitly declared; no arbitrary native-attribute spread is implemented.

## Public exports

@ultimate/react#UImage
@ultimate/react/image#UImage
@ultimate/react#UImageProps
@ultimate/react/image#UImageProps

## Owned source and evidence

packages/react/src/image/image-style.ts
packages/react/src/image/image.tsx
packages/react/src/image/index.ts

```text
packages/react/src/image/index.ts: export { UImage } from "./image";
packages/react/src/image/image.tsx: componentName: "image"
packages/react/src/index.ts: export * from "./image";
packages/react/package.json: "./image": {
packages/react/src/image/image-style.ts: export const imageStyleModule
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
packages/themes/src/presets/aura/index.ts:     image,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/react-core/src/overlay/index.ts: export { Portal } from "./portal";
packages/react-core/src/focus-trap/index.ts: export { FocusTrap } from "./focus-trap";
packages/react-core/src/icons/index.ts: export { UTimesIcon } from "./times-icon";
packages/react-core/src/escape/index.ts: export { useGlobalEscapeKey } from "./use-global-escape-key";
packages/react/src/image/image.tsx: priority: [ESCAPE_PRIORITIES.IMAGE, displayOrder],
packages/react/src/image/image.tsx: const isZoomOutDisabled = scale - ZOOM_STEP <= ZOOM_MIN;
```

## Relationships

package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.react-core.overlay (pending cross-batch)
package.ultimate.react-core.focus-trap (pending cross-batch)
package.ultimate.react-core.icons (pending cross-batch)
package.ultimate.react-core.escape (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Inspected component, public types, owned composition and local style sources exist. Source interpretation and supporting spec presence are not passing runtime verification."
  },
  {
    "state": "verified",
    "behavior": "Existing scoped React product specifications passed; this family contributed 8 tests to the captured run.",
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
