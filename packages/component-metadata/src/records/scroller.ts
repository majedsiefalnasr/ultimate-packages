import { SCHEMA_VERSION } from "@ultimate/component-schema";
import type { ComponentMetadata } from "@ultimate/component-schema";

/**
 * Ground truth for every field below:
 * - Angular: packages/ng/src/scroller/scroller.ts (UScroller class, `input()`/`output()` signal API)
 * - React: packages/react/src/scroller/scroller.tsx (UScrollerProps interface + destructured props)
 * - Vue: packages/vue/src/scroller/base-scroller.ts (createBaseScroller's `props`)
 *   and packages/vue/src/scroller/Scroller.vue (real `emits` array, `$emit` call site, `onScroll()` method)
 *
 * Scroller was already the subject of extensive real-source research in an
 * earlier, separate implementation plan (its own per-framework tasks —
 * see each source file's own header doc comment and
 * docs/architecture/provenance/{ng,react,vue}.json), including a LATER
 * extension adding an optional content-level composition mechanism (a
 * content-template query on ng, a `contentTemplate` render-prop on react, a
 * `content` scoped slot on vue) built specifically to let a future UTable
 * supply its own `<table><tbody><tr><td>` markup for virtualized rows
 * instead of the built-in per-item `<div>` rendering. This record
 * represents that CURRENT, fully-extended API surface — verified directly
 * against ng scroller.ts:96-232, react scroller.tsx:20-156, and vue
 * Scroller.vue:1-172 / base-scroller.ts:1-14, not an earlier pre-extension
 * version.
 *
 * Props are IDENTICAL across all three frameworks for the core
 * items/itemSize/numToleratedItems triad — same names — but diverge on the
 * remaining flags:
 * - ng declares items/itemSize/numToleratedItems/loading/disabled/lazy as
 *   signal inputs (scroller.ts:96-101), all five behavioral flags present.
 * - react declares the same five in UScrollerProps (scroller.tsx:20-33)
 *   plus the render-prop `contentTemplate`.
 * - vue's base-scroller.ts `props` (base-scroller.ts:8-12) declares ONLY
 *   items/itemSize/numToleratedItems — `disabled`/`loading`/`lazy` are
 *   declared separately, directly on Scroller.vue's own `props` block
 *   (Scroller.vue:57-61), not in the shared base. Both files are real
 *   source for the same component (base-scroller.ts supplies the
 *   base+shared triad that Paginator's own base-paginator.ts pattern
 *   established; Scroller.vue layers the per-component behavioral flags on
 *   top, mirroring the same split already used for componentName/styleModule
 *   wiring). This record's vue props list merges both real declaration
 *   sites, since both together are Vue's actual complete prop surface.
 *
 * Events, verified per framework — the state-ownership MECHANISM diverges
 * sharply even though the semantic payload (`{first, last}`) is identical
 * everywhere:
 * - Angular's `UScroller` declares a single `onLazyLoad = output<{first,
 *   last}>()` (scroller.ts:103). Internal `_first` field is updated
 *   locally by `onScroll()` BEFORE the emit (scroller.ts:159-172), fired
 *   via `Promise.resolve().then()` — matching the "internal-with-local-
 *   first" state-ownership model documented in that file's own header
 *   comment and in provenance/ng.json's scroller.ts entry.
 * - React's `UScrollerProps.onLazyLoad` (scroller.tsx:27) is an OPTIONAL
 *   callback prop: `(event: {first, last}) => void`. `handleScroll`
 *   (scroller.tsx:110-122) owns local `firstState` via `useState` and
 *   calls `onLazyLoad(...)` only `if (lazy && onLazyLoad)` — an optional,
 *   not required, callback (distinct from Paginator's react
 *   `onPageChange`, which IS required there).
 * - Vue's `Scroller.vue` declares `emits: ["lazy-load"]` (Scroller.vue:62)
 *   — ONE event, named `"lazy-load"`, NOT `"onLazyLoad"` (Vue's `emits`
 *   array holds the raw kebab-case event name; `onLazyLoad` would be the
 *   camelCase *listener* prop name Vue derives from it, but the
 *   emitted/declared name itself is `"lazy-load"` — verified directly
 *   against `this.$emit("lazy-load", { first, last })`, Scroller.vue:149).
 *   `onScroll()` (Scroller.vue:140-153) mutates the internal `first` data
 *   property first, then emits via `Promise.resolve().then()`, matching
 *   ng/react's async-dispatch shape exactly even though the state-
 *   ownership/naming convention differs.
 *
 * Cross-framework note: like Paginator, Scroller's CORE props
 * (items/itemSize/numToleratedItems) are fully symmetric across all three
 * frameworks — but UNLIKE Paginator (whose props were exhaustively
 * symmetric), Scroller's remaining behavioral flags (disabled/loading/lazy)
 * diverge in DECLARATION SITE on vue only (split across base-scroller.ts +
 * Scroller.vue) while still being semantically present and named
 * identically on all three. This is a narrower, structural divergence, not
 * a naming or semantic one — independently verified, not assumed to match
 * Paginator's full-symmetry precedent.
 *
 * Content-composition mechanism (ng contentTemplate / react
 * contentTemplate / vue `content` scoped slot) is NOT modeled as a prop or
 * event here: it is an optional per-framework composition point (a
 * `@ContentChild` template query on ng, a function-valued prop on react, a
 * named scoped slot on vue) consumed internally by a future UTable
 * (docs/architecture/COMPONENT_INVENTORY.md's Table row: "primitive +
 * overlay tiers, scroller, paginator"; provenance/{ng,react,vue}.json's own
 * Table entries confirm Table composes UScroller "via its content-template
 * composition point"/"content-render-prop composition point"/"content
 * scoped-slot" rather than reimplementing windowing). It has no equivalent
 * shape in this schema's PropFact/EventFact vocabulary (it is neither a
 * plain data prop nor a user-facing event) and is intentionally left
 * unmodeled rather than force-fit into either.
 *
 * relationships.dependsOn is intentionally omitted: Scroller does not
 * compose any other Ultimate component internally (COMPONENT_INVENTORY.md's
 * Scroller row lists only "basecomponent" as a dependency, i.e. the shared
 * UBaseComponent/useComponentBase/createBaseComponent primitive, not
 * another catalogued ComponentMetadata record) — Scroller is the
 * DEPENDENCY, not the dependent. Task 15's Table record is the one
 * expected to declare `relationships.dependsOn: ["Scroller", ...]`.
 */
