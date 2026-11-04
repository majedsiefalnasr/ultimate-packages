# Vue UButton

ID: vue.button

Framework: vue; availability: public

## Authored interpretation

Native action button with loading, icon, badge, polymorphic root and tooltip; retains pilot vue.button identity.

## Framework surface

label/icon/iconPos(left default)/iconClass, badge/badgeClass/badgeSeverity(secondary), loading(false)/loadingIcon, as(BUTTON)/asChild(false), link/severity/raised/rounded/text/outlined/size/variant/plain/fluid(null), ariaLabel, tooltip/tooltipOptions are declared props. pcFluid injection supplies fluid when null. Loading uses SpinnerIcon and disables only the native button root. rootAttrs explicitly merges attrs then overrides aria-label, disabled and type; default type is button. asChild renders the default slot with class only, not a cloned child. Default slot follows label; badge is a span, not UBadge; badgeSeverity is declared but unused in rendering. Ripple and tooltip directives attach only on the normal root. styleParams, tag, hasIcon, resolvedAriaLabel, rootAttrs and tooltipBinding are owned computed helpers. ButtonClassesParams is a source-only style contract, not a public barrel type. UButton and createBaseButton are named exports from both @ultimate/vue and @ultimate/vue/button. createBaseButton is a public zero-argument Options-API base factory, extending createBaseComponent({componentName,styleModule}), not a Composition API hook. cx class resolution and mounted registerComponentStyle belong to vue-core, not this record. ButtonClassesParams, buttonStyleModule and local css/classes resolvers are owned source-only style/helper/type declarations; no style subpath is advertised. CSS imports the shared token-bearing style string from @ultimate/uix-styles/button. Aura registry has the button token namespace. BUTTON_METADATA points to base-button.ts. Declared manifest dist entry/type paths establish intended consumer availability, not built artifacts or publication. No standalone scoped composable or directive implementation is exported.

## Public exports

@ultimate/vue#UButton
@ultimate/vue#createBaseButton
@ultimate/vue/button#UButton
@ultimate/vue/button#createBaseButton

## Owned source and evidence

packages/vue/src/button/Button.vue
packages/vue/src/button/base-button.ts
packages/vue/src/button/button-style.ts
packages/vue/src/button/index.ts

```text
packages/vue/src/button/index.ts: export { default as UButton } from "./Button.vue";
export { createBaseButton } from "./base-button";
packages/vue/src/button/base-button.ts: export function createBaseButton
packages/vue/src/button/button-style.ts: export const buttonStyleModule
packages/vue/src/button/Button.vue: name: "UButton"
```

## Relationships

package.ultimate.vue.button → [vue.button](vue.button.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.uix-styles.button (pending cross-batch)
package.ultimate.vue-core.icons (pending cross-batch)
package.ultimate.vue.ripple (pending cross-batch)
package.ultimate.vue.tooltip (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Read component template, base factory and style helpers directly; source existence and interpretation only."
  },
  {
    "state": "unavailable",
    "behavior": "Existing bounded product runner aborted before assertions.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/button/ src/button-group/ src/split-button/ src/avatar/ src/avatar-group/ src/badge/ src/overlay-badge/ src/chip/ src/tag/ src/toolbar/",
    "outcome": "unavailable",
    "revision": "37aa7ce8525c6f1622127eb1735ec41beb4096c5",
    "limitations": "Host ancestor PostCSS config requires unavailable postcss-import; no product assertions executed. No product or host repair; no browser/build/publish proof.",
    "output": "Vitest 2.1.9: Failed to load PostCSS config; Cannot find module 'postcss-import'; require stack /Users/majedsiefalnasr/postcss.config.mjs; exit 1"
  }
]
```
