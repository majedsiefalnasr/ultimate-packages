# @ultimate/uix-utils DOM utilities

ID: `package.ultimate.uix-utils.dom`

Framework: framework-neutral; availability: public from package root and `@ultimate/uix-utils/dom`.

## Authored interpretation

This record catalogs the named values exported by the DOM barrel, including its four helpers. They are low-level browser DOM utilities, not components. Most methods operate on passed DOM nodes and/or read browser globals when called; the package is not generally safe to execute in server rendering. The names below are individually reconciled against the barrel. Purpose is inferred from each method's name and source implementation; it is not a behavioral test or a compatibility guarantee.

## Public surface and availability

`packages/uix-utils/src/index.ts` re-exports `./dom`, while `packages/uix-utils/src/dom/index.ts` re-exports 84 method defaults and four helper defaults as named exports. `packages/uix-utils/package.json` maps `.` to `dist/index.mjs` and the `./*` pattern to `dist/*/index.mjs` (with corresponding declarations); `tsup.config.ts` builds the root and immediate source submodule indexes. Consequently these values are available from both `@ultimate/uix-utils` and `@ultimate/uix-utils/dom`. The wildcard maps submodule index paths; it does not establish deep public paths for `dom/helpers/*` or `dom/methods/*`. The `BlockBodyScrollOptions` and `UnblockBodyScrollOptions` interfaces are declared in helper modules but are not re-exported by `dom/index.ts`.

## Export catalog

Each row is one named export from `packages/uix-utils/src/dom/index.ts:1-88`. Source file is `packages/uix-utils/src/dom/methods/<name>.ts` for method rows and `packages/uix-utils/src/dom/helpers/<name>.ts` for helper rows. Interfaces shown are the observed source-level call shape, summarized rather than copied as complete TypeScript declarations. They describe authored interfaces, not verified runtime contracts.

### Geometry, overlay, and scrolling

| Export                        | Source-level interface and purpose                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `absolutePosition`            | `(element, target, options?)`; positions an overlay relative to a target and viewport.       |
| `alignOverlay`                | `(element, target, options?)`; aligns an overlay against its target.                         |
| `calculateBodyScrollbarWidth` | `()`; measures viewport width minus document-element width.                                  |
| `calculateScrollbarHeight`    | `(element?)`; measures scrollbar height, using a temporary element when needed.              |
| `calculateScrollbarWidth`     | `(element?)`; measures scrollbar width, using a temporary element when needed.               |
| `getHeight`                   | `(HTMLElement)`; returns element content height.                                             |
| `getHiddenElementDimensions`  | `(HTMLElement?)`; temporarily measures a hidden element and returns width/height.            |
| `getHiddenElementOuterHeight` | `(HTMLElement)`; measures the outer height of a hidden element.                              |
| `getHiddenElementOuterWidth`  | `(HTMLElement)`; measures the outer width of a hidden element.                               |
| `getInnerWidth`               | `(HTMLElement)`; returns inner width.                                                        |
| `getOffset`                   | `(Element?)`; returns document-relative top/left coordinates.                                |
| `getOuterHeight`              | `(HTMLElement, margin?)`; returns outer height, optionally including margin.                 |
| `getOuterWidth`               | `(unknown, margin?)`; returns outer width, optionally including margin.                      |
| `getScrollLeft`               | `(HTMLElement?)`; reads horizontal scroll position with RTL handling.                        |
| `getScrollableParents`        | `(Element)`; finds scrollable ancestors, including configured selector descendants.          |
| `getViewport`                 | `()`; returns window viewport width and height.                                              |
| `getWidth`                    | `(HTMLElement)`; returns element content width.                                              |
| `getWindowScrollLeft`         | `()`; reads horizontal window/document scroll position.                                      |
| `getWindowScrollTop`          | `()`; reads vertical window/document scroll position.                                        |
| `nestedPosition`              | `(HTMLElement, level)`; positions a nested menu element relative to its parent and viewport. |
| `relativePosition`            | `(element, target, options?)`; positions relative to a target using viewport geometry.       |
| `scrollInView`                | `(container, item)`; adjusts container scrolling to reveal an item.                          |

### DOM creation, styles, classes, and attributes

