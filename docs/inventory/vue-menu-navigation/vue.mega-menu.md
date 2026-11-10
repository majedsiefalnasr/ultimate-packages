# Vue UMegaMenu

ID: vue.mega-menu

Framework: vue; availability: public

## Authored interpretation

Horizontal root with inline columns/groups, not arbitrary recursive nesting.

## Framework surface

Horizontal root with inline columns/groups, not arbitrary recursive nesting. UMegaMenuColumnGroup is a public composition export with required group prop and item-select emit, extending the shared base/style directly. toRaw preserves open-item identity. Root ArrowLeft/ArrowRight, Home/End and Enter/Space open; group leaves use ArrowUp/Down, Escape closes/refocuses root. Inline overlay DOM, no portal or shared z-index. Fixed item markup and no named template slots. Public root and secondary entry exports: UMegaMenu, UMegaMenuColumnGroup, createBaseMegaMenu. All SFC names: UMegaMenu, UMegaMenuColumnGroup. createBaseMegaMenu, MegaMenuClassesParams, megaMenuStyleModule: base factories return defineComponent Options API objects extending createBaseComponent, not composables/hooks or plugin installers. The base factory is public through both barrels. Style modules and class parameter interfaces are source-only (not re-exported); their consumer is cx(key,params) in the component/base, not a supported package subpath. Class parameter fields: MegaMenuClassesParams: disabled?: boolean; open?: boolean;. Props source/default declarations: model: { type: Array as PropType<readonly unknown[]>, default: () => [] }, ariaLabel: { type: String, default: null }. Declared main emits: "item-select". All families declare model as readonly unknown[] (runtime Array) default []; no independently exported MenuItem model type. createBaseComponent registers local structural CSS/classes on mount through registerComponentStyle; styling registers theme variables for componentName then CSS idempotently. Aura key megamenu exists. No dedicated component-metadata record found for this family. Prime source references in style comments are provenance, not parity or gap judgments.

## Public exports

@ultimate/vue#UMegaMenu
@ultimate/vue/mega-menu#UMegaMenu
@ultimate/vue#UMegaMenuColumnGroup
@ultimate/vue/mega-menu#UMegaMenuColumnGroup
@ultimate/vue#createBaseMegaMenu
@ultimate/vue/mega-menu#createBaseMegaMenu

## Owned source and evidence

packages/vue/src/mega-menu/BaseMegaMenu.ts
packages/vue/src/mega-menu/MegaMenu.vue
packages/vue/src/mega-menu/MegaMenuColumnGroup.vue
packages/vue/src/mega-menu/index.ts
packages/vue/src/mega-menu/mega-menu-style.ts

```text
packages/vue/src/mega-menu/MegaMenu.vue: name: "UMegaMenu"
packages/vue/src/mega-menu/index.ts: export { default as UMegaMenu }
packages/vue/src/mega-menu/BaseMegaMenu.ts: createBaseComponent
packages/vue/src/mega-menu/mega-menu-style.ts: megaMenuStyleModule
packages/vue/src/index.ts: export * from "./mega-menu";
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule)
packages/vue-core/src/styling/vue-style-sheet.ts: registerThemeVariables(vueCoreStyleSheet, componentName)
packages/themes/src/presets/aura/index.ts: megamenu
packages/vue/src/mega-menu/MegaMenuColumnGroup.vue: props: {
```

## Relationships

package.ultimate.vue.mega-menu → [vue.mega-menu](vue.mega-menu.md) (reconciled family alias)
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
