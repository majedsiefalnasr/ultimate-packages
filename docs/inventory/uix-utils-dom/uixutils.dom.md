# @ultimate/uix-utils DOM utilities

ID: uixutils.dom

Framework: shared; availability: public

## Authored interpretation

DOM and browser utilities exported through the UIX utility package root and DOM subpath.

## Framework surface

The DOM barrel exposes 84 method defaults and four helper defaults as named exports. [The authored README](docs/inventory/uix-utils-dom/README.md) lists each call signature, source path, purpose, and observed runtime boundary. The source files do not access DOM/browser globals during module initialization; functions may access them when invoked, so this does not establish blanket SSR safety. Helper option interfaces are exported only from helper modules and omitted from the barrel; BrowserType is local to getBrowser.ts.

## Public exports

@ultimate/uix-utils#absolutePosition
@ultimate/uix-utils#addClass
@ultimate/uix-utils#addStyle
@ultimate/uix-utils#alignOverlay
@ultimate/uix-utils#appendChild
@ultimate/uix-utils#calculateBodyScrollbarWidth
@ultimate/uix-utils#calculateScrollbarHeight
@ultimate/uix-utils#calculateScrollbarWidth
@ultimate/uix-utils#clearSelection
@ultimate/uix-utils#createElement
@ultimate/uix-utils#createStyleAsString
@ultimate/uix-utils#createStyleElement
@ultimate/uix-utils#createStyleMarkup
@ultimate/uix-utils#createStyleTag
@ultimate/uix-utils#fadeIn
@ultimate/uix-utils#fadeOut
@ultimate/uix-utils#find
@ultimate/uix-utils#findSingle
@ultimate/uix-utils#focus
@ultimate/uix-utils#getAttribute
@ultimate/uix-utils#getBrowser
@ultimate/uix-utils#getBrowserLanguage
@ultimate/uix-utils#getCSSProperty
@ultimate/uix-utils#getCSSVariableByRegex
@ultimate/uix-utils#getCursorOffset
@ultimate/uix-utils#getFirstFocusableElement
@ultimate/uix-utils#getFocusableElements
@ultimate/uix-utils#getHeight
@ultimate/uix-utils#getHiddenElementDimensions
@ultimate/uix-utils#getHiddenElementOuterHeight
@ultimate/uix-utils#getHiddenElementOuterWidth
@ultimate/uix-utils#getIndex
@ultimate/uix-utils#getInnerWidth
@ultimate/uix-utils#getLastFocusableElement
@ultimate/uix-utils#getNextElementSibling
@ultimate/uix-utils#getNextFocusableElement
@ultimate/uix-utils#getOffset
@ultimate/uix-utils#getOuterHeight
@ultimate/uix-utils#getOuterWidth
@ultimate/uix-utils#getParentNode
@ultimate/uix-utils#getParents
@ultimate/uix-utils#getPreviousElementSibling
@ultimate/uix-utils#getScrollLeft
@ultimate/uix-utils#getScrollableParents
@ultimate/uix-utils#getSelection
@ultimate/uix-utils#getTargetElement
@ultimate/uix-utils#getUserAgent
@ultimate/uix-utils#getViewport
@ultimate/uix-utils#getWidth
@ultimate/uix-utils#getWindowScrollLeft
@ultimate/uix-utils#getWindowScrollTop
@ultimate/uix-utils#hasCSSAnimation
@ultimate/uix-utils#hasCSSTransition
@ultimate/uix-utils#hasClass
@ultimate/uix-utils#invokeElementMethod
@ultimate/uix-utils#isAndroid
@ultimate/uix-utils#isAttributeEquals
@ultimate/uix-utils#isAttributeNotEquals
@ultimate/uix-utils#isClickable
@ultimate/uix-utils#isClient
@ultimate/uix-utils#isCssSupported
@ultimate/uix-utils#isElement
@ultimate/uix-utils#isExist
@ultimate/uix-utils#isFocusableElement
@ultimate/uix-utils#isHidden
@ultimate/uix-utils#isIOS
@ultimate/uix-utils#isPrefersReducedMotion
@ultimate/uix-utils#isRTL
@ultimate/uix-utils#isServer
@ultimate/uix-utils#isTouchDevice
@ultimate/uix-utils#isVisible
@ultimate/uix-utils#nestedPosition
@ultimate/uix-utils#nextFrame
@ultimate/uix-utils#relativePosition
@ultimate/uix-utils#remove
@ultimate/uix-utils#removeChild
@ultimate/uix-utils#removeClass
@ultimate/uix-utils#removeStyleTag
@ultimate/uix-utils#resolveUserAgent
@ultimate/uix-utils#scrollInView
@ultimate/uix-utils#setAttribute
@ultimate/uix-utils#setAttributes
@ultimate/uix-utils#setCSSProperty
@ultimate/uix-utils#toElement
@ultimate/uix-utils#blockBodyScroll
@ultimate/uix-utils#exportCSV
@ultimate/uix-utils#saveAs
@ultimate/uix-utils#unblockBodyScroll
@ultimate/uix-utils/dom#absolutePosition
@ultimate/uix-utils/dom#addClass
@ultimate/uix-utils/dom#addStyle
@ultimate/uix-utils/dom#alignOverlay
@ultimate/uix-utils/dom#appendChild
@ultimate/uix-utils/dom#calculateBodyScrollbarWidth
@ultimate/uix-utils/dom#calculateScrollbarHeight
@ultimate/uix-utils/dom#calculateScrollbarWidth
@ultimate/uix-utils/dom#clearSelection
@ultimate/uix-utils/dom#createElement
@ultimate/uix-utils/dom#createStyleAsString
@ultimate/uix-utils/dom#createStyleElement
@ultimate/uix-utils/dom#createStyleMarkup
@ultimate/uix-utils/dom#createStyleTag
@ultimate/uix-utils/dom#fadeIn
@ultimate/uix-utils/dom#fadeOut
@ultimate/uix-utils/dom#find
@ultimate/uix-utils/dom#findSingle
@ultimate/uix-utils/dom#focus
@ultimate/uix-utils/dom#getAttribute
@ultimate/uix-utils/dom#getBrowser
@ultimate/uix-utils/dom#getBrowserLanguage
@ultimate/uix-utils/dom#getCSSProperty
@ultimate/uix-utils/dom#getCSSVariableByRegex
@ultimate/uix-utils/dom#getCursorOffset
@ultimate/uix-utils/dom#getFirstFocusableElement
@ultimate/uix-utils/dom#getFocusableElements
@ultimate/uix-utils/dom#getHeight
@ultimate/uix-utils/dom#getHiddenElementDimensions
@ultimate/uix-utils/dom#getHiddenElementOuterHeight
@ultimate/uix-utils/dom#getHiddenElementOuterWidth
@ultimate/uix-utils/dom#getIndex
@ultimate/uix-utils/dom#getInnerWidth
@ultimate/uix-utils/dom#getLastFocusableElement
@ultimate/uix-utils/dom#getNextElementSibling
@ultimate/uix-utils/dom#getNextFocusableElement
@ultimate/uix-utils/dom#getOffset
@ultimate/uix-utils/dom#getOuterHeight
@ultimate/uix-utils/dom#getOuterWidth
@ultimate/uix-utils/dom#getParentNode
@ultimate/uix-utils/dom#getParents
@ultimate/uix-utils/dom#getPreviousElementSibling
@ultimate/uix-utils/dom#getScrollLeft
@ultimate/uix-utils/dom#getScrollableParents
@ultimate/uix-utils/dom#getSelection
@ultimate/uix-utils/dom#getTargetElement
@ultimate/uix-utils/dom#getUserAgent
@ultimate/uix-utils/dom#getViewport
@ultimate/uix-utils/dom#getWidth
@ultimate/uix-utils/dom#getWindowScrollLeft
@ultimate/uix-utils/dom#getWindowScrollTop
@ultimate/uix-utils/dom#hasCSSAnimation
@ultimate/uix-utils/dom#hasCSSTransition
@ultimate/uix-utils/dom#hasClass
@ultimate/uix-utils/dom#invokeElementMethod
@ultimate/uix-utils/dom#isAndroid
@ultimate/uix-utils/dom#isAttributeEquals
@ultimate/uix-utils/dom#isAttributeNotEquals
@ultimate/uix-utils/dom#isClickable
@ultimate/uix-utils/dom#isClient
@ultimate/uix-utils/dom#isCssSupported
@ultimate/uix-utils/dom#isElement
@ultimate/uix-utils/dom#isExist
@ultimate/uix-utils/dom#isFocusableElement
@ultimate/uix-utils/dom#isHidden
@ultimate/uix-utils/dom#isIOS
@ultimate/uix-utils/dom#isPrefersReducedMotion
@ultimate/uix-utils/dom#isRTL
@ultimate/uix-utils/dom#isServer
@ultimate/uix-utils/dom#isTouchDevice
@ultimate/uix-utils/dom#isVisible
@ultimate/uix-utils/dom#nestedPosition
@ultimate/uix-utils/dom#nextFrame
@ultimate/uix-utils/dom#relativePosition
@ultimate/uix-utils/dom#remove
@ultimate/uix-utils/dom#removeChild
@ultimate/uix-utils/dom#removeClass
@ultimate/uix-utils/dom#removeStyleTag
@ultimate/uix-utils/dom#resolveUserAgent
@ultimate/uix-utils/dom#scrollInView
@ultimate/uix-utils/dom#setAttribute
@ultimate/uix-utils/dom#setAttributes
@ultimate/uix-utils/dom#setCSSProperty
@ultimate/uix-utils/dom#toElement
@ultimate/uix-utils/dom#blockBodyScroll
@ultimate/uix-utils/dom#exportCSV
@ultimate/uix-utils/dom#saveAs
@ultimate/uix-utils/dom#unblockBodyScroll

