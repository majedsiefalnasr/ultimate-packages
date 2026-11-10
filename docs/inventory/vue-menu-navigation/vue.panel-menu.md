# Vue UPanelMenu

ID: vue.panel-menu

Framework: vue; availability: public

## Authored interpretation

UPanelMenu owns expandedItems Set with position-derived hierarchical keys, passes it to public recursive UPanelMenuList (items/nodeKey/expandedItems/multiple props, item-select).

## Framework surface

UPanelMenu owns expandedItems Set with position-derived hierarchical keys, passes it to public recursive UPanelMenuList (items/nodeKey/expandedItems/multiple props, item-select). multiple=false enforces sibling exclusivity; expansion is internal, not controlled expandedKeys. Tree/treeitem roles and aria-expanded; vertical arrows/Home/End and Enter/Space toggle or activate; no Escape system. v-if removes collapsed children; no overlay or transition service. No named template slots. Public root and secondary entry exports: UPanelMenu, UPanelMenuList, createBasePanelMenu. All SFC names: UPanelMenu, UPanelMenuList. createBasePanelMenu, PanelMenuClassesParams, panelMenuStyleModule: base factories return defineComponent Options API objects extending createBaseComponent, not composables/hooks or plugin installers. The base factory is public through both barrels. Style modules and class parameter interfaces are source-only (not re-exported); their consumer is cx(key,params) in the component/base, not a supported package subpath. Class parameter fields: PanelMenuClassesParams: disabled?: boolean; expanded?: boolean;. Props source/default declarations: model: { type: Array as PropType<readonly unknown[]>, default: () => [] }, multiple: { type: Boolean, default: false }. Declared main emits: "item-select". All families declare model as readonly unknown[] (runtime Array) default []; no independently exported MenuItem model type. createBaseComponent registers local structural CSS/classes on mount through registerComponentStyle; styling registers theme variables for componentName then CSS idempotently. Aura key panelmenu exists. No dedicated component-metadata record found for this family. Prime source references in style comments are provenance, not parity or gap judgments. UPanelMenuList items:Array defaults [], nodeKey:String defaults empty string, expandedItems:Object is required, multiple:Boolean defaults false.

## Public exports

@ultimate/vue#UPanelMenu
@ultimate/vue/panel-menu#UPanelMenu
@ultimate/vue#UPanelMenuList
@ultimate/vue/panel-menu#UPanelMenuList
@ultimate/vue#createBasePanelMenu
@ultimate/vue/panel-menu#createBasePanelMenu

## Owned source and evidence

packages/vue/src/panel-menu/BasePanelMenu.ts
packages/vue/src/panel-menu/PanelMenu.vue
packages/vue/src/panel-menu/PanelMenuList.vue
packages/vue/src/panel-menu/index.ts
packages/vue/src/panel-menu/panel-menu-style.ts

```text
packages/vue/src/panel-menu/PanelMenu.vue: name: "UPanelMenu"
packages/vue/src/panel-menu/index.ts: export { default as UPanelMenu }
packages/vue/src/panel-menu/BasePanelMenu.ts: createBaseComponent
packages/vue/src/panel-menu/panel-menu-style.ts: panelMenuStyleModule
packages/vue/src/index.ts: export * from "./panel-menu";
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule)
packages/vue-core/src/styling/vue-style-sheet.ts: registerThemeVariables(vueCoreStyleSheet, componentName)
packages/themes/src/presets/aura/index.ts: panelmenu
packages/vue/src/panel-menu/PanelMenuList.vue: props: {
```

## Relationships

package.ultimate.vue.panel-menu → [vue.panel-menu](vue.panel-menu.md) (reconciled family alias)
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
