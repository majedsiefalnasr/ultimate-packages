# Vue USpeedDial

ID: vue.speed-dial

Framework: vue; availability: public

## Authored interpretation

Native toggle/action buttons and optional mask, d_visible initialized/watched from visible; emits update:visible/click/show/hide.

## Framework surface

Native toggle/action buttons and optional mask, d_visible initialized/watched from visible; emits update:visible/click/show/hide. linear, circle, semi-circle and quarter-circle item geometry uses radius and transitionDelay. Hidden items stay in DOM with CSS visibility, focus search skips hidden/disabled items. Direction controls arrow axis, Home/End, Escape closes/refocuses. document Escape binds on show and unbinds hide/unmount; external visible watch updates state without show/hide lifecycle. No UButton dependency, portal, motion service or named template slot. Public root and secondary entry exports: USpeedDial, createBaseSpeedDial. All SFC names: USpeedDial. createBaseSpeedDial, speedDialStyleModule: base factories return defineComponent Options API objects extending createBaseComponent, not composables/hooks or plugin installers. The base factory is public through both barrels. Style modules and class parameter interfaces are source-only (not re-exported); their consumer is cx(key,params) in the component/base, not a supported package subpath. Class parameter fields: [. Props source/default declarations: model: { type: Array as PropType<readonly unknown[]>, default: () => [] }, visible: { type: Boolean, default: false }, icon: { type: String, default: undefined }, direction: { type: String, default: "up" }, type: { type: String, default: "linear" }, radius: { type: Number, default: 0 }, transitionDelay: { type: Number, default: 30 }, mask: { type: Boolean, default: false }, disabled: { type: Boolean, default: false }, closeOnEscape: { type: Boolean, default: true }, ariaLabel: { type: String, default: null }. Declared main emits: "update:visible", "click", "show", "hide". All families declare model as readonly unknown[] (runtime Array) default []; no independently exported MenuItem model type. createBaseComponent registers local structural CSS/classes on mount through registerComponentStyle; styling registers theme variables for componentName then CSS idempotently. Aura key speeddial exists. No dedicated component-metadata record found for this family. Prime source references in style comments are provenance, not parity or gap judgments.

## Public exports

@ultimate/vue#USpeedDial
@ultimate/vue/speed-dial#USpeedDial
@ultimate/vue#createBaseSpeedDial
@ultimate/vue/speed-dial#createBaseSpeedDial

## Owned source and evidence

packages/vue/src/speed-dial/BaseSpeedDial.ts
packages/vue/src/speed-dial/SpeedDial.vue
packages/vue/src/speed-dial/index.ts
packages/vue/src/speed-dial/speed-dial-style.ts

```text
packages/vue/src/speed-dial/SpeedDial.vue: name: "USpeedDial"
packages/vue/src/speed-dial/index.ts: export { default as USpeedDial }
packages/vue/src/speed-dial/BaseSpeedDial.ts: createBaseComponent
packages/vue/src/speed-dial/speed-dial-style.ts: speedDialStyleModule
packages/vue/src/index.ts: export * from "./speed-dial";
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule)
packages/vue-core/src/styling/vue-style-sheet.ts: registerThemeVariables(vueCoreStyleSheet, componentName)
packages/themes/src/presets/aura/index.ts: speeddial
```

## Relationships

package.ultimate.vue.speed-dial → [vue.speed-dial](vue.speed-dial.md) (reconciled family alias)
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
