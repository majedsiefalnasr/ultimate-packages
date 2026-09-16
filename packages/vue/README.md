# @ultimate/vue

Ultimate Platform Vue components. See `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` for the current component inventory.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Components

- `UButton` — boolean-modifier prop set (`severity`/`raised`/`rounded`/`text`/`outlined`/`size`), matching a three-way convergent pattern independently confirmed across Angular/React/Vue's real upstream sources. `v-ripple` applied to root (unlike React's `UButton`, which has none — Vue's real Button wires it directly, verified). `tooltip`/`tooltipOptions` prop sugar over `v-tooltip`.
- `UCheckbox` — supports both controlled (`modelValue` v-model) and uncontrolled (`defaultValue`) modes, `indeterminate`, and `binary`/array-membership mode — a materially broader contract than React's `UCheckbox` (ADR-038), since Vue's own verified upstream reference genuinely supports all of this and PrimeReact's does not. `@primevue/forms` integration excluded (ADR-039).
- `UDialog` — `v-model:visible` controlled contract (Vue's own idiomatic mechanism, diverging intentionally from Angular's/React's own controlled-prop conventions). Composes `Portal` + `v-focustrap` + native `<transition>` + shared Escape adapter + z-index + scroll-lock. Excludes draggable/maximizable despite verified upstream support (ADR-040); resizable was never a PrimeVue Dialog feature at all.
- `UMenu` — `aria-activedescendant` virtual focus (converges with React, diverges from Angular). Escape handling is Menu's own **local** `keydown` handler, intentionally NOT routed through the shared Escape-priority mechanism `UDialog` uses (ADR-037) — a real, evidence-backed architectural distinction, not an inconsistency.
- `v-tooltip` — a Vue custom directive, not a wrapper component (matching React's ref-target-component concept translated to Vue's directive-on-element binding). Adds `aria-describedby` on the target while visible (intentional accessibility deviation over verified upstream). Two-mode content-injection contract: safe `createTextNode` default, explicit opt-in-only raw-HTML escape hatch (ADR-041).
- `v-ripple` — a standalone directive primitive (matching Angular's `URipple` precedent), wired into `UButton`/`UDialog`.

## Usage

```vue
<template>
  <UButton label="Save" severity="success" @click="onSave" />
  <UCheckbox v-model="agreed" binary />
  <div v-tooltip="'Save your changes'">Hover me</div>
</template>

<script>
import { UButton, UCheckbox } from "@ultimate/vue";
import { tooltipDirective } from "@ultimate/vue/tooltip";

export default {
  components: { UButton, UCheckbox },
  directives: { tooltip: tooltipDirective },
  data: () => ({ agreed: false }),
  methods: { onSave() {} },
};
</script>
```

## Intentional deviations (spec §32)

See `packages/vue-core/README.md`'s deviation list for foundation-tier deviations (base architecture, directives, Escape, scroll-lock, passthrough, forms). Component-level deviations:

- **UDialog** — excludes draggable/maximizable (ADR-040).
- **UMenu** — local Escape handler, not the shared adapter (ADR-037).
- **v-tooltip** — adds `aria-describedby`, two-mode content-injection contract (ADR-041).
- **UCheckbox** — broader contract than React's (controlled+uncontrolled, indeterminate, binary modes) (ADR-038).

## Dependencies

Depends on `@ultimate/vue-core`, `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-motion`, and `@ultimate/uix-styles` (workspace). Peers on `vue` (`^3.5.0`).