| Export                  | Source-level interface and purpose                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `addClass`              | `(Element, className)`; adds one or more class names.                                             |
| `addStyle`              | `(HTMLElement, string \| object)`; applies CSS text or declarations.                              |
| `appendChild`           | `(target, child)`; resolves a supported target and appends a node.                                |
| `createElement`         | `(type, attributes?, content?)`; creates and configures an element.                               |
| `createStyleAsString`   | `(css?, options?)`; returns style text with supplied options.                                     |
| `createStyleElement`    | `(id?, attributes?, css?, container?)`; creates and appends a style element.                      |
| `createStyleMarkup`     | `(css, options?)`; returns markup for style content.                                              |
| `createStyleTag`        | `(css, attributes?, container?)`; creates a style element in a container/head.                    |
| `getAttribute`          | `(Element, name)`; reads an attribute.                                                            |
| `getCSSProperty`        | `(element, property)`; reads a computed CSS property.                                             |
| `getCSSVariableByRegex` | `(RegExp)`; locates a matching CSS custom property in stylesheets.                                |
| `hasClass`              | `(Element, className)`; checks class membership.                                                  |
| `isAttributeEquals`     | `(Element, name, value)`; compares an attribute with a value.                                     |
| `isAttributeNotEquals`  | `(Element, name, value)`; checks an attribute differs from a value.                               |
| `isCssSupported`        | `(property, value?)` or `(condition)`; checks CSS support, guarded when `CSS.supports` is absent. |
| `remove`                | `(Element)`; removes an element from its parent.                                                  |
| `removeChild`           | `(target, child)`; removes a child from a resolved target.                                        |
| `removeClass`           | `(Element, className)`; removes one or more class names.                                          |
| `removeStyleTag`        | `(Node)`; removes a style node and returns the resulting node/null.                               |
| `setAttribute`          | `(Element, attributes)`; applies attribute, style, and event-like values.                         |
| `setAttributes`         | `(Element, attributes)`; applies a record of attributes/properties.                               |
| `setCSSProperty`        | `(HTMLElement, property, value)`; sets a CSS property.                                            |

### Query, traversal, type checks, and visibility

| Export                      | Source-level interface and purpose                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `find`                      | `(Element, selector)`; returns matching descendant elements.                                                                                      |
| `findSingle`                | `(Element, selector)`; returns the first matching descendant or null.                                                                             |
| `getIndex`                  | `(HTMLElement)`; returns the node's index among siblings.                                                                                         |
| `getNextElementSibling`     | `(Element, selector)`; finds the next matching element sibling.                                                                                   |
| `getParentNode`             | `(Node)`; returns its parent node.                                                                                                                |
| `getParents`                | `(Node, parents?)`; collects ancestor nodes.                                                                                                      |
| `getPreviousElementSibling` | `(Element, selector)`; finds the previous matching element sibling.                                                                               |
| `getTargetElement`          | `(target, only?): Document \| Window \| Element \| null` (source union varies by options); resolves target tokens, selectors, refs, or callbacks. |
| `isElement`                 | `(unknown): value is Element`; tests whether a value is an element.                                                                               |
| `isExist`                   | `(Node)`; checks node existence/connection according to source logic.                                                                             |
| `isHidden`                  | `(HTMLElement)`; checks hidden/display state.                                                                                                     |
| `isVisible`                 | `(HTMLElement?)`; checks element visibility.                                                                                                      |
| `toElement`                 | `(unknown): HTMLElement \| undefined`; resolves supported element/ref shapes.                                                                     |

### Focus, accessibility, and selection

| Export                     | Source-level interface and purpose                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `clearSelection`           | `()`; clears the current browser selection.                                              |
| `focus`                    | `(HTMLElement, FocusOptions?)`; focuses an element unless already active.                |
| `getCursorOffset`          | `(HTMLElement, position?)`; measures cursor offset using temporary DOM nodes.            |
| `getFirstFocusableElement` | `(Element, selector?)`; returns the first focusable descendant.                          |
| `getFocusableElements`     | `(Element, selector?)`; returns visible focusable descendants.                           |
| `getLastFocusableElement`  | `(Element, selector?)`; returns the last focusable descendant.                           |
| `getNextFocusableElement`  | `(Element, selector?)`; returns the next focusable descendant relative to current focus. |
| `getSelection`             | `()`; reads selected text.                                                               |
| `isClickable`              | `(Element)`; checks whether the element or its parent is a clickable node.               |
| `isFocusableElement`       | `(unknown, selector?)`; checks focusability.                                             |

### Browser and environment inspection

