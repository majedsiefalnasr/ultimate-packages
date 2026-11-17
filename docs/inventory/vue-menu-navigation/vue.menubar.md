# Vue UMenubar

ID: vue.menubar

Framework: vue; availability: public

## Authored interpretation

UMenubar delegates to public recursive UMenubarSub (items default [], root default false, item-select).

## Framework surface

UMenubar delegates to public recursive UMenubarSub (items default [], root default false, item-select). toRaw compares open-item identity. Horizontal root ArrowRight/Left; vertical submenu ArrowDown/Up; Home/End, Enter/Space open and focus first child. Escape closes innermost open submenu and stops propagation. Inline CSS-positioned submenus, no portal/global overlay manager; enabled leaf invokes command then item-select. No named template slots. Public root and secondary entry exports: UMenubar, UMenubarSub, createBaseMenubar. All SFC names: UMenubar, UMenubarSub. createBaseMenubar, MenubarClassesParams, menubarStyleModule: base factories return defineComponent Options API objects extending createBaseComponent, not composables/hooks or plugin installers. The base factory is public through both barrels. Style modules and class parameter interfaces are source-only (not re-exported); their consumer is cx(key,params) in the component/base, not a supported package subpath. Class parameter fields: MenubarClassesParams: disabled?: boolean; open?: boolean;. Props source/default declarations: model: { type: Array as PropType<readonly unknown[]>, default: () => [] }, ariaLabel: { type: String, default: null }. Declared main emits: "item-select". All families declare model as readonly unknown[] (runtime Array) default []; no independently exported MenuItem model type. createBaseComponent registers local structural CSS/classes on mount through registerComponentStyle; styling registers theme variables for componentName then CSS idempotently. Aura key menubar exists. No dedicated component-metadata record found for this family. Prime source references in style comments are provenance, not parity or gap judgments.

## Public exports

@ultimate/vue#UMenubar
@ultimate/vue/menubar#UMenubar
@ultimate/vue#UMenubarSub
@ultimate/vue/menubar#UMenubarSub
@ultimate/vue#createBaseMenubar
@ultimate/vue/menubar#createBaseMenubar

## Owned source and evidence

packages/vue/src/menubar/BaseMenubar.ts
packages/vue/src/menubar/Menubar.vue
packages/vue/src/menubar/MenubarSub.vue
packages/vue/src/menubar/index.ts
packages/vue/src/menubar/menubar-style.ts

```text
packages/vue/src/menubar/Menubar.vue: name: "UMenubar"
packages/vue/src/menubar/index.ts: export { default as UMenubar }
packages/vue/src/menubar/BaseMenubar.ts: createBaseComponent
packages/vue/src/menubar/menubar-style.ts: menubarStyleModule
packages/vue/src/index.ts: export * from "./menubar";
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule)
packages/vue-core/src/styling/vue-style-sheet.ts: registerThemeVariables(vueCoreStyleSheet, componentName)
packages/themes/src/presets/aura/index.ts: menubar
packages/vue/src/menubar/MenubarSub.vue: props: {
```

## Relationships

package.ultimate.vue.menubar → [vue.menubar](vue.menubar.md) (reconciled family alias)
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
