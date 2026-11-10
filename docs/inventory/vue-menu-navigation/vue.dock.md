# Vue UDock

ID: vue.dock

Framework: vue; availability: public

## Authored interpretation

Flat command dock positioned bottom by default; visible!==false filters model, disabled items cannot activate.

## Framework surface

Flat command dock positioned bottom by default; visible!==false filters model, disabled items cannot activate. Position controls horizontal/vertical arrow axis with Home and End. item-select is emitted then command callback invoked. Native anchors and aria-label, CSS hover/active scale(1.5), no JS magnification engine or overlay/portal. No item template slot. Public root and secondary entry exports: UDock, createBaseDock. All SFC names: UDock. createBaseDock, dockStyleModule: base factories return defineComponent Options API objects extending createBaseComponent, not composables/hooks or plugin installers. The base factory is public through both barrels. Style modules and class parameter interfaces are source-only (not re-exported); their consumer is cx(key,params) in the component/base, not a supported package subpath. No named class-parameter interface is declared for this family. Props source/default declarations: model: { type: Array as PropType<readonly unknown[]>, default: () => [] }, position: { type: String, default: "bottom" }, ariaLabel: { type: String, default: null }. Declared main emits: "item-select". All families declare model as readonly unknown[] (runtime Array) default []; no independently exported MenuItem model type. createBaseComponent registers local structural CSS/classes on mount through registerComponentStyle; styling registers theme variables for componentName then CSS idempotently. Aura key dock exists. No dedicated component-metadata record found for this family. Prime source references in style comments are provenance, not parity or gap judgments.

## Public exports

@ultimate/vue#UDock
@ultimate/vue/dock#UDock
@ultimate/vue#createBaseDock
@ultimate/vue/dock#createBaseDock

## Owned source and evidence

packages/vue/src/dock/BaseDock.ts
packages/vue/src/dock/Dock.vue
packages/vue/src/dock/dock-style.ts
packages/vue/src/dock/index.ts

```text
packages/vue/src/dock/Dock.vue: name: "UDock"
packages/vue/src/dock/index.ts: export { default as UDock }
packages/vue/src/dock/BaseDock.ts: createBaseComponent
packages/vue/src/dock/dock-style.ts: dockStyleModule
packages/vue/src/index.ts: export * from "./dock";
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule)
packages/vue-core/src/styling/vue-style-sheet.ts: registerThemeVariables(vueCoreStyleSheet, componentName)
packages/themes/src/presets/aura/index.ts: dock
```

## Relationships

package.ultimate.vue.dock → [vue.dock](vue.dock.md) (reconciled family alias)
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
