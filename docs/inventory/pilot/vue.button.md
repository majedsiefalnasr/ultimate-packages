# Vue UButton and base factory

ID: vue.button

Framework: vue; availability: public

## Authored interpretation

Vue action component with dynamic root tag and default slot. createBaseButton is independently callable through the same public entry, so is documented as a public surface of this owning record rather than hidden as an internal part. buttonStyleModule and computed rendering helpers remain internal ownership.

## Framework surface

@ultimate/vue/button exports UButton (default SFC alias) and createBaseButton. The factory declares label, icon, iconPos, iconClass, badge, badgeClass, badgeSeverity, loading, loadingIcon, as, asChild, link, severity, raised, rounded, text, outlined, size, variant, plain, fluid, ariaLabel, tooltip and tooltipOptions. The SFC uses a dynamic component root, default slot, ripple and tooltip directives, computed rootAttrs and inherited base props; asChild switches to a slot-only branch. These are not forced into the Angular or React contracts.

## Public exports

@ultimate/vue/button#UButton
@ultimate/vue/button#createBaseButton

## Owned source and evidence

packages/vue/src/button/index.ts
packages/vue/src/button/Button.vue
packages/vue/src/button/base-button.ts
packages/vue/src/button/button-style.ts

packages/vue/src/button/base-button.ts: export function createBaseButton()
packages/vue/src/button/Button.vue: extends: createBaseButton()
packages/vue/src/button/Button.vue: v-if="!asChild"
packages/vue/src/button/button.spec.ts: UButton

## Relationships

shared.button-style
vue.core (pending cross-batch)
vue.ripple (pending cross-batch)
vue.tooltip (pending cross-batch)
metadata.button (pending cross-batch)
themes.button (pending cross-batch)

## Verification

[
{
"state": "implemented",
"behavior": "Base props factory and dynamic-root SFC are source-present."
},
{
"state": "not-run",
"behavior": "Vue button behavioral suite has not been executed for this pilot."
}
]
