# Vue UContextMenu

ID: vue.context-menu

Framework: vue; availability: public

## Authored interpretation

Flat contextual command list; global=false uses the default slot trigger wrapper, global=true binds document contextmenu.

## Framework surface

Flat contextual command list; global=false uses the default slot trigger wrapper, global=true binds document contextmenu. show(event) reads pageX/pageY, prevents native menu, focuses the list; hide dismisses. UPortal and z-index, shared global Escape/display-order, outside-click and resize cleanup. aria-activedescendant, ArrowUp/Down, Home/End and Enter/Space activation; Tab closes. No recursive submenu or item template slot. Public root and secondary entry exports: UContextMenu. All SFC names: UContextMenu. createBaseContextMenu, ContextMenuItemClassesParams, contextMenuStyleModule: base factories return defineComponent Options API objects extending createBaseComponent, not composables/hooks or plugin installers. createBaseContextMenu is source-only, not a package export. Style modules and class parameter interfaces are source-only (not re-exported); their consumer is cx(key,params) in the component/base, not a supported package subpath. Class parameter fields: ContextMenuItemClassesParams: disabled?: boolean; focused?: boolean;. Props source/default declarations: model: { type: Array as PropType<readonly unknown[]>, default: () => [] }, global: { type: Boolean, default: false }. Declared main emits: "show", "hide", "item-select". All families declare model as readonly unknown[] (runtime Array) default []; no independently exported MenuItem model type. createBaseComponent registers local structural CSS/classes on mount through registerComponentStyle; styling registers theme variables for componentName then CSS idempotently. Aura key contextmenu exists. No dedicated component-metadata record found for this family. Prime source references in style comments are provenance, not parity or gap judgments.

## Public exports

@ultimate/vue#UContextMenu
@ultimate/vue/context-menu#UContextMenu

## Owned source and evidence

packages/vue/src/context-menu/BaseContextMenu.ts
packages/vue/src/context-menu/ContextMenu.vue
packages/vue/src/context-menu/context-menu-style.ts
packages/vue/src/context-menu/index.ts

```text
packages/vue/src/context-menu/ContextMenu.vue: name: "UContextMenu"
packages/vue/src/context-menu/index.ts: export { default as UContextMenu }
packages/vue/src/context-menu/BaseContextMenu.ts: createBaseComponent
packages/vue/src/context-menu/context-menu-style.ts: contextMenuStyleModule
packages/vue/src/index.ts: export * from "./context-menu";
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule)
packages/vue-core/src/styling/vue-style-sheet.ts: registerThemeVariables(vueCoreStyleSheet, componentName)
packages/themes/src/presets/aura/index.ts: contextmenu
```

## Relationships

package.ultimate.vue.context-menu → [vue.context-menu](vue.context-menu.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
package.ultimate.vue-core.zindex (pending cross-batch)
package.ultimate.vue-core.escape (pending cross-batch)
package.ultimate.uix-utils.escape (pending cross-batch)

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