## Owned source and evidence

packages/uix-utils/src/dom/helpers/blockBodyScroll.ts
packages/uix-utils/src/dom/helpers/exportCSV.ts
packages/uix-utils/src/dom/helpers/saveAs.ts
packages/uix-utils/src/dom/helpers/unblockBodyScroll.ts
packages/uix-utils/src/dom/index.ts
packages/uix-utils/src/dom/methods/absolutePosition.ts
packages/uix-utils/src/dom/methods/addClass.ts
packages/uix-utils/src/dom/methods/addStyle.ts
packages/uix-utils/src/dom/methods/alignOverlay.ts
packages/uix-utils/src/dom/methods/appendChild.ts
packages/uix-utils/src/dom/methods/calculateBodyScrollbarWidth.ts
packages/uix-utils/src/dom/methods/calculateScrollbarHeight.ts
packages/uix-utils/src/dom/methods/calculateScrollbarWidth.ts
packages/uix-utils/src/dom/methods/clearSelection.ts
packages/uix-utils/src/dom/methods/createElement.ts
packages/uix-utils/src/dom/methods/createStyleAsString.ts
packages/uix-utils/src/dom/methods/createStyleElement.ts
packages/uix-utils/src/dom/methods/createStyleMarkup.ts
packages/uix-utils/src/dom/methods/createStyleTag.ts
packages/uix-utils/src/dom/methods/fadeIn.ts
packages/uix-utils/src/dom/methods/fadeOut.ts
packages/uix-utils/src/dom/methods/find.ts
packages/uix-utils/src/dom/methods/findSingle.ts
packages/uix-utils/src/dom/methods/focus.ts
packages/uix-utils/src/dom/methods/getAttribute.ts
packages/uix-utils/src/dom/methods/getBrowser.ts
packages/uix-utils/src/dom/methods/getBrowserLanguage.ts
packages/uix-utils/src/dom/methods/getCSSProperty.ts
packages/uix-utils/src/dom/methods/getCSSVariableByRegex.ts
packages/uix-utils/src/dom/methods/getCursorOffset.ts
packages/uix-utils/src/dom/methods/getFirstFocusableElement.ts
packages/uix-utils/src/dom/methods/getFocusableElements.ts
packages/uix-utils/src/dom/methods/getHeight.ts
packages/uix-utils/src/dom/methods/getHiddenElementDimensions.ts
packages/uix-utils/src/dom/methods/getHiddenElementOuterHeight.ts
packages/uix-utils/src/dom/methods/getHiddenElementOuterWidth.ts
packages/uix-utils/src/dom/methods/getIndex.ts
packages/uix-utils/src/dom/methods/getInnerWidth.ts
packages/uix-utils/src/dom/methods/getLastFocusableElement.ts
packages/uix-utils/src/dom/methods/getNextElementSibling.ts
packages/uix-utils/src/dom/methods/getNextFocusableElement.ts
packages/uix-utils/src/dom/methods/getOffset.ts
packages/uix-utils/src/dom/methods/getOuterHeight.ts
packages/uix-utils/src/dom/methods/getOuterWidth.ts
packages/uix-utils/src/dom/methods/getParentNode.ts
packages/uix-utils/src/dom/methods/getParents.ts
packages/uix-utils/src/dom/methods/getPreviousElementSibling.ts
packages/uix-utils/src/dom/methods/getScrollLeft.ts
packages/uix-utils/src/dom/methods/getScrollableParents.ts
packages/uix-utils/src/dom/methods/getSelection.ts
packages/uix-utils/src/dom/methods/getTargetElement.ts
packages/uix-utils/src/dom/methods/getUserAgent.ts
packages/uix-utils/src/dom/methods/getViewport.ts
packages/uix-utils/src/dom/methods/getWidth.ts
packages/uix-utils/src/dom/methods/getWindowScrollLeft.ts
packages/uix-utils/src/dom/methods/getWindowScrollTop.ts
packages/uix-utils/src/dom/methods/hasCSSAnimation.ts
packages/uix-utils/src/dom/methods/hasCSSTransition.ts
packages/uix-utils/src/dom/methods/hasClass.ts
packages/uix-utils/src/dom/methods/invokeElementMethod.ts
packages/uix-utils/src/dom/methods/isAndroid.ts
packages/uix-utils/src/dom/methods/isAttributeEquals.ts
packages/uix-utils/src/dom/methods/isAttributeNotEquals.ts
packages/uix-utils/src/dom/methods/isClickable.ts
packages/uix-utils/src/dom/methods/isClient.ts
packages/uix-utils/src/dom/methods/isCssSupported.ts
packages/uix-utils/src/dom/methods/isElement.ts
packages/uix-utils/src/dom/methods/isExist.ts
packages/uix-utils/src/dom/methods/isFocusableElement.ts
packages/uix-utils/src/dom/methods/isHidden.ts
packages/uix-utils/src/dom/methods/isIOS.ts
packages/uix-utils/src/dom/methods/isPrefersReducedMotion.ts
packages/uix-utils/src/dom/methods/isRTL.ts
packages/uix-utils/src/dom/methods/isServer.ts
packages/uix-utils/src/dom/methods/isTouchDevice.ts
packages/uix-utils/src/dom/methods/isVisible.ts
packages/uix-utils/src/dom/methods/nestedPosition.ts
packages/uix-utils/src/dom/methods/nextFrame.ts
packages/uix-utils/src/dom/methods/relativePosition.ts
packages/uix-utils/src/dom/methods/remove.ts
packages/uix-utils/src/dom/methods/removeChild.ts
packages/uix-utils/src/dom/methods/removeClass.ts
packages/uix-utils/src/dom/methods/removeStyleTag.ts
packages/uix-utils/src/dom/methods/resolveUserAgent.ts
packages/uix-utils/src/dom/methods/scrollInView.ts
packages/uix-utils/src/dom/methods/setAttribute.ts
packages/uix-utils/src/dom/methods/setAttributes.ts
packages/uix-utils/src/dom/methods/setCSSProperty.ts
packages/uix-utils/src/dom/methods/toElement.ts

