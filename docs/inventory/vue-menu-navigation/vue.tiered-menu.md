# Vue UTieredMenu

ID: vue.tiered-menu

Framework: vue; availability: public

## Authored interpretation

UTieredMenu composes public recursive UTieredMenuSub (items/root props, item-select), with toRaw open identity.

## Framework surface

UTieredMenu composes public recursive UTieredMenuSub (items/root props, item-select), with toRaw open identity. Vertical arrows/Home/End at each level, ArrowRight and Enter/Space open child; Escape closes innermost submenu with stopPropagation. Root popup show/hide/toggle uses document Escape and outside-click listeners with cleanup; no portal or target-coordinate alignment. Local CSS overlay root starts at top/left -9999px, a source observation not repaired. Fixed templates; no named slots. Public root and secondary entry exports: UTieredMenu, UTieredMenuSub, createBaseTieredMenu. All SFC names: UTieredMenu, UTieredMenuSub. createBaseTieredMenu, TieredMenuClassesParams, tieredMenuStyleModule: base factories return defineComponent Options API objects extending createBaseComponent, not composables/hooks or plugin installers. The base factory is public through both barrels. Style modules and class parameter interfaces are source-only (not re-exported); their consumer is cx(key,params) in the component/base, not a supported package subpath. Class parameter fields: TieredMenuClassesParams: disabled?: boolean; open?: boolean;. Props source/default declarations: model: { type: Array as PropType<readonly unknown[]>, default: () => [] }, popup: { type: Boolean, default: false }. Declared main emits: "item-select", "show", "hide". All families declare model as readonly unknown[] (runtime Array) default []; no independently exported MenuItem model type. createBaseComponent registers local structural CSS/classes on mount through registerComponentStyle; styling registers theme variables for componentName then CSS idempotently. Aura key tieredmenu exists. No dedicated component-metadata record found for this family. Prime source references in style comments are provenance, not parity or gap judgments. UTieredMenuSub items:Array defaults [], root:Boolean defaults false.

## Public exports

@ultimate/vue#UTieredMenu
@ultimate/vue/tiered-menu#UTieredMenu
@ultimate/vue#UTieredMenuSub
@ultimate/vue/tiered-menu#UTieredMenuSub
@ultimate/vue#createBaseTieredMenu
@ultimate/vue/tiered-menu#createBaseTieredMenu

## Owned source and evidence

packages/vue/src/tiered-menu/BaseTieredMenu.ts
packages/vue/src/tiered-menu/TieredMenu.vue
packages/vue/src/tiered-menu/TieredMenuSub.vue
packages/vue/src/tiered-menu/index.ts
packages/vue/src/tiered-menu/tiered-menu-style.ts

```text
packages/vue/src/tiered-menu/TieredMenu.vue: name: "UTieredMenu"
packages/vue/src/tiered-menu/index.ts: export { default as UTieredMenu }
packages/vue/src/tiered-menu/BaseTieredMenu.ts: createBaseComponent
packages/vue/src/tiered-menu/tiered-menu-style.ts: tieredMenuStyleModule
packages/vue/src/index.ts: export * from "./tiered-menu";
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule)
packages/vue-core/src/styling/vue-style-sheet.ts: registerThemeVariables(vueCoreStyleSheet, componentName)
packages/themes/src/presets/aura/index.ts: tieredmenu
packages/vue/src/tiered-menu/TieredMenuSub.vue: props: {
```

## Relationships

package.ultimate.vue.tiered-menu → [vue.tiered-menu](vue.tiered-menu.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Owned Vue component/base/style/helper sources and declared interfaces inspected; this is not executed runtime verification."
  },
  {
    "state": "failed",
    "behavior": "Bounded existing Vue product specs attempted; startup aborted before assertions, not a component assertion failure.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/menu/menu.spec.ts src/context-menu/context-menu.spec.ts src/breadcrumb/breadcrumb.spec.ts src/mega-menu/mega-menu.spec.ts src/menubar/menubar.spec.ts src/panel-menu/panel-menu.spec.ts src/tiered-menu/tiered-menu.spec.ts src/dock/dock.spec.ts src/speed-dial/speed-dial.spec.ts --maxWorkers=1 --minWorkers=1",
    "outcome": "failed",
    "revision": "c15f80a751deffcf91566d7a4353d95d73548589",
    "output": "Failed to load PostCSS config: Loading PostCSS Plugin failed: Cannot find module 'postcss-import'; require stack /Users/majedsiefalnasr/postcss.config.mjs; exit 1",
    "limitations": "Vitest 2.1.9 on Node v24.22.2 / pnpm 9.6.0. No product assertions, host or product repair, visual/browser checks or CI run. Inventory tests are separate."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured root pnpm run test invokes Vue vitest for non-docs CI classification; configuration evidence only, not observed CI execution. Inventory Node tests are not claimed CI-enforced.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional scope and upstream steps; no branch-protection claim."
  }
]
```