export const SCROLLER_METADATA: ComponentMetadata = {
  name: "Scroller",
  category: "Data",
  description:
    "A virtual-scroll windowing primitive that renders only the items currently within (plus a tolerated buffer around) the visible viewport, used internally by Table and other large-list components rather than directly by end users.",
  schemaVersion: SCHEMA_VERSION,
  metadataVersion: 1,
  packages: {
    ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/scroller/scroller.ts" },
    react: { packageName: "@ultimate/react", sourcePath: "packages/react/src/scroller/scroller.tsx" },
    vue: { packageName: "@ultimate/vue", sourcePath: "packages/vue/src/scroller/base-scroller.ts" },
  },
  api: {
    ng: {
      props: [
        { name: "items", type: "unknown[]", default: "[]", required: false, description: "The full, un-windowed array of items to be virtually scrolled." },
        { name: "itemSize", type: "number", default: "0", required: false, description: "Height in pixels of a single rendered item, used for windowing math and content-height calculation." },
        { name: "numToleratedItems", type: "number | undefined", default: "undefined", required: false, description: "Number of extra items rendered as a buffer beyond the visible viewport on each side; when undefined, resolves to half the computed number of items in the viewport." },
        { name: "loading", type: "boolean | undefined", default: "undefined", required: false, description: "When true, shows the built-in loader overlay and sets aria-busy on the root element." },
        { name: "disabled", type: "boolean", default: "false", required: false, description: "When true, bypasses windowing entirely and renders every item in `items` (no virtualization)." },
        { name: "lazy", type: "boolean", default: "false", required: false, description: "When true, enables lazy-load notification: onLazyLoad fires whenever the windowed first index changes on scroll." },
      ],
      events: [
        {
          semanticId: "lazyLoad",
          frameworkName: "onLazyLoad",
          mechanism: "output",
          payloadDescription:
            "{ first: number; last: number } — emitted (via Promise.resolve().then()) after the internal _first field is updated locally, only when lazy() is true and the windowed first index changes on scroll.",
        },
      ],
    },
    react: {
      props: [
        { name: "items", type: "unknown[]", required: true, description: "The full, un-windowed array of items to be virtually scrolled." },
        { name: "itemSize", type: "number", required: true, description: "Height in pixels of a single rendered item, used for windowing math and content-height calculation." },
        { name: "numToleratedItems", type: "number", required: false, description: "Number of extra items rendered as a buffer beyond the visible viewport on each side; when omitted, resolves to half the computed number of items in the viewport." },
        { name: "disabled", type: "boolean", default: "false", required: false, description: "When true, bypasses windowing entirely and renders every item in `items` (no virtualization)." },
        { name: "lazy", type: "boolean", default: "false", required: false, description: "When true, enables lazy-load notification: onLazyLoad fires whenever the windowed first index changes on scroll." },
        { name: "loading", type: "boolean", required: false, description: "When true, shows the built-in loader overlay and sets aria-busy on the root element." },
      ],
      events: [
        {
          semanticId: "lazyLoad",
          frameworkName: "onLazyLoad",
          mechanism: "callback-prop",
          payloadDescription:
            "(event: { first: number; last: number }) => void — optional prop, called (via Promise.resolve().then()) only when both `lazy` and `onLazyLoad` are truthy and the windowed first index changes on scroll. Component owns its own `firstState` internally regardless of whether this callback is supplied.",
        },
      ],
    },
    vue: {
      props: [
        { name: "items", type: "Array", default: "[]", required: false, description: "The full, un-windowed array of items to be virtually scrolled." },
        { name: "itemSize", type: "Number", default: "0", required: false, description: "Height in pixels of a single rendered item, used for windowing math and content-height calculation." },
        { name: "numToleratedItems", type: "Number", default: "null", required: false, description: "Number of extra items rendered as a buffer beyond the visible viewport on each side; when null, resolves to half the computed number of items in the viewport." },
        { name: "disabled", type: "Boolean", default: "false", required: false, description: "When true, bypasses windowing entirely and renders every item in `items` (no virtualization). Declared directly on Scroller.vue, not in the shared base-scroller.ts triad." },
        { name: "loading", type: "Boolean", default: "false", required: false, description: "When true, shows the built-in loader overlay and sets aria-busy on the root element. Declared directly on Scroller.vue, not in the shared base-scroller.ts triad." },
        { name: "lazy", type: "Boolean", default: "false", required: false, description: "When true, enables lazy-load notification: 'lazy-load' emits whenever the windowed first index changes on scroll. Declared directly on Scroller.vue, not in the shared base-scroller.ts triad." },
      ],
      events: [
        {
          semanticId: "lazyLoad",
          frameworkName: "lazy-load",
          mechanism: "emit",
          payloadDescription:
            "{ first: number; last: number } — emitted (via Promise.resolve().then()) after the internal `first` data property is updated locally, only when `lazy` is true and the windowed first index changes on scroll. NOT named 'onLazyLoad' — the declared emits-array name is 'lazy-load'.",
        },
      ],
    },
  },
  style: {
    componentName: "scroller",
  },
  provenanceRef: {
    package: "ng",
    ultimateDestinations: ["packages/ng/src/scroller/scroller.ts", "packages/ng/src/scroller/scroller-style.ts"],
  },
};
