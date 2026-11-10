# Vue UMenu

ID: vue.menu

Framework: vue; availability: public

## Authored interpretation

Flat command list; nested model entries are skipped.

## Framework surface

Flat command list; nested model entries are skipped. UMenuitem is source-only (not barrel exported): item/id/focusedOptionId props, item-click/item-mousemove emits, ripple directive. List focus uses aria-activedescendant, ArrowUp/Down, Home/End, Enter/Space and local Escape/Tab dismissal. Public instance show/hide/toggle manages popup state and target alignment; UPortal is disabled inline. Motion hooks drive show/hide emits and onAfterLeave clears z-index. Outside click, resize and scroll listeners are removed on hide/unmount. No focus trap or shared global Escape adapter. Default/start/end/item slots are not implemented; model renders fixed markup. Public root and secondary entry exports: UMenu, createBaseMenu. All SFC names: UMenu, UMenuitem. createBaseMenu, MenuItemClassesParams, menuStyleModule: base factories return defineComponent Options API objects extending createBaseComponent, not composables/hooks or plugin installers. The base factory is public through both barrels. Style modules and class parameter interfaces are source-only (not re-exported); their consumer is cx(key,params) in the component/base, not a supported package subpath. Class parameter fields: MenuItemClassesParams: focused?: boolean; disabled?: boolean;. Props source/default declarations: model: { type: Array as PropType<readonly unknown[]>, default: () => [] }, popup: { type: Boolean, default: false }, appendTo: { type: [String, Object], default: "body" }, autoZIndex: { type: Boolean, default: true }, baseZIndex: { type: Number, default: 0 }, tabindex: { type: Number, default: 0 }, ariaLabel: { type: String, default: null }, ariaLabelledby: { type: String, default: null }. Declared main emits: "show", "hide", "focus", "blur". All families declare model as readonly unknown[] (runtime Array) default []; no independently exported MenuItem model type. createBaseComponent registers local structural CSS/classes on mount through registerComponentStyle; styling registers theme variables for componentName then CSS idempotently. Aura key menu exists. menuStyleModule imports shared @ultimate/uix-styles/menu CSS; other navigation families author local structural CSS. Menu metadata exists but is selective and source line references may be historical; current Vue emits include focus/blur. Prime source references in style comments are provenance, not parity or gap judgments. UMenuitem requires item:Object and id:String; focusedOptionId:String|Number|null defaults null; its direct base registers componentName menuitem with the menu style module.

## Public exports

@ultimate/vue#UMenu
@ultimate/vue/menu#UMenu
@ultimate/vue#createBaseMenu
@ultimate/vue/menu#createBaseMenu

## Owned source and evidence

packages/vue/src/menu/BaseMenu.ts
packages/vue/src/menu/Menu.vue
packages/vue/src/menu/Menuitem.vue
packages/vue/src/menu/index.ts
packages/vue/src/menu/menu-style.ts

```text
packages/vue/src/menu/Menu.vue: name: "UMenu"
packages/vue/src/menu/index.ts: export { default as UMenu }
packages/vue/src/menu/BaseMenu.ts: createBaseComponent
packages/vue/src/menu/menu-style.ts: menuStyleModule
packages/vue/src/index.ts: export * from "./menu";
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule)
packages/vue-core/src/styling/vue-style-sheet.ts: registerThemeVariables(vueCoreStyleSheet, componentName)
packages/themes/src/presets/aura/index.ts: menu
packages/component-metadata/src/records/menu.ts: Vue: packages/vue/src/menu/BaseMenu.ts
packages/vue/src/menu/Menuitem.vue: props: {
```

## Relationships

package.ultimate.vue.menu → [vue.menu](vue.menu.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
package.ultimate.vue-core.zindex (pending cross-batch)
package.ultimate.vue-core.motion (pending cross-batch)
package.ultimate.uix-utils.dom (pending cross-batch)
package.ultimate.vue.ripple (pending cross-batch)
package.ultimate.uix-styles.menu (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

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