| Export                   | Source-level interface and purpose                                                    |
| ------------------------ | ------------------------------------------------------------------------------------- |
| `getBrowser`             | `(): BrowserType`; identifies a browser from user-agent parsing.                      |
| `getBrowserLanguage`     | `()`; returns the preferred browser language.                                         |
| `getUserAgent`           | `()`; reads the browser user-agent string.                                            |
| `isAndroid`              | `()`; identifies Android from user-agent.                                             |
| `isClient`               | `(): boolean`; safely probes for a usable browser window/document.                    |
| `isIOS`                  | `()`; identifies iOS from user-agent and window state.                                |
| `isPrefersReducedMotion` | `(): boolean`; checks reduced-motion preference and guards missing window/matchMedia. |
| `isRTL`                  | `(HTMLElement?)`; checks right-to-left direction.                                     |
| `isServer`               | `(): boolean`; checks absence of browser window.                                      |
| `isTouchDevice`          | `()`; probes touch-related window/navigator properties.                               |
| `resolveUserAgent`       | `()`; parses user-agent into browser/platform data.                                   |

### Animation and scheduling

| Export                | Source-level interface and purpose                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `fadeIn`              | `(HTMLElement, duration)`; animates opacity toward visible.                                       |
| `fadeOut`             | `(HTMLElement, duration)`; animates opacity toward hidden.                                        |
| `hasCSSAnimation`     | `(Element)`; checks computed animation duration.                                                  |
| `hasCSSTransition`    | `(Element)`; checks computed transition duration.                                                 |
| `invokeElementMethod` | `<T extends keyof Element>(element, methodName, args?)`; invokes an element method when callable. |
| `nextFrame`           | `(): Promise<void>`; waits for the next animation frame.                                          |

## Helpers

| Export              | Source-level interface and purpose                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blockBodyScroll`   | `(string \| { className?: string; variableName?: string } \| undefined): void`; adds a body class (default `p-overflow-hidden`), optionally stores scrollbar width in a CSS variable.     |
| `unblockBodyScroll` | `(string \| { className?: string; variableName?: string } \| undefined): void`; removes the body class and optional CSS variable.                                                         |
| `exportCSV`         | `(csv: any, filename: string): void`; creates a CSV Blob, uses `msSaveOrOpenBlob` when available, otherwise calls `saveAs`, falling back to a data URL and `window.open`; appends `.csv`. |
| `saveAs`            | `(file: { name: string; src: string }): boolean`; downloads through a temporary anchor and returns false if anchor download is unsupported.                                               |

These helpers directly access `document.body`, `window`, `Blob`, `URL`, and/or `navigator`; no general SSR guard is present. `exportCSV` uses `URL.createObjectURL` without a visible `revokeObjectURL` call in this implementation.

## Relationships

- `package.ultimate.uix-utils.root` — root barrel and package manifest ownership; cross-record relationship (#143/#144).
- `package.ultimate.uix-utils.scroll-lock` — related body-scroll-lock ownership (#144); `blockBodyScroll`/`unblockBodyScroll` remain recorded here because these are DOM barrel exports.
- `package.ultimate.uix-utils.escape`, `eventbus`, `mergeprops`, `object`, `uuid`, `zindex`, `classnames` — sibling utility records owned by #144.
- Framework foundations, metadata, and themes: no direct dependency or relationship asserted by this source inspection.

## Evidence and verification

```text
packages/uix-utils/src/dom/index.ts:1-88 — 84 method exports and four helper exports.
packages/uix-utils/src/index.ts:1-9 — root barrel re-exports DOM exports.
packages/uix-utils/package.json:8-21 — root and wildcard subpath maps.
packages/uix-utils/tsup.config.ts:4-19 — root and immediate module entry generation.
packages/uix-utils/src/dom/helpers/blockBodyScroll.ts:4-16 — options and body mutation.
packages/uix-utils/src/dom/helpers/unblockBodyScroll.ts:3-15 — options and reversal.
packages/uix-utils/src/dom/helpers/exportCSV.ts:3-16 — browser download branches.
packages/uix-utils/src/dom/helpers/saveAs.ts:1-20 — anchor download and capability result.
packages/uix-utils/src/dom/methods/isClient.ts:1-3; isServer.ts:1-5 — environment probes.
packages/uix-utils/src/dom/methods/isPrefersReducedMotion.ts:1-6; isCssSupported.ts:28-43 — guarded browser feature probes.
```

- Implementation: present in source; source inspection only.
- Behavioral verification: not run, per inventory task instruction; no behavior is claimed as tested.
- Quality, lint, formatting, build and typecheck results, including CI workflow scope and limitations: see [scoped validation](validation.md).
