# Vue USteps

ID: vue.steps

Framework: vue; availability: public

## Authored interpretation

Model-driven step navigation.

## Framework surface

USteps is model-driven fixed nav/ol markup, without slots. createBaseSteps declares model (readonly unknown[], default []), readonly (true), activeStep (0). Model fields used are label, url, visible, disabled and command; there is no exported model interface. d_activeStep mirrors the prop and click never mutates it: consumers own selection. Enabled non-readonly clicks emit select {originalEvent, item, index}, then invoke item.command with the same payload; readonly or disabled clicks are blocked. Numbers use original model indices even for hidden items. ArrowRight/Left, Home and End move focus among eligible visible links without wrapping; aria-current marks the active item. stepsStyleModule is source-only local CSS/classes. Factories return Options API components extending createBaseComponent, which registers component styles on mount. No Prime parity judgment is implied.

## Public exports

@ultimate/vue#USteps
@ultimate/vue/steps#USteps
@ultimate/vue#createBaseSteps
@ultimate/vue/steps#createBaseSteps

## Owned source and evidence

packages/vue/src/steps/BaseSteps.ts
packages/vue/src/steps/Steps.vue
packages/vue/src/steps/index.ts
packages/vue/src/steps/steps-style.ts

```text
packages/vue/src/steps/index.ts: USteps
packages/vue/src/steps/Steps.vue: if (item.command) item.command
packages/vue/src/steps/Steps.vue: case "ArrowRight"
packages/vue/src/index.ts: export * from "./steps";
.github/workflows/ci.yml: run: pnpm run test
packages/themes/src/presets/aura/index.ts:     steps,
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule);
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The documented public entries and family implementation are source-present."
  },
  {
    "state": "verified",
    "behavior": "The scoped existing Vue product suite passed locally.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/accordion/ src/tabs/ src/stepper/ src/steps/ --config /var/folders/vt/w58l5fv17nz9s5ybrbgpkgh80000gn/T/ultimate-vue130-4eWj6F/vitest.config.mjs --maxWorkers=1 --minWorkers=1",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "outcome": "passed",
    "limitations": "Local jsdom unit tests only with built workspace prerequisites and a temporary PostCSS override; not browser, accessibility, visual, published-package or remote CI verification.",
    "output": "Vitest 2.1.9: 4 files passed, 63 tests passed (accordion 9, tabs 17, stepper 21, steps 16).",
    "run": "docs/inventory/vue-disclosure-steps/product-run.json"
  },
  {
    "state": "ci-enforced",
    "behavior": "Existing CI conditionally runs the root product test script for non-docs changes; no remote run or branch protection was observed. Inventory tests are not part of test:scripts.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on non-docs scope and !cancelled(); no remote run or branch protection observed."
  }
]
```