```text
packages/uix-utils/src/dom/index.ts: export { default as absolutePosition } from "./methods/absolutePosition";
packages/uix-utils/src/index.ts: export * from "./dom";
packages/uix-utils/package.json: "./*": {
packages/uix-utils/tsup.config.ts: `${name}/index`, `src/${name}/index.ts`
packages/uix-utils/src/dom/helpers/blockBodyScroll.ts: export interface BlockBodyScrollOptions
packages/uix-utils/src/dom/helpers/unblockBodyScroll.ts: export interface UnblockBodyScrollOptions
```

## Relationships

package.ultimate.uix-utils.scroll-lock (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source inventory documents exports, ownership, evidence, relationships, and current behavior boundaries; it is not a product behavior test."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior tests were intentionally not run for this documentation-only inventory."
  },
  {
    "state": "ci-enforced",
    "behavior": "The repository CI workflow runs lint and formatting for pull requests; docs-only changes skip build, typecheck, and general validation. This records configuration only, not a remote execution.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "behavior": "Repository lint passed; this is static quality evidence, not product behavior evidence.",
    "command": "pnpm lint",
    "revision": "41e8047c4ed60eed2789c89c1bb67b27469cd039",
    "outcome": "passed",
    "limitations": "Static source and repository lint checks do not verify runtime behavior.",
    "output": "ESLint completed with --max-warnings=0; check-svg-text-whitespace: 1964 file(s) checked, no SVG text whitespace.",
    "run": "docs/inventory/uix-utils-dom/lint-run.json"
  },
  {
    "state": "verified",
    "behavior": "Repository TypeScript checks passed across the scoped workspace packages.",
    "command": "pnpm typecheck",
    "revision": "41e8047c4ed60eed2789c89c1bb67b27469cd039",
    "outcome": "passed",
    "limitations": "Type checking is not product behavior evidence.",
    "output": "22 of 23 workspace projects were in scope; all listed typecheck commands completed successfully.",
    "run": "docs/inventory/uix-utils-dom/typecheck-run.json"
  },
  {
    "state": "verified",
    "behavior": "Repository formatting check passed.",
    "command": "pnpm format:check",
    "revision": "41e8047c4ed60eed2789c89c1bb67b27469cd039",
    "outcome": "passed",
    "limitations": "Formatting is not product behavior evidence.",
    "output": "All matched files use Prettier code style!",
    "run": "docs/inventory/uix-utils-dom/format-run.json"
  },
  {
    "state": "unavailable",
    "behavior": "The repository build could not complete because the playground PostCSS configuration could not load postcss-import.",
    "command": "pnpm build",
    "outcome": "unavailable",
    "revision": "41e8047c4ed60eed2789c89c1bb67b27469cd039",
    "limitations": "Failure at apps/playground-react; require stack points to /Users/majedsiefalnasr/postcss.config.mjs.",
    "output": "Cannot find module 'postcss-import'"
  }
]
```
