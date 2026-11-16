# Vue UScroller

ID: vue.scroller

Framework: vue; availability: public

## Authored interpretation

Render a vertical window over items with optional lazy-load notifications and a content slot.

## Framework surface

Each is an Options API SFC extending its exported base factory, which extends createBaseComponent from @ultimate/vue-core; mounted registers its component style and cx resolves its local class map. Source-only style module is not re-exported by the family barrel. No plugin, directive or composable is exported by the family entry. UScroller and createBaseScroller; source-only scrollerStyleModule. The base declares items (empty array), itemSize (0), numToleratedItems (null); the SFC adds disabled, loading and lazy (false) and emits lazy-load. It measures vertical viewport height on mount, observes resize with ResizeObserver and disconnects on unmount; itemSize and items changes recompute the window. calculateNumItemsInViewport and calculateLast come from @ultimate/uix-data; default overscan is ceil(viewport/2), with last clamped to live items length. visibleItems contains {index,value} for the window, or all items when disabled; disabled does not disable scroll processing. The content slot receives items, getItemOptions, itemSize and loading; default rows are interpolated and positioned absolutely at index*itemSize within a content element of items.length*itemSize height. onScroll computes first from scrollTop/(itemSize||1); when first changes, lazy mode emits {first,last} asynchronously via Promise, not on initial mount. Instance methods include scrollTo(options), scrollToIndex(index, behavior='auto'), getItemOptions(index) returning {index,count,first,last,even,odd}, getLast(last=0,isCols=false), recompute and onScroll. getLast uses the same item length for either isCols branch. scrollerStyleModule imports @ultimate/uix-styles/virtualscroller and defines local u-scroller CSS and class names.

## Public exports

@ultimate/vue#UScroller
@ultimate/vue/scroller#UScroller
@ultimate/vue#createBaseScroller
@ultimate/vue/scroller#createBaseScroller

## Owned source and evidence

packages/vue/src/scroller/Scroller.vue
packages/vue/src/scroller/base-scroller.ts
packages/vue/src/scroller/scroller-style.ts
packages/vue/src/scroller/index.ts

```text
packages/vue/src/scroller/Scroller.vue: name: "UScroller"
packages/vue/src/scroller/base-scroller.ts: createBaseScroller
packages/vue/src/scroller/scroller-style.ts: export const scrollerStyleModule
packages/vue/src/scroller/index.ts: createBaseScroller
packages/vue/src/index.ts: export * from "./scroller";
packages/vue/package.json: "./scroller": {
packages/vue/src/scroller/Scroller.vue: new ResizeObserver(
packages/vue/src/scroller/Scroller.vue: Promise.resolve().then(() => {
packages/vue/src/scroller/Scroller.vue: this.$emit("lazy-load", { first, last });
packages/vue/src/scroller/Scroller.vue: :get-item-options="getItemOptions"
packages/vue/src/scroller/Scroller.vue: return this.items.map((value, index) => ({ index, value }));
```

## Relationships

package.ultimate.vue.scroller → [vue.scroller](vue.scroller.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)
package.ultimate.uix-data.virtualization (pending cross-batch)
package.ultimate.uix-styles.virtualscroller (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The SFC, base factory and local style module exist in source; implementation evidence alone is not a passing behavior check."
  },
  {
    "state": "verified",
    "behavior": "The bounded existing Vue table, paginator and scroller specs passed together in the documented local run.",
    "run": "docs/inventory/vue-table-viewport/product-run.json",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/table/ src/paginator/ src/scroller/ --config /tmp/vitest-vue133.config.mjs --maxWorkers=1 --no-file-parallelism",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "outcome": "passed",
    "output": "Test Files  3 passed (3)\nTests  97 passed (97)",
    "limitations": "Temporary external config uses the Vue plugin and jsdom with css.postcss.plugins=[] to bypass the host ancestor PostCSS config; CSS processing and visuals are not verified. Prerequisite workspace builds were run. A single local run at the source revision; not a remote CI run."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured conditional non-docs CI Test step runs root pnpm run test, which invokes the Vue test script; this describes workflow configuration, not a successful run or branch protection. The scoped inventory Node tests are not included in test:scripts.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); earlier steps can prevent execution. No remote CI run observed."
  }
]
```
